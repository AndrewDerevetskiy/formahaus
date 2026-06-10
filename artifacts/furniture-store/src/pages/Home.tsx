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
  bg: "#FBF8F3",
  bgSoft: "#F6EFE7",
  card: "#FFFFFF",
  text: "#2F2A25",
  muted: "#756B61",
  border: "#EADFD2",
  primary: "#B78B66",
  primaryDark: "#8D674B",
  primarySoft: "#EFE0D1",
  accent: "#9EA889",
  accentSoft: "#EDF1E7",
  dark: "#342C25",
  shadow: "0 18px 55px rgba(80,55,35,.10)",
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>
      <NavBar activePage="store" />

      <section style={hero}>
        <div style={heroGrid} className="home-hero-grid">
          <div>
            <div style={badge}>ДИЗАЙН КІМНАТИ + ПОКУПКА В ОДНОМУ МІСЦІ</div>

            <h1 style={heroTitle}>
              Оберіть меблі, підлогу й освітлення та побачте кімнату в 3D перед покупкою
            </h1>

            <p style={heroText}>
              Створіть інтер’єр онлайн, приміряйте ламінат, плитку, стіни, меблі та одразу замовте все, що сподобалося.
            </p>

            <div style={heroPoints}>
              <Point text="3D примірка підлоги, меблів і стін" />
              <Point text="Каталог товарів для ремонту та інтер’єру" />
              <Point text="Оформлення замовлення з доставкою" />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }} className="mobile-full-buttons">
              <Link href="/designer" style={{ textDecoration: "none" }}>
                <button style={primaryBtn}>Створити дизайн кімнати</button>
              </Link>

              <a href="#catalog" style={{ textDecoration: "none" }}>
                <button style={secondaryBtn}>Перейти до покупок</button>
              </a>
            </div>
          </div>

          <div style={heroImageWrap}>
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
              alt="FormaHaus interior"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            <div style={heroFloat}>
              <div>
                <b>{allProducts.length} товарів</b>
                <span>меблі · підлога · плитка · освітлення · обої</span>
              </div>
              <Link href="/designer" style={{ textDecoration: "none" }}>
                <button style={miniBtn}>У 3D</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={howItWorks}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div style={sectionCenter}>
            <div style={softBadge}>ЯК ЦЕ ПРАЦЮЄ</div>
            <h2 style={sectionMainTitle}>Спочатку побачте результат, потім купуйте</h2>
            <p style={sectionMainText}>
              FormaHaus допомагає не просто вибрати товар, а зрозуміти, як він виглядатиме у вашій кімнаті.
            </p>
          </div>

          <div style={stepsGrid}>
            <Step number="01" title="Створіть кімнату" text="Відкрийте 3D редактор і оберіть стиль простору." />
            <Step number="02" title="Приміряйте товари" text="Додайте ламінат, плитку, меблі, світло та колір стін." />
            <Step number="03" title="Замовте все разом" text="Усі вибрані товари переходять у кошик для оформлення." />
          </div>
        </div>
      </section>

      <section id="catalog" style={{ maxWidth: 1220, margin: "0 auto", padding: "42px 18px 78px" }}>
        <div style={sectionHead}>
          <div>
            <div style={softBadge}>КАТАЛОГ ДЛЯ ПОКУПЦЯ</div>
            <h2 style={sectionTitle}>Оберіть товари для вашої кімнати</h2>
            <p style={sectionSub}>
              {loading ? "Завантаження..." : `Показано: ${filtered.length} з ${allProducts.length}`}
            </p>
          </div>

          <Link href="/designer" style={{ textDecoration: "none" }}>
            <button style={secondaryBtn}>Відкрити 3D примірку</button>
          </Link>
        </div>

        <div style={filters} className="home-filters">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук: диван, ламінат, плитка, світло, обої..."
            style={input}
          />

          <select value={sort} onChange={(e) => setSort(e.target.value)} style={input}>
            <option value="new">Спочатку нові товари</option>
            <option value="price_low">Дешевші</option>
            <option value="price_high">Дорожчі</option>
            <option value="stock">За наявністю</option>
          </select>

          <button
            onClick={() => setOnly3d((v) => !v)}
            style={{
              ...secondaryBtn,
              background: only3d ? C.primarySoft : C.card,
              color: only3d ? C.primaryDark : C.text,
              whiteSpace: "nowrap",
            }}
          >
            Тільки 3D
          </button>
        </div>

        <div style={categoryRow}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={category === c ? categoryActive : categoryBtn}
            >
              {c === "all" ? "Всі товари" : c}
            </button>
          ))}
        </div>

        {loading && allProducts.length === 0 ? (
          <div style={empty}>Завантаження товарів...</div>
        ) : filtered.length === 0 ? (
          <div style={empty}>
            <b>Товарів не знайдено</b>
            <p>Спробуйте іншу категорію або змініть фільтри.</p>
          </div>
        ) : (
          <div style={grid}>
            {filtered.map((product) => (
              <ProductCard
                key={`${product.source}_${product.id}`}
                product={product}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </section>

      <section style={ctaSection}>
        <div style={ctaCard}>
          <div>
            <h2 style={ctaTitle}>Не впевнені, що підійде до кімнати?</h2>
            <p style={ctaText}>
              Відкрийте 3D редактор, приміряйте підлогу, меблі, освітлення та оформіть покупку тільки після того, як побачите результат.
            </p>
          </div>

          <Link href="/designer" style={{ textDecoration: "none" }}>
            <button style={primaryBtn}>Спробувати в 3D</button>
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .home-hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .home-filters { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Point({ text }: { text: string }) {
  return (
    <div style={point}>
      <span>✓</span>
      <b>{text}</b>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article style={stepCard}>
      <div style={stepNumber}>{number}</div>
      <h3 style={stepTitle}>{title}</h3>
      <p style={stepText}>{text}</p>
    </article>
  );
}

function ProductCard({ product, onAdd }: { product: StoreProduct; onAdd: () => void }) {
  return (
    <article style={card}>
      <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={imageWrap}>
          <img src={product.imageUrl} alt={product.name} style={image} />

          <div style={badges}>
            {product.source === "vendor_local" && <span style={topBadge}>Новинка</span>}
            {product.has3DModel && <span style={badge3d}>3D</span>}
          </div>

          <div style={stockBadge}>
            {product.stock > 0 ? `В наявності: ${product.stock}` : "Немає"}
          </div>
        </div>
      </Link>

      <div style={cardBody}>
        <div style={cat}>{product.category}</div>

        <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
          <h3 style={cardTitle}>{product.name}</h3>
        </Link>

        <p style={desc}>{product.description}</p>

        <div style={vendorLine}>
          <span>Продавець: <b>{product.vendorName}</b></span>
          <span>⭐ {product.rating}</span>
        </div>

        <div style={priceRow}>
          <div>
            {product.oldPrice && <div style={oldPrice}>{money(product.oldPrice)}</div>}
            <div style={price}>{money(product.price)}</div>
          </div>

          <div style={{ textAlign: "right", color: C.muted, fontSize: 12, fontWeight: 800 }}>
            {product.reviewsCount} відгуків
          </div>
        </div>

        <div style={actions}>
          <button onClick={onAdd} style={buyBtn}>
            Купити
          </button>

          <Link href={`/designer?productId=${product.id}&type=${product.designerType || "product"}`} style={{ textDecoration: "none" }}>
            <button
              disabled={!product.has3DModel}
              style={{
                ...threeBtn,
                opacity: product.has3DModel ? 1 : 0.45,
                cursor: product.has3DModel ? "pointer" : "not-allowed",
              }}
            >
              Приміряти в 3D
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}

const hero: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.bg}, ${C.bgSoft}, #FFFFFF)`,
  borderBottom: `1px solid ${C.border}`,
  padding: "56px 18px 44px",
};

const heroGrid: React.CSSProperties = {
  maxWidth: 1220,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1.02fr .98fr",
  gap: 34,
  alignItems: "center",
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  background: C.primarySoft,
  color: C.primaryDark,
  borderRadius: 999,
  padding: "7px 13px",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 1,
  marginBottom: 16,
};

const softBadge: React.CSSProperties = {
  display: "inline-flex",
  background: C.accentSoft,
  color: "#69765C",
  borderRadius: 999,
  padding: "7px 13px",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 1,
  marginBottom: 12,
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: "clamp(34px,5vw,62px)",
  lineHeight: 1.04,
  fontWeight: 950,
  letterSpacing: "-2px",
};

const heroText: React.CSSProperties = {
  color: C.muted,
  fontSize: 17,
  lineHeight: 1.7,
  margin: "20px 0 0",
  maxWidth: 650,
};

const heroPoints: React.CSSProperties = {
  display: "grid",
  gap: 9,
  marginTop: 20,
};

const point: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: C.text,
  fontSize: 14,
};

const heroImageWrap: React.CSSProperties = {
  position: "relative",
  height: 430,
  borderRadius: 32,
  overflow: "hidden",
  boxShadow: C.shadow,
  background: C.card,
  border: `1px solid ${C.border}`,
};

const heroFloat: React.CSSProperties = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 18,
  background: "rgba(255,255,255,.90)",
  backdropFilter: "blur(14px)",
  borderRadius: 20,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  color: C.text,
  border: `1px solid ${C.border}`,
};

const howItWorks: React.CSSProperties = {
  padding: "46px 18px",
  background: "#FFFFFF",
  borderBottom: `1px solid ${C.border}`,
};

const sectionCenter: React.CSSProperties = {
  textAlign: "center",
  maxWidth: 720,
  margin: "0 auto 26px",
};

const sectionMainTitle: React.CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: "clamp(28px,4vw,42px)",
  fontWeight: 950,
};

const sectionMainText: React.CSSProperties = {
  color: C.muted,
  fontSize: 16,
  lineHeight: 1.65,
  margin: "10px 0 0",
};

const stepsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
  gap: 14,
};

const stepCard: React.CSSProperties = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 24,
  padding: 20,
  boxShadow: C.shadow,
};

