import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import ProductCard from "@/components/public/ProductCard";
import type { ProductPublic, ColorVariant, NLCategory } from "@/types";
import { NL_CATEGORIES } from "@/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Productos" };
export const revalidate = 60;

interface Props {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}

async function getProducts(categoria?: string, q?: string): Promise<ProductPublic[]> {
  const products = await prisma.product.findMany({
    where: {
      is_published: true,
      ...(categoria ? { category: categoria } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { created_at: "desc" },
  });

  return products.map((p) => ({
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    description:    p.description,
    category:       p.category as NLCategory,
    images:         p.images,
    tags:           p.tags,
    price_sale:     Number(p.price_sale),
    color_variants: p.color_variants as unknown as ColorVariant[],
    is_published:   p.is_published,
    created_at:     p.created_at.toISOString(),
    updated_at:     p.updated_at.toISOString(),
  }));
}

export default async function ProductosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categoria = sp.categoria as NLCategory | undefined;
  const q = sp.q;
  const products = await getProducts(categoria, q);

  const catLabel = categoria
    ? NL_CATEGORIES.find((c) => c.value === categoria)?.label
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair text-4xl font-bold text-nl-text mb-1">
          {catLabel ?? "Todos los productos"}
        </h1>
        {q && (
          <p className="text-nl-gray-dark text-sm">Búsqueda: &ldquo;{q}&rdquo;</p>
        )}
        <p className="label-tag text-nl-gray-dark mt-1">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/productos"
          className={`label-tag px-4 py-2 rounded-full border text-[11px] transition-colors ${
            !categoria
              ? "bg-nl-pink text-white border-nl-pink"
              : "border-border text-nl-text hover:border-nl-pink hover:text-nl-pink"
          }`}
        >
          TODOS
        </Link>
        {NL_CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/productos?categoria=${cat.value}`}
            className={`label-tag px-4 py-2 rounded-full border text-[11px] transition-colors ${
              categoria === cat.value
                ? "bg-nl-pink text-white border-nl-pink"
                : "border-border text-nl-text hover:border-nl-pink hover:text-nl-pink"
            }`}
          >
            {cat.label.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🧸</p>
          <p className="font-playfair text-2xl text-nl-text mb-2">No hay productos disponibles</p>
          <p className="text-nl-gray-dark text-sm">Probá con otra categoría o volvé pronto.</p>
          <Link href="/productos" className="mt-6 inline-block text-nl-pink hover:underline text-sm font-semibold">
            Ver todos los productos →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
