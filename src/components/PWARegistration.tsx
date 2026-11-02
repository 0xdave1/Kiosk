"use client";

import { useEffect } from "react";

export default function PWARegistration() {
	useEffect(() => {
		if (!("serviceWorker" in navigator)) {
			return;
		}

		const registerServiceWorker = async () => {
			try {
				const registration = await navigator.serviceWorker.register("/sw.js", {
					scope: "/",
				});
				await registration.update();
			} catch (error) {
				console.error("Service worker registration failed", error);
			}
		};

		void registerServiceWorker();
	}, []);

	return null;
}
