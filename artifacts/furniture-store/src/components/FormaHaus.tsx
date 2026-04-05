import { useEffect, useRef, useState, useCallback, useMemo, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls, Environment, ContactShadows, useGLTF,
} from "@react-three/drei";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

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
   FURNITURE GEOMETRY BUILDERS
══════════════════════════════════════════════════════════════ */
function bx(w:number,h:number,d:number,mat:THREE.Material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d,2,2,2),mat);m.castShadow=true;m.receiveShadow=true;return m;}
function cy(rt:number,rb:number,h:number,seg:number,mat:THREE.Material){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);m.castShadow=true;m.receiveShadow=true;return m;}
function sp(r:number,mat:THREE.Material){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);m.castShadow=true;m.receiveShadow=true;return m;}

function buildSofa(){const g=new THREE.Group();const up=MAT.fabric(0x8C7360),cu=MAT.fabric(0xA08470),lm=MAT.wood(0x4A3728);const base=bx(2.2,.38,1,up);base.position.set(0,.19,0);g.add(base);const back=bx(2.2,.62,.2,up);back.position.set(0,.61,-.4);g.add(back);const a1=bx(.18,.42,1,up);a1.position.set(-1.01,.36,0);g.add(a1);const a2=bx(.18,.42,1,up);a2.position.set(1.01,.36,0);g.add(a2);for(let i=0;i<3;i++){const c=bx(.65,.14,.82,cu);c.position.set(-0.66+i*.66,.43,.04);g.add(c);}for(let i=0;i<3;i++){const c=bx(.65,.44,.14,MAT.fabric(0x9A7E6A));c.position.set(-0.66+i*.66,.62,-.31);g.add(c);}for(const[x,z]of[[-0.95,-.4],[.95,-.4],[-0.95,.4],[.95,.4]] as[number,number][]){const l=cy(.035,.025,.13,8,lm);l.position.set(x,.065,z);g.add(l);}return g;}
function buildArmchair(){const g=new THREE.Group();const f=MAT.fabric(0xA08060),l=MAT.wood(0x3A2818);const base=bx(1.0,.36,.9,f);base.position.set(0,.18,0);g.add(base);const back=bx(1.0,.56,.18,f);back.position.set(0,.58,-.36);g.add(back);const a1=bx(.16,.34,.82,MAT.fabric(0x907050));a1.position.set(-.42,.3,0);g.add(a1);const a2=bx(.16,.34,.82,MAT.fabric(0x907050));a2.position.set(.42,.3,0);g.add(a2);const seat=bx(.74,.12,.68,MAT.fabric(0xB09070));seat.position.set(0,.40,.04);g.add(seat);const bc=bx(.74,.48,.12,MAT.fabric(0xB09070));bc.position.set(0,.58,-.28);g.add(bc);for(const[x,z]of[[-.36,-.36],[.36,-.36],[-.36,.36],[.36,.36]] as[number,number][]){const lp=cy(.032,.022,.12,8,l);lp.position.set(x,.06,z);g.add(lp);}return g;}
function buildBench(){const g=new THREE.Group();const seat=bx(1.7,.12,.48,MAT.fabric(0x6A8A6A));seat.position.set(0,.38,0);g.add(seat);const fr=bx(1.62,.06,.42,MAT.wood(0x5A3A18));fr.position.set(0,.32,0);g.add(fr);for(const[x,z]of[[-.72,-.16],[.72,-.16],[-.72,.16],[.72,.16]] as[number,number][]){const lp=cy(.03,.025,.3,8,MAT.metal(0x707070));lp.position.set(x,.15,z);g.add(lp);}const cb=bx(1.36,.04,.04,MAT.metal(0x707070));cb.position.set(0,.08,0);g.add(cb);return g;}
function buildCoffeeTable(){const g=new THREE.Group();const tm=MAT.wood(0xD8B888),lm=MAT.metal(0x505050);const top=bx(1.35,.07,.75,tm);top.position.set(0,.39,0);g.add(top);const sh=bx(1.1,.05,.55,tm);sh.position.set(0,.14,0);g.add(sh);for(const[x,z]of[[-.55,-.3],[.55,-.3],[-.55,.3],[.55,.3]] as[number,number][]){const l=cy(.025,.025,.34,6,lm);l.position.set(x,.17,z);g.add(l);}return g;}
function buildDiningTable(){const g=new THREE.Group();const tm=MAT.wood(0xDCBE8A),lm=MAT.wood(0x5A3A18);const top=bx(2.1,.06,1.05,tm);top.position.set(0,.78,0);g.add(top);for(const[x,z]of[[-.9,-.45],[.9,-.45],[-.9,.45],[.9,.45]] as[number,number][]){const l=cy(.045,.035,.72,8,lm);l.position.set(x,.36,z);g.add(l);}return g;}
function buildSideTable(){const g=new THREE.Group();const top=bx(.58,.04,.58,MAT.marble());top.position.set(0,.60,0);g.add(top);const stem=cy(.04,.04,.54,12,MAT.metal(0xC8A840));stem.position.set(0,.27,0);g.add(stem);const base=cy(.22,.22,.04,16,MAT.metal(0xC8A840));base.position.set(0,.02,0);g.add(base);return g;}
function buildBookshelf(){const g=new THREE.Group();const fr=MAT.wood(0xD8C0A0);const cols=[0xCC4444,0x4466CC,0x44AA44,0xCC8844,0x9944CC,0xCC4488,0x888844,0x44AACC];const s1=bx(.04,2.0,.38,fr);s1.position.set(-.52,1.0,0);g.add(s1);const s2=bx(.04,2.0,.38,fr);s2.position.set(.52,1.0,0);g.add(s2);const topP=bx(1.08,.04,.38,fr);topP.position.set(0,1.98,0);g.add(topP);const bot=bx(1.08,.04,.38,fr);bot.position.set(0,.02,0);g.add(bot);const bk=bx(1.08,1.98,.02,MAT.wood(0xC8B090));bk.position.set(0,1.0,-.18);g.add(bk);for(let i=1;i<=4;i++){const sh=bx(1.0,.04,.36,MAT.wood(0xE0C8A8));sh.position.set(0,i*.42,0);g.add(sh);}for(let s=0;s<5;s++){let xO=-.42;const n=4+Math.floor(Math.random()*5);for(let b=0;b<n&&xO<.38;b++){const bw=.03+Math.random()*.04,bh=.18+Math.random()*.16;const book=bx(bw,bh,.28,new THREE.MeshStandardMaterial({color:cols[Math.floor(Math.random()*cols.length)],roughness:.8}));book.position.set(xO+bw/2,s*.42+.03+bh/2,0);g.add(book);xO+=bw+.005;}}return g;}
function buildCabinet(){const g=new THREE.Group();const dm=MAT.wood(0xCCC0A8),hw=MAT.metal(0xB0A080);const bl=bx(1.65,1.0,.5,MAT.wood(0xD8C8B0));bl.position.set(0,.5,0);g.add(bl);for(let i=0;i<3;i++){const d=bx(.5,.88,.03,dm);d.position.set(-0.55+i*.55,.5,.26);g.add(d);const h=cy(.015,.015,.07,8,hw);h.position.set(-0.55+i*.55,.5,.29);h.rotation.set(Math.PI/2,0,0);g.add(h);}for(const[x,z]of[[-.72,-.18],[.72,-.18],[-.72,.18],[.72,.18]] as[number,number][]){const l=cy(.025,.025,.08,8,hw);l.position.set(x,.04,z);g.add(l);}return g;}
function buildFloorLamp(){const g=new THREE.Group();const mt=MAT.metal(0xC8B860);const base2=cy(.22,.22,.05,24,MAT.marble());base2.position.set(0,.025,0);g.add(base2);const stem=cy(.02,.02,1.6,8,mt);stem.position.set(0,.82,0);g.add(stem);const joint=sp(.035,mt);joint.position.set(0,1.62,0);g.add(joint);const shade=cy(.28,.16,.26,20,MAT.fabric(0xFFF8E8));shade.position.set(0,1.7,0);g.add(shade);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),new THREE.MeshStandardMaterial({color:0xFFFFCC,emissive:new THREE.Color(0xFFEEAA),emissiveIntensity:1.8}));bulb.position.set(0,1.68,0);g.add(bulb);return g;}
function buildPendant(){const g=new THREE.Group();const cord=cy(.008,.008,.7,4,MAT.metal(0x303030));cord.position.set(0,1.15,0);g.add(cord);const cap=cy(.06,.06,.04,12,MAT.metal(0xB0A080));cap.position.set(0,.8,0);g.add(cap);const shade=cy(.28,.06,.22,20,new THREE.MeshStandardMaterial({color:0x202428,roughness:.08,metalness:.12,transparent:true,opacity:.72}));shade.position.set(0,.68,0);g.add(shade);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),new THREE.MeshStandardMaterial({color:0xFFFFCC,emissive:new THREE.Color(0xFFEEAA),emissiveIntensity:1.2}));bulb.position.set(0,.68,0);g.add(bulb);return g;}
function buildPlant(){const g=new THREE.Group();const pot=cy(.22,.28,.42,20,MAT.fabric(0xF0EAE0));pot.position.set(0,.21,0);g.add(pot);const soil=cy(.20,.20,.03,16,new THREE.MeshStandardMaterial({color:0x2A1A0A,roughness:.98}));soil.position.set(0,.435,0);g.add(soil);const trunk=cy(.04,.05,.45,8,MAT.wood(0x4A3020));trunk.position.set(0,.66,0);g.add(trunk);const lm=new THREE.MeshStandardMaterial({color:0x2D6A2A,roughness:.82,side:THREE.DoubleSide});for(let i=0;i<9;i++){const a=i*(Math.PI*2/9);const r=.15+Math.random()*.2,h=.6+Math.random()*.6;const leaf=bx(.22+Math.random()*.12,.28+Math.random()*.1,.02,lm);leaf.position.set(Math.cos(a)*r,h,Math.sin(a)*r);leaf.rotation.set(-Math.cos(a)*.4,a,Math.sin(a)*.3);g.add(leaf);}return g;}
function buildRugClassic(){const g=new THREE.Group();const b=bx(2.5,.02,1.8,MAT.fabric(0xC87050));b.position.set(0,.01,0);g.add(b);const inner=bx(2.1,.021,1.4,MAT.fabric(0xD48868));inner.position.set(0,.011,0);g.add(inner);return g;}
function buildRugRound(){const g=new THREE.Group();([[1.2,0x1A3055],[1.0,0x2A4470],[.7,0x1A3055],[.4,0x2A4470],[.2,0xD4A840]] as[number,number][]).forEach(([r,col],idx)=>{const c=cy(r,r,.02+idx*.001,32,MAT.fabric(col));c.position.set(0,.01+idx*.001,0);g.add(c);});return g;}
function buildRugRunner(){const g=new THREE.Group();const b=bx(3,.02,.8,MAT.fabric(0x6A8860));b.position.set(0,.01,0);g.add(b);const inner=bx(2.6,.021,.6,MAT.fabric(0x7A9870));inner.position.set(0,.011,0);g.add(inner);return g;}

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
   - Real model: armchair → /models/chair.glb (Khronos SheenChair PBR)
   - All others: procedural geometry → GLTFExporter → blob URL
   Preload the real model so it's cached before any component mounts.
