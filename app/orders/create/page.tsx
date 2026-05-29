"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, X, Search, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/lib/actions/inventory";
import { createOrder, getNextOrderNumber } from "@/lib/actions/orders";

interface Product {
  id: string;
  code: string;
  name: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
}

interface OrderItem {
  localId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

const SOURCES = ["Page (Facebook)", "Page (Instagram)", "WhatsApp", "Walk-in", "Referral", "Other"];
const COURIERS = ["Self Delivered", "Steadfast", "Carrybee", "Pathao", "RedX", "Sundarban", "Other"];

// Reusable styled input
const Field = ({
  label,
  optional,
  children,
  className = "",
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
      {label}
      {optional && <span className="ml-1 text-slate-700 normal-case tracking-normal">(optional)</span>}
    </label>
    {children}
  </div>
);

const baseInput =
  "w-full bg-[#0d1117] border border-[#2a3547] rounded-lg px-3 h-10 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/70 hover:border-[#3a4557] transition-colors";

function NumInput({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  // Keep a local string so the user can freely clear and retype
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  // Sync when the parent resets the value externally (e.g. product change)
  useEffect(() => {
    setRaw(value === 0 ? "" : String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setRaw(str);
    const parsed = parseFloat(str);
    if (!isNaN(parsed) && parsed >= min) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed < min) {
      const fallback = min > 0 ? min : 0;
      setRaw(fallback === 0 ? "" : String(fallback));
      onChange(fallback);
    }
  };

  return (
    <input
      type="number"
      value={raw}
      min={min}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0"
      className={`${baseInput} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
  );
}

function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${baseInput} flex items-center justify-between`}
      >
        <span className={value ? "text-slate-200" : "text-slate-700"}>{value || "Select…"}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#111827] border border-[#2a3547] rounded-lg shadow-xl overflow-auto max-h-48">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === opt ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-[#1f2937]"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductSearch({ products, value, onChange }: { products: Product[]; value: string; onChange: (p: Product) => void }) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQ(value); }, [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
        <input
          type="text"
          placeholder="Search by code or name…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className={`${baseInput} pl-8`}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#111827] border border-[#2a3547] rounded-lg shadow-xl overflow-auto max-h-52">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p); setQ(p.name); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-[#1f2937] transition-colors border-b border-[#1f2937] last:border-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-200 text-xs font-medium truncate">{p.name}</span>
                <span className="text-blue-400 text-xs font-mono shrink-0">{p.code}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-slate-500 text-xs">৳{p.retailPrice.toLocaleString()}</span>
                <span className={`text-xs ${p.stock < 5 ? "text-red-400" : "text-green-400"}`}>{p.stock} left</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && q && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#111827] border border-[#2a3547] rounded-lg shadow-xl p-3 text-slate-600 text-xs text-center">
          No products match &quot;{q}&quot;
        </div>
      )}
    </div>
  );
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [nextOrderNum, setNextOrderNum] = useState("#ORD-·····");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("Page (Facebook)");
  const [courier, setCourier] = useState("Self Delivered");
  const [cnNumber, setCnNumber] = useState("");
  const [advance, setAdvance] = useState(0);
  const [packaging, setPackaging] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [resell, setResell] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([
    { localId: "1", productId: "", productName: "", unitPrice: 0, quantity: 1 },
  ]);

  useEffect(() => {
    Promise.all([getProducts(), getNextOrderNumber()]).then(([prods, num]) => {
      setProducts(prods as Product[]);
      setNextOrderNum(num);
    });
  }, []);

  const updateItem = (localId: string, patch: Partial<OrderItem>) =>
    setItems((prev) => prev.map((i) => (i.localId === localId ? { ...i, ...patch } : i)));

  const selectProduct = (localId: string, p: Product) =>
    updateItem(localId, { productId: p.id, productName: p.name, unitPrice: p.retailPrice });

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { localId: Date.now().toString(), productId: "", productName: "", unitPrice: 0, quantity: 1 },
    ]);

  const removeItem = (localId: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  };

