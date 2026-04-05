import { Link } from "wouter";
import { useCart } from "../context/CartContext";

interface NavBarProps {
  activePage?: "store" | "vendor" | "cart";
}

export default function NavBar({ activePage }: NavBarProps) {
  const { itemCount } = useCart();

  const linkStyle = (page: string): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: activePage === page ? 700 : 400,
    color: activePage === page ? "#111" : "#888",
    textDecoration: "none",
    paddingBottom: 2,
    borderBottom: activePage === page ? "2px solid #2563EB" : "2px solid transparent",
    transition: "color .15s, border-color .15s",
  });

  return (
    <header style={{
      background: "#fff",
      borderBottom: "1px solid #F0F0F0",
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, color: "#111", userSelect: "none" }}>
            FORMA<span style={{ fontWeight: 300, color: "#2563EB" }}>HAUS</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: "flex", gap: 32, margin: "0 auto", alignItems: "center" }}>
          <Link href="/" style={linkStyle("store")}>Магазин</Link>
          <Link href="/designer" style={{ ...linkStyle("designer"), display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>⬡</span> 3D Конструктор
          </Link>
          <Link href="/vendor/dashboard" style={linkStyle("vendor")}>
            Продавцям
          </Link>
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link href="/cart" style={{ textDecoration: "none" }}>
            <button style={{
              position: "relative",
              background: "#F7F7F7",
              border: "1px solid #E8E8E8",
              borderRadius: 10,
              padding: "7px 18px",
              fontSize: 14,
              fontWeight: 600,
              color: "#333",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "background .15s",
            }}>
              🛒 Кошик
              {itemCount > 0 && (
                <span style={{
                  background: "#2563EB",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "1px 7px",
                  lineHeight: 1.5,
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </Link>
          <Link href="/vendor/register" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 22px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}>
              Увійти
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
