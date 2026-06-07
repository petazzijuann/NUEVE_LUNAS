import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

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

  const { id } = await params;
  const body   = await request.json().catch(() => ({}));

  const product = await prisma.product.update({
    where: { id },
    data:  {
      ...(body.name           !== undefined && { name: body.name }),
      ...(body.description    !== undefined && { description: body.description }),
      ...(body.category       !== undefined && { category: body.category }),
      ...(body.price_sale     !== undefined && { price_sale: body.price_sale }),
      ...(body.price_cost     !== undefined && { price_cost: body.price_cost }),
      ...(body.color_variants !== undefined && { color_variants: body.color_variants }),
      ...(body.images         !== undefined && { images: body.images }),
      ...(body.is_published   !== undefined && { is_published: body.is_published }),
      ...(body.tags           !== undefined && { tags: body.tags }),
    },
  });

  return NextResponse.json({
    ...product,
    price_sale: Number(product.price_sale),
    price_cost: Number(product.price_cost),
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
