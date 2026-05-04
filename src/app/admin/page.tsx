"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Users, Store, Package, TrendingUp, CheckCircle2, XCircle, DollarSign, AlertCircle } from "lucide-react";

type Stat = { totalUsers: number; totalVendors: number; pendingVendors: number; totalOrders: number; totalRevenue: number };
type Order = Record<string, unknown>;
type AreaStat = { deliveryAddress: string; _count: { id: number } };

export default function AdminNexusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stat | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [areas, setAreas] = useState<AreaStat[]>([]);
  const [pendingVendors, setPendingVendors] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "vendors" | "orders">("overview");

  useEffect(() => {
    if (!session) { router.push("/auth/login"); return; }
    if (session.user.role !== "ADMIN") { router.push("/"); return; }
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/vendors?approved=false").then((r) => r.json()),
    ]).then(([statsData, vendorData]) => {
      setStats(statsData.stats);
      setOrders(statsData.recentOrders ?? []);
      setAreas(statsData.ordersByArea ?? []);
      setPendingVendors(vendorData.vendors ?? []);
    }).finally(() => setLoading(false));
  }, [session]);

  const approveVendor = async (vendorId: string, approve: boolean) => {
    await fetch(`/api/admin/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: approve }),
    });
    setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "vendors", label: "Vendors", icon: Store },
    { id: "orders", label: "Orders", icon: Package },
  ] as const;

  return (
    <div className="min-h-screen admin-dark">
      {/* Admin Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-orange-500/20 bg-[#0D0D0D]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-white" style={{ fontFamily: "Outfit" }}>Admin Nexus</span>
              <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">RESTRICTED</span>
            </div>
          </div>
          <span className="text-sm text-gray-400">{session?.user.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit" }}>Command Center</h1>
            <p className="text-gray-500 text-sm mt-1">Khani Pini Bazar — Admin Panel</p>
          </div>
          {stats?.pendingVendors ? (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-2xl">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{stats.pendingVendors} pending approvals</span>
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl w-fit mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === id ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Total Users",     value: stats?.totalUsers,     icon: Users,      color: "border-blue-500/30 text-blue-400" },
                { label: "Active Vendors",  value: stats?.totalVendors,   icon: Store,      color: "border-green-500/30 text-green-400" },
                { label: "Pending",         value: stats?.pendingVendors, icon: AlertCircle,color: "border-orange-500/30 text-orange-400" },
                { label: "Total Orders",    value: stats?.totalOrders,    icon: Package,    color: "border-purple-500/30 text-purple-400" },
                { label: "Revenue",         value: `₹${(stats?.totalRevenue ?? 0).toFixed(0)}`, icon: DollarSign, color: "border-amber-500/30 text-amber-400" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} whileHover={{ scale: 1.03 }}
                    className={`bg-white/5 border rounded-3xl p-5 ${s.color}`}>
                    <Icon className="w-6 h-6 mb-3" />
                    <p className="text-2xl font-black text-white">{loading ? "—" : s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Order heatmap by area */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" /> Order Density — Ahmedabad Areas
              </h2>
              {areas.length === 0 ? (
                <p className="text-gray-500 text-sm">No area data yet</p>
              ) : (
                <div className="space-y-3">
                  {areas.slice(0, 8).map((area, i) => {
                    const max = areas[0]._count.id || 1;
                    const pct = (area._count.id / max) * 100;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-gray-400 w-40 truncate flex-shrink-0">{area.deliveryAddress?.split(",")[0] || "Unknown"}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="h-2 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                        </div>
                        <span className="text-sm font-bold text-orange-400 w-8 text-right">{area._count.id}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Vendors */}
        {activeTab === "vendors" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-bold text-white text-lg mb-5">Pending Approvals</h2>
            {pendingVendors.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="font-bold text-white text-xl">All clear!</p>
                <p className="text-gray-500 text-sm mt-2">No vendors pending approval</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVendors.map((vendor: Record<string, unknown>, i: number) => (
                  <motion.div key={vendor.id as string} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white">{vendor.businessName as string}</p>
                      <p className="text-sm text-gray-400">{vendor.address as string}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(vendor.createdAt as string).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => approveVendor(vendor.id as string, false)}
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => approveVendor(vendor.id as string, true)}
                        className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-bold text-white text-lg mb-5">Recent Orders</h2>
            <div className="space-y-3">
              {orders.map((order: Order, i: number) => {
                const user = order.user as Record<string, unknown> | undefined;
                const vendor = order.vendor as Record<string, unknown> | undefined;
                const payment = order.payment as Record<string, unknown> | undefined;
                return (
                  <motion.div key={order.id as string} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-white text-sm">#{(order.id as string)?.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{user?.name as string} → {vendor?.businessName as string}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${payment?.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {payment?.status === "SUCCESS" ? "Paid" : "Pending"}
                      </span>
                      <span className="font-black text-orange-400">₹{(order.totalAmount as number)?.toFixed(0)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
