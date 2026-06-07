"use client";

import { useState } from "react";
import Image from "next/image";
import { formatARS } from "@/lib/utils";
import type { ProductAdmin, ColorVariant, NLCategory } from "@/types";
import { NL_CATEGORIES } from "@/types";
import { Plus, Edit, Eye, EyeOff, Trash2, Upload, X } from "lucide-react";

interface NewProductForm {
  name: string;
  description: string;
  category: NLCategory;
  price_sale: string;
  price_cost: string;
  tags: string;
}

export default function ProductsAdminClient({ products: initial }: { products: ProductAdmin[] }) {
  const [products, setProducts] = useState(initial);
  const [showNew,  setShowNew]  = useState(false);
  const [editing,  setEditing]  = useState<ProductAdmin | null>(null);
  const [loading,  setLoading]  = useState(false);

  const [newForm, setNewForm] = useState<NewProductForm>({
    name: "", description: "", category: "almohadones",
    price_sale: "", price_cost: "", tags: "",
  });

  // Estado para variantes de color del nuevo producto
  const [newVariants, setNewVariants] = useState<Array<{ name: string; images: string[]; stock: number }>>([]);
  const [newColorName, setNewColorName] = useState("");

  async function handleCreate() {
    if (!newForm.name || !newForm.price_sale) return;
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:           newForm.name,
        description:    newForm.description,
        category:       newForm.category,
        price_sale:     parseFloat(newForm.price_sale),
        price_cost:     parseFloat(newForm.price_cost || "0"),
        tags:           newForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        color_variants: newVariants,
        images:         newVariants[0]?.images ?? [],
      }),
    });
    if (res.ok) {
      const created: ProductAdmin = await res.json();
      setProducts((prev) => [created, ...prev]);
      setShowNew(false);
      setNewForm({ name: "", description: "", category: "almohadones", price_sale: "", price_cost: "", tags: "" });
      setNewVariants([]);
    }
    setLoading(false);
  }

  async function togglePublish(product: ProductAdmin) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !product.is_published }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_published: !p.is_published } : p))
      );
    }
  }

  async function handleDelete(product: ProductAdmin) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== product.id));
  }

  async function handlePhotoUpload(variantIdx: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setNewVariants((prev) =>
        prev.map((v, i) => (i === variantIdx ? { ...v, images: [...v.images, url] } : v))
      );
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al subir la imagen. Verificá las credenciales de Cloudinary en .env.local.");
    }
  }

  const inputClass = "w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-nl-pink transition-colors";

  return (
    <div>
      {/* Botón nuevo */}
      <button
        onClick={() => setShowNew(true)}
        className="flex items-center gap-2 mb-6 px-5 py-2.5 bg-nl-pink text-white rounded-xl font-semibold text-sm hover:bg-nl-pink-dark transition-colors"
      >
        <Plus size={16} /> Nuevo producto
      </button>

      {/* Modal nuevo producto */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-2xl font-semibold">Nuevo producto</h2>
              <button onClick={() => setShowNew(false)}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">NOMBRE *</label>
                <input className={inputClass} value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">CATEGORÍA</label>
                <select className={inputClass} value={newForm.category} onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value as NLCategory }))}>
                  {NL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">PRECIO VENTA *</label>
                <input className={inputClass} type="number" value={newForm.price_sale} onChange={(e) => setNewForm((f) => ({ ...f, price_sale: e.target.value }))} placeholder="15000" />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">PRECIO COSTO</label>
                <input className={inputClass} type="number" value={newForm.price_cost} onChange={(e) => setNewForm((f) => ({ ...f, price_cost: e.target.value }))} placeholder="8000" />
              </div>
              <div>
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">TAGS (separados por coma)</label>
                <input className={inputClass} value={newForm.tags} onChange={(e) => setNewForm((f) => ({ ...f, tags: e.target.value }))} placeholder="suave, bebé, algodón" />
              </div>
              <div className="sm:col-span-2">
                <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">DESCRIPCIÓN</label>
                <textarea className={`${inputClass} h-20 resize-none`} value={newForm.description} onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            {/* Colores */}
            <div className="mb-4">
              <p className="label-tag text-[10px] text-nl-gray-dark mb-2">COLORES Y FOTOS</p>
              <div className="flex gap-2 mb-3">
                <input
                  className={`${inputClass} flex-1`}
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nombre del color (ej: Rosa)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newColorName.trim()) return;
                    setNewVariants((prev) => [...prev, { name: newColorName.trim(), images: [], stock: 0 }]);
                    setNewColorName("");
                  }}
                  className="px-4 py-2 bg-nl-blue text-white rounded-xl text-sm font-semibold"
                >
                  Agregar
                </button>
              </div>

              {newVariants.map((v, idx) => (
                <div key={idx} className="bg-nl-gray rounded-xl p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{v.name}</p>
                    <button onClick={() => setNewVariants((prev) => prev.filter((_, i) => i !== idx))}>
                      <X size={14} className="text-nl-gray-dark hover:text-red-500" />
                    </button>
                  </div>
                  {/* Stock */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="label-tag text-[10px] text-nl-gray-dark">STOCK:</label>
                    <input
                      type="number"
                      className="border border-border rounded-lg px-2 py-1 text-xs w-16"
                      value={v.stock}
                      onChange={(e) => setNewVariants((prev) => prev.map((vv, i) => i === idx ? { ...vv, stock: parseInt(e.target.value) || 0 } : vv))}
                    />
                  </div>
                  {/* Fotos */}
                  <div className="flex flex-wrap gap-2">
                    {v.images.map((img, ii) => (
                      <div key={ii} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                        <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                        <button
                          onClick={() => setNewVariants((prev) => prev.map((vv, i) => i === idx ? { ...vv, images: vv.images.filter((_, j) => j !== ii) } : vv))}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                    <label className="w-14 h-14 rounded-lg border-2 border-dashed border-nl-pink-light flex items-center justify-center cursor-pointer hover:border-nl-pink transition-colors">
                      <Upload size={16} className="text-nl-gray-dark" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handlePhotoUpload(idx, f);
                      }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-nl-gray transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 py-3 bg-nl-pink text-white rounded-xl text-sm font-semibold hover:bg-nl-pink-dark transition-colors disabled:opacity-60">
                {loading ? "Guardando..." : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla productos */}
      <div className="nl-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-nl-gray">
                <th className="label-tag text-[10px] text-left px-4 py-3">PRODUCTO</th>
                <th className="label-tag text-[10px] text-left px-4 py-3">CATEGORÍA</th>
                <th className="label-tag text-[10px] text-left px-4 py-3">PRECIO</th>
                <th className="label-tag text-[10px] text-left px-4 py-3">COLORES / STOCK</th>
                <th className="label-tag text-[10px] text-left px-4 py-3">ESTADO</th>
                <th className="label-tag text-[10px] text-left px-4 py-3">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = (p.color_variants as unknown as ColorVariant[]).reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-nl-gray/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-nl-gray rounded-lg relative overflow-hidden shrink-0">
                          {(p.images[0] || (p.color_variants[0] as ColorVariant | undefined)?.images[0]) && (
                            <Image
                              src={p.images[0] || (p.color_variants[0] as ColorVariant).images[0]}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{p.name}</p>
                          <p className="text-xs text-nl-gray-dark font-mono">{p.slug.slice(0, 20)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 label-tag text-[10px] text-nl-gray-dark">{p.category.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-nl-pink">{formatARS(p.price_sale)}</p>
                      <p className="text-xs text-nl-gray-dark">costo: {formatARS(p.price_cost)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{(p.color_variants as unknown as ColorVariant[]).length} colores</p>
                      <p className="text-xs text-nl-gray-dark">{totalStock} unidades</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        p.is_published ? "bg-green-100 text-green-700" : "bg-nl-gray text-nl-gray-dark"
                      }`}>
                        {p.is_published ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePublish(p)}
                          className="p-1.5 rounded-lg hover:bg-nl-gray transition-colors"
                          title={p.is_published ? "Despublicar" : "Publicar"}
                        >
                          {p.is_published ? <EyeOff size={14} className="text-nl-gray-dark" /> : <Eye size={14} className="text-nl-pink" />}
                        </button>
                        <button
                          onClick={() => setEditing(p)}
                          className="p-1.5 rounded-lg hover:bg-nl-gray transition-colors"
                          title="Editar"
                        >
                          <Edit size={14} className="text-nl-blue" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-10 text-nl-gray-dark">
              <p className="label-tag">NO HAY PRODUCTOS</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal edición simple */}
      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EditProductModal({
  product, onClose, onSaved,
}: {
  product: ProductAdmin;
  onClose: () => void;
  onSaved: (p: ProductAdmin) => void;
}) {
  const [form, setForm] = useState({
    name:        product.name,
    description: product.description,
    price_sale:  String(product.price_sale),
    price_cost:  String(product.price_cost),
    category:    product.category,
  });
  const [variants, setVariants] = useState<ColorVariant[]>(product.color_variants as unknown as ColorVariant[]);
  const [loading,  setLoading]  = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:           form.name,
        description:    form.description,
        price_sale:     parseFloat(form.price_sale),
        price_cost:     parseFloat(form.price_cost),
        category:       form.category,
        color_variants: variants,
        images:         variants[0]?.images ?? product.images,
      }),
    });
    if (res.ok) {
      const updated: ProductAdmin = await res.json();
      onSaved(updated);
    }
    setLoading(false);
  }

  async function handlePhotoUpload(variantIdx: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setVariants((prev) =>
        prev.map((v, i) => (i === variantIdx ? { ...v, images: [...v.images, url] } : v))
      );
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Error al subir la imagen. Verificá las credenciales de Cloudinary en .env.local.");
    }
  }

  const inputClass = "w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-nl-pink transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-playfair text-2xl font-semibold">Editar producto</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">NOMBRE</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">CATEGORÍA</label>
            <select className={inputClass} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as NLCategory }))}>
              {NL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">PRECIO VENTA</label>
            <input className={inputClass} type="number" value={form.price_sale} onChange={(e) => setForm((f) => ({ ...f, price_sale: e.target.value }))} />
          </div>
          <div>
            <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">PRECIO COSTO</label>
            <input className={inputClass} type="number" value={form.price_cost} onChange={(e) => setForm((f) => ({ ...f, price_cost: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-tag text-[10px] text-nl-gray-dark mb-1.5 block">DESCRIPCIÓN</label>
            <textarea className={`${inputClass} h-20 resize-none`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>

        {/* Variantes */}
        <div className="mb-4">
          <p className="label-tag text-[10px] text-nl-gray-dark mb-2">COLORES Y STOCK</p>
          {variants.map((v, idx) => (
            <div key={idx} className="bg-nl-gray rounded-xl p-3 mb-2">
              <p className="font-semibold text-sm mb-2">{v.name}</p>
              <div className="flex items-center gap-2 mb-2">
                <label className="label-tag text-[10px] text-nl-gray-dark">STOCK:</label>
                <input
                  type="number"
                  className="border border-border rounded-lg px-2 py-1 text-xs w-20"
                  value={v.stock}
                  onChange={(e) => setVariants((prev) => prev.map((vv, i) => i === idx ? { ...vv, stock: parseInt(e.target.value) || 0 } : vv))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {v.images.map((img, ii) => (
                  <div key={ii} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                    <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                    <button
                      onClick={() => setVariants((prev) => prev.map((vv, i) => i === idx ? { ...vv, images: vv.images.filter((_, j) => j !== ii) } : vv))}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
                <label className="w-14 h-14 rounded-lg border-2 border-dashed border-nl-pink-light flex items-center justify-center cursor-pointer hover:border-nl-pink transition-colors">
                  <Upload size={16} className="text-nl-gray-dark" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoUpload(idx, f);
                  }} />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-nl-gray transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-nl-pink text-white rounded-xl text-sm font-semibold hover:bg-nl-pink-dark transition-colors disabled:opacity-60">
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
