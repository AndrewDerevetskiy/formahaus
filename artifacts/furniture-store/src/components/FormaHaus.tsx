import { useEffect, useRef, useState, useCallback, useMemo, Suspense } from "react";
import { Link } from "wouter";
import * as THREE from "three";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls, Environment, ContactShadows, useGLTF,
} from "@react-three/drei";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { useCart } from "../context/CartContext";

/* ══════════════════════════════════════════════════════════════
   CATALOG
══════════════════════════════════════════════════════════════ */
const CATS = [
  { id: "seating",  icon: "🛋️", label: "Seating"     },
  { id: "tables",   icon: "🪵",  label: "Tables"       },
  { id: "storage",  icon: "📦",  label: "Storage"      },
  { id: "lighting", icon: "💡",  label: "Lighting"     },
  { id: "decor",    icon: "🌿",  label: "Decor & Rugs" },
];
const ITEMS = [
  { cat: "seating",  type: "sofa",        icon: "🛋️", label: "Nordic Sofa",       desc: "3-seat, linen upholstery",  price: 2199 },
  { cat: "seating",  type: "armchair",    icon: "💺", label: "Lounge Armchair",    desc: "Walnut frame, bouclé",      price: 1049 },
  { cat: "seating",  type: "bench",       icon: "🪑", label: "Upholstered Bench",  desc: "Oak legs, velvet seat",     price: 549  },
  { cat: "tables",   type: "coffee",      icon: "☕", label: "Low Coffee Table",   desc: "Solid oak, shelf below",    price: 849  },
  { cat: "tables",   type: "dining",      icon: "🍽️", label: "Dining Table 200cm", desc: "Extendable, oak veneer",    price: 1999 },
  { cat: "tables",   type: "side",        icon: "🔲", label: "Marble Side Table",  desc: "Brass base, marble top",    price: 449  },
  { cat: "storage",  type: "bookshelf",   icon: "📚", label: "Open Bookcase",      desc: "5 shelves, white oak",      price: 699  },
  { cat: "storage",  type: "cabinet",     icon: "🗄️", label: "Sideboard 160cm",    desc: "3 doors, matte lacquer",    price: 1349 },
  { cat: "lighting", type: "floorlamp",   icon: "💡", label: "Arc Floor Lamp",     desc: "Brass arc, marble base",    price: 599  },
  { cat: "lighting", type: "pendant",     icon: "🔦", label: "Pendant Cluster",    desc: "Smoked glass, E27",         price: 389  },
  { cat: "decor",    type: "plant",       icon: "🌿", label: "Fiddle Leaf Fig",    desc: "Tall statement plant",      price: 149  },
  { cat: "decor",    type: "rug_classic", icon: "🟫", label: "Jute Area Rug",      desc: "200×300cm, natural fibre",  price: 599  },
  { cat: "decor",    type: "rug_round",   icon: "⭕", label: "Round Wool Rug Ø200",desc: "Hand-tufted, navy",         price: 849  },
  { cat: "decor",    type: "rug_runner",  icon: "▬",  label: "Hallway Runner",     desc: "80×240cm, geometric",       price: 399  },
];
const FLOOR_OPTIONS = [
  { id: "oak",      label: "Light Oak Parquet",  sub: "Herringbone pattern"  },
  { id: "walnut",   label: "Dark Walnut Plank",  sub: "Wide board, matte oil"},
  { id: "marble",   label: "Calacatta Marble",   sub: "Polished, bookmatched"},
  { id: "concrete", label: "Polished Concrete",  sub: "Micro-cement finish"  },
];
const WALL_COLORS = [
  { id: "white", hex: "#F5F0EA", label: "Off White"     },
  { id: "sage",  hex: "#A8BAA0", label: "Sage Green"    },
  { id: "sand",  hex: "#C8B8A0", label: "Warm Sand"     },
  { id: "clay",  hex: "#B8957A", label: "Terracotta"    },
  { id: "navy",  hex: "#3A4A5C", label: "Midnight Blue" },
  { id: "char",  hex: "#2C2C2C", label: "Charcoal"      },
];

/* ══════════════════════════════════════════════════════════════
   TEXTURE HELPERS
══════════════════════════════════════════════════════════════ */
function makeTex(w: number, h: number, fn: (c: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const el = document.createElement("canvas"); el.width = w; el.height = h;
  fn(el.getContext("2d")!);
  const t = new THREE.CanvasTexture(el);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function makeWoodNormal() {
  return makeTex(512, 512, ctx => {
    ctx.fillStyle = "#8080ff"; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 30; i++) {
      const a = 0.12 + Math.random() * 0.18;
      ctx.strokeStyle = `rgba(80,80,255,${a})`; ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath(); const y = i * 18 + Math.random() * 8; ctx.moveTo(0, y);
      ctx.bezierCurveTo(130, y + 5, 380, y - 5, 512, y + 2); ctx.stroke();
    }
  });
}
function makeFabricNormal() {
  return makeTex(256, 256, ctx => {
    ctx.fillStyle = "#8080ff"; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 4) {
      ctx.strokeStyle = "rgba(75,75,255,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    }
  });
}
function makeFloorTex(k: string): THREE.CanvasTexture {
  return makeTex(1024, 1024, ctx => {
    if (k === "oak") {
      ctx.fillStyle = "#C8A06A"; ctx.fillRect(0, 0, 1024, 1024);
      const cols = ["#C8A06A","#B8904A","#D4B070","#BC943E"];
      const tw = 64, th = 28;
      for (let row = -10; row < 20; row++) for (let col = -10; col < 20; col++) {
        ctx.save(); ctx.translate(col*(tw+th)+row*(tw+th)*.5, row*(th+tw)*.5);
        ctx.fillStyle = cols[(row+col)%4]; ctx.fillRect(0,0,tw,th);
        ctx.strokeStyle="rgba(0,0,0,.06)"; ctx.lineWidth=1; ctx.strokeRect(0,0,tw,th);
        ctx.fillStyle=cols[(row+col+1)%4]; ctx.fillRect(tw+2,th+2,th,tw); ctx.strokeRect(tw+2,th+2,th,tw);
        ctx.restore();
      }
    } else if (k === "walnut") {
      for (let i=0;i<24;i++) { ctx.fillStyle=i%2===0?"#1E0E06":"#2A1408"; ctx.fillRect(0,i*43,1024,43); ctx.strokeStyle="rgba(0,0,0,.18)"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,(i+1)*43); ctx.lineTo(1024,(i+1)*43); ctx.stroke(); }
    } else if (k === "marble") {
      const g=ctx.createLinearGradient(0,0,1024,1024); g.addColorStop(0,"#F8F5F0"); g.addColorStop(.3,"#F0EBE4"); g.addColorStop(.6,"#ECDDD4"); g.addColorStop(1,"#F5F0EB");
      ctx.fillStyle=g; ctx.fillRect(0,0,1024,1024);
      ctx.strokeStyle="rgba(180,160,140,.3)"; ctx.lineWidth=2;
      for (let v=0;v<12;v++) { ctx.beginPath(); const sx=Math.random()*1024,sy=Math.random()*1024; ctx.moveTo(sx,sy); for(let s=0;s<5;s++) ctx.quadraticCurveTo(sx+Math.random()*200-100,sy+s*100+Math.random()*80,sx+Math.random()*300-100,sy+(s+1)*100); ctx.stroke(); }
    } else {
      ctx.fillStyle="#A0A09A"; ctx.fillRect(0,0,1024,1024);
      const id=ctx.getImageData(0,0,1024,1024); for(let i=0;i<id.data.length;i+=4){const n=(Math.random()-.5)*18;id.data[i]+=n;id.data[i+1]+=n;id.data[i+2]+=n;} ctx.putImageData(id,0,0);
      ctx.strokeStyle="rgba(0,0,0,.07)"; ctx.lineWidth=1.5;
      for(let i=0;i<=4;i++){ctx.beginPath();ctx.moveTo(0,i*256);ctx.lineTo(1024,i*256);ctx.stroke();ctx.beginPath();ctx.moveTo(i*256,0);ctx.lineTo(i*256,1024);ctx.stroke();}
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   PBR MATERIALS
══════════════════════════════════════════════════════════════ */
const _woodN = { v: null as THREE.CanvasTexture | null };
const _fabN  = { v: null as THREE.CanvasTexture | null };
const woodNormal   = () => { if (!_woodN.v) _woodN.v = makeWoodNormal(); return _woodN.v!; };
const fabricNormal = () => { if (!_fabN.v)  _fabN.v  = makeFabricNormal(); return _fabN.v!; };

const MAT = {
  fabric: (hex: number) => new THREE.MeshStandardMaterial({ color: hex, roughness: .88, metalness: 0, normalMap: fabricNormal(), normalScale: new THREE.Vector2(.4,.4) }),
  wood:   (hex: number) => new THREE.MeshStandardMaterial({ color: hex, roughness: .62, metalness: 0, normalMap: woodNormal(),   normalScale: new THREE.Vector2(.5,.5) }),
  metal:  (hex: number) => new THREE.MeshStandardMaterial({ color: hex, roughness: .22, metalness: .92 }),
  glass:  ()           => new THREE.MeshStandardMaterial({ color: 0xadd8e6, roughness: .04, metalness: .12, transparent: true, opacity: .28 }),
  marble: ()           => new THREE.MeshStandardMaterial({ color: 0xf0ebe5, roughness: .07, metalness: .04 }),
};

/* ══════════════════════════════════════════════════════════════
   FURNITURE GEOMETRY BUILDERS  — upgraded with LatheGeometry,
   higher segment counts, bevelled edges, richer PBR materials.
══════════════════════════════════════════════════════════════ */

/* Primitive helpers */
function bx(w:number,h:number,d:number,mat:THREE.Material,sx=2,sy=2,sz=2){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d,sx,sy,sz),mat);
  m.castShadow=true;m.receiveShadow=true;return m;
}
function cy(rt:number,rb:number,h:number,seg:number,mat:THREE.Material){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);
  m.castShadow=true;m.receiveShadow=true;return m;
}
function sp(r:number,mat:THREE.Material){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat);
  m.castShadow=true;m.receiveShadow=true;return m;
}
/* Lathe helper — profile as [[x,y], …] */
function lt(profile:[number,number][],seg:number,mat:THREE.Material):THREE.Mesh{
  const pts=profile.map(([x,y])=>new THREE.Vector2(x,y));
  const m=new THREE.Mesh(new THREE.LatheGeometry(pts,seg),mat);
  m.castShadow=true;m.receiveShadow=true;return m;
}

/* Tapered furniture leg via LatheGeometry */
function taperedLeg(h:number,topR:number,botR:number,mat:THREE.Material):THREE.Mesh{
  return lt([[botR,0],[botR*.8,h*.1],[topR*.9,h*.85],[topR,h]],16,mat);
}

/* ── SOFA ──────────────────────────────────────────────────── */
function buildSofa(){
  const g=new THREE.Group();
  const fab=MAT.fabric(0x7A6555),cu=MAT.fabric(0x9A8068),lm=MAT.wood(0x3C2818);

  // Platform base
  const base=bx(2.3,.18,1.0,MAT.wood(0x3C2818));base.position.set(0,.09,0);g.add(base);
  // Seat cushions × 3
  for(let i=0;i<3;i++){
    const s=bx(.72,.16,.82,cu);s.position.set(-0.72+i*.72,.31,.04);g.add(s);
  }
  // Back rail
  const back=bx(2.3,.08,.72,MAT.wood(0x3C2818));back.position.set(0,.72,-.36);g.add(back);
  // Back cushions × 3
  for(let i=0;i<3;i++){
    const bc=bx(.72,.44,.14,fab);bc.position.set(-0.72+i*.72,.54,-.30);g.add(bc);
  }
  // Armrests
  const arm=bx(.16,.38,1.0,fab);arm.position.set(-1.07,.34,0);g.add(arm.clone());
  arm.position.set(1.07,.34,0);g.add(arm);
  // Tapered wooden legs × 4
  for(const[x,z] of[[-1.0,-.42],[1.0,-.42],[-1.0,.42],[1.0,.42]] as[number,number][]){
    const l=taperedLeg(.09,.025,.035,lm);l.position.set(x,0,z);g.add(l);
  }
  // Scatter cushion
  const sc=bx(.28,.22,.26,MAT.fabric(0xB8A080));sc.position.set(-.95,.50,.06);sc.rotation.set(0,.3,.15);g.add(sc);
  return g;
}

/* ── ARMCHAIR — fallback only; real model is SheenChair.glb ── */
function buildArmchair(){
  const g=new THREE.Group();
  const f=MAT.fabric(0x9A7858),lm=MAT.wood(0x3A2818);
  const base=bx(1.0,.18,.88,MAT.wood(0x3A2818));base.position.set(0,.09,0);g.add(base);
  const seat=bx(.80,.14,.72,f);seat.position.set(0,.28,.04);g.add(seat);
  const back=bx(.80,.56,.14,f);back.position.set(0,.56,-.36);g.add(back);
  for(const[x] of[[-0.40],[0.40]] as[number][]){
    const a=bx(.14,.28,.80,MAT.fabric(0x8A6848));a.position.set(x,.28,0);g.add(a);
  }
  for(const[x,z]of[[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]] as[number,number][]){
    const l=taperedLeg(.10,.02,.03,lm);l.position.set(x,0,z);g.add(l);
  }
  return g;
}

/* ── BENCH ─────────────────────────────────────────────────── */
function buildBench(){
  const g=new THREE.Group();
  const velv=MAT.fabric(0x556B4A),mt=MAT.metal(0x6A6A6A);
  // Seat with slight bevel
  const seat=bx(1.7,.10,.48,velv);seat.position.set(0,.40,0);g.add(seat);
  const trim=bx(1.62,.04,.44,MAT.wood(0x4A2E14));trim.position.set(0,.37,0);g.add(trim);
  // Hairpin-style metal legs (two U-shapes per side)
  for(const side of[-1,1] as number[]){
    for(const lr of[-.25,.25] as number[]){
      // vertical part
      const v=cy(.015,.015,.38,8,mt);v.position.set(side*.74,.19,lr);g.add(v);
      // angled foot
      const f=cy(.012,.012,.18,8,mt);f.position.set(side*.74,.01,lr);f.rotation.set(.5*side,0,0);g.add(f);
    }
    // horizontal cross bar
    const h=cy(.012,.012,.54,8,mt);h.position.set(side*.74,.06,0);h.rotation.set(Math.PI/2,0,0);g.add(h);
  }
  return g;
}

