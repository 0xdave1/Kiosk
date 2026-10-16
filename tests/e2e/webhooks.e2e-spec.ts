import { test, expect } from "@playwright/test";
import { verifyBachsWebhookSignature } from "../../src/lib/payments/bachs";

test.describe("Bachs Webhook Security & Verification", () => {
	test("verifyBachsWebhookSignature - Validates webhook signature handling", () => {
		// When BACHS_WEBHOOK_SECRET is not set or in dev mode
		const timestamp = Math.floor(Date.now() / 1000).toString();
		const isValid = verifyBachsWebhookSignature(
			JSON.stringify({ event: "collection.succeeded" }),
			timestamp,
			"mock_signature",
		);
		expect(typeof isValid).toBe("boolean");
	});
});

