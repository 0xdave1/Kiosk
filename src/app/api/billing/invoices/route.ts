/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/invoices - Fetches tenant billing status, pending invoices, and invoice history
 */
export async function GET() {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch all invoices for tenant ordered by creation date
		const rawInvoices = await db.query.invoices.findMany({
			where: eq(invoices.tenantId, tenant.id),
			orderBy: [desc(invoices.createdAt)],
		});

		// Sanitize legacy payment links
		const tenantInvoices = rawInvoices.map((inv) => {
			let link = inv.paymentLink;
			if (link && (link.includes("paystack.com") || link.includes("flutterwave.com"))) {
				const planKey =
					(inv.plan || "LANDING_PAGE").toLowerCase().includes("store") ||
					(inv.plan || "").toLowerCase().includes("commerce")
						? "store"
						: (inv.plan || "").toLowerCase().includes("funnel")
						? "funnel"
						: "landing";
				link = `/checkout?plan=${planKey}&billing=${inv.billingCycle || "monthly"}&invoice=${inv.invoiceNumber}`;
			}
			return {
				...inv,
				paymentLink: link,
			};
		});

		// Identify pending or grace period invoice
		const pendingInvoice = tenantInvoices.find(
			(inv) => inv.status === "PENDING" || inv.status === "GRACE_PERIOD" || inv.status === "PAST_DUE",
		) || null;

		return NextResponse.json({
			tenant: {
				id: tenant.id,
				name: tenant.name,
				plan: tenant.plan,
				billingStatus: tenant.billingStatus || "ACTIVE",
				autoRenew: tenant.autoRenew || false,
				cardLast4: tenant.cardLast4 || null,
				cardBrand: tenant.cardBrand || null,
				cardExpMonth: tenant.cardExpMonth || null,
				cardExpYear: tenant.cardExpYear || null,
				currentPeriodEnd: tenant.currentPeriodEnd,
				gracePeriodEnd: tenant.gracePeriodEnd,
			},
			pendingInvoice,
			invoices: tenantInvoices,
		});
	} catch (err) {
		console.error("[GET_INVOICES_ERROR]", err);
		return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
	}
}
