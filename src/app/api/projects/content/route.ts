/** @format */

import { NextResponse, after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";
import { CacheService } from "@/lib/cache/CacheService";
import { ProjectSubject } from "@/lib/events/ProjectSubject";
import { Logger } from "@/lib/logger";
import {
	sendWebsiteReviewNotificationToAdmin,
	sendWebsiteReviewConfirmationToClient,
} from "@/lib/email";
import { processAutoBuildJob } from "@/inngest/functions/autoBuilder";

const contentPayloadSchema = z.object({
	projectId: z.string().optional(),
	plan: z.string().optional(),
	businessName: z.string().min(2, "Business name is required"),
	tagline: z.string().min(2, "Tagline is required"),
	aboutText: z.string().optional().default(""),
	servicesList: z.string().optional().default(""),
	contactEmail: z.string().optional().default(""),
	contactPhone: z.string().optional().default(""),
	contactAddress: z.string().optional(),
	leadMagnetTitle: z.string().optional(),
	valueStack: z.string().optional(),
	testimonials: z.string().optional(),
	productCatalog: z.string().optional(),
	// Elaborate Landing Page Fields
	services: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string().optional().default(""),
				icon: z.string().optional().default(""),
				price: z.string().optional().default(""),
			}),
		)
		.optional(),
	testimonialsList: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				role: z.string().optional().default(""),
				review: z.string(),
				rating: z.number().optional().default(5),
				avatarUrl: z.string().optional().default(""),
			}),
		)
		.optional(),
	faqs: z
		.array(
			z.object({
				id: z.string(),
				question: z.string(),
				answer: z.string(),
			}),
		)
		.optional(),
	stats: z
		.array(
			z.object({
				id: z.string(),
				label: z.string(),
				value: z.string(),
			}),
		)
		.optional(),
	ctaText: z.string().optional().default("Get Started Today"),

	// Elaborate Sales Funnel Fields
	videoUrl: z.string().optional().default(""),
	countdownMinutes: z.union([z.number(), z.string()]).optional().default(15),
	valueStackItems: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				value: z.string(),
				description: z.string().optional().default(""),
				isBonus: z.boolean().optional().default(false),
			}),
		)
		.optional(),
	regularPrice: z.union([z.number(), z.string()]).optional().default(497),
	discountPrice: z.union([z.number(), z.string()]).optional().default(97),
	orderBumpTitle: z.string().optional().default(""),
	orderBumpPrice: z.union([z.number(), z.string()]).optional().default(27),
	orderBumpDescription: z.string().optional().default(""),
	guaranteeText: z.string().optional().default("30-Day 100% Money-Back Guarantee"),

	// E-Commerce Fields
	products: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				price: z.union([z.number(), z.string()]),
				description: z.string().optional().default(""),
				category: z.string().optional().default("General"),
				imageUrl: z.string().optional().default(""),
				badge: z.string().optional().default(""),
			}),
		)
		.optional(),
	currency: z.string().optional(),
	shippingInfo: z.string().optional(),
	selectedFont: z.string().optional(),
	themeMode: z.enum(["light", "dark"]).optional().default("light"),
	whatsappLink: z.string().optional().default(""),
	xLink: z.string().optional().default(""),
	instagramLink: z.string().optional().default(""),
	facebookLink: z.string().optional().default(""),
	linkedinLink: z.string().optional().default(""),
	youtubeLink: z.string().optional().default(""),
	tiktokLink: z.string().optional().default(""),
	bookingLink: z.string().optional().default(""),
	customLink: z.string().optional().default(""),
	logoImage: z
		.object({
			id: z.string(),
			name: z.string(),
			size: z.string(),
			url: z.string(),
		})
		.nullable()
		.optional(),
	uploadedImages: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				size: z.string(),
				url: z.string(),
			}),
		)
		.optional(),
});

/**
 * GET /api/projects/content - Retrieves saved business content and brand assets for a specific project
 */
export async function GET(request: Request) {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const projectId = searchParams.get("projectId");

		const cacheKey = projectId
			? `tenant:content:${tenant.id}:${projectId}`
			: `tenant:content:${tenant.id}`;

		const savedContent = await CacheService.get(cacheKey);

		return NextResponse.json({ content: savedContent || null });
	} catch (err) {
		Logger.error("Failed to retrieve project content", err);
		return NextResponse.json({ error: "Failed to load project content" }, { status: 500 });
	}
}

/**
 * POST /api/projects/content - Saves business content & brand assets for a specific project
 */
