/** @format */

import {
	pgTable,
	text,
	timestamp,
	integer,
	primaryKey,
	boolean,
} from "drizzle-orm/pg-core";

/**
 * 1. User Accounts Table
 */
export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").notNull().unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	passwordHash: text("passwordHash"),
	image: text("image"),
	phone: text("phone"),
	emailNotifications: boolean("emailNotifications").default(true).notNull(),
	projectUpdates: boolean("projectUpdates").default(true).notNull(),
	role: text("role").default("USER").notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * 2. OAuth Provider Accounts Table (Google, GitHub)
 */
export const accounts = pgTable(
	"accounts",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<"oauth" | "oidc" | "email">().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => [
		primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	],
);

/**
 * 3. Active User Sessions Table
 */
export const sessions = pgTable("sessions", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * 4. Email Verification & Password Reset Tokens Table
 */
export const verificationTokens = pgTable(
	"verification_tokens",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => [
		primaryKey({
			columns: [vt.identifier, vt.token],
		}),
	],
);

/**
 * 5. Tenants Table (Multi-Tenant Workspaces / Businesses)
 * Each customer account owns a tenant workspace with subdomains and custom domains.
 */
export const tenants = pgTable("tenants", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	ownerId: text("ownerId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(), // e.g. "bella-bakery" -> bella-bakery.kiosk.site
	customDomain: text("customDomain").unique(), // e.g. "bellabakery.com"
	plan: text("plan").default("NONE").notNull(), // NONE | LANDING_PAGE | SALES_FUNNEL | E_COMMERCE
	billingStatus: text("billingStatus").default("ACTIVE").notNull(), // ACTIVE | PENDING | GRACE_PERIOD | PAST_DUE | SUSPENDED
	autoRenew: boolean("autoRenew").default(false).notNull(), // Whether recurring auto-renewal is active
	recurringAuthCode: text("recurringAuthCode"), // Paystack reusable authorization_code
	cardLast4: text("cardLast4"),
	cardBrand: text("cardBrand"),
	cardExpMonth: text("cardExpMonth"),
	cardExpYear: text("cardExpYear"),
	currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
	gracePeriodEnd: timestamp("gracePeriodEnd", { mode: "date" }),
	isCustomDomainVerified: boolean("isCustomDomainVerified").default(false).notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * 6. Projects Table (Websites / Sales Funnels / E-Commerce Stores under a Tenant)
 */
export const projects = pgTable("projects", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tenantId: text("tenantId")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	type: text("type").notNull(), // "Landing Page" | "Sales Funnel" | "E-commerce"
	status: text("status").default("In Progress").notNull(), // "Draft" | "In Progress" | "In Review" | "Live" | "Published" | "Suspended"
	progress: integer("progress").default(0).notNull(),
	publishedUrl: text("publishedUrl"),
	content: text("content"), // Serialized snapshot of submitted structured content
	adminNotes: text("adminNotes"), // Internal fulfillment team notes & instructions
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * 7. Subscriptions Table (Billing per Tenant)
 */
export const subscriptions = pgTable("subscriptions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tenantId: text("tenantId")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	gateway: text("gateway").notNull(), // "flutterwave" | "stripe" | "paystack"
	customerId: text("customerId").notNull(),
	subscriptionId: text("subscriptionId").notNull().unique(),
	planId: text("planId").notNull(), // "landing-page" | "sales-funnel" | "ecommerce"
	billingCycle: text("billingCycle").notNull(), // "monthly" | "yearly"
	status: text("status").notNull(), // "active" | "grace_period" | "past_due" | "canceled"
	autoRenew: boolean("autoRenew").default(false).notNull(),
	authCode: text("authCode"),
	cardLast4: text("cardLast4"),
	cardBrand: text("cardBrand"),
	cardExpMonth: text("cardExpMonth"),
	cardExpYear: text("cardExpYear"),
	currentPeriodStart: timestamp("currentPeriodStart", { mode: "date" }).notNull(),
	currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }).notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * 8. Idempotency Keys Table (Strict Double-Charge Protection)
 */
export const idempotencyKeys = pgTable("idempotency_keys", {
	key: text("key").primaryKey(), // UUID or client idempotency header
	tenantId: text("tenantId")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	responseBody: text("responseBody"),
	statusCode: integer("statusCode"),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
});

/**
 * 9. Invoices Table (Scheduled Payment Requests / Recurring Multi-Method Invoicing)
 */
export const invoices = pgTable("invoices", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	invoiceNumber: text("invoiceNumber").notNull().unique(), // e.g. "INV-2026-0042"
	tenantId: text("tenantId")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	plan: text("plan").notNull(), // LANDING_PAGE | SALES_FUNNEL | E_COMMERCE
	billingCycle: text("billingCycle").default("monthly").notNull(), // monthly | yearly
	type: text("type").default("RECURRING_HOSTING").notNull(), // INITIAL_SETUP | RECURRING_HOSTING
	amount: integer("amount").notNull(),
	currency: text("currency").default("USD").notNull(),
	status: text("status").default("PENDING").notNull(), // PENDING | PAID | GRACE_PERIOD | PAST_DUE | CANCELED
	paymentLink: text("paymentLink"),
	txRef: text("txRef").unique(),
	paymentMethod: text("paymentMethod"), // card | banktransfer | ussd | mobilemoney
	dueDate: timestamp("dueDate", { mode: "date" }).notNull(),
	gracePeriodEnd: timestamp("gracePeriodEnd", { mode: "date" }).notNull(),
	paidAt: timestamp("paidAt", { mode: "date" }),
	remindersSent: integer("remindersSent").default(0).notNull(),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * 10. Analytics Events Table (Tenant Website Traffic, Views & WhatsApp Conversions)
 */
export const analyticsEvents = pgTable("analytics_events", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	tenantId: text("tenantId")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	type: text("type").notNull(), // "PAGE_VIEW" | "WHATSAPP_CLICK" | "CALL_CLICK" | "OFFERING_CLICK"
	visitorId: text("visitorId"), // Anonymized salt hash for unique visitor metrics
	device: text("device").default("desktop"), // "mobile" | "desktop" | "tablet"
	referrer: text("referrer"), // e.g. "google", "instagram", "whatsapp", "direct"
	path: text("path").default("/"),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

