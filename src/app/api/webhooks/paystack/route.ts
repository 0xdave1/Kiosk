/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, subscriptions, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/lib/ratelimit";
import {
	verifyPaystackWebhookSignature,
	verifyPaystackTransaction,
} from "@/lib/payments/paystack";
import { processPdfInvoiceJob } from "@/inngest/functions/pdfInvoice";

/**
 * POST /api/webhooks/paystack
 *
 * Processes asynchronous Paystack webhook events with strict security:
 *  1. Validates HMAC-SHA512 `x-paystack-signature` against PAYSTACK_SECRET_KEY
 *  2. Deduplicates events via Redis cache using transaction reference
 *  3. Server-to-server verification check against Paystack verification API
 *  4. Reconciles invoices, activates tenant workspaces, and logs subscriptions
 *  5. Asynchronously triggers PDF receipt email generation
 *
 * Primary event handled: `charge.success`
 */
interface PaymentMetadata {
	userId?: string;
	tenantId?: string;
	plan?: string;
	billingCycle?: string;
	invoiceNumber?: string;
	custom_fields?: Array<{
		display_name?: string;
		variable_name?: string;
		value?: string;
	}>;
	[key: string]: unknown;
}

interface PaystackWebhookEvent {
	event?: string;
	data?: {
		id?: string | number;
		reference?: string;
		status?: string;
		amount?: number;
		currency?: string;
		channel?: string;
		authorization?: {
			authorization_code?: string;
			bin?: string;
			last4?: string;
			exp_month?: string;
			exp_year?: string;
			channel?: string;
			card_type?: string;
			bank?: string;
			country_code?: string;
			brand?: string;
			reusable?: boolean;
			signature?: string;
		};
		customer?: {
			id?: string | number;
			customer_code?: string;
			email?: string;
			first_name?: string;
			name?: string;
		};
		metadata?: PaymentMetadata;
	};
}

