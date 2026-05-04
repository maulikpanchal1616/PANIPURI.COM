"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, Clock, ChevronRight, Store } from "lucide-react";

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    address: string;
    rating: number;
    totalOrders: number;
    isActive: boolean;
    distance?: number;
    _count?: { dishes: number; orders: number };
    subVendors?: { id: string }[];
  };
  index?: number;
}

export default function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Link href={`/vendor/${vendor.id}`}>
        <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-orange-50 group card-hover">
          {/* Banner */}
          <div className="relative h-36 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
            {vendor.bannerUrl ? (
              <img src={vendor.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl opacity-30">🍽️</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Active badge */}
            <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${vendor.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${vendor.isActive ? "bg-white animate-pulse" : "bg-gray-200"}`} />
              {vendor.isActive ? "Open" : "Closed"}
            </div>

            {/* Sub-vendor badge */}
            {vendor.subVendors && vendor.subVendors.length > 0 && (
              <div className="absolute top-3 left-3 bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {vendor.subVendors.length} Stalls
              </div>
            )}

            {/* Logo */}
            <div className="absolute -bottom-6 left-4">
              <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                {vendor.logoUrl ? (
                  <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 pt-8">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-800 text-base leading-tight">{vendor.businessName}</h3>
              <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                <Star className="w-3 h-3 fill-green-600 text-green-600" />
                <span className="text-xs font-bold text-green-700">{vendor.rating.toFixed(1)}</span>
              </div>
            </div>

            {vendor.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{vendor.description}</p>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {vendor.distance !== undefined ? `${vendor.distance} km` : vendor.address.split(",")[0]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" /> 20–35 min
              </span>
              {vendor._count && (
                <span className="text-orange-500 font-medium">{vendor._count.dishes} items</span>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-orange-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">{vendor.totalOrders.toLocaleString()} orders</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 group-hover:gap-2 transition-all">
                View Menu <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
