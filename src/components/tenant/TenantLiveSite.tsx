/** @format */

"use client";

import React, { useState } from "react";
import {
	Globe,
	Phone,
	Mail,
	MapPin,
	MessageCircle,
	ArrowRight,
	CheckCircle2,
	Send,
	Star,
	Clock,
	ShieldCheck,
	ShoppingBag,
	Sparkles,
	ExternalLink,
} from "lucide-react";

export interface TenantContentData {
	businessName?: string;
	tagline?: string;
	category?: string;
	aboutText?: string;
	primaryColor?: string;
	themeMode?: "light" | "dark";
	contactEmail?: string;
	contactPhone?: string;
	whatsappNumber?: string;
	whatsappLink?: string;
	locationAddress?: string;
	instagramUrl?: string;
	twitterUrl?: string;
	facebookUrl?: string;
	linkedinUrl?: string;
	logoImage?: {
		url: string;
		publicId?: string;
	};
	uploadedImages?: Array<{
		url: string;
		publicId?: string;
		caption?: string;
	}>;
	// Offerings based on plan
	services?: Array<{
		title: string;
		description: string;
		price?: string;
		duration?: string;
	}>;
	funnelValueStack?: Array<{
		deliverableName: string;
		deliverableDescription: string;
		perceivedValue?: string;
	}>;
	funnelHeadlineOffer?: string;
	funnelMainPrice?: string;
	products?: Array<{
		name: string;
		price: string;
		description: string;
		image?: string;
		category?: string;
	}>;
	heroHeadline?: string;
	heroSubheadline?: string;
	benefits?: Array<{
		title: string;
		description: string;
	}>;
	testimonials?: Array<{
		name: string;
		role: string;
		review: string;
		rating?: number;
	}>;
	faqs?: Array<{
		question: string;
		answer: string;
	}>;
}

interface TenantLiveSiteProps {
	tenantSlug: string;
	plan: string;
	content: TenantContentData;
	publishedUrl?: string;
}

