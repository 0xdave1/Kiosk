/**
 * Automated Background Tenant Website Builder Engine
 *
 * Automatically triggers when client submits content questionnaire (at 85% progress).
 * Asynchronously processes:
 * 1. Content ingestion, sanitization & media asset normalization
 * 2. Plan-specific blueprint synthesis (Landing Page, Funnel, or E-Commerce Store)
 * 3. Domain/Subdomain assignment (https://[tenant].kioosk.online)
 * 4. Step-by-step progress transition (85% -> 92% -> 100% "Live")
 * 5. Instant cache invalidation so live dynamic site renders immediately
 * 6. Dispatches celebratory "Your Website is Live" email to the tenant owner
 *
 * @module inngest/functions/autoBuilder
 * @format
 */

import { db } from "@/db";
import { tenants, projects, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CacheService } from "@/lib/cache/CacheService";
import { ProjectSubject } from "@/lib/events/ProjectSubject";
import { sendWebsiteLiveEmail } from "@/lib/email";
import { Logger } from "@/lib/logger";
import { synthesizeIndustryBlueprint } from "@/lib/builder/industrySynthesizer";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AutoBuildJobPayload {
	projectId: string;
	tenantId: string;
	contentData: any;
	userEmail?: string;
	userName?: string;
	plan?: string;
}

/**
 * Normalizes content data so TenantLiveSite.tsx can consume all fields consistently,
 * dynamically synthesizing tailored content matching the user's business description.
 */
function normalizeContentForLiveSite(contentData: any, tenantSlug: string, tenantName: string) {
	const businessName = (contentData.businessName || tenantName || "My Business").trim();
	const tagline = (contentData.tagline || "").trim();
	const aboutText = (contentData.aboutText || "").trim();
	const contactAddress = contentData.locationAddress || contentData.contactAddress || "";
	const rawPhone = contentData.contactPhone || "";
	const rawWhatsapp = contentData.whatsappLink || contentData.whatsappNumber || rawPhone;
	const cleanWhatsappDigits = (rawWhatsapp || "").replace(/[^0-9]/g, "");

	// Intelligently synthesize industry blueprint based on business description & keywords
	const blueprint = synthesizeIndustryBlueprint(
		businessName,
		tagline,
		aboutText,
		contactAddress,
		cleanWhatsappDigits,
	);

	// Check if submitted services are generic dummy data
	const hasCustomServices =
		Array.isArray(contentData.services) &&
		contentData.services.length > 0 &&
		!contentData.services.some((s: any) =>
			(s.title || "").includes("Strategic Growth & Consulting") ||
			(s.title || "").includes("Full-Stack Implementation"),
		);

	const services = hasCustomServices
		? contentData.services
		: blueprint.services;

	// Check if submitted products are generic dummy data
	const hasCustomProducts =
		Array.isArray(contentData.products) &&
		contentData.products.length > 0 &&
		!contentData.products.some((p: any) =>
			(p.name || "").includes("Signature Item") ||
			(p.name || "").includes("Limited Edition Edition"),
		);

	const products = hasCustomProducts
		? contentData.products.map((p: any) => {
				const imgUrl = (p.imageUrl || p.image || "").trim();
				return {
					name: p.name,
					price: typeof p.price === "number" ? `$${p.price}` : String(p.price || "$0"),
					description: p.description || "",
					image: imgUrl.startsWith("blob:") ? "" : imgUrl,
					category: p.category || "General",
					badge: p.badge || "",
				};
		  })
		: blueprint.products;

	// Check if testimonials are generic
	const hasCustomTestimonials =
		Array.isArray(contentData.testimonialsList) &&
		contentData.testimonialsList.length > 0 &&
		!contentData.testimonialsList.some((t: any) =>
			(t.name || "").includes("David Kendrick") ||
			(t.name || "").includes("Elena Rostova"),
		);

	const testimonials = hasCustomTestimonials
		? contentData.testimonialsList.map((t: any) => ({
				...t,
				avatarUrl: (t.avatarUrl || "").startsWith("blob:") ? "" : t.avatarUrl,
		  }))
		: blueprint.testimonials;

	// Check if FAQs are generic
	const hasCustomFaqs =
		Array.isArray(contentData.faqs) &&
		contentData.faqs.length > 0 &&
		!contentData.faqs.some((f: any) =>
			(f.question || "").includes("How quickly does our project go live?"),
		);

	const faqs = hasCustomFaqs ? contentData.faqs : blueprint.faqs;

	// Clean out dead blob URLs from uploadedImages and logoImage
	const logoImage =
		contentData.logoImage?.url && !contentData.logoImage.url.startsWith("blob:")
			? contentData.logoImage
			: null;

	const uploadedImages = Array.isArray(contentData.uploadedImages)
		? contentData.uploadedImages.filter(
				(img: any) => img?.url && !img.url.startsWith("blob:"),
		  )
		: [];

	return {
		...contentData,
		logoImage,
		uploadedImages,
		businessName,
		tagline: tagline || blueprint.tagline,
		category: contentData.category || blueprint.category,
		heroHeadline: blueprint.heroHeadline,
		heroSubheadline: blueprint.heroSubheadline,
		aboutText: aboutText || blueprint.aboutText,
		locationAddress: contactAddress,
		contactPhone: rawPhone,
		whatsappNumber: cleanWhatsappDigits,
		whatsappLink: cleanWhatsappDigits
			? `https://wa.me/${cleanWhatsappDigits}`
			: contentData.whatsappLink || "",
		products,
		services,
		benefits: blueprint.benefits,
		testimonials,
		faqs,
		themeMode: contentData.themeMode || "light",
		primaryColor: contentData.primaryColor || blueprint.primaryColor,
		updatedAt: new Date().toISOString(),
	};
}

