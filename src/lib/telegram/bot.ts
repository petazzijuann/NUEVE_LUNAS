import { Telegraf } from "telegraf";
import {
  handleUploadProduct,
  handleUploadMessage,
  handleUploadPhoto,
} from "./handlers/upload-product";
import { handleMetrics } from "./handlers/metrics";
import { getSession } from "./state";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN no definido");

export const bot = new Telegraf(token);

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "";

function isAdmin(chatId: string | number) {
  return String(chatId) === ADMIN_CHAT_ID;
}

bot.start(async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  await ctx.reply(
    "👶 *Nueve Lunas Admin*\n\n" +
    "/nuevo — Cargar nuevo producto\n" +
    "/metricas — Ver métricas del mes\n" +
    "/ayuda — Lista de comandos",
    { parse_mode: "Markdown" }
  );
});

bot.command("ayuda", async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  await ctx.reply(
    "📋 *Comandos disponibles*\n\n" +
    "/nuevo — Cargar nuevo producto con fotos\n" +
    "/metricas — Ver métricas de ventas del mes\n" +
    "/ayuda — Esta ayuda",
    { parse_mode: "Markdown" }
  );
});

bot.command("nuevo", async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  await handleUploadProduct(ctx);
});

bot.command("metricas", async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  await handleMetrics(ctx);
});

// Manejar fotos en flujo de carga
bot.on("photo", async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const session = await getSession(String(ctx.chat.id));
  if (session.state?.startsWith("upload:photos:")) {
    await handleUploadPhoto(ctx);
  }
});

// Manejar texto en flujos activos
bot.on("text", async (ctx) => {
  if (!isAdmin(ctx.chat.id)) return;
  const session = await getSession(String(ctx.chat.id));
  if (session.state !== "idle") {
    await handleUploadMessage(ctx);
  }
});

export async function processTelegramUpdate(body: object) {
  await bot.handleUpdate(body as Parameters<typeof bot.handleUpdate>[0]);
}
