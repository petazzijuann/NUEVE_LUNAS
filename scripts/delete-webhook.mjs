const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.error("Falta TELEGRAM_BOT_TOKEN"); process.exit(1); }
const res  = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
const data = await res.json();
console.log(data.ok ? "✅ Webhook eliminado" : `❌ Error: ${data.description}`);
