/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PillButton from "@/components/PillButton";
import {
	CreditCard,
	Building2,
	Smartphone,
	CheckCircle2,
	AlertCircle,
	AlertTriangle,
	Clock,
	ExternalLink,
	ShieldAlert,
	Loader2,
	Receipt,
	ArrowRight,
	RefreshCw,
} from "lucide-react";

import { useCurrency } from "@/context/CurrencyContext";
import { PlanKey } from "@/lib/currency";

interface Plan {
	id: string;
	planKey: PlanKey;
	name: string;
	description: string;
	features: string[];
	popular?: boolean;
}

const plans: Plan[] = [
	{
		id: "landing-page",
		planKey: "landing",
		name: "Landing Page",
		description: "Custom single-page website engineered for rapid lead generation.",
		features: [
			"Single page custom website",
			"Delivered in 3-5 days",
			"Mobile responsive & fast",
			"WhatsApp & contact form setup",
		],
	},
	{
		id: "sales-funnel",
		planKey: "funnel",
		name: "Sales Funnel",
		description: "Strategic multi-step funnel engineered to convert prospects.",
		popular: true,
		features: [
			"Up to 5 custom conversion pages",
			"Delivered in 3-5 days",
			"CRM & lead capture integration",
			"Priority support & analytics",
		],
	},
	{
		id: "ecommerce-store",
		planKey: "store",
		name: "E-commerce Store",
		description: "Complete online storefront with checkout & inventory management.",
		features: [
			"Full product catalog setup",
			"Delivered in 5-10 days",
			"Card, Transfer, USSD & Mobile Money",
			"Dedicated onboarding walkthrough",
		],
	},
];

interface DBInvoice {
	id: string;
	invoiceNumber: string;
	plan: string;
	billingCycle: string;
	type: string;
	amount: number;
	currency: string;
	status: "PENDING" | "PAID" | "GRACE_PERIOD" | "PAST_DUE" | "CANCELED";
	paymentLink?: string | null;
	paymentMethod?: string | null;
	dueDate: string;
	gracePeriodEnd: string;
	paidAt?: string | null;
	createdAt: string;
}

