"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Calendar, X, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addLot, getNextLotCode } from "@/lib/actions/lots";

interface Product {
  id: string;
  code: string;
  name: string;
  buyingPrice: number;
}

interface LotItemInput {
  productId: string;
  quantity: number;
  qtyType: string;
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
  const [lotCode, setLotCode] = useState("#LOT-001");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [items, setItems] = useState<LotItemInput[]>([
    { productId: "", quantity: 1, qtyType: "Piece", buyingPrice: 0 },
  ]);

  // Fetch the next auto-incremented lot code when modal opens
  useEffect(() => {
    if (open) {
      const fetchLotCode = async () => {
        const code = await getNextLotCode();
        setLotCode(code);
      };
      fetchLotCode();
    }
  }, [open]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1, qtyType: "Piece", buyingPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      setItems([{ productId: "", quantity: 1, qtyType: "Piece", buyingPrice: 0 }]);
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
    } else if (field === "qtyType") {
      updated[index].qtyType = value;
    } else if (field === "quantity") {
      updated[index].quantity = Math.max(0, parseInt(value) || 0);
    } else if (field === "buyingPrice") {
      updated[index].buyingPrice = Math.max(0, parseFloat(value) || 0);
    }
    setItems(updated);
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
        setItems([{ productId: "", quantity: 1, qtyType: "Piece", buyingPrice: 0 }]);
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
        <Button className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> New Lot
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="w-[calc(100%-2rem)] max-w-[650px] md:max-w-[850px] lg:max-w-[950px] bg-[#0b132b] border border-[#1e294b] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Accessible Dialog Title & Description */}
        <div className="sr-only">
          <DialogDescription>
            Form to add details for a new product lot purchase.
          </DialogDescription>
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e294b] shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-serif text-slate-100 flex items-center gap-2">
            New Lot <span className="text-slate-400 font-sans font-normal">—</span> <span className="text-blue-400 font-sans font-medium">{lotCode}</span>
          </DialogTitle>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* General Info Grid: Date & Lot Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500 text-xs sm:text-sm font-medium tracking-wide">Purchase Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#0f172a] border border-[#1e294b] text-white rounded-xl focus:ring-blue-500/50 focus:border-blue-500 h-11 w-full pl-3 pr-10 text-sm font-light placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 text-xs sm:text-sm font-medium tracking-wide">Lot Code (Auto)</Label>
                <Input
                  type="text"
                  disabled
                  value={lotCode}
                  className="bg-[#0f172a] border border-[#1e294b] text-slate-300 font-semibold rounded-xl h-11 w-full px-3 text-sm cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Lot Description / Note */}
            <div className="space-y-2">
              <Label className="text-slate-500 text-xs sm:text-sm font-medium tracking-wide">Description / Note (Optional)</Label>
              <Input
                type="text"
                placeholder="e.g. Supplier Invoice #928, Import shipment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#0f172a] border border-[#1e294b] text-white rounded-xl focus:ring-blue-500/50 focus:border-blue-500 h-11 w-full px-3 text-sm placeholder-slate-600"
              />
            </div>

            {/* ITEMS IN LOT CONTAINER */}
            <div className="border border-[#1e294b] bg-[#0d1527]/40 p-4 sm:p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Items in Lot</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="rounded-xl border border-[#1e294b] bg-[#11192e] hover:bg-[#16223f] text-[#94a3b8] hover:text-white text-xs gap-1.5 h-9 px-4 transition-all shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>

              {/* Table Headers */}
              <div className="grid grid-cols-12 gap-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden sm:grid">
                <div className="col-span-5">Product</div>
                <div className="col-span-3">Qty Type</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price (৳)</div>
              </div>

              {/* Items List Rows */}
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center bg-[#11192f]/60 p-3 sm:p-2 rounded-xl border border-[#1e294b] transition-all hover:border-slate-800"
                  >
                    {/* Product Selector */}
                    <div className="col-span-12 sm:col-span-5 space-y-1 sm:space-y-0">
                      <Label className="text-slate-500 text-[10px] uppercase font-bold sm:hidden block mb-1">Product</Label>
                      <div className="relative">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full appearance-none bg-[#090d16] border border-[#1e294b] text-white rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer pr-10"
                        >
                          <option value="" disabled>Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Qty Type Dropdown */}
                    <div className="col-span-12 sm:col-span-3 space-y-1 sm:space-y-0">
                      <Label className="text-slate-500 text-[10px] uppercase font-bold sm:hidden block mb-1">Qty Type</Label>
                      <div className="relative">
                        <select
                          value={item.qtyType}
                          onChange={(e) => handleItemChange(index, "qtyType", e.target.value)}
                          className="w-full appearance-none bg-[#090d16] border border-[#1e294b] text-white rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer pr-10"
                        >
                          <option value="Piece">Piece</option>
                          <option value="Weight">Weight</option>
                          <option value="Pack">Pack</option>
                          <option value="Box">Box</option>
                          <option value="Dozen">Dozen</option>
                          <option value="Kg">Kg</option>
                          <option value="Gram">Gram</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Qty Input */}
                    <div className="col-span-6 sm:col-span-2 space-y-1 sm:space-y-0">
                      <Label className="text-slate-500 text-[10px] uppercase font-bold sm:hidden block mb-1">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="bg-[#090d16] border border-[#1e294b] text-white rounded-xl text-sm h-11 w-full px-3"
                      />
                    </div>

                    {/* Price Input & Delete row */}
                    <div className="col-span-6 sm:col-span-2 space-y-1 sm:space-y-0 flex items-center gap-2">
                      <div className="flex-1">
                        <Label className="text-slate-500 text-[10px] uppercase font-bold sm:hidden block mb-1">Price (৳)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={item.buyingPrice}
                          onChange={(e) => handleItemChange(index, "buyingPrice", e.target.value)}
                          className="bg-[#090d16] border border-[#1e294b] text-white rounded-xl text-sm h-11 w-full px-3"
                        />
                      </div>
                      
                      {/* Delete item row button */}
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2.5 mt-5 sm:mt-0 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-[#1e294b] bg-[#070d1e] flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl border border-[#1e294b] bg-transparent text-[#94a3b8] hover:bg-white/5 hover:text-white font-medium text-sm h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 text-sm h-11 shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Save Lot
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
