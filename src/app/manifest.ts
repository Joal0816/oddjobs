import type { MetadataRoute } from "next";

/**
 * PWA web app manifest — served by Next.js at /manifest.webmanifest.
 *
 * Icon sizes below were measured with `file`/`identify` on the actual
 * generated assets (public/icon-*.png), never guessed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "oddJobs — CONNECT. WORK. EARN.",
    short_name: "oddJobs",
    description:
      "Hyperlocal Student Workforce Marketplace for MSU-IIT. Connecting students, people, and businesses.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08080a",
    theme_color: "#ff9900",
    categories: ["business", "lifestyle", "education"],
    icons: [
      // Regular ("any") icons — used for the app tile / shortcut.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable icons — required by Chrome's installability criteria.
      // The brand mark sits at 76% scale so it survives the adaptive mask crop.
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      // Legacy square-logo entry (existing 512x512 asset, verified).
      { src: "/logo-circle.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