/* ── COFFEE TABLE ───────────────────────────────────────────── */
function buildCoffeeTable(){
  const g=new THREE.Group();
  const tm=MAT.wood(0xC8A870),mt=MAT.metal(0x4A4A4A);
  // Tabletop with slight thickness
  const top=bx(1.4,.06,.78,tm);top.position.set(0,.40,0);g.add(top);
  // Lower shelf
  const sh=bx(1.1,.04,.58,MAT.wood(0xB89858));sh.position.set(0,.15,0);g.add(sh);
  // Thin metal hairpin legs × 4
  for(const[x,z] of[[-.58,-.32],[.58,-.32],[-.58,.32],[.58,.32]] as[number,number][]){
    // angled outward slightly
    const leg=cy(.016,.016,.38,8,mt);
    leg.position.set(x,.19,z);
    leg.rotation.set(z*.12,0,x*.08);
    g.add(leg);
  }
  return g;
}

/* ── DINING TABLE ───────────────────────────────────────────── */
function buildDiningTable(){
  const g=new THREE.Group();
  const tm=MAT.wood(0xCCB07A),lm=MAT.wood(0x4A3018);
  // Top
  const top=bx(2.2,.06,1.0,tm);top.position.set(0,.79,0);g.add(top);
  // Trestle legs: two A-frame sides
  for(const side of[-1,1] as number[]){
    // angled outer legs
    for(const lr of[-1,1] as number[]){
      const l=bx(.08,.72,.08,lm);
      l.position.set(side*.92,.36,lr*.38);
      l.rotation.set(lr*.12,0,0);
      g.add(l);
    }
    // horizontal stretcher
    const s=bx(.08,.06,.78,lm);s.position.set(side*.92,.12,0);g.add(s);
  }
  // Central lower stretcher
  const cs=bx(1.88,.06,.08,lm);cs.position.set(0,.18,0);g.add(cs);
  return g;
}

/* ── SIDE TABLE ─────────────────────────────────────────────── */
function buildSideTable(){
  const g=new THREE.Group();
  const bm=MAT.metal(0xC8A030);
  // Marble top disk
  const top=lt([[0,0],[.28,0],[.30,.015],[.30,.04],[0,.04]],32,MAT.marble());
  top.position.set(0,.60,0);g.add(top);
  // Pedestal stem with ornate lathe profile
  const stem=lt([
    [0,0],[.055,0],[.06,.02],[.035,.08],[.025,.28],
    [.02,.42],[.025,.50],[.06,.52],[.055,.54],[0,.54]
  ],24,bm);stem.position.set(0,.04,0);g.add(stem);
  // Flared base disk
  const base=lt([[0,0],[.18,0],[.20,.01],[.20,.025],[.17,.04],[0,.04]],32,bm);
  base.position.set(0,.01,0);g.add(base);
  return g;
}

/* ── BOOKCASE ───────────────────────────────────────────────── */
function buildBookshelf(){
  const g=new THREE.Group();
  const fr=MAT.wood(0xDEC8A8);
  const BOOK_COLS=[0xCC4444,0x3355AA,0x44AA55,0xCC8833,0x8833AA,0xCC4477,0x777733,0x33AACC,0x553311,0xAA6633];

  // Side panels
  const s1=bx(.05,2.0,.42,fr);s1.position.set(-.55,1.0,0);g.add(s1);
  const s2=s1.clone();s2.position.set(.55,1.0,0);g.add(s2);
  // Top & bottom panels
  const topP=bx(1.15,.05,.42,fr);topP.position.set(0,1.975,0);g.add(topP);
  const bot=bx(1.15,.05,.42,fr);bot.position.set(0,.025,0);g.add(bot);
  // Back panel
  const bk=bx(1.15,1.97,.025,MAT.wood(0xC8B090));bk.position.set(0,1.0,-.20);g.add(bk);
  // Shelves × 4
  for(let i=1;i<=4;i++){
    const sh=bx(1.05,.04,.40,MAT.wood(0xE0CEAE));sh.position.set(0,i*.42+.025,0);g.add(sh);
  }
  // Books on each shelf
  for(let shelf=0;shelf<5;shelf++){
    const shelfY=shelf*.42+.07;
    let xPos=-.48;
    const count=5+Math.floor(Math.random()*5);
    for(let b=0;b<count&&xPos<.44;b++){
      const bw=.034+Math.random()*.042;
      const bh=.14+Math.random()*.18;
      const col=BOOK_COLS[b%BOOK_COLS.length];
      const book=bx(bw,bh,.34,new THREE.MeshStandardMaterial({color:col,roughness:.78,metalness:.02}));
      book.position.set(xPos+bw/2,shelfY+bh/2,0);
      // occasional slight lean
      book.rotation.z=(Math.random()-.5)*.08;
      g.add(book);
      xPos+=bw+.003;
    }
  }
  return g;
}

/* ── SIDEBOARD / CABINET ────────────────────────────────────── */
function buildCabinet(){
  const g=new THREE.Group();
  const body=MAT.wood(0xE0D0B8),door=MAT.wood(0xD0C0A8),brass=MAT.metal(0xB09840);

  // Main body
  const bl=bx(1.7,.72,.52,body);bl.position.set(0,.36,0);g.add(bl);
  // Top surface (slightly darker)
  const top=bx(1.72,.03,.54,MAT.wood(0xC8B898));top.position.set(0,.735,0);g.add(top);
  // Three doors with inset panel detail
  for(let i=0;i<3;i++){
    const x=-0.565+i*.565;
    const d=bx(.52,.66,.03,door);d.position.set(x,.36,.27);g.add(d);
    // Inset panel
    const panel=bx(.40,.52,.015,MAT.wood(0xC8B894));panel.position.set(x,.36,.275);g.add(panel);
    // Brass knob using LatheGeometry
    const knob=lt([[0,0],[.018,0],[.022,.006],[.022,.018],[.018,.024],[.01,.028],[0,.028]],16,brass);
    knob.position.set(x,.36,.30);knob.rotation.x=Math.PI/2;g.add(knob);
  }
  // Tapered legs × 4
  for(const[x,z]of[[-.77,-.19],[.77,-.19],[-.77,.19],[.77,.19]] as[number,number][]){
    const l=taperedLeg(.10,.018,.030,brass);l.position.set(x,0,z);g.add(l);
  }
  return g;
}

/* ── FLOOR LAMP — fallback only; real = IridescenceLamp.glb ── */
function buildFloorLamp(){
  const g=new THREE.Group();
  const brass=MAT.metal(0xC8B030);
  // Marble base using lathe
  const base=lt([[0,0],[.22,0],[.24,.02],[.24,.05],[.20,.06],[0,.06]],28,MAT.marble());
  base.position.set(0,0,0);g.add(base);
  // Tapered stem
  const stem=lt([[.018,0],[.016,.4],[.014,.9],[.012,1.4],[.010,1.62]],12,brass);
  stem.position.set(0,.06,0);g.add(stem);
  // Articulated joint sphere
  const joint=sp(.038,brass);joint.position.set(0,1.68,0);g.add(joint);
  // Shade
  const shade=cy(.30,.18,.28,28,MAT.fabric(0xFFF8E8));shade.position.set(0,1.78,0);g.add(shade);
  // Emissive bulb
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),new THREE.MeshStandardMaterial({color:0xFFFFDD,emissive:new THREE.Color(0xFFEEAA),emissiveIntensity:2.0}));
  bulb.position.set(0,1.75,0);g.add(bulb);
  return g;
}

