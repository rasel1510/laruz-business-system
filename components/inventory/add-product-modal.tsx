"use client";

import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadButton } from "@/lib/uploadthing";
import { addProduct, getNextProductCode } from "@/lib/actions/inventory";
import Image from "next/image";
import { X } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  buyingPrice: z.number().min(0, "Price cannot be negative"),
  wholesalePrice: z.number().min(0, "Price cannot be negative"),
  retailPrice: z.number().min(0, "Price cannot be negative"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function AddProductModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextCode, setNextCode] = useState("#PRD-XXXX");

  useEffect(() => {
    if (open) {
      getNextProductCode().then(setNextCode);
    }
  }, [open]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      subCategory: "",
      buyingPrice: 0,
      wholesalePrice: 0,
      retailPrice: 0,
      stock: 0,
      image: "",
    },
  });

  const imageUrl = form.watch("image");

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addProduct(data);
      if (result.success) {
        setOpen(false);
        form.reset();
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
        <Button className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> <span className="hidden xs:inline">Add</span> Product
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[600px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a2340] flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Add New Product</DialogTitle>
          <DialogDescription className="sr-only">
            Enter details for the new product to add it to the inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Product Code (Auto) */}
          <div className="bg-[#1a2340]/50 p-3 sm:p-4 rounded-xl border border-[#1a2340] flex items-center justify-between">
            <span className="text-slate-400 text-xs sm:text-sm">Product Code (Auto)</span>
            <span className="text-blue-400 font-mono font-bold text-sm sm:text-base">{nextCode}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs sm:text-sm">Product Name</Label>
              <Input
                {...form.register("name")}
                placeholder="e.g. Gold Hoop Earrings"
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-10 sm:h-auto"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs sm:text-sm">Category</Label>
              <Select onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger className="bg-[#050816] border-[#1a2340] rounded-xl h-10 sm:h-auto">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b132b] border-[#1a2340] text-white">
                  <SelectItem value="Earrings">Earrings</SelectItem>
                  <SelectItem value="Necklaces">Necklaces</SelectItem>
                  <SelectItem value="Rings">Rings</SelectItem>
                  <SelectItem value="Bracelets">Bracelets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs sm:text-sm">Sub-Category</Label>
              <Select onValueChange={(v) => form.setValue("subCategory", v)}>
                <SelectTrigger className="bg-[#050816] border-[#1a2340] rounded-xl h-10 sm:h-auto">
                  <SelectValue placeholder="Select Sub-Cat" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b132b] border-[#1a2340] text-white">
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Stone">Stone</SelectItem>
                  <SelectItem value="Pearl">Pearl</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs sm:text-sm">Product Picture</Label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden border border-[#1a2340]">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => form.setValue("image", "")}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      form.setValue("image", res[0].ufsUrl);
                    }}
                    onUploadError={(error: Error) => {
                      alert(`ERROR! ${error.message}`);
                    }}
                    appearance={{
                      button: "bg-blue-600/10 text-blue-400 border border-blue-600/20 text-xs h-10 px-4",
                      allowedContent: "hidden"
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] sm:text-sm">Buying (৳)</Label>
              <Input
                type="number"
                {...form.register("buyingPrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] sm:text-sm">Wholesale (৳)</Label>
              <Input
                type="number"
                {...form.register("wholesalePrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] sm:text-sm">Retail (৳)</Label>
              <Input
                type="number"
                {...form.register("retailPrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400 text-xs sm:text-sm">Initial Stock</Label>
            <Input
              type="number"
              {...form.register("stock", { valueAsNumber: true })}
              className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 sm:pt-4 border-t border-[#1a2340]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="px-4 sm:px-6 rounded-xl text-slate-400 hover:bg-white/5 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm"
            >
              {isSubmitting ? "Adding..." : <><Check className="h-4 w-4" /> Add Product</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
