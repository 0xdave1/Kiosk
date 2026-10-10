/** @format */

import React from "react";
import type { TenantContentData } from "@/components/tenant/TenantLiveSite";

export interface CustomClientTemplateProps {
	tenantSlug: string;
	plan?: string | null;
	content: TenantContentData;
	publishedUrl: string;
}

// ---------------------------------------------------------------------------
// Import custom client-specific website components here
// ---------------------------------------------------------------------------
import VictorJeremiahStore from "./VictorJeremiahStore";
import MaiksVisualsStudio from "./MaiksVisualsStudio";

/**
 * Custom Client Websites Registry
 * Map any client subdomain slug to their custom bespoke React website component.
 * Slugs should be in lowercase.
 */
export const customTemplateRegistry: Record<
	string,
	React.ComponentType<CustomClientTemplateProps>
> = {
	"demo-luxury-store": VictorJeremiahStore,
	"maiksvisuals-b0c561": MaiksVisualsStudio,
	"maiks-visuals": MaiksVisualsStudio,
	"maiksvisuals": MaiksVisualsStudio,
	// Add new custom client sites here:
	// "bella-bakery": BellaBakeryCustom,
	// "tech-solutions": TechSolutionsCustom,
};

/**
 * Helper to check if a tenant has a custom hand-crafted React website
 */
export function getCustomClientTemplate(
	slugOrSubdomain: string,
): React.ComponentType<CustomClientTemplateProps> | null {
	const normalizedSlug = slugOrSubdomain.toLowerCase().trim();
	return customTemplateRegistry[normalizedSlug] || null;
}
