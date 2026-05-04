"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, MapPin, ChevronRight, Leaf } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice, getDeliveryFee } = useCartStore();
  const total = getTotalPrice();
  const deliveryFee = getDeliveryFee();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Your Cart</h2>
                  <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-orange-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Vendor tag */}
            {items.length > 0 && (
              <div className="mx-5 mt-4 flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-700 font-medium truncate">
                  From: {items[0]?.vendorName}
                </p>
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center"
                >
                  <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-orange-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-lg">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-1">Add delicious food to get started</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-colors"
                  >
                    Explore Menu
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.dishId}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3"
                    >
                      {/* Image */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-orange-100 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
                        )}
                        <span className="absolute -top-1 -left-1">
                          {item.isVeg ? (
                            <span className="w-4 h-4 bg-white rounded-sm border-2 border-green-500 flex items-center justify-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full block" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 bg-white rounded-sm border-2 border-red-500 flex items-center justify-center">
                              <span className="block w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-red-500" />
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-orange-500 font-bold text-sm">
                          ₹{((item.discountPrice ?? item.price) * item.quantity).toFixed(0)}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-400 truncate">{item.notes}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                          className="w-7 h-7 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                          className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Bill summary + checkout */}
            {items.length > 0 && (
              <div className="p-5 border-t border-orange-100 bg-white">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Item Total</span>
                    <span className="font-semibold">₹{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-green-600">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 border-t border-dashed border-orange-200 pt-2 mt-2 text-base">
                    <span>Grand Total</span>
                    <span className="text-orange-600">₹{(total + deliveryFee).toFixed(0)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-between w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
                >
                  <span>Proceed to Checkout</span>
                  <div className="flex items-center gap-1">
                    <span>₹{(total + deliveryFee).toFixed(0)}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