  const productsTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const grandTotal = productsTotal + packaging + deliveryCharge + resell - discount - advance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!customerName.trim()) return setError("Customer name is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (items.some((i) => !i.productId)) return setError("Please select a product for every row.");

    setIsSubmitting(true);
    const result = await createOrder({
      customerName, phone, source, courier, cnNumber,
      advance, packaging, deliveryCharge, discount, resell,
      paymentMethod: "COD",
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice })),
    });
    setIsSubmitting(false);

    if (result.success) router.push("/orders");
    else setError(result.error || "Failed to create order.");
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[#0b0e14] min-h-screen">
      {/* COMPACT TOPBAR */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#1f2937] bg-[#0b0e14]/95 backdrop-blur-sm px-4 sm:px-6 py-3">
        <Link href="/orders">
          <button type="button" className="h-8 w-8 rounded-lg border border-[#2a3547] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-base font-semibold text-white leading-none">New Order</h1>
          <p className="text-xs text-blue-400 font-mono mt-0.5">{nextOrderNum}</p>
        </div>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-w-3xl mx-auto pb-8">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-visible shadow-xl">

          {/* ── SECTION 1: CUSTOMER ── */}
          <div className="px-4 sm:px-5 pt-4 pb-4 border-b border-[#1f2937]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Customer Name">
                <input
                  type="text"
                  placeholder="Full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={baseInput}
                />
              </Field>
              <Field label="Phone Number">
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={baseInput}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Source">
                <Dropdown value={source} options={SOURCES} onChange={setSource} />
              </Field>
            </div>
          </div>

          {/* ── SECTION 2: PRODUCTS ── */}
          <div className="border-b border-[#1f2937]">
            {/* Products header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#0d1117]/60">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Products</span>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 border border-[#2a3547] rounded-md px-2.5 py-1 hover:border-blue-500/50 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Product
              </button>
            </div>

            {/* Column labels — hidden on xs */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 sm:px-5 py-1.5 border-t border-[#1f2937]">
              <div className="col-span-5 text-[10px] uppercase text-slate-600">Product</div>
              <div className="col-span-3 text-[10px] uppercase text-slate-600">Unit Price</div>
              <div className="col-span-2 text-[10px] uppercase text-slate-600">Qty</div>
              <div className="col-span-2 text-[10px] uppercase text-slate-600">Total</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#1f2937]">
              {items.map((item) => (
                <div key={item.localId} className="px-4 sm:px-5 py-2.5">
                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <ProductSearch products={products} value={item.productName} onChange={(p) => selectProduct(item.localId, p)} />
                    </div>
                    <div className="col-span-3">
                      <NumInput value={item.unitPrice} onChange={(v) => updateItem(item.localId, { unitPrice: v })} />
                    </div>
                    <div className="col-span-2">
                      <NumInput value={item.quantity} min={1} onChange={(v) => updateItem(item.localId, { quantity: Math.max(1, v) })} />
                    </div>
                    <div className="col-span-1 text-slate-300 text-sm font-semibold">
                      {(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button type="button" onClick={() => removeItem(item.localId)} disabled={items.length === 1}
                        className="text-slate-700 hover:text-red-400 transition-colors disabled:opacity-20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-2">
                    <ProductSearch products={products} value={item.productName} onChange={(p) => selectProduct(item.localId, p)} />
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div>
                        <p className="text-[10px] text-slate-600 mb-1">Unit Price</p>
                        <NumInput value={item.unitPrice} onChange={(v) => updateItem(item.localId, { unitPrice: v })} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 mb-1">Qty</p>
                        <NumInput value={item.quantity} min={1} onChange={(v) => updateItem(item.localId, { quantity: Math.max(1, v) })} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 mb-1">Total</p>
                        <div className="h-10 flex items-center justify-between">
                          <span className="text-slate-300 text-sm font-semibold">
                            {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                          <button type="button" onClick={() => removeItem(item.localId)} disabled={items.length === 1}
                            className="text-slate-700 hover:text-red-400 transition-colors disabled:opacity-20">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products subtotal */}
            <div className="flex justify-end px-4 sm:px-5 py-2 bg-[#0d1117]/60 border-t border-[#1f2937]">
              <span className="text-xs text-slate-500">
                Products Total: <span className="text-white font-bold text-sm ml-1">৳ {productsTotal.toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* ── SECTION 3: CHARGES ── */}
          <div className="px-4 sm:px-5 py-4 border-b border-[#1f2937] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Advanced (৳)" optional>
                <NumInput value={advance} onChange={setAdvance} />
              </Field>
              <Field label="Packaging (৳)">
                <NumInput value={packaging} onChange={setPackaging} />
              </Field>
              <Field label="Delivery (৳)">
                <NumInput value={deliveryCharge} onChange={setDeliveryCharge} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount (৳)" optional>
                <NumInput value={discount} onChange={setDiscount} />
              </Field>
              <Field label="Resell (৳)" optional>
                <NumInput value={resell} onChange={setResell} />
              </Field>
            </div>
          </div>

          {/* ── SECTION 4: COURIER ── */}
          <div className="px-4 sm:px-5 py-4 border-b border-[#1f2937]">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Courier Service">
                <Dropdown value={courier} options={COURIERS} onChange={setCourier} />
              </Field>
              <Field label="CN Number" optional>
                <input
                  type="text"
                  placeholder="e.g. SS-2847391"
                  value={cnNumber}
                  onChange={(e) => setCnNumber(e.target.value)}
                  className={baseInput}
                />
              </Field>
            </div>
          </div>

          {/* ── GRAND TOTAL ── */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0d1117]/80">
            <span className="text-sm text-slate-400 font-medium">Grand Total (COD)</span>
            <span className="text-blue-400 text-2xl font-bold">৳ {grandTotal.toLocaleString()}</span>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 sm:mx-5 mb-3 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-[#1f2937] bg-[#0d1117]">
            <Link href="/orders">
              <button
                type="button"
                className="h-9 px-5 text-sm rounded-lg border border-[#2a3547] text-slate-300 hover:bg-[#1f2937] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-6 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Create Order
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
