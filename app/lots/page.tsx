"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Search, Boxes } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getLots } from "@/lib/actions/lots";
import { getProducts } from "@/lib/actions/inventory";
import { AddLotModal } from "@/components/lots/add-lot-modal";
import { ViewLotModal } from "@/components/lots/view-lot-modal";

interface Product {
  id: string;
  code: string;
  name: string;
  buyingPrice: number;
}

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

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  // Set formatted date on mount to prevent hydration mismatch
  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lotsData, productsData] = await Promise.all([
        getLots(),
        getProducts(),
      ]);
      setLots(lotsData as any);
      setProducts(productsData as any);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter lots based on lot code or description
  const filteredLots = lots.filter((lot) => {
    const codeMatch = lot.lotCode.toLowerCase().includes(search.toLowerCase());
    const descMatch = (lot.description || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return codeMatch || descMatch;
  });

  // Calculate statistics
  const totalInvested = lots.reduce((acc, lot) => acc + lot.totalValue, 0);
  const latestLotCode = lots[0]?.lotCode || "—";

  return (
    <section className="flex-1 overflow-y-auto bg-[#040b1f] text-slate-100">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1a2340] px-4 py-4 sm:px-6 md:px-8 md:py-5">
        <h1 className="text-2xl sm:text-3xl font-serif pl-12 lg:pl-0">Lots</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {formattedDate && (
            <div className="hidden sm:block rounded-xl border border-[#1a2340] bg-[#0b132b] px-3 py-2 md:px-4 text-xs md:text-sm text-slate-300">
              {formattedDate}
            </div>
          )}
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-blue-500">
            <AvatarFallback className="bg-blue-600 text-sm text-white font-semibold">L</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <p className="text-slate-400 text-sm sm:text-base mb-6">
          Track your product lot purchases
        </p>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Card 1: TOTAL LOTS */}
          <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b]/80 py-4 px-5 sm:py-4 sm:px-6 shadow-xl transition-all hover:border-blue-500/30">
            <p className="text-[10px] sm:text-xs uppercase tracking-[2px] text-slate-500 font-bold mb-1">
              Total Lots
            </p>
            <p className="text-3xl sm:text-4xl font-semibold text-blue-500">
              {lots.length}
            </p>
          </div>

          {/* Card 2: TOTAL INVESTED */}
          <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b]/80 py-4 px-5 sm:py-4 sm:px-6 shadow-xl transition-all hover:border-yellow-500/30">
            <p className="text-[10px] sm:text-xs uppercase tracking-[2px] text-slate-500 font-bold mb-1">
              Total Invested
            </p>
            <p className="text-3xl sm:text-4xl font-serif text-yellow-500 font-medium">
              ৳ {totalInvested.toLocaleString()}
            </p>
          </div>

          {/* Card 3: LATEST LOT */}
          <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b]/80 py-4 px-5 sm:py-4 sm:px-6 shadow-xl transition-all hover:border-slate-500/30 col-span-1 sm:col-span-2 md:col-span-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-[2px] text-slate-500 font-bold mb-1">
              Latest Lot
            </p>
            <p className="text-3xl sm:text-4xl font-serif text-slate-200">
              {latestLotCode}
            </p>
          </div>
        </div>

        {/* SEARCH AND ADD LOT TOOLBAR */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search lots by code or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0b132b] border-[#1a2340] pl-10 h-11 sm:h-12 rounded-xl text-slate-300 placeholder:text-slate-600 focus:ring-blue-500 w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={loading}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl border-[#1a2340] bg-transparent text-slate-300 hover:bg-white/5 shrink-0"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <AddLotModal products={products} onSuccess={fetchData} />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="rounded-2xl border border-[#1a2340] bg-[#0b132b] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[800px] sm:min-w-full">
              <TableHeader className="bg-white/5">
                <TableRow className="border-[#1a2340] hover:bg-transparent">
                  <TableHead className="text-slate-400 text-xs py-5 uppercase tracking-wider pl-6">
                    Lot Code
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Products
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Total Qty
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider">
                    Total Value
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider text-center pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                      Loading lot history...
                    </TableCell>
                  </TableRow>
                ) : filteredLots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-500 text-sm">
                      <Boxes className="h-8 w-8 mx-auto mb-3 text-slate-600" />
                      No lots found. Record your first lot purchase to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLots.map((lot) => {
                    const dateObj = new Date(lot.date);
                    const formattedLotDate = dateObj.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <TableRow
                        key={lot.id}
                        className="border-[#1a2340] hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="font-bold text-blue-400 font-mono py-5 pl-6 font-semibold">
                          <ViewLotModal lot={lot}>{lot.lotCode}</ViewLotModal>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formattedLotDate}
                        </TableCell>
                        <TableCell className="text-slate-200 font-medium">
                          {lot.items.length === 1
                            ? "1 product"
                            : `${lot.items.length} products`}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {lot.totalQuantity} pcs
                        </TableCell>
                        <TableCell className="text-yellow-500 font-medium">
                          ৳ {lot.totalValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <div className="flex items-center justify-center">
                            <ViewLotModal lot={lot} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
