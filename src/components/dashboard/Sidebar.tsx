/** @format */

"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Dock from "./Dock";
import type { DockItemData } from "./Dock";

interface NavItem {
	label: string;
	href: string;
	icon: string;
}

const navItems: NavItem[] = [
	{ label: "Overview", href: "/dashboard", icon: "dashboard" },
	{ label: "Projects", href: "/dashboard/projects", icon: "folder_open" },
	{ label: "Business Analytics", href: "/dashboard/analytics", icon: "analytics" },
	{ label: "Billing", href: "/dashboard/billing", icon: "receipt_long" },
	{ label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();

	const isAdminUser = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

	const dockItems: DockItemData[] = [
		...navItems.map((item) => {
			const isActive =
				pathname === item.href ||
				(item.href !== "/dashboard" && pathname.startsWith(item.href));

			return {
				icon: (
					<span
						className={`material-symbols-outlined text-[22px] ${
							isActive ? "text-blue-600" : "text-gray-500"
						}`}
						style={{
							fontVariationSettings: isActive
								? "'FILL' 1, 'wght' 500"
								: "'FILL' 0, 'wght' 400",
						}}>
						{item.icon}
					</span>
				),
				label: item.label,
				onClick: () => router.push(item.href),
				className: isActive
					? "!bg-blue-50 !border-blue-200"
					: "",
			};
		}),
		...(isAdminUser
			? [
					{
						icon: (
							<span
								className="material-symbols-outlined text-[22px] text-amber-600"
								style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
								admin_panel_settings
							</span>
						),
						label: "Admin Hub",
						onClick: () => router.push("/admin"),
						className: "!bg-amber-50/70 !border-amber-200",
					},
			  ]
			: []),
		{
			icon: (
				<span className="material-symbols-outlined text-[22px] text-rose-500">
					logout
				</span>
			),
			label: "Log Out",
			onClick: () => logout(),
			className: "hover:!bg-rose-50 hover:!border-rose-200",
		},
	];

	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] px-2">
			<Dock
				items={dockItems}
				panelHeight={isMobile ? 56 : 66}
				baseItemSize={isMobile ? 40 : 48}
				magnification={isMobile ? 40 : 66}
				distance={isMobile ? 0 : 180}
			/>
		</div>
	);
}
