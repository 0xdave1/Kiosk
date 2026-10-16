/** @format */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/quick-edit - Retrieves editable client content for active live project
 */
export async function GET() {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find the tenant's primary/active project
		const project = await db.query.projects.findFirst({
			where: eq(projects.tenantId, tenant.id),
			orderBy: [desc(projects.updatedAt)],
		});

		if (!project) {
			return NextResponse.json({ error: "No project found for workspace" }, { status: 404 });
		}

		let parsedContent: Record<string, unknown> = {};
		if (project.content) {
			try {
				parsedContent = JSON.parse(project.content);
			} catch {
				parsedContent = {};
			}
		}

		return NextResponse.json({
			projectId: project.id,
			projectName: project.name,
			status: project.status,
			publishedUrl: project.publishedUrl,
			content: parsedContent,
		});
	} catch (err) {
		console.error("[GET_QUICK_EDIT_ERROR]", err);
		return NextResponse.json({ error: "Failed to fetch project content" }, { status: 500 });
	}
}

/**
 * PATCH /api/projects/quick-edit - Atomically saves client quick-edits to live site content
 */
export async function PATCH(request: Request) {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json().catch(() => ({}));

		const project = await db.query.projects.findFirst({
			where: eq(projects.tenantId, tenant.id),
			orderBy: [desc(projects.updatedAt)],
		});

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		let currentContent: Record<string, unknown> = {};
		if (project.content) {
			try {
				currentContent = JSON.parse(project.content);
			} catch {
				currentContent = {};
			}
		}

		// Allowed quick-edit fields
		const {
			announcementBanner,
			businessHours,
			whatsappNumber,
			whatsappLink,
			contactEmail,
			contactPhone,
			locationAddress,
			tagline,
			heroHeadline,
			heroSubheadline,
			aboutText,
			products,
			services,
		} = body;

		const updatedContent = {
			...currentContent,
			...(announcementBanner !== undefined && { announcementBanner }),
			...(businessHours !== undefined && { businessHours }),
			...(whatsappNumber !== undefined && { whatsappNumber }),
			...(whatsappLink !== undefined && { whatsappLink }),
			...(contactEmail !== undefined && { contactEmail }),
			...(contactPhone !== undefined && { contactPhone }),
			...(locationAddress !== undefined && { locationAddress }),
			...(tagline !== undefined && { tagline }),
			...(heroHeadline !== undefined && { heroHeadline }),
			...(heroSubheadline !== undefined && { heroSubheadline }),
			...(aboutText !== undefined && { aboutText }),
			...(Array.isArray(products) && { products }),
			...(Array.isArray(services) && { services }),
		};

		const now = new Date();

		await db
			.update(projects)
			.set({
				content: JSON.stringify(updatedContent),
				updatedAt: now,
			})
			.where(eq(projects.id, project.id));

		return NextResponse.json({
			success: true,
			message: "Website content updated successfully!",
			content: updatedContent,
		});
	} catch (err) {
		console.error("[PATCH_QUICK_EDIT_ERROR]", err);
		return NextResponse.json({ error: "Failed to save quick edits" }, { status: 500 });
	}
}
