import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";

export default function ProtectedVendor({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (!auth.isLoggedIn) {
    return (
      <div style={page}>
        <section style={card}>
          <h1 style={title}>Потрібен вхід</h1>
          <p style={text}>Щоб відкрити кабінет продавця, спочатку увійдіть або зареєструйтесь.</p>
          <div style={buttons}>
            <Link href="/login" style={{ textDecoration: "none" }}><button style={primary}>Увійти</button></Link>
            <Link href="/register" style={{ textDecoration: "none" }}><button style={secondary}>Реєстрація</button></Link>
          </div>
        </section>
      </div>
    );
  }

  if (!auth.isVendor) {
    return (
      <div style={page}>
        <section style={card}>
          <h1 style={title}>Це кабінет продавця</h1>
          <p style={text}>Ваш акаунт створено як покупець. Зареєструйте акаунт продавця, щоб додавати товари.</p>
          <Link href="/register" style={{ textDecoration: "none" }}><button style={primary}>Стати продавцем</button></Link>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8FAFC", display: "grid", placeItems: "center", padding: 18, fontFamily: "Inter,system-ui,sans-serif" };
const card: React.CSSProperties = { maxWidth: 520, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: 28, textAlign: "center", boxShadow: "0 22px 70px rgba(15,23,42,.08)" };
const title: React.CSSProperties = { margin: 0, color: "#0F172A", fontSize: 32, fontWeight: 950 };
const text: React.CSSProperties = { color: "#64748B", fontSize: 15, lineHeight: 1.7, margin: "12px 0 22px" };
const buttons: React.CSSProperties = { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" };
const primary: React.CSSProperties = { background: "#2563EB", color: "#fff", border: "none", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const secondary: React.CSSProperties = { background: "#fff", color: "#2563EB", border: "1.5px solid #BFDBFE", borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
