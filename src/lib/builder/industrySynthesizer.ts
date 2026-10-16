/**
 * Intelligent Business Content & Dynamic Design Synthesizer
 *
 * Analyzes submitted business name, tagline, about description, and tenant identity.
 * Dynamically synthesizes distinct, high-converting, tailored website designs for each tenant:
 * - Unique Design Themes: Modern Minimal, Luxury Editorial, Bold Vibrant, Tech Cyber, Warm Earthy, Corporate Executive, Creative Studio
 * - Distinct Layout Variants: Split Hero, Centered Hero, Magazine Hero, Showcase Hero
 * - Varied Header Styles: Floating Glass Pill, Clean Minimal, Classic Bar
 * - Curated Color Palettes & Contrast Accents
 * - Distinct Typography Pairings
 * - Realistic, high-resolution industry products, services, reviews, and FAQs
 *
 * @module industrySynthesizer
 * @format
 */

export type DesignTheme =
	| "MODERN_MINIMAL"
	| "LUXURY_EDITORIAL"
	| "BOLD_VIBRANT"
	| "TECH_CYBER"
	| "WARM_EARTHY"
	| "CORPORATE_EXECUTIVE"
	| "CREATIVE_STUDIO";

export type HeroLayoutVariant =
	| "split_hero"
	| "centered_hero"
	| "magazine_hero"
	| "showcase_hero";

export type HeaderVariant =
	| "floating_pill"
	| "clean_minimal"
	| "classic_bar";

export type FontTheme =
	| "sans_geometric"
	| "editorial_serif"
	| "bold_display"
	| "modern_mono";

export interface SynthesizedBlueprint {
	businessName: string;
	tagline: string;
	category: string;
	heroHeadline: string;
	heroSubheadline: string;
	aboutText: string;
	primaryColor: string;
	accentColor: string;
	designTheme: DesignTheme;
	heroLayout: HeroLayoutVariant;
	headerVariant: HeaderVariant;
	fontTheme: FontTheme;
	themeMode?: "light" | "dark";
	badgeText?: string;
	services: Array<{
		title: string;
		description: string;
		price: string;
		duration?: string;
		icon?: string;
	}>;
	products: Array<{
		name: string;
		price: string;
		description: string;
		image: string;
		category: string;
		badge: string;
	}>;
	benefits: Array<{
		title: string;
		description: string;
	}>;
	testimonials: Array<{
		name: string;
		role: string;
		review: string;
		rating: number;
	}>;
	faqs: Array<{
		question: string;
		answer: string;
	}>;
}

/**
 * Deterministic string hash helper to ensure stable yet distinct visual assignment per tenant
 */
function hashSeed(seed: string): number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash << 5) - hash + seed.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

