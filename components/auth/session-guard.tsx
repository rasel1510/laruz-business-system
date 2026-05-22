"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    // If explicitly logged out, redirect
    if (typeof window !== "undefined" && localStorage.getItem("logged_out") === "true") {
      if (pathname !== "/login") {
        window.location.href = "/login";
      }
      return;
    }

    // If session check is done and no session exists, redirect
    if (!isPending && !session && pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [isPending, session, pathname]);

  // If we are on the login page, always render children so they can login
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050816] text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-slate-400">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
