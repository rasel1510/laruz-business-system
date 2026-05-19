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
import { DeleteProductModal } from "@/components/inventory/delete-product-modal";
import { ImagePreviewModal } from "@/components/inventory/image-preview-modal";
import { getProducts } from "@/lib/actions/inventory";
import Image from "next/image";

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
    <section className="flex-1 overflow-y-auto">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1a2340] px-4 py-4 sm:px-6 md:px-8 md:py-5">
        <h1 className="text-2xl sm:text-3xl font-serif pl-12 lg:pl-0">Inventory</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block rounded-xl border border-[#1a2340] bg-[#0b132b] px-3 py-2 md:px-4 text-xs md:text-sm text-slate-300">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-blue-500">
            <AvatarFallback className="bg-blue-600 text-sm">L</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="relative flex-1 min-w-0 sm:min-w-[200px] md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search products..." 
                  className="bg-[#0b132b] border-[#1a2340] pl-10 h-11 sm:h-12 rounded-xl text-slate-300 focus:ring-blue-500 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                <Select>
                  <SelectTrigger className="w-full sm:w-[180px] bg-[#0b132b] border-[#1a2340] h-11 sm:h-12 rounded-xl text-xs sm:text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b132b] border-[#1a2340] text-white">
                    <SelectItem value="earrings">Earrings</SelectItem>
                    <SelectItem value="necklaces">Necklaces</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-full sm:w-[180px] bg-[#0b132b] border-[#1a2340] h-11 sm:h-12 rounded-xl text-xs sm:text-sm">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b132b] border-[#1a2340] text-white">
                    <SelectItem value="in">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                onClick={fetchProducts}
                className="h-11 sm:h-12 px-4 sm:px-5 rounded-xl border-[#1a2340] bg-transparent text-slate-300 hover:bg-white/5 gap-2 text-xs sm:text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Update Stock
              </Button>

              <AddProductModal onSuccess={fetchProducts} />
            </div>

            {/* INVENTORY TABLE - Wrapper for horizontal scrolling on mobile */}
            <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[900px] sm:min-w-full">
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
                          <TableCell className="font-semibold text-slate-200">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <ImagePreviewModal image={item.image} name={item.name}>
                                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-[#1a2340] bg-[#1a2340]/30">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                  </div>
                                </ImagePreviewModal>
                              ) : (
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-[#1a2340] bg-[#1a2340]/30">
                                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                                    <Package className="h-5 w-5" />
                                  </div>
                                </div>
                              )}
                              <span>{item.name}</span>
                            </div>
                          </TableCell>
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
                            <div className="flex items-center justify-center gap-2">
                              <EditProductModal product={item} onSuccess={fetchProducts} />
                              <DeleteProductModal product={item} onSuccess={fetchProducts} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
    </section>
  );
}