══════════════════════════════════════════════════════════════ */
const REAL_MODELS: Record<string, string> = {
  armchair: "/models/chair.glb",
};

const urlRegistry = new Map<string, string>();

// Kick off the real-model fetch immediately at module load
useGLTF.preload("/models/chair.glb");

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
}
interface DragActive {
  groupRef: React.RefObject<THREE.Group | null>;
  offset: THREE.Vector3;
}

/* Shared drag-plane (Y=0 ground plane) — constant, defined once */
const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/* Model height offsets for correct floor placement after useGLTF */
const Y_OFFSET: Record<string, number> = {
  armchair: 0,   // SheenChair sits on the ground correctly
  pendant: 2.5,  // hangs from ceiling
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
  const url = urlRegistry.get(item.type)!;

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
  const [registryReady, setRegistryReady] = useState(false);
  const [items, setItems]                 = useState<PlacedItem[]>([]);
  const [total, setTotal]                 = useState(0);
  const [selId, setSelId]                 = useState("");
  const [selLabel, setSelLabel]           = useState("");
  const [selPrice, setSelPrice]           = useState(0);
  const [tab, setTab]                     = useState<"furniture" | "materials">("furniture");
  const [openCats, setOpenCats]           = useState<Set<string>>(new Set(["seating"]));
  const [floorKind, setFloorKind]         = useState("oak");
  const [wallHex, setWallHex]             = useState("#F5F0EA");
  const [thumbs, setThumbs]               = useState<Record<string, string>>({});

  const webglOk     = useMemo(() => checkWebGL(), []);
  const controlsRef = useRef<{ enabled: boolean } | null>(null);
  const dragActive  = useRef<DragActive | null>(null);

  /* Build all GLB blob URLs before the Canvas renders */
  useEffect(() => {
    if (webglOk) {
      const map: Record<string, string> = {};
      ITEMS.forEach(it => { const u = generateThumbnail(it.type); if (u) map[it.type] = u; });
      setThumbs(map);
      initModelRegistry()
        .then(() => setRegistryReady(true))
        .catch(err => { console.warn("Model registry:", err); setRegistryReady(true); });
    } else {
      setRegistryReady(true); // show fallback message immediately
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFurniture = useCallback((type: string, label: string, price: number) => {
    if (!registryReady) return;
    const id = `${Date.now()}-${Math.random()}`;
    const y = Y_OFFSET[type] ?? 0;
    const initPos: [number, number, number] = [
      (Math.random() - .5) * 5, y, (Math.random() - .5) * 5,
    ];
    setItems(prev => [...prev, { id, type, label, price, initPos }]);
    setTotal(t => t + price);
  }, [registryReady]);

  const removeSelected = useCallback(() => {
    setItems(prev => {
      const item = prev.find(i => i.id === selId);
      if (!item) return prev;
      setTotal(t => t - item.price);
      return prev.filter(i => i.id !== selId);
    });
    setSelId(""); setSelLabel(""); setSelPrice(0);
  }, [selId]);

  const clearRoom = useCallback(() => {
    setItems([]); setTotal(0);
    setSelId(""); setSelLabel(""); setSelPrice(0);
  }, []);

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

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", fontFamily: "'Inter',system-ui,sans-serif", background: "#F0EBE4", color: "#1A1A1A" }}>

      {/* ── HEADER ── */}
      <header style={{ height: 56, background: "#1A1A1A", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: 4, color: "#fff" }}>FORMA</span>
          <span style={{ fontSize: "1.15rem", fontWeight: 300, letterSpacing: 4, color: "#C8A870" }}>HAUS</span>
        </div>
        <div style={{ flex: 1, fontSize: ".7rem", color: "rgba(255,255,255,.4)", textAlign: "center", letterSpacing: .5 }}>3D INTERIOR DESIGNER</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "8px 18px" }}>
          <div>
            <div style={{ fontSize: ".58rem", fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,.45)", textTransform: "uppercase", marginBottom: 1 }}>Project Total</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#C8A870", lineHeight: 1 }}>{fmt(total)}</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,.12)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{items.length}</div>
            <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,.4)", letterSpacing: .8, textTransform: "uppercase" }}>Items</div>
          </div>
          <button onClick={clearRoom} style={{ marginLeft: 4, padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.7)", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>Clear</button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 300, background: "#fff", borderRight: "1px solid #EAE4DC", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 100 }}>
          <div style={{ display: "flex", background: "#F8F5F0", borderBottom: "1px solid #EAE4DC", flexShrink: 0 }}>
            {(["furniture", "materials"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, height: 46, border: "none", background: "none", cursor: "pointer", fontSize: ".78rem", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", color: tab === t ? "#1A1A1A" : "#999", borderBottom: tab === t ? "2px solid #1A1A1A" : "2px solid transparent", transition: "all .18s" }}>
                {t === "furniture" ? "Furniture" : "Materials"}
              </button>
            ))}
          </div>

          {tab === "furniture" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {CATS.map(cat => {
                const isOpen = openCats.has(cat.id);
                const catItems = ITEMS.filter(i => i.cat === cat.id);
                return (
                  <div key={cat.id} style={{ borderBottom: "1px solid #F0ECE6" }}>
                    <button onClick={() => setOpenCats(p => { const n = new Set(p); n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id); return n; })}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ fontSize: "1rem" }}>{cat.icon}</span>
                      <span style={{ flex: 1, fontSize: ".82rem", fontWeight: 700, color: "#1A1A1A" }}>{cat.label}</span>
                      <span style={{ fontSize: ".75rem", color: "#999", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 12px 12px" }}>
                        {catItems.map(item => (
                          <CatalogCard key={item.type} item={item} thumb={thumbs[item.type]}
                            onAdd={() => addFurniture(item.type, item.label, item.price)} fmt={fmt}
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

          {tab === "materials" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 12 }}>Floor Material</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {FLOOR_OPTIONS.map(fo => {
                    const sel = floorKind === fo.id;
                    return (
                      <button key={fo.id} onClick={() => setFloorKind(fo.id)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${sel ? "#1A1A1A" : "#EAE4DC"}`, background: sel ? "#1A1A1A" : "transparent", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                        <FloorSwatch kind={fo.id} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: ".8rem", fontWeight: 600, color: sel ? "#fff" : "#1A1A1A" }}>{fo.label}</div>
                          <div style={{ fontSize: ".68rem", color: sel ? "rgba(255,255,255,.55)" : "#999", marginTop: 1 }}>{fo.sub}</div>
                        </div>
                        {sel && <span style={{ color: "#C8A870" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 12 }}>Wall Colour</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {WALL_COLORS.map(wc => {
                    const sel = wallHex === wc.hex;
                    return (
                      <button key={wc.id} onClick={() => setWallHex(wc.hex)}
                        style={{ padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${sel ? "#1A1A1A" : "#EAE4DC"}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all .15s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: wc.hex, border: "1px solid rgba(0,0,0,.08)", boxShadow: sel ? "0 0 0 2px #1A1A1A" : "none" }} />
                        <span style={{ fontSize: ".62rem", fontWeight: 600, color: "#555", lineHeight: 1.2, textAlign: "center" }}>{wc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── 3D CANVAS ── */}
        <div style={{ flex: 1, position: "relative" }}>
          {!registryReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#EDE8E0", zIndex: 10, gap: 14 }}>
              <div style={{ width: 40, height: 40, border: "3px solid #C8A870", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              <div style={{ fontSize: ".8rem", color: "#888", letterSpacing: .5 }}>Preparing 3D models…</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#aaa" }}>
              <div style={{ fontSize: "2.5rem" }}>🖥️</div>
              <div style={{ fontSize: ".9rem" }}>3D view requires WebGL — please open in a WebGL-capable browser</div>
            </div>
          )}

          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(26,26,26,.72)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "5px 16px", fontSize: ".68rem", color: "rgba(255,255,255,.7)", pointerEvents: "none", letterSpacing: .3 }}>
            Orbit · Scroll to zoom · Click + drag to move items
          </div>

          {selId && (
            <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(255,255,255,.96)", backdropFilter: "blur(16px)", border: "1px solid #EAE4DC", borderRadius: 14, padding: "16px 18px", minWidth: 190, boxShadow: "0 8px 32px rgba(0,0,0,.12)" }}>
              <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Selected</div>
              <div style={{ fontSize: ".9rem", fontWeight: 700, marginBottom: 2 }}>{selLabel}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#C8A870", marginBottom: 12 }}>{fmt(selPrice)}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <button onClick={() => rotateSelected(-1)} style={rotBtnSt}>↺ Rotate</button>
                <button onClick={() => rotateSelected(1)}  style={rotBtnSt}>↻ Rotate</button>
              </div>
              <button onClick={removeSelected} style={{ width: "100%", padding: "7px 0", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, fontSize: ".73rem", fontWeight: 700, cursor: "pointer" }}>Remove Item</button>
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
