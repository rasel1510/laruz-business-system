"use client";

import { useState, useEffect } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { updateProduct } from "@/lib/actions/inventory";

const editProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  buyingPrice: z.number().min(0, "Price cannot be negative"),
  wholesalePrice: z.number().min(0, "Price cannot be negative"),
  retailPrice: z.number().min(0, "Price cannot be negative"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

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
}

export function EditProductModal({ product, onSuccess }: { product: Product, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockAdj, setStockAdj] = useState(0);

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: product.name,
      buyingPrice: product.buyingPrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      stock: product.stock,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: product.name,
        buyingPrice: product.buyingPrice,
        wholesalePrice: product.wholesalePrice,
        retailPrice: product.retailPrice,
        stock: product.stock,
      });
      setStockAdj(0);
    }
  }, [open, product, form]);

  const onSubmit = async (data: EditProductFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateProduct(product.id, {
        ...data,
        stockAdjustment: stockAdj,
      });
      if (result.success) {
        setOpen(false);
        onSuccess();
      } else {
        alert(result.error);
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
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-[#1a2340]">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            Edit Product <span className="text-blue-400 text-sm font-mono">{product.code}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-400">Product Name</Label>
            <Input
              {...form.register("name")}
              className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Buying (৳)</Label>
              <Input
                type="number"
                {...form.register("buyingPrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Wholesale (৳)</Label>
              <Input
                type="number"
                {...form.register("wholesalePrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Retail (৳)</Label>
              <Input
                type="number"
                {...form.register("retailPrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-[#1a2340]/30 rounded-xl border border-[#1a2340]">
            <div className="grid grid-cols-2 gap-4 items-center">
               <div className="space-y-1">
                 <Label className="text-slate-400">Total Stock</Label>
                 <Input
                   type="number"
                   {...form.register("stock", { valueAsNumber: true })}
                   className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10"
                 />
               </div>
               <div className="text-right">
                 <p className="text-slate-500 text-[10px] uppercase tracking-wider">Final Preview</p>
                 <span className="text-2xl font-bold text-blue-400">
                   {(form.watch("stock") || 0) + stockAdj}
                 </span>
               </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setStockAdj(prev => prev - 1)}
                className="h-10 w-10 rounded-lg border-[#1a2340] bg-[#050816] hover:bg-red-500/10 hover:text-red-500"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 text-center">
                <span className={`text-lg font-mono ${stockAdj > 0 ? 'text-green-500' : stockAdj < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {stockAdj > 0 ? `+${stockAdj}` : stockAdj}
                </span>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Adjustment</p>
              </div>

              <Button 
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setStockAdj(prev => prev + 1)}
                className="h-10 w-10 rounded-lg border-[#1a2340] bg-[#050816] hover:bg-green-500/10 hover:text-green-500"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1a2340]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl text-slate-400 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {isSubmitting ? "Updating..." : <><Check className="h-4 w-4" /> Update Product</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
