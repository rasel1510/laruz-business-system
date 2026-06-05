"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Receipt,
  Wallet,
  TrendingUp,
  ClipboardList,
  Menu,
  X,
  LogOut,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/Inventory",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/orders",
  },
  {
    title: "Lots",
    icon: Boxes,
    href: "/lots",
  },
];

const financeItems = [
  { title: "Invoice", icon: FileText, href: "/finance/invoice" },
  { title: "Customers", icon: Users, href: "/finance/customers" },
  { title: "Expenses", icon: Receipt, href: "/finance/expenses" },
  { title: "Payments", icon: Wallet, href: "/finance/payments" },
  { title: "Investments", icon: TrendingUp, href: "/finance/investments" },
];

const systemItems = [
  { title: "Activity Logs", icon: ClipboardList, href: "/activity-logs" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    
    return (
      <Link href={item.href} key={item.title}>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 rounded-xl py-3.5 text-base ${
              isActive
                ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/20"
                : "text-white hover:bg-white/5 hover:text-white"
            }`}
        >
          <Icon className="h-5 w-5" />
          {item.title}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* LOGO */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-[#1a2340]">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg font-bold shrink-0">
          La
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-serif tracking-wide">LARUZ</h1>
          <p className="text-[11px] tracking-[3px] text-white uppercase">Jewelry Management</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="px-4 py-4 flex-1 overflow-y-auto">
        <p className="mb-2 text-xs uppercase tracking-[4px] text-white">Main</p>
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </div>

        {/* FINANCE */}
        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-[4px] text-white">Finance</p>
          <div className="space-y-1">
            {financeItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </div>
        </div>

        {/* SYSTEM */}
        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-[4px] text-white">System</p>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1a2340] p-4 bg-[#040b1f] space-y-2">
        <Button
          variant="ghost"
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("logged_out", "true");
                  }
                  window.location.href = "/login";
                }
              }
            });
          }}
          className="w-full justify-start gap-3 rounded-xl py-3.5 text-base text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
        <div>
          <p className="text-center text-xs text-white">Trendy & Affordable Jewelry</p>
          <p className="text-center text-xs text-white">At Your Doorstep</p>
        </div>
      </div>
    </>
  );

  if (pathname === "/login") return null;

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-xl bg-[#0b132b] border border-[#1a2340] flex items-center justify-center text-white hover:text-white hover:bg-[#131d3a] transition-colors shadow-lg"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile slide-in drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 w-72 h-full bg-[#040b1f] border-r border-[#1a2340] flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar — unchanged */}
      <aside className="hidden lg:flex w-64 min-h-screen border-r border-[#1a2340] bg-[#040b1f] sticky top-0 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
