"use client";

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
import { AddProductModal } from "@/components/inventory/add-product-modal";
import { EditProductModal } from "@/components/inventory/edit-product-modal";
import { getProducts } from "@/lib/actions/inventory";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  subCategory: string;
  buyingPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  image?: string | null;
}

const getBadgeStyle = (category: string) => {
  switch (category.toLowerCase()) {
    case 'earrings': return "bg-blue-600/20 text-blue-400";
    case 'necklaces': return "bg-purple-600/20 text-purple-400";
    case 'rings': return "bg-yellow-500/20 text-yellow-400";
    case 'bracelets': return "bg-green-600/20 text-green-400";
    default: return "bg-slate-600/20 text-slate-400";
  }
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    // @ts-ignore - Handle Prisma date objects if needed, but here we just need the fields
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
          <div className="py-6 px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20">
              <Package className="h-4 w-4" /> Inventory
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">
          {/* TOPBAR */}
          <div className="flex items-center justify-between border-b border-[#1a2340] px-8 py-5">
            <h1 className="text-3xl font-serif">Inventory</h1>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-[#1a2340] bg-[#0b132b] px-4 py-2 text-sm text-slate-300">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

              <Button 
                variant="outline" 
                onClick={fetchProducts}
                className="h-12 px-5 rounded-xl border-[#1a2340] bg-transparent text-slate-300 hover:bg-white/5 gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Update Stock
              </Button>

              <AddProductModal onSuccess={fetchProducts} />
            </div>

            {/* INVENTORY TABLE */}
            <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b] overflow-hidden shadow-2xl">
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-20 text-slate-500">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-20 text-slate-500">
                        No products found. Add your first product to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((item) => (
                      <TableRow key={item.id} className="border-[#1a2340] hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-blue-400 py-5">{item.code}</TableCell>
                        <TableCell className="font-semibold text-slate-200">{item.name}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-full px-3 py-1 font-normal ${getBadgeStyle(item.category)}`}>
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">{item.subCategory}</TableCell>
                        <TableCell className="text-slate-300">৳ {item.buyingPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-300">৳ {item.wholesalePrice.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-300">৳ {item.retailPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${item.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-300">৳ {(item.stock * item.retailPrice).toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <EditProductModal product={item} onSuccess={fetchProducts} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}