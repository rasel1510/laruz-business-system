"use client";

import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // If we are on the login page, we don't enforce session checks
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Fast check: if we explicitly logged out in this browser, redirect immediately
  if (typeof window !== "undefined" && localStorage.getItem("logged_out") === "true") {
    window.location.href = "/login";
    return <div className="min-h-screen bg-[#050816]" />;
  }

  // Show a silent blank dark background while checking session (no spinner or text)
  if (isPending) {
    return <div className="min-h-screen bg-[#050816]" />;
  }

  // If no session exists, redirect immediately to login
  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return <div className="min-h-screen bg-[#050816]" />;
  }

  return <>{children}</>;
}
