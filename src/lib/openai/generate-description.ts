import { openai } from "./client";

export async function generateDescription(productName: string, category: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Sos copywriter de Nueve Lunas, una tienda mayorista argentina de ropa y accesorios para bebés y mamás. " +
          "Escribís descripciones cálidas, tiernas y concisas en español rioplatense. " +
          "Máximo 80 palabras. Sin markdown. Sin emojis.",
      },
      {
        role: "user",
        content: `Escribí una descripción para el producto "${productName}" de la categoría "${category}".`,
      },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });
  return res.choices[0].message.content?.trim() ?? "";
}
