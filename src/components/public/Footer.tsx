import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const insta = process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM ?? "nuevelunas.store";
  const wa    = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@nuevelunas.com.ar";

  return (
    <footer className="bg-nl-pink-light border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Logo + tagline */}
          <div>
            <Image src="/logo.png" alt="Nueve Lunas" width={400} height={140} className="h-32 w-auto object-contain mb-3" />
            <p className="text-sm text-nl-gray-dark mt-2 leading-relaxed">
              Mayorista de accesorios para bebés y futuras mamás. Con amor, desde San Nicolás, Buenos Aires.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="label-tag text-nl-pink mb-4">TIENDA</p>
            <ul className="space-y-2 text-sm text-nl-text">
              <li><Link href="/productos" className="hover:text-nl-pink transition-colors">Todos los productos</Link></li>
              <li><Link href="/productos?categoria=almohadones" className="hover:text-nl-pink transition-colors">Almohadones</Link></li>
              <li><Link href="/productos?categoria=mantas" className="hover:text-nl-pink transition-colors">Mantas</Link></li>
              <li><Link href="/productos?categoria=nidos" className="hover:text-nl-pink transition-colors">Nidos</Link></li>
              <li><Link href="/contacto" className="hover:text-nl-pink transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="label-tag text-nl-pink mb-4">CONTACTO</p>
            <ul className="space-y-2 text-sm text-nl-text">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-nl-pink transition-colors">
                    {email}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a
                    href={`https://wa.me/${wa.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-nl-pink transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {insta && (
                <li>
                  <a
                    href={`https://instagram.com/${insta}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-nl-pink transition-colors"
                  >
                    @{insta}
                  </a>
                </li>
              )}
              <li className="text-nl-gray-dark text-xs mt-2">San Nicolás, Buenos Aires</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-nl-gray-mid mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="label-tag text-nl-gray-dark text-[10px]">
            © {new Date().getFullYear()} Nueve Lunas · Todos los derechos reservados
          </p>
          <p className="label-tag text-nl-gray-dark text-[10px]">
            COMPRA MAYORISTA · SAN NICOLÁS, BA
          </p>
        </div>
      </div>
    </footer>
  );
}
