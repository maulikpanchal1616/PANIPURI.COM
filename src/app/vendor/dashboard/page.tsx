"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import {
  LayoutDashboard, UtensilsCrossed, Store, Package,
  ToggleLeft, ToggleRight, Plus, TrendingUp, Star, Eye, EyeOff, Smartphone, Edit
} from "lucide-react";

type Dish = { id: string; name: string; price: number; isAvailable: boolean; category: string; rating: number; totalOrders: number; imageUrl?: string };
type SubVendor = { id: string; stallName: string; stallType: string; isActive: boolean; address: string };
type Stats = { totalOrders: number; totalRevenue: number; rating: number; totalDishes: number };

export default function VendorDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "dishes" | "stalls" | "orders" | "settings">("overview");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [subVendors, setSubVendors] = useState<SubVendor[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, rating: 0, totalDishes: 0 });
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { router.push("/auth/login"); return; }
    if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") { router.push("/"); return; }
    Promise.all([
      fetch("/api/vendor/dishes").then((r) => r.json()),
      fetch("/api/vendor/subvendors").then((r) => r.json()),
      fetch("/api/vendor/stats").then((r) => r.json()),
      fetch("/api/orders?limit=5").then((r) => r.json()),
    ]).then(([d, sv, st, ord]) => {
      setDishes(d.dishes ?? []);
      setSubVendors(sv.subVendors ?? []);
      setStats(st.stats ?? stats);
      setOrders(ord.orders ?? []);
    }).finally(() => setLoading(false));
  }, [session]);

  const toggleDish = async (dishId: string, current: boolean) => {
    await fetch(`/api/vendor/dishes/${dishId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !current }),
    });
    setDishes((prev) => prev.map((d) => d.id === dishId ? { ...d, isAvailable: !current } : d));
  };

  const toggleStall = async (stallId: string, current: boolean) => {
    await fetch(`/api/vendor/subvendors/${stallId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setSubVendors((prev) => prev.map((sv) => sv.id === stallId ? { ...sv, isActive: !current } : sv));
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "dishes", label: "Dishes", icon: UtensilsCrossed },
    { id: "stalls", label: "Stalls", icon: Store },
    { id: "orders", label: "Orders", icon: Package },
    { id: "settings", label: "Settings", icon: Store },
  ] as const;

  const [vendorData, setVendorData] = useState<{ businessName: string; address: string; upiId: string; isActive: boolean }>({
    businessName: "",
    address: "",
    upiId: "",
    isActive: true,
  });

  useEffect(() => {
    if (activeTab === "settings" || activeTab === "overview") {
      fetch("/api/vendor/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.vendor) {
            setVendorData({
              businessName: data.vendor.businessName || "",
              address: data.vendor.address || "",
              upiId: data.vendor.upiId || "",
              isActive: data.vendor.isActive ?? true,
            });
          }
        });
    }
  }, [activeTab]);

  const handleUpdateProfile = async (updatedData?: Partial<typeof vendorData>) => {
    const newData = { ...vendorData, ...updatedData };
    const res = await fetch("/api/vendor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    if (res.ok) {
      setVendorData(newData);
      if (!updatedData) alert("Profile updated successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800" style={{ fontFamily: "Outfit" }}>Vendor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user.name}</p>
          </div>
          <button onClick={() => router.push("/vendor/dishes/new")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl transition-colors shadow-md shadow-orange-200">
            <Plus className="w-5 h-5" /> Add Dish
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-orange-50 p-1.5 rounded-2xl w-fit mb-8 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === id ? "bg-white text-orange-600 shadow-md" : "text-gray-500 hover:text-orange-500"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "from-blue-500 to-blue-600" },
                { label: "Revenue", value: `₹${stats.totalRevenue?.toFixed(0)}`, icon: "💰", color: "from-green-500 to-green-600" },
                { label: "Rating", value: stats.rating?.toFixed(1), icon: "⭐", color: "from-amber-500 to-orange-500" },
                { label: "Dishes", value: stats.totalDishes, icon: "🍽️", color: "from-purple-500 to-purple-600" },
              ].map((stat) => (
                <motion.div key={stat.label} whileHover={{ y: -4 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-3xl p-5 text-white shadow-lg`}>
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-sm opacity-80 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Shop status toggle in overview */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${vendorData.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                  {vendorData.isActive ? "🟢" : "🔴"}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Shop Status: {vendorData.isActive ? "Open" : "Closed"}</p>
                  <p className="text-sm text-gray-500">{vendorData.isActive ? "Customers can place orders now" : "Customers cannot place orders"}</p>
                </div>
              </div>
              <button onClick={() => handleUpdateProfile({ isActive: !vendorData.isActive })}
                className={`flex items-center gap-2 transition-all ${vendorData.isActive ? "text-green-600" : "text-gray-400"}`}>
                {vendorData.isActive ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12" />}
              </button>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" /> Recent Orders
              </h2>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: Record<string, unknown>) => (
                    <div key={order.id as string} className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">#{(order.id as string)?.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt as string).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">₹{(order.totalAmount as number)?.toFixed(0)}</p>
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{order.status as string}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Dishes tab */}
        {activeTab === "dishes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="font-bold text-gray-700 text-xl">No dishes yet</p>
                <button onClick={() => router.push("/vendor/dishes/new")} className="mt-4 bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl">Add First Dish</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.map((dish, i) => (
                  <motion.div key={dish.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-5 border border-orange-100 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                        {dish.imageUrl ? <img src={dish.imageUrl} alt="" className="w-full h-full object-cover rounded-2xl" /> : "🍽️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate text-sm">{dish.name}</p>
                        <p className="text-xs text-gray-500">{dish.category}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-gray-600">{dish.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">• {dish.totalOrders} orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-black text-orange-600 text-lg">₹{dish.price}</span>
                      <div className="flex items-center gap-2">
                        <Link href={`/vendor/dishes/${dish.id}`} className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => toggleDish(dish.id, dish.isAvailable)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${dish.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                          {dish.isAvailable ? <><Eye className="w-3.5 h-3.5" /> In Stock</> : <><EyeOff className="w-3.5 h-3.5" /> Out</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Stalls tab */}
        {activeTab === "stalls" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {subVendors.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏪</div>
                <p className="font-bold text-gray-700 text-xl">No sub-vendor stalls</p>
                <p className="text-gray-500 text-sm mt-2">Add stalls to manage multiple locations from one kitchen</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {subVendors.map((stall, i) => (
                  <motion.div key={stall.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{stall.stallName}</p>
                        <p className="text-sm text-gray-500">{stall.stallType}</p>
                        <p className="text-xs text-gray-400 mt-1">{stall.address}</p>
                      </div>
                      <button onClick={() => toggleStall(stall.id, stall.isActive)}
                        className={`flex items-center gap-1.5 transition-colors ${stall.isActive ? "text-green-600" : "text-gray-400"}`}>
                        {stall.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${stall.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {stall.isActive ? "● Open" : "○ Closed"}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Orders tab */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="font-bold text-gray-700 text-xl">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: Record<string, unknown>, i: number) => (
                  <motion.div key={order.id as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-5 border border-orange-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">#{(order.id as string)?.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt as string).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-orange-600">₹{(order.totalAmount as number)?.toFixed(0)}</p>
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{order.status as string}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm max-w-2xl">
            <h2 className="text-2xl font-black text-gray-800 mb-6" style={{ fontFamily: "Outfit" }}>Shop Settings</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div>
                  <p className="font-bold text-gray-800">Operational Status</p>
                  <p className="text-xs text-gray-500">Toggle whether your shop is currently open</p>
                </div>
                <button type="button" onClick={() => setVendorData({ ...vendorData, isActive: !vendorData.isActive })}
                  className={`flex items-center gap-2 transition-all ${vendorData.isActive ? "text-green-600" : "text-gray-400"}`}>
                  {vendorData.isActive ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
                <input type="text" value={vendorData.businessName} onChange={(e) => setVendorData({ ...vendorData, businessName: e.target.value })}
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shop Address</label>
                <textarea value={vendorData.address} onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })} rows={3}
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none" />
              </div>
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-500" /> UPI Payment Details
                </h3>
                <p className="text-xs text-gray-500 mb-4">Enter your UPI ID to receive direct payments from customers. A QR code will be generated automatically at checkout.</p>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your UPI ID</label>
                <input type="text" placeholder="e.g. yourname@okaxis" value={vendorData.upiId} onChange={(e) => setVendorData({ ...vendorData, upiId: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
                
                {vendorData.upiId && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-orange-100 text-center">
                    <p className="text-xs text-gray-400 mb-2">QR Code Preview (Customers will see this)</p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${vendorData.upiId}&pn=${vendorData.businessName}&cu=INR`)}`}
                      alt="QR Preview"
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200">
                Save Changes
              </button>
            </form>
          </motion.div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
