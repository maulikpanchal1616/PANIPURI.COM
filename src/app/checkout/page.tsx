"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { MapPin, CreditCard, Smartphone, Wallet, ChevronRight, Loader2, CheckCircle2, ShoppingBag, Crosshair, Map as MapIcon } from "lucide-react";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
});

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI (PhonePe / GPay / Paytm)", icon: <Smartphone className="w-5 h-5 text-purple-500" /> },
  { id: "CARD", label: "Credit / Debit Card", icon: <CreditCard className="w-5 h-5 text-blue-500" /> },
  { id: "WALLET", label: "Paytm Wallet", icon: <Wallet className="w-5 h-5 text-sky-500" /> },
  { id: "COD", label: "Cash on Delivery", icon: <span className="text-green-600 text-lg font-bold">₹</span> },
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, getDeliveryFee, clearCart, vendorId } = useCartStore();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [step, setStep] = useState<"details" | "payment" | "processing" | "success">("details");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [vendorData, setVendorData] = useState<{ businessName: string; address: string; upiId: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (err) {
        console.error(err);
        setError("Could not detect address. Please enter manually.");
      } finally {
        setDetectingLocation(false);
      }
    }, () => {
      setError("Location permission denied");
      setDetectingLocation(false);
    });
  };

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && vendorId) {
      console.log("Fetching vendor details for:", vendorId);
      fetch(`/api/vendors/${vendorId}`)
        .then(r => {
          if (!r.ok) throw new Error("Failed to fetch vendor");
          return r.json();
        })
        .then(data => {
          console.log("Vendor data loaded:", data);
          setVendorData(data.vendor);
        })
        .catch(err => {
          console.error(err);
          // Fallback to allow checkout if vendor API fails
          setVendorData({ businessName: "Vendor", address: "Ahmedabad", upiId: "" });
        });
    }
  }, [vendorId, hasHydrated]);

  const total = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    if (!session) router.push("/auth/login?callbackUrl=/checkout");
    if (items.length === 0 && step !== "success") router.push("/");
  }, [session, items, step]);

  const handlePlaceOrder = async () => {
    if (!address.trim()) { setError("Please enter delivery address"); return; }
    
    const isLocal = address.toLowerCase().includes("ahmedabad") || address.toLowerCase().includes("gujarat");
    if (!isLocal && address.length > 10) {
      setError("We currently only deliver within Ahmedabad. Please enter a valid local address.");
      return;
    }

    if (items.length === 0) return;
    setError("");
    setStep("processing");

    try {
      // Group items by vendorId
      const vendorsInCart = Array.from(new Set(items.map(i => i.vendorId)));
      const createdOrderIds: string[] = [];

      for (const vId of vendorsInCart) {
        const vendorItems = items.filter(i => i.vendorId === vId);
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId: vId,
            items: vendorItems.map((i) => ({ dishId: i.dishId, quantity: i.quantity, notes: i.notes })),
            deliveryAddress: address,
            specialInstructions: "",
          }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || `Order failed for ${vendorItems[0].vendorName}`);
        createdOrderIds.push(orderData.order.id);
      }

      setOrderId(createdOrderIds[0]); // Show the first order ID in success
      setFinalAmount(grandTotal);

      // If UPI is selected, we use the first vendor's UPI for now (Simpler flow)
      // Ideally, in a marketplace, you'd pay a central account
      if (paymentMethod === "UPI" && vendorData?.upiId) {
        setShowQR(true);
        setStep("payment");
        return;
      }

      await completePayment(createdOrderIds[0]);
    } catch (err: unknown) {
      setStep("payment");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  const completePayment = async (oid: string) => {
    setStep("processing");
    try {
      const payRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: oid, paymentMethod }),
      });
      if (!payRes.ok) throw new Error("Payment failed");

      setStep("success");
      clearCart();

      // Confetti burst
      const fire = (particleRatio: number, opts: confetti.Options) =>
        confetti({ origin: { y: 0.6 }, ...opts, particleCount: Math.floor(200 * particleRatio) });
      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#FF6B2B","#F59E0B"] });
      fire(0.2, { spread: 60, colors: ["#FF6B2B","#FFFFFF","#F59E0B"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStep("payment");
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-orange-100">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-800 mb-2" style={{ fontFamily: "Outfit" }}>Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-2">Your delicious food is being prepared</p>
          <p className="text-sm text-orange-500 font-semibold mb-8">Est. delivery: 25–35 minutes</p>
          <div className="bg-orange-50 rounded-2xl p-4 mb-8 text-left">
            <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Order ID</span><span className="font-mono font-bold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</span></div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">{paymentMethod === "COD" ? "Amount to Pay" : "Amount Paid"}</span>
              <span className="font-bold text-orange-600">₹{finalAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className={`font-bold ${paymentMethod === "COD" ? "text-amber-600" : "text-green-600"}`}>
                {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
              </span>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push(`/orders/${orderId}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
            Track Order <ChevronRight className="w-5 h-5" />
          </motion.button>
          <button onClick={() => router.push("/")} className="w-full mt-3 text-sm text-gray-500 hover:text-orange-500 transition-colors py-2">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-20">
        <h1 className="text-3xl font-black text-gray-800 mb-8" style={{ fontFamily: "Outfit" }}>Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Steps */}
          <div className="lg:col-span-3 space-y-5">
            {/* Step 1 - Delivery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">1</div>
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl transition-all"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  Select on Map
                </button>
              </div>
              
              {showMap && (
                <LocationPicker 
                  onClose={() => setShowMap(false)} 
                  onLocationSelect={(addr) => {
                    setAddress(addr);
                    setShowMap(false);
                  }}
                />
              )}
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
                <textarea id="delivery-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                  placeholder="Enter your full delivery address in Ahmedabad..."
                  className="w-full pl-12 pr-4 py-3.5 bg-orange-50 border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none" />
              </div>
              {error && step === "details" && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (!address.trim()) { setError("Please enter delivery address"); return; } setError(""); setStep("payment"); }}
                className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                Continue to Payment <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Step 2 - Payment */}
            <AnimatePresence>
              {(step === "payment" || step === "processing") && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
                  <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-black">2</div>
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {showQR && vendorData?.upiId ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-purple-50 rounded-3xl p-6 border-2 border-purple-200 text-center">
                        <div className="mb-4">
                          <p className="text-sm font-bold text-purple-700 mb-1">Pay to: {vendorData.businessName}</p>
                          <p className="text-xs text-purple-500">{vendorData.address}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-4">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${vendorData.upiId}&pn=${vendorData.businessName}&am=${grandTotal}&cu=INR`)}`}
                            alt="UPI QR Code"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                        <p className="text-xs text-purple-600 font-semibold mb-6">UPI ID: {vendorData.upiId}</p>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => orderId && completePayment(orderId)}
                          className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                          I Have Paid ₹{grandTotal.toFixed(0)} <ChevronRight className="w-5 h-5" />
                        </motion.button>
                        <button onClick={() => setShowQR(false)} className="mt-3 text-xs text-purple-500 font-medium">Use different payment method</button>
                      </motion.div>
                    ) : (
                      <>
                        {PAYMENT_METHODS.map((m) => (
                          <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${paymentMethod === m.id ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-orange-200"}`}>
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{m.icon}</div>
                            <span className="font-semibold text-sm text-gray-700">{m.label}</span>
                            {paymentMethod === m.id && <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />}
                          </button>
                        ))}
                        {paymentMethod === "UPI" && vendorData && !vendorData.upiId && (
                          <p className="text-amber-600 text-xs bg-amber-50 p-3 rounded-xl border border-amber-100 mt-2">
                            ⚠️ This vendor hasn't set up UPI payments yet. Order will be confirmed instantly.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {error && <p className="text-red-500 text-sm mt-3">⚠️ {error}</p>}
                  {!showQR && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder} disabled={step === "processing" || !vendorData}
                      className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-70">
                      {step === "processing"
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
                        : (!hasHydrated || !vendorData)
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> Syncing Cart Details...</>
                          : <><span>Pay ₹{grandTotal.toFixed(0)}</span><ChevronRight className="w-5 h-5" /></>}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right - Order summary */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" /> Order Summary
              </h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.dishId} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : "🍽️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-600">₹{((item.discountPrice ?? item.price) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-orange-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Item Total</span><span>₹{total.toFixed(0)}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Delivery Fee</span><span className="text-green-600">₹{deliveryFee}</span></div>
                <div className="flex justify-between font-black text-gray-800 text-base border-t border-orange-100 pt-2 mt-1">
                  <span>Grand Total</span><span className="text-orange-600">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
