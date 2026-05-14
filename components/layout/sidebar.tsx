"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    href: "#",
  },
  {
    title: "Lots",
    icon: Boxes,
    href: "#",
  },
];

const financeItems = [
  { title: "Customers", icon: Users, href: "#" },
  { title: "Expenses", icon: Receipt, href: "#" },
  { title: "Payments", icon: Wallet, href: "#" },
  { title: "Investments", icon: TrendingUp, href: "#" },
];

const systemItems = [
  { title: "Activity Logs", icon: ClipboardList, href: "#" },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    
    return (
      <Link href={item.href} key={item.title}>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 rounded-xl py-6 text-base ${
            isActive
              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/20"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon className="h-5 w-5" />
          {item.title}
        </Button>
      </Link>
    );
  };

  return (
    <aside className="w-64 min-h-screen border-r border-[#1a2340] bg-[#040b1f] sticky top-0 flex flex-col">
      {/* LOGO */}
      <div className="flex items-center gap-4 px-6 py-8 border-b border-[#1a2340]">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg font-bold">
          La
        </div>
        <div>
          <h1 className="text-3xl font-serif tracking-wide">LARUZ</h1>
          <p className="text-[11px] tracking-[3px] text-slate-400 uppercase">Jewelry Management</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <p className="mb-4 text-xs uppercase tracking-[4px] text-slate-500">Main</p>
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </div>

        {/* FINANCE */}
        <div className="mt-10">
          <p className="mb-4 text-xs uppercase tracking-[4px] text-slate-500">Finance</p>
          <div className="space-y-2">
            {financeItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </div>
        </div>

        {/* SYSTEM */}
        <div className="mt-10">
          <p className="mb-4 text-xs uppercase tracking-[4px] text-slate-500">System</p>
          <div className="space-y-2">
            {systemItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1a2340] p-6 bg-[#040b1f]">
        <p className="text-center text-sm text-slate-400">Trendy & Affordable Jewelry</p>
        <p className="text-center text-sm text-slate-500">At Your Doorstep</p>
      </div>
    </aside>
  );
}
