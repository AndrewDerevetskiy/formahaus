import Pro3DEffects from "./Pro3DEffects";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import * as THREE from "three";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useCart } from "../context/CartContext";

type ДизайнerTab = "furniture" | "materials" | "summary";

type КаталогItem = {
  id: string;
  type: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

type PlacedItem = КаталогItem & {
  instanceId: string;
  position: [number, number, number];
  rotation: number;
};

const FURNITURE: КаталогItem[] = [
  // Меблі
  { id: "sofa", type: "sofa", name: "Скандинавський диван", category: "Меблі", price: 2199, description: "3-місний диван, льон" },
  { id: "corner_sofa", type: "sofa", name: "Кутовий диван", category: "Меблі", price: 2899, description: "Кутовий диван для вітальні" },
  { id: "armchair", type: "armchair", name: "Крісло Lounge", category: "Меблі", price: 1049, description: "Крісло для вітальні" },
  { id: "dining_chair", type: "armchair", name: "Обідній стілець", category: "Меблі", price: 249, description: "Стілець для кухні або їдальні" },
  { id: "coffee", type: "coffee", name: "Журнальний стіл", category: "Меблі", price: 849, description: "Стіл для вітальні" },
  { id: "dining", type: "dining", name: "Обідній стіл", category: "Меблі", price: 1999, description: "Стіл на 6–8 місць" },
  { id: "bookshelf", type: "bookshelf", name: "Стелаж", category: "Меблі", price: 699, description: "Відкритий стелаж" },
  { id: "cabinet", type: "cabinet", name: "Комод", category: "Меблі", price: 1349, description: "Комод / тумба" },
  { id: "wardrobe", type: "cabinet", name: "Шафа", category: "Меблі", price: 1599, description: "Шафа для спальні" },
  { id: "tv_unit", type: "cabinet", name: "Тумба під TV", category: "Меблі", price: 899, description: "Тумба для телевізора" },

  // Освітлення
  { id: "floorlamp", type: "floorlamp", name: "Підлогова лампа", category: "Освітлення", price: 599, description: "Торшер для вітальні" },
  { id: "table_lamp", type: "floorlamp", name: "Настільна лампа", category: "Освітлення", price: 189, description: "Лампа для робочого столу" },
  { id: "pendant", type: "floorlamp", name: "Підвісний світильник", category: "Освітлення", price: 389, description: "Світильник над столом" },
  { id: "wall_light", type: "floorlamp", name: "Настінне бра", category: "Освітлення", price: 229, description: "Декоративне настінне світло" },

  // Підлога як товар
  { id: "laminate_oak", type: "floor_product", name: "Ламінат світлий дуб", category: "Підлога", price: 45, description: "Ціна за м², 32 клас" },
  { id: "laminate_walnut", type: "floor_product", name: "Ламінат горіх", category: "Підлога", price: 58, description: "Ціна за м², вологостійкий" },
  { id: "vinyl_floor", type: "floor_product", name: "SPC вініл", category: "Підлога", price: 64, description: "Ціна за м², водостійкий" },
  { id: "tile_stone", type: "floor_product", name: "Керамограніт Stone Grey", category: "Підлога", price: 72, description: "Ціна за м², плитка" },
  { id: "tile_marble", type: "floor_product", name: "Плитка Marble White", category: "Підлога", price: 95, description: "Ціна за м², мармуровий ефект" },

  // Стіни / шпалери / обої як товар
  { id: "paint_white", type: "wall_product", name: "Фарба Warm White", category: "Стіни та обої", price: 28, description: "Ціна за м² покриття" },
  { id: "paint_sage", type: "wall_product", name: "Фарба Sage Green", category: "Стіни та обої", price: 32, description: "Ціна за м² покриття" },
  { id: "wallpaper_linen", type: "wall_product", name: "Шпалери Linen Beige", category: "Стіни та обої", price: 39, description: "Ціна за рулон" },
  { id: "wallpaper_geo", type: "wall_product", name: "Обої Geometry Soft", category: "Стіни та обої", price: 44, description: "Ціна за рулон" },
  { id: "wallpaper_dark", type: "wall_product", name: "Обої Dark Accent", category: "Стіни та обої", price: 49, description: "Ціна за рулон" },

  // Декор
  { id: "plant", type: "plant", name: "Кімнатна рослина", category: "Декор", price: 149, description: "Декоративна рослина" },
  { id: "large_plant", type: "plant", name: "Велика рослина", category: "Декор", price: 249, description: "Акцентна рослина" },
  { id: "rug_classic", type: "rug_classic", name: "Килим Area Rug", category: "Декор", price: 599, description: "Килим для вітальні" },
  { id: "round_rug", type: "rug_classic", name: "Круглий килим", category: "Декор", price: 499, description: "Круглий килим" },
  { id: "mirror", type: "cabinet", name: "Настінне дзеркало", category: "Декор", price: 299, description: "Дзеркало для кімнати" },
];

const FLOOR_OPTIONS = [
  { id: "oak", name: "Ламінат світлий дуб", color: "#d8bc8d", color2: "#b98242", pattern: "planks", price: 3645 },
  { id: "natural_oak", name: "Паркет натуральний дуб", color: "#c9a46c", color2: "#8c5a27", pattern: "herringbone", price: 4050 },
  { id: "walnut", name: "Ламінат горіх", color: "#7a4b2a", color2: "#3a1f10", pattern: "planks", price: 5508 },
  { id: "dark_wood", name: "Темне дерево", color: "#3c2416", color2: "#1c0f08", pattern: "planks", price: 5900 },
  { id: "concrete", name: "Мікроцемент", color: "#a8a8a0", color2: "#77776f", pattern: "concrete", price: 2835 },
  { id: "light_concrete", name: "Світлий бетон", color: "#c9c9c3", color2: "#92928b", pattern: "concrete", price: 3100 },
  { id: "marble", name: "Плитка Marble White", color: "#f2eee8", color2: "#aab0bb", pattern: "marble", price: 9720 },
  { id: "black_marble", name: "Плитка Black Marble", color: "#1f2933", color2: "#7f8794", pattern: "marble", price: 10900 },
  { id: "warm_tile", name: "Тепла плитка", color: "#d6c3aa", color2: "#a58761", pattern: "tiles", price: 4300 },
  { id: "stone", name: "Керамограніт Stone Grey", color: "#7c8288", color2: "#51565b", pattern: "tiles", price: 5200 },
  { id: "vinyl_spc", name: "SPC вініл сірий дуб", color: "#aaa59b", color2: "#68645f", pattern: "planks", price: 4550 },
  { id: "laminate_milk", name: "Ламінат молочний дуб", color: "#e4d0ad", color2: "#bf9a65", pattern: "planks", price: 3900 },
];

const WALL_OPTIONS = [
  { id: "white", name: "Фарба Warm White", color: "#f5f0ea", price: 280 },
  { id: "pure_white", name: "Білий матовий", color: "#ffffff", price: 260 },
  { id: "cream", name: "Кремовий", color: "#efe2c9", price: 320 },
  { id: "sage", name: "Шавлієвий", color: "#a8baa0", price: 340 },
  { id: "olive", name: "Оливково-сірий", color: "#7f8a75", price: 360 },
  { id: "sand", name: "Теплий пісок", color: "#c8b8a0", price: 340 },
  { id: "terracotta", name: "Теракота", color: "#b9785f", price: 380 },
  { id: "clay", name: "М’яка глина", color: "#c09683", price: 380 },
  { id: "blue_grey", name: "Сіро-блакитний", color: "#72869a", price: 390 },
  { id: "navy", name: "Темно-синій", color: "#26384f", price: 420 },
  { id: "charcoal", name: "Антрацит", color: "#2d3138", price: 400 },
  { id: "black", name: "М’який чорний", color: "#171717", price: 440 },
];

function money(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

export default function FormaHaus() {
  const cart = useCart();

  const [tab, setTab] = useState<ДизайнerTab>("furniture");
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [floorId, setFloorId] = useState("oak");
  const [wallId, setWallId] = useState("white");
  const [panelOpen, setPanelOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("all");

  const selected = items.find(i => i.instanceId === selectedId);
  const floor = FLOOR_OPTIONS.find(f => f.id === floorId) || FLOOR_OPTIONS[0];
  const wall = WALL_OPTIONS.find(w => w.id === wallId) || WALL_OPTIONS[0];

  const furnitureРазом = items.reduce((sum, item) => sum + item.price, 0);
  const projectРазом = furnitureРазом + floor.price + wall.price;

  const categories = useMemo(() => ["All", ...Array.from(new Set(FURNITURE.map(i => i.category)))], []);

  const filteredКаталог = useMemo(() => {
    const q = search.trim().toLowerCase();

    return FURNITURE.filter(item => {
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
  }, [search, categoryFilter, priceFilter]);

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
      icon: product.category === "Seating" ? "SOFA" : product.category === "Tables" ? "TABLE" : "ITEM",
    });
  }, [cart]);

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    setItems(prev => prev.filter(i => i.instanceId !== selectedId));
    cart.removeItem(selectedId);
    setSelectedId("");
  }, [selectedId, cart]);

  const rotateSelected = useCallback((direction: "left" | "right" = "right") => {
    if (!selectedId) {
      alert("Спочатку виберіть меблі на сцені");
      return;
    }

    const step = Math.PI / 12; // 15 градусів

    setItems(prev =>
      prev.map(item =>
        item.instanceId === selectedId
          ? {
              ...item,
              rotation:
                direction === "left"
                  ? (item.rotation || 0) - step
                  : (item.rotation || 0) + step,
            }
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

  function changeFloor(id: string) {
    setFloorId(id);
    if (cart.setFloorKind) cart.setFloorKind(id);
  }

  function changeWall(id: string) {
    setWallId(id);
    if (cart.setWallColorId) cart.setWallColorId(id);
  }
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#f4f6f8",
      color: "#111827",
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      <header className="fh-topbar">
        <div className="fh-brand">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="fh-logo-wrap">
              <div className="fh-logo">F</div>
              <div>
                <div className="fh-brand-title">FORMAHAUS</div>
                <div className="fh-brand-subtitle">Професійний 3D редактор кімнат</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="fh-top-actions">
          <button className="fh-soft-btn" onClick={() => setPanelOpen(v => !v)}>
            {panelOpen ? "Сховати панель" : "Показати панель"}
          </button>
          <button className="fh-soft-btn" onClick={clearRoom}>Очистити</button>
          <Link href="/cart" style={{ textDecoration: "none" }}>
            <button className="fh-cart-btn">
              Кошик
              {cart.itemCount > 0 && <span className="fh-cart-badge">{cart.itemCount}</span>}
            </button>
          </Link>
        </div>
      </header>

      <main className={`fh-workspace ${panelOpen ? "" : "panel-hidden"}`}>
        <aside className="fh-panel">
          <div className="fh-panel-head">
            <div>
              <h1>3D редактор кімнати</h1>
              <p>Додавайте меблі, підлогу, освітлення, обої та формуйте кошторис.</p>
            </div>
          </div>

          <div className="fh-tabs">
            <button onClick={() => setTab("furniture")} className={tab === "furniture" ? "active" : ""}>Каталог</button>
            <button onClick={() => setTab("materials")} className={tab === "materials" ? "active" : ""}>Матеріали</button>
            <button onClick={() => setTab("summary")} className={tab === "summary" ? "active" : ""}>Кошторис</button>
          </div>

          <div className="fh-panel-body">
            {tab === "furniture" && (
              <>
                <SectionTitle title="Каталог товарів" subtitle="Меблі, підлога, освітлення, обої та декор для інтер’єру" />
                <div className="fh-filter-box">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Пошук товарів..."
                    className="fh-search-input"
                  />

                  <div className="fh-category-row">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={categoryFilter === category ? "active" : ""}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <select
                    value={priceFilter}
                    onChange={e => setPriceFilter(e.target.value)}
                    className="fh-select-input"
                  >
                    <option value="all">Усі ціни</option>
                    <option value="under500">До $500</option>
                    <option value="500to1000">$500 — $1,000</option>
                    <option value="over1000">Понад $1,000</option>
                  </select>
                </div>

                <div className="fh-product-count">
                  {filteredКаталог.length} товарів знайдено
                </div>

                <div className="fh-product-list">
                  {filteredКаталог.map(item => (
                    <button key={item.id} className="fh-product-card" onClick={() => addКаталог(item)}>
                      <div className="fh-product-thumb">
                        <КаталогIcon type={item.type} />
                      </div>
                      <div className="fh-product-info">
                        <div className="fh-product-category">{item.category}</div>
                        <div className="fh-product-name">{item.name}</div>
                        <div className="fh-product-desc">{item.description}</div>
                      </div>
                      <div className="fh-product-price">
                        {money(item.price)}
                        <span>+</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "materials" && (
              <>
                <SectionTitle title="Матеріали кімнати" subtitle="Окремі палітри для підлоги, стін, плитки, ламінату та фарби" />

                <div className="fh-material-block">
                  <h3>Палітра підлоги</h3>
                  <div className="fh-current-material">
                    <span style={{ background: floor.color }} />
                    <div>
                      <b>{floor.name}</b>
                      <small>{money(floor.price)}</small>
                    </div>
                  </div>

                  <div className="fh-palette-grid floor">
                    {FLOOR_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        title={option.name}
                        onClick={() => changeFloor(option.id)}
                        className={`fh-palette-dot ${floorId === option.id ? "active" : ""}`}
                      >
                        <span style={{ background: option.color }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fh-material-block">
                  <h3>Палітра стін / обоїв</h3>
                  <div className="fh-current-material">
                    <span style={{ background: wall.color }} />
                    <div>
                      <b>{wall.name}</b>
                      <small>{money(wall.price)}</small>
                    </div>
                  </div>

                  <div className="fh-palette-grid">
                    {WALL_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        title={option.name}
                        onClick={() => changeWall(option.id)}
                        className={`fh-palette-dot ${wallId === option.id ? "active" : ""}`}
                      >
                        <span style={{ background: option.color }} />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === "summary" && (
              <>
                <SectionTitle title="Кошторис проєкту" subtitle="Загальна вартість меблів, підлоги, стін, освітлення та декору" />

                <div className="fh-summary-card">
                  <КошторисRow label="Каталог" value={money(furnitureРазом)} />
                  <КошторисRow label={`Підлога · ${floor.name}`} value={money(floor.price)} />
                  <КошторисRow label={`Стіни · ${wall.name}`} value={money(wall.price)} />
                  <div className="fh-summary-total">
                    <span>Разом</span>
                    <b>{money(projectРазом)}</b>
                  </div>
                </div>

                <div className="fh-selected-card">
                  <h3>Вибраний об’єкт</h3>
                  {selected ? (
                    <>
                      <b>{selected.name}</b>
                      <p>{selected.description}</p>
                      <div className="fh-selected-actions">
                        <button onClick={() => rotateSelected("left")}>↺ Вліво</button>
                        <button onClick={() => rotateSelected("right")}>↻ Вправо</button>
                        <button onClick={removeSelected} className="danger">Видалити</button>
                      </div>
                    </>
                  ) : (
                    <p>Оберіть товар або об’єкт на сцені для керування.</p>
                  )}
                </div>

                <Link href="/cart" style={{ textDecoration: "none" }}>
                  <button className="fh-checkout-btn">Перейти до кошика</button>
                </Link>
              </>
            )}
          </div>
        </aside>

        <section className="fh-canvas-area">
          <div className="fh-canvas-toolbar">
            <div>
              <div className="fh-canvas-title">Проєкт вітальні</div>
              <div className="fh-canvas-subtitle">{items.length} об’єктів · {money(projectРазом)}</div>
            </div>

            <div className="fh-canvas-actions">
              {selected && (
                <>
                  <button onClick={() => rotateSelected("left")}>↺ Вліво</button>
                  <button onClick={() => rotateSelected("right")}>↻ Вправо</button>
                  <button onClick={removeSelected}>Видалити</button>
                </>
              )}
              <button className="primary">Зберегти проєкт</button>
            </div>
          </div>

          <div className="fh-canvas-shell">
            <Canvas
              shadows
              dpr={[1, 1.7]}
              camera={{ position: [4.2, 3.1, 5.1], fov: 42 }}
            >
              <Pro3DEffects />
              <Scene
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMove={updateItemPosition}
                floor={floor}
                wallColor={wall.color}
              />
            </Canvas>

            <button className="fh-ai-btn">
              <span>AI</span>
              Дизайн
            </button>

            <div className="fh-help-chip">
              Drag об’єктів · Scroll to zoom · Tap to select
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .fh-topbar {
          height: 72px;
          box-sizing: border-box;
          padding: 0 22px;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 20;
          position: relative;
        }

        .fh-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fh-logo {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #111827;
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 20px;
        }

        .fh-brand-title {
          font-weight: 950;
          letter-spacing: 4px;
          font-size: 15px;
        }

        .fh-brand-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin-top: 2px;
        }

        .fh-top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fh-soft-btn, .fh-cart-btn {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111827;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .fh-cart-btn {
          background: #2563eb;
          border-color: #2563eb;
          color: #fff;
          position: relative;
          min-width: 90px;
        }

        .fh-cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #111827;
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
          border: 2px solid #fff;
        }

        .fh-workspace {
          height: calc(100vh - 72px);
          display: grid;
          grid-template-columns: 390px minmax(0, 1fr);
          overflow: hidden;
        }

        .fh-workspace.panel-hidden {
          grid-template-columns: 0 minmax(0, 1fr);
        }

        .fh-panel {
          background: #fff;
          border-right: 1px solid #e5e7eb;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: width .2s ease;
          min-width: 0;
        }

        .panel-hidden .fh-panel {
          visibility: hidden;
        }

        .fh-panel-head {
          padding: 22px 22px 14px;
        }

        .fh-panel-head h1 {
          margin: 0;
          color: #111827;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .fh-panel-head p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 7px 0 0;
        }

        .fh-tabs {
          margin: 0 18px;
          padding: 5px;
          border-radius: 14px;
          background: #f3f4f6;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .fh-tabs button {
          border: none;
          border-radius: 11px;
          padding: 11px 8px;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .fh-tabs button.active {
          background: #fff;
          color: #111827;
          box-shadow: 0 3px 14px rgba(15,23,42,.08);
        }

        .fh-panel-body {
          padding: 18px;
          overflow-y: auto;
        }

        .fh-section-title {
          margin-bottom: 14px;
        }

        .fh-section-title h2 {
          margin: 0;
          font-size: 18px;
          color: #111827;
          font-weight: 950;
        }

        .fh-section-title p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.45;
        }

        .fh-filter-box {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 18px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .fh-search-input, .fh-select-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111827;
          border-radius: 13px;
          padding: 11px 12px;
          font-size: 13px;
          font-weight: 750;
          outline: none;
        }

        .fh-search-input:focus, .fh-select-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .fh-category-row {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin: 10px 0;
        }

        .fh-category-row button {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #4b5563;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .fh-category-row button.active {
          border-color: #2563eb;
          background: #2563eb;
          color: #fff;
        }

        .fh-product-count {
          color: #6b7280;
          font-size: 12px;
          font-weight: 850;
          margin: 0 0 10px 2px;
        }

        .fh-product-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .fh-product-card {
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 16px;
          padding: 11px;
          display: grid;
          grid-template-columns: 62px 1fr auto;
          gap: 12px;
          align-items: center;
          cursor: pointer;
          text-align: left;
          transition: .15s ease;
        }

        .fh-product-card:hover {
          border-color: #2563eb;
          box-shadow: 0 10px 28px rgba(37,99,235,.10);
          transform: translateY(-1px);
        }

        .fh-product-thumb {
          height: 62px;
          border-radius: 14px;
          background: #f3f4f6;
          display: grid;
          place-items: center;
          color: #111827;
        }

        .fh-product-category {
          color: #2563eb;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .6px;
        }

        .fh-product-name {
          color: #111827;
          font-size: 15px;
          font-weight: 950;
          margin-top: 2px;
        }

        .fh-product-desc {
          color: #6b7280;
          font-size: 12px;
          margin-top: 3px;
        }

        .fh-product-price {
          color: #111827;
          font-size: 14px;
          font-weight: 950;
          text-align: right;
        }

        .fh-product-price span {
          margin-top: 9px;
          width: 28px;
          height: 28px;
          border-radius: 10px;
          background: #111827;
          color: #fff;
          display: grid;
          place-items: center;
          margin-left: auto;
          font-size: 18px;
        }

        .fh-material-block {
          margin-bottom: 22px;
        }

        .fh-material-block h3 {
          margin: 0 0 10px;
          color: #374151;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .9px;
        }

        .fh-material-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .fh-material-card {
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 16px;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fh-material-card.active {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .fh-material-card span {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,.08);
        }

        .fh-material-card b {
          color: #111827;
          font-size: 14px;
        }

        .fh-material-card small {
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
        }

        .fh-current-material {
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .fh-current-material > span {
          width: 56px;
          height: 42px;
          border-radius: 13px;
          border: 1px solid rgba(0,0,0,.08);
          flex-shrink: 0;
        }

        .fh-current-material b {
          display: block;
          color: #111827;
          font-size: 15px;
          font-weight: 950;
        }

        .fh-current-material small {
          display: block;
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
          margin-top: 3px;
        }

        .fh-palette-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 9px;
        }

        .fh-palette-grid.floor {
          grid-template-columns: repeat(5, 1fr);
        }

        .fh-palette-dot {
          height: 42px;
          border: 1px solid #d1d5db;
          background: #fff;
          border-radius: 14px;
          padding: 4px;
          cursor: pointer;
          transition: .15s ease;
        }

        .fh-palette-dot span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,.08);
        }

        .fh-palette-dot.active {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.14);
        }


        .fh-material-card span, .fh-current-material > span {
          position: relative;
          overflow: hidden;
        }

        .fh-material-card span::after, .fh-current-material > span::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .42;
          background-image: repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, transparent 2px 32px), repeating-linear-gradient(0deg, rgba(255,255,255,.14) 0 2px, transparent 2px 18px);
        }

        .fh-summary-card, .fh-selected-card {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 16px;
          background: #fff;
          margin-bottom: 14px;
        }

        .fh-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
          color: #6b7280;
          font-size: 14px;
          font-weight: 750;
        }

        .fh-summary-row b {
          color: #111827;
        }

        .fh-summary-total {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 14px;
          color: #111827;
          font-size: 16px;
          font-weight: 950;
        }

        .fh-summary-total b {
          font-size: 24px;
        }

        .fh-selected-card h3 {
          margin: 0 0 10px;
          color: #111827;
          font-size: 16px;
          font-weight: 950;
        }

        .fh-selected-card p {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.45;
          margin: 7px 0 0;
        }

        .fh-selected-actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-top: 14px;
        }

        .fh-selected-actions button, .fh-checkout-btn {
          border: 1px solid #d1d5db;
          background: #fff;
          border-radius: 12px;
          padding: 11px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .fh-selected-actions button.danger {
          color: #dc2626;
          border-color: #fecaca;
        }

        .fh-checkout-btn {
          width: 100%;
          background: #2563eb;
          border-color: #2563eb;
          color: #fff;
        }

        .fh-canvas-area {
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 18px;
          gap: 14px;
        }

        .fh-canvas-toolbar {
          min-height: 62px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 12px 14px 12px 18px;
          box-shadow: 0 10px 34px rgba(15,23,42,.05);
        }

        .fh-canvas-title {
          color: #111827;
          font-size: 17px;
          font-weight: 950;
        }

        .fh-canvas-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin-top: 3px;
          font-weight: 700;
        }

        .fh-canvas-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .fh-canvas-actions button {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111827;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .fh-canvas-actions button.primary {
          background: #111827;
          color: #fff;
          border-color: #111827;
        }

        .fh-canvas-shell {
          position: relative;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          border-radius: 26px;
          background: #e8edf3;
          border: 1px solid #d8dee7;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 22px 70px rgba(15,23,42,.10);
        }

        .fh-ai-btn {
          position: absolute;
          right: 24px;
          bottom: 24px;
          border: none;
          background: #2563eb;
          color: #fff;
          border-radius: 18px;
          padding: 15px 22px;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 18px 38px rgba(37,99,235,.30);
          display: flex;
          align-items: center;
          gap: 9px;
          text-transform: uppercase;
          letter-spacing: .6px;
        }

        .fh-ai-btn span {
          background: rgba(255,255,255,.18);
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: grid;
          place-items: center;
        }

        .fh-help-chip {
          position: absolute;
          left: 22px;
          bottom: 22px;
          background: rgba(255,255,255,.9);
          color: #374151;
          border: 1px solid rgba(209,213,219,.8);
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 800;
          backdrop-filter: blur(14px);
        }

        @media (max-width: 1100px) {
          .fh-workspace {
            grid-template-columns: 330px minmax(0, 1fr);
          }
          .fh-canvas-area {
            padding: 14px;
          }
        }

        @media (max-width: 860px) {
          .fh-topbar {
            height: 66px;
            padding: 0 14px;
          }

          .fh-brand-subtitle, .fh-soft-btn {
            display: none;
          }

          .fh-brand-title {
            font-size: 13px;
            letter-spacing: 3px;
          }

          .fh-logo {
            width: 38px;
            height: 38px;
            border-radius: 13px;
          }

          .fh-workspace {
            height: calc(100vh - 66px);
            grid-template-columns: 1fr;
            grid-template-rows: minmax(44vh, 1fr) auto;
          }

          .fh-canvas-area {
            order: 1;
            padding: 10px;
            min-height: 0;
          }

          .fh-panel {
            order: 2;
            max-height: 48vh;
            border-right: none;
            border-top: 1px solid #e5e7eb;
            border-radius: 22px 22px 0 0;
            box-shadow: 0 -18px 50px rgba(15,23,42,.14);
          }

          .fh-workspace.panel-hidden {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 0;
          }

          .fh-canvas-toolbar {
            min-height: 54px;
            border-radius: 18px;
            padding: 10px 12px;
          }

          .fh-canvas-actions button {
            padding: 9px 10px;
            font-size: 11px;
          }

          .fh-canvas-shell {
            border-radius: 22px;
          }

          .fh-panel-head {
            padding: 16px 16px 10px;
          }

          .fh-panel-head h1 {
            font-size: 22px;
          }

          .fh-panel-head p {
            font-size: 13px;
          }

          .fh-panel-body {
            padding: 14px;
          }

          .fh-product-card {
            grid-template-columns: 54px 1fr auto;
          }

          .fh-product-thumb {
            height: 54px;
          }

          .fh-ai-btn {
            right: 16px;
            bottom: 16px;
            padding: 12px 16px;
            border-radius: 15px;
          }

          .fh-help-chip {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .fh-canvas-title {
            font-size: 14px;
          }

          .fh-canvas-subtitle {
            font-size: 11px;
          }

          .fh-material-grid {
            grid-template-columns: 1fr;
          }

          .fh-palette-grid, .fh-palette-grid.floor {
            grid-template-columns: repeat(4, 1fr);
          }

          .fh-tabs button {
            font-size: 12px;
          }

          .fh-product-name {
            font-size: 14px;
          }

          .fh-product-desc {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="fh-section-title">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function КошторисRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="fh-summary-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function КаталогIcon({ type }: { type: string }) {
  if (type.includes("sofa") || type.includes("chair")) {
    return (
      <svg width="38" height="38" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="28" width="40" height="18" rx="5" fill="#111827" opacity=".88" />
        <rect x="16" y="20" width="32" height="16" rx="5" fill="#111827" opacity=".38" />
        <rect x="8" y="34" width="8" height="16" rx="3" fill="#111827" opacity=".65" />
        <rect x="48" y="34" width="8" height="16" rx="3" fill="#111827" opacity=".65" />
        <path d="M18 48v6M46 48v6" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type.includes("table") || type.includes("coffee") || type.includes("dining")) {
    return (
      <svg width="38" height="38" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="18" width="40" height="8" rx="4" fill="#111827" opacity=".85" />
        <path d="M20 26l-5 26M44 26l5 26M27 26v25M37 26v25" stroke="#111827" strokeWidth="4" strokeLinecap="round" opacity=".62" />
      </svg>
    );
  }

  if (type.includes("lamp")) {
    return (
      <svg width="38" height="38" viewBox="0 0 64 64" fill="none">
        <path d="M32 16v31" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
        <path d="M21 16h22l-5-8H26l-5 8Z" fill="#111827" opacity=".82" />
        <rect x="22" y="48" width="20" height="5" rx="2.5" fill="#111827" opacity=".62" />
      </svg>
    );
  }

  return (
    <svg width="38" height="38" viewBox="0 0 64 64" fill="none">
      <rect x="15" y="14" width="34" height="38" rx="6" fill="#111827" opacity=".78" />
      <path d="M23 23h18M23 32h18M23 41h18" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function Scene({
  items,
  selectedId,
  onSelect,
  onMove,
  floor,
  wallColor,
}: {
  items: PlacedItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onMove: (id: string, position: [number, number, number]) => void;
  floor: typeof FLOOR_OPTIONS[number];
  wallColor: string;
}) {
  return (
    <>
      <color attach="background" args={["#e9eef5"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 7, 4]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -5]} intensity={0.6} />

      <Environment preset="apartment" />

      <Room floor={floor} wallColor={wallColor} />

      {items.map(item => (
        <DraggableКаталог
          key={item.instanceId}
          item={item}
          selected={item.instanceId === selectedId}
          onSelect={onSelect}
          onMove={onMove}
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

function Room({ floor, wallColor }: { floor: typeof FLOOR_OPTIONS[number]; wallColor: string }) {
  const floorTexture = useMemo(() => createFloorTexture(floor), [floor]);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial map={floorTexture} roughness={0.58} metalness={0.03} />
      </mesh>

      <mesh position={[0, 1.75, -3.5]} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      <mesh position={[-3.5, 1.75, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      <mesh position={[3.5, 1.75, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.04, -3.47]}>
        <boxGeometry args={[7, 0.08, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.65} />
      </mesh>

      <mesh position={[-3.47, 0.04, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[7, 0.08, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.65} />
      </mesh>

      <mesh position={[0.8, 2.12, -3.48]}>
        <boxGeometry args={[1.35, 1.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      <mesh position={[0.8, 2.12, -3.455]}>
        <planeGeometry args={[1.18, 0.88]} />
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
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, position: [number, number, number]) => void;
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

    return [
      THREE.MathUtils.clamp(point.x, -2.8, 2.8),
      0,
      THREE.MathUtils.clamp(point.z, -2.8, 2.8),
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
      <КаталогModel type={item.type} selected={selected} />

      {selected && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
          <ringGeometry args={[0.62, 0.72, 64]} />
          <meshBasicMaterial color="#2563eb" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function КаталогModel({ type, selected }: { type: string; selected: boolean }) {
  const fabric = new THREE.MeshStandardMaterial({ color: selected ? "#50617a" : "#8c8f94", roughness: 0.82 });
  const wood = new THREE.MeshStandardMaterial({ color: "#b88955", roughness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: "#111827", roughness: 0.45 });
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
