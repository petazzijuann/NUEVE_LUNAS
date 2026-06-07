import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nl-pink-light px-4">
      <div className="text-center">
        <p className="font-playfair text-8xl font-bold text-nl-pink mb-2">404</p>
        <p className="font-playfair text-2xl text-nl-text mb-4">Página no encontrada</p>
        <p className="text-nl-gray-dark mb-8">El contenido que buscás no existe o fue movido.</p>
        <Link
          href="/landing"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-nl-pink text-white rounded-2xl font-semibold hover:bg-nl-pink-dark transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
