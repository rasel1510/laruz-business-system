"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  X, 
  Phone, 
  Calendar,
  Truck,
  Hash
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
import { getCustomersWithOrders } from "@/lib/actions/orders";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    code: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  cnNumber?: string | null;
  courier?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
}

interface CustomerStats {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | string;
  orders: Order[];
}

// ─── Status Badge styling ────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
  delivered: "bg-green-900/30  text-green-400  border-green-700/30",
  hold:      "bg-purple-900/30 text-purple-400 border-purple-700/30",
  cancelled: "bg-red-900/30    text-red-400    border-red-700/30",
  completed: "bg-green-900/30  text-green-400  border-green-700/30",
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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-[10px] text-white mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStats | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await getCustomersWithOrders();
    setCustomers(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered customers based on search query
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const term = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  // Aggregate statistics for summary cards
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    let totalOrders = 0;
    let totalSpent = 0;

    customers.forEach((c) => {
      totalOrders += c.totalOrders;
      totalSpent += c.totalSpent;
    });

    const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    return {
      totalCustomers,
      totalOrders,
      totalSpent,
      avgSpentPerCustomer,
    };
  }, [customers]);



  return (
    <>
      <section className="flex-1 overflow-y-auto bg-[#0b0e14]">
        {/* TOPBAR */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-4 sm:px-8 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-serif text-white pl-12 lg:pl-0">Customers</h1>
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
              <AvatarFallback className="text-white text-sm">C</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Customers"
              value={stats.totalCustomers.toLocaleString()}
              color="bg-blue-600/80"
              icon={Users}
            />
            <SummaryCard
              label="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              color="bg-purple-600/80"
              icon={ShoppingBag}
            />
            <SummaryCard
              label="Total Spent"
              value={`৳ ${stats.totalSpent.toLocaleString()}`}
              color="bg-emerald-600/80"
              icon={DollarSign}
            />
            <SummaryCard
              label="Avg Spent/Customer"
              value={`৳ ${Math.round(stats.avgSpentPerCustomer).toLocaleString()}`}
              color="bg-amber-600/80"
              icon={TrendingUp}
            />
          </div>

          {/* TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
              <Input
                placeholder="Search by customer name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1f2937] border-none pl-10 h-10 rounded-lg text-white focus-visible:ring-1 focus-visible:ring-blue-500/50"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="h-10 w-10 self-end sm:self-auto rounded-lg bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-white hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Customer Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* TABLE CONTAINER */}
          <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow className="border-[#1f2937] hover:bg-transparent">
                    <TableHead className="text-white text-xs font-semibold py-3 uppercase">Customer Name</TableHead>
                    <TableHead className="text-white text-xs font-semibold uppercase">Phone</TableHead>
                    <TableHead className="text-white text-xs font-semibold uppercase text-center">Total Order</TableHead>
                    <TableHead className="text-white text-xs font-semibold uppercase">Total Spent</TableHead>
                    <TableHead className="text-white text-xs font-semibold uppercase">Last Order Date</TableHead>
                    <TableHead className="text-white text-xs font-semibold uppercase text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-white">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading customers…
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-white text-sm">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer, index) => {
                      const initials = customer.name.slice(0, 2).toUpperCase() || "C";
                      return (
                        <TableRow
                          key={customer.phone + index}
                          className="border-[#1f2937] hover:bg-[#1f2937]/40 transition-colors"
                        >
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 bg-blue-600/20 text-blue-400 border border-blue-500/20">
                                <AvatarFallback className="font-semibold text-xs">{initials}</AvatarFallback>
                              </Avatar>
                              <span className="text-white text-sm font-semibold">{customer.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white text-sm font-mono flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-white" />
                              {customer.phone}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-[#1f2937] text-white border-none font-semibold px-2.5 py-0.5 rounded-full hover:bg-[#1f2937]/80">
                              {customer.totalOrders}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-emerald-400 font-semibold text-sm">
                              ৳ {customer.totalSpent.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white text-xs font-medium flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-white" />
                              {new Date(customer.lastOrderDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                }}
                                className="h-8 w-8 rounded-lg bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 flex items-center justify-center text-blue-400 hover:text-white transition-all duration-200"
                                title="View Customer Orders"
                              >
                                <Eye className="h-4 w-4" />
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

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
        >
          {/* Modal Container */}
          <div className="w-full max-w-3xl bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1f2937] px-6 py-4 bg-[#111827]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-white mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-white" />
                    {selectedCustomer.phone}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                  <span>
                    Total Orders: <strong className="text-white">{selectedCustomer.totalOrders}</strong>
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                  <span>
                    Total Spent: <strong className="text-emerald-400">৳ {selectedCustomer.totalSpent.toLocaleString()}</strong>
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="h-8 w-8 rounded-lg bg-[#1f2937] hover:bg-slate-800 border border-[#2a3547] flex items-center justify-center text-white hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable Order History) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0e14]">
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-white">Order History (Newest First)</p>
                <span className="text-xs text-white font-medium">
                  {selectedCustomer.orders.length} {selectedCustomer.orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              
              {selectedCustomer.orders.length === 0 ? (
                <div className="text-center py-12 text-white text-sm">
                  No orders found for this customer.
                </div>
              ) : (
                [...selectedCustomer.orders]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((order) => {
                    return (
                      <div
                        key={order.id}
                        className="border border-[#1f2937] bg-[#111827] rounded-xl overflow-hidden shadow-md"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#1f2937]/30 border-b border-[#1f2937]">
                          <div className="flex items-center gap-3">
                            <span className="text-blue-400 font-bold text-sm font-mono">{order.orderNumber}</span>
                            <span className="text-white text-xs">|</span>
                            <span className="text-white text-xs flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-white" />
                              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="text-white font-bold text-sm">
                              ৳ {order.totalAmount.toLocaleString()}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>

                        {/* Order Details Body */}
                        <div className="p-4 space-y-4">
                          {/* Courier Details */}
                          {(order.courier || order.cnNumber) && (
                            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-white pb-2.5 border-b border-[#1f2937]">
                              {order.courier && (
                                <span className="flex items-center gap-1.5">
                                  <Truck className="h-3.5 w-3.5 text-white" />
                                  Courier: <strong className="text-white">{order.courier}</strong>
                                </span>
                              )}
                              {order.cnNumber && (
                                <span className="flex items-center gap-1.5">
                                  <Hash className="h-3.5 w-3.5 text-white" />
                                  CN Number: <strong className="text-white">{order.cnNumber}</strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Items Ordered Table */}
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white">Items Ordered</p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="border-b border-[#1f2937] text-white font-semibold">
                                    <th className="pb-2">Product</th>
                                    <th className="pb-2 text-right">Unit Price</th>
                                    <th className="pb-2 text-center">Qty</th>
                                    <th className="pb-2 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item) => (
                                    <tr key={item.id} className="border-b border-[#1f2937]/50 text-white last:border-none">
                                      <td className="py-2.5 font-medium text-white">{item.product.name}</td>
                                      <td className="py-2.5 text-right font-mono">৳ {item.price.toLocaleString()}</td>
                                      <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                                      <td className="py-2.5 text-right font-mono font-semibold text-white">
                                        ৳ {(item.price * item.quantity).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#1f2937] px-6 py-4 bg-[#111827] flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-[#1f2937] hover:bg-[#2a3547] text-white hover:text-white rounded-lg text-sm font-medium transition-all"
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
