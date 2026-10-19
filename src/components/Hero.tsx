/** @format */

"use client";

import React from "react";
import PillButton from "./PillButton";
import LottiePlayer from "./LottiePlayer";
import ScrollReveal from "./ScrollReveal";
import { Clock, ShieldCheck, Lock } from "lucide-react";

interface StaggerTextProps {
	text: string;
	className?: string;
	delay?: number;
	staggerDuration?: number;
}

function StaggerText({
	text,
	className = "",
	delay = 0,
	staggerDuration = 0.08,
}: StaggerTextProps) {
	return (
		<span className={`inline-flex whitespace-nowrap ${className}`}>
			{text.split("").map((char, index) => (
				<span
					key={`${char}-${index}`}
					className="inline-block will-change-transform"
					style={{
						animation: "staggerWave 3s cubic-bezier(0.45, 0, 0.55, 1) infinite",
						animationDelay: `${delay + index * staggerDuration}s`,
					}}>
					{char === " " ? "\u00A0" : char}
				</span>
			))}
		</span>
	);
}

function Sparkle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			style={style}
			aria-hidden="true">
			<path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
		</svg>
	);
}

function CurvedUnderline({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 260 22"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			preserveAspectRatio="none"
			aria-hidden="true">
			<path
				d="M3 14C48 3 98 22 145 10C190 -1 228 16 257 8"
				stroke="currentColor"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export default function Hero() {
	return (
		<section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-40 md:pb-28 bg-white overflow-hidden">
			<style
				dangerouslySetInnerHTML={{
					__html: `
						@keyframes staggerWave {
							0%, 45%, 100% {
								-webkit-transform: translate3d(0, 0px, 0);
								transform: translate3d(0, 0px, 0);
							}
							20% {
								-webkit-transform: translate3d(0, -7px, 0);
								transform: translate3d(0, -7px, 0);
							}
						}
						@keyframes watermarkFloat {
							0%, 100% {
								-webkit-transform: translate3d(0, 0px, 0) rotate(0deg);
								transform: translate3d(0, 0px, 0) rotate(0deg);
							}
							50% {
								-webkit-transform: translate3d(0, -12px, 0) rotate(0.8deg);
								transform: translate3d(0, -12px, 0) rotate(0.8deg);
							}
						}
						@keyframes watermarkFloatRev {
							0%, 100% {
								-webkit-transform: translate3d(0, 0px, 0) rotate(0deg);
								transform: translate3d(0, 0px, 0) rotate(0deg);
							}
							50% {
								-webkit-transform: translate3d(0, 12px, 0) rotate(-0.8deg);
								transform: translate3d(0, 12px, 0) rotate(-0.8deg);
							}
						}
						@keyframes spinDashed {
							from {
								-webkit-transform: rotate(0deg);
								transform: rotate(0deg);
							}
							to {
								-webkit-transform: rotate(360deg);
								transform: rotate(360deg);
							}
						}
						@keyframes pulseSparkle {
							0%, 100% {
								-webkit-transform: scale(0.85) rotate(0deg);
								transform: scale(0.85) rotate(0deg);
								opacity: 0.4;
							}
							50% {
								-webkit-transform: scale(1.15) rotate(15deg);
								transform: scale(1.15) rotate(15deg);
								opacity: 0.9;
							}
						}
					`,
				}}
			/>

			{/* Architectural Geometric Grid Background */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

			{/* Design Lines & Technical Crosshairs */}
			<div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
				{/* Top radiant hairline accent */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
				
				{/* Coordinate Grid Crosshairs */}
				<span className="absolute top-12 left-8 sm:left-14 font-mono text-[13px] font-bold text-blue-400/40">+</span>
				<span className="absolute top-20 right-10 sm:right-24 font-mono text-[13px] font-bold text-blue-400/40">+</span>
				<span className="absolute bottom-16 left-12 sm:left-28 font-mono text-[13px] font-bold text-blue-400/30">+</span>
				<span className="absolute bottom-24 right-16 sm:right-32 font-mono text-[13px] font-bold text-blue-400/30">+</span>

				{/* Floating Geometric Sparkles */}
				<div
					className="absolute top-24 left-[12%] text-blue-500 hidden sm:block"
					style={{ animation: "pulseSparkle 4s ease-in-out infinite" }}>
					<Sparkle className="w-5 h-5 text-blue-500/60" />
				</div>
				<div
					className="absolute top-36 right-[8%] text-indigo-500 hidden md:block"
					style={{ animation: "pulseSparkle 5s ease-in-out infinite", animationDelay: "1.5s" }}>
					<Sparkle className="w-4 h-4 text-indigo-500/50" />
				</div>
				<div
					className="absolute bottom-32 left-[6%] text-cyan-500 hidden lg:block"
					style={{ animation: "pulseSparkle 4.5s ease-in-out infinite", animationDelay: "2.5s" }}>
					<Sparkle className="w-3.5 h-3.5 text-cyan-500/50" />
				</div>
			</div>

			{/* Ambient Glowing Blobs */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
				<div className="absolute -top-32 -left-32 w-[540px] h-[540px] rounded-full bg-[radial-gradient(circle,_rgba(0,74,198,0.1)_0%,_rgba(0,74,198,0)_60%)] blur-3xl" />
				<div className="absolute top-20 right-0 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.06)_0%,_rgba(99,102,241,0)_60%)] blur-2xl" />
			</div>

			{/* Watermark Animated Shops & Stores Layer */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
				{/* 1. Ambient Shopfront Watermark (Left side - desktop only) */}
				<div
					className="absolute -top-8 -left-8 sm:left-4 md:left-8 w-72 h-72 sm:w-96 sm:h-96 opacity-[0.08] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none hidden md:block"
					style={{ animation: "watermarkFloat 12s ease-in-out infinite" }}>
					<LottiePlayer
						src="/lotties/A small shop.json"
						className="w-full h-full object-contain filter grayscale"
						speed={0.6}
						autoplay={true}
						loop={true}
					/>
				</div>

				{/* 2. Ambient Ecommerce & Shopping Watermark (Center / Right Background - desktop only) */}
				<div
					className="absolute top-1/4 right-6 sm:right-20 md:right-36 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.06] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none hidden md:block"
					style={{
						animation: "watermarkFloatRev 14s ease-in-out infinite",
						animationDelay: "2s",
					}}>
					<LottiePlayer
						src="/lotties/shopping Ecommerce.json"
						className="w-full h-full object-contain filter grayscale"
						speed={0.6}
						autoplay={true}
						loop={true}
					/>
				</div>

				{/* 3. Ambient Store Growth / Funnel Watermark (Bottom Center) */}
				<div
					className="absolute -bottom-10 left-1/3 w-60 h-60 sm:w-72 sm:h-72 opacity-[0.05] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none hidden sm:block"
					style={{
						animation: "watermarkFloat 16s ease-in-out infinite",
						animationDelay: "4s",
					}}>
					<LottiePlayer
						src="/lotties/funnel.json"
						className="w-full h-full object-contain filter grayscale"
						speed={0.5}
						autoplay={true}
						loop={true}
					/>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
					{/* Left Column: Simplified Headlines & CTAs */}
					<div className="lg:col-span-5 space-y-6 sm:space-y-7 text-center lg:text-left">
						{/* Main Headline */}
						<ScrollReveal direction="up" delay={80}>
							<div className="relative">
								<h1 className="text-3xl xs:text-3.5xl sm:text-5xl md:text-5.5xl lg:text-6xl font-bold font-nohemi tracking-tight text-gray-900 leading-[1.15] sm:leading-[1.08] break-words">
									WE BUILD YOUR <StaggerText text="WEBSITE." delay={0} staggerDuration={0.07} />{" "}
									<span className="text-blue-600">
										YOU GROW YOUR{" "}
										<span className="relative inline-block whitespace-nowrap">
											<StaggerText text="BUSINESS." delay={0.7} staggerDuration={0.07} />
											<CurvedUnderline className="absolute -bottom-1.5 sm:-bottom-2 md:-bottom-2.5 left-0 w-full h-[9px] sm:h-[12px] md:h-[15px] text-blue-500 pointer-events-none" />
										</span>
									</span>
								</h1>
							</div>
						</ScrollReveal>

						{/* Sub-headline */}
						<ScrollReveal direction="up" delay={160}>
							<p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
								<span className="text-gray-900 font-bold">Helping businesses get found and chosen.</span> We design, launch, and host high-converting landing pages and online stores for you in 3–5 days.
							</p>
						</ScrollReveal>

						{/* Action Buttons */}
						<ScrollReveal direction="up" delay={240}>
							<div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-1">
								<PillButton
									href="/get-started"
									baseColor="#004ac6"
									circleColor="#ffffff"
									textColor="#ffffff"
									hoverTextColor="#004ac6"
									useThunderFont={true}
									className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg shadow-blue-600/20 cursor-pointer text-center">
									Get Started
								</PillButton>

								<PillButton
									href="/services"
									baseColor="#ffffff"
									circleColor="#004ac6"
									textColor="#0f172a"
									hoverTextColor="#ffffff"
									className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base border-2 border-gray-200 hover:border-blue-600 shadow-2xs cursor-pointer text-center">
									View Pricing →
								</PillButton>
							</div>
						</ScrollReveal>

						{/* Value Props Strip */}
						<ScrollReveal direction="up" delay={320}>
							<div className="pt-6 sm:pt-7 border-t border-gray-200/80 flex flex-wrap justify-center lg:justify-start items-center gap-5 sm:gap-7 text-gray-700">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
										<Clock className="w-5 h-5" />
									</div>
									<div className="text-left">
										<p className="text-xs sm:text-sm font-bold text-gray-900">3–5 Days</p>
										<p className="text-[11px] text-gray-500 font-medium">Fast Turnaround</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
										<ShieldCheck className="w-5 h-5" />
									</div>
									<div className="text-left">
										<p className="text-xs sm:text-sm font-bold text-gray-900">100% Yours</p>
										<p className="text-[11px] text-gray-500 font-medium">Brand & Content</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
										<Lock className="w-5 h-5" />
									</div>
									<div className="text-left">
										<p className="text-xs sm:text-sm font-bold text-gray-900">Hosting Included</p>
										<p className="text-[11px] text-gray-500 font-medium">SSL & Maintenance</p>
									</div>
								</div>
							</div>
						</ScrollReveal>
					</div>

					{/* Right Column: Massive Prominent Transparent Lottie with Rotating Dashed Rings */}
					<div className="lg:col-span-7 flex items-center justify-center relative mt-4 lg:mt-0">
						{/* Ambient Rotating Dashed Orbit Ring */}
						<div
							className="absolute w-[260px] h-[260px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px] rounded-full border border-dashed border-blue-200/50 pointer-events-none"
							style={{ animation: "spinDashed 40s linear infinite" }}
						/>

						{/* Secondary Concentric Dashed Ring */}
						<div
							className="absolute w-[200px] h-[200px] sm:w-[380px] sm:h-[380px] rounded-full border border-dashed border-indigo-200/35 pointer-events-none"
							style={{ animation: "spinDashed 30s linear infinite reverse" }}
						/>

						<ScrollReveal direction="up" delay={150}>
							<div className="relative w-full max-w-[620px] lg:max-w-none h-[280px] xs:h-[340px] sm:h-[460px] md:h-[520px] lg:h-[580px] flex items-center justify-center overflow-visible">
								<LottiePlayer
									src="/lotties/Business Analysis.json"
									className="w-full h-full object-contain scale-110 sm:scale-120 md:scale-125 lg:scale-130"
									speed={1}
									autoplay={true}
									loop={true}
								/>
							</div>
						</ScrollReveal>
					</div>
				</div>
			</div>
		</section>
	);
}