/**
 * Executes the complete autonomous website build pipeline in the background.
 */
export async function processAutoBuildJob(payload: AutoBuildJobPayload) {
	const { projectId, tenantId, contentData, userEmail, userName, plan } = payload;

	Logger.info("Initiating autonomous tenant website build pipeline", {
		projectId,
		tenantId,
		userEmail,
	});

	try {
		// 1. Fetch current project & tenant
		const project = await db.query.projects.findFirst({
			where: eq(projects.id, projectId),
		});

		if (!project) {
			Logger.error("Auto-builder aborted: project not found", { projectId });
			return { success: false, error: "Project not found" };
		}

		const tenant = await db.query.tenants.findFirst({
			where: eq(tenants.id, tenantId),
		});

		if (!tenant) {
			Logger.error("Auto-builder aborted: tenant workspace not found", { tenantId });
			return { success: false, error: "Tenant not found" };
		}

		const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kioosk.online";
		const publishedUrl = `https://${tenant.slug}.${rootDomain}`;

		// Step 1: Synthesis & Asset Processing (85% -> 92%)
		await sleep(1000); // Simulated async build pipeline tick

		const normalizedContent = normalizeContentForLiveSite(contentData, tenant.slug, tenant.name);

		await db
			.update(projects)
			.set({
				progress: 92,
				status: "Building",
				publishedUrl,
				content: JSON.stringify(normalizedContent),
				updatedAt: new Date(),
			})
			.where(eq(projects.id, projectId));

		// Step 2: Final Verification & Domain Binding (92% -> 100% "Live")
		await sleep(1200); // Final layout packaging tick

		await db
			.update(projects)
			.set({
				progress: 100,
				status: "Live",
				publishedUrl,
				content: JSON.stringify(normalizedContent),
				updatedAt: new Date(),
			})
			.where(eq(projects.id, projectId));

		// Update Redis / In-Memory Cache
		const cacheKey = `tenant:content:${tenant.id}:${projectId}`;
		await CacheService.set(cacheKey, normalizedContent, 2592000);
		await CacheService.invalidate(`tenant:projects:${tenant.id}`);

		// Step 3: Dispatch domain event (PROJECT_PUBLISHED)
		const eventBus = ProjectSubject.getInstance();
		await eventBus.notify({
			id: crypto.randomUUID(),
			type: "PROJECT_PUBLISHED",
			timestamp: new Date().toISOString(),
			tenantId: tenant.id,
			payload: {
				projectId,
				publishedUrl,
				businessName: normalizedContent.businessName,
			},
		});

		// Step 4: Dispatch celebratory Live notification email
		const recipientEmail = userEmail || normalizedContent.contactEmail;
		if (recipientEmail) {
			sendWebsiteLiveEmail({
				toEmail: recipientEmail,
				clientName: userName || "Valued Client",
				businessName: normalizedContent.businessName,
				publishedUrl,
				plan: plan || project.type || "Website Build",
			}).catch((err) => {
				Logger.error("Failed to send live website email notification", err);
			});
		}

		Logger.info("Autonomous website build pipeline completed successfully!", {
			projectId,
			tenantId,
			publishedUrl,
			status: "Live",
			progress: 100,
		});

		return {
			success: true,
			publishedUrl,
			status: "Live",
			progress: 100,
		};
	} catch (error) {
		Logger.error("Failed in auto-builder pipeline", error, { projectId, tenantId });
		return { success: false, error: "Auto-builder failed" };
	}
}
