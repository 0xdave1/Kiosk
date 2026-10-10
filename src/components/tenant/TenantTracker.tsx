/** @format */

"use client";

import { useEffect } from "react";

export interface TenantTrackerProps {
	tenantSlug: string;
}

/**
 * Client-side lightweight visitor & WhatsApp click tracking beacon.
 * Runs non-blocking in background with zero performance overhead.
 */
export default function TenantTracker({ tenantSlug }: TenantTrackerProps) {
	useEffect(() => {
		if (!tenantSlug || typeof window === "undefined") return;

		// 1. Dispatch Page View Tracking
		const trackEvent = (type: "PAGE_VIEW" | "WHATSAPP_CLICK", extra?: Record<string, unknown>) => {
			try {
				const payload = JSON.stringify({
					tenantSlug,
					type,
					referrer: document.referrer || "direct",
					path: window.location.pathname,
					...extra,
				});

				if (navigator.sendBeacon) {
					const blob = new Blob([payload], { type: "application/json" });
					navigator.sendBeacon("/api/analytics/track", blob);
				} else {
					fetch("/api/analytics/track", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: payload,
						keepalive: true,
					}).catch(() => {});
				}
			} catch (e) {
				// Silently ignore to avoid impacting user experience
			}
		};

		// Track initial page view
		trackEvent("PAGE_VIEW");

		// 2. Global WhatsApp Click Interceptor
		const handleGlobalClick = (e: MouseEvent) => {
			const target = (e.target as HTMLElement)?.closest("a");
			if (!target) return;

			const href = target.getAttribute("href") || "";
			if (href.includes("wa.me") || href.includes("whatsapp.com")) {
				trackEvent("WHATSAPP_CLICK", { href });
			}
		};

		document.addEventListener("click", handleGlobalClick, { capture: true });
		return () => {
			document.removeEventListener("click", handleGlobalClick, { capture: true });
		};
	}, [tenantSlug]);

	return null;
}
