import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import ProductPageClient from "@/components/public/ProductPageClient";
import type { ProductPublic, ColorVariant, NLCategory } from "@/types";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
  };
}

export const revalidate = 60;

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const raw = await prisma.product.findUnique({ where: { slug, is_published: true } });
  if (!raw) notFound();

  const product: ProductPublic = {
    id:             raw.id,
    name:           raw.name,
    slug:           raw.slug,
    description:    raw.description,
    category:       raw.category as NLCategory,
    images:         raw.images,
    tags:           raw.tags,
    price_sale:     Number(raw.price_sale),
    color_variants: raw.color_variants as unknown as ColorVariant[],
    is_published:   raw.is_published,
    created_at:     raw.created_at.toISOString(),
    updated_at:     raw.updated_at.toISOString(),
  };

  return <ProductPageClient product={product} />;
}
