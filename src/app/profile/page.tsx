"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { User, Phone, Mail, MapPin, Loader2, Save, ShoppingBag, Calendar, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  orderCount: number;
};

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "unauthenticated" || !session) {
      router.push("/auth/login?callbackUrl=/profile");
      return;
    }

    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading profile details");
      })
      .finally(() => setLoading(false));
  }, [session, authStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfile((prev) => (prev ? { ...prev, ...data.user } : null));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-semibold text-sm">Loading your profile...</p>
      </div>
    );
  }

  const joinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
    : "Recently Joined";

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-24 md:pb-8">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-28">
        <button 
          onClick={() => router.back()} 
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        {/* Banner with gradient */}
        <div className="relative h-32 md:h-44 w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl overflow-hidden shadow-lg mb-6">
          <div className="absolute inset-0 opacity-10">
            {["🍽️", "🍢", "🍛", "🥞"].map((emoji, i) => (
              <span key={i} className="absolute text-5xl md:text-6xl" style={{ top: `${(i * 20) % 70}%`, left: `${(i * 25) % 85}%` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Profile Card & Info */}
        <div className="relative -mt-16 md:-mt-24 px-4 pb-4">
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-6 md:p-8 border border-orange-100 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            {/* Initials Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-100 to-amber-100 border-4 border-white shadow-md rounded-3xl flex items-center justify-center font-black text-orange-600 text-3xl md:text-4xl">
              {profile?.name?.[0]?.toUpperCase() || "U"}
            </div>

            {/* Profile Meta */}
            <div className="flex-1 space-y-2 mt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-800" style={{ fontFamily: "Outfit" }}>
                    {profile?.name || "Customer"}
                  </h1>
                  <p className="text-sm text-gray-400 font-medium">{profile?.email}</p>
                </div>
                <span className="self-center md:self-start bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
                  {profile?.role === "VENDOR" ? "Vendor Partner" : profile?.role === "ADMIN" ? "Administrator" : "Customer Pro"}
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl text-amber-700 text-xs font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{profile?.orderCount || 0} Orders</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl text-orange-700 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile form */}
        <div className="mt-8 bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-100/50 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2" style={{ fontFamily: "Outfit" }}>
            <User className="w-5 h-5 text-orange-500" /> Account Settings
          </h2>

          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Profile successfully saved!
            </motion.div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FFF8F0] border border-orange-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none rounded-2xl text-sm font-medium text-gray-700 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FFF8F0] border border-orange-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none rounded-2xl text-sm font-medium text-gray-700 transition-all"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Email Address (ReadOnly) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400">Email Address (Cannot be changed)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Primary Delivery Address (Ahmedabad)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-5 w-5 h-5 text-gray-400" />
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF8F0] border border-orange-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none rounded-2xl text-sm font-medium text-gray-700 transition-all resize-none"
                  placeholder="Enter your delivery address in Ahmedabad"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
