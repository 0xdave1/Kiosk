/**
 * Currency Configuration
 *
 * Defines supported currencies with their symbols, locales, and approximate
 * exchange rates relative to USD. Rates are baked-in approximations — for
 * production-grade accuracy, swap `EXCHANGE_RATES` with a live API response.
 *
 * Base prices are in USD. All other currencies are derived by multiplying.
 *
 * @module currency
 * @format
 */

export interface CurrencyConfig {
	/** ISO 4217 currency code */
	code: string;
	/** Display symbol */
	symbol: string;
	/** Intl.NumberFormat locale string */
	locale: string;
	/** Approximate rate vs 1 USD */
	rateFromUSD: number;
	/** Friendly label shown in UI */
	label: string;
}

/** Supported currency map keyed by ISO 4217 code */
export const CURRENCIES: Record<string, CurrencyConfig> = {
	USD: {
		code: "USD",
		symbol: "$",
		locale: "en-US",
		rateFromUSD: 1,
		label: "US Dollar",
	},
	NGN: {
		code: "NGN",
		symbol: "₦",
		locale: "en-NG",
		rateFromUSD: 777600 / 583.99, // ~1331.53 NGN/USD
		label: "Nigerian Naira",
	},
	GHS: {
		code: "GHS",
		symbol: "GH₵",
		locale: "en-GH",
		rateFromUSD: 6824.19 / 583.99, // ~11.685 GHS/USD
		label: "Ghanaian Cedi",
	},
	KES: {
		code: "KES",
		symbol: "KSh",
		locale: "en-KE",
		rateFromUSD: 75884 / 583.99, // ~129.94 KES/USD
		label: "Kenyan Shilling",
	},
	MWK: {
		code: "MWK",
		symbol: "MK",
		locale: "en-MW",
		rateFromUSD: 1013337 / 583.99, // ~1735.20 MWK/USD
		label: "Malawian Kwacha",
	},
	RWF: {
		code: "RWF",
		symbol: "FRw",
		locale: "rw-RW",
		rateFromUSD: 862537 / 583.99, // ~1476.97 RWF/USD
		label: "Rwandan Franc",
	},
	TZS: {
		code: "TZS",
		symbol: "TSh",
		locale: "sw-TZ",
		rateFromUSD: 1542805 / 583.99, // ~2641.83 TZS/USD
		label: "Tanzanian Shilling",
	},
	UGX: {
		code: "UGX",
		symbol: "USh",
		locale: "en-UG",
		rateFromUSD: 2413709 / 583.99, // ~4133.13 UGX/USD
		label: "Ugandan Shilling",
	},
	XAF: {
		code: "XAF",
		symbol: "FCFA",
		locale: "fr-CM",
		rateFromUSD: 340490 / 583.99, // ~583.04 XAF/USD
		label: "Central African CFA Franc",
	},
	XOF: {
		code: "XOF",
		symbol: "CFA",
		locale: "fr-SN",
		rateFromUSD: 340490 / 583.99, // ~583.04 XOF/USD
		label: "West African CFA Franc",
	},
	ZMW: {
		code: "ZMW",
		symbol: "ZK",
		locale: "en-ZM",
		rateFromUSD: 11699 / 583.99, // ~20.03 ZMW/USD
		label: "Zambian Kwacha",
	},
	GBP: {
		code: "GBP",
		symbol: "£",
		locale: "en-GB",
		rateFromUSD: 0.79,
		label: "British Pound",
	},
	EUR: {
		code: "EUR",
		symbol: "€",
		locale: "en-IE",
		rateFromUSD: 0.93,
		label: "Euro",
	},
	CAD: {
		code: "CAD",
		symbol: "CA$",
		locale: "en-CA",
		rateFromUSD: 1.37,
		label: "Canadian Dollar",
	},
	AUD: {
		code: "AUD",
		symbol: "A$",
		locale: "en-AU",
		rateFromUSD: 1.54,
		label: "Australian Dollar",
	},
	ZAR: {
		code: "ZAR",
		symbol: "R",
		locale: "en-ZA",
		rateFromUSD: 18.5,
		label: "South African Rand",
	},
};

/**
 * Map of ISO 3166-1 alpha-2 country codes → currency code.
 * Countries not in this map fall back to USD.
 */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
	// Nigeria
	NG: "NGN",
	// Ghana
	GH: "GHS",
	// Kenya
	KE: "KES",
	// Malawi
	MW: "MWK",
	// Rwanda
	RW: "RWF",
	// Tanzania
	TZ: "TZS",
	// Uganda
	UG: "UGX",
	// Zambia
	ZM: "ZMW",
	// Central Africa (CEMAC - XAF)
	CM: "XAF",
	GA: "XAF",
	CG: "XAF",
	TD: "XAF",
	CF: "XAF",
	GQ: "XAF",
	// West Africa (WAEMU - XOF)
	SN: "XOF",
	CI: "XOF",
	BJ: "XOF",
	BF: "XOF",
	ML: "XOF",
	NE: "XOF",
	TG: "XOF",
	GW: "XOF",
	// South Africa
	ZA: "ZAR",
	// United Kingdom
	GB: "GBP",
	// Eurozone countries
	DE: "EUR",
	FR: "EUR",
	IT: "EUR",
	ES: "EUR",
	NL: "EUR",
	BE: "EUR",
	AT: "EUR",
	PT: "EUR",
	IE: "EUR",
	FI: "EUR",
	GR: "EUR",
	LU: "EUR",
	MT: "EUR",
	CY: "EUR",
	SK: "EUR",
	SI: "EUR",
	EE: "EUR",
	LV: "EUR",
	LT: "EUR",
	// Canada
	CA: "CAD",
	// Australia / New Zealand
	AU: "AUD",
	NZ: "AUD",
};

/**
 * Base prices in USD (monthly / yearly).
 * Yearly is monthly × 12 × 0.8 (20% discount).
 */
export const BASE_PRICES_USD = {
	landing: { monthly: 15, yearly: 144 },
	funnel: { monthly: 30, yearly: 288 },
	store: { monthly: 50, yearly: 480 },
} as const;

export type PlanKey = keyof typeof BASE_PRICES_USD;

/**
 * Converts a USD price to the target currency and formats it for display.
 */
export function formatPrice(
	usdAmount: number,
	currency: CurrencyConfig,
): string {
	const converted = usdAmount * currency.rateFromUSD;

	// For very large numbers (NGN etc.) skip decimal places
	const maximumFractionDigits = converted >= 1000 ? 0 : 2;

	return new Intl.NumberFormat(currency.locale, {
		style: "currency",
		currency: currency.code,
		maximumFractionDigits,
		minimumFractionDigits: 0,
	}).format(converted);
}

/**
 * Returns the CurrencyConfig for a given country code, defaulting to USD.
 */
export function getCurrencyForCountry(countryCode: string): CurrencyConfig {
	const currencyCode = COUNTRY_TO_CURRENCY[countryCode?.toUpperCase()] ?? "USD";
	return CURRENCIES[currencyCode] ?? CURRENCIES.USD;
}
