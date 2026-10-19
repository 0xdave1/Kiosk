/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PillButton from "@/components/PillButton";
import RevisionModal from "@/components/dashboard/RevisionModal";
import QuickEditModal from "@/components/dashboard/QuickEditModal";
import {
	FolderOpen,
	Globe,
	Crown,
	Headset,
	PlusCircle,
	FileEdit,
	Palette,
	MessageSquare,
	X,
	Send,
	CheckCircle2,
	Clock,
	Sparkles,
	ExternalLink,
	Monitor,
	Smartphone,
	Loader2,
	Layers,
	Edit3,
	ArrowRight,
	BarChart3,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
	const router = useRouter();
	const { user, logout } = useAuth();

	const [greeting, setGreeting] = useState("Good morning");
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isNotifOpen, setIsNotifOpen] = useState(false);
	const [isSupportOpen, setIsSupportOpen] = useState(false);
	const [isRevisionOpen, setIsRevisionOpen] = useState(false);
	const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
	const [supportMessage, setSupportMessage] = useState("");
	const [supportSent, setSupportSent] = useState(false);
	const [isSendingSupport, setIsSendingSupport] = useState(false);
	const [supportTicketId, setSupportTicketId] = useState<string | null>(null);

	// Real API State
	const [projectsList, setProjectsList] = useState<any[]>([]);
	const [tenantInfo, setTenantInfo] = useState<any | null>(null);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [analyticsSummary, setAnalyticsSummary] = useState<{
		totalViews: number;
		whatsappClicks: number;
		conversionRate: number;
	} | null>(null);

	const notifRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);

	const [notifications, setNotifications] = useState([
		{
			id: "1",
			title: "Workspace Active",
			message: "Your multi-tenant workspace is live and connected.",
			time: "Just now",
			type: "design",
			unread: true,
		},
		{
			id: "2",
			title: "Welcome to Kiosk!",
			message: "Your account setup has been completed successfully.",
			time: "Today",
			type: "content",
			unread: false,
		},
	]);

	const unreadCount = notifications.filter((n) => n.unread).length;

	// Saved Business Content State
	const [savedContent, setSavedContent] = useState<any | null>(null);
	const [subscriptionUsage, setSubscriptionUsage] = useState<any | null>(null);

	// Fetch real projects & content from API endpoints
	useEffect(() => {
		async function fetchUserData() {
			try {
				setIsLoadingProjects(true);
				const [projRes, contentRes, analyticsRes] = await Promise.all([
					fetch("/api/projects"),
					fetch("/api/projects/content"),
					fetch("/api/analytics?range=30d"),
				]);

				if (projRes.ok) {
					const data = await projRes.json();
					setProjectsList(data.projects || []);
					setTenantInfo(data.tenant || null);
					setSubscriptionUsage(data.subscriptionUsage || null);
				}

				if (contentRes.ok) {
					const cData = await contentRes.json();
					setSavedContent(cData.content || null);
				}

				if (analyticsRes.ok) {
					const aData = await analyticsRes.json();
					if (aData.summary) {
						setAnalyticsSummary(aData.summary);
					}
				}
			} catch (err) {
				console.error("[FETCH_DATA_ERROR]", err);
			} finally {
				setIsLoadingProjects(false);
			}
		}

		if (user) {
			fetchUserData();
		} else {
			setIsLoadingProjects(false);
		}
	}, [user]);

	useEffect(() => {
		const hour = new Date().getHours();
		if (hour < 12) {
			setGreeting("Good morning");
		} else if (hour < 17) {
			setGreeting("Good afternoon");
		} else {
			setGreeting("Good evening");
		}
	}, []);

	// Click outside listener for dropdowns
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				notifRef.current &&
				!notifRef.current.contains(event.target as Node)
			) {
				setIsNotifOpen(false);
			}
			if (
				profileRef.current &&
				!profileRef.current.contains(event.target as Node)
			) {
				setIsProfileOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const rawName = user?.name || (user?.email ? user.email.split("@")[0] : "");
	const displayName = rawName
		? rawName.charAt(0).toUpperCase() + rawName.slice(1)
		: "Friend";
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const handleLogout = async () => {
		setIsProfileOpen(false);
		await logout();
	};

	const handleSendSupport = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!supportMessage.trim()) return;
		setIsSendingSupport(true);
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: user?.name || "Client User",
					email: user?.email || "client@kioosk.online",
					subject: `Dashboard Support Request: ${activeProject?.name || "Workspace"}`,
					category: "Technical Support & Site Edits",
					priority: "normal",
					message: supportMessage,
					websiteUrl: activeProject?.publishedUrl || "",
				}),
			});
			const data = await res.json();
			if (data?.ticketId) {
				setSupportTicketId(data.ticketId);
			}
			setSupportSent(true);
			setTimeout(() => {
				setSupportSent(false);
				setSupportMessage("");
				setSupportTicketId(null);
				setIsSupportOpen(false);
			}, 3000);
		} catch (err) {
			console.error("Failed to send support ticket", err);
			setSupportSent(true);
			setTimeout(() => {
				setSupportSent(false);
				setSupportMessage("");
				setIsSupportOpen(false);
			}, 2500);
		} finally {
			setIsSendingSupport(false);
		}
	};

	const activeProject = projectsList.length > 0 ? projectsList[0] : null;

	return (
		<div className="w-full min-h-screen min-h-screen-ios bg-[#f8fafc] relative pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5rem))] select-none overflow-hidden">
			{/* Lively Architectural Background Vector Lines & Geometric Shapes */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
				<svg
					className="absolute inset-0 w-full h-full"
					xmlns="http://www.w3.org/2000/svg">
					<defs>
						{/* Clean Architectural Blueprint Grid Pattern */}
						<pattern
							id="dashboard-grid-pattern"
							width="50"
							height="50"
							patternUnits="userSpaceOnUse">
							<path
								d="M 50 0 L 0 0 0 50"
								fill="none"
								stroke="#cbd5e1"
								strokeWidth="0.75"
								strokeDasharray="4 4"
								opacity="0.65"
							/>
						</pattern>
					</defs>

					{/* Background Grid Pattern */}
					<rect width="100%" height="100%" fill="url(#dashboard-grid-pattern)" />

					{/* Floating Crisp Diagonal Lines */}
					<path
						d="M -100 180 L 900 -200"
						stroke="#3b82f6"
						strokeWidth="1.5"
						strokeDasharray="6 6"
						opacity="0.25"
					/>
					<path
						d="M 200 900 L 1600 200"
						stroke="#6366f1"
						strokeWidth="1.5"
						strokeDasharray="10 10"
						opacity="0.2"
					/>
					<path
						d="M -50 700 L 1200 1300"
						stroke="#0284c7"
						strokeWidth="1.2"
						strokeDasharray="8 8"
						opacity="0.2"
					/>

					{/* Geometric Accent Shapes: Concentric Circles & Outlines */}
					<circle
						cx="90%"
						cy="15%"
						r="140"
						fill="none"
						stroke="#2563eb"
						strokeWidth="1.5"
						strokeDasharray="6 6"
						opacity="0.25"
					/>
					<circle
						cx="90%"
						cy="15%"
						r="80"
						fill="none"
						stroke="#3b82f6"
						strokeWidth="1"
						strokeDasharray="4 4"
						opacity="0.2"
					/>

					<circle
						cx="10%"
						cy="60%"
						r="190"
						fill="none"
						stroke="#6366f1"
						strokeWidth="1.5"
						strokeDasharray="8 8"
						opacity="0.2"
					/>
					<circle
						cx="10%"
						cy="60%"
						r="100"
						fill="none"
						stroke="#8b5cf6"
						strokeWidth="1"
						strokeDasharray="5 5"
						opacity="0.18"
					/>

					{/* Geometric Floating Outlines: Diamond & Squares */}
					<rect
						x="78%"
						y="45%"
						width="48"
						height="48"
						rx="12"
						fill="none"
						stroke="#0284c7"
						strokeWidth="1.5"
						strokeDasharray="4 4"
						transform="rotate(45 800 400)"
						opacity="0.25"
					/>
					<rect
						x="15%"
						y="20%"
						width="60"
						height="60"
						rx="16"
						fill="none"
						stroke="#3b82f6"
						strokeWidth="1.5"
						strokeDasharray="6 6"
						transform="rotate(15 200 200)"
						opacity="0.22"
					/>
				</svg>
			</div>

			{/* Header with Logo and Profile Dropdown */}
			<header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Logo */}
				<Link
					href="/"
					className="flex items-center select-none group py-0.5"
					aria-label="Kiosk Home">
					<img
						src="/KIOSK PNG2.png"
						alt="Kiosk"
						className="h-8 sm:h-9 w-auto max-w-[160px] sm:max-w-[190px] object-contain transition-transform duration-200 group-hover:scale-105"
					/>
				</Link>

				{/* Header Actions: Notifications & User Profile */}
				<div className="flex items-center gap-3">
					{/* Notifications Dropdown Container */}
					<div ref={notifRef} className="relative">
						<button
							type="button"
							aria-label="Notifications"
							onClick={() => {
								setIsNotifOpen(!isNotifOpen);
								setIsProfileOpen(false);
							}}
							className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 transition-colors duration-150 cursor-pointer">
							<span className="material-symbols-outlined text-[22px]">
								notifications
							</span>
							{unreadCount > 0 && (
								<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-[#f8fafc]" />
							)}
						</button>

						{/* Notifications Dropdown Menu */}
						{isNotifOpen && (
							<div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white border border-gray-200/90 rounded-2xl shadow-xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
								<div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<h3 className="text-xs font-bold text-gray-900 font-nohemi">
											Notifications
										</h3>
										{unreadCount > 0 && (
											<span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-extrabold">
												{unreadCount} New
											</span>
										)}
									</div>

									{unreadCount > 0 && (
										<button
											type="button"
											onClick={() => {
												setNotifications((prev) =>
													prev.map((n) => ({ ...n, unread: false })),
												);
											}}
											className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
											Mark all as read
										</button>
									)}
								</div>

								<div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
									{notifications.map((n) => (
										<button
											key={n.id}
											type="button"
											onClick={() => {
												setNotifications((prev) =>
													prev.map((item) =>
														item.id === n.id
															? { ...item, unread: false }
															: item,
													),
												);
												setIsNotifOpen(false);
											}}
											className={`w-full text-left p-3.5 transition-colors duration-150 cursor-pointer ${
												n.unread
													? "bg-blue-50/40 hover:bg-blue-50/70"
													: "hover:bg-gray-50/70"
											}`}>
											<div className="flex items-center justify-between gap-2 mb-1">
												<h4 className="text-xs font-bold text-gray-900 leading-snug">
													{n.title}
												</h4>
												<span className="text-[10px] font-semibold text-gray-400 shrink-0">
													{n.time}
												</span>
											</div>
											<p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">
												{n.message}
											</p>
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Profile Dropdown Container */}
					<div ref={profileRef} className="relative">
						<button
							type="button"
							onClick={() => {
								setIsProfileOpen(!isProfileOpen);
								setIsNotifOpen(false);
							}}
							className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-xl text-gray-800 hover:bg-gray-100/70 transition-colors duration-150 cursor-pointer">
							{user?.image ? (
								<img
									src={user.image}
									alt={displayName}
									className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/30 shadow-xs shrink-0"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs shrink-0">
									{initials}
								</div>
							)}
							<span className="hidden sm:inline text-xs font-bold text-gray-800">
								{displayName}
							</span>
							<span className="material-symbols-outlined text-gray-400 text-[18px]">
								expand_more
							</span>
						</button>

						{/* Dropdown Menu */}
						{isProfileOpen && (
							<div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200/90 rounded-2xl shadow-lg z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
								<div className="px-3 py-2.5 border-b border-gray-100 mb-1">
									<p className="text-xs font-bold text-gray-900 leading-snug">
										{displayName}
									</p>
									<p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
										{user?.email || "user@kiosk.site"}
									</p>
								</div>

								<div className="space-y-0.5">
									<button
										type="button"
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/analytics");
										}}
										className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 transition-colors duration-150 cursor-pointer">
										<span>Traffic & WhatsApp</span>
									</button>

									<button
										type="button"
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/settings");
										}}
										className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 transition-colors duration-150 cursor-pointer">
										<span>Account Settings</span>
									</button>

									<button
										type="button"
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/billing");
										}}
										className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 transition-colors duration-150 cursor-pointer">
										<span>Billing & Plan</span>
									</button>
								</div>

								<div className="border-t border-gray-100 mt-1 pt-1">
									<button
										type="button"
										onClick={handleLogout}
										className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer">
										<span>Log Out</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 max-w-[1400px] mx-auto">
				{/* Top Greeting Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold font-nohemi text-gray-900 tracking-tight">
							{greeting}, {displayName}
						</h1>
					</div>

					{subscriptionUsage?.isLimitReached ? (
						<Link
							href="/checkout?plan=landing"
							className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 self-start sm:self-auto">
							<Sparkles className="w-3.5 h-3.5" />
							<span>+ Add Website Subscription</span>
						</Link>
					) : (
						<PillButton
							href="/dashboard/projects/new"
							baseColor="#004ac6"
							circleColor="#ffffff"
							textColor="#ffffff"
							hoverTextColor="#004ac6"
							useThunderFont={true}
							className="px-6 py-2.5 text-xs font-bold border border-blue-600 shadow-sm self-start sm:self-auto">
							+ New Project
						</PillButton>
					)}
				</div>

				{/* Loading State */}
				{isLoadingProjects ? (
					<div className="w-full p-12 bg-white border border-gray-200/90 rounded-3xl text-center flex flex-col items-center justify-center">
						<Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
						<p className="text-xs text-gray-500 font-medium">
							Loading workspace projects...
						</p>
					</div>
				) : (
					/* BENTO STYLE GRID LAYOUT */
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
						{/* BENTO TILE 1: Welcome & Active Project Summary Banner (Span 2 cols on MD/LG) */}
						<div className="md:col-span-2 lg:col-span-2 bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-200 shadow-2xs">
							{activeProject ? (
								<div>
									<div className="flex items-center justify-between gap-2 mb-4">
										<div className="inline-flex items-center gap-2 text-blue-600 text-[11px] font-extrabold uppercase tracking-wider">
											<span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
											<span>Active Workspace</span>
										</div>

										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setIsQuickEditOpen(true)}
												className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60 shadow-2xs">
												<Sparkles className="w-3.5 h-3.5 text-indigo-600" />
												<span>Quick Edit</span>
											</button>
										</div>
									</div>

									<h2 className="text-xl sm:text-2xl font-bold font-nohemi text-gray-900 mb-1">
										{activeProject.name}
									</h2>
									<p className="text-xs text-gray-500 font-medium mb-4 max-w-md leading-relaxed">
										{activeProject.status === "Live" || activeProject.progress === 100
											? `Your ${activeProject.type.toLowerCase()} is published and live for customers!`
											: activeProject.progress >= 85
											? `Autonomous builder is assembling and publishing your ${activeProject.type.toLowerCase()}...`
											: `Your ${activeProject.type.toLowerCase()} project is currently ${activeProject.progress}% complete.`}
									</p>

									{activeProject.publishedUrl && (activeProject.status === "Live" || activeProject.progress === 100) && (
										<div className="mb-5">
											<a
												href={activeProject.publishedUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 shadow-2xs">
												<Globe className="w-3.5 h-3.5 text-emerald-600" />
												<span>Visit Live Website ↗</span>
											</a>
										</div>
									)}

									{/* Progress Bar */}
									<div className="space-y-1.5 mb-6">
										<div className="flex justify-between text-xs font-bold text-gray-700">
											<span>Build Progress</span>
											<span className={activeProject.progress === 100 ? "text-emerald-600 font-black" : ""}>
												{activeProject.progress}% {activeProject.progress === 100 ? "• Live" : ""}
											</span>
										</div>
										<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
											<div
												className={`h-full rounded-full transition-all duration-500 ${
													activeProject.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
												}`}
												style={{ width: `${activeProject.progress}%` }}
											/>
										</div>
									</div>
								</div>
							) : (
								<div className="py-4 text-center sm:text-left">
									<div className="inline-flex items-center gap-2 text-blue-600 text-[11px] font-extrabold uppercase tracking-wider mb-3">
										<Sparkles className="w-4 h-4" />
										<span>Get Started</span>
									</div>
									<h2 className="text-xl font-bold font-nohemi text-gray-900 mb-2">
										No Active Projects Yet
									</h2>
									<p className="text-xs text-gray-500 font-medium mb-6 max-w-md">
										Order your first custom landing page, sales funnel, or e-commerce store to go live.
									</p>
									<PillButton
										href="/dashboard/projects/new"
										baseColor="#004ac6"
										circleColor="#ffffff"
										textColor="#ffffff"
										hoverTextColor="#004ac6"
										useThunderFont={true}
										className="px-5 py-2 text-xs font-bold border border-blue-600">
										+ Create First Project
									</PillButton>
								</div>
							)}

							{activeProject && (
								<div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
									<span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
										<Clock className="w-3.5 h-3.5" />
										Status: {activeProject.status}
									</span>

									<div className="flex items-center gap-2 sm:gap-3">
										<button
											type="button"
											onClick={() => setIsQuickEditOpen(true)}
											className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 cursor-pointer">
											<Sparkles className="w-3.5 h-3.5 text-indigo-600" />
											<span>Quick Edit</span>
										</button>
										<button
											type="button"
											onClick={() => setIsRevisionOpen(true)}
											className="text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
											Request Revision
										</button>
										<Link
											href={`/dashboard/content?projectId=${activeProject.id}&plan=${encodeURIComponent(activeProject.type)}`}
											className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
											<span>Full Content →</span>
										</Link>
									</div>
								</div>
							)}
						</div>

						{/* BENTO TILE 2: Quick Metrics Grid (Span 1 col) */}
						<div className="grid grid-cols-2 md:grid-cols-1 gap-4">
							<div className="bg-white border border-gray-200/90 rounded-3xl p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-200 shadow-2xs">
								<div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
									<FolderOpen className="w-4 h-4" />
								</div>
								<div>
									<p className="text-2xl font-bold font-nohemi text-gray-900">
										{projectsList.length}
										{subscriptionUsage && (
											<span className="text-xs font-semibold text-gray-400 font-sans ml-1">
												/ {subscriptionUsage.maxAllowedWebsites}
											</span>
										)}
									</p>
									<p className="text-xs text-gray-500 font-medium">
										{projectsList.length === 1 ? "Active Website" : "Active Websites"} • 1 Sub/Site
									</p>
								</div>
							</div>

							<Link
								href="/dashboard/analytics"
								className="bg-white border border-gray-200/90 rounded-3xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-200 shadow-2xs group cursor-pointer">
								<div className="flex items-center justify-between mb-3">
									<div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
										<BarChart3 className="w-4 h-4" />
									</div>
									<span className="text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
										Analytics →
									</span>
								</div>
								<div>
									<div className="flex items-baseline gap-2">
										<p className="text-2xl font-bold font-nohemi text-gray-900">
											{analyticsSummary?.totalViews ?? 0}
										</p>
										<span className="text-[11px] font-bold text-emerald-600">
											{analyticsSummary?.whatsappClicks ?? 0} leads
										</span>
									</div>
									<p className="text-xs text-gray-500 font-medium">Traffic & WhatsApp</p>
								</div>
							</Link>
						</div>

						{/* BENTO TILE 3: Current Plan & Upgrade Tile (Span 1 col) */}
						<div className="bg-white border border-gray-200/90 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-200 shadow-2xs">
							<div>
								<div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
									<Crown className="w-4 h-4" />
								</div>
								<h3 className="text-base font-bold font-nohemi text-gray-900 mb-1">
									Kiosk Subscription
								</h3>
								<p className="text-xs text-gray-500 font-medium mb-4">
									Add a Sales Funnel or E-commerce Store to your account anytime.
								</p>
							</div>

							<PillButton
								href="/dashboard/billing"
								baseColor="#ffffff"
								circleColor="#004ac6"
								textColor="#004ac6"
								hoverTextColor="#ffffff"
								useThunderFont={true}
								className="w-full py-2.5 text-xs font-bold border border-blue-600">
								Add More Services
							</PillButton>
						</div>

						{/* BENTO TILE 4: Active Projects Grid (Span 2 cols on LG) */}
						<div className="lg:col-span-2 bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 hover:border-blue-500/40 transition-all duration-200 shadow-2xs">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-lg font-bold font-nohemi text-gray-900">
									Your Projects
								</h3>
								<Link
									href="/dashboard/projects"
									className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
									View All ({projectsList.length}) →
								</Link>
							</div>

							{projectsList.length === 0 ? (
								<div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
									<Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
									<p className="text-xs font-bold text-gray-700">No projects yet</p>
									<p className="text-[11px] text-gray-400 mt-0.5 mb-3">
										Create a project to start building your site.
									</p>
									<Link
										href="/dashboard/projects/new"
										className="text-xs font-bold text-blue-600 hover:underline">
										+ Create Project
									</Link>
								</div>
							) : (
								<div className="space-y-3">
									{projectsList.map((project) => (
										<Link
											key={project.id}
											href={`/dashboard/content?projectId=${project.id}&plan=${encodeURIComponent(project.type)}`}
											className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 hover:border-blue-500/40 hover:bg-blue-50/40 transition-all duration-150 flex items-center justify-between gap-4 group cursor-pointer block">
											<div>
												<h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
													<span>{project.name}</span>
													<Edit3 className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
												</h4>
												<p className="text-[11px] text-gray-500 font-medium">
													{project.type} • Status: {project.status}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-blue-600 bg-white px-3 py-1 rounded-full border border-gray-200/80 group-hover:border-blue-200">
													{project.progress}%
												</span>
												<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
											</div>
										</Link>
									))}
								</div>
							)}
						</div>

						{/* BENTO TILE 5: Quick Actions & Shortcut Tools (Span 2 cols on LG) */}
						<div className="lg:col-span-2 bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 hover:border-blue-500/40 transition-all duration-200 shadow-2xs">
							<h3 className="text-lg font-bold font-nohemi text-gray-900 mb-5">
								Quick Actions
							</h3>

							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								<button
									type="button"
									onClick={() => setIsQuickEditOpen(true)}
									className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-50 transition-colors flex items-center gap-3 text-left group cursor-pointer">
									<Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
									<div>
										<p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
											Quick-Edit Site
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Instant changes
										</p>
									</div>
								</button>

								<Link
									href="/dashboard/analytics"
									className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors flex items-center gap-3 group">
									<BarChart3 className="w-5 h-5 text-emerald-600 shrink-0" />
									<div>
										<p className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
											Traffic Analytics
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Views & WhatsApp
										</p>
									</div>
								</Link>

								<Link
									href="/dashboard/content"
									className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors flex items-center gap-3 group">
									<FileEdit className="w-5 h-5 text-blue-600 shrink-0" />
									<div>
										<p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
											Full Content
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Comprehensive
										</p>
									</div>
								</Link>

								<button
									type="button"
									onClick={() => setIsRevisionOpen(true)}
									className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 hover:bg-cyan-50 transition-colors flex items-center gap-3 text-left group cursor-pointer">
									<MessageSquare className="w-5 h-5 text-cyan-600 shrink-0" />
									<div>
										<p className="text-xs font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
											Revisions
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Send feedback
										</p>
									</div>
								</button>

								<Link
									href="/dashboard/templates"
									className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors flex items-center gap-3 group">
									<Palette className="w-5 h-5 text-purple-600 shrink-0" />
									<div>
										<p className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
											Templates
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Browse styles
										</p>
									</div>
								</Link>

								<button
									type="button"
									onClick={() => setIsSupportOpen(true)}
									className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors flex items-center gap-3 text-left group cursor-pointer">
									<Headset className="w-5 h-5 text-amber-600 shrink-0" />
									<div>
										<p className="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
											Support
										</p>
										<p className="text-[10px] text-gray-500 font-medium">
											Contact team
										</p>
									</div>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Support Drawer / Modal */}
			{isSupportOpen && (
				<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
					<div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
									<Headset className="w-4 h-4" />
								</div>
								<h3 className="text-base font-bold font-nohemi text-gray-900">
									Contact Dedicated Support
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setIsSupportOpen(false)}
								className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
								<X className="w-5 h-5" />
							</button>
						</div>

						{supportSent ? (
							<div className="py-8 text-center space-y-2">
								<CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
								<p className="text-sm font-bold text-gray-900">Support Request Dispatched</p>
								{supportTicketId && (
									<p className="text-xs font-mono font-bold text-blue-600">
										Ticket #{supportTicketId}
									</p>
								)}
								<p className="text-xs text-gray-500 mt-1">
									Our team will respond to your email within 2 hours.
								</p>
							</div>
						) : (
							<form onSubmit={handleSendSupport} className="space-y-4">
								<div>
									<label
										htmlFor="sup-msg"
										className="block text-xs font-bold text-gray-700 mb-1.5">
										How can we help you today?
									</label>
									<textarea
										id="sup-msg"
										rows={4}
										required
										value={supportMessage}
										onChange={(e) => setSupportMessage(e.target.value)}
										placeholder="Describe your question or request..."
										className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-gray-400"
									/>
								</div>
								<button
									type="submit"
									disabled={isSendingSupport}
									className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer">
									{isSendingSupport ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Dispatching Ticket...</span>
										</>
									) : (
										<>
											<Send className="w-4 h-4" />
											<span>Send Support Ticket</span>
										</>
									)}
								</button>
								<div className="pt-2 flex flex-col items-center gap-1.5 text-center">
									<a
										href="https://wa.me/2348116062226?text=Hi%20Kiosk%20Support%2C%20I%20need%20assistance%20with%20my%20dashboard"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
										Chat on WhatsApp (+234 811 606 2226) &rarr;
									</a>
									<Link
										href="/contact"
										onClick={() => setIsSupportOpen(false)}
										className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline">
										Open Full Contact & Support Portal &rarr;
									</Link>
								</div>
							</form>
						)}
					</div>
				</div>
			)}

			{/* Revision Request Modal */}
			<RevisionModal
				isOpen={isRevisionOpen}
				onClose={() => setIsRevisionOpen(false)}
			/>

			{/* Quick-Edit Studio Modal */}
			<QuickEditModal
				isOpen={isQuickEditOpen}
				onClose={() => setIsQuickEditOpen(false)}
			/>
		</div>
	);
}
