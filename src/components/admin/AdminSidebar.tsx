"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Inbox, Tag, Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",           label: "DASHBOARD",   icon: LayoutDashboard },
  { href: "/admin/pedidos",   label: "PEDIDOS",     icon: Inbox },
  { href: "/admin/productos", label: "PRODUCTOS",   icon: Package },
  { href: "/admin/cupones",   label: "CUPONES",     icon: Tag },
  { href: "/admin/suscriptores", label: "SUSCRIPTORES", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 min-h-screen bg-nl-pink flex flex-col border-r border-nl-pink-dark shrink-0">
      <div className="px-5 py-5 border-b border-nl-pink-dark">
        <Link href="/admin" className="block">
          <Image src="/logo.png" alt="Nueve Lunas" width={100} height={35} className="h-9 w-auto object-contain brightness-0 invert" />
          <p className="label-tag text-white/60 text-[9px] mt-1">ADMIN</p>
        </Link>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-3 label-tag text-[11px] transition-colors ${
                isActive
                  ? "bg-nl-pink-dark text-white"
                  : "text-white/70 hover:text-white hover:bg-nl-pink-dark/60"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-nl-pink-dark">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 label-tag text-[11px] text-white/60 hover:text-white transition-colors w-full"
        >
          <LogOut size={14} />
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
}
