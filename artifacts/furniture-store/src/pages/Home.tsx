import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { API_BASE } from "../lib/api";
import NavBar from "../components/NavBar";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  category_name: string;
  designer_type: string;
  vendor_name: string;
}

interface Category { id: string; name_uk: string; }

/* ─── hero ─── */
function Hero() {
  return (
    <section style={{ background: "#fff", padding: "64px 32px 48px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: "#EEF2FF", color: "#2563EB", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 999, padding: "4px 14px", marginBottom: 20 }}>
            Меблевий маркетплейс
          </div>
          <h1 style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: 900, color: "#111", lineHeight: 1.1, margin: "0 0 18px" }}>
            Меблі, які<br />дизайнери люблять
          </h1>
          <p style={{ fontSize: 16, color: "#777", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 400 }}>
            Вибирайте меблі з перевіреного каталогу — і приміряйте їх у своєму просторі прямо в браузері.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="#catalog" style={{ textDecoration: "none" }}>
              <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Переглянути каталог
              </button>
            </a>
            <Link href="/designer" style={{ textDecoration: "none" }}>
              <button style={{ background: "#fff", color: "#111", border: "1.5px solid #E0E0E0", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span>⬡</span> 3D Конструктор
              </button>
            </Link>
          </div>
        </div>
        <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 20px 60px rgba(0,0,0,.09)" }}>
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
            alt="Modern living room"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── catalog ─── */
function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback((catId: string) => {
    setLoading(true);
    const url = catId === "all"
      ? `${API_BASE}/api/products`
      : `${API_BASE}/api/products?category=${catId}`;
    fetch(url)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
    loadProducts("all");
  }, [loadProducts]);

  function handleCategory(id: string) {
    setActiveCategory(id);
    loadProducts(id);
  }

  return (
    <section id="catalog" style={{ background: "#FAFAFA", padding: "56px 32px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111", margin: 0 }}>Каталог товарів</h2>
            <p style={{ fontSize: 14, color: "#888", margin: "6px 0 0" }}>
              {loading ? "Завантаження..." : `${products.length} товар${products.length === 1 ? "" : products.length < 5 ? "и" : "ів"}`}
            </p>
          </div>
        </div>

        {/* Category filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {[{ id: "all", name_uk: "Всі товари" }, ...categories].map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? "#2563EB" : "#fff",
                color: activeCategory === cat.id ? "#fff" : "#555",
                border: `1.5px solid ${activeCategory === cat.id ? "#2563EB" : "#E5E5E5"}`,
                borderRadius: 999,
                padding: "7px 18px",
                fontSize: 13,
                fontWeight: activeCategory === cat.id ? 700 : 500,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {cat.name_uk}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
            {[0,1,2,3,4,5,6,7].map(i => (
              <div key={i} style={{ background: "#F0F0F0", borderRadius: 16, aspectRatio: "3/4", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Товарів поки немає</div>
            <div style={{ fontSize: 14 }}>Продавці ще не додали товари в цю категорію</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [hov, setHov] = useState(false);
  const imgSrc = product.image_url?.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`;

  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
      <article
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid #EBEBEB",
          cursor: "pointer",
          transition: "transform .2s, box-shadow .2s",
          transform: hov ? "translateY(-4px)" : "none",
          boxShadow: hov ? "0 12px 40px rgba(0,0,0,.10)" : "0 1px 4px rgba(0,0,0,.04)",
        }}
      >
        {/* Image */}
        <div style={{ background: "#F7F6F4", aspectRatio: "1.2", overflow: "hidden", position: "relative" }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hov ? "scale(1.06)" : "scale(1)" }}
            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=60"; }}
          />
          {product.designer_type && hov && (
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <span style={{ background: "rgba(255,255,255,.92)", backdropFilter: "blur(4px)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#2563EB", boxShadow: "0 2px 8px rgba(0,0,0,.10)" }}>
                ⬡ 3D
              </span>
            </div>
          )}
          {product.vendor_name && (
            <div style={{ position: "absolute", bottom: 10, left: 10 }}>
              <span style={{ background: "rgba(0,0,0,.55)", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600, color: "#fff", backdropFilter: "blur(4px)" }}>
                {product.vendor_name}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            {product.category_name || product.category_id}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4, lineHeight: 1.3 }}>
            {product.name}
          </div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 14, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.description}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>
              ${Number(product.price).toLocaleString()}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", background: "#EEF2FF", borderRadius: 8, padding: "4px 12px" }}>
              Детальніше →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── vendor CTA ─── */
function VendorCTA() {
  return (
    <section style={{ background: "#fff", padding: "64px 32px", fontFamily: "'Inter',system-ui,sans-serif", borderTop: "1px solid #F0F0F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111", margin: "0 0 10px" }}>
            Ви виробник або продавець меблів?
          </h2>
          <p style={{ color: "#666", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            Зареєструйтесь і розміщуйте свої товари у FormaHaus. Покупці побачать їх одразу після публікації.
          </p>
        </div>
        <Link href="/vendor/register" style={{ textDecoration: "none", flexShrink: 0 }}>
          <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 12, padding: "14px 30px", fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            Стати продавцем →
          </button>
        </Link>
      </div>
    </section>
  );
}

/* ─── page ─── */
export default function Home() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <NavBar activePage="store" />
      <Hero />
      <Catalog />
      <VendorCTA />
    </div>
  );
}
