"use client";

import { useState } from "react";
import { formatARS } from "@/lib/utils";
import type { CouponPublic } from "@/types";
import { Plus, X, Trash2 } from "lucide-react";

export default function CouponsAdminClient({ coupons: initial }: { coupons: CouponPublic[] }) {
  const [coupons, setCoupons] = useState(initial);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newForm, setNewForm] = useState({
    code: "", type: "percent" as "percent" | "fixed" | "free_shipping",
    value: "", stock: "10", min_purchase: "",
  });

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code:         newForm.code.toUpperCase(),
        type:         newForm.type,
        value:        parseFloat(newForm.value) || null,
        stock:        parseInt(newForm.stock) || 10,
        min_purchase: parseFloat(newForm.min_purchase) || null,
      }),
    });
    if (res.ok) {
      const created: CouponPublic = await res.json();
      setCoupons((prev) => [created, ...prev]);
      setShowNew(false);
      setNewForm({ code: "", type: "percent", value: "", stock: "10", min_purchase: "" });
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cupón?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  async function toggleActive(coupon: CouponPublic) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    if (res.ok) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
      );
    }
  }

  const inputClass = "w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-nl-pink transition-colors";

  return (
    <div>
      <button
        onClick={() => setShowNew(true)}
        className="flex items-center gap-2 mb-6 px-5 py-2.5 bg-nl-pink text-white rounded-xl font-semibold text-sm hover:bg-nl-pink-dark transition-colors"
      >
        <Plus size={16} /> Nuevo cupón
      </button>

      {/* Modal nuevo */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-xl font-semibold">Nuevo cupón</h2>
              <button onClick={() => setShowNew(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1 block">CÓDIGO</label>
                <input className={inputClass} value={newForm.code} onChange={(e) => setNewForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="VERANO10" />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1 block">TIPO</label>
                <select className={inputClass} value={newForm.type} onChange={(e) => setNewForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}>
                  <option value="percent">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                  <option value="free_shipping">Envío gratis</option>
                </select>
              </div>
              {newForm.type !== "free_shipping" && (
                <div>
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1 block">
                    {newForm.type === "percent" ? "PORCENTAJE (%)" : "MONTO ($)"}
                  </label>
                  <input className={inputClass} type="number" value={newForm.value} onChange={(e) => setNewForm((f) => ({ ...f, value: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1 block">USOS DISPONIBLES</label>
                <input className={inputClass} type="number" value={newForm.stock} onChange={(e) => setNewForm((f) => ({ ...f, stock: e.target.value }))} />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1 block">COMPRA MÍNIMA (opcional)</label>
                <input className={inputClass} type="number" value={newForm.min_purchase} onChange={(e) => setNewForm((f) => ({ ...f, min_purchase: e.target.value }))} placeholder="300000" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold">Cancelar</button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 py-3 bg-nl-pink text-white rounded-xl text-sm font-semibold hover:bg-nl-pink-dark transition-colors disabled:opacity-60">
                {loading ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="nl-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-nl-gray">
              <th className="label-tag text-[10px] text-left px-4 py-3">CÓDIGO</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">TIPO</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">VALOR</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">USOS</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">MÍN.</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">ESTADO</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-nl-gray/40 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-nl-pink">{c.code}</td>
                <td className="px-4 py-3 label-tag text-[10px] text-nl-gray-dark">
                  {c.type === "percent" ? "%" : c.type === "fixed" ? "$" : "ENVÍO"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? formatARS(c.value ?? 0) : "—"}
                </td>
                <td className="px-4 py-3 text-xs">{c.used_count} / {c.stock + c.used_count}</td>
                <td className="px-4 py-3 text-xs">{c.min_purchase ? formatARS(c.min_purchase) : "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-nl-gray text-nl-gray-dark"}`}>
                    {c.is_active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <div className="text-center py-10 text-nl-gray-dark"><p className="label-tag">NO HAY CUPONES</p></div>
        )}
      </div>
    </div>
  );
}
