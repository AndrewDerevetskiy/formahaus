import { useMemo } from "react";
import { Link, useParams } from "wouter";
import NavBar from "../components/NavBar";
import { useCart } from "../context/CartContext";

type ProductStatus = "draft" | "active" | "paused";

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
  model3dUrl?: string;
  designerType: string;
  has3DModel: boolean;
  status: ProductStatus;
  createdAt: string;
};

type VendorProfile = {
  vendorId: string;
  vendorName: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  telegram: string;
  tiktok: string;
  rating: number;
  reviews: number;
  createdAt: string;
};

const LS_VENDOR_PRODUCTS = "formahaus_vendor_products";
const LS_VENDOR_PROFILES = "formahaus_vendor_profiles";

function money(value: number) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function loadProducts(): VendorProduct[] {
  try {
    const raw = localStorage.getItem(LS_VENDOR_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadProfiles(): VendorProfile[] {
  try {
    const raw = localStorage.getItem(LS_VENDOR_PROFILES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function defaultProfile(vendorId: string, vendorName: string): VendorProfile {
  return {
    vendorId,
    vendorName,
    logoUrl: "",
    bannerUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    description: "Магазин меблів, матеріалів та товарів для інтер’єру на FormaHaus.",
    city: "Україна",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
    telegram: "",
    tiktok: "",
    rating: 4.9,
    reviews: 12,
    createdAt: new Date().toISOString(),
  };
}

export default function VendorProfilePage() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params.vendorId || "demo_vendor";
  const cart = useCart();

  const products = useMemo(() => loadProducts(), []);
  const profiles = useMemo(() => loadProfiles(), []);

  const vendorProducts = useMemo(
    () => products.filter(product => product.vendorId === vendorId && product.status === "active"),
    [products, vendorId]
  );

  const vendorName = vendorProducts[0]?.vendorName || "Магазин продавця";
  const profile = profiles.find(item => item.vendorId === vendorId) || defaultProfile(vendorId, vendorName);

  const stats = useMemo(() => {
    const totalProducts = vendorProducts.length;
    const categories = new Set(vendorProducts.map(product => product.category)).size;
    const with3D = vendorProducts.filter(product => product.has3DModel || product.model3dUrl).length;
    const minPrice = vendorProducts.length ? Math.min(...vendorProducts.map(product => product.price)) : 0;

    return { totalProducts, categories, with3D, minPrice };
  }, [vendorProducts]);

  function addToCart(product: VendorProduct) {
    cart.addItem({
      id: product.id,
      type: product.designerType || product.category,
      label: product.name,
      price: product.price,
      icon: product.category || "ITEM",
      imageUrl: product.imageUrl,
      source: "catalog",
    });

    alert("Товар додано в кошик");
  }

  return (
    <div style={page}>
      <NavBar activePage="shop" />

      <main style={wrap}>
        <section style={hero}>
          <div style={{ ...banner, backgroundImage: `linear-gradient(90deg,rgba(15,23,42,.78),rgba(15,23,42,.18)), url(${profile.bannerUrl})` }}>
            <div style={heroContent} className="vendor-store-hero-content">
              <div style={logo}>
                {profile.logoUrl ? <img src={profile.logoUrl} alt={profile.vendorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profile.vendorName.slice(0, 1).toUpperCase()}
              </div>

              <div>
                <div style={badge}>ПЕРЕВІРЕНИЙ ПРОДАВЕЦЬ FORMAHAUS</div>
                <h1 style={title}>{profile.vendorName}</h1>
                <p style={subtitle}>{profile.description}</p>

                <div style={metaRow}>
                  <span style={metaPill}>📍 {profile.city || "Україна"}</span>
                  <span style={metaPill}>⭐ {profile.rating.toFixed(1)} / 5</span>
                  <span style={metaPill}>💬 {profile.reviews} відгуків</span>
                  <span style={metaPill}>🛍 {stats.totalProducts} товарів</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={statsGrid} className="vendor-store-stats">
          <Stat label="Активні товари" value={String(stats.totalProducts)} />
          <Stat label="Категорії" value={String(stats.categories)} />
          <Stat label="Товарів з 3D" value={String(stats.with3D)} />
          <Stat label="Ціна від" value={stats.minPrice ? money(stats.minPrice) : "—"} />
        </section>

        <div style={grid} className="vendor-store-grid">
          <aside style={sideCard}>
            <h2 style={sideTitle}>Про магазин</h2>
            <p style={sideText}>{profile.description}</p>

            <div style={contactList}>
              {profile.phone && <Contact icon="☎️" label="Телефон" value={profile.phone} />}
              {profile.email && <Contact icon="✉️" label="Email" value={profile.email} />}
              {profile.website && <Contact icon="🌐" label="Сайт" value={profile.website} />}
              {profile.instagram && <Contact icon="📷" label="Instagram" value={profile.instagram} />}
              {profile.facebook && <Contact icon="f" label="Facebook" value={profile.facebook} />}
              {profile.telegram && <Contact icon="✈️" label="Telegram" value={profile.telegram} />}
              {profile.tiktok && <Contact icon="♪" label="TikTok" value={profile.tiktok} />}
              {!profile.phone && !profile.email && !profile.website && (
                <div style={emptyContact}>Контакти продавця будуть додані пізніше.</div>
              )}
            </div>

            <Link href="/vendor/dashboard" style={{ textDecoration: "none" }}>
              <button style={outlineBtn}>Перейти в кабінет продавця</button>
            </Link>
          </aside>

          <section style={productsCard}>
            <div style={sectionHead}>
              <div>
                <h2 style={sectionTitle}>Товари магазину</h2>
                <p style={sectionSubtitle}>Усі активні товари продавця, які доступні покупцям.</p>
              </div>

              <Link href="/designer" style={{ textDecoration: "none" }}>
                <button style={darkBtn}>Відкрити 3D редактор</button>
              </Link>
            </div>

            {vendorProducts.length === 0 ? (
              <div style={empty}>
                <b>У цього продавця поки немає активних товарів</b>
                <span>Коли продавець додасть товари, вони з’являться тут.</span>
              </div>
            ) : (
              <div style={productsGrid} className="vendor-store-products">
                {vendorProducts.map(product => (
                  <article key={product.id} style={productCard}>
                    <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                      <div style={productImageWrap}>
                        <img src={product.imageUrl} alt={product.name} style={productImage} />
                        {product.has3DModel && <span style={modelBadge}>3D</span>}
                      </div>
                    </Link>

                    <div style={productBody}>
                      <div style={productCategory}>{product.category || "Товар"}</div>
                      <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                        <h3 style={productTitle}>{product.name}</h3>
                      </Link>
                      <p style={productDesc}>{product.description}</p>

                      <div style={priceRow}>
                        <b>{money(product.price)}</b>
                        {product.oldPrice && <span>{money(product.oldPrice)}</span>}
                      </div>

                      <div style={btnRow}>
                        <button onClick={() => addToCart(product)} style={cartBtn}>У кошик</button>
                        {product.has3DModel && product.designerType && (
                          <Link href={`/designer?add=${product.designerType}`} style={{ textDecoration: "none", flex: 1 }}>
                            <button style={tryBtn}>У 3D</button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <style>{`
        @media (max-width: 920px) {
          .vendor-store-grid { grid-template-columns: 1fr !important; }
          .vendor-store-products { grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 640px) {
          .vendor-store-hero-content { grid-template-columns: 1fr !important; }
          .vendor-store-products { grid-template-columns: 1fr !important; }
          .vendor-store-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={stat}>
      <span style={{ color: "#64748B", fontSize: 12, fontWeight: 850 }}>{label}</span>
      <b style={{ color: "#0F172A", fontSize: 22, fontWeight: 950, marginTop: 4 }}>{value}</b>
    </div>
  );
}

function Contact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={contact}>
      <span style={contactIcon}>{icon}</span>
      <div>
        <small style={{ display: "block", color: "#64748B", fontSize: 11, fontWeight: 850 }}>{label}</small>
        <b style={{ display: "block", color: "#0F172A", fontSize: 13, fontWeight: 950, wordBreak: "break-word" }}>{value}</b>
      </div>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',system-ui,sans-serif" };
const wrap: React.CSSProperties = { maxWidth: 1220, margin: "0 auto", padding: "26px 18px 70px" };
const hero: React.CSSProperties = { marginBottom: 16 };
const banner: React.CSSProperties = { minHeight: 310, borderRadius: 30, backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden", boxShadow: "0 26px 70px rgba(15,23,42,.18)", display: "flex", alignItems: "flex-end" };
const heroContent: React.CSSProperties = { width: "100%", display: "grid", gridTemplateColumns: "92px 1fr", gap: 18, alignItems: "center", padding: 26 };
const logo: React.CSSProperties = { width: 92, height: 92, borderRadius: 26, background: "#fff", color: "#0F172A", display: "grid", placeItems: "center", fontSize: 42, fontWeight: 950, boxShadow: "0 18px 44px rgba(0,0,0,.25)", overflow: "hidden" };
const badge: React.CSSProperties = { display: "inline-flex", background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 999, padding: "6px 11px", fontSize: 11, fontWeight: 950, marginBottom: 10 };
const title: React.CSSProperties = { margin: 0, color: "#fff", fontSize: "clamp(34px,6vw,64px)", lineHeight: 1, fontWeight: 950, letterSpacing: "-.05em" };
const subtitle: React.CSSProperties = { color: "rgba(255,255,255,.82)", fontSize: 15, lineHeight: 1.65, margin: "10px 0 0", maxWidth: 720 };
const metaRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 };
const metaPill: React.CSSProperties = { background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 900 };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 };
const stat: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 16, boxShadow: "0 12px 36px rgba(15,23,42,.05)", display: "grid" };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "330px 1fr", gap: 16 };
const sideCard: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 18, alignSelf: "start", boxShadow: "0 12px 36px rgba(15,23,42,.05)" };
const sideTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 22, fontWeight: 950 };
const sideText: React.CSSProperties = { color: "#64748B", fontSize: 14, lineHeight: 1.65 };
const contactList: React.CSSProperties = { display: "grid", gap: 9, marginTop: 14 };
const contact: React.CSSProperties = { display: "grid", gridTemplateColumns: "38px 1fr", gap: 10, alignItems: "center", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 15, padding: 10 };
const contactIcon: React.CSSProperties = { width: 38, height: 38, borderRadius: 13, background: "#0F172A", color: "#fff", display: "grid", placeItems: "center", fontWeight: 950 };
const emptyContact: React.CSSProperties = { color: "#64748B", background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.5 };
const outlineBtn: React.CSSProperties = { width: "100%", marginTop: 16, background: "#fff", color: "#0F172A", border: "1px solid #CBD5E1", borderRadius: 14, padding: "12px 14px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const productsCard: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 18, boxShadow: "0 12px 36px rgba(15,23,42,.05)" };
const sectionHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 16 };
const sectionTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 24, fontWeight: 950 };
const sectionSubtitle: React.CSSProperties = { margin: "5px 0 0", color: "#64748B", fontSize: 13, lineHeight: 1.5 };
const darkBtn: React.CSSProperties = { background: "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "12px 15px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const empty: React.CSSProperties = { display: "grid", gap: 6, textAlign: "center", padding: "54px 18px", color: "#64748B", background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 18 };
const productsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 };
const productCard: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "0 10px 30px rgba(15,23,42,.04)" };
const productImageWrap: React.CSSProperties = { position: "relative", height: 180, background: "#F1F5F9", overflow: "hidden" };
const productImage: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const modelBadge: React.CSSProperties = { position: "absolute", top: 12, right: 12, background: "#0F172A", color: "#fff", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 950 };
const productBody: React.CSSProperties = { padding: 14 };
const productCategory: React.CSSProperties = { color: "#B88761", fontSize: 12, fontWeight: 950, marginBottom: 6 };
const productTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 17, fontWeight: 950, lineHeight: 1.2 };
const productDesc: React.CSSProperties = { color: "#64748B", fontSize: 13, lineHeight: 1.45, minHeight: 38, margin: "8px 0 12px" };
const priceRow: React.CSSProperties = { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 };
const btnRow: React.CSSProperties = { display: "flex", gap: 8 };
const cartBtn: React.CSSProperties = { flex: 1, background: "#B88761", color: "#fff", border: "none", borderRadius: 13, padding: "11px 12px", fontSize: 13, fontWeight: 950, cursor: "pointer" };
const tryBtn: React.CSSProperties = { width: "100%", background: "#0F172A", color: "#fff", border: "none", borderRadius: 13, padding: "11px 12px", fontSize: 13, fontWeight: 950, cursor: "pointer" };

