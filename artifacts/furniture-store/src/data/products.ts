

export type ProductCategory =
  | "seating"
  | "tables"
  | "storage"
  | "lighting"
  | "decor"
  | "flooring"
  | "wall";

export type ProductStatus = "draft" | "pending" | "approved" | "rejected" | "blocked";

export type VendorStatus = "pending" | "approved" | "blocked";

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone: string;
  logo?: string;
  description: string;
  rating: number;
  reviewsCount: number;
  status: VendorStatus;
  plan: "basic" | "pro" | "premium";
  commissionPercent: number;
}

export interface DeliveryOption {
  id: "nova_poshta" | "ukrposhta" | "courier" | "pickup";
  label: string;
  priceFrom: number;
  estimatedDays: string;
}

export interface MarketplaceProduct {
  id: string;                 // унікальний ID товару
  designerType: string;       // ключ для 3D білдера: sofa, armchair, coffee...
  name: string;
  nameUa: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  icon: string;
  desc: string;
  descUa: string;

  vendorId: string;
  vendorName: string;
  vendorCity: string;

  status: ProductStatus;
  stock: number;
  sku: string;

  rating: number;
  reviewsCount: number;
  salesCount: number;

  has3DModel: boolean;
  modelPath?: string;
  imageUrl?: string;
  gallery?: string[];

  deliveryOptions: DeliveryOption[];
  warrantyMonths: number;
  commissionPercent: number;

  isPromoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════════
   VENDORS
═══════════════════════════════════════════════════════════════ */

export const VENDORS: Vendor[] = [
  {
    id: "vendor_kyiv_wood",
    name: "Kyiv Wood Studio",
    slug: "kyiv-wood-studio",
    city: "Київ",
    phone: "+380671112233",
    description: "Український виробник корпусних меблів та столів з натурального дерева.",
    rating: 4.8,
    reviewsCount: 126,
    status: "approved",
    plan: "pro",
    commissionPercent: 10,
  },
  {
    id: "vendor_lviv_comfort",
    name: "Lviv Comfort",
    slug: "lviv-comfort",
    city: "Львів",
    phone: "+380931112233",
    description: "М'які меблі, дивани, крісла та дизайнерський декор.",
    rating: 4.7,
    reviewsCount: 94,
    status: "approved",
    plan: "premium",
    commissionPercent: 12,
  },
  {
    id: "vendor_dnipro_light",
    name: "Dnipro Light",
    slug: "dnipro-light",
    city: "Дніпро",
    phone: "+380501112233",
    description: "Світильники, торшери, люстри та декоративне освітлення.",
    rating: 4.6,
    reviewsCount: 58,
    status: "approved",
    plan: "basic",
    commissionPercent: 8,
  },
];

const DELIVERY_STANDARD: DeliveryOption[] = [
  { id: "nova_poshta", label: "Нова пошта", priceFrom: 120, estimatedDays: "1–3 дні" },
  { id: "pickup", label: "Самовивіз", priceFrom: 0, estimatedDays: "сьогодні" },
];

const DELIVERY_LARGE: DeliveryOption[] = [
  { id: "nova_poshta", label: "Нова пошта вантажна", priceFrom: 450, estimatedDays: "2–5 днів" },
  { id: "courier", label: "Кур'єр по місту", priceFrom: 700, estimatedDays: "1–3 дні" },
  { id: "pickup", label: "Самовивіз", priceFrom: 0, estimatedDays: "за домовленістю" },
];

/* ═══════════════════════════════════════════════════════════════
   MARKETPLACE PRODUCTS
═══════════════════════════════════════════════════════════════ */

export const PRODUCTS: MarketplaceProduct[] = [
  {
    id: "prod_sofa_001",
    designerType: "sofa",
    name: "Nordic Sofa",
    nameUa: "Скандинавський диван",
    category: "seating",
    price: 2199,
    oldPrice: 2499,
    icon: "🛋️",
    desc: "3-seat, natural linen upholstery",
    descUa: "3-місний диван, натуральний льон",
    vendorId: "vendor_lviv_comfort",
    vendorName: "Lviv Comfort",
    vendorCity: "Львів",
    status: "approved",
    stock: 8,
    sku: "LC-SOFA-001",
    rating: 4.9,
    reviewsCount: 42,
    salesCount: 118,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_LARGE,
    warrantyMonths: 24,
    commissionPercent: 12,
    isPromoted: true,
    createdAt: "2026-04-01",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_armchair_001",
    designerType: "armchair",
    name: "Lounge Armchair",
    nameUa: "Крісло-лаундж",
    category: "seating",
    price: 1049,
    icon: "💺",
    desc: "Walnut frame, bouclé upholstery",
    descUa: "Рама горіх, тканина букле",
    vendorId: "vendor_lviv_comfort",
    vendorName: "Lviv Comfort",
    vendorCity: "Львів",
    status: "approved",
    stock: 12,
    sku: "LC-CHAIR-002",
    rating: 4.8,
    reviewsCount: 31,
    salesCount: 76,
    has3DModel: true,
    modelPath: "/models/chair.glb",
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 18,
    commissionPercent: 12,
    createdAt: "2026-04-01",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_bench_001",
    designerType: "bench",
    name: "Upholstered Bench",
    nameUa: "М'яка лавка",
    category: "seating",
    price: 549,
    icon: "🪑",
    desc: "Oak legs, velvet seat",
    descUa: "Ніжки дуб, оксамитове сидіння",
    vendorId: "vendor_kyiv_wood",
    vendorName: "Kyiv Wood Studio",
    vendorCity: "Київ",
    status: "approved",
    stock: 6,
    sku: "KWS-BENCH-003",
    rating: 4.7,
    reviewsCount: 19,
    salesCount: 45,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 12,
    commissionPercent: 10,
    createdAt: "2026-04-02",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_coffee_001",
    designerType: "coffee",
    name: "Low Coffee Table",
    nameUa: "Журнальний столик",
    category: "tables",
    price: 849,
    icon: "☕",
    desc: "Solid oak, lower shelf",
    descUa: "Масив дуба, нижня полиця",
    vendorId: "vendor_kyiv_wood",
    vendorName: "Kyiv Wood Studio",
    vendorCity: "Київ",
    status: "approved",
    stock: 15,
    sku: "KWS-TABLE-004",
    rating: 4.8,
    reviewsCount: 27,
    salesCount: 88,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 24,
    commissionPercent: 10,
    isPromoted: true,
    createdAt: "2026-04-02",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_dining_001",
    designerType: "dining",
    name: "Dining Table 200cm",
    nameUa: "Обідній стіл 200 см",
    category: "tables",
    price: 1999,
    icon: "🍽️",
    desc: "Extendable trestle, oak veneer",
    descUa: "Розкладний, шпон дуба",
    vendorId: "vendor_kyiv_wood",
    vendorName: "Kyiv Wood Studio",
    vendorCity: "Київ",
    status: "approved",
    stock: 4,
    sku: "KWS-DINING-005",
    rating: 4.9,
    reviewsCount: 22,
    salesCount: 39,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_LARGE,
    warrantyMonths: 36,
    commissionPercent: 10,
    createdAt: "2026-04-02",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_side_001",
    designerType: "side",
    name: "Marble Side Table",
    nameUa: "Мармуровий столик",
    category: "tables",
    price: 449,
    icon: "🔲",
    desc: "Brass base, marble top",
    descUa: "Латунна основа, мармурова стільниця",
    vendorId: "vendor_kyiv_wood",
    vendorName: "Kyiv Wood Studio",
    vendorCity: "Київ",
    status: "approved",
    stock: 10,
    sku: "KWS-SIDE-006",
    rating: 4.6,
    reviewsCount: 15,
    salesCount: 35,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 12,
    commissionPercent: 10,
    createdAt: "2026-04-03",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_bookshelf_001",
    designerType: "bookshelf",
    name: "Open Bookcase",
    nameUa: "Відкритий стелаж",
    category: "storage",
    price: 699,
    icon: "📚",
    desc: "5 shelves, white oak",
    descUa: "5 полиць, білий дуб",
    vendorId: "vendor_kyiv_wood",
    vendorName: "Kyiv Wood Studio",
    vendorCity: "Київ",
    status: "approved",
    stock: 9,
    sku: "KWS-SHELF-007",
    rating: 4.7,
    reviewsCount: 21,
    salesCount: 52,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_LARGE,
    warrantyMonths: 24,
    commissionPercent: 10,
    createdAt: "2026-04-04",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_cabinet_001",
    designerType: "cabinet",
    name: "Sideboard 160cm",
    nameUa: "Комод 160 см",
    category: "storage",
    price: 1349,
    icon: "🗄️",
    desc: "3 doors, matte lacquer, brass knobs",
    descUa: "3 дверцята, матовий лак, латунні ручки",
    vendorId: "vendor_kyiv_wood",
    vendorName: "Kyiv Wood Studio",
    vendorCity: "Київ",
    status: "approved",
    stock: 5,
    sku: "KWS-CAB-008",
    rating: 4.8,
    reviewsCount: 17,
    salesCount: 33,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_LARGE,
    warrantyMonths: 24,
    commissionPercent: 10,
    createdAt: "2026-04-04",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_floorlamp_001",
    designerType: "floorlamp",
    name: "Arc Floor Lamp",
    nameUa: "Підлогова лампа",
    category: "lighting",
    price: 599,
    icon: "💡",
    desc: "Brass arc, marble base",
    descUa: "Латунна дуга, мармурова база",
    vendorId: "vendor_dnipro_light",
    vendorName: "Dnipro Light",
    vendorCity: "Дніпро",
    status: "approved",
    stock: 20,
    sku: "DL-LAMP-009",
    rating: 4.6,
    reviewsCount: 24,
    salesCount: 91,
    has3DModel: true,
    modelPath: "/models/lamp.glb",
    imageUrl: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 12,
    commissionPercent: 8,
    isPromoted: true,
    createdAt: "2026-04-05",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_pendant_001",
    designerType: "pendant",
    name: "Pendant Cluster",
    nameUa: "Підвісний світильник",
    category: "lighting",
    price: 389,
    icon: "🔦",
    desc: "Smoked glass, E27",
    descUa: "Тоноване скло, цоколь E27",
    vendorId: "vendor_dnipro_light",
    vendorName: "Dnipro Light",
    vendorCity: "Дніпро",
    status: "approved",
    stock: 18,
    sku: "DL-PEND-010",
    rating: 4.5,
    reviewsCount: 16,
    salesCount: 66,
    has3DModel: true,
    modelPath: "/models/lamp.glb",
    imageUrl: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 12,
    commissionPercent: 8,
    createdAt: "2026-04-05",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_plant_001",
    designerType: "plant",
    name: "Fiddle Leaf Fig",
    nameUa: "Фікус Ліра",
    category: "decor",
    price: 149,
    icon: "🌿",
    desc: "Statement indoor plant",
    descUa: "Акцентна кімнатна рослина",
    vendorId: "vendor_lviv_comfort",
    vendorName: "Lviv Comfort",
    vendorCity: "Львів",
    status: "approved",
    stock: 30,
    sku: "LC-DECOR-011",
    rating: 4.7,
    reviewsCount: 29,
    salesCount: 120,
    has3DModel: true,
    modelPath: "/models/plant.glb",
    imageUrl: "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 1,
    commissionPercent: 12,
    createdAt: "2026-04-06",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_rug_classic_001",
    designerType: "rug_classic",
    name: "Jute Area Rug",
    nameUa: "Джутовий килим",
    category: "decor",
    price: 599,
    icon: "🟫",
    desc: "200×300cm, natural fibre",
    descUa: "200×300 см, натуральне волокно",
    vendorId: "vendor_lviv_comfort",
    vendorName: "Lviv Comfort",
    vendorCity: "Львів",
    status: "approved",
    stock: 11,
    sku: "LC-RUG-012",
    rating: 4.8,
    reviewsCount: 18,
    salesCount: 49,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 6,
    commissionPercent: 12,
    createdAt: "2026-04-06",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_rug_round_001",
    designerType: "rug_round",
    name: "Round Wool Rug Ø200",
    nameUa: "Круглий вовняний килим",
    category: "decor",
    price: 849,
    icon: "⭕",
    desc: "Hand-tufted, navy blue",
    descUa: "Ручна набивка, темно-синій",
    vendorId: "vendor_lviv_comfort",
    vendorName: "Lviv Comfort",
    vendorCity: "Львів",
    status: "approved",
    stock: 7,
    sku: "LC-RUG-013",
    rating: 4.6,
    reviewsCount: 11,
    salesCount: 27,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 6,
    commissionPercent: 12,
    createdAt: "2026-04-06",
    updatedAt: "2026-04-20",
  },
  {
    id: "prod_rug_runner_001",
    designerType: "rug_runner",
    name: "Hallway Runner",
    nameUa: "Доріжка у коридор",
    category: "decor",
    price: 399,
    icon: "▬",
    desc: "80×240cm, geometric pattern",
    descUa: "80×240 см, геометричний візерунок",
    vendorId: "vendor_lviv_comfort",
    vendorName: "Lviv Comfort",
    vendorCity: "Львів",
    status: "approved",
    stock: 14,
    sku: "LC-RUG-014",
    rating: 4.5,
    reviewsCount: 13,
    salesCount: 44,
    has3DModel: true,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
    deliveryOptions: DELIVERY_STANDARD,
    warrantyMonths: 6,
    commissionPercent: 12,
    createdAt: "2026-04-06",
    updatedAt: "2026-04-20",
  },
];

/* Показуємо покупцям тільки підтверджені товари */
export const APPROVED_PRODUCTS = PRODUCTS.filter(p => p.status === "approved" && p.stock > 0);

/* Сумісність зі старою логікою */
export const PRODUCT_MAP = new Map(PRODUCTS.map(p => [p.designerType, p]));
export const PRODUCT_BY_ID_MAP = new Map(PRODUCTS.map(p => [p.id, p]));
export const VENDOR_MAP = new Map(VENDORS.map(v => [v.id, v]));

/* Категорії для UI */
export const MARKETPLACE_CATEGORIES = [
  { id: "all", label: "Всі товари", icon: "🛒" },
  { id: "seating", label: "Дивани та крісла", icon: "🛋️" },
  { id: "tables", label: "Столи", icon: "🪵" },
  { id: "storage", label: "Зберігання", icon: "📦" },
  { id: "lighting", label: "Освітлення", icon: "💡" },
  { id: "decor", label: "Декор", icon: "🌿" },
] as const;

/* Floor materials */
export interface FloorMaterial {
  id: string;
  label: string;
  labelUa: string;
  sub: string;
  pricePerM2: number;
}

export const FLOOR_MATERIALS: FloorMaterial[] = [
  { id: "oak",      label: "Light Oak Parquet",  labelUa: "Паркет світлий дуб",   sub: "Ялинка, 14 мм",           pricePerM2: 45  },
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
  price: number;
}

export const WALL_COLORS: WallColor[] = [
  { id: "white", hex: "#F5F0EA", label: "Off White",     labelUa: "Молочний",      price: 280 },
  { id: "sage",  hex: "#A8BAA0", label: "Sage Green",    labelUa: "Шавлієвий",     price: 340 },
  { id: "sand",  hex: "#C8B8A0", label: "Warm Sand",     labelUa: "Теплий пісок",  price: 340 },
  { id: "clay",  hex: "#B8957A", label: "Terracotta",    labelUa: "Теракота",      price: 380 },
  { id: "navy",  hex: "#3A4A5C", label: "Midnight Blue", labelUa: "Темно-синій",   price: 420 },
  { id: "char",  hex: "#2C2C2C", label: "Charcoal",      labelUa: "Антрацит",      price: 400 },
];

export const WALL_COLOR_MAP = new Map(WALL_COLORS.map(w => [w.id, w]));
export const FLOOR_MAT_MAP = new Map(FLOOR_MATERIALS.map(f => [f.id, f]));

export const ROOM_AREA_M2 = 81;

/* Аналітика для адмінки / майбутньої статистики */
export function calculatePlatformCommission(product: MarketplaceProduct, quantity = 1): number {
  return Math.round(product.price * quantity * (product.commissionPercent / 100));
}

export function calculateVendorRevenue(product: MarketplaceProduct, quantity = 1): number {
  return product.price * quantity - calculatePlatformCommission(product, quantity);
}

export function getProductsByVendor(vendorId: string): MarketplaceProduct[] {
  return PRODUCTS.filter(p => p.vendorId === vendorId);
}

export function getApprovedProductsByCategory(category: ProductCategory | "all"): MarketplaceProduct[] {
  if (category === "all") return APPROVED_PRODUCTS;
  return APPROVED_PRODUCTS.filter(p => p.category === category);
}
