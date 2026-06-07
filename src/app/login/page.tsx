"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nl-pink to-nl-pink-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Nueve Lunas" width={160} height={55} className="h-14 w-auto object-contain mx-auto brightness-0 invert mb-3" />
          <p className="label-tag text-white/60 text-[10px]">PANEL DE ADMINISTRACIÓN</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-tag text-nl-gray-dark block mb-1.5 text-[10px]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nl-pink transition-colors"
                placeholder="admin@nuevelunas.com"
              />
            </div>
            <div>
              <label className="label-tag text-nl-gray-dark block mb-1.5 text-[10px]">CONTRASEÑA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nl-pink transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-3.5 bg-nl-pink text-white rounded-xl font-semibold hover:bg-nl-pink-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
