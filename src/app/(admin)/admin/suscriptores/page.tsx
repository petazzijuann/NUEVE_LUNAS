import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";

export const metadata: Metadata = { title: "Suscriptores | Admin" };
export const dynamic = "force-dynamic";

export default async function SuscriptoresPage() {
  const subs = await prisma.subscriber.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-3xl font-bold text-nl-text">Suscriptores</h1>
        <span className="label-tag text-nl-pink text-[11px]">{subs.length} EMAILS</span>
      </div>

      <div className="nl-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-nl-gray">
              <th className="label-tag text-[10px] text-left px-4 py-3">EMAIL</th>
              <th className="label-tag text-[10px] text-left px-4 py-3">FECHA</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-nl-gray/40 transition-colors">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-nl-gray-dark text-xs">
                  {new Date(s.created_at).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && (
          <div className="text-center py-10 text-nl-gray-dark">
            <p className="label-tag">NO HAY SUSCRIPTORES</p>
          </div>
        )}
      </div>
    </div>
  );
}
