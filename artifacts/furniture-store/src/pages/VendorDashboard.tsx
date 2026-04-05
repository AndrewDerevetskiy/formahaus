import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { API_BASE } from "../lib/api";
import NavBar from "../components/NavBar";

interface Vendor { id: number; shop_name: string; email: string; }
interface Product { id: number; name: string; price: number; category_id: string; image_url: string; created_at: string; }
interface Category { id: string; name_uk: string; }

const DESIGNER_TYPES = [
  { value: "sofa",      label: "Диван" },
  { value: "armchair",  label: "Крісло" },
  { value: "bench",     label: "Лавка" },
  { value: "coffee",    label: "Журнальний столик" },
  { value: "dining",    label: "Обідній стіл" },
  { value: "side",      label: "Приставний столик" },
  { value: "bookshelf", label: "Стелаж" },
  { value: "cabinet",   label: "Сервант" },
  { value: "floorlamp", label: "Торшер" },
  { value: "pendant",   label: "Підвісний світильник" },
  { value: "plant",     label: "Рослина" },
  { value: "rug_classic","label": "Килим" },
];

export default function VendorDashboard() {
  const [, navigate] = useLocation();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<"products" | "add">("products");
  const [form, setForm] = useState({ name: "", description: "", category_id: "tables", price: "", designer_type: "sofa", image_url: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const v = localStorage.getItem("vendor");
    if (!v) { navigate("/vendor/register"); return; }
    const parsed = JSON.parse(v);
    setVendor(parsed);
    loadProducts(parsed.id);
    fetch(`${API_BASE}/api/categories`).then(r => r.json()).then(setCategories);
  }, []);

  function loadProducts(vendorId: number) {
    fetch(`${API_BASE}/api/vendor/${vendorId}/products`)
      .then(r => r.json()).then(data => setProducts(Array.isArray(data) ? data : []));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setSubmitting(true); setError(""); setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category_id", form.category_id);
      fd.append("price", form.price);
      fd.append("designer_type", form.designer_type);
      fd.append("vendor_id", String(vendor.id));
      if (form.image_url) fd.append("image_url", form.image_url);
      if (imageFile) fd.append("image", imageFile);
      if (modelFile) fd.append("model", modelFile);

      const res = await fetch(`${API_BASE}/api/products`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Помилка"); return; }
      setSuccess(true);
      setForm({ name: "", description: "", category_id: "tables", price: "", designer_type: "sofa", image_url: "" });
      setImageFile(null); setModelFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (modelInputRef.current) modelInputRef.current.value = "";
      loadProducts(vendor.id);
      setTimeout(() => { setTab("products"); setSuccess(false); }, 1500);
    } catch { setError("Помилка з'єднання"); } finally { setSubmitting(false); }
  }

  function handleLogout() { localStorage.removeItem("vendor"); navigate("/vendor/register"); }

  if (!vendor) return null;

  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <NavBar activePage="vendor" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111", margin: "0 0 4px" }}>Панель продавця</h1>
            <p style={{ color: "#888", fontSize: 14, margin: 0 }}>👋 {vendor.shop_name} · {vendor.email}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", background: "#EEF2FF", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>← Магазин</button>
            </Link>
            <button onClick={handleLogout} style={{ fontSize: 13, color: "#888", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>Вийти</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #F0F0F0", marginBottom: 32 }}>
          {([["products", "Мої товари"], ["add", "Додати товар"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, border: "none", background: "none", cursor: "pointer", color: tab === k ? "#2563EB" : "#888", borderBottom: `2px solid ${tab === k ? "#2563EB" : "transparent"}`, marginBottom: -2 }}>{l}</button>
          ))}
        </div>

        {/* Products list */}
        {tab === "products" && (
          <div>
            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 16, marginBottom: 20 }}>Товарів ще немає</div>
                <button onClick={() => setTab("add")} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Додати перший товар</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20 }}>
                {products.map(p => {
                  const imgSrc = p.image_url?.startsWith("http") ? p.image_url : `${API_BASE}${p.image_url}`;
                  return (
                    <div key={p.id} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ background: "#F5F5F5", aspectRatio: "1" }}>
                        <img src={imgSrc} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div style={{ padding: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#2563EB" }}>${Number(p.price).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add product form */}
        {tab === "add" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EBEBEB", padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 24px", color: "#111" }}>Новий товар</h2>

            {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: 14, marginBottom: 20 }}>{error}</div>}
            {success && <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", color: "#16A34A", fontSize: 14, marginBottom: 20 }}>✓ Товар додано!</div>}

            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="Назва товару" required>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Наприклад: Диван Nordic" required style={inputStyle} />
              </Field>
              <Field label="Ціна (USD)" required>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1999" min="1" required style={inputStyle} />
              </Field>
              <Field label="Опис" full>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Короткий опис товару..." rows={3} style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }} />
              </Field>
              <Field label="Категорія" required>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inputStyle}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_uk}</option>)}
                </select>
              </Field>
              <Field label="Тип у 3D-редакторі">
                <select value={form.designer_type} onChange={e => setForm(f => ({ ...f, designer_type: e.target.value }))} style={inputStyle}>
                  {DESIGNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="URL фото (або завантажте нижче)">
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." style={inputStyle} />
              </Field>
              <Field label="Завантажити фото товару (.jpg, .png)">
                <input ref={imageInputRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ fontSize: 14, color: "#444" }} />
              </Field>
              <Field label="Завантажити 3D-модель (.glb)">
                <input ref={modelInputRef} type="file" accept=".glb,.gltf" onChange={e => setModelFile(e.target.files?.[0] || null)} style={{ fontSize: 14, color: "#444" }} />
              </Field>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" disabled={submitting} style={{ height: 48, flex: 1, borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Збереження..." : "Опублікувати товар"}
                </button>
                <button type="button" onClick={() => setTab("products")} style={{ height: 48, padding: "0 24px", borderRadius: 10, background: "none", color: "#666", border: "1px solid #E5E5E5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", height: 44, border: "1.5px solid #E5E5E5", borderRadius: 10, padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" };

function Field({ label, children, required, full }: { label: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
