"use client";

import Link from "next/link"; // [ADD] Import Link for navigation
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

const stats = [
  {
    title: "Delivered",
    value: "24",
    subtitle: "Orders completed",
    progress: 72,
    color: "bg-green-500",
    icon: null,
  },
  {
    title: "Pending",
    value: "8",
    subtitle: "Awaiting delivery",
    progress: 28,
    color: "bg-yellow-500",
    icon: Clock3,
  },
  {
    title: "Cancelled",
    value: "3",
    subtitle: "This month",
    progress: 14,
    color: "bg-red-500",
    icon: X,
  },
  {
    title: "On Hold",
    value: "2",
    subtitle: "Processing",
    progress: 10,
    color: "bg-blue-500",
    icon: null,
  },
];

const recentOrders = [
  { id: "#ORD-0037", customer: "Nadia Rahman", status: "Pending", amount: "৳ 2,400" },
  { id: "#ORD-0036", customer: "Sara Islam", status: "Delivered", amount: "৳ 1,800" },
  { id: "#ORD-0035", customer: "Rina Akter", status: "Hold", amount: "৳ 3,200" },
];

const activities = [
  { time: "Today, 11:42 AM", text: "New order #ORD-0037 created for Nadia Rahman — ৳ 2,400" },
  { time: "Today, 10:15 AM", text: "Payment received ৳ 8,500 via bKash" },
  { time: "Yesterday, 6:30 PM", text: "Order #ORD-0036 marked as Delivered" },
  { time: "Yesterday, 2:00 PM", text: "Inventory updated — 24 earrings added from Lot #LOT-005" },
];

export default function Home() {
  return (
    <section className="flex-1 overflow-y-auto">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1a2340] px-8 py-5">
        <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-[#1a2340] bg-[#0b132b] px-5 py-3 text-sm text-slate-300">
            Tue, May 12, 04:47 AM
          </div>
          <Avatar className="h-12 w-12 border border-[#1a2340]">
            <AvatarFallback className="bg-blue-600 text-white">L</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-8 text-white">
            {/* STATS */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="border-[#1a2340] bg-[#0b132b] text-white rounded-3xl">
                    <CardContent className="p-6">
                      <div className="mb-5 flex items-start justify-between">
                        <div>
                          <p className="text-lg text-slate-400">{stat.title}</p>
                          <h2 className="mt-4 text-5xl font-bold">{stat.value}</h2>
                          <p className="mt-3 text-sm text-slate-500">{stat.subtitle}</p>
                        </div>
                        {Icon && (
                          <div className="rounded-full bg-white/5 p-3">
                            <Icon className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* MIDDLE SECTION */}
            <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
              <Card className="border-[#1a2340] bg-[#0b132b] text-white rounded-3xl">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-wide text-slate-200">INVENTORY SUMMARY</h2>
                    <Link href="/Inventory">
                      <Button variant="outline" className="border-[#1a2340] bg-transparent text-slate-300 hover:bg-white/5">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="rounded-2xl bg-[#131d3a] p-8">
                      <p className="text-center text-slate-400">Stock Value</p>
                      <h3 className="mt-5 text-center text-5xl font-semibold text-yellow-400">৳ 84,500</h3>
                    </div>
                    <div className="rounded-2xl bg-[#131d3a] p-8">
                      <p className="text-center text-slate-400">Total Items</p>
                      <h3 className="mt-5 text-center text-5xl font-semibold text-blue-400">342</h3>
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="mb-4 text-lg text-slate-300">Top Categories</p>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="rounded-full bg-blue-600/20 px-4 py-2 text-blue-400 hover:bg-blue-600/20">Necklaces (45)</Badge>
                      <Badge className="rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-400 hover:bg-yellow-500/20">Rings (78)</Badge>
                      <Badge className="rounded-full bg-purple-500/20 px-4 py-2 text-purple-400 hover:bg-purple-500/20">Earrings (120)</Badge>
                      <Badge className="rounded-full bg-green-500/20 px-4 py-2 text-green-400 hover:bg-green-500/20">Bracelets (99)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#1a2340] bg-[#0b132b] text-white rounded-3xl">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-wide text-slate-200">RECENT ORDERS</h2>
                    <Button variant="outline" className="border-[#1a2340] bg-transparent text-slate-300 hover:bg-white/5">View All</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1a2340] hover:bg-transparent">
                        <TableHead className="text-slate-400">ORDER</TableHead>
                        <TableHead className="text-slate-400">CUSTOMER</TableHead>
                        <TableHead className="text-slate-400">STATUS</TableHead>
                        <TableHead className="text-right text-slate-400">AMOUNT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} className="border-[#1a2340] hover:bg-white/5">
                          <TableCell className="font-semibold text-blue-400">{order.id}</TableCell>
                          <TableCell className="text-slate-300">{order.customer}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full px-4 py-1 ${order.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" : order.status === "Delivered" ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-300">{order.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* ACTIVITY FEED */}
            <Card className="mt-8 border-[#1a2340] bg-[#0b132b] text-white rounded-3xl">
              <CardContent className="p-6">
                <h2 className="mb-8 text-2xl font-semibold tracking-wide text-slate-200">ACTIVITY FEED</h2>
                <div className="relative ml-3 border-l border-[#24304f]">
                  {activities.map((activity, index) => (
                    <div key={index} className="relative mb-10 pl-10 last:mb-0">
                      <div className="absolute -left-1.75 top-1 h-3 w-3 rounded-full bg-blue-500" />
                      <p className="text-sm text-slate-500">{activity.time}</p>
                      <p className="mt-2 text-xl text-slate-300">{activity.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
    </section>
  );
}