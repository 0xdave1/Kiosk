/** @format */

import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Logger } from "@/lib/logger";
import type { TenantContentData } from "@/components/tenant/TenantLiveSite";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/projects - Returns all tenant projects with business details, owner info, and statuses
 */
export async function GET(request: Request) {
	try {
		const adminUser = await getAuthenticatedAdmin();
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
		}

		const url = new URL(request.url);
		const statusFilter = url.searchParams.get("status") || "ALL";
		const searchQuery = (url.searchParams.get("search") || "").toLowerCase().trim();

		// Fetch all projects with their parent tenant and owner
		const allProjects = await db.query.projects.findMany({
			orderBy: [desc(projects.updatedAt)],
		});

		const allTenants = await db.query.tenants.findMany();
		const allUsers = await db.query.users.findMany();

		const tenantMap = new Map(allTenants.map((t) => [t.id, t]));
		const userMap = new Map(allUsers.map((u) => [u.id, u]));

		let enriched = allProjects.map((p) => {
			const tenant = tenantMap.get(p.tenantId);
			const owner = tenant ? userMap.get(tenant.ownerId) : null;

			let parsedContent: TenantContentData | null = null;
			if (p.content) {
				try {
					parsedContent = JSON.parse(p.content);
				} catch {
					// Fallback
				}
			}

			return {
				id: p.id,
				name: p.name,
				type: p.type,
				status: p.status,
				progress: p.progress,
				publishedUrl: p.publishedUrl,
				adminNotes: p.adminNotes,
				createdAt: p.createdAt,
				updatedAt: p.updatedAt,
				tenant: tenant
					? {
							id: tenant.id,
							name: tenant.name,
							slug: tenant.slug,
							plan: tenant.plan,
							customDomain: tenant.customDomain,
							billingStatus: tenant.billingStatus,
					  }
					: null,
				owner: owner
					? {
							id: owner.id,
							name: owner.name,
							email: owner.email,
							phone: owner.phone,
							image: owner.image || null,
					  }
					: null,
				businessName: parsedContent?.businessName || p.name,
				tagline: parsedContent?.tagline || null,
				logoUrl: parsedContent?.logoImage?.url || null,
				imagesCount: Array.isArray(parsedContent?.uploadedImages) ? parsedContent.uploadedImages.length : 0,
				hasSubmittedContent: !!parsedContent,
			};
		});

		// Apply status filter
		if (statusFilter !== "ALL") {
			enriched = enriched.filter((p) => p.status.toLowerCase() === statusFilter.toLowerCase());
		}

		// Apply search filter
		if (searchQuery) {
			enriched = enriched.filter(
				(p) =>
					p.name.toLowerCase().includes(searchQuery) ||
					(p.businessName && p.businessName.toLowerCase().includes(searchQuery)) ||
					(p.owner?.email && p.owner.email.toLowerCase().includes(searchQuery)) ||
					(p.owner?.name && p.owner.name.toLowerCase().includes(searchQuery)) ||
					(p.tenant?.slug && p.tenant.slug.toLowerCase().includes(searchQuery)),
			);
		}

		return NextResponse.json({ projects: enriched });
	} catch (error) {
		Logger.error("Failed to fetch admin projects list", error);
		return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
	}
}
