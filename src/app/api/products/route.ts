import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import type { ColorVariant } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  const q         = searchParams.get("q");

  const products = await prisma.product.findMany({
    where: {
      is_published: true,
      ...(categoria ? { category: categoria } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      id:             p.id,
      name:           p.name,
      slug:           p.slug,
      description:    p.description,
      category:       p.category,
      images:         p.images,
      tags:           p.tags,
      price_sale:     Number(p.price_sale),
      color_variants: p.color_variants as unknown as ColorVariant[],
      is_published:   p.is_published,
      created_at:     p.created_at.toISOString(),
      updated_at:     p.updated_at.toISOString(),
    }))
  );
}
