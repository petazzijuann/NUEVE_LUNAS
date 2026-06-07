import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { formatARS } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard | Admin" };
export const dynamic = "force-dynamic";

async function getMetrics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sales, pendingOrders, totalProducts, confirmedOrders] = await Promise.all([
    prisma.sale.findMany({ where: { created_at: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "pending_payment" } }),
    prisma.product.count({ where: { is_published: true } }),
    prisma.order.count({ where: { status: "payment_confirmed", created_at: { gte: startOfMonth } } }),
  ]);

  const revenue = sales.reduce((s, r) => s + Number(r.sale_price) * r.quantity, 0);
  const cogs    = sales.reduce((s, r) => s + Number(r.cost_price)  * r.quantity, 0);
  const profit  = revenue - cogs;

  return { revenue, profit, pendingOrders, totalProducts, confirmedOrders };
}

export default async function AdminDashboard() {
  const m = await getMetrics();

  const CARDS = [
    { label: "Revenue del mes",  value: formatARS(m.revenue),          color: "bg-nl-pink-light    border-nl-pink/20"   },
    { label: "Ganancia del mes", value: formatARS(m.profit),           color: "bg-nl-blue-light   border-nl-blue/20"   },
    { label: "Pedidos pendientes", value: String(m.pendingOrders),     color: "bg-amber-50        border-amber-200"     },
    { label: "Pedidos confirmados (mes)", value: String(m.confirmedOrders), color: "bg-green-50   border-green-200"   },
    { label: "Productos publicados", value: String(m.totalProducts),   color: "bg-nl-gray         border-border"       },
  ];

  return (
    <div>
      <h1 className="font-playfair text-3xl font-bold text-nl-text mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CARDS.map((c) => (
          <div key={c.label} className={`rounded-2xl border p-5 ${c.color}`}>
            <p className="label-tag text-[10px] text-nl-gray-dark mb-1">{c.label.toUpperCase()}</p>
            <p className="font-playfair text-3xl font-bold text-nl-text">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickLinks />
      </div>
    </div>
  );
}

function QuickLinks() {
  const links = [
    { href: "/admin/pedidos",   label: "Ver pedidos pendientes",   desc: "Gestionar y aprobar pedidos" },
    { href: "/admin/productos", label: "Gestionar productos",      desc: "Agregar, editar y publicar" },
    { href: "/admin/cupones",   label: "Cupones de descuento",     desc: "Crear y gestionar cupones" },
  ];

  return (
    <div className="nl-card p-5">
      <h2 className="font-playfair text-xl font-semibold mb-4">Accesos rápidos</h2>
      <div className="space-y-2">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="flex items-center justify-between p-3 rounded-xl hover:bg-nl-pink-light transition-colors group">
            <div>
              <p className="font-medium text-sm group-hover:text-nl-pink transition-colors">{l.label}</p>
              <p className="text-xs text-nl-gray-dark">{l.desc}</p>
            </div>
            <span className="text-nl-pink text-lg">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
