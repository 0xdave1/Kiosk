/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { forgotPasswordSchema } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/ratelimit";
import { sendPasswordResetEmail, getAppUrl } from "@/lib/email";

export async function POST(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

		// 1. Rate Limiting Check (5 requests / 1 min for auth)
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
		const validation = forgotPasswordSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validation.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const email = validation.data.email.toLowerCase().trim();

		// 3. Lookup user in database
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		// If user exists, generate reset token and dispatch email
		if (user) {
			const resetToken = crypto.randomUUID();
			const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

			// Clean up previous tokens for this email
			try {
				await db
					.delete(verificationTokens)
					.where(eq(verificationTokens.identifier, email));
			} catch (e) {
				// Non-blocking
			}

			// Store verification token
			await db.insert(verificationTokens).values({
				identifier: email,
				token: resetToken,
				expires,
			});

			// Build reset URL using dynamic origin or appUrl
			const reqHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
			const reqProto = request.headers.get("x-forwarded-proto") || (reqHost?.includes("localhost") ? "http" : "https");
			const detectedUrl = reqHost ? `${reqProto}://${reqHost}` : null;
			const appUrl = (process.env.NEXT_PUBLIC_APP_URL || detectedUrl || getAppUrl()).replace(/\/$/, "");
			const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
				resetToken,
			)}&email=${encodeURIComponent(email)}`;

			// Await email dispatch to ensure execution completes in serverless environments
			try {
				const emailResult = await sendPasswordResetEmail({
					toEmail: email,
					userName: user.name || "Kiosk User",
					resetUrl,
				});
				if (!emailResult.success) {
					console.error("[PASSWORD_RESET_EMAIL_SEND_FAILED]", emailResult.error);
				}
			} catch (err) {
				console.error("[PASSWORD_RESET_EMAIL_ERROR]", err);
			}
		}

		// Generic safe response to prevent user enumeration attacks
		return NextResponse.json(
			{
				message:
					"If an account exists with this email address, a password reset link has been sent.",
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
		console.error("[FORGOT_PASSWORD_ERROR]", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred while processing your request." },
			{ status: 500 },
		);
	}
}
