import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import type { OrderPublic, OrderItem, CustomerAddress } from "@/types";
import { formatARS } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Tu pedido" };

interface Props { params: Promise<{ id: string }> }

const STATUS_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending_payment:   { label: "Pendiente de pago",    icon: Clock,        color: "text-amber-500" },
  payment_confirmed: { label: "Pago confirmado",       icon: CheckCircle,  color: "text-green-600" },
  shipped:           { label: "Enviado",               icon: Truck,        color: "text-nl-blue" },
  delivered:         { label: "Entregado",             icon: Package,      color: "text-green-700" },
  cancelled:         { label: "Cancelado",             icon: XCircle,      color: "text-red-500" },
};

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const raw = await prisma.order.findUnique({ where: { id } });
  if (!raw) notFound();

  const order: OrderPublic = {
    id:                  raw.id,
    customer_name:       raw.customer_name,
    customer_email:      raw.customer_email,
    customer_phone:      raw.customer_phone,
    customer_address:    raw.customer_address as CustomerAddress,
    items:               raw.items as unknown as OrderItem[],
    total_amount:        Number(raw.total_amount),
    status:              raw.status as OrderPublic["status"],
    payment_method:      raw.payment_method as OrderPublic["payment_method"],
    payment_proof_url:   raw.payment_proof_url,
    astropay_payment_id: raw.astropay_payment_id,
    coupon_code:         raw.coupon_code,
    discount_amount:     raw.discount_amount ? Number(raw.discount_amount) : null,
    created_at:          raw.created_at.toISOString(),
    updated_at:          raw.updated_at.toISOString(),
  };

  const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.pending_payment;
  const StatusIcon = statusInfo.icon;
  const cbu   = process.env.CBU ?? "";
  const alias = process.env.ALIAS_CBU ?? "";
  const tit   = process.env.TITULAR_CUENTA ?? "";
  const phone = process.env.CONTACT_PHONE ?? "";
  const insta = process.env.INSTAGRAM_HANDLE ?? "";
  const isTransfer = order.payment_method === "transfer" && order.status === "pending_payment";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-nl-pink-light mb-4`}>
          <StatusIcon size={28} className={statusInfo.color} />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-nl-text mb-1">
          {statusInfo.label}
        </h1>
        <p className="text-nl-gray-dark text-sm">
          Pedido #{order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Datos de transferencia */}
      {isTransfer && (
        <div className="nl-card border-nl-pink/30 bg-nl-pink-light p-6 mb-6">
          <h2 className="font-playfair text-xl font-semibold text-nl-pink mb-3">Datos para transferir</h2>
          <div className="space-y-2 text-sm">
            {cbu   && <p><strong>CBU:</strong> {cbu}</p>}
            {alias && <p><strong>Alias:</strong> {alias}</p>}
            {tit   && <p><strong>Titular:</strong> {tit}</p>}
            <p className="font-bold text-nl-pink text-base mt-2">
              Monto: {formatARS(order.total_amount)}
            </p>
          </div>
          <p className="text-xs text-nl-gray-dark mt-3">
            Una vez que realices la transferencia, te confirmamos el pedido y coordinamos el envío.
          </p>
          {phone && (
            <a href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
               className="inline-block mt-3 text-sm text-nl-blue hover:underline">
              Enviar comprobante por WhatsApp →
            </a>
          )}
          {insta && (
            <a href={`https://instagram.com/${insta}`} target="_blank" rel="noopener noreferrer"
               className="block mt-1 text-sm text-nl-blue hover:underline">
              @{insta}
            </a>
          )}
        </div>
      )}

      {/* Detalle del pedido */}
      <div className="nl-card p-6 mb-6">
        <h2 className="font-playfair text-xl font-semibold mb-4">Detalle</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-nl-gray-dark text-xs">Color: {item.color} · ×{item.qty}</p>
              </div>
              <p className="font-semibold">{formatARS(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 mt-4">
          {order.discount_amount && order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600 mb-1">
              <span>Descuento ({order.coupon_code})</span>
              <span>−{formatARS(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="price-text">{formatARS(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Info envío */}
      <div className="nl-card p-5 mb-6 bg-nl-blue-light border-nl-blue/20">
        <p className="label-tag text-nl-blue mb-1 text-[10px]">ENVÍO</p>
        <p className="text-sm text-nl-blue-dark">
          El costo de envío se abona al recibir el paquete. Te contactaremos para coordinar el despacho.
        </p>
        <p className="text-xs text-nl-gray-dark mt-1">
          {order.customer_address.street}, {order.customer_address.city}, {order.customer_address.province}
        </p>
      </div>

      <div className="text-center">
        <Link href="/productos" className="text-sm text-nl-pink hover:underline font-semibold">
          Seguir comprando →
        </Link>
      </div>
    </div>
  );
}
