/** @format */

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import CookieConsent from "@/components/CookieConsent";
import PageLoader from "@/components/PageLoader";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";
import { resolveTenantBranding } from "@/lib/tenantBranding";
import PWARegistration from "@/components/PWARegistration";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	variable: "--font-montserrat",
	display: "swap",
});

const thunderLC = localFont({
	src: [
		{
			path: "../../public/fonts/Thunder/Thunder-LightLC.woff2",
			weight: "300",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-MediumLC.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-SemiBoldLC.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-BoldLC.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-ExtraBoldLC.woff2",
			weight: "800",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-BlackLC.woff2",
			weight: "900",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-BlackLCItalic.woff2",
			weight: "900",
			style: "italic",
		},
	],
	variable: "--font-thunder-lc",
	display: "swap",
});

const thunderHC = localFont({
	src: [
		{
			path: "../../public/fonts/Thunder/Thunder-BlackHC.woff2",
			weight: "900",
			style: "normal",
		},
		{
			path: "../../public/fonts/Thunder/Thunder-BlackHCItalic.woff2",
			weight: "900",
			style: "italic",
		},
	],
	variable: "--font-thunder-hc",
	display: "swap",
});

const nohemi = localFont({
	src: [
		{
			path: "../../public/fonts/Nohemi/Nohemi-Thin.woff2",
			weight: "100",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-ExtraLight.woff2",
			weight: "200",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-Light.woff2",
			weight: "300",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-SemiBold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-Bold.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-ExtraBold.woff2",
			weight: "800",
			style: "normal",
		},
		{
			path: "../../public/fonts/Nohemi/Nohemi-Black.woff2",
			weight: "900",
			style: "normal",
		},
	],
	variable: "--font-nohemi",
	display: "swap",
});

const dirtyline = localFont({
	src: [
		{
			path: "../../public/fonts/Dirtyline/Dirtyline-36daysoftype2022.woff2",
			weight: "400",
			style: "normal",
		},
	],
	variable: "--font-dirtyline",
	display: "swap",
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	viewportFit: "cover",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#03152c" },
	],
};

export const metadata: Metadata = {
	title: "Kiosk | Modern Websites for Small Businesses",
	description:
		"Professional custom sites, sales funnels, and online stores hosted on our platform with easy custom domain upgrades. Built for small businesses.",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Kiosk",
	},
	manifest: "/manifest.webmanifest",
	formatDetection: {
		telephone: false,
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	let initialClientLogo: string | null = null;
	let initialBusinessName: string | null = null;
	let isClientSite = false;

	try {
		const headerList = await headers();
		const host =
			headerList.get("x-forwarded-host") ||
			headerList.get("host") ||
			"";
		if (host) {
			const branding = await resolveTenantBranding(host);
			isClientSite = branding.isClientSite;
			initialClientLogo = branding.logoUrl || null;
			initialBusinessName = branding.businessName || null;
		}
	} catch (e) {
		// Non-blocking fallback
	}

	const clientFavicon =
		initialClientLogo ||
		`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23004ac6'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='sans-serif'>${encodeURIComponent(initialBusinessName?.trim()?.charAt(0).toUpperCase() || "W")}</text></svg>`;

	return (
		<html
			lang="en"
			className={`scroll-smooth ${montserrat.variable} ${thunderLC.variable} ${thunderHC.variable} ${nohemi.variable} ${dirtyline.variable}`}>
			<head>
				{/* Favicons: Use client branding on subdomains, Kiosk logo on marketing platform */}
				{isClientSite ? (
					<>
						<link rel="icon" href={clientFavicon} />
						<link rel="shortcut icon" href={clientFavicon} />
						<link rel="apple-touch-icon" href={clientFavicon} />
					</>
				) : (
					<>
						<link rel="icon" href="/kiosk_logo.svg" />
						<link rel="shortcut icon" href="/kiosk_logo.svg" />
						<link rel="apple-touch-icon" href="/kiosk_logo.svg" />
					</>
				)}

				{/* Apple / iOS Web App Meta */}
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />

				{/* Material Symbols Outlined */}
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className={`${montserrat.className} font-montserrat antialiased`}>
				<PWARegistration />
				<PageLoader
					initialClientLogo={initialClientLogo}
					initialBusinessName={initialBusinessName}
					isClientSite={isClientSite}
				/>
				<AuthProvider>
					<CurrencyProvider>
						<NavbarWrapper />
						{children}
						<CookieConsent />
					</CurrencyProvider>
				</AuthProvider>
				<Analytics />
			</body>
		</html>
	);
}
