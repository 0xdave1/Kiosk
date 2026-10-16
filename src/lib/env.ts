/**
 * Centralized Zod Schema Environment Variable Validator
 *
 * Validates all required environment variables at application startup,
 * providing strict type safety and preventing misconfiguration runtime errors.
 *
 * @module env
 * @format
 */

import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required for PostgreSQL connection"),
	AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required for Auth.js session signing"),
	NEXTAUTH_SECRET: z.string().optional(),
	AUTH_URL: z.string().optional(),
	NEXTAUTH_URL: z.string().optional(),
	AUTH_GOOGLE_ID: z.string().optional(),
	AUTH_GOOGLE_SECRET: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	BACHS_SECRET_KEY: z.string().optional(),
	BACHS_WEBHOOK_SECRET: z.string().optional(),
	UPSTASH_REDIS_REST_URL: z.string().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
	RESEND_API_KEY: z.string().optional(),
	ADMIN_EMAIL: z.string().optional(),
	NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
	CLOUDINARY_API_KEY: z.string().optional(),
	CLOUDINARY_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Safely parses and validates process.env variables
 */
export function validateEnv(): Env {
	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error("[ENVIRONMENT_VALIDATION_ERROR]", parsed.error.flatten().fieldErrors);
		throw new Error(
			`Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
		);
	}

	return parsed.data;
}

export const env = validateEnv();
