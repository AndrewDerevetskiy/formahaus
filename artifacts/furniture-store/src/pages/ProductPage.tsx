import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useCart } from "../context/CartContext";
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
  model_path: string;
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
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

  function handleAddToCart() {
    if (!product) return;
    addItem({
      id: String(product.id),
      type: product.designer_type || "furniture",
      label: product.name,
      price: Number(product.price),
      icon: "🛋️",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleTry3D() {
    if (!product) return;
    const target = product.designer_type
      ? `/designer?add=${encodeURIComponent(product.designer_type)}`
      : "/designer";
    navigate(target);
  }

  if (loading) return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 32px" }}>
        <SkeletonDetail />
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <NavBar />
      <div style={{ textAlign: "center", padding: 120, color: "#888" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 8 }}>Товар не знайдено</div>
        <Link href="/" style={{ color: "#2563EB", fontSize: 14 }}>← Повернутись до каталогу</Link>
      </div>
    </div>
  );

  const imgSrc = product.image_url?.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <NavBar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40, fontSize: 14 }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none" }}>Магазин</Link>
          <span style={{ color: "#DDD" }}>›</span>
          <Link href={`/category/${product.category_id}`} style={{ color: "#888", textDecoration: "none" }}>
            {product.category_name || product.category_id}
          </Link>
          <span style={{ color: "#DDD" }}>›</span>
          <span style={{ color: "#111", fontWeight: 600 }}>{product.name}</span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }}>
          {/* Left: image */}
          <div style={{ borderRadius: 24, overflow: "hidden", background: "#F7F6F4", aspectRatio: "1", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>
            <img
              src={imgSrc}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=70"; }}
            />
          </div>

          {/* Right: info */}
          <div style={{ paddingTop: 8 }}>
            {product.vendor_name && (
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#2563EB", marginBottom: 14 }}>
                {product.vendor_name}
              </div>
            )}

            <h1 style={{ fontSize: 34, fontWeight: 900, color: "#111", margin: "0 0 12px", lineHeight: 1.15 }}>
              {product.name}
            </h1>

            <div style={{ fontSize: 13, color: "#2563EB", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 18 }}>
              {product.category_name || product.category_id}
            </div>

            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.75, margin: "0 0 28px" }}>
              {product.description}
            </p>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "0 0 36px" }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: "#111" }}>
                ${Number(product.price).toLocaleString()}
              </span>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleAddToCart}
                style={{
                  height: 54,
                  borderRadius: 14,
                  background: added ? "#16A34A" : "#2563EB",
                  color: "#fff",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background .2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {added ? "✓ Додано в кошик!" : "🛒 Додати в кошик"}
              </button>

              {product.designer_type && (
                <button
                  onClick={handleTry3D}
                  style={{
                    height: 54,
                    borderRadius: 14,
                    background: "#fff",
                    color: "#111",
                    border: "1.5px solid #E0E0E0",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "border-color .15s, background .15s",
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "#2563EB"; (e.target as HTMLButtonElement).style.color = "#2563EB"; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "#E0E0E0"; (e.target as HTMLButtonElement).style.color = "#111"; }}
                >
                  <span style={{ fontSize: 20 }}>⬡</span> Приміряти у 3D
                </button>
              )}

              <Link href="/cart" style={{ textDecoration: "none" }}>
                <button style={{ height: 44, borderRadius: 12, background: "#F7F7F7", color: "#555", border: "1px solid #E8E8E8", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                  Переглянути кошик
                </button>
              </Link>
            </div>

            {/* Vendor badge */}
            {product.vendor_name && (
              <div style={{ marginTop: 32, padding: "16px 20px", background: "#F8F9FF", borderRadius: 14, border: "1px solid #E8EDFF" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Продавець</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{product.vendor_name}</div>
              </div>
            )}
          </div>
        </div>

        {/* Similar products link */}
        <div style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid #F0F0F0", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 16 }}>
            Більше товарів у категорії «{product.category_name || product.category_id}»
          </div>
          <Link href={`/category/${product.category_id}`} style={{ textDecoration: "none" }}>
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Переглянути усі →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
      <div style={{ borderRadius: 24, background: "#F0F0F0", aspectRatio: "1", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
        <div style={{ width: "30%", height: 12, background: "#F0F0F0", borderRadius: 6 }} />
        <div style={{ width: "80%", height: 32, background: "#F0F0F0", borderRadius: 8 }} />
        <div style={{ width: "60%", height: 16, background: "#F0F0F0", borderRadius: 6 }} />
        <div style={{ width: "100%", height: 80, background: "#F0F0F0", borderRadius: 8 }} />
        <div style={{ width: "40%", height: 48, background: "#F0F0F0", borderRadius: 8 }} />
      </div>
    </div>
  );
}
