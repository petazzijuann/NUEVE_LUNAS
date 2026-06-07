import { prisma } from "@/lib/prisma/client";
import type { OrderItem, ColorVariant } from "@/types";

export async function reserveStock(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const items = order.items as unknown as OrderItem[];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { color_variants: true },
    });
    if (!product) continue;

    const variants = product.color_variants as unknown as ColorVariant[];
    const idx = variants.findIndex((v) => v.name === item.color);
    if (idx === -1) continue;

    variants[idx].stock = Math.max(0, variants[idx].stock - item.qty);
    await prisma.product.update({
      where: { id: item.product_id },
      data: { color_variants: variants as object[] },
    });
  }
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
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const items = order.items as unknown as OrderItem[];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { color_variants: true },
    });
    if (!product) continue;

    const variants = product.color_variants as unknown as ColorVariant[];
    const idx = variants.findIndex((v) => v.name === item.color);
    if (idx === -1) continue;

    variants[idx].stock = variants[idx].stock + item.qty;
    await prisma.product.update({
      where: { id: item.product_id },
      data: { color_variants: variants as object[] },
    });
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: "cancelled" } });
}
