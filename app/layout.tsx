import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LARUZ — Jewelry Management",
  description: "Trendy & affordable jewelry management system",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Sidebar } from "@/components/layout/sidebar";
import { SessionGuard } from "@/components/auth/session-guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050816]">
        <SessionGuard>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-h-screen min-w-0">
              {children}
            </main>
          </div>
        </SessionGuard>
      </body>
    </html>
  );
}
