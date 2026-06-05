"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Plus,
  Check,
  X,
  RefreshCw,
  Clock,
  Phone,
  Trash2,
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
  getInvestors,
  addInvestor,
  deleteInvestor,
  addPayment,
  deletePayment,
} from "@/lib/actions/investments";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  investorId: string;
  amount: number;
  date: string | Date;
  note?: string | null;
  createdAt: string | Date;
}

interface Investor {
  id: string;
  name: string;
  phone: string;
  investmentAmount: number;
  profitSharePct: number;
  durationMonths: number | null;
  isSharePartner: boolean;
  createdAt: string | Date;
  payments: Payment[];
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
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
      <div
        className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white">
          {label}
        </p>
        <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-[10px] text-white mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);

  // Add investor modal
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAmount, setFormAmount] = useState("0");
  const [formProfit, setFormProfit] = useState("10");
  const [formDuration, setFormDuration] = useState("12");
  const [formIsInfinity, setFormIsInfinity] = useState(false);

  // Payment history modal
  const [paymentInvestor, setPaymentInvestor] = useState<Investor | null>(null);

  // Record payment modal
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Delete loading
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const data = await getInvestors();
      setInvestors(data as Investor[]);
    } catch (err) {
      console.error("Failed to fetch investors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalInvested = investors.reduce(
      (s, i) => s + i.investmentAmount,
      0
    );
    const totalPaid = investors.reduce(
      (s, i) => s + i.payments.reduce((ps, p) => ps + p.amount, 0),
      0
    );
    const avgProfitShare =
      investors.length > 0
        ? investors.reduce((s, i) => s + i.profitSharePct, 0) /
        investors.length
        : 0;

    return {
      totalInvestors: investors.length,
      totalInvested,
      totalPaid,
      avgProfitShare,
    };
  }, [investors]);

  // ── Reset add form ────────────────────────────────────────────────────────
  const resetAddForm = () => {
    setFormName("");
    setFormPhone("");
    setFormAmount("0");
    setFormProfit("10");
    setFormDuration("12");
    setFormIsInfinity(false);
  };

  // ── Handle add investor ───────────────────────────────────────────────────
  const handleAddInvestor = async () => {
    setAddSubmitting(true);
    try {
      const result = await addInvestor({
        name: formName,
        phone: formPhone,
        investmentAmount: parseFloat(formAmount) || 0,
        profitSharePct: parseFloat(formProfit) || 10,
        durationMonths: formIsInfinity
          ? null
          : parseInt(formDuration) || 12,
        isSharePartner: formIsInfinity,
      });

      if (result.success) {
        setAddOpen(false);
        resetAddForm();
        fetchInvestors();
      } else {
        alert(result.error || "Failed to add investor");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setAddSubmitting(false);
    }
  };

  // ── Handle delete investor ────────────────────────────────────────────────
  const handleDeleteInvestor = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to remove investor "${name}"? All payment records will also be deleted.`
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deleteInvestor(id);
      if (result.success) {
        setInvestors((prev) => prev.filter((i) => i.id !== id));
        if (paymentInvestor?.id === id) setPaymentInvestor(null);
      } else {
        alert(result.error || "Failed to delete investor");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handle record payment ─────────────────────────────────────────────────
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const openRecordPayment = () => {
    setPaymentAmount("");
    setPaymentDate(getTodayString());
    setRecordPaymentOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentInvestor) return;
    setPaymentSubmitting(true);
    try {
      const result = await addPayment({
        investorId: paymentInvestor.id,
        amount: parseFloat(paymentAmount) || 0,
        date: new Date(paymentDate),
      });

      if (result.success) {
        setRecordPaymentOpen(false);
        // Refresh data
        const data = await getInvestors();
        setInvestors(data as Investor[]);
        // Update selected investor reference
        const updated = (data as Investor[]).find(
          (i) => i.id === paymentInvestor.id
        );
        if (updated) setPaymentInvestor(updated);
      } else {
        alert(result.error || "Failed to record payment");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // ── Handle delete payment ─────────────────────────────────────────────────
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Delete this payment record?")) return;
    setDeletingPaymentId(paymentId);
    try {
      const result = await deletePayment(paymentId);
      if (result.success && paymentInvestor) {
        const data = await getInvestors();
        setInvestors(data as Investor[]);
        const updated = (data as Investor[]).find(
          (i) => i.id === paymentInvestor.id
        );
        if (updated) setPaymentInvestor(updated);
      } else if (!result.success) {
        alert(result.error || "Failed to delete payment");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeletingPaymentId(null);
    }
  };

  // ── Compute approx monthly for a given investor ───────────────────────────
  const getApproxMonthly = (inv: Investor) => {
    return (inv.investmentAmount * inv.profitSharePct) / 100;
  };

  const getTotalPaid = (inv: Investor) => {
    return inv.payments.reduce((s, p) => s + p.amount, 0);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <section className="flex-1 overflow-y-auto bg-[#0b0e14]">
        {/* TOPBAR */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-4 sm:px-8 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-serif text-white pl-12 lg:pl-0">
            Investments
          </h1>
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
              <AvatarFallback className="text-white text-sm">L</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-2">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Investors"
              value={stats.totalInvestors.toLocaleString()}
              color="bg-blue-600/80"
              icon={Users}
            />
            <SummaryCard
              label="Total Invested"
              value={`৳ ${stats.totalInvested.toLocaleString()}`}
              color="bg-emerald-600/80"
              icon={DollarSign}

            />
            <SummaryCard
              label="Total Paid Out"
              value={`৳ ${stats.totalPaid.toLocaleString()}`}
              color="bg-amber-600/80"
              icon={TrendingUp}
            />
            <SummaryCard
              label="Avg Profit Share"
              value={`${stats.avgProfitShare.toFixed(1)}%`}
              color="bg-purple-600/80"
              icon={Percent}

            />
          </div>

          {/* TOOLBAR */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button
                onClick={fetchInvestors}
                disabled={loading}
                className="h-10 w-10 rounded-lg bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-white hover:text-white transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              {/* Add Investor Dialog */}
              <Dialog
                open={addOpen}
                onOpenChange={(v) => {
                  setAddOpen(v);
                  if (v) resetAddForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm font-semibold transition-all">
                    <Plus className="h-4 w-4" /> Add Investor
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-[540px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
                  <DialogHeader className="px-5 sm:px-6 py-4 border-b border-[#1a2340] shrink-0">
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                      Add Investor
                    </DialogTitle>
                    <DialogDescription className="text-white text-xs mt-1">
                      Enter the details of the new investment partner.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Name + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white text-xs sm:text-sm font-medium">
                          Name
                        </Label>
                        <Input
                          placeholder="Investor name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white text-xs sm:text-sm font-medium">
                          Phone
                        </Label>
                        <Input
                          placeholder="01XXXXXXXXX"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                        />
                      </div>
                    </div>

                    {/* Amount + Profit Share */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white text-xs sm:text-sm font-medium">
                          Investment Amount (৳)
                        </Label>
                        <Input
                          type="number"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white text-xs sm:text-sm font-medium">
                          Profit Share (%)
                        </Label>
                        <Input
                          type="number"
                          value={formProfit}
                          onChange={(e) => setFormProfit(e.target.value)}
                          className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                        />
                      </div>
                    </div>

                    {/* Duration + Infinity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div className="space-y-2">
                        <Label className="text-white text-xs sm:text-sm font-medium">
                          Duration (Months)
                        </Label>
                        <Input
                          type="number"
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                          disabled={formIsInfinity}
                          className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11 disabled:opacity-40"
                        />
                      </div>
                      <div className="flex items-center gap-3 h-11">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            checked={formIsInfinity}
                            onChange={(e) =>
                              setFormIsInfinity(e.target.checked)
                            }
                            className="w-4.5 h-4.5 rounded border-[#1a2340] bg-[#050816] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
                          />
                          <span className="text-white text-sm font-medium group-hover:text-white transition-colors">
                            Infinity (Share Partner)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#1a2340]">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setAddOpen(false)}
                        className="px-5 rounded-xl text-white hover:bg-white/5 text-sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddInvestor}
                        disabled={addSubmitting || !formName || !formPhone}
                        className="px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {addSubmitting ? (
                          "Saving..."
                        ) : (
                          <>
                            <Check className="h-4 w-4" /> Save Investor
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ── INVESTOR CARDS GRID ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white">
              <RefreshCw className="h-6 w-6 animate-spin mr-3 text-blue-500/50" />
              <span className="text-sm">Loading investors…</span>
            </div>
          ) : investors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white">
              <Users className="h-12 w-12 mb-4 text-white" />
              <p className="text-sm">No investors found.</p>
              <p className="text-xs text-white mt-1">
                Click &quot;+ Add Investor&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {investors.map((investor) => {
                const initials = investor.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                // Alternate avatar color based on index
                const avatarColors = [
                  "bg-blue-600/80 text-blue-200 border-blue-500/30",
                  "bg-amber-600/80 text-amber-200 border-amber-500/30",
                  "bg-emerald-600/80 text-emerald-200 border-emerald-500/30",
                  "bg-purple-600/80 text-purple-200 border-purple-500/30",
                  "bg-rose-600/80 text-rose-200 border-rose-500/30",
                  "bg-cyan-600/80 text-cyan-200 border-cyan-500/30",
                ];
                const colorIdx =
                  investor.name.charCodeAt(0) % avatarColors.length;
                const avatarColor = avatarColors[colorIdx];

                return (
                  <div
                    key={investor.id}
                    className="group rounded-2xl border border-[#1f2937] bg-[#111827] p-5 flex flex-col gap-4 shadow-lg hover:border-blue-500/20 hover:shadow-blue-900/5 transition-all duration-300"
                  >
                    {/* Header: Avatar + Name + Phone */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`h-10 w-10 border ${avatarColor} shrink-0`}
                        >
                          <AvatarFallback className="font-bold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            {investor.name}
                          </p>
                          <p className="text-white text-xs font-mono flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {investor.phone}
                          </p>
                        </div>
                      </div>

                      {/* Delete investor button */}
                      <button
                        onClick={() =>
                          handleDeleteInvestor(investor.id, investor.name)
                        }
                        disabled={deletingId === investor.id}
                        className="h-7 w-7 rounded-lg bg-transparent hover:bg-red-600/10 border border-transparent hover:border-red-500/20 flex items-center justify-center text-white hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Remove Investor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Investment info */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white">
                          Investment
                        </p>
                        <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                          ৳{" "}
                          {investor.investmentAmount.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white">Profit Share</p>
                        <span className="inline-flex items-center rounded-full bg-amber-900/30 text-amber-400 border border-amber-700/30 px-2.5 py-0.5 text-xs font-semibold">
                          {investor.profitSharePct}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white">Duration</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${investor.isSharePartner || !investor.durationMonths
                            ? "bg-purple-900/30 text-purple-400 border-purple-700/30"
                            : "bg-blue-900/30 text-blue-400 border-blue-700/30"
                            }`}
                        >
                          {investor.isSharePartner || !investor.durationMonths
                            ? "∞ Share"
                            : `${investor.durationMonths} months`}
                        </span>
                      </div>
                    </div>

                    {/* Payment History Button */}
                    <button
                      onClick={() => setPaymentInvestor(investor)}
                      className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#1f2937] bg-[#0b0e14] hover:bg-[#1f2937]/60 hover:border-slate-600/40 text-white hover:text-white text-xs font-medium transition-all duration-200"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Payment History
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAYMENT HISTORY MODAL
          ═══════════════════════════════════════════════════════════════════════ */}
      {paymentInvestor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPaymentInvestor(null);
          }}
        >
          <div className="w-full max-w-2xl bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] px-6 py-4 bg-[#111827] shrink-0">
              <h3 className="text-lg font-bold text-white">
                {paymentInvestor.name}{" "}
                <span className="text-white font-normal">
                  — Payment History
                </span>
              </h3>
              <button
                onClick={() => setPaymentInvestor(null)}
                className="h-8 w-8 rounded-lg bg-[#1f2937] hover:bg-slate-800 border border-[#2a3547] flex items-center justify-center text-white hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3 px-6 py-4 bg-[#0b0e14] border-b border-[#1f2937] shrink-0">
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white">
                  Investment
                </p>
                <p className="text-base font-bold text-amber-400 font-mono mt-1">
                  ৳ {paymentInvestor.investmentAmount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white">
                  Approx Monthly
                </p>
                <p className="text-base font-bold text-emerald-400 font-mono mt-1">
                  ৳ {getApproxMonthly(paymentInvestor).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white">
                  Total Paid
                </p>
                <p className="text-base font-bold text-amber-400 font-mono mt-1">
                  ৳ {getTotalPaid(paymentInvestor).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Record Payment Button */}
            <div className="flex justify-end px-6 py-3 bg-[#0b0e14] border-b border-[#1f2937] shrink-0">
              <Dialog
                open={recordPaymentOpen}
                onOpenChange={setRecordPaymentOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={openRecordPayment}
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs font-semibold transition-all border border-blue-500"
                  >
                    <Plus className="h-3.5 w-3.5" /> Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] bg-[#0b132b] border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl shadow-2xl">
                  <DialogHeader className="px-5 py-4 border-b border-[#1a2340]">
                    <DialogTitle className="text-base font-semibold">
                      Record Payment
                    </DialogTitle>
                    <DialogDescription className="text-white text-xs mt-1">
                      Record a profit-share payment for{" "}
                      {paymentInvestor.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white text-xs font-medium">
                        Amount (৳)
                      </Label>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`e.g. ${getApproxMonthly(paymentInvestor).toLocaleString()}`}
                        className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white text-xs font-medium">
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="bg-[#050816] border-[#1a2340] text-white rounded-xl focus:ring-blue-500 h-11 [color-scheme:dark]"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-[#1a2340]">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setRecordPaymentOpen(false)}
                        className="px-4 rounded-xl text-white hover:bg-white/5 text-sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRecordPayment}
                        disabled={paymentSubmitting || !paymentAmount}
                        className="px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {paymentSubmitting ? (
                          "Saving..."
                        ) : (
                          <>
                            <Check className="h-4 w-4" /> Save Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Payment Table (scrollable) */}
            <div className="flex-1 overflow-y-auto bg-[#0b0e14]">
              {paymentInvestor.payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-white">
                  <Clock className="h-10 w-10 mb-3 text-white" />
                  <p className="text-sm">No payments recorded yet.</p>
                </div>
              ) : (
                <div className="px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1f2937] hover:bg-transparent">
                        <TableHead className="text-white text-[11px] font-bold uppercase tracking-wider py-3">
                          Month
                        </TableHead>
                        <TableHead className="text-white text-[11px] font-bold uppercase tracking-wider">
                          Amount
                        </TableHead>
                        <TableHead className="text-white text-[11px] font-bold uppercase tracking-wider">
                          Date
                        </TableHead>
                        <TableHead className="text-white text-[11px] font-bold uppercase tracking-wider text-center w-16">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentInvestor.payments.map((payment) => {
                        const payDate = new Date(payment.date);
                        return (
                          <TableRow
                            key={payment.id}
                            className="border-[#1f2937] hover:bg-[#1f2937]/40 transition-colors"
                          >
                            <TableCell className="text-white text-sm font-medium py-3">
                              {payDate.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-emerald-400 font-bold text-sm font-mono">
                              ৳ {payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-white text-sm">
                              {payDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                onClick={() =>
                                  handleDeletePayment(payment.id)
                                }
                                disabled={deletingPaymentId === payment.id}
                                className="h-7 w-7 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 flex items-center justify-center text-red-400 hover:text-white transition-all duration-200 disabled:opacity-50 mx-auto"
                                title="Delete Payment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#1f2937] px-6 py-4 bg-[#111827] flex justify-end shrink-0">
              <button
                onClick={() => setPaymentInvestor(null)}
                className="px-5 py-2 bg-[#1f2937] hover:bg-[#2a3547] text-white hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
