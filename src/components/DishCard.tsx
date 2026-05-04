"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Star, Clock, Plus, Minus, Flame, Leaf } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { DishWithVendor } from "@/types";

interface DishCardProps {
  dish: DishWithVendor & { distance?: number };
  index?: number;
}

export default function DishCard({ dish, index = 0 }: DishCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const openCart = useCartStore((s) => s.openCart);
  const cardRef = useRef<HTMLDivElement>(null);

  const cartItem = items.find((i) => i.dishId === dish.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    setIsAdding(true);
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      discountPrice: dish.discountPrice,
      imageUrl: dish.imageUrl,
      quantity: 1,
      vendorId: dish.vendor.id,
      vendorName: dish.vendor.businessName,
      isVeg: dish.isVeg,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", willChange: "transform", transformStyle: "preserve-3d" }}
      className="bg-white rounded-3xl overflow-hidden shadow-md border border-orange-50 group cursor-pointer isolation-auto"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-orange-50 rounded-t-3xl">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        )}

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2">
          {dish.isVeg ? (
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-green-600 text-xs font-bold px-2 py-1 rounded-lg border border-green-200">
              <Leaf className="w-3 h-3" /> VEG
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-red-600 text-xs font-bold px-2 py-1 rounded-lg border border-red-200">
              🥩 NON-VEG
            </span>
          )}
          {dish.isSpicy && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <Flame className="w-3 h-3" /> Spicy
            </span>
          )}
        </div>

        {dish.isFeatured && (
          <span className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-lg">
            ⭐ Featured
          </span>
        )}

        {!dish.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full text-sm">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-1">{dish.name}</h3>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg flex-shrink-0">
            <Star className="w-3 h-3 text-green-600 fill-green-600" />
            <span className="text-xs font-bold text-green-700">{dish.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{dish.description || dish.vendor.businessName}</p>

        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" /> {dish.prepTime} min
          </span>
          {dish.distance !== undefined && (
            <span className="flex items-center gap-1">
              📍 {dish.distance} km
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-orange-600 text-lg leading-none">
                ₹{dish.discountPrice ?? dish.price}
              </span>
              {dish.portionSize && (
                <span className="text-[10px] text-gray-400 font-medium">/ {dish.portionSize}</span>
              )}
            </div>
            {dish.discountPrice && (
              <span className="text-xs text-gray-400 line-through">₹{dish.price}</span>
            )}
          </div>

          {/* Add to cart */}
          {dish.isAvailable && (
            qty === 0 ? (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleAdd}
                disabled={isAdding}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-200"
              >
                <Plus className="w-4 h-4" />
                ADD
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-orange-50 border-2 border-orange-400 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => updateQuantity(dish.id, qty - 1)}
                  className="w-8 h-9 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-orange-600 w-5 text-center">{qty}</span>
                <button
                  onClick={() => updateQuantity(dish.id, qty + 1)}
                  className="w-8 h-9 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </motion.div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
