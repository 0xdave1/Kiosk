/** @format */

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import PillButton from "@/components/PillButton";
import ScrollReveal from "@/components/ScrollReveal";
import {
	Globe,
	Search,
	Sparkles,
	ArrowUpRight,
	CheckCircle2,
	ShoppingBag,
	Zap,
	Layers,
	Clock,
	ShieldCheck,
	Filter,
	ExternalLink,
} from "lucide-react";

export interface LaunchedBusiness {
	id: string;
	businessName: string;
	tagline: string;
	category: string;
	tier: string;
	description: string;
	thumbnailUrl: string;
	websiteUrl: string;
	status: string;
	deliveryDays: string;
	features: string[];
	featured?: boolean;
}

interface ShowcaseClientProps {
	businesses: LaunchedBusiness[];
}

const CATEGORIES = [
	"All",
	"E-Commerce",
	"Professional Services",
	"Creative Studios",
	"Food & Hospitality",
	"Health & Fitness",
];

export default function ShowcaseClient({ businesses }: ShowcaseClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");

	const filteredBusinesses = useMemo(() => {
		return businesses.filter((b) => {
			const matchesCategory =
				activeCategory === "All" || b.category.toLowerCase() === activeCategory.toLowerCase();
			const query = searchQuery.toLowerCase().trim();
			const matchesQuery =
				!query ||
				b.businessName.toLowerCase().includes(query) ||
				b.tagline.toLowerCase().includes(query) ||
				b.description.toLowerCase().includes(query) ||
				b.category.toLowerCase().includes(query);
			return matchesCategory && matchesQuery;
		});
	}, [businesses, activeCategory, searchQuery]);

	return (
		<div className="w-full min-h-screen bg-[#f8fafc]">
			{/* Architectural Geometric Grid Background */}
			<div className="absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

			{/* Hero Section */}
			<section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
					{/* Eyebrow Pill */}
					<ScrollReveal direction="up" delay={60}>
						<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/90 shadow-2xs mb-6">
							<span className="flex h-2 w-2 relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
							</span>
							<span className="text-xs sm:text-sm font-bold text-blue-700 tracking-wide uppercase">
								Helping businesses get found and chosen
							</span>
						</div>
					</ScrollReveal>

					{/* Main Headline */}
					<ScrollReveal direction="up" delay={120}>
						<h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold font-nohemi tracking-tight text-gray-900 leading-[1.12] mb-6 max-w-4xl mx-auto">
							BUSINESSES & WEBSITES{" "}
							<span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">
								LAUNCHED ON KIOOSK
							</span>
						</h1>
					</ScrollReveal>

					{/* Sub-headline */}
					<ScrollReveal direction="up" delay={180}>
						<p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium mb-10">
							Explore real websites engineered, built, and hosted on Kioosk. Every business below is live,
							attracting traffic, and winning customers through tailored digital experiences.
						</p>
					</ScrollReveal>

					{/* Value Props Strip */}
					<ScrollReveal direction="up" delay={240}>
						<div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
							<div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
									<Clock className="w-4 h-4" />
								</div>
								<div>
									<p className="text-xs font-bold text-gray-900">3–5 Days</p>
									<p className="text-[11px] text-gray-500 font-medium">Fast Turnaround</p>
								</div>
							</div>

							<div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
									<Globe className="w-4 h-4" />
								</div>
								<div>
									<p className="text-xs font-bold text-gray-900">Live & Hosted</p>
									<p className="text-[11px] text-gray-500 font-medium">99.9% Uptime Cloud</p>
								</div>
							</div>

							<div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
									<ShieldCheck className="w-4 h-4" />
								</div>
								<div>
									<p className="text-xs font-bold text-gray-900">1 Sub = 1 Website</p>
									<p className="text-[11px] text-gray-500 font-medium">Dedicated Quality</p>
								</div>
							</div>

							<div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
									<Sparkles className="w-4 h-4" />
								</div>
								<div>
									<p className="text-xs font-bold text-gray-900">Found & Chosen</p>
									<p className="text-[11px] text-gray-500 font-medium">Built to Convert</p>
								</div>
							</div>
						</div>
					</ScrollReveal>
				</div>
			</section>

			{/* Main Showcase Section */}
			<section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Controls Bar: Search & Category Filter */}
				<div className="bg-white border border-gray-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs mb-10 space-y-4">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Search Input */}
						<div className="relative flex-1 max-w-md">
							<Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="Search by business name, keyword, or industry..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="text-xs text-gray-400 hover:text-gray-600 absolute right-3.5 top-1/2 -translate-y-1/2">
									Clear
								</button>
							)}
						</div>

						{/* Total Count Badge */}
						<div className="flex items-center gap-2 text-xs font-bold text-gray-500 shrink-0">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
							<span>Showing {filteredBusinesses.length} Launched Businesses</span>
						</div>
					</div>

					{/* Category Tabs */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-gray-100">
						{CATEGORIES.map((cat) => {
							const isSelected = activeCategory === cat;
							return (
								<button
									key={cat}
									onClick={() => setActiveCategory(cat)}
									className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
										isSelected
											? "bg-blue-600 text-white shadow-xs"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
									}`}>
									<span>{cat}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Empty State */}
				{filteredBusinesses.length === 0 && (
					<div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center space-y-4">
						<div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
							<Filter className="w-5 h-5" />
						</div>
						<h3 className="text-lg font-bold text-gray-900">No matching businesses found</h3>
						<p className="text-xs text-gray-500 max-w-sm mx-auto">
							We couldn't find any launched websites matching &ldquo;{searchQuery}&rdquo;. Try another
							search query or reset your filters.
						</p>
						<button
							onClick={() => {
								setSearchQuery("");
								setActiveCategory("All");
							}}
							className="px-5 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors">
							Reset Filters
						</button>
					</div>
				)}

				{/* Businesses Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{filteredBusinesses.map((biz) => {
						return (
							<article
								key={biz.id}
								className="group bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
								<div>
									{/* Browser Chrome Header & Thumbnail Frame */}
									<div className="relative overflow-hidden bg-slate-900">
										{/* Browser Bar */}
										<div className="px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 relative">
											<div className="flex items-center gap-1.5">
												<div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
												<div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
												<div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
											</div>

											{/* Mock URL Bar */}
											<div className="px-3 py-0.5 rounded-md bg-white/10 text-[10px] text-white/60 font-mono tracking-tight max-w-[180px] truncate">
												{biz.websiteUrl.startsWith("http")
													? biz.websiteUrl.replace(/https?:\/\//, "")
													: `${biz.id}.kioosk.site`}
											</div>

											{/* Live Ping Badge */}
											<span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
												<span>Live</span>
											</span>
										</div>

										{/* Thumbnail Image Container */}
										<div className="aspect-[16/10] relative w-full bg-slate-100 overflow-hidden">
											<Image
												src={biz.thumbnailUrl}
												alt={`${biz.businessName} live website thumbnail`}
												fill
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
											/>
											{/* Subtle Dark Gradient Overlay */}
											<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>
									</div>

									{/* Card Content Details */}
									<div className="p-6 space-y-4">
										{/* Badges: Category & Tier */}
										<div className="flex items-center justify-between gap-2">
											<span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
												{biz.category}
											</span>
											<span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
												{biz.tier}
											</span>
										</div>

										{/* Business Name & Tagline */}
										<div>
											<h3 className="text-xl font-bold font-nohemi text-gray-900 group-hover:text-blue-600 transition-colors">
												{biz.businessName}
											</h3>
											<p className="text-xs font-semibold text-gray-500 mt-0.5">
												{biz.tagline}
											</p>
										</div>

										{/* 20-Words Description Section */}
										<div className="pt-2 border-t border-gray-100">
											<div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
												<span>About the Business</span>
											</div>
											<p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed font-medium">
												{biz.description}
											</p>
										</div>

										{/* Features Strip */}
										<div className="flex flex-wrap gap-1.5 pt-1">
											{biz.features.map((feat, idx) => (
												<span
													key={idx}
													className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200/70 text-[10px] font-semibold text-gray-600">
													<CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
													<span>{feat}</span>
												</span>
											))}
										</div>
									</div>
								</div>

								{/* Bottom Card Action Footer */}
								<div className="p-6 pt-0 border-t border-gray-100 mt-4">
									<div className="flex items-center justify-between pt-4">
										<span className="text-[11px] font-bold text-gray-400">
											Delivered in {biz.deliveryDays}
										</span>

										<Link
											href={biz.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 group/btn transition-all">
											<span>Visit Website</span>
											<ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
										</Link>
									</div>
								</div>
							</article>
						);
					})}
				</div>

				{/* Bottom Launch CTA Banner */}
				<div className="mt-20 rounded-3xl bg-gradient-to-br from-[#003da8] via-[#004ac6] to-[#0a2558] text-white p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl">
					{/* Radiant Accent */}
					<div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

					<div className="max-w-3xl relative z-10 space-y-6 text-center sm:text-left">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-extrabold uppercase tracking-wider">
							<Sparkles className="w-3.5 h-3.5" />
							<span>Helping Businesses Get Found and Chosen</span>
						</div>

						<h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-nohemi tracking-tight text-white leading-tight">
							READY TO LAUNCH YOUR BUSINESS ON KIOOSK?
						</h2>

						<p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
							Stop losing customers to competitors who have better websites. We build your custom
							website, wire WhatsApp ordering, and host it for you in 3–5 days.
						</p>

						<div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
							<PillButton
								href="/get-started"
								baseColor="#ffffff"
								circleColor="#004ac6"
								textColor="#004ac6"
								hoverTextColor="#ffffff"
								useThunderFont={true}
								className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-base shadow-xl cursor-pointer text-center">
								Get Started Now
							</PillButton>

							<Link
								href="/services"
								className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm text-white/90 hover:text-white border-2 border-white/20 hover:border-white transition-all text-center">
								View Pricing & Plans →
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
