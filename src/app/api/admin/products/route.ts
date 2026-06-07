import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import slugify from "slugify";

const schema = z.object({
  name:           z.string().min(1),
  description:    z.string().default(""),
  category:       z.string(),
  price_sale:     z.number().positive(),
  price_cost:     z.number().min(0).default(0),
  tags:           z.array(z.string()).default([]),
  color_variants: z.array(z.object({
    name:   z.string(),
    images: z.array(z.string()),
    stock:  z.number().int().min(0),
  })).default([]),
  images:         z.array(z.string()).default([]),
  is_published:   z.boolean().default(false),
});

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const products = await prisma.product.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(products.map((p) => ({
    ...p,
    price_sale: Number(p.price_sale),
    price_cost: Number(p.price_cost),
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  })));
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body   = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d    = parsed.data;
  const base = slugify(d.name, { lower: true, strict: true });
  const slug = `${base}-${Date.now()}`;

  const product = await prisma.product.create({
    data: {
      name:           d.name,
      slug,
      description:    d.description,
      category:       d.category,
      price_sale:     d.price_sale,
      price_cost:     d.price_cost,
      tags:           d.tags,
      color_variants: d.color_variants,
      images:         d.images.length ? d.images : (d.color_variants[0]?.images ?? []),
      is_published:   d.is_published,
    },
  });

  return NextResponse.json({
    ...product,
    price_sale: Number(product.price_sale),
    price_cost: Number(product.price_cost),
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  }, { status: 201 });
}
