import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma/client";
import ProductCard from "@/components/public/ProductCard";
import type { ProductPublic, ColorVariant } from "@/types";

export const metadata: Metadata = { title: "Inicio" };

export const revalidate = 60;

async function getFeaturedProducts(): Promise<ProductPublic[]> {
  try {
    const products = await prisma.product.findMany({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
      take: 8,
    });
    return products.map((p) => ({
      id:             p.id,
      name:           p.name,
      slug:           p.slug,
      description:    p.description,
      category:       p.category as ProductPublic["category"],
      images:         p.images,
      tags:           p.tags,
      price_sale:     Number(p.price_sale),
      color_variants: p.color_variants as unknown as ColorVariant[],
      is_published:   p.is_published,
      created_at:     p.created_at.toISOString(),
      updated_at:     p.updated_at.toISOString(),
    }));
  } catch {
    return [];
  }
}

const CATEGORIAS = [
  { name: "Almohadones",  icon: "🤰",  href: "/productos?categoria=almohadones" },
  { name: "Mantas",       icon: "🌙",  href: "/productos?categoria=mantas" },
  { name: "Nidos",        icon: "🐣",  href: "/productos?categoria=nidos" },
  { name: "Reductores",   icon: "🛒",  href: "/productos?categoria=reductores" },
  { name: "Cambiadores",  icon: "👶",  href: "/productos?categoria=cambiadores" },
  { name: "Colchones",    icon: "🛏️",  href: "/productos?categoria=colchones" },
  { name: "Sets",         icon: "🎁",  href: "/productos?categoria=sets" },
  { name: "Toallón",      icon: "🛁",  href: "/productos?categoria=toallon" },
];

const MARQUEE_ITEMS = [
  "NUEVE LUNAS", "FUTURA MAMÁ", "MAYORISTA", "BEBÉS CON AMOR",
  "SAN NICOLÁS, BA", "CALIDAD PREMIUM", "COLORES ÚNICOS", "ENVÍOS A TODO EL PAÍS",
];

export default async function LandingPage() {
  const products = await getFeaturedProducts();

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-nl-pink-light via-white to-nl-blue-light overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-nl-pink/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] bg-nl-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full py-20">
          <div className="max-w-2xl animate-fade-up">
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="Nueve Lunas"
                width={800}
                height={280}
                className="h-64 w-auto object-contain"
              />
            </div>
            <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-nl-text mb-4">
              Todo el amor para{" "}
              <span className="text-nl-pink">tu bebé</span>
            </h1>
            <p className="text-lg text-nl-gray-dark leading-relaxed mb-3 font-inter">
              Somos tu mayorista de accesorios para bebé y futuras mamás.
            </p>
            <p className="label-tag text-nl-blue mb-8">
              MÍNIMO 3 UNIDADES · PEDIDO MÍNIMO $300.000 · ENVÍO A TODO EL PAÍS
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center px-8 py-4 bg-nl-pink text-white rounded-2xl font-semibold text-base hover:bg-nl-pink-dark transition-colors shadow-lg"
              >
                Ver catálogo completo
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-nl-pink border-2 border-nl-pink rounded-2xl font-semibold text-base hover:bg-nl-pink-light transition-colors"
              >
                Contactanos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-nl-pink py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="label-tag text-white mx-6 shrink-0">
              {item} ·
            </span>
          ))}
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="label-tag text-nl-pink mb-3">NUESTRA HISTORIA</p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-nl-text mb-5 leading-tight">
              Nueve Lunas nació del amor por los bebés
            </h2>
            <p className="text-nl-gray-dark leading-relaxed mb-4">
              Nueve Lunas es una tienda mayorista argentina que nació con la misión de ofrecer
              productos de calidad para los momentos más especiales: el embarazo, el nacimiento
              y los primeros meses de vida.
            </p>
            <p className="text-nl-gray-dark leading-relaxed mb-6">
              Trabajamos con materiales suaves y seguros, pensados para el bienestar del bebé
              y la tranquilidad de mamá. Cada producto está elegido con cuidado y viene en
              colores únicos que hacen especial cada espacio.
            </p>
            <p className="label-tag text-nl-blue-dark">📍 San Nicolás, Buenos Aires · Envíos a todo el país</p>
          </div>
          <div className="relative">
            <div className="aspect-square bg-nl-pink-light rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="text-center p-12">
                <div className="text-7xl mb-4">🌙</div>
                <p className="font-playfair text-2xl text-nl-pink font-semibold">Con amor, desde el primer día</p>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-nl-pink text-white rounded-2xl px-4 py-2 shadow-lg">
              <p className="label-tag text-[10px]">MAYORISTA</p>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-nl-blue text-white rounded-2xl px-4 py-2 shadow-lg">
              <p className="label-tag text-[10px]">CALIDAD PREMIUM</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="bg-nl-gray py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-10">
            <p className="label-tag text-nl-pink mb-2">NUESTROS PRODUCTOS</p>
            <h2 className="font-playfair text-4xl font-bold text-nl-text">¿Qué vendemos?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-white rounded-2xl p-5 text-center hover:shadow-md hover:border-nl-pink border-2 border-transparent transition-all group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="label-tag text-nl-text group-hover:text-nl-pink transition-colors text-[11px]">
                  {cat.name.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO COMPRAR */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="text-center mb-12">
          <p className="label-tag text-nl-pink mb-2">COMPRA MAYORISTA</p>
          <h2 className="font-playfair text-4xl font-bold text-nl-text mb-3">¿Cómo funciona?</h2>
          <p className="text-nl-gray-dark max-w-xl mx-auto">
            Somos una tienda mayorista. Nuestros precios ya están calculados para reventa.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Elegí tus productos",
              desc: "Navegá el catálogo y seleccioná los productos que más te gusten. Mínimo 3 unidades por producto.",
              color: "bg-nl-pink-light",
              accent: "text-nl-pink",
            },
            {
              num: "02",
              title: "Realizá tu pedido",
              desc: "Completá el checkout con tus datos. Pedido mínimo $300.000.",
              color: "bg-nl-blue-light",
              accent: "text-nl-blue",
            },
            {
              num: "03",
              title: "Recibís en tu domicilio",
              desc: "Coordinamos el envío. El costo del envío corre por cuenta del cliente.",
              color: "bg-nl-pink-light",
              accent: "text-nl-pink",
            },
          ].map((step) => (
            <div key={step.num} className={`${step.color} rounded-2xl p-7`}>
              <p className={`font-playfair text-4xl font-bold ${step.accent} mb-3`}>{step.num}</p>
              <h3 className="font-playfair text-xl font-semibold text-nl-text mb-2">{step.title}</h3>
              <p className="text-sm text-nl-gray-dark leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {products.length > 0 && (
        <section className="bg-nl-gray py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="label-tag text-nl-pink mb-1">CATÁLOGO</p>
                <h2 className="font-playfair text-4xl font-bold text-nl-text">Productos destacados</h2>
              </div>
              <Link href="/productos" className="text-sm text-nl-pink hover:underline font-semibold hidden sm:block">
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center px-10 py-4 bg-nl-pink text-white rounded-2xl font-semibold hover:bg-nl-pink-dark transition-colors shadow-md"
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bg-gradient-to-br from-nl-pink to-nl-pink-dark py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-white mb-4">
            ¿Querés ser revendedor?
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Contactanos por WhatsApp o Instagram y te asesoramos en tu primer pedido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-nl-pink rounded-2xl font-semibold hover:bg-nl-pink-light transition-colors"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white/10 transition-colors"
            >
              Hablar con nosotros
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
