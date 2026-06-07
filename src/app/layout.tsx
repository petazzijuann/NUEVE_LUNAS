import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://nuevelunas.vercel.app";

export const metadata: Metadata = {
  title: {
    template: "%s | Nueve Lunas",
    default:  "Nueve Lunas — Ropa y Accesorios para Bebés y Mamás",
  },
  description:
    "Tienda mayorista argentina de ropa y accesorios para bebés y futuras mamás. Almohadones, mantas, nidos, cambiadores y más.",
  keywords:    ["nueve lunas", "ropa bebé mayorista", "accesorios bebé", "futura mamá", "canastilla"],
  authors:     [{ name: "Nueve Lunas" }],
  metadataBase: new URL(BASE),
  openGraph: {
    siteName: "Nueve Lunas",
    type:     "website",
    locale:   "es_AR",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
