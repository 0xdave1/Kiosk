/** @format */

"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Dock from "@/components/dashboard/Dock";
import type { DockItemData } from "@/components/dashboard/Dock";

interface AdminNavItem {
	label: string;
	href: string;
	icon: string;
}

const adminNavItems: AdminNavItem[] = [
	{ label: "Admin Hub", href: "/admin", icon: "dashboard" },
	{ label: "Fulfillment Queue", href: "/admin/projects", icon: "layers" },
	{ label: "Users & Workspaces", href: "/admin/users", icon: "group" },
	{ label: "Billing & Ledger", href: "/admin/billing", icon: "receipt_long" },
	{ label: "Customer View", href: "/dashboard", icon: "storefront" },
];

export default function AdminDock() {
	const pathname = usePathname();
	const router = useRouter();
	const { logout } = useAuth();

	const dockItems: DockItemData[] = [
		...adminNavItems.map((item) => {
			const isActive =
				item.href === "/admin"
					? pathname === "/admin"
					: item.href === "/dashboard"
					? pathname === "/dashboard"
					: pathname.startsWith(item.href);

			return {
				icon: (
					<span
						className={`material-symbols-outlined text-[22px] ${
							isActive ? "text-blue-600 font-bold" : "text-gray-500"
						}`}
						style={{
							fontVariationSettings: isActive
								? "'FILL' 1, 'wght' 600"
								: "'FILL' 0, 'wght' 400",
						}}>
						{item.icon}
					</span>
				),
				label: item.label,
				onClick: () => router.push(item.href),
				className: isActive
					? "!bg-blue-50 !border-blue-300 shadow-sm"
					: "hover:!bg-gray-50",
			};
		}),
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
