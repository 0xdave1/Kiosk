/**
 * Paystack Payment Gateway Integration Engine
 *
 * Provides enterprise payment processing via Paystack REST API:
 * 1. Initialize Standard Transaction (`initializePaystackPayment`)
 * 2. Verify Transaction Status (`verifyPaystackTransaction`)
 * 3. Secure HMAC-SHA512 Webhook Signature Validator (`verifyPaystackWebhookSignature`)
 *
 * @module paystack
 * @format
 */

import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface InitializePaystackInput {
	amount: number; // Base currency amount (e.g. 30 for $30 or 48600 for ₦48,600)
	currency: string;
	email: string;
	name: string;
	reference: string;
	callback_url: string;
	channels?: string[];
	metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
	status: boolean;
	message: string;
	data?: {
		authorization_url: string;
		access_code: string;
		reference: string;
	};
}

export interface PaystackAuthorizationData {
	authorization_code?: string;
	bin?: string;
	last4?: string;
	exp_month?: string;
	exp_year?: string;
	channel?: string;
	card_type?: string;
	bank?: string;
	country_code?: string;
	brand?: string;
	reusable?: boolean;
	signature?: string;
}

export interface PaystackVerifyResponse {
	status: boolean;
	message: string;
	data?: {
		id: number;
		domain: string;
		status: "success" | "failed" | "abandoned" | "reversed";
		reference: string;
		amount: number;
		gateway_response: string;
		paid_at: string;
		created_at: string;
		channel: string;
		currency: string;
		ip_address: string;
		metadata: Record<string, unknown>;
		customer: {
			id: number;
			first_name?: string;
			last_name?: string;
			email: string;
			customer_code: string;
			phone?: string;
		};
		authorization?: PaystackAuthorizationData;
	};
}

/**
 * Validates the incoming Paystack webhook signature using HMAC-SHA512.
 * Paystack signs all webhook deliveries with the `x-paystack-signature` header.
 */
export function verifyPaystackWebhookSignature(
	signature: string,
	rawBody: string,
): boolean {
	if (!PAYSTACK_SECRET_KEY) {
		console.warn("[PAYSTACK_WEBHOOK] No PAYSTACK_SECRET_KEY set — approving dev webhook signature");
		return true;
	}

	if (!signature || !rawBody) {
		return false;
	}

	try {
		const hash = crypto
			.createHmac("sha512", PAYSTACK_SECRET_KEY)
			.update(rawBody)
			.digest("hex");

		return hash === signature;
	} catch (err) {
		console.error("[PAYSTACK_SIGNATURE_ERROR]", err);
		return false;
	}
}

/**
 * Initializes a Paystack transaction and returns the hosted checkout URL.
 * Automatically converts major currency units into the lowest subunit (kobo / cents).
 */
export async function initializePaystackPayment(
	input: InitializePaystackInput,
): Promise<{ success: boolean; link?: string; reference?: string; access_code?: string; error?: string }> {
	// Only use mock redirect during automated unit testing
	if (process.env.NODE_ENV === "test") {
		const separator = input.callback_url.includes("?") ? "&" : "?";
		return {
			success: true,
			link: `${input.callback_url}${separator}status=success&reference=${input.reference}&trxref=${input.reference}`,
			reference: input.reference,
		};
	}

	if (!PAYSTACK_SECRET_KEY) {
		console.error("[PAYSTACK_INIT_ERROR] PAYSTACK_SECRET_KEY is not configured.");
		return {
			success: false,
			error: "Paystack is not configured. Please add PAYSTACK_SECRET_KEY to your environment variables in Vercel.",
		};
	}

	try {
		// Paystack expects amount in lowest currency subunit (kobo for NGN, cents for USD/GHS/ZAR)
		const amountInSubunit = Math.round(input.amount * 100);

		const payload: Record<string, any> = {
			email: input.email,
			amount: amountInSubunit,
			currency: input.currency.toUpperCase(),
			reference: input.reference,
			callback_url: input.callback_url,
			metadata: {
				...input.metadata,
				custom_fields: [
					{
						display_name: "Customer Name",
						variable_name: "customer_name",
						value: input.name,
					},
				],
			},
		};

		if (input.channels && input.channels.length > 0) {
			payload.channels = input.channels;
		}

		const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			},
			body: JSON.stringify(payload),
		});

		const result: PaystackInitResponse = await response.json();

		if (!result.status || !result.data?.authorization_url) {
			console.error("[PAYSTACK_INIT_ERROR]", result);
			return {
				success: false,
				error: result.message || "Failed to initialize Paystack payment link",
			};
		}

		return {
			success: true,
			link: result.data.authorization_url,
			reference: result.data.reference,
			access_code: result.data.access_code,
		};
	} catch (err) {
		console.error("[PAYSTACK_INIT_EXCEPTION]", err);
		return {
			success: false,
			error: "Unexpected network error during Paystack payment initialization",
		};
	}
}

