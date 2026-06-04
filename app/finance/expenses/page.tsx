"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Receipt,
  TrendingDown,
  DollarSign,
  Calendar,
  Trash2,
  RefreshCw,
  Hash,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { AddExpenseModal } from "@/components/finance/add-expense-modal";
import { getExpenses, deleteExpense } from "@/lib/actions/expenses";

// ─── Summary Card Component ──────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 flex items-center gap-4 shadow-lg hover:border-slate-700/60 transition-all duration-300">
      <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-[10px] text-white mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Expenses Page Component ────────────────────────────────────────────
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const term = search.toLowerCase();
      return exp.itemName.toLowerCase().includes(term);
    });
  }, [expenses, search]);

  // Aggregate statistics for summary cards
  const stats = useMemo(() => {
    const totalCount = expenses.length;
    let totalCost = 0;
    let thisMonthCost = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    expenses.forEach((exp) => {
      const cost = exp.quantity * exp.price;
      totalCost += cost;

      const expDate = new Date(exp.date);
      if (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      ) {
        thisMonthCost += cost;
      }
    });

    const averageCost = totalCount > 0 ? totalCost / totalCount : 0;

    return {
      totalCount,
      totalCost,
      thisMonthCost,
      averageCost,
    };
  }, [expenses]);

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete the expense for "${itemName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteExpense(id);
      if (result.success) {
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      } else {
        alert(result.error || "Failed to delete expense");
      }
    } catch (err) {
      alert("Something went wrong while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[#0b0e14]">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1f2937] px-4 sm:px-8 py-4 sm:py-5">
        <h1 className="text-xl sm:text-2xl font-serif text-white pl-12 lg:pl-0">Expenses</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block rounded-lg bg-[#1f2937] px-3 py-2 text-xs text-white">
            {new Date().toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <Avatar className="h-9 w-9 bg-blue-600">
            <AvatarFallback className="text-white text-sm">EX</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Expenses"
            value={`৳ ${stats.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            color="bg-red-600/80"
            icon={DollarSign}
            sub="Cumulative business costs"
          />
          <SummaryCard
            label="This Month's Spending"
            value={`৳ ${stats.thisMonthCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            color="bg-orange-600/80"
            icon={TrendingDown}
            sub="Recorded this calendar month"
          />
          <SummaryCard
            label="Avg Cost / Transaction"
            value={`৳ ${Math.round(stats.averageCost).toLocaleString()}`}
            color="bg-blue-600/80"
            icon={Receipt}
            sub="Average per ticket cost"
          />
          <SummaryCard
            label="Total Transactions"
            value={stats.totalCount.toLocaleString()}
            color="bg-purple-600/80"
            icon={Hash}
            sub="Total recorded expense logs"
          />
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
            <Input
              placeholder="Search expenses by item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1f2937] border-none pl-10 h-10 rounded-lg text-white focus-visible:ring-1 focus-visible:ring-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Refresh Button */}
            <button
              onClick={fetchExpenses}
              disabled={loading}
              className="h-10 w-10 rounded-lg bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-white hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Expense List"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Add Expense Trigger Modal */}
            <AddExpenseModal onSuccess={fetchExpenses} />
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader>
                <TableRow className="border-[#1f2937] hover:bg-transparent">
                  <TableHead className="text-white text-xs font-semibold py-4 uppercase pl-6">Date</TableHead>
                  <TableHead className="text-white text-xs font-semibold uppercase">Item Name</TableHead>
                  <TableHead className="text-white text-xs font-semibold uppercase text-center">Quantity</TableHead>
                  <TableHead className="text-white text-xs font-semibold uppercase text-right">Unit Price</TableHead>
                  <TableHead className="text-white text-xs font-semibold uppercase text-right">Total Price</TableHead>
                  <TableHead className="text-white text-xs font-semibold uppercase text-center pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-white">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading expenses…
                    </TableCell>
                  </TableRow>
                ) : filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-white text-sm">
                      No expense logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((exp) => {
                    const totalCost = exp.quantity * exp.price;
                    return (
                      <TableRow
                        key={exp.id}
                        className="border-[#1f2937] hover:bg-[#1f2937]/40 transition-colors"
                      >
                        {/* Date */}
                        <TableCell className="py-3.5 pl-6">
                          <span className="text-white text-xs font-semibold flex items-center gap-2 font-mono">
                            <Calendar className="h-3.5 w-3.5 text-white" />
                            {new Date(exp.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>

                        {/* Item Name */}
                        <TableCell>
                          <span className="text-white text-sm font-semibold block max-w-sm truncate">
                            {exp.itemName}
                          </span>
                        </TableCell>

                        {/* Quantity */}
                        <TableCell className="text-center">
                          <Badge className="bg-[#1f2937] text-white border-none font-semibold px-2.5 py-0.5 rounded-full">
                            {exp.quantity}
                          </Badge>
                        </TableCell>

                        {/* Unit Price */}
                        <TableCell className="text-right font-mono text-white">
                          ৳ {exp.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Total Price */}
                        <TableCell className="text-right font-mono font-bold text-emerald-400">
                          ৳ {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Action - Delete Button */}
                        <TableCell className="text-center pr-6">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleDelete(exp.id, exp.itemName)}
                              disabled={deletingId === exp.id}
                              className="h-8 w-8 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 flex items-center justify-center text-red-400 hover:text-white transition-all duration-200 disabled:opacity-50"
                              title="Delete Expense Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
