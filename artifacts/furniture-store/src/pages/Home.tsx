import { useState } from "react";
import { Link } from "wouter";
import {
  ChevronRight, ArrowRight, Box, LogIn, Search, Menu, X,
  Sofa, Armchair, Lamp, Flower2, BookOpen, LayoutGrid,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   CATALOG CATEGORIES  (used for the 4-column grid)
══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  {
    id: "dining",
    name: "Обідні столи",
    sub: "Від 4 до 12 місць",
    image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80",
    bg: "#F5F0E8",
    icon: <LayoutGrid size={18} />,
    count: 38,
  },
  {
    id: "chairs",
    name: "Офісні крісла",
    sub: "Ергономіка та стиль",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80",
    bg: "#EEF0F5",
    icon: <Armchair size={18} />,
    count: 27,
  },
  {
    id: "sofas",
    name: "М'які меблі",
    sub: "Дивани та крісла",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    bg: "#F0EDE8",
    icon: <Sofa size={18} />,
    count: 54,
  },
  {
    id: "lighting",
    name: "Освітлення",
    sub: "Підлогові та підвісні",
    image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80",
    bg: "#F5F3E8",
    icon: <Lamp size={18} />,
    count: 41,
  },
  {
    id: "storage",
    name: "Стелажі",
    sub: "Відкриті та закриті",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80",
    bg: "#EBF0E8",
    icon: <BookOpen size={18} />,
    count: 19,
  },
  {
    id: "decor",
    name: "Декор та рослини",
    sub: "Доповни інтер'єр",
    image: "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=600&q=80",
    bg: "#E8F0EC",
    icon: <Flower2 size={18} />,
    count: 63,
  },
  {
    id: "beds",
    name: "Ліжка",
    sub: "Двоспальні та односпальні",
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=600&q=80",
    bg: "#F0E8EE",
    icon: <LayoutGrid size={18} />,
    count: 22,
  },
  {
    id: "outdoor",
    name: "Садові меблі",
    sub: "Для тераси та балкону",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
    bg: "#E8EEF0",
    icon: <Flower2 size={18} />,
    count: 16,
  },
];

/* Featured products strip (below hero) */
const FEATURED = [
  {
    name: "Lounge Armchair",
    price: "$1,049",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    badge: "Новинка",
    badgeColor: "#2563EB",
  },
  {
    name: "Marble Side Table",
    price: "$449",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
    badge: null,
    badgeColor: "",
  },
  {
    name: "Arc Floor Lamp",
    price: "$599",
    image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80",
    badge: "Хіт",
    badgeColor: "#16A34A",
  },
  {
    name: "Jute Area Rug",
    price: "$599",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    badge: null,
    badgeColor: "",
  },
];

/* ══════════════════════════════════════════════════════════════
   IMAGE WITH FALLBACK
══════════════════════════════════════════════════════════════ */
function Img({ src, alt, className, bg }: { src: string; alt: string; className?: string; bg?: string }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className={`flex items-center justify-center ${className}`} style={{ background: bg ?? "#F0EBE4" }}>
      <span className="text-5xl opacity-30">🏠</span>
    </div>
  );
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

/* ══════════════════════════════════════════════════════════════
   NAV BAR
══════════════════════════════════════════════════════════════ */
function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl font-black tracking-widest text-gray-900 cursor-pointer select-none">
            FORMA<span className="font-light text-blue-600">HAUS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 flex-1">
          <a href="/" className="text-sm font-semibold text-gray-900 border-b-2 border-blue-600 pb-0.5">
            Головна
          </a>
          <a href="#catalog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Каталог
          </a>
          <a href="#about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Про нас
          </a>
          <a href="#contact" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Контакти
          </a>
        </nav>

        {/* Right: search + 3D Designer + Login */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <Search size={17} />
          </button>
          <Link href="/designer">
            <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
              <Box size={15} />
              3D Designer
            </button>
          </Link>
          <button className="flex items-center gap-2 px-4 h-9 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors">
            <LogIn size={15} />
            Login
          </button>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden ml-auto text-gray-600"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {["Головна", "Каталог", "Про нас", "Контакти"].map(l => (
            <a key={l} href="#" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>{l}</a>
          ))}
          <Link href="/designer" onClick={() => setMobileOpen(false)}>
            <button className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-bold">
              <Box size={15} /> Open 3D Designer
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="bg-white pt-16 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* LEFT: text */}
          <div className="flex-1 max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? "bg-blue-600" : "bg-gray-200"}`} />
                ))}
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                Колекція 2026
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl xl:text-6xl font-black text-gray-900 leading-[1.08] tracking-tight mb-6">
              Меблі,<br />
              які дизайнери<br />
              <span className="text-blue-600">люблять</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
              Скандинавський дизайн. Натуральні матеріали. Інтелектуальне планування — спробуйте наш 3D-дизайнер кімнати прямо у браузері.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a href="#catalog">
                <button className="flex items-center gap-2 px-8 h-12 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                  Переглянути каталог
                  <ArrowRight size={16} />
                </button>
              </a>
              <Link href="/designer">
                <button className="flex items-center gap-2 px-8 h-12 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <Box size={16} />
                  Open 3D Designer
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-14 pt-10 border-t border-gray-100">
              {[["200+", "Товарів"], ["15", "Колекцій"], ["4.9★", "Рейтинг"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-black text-gray-900">{n}</div>
                  <div className="text-xs text-gray-400 mt-0.5 font-medium">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: hero photo */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="relative">
              {/* Main image */}
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-gray-200">
                <Img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"
                  alt="Modern interior"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating price card */}
              <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80"
                    alt="Sofa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Nordic Sofa</div>
                  <div className="text-blue-600 font-black text-sm">$2,199</div>
                </div>
                <div className="ml-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white rounded-2xl px-4 py-2.5 shadow-lg shadow-blue-200">
                <div className="text-xs font-bold opacity-80 mb-0.5">Нова колекція</div>
                <div className="text-lg font-black leading-none">2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   TRUST STRIP
══════════════════════════════════════════════════════════════ */
function TrustStrip() {
  return (
    <div className="bg-gray-50 border-y border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8">
          {[
            { icon: "🚚", title: "Безкоштовна доставка", sub: "При замовленні від $500" },
            { icon: "🔄", title: "30 днів повернення",   sub: "Без зайвих питань"       },
            { icon: "🛡️", title: "Гарантія 3 роки",      sub: "На всі вироби"           },
            { icon: "💬", title: "Підтримка 24/7",        sub: "Онлайн-консультація"     },
          ].map(v => (
            <div key={v.title} className="flex items-center gap-3">
              <span className="text-2xl">{v.icon}</span>
              <div>
                <div className="text-sm font-bold text-gray-900">{v.title}</div>
                <div className="text-xs text-gray-400">{v.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CATALOG SECTION
══════════════════════════════════════════════════════════════ */
function CategoryCard({ cat }: { cat: typeof CATEGORIES[number] }) {
  const [hov, setHov] = useState(false);

  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer transition-all duration-300"
      style={{
        boxShadow: hov
          ? "0 16px 48px rgba(0,0,0,.10)"
          : "0 2px 8px rgba(0,0,0,.04)",
        transform: hov ? "translateY(-3px)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Photo */}
      <div
        className="relative overflow-hidden"
        style={{ background: cat.bg, aspectRatio: "4/3" }}
      >
        <Img
          src={cat.image}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          bg={cat.bg}
        />

        {/* "Open 3D Designer" overlay */}
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-4"
        >
          <Link href="/designer">
            <button
              className="px-4 h-9 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg flex items-center gap-2 transition-all duration-300"
              style={{
                opacity: hov ? 1 : 0,
                transform: hov ? "translateY(0)" : "translateY(8px)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <Box size={13} />
              Open 3D Designer
            </button>
          </Link>
        </div>

        {/* Count pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {cat.count} товарів
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-900 leading-tight">{cat.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{cat.sub}</div>
        </div>
        <ChevronRight
          size={18}
          className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURED STRIP  (horizontal scroll on mobile)
══════════════════════════════════════════════════════════════ */
function FeaturedStrip() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">Обрані товари</p>
            <h2 className="text-3xl font-black text-gray-900">Хіти продажів</h2>
          </div>
          <a href="#catalog" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            Усі товари <ArrowRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED.map((p, i) => (
            <FeaturedCard key={i} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ p }: { p: typeof FEATURED[number] }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square mb-3">
        <Img
          src={p.image}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          bg="#F5F0EA"
        />
        {p.badge && (
          <div
            className="absolute top-2.5 left-2.5 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: p.badgeColor }}
          >
            {p.badge}
          </div>
        )}
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-3"
        >
          <Link href="/designer">
            <button
              className="px-3 h-8 bg-white text-gray-900 text-xs font-bold rounded-full shadow flex items-center gap-1.5 transition-all duration-300"
              style={{ opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(6px)" }}
              onClick={e => e.stopPropagation()}
            >
              <Box size={12} /> Try in 3D
            </button>
          </Link>
        </div>
      </div>
      <div className="text-sm font-bold text-gray-900 mb-0.5">{p.name}</div>
      <div className="text-sm font-black text-blue-600">{p.price}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3D DESIGNER BANNER
══════════════════════════════════════════════════════════════ */
function DesignerBanner() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="bg-gray-900 rounded-3xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left: text */}
            <div className="flex-1 p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
                Безкоштовний інструмент
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
                Сплануй свою кімнату<br />
                <span className="text-blue-400">в 3D — за хвилини</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                Перетягуй меблі, міняй підлогу і стіни, дивись загальну вартість — все в режимі реального часу. Без реєстрації.
              </p>
              <Link href="/designer">
                <button className="flex items-center gap-3 px-8 h-12 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40">
                  <Box size={17} />
                  Відкрити 3D Designer
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>

            {/* Right: room preview mockup */}
            <div className="flex-1 relative overflow-hidden h-72 lg:h-auto lg:min-h-[360px] w-full">
              <Img
                src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80"
                alt="3D Designer Preview"
                className="w-full h-full object-cover"
                bg="#111"
              />
              {/* Grid overlay to suggest 3D */}
              <div className="absolute inset-0 bg-blue-900/20" />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "repeating-linear-gradient(0deg,#60A5FA 0,#60A5FA 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#60A5FA 0,#60A5FA 1px,transparent 1px,transparent 60px)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="text-xl font-black tracking-widest text-gray-900 mb-2">
              FORMA<span className="font-light text-blue-600">HAUS</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Преміальні меблі для сучасного інтер'єру. Доставка по всій Україні.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-3">
            {[
              ["Каталог", "Дивани", "Столи", "Стільці", "Освітлення"],
              ["Компанія", "Про нас", "Блог", "Кар'єра", "Контакти"],
              ["Клієнтам", "Доставка", "Повернення", "Гарантія", "FAQ"],
            ].map(([title, ...links]) => (
              <div key={title}>
                <div className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3">{title}</div>
                {links.map(l => (
                  <a key={l} href="#" className="block text-sm text-gray-400 hover:text-blue-600 mb-2 transition-colors">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 FormaHaus. Всі права захищені.</p>
          <div className="flex gap-6">
            {["Конфіденційність", "Умови", "Cookies"].map(l => (
              <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Nav />

      {/* Offset for fixed nav */}
      <div className="pt-16">
        <Hero />
        <TrustStrip />
        <FeaturedStrip />

        {/* ── CATALOG GRID ── */}
        <section id="catalog" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">Усі категорії</p>
                <h2 className="text-4xl font-black text-gray-900 leading-tight">Каталог</h2>
                <p className="text-gray-400 mt-2 text-sm">Оберіть категорію і знайдіть ідеальний варіант</p>
              </div>
              <Link href="/designer">
                <button className="flex items-center gap-2 px-5 h-10 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors whitespace-nowrap">
                  <Box size={15} />
                  Open 3D Designer
                </button>
              </Link>
            </div>

            {/* 4-column grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          </div>
        </section>

        <DesignerBanner />
        <Footer />
      </div>
    </div>
  );
}
