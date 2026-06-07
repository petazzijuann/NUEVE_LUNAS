import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug, is_published: true } });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({
    ...product,
    price_sale: Number(product.price_sale),
    price_cost: Number(product.price_cost),
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  });
}