export function BillingPageContent() {
	const searchParams = useSearchParams();
	const { formatPlanPrice, currency, isLoading: isCurrencyLoading } = useCurrency();
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
	const [tenantPlan, setTenantPlan] = useState<string>("NONE");
	const [billingStatus, setBillingStatus] = useState<string>("ACTIVE");
	const [autoRenew, setAutoRenew] = useState<boolean>(false);
	const [cardLast4, setCardLast4] = useState<string | null>(null);
	const [cardBrand, setCardBrand] = useState<string | null>(null);
	const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
	const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState<boolean>(false);
	const [autoRenewMessage, setAutoRenewMessage] = useState<string | null>(null);
	const [pendingInvoice, setPendingInvoice] = useState<DBInvoice | null>(null);
	const [invoicesList, setInvoicesList] = useState<DBInvoice[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const statusParam = (searchParams.get("status") || "").toLowerCase();
	const isReturnSuccess =
		statusParam === "successful" ||
		statusParam === "success" ||
		searchParams.get("payment") === "success";
	const isReturnCancelled =
		statusParam === "cancelled" ||
		statusParam === "failed" ||
		searchParams.get("cancelled") === "true";

	useEffect(() => {
		async function fetchBillingInfo() {
			try {
				const res = await fetch("/api/billing/invoices");
				if (res.ok) {
					const data = await res.json();
					if (data.tenant) {
						setTenantPlan(data.tenant.plan || "NONE");
						setBillingStatus(data.tenant.billingStatus || "ACTIVE");
						setAutoRenew(Boolean(data.tenant.autoRenew));
						setCardLast4(data.tenant.cardLast4 || null);
						setCardBrand(data.tenant.cardBrand || null);
						setCurrentPeriodEnd(data.tenant.currentPeriodEnd || null);
					}
					setPendingInvoice(data.pendingInvoice || null);
					setInvoicesList(data.invoices || []);
				}
			} catch (err) {
				console.error("[FETCH_BILLING_ERROR]", err);
			} finally {
				setIsLoading(false);
			}
		}
		fetchBillingInfo();
	}, []);

	const handleToggleAutoRenew = async () => {
		setIsTogglingAutoRenew(true);
		setAutoRenewMessage(null);
		try {
			const res = await fetch("/api/billing/autorenew", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ enabled: !autoRenew }),
			});
			const data = await res.json();
			if (res.ok) {
				setAutoRenew(data.autoRenew);
				setAutoRenewMessage(data.message);
			} else {
				alert(data.error || "Failed to update recurring payment settings");
			}
		} catch (err) {
			alert("Network error updating recurring payment settings");
		} finally {
			setIsTogglingAutoRenew(false);
		}
	};

	const getCurrentPlanTitle = () => {
		const p = (tenantPlan || "").toUpperCase();
		if (p.includes("ECOMMERCE") || p.includes("E_COMMERCE") || p.includes("STORE")) {
			return "E-commerce Store Plan";
		}
		if (p.includes("FUNNEL")) {
			return "Sales Funnel Plan";
		}
		if (p.includes("LANDING")) {
			return "Landing Page Plan";
		}
		return "No Active Subscription";
	};

	const getCurrentPlanDesc = () => {
		const p = (tenantPlan || "").toUpperCase();
		if (p.includes("ECOMMERCE") || p.includes("E_COMMERCE") || p.includes("STORE")) {
			return `You are currently on the E-commerce Store subscription (${formatPlanPrice("store", "monthly")}/mo). Enjoy full online store, product catalog, and WhatsApp commerce features.`;
		}
		if (p.includes("FUNNEL")) {
			return `You are currently on the Sales Funnel subscription (${formatPlanPrice("funnel", "monthly")}/mo). Expand your brand with high-converting pages anytime.`;
		}
		if (p.includes("LANDING")) {
			return `You are currently on the Landing Page subscription (${formatPlanPrice("landing", "monthly")}/mo). Add a Sales Funnel or E-commerce Store to your account anytime.`;
		}
		return "You do not have an active paid subscription. Select a plan below to activate your workspace and order your site.";
	};

	const isPaid = tenantPlan && tenantPlan !== "NONE";

	// Calculate remaining grace period days
	const getGraceDaysRemaining = (graceEndStr: string) => {
		const diff = new Date(graceEndStr).getTime() - Date.now();
		return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	};

	return (
		<div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
				{/* Page Header */}
				<div className="pb-6 border-b border-gray-200/80 mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold font-nohemi text-gray-900 tracking-tight mb-1">
						Billing & Invoicing
					</h1>
					<p className="text-gray-500 text-sm font-medium">
						Manage your subscription plan, pending invoices, and flexible payment methods (Card, Bank Transfer, USSD, Mobile Money).
					</p>
				</div>

				{/* Return Status Alerts */}
				{isReturnSuccess && (
					<div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
						<CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
						<span>
							Payment Confirmed! Your invoice has been settled and your workspace is fully active.
						</span>
					</div>
				)}

				{isReturnCancelled && (
					<div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
						<AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
						<span>
							Payment was cancelled or was not completed. You can pay your invoice whenever you are ready using Card, Transfer, USSD, or Mobile Money.
						</span>
					</div>
				)}

				{/* PENDING INVOICE / GRACE PERIOD ALERT BANNER */}
				{pendingInvoice && (
					<div
						className={`mb-8 p-6 rounded-2xl border ${
							pendingInvoice.status === "PAST_DUE"
								? "bg-red-50 border-red-200 text-red-900"
								: pendingInvoice.status === "GRACE_PERIOD"
								? "bg-amber-50 border-amber-200 text-amber-900"
								: "bg-blue-50 border-blue-200 text-blue-900"
						}`}>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
							<div className="space-y-1.5">
								<div className="flex items-center gap-2">
									{pendingInvoice.status === "PAST_DUE" ? (
										<span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white tracking-wider">
											<ShieldAlert className="w-3.5 h-3.5" />
											Site Flagged / Action Required
										</span>
									) : pendingInvoice.status === "GRACE_PERIOD" ? (
										<span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-600 text-white tracking-wider">
											<Clock className="w-3.5 h-3.5" />
											Grace Period Active ({getGraceDaysRemaining(pendingInvoice.gracePeriodEnd)} Days Remaining)
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
											<Receipt className="w-3.5 h-3.5" />
											Pending Renewal Invoice
										</span>
									)}
								</div>

								<h3 className="text-lg font-bold">
									Invoice #{pendingInvoice.invoiceNumber} — {pendingInvoice.currency} {pendingInvoice.amount}.00 Due
								</h3>
								<p className="text-xs opacity-90 max-w-xl">
									{pendingInvoice.status === "PAST_DUE"
										? "Your website has been temporarily paused because the 7-day grace period ended. Complete the renewal payment to instantly restore your live site."
										: pendingInvoice.status === "GRACE_PERIOD"
										? `Your hosting invoice is overdue, but your site is currently protected by our 7-day grace period. Settle this invoice before the countdown expires.`
										: "Your upcoming hosting renewal is ready. Click below to pay via Card, Bank Transfer, USSD, or Mobile Money."}
								</p>
							</div>

							{pendingInvoice.paymentLink && (
								<div className="shrink-0">
									{pendingInvoice.paymentLink.startsWith("/") ? (
										<Link
											href={pendingInvoice.paymentLink}
											className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs shadow-md transition-all ${
												pendingInvoice.status === "PAST_DUE"
													? "bg-red-600 hover:bg-red-700 text-white"
													: pendingInvoice.status === "GRACE_PERIOD"
													? "bg-amber-600 hover:bg-amber-700 text-white"
													: "bg-blue-600 hover:bg-blue-700 text-white"
											}`}>
											<span>Pay Invoice ({pendingInvoice.currency} {pendingInvoice.amount}.00)</span>
											<ArrowRight className="w-3.5 h-3.5" />
										</Link>
									) : (
										<a
											href={pendingInvoice.paymentLink}
											target="_blank"
											rel="noopener noreferrer"
											className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs shadow-md transition-all ${
												pendingInvoice.status === "PAST_DUE"
													? "bg-red-600 hover:bg-red-700 text-white"
													: pendingInvoice.status === "GRACE_PERIOD"
													? "bg-amber-600 hover:bg-amber-700 text-white"
													: "bg-blue-600 hover:bg-blue-700 text-white"
											}`}>
											<span>Pay Invoice ({pendingInvoice.currency} {pendingInvoice.amount}.00)</span>
											<ExternalLink className="w-3.5 h-3.5" />
										</a>
									)}
								</div>
							)}
						</div>

						{/* Payment Channels Notice */}
						<div className="mt-4 pt-4 border-t border-black/10 flex flex-wrap items-center gap-4 text-xs font-semibold">
							<span className="text-[11px] uppercase tracking-wider opacity-75">Supported Payment Channels:</span>
							<span className="inline-flex items-center gap-1">
								<CreditCard className="w-3.5 h-3.5 text-blue-600" />
								<span>Card (Visa, Master, Verve)</span>
							</span>
							<span className="inline-flex items-center gap-1">
								<Building2 className="w-3.5 h-3.5 text-emerald-600" />
								<span>Bank Transfer</span>
							</span>
							<span className="inline-flex items-center gap-1">
								<Smartphone className="w-3.5 h-3.5 text-purple-600" />
								<span>USSD & Mobile Money</span>
							</span>
						</div>
					</div>
				)}

				{/* Active Plan Card */}
				<div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div>
						<div className="flex items-center gap-2.5 mb-2">
							<span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
								Current Workspace
							</span>
							<span
								className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
									billingStatus === "PAST_DUE"
										? "text-red-700 bg-red-100"
										: billingStatus === "GRACE_PERIOD"
										? "text-amber-700 bg-amber-100"
										: isPaid
										? "text-emerald-700 bg-emerald-50"
										: "text-gray-500 bg-gray-100"
								}`}>
								{billingStatus === "PAST_DUE"
									? "Site Flagged"
									: billingStatus === "GRACE_PERIOD"
									? "Grace Period"
									: isPaid
									? "Active"
									: "No Plan"}
							</span>
						</div>
						<h2 className="text-2xl font-bold font-nohemi text-gray-900 mb-1">
							{isLoading ? "Loading plan..." : getCurrentPlanTitle()}
						</h2>
						<p className="text-xs text-gray-500 max-w-lg">
							{isCurrencyLoading ? "Loading pricing..." : getCurrentPlanDesc()}
						</p>
					</div>

					{/* Billing Cycle Switcher */}
					<div className="flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200/80 shrink-0 self-start md:self-auto">
						<button
							type="button"
							onClick={() => setBillingCycle("monthly")}
							className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
								billingCycle === "monthly"
									? "bg-white text-gray-900 shadow-xs"
									: "text-gray-500 hover:text-gray-900"
							}`}>
							Monthly
						</button>
						<button
							type="button"
							onClick={() => setBillingCycle("yearly")}
							className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
								billingCycle === "yearly"
									? "bg-white text-gray-900 shadow-xs"
									: "text-gray-500 hover:text-gray-900"
							}`}>
							<span>Yearly</span>
							<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold uppercase">
								-20%
							</span>
						</button>
					</div>
				</div>

				{/* RECURRING PAYMENT / AUTO-RENEWAL STATUS CARD */}
				{isPaid && (
					<div
						className={`mb-10 p-6 sm:p-7 rounded-2xl border transition-all ${
							autoRenew
								? "bg-slate-900 border-slate-800 text-white shadow-md"
								: "bg-amber-50/70 border-amber-200 text-amber-950 shadow-xs"
						}`}>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									{autoRenew ? (
										<span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
											<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
											Auto-Renewal Active
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30">
											<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
											Recurring Payment Not Set — Plan Will Terminate
										</span>
									)}
								</div>

								<h3 className="text-lg font-bold">
									{autoRenew
										? `Recurring Card Debit (${(cardBrand || "Card").toUpperCase()} •••• ${cardLast4 || "••••"})`
										: "No Recurring Payment Configured"}
								</h3>

								<p className="text-xs opacity-90 max-w-xl leading-relaxed">
									{autoRenew
										? `Your monthly hosting subscription will automatically renew at the end of the 1-month period${
												currentPeriodEnd ? ` on ${new Date(currentPeriodEnd).toLocaleDateString()}` : ""
										  }. You will receive an email receipt upon successful renewal.`
										: `Warning: If recurring payment is not configured, your subscription will be automatically terminated at the end of your 1-month period${
												currentPeriodEnd ? ` (${new Date(currentPeriodEnd).toLocaleDateString()})` : ""
										  } and your live website will be paused.`}
								</p>

								{autoRenewMessage && (
									<p className="text-xs font-semibold text-blue-400 pt-1">
										{autoRenewMessage}
									</p>
								)}
							</div>

							<div className="shrink-0 flex items-center gap-3">
								{cardLast4 ? (
									<button
										type="button"
										onClick={handleToggleAutoRenew}
										disabled={isTogglingAutoRenew}
										className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
											autoRenew
												? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
												: "bg-emerald-600 hover:bg-emerald-700 text-white"
										}`}>
										{isTogglingAutoRenew && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
										<span>{autoRenew ? "Cancel Recurring Renewal" : "Re-Enable Auto-Renewal"}</span>
									</button>
								) : (
									pendingInvoice?.paymentLink ? (
										pendingInvoice.paymentLink.startsWith("/") ? (
											<Link
												href={pendingInvoice.paymentLink}
												className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs flex items-center gap-2">
												<CreditCard className="w-3.5 h-3.5" />
												<span>Pay & Enable Auto-Debit</span>
											</Link>
										) : (
											<a
												href={pendingInvoice.paymentLink}
												target="_blank"
												rel="noopener noreferrer"
												className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs flex items-center gap-2">
												<CreditCard className="w-3.5 h-3.5" />
												<span>Pay & Enable Auto-Debit</span>
											</a>
										)
									) : (
										<div className="text-xs text-amber-800 font-medium">
											Pay with Card on next renewal to enable auto-debit
										</div>
									)
								)}
							</div>
						</div>
					</div>
				)}

				{/* Available Upgrade Plans Grid */}
				<div className="mb-12">
					<h2 className="text-xl font-bold font-nohemi text-gray-900 mb-6">
						Available Plans
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{plans.map((plan) => {
							const price = formatPlanPrice(plan.planKey, billingCycle);
							const period =
								billingCycle === "yearly" ? "/ year" : "/ month";

							return (
								<div
									key={plan.id}
									className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all duration-200 ${
										plan.popular
											? "border-blue-600 shadow-xs ring-1 ring-blue-600/20"
											: "border-gray-200/90 hover:border-gray-300"
									}`}>
									<div>
										<div className="flex items-center justify-between mb-2">
											<h3 className="text-lg font-bold font-nohemi text-gray-900">
												{plan.name}
											</h3>
											{plan.popular && (
												<span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
													Popular
												</span>
											)}
										</div>

										<p className="text-xs text-gray-500 mb-4 leading-relaxed">
											{plan.description}
										</p>

										<div className="mb-6 flex items-baseline gap-1.5">
											<span className="text-3xl font-bold font-nohemi text-gray-900">
												{price}
											</span>
											<span className="text-xs text-gray-400 font-medium">
												{period}
											</span>
										</div>

										<ul className="space-y-2.5 mb-6">
											{plan.features.map((feat) => (
												<li
													key={feat}
													className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
													<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
													<span>{feat}</span>
												</li>
											))}
										</ul>
									</div>

									<PillButton
										href={`/checkout?plan=${plan.id}&billing=${billingCycle}`}
										baseColor={plan.popular ? "#004ac6" : "#ffffff"}
										circleColor={plan.popular ? "#ffffff" : "#004ac6"}
										textColor={plan.popular ? "#ffffff" : "#004ac6"}
										hoverTextColor={plan.popular ? "#004ac6" : "#ffffff"}
										useThunderFont={true}
										className={`w-full py-3 rounded-full font-bold text-sm border-2 ${
											plan.popular
												? "border-blue-600 shadow-md"
												: "border-blue-600"
										}`}>
										Choose {plan.name}
									</PillButton>
								</div>
							);
						})}
					</div>
				</div>

				{/* Invoice History Table */}
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold font-nohemi text-gray-900">
							Invoice History
						</h2>
						<span className="text-xs text-gray-500 font-medium">
							Supports Card, Bank Transfer, USSD & Mobile Money
						</span>
					</div>

					<div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs">
						{isLoading ? (
							<div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
								<span>Loading invoice records...</span>
							</div>
						) : invoicesList.length === 0 ? (
							<div className="p-8 text-center text-xs text-gray-500">
								No invoice history yet. When your setup or renewal invoices are generated, they will appear here.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
											<th className="py-3.5 px-5">Invoice ID</th>
											<th className="py-3.5 px-5">Type / Plan</th>
											<th className="py-3.5 px-5">Date Due</th>
											<th className="py-3.5 px-5">Amount</th>
											<th className="py-3.5 px-5">Method</th>
											<th className="py-3.5 px-5">Status</th>
											<th className="py-3.5 px-5 text-right">Action</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100 text-xs">
										{invoicesList.map((inv) => (
											<tr
												key={inv.id}
												className="hover:bg-gray-50/50 transition-colors">
												<td className="py-4 px-5 font-mono font-semibold text-gray-900">
													#{inv.invoiceNumber}
												</td>
												<td className="py-4 px-5">
													<p className="font-semibold text-gray-900">
														{inv.plan.replace(/_/g, " ")}
													</p>
													<span className="text-[10px] text-gray-400 font-medium">
														{inv.type === "INITIAL_SETUP" ? "Setup & Initial" : "Monthly Renewal"}
													</span>
												</td>
												<td className="py-4 px-5 text-gray-600 font-medium">
													{new Date(inv.dueDate).toLocaleDateString()}
												</td>
												<td className="py-4 px-5 text-gray-900 font-bold">
													{inv.currency} {inv.amount}.00
												</td>
												<td className="py-4 px-5 capitalize text-gray-600 font-medium">
													{inv.paymentMethod ? (
														<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold">
															{inv.paymentMethod === "card" && <CreditCard className="w-3 h-3 text-blue-600" />}
															{inv.paymentMethod === "banktransfer" && <Building2 className="w-3 h-3 text-emerald-600" />}
															{(inv.paymentMethod === "ussd" || inv.paymentMethod === "mobilemoney") && (
																<Smartphone className="w-3 h-3 text-purple-600" />
															)}
															<span>{inv.paymentMethod.replace(/_/g, " ")}</span>
														</span>
													) : (
														<span className="text-gray-400 text-[11px]">Multi-Method</span>
													)}
												</td>
												<td className="py-4 px-5">
													<span
														className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
															inv.status === "PAID"
																? "bg-emerald-50 text-emerald-700"
																: inv.status === "GRACE_PERIOD"
																? "bg-amber-50 text-amber-700"
																: inv.status === "PAST_DUE"
																? "bg-red-50 text-red-700"
																: "bg-blue-50 text-blue-700"
														}`}>
														<span
															className={`w-1.5 h-1.5 rounded-full ${
																inv.status === "PAID"
																	? "bg-emerald-600"
																	: inv.status === "GRACE_PERIOD"
																	? "bg-amber-600"
																	: inv.status === "PAST_DUE"
																	? "bg-red-600"
																	: "bg-blue-600"
															}`}
														/>
														{inv.status}
													</span>
												</td>
												<td className="py-4 px-5 text-right">
													{inv.status === "PAID" ? (
														<span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
															<CheckCircle2 className="w-3.5 h-3.5" />
															<span>Receipt Emailed</span>
														</span>
													) : inv.paymentLink ? (
														inv.paymentLink.startsWith("/") ? (
															<Link
																href={inv.paymentLink}
																className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition-colors">
																<span>Pay Now</span>
																<ArrowRight className="w-3 h-3" />
															</Link>
														) : (
															<a
																href={inv.paymentLink}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition-colors">
																<span>Pay Now</span>
																<ExternalLink className="w-3 h-3" />
															</a>
														)
													) : (
														<span className="text-gray-400 text-[11px]">Pending Link</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* Billing Support Banner */}
					<div className="mt-8 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<h3 className="text-sm font-bold text-gray-900">
								Questions about your subscription or invoices?
							</h3>
							<p className="text-xs text-gray-600 mt-0.5">
								Our support team can assist you with payment confirmation, invoices, or custom billing cycles.
							</p>
						</div>
						<Link
							href="/contact?category=billing"
							className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs">
							Contact Billing Support
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function BillingPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center text-xs font-semibold text-gray-500 bg-[#f8fafc]">
					<div className="inline-flex items-center gap-2">
						<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
						<span>Loading billing information...</span>
					</div>
				</div>
			}>
			<BillingPageContent />
		</Suspense>
	);
}

