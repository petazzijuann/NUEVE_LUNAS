import type { Metadata } from "next";
import CheckoutClient from "@/components/public/CheckoutClient";

export const metadata: Metadata = { title: "Finalizar pedido" };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
