/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	Upload,
	CheckCircle2,
	Sparkles,
	Loader2,
	Image as ImageIcon,
	Trash2,
	Globe,
	Phone,
	Zap,
	ShoppingBag,
	AlertCircle,
	Share2,
	Calendar,
	Plus,
	Package,
	Star,
	Video,
	Clock,
	Flame,
	Sun,
	Moon,
} from "lucide-react";
import PillButton from "@/components/PillButton";
import { useCurrency } from "@/context/CurrencyContext";

export interface ProductItem {
	id: string;
	name: string;
	price: number;
	description?: string;
	category?: string;
	imageUrl?: string;
	badge?: string;
}

export interface ServiceItem {
	id: string;
	title: string;
	description: string;
	icon?: string;
	price?: string;
}

export interface TestimonialItem {
	id: string;
	name: string;
	role?: string;
	review: string;
	rating: number;
	avatarUrl?: string;
}

export interface FaqItem {
	id: string;
	question: string;
	answer: string;
}

export interface StatItem {
	id: string;
	label: string;
	value: string;
}

export interface ValueStackItem {
	id: string;
	title: string;
	value: string;
	description?: string;
	isBonus?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	NGN: "₦",
	GHS: "GH₵",
	KES: "KSh",
	EUR: "€",
	GBP: "£",
};

interface UploadedImage {
	id: string;
	name: string;
	size: string;
	url: string;
}

type PlanType = "LANDING_PAGE" | "SALES_FUNNEL" | "E_COMMERCE";

function ContentForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const logoFileInputRef = useRef<HTMLInputElement>(null);
	const brandFilesInputRef = useRef<HTMLInputElement>(null);
	const { formatPlanPrice, isLoading: isCurrencyLoading } = useCurrency();

	// Plan & Payment Status Detection
	const planQuery = (searchParams.get("plan") || "").toUpperCase();
	const statusParam = (searchParams.get("status") || "").toLowerCase();
	const isCancelled =
		statusParam === "cancelled" ||
		statusParam === "failed" ||
		searchParams.get("cancelled") === "true";
	const isPaymentSuccess =
		(statusParam === "successful" ||
			statusParam === "success" ||
			searchParams.get("payment") === "complete") &&
		!isCancelled;

	const [activePlan, setActivePlan] = useState<PlanType>(
		planQuery.includes("FUNNEL")
			? "SALES_FUNNEL"
			: planQuery.includes("COMMERCE") || planQuery.includes("STORE")
			? "E_COMMERCE"
			: "LANDING_PAGE",
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [uploadingCount, setUploadingCount] = useState(0);

	// Theme Mode State (Light vs Dark Mode)
	const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

	// ZERO DEMO DATA - Start completely empty for clean user entry
	const [businessName, setBusinessName] = useState("");
	const [tagline, setTagline] = useState("");
	const [aboutText, setAboutText] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [contactPhone, setContactPhone] = useState("");
	const [contactAddress, setContactAddress] = useState("");

	// ELABORATE LANDING PAGE SPECIFIC FIELDS
	const [ctaText, setCtaText] = useState("Claim Free Consultation");
	const [services, setServices] = useState<ServiceItem[]>([
		{
			id: "srv-1",
			title: "Strategic Growth & Consulting",
			description: "Tailored roadmaps to scale revenue, streamline operations, and capture market leadership.",
			icon: "TrendingUp",
			price: "From $950",
		},
		{
			id: "srv-2",
			title: "Full-Stack Implementation",
			description: "End-to-end bespoke development, automated workflows, and high-converting modern architecture.",
			icon: "Layers",
			price: "Custom Quote",
		},
		{
			id: "srv-3",
			title: "Dedicated 24/7 Managed Support",
			description: "Round-the-clock priority maintenance, real-time analytics monitoring, and proactive optimization.",
			icon: "ShieldCheck",
			price: "$299/mo",
		},
	]);
	const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([
		{
			id: "t-1",
			name: "David Kendrick",
			role: "Founder, Apex Scaling",
			review: "Kiosk delivered exceptional execution. Our conversion rates doubled in the first 30 days alone!",
			rating: 5,
			avatarUrl: "",
		},
		{
			id: "t-2",
			name: "Elena Rostova",
			role: "CMO, NovaTech Solutions",
			review: "The visual polish and UX elevated our market positioning immediately. Truly world-class.",
			rating: 5,
			avatarUrl: "",
		},
	]);
	const [faqs, setFaqs] = useState<FaqItem[]>([
		{
			id: "f-1",
			question: "How quickly does our project go live?",
			answer: "Most client systems launch live within 48 to 72 hours following onboarding confirmation.",
		},
		{
			id: "f-2",
			question: "Are payment gateways and WhatsApp integrated?",
			answer: "Yes! We link direct WhatsApp ordering, Stripe, Paystack, and Calendly seamlessly.",
		},
		{
			id: "f-3",
			question: "What is your revision and satisfaction guarantee?",
			answer: "We offer dedicated revisions until your final launch is 100% approved and published.",
		},
	]);
	const [stats, setStats] = useState<StatItem[]>([
		{ id: "st-1", label: "Client Satisfaction", value: "99.4%" },
		{ id: "st-2", label: "Projects Delivered", value: "3,500+" },
		{ id: "st-3", label: "Average ROI Increase", value: "4.8x" },
	]);

	// ELABORATE SALES FUNNEL SPECIFIC FIELDS
	const [leadMagnetTitle, setLeadMagnetTitle] = useState("");
	const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
	const [countdownMinutes, setCountdownMinutes] = useState<number>(15);
	const [valueStackItems, setValueStackItems] = useState<ValueStackItem[]>([
		{
			id: "vs-1",
			title: "Complete Core Acceleration System",
			value: "$497",
			description: "Step-by-step master framework with turnkey execution templates.",
			isBonus: false,
		},
		{
			id: "vs-2",
			title: "Plug-and-Play High-Conversion Funnel Assets",
			value: "$297",
			description: "Pre-built high-converting copy, automations, and landing pages.",
			isBonus: false,
		},
		{
			id: "vs-3",
			title: "BONUS: 1-on-1 VIP Strategy Roadmap Session",
			value: "$199",
			description: "Private audit to customize the exact roadmap for your business.",
			isBonus: true,
		},
	]);
	const [regularPrice, setRegularPrice] = useState<number>(497);
	const [discountPrice, setDiscountPrice] = useState<number>(97);
	const [orderBumpTitle, setOrderBumpTitle] = useState("Add VIP Inner Circle & Lifetime Mastermind (Save 80%)");
	const [orderBumpPrice, setOrderBumpPrice] = useState<number>(27);
	const [orderBumpDescription, setOrderBumpDescription] = useState(
		"Get weekly direct coaching, live Q&A access, and exclusive bonus breakdown vaults."
	);
	const [guaranteeText, setGuaranteeText] = useState(
		"30-Day 100% Risk-Free Guarantee. If you're not completely blown away, receive a full refund instantly."
	);

	// E-Commerce Specific Fields & Dynamic Products
	const [currency, setCurrency] = useState("USD");
	const [shippingInfo, setShippingInfo] = useState("");
	const [products, setProducts] = useState<ProductItem[]>([
		{
			id: "prod-1",
			name: "Signature Item",
			price: 35.0,
			description: "Handcrafted with premium materials and custom finishing.",
			category: "Bestsellers",
			imageUrl: "",
			badge: "Best Seller",
		},
		{
			id: "prod-2",
			name: "Limited Edition Edition",
			price: 55.0,
			description: "Exclusive release with worldwide priority shipping.",
			category: "Featured",
			imageUrl: "",
			badge: "New",
		},
	]);

	// Uploaded Logo & Brand Assets (Separated)
	const [logoImage, setLogoImage] = useState<UploadedImage | null>(null);
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

	// Social & Essential Links State
	const [whatsappLink, setWhatsappLink] = useState("");
	const [xLink, setXLink] = useState("");
	const [instagramLink, setInstagramLink] = useState("");
	const [facebookLink, setFacebookLink] = useState("");
	const [linkedinLink, setLinkedinLink] = useState("");
	const [youtubeLink, setYoutubeLink] = useState("");
	const [tiktokLink, setTiktokLink] = useState("");
	const [bookingLink, setBookingLink] = useState("");
	const [customLink, setCustomLink] = useState("");

	const projectId = searchParams.get("projectId") || "default";
	const draftKey = `kiosk_draft_content_${projectId}`;
	const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

	// Landing page helper methods
	const handleAddService = () => {
		setServices((prev) => [
			...prev,
			{
				id: `srv-${Date.now()}`,
				title: "",
				description: "",
				icon: "Check",
				price: "",
			},
		]);
	};

	const handleUpdateService = (id: string, field: keyof ServiceItem, value: any) => {
		setServices((prev) =>
			prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
		);
	};

	const handleDeleteService = (id: string) => {
		setServices((prev) => prev.filter((s) => s.id !== id));
	};

	const handleAddTestimonial = () => {
		setTestimonialsList((prev) => [
			...prev,
			{
				id: `t-${Date.now()}`,
				name: "",
				role: "",
				review: "",
				rating: 5,
				avatarUrl: "",
			},
		]);
	};

	const handleUpdateTestimonial = (id: string, field: keyof TestimonialItem, value: any) => {
		setTestimonialsList((prev) =>
			prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
		);
	};

	const handleDeleteTestimonial = (id: string) => {
		setTestimonialsList((prev) => prev.filter((t) => t.id !== id));
	};

	const handleAddFaq = () => {
		setFaqs((prev) => [
			...prev,
			{ id: `f-${Date.now()}`, question: "", answer: "" },
		]);
	};

	const handleUpdateFaq = (id: string, field: keyof FaqItem, value: any) => {
		setFaqs((prev) =>
			prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
		);
	};

	const handleDeleteFaq = (id: string) => {
		setFaqs((prev) => prev.filter((f) => f.id !== id));
	};

	const handleUpdateStat = (id: string, field: keyof StatItem, value: any) => {
		setStats((prev) =>
			prev.map((st) => (st.id === id ? { ...st, [field]: value } : st))
		);
	};

	// Sales funnel helper methods
	const handleAddValueStackItem = () => {
		setValueStackItems((prev) => [
			...prev,
			{
				id: `vs-${Date.now()}`,
				title: "",
				value: "$197",
				description: "",
				isBonus: false,
			},
		]);
	};

	const handleUpdateValueStackItem = (id: string, field: keyof ValueStackItem, value: any) => {
		setValueStackItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
		);
	};

	const handleDeleteValueStackItem = (id: string) => {
		setValueStackItems((prev) => prev.filter((item) => item.id !== id));
	};

	// Product management helpers
	const handleAddProduct = () => {
		const newProd: ProductItem = {
			id: `prod-${Date.now()}`,
			name: "",
			price: 0,
			description: "",
			category: "General",
			imageUrl: "",
			badge: "",
		};
		setProducts((prev) => [...prev, newProd]);
	};

	const handleUpdateProduct = (id: string, field: keyof ProductItem, value: any) => {
		setProducts((prev) =>
			prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
		);
	};

	const handleDeleteProduct = (id: string) => {
		setProducts((prev) => prev.filter((p) => p.id !== id));
	};

	const handleProductImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		handleUpdateProduct(id, "imageUrl", url);
		setUploadingCount((c) => c + 1);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "kiosk/products");

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (res.ok && data.file?.url) {
				handleUpdateProduct(id, "imageUrl", data.file.url);
			} else {
				handleUpdateProduct(id, "imageUrl", "");
				alert(data.error || "Failed to upload product photo. Please try a smaller image.");
			}
		} catch (err) {
			console.error("[PRODUCT_IMAGE_CLOUDINARY_UPLOAD_ERROR]", err);
			handleUpdateProduct(id, "imageUrl", "");
			alert("Network error while uploading product photo. Please check your connection.");
		} finally {
			setUploadingCount((c) => Math.max(0, c - 1));
			try {
				URL.revokeObjectURL(url);
			} catch (e) {}
		}
	};

	// Load existing user submitted content from backend + localStorage cache
	useEffect(() => {
		async function loadSavedContent() {
			try {
				// Reset state to empty defaults for new/switched project
				setBusinessName("");
				setTagline("");
				setAboutText("");
				setContactEmail("");
				setContactPhone("");
				setContactAddress("");
				setCtaText("Claim Free Consultation");
				setLeadMagnetTitle("");
				setVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
				setCountdownMinutes(15);
				setRegularPrice(497);
				setDiscountPrice(97);
				setOrderBumpTitle("Add VIP Inner Circle & Lifetime Mastermind (Save 80%)");
				setOrderBumpPrice(27);
				setOrderBumpDescription(
					"Get weekly direct coaching, live Q&A access, and exclusive bonus breakdown vaults."
				);
				setGuaranteeText(
					"30-Day 100% Risk-Free Guarantee. If you're not completely blown away, receive a full refund instantly."
				);
				setCurrency("USD");
				setShippingInfo("");
				setWhatsappLink("");
				setXLink("");
				setInstagramLink("");
				setFacebookLink("");
				setLinkedinLink("");
				setYoutubeLink("");
				setTiktokLink("");
				setBookingLink("");
				setCustomLink("");
				setUploadedImages([]);
				setHasLoadedDraft(false);

				let backendContent: any = {};
				const res = await fetch(`/api/projects/content?projectId=${projectId}`);
				if (res.ok) {
					const data = await res.json();
					if (data.content) {
						backendContent = data.content;
					}
				}

				// Check for local unsubmitted draft in localStorage
				let draftContent: any = {};
				try {
					const localDraft = localStorage.getItem(draftKey);
					if (localDraft) {
						draftContent = JSON.parse(localDraft);
					}
				} catch (e) {
					console.error("[LOCALSTORAGE_READ_ERROR]", e);
				}

				// Merge backend content with local draft (local draft takes precedence for unsaved edits)
				const merged = { ...backendContent, ...draftContent };

				if (merged.businessName) setBusinessName(merged.businessName);
				if (merged.tagline) setTagline(merged.tagline);
				if (merged.aboutText) setAboutText(merged.aboutText);
				if (merged.contactEmail) setContactEmail(merged.contactEmail);
				if (merged.contactPhone) setContactPhone(merged.contactPhone);
				if (merged.contactAddress) setContactAddress(merged.contactAddress);

				// Landing Page Fields
				if (Array.isArray(merged.services) && merged.services.length > 0) {
					setServices(merged.services);
				}
				if (Array.isArray(merged.testimonialsList) && merged.testimonialsList.length > 0) {
					setTestimonialsList(merged.testimonialsList);
				}
				if (Array.isArray(merged.faqs) && merged.faqs.length > 0) {
					setFaqs(merged.faqs);
				}
				if (Array.isArray(merged.stats) && merged.stats.length > 0) {
					setStats(merged.stats);
				}
				if (merged.ctaText) setCtaText(merged.ctaText);

				// Sales Funnel Fields
				if (merged.leadMagnetTitle) setLeadMagnetTitle(merged.leadMagnetTitle);
				if (merged.videoUrl) setVideoUrl(merged.videoUrl);
				if (merged.countdownMinutes) setCountdownMinutes(Number(merged.countdownMinutes) || 15);
				if (Array.isArray(merged.valueStackItems) && merged.valueStackItems.length > 0) {
					setValueStackItems(merged.valueStackItems);
				}
				if (merged.regularPrice !== undefined) setRegularPrice(Number(merged.regularPrice) || 497);
				if (merged.discountPrice !== undefined) setDiscountPrice(Number(merged.discountPrice) || 97);
				if (merged.orderBumpTitle) setOrderBumpTitle(merged.orderBumpTitle);
				if (merged.orderBumpPrice !== undefined) setOrderBumpPrice(Number(merged.orderBumpPrice) || 27);
				if (merged.orderBumpDescription) setOrderBumpDescription(merged.orderBumpDescription);
				if (merged.guaranteeText) setGuaranteeText(merged.guaranteeText);

				// E-commerce Fields & Products
				if (Array.isArray(merged.products) && merged.products.length > 0) {
					const sanitizedProducts = merged.products.map((p: any) => ({
						...p,
						imageUrl: (p.imageUrl || "").startsWith("blob:") ? "" : p.imageUrl,
					}));
					setProducts(sanitizedProducts);
				}
				if (merged.currency) setCurrency(merged.currency);
				if (merged.shippingInfo) setShippingInfo(merged.shippingInfo);

				if (merged.themeMode === "dark" || merged.themeMode === "light") {
					setThemeMode(merged.themeMode);
				}

				// Social Media & Necessary Links
				if (merged.whatsappLink) setWhatsappLink(merged.whatsappLink);
				if (merged.xLink) setXLink(merged.xLink);
				if (merged.instagramLink) setInstagramLink(merged.instagramLink);
				if (merged.facebookLink) setFacebookLink(merged.facebookLink);
				if (merged.linkedinLink) setLinkedinLink(merged.linkedinLink);
				if (merged.youtubeLink) setYoutubeLink(merged.youtubeLink);
				if (merged.tiktokLink) setTiktokLink(merged.tiktokLink);
				if (merged.bookingLink) setBookingLink(merged.bookingLink);
				if (merged.customLink) setCustomLink(merged.customLink);

				if (merged.logoImage && !merged.logoImage.url?.startsWith("blob:")) {
					setLogoImage(merged.logoImage);
				}
				if (Array.isArray(merged.uploadedImages)) {
					const cleanImages = merged.uploadedImages.filter(
						(img: any) => img?.url && !img.url.startsWith("blob:"),
					);
					setUploadedImages(cleanImages);
				}
			} catch (err) {
				console.error("[LOAD_CONTENT_ERROR]", err);
			} finally {
				setHasLoadedDraft(true);
			}
		}
		loadSavedContent();
	}, [projectId, draftKey]);

	// Auto-save form progress to localStorage cache on any input change
	useEffect(() => {
		if (!hasLoadedDraft) return;
		try {
			const draftPayload = {
				businessName,
				tagline,
				aboutText,
				contactEmail,
				contactPhone,
				contactAddress,
				// Landing Page
				services,
				testimonialsList,
				faqs,
				stats,
				ctaText,
				// Sales Funnel
				leadMagnetTitle,
				videoUrl,
				countdownMinutes,
				valueStackItems,
				regularPrice,
				discountPrice,
				orderBumpTitle,
				orderBumpPrice,
				orderBumpDescription,
				guaranteeText,
				// E-commerce
				products,
				currency,
				shippingInfo,
				themeMode,
				whatsappLink,
				xLink,
				instagramLink,
				facebookLink,
				linkedinLink,
				youtubeLink,
				tiktokLink,
				bookingLink,
				customLink,
				logoImage,
				uploadedImages,
				updatedAt: new Date().toISOString(),
			};
			localStorage.setItem(draftKey, JSON.stringify(draftPayload));
		} catch (e) {
			console.error("[LOCALSTORAGE_SAVE_ERROR]", e);
		}
	}, [
		hasLoadedDraft,
		draftKey,
		businessName,
		tagline,
		aboutText,
		contactEmail,
		contactPhone,
		contactAddress,
		services,
		testimonialsList,
		faqs,
		stats,
		ctaText,
		leadMagnetTitle,
		videoUrl,
		countdownMinutes,
		valueStackItems,
		regularPrice,
		discountPrice,
		orderBumpTitle,
		orderBumpPrice,
		orderBumpDescription,
		guaranteeText,
		products,
		currency,
		shippingInfo,
		themeMode,
		whatsappLink,
		xLink,
		instagramLink,
		facebookLink,
		linkedinLink,
		youtubeLink,
		tiktokLink,
		bookingLink,
		customLink,
		logoImage,
		uploadedImages,
	]);

	const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const objectUrl = URL.createObjectURL(file);
		const tempId = `logo-${Date.now()}`;
		const newLogo: UploadedImage = {
			id: tempId,
			name: file.name,
			size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
			url: objectUrl,
		};
		setLogoImage(newLogo);
		setUploadingCount((c) => c + 1);

		// Background upload to Cloudinary
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "kiosk/logos");

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (res.ok && data.file?.url) {
				setLogoImage((prev) => (prev?.id === tempId ? { ...prev, url: data.file.url } : prev));
			} else {
				setLogoImage(null);
				alert(data.error || "Failed to upload logo image. Please check file format and size.");
			}
		} catch (uploadErr) {
			console.error("[LOGO_CLOUDINARY_UPLOAD_ERROR]", uploadErr);
			setLogoImage(null);
			alert("Network error while uploading brand logo. Please try again.");
		} finally {
			setUploadingCount((c) => Math.max(0, c - 1));
			try {
				URL.revokeObjectURL(objectUrl);
			} catch (e) {}
		}
	};

	const handleRemoveLogo = () => {
		setLogoImage(null);
		if (logoFileInputRef.current) {
			logoFileInputRef.current.value = "";
		}
	};

	const handleBrandFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		Array.from(files).forEach(async (file) => {
			const objectUrl = URL.createObjectURL(file);
			const tempId = `brand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
			const newImage: UploadedImage = {
				id: tempId,
				name: file.name,
				size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
				url: objectUrl,
			};
			setUploadedImages((prev) => [...prev, newImage]);
			setUploadingCount((c) => c + 1);

			// Background upload to Cloudinary
			try {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("folder", "kiosk/brand_assets");

				const res = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				const data = await res.json();
				if (res.ok && data.file?.url) {
					setUploadedImages((prev) =>
						prev.map((img) => (img.id === tempId ? { ...img, url: data.file.url } : img)),
					);
				} else {
					setUploadedImages((prev) => prev.filter((img) => img.id !== tempId));
					alert(`Failed to upload ${file.name}: ${data.error || "Please try again"}`);
				}
			} catch (uploadErr) {
				console.error("[BRAND_FILE_CLOUDINARY_UPLOAD_ERROR]", uploadErr);
				setUploadedImages((prev) => prev.filter((img) => img.id !== tempId));
				alert(`Network error while uploading ${file.name}`);
			} finally {
				setUploadingCount((c) => Math.max(0, c - 1));
				try {
					URL.revokeObjectURL(objectUrl);
				} catch (e) {}
			}
		});
	};

	const handleRemoveBrandFile = (id: string) => {
		setUploadedImages((prev) => prev.filter((img) => img.id !== id));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!businessName.trim() || !tagline.trim()) {
			alert("Please fill in your Business Name and Tagline.");
			return;
		}

		if (uploadingCount > 0) {
			alert("Please wait for all image uploads to finish before submitting.");
			return;
		}

		try {
			setIsSubmitting(true);

			// Sanitize images to ensure zero broken blob: URLs reach the database
			const sanitizedLogo =
				logoImage && !logoImage.url.startsWith("blob:") ? logoImage : null;
			const sanitizedUploadedImages = uploadedImages.filter(
				(img) => img?.url && !img.url.startsWith("blob:"),
			);
			const sanitizedProducts = products.map((p) => ({
				...p,
				imageUrl: (p.imageUrl || "").startsWith("blob:") ? "" : p.imageUrl,
			}));

			const payload = {
				projectId,
				plan: activePlan,
				businessName,
				tagline,
				aboutText,
				contactEmail,
				contactPhone,
				contactAddress,
				// Landing Page
				services,
				testimonialsList,
				faqs,
				stats,
				ctaText,
				// Sales Funnel
				leadMagnetTitle,
				videoUrl,
				countdownMinutes,
				valueStackItems,
				regularPrice,
				discountPrice,
				orderBumpTitle,
				orderBumpPrice,
				orderBumpDescription,
				guaranteeText,
				// E-Commerce
				products: sanitizedProducts,
				currency,
				shippingInfo,
				themeMode,
				whatsappLink,
				xLink,
				instagramLink,
				facebookLink,
				linkedinLink,
				youtubeLink,
				tiktokLink,
				bookingLink,
				customLink,
				logoImage: sanitizedLogo,
				uploadedImages: sanitizedUploadedImages,
			};

			const res = await fetch("/api/projects/content", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (!res.ok) {
				alert(data.error || "Failed to submit custom content.");
				return;
			}

			// Clear local draft from localStorage after successful submission
			try {
				localStorage.removeItem(draftKey);
			} catch (e) {
				console.error("[LOCALSTORAGE_CLEAR_ERROR]", e);
			}

			setIsSubmitted(true);
			setTimeout(() => {
				router.push("/dashboard");
			}, 1500);
		} catch (err) {
			console.error("[SUBMIT_CONTENT_ERROR]", err);
			alert("An error occurred while saving your details.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full min-h-screen bg-[#f8fafc]">
			{/* Main Container */}
			<div className="px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-[950px] mx-auto">
				{/* Top Navigation Row */}
				<div className="flex items-center justify-between mb-6">
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors group">
						<ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
						<span>Back to Dashboard</span>
					</Link>

					<div className="flex items-center gap-3">
						<Link
							href="/templates"
							target="_blank"
							className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-200 transition-colors">
							<Globe className="w-3.5 h-3.5" />
							<span>Browse Templates</span>
						</Link>
					</div>
				</div>

				{/* Payment Status Banners */}
				{isPaymentSuccess && (
					<div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-300">
						<div className="flex items-center gap-2.5">
							<CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
							<span>
								Payment Confirmed! Welcome to your Kiosk workspace. Fill in your business details below to generate your site.
							</span>
						</div>
					</div>
				)}

				{isCancelled && (
					<div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-300">
						<div className="flex items-center gap-2.5">
							<AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
							<span>
								Payment was cancelled or was not completed. You can retry your invoice payment or choose another payment method anytime.
							</span>
						</div>
						<Link
							href="/dashboard/billing"
							className="shrink-0 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-2xs transition-colors">
							View Invoices →
						</Link>
					</div>
				)}

				{/* Header Title & Plan Selector */}
				<div className="pb-6 border-b border-gray-200/80 mb-6 space-y-4">
					<div className="flex items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold font-nohemi text-gray-900 tracking-tight mb-1">
								Submit Your Business Details & Content
							</h1>
							<p className="text-gray-500 text-sm font-medium">
								Step 2 of 2 • Tailored intake form for your{" "}
								<span className="font-bold text-blue-600">
									{activePlan === "LANDING_PAGE"
										? `Landing Page (${isCurrencyLoading ? "…" : formatPlanPrice("landing", "monthly")}/mo)`
										: activePlan === "SALES_FUNNEL"
										? `Sales Funnel (${isCurrencyLoading ? "…" : formatPlanPrice("funnel", "monthly")}/mo)`
										: `E-commerce Store (${isCurrencyLoading ? "…" : formatPlanPrice("store", "monthly")}/mo)`}
								</span>
							</p>
						</div>
					</div>

					{/* Done-For-You Model Guarantee Banner */}
					<div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-3 text-xs">
						<div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
							<Sparkles className="w-4 h-4" />
						</div>
						<div>
							<h4 className="font-bold text-gray-900">Done-For-You Website Personalization</h4>
							<p className="text-gray-600 text-[11px] font-medium mt-0.5">
								No builder or design skill needed. Fill in your business details below — our team personalizes your template and launches your live site in 3-5 days.
							</p>
						</div>
					</div>

					{/* Interactive Plan Selector Switcher */}
					<div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/80">
						{[
							{ id: "LANDING_PAGE", label: "Landing Page", icon: Globe },
							{ id: "SALES_FUNNEL", label: "Sales Funnel", icon: Zap },
							{ id: "E_COMMERCE", label: "E-Commerce Store", icon: ShoppingBag },
						].map((tab) => {
							const Icon = tab.icon;
							const isActive = activePlan === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActivePlan(tab.id as PlanType)}
									className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
										isActive
											? "bg-white text-blue-600 shadow-xs border border-gray-200/80"
											: "text-gray-500 hover:text-gray-900"
									}`}>
									<Icon className="w-3.5 h-3.5" />
									<span className="hidden sm:inline">{tab.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Success State */}
				{isSubmitted ? (
					<div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xl shadow-emerald-500/10 animate-in fade-in zoom-in-95 duration-300">
						<CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
						<h2 className="text-2xl font-bold font-nohemi text-gray-900 mb-2">
							Details Received!
						</h2>
						<p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
							Our design team has received your business details and {uploadedImages.length} brand images. Personalizing your custom website...
						</p>
						<div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
							<div className="bg-emerald-600 h-full w-full animate-pulse" />
						</div>
					</div>
				) : (
					/* Submission Form */
					<form
						onSubmit={handleSubmit}
						className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xs">
						
						{/* SECTION 1: LOGO & BRAND ASSETS (SEPARATED) */}
						<div className="space-y-5">
							<div className="border-b border-gray-100 pb-3">
								<label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
									<ImageIcon className="w-4 h-4 text-blue-600" />
									<span>1. Brand Identity & Media Assets</span>
								</label>
							</div>

							{/* 1A: PRIMARY BRAND LOGO */}
							<div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/90 space-y-3">
								<div className="flex items-center justify-between">
									<div>
										<label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
											<span>Primary Brand Logo</span>
											<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
												Header & Footer
											</span>
										</label>
										<p className="text-[11px] text-gray-500 font-medium">
											Upload your business logo for the website header and footer. Transparent PNG or SVG recommended.
										</p>
									</div>
									<span className="text-[10px] text-gray-400 font-medium hidden sm:inline">PNG, SVG, JPG, WebP</span>
								</div>

								<input
									ref={logoFileInputRef}
									type="file"
									accept="image/*"
									onChange={handleLogoSelect}
									className="hidden"
								/>

								{logoImage ? (
									<div className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-4 shadow-2xs">
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-14 h-14 rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] bg-[length:12px_12px] flex items-center justify-center p-1 shrink-0 overflow-hidden">
												<img
													src={logoImage.url}
													alt={logoImage.name}
													className="max-h-full max-w-full object-contain"
												/>
											</div>
											<div className="min-w-0">
												<p className="text-xs font-bold text-gray-900 truncate">
													{logoImage.name}
												</p>
												<p className="text-[10px] text-gray-400 font-medium">
													{logoImage.size} • Logo Active
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2 shrink-0">
											<button
												type="button"
												onClick={() => logoFileInputRef.current?.click()}
												className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
												Change Logo
											</button>
											<button
												type="button"
												onClick={handleRemoveLogo}
												className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								) : (
									<div
										onClick={() => logoFileInputRef.current?.click()}
										className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-6 text-center transition-all cursor-pointer bg-white hover:bg-blue-50/40 group">
										<div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-2 text-blue-600 group-hover:scale-105 transition-transform">
											<Upload className="w-5 h-5" />
										</div>
										<p className="text-xs font-bold text-gray-900 mb-0.5">
											Upload Brand Logo
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Click to browse or drag and drop your logo file
										</p>
									</div>
								)}
							</div>

							{/* 1B: OTHER BRAND PHOTOS & MARKETING ASSETS */}
							<div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/90 space-y-3">
								<div className="flex items-center justify-between">
									<div>
										<label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
											<span>Brand Photos & Marketing Assets</span>
											<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
												{uploadedImages.length} Uploaded
											</span>
										</label>
										<p className="text-[11px] text-gray-500 font-medium">
											Upload hero background pictures, team/facility shots, product photos, or promotional materials.
										</p>
									</div>
									<span className="text-[10px] text-gray-400 font-medium hidden sm:inline">Multiple Files Allowed</span>
								</div>

								<input
									ref={brandFilesInputRef}
									type="file"
									multiple
									accept="image/*,.pdf"
									onChange={handleBrandFilesSelect}
									className="hidden"
								/>

								<div
									onClick={() => brandFilesInputRef.current?.click()}
									className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-6 text-center transition-all cursor-pointer bg-white hover:bg-blue-50/30 group">
									<div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-2 text-gray-600 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
										<Upload className="w-5 h-5" />
									</div>
									<p className="text-xs font-bold text-gray-900 mb-0.5">
										Click to Upload Brand Photos & Files
									</p>
									<p className="text-[10px] text-gray-500 font-medium">
										PNG, JPG, SVG, WebP, or PDF up to 25MB each
									</p>
								</div>

								{uploadedImages.length > 0 && (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
										{uploadedImages.map((img) => (
											<div
												key={img.id}
												className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-3 group relative shadow-2xs">
												<img
													src={img.url}
													alt={img.name}
													className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-bold text-gray-900 truncate">
														{img.name}
													</p>
													<p className="text-[10px] text-gray-400 font-medium">
														{img.size}
													</p>
												</div>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveBrandFile(img.id);
													}}
													className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0">
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* SECTION 2: CORE BUSINESS INFORMATION */}
						<div className="space-y-6 pt-4 border-t border-gray-100">
							<div className="border-b border-gray-100 pb-3">
								<label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
									<Globe className="w-4 h-4 text-blue-600" />
									<span>2. Business Information & Theme Style</span>
								</label>
							</div>

							{/* Website Color Theme Mode (Light vs Dark Checkbox Selector) */}
							<div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div>
									<label className="text-xs font-bold text-gray-900 block">
										Website Theme Mode
									</label>
									<p className="text-[11px] text-gray-500 font-medium">
										Select your preferred aesthetic for the website design.
									</p>
								</div>

								<div className="flex items-center gap-6">
									<label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer select-none">
										<input
											type="checkbox"
											checked={themeMode === "light"}
											onChange={() => setThemeMode("light")}
											className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
										/>
										<Sun className="w-3.5 h-3.5 text-amber-600" />
										<span>Light Theme</span>
									</label>

									<label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer select-none">
										<input
											type="checkbox"
											checked={themeMode === "dark"}
											onChange={() => setThemeMode("dark")}
											className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
										/>
										<Moon className="w-3.5 h-3.5 text-purple-600" />
										<span>Dark Theme</span>
									</label>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-gray-700 mb-1.5">
									Business / Brand Name *
								</label>
								<input
									type="text"
									required
									placeholder="e.g. Acme Business Solutions"
									value={businessName}
									onChange={(e) => setBusinessName(e.target.value)}
									className="w-full px-4 py-3 rounded-2xl border border-gray-200/90 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-gray-700 mb-1.5">
									Main Headline / Hero Tagline *
								</label>
								<input
									type="text"
									required
									placeholder="e.g. Premium Artisanal Goods Delivered To Your Doorstep"
									value={tagline}
									onChange={(e) => setTagline(e.target.value)}
									className="w-full px-4 py-3 rounded-2xl border border-gray-200/90 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-gray-700 mb-1.5">
									About Business & Core Value Proposition
								</label>
								<textarea
									rows={3}
									placeholder="Describe your story, mission, and why customers choose your business..."
									value={aboutText}
									onChange={(e) => setAboutText(e.target.value)}
									className="w-full px-4 py-3 rounded-2xl border border-gray-200/90 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 transition-colors leading-relaxed"
								/>
							</div>
						</div>

						{/* SECTION 3: PLAN-SPECIFIC DYNAMIC FIELDS */}
						{activePlan === "LANDING_PAGE" && (
							<div className="space-y-6 pt-4 border-t border-gray-100">
								<div className="border-b border-gray-100 pb-3">
									<label className="text-xs font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-2">
										<Globe className="w-4 h-4 text-blue-600" />
										<span>3. Landing Page Structure, Services & Social Proof</span>
									</label>
								</div>

								{/* Primary CTA & Conversion Action */}
								<div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
									<label className="block text-xs font-bold text-gray-900">
										Main Call-To-Action (CTA) Button Text
									</label>
									<input
										type="text"
										placeholder="e.g. Claim Free Consultation / Book Discovery Call"
										value={ctaText}
										onChange={(e) => setCtaText(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blue-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
									/>
								</div>

								{/* Trust & Authority Metrics */}
								<div className="space-y-3">
									<label className="block text-xs font-bold text-gray-900">
										Key Statistics & Social Proof Metrics
									</label>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										{stats.map((st, i) => (
											<div key={st.id || i} className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
												<div>
													<label className="block text-[10px] font-bold text-gray-500 uppercase">
														Metric #{i + 1} Value
													</label>
													<input
														type="text"
														placeholder="99.4% / 3,500+"
														value={st.value}
														onChange={(e) => handleUpdateStat(st.id, "value", e.target.value)}
														className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-600"
													/>
												</div>
												<div>
													<label className="block text-[10px] font-bold text-gray-500 uppercase">
														Label / Description
													</label>
													<input
														type="text"
														placeholder="Client Satisfaction"
														value={st.label}
														onChange={(e) => handleUpdateStat(st.id, "label", e.target.value)}
														className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Core Services / Features Builder */}
								<div className="space-y-3 pt-2">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xs font-bold text-gray-900">
												Core Services & Key Offerings ({services.length})
											</h4>
											<p className="text-[11px] text-gray-500 font-medium">
												Add each service or signature solution provided by your business.
											</p>
										</div>

										<button
											type="button"
											onClick={handleAddService}
											className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
											<Plus className="w-3.5 h-3.5" />
											<span>Add Service</span>
										</button>
									</div>

									<div className="space-y-3">
										{services.map((srv, idx) => (
											<div
												key={srv.id}
												className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/90 space-y-3 relative group">
												<div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
													<span className="text-xs font-bold text-gray-700 flex items-center gap-2">
														<span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold flex items-center justify-center">
															{idx + 1}
														</span>
														<span>Service #{idx + 1} {srv.title ? `— ${srv.title}` : ""}</span>
													</span>

													<button
														type="button"
														onClick={() => handleDeleteService(srv.id)}
														title="Delete Service"
														className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>

												<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
													<div className="sm:col-span-2">
														<label className="block text-[11px] font-bold text-gray-700 mb-1">
															Service Title *
														</label>
														<input
															type="text"
															placeholder="e.g. Strategic Brand Consulting"
															value={srv.title}
															onChange={(e) => handleUpdateService(srv.id, "title", e.target.value)}
															className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
														/>
													</div>

													<div>
														<label className="block text-[11px] font-bold text-gray-700 mb-1">
															Price / Starting At
														</label>
														<input
															type="text"
															placeholder="e.g. From $499 / Custom"
															value={srv.price || ""}
															onChange={(e) => handleUpdateService(srv.id, "price", e.target.value)}
															className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
														/>
													</div>
												</div>

												<div>
													<label className="block text-[11px] font-bold text-gray-700 mb-1">
														Service Description & Deliverables
													</label>
													<textarea
														rows={2}
														placeholder="Describe what is included, who it is for, and key outcomes..."
														value={srv.description}
														onChange={(e) => handleUpdateService(srv.id, "description", e.target.value)}
														className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 leading-relaxed"
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Client Testimonials Builder */}
								<div className="space-y-3 pt-2">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xs font-bold text-gray-900">
												Client Testimonials & Reviews ({testimonialsList.length})
											</h4>
											<p className="text-[11px] text-gray-500 font-medium">
												Showcase verified social proof and client quotes.
											</p>
										</div>

										<button
											type="button"
											onClick={handleAddTestimonial}
											className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
											<Plus className="w-3.5 h-3.5" />
											<span>Add Review</span>
										</button>
									</div>

									<div className="space-y-3">
										{testimonialsList.map((t) => (
											<div key={t.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/90 space-y-3">
												<div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
													<div className="flex items-center gap-1 text-amber-500">
														{[...Array(t.rating || 5)].map((_, i) => (
															<Star key={i} className="w-3.5 h-3.5 fill-current" />
														))}
													</div>

													<button
														type="button"
														onClick={() => handleDeleteTestimonial(t.id)}
														title="Delete Testimonial"
														className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>

												<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
													<div>
														<label className="block text-[11px] font-bold text-gray-700 mb-1">
															Client Full Name *
														</label>
														<input
															type="text"
															placeholder="e.g. David Kendrick"
															value={t.name}
															onChange={(e) => handleUpdateTestimonial(t.id, "name", e.target.value)}
															className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
														/>
													</div>

													<div>
														<label className="block text-[11px] font-bold text-gray-700 mb-1">
															Role / Company (Optional)
														</label>
														<input
															type="text"
															placeholder="e.g. CEO, Apex Growth"
															value={t.role || ""}
															onChange={(e) => handleUpdateTestimonial(t.id, "role", e.target.value)}
															className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
														/>
													</div>
												</div>

												<div>
													<label className="block text-[11px] font-bold text-gray-700 mb-1">
														Review / Testimonial Quote *
													</label>
													<textarea
														rows={2}
														placeholder='"This service completely transformed our business operations in 30 days!"'
														value={t.review}
														onChange={(e) => handleUpdateTestimonial(t.id, "review", e.target.value)}
														className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 leading-relaxed"
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Frequently Asked Questions Builder */}
								<div className="space-y-3 pt-2">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xs font-bold text-gray-900">
												Frequently Asked Questions (FAQs) ({faqs.length})
											</h4>
											<p className="text-[11px] text-gray-500 font-medium">
												Answer client concerns and overcome objections upfront.
											</p>
										</div>

										<button
											type="button"
											onClick={handleAddFaq}
											className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
											<Plus className="w-3.5 h-3.5" />
											<span>Add FAQ</span>
										</button>
									</div>

									<div className="space-y-3">
										{faqs.map((faq, idx) => (
											<div key={faq.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/90 space-y-3">
												<div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
													<span className="text-xs font-bold text-gray-700">
														Q{idx + 1}: {faq.question || "New Question"}
													</span>

													<button
														type="button"
														onClick={() => handleDeleteFaq(faq.id)}
														title="Delete FAQ"
														className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>

												<div>
													<label className="block text-[11px] font-bold text-gray-700 mb-1">
														Question *
													</label>
													<input
														type="text"
														placeholder="e.g. How quickly can we get started?"
														value={faq.question}
														onChange={(e) => handleUpdateFaq(faq.id, "question", e.target.value)}
														className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
													/>
												</div>

												<div>
													<label className="block text-[11px] font-bold text-gray-700 mb-1">
														Answer *
													</label>
													<textarea
														rows={2}
														placeholder="Explain clearly and provide the exact solution..."
														value={faq.answer}
														onChange={(e) => handleUpdateFaq(faq.id, "answer", e.target.value)}
														className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 leading-relaxed"
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{activePlan === "SALES_FUNNEL" && (
							<div className="space-y-6 pt-4 border-t border-gray-100">
								<div className="border-b border-gray-100 pb-3">
									<label className="text-xs font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-2">
										<Zap className="w-4 h-4 text-purple-600" />
										<span>3. High-Converting Sales Funnel & Value Stack</span>
									</label>
								</div>

								{/* Video Pitch & Lead Magnet Hook */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											Lead Magnet / Hook Title *
										</label>
										<input
											type="text"
											placeholder="e.g. The 7-Figure Client Acquisition Protocol"
											value={leadMagnetTitle}
											onChange={(e) => setLeadMagnetTitle(e.target.value)}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
										/>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											VSL Video Link (YouTube, Vimeo, Loom)
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
												<Video className="w-4 h-4" />
											</span>
											<input
												type="text"
												placeholder="https://www.youtube.com/watch?v=..."
												value={videoUrl}
												onChange={(e) => setVideoUrl(e.target.value)}
												className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
											/>
										</div>
									</div>
								</div>

								{/* Pricing & Countdown Urgency */}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											Regular Retail Value ($)
										</label>
										<input
											type="number"
											placeholder="497"
											value={regularPrice || ""}
											onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)}
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-purple-600"
										/>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											Special Funnel Offer Price ($) *
										</label>
										<input
											type="number"
											placeholder="97"
											value={discountPrice || ""}
											onChange={(e) => setDiscountPrice(parseFloat(e.target.value) || 0)}
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-purple-700 focus:outline-none focus:border-purple-600"
										/>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											Countdown Timer (Minutes)
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
												<Clock className="w-4 h-4" />
											</span>
											<input
												type="number"
												min="1"
												max="120"
												placeholder="15"
												value={countdownMinutes || 15}
												onChange={(e) => setCountdownMinutes(parseInt(e.target.value) || 15)}
												className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
											/>
										</div>
									</div>
								</div>

								{/* Offer Value Stack Builder */}
								<div className="space-y-3 pt-2">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xs font-bold text-gray-900">
												Deliverables & Value Stack Breakdown ({valueStackItems.length})
											</h4>
											<p className="text-[11px] text-gray-500 font-medium">
												Itemize everything included to maximize perceived value.
											</p>
										</div>

										<button
											type="button"
											onClick={handleAddValueStackItem}
											className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
											<Plus className="w-3.5 h-3.5" />
											<span>Add Deliverable</span>
										</button>
									</div>

									<div className="space-y-3">
										{valueStackItems.map((item, idx) => (
											<div key={item.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/90 space-y-3">
												<div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
													<div className="flex items-center gap-2">
														<span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center justify-center">
															{idx + 1}
														</span>
														<span className="text-xs font-bold text-gray-900">
															{item.title || `Deliverable #${idx + 1}`}
														</span>
														{item.isBonus && (
															<span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">
																Bonus
															</span>
														)}
													</div>

													<button
														type="button"
														onClick={() => handleDeleteValueStackItem(item.id)}
														title="Delete Item"
														className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>

												<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
													<div className="sm:col-span-2">
														<label className="block text-[11px] font-bold text-gray-700 mb-1">
															Item / Module Title *
														</label>
														<input
															type="text"
															placeholder="e.g. Masterclass Video Training Course"
															value={item.title}
															onChange={(e) => handleUpdateValueStackItem(item.id, "title", e.target.value)}
															className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
														/>
													</div>

													<div>
														<label className="block text-[11px] font-bold text-gray-700 mb-1">
															Stated Value
														</label>
														<input
															type="text"
															placeholder="e.g. $297 Value"
															value={item.value}
															onChange={(e) => handleUpdateValueStackItem(item.id, "value", e.target.value)}
															className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
														/>
													</div>
												</div>

												<div>
													<label className="block text-[11px] font-bold text-gray-700 mb-1">
														Description Bullet / Key Outcome
													</label>
													<input
														type="text"
														placeholder="e.g. 10 hours of video lessons with copy templates"
														value={item.description || ""}
														onChange={(e) => handleUpdateValueStackItem(item.id, "description", e.target.value)}
														className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Order Bump Settings */}
								<div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
									<div className="flex items-center gap-2">
										<Flame className="w-4 h-4 text-purple-600" />
										<h4 className="text-xs font-bold text-purple-900">
											High-Converting Order Bump (Optional Upsell)
										</h4>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<div className="sm:col-span-2">
											<label className="block text-[11px] font-bold text-gray-700 mb-1">
												Order Bump Headline
											</label>
											<input
												type="text"
												placeholder="e.g. Add VIP Inner Circle & Lifetime Coaching"
												value={orderBumpTitle}
												onChange={(e) => setOrderBumpTitle(e.target.value)}
												className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600"
											/>
										</div>

										<div>
											<label className="block text-[11px] font-bold text-gray-700 mb-1">
												Bump Price ($)
											</label>
											<input
												type="number"
												placeholder="27"
												value={orderBumpPrice || ""}
												onChange={(e) => setOrderBumpPrice(parseFloat(e.target.value) || 0)}
												className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-purple-600"
											/>
										</div>
									</div>

									<div>
										<label className="block text-[11px] font-bold text-gray-700 mb-1">
											Order Bump Teaser Description
										</label>
										<textarea
											rows={2}
											placeholder="Get weekly direct coaching, live Q&A access, and exclusive bonus breakdown vaults."
											value={orderBumpDescription}
											onChange={(e) => setOrderBumpDescription(e.target.value)}
											className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600 leading-relaxed"
										/>
									</div>
								</div>

								{/* Guarantee & Risk Reversal */}
								<div>
									<label className="block text-xs font-bold text-gray-700 mb-1.5">
										Guarantee & Risk Reversal Terms
									</label>
									<textarea
										rows={2}
										placeholder="30-Day 100% Risk-Free Guarantee..."
										value={guaranteeText}
										onChange={(e) => setGuaranteeText(e.target.value)}
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600 leading-relaxed"
									/>
								</div>
							</div>
						)}

						{activePlan === "E_COMMERCE" && (
							<div className="space-y-6 pt-4 border-t border-gray-100">
								<div className="border-b border-gray-100 pb-3">
									<label className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
										<ShoppingBag className="w-4 h-4 text-emerald-600" />
										<span>3. E-Commerce Product Catalog & Payment Settings</span>
									</label>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											Store Currency
										</label>
										<select
											value={currency}
											onChange={(e) => setCurrency(e.target.value)}
											className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600 bg-white">
											<option value="USD">USD ($ - US Dollar)</option>
											<option value="NGN">NGN (₦ - Nigerian Naira)</option>
											<option value="GHS">GHS (GH₵ - Ghanaian Cedi)</option>
											<option value="KES">KES (KSh - Kenyan Shilling)</option>
											<option value="EUR">EUR (€ - Euro)</option>
											<option value="GBP">GBP (£ - British Pound)</option>
										</select>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-700 mb-1.5">
											Shipping & Delivery Policy Note
										</label>
										<input
											type="text"
											placeholder="e.g. Nationwide Shipping • Same-Day Dispatch"
											value={shippingInfo}
											onChange={(e) => setShippingInfo(e.target.value)}
											className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600"
										/>
									</div>
								</div>

								{/* Product Items Manager */}
								<div className="space-y-4 pt-2">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xs font-bold text-gray-900">
												Store Products & Pricing Catalog ({products.length})
											</h4>
											<p className="text-[11px] text-gray-500 font-medium">
												Add items with their price, category, promo badge, and photo to sell on your storefront.
											</p>
										</div>

										<button
											type="button"
											onClick={handleAddProduct}
											className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
											<Plus className="w-3.5 h-3.5" />
											<span>Add Item</span>
										</button>
									</div>

									<div className="space-y-4">
										{products.map((prod, index) => (
											<div
												key={prod.id}
												className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200/90 space-y-4 relative group">
												<div className="flex items-center justify-between pb-3 border-b border-gray-200/70">
													<span className="text-xs font-bold text-gray-700 flex items-center gap-2">
														<span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center justify-center">
															{index + 1}
														</span>
														<span>Product #{index + 1} {prod.name ? `— ${prod.name}` : ""}</span>
													</span>

													<button
														type="button"
														onClick={() => handleDeleteProduct(prod.id)}
														title="Delete Item"
														className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>

												<div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
													{/* Product Image Box */}
													<div className="sm:col-span-3">
														<label className="block text-[11px] font-bold text-gray-700 mb-1.5">
															Item Image
														</label>
														<div className="relative w-full h-28 rounded-xl bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500 transition-colors">
															{prod.imageUrl ? (
																<>
																	<img
																		src={prod.imageUrl}
																		alt={prod.name || "Product"}
																		className="w-full h-full object-cover"
																	/>
																	<button
																		type="button"
																		onClick={() => handleUpdateProduct(prod.id, "imageUrl", "")}
																		className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition-colors">
																		<Trash2 className="w-3 h-3" />
																	</button>
																</>
															) : (
																<label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center">
																	<ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
																	<span className="text-[10px] font-bold text-gray-600">Upload Photo</span>
																	<input
																		type="file"
																		accept="image/*"
																		onChange={(e) => handleProductImageUpload(prod.id, e)}
																		className="hidden"
																	/>
																</label>
															)}
														</div>
													</div>

													{/* Product Fields */}
													<div className="sm:col-span-9 space-y-3">
														<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
															<div className="sm:col-span-2">
																<label className="block text-[11px] font-bold text-gray-700 mb-1">
																	Product Name *
																</label>
																<input
																	type="text"
																	placeholder="e.g. Leather Handbag"
																	value={prod.name}
																	onChange={(e) => handleUpdateProduct(prod.id, "name", e.target.value)}
																	className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600"
																/>
															</div>

															<div>
																<label className="block text-[11px] font-bold text-gray-700 mb-1">
																	Price ({CURRENCY_SYMBOLS[currency] || "$"}) *
																</label>
																<div className="relative">
																	<span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
																		{CURRENCY_SYMBOLS[currency] || "$"}
																	</span>
																	<input
																		type="number"
																		step="0.01"
																		min="0"
																		placeholder="29.99"
																		value={prod.price || ""}
																		onChange={(e) => handleUpdateProduct(prod.id, "price", parseFloat(e.target.value) || 0)}
																		className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
																	/>
																</div>
															</div>
														</div>

														<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
															<div>
																<label className="block text-[11px] font-bold text-gray-700 mb-1">
																	Category / Collection
																</label>
																<input
																	type="text"
																	placeholder="e.g. Apparel, Shoes, Accessories"
																	value={prod.category || ""}
																	onChange={(e) => handleUpdateProduct(prod.id, "category", e.target.value)}
																	className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600"
																/>
															</div>

															<div>
																<label className="block text-[11px] font-bold text-gray-700 mb-1">
																	Promo Badge (Optional)
																</label>
																<input
																	type="text"
																	placeholder="e.g. Best Seller, New, 20% OFF"
																	value={prod.badge || ""}
																	onChange={(e) => handleUpdateProduct(prod.id, "badge", e.target.value)}
																	className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600"
																/>
															</div>
														</div>

														<div>
															<label className="block text-[11px] font-bold text-gray-700 mb-1">
																Item Description & Key Highlights
															</label>
															<textarea
																rows={2}
																placeholder="Describe key features, sizing, colors, or materials..."
																value={prod.description || ""}
																onChange={(e) => handleUpdateProduct(prod.id, "description", e.target.value)}
																className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-600 leading-relaxed"
															/>
														</div>
													</div>
												</div>
											</div>
										))}

										{products.length === 0 && (
											<div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
												<Package className="w-8 h-8 text-gray-400 mx-auto" />
												<p className="text-xs font-bold text-gray-700">No items added to catalog yet</p>
												<button
													type="button"
													onClick={handleAddProduct}
													className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
													+ Add First Product
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* SECTION 4: CONTACT INFO */}
						<div className="space-y-4 pt-4 border-t border-gray-100">
							<div className="border-b border-gray-100 pb-3">
								<label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
									<Phone className="w-4 h-4 text-blue-600" />
									<span>4. Contact & Business Location</span>
								</label>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1">
										Business Email *
									</label>
									<input
										type="email"
										required
										placeholder="contact@mybusiness.com"
										value={contactEmail}
										onChange={(e) => setContactEmail(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
									/>
								</div>

								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1">
										Primary Phone Number *
									</label>
									<input
										type="text"
										required
										placeholder="+1 (555) 019-2834"
										value={contactPhone}
										onChange={(e) => setContactPhone(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
									/>
								</div>

								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1">
										Address / Physical Location
									</label>
									<input
										type="text"
										placeholder="Downtown Business Center"
										value={contactAddress}
										onChange={(e) => setContactAddress(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
									/>
								</div>
							</div>
						</div>

						{/* SECTION 5: SOCIAL MEDIA, WHATSAPP & ESSENTIAL ACTION LINKS */}
						<div className="space-y-4 pt-4 border-t border-gray-100">
							<div className="border-b border-gray-100 pb-3 flex items-center justify-between">
								<div>
									<label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
										<Share2 className="w-4 h-4 text-blue-600" />
										<span>5. Social Media, WhatsApp & Essential Links</span>
									</label>
									<p className="text-[11px] text-gray-500 font-medium mt-0.5">
										Add your direct messaging links and social handles to connect visitors across your channels.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
								{/* WhatsApp */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-emerald-600 fill-current" viewBox="0 0 24 24">
												<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.636-.677-2.73-2.316-2.812-2.425-.082-.109-.665-.883-.665-1.684 0-.8.419-1.196.568-1.356.149-.16.326-.201.435-.201.109 0 .217.001.312.006.1.005.234-.038.366.28.138.334.472 1.15.513 1.234.041.084.069.183.014.293-.055.109-.082.178-.163.272-.082.095-.172.212-.246.285-.082.08-.168.167-.072.332.096.165.426.703.914 1.138.629.561 1.159.734 1.324.816.165.082.261.071.358-.041.096-.112.414-.482.525-.647.111-.165.221-.138.371-.082.15.055.952.449 1.115.531.163.082.272.123.312.191.041.069.041.399-.103.804z" />
											</svg>
										</div>
										<span>WhatsApp Chat / Direct Link</span>
									</label>
									<input
										type="text"
										placeholder="https://wa.me/15550192834 or Phone"
										value={whatsappLink}
										onChange={(e) => setWhatsappLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-500 placeholder:text-gray-400"
									/>
								</div>

								{/* X (formerly Twitter) */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-black fill-current" viewBox="0 0 24 24">
												<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
											</svg>
										</div>
										<span>X (Twitter) Profile</span>
									</label>
									<input
										type="text"
										placeholder="https://x.com/yourhandle"
										value={xLink}
										onChange={(e) => setXLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-900 placeholder:text-gray-400"
									/>
								</div>

								{/* Instagram */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-pink-600 fill-current" viewBox="0 0 24 24">
												<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
											</svg>
										</div>
										<span>Instagram Profile</span>
									</label>
									<input
										type="text"
										placeholder="https://instagram.com/yourhandle"
										value={instagramLink}
										onChange={(e) => setInstagramLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-pink-500 placeholder:text-gray-400"
									/>
								</div>

								{/* Facebook */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-blue-600 fill-current" viewBox="0 0 24 24">
												<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
											</svg>
										</div>
										<span>Facebook Page</span>
									</label>
									<input
										type="text"
										placeholder="https://facebook.com/yourpage"
										value={facebookLink}
										onChange={(e) => setFacebookLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 placeholder:text-gray-400"
									/>
								</div>

								{/* LinkedIn */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-sky-700 fill-current" viewBox="0 0 24 24">
												<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
											</svg>
										</div>
										<span>LinkedIn Company / Profile</span>
									</label>
									<input
										type="text"
										placeholder="https://linkedin.com/company/yourbrand"
										value={linkedinLink}
										onChange={(e) => setLinkedinLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-sky-600 placeholder:text-gray-400"
									/>
								</div>

								{/* YouTube */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-red-600 fill-current" viewBox="0 0 24 24">
												<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
											</svg>
										</div>
										<span>YouTube Channel / VSL Video</span>
									</label>
									<input
										type="text"
										placeholder="https://youtube.com/@yourchannel"
										value={youtubeLink}
										onChange={(e) => setYoutubeLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-red-600 placeholder:text-gray-400"
									/>
								</div>

								{/* TikTok */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
											<svg className="w-2.5 h-2.5 text-black fill-current" viewBox="0 0 24 24">
												<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
											</svg>
										</div>
										<span>TikTok Profile</span>
									</label>
									<input
										type="text"
										placeholder="https://tiktok.com/@yourhandle"
										value={tiktokLink}
										onChange={(e) => setTiktokLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-slate-800 placeholder:text-gray-400"
									/>
								</div>

								{/* Calendly / Booking */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
											<Calendar className="w-2.5 h-2.5 text-blue-600" />
										</div>
										<span>Calendly / Meeting Link</span>
									</label>
									<input
										type="text"
										placeholder="https://calendly.com/yourlink"
										value={bookingLink}
										onChange={(e) => setBookingLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 placeholder:text-gray-400"
									/>
								</div>

								{/* Google Maps / Custom Site */}
								<div>
									<label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
										<div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
											<Globe className="w-2.5 h-2.5 text-purple-600" />
										</div>
										<span>Google Maps / Custom Link</span>
									</label>
									<input
										type="text"
										placeholder="https://maps.google.com/... or site"
										value={customLink}
										onChange={(e) => setCustomLink(e.target.value)}
										className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-600 placeholder:text-gray-400"
									/>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
							<p className="text-gray-500 text-xs font-medium text-center sm:text-left">
								✨ Our engineers will QA-review, customize, and publish your site in 3-5 days.
							</p>

							<PillButton
								type="submit"
								disabled={isSubmitting || uploadingCount > 0}
								baseColor="#004ac6"
								circleColor="#ffffff"
								textColor="#ffffff"
								hoverTextColor="#004ac6"
								useThunderFont={true}
								className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-xs border border-blue-600 shadow-md">
								{isSubmitting ? (
									<span className="inline-flex items-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Submitting to Fulfillment Team...</span>
									</span>
								) : uploadingCount > 0 ? (
									<span className="inline-flex items-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Uploading Media ({uploadingCount})...</span>
									</span>
								) : (
									<span className="inline-flex items-center gap-2">
										<Sparkles className="w-4 h-4" />
										<span>Submit For QA & Launch →</span>
									</span>
								)}
							</PillButton>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}

export default function ContentSubmissionPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc]">
					<Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
				</div>
			}>
			<ContentForm />
		</Suspense>
	);
}