export default function TenantLiveSite({
	tenantSlug,
	plan,
	content,
	publishedUrl,
}: TenantLiveSiteProps) {
	const [inquiryName, setInquiryName] = useState("");
	const [inquiryEmail, setInquiryEmail] = useState("");
	const [inquiryPhone, setInquiryPhone] = useState("");
	const [inquiryMessage, setInquiryMessage] = useState("");
	const [inquirySent, setInquirySent] = useState(false);

	const isDarkMode = content.themeMode === "dark";
	const brandColor = content.primaryColor || "#004ac6";

	// Format WhatsApp URL with customized pre-filled message
	const cleanWhatsApp = (content.whatsappNumber || content.contactPhone || "").replace(/[^0-9]/g, "");
	const waLink = cleanWhatsApp
		? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
				`Hello ${content.businessName || ""}, I am reaching out from your website regarding your offerings.`,
		  )}`
		: null;

	const handleInquirySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inquiryName.trim() || !inquiryMessage.trim()) return;

		// If WhatsApp is available, offer to redirect to WhatsApp with the inquiry pre-filled
		if (cleanWhatsApp) {
			const waInquiry = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
				`Hello! My name is ${inquiryName}.\nEmail: ${inquiryEmail}\nPhone: ${inquiryPhone}\nMessage: ${inquiryMessage}`,
			)}`;
			window.open(waInquiry, "_blank");
		}

		setInquirySent(true);
		setTimeout(() => setInquirySent(false), 6000);
	};

	const businessName = content.businessName || "My Business";
	const tagline = content.tagline || "Quality Services & Products Tailored For You";
	const heroImage = content.uploadedImages?.[0]?.url || null;

	return (
		<div
			className={`min-h-screen font-sans ${
				isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
			}`}>
			{/* Top Header / Navigation */}
			<header
				className={`sticky top-0 z-40 border-b ${
					isDarkMode
						? "bg-slate-900/95 border-slate-800 text-white"
						: "bg-white/95 border-gray-200 text-gray-900"
				} backdrop-blur-md`}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
					{/* Logo & Brand Name */}
					<div className="flex items-center gap-3.5">
						{content.logoImage?.url ? (
							<img
								src={content.logoImage.url}
								alt={businessName}
								className="h-10 w-auto max-w-[160px] object-contain rounded-lg"
							/>
						) : (
							<div
								style={{ backgroundColor: brandColor }}
								className="w-10 h-10 rounded-xl text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
								{businessName.charAt(0).toUpperCase()}
							</div>
						)}
						<div>
							<h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
								{businessName}
							</h1>
							{content.category && (
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
									{content.category}
								</p>
							)}
						</div>
					</div>

					{/* Navigation & WhatsApp CTA */}
					<div className="flex items-center gap-3">
						<nav className="hidden md:flex items-center gap-6 text-xs font-bold mr-4">
							<a href="#about" className="hover:text-blue-600 transition-colors">
								About
							</a>
							<a href="#offerings" className="hover:text-blue-600 transition-colors">
								Offerings
							</a>
							<a href="#contact" className="hover:text-blue-600 transition-colors">
								Contact
							</a>
						</nav>

						{waLink ? (
							<a
								href={waLink}
								target="_blank"
								rel="noreferrer"
								style={{ backgroundColor: "#25D366" }}
								className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-extrabold shadow-sm hover:brightness-105 transition-all">
								<MessageCircle className="w-4 h-4 fill-white" />
								<span className="hidden sm:inline">Chat on WhatsApp</span>
								<span className="sm:hidden">WhatsApp</span>
							</a>
						) : content.contactPhone ? (
							<a
								href={`tel:${content.contactPhone}`}
								style={{ backgroundColor: brandColor }}
								className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-extrabold shadow-sm hover:brightness-105 transition-all">
								<Phone className="w-4 h-4" />
								<span>Call Now</span>
							</a>
						) : (
							<a
								href="#contact"
								style={{ backgroundColor: brandColor }}
								className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-extrabold shadow-sm hover:brightness-105 transition-all">
								<span>Contact Us</span>
							</a>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
				<div
					className={`rounded-3xl p-8 sm:p-14 border ${
						isDarkMode
							? "bg-slate-900 border-slate-800 shadow-2xl"
							: "bg-white border-gray-200 shadow-sm"
					} grid grid-cols-1 lg:grid-cols-12 gap-10 items-center`}>
					<div className="lg:col-span-7 space-y-6">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
							<Sparkles className="w-3.5 h-3.5" />
							<span>Official Business Website</span>
						</div>

						<h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
							{content.heroHeadline || tagline}
						</h2>

						<p
							className={`text-sm sm:text-base leading-relaxed ${
								isDarkMode ? "text-slate-300" : "text-gray-600"
							}`}>
							{content.heroSubheadline || content.aboutText ||
								`Welcome to ${businessName}. We take pride in delivering top-tier solutions, premium products, and exceptional customer service.`}
						</p>

						<div className="flex flex-wrap items-center gap-3.5 pt-2">
							{waLink && (
								<a
									href={waLink}
									target="_blank"
									rel="noreferrer"
									style={{ backgroundColor: "#25D366" }}
									className="px-6 py-3.5 rounded-full text-white text-xs font-extrabold shadow-md hover:brightness-105 transition-all inline-flex items-center gap-2">
									<MessageCircle className="w-4 h-4 fill-white" />
									<span>Chat Direct on WhatsApp</span>
								</a>
							)}

							<a
								href="#offerings"
								style={{ borderColor: brandColor, color: brandColor }}
								className="px-6 py-3.5 rounded-full border-2 text-xs font-extrabold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
								<span>Explore Offerings</span>
								<ArrowRight className="w-4 h-4" />
							</a>
						</div>

						{/* Highlights Row */}
						<div
							className={`pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t ${
								isDarkMode ? "border-slate-800 text-slate-400" : "border-gray-100 text-gray-500"
							} text-xs font-semibold`}>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
								<span>Verified Business</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-blue-500 shrink-0" />
								<span>Fast Response</span>
							</div>
							<div className="flex items-center gap-2">
								<ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
								<span>Secure Orders</span>
							</div>
						</div>
					</div>

					{/* Hero Media / Brand Graphic */}
					<div className="lg:col-span-5">
						{heroImage ? (
							<div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 aspect-4/3">
								<img
									src={heroImage}
									alt={businessName}
									className="w-full h-full object-cover"
								/>
							</div>
						) : (
							<div
								className={`rounded-2xl p-8 sm:p-10 text-center space-y-4 border ${
									isDarkMode
										? "bg-slate-800/80 border-slate-700 text-white"
										: "bg-gray-50 border-gray-200 text-gray-800"
								}`}>
								<div
									style={{ backgroundColor: brandColor }}
									className="w-16 h-16 rounded-2xl text-white font-extrabold flex items-center justify-center text-2xl mx-auto shadow-md">
									{businessName.charAt(0).toUpperCase()}
								</div>
								<h3 className="font-extrabold text-xl">{businessName}</h3>
								<p className="text-xs text-gray-500 max-w-xs mx-auto">
									Serving clients with dedication, quality, and fast delivery.
								</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Offerings Section (Services, Products, or Funnel Value Stack) */}
			<section id="offerings" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
				<div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
					<span
						style={{ color: brandColor }}
						className="text-xs font-extrabold uppercase tracking-wider">
						Our Offerings & Solutions
					</span>
					<h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
						{plan === "ECOMMERCE_STORE"
							? "Featured Products Catalog"
							: plan === "SALES_FUNNEL"
							? "Everything Included In Your Package"
							: "Services Tailored For You"}
					</h3>
					<p className={`text-xs sm:text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
						Select an offering below to place an order or inquire directly via WhatsApp.
					</p>
				</div>

				{/* Render Products / Offerings */}
				{content.products && content.products.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
						{content.products.map((prod, idx) => (
							<div
								key={idx}
								className={`rounded-3xl border p-6 flex flex-col justify-between space-y-4 ${
									isDarkMode
										? "bg-slate-900 border-slate-800 hover:border-slate-700"
										: "bg-white border-gray-200 hover:border-blue-300"
								} shadow-xs transition-all`}>
								<div className="space-y-3">
									{prod.image ? (
										<div className="rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
											<img
												src={prod.image}
												alt={prod.name}
												className="w-full h-full object-cover"
											/>
										</div>
									) : (
										<div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
											<ShoppingBag className="w-6 h-6" />
										</div>
									)}

									<div>
										<h4 className="font-extrabold text-base text-gray-900 dark:text-white">
											{prod.name}
										</h4>
										{prod.category && (
											<span className="text-[10px] font-bold text-gray-400 uppercase">
												{prod.category}
											</span>
										)}
									</div>

									<p
										className={`text-xs leading-relaxed ${
											isDarkMode ? "text-slate-400" : "text-gray-600"
										}`}>
										{prod.description}
									</p>
								</div>

								<div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
									<span className="text-lg font-extrabold font-nohemi text-blue-600">
										{prod.price}
									</span>

									{cleanWhatsApp && (
										<a
											href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
												`Hello ${businessName}, I would like to order the product: "${prod.name}" priced at ${prod.price}.`,
											)}`}
											target="_blank"
											rel="noreferrer"
											style={{ backgroundColor: "#25D366" }}
											className="px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-105 transition-all">
											<MessageCircle className="w-3.5 h-3.5 fill-white" />
											<span>Order via WhatsApp</span>
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Render Sales Funnel Value Stack */}
				{plan === "SALES_FUNNEL" && content.funnelValueStack && content.funnelValueStack.length > 0 && (
					<div className="max-w-3xl mx-auto space-y-4">
						{content.funnelValueStack.map((item, idx) => (
							<div
								key={idx}
								className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
									isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
								} shadow-xs`}>
								<div className="flex items-start gap-3.5">
									<div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
										<CheckCircle2 className="w-4 h-4" />
									</div>
									<div>
										<h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
											{item.deliverableName}
										</h4>
										<p
											className={`text-xs mt-0.5 ${
												isDarkMode ? "text-slate-400" : "text-gray-600"
											}`}>
											{item.deliverableDescription}
										</p>
									</div>
								</div>

								{item.perceivedValue && (
									<span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
										Value: {item.perceivedValue}
									</span>
								)}
							</div>
						))}

						{cleanWhatsApp && (
							<div className="pt-6 text-center">
								<a
									href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
										`Hello ${businessName}, I would like to claim the package offer on your website.`,
									)}`}
									target="_blank"
									rel="noreferrer"
									style={{ backgroundColor: "#25D366" }}
									className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-sm font-extrabold shadow-lg hover:brightness-105 transition-all">
									<MessageCircle className="w-5 h-5 fill-white" />
									<span>Claim This Offer on WhatsApp</span>
								</a>
							</div>
						)}
					</div>
				)}

				{/* Render Standard Services */}
				{(plan === "LANDING_PAGE" || !plan || (plan !== "ECOMMERCE_STORE" && plan !== "SALES_FUNNEL")) && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{(content.services && content.services.length > 0
							? content.services
							: [
									{
										title: "Primary Solution & Consultation",
										description: "Tailored services engineered specifically to solve your core needs.",
										price: "Contact for Quote",
									},
									{
										title: "Premium Delivery & Support",
										description: "Fast turnaround with dedicated direct communication.",
										price: "Included",
									},
									{
										title: "Custom Requests & Orders",
										description: "Specialized packages designed around your exact specifications.",
										price: "Custom",
									},
							  ]
						).map((svc, idx) => (
							<div
								key={idx}
								className={`rounded-3xl border p-6 flex flex-col justify-between space-y-4 ${
									isDarkMode
										? "bg-slate-900 border-slate-800 hover:border-slate-700"
										: "bg-white border-gray-200 hover:border-blue-300"
								} shadow-xs transition-all`}>
								<div className="space-y-3">
									<div
										style={{ backgroundColor: brandColor }}
										className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold">
										{idx + 1}
									</div>

									<h4 className="font-extrabold text-base text-gray-900 dark:text-white">
										{svc.title}
									</h4>

									<p
										className={`text-xs leading-relaxed ${
											isDarkMode ? "text-slate-400" : "text-gray-600"
										}`}>
										{svc.description}
									</p>
								</div>

								<div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
									{svc.price && (
										<span className="text-xs font-bold text-gray-500">{svc.price}</span>
									)}

									{cleanWhatsApp && (
										<a
											href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
												`Hello ${businessName}, I am interested in your service: "${svc.title}".`,
											)}`}
											target="_blank"
											rel="noreferrer"
											style={{ backgroundColor: "#25D366" }}
											className="px-3.5 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:brightness-105 transition-all">
											<MessageCircle className="w-3.5 h-3.5 fill-white" />
											<span>Inquire</span>
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Benefits / Why Us Section */}
			{content.benefits && content.benefits.length > 0 && (
				<section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
					<div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
						<span
							style={{ color: brandColor }}
							className="text-xs font-extrabold uppercase tracking-wider">
							Why Choose Us
						</span>
						<h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							The {businessName} Advantage
						</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{content.benefits.map((b, idx) => (
							<div
								key={idx}
								className={`p-6 rounded-2xl border ${
									isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
								} shadow-xs`}>
								<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
									<CheckCircle2 className="w-5 h-5" />
								</div>
								<h4 className="font-extrabold text-base mb-2">{b.title}</h4>
								<p
									className={`text-xs leading-relaxed ${
										isDarkMode ? "text-slate-400" : "text-gray-600"
									}`}>
									{b.description}
								</p>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Testimonials / Buyer Reviews Section */}
			{content.testimonials && content.testimonials.length > 0 && (
				<section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
					<div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
						<span
							style={{ color: brandColor }}
							className="text-xs font-extrabold uppercase tracking-wider">
							Verified Reviews
						</span>
						<h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Trusted by Customers
						</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{content.testimonials.map((t, idx) => (
							<div
								key={idx}
								className={`p-6 rounded-3xl border ${
									isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
								} shadow-xs flex flex-col justify-between`}>
								<div className="space-y-3">
									<div className="flex items-center gap-1 text-amber-500">
										{[...Array(t.rating || 5)].map((_, i) => (
											<Star key={i} className="w-4 h-4 fill-amber-400" />
										))}
									</div>
									<p
										className={`text-xs italic leading-relaxed ${
											isDarkMode ? "text-slate-300" : "text-gray-600"
										}`}>
										&ldquo;{t.review}&rdquo;
									</p>
								</div>
								<div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-4">
									<h5 className="font-extrabold text-xs">{t.name}</h5>
									<span className="text-[10px] text-gray-400 font-semibold">{t.role}</span>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* FAQs Section */}
			{content.faqs && content.faqs.length > 0 && (
				<section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
					<div className="text-center mb-10 space-y-2">
						<span
							style={{ color: brandColor }}
							className="text-xs font-extrabold uppercase tracking-wider">
							Got Questions?
						</span>
						<h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Frequently Asked Questions
						</h3>
					</div>
					<div className="space-y-4">
						{content.faqs.map((f, idx) => (
							<div
								key={idx}
								className={`p-5 rounded-2xl border ${
									isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
								}`}>
								<h4 className="font-extrabold text-sm mb-2">{f.question}</h4>
								<p
									className={`text-xs leading-relaxed ${
										isDarkMode ? "text-slate-400" : "text-gray-600"
									}`}>
									{f.answer}
								</p>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Contact & Inquiry Section */}
			<section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
				<div
					className={`rounded-3xl border p-8 sm:p-12 ${
						isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
					} shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10`}>
					<div className="lg:col-span-5 space-y-6">
						<span
							style={{ color: brandColor }}
							className="text-xs font-extrabold uppercase tracking-wider">
							Get In Touch
						</span>

						<h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
							Let&apos;s Connect & Discuss Your Requirements
						</h3>

						<p
							className={`text-xs sm:text-sm leading-relaxed ${
								isDarkMode ? "text-slate-400" : "text-gray-600"
							}`}>
							Send a direct inquiry or contact our team via phone or WhatsApp. We reply promptly.
						</p>

						<div className="space-y-3.5 pt-2">
							{content.contactEmail && (
								<a
									href={`mailto:${content.contactEmail}`}
									className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-300 hover:text-blue-600">
									<div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
										<Mail className="w-4 h-4" />
									</div>
									<span>{content.contactEmail}</span>
								</a>
							)}

							{content.contactPhone && (
								<a
									href={`tel:${content.contactPhone}`}
									className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-300 hover:text-blue-600">
									<div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
										<Phone className="w-4 h-4" />
									</div>
									<span>{content.contactPhone}</span>
								</a>
							)}

							{content.locationAddress && (
								<div className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-300">
									<div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
										<MapPin className="w-4 h-4" />
									</div>
									<span>{content.locationAddress}</span>
								</div>
							)}
						</div>
					</div>

					{/* Inquiry Form */}
					<div className="lg:col-span-7">
						<form
							onSubmit={handleInquirySubmit}
							className={`p-6 sm:p-8 rounded-2xl border space-y-4 ${
								isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
							}`}>
							<h4 className="font-extrabold text-base">Send Direct Inquiry</h4>

							{inquirySent && (
								<div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
									<CheckCircle2 className="w-4 h-4 text-emerald-700" />
									<span>Thank you! Your message has been sent.</span>
								</div>
							)}

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1">
									<label className="text-[11px] font-bold text-gray-500">Your Full Name</label>
									<input
										type="text"
										required
										placeholder="e.g. John Doe"
										value={inquiryName}
										onChange={(e) => setInquiryName(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
									/>
								</div>

								<div className="space-y-1">
									<label className="text-[11px] font-bold text-gray-500">Email Address</label>
									<input
										type="email"
										required
										placeholder="john@example.com"
										value={inquiryEmail}
										onChange={(e) => setInquiryEmail(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-[11px] font-bold text-gray-500">Phone / WhatsApp Number</label>
								<input
									type="tel"
									placeholder="+234..."
									value={inquiryPhone}
									onChange={(e) => setInquiryPhone(e.target.value)}
									className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-[11px] font-bold text-gray-500">Message / Requirement</label>
								<textarea
									required
									rows={3}
									placeholder="Tell us what you are looking for..."
									value={inquiryMessage}
									onChange={(e) => setInquiryMessage(e.target.value)}
									className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
								/>
							</div>

							<button
								type="submit"
								style={{ backgroundColor: brandColor }}
								className="w-full py-3 rounded-full text-white text-xs font-extrabold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer">
								<Send className="w-4 h-4" />
								<span>Submit Inquiry</span>
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer
				className={`py-8 px-4 sm:px-6 lg:px-8 border-t ${
					isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-gray-200 text-gray-500"
				} text-xs`}>
				<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="font-medium">
						© {new Date().getFullYear()} {businessName}. All rights reserved.
					</p>

					{/* Powered By Kiosk badge */}
					<div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
						<span>Powered by</span>
						<a
							href="https://kioosk.online"
							target="_blank"
							rel="noreferrer"
							className="text-blue-600 hover:underline">
							Kiosk
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
