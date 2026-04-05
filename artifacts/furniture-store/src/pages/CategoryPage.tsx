import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  designer_type: string;
  vendor_name: string;
}

interface Category {
  id: string;
  name_uk: string;
}

function Header() {
  const { itemCount } = useCart();
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", position: "sticky", top: 0, zIndex: 50, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center" }}>
        <Link href="/"><span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, color: "#111", cursor: "pointer", userSelect: "none", textDecoration: "none" }}>FORMA<span style={{ fontWeight: 300, color: "#2563EB" }}>HAUS</span></span></Link>
        <nav style={{ display: "flex", gap: 28, margin: "0 auto" }}>
          <Link href="/" style={{ fontSize: 14, fontWeight: 400, color: "#888", textDecoration: "none" }}>Home</Link>
          <a href="/#catalog" style={{ fontSize: 14, fontWeight: 600, color: "#111", textDecoration: "none" }}>Catalog</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/cart">
            <button style={{ position: "relative", background: "none", border: "1px solid #E5E5E5", borderRadius: 8, padding: "6px 16px", fontSize: 14, fontWeight: 500, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              🛒 Кошик
              {itemCount > 0 && <span style={{ background: "#2563EB", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>{itemCount}</span>}
            </button>
          </Link>
          <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "7px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Login</button>
        </div>
      </div>
    </header>
  );
}

export default function CategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/products?category=${categoryId}`).then(r => r.json()),
      fetch(`${API_BASE}/api/categories`).then(r => r.json()),
    ]).then(([prods, cats]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      const found = Array.isArray(cats) ? cats.find((c: Category) => c.id === categoryId) : null;
      setCategory(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [categoryId]);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href="/"><span style={{ fontSize: 14, color: "#888", cursor: "pointer", textDecoration: "none" }}>Головна</span></Link>
          <span style={{ color: "#ccc" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{category?.name_uk || categoryId}</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: "0 0 32px" }}>{category?.name_uk || "Категорія"}</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888", fontSize: 16 }}>Завантаження...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888", fontSize: 16 }}>Товарів поки немає</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [hov, setHov] = useState(false);
  const imgSrc = product.image_url?.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`;
  return (
    <Link href={`/product/${product.id}`}>
      <article
        style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s, transform .2s", boxShadow: hov ? "0 8px 32px rgba(0,0,0,.09)" : "none", transform: hov ? "translateY(-2px)" : "none" }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div style={{ background: "#F7F6F4", aspectRatio: "1", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={imgSrc} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=60"; }} />
        </div>
        <div style={{ padding: "16px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.description}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#2563EB" }}>${Number(product.price).toLocaleString()}</div>
        </div>
      </article>
    </Link>
  );
}
