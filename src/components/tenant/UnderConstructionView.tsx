/** @format */

"use client";

import React, { useEffect, useState } from "react";
import {
	MessageCircle,
	Mail,
	Phone,
	ArrowUpRight,
	Activity,
	Radio,
	Sparkles,
} from "lucide-react";

export interface UnderConstructionProps {
	businessName: string;
	tagline?: string;
	logoUrl?: string | null;
	progress?: number;
	whatsapp?: string | null;
	contactEmail?: string | null;
	contactPhone?: string | null;
	tenantSlug?: string;
}

export default function UnderConstructionView({
	businessName,
	tagline,
	logoUrl,
	progress = 85,
	whatsapp,
	contactEmail,
	contactPhone,
	tenantSlug,
}: UnderConstructionProps) {
	const [timeString, setTimeString] = useState<string>("");

	useEffect(() => {
		const updateClock = () => {
			const now = new Date();
			const hours = String(now.getUTCHours()).padStart(2, "0");
			const minutes = String(now.getUTCMinutes()).padStart(2, "0");
			const seconds = String(now.getUTCSeconds()).padStart(2, "0");
			setTimeString(`${hours}:${minutes}:${seconds} UTC`);
		};

		updateClock();
		const interval = setInterval(updateClock, 1000);
		return () => clearInterval(interval);
	}, []);

	// WhatsApp clean link
	const cleanWhatsApp = (whatsapp || contactPhone || "").replace(/[^0-9]/g, "");
	const waLink = cleanWhatsApp
		? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
				`Hello ${businessName}, I am reaching out regarding your upcoming website launch.`,
		  )}`
		: null;

	return (
		<div className="relative min-h-screen w-full bg-[#08080a] text-zinc-100 flex flex-col justify-between overflow-hidden selection:bg-white selection:text-black font-sans">
			{/* Architectural Grid Background (No tacky gradients) */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.035]"
				style={{
					backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
					backgroundSize: "48px 48px",
				}}
			/>

			{/* Soft cinematic vignette */}
			<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080a_75%)]" />

			{/* Subtle central beam glow */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />

			{/* Top Bar: Technical Status & Live UTC Clock */}
			<header className="relative z-10 w-full px-6 py-5 sm:px-10 sm:py-7 flex items-center justify-between border-b border-white/[0.06] text-[11px] font-mono tracking-widest uppercase text-zinc-400">
				<div className="flex items-center gap-2.5">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
					</span>
					<span className="text-zinc-200 font-semibold">PRE-LAUNCH PHASE</span>
					<span className="hidden sm:inline text-zinc-600">{"//"}</span>
					<span className="hidden sm:inline text-zinc-500">BUILD {tenantSlug ? tenantSlug.toUpperCase() : "LIVE"}</span>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-zinc-400">
						<Activity className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
						<span className="tabular-nums font-medium">{timeString || "SYNCHRONIZING..."}</span>
					</div>
				</div>
			</header>

			{/* Center Hero: Cinematic Brand Reveal */}
			<main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-20 text-center max-w-4xl mx-auto w-full">
				
				{/* Brand Logo / Monogram Frame */}
				<div className="relative group mb-8 sm:mb-10">
					<div className="absolute -inset-1 rounded-3xl bg-white/[0.08] blur-sm transition-all duration-700 group-hover:bg-white/[0.14]" />
					<div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0f0f14] border border-white/[0.12] p-2 flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-md">
						{logoUrl ? (
							<img
								src={logoUrl}
								alt={businessName}
								className="w-full h-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-105"
							/>
						) : (
							<div className="w-full h-full rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl font-mono tracking-tight shadow-inner">
								{businessName ? businessName.trim().charAt(0).toUpperCase() : "★"}
							</div>
						)}
					</div>
				</div>

				{/* Category Badge */}
				<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-[11px] font-mono font-medium tracking-widest text-zinc-300 uppercase mb-6 backdrop-blur-sm">
					<Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
					<span>EXPERIENCE IN PRODUCTION</span>
				</div>

				{/* Title: Big, confident, cinematic */}
				<h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[1.05] max-w-3xl mb-6">
					{businessName}
				</h1>

				{/* Editorial Tagline */}
				<p className="text-sm sm:text-base md:text-lg text-zinc-400 font-normal max-w-xl mx-auto leading-relaxed mb-10 tracking-tight">
					{tagline ||
						"We are fine-tuning every detail of our digital flagship. Our public showcase is arriving shortly."}
				</p>

				{/* Progress & Launch Protocol Indicator */}
				<div className="w-full max-w-md bg-[#121216] border border-white/[0.08] rounded-2xl p-5 mb-10 text-left shadow-2xl backdrop-blur-sm">
					<div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase mb-3">
						<span className="text-zinc-400 flex items-center gap-1.5">
							<Sparkles className="w-3 h-3 text-zinc-400" />
							<span>Launch Readiness</span>
						</span>
						<span className="text-white font-bold tabular-nums">{progress}%</span>
					</div>

					{/* Precision Progress Bar */}
					<div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden p-0.5 border border-white/5">
						<div
							className="h-full bg-zinc-100 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.4)]"
							style={{ width: `${Math.max(10, Math.min(progress, 98))}%` }}
						/>
					</div>

					<div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
						<span>Stage: Quality Assurance</span>
						<span>Status: Final Polish</span>
					</div>
				</div>

				{/* Action CTAs */}
				<div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
					{waLink && (
						<a
							href={waLink}
							target="_blank"
							rel="noreferrer"
							className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98]">
							<MessageCircle className="w-4 h-4 fill-current" />
							<span>Inquire on WhatsApp</span>
							<ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
						</a>
					)}

					{contactEmail && (
						<a
							href={`mailto:${contactEmail}`}
							className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-zinc-200 text-xs font-bold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
							<Mail className="w-3.5 h-3.5 text-zinc-400" />
							<span>Email Team</span>
						</a>
					)}

					{contactPhone && !waLink && (
						<a
							href={`tel:${contactPhone}`}
							className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-zinc-200 text-xs font-bold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
							<Phone className="w-3.5 h-3.5 text-zinc-400" />
							<span>{contactPhone}</span>
						</a>
					)}
				</div>
			</main>

			{/* Bottom Bar: Clean, understated footer */}
			<footer className="relative z-10 w-full px-6 py-5 sm:px-10 sm:py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
				<p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
				<div className="flex items-center gap-2">
					<span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
					<span className="text-zinc-400">Verified Client Site</span>
				</div>
			</footer>
		</div>
	);
}
