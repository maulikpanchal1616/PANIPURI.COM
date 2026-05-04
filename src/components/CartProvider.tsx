"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "@/components/CartDrawer";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isOpen = useCartStore((s) => s.isOpen);

  return (
    <>
      {children}
      {mounted && isOpen && <CartDrawer />}
    </>
  );
}
