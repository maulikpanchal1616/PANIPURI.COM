"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, UtensilsCrossed, ArrowRight, Loader2, ChefHat } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "CUSTOMER" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push("/auth/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-orange-600 text-lg" style={{ fontFamily: "Outfit" }}>Khani Pini Bazar</span>
        </Link>

        <h1 className="text-3xl font-black text-gray-800 mb-2" style={{ fontFamily: "Outfit" }}>Create Account 🎉</h1>
        <p className="text-gray-500 mb-8">Join Ahmedabad's biggest food community</p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-6">
            ⚠️ {error}
          </motion.div>
        )}

        {/* Role selector */}
        <div className="flex gap-3 mb-6">
          {[{ role: "CUSTOMER", label: "Customer", icon: "🛍️" }, { role: "VENDOR", label: "Vendor", icon: "🏪" }].map((r) => (
            <button key={r.role} type="button" onClick={() => setForm((f) => ({ ...f, role: r.role }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border-2 transition-all ${form.role === r.role ? "border-orange-500 bg-orange-50 text-orange-600" : "border-orange-100 bg-white text-gray-500"}`}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input id="name" type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name" className="w-full pl-12 pr-4 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input id="reg-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email address" className="w-full pl-12 pr-4 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone number (optional)" className="w-full pl-12 pr-4 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input id="reg-password" type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Password (min 6 chars)" className="w-full pl-12 pr-12 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all disabled:opacity-60">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
