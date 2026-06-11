import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import NavBar from "../components/NavBar";
import { getProducts, type NormalizedProduct } from "../lib/formahausApi";
import { useCart } from "../context/CartContext";

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
  designerType: string;
  has3DModel: boolean;
  status: "draft" | "active" | "paused";
  createdAt: string;
};

type StoreProduct = {
  id: string;
  source: "api" | "vendor_local";
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  description: string;
  imageUrl: string;
  designerType: string;
  has3DModel: boolean;
  vendorName: string;
  rating: number;
  reviewsCount: number;
};

const LS_VENDOR_PRODUCTS = "formahaus_vendor_products";

const C = {
  bg: "#F7FAF7",
  surface: "#FFFFFF",
  surface2: "#F2FBF4",
  text: "#1F2A24",
  muted: "#64756A",
  line: "#E1EAE3",
  brand: "#2E9D51",
  brand2: "#256F3D",
  dark: "#0D1117",
  dark2: "#151C25",
  green: "#2E9D51",
  purple: "#7157D9",
  shadow: "0 22px 70px rgba(77, 54, 35, .14)",
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function loadVendorProducts(): VendorProduct[] {
  try {
    const raw = localStorage.getItem(LS_VENDOR_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function normalizeApiProduct(p: NormalizedProduct): StoreProduct {
  return {
    id: p.id,
    source: "api",
    name: p.nameUa,
    category: p.categoryName || p.categoryId || "Каталог",
    price: p.price,
    stock: p.stock ?? 1,
    description: p.descUa,
    imageUrl: p.imageUrl,
    designerType: p.designerType,
    has3DModel: p.has3DModel,
    vendorName: p.vendorName || "FormaHaus",
    rating: p.rating || 4.8,
    reviewsCount: p.reviewsCount || 0,
  };
}

function normalizeVendorProduct(p: VendorProduct): StoreProduct {
  return {
    id: p.id,
    source: "vendor_local",
    name: p.name,
    category: p.category,
    price: Number(p.price || 0),
    oldPrice: p.oldPrice,
    stock: Number(p.stock || 0),
    description: p.description,
    imageUrl: p.imageUrl,
    designerType: p.designerType,
    has3DModel: p.has3DModel,
    vendorName: p.vendorName || "Продавець",
    rating: 5,
    reviewsCount: 0,
  };
}

const marketplaceStats = [
  ["3D", "примірка товарів"],
  ["24 м²", "приклад кімнати"],
  ["1 клік", "замовити дизайн"],
];

const quickCategories = [
  { name: "Меблі", icon: "🛋", text: "дивани, шафи, столи" },
  { name: "Підлога", icon: "▱", text: "ламінат, плитка, паркет" },
  { name: "Стіни та обої", icon: "▦", text: "фарба, шпалери, панелі" },
  { name: "Освітлення", icon: "💡", text: "люстри, бра, торшери" },
];

export default function Home() {
  const cart = useCart();

  const [apiProducts, setApiProducts] = useState<StoreProduct[]>([]);
  const [vendorProducts, setVendorProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [only3d, setOnly3d] = useState(false);
  const [sort, setSort] = useState("new");

  function refreshVendorProducts() {
    const localProducts = loadVendorProducts()
      .filter((p) => p.status === "active")
      .map(normalizeVendorProduct);

    setVendorProducts(localProducts);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const data = await getProducts();
        if (!alive) return;
        setApiProducts(data.map(normalizeApiProduct));
      } catch (err) {
        console.error(err);
        if (alive) setApiProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    refreshVendorProducts();

    function onStorage() {
      refreshVendorProducts();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshVendorProducts);

    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshVendorProducts);
    };
  }, []);

  const allProducts = useMemo(() => {
    const map = new Map<string, StoreProduct>();
    for (const p of apiProducts) map.set(`api_${p.id}`, p);
    for (const p of vendorProducts) map.set(`vendor_${p.id}`, p);
    return Array.from(map.values());
  }, [apiProducts, vendorProducts]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)));
    return ["all", ...list];
  }, [allProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = allProducts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (only3d && !p.has3DModel) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });

    if (sort === "price_low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "stock") list = [...list].sort((a, b) => b.stock - a.stock);
    if (sort === "new") {
      list = [...list].sort(
        (a, b) => Number(b.source === "vendor_local") - Number(a.source === "vendor_local")
      );
    }

    return list;
  }, [allProducts, query, category, only3d, sort]);

  const projectTotal = filtered.slice(0, 4).reduce((sum, p) => sum + Number(p.price || 0), 0);

  function addToCart(product: StoreProduct) {
    if (product.stock <= 0) {
      alert("Товару немає в наявності");
      return;
    }

    cart.addItem({
      id: `${product.source}_${product.id}_${Date.now()}`,
      type: product.designerType || "product",
      label: product.name,
      price: product.price,
      icon: product.category,
    });

    alert("Товар додано в кошик");
  }

  return (
    <div className="fh-home-pro">
      <NavBar activePage="store" />

      <section className="fh-hero-pro">
        <div className="fh-hero-grid-pro">
          <div className="fh-hero-copy-pro">
            <div className="fh-eyebrow">FORMAHAUS MARKETPLACE + 3D ROOM PLANNER</div>
            <h1>Спроєктуйте інтер’єр і замовте всі товари в одному місці</h1>
            <p>
              Меблі, підлога, плитка, шпалери, освітлення та декор — у каталозі з 3D-приміркою,
              кошторисом і можливістю замовити весь дизайн одразу.
            </p>

            <div className="fh-hero-actions">
              <Link href="/designer" className="fh-primary-link">Відкрити 3D редактор</Link>
              <a href="#catalog" className="fh-secondary-link">Дивитися каталог</a>
            </div>

            <div className="fh-stats-row">
              {marketplaceStats.map(([value, label]) => (
                <div className="fh-stat" key={value}>
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fh-room-preview">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85"
              alt="FormaHaus 3D interior preview"
            />
            <div className="fh-preview-topbar">
              <span>Live room preview</span>
              <b>{allProducts.length} товарів</b>
            </div>
            <div className="fh-preview-card left">
              <b>AI дизайн</b>
              <span>Скандинавський · Modern · Loft</span>
            </div>
            <div className="fh-preview-card right">
              <b>{money(projectTotal)}</b>
              <span>приклад кошторису</span>
            </div>
          </div>
        </div>
      </section>

      <section className="fh-section-pro">
        <div className="fh-section-head-pro">
          <div>
            <span className="fh-mini-title">КАТЕГОРІЇ ДЛЯ ДИЗАЙНУ</span>
            <h2>Вибирайте не окремий товар, а готовий інтер’єр</h2>
          </div>
          <Link href="/designer" className="fh-text-link">Створити кімнату →</Link>
        </div>

        <div className="fh-category-grid-pro">
          {quickCategories.map((item) => (
            <button
              key={item.name}
              className="fh-category-card-pro"
              onClick={() => setCategory(item.name)}
            >
              <span>{item.icon}</span>
              <b>{item.name}</b>
              <small>{item.text}</small>
            </button>
          ))}
        </div>
      </section>

      <section id="catalog" className="fh-shop-layout-pro">
        <aside className="fh-shop-sidebar-pro">
          <div className="fh-panel-title">Каталог</div>
          <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>Всі товари</button>
          {categories.filter((c) => c !== "all").map((c) => (
            <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>
          ))}

          <div className="fh-side-divider" />

          <button className={only3d ? "active" : ""} onClick={() => setOnly3d((v) => !v)}>
            Тільки з 3D-моделлю
          </button>

          <Link href="/vendor/register" className="fh-seller-box">
            <b>Ви продавець?</b>
            <span>Додайте товари у FormaHaus</span>
          </Link>
        </aside>

        <main className="fh-catalog-main-pro">
          <div className="fh-catalog-toolbar-pro">
            <div>
              <span className="fh-mini-title">МАРКЕТПЛЕЙС</span>
              <h2>Товари для вашого проєкту</h2>
              <p>{loading ? "Завантаження..." : `Показано: ${filtered.length} з ${allProducts.length}`}</p>
            </div>

            <div className="fh-toolbar-controls-pro">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук: диван, ламінат, плитка..."
              />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="new">Нові</option>
                <option value="price_low">Дешевші</option>
                <option value="price_high">Дорожчі</option>
                <option value="stock">За наявністю</option>
              </select>
            </div>
          </div>

          {loading && allProducts.length === 0 ? (
            <div className="fh-empty-pro">Завантаження товарів...</div>
          ) : filtered.length === 0 ? (
            <div className="fh-empty-pro">
              <b>Товарів не знайдено</b>
              <span>Спробуйте змінити фільтри або пошук.</span>
            </div>
          ) : (
            <div className="fh-product-grid-pro">
              {filtered.map((product) => (
                <ProductCard key={`${product.source}_${product.id}`} product={product} onAdd={() => addToCart(product)} />
              ))}
            </div>
          )}
        </main>

        <aside className="fh-estimate-panel-pro">
          <div className="fh-panel-title">Кошторис дизайну</div>
          <div className="fh-estimate-room">
            <span>Кімната</span>
            <b>24 м²</b>
          </div>
          <EstimateRow label="Меблі" value={money(projectTotal)} />
          <EstimateRow label="Підлога" value="від 18 400 грн" />
          <EstimateRow label="Стіни та обої" value="від 9 200 грн" />
          <EstimateRow label="Освітлення" value="від 6 900 грн" />
          <div className="fh-estimate-total">
            <span>Разом</span>
            <b>{money(projectTotal + 34500)}</b>
          </div>
          <Link href="/designer" className="fh-order-design-btn">Зібрати дизайн у 3D</Link>
          <Link href="/cart" className="fh-cart-secondary-btn">Перейти до кошика</Link>
        </aside>
      </section>

      <section className="fh-ai-banner-pro">
        <div>
          <span className="fh-mini-title">AI DESIGN</span>
          <h2>FormaHaus підбере стиль, товари й кошторис автоматично</h2>
          <p>Почніть з кімнати, стилю та бюджету — система запропонує готовий інтер’єр.</p>
        </div>
        <Link href="/designer" className="fh-primary-link">Спробувати AI дизайн</Link>
      </section>

      <style>{styles}</style>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: StoreProduct; onAdd: () => void }) {
  return (
    <article className="fh-product-card-pro">
      <Link href={`/product/${product.id}`} className="fh-product-img-pro">
        <img src={product.imageUrl} alt={product.name} />
        <div className="fh-card-badges">
          {product.source === "vendor_local" && <span>Новинка</span>}
          {product.has3DModel && <span className="green">3D</span>}
        </div>
        <small>{product.stock > 0 ? `В наявності: ${product.stock}` : "Немає"}</small>
      </Link>

      <div className="fh-product-body-pro">
        <div className="fh-product-cat-pro">{product.category}</div>
        <Link href={`/product/${product.id}`} className="fh-product-name-pro">{product.name}</Link>
        <p>{product.description}</p>
        <div className="fh-vendor-line-pro">
          <span>{product.vendorName}</span>
          <b>⭐ {product.rating}</b>
        </div>
        <div className="fh-price-actions-pro">
          <strong>{money(product.price)}</strong>
          <button onClick={onAdd}>Купити</button>
        </div>
        <Link
          href={`/designer?productId=${product.id}&type=${product.designerType || "product"}`}
          className={product.has3DModel ? "fh-try-3d active" : "fh-try-3d"}
          aria-disabled={!product.has3DModel}
          onClick={(e) => {
            if (!product.has3DModel) e.preventDefault();
          }}
        >
          {product.has3DModel ? "Приміряти в 3D" : "3D модель очікується"}
        </Link>
      </div>
    </article>
  );
}

function EstimateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="fh-estimate-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

const styles = `
  .fh-home-pro { min-height:100vh; background:#F7FAF7; color:#1F2A24; font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
  .fh-hero-pro { padding:48px 18px 34px; background:radial-gradient(circle at 80% 15%,#FFFFFF 0,#F2FBF4 38%,#E7F4EA 100%); border-bottom:1px solid #E1EAE3; }
  .fh-hero-grid-pro { max-width:1280px; margin:0 auto; display:grid; grid-template-columns:minmax(0,.95fr) minmax(360px,1.05fr); gap:28px; align-items:center; }
  .fh-eyebrow,.fh-mini-title { display:inline-flex; align-items:center; gap:8px; color:#256F3D; background:#E8F6EC; border:1px solid #D7EEDC; border-radius:999px; padding:7px 12px; font-size:11px; font-weight:950; letter-spacing:.08em; }
  .fh-hero-copy-pro h1 { margin:18px 0 0; font-size:clamp(38px,5.4vw,72px); line-height:.97; letter-spacing:-3px; color:#1F2A24; font-weight:980; max-width:760px; }
  .fh-hero-copy-pro p { color:#64756A; font-size:18px; line-height:1.65; max-width:670px; margin:20px 0 0; }
  .fh-hero-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:26px; }
  .fh-primary-link,.fh-secondary-link,.fh-order-design-btn,.fh-cart-secondary-btn,.fh-text-link { text-decoration:none; display:inline-flex; align-items:center; justify-content:center; border-radius:16px; font-weight:950; }
  .fh-primary-link { background:#1F2A24; color:white; padding:15px 20px; box-shadow:0 18px 36px rgba(32,26,22,.18); }
  .fh-secondary-link { background:#FFFFFF; color:#256F3D; padding:15px 20px; border:1px solid #E1EAE3; }
  .fh-text-link { color:#256F3D; }
  .fh-stats-row { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:28px; max-width:570px; }
  .fh-stat { background:rgba(255,255,255,.72); border:1px solid #E1EAE3; border-radius:20px; padding:15px; box-shadow:0 14px 40px rgba(77,54,35,.08); }
  .fh-stat b { display:block; font-size:22px; color:#1F2A24; }
  .fh-stat span { color:#64756A; font-size:13px; font-weight:800; }
  .fh-room-preview { position:relative; height:520px; border-radius:34px; overflow:hidden; background:#111; box-shadow:0 30px 90px rgba(77,54,35,.22); border:1px solid rgba(255,255,255,.65); }
  .fh-room-preview img { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.05) contrast(1.02); }
  .fh-preview-topbar { position:absolute; top:18px; left:18px; right:18px; display:flex; justify-content:space-between; gap:12px; color:white; background:rgba(10,13,18,.48); border:1px solid rgba(255,255,255,.2); backdrop-filter:blur(14px); border-radius:18px; padding:14px 16px; }
  .fh-preview-card { position:absolute; background:rgba(255,255,255,.9); border:1px solid rgba(255,255,255,.65); backdrop-filter:blur(16px); border-radius:20px; padding:14px 16px; min-width:190px; box-shadow:0 20px 60px rgba(0,0,0,.12); }
  .fh-preview-card b { display:block; color:#1F2A24; font-size:18px; }
  .fh-preview-card span { color:#64756A; font-size:13px; font-weight:800; }
  .fh-preview-card.left { left:18px; bottom:18px; }
  .fh-preview-card.right { right:18px; bottom:18px; }
  .fh-section-pro { max-width:1280px; margin:0 auto; padding:34px 18px 18px; }
  .fh-section-head-pro { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:16px; }
  .fh-section-head-pro h2,.fh-catalog-toolbar-pro h2,.fh-ai-banner-pro h2 { margin:10px 0 0; font-size:clamp(26px,3.3vw,42px); line-height:1.05; letter-spacing:-1px; }
  .fh-category-grid-pro { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .fh-category-card-pro { text-align:left; border:1px solid #E1EAE3; background:#FFFFFF; border-radius:24px; padding:18px; cursor:pointer; box-shadow:0 18px 45px rgba(77,54,35,.08); transition:.2s; }
  .fh-category-card-pro:hover { transform:translateY(-3px); box-shadow:0 22px 58px rgba(77,54,35,.14); }
  .fh-category-card-pro span { width:54px; height:54px; display:grid; place-items:center; border-radius:18px; background:#E8F6EC; font-size:25px; margin-bottom:16px; }
  .fh-category-card-pro b { display:block; font-size:18px; color:#1F2A24; }
  .fh-category-card-pro small { display:block; color:#64756A; margin-top:6px; font-weight:800; }
  .fh-shop-layout-pro { max-width:1280px; margin:0 auto; padding:20px 18px 34px; display:grid; grid-template-columns:240px minmax(0,1fr) 310px; gap:16px; align-items:start; }
  .fh-shop-sidebar-pro,.fh-estimate-panel-pro,.fh-catalog-main-pro { background:#FFFFFF; border:1px solid #E1EAE3; border-radius:28px; box-shadow:0 18px 55px rgba(77,54,35,.08); }
  .fh-shop-sidebar-pro,.fh-estimate-panel-pro { padding:16px; position:sticky; top:16px; }
  .fh-panel-title { font-size:14px; color:#1F2A24; font-weight:950; letter-spacing:.06em; text-transform:uppercase; margin-bottom:12px; }
  .fh-shop-sidebar-pro button { width:100%; border:0; background:transparent; color:#64756A; text-align:left; border-radius:14px; padding:12px 12px; font-size:14px; font-weight:900; cursor:pointer; }
  .fh-shop-sidebar-pro button.active { background:#1F2A24; color:white; }
  .fh-side-divider { height:1px; background:#E1EAE3; margin:12px 0; }
  .fh-seller-box { display:block; text-decoration:none; background:#F2FBF4; border:1px solid #E1EAE3; border-radius:18px; padding:14px; color:#1F2A24; margin-top:14px; }
  .fh-seller-box b,.fh-seller-box span { display:block; }
  .fh-seller-box span { color:#64756A; font-size:13px; margin-top:4px; font-weight:800; }
  .fh-catalog-main-pro { padding:18px; }
  .fh-catalog-toolbar-pro { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom:18px; }
  .fh-catalog-toolbar-pro p { color:#64756A; margin:7px 0 0; font-weight:800; }
  .fh-toolbar-controls-pro { display:grid; grid-template-columns:minmax(220px,1fr) 150px; gap:10px; min-width:420px; }
  .fh-toolbar-controls-pro input,.fh-toolbar-controls-pro select { width:100%; box-sizing:border-box; border:1.5px solid #E1EAE3; background:#FFFFFF; border-radius:16px; padding:14px 13px; color:#1F2A24; outline:none; font-weight:850; }
  .fh-product-grid-pro { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
  .fh-product-card-pro { background:#FFFFFF; border:1px solid #E1EAE3; border-radius:24px; overflow:hidden; transition:.2s; }
  .fh-product-card-pro:hover { transform:translateY(-3px); box-shadow:0 18px 48px rgba(77,54,35,.12); }
  .fh-product-img-pro { position:relative; display:block; height:220px; background:#E8F6EC; overflow:hidden; text-decoration:none; }
  .fh-product-img-pro img { width:100%; height:100%; object-fit:cover; display:block; transition:.35s; }
  .fh-product-card-pro:hover img { transform:scale(1.04); }
  .fh-card-badges { position:absolute; left:12px; top:12px; display:flex; gap:7px; }
  .fh-card-badges span,.fh-product-img-pro small { background:rgba(255,255,255,.88); color:#1F2A24; border-radius:999px; padding:6px 9px; font-size:11px; font-weight:950; }
  .fh-card-badges .green { background:#E8F3E7; color:#2E8B4E; }
  .fh-product-img-pro small { position:absolute; right:12px; bottom:12px; }
  .fh-product-body-pro { padding:15px; }
  .fh-product-cat-pro { color:#256F3D; font-size:11px; font-weight:950; text-transform:uppercase; letter-spacing:.08em; }
  .fh-product-name-pro { display:block; color:#1F2A24; text-decoration:none; margin-top:7px; font-size:17px; line-height:1.25; font-weight:950; }
  .fh-product-body-pro p { color:#64756A; font-size:13px; line-height:1.45; margin:8px 0 12px; min-height:38px; }
  .fh-vendor-line-pro { display:flex; justify-content:space-between; color:#64756A; font-size:12px; font-weight:850; margin-bottom:12px; }
  .fh-price-actions-pro { display:flex; justify-content:space-between; gap:12px; align-items:center; }
  .fh-price-actions-pro strong { font-size:22px; color:#1F2A24; }
  .fh-price-actions-pro button { border:0; background:#1F2A24; color:white; border-radius:13px; padding:11px 13px; font-weight:950; cursor:pointer; }
  .fh-try-3d { margin-top:10px; width:100%; box-sizing:border-box; text-decoration:none; display:flex; justify-content:center; border-radius:13px; padding:12px 10px; background:#E8F6EC; color:#6C7B70; font-weight:950; opacity:.65; cursor:not-allowed; }
  .fh-try-3d.active { background:#E8F3E7; color:#2E8B4E; opacity:1; cursor:pointer; }
  .fh-estimate-room { background:#F2FBF4; border:1px solid #E1EAE3; border-radius:18px; padding:14px; display:flex; justify-content:space-between; margin-bottom:12px; }
  .fh-estimate-row,.fh-estimate-total { display:flex; justify-content:space-between; gap:12px; padding:11px 0; border-bottom:1px solid #EFE5DA; color:#64756A; font-size:13px; font-weight:850; }
  .fh-estimate-row b { color:#1F2A24; }
  .fh-estimate-total { border:0; margin:10px 0 12px; font-size:15px; color:#1F2A24; }
  .fh-estimate-total b { font-size:24px; }
  .fh-order-design-btn { width:100%; background:#1F2A24; color:white; padding:14px 10px; }
  .fh-cart-secondary-btn { width:100%; background:#F2FBF4; color:#256F3D; padding:13px 10px; margin-top:9px; border:1px solid #E1EAE3; }
  .fh-empty-pro { min-height:220px; display:grid; place-items:center; text-align:center; color:#64756A; background:#FFFFFF; border:1px dashed #D7EEDC; border-radius:22px; padding:24px; }
  .fh-empty-pro b,.fh-empty-pro span { display:block; }
  .fh-ai-banner-pro { max-width:1244px; margin:0 auto 48px; border-radius:30px; padding:28px; background:linear-gradient(135deg,#1F2A24,#245C38); color:white; display:flex; justify-content:space-between; gap:20px; align-items:center; box-shadow:0 24px 70px rgba(77,54,35,.18); }
  .fh-ai-banner-pro p { color:#E1EAE3; max-width:620px; line-height:1.6; }
  .fh-ai-banner-pro .fh-mini-title { background:rgba(255,255,255,.1); color:#F2FBF4; border-color:rgba(255,255,255,.16); }
  .fh-ai-banner-pro .fh-primary-link { background:#FFFFFF; color:#1F2A24; white-space:nowrap; }

  @media (max-width:1180px){
    .fh-hero-grid-pro{grid-template-columns:1fr;}
    .fh-room-preview{height:470px;}
    .fh-shop-layout-pro{grid-template-columns:220px minmax(0,1fr);}
    .fh-estimate-panel-pro{grid-column:1 / -1; position:static;}
    .fh-product-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr));}
  }
  @media (max-width:860px){
    .fh-hero-pro{padding-top:30px;}
    .fh-hero-copy-pro h1{font-size:clamp(34px,10vw,54px); letter-spacing:-2px;}
    .fh-room-preview{height:390px; border-radius:26px;}
    .fh-preview-card{min-width:0; max-width:190px;}
    .fh-section-head-pro,.fh-catalog-toolbar-pro,.fh-ai-banner-pro{align-items:flex-start; flex-direction:column;}
    .fh-category-grid-pro{grid-template-columns:repeat(2,1fr);}
    .fh-shop-layout-pro{grid-template-columns:1fr; padding-top:12px;}
    .fh-shop-sidebar-pro{position:static; display:flex; gap:8px; overflow:auto; border-radius:22px; padding:10px;}
    .fh-shop-sidebar-pro .fh-panel-title,.fh-shop-sidebar-pro .fh-side-divider,.fh-seller-box{display:none;}
    .fh-shop-sidebar-pro button{white-space:nowrap; width:auto; flex:0 0 auto; padding:11px 14px;}
    .fh-toolbar-controls-pro{min-width:0; width:100%; grid-template-columns:1fr;}
    .fh-product-grid-pro{grid-template-columns:1fr 1fr;}
    .fh-ai-banner-pro{margin-left:18px; margin-right:18px;}
  }
  @media (max-width:560px){
    .fh-hero-pro{padding-left:12px; padding-right:12px;}
    .fh-hero-copy-pro p{font-size:15px;}
    .fh-hero-actions{display:grid; grid-template-columns:1fr;}
    .fh-primary-link,.fh-secondary-link{width:100%; box-sizing:border-box;}
    .fh-stats-row{grid-template-columns:1fr;}
    .fh-room-preview{height:310px; border-radius:22px;}
    .fh-preview-topbar{top:10px; left:10px; right:10px; padding:10px 12px; font-size:12px;}
    .fh-preview-card{padding:10px 12px; border-radius:15px; max-width:150px;}
    .fh-preview-card.right{display:none;}
    .fh-section-pro{padding-left:12px; padding-right:12px;}
    .fh-category-grid-pro{grid-template-columns:1fr;}
    .fh-shop-layout-pro{padding-left:12px; padding-right:12px;}
    .fh-catalog-main-pro{padding:12px; border-radius:22px;}
    .fh-product-grid-pro{grid-template-columns:1fr;}
    .fh-product-img-pro{height:230px;}
    .fh-estimate-panel-pro{border-radius:22px;}
    .fh-ai-banner-pro{margin:0 12px 34px; padding:20px; border-radius:24px;}
  }
`;
