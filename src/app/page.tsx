"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, Zap, TrendingUp, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DishCard from "@/components/DishCard";
import VendorCard from "@/components/VendorCard";
import { GridSkeleton } from "@/components/Skeletons";
import { DishWithVendor } from "@/types";
import { gsap } from "gsap";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "STREET_FOOD", label: "Street Food", emoji: "🌮" },
  { id: "THALI", label: "Thali", emoji: "🍱" },
  { id: "SNACKS", label: "Snacks", emoji: "🧆" },
  { id: "BEVERAGES", label: "Drinks", emoji: "🥤" },
  { id: "BREAKFAST", label: "Breakfast", emoji: "🥐" },
  { id: "DESSERTS", label: "Sweets", emoji: "🍮" },
  { id: "LUNCH", label: "Lunch", emoji: "🍛" },
];

const HERO_SLIDES = [
  { emoji: "🥘", title: "Authentic Undhiyu", subtitle: "Fresh from Surat's kitchens", color: "from-orange-600 to-red-500" },
  { emoji: "🍢", title: "Crispy Khaman Dhokla", subtitle: "Gujarati street favourite", color: "from-yellow-500 to-orange-500" },
  { emoji: "🥗", title: "Pav Bhaji Fiesta", subtitle: "Mumbai-style, Ahmedabad heart", color: "from-green-600 to-teal-500" },
];

