/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, analyticsEvents } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/track - High-throughput, privacy-friendly event tracking endpoint
 * Captures PAGE_VIEW and WHATSAPP_CLICK events from tenant live sites
 */
export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}));
		const { tenantSlug, type, referrer, path } = body;

		if (!tenantSlug || !type) {
			return NextResponse.json({ error: "Missing required tracking parameters" }, { status: 400 });
		}

		const cleanSlug = String(tenantSlug).toLowerCase().trim();

		// Match tenant by slug or custom domain
		const tenant = await db.query.tenants.findFirst({
			where: or(eq(tenants.slug, cleanSlug), eq(tenants.customDomain, cleanSlug)),
		});

		if (!tenant) {
			return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
		}

		// Device detection from User-Agent
		const userAgent = request.headers.get("user-agent") || "";
		let device = "desktop";
		if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
			device = /tablet|ipad/i.test(userAgent) ? "tablet" : "mobile";
		}

		// Anonymous salt hash for daily unique visitor calculation (zero PII stored)
		const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
		const dateStr = new Date().toISOString().slice(0, 10);
		const visitorId = crypto
			.createHash("sha256")
			.update(`${ip}-${userAgent}-${dateStr}`)
			.digest("hex")
			.slice(0, 16);

		// Clean referrer
		let cleanReferrer = "direct";
		if (referrer) {
			try {
				const refHost = new URL(referrer).hostname.replace(/^www\./, "");
				if (refHost.includes("google")) cleanReferrer = "Google";
				else if (refHost.includes("instagram")) cleanReferrer = "Instagram";
				else if (refHost.includes("whatsapp")) cleanReferrer = "WhatsApp";
				else if (refHost.includes("facebook") || refHost.includes("fb.")) cleanReferrer = "Facebook";
				else if (refHost.includes("twitter") || refHost.includes("x.com")) cleanReferrer = "X (Twitter)";
				else if (refHost.includes("tiktok")) cleanReferrer = "TikTok";
				else cleanReferrer = refHost;
			} catch {
				cleanReferrer = "other";
			}
		}

		// Insert tracking event
		await db.insert(analyticsEvents).values({
			tenantId: tenant.id,
			type: type.toUpperCase(), // "PAGE_VIEW" | "WHATSAPP_CLICK" | "CALL_CLICK"
			visitorId,
			device,
			referrer: cleanReferrer,
			path: path || "/",
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error("[ANALYTICS_TRACK_ERROR]", err);
		// Return 200 to prevent breaking client scripts
		return NextResponse.json({ success: false }, { status: 200 });
	}
}

export async function GET() {
	return NextResponse.json({ status: "analytics-collector-online" });
}
