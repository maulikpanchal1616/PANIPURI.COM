"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, Clock, MapPin, Search, Flame, Leaf, 
  ChevronLeft, Info, Phone, ThumbsUp, Check, Loader2, Store 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DishCard from "@/components/DishCard";

type Dish = {
  id: string;
  vendorId: string;
  subVendorId: string | null;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isSpicy: boolean;
  isFeatured: boolean;
  rating: number;
  totalOrders: number;
  prepTime: number;
  portionSize: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
};

type SubVendor = {
  id: string;
  stallName: string;
  stallType: string;
  description: string | null;
  imageUrl: string | null;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openTime: string;
  closeTime: string;
};

type Vendor = {
  id: string;
  businessName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  address: string;
  latitude: number;
  longitude: number;
  isApproved: boolean;
  isActive: boolean;
  rating: number;
  totalOrders: number;
  upiId: string | null;
  dishes: Dish[];
  subVendors: SubVendor[];
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters & States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "rating">("default");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/vendors/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Vendor not found");
        return res.json();
      })
      .then((data) => {
        setVendor(data.vendor);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("We couldn't load this restaurant's menu. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cooking up the menu...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] pb-safe flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-4xl mb-6">🏪</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: "Outfit" }}>Oops! Page Not Found</h2>
          <p className="text-gray-500 max-w-md mb-8">{error || "The restaurant you're looking for doesn't seem to exist."}</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-orange-200"
          >
            Back to Marketplace
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Get unique categories
  const categories = ["All", ...Array.from(new Set((vendor.dishes || []).map((d) => d.category)))];

  // Process & Filter dishes
  const filteredDishes = (vendor.dishes || [])
    .map((dish) => ({
      ...dish,
      description: dish.description || undefined,
      discountPrice: dish.discountPrice || undefined,
      imageUrl: dish.imageUrl || undefined,
      portionSize: dish.portionSize || undefined,
      tags: dish.tags ? dish.tags.split(",") : [],
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        logoUrl: vendor.logoUrl || undefined,
        rating: vendor.rating,
        address: vendor.address,
      }
    }))
    .filter((dish) => {
      // 1. Category Filter
      if (selectedCategory !== "All" && dish.category !== selectedCategory) return false;
      
      // 2. Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = dish.description?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesDesc) return false;
      }

      // 3. Veg / Non-Veg filter
      if (vegFilter === "veg" && !dish.isVeg) return false;
      if (vegFilter === "non-veg" && dish.isVeg) return false;

      // 4. Spicy Filter
      if (spicyOnly && !dish.isSpicy) return false;

      return true;
    })
    .sort((a, b) => {
      // 5. Sorting
      if (sortBy === "price-low") {
        return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
      }
      if (sortBy === "price-high") {
        return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return 0; // Default sorting (by name or original order)
    });

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-safe flex flex-col">
      <Navbar />
      
      {/* Banner / Cover Header */}
      <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-gradient-to-r from-orange-100 to-amber-100">
        {vendor.bannerUrl ? (
          <img 
            src={vendor.bannerUrl} 
            alt={vendor.businessName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-25">
            <span className="text-9xl">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-24 left-4 sm:left-8 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-orange-500 hover:text-white transition-all shadow-md z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Floating Logo Overlay */}
        <div className="absolute bottom-4 left-4 sm:left-8 flex items-end gap-3 sm:gap-4 z-10">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 shadow-xl border border-orange-100 overflow-hidden flex-shrink-0">
            {vendor.logoUrl ? (
              <img 
                src={vendor.logoUrl} 
                alt="" 
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
              />
            ) : (
              <div className="w-full h-full bg-orange-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl">🏪</div>
            )}
          </div>
          <div className="text-white pb-0.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${vendor.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
              {vendor.isActive ? "● Open Now" : "○ Closed"}
            </span>
            <h1 className="text-xl sm:text-3xl font-black mt-1 sm:mt-2 leading-tight drop-shadow-md max-w-[200px] sm:max-w-none truncate" style={{ fontFamily: "Outfit" }}>
              {vendor.businessName}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Vendor Details Panel */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* Info Grid Card */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
              {vendor.description || "Indulge in the finest authentic culinary creations crafted with love, serving pure happiness straight from the streets of Ahmedabad."}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4 text-orange-500" /> {vendor.address}
              </span>
              {vendor.upiId && (
                <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 font-bold">
                  ✓ UPI Verified
                </span>
              )}
            </div>
          </div>
          
          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-dashed border-orange-100 pt-4 md:pt-0">
            <div className="bg-green-50 px-4 py-2.5 rounded-2xl text-center flex-1 md:flex-initial">
              <div className="flex items-center justify-center gap-1 text-green-700 font-black text-lg">
                <Star className="w-4 h-4 text-green-600 fill-green-600" /> {vendor.rating.toFixed(1)}
              </div>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-0.5">Rating</p>
            </div>
            <div className="bg-orange-50 px-4 py-2.5 rounded-2xl text-center flex-1 md:flex-initial">
              <div className="text-orange-700 font-black text-lg flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" /> ~25 min
              </div>
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-0.5">Delivery</p>
            </div>
            <div className="bg-amber-50 px-4 py-2.5 rounded-2xl text-center flex-1 md:flex-initial">
              <div className="text-amber-700 font-black text-lg">
                {vendor.totalOrders}+
              </div>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">Happy Orders</p>
            </div>
          </div>
        </div>

        {/* Stalls / Sub-vendors section */}
        {vendor.subVendors && vendor.subVendors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2" style={{ fontFamily: "Outfit" }}>
              <Store className="w-5 h-5 text-orange-500" /> Outpost Stalls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vendor.subVendors.map((stall) => (
                <div 
                  key={stall.id} 
                  className={`bg-white rounded-2xl p-4 border border-orange-50/80 shadow-sm flex items-start gap-3 relative overflow-hidden transition-all ${stall.isActive ? "hover:border-orange-200" : "opacity-75"}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                    {stall.imageUrl ? (
                      <img src={stall.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      "🎪"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{stall.stallName}</p>
                    <p className="text-xs text-gray-500 truncate">{stall.stallType}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5">
                      📍 {stall.address}
                    </p>
                  </div>
                  <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${stall.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs Slider & Interactive Filters */}
        <div className="sticky top-16 bg-[#FFF8F0]/95 backdrop-blur-md py-3 sm:py-4 z-20 space-y-3 sm:space-y-4 border-b border-orange-100/50">
          
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 scale-102"
                    : "bg-white text-gray-600 hover:text-orange-500 border border-orange-50 shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
 
          {/* Interactive Filters Grid */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            
            {/* Left - Search & Veg Toggle */}
            <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              
              {/* Live Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search inside this menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-orange-50 rounded-2xl text-xs outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
                />
              </div>
 
              {/* Segmented Veg Control */}
              <div className="bg-white p-1 rounded-2xl border border-orange-50 shadow-sm flex items-center gap-1 w-full sm:w-auto">
                {[
                  { id: "all", label: "All Items" },
                  { id: "veg", label: "🟢 Veg" },
                  { id: "non-veg", label: "🥩 Non-Veg" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setVegFilter(item.id as "all" | "veg" | "non-veg")}
                    className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap text-center ${
                      vegFilter === item.id 
                        ? "bg-orange-50 text-orange-600 shadow-sm border border-orange-100/50" 
                        : "text-gray-500 hover:text-orange-500"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Spicy Filter & Price Sorting */}
            <div className="flex gap-2 items-center">
              
              {/* Spicy Chili Filter */}
              <button
                onClick={() => setSpicyOnly(!spicyOnly)}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                  spicyOnly
                    ? "bg-red-500 text-white border-red-600 shadow-md shadow-red-200"
                    : "bg-white text-gray-600 border-orange-50 hover:text-red-500 shadow-sm"
                }`}
              >
                <Flame className={`w-4 h-4 ${spicyOnly ? "text-white" : "text-red-500"}`} />
                Spicy
              </button>

              {/* Price Sort Selection */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "price-low" | "price-high" | "rating")}
                className="px-4 py-3 bg-white border border-orange-50 rounded-2xl text-xs font-bold text-gray-600 outline-none focus:border-orange-400 shadow-sm cursor-pointer"
              >
                <option value="default">✨ Default Sort</option>
                <option value="price-low">₹ Price: Low to High</option>
                <option value="price-high">₹ Price: High to Low</option>
                <option value="rating">⭐ Popularity / Rating</option>
              </select>
            </div>

          </div>
        </div>

        {/* Dishes Responsive Grid */}
        <div>
          {filteredDishes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-orange-50/80 shadow-sm">
              <div className="text-6xl mb-4">🍽️</div>
              <h4 className="text-lg font-bold text-gray-700">No dishes found</h4>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">Try clearing search keywords or removing filters to discover yummy food!</p>
              {(searchQuery || selectedCategory !== "All" || vegFilter !== "all" || spicyOnly) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setVegFilter("all");
                    setSpicyOnly(false);
                    setSortBy("default");
                  }}
                  className="mt-4 bg-orange-100 text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-200 transition-colors text-xs"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredDishes.map((dish, idx) => (
                  <motion.div
                    key={dish.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DishCard dish={dish} index={idx} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </main>
      
      <BottomNav />
    </div>
  );
}
