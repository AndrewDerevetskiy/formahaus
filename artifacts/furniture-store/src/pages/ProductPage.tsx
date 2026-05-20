import { Link, useParams } from "wouter";
import NavBar from "../components/NavBar";
import {
  PRODUCT_BY_ID_MAP,
  PRODUCT_MAP,
  VENDOR_MAP,
  type MarketplaceProduct,
} from "../data/products";
import { useCart } from "../context/CartContext";

function money(value: number) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

function getProductFromParam(id?: string): MarketplaceProduct | undefined {
  if (!id) return undefined;

  /* New marketplace product id: prod_sofa_001 */
  const byProductId = PRODUCT_BY_ID_MAP.get(id);
  if (byProductId) return byProductId;

  /* Backward compatibility: old links like /product/sofa */
  const byDesignerType = PRODUCT_MAP.get(id);
  if (byDesignerType) return byDesignerType;

  return undefined;
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const cart = useCart();
  const product = getProductFromParam(params.id);

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        <NavBar activePage="store" />
        <main style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "70px 18px",
          fontFamily: "'Inter',system-ui,sans-serif",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 54, marginBottom: 12 }}>🔎</div>
          <h1 style={{ margin: 0, color: "#0F172A", fontSize: 32, fontWeight: 950 }}>
            Товар не знайдено
          </h1>
          <p style={{ color: "#64748B", fontSize: 15, margin: "12px 0 24px" }}>
            Можливо, товар був видалений або ще не пройшов модерацію.
          </p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={primaryBtn}>Повернутися в каталог</button>
          </Link>
        </main>
      </div>
    );
  }

  const vendor = VENDOR_MAP.get(product.vendorId);
  const mainImg = product.imageUrl || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85";
  const commission = Math.round(product.price * (product.commissionPercent / 100));
  const vendorRevenue = product.price - commission;

  function addToCart() {
    cart.addItem({
      id: `${product.id}-${Date.now()}`,
      type: product.designerType,
      label: product.nameUa,
      price: product.price,
      icon: product.icon,
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <NavBar activePage="store" />

      <main style={{
        maxWidth: 1220,
        margin: "0 auto",
        padding: "28px 18px 70px",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          color: "#64748B",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 18,
          flexWrap: "wrap",
        }}>
          <Link href="/" style={{ color: "#2563EB", textDecoration: "none" }}>Каталог</Link>
          <span>/</span>
          <span>{categoryLabel(product.category)}</span>
          <span>/</span>
          <span style={{ color: "#0F172A" }}>{product.nameUa}</span>
        </div>

        <section style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.05fr) minmax(340px,.95fr)",
          gap: 22,
        }} className="fh-product-grid">
          {/* Gallery */}
          <div style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 26,
            padding: 14,
            boxShadow: "0 16px 45px rgba(15,23,42,.06)",
          }}>
            <div style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              background: "#F1F5F9",
              minHeight: 420,
            }}>
              <img
                src={mainImg}
                alt={product.nameUa}
                style={{ width: "100%", height: "100%", minHeight: 420, objectFit: "cover", display: "block" }}
              />

              <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.isPromoted && <Badge bg="#FEF3C7" color="#92400E">ТОП продажів</Badge>}
                {product.has3DModel && <Badge bg="#DBEAFE" color="#1D4ED8">⬡ Є 3D модель</Badge>}
                <Badge bg={product.stock > 0 ? "#DCFCE7" : "#FEE2E2"} color={product.stock > 0 ? "#166534" : "#991B1B"}>
                  {product.stock > 0 ? `В наявності: ${product.stock}` : "Немає в наявності"}
                </Badge>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              marginTop: 12,
            }}>
              {[mainImg, ...(product.gallery || [])].slice(0, 4).map((img, idx) => (
                <div key={idx} style={{
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 14,
                  overflow: "hidden",
                  aspectRatio: "1.2",
                  background: "#F8FAFC",
                }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <aside style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 26,
            padding: 22,
            boxShadow: "0 16px 45px rgba(15,23,42,.06)",
            alignSelf: "start",
          }}>
            <div style={{ color: "#2563EB", fontSize: 12, fontWeight: 950, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
              {product.icon} {categoryLabel(product.category)}
            </div>

            <h1 style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "clamp(28px,4vw,42px)",
              lineHeight: 1.05,
              fontWeight: 950,
              letterSpacing: "-1px",
            }}>
              {product.nameUa}
            </h1>

            <p style={{ margin: "12px 0 0", color: "#64748B", fontSize: 15, lineHeight: 1.65 }}>
              {product.descUa}
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              flexWrap: "wrap",
              color: "#475569",
              fontSize: 13,
              fontWeight: 800,
            }}>
              <span>⭐ {product.rating} / 5</span>
              <span>•</span>
              <span>{product.reviewsCount} відгуків</span>
              <span>•</span>
              <span>{product.salesCount} продажів</span>
            </div>

            <div style={{
              marginTop: 22,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 18,
              padding: "18px 0",
              borderTop: "1px solid #F1F5F9",
              borderBottom: "1px solid #F1F5F9",
            }}>
              <div>
                {product.oldPrice && (
                  <div style={{ color: "#94A3B8", fontSize: 16, fontWeight: 800, textDecoration: "line-through" }}>
                    {money(product.oldPrice)}
                  </div>
                )}
                <div style={{ color: "#0F172A", fontSize: 38, fontWeight: 950, lineHeight: 1 }}>
                  {money(product.price)}
                </div>
              </div>
              <div style={{ textAlign: "right", color: "#64748B", fontSize: 12, fontWeight: 800 }}>
                SKU<br /><span style={{ color: "#0F172A" }}>{product.sku}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }} className="fh-action-grid">
              <button
                onClick={addToCart}
                disabled={product.stock <= 0}
                style={{
                  ...primaryBtn,
                  opacity: product.stock > 0 ? 1 : .55,
                  cursor: product.stock > 0 ? "pointer" : "not-allowed",
                }}
              >
                Додати в кошик
              </button>

              <Link href={`/designer?add=${product.designerType}`} style={{ textDecoration: "none" }}>
                <button style={secondaryBtn}>
                  ⬡ Відкрити у 3D
                </button>
              </Link>
            </div>

            <Link href="/cart" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%",
                marginTop: 10,
                background: "#0F172A",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 18px",
                fontSize: 15,
                fontWeight: 950,
                cursor: "pointer",
              }}>
                Перейти до кошика ({cart.itemCount})
              </button>
            </Link>

            {/* Vendor card */}
            <div style={{
              marginTop: 20,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              borderRadius: 20,
              padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  background: "#DBEAFE",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 950,
                }}>
                  {(vendor?.name || product.vendorName).slice(0,1)}
                </div>
                <div>
                  <div style={{ color: "#0F172A", fontSize: 16, fontWeight: 950 }}>
                    {vendor?.name || product.vendorName}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
                    📍 {product.vendorCity} · ⭐ {vendor?.rating ?? product.rating} ({vendor?.reviewsCount ?? product.reviewsCount})
                  </div>
                </div>
              </div>
              <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.5, margin: "12px 0 0" }}>
                {vendor?.description || "Перевірений продавець FormaHaus."}
              </p>
            </div>
          </aside>
        </section>

        <section style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 22,
        }} className="fh-details-grid">
          <InfoCard title="Доставка">
            {product.deliveryOptions.map(d => (
              <div key={d.id} style={rowStyle}>
                <span>{d.label}</span>
                <b>від {d.priceFrom === 0 ? "0" : `${d.priceFrom} грн`} · {d.estimatedDays}</b>
              </div>
            ))}
          </InfoCard>

          <InfoCard title="Умови продажу">
            <div style={rowStyle}><span>Гарантія</span><b>{product.warrantyMonths} міс.</b></div>
            <div style={rowStyle}><span>Продавець</span><b>{product.vendorName}</b></div>
            <div style={rowStyle}><span>Статус товару</span><b>{product.status === "approved" ? "Підтверджено" : product.status}</b></div>
            <div style={rowStyle}><span>Комісія платформи</span><b>{money(commission)}</b></div>
            <div style={rowStyle}><span>Виплата продавцю</span><b>{money(vendorRevenue)}</b></div>
          </InfoCard>
        </section>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .fh-product-grid { grid-template-columns: 1fr !important; }
          .fh-details-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .fh-action-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{
      background: bg,
      color,
      borderRadius: 999,
      padding: "7px 10px",
      fontSize: 11,
      fontWeight: 950,
      boxShadow: "0 6px 18px rgba(15,23,42,.08)",
    }}>
      {children}
    </span>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 24,
      padding: 20,
      boxShadow: "0 12px 35px rgba(15,23,42,.05)",
    }}>
      <h2 style={{ margin: "0 0 14px", color: "#0F172A", fontSize: 20, fontWeight: 950 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function categoryLabel(category: string) {
  const map: Record<string, string> = {
    seating: "Дивани та крісла",
    tables: "Столи",
    storage: "Зберігання",
    lighting: "Освітлення",
    decor: "Декор",
    flooring: "Підлога",
    wall: "Стіни",
  };
  return map[category] || category;
}

const primaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(37,99,235,.20)",
};

const secondaryBtn: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  color: "#2563EB",
  border: "1.5px solid #BFDBFE",
  borderRadius: 14,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 950,
  cursor: "pointer",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  padding: "11px 0",
  borderBottom: "1px solid #F1F5F9",
  color: "#64748B",
  fontSize: 14,
};
