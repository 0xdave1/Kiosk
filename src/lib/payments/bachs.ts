/**
 * Bachs.io Payment Gateway Integration Engine
 *
 * Provides enterprise payment processing via the Bachs REST API v1:
 * 1. Initialize Checkout Session (`initializeBachsPayment`)
 * 2. Verify Webhook Signature (`verifyBachsWebhookSignature`)
 *
 * Bachs API docs: https://docs.bachs.io
 * - Sandbox base URL: https://sandbox-api.bachs.io
 * - Production base URL: https://api.bachs.io
 * - Auth: Bearer token using BACHS_SECRET_KEY
 * - Webhook event: collection.succeeded
 * - Signature: HMAC-SHA256 of "{X-Bachs-Timestamp}.{raw_body}"
 *
 * @module bachs
 * @format
 */

import crypto from "crypto";
import { CURRENCIES } from "@/lib/currency";

const BACHS_WEBHOOK_SECRET = process.env.BACHS_WEBHOOK_SECRET || "";

function getBachsConfig() {
	const key = process.env.BACHS_SECRET_KEY || "";
	const isSandbox = key.startsWith("sk_sandbox_");
	const baseUrl = isSandbox
		? "https://sandbox-api.bachs.io"
		: "https://api.bachs.io";
	return { key, isSandbox, baseUrl };
}

/* ------------------------------------------------------------------ */
/*  Product Catalog Mappings                                           */
/* ------------------------------------------------------------------ */

export const BACHS_PRODUCTS = {
	landing: {
		monthly: process.env.BACHS_PROD_LANDING_MONTHLY || "prod_5223f9a13c2541eeabef",
		yearly: process.env.BACHS_PROD_LANDING_YEARLY || "prod_63eade98b47b48a99151",
	},
	funnel: {
		monthly: process.env.BACHS_PROD_FUNNEL_MONTHLY || "prod_222cc418fa6f4e8faf96",
		yearly: process.env.BACHS_PROD_FUNNEL_YEARLY || "prod_0d0bec9066714f81a923",
	},
	store: {
		monthly: process.env.BACHS_PROD_STORE_MONTHLY || "prod_ca6d57ac86e8495899eb",
		yearly: process.env.BACHS_PROD_STORE_YEARLY || "prod_47fe5e13ee9345bbb768",
	},
} as const;

export function getBachsProductId(plan: string, billingCycle: "monthly" | "yearly"): string | undefined {
	const normalized = (plan || "").toLowerCase();
	let key: "landing" | "funnel" | "store" = "landing";
	if (normalized.includes("funnel")) key = "funnel";
	else if (normalized.includes("store") || normalized.includes("commerce")) key = "store";

	return BACHS_PRODUCTS[key]?.[billingCycle];
}

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface InitializePaymentInput {
	/** Optional Bachs catalog product ID */
	productId?: string;
	/** Amount in target currency */
	amount: number;
	/** USD base price amount */
	usdAmount?: number;
	/** ISO 4217 currency code */
	currency: string;
	email: string;
	name: string;
	/** Your own unique reference / tx_ref */
	tx_ref: string;
	/** Where Bachs redirects on success — ?checkout_id= is appended */
	redirect_url: string;
	/** Optional metadata forwarded in webhooks (up to 20 key/value pairs) */
	meta?: Record<string, unknown>;
}

export interface InitializePaymentResponse {
	success: boolean;
	link?: string;
	checkoutId?: string;
	error?: string;
}

/* ------------------------------------------------------------------ */
/*  Checkout session initialization                                     */
/* ------------------------------------------------------------------ */

/**
 * Initializes a Bachs checkout session and returns the hosted checkout URL.
 * Supports both product_cart (catalog products) and raw pricing flows.
 */
