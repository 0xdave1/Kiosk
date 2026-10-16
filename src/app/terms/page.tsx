/** @format */

"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
	const lastUpdated = "September 16, 2026";
	const effectiveDate = "January 1, 2026";

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
						Terms of Service
					</h1>
					<p className="text-xs sm:text-sm text-slate-500">
						Effective: {effectiveDate} &middot; Last updated: {lastUpdated}
					</p>
				</div>
			</section>

			{/* Terms Content */}
			<section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex-1">
				<div className="space-y-10 text-slate-700 text-sm leading-relaxed">
					{/* Summary */}
					<div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs sm:text-sm leading-relaxed">
						<strong>Summary:</strong> These Terms outline your rights and responsibilities
						when using Kiosk. We provide turnkey website development, hosting, and
						maintenance. You own your content, enjoy a 30-day money-back guarantee, and
						can cancel anytime with no lock-in.
					</div>

					{/* 1. Services & Turnkey Scope */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							1. Services & Delivery
						</h3>
						<p>
							Kiosk delivers full-service website design, development, cloud hosting, and
							routine site updates under our active subscription plans.
						</p>
						<ul className="list-disc pl-5 space-y-2 text-slate-600">
							<li>
								<strong>Turnkey Delivery:</strong> We aim to deliver the initial website build within 3 to 5 business days after receiving your required content, logo, and design direction.
							</li>
							<li>
								<strong>Revisions:</strong> We provide unlimited revisions during development to ensure your site meets your brand standards before launch.
							</li>
						</ul>
					</div>

					{/* 2. Billing, Subscriptions & Renewals */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							2. Billing & Subscriptions
						</h3>
						<p>
							Plans are billed in advance on a recurring monthly or annual basis via our
							certified payment partner (Bachs).
						</p>
						<p>
							Subscriptions renew automatically until cancelled. You can view invoices and
							manage your billing preferences anytime from your client dashboard.
						</p>
					</div>

					{/* 3. 30-Day Guarantee & Cancellation */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							3. Money-Back Guarantee & Cancellation
						</h3>
						<p>
							We offer a <strong>30-day money-back guarantee</strong> on all new plans. If
							you are not satisfied with your website within 30 days of initial signup,
							you can request a full refund with no questions asked.
						</p>
						<p>
							There are no long-term contracts or cancellation penalties. You may cancel
							your subscription at any time. Your site will remain active through the end
							of the paid billing period.
						</p>
					</div>

					{/* 4. Ownership & Intellectual Property */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							4. Intellectual Property & Ownership
						</h3>
						<ul className="list-disc pl-5 space-y-2 text-slate-600">
							<li>
								<strong>Your Content:</strong> You retain 100% ownership of all trademarks, copy, images, product catalogs, and branding materials you provide.
							</li>
							<li>
								<strong>Website Assets:</strong> Once account balances are settled, you own the website design and custom assets created for your business. You can request an export of your site files at any time.
							</li>
							<li>
								<strong>Platform Code:</strong> Kiosk retains ownership of the underlying proprietary hosting infrastructure, dashboard software, and core templates.
							</li>
						</ul>
					</div>

					{/* 5. Hosting & Domain Names */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							5. Hosting & Custom Domains
						</h3>
						<p>
							All sites include managed cloud hosting with automated SSL encryption and a
							target of 99.9% uptime. You can connect your own custom domain, and we will
							assist with DNS setup at no extra charge.
						</p>
					</div>

					{/* 6. Acceptable Use */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							6. Acceptable Use
						</h3>
						<p>
							You agree not to use Kiosk services to publish unlawful, fraudulent, defamatory,
							or infringing material, or to transmit malicious software. We reserve the right
							to suspend sites that violate this policy or engage in illegal activities.
						</p>
					</div>

					{/* 7. Limitation of Liability */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							7. Limitation of Liability
						</h3>
						<p>
							Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum
							extent permitted by applicable law, Kiosk shall not be liable for indirect,
							incidental, or consequential damages. Our total liability for any claim arising
							out of these Terms is limited to the amount paid by you in the preceding 12 months.
						</p>
					</div>

					{/* 8. Governing Law & Inquiries */}
					<div className="space-y-3 pt-4 border-t border-slate-100">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							8. Governing Law & Contact
						</h3>
						<p>
							These Terms are governed by applicable laws without regard to conflict of law
							principles.
						</p>
						<p>
							For questions regarding these Terms, please email{" "}
							<a
								href="mailto:hello@kioosk.online"
								className="text-blue-600 underline font-medium hover:text-blue-800">
								hello@kioosk.online
							</a>{" "}
							or open a ticket via our{" "}
							<Link
								href="/contact?category=legal"
								className="text-blue-600 underline font-medium hover:text-blue-800">
								Support Desk
							</Link>
							.
						</p>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}
