import { useMemo, useState } from "react";
import { Link } from "wouter";
import NavBar from "../components/NavBar";
import { useCart } from "../context/CartContext";

type DeliveryMethod = "nova_poshta" | "ukrposhta" | "courier" | "pickup";
type PaymentMethod = "cod" | "card_later" | "bank_transfer" | "cash";

type OrderStatus = "new" | "confirmed" | "completed" | "cancelled";

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
    method: DeliveryMethod;
    label: string;
    price: number;
  };
  payment: {
    method: PaymentMethod;
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
  roomMaterials: {
    floorKind: string;
    wallColorId: string;
  };
  createdAt: string;
};

const LS_ORDERS = "formahaus_orders";

const DELIVERY_OPTIONS: Record<DeliveryMethod, { label: string; price: number; description: string }> = {
  nova_poshta: {
    label: "Нова пошта",
    price: 180,
    description: "Доставка у відділення або поштомат",
  },
  ukrposhta: {
    label: "Укрпошта",
    price: 95,
    description: "Економна доставка по Україні",
  },
  courier: {
    label: "Курʼєр",
    price: 450,
    description: "Доставка курʼєром по місту",
  },
  pickup: {
    label: "Самовивіз",
    price: 0,
    description: "Самовивіз зі складу / магазину",
  },
};

