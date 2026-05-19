"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Package, Clock, CheckCircle2, XCircle, Truck, ChefHat, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:          { label: "Pending",          color: "text-yellow-600 bg-yellow-50 border-yellow-200",   icon: <Clock className="w-4 h-4" /> },
  CONFIRMED:        { label: "Confirmed",         color: "text-blue-600 bg-blue-50 border-blue-200",        icon: <CheckCircle2 className="w-4 h-4" /> },
  PREPARING:        { label: "Preparing",         color: "text-orange-600 bg-orange-50 border-orange-200",  icon: <ChefHat className="w-4 h-4" /> },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  color: "text-purple-600 bg-purple-50 border-purple-200", icon: <Truck className="w-4 h-4" /> },
  DELIVERED:        { label: "Delivered",         color: "text-green-600 bg-green-50 border-green-200",     icon: <CheckCircle2 className="w-4 h-4" /> },
  CANCELLED:        { label: "Cancelled",         color: "text-red-600 bg-red-50 border-red-200",           icon: <XCircle className="w-4 h-4" /> },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !session) { router.push("/auth/login?callbackUrl=/orders"); return; }
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, [session, status]);

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <button 
          onClick={() => router.back()} 
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <h1 className="text-3xl font-black text-gray-800 mb-8" style={{ fontFamily: "Outfit" }}>My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-24 text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-orange-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-xl mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
            <Link href="/" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-2xl hover:bg-orange-600 transition-colors">
              Order Now 🍽️
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Record<string, unknown>, i: number) => {
              const status = (order.status as string) || "PENDING";
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
              const vendor = order.vendor as Record<string, unknown>;
              const items = order.items as Record<string, unknown>[];
              const payment = order.payment as Record<string, unknown> | undefined;
              return (
                <motion.div key={order.id as string} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/orders/${order.id}`}>
                    <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="font-bold text-gray-800">{vendor?.businessName as string}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">#{(order.id as string)?.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4 overflow-hidden">
                        {(items || []).slice(0, 3).map((item: Record<string, unknown>) => {
                          const dish = item.dish as Record<string, unknown>;
                          return (
                            <div key={item.id as string} className="flex items-center gap-1.5 bg-orange-50 rounded-xl px-2.5 py-1.5 text-xs text-gray-600 font-medium">
                              {dish?.name as string} ×{item.quantity as number}
                            </div>
                          );
                        })}
                        {(items?.length || 0) > 3 && <span className="text-xs text-gray-400">+{(items?.length || 0) - 3} more</span>}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-dashed border-orange-100">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-bold text-orange-600">₹{((order.totalAmount as number) + (order.deliveryFee as number))}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{payment?.status === "SUCCESS" ? "✅ Paid" : "⏳ Pending"}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{new Date(order.createdAt as string).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
