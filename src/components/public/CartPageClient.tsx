"use client";

import { useCartStore } from "@/store/cart";
import { formatARS } from "@/lib/utils";
import { WHOLESALE_MIN_ORDER_TOTAL, WHOLESALE_MIN_UNITS_PER_ITEM } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, AlertCircle, CheckCircle } from "lucide-react";

export default function CartPageClient() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();
  const meetsMinimum = total >= WHOLESALE_MIN_ORDER_TOTAL;
  const remaining = WHOLESALE_MIN_ORDER_TOTAL - total;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} strokeWidth={1} className="mx-auto text-nl-pink opacity-30 mb-4" />
        <h1 className="font-playfair text-3xl font-bold text-nl-text mb-2">Tu carrito está vacío</h1>
        <p className="text-nl-gray-dark mb-6">Explorá nuestros productos y empezá tu pedido.</p>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-nl-pink text-white rounded-2xl font-semibold hover:bg-nl-pink-dark transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-playfair text-4xl font-bold text-nl-text mb-8">Mi carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.color}`} className="nl-card p-4 flex gap-4">
              <div className="w-24 h-24 bg-nl-gray rounded-xl shrink-0 relative overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full bg-nl-pink-light" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-nl-text leading-tight mb-0.5">{item.name}</p>
                <p className="label-tag text-nl-gray-dark text-[10px] mb-3">Color: {item.color}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.color, item.quantity - 1)}
                      className="px-3 py-1.5 text-sm hover:bg-nl-gray transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm border-x border-border min-w-[2.5rem] text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.color, item.quantity + 1)}
                      className="px-3 py-1.5 text-sm hover:bg-nl-gray transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="price-text">{formatARS(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.product_id, item.color)}
                      className="text-nl-gray-dark hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {item.quantity < WHOLESALE_MIN_UNITS_PER_ITEM && (
                  <p className="label-tag text-red-500 text-[9px] mt-1">
                    MÍNIMO {WHOLESALE_MIN_UNITS_PER_ITEM} UNIDADES
                  </p>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="label-tag text-nl-gray-dark hover:text-red-500 transition-colors text-[10px] mt-2"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="nl-card p-5 sticky top-24">
            <h2 className="font-playfair text-xl font-semibold mb-4">Resumen del pedido</h2>

            <div className="space-y-2 mb-4 text-sm">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.color}`} className="flex justify-between">
                  <span className="text-nl-gray-dark">{item.name} ({item.color}) ×{item.quantity}</span>
                  <span>{formatARS(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="price-text text-xl">{formatARS(total)}</span>
              </div>
            </div>

            {/* Estado del mínimo */}
            {meetsMinimum ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <CheckCircle size={14} className="text-green-600 shrink-0" />
                <p className="text-xs text-green-700">¡Pedido mínimo alcanzado!</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-nl-blue-light border border-nl-blue/20 rounded-xl p-3 mb-4">
                <AlertCircle size={14} className="text-nl-blue shrink-0 mt-0.5" />
                <p className="text-xs text-nl-blue-dark">
                  Te falta <strong>{formatARS(remaining)}</strong> para el pedido mínimo ({formatARS(WHOLESALE_MIN_ORDER_TOTAL)}).
                </p>
              </div>
            )}

            <div className="text-xs text-nl-gray-dark mb-4 p-3 bg-nl-gray rounded-xl">
              <p className="font-medium mb-1">🚚 Envío</p>
              <p>El costo del envío se acuerda una vez hecho el pedido.</p>
            </div>

            {meetsMinimum ? (
              <Link
                href="/checkout"
                className="block w-full text-center py-4 bg-nl-pink text-white rounded-2xl font-semibold hover:bg-nl-pink-dark transition-colors"
              >
                Continuar al pago
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-nl-gray text-nl-gray-dark rounded-2xl font-semibold cursor-not-allowed"
              >
                Mínimo no alcanzado
              </button>
            )}

            <Link href="/productos" className="block text-center text-sm text-nl-pink hover:underline mt-3">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
