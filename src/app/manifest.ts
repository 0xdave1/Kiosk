import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Kiosk",
		short_name: "Kiosk",
		description:
			"Professional websites, sales funnels, and online stores for small businesses.",
		start_url: "/",
		display: "standalone",
		background_color: "#03152c",
		theme_color: "#03152c",
		orientation: "portrait-primary",
		icons: [
			{
				src: "/icons/icon-192.svg",
				sizes: "192x192",
				type: "image/svg+xml",
				purpose: "any",
			},
			{
				src: "/icons/icon-512.svg",
				sizes: "512x512",
				type: "image/svg+xml",
				purpose: "maskable",
			},
		],
	};
}
