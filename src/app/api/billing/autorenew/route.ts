/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/autorenew
 * Toggles recurring automatic debit renewal for the authenticated tenant.
 */
export async function POST(request: Request) {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json().catch(() => ({}));
		const { enabled } = body;

		if (typeof enabled !== "boolean") {
			return NextResponse.json({ error: "Invalid payload: 'enabled' boolean expected" }, { status: 400 });
		}

		if (enabled && !tenant.recurringAuthCode) {
			return NextResponse.json(
				{
					error:
						"No reusable card is on file. Please pay your next renewal using Card to enable automated recurring billing.",
				},
				{ status: 400 },
			);
		}

		const now = new Date();

		// Update tenant
		await db
			.update(tenants)
			.set({
				autoRenew: enabled,
				updatedAt: now,
			})
			.where(eq(tenants.id, tenant.id));

		// Update active subscription
		await db
			.update(subscriptions)
			.set({
				autoRenew: enabled,
				updatedAt: now,
			})
			.where(eq(subscriptions.tenantId, tenant.id));

		return NextResponse.json({
			success: true,
			autoRenew: enabled,
			message: enabled
				? "Automated recurring renewal is enabled."
				: "Automated recurring renewal disabled. Please note: your plan will terminate at the end of the 1-month period unless renewed.",
		});
	} catch (err) {
		console.error("[TOGGLE_AUTORENEW_ERROR]", err);
		return NextResponse.json({ error: "Failed to update recurring payment settings" }, { status: 500 });
	}
}
