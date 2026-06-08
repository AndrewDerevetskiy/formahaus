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
  return `$${Number(value || 0).toLocaleString("en-US")}`;
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
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);
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
          <div className="fh-pro-logo">F</div>
          <div className="fh-pro-brand-name">FORMAHAUS</div>
        </Link>

        <div className="fh-pro-project">
          <span>Мій проект</span>
          <b>Кімната {roomDimensions.length}×{roomDimensions.width} м</b>
          <small>{items.length} об'єктів · {roomArea.toFixed(1)} м² · {money(projectРазом)}</small>
        </div>

        <div className="fh-pro-top-actions">
          <button onClick={() => rotateSelected("left")} className="icon-btn">↶</button>
          <button onClick={() => rotateSelected("right")} className="icon-btn">↷</button>
          <button className="mode-btn">2D</button>
          <button className="mode-btn active">3D</button>
          <button className="icon-btn">📷</button>
          <button className="icon-btn">⚙</button>
          <button className="save-btn">Зберегти</button>
          <Link href="/cart" className="cart-btn">🛒 Кошик</Link>
        </div>
      </header>

      <main className="fh-pro-workspace">
        <nav className="fh-pro-rail">
          <RailButton active={tab === "furniture"} icon="🛋" label="Каталог" onClick={() => openTab("furniture")} />
          <RailButton active={tab === "materials"} icon="▱" label="Матеріали" onClick={() => openTab("materials")} />
          <RailButton active={false} icon="💡" label="Освітлення" onClick={() => openTab("furniture")} />
          <RailButton active={false} icon="🌿" label="Декор" onClick={() => setCategoryFilter("Декор")} />
          <RailButton active={tab === "summary"} icon="＄" label="Кошторис" onClick={() => openTab("summary")} />
          <RailButton active={tab === "ai"} icon="✦" label="AI Дизайн" onClick={() => openTab("ai")} />
          <div className="rail-spacer" />
          <RailButton active={false} icon="?" label="Довідка" onClick={() => alert("Порада: оберіть товар, перетягніть його по кімнаті та додайте проект у кошик.")} />
        </nav>

        <section className="fh-pro-stage">
          <div className="canvas-card">
            <Canvas shadows dpr={[1, 1.7]} camera={{ position: [4.2, 3.1, 5.1], fov: 42 }}>
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
              <button>Вид зверху</button>
              <button>Камера</button>
              <button>Рендер</button>
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
          <div className="inspector-card selected-card">
            <div className="inspector-head"><b>Вибраний об'єкт</b><button onClick={() => setSelectedId("")}>×</button></div>
            <div className="selected-product-preview">
              {selectedCatalogItem.imageUrl ? <img src={selectedCatalogItem.imageUrl} alt={selectedCatalogItem.name} /> : <div className="image-fallback">3D</div>}
              <div>
                <h3>{selectedCatalogItem.name}</h3>
                <strong>{money(selectedCatalogItem.price)}</strong>
                <span>Продавець: {selectedCatalogItem.sellerName || "FormaHaus"}</span>
                <em>3D модель</em>
              </div>
            </div>
          </div>

          <InspectorBlock title="Параметри кімнати">
            <RoomDimensionInputs dimensions={roomDimensions} onChange={updateRoomDimension} />
          </InspectorBlock>

          <InspectorBlock title="Позиція">
            <div className="triple-grid"><FieldBox label="X" value="2.45 м" /><FieldBox label="Y" value="0.00 м" /><FieldBox label="Z" value="1.32 м" /></div>
          </InspectorBlock>

          <InspectorBlock title="Поворот">
            <div className="rotation-control"><button onClick={() => rotateSelected("left")}>−</button><strong>45°</strong><button onClick={() => rotateSelected("right")}>+</button></div>
          </InspectorBlock>

          <InspectorBlock title="Розмір">
            <div className="triple-grid"><FieldBox label="Ш" value="2.10 м" /><FieldBox label="Г" value="0.95 м" /><FieldBox label="В" value="0.85 м" /></div>
          </InspectorBlock>

          <InspectorBlock title="Додатково">
            <ToggleRow label="Тіні" />
            <ToggleRow label="Прив'язка до сітки" />
            <button className="delete-btn" onClick={removeSelected}>🗑 Видалити об'єкт</button>
          </InspectorBlock>

          <div className="inspector-card cost-card">
            <div className="cost-head"><b>Кошторис проекту</b><strong>{money(projectРазом)}</strong></div>
            <SummaryRow label="Меблі" value={money(furnitureРазом)} />
            <SummaryRow label={`Підлога · ${roomArea.toFixed(1)} м²`} value={money(floorРазом)} />
            <SummaryRow label={`Стіни та обої · ${wallArea.toFixed(1)} м²`} value={money(wallРазом)} />
            <SummaryRow label="Освітлення" value="$0" />
            <Link href="/cart" className="checkout-pro">Перейти до кошика ({cart.itemCount})</Link>
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
  :root { color-scheme: dark; }
  .fh-pro-app { position: fixed; inset: 0; background: #071018; color: #F8FAFC; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow: hidden; }
  .fh-pro-topbar { height: 74px; padding: 0 20px; display: grid; grid-template-columns: 270px minmax(180px,1fr) auto; align-items: center; gap: 18px; background: linear-gradient(180deg,#0B121C,#080E15); border-bottom: 1px solid rgba(148,163,184,.16); box-shadow: 0 18px 60px rgba(0,0,0,.35); }
  .fh-pro-brand { text-decoration: none; color: inherit; display: flex; align-items: center; gap: 13px; }
  .fh-pro-logo { width: 44px; height: 44px; border-radius: 14px; background: #fff; color: #0B1220; display: grid; place-items: center; font-size: 25px; font-weight: 950; }
  .fh-pro-brand-name { font-weight: 950; letter-spacing: 4px; font-size: 20px; }
  .fh-pro-project { border-left: 1px solid rgba(148,163,184,.2); padding-left: 20px; display: flex; flex-direction: column; line-height: 1.15; }
  .fh-pro-project span { color: #98A2B3; font-size: 12px; }
  .fh-pro-project b { color: #fff; font-size: 16px; margin-top: 2px; }
  .fh-pro-project small { color: #94A3B8; font-size: 12px; margin-top: 4px; }
  .fh-pro-top-actions { display: flex; align-items: center; gap: 9px; justify-content: flex-end; }
  .icon-btn,.mode-btn,.save-btn,.cart-btn { height: 42px; border-radius: 14px; border: 1px solid rgba(148,163,184,.18); background: rgba(15,23,42,.78); color: #F8FAFC; padding: 0 14px; font-weight: 900; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
  .icon-btn { width: 44px; padding: 0; font-size: 18px; }
  .mode-btn.active { background: linear-gradient(135deg,#6D45D8,#3B82F6); border-color: rgba(167,139,250,.8); }
  .save-btn { background: rgba(255,255,255,.08); }
  .cart-btn { background: #C49469; color: #fff; border-color: #C49469; min-width: 110px; }

  .fh-pro-workspace { height: calc(100vh - 74px); display: grid; grid-template-columns: 92px minmax(0,1fr) 320px; overflow: hidden; }
  .fh-pro-rail { background: #0A111A; border-right: 1px solid rgba(148,163,184,.15); padding: 16px 10px; display: flex; flex-direction: column; gap: 12px; }
  .rail-btn { border: 1px solid transparent; min-height: 82px; border-radius: 18px; background: transparent; color: #D1D5DB; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; cursor: pointer; }
  .rail-btn span { font-size: 25px; }
  .rail-btn small { font-size: 12px; font-weight: 800; }
  .rail-btn.active { background: linear-gradient(135deg,#6D45D8,#3B2F9A); color: #fff; box-shadow: 0 18px 36px rgba(109,69,216,.28); }
  .rail-spacer { flex: 1; }

  .fh-pro-stage { min-width: 0; display: grid; grid-template-rows: minmax(390px, 58vh) minmax(270px, 1fr); background: #09111B; border-right: 1px solid rgba(148,163,184,.14); }
  .canvas-card { position: relative; margin: 14px; margin-bottom: 0; overflow: hidden; border-radius: 18px; background: radial-gradient(circle at top,#1C293A,#0A111A); border: 1px solid rgba(148,163,184,.18); box-shadow: 0 25px 90px rgba(0,0,0,.45); }
  .scene-top-tools { position:absolute; top:14px; left:18px; display:flex; gap:8px; z-index:5; }
  .scene-top-tools button,.walk-btn { border:none; background: rgba(15,23,42,.72); color:#fff; border-radius: 10px; padding:9px 12px; font-size:12px; font-weight:850; backdrop-filter: blur(12px); }
  .walk-btn { position:absolute; top:14px; right:18px; z-index:5; }
  .object-float-tools { position:absolute; left:50%; top:48%; transform:translate(-50%,-50%); display:flex; gap:8px; padding:9px; border-radius:16px; background:rgba(8,13,20,.82); border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(14px); z-index:6; box-shadow:0 18px 38px rgba(0,0,0,.35); }
  .object-float-tools button { width:36px; height:36px; border:0; border-radius:12px; background:rgba(255,255,255,.08); color:#fff; font-weight:900; cursor:pointer; }
  .view-tools { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(8,13,20,.72); border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(14px); border-radius:18px; padding:8px; display:flex; gap:8px; z-index:5; }
  .view-tools button { width:42px; height:42px; border:0; border-radius:14px; background:transparent; color:#fff; font-size:18px; }
  .nav-cube { position:absolute; right:24px; bottom:24px; width:74px; height:74px; border-radius:22px; display:grid; place-items:center; background:rgba(15,23,42,.52); color:#fff; font-size:28px; z-index:5; border:1px solid rgba(255,255,255,.12); }

  .fh-pro-bottom-panel { min-height:0; margin:0 14px 14px; overflow:auto; background:linear-gradient(180deg,rgba(12,20,30,.96),rgba(7,12,20,.98)); border:1px solid rgba(148,163,184,.16); border-top:0; border-radius:0 0 18px 18px; padding:0 16px 16px; }
  .bottom-tabs { position:sticky; top:0; display:flex; gap:34px; padding:17px 0 13px; background:rgba(8,13,20,.96); z-index:4; border-bottom:1px solid rgba(148,163,184,.14); }
  .bottom-tabs button { border:0; background:transparent; color:#B6C2D1; font-size:16px; font-weight:850; padding:0 2px 11px; cursor:pointer; }
  .mobile-panel-close { display:none; }
  .bottom-tabs button.active { color:#fff; border-bottom:2px solid #8B5CF6; }
  .catalog-filter-bar { display:grid; grid-template-columns:1fr 160px; gap:12px; margin:16px 0 10px; }
  .search-wrap { height:45px; border:1px solid rgba(148,163,184,.2); background:#0B141F; border-radius:14px; display:flex; align-items:center; gap:10px; padding:0 13px; color:#94A3B8; }
  .search-wrap input,.catalog-filter-bar select { width:100%; border:0; outline:0; background:transparent; color:#E5E7EB; font-weight:800; font-size:14px; }
  .catalog-filter-bar select { border:1px solid rgba(148,163,184,.2); background:#0B141F; border-radius:14px; padding:0 12px; }
  .chips-row { display:flex; gap:9px; overflow:auto; padding-bottom:8px; }
  .chips-row button { border:1px solid rgba(148,163,184,.22); background:transparent; color:#D1D5DB; padding:9px 16px; border-radius:999px; white-space:nowrap; font-weight:850; cursor:pointer; }
  .chips-row button.active { background:#6D45D8; border-color:#6D45D8; color:#fff; }
  .section-line { display:flex; align-items:center; justify-content:space-between; margin:14px 0 12px; }
  .section-line b { font-size:16px; }
  .section-line span { color:#A78BFA; font-size:13px; font-weight:850; }
  .product-strip { display:grid; grid-template-columns:repeat(5,minmax(150px,1fr)); gap:12px; }
  .pro-product-card { background:#111A26; border:1px solid rgba(148,163,184,.16); border-radius:14px; padding:9px; min-width:0; }
  .product-img-wrap { height:128px; border-radius:12px; overflow:hidden; position:relative; background:#E5E7EB; }
  .product-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; }
  .badge-3d { position:absolute; left:8px; top:8px; background:#5FA761; color:white; font-size:12px; font-weight:950; padding:4px 7px; border-radius:8px; }
  .heart { position:absolute; right:8px; top:8px; width:28px; height:28px; border:0; border-radius:9px; background:rgba(255,255,255,.78); color:#64748B; font-size:18px; }
  .pro-product-name { color:#fff; font-size:13px; font-weight:800; margin-top:10px; min-height:34px; }
  .pro-product-price { color:#F8FAFC; font-weight:950; margin:6px 0 9px; }
  .add-product-btn { width:100%; border:0; border-radius:11px; height:34px; background:linear-gradient(135deg,#6D45D8,#8B5CF6); color:white; font-weight:950; cursor:pointer; }
  .product-placeholder { width:100%; height:100%; display:grid; place-items:center; color:#111; font-weight:950; }

  .materials-layout { display:grid; grid-template-columns:1fr 1fr; gap:18px; padding-top:14px; }
  .room-settings-panel { grid-column:1 / -1; background:#111A26; border:1px solid rgba(148,163,184,.16); border-radius:16px; padding:12px; }
  .room-dimension-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .room-dimension-grid label { display:flex; flex-direction:column; gap:7px; color:#CBD5E1; font-size:12px; font-weight:900; }
  .room-dimension-grid input { width:100%; box-sizing:border-box; border:1px solid rgba(148,163,184,.2); background:#0B141F; color:#fff; border-radius:12px; padding:11px 10px; outline:0; font-size:15px; font-weight:950; }

  .material-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .material-chip { border:1px solid rgba(148,163,184,.18); background:#111A26; color:#E5E7EB; border-radius:12px; padding:8px; cursor:pointer; }
  .material-chip span { display:block; height:54px; border-radius:10px; border:1px solid rgba(255,255,255,.18); margin-bottom:7px; }
  .material-chip small { font-weight:800; font-size:12px; }
  .material-chip.active { border-color:#8B5CF6; box-shadow:0 0 0 2px rgba(139,92,246,.25); }
  .summary-large,.ai-panel { max-width:620px; padding:18px; border-radius:18px; background:#111A26; border:1px solid rgba(148,163,184,.16); margin-top:16px; }
  .ai-panel p { color:#94A3B8; line-height:1.55; }
  .ai-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:16px 0; }
  .ai-grid button,.ai-main { border:1px solid rgba(139,92,246,.45); color:#fff; background:rgba(139,92,246,.15); border-radius:13px; padding:12px; font-weight:900; }
  .ai-main { width:100%; background:linear-gradient(135deg,#6D45D8,#C084FC); }

  .fh-pro-inspector { min-width:0; background:#0A111A; padding:14px; overflow:auto; display:flex; flex-direction:column; gap:14px; }
  .inspector-card { background:#101923; border:1px solid rgba(148,163,184,.16); border-radius:18px; padding:16px; }
  .inspector-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .inspector-head button { border:0; background:transparent; color:#CBD5E1; font-size:24px; }
  .selected-product-preview { display:grid; grid-template-columns:105px 1fr; gap:13px; align-items:center; }
  .selected-product-preview img,.image-fallback { width:105px; height:92px; object-fit:cover; border-radius:14px; background:#E5E7EB; }
  .image-fallback { display:grid; place-items:center; color:#111; font-weight:950; }
  .selected-product-preview h3 { margin:0 0 6px; font-size:16px; }
  .selected-product-preview strong { display:block; font-size:20px; margin-bottom:7px; }
  .selected-product-preview span { color:#94A3B8; display:block; font-size:12px; }
  .selected-product-preview em { display:inline-block; margin-top:8px; color:#7CFF9B; background:rgba(34,197,94,.12); border-radius:999px; padding:5px 9px; font-style:normal; font-size:12px; font-weight:950; }
  .inspector-card h4 { margin:0 0 12px; font-size:15px; }
  .triple-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .field-box { background:#0B141F; border:1px solid rgba(148,163,184,.14); border-radius:11px; padding:9px; }
  .field-box span { display:block; color:#94A3B8; font-size:11px; margin-bottom:5px; }
  .field-box b { font-size:13px; }
  .rotation-control { display:grid; grid-template-columns:44px 1fr 44px; gap:10px; align-items:center; }
  .rotation-control button { height:44px; border:0; border-radius:13px; background:#172334; color:#fff; font-size:20px; }
  .rotation-control strong { text-align:center; display:block; font-size:30px; color:#8B5CF6; }
  .toggle-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; color:#CBD5E1; }
  .toggle-row b { width:42px; height:24px; border-radius:999px; background:#8B5CF6; position:relative; }
  .toggle-row b:after { content:""; position:absolute; right:3px; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; }
  .delete-btn,.checkout-pro,.summary-checkout { width:100%; height:44px; border:0; border-radius:13px; background:linear-gradient(135deg,#7C2D12,#EF4444); color:#fff; font-weight:950; cursor:pointer; margin-top:12px; text-decoration:none; display:flex; align-items:center; justify-content:center; }
  .checkout-pro,.summary-checkout { background:linear-gradient(135deg,#6D45D8,#8B5CF6); }
  .cost-head,.summary-total { display:flex; justify-content:space-between; gap:14px; align-items:center; margin-bottom:12px; }
  .cost-head strong,.summary-total b { font-size:22px; }
  .summary-row { display:flex; justify-content:space-between; gap:10px; padding:8px 0; color:#CBD5E1; font-size:14px; }
  .summary-row b { color:#fff; }

  .mobile-pro-nav { display:none; }

  @media (max-width: 1180px) {
    .fh-pro-workspace { grid-template-columns:82px minmax(0,1fr); }
    .fh-pro-inspector { display:none; }
    .product-strip { grid-template-columns:repeat(4,minmax(140px,1fr)); }
  }

  @media (max-width: 820px) {
    .fh-pro-topbar { height:64px; padding:0 14px; grid-template-columns:1fr auto; }
    .fh-pro-project { display:none; }
    .fh-pro-brand-name { font-size:18px; letter-spacing:3px; }
    .fh-pro-logo { width:42px; height:42px; }
    .fh-pro-top-actions .icon-btn,.fh-pro-top-actions .mode-btn,.fh-pro-top-actions .save-btn { display:none; }
    .cart-btn { height:44px; min-width:92px; }
    .fh-pro-workspace { height:calc(100vh - 64px - 80px); grid-template-columns:1fr; grid-template-rows:1fr; overflow:hidden; }
    .fh-pro-rail { display:none; }
    .fh-pro-stage { display:block; position:relative; min-height:0; overflow:hidden; }
    .canvas-card { height:calc(100vh - 64px - 92px); margin:10px; border-radius:22px; }
    .scene-top-tools,.walk-btn,.nav-cube { display:none; }
    .object-float-tools { top:54%; }
    .view-tools { bottom:14px; }
    .fh-pro-bottom-panel { position:fixed; left:10px; right:10px; bottom:88px; max-height:52vh; min-height:290px; overflow:auto; margin:0; border-radius:24px; border:1px solid rgba(148,163,184,.22); padding:0 12px 14px; z-index:45; box-shadow:0 -18px 70px rgba(0,0,0,.62); transform:translateY(calc(100% + 110px)); opacity:0; pointer-events:none; transition:transform .22s ease, opacity .22s ease; }
    .fh-pro-bottom-panel.open { transform:translateY(0); opacity:1; pointer-events:auto; }
    .bottom-tabs { gap:22px; overflow:auto; padding-right:42px; }
    .mobile-panel-close { display:grid !important; place-items:center; position:absolute; right:8px; top:11px; width:34px; height:34px; border-radius:12px; background:#172334 !important; color:#fff !important; font-size:22px !important; padding:0 !important; }
    .catalog-filter-bar { grid-template-columns:1fr; }
    .chips-row { padding-bottom:10px; }
    .product-strip { display:flex; overflow-x:auto; gap:12px; padding-bottom:12px; }
    .pro-product-card { min-width:160px; }
    .materials-layout { grid-template-columns:1fr; }
    .room-dimension-grid { grid-template-columns:1fr; }
    .material-strip { display:flex; overflow-x:auto; }
    .material-chip { min-width:105px; }
    .mobile-pro-nav { position:fixed; left:0; right:0; bottom:0; height:80px; background:#081019; border-top:1px solid rgba(148,163,184,.16); display:grid; grid-template-columns:1fr 1fr 82px 1fr 1fr; align-items:center; padding:6px 10px max(6px, env(safe-area-inset-bottom)); z-index:50; }
    .mobile-pro-nav button { border:0; background:transparent; color:#AEB9C8; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:22px; font-weight:900; }
    .mobile-pro-nav button span { font-size:11px; }
    .mobile-pro-nav button.active { color:#fff; }
    .mobile-pro-nav .plus { width:64px; height:64px; border-radius:50%; justify-self:center; background:linear-gradient(135deg,#6D45D8,#8B5CF6); color:#fff; font-size:40px; box-shadow:0 0 0 6px rgba(139,92,246,.18); }
  }

  @media (max-width: 430px) {
    .fh-pro-brand-name { font-size:16px; letter-spacing:3px; }
    .cart-btn { min-width:82px; font-size:13px; }
    .canvas-card { min-height:310px; }
    .canvas-card { height:calc(100vh - 64px - 92px); }
    .fh-pro-bottom-panel { max-height:56vh; min-height:300px; }
    .product-img-wrap { height:112px; }
    .pro-product-card { min-width:150px; }
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
      <color attach="background" args={["#e9e3d9"]} />
      <fog attach="fog" args={["#e9e3d9", 7, 18]} />

      {/* PRO LIGHTING: тепле світло, тіні, акценти як у професійному planner */}
      <ambientLight intensity={0.38} color="#fff3e4" />
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

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial map={floorTexture} roughness={0.58} metalness={0.03} />
      </mesh>

      <mesh position={[0, height / 2, -halfWidth]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      <mesh position={[-halfLength, height / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      <mesh position={[halfLength, height / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      <mesh position={[0, height, 0]} rotation-x={Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#f7f4ed" roughness={0.86} transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.04, -halfWidth + 0.03]}>
        <boxGeometry args={[length, 0.08, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.65} />
      </mesh>

      <mesh position={[-halfLength + 0.03, 0.04, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[width, 0.08, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.65} />
      </mesh>

      <mesh position={[halfLength - 0.03, 0.04, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[width, 0.08, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.65} />
      </mesh>

      <mesh position={[Math.min(0.8, halfLength - 0.9), height * 0.62, -halfWidth - 0.018]}>
        <boxGeometry args={[Math.min(1.45, length * 0.28), Math.min(1.05, height * 0.38), 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      <mesh position={[Math.min(0.8, halfLength - 0.9), height * 0.62, -halfWidth - 0.042]}>
        <planeGeometry args={[Math.min(1.25, length * 0.24), Math.min(0.86, height * 0.31)]} />
        <meshStandardMaterial color="#bcd9ee" roughness={0.16} metalness={0.05} transparent opacity={0.52} />
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

function Box({ args, pos, mat }: { args: [number, number, number]; pos: [number, number, number]; mat: THREE.Material }) {
  return (
    <mesh position={pos} castShadow receiveShadow material={mat}>
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
