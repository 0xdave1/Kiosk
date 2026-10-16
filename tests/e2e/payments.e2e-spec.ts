import { test, expect } from "@playwright/test";
import { initializeBachsPayment, getBachsProductId } from "../../src/lib/payments/bachs";
import { BASE_PRICES_USD, CURRENCIES, formatPrice, getCurrencyForCountry } from "../../src/lib/currency";

test.describe("Payments & Currency Architecture", () => {
	test("Currency Model - Base prices across tiers and billing cycles", () => {
		expect(BASE_PRICES_USD.landing.monthly).toBe(15);
		expect(BASE_PRICES_USD.landing.yearly).toBe(144);
		expect(BASE_PRICES_USD.funnel.monthly).toBe(30);
		expect(BASE_PRICES_USD.funnel.yearly).toBe(288);
		expect(BASE_PRICES_USD.store.monthly).toBe(50);
		expect(BASE_PRICES_USD.store.yearly).toBe(480);
	});

	test("Currency Conversion & Formatting - Correct currency symbol and rate calculation", () => {
		const ngnConfig = CURRENCIES.NGN;
		expect(ngnConfig.code).toBe("NGN");
		expect(ngnConfig.symbol).toBe("₦");

		const convertedPrice = formatPrice(50, ngnConfig);
		expect(convertedPrice).toContain("₦");

		// Country resolver
		const ngCurrency = getCurrencyForCountry("NG");
		expect(ngCurrency.code).toBe("NGN");

		const gbCurrency = getCurrencyForCountry("GB");
		expect(gbCurrency.code).toBe("GBP");
	});

	test("Bachs Products - Maps plan and billing cycle to registered catalog products", () => {
		expect(getBachsProductId("LANDING_PAGE", "monthly")).toBe("prod_5223f9a13c2541eeabef");
		expect(getBachsProductId("LANDING_PAGE", "yearly")).toBe("prod_63eade98b47b48a99151");
		expect(getBachsProductId("SALES_FUNNEL", "monthly")).toBe("prod_222cc418fa6f4e8faf96");
		expect(getBachsProductId("SALES_FUNNEL", "yearly")).toBe("prod_0d0bec9066714f81a923");
		expect(getBachsProductId("E_COMMERCE", "monthly")).toBe("prod_ca6d57ac86e8495899eb");
		expect(getBachsProductId("E_COMMERCE", "yearly")).toBe("prod_47fe5e13ee9345bbb768");
	});

	test("initializeBachsPayment - Gracefully initialises dev/mock fallback link", async () => {
		const result = await initializeBachsPayment({
			amount: 50,
			currency: "USD",
			email: "client@example.com",
			name: "Client Name",
			tx_ref: "tx_test_12345",
			redirect_url: "https://kioosk.online/dashboard/content",
		});

		expect(result.success).toBe(true);
		expect(result.link).toBeDefined();
		expect(result.link).toContain("https://kioosk.online/dashboard/content");
	});
});