/* ── PENDANT — fallback; real = IridescenceLamp.glb ─────────── */
function buildPendant(){
  const g=new THREE.Group();
  const mt=MAT.metal(0xB0A060);
  const cord=cy(.007,.007,.65,6,MAT.metal(0x282828));cord.position.set(0,.97,0);g.add(cord);
  const cap=lt([[0,0],[.055,0],[.065,.02],[.060,.045],[0,.045]],16,mt);cap.position.set(0,.65,0);g.add(cap);
  // Flared smoked glass shade
  const shade=lt([[.04,.0],[.12,.06],[.24,.12],[.30,.20],[.30,.24],[.02,.24]],24,
    new THREE.MeshStandardMaterial({color:0x181C20,roughness:.06,metalness:.15,transparent:true,opacity:.75}));
  shade.position.set(0,.42,0);g.add(shade);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.04,12,8),new THREE.MeshStandardMaterial({color:0xFFFFCC,emissive:new THREE.Color(0xFFEEAA),emissiveIntensity:1.4}));
  bulb.position.set(0,.50,0);g.add(bulb);
  return g;
}

/* ── PLANT — fallback; real = GlassVaseFlowers.glb ─────────── */
function buildPlant(){
  const g=new THREE.Group();
  // Ceramic pot with lathe profile
  const pot=lt([
    [0,0],[.18,0],[.22,.04],[.24,.10],[.24,.20],[.22,.36],
    [.20,.40],[.18,.42],[.20,.43],[.20,.44],[0,.44]
  ],24,new THREE.MeshStandardMaterial({color:0xEEE0D2,roughness:.75,metalness:.0}));
  pot.position.set(0,0,0);g.add(pot);
  // Soil disk
  const soil=cy(.17,.17,.02,20,new THREE.MeshStandardMaterial({color:0x261408,roughness:.98}));
  soil.position.set(0,.44,0);g.add(soil);
  // Trunk
  const trunk=cy(.028,.036,.52,10,MAT.wood(0x3A2012));trunk.position.set(0,.66,0);g.add(trunk);
  // Leaves — wider with more variety
  const lm=new THREE.MeshStandardMaterial({color:0x256E22,roughness:.80,side:THREE.DoubleSide});
  for(let i=0;i<12;i++){
    const a=i*(Math.PI*2/12)+Math.random()*.3;
    const r=.12+Math.random()*.22,h=.72+Math.random()*.70;
    const leaf=bx(.26+Math.random()*.14,.32+Math.random()*.12,.018,lm);
    leaf.position.set(Math.cos(a)*r,h,Math.sin(a)*r);
    leaf.rotation.set(-Math.cos(a)*.5,a,Math.sin(a)*.35);
    g.add(leaf);
  }
  return g;
}

/* ── RUGS ───────────────────────────────────────────────────── */
function buildRugClassic(){
  const g=new THREE.Group();
  // Main field
  const b=bx(2.5,.022,1.8,MAT.fabric(0xB86040));b.position.set(0,.011,0);g.add(b);
  // Border stripe
  const border=bx(2.3,.023,1.6,MAT.fabric(0xC87252));border.position.set(0,.012,0);g.add(border);
  // Inner field
  const inner=bx(2.0,.024,1.3,MAT.fabric(0xA84E34));inner.position.set(0,.013,0);g.add(inner);
  // Fringe lines (simplified)
  for(let i=0;i<10;i++){
    const f=cy(.008,.008,.06,4,MAT.fabric(0xE0C8A0));
    f.position.set(-1.18+i*.24,.04,-.92);f.rotation.x=Math.PI/2;g.add(f);
    const f2=f.clone();f2.position.set(-1.18+i*.24,.04,.92);g.add(f2);
  }
  return g;
}

function buildRugRound(){
  const g=new THREE.Group();
  const rings:[number,number][]=[
    [1.20,0x1A3055],[1.0,0x2A4470],[.78,0x1E3860],
    [.56,0x2A4470],[.36,0x1A3055],[.18,0xD4A830]
  ];
  rings.forEach(([r,col],i)=>{
    const c=cy(r,r,.022+i*.001,36,MAT.fabric(col));
    c.position.set(0,.011+i*.001,0);g.add(c);
  });
  return g;
}

function buildRugRunner(){
  const g=new THREE.Group();
  const b=bx(3.0,.022,.82,MAT.fabric(0x5A7852));b.position.set(0,.011,0);g.add(b);
  const stripe=bx(2.8,.023,.62,MAT.fabric(0x6A8860));stripe.position.set(0,.012,0);g.add(stripe);
  // Geometric diamond pattern (simplified)
  for(let i=0;i<6;i++){
    const d=bx(.16,.024,.16,MAT.fabric(0xC8B870));
    d.position.set(-1.2+i*.46,.013,0);d.rotation.y=Math.PI/4;g.add(d);
  }
  return g;
}

export function buildFurniture(type: string): THREE.Group | null {
  const map: Record<string, () => THREE.Group> = {
    sofa: buildSofa, armchair: buildArmchair, bench: buildBench,
    coffee: buildCoffeeTable, dining: buildDiningTable, side: buildSideTable,
    bookshelf: buildBookshelf, cabinet: buildCabinet,
    floorlamp: buildFloorLamp, pendant: buildPendant,
    plant: buildPlant, rug_classic: buildRugClassic,
    rug_round: buildRugRound, rug_runner: buildRugRunner,
  };
  return map[type]?.() ?? null;
}

/* ══════════════════════════════════════════════════════════════
   GLB URL REGISTRY
   Real models (downloaded to /public/models/):
     armchair  → SheenChair.glb   (Khronos, full PBR)
     floorlamp → IridescenceLamp.glb (Khronos, iridescent glass)
     pendant   → IridescenceLamp.glb (same lamp asset)
     plant     → GlassVaseFlowers.glb (Khronos, glass+flowers)
   Everything else: procedural geometry → GLTFExporter → blob URL
══════════════════════════════════════════════════════════════ */
const REAL_MODELS: Record<string, string> = {
  armchair:  "/models/chair.glb",
  floorlamp: "/models/lamp.glb",
  pendant:   "/models/lamp.glb",
  plant:     "/models/plant.glb",
};

const urlRegistry = new Map<string, string>();

// Preload all real models at module load so they are cached early
useGLTF.preload("/models/chair.glb");
useGLTF.preload("/models/lamp.glb");
useGLTF.preload("/models/plant.glb");

function exportGroupToGLB(group: THREE.Group): Promise<string> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      group,
      result => {
        const blob = new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
        resolve(URL.createObjectURL(blob));
      },
      reject,
      { binary: true },
    );
  });
}

