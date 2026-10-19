/** @format */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PillButton from "@/components/PillButton";
import { Send, Loader2 } from "lucide-react";

interface FormState {
	name: string;
	email: string;
	phone: string;
	category: string;
	subject: string;
	message: string;
	websiteUrl: string;
}

const CATEGORIES = [
	"Technical Support & Site Edits",
	"Billing & Subscriptions",
	"Custom Domain & DNS",
	"Sales & Custom Features",
	"General Inquiry",
];

function ContactContent() {
	const searchParams = useSearchParams();
	const initialCat = searchParams.get("category");

	const getResolvedCategory = (param: string | null) => {
		if (!param) return "Technical Support & Site Edits";
		const p = param.toLowerCase();
		if (p.includes("bill")) return "Billing & Subscriptions";
		if (p.includes("domain") || p.includes("dns")) return "Custom Domain & DNS";
		if (p.includes("sales") || p.includes("service")) return "Sales & Custom Features";
		if (p.includes("term") || p.includes("privacy") || p.includes("legal")) return "General Inquiry";
		return "Technical Support & Site Edits";
	};

	const [formData, setFormData] = useState<FormState>({
		name: "",
		email: "",
		phone: "",
		category: getResolvedCategory(initialCat),
		subject: "",
		message: "",
		websiteUrl: "",
	});

	useEffect(() => {
		if (initialCat) {
			setFormData((prev) => ({
				...prev,
				category: getResolvedCategory(initialCat),
			}));
		}
	}, [initialCat]);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [ticketResult, setTicketResult] = useState<{
		ticketId: string;
		message: string;
	} | null>(null);
	const [copiedEmail, setCopiedEmail] = useState(false);

	const handleCopyEmail = () => {
		navigator.clipboard.writeText("support@kioosk.online");
		setCopiedEmail(true);
		setTimeout(() => setCopiedEmail(false), 2000);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					priority: "normal",
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to submit your inquiry.");
			}

			setTicketResult({
				ticketId: data.ticketId,
				message: data.message,
			});
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
			setSubmitError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
			<Navbar />

			{/* Page Header */}
			<section className="pt-32 pb-12 sm:pt-40 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-slate-50/50">
				<div className="max-w-3xl mx-auto space-y-4">
					<Link
						href="/"
						className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
						&larr; Back to Home
					</Link>
					<h1 className="text-3xl sm:text-4xl font-bold font-nohemi text-slate-900 tracking-tight">
						Contact Support
					</h1>
					<p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
						Have questions about your website, need content revisions, or want to connect a custom domain? Send us a message or reach out directly.
					</p>
				</div>
			</section>

			{/* Content Area */}
			<section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex-1 space-y-8">
				{/* Direct Channels */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{/* Email */}
					<div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
						<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
							Email
						</span>
						<a
							href="mailto:support@kioosk.online"
							className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline block truncate">
							support@kioosk.online
						</a>
						<button
							type="button"
							onClick={handleCopyEmail}
							className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer">
							{copiedEmail ? "Copied to clipboard" : "Copy address"}
						</button>
					</div>

					{/* WhatsApp */}
					<div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
						<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
							WhatsApp
						</span>
						<p className="text-xs sm:text-sm font-semibold text-slate-800">
							+234 811 606 2226
						</p>
						<a
							href="https://wa.me/2348116062226?text=Hi%20Kiosk%20Support%2C%20I%20need%20assistance%20with%20my%20website"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] text-blue-600 hover:underline inline-block font-medium">
							Chat on WhatsApp &rarr;
						</a>
					</div>

					{/* Dashboard */}
					<div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
						<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
							Client Portal
						</span>
						<p className="text-xs sm:text-sm font-semibold text-slate-800">
							Existing Client?
						</p>
						<Link
							href="/dashboard"
							className="text-[11px] text-blue-600 hover:underline inline-block font-medium">
							Open Dashboard &rarr;
						</Link>
					</div>
				</div>

				{/* Form or Ticket Confirmation */}
				{ticketResult ? (
					<div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 text-center">
						<h3 className="text-lg font-bold font-nohemi text-slate-900">
							Support Inquiry Received
						</h3>
						<p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
							{ticketResult.message}
						</p>
						<div className="p-3 bg-white rounded-lg border border-slate-200 inline-block">
							<span className="text-xs text-slate-500 block">Ticket ID:</span>
							<span className="font-mono font-bold text-sm text-blue-600">
								#{ticketResult.ticketId}
							</span>
						</div>
						<div className="pt-2">
							<button
								type="button"
								onClick={() => {
									setTicketResult(null);
									setFormData({
										name: "",
										email: "",
										phone: "",
										category: "Technical Support & Site Edits",
										subject: "",
										message: "",
										websiteUrl: "",
									});
								}}
								className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer">
								Send Another Message
							</button>
						</div>
					</div>
				) : (
					<form
						onSubmit={handleSubmit}
						className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-5">
						<h3 className="text-lg font-bold font-nohemi text-slate-900">
							Send a Message
						</h3>

						{submitError && (
							<div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
								{submitError}
							</div>
						)}

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="name"
									className="block text-xs font-semibold text-slate-700 mb-1">
									Your Name <span className="text-red-500">*</span>
								</label>
								<input
									id="name"
									type="text"
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="John Doe"
									className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
								/>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-xs font-semibold text-slate-700 mb-1">
									Email Address <span className="text-red-500">*</span>
								</label>
								<input
									id="email"
									type="email"
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									placeholder="john@example.com"
									className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="category"
									className="block text-xs font-semibold text-slate-700 mb-1">
									Category
								</label>
								<select
									id="category"
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600">
									{CATEGORIES.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									htmlFor="websiteUrl"
									className="block text-xs font-semibold text-slate-700 mb-1">
									Website / Domain <span className="text-slate-400 font-normal">(Optional)</span>
								</label>
								<input
									id="websiteUrl"
									type="text"
									value={formData.websiteUrl}
									onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
									placeholder="yoursite.com"
									className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="subject"
								className="block text-xs font-semibold text-slate-700 mb-1">
								Subject <span className="text-red-500">*</span>
							</label>
							<input
								id="subject"
								type="text"
								required
								value={formData.subject}
								onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
								placeholder="How can we help?"
								className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
							/>
						</div>

						<div>
							<label
								htmlFor="message"
								className="block text-xs font-semibold text-slate-700 mb-1">
								Message <span className="text-red-500">*</span>
							</label>
							<textarea
								id="message"
								required
								rows={4}
								value={formData.message}
								onChange={(e) => setFormData({ ...formData, message: e.target.value })}
								placeholder="Describe your request or question in detail..."
								className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-y"
							/>
						</div>

						<div className="pt-2">
							<PillButton
								type="submit"
								disabled={isSubmitting}
								baseColor="#004ac6"
								circleColor="#ffffff"
								textColor="#ffffff"
								hoverTextColor="#004ac6"
								useThunderFont={true}
								className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-xs sm:text-sm border border-blue-600 shadow-md">
								{isSubmitting ? (
									<span className="inline-flex items-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Sending Message...</span>
									</span>
								) : (
									<span className="inline-flex items-center gap-2">
										<Send className="w-3.5 h-3.5" />
										<span>Send Message</span>
									</span>
								)}
							</PillButton>
						</div>
					</form>
				)}
			</section>

			<Footer />
		</main>
	);
}

export default function ContactPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-white text-slate-500">
					<span className="text-xs font-semibold">Loading...</span>
				</div>
			}>
			<ContactContent />
		</Suspense>
	);
}
