import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email inválido" }, { status: 400 });

  await prisma.subscriber.upsert({
    where:  { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
