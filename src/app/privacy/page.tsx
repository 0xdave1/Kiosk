/** @format */

"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
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
						Privacy Policy
					</h1>
					<p className="text-xs sm:text-sm text-slate-500">
						Effective: {effectiveDate} &middot; Last updated: {lastUpdated}
					</p>
				</div>
			</section>

			{/* Policy Content */}
			<section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex-1">
				<div className="space-y-10 text-slate-700 text-sm leading-relaxed">
					{/* Summary */}
					<div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs sm:text-sm leading-relaxed">
						<strong>Summary:</strong> Kiosk provides turnkey website creation, hosting,
						and ongoing maintenance. We respect your privacy and never sell your personal
						data. We only collect the information necessary to design, build, host, and
						support your web presence.
					</div>

					{/* 1. Information We Collect */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							1. Information We Collect
						</h3>
						<p>We collect information you provide directly and data generated when you use our services:</p>
						<ul className="list-disc pl-5 space-y-2 text-slate-600">
							<li>
								<strong>Account Details:</strong> Name, business name, email address, and phone number when you register or communicate with us.
							</li>
							<li>
								<strong>Site Content:</strong> Text, images, logos, and materials you provide for your website build.
							</li>
							<li>
								<strong>Payment Details:</strong> Handled securely through our payment provider (Bachs). We do not store payment card numbers or banking credentials on our servers.
							</li>
							<li>
								<strong>Technical Data:</strong> IP address, device type, and standard server log data used to maintain security and platform stability.
							</li>
						</ul>
					</div>

					{/* 2. How We Use Your Information */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							2. How We Use Information
						</h3>
						<p>We use your data strictly for legitimate operational purposes:</p>
						<ul className="list-disc pl-5 space-y-2 text-slate-600">
							<li>To design, publish, host, and manage your website.</li>
							<li>To process subscription payments and issue invoices.</li>
							<li>To respond to your support requests, inquiries, and site revisions.</li>
							<li>To monitor site uptime, performance, and protect against security incidents.</li>
						</ul>
					</div>

					{/* 3. Third-Party Service Providers */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							3. Third-Party Providers
						</h3>
						<p>
							We work with trusted third-party services to deliver our platform. These
							include cloud hosting providers, database infrastructure, and certified
							payment gateways (Bachs). These providers only process information
							strictly as needed to perform their functions on our behalf.
						</p>
					</div>

					{/* 4. Cookies & Preferences */}
					<div id="cookies" className="space-y-3 scroll-mt-24">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							4. Cookies & Tracking
						</h3>
						<p>
							We use essential cookies to keep you signed in, preserve your workspace
							state, and secure our forms. We also use basic analytics to understand
							traffic patterns and improve website speed.
						</p>
						<p>
							You can customize or decline non-essential cookies at any time via the
							Cookie Preferences link in the website footer.
						</p>
					</div>

					{/* 5. Data Retention & Security */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							5. Data Retention & Security
						</h3>
						<p>
							We implement industry-standard administrative and technical safeguards
							to protect your information. Your data is retained as long as your
							subscription remains active. You can request deletion of your account and
							associated assets at any time.
						</p>
					</div>

					{/* 6. Your Rights */}
					<div className="space-y-3">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							6. Your Rights
						</h3>
						<p>
							Depending on your jurisdiction, you have the right to access, update,
							correct, or delete your personal information. You can also export your
							website assets upon request.
						</p>
					</div>

					{/* 7. Contact Us */}
					<div className="space-y-3 pt-4 border-t border-slate-100">
						<h3 className="text-lg sm:text-xl font-bold font-nohemi text-slate-900">
							7. Contact
						</h3>
						<p>
							If you have questions about this policy or wish to exercise your data
							rights, please contact us at{" "}
							<a
								href="mailto:hello@kioosk.online"
								className="text-blue-600 underline font-medium hover:text-blue-800">
								hello@kioosk.online
							</a>{" "}
							or submit a ticket via our{" "}
							<Link
								href="/contact?category=privacy"
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
