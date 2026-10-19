/**
 * Portfolio – Infinite Marquee Showcase
 *
 * Horizontally scrolling card strip that loops infinitely via CSS
 * translateX(-50%) on a duplicated list. Pauses on hover so users
 * can inspect individual projects. No JS timers or requestAnimationFrame
 * needed - pure CSS animation using the existing `marquee` keyframe
 * defined in globals.css.
 *
 * @format
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

/* ── Project Data ─────────────────────────────────────── */
const projects = [
	{
		title: "The Daily Grind",
		category: "Coffee Shop",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuA_8qtO7egvfk0vnDtcK__RhzjCrjjnsR3A3hJZ_URQ6ipuYIU-b4MULhVI1d4mAsnyrT8psf2ZKXQszBj8Us5LGiOPzW_iTxW5PMDpm47Zkcp9j81Xf8DxeNPweJKtNwRS7VdMcrSTICPoE-JXLwpY8lhgY-Vdqu42L22nIN18Bin5yEAHcPAqeAxWO0Yvw8ikO-ncc1tVz41gOqHHqEyM5Q2KPz0Xk2dSvy8ZC3aWNyX3UoFnpgBk",
		alt: "Coffee shop website with earthy tones and latte art photography",
	},
	{
		title: "Sterling & Associates",
		category: "Law Firm",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDYhhlCElRHKFRDWDde1AbOM5l8vrowfyFYwQNkYvWaTdwTMW1sHVFyJ8ur5vAlrRHZj-RAc-T5fl06sUA9EJ1o6_qBtyUs_mCzcFmgncbv6bh2Mt8dZYo-c7YMR91kQDzjrVetuQWvHKXjfIDdw6WNyFXnXNw82QQ2f642E7sOG918NP-Z7YEm_HaawAlck72JPWcajX7PFtpCey0Uxj71SmvdkBuPx_r53XNrygpWlKnO0ejzIKzu",
		alt: "Law firm website with navy blue and professional headshots",
	},
	{
		title: "Mode Modern",
		category: "Fashion",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuApqL5TWNiuXIpnTb_zD-MM1lUE3pB2dpQ15y_CZpJYYWkVtHW5pl5t1vWohB4L9rM5OzctZ9nG1sjA6V7iRPFjiDc-9b075akutXcdn5HAWw8F7OLTObpzjzKBhxmwbj2SiP2G9SC98zJJaEn71b5LnvepTjlL5WXBm5sswR-tYWJOBzl2goEfKT8uo7OstS-OWVyNzS8OG2el1lPbDwY1Yn0jg1RQs8QH_gsXpmIWNm1gJRwA1mt6",
		alt: "Fashion boutique e-commerce website with editorial photography",
	},
	{
		title: "Bloom Florals",
		category: "Florist",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCwgILlBMl6FpGfT3YD5Ihn9XR3zdrhyo7cKcoV_bClmdkzH-qFxky3OMlCb6XORwSOdAu9e0H-9h8ggNLUKOeieNMDGJMASJyZQKXihbhC-zBHeikEEjtOMG_h5OFUZ7cNLiRI6Jk9rPcYMTUjmQmsgg5NJpXx22vk_7CwHVfUjKg2XmoJu2RHX91LUr_yenMNCCvxxIz_3_Ms4O-Fy1K5m5RD27QfVMwoEui_sq3Ai2c_L9q3gCpP",
		alt: "Florist shop website with vibrant flower photography",
	},
];

/* ── Marquee Card ─────────────────────────────────────── */
function ProjectCard({
	project,
}: {
	project: (typeof projects)[number];
}) {
	return (
		<div className="shrink-0 w-[280px] sm:w-[400px] max-w-full group">
			{/* Browser chrome frame */}
			<div className="rounded-2xl bg-white overflow-hidden border border-outline-variant/30 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
				<div className="px-3 py-2 flex items-center gap-1.5 border-b border-outline-variant/30 bg-surface-container-high">
					<div className="w-2 h-2 rounded-full bg-red-400/80" />
					<div className="w-2 h-2 rounded-full bg-yellow-400/80" />
					<div className="w-2 h-2 rounded-full bg-green-400/80" />
					<div className="ml-2 flex-1 h-5 rounded-md bg-outline-variant/20" />
				</div>
				<div className="aspect-[16/10] relative bg-slate-100">
					<Image
						src={project.image}
						alt={project.alt}
						fill
						className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
						sizes="400px"
					/>
				</div>
			</div>

			{/* Label beneath the card */}
			<div className="mt-4 px-1">
				<h4 className="font-nohemi text-base font-bold text-on-surface group-hover:text-primary transition-colors">
					{project.title}
				</h4>
				<p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mt-0.5">
					{project.category}
				</p>
			</div>
		</div>
	);
}

/* ── Main Section ─────────────────────────────────────── */
export default function Portfolio() {
	// Duplicate the project list so the strip is wide enough to scroll seamlessly
	const items = [...projects, ...projects];

	return (
		<section
			id="portfolio"
			className="py-20 md:py-28 lg:py-32 bg-surface relative overflow-hidden">
			{/* Section Header */}
			<ScrollReveal direction="up">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
					<h2 className="font-section-heading text-on-surface mb-3">
						RECENT LAUNCHES
					</h2>
					<p className="font-body-lead max-w-lg mx-auto">
						Real websites we shipped for real small-business owners.
					</p>
				</div>
			</ScrollReveal>

			{/* Infinite Marquee Strip */}
			<div
				className="relative w-full group/marquee"
				style={{ maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)" }}>
				<div
					className="flex gap-8 w-max group-hover/marquee:[animation-play-state:paused]"
					style={{
						animation: "marquee 30s linear infinite",
						willChange: "transform",
						WebkitTransform: "translateZ(0)",
						transform: "translateZ(0)",
					}}>
					{items.map((project, i) => (
						<ProjectCard key={`${project.title}-${i}`} project={project} />
					))}
				</div>
			</div>

			{/* Explore All Launched Websites CTA */}
			<div className="mt-12 text-center relative z-10">
				<Link
					href="/showcase"
					className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200">
					<span>Explore All Launched Websites</span>
					<span>→</span>
				</Link>
			</div>
		</section>
	);
}
