import Link from "next/link";
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
  Clock3,
  X,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import prisma from "@/lib/db";

// Force dynamic so it always fetches fresh data on load
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch real data
  const [products, orders] = await Promise.all([
    prisma.product.findMany(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  // Inventory stats
  const totalItems = products.length;
  const stockValue = products.reduce((acc, p) => acc + p.retailPrice * p.stock, 0);

  // Top categories (simple count based on products)
  const categoryCounts = products.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Orders stats
  let delivered = 0;
  let pending = 0;
  let cancelled = 0;
  let onHold = 0;

  orders.forEach((o) => {
    const s = o.status.toLowerCase();
    if (s === "delivered") delivered++;
    else if (s === "pending") pending++;
    else if (s === "cancelled") cancelled++;
    else if (s === "hold") onHold++;
  });

  const stats = [
    {
      title: "Delivered",
      value: delivered.toString(),
      color: "bg-green-500",
      icon: CheckCircle2,
    },
    {
      title: "Pending",
      value: pending.toString(),
      color: "bg-yellow-500",
      icon: Clock3,
    },
    {
      title: "Cancelled",
      value: cancelled.toString(),
      color: "bg-red-500",
      icon: X,
    },
    {
      title: "On Hold",
      value: onHold.toString(),
      color: "bg-blue-500",
      icon: null,
    },
  ];

  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: o.orderNumber,
    customer: o.customerName || o.customer?.name || "Walk-in",
    status: o.status,
    amount: `৳ ${o.totalAmount.toLocaleString()}`,
  }));

  // Activity feed from latest orders
  const activities = orders.slice(0, 5).map((o) => {
    const name = o.customerName || o.customer?.name || "Walk-in";
    const dateStr = new Date(o.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return {
      time: dateStr,
      text: `Order ${o.orderNumber} placed by ${name} — ৳ ${o.totalAmount.toLocaleString()}`,
    };
  });

  return (
    <section className="flex-1 overflow-y-auto">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1a2340] px-4 py-3 sm:px-6 md:px-8 md:py-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white pl-12 lg:pl-0">
          Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block rounded-lg border border-[#1a2340] bg-[#0b132b] px-3 py-1.5 md:px-4 md:py-2 text-xs text-white">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-[#1a2340]">
            <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
              L
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 text-white max-w-7xl mx-auto">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="border-[#1a2340] bg-[#0b132b] text-white rounded-xl sm:rounded-2xl"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 sm:mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-white font-medium tracking-wide uppercase">
                        {stat.title}
                      </p>
                      <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold">
                        {stat.value}
                      </h2>
                    </div>
                    {Icon && (
                      <div className="rounded-lg bg-white/5 p-2">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* MIDDLE SECTION */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* INVENTORY SUMMARY CARD */}
          <Card className="border-[#1a2340] bg-[#0b132b] text-white rounded-xl sm:rounded-2xl flex flex-col">
            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
              <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-semibold tracking-wide text-white">
                  INVENTORY SUMMARY
                </h2>
                <Link href="/Inventory">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#1a2340] bg-transparent text-white hover:bg-white/5 text-[10px] sm:text-xs h-7 sm:h-8 px-3"
                  >
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl bg-[#131d3a] p-3 sm:p-5 border border-[#1a2340]">
                  <p className="text-center text-[11px] sm:text-xs font-medium text-white uppercase tracking-wider">
                    Stock Value
                  </p>
                  <h3 className="mt-1.5 sm:mt-2 text-center text-lg sm:text-2xl font-bold text-yellow-400">
                    ৳ {stockValue.toLocaleString()}
                  </h3>
                </div>
                <div className="rounded-xl bg-[#131d3a] p-3 sm:p-5 border border-[#1a2340]">
                  <p className="text-center text-[11px] sm:text-xs font-medium text-white uppercase tracking-wider">
                    Total Items
                  </p>
                  <h3 className="mt-1.5 sm:mt-2 text-center text-lg sm:text-2xl font-bold text-blue-400">
                    {totalItems}
                  </h3>
                </div>
              </div>
              
              <div className="mt-4 pt-4 sm:pt-5 sm:mt-auto border-t border-[#1a2340]">
                <p className="mb-2.5 sm:mb-3 text-[11px] sm:text-xs font-medium text-white uppercase tracking-wider">
                  Top Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {topCategories.length > 0 ? (
                    topCategories.map(([cat, count], idx) => {
                      const colors = [
                        "bg-blue-600/20 text-blue-400 border-blue-500/20 hover:bg-blue-600/30",
                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/30",
                        "bg-purple-500/20 text-purple-400 border-purple-500/20 hover:bg-purple-500/30",
                        "bg-green-500/20 text-green-400 border-green-500/20 hover:bg-green-500/30",
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <Badge
                          key={cat}
                          variant="outline"
                          className={`rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-medium ${color}`}
                        >
                          {cat} ({count})
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-xs text-white">
                      No categories found
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RECENT ORDERS CARD */}
          <Card className="border-[#1a2340] bg-[#0b132b] text-white rounded-xl sm:rounded-2xl flex flex-col">
            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
              <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-semibold tracking-wide text-white">
                  RECENT ORDERS
                </h2>
                <Link href="/orders">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#1a2340] bg-transparent text-white hover:bg-white/5 text-[10px] sm:text-xs h-7 sm:h-8 px-3"
                  >
                    View All
                  </Button>
                </Link>
              </div>

              {/* Mobile card layout for orders */}
              <div className="sm:hidden space-y-2">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg bg-[#131d3a] p-3 space-y-1.5 border border-[#1a2340]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-400 text-xs">
                          {order.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2 py-0 border-transparent text-[10px] ${
                            order.status === "Pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : order.status === "Delivered"
                              ? "bg-green-500/20 text-green-400"
                              : order.status === "Cancelled"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-[11px] truncate pr-2">
                          {order.customer}
                        </span>
                        <span className="text-white font-medium text-xs whitespace-nowrap">
                          {order.amount}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-white text-xs">
                    No orders yet.
                  </div>
                )}
              </div>

              {/* Desktop table layout */}
              <div className="hidden sm:block flex-1 border border-[#1a2340] rounded-lg overflow-hidden bg-[#131d3a]">
                {recentOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1a2340] hover:bg-transparent bg-[#0b132b]/50">
                        <TableHead className="text-white text-[11px] py-2 h-auto">ORDER</TableHead>
                        <TableHead className="text-white text-[11px] py-2 h-auto">
                          CUSTOMER
                        </TableHead>
                        <TableHead className="text-white text-[11px] py-2 h-auto">STATUS</TableHead>
                        <TableHead className="text-right text-white text-[11px] py-2 h-auto">
                          AMOUNT
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="border-[#1a2340] hover:bg-white/5"
                        >
                          <TableCell className="font-semibold text-blue-400 text-xs py-2.5">
                            {order.id}
                          </TableCell>
                          <TableCell className="text-white text-xs py-2.5 max-w-[120px] truncate">
                            {order.customer}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-2 py-0 border-transparent text-[10px] ${
                                order.status === "Pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : order.status === "Delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : order.status === "Cancelled"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-white font-medium text-xs py-2.5">
                            {order.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-white text-sm">
                    No orders yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVITY FEED */}
        <Card className="mt-4 sm:mt-6 border-[#1a2340] bg-[#0b132b] text-white rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <h2 className="mb-4 sm:mb-5 text-sm sm:text-base font-semibold tracking-wide text-white">
              ACTIVITY FEED
            </h2>
            <div className="relative ml-2 sm:ml-3 border-l border-[#24304f]">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                     key={index}
                    className="relative mb-5 sm:mb-6 pl-5 sm:pl-6 last:mb-0"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-[#0b132b]" />
                    <p className="text-[10px] sm:text-xs text-white font-medium">
                      {activity.time}
                    </p>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white">
                      {activity.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="pl-5 sm:pl-6 text-white text-xs sm:text-sm">No recent activity.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}