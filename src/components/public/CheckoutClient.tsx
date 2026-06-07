"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";
import { WHOLESALE_MIN_ORDER_TOTAL } from "@/types";
import Image from "next/image";
import Link from "next/link";
import type { CreateOrderResponse } from "@/types";

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

export default function CheckoutClient() {
  const { items, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();
  const router = useRouter();

  const [form, setForm] = useState({
    customer_name:  "",
    customer_email: "",
    customer_phone: "",
    street:         "",
    city:           "",
    province:       "",
    zip:            "",
    coupon_code:    "",
  });

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="font-playfair text-2xl text-nl-text mb-4">No hay productos en el carrito</p>
        <Link href="/productos" className="text-nl-pink hover:underline">Ver productos →</Link>
      </div>
    );
  }

  if (total < WHOLESALE_MIN_ORDER_TOTAL) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="font-playfair text-2xl text-nl-text mb-2">Pedido mínimo no alcanzado</p>
        <p className="text-nl-gray-dark mb-4">
          Te falta {formatARS(WHOLESALE_MIN_ORDER_TOTAL - total)} para completar el pedido mínimo de {formatARS(WHOLESALE_MIN_ORDER_TOTAL)}.
        </p>
        <Link href="/carrito" className="text-nl-pink hover:underline">Volver al carrito →</Link>
      </div>
    );
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name:    form.customer_name,
          customer_email:   form.customer_email,
          customer_phone:   form.customer_phone,
          customer_address: {
            street:   form.street,
            city:     form.city,
            province: form.province,
            zip:      form.zip,
          },
          items: items.map((i) => ({
            product_id: i.product_id,
            slug:       i.slug,
            name:       i.name,
            color:      i.color,
            qty:        i.quantity,
            price:      i.price,
          })),
          payment_method: "transfer",
          coupon_code:    form.coupon_code || null,
        }),
      });

      const data: CreateOrderResponse = await res.json();

      if (!res.ok) {
        setError("Error al procesar el pedido. Intentá de nuevo.");
        return;
      }

      clearCart();
      router.push(`/pedido/${data.order_id}`);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nl-pink transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-playfair text-4xl font-bold text-nl-text mb-8">Finalizar pedido</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">

            {/* Datos personales */}
            <div className="nl-card p-6">
              <h2 className="font-playfair text-xl font-semibold mb-4">Datos de contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">NOMBRE COMPLETO</label>
                  <input className={inputClass} required value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="María González" />
                </div>
                <div>
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">EMAIL</label>
                  <input className={inputClass} type="email" required value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} placeholder="maria@email.com" />
                </div>
                <div>
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">TELÉFONO</label>
                  <input className={inputClass} required value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} placeholder="+54 9 11 1234-5678" />
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="nl-card p-6">
              <h2 className="font-playfair text-xl font-semibold mb-4">Dirección de envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">CALLE Y NÚMERO</label>
                  <input className={inputClass} required value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Av. Corrientes 1234" />
                </div>
                <div>
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">CIUDAD</label>
                  <input className={inputClass} required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Buenos Aires" />
                </div>
                <div>
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">CÓDIGO POSTAL</label>
                  <input className={inputClass} required value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="1043" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">PROVINCIA</label>
                  <select className={inputClass} required value={form.province} onChange={(e) => set("province", e.target.value)}>
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Cupón */}
            <div className="nl-card p-6">
              <h2 className="font-playfair text-xl font-semibold mb-4">Cupón de descuento (opcional)</h2>
              <div className="flex gap-2">
                <input
                  className={`${inputClass} flex-1`}
                  value={form.coupon_code}
                  onChange={(e) => set("coupon_code", e.target.value.toUpperCase())}
                  placeholder="CÓDIGO"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.coupon_code) return;
                    const res = await fetch("/api/coupons/validate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code: form.coupon_code, subtotal: total }),
                    });
                    const d = await res.json();
                    if (res.ok) setCouponMsg(`✓ ${d.message ?? "Cupón válido"}`);
                    else setCouponMsg(`✗ ${d.error ?? "Cupón inválido"}`);
                  }}
                  className="px-4 py-3 bg-nl-blue text-white rounded-xl text-sm font-semibold hover:bg-nl-blue-dark transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs mt-2 ${couponMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                  {couponMsg}
                </p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div>
            <div className="nl-card p-5 sticky top-24">
              <h2 className="font-playfair text-xl font-semibold mb-4">Tu pedido</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.product_id}-${item.color}`} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-nl-gray rounded-lg relative overflow-hidden shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">{item.name}</p>
                      <p className="text-[10px] text-nl-gray-dark">{item.color} ×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold shrink-0">{formatARS(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="price-text">{formatARS(total)}</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-nl-pink text-white rounded-2xl font-semibold hover:bg-nl-pink-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Procesando..." : "Confirmar pedido"}
              </button>

              <p className="text-[10px] text-nl-gray-dark text-center mt-3">
                Al confirmar aceptás nuestros términos de compra mayorista.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
