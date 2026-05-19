"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/inventory";

interface Product {
  id: string;
  code: string;
  name: string;
}

export function DeleteProductModal({ product, onSuccess }: { product: Product, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        setOpen(false);
        onSuccess();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] bg-[#0b132b] border-[#1a2340] text-white p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-white">Delete Product?</DialogTitle>
            <DialogDescription className="text-slate-400 pt-2 text-sm">
              Are you sure you want to delete <span className="text-white font-semibold">{product.name}</span> (<span className="text-blue-400 font-mono">{product.code}</span>)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full gap-3 pt-3 sm:pt-4">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl text-slate-400 hover:bg-white/5 border border-[#1a2340] text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
