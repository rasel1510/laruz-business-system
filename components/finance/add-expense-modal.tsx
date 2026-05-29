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
import { addExpense } from "@/lib/actions/expenses";

const expenseFormSchema = z.object({
  itemName: z.string().min(2, "Item Name must be at least 2 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0.01, "Price must be greater than zero"),
  date: z.string().min(1, "Date is required"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function AddExpenseModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get today's date in YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      itemName: "",
      quantity: 1,
      price: 0,
      date: getTodayString(),
    },
  });

  // Reset the form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        itemName: "",
        quantity: 1,
        price: 0,
        date: getTodayString(),
      });
    }
  }, [open, form]);

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addExpense({
        itemName: data.itemName,
        quantity: data.quantity,
        price: data.price,
        date: new Date(data.date),
      });

      if (result.success) {
        setOpen(false);
        form.reset();
        onSuccess();
      } else {
        alert(result.error || "Failed to add expense");
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
        <Button className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs sm:text-sm font-semibold transition-all">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a2340] shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Record New Expense</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            Fill in the details below to record a business expense transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Item Name */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs sm:text-sm font-medium">Item Name</Label>
            <Input
              {...form.register("itemName")}
              placeholder="e.g. Courier Charges, Office Rent, Packaging Boxes"
              className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
            />
            {form.formState.errors.itemName && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.itemName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs sm:text-sm font-medium">Quantity</Label>
              <Input
                type="number"
                {...form.register("quantity", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
              />
              {form.formState.errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs sm:text-sm font-medium">Price / Unit Price (৳)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
                className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
              />
              {form.formState.errors.price && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs sm:text-sm font-medium">Date</Label>
            <Input
              type="date"
              {...form.register("date")}
              className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11 [color-scheme:dark]"
            />
            {form.formState.errors.date && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Total Calculation Preview */}
          {form.watch("quantity") > 0 && form.watch("price") > 0 && (
            <div className="bg-[#1a2340]/40 p-4 rounded-xl border border-[#1a2340] flex items-center justify-between">
              <span className="text-slate-400 text-xs sm:text-sm font-medium">Total Estimate</span>
              <span className="text-emerald-400 font-bold text-base sm:text-lg">
                ৳ {(form.watch("quantity") * form.watch("price")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1a2340]">
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
              className="px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm font-semibold transition-all"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Check className="h-4 w-4" /> Save Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
