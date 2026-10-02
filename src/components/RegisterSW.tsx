"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on the client only. Renders nothing.
 * Also clears out any stray service workers left behind by older deploys.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Clean up stale registrations from previous versions first.
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations
            .filter((reg) => !reg.active?.scriptURL.endsWith("/sw.js"))
            .map((reg) => reg.unregister())
        )
      )
      .catch(() => undefined);

    const register = () =>
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => undefined); // offline / unsupported — fail silently

    // Wait until the page is fully idle-ish so we don't fight first paint.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
