import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Box, ShoppingBag, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   CATALOG DATA
══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  {
    id: "sofa",        cat: "seating",   badge: "Bestseller",
    name: "Nordic Sofa",
    desc: "3-seat sectional in natural linen with solid beech legs.",
    price: 2199,  oldPrice: 2799,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80",
    bg: "#D6C9B8",
  },
  {
    id: "armchair",    cat: "seating",   badge: "New",
    name: "Lounge Armchair",
    desc: "Bouclé upholstery with solid walnut frame and swivel base.",
    price: 1049,  oldPrice: null,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=700&q=80",
    bg: "#C8B89A",
  },
  {
    id: "coffee",      cat: "tables",    badge: null,
    name: "Low Coffee Table",
    desc: "Solid oak top with hairpin steel legs and lower open shelf.",
    price: 849,   oldPrice: null,
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=700&q=80",
    bg: "#BEA888",
  },
  {
    id: "side",        cat: "tables",    badge: "New",
    name: "Marble Side Table",
    desc: "Calacatta marble top on a polished brass pedestal base.",
    price: 449,   oldPrice: null,
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80",
    bg: "#D8D0C4",
  },
  {
    id: "dining",      cat: "tables",    badge: null,
    name: "Dining Table 200cm",
    desc: "Extendable solid oak veneer top, seats 6–10 guests.",
    price: 1999,  oldPrice: 2499,
    image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=700&q=80",
    bg: "#C4AA84",
  },
  {
    id: "bookshelf",   cat: "storage",   badge: null,
    name: "Open Bookcase",
    desc: "5 adjustable shelves in white-oiled oak, 200cm height.",
    price: 699,   oldPrice: null,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
    bg: "#DED4C0",
  },
  {
    id: "cabinet",     cat: "storage",   badge: "Sale",
    name: "Sideboard 160cm",
    desc: "3-door lacquered sideboard with brass hardware.",
    price: 1349,  oldPrice: 1699,
    image: "https://images.unsplash.com/photo-1601628828688-632f38a5d87b?auto=format&fit=crop&w=700&q=80",
    bg: "#C8BCA8",
  },
  {
    id: "floorlamp",   cat: "lighting",  badge: null,
    name: "Arc Floor Lamp",
    desc: "Articulated brass arc with a handmade linen shade.",
    price: 599,   oldPrice: null,
    image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=700&q=80",
    bg: "#E0D4B8",
  },
  {
    id: "plant",       cat: "decor",     badge: null,
    name: "Fiddle Leaf Fig",
    desc: "Tall statement plant in a hand-thrown ceramic pot.",
    price: 149,   oldPrice: null,
    image: "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=700&q=80",
    bg: "#B8C8A8",
  },
  {
    id: "rug_classic", cat: "decor",     badge: "Bestseller",
    name: "Jute Area Rug",
    desc: "200×300 cm hand-woven natural jute in a herringbone pattern.",
    price: 599,   oldPrice: null,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
    bg: "#C8B49A",
  },
];

const CATS = [
  { id: "all",      label: "All" },
  { id: "seating",  label: "Seating" },
  { id: "tables",   label: "Tables" },
  { id: "storage",  label: "Storage" },
  { id: "lighting", label: "Lighting" },
  { id: "decor",    label: "Decor & Rugs" },
];

