import { prisma } from "@/lib/prisma/client";
import type { OrderItem } from "@/types";

export async function reserveStock(_orderId: string) {
  // Stock no gestionado — mayorista con stock ilimitado
}

export async function fulfillOrder(orderId: string, paymentMethod: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === "payment_confirmed") return;

  const items = order.items as unknown as OrderItem[];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { price_cost: true },
    });
    if (!product) continue;
    await prisma.sale.create({
      data: {
        product_id:     item.product_id,
        product_name:   item.name,
        color:          item.color,
        quantity:       item.qty,
        sale_price:     item.price,
        cost_price:     product.price_cost,
        channel:        "online",
        payment_method: paymentMethod,
        order_id:       orderId,
      },
    });
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "payment_confirmed" } });
}

export async function releaseStock(orderId: string) {
  // Stock no gestionado — solo cancelar el pedido
  await prisma.order.update({ where: { id: orderId }, data: { status: "cancelled" } });
}
