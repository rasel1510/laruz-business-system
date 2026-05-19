"use client";

import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // If we are on the login page, we don't enforce session checks
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show a full-screen loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050816] fixed inset-0 z-[999]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If no session exists, redirect immediately to login
  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return <>{children}</>;
}
