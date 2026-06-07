"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";
import type { ProductPublic, ColorVariant } from "@/types";
import { WHOLESALE_MIN_UNITS_PER_ITEM } from "@/types";
import Link from "next/link";
import { NL_CATEGORIES } from "@/types";

export default function ProductPageClient({ product }: { product: ProductPublic }) {
  const { addItem } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(
    product.color_variants[0] ?? null
  );
  const [quantity, setQuantity] = useState(WHOLESALE_MIN_UNITS_PER_ITEM);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const images = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images;

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      product_id: product.id,
      slug:       product.slug,
      name:       product.name,
      image:      images[0] ?? "",
      color:      selectedVariant.name,
      price:      product.price_sale,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const catLabel = NL_CATEGORIES.find((c) => c.value === product.category)?.label;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 label-tag text-nl-gray-dark mb-8 text-[10px]">
        <Link href="/productos" className="hover:text-nl-pink transition-colors">Productos</Link>
        <span>›</span>
        <Link href={`/productos?categoria=${product.category}`} className="hover:text-nl-pink transition-colors">
          {catLabel}
        </Link>
        <span>›</span>
        <span className="text-nl-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Galería */}
        <div>
          <div className="relative aspect-square bg-nl-gray rounded-2xl overflow-hidden mb-3">
            {images[imgIdx] ? (
              <Image src={images[imgIdx]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full bg-nl-pink-light flex items-center justify-center">
                <span className="label-tag text-nl-pink">SIN IMAGEN</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors shadow"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors shadow"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    i === imgIdx ? "border-nl-pink" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="label-tag bg-nl-pink-light text-nl-pink px-3 py-1 rounded-full text-[10px] inline-block mb-3">
            {catLabel?.toUpperCase()}
          </span>

          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-nl-text mb-3 leading-tight">
            {product.name}
          </h1>

          <p className="price-text text-3xl mb-4">{formatARS(product.price_sale)}</p>

          <p className="text-sm text-nl-gray-dark mb-6 leading-relaxed">{product.description}</p>

          {/* Regla mayorista */}
          <div className="bg-nl-blue-light border border-nl-blue/20 rounded-xl p-4 mb-6">
            <p className="label-tag text-nl-blue text-[10px] mb-1">COMPRA MAYORISTA</p>
            <p className="text-xs text-nl-blue-dark">
              Mínimo {WHOLESALE_MIN_UNITS_PER_ITEM} unidades por color. Pedido total mínimo $300.000.
            </p>
          </div>

          {/* Selector de color */}
          {product.color_variants.length > 0 && (
            <div className="mb-6">
              <p className="label-tag text-nl-text mb-3 text-[11px]">
                COLOR: {selectedVariant ? <span className="text-nl-pink">{selectedVariant.name.toUpperCase()}</span> : "SELECCIONÁ"}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.color_variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => { setSelectedVariant(v); setImgIdx(0); }}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                      selectedVariant?.name === v.name
                        ? "border-nl-pink text-nl-pink bg-nl-pink-light"
                        : "border-border text-nl-text hover:border-nl-pink hover:text-nl-pink"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div className="mb-6">
            <p className="label-tag text-nl-text mb-3 text-[11px]">CANTIDAD (MÍN. {WHOLESALE_MIN_UNITS_PER_ITEM})</p>
            <div className="flex items-center border border-border rounded-xl overflow-hidden w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(WHOLESALE_MIN_UNITS_PER_ITEM, q - 1))}
                className="px-4 py-2.5 text-base hover:bg-nl-gray transition-colors"
              >
                −
              </button>
              <span className="px-5 py-2.5 text-base border-x border-border font-semibold min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2.5 text-base hover:bg-nl-gray transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <p className="text-sm text-nl-gray-dark mb-4">
            Subtotal: <strong className="text-nl-text">{formatARS(product.price_sale * quantity)}</strong>
          </p>

          {/* Botón agregar */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="w-full flex items-center justify-center gap-2 py-4 bg-nl-pink text-white rounded-2xl font-semibold text-base hover:bg-nl-pink-dark transition-colors disabled:bg-nl-gray disabled:text-nl-gray-dark disabled:cursor-not-allowed shadow-md"
          >
            <ShoppingBag size={18} />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </button>

          {/* Envío */}
          <div className="mt-5 p-4 bg-nl-gray rounded-xl">
            <p className="label-tag text-nl-gray-dark text-[10px] mb-1">ENVÍO</p>
            <p className="text-xs text-nl-text">
              El costo del envío se acuerda una vez hecho el pedido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
