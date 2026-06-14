import { useState } from "react";
import { Link, useLocation } from "wouter";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";

export default function VendorRegister() {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const [form, setForm] = useState({ shop_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.register({
        name: form.shop_name.trim(),
        vendorName: form.shop_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "vendor",
      });

      navigate("/vendor/dashboard");
    } catch (err: any) {
      setError(err?.message || "Помилка реєстрації продавця");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <NavBar activePage="vendor" />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 8px" }}>Реєстрація продавця</h1>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 32px" }}>Створіть реальний магазин у Supabase і додавайте товари</p>

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
                style={input}
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
                style={input}
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
                style={input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ height: 48, borderRadius: 10, background: "#2E9D51", color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 8 }}
            >
              {loading ? "Створення магазину..." : "Зареєструвати магазин"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 14, color: "#888", textAlign: "center" }}>
            Вже маєте акаунт?{" "}
            <Link href="/login"><span style={{ color: "#2E9D51", fontWeight: 700, cursor: "pointer" }}>Увійти</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  height: 44,
  border: "1.5px solid #E5E5E5",
  borderRadius: 10,
  padding: "0 14px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};
