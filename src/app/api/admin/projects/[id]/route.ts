/** @format */

import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";
import { db } from "@/db";
import { users, tenants, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CacheService } from "@/lib/cache/CacheService";
import { sendWebsiteLiveEmail } from "@/lib/email";
import { Logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/projects/[id] - Returns full project submission details
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const adminUser = await getAuthenticatedAdmin();
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
		}

		const { id: projectId } = await params;

		const project = await db.query.projects.findFirst({
			where: eq(projects.id, projectId),
		});

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		const tenant = await db.query.tenants.findFirst({
			where: eq(tenants.id, project.tenantId),
		});

		const owner = tenant
			? await db.query.users.findFirst({
					where: eq(users.id, tenant.ownerId),
			  })
			: null;

		// Fetch submitted content from Cache first, then fallback to database snapshot
		const cacheKey = `tenant:content:${project.tenantId}:${project.id}`;
		let content: unknown = await CacheService.get(cacheKey);

		if (!content && project.content) {
			try {
				content = JSON.parse(project.content);
			} catch {
				// Fallback
			}
		}

		return NextResponse.json({
			project: {
				...project,
				tenant,
				owner: owner
					? {
							id: owner.id,
							name: owner.name,
							email: owner.email,
							phone: owner.phone,
							role: owner.role,
							image: owner.image || null,
					  }
					: null,
				content,
			},
		});
	} catch (error) {
		Logger.error("Failed to fetch admin project details", error);
		return NextResponse.json({ error: "Failed to fetch project details" }, { status: 500 });
	}
}

/**
 * PATCH /api/admin/projects/[id] - Updates status, progress, publishedUrl, adminNotes, and triggers launch email
 */
export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const adminUser = await getAuthenticatedAdmin();
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
		}

		const { id: projectId } = await params;
		const body = await request.json();

		const { status, progress, publishedUrl, adminNotes, notifyClient } = body;

		const existingProject = await db.query.projects.findFirst({
			where: eq(projects.id, projectId),
		});

		if (!existingProject) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		const updatePayload: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		if (status !== undefined) updatePayload.status = status;
		if (progress !== undefined) updatePayload.progress = Number(progress);
		if (publishedUrl !== undefined) updatePayload.publishedUrl = publishedUrl;
		if (adminNotes !== undefined) updatePayload.adminNotes = adminNotes;

		await db
			.update(projects)
			.set(updatePayload)
			.where(eq(projects.id, projectId));

		// Invalidate cache
		await CacheService.invalidate(`tenant:projects:${existingProject.tenantId}`);

		// If marked as LIVE and notifyClient is true, trigger launch email
		if (
			(status === "Live" || status === "Published" || notifyClient) &&
			publishedUrl
		) {
			try {
				const tenant = await db.query.tenants.findFirst({
					where: eq(tenants.id, existingProject.tenantId),
				});

				const owner = tenant
					? await db.query.users.findFirst({
							where: eq(users.id, tenant.ownerId),
					  })
					: null;

				if (owner?.email) {
					let businessTitle = existingProject.name;
					if (existingProject.content) {
						try {
							const parsed = typeof existingProject.content === "string" ? JSON.parse(existingProject.content) : existingProject.content;
							if (parsed?.businessName) businessTitle = parsed.businessName;
						} catch {}
					}

					const recipientName = owner.name?.trim() || (owner.email ? owner.email.split("@")[0] : "");

					sendWebsiteLiveEmail({
						toEmail: owner.email,
						clientName: recipientName,
						businessName: businessTitle,
						publishedUrl: publishedUrl,
						plan: existingProject.type,
					}).catch((emailErr) => {
						Logger.error("Failed to dispatch live website email", emailErr);
					});
				}
			} catch (emailTriggerErr) {
				Logger.error("Error triggering launch email", emailTriggerErr);
			}
		}

		Logger.info("Admin updated project", {
			projectId,
			status,
			progress,
			publishedUrl,
			admin: adminUser.email,
		});

		return NextResponse.json({
			success: true,
			message: "Project updated successfully",
			project: {
				...existingProject,
				...updatePayload,
			},
		});
	} catch (error) {
		Logger.error("Failed to update project", error);
		return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
	}
}