async function initModelRegistry(): Promise<void> {
  for (const item of ITEMS) {
    if (urlRegistry.has(item.type)) continue;
    if (REAL_MODELS[item.type]) {
      urlRegistry.set(item.type, REAL_MODELS[item.type]);
    } else {
      const group = buildFurniture(item.type);
      if (group) urlRegistry.set(item.type, await exportGroupToGLB(group));
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
interface PlacedItem {
  id: string; type: string; label: string; price: number;
  initPos: [number, number, number];
  modelUrl?: string; /* custom GLB URL for vendor-uploaded models */
}
interface DragActive {
  groupRef: React.RefObject<THREE.Group | null>;
  offset: THREE.Vector3;
}

/* Shared drag-plane (Y=0 ground plane) — constant, defined once */
const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/* Model height offsets — real GLBs may need Y adjustment */
const Y_OFFSET: Record<string, number> = {
  armchair:  0,    // SheenChair origin = ground plane
  floorlamp: 0,    // IridescenceLamp origin = ground plane
  pendant:   2.2,  // IridescenceLamp reused as hanging pendant
  plant:     0,    // GlassVaseFlowers origin = ground plane
};

/* ══════════════════════════════════════════════════════════════
   R3F: individual furniture piece
   Loads its model via useGLTF(url), renders as <primitive>,
   handles pointerdown to start dragging.
══════════════════════════════════════════════════════════════ */
function FurniturePiece({
  item, isSelected, onSelect,
  dragActive, controlsRef, registerRotate,
}: {
  item: PlacedItem;
  isSelected: boolean;
  onSelect: (item: PlacedItem) => void;
  dragActive: React.MutableRefObject<DragActive | null>;
  controlsRef: React.RefObject<{ enabled: boolean } | null>;
  registerRotate: (id: string, fn: (dir: number) => void) => () => void;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    return registerRotate(item.id, (dir: number) => {
      if (groupRef.current) groupRef.current.rotation.y += dir * (Math.PI / 8);
    });
  }, [item.id, registerRotate]);
  const url = item.modelUrl ?? urlRegistry.get(item.type) ?? urlRegistry.get("sofa")!;

  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(c => {
      if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; }
    });
    return clone;
  }, [scene]);

  return (
    <group
      ref={groupRef}
      position={item.initPos}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // Capture the pointer so pointermove fires even if cursor leaves canvas
        gl.domElement.setPointerCapture(e.nativeEvent.pointerId);
        // Disable OrbitControls — it checks .enabled at the start of its handler
        // which fires after this (R3F fires first)
        if (controlsRef.current) controlsRef.current.enabled = false;
        onSelect(item);
        const pt = new THREE.Vector3();
        const hit = e.ray.intersectPlane(DRAG_PLANE, pt);
        dragActive.current = {
          groupRef,
          offset: hit ? pt.clone().sub(groupRef.current!.position) : new THREE.Vector3(),
        };
      }}
      onPointerMissed={() => {/* deselect handled at canvas level */}}
    >
      <primitive object={model} />
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.005}>
          <ringGeometry args={[0.6, 0.72, 48]} />
          <meshBasicMaterial color="#C8A870" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   R3F: room geometry (floor, walls, ceiling, skirting, window)
══════════════════════════════════════════════════════════════ */
function Room({ floorKind, wallHex }: { floorKind: string; wallHex: string }) {
  const floorTex = useMemo(() => {
    const t = makeFloorTex(floorKind); t.repeat.set(3, 3); return t;
  }, [floorKind]);

  const wallColor = useMemo(() => new THREE.Color(wallHex), [wallHex]);
  const R = 4.5;

  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: wallColor, roughness: .92, metalness: 0 }),
    [wallColor],
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[R * 2, R * 2]} />
        <meshStandardMaterial
          map={floorTex}
          roughness={floorKind === "marble" ? 0.07 : 0.52}
          metalness={0}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, R / 2, -R]} receiveShadow material={wallMat}>
        <planeGeometry args={[R * 2, R]} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-R, R / 2, 0]} rotation-y={Math.PI / 2} receiveShadow material={wallMat}>
        <planeGeometry args={[R * 2, R]} />
      </mesh>
      {/* Right wall */}
      <mesh position={[R, R / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow material={wallMat}>
        <planeGeometry args={[R * 2, R]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, R, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[R * 2, R * 2]} />
        <meshStandardMaterial color="#FAF8F4" roughness={.95} />
      </mesh>

      {/* Skirting boards */}
      {([
        [0, .04, -R + .02, 0, R * 2],
        [-R + .02, .04, 0, Math.PI / 2, R * 2],
        [R - .02, .04, 0, -Math.PI / 2, R * 2],
      ] as [number,number,number,number,number][]).map(([x, y, z, ry, l], i) => (
        <mesh key={i} position={[x, y, z]} rotation-y={ry} receiveShadow>
          <boxGeometry args={[l, .08, .04]} />
          <meshStandardMaterial color="#F0ECE4" roughness={.7} />
        </mesh>
      ))}

      {/* Window frame */}
      <mesh position={[-1.5, 2.9, -R + .08]}>
        <boxGeometry args={[1.9, .06, 1.6]} />
        <meshStandardMaterial color="#FFFDF8" roughness={.2} />
      </mesh>
      <mesh position={[-1.5, 2.9, -R + .08]}>
        <boxGeometry args={[.06, 1.5, 1.6]} />
        <meshStandardMaterial color="#FFFDF8" roughness={.2} />
      </mesh>
      <mesh position={[-1.5, 2.9, -R + .06]}>
        <planeGeometry args={[1.8, 1.4]} />
        <meshStandardMaterial color={0xadd8e6} roughness={.04} metalness={.12} transparent opacity={.28} />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   R3F: full scene content (inside <Canvas>)
   Owns the drag loop via gl.domElement pointer listeners.
══════════════════════════════════════════════════════════════ */
function SceneContent({
  items, floorKind, wallHex, selId,
  onSelect, onDeselect,
  controlsRef, dragActive, registerRotate,
}: {
  items: PlacedItem[];
  floorKind: string; wallHex: string; selId: string;
  onSelect: (item: PlacedItem) => void;
  onDeselect: () => void;
  controlsRef: React.RefObject<{ enabled: boolean } | null>;
  dragActive: React.MutableRefObject<DragActive | null>;
  registerRotate: (id: string, fn: (dir: number) => void) => () => void;
}) {
  const { gl, camera, raycaster } = useThree();

  /* Global pointermove / pointerup — update dragged piece position */
  useEffect(() => {
    const canvas = gl.domElement;

    function onMove(e: PointerEvent) {
      if (!dragActive.current) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width)  * 2 - 1,
          -((e.clientY - rect.top)  / rect.height) * 2 + 1,
        ),
        camera,
      );
      const tgt = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(DRAG_PLANE, tgt)) return;
      tgt.sub(dragActive.current.offset);
      const gr = dragActive.current.groupRef.current;
      if (gr) {
        const cx = THREE.MathUtils.clamp(tgt.x, -4, 4);
        const cz = THREE.MathUtils.clamp(tgt.z, -4, 4);
        // Always use .position.set() — never direct assignment
        gr.position.set(cx, gr.position.y, cz);
      }
    }

    function onUp() {
      if (!dragActive.current) return;
      dragActive.current = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
    }

    canvas.addEventListener("pointermove", onMove, { passive: false });
    canvas.addEventListener("pointerup",     onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup",     onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, raycaster, dragActive, controlsRef]);

  return (
    <>
      {/* Studio lighting */}
      <ambientLight intensity={0.4} color="#FFF8F2" />
      <directionalLight position={[5, 9, 5]}  intensity={2.0} color="#FFFAF0" castShadow
        shadow-mapSize={[4096, 4096]} shadow-camera-near={0.5} shadow-camera-far={32}
        shadow-camera-left={-9} shadow-camera-right={9}
        shadow-camera-top={10}  shadow-camera-bottom={-9}
        shadow-bias={-0.0006} shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 5, 2]}  intensity={0.6} color="#C8DEFF" />
      <directionalLight position={[0,  7, -6]} intensity={0.4} color="#FFE8D0" />
      <spotLight position={[-1.5, 4.5, -3.5]} intensity={1.6} color="#FFF6E8"
        angle={0.55} penumbra={0.5} target-position={[-1.5, 0, -0.5]}
      />

      {/* HDRI environment for realistic PBR reflections */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* Soft contact shadows — replaces hand-drawn gradient planes */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.65}
        scale={18}
        blur={2.8}
        far={6}
        resolution={512}
        color="#1a1008"
      />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef as React.RefObject<any>}
        makeDefault
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.03}
        minDistance={2}
        maxDistance={14}
        enableDamping
        dampingFactor={0.06}
        target={[0, 0.3, 0]}
      />

      {/* Room */}
      <Room floorKind={floorKind} wallHex={wallHex} />

      {/* Furniture pieces — each loads via useGLTF */}
      <Suspense fallback={null}>
        {items.map(item => (
          <FurniturePiece
            key={item.id}
            item={item}
            isSelected={item.id === selId}
            onSelect={onSelect}
            dragActive={dragActive}
            controlsRef={controlsRef}
            registerRotate={registerRotate}
          />
        ))}
      </Suspense>

      {/* Click empty space → deselect */}
      <mesh
        position={[0, -0.05, 0]}
        rotation-x={-Math.PI / 2}
        visible={false}
        onPointerDown={() => onDeselect()}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   THUMBNAIL GENERATOR  (off-screen WebGL, headless-safe)
