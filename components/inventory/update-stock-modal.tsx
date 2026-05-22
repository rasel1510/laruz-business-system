"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Check, Package, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProduct } from "@/lib/actions/inventory";
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

export function UpdateStockModal({
  products,
  onSuccess,
}: {
  products: Product[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [newQty, setNewQty] = useState<string>("0");
  const [newRetailPrice, setNewRetailPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products by name or code
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle dialog state reset
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedProduct(null);
      setNewQty("0");
      setNewRetailPrice("");
      setIsOpenDropdown(false);
    }
  }, [open]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(`${product.name} (${product.code})`);
    setNewRetailPrice(product.retailPrice.toString());
    setNewQty("0");
    setIsOpenDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const qtyAdj = parseInt(newQty) || 0;
      const price = parseFloat(newRetailPrice) || selectedProduct.retailPrice;

      const result = await updateProduct(selectedProduct.id, {
        retailPrice: price,
        stockAdjustment: qtyAdj,
      });

      if (result.success) {
        setOpen(false);
        onSuccess();
      } else {
        alert(result.error || "Failed to update stock");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm">
          <RefreshCw className="h-4 w-4" /> Update Stock / Price
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a2340] flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Update Stock / Price</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm mt-1">
              Select an existing product to update its retail price and add new stock.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Select Product Search Field */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <Label className="text-slate-400 text-xs sm:text-sm">Select Product</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpenDropdown(true);
                  if (selectedProduct && e.target.value !== `${selectedProduct.name} (${selectedProduct.code})`) {
                    setSelectedProduct(null);
                  }
                }}
                onFocus={() => setIsOpenDropdown(true)}
                placeholder="Search by name or code..."
                className="bg-[#050816] border-[#1a2340] pl-10 text-white rounded-xl focus:ring-blue-500 h-11"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedProduct(null);
                    setIsOpenDropdown(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isOpenDropdown && filteredProducts.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#0b132b] border border-[#1a2340] rounded-xl z-50 shadow-2xl divide-y divide-[#1a2340]/50 scrollbar-thin">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-xs sm:text-sm"
                  >
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-[#1a2340] bg-[#1a2340]/30 shrink-0">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-200 font-medium truncate">{product.name}</p>
                      <p className="text-blue-400 font-mono text-[10px] sm:text-xs">{product.code}</p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {isOpenDropdown && searchQuery && filteredProducts.length === 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[#0b132b] border border-[#1a2340] rounded-xl p-4 text-center text-slate-500 text-xs sm:text-sm z-50">
                No products found
              </div>
            )}
          </div>

          {/* Conditional Product Detail & Edit Fields */}
          {selectedProduct ? (
            <div className="space-y-4 pt-2 animate-fadeIn">
              <div className="flex items-center gap-4 p-3 bg-[#1a2340]/20 border border-[#1a2340] rounded-xl">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-[#1a2340] bg-[#1a2340]/30 shrink-0">
                  {selectedProduct.image ? (
                    <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-slate-200 truncate">{selectedProduct.name}</h4>
                  <p className="text-blue-400 font-mono text-xs">{selectedProduct.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* New Qty Field */}
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs sm:text-sm">New Qty</Label>
                  <Input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                    placeholder="Enter quantity to add..."
                  />
                  <div className="flex justify-between items-center px-1 text-[11px] sm:text-xs">
                    <span className="text-slate-500">Current: {selectedProduct.stock}</span>
                    <span className="text-blue-400 font-semibold">
                      New Total: {selectedProduct.stock + (parseInt(newQty) || 0)}
                    </span>
                  </div>
                </div>

                {/* New Retail Price Field */}
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs sm:text-sm">New Retail Price (৳)</Label>
                  <Input
                    type="number"
                    value={newRetailPrice}
                    onChange={(e) => setNewRetailPrice(e.target.value)}
                    className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                    placeholder="Enter new price..."
                  />
                  <div className="px-1 text-[11px] sm:text-xs text-slate-500">
                    Current: ৳ {selectedProduct.retailPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[#1a2340] rounded-xl p-8 text-center text-slate-500 text-xs sm:text-sm">
              Please select a product first to adjust its stock or price.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 sm:pt-4 border-t border-[#1a2340]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="px-4 sm:px-6 rounded-xl text-slate-400 hover:bg-white/5 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedProduct}
              className="px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
