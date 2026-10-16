import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		// 1. Check custom database session
		const customUser = await getAuthenticatedUser();
		if (customUser) {
			// Refresh user from DB to ensure freshest role & plan
			const freshUser = await db.query.users.findFirst({
				where: eq(users.id, customUser.id),
			});

			return NextResponse.json(
				{
					authenticated: true,
					user: freshUser || customUser,
				},
				{ status: 200 },
			);
		}

		// 2. Fallback to Auth.js session (Google OAuth)
		const authSession = await auth();
		if (authSession?.user) {
			const userEmail = authSession.user.email?.toLowerCase().trim();
			const dbUser = userEmail
				? await db.query.users.findFirst({
						where: eq(users.email, userEmail),
				  })
				: authSession.user.id
				? await db.query.users.findFirst({
						where: eq(users.id, authSession.user.id),
				  })
				: null;

			return NextResponse.json(
				{
					authenticated: true,
					user: {
						id: dbUser?.id || authSession.user.id,
						name: dbUser?.name || authSession.user.name || null,
						email: dbUser?.email || authSession.user.email || "",
						image: dbUser?.image || authSession.user.image || null,
						phone: dbUser?.phone || null,
						role: dbUser?.role || (authSession.user as { role?: string }).role || "USER",
					},
				},
				{ status: 200 },
			);
		}

		return NextResponse.json(
			{ authenticated: false, user: null },
			{ status: 401 },
		);
	} catch (error) {
		console.error("[ME_ERROR]", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 },
		);
	}
}
