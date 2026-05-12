"use client";

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
  Search,
  RefreshCw,
  Plus,
  Edit2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const inventoryData = [
  {
    code: "#PRD-0001",
    name: "Gold Hoop Earrings",
    category: "Earrings",
    subCat: "Gold",
    buying: "৳ 380",
    wholesale: "৳ 520",
    retail: "৳ 650",
    qty: 48,
    value: "৳ 31,200",
    color: "text-blue-400",
    badgeBg: "bg-blue-600/20 text-blue-400",
  },
  {
    code: "#PRD-0002",
    name: "Silver Chain Necklace",
    category: "Necklaces",
    subCat: "Silver",
    buying: "৳ 250",
    wholesale: "৳ 380",
    retail: "৳ 480",
    qty: 12,
    value: "৳ 5,760",
    color: "text-purple-400",
    badgeBg: "bg-purple-600/20 text-purple-400",
  },
  {
    code: "#PRD-0003",
    name: "Stone Ring Set",
    category: "Rings",
    subCat: "Stone",
    buying: "৳ 180",
    wholesale: "৳ 280",
    retail: "৳ 350",
    qty: 65,
    value: "৳ 22,750",
    color: "text-yellow-400",
    badgeBg: "bg-yellow-500/20 text-yellow-400",
  },
  {
    code: "#PRD-0004",
    name: "Pearl Bracelet",
    category: "Bracelets",
    subCat: "Pearl",
    buying: "৳ 320",
    wholesale: "৳ 480",
    retail: "৳ 580",
    qty: 5,
    value: "৳ 2,900",
    color: "text-green-400",
    badgeBg: "bg-green-600/20 text-green-400",
  },
];

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        {/* SIDEBAR (Consistent with Home) */}
        <aside className="w-56 min-h-screen border-r border-[#1a2340] bg-[#040b1f] hidden lg:block">
          <div className="flex items-center gap-4 px-6 py-8 border-b border-[#1a2340]">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold">La</div>
            <div>
              <h1 className="text-xl font-serif">LARUZ</h1>
              <p className="text-[9px] tracking-[2px] text-slate-400 uppercase">Jewelry Management</p>
            </div>
          </div>
          {/* ... Navigation items would go here ... */}
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">
          {/* TOPBAR */}
          <div className="flex items-center justify-between border-b border-[#1a2340] px-8 py-5">
            <h1 className="text-3xl font-serif">Inventory</h1>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-[#1a2340] bg-[#0b132b] px-4 py-2 text-sm text-slate-300">
                Tue, May 12, 05:00 AM
              </div>
              <Avatar className="h-10 w-10 border border-blue-500">
                <AvatarFallback className="bg-blue-600">L</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="p-8">
            {/* SEARCH AND FILTERS */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search products..." 
                  className="bg-[#0b132b] border-[#1a2340] pl-10 h-12 rounded-xl text-slate-300 focus:ring-blue-500"
                />
              </div>

              <Select>
                <SelectTrigger className="w-[180px] bg-[#0b132b] border-[#1a2340] h-12 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b132b] border-[#1a2340] text-white">
                  <SelectItem value="earrings">Earrings</SelectItem>
                  <SelectItem value="necklaces">Necklaces</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[180px] bg-[#0b132b] border-[#1a2340] h-12 rounded-xl">
                  <SelectValue placeholder="All Sub-Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b132b] border-[#1a2340] text-white">
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="h-12 px-5 rounded-xl border-[#1a2340] bg-transparent text-slate-300 hover:bg-white/5 gap-2">
                <RefreshCw className="h-4 w-4" /> Update Stock
              </Button>

              <Button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-5 w-5" /> Add Product
              </Button>
            </div>

            {/* INVENTORY TABLE */}
            <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b] overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-[#1a2340] hover:bg-transparent">
                    <TableHead className="text-slate-400 py-5">CODE</TableHead>
                    <TableHead className="text-slate-400">PRODUCT</TableHead>
                    <TableHead className="text-slate-400">CATEGORY</TableHead>
                    <TableHead className="text-slate-400">SUB-CAT</TableHead>
                    <TableHead className="text-slate-400">BUYING</TableHead>
                    <TableHead className="text-slate-400">WHOLESALE</TableHead>
                    <TableHead className="text-slate-400">RETAIL</TableHead>
                    <TableHead className="text-slate-400">QTY</TableHead>
                    <TableHead className="text-slate-400">VALUE</TableHead>
                    <TableHead className="text-center text-slate-400">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.code} className="border-[#1a2340] hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-blue-400 py-5">{item.code}</TableCell>
                      <TableCell className="font-semibold text-slate-200">{item.name}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full px-3 py-1 font-normal ${item.badgeBg}`}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{item.subCat}</TableCell>
                      <TableCell className="text-slate-300">{item.buying}</TableCell>
                      <TableCell className="text-slate-300">{item.wholesale}</TableCell>
                      <TableCell className="text-slate-300">{item.retail}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${item.qty < 10 ? 'text-red-500' : 'text-green-500'}`}>
                          {item.qty}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">{item.value}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}