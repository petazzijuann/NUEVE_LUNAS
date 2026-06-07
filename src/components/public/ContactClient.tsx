"use client";

import { useState } from "react";
import { Mail, ExternalLink, MessageCircle, MapPin } from "lucide-react";

export default function ContactClient() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "ok" : "error");
  }

  const inputClass =
    "w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nl-pink transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <p className="label-tag text-nl-pink mb-2">ESCRIBINOS</p>
        <h1 className="font-playfair text-4xl font-bold text-nl-text">Contacto</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Info */}
        <div>
          <p className="text-nl-gray-dark mb-6 leading-relaxed">
            ¿Tenés consultas sobre productos, pedidos o quérés ser revendedora?
            Escribinos y te respondemos a la brevedad.
          </p>

          <div className="space-y-4">
            {process.env.NEXT_PUBLIC_CONTACT_WHATSAPP && (
              <a
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-nl-pink-light rounded-2xl hover:bg-nl-pink/10 transition-colors group"
              >
                <MessageCircle size={20} className="text-nl-pink" />
                <span className="text-sm font-medium group-hover:text-nl-pink transition-colors">WhatsApp</span>
              </a>
            )}
            {process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM && (
              <a
                href={`https://instagram.com/${process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-nl-pink-light rounded-2xl hover:bg-nl-pink/10 transition-colors group"
              >
                <ExternalLink size={20} className="text-nl-pink" />
                <span className="text-sm font-medium group-hover:text-nl-pink transition-colors">
                  @{process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM}
                </span>
              </a>
            )}
            {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                className="flex items-center gap-3 p-4 bg-nl-pink-light rounded-2xl hover:bg-nl-pink/10 transition-colors group"
              >
                <Mail size={20} className="text-nl-pink" />
                <span className="text-sm font-medium group-hover:text-nl-pink transition-colors">
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                </span>
              </a>
            )}
            <div className="flex items-center gap-3 p-4 bg-nl-blue-light rounded-2xl">
              <MapPin size={20} className="text-nl-blue" />
              <span className="text-sm font-medium text-nl-blue-dark">San Nicolás, Buenos Aires</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="nl-card p-6">
          {status === "ok" ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">💌</p>
              <p className="font-playfair text-2xl text-nl-text mb-2">¡Mensaje enviado!</p>
              <p className="text-nl-gray-dark text-sm">Te respondemos a la brevedad.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">NOMBRE</label>
                <input className={inputClass} required value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Tu nombre" />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">EMAIL</label>
                <input className={inputClass} type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="tu@email.com" />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">ASUNTO (OPCIONAL)</label>
                <input className={inputClass} value={form.asunto} onChange={(e) => set("asunto", e.target.value)} placeholder="Consulta sobre mayorista..." />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">MENSAJE</label>
                <textarea className={`${inputClass} h-28 resize-none`} required value={form.mensaje} onChange={(e) => set("mensaje", e.target.value)} placeholder="Escribí tu consulta..." />
              </div>
              {status === "error" && (
                <p className="text-red-500 text-xs">Hubo un error. Intentá de nuevo.</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3.5 bg-nl-pink text-white rounded-2xl font-semibold hover:bg-nl-pink-dark transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
