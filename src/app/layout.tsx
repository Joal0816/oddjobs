import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "oddJobs — CONNECT. WORK. EARN.",
  description: "Hyperlocal Student Workforce Marketplace for MSU-IIT. Connecting students, people, and businesses.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-circle.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#08080a] text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
