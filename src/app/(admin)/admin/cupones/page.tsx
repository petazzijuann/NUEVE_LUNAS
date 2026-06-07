import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import CouponsAdminClient from "@/components/admin/CouponsAdminClient";
import type { CouponPublic } from "@/types";

export const metadata: Metadata = { title: "Cupones | Admin" };
export const dynamic = "force-dynamic";

export default async function CuponesAdminPage() {
  const raw = await prisma.coupon.findMany({ orderBy: { created_at: "desc" } });

  const coupons: CouponPublic[] = raw.map((c) => ({
    id:           c.id,
    code:         c.code,
    type:         c.type as CouponPublic["type"],
    value:        c.value ? Number(c.value) : null,
    stock:        c.stock,
    used_count:   c.used_count,
    min_purchase: c.min_purchase ? Number(c.min_purchase) : null,
    is_active:    c.is_active,
    expires_at:   c.expires_at?.toISOString() ?? null,
    created_at:   c.created_at.toISOString(),
    updated_at:   c.updated_at.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-playfair text-3xl font-bold text-nl-text mb-6">Cupones</h1>
      <CouponsAdminClient coupons={coupons} />
    </div>
  );
}
