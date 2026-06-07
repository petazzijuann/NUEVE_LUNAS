import Image from "next/image";
import Link from "next/link";
import { formatARS } from "@/lib/utils";
import type { ProductPublic } from "@/types";

export default function ProductCard({ product }: { product: ProductPublic }) {
  const img1 = product.images[0] ?? product.color_variants[0]?.images[0];
  const img2 = product.images[1] ?? product.color_variants[0]?.images[1];
  const totalStock = product.color_variants.reduce((s, v) => s + v.stock, 0);
  const colorCount = product.color_variants.length;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      {/* Imagen */}
      <div className="relative aspect-square bg-nl-gray overflow-hidden mb-3 rounded-xl">
        {img1 ? (
          <>
            <Image
              src={img1}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.04]${
                img2 ? " group-hover:opacity-0" : ""
              }`}
            />
            {img2 && (
              <Image
                src={img2}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 scale-[1.04] group-hover:opacity-100 transition-opacity duration-500 ease-out"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-nl-pink-light flex items-center justify-center">
            <span className="label-tag text-nl-pink">SIN IMAGEN</span>
          </div>
        )}

        {/* Badge categoría */}
        <div className="absolute top-2.5 left-2.5">
          <span className="label-tag bg-nl-pink text-white px-2 py-0.5 rounded-full text-[9px]">
            {product.category.toUpperCase()}
          </span>
        </div>

        {/* Sin stock */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="label-tag text-nl-gray-dark bg-white px-3 py-1 rounded-full border border-border">
              SIN STOCK
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="font-playfair text-base font-semibold leading-tight group-hover:text-nl-pink transition-colors duration-200">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1.5">
          <p className="price-text">{formatARS(product.price_sale)}</p>
          {colorCount > 0 && (
            <p className="label-tag text-nl-gray-dark text-[9px]">
              {colorCount} {colorCount === 1 ? "COLOR" : "COLORES"}
            </p>
          )}
        </div>

        <p className="label-tag text-nl-gray-dark text-[9px] mt-0.5">
          MÍN. 3 UNIDADES
        </p>
      </div>
    </Link>
  );
}
