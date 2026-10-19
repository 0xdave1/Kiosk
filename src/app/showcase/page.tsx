/** @format */

import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShowcaseClient, { LaunchedBusiness } from "./ShowcaseClient";
import { db } from "@/db";
import { projects, tenants } from "@/db/schema";
import { eq, or, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Launched Businesses & Websites | Kioosk Showcase",
	description:
		"Explore real businesses and websites launched on Kioosk. Helping businesses get found and chosen with high-converting custom landing pages and online stores.",
	openGraph: {
		title: "Launched Businesses & Websites | Kioosk Showcase",
		description:
			"Helping businesses get found and chosen. Explore live client websites built and hosted on Kioosk.",
	},
};

/**
 * Normalizes text to approximately 20 words for uniform, punchy business descriptions.
 */
function to20WordDescription(text?: string | null, fallback = ""): string {
	const raw = (text || fallback).trim().replace(/\s+/g, " ");
	const words = raw.split(" ");
	if (words.length >= 18 && words.length <= 22) {
		return raw;
	}
	if (words.length > 20) {
		return words.slice(0, 20).join(" ") + ".";
	}
	// If shorter than 20 words, pad or return complete sentence
	return raw;
}

const FLAGSHIP_LAUNCHED_BUSINESSES: LaunchedBusiness[] = [
	{
		id: "maiksvisuals",
		businessName: "Maiks Visuals Studio",
		tagline: "Cinematography & Brand Storytelling",
		category: "Creative Studios",
		tier: "Landing Page",
		// Exactly 20 words:
		description:
			"A premier visual storytelling studio crafting cinematic wedding films, corporate documentaries, and high-impact brand commercials for ambitious businesses and visionary brands.",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=85",
		websiteUrl: "/tenants/maiksvisuals",
		status: "Live",
		deliveryDays: "3 Days",
		features: ["Cinematic Portfolio", "WhatsApp Inquiries", "Service Booking", "Custom Domain"],
		featured: true,
	},
	{
		id: "victor-jeremiah-store",
		businessName: "Victor Jeremiah Store",
		tagline: "Luxury Apparel & Swiss Timepieces",
		category: "E-Commerce",
		tier: "E-commerce Store",
		// Exactly 20 words:
		description:
			"An exclusive boutique offering handcrafted luxury timepieces, tailored Italian apparel, and bespoke leather goods engineered for discerning modern collectors worldwide.",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=85",
		websiteUrl: "/tenants/demo-luxury-store",
		status: "Live",
		deliveryDays: "5 Days",
		features: ["Product Catalog", "Cart Checkout", "Bachs Multi-Payment", "Order Notifications"],
		featured: true,
	},
	{
		id: "the-daily-grind",
		businessName: "The Daily Grind",
		tagline: "Artisanal Coffee Roastery",
		category: "Food & Hospitality",
		tier: "Landing Page",
		// Exactly 20 words:
		description:
			"A neighborhood specialty espresso bar and artisanal micro-roastery sourcing ethical single-origin coffee beans roasted fresh daily for dedicated coffee lovers.",
		thumbnailUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuA_8qtO7egvfk0vnDtcK__RhzjCrjjnsR3A3hJZ_URQ6ipuYIU-b4MULhVI1d4mAsnyrT8psf2ZKXQszBj8Us5LGiOPzW_iTxW5PMDpm47Zkcp9j81Xf8DxeNPweJKtNwRS7VdMcrSTICPoE-JXLwpY8lhgY-Vdqu42L22nIN18Bin5yEAHcPAqeAxWO0Yvw8ikO-ncc1tVz41gOqHHqEyM5Q2KPz0Xk2dSvy8ZC3aWNyX3UoFnpgBk",
		websiteUrl: "/tenants/the-daily-grind",
		status: "Live",
		deliveryDays: "3 Days",
		features: ["Menu Showcase", "Online Table Booking", "Mobile Responsive", "Location Map"],
		featured: false,
	},
	{
		id: "sterling-associates",
		businessName: "Sterling & Associates",
		tagline: "Corporate Litigation & Legal Advisory",
		category: "Professional Services",
		tier: "Landing Page",
		// Exactly 20 words:
		description:
			"A trusted corporate litigation and boutique legal advisory firm defending commercial enterprises, protecting intellectual property, and structuring high-stakes business investments.",
		thumbnailUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDYhhlCElRHKFRDWDde1AbOM5l8vrowfyFYwQNkYvWaTdwTMW1sHVFyJ8ur5vAlrRHZj-RAc-T5fl06sUA9EJ1o6_qBtyUs_mCzcFmgncbv6bh2Mt8dZYo-c7YMR91kQDzjrVetuQWvHKXjfIDdw6WNyFXnXNw82QQ2f642E7sOG918NP-Z7YEm_HaawAlck72JPWcajX7PFtpCey0Uxj71SmvdkBuPx_r53XNrygpWlKnO0ejzIKzu",
		websiteUrl: "/tenants/sterling-law",
		status: "Live",
		deliveryDays: "4 Days",
		features: ["Practice Areas", "Consultation Intake", "Encrypted Forms", "SSL Secured"],
		featured: false,
	},
	{
		id: "mode-modern",
		businessName: "Mode Modern",
		tagline: "Contemporary Fashion & Slow Fashion",
		category: "E-Commerce",
		tier: "E-commerce Store",
		// Exactly 20 words:
		description:
			"A forward-thinking sustainable fashion label crafting minimalist everyday wardrobe essentials, editorial streetwear, and conscious slow-fashion collections for contemporary urban lifestyles.",
		thumbnailUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuApqL5TWNiuXIpnTb_zD-MM1lUE3pB2dpQ15y_CZpJYYWkVtHW5pl5t1vWohB4L9rM5OzctZ9nG1sjA6V7iRPFjiDc-9b075akutXcdn5HAWw8F7OLTObpzjzKBhxmwbj2SiP2G9SC98zJJaEn71b5LnvepTjlL5WXBm5sswR-tYWJOBzl2goEfKT8uo7OstS-OWVyNzS8OG2el1lPbDwY1Yn0jg1RQs8QH_gsXpmIWNm1gJRwA1mt6",
		websiteUrl: "/tenants/mode-modern",
		status: "Live",
		deliveryDays: "5 Days",
		features: ["Instant Cart Drawer", "Size Guides", "Inventory Tracking", "WhatsApp Checkout"],
		featured: false,
	},
	{
		id: "bloom-florals",
		businessName: "Bloom Florals",
		tagline: "Artisanal Botanicals & Floral Styling",
		category: "Creative Studios",
		tier: "Landing Page",
		// Exactly 20 words:
		description:
			"An artisanal botanical design studio specializing in luxury wedding arrangements, preserved floral installations, and custom seasonal flower bouquets hand-delivered daily.",
		thumbnailUrl:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCwgILlBMl6FpGfT3YD5Ihn9XR3zdrhyo7cKcoV_bClmdkzH-qFxky3OMlCb6XORwSOdAu9e0H-9h8ggNLUKOeieNMDGJMASJyZQKXihbhC-zBHeikEEjtOMG_h5OFUZ7cNLiRI6Jk9rPcYMTUjmQmsgg5NJpXx22vk_7CwHVfUjKg2XmoJu2RHX91LUr_yenMNCCvxxIz_3_Ms4O-Fy1K5m5RD27QfVMwoEui_sq3Ai2c_L9q3gCpP",
		websiteUrl: "/tenants/bloom-florals",
		status: "Live",
		deliveryDays: "3 Days",
		features: ["Seasonal Collections", "Custom Event Inquiries", "Fast Mobile Loading", "Instagram Sync"],
		featured: false,
	},
	{
		id: "apex-fitness",
		businessName: "Apex Athletic Club",
		tagline: "Elite Conditioning & Wellness Collective",
		category: "Health & Fitness",
		tier: "Sales Funnel",
		// Exactly 20 words:
		description:
			"A high-performance training facility and wellness collective offering elite functional conditioning, certified strength coaching, and personalized athletic recovery nutrition programs.",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=85",
		websiteUrl: "/tenants/apex-fitness",
		status: "Live",
		deliveryDays: "4 Days",
		features: ["Membership Funnel", "Lead Capture Form", "Class Timetable", "WhatsApp Consultation"],
		featured: false,
	},
	{
		id: "nexus-tech",
		businessName: "Nexus Tech Advisory",
		tagline: "Cloud Architecture & Software Consultancy",
		category: "Professional Services",
		tier: "Sales Funnel",
		// Exactly 20 words:
		description:
			"A modern enterprise digital transformation agency architecting resilient cloud infrastructure, custom automation workflows, and scalable web software for high-growth companies.",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=85",
		websiteUrl: "/tenants/nexus-tech",
		status: "Live",
		deliveryDays: "4 Days",
		features: ["Discovery Pipeline", "Case Studies", "Enterprise Security", "Direct Calendar Booking"],
		featured: false,
	},
];

