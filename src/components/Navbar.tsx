/**
 * Navbar (Dynamic Auth Context Integration)
 *
 * Renders StaggeredMenu navigation.
 * When logged in, displays the user's name and avatar linking to /dashboard.
 * When logged out, displays "Get Started".
 *
 * @format
 */

"use client";

import React from "react";
import StaggeredMenu from "./StaggeredMenu";
import BackToTop from "./BackToTop";
import { useAuth } from "@/context/AuthContext";

const navItems = [
	{ label: "Showcase", href: "/showcase" },
	{ label: "Services", href: "/services" },
	{ label: "Pricing", href: "/#pricing" },
	{ label: "Portfolio", href: "/#portfolio" },
	{ label: "FAQ", href: "/#faq" },
	{ label: "Contact", href: "/contact" },
];

export default function Navbar() {
	const { user } = useAuth();

	const menuItems = navItems.map((n) => ({
		label: n.label,
		ariaLabel: `Go to ${n.label.toLowerCase()}`,
		link: n.href,
	}));

	const displayName = user?.name || user?.email?.split("@")[0] || "Dashboard";

	const actionItems = user
		? [
				{
					label: displayName,
					link: "/dashboard",
					primary: true,
					ariaLabel: "Go to your dashboard",
				},
		  ]
		: [{ label: "Get Started", link: "/get-started", primary: true }];

	return (
		<div>
			<StaggeredMenu
				position="right"
				items={menuItems}
				actionItems={actionItems}
				displaySocials={false}
				displayItemNumbering={true}
				menuButtonColor="#0a0a0a"
				openMenuButtonColor="#0a0a0a"
				changeMenuColorOnOpen={true}
				colors={["#B497CF", "#5227FF"]}
				logoUrl="/KIOSK PNG2.png"
				accentColor="#2563eb"
				isFixed={true}
				showMenuText={false}
			/>
			<BackToTop />
		</div>
	);
}