const PAYMENT_OPTIONS: Record<PaymentMethod, { label: string; description: string }> = {
  cod: {
    label: "Оплата при отриманні",
    description: "Покупець платить після огляду товару",
  },
  card_later: {
    label: "Онлайн-оплата пізніше",
    description: "Менеджер надішле посилання на оплату",
  },
  bank_transfer: {
    label: "Оплата на рахунок ФОП / ТОВ",
    description: "Для юридичних осіб або передплати",
  },
  cash: {
    label: "Готівкою",
    description: "При самовивозі або курʼєрській доставці",
  },
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("uk-UA")} грн`;
}

function loadOrders(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(LS_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrder(order: SavedOrder) {
  const orders = loadOrders();
  localStorage.setItem(LS_ORDERS, JSON.stringify([order, ...orders]));
}

export default function Cart() {
  const cart = useCart();

  const [createdOrder, setCreatedOrder] = useState<SavedOrder | null>(null);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    comment: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("nova_poshta");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const delivery = DELIVERY_OPTIONS[deliveryMethod];
  const payment = PAYMENT_OPTIONS[paymentMethod];

  const grandTotal = useMemo(() => {
    return cart.grandTotal + delivery.price;
  }, [cart.grandTotal, delivery.price]);

  function updateCustomer(key: keyof typeof customer, value: string) {
    setCustomer(prev => ({ ...prev, [key]: value }));
  }

  function submitOrder() {
    if (!cart.items.length) {
      alert("Кошик порожній");
      return;
    }

    if (!customer.name.trim()) {
      alert("Вкажіть імʼя покупця");
      return;
    }

    if (!customer.phone.trim()) {
      alert("Вкажіть телефон");
      return;
    }

    if (!customer.city.trim()) {
      alert("Вкажіть місто");
      return;
    }

    if (deliveryMethod !== "pickup" && !customer.address.trim()) {
      alert("Вкажіть адресу або відділення доставки");
      return;
    }

    const order: SavedOrder = {
      id: `FH-${Date.now().toString().slice(-8)}`,
      status: "new",
      customer,
      delivery: {
        method: deliveryMethod,
        label: delivery.label,
        price: delivery.price,
      },
      payment: {
        method: paymentMethod,
        label: payment.label,
      },
      items: cart.items.map(item => ({
        id: item.id,
        type: item.type,
        label: item.label,
        price: item.price,
        quantity: 1,
      })),
      totals: {
        itemsTotal: cart.furnitureTotal,
        floorTotal: cart.floorTotal,
        wallTotal: cart.wallTotal,
        deliveryTotal: delivery.price,
        grandTotal,
      },
      roomMaterials: {
        floorKind: cart.floorKind,
        wallColorId: cart.wallColorId,
      },
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);
    setCreatedOrder(order);
    cart.clearItems();
  }

  if (createdOrder) {
    return (
      <div style={page}>
        <NavBar activePage="cart" />

        <main style={{ maxWidth: 760, margin: "0 auto", padding: "70px 18px" }}>
          <section style={successCard}>
            <div style={successIcon}>✓</div>
            <h1 style={successTitle}>Замовлення створено</h1>
            <p style={successText}>
              Заявка збережена. Тепер її можна побачити в кабінеті продавця в розділі замовлень.
            </p>

            <div style={successGrid}>
              <InfoBox label="Номер" value={createdOrder.id} />
              <InfoBox label="Статус" value="Нове" />
              <InfoBox label="Покупець" value={createdOrder.customer.name} />
              <InfoBox label="Телефон" value={createdOrder.customer.phone} />
              <InfoBox label="Доставка" value={createdOrder.delivery.label} />
              <InfoBox label="Оплата" value={createdOrder.payment.label} />
              <InfoBox label="Сума" value={money(createdOrder.totals.grandTotal)} />
              <InfoBox label="Місто" value={createdOrder.customer.city} />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <button style={secondaryBtn}>До каталогу</button>
              </Link>
              <Link href="/vendor/dashboard" style={{ textDecoration: "none" }}>
                <button style={primaryBtn}>Кабінет продавця</button>
              </Link>
            </div>
          </section>
        </main>

        <style>{`
          @media (max-width: 620px) {
            .success-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={page}>
      <NavBar activePage="cart" />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 18px 72px" }}>
        <div style={pageHead}>
          <div>
            <h1 style={title}>Оформлення замовлення</h1>
            <p style={subtitle}>Перевірте товари, оберіть доставку та спосіб оплати.</p>
          </div>

          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={secondaryBtn}>Продовжити покупки</button>
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <section style={emptyCard}>
            <div style={{ fontSize: 54, marginBottom: 12 }}>🛒</div>
            <h2 style={{ margin: 0, color: "#0F172A", fontSize: 30, fontWeight: 950 }}>Кошик порожній</h2>
            <p style={{ color: "#64748B", margin: "10px 0 22px" }}>Додайте товари з каталогу або з 3D редактора.</p>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={primaryBtn}>До каталогу</button>
            </Link>
          </section>
        ) : (
          <section style={layout} className="checkout-layout">
            <div style={{ display: "grid", gap: 16 }}>
              <Panel title="Товари в замовленні">
                <div style={{ display: "grid", gap: 10 }}>
                  {cart.items.map(item => (
                    <div key={item.id} style={itemRow}>
                      <div style={itemIcon}>{String(item.icon || "Товар").slice(0, 2)}</div>
                      <div>
                        <div style={itemName}>{item.label}</div>
                        <div style={itemMeta}>Тип: {item.type}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={itemPrice}>{money(item.price)}</div>
                        <button onClick={() => cart.removeItem(item.id)} style={removeBtn}>Видалити</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Дані покупця">
                <div style={formGrid} className="checkout-form-grid">
                  <Field label="Імʼя">
                    <input value={customer.name} onChange={e => updateCustomer("name", e.target.value)} placeholder="Ваше імʼя" style={input} />
                  </Field>

                  <Field label="Телефон">
                    <input value={customer.phone} onChange={e => updateCustomer("phone", e.target.value)} placeholder="+380..." style={input} />
                  </Field>

                  <Field label="Місто">
                    <input value={customer.city} onChange={e => updateCustomer("city", e.target.value)} placeholder="Київ, Львів, Ірпінь..." style={input} />
                  </Field>

                  <Field label="Адреса / відділення">
                    <input value={customer.address} onChange={e => updateCustomer("address", e.target.value)} placeholder="Відділення Нової пошти або адреса" style={input} />
                  </Field>
                </div>

                <Field label="Коментар до замовлення">
                  <textarea value={customer.comment} onChange={e => updateCustomer("comment", e.target.value)} placeholder="Побажання, уточнення, зручний час дзвінка..." style={{ ...input, minHeight: 86, resize: "vertical", marginTop: 6 }} />
                </Field>
              </Panel>

              <Panel title="Доставка">
                <div style={optionGrid}>
                  {(Object.keys(DELIVERY_OPTIONS) as DeliveryMethod[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setDeliveryMethod(key)}
                      style={deliveryMethod === key ? optionActive : optionBtn}
                    >
                      <b>{DELIVERY_OPTIONS[key].label}</b>
                      <span>{DELIVERY_OPTIONS[key].description}</span>
                      <strong>{DELIVERY_OPTIONS[key].price === 0 ? "Безкоштовно" : money(DELIVERY_OPTIONS[key].price)}</strong>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Оплата">
                <div style={optionGrid}>
                  {(Object.keys(PAYMENT_OPTIONS) as PaymentMethod[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      style={paymentMethod === key ? optionActive : optionBtn}
                    >
                      <b>{PAYMENT_OPTIONS[key].label}</b>
                      <span>{PAYMENT_OPTIONS[key].description}</span>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <aside style={summary}>
              <h2 style={{ margin: 0, color: "#0F172A", fontSize: 22, fontWeight: 950 }}>Разом</h2>

              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                <SummaryRow label="Товари" value={money(cart.furnitureTotal)} />
                <SummaryRow label="Підлога" value={money(cart.floorTotal)} />
                <SummaryRow label="Стіни / обої" value={money(cart.wallTotal)} />
                <SummaryRow label={`Доставка · ${delivery.label}`} value={delivery.price === 0 ? "Безкоштовно" : money(delivery.price)} />

                <div style={totalLine}>
                  <span>До оплати</span>
                  <b>{money(grandTotal)}</b>
                </div>
              </div>

              <div style={summaryNote}>
                <b>Оплата:</b> {payment.label}<br />
                <b>Доставка:</b> {delivery.description}
              </div>

              <button onClick={submitOrder} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>
                Оформити замовлення
              </button>

              <button onClick={cart.clearItems} style={{ ...secondaryBtn, width: "100%", marginTop: 10, color: "#DC2626", borderColor: "#FECACA" }}>
                Очистити кошик
              </button>
            </aside>
          </section>
        )}
      </main>

      <style>{`
        @media (max-width: 960px) {
          .checkout-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .checkout-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={panel}>
      <h2 style={panelTitle}>{title}</h2>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#334155", fontSize: 12, fontWeight: 900 }}>{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={summaryRow}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBox}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',system-ui,sans-serif" };
const pageHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 22 };
const title: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: "clamp(30px,4vw,46px)", fontWeight: 950, letterSpacing: "-1px" };
const subtitle: React.CSSProperties = { color: "#64748B", margin: "8px 0 0", fontSize: 15 };
const layout: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 22, alignItems: "start" };
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 18, boxShadow: "0 14px 40px rgba(15,23,42,.05)" };
const panelTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 20, fontWeight: 950 };
const itemRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "58px 1fr auto", gap: 12, alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 18, padding: 10 };
const itemIcon: React.CSSProperties = { width: 58, height: 58, borderRadius: 16, background: "#EEF2FF", color: "#1D4ED8", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 950 };
const itemName: React.CSSProperties = { color: "#0F172A", fontSize: 15, fontWeight: 950 };
const itemMeta: React.CSSProperties = { color: "#64748B", fontSize: 12, marginTop: 3 };
const itemPrice: React.CSSProperties = { color: "#0F172A", fontSize: 17, fontWeight: 950 };
const removeBtn: React.CSSProperties = { background: "transparent", border: "none", color: "#DC2626", fontSize: 12, fontWeight: 900, cursor: "pointer", marginTop: 4 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "12px 13px", fontSize: 14, color: "#0F172A", background: "#fff", outline: "none", fontFamily: "inherit" };
const optionGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 };
const optionBtn: React.CSSProperties = { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: 14, textAlign: "left", cursor: "pointer", display: "grid", gap: 5, color: "#334155" };
const optionActive: React.CSSProperties = { ...optionBtn, borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,.12)", background: "#EFF6FF" };
const summary: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 20, boxShadow: "0 16px 45px rgba(15,23,42,.06)", position: "sticky", top: 18 };
const summaryRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, color: "#64748B", fontSize: 14, fontWeight: 750 };
const totalLine: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 14, marginTop: 6, color: "#0F172A", fontSize: 16, fontWeight: 950 };
const summaryNote: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 13, color: "#64748B", fontSize: 13, lineHeight: 1.6, marginTop: 16 };
const primaryBtn: React.CSSProperties = { background: "#2563EB", color: "#fff", border: "none", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 950, cursor: "pointer", boxShadow: "0 14px 30px rgba(37,99,235,.20)" };
const secondaryBtn: React.CSSProperties = { background: "#fff", color: "#2563EB", border: "1.5px solid #BFDBFE", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const emptyCard: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: "70px 20px", textAlign: "center", boxShadow: "0 16px 45px rgba(15,23,42,.05)" };
const successCard: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: "44px 22px", textAlign: "center", boxShadow: "0 20px 60px rgba(15,23,42,.08)" };
const successIcon: React.CSSProperties = { width: 82, height: 82, borderRadius: "50%", background: "#DCFCE7", color: "#166534", display: "grid", placeItems: "center", fontSize: 44, margin: "0 auto 18px" };
const successTitle: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 34, fontWeight: 950 };
const successText: React.CSSProperties = { color: "#64748B", fontSize: 15, lineHeight: 1.7, margin: "14px auto 24px", maxWidth: 540 };
const successGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left" };
const infoBox: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 14, display: "grid", gap: 4 };
