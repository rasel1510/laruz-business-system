"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  RefreshCw,
  Search,
  ShoppingCart,
  Receipt,
  Wallet,
  TrendingUp,
  Boxes,
  HelpCircle,
  Database,
  Trash2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getActivityLogs } from "@/lib/actions/logs";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function renderDetailsText(details: string) {
  let content: React.ReactNode = details;
  
  if (details.includes("status → Delivered")) {
    const parts = details.split("status → Delivered");
    content = (
      <>
        {parts[0]}status → <span className="text-[#10b981] font-semibold">Delivered</span>{parts[1]}
      </>
    );
  } else if (details.includes("status → Cancelled")) {
    const parts = details.split("status → Cancelled");
    content = (
      <>
        {parts[0]}status → <span className="text-[#ef4444] font-semibold">Cancelled</span>{parts[1]}
      </>
    );
  }
  
  return <span>{content}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getActivityLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        categoryFilter === "ALL" ||
        (categoryFilter === "FINANCE" && ["EXPENSES", "PAYMENTS", "INVESTMENTS"].includes(log.category)) ||
        log.category === categoryFilter;

      const matchesAction =
        actionFilter === "ALL" ||
        (actionFilter === "ADD" && log.action === "CREATE") ||
        (actionFilter === "EDIT" && log.action === "UPDATE") ||
        (actionFilter === "DELETE" && log.action === "DELETE") ||
        (actionFilter === "STATUS" && log.details.toLowerCase().includes("status"));

      return matchesSearch && matchesCategory && matchesAction;
    });
  }, [logs, searchQuery, categoryFilter, actionFilter]);

  // Compute stats for charts and cards
  const stats = useMemo(() => {
    const ordersCount = logs.filter((l) => l.category === "ORDERS").length;
    const expensesCount = logs.filter((l) => l.category === "EXPENSES").length;
    const paymentsCount = logs.filter((l) => l.category === "PAYMENTS").length;
    const investmentsCount = logs.filter((l) => l.category === "INVESTMENTS").length;
    const financeCount = expensesCount + paymentsCount + investmentsCount;

    // Daily count grouping (last 7 days)
    const dailyMap: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      dailyMap[label] = 0;
    }

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      const label = logDate.toLocaleDateString("en-US", { weekday: "short" });
      if (dailyMap[label] !== undefined) {
        dailyMap[label]++;
      }
    });

    const timelineData = Object.entries(dailyMap).map(([day, val]) => ({ day, val }));

    return {
      total: logs.length,
      ordersCount,
      financeCount,
      timelineData,
      categories: [
        { name: "Orders", count: ordersCount, color: "#3b82f6" },
        { name: "Expenses", count: expensesCount, color: "#f59e0b" },
        { name: "Payments", count: paymentsCount, color: "#10b981" },
        { name: "Investments", count: investmentsCount, color: "#8b5cf6" },
      ]
    };
  }, [logs]);

  // SVG Chart Render Helpers
  // 1. Line Trend SVG
  const trendChartSvg = useMemo(() => {
    const data = stats.timelineData;
    if (data.length === 0) return null;

    const width = 500;
    const height = 180;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map((d) => d.val), 5); // minimum ceiling of 5

    // Map coordinates
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.val / maxVal) * chartHeight;
      return { x, y, label: d.day, val: d.val };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : "";

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * ratio;
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={index} className="opacity-20">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#374151" strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="monospace">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

        {/* Path line */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" className="hover:scale-125 transition-transform cursor-pointer" />
            <text x={p.x} y={height - 10} fill="#6b7280" fontSize="10" fontWeight="bold" textAnchor="middle">
              {p.label}
            </text>
            {p.val > 0 && (
              <text x={p.x} y={p.y - 10} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {p.val}
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  }, [stats.timelineData]);

  // 2. Bar Count SVG
  const barChartSvg = useMemo(() => {
    const data = stats.categories;
    const width = 500;
    const height = 180;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map((d) => d.count), 5);
    const barWidth = 35;
    const gap = (chartWidth - barWidth * data.length) / (data.length - 1);

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Horizontal lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * ratio;
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={index} className="opacity-20">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#374151" />
              <text x={padding - 10} y={y + 4} fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="monospace">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.count / maxVal) * chartHeight;
          const x = padding + i * (barWidth + gap);
          const y = padding + chartHeight - barHeight;

          return (
            <g key={i} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="6"
                fill={d.color}
                opacity="0.85"
                className="hover:opacity-100 transition-opacity"
              />
              <text x={x + barWidth / 2} y={height - 10} fill="#6b7280" fontSize="10" fontWeight="bold" textAnchor="middle">
                {d.name}
              </text>
              <text x={x + barWidth / 2} y={y - 8} fill={d.color} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {d.count}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }, [stats.categories]);


  // Map category to styles/icons
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case "ORDERS":
        return {
          icon: ShoppingCart,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          badge: "bg-blue-900/30 text-blue-400 border border-blue-800/40"
        };
      case "EXPENSES":
        return {
          icon: Receipt,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          badge: "bg-amber-900/30 text-amber-400 border border-amber-800/40"
        };
      case "PAYMENTS":
        return {
          icon: Wallet,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          badge: "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40"
        };
      case "INVESTMENTS":
        return {
          icon: TrendingUp,
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
          badge: "bg-purple-900/30 text-purple-400 border border-purple-800/40"
        };
      default:
        return {
          icon: Database,
          color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
          badge: "bg-slate-900/30 text-slate-400 border border-slate-800/40"
        };
    }
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[#0b0e14] min-h-screen text-slate-100 pb-16">
      {/* TOPBAR */}
      <div className="flex items-center justify-between border-b border-[#1f2937] px-6 sm:px-8 py-4 sm:py-5">
        <h1 className="text-xl sm:text-2xl font-serif text-white pl-12 lg:pl-0 font-medium">
          Activity Logs
        </h1>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#1f2937] px-3 py-2 text-xs text-slate-400 font-mono">
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

      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-lg flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Total System Logs</p>
              <p className="mt-0.5 text-2xl font-bold font-mono">{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-lg flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Order System Logs</p>
              <p className="mt-0.5 text-2xl font-bold font-mono">{stats.ordersCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-lg flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Finance System Logs</p>
              <p className="mt-0.5 text-2xl font-bold font-mono">{stats.financeCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* CHARTS CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline trend line chart */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 p-6 shadow-lg flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Activity Trend</h3>
              <p className="text-xs text-slate-500">Logs volume tracked in the last 7 days</p>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center">
              {trendChartSvg}
            </div>
          </div>

          {/* Category count bar chart */}
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 p-6 shadow-lg flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Category Distribution</h3>
              <p className="text-xs text-slate-500">Total activities categorized by system area</p>
            </div>
            <div className="h-[180px] w-full flex items-center justify-center">
              {barChartSvg}
            </div>
          </div>
        </div>

        {/* TIMELINE SEARCH & CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827]/40 p-4 border border-[#1f2937] rounded-2xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search logs details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0b0e14] border-[#1f2937] text-white rounded-xl focus:ring-blue-500 h-11 text-xs focus:border-slate-600 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0b0e14] border border-[#1f2937] text-white rounded-xl focus:ring-blue-500 focus:border-slate-600 h-11 px-3 text-xs w-full sm:w-auto"
            >
              <option value="ALL">All Categories</option>
              <option value="ORDERS">Orders</option>
              <option value="FINANCE">Finance (All)</option>
              <option value="EXPENSES">Expenses</option>
              <option value="PAYMENTS">Payments</option>
              <option value="INVESTMENTS">Investments</option>
            </select>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="h-11 w-11 rounded-xl bg-[#1f2937] border border-[#2a3547] flex items-center justify-center text-slate-400 hover:text-white shrink-0 transition-colors disabled:opacity-50"
              title="Refresh Logs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* CHRONOLOGICAL TIMELINE */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/10 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#1f2937]/50 pb-6 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">All Activity</h3>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#0b0e14] border border-[#1f2937] text-white rounded-xl focus:ring-blue-500 focus:border-slate-600 h-11 px-4 text-xs font-semibold"
            >
              <option value="ALL">All Actions</option>
              <option value="ADD">Add</option>
              <option value="EDIT">Edit</option>
              <option value="DELETE">Delete</option>
              <option value="STATUS">Status Change</option>
            </select>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-3 text-blue-500" />
              <span className="text-sm">Loading activity logs…</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              No activity logs match your criteria.
            </div>
          ) : (
            <div className="relative border-l border-slate-700/60 ml-3 pl-8 space-y-6">
              {filteredLogs.map((log) => {
                const isCreate = log.action === "CREATE";
                const isDelete = log.action === "DELETE";
                const isUpdate = log.action === "UPDATE";
                const isStatus = log.details.toLowerCase().includes("status");

                let badgeLabel = "EDIT";
                let badgeClass = "bg-purple-950/40 text-purple-400 border border-purple-800/40";
                
                if (isCreate) {
                  badgeLabel = "ADD";
                  badgeClass = "bg-blue-950/40 text-blue-400 border border-blue-800/40";
                } else if (isDelete) {
                  badgeLabel = "DELETE";
                  badgeClass = "bg-red-950/40 text-red-400 border border-red-850/40";
                } else if (isStatus) {
                  badgeLabel = "EDIT";
                  badgeClass = "bg-purple-950/40 text-purple-400 border border-purple-800/40";
                }

                // Format timestamp
                const logTime = new Date(log.timestamp).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <div key={log.id} className="relative group">
                    {/* Blue Circular Node */}
                    <span className="absolute -left-[37px] top-1.5 h-2 w-2 rounded-full bg-blue-500 border border-[#0b0e14] group-hover:scale-125 transition-transform" />
                    
                    <div>
                      {/* Top: Date / Time */}
                      <p className="text-[11px] text-slate-500 font-medium font-sans">
                        {logTime}
                      </p>
                      {/* Bottom: Badge + Text Description */}
                      <div className="mt-1 flex items-center gap-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                          {renderDetailsText(log.details)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
