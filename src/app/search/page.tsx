"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DishCard from "@/components/DishCard";
import VendorCard from "@/components/VendorCard";
import { GridSkeleton } from "@/components/Skeletons";
import { Search, SlidersHorizontal, Leaf, X, Loader2 } from "lucide-react";
import { DishWithVendor } from "@/types";

const CATEGORIES = [
  { id: "all", label: "All" }, { id: "STREET_FOOD", label: "Street Food" },
  { id: "THALI", label: "Thali" }, { id: "SNACKS", label: "Snacks" },
  { id: "BEVERAGES", label: "Drinks" }, { id: "BREAKFAST", label: "Breakfast" },
  { id: "DESSERTS", label: "Sweets" }, { id: "LUNCH", label: "Lunch" },
];

type VendorItem = Parameters<typeof VendorCard>[0]["vendor"];

function SearchContent() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialTab = (params.get("tab") as "dishes" | "vendors") ?? "dishes";

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<"dishes" | "vendors">(initialTab);
  const [category, setCategory] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dishes, setDishes] = useState<(DishWithVendor & { distance?: number })[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation] = useState({ lat: 23.0225, lng: 72.5714 });

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const catParam = category !== "all" ? `&category=${category}` : "";
      const vegParam = vegOnly ? "&isVeg=true" : "";
      const qParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const [dishRes, vendorRes] = await Promise.all([
        fetch(`/api/dishes?lat=${userLocation.lat}&lng=${userLocation.lng}${qParam}${catParam}${vegParam}&limit=24`),
        fetch(`/api/vendors?lat=${userLocation.lat}&lng=${userLocation.lng}${qParam}&limit=12`),
      ]);
      const [dishData, vendorData] = await Promise.all([dishRes.json(), vendorRes.json()]);
      setDishes(dishData.dishes ?? []);
      setVendors(vendorData.vendors ?? []);
    } catch {
      setDishes([]); setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, vegOnly, userLocation]);

  useEffect(() => { doSearch(); }, [doSearch]);

  return (
    <>
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes, restaurants, cuisines..."
          className="w-full pl-12 pr-32 py-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button onClick={() => setQuery("")} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${showFilters ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm mb-6 overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-sm font-semibold text-gray-600">Category:</span>
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${category === cat.id ? "bg-orange-500 text-white" : "bg-orange-50 text-gray-600 hover:bg-orange-100"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${vegOnly ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                <Leaf className="w-4 h-4" /> Veg Only
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab switcher */}
      <div className="flex items-center gap-2 bg-orange-50 p-1.5 rounded-2xl w-fit mb-6">
        {(["dishes", "vendors"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${activeTab === tab ? "bg-white text-orange-600 shadow-md" : "text-gray-500 hover:text-orange-500"}`}>
            {tab === "dishes" ? "🍽️ Dishes" : "🏪 Restaurants"}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-5">
          {activeTab === "dishes" ? dishes.length : vendors.length} results
          {query && <> for <span className="font-semibold text-gray-800">&ldquo;{query}&rdquo;</span></>}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <GridSkeleton count={activeTab === "dishes" ? 12 : 6} type={activeTab === "dishes" ? "dish" : "vendor"} />
      ) : activeTab === "dishes" ? (
        dishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {dishes.map((dish, i) => <DishCard key={dish.id} dish={dish} index={i} />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-bold text-gray-700 text-xl">No dishes found</h3>
            <p className="text-gray-500 text-sm mt-2">Try different keywords or remove filters</p>
            <button onClick={() => { setQuery(""); setCategory("all"); setVegOnly(false); }}
              className="mt-4 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-2xl text-sm hover:bg-orange-600 transition-colors">
              Clear All Filters
            </button>
          </motion.div>
        )
      ) : (
        vendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-24 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="font-bold text-gray-700 text-xl">No restaurants found</h3>
            <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
          </motion.div>
        )
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
          <SearchContent />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
