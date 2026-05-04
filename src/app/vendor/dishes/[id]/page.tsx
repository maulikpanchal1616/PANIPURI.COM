"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { UtensilsCrossed, Save, ArrowLeft, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "STREET_FOOD", "THALI", "SNACKS", "BEVERAGES", "BREAKFAST", "DESSERTS", "LUNCH"
];

export default function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "STREET_FOOD",
    isVeg: true,
    imageUrl: "",
    stock: "99",
    portionSize: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetch(`/api/vendor/dishes/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.dish) {
          setForm({
            name: data.dish.name || "",
            description: data.dish.description || "",
            price: data.dish.price?.toString() || "",
            category: data.dish.category || "STREET_FOOD",
            isVeg: data.dish.isVeg,
            imageUrl: data.dish.imageUrl || "",
            stock: data.dish.stock?.toString() || "99",
            portionSize: data.dish.portionSize || "",
            isAvailable: data.dish.isAvailable,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load dish details.");
        router.push("/vendor/dashboard");
      });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/vendor/dishes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/vendor/dashboard");
      } else {
        alert("Failed to update dish.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/vendor/dishes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/vendor/dashboard");
      } else {
        alert("Failed to delete dish.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-6">
          <Link href="/vendor/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm font-bold">
            <Trash2 className="w-4 h-4" /> Delete Dish
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800" style={{ fontFamily: "Outfit" }}>Edit Dish</h1>
              <p className="text-sm text-gray-500">Update your dish details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Dish Name *</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="e.g. Vada Pav" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) *</label>
                  <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="150" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Item Quantity (Portion) *</label>
              <input required type="text" value={form.portionSize} onChange={(e) => setForm({ ...form, portionSize: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="e.g. 1 Plate / 2 Pcs" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="Describe the dish..." />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-bold text-gray-700 mb-2">Availability & Diet</label>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.isVeg} onChange={() => setForm({ ...form, isVeg: true })} className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-gray-600">Veg</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!form.isVeg} onChange={() => setForm({ ...form, isVeg: false })} className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-gray-600">Non-Veg</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer border-l pl-4">
                    <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 rounded text-orange-500" />
                    <span className="text-xs font-bold text-gray-600">In Stock</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Image URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-70">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Dish</>}
              </motion.button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
