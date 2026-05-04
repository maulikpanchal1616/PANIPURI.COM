"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Check } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, onClose, initialLat = 23.0225, initialLng = 72.5714 }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState("Detecting location...");
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!mapRef.current) return;

    // Fix for Leaflet default icon issues in Next.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    leafletMap.current = L.map(mapRef.current).setView([initialLat, initialLng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap.current);

    marker.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(leafletMap.current);

    const updateAddress = async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const addr = data.display_name || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddress(addr);
        setCoords({ lat, lng });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    updateAddress(initialLat, initialLng);

    marker.current.on("dragend", () => {
      const pos = marker.current?.getLatLng();
      if (pos) {
        updateAddress(pos.lat, pos.lng);
      }
    });

    leafletMap.current.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.current?.setLatLng([lat, lng]);
      updateAddress(lat, lng);
    });

    // Handle initial geolocation if requested
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        leafletMap.current?.setView([latitude, longitude], 15);
        marker.current?.setLatLng([latitude, longitude]);
        updateAddress(latitude, longitude);
      });
    }

    return () => {
      leafletMap.current?.remove();
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        leafletMap.current?.setView([newLat, newLng], 15);
        marker.current?.setLatLng([newLat, newLng]);
        setAddress(display_name);
        setCoords({ lat: newLat, lng: newLng });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-800" style={{ fontFamily: "Outfit" }}>Select Delivery Location</h2>
            <p className="text-xs text-gray-500">Drag marker to pinpoint your exact location</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors">✕</button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50/50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search area, landmark, or apartment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gray-100">
          <div ref={mapRef} className="w-full h-full z-0" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-orange-100 pointer-events-auto flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Selected Address</p>
                <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-tight">
                  {loading ? "Fetching address..." : address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0">
          <button
            onClick={() => onLocationSelect(address, coords.lat, coords.lng)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-70"
          >
            <Check className="w-5 h-5" /> Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
