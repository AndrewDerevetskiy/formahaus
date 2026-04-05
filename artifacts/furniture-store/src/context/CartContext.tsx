import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════
   PRICING TABLES
═══════════════════════════════════════════════════════════ */
export const FLOOR_PRICES: Record<string, { label: string; pricePerM2: number }> = {
  oak:      { label: "Light Oak Parquet",  pricePerM2: 45  },
  walnut:   { label: "Dark Walnut Plank",  pricePerM2: 68  },
  marble:   { label: "Calacatta Marble",   pricePerM2: 120 },
  concrete: { label: "Polished Concrete",  pricePerM2: 35  },
};

export const WALL_PRICES: Record<string, { label: string; price: number }> = {
  white: { label: "Off White",     price: 280 },
  sage:  { label: "Sage Green",    price: 340 },
  sand:  { label: "Warm Sand",     price: 340 },
  clay:  { label: "Terracotta",    price: 380 },
  navy:  { label: "Midnight Blue", price: 420 },
  char:  { label: "Charcoal",      price: 400 },
};

export const ROOM_AREA_M2 = 81; // 9 m × 9 m

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
  const [items, setItems]           = useState<CartItem[]>([]);
  const [floorKind, setFloorKindSt] = useState("oak");
  const [wallColorId, setWallClrSt] = useState("white");

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearItems = useCallback(() => setItems([]), []);

  const setFloorKind   = useCallback((k: string) => setFloorKindSt(k), []);
  const setWallColorId = useCallback((id: string) => setWallClrSt(id), []);

  const furnitureTotal = items.reduce((s, i) => s + i.price, 0);
  const floorTotal     = ROOM_AREA_M2 * (FLOOR_PRICES[floorKind]?.pricePerM2 ?? 45);
  const wallTotal      = WALL_PRICES[wallColorId]?.price ?? 280;
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
