"use client";

import { useState } from "react";
import { Plus, Check, Trash2, Calendar } from "lucide-react";
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
import { addLot } from "@/lib/actions/lots";

interface Product {
  id: string;
  code: string;
  name: string;
  buyingPrice: number;
}

interface LotItemInput {
  productId: string;
  quantity: number;
  buyingPrice: number;
}

export function AddLotModal({
  products,
  onSuccess,
}: {
  products: Product[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [items, setItems] = useState<LotItemInput[]>([
    { productId: "", quantity: 1, buyingPrice: 0 },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1, buyingPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      // Clear first item instead of deleting last row
      setItems([{ productId: "", quantity: 1, buyingPrice: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LotItemInput, value: any) => {
    const updated = [...items];
    if (field === "productId") {
      updated[index].productId = value;
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].buyingPrice = product.buyingPrice;
      }
    } else if (field === "quantity") {
      updated[index].quantity = Math.max(0, parseInt(value) || 0);
    } else if (field === "buyingPrice") {
      updated[index].buyingPrice = Math.max(0, parseFloat(value) || 0);
    }
    setItems(updated);
  };

  const calculateTotalValue = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.buyingPrice, 0);
  };

  const calculateTotalQuantity = () => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate items
    const hasEmptyProduct = items.some((item) => !item.productId);
    if (hasEmptyProduct) {
      setError("Please select a product for all rows.");
      return;
    }

    const hasInvalidQty = items.some((item) => item.quantity <= 0);
    if (hasInvalidQty) {
      setError("Quantity must be at least 1 for all products.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addLot({
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        items: items,
      });

      if (result.success) {
        setOpen(false);
        // Reset form
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setItems([{ productId: "", quantity: 1, buyingPrice: 0 }]);
        onSuccess();
      } else {
        setError(result.error || "Failed to add lot");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> New Lot
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[800px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-[#1a2340] shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-serif">Purchase New Product Lot</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Record a batch purchase of products. Product stock will be added and buying prices updated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* General Info: Date and Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs sm:text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" /> Date of Purchase
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs sm:text-sm">Description / Note</Label>
                <Input
                  type="text"
                  placeholder="e.g. Import from Turkey, Supplier Invoice #928"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                />
              </div>
            </div>

            {/* Lot Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Products in this Lot</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="rounded-lg border-[#1a2340] hover:bg-white/5 text-blue-400 hover:text-blue-300 text-xs gap-1.5 h-8"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-end bg-[#101935]/40 p-3 sm:p-4 rounded-xl border border-[#1a2340] transition-colors hover:border-[#22305c]"
                  >
                    {/* Product Selection */}
                    <div className="col-span-12 sm:col-span-5 space-y-1.5">
                      <Label className="text-slate-400 text-xs">Product</Label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        className="w-full bg-[#050816] border border-[#1a2340] text-white rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="" disabled>Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-400 text-xs">Qty (pcs)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="bg-[#050816] border-[#1a2340] text-white rounded-xl text-sm h-11"
                      />
                    </div>

                    {/* Buying Price */}
                    <div className="col-span-5 sm:col-span-3 space-y-1.5">
                      <Label className="text-slate-400 text-xs">Unit Cost (৳)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={item.buyingPrice}
                        onChange={(e) => handleItemChange(index, "buyingPrice", e.target.value)}
                        className="bg-[#050816] border-[#1a2340] text-white rounded-xl text-sm h-11"
                      />
                    </div>

                    {/* Total Value / Remove */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-between gap-2 h-11 pb-1">
                      <div className="text-right flex-1 pr-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Subtotal</p>
                        <p className="text-xs font-semibold text-slate-300">
                          ৳ {(item.quantity * item.buyingPrice).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors shrink-0"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 border-t border-[#1a2340] bg-[#070d1e] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
            {/* Totals display */}
            <div className="flex items-center gap-6 justify-between sm:justify-start">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Quantity</p>
                <p className="text-lg font-bold text-slate-300">{calculateTotalQuantity()} pcs</p>
              </div>
              <div className="h-8 w-px bg-[#1a2340] hidden sm:block" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Investment</p>
                <p className="text-lg font-bold text-yellow-400">
                  ৳ {calculateTotalValue().toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="px-6 rounded-xl text-slate-400 hover:bg-white/5 text-sm h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 text-sm h-11 shadow-lg hover:shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Record Purchase
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
