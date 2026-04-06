import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
  FLOOR_MATERIALS, WALL_COLORS, ROOM_AREA_M2,
  FLOOR_MAT_MAP, WALL_COLOR_MAP,
} from "../data/products";

/* Re-export for convenience in Cart.tsx / other pages */
export { FLOOR_MATERIALS, WALL_COLORS, ROOM_AREA_M2 };

const LS_ITEMS    = "formahaus_cart_items";
const LS_FLOOR    = "formahaus_floor_kind";
const LS_WALL     = "formahaus_wall_color";

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

/* ─── safe localStorage helpers ─── */
function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ═══════════════════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════════════════ */
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItemsRaw]         = useState<CartItem[]>(() => lsGet<CartItem[]>(LS_ITEMS, []));
  const [floorKind, setFloorKindRaw] = useState<string>(() => lsGet<string>(LS_FLOOR, "oak"));
  const [wallColorId, setWallRaw]    = useState<string>(() => lsGet<string>(LS_WALL, "white"));

  /* Sync to localStorage on every change */
  useEffect(() => { lsSet(LS_ITEMS, items); }, [items]);
  useEffect(() => { lsSet(LS_FLOOR, floorKind); }, [floorKind]);
  useEffect(() => { lsSet(LS_WALL, wallColorId); }, [wallColorId]);

  const addItem = useCallback((item: CartItem) =>
    setItemsRaw(prev => [...prev, item]), []);

  const removeItem = useCallback((id: string) =>
    setItemsRaw(prev => prev.filter(i => i.id !== id)), []);

  const clearItems = useCallback(() => setItemsRaw([]), []);

  const setFloorKind  = useCallback((k: string) => setFloorKindRaw(k), []);
  const setWallColorId = useCallback((id: string) => setWallRaw(id), []);

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
