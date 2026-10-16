/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens, sessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { resetPasswordSchema, hashPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

		// 1. Rate Limiting Check
		const rateLimit = await checkRateLimit(ip, "auth");
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many password reset attempts. Please try again later." },
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
		const validation = resetPasswordSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validation.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { token, email, password } = validation.data;
		const normalizedEmail = email.toLowerCase().trim();

		// 3. Find verification token record
		const tokenRecord = await db.query.verificationTokens.findFirst({
			where: and(
				eq(verificationTokens.identifier, normalizedEmail),
				eq(verificationTokens.token, token),
			),
		});

		if (!tokenRecord) {
			return NextResponse.json(
				{ error: "Invalid password reset link. Please request a new one." },
				{ status: 400 },
			);
		}

		// Check if token has expired
		if (new Date(tokenRecord.expires).getTime() < Date.now()) {
			// Purge expired token
			try {
				await db
					.delete(verificationTokens)
					.where(
						and(
							eq(verificationTokens.identifier, normalizedEmail),
							eq(verificationTokens.token, token),
						),
					);
			} catch {
				// Non-blocking
			}

			return NextResponse.json(
				{
					error:
						"This password reset link has expired. Please request a new one.",
				},
				{ status: 400 },
			);
		}

		// 4. Lookup user
		const user = await db.query.users.findFirst({
			where: eq(users.email, normalizedEmail),
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Account not found." },
				{ status: 404 },
			);
		}

		// 5. Hash new password and update user record
		const newPasswordHash = await hashPassword(password);

		await db
			.update(users)
			.set({
				passwordHash: newPasswordHash,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id));

		// 6. Delete used verification token
		await db
			.delete(verificationTokens)
			.where(
				and(
					eq(verificationTokens.identifier, normalizedEmail),
					eq(verificationTokens.token, token),
				),
			);

		// 7. Security: Revoke all existing sessions for this user
		try {
			await db.delete(sessions).where(eq(sessions.userId, user.id));
		} catch {
			// Non-blocking
		}

		return NextResponse.json(
			{
				message:
					"Your password has been successfully reset. You can now sign in.",
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
	} catch (error) {
		console.error("[RESET_PASSWORD_ERROR]", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred while resetting your password." },
			{ status: 500 },
		);
	}
}
