import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
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
      <NavBar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36, fontSize: 14 }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>Магазин</Link>
          <span style={{ color: "#DDD" }}>›</span>
          <span style={{ color: "#111", fontWeight: 600 }}>{category?.name_uk || categoryId}</span>
        </nav>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>
          {category?.name_uk || "Категорія"}
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 36px" }}>
          {loading ? "Завантаження..." : `${products.length} товар${products.length === 1 ? "" : products.length < 5 ? "и" : "ів"}`}
        </p>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ background: "#F0F0F0", borderRadius: 16, aspectRatio: "3/4", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#333" }}>Товарів поки немає</div>
            <div style={{ fontSize: 14, marginBottom: 24 }}>Продавці ще не додали товари в цю категорію</div>
            <Link href="/" style={{ color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>← Повернутись до каталогу</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
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
        <div style={{ background: "#F7F6F4", aspectRatio: "1.2", overflow: "hidden", position: "relative" }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hov ? "scale(1.06)" : "scale(1)" }}
            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=60"; }}
          />
          {product.designer_type && hov && (
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <span style={{ background: "rgba(255,255,255,.92)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#2563EB" }}>⬡ 3D</span>
            </div>
          )}
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            {product.category_name || product.category_id}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.description}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>${Number(product.price).toLocaleString()}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", background: "#EEF2FF", borderRadius: 8, padding: "4px 12px" }}>Детальніше →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