export async function POST(request: Request) {
	try {
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user || !tenant) {
			return NextResponse.json({ error: "Tenant workspace not found or unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validation = contentPayloadSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid payload", details: validation.error.flatten() },
				{ status: 400 },
			);
		}

		const contentData = validation.data;

		// Server-side guard: Strip any dead blob: URLs before saving to cache, DB, or background builders
		if (contentData.logoImage?.url?.startsWith("blob:")) {
			contentData.logoImage = null;
		}
		if (Array.isArray(contentData.uploadedImages)) {
			contentData.uploadedImages = contentData.uploadedImages.filter(
				(img) => img?.url && !img.url.startsWith("blob:"),
			);
		}
		if (Array.isArray(contentData.products)) {
			contentData.products = contentData.products.map((p) => ({
				...p,
				imageUrl: (p.imageUrl || "").startsWith("blob:") ? "" : p.imageUrl,
			}));
		}

		const projectId = contentData.projectId;

		const cacheKey = projectId
			? `tenant:content:${tenant.id}:${projectId}`
			: `tenant:content:${tenant.id}`;

		// Store in Cache (Persistent 30 days)
		await CacheService.set(cacheKey, contentData, 2592000);

		// Update specific Project Progress to 85% & Status to "In Review"
		// Update specific Project Progress to 85%, Status to "In Review", and store content in database
		let targetProjectId = projectId;
		if (projectId) {
			await db
				.update(projects)
				.set({
					progress: 85,
					status: "In Review",
					content: JSON.stringify(contentData),
					updatedAt: new Date(),
				})
				.where(and(eq(projects.id, projectId), eq(projects.tenantId, tenant.id)));
		} else {
			const userProjects = await db.query.projects.findMany({
				where: eq(projects.tenantId, tenant.id),
			});
			if (userProjects.length > 0) {
				targetProjectId = userProjects[0].id;
				await db
					.update(projects)
					.set({
						progress: 85,
						status: "In Review",
						content: JSON.stringify(contentData),
						updatedAt: new Date(),
					})
					.where(eq(projects.id, userProjects[0].id));
			} else {
				// Provision initial single website under this subscription
				const projectSlug = contentData.businessName
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "-")
					.replace(/-+/g, "-")
					.replace(/^-|-$/g, "");
				const projectSubdomain = projectSlug || `site-${crypto.randomUUID().slice(0, 6)}`;
				const planType =
					contentData.plan === "E_COMMERCE"
						? "E-commerce"
						: contentData.plan === "SALES_FUNNEL"
						? "Sales Funnel"
						: "Landing Page";

				const [createdProj] = await db
					.insert(projects)
					.values({
						id: crypto.randomUUID(),
						tenantId: tenant.id,
						name: contentData.businessName,
						type: planType,
						status: "In Review",
						progress: 85,
						publishedUrl: `https://${projectSubdomain}.kioosk.online`,
						content: JSON.stringify(contentData),
					})
					.returning();
				targetProjectId = createdProj.id;
			}
		}

		// Invalidate projects list cache
		await CacheService.invalidate(`tenant:projects:${tenant.id}`);

		// Dispatch domain event via Observer pattern
		const eventBus = ProjectSubject.getInstance();
		await eventBus.notify({
			id: crypto.randomUUID(),
			type: "PROJECT_UPDATED",
			timestamp: new Date().toISOString(),
			tenantId: tenant.id,
			payload: {
				businessName: contentData.businessName,
				imagesCount: contentData.uploadedImages?.length || 0,
			},
		});

		// Dispatch Email Alerts: 1. Inform Kiosk Admin/Team, 2. Confirm to Client
		const clientEmail = user?.email || contentData.contactEmail;
		const clientName = user?.name || "Valued Client";

		if (clientEmail) {
			sendWebsiteReviewConfirmationToClient(
				clientEmail,
				clientName,
				contentData.businessName,
				contentData.plan || "Website Build",
			).catch((err) => {
				Logger.error("Failed to send review confirmation email to client", err);
			});
		}

		sendWebsiteReviewNotificationToAdmin({
			clientName,
			clientEmail: clientEmail || "unknown@client.com",
			businessName: contentData.businessName,
			tagline: contentData.tagline,
			plan: contentData.plan || "Website Build",
			logoUrl: contentData.logoImage?.url || null,
			imagesCount: contentData.uploadedImages?.length || 0,
			productsCount: contentData.products?.length || 0,
			servicesCount: contentData.services?.length || 0,
			projectId: targetProjectId || undefined,
			contactPhone: contentData.contactPhone,
			contactEmail: contentData.contactEmail,
			whatsappLink: contentData.whatsappLink,
			selectedFont: contentData.selectedFont,
			themeMode: contentData.themeMode,
		}).catch((err) => {
			Logger.error("Failed to send review notification email to admin", err);
		});

		// Trigger Autonomous Background Tenant Website Builder
		if (targetProjectId) {
			const autoBuildPayload = {
				projectId: targetProjectId,
				tenantId: tenant.id,
				contentData,
				userEmail: clientEmail,
				userName: clientName,
				plan: contentData.plan || tenant.plan,
			};

			try {
				if (typeof after === "function") {
					after(async () => {
						await processAutoBuildJob(autoBuildPayload);
					});
				} else {
					processAutoBuildJob(autoBuildPayload).catch((buildErr) => {
						Logger.error("Background auto-build execution failed", buildErr);
					});
				}
			} catch {
				processAutoBuildJob(autoBuildPayload).catch((buildErr) => {
					Logger.error("Background auto-build execution fallback failed", buildErr);
				});
			}
		}

		Logger.info("Saved project content & queued autonomous website builder", {
			tenantId: tenant.id,
			businessName: contentData.businessName,
			projectId: targetProjectId,
		});

		return NextResponse.json({ success: true, content: contentData });
	} catch (err) {
		Logger.error("Failed to save project content", err);
		return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
	}
}
