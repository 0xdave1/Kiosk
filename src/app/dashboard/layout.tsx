/** @format */

import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
	title: "Dashboard | Kiosk",
	description:
		"Manage your projects, billing, and settings from your Kiosk dashboard.",
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="relative min-h-screen bg-[#f1f5f9]">
			<main className="min-h-screen pb-36 sm:pb-28">
				{children}
			</main>
			<Sidebar />
		</div>
	);
}
