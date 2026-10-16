/**
 * Cloudinary Media Storage Pipeline
 *
 * Provides direct, high-performance image uploads to Cloudinary with
 * cryptographic signature authentication and global CDN delivery.
 *
 * @module cloudinary
 * @format
 */

import crypto from "crypto";

export interface CloudinaryUploadOptions {
	folder?: string;
	publicId?: string;
	resourceType?: "image" | "auto" | "raw";
}

export interface CloudinaryUploadResult {
	url: string;
	secureUrl: string;
	publicId: string;
	format: string;
	width?: number;
	height?: number;
	bytes: number;
}

/**
 * Uploads a file buffer or base64 data URI to Cloudinary
 */
export async function uploadToCloudinary(
	fileInput: Buffer | Blob | string,
	options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
	const apiKey = process.env.CLOUDINARY_API_KEY || "";
	const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

	if (!cloudName || !apiKey || !apiSecret) {
		throw new Error("Cloudinary credentials (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are required.");
	}

	const timestamp = Math.round(Date.now() / 1000);
	const folder = options.folder || "kiosk/uploads";
	const resourceType = options.resourceType || "auto";

	// Dynamic parameter signature calculation
	const signParams: Record<string, string> = {
		folder,
		timestamp: timestamp.toString(),
	};
	if (options.publicId) {
		signParams.public_id = options.publicId;
	}

	const sortedQuery = Object.keys(signParams)
		.sort()
		.map((k) => `${k}=${signParams[k]}`)
		.join("&");

	const signature = crypto.createHash("sha1").update(`${sortedQuery}${apiSecret}`).digest("hex");

	const formData = new FormData();
	if (typeof fileInput === "string") {
		formData.append("file", fileInput);
	} else if (fileInput instanceof Blob) {
		formData.append("file", fileInput);
	} else if (Buffer.isBuffer(fileInput)) {
		const mimeType = options.resourceType === "raw" ? "application/octet-stream" : "image/jpeg";
		const base64 = `data:${mimeType};base64,${fileInput.toString("base64")}`;
		formData.append("file", base64);
	} else {
		const blob = new Blob([new Uint8Array(fileInput)]);
		formData.append("file", blob);
	}

	formData.append("api_key", apiKey);
	formData.append("timestamp", timestamp.toString());
	formData.append("signature", signature);
	formData.append("folder", folder);
	if (options.publicId) {
		formData.append("public_id", options.publicId);
	}

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
		{
			method: "POST",
			body: formData,
		},
	);

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error?.message || "Failed to upload file to Cloudinary");
	}

	return {
		url: data.url,
		secureUrl: data.secure_url,
		publicId: data.public_id,
		format: data.format,
		width: data.width,
		height: data.height,
		bytes: data.bytes,
	};
}

/**
 * Builds an auto-optimized, responsive WebP/AVIF URL from a Cloudinary public ID or URL
 */
export function getOptimizedImageUrl(publicIdOrUrl: string, width?: number, height?: number): string {
	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "";
	if (!cloudName || publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
		return publicIdOrUrl;
	}

	const transformations: string[] = ["f_auto", "q_auto"];
	if (width) transformations.push(`w_${width}`);
	if (height) transformations.push(`h_${height}`);
	if (width && height) transformations.push("c_fill");

	return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(",")}/${publicIdOrUrl}`;
}