type VendorItem = Parameters<typeof VendorCard>[0]["vendor"];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dishes, setDishes] = useState<(DishWithVendor & { distance?: number })[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [userLocation, setUserLocation] = useState({ lat: 23.0225, lng: 72.5714 });
  const [activeTab, setActiveTab] = useState<"dishes" | "vendors">("dishes");
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -80]);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current.querySelectorAll(".word"),
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "back.out(1.7)", delay: 0.3 }
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHeroSlide((s) => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catParam = activeCategory !== "all" ? `&category=${activeCategory}` : "";
        const [dishRes, vendorRes] = await Promise.all([
          fetch(`/api/dishes?lat=${userLocation.lat}&lng=${userLocation.lng}${catParam}&limit=12`),
          fetch(`/api/vendors?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=6`),
        ]);
        const [dishData, vendorData] = await Promise.all([dishRes.json(), vendorRes.json()]);
        setDishes(dishData.dishes ?? []);
        setVendors(vendorData.vendors ?? []);
      } catch {
        setDishes([]);
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeCategory, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe">
      <Navbar />

      {/* HERO */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ x: [0,30,0], y: [0,-20,0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0,-20,0], y: [0,30,0] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-amber-200/50 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.1 }} 
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-orange-100 text-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-6 border border-orange-200 max-w-full"
          >
            <Zap className="w-4 h-4 fill-orange-500" /> 
            <span className="truncate">Ahmedabad&apos;s #1 Food Marketplace</span>
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">NEW</span>
          </motion.div>
 
          <h1 ref={titleRef} className="text-4xl sm:text-6xl lg:text-8xl font-black leading-none mb-6 overflow-hidden" style={{ fontFamily: "Outfit, sans-serif" }}>
            {["Khao", "Piyo,", "Jiyo!"].map((word, i) => (
              <span key={i} className="word inline-block mr-2 sm:mr-4" style={{ opacity: 0 }}>
                {i === 1 ? <span className="gradient-text">{word}</span> : <span className="text-gray-800">{word}</span>}
              </span>
            ))}
          </h1>
 
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.9 }} 
            className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed"
          >
            From your favourite street-side stall to cloud kitchens — delivered fresh in minutes.
          </motion.p>
 
          <motion.form 
            onSubmit={handleSearch} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1.1 }} 
            className="relative max-w-2xl mx-auto mb-6 px-2 sm:px-0"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white rounded-2xl p-2 shadow-2xl shadow-orange-100 border border-orange-100">
              <div className="hidden sm:flex items-center gap-2 px-3 text-sm text-gray-500 border-r border-orange-100 pr-4 whitespace-nowrap">
                <MapPin className="w-4 h-4 text-orange-500" /> Ahmedabad <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex items-center flex-1 gap-2 px-2">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search dishes, restaurants..." 
                  className="w-full outline-none text-gray-700 bg-transparent text-sm placeholder:text-gray-400 py-2 sm:py-0" 
                />
              </div>
              <motion.button 
                type="submit" 
                whileTap={{ scale: 0.95 }} 
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3.5 sm:py-3 rounded-xl text-sm whitespace-nowrap w-full sm:w-auto"
              >
                Find Food
              </motion.button>
            </div>
          </motion.form>
 
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1.3 }} 
            className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-2"
          >
            {["Dhokla 🧡", "Undhiyu 🥘", "Pav Bhaji 🍞", "Fafda ✨", "Jalebi 🍯"].map((tag) => (
              <button 
                key={tag} 
                onClick={() => router.push(`/search?q=${tag.split(" ")[0]}`)} 
                className="text-xs sm:text-sm bg-white/80 text-gray-600 border border-orange-100 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-600 transition-all whitespace-nowrap"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={heroSlide} initial={{ opacity: 0, x: 60, rotate: 3 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -60, rotate: -3 }} transition={{ duration: 0.5 }} className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
            <div className={`w-64 h-80 bg-gradient-to-br ${HERO_SLIDES[heroSlide].color} rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 float`}>
              <span className="text-8xl">{HERO_SLIDES[heroSlide].emoji}</span>
              <div className="text-white text-center px-4">
                <p className="font-bold text-lg">{HERO_SLIDES[heroSlide].title}</p>
                <p className="text-sm opacity-80 mt-1">{HERO_SLIDES[heroSlide].subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white text-sm font-bold">4.9</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 px-4">
          {[{ label: "Restaurants", value: "200+" }, { label: "Dishes", value: "5000+" }, { label: "Customers", value: "50K+" }, { label: "Avg Delivery", value: "25 min" }].map((s) => (
            <div key={s.label} className="text-center hidden sm:block">
              <p className="text-2xl font-black text-orange-600" style={{ fontFamily: "Outfit, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* CATEGORIES */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat.id ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-orange-50 text-gray-600 hover:bg-orange-100"}`}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-14">
        <div className="flex items-center gap-2 bg-orange-50 p-1.5 rounded-2xl w-fit">
          {(["dishes", "vendors"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${activeTab === tab ? "bg-white text-orange-600 shadow-md" : "text-gray-500 hover:text-orange-500"}`}>
              {tab === "dishes" ? "🍽️ Dishes" : "🏪 Restaurants"}
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                <TrendingUp className="w-6 h-6 text-orange-500" />
                {activeTab === "dishes" ? "Trending Dishes" : "Top Restaurants"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Popular picks near you in Ahmedabad</p>
            </div>
            <button onClick={() => router.push(`/search?tab=${activeTab}`)} className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <GridSkeleton count={activeTab === "dishes" ? 8 : 6} type={activeTab === "dishes" ? "dish" : "vendor"} />
          ) : activeTab === "dishes" ? (
            dishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {dishes.map((dish, i) => <DishCard key={dish.id} dish={dish} index={i} />)}
              </div>
            ) : <EmptyState icon="🍽️" title="No dishes found" subtitle="Try a different category" />
          ) : (
            vendors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vendors.map((v, i) => <VendorCard key={(v as VendorItem).id} vendor={v as VendorItem} index={i} />)}
              </div>
            ) : <EmptyState icon="🏪" title="No restaurants found" subtitle="We are expanding soon!" />
          )}
        </div>

        {/* Promo banner */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-8 sm:p-12 overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <p className="text-sm font-semibold opacity-80 mb-1">Limited Time Offer</p>
              <h3 className="text-3xl font-black" style={{ fontFamily: "Outfit, sans-serif" }}>Free Delivery on<br />Your First 3 Orders!</h3>
              <p className="mt-2 opacity-80 text-sm">Use code: <span className="font-black bg-white/20 px-2 py-0.5 rounded-lg">KHAO3</span></p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push("/search")}
              className="bg-white text-orange-600 font-black px-8 py-4 rounded-2xl text-base shadow-xl whitespace-nowrap">
              Order Now 🚀
            </motion.button>
          </div>
        </motion.div>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-black text-center text-gray-800 mb-10" style={{ fontFamily: "Outfit, sans-serif" }}>
            Why <span className="gradient-text">Khani Pini Bazar?</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Average 25-min delivery across Ahmedabad" },
              { icon: "🏪", title: "200+ Vendors", desc: "Local kitchens, street stalls, cloud kitchens" },
              { icon: "🔒", title: "100% Safe", desc: "FSSAI certified, hygiene-checked vendors" },
              { icon: "💸", title: "Best Prices", desc: "No surge pricing, transparent fees always" },
            ].map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-orange-50 shadow-sm text-center card-hover">
                <div className="text-4xl mb-4">{feat.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-bold text-gray-700 text-xl">{title}</h3>
      <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
    </motion.div>
  );
}
