/** @format */

import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";
import { db } from "@/db";
import { CURRENCIES } from "@/lib/currency";
import { Logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats - High-level metrics for admin operations dashboard
 */
export async function GET() {
	try {
		const adminUser = await getAuthenticatedAdmin();
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
		}

		// 1. Total Submissions & Status Breakdown
		const allProjects = await db.query.projects.findMany();
		const inReviewCount = allProjects.filter((p) => p.status === "In Review").length;
		const inProgressCount = allProjects.filter((p) => p.status === "In Progress").length;
		const liveCount = allProjects.filter((p) => p.status === "Live" || p.status === "Published").length;
		const draftCount = allProjects.filter((p) => p.status === "Draft").length;

		// 2. Users & Tenants Count
		const allUsers = await db.query.users.findMany();
		const allTenants = await db.query.tenants.findMany();

		// 3. Revenue Metrics from Invoices (Normalized to USD)
		const allInvoices = await db.query.invoices.findMany();
		const paidInvoices = allInvoices.filter((inv) => inv.status === "PAID");
		const totalRevenue = paidInvoices.reduce((acc, curr) => {
			const currencyKey = curr.currency?.toUpperCase() || "USD";
			const rate = CURRENCIES[currencyKey]?.rateFromUSD || 1;
			const usdVal = (curr.amount || 0) / rate;
			return acc + Math.round(usdVal);
		}, 0);
		const pendingInvoices = allInvoices.filter((inv) => inv.status === "PENDING").length;

		return NextResponse.json({
			stats: {
				totalProjects: allProjects.length,
				inReviewCount,
				inProgressCount,
				liveCount,
				draftCount,
				totalUsers: allUsers.length,
				totalTenants: allTenants.length,
				totalRevenue,
				paidInvoicesCount: paidInvoices.length,
				pendingInvoicesCount: pendingInvoices,
			},
		});
	} catch (error) {
		Logger.error("Failed to fetch admin stats", error);
		return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
	}
}
