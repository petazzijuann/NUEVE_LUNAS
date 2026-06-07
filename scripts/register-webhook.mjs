const token  = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_SECRET;
const base   = process.env.NEXT_PUBLIC_BASE_URL;

if (!token || !secret || !base) {
  console.error("Faltan env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_SECRET, NEXT_PUBLIC_BASE_URL");
  process.exit(1);
}

const url = `${base}/api/telegram/webhook`;
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url, secret_token: secret, drop_pending_updates: true }),
});

const data = await res.json();
console.log(data.ok ? `✅ Webhook registrado: ${url}` : `❌ Error: ${data.description}`);
