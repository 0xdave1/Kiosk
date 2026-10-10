/**
 * Scheduled Invoicing & Grace Period Automation Engine
 *
 * Runs on cron schedule / Inngest event:
 * 1. Checks and processes automated recurring payment debits for active subscribers
 * 2. Generates fresh renewal invoices for non-recurring accounts (3 days prior)
 * 3. Manages 7-day grace periods with automated email reminder flows
 * 4. Terminates plan and suspends websites at the end of the 1-month subscription period if recurring payment is not set or unpaid
 *
 * @module inngest/functions/billingScheduler
 * @format
 */

import { db } from "@/db";
import { tenants, users, invoices, subscriptions, projects } from "@/db/schema";
import { eq, and, lte, gt, or, inArray } from "drizzle-orm";
import { initializePaystackPayment, chargePaystackAuthorization } from "@/lib/payments/paystack";
import { BASE_PRICES_USD, PlanKey } from "@/lib/currency";
import {
	sendPaymentRequestEmail,
	sendGracePeriodReminderEmail,
	sendSiteFlaggedNoticeEmail,
	sendRecurringPaymentSuccessEmail,
	sendRecurringPaymentFailedEmail,
	sendPlanTerminatedNoticeEmail,
	sendRecurringSetupReminderEmail,
} from "@/lib/email";
import { Logger } from "@/lib/logger";

const PLAN_MAP: Record<string, PlanKey> = {
	LANDING_PAGE: "landing",
	SALES_FUNNEL: "funnel",
	E_COMMERCE: "store",
};

