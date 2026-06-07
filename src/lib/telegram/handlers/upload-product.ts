import type { Context } from "telegraf";
import { prisma } from "@/lib/prisma/client";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { getSession, setState, clearState } from "@/lib/telegram/state";
import slugify from "slugify";
import { NL_CATEGORIES } from "@/types";

const CATEGORY_LIST = NL_CATEGORIES.map((c, i) => `${i + 1}. ${c.label} (${c.value})`).join("\n");

export async function handleUploadProduct(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  await setState(chatId, "upload:name");
  await ctx.reply(
    "📦 *Nuevo producto*\n\nEscribí el *nombre* del producto:",
    { parse_mode: "Markdown" }
  );
}

export async function handleUploadMessage(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  const session = await getSession(chatId);
  const data = session.data as Record<string, unknown>;
  const text = "text" in ctx.message! ? (ctx.message as { text: string }).text : "";

  if (session.state === "upload:name") {
    await setState(chatId, "upload:category", { ...data, name: text });
    await ctx.reply(
      `Categoría:\n${CATEGORY_LIST}\n\nEscribí el número:`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (session.state === "upload:category") {
    const idx = parseInt(text) - 1;
    const cat = NL_CATEGORIES[idx];
    if (!cat) { await ctx.reply("Número inválido. Enviá solo el número."); return; }
    await setState(chatId, "upload:price_sale", { ...data, category: cat.value });
    await ctx.reply("💰 Precio de venta (mayorista, ej: 15000):");
    return;
  }

  if (session.state === "upload:price_sale") {
    const price = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (isNaN(price)) { await ctx.reply("Precio inválido. Solo números."); return; }
    await setState(chatId, "upload:price_cost", { ...data, price_sale: price });
    await ctx.reply("💸 Precio de costo (ej: 8000):");
    return;
  }

  if (session.state === "upload:price_cost") {
    const cost = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (isNaN(cost)) { await ctx.reply("Precio inválido. Solo números."); return; }
    await setState(chatId, "upload:description", { ...data, price_cost: cost });
    await ctx.reply("📝 Escribí la descripción del producto:");
    return;
  }

  if (session.state === "upload:description") {
    await setState(chatId, "upload:colors", { ...data, description: text, colors: [] });
    await ctx.reply(
      "🎨 Ahora enviá los colores disponibles (uno por mensaje).\n" +
      "Cuando termines los colores escribí *listo*.",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (session.state === "upload:colors") {
    if (text.toLowerCase() === "listo") {
      const colors = (data.colors as string[]) ?? [];
      if (colors.length === 0) { await ctx.reply("Necesitás al menos 1 color."); return; }
      // Iniciar carga de fotos por color
      await setState(chatId, `upload:photos:0`, { ...data, current_color_idx: 0, color_variants: [] });
      await ctx.reply(
        `📸 Enviá las fotos del color *${colors[0]}* (una por mensaje).\n` +
        "Cuando termines escribí *siguiente*.",
        { parse_mode: "Markdown" }
      );
    } else {
      const colors = [...((data.colors as string[]) ?? []), text.trim()];
      await setState(chatId, "upload:colors", { ...data, colors });
      await ctx.reply(`✅ Color "${text.trim()}" agregado. Enviá otro o escribí *listo*.`, { parse_mode: "Markdown" });
    }
    return;
  }

  if (session.state?.startsWith("upload:photos:")) {
    if (text.toLowerCase() === "siguiente") {
      const colors = data.colors as string[];
      const idx = (data.current_color_idx as number) ?? 0;
      const variants = (data.color_variants as object[]) ?? [];

      if (idx >= colors.length - 1) {
        // Todos los colores cargados → crear producto
        await createProduct(ctx, data, variants);
        await clearState(chatId);
      } else {
        const nextIdx = idx + 1;
        await setState(chatId, `upload:photos:${nextIdx}`, {
          ...data,
          current_color_idx: nextIdx,
          color_variants: variants,
        });
        await ctx.reply(
          `📸 Enviá las fotos del color *${colors[nextIdx]}*. Cuando termines escribí *siguiente*.`,
          { parse_mode: "Markdown" }
        );
      }
    }
    return;
  }
}

export async function handleUploadPhoto(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  const session = await getSession(chatId);
  if (!session.state?.startsWith("upload:photos:")) return;

  const data = session.data as Record<string, unknown>;
  const colors = data.colors as string[];
  const idx = (data.current_color_idx as number) ?? 0;
  const variants = (data.color_variants as Array<{ name: string; images: string[]; stock: number }>) ?? [];

  const msg = ctx.message as { photo?: Array<{ file_id: string }> };
  const photo = msg.photo?.at(-1);
  if (!photo) return;

  const fileLink = await ctx.telegram.getFileLink(photo.file_id);
  const cloudUrl = await uploadToCloudinary(fileLink.href);

  // Agregar foto al color actual
  const existingVariant = variants.find((v) => v.name === colors[idx]);
  if (existingVariant) {
    existingVariant.images.push(cloudUrl);
  } else {
    variants.push({ name: colors[idx], images: [cloudUrl], stock: 999 });
  }

  await setState(chatId, session.state, { ...data, color_variants: variants });
  await ctx.reply(`✅ Foto subida para ${colors[idx]}. Enviá más o escribí *siguiente*.`, { parse_mode: "Markdown" });
}

async function createProduct(
  ctx: Context,
  data: Record<string, unknown>,
  variantsRaw: object[]
) {
  const name        = data.name as string;
  const category    = data.category as string;
  const description = (data.description as string | undefined) ?? "";

  const variants = variantsRaw as Array<{ name: string; images: string[]; stock: number }>;

  // Stock inicial 0 (admin lo actualiza desde el panel)
  const slug = slugify(name, { lower: true, strict: true }) + "-" + Date.now();

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      category,
      images:         variants[0]?.images ?? [],
      tags:           [],
      price_sale:     data.price_sale as number,
      price_cost:     data.price_cost as number,
      color_variants: variants,
      is_published:   false,
    },
  });

  await ctx.reply(
    `✅ *Producto creado* (sin publicar)\n\n` +
    `*${name}*\nSlug: \`${product.slug}\`\n` +
    `Precio: $${data.price_sale}\n` +
    `Colores: ${variants.map((v) => v.name).join(", ")}\n\n` +
    `Ingresá al admin para publicarlo.`,
    { parse_mode: "Markdown" }
  );
}
