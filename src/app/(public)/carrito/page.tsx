import type { Metadata } from "next";
import CartPageClient from "@/components/public/CartPageClient";

export const metadata: Metadata = { title: "Carrito" };

export default function CarritoPage() {
  return <CartPageClient />;
}
