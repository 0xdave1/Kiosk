/** @format */

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { projects, subscriptions } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/ratelimit";
import { SiteTemplateFactory } from "@/lib/factory/SiteTemplateFactory";
import type { SiteTier } from "@/lib/factory/SiteTemplateFactory";
import { ProjectSubject } from "@/lib/events/ProjectSubject";

export const dynamic = "force-dynamic";

const createProjectSchema = z.object({
	name: z.string().min(2, "Project name must be at least 2 characters."),
	type: z.enum(["Landing Page", "Sales Funnel", "E-commerce", "E-commerce Store"]),
});

/**
 * GET /api/projects - Returns list of projects for current user's tenant with subscription allowance
 */
export async function GET(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
		const rateLimit = await checkRateLimit(ip, "api");
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 },
			);
		}

		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const tenantProjects = await db.query.projects.findMany({
			where: eq(projects.tenantId, tenant.id),
			orderBy: (p, { desc }) => [desc(p.createdAt)],
		});

		// Count active subscriptions for tenant
		const activeSubs = await db.query.subscriptions.findMany({
			where: and(
				eq(subscriptions.tenantId, tenant.id),
				or(eq(subscriptions.status, "active"), eq(subscriptions.status, "grace_period")),
			),
		});

		// A tenant whose plan is set and billing status is ACTIVE has at least 1 subscription allowance
		const hasActivePlan = tenant.plan !== "NONE" && tenant.billingStatus === "ACTIVE";
		const maxAllowedWebsites = Math.max(activeSubs.length, hasActivePlan ? 1 : 0);
		const isLimitReached = maxAllowedWebsites > 0 && tenantProjects.length >= maxAllowedWebsites;
		const hasNoSubscription = maxAllowedWebsites === 0;

		return NextResponse.json({
			tenant,
			projects: tenantProjects,
			subscriptionUsage: {
				usedWebsites: tenantProjects.length,
				maxAllowedWebsites,
				isLimitReached,
				hasNoSubscription,
				canCreateWebsite: !isLimitReached && !hasNoSubscription,
				plan: tenant.plan,
				billingStatus: tenant.billingStatus,
			},
		});
	} catch (err) {
		console.error("[GET_PROJECTS_ERROR]", err);
		return NextResponse.json(
			{ error: "Failed to fetch projects" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/projects - Creates a new project under the authenticated tenant
 */
export async function POST(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
		const rateLimit = await checkRateLimit(ip, "api");
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 },
			);
		}

		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
		}

		// 1. Verify active subscription status
		const activeSubs = await db.query.subscriptions.findMany({
			where: and(
				eq(subscriptions.tenantId, tenant.id),
				or(eq(subscriptions.status, "active"), eq(subscriptions.status, "grace_period")),
			),
		});

		const hasActivePlan = tenant.plan !== "NONE" && tenant.billingStatus === "ACTIVE";
		const maxAllowedWebsites = Math.max(activeSubs.length, hasActivePlan ? 1 : 0);

		if (maxAllowedWebsites === 0) {
			return NextResponse.json(
				{
					error: "An active subscription is required to generate a website. Please subscribe to a plan to launch your website.",
					code: "NO_ACTIVE_SUBSCRIPTION",
				},
				{ status: 403 },
			);
		}

		// 2. Enforce 1 subscription = 1 website limit
		const existingProjects = await db.query.projects.findMany({
			where: eq(projects.tenantId, tenant.id),
		});

		if (existingProjects.length >= maxAllowedWebsites) {
			const existingProjectName = existingProjects[0]?.name || "your existing website";
			return NextResponse.json(
				{
					error: `Subscription limit reached. An account can only use a subscription for one website, and one subscription cannot be used to generate multiple websites. Your subscription is currently tied to "${existingProjectName}". Please purchase an additional subscription to create another website.`,
					code: "SUBSCRIPTION_LIMIT_REACHED",
					usedWebsites: existingProjects.length,
					maxAllowedWebsites,
				},
				{ status: 403 },
			);
		}

		const body = await request.json();
		const validation = createProjectSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid payload", details: validation.error.flatten() },
				{ status: 400 },
			);
		}

		const { name, type } = validation.data;

		// Map type to template config
		const normalizedType = type === "E-commerce Store" ? "E-commerce" : type;
		const templateConfig = SiteTemplateFactory.createTemplate(normalizedType as SiteTier);

		// Generate clean project subdomain slug
		const projectSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
		const projectSubdomain = projectSlug || "project";

		const [newProject] = await db
			.insert(projects)
			.values({
				id: crypto.randomUUID(),
				tenantId: tenant.id,
				name,
				type,
				status: "In Progress",
				progress: templateConfig.progress,
				publishedUrl: `https://${projectSubdomain}.kioosk.online`,
			})
			.returning();

		// Dispatch domain event
		try {
			const eventBus = ProjectSubject.getInstance();
			await eventBus.notify({
				id: crypto.randomUUID(),
				type: "PROJECT_CREATED",
				timestamp: new Date().toISOString(),
				tenantId: tenant.id,
				payload: newProject,
			});
		} catch {
			// Non-blocking event notification
		}

		return NextResponse.json(
			{
				project: newProject,
				templateConfig,
			},
			{ status: 201 },
		);
	} catch (err) {
		console.error("[POST_PROJECTS_ERROR]", err);
		return NextResponse.json(
			{ error: "Failed to create project" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/projects - Deletes a project by projectId
 */
export async function DELETE(request: Request) {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const projectId = searchParams.get("projectId");

		if (!projectId) {
			return NextResponse.json({ error: "projectId is required" }, { status: 400 });
		}

		// Delete project matching both ID and tenant ownership
		const deleted = await db
			.delete(projects)
			.where(and(eq(projects.id, projectId), eq(projects.tenantId, tenant.id)))
			.returning();

		if (deleted.length === 0) {
			return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Project deleted successfully" });
	} catch (err) {
		console.error("[DELETE_PROJECT_ERROR]", err);
		return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
	}
}
