/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	TrendingUp,
	Users,
	MessageCircle,
	ArrowUpRight,
	Smartphone,
	Monitor,
	Globe,
	RefreshCw,
	ArrowLeft,
	Calendar,
	Sparkles,
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
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-600 selection:text-white">
			{/* Top Navbar */}
			<header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-6 sm:px-10 py-4 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard"
						className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
						<ArrowLeft className="w-4 h-4" />
					</Link>
					<div>
						<h1 className="text-lg sm:text-xl font-bold font-nohemi text-gray-900 tracking-tight flex items-center gap-2">
							<span>Website Traffic & Lead Analytics</span>
							<span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
								Live
							</span>
						</h1>
						<p className="text-xs text-gray-500">
							Real-time visitors, engagement, and WhatsApp customer conversions
						</p>
					</div>
				</div>

				{/* Range Switcher */}
				<div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 border border-gray-200/80 text-xs font-semibold">
					{(["7d", "14d", "30d"] as const).map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => setRange(r)}
							className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
								range === r ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-500 hover:text-gray-900"
							}`}>
							{r === "7d" ? "7 Days" : r === "14d" ? "14 Days" : "30 Days"}
						</button>
					))}
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 sm:px-10 pt-8 space-y-8">
				{/* KPI Cards Row */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{/* Card 1: Page Views */}
					<div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Page Views</span>
							<div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
								<Activity className="w-4 h-4" />
							</div>
						</div>
						<div>
							<div className="text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-1">
								{isLoading ? "..." : overview.totalPageViews.toLocaleString()}
							</div>
							<p className="text-[11px] text-gray-500">Total visits recorded in period</p>
						</div>
					</div>

					{/* Card 2: Unique Visitors */}
					<div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unique Visitors</span>
							<div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
								<Users className="w-4 h-4" />
							</div>
						</div>
						<div>
							<div className="text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-1">
								{isLoading ? "..." : overview.uniqueVisitors.toLocaleString()}
							</div>
							<p className="text-[11px] text-gray-500">Distinct prospective customers</p>
						</div>
					</div>

					{/* Card 3: WhatsApp Inquiries */}
					<div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp Leads</span>
							<div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
								<MessageCircle className="w-4 h-4" />
							</div>
						</div>
						<div>
							<div className="text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-1">
								{isLoading ? "..." : overview.whatsappClicks.toLocaleString()}
							</div>
							<p className="text-[11px] text-gray-500">Direct WhatsApp chats initiated</p>
						</div>
					</div>

					{/* Card 4: WhatsApp Conversion Rate */}
					<div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
						<div className="flex items-center justify-between mb-4">
							<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conversion Rate</span>
							<div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
								<Zap className="w-4 h-4" />
							</div>
						</div>
						<div>
							<div className="text-3xl font-extrabold font-nohemi text-gray-900 tracking-tight mb-1 text-emerald-600">
								{isLoading ? "..." : overview.conversionRate}
							</div>
							<p className="text-[11px] text-gray-500">Visitors converting into inquiries</p>
						</div>
					</div>
				</div>

				{/* Interactive Daily Traffic Chart */}
				<div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h3 className="text-base sm:text-lg font-bold font-nohemi text-gray-900">
								Visitor Traffic & WhatsApp Conversions
							</h3>
							<p className="text-xs text-gray-500">
								Daily comparison of total views vs. WhatsApp chat leads generated
							</p>
						</div>

						{/* Legend */}
						<div className="flex items-center gap-4 text-xs font-semibold">
							<div className="flex items-center gap-1.5">
								<div className="w-3 h-3 rounded-full bg-blue-600" />
								<span className="text-gray-600">Page Views</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="w-3 h-3 rounded-full bg-emerald-500" />
								<span className="text-gray-600">WhatsApp Leads</span>
							</div>
						</div>
					</div>

					{/* Chart Grid */}
					<div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-4 pt-6 border-b border-gray-100">
						{daily.map((day) => {
							const viewHeightPercent = Math.max(6, Math.min(100, Math.round((day.pageViews / maxViews) * 100)));
							const leadHeightPercent = Math.max(0, Math.min(100, Math.round((day.whatsappClicks / maxViews) * 100)));

							return (
								<div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
									{/* Hover Tooltip */}
									<div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 pointer-events-none whitespace-nowrap z-20 shadow-lg">
										<p className="font-bold">{day.label}</p>
										<p className="text-blue-300">{day.pageViews} views</p>
										<p className="text-emerald-300">{day.whatsappClicks} WhatsApp chats</p>
									</div>

									{/* Dual Bars */}
									<div className="w-full flex items-end justify-center gap-1 h-full">
										{/* Page Views Bar */}
										<div
											style={{ height: `${viewHeightPercent}%` }}
											className="w-1/2 max-w-[20px] bg-blue-600 group-hover:bg-blue-700 rounded-t-md transition-all duration-300"
										/>
										{/* WhatsApp Lead Bar */}
										<div
											style={{ height: `${leadHeightPercent}%` }}
											className="w-1/2 max-w-[20px] bg-emerald-500 group-hover:bg-emerald-600 rounded-t-md transition-all duration-300"
										/>
									</div>

									{/* Bottom Date Label */}
									<span className="text-[10px] font-mono text-gray-400 mt-2 truncate w-full text-center">
										{day.label}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Two-Column Breakdown: Devices & Traffic Sources */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Traffic Sources */}
					<div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
						<h3 className="text-base font-bold font-nohemi text-gray-900 mb-1 flex items-center gap-2">
							<Globe className="w-4 h-4 text-blue-600" />
							<span>Top Traffic Sources</span>
						</h3>
						<p className="text-xs text-gray-500 mb-6">Where your website visitors are discovering you</p>

						<div className="space-y-4">
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
								<div className="text-center py-8 text-gray-400 text-xs">
									Traffic referrers will appear as visitors arrive at your website.
								</div>
							)}
						</div>
					</div>

					{/* Device Distribution */}
					<div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
						<h3 className="text-base font-bold font-nohemi text-gray-900 mb-1 flex items-center gap-2">
							<Smartphone className="w-4 h-4 text-indigo-600" />
							<span>Visitor Device Breakdown</span>
						</h3>
						<p className="text-xs text-gray-500 mb-6">Percentage of mobile vs. desktop prospective clients</p>

						<div className="space-y-6 pt-2">
							{/* Mobile */}
							<div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
										<Smartphone className="w-5 h-5" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-gray-900">Mobile Devices</h4>
										<p className="text-[11px] text-gray-500">Smartphones & WhatsApp Browsers</p>
									</div>
								</div>
								<span className="text-xl font-bold font-nohemi text-gray-900">
									{data?.deviceSplit?.mobile || 70}%
								</span>
							</div>

							{/* Desktop */}
							<div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
										<Monitor className="w-5 h-5" />
									</div>
									<div>
										<h4 className="text-xs font-bold text-gray-900">Desktop & Laptop</h4>
										<p className="text-[11px] text-gray-500">High-resolution desktop browsers</p>
									</div>
								</div>
								<span className="text-xl font-bold font-nohemi text-gray-900">
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
