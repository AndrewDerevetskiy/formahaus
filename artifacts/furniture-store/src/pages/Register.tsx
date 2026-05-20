import { useState } from "react";
import { Link, useLocation } from "wouter";
import NavBar from "../components/NavBar";
import { useAuth, type UserRole } from "../context/AuthContext";

export default function Register() {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const [role, setRole] = useState<UserRole>("vendor");
  const [name, setName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      auth.register({ role, name, vendorName, phone, email, password });
      setLocation(role === "vendor" ? "/vendor/dashboard" : "/");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка реєстрації");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter,system-ui,sans-serif" }}>
      <NavBar activePage="register" />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "46px 18px 70px" }}>
        <section style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: 26, boxShadow: "0 22px 70px rgba(15,23,42,.08)" }}>
          <div style={{ display: "inline-flex", background: "#DBEAFE", color: "#1D4ED8", borderRadius: 999, padding: "7px 13px", fontSize: 12, fontWeight: 950 }}>СТАРТ ПРОДАЖІВ</div>
          <h1 style={{ margin: "18px 0 0", color: "#0F172A", fontSize: 38, fontWeight: 950 }}>Створити акаунт</h1>
          <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.6, margin: "8px 0 22px" }}>Зареєструйтесь як продавець і починайте додавати товари.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button type="button" onClick={() => setRole("vendor")} style={role === "vendor" ? roleActive : roleBtn}>Я продавець</button>
            <button type="button" onClick={() => setRole("buyer")} style={role === "buyer" ? roleActive : roleBtn}>Я покупець</button>
          </div>

          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <label style={label}>Ваше імʼя
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Андрій" style={input} />
            </label>
            {role === "vendor" && (
              <label style={label}>Назва магазину
                <input value={vendorName} onChange={e => setVendorName(e.target.value)} required placeholder="FormaHaus Store" style={input} />
              </label>
            )}
            <label style={label}>Телефон
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380..." style={input} />
            </label>
            <label style={label}>Email
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@email.com" style={input} />
            </label>
            <label style={label}>Пароль
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={4} placeholder="мінімум 4 символи" style={input} />
            </label>
            <button type="submit" style={primary}>{role === "vendor" ? "Зареєструвати продавця" : "Зареєструватися"}</button>
          </form>

          <p style={{ color: "#64748B", fontSize: 14, margin: "18px 0 0", textAlign: "center" }}>
            Вже є акаунт? <Link href="/login" style={{ color: "#2563EB", fontWeight: 900, textDecoration: "none" }}>Увійти</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

const roleBtn: React.CSSProperties = { background: "#F8FAFC", color: "#334155", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "13px 12px", fontSize: 14, fontWeight: 950, cursor: "pointer" };
const roleActive: React.CSSProperties = { ...roleBtn, background: "#2563EB", color: "#fff", borderColor: "#2563EB" };
const label: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontSize: 13, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "13px 14px", fontSize: 15, outline: "none" };
const primary: React.CSSProperties = { background: "#2563EB", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontSize: 15, fontWeight: 950, cursor: "pointer" };
