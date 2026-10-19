/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PillButton from "@/components/PillButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
	ShieldCheck,
	Lock,
	CheckCircle2,
	Zap,
	Globe,
	ShoppingBag,
	ArrowLeft,
	Loader2,
	AlertCircle,
	CreditCard,
	Building2,
	Smartphone,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { CURRENCIES, BASE_PRICES_USD, formatPrice, PlanKey } from "@/lib/currency";

interface PlanDetails {
	id: string;
	dbPlan: "LANDING_PAGE" | "SALES_FUNNEL" | "E_COMMERCE";
	name: string;
	subtitle: string;
	features: string[];
	deliveryTime: string;
	icon: React.ElementType;
}

const PLAN_DATA: Record<string, PlanDetails> = {
	landing: {
		id: "landing",
		dbPlan: "LANDING_PAGE",
		name: "Landing Page",
		subtitle: "High-Converting Single Page Website",
		deliveryTime: "3–5 Days",
		icon: Globe,
		features: [
			"1 Responsive high-converting page",
			"Custom typography & brand styling",
			"Lead capture & WhatsApp chat",
			"Free subdomain + custom domain wiring",
		],
	},
	funnel: {
		id: "funnel",
		dbPlan: "SALES_FUNNEL",
		name: "Sales Funnel",
		subtitle: "Multi-Step Lead & Conversion Engine",
		deliveryTime: "3–5 Days",
		icon: Zap,
		features: [
			"3–5 Connected sales & opt-in pages",
			"Opt-in, core offer & thank-you flows",
			"Automated CRM & email marketing",
			"Meta Pixel & Google Analytics tracking",
		],
	},
	store: {
		id: "store",
		dbPlan: "E_COMMERCE",
		name: "E-commerce Store",
		subtitle: "Full Digital & Product Shop",
		deliveryTime: "5–10 Days",
		icon: ShoppingBag,
		features: [
			"Full catalog setup & product variations",
			"Cart drawer & instant checkout flow",
			"Card, bank transfer & mobile money gateways",
			"Automated order emails & inventory tracking",
		],
	},
};

function getPlan(param: string): PlanDetails {
	const key = param.toLowerCase();
	if (key.includes("funnel")) return PLAN_DATA.funnel;
	if (key.includes("store") || key.includes("commerce")) return PLAN_DATA.store;
	return PLAN_DATA.landing;
}

function CheckoutContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const planParam = searchParams.get("plan") || "landing";
	const billingParam = searchParams.get("billing") || "monthly";

	const { currency: detectedCurrency, isLoading: isCurrencyLoading } = useCurrency();

	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		billingParam === "yearly" ? "yearly" : "monthly",
	);
	const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const activePlan = getPlan(planParam);
	const PlanIcon = activePlan.icon;
	const planKey: PlanKey = (activePlan.id as PlanKey) || "landing";

	const currentCurrencyCode = selectedCurrencyCode || detectedCurrency.code;
	const activeCurrency = CURRENCIES[currentCurrencyCode] || CURRENCIES.USD;

	const totalPriceFormatted = formatPrice(
		BASE_PRICES_USD[planKey][billingCycle],
		activeCurrency,
	);
	const monthlyPriceFormatted = formatPrice(
		BASE_PRICES_USD[planKey].monthly,
		activeCurrency,
	);

	const { setPaymentInProgress } = useAuth();

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isProcessing) return;

		try {
			setIsProcessing(true);
			setErrorMessage(null);
			setPaymentInProgress(true);

			const idempotencyKey = crypto.randomUUID();

			const res = await fetch("/api/payments/initialize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Idempotency-Key": idempotencyKey,
				},
				body: JSON.stringify({
					plan: activePlan.dbPlan,
					billingCycle,
					currency: activeCurrency.code,
				}),
			});

			const data = await res.json();

			if (!res.ok || !data.link) {
				setPaymentInProgress(false);
				if (res.status === 401) {
					router.push("/get-started?tab=login&redirect=/checkout");
					return;
				}
				setErrorMessage(data.error || "Failed to initialize payment session.");
				setIsProcessing(false);
				return;
			}

			window.location.href = data.link;
		} catch (err) {
			console.error("[CHECKOUT_ERROR]", err);
			setPaymentInProgress(false);
			setErrorMessage("A network error occurred. Please try again.");
			setIsProcessing(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto pt-[max(6rem,calc(env(safe-area-inset-top,0px)+4.5rem))] pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3rem))] px-4 sm:px-6">
			{/* Back Link & Security Badge */}
			<div className="flex items-center justify-between gap-4 mb-6">
				<Link
					href="/services"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
					<ArrowLeft className="w-4 h-4" />
					<span>Back to Services</span>
				</Link>

				<div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
					<Lock className="w-3.5 h-3.5 text-emerald-600" />
					<span>Secured by Bachs</span>
				</div>
			</div>

			{/* Error Alert */}
			{errorMessage && (
				<div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
					<AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
					<span>{errorMessage}</span>
				</div>
			)}

			{/* Main Checkout Card */}
			<div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
				{/* Plan Summary Header */}
				<div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
					<div className="flex items-center gap-3.5">
						<div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
							<PlanIcon className="w-6 h-6" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-gray-900">{activePlan.name}</h1>
							<p className="text-xs text-gray-500">{activePlan.subtitle}</p>
						</div>
					</div>

					<div className="text-right">
						<span className="text-xs font-medium text-gray-400 block">Total</span>
						<span className="text-2xl font-bold text-blue-600">
							{isCurrencyLoading ? (
								<span className="inline-block w-24 h-7 rounded-lg bg-gray-200 animate-pulse" />
							) : (
								totalPriceFormatted
							)}
						</span>
					</div>
				</div>

				{/* 1 Subscription = 1 Website Policy Banner */}
				<div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-2 font-medium">
					<CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
					<span>
						<strong>Subscription Policy:</strong> 1 Subscription = 1 Website. Each subscription powers one live business website with full hosting and management.
					</span>
				</div>

				{/* Billing Cycle & Currency Switchers */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Billing Toggle */}
					<div>
						<label className="text-xs font-semibold text-gray-700 block mb-1.5">
							Billing Cycle
						</label>
						<div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-semibold">
							<button
								type="button"
								onClick={() => setBillingCycle("monthly")}
								className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
									billingCycle === "monthly"
										? "bg-white text-blue-600 shadow-xs"
										: "text-gray-600 hover:text-gray-900"
								}`}>
								Monthly ({isCurrencyLoading ? "…" : monthlyPriceFormatted})
							</button>
							<button
								type="button"
								onClick={() => setBillingCycle("yearly")}
								className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
									billingCycle === "yearly"
										? "bg-white text-blue-600 shadow-xs"
										: "text-gray-600 hover:text-gray-900"
								}`}>
								<span>Yearly</span>
								<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold">
									-20%
								</span>
							</button>
						</div>
					</div>

					{/* Currency Selector */}
					<div>
						<label className="text-xs font-semibold text-gray-700 block mb-1.5">
							Currency
						</label>
						<select
							value={currentCurrencyCode}
							onChange={(e) => setSelectedCurrencyCode(e.target.value)}
							className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer">
							{Object.values(CURRENCIES).map((c) => (
								<option key={c.code} value={c.code}>
									{c.code} ({c.symbol} - {c.label})
								</option>
							))}
						</select>
					</div>
				</div>

				{/* What's Included List */}
				<div className="space-y-2 pt-2">
					<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
						Included in {activePlan.name}:
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{activePlan.features.map((feature) => (
							<div
								key={feature}
								className="flex items-center gap-2 text-xs text-gray-700 font-medium">
								<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
								<span>{feature}</span>
							</div>
						))}
					</div>
				</div>

				{/* Action & Payment Options */}
				<div className="pt-4 border-t border-gray-100 space-y-4">
					<form onSubmit={handleCheckout}>
						<PillButton
							type="submit"
							disabled={isProcessing || isCurrencyLoading}
							baseColor="#004ac6"
							circleColor="#ffffff"
							textColor="#ffffff"
							hoverTextColor="#004ac6"
							className="w-full py-3.5 rounded-xl font-bold text-sm text-center">
							{isProcessing ? (
								<span className="inline-flex items-center gap-2 justify-center">
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Connecting to Payment Gateway...</span>
								</span>
							) : (
								<span>Proceed to Payment →</span>
							)}
						</PillButton>
					</form>

					{/* Supported payment badges */}
					<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-1">
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center gap-1">
								<CreditCard className="w-3.5 h-3.5 text-blue-600" />
								<span>Card</span>
							</span>
							<span className="inline-flex items-center gap-1">
								<Building2 className="w-3.5 h-3.5 text-emerald-600" />
								<span>Bank Transfer</span>
							</span>
							<span className="inline-flex items-center gap-1">
								<Smartphone className="w-3.5 h-3.5 text-purple-600" />
								<span>USSD / Mobile Money</span>
							</span>
						</div>

						<div className="flex items-center gap-1 text-emerald-600 font-medium">
							<ShieldCheck className="w-4 h-4" />
							<span>14-Day Guarantee</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	return (
		<main className="min-h-screen bg-[#f8fafc] w-full overflow-x-hidden text-gray-900">
			<Navbar />
			<Suspense
				fallback={
					<div className="min-h-screen flex items-center justify-center text-xs font-semibold text-gray-500">
						Loading checkout...
					</div>
				}>
				<CheckoutContent />
			</Suspense>
			<Footer />
		</main>
	);
}
