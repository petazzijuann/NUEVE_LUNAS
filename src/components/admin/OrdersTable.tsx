"use client";

import React, { useState } from "react";
import { formatARS } from "@/lib/utils";
import type { OrderPublic } from "@/types";
import { CheckCircle, XCircle, Package, Truck } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending_payment:   { label: "Pendiente",  color: "bg-amber-100 text-amber-700",   icon: Package },
  payment_confirmed: { label: "Confirmado", color: "bg-green-100 text-green-700",   icon: CheckCircle },
  shipped:           { label: "Enviado",    color: "bg-blue-100  text-blue-700",    icon: Truck },
  delivered:         { label: "Entregado",  color: "bg-green-200 text-green-800",   icon: CheckCircle },
  cancelled:         { label: "Cancelado",  color: "bg-red-100   text-red-700",     icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
  pending_payment:   "payment_confirmed",
  payment_confirmed: "shipped",
  shipped:           "delivered",
};

export default function OrdersTable({ orders: initial }: { orders: OrderPublic[] }) {
  const [orders, setOrders] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function updateStatus(orderId: string, newStatus: string) {
    setLoading(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as OrderPublic["status"] } : o))
      );
    }
    setLoading(null);
  }

  return (
    <div className="nl-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-nl-gray">
              <th className="label-tag text-[10px] text-left px-4 py-3">PEDIDO</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">CLIENTE</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">TOTAL</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">ESTADO</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">PAGO</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">FECHA</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending_payment;
              const StatusIcon = s.icon;
              const nextStatus = NEXT_STATUS[order.status];
              const isExpanded = expanded === order.id;

              return (
                <React.Fragment key={order.id}>
                  <tr
                    className="border-b border-border hover:bg-nl-gray/50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-nl-gray-dark">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-nl-gray-dark text-xs">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-nl-pink">{formatARS(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.color}`}>
                        <StatusIcon size={11} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 label-tag text-[10px] text-nl-gray-dark">
                      {order.payment_method === "transfer" ? "Transferencia" : "AstroPay"}
                    </td>
                    <td className="px-4 py-3 text-xs text-nl-gray-dark">
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      {nextStatus && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus); }}
                          disabled={loading === order.id}
                          className="label-tag text-[9px] bg-nl-pink text-white px-2.5 py-1.5 rounded-lg hover:bg-nl-pink-dark transition-colors disabled:opacity-50"
                        >
                          {loading === order.id ? "..." : `→ ${STATUS_CONFIG[nextStatus]?.label}`}
                        </button>
                      )}
                      {order.status === "payment_confirmed" && !nextStatus && null}
                    </td>
                  </tr>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <tr key={`${order.id}-detail`} className="bg-nl-pink-light/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="label-tag text-[10px] text-nl-gray-dark mb-2">PRODUCTOS</p>
                            {order.items.map((item, i) => (
                              <p key={i} className="text-xs">
                                {item.name} — {item.color} ×{item.qty} @ {formatARS(item.price)}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="label-tag text-[10px] text-nl-gray-dark mb-2">DIRECCIÓN</p>
                            <p className="text-xs">{order.customer_address.street}</p>
                            <p className="text-xs">{order.customer_address.city}, {order.customer_address.province} {order.customer_address.zip}</p>
                            <p className="text-xs mt-1">{order.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-10 text-nl-gray-dark">
            <p className="label-tag">NO HAY PEDIDOS</p>
          </div>
        )}
      </div>
    </div>
  );
}
