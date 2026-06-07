import type { Metadata } from "next";
import ContactClient from "@/components/public/ContactClient";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return <ContactClient />;
}
