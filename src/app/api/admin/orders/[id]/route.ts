import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { fulfillOrder, releaseStock } from "@/lib/orders/fulfill";

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id }   = await params;
  const body     = await request.json().catch(() => ({}));
  const newStatus = body.status as string;

  if (!newStatus) return NextResponse.json({ error: "Status requerido" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  // Lógica especial según transición
  if (newStatus === "payment_confirmed" && order.status === "pending_payment") {
    await fulfillOrder(id, order.payment_method);
  } else if (newStatus === "cancelled" && order.status !== "cancelled") {
    await releaseStock(id);
  } else {
    await prisma.order.update({ where: { id }, data: { status: newStatus } });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
