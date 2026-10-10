/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics - Aggregates website traffic, unique visitors, and WhatsApp conversion metrics
 */
export async function GET(request: Request) {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const range = searchParams.get("range") || "7d";
		const daysCount = range === "30d" ? 30 : range === "14d" ? 14 : 7;

		const now = new Date();
		const startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);

		// 1. Fetch raw events within window
		const events = await db.query.analyticsEvents.findMany({
			where: and(
				eq(analyticsEvents.tenantId, tenant.id),
				gte(analyticsEvents.createdAt, startDate),
			),
			orderBy: [desc(analyticsEvents.createdAt)],
		});

		// 2. Aggregate overall metrics
		const pageViewEvents = events.filter((e) => e.type === "PAGE_VIEW");
		const whatsappClickEvents = events.filter((e) => e.type === "WHATSAPP_CLICK");

		const uniqueVisitorSet = new Set<string>();
		pageViewEvents.forEach((e) => {
			if (e.visitorId) uniqueVisitorSet.add(e.visitorId);
		});

		const totalPageViews = pageViewEvents.length;
		const uniqueVisitors = uniqueVisitorSet.size || totalPageViews;
		const whatsappClicks = whatsappClickEvents.length;
		const conversionRate =
			uniqueVisitors > 0
				? ((whatsappClicks / uniqueVisitors) * 100).toFixed(1)
				: "0.0";

		// 3. Generate daily time series
		const dailyMap: Record<
			string,
			{ date: string; label: string; pageViews: number; uniqueVisitors: Set<string>; whatsappClicks: number }
		> = {};

		for (let i = daysCount - 1; i >= 0; i--) {
			const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
			const key = d.toISOString().slice(0, 10);
			const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
			dailyMap[key] = {
				date: key,
				label,
				pageViews: 0,
				uniqueVisitors: new Set<string>(),
				whatsappClicks: 0,
			};
		}

		events.forEach((e) => {
			const key = new Date(e.createdAt).toISOString().slice(0, 10);
			if (dailyMap[key]) {
				if (e.type === "PAGE_VIEW") {
					dailyMap[key].pageViews++;
					if (e.visitorId) dailyMap[key].uniqueVisitors.add(e.visitorId);
				} else if (e.type === "WHATSAPP_CLICK") {
					dailyMap[key].whatsappClicks++;
				}
			}
		});

		const dailyMetrics = Object.values(dailyMap).map((item) => ({
			date: item.date,
			label: item.label,
			pageViews: item.pageViews,
			uniqueVisitors: item.uniqueVisitors.size || item.pageViews,
			whatsappClicks: item.whatsappClicks,
		}));

		// 4. Device breakdown
		const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
		pageViewEvents.forEach((e) => {
			const dev = (e.device || "desktop").toLowerCase();
			if (deviceCounts[dev] !== undefined) deviceCounts[dev]++;
			else deviceCounts.desktop++;
		});

		const totalDeviceEvents = totalPageViews || 1;
		const deviceSplit = {
			mobile: Math.round(((deviceCounts.mobile + deviceCounts.tablet) / totalDeviceEvents) * 100),
			desktop: Math.round((deviceCounts.desktop / totalDeviceEvents) * 100),
		};

		// 5. Referrer breakdown
		const referrerCounts: Record<string, number> = {};
		pageViewEvents.forEach((e) => {
			const ref = e.referrer || "Direct";
			referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
		});

		const topReferrers = Object.entries(referrerCounts)
			.map(([source, count]) => ({
				source,
				count,
				percentage: Math.round((count / totalDeviceEvents) * 100),
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		return NextResponse.json({
			overview: {
				totalPageViews,
				uniqueVisitors,
				whatsappClicks,
				conversionRate: `${conversionRate}%`,
				periodDays: daysCount,
			},
			summary: {
				totalViews: totalPageViews,
				uniqueVisitors,
				whatsappClicks,
				conversionRate,
			},
			dailyMetrics,
			deviceSplit,
			topReferrers,
			tenant: {
				name: tenant.name,
				slug: tenant.slug,
			},
		});
	} catch (err) {
		console.error("[GET_ANALYTICS_ERROR]", err);
		return NextResponse.json({ error: "Failed to fetch analytics metrics" }, { status: 500 });
	}
}
