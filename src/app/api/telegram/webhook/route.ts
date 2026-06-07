import { NextRequest, NextResponse } from "next/server";
import { processTelegramUpdate } from "@/lib/telegram/bot";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Procesamiento async — respondemos 200 inmediatamente
  processTelegramUpdate(body).catch(console.error);
  return NextResponse.json({ ok: true });
}
