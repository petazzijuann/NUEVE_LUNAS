import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import OrdersTable from "@/components/admin/OrdersTable";
import type { OrderPublic, OrderItem, CustomerAddress } from "@/types";

export const metadata: Metadata = { title: "Pedidos | Admin" };
export const dynamic = "force-dynamic";

export default async function PedidosAdminPage() {
  const raw = await prisma.order.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
  });

  const orders: OrderPublic[] = raw.map((o) => ({
    id:                  o.id,
    customer_name:       o.customer_name,
    customer_email:      o.customer_email,
    customer_phone:      o.customer_phone,
    customer_address:    o.customer_address as CustomerAddress,
    items:               o.items as unknown as OrderItem[],
    total_amount:        Number(o.total_amount),
    status:              o.status as OrderPublic["status"],
    payment_method:      o.payment_method as OrderPublic["payment_method"],
    payment_proof_url:   o.payment_proof_url,
    astropay_payment_id: o.astropay_payment_id,
    coupon_code:         o.coupon_code,
    discount_amount:     o.discount_amount ? Number(o.discount_amount) : null,
    created_at:          o.created_at.toISOString(),
    updated_at:          o.updated_at.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-playfair text-3xl font-bold text-nl-text mb-6">Pedidos</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}
