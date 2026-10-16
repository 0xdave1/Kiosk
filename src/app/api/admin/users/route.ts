/** @format */

import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users - Returns all user accounts and their associated workspaces
 */
export async function GET() {
	try {
		const adminUser = await getAuthenticatedAdmin();
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
		}

		const allUsers = await db.query.users.findMany({
			orderBy: [desc(users.createdAt)],
		});

		const allTenants = await db.query.tenants.findMany();

		const usersWithTenants = allUsers.map((u) => {
			const userTenants = allTenants.filter((t) => t.ownerId === u.id);
			return {
				id: u.id,
				name: u.name,
				email: u.email,
				image: u.image,
				phone: u.phone,
				role: u.role,
				createdAt: u.createdAt,
				tenants: userTenants.map((t) => ({
					id: t.id,
					name: t.name,
					slug: t.slug,
					plan: t.plan,
					billingStatus: t.billingStatus,
				})),
			};
		});

		return NextResponse.json({ users: usersWithTenants });
	} catch (error) {
		Logger.error("Failed to fetch users directory", error);
		return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
	}
}

/**
 * PATCH /api/admin/users - Update user role
 */
export async function PATCH(request: Request) {
	try {
		const adminUser = await getAuthenticatedAdmin();
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
		}

		const body = await request.json();
		const { userId, role } = body;

		if (!userId || !role) {
			return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
		}

		await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

		return NextResponse.json({ success: true, message: `User role updated to ${role}` });
	} catch (error) {
		Logger.error("Failed to update user role", error);
		return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
	}
}
