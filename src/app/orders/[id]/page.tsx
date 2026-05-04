"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { CheckCircle2, Clock, ChefHat, Truck, Package, XCircle, MapPin } from "lucide-react";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { router.push("/auth/login"); return; }
    const fetchOrder = () => {
      fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => setOrder(d.order)).finally(() => setLoading(false));
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id, session]);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <p className="text-gray-500">Order not found</p>
    </div>
  );

  const status = order.status as string;
  const currentStep = STATUS_STEPS.findIndex((s) => s.key === status);
  const vendor = order.vendor as Record<string, unknown>;
  const items = order.items as Record<string, unknown>[];
  const deliveryLog = order.deliveryLog as Record<string, unknown>[];
  const payment = order.payment as Record<string, unknown> | undefined;

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20 space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-gray-800" style={{ fontFamily: "Outfit" }}>Track Order</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">#{(order.id as string)?.slice(-8).toUpperCase()}</p>
        </motion.div>

        {/* Status tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800">Order Status</h2>
            {status !== "CANCELLED" && (
              <span className="text-sm bg-orange-50 text-orange-600 font-semibold px-3 py-1 rounded-full border border-orange-200">
                <Clock className="w-3.5 h-3.5 inline mr-1" />{order.estimatedTime as number} min est.
              </span>
            )}
          </div>
          {status === "CANCELLED" ? (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 rounded-2xl p-4">
              <XCircle className="w-8 h-8" />
              <div><p className="font-bold">Order Cancelled</p><p className="text-sm opacity-80">Refund in 3-5 business days</p></div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-orange-100" />
              <div className="absolute left-5 top-5 w-0.5 bg-orange-500 transition-all duration-1000"
                style={{ height: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }} />
              <div className="space-y-6 relative">
                {STATUS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <motion.div animate={{ scale: isCurrent ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 1.5 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${isDone ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <p className={`font-semibold text-sm ${isDone ? "text-gray-800" : "text-gray-400"}`}>{step.label}</p>
                        {isCurrent && <p className="text-xs text-orange-500 font-medium">Currently here</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Activity log */}
        {deliveryLog?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">Activity Log</h2>
            <div className="space-y-3">
              {[...deliveryLog].reverse().map((log: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{log.message as string || log.status as string}</p>
                    <p className="text-xs text-gray-400">{new Date(log.timestamp as string).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vendor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">🏪</div>
          <div>
            <p className="font-bold text-gray-800">{vendor?.businessName as string}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />{order.deliveryAddress as string}
            </p>
          </div>
        </motion.div>

        {/* Items & bill */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Your Items</h2>
          <div className="space-y-3">
            {items?.map((item: Record<string, unknown>) => {
              const dish = item.dish as Record<string, unknown>;
              return (
                <div key={item.id as string} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-xs font-bold text-orange-600">×{item.quantity as number}</span>
                    <span className="text-sm font-medium text-gray-700">{dish?.name as string}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">₹{((item.price as number) * (item.quantity as number)).toFixed(0)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-dashed border-orange-100 mt-4 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500"><span>Item Total</span><span>₹{(order.totalAmount as number).toFixed(0)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Delivery Fee</span><span>₹{(order.deliveryFee as number).toFixed(0)}</span></div>
            <div className="flex justify-between font-black text-gray-800 text-base pt-1">
              <span>Grand Total</span>
              <span className="text-orange-600">₹{((order.totalAmount as number) + (order.deliveryFee as number)).toFixed(0)}</span>
            </div>
            {payment && (
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-500">Payment</span>
                <span className={`font-bold ${payment.status === "SUCCESS" ? "text-green-600" : "text-amber-600"}`}>
                  {payment.method === "COD" && payment.status === "PENDING" 
                    ? "🕒 Pay on Delivery" 
                    : payment.status === "SUCCESS" 
                      ? "✅ Paid" 
                      : "⏳ Pending"} 
                  <span className="text-xs opacity-70 ml-1">via {payment.method as string}</span>
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}
