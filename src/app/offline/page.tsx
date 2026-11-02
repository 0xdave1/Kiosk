export default function OfflinePage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-[#03152c] px-6 text-center text-white">
			<div className="max-w-md">
				<p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
					Kiosk
				</p>
				<h1 className="mb-4 text-4xl font-bold">You&apos;re offline</h1>
				<p className="text-white/70">
					Reconnect to the internet and try again. Previously visited public
					pages will be available when they have finished loading.
				</p>
			</div>
		</main>
	);
}
