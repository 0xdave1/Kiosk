/** @format */

"use client";

import React from "react";
import {
	ShieldAlert,
	ArrowUpRight,
	Lock,
	RefreshCw,
	MessageCircle,
	Sparkles,
} from "lucide-react";
import Link from "next/link";

export interface SubscriptionExpiredProps {
	businessName: string;
	logoUrl?: string | null;
	tenantSlug?: string;
	whatsapp?: string | null;
	contactEmail?: string | null;
}

export default function SubscriptionExpiredView({
	businessName,
	logoUrl,
	tenantSlug,
	whatsapp,
	contactEmail,
}: SubscriptionExpiredProps) {
	const cleanWhatsApp = (whatsapp || "").replace(/[^0-9]/g, "");
	const waLink = cleanWhatsApp
		? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
				`Hello ${businessName}, I tried visiting your website and wanted to reach out.`,
		  )}`
		: null;

	return (
		<div className="relative min-h-screen w-full bg-[#0a0a0d] text-zinc-100 flex flex-col justify-between overflow-hidden selection:bg-white selection:text-black font-sans">
			{/* Architectural Grid Background */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.035]"
				style={{
					backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
					backgroundSize: "48px 48px",
				}}
			/>

			{/* Soft cinematic vignette */}
			<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0d_75%)]" />

			{/* Subtle amber/red central glow */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

			{/* Top Bar */}
			<header className="relative z-10 w-full px-6 py-5 sm:px-10 sm:py-7 flex items-center justify-between border-b border-white/[0.06] text-[11px] font-mono tracking-widest uppercase text-zinc-400">
				<div className="flex items-center gap-2.5">
					<span className="relative flex h-2 w-2">
						<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
					</span>
					<span className="text-zinc-300 font-semibold">STATUS: HOSTING PAUSED</span>
					<span className="hidden sm:inline text-zinc-600">{"//"}</span>
					<span className="hidden sm:inline text-zinc-500">
						{tenantSlug ? tenantSlug.toUpperCase() : "MANAGED CLOUD"}
					</span>
				</div>

				<div className="flex items-center gap-2 text-zinc-400 text-xs">
					<Lock className="w-3.5 h-3.5 text-amber-500/80" />
					<span className="text-zinc-500">SECURE PRESERVATION ACTIVE</span>
				</div>
			</header>

			{/* Main Center Stage */}
			<main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-20 text-center max-w-2xl mx-auto w-full">
				{/* Brand Monogram or Logo */}
				<div className="relative group mb-8">
					<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#121217] border border-white/[0.12] p-2 flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-md">
						{logoUrl ? (
							<img
								src={logoUrl}
								alt={businessName}
								className="w-full h-full object-contain rounded-xl"
							/>
						) : (
							<div className="w-full h-full rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl font-mono">
								{businessName ? businessName.trim().charAt(0).toUpperCase() : "★"}
							</div>
						)}
					</div>
				</div>

				{/* Notice Badge */}
				<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/[0.08] border border-amber-500/20 text-[11px] font-mono font-medium tracking-widest text-amber-300 uppercase mb-6 backdrop-blur-sm">
					<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
					<span>1-Month Hosting Period Concluded</span>
				</div>

				{/* Headline */}
				<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight mb-4">
					{businessName}
				</h1>

				{/* Explanation Paragraph */}
				<p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed mb-8 max-w-lg">
					The 1-month subscription period for this website has ended. All website data, custom configurations, and media remain securely preserved.
				</p>

				{/* Information Container */}
				<div className="w-full bg-[#121218] border border-white/[0.08] rounded-2xl p-6 mb-8 text-left space-y-3 shadow-xl">
					<div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-3">
						<span>Account Status</span>
						<span className="text-amber-400 font-semibold">Subscription Expired</span>
					</div>
					<div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-3">
						<span>Website Data Protection</span>
						<span className="text-emerald-400 font-semibold">100% Retained & Safe</span>
					</div>
					<div className="flex items-center justify-between text-xs font-mono text-zinc-400">
						<span>Reactivation Time</span>
						<span className="text-zinc-200">Instantaneous (&lt; 60 seconds)</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
					<Link
						href="https://kioosk.online/dashboard/billing"
						className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2">
						<RefreshCw className="w-3.5 h-3.5" />
						<span>Owner: Reactivate Subscription</span>
					</Link>

					{waLink && (
						<a
							href={waLink}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
							<MessageCircle className="w-4 h-4 text-emerald-400" />
							<span>Contact Business via WhatsApp</span>
						</a>
					)}
				</div>
			</main>

			{/* Footer */}
			<footer className="relative z-10 w-full px-6 py-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
				<p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
				<p className="flex items-center gap-1.5 text-zinc-400">
					<span>Preserved Securely</span>
				</p>
			</footer>
		</div>
	);
}
