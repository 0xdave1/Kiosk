/**
 * Next.js Edge Protection & Multi-Tenant Routing Middleware
 *
 * Provides edge-level request handling for Kiosk:
 * 1. Multi-Tenant Subdomain Routing (`<tenant>.kiosk.site` or `<tenant>.localhost:3000` -> `/_tenants/<slug>`)
 * 2. Custom Domain Resolution (`<customdomain.com>` -> `/_domains/<domain>`)
 * 3. Session Guards for Protected Routes (`/dashboard/*`, `/checkout`)
 * 4. Auth Route Redirection (`/get-started` -> `/dashboard` for logged-in users)
 * 5. Edge Client IP Injection (`X-Client-IP` header for downstream rate limiting)
 *
 * @module middleware
 * @format
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Routes requiring active user authentication */
const PROTECTED_ROUTES = ["/dashboard", "/checkout", "/admin"];

/** Routes intended only for unauthenticated visitors */
const AUTH_ROUTES = ["/get-started"];

/** Main root domains to exclude from subdomain rewrite engine */
const ROOT_DOMAINS = [
	"localhost",
	"127.0.0.1",
	"0.0.0.0",
	"kioosk.online",
	"www.kioosk.online",
	"kiosk.site",
	"www.kiosk.site",
];

/**
 * Executes edge request inspection, session guarding, and multi-tenant domain rewriting.
 *
 * @param request - Incoming Next.js HTTP Request object
 * @returns NextResponse (Redirect, Rewrite, or Next)
 */
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const hostname =
		request.headers.get("x-forwarded-host") ||
		request.headers.get("host") ||
		"localhost:3000";
	const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

	// ---------------------------------------------------------------------------
	// 1. SESSION TOKEN EXTRACTION
	// ---------------------------------------------------------------------------
	const customSession = request.cookies.get("kiosk_session")?.value;
	const authJsSession =
		request.cookies.get("authjs.session-token")?.value ||
		request.cookies.get("__Secure-authjs.session-token")?.value ||
		request.cookies.get("next-auth.session-token")?.value ||
		request.cookies.get("__Secure-next-auth.session-token")?.value;

	const isAuthenticated = Boolean(customSession || authJsSession);

	// ---------------------------------------------------------------------------
	// 2. PROTECTED ROUTE GUARDS (/dashboard/*, /checkout)
	// ---------------------------------------------------------------------------
	const isProtectedRoute = PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);

	if (isProtectedRoute && !isAuthenticated) {
		const loginUrl = new URL("/get-started", request.url);
		loginUrl.searchParams.set("tab", "login");
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// ---------------------------------------------------------------------------
	// 3. AUTH ROUTE REDIRECTION FOR AUTHENTICATED USERS (/get-started)
	// ---------------------------------------------------------------------------
	const isAuthRoute = AUTH_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);

	if (isAuthRoute && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// ---------------------------------------------------------------------------
	// 4. MULTI-TENANT SUBDOMAIN & CUSTOM DOMAIN REWRITING ENGINE
	// ---------------------------------------------------------------------------
	const currentHost = hostname.replace(/:\d+$/, ""); // Strip port if present
	const isRootDomain = ROOT_DOMAINS.includes(currentHost);
	const isInternalOrApiRoute =
		pathname.startsWith("/api") ||
		pathname.startsWith("/tenants") ||
		pathname.startsWith("/domains") ||
		pathname.startsWith("/_next");

	if (!isRootDomain && !isInternalOrApiRoute) {
		// Scenario A: Subdomain format (e.g. "bella-bakery.kioosk.online" or "bella-bakery.localhost")
		if (
			currentHost.endsWith(".kioosk.online") ||
			currentHost.endsWith(".kiosk.site") ||
			currentHost.endsWith(".localhost")
		) {
			const subdomain = currentHost.split(".")[0];
			if (subdomain && subdomain !== "www") {
				// Rewrite internally to the tenant route handler
				return NextResponse.rewrite(
					new URL(`/tenants/${subdomain}${pathname}`, request.url),
				);
			}
		} else {
			// Scenario B: Custom domain format (e.g. "bellabakery.com" or "www.bellabakery.com")
			const cleanCustomHost = currentHost.replace(/^www\./, "");
			return NextResponse.rewrite(
				new URL(`/domains/${cleanCustomHost}${pathname}`, request.url),
			);
		}
	}

	// ---------------------------------------------------------------------------
	// 5. EDGE HEADERS INJECTION & standard response
	// ---------------------------------------------------------------------------
	const response = NextResponse.next();
	response.headers.set("X-Client-IP", ip);

	return response;
}

/**
 * Next.js Middleware Matcher Configuration
 * Excludes static assets, image optimization files, fonts, and public assets.
 */
export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|fonts/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
	],
};
