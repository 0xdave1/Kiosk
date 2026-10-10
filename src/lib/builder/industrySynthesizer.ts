/**
 * Intelligent Business Content & Design Synthesizer
 *
 * Analyzes submitted business name, tagline, and about description.
 * Dynamically synthesizes industry-specific:
 * - High-converting headlines & value propositions
 * - Tailored services & offerings
 * - Relevant products / catalog items with realistic prices and high-res imagery
 * - Realistic testimonials and trust proof
 * - Relevant FAQs
 * - Cohesive brand color palette
 *
 * @module industrySynthesizer
 * @format
 */

export interface SynthesizedBlueprint {
	businessName: string;
	tagline: string;
	category: string;
	heroHeadline: string;
	heroSubheadline: string;
	aboutText: string;
	primaryColor: string;
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

export function synthesizeIndustryBlueprint(
	rawName: string,
	rawTagline: string,
	rawAbout: string,
	address?: string,
	phone?: string,
): SynthesizedBlueprint {
	const businessName = (rawName || "My Business").trim();
	const combinedText = `${rawName} ${rawTagline} ${rawAbout}`.toLowerCase();

	// 1. TRANSPORTATION / BUS CHARTER / TRAVEL
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
		combinedText.includes("interstate")
	) {
		const loc = address || "Nigeria";
		return {
			businessName,
			tagline: rawTagline || "Executive Coaster Bus Charters & Nationwide Group Transit",
			category: "Passenger Transit & Luxury Bus Charter",
			heroHeadline: `Executive Coaster Bus Charters. Safe, Air-Conditioned & On Time.`,
			heroSubheadline: `Experience exceptional group travel across ${loc} and nationwide. 30-seater executive coaster buses for corporate tours, family weddings, church retreats, intercity travel, and airport conveyance. Bring your ${businessName}.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we specialize in premier coaster bus rental and passenger charter services across ${loc}. Every vehicle in our fleet is fully air-conditioned, rigorously serviced, and operated by licensed, courteous professional drivers dedicated to punctual arrivals and maximum passenger comfort.`,
			primaryColor: "#034575", // Deep transit navy
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
				{
					name: "Alhaji S. Mohammed",
					role: "Operations Director",
					review: `We rely on ${businessName} for all our company quarterly field visits. Always on time, spotless interiors, and transparent pricing. 10/10 recommendation.`,
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
				{
					question: "How far in advance should I reserve a bus?",
					answer:
						"We recommend booking at least 48 to 72 hours prior to your travel date, though emergency same-day dispatch is available depending on fleet availability.",
				},
			],
		};
	}

	// 2. FOOD / RESTAURANT / BAKERY / CATERING
	if (
		combinedText.includes("food") ||
		combinedText.includes("restaurant") ||
		combinedText.includes("bakery") ||
		combinedText.includes("cake") ||
		combinedText.includes("grill") ||
		combinedText.includes("cater") ||
		combinedText.includes("kitchen") ||
		combinedText.includes("cafe")
	) {
		return {
			businessName,
			tagline: rawTagline || "Artisanal Flavors, Fresh Ingredients & Catering",
			category: "Dining & Gourmet Catering",
			heroHeadline: `Handcrafted Culinary Perfection For Every Occasion.`,
			heroSubheadline: `From signature delicacies to large-scale event catering, ${businessName} delivers unforgettable flavors crafted with farm-fresh ingredients.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, our culinary masters combine passion with the freshest local ingredients to prepare sensational meals and custom catering packages tailored to your palate.`,
			primaryColor: "#c2410c",
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
					price: "₦12,500",
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
			],
			benefits: [
				{ title: "100% Fresh Daily", description: "Never frozen or preserved. Prepared fresh every morning." },
				{ title: "Hygienic Standards", description: "Food safety certified kitchen adhering to international culinary hygiene." },
				{ title: "Fast WhatsApp Ordering", description: "Place custom orders and dietary instructions directly via WhatsApp." },
			],
			testimonials: [
				{
					name: "Chioma E.",
					role: "Event Planner",
					review: "The catering for our 150-guest event was flawless. Hot food, rich flavors, and everyone asked for the chef's contact!",
					rating: 5,
				},
			],
			faqs: [
				{ question: "How early should I order for bulk catering?", answer: "We recommend placing bulk orders at least 3 to 5 days in advance." },
			],
		};
	}

	// 3. FASHION / CLOTHING / APPAREL
	if (
		combinedText.includes("fashion") ||
		combinedText.includes("clothing") ||
		combinedText.includes("wear") ||
		combinedText.includes("boutique") ||
		combinedText.includes("dress") ||
		combinedText.includes("shoe")
	) {
		return {
			businessName,
			tagline: rawTagline || "Contemporary Fashion & Bespoke Tailoring",
			category: "Fashion & Luxury Apparel",
			heroHeadline: `Elevate Your Style With Bespoke Craftsmanship.`,
			heroSubheadline: `Discover curated collections and custom tailoring engineered with premium textiles for effortless elegance.`,
			aboutText:
				rawAbout ||
				`At ${businessName}, we celebrate timeless style, pristine garment finishing, and bespoke tailoring designed to make you stand out on every occasion.`,
			primaryColor: "#0f172a",
			services: [
				{
					title: "Custom Bespoke Tailoring",
					description: "Individual measurement fittings with imported wool and cotton textiles crafted to your silhouette.",
					price: "From ₦45,000",
				},
				{
					title: "Ready-To-Wear Collections",
					description: "Contemporary urban luxury pieces ready for immediate purchase and nationwide delivery.",
					price: "From ₦15,000",
				},
			],
			products: [
				{
					name: "Signature Tailored Set",
					price: "₦48,000",
					description: "Hand-finished tailored two-piece set engineered with breathable, high-twist fabric.",
					image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=85",
					category: "Suits",
					badge: "Signature",
				},
			],
			benefits: [
				{ title: "Premium Textiles", description: "Sourced from top mills with durable stitch integrity." },
				{ title: "Perfect Fit Guarantee", description: "Complimentary alterations until your garment fits like a glove." },
			],
			testimonials: [
				{
					name: "Ibrahim Y.",
					role: "Customer",
					review: "The craftsmanship is top-tier. Cut, fit, and fabric quality exceeded my expectations.",
					rating: 5,
				},
			],
			faqs: [
				{ question: "How long does custom tailoring take?", answer: "Standard bespoke orders take 5 to 7 business days from measurement confirmation." },
			],
		};
	}

	// 4. GENERAL CUSTOM FALLBACK (ADAPTED TO USER'S WORDS)
	const cleanAbout = rawAbout || `We deliver professional, high-quality solutions tailored specifically for your needs.`;
	return {
		businessName,
		tagline: rawTagline || `Specialized Solutions for You`,
		category: "Professional Services & Solutions",
		heroHeadline: `${rawTagline || `Premium Solutions from ${businessName}`}`,
		heroSubheadline: cleanAbout,
		aboutText: cleanAbout,
		primaryColor: "#004ac6",
		services: [
			{
				title: `${businessName} Core Services`,
				description: cleanAbout,
				price: "Custom Quote",
				icon: "Sparkles",
			},
			{
				title: "Consultation & Direct Booking",
				description: "Connect directly with our team to discuss your custom project requirements.",
				price: "Free Inquiry",
				icon: "MessageCircle",
			},
		],
		products: [
			{
				name: `${businessName} Featured Offering`,
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
