"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, MapPin, Menu, X, ChefHat,
  User, LogOut, LayoutDashboard, Shield, UtensilsCrossed
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Magnetic button effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translate(0,0)";
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg border-b border-orange-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md"
            >
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg text-orange-600 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                Khani Pini
              </span>
              <span className="text-xs font-medium text-amber-500 tracking-widest uppercase">Bazar</span>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <Link
            href="/search"
            className="hidden md:flex items-center gap-3 bg-white/80 border border-orange-100 rounded-2xl px-5 py-2.5 w-96 hover:border-orange-300 transition-all shadow-sm group"
          >
            <Search className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
              Search dishes, restaurants...
            </span>
            <span className="ml-auto text-xs bg-orange-50 text-orange-400 px-2 py-0.5 rounded-lg">
              ⌘K
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Location */}
            <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 rounded-xl hover:bg-orange-50">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Ahmedabad</span>
            </button>

            {/* Cart */}
            <button
              id="cart-btn"
              ref={btnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={toggleCart}
              className="magnetic-btn relative w-11 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-md transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center pulse-glow"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User */}
            <div className="relative" ref={userMenuRef}>
              {session ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-11 h-11 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center border border-orange-200 hover:border-orange-400 transition-all"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-xl object-cover" />
                  ) : (
                    <span className="text-orange-600 font-bold text-sm">
                      {session.user.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-md"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}

              <AnimatePresence>
                {isUserMenuOpen && session && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                      <p className="font-semibold text-gray-800 truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 text-sm text-gray-700 transition-colors">
                        <ShoppingBag className="w-4 h-4 text-orange-500" />My Orders
                      </Link>
                      {session.user.role === "VENDOR" && (
                        <Link href="/vendor/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 text-sm text-gray-700 transition-colors">
                          <ChefHat className="w-4 h-4 text-orange-500" />Vendor Dashboard
                        </Link>
                      )}
                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 text-sm text-gray-700 transition-colors">
                          <Shield className="w-4 h-4 text-orange-500" />Admin Nexus
                        </Link>
                      )}

                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-600 transition-colors mt-1 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-orange-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-orange-100"
          >
            <div className="px-4 py-4 space-y-2">
              <Link href="/search" className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 text-orange-600 font-medium">
                <Search className="w-5 h-5" />Search Food
              </Link>
              {!session && (
                <Link href="/auth/login" className="flex items-center gap-3 p-3 rounded-2xl bg-orange-500 text-white font-medium">
                  <User className="w-5 h-5" />Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
