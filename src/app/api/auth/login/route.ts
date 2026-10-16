/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, loginInputSchema } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

		// 1. Rate Limiting Check (5 requests / 1 min for auth)
		const rateLimit = await checkRateLimit(ip, "auth");
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many login attempts. Please try again later." },
				{
					status: 429,
					headers: {
						"X-RateLimit-Limit": rateLimit.limit.toString(),
						"X-RateLimit-Remaining": rateLimit.remaining.toString(),
						"X-RateLimit-Reset": rateLimit.reset.toString(),
					},
				},
			);
		}

		// 2. Parse & Validate Payload
		const body = await request.json();
		const validation = loginInputSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validation.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { email, password } = validation.data;

		// 3. Lookup user in database
		const user = await db.query.users.findFirst({
			where: eq(users.email, email.toLowerCase()),
		});

		if (!user || !user.passwordHash) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 },
			);
		}

		// 4. Verify Password Hash
		const isValidPassword = await verifyPassword(password, user.passwordHash);
		if (!isValidPassword) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 },
			);
		}

		// 5. Create Active Session & Set Cookie
		await createSession(user.id);

		return NextResponse.json(
			{
				message: "Login successful",
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
			},
			{
				status: 200,
				headers: {
					"X-RateLimit-Limit": rateLimit.limit.toString(),
					"X-RateLimit-Remaining": rateLimit.remaining.toString(),
					"X-RateLimit-Reset": rateLimit.reset.toString(),
				},
			},
		);
	} catch (error: unknown) {
		console.error("[LOGIN_ERROR]", error);
		const err = error as { code?: string; message?: string } | null;
		const isDbError =
			err?.code === "CONNECT_TIMEOUT" ||
			err?.code === "ECONNREFUSED" ||
			err?.message?.includes("CONNECT_TIMEOUT") ||
			err?.message?.includes("DATABASE_URL");

		if (isDbError) {
			return NextResponse.json(
				{ error: "Database connection unavailable. Please check your DATABASE_URL configuration in .env." },
				{ status: 503 },
			);
		}

		return NextResponse.json(
			{ error: "An unexpected error occurred during login." },
			{ status: 500 },
		);
	}
}
