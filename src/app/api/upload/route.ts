/**
 * File & Media Upload API Route
 *
 * Handles client file uploads (images, logos, brand PDFs), uploads them to Cloudinary
 * with SHA-1 signature authentication, and returns optimized CDN URLs.
 *
 * @module api/upload
 * @format
 */

import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { getAuthenticatedTenantContext } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
	try {
		const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
		const rateLimit = await checkRateLimit(ip, "api");
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many upload requests. Please try again in a moment." },
				{ status: 429 },
			);
		}

		// Authenticate User & Tenant Context
		const { user, tenant } = await getAuthenticatedTenantContext();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized. Please sign in to upload files." }, { status: 401 });
		}

		const tenantSlug = tenant?.slug || `user-${user.id.slice(0, 8)}`;

		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const category = ((formData.get("category") || formData.get("folder") || "assets") as string)
			.replace(/^kiosk\/?(tenants\/[^\/]+\/)?/, "")
			.replace(/[^a-z0-9_-]/gi, "");

		// Strict Multi-Tenant Folder Partitioning: kiosk/tenants/<tenantSlug>/<category>
		const isolatedFolder = `kiosk/tenants/${tenantSlug}/${category || "assets"}`;

		if (!file) {
			return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
		}

		// Max size validation: 25MB
		const maxSizeBytes = 25 * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			return NextResponse.json({ error: "File size exceeds the 25MB limit." }, { status: 400 });
		}

		// Generate collision-proof file ID
		const nameBase = file.name.split(".").slice(0, -1).join(".").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30) || "asset";
		const uniquePublicId = `${nameBase}_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;

		const buffer = Buffer.from(await file.arrayBuffer());
		const fileType = file.type || "image/jpeg";
		const base64Data = `data:${fileType};base64,${buffer.toString("base64")}`;

		const result = await uploadToCloudinary(base64Data, {
			folder: isolatedFolder,
			publicId: uniquePublicId,
			resourceType: fileType.startsWith("image/") ? "image" : "raw",
		});

		return NextResponse.json(
			{
				success: true,
				file: {
					name: file.name,
					size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
					url: result.secureUrl,
					publicId: result.publicId,
					format: result.format,
					width: result.width,
					height: result.height,
				},
			},
			{ status: 200 },
		);
	} catch (err: unknown) {
		console.error("[UPLOAD_API_ERROR]", err);
		const error = err as Error;
		return NextResponse.json(
			{ error: error?.message || "Failed to upload file to storage." },
			{ status: 500 },
		);
	}
}