/**
 * Verifies transaction status directly with the Paystack Verification API.
 */
export async function verifyPaystackTransaction(
	reference: string,
): Promise<NonNullable<PaystackVerifyResponse["data"]> | null> {
	const isDevMock = !PAYSTACK_SECRET_KEY || process.env.NODE_ENV === "test";

	if (isDevMock) {
		return {
			id: 12345,
			domain: "test",
			status: "success",
			reference,
			amount: 5000,
			currency: "USD",
			gateway_response: "Successful",
			paid_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			ip_address: "127.0.0.1",
			channel: "card",
			customer: {
				id: 1,
				email: "dev@kioosk.online",
				customer_code: "CUS_dev_mock",
			},
			metadata: {},
			authorization: {
				authorization_code: "AUTH_dev_mock",
				reusable: true,
				last4: "4081",
				brand: "visa",
				exp_month: "12",
				exp_year: "2030",
			},
		};
	}

	try {
		const response = await fetch(
			`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				},
			},
		);

		const result: PaystackVerifyResponse = await response.json();
		if (!result.status || !result.data) {
			console.error("[PAYSTACK_VERIFY_FAILED]", result);
			return null;
		}

		return result.data;
	} catch (err) {
		console.error("[PAYSTACK_VERIFY_EXCEPTION]", err);
		return null;
	}
}

/**
 * Legacy compatibility alias for existing callers
 * @deprecated Use initializePaystackPayment instead
 */
export const initializeFlutterwavePayment = (input: {
	amount: number;
	currency: string;
	email: string;
	name: string;
	tx_ref?: string;
	reference?: string;
	redirect_url?: string;
	callback_url?: string;
	meta?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}) => {
	return initializePaystackPayment({
		amount: input.amount,
		currency: input.currency,
		email: input.email,
		name: input.name,
		reference: (input.tx_ref || input.reference) ?? "",
		callback_url: (input.redirect_url || input.callback_url) ?? "",
		metadata: input.meta || input.metadata,
	});
};

export interface ChargeAuthorizationInput {
	authorization_code: string;
	email: string;
	amount: number; // Base currency units, e.g. 29 for $29.00
	currency: string;
	reference: string;
	metadata?: Record<string, unknown>;
}

export interface ChargeAuthorizationResult {
	success: boolean;
	reference?: string;
	data?: any;
	error?: string;
}

/**
 * Charges a recurring authorization directly via Paystack's Charge Authorization API.
 * Used for automated monthly subscription renewal without requiring manual user interaction.
 */
export async function chargePaystackAuthorization(
	input: ChargeAuthorizationInput,
): Promise<ChargeAuthorizationResult> {
	if (process.env.NODE_ENV === "test") {
		return {
			success: true,
			reference: input.reference,
			data: { status: "success", reference: input.reference },
		};
	}

	if (!PAYSTACK_SECRET_KEY) {
		console.error("[PAYSTACK_CHARGE_AUTH_ERROR] PAYSTACK_SECRET_KEY is not configured.");
		return {
			success: false,
			error: "PAYSTACK_SECRET_KEY is not configured.",
		};
	}

	try {
		const amountInSubunit = Math.round(input.amount * 100);
		const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/charge_authorization`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			},
			body: JSON.stringify({
				authorization_code: input.authorization_code,
				email: input.email,
				amount: amountInSubunit,
				currency: input.currency.toUpperCase(),
				reference: input.reference,
				metadata: input.metadata || {},
			}),
		});

		const result = await response.json();

		if (!result.status || result.data?.status !== "success") {
			console.warn("[PAYSTACK_CHARGE_AUTH_FAILED]", result);
			return {
				success: false,
				error: result.data?.gateway_response || result.message || "Recurring card debit failed",
			};
		}

		return {
			success: true,
			reference: result.data.reference,
			data: result.data,
		};
	} catch (err) {
		console.error("[PAYSTACK_CHARGE_AUTH_EXCEPTION]", err);
		return {
			success: false,
			error: "Network exception during recurring payment processing",
		};
	}
}

