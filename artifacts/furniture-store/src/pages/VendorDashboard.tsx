import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";

type ProductStatus = "draft" | "active" | "paused";
type OrderStatus = "new" | "confirmed" | "completed" | "cancelled";

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

type SavedOrder = {
  id: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    comment: string;
  };
  delivery: {
    method: string;
    label: string;
    price: number;
  };
  payment: {
    method: string;
    label: string;
  };
  items: Array<{
    id: string;
    type: string;
    label: string;
    price: number;
    quantity: number;
  }>;
  totals: {
    itemsTotal: number;
    floorTotal: number;
    wallTotal: number;
    deliveryTotal: number;
    grandTotal: number;
  };
  createdAt: string;
};

type ProductForm = {
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  description: string;
  imageUrl: string;
  model3dUrl: string;
  aiPhotoUrls: string[];
  ai3dStatus: "idle" | "ready" | "generating" | "done" | "error";
  designerType: string;
  has3DModel: boolean;
};

const LS_VENDOR_PRODUCTS = "formahaus_vendor_products";
const LS_ORDERS = "formahaus_orders";

const categories = ["Меблі", "Підлога", "Ламінат", "Плитка", "Освітлення", "Стіни та обої", "Фарба", "Декор"];

const designerTypes = [
  { value: "", label: "Без 3D" },
  { value: "sofa", label: "Диван" },
  { value: "armchair", label: "Крісло" },
  { value: "coffee", label: "Журнальний стіл" },
  { value: "dining", label: "Обідній стіл" },
  { value: "bookshelf", label: "Стелаж" },
  { value: "cabinet", label: "Комод / шафа" },
  { value: "floorlamp", label: "Лампа" },
  { value: "plant", label: "Рослина" },
  { value: "rug_classic", label: "Килим" },
  { value: "floor_product", label: "Підлога / плитка / ламінат" },
  { value: "wall_product", label: "Стіни / обої / фарба" },
];

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

function saveProducts(products: VendorProduct[]) {
  localStorage.setItem(LS_VENDOR_PRODUCTS, JSON.stringify(products));
}

function loadOrders(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(LS_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: SavedOrder[]) {
  localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Не вдалося прочитати файл"));
      }
    };

    reader.onerror = () => reject(new Error("Помилка читання файлу"));
    reader.readAsDataURL(file);
  });
}

export default function VendorDashboard() {
  const auth = useAuth();

  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<VendorProduct[]>(() => loadProducts());
  const [orders, setOrders] = useState<SavedOrder[]>(() => loadOrders());

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    category: "Меблі",
    price: "",
    oldPrice: "",
    stock: "",
    description: "",
    imageUrl: "",
    model3dUrl: "",
    aiPhotoUrls: [],
    ai3dStatus: "idle",
    designerType: "",
    has3DModel: false,
  });

  const vendorId = auth.user?.id || "demo_vendor";
  const vendorName = auth.user?.vendorName || auth.user?.name || "Мій магазин";

  const myProducts = useMemo(() => products.filter(p => p.vendorId === vendorId), [products, vendorId]);

  const stats = useMemo(() => {
    const active = myProducts.filter(p => p.status === "active").length;
    const totalValue = myProducts.reduce((s, p) => s + p.price * p.stock, 0);
    const newOrders = orders.filter(o => o.status === "new").length;
    const ordersTotal = orders.reduce((s, o) => s + o.totals.grandTotal, 0);

    return { totalProducts: myProducts.length, active, totalValue, newOrders, ordersTotal };
  }, [myProducts, orders]);

  useEffect(() => saveProducts(products), [products]);
  useEffect(() => saveOrders(orders), [orders]);

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }


  async function uploadProductImage(file?: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Оберіть файл зображення");
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      alert("Фото завелике. Для тесту оберіть фото до 2.5 МБ");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      update("imageUrl", dataUrl);
    } catch {
      alert("Не вдалося завантажити фото");
    }
  }

  async function uploadAiModelPhotos(files?: FileList | null) {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files).slice(0, 6);

    const invalid = selectedFiles.find(file => !file.type.startsWith("image/"));
    if (invalid) {
      alert("Для AI 3D моделі можна завантажувати тільки фото");
      return;
    }

    const tooLarge = selectedFiles.find(file => file.size > 2.5 * 1024 * 1024);
    if (tooLarge) {
      alert("Одне з фото завелике. Для тесту оберіть фото до 2.5 МБ");
      return;
    }

    try {
      const urls = await Promise.all(selectedFiles.map(fileToDataUrl));

      setForm(prev => ({
        ...prev,
        aiPhotoUrls: urls,
        ai3dStatus: urls.length >= 3 ? "ready" : "idle",
      }));
    } catch {
      alert("Не вдалося прочитати фото");
    }
  }

  function removeAiPhoto(index: number) {
    setForm(prev => {
      const next = prev.aiPhotoUrls.filter((_, i) => i !== index);

      return {
        ...prev,
        aiPhotoUrls: next,
        ai3dStatus: next.length >= 3 ? "ready" : "idle",
      };
    });
  }

  async function generateAi3DModel() {
    if (form.aiPhotoUrls.length < 3) {
      alert("Завантажте мінімум 3 фото товару для створення 3D моделі");
      return;
    }

    setForm(prev => ({ ...prev, ai3dStatus: "generating" }));

    // Тимчасова mock-генерація.
    // Пізніше цей блок замінимо на реальний API:
    // POST /api/generate-3d-model -> повертає URL на model.glb
    await new Promise(resolve => setTimeout(resolve, 1800));

    const demoGlb = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

    setForm(prev => ({
      ...prev,
      model3dUrl: demoGlb,
      has3DModel: true,
      ai3dStatus: "done",
    }));

    alert("AI 3D модель створена в тестовому режимі. Пізніше підключимо реальний AI-сервіс.");
  }

  function resetForm() {
    setForm({
      name: "",
      category: "Меблі",
      price: "",
      oldPrice: "",
      stock: "",
      description: "",
      imageUrl: "",
      model3dUrl: "",
      aiPhotoUrls: [],
      ai3dStatus: "idle",
      designerType: "",
      has3DModel: false,
    });
    setEditingId(null);
  }

  function submitProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return alert("Вкажіть назву товару");
    if (!form.price.trim()) return alert("Вкажіть ціну");
    if (!form.stock.trim()) return alert("Вкажіть залишок");

    const price = Number(form.price);
    const stock = Number(form.stock);
    const oldPrice = form.oldPrice ? Number(form.oldPrice) : undefined;

    if (!Number.isFinite(price) || price <= 0) return alert("Ціна має бути більше 0");
    if (!Number.isFinite(stock) || stock < 0) return alert("Залишок не може бути менше 0");

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? {
        ...p,
        name: form.name,
        category: form.category,
        price,
        oldPrice,
        stock,
        description: form.description,
        imageUrl: form.imageUrl || defaultImage(form.category),
        model3dUrl: form.model3dUrl,
        designerType: form.designerType,
        has3DModel: Boolean(form.designerType) || Boolean(form.model3dUrl) || form.has3DModel,
      } : p));

      alert("Товар оновлено");
      resetForm();
      setShowForm(false);
      return;
    }

    const product: VendorProduct = {
      id: `product_${Date.now()}`,
      vendorId,
      vendorName,
      name: form.name,
      category: form.category,
      price,
      oldPrice,
      stock,
      description: form.description || "Опис товару",
      imageUrl: form.imageUrl || defaultImage(form.category),
      model3dUrl: form.model3dUrl,
      designerType: form.designerType,
      has3DModel: Boolean(form.designerType) || Boolean(form.model3dUrl) || form.has3DModel,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setProducts(prev => [product, ...prev]);
    alert("Товар додано");
    resetForm();
    setShowForm(false);
  }

  function editProduct(product: VendorProduct) {
    setEditingId(product.id);
    setShowForm(true);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      stock: String(product.stock),
      description: product.description,
      imageUrl: product.imageUrl,
      model3dUrl: product.model3dUrl || "",
      aiPhotoUrls: [],
      ai3dStatus: product.model3dUrl ? "done" : "idle",
      designerType: product.designerType,
      has3DModel: product.has3DModel,
    });
  }

  function deleteProduct(id: string) {
    if (!confirm("Видалити товар?")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  function changeStatus(id: string, status: ProductStatus) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function changeOrderStatus(id: string, status: OrderStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <NavBar activePage="vendor" />

      <main style={{ maxWidth: 1220, margin: "0 auto", padding: "28px 18px 76px" }}>
        <section style={hero}>
          <div>
            <div style={badge}>КАБІНЕТ ПРОДАВЦЯ</div>
            <h1 style={heroTitle}>{vendorName}</h1>
            <p style={heroText}>Додавайте товари, керуйте замовленнями, доставкою та заявками покупців.</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/" style={{ textDecoration: "none" }}><button style={whiteBtn}>Відкрити сайт</button></Link>
            <button onClick={() => { resetForm(); setShowForm(v => !v); setTab("products"); }} style={blueBtn}>+ Додати товар</button>
          </div>
        </section>

        <section style={statsGrid} className="vendor-stats">
          <Stat label="Усі товари" value={String(stats.totalProducts)} />
          <Stat label="Активні товари" value={String(stats.active)} />
          <Stat label="Товарів на суму" value={money(stats.totalValue)} />
          <Stat label="Нові замовлення" value={String(stats.newOrders)} />
          <Stat label="Сума замовлень" value={money(stats.ordersTotal)} />
        </section>

        <div style={tabs}>
          <button onClick={() => setTab("products")} style={tab === "products" ? tabActive : tabBtn}>Товари</button>
          <button onClick={() => setTab("orders")} style={tab === "orders" ? tabActive : tabBtn}>Замовлення</button>
        </div>

        {tab === "products" && (
          <>
            {showForm && (
              <section style={panel}>
                <div style={sectionHead}>
                  <div>
                    <h2 style={sectionTitle}>{editingId ? "Редагувати товар" : "Додати товар"}</h2>
                    <p style={sectionSubtitle}>Меблі, підлога, плитка, ламінат, освітлення, обої або декор.</p>
                  </div>
                  <button onClick={() => { resetForm(); setShowForm(false); }} style={greyBtn}>Закрити</button>
                </div>

                <form onSubmit={submitProduct} style={{ display: "grid", gap: 12 }}>
                  <div style={formGrid} className="vendor-form-grid">
                    <Field label="Назва товару">
                      <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Наприклад: Ламінат світлий дуб" style={input} />
                    </Field>
                    <Field label="Категорія">
                      <select value={form.category} onChange={e => update("category", e.target.value)} style={input}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Ціна">
                      <input value={form.price} onChange={e => update("price", e.target.value)} inputMode="numeric" placeholder="1200" style={input} />
                    </Field>
                    <Field label="Стара ціна">
                      <input value={form.oldPrice} onChange={e => update("oldPrice", e.target.value)} inputMode="numeric" placeholder="необовʼязково" style={input} />
                    </Field>
                    <Field label="Залишок">
                      <input value={form.stock} onChange={e => update("stock", e.target.value)} inputMode="numeric" placeholder="10" style={input} />
                    </Field>
                    <Field label="3D тип / матеріал">
                      <select value={form.designerType} onChange={e => { update("designerType", e.target.value); update("has3DModel", Boolean(e.target.value)); }} style={input}>
                        {designerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Опис">
                    <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Короткий опис товару" style={{ ...input, minHeight: 90, resize: "vertical" }} />
                  </Field>
                  <Field label="Фото товару з телефону">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => uploadProductImage(e.target.files?.[0])}
                      style={fileInput}
                    />
                  </Field>

                  {form.imageUrl && (
                    <div style={previewBox}>
                      <img src={form.imageUrl} alt="Попередній перегляд" style={previewImg} />
                      <div>
                        <b style={{ color: "#0F172A", fontSize: 14 }}>Фото додано</b>
                        <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.4, margin: "4px 0 0" }}>
                          Можна залишити це фото або вставити інше посилання нижче.
                        </p>
                      </div>
                    </div>
                  )}

                  <Field label="Посилання на фото">
                    <input value={form.imageUrl} onChange={e => update("imageUrl", e.target.value)} placeholder="https://..." style={input} />
                  </Field>

                  <Field label="Посилання на 3D модель .glb">
                    <input
                      value={form.model3dUrl}
                      onChange={e => {
                        update("model3dUrl", e.target.value);
                        if (e.target.value.trim()) update("has3DModel", true);
                      }}
                      placeholder="https://.../model.glb"
                      style={input}
                    />
                  </Field>

                  <div style={aiModelBox}>
                    <div style={aiModelHead}>
                      <div>
                        <b style={{ color: "#0F172A", fontSize: 15 }}>AI 3D модель з фото</b>
                        <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.45, margin: "5px 0 0" }}>
                          Завантажте 3–6 фото товару з різних ракурсів. Поки працює тестовий режим, далі підключимо справжній AI.
                        </p>
                      </div>
                      <span style={aiStatusBadge(form.ai3dStatus)}>
                        {aiStatusText(form.ai3dStatus)}
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => uploadAiModelPhotos(e.target.files)}
                      style={fileInput}
                    />

                    {form.aiPhotoUrls.length > 0 && (
                      <div style={aiPhotoGrid}>
                        {form.aiPhotoUrls.map((url, index) => (
                          <div key={index} style={aiPhotoCard}>
                            <img src={url} alt={`AI фото ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            <button
                              type="button"
                              onClick={() => removeAiPhoto(index)}
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                width: 22,
                                height: 22,
                                borderRadius: 999,
                                border: "none",
                                background: "rgba(15,23,42,.78)",
                                color: "#fff",
                                fontSize: 15,
                                fontWeight: 950,
                                cursor: "pointer",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={generateAi3DModel}
                      disabled={form.aiPhotoUrls.length < 3 || form.ai3dStatus === "generating"}
                      style={{
                        ...aiGenerateBtn,
                        opacity: form.aiPhotoUrls.length >= 3 && form.ai3dStatus !== "generating" ? 1 : 0.55,
                        cursor: form.aiPhotoUrls.length >= 3 && form.ai3dStatus !== "generating" ? "pointer" : "not-allowed",
                      }}
                    >
                      {form.ai3dStatus === "generating" ? "Створення 3D моделі..." : "AI створити 3D модель"}
                    </button>

                    {form.model3dUrl && (
                      <div style={aiResultBox}>
                        <b>GLB модель додана</b>
                        <span>{form.model3dUrl}</span>
                      </div>
                    )}
                  </div>

                  <label style={checkboxRow}>
                    <input
                      type="checkbox"
                      checked={form.has3DModel}
                      onChange={e => update("has3DModel", e.target.checked)}
                    />
                    <span>Товар можна приміряти в 3D редакторі</span>
                  </label>

                  <button type="submit" style={{ ...blueBtn, width: "100%", justifyContent: "center" }}>{editingId ? "Зберегти зміни" : "Додати товар"}</button>
                </form>
              </section>
            )}

            <section style={panel}>
              <div style={sectionHead}>
                <div>
                  <h2 style={sectionTitle}>Мої товари</h2>
                  <p style={sectionSubtitle}>Список товарів, які ви додали як продавець.</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} style={blueBtn}>+ Новий товар</button>
              </div>

              {myProducts.length === 0 ? (
                <div style={empty}>Товарів поки немає</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {myProducts.map(product => (
                    <article key={product.id} style={productRow} className="vendor-product-row">
                      <div style={thumbWrap}><img src={product.imageUrl} alt={product.name} style={thumb} /></div>
                      <div>
                        <h3 style={productTitle}>{product.name}</h3>
                        <p style={productDesc}>{product.description}</p>
                        <div style={miniGrid} className="vendor-mini-grid">
                          <Mini label="Категорія" value={product.category} />
                          <Mini label="Ціна" value={money(product.price)} />
                          <Mini label="Залишок" value={String(product.stock)} />
                          <Mini label="3D тип" value={product.designerType || "—"} />
                          <Mini label="GLB модель" value={product.model3dUrl ? "Є" : "—"} />
                        </div>
                      </div>
                      <div style={actions}>
                        {product.has3DModel && product.designerType && (
                          <Link href={`/designer?add=${product.designerType}`} style={{ textDecoration: "none" }}>
                            <button style={{ ...actionBtn, width: "100%" }}>Приміряти в 3D</button>
                          </Link>
                        )}
                        <button onClick={() => editProduct(product)} style={actionBtn}>Редагувати</button>
                        {product.status !== "active" && <button onClick={() => changeStatus(product.id, "active")} style={greenBtn}>Активувати</button>}
                        {product.status !== "paused" && <button onClick={() => changeStatus(product.id, "paused")} style={orangeBtn}>Пауза</button>}
                        <button onClick={() => deleteProduct(product.id)} style={dangerBtn}>Видалити</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {tab === "orders" && (
          <section style={panel}>
            <div style={sectionHead}>
              <div>
                <h2 style={sectionTitle}>Замовлення</h2>
                <p style={sectionSubtitle}>Заявки покупців із кошика.</p>
              </div>
              <button onClick={() => setOrders(loadOrders())} style={greyBtn}>Оновити</button>
            </div>

            {orders.length === 0 ? (
              <div style={empty}>Замовлень поки немає</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {orders.map(order => (
                  <article key={order.id} style={orderCard}>
                    <div style={orderTop}>
                      <div>
                        <h3 style={{ margin: 0, color: "#0F172A", fontSize: 18, fontWeight: 950 }}>Замовлення {order.id}</h3>
                        <p style={{ margin: "5px 0 0", color: "#64748B", fontSize: 13 }}>{new Date(order.createdAt).toLocaleString("uk-UA")}</p>
                      </div>
                      <Status status={order.status} />
                    </div>

                    <div style={orderGrid}>
                      <Mini label="Покупець" value={order.customer.name} />
                      <Mini label="Телефон" value={order.customer.phone} />
                      <Mini label="Місто" value={order.customer.city} />
                      <Mini label="Сума" value={money(order.totals.grandTotal)} />
                      <Mini label="Доставка" value={order.delivery.label} />
                      <Mini label="Оплата" value={order.payment.label} />
                    </div>

                    <div style={{ marginTop: 12, color: "#334155", fontSize: 13, lineHeight: 1.5 }}>
                      <b>Адреса:</b> {order.customer.address || "—"}<br />
                      <b>Коментар:</b> {order.customer.comment || "—"}
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 7 }}>
                      {order.items.map(item => (
                        <div key={item.id} style={orderItem}>
                          <span>{item.label}</span>
                          <b>{money(item.price)}</b>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                      <button onClick={() => changeOrderStatus(order.id, "confirmed")} style={greenBtn}>Підтвердити</button>
                      <button onClick={() => changeOrderStatus(order.id, "completed")} style={actionBtn}>Виконано</button>
                      <button onClick={() => changeOrderStatus(order.id, "cancelled")} style={dangerBtn}>Скасувати</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .vendor-product-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .vendor-form-grid { grid-template-columns: 1fr !important; }
          .vendor-stats { grid-template-columns: 1fr 1fr !important; }
          .vendor-mini-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function defaultImage(category: string) {
  if (category.includes("Підлога") || category.includes("Ламінат") || category.includes("Плитка")) return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80";
  if (category.includes("Освітлення")) return "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80";
  if (category.includes("Стіни") || category.includes("Фарба")) return "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80";
  return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: "grid", gap: 6 }}><span style={{ color: "#334155", fontSize: 12, fontWeight: 900 }}>{label}</span>{children}</label>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div style={stat}><div style={{ color: "#64748B", fontSize: 12, fontWeight: 850 }}>{label}</div><div style={{ color: "#0F172A", fontSize: 22, fontWeight: 950, marginTop: 4 }}>{value}</div></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div style={mini}><div style={{ color: "#64748B", fontSize: 11, fontWeight: 850 }}>{label}</div><div style={{ color: "#0F172A", fontSize: 13, fontWeight: 950, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div></div>;
}

function Status({ status }: { status: OrderStatus }) {
  const data = {
    new: { text: "Нове", bg: "#DBEAFE", color: "#1D4ED8" },
    confirmed: { text: "Підтверджено", bg: "#DCFCE7", color: "#166534" },
    completed: { text: "Виконано", bg: "#F1F5F9", color: "#475569" },
    cancelled: { text: "Скасовано", bg: "#FEE2E2", color: "#991B1B" },
  }[status];

  return <span style={{ background: data.bg, color: data.color, borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 950 }}>{data.text}</span>;
}

function aiStatusText(status: ProductForm["ai3dStatus"]) {
  if (status === "ready") return "Готово до AI";
  if (status === "generating") return "Обробка";
  if (status === "done") return "3D готова";
  if (status === "error") return "Помилка";
  return "Очікує фото";
}

function aiStatusBadge(status: ProductForm["ai3dStatus"]): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 950,
    whiteSpace: "nowrap",
  };

  if (status === "done") return { ...base, background: "#DCFCE7", color: "#166534" };
  if (status === "generating") return { ...base, background: "#FEF3C7", color: "#92400E" };
  if (status === "ready") return { ...base, background: "#DBEAFE", color: "#1D4ED8" };
  if (status === "error") return { ...base, background: "#FEE2E2", color: "#991B1B" };

  return { ...base, background: "#F1F5F9", color: "#475569" };
}

const hero: React.CSSProperties = { background: "linear-gradient(135deg,#0F172A,#1D4ED8)", color: "#fff", borderRadius: 28, padding: 24, display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center", marginBottom: 18, boxShadow: "0 24px 70px rgba(15,23,42,.22)" };
const badge: React.CSSProperties = { display: "inline-flex", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 950, marginBottom: 14 };
const heroTitle: React.CSSProperties = { margin: 0, fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.05, fontWeight: 950 };
const heroText: React.CSSProperties = { color: "#CBD5E1", fontSize: 15, lineHeight: 1.65, margin: "10px 0 0", maxWidth: 720 };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 18 };
const stat: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 15, boxShadow: "0 10px 30px rgba(15,23,42,.05)" };
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 18, boxShadow: "0 14px 40px rgba(15,23,42,.05)", marginBottom: 18 };
const sectionHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 };
const sectionTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 22, fontWeight: 950 };
const sectionSubtitle: React.CSSProperties = { margin: "5px 0 0", color: "#64748B", fontSize: 13, lineHeight: 1.5 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.3fr 1fr .8fr .8fr .8fr 1fr", gap: 10 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "12px 13px", fontSize: 14, color: "#0F172A", background: "#fff", outline: "none", fontFamily: "inherit" };
const fileInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1.5px dashed #CBD5E1",
  borderRadius: 14,
  padding: "12px 13px",
  fontSize: 14,
  color: "#334155",
  background: "#F8FAFC",
  outline: "none",
  fontFamily: "inherit",
};

const previewBox: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  border: "1px solid #E2E8F0",
  background: "#F8FAFC",
  borderRadius: 16,
  padding: 10,
};

const previewImg: React.CSSProperties = {
  width: 86,
  height: 68,
  borderRadius: 12,
  objectFit: "cover",
  background: "#E2E8F0",
};

const aiModelBox: React.CSSProperties = {
  border: "1.5px solid #E2E8F0",
  background: "linear-gradient(135deg,#F8FAFC,#FFFFFF)",
  borderRadius: 18,
  padding: 14,
  display: "grid",
  gap: 12,
};

const aiModelHead: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const aiPhotoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(86px,1fr))",
  gap: 8,
};

const aiPhotoCard: React.CSSProperties = {
  position: "relative",
  height: 76,
  borderRadius: 14,
  overflow: "hidden",
  background: "#E2E8F0",
  border: "1px solid #E2E8F0",
};

const aiGenerateBtn: React.CSSProperties = {
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "13px 16px",
  fontSize: 14,
  fontWeight: 950,
};

const aiResultBox: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#166534",
  borderRadius: 14,
  padding: 12,
  display: "grid",
  gap: 4,
  fontSize: 12,
  wordBreak: "break-all",
};

const checkboxRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#334155",
  fontSize: 14,
  fontWeight: 850,
};

const whiteBtn: React.CSSProperties = { background: "#fff", color: "#0F172A", border: "none", borderRadius: 14, padding: "12px 18px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const blueBtn: React.CSSProperties = { background: "#2563EB", color: "#fff", border: "none", borderRadius: 14, padding: "12px 18px", fontSize: 14, fontWeight: 950, cursor: "pointer", display: "inline-flex", alignItems: "center" };
const greyBtn: React.CSSProperties = { background: "#F8FAFC", color: "#334155", border: "1px solid #E2E8F0", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontWeight: 900, cursor: "pointer" };
const empty: React.CSSProperties = { textAlign: "center", padding: "48px 18px", color: "#64748B", background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 18 };
const productRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "100px minmax(0,1fr) 180px", gap: 14, alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 20, padding: 12, background: "#fff" };
const thumbWrap: React.CSSProperties = { width: 100, height: 86, borderRadius: 18, overflow: "hidden", background: "#F1F5F9" };
const thumb: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const productTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 17, fontWeight: 950 };
const productDesc: React.CSSProperties = { color: "#64748B", fontSize: 13, lineHeight: 1.45, margin: "7px 0 10px" };
const miniGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 };
const mini: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "8px 9px", minWidth: 0 };
const actions: React.CSSProperties = { display: "grid", gap: 7 };
const actionBtn: React.CSSProperties = { background: "#fff", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 950, cursor: "pointer" };
const greenBtn: React.CSSProperties = { ...actionBtn, color: "#166534", background: "#DCFCE7", borderColor: "#BBF7D0" };
const orangeBtn: React.CSSProperties = { ...actionBtn, color: "#92400E", background: "#FEF3C7", borderColor: "#FDE68A" };
const dangerBtn: React.CSSProperties = { ...actionBtn, color: "#DC2626", borderColor: "#FECACA" };
const tabs: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 };
const tabBtn: React.CSSProperties = { background: "#fff", color: "#334155", border: "1px solid #E2E8F0", borderRadius: 999, padding: "10px 16px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const tabActive: React.CSSProperties = { ...tabBtn, background: "#2563EB", color: "#fff", borderColor: "#2563EB" };
const orderCard: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 20, padding: 16, background: "#fff" };
const orderTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 12 };
const orderGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 };
const orderItem: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "9px 10px", color: "#334155", fontSize: 13 };
