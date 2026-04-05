/* ═══════════════════════════════════════════════════════════════
   CENTRALISED PRODUCT DATABASE
   Single source of truth used by Home catalog, FormaHaus 3D
   editor, Cart pricing, and CartContext.
═══════════════════════════════════════════════════════════════ */

export interface Product {
  id: string;          // matches 3D builder "type" key
  name: string;
  nameUa: string;
  category: "seating" | "tables" | "storage" | "lighting" | "decor" | "flooring" | "wall";
  price: number;
  icon: string;
  desc: string;
  descUa: string;
  modelPath?: string;  // GLB path under /public
  unsplash?: string;   // preview image for Home catalog
}

export const PRODUCTS: Product[] = [
  /* ── SEATING ─────────────────────────────────────────────── */
  {
    id: "sofa", name: "Nordic Sofa", nameUa: "Скандинавський диван",
    category: "seating", price: 2199, icon: "🛋️",
    desc: "3-seat, natural linen upholstery",
    descUa: "3-місний, натуральний льон",
    unsplash: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "armchair", name: "Lounge Armchair", nameUa: "Крісло-лаундж",
    category: "seating", price: 1049, icon: "💺",
    desc: "Walnut frame, bouclé upholstery",
    descUa: "Рама горіх, тканина букле",
    modelPath: "/models/chair.glb",
    unsplash: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "bench", name: "Upholstered Bench", nameUa: "М'яка лавка",
    category: "seating", price: 549, icon: "🪑",
    desc: "Oak legs, velvet seat",
    descUa: "Ніжки дуб, оксамитове сидіння",
    unsplash: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80",
  },

  /* ── TABLES ──────────────────────────────────────────────── */
  {
    id: "coffee", name: "Low Coffee Table", nameUa: "Журнальний столик",
    category: "tables", price: 849, icon: "☕",
    desc: "Solid oak, lower shelf",
    descUa: "Масив дуба, нижня полиця",
    unsplash: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "dining", name: "Dining Table 200cm", nameUa: "Обідній стіл 200 см",
    category: "tables", price: 1999, icon: "🍽️",
    desc: "Extendable trestle, oak veneer",
    descUa: "Розкладний, шпон дуба",
    unsplash: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "side", name: "Marble Side Table", nameUa: "Мармуровий стіл",
    category: "tables", price: 449, icon: "🔲",
    desc: "Brass base, marble top",
    descUa: "Латунна основа, мармурова стільниця",
    unsplash: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80",
  },

  /* ── STORAGE ─────────────────────────────────────────────── */
  {
    id: "bookshelf", name: "Open Bookcase", nameUa: "Відкритий стелаж",
    category: "storage", price: 699, icon: "📚",
    desc: "5 shelves, white oak",
    descUa: "5 полиць, білий дуб",
    unsplash: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "cabinet", name: "Sideboard 160cm", nameUa: "Комод 160 см",
    category: "storage", price: 1349, icon: "🗄️",
    desc: "3 doors, matte lacquer, brass knobs",
    descUa: "3 дверцята, матовий лак, латунні ручки",
    unsplash: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80",
  },

  /* ── LIGHTING ────────────────────────────────────────────── */
  {
    id: "floorlamp", name: "Arc Floor Lamp", nameUa: "Підлогова лампа",
    category: "lighting", price: 599, icon: "💡",
    desc: "Brass arc, marble base",
    descUa: "Латунна дуга, мармурова база",
    modelPath: "/models/lamp.glb",
    unsplash: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "pendant", name: "Pendant Cluster", nameUa: "Підвісний світильник",
    category: "lighting", price: 389, icon: "🔦",
    desc: "Smoked glass, E27",
    descUa: "Тоноване скло, цоколь E27",
    modelPath: "/models/lamp.glb",
    unsplash: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80",
  },

  /* ── DECOR ───────────────────────────────────────────────── */
  {
    id: "plant", name: "Fiddle Leaf Fig", nameUa: "Фікус Ліра",
    category: "decor", price: 149, icon: "🌿",
    desc: "Statement indoor plant",
    descUa: "Акцентна кімнатна рослина",
    modelPath: "/models/plant.glb",
    unsplash: "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rug_classic", name: "Jute Area Rug", nameUa: "Джутовий килим",
    category: "decor", price: 599, icon: "🟫",
    desc: "200×300cm, natural fibre",
    descUa: "200×300 см, натуральне волокно",
    unsplash: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rug_round", name: "Round Wool Rug Ø200", nameUa: "Круглий вовняний килим",
    category: "decor", price: 849, icon: "⭕",
    desc: "Hand-tufted, navy blue",
    descUa: "Ручна набивка, темно-синій",
    unsplash: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rug_runner", name: "Hallway Runner", nameUa: "Доріжка у коридор",
    category: "decor", price: 399, icon: "▬",
    desc: "80×240cm, geometric pattern",
    descUa: "80×240 см, геометричний візерунок",
    unsplash: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
];

/* Map by id for O(1) lookup */
export const PRODUCT_MAP = new Map(PRODUCTS.map(p => [p.id, p]));

/* Floor materials */
export interface FloorMaterial {
  id: string;
  label: string;
  labelUa: string;
  sub: string;
  pricePerM2: number;
}
export const FLOOR_MATERIALS: FloorMaterial[] = [
  { id: "oak",      label: "Light Oak Parquet",  labelUa: "Паркет світлий дуб",   sub: "Ялинка, 14 мм",          pricePerM2: 45  },
  { id: "walnut",   label: "Dark Walnut Plank",  labelUa: "Дошка темний горіх",   sub: "Широка дошка, олія мат",  pricePerM2: 68  },
  { id: "marble",   label: "Calacatta Marble",   labelUa: "Мармур Калакатта",     sub: "Полірована плита",        pricePerM2: 120 },
  { id: "concrete", label: "Polished Concrete",  labelUa: "Мікроцемент",          sub: "Фінішне покриття",        pricePerM2: 35  },
];

/* Wall colours */
export interface WallColor {
  id: string;
  hex: string;
  label: string;
  labelUa: string;
  price: number; // full-room flat price
}
export const WALL_COLORS: WallColor[] = [
  { id: "white", hex: "#F5F0EA", label: "Off White",     labelUa: "Молочний",      price: 280 },
  { id: "sage",  hex: "#A8BAA0", label: "Sage Green",    labelUa: "Шавлієвий",     price: 340 },
  { id: "sand",  hex: "#C8B8A0", label: "Warm Sand",     labelUa: "Теплий пісок",  price: 340 },
  { id: "clay",  hex: "#B8957A", label: "Terracotta",    labelUa: "Теракота",      price: 380 },
  { id: "navy",  hex: "#3A4A5C", label: "Midnight Blue", labelUa: "Темно-синій",   price: 420 },
  { id: "char",  hex: "#2C2C2C", label: "Charcoal",      labelUa: "Антрацит",      price: 400 },
];

export const WALL_COLOR_MAP  = new Map(WALL_COLORS.map(w => [w.id, w]));
export const FLOOR_MAT_MAP   = new Map(FLOOR_MATERIALS.map(f => [f.id, f]));

export const ROOM_AREA_M2 = 81; // 9 m × 9 m
