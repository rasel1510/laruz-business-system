"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Check, ChevronDown } from "lucide-react";
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
  const [nextCode, setNextCode] = useState("Select a category first");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const categoryRef = useRef<HTMLDivElement>(null);

  const [customSubCategories, setCustomSubCategories] = useState<string[]>([]);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const [customSubInput, setCustomSubInput] = useState("");
  const subCategoryRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setDropdownOpen(false);
      setSubDropdownOpen(false);
      setNextCode("Select a category first");
    }
  }, [open]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (subCategoryRef.current && !subCategoryRef.current.contains(event.target as Node)) {
        setSubDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Fetch the next product code whenever the category changes
  const watchedCategory = form.watch("category");
  useEffect(() => {
    if (!open) return;
    const cat = watchedCategory?.trim();
    if (!cat) {
      setNextCode("Select a category first");
      return;
    }
    // Debounce to avoid excessive server calls while typing
    const timer = setTimeout(() => {
      getNextProductCode(cat).then(setNextCode);
    }, 300);
    return () => clearTimeout(timer);
  }, [watchedCategory, open]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addProduct(data);
      if (result.success) {
        // Keep track of custom-written categories locally so they appear in dropdown next time
        const submittedCategory = data.category.trim();
        const defaultCats = ["Earrings", "Necklaces", "Rings", "Bracelets"];
        if (submittedCategory && !defaultCats.includes(submittedCategory) && !customCategories.includes(submittedCategory)) {
          setCustomCategories(prev => [...prev, submittedCategory]);
        }

        // Keep track of custom-written sub-categories locally so they appear in dropdown next time
        const submittedSubCategory = data.subCategory.trim();
        const defaultSubCats = ["Gold", "Silver", "Stone", "Pearl"];
        if (submittedSubCategory && !defaultSubCats.includes(submittedSubCategory) && !customSubCategories.includes(submittedSubCategory)) {
          setCustomSubCategories(prev => [...prev, submittedSubCategory]);
        }

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
      <DialogContent className="w-[calc(100%-2rem)] max-w-[600px] md:max-w-[750px] lg:max-w-[700px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a2340] flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Add New Product</DialogTitle>
          <DialogDescription className="sr-only">
            Enter details for the new product to add it to the inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Product Code */}
          <div className="bg-[#1a2340]/50 p-3 sm:p-4 rounded-xl border border-[#1a2340] flex items-center justify-between">
            <span className="text-slate-400 text-xs sm:text-sm">Product Code (Auto)</span>
            <span className="text-blue-400 font-mono font-bold text-sm sm:text-base">{nextCode}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-xs sm:text-sm">Product Name</Label>
              <Input
                {...form.register("name")}
                placeholder="e.g. Gold Hoop Earrings"
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-10 sm:h-auto"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Category and Sub-category side by side on all screen sizes */}
            <div className="grid grid-cols-2 gap-4 col-span-1 sm:col-span-2">
              <div className="space-y-2 relative" ref={categoryRef}>
                <Label className="text-white text-xs sm:text-sm">Category</Label>
                <div className="relative">
                  <Input
                    placeholder="Type or select category"
                    value={form.watch("category")}
                    onChange={(e) => form.setValue("category", e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                    className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto w-full pr-10 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 z-50 w-full mt-1 bg-[#0b132b] border border-white rounded-xl overflow-hidden shadow-lg max-h-64 flex flex-col">
                    <div className="overflow-y-auto flex-1">
                      {(() => {
                        const defaultCats = ["Earrings", "Necklaces", "Rings", "Bracelets"];
                        const categoryValue = form.watch("category") || "";
                        const allCats = Array.from(new Set([...defaultCats, ...customCategories]));
                        const filtered = allCats.filter(cat =>
                          cat.toLowerCase().includes(categoryValue.toLowerCase())
                        );

                        if (filtered.length > 0) {
                          return filtered.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                form.setValue("category", cat);
                                setDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-blue-600/20 hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              {cat}
                            </button>
                          ));
                        }
                        return (
                          <div className="px-4 py-2 text-sm text-slate-500 italic">
                            No categories match.
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bottom custom category input */}
                    <div
                      className="p-2 border-t border-[#1a2340] bg-[#0d1633] flex gap-2"
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Input
                        placeholder="Add new custom category..."
                        value={customInput}

                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            const val = customInput.trim();
                            const defaultCats = ["Earrings", "Necklaces", "Rings", "Bracelets"];
                            if (val) {
                              if (!customCategories.includes(val) && !defaultCats.includes(val)) {
                                setCustomCategories(prev => [...prev, val]);
                              }
                              form.setValue("category", val);
                              setCustomInput("");
                              setDropdownOpen(false);
                            }
                          }
                        }}
                        className="flex-1 h-8 text-xs bg-[#050816] border-[#1a2340] text-white rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const val = customInput.trim();
                          const defaultCats = ["Earrings", "Necklaces", "Rings", "Bracelets"];
                          if (val) {
                            if (!customCategories.includes(val) && !defaultCats.includes(val)) {
                              setCustomCategories(prev => [...prev, val]);
                            }
                            form.setValue("category", val);
                            setCustomInput("");
                            setDropdownOpen(false);
                          }
                        }}
                        className="h-8 text-xs px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
                {form.formState.errors.category && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2 relative" ref={subCategoryRef}>
                <Label className="text-white text-xs sm:text-sm">Sub-Category</Label>
                <div className="relative">
                  <Input
                    placeholder="Type or select sub-cat"
                    value={form.watch("subCategory")}
                    onChange={(e) => form.setValue("subCategory", e.target.value)}
                    onFocus={() => setSubDropdownOpen(true)}
                    className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto w-full pr-10 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSubDropdownOpen((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {subDropdownOpen && (
                  <div className="absolute top-full left-0 z-50 w-full mt-1 bg-[#0b132b] border border-white rounded-xl overflow-hidden shadow-lg max-h-64 flex flex-col">
                    <div className="overflow-y-auto flex-1">
                      {(() => {
                        const defaultSubCats = ["Gold", "Silver", "Stone", "Pearl"];
                        const subCategoryValue = form.watch("subCategory") || "";
                        const allSubCats = Array.from(new Set([...defaultSubCats, ...customSubCategories]));
                        const filtered = allSubCats.filter(subCat =>
                          subCat.toLowerCase().includes(subCategoryValue.toLowerCase())
                        );

                        if (filtered.length > 0) {
                          return filtered.map((subCat) => (
                            <button
                              key={subCat}
                              type="button"
                              onClick={() => {
                                form.setValue("subCategory", subCat);
                                setSubDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-blue-600/20 hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              {subCat}
                            </button>
                          ));
                        }
                        return (
                          <div className="px-4 py-2 text-sm text-slate-500 italic">
                            No sub-categories match.
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bottom custom sub-category input */}
                    <div
                      className="p-2 border-t border-[#1a2340] bg-[#0d1633] flex gap-2"
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Input
                        placeholder="Add new custom sub-cat..."
                        value={customSubInput}
                        onChange={(e) => setCustomSubInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            const val = customSubInput.trim();
                            const defaultSubCats = ["Gold", "Silver", "Stone", "Pearl"];
                            if (val) {
                              if (!customSubCategories.includes(val) && !defaultSubCats.includes(val)) {
                                setCustomSubCategories(prev => [...prev, val]);
                              }
                              form.setValue("subCategory", val);
                              setCustomSubInput("");
                              setSubDropdownOpen(false);
                            }
                          }
                        }}
                        className="flex-1 h-8 text-xs bg-[#050816] border-[#1a2340] text-white rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const val = customSubInput.trim();
                          const defaultSubCats = ["Gold", "Silver", "Stone", "Pearl"];
                          if (val) {
                            if (!customSubCategories.includes(val) && !defaultSubCats.includes(val)) {
                              setCustomSubCategories(prev => [...prev, val]);
                            }
                            form.setValue("subCategory", val);
                            setCustomSubInput("");
                            setSubDropdownOpen(false);
                          }
                        }}
                        className="h-8 text-xs px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
                {form.formState.errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.subCategory.message}</p>
                )}
              </div>
            </div>
          </div>


          {/* Initial Stock and Product Picture side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-xs sm:text-sm">Initial Stock</Label>
              <Input
                type="number"
                {...form.register("stock", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs sm:text-sm">Product Picture</Label>
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
              <Label className="text-white text-[10px] sm:text-sm">Buying (৳)</Label>
              <Input
                type="number"
                {...form.register("buyingPrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-[10px] sm:text-sm">Wholesale (৳)</Label>
              <Input
                type="number"
                {...form.register("wholesalePrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-[10px] sm:text-sm">Retail (৳)</Label>
              <Input
                type="number"
                {...form.register("retailPrice", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl h-10 sm:h-auto text-sm"
              />
            </div>
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
