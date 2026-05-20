import { useState } from "react";
import { Link, useLocation } from "wouter";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = auth.login(email, password);
    if (!ok) return alert("Невірний email або пароль");
    setLocation("/vendor/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter,system-ui,sans-serif" }}>
      <NavBar activePage="login" />
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "70px 18px" }}>
        <section style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: 26, boxShadow: "0 22px 70px rgba(15,23,42,.08)" }}>
          <div style={{ display: "inline-flex", background: "#DBEAFE", color: "#1D4ED8", borderRadius: 999, padding: "7px 13px", fontSize: 12, fontWeight: 950 }}>FORMAHAUS</div>
          <h1 style={{ margin: "18px 0 0", color: "#0F172A", fontSize: 38, fontWeight: 950 }}>Вхід</h1>
          <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.6, margin: "8px 0 22px" }}>Увійдіть як продавець або покупець.</p>

          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <label style={label}>Email
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@email.com" style={input} />
            </label>
            <label style={label}>Пароль
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="••••••••" style={input} />
            </label>
            <button type="submit" style={primary}>Увійти</button>
          </form>

          <p style={{ color: "#64748B", fontSize: 14, margin: "18px 0 0", textAlign: "center" }}>
            Немає акаунта? <Link href="/register" style={{ color: "#2563EB", fontWeight: 900, textDecoration: "none" }}>Зареєструватися</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

const label: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontSize: 13, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "13px 14px", fontSize: 15, outline: "none" };
const primary: React.CSSProperties = { background: "#2563EB", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontSize: 15, fontWeight: 950, cursor: "pointer" };
