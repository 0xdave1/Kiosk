/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, subscriptions, invoices, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/ratelimit";
import { verifyBachsWebhookSignature } from "@/lib/payments/bachs";
import { processPdfInvoiceJob } from "@/inngest/functions/pdfInvoice";

/**
 * POST /api/webhooks/bachs
 *
 * Processes asynchronous Bachs.io webhook events safely:
 *  1. Reads raw body before JSON parsing (required for HMAC verification)
 *  2. Verifies X-Bachs-Signature using HMAC-SHA256 of "{timestamp}.{body}"
 *  3. Deduplicates events via Redis using the event `id`
 *  4. Reconciles invoices, activates tenant workspaces, and logs subscriptions
 *  5. Triggers async PDF invoice generation
 *
 * Primary event handled: `collection.succeeded`
 */
export async function POST(request: Request) {
	// 1. Read raw body before JSON parsing (critical for sig verification)
	const rawBody = await request.text();

	try {
		// 2. Signature Verification
		const timestamp = request.headers.get("x-bachs-timestamp") ?? "";
		const signature = request.headers.get("x-bachs-signature") ?? "";

		if (!verifyBachsWebhookSignature(rawBody, timestamp, signature)) {
			console.warn("[BACHS_WEBHOOK] Signature verification failed");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		const body = JSON.parse(rawBody);
		const { id: eventId, type: event, data } = body;

		if (!data) {
			return NextResponse.json(
				{ message: "Ignored invalid webhook payload" },
				{ status: 400 },
			);
		}

		// 3. Webhook Event Deduplication via Upstash Redis
		if (eventId && redis) {
			const eventKey = `@kiosk/webhook:bachs:${eventId}`;
			const isDuplicate = await redis.get(eventKey);
			if (isDuplicate) {
				return NextResponse.json({ message: "Event already processed" }, { status: 200 });
			}
			await redis.set(eventKey, "PROCESSED", { ex: 86400 }); // 24 hours
		}

		// 4. Process Charge Completion
		if (event === "collection.succeeded" && (!data.status || String(data.status).toUpperCase() === "SUCCEEDED")) {
			const checkoutId: string = data.checkout_id ?? "";
			const reference: string = String(data.reference || checkoutId);
			const userId: string | undefined = data.metadata?.userId || data.metadata?.tenantId;
			const plan: string = data.metadata?.plan || "LANDING_PAGE";
			const billingCycle: string = data.metadata?.billingCycle || "monthly";
			const invoiceNumber: string | undefined = data.metadata?.invoiceNumber;

			// 1. Reconcile matching invoice in database
			let matchedInvoice = null;
			if (reference) {
				matchedInvoice = await db.query.invoices.findFirst({
					where: eq(invoices.txRef, reference),
				});
			}

			if (!matchedInvoice && invoiceNumber) {
				matchedInvoice = await db.query.invoices.findFirst({
					where: eq(invoices.invoiceNumber, invoiceNumber),
				});
			}

			const now = new Date();
			const days = billingCycle === "yearly" ? 365 : 30;
			const newPeriodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
			const newGraceEnd = new Date(newPeriodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

			if (matchedInvoice) {
				await db
					.update(invoices)
					.set({
						status: "PAID",
						paidAt: now,
						paymentMethod: "bachs",
						updatedAt: now,
					})
					.where(eq(invoices.id, matchedInvoice.id));
			}

			// 2. Locate tenant and activate subscription
			const tenantId = matchedInvoice?.tenantId || data.metadata?.tenantId;
			let tenant = null;

			if (tenantId) {
				tenant = await db.query.tenants.findFirst({
					where: eq(tenants.id, tenantId),
				});
			} else if (userId) {
				tenant = await db.query.tenants.findFirst({
					where: eq(tenants.ownerId, userId),
				});
			}

			if (tenant) {
				await db
					.update(tenants)
					.set({
						plan,
						billingStatus: "ACTIVE",
						currentPeriodEnd: newPeriodEnd,
						gracePeriodEnd: newGraceEnd,
						updatedAt: now,
					})
					.where(eq(tenants.id, tenant.id));

				// Record Subscription
				const subId = `bachs_${checkoutId || reference}`;
				const existingSub = await db.query.subscriptions.findFirst({
					where: eq(subscriptions.subscriptionId, subId),
				});

				if (!existingSub) {
					await db.insert(subscriptions).values({
						tenantId: tenant.id,
						gateway: "bachs",
						customerId: String(data.customer_id || data.customer?.id || userId || tenant.ownerId),
						subscriptionId: subId,
						planId: plan.toLowerCase().replace(/_/g, "-"),
						billingCycle,
						status: "active",
						currentPeriodStart: now,
						currentPeriodEnd: newPeriodEnd,
					});
				} else {
					await db
						.update(subscriptions)
						.set({
							status: "active",
							currentPeriodStart: now,
							currentPeriodEnd: newPeriodEnd,
							updatedAt: now,
						})
						.where(eq(subscriptions.id, existingSub.id));
				}

				// Trigger Async PDF Invoice Job
				const owner = await db.query.users.findFirst({
					where: eq(users.id, tenant.ownerId),
				});

				if (owner?.email) {
					processPdfInvoiceJob({
						transactionId: reference,
						tenantId: tenant.id,
						userEmail: owner.email,
						userName: owner.name || "Subscriber",
						amount: matchedInvoice?.amount || Number(data.pricing?.amount) || 0,
						currency: matchedInvoice?.currency || String(data.pricing?.currency || "USD"),
						plan,
					}).catch((pdfErr) => {
						console.error("[BACHS_PDF_INVOICE_JOB_FAILED]", pdfErr);
					});
				}

				console.log(
					`[BACHS_WEBHOOK_SUCCESS] Upgraded tenant ${tenant.id} to plan: ${plan} via checkout ${checkoutId}`,
				);
			}
		}

		return NextResponse.json({ status: "success" }, { status: 200 });
	} catch (err) {
		console.error("[BACHS_WEBHOOK_ERROR]", err);
		return NextResponse.json(
			{ error: "Internal webhook processing error" },
			{ status: 500 },
		);
	}
}
