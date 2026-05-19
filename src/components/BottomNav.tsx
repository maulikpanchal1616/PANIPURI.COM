"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/cart", icon: ShoppingBag, label: "Cart", isCart: true },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!session && (item.label === "Orders" || item.label === "Profile")) {
      return false;
    }
    return true;
  });

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-orange-100 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2 pb-nav-safe">
          {visibleNavItems.map(({ href, icon: Icon, label, isCart }) => {
            const isActive = pathname === href;

            if (isCart) {
              return (
                <button
                  key={href}
                  onClick={toggleCart}
                  className="relative flex flex-col items-center gap-1 px-4 py-2"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="w-12 h-12 -mt-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white"
                  >
                    <Icon className="w-6 h-6 text-white" />
                    {mounted && totalItems > 0 && (
                      <span className="absolute top-0 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </motion.div>
                  <span className="text-[10px] font-medium text-orange-500 mt-1">{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-4 py-2 relative"
              >
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? "text-orange-500" : "text-gray-400"
                    }`}
                  />
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-6 h-0.5 bg-orange-500 rounded-full"
                  />
                )}
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
