import Pro3DEffects from "./Pro3DEffects";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import * as THREE from "three";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useCart } from "../context/CartContext";

type ДизайнerTab = "furniture" | "materials" | "summary" | "ai";

type КаталогItem = {
  id: string;
  type: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl?: string;
  model3dUrl?: string;
  sellerName?: string;
};

type VendorProduct = {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  description: string;
  imageUrl: string;
  model3dUrl?: string;
  designerType: string;
  has3DModel: boolean;
  status: "draft" | "active" | "paused";
  createdAt: string;
};

type PlacedItem = КаталогItem & {
  instanceId: string;
  position: [number, number, number];
  rotation: number;
  model3dUrl?: string;
};

type RoomDimensions = {
  length: number;
  width: number;
  height: number;
};

const LS_VENDOR_PRODUCTS = "formahaus_vendor_products";

const FURNITURE: КаталогItem[] = [
  { id: "sofa", type: "sofa", name: "Скандинавський диван", category: "Меблі", price: 2199, description: "3-місний диван, льон", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80", sellerName: "FormaHaus" },
  { id: "corner_sofa", type: "sofa", name: "Кутовий диван Oslo", category: "Меблі", price: 2899, description: "Кутовий диван для вітальні", imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80", sellerName: "WoodArt" },
  { id: "armchair", type: "armchair", name: "Крісло Lounge", category: "Меблі", price: 1049, description: "М'яке крісло для вітальні", imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=700&q=80", sellerName: "WoodArt" },
  { id: "dining_chair", type: "armchair", name: "Обідній стілець Cozy", category: "Меблі", price: 249, description: "Стілець для кухні або їдальні", imageUrl: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=700&q=80", sellerName: "MebelPro" },
  { id: "coffee", type: "coffee", name: "Журнальний стіл Wood", category: "Меблі", price: 849, description: "Стіл для вітальні", imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=700&q=80", sellerName: "FormaHaus" },
  { id: "dining", type: "dining", name: "Обідній стіл Oak", category: "Меблі", price: 1999, description: "Стіл на 6–8 місць", imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=700&q=80", sellerName: "WoodArt" },
  { id: "bookshelf", type: "bookshelf", name: "Стелаж Walnut", category: "Меблі", price: 699, description: "Відкритий стелаж", imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=700&q=80", sellerName: "HomeLine" },
  { id: "cabinet", type: "cabinet", name: "Комод Minimal", category: "Меблі", price: 1349, description: "Комод / тумба", imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&q=80", sellerName: "HomeLine" },
  { id: "wardrobe", type: "cabinet", name: "Шафа Soft White", category: "Меблі", price: 1599, description: "Шафа для спальні", imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80", sellerName: "FormaHaus" },
  { id: "tv_unit", type: "cabinet", name: "Тумба під TV", category: "Меблі", price: 899, description: "Тумба для телевізора", imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80", sellerName: "WoodArt" },
  { id: "floorlamp", type: "floorlamp", name: "Підлогова лампа", category: "Освітлення", price: 599, description: "Торшер для вітальні", imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80", sellerName: "LightHub" },
  { id: "table_lamp", type: "floorlamp", name: "Настільна лампа", category: "Освітлення", price: 189, description: "Лампа для робочого столу", imageUrl: "https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=700&q=80", sellerName: "LightHub" },
  { id: "pendant", type: "floorlamp", name: "Підвісний світильник", category: "Освітлення", price: 389, description: "Світильник над столом", imageUrl: "https://images.unsplash.com/photo-1606170034764-bcaf3c32bf7d?auto=format&fit=crop&w=700&q=80", sellerName: "LightHub" },
  { id: "wall_light", type: "floorlamp", name: "Настінне бра", category: "Освітлення", price: 229, description: "Декоративне настінне світло", imageUrl: "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=700&q=80", sellerName: "LightHub" },
  { id: "plant", type: "plant", name: "Кімнатна рослина", category: "Декор", price: 149, description: "Декоративна рослина", imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80", sellerName: "GreenHome" },
  { id: "large_plant", type: "plant", name: "Велика рослина", category: "Декор", price: 249, description: "Акцентна рослина", imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80", sellerName: "GreenHome" },
  { id: "rug_classic", type: "rug_classic", name: "Килим Area Rug", category: "Декор", price: 599, description: "Килим для вітальні", imageUrl: "https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?auto=format&fit=crop&w=700&q=80", sellerName: "TextileHome" },
  { id: "round_rug", type: "rug_classic", name: "Круглий килим", category: "Декор", price: 499, description: "Круглий килим", imageUrl: "https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?auto=format&fit=crop&w=700&q=80", sellerName: "TextileHome" },
  { id: "mirror", type: "cabinet", name: "Настінне дзеркало", category: "Декор", price: 299, description: "Дзеркало для кімнати", imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80", sellerName: "FormaHaus" },
  { id: "laminate_oak", type: "floor_product", name: "Ламінат світлий дуб", category: "Підлога", price: 45, description: "Ціна за м², 32 клас", imageUrl: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=700&q=80", sellerName: "FloorMarket" },
  { id: "tile_stone", type: "floor_product", name: "Керамограніт Stone Grey", category: "Підлога", price: 72, description: "Ціна за м², плитка", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80", sellerName: "FloorMarket" },
  { id: "paint_white", type: "wall_product", name: "Фарба Warm White", category: "Стіни та обої", price: 28, description: "Ціна за м² покриття", imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80", sellerName: "ColorSpace" },
  { id: "wallpaper_linen", type: "wall_product", name: "Шпалери Linen Beige", category: "Стіни та обої", price: 39, description: "Ціна за рулон", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80", sellerName: "ColorSpace" },
];

const FLOOR_OPTIONS = [
  { id: "oak", name: "Світлий дуб", color: "#d8bc8d", color2: "#b98242", pattern: "planks", price: 3645 },
  { id: "natural_oak", name: "Паркет ялинка", color: "#c9a46c", color2: "#8c5a27", pattern: "herringbone", price: 4050 },
  { id: "walnut", name: "Горіх", color: "#7a4b2a", color2: "#3a1f10", pattern: "planks", price: 5508 },
  { id: "dark_wood", name: "Темне дерево", color: "#3c2416", color2: "#1c0f08", pattern: "planks", price: 5900 },
  { id: "concrete", name: "Світлий бетон", color: "#c9c9c3", color2: "#92928b", pattern: "concrete", price: 3100 },
  { id: "marble", name: "Мармур білий", color: "#f2eee8", color2: "#aab0bb", pattern: "marble", price: 9720 },
  { id: "black_marble", name: "Темний камінь", color: "#1f2933", color2: "#7f8794", pattern: "marble", price: 10900 },
  { id: "warm_tile", name: "Плитка бежева", color: "#d6c3aa", color2: "#a58761", pattern: "tiles", price: 4300 },
];

const WALL_OPTIONS = [
  { id: "white", name: "Білий", color: "#f5f0ea", price: 280 },
  { id: "pure_white", name: "Світло-сірий", color: "#eef1f5", price: 260 },
  { id: "cream", name: "Бежевий", color: "#efe2c9", price: 320 },
  { id: "sage", name: "Оливковий", color: "#a8baa0", price: 340 },
  { id: "sand", name: "Шпалери Linen", color: "#c8b8a0", price: 340 },
  { id: "blue_grey", name: "Шпалери Geo", color: "#72869a", price: 390 },
  { id: "charcoal", name: "Бетон", color: "#2d3138", price: 400 },
];

function money(value: number) {
  return `${Number(value || 0).toLocaleString("uk-UA")} ₴`;
}

function loadVendorProducts(): VendorProduct[] {
  try {
    const raw = localStorage.getItem(LS_VENDOR_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function normalizeVendorProduct(product: VendorProduct): КаталогItem {
  return {
    id: `vendor_${product.id}`,
    type: product.designerType || product.category || "product",
    name: product.name,
    category: product.category || "Товари продавців",
    price: Number(product.price || 0),
    description: product.description || `Товар продавця ${product.vendorName || ""}`,
    imageUrl: product.imageUrl,
    model3dUrl: product.model3dUrl,
  };
}

function readVendorProducts(): КаталогItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LS_VENDOR_PRODUCTS);
    if (!raw) return [];

    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    return list.map((product: any, index: number) => ({
      id: String(product.id || `vendor_${index}`),
      type: String(product.designerType || product.type || "sofa"),
      name: String(product.name || "Товар продавця"),
      category: String(product.category || "Меблі"),
      price: Number(product.price || 0),
      description: String(product.description || "Товар продавця FormaHaus"),
      imageUrl: product.imageUrl || product.photoUrl || product.image || "",
      model3dUrl: product.model3dUrl || product.modelUrl || product.model_path || "",
      sellerName: product.vendorName || product.sellerName || "Продавець FormaHaus",
    }));
  } catch {
    return [];
  }
}

const categoryLabel: Record<string, string> = {
  All: "Усі",
  Меблі: "Меблі",
  Освітлення: "Освітлення",
  Підлога: "Підлога",
  "Стіни та обої": "Стіни та обої",
  Декор: "Декор",
};

export default function FormaHaus() {
  const cart = useCart();

  const [tab, setTab] = useState<ДизайнerTab>("furniture");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [floorId, setFloorId] = useState("oak");
  const [wallId, setWallId] = useState("white");
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({ length: 6, width: 4, height: 2.8 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("all");
  const [vendorProducts3D, setVendorProducts3D] = useState<КаталогItem[]>(() =>
    loadVendorProducts()
      .filter(product => product.status === "active" && (product.has3DModel || product.designerType || product.model3dUrl))
      .map(normalizeVendorProduct)
  );

  function openTab(nextTab: ДизайнerTab) {
    setTab(nextTab);
    setMobilePanelOpen(true);
  }

  const vendorProducts = useMemo(() => readVendorProducts(), []);
  const catalog = useMemo(() => [...vendorProducts, ...FURNITURE], [vendorProducts]);

  function refreshVendorProducts3D() {
    const products = loadVendorProducts()
      .filter(product => product.status === "active" && (product.has3DModel || product.designerType || product.model3dUrl))
      .map(normalizeVendorProduct);

    setVendorProducts3D(products);
  }

  useEffect(() => {
    refreshVendorProducts3D();

    function onStorage() {
      refreshVendorProducts3D();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshVendorProducts3D);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshVendorProducts3D);
    };
  }, []);

  const selected = items.find(i => i.instanceId === selectedId);
  const selectedCatalogItem = selected || catalog[0];
  const floor = FLOOR_OPTIONS.find(f => f.id === floorId) || FLOOR_OPTIONS[0];
  const wall = WALL_OPTIONS.find(w => w.id === wallId) || WALL_OPTIONS[0];

  const furnitureРазом = items.reduce((sum, item) => sum + item.price, 0);
  const roomArea = roomDimensions.length * roomDimensions.width;
  const wallArea = 2 * (roomDimensions.length + roomDimensions.width) * roomDimensions.height;
  const floorРазом = Math.round((floor.price / 24) * roomArea);
  const wallРазом = Math.round((wall.price / 24) * wallArea);
  const projectРазом = furnitureРазом + floorРазом + wallРазом;

  const categories = useMemo(() => ["All", ...Array.from(new Set(catalog.map(i => i.category)))], [catalog]);

  const filteredКаталог = useMemo(() => {
    const q = search.trim().toLowerCase();

    return catalog.filter(item => {
      if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
      if (priceFilter === "under500" && item.price >= 500) return false;
      if (priceFilter === "500to1000" && (item.price < 500 || item.price > 1000)) return false;
      if (priceFilter === "over1000" && item.price <= 1000) return false;
      if (!q) return true;

      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [catalog, search, categoryFilter, priceFilter]);

  const addКаталог = useCallback((product: КаталогItem) => {
    const instance: PlacedItem = {
      ...product,
      instanceId: `${product.id}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      position: [
        (Math.random() - 0.5) * 2.6,
        0,
        (Math.random() - 0.5) * 2.3,
      ],
      rotation: 0,
    };

    setItems(prev => [...prev, instance]);
    setSelectedId(instance.instanceId);

    cart.addItem({
      id: instance.instanceId,
      type: instance.type,
      label: instance.name,
      price: instance.price,
      icon: product.category === "Меблі" ? "SOFA" : product.category === "Освітлення" ? "LAMP" : "ITEM",
    });
  }, [cart]);

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    setItems(prev => prev.filter(i => i.instanceId !== selectedId));
    cart.removeItem(selectedId);
    setSelectedId("");
  }, [selectedId, cart]);

  const rotateSelected = useCallback((direction: "left" | "right" = "right") => {
    if (!selectedId) return;
    const step = Math.PI / 12;

    setItems(prev =>
      prev.map(item =>
        item.instanceId === selectedId
          ? { ...item, rotation: direction === "left" ? (item.rotation || 0) - step : (item.rotation || 0) + step }
          : item
      )
    );
  }, [selectedId]);

  const clearRoom = useCallback(() => {
    setItems([]);
    setSelectedId("");
    cart.clearItems();
  }, [cart]);

  const updateItemPosition = useCallback((id: string, position: [number, number, number]) => {
    setItems(prev => prev.map(item => item.instanceId === id ? { ...item, position } : item));
  }, []);

  function updateRoomDimension(key: keyof RoomDimensions, value: number) {
    const limits: Record<keyof RoomDimensions, { min: number; max: number }> = {
      length: { min: 2.4, max: 12 },
      width: { min: 2.2, max: 10 },
      height: { min: 2.2, max: 4.2 },
    };

    const safeValue = Number.isFinite(value) ? value : roomDimensions[key];
    const clamped = THREE.MathUtils.clamp(safeValue, limits[key].min, limits[key].max);

    setRoomDimensions(prev => ({
      ...prev,
      [key]: Math.round(clamped * 10) / 10,
    }));
  }

  function changeFloor(id: string) {
    setFloorId(id);
    if (cart.setFloorKind) cart.setFloorKind(id);
  }

  function changeWall(id: string) {
    setWallId(id);
    if (cart.setWallColorId) cart.setWallColorId(id);
  }

  return (
    <div className="fh-pro-app">
      <header className="fh-pro-topbar">
        <Link href="/" className="fh-pro-brand">
          <div className="fh-pro-logo">⌂</div>
          <div className="fh-pro-brand-name">FormaHaus</div>
        </Link>

        <div className="fh-pro-search">
          <span>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук товарів, брендів, категорій..." />
        </div>

        <nav className="fh-pro-mainnav">
          <button>▦ Каталог</button>
          <button>✦ Натхнення</button>
          <button>♙ Професіонали</button>
          <button>▱ Проєкти <b>{items.length}</b></button>
        </nav>

        <div className="fh-pro-top-actions">
          <button className="icon-btn">♡</button>
          <Link href="/cart" className="cart-btn">🛒 <span>{cart.itemCount}</span></Link>
          <button className="profile-btn">Андрій <small>Покупець</small></button>
        </div>
      </header>

      <main className="fh-pro-workspace">
        <nav className="fh-pro-rail">
          <div className="left-tabs">
            <button className={tab === "furniture" ? "active" : ""} onClick={() => openTab("furniture")}>Каталог</button>
            <button className={tab === "materials" ? "active" : ""} onClick={() => openTab("materials")}>Оздоблення</button>
          </div>

          <SideSection title="Підлога" action="Дивитися все">
            <div className="tile-grid">
              {FLOOR_OPTIONS.slice(0, 4).map(option => (
                <button key={option.id} className="material-tile" onClick={() => changeFloor(option.id)}>
                  <span style={{ background: option.color }} />
                  <small>{option.name}</small>
                </button>
              ))}
            </div>
          </SideSection>

          <SideSection title="Стіни" action="Дивитися все">
            <div className="tile-grid">
              {WALL_OPTIONS.slice(0, 4).map(option => (
                <button key={option.id} className="material-tile" onClick={() => changeWall(option.id)}>
                  <span style={{ background: option.color }} />
                  <small>{option.name}</small>
                </button>
              ))}
            </div>
          </SideSection>

          <SideSection title="Меблі" action="Дивитися все">
            <div className="mini-category-grid">
              <button onClick={() => { setCategoryFilter("Меблі"); openTab("furniture"); }}>Дивани</button>
              <button onClick={() => { setCategoryFilter("Меблі"); openTab("furniture"); }}>Ліжка</button>
              <button onClick={() => { setCategoryFilter("Меблі"); openTab("furniture"); }}>Шафи</button>
              <button onClick={() => { setCategoryFilter("Меблі"); openTab("furniture"); }}>Столи</button>
            </div>
          </SideSection>

          <SideSection title="Освітлення" action="Дивитися все">
            <div className="mini-category-grid">
              <button onClick={() => { setCategoryFilter("Освітлення"); openTab("furniture"); }}>Люстри</button>
              <button onClick={() => { setCategoryFilter("Освітлення"); openTab("furniture"); }}>Бра</button>
              <button onClick={() => { setCategoryFilter("Освітлення"); openTab("furniture"); }}>Точкові</button>
              <button onClick={() => { setCategoryFilter("Освітлення"); openTab("furniture"); }}>Треки</button>
            </div>
          </SideSection>

          <div className="ai-side-card" onClick={() => openTab("ai")}>
            <b>AI Дизайн</b>
            <p>Створіть дизайн кімнати за допомогою штучного інтелекту</p>
            <span>✦</span>
          </div>
        </nav>

        <section className="fh-pro-stage">
          <div className="canvas-card">
            <Canvas shadows dpr={[1, 1.7]} camera={{ position: [4.8, 3.4, 5.8], fov: 40 }}>
              <Pro3DEffects />
              <Scene
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMove={updateItemPosition}
                floor={floor}
                wallColor={wall.color}
                roomDimensions={roomDimensions}
              />
            </Canvas>

            <div className="scene-top-tools">
              <button onClick={() => openTab("furniture")}>▦ Кімната</button>
              <button onClick={() => openTab("materials")}>⌗ Розміри</button>
              <button onClick={() => openTab("materials")}>▱ Підлога</button>
              <button onClick={() => openTab("materials")}>▥ Стіни</button>
              <button onClick={() => setCategoryFilter("Освітлення")}>☼ Освітлення</button>
              <button onClick={() => setCategoryFilter("Декор")}>✧ Декор</button>
            </div>

            <div className="mode-switch">
              <button>2D</button>
              <button className="active">3D</button>
            </div>

            <div className="mini-map">
              <div className="mini-room">
                <span />
                <span />
                <b>{items.length}</b>
              </div>
            </div>

            {selected && (
              <div className="object-float-tools">
                <button onClick={() => rotateSelected("left")}>↺</button>
                <button onClick={() => rotateSelected("right")}>↻</button>
                <button>⧉</button>
                <button onClick={removeSelected}>🗑</button>
                <button>♡</button>
              </div>
            )}

            <button className="walk-btn">Режим прогулянки</button>

            <div className="view-tools">
              <button>☝</button>
              <button>✥</button>
              <button>□</button>
              <button>⛶</button>
            </div>

            <div className="nav-cube">⌂</div>
          </div>

          <section className={`fh-pro-bottom-panel ${mobilePanelOpen ? "open" : ""}`}>
            <div className="bottom-tabs">
              <button className="mobile-panel-close" onClick={() => setMobilePanelOpen(false)}>×</button>
              <button className={tab === "furniture" ? "active" : ""} onClick={() => openTab("furniture")}>Каталог</button>
              <button className={tab === "materials" ? "active" : ""} onClick={() => openTab("materials")}>Матеріали</button>
              <button className={tab === "summary" ? "active" : ""} onClick={() => openTab("summary")}>Кошторис</button>
              <button className={tab === "ai" ? "active" : ""} onClick={() => openTab("ai")}>AI</button>
            </div>

            {tab === "furniture" && (
              <>
                <div className="catalog-filter-bar">
                  <div className="search-wrap">⌕<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук товарів..." /></div>
                  <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
                    <option value="all">Усі ціни</option>
                    <option value="under500">До $500</option>
                    <option value="500to1000">$500 — $1,000</option>
                    <option value="over1000">Понад $1,000</option>
                  </select>
                </div>

                <div className="chips-row">
                  {categories.map(category => (
                    <button key={category} onClick={() => setCategoryFilter(category)} className={categoryFilter === category ? "active" : ""}>
                      {categoryLabel[category] || category}
                    </button>
                  ))}
                </div>

                <div className="section-line"><b>{categoryFilter === "All" ? "Меблі" : categoryLabel[categoryFilter] || categoryFilter}</b><span>Показати всі ›</span></div>
                <div className="product-strip">
                  {filteredКаталог.map(item => (
                    <ProductCard key={item.id} item={item} onAdd={() => addКаталог(item)} />
                  ))}
                </div>
              </>
            )}

            {tab === "materials" && (
              <div className="materials-layout">
                <RoomSettings dimensions={roomDimensions} onChange={updateRoomDimension} />
                <MaterialSection title="Підлога" options={FLOOR_OPTIONS} currentId={floorId} onSelect={changeFloor} />
                <MaterialSection title="Стіни" options={WALL_OPTIONS} currentId={wallId} onSelect={changeWall} />
              </div>
            )}

            {tab === "summary" && (
              <div className="summary-large">
                <h3>Кошторис проекту</h3>
                <SummaryRow label="Меблі" value={money(furnitureРазом)} />
                <SummaryRow label={`Підлога · ${floor.name} · ${roomArea.toFixed(1)} м²`} value={money(floorРазом)} />
                <SummaryRow label={`Стіни · ${wall.name} · ${wallArea.toFixed(1)} м²`} value={money(wallРазом)} />
                <div className="summary-total"><span>Разом</span><b>{money(projectРазом)}</b></div>
                <Link href="/cart" className="summary-checkout">Перейти до кошика ({cart.itemCount})</Link>
              </div>
            )}

            {tab === "ai" && (
              <div className="ai-panel">
                <h3>AI Дизайн кімнати</h3>
                <p>Виберіть стиль, і FormaHaus автоматично підбере меблі, матеріали та освітлення.</p>
                <div className="ai-grid">
                  <button>Скандинавський</button>
                  <button>Мінімалізм</button>
                  <button>Лофт</button>
                  <button>Сучасний</button>
                </div>
                <button className="ai-main">Створити дизайн автоматично</button>
              </div>
            )}
          </section>
        </section>

        <aside className="fh-pro-inspector">
          <div className="project-panel">
            <div className="project-head">
              <div>
                <b>Мій проєкт</b>
                <small>Кімната {roomDimensions.length}×{roomDimensions.width} м · {roomArea.toFixed(1)} м²</small>
              </div>
              <button className="save-green">Зберегти</button>
            </div>

            <div className="estimate-card">
              <div className="estimate-total"><span>Кошторис</span><b>{money(projectРазом)}</b></div>
              <SummaryRow label="Меблі" value={money(furnitureРазом)} />
              <SummaryRow label="Оздоблення" value={money(floorРазом + wallРазом)} />
              <SummaryRow label="Освітлення" value="0 ₴" />
              <SummaryRow label="Декор" value="0 ₴" />
              <button className="details-link" onClick={() => openTab("summary")}>Детальний кошторис →</button>
            </div>
          </div>

          <div className="products-panel">
            <div className="products-head">
              <b>Список товарів ({items.length})</b>
              <button onClick={() => openTab("furniture")}>Редагувати</button>
            </div>

            <div className="order-list">
              {items.length === 0 ? (
                <div className="empty-order">
                  <b>Додайте товари</b>
                  <span>Оберіть меблі, підлогу, світло або декор у каталозі зліва.</span>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.instanceId} className="order-item">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="order-img-fallback">3D</div>}
                    <div>
                      <b>{item.name}</b>
                      <span>{item.category}</span>
                      <strong>{money(item.price)}</strong>
                      <div className="qty-row"><button>−</button><em>1</em><button>+</button></div>
                    </div>
                    <button className="trash" onClick={() => { setItems(prev => prev.filter(i => i.instanceId !== item.instanceId)); cart.removeItem(item.instanceId); if (selectedId === item.instanceId) setSelectedId(""); }}>🗑</button>
                  </div>
                ))
              )}
            </div>

            <Link href="/cart" className="checkout-pro">Оформити замовлення</Link>
          </div>
        </aside>
      </main>

      <nav className="mobile-pro-nav">
        <button className={tab === "furniture" ? "active" : ""} onClick={() => openTab("furniture")}>🛋<span>Каталог</span></button>
        <button className={tab === "materials" ? "active" : ""} onClick={() => openTab("materials")}>▱<span>Матеріали</span></button>
        <button className="plus" onClick={() => openTab("furniture")}>+</button>
        <button className={tab === "summary" ? "active" : ""} onClick={() => openTab("summary")}>＄<span>Кошторис</span></button>
        <button className={tab === "ai" ? "active" : ""} onClick={() => openTab("ai")}>✦<span>AI</span></button>
      </nav>

      <style>{styles}</style>
    </div>
  );
}

function RailButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`rail-btn ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span><small>{label}</small></button>;
}

function SideSection({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <section className="side-section">
      <div className="side-section-head"><b>{title}</b><span>{action}</span></div>
      {children}
    </section>
  );
}

function ProductCard({ item, onAdd }: { item: КаталогItem; onAdd: () => void }) {
  return (
    <article className="pro-product-card">
      <div className="product-img-wrap">
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="product-placeholder">3D</div>}
        <span className="badge-3d">3D</span>
        <button className="heart">♡</button>
      </div>
      <div className="pro-product-name">{item.name}</div>
      <div className="pro-product-price">{money(item.price)}</div>
      <button className="add-product-btn" onClick={onAdd}>+ Додати</button>
    </article>
  );
}

function MaterialSection({ title, options, currentId, onSelect }: { title: string; options: Array<{ id: string; name: string; color: string; price: number }>; currentId: string; onSelect: (id: string) => void }) {
  return (
    <div className="material-section">
      <div className="section-line"><b>{title}</b><span>Показати всі ›</span></div>
      <div className="material-strip">
        {options.map(option => (
          <button key={option.id} className={`material-chip ${currentId === option.id ? "active" : ""}`} onClick={() => onSelect(option.id)}>
            <span style={{ background: option.color }} />
            <small>{option.name}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function RoomSettings({ dimensions, onChange }: { dimensions: RoomDimensions; onChange: (key: keyof RoomDimensions, value: number) => void }) {
  return (
    <div className="room-settings-panel">
      <div className="section-line"><b>Параметри кімнати</b><span>{(dimensions.length * dimensions.width).toFixed(1)} м²</span></div>
      <RoomDimensionInputs dimensions={dimensions} onChange={onChange} />
    </div>
  );
}

function RoomDimensionInputs({ dimensions, onChange }: { dimensions: RoomDimensions; onChange: (key: keyof RoomDimensions, value: number) => void }) {
  return (
    <div className="room-dimension-grid">
      <label>
        <span>Довжина</span>
        <input type="number" min="2.4" max="12" step="0.1" value={dimensions.length} onChange={e => onChange("length", Number(e.target.value))} />
      </label>
      <label>
        <span>Ширина</span>
        <input type="number" min="2.2" max="10" step="0.1" value={dimensions.width} onChange={e => onChange("width", Number(e.target.value))} />
      </label>
      <label>
        <span>Висота</span>
        <input type="number" min="2.2" max="4.2" step="0.1" value={dimensions.height} onChange={e => onChange("height", Number(e.target.value))} />
      </label>
    </div>
  );
}

function InspectorBlock({ title, children }: { title: string; children: ReactNode }) {
  return <div className="inspector-card"><h4>{title}</h4>{children}</div>;
}

function FieldBox({ label, value }: { label: string; value: string }) {
  return <div className="field-box"><span>{label}</span><b>{value}</b></div>;
}

function ToggleRow({ label }: { label: string }) {
  return <div className="toggle-row"><span>{label}</span><b /></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="summary-row"><span>{label}</span><b>{value}</b></div>;
}

const styles = `
  :root { color-scheme: light; }
  .fh-pro-app { position: fixed; inset: 0; background: #F6F3EE; color: #1F2A24; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow: hidden; }
  .fh-pro-topbar { height: 78px; padding: 0 24px; display: grid; grid-template-columns: 220px minmax(220px, 1fr) auto auto; align-items: center; gap: 22px; background: rgba(255,255,255,.92); border-bottom: 1px solid #E8E2D9; box-shadow: 0 14px 42px rgba(35,55,42,.06); backdrop-filter: blur(18px); }
  .fh-pro-brand { text-decoration: none; color: inherit; display: flex; align-items: center; gap: 10px; }
  .fh-pro-logo { width: 34px; height: 34px; border-radius: 12px; background: #EAF5EC; color: #2E8B4E; display: grid; place-items: center; font-size: 21px; font-weight: 950; }
  .fh-pro-brand-name { font-weight: 950; letter-spacing: -.7px; font-size: 25px; }
  .fh-pro-search { height: 46px; max-width: 520px; display:flex; align-items:center; gap: 10px; padding: 0 16px; background: #F4F3F1; border: 1px solid #EFE9E2; border-radius: 16px; color: #7B887B; }
  .fh-pro-search input { width:100%; border:0; outline:0; background:transparent; font-size:14px; color:#223026; font-weight:750; }
  .fh-pro-mainnav { display:flex; align-items:center; gap: 18px; white-space:nowrap; }
  .fh-pro-mainnav button { border:0; background:transparent; color:#1F2A24; font-size:14px; font-weight:850; cursor:pointer; display:flex; align-items:center; gap:7px; }
  .fh-pro-mainnav b { min-width:22px; height:22px; border-radius:999px; background:#2E9D51; color:#fff; display:inline-grid; place-items:center; font-size:12px; }
  .fh-pro-top-actions { display:flex; align-items:center; justify-content:flex-end; gap: 10px; }
  .icon-btn,.cart-btn,.profile-btn { height: 44px; border-radius: 15px; border: 1px solid #ECE7DF; background: #fff; color: #1F2A24; padding: 0 14px; font-weight: 900; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(50,60,50,.04); }
  .icon-btn { width:44px; padding:0; font-size:20px; }
  .cart-btn { gap:6px; }
  .cart-btn span { min-width:18px; height:18px; border-radius:50%; display:grid; place-items:center; background:#2E9D51; color:#fff; font-size:11px; }
  .profile-btn { flex-direction:column; align-items:flex-start; line-height:1.05; padding: 0 16px; }
  .profile-btn small { color:#7A8278; font-size:11px; }

  .fh-pro-workspace { height: calc(100vh - 78px); display: grid; grid-template-columns: 314px minmax(0,1fr) 348px; gap: 14px; padding: 14px; overflow: hidden; }
  .fh-pro-rail { min-width:0; background: rgba(255,255,255,.92); border: 1px solid #E8E2D9; border-radius: 24px; padding: 14px; overflow:auto; box-shadow: 0 20px 55px rgba(35,55,42,.07); }
  .left-tabs { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
  .left-tabs button { height: 46px; border:0; border-radius: 14px; background:#F7F4EF; color:#1F2A24; font-size:14px; font-weight:900; cursor:pointer; }
  .left-tabs button.active { background:#EAF7EE; color:#2E8B4E; }
  .side-section { margin-bottom: 18px; }
  .side-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .side-section-head b { font-size:14px; }
  .side-section-head span { font-size:12px; color:#627162; font-weight:800; }
  .tile-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .material-tile { border:0; background:transparent; padding:0; cursor:pointer; color:#233027; text-align:left; }
  .material-tile span { display:block; height:72px; border-radius:12px; border:1px solid #E8E2D9; box-shadow: inset 0 0 0 1px rgba(255,255,255,.45); margin-bottom:6px; }
  .material-tile small { display:block; font-size:11px; font-weight:850; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mini-category-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .mini-category-grid button { min-height: 66px; border:1px solid #E8E2D9; background:#F7F5F1; border-radius:13px; font-size:12px; font-weight:900; color:#223026; cursor:pointer; }
  .ai-side-card { margin-top: 18px; min-height: 154px; border-radius: 20px; padding:18px; background: linear-gradient(135deg,#E8F7EC,#F4FBF5); border:1px solid #DCEFE0; cursor:pointer; position:relative; overflow:hidden; }
  .ai-side-card b { color:#1C7D3E; font-size:17px; }
  .ai-side-card p { color:#52645A; font-size:13px; line-height:1.5; margin:10px 0 0; max-width:180px; }
  .ai-side-card span { position:absolute; right:18px; bottom:12px; color:#33A95D; font-size:34px; }

  .fh-pro-stage { min-width:0; display: grid; grid-template-rows: minmax(430px, 1fr) 230px; gap: 14px; overflow:hidden; }
  .canvas-card { position: relative; overflow: hidden; border-radius: 24px; background: radial-gradient(circle at top,#fff,#F0E9DF); border: 1px solid #E8E2D9; box-shadow: 0 22px 70px rgba(35,55,42,.09); }
  .scene-top-tools { position:absolute; top:14px; left:14px; right:84px; z-index:5; display:flex; gap:8px; overflow:auto; padding-bottom:4px; }
  .scene-top-tools button { border:1px solid #E8E2D9; background:rgba(255,255,255,.92); color:#1F2A24; border-radius: 13px; padding: 10px 13px; font-size:13px; font-weight:900; backdrop-filter: blur(14px); white-space:nowrap; box-shadow:0 8px 18px rgba(40,50,40,.06); }
  .mode-switch { position:absolute; top:14px; right:14px; display:flex; gap:5px; z-index:7; background:#fff; border:1px solid #E8E2D9; padding:5px; border-radius:15px; }
  .mode-switch button { border:0; background:transparent; color:#809083; height:34px; min-width:42px; border-radius:11px; font-weight:950; }
  .mode-switch button.active { background:#E8F6EC; color:#2E9D51; }
  .mini-map { position:absolute; right:18px; top:82px; width:180px; height:136px; border-radius:18px; background:rgba(255,255,255,.78); border:1px solid #E8E2D9; backdrop-filter: blur(16px); z-index:6; display:grid; place-items:center; box-shadow:0 16px 40px rgba(36,50,42,.12); }
  .mini-room { width:130px; height:88px; border:6px solid #435047; background:#EFE6D8; position:relative; border-radius:4px; }
  .mini-room span:nth-child(1) { position:absolute; left:20px; top:16px; width:30px; height:22px; border-radius:8px; background:#CADBC6; }
  .mini-room span:nth-child(2) { position:absolute; right:20px; bottom:16px; width:34px; height:24px; border-radius:8px; background:#CADBC6; }
  .mini-room b { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:#2E9D51; color:#fff; font-size:12px; }
  .walk-btn { position:absolute; left:18px; top:76px; z-index:5; border:1px solid #E8E2D9; background:rgba(255,255,255,.9); color:#1F2A24; border-radius: 12px; padding: 10px 12px; font-size:12px; font-weight:900; }
  .object-float-tools { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); display:flex; gap:8px; padding:9px; border-radius:16px; background:rgba(255,255,255,.92); border:1px solid #D8E3DD; backdrop-filter:blur(14px); z-index:6; box-shadow:0 18px 38px rgba(34,80,120,.20); }
  .object-float-tools button { width:36px; height:36px; border:0; border-radius:12px; background:#F2F6F2; color:#183227; font-weight:900; cursor:pointer; }
  .view-tools { position:absolute; bottom:18px; left:50%; transform:translateX(-50%); background:rgba(255,255,255,.94); border:1px solid #E8E2D9; backdrop-filter:blur(14px); border-radius:18px; padding:7px; display:flex; gap:6px; z-index:5; box-shadow:0 14px 35px rgba(36,50,42,.13); }
  .view-tools button { width:40px; height:38px; border:0; border-radius:12px; background:transparent; color:#1E2A24; font-size:17px; }
  .nav-cube { display:none; }

  .fh-pro-bottom-panel { min-height:0; overflow:auto; background:rgba(255,255,255,.94); border:1px solid #E8E2D9; border-radius: 24px; padding: 14px 16px; box-shadow: 0 16px 50px rgba(35,55,42,.06); }
  .bottom-tabs { display:flex; gap:24px; align-items:center; padding:0 0 12px; border-bottom:1px solid #EAE4DC; }
  .bottom-tabs button { border:0; background:transparent; color:#7A8278; font-size:14px; font-weight:900; padding: 0; cursor:pointer; }
  .bottom-tabs button.active { color:#2E9D51; }
  .mobile-panel-close { display:none; }
  .catalog-filter-bar { display:grid; grid-template-columns:1fr 160px; gap:10px; margin:12px 0 10px; }
  .search-wrap { height:42px; border:1px solid #E8E2D9; background:#F9F8F5; border-radius:14px; display:flex; align-items:center; gap:10px; padding:0 13px; color:#7A8278; }
  .search-wrap input,.catalog-filter-bar select { width:100%; border:0; outline:0; background:transparent; color:#1F2A24; font-weight:800; font-size:13px; }
  .catalog-filter-bar select { border:1px solid #E8E2D9; background:#F9F8F5; border-radius:14px; padding:0 12px; }
  .chips-row { display:flex; gap:8px; overflow:auto; padding-bottom:8px; }
  .chips-row button { border:1px solid #E8E2D9; background:#fff; color:#4F5E53; padding:8px 14px; border-radius:999px; white-space:nowrap; font-weight:850; cursor:pointer; }
  .chips-row button.active { background:#E8F6EC; border-color:#D7EEDC; color:#2E8B4E; }
  .section-line { display:flex; align-items:center; justify-content:space-between; margin:12px 0; }
  .section-line b { font-size:16px; }
  .section-line span { color:#2E9D51; font-size:13px; font-weight:850; }
  .product-strip { display:flex; gap:12px; overflow:auto; padding-bottom:8px; }
  .pro-product-card { background:#fff; border:1px solid #E8E2D9; border-radius:16px; padding:9px; min-width:148px; box-shadow:0 8px 20px rgba(35,55,42,.05); }
  .product-img-wrap { height:112px; border-radius:13px; overflow:hidden; position:relative; background:#F1EEE8; }
  .product-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; }
  .badge-3d { position:absolute; left:8px; top:8px; background:#E8F6EC; color:#2E8B4E; font-size:11px; font-weight:950; padding:4px 7px; border-radius:8px; }
  .heart { position:absolute; right:8px; top:8px; width:28px; height:28px; border:0; border-radius:9px; background:rgba(255,255,255,.84); color:#64756A; font-size:18px; }
  .pro-product-name { color:#1F2A24; font-size:13px; font-weight:900; margin-top:9px; min-height:34px; }
  .pro-product-price { color:#1F2A24; font-weight:950; margin:5px 0 8px; }
  .add-product-btn { width:100%; border:0; border-radius:11px; height:34px; background:#2E9D51; color:white; font-weight:950; cursor:pointer; }
  .product-placeholder { width:100%; height:100%; display:grid; place-items:center; color:#1F2A24; font-weight:950; }

  .materials-layout { display:grid; grid-template-columns:1fr 1fr; gap:14px; padding-top:12px; }
  .room-settings-panel,.summary-large,.ai-panel { background:#fff; border:1px solid #E8E2D9; border-radius:18px; padding:14px; }
  .room-settings-panel { grid-column:1 / -1; }
  .room-dimension-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .room-dimension-grid label { display:flex; flex-direction:column; gap:7px; color:#627162; font-size:12px; font-weight:900; }
  .room-dimension-grid input { width:100%; box-sizing:border-box; border:1px solid #E8E2D9; background:#F9F8F5; color:#1F2A24; border-radius:12px; padding:11px 10px; outline:0; font-size:15px; font-weight:950; }
  .material-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .material-chip { border:1px solid #E8E2D9; background:#fff; color:#1F2A24; border-radius:12px; padding:8px; cursor:pointer; }
  .material-chip span { display:block; height:54px; border-radius:10px; border:1px solid rgba(0,0,0,.08); margin-bottom:7px; }
  .material-chip small { font-weight:800; font-size:12px; }
  .material-chip.active { border-color:#2E9D51; box-shadow:0 0 0 3px rgba(46,157,81,.14); }
  .ai-panel p { color:#627162; line-height:1.55; }
  .ai-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:16px 0; }
  .ai-grid button,.ai-main { border:1px solid #D7EEDC; color:#1F2A24; background:#F2FBF4; border-radius:13px; padding:12px; font-weight:900; }
  .ai-main { width:100%; background:#2E9D51; color:#fff; }

  .fh-pro-inspector { min-width:0; display:flex; flex-direction:column; gap:14px; overflow:auto; }
  .project-panel,.products-panel { background:rgba(255,255,255,.94); border:1px solid #E8E2D9; border-radius:24px; padding:16px; box-shadow:0 20px 55px rgba(35,55,42,.07); }
  .project-head,.products-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px; }
  .project-head b,.products-head b { font-size:18px; }
  .project-head small { display:block; color:#667368; font-size:12px; margin-top:4px; }
  .save-green,.products-head button,.details-link { border:0; background:#EAF7EE; color:#2E8B4E; border-radius:12px; height:36px; padding:0 12px; font-weight:900; cursor:pointer; }
  .estimate-card { border-radius:18px; background:#fff; }
  .estimate-total { display:flex; justify-content:space-between; align-items:center; margin: 0 0 12px; }
  .estimate-total span { color:#1F2A24; font-weight:900; }
  .estimate-total b { font-size:22px; }
  .summary-row { display:flex; justify-content:space-between; gap:10px; padding:9px 0; color:#56645A; font-size:14px; }
  .summary-row b { color:#1F2A24; }
  .details-link { margin-top:8px; background:transparent; padding:0; height:auto; }
  .order-list { display:flex; flex-direction:column; gap:12px; max-height: calc(100vh - 420px); overflow:auto; padding-right:2px; }
  .empty-order { border:1px dashed #D9D0C5; border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:6px; color:#667368; }
  .empty-order b { color:#1F2A24; }
  .order-item { display:grid; grid-template-columns:78px 1fr 26px; gap:12px; align-items:center; }
  .order-item img,.order-img-fallback { width:78px; height:78px; border-radius:14px; object-fit:cover; background:#F1EEE8; display:grid; place-items:center; color:#2E8B4E; font-weight:950; }
  .order-item b { display:block; font-size:13px; line-height:1.2; }
  .order-item span { display:block; color:#6B786D; font-size:12px; margin-top:3px; }
  .order-item strong { display:block; font-size:13px; margin-top:4px; }
  .qty-row { display:inline-flex; align-items:center; gap:6px; margin-top:6px; background:#F7F5F1; border-radius:999px; padding:2px; }
  .qty-row button { border:0; background:#fff; width:22px; height:22px; border-radius:50%; color:#2E8B4E; font-weight:950; }
  .qty-row em { font-style:normal; font-size:12px; font-weight:900; min-width:14px; text-align:center; }
  .trash { border:0; background:transparent; cursor:pointer; opacity:.6; }
  .checkout-pro,.summary-checkout { width:100%; height:52px; border:0; border-radius:15px; background:#2E9D51; color:#fff; font-weight:950; cursor:pointer; margin-top:14px; text-decoration:none; display:flex; align-items:center; justify-content:center; box-shadow:0 16px 30px rgba(46,157,81,.22); }

  .inspector-card,.rail-btn,.cost-card,.selected-card,.field-box,.rotation-control,.toggle-row,.delete-btn,.cost-head,.summary-total { }
  .mobile-pro-nav { display:none; }

  @media (max-width: 1180px) {
    .fh-pro-topbar { grid-template-columns: 200px 1fr auto; }
    .fh-pro-mainnav { display:none; }
    .fh-pro-workspace { grid-template-columns: 290px minmax(0,1fr); }
    .fh-pro-inspector { display:none; }
  }

  @media (max-width: 820px) {
    .fh-pro-topbar { height:64px; padding:0 12px; grid-template-columns: 1fr auto; gap:10px; }
    .fh-pro-search,.fh-pro-mainnav,.profile-btn,.fh-pro-top-actions .icon-btn { display:none; }
    .fh-pro-brand-name { font-size:22px; }
    .fh-pro-workspace { height:calc(100vh - 64px - 76px); display:block; padding:8px; overflow:hidden; }
    .fh-pro-rail { display:none; }
    .fh-pro-stage { height:100%; display:block; }
    .canvas-card { height:calc(100vh - 64px - 76px); border-radius:22px; }
    .scene-top-tools { left:10px; right:66px; top:10px; }
    .scene-top-tools button { padding:9px 10px; font-size:12px; }
    .mode-switch { top:10px; right:10px; }
    .mini-map,.walk-btn { display:none; }
    .fh-pro-bottom-panel { position:fixed; left:10px; right:10px; bottom:76px; max-height:38vh; min-height:180px; overflow:auto; margin:0; border-radius:24px; padding:14px; z-index:45; box-shadow:0 -18px 70px rgba(40,50,42,.25); transform:translateY(calc(100% + 110px)); opacity:0; pointer-events:none; transition:transform .22s ease, opacity .22s ease; }
    .fh-pro-bottom-panel.open { transform:translateY(0); opacity:1; pointer-events:auto; }
    .bottom-tabs { overflow:auto; gap:20px; padding-right:42px; }
    .mobile-panel-close { display:grid !important; place-items:center; position:absolute; right:10px; top:10px; width:34px; height:34px; border-radius:12px; background:#F0F4EF !important; color:#1F2A24 !important; font-size:22px !important; padding:0 !important; }
    .catalog-filter-bar { grid-template-columns:1fr; }
    .materials-layout,.room-dimension-grid { grid-template-columns:1fr; }
    .material-strip { display:flex; overflow-x:auto; }
    .material-chip { min-width:105px; }
    .view-tools { bottom:14px; }
    .mobile-pro-nav { position:fixed; left:0; right:0; bottom:0; height:76px; background:rgba(255,255,255,.96); border-top:1px solid #E8E2D9; display:grid; grid-template-columns:1fr 1fr 76px 1fr 1fr; align-items:center; padding:6px 10px max(6px, env(safe-area-inset-bottom)); z-index:50; box-shadow:0 -10px 35px rgba(30,40,30,.08); }
    .mobile-pro-nav button { border:0; background:transparent; color:#6B786D; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:22px; font-weight:900; }
    .mobile-pro-nav button span { font-size:11px; }
    .mobile-pro-nav button.active { color:#2E9D51; }
    .mobile-pro-nav .plus { width:62px; height:62px; border-radius:50%; justify-self:center; background:#2E9D51; color:#fff; font-size:38px; box-shadow:0 0 0 6px rgba(46,157,81,.14); }
  }

  @media (max-width: 430px) {
    .fh-pro-brand-name { font-size:20px; }
    .cart-btn { min-width:58px; font-size:13px; }
    .canvas-card { min-height:330px; }
    .pro-product-card { min-width:150px; }
  }

  /* RESPONSIVE PRO ADAPTATION: PC / TABLET / PHONE */
  @media (min-width: 1440px) {
    .fh-pro-topbar { grid-template-columns: 230px minmax(360px, 1fr) auto auto; padding: 0 30px; }
    .fh-pro-workspace { grid-template-columns: 330px minmax(0, 1fr) 370px; gap: 16px; padding: 16px; }
    .fh-pro-stage { grid-template-rows: minmax(520px, 1fr) 250px; }
    .canvas-card { border-radius: 28px; }
    .mini-map { width: 200px; height: 150px; }
  }

  @media (min-width: 1181px) and (max-width: 1360px) {
    .fh-pro-topbar { grid-template-columns: 205px minmax(240px, 1fr) auto; gap: 14px; padding: 0 18px; }
    .fh-pro-mainnav { gap: 12px; }
    .fh-pro-mainnav button { font-size: 13px; }
    .profile-btn { display: none; }
    .fh-pro-workspace { grid-template-columns: 286px minmax(0, 1fr) 320px; gap: 12px; padding: 12px; }
    .tile-grid,.mini-category-grid { grid-template-columns: repeat(3, 1fr); }
    .material-tile span { height: 64px; }
    .mini-map { width: 156px; height: 116px; }
    .order-item { grid-template-columns: 64px 1fr 24px; }
    .order-item img,.order-img-fallback { width:64px; height:64px; }
  }

  @media (min-width: 821px) and (max-width: 1180px) {
    .fh-pro-topbar { height: 72px; grid-template-columns: 190px 1fr auto; padding: 0 16px; }
    .fh-pro-search { max-width: none; }
    .fh-pro-top-actions { gap: 8px; }
    .profile-btn { display:none; }
    .fh-pro-workspace { height: calc(100vh - 72px); grid-template-columns: 280px minmax(0,1fr); padding: 12px; gap: 12px; }
    .fh-pro-stage { grid-template-rows: minmax(440px, 1fr) 240px; }
    .tile-grid,.mini-category-grid { grid-template-columns: repeat(3, 1fr); }
    .material-tile span { height: 62px; }
    .scene-top-tools { right: 80px; }
    .mini-map { width: 150px; height: 112px; top: 70px; right: 14px; }
    .mini-room { width: 108px; height: 74px; border-width: 5px; }
    .fh-pro-inspector { display: none; }
  }

  @media (min-width: 641px) and (max-width: 820px) {
    .fh-pro-topbar { height: 66px; padding: 0 14px; grid-template-columns: 190px 1fr auto; }
    .fh-pro-search { display:flex; height: 42px; }
    .fh-pro-mainnav,.profile-btn,.fh-pro-top-actions .icon-btn { display:none; }
    .fh-pro-workspace { height: calc(100vh - 66px - 78px); display:block; padding: 12px; }
    .canvas-card { height: calc(100vh - 66px - 104px); min-height: 430px; border-radius: 24px; }
    .scene-top-tools { left: 12px; right: 74px; top: 12px; }
    .mode-switch { top: 12px; right: 12px; }
    .mini-map { display: grid; width: 150px; height: 112px; top: 68px; right: 12px; }
    .fh-pro-bottom-panel { left: 16px; right: 16px; bottom: 88px; max-height: 46vh; min-height: 300px; }
    .pro-product-card { min-width: 170px; }
    .product-img-wrap { height: 120px; }
    .material-strip { display:flex; overflow-x:auto; }
    .material-chip { min-width: 120px; }
  }

  @media (max-width: 640px) {
    .fh-pro-topbar { height: 62px; padding: 0 10px; grid-template-columns: 1fr auto; }
    .fh-pro-logo { width: 32px; height: 32px; border-radius: 11px; font-size: 19px; }
    .fh-pro-brand-name { font-size: 19px; letter-spacing: -.5px; }
    .fh-pro-search,.fh-pro-mainnav,.profile-btn,.fh-pro-top-actions .icon-btn { display:none !important; }
    .cart-btn { height: 40px; min-width: 52px; padding: 0 10px; font-size: 0; }
    .cart-btn::before { content: '🛒'; font-size: 18px; }
    .cart-btn span { font-size: 10px; }
    .fh-pro-workspace { height: calc(100vh - 62px - 76px); padding: 8px; display: block; overflow: hidden; }
    .fh-pro-stage { height: 100%; display:block; }
    .canvas-card { height: calc(100vh - 62px - 92px); min-height: 340px; border-radius: 20px; }
    .scene-top-tools { top: 8px; left: 8px; right: 64px; gap: 6px; }
    .scene-top-tools button { padding: 8px 9px; font-size: 11px; border-radius: 11px; }
    .mode-switch { top: 8px; right: 8px; padding: 4px; border-radius: 13px; }
    .mode-switch button { height: 30px; min-width: 36px; font-size: 12px; }
    .mini-map,.walk-btn { display:none !important; }
    .view-tools { bottom: 10px; max-width: calc(100vw - 36px); overflow-x:auto; }
    .view-tools button { width: 36px; height: 34px; font-size: 15px; }
    .object-float-tools { top: 54%; gap: 6px; padding: 7px; }
    .object-float-tools button { width: 34px; height: 34px; }
    .fh-pro-bottom-panel { left: 8px; right: 8px; bottom: 84px; max-height: 40vh; min-height: 190px; border-radius: 22px; padding: 12px; }
    .bottom-tabs { gap: 18px; overflow-x:auto; padding-right: 44px; }
    .bottom-tabs button { font-size: 13px; white-space: nowrap; }
    .catalog-filter-bar { grid-template-columns: 1fr; }
    .chips-row { overflow-x:auto; }
    .pro-product-card { min-width: 152px; }
    .product-img-wrap { height: 108px; }
    .materials-layout,.room-dimension-grid { grid-template-columns:1fr; }
    .material-strip { display:flex; overflow-x:auto; }
    .material-chip { min-width: 106px; }
    .ai-grid { grid-template-columns: 1fr 1fr; }
    .mobile-pro-nav { height: 76px; grid-template-columns:1fr 1fr 72px 1fr 1fr; }
    .mobile-pro-nav .plus { width: 58px; height: 58px; font-size: 34px; }
  }

  @media (max-width: 380px) {
    .fh-pro-brand-name { font-size: 17px; }
    .canvas-card { min-height: 315px; }
    .fh-pro-bottom-panel { min-height: 180px; max-height: 42vh; }
    .pro-product-card { min-width: 140px; }
    .product-img-wrap { height: 96px; }
    .scene-top-tools button { padding: 7px 8px; }
    .mobile-pro-nav button span { font-size: 10px; }
  }

`;

function Scene({
  items,
  selectedId,
  onSelect,
  onMove,
  floor,
  wallColor,
  roomDimensions,
}: {
  items: PlacedItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onMove: (id: string, position: [number, number, number]) => void;
  floor: typeof FLOOR_OPTIONS[number];
  wallColor: string;
  roomDimensions: RoomDimensions;
}) {
  return (
    <>
      <color attach="background" args={["#f3f1ec"]} />
      <fog attach="fog" args={["#f3f1ec", 8, 20]} />

      {/* PRO LIGHTING: тепле світло, тіні, акценти як у професійному planner */}
      <ambientLight intensity={0.46} color="#fff5ea" />
      <hemisphereLight intensity={0.45} color="#fff6e8" groundColor="#9b8064" />

      <directionalLight
        position={[4.5, 7.5, 4.2]}
        intensity={2.2}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00015}
      />

      <spotLight
        position={[-2.8, 4.2, 2.8]}
        angle={0.42}
        penumbra={0.75}
        intensity={1.25}
        color="#ffe2bf"
        castShadow
      />

      <pointLight position={[1.9, 2.2, -2.3]} intensity={0.75} color="#fff5e9" />
      <Environment preset="apartment" />

      <Room floor={floor} wallColor={wallColor} dimensions={roomDimensions} />

      {items.map(item => (
        <DraggableКаталог
          key={item.instanceId}
          item={item}
          selected={item.instanceId === selectedId}
          onSelect={onSelect}
          onMove={onMove}
          roomDimensions={roomDimensions}
        />
      ))}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.36} scale={8} blur={2.4} far={4} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={2.3}
        maxDistance={8.5}
        maxPolarAngle={Math.PI / 2 - 0.04}
        target={[0, 0.45, 0]}
      />
    </>
  );
}

function createFloorTexture(floor: typeof FLOOR_OPTIONS[number]) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const color2 = floor.color2 || floor.color;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, floor.color);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  if (floor.pattern === "planks") drawFloorPlanks(ctx, size, floor.color, color2);
  if (floor.pattern === "herringbone") drawFloorHerringbone(ctx, size, floor.color, color2);
  if (floor.pattern === "tiles") drawFloorTiles(ctx, size);
  if (floor.pattern === "marble") drawFloorMarble(ctx, size, color2);
  if (floor.pattern === "concrete") drawFloorConcrete(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(floor.pattern === "tiles" || floor.pattern === "marble" ? 3.2 : 2.5, floor.pattern === "tiles" || floor.pattern === "marble" ? 3.2 : 2.5);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function drawFloorPlanks(ctx: CanvasRenderingContext2D, size: number, colorA: string, colorB: string) {
  const plankH = 58;
  const plankW = 210;
  for (let y = 0; y < size; y += plankH) {
    const offset = Math.floor(y / plankH) % 2 === 0 ? 0 : -plankW / 2;
    for (let x = offset; x < size; x += plankW) {
      const g = ctx.createLinearGradient(x, y, x + plankW, y + plankH);
      g.addColorStop(0, colorA);
      g.addColorStop(1, colorB);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, plankW - 2, plankH - 2);
      ctx.strokeStyle = "rgba(55,30,10,.26)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, plankW - 2, plankH - 2);
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 18);
      ctx.bezierCurveTo(x + 70, y + 5, x + 120, y + 50, x + 190, y + 22);
      ctx.stroke();
    }
  }
}

function drawFloorHerringbone(ctx: CanvasRenderingContext2D, size: number, colorA: string, colorB: string) {
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI / 4);
  ctx.translate(-size / 2, -size / 2);
  const plankW = 44;
  const plankH = 180;
  for (let y = -size; y < size * 2; y += plankH) {
    for (let x = -size; x < size * 2; x += plankW) {
      ctx.fillStyle = ((x + y) / plankW) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x, y, plankW - 2, plankH - 2);
      ctx.strokeStyle = "rgba(60,35,15,.24)";
      ctx.strokeRect(x, y, plankW - 2, plankH - 2);
    }
  }
  ctx.restore();
}

function drawFloorTiles(ctx: CanvasRenderingContext2D, size: number) {
  const tile = 128;
  ctx.strokeStyle = "rgba(40,45,50,.28)";
  ctx.lineWidth = 4;
  for (let x = 0; x <= size; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(0, 0, size, size);
}

function drawFloorMarble(ctx: CanvasRenderingContext2D, size: number, veinColor: string) {
  ctx.strokeStyle = veinColor;
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 18; i++) {
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.beginPath();
    const startX = Math.random() * size;
    const startY = Math.random() * size;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + Math.random() * 150 - 75,
      startY + Math.random() * 120,
      startX + Math.random() * 220 - 110,
      startY + Math.random() * 240,
      startX + Math.random() * 260 - 130,
      size + 40
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawFloorConcrete(ctx: CanvasRenderingContext2D, size: number) {
  for (let i = 0; i < 1600; i++) {
    const alpha = Math.random() * 0.10;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }
}

function Room({ floor, wallColor, dimensions }: { floor: typeof FLOOR_OPTIONS[number]; wallColor: string; dimensions: RoomDimensions }) {
  const floorTexture = useMemo(() => createFloorTexture(floor), [floor]);
  const length = dimensions.length;
  const width = dimensions.width;
  const height = dimensions.height;
  const halfLength = length / 2;
  const halfWidth = width / 2;

  const wallMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.86, metalness: 0.01 }),
    [wallColor]
  );
  const trimMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.56, metalness: 0.02 }),
    []
  );
  const woodMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#b48a5f", roughness: 0.64, metalness: 0.02 }),
    []
  );
  const darkMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#233027", roughness: 0.6, metalness: 0.08 }),
    []
  );
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b9d8eb",
        roughness: 0.08,
        metalness: 0.02,
        transparent: true,
        opacity: 0.42,
      }),
    []
  );

  const windowW = Math.min(1.65, length * 0.3);
  const windowH = Math.min(1.15, height * 0.42);
  const windowX = Math.min(halfLength - windowW / 2 - 0.35, 0.85);
  const windowY = height * 0.62;
  const doorW = Math.min(0.92, width * 0.28);
  const doorH = Math.min(2.05, height - 0.24);

  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial map={floorTexture} roughness={0.5} metalness={0.025} />
      </mesh>

      {/* Subtle floor border/shadow under walls */}
      <Box args={[length, 0.025, 0.05]} pos={[0, 0.018, -halfWidth + 0.025]} mat={trimMaterial} />
      <Box args={[length, 0.025, 0.05]} pos={[0, 0.018, halfWidth - 0.025]} mat={trimMaterial} />
      <Box args={[width, 0.025, 0.05]} pos={[-halfLength + 0.025, 0.018, 0]} mat={trimMaterial} rot={[0, Math.PI / 2, 0]} />
      <Box args={[width, 0.025, 0.05]} pos={[halfLength - 0.025, 0.018, 0]} mat={trimMaterial} rot={[0, Math.PI / 2, 0]} />

      {/* Walls */}
      <mesh position={[0, height / 2, -halfWidth]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      <mesh position={[-halfLength, height / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      <mesh position={[halfLength, height / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, height, 0]} rotation-x={Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#fbfaf6" roughness={0.78} side={THREE.DoubleSide} />
      </mesh>

      {/* Baseboards */}
      <Box args={[length, 0.11, 0.075]} pos={[0, 0.07, -halfWidth + 0.035]} mat={trimMaterial} />
      <Box args={[length, 0.11, 0.075]} pos={[0, 0.07, halfWidth - 0.035]} mat={trimMaterial} />
      <Box args={[width, 0.11, 0.075]} pos={[-halfLength + 0.035, 0.07, 0]} mat={trimMaterial} rot={[0, Math.PI / 2, 0]} />
      <Box args={[width, 0.11, 0.075]} pos={[halfLength - 0.035, 0.07, 0]} mat={trimMaterial} rot={[0, Math.PI / 2, 0]} />

      {/* Crown molding */}
      <Box args={[length, 0.055, 0.055]} pos={[0, height - 0.055, -halfWidth + 0.025]} mat={trimMaterial} />
      <Box args={[width, 0.055, 0.055]} pos={[-halfLength + 0.025, height - 0.055, 0]} mat={trimMaterial} rot={[0, Math.PI / 2, 0]} />
      <Box args={[width, 0.055, 0.055]} pos={[halfLength - 0.025, height - 0.055, 0]} mat={trimMaterial} rot={[0, Math.PI / 2, 0]} />

      {/* Large window on back wall */}
      <group position={[windowX, windowY, -halfWidth - 0.018]}>
        <Box args={[windowW + 0.18, windowH + 0.18, 0.06]} pos={[0, 0, 0]} mat={trimMaterial} />
        <mesh position={[0, 0, -0.034]}>
          <planeGeometry args={[windowW, windowH]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
        <Box args={[0.045, windowH + 0.15, 0.07]} pos={[0, 0, -0.065]} mat={trimMaterial} />
        <Box args={[windowW + 0.13, 0.045, 0.07]} pos={[0, 0, -0.066]} mat={trimMaterial} />
        <Box args={[windowW + 0.34, 0.08, 0.18]} pos={[0, -windowH / 2 - 0.17, 0.06]} mat={trimMaterial} />
        <Box args={[0.08, windowH + 0.36, 0.08]} pos={[-windowW / 2 - 0.13, 0, -0.02]} mat={trimMaterial} />
        <Box args={[0.08, windowH + 0.36, 0.08]} pos={[windowW / 2 + 0.13, 0, -0.02]} mat={trimMaterial} />
      </group>

      {/* Sunlight patch under the window */}
      <mesh rotation-x={-Math.PI / 2} position={[windowX - 0.1, 0.018, -halfWidth + 0.86]} receiveShadow>
        <planeGeometry args={[Math.min(2.15, length * 0.35), 1.15]} />
        <meshBasicMaterial color="#fff3d8" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Door on right wall */}
      <group position={[halfLength + 0.018, doorH / 2, Math.max(-halfWidth + doorW / 2 + 0.2, -0.75)]} rotation-y={-Math.PI / 2}>
        <Box args={[doorW + 0.16, doorH + 0.16, 0.08]} pos={[0, 0, 0]} mat={trimMaterial} />
        <Box args={[doorW, doorH, 0.055]} pos={[0, -0.04, -0.035]} mat={woodMaterial} />
        <Box args={[doorW - 0.18, doorH * 0.36, 0.035]} pos={[0, doorH * 0.18, -0.07]} mat={new THREE.MeshStandardMaterial({ color: "#c69c72", roughness: 0.72 })} />
        <mesh position={[doorW * 0.32, 0.02, -0.095]} castShadow>
          <sphereGeometry args={[0.045, 20, 20]} />
          <meshStandardMaterial color="#d5b46c" roughness={0.32} metalness={0.7} />
        </mesh>
      </group>

      {/* Simple wall art for premium empty-room feel */}
      <group position={[-halfLength - 0.018, height * 0.58, -0.35]} rotation-y={Math.PI / 2}>
        <Box args={[0.78, 0.58, 0.055]} pos={[0, 0, 0]} mat={trimMaterial} />
        <mesh position={[0, 0, -0.035]}>
          <planeGeometry args={[0.64, 0.44]} />
          <meshStandardMaterial color="#d8c8b6" roughness={0.82} />
        </mesh>
        <mesh position={[0.08, 0.02, -0.055]}>
          <circleGeometry args={[0.14, 40]} />
          <meshStandardMaterial color="#8fa889" roughness={0.74} />
        </mesh>
      </group>

      {/* Track light and ceiling spots */}
      <Box args={[1.55, 0.035, 0.055]} pos={[0, height - 0.09, -0.25]} mat={darkMaterial} />
      {[-0.55, 0, 0.55].map((x) => (
        <group key={x} position={[x, height - 0.18, -0.25]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.13, 24]} />
            <primitive object={darkMaterial} attach="material" />
          </mesh>
          <pointLight position={[0, -0.05, 0]} intensity={0.34} color="#fff1d8" distance={3.2} />
        </group>
      ))}

      {/* A subtle rug plane: makes the empty room less cold, but products still remain primary */}
      <mesh rotation-x={-Math.PI / 2} position={[0.15, 0.021, 0.55]} receiveShadow>
        <planeGeometry args={[Math.min(2.8, length * 0.46), Math.min(1.65, width * 0.42)]} />
        <meshStandardMaterial color="#d7cbb8" roughness={0.94} transparent opacity={0.52} />
      </mesh>
    </group>
  );
}

function DraggableКаталог({
  item,
  selected,
  onSelect,
  onMove,
  roomDimensions,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, position: [number, number, number]) => void;
  roomDimensions: RoomDimensions;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const dragging = useRef(false);
  const { camera, raycaster, gl } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  function pointerToFloor(event: PointerEvent) {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const point = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(plane, point);
    if (!hit) return null;

    const xLimit = Math.max(0.8, roomDimensions.length / 2 - 0.45);
    const zLimit = Math.max(0.8, roomDimensions.width / 2 - 0.45);

    return [
      THREE.MathUtils.clamp(point.x, -xLimit, xLimit),
      0,
      THREE.MathUtils.clamp(point.z, -zLimit, zLimit),
    ] as [number, number, number];
  }

  function onPointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onSelect(item.instanceId);
    dragging.current = true;
    gl.domElement.setPointerCapture(e.nativeEvent.pointerId);
  }

  function onPointerMove(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return;
    e.stopPropagation();
    const pos = pointerToFloor(e.nativeEvent);
    if (pos) onMove(item.instanceId, pos);
  }

  function onPointerUp(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    dragging.current = false;
    try {
      gl.domElement.releasePointerCapture(e.nativeEvent.pointerId);
    } catch {}
  }

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation-y={item.rotation || 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {item.model3dUrl ? <Suspense fallback={<КаталогModel type={item.type} selected={selected} />}><GLBModel url={item.model3dUrl} selected={selected} /></Suspense> : <КаталогModel type={item.type} selected={selected} />}

      {selected && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
          <ringGeometry args={[0.62, 0.72, 64]} />
          <meshBasicMaterial color="#b78b66" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}


function GLBModel({ url, selected }: { url: string; selected: boolean }) {
  const gltf = useGLTF(url);

  return (
    <group scale={1}>
      <primitive object={gltf.scene.clone()} />
      {selected && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
          <ringGeometry args={[0.72, 0.84, 64]} />
          <meshBasicMaterial color="#b78b66" transparent opacity={0.95} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function КаталогModel({ type, selected }: { type: string; selected: boolean }) {
  const fabric = new THREE.MeshStandardMaterial({ color: selected ? "#6b5f53" : "#9a8f83", roughness: 0.88, metalness: 0.02 });
  const wood = new THREE.MeshStandardMaterial({ color: "#a77b52", roughness: 0.62, metalness: 0.03 });
  const dark = new THREE.MeshStandardMaterial({ color: "#2f2a25", roughness: 0.52, metalness: 0.08 });
  const metal = new THREE.MeshStandardMaterial({ color: "#2f343d", metalness: 0.55, roughness: 0.28 });

  if (type === "sofa") {
    return (
      <group>
        <Box args={[1.85, 0.26, 0.82]} pos={[0, 0.28, 0]} mat={fabric} />
        <Box args={[1.85, 0.52, 0.18]} pos={[0, 0.62, -0.36]} mat={fabric} />
        <Box args={[0.18, 0.44, 0.86]} pos={[-1.02, 0.42, 0]} mat={fabric} />
        <Box args={[0.18, 0.44, 0.86]} pos={[1.02, 0.42, 0]} mat={fabric} />
        <Box args={[0.52, 0.18, 0.18]} pos={[-0.42, 0.56, 0.12]} mat={fabric} />
        <Box args={[0.52, 0.18, 0.18]} pos={[0.42, 0.56, 0.12]} mat={fabric} />
        <Leg x={-0.75} z={-0.32} mat={wood} />
        <Leg x={0.75} z={-0.32} mat={wood} />
        <Leg x={-0.75} z={0.32} mat={wood} />
        <Leg x={0.75} z={0.32} mat={wood} />
      </group>
    );
  }

  if (type === "armchair") {
    return (
      <group>
        <Box args={[0.86, 0.24, 0.76]} pos={[0, 0.28, 0]} mat={fabric} />
        <Box args={[0.86, 0.52, 0.16]} pos={[0, 0.62, -0.32]} mat={fabric} />
        <Box args={[0.14, 0.38, 0.78]} pos={[-0.5, 0.42, 0]} mat={fabric} />
        <Box args={[0.14, 0.38, 0.78]} pos={[0.5, 0.42, 0]} mat={fabric} />
        <Leg x={-0.34} z={-0.28} mat={wood} />
        <Leg x={0.34} z={-0.28} mat={wood} />
        <Leg x={-0.34} z={0.28} mat={wood} />
        <Leg x={0.34} z={0.28} mat={wood} />
      </group>
    );
  }

  if (type === "coffee" || type === "dining") {
    const sx = type === "dining" ? 1.85 : 1.22;
    const sz = type === "dining" ? 0.86 : 0.68;
    const y = type === "dining" ? 0.72 : 0.42;
    return (
      <group>
        <Box args={[sx, 0.08, sz]} pos={[0, y, 0]} mat={wood} />
        <Leg x={-sx / 2 + 0.16} z={-sz / 2 + 0.14} mat={dark} h={y} />
        <Leg x={sx / 2 - 0.16} z={-sz / 2 + 0.14} mat={dark} h={y} />
        <Leg x={-sx / 2 + 0.16} z={sz / 2 - 0.14} mat={dark} h={y} />
        <Leg x={sx / 2 - 0.16} z={sz / 2 - 0.14} mat={dark} h={y} />
      </group>
    );
  }

  if (type === "bookshelf" || type === "cabinet") {
    const h = type === "bookshelf" ? 1.45 : 0.82;
    const w = type === "bookshelf" ? 0.92 : 1.38;
    return (
      <group>
        <Box args={[w, h, 0.34]} pos={[0, h / 2, 0]} mat={wood} />
        <Box args={[w - 0.12, h - 0.16, 0.38]} pos={[0, h / 2, 0.03]} mat={new THREE.MeshStandardMaterial({ color: "#d8c4a7", roughness: 0.6 })} />
        {type === "bookshelf" && (
          <>
            <Box args={[w - 0.08, 0.035, 0.4]} pos={[0, 0.52, 0.08]} mat={wood} />
            <Box args={[w - 0.08, 0.035, 0.4]} pos={[0, 0.96, 0.08]} mat={wood} />
          </>
        )}
      </group>
    );
  }

  if (type === "floorlamp") {
    return (
      <group>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow material={metal}>
          <cylinderGeometry args={[0.24, 0.24, 0.08, 32]} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow material={metal}>
          <cylinderGeometry args={[0.025, 0.025, 1.35, 16]} />
        </mesh>
        <mesh position={[0.2, 1.43, 0]} castShadow material={new THREE.MeshStandardMaterial({ color: "#f8f1dc", roughness: 0.75 })}>
          <coneGeometry args={[0.26, 0.34, 32]} />
        </mesh>
      </group>
    );
  }

  if (type === "plant") {
    return (
      <group>
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.36, 28]} />
          <meshStandardMaterial color="#d8c0a6" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.65, 12]} />
          <meshStandardMaterial color="#4b2e1d" roughness={0.75} />
        </mesh>
        {[-0.45, -0.2, 0.1, 0.35, 0.62].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.18, 0.82 + i * 0.04, Math.sin(a) * 0.18]} rotation={[0.6, a, 0.25]} castShadow>
            <boxGeometry args={[0.28, 0.13, 0.02]} />
            <meshStandardMaterial color="#3d7c47" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "rug_classic") {
    return (
      <mesh rotation-x={-Math.PI / 2} position-y={0.016} receiveShadow>
        <boxGeometry args={[1.85, 1.25, 0.018]} />
        <meshStandardMaterial color="#c9b79d" roughness={0.9} />
      </mesh>
    );
  }

  return <Box args={[0.7, 0.7, 0.7]} pos={[0, 0.35, 0]} mat={fabric} />;
}

function Box({ args, pos, mat, rot }: { args: [number, number, number]; pos: [number, number, number]; mat: THREE.Material; rot?: [number, number, number] }) {
  return (
    <mesh position={pos} rotation={rot} castShadow receiveShadow material={mat}>
      <boxGeometry args={args} />
    </mesh>
  );
}

function Leg({ x, z, mat, h = 0.24 }: { x: number; z: number; mat: THREE.Material; h?: number }) {
  return (
    <mesh position={[x, h / 2, z]} castShadow receiveShadow material={mat}>
      <cylinderGeometry args={[0.035, 0.045, h, 12]} />
    </mesh>
  );
}