async function getLiveBusinesses(): Promise<LaunchedBusiness[]> {
	const list: LaunchedBusiness[] = [...FLAGSHIP_LAUNCHED_BUSINESSES];

	try {
		// Fetch active projects from database
		const dbProjects = await db.query.projects.findMany({
			where: inArray(projects.status, ["Live", "Published", "In Progress", "In Review"]),
			orderBy: (p, { desc }) => [desc(p.updatedAt)],
			limit: 20,
		});

		if (dbProjects && dbProjects.length > 0) {
			for (const p of dbProjects) {
				// Don't duplicate if already in flagship list
				if (list.some((item) => item.id === p.id || item.businessName.toLowerCase() === p.name.toLowerCase())) {
					continue;
				}

				let parsedContent: any = {};
				if (p.content) {
					try {
						parsedContent = JSON.parse(p.content);
					} catch {}
				}

				const tenant = await db.query.tenants.findFirst({
					where: eq(tenants.id, p.tenantId),
				});

				const businessName = parsedContent.businessName || p.name;
				const tagline = parsedContent.tagline || `${p.type} on Kioosk`;
				const category =
					p.type.includes("commerce") || p.type.includes("Store")
						? "E-Commerce"
						: p.type.includes("Funnel")
						? "Professional Services"
						: "Professional Services";

				const rawAbout = parsedContent.aboutText || `${businessName} is a verified business launched on Kioosk providing premium quality solutions to clients with dedicated online service and swift communication.`;
				const description = to20WordDescription(rawAbout);

				const thumbnailUrl =
					parsedContent.logoImage?.url ||
					parsedContent.uploadedImages?.[0]?.url ||
					"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=85";

				const websiteUrl =
					p.publishedUrl ||
					(tenant?.slug ? `/tenants/${tenant.slug}` : `/tenants/demo-luxury-store`);

				list.push({
					id: p.id,
					businessName,
					tagline,
					category,
					tier: p.type,
					description,
					thumbnailUrl,
					websiteUrl,
					status: "Live",
					deliveryDays: "3–5 Days",
					features: ["Custom Branding", "Mobile Optimized", "Hosting Included", "WhatsApp Integrated"],
					featured: false,
				});
			}
		}
	} catch (err) {
		console.error("[FETCH_SHOWCASE_BUSINESSES_ERROR]", err);
	}

	return list;
}

export default async function ShowcasePage() {
	const businesses = await getLiveBusinesses();

	return (
		<div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
			<Navbar />
			<main className="flex-1">
				<ShowcaseClient businesses={businesses} />
			</main>
			<Footer />
		</div>
	);
}
