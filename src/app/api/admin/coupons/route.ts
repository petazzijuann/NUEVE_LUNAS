import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  code:         z.string().min(2),
  type:         z.enum(["percent", "fixed", "free_shipping"]),
  value:        z.number().nullable().optional(),
  stock:        z.number().int().min(1),
  min_purchase: z.number().nullable().optional(),
});

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body   = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code:         parsed.data.code.toUpperCase(),
      type:         parsed.data.type,
      value:        parsed.data.value ?? null,
      stock:        parsed.data.stock,
      min_purchase: parsed.data.min_purchase ?? null,
    },
  });

  return NextResponse.json({
    ...coupon,
    value:        coupon.value ? Number(coupon.value) : null,
    min_purchase: coupon.min_purchase ? Number(coupon.min_purchase) : null,
    expires_at:   coupon.expires_at?.toISOString() ?? null,
    created_at:   coupon.created_at.toISOString(),
    updated_at:   coupon.updated_at.toISOString(),
  }, { status: 201 });
}
