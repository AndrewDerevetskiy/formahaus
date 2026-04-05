import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  FLOOR_MATERIALS, WALL_COLORS, ROOM_AREA_M2,
  FLOOR_MAT_MAP, WALL_COLOR_MAP,
} from "../data/products";

/* Re-export for convenience in Cart.tsx / other pages */
export { FLOOR_MATERIALS, WALL_COLORS, ROOM_AREA_M2 };

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
export interface CartItem {
  id: string;
  type: string;
  label: string;
  price: number;
  icon: string;
}

interface CartContextValue {
  items: CartItem[];
  floorKind: string;
  wallColorId: string;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setFloorKind: (kind: string) => void;
  setWallColorId: (id: string) => void;

  floorTotal: number;
  wallTotal: number;
  furnitureTotal: number;
  grandTotal: number;
  itemCount: number;
}

/* ═══════════════════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════════════════ */
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems]         = useState<CartItem[]>([]);
  const [floorKind, setFloorKind] = useState("oak");
  const [wallColorId, setWallColorId] = useState("white");

  const addItem    = useCallback((item: CartItem) => setItems(prev => [...prev, item]), []);
  const removeItem = useCallback((id: string)     => setItems(prev => prev.filter(i => i.id !== id)), []);
  const clearItems = useCallback(()               => setItems([]), []);

  const furnitureTotal = items.reduce((s, i) => s + i.price, 0);
  const floorTotal     = ROOM_AREA_M2 * (FLOOR_MAT_MAP.get(floorKind)?.pricePerM2 ?? 45);
  const wallTotal      = WALL_COLOR_MAP.get(wallColorId)?.price ?? 280;
  const grandTotal     = furnitureTotal + floorTotal + wallTotal;
  const itemCount      = items.length;

  return (
    <CartContext.Provider value={{
      items, floorKind, wallColorId,
      addItem, removeItem, clearItems,
      setFloorKind, setWallColorId,
      floorTotal, wallTotal, furnitureTotal, grandTotal, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
