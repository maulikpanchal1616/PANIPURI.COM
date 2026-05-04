"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, UtensilsCrossed, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <>
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-6">
          ⚠️ {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email address" className="w-full pl-12 pr-4 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input id="password" type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Password" className="w-full pl-12 pr-12 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all disabled:opacity-60">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
        </motion.button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-amber-600 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {["🍽️","🥘","🍢","🥗","🍛","🥐","🧆","🍮"].map((e, i) => (
            <div key={i} className="absolute text-6xl" style={{ top: `${(i * 13) % 90}%`, left: `${(i * 17) % 85}%`, transform: "rotate(-10deg)" }}>{e}</div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative z-10 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>Khani Pini Bazar</h2>
          <p className="text-white/80 text-lg max-w-sm">Ahmedabad's finest food marketplace. Order, track, enjoy!</p>
          <div className="grid grid-cols-2 gap-4 mt-10">
            {[["200+","Vendors"],["50K+","Customers"],["5000+","Dishes"],["25 min","Avg Delivery"]].map(([v, l]) => (
              <div key={l} className="bg-white/15 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black">{v}</p>
                <p className="text-sm opacity-80">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-orange-600 text-lg" style={{ fontFamily: "Outfit" }}>Khani Pini Bazar</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-800 mb-2" style={{ fontFamily: "Outfit" }}>Welcome back! 👋</h1>
          <p className="text-gray-500 mb-8">Sign in to continue ordering delicious food</p>

          <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-orange-500 font-semibold hover:text-orange-600">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
