import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

type Product = {
  id: string;
  vendor_id?: string | null;
  vendor_name?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  old_price?: number | null;
  stock?: number | null;
  category?: string | null;
  image_url?: string | null;
  designer_type?: string | null;
  has_3d_model?: boolean | null;
  status?: string | null;
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function defaultImage(category = "Меблі") {
  if (category.includes("Підлога") || category.includes("Плитка")) {
    return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80";
  }
  if (category.includes("Освітлення")) {
    return "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80";
  }
  return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80";
}

export default function VendorStorePage() {
  const params = useParams<{ vendorId: string }>();
  const cart = useCart();

  const vendorId = params.vendorId || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const vendorName = products[0]?.vendor_name || "Магазин продавця";

  useEffect(() => {
  async function loadStore() {
    setLoading(true);

    let request = supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (vendorId && vendorId !== "demo_vendor") {
      request = request.eq("vendor_id", vendorId);
    }

    const { data, error } = await request;

    if (error) {
      console.error("Vendor store error:", error);
      alert(error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  loadStore();
}, [vendorId]);

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0),
    [products]
  );

  function addToCart(product: Product) {
    cart.addItem({
      id: `${product.id}_${Date.now()}`,
      type: product.designer_type || "product",
      label: product.name || "Товар",
      price: Number(product.price || 0),
      icon: product.category || "Товар",
    });

    alert("Товар додано в кошик");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7FAF7", fontFamily: "Inter, system-ui, sans-serif" }}>
      <NavBar activePage="vendor" />

      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 18px 80px" }}>
        <section style={hero}>
          <div>
            <div style={badge}>МАГАЗИН ПРОДАВЦЯ</div>
            <h1 style={title}>{vendorName}</h1>
            <p style={text}>
              Товари продавця у FormaHaus: меблі, підлога, освітлення, декор та матеріали для 3D-проєкту.
            </p>
          </div>

          <div style={statsBox}>
            <b>{products.length}</b>
            <span>товарів</span>
            <b>{money(totalValue)}</b>
            <span>товарів на складі</span>
          </div>
        </section>

        <div style={toolbar}>
          <Link href="/vendor" style={backLink}>← Кабінет продавця</Link>
          <Link href="/designer" style={designerBtn}>Відкрити 3D редактор</Link>
        </div>

        {loading ? (
          <div style={empty}>Завантажую магазин...</div>
        ) : products.length === 0 ? (
          <div style={empty}>
            <b>Товарів поки немає</b>
            <span>Продавець ще не додав активні товари.</span>
          </div>
        ) : (
          <section style={grid}>
            {products.map(product => (
              <article key={product.id} style={card}>
                <Link href={`/product/${product.id}`} style={imageWrap}>
                  <img
                    src={product.image_url || defaultImage(product.category || "Меблі")}
                    alt={product.name || "Товар"}
                    style={img}
                  />
                  {product.has_3d_model && <span style={badge3d}>3D</span>}
                  <small style={stock}>В наявності: {product.stock || 0}</small>
                </Link>

                <div style={body}>
                  <div style={category}>{product.category || "Каталог"}</div>
                  <Link href={`/product/${product.id}`} style={name}>{product.name || "Товар"}</Link>
                  <p style={desc}>{product.description || "Опис товару"}</p>

                  <div style={priceRow}>
                    <strong>{money(Number(product.price || 0))}</strong>
                    <button onClick={() => addToCart(product)} style={buyBtn}>Купити</button>
                  </div>

                  <Link
                    href={`/designer?productId=${product.id}&type=${product.designer_type || "product"}`}
                    style={product.has_3d_model ? try3dActive : try3d}
                    onClick={(e) => {
                      if (!product.has_3d_model) e.preventDefault();
                    }}
                  >
                    {product.has_3d_model ? "Приміряти в 3D" : "3D модель очікується"}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

const hero: React.CSSProperties = {
  background: "linear-gradient(135deg,#E8F6EC,#FFFFFF)",
  border: "1px solid #D7EEDC",
  borderRadius: 30,
  padding: 26,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 18,
  alignItems: "center",
  boxShadow: "0 24px 70px rgba(46,157,81,.08)",
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  background: "#E8F6EC",
  color: "#256F3D",
  border: "1px solid #D7EEDC",
  borderRadius: 999,
  padding: "7px 12px",
  fontSize: 12,
  fontWeight: 950,
};

const title: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: "clamp(34px,5vw,62px)",
  lineHeight: 1,
  fontWeight: 980,
  color: "#1F2A24",
};

const text: React.CSSProperties = {
  color: "#64756A",
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 720,
};

const statsBox: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E1EAE3",
  borderRadius: 22,
  padding: 18,
  minWidth: 220,
  display: "grid",
  gap: 4,
};

const toolbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  margin: "18px 0",
};

const backLink: React.CSSProperties = {
  color: "#256F3D",
  fontWeight: 900,
  textDecoration: "none",
};

const designerBtn: React.CSSProperties = {
  background: "#2E9D51",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 16px",
  textDecoration: "none",
  fontWeight: 950,
};

const empty: React.CSSProperties = {
  background: "#fff",
  border: "1px dashed #D7EEDC",
  borderRadius: 24,
  padding: 46,
  textAlign: "center",
  color: "#64756A",
  display: "grid",
  gap: 8,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E1EAE3",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 18px 45px rgba(77,54,35,.08)",
};

const imageWrap: React.CSSProperties = {
  display: "block",
  position: "relative",
  aspectRatio: "1.18",
  background: "#F2FBF4",
  overflow: "hidden",
};

const img: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const badge3d: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: 12,
  background: "#E8F6EC",
  color: "#256F3D",
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 950,
};

const stock: React.CSSProperties = {
  position: "absolute",
  right: 12,
  bottom: 12,
  background: "rgba(31,42,36,.88)",
  color: "#fff",
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 900,
};

const body: React.CSSProperties = {
  padding: 16,
};

const category: React.CSSProperties = {
  color: "#256F3D",
  fontSize: 12,
  fontWeight: 950,
  textTransform: "uppercase",
};

const name: React.CSSProperties = {
  display: "block",
  color: "#1F2A24",
  fontSize: 18,
  fontWeight: 950,
  textDecoration: "none",
  marginTop: 7,
};

const desc: React.CSSProperties = {
  color: "#64756A",
  fontSize: 13,
  lineHeight: 1.45,
  minHeight: 38,
};

const priceRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const buyBtn: React.CSSProperties = {
  background: "#1F2A24",
  color: "#fff",
  border: 0,
  borderRadius: 14,
  padding: "10px 14px",
  fontWeight: 950,
};

const try3d: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  justifyContent: "center",
  border: "1px solid #E1EAE3",
  borderRadius: 14,
  padding: "11px",
  textDecoration: "none",
  color: "#9AA49C",
  fontWeight: 950,
};

const try3dActive: React.CSSProperties = {
  ...try3d,
  color: "#256F3D",
  background: "#E8F6EC",
  borderColor: "#D7EEDC",
};