export async function POST(request: Request) {
	try {
		const rawBody = await request.text();
		const signature = request.headers.get("x-paystack-signature") ?? "";

		// 1. Webhook Signature Verification
		if (!verifyPaystackWebhookSignature(signature, rawBody)) {
			console.warn("[PAYSTACK_WEBHOOK] Signature verification failed");
			return NextResponse.json(
				{ error: "Invalid Paystack webhook signature" },
				{ status: 401 },
			);
		}

		let body: PaystackWebhookEvent;
		try {
			body = JSON.parse(rawBody);
		} catch (parseErr) {
			console.error("[PAYSTACK_WEBHOOK] Failed to parse JSON body", parseErr);
			return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
		}

		const { event, data } = body;

		if (!data) {
			return NextResponse.json(
				{ message: "Ignored invalid webhook payload" },
				{ status: 400 },
			);
		}

		const reference: string = String(data.reference || data.id || "");
		if (!reference) {
			return NextResponse.json({ message: "Missing transaction reference" }, { status: 400 });
		}

		// 2. Webhook Event Deduplication via Upstash Redis
		if (reference && redis) {
			const eventKey = `@kiosk/webhook:paystack:${reference}`;
			const isDuplicate = await redis.get(eventKey);
			if (isDuplicate) {
				return NextResponse.json({ message: "Event already processed" }, { status: 200 });
			}
			await redis.set(eventKey, "PROCESSED", { ex: 86400 }); // 24 hours TTL
		}

		// 3. Process Successful Charge
		if (event === "charge.success" && data.status === "success") {
			// Direct verification with Paystack API
			const verifiedTx = await verifyPaystackTransaction(reference);

			if (!verifiedTx || verifiedTx.status !== "success") {
				console.error("[PAYSTACK_WEBHOOK] Transaction verification failed via Paystack API", reference);
				return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
			}

			const meta: PaymentMetadata = (data.metadata || verifiedTx.metadata || {}) as PaymentMetadata;
			const userId: string | undefined = meta.userId;
			const plan: string = meta.plan || "LANDING_PAGE";
			const billingCycle: string = meta.billingCycle || "monthly";
			const invoiceNumber: string | undefined = meta.invoiceNumber;
			const paymentMethod: string = (data.channel || verifiedTx.channel || "card").toLowerCase();

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
						paymentMethod,
						updatedAt: now,
					})
					.where(eq(invoices.id, matchedInvoice.id));
			}

			// 2. Locate tenant and activate subscription
			const tenantId = matchedInvoice?.tenantId || meta.tenantId;
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
				const auth = data.authorization || verifiedTx?.authorization;
				const isReusable = Boolean(auth?.reusable && auth?.authorization_code);

				await db
					.update(tenants)
					.set({
						plan,
						billingStatus: "ACTIVE",
						autoRenew: isReusable,
						recurringAuthCode: isReusable ? auth?.authorization_code : null,
						cardLast4: auth?.last4 || null,
						cardBrand: auth?.brand || auth?.card_type || null,
						cardExpMonth: auth?.exp_month || null,
						cardExpYear: auth?.exp_year || null,
						currentPeriodEnd: newPeriodEnd,
						gracePeriodEnd: newGraceEnd,
						updatedAt: now,
					})
					.where(eq(tenants.id, tenant.id));

				// Record Subscription history if not already recorded
				const subId = `paystack_${reference}`;
				const existingSub = await db.query.subscriptions.findFirst({
					where: eq(subscriptions.subscriptionId, subId),
				});

				if (!existingSub) {
					await db.insert(subscriptions).values({
						tenantId: tenant.id,
						gateway: "paystack",
						customerId: String(data.customer?.customer_code || data.customer?.id || userId || tenant.ownerId),
						subscriptionId: subId,
						planId: plan.toLowerCase().replace(/_/g, "-"),
						billingCycle,
						status: "active",
						autoRenew: isReusable,
						authCode: isReusable ? auth?.authorization_code : null,
						cardLast4: auth?.last4 || null,
						cardBrand: auth?.brand || auth?.card_type || null,
						cardExpMonth: auth?.exp_month || null,
						cardExpYear: auth?.exp_year || null,
						currentPeriodStart: now,
						currentPeriodEnd: newPeriodEnd,
					});
				} else {
					await db
						.update(subscriptions)
						.set({
							status: "active",
							autoRenew: isReusable,
							authCode: isReusable ? auth?.authorization_code : null,
							cardLast4: auth?.last4 || null,
							cardBrand: auth?.brand || auth?.card_type || null,
							cardExpMonth: auth?.exp_month || null,
							cardExpYear: auth?.exp_year || null,
							currentPeriodStart: now,
							currentPeriodEnd: newPeriodEnd,
							updatedAt: now,
						})
						.where(eq(subscriptions.id, existingSub.id));
				}

				console.log(
					`[PAYSTACK_WEBHOOK_SUCCESS] Reconciled invoice payment for tenant ${tenant.id} (${plan}, ${paymentMethod}, recurring=${isReusable}) via ref ${reference}`,
				);

				// 3. Dispatch Async PDF Receipt Email Job
				const recipientEmail = data.customer?.email || verifiedTx.customer?.email;
				const recipientName =
					meta.custom_fields?.[0]?.value ||
					data.customer?.first_name ||
					"Kiosk Subscriber";

				// Convert from lowest subunit back to major unit if needed for receipt
				const paidAmount = (data.amount || verifiedTx.amount || 0) / 100;

				if (recipientEmail) {
					processPdfInvoiceJob({
						transactionId: reference,
						tenantId: tenant.id,
						userEmail: recipientEmail,
						userName: recipientName,
						amount: paidAmount,
						currency: data.currency || verifiedTx.currency || "USD",
						plan,
					}).catch((err) => {
						console.error("[RECEIPT_JOB_ERROR]", err);
					});
				}
			}
		}

		// 4. Process Refund or Disabled Subscriptions
		if (event === "subscription.disable" || event === "charge.refunded") {
			const subId = `paystack_${reference}`;
			await db
				.update(subscriptions)
				.set({ status: "canceled", autoRenew: false, updatedAt: new Date() })
				.where(eq(subscriptions.subscriptionId, subId));

			const sub = await db.query.subscriptions.findFirst({
				where: eq(subscriptions.subscriptionId, subId),
			});
			if (sub) {
				await db
					.update(tenants)
					.set({ autoRenew: false, recurringAuthCode: null, updatedAt: new Date() })
					.where(eq(tenants.id, sub.tenantId));
			}

			console.log(`[PAYSTACK_WEBHOOK_CANCELED] Subscription ${subId} marked as canceled and autoRenew disabled`);
		}

		return NextResponse.json({ status: "success" }, { status: 200 });
	} catch (err) {
		console.error("[PAYSTACK_WEBHOOK_ERROR]", err);
		return NextResponse.json(
			{ error: "Internal webhook processing error" },
			{ status: 500 },
		);
	}
}
