import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";

interface Category { id: string; name_uk: string; image_url: string; }

/* ─── static fallback if API not ready ─── */
const FALLBACK_CATEGORIES: Category[] = [
  { id: "tables",   name_uk: "Столи",      image_url: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80" },
  { id: "chairs",   name_uk: "Крісла",     image_url: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80" },
  { id: "lighting", name_uk: "Освітлення", image_url: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80" },
  { id: "decor",    name_uk: "Оздоблення", image_url: "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=600&q=80" },
];

/* ─── nav ─── */
function Nav() {
  const { itemCount } = useCart();
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", position: "sticky", top: 0, zIndex: 50, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center" }}>
        <Link href="/">
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, color: "#111", cursor: "pointer", userSelect: "none", textDecoration: "none" }}>
            FORMA<span style={{ fontWeight: 300, color: "#2563EB" }}>HAUS</span>
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 28, margin: "0 auto" }}>
          <a href="/" style={{ fontSize: 14, fontWeight: 600, color: "#111", textDecoration: "none" }}>Home</a>
          <a href="#catalog" style={{ fontSize: 14, fontWeight: 400, color: "#888", textDecoration: "none" }}>Catalog</a>
          <Link href="/vendor/dashboard" style={{ fontSize: 14, fontWeight: 400, color: "#888", textDecoration: "none" }}>Продавцям</Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/cart">
            <button style={{ position: "relative", background: "none", border: "1px solid #E5E5E5", borderRadius: 8, padding: "6px 16px", fontSize: 14, fontWeight: 500, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              🛒 Кошик
              {itemCount > 0 && (
                <span style={{ background: "#2563EB", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{itemCount}</span>
              )}
            </button>
          </Link>
          <Link href="/vendor/register">
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "7px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Login</button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── hero ─── */
function Hero() {
  return (
    <section style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", padding: "72px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "clamp(36px,4vw,54px)", fontWeight: 900, color: "#111", lineHeight: 1.1, margin: "0 0 16px" }}>
            Меблі, які<br />дизайнери люблять
          </h1>
          <p style={{ fontSize: 16, color: "#777", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 360 }}>
            Обирай меблі для кухні, кімнати чи вітальні у нашому магазині
          </p>
          <a href="#catalog" style={{ textDecoration: "none" }}>
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              View catalog
            </button>
          </a>
        </div>
        <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", background: "#F5F0E8" }}>
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
function CatalogGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(data => { setCategories(Array.isArray(data) && data.length ? data : FALLBACK_CATEGORIES); setLoading(false); })
      .catch(() => { setCategories(FALLBACK_CATEGORIES); setLoading(false); });
  }, []);

  return (
    <section id="catalog" style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", padding: "24px 32px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 28px" }}>Каталог</h2>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ background: "#F5F5F5", borderRadius: 16, aspectRatio: "1", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {categories.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={`/category/${cat.id}`}>
      <article
        style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s, transform .2s", boxShadow: hov ? "0 8px 32px rgba(0,0,0,.08)" : "none", transform: hov ? "translateY(-2px)" : "none" }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div style={{ background: "#F7F6F4", aspectRatio: "1", overflow: "hidden", position: "relative" }}>
          <img
            src={cat.image_url}
            alt={cat.name_uk}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hov ? "scale(1.04)" : "scale(1)" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {hov && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.18)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 12 }}>
              <span style={{ background: "#fff", borderRadius: 999, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#111", boxShadow: "0 2px 12px rgba(0,0,0,.14)" }}>Переглянути →</span>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{cat.name_uk}</div>
        </div>
      </article>
    </Link>
  );
}

/* ─── vendor CTA ─── */
function VendorCTA() {
  return (
    <section style={{ background: "#F8F9FF", fontFamily: "'Inter',system-ui,sans-serif", padding: "64px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>Ви виробник або продавець меблів?</h2>
          <p style={{ color: "#666", fontSize: 15, margin: 0 }}>Зареєструйтесь і розміщуйте свої товари на FormaHaus. Безкоштовно.</p>
        </div>
        <Link href="/vendor/register">
          <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
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
      <Nav />
      <Hero />
      <CatalogGrid />
      <VendorCTA />
    </div>
  );
}
