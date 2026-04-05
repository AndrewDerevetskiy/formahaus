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
  category_name: string;
  designer_type: string;
  vendor_name: string;
  model_path: string;
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

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${productId}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />
      <div style={{ textAlign: "center", padding: 120, color: "#888" }}>Завантаження...</div>
    </div>
  );

  if (!product) return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />
      <div style={{ textAlign: "center", padding: 120, color: "#888" }}>Товар не знайдено</div>
    </div>
  );

  const imgSrc = product.image_url?.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`;

  function handleAddToCart() {
    addItem({
      id: String(product!.id),
      type: product!.designer_type || "furniture",
      label: product!.name,
      price: Number(product!.price),
      icon: "🛋️",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <Link href="/"><span style={{ fontSize: 14, color: "#888", cursor: "pointer", textDecoration: "none" }}>Головна</span></Link>
          <span style={{ color: "#ccc" }}>›</span>
          <Link href={`/category/${product.category_id}`}><span style={{ fontSize: 14, color: "#888", cursor: "pointer", textDecoration: "none" }}>{product.category_name || product.category_id}</span></Link>
          <span style={{ color: "#ccc" }}>›</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{product.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          {/* Left: image */}
          <div style={{ borderRadius: 20, overflow: "hidden", background: "#F7F6F4", aspectRatio: "1" }}>
            <img
              src={imgSrc}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=70"; }}
            />
          </div>

          {/* Right: info */}
          <div>
            {product.vendor_name && (
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#2563EB", marginBottom: 12 }}>{product.vendor_name}</div>
            )}
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", margin: "0 0 16px", lineHeight: 1.2 }}>{product.name}</h1>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, margin: "0 0 28px" }}>{product.description}</p>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#111", margin: "0 0 36px" }}>${Number(product.price).toLocaleString()}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleAddToCart}
                style={{ height: 52, borderRadius: 12, background: added ? "#16A34A" : "#2563EB", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "background .2s" }}
              >
                {added ? "✓ Додано в кошик" : "Додати в кошик"}
              </button>
              <Link href={product.designer_type ? `/designer?add=${product.designer_type}` : "/designer"}>
                <button style={{ height: 52, borderRadius: 12, background: "#fff", color: "#111", border: "1.5px solid #E0E0E0", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span>⬡</span> Приміряти в 3D
                </button>
              </Link>
            </div>

            {product.vendor_name && (
              <div style={{ marginTop: 32, padding: "16px 20px", background: "#F7F7F7", borderRadius: 12 }}>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Продавець</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{product.vendor_name}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
