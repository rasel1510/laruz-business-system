"use client";

import { useState } from "react";
import { Eye, Calendar, Tag, ShieldCheck, Clipboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LotItem {
  id: string;
  productId: string;
  quantity: number;
  buyingPrice: number;
  product: {
    id: string;
    code: string;
    name: string;
  };
}

interface Lot {
  id: string;
  lotCode: string;
  date: Date | string;
  description: string | null;
  totalValue: number;
  totalQuantity: number;
  items: LotItem[];
}

export function ViewLotModal({ lot, children }: { lot: Lot; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const formattedDate = new Date(lot.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          <button className="text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none transition-all">
            {children}
          </button>
        ) : (
          <button
            className="h-7 w-7 rounded-md bg-[#1f2937]/50 hover:bg-blue-600/20 border border-[#2a3547] hover:border-blue-500/40 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
            title="View lot details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[650px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-[#1a2340] shrink-0">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl sm:text-2xl font-serif">Lot Receipt</DialogTitle>
            <span className="bg-blue-600/20 text-blue-400 font-mono text-xs px-2.5 py-1 rounded-full border border-blue-500/20">
              {lot.lotCode}
            </span>
          </div>
          <DialogDescription className="text-slate-400 text-sm">
            Detailed item breakdown for product lot purchase.
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#101935]/40 border border-[#1a2340] p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-slate-500" /> Date of Lot
              </div>
              <p className="text-sm font-semibold text-slate-200">{formattedDate}</p>
            </div>

            <div className="bg-[#101935]/40 border border-[#1a2340] p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
                <Clipboard className="h-3.5 w-3.5 text-slate-500" /> Notes / Info
              </div>
              <p className="text-sm font-semibold text-slate-200 truncate" title={lot.description || "No note provided"}>
                {lot.description || "—"}
              </p>
            </div>
          </div>

          {/* Product Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Purchased Items</h3>
            <div className="rounded-xl border border-[#1a2340] bg-[#050816]/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-[#1a2340] hover:bg-transparent">
                    <TableHead className="text-slate-400 text-xs py-3">PRODUCT CODE</TableHead>
                    <TableHead className="text-slate-400 text-xs">PRODUCT NAME</TableHead>
                    <TableHead className="text-slate-400 text-xs text-right">UNIT COST</TableHead>
                    <TableHead className="text-slate-400 text-xs text-center">QTY</TableHead>
                    <TableHead className="text-slate-400 text-xs text-right">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lot.items.map((item) => (
                    <TableRow key={item.id} className="border-[#1a2340] hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-xs text-blue-400 py-3">{item.product.code}</TableCell>
                      <TableCell className="text-sm text-slate-200 font-medium">{item.product.name}</TableCell>
                      <TableCell className="text-sm text-slate-300 text-right">
                        ৳ {item.buyingPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-200 text-center font-semibold">
                        {item.quantity} pcs
                      </TableCell>
                      <TableCell className="text-sm text-slate-100 font-bold text-right">
                        ৳ {(item.quantity * item.buyingPrice).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1a2340] bg-[#070d1e] flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Quantity</p>
              <p className="text-base font-bold text-slate-300">{lot.totalQuantity} pcs</p>
            </div>
            <div className="h-6 w-px bg-[#1a2340]" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Investment</p>
              <p className="text-base font-bold text-yellow-400">
                ৳ {lot.totalValue.toLocaleString()}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 rounded-xl border border-[#1a2340] bg-transparent text-slate-400 hover:bg-white/5 hover:text-white text-xs h-9 transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
