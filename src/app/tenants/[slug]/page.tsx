/** @format */

import React from "react";
import type { Metadata } from "next";
import { db } from "@/db";
import { tenants, projects } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import TenantLiveSite from "@/components/tenant/TenantLiveSite";
import type { TenantContentData } from "@/components/tenant/TenantLiveSite";
import UnderConstructionView from "@/components/tenant/UnderConstructionView";
import SubscriptionExpiredView from "@/components/tenant/SubscriptionExpiredView";
import TenantTracker from "@/components/tenant/TenantTracker";
import { getCustomClientTemplate } from "@/clients_websites";
import Link from "next/link";
import { Globe, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
	params: Promise<{
		slug: string;
	}>;
}

async function resolveTenantAndProject(slug: string) {
	const cleanSlug = slug.toLowerCase().trim();

	// 1. Match directly by tenant slug
	let tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, cleanSlug),
	});

	let project: typeof projects.$inferSelect | undefined;

	if (tenant) {
		project = await db.query.projects.findFirst({
			where: eq(projects.tenantId, tenant.id),
			orderBy: (p, { desc }) => [desc(p.updatedAt)],
		});
	} else {
		// 2. Match by project publishedUrl (e.g. "https://my-store.kioosk.online")
		project = await db.query.projects.findFirst({
			where: or(
				ilike(projects.publishedUrl, `%://${cleanSlug}.%`),
				ilike(projects.publishedUrl, `%/${cleanSlug}`),
			),
			orderBy: (p, { desc }) => [desc(p.updatedAt)],
		});

		if (project) {
			tenant = await db.query.tenants.findFirst({
				where: eq(tenants.id, project.tenantId),
			});
		}
	}

	return { tenant, project, cleanSlug };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const { tenant, project } = await resolveTenantAndProject(slug);

	if (!tenant) {
		return { title: "Website Not Found | Kiosk" };
	}

	let parsed: TenantContentData = {};
	if (project?.content) {
		try {
			parsed = JSON.parse(project.content);
		} catch (e) {}
	}

	const businessName = parsed.businessName || tenant.name || "Business Website";
	const tagline = parsed.tagline || "Official Online Store & Services";
	const faviconUrl =
		parsed.logoImage?.url ||
		`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23004ac6'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='sans-serif'>${encodeURIComponent(businessName.trim().charAt(0).toUpperCase() || "W")}</text></svg>`;

	return {
		title: `${businessName} | ${tagline}`,
		description: parsed.aboutText || tagline,
		icons: {
			icon: [{ url: faviconUrl }],
			shortcut: [{ url: faviconUrl }],
			apple: [{ url: faviconUrl }],
		},
		openGraph: {
			title: businessName,
			description: tagline,
			images: parsed.logoImage?.url ? [parsed.logoImage.url] : [],
		},
	};
}

export default async function TenantSubdomainPage({ params }: PageProps) {
	const { slug } = await params;
	const { tenant, project, cleanSlug } = await resolveTenantAndProject(slug);

	if (!tenant) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
					<div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
						<Globe className="w-6 h-6" />
					</div>
					<h2 className="text-xl font-bold text-gray-900">Website Not Found</h2>
					<p className="text-xs text-gray-500">
						The subdomain <code className="font-bold text-gray-700">{cleanSlug}.kioosk.online</code> is not registered yet.
					</p>
					<Link
						href="https://kioosk.online"
						className="inline-block px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors">
						Claim This Domain on Kiosk
					</Link>
				</div>
			</div>
		);
	}

	let parsedContent: TenantContentData = {};
	if (project?.content) {
		try {
			parsedContent = JSON.parse(project.content);
		} catch (e) {}
	}

	const businessName = parsedContent.businessName || tenant.name || cleanSlug;
	const faviconUrl =
		parsedContent.logoImage?.url ||
		`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23004ac6'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='sans-serif'>${encodeURIComponent(businessName.trim().charAt(0).toUpperCase() || "W")}</text></svg>`;

	// Check if plan has been terminated or suspended at the end of the subscription period
	const isPlanTerminated =
		tenant.plan === "NONE" ||
		tenant.billingStatus === "SUSPENDED" ||
		project?.status === "Suspended" ||
		(tenant.currentPeriodEnd && new Date() > new Date(tenant.currentPeriodEnd) && tenant.billingStatus === "PAST_DUE");

	if (isPlanTerminated) {
		return (
			<>
				<link rel="icon" href={faviconUrl} />
				<link rel="shortcut icon" href={faviconUrl} />
				<link rel="apple-touch-icon" href={faviconUrl} />
				{parsedContent.logoImage?.url && <meta name="client-logo" content={parsedContent.logoImage.url} />}
				<meta name="client-business-name" content={businessName} />
				<SubscriptionExpiredView
					businessName={businessName}
					logoUrl={parsedContent.logoImage?.url}
					tenantSlug={tenant.slug}
					whatsapp={parsedContent.whatsappNumber || parsedContent.whatsappLink}
					contactEmail={parsedContent.contactEmail}
				/>
			</>
		);
	}

	const isLive = project?.status === "Live" || project?.status === "Published";

	if (!isLive) {
		return (
			<>
				<link rel="icon" href={faviconUrl} />
				<link rel="shortcut icon" href={faviconUrl} />
				<link rel="apple-touch-icon" href={faviconUrl} />
				{parsedContent.logoImage?.url && <meta name="client-logo" content={parsedContent.logoImage.url} />}
				<meta name="client-business-name" content={businessName} />
				<UnderConstructionView
					businessName={businessName}
					tagline={parsedContent.tagline}
					logoUrl={parsedContent.logoImage?.url}
					progress={project?.progress || 85}
					whatsapp={parsedContent.whatsappNumber || parsedContent.whatsappLink}
					contactEmail={parsedContent.contactEmail}
					contactPhone={parsedContent.contactPhone}
					tenantSlug={tenant.slug}
				/>
			</>
		);
	}

	const publishedUrl = project?.publishedUrl || `https://${tenant.slug}.kioosk.online`;
	const clientLogo = parsedContent.logoImage?.url || "";
	const CustomComponent =
		getCustomClientTemplate(cleanSlug) || getCustomClientTemplate(tenant.slug);

	return (
		<>
			<TenantTracker tenantSlug={tenant.slug} />
			<link rel="icon" href={faviconUrl} />
			<link rel="shortcut icon" href={faviconUrl} />
			<link rel="apple-touch-icon" href={faviconUrl} />
			{clientLogo && <meta name="client-logo" content={clientLogo} />}
			<meta name="client-business-name" content={businessName} />
			{CustomComponent ? (
				<CustomComponent
					tenantSlug={tenant.slug}
					plan={tenant.plan}
					content={parsedContent}
					publishedUrl={publishedUrl}
				/>
			) : (
				<TenantLiveSite
					tenantSlug={tenant.slug}
					plan={tenant.plan}
					content={parsedContent}
					publishedUrl={publishedUrl}
				/>
			)}
		</>
	);
}
