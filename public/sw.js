const CACHE_VERSION = "kiosk-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
	OFFLINE_URL,
	"/icons/icon-192.svg",
	"/icons/icon-512.svg",
	"/kiosk_logo.svg",
];

const PRIVATE_PATHS = [
	"/admin",
	"/api",
	"/checkout",
	"/dashboard",
	"/get-started",
	"/reset-password",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter(
							(cacheName) =>
								cacheName !== STATIC_CACHE && cacheName !== PAGE_CACHE,
						)
						.map((cacheName) => caches.delete(cacheName)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const request = event.request;
	const url = new URL(request.url);

	if (request.method !== "GET" || url.origin !== self.location.origin) {
		return;
	}

	if (url.pathname === OFFLINE_URL) {
		event.respondWith(caches.match(OFFLINE_URL));
		return;
	}

	if (PRIVATE_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) {
		return;
	}

	if (
		request.destination === "style" ||
		request.destination === "script" ||
		request.destination === "font" ||
		request.destination === "image" ||
		url.pathname.startsWith("/_next/static/") ||
		url.pathname.startsWith("/icons/")
	) {
		event.respondWith(cacheFirst(request));
		return;
	}

	if (request.mode === "navigate") {
		event.respondWith(networkFirst(request));
	}
});

async function cacheFirst(request) {
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(STATIC_CACHE);
		await cache.put(request, response.clone());
	}
	return response;
}

async function networkFirst(request) {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(PAGE_CACHE);
			await cache.put(request, response.clone());
		}
		return response;
	} catch {
		return (await caches.match(request)) || (await caches.match(OFFLINE_URL));
	}
}