export function synthesizeIndustryBlueprint(
	rawName: string,
	rawTagline: string,
	rawAbout: string,
	address?: string,
	phone?: string,
	tenantSlug: string = "",
): SynthesizedBlueprint {
	const businessName = (rawName || "My Business").trim();
	const combinedText = `${rawName} ${rawTagline} ${rawAbout}`.toLowerCase();
	const seed = hashSeed(tenantSlug || businessName);

	// 1. TRANSPORTATION / BUS CHARTER / TRANSIT / LOGISTICS
	if (
		combinedText.includes("bus") ||
		combinedText.includes("coasta") ||
		combinedText.includes("coaster") ||
		combinedText.includes("transit") ||
		combinedText.includes("transport") ||
		combinedText.includes("travel") ||
		combinedText.includes("charter") ||
		combinedText.includes("shuttle") ||
		combinedText.includes("fleet") ||
		combinedText.includes("driver") ||
		combinedText.includes("interstate") ||
		combinedText.includes("logistics")
	) {
		const loc = address || "Nigeria";
		const heroVariants: HeroLayoutVariant[] = ["centered_hero", "split_hero", "showcase_hero"];
		const headerVariants: HeaderVariant[] = ["classic_bar", "floating_pill"];
		const colorVariants = ["#034575", "#0f172a", "#1e3a8a", "#0284c7"];

		return {
			businessName,
			tagline: rawTagline || "Executive Coaster Bus Charters & Nationwide Group Transit",
			category: "Passenger Transit & Luxury Bus Charter",
			heroHeadline: `Executive Coaster Bus Charters. Safe, Air-Conditioned & On Time.`,
			heroSubheadline: `Experience exceptional group travel across ${loc} and nationwide. 30-seater executive coaster buses for corporate tours, family weddings, church retreats, intercity travel, and airport conveyance. Bring your ${businessName}.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we specialize in premier coaster bus rental and passenger charter services across ${loc}. Every vehicle in our fleet is fully air-conditioned, rigorously serviced, and operated by licensed, courteous professional drivers dedicated to punctual arrivals and maximum passenger comfort.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#0284c7",
			designTheme: (seed % 2 === 0 ? "CORPORATE_EXECUTIVE" : "MODERN_MINIMAL") as DesignTheme,
			heroLayout: heroVariants[seed % heroVariants.length],
			headerVariant: headerVariants[seed % headerVariants.length],
			fontTheme: "sans_geometric",
			badgeText: "Verified Commercial Transit Fleet",
			services: [
				{
					title: "Interstate & Intercity Group Charter",
					description:
						"Point-to-point nationwide transit for families, organizations, and private groups with punctual departures and experienced highway drivers.",
					price: "Custom Route Quote",
					duration: "Single or Return Trip",
					icon: "Compass",
				},
				{
					title: "Corporate & Executive Shuttles",
					description:
						"Punctual staff conveyance, VIP airport transfers, and executive conference delegate shuttles tailored for corporate teams.",
					price: "Daily / Retainer",
					duration: "Scheduled Dispatch",
					icon: "Briefcase",
				},
				{
					title: "Weddings, Church Retreats & Events",
					description:
						"Convey your guests in comfort and prestige. 30-seater luxury air-conditioned coaster buses with dedicated uniformed chauffeurs.",
					price: "Special Event Rates",
					duration: "Full Day Charter",
					icon: "Users",
				},
				{
					title: "Excursions & Educational Tours",
					description:
						"Highest safety standards, functional seatbelts, and vetted highway-certified drivers for school trips, athletic teams, and retreats.",
					price: "Special Tour Rates",
					duration: "Multi-Day Available",
					icon: "ShieldCheck",
				},
			],
			products: [
				{
					name: "Executive 30-Seater Coaster Bus (City Charter)",
					price: "₦120,000 / day",
					description:
						"Fully air-conditioned, clean reclining seats, sound system, vetted city driver. Perfect for intra-state movement and events.",
					image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=85",
					category: "City Charters",
					badge: "Most Popular",
				},
				{
					name: "Interstate VIP Highway Coaster Bus",
					price: "₦180,000 / day",
					description:
						"Dual-cooling high capacity AC, generous rear cargo luggage bay, USB ports, certified long-distance highway chauffeur.",
					image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=85",
					category: "Interstate Transit",
					badge: "Executive VIP",
				},
				{
					name: "Multi-Day Nationwide Tour Package",
					price: "Custom Itinerary Quote",
					description:
						"Multi-state charter with dedicated driver maintenance, route safety planning, and 24/7 logistics coordination.",
					image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=85",
					category: "Multi-Day Tours",
					badge: "Full Support",
				},
			],
			benefits: [
				{
					title: "100% Chilled Air Conditioning",
					description: "Dual-evaporator cooling systems keep all 30 passenger rows ice-cold even during midday heat.",
				},
				{
					title: "Vetted Highway Chauffeurs",
					description: "Defensive-driving certified drivers with years of interstate highway experience and zero-tolerance safety standards.",
				},
				{
					title: "Instant WhatsApp Booking",
					description: "Direct reservation confirmation on WhatsApp with transparent quotes and zero hidden fees.",
				},
			],
			testimonials: [
				{
					name: "Blessing & Kenneth A.",
					role: "Wedding Clients, Abuja",
					review: `Conveyed our entire wedding bridal train from ${loc} to the venue without a single hitch. Freezing cold AC, punctual driver, and super polite. ${businessName} is simply the best!`,
					rating: 5,
				},
				{
					name: "Pastor Timothy O.",
					role: "Grace Assembly Youth",
					review:
						"We hired two coaster buses for our church annual youth camp. Clean vehicles, smooth engine, no mechanical breakdowns, and our driver was extraordinarily patient.",
					rating: 5,
				},
			],
			faqs: [
				{
					question: "What is the seating capacity of your coaster buses?",
					answer:
						"Each coaster bus in our fleet comfortably seats 30 adult passengers with ergonomic high-back seating and generous luggage storage.",
				},
				{
					question: "Are fuel and driver allowances included in the quote?",
					answer:
						"Yes, we provide transparent all-inclusive charter quotes that include fuel, driver allowance, and route planning depending on your destination.",
				},
			],
		};
	}

	// 2. FOOD / RESTAURANT / BAKERY / CATERING / CAFE
	if (
		combinedText.includes("food") ||
		combinedText.includes("restaurant") ||
		combinedText.includes("bakery") ||
		combinedText.includes("cake") ||
		combinedText.includes("grill") ||
		combinedText.includes("cater") ||
		combinedText.includes("kitchen") ||
		combinedText.includes("cafe") ||
		combinedText.includes("culinary") ||
		combinedText.includes("bistro")
	) {
		const colorVariants = ["#c2410c", "#b91c1c", "#d97706", "#78350f"];
		const heroVariants: HeroLayoutVariant[] = ["magazine_hero", "centered_hero", "split_hero"];
		const headerVariants: HeaderVariant[] = ["floating_pill", "clean_minimal"];

		return {
			businessName,
			tagline: rawTagline || "Artisanal Flavors, Fresh Ingredients & Gourmet Catering",
			category: "Dining & Gourmet Catering",
			heroHeadline: `Handcrafted Culinary Perfection For Every Occasion.`,
			heroSubheadline: `From signature delicacies to large-scale event catering, ${businessName} delivers unforgettable flavors crafted fresh daily with premium local ingredients.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, our culinary team combines timeless recipes with the freshest local ingredients to prepare sensational meals, celebration pastries, and custom event catering tailored to your palate.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#f59e0b",
			designTheme: (seed % 2 === 0 ? "WARM_EARTHY" : "BOLD_VIBRANT") as DesignTheme,
			heroLayout: heroVariants[seed % heroVariants.length],
			headerVariant: headerVariants[seed % headerVariants.length],
			fontTheme: seed % 2 === 0 ? "editorial_serif" : "bold_display",
			badgeText: "Farm-Fresh Gourmet Ingredients",
			services: [
				{
					title: "Full-Service Event Catering",
					description: "Gourmet buffet and plated meal services for weddings, corporate galas, and private gatherings.",
					price: "Custom Menu Quote",
					duration: "Events",
				},
				{
					title: "Daily Fresh Orders & Delivery",
					description: "Hot, freshly prepared signature dishes delivered direct to your home or office.",
					price: "From ₦5,000",
					duration: "30-45 Mins",
				},
				{
					title: "Bespoke Celebration Cakes",
					description: "Custom artisan cakes baked from scratch with tiered designs for birthdays and anniversaries.",
					price: "From ₦25,000",
					duration: "Pre-order 48h",
				},
			],
			products: [
				{
					name: "Signature Chef Platter",
					price: "₦14,500",
					description: "A rich combination of freshly grilled proteins, signature sides, and artisan dipping sauces.",
					image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=85",
					category: "Platters",
					badge: "Best Seller",
				},
				{
					name: "Artisan Celebration Cake",
					price: "₦35,000",
					description: "Layered sponge cake infused with natural vanilla bean and rich velvet buttercream frosting.",
					image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1000&auto=format&fit=crop&q=85",
					category: "Bakery",
					badge: "Artisan",
				},
				{
					name: "Gourmet Grill Feast Box",
					price: "₦22,000",
					description: "Smoked tender ribs, jumbo prawns, charred sweet corn, and artisan garlic herb potatoes.",
					image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&auto=format&fit=crop&q=85",
					category: "Grill & BBQ",
					badge: "Chef Pick",
				},
			],
			benefits: [
				{ title: "100% Fresh Daily", description: "Never frozen or preserved. Prepared fresh every morning." },
				{ title: "Hygienic Standards", description: "Food safety certified kitchen adhering to international culinary hygiene." },
				{ title: "Fast WhatsApp Ordering", description: "Place custom orders and dietary instructions directly via WhatsApp." },
			],
			testimonials: [
				{
					name: "Chioma E.",
					role: "Event Planner, Victoria Island",
					review: "The catering for our 150-guest gala was flawless. Hot food, rich authentic flavors, and outstanding presentation!",
					rating: 5,
				},
				{
					name: "Dr. Kemi Adeleke",
					role: "Birthday Host",
					review: "The cake tasted even better than it looked. Moist, perfectly sweet, and delivered on time.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "How early should I order for bulk catering?", answer: "We recommend placing bulk orders at least 3 to 5 days in advance." },
				{ question: "Do you offer customized menu tastings?", answer: "Yes! Event catering clients can request a curated tasting session prior to confirmation." },
			],
		};
	}

	// 3. FASHION / CLOTHING / APPAREL / LUXURY GOODS
	if (
		combinedText.includes("fashion") ||
		combinedText.includes("clothing") ||
		combinedText.includes("wear") ||
		combinedText.includes("boutique") ||
		combinedText.includes("dress") ||
		combinedText.includes("shoe") ||
		combinedText.includes("apparel") ||
		combinedText.includes("tailor") ||
		combinedText.includes("jewelry") ||
		combinedText.includes("luxury")
	) {
		const colorVariants = ["#0f172a", "#1e1b4b", "#450a0a", "#14532d"];
		const heroVariants: HeroLayoutVariant[] = ["split_hero", "magazine_hero", "centered_hero"];

		return {
			businessName,
			tagline: rawTagline || "Contemporary Fashion, Couture & Bespoke Tailoring",
			category: "Fashion & Luxury Apparel",
			heroHeadline: `Elevate Your Style With Bespoke Craftsmanship.`,
			heroSubheadline: `Discover curated luxury collections and bespoke tailoring engineered with premium textiles for effortless elegance and unmatched fit.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we celebrate timeless style, pristine garment finishing, and bespoke tailoring designed to make you feel commanding on every occasion.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#eab308",
			designTheme: "LUXURY_EDITORIAL",
			heroLayout: heroVariants[seed % heroVariants.length],
			headerVariant: "clean_minimal",
			fontTheme: "editorial_serif",
			badgeText: "Haute Couture & Bespoke Finishing",
			services: [
				{
					title: "Custom Bespoke Tailoring",
					description: "Individual measurement fittings with imported wool and cotton textiles crafted to your silhouette.",
					price: "From ₦45,000",
				},
				{
					title: "Ready-To-Wear Collections",
					description: "Contemporary urban luxury pieces ready for immediate purchase and nationwide delivery.",
					price: "From ₦18,000",
				},
				{
					title: "VIP Wardrobe Consultation",
					description: "Personalized styling consultation for weddings, galas, and executive photoshoots.",
					price: "Complimentary with Order",
				},
			],
			products: [
				{
					name: "Signature Tailored Two-Piece Set",
					price: "₦48,000",
					description: "Hand-finished tailored two-piece set engineered with breathable, high-twist luxury fabric.",
					image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=85",
					category: "Suits & Sets",
					badge: "Signature",
				},
				{
					name: "Ethereal Silk Evening Gown",
					price: "₦65,000",
					description: "Flowing mulberry silk silhouette featuring handcrafted bead embellishments and structured bodice.",
					image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=85",
					category: "Evening Wear",
					badge: "Limited Edition",
				},
				{
					name: "Artisan Leather Loafers",
					price: "₦38,000",
					description: "Genuine full-grain calfskin leather shoes with hand-burnished patina and cushioned insole.",
					image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1000&auto=format&fit=crop&q=85",
					category: "Footwear",
					badge: "Handmade",
				},
			],
			benefits: [
				{ title: "Premium Textiles", description: "Sourced from top European and African mills with durable stitch integrity." },
				{ title: "Perfect Fit Guarantee", description: "Complimentary alterations until your garment fits like a glove." },
				{ title: "Nationwide Tracked Dispatch", description: "Express doorstep delivery in pristine protective dust bags." },
			],
			testimonials: [
				{
					name: "Ibrahim Y.",
					role: "Corporate Executive",
					review: "The craftsmanship is top-tier. Cut, fit, and fabric quality exceeded my expectations. I received endless compliments.",
					rating: 5,
				},
				{
					name: "Sandra M.",
					role: "Fashion Editor",
					review: "Exquisite finishing! The seam work is cleaner than many imported luxury brands. I am a lifelong customer.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "How long does custom tailoring take?", answer: "Standard bespoke orders take 5 to 7 business days from measurement confirmation." },
				{ question: "Can I provide my own fabric?", answer: "Yes, we accept customer-provided fabrics for bespoke custom tailoring." },
			],
		};
	}

	// 4. TECH / SOFTWARE / DIGITAL / SAAS / IT
	if (
		combinedText.includes("tech") ||
		combinedText.includes("software") ||
		combinedText.includes("app") ||
		combinedText.includes("saas") ||
		combinedText.includes("digital") ||
		combinedText.includes("web") ||
		combinedText.includes("code") ||
		combinedText.includes("cyber") ||
		combinedText.includes("cloud") ||
		combinedText.includes("ai")
	) {
		const colorVariants = ["#06b6d4", "#6366f1", "#10b981", "#8b5cf6"];
		return {
			businessName,
			tagline: rawTagline || "High-Performance Software Engineering & Digital Transformation",
			category: "Technology & Software Solutions",
			heroHeadline: `Architecting Tomorrow's High-Scale Digital Products.`,
			heroSubheadline: `We build blazing-fast web applications, enterprise integrations, and secure cloud infrastructure that automate operations and accelerate growth.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, our engineering team delivers modern software solutions, scalable APIs, and automated digital workflows tailored to give forward-thinking businesses an unfair technological edge.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#38bdf8",
			designTheme: "TECH_CYBER",
			heroLayout: (seed % 2 === 0 ? "magazine_hero" : "centered_hero") as HeroLayoutVariant,
			headerVariant: "floating_pill",
			fontTheme: "modern_mono",
			themeMode: "dark",
			badgeText: "Next-Gen Tech Architecture",
			services: [
				{
					title: "Full-Stack Web & Mobile Engineering",
					description: "High-concurrency modern applications built with React, Next.js, Flutter, and serverless backends.",
					price: "From $2,500",
				},
				{
					title: "Cloud Infrastructure & DevOps",
					description: "Automated CI/CD pipelines, containerized microservices, and 99.99% uptime AWS architectures.",
					price: "Custom Scope",
				},
				{
					title: "AI Integration & Automation",
					description: "Intelligent agent workflows, custom LLM fine-tuning, and automated CRM data pipelines.",
					price: "From $1,500",
				},
			],
			products: [
				{
					name: "Enterprise Core Platform",
					price: "From $499/mo",
					description: "All-in-one scalable dashboard with real-time analytics, RBAC permissions, and webhooks.",
					image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=85",
					category: "Platform",
					badge: "Flagship",
				},
				{
					name: "API Connector Toolkit",
					price: "$199 one-time",
					description: "Plug-and-play secure payment, messaging, and multi-tenant database synchronization.",
					image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=85",
					category: "Developer Tools",
					badge: "Dev Ready",
				},
			],
			benefits: [
				{ title: "Sub-Second Latency", description: "Engineered for speed with globally distributed edge caching." },
				{ title: "Bank-Grade Encryption", description: "Zero-trust security compliance with automated vulnerability scans." },
				{ title: "24/7 Monitored Uptime", description: "Continuous observability and proactive incident alerts." },
			],
			testimonials: [
				{
					name: "Marcus Vance",
					role: "CTO, FinPulse",
					review: "The team delivered our entire MVP in record time. Clean architecture, stellar documentation, and rock-solid code.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "What is your typical project timeline?", answer: "Most custom development milestones go from sprint kickoff to staging release in 2 to 4 weeks." },
			],
		};
	}

	// 5. BEAUTY / SPA / WELLNESS / HEALTH / DENTAL
	if (
		combinedText.includes("beauty") ||
		combinedText.includes("salon") ||
		combinedText.includes("hair") ||
		combinedText.includes("skin") ||
		combinedText.includes("spa") ||
		combinedText.includes("wellness") ||
		combinedText.includes("health") ||
		combinedText.includes("dental") ||
		combinedText.includes("clinic") ||
		combinedText.includes("cosmetic")
	) {
		const colorVariants = ["#0d9488", "#be185d", "#7c3aed", "#047857"];
		return {
			businessName,
			tagline: rawTagline || "Rejuvenating Care, Holistic Wellness & Aesthetics",
			category: "Wellness, Aesthetics & Personal Care",
			heroHeadline: `Radiate Confidence With Expert Care & Aesthetic Excellence.`,
			heroSubheadline: `Experience personalized clinical and aesthetic treatments designed to revitalize your body, rejuvenate your skin, and nurture inner vitality.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we combine certified professional clinicians with premium organic formulations to provide rejuvenating beauty, skin, and wellness treatments tailored to your unique lifestyle.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#f43f5e",
			designTheme: (seed % 2 === 0 ? "MODERN_MINIMAL" : "WARM_EARTHY") as DesignTheme,
			heroLayout: (seed % 2 === 0 ? "split_hero" : "centered_hero") as HeroLayoutVariant,
			headerVariant: "floating_pill",
			fontTheme: "editorial_serif",
			badgeText: "Certified Holistic & Aesthetic Care",
			services: [
				{
					title: "Signature Hydrafacial & Skin Rejuvenation",
					description: "Deep pore extraction, peptide infusion, and gentle LED light therapy for a radiant natural glow.",
					price: "₦25,000",
					duration: "60 Mins",
				},
				{
					title: "Aromatherapy Full Body Massage",
					description: "Therapeutic deep-tissue stress relief using therapeutic grade essential oils in private tranquil suites.",
					price: "₦30,000",
					duration: "90 Mins",
				},
				{
					title: "Luxury Hair Styling & Treatment",
					description: "Custom color, organic keratin restorative treatment, and precision styling by master artists.",
					price: "From ₦15,000",
					duration: "Custom",
				},
			],
			products: [
				{
					name: "Radiance Botanical Glow Serum",
					price: "₦18,500",
					description: "Cold-pressed rosehip seed oil infused with Vitamin C and hyaluronic acid for 24-hour hydration.",
					image: "https://images.unsplash.com/photo-1608248597359-58b3a72ce9b2?w=1000&auto=format&fit=crop&q=85",
					category: "Skincare",
					badge: "Best Seller",
				},
				{
					name: "Pure Lavender Calming Elixir",
					price: "₦12,000",
					description: "Therapeutic bedtime pillow mist and body oil crafted from organic French lavender blossoms.",
					image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=1000&auto=format&fit=crop&q=85",
					category: "Wellness",
					badge: "Organic",
				},
			],
			benefits: [
				{ title: "Licensed Specialists", description: "Every practitioner holds international certifications in aesthetic wellness." },
				{ title: "Clean & Organic Formulas", description: "100% cruelty-free, paraben-free, and dermatologically tested ingredients." },
				{ title: "VIP Private Suites", description: "Unwind in serene, sound-isolated private therapy rooms with calming ambiance." },
			],
			testimonials: [
				{
					name: "Amara N.",
					role: "Client, Lekki Phase 1",
					review: "The glow after my facial was unbelievable! The atmosphere is so peaceful, and the team made me feel pampered from start to finish.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "How do I book an appointment?", answer: "Click 'Chat on WhatsApp' to pick your preferred service and schedule an appointment time directly." },
			],
		};
	}

	// 6. REAL ESTATE / ARCHITECTURE / INTERIOR DESIGN / PROPERTY
	if (
		combinedText.includes("real estate") ||
		combinedText.includes("property") ||
		combinedText.includes("homes") ||
		combinedText.includes("interior") ||
		combinedText.includes("architecture") ||
		combinedText.includes("apartment") ||
		combinedText.includes("build") ||
		combinedText.includes("construction")
	) {
		const colorVariants = ["#047857", "#1e293b", "#78350f", "#0369a1"];
		return {
			businessName,
			tagline: rawTagline || "Prime Property Developments, Architecture & Interior Elegance",
			category: "Real Estate & Architectural Design",
			heroHeadline: `Discover Prime Living Spaces Engineered For Generations.`,
			heroSubheadline: `We connect discerning buyers with exclusive prime properties, modern architectural builds, and bespoke interior spaces with verified titles.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we specialize in prime residential developments, verified land acquisitions, and high-yield property investment portfolios built on integrity, transparency, and superior architectural craftsmanship.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#10b981",
			designTheme: "CORPORATE_EXECUTIVE",
			heroLayout: "split_hero",
			headerVariant: "classic_bar",
			fontTheme: "editorial_serif",
			badgeText: "Verified Property Portfolio",
			services: [
				{
					title: "Prime Property Sales & Acquisitions",
					description: "Fully verified residential and commercial listings with clear land titles and Governor's Consent.",
					price: "Market Competitive",
				},
				{
					title: "Bespoke Interior Architecture",
					description: "Turnkey luxury interior design, 3D visualization, custom cabinetry, and ambient lighting architecture.",
					price: "From ₦2,500,000",
				},
				{
					title: "High-Yield Real Estate Investment",
					description: "Off-plan developments yielding 25%+ annual capital appreciation in rapidly emerging prime corridors.",
					price: "Inquire for Prospectus",
				},
			],
			products: [
				{
					name: "Luxury 4-Bedroom Smart Villa",
					price: "₦140,000,000",
					description: "Fully automated smart home featuring private infinity pool, cinema room, and solar power backup.",
					image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=85",
					category: "Villas",
					badge: "Prime Location",
				},
				{
					name: "Modern 2-Bedroom Waterfront Penthouse",
					price: "₦75,000,000",
					description: "Panoramic shoreline views, floor-to-ceiling double-glazed windows, and 24/7 concierge security.",
					image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=85",
					category: "Apartments",
					badge: "Exclusive",
				},
			],
			benefits: [
				{ title: "100% Verified Titles", description: "Every listing undergoes comprehensive legal search and documentation verification." },
				{ title: "Zero Agent Agency Fees", description: "Direct developer pricing with flexible instalment plans." },
				{ title: "Turnkey Handover", description: "Complete documentation and keys delivered on guaranteed completion dates." },
			],
			testimonials: [
				{
					name: "Engr. Femi Babalola",
					role: "Homeowner",
					review: "Buying my family home through this team was effortless. Clear documentation, transparent milestones, and zero stress.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "What payment plans are available?", answer: "We offer flexible milestone instalment plans up to 18 to 24 months for off-plan properties." },
			],
		};
	}

	// 7. CREATIVE STUDIO / MEDIA / PHOTOGRAPHY / VIDEO / MARKETING AGENCY
	if (
		combinedText.includes("photo") ||
		combinedText.includes("video") ||
		combinedText.includes("media") ||
		combinedText.includes("studio") ||
		combinedText.includes("film") ||
		combinedText.includes("agency") ||
		combinedText.includes("marketing") ||
		combinedText.includes("brand") ||
		combinedText.includes("design")
	) {
		const colorVariants = ["#4f46e5", "#7c3aed", "#db2777", "#ea580c"];
		return {
			businessName,
			tagline: rawTagline || "Cinematic Visuals, Creative Direction & Brand Storytelling",
			category: "Creative Media & Visual Arts",
			heroHeadline: `Visuals That Command Attention & Tell Powerful Stories.`,
			heroSubheadline: `We produce high-impact brand commercials, cinematic event coverage, editorial photography, and creative campaigns that set you apart.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we are a passionate collective of visual artists, cinematographers, and brand strategists dedicated to turning moments into timeless digital masterpieces that captivate audiences.`,
			primaryColor: colorVariants[seed % colorVariants.length],
			accentColor: "#f43f5e",
			designTheme: "CREATIVE_STUDIO",
			heroLayout: "magazine_hero",
			headerVariant: "clean_minimal",
			fontTheme: "bold_display",
			badgeText: "Award-Winning Creative Studio",
			services: [
				{
					title: "Cinematic Event & Wedding Production",
					description: "Multi-camera 4K coverage, drone aerial cinematography, and same-day highlight reels.",
					price: "From ₦250,000",
				},
				{
					title: "Commercial & Brand Advertising",
					description: "High-production commercials, studio product photography, and social viral video assets.",
					price: "Custom Production Quote",
				},
				{
					title: "Editorial & Portrait Photography",
					description: "Studio lighting, creative art direction, and high-end magazine skin retouching.",
					price: "From ₦45,000",
				},
			],
			products: [
				{
					name: "Complete Wedding Cinematic Package",
					price: "₦450,000",
					description: "Full day 3-camera crew, 4K documentary film, 3-minute viral teaser, and photo album.",
					image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1000&auto=format&fit=crop&q=85",
					category: "Cinematography",
					badge: "Popular Package",
				},
				{
					name: "Brand Studio Catalog Shoot (10 Products)",
					price: "₦85,000",
					description: "Stylized e-commerce and lifestyle photos ready for Instagram and website catalogs.",
					image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1000&auto=format&fit=crop&q=85",
					category: "Photography",
					badge: "Commercial",
				},
			],
			benefits: [
				{ title: "Cinema-Grade 4K & RAW", description: "Shot on high-end RED, Sony Cinema, and prime G-Master lenses." },
				{ title: "Fast Turnaround", description: "Receive your edited visual highlights within 48 to 72 hours." },
				{ title: "Creative Art Direction", description: "Comprehensive moodboarding, location scouting, and lighting setups." },
			],
			testimonials: [
				{
					name: "Tunde & Stephanie",
					role: "Wedding Couple",
					review: "Our wedding film brought tears to our eyes! The cinematic quality is like a Netflix movie. Worth every single penny.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "Do you travel for destination shoots?", answer: "Yes! We regularly travel nationwide and internationally for shoots and events." },
			],
		};
	}

	// 8. DYNAMIC DETERMINISTIC DIVERSE FALLBACK
	// Guaranteed variation across 6 themes, 4 layouts, 3 headers, and 8 curated palettes
	const fallbackThemes: DesignTheme[] = [
		"MODERN_MINIMAL",
		"LUXURY_EDITORIAL",
		"BOLD_VIBRANT",
		"TECH_CYBER",
		"WARM_EARTHY",
		"CORPORATE_EXECUTIVE",
		"CREATIVE_STUDIO",
	];
	const fallbackHeroLayouts: HeroLayoutVariant[] = [
		"split_hero",
		"centered_hero",
		"magazine_hero",
		"showcase_hero",
	];
	const fallbackHeaderVariants: HeaderVariant[] = [
		"floating_pill",
		"clean_minimal",
		"classic_bar",
	];
	const fallbackFontThemes: FontTheme[] = [
		"sans_geometric",
		"editorial_serif",
		"bold_display",
		"modern_mono",
	];
	const fallbackPalettes = [
		{ primary: "#2563eb", accent: "#38bdf8" }, // Royal Blue
		{ primary: "#059669", accent: "#34d399" }, // Emerald Green
		{ primary: "#7c3aed", accent: "#c084fc" }, // Electric Violet
		{ primary: "#c2410c", accent: "#fb923c" }, // Warm Terracotta
		{ primary: "#0f172a", accent: "#eab308" }, // Obsidian & Gold
		{ primary: "#e11d48", accent: "#fb7185" }, // Crimson Rose
		{ primary: "#0284c7", accent: "#38bdf8" }, // Cyan Azure
		{ primary: "#4f46e5", accent: "#818cf8" }, // Indigo
	];

	const chosenTheme = fallbackThemes[seed % fallbackThemes.length];
	const chosenHero = fallbackHeroLayouts[seed % fallbackHeroLayouts.length];
	const chosenHeader = fallbackHeaderVariants[seed % fallbackHeaderVariants.length];
	const chosenFont = fallbackFontThemes[seed % fallbackFontThemes.length];
	const chosenPalette = fallbackPalettes[seed % fallbackPalettes.length];

	const cleanAbout =
		rawAbout ||
		`At ${businessName}, we deliver premium, tailored solutions engineered to solve your core needs with exceptional quality, fast communication, and verified results.`;

	return {
		businessName,
		tagline: rawTagline || `Premium Solutions & Products Tailored For You`,
		category: "Bespoke Solutions & Products",
		heroHeadline: rawTagline || `Specialized Solutions Engineered By ${businessName}.`,
		heroSubheadline: cleanAbout,
		aboutText: cleanAbout,
		primaryColor: chosenPalette.primary,
		accentColor: chosenPalette.accent,
		designTheme: chosenTheme,
		heroLayout: chosenHero,
		headerVariant: chosenHeader,
		fontTheme: chosenFont,
		badgeText: "Official Verified Business",
		services: [
			{
				title: `${businessName} Core Solution`,
				description: cleanAbout,
				price: "Inquire for Quote",
				icon: "Sparkles",
			},
			{
				title: "VIP Consultation & Rapid Delivery",
				description: "Connect directly with our team for priority support, personalized delivery, and dedicated attention.",
				price: "Included",
				icon: "CheckCircle2",
			},
			{
				title: "Custom Orders & Dedicated Fulfillment",
				description: "Specialized packages and customized deliverables designed around your exact specifications.",
				price: "Custom",
				icon: "MessageCircle",
			},
		],
		products: [
			{
				name: `${businessName} Signature Offering`,
				price: "Inquire on WhatsApp",
				description: cleanAbout,
				image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=85",
				category: "Featured",
				badge: "Official",
			},
		],
		benefits: [
			{ title: "Dedicated Attention", description: "Direct communication with our specialists every step of the way." },
			{ title: "Quality Guarantee", description: "Tested and verified excellence with prompt delivery." },
			{ title: "Direct WhatsApp Service", description: "Immediate response for quotes and support." },
		],
		testimonials: [
			{
				name: "Verified Client",
				role: "Valued Customer",
				review: `Working with ${businessName} has been exceptional. Professional, responsive, and top-tier execution.`,
				rating: 5,
			},
		],
		faqs: [
			{
				question: `How do I get started with ${businessName}?`,
				answer: "Simply click the WhatsApp button to chat with our team and get an instant quote.",
			},
		],
	};
}