══════════════════════════════════════════════════════════════ */
function generateThumbnail(type: string): string | null {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    const ctx = r.getContext();
    if (!ctx) { r.dispose(); return null; }
    r.setSize(160, 120); r.setPixelRatio(1);
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0xF8F5F0);
    const cam = new THREE.PerspectiveCamera(35, 160 / 120, .1, 100);
    sc.add(Object.assign(new THREE.DirectionalLight(0xFFF4E8, 1.8), { position: new THREE.Vector3(3, 5, 4) }));
    sc.add(new THREE.AmbientLight(0xFFF8F0, .7));
    const mesh = buildFurniture(type); if (!mesh) { r.dispose(); return null; }
    sc.add(mesh);
    const box = new THREE.Box3().setFromObject(mesh), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    const maxD = Math.max(size.x, size.y, size.z);
    cam.position.set(center.x + maxD * 1.4, center.y + maxD * .9, center.z + maxD * 1.4);
    cam.lookAt(center.x, center.y + size.y * .1, center.z); cam.updateProjectionMatrix();
    r.render(sc, cam);
    const url = r.domElement.toDataURL("image/jpeg", .88);
    r.dispose();
    return url;
  } catch {
    return null;
  }
}

/* ══════════════════════════════════════════════════════════════
   WebGL availability check — called BEFORE mounting R3F Canvas.
   If WebGL is not available (headless screenshot environment,
   old hardware) we skip the Canvas entirely so THREE.js never
   has a chance to throw "Error creating WebGL context."
══════════════════════════════════════════════════════════════ */
function checkWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function FormaHaus() {
  const cart = useCart();

  const [registryReady, setRegistryReady] = useState(false);
  const [items, setItems]                 = useState<PlacedItem[]>([]);
  const [total, setTotal]                 = useState(0);
  const [selId, setSelId]                 = useState("");
  const [selLabel, setSelLabel]           = useState("");
  const [selPrice, setSelPrice]           = useState(0);
  const [tab, setTab]                     = useState<"furniture" | "materials" | "summary">("furniture");
  const [openCats, setOpenCats]           = useState<Set<string>>(new Set(["seating"]));
  /* floor/wall: ID-based, derive hex from WALL_COLORS lookup */
  const [floorKind, setFloorKindRaw]      = useState("oak");
  const [wallColorId, setWallColorIdRaw]  = useState("white");
  const wallHex = WALL_COLORS.find(w => w.id === wallColorId)?.hex ?? "#F5F0EA";
  const [thumbs, setThumbs]               = useState<Record<string, string>>({});

  const webglOk     = useMemo(() => checkWebGL(), []);
  const controlsRef = useRef<{ enabled: boolean } | null>(null);
  const dragActive  = useRef<DragActive | null>(null);

  /* Build thumbnails + model registry */
  useEffect(() => {
    if (webglOk) {
      const map: Record<string, string> = {};
      ITEMS.forEach(it => { const u = generateThumbnail(it.type); if (u) map[it.type] = u; });
      setThumbs(map);
      initModelRegistry()
        .then(() => setRegistryReady(true))
        .catch(err => { console.warn("Model registry:", err); setRegistryReady(true); });
    } else {
      setRegistryReady(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-add product from URL params when designer opens from catalog */
  useEffect(() => {
    if (!registryReady) return;
    const params = new URLSearchParams(window.location.search);

    /* Case 1: ?add=<designer_type>  — built-in furniture */
    const addId = params.get("add");
    if (addId) {
      const prod = ITEMS.find(i => i.type === addId);
      if (prod) addFurniture(prod.type, prod.label, prod.price, prod.icon);
    }

    /* Case 2: ?modelUrl=<url>&label=<name>&price=<n>  — vendor GLB upload */
    const modelUrl = params.get("modelUrl");
    if (modelUrl) {
      const label = params.get("label") ?? "Товар";
      const price = parseFloat(params.get("price") ?? "0") || 0;
      const type  = `custom_${Date.now()}`;
      /* Register the custom model URL so FurniturePiece can find it */
      urlRegistry.set(type, modelUrl);
      addFurniture(type, label, price, "📦", modelUrl);
    }

    /* Clean up URL */
    const url = new URL(window.location.href);
    url.searchParams.delete("add");
    url.searchParams.delete("modelUrl");
    url.searchParams.delete("label");
    url.searchParams.delete("price");
    window.history.replaceState({}, "", url.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registryReady]);

  /* Floor / wall change — update local state + cart context */
  const changeFloor = useCallback((k: string) => {
    setFloorKindRaw(k);
    cart.setFloorKind(k);
  }, [cart]);

  const changeWall = useCallback((id: string) => {
    setWallColorIdRaw(id);
    cart.setWallColorId(id);
  }, [cart]);

  const addFurniture = useCallback((type: string, label: string, price: number, icon = "", modelUrl?: string) => {
    if (!registryReady) return;
    const id = `${Date.now()}-${Math.random()}`;
    const y = Y_OFFSET[type] ?? 0;
    const initPos: [number, number, number] = [
      (Math.random() - .5) * 5, y, (Math.random() - .5) * 5,
    ];
    setItems(prev => [...prev, { id, type, label, price, initPos, modelUrl }]);
    setTotal(t => t + price);
    cart.addItem({ id, type, label, price, icon });
  }, [registryReady, cart]);

  const removeSelected = useCallback(() => {
    setItems(prev => {
      const item = prev.find(i => i.id === selId);
      if (!item) return prev;
      setTotal(t => t - item.price);
      return prev.filter(i => i.id !== selId);
    });
    cart.removeItem(selId);
    setSelId(""); setSelLabel(""); setSelPrice(0);
  }, [selId, cart]);

  const clearRoom = useCallback(() => {
    setItems([]); setTotal(0);
    setSelId(""); setSelLabel(""); setSelPrice(0);
    cart.clearItems();
  }, [cart]);

  const rotateSelected = useCallback((dir: number) => {
    if (!selId) return;
    // Direct mutation on the Three.js group via the active drag ref —
    // find the group from the scene by traversal is not needed since
    // we can call rotation.y change and it propagates on next frame.
    // We use a module-level ref map instead:
    rotateMap.current[selId]?.(dir);
  }, [selId]);

  const rotateMap = useRef<Record<string, (dir: number) => void>>({});

  const registerRotate = useCallback((id: string, fn: (dir: number) => void) => {
    rotateMap.current[id] = fn;
    return () => { delete rotateMap.current[id]; };
  }, []);

  const onSelect = useCallback((item: PlacedItem) => {
    setSelId(item.id); setSelLabel(item.label); setSelPrice(item.price);
  }, []);
  const onDeselect = useCallback(() => {
    setSelId(""); setSelLabel(""); setSelPrice(0);
  }, []);

  const fmt = (p: number) => p.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  /* Derived pricing for Summary tab */
  const floorMat  = FLOOR_OPTIONS.find(f => f.id === floorKind);
  const wallColor = WALL_COLORS.find(w => w.id === wallColorId);
  const ROOM_AREA = 81; // 9×9 m
  const FLOOR_PRICE_M2: Record<string,number> = { oak:45, walnut:68, marble:120, concrete:35 };
  const WALL_PRICE:     Record<string,number> = { white:280, sage:340, sand:340, clay:380, navy:420, char:400 };
  const floorCost  = ROOM_AREA * (FLOOR_PRICE_M2[floorKind] ?? 45);
  const wallCost   = WALL_PRICE[wallColorId] ?? 280;
  const grandTotal = total + floorCost + wallCost;

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", fontFamily: "'Inter',system-ui,sans-serif", background: "#1A1A1A", color: "#1A1A1A" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── HEADER ── */}
      <header style={{ height: 56, background: "#1A1A1A", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, flexShrink: 0, zIndex: 200, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <Link href="/">
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: 4, color: "#fff" }}>FORMA</span>
            <span style={{ fontSize: "1.05rem", fontWeight: 300, letterSpacing: 4, color: "#C8A870" }}>HAUS</span>
          </div>
        </Link>
        <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,.3)", letterSpacing: 2, textTransform: "uppercase" }}>3D Designer</div>
        <div style={{ flex: 1 }} />

        {/* Grand total chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "6px 14px" }}>
          <div>
            <div style={{ fontSize: ".55rem", fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>Проєкт</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#C8A870", lineHeight: 1 }}>{fmt(grandTotal)}</div>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.1)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{items.length}</div>
            <div style={{ fontSize: ".55rem", color: "rgba(255,255,255,.4)", letterSpacing: .8, textTransform: "uppercase" }}>Меблів</div>
          </div>
          <button onClick={clearRoom} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.6)", fontSize: ".68rem", fontWeight: 600, cursor: "pointer" }}>Очистити</button>
        </div>

        {/* Cart button */}
        <Link href="/cart">
          <div style={{ position: "relative", cursor: "pointer", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "#2563EB", display: "flex", alignItems: "center", gap: 7, color: "#fff" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span style={{ fontSize: ".72rem", fontWeight: 700 }}>Кошик</span>
            {cart.itemCount > 0 && (
              <span style={{ position: "absolute", top: -7, right: -7, background: "#fff", color: "#2563EB", fontSize: ".58rem", fontWeight: 900, borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cart.itemCount}
              </span>
            )}
          </div>
        </Link>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── SIDEBAR (white) ── */}
        <aside style={{ width: 296, background: "#fff", borderRight: "none", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 100, boxShadow: "2px 0 12px rgba(0,0,0,.18)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#F8F6F2", borderBottom: "1px solid #EAE4DC", flexShrink: 0 }}>
            {([
              { id: "furniture", label: "Меблі" },
              { id: "materials", label: "Матеріали" },
              { id: "summary",   label: "Кошторис" },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, height: 44, border: "none", background: "none", cursor: "pointer", fontSize: ".7rem", fontWeight: 700, letterSpacing: .3, textTransform: "uppercase", color: tab === t.id ? "#1A1A1A" : "#AAA", borderBottom: tab === t.id ? "2px solid #1A1A1A" : "2px solid transparent", transition: "all .18s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Furniture tab ── */}
          {tab === "furniture" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {CATS.map(cat => {
                const isOpen = openCats.has(cat.id);
                const catItems = ITEMS.filter(i => i.cat === cat.id);
                return (
                  <div key={cat.id} style={{ borderBottom: "1px solid #F0ECE6" }}>
                    <button onClick={() => setOpenCats(p => { const n = new Set(p); n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id); return n; })}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ fontSize: ".95rem" }}>{cat.icon}</span>
                      <span style={{ flex: 1, fontSize: ".8rem", fontWeight: 700, color: "#1A1A1A" }}>{cat.label}</span>
                      <span style={{ fontSize: ".75rem", color: "#BBB", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 10px 10px" }}>
                        {catItems.map(item => (
                          <CatalogCard key={item.type} item={item} thumb={thumbs[item.type]}
                            onAdd={() => addFurniture(item.type, item.label, item.price, item.icon)} fmt={fmt}
                            loading={!registryReady}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Materials tab ── */}
          {tab === "materials" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
              {/* Floor */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#AAA", marginBottom: 10 }}>Підлога</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {FLOOR_OPTIONS.map(fo => {
                    const sel = floorKind === fo.id;
                    return (
                      <button key={fo.id} onClick={() => changeFloor(fo.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, border: `1.5px solid ${sel ? "#1A1A1A" : "#EAE4DC"}`, background: sel ? "#1A1A1A" : "transparent", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                        <FloorSwatch kind={fo.id} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: ".78rem", fontWeight: 600, color: sel ? "#fff" : "#1A1A1A" }}>{fo.label}</div>
                          <div style={{ fontSize: ".63rem", color: sel ? "rgba(255,255,255,.5)" : "#999", marginTop: 1 }}>{fo.sub}</div>
                        </div>
                        {sel && <span style={{ color: "#C8A870", fontSize: ".8rem" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wall */}
              <div>
                <div style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#AAA", marginBottom: 10 }}>Колір стін</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                  {WALL_COLORS.map(wc => {
                    const sel = wallColorId === wc.id;
                    return (
                      <button key={wc.id} onClick={() => changeWall(wc.id)}
                        style={{ padding: "9px 5px", borderRadius: 10, border: `1.5px solid ${sel ? "#1A1A1A" : "#EAE4DC"}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all .15s" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 7, background: wc.hex, border: "1px solid rgba(0,0,0,.08)", boxShadow: sel ? "0 0 0 2px #1A1A1A" : "none" }} />
                        <span style={{ fontSize: ".58rem", fontWeight: 600, color: "#555", lineHeight: 1.2, textAlign: "center" }}>{wc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Summary tab ── */}
          {tab === "summary" && (
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, padding: "14px" }}>

                {/* Furniture list */}
                {items.length > 0 ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "#AAA", marginBottom: 8 }}>Меблі та декор</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {items.map(it => (
                        <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "#F9F7F4" }}>
                          <span style={{ fontSize: ".9rem" }}>{ITEMS.find(i=>i.type===it.type)?.icon ?? "🛋️"}</span>
                          <span style={{ flex: 1, fontSize: ".74rem", fontWeight: 600, color: "#333" }}>{it.label}</span>
                          <span style={{ fontSize: ".74rem", fontWeight: 700, color: "#1A1A1A" }}>{fmt(it.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px 0", fontSize: ".72rem", color: "#888" }}>
                      <span>Підсумок меблів</span>
                      <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{fmt(total)}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 8px", color: "#BBB", fontSize: ".78rem" }}>
                    Додайте меблі з вкладки «Меблі»
                  </div>
                )}

                {/* Floor line item */}
                <div style={{ marginBottom: 10, padding: "10px 10px", background: "#F5F2EE", borderRadius: 10, border: "1px solid #EAE4DC" }}>
                  <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#AAA", marginBottom: 4 }}>🪵 Підлога</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: ".76rem", fontWeight: 600, color: "#333" }}>{floorMat?.label ?? floorKind}</div>
                      <div style={{ fontSize: ".62rem", color: "#999", marginTop: 1 }}>{ROOM_AREA} м² × {fmt(FLOOR_PRICE_M2[floorKind] ?? 45)}/м²</div>
                    </div>
                    <div style={{ fontSize: ".86rem", fontWeight: 800, color: "#1A1A1A" }}>{fmt(floorCost)}</div>
                  </div>
                </div>

                {/* Wall line item */}
                <div style={{ marginBottom: 16, padding: "10px 10px", background: "#F5F2EE", borderRadius: 10, border: "1px solid #EAE4DC" }}>
                  <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#AAA", marginBottom: 4 }}>🎨 Стіни</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: ".76rem", fontWeight: 600, color: "#333" }}>{wallColor?.label ?? wallColorId}</div>
                      <div style={{ fontSize: ".62rem", color: "#999", marginTop: 1 }}>Фарбування 3 стін, ~121 м²</div>
                    </div>
                    <div style={{ fontSize: ".86rem", fontWeight: 800, color: "#1A1A1A" }}>{fmt(wallCost)}</div>
                  </div>
                </div>

                {/* Grand total */}
                <div style={{ borderTop: "1.5px solid #EAE4DC", paddingTop: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: ".72rem", color: "#888" }}>
                    <span>Меблі ({items.length} шт.)</span><span style={{ fontWeight: 600 }}>{fmt(total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: ".72rem", color: "#888" }}>
                    <span>Підлога</span><span style={{ fontWeight: 600 }}>{fmt(floorCost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: ".72rem", color: "#888" }}>
                    <span>Стіни</span><span style={{ fontWeight: 600 }}>{fmt(wallCost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", fontWeight: 900, color: "#1A1A1A" }}>
                    <span>Разом</span>
                    <span style={{ color: "#2563EB", fontSize: "1.05rem" }}>{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Order button */}
              <div style={{ padding: "0 14px 14px", flexShrink: 0 }}>
                <Link href="/cart">
                  <button style={{ width: "100%", height: 44, background: "#2563EB", color: "#fff", border: "none", borderRadius: 11, fontSize: ".8rem", fontWeight: 800, cursor: "pointer", letterSpacing: .5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    🛒 Замовити проєкт
                  </button>
                </Link>
                <button onClick={clearRoom} style={{ width: "100%", marginTop: 7, height: 36, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 9, fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}>
                  Очистити кімнату
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ── 3D CANVAS (dark) ── */}
        <div style={{ flex: 1, position: "relative", background: "#1A1A1A" }}>
          {!registryReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#1A1A1A", zIndex: 10, gap: 14 }}>
              <div style={{ width: 40, height: 40, border: "3px solid #C8A870", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              <div style={{ fontSize: ".8rem", color: "#666", letterSpacing: .5 }}>Завантаження 3D-моделей…</div>
            </div>
          )}

          {registryReady && webglOk && (
            <Canvas
              shadows
              camera={{ position: [0, 4.2, 7.5], fov: 46, near: 0.1, far: 100 }}
              style={{ touchAction: "none" }}
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
              onPointerMissed={onDeselect}
            >
              <SceneContent
                items={items}
                floorKind={floorKind}
                wallHex={wallHex}
                selId={selId}
                onSelect={onSelect}
                onDeselect={onDeselect}
                controlsRef={controlsRef}
                dragActive={dragActive}
                registerRotate={registerRotate}
              />
            </Canvas>
          )}

          {registryReady && !webglOk && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#666" }}>
              <div style={{ fontSize: "2.5rem" }}>🖥️</div>
              <div style={{ fontSize: ".9rem" }}>3D потребує WebGL — відкрийте у сучасному браузері</div>
            </div>
          )}

          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.65)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "5px 16px", fontSize: ".66rem", color: "rgba(255,255,255,.6)", pointerEvents: "none", letterSpacing: .3 }}>
            Орбіта · Прокрутка = зум · Перетягуйте меблі
          </div>

          {selId && (
            <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(255,255,255,.97)", backdropFilter: "blur(20px)", border: "1px solid #EAE4DC", borderRadius: 14, padding: "15px 16px", minWidth: 185, boxShadow: "0 10px 36px rgba(0,0,0,.22)" }}>
              <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#AAA", marginBottom: 3 }}>Вибрано</div>
              <div style={{ fontSize: ".88rem", fontWeight: 700, marginBottom: 1, color: "#1A1A1A" }}>{selLabel}</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#C8A870", marginBottom: 11 }}>{fmt(selPrice)}</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
                <button onClick={() => rotateSelected(-1)} style={rotBtnSt}>↺ Повернути</button>
                <button onClick={() => rotateSelected(1)}  style={rotBtnSt}>↻ Повернути</button>
              </div>
              <button onClick={removeSelected} style={{ width: "100%", padding: "6px 0", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 7, fontSize: ".7rem", fontWeight: 700, cursor: "pointer" }}>Видалити</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UI SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */
const rotBtnSt: React.CSSProperties = { flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid #EAE4DC", background: "#F8F5F0", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" };

function CatalogCard({ item, thumb, onAdd, fmt, loading }: { item: typeof ITEMS[number]; thumb: string | undefined; onAdd: () => void; fmt: (p: number) => string; loading: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", gap: 10, padding: "10px", borderRadius: 10, border: `1px solid ${hov ? "#D4C4AC" : "#F0ECE6"}`, background: hov ? "#FAFAF8" : "#fff", marginBottom: 6, transition: "all .15s", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1 }}
      onClick={loading ? undefined : onAdd}>
      <div style={{ width: 72, height: 54, borderRadius: 8, overflow: "hidden", background: "#F8F5F0", flexShrink: 0, border: "1px solid #EAE4DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {thumb ? <img src={thumb} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
        <div style={{ fontSize: ".65rem", color: "#888", marginBottom: 4, lineHeight: 1.3 }}>{item.desc}</div>
        <div style={{ fontSize: ".82rem", fontWeight: 800 }}>{fmt(item.price)}</div>
      </div>
      <div style={{ alignSelf: "center", flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: hov ? "#1A1A1A" : "#F0ECE6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: hov ? "#C8A870" : "#888", transition: "all .15s" }}>+</div>
    </div>
  );
}

function FloorSwatch({ kind }: { kind: string }) {
  return (
    <canvas width={48} height={34} ref={el => {
      if (!el) return;
      const ctx = el.getContext("2d")!;
      if (kind === "oak") {
        ctx.fillStyle = "#C8A060"; ctx.fillRect(0,0,48,34);
        ctx.fillStyle="#B89048"; ctx.fillRect(0,0,24,17); ctx.fillRect(24,17,24,17);
        ctx.strokeStyle="rgba(0,0,0,.1)"; ctx.lineWidth=.6;
        ctx.beginPath(); ctx.moveTo(0,17); ctx.lineTo(48,17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(24,0); ctx.lineTo(24,34); ctx.stroke();
      } else if (kind === "walnut") {
        for(let i=0;i<6;i++){ctx.fillStyle=i%2===0?"#1E0E06":"#2A1408";ctx.fillRect(0,i*6,48,6);}
      } else if (kind === "marble") {
        const g=ctx.createLinearGradient(0,0,48,34); g.addColorStop(0,"#F8F5F0"); g.addColorStop(1,"#ECE8E2");
        ctx.fillStyle=g; ctx.fillRect(0,0,48,34);
        ctx.strokeStyle="rgba(160,140,120,.3)"; ctx.lineWidth=.8;
        ctx.beginPath(); ctx.moveTo(0,8); ctx.quadraticCurveTo(20,18,48,12); ctx.stroke();
      } else {
        ctx.fillStyle="#A0A09A"; ctx.fillRect(0,0,48,34);
        ctx.fillStyle="#A8A8A2"; ctx.fillRect(0,0,24,17); ctx.fillRect(24,17,24,17);
      }
    }} style={{ borderRadius: 6, border: "1px solid rgba(0,0,0,.08)", flexShrink: 0 }} />
  );
}
