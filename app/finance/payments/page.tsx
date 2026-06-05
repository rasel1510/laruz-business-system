"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Plus,
  Check,
  X,
  RefreshCw,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPayments,
  addPayment,
  deletePayment,
} from "@/lib/actions/payments";

// ─── Stats Card ─────────────────────────────────────────────────────────────
function StatsCard({
  label,
  value,
  currencyColor = "text-emerald-500",
  valueColor = "text-emerald-500/90"
}: {
  label: string;
  value: string;
  currencyColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg hover:border-slate-700/60 transition-all duration-300 flex-1 min-w-[240px]">
      <p className="text-xs font-semibold text-white">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-2xl font-semibold ${currencyColor}`}>৳</span>
        <span className={`text-2xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add payment modal states
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [formAmount, setFormAmount] = useState("");
  const [formMethod, setFormMethod] = useState("Bkash");
  const [formCourier, setFormCourier] = useState("Carrybee");
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTotal = payments
      .filter((p) => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const bkashTotal = payments
      .filter((p) => p.method.toLowerCase() === "bkash")
      .reduce((sum, p) => sum + p.amount, 0);

    const bankTotal = payments
      .filter((p) => p.method.toLowerCase() === "bank")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      monthlyTotal,
      bkashTotal,
      bankTotal,
    };
  }, [payments]);

  // Reset add form
  const resetAddForm = () => {
    setFormAmount("");
    setFormMethod("Bkash");
    setFormCourier("Carrybee");
    setFormNote("");
    setFormDate(new Date().toISOString().split("T")[0]);
  };

  // Handle add payment
  const handleAddPayment = async () => {
    if (!formAmount || parseFloat(formAmount) <= 0) return;
    setAddSubmitting(true);
    try {
      const result = await addPayment({
        amount: parseFloat(formAmount),
        method: formMethod,
        courier: formCourier,
        note: formNote,
        date: formDate ? new Date(formDate) : new Date(),
      });

      if (result.success) {
        setAddOpen(false);
        resetAddForm();
        fetchPayments();
      } else {
        alert(result.error || "Failed to add payment");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setAddSubmitting(false);
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deletePayment(id);
      if (result.success) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(result.error || "Failed to delete payment");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[#0b0e14] min-h-screen text-white pb-12">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1f2937] px-6 sm:px-8 py-4 sm:py-5">
        <h1 className="text-xl sm:text-2xl font-serif text-white pl-12 lg:pl-0 font-medium">
          Payments
        </h1>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#1f2937] px-3 py-2 text-xs text-white font-mono">
            {new Date().toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <Avatar className="h-9 w-9 bg-blue-600 border border-blue-500/30">
            <AvatarFallback className="text-white text-sm font-bold">L</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* STATS & ACTION BLOCK */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 flex-1">
            <StatsCard
              label="This Month Received"
              value={stats.monthlyTotal.toLocaleString()}
              currencyColor="text-emerald-500"
              valueColor="text-emerald-500/90"
            />
            <StatsCard
              label="via Bkash"
              value={stats.bkashTotal.toLocaleString()}
              currencyColor="text-sky-500"
              valueColor="text-sky-500/90"
            />
            <StatsCard
              label="via Bank"
              value={stats.bankTotal.toLocaleString()}
              currencyColor="text-purple-500"
              valueColor="text-purple-500/90"
            />
          </div>

          <div className="flex items-center gap-2 self-end lg:set-center">
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="h-11 w-11 rounded-xl bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-white hover:text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Add Payment Dialog */}
            <Dialog
              open={addOpen}
              onOpenChange={(v) => {
                setAddOpen(v);
                if (v) resetAddForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="h-11 px-5 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white gap-2 text-sm font-medium transition-all shadow-md">
                  <Plus className="h-4 w-4" /> Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-2rem)] max-w-[460px] bg-[#111827] border border-[#1f2937] text-white p-0 overflow-hidden rounded-2xl shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b border-[#1f2937] flex flex-col justify-center">
                  <DialogTitle className="text-xl font-serif text-white font-medium">
                    Add Payment Received
                  </DialogTitle>
                  <DialogDescription className="text-white text-xs mt-1">
                    Log a payment received from a courier service.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                  {/* Amount Field */}
                  <div className="space-y-2">
                    <Label className="text-white text-xs sm:text-sm font-medium">
                      Amount (৳)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="bg-[#0b0e14] border-[#1f2937] text-white rounded-xl focus:ring-blue-500 h-12 text-sm focus:border-slate-600"
                    />
                  </div>

                  {/* Payment Method + Courier Source */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white text-xs sm:text-sm font-medium">
                        Payment Method
                      </Label>
                      <select
                        value={formMethod}
                        onChange={(e) => setFormMethod(e.target.value)}
                        className="w-full bg-[#0b0e14] border border-[#1f2937] text-white rounded-xl focus:ring-blue-500 focus:border-slate-600 h-12 px-3 text-sm accent-slate-800"
                      >
                        <option value="Bkash">Bkash</option>
                        <option value="Bank">Bank</option>
                        <option value="Cash">Cash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white text-xs sm:text-sm font-medium">
                        Courier Source
                      </Label>
                      <select
                        value={formCourier}
                        onChange={(e) => setFormCourier(e.target.value)}
                        className="w-full bg-[#0b0e14] border border-[#1f2937] text-white rounded-xl focus:ring-blue-500 focus:border-slate-600 h-12 px-3 text-sm"
                      >
                        <option value="Carrybee">Carrybee</option>
                        <option value="Steadfast">Steadfast</option>
                        <option value="Pathao">Pathao</option>
                        <option value="Paperfly">Paperfly</option>
                        <option value="Redx">Redx</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Field */}
                  <div className="space-y-2">
                    <Label className="text-white text-xs sm:text-sm font-medium">
                      Date (Optional)
                    </Label>
                    <Input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="bg-[#0b0e14] border-[#1f2937] text-white rounded-xl focus:ring-blue-500 h-12 text-sm [color-scheme:dark]"
                    />
                  </div>

                  {/* Note Field */}
                  <div className="space-y-2">
                    <Label className="text-white text-xs sm:text-sm font-medium">
                      Note (optional)
                    </Label>
                    <Input
                      placeholder="e.g. Weekly collection"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      className="bg-[#0b0e14] border-[#1f2937] text-white rounded-xl focus:ring-blue-500 h-12 text-sm"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#1f2937]">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAddOpen(false)}
                      className="px-5 h-11 rounded-xl text-white hover:bg-white/5 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPayment}
                      disabled={addSubmitting || !formAmount}
                      className="px-6 h-11 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white gap-2 text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {addSubmitting ? "Saving..." : "✓ Save"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/40 overflow-hidden shadow-lg">
          <Table>
            <TableHeader className="bg-[#111827]">
              <TableRow className="border-[#1f2937] hover:bg-transparent">
                <TableHead className="text-white text-xs font-bold uppercase tracking-wider py-4 pl-6">
                  Date
                </TableHead>
                <TableHead className="text-white text-xs font-bold uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="text-white text-xs font-bold uppercase tracking-wider">
                  Method
                </TableHead>
                <TableHead className="text-white text-xs font-bold uppercase tracking-wider">
                  Courier
                </TableHead>
                <TableHead className="text-white text-xs font-bold uppercase tracking-wider">
                  Note
                </TableHead>
                <TableHead className="text-white text-xs font-bold uppercase tracking-wider text-right pr-6 w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-white border-[#1f2937]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Loading payments…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-white border-[#1f2937]">
                    No payments found. Click &quot;+ Add Payment&quot; to log your first transaction.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => {
                  const formattedDate = new Date(p.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  // Styling method badge
                  const isBkash = p.method.toLowerCase() === "bkash";
                  const isBank = p.method.toLowerCase() === "bank";
                  
                  let badgeClass = "bg-slate-900 text-slate-400 border border-slate-800";
                  if (isBkash) {
                    badgeClass = "bg-[#064e3b]/30 text-[#34d399] border border-[#065f46]/50";
                  } else if (isBank) {
                    badgeClass = "bg-[#3b0764]/30 text-[#c084fc] border border-[#581c87]/50";
                  }

                  return (
                    <TableRow key={p.id} className="border-[#1f2937] hover:bg-[#111827]/30 transition-colors">
                      <TableCell className="py-4 pl-6 text-white font-medium">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-500 font-mono">
                        ৳ {p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                          {p.method}
                        </span>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {p.courier}
                      </TableCell>
                      <TableCell className="text-white italic max-w-xs truncate">
                        {p.note || "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          disabled={deletingId === p.id}
                          className="h-8 w-8 rounded-lg bg-transparent hover:bg-red-500/10 border border-transparent hover:border-red-500/20 flex items-center justify-center text-white hover:text-red-400 transition-all disabled:opacity-50"
                          title="Delete Payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </section>
  );
}
