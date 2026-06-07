import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import ProductsAdminClient from "@/components/admin/ProductsAdminClient";
import type { ProductAdmin, ColorVariant, NLCategory } from "@/types";

export const metadata: Metadata = { title: "Productos | Admin" };
export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const raw = await prisma.product.findMany({ orderBy: { created_at: "desc" } });

  const products: ProductAdmin[] = raw.map((p) => ({
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    description:    p.description,
    category:       p.category as NLCategory,
    images:         p.images,
    tags:           p.tags,
    price_sale:     Number(p.price_sale),
    price_cost:     Number(p.price_cost),
    color_variants: p.color_variants as unknown as ColorVariant[],
    weight_kg:      p.weight_kg,
    is_published:   p.is_published,
    created_at:     p.created_at.toISOString(),
    updated_at:     p.updated_at.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-playfair text-3xl font-bold text-nl-text mb-6">Productos</h1>
      <ProductsAdminClient products={products} />
    </div>
  );
}
