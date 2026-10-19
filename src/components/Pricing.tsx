/**
 * Pricing
 *
 * Fullscreen Scroll-Driven Pricing Showcase:
 * - Fully responsive across all mobile, tablet, and desktop screen sizes.
 * - One prominent large Lottie animation + One prominent pricing card displayed at a time.
 * - Zero card background on Lottie for seamless integration.
 * - On vertical scroll, pins and smoothly moves to the next pair:
 *   1. Landing Page + /lotties/A small shop.json
 *   2. Sales Funnel + /lotties/funnel.json
 *   3. E-commerce Store + /lotties/shopping Ecommerce.json
 * - Clean solid dark styling with zero gradients and PillButton CTAs.
 *
 * @format
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";
import PillButton from "./PillButton";
import LottiePlayer from "./LottiePlayer";
import { useCurrency } from "@/context/CurrencyContext";

export interface PricingTier {
	id: string;
	/** plan key matching BASE_PRICES_USD */
	planKey: "landing" | "funnel" | "store";
	name: string;
	subtitle: string;
	description: string;
	features: string[];
	cta: string;
	featured: boolean;
	lottieSrc: string;
}

const tiers: PricingTier[] = [
	{
		id: "landing-page",
		planKey: "landing",
		name: "Landing Page",
		subtitle: "High-Converting Single Page",
		description: "Custom single-page website engineered for rapid lead generation and immediate launch.",
		features: [
			"Custom responsive single page design",
			"Ultra-fast loading & mobile optimization",
			"Direct contact form & WhatsApp integration",
			"Domain connection & secure hosting setup",
		],
		cta: "Choose Landing Page",
		featured: false,
		lottieSrc: "/lotties/A small shop.json",
	},
	{
		id: "sales-funnel",
		planKey: "funnel",
		name: "Sales Funnel",
		subtitle: "Multi-Step Conversion Engine",
		description: "Strategic multi-page funnel engineered to qualify prospects and convert them into clients.",
		features: [
			"Up to 5 custom high-impact conversion pages",
			"Automated CRM & lead capture workflows",
			"Advanced SEO & analytics tracking setup",
			"Priority revisions & 14-day dedicated support",
		],
		cta: "Choose Sales Funnel",
		featured: true,
		lottieSrc: "/lotties/funnel.json",
	},
	{
		id: "ecommerce-store",
		planKey: "store",
		name: "E-commerce Store",
		subtitle: "Full-Featured Digital Shop",
		description: "Complete online storefront with seamless checkout, payment processing, and inventory management.",
		features: [
			"Full product catalog & variation management",
			"Card, bank transfer & mobile money payments",
			"Automated customer order confirmation emails",
			"Dedicated store launch & owner onboarding",
		],
		cta: "Choose E-commerce",
		featured: false,
		lottieSrc: "/lotties/shopping Ecommerce.json",
	},
];

