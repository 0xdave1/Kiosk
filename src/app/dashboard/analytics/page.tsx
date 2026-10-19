/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	Users,
	MessageCircle,
	Smartphone,
	Monitor,
	Globe,
	ArrowLeft,
	Activity,
	Zap,
} from "lucide-react";

interface AnalyticsData {
	overview: {
		totalPageViews: number;
		uniqueVisitors: number;
		whatsappClicks: number;
		conversionRate: string;
		periodDays: number;
	};
	dailyMetrics: Array<{
		date: string;
		label: string;
		pageViews: number;
		uniqueVisitors: number;
		whatsappClicks: number;
	}>;
	deviceSplit: {
		mobile: number;
		desktop: number;
	};
	topReferrers: Array<{
		source: string;
		count: number;
		percentage: number;
	}>;
	tenant: {
		name: string;
		slug: string;
	};
}

export default function AnalyticsPage() {
	const [range, setRange] = useState<"7d" | "14d" | "30d">("7d");
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchAnalytics = async (selectedRange: string) => {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/analytics?range=${selectedRange}`);
			if (res.ok) {
				const json = await res.json();
				setData(json);
			}
		} catch (e) {
			console.error("[ANALYTICS_FETCH_ERROR]", e);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAnalytics(range);
	}, [range]);

	const overview = data?.overview || {
		totalPageViews: 0,
		uniqueVisitors: 0,
		whatsappClicks: 0,
		conversionRate: "0.0%",
		periodDays: 7,
	};

	const daily = data?.dailyMetrics || [];
	const maxViews = Math.max(...daily.map((d) => d.pageViews), 10);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32 sm:pb-28 selection:bg-blue-600 selection:text-white">
			{/* Top Sticky Header */}
			<header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 sm:py-4">
				<div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
					<div className="flex items-center gap-3">
						<Link
							href="/dashboard"
							className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0"
							aria-label="Back to Dashboard">
							<ArrowLeft className="w-4 h-4" />
						</Link>
						<div className="min-w-0">
							<h1 className="text-base sm:text-xl font-bold font-nohemi text-gray-900 tracking-tight flex items-center gap-2 truncate">
								<span className="truncate">Website Traffic & Lead Analytics</span>
								<span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
									Live
								</span>
							</h1>
							<p className="text-[11px] sm:text-xs text-gray-500 truncate">
								Real-time visitors, engagement, and WhatsApp customer conversions
							</p>
						</div>
					</div>

					{/* Range Switcher (Full-width on mobile, auto on desktop) */}
					<div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200/80 text-xs font-semibold w-full sm:w-auto shrink-0">
						{(["7d", "14d", "30d"] as const).map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => setRange(r)}
								className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
									range === r ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-900"
								}`}>
								{r === "7d" ? "7 Days" : r === "14d" ? "14 Days" : "30 Days"}
							</button>
						))}
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-8 pt-5 sm:pt-8 space-y-5 sm:space-y-8">
				{/* KPI Cards: 2x2 grid on mobile, 4 cols on desktop */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
					{/* Card 1: Page Views */}
					<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-3 sm:mb-4">
							<span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">Page Views</span>
							<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
								<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div>
							<div className="text-xl sm:text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-0.5 sm:mb-1">
								{isLoading ? "..." : overview.totalPageViews.toLocaleString()}
							</div>
							<p className="text-[10px] sm:text-[11px] text-gray-500 truncate">Total visits in period</p>
						</div>
					</div>

					{/* Card 2: Unique Visitors */}
					<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-3 sm:mb-4">
							<span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">Visitors</span>
							<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
								<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div>
							<div className="text-xl sm:text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-0.5 sm:mb-1">
								{isLoading ? "..." : overview.uniqueVisitors.toLocaleString()}
							</div>
							<p className="text-[10px] sm:text-[11px] text-gray-500 truncate">Distinct prospects</p>
						</div>
					</div>

					{/* Card 3: WhatsApp Inquiries */}
					<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-3 sm:mb-4">
							<span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">WhatsApp</span>
							<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
								<MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div>
							<div className="text-xl sm:text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-0.5 sm:mb-1">
								{isLoading ? "..." : overview.whatsappClicks.toLocaleString()}
							</div>
							<p className="text-[10px] sm:text-[11px] text-gray-500 truncate">Direct WhatsApp chats</p>
						</div>
					</div>

					{/* Card 4: WhatsApp Conversion Rate */}
					<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-3 sm:mb-4">
							<span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">Conversion</span>
							<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
								<Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div>
							<div className="text-xl sm:text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-0.5 sm:mb-1 text-emerald-600">
								{isLoading ? "..." : overview.conversionRate}
							</div>
							<p className="text-[10px] sm:text-[11px] text-gray-500 truncate">Visitors to inquiry rate</p>
						</div>
					</div>
				</div>

				{/* Interactive Daily Traffic Chart */}
				<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
						<div>
							<h3 className="text-sm sm:text-lg font-bold font-nohemi text-gray-900">
								Visitor Traffic & WhatsApp Conversions
							</h3>
							<p className="text-[11px] sm:text-xs text-gray-500">
								Daily comparison of total views vs. WhatsApp chat leads generated
							</p>
						</div>

						{/* Legend */}
						<div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-semibold">
							<div className="flex items-center gap-1.5">
								<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-600" />
								<span className="text-gray-600">Page Views</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
								<span className="text-gray-600">WhatsApp Leads</span>
							</div>
						</div>
					</div>

					{/* Horizontal Swipe Chart Container for Mobile */}
					<div className="w-full overflow-x-auto pb-3 pt-1 scrollbar-thin">
						<div
							style={{ minWidth: range === "30d" ? "680px" : range === "14d" ? "420px" : "100%" }}
							className="h-56 sm:h-72 w-full flex items-end gap-1 sm:gap-3 pt-6 border-b border-gray-100">
							{daily.map((day) => {
								const viewHeightPercent = Math.max(6, Math.min(100, Math.round((day.pageViews / maxViews) * 100)));
								const leadHeightPercent = Math.max(0, Math.min(100, Math.round((day.whatsappClicks / maxViews) * 100)));

								return (
									<div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[28px] sm:min-w-0">
										{/* Hover/Tap Tooltip */}
										<div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 pointer-events-none whitespace-nowrap z-20 shadow-lg">
											<p className="font-bold">{day.label}</p>
											<p className="text-blue-300">{day.pageViews} views</p>
											<p className="text-emerald-300">{day.whatsappClicks} WhatsApp chats</p>
										</div>

										{/* Dual Bars */}
										<div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
											{/* Page Views Bar */}
											<div
												style={{ height: `${viewHeightPercent}%` }}
												className="w-1/2 max-w-[16px] sm:max-w-[20px] bg-blue-600 group-hover:bg-blue-700 rounded-t-md transition-all duration-300"
											/>
											{/* WhatsApp Lead Bar */}
											<div
												style={{ height: `${leadHeightPercent}%` }}
												className="w-1/2 max-w-[16px] sm:max-w-[20px] bg-emerald-500 group-hover:bg-emerald-600 rounded-t-md transition-all duration-300"
											/>
										</div>

										{/* Bottom Date Label */}
										<span className="text-[9px] sm:text-[10px] font-mono text-gray-400 mt-2 truncate w-full text-center">
											{day.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
					{range !== "7d" && (
						<p className="text-[10px] text-gray-400 text-right sm:hidden">
							&larr; Swipe sideways to view all days &rarr;
						</p>
					)}
				</div>

				{/* Two-Column Breakdown: Devices & Traffic Sources */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
					{/* Traffic Sources */}
					<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-xs">
						<h3 className="text-sm sm:text-base font-bold font-nohemi text-gray-900 mb-1 flex items-center gap-2">
							<Globe className="w-4 h-4 text-blue-600" />
							<span>Top Traffic Sources</span>
						</h3>
						<p className="text-[11px] sm:text-xs text-gray-500 mb-4 sm:mb-6">Where your website visitors are discovering you</p>

						<div className="space-y-3 sm:space-y-4">
							{data?.topReferrers && data.topReferrers.length > 0 ? (
								data.topReferrers.map((ref) => (
									<div key={ref.source} className="space-y-1.5">
										<div className="flex items-center justify-between text-xs font-semibold">
											<span className="text-gray-700">{ref.source}</span>
											<span className="text-gray-500">{ref.count} visits ({ref.percentage}%)</span>
										</div>
										<div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
											<div
												style={{ width: `${Math.max(5, ref.percentage)}%` }}
												className="h-full bg-blue-600 rounded-full"
											/>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-6 sm:py-8 text-gray-400 text-xs">
									Traffic referrers will appear as visitors arrive at your website.
								</div>
							)}
						</div>
					</div>

					{/* Device Distribution */}
					<div className="bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-xs">
						<h3 className="text-sm sm:text-base font-bold font-nohemi text-gray-900 mb-1 flex items-center gap-2">
							<Smartphone className="w-4 h-4 text-indigo-600" />
							<span>Visitor Device Breakdown</span>
						</h3>
						<p className="text-[11px] sm:text-xs text-gray-500 mb-4 sm:mb-6">Percentage of mobile vs. desktop prospective clients</p>

						<div className="space-y-3 sm:space-y-6 pt-1 sm:pt-2">
							{/* Mobile */}
							<div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
										<Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-gray-900">Mobile Devices</h4>
										<p className="text-[10px] sm:text-[11px] text-gray-500">Smartphones & WhatsApp Browsers</p>
									</div>
								</div>
								<span className="text-lg sm:text-xl font-bold font-nohemi text-gray-900">
									{data?.deviceSplit?.mobile || 70}%
								</span>
							</div>

							{/* Desktop */}
							<div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
										<Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-gray-900">Desktop & Laptop</h4>
										<p className="text-[10px] sm:text-[11px] text-gray-500">High-resolution desktop browsers</p>
									</div>
								</div>
								<span className="text-lg sm:text-xl font-bold font-nohemi text-gray-900">
									{data?.deviceSplit?.desktop || 30}%
								</span>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
