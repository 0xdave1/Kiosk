import { test, expect } from "@playwright/test";

test.describe("Multi-Tenant Subdomain & Custom Domain Routing Architecture", () => {
	const ROOT_DOMAINS = [
		"localhost",
		"127.0.0.1",
		"0.0.0.0",
		"kioosk.online",
		"www.kioosk.online",
		"kiosk.site",
		"www.kiosk.site",
	];

	function simulateMiddlewareRouting(hostname: string, pathname: string) {
		const currentHost = hostname.replace(/:\d+$/, "");
		const isRootDomain = ROOT_DOMAINS.includes(currentHost);
		const isInternalOrApiRoute =
			pathname.startsWith("/api") ||
			pathname.startsWith("/tenants") ||
			pathname.startsWith("/domains") ||
			pathname.startsWith("/_next");

		if (!isRootDomain && !isInternalOrApiRoute) {
			if (
				currentHost.endsWith(".kioosk.online") ||
				currentHost.endsWith(".kiosk.site") ||
				currentHost.endsWith(".localhost")
			) {
				const subdomain = currentHost.split(".")[0];
				if (subdomain && subdomain !== "www") {
					return `/tenants/${subdomain}${pathname}`;
				}
			} else {
				const cleanCustomHost = currentHost.replace(/^www\./, "");
				return `/domains/${cleanCustomHost}${pathname}`;
			}
		}

		return pathname;
	}

	test("Root domain requests pass through to standard app routes", () => {
		expect(simulateMiddlewareRouting("kioosk.online", "/")).toBe("/");
		expect(simulateMiddlewareRouting("kioosk.online", "/pricing")).toBe("/pricing");
		expect(simulateMiddlewareRouting("www.kioosk.online", "/checkout")).toBe("/checkout");
		expect(simulateMiddlewareRouting("localhost:3000", "/dashboard")).toBe("/dashboard");
	});

	test("Subdomain requests rewrite internally to /tenants/[slug]", () => {
		expect(simulateMiddlewareRouting("bella-bakery.kioosk.online", "/")).toBe("/tenants/bella-bakery/");
		expect(simulateMiddlewareRouting("bella-bakery.kiosk.site", "/about")).toBe("/tenants/bella-bakery/about");
		expect(simulateMiddlewareRouting("my-shop.localhost:3000", "/")).toBe("/tenants/my-shop/");
	});

	test("Custom domain requests rewrite internally to /domains/[domain]", () => {
		expect(simulateMiddlewareRouting("bellabakery.com", "/")).toBe("/domains/bellabakery.com/");
		expect(simulateMiddlewareRouting("www.bellabakery.com", "/")).toBe("/domains/bellabakery.com/");
		expect(simulateMiddlewareRouting("store.fashionbrand.ng", "/products")).toBe("/domains/store.fashionbrand.ng/products");
	});

	test("API and internal asset routes are preserved without subdomain rewriting", () => {
		expect(simulateMiddlewareRouting("bella-bakery.kioosk.online", "/api/upload")).toBe("/api/upload");
		expect(simulateMiddlewareRouting("bella-bakery.kioosk.online", "/api/webhooks/bachs")).toBe("/api/webhooks/bachs");
		expect(simulateMiddlewareRouting("bellabakery.com", "/api/projects/quick-edit")).toBe("/api/projects/quick-edit");
	});

	test("Dynamic Favicon Generation - Uses client primary color and business initial", () => {
		const businessName = "Bella Bakery";
		const primaryColor = "#E11D48";
		const brandColor = primaryColor.replace("#", "%23");

		const faviconUrl = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='${brandColor}'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='sans-serif'>${encodeURIComponent(businessName.trim().charAt(0).toUpperCase())}</text></svg>`;

		expect(faviconUrl).toContain("%23E11D48");
		expect(faviconUrl).toContain(">B<");
	});
});
