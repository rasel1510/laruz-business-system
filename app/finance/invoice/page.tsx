"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, FileText, TrendingDown, Wallet } from "lucide-react";
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
import { getOrders } from "@/lib/actions/orders";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  phone?: string | null;
  cnNumber?: string | null;
  courier?: string | null;
  totalAmount: number;
  createdAt: string | Date;
  status: string;
  customer?: { name: string; phone?: string | null } | null;
  advance?: number;
  deliveryCharge?: number;
}

// ─── Delivery charge per courier (BDT) ───────────────────────────────────────
const DELIVERY_CHARGE: Record<string, number> = {
  steadfast: 120,
  carrybee: 120,
  pathao: 60,
  redx: 110,
  sundarban: 130,
  "self delivered": 0,
  other: 120,
};

function getDeliveryCharge(courier?: string | null): number {
  if (!courier) return 120;
  return DELIVERY_CHARGE[courier.toLowerCase()] ?? 120;
}

// Fes = COD - (Delivery Charge + COD * 1%)
function calcFes(cod: number, deliveryCharge: number): number {
  return cod - (deliveryCharge + cod * 0.01);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
  delivered: "bg-green-900/30  text-green-400  border-green-700/30",
  hold:      "bg-purple-900/30 text-purple-400 border-purple-700/30",
  cancelled: "bg-red-900/30    text-red-400    border-red-700/30",
};

function StatusBadge({ status }: { status: string }) {
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[key] ?? "bg-slate-800 text-slate-400 border-slate-700/30"
      }`}
    >
      {status}
    </span>
  );
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
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoicePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Derived values
  const filtered = orders.filter((o) => {
    const name = o.customerName || o.customer?.name || "";
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.cnNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalCOD = filtered.reduce((s, o) => s + o.totalAmount, 0);
  const totalFes = filtered.reduce((s, o) => {
    const dc = getDeliveryCharge(o.courier);
    return s + calcFes(o.totalAmount, dc);
  }, 0);
  const totalDeliveryCharges = filtered.reduce(
    (s, o) => s + getDeliveryCharge(o.courier),
    0
  );

  const STATUSES = ["All", "Pending", "Delivered", "Hold", "Cancelled"];

  return (
    <section className="flex-1 overflow-y-auto bg-[#0b0e14]">
      {/* ── TOPBAR ── */}
      <div className="flex items-center justify-between border-b border-[#1f2937] px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif text-white leading-tight">
              Invoice
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">
              Finance · COD Settlement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block rounded-lg bg-[#1f2937] px-3 py-2 text-xs text-slate-400">
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

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Total COD"
            value={`৳ ${totalCOD.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            sub={`${filtered.length} orders`}
            color="bg-blue-500/80"
            icon={Wallet}
          />
          <SummaryCard
            label="Delivery Charges"
            value={`৳ ${totalDeliveryCharges.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            sub="Courier + 1% platform fee"
            color="bg-orange-500/80"
            icon={TrendingDown}
          />
          <SummaryCard
            label="Net Receivable (Fes)"
            value={`৳ ${totalFes.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            sub="COD − (Delivery + 1%)"
            color="bg-emerald-600/80"
            icon={FileText}
          />
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <Input
              placeholder="Search by name, order ID, CN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1f2937] border-none pl-10 h-10 rounded-lg text-slate-300 focus-visible:ring-1 focus-visible:ring-blue-500/50 placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-[#1f2937] rounded-lg p-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    statusFilter === s
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="h-10 w-10 rounded-lg bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-[#1f2937] hover:bg-transparent bg-[#0d1117]">
                  {/* Column 1 */}
                  <TableHead className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider py-3 pl-5 w-40">
                    <div>Order ID</div>
                    <div className="text-[10px] text-slate-600 font-normal normal-case tracking-normal mt-0.5">
                      CN ID
                    </div>
                  </TableHead>
                  {/* Column 2 */}
                  <TableHead className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    Customer Name
                  </TableHead>
                  {/* Column 3 */}
                  <TableHead className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider w-36">
                    <div>Status</div>
                    <div className="text-[10px] text-slate-600 font-normal normal-case tracking-normal mt-0.5">
                      Order Date
                    </div>
                  </TableHead>
                  {/* Column 4 */}
                  <TableHead className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider text-right pr-5">
                    <div>COD Amount</div>
                    <div className="text-[10px] text-slate-600 font-normal normal-case tracking-normal mt-0.5 text-right">
                      Fes = COD − (Del. + 1%)
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-20 text-slate-600"
                    >
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-500/50" />
                      <p className="text-sm">Loading invoices…</p>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-20 text-slate-600 text-sm"
                    >
                      <FileText className="h-10 w-10 mx-auto mb-3 text-slate-700" />
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => {
                    const name =
                      order.customerName || order.customer?.name || "Walk-in";
                    const deliveryCharge = order.deliveryCharge ?? getDeliveryCharge(order.courier);
                    const cod = order.totalAmount;
                    const advance = order.advance || 0;
                    const fes = calcFes(cod, deliveryCharge);

                    return (
                      <TableRow
                        key={order.id}
                        className="border-[#1f2937] hover:bg-[#1f2937]/40 transition-colors group"
                      >
                        {/* Column 1: Ord ID + CN ID */}
                        <TableCell className="py-2.5 pl-5">
                          <p className="text-blue-400 font-semibold text-sm font-mono">
                            {order.orderNumber}
                          </p>
                          <p className="text-slate-600 text-xs mt-0.5 font-mono">
                            {order.cnNumber || (
                              <span className="text-slate-700 italic">No CN yet</span>
                            )}
                          </p>
                        </TableCell>

                        {/* Column 2: Customer Name */}
                        <TableCell className="py-2.5">
                          <p className="text-white text-sm font-medium">{name}</p>
                          {order.phone || order.customer?.phone ? (
                            <p className="text-slate-600 text-xs mt-0.5">
                              {order.phone || order.customer?.phone}
                            </p>
                          ) : null}
                        </TableCell>

                        {/* Column 3: Status + Date */}
                        <TableCell className="py-2.5">
                          <StatusBadge status={order.status} />
                          <p className="text-slate-600 text-[11px] mt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </TableCell>

                        {/* Column 4: COD + Fes only */}
                        <TableCell className="py-2.5 pr-5 text-right">
                          <p className="text-white font-bold text-sm">
                            ৳{" "}
                            {cod.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                             Adv: ৳{advance.toLocaleString()} · Del: ৳{deliveryCharge.toLocaleString()}
                          </p>
                          <p
                            className={`text-xs font-semibold font-mono mt-0.5 ${
                              fes >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            Fes ৳{" "}
                            {fes.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer row with totals */}
          {!loading && filtered.length > 0 && (
            <div className="border-t border-[#1f2937] bg-[#0d1117] px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="text-slate-300 font-medium">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "invoice" : "invoices"}
              </p>
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Total COD</span>
                  <span className="text-white font-semibold font-mono">
                    ৳{" "}
                    {totalCOD.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="w-px h-4 bg-[#1f2937]" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Net Fes</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    ৳{" "}
                    {totalFes.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formula note */}
        <p className="text-[11px] text-slate-700 text-center">
          Formula:{" "}
          <span className="text-slate-500">
            Fes = COD − (Delivery Charge + COD × 1%)
          </span>
          {" · "}
          Delivery charges vary by courier (Steadfast ৳120 · Pathao ৳60 · RedX ৳110 · Sundarban ৳130 · Self ৳0)
        </p>
      </div>
    </section>
  );
}
