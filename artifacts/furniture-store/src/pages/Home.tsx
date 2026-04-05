import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "../context/CartContext";

/* ─── catalogue items ──────────────────────────────────────── */
const CATALOG = [
  {
    id: "dining",
    name: "Обідні столи",
    addTo: "dining",
    image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=500&q=80",
    bg: "#F9F6F2",
  },
  {
    id: "chairs",
    name: "Офісні крісла",
    addTo: "armchair",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=500&q=80",
    bg: "#F4F4F7",
  },
  {
    id: "wardrobes",
    name: "Шафи",
    addTo: "bookshelf",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80",
    bg: "#F5F5F5",
  },
  {
    id: "beds",
    name: "Ліжка",
    addTo: "sofa",
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=500&q=80",
    bg: "#F4F5F7",
  },
];

/* ─── image with fallback ──────────────────────────────────── */
function SafeImg({
  src, alt, className, bg = "#F0EBE4",
}: { src: string; alt: string; className?: string; bg?: string }) {
  const [err, setErr] = useState(false);
  if (err)
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: bg }}>
        <span className="text-4xl opacity-20">🛋</span>
      </div>
    );
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

/* ─── nav ──────────────────────────────────────────────────── */
function Nav() {
  const { itemCount } = useCart();
  return (
    <header
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fff",
        borderBottom: "1px solid #F0F0F0",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* Logo */}
        <Link href="/">
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#111",
              cursor: "pointer",
              userSelect: "none",
              textDecoration: "none",
            }}
          >
            FORMA<span style={{ fontWeight: 300, color: "#2563EB" }}>HAUS</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: "flex", gap: 28, marginLeft: 8 }}>
          <a
            href="/"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111",
              textDecoration: "none",
            }}
          >
            Home
          </a>
          <a
            href="#catalog"
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: "#888",
              textDecoration: "none",
            }}
          >
            Catalog
          </a>
        </nav>

        {/* Right */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/cart">
            <button
              style={{
                position: "relative",
                background: "none",
                border: "1px solid #E5E5E5",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: "#333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Кошик
              {itemCount > 0 && (
                <span
                  style={{
                    background: "#2563EB",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </Link>
          <button
            style={{
              background: "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── hero ─────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      style={{
        background: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "72px 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 64,
          flexWrap: "wrap",
        }}
      >
        {/* Left */}
        <div style={{ flex: "1 1 340px", minWidth: 260 }}>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 900,
              color: "#111",
              lineHeight: 1.1,
              margin: "0 0 16px",
            }}
          >
            Меблі, які<br />дизайнери люблять
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#777",
              lineHeight: 1.6,
              margin: "0 0 32px",
              maxWidth: 340,
            }}
          >
            Обирай меблі для кухні, кімнати чи вітальні у нашому магазині
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#catalog" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "#2563EB",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View catalog
              </button>
            </a>
            <Link href="/designer">
              <button
                style={{
                  background: "none",
                  color: "#555",
                  border: "1px solid #E0E0E0",
                  borderRadius: 10,
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                3D Designer
              </button>
            </Link>
          </div>
        </div>

        {/* Right — single static interior photo */}
        <div style={{ flex: "1 1 380px", minWidth: 280 }}>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "#F5F0E8",
            }}
          >
            <SafeImg
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
              alt="Modern living room interior"
              className="w-full h-full object-cover"
              bg="#F5F0E8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── catalog grid ─────────────────────────────────────────── */
function CatalogGrid() {
  return (
    <section
      id="catalog"
      style={{
        background: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "24px 32px 80px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#111",
            margin: "0 0 28px",
          }}
        >
          Каталог
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {CATALOG.map(cat => (
            <CatalogCard key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogCard({ cat }: { cat: typeof CATALOG[number] }) {
  const [hov, setHov] = useState(false);
  const [btnHov, setBtnHov] = useState(false);

  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #EBEBEB",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow .2s, transform .2s",
        boxShadow: hov ? "0 8px 32px rgba(0,0,0,.08)" : "none",
        transform: hov ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Product image on light background */}
      <div
        style={{
          background: cat.bg,
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <SafeImg
          src={cat.image}
          alt={cat.name}
          className="w-4/5 h-4/5 object-contain"
          bg={cat.bg}
        />

        {/* "Try in 3D" — appears on hover */}
        {hov && (
          <Link href={`/designer?add=${cat.addTo}`}>
            <button
              onMouseEnter={() => setBtnHov(true)}
              onMouseLeave={() => setBtnHov(false)}
              style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: "#111",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,.14)",
                opacity: btnHov ? 1 : 0.92,
                whiteSpace: "nowrap",
              }}
              onClick={e => e.stopPropagation()}
            >
              Приміряти у 3D
            </button>
          </Link>
        )}
      </div>

      {/* Name */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#111",
            textAlign: "center",
          }}
        >
          {cat.name}
        </div>
      </div>
    </article>
  );
}

/* ─── page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <CatalogGrid />
    </div>
  );
}
