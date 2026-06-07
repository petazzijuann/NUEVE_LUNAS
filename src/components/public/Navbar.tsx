"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { NL_CATEGORIES } from "@/types";

export default function Navbar() {
  const { totalItems, toggleCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const count = totalItems();

  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link href="/landing" className="shrink-0">
            <Image src="/logo.png" alt="Nueve Lunas" width={120} height={40} className="h-10 w-auto object-contain" />
          </Link>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-8 ml-4">

            {/* Productos con dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
            >
              <Link
                href="/productos"
                className="label-tag flex items-center gap-1 text-nl-text hover:text-nl-pink transition-colors"
              >
                PRODUCTOS
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                />
              </Link>

              {dropOpen && (
                <div className="absolute top-full left-0 z-40 min-w-[180px] bg-white border border-border shadow-lg rounded-b-xl overflow-hidden">
                  {NL_CATEGORIES.map(({ value, label }) => (
                    <Link
                      key={value}
                      href={`/productos?categoria=${value}`}
                      onClick={() => setDropOpen(false)}
                      className="label-tag block px-5 py-2.5 text-nl-text hover:text-nl-pink hover:bg-nl-pink-light transition-colors"
                    >
                      {label.toUpperCase()}
                    </Link>
                  ))}
                  <div className="border-t border-border">
                    <Link
                      href="/productos"
                      onClick={() => setDropOpen(false)}
                      className="label-tag block px-5 py-2.5 text-nl-pink font-bold hover:bg-nl-pink-light transition-colors"
                    >
                      VER TODO →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/contacto" className="label-tag text-nl-text hover:text-nl-pink transition-colors">
              CONTACTO
            </Link>

            <Link href="/landing" className="label-tag text-nl-text hover:text-nl-pink transition-colors">
              INICIO
            </Link>
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-3 ml-auto">

            {/* Carrito */}
            <button
              onClick={toggleCart}
              className="relative p-2 hover:text-nl-pink transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag size={22} />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-nl-pink text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </button>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 hover:text-nl-pink transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4">
          <Link
            href="/landing"
            onClick={() => setMenuOpen(false)}
            className="label-tag text-nl-text block py-2 hover:text-nl-pink"
          >
            INICIO
          </Link>
          <Link
            href="/productos"
            onClick={() => setMenuOpen(false)}
            className="label-tag text-nl-text block py-2 hover:text-nl-pink"
          >
            TODOS LOS PRODUCTOS
          </Link>
          {NL_CATEGORIES.map(({ value, label }) => (
            <Link
              key={value}
              href={`/productos?categoria=${value}`}
              onClick={() => setMenuOpen(false)}
              className="label-tag text-nl-gray-dark block py-1.5 pl-4 hover:text-nl-pink"
            >
              {label.toUpperCase()}
            </Link>
          ))}
          <Link
            href="/contacto"
            onClick={() => setMenuOpen(false)}
            className="label-tag text-nl-text block py-2 hover:text-nl-pink"
          >
            CONTACTO
          </Link>
        </div>
      )}
    </nav>
  );
}
