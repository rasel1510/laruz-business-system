"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Edit2, FileText, Check, X, ChevronDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getOrders, updateOrder } from "@/lib/actions/orders";

// ─── Types ───────────────────────────────────────────────────────────────────
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
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUSES = ["Pending", "Hold", "Delivered", "Cancelled"];
const COURIERS = ["Self Delivered", "Steadfast", "Carrybee", "Pathao", "RedX", "Sundarban", "Other"];

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
  delivered: "bg-green-900/30  text-green-400  border-green-700/30",
  hold:      "bg-purple-900/30 text-purple-400 border-purple-700/30",
  cancelled: "bg-red-900/30    text-red-400    border-red-700/30",
  completed: "bg-green-900/30  text-green-400  border-green-700/30",
};

const COURIER_STYLES: Record<string, string> = {
  steadfast:       "bg-blue-900/30   text-blue-400   border-blue-700/30",
  carrybee:        "bg-purple-900/30 text-purple-400 border-purple-700/30",
  pathao:          "bg-orange-900/30 text-orange-400 border-orange-700/30",
  "self delivered": "bg-slate-800    text-slate-400  border-slate-700/30",
};

const StatusBadge = ({ status }: { status: string }) => {
  const key = (status || "").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[key] ?? "bg-slate-800 text-slate-400 border-slate-700/30"}`}>
      {status}
    </span>
  );
};

const CourierBadge = ({ courier }: { courier?: string | null }) => {
  if (!courier || courier === "—") return <span className="text-slate-600">—</span>;
  const key = courier.toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COURIER_STYLES[key] ?? "bg-slate-800 text-slate-400 border-slate-700/30"}`}>
      {courier}
    </span>
  );
};

// ─── Small pill-select inside the modal ──────────────────────────────────────
function OptionGroup<T extends string>({
  label, options, value, onChange, styleMap,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  styleMap?: Record<string, string>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          const key = opt.toLowerCase();
          const colorClass = styleMap?.[key] ?? "bg-slate-800 text-slate-300 border-slate-700";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt as T)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? `${colorClass} ring-2 ring-white/20 scale-105`
                  : "bg-transparent border-[#2a3547] text-slate-500 hover:text-slate-300 hover:border-slate-500"
              }`}
            >
              {active && <Check className="inline h-3 w-3 mr-1 -mt-0.5" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditOrderModal({
  order,
  onClose,
  onSaved,
}: {
  order: Order;
  onClose: () => void;
  onSaved: (updated: Partial<Order>) => void;
}) {
  const [status, setStatus] = useState(order.status || "Pending");
  const [courier, setCourier] = useState(order.courier || "Self Delivered");
  const [cnNumber, setCnNumber] = useState(order.cnNumber || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateOrder(order.id, { status, courier, cnNumber });
    setSaving(false);
    if (result.success) {
      onSaved({ status, courier, cnNumber });
      onClose();
    } else {
      setError(result.error || "Failed to save.");
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal box */}
      <div className="w-full max-w-sm bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#1f2937]">
          <div>
            <h2 className="text-sm font-semibold text-white">Edit Order</h2>
            <p className="text-xs text-blue-400 font-mono mt-0.5">{order.orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg border border-[#2a3547] flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">

          {/* Status */}
          <OptionGroup
            label="Status"
            options={STATUSES as any}
            value={status as any}
            onChange={setStatus as any}
            styleMap={STATUS_STYLES}
          />

          {/* Courier */}
          <OptionGroup
            label="Courier Service"
            options={COURIERS as any}
            value={courier as any}
            onChange={setCourier as any}
            styleMap={COURIER_STYLES}
          />

          {/* CN Number */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">CN Number</p>
            <input
              type="text"
              value={cnNumber}
              onChange={(e) => setCnNumber(e.target.value)}
              placeholder="e.g. SS-2847391"
              className="w-full bg-[#0d1117] border border-[#2a3547] rounded-lg px-3 h-9 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/70 hover:border-[#3a4557] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#1f2937] bg-[#0d1117]">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-sm rounded-lg border border-[#2a3547] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <><span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Check className="h-3.5 w-3.5" /> Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data as any);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Optimistic update: patch the row locally without a full refetch
  const handleSaved = (id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const filtered = orders.filter((o) => {
    const name = o.customerName || o.customer?.name || "";
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.cnNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <>
      <section className="flex-1 overflow-y-auto bg-[#0b0e14]">
        {/* TOPBAR */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-4 sm:px-8 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-serif text-white pl-12 lg:pl-0">Orders</h1>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block rounded-lg bg-[#1f2937] px-3 py-2 text-xs text-slate-400">
              {new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </div>
            <Avatar className="h-9 w-9 bg-blue-600">
              <AvatarFallback className="text-white text-sm">L</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          {/* TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input
                placeholder="Search by name, number, CN…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1f2937] border-none pl-10 h-10 rounded-lg text-slate-300 focus-visible:ring-1 focus-visible:ring-blue-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg bg-[#1f2937] border-none text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
              >
                <option>All Status</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>

              {/* Refresh */}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="h-10 w-10 rounded-lg bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* New Order */}
              <Link href="/orders/create">
                <Button className="h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 gap-1.5 text-sm font-medium">
                  <Plus className="h-4 w-4" /> New Order
                </Button>
              </Link>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow className="border-[#1f2937] hover:bg-transparent">
                    <TableHead className="text-slate-500 text-xs font-semibold py-3 uppercase">ORDER ID</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">CUSTOMER</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">PHONE</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">CN NUMBER</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">COURIER</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">TOTAL</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">DATE</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">STATUS</TableHead>
                    <TableHead className="text-slate-500 text-xs font-semibold uppercase">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16 text-slate-600">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading orders…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16 text-slate-600 text-sm">
                        No orders found.{" "}
                        <Link href="/orders/create" className="text-blue-400 hover:underline">Create one?</Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((order) => {
                      const name = order.customerName || order.customer?.name || "Walk-in";
                      const phone = order.phone || order.customer?.phone || "—";
                      return (
                        <TableRow
                          key={order.id}
                          className="border-[#1f2937] hover:bg-[#1f2937]/40 transition-colors"
                        >
                          <TableCell className="py-3.5">
                            <span className="text-blue-400 font-medium text-sm">{order.orderNumber}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white text-sm font-medium">{name}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-400 text-sm">{phone}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-400 text-sm">{order.cnNumber || "—"}</span>
                          </TableCell>
                          <TableCell>
                            <CourierBadge courier={order.courier} />
                          </TableCell>
                          <TableCell>
                            <span className="text-white font-semibold text-sm">৳ {order.totalAmount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-400 text-xs">
                              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* ── Edit Button ── */}
                              <button
                                onClick={() => setEditingOrder(order)}
                                className="h-7 w-7 rounded-md bg-[#1f2937] hover:bg-blue-600/20 border border-[#2a3547] hover:border-blue-500/40 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"
                                title="Edit order"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {/* ── Receipt Button ── */}
                              <button
                                className="h-7 w-7 rounded-md bg-[#1f2937] hover:bg-slate-700 border border-[#2a3547] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
                                title="View receipt"
                              >
                                <FileText className="h-3.5 w-3.5" />
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

      {/* EDIT MODAL */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={(patch) => {
            handleSaved(editingOrder.id, patch);
          }}
        />
      )}
    </>
  );
}
