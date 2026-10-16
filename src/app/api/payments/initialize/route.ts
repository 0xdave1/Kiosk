/** @format */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { auth } from "@/auth";
import { checkRateLimit, redis } from "@/lib/ratelimit";
import { initializeBachsPayment } from "@/lib/payments/bachs";
import { BASE_PRICES_USD, CURRENCIES, PlanKey } from "@/lib/currency";

import { db } from "@/db";
import { tenants, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

const initializeSchema = z.object({
	plan: z.enum(["LANDING_PAGE", "SALES_FUNNEL", "E_COMMERCE"]),
	billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
	currency: z.string().default("USD"),
});

const PLAN_MAP: Record<string, PlanKey> = {
	LANDING_PAGE: "landing",
	SALES_FUNNEL: "funnel",
	E_COMMERCE: "store",
};

/**
 * POST /api/payments/initialize - Initializes a Multi-Method Payment Request (Card, Transfer, USSD, Mobile Money)
 */
export async function POST(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
		const rateLimit = await checkRateLimit(ip, "checkout");
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many payment requests. Please try again later." },
				{ status: 429 },
			);
		}

		// 1. Authenticate User
		const authSession = await auth();
		const customUser = await getAuthenticatedUser();
		const userId = authSession?.user?.id || customUser?.id;
		const userEmail = authSession?.user?.email || customUser?.email;
		const userName = authSession?.user?.name || customUser?.name || "Kiosk Subscriber";

		if (!userId || !userEmail) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Strict Idempotency Lock Check (Prevents Double Invoicing)
		const idempotencyKey = request.headers.get("Idempotency-Key");
		if (idempotencyKey && redis) {
			const lockKey = `@kiosk/idempotency:${idempotencyKey}`;
			const isLocked = await redis.set(lockKey, "LOCKED", { nx: true, ex: 300 });
			if (!isLocked) {
				return NextResponse.json(
					{ error: "A payment request with this Idempotency-Key is already processing." },
					{ status: 409 },
				);
			}
		}

		const body = await request.json();
		const validation = initializeSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid payload", details: validation.error.flatten() },
				{ status: 400 },
			);
		}

		const { plan, billingCycle, currency } = validation.data;
		const planKey = PLAN_MAP[plan] || "landing";
		const baseUsdAmount = BASE_PRICES_USD[planKey][billingCycle];

		const currencyCode = currency.toUpperCase();
		const targetCurrency = CURRENCIES[currencyCode] || CURRENCIES.USD;

		// Convert USD base price to user's currency
		const amount = Math.round(baseUsdAmount * targetCurrency.rateFromUSD);
		const tx_ref = `kiosk_tx_${crypto.randomUUID()}`;
		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

		// 3. Ensure Tenant Record Exists
		let tenant = await db.query.tenants.findFirst({
			where: eq(tenants.ownerId, userId),
		});

		if (!tenant) {
			const slug = `workspace-${crypto.randomUUID().slice(0, 8)}`;
			const [newTenant] = await db
				.insert(tenants)
				.values({
					ownerId: userId,
					name: `${userName}'s Workspace`,
					slug,
					plan: "NONE",
					billingStatus: "PENDING",
				})
				.returning();
			tenant = newTenant;
		}

		// 4. Generate Invoice Number & Due Dates
		const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
		const dueDate = new Date();
		const gracePeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day grace period

		// 5. Initialize Multi-Method Bachs Payment Link
		const paymentResult = await initializeBachsPayment({
			amount,
			usdAmount: baseUsdAmount,
			currency: targetCurrency.code,
			email: userEmail,
			name: userName,
			tx_ref,
			redirect_url: `${appUrl}/dashboard/content?plan=${plan}`,
			meta: {
				userId,
				tenantId: tenant.id,
				invoiceNumber,
				plan,
				billingCycle,
				type: "INITIAL_SETUP",
			},
		});

		if (!paymentResult.success || !paymentResult.link) {
			return NextResponse.json(
				{ error: paymentResult.error || "Failed to initialize payment" },
				{ status: 500 },
			);
		}

		// 6. Record Initial Invoice in Database
		await db.insert(invoices).values({
			invoiceNumber,
			tenantId: tenant.id,
			userId,
			plan,
			billingCycle,
			type: "INITIAL_SETUP",
			amount,
			currency: targetCurrency.code,
			status: "PENDING",
			paymentLink: paymentResult.link,
			txRef: tx_ref,
			dueDate,
			gracePeriodEnd,
		});

		return NextResponse.json({
			status: "success",
			link: paymentResult.link,
			invoiceNumber,
			tx_ref,
		});
	} catch (err) {
		console.error("[INITIALIZE_PAYMENT_ERROR]", err);
		return NextResponse.json(
			{ error: "Failed to initialize payment process" },
			{ status: 500 },
		);
	}
}