const stepNumber: React.CSSProperties = {
  color: C.primary,
  fontSize: 13,
  fontWeight: 950,
  marginBottom: 12,
};

const stepTitle: React.CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: 20,
  fontWeight: 950,
};

const stepText: React.CSSProperties = {
  color: C.muted,
  fontSize: 14,
  lineHeight: 1.55,
  margin: "8px 0 0",
};

const sectionHead: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-end",
  flexWrap: "wrap",
  marginBottom: 18,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: 34,
  fontWeight: 950,
};

const sectionSub: React.CSSProperties = {
  color: C.muted,
  margin: "7px 0 0",
  fontSize: 14,
};

const filters: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 230px auto",
  gap: 10,
  marginBottom: 12,
};

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1.5px solid ${C.border}`,
  borderRadius: 14,
  padding: "13px 14px",
  fontSize: 14,
  background: C.card,
  color: C.text,
  outline: "none",
};

const categoryRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 22,
};

const categoryBtn: React.CSSProperties = {
  background: C.card,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 999,
  padding: "9px 13px",
  fontSize: 13,
  fontWeight: 850,
  cursor: "pointer",
};

const categoryActive: React.CSSProperties = {
  ...categoryBtn,
  background: C.primary,
  color: "#fff",
  borderColor: C.primary,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: C.shadow,
};

const imageWrap: React.CSSProperties = {
  position: "relative",
  aspectRatio: "1.18",
  background: C.bgSoft,
  overflow: "hidden",
};

const image: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const badges: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const topBadge: React.CSSProperties = {
  background: C.primarySoft,
  color: C.primaryDark,
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 11,
  fontWeight: 950,
};

const badge3d: React.CSSProperties = {
  background: C.accentSoft,
  color: "#69765C",
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 11,
  fontWeight: 950,
};

const stockBadge: React.CSSProperties = {
  position: "absolute",
  right: 10,
  bottom: 10,
  background: "rgba(52,44,37,.78)",
  color: "#fff",
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 11,
  fontWeight: 900,
};

const cardBody: React.CSSProperties = {
  padding: 16,
};

const cat: React.CSSProperties = {
  color: C.primaryDark,
  fontSize: 12,
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 6,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: 17,
  fontWeight: 950,
  lineHeight: 1.25,
};

const desc: React.CSSProperties = {
  color: C.muted,
  fontSize: 13,
  lineHeight: 1.45,
  margin: "7px 0 12px",
};

const vendorLine: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  color: C.muted,
  fontSize: 12,
  marginBottom: 12,
};

const priceRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-end",
  marginBottom: 14,
};

const oldPrice: React.CSSProperties = {
  color: "#A79B8E",
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "line-through",
};

const price: React.CSSProperties = {
  color: C.text,
  fontSize: 24,
  fontWeight: 950,
};

const actions: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const buyBtn: React.CSSProperties = {
  background: C.primary,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 10px",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
};

const threeBtn: React.CSSProperties = {
  width: "100%",
  background: C.card,
  color: C.primaryDark,
  border: `1.5px solid ${C.border}`,
  borderRadius: 12,
  padding: "12px 10px",
  fontSize: 14,
  fontWeight: 950,
};

const primaryBtn: React.CSSProperties = {
  background: C.primary,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(183,139,102,.24)",
};

const secondaryBtn: React.CSSProperties = {
  background: C.card,
  color: C.primaryDark,
  border: `1.5px solid ${C.border}`,
  borderRadius: 14,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 950,
  cursor: "pointer",
};

const miniBtn: React.CSSProperties = {
  background: C.dark,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "11px 15px",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
};

const empty: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 22,
  padding: "52px 18px",
  textAlign: "center",
  color: C.muted,
};

const ctaSection: React.CSSProperties = {
  padding: "0 18px 70px",
  background: C.bg,
};

const ctaCard: React.CSSProperties = {
  maxWidth: 1220,
  margin: "0 auto",
  background: `linear-gradient(135deg, ${C.dark}, #5A4636)`,
  color: "#fff",
  borderRadius: 30,
  padding: 28,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "center",
  flexWrap: "wrap",
  boxShadow: C.shadow,
};

const ctaTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(26px,4vw,42px)",
  fontWeight: 950,
};

const ctaText: React.CSSProperties = {
  color: "#E8D8CA",
  fontSize: 15,
  lineHeight: 1.65,
  margin: "10px 0 0",
  maxWidth: 680,
};

const darkBtn: React.CSSProperties = {
  background: C.dark,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 950,
  cursor: "pointer",
};