const fmt = (p: number) => p.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════════════════════ */
function ProductCard({ p }: { p: typeof PRODUCTS[number] }) {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov] = useState(false);

  return (
    <article
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border/50 transition-all duration-300"
      style={{ boxShadow: hov ? "0 20px 60px rgba(0,0,0,.10)" : "0 2px 12px rgba(0,0,0,.05)" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Image area */}
      <div className="relative overflow-hidden aspect-[4/3]" style={{ background: p.bg }}>
        {!imgErr ? (
          <img
            src={p.image}
            alt={p.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-60">
              {{ seating: "🛋️", tables: "🪵", storage: "📦", lighting: "💡", decor: "🌿" }[p.cat] ?? "🛋️"}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-black/0 flex items-end justify-center pb-4 transition-all duration-300",
          hov && "bg-black/10"
        )}>
          <Link href="/designer">
            <Button
              variant="default"
              size="sm"
              className={cn(
                "gap-2 bg-white text-foreground border-0 shadow-lg transition-all duration-300 translate-y-3 opacity-0 hover:bg-white",
                hov && "translate-y-0 opacity-100"
              )}
            >
              <Box className="w-3.5 h-3.5" />
              Try in 3D
            </Button>
          </Link>
        </div>

        {/* Badge */}
        {p.badge && (
          <div className="absolute top-3 left-3">
            <span className={cn(
              "text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full",
              p.badge === "Sale" && "bg-red-500 text-white",
              p.badge === "New" && "bg-black text-white",
              p.badge === "Bestseller" && "bg-amber-500 text-white",
            )}>
              {p.badge}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-5">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1">
          {{ seating: "Seating", tables: "Tables", storage: "Storage", lighting: "Lighting", decor: "Decor" }[p.cat]}
        </p>
        <h3 className="text-base font-bold text-foreground mb-1.5 leading-snug">{p.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{p.desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-foreground">{fmt(p.price)}</span>
            {p.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">{fmt(p.oldPrice)}</span>
            )}
          </div>
          <Link href="/designer">
            <button className="flex items-center gap-1.5 text-sm font-semibold text-foreground border-b border-foreground/30 hover:border-foreground pb-0.5 transition-colors">
              View in 3D
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col bg-[#F5F0EA] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 80px)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 gap-12">
        {/* Left: text */}
        <div className="flex-1 flex flex-col items-start max-w-xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-px bg-foreground/40" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">New Collection 2026</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-[0.95] tracking-tight text-foreground mb-6">
            Design Your<br />
            <span className="italic font-light">Perfect</span><br />
            Interior
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
            Craft your dream space with our curated collection of premium Scandinavian furniture. Visualise it live in our 3D room designer.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/designer">
              <Button size="lg" className="gap-2.5 h-12 px-8 text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4" />
                Open 3D Designer
              </Button>
            </Link>
            <a href="#collection">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold tracking-wide bg-white/60 backdrop-blur-sm">
                Browse Collection
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14 pt-10 border-t border-border w-full">
            {[["200+", "Products"], ["15", "Collections"], ["4.9★", "Customer Rating"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-black text-foreground">{n}</div>
                <div className="text-xs font-medium text-muted-foreground mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: featured product visual grid */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-2 gap-3">
            {[
              { src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80", bg: "#D6C9B8", label: "Nordic Sofa",     price: "$2,199", span: "col-span-2" },
              { src: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=700&q=80", bg: "#C8B89A", label: "Lounge Chair",   price: "$1,049", span: "" },
              { src: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80", bg: "#D8D0C4", label: "Side Table",     price: "$449",   span: "" },
            ].map((img, i) => (
              <div key={i} className={cn("relative rounded-xl overflow-hidden", img.span)} style={{ background: img.bg, aspectRatio: img.span ? "16/7" : "1/1" }}>
                <ImgWithFallback src={img.src} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="text-white text-sm font-bold">{img.label}</div>
                  <div className="text-white/80 text-xs">{img.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════ */
function ImgWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className={cn("bg-muted/40 flex items-center justify-center", className)}><span className="text-4xl opacity-40">🏠</span></div>;
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 lg:px-12 bg-white/90 backdrop-blur-md border-b border-border/50">
        <Link href="/">
          <div className="flex items-baseline gap-0.5 cursor-pointer select-none">
            <span className="text-xl font-black tracking-[0.18em] text-foreground">FORMA</span>
            <span className="text-xl font-light tracking-[0.18em] text-amber-600">HAUS</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Collection", "Materials", "About"].map(label => (
            <a key={label} href={label === "Collection" ? "#collection" : "#"} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </a>
          ))}
          <Link href="/designer">
            <span className="text-sm font-semibold text-foreground hover:text-amber-600 transition-colors cursor-pointer">3D Designer</span>
          </Link>
        </div>

        <Link href="/designer">
          <Button variant="default" size="sm" className="gap-2 text-xs font-bold tracking-wide">
            <Box className="w-3.5 h-3.5" />
            Open Designer
          </Button>
        </Link>
      </nav>

      {/* ── HERO ── */}
      <div className="pt-16">
        <Hero />
      </div>

      {/* ── VALUE PROPS ── */}
      <section className="bg-foreground text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: "🛋️", title: "Premium Quality",  sub: "Solid wood & natural fabrics only" },
            { icon: "📐", title: "3D Visualisation",  sub: "Design your room before you buy" },
            { icon: "🚚", title: "Free Delivery",     sub: "On all orders over $500" },
          ].map(v => (
            <div key={v.title} className="flex items-center gap-4">
              <span className="text-3xl">{v.icon}</span>
              <div>
                <div className="text-sm font-bold tracking-wide">{v.title}</div>
                <div className="text-xs text-white/55 mt-0.5">{v.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COLLECTION ── */}
      <section id="collection" className="py-20 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 mb-2">Our Products</p>
            <h2 className="text-4xl font-black tracking-tight text-foreground">The Collection</h2>
          </div>
          <Link href="/designer">
            <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5" />
              Design Your Room
            </Button>
          </Link>
        </div>

        {/* Category tabs */}
        <Tabs value={cat} onValueChange={setCat} className="mb-10">
          <TabsList className="bg-muted/60 h-10 gap-1">
            {CATS.map(c => (
              <TabsTrigger key={c.id} value={c.id} className="text-xs font-semibold tracking-wide px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-6 lg:mx-12 mb-20 rounded-3xl bg-[#1A1A1A] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)" }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-12 lg:p-16">
          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400 mb-3">Free Tool</p>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Design your dream room <span className="italic font-light text-amber-400">in minutes</span>
            </h2>
            <p className="text-white/60 text-base max-w-md leading-relaxed">
              Our 3D room designer lets you drag and drop furniture, switch floor and wall materials, and see the total cost — all in real time.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Link href="/designer">
              <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-400 border-0 h-13 px-10 text-sm font-black tracking-wide gap-2.5 whitespace-nowrap">
                <Box className="w-4 h-4" />
                Open 3D Designer
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <span className="text-white/40 text-xs">No account needed · Free to use</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-baseline gap-0.5 mb-1">
                <span className="text-lg font-black tracking-[0.18em]">FORMA</span>
                <span className="text-lg font-light tracking-[0.18em] text-amber-600">HAUS</span>
              </div>
              <p className="text-xs text-muted-foreground">Premium furniture. Endless possibilities.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["Privacy", "Terms", "Shipping", "Returns", "Contact"].map(l => (
                <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
            © 2026 FormaHaus. Crafted with care.
          </div>
        </div>
      </footer>
    </div>
  );
}
