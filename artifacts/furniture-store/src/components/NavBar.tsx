import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type NavBarProps = {
  activePage?: string;
};

export default function NavBar({ activePage = "" }: NavBarProps) {
  const cart = useCart();
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  function go(path: string) {
    setOpen(false);
    setLocation(path);
  }

  const links = [
    { id: "store", label: "Магазин", path: "/" },
    { id: "designer", label: "3D Конструктор", path: "/designer" },
    { id: "vendor", label: "Продавцям", path: "/vendor/dashboard" },
  ];

  return (
    <header className="fh-navbar">
      <div className="fh-navbar-inner">
        <Link href="/" className="fh-navbar-brand" onClick={() => setOpen(false)}>
          <span className="fh-navbar-logo">F</span>
          <span className="fh-navbar-name">
            FORMA<span>HAUS</span>
          </span>
        </Link>

        <nav className="fh-navbar-desktop">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => go(link.path)}
              className={
                activePage === link.id || location === link.path
                  ? "fh-nav-link active"
                  : "fh-nav-link"
              }
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="fh-navbar-actions">
          <button onClick={() => go("/cart")} className="fh-cart-button">
            <span className="fh-cart-icon">🛒</span>
            <span className="fh-cart-text">Кошик</span>
            {cart.itemCount > 0 && <span className="fh-cart-count">{cart.itemCount}</span>}
          </button>

          {auth.isLoggedIn ? (
            <button
              onClick={() => {
                auth.logout();
                setOpen(false);
              }}
              className="fh-login-button"
            >
              Вийти
            </button>
          ) : (
            <button onClick={() => go("/login")} className="fh-login-button">
              Увійти
            </button>
          )}

          <button
            onClick={() => setOpen(v => !v)}
            className="fh-burger"
            aria-label="Меню"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="fh-mobile-menu">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => go(link.path)}
              className={
                activePage === link.id || location === link.path
                  ? "fh-mobile-link active"
                  : "fh-mobile-link"
              }
            >
              {link.label}
            </button>
          ))}

          <div className="fh-mobile-separator" />

          <button onClick={() => go("/cart")} className="fh-mobile-link">
            Кошик {cart.itemCount > 0 ? `(${cart.itemCount})` : ""}
          </button>

          {auth.isLoggedIn ? (
            <button
              onClick={() => {
                auth.logout();
                setOpen(false);
              }}
              className="fh-mobile-link danger"
            >
              Вийти
            </button>
          ) : (
            <button onClick={() => go("/login")} className="fh-mobile-link">
              Увійти
            </button>
          )}
        </div>
      )}

      <style>{`
        .fh-navbar {
          width: 100%;
          max-width: 100%;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(17, 24, 39, 0.94);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,.08);
          box-sizing: border-box;
        }

        .fh-navbar-inner {
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
          min-height: 72px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          box-sizing: border-box;
        }

        .fh-navbar-brand {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          text-decoration: none;
          flex-shrink: 0;
        }

        .fh-navbar-logo {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          background: linear-gradient(135deg,#1D4ED8,#111827);
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 22px;
          font-weight: 950;
          box-shadow: 0 12px 30px rgba(37,99,235,.22);
          flex-shrink: 0;
        }

        .fh-navbar-name {
          color: #fff;
          font-size: 17px;
          font-weight: 950;
          letter-spacing: 4px;
          white-space: nowrap;
        }

        .fh-navbar-name span {
          color: #60A5FA;
        }

        .fh-navbar-desktop {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }

        .fh-nav-link {
          border: none;
          background: transparent;
          color: #CBD5E1;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          white-space: nowrap;
        }

        .fh-nav-link.active {
          background: rgba(37,99,235,.14);
          color: #93C5FD;
          box-shadow: inset 0 -2px 0 #2563EB;
        }

        .fh-navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .fh-cart-button {
          position: relative;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: #fff;
          border-radius: 14px;
          padding: 11px 14px;
          min-height: 44px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .fh-cart-count {
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          background: #2563EB;
          color: #fff;
          display: inline-grid;
          place-items: center;
          font-size: 12px;
          font-weight: 950;
          padding: 0 6px;
        }

        .fh-login-button {
          border: none;
          background: #2563EB;
          color: #fff;
          border-radius: 14px;
          padding: 12px 16px;
          min-height: 44px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
          white-space: nowrap;
        }

        .fh-burger {
          display: none;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          border-radius: 14px;
          padding: 10px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .fh-burger span {
          display: block;
          height: 2px;
          background: #fff;
          border-radius: 99px;
          margin: 5px 0;
        }

        .fh-mobile-menu {
          display: none;
        }

        @media (max-width: 900px) {
          .fh-navbar-inner {
            min-height: 68px;
            padding: 0 14px;
          }

          .fh-navbar-desktop {
            display: none;
          }

          .fh-burger {
            display: block;
          }

          .fh-navbar-name {
            font-size: 15px;
            letter-spacing: 3px;
          }

          .fh-navbar-logo {
            width: 42px;
            height: 42px;
            border-radius: 14px;
          }

          .fh-mobile-menu {
            display: grid;
            gap: 8px;
            padding: 12px 14px 16px;
            background: rgba(17,24,39,.98);
            border-top: 1px solid rgba(255,255,255,.08);
          }

          .fh-mobile-link {
            width: 100%;
            min-height: 46px;
            text-align: left;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.05);
            color: #E5E7EB;
            border-radius: 14px;
            padding: 12px 14px;
            font-size: 15px;
            font-weight: 900;
            cursor: pointer;
          }

          .fh-mobile-link.active {
            border-color: rgba(37,99,235,.5);
            background: rgba(37,99,235,.18);
            color: #93C5FD;
          }

          .fh-mobile-link.danger {
            color: #FCA5A5;
          }

          .fh-mobile-separator {
            height: 1px;
            background: rgba(255,255,255,.08);
            margin: 4px 0;
          }
        }

        @media (max-width: 520px) {
          .fh-navbar-inner {
            gap: 8px;
            padding: 0 10px;
          }

          .fh-navbar-name {
            font-size: 13px;
            letter-spacing: 2px;
          }

          .fh-navbar-logo {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .fh-cart-button {
            padding: 10px 12px;
            min-width: 44px;
          }

          .fh-cart-text {
            display: none;
          }

          .fh-login-button {
            padding: 10px 12px;
          }

          .fh-burger {
            width: 42px;
            height: 42px;
          }
        }

        @media (max-width: 380px) {
          .fh-navbar-name {
            display: none;
          }

          .fh-login-button {
            font-size: 13px;
            padding: 9px 10px;
          }
        }
      `}</style>
    </header>
  );
}
