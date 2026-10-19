"use client";

import Link from "next/link";

const footerLinks = {
	company: [
		{ label: "Services", href: "/services" },
		{ label: "About Us", href: "/#about" },
		{ label: "Portfolio", href: "/#portfolio" },
		{ label: "Pricing", href: "/#pricing" },
		{ label: "Contact Support", href: "/contact" },
	],
	legal: [
		{ label: "Privacy Policy", href: "/privacy" },
		{ label: "Terms of Service", href: "/terms" },
	],
};

export default function Footer() {
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<footer className="bg-[#03152c] text-white pt-32 md:pt-40 overflow-hidden relative z-20">
			{/* Asymmetric Wave Shape Divider */}
			<div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
				<svg
					className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[90px]"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1200 120"
					preserveAspectRatio="none">
					<path
						d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V0H1200V30C1132.19,68.88,1055.71,111.31,985.66,92.83Z"
						className="fill-[#004ac6]"
					></path>
				</svg>
			</div>

			<div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-16 md:mb-32 relative z-10">
				{/* Brand Info */}
				<div className="col-span-2 md:col-span-1 space-y-5 pr-4 md:pr-0">
					<Link href="/" className="inline-block group" aria-label="Kiosk Home">
						<img
							src="/KIOSK PNG2-dark.png"
							alt="Kiosk"
							className="h-10 sm:h-12 md:h-13 lg:h-14 w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain transition-transform duration-200 group-hover:scale-105"
						/>
					</Link>
					<p className="text-white/60 text-sm md:text-[15px] leading-relaxed max-w-xs font-medium">
						Building professional digital presences for small business owners
						who mean business. Fast, affordable, and fully managed.
					</p>
				</div>

				{/* Company */}
				<div className="col-span-1">
					<h5 className="font-label-caption mb-6 text-white/40 uppercase tracking-[0.15em] text-[11px] font-bold">Company</h5>
					<ul className="space-y-4 text-[15px]">
						{footerLinks.company.map((link) => (
							<li key={link.label}>
								<Link
									href={link.href}
									className="text-white/70 hover:text-white transition-colors duration-300">
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Legal */}
				<div className="col-span-1">
					<h5 className="font-label-caption mb-6 text-white/40 uppercase tracking-[0.15em] text-[11px] font-bold">Legal</h5>
					<ul className="space-y-4 text-[15px]">
						{footerLinks.legal.map((link) => (
							<li key={link.label}>
								<Link
									href={link.href}
									className="text-white/70 hover:text-white transition-colors duration-300">
									{link.label}
								</Link>
							</li>
						))}
						<li>
							<button
								type="button"
								onClick={() => {
									if (typeof window !== "undefined") {
										window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
									}
								}}
								className="text-white/70 hover:text-white transition-colors duration-300 text-left cursor-pointer">
								Cookie Preferences
							</button>
						</li>
					</ul>
				</div>

				{/* Contact */}
				<div className="col-span-2 md:col-span-1">
					<h5 className="font-label-caption mb-6 text-white/40 uppercase tracking-[0.15em] text-[11px] font-bold">Contact</h5>
					<ul className="space-y-4 text-[15px]">
						<li>
							<a
								href="mailto:hello@kioosk.online"
								className="text-white/70 hover:text-white transition-colors duration-300">
								hello@kioosk.online
							</a>
						</li>
						<li>
							<a
								href="https://wa.me/2348116062226?text=Hi%20Kiosk%2C%20I%20have%20an%20inquiry%20about%20your%20services"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white/70 hover:text-white transition-colors duration-300">
								WhatsApp: +234 811 606 2226
							</a>
						</li>
						<li>
							<Link
								href="/contact"
								className="text-blue-400 hover:text-white transition-colors duration-300 font-medium">
								Support Desk &rarr;
							</Link>
						</li>
					</ul>
				</div>
			</div>

			{/* Bottom Section & Massive Typography */}
			<div className="relative w-full max-w-full flex flex-col items-center justify-end overflow-hidden pt-6 md:pt-10 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
				{/* Copyright & Socials */}
				<div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col-reverse md:flex-row justify-between items-center gap-8 md:gap-4 text-white/50 text-xs md:text-sm mb-10 md:mb-2 relative z-10">
					<p className="font-medium tracking-wide text-center md:text-left">&copy; {new Date().getFullYear()} Kiosk. All rights reserved.</p>
					
					<div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
						{/* TikTok */}
						<a
							href="https://www.tiktok.com/@_kiosk_2?_r=1&_t=ZS-99mhMnfufVo"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 hover:text-white transition-colors"
							aria-label="TikTok">
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
							</svg>
						</a>

						{/* Instagram */}
						<a
							href="https://www.instagram.com/_kiosk_online/?hl=en"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 hover:text-white transition-colors"
							aria-label="Instagram">
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
							</svg>
						</a>

						{/* Facebook */}
						<a
							href="https://www.facebook.com/share/1Aio47QopK/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 hover:text-white transition-colors"
							aria-label="Facebook">
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
							</svg>
						</a>

						{/* X (formerly Twitter) */}
						<a
							href="https://x.com/_Kiosk_online"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 hover:text-white transition-colors"
							aria-label="X">
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z" />
							</svg>
						</a>

						{/* WhatsApp */}
						<a
							href="https://wa.me/2348116062226"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 hover:text-white transition-colors"
							aria-label="WhatsApp">
							<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
							</svg>
						</a>
						
						{/* Back to Top Button */}
						<button 
							onClick={scrollToTop}
							className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors ml-0 md:ml-4 border border-white/10 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-white/10"
							aria-label="Scroll back to top"
						>
							Back to top 
							<span className="material-symbols-outlined text-sm group-hover:-translate-y-0.5 transition-transform">
								arrow_upward
							</span>
						</button>
					</div>
				</div>

				{/* Massive Edge-to-Edge Typography */}
				<div className="w-full max-w-full overflow-hidden flex justify-center leading-[0.75] select-none pointer-events-none translate-y-[12%] mt-2 md:mt-0">
					<span 
						className="font-thunder-lc uppercase text-[24vw] md:text-[25vw] font-bold tracking-[-0.02em] whitespace-nowrap"
						style={{
							background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0) 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							color: "transparent"
						}}>
						KIOSK
					</span>
				</div>
			</div>
		</footer>
	);
}
