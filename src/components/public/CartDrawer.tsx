"use client";

import { useEffect } from "react";
import { X, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";
import { WHOLESALE_MIN_ORDER_TOTAL, WHOLESALE_MIN_UNITS_PER_ITEM } from "@/types";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const total = totalPrice();
  const meetsMinimum = total >= WHOLESALE_MIN_ORDER_TOTAL;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <p className="font-playfair text-xl font-semibold">
            Carrito
            {items.length > 0 && (
              <span className="font-inter text-sm font-normal text-nl-gray-dark ml-2">
                ({items.length} {items.length === 1 ? "producto" : "productos"})
              </span>
            )}
          </p>
          <button onClick={closeCart} className="p-1 hover:text-nl-pink transition-colors" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Aviso mínimo */}
        {items.length > 0 && !meetsMinimum && (
          <div className="mx-4 mt-3 flex items-start gap-2 bg-nl-blue-light border border-nl-blue rounded-xl p-3">
            <AlertCircle size={14} className="text-nl-blue shrink-0 mt-0.5" />
            <p className="text-xs text-nl-blue-dark leading-snug">
              Pedido mínimo {formatARS(WHOLESALE_MIN_ORDER_TOTAL)}. Te falta{" "}
              <strong>{formatARS(WHOLESALE_MIN_ORDER_TOTAL - total)}</strong> para completar el mínimo.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-nl-gray-dark">
              <ShoppingBag size={48} strokeWidth={1} className="text-nl-pink opacity-40" />
              <p className="label-tag">TU CARRITO ESTÁ VACÍO</p>
              <Link
                href="/productos"
                onClick={closeCart}
                className="text-sm text-nl-pink hover:underline mt-1"
              >
                Ver productos →
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={`${item.product_id}-${item.color}`} className="flex gap-4">
                  <div className="w-20 h-20 bg-nl-gray rounded-lg shrink-0 relative overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full bg-nl-pink-light" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-medium text-sm leading-tight">{item.name}</p>
                      <p className="label-tag text-nl-gray-dark mt-0.5 text-[10px]">
                        Color: {item.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.color, item.quantity - 1)}
                          className="px-2.5 py-1 text-sm hover:bg-nl-gray transition-colors"
                        >
                          −
                        </button>
                        <span className="px-2.5 py-1 text-sm border-x border-border min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.color, item.quantity + 1)}
                          className="px-2.5 py-1 text-sm hover:bg-nl-gray transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="price-text text-sm">{formatARS(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.product_id, item.color)}
                          className="text-nl-gray-dark hover:text-red-500 transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border">
            <p className="label-tag text-[9px] text-nl-gray-dark mb-2">
              MÍN. {WHOLESALE_MIN_UNITS_PER_ITEM} UNIDADES POR PRODUCTO
            </p>
            <div className="flex items-center justify-between mb-4">
              <p className="label-tag">SUBTOTAL</p>
              <p className="price-text text-lg">{formatARS(total)}</p>
            </div>
            {meetsMinimum ? (
              <Link
                href="/carrito"
                onClick={closeCart}
                className="block w-full bg-nl-pink text-white text-center py-3.5 rounded-xl font-semibold text-sm hover:bg-nl-pink-dark transition-colors"
              >
                Ver carrito y pagar
              </Link>
            ) : (
              <button
                disabled
                className="block w-full bg-nl-gray text-nl-gray-dark text-center py-3.5 rounded-xl font-semibold text-sm cursor-not-allowed"
              >
                Mínimo no alcanzado
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
