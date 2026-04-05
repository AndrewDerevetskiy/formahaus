import { useState } from "react";
import { Link, useLocation } from "wouter";
import { API_BASE } from "../lib/api";

export default function VendorRegister() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ shop_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/vendor/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Помилка реєстрації"); return; }
      localStorage.setItem("vendor", JSON.stringify(data.vendor));
      navigate("/vendor/dashboard");
    } catch {
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #F0F0F0", height: 64, display: "flex", alignItems: "center", padding: "0 32px" }}>
        <Link href="/"><span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, color: "#111", cursor: "pointer", userSelect: "none" }}>FORMA<span style={{ fontWeight: 300, color: "#2563EB" }}>HAUS</span></span></Link>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>Реєстрація продавця</h1>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 32px" }}>Створіть магазин і додавайте свої товари</p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: 14, marginBottom: 20 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Назва магазину</label>
              <input
                value={form.shop_name}
                onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                placeholder="Мій меблевий магазин"
                required
                style={{ width: "100%", height: 44, border: "1.5px solid #E5E5E5", borderRadius: 10, padding: "0 14px", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                style={{ width: "100%", height: 44, border: "1.5px solid #E5E5E5", borderRadius: 10, padding: "0 14px", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 }}>Пароль</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Мінімум 8 символів"
                minLength={8}
                required
                style={{ width: "100%", height: 44, border: "1.5px solid #E5E5E5", borderRadius: 10, padding: "0 14px", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ height: 48, borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 8 }}
            >
              {loading ? "Реєстрація..." : "Зареєструватися"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 14, color: "#888", textAlign: "center" }}>
            Вже маєте акаунт?{" "}
            <Link href="/vendor/login"><span style={{ color: "#2563EB", fontWeight: 600, cursor: "pointer" }}>Увійти</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
