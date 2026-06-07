import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const schema = z.object({
  code:     z.string(),
  subtotal: z.number(),
});

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.is_active || coupon.stock <= 0)
    return NextResponse.json({ error: "Cupón inválido o agotado" }, { status: 400 });

  if (coupon.expires_at && coupon.expires_at < new Date())
    return NextResponse.json({ error: "Cupón vencido" }, { status: 400 });

  if (coupon.min_purchase && subtotal < Number(coupon.min_purchase))
    return NextResponse.json({
      error: `Compra mínima para este cupón: $${Number(coupon.min_purchase).toLocaleString("es-AR")}`,
    }, { status: 400 });

  let discount_amount = 0;
  if (coupon.type === "percent") {
    discount_amount = Math.floor(subtotal * Number(coupon.value) / 100);
  } else if (coupon.type === "fixed") {
    discount_amount = Math.min(Number(coupon.value), subtotal);
  }

  return NextResponse.json({
    code:            coupon.code,
    type:            coupon.type,
    value:           coupon.value ? Number(coupon.value) : null,
    discount_amount,
    message:         coupon.type === "free_shipping"
      ? "Envío gratis aplicado"
      : `Descuento de $${discount_amount.toLocaleString("es-AR")} aplicado`,
  });
}
