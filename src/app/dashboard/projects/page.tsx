/** @format */

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PillButton from "@/components/PillButton";
import ProjectCard from "@/components/dashboard/ProjectCard";
import type { ProjectCardProps } from "@/components/dashboard/ProjectCard";
import { Loader2, Plus, FolderX } from "lucide-react";

type FilterStatus = "All" | "In Progress" | "In Review" | "Live" | "Draft";

export default function ProjectsPage() {
	const [projectsList, setProjectsList] = useState<ProjectCardProps[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterStatus>("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [subscriptionUsage, setSubscriptionUsage] = useState<any>(null);

	useEffect(() => {
		async function fetchProjects() {
			try {
				setIsLoading(true);
				setError(null);
				const res = await fetch("/api/projects");
				const data = await res.json();

				if (!res.ok) {
					setError(data.error || "Failed to load projects.");
					setIsLoading(false);
					return;
				}

				if (data.subscriptionUsage) {
					setSubscriptionUsage(data.subscriptionUsage);
				}

				if (Array.isArray(data.projects)) {
					const mapped = data.projects.map((p: any) => ({
						id: p.id,
						name: p.name,
						type: p.type,
						status: p.status,
						progress: p.progress,
						lastUpdated: p.updatedAt
							? new Date(p.updatedAt).toLocaleDateString()
							: "Just now",
						publishedUrl: p.publishedUrl,
					}));
					setProjectsList(mapped);
				}
			} catch (err) {
				console.error("[FETCH_PROJECTS_ERROR]", err);
				setError("Network error loading projects.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchProjects();
	}, []);

	const handleDeleteProject = async (projectId: string) => {
		const target = projectsList.find((p) => p.id === projectId);
		const confirmMsg = target
			? `Are you sure you want to delete "${target.name}"? This action cannot be undone.`
			: "Are you sure you want to delete this project?";

		if (!window.confirm(confirmMsg)) return;

		try {
			const res = await fetch(`/api/projects?projectId=${projectId}`, {
				method: "DELETE",
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || "Failed to delete project");
				return;
			}

			setProjectsList((prev) => prev.filter((p) => p.id !== projectId));
		} catch (err) {
			console.error("[DELETE_PROJECT_ERROR]", err);
			alert("A network error occurred while deleting the project.");
		}
	};

	const filteredProjects = projectsList.filter((project) => {
		const matchesFilter =
			activeFilter === "All" || project.status === activeFilter;
		const matchesSearch =
			project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			project.type.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	const filters: FilterStatus[] = [
		"All",
		"In Progress",
		"In Review",
		"Live",
		"Draft",
	];

	return (
		<div className="w-full min-h-screen bg-[#f8fafc]">
			{/* Main Container */}
			<div className="px-4 sm:px-6 lg:px-8 pt-10 pb-16 max-w-[1400px] mx-auto">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 mb-8">
					<div>
						<div className="flex items-center gap-3 mb-1">
							<h1 className="text-2xl sm:text-3xl font-bold font-nohemi text-gray-900 tracking-tight">
								Projects
							</h1>
							{subscriptionUsage && (
								<span className={`px-3 py-1 rounded-full text-xs font-bold border ${
									subscriptionUsage.isLimitReached
										? "bg-amber-50 text-amber-800 border-amber-200"
										: "bg-blue-50 text-blue-700 border-blue-200"
								}`}>
									{subscriptionUsage.usedWebsites} of {subscriptionUsage.maxAllowedWebsites} Website{subscriptionUsage.maxAllowedWebsites !== 1 ? "s" : ""} Used (1 Sub per Site)
								</span>
							)}
						</div>
						<p className="text-gray-500 text-sm font-medium">
							Manage and track all your active website projects. Each subscription generates 1 website.
						</p>
					</div>

					<div className="flex items-center gap-3">
						{subscriptionUsage?.isLimitReached ? (
							<Link
								href="/checkout?plan=landing"
								className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2">
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
								className="px-5 py-2.5 text-xs font-bold border border-blue-600 shadow-md">
								+ New Project
							</PillButton>
						)}
					</div>
				</div>

				{/* Controls Bar: Search & Filter Tabs */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
					{/* Filter Tabs */}
					<div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
						{filters.map((filter) => {
							const count =
								filter === "All"
									? projectsList.length
									: projectsList.filter((p) => p.status === filter).length;

							return (
								<button
									key={filter}
									type="button"
									onClick={() => setActiveFilter(filter)}
									className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-2 ${
										activeFilter === filter
											? "bg-blue-600 text-white shadow-xs"
											: "bg-white text-gray-600 hover:bg-gray-100/80 border border-gray-200/80"
									}`}>
									<span>{filter}</span>
									<span
										className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
											activeFilter === filter
												? "bg-blue-500 text-white"
												: "bg-gray-100 text-gray-500"
										}`}>
										{count}
									</span>
								</button>
							);
						})}
					</div>

					{/* Search Box */}
					<div className="relative w-full md:w-64">
						<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
							search
						</span>
						<input
							type="text"
							placeholder="Search projects..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200/90 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
						/>
					</div>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="py-20 text-center flex flex-col items-center justify-center">
						<Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
						<p className="text-xs font-bold text-gray-500">Loading your real-time projects...</p>
					</div>
				)}

				{/* Error State */}
				{!isLoading && error && (
					<div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto mb-8">
						<p className="text-xs font-bold text-red-600">{error}</p>
					</div>
				)}

				{/* Projects Grid */}
				{!isLoading && !error && filteredProjects.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{filteredProjects.map((project) => (
							<ProjectCard
								key={project.id || project.name}
								{...project}
								onDelete={handleDeleteProject}
							/>
						))}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && filteredProjects.length === 0 && (
					<div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center max-w-md mx-auto">
						<div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
							<FolderX className="w-6 h-6" />
						</div>
						<h3 className="text-base font-bold font-nohemi text-gray-900 mb-1">
							{projectsList.length === 0 ? "No active projects yet" : "No matching projects"}
						</h3>
						<p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
							{projectsList.length === 0
								? "You haven't provisioned any website projects for your workspace yet."
								: "No projects matched your filter or search criteria."}
						</p>

						{projectsList.length === 0 ? (
							<Link
								href="/dashboard/projects/new"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md">
								<Plus className="w-4 h-4" />
								<span>Create Your First Project</span>
							</Link>
						) : (
							<button
								type="button"
								onClick={() => {
									setActiveFilter("All");
									setSearchQuery("");
								}}
								className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors">
								Reset Filters
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
