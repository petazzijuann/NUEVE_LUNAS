import type { Context } from "telegraf";
import { prisma } from "@/lib/prisma/client";
import { formatARS } from "@/lib/utils";

export async function handleMetrics(ctx: Context) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sales = await prisma.sale.findMany({
    where: { created_at: { gte: startOfMonth } },
  });

  const revenue = sales.reduce((s, r) => s + Number(r.sale_price) * r.quantity, 0);
  const cogs    = sales.reduce((s, r) => s + Number(r.cost_price)  * r.quantity, 0);
  const profit  = revenue - cogs;
  const margin  = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  const orders = await prisma.order.count({
    where: { created_at: { gte: startOfMonth }, status: "payment_confirmed" },
  });

  await ctx.reply(
    `📊 *Métricas del mes*\n\n` +
    `💰 Revenue: ${formatARS(revenue)}\n` +
    `📦 Pedidos: ${orders}\n` +
    `📈 Ganancia: ${formatARS(profit)}\n` +
    `📉 Margen: ${margin}%`,
    { parse_mode: "Markdown" }
  );
}
