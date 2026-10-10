/** @format */

"use client";

import React, { useState, useEffect } from "react";
import {
	X,
	Check,
	Loader2,
	Sparkles,
	MessageCircle,
	Megaphone,
	Clock,
	Tag,
	ShoppingBag,
	MapPin,
	Phone,
	Mail,
	Edit3,
	AlertCircle,
} from "lucide-react";

export interface QuickEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSaved?: () => void;
}

export default function QuickEditModal({ isOpen, onClose, onSaved }: QuickEditModalProps) {
	const [activeTab, setActiveTab] = useState<"banner" | "contacts" | "offerings" | "copy">("banner");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Form State
	const [announcementBanner, setAnnouncementBanner] = useState("");
	const [businessHours, setBusinessHours] = useState("");
	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [contactPhone, setContactPhone] = useState("");
	const [locationAddress, setLocationAddress] = useState("");
	const [tagline, setTagline] = useState("");
	const [heroHeadline, setHeroHeadline] = useState("");
	const [aboutText, setAboutText] = useState("");
	const [products, setProducts] = useState<any[]>([]);
	const [services, setServices] = useState<any[]>([]);

	useEffect(() => {
		if (!isOpen) return;

		async function fetchContent() {
			setIsLoading(true);
			setErrorMsg(null);
			setSuccessMsg(null);
			try {
				const res = await fetch("/api/projects/quick-edit");
				if (res.ok) {
					const data = await res.json();
					const c = data.content || {};
					setAnnouncementBanner(c.announcementBanner || "");
					setBusinessHours(c.businessHours || "");
					setWhatsappNumber(c.whatsappNumber || c.contactPhone || "");
					setContactEmail(c.contactEmail || "");
					setContactPhone(c.contactPhone || "");
					setLocationAddress(c.locationAddress || "");
					setTagline(c.tagline || "");
					setHeroHeadline(c.heroHeadline || "");
					setAboutText(c.aboutText || "");
					setProducts(c.products || []);
					setServices(c.services || []);
				} else {
					setErrorMsg("Could not load current project content.");
				}
			} catch (e) {
				setErrorMsg("Failed to load project details.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchContent();
	}, [isOpen]);

	const handleSave = async () => {
		setIsSaving(true);
		setErrorMsg(null);
		setSuccessMsg(null);

		try {
			const res = await fetch("/api/projects/quick-edit", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					announcementBanner,
					businessHours,
					whatsappNumber,
					contactEmail,
					contactPhone,
					locationAddress,
					tagline,
					heroHeadline,
					aboutText,
					products,
					services,
				}),
			});

			const data = await res.json();
			if (res.ok) {
				setSuccessMsg("Changes saved! Your website has been updated live.");
				if (onSaved) onSaved();
				setTimeout(() => {
					setSuccessMsg(null);
				}, 4000);
			} else {
				setErrorMsg(data.error || "Failed to save edits.");
			}
		} catch (e) {
			setErrorMsg("Network error saving edits.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleProductPriceChange = (index: number, newPrice: string) => {
		const updated = [...products];
		updated[index] = { ...updated[index], price: newPrice };
		setProducts(updated);
	};

	const handleProductStockToggle = (index: number) => {
		const updated = [...products];
		const current = updated[index].inStock !== false; // default is true
		updated[index] = { ...updated[index], inStock: !current };
		setProducts(updated);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white border border-gray-200 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
							<Edit3 className="w-4 h-4" />
						</div>
						<div>
							<h2 className="text-base font-bold font-nohemi text-gray-900 flex items-center gap-2">
								<span>Quick Edit Studio</span>
								<span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
									Instant Live
								</span>
							</h2>
							<p className="text-xs text-gray-500">
								Update your live announcement, WhatsApp contact, prices, and copy
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Tabs Navigation */}
				<div className="flex items-center border-b border-gray-100 px-6 bg-slate-50/70 overflow-x-auto text-xs font-semibold gap-2">
					<button
						type="button"
						onClick={() => setActiveTab("banner")}
						className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
							activeTab === "banner"
								? "border-blue-600 text-blue-600 font-bold"
								: "border-transparent text-gray-500 hover:text-gray-900"
						}`}>
						<Megaphone className="w-3.5 h-3.5" />
						<span>Announcement & Hours</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("contacts")}
						className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
							activeTab === "contacts"
								? "border-blue-600 text-blue-600 font-bold"
								: "border-transparent text-gray-500 hover:text-gray-900"
						}`}>
						<MessageCircle className="w-3.5 h-3.5" />
						<span>WhatsApp & Contact</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("offerings")}
						className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
							activeTab === "offerings"
								? "border-blue-600 text-blue-600 font-bold"
								: "border-transparent text-gray-500 hover:text-gray-900"
						}`}>
						<ShoppingBag className="w-3.5 h-3.5" />
						<span>Products & Pricing</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("copy")}
						className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
							activeTab === "copy"
								? "border-blue-600 text-blue-600 font-bold"
								: "border-transparent text-gray-500 hover:text-gray-900"
						}`}>
						<Sparkles className="w-3.5 h-3.5" />
						<span>Headline & Copy</span>
					</button>
				</div>

				{/* Body Content */}
				<div className="p-6 overflow-y-auto flex-1 space-y-5">
					{isLoading ? (
						<div className="py-12 flex flex-col items-center justify-center text-gray-400">
							<Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-600" />
							<p className="text-xs">Loading live website content...</p>
						</div>
					) : (
						<>
							{/* Notifications */}
							{successMsg && (
								<div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
									<Check className="w-4 h-4 text-emerald-600 shrink-0" />
									<span>{successMsg}</span>
								</div>
							)}

							{errorMsg && (
								<div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
									<AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
									<span>{errorMsg}</span>
								</div>
							)}

							{/* TAB 1: Announcement Banner & Hours */}
							{activeTab === "banner" && (
								<div className="space-y-4">
									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											Top Announcement Banner (Displayed at the top of your live site)
										</label>
										<input
											type="text"
											value={announcementBanner}
											onChange={(e) => setAnnouncementBanner(e.target.value)}
											placeholder="e.g. 🔥 Weekend Special: 20% off all orders! Use code WEEKEND20"
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
										<p className="text-[11px] text-gray-400 mt-1">
											Leave blank to hide the top announcement banner.
										</p>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											Business Operating Hours
										</label>
										<input
											type="text"
											value={businessHours}
											onChange={(e) => setBusinessHours(e.target.value)}
											placeholder="e.g. Mon - Sat: 8:00 AM - 8:00 PM (Closed Sundays)"
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
									</div>
								</div>
							)}

							{/* TAB 2: Contacts & WhatsApp */}
							{activeTab === "contacts" && (
								<div className="space-y-4">
									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											WhatsApp Contact Number (Direct Orders & Chat)
										</label>
										<input
											type="text"
											value={whatsappNumber}
											onChange={(e) => setWhatsappNumber(e.target.value)}
											placeholder="e.g. +234 810 000 0000"
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-bold text-gray-700 mb-1">
												Public Contact Email
											</label>
											<input
												type="email"
												value={contactEmail}
												onChange={(e) => setContactEmail(e.target.value)}
												placeholder="hello@yourbusiness.com"
												className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
											/>
										</div>

										<div>
											<label className="block text-xs font-bold text-gray-700 mb-1">
												Phone Number (Direct Calls)
											</label>
											<input
												type="text"
												value={contactPhone}
												onChange={(e) => setContactPhone(e.target.value)}
												placeholder="+234 800 123 4567"
												className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
											/>
										</div>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											Physical Location / Store Address
										</label>
										<input
											type="text"
											value={locationAddress}
											onChange={(e) => setLocationAddress(e.target.value)}
											placeholder="e.g. 14 Victoria Island Boulevard, Lagos"
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
									</div>
								</div>
							)}

							{/* TAB 3: Offerings & Products */}
							{activeTab === "offerings" && (
								<div className="space-y-4">
									{products && products.length > 0 ? (
										<div className="space-y-3">
											<p className="text-xs font-bold text-gray-700">
												Products List ({products.length} Items)
											</p>
											{products.map((prod, idx) => (
												<div
													key={idx}
													className="p-3.5 rounded-xl border border-gray-200 bg-slate-50 flex items-center justify-between gap-4">
													<div className="min-w-0 flex-1">
														<h4 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h4>
														<p className="text-[11px] text-gray-500 truncate">{prod.category || "General"}</p>
													</div>

													<div className="flex items-center gap-3 shrink-0">
														{/* Price Edit */}
														<div className="flex items-center gap-1">
															<span className="text-xs text-gray-400 font-semibold">Price:</span>
															<input
																type="text"
																value={prod.price || ""}
																onChange={(e) => handleProductPriceChange(idx, e.target.value)}
																className="w-24 px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-900 bg-white"
															/>
														</div>

														{/* In-Stock Toggle */}
														<button
															type="button"
															onClick={() => handleProductStockToggle(idx)}
															className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
																prod.inStock !== false
																	? "bg-emerald-100 text-emerald-800"
																	: "bg-red-100 text-red-800"
															}`}>
															{prod.inStock !== false ? "In Stock" : "Sold Out"}
														</button>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-400 text-xs">
											No products catalog found. You can add products via Content Studio.
										</div>
									)}
								</div>
							)}

							{/* TAB 4: Copy & Headlines */}
							{activeTab === "copy" && (
								<div className="space-y-4">
									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											Main Hero Headline
										</label>
										<input
											type="text"
											value={heroHeadline}
											onChange={(e) => setHeroHeadline(e.target.value)}
											placeholder="Primary headline on your website hero"
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											Brand Tagline
										</label>
										<input
											type="text"
											value={tagline}
											onChange={(e) => setTagline(e.target.value)}
											placeholder="Short memorable tagline"
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1">
											About Business Summary
										</label>
										<textarea
											rows={3}
											value={aboutText}
											onChange={(e) => setAboutText(e.target.value)}
											placeholder="Brief overview of your business..."
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
										/>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				{/* Footer Actions */}
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
						Cancel
					</button>

					<button
						type="button"
						onClick={handleSave}
						disabled={isSaving || isLoading}
						className="px-6 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50">
						{isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
						<span>Save & Publish Live</span>
					</button>
				</div>
			</div>
		</div>
	);
}