export default function Pricing() {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"monthly",
	);
	const [activeIndex, setActiveIndex] = useState(0);
	const { formatPlanPrice, currency, isLoading } = useCurrency();

	const sectionRef = useRef<HTMLElement | null>(null);
	const pinContainerRef = useRef<HTMLDivElement | null>(null);
	const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

	// Setup GSAP Pinning for Desktop only using matchMedia
	useEffect(() => {
		if (typeof window === "undefined") return;
		gsap.registerPlugin(ScrollTrigger);

		const section = sectionRef.current;
		if (!section) return;

		const mm = gsap.matchMedia();

		// Desktop ONLY (min-width: 1024px): Fullscreen scroll-pinned presentation
		mm.add("(min-width: 1024px)", () => {
			const st = ScrollTrigger.create({
				trigger: section,
				pin: true,
				anticipatePin: 1,
				start: "top top",
				end: () => `+=${Math.round(window.innerHeight * 2.2)}`,
				scrub: 0.5,
				invalidateOnRefresh: true,
				onUpdate: (self) => {
					const p = self.progress;
					// Generous, comfortable resting ranges for each tier:
					// 0.00 - 0.35: Tier 0 (Landing Page)
					// 0.35 - 0.70: Tier 1 (Sales Funnel)
					// 0.70 - 1.00: Tier 2 (E-commerce Store)
					let idx = 0;
					if (p >= 0.7) {
						idx = 2;
					} else if (p >= 0.35) {
						idx = 1;
					} else {
						idx = 0;
					}
					setActiveIndex((prev) => (prev === idx ? prev : idx));
				},
			});

			scrollTriggerRef.current = st;

			return () => {
				st.kill();
				scrollTriggerRef.current = null;
			};
		});

		return () => {
			mm.revert();
		};
	}, []);

	// Handle tier selection via tab click (syncs scroll position on desktop)
	const handleSelectTier = (index: number) => {
		setActiveIndex(index);
		const st = scrollTriggerRef.current;
		if (st && typeof window !== "undefined" && window.innerWidth >= 1024) {
			const targetProgress = index === 0 ? 0.15 : index === 1 ? 0.52 : 0.85;
			const targetScroll = st.start + targetProgress * (st.end - st.start);
			window.scrollTo({
				top: targetScroll,
				behavior: "smooth",
			});
		}
	};

	const touchStartXRef = useRef<number | null>(null);

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartXRef.current = e.touches[0].clientX;
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (touchStartXRef.current === null) return;
		const touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartXRef.current - touchEndX;
		// Minimum 45px swipe distance
		if (diff > 45 && activeIndex < tiers.length - 1) {
			handleSelectTier(activeIndex + 1);
		} else if (diff < -45 && activeIndex > 0) {
			handleSelectTier(activeIndex - 1);
		}
		touchStartXRef.current = null;
	};

	return (
		<div className="pricing-wrapper">
			<section
				id="pricing"
				ref={sectionRef}
				tabIndex={0}
				aria-label="Pricing Packages"
				className="relative w-full bg-[#0a0c10] text-white overflow-hidden select-none">
				{/* Visible Price-Related Minimal Floating Background */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
					{/* Ambient Glow */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-[radial-gradient(circle,_rgba(37,99,235,0.12)_0%,_rgba(10,12,16,0)_70%)] blur-3xl" />

					{/* Floating Large Currency & Value Glyphs */}
					<div className="absolute top-12 left-8 sm:left-16 text-7xl sm:text-9xl font-extrabold text-blue-500/[0.07] font-thunder-lc -rotate-12 select-none">
						$
					</div>
					<div className="absolute bottom-16 right-8 sm:right-20 text-7xl sm:text-9xl font-extrabold text-emerald-500/[0.07] font-thunder-lc rotate-12 select-none">
						%
					</div>

					{/* Minimal Concentric Structure */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] sm:w-[900px] h-[760px] sm:h-[900px] border border-blue-500/10 rounded-full" />
				</div>

				{/* Fullscreen / Adaptive Stage */}
				<div
					ref={pinContainerRef}
					className="relative z-10 w-full min-h-screen flex flex-col justify-between py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
					{/* Top Header & Toggle */}
					<div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6 border-b border-white/10 pb-4 sm:pb-5 shrink-0 relative z-20">
						<div>
							<h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-nohemi uppercase">
								SIMPLE PRICING.{" "}
								<span className="text-blue-400">ZERO SURPRISES.</span>
							</h2>
						</div>

						{/* Right: Billing Cycle Toggle */}
						<div className="inline-flex items-center p-1 rounded-full bg-[#161922] border border-white/15 self-start sm:self-auto shrink-0">
							<button
								type="button"
								onClick={() => setBillingCycle("monthly")}
								className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
									billingCycle === "monthly"
										? "bg-white text-[#0a0a0a] shadow-sm"
										: "text-slate-400 hover:text-white"
								}`}>
								Monthly
							</button>

							<button
								type="button"
								onClick={() => setBillingCycle("yearly")}
								className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
									billingCycle === "yearly"
										? "bg-white text-[#0a0a0a] shadow-sm"
										: "text-slate-400 hover:text-white"
								}`}>
								<span>Yearly</span>
								<span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold uppercase">
									-20%
								</span>
							</button>
						</div>
					</div>

					{/* Interactive Tier Quick Tabs (Synced on both desktop and mobile) */}
					<div
						role="tablist"
						aria-label="Pricing plan tiers"
						className="flex items-center justify-center gap-2 pt-3 sm:pt-4 shrink-0 z-20">
						{tiers.map((t, i) => (
							<button
								key={t.id}
								role="tab"
								aria-selected={i === activeIndex}
								aria-controls={`tier-panel-${t.id}`}
								type="button"
								onClick={() => handleSelectTier(i)}
								className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
									i === activeIndex
										? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
										: "bg-white/10 text-white/70 hover:text-white hover:bg-white/15"
								}`}>
								<span>{t.name}</span>
								{t.featured && (
									<span className="hidden sm:inline-block text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 font-extrabold">
										Popular
									</span>
								)}
							</button>
						))}
					</div>

					{/* Main Stage: 1 Lottie Showcase + 1 Pricing Card with Touch Swiping */}
					<div
						onTouchStart={handleTouchStart}
						onTouchEnd={handleTouchEnd}
						className="w-full flex-1 relative flex items-center justify-center my-3 sm:my-6 min-h-[440px] sm:min-h-[500px]">
						{tiers.map((tier, idx) => {
							const isVisible = idx === activeIndex;
							const price = formatPlanPrice(tier.planKey, billingCycle);
							const period =
								billingCycle === "yearly" ? "/ year" : "/ month";

							return (
								<div
									key={tier.id}
									aria-hidden={!isVisible}
									style={{
										opacity: isVisible ? 1 : 0,
										transform: isVisible
											? "translateY(0) scale(1)"
											: idx < activeIndex
											? "translateY(-24px) scale(0.97)"
											: "translateY(24px) scale(0.97)",
										pointerEvents: isVisible ? "auto" : "none",
										transition:
											"opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
									}}
									className={`w-full flex-col items-center justify-center gap-2 sm:gap-6 lg:gap-12 xl:gap-16 ${
										isVisible ? "flex" : "hidden lg:flex"
									} ${
										isVisible
											? "relative lg:absolute lg:inset-0"
											: "absolute inset-0"
									} ${idx === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
									{/* Left: Extra Large Borderless Lottie Animation Showcase */}
									<div className="w-full lg:w-1/2 flex items-center justify-center shrink-0">
										<div className="w-full max-w-[220px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[640px] h-[120px] xs:h-[150px] sm:h-[260px] md:h-[340px] lg:h-[440px] xl:h-[480px] flex items-center justify-center p-1 sm:p-2">
											<LottiePlayer
												src={tier.lottieSrc}
												className="w-full h-full object-contain flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full"
												loop={true}
												autoplay={true}
											/>
										</div>
									</div>

									{/* Right: Prominent Pricing Card */}
									<div className="w-full lg:w-1/2 flex items-center justify-center">
										<div
											className={`w-full max-w-[320px] sm:max-w-[440px] lg:max-w-[480px] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col justify-between transition-all duration-300 ${
												tier.featured
													? "bg-[#141824] border-2 border-blue-600 shadow-2xl shadow-blue-600/10"
													: "bg-[#11131a] border border-white/15 shadow-2xl shadow-black/60"
											}`}>
											<div>
												{/* Plan Name & Tag */}
												<div className="flex items-center justify-between mb-1.5 sm:mb-2">
													<h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-nohemi">
														{tier.name}
													</h3>
													{tier.featured && (
														<span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-600 text-white">
															Featured
														</span>
													)}
												</div>

												<p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
													{tier.description}
												</p>

												{/* Price Display */}
												<div className="mb-4 sm:mb-5">
													<div className="flex items-baseline gap-2 sm:gap-2.5">
														<span className="text-2xl sm:text-3xl md:text-4xl font-medium text-white tracking-tight font-nohemi">
															{isLoading ? (
																<span className="inline-block w-28 h-8 rounded-lg bg-white/10 animate-pulse" />
															) : (
																price
															)}
														</span>
														<span className="text-[10px] sm:text-xs text-slate-400 font-normal uppercase tracking-wider">
															{period}
														</span>
													</div>
												</div>

												{/* Feature Checklist */}
												<ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6">
													{tier.features.map((feat) => (
														<li
															key={feat}
															className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-200">
															<div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
																<Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
															</div>
															<span>{feat}</span>
														</li>
													))}
												</ul>
											</div>

											{/* Call To Action Button */}
											<div>
												<PillButton
													href={`/checkout?plan=${tier.id}&billing=${billingCycle}`}
													baseColor={tier.featured ? "#004ac6" : "#ffffff"}
													circleColor={tier.featured ? "#ffffff" : "#004ac6"}
													textColor={tier.featured ? "#ffffff" : "#0a0a0a"}
													hoverTextColor={tier.featured ? "#0a0a0a" : "#ffffff"}
													useThunderFont={true}
													className={`w-full py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-xl cursor-pointer ${
														tier.featured
															? "border-2 border-blue-600"
															: "border-2 border-white hover:border-blue-600"
													}`}>
													{tier.cta}
												</PillButton>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Mobile Swipe Pagination Dots */}
					<div className="flex lg:hidden items-center justify-center gap-2 pt-2 pb-1 shrink-0 z-20">
						{tiers.map((t, i) => (
							<button
								key={`dot-${t.id}`}
								type="button"
								onClick={() => handleSelectTier(i)}
								aria-label={`Go to ${t.name}`}
								className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
									i === activeIndex
										? "w-7 bg-blue-500 shadow-sm shadow-blue-500/50"
										: "w-2 bg-white/25 hover:bg-white/40"
								}`}
							/>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