export async function processScheduledBillingJob() {
	Logger.info("Starting scheduled billing & subscription renewal engine");
	const now = new Date();
	const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kioosk.online";

	const results = {
		recurringRenewalsProcessed: 0,
		recurringRenewalsFailed: 0,
		invoicesGenerated: 0,
		remindersDispatched: 0,
		plansTerminated: 0,
	};

	try {
		// =========================================================================
		// 1. AUTOMATED RECURRING PAYMENT EXECUTION (For Subscribers With Card On File)
		// =========================================================================
		const dueRecurringTenants = await db.query.tenants.findMany({
			where: and(
				lte(tenants.currentPeriodEnd, now),
				gt(tenants.currentPeriodEnd, new Date(0)),
				eq(tenants.autoRenew, true),
			),
		});

		for (const tenant of dueRecurringTenants) {
			if (tenant.plan === "NONE" || !tenant.recurringAuthCode) continue;

			const owner = await db.query.users.findFirst({
				where: eq(users.id, tenant.ownerId),
			});
			if (!owner || !owner.email) continue;

			const sub = await db.query.subscriptions.findFirst({
				where: eq(subscriptions.tenantId, tenant.id),
			});

			const billingCycle = (sub?.billingCycle || "monthly") as "monthly" | "yearly";
			const planKey = PLAN_MAP[tenant.plan] || "landing";
			const amount = BASE_PRICES_USD[planKey][billingCycle];
			const currency = "USD";
			const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
			const tx_ref = `kiosk_rec_${crypto.randomUUID()}`;

			// Attempt automated recurring debit via Paystack
			const chargeResult = await chargePaystackAuthorization({
				authorization_code: tenant.recurringAuthCode,
				email: owner.email,
				amount,
				currency,
				reference: tx_ref,
				metadata: {
					userId: owner.id,
					tenantId: tenant.id,
					invoiceNumber,
					plan: tenant.plan,
					billingCycle,
					type: "RECURRING_HOSTING",
				},
			});

			if (chargeResult.success) {
				// Extend subscription by 1 month (30 days) or 1 year
				const durationDays = billingCycle === "yearly" ? 365 : 30;
				const newPeriodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
				const newGraceEnd = new Date(newPeriodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

				await db
					.update(tenants)
					.set({
						billingStatus: "ACTIVE",
						currentPeriodEnd: newPeriodEnd,
						gracePeriodEnd: newGraceEnd,
						updatedAt: now,
					})
					.where(eq(tenants.id, tenant.id));

				if (sub) {
					await db
						.update(subscriptions)
						.set({
							status: "active",
							currentPeriodStart: now,
							currentPeriodEnd: newPeriodEnd,
							updatedAt: now,
						})
						.where(eq(subscriptions.id, sub.id));
				}

				// Record paid invoice
				await db.insert(invoices).values({
					invoiceNumber,
					tenantId: tenant.id,
					userId: owner.id,
					plan: tenant.plan,
					billingCycle,
					type: "RECURRING_HOSTING",
					amount,
					currency,
					status: "PAID",
					paymentMethod: "card",
					txRef: tx_ref,
					dueDate: now,
					gracePeriodEnd: newGraceEnd,
					paidAt: now,
				});

				// Dispatch confirmation email
				await sendRecurringPaymentSuccessEmail({
					toEmail: owner.email,
					userName: owner.name || "Subscriber",
					plan: tenant.plan.replace(/_/g, " "),
					amount,
					currency,
					cardLast4: tenant.cardLast4 || undefined,
					nextBillingDate: newPeriodEnd.toLocaleDateString(),
				});

				results.recurringRenewalsProcessed++;
			} else {
				// Debit failed (card declined/expired). Move autoRenew to false and alert subscriber
				results.recurringRenewalsFailed++;
				Logger.warn(`Recurring charge failed for tenant ${tenant.id}: ${chargeResult.error}`);

				const graceEnd = tenant.gracePeriodEnd || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

				// Generate fallback payment link
				const paymentResult = await initializePaystackPayment({
					amount,
					currency,
					email: owner.email,
					name: owner.name || "Kiosk Subscriber",
					reference: tx_ref,
					callback_url: `${appUrl}/dashboard/billing?payment=success&invoice=${invoiceNumber}`,
					metadata: {
						userId: owner.id,
						tenantId: tenant.id,
						invoiceNumber,
						plan: tenant.plan,
						billingCycle,
						type: "RECURRING_HOSTING",
					},
				});

				const link = paymentResult.link || `${appUrl}/dashboard/billing`;

				// Insert pending invoice
				await db.insert(invoices).values({
					invoiceNumber,
					tenantId: tenant.id,
					userId: owner.id,
					plan: tenant.plan,
					billingCycle,
					type: "RECURRING_HOSTING",
					amount,
					currency,
					status: "PENDING",
					paymentLink: link,
					txRef: tx_ref,
					dueDate: now,
					gracePeriodEnd: graceEnd,
				});

				// Update tenant status to GRACE_PERIOD & flag recurring card
				await db
					.update(tenants)
					.set({
						billingStatus: "GRACE_PERIOD",
						autoRenew: false, // Turn off auto-renew until customer updates card
						updatedAt: now,
					})
					.where(eq(tenants.id, tenant.id));

				await sendRecurringPaymentFailedEmail({
					toEmail: owner.email,
					userName: owner.name || "Subscriber",
					plan: tenant.plan.replace(/_/g, " "),
					amount,
					currency,
					cardLast4: tenant.cardLast4 || undefined,
					paymentLink: link,
					dueDate: graceEnd.toLocaleDateString(),
				});
			}
		}

		// =========================================================================
		// 2. GENERATE RENEWAL INVOICES FOR NON-RECURRING ACCOUNTS (3 Days Prior)
		// =========================================================================
		const upcomingTenants = await db.query.tenants.findMany({
			where: and(
				lte(tenants.currentPeriodEnd, threeDaysFromNow),
				gt(tenants.currentPeriodEnd, new Date(0)),
				eq(tenants.autoRenew, false),
			),
		});

		for (const tenant of upcomingTenants) {
			if (tenant.plan === "NONE") continue;

			// Check if an invoice is already pending or active for this upcoming period
			const existingInvoice = await db.query.invoices.findFirst({
				where: and(
					eq(invoices.tenantId, tenant.id),
					or(
						eq(invoices.status, "PENDING"),
						eq(invoices.status, "GRACE_PERIOD"),
						gt(invoices.createdAt, new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
					),
				),
			});

			if (existingInvoice) continue;

			const owner = await db.query.users.findFirst({
				where: eq(users.id, tenant.ownerId),
			});

			if (!owner || !owner.email) continue;

			const sub = await db.query.subscriptions.findFirst({
				where: eq(subscriptions.tenantId, tenant.id),
			});

			const billingCycle = (sub?.billingCycle || "monthly") as "monthly" | "yearly";
			const planKey = PLAN_MAP[tenant.plan] || "landing";
			const amount = BASE_PRICES_USD[planKey][billingCycle];
			const currency = "USD";

			const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
			const tx_ref = `kiosk_inv_${crypto.randomUUID()}`;
			const dueDate = tenant.currentPeriodEnd || now;
			const gracePeriodEnd = new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

			const paymentResult = await initializePaystackPayment({
				amount,
				currency,
				email: owner.email,
				name: owner.name || "Kiosk Subscriber",
				reference: tx_ref,
				callback_url: `${appUrl}/dashboard/billing?payment=success&invoice=${invoiceNumber}`,
				metadata: {
					userId: owner.id,
					tenantId: tenant.id,
					invoiceNumber,
					plan: tenant.plan,
					billingCycle,
					type: "RECURRING_HOSTING",
				},
			});

			if (!paymentResult.success || !paymentResult.link) {
				console.error("[SCHEDULED_INVOICE_INIT_FAILED]", paymentResult.error);
				continue;
			}

			// Insert Invoice
			await db.insert(invoices).values({
				invoiceNumber,
				tenantId: tenant.id,
				userId: owner.id,
				plan: tenant.plan,
				billingCycle,
				type: "RECURRING_HOSTING",
				amount,
				currency,
				status: "PENDING",
				paymentLink: paymentResult.link,
				txRef: tx_ref,
				dueDate,
				gracePeriodEnd,
			});

			// Dispatch setup reminder warning that recurring payment is not set and plan will terminate
			await sendRecurringSetupReminderEmail({
				toEmail: owner.email,
				userName: owner.name || "Subscriber",
				plan: tenant.plan.replace(/_/g, " "),
				expiryDate: dueDate.toLocaleDateString(),
				paymentLink: paymentResult.link,
			});

			results.invoicesGenerated++;
		}

		// =========================================================================
		// 3. OVERDUE INVOICES -> ENTER GRACE PERIOD & DISPATCH REMINDERS
		// =========================================================================
		const pendingOverdueInvoices = await db.query.invoices.findMany({
			where: and(
				eq(invoices.status, "PENDING"),
				lte(invoices.dueDate, now),
				gt(invoices.gracePeriodEnd, now),
			),
		});

		for (const inv of pendingOverdueInvoices) {
			await db
				.update(invoices)
				.set({ status: "GRACE_PERIOD", updatedAt: now })
				.where(eq(invoices.id, inv.id));

			await db
				.update(tenants)
				.set({ billingStatus: "GRACE_PERIOD", updatedAt: now })
				.where(eq(tenants.id, inv.tenantId));

			const owner = await db.query.users.findFirst({
				where: eq(users.id, inv.userId),
			});

			if (owner?.email && inv.paymentLink) {
				const daysRemaining = Math.max(
					1,
					Math.ceil((new Date(inv.gracePeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
				);

				await sendGracePeriodReminderEmail({
					toEmail: owner.email,
					userName: owner.name || "Subscriber",
					invoiceNumber: inv.invoiceNumber,
					plan: inv.plan.replace(/_/g, " "),
					amount: inv.amount,
					currency: inv.currency,
					daysRemaining,
					paymentLink: inv.paymentLink,
				});

				await db
					.update(invoices)
					.set({ remindersSent: inv.remindersSent + 1, updatedAt: now })
					.where(eq(invoices.id, inv.id));

				results.remindersDispatched++;
			}
		}

		// =========================================================================
		// 4. TERMINATE PLAN AT END OF 1-MONTH PERIOD IF RECURRING PAYMENT NOT SET / UNPAID
		// =========================================================================
		// Identify tenants whose subscription period + grace period has expired without payment
		const expiredTenants = await db.query.tenants.findMany({
			where: and(
				lte(tenants.currentPeriodEnd, now),
				gt(tenants.currentPeriodEnd, new Date(0)),
				or(
					// Case A: Recurring payment not set and grace period ended (or no grace period set)
					and(eq(tenants.autoRenew, false), lte(tenants.gracePeriodEnd, now)),
					// Case B: Recurring payment not set and period ended without grace
					and(eq(tenants.autoRenew, false), eq(tenants.billingStatus, "PAST_DUE")),
					// Case C: Billing status already marked PAST_DUE or GRACE_PERIOD and grace expired
					and(inArray(tenants.billingStatus, ["GRACE_PERIOD", "PAST_DUE"]), lte(tenants.gracePeriodEnd, now)),
				),
			),
		});

		for (const tenant of expiredTenants) {
			if (tenant.plan === "NONE") continue;

			const currentPlan = tenant.plan;

			// 1. Terminate tenant plan and suspend website
			await db
				.update(tenants)
				.set({
					plan: "NONE",
					billingStatus: "SUSPENDED",
					autoRenew: false,
					recurringAuthCode: null,
					updatedAt: now,
				})
				.where(eq(tenants.id, tenant.id));

			// 2. Mark subscription as canceled
			await db
				.update(subscriptions)
				.set({
					status: "canceled",
					autoRenew: false,
					updatedAt: now,
				})
				.where(eq(subscriptions.tenantId, tenant.id));

			// 3. Mark all live/published projects under tenant as Suspended
			await db
				.update(projects)
				.set({
					status: "Suspended",
					updatedAt: now,
				})
				.where(and(eq(projects.tenantId, tenant.id), inArray(projects.status, ["Live", "Published"])));

			// 4. Mark pending invoices as PAST_DUE
			await db
				.update(invoices)
				.set({ status: "PAST_DUE", updatedAt: now })
				.where(and(eq(invoices.tenantId, tenant.id), inArray(invoices.status, ["PENDING", "GRACE_PERIOD"])));

			// 5. Notify tenant owner of plan termination
			const owner = await db.query.users.findFirst({
				where: eq(users.id, tenant.ownerId),
			});

			if (owner?.email) {
				await sendPlanTerminatedNoticeEmail({
					toEmail: owner.email,
					userName: owner.name || "Subscriber",
					plan: currentPlan.replace(/_/g, " "),
					reactivationLink: `${appUrl}/dashboard/billing`,
				});
			}

			results.plansTerminated++;
			Logger.info(`Terminated plan for tenant ${tenant.id} (${currentPlan}) due to expired 1-month period without recurring payment`);
		}

		Logger.info("Scheduled billing engine job completed successfully", results);
		return { success: true, ...results };
	} catch (err) {
		Logger.error("Failed during scheduled billing job execution", err);
		return { success: false, error: "Scheduled billing job failed" };
	}
}