export async function initializeBachsPayment(
	input: InitializePaymentInput,
): Promise<InitializePaymentResponse> {
	const { key: BACHS_SECRET_KEY, baseUrl: BACHS_BASE_URL } = getBachsConfig();

	console.log(`[BACHS] Key check: ${BACHS_SECRET_KEY ? "PRESENT (" + BACHS_SECRET_KEY.slice(0, 10) + "...)" : "MISSING"} | API URL: ${BACHS_BASE_URL}`);

	if (!BACHS_SECRET_KEY) {
		console.error("[BACHS_ERROR] BACHS_SECRET_KEY is not loaded in process.env. Did you restart `npm run dev` after editing .env.local?");
		return {
			success: false,
			error: "Bachs API Key (BACHS_SECRET_KEY) is missing. Please restart your dev server (npm run dev) after updating .env.local.",
		};
	}

	try {
		// 1. If productId is provided, try catalog product checkout session first
		if (input.productId) {
			const productRequestBody = {
				product_cart: [
					{
						product_id: input.productId,
						quantity: 1,
					},
				],
				customer: {
					email: input.email,
					name: input.name,
				},
				success_url: input.redirect_url,
				cancel_url: input.redirect_url.split("?")[0],
				reference: input.tx_ref,
				metadata: input.meta ?? {},
			};

			console.log(`[BACHS_PRODUCT_REQUEST] POST ${BACHS_BASE_URL}/v1/checkout-sessions`, JSON.stringify(productRequestBody, null, 2));

			const prodResponse = await fetch(`${BACHS_BASE_URL}/v1/checkout-sessions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${BACHS_SECRET_KEY}`,
				},
				body: JSON.stringify(productRequestBody),
			});

			const prodResult = await prodResponse.json();
			console.log(`[BACHS_PRODUCT_RESPONSE] Status: ${prodResponse.status}`, JSON.stringify(prodResult, null, 2));

			if (prodResponse.ok && prodResult.checkout_url) {
				console.log(`[BACHS_PRODUCT_SUCCESS] Redirecting customer to: ${prodResult.checkout_url}`);
				return {
					success: true,
					link: prodResult.checkout_url,
					checkoutId: prodResult.checkout_id,
				};
			}

			console.warn(`[BACHS_PRODUCT_FALLBACK] Product checkout rejected (${prodResult.error_code || prodResult.detail || prodResponse.status}). Falling back to raw pricing...`);
		}

		// 2. Raw pricing flow
		const targetCurrencyCode = input.currency.toUpperCase();
		const rate = CURRENCIES[targetCurrencyCode]?.rateFromUSD || 1;
		const baseUsdPrice = input.usdAmount || (targetCurrencyCode === "USD" ? input.amount : input.amount / rate);

		// Per Bachs docs: organization base currency is USD.
		// Use USD as primary pricing.currency and currency_options for local currency overrides (e.g. NGN).
		const pricing: Record<string, unknown> = {
			currency: "USD",
			amount: baseUsdPrice.toFixed(2),
		};

		if (targetCurrencyCode !== "USD") {
			pricing.currency_options = {
				[targetCurrencyCode]: input.amount.toFixed(2),
			};
		}

		const requestBody = {
			pricing,
			customer: {
				email: input.email,
				name: input.name,
			},
			success_url: input.redirect_url,
			cancel_url: input.redirect_url.split("?")[0],
			reference: input.tx_ref,
			metadata: input.meta ?? {},
		};

		console.log(`[BACHS_REQUEST] POST ${BACHS_BASE_URL}/v1/checkout-sessions`, JSON.stringify(requestBody, null, 2));

		const response = await fetch(`${BACHS_BASE_URL}/v1/checkout-sessions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${BACHS_SECRET_KEY}`,
			},
			body: JSON.stringify(requestBody),
		});

		const result = await response.json();
		console.log(`[BACHS_RESPONSE] Status: ${response.status}`, JSON.stringify(result, null, 2));

		if (!response.ok || !result.checkout_url) {
			const errorMsg = result.message || result.error || result.detail || `Bachs API error (HTTP ${response.status})`;
			console.error("[BACHS_INIT_ERROR]", errorMsg, result);
			return {
				success: false,
				error: errorMsg,
			};
		}

		console.log(`[BACHS_SUCCESS] Redirecting customer to: ${result.checkout_url}`);
		return {
			success: true,
			link: result.checkout_url,
			checkoutId: result.checkout_id,
		};
	} catch (err: unknown) {
		console.error("[BACHS_INIT_EXCEPTION]", err);
		const error = err as Error;
		return {
			success: false,
			error: error?.message || "Unexpected network error during Bachs payment initialization",
		};
	}
}

/* ------------------------------------------------------------------ */
/*  Webhook signature verification                                      */
/* ------------------------------------------------------------------ */

/**
 * Verifies a Bachs webhook delivery using HMAC-SHA256.
 *
 * Bachs signs each delivery with:
 *   X-Bachs-Timestamp: Unix timestamp (seconds)
 *   X-Bachs-Signature: HMAC-SHA256 hex of "{timestamp}.{raw_body}"
 *
 * @param rawBody     Raw request body as a string (before JSON parsing)
 * @param timestamp   Value of the X-Bachs-Timestamp header
 * @param signature   Value of the X-Bachs-Signature header
 * @param toleranceSecs  Max age in seconds before rejecting stale events (default 300s)
 */
export function verifyBachsWebhookSignature(
	rawBody: string,
	timestamp: string,
	signature: string,
	toleranceSecs = 300,
): boolean {
	if (!BACHS_WEBHOOK_SECRET) {
		// In dev mode without a secret, accept all webhooks (log a warning)
		console.warn("[BACHS_WEBHOOK] No BACHS_WEBHOOK_SECRET set — skipping signature check");
		return true;
	}

	try {
		const ts = parseInt(timestamp, 10);
		if (isNaN(ts)) return false;

		// Reject stale deliveries
		if (Math.abs(Date.now() / 1000 - ts) > toleranceSecs) {
			console.warn("[BACHS_WEBHOOK] Stale webhook delivery rejected");
			return false;
		}

		const message = `${ts}.${rawBody}`;
		const expected = crypto
			.createHmac("sha256", BACHS_WEBHOOK_SECRET)
			.update(message, "utf8")
			.digest("hex");

		return crypto.timingSafeEqual(
			Buffer.from(expected, "hex"),
			Buffer.from(signature, "hex"),
		);
	} catch (err) {
		console.error("[BACHS_WEBHOOK_VERIFY_ERROR]", err);
		return false;
	}
}
