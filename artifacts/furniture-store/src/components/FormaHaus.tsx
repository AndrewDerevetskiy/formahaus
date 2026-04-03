import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ════════ TYPES ════════════════════════════════════════════ */
interface PlacedItem {
  id: string;
  type: string;
  label: string;
  price: number;
  group: THREE.Group;
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  floor: THREE.Mesh;
  walls: THREE.Mesh[];
  items: PlacedItem[];
  floorTex: THREE.CanvasTexture | null;
  wallTex: THREE.CanvasTexture | null;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  dragPlane: THREE.Plane;
  dragOffset: THREE.Vector3;
  selected: PlacedItem | null;
  animId: number;
}

/* ════════ CATALOG ══════════════════════════════════════════ */
const CATS = [
  { id: "seating",  icon: "🛋️", label: "Seating"     },
  { id: "tables",   icon: "🍽️", label: "Tables"       },
  { id: "storage",  icon: "📚", label: "Storage"      },
  { id: "lighting", icon: "💡", label: "Lighting"     },
  { id: "decor",    icon: "🪴", label: "Decor & Rugs" },
];

const ITEMS = [
  { cat:"seating",  type:"sofa",       icon:"🛋️", label:"2-Seat Sofa",    desc:"Modern sectional",  price:1299 },
  { cat:"seating",  type:"armchair",   icon:"💺", label:"Armchair",        desc:"Accent chair",      price:649  },
  { cat:"seating",  type:"bench",      icon:"🪑", label:"Bench",           desc:"Entryway bench",    price:349  },
  { cat:"tables",   type:"coffee",     icon:"☕", label:"Coffee Table",    desc:"Low profile",       price:549  },
  { cat:"tables",   type:"dining",     icon:"🍽️", label:"Dining Table",    desc:"6-seater",          price:1199 },
  { cat:"tables",   type:"side",       icon:"🔳", label:"Side Table",      desc:"Bedside / sofa",    price:249  },
  { cat:"storage",  type:"bookshelf",  icon:"📚", label:"Bookshelf",       desc:"5-shelf unit",      price:449  },
  { cat:"storage",  type:"cabinet",    icon:"🗄️", label:"Cabinet",         desc:"Display cabinet",   price:799  },
  { cat:"lighting", type:"floorlamp",  icon:"💡", label:"Floor Lamp",      desc:"Arc lamp",          price:299  },
  { cat:"lighting", type:"pendant",    icon:"🔦", label:"Pendant Light",   desc:"Hanging light",     price:199  },
  { cat:"decor",    type:"plant",      icon:"🌿", label:"Plant",           desc:"Indoor plant",      price:89   },
  { cat:"decor",    type:"rug_classic",icon:"🟫", label:"Classic Rug",     desc:"Terracotta border", price:449  },
  { cat:"decor",    type:"rug_round",  icon:"⭕", label:"Round Rug",       desc:"Navy circular",     price:399  },
  { cat:"decor",    type:"rug_runner", icon:"▬",  label:"Runner Rug",      desc:"Sage green stripe", price:279  },
];

const WALL_COLORS = [
  { id:"white", hex:"#f8f4ef", label:"Warm White" },
  { id:"sage",  hex:"#b8c4b0", label:"Sage"       },
  { id:"rose",  hex:"#e8c4b8", label:"Dusty Rose" },
  { id:"navy",  hex:"#4a5568", label:"Navy"       },
  { id:"sand",  hex:"#d4c4a0", label:"Warm Sand"  },
];
const FLOOR_OPTIONS = [
  { id:"oak",      label:"Light Oak Parquet"    },
  { id:"walnut",   label:"Dark Walnut Laminate" },
  { id:"linoleum", label:"Grey Linoleum"        },
];
const WALLPAPER_OPTIONS = [
  { id:"stripes",   label:"Vertical Stripes" },
  { id:"floral",    label:"Floral"           },
  { id:"geometric", label:"Geometric"        },
];

/* ════════ CANVAS TEXTURE HELPERS ═══════════════════════════ */
function makeCanvasTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const el = document.createElement("canvas");
  el.width = w; el.height = h;
  draw(el.getContext("2d")!);
  const t = new THREE.CanvasTexture(el);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeFloorTex(kind: string): THREE.CanvasTexture {
  return makeCanvasTex(512, 512, (ctx) => {
    if (kind === "oak") {
      const cols = ["#c99a58","#d4a86a","#bf9050","#cc9e60"];
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(0, i * 64, 256, 63);
        ctx.fillStyle = cols[(i + 2) % cols.length];
        ctx.fillRect(256, i * 64 + 32, 256, 63);
      }
      ctx.strokeStyle = "rgba(0,0,0,.07)"; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo(0, i*64); ctx.lineTo(512, i*64); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(256, 0); ctx.lineTo(256, 512); ctx.stroke();
    } else if (kind === "walnut") {
      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#2d1b0e" : "#3d2514";
        ctx.fillRect(0, i * 32, 512, 32);
        ctx.strokeStyle = "rgba(0,0,0,.1)"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(Math.random()*512, i*32); ctx.lineTo(Math.random()*512, (i+1)*32); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 16; i++) {
        ctx.beginPath(); ctx.moveTo(0, i*32); ctx.lineTo(512, i*32); ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#b8b4ac"; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = "#c2beb6";
      ctx.fillRect(0, 0, 256, 256); ctx.fillRect(256, 256, 256, 256);
      ctx.strokeStyle = "rgba(0,0,0,.05)"; ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo(0, i*64); ctx.lineTo(512, i*64); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i*64, 0); ctx.lineTo(i*64, 512); ctx.stroke();
      }
    }
  });
}

function makeWallpaperTex(kind: string): THREE.CanvasTexture {
  return makeCanvasTex(256, 256, (ctx) => {
    ctx.fillStyle = "#f5f0ea"; ctx.fillRect(0, 0, 256, 256);
    if (kind === "stripes") {
      ctx.fillStyle = "rgba(139,111,71,.15)";
      for (let x = 0; x < 256; x += 18) { ctx.fillRect(x, 0, 9, 256); }
    } else if (kind === "floral") {
      for (let iy = 0; iy < 256; iy += 40)
        for (let ix = 0; ix < 256; ix += 40) {
          ctx.beginPath(); ctx.arc(ix+20, iy+20, 9, 0, Math.PI*2);
          ctx.fillStyle = "rgba(200,150,170,.2)"; ctx.fill();
          ctx.beginPath(); ctx.arc(ix+20, iy+20, 4, 0, Math.PI*2);
          ctx.fillStyle = "rgba(180,220,140,.25)"; ctx.fill();
          for (let a = 0; a < Math.PI*2; a += Math.PI/3) {
            ctx.beginPath();
            ctx.ellipse(ix+20+Math.cos(a)*9, iy+20+Math.sin(a)*9, 4, 2, a, 0, Math.PI*2);
            ctx.fillStyle = "rgba(200,150,170,.15)"; ctx.fill();
          }
        }
    } else {
      ctx.strokeStyle = "rgba(100,80,60,.2)"; ctx.lineWidth = 1;
      for (let iy = 0; iy < 256; iy += 28)
        for (let ix = 0; ix < 256; ix += 28) {
          ctx.beginPath();
          ctx.moveTo(ix+14, iy); ctx.lineTo(ix+28, iy+14);
          ctx.lineTo(ix+14, iy+28); ctx.lineTo(ix, iy+14);
          ctx.closePath(); ctx.stroke();
        }
    }
  });
}

/* ════════ MESH HELPERS ════════════════════════════════════ */
function bx(w: number, h: number, d: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cy(rt: number, rb: number, h: number, seg: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, seg),
    new THREE.MeshLambertMaterial({ color })
  );
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ════════ FURNITURE BUILDERS ══════════════════════════════ */
function buildSofa(): THREE.Group {
  const g = new THREE.Group();
  const base = bx(2, .4, 1, 0x8b6f47); base.position.set(0, .2, 0); g.add(base);
  const back = bx(2, .55, .18, 0x7a6040); back.position.set(0, .6, -.41); g.add(back);
  const arm1 = bx(.15, .35, .95, 0x8b6f47); arm1.position.set(-.925, .35, 0); g.add(arm1);
  const arm2 = bx(.15, .35, .95, 0x8b6f47); arm2.position.set(.925, .35, 0); g.add(arm2);
  const c1 = bx(.88, .12, .75, 0xc8a882); c1.position.set(-.5, .42, .05); g.add(c1);
  const c2 = bx(.88, .12, .75, 0xc8a882); c2.position.set(.5, .42, .05); g.add(c2);
  const legPos: [number, number][] = [[-0.85,-0.45],[0.85,-0.45],[-0.85,0.45],[0.85,0.45]];
  for (const [lx, lz] of legPos) {
    const l = bx(.07, .1, .07, 0x3a2a1a); l.position.set(lx, .05, lz); g.add(l);
  }
  return g;
}

function buildArmchair(): THREE.Group {
  const g = new THREE.Group();
  const base = bx(1, .38, .9, 0x9c7a5a); base.position.set(0, .19, 0); g.add(base);
  const back = bx(1, .5, .16, 0x8a6b4e); back.position.set(0, .57, -.37); g.add(back);
  const arm1 = bx(.14, .3, .8, 0x9c7a5a); arm1.position.set(-.43, .28, 0); g.add(arm1);
  const arm2 = bx(.14, .3, .8, 0x9c7a5a); arm2.position.set(.43, .28, 0); g.add(arm2);
  const cush = bx(.75, .1, .65, 0xe0c8a0); cush.position.set(0, .39, .04); g.add(cush);
  const legPos: [number, number][] = [[-0.38,-0.38],[0.38,-0.38],[-0.38,0.38],[0.38,0.38]];
  for (const [lx, lz] of legPos) {
    const l = bx(.06, .09, .06, 0x3a2a1a); l.position.set(lx, .045, lz); g.add(l);
  }
  return g;
}

function buildBench(): THREE.Group {
  const g = new THREE.Group();
  const top = bx(1.6, .1, .45, 0xa08060); top.position.set(0, .35, 0); g.add(top);
  const legPos: [number, number][] = [[-0.68,-.16],[0.68,-.16],[-0.68,.16],[0.68,.16]];
  for (const [lx, lz] of legPos) {
    const l = bx(.07, .3, .07, 0x5a3a1a); l.position.set(lx, .15, lz); g.add(l);
  }
  const cb = bx(1.3, .06, .06, 0x5a3a1a); cb.position.set(0, .1, 0); g.add(cb);
  return g;
}

function buildCoffeeTable(): THREE.Group {
  const g = new THREE.Group();
  const top = bx(1.3, .08, .7, 0xd4b896); top.position.set(0, .38, 0); g.add(top);
  const legPos: [number, number][] = [[-0.58,-.28],[0.58,-.28],[-0.58,.28],[0.58,.28]];
  for (const [lx, lz] of legPos) {
    const l = bx(.06, .36, .06, 0x7a5a3a); l.position.set(lx, .18, lz); g.add(l);
  }
  const sh = bx(1.1, .05, .5, 0xc4a880); sh.position.set(0, .12, 0); g.add(sh);
  return g;
}

function buildDiningTable(): THREE.Group {
  const g = new THREE.Group();
  const top = bx(2, .08, 1, 0xe0c4a0); top.position.set(0, .76, 0); g.add(top);
  const legPos: [number, number][] = [[-0.88,-.43],[0.88,-.43],[-0.88,.43],[0.88,.43]];
  for (const [lx, lz] of legPos) {
    const l = bx(.07, .72, .07, 0x6a4a2a); l.position.set(lx, .36, lz); g.add(l);
  }
  const h1 = bx(1.7, .05, .05, 0x6a4a2a); h1.position.set(0, .28, -.4); g.add(h1);
  const h2 = bx(1.7, .05, .05, 0x6a4a2a); h2.position.set(0, .28, .4); g.add(h2);
  return g;
}

function buildSideTable(): THREE.Group {
  const g = new THREE.Group();
  const top = bx(.55, .06, .55, 0xd4b896); top.position.set(0, .58, 0); g.add(top);
  const stem = bx(.12, .52, .12, 0x8a6a4a); stem.position.set(0, .26, 0); g.add(stem);
  const base2 = bx(.4, .04, .4, 0x8a6a4a); base2.position.set(0, .02, 0); g.add(base2);
  return g;
}

function buildBookshelf(): THREE.Group {
  const g = new THREE.Group();
  const left = bx(.08, 1.8, .35, 0x8a6040); left.position.set(-.46, .9, 0); g.add(left);
  const right = bx(.08, 1.8, .35, 0x8a6040); right.position.set(.46, .9, 0); g.add(right);
  const topP = bx(1, .08, .35, 0x8a6040); topP.position.set(0, 1.76, 0); g.add(topP);
  const bot = bx(1, .08, .35, 0x8a6040); bot.position.set(0, .04, 0); g.add(bot);
  for (let i = 1; i <= 4; i++) {
    const sh = bx(.92, .05, .35, 0xa07848); sh.position.set(0, i * .4, 0); g.add(sh);
  }
  const bookColors = [0xcc4444,0x4466cc,0x44aa44,0xcc8844,0x9944cc,0xcc4488];
  for (let s = 0; s < 4; s++) {
    let xOff = -0.38;
    const count = 3 + Math.floor(Math.random() * 4);
    for (let b = 0; b < count; b++) {
      const bw = .04 + Math.random() * .04;
      const bh = .1 + Math.random() * .12;
      const bk = bx(bw, bh, .25, bookColors[Math.floor(Math.random() * bookColors.length)]);
      bk.position.set(xOff + bw / 2, s * .4 + .08 + bh / 2, 0);
      g.add(bk); xOff += bw + .005;
    }
  }
  return g;
}

function buildCabinet(): THREE.Group {
  const g = new THREE.Group();
  const body = bx(1, .95, .45, 0xd4c0a0); body.position.set(0, .475, 0); g.add(body);
  const d1 = bx(.46, .85, .03, 0xc8b490); d1.position.set(-.25, .48, .23); g.add(d1);
  const d2 = bx(.46, .85, .03, 0xc8b490); d2.position.set(.25, .48, .23); g.add(d2);
  const h1 = bx(.03, .06, .04, 0x888888); h1.position.set(-.03, .48, .255); g.add(h1);
  const h2 = bx(.03, .06, .04, 0x888888); h2.position.set(.03, .48, .255); g.add(h2);
  const legPos: [number, number][] = [[-0.42,-.18],[0.42,-.18],[-0.42,.18],[0.42,.18]];
  for (const [lx, lz] of legPos) {
    const l = bx(.06, .1, .06, 0x888888); l.position.set(lx, .05, lz); g.add(l);
  }
  return g;
}

function buildFloorLamp(): THREE.Group {
  const g = new THREE.Group();
  const base2 = cy(.2, .2, .06, 16, 0x888888); base2.position.set(0, .03, 0); g.add(base2);
  const stem = cy(.025, .025, 1.5, 8, 0x666666); stem.position.set(0, .78, 0); g.add(stem);
  const shade = cy(.25, .12, .3, 16, 0xfff8e8); shade.position.set(0, 1.6, 0); g.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(.07, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffcc, emissive: new THREE.Color(0xffffaa), emissiveIntensity: .8 })
  );
  bulb.position.set(0, 1.58, 0); g.add(bulb);
  return g;
}

function buildPendant(): THREE.Group {
  const g = new THREE.Group();
  const cord = cy(.01, .01, .6, 4, 0x444444); cord.position.set(0, 1.1, 0); g.add(cord);
  const shade = cy(.3, .12, .25, 16, 0xd4a860); shade.position.set(0, .77, 0); g.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(.06, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffcc, emissive: new THREE.Color(0xffffaa), emissiveIntensity: .8 })
  );
  bulb.position.set(0, .77, 0); g.add(bulb);
  return g;
}

function buildPlant(): THREE.Group {
  const g = new THREE.Group();
  const pot = cy(.2, .25, .35, 12, 0xb87040); pot.position.set(0, .175, 0); g.add(pot);
  const soil = cy(.19, .19, .04, 12, 0x3a2a1a); soil.position.set(0, .37, 0); g.add(soil);
  for (let i = 0; i < 7; i++) {
    const angle = i * (Math.PI * 2 / 7);
    const lean = .3 + Math.random() * .2;
    const leaf = bx(.15, .04, .1, 0x3a7a2a);
    leaf.position.set(Math.cos(angle) * lean * .5, .65 + Math.random() * .3, Math.sin(angle) * lean * .5);
    leaf.rotation.set(-Math.cos(angle) * .5, angle, 0);
    g.add(leaf);
  }
  return g;
}

function buildRugClassic(): THREE.Group {
  const g = new THREE.Group();
  const base2 = bx(2.5, .02, 1.8, 0xc87050); base2.position.set(0, .01, 0); g.add(base2);
  const inner = bx(2.1, .021, 1.4, 0xd48868); inner.position.set(0, .011, 0); g.add(inner);
  const core = bx(1.7, .022, 1.0, 0xe0a080); core.position.set(0, .012, 0); g.add(core);
  const b1 = bx(2.3, .023, .04, 0x8a4028); b1.position.set(0, .013, -.7); g.add(b1);
  const b2 = bx(2.3, .023, .04, 0x8a4028); b2.position.set(0, .013, .7); g.add(b2);
  const b3 = bx(.04, .023, 1.6, 0x8a4028); b3.position.set(-1.1, .013, 0); g.add(b3);
  const b4 = bx(.04, .023, 1.6, 0x8a4028); b4.position.set(1.1, .013, 0); g.add(b4);
  return g;
}

function buildRugRound(): THREE.Group {
  const g = new THREE.Group();
  const c1 = cy(1.2, 1.2, .02, 32, 0x1a3055); c1.position.set(0, .01, 0); g.add(c1);
  const c2 = cy(1.0, 1.0, .021, 32, 0x2a4470); c2.position.set(0, .011, 0); g.add(c2);
  const c3 = cy(.7, .7, .022, 32, 0x1a3055); c3.position.set(0, .012, 0); g.add(c3);
  const c4 = cy(.3, .3, .023, 32, 0xd4a840); c4.position.set(0, .013, 0); g.add(c4);
  return g;
}

function buildRugRunner(): THREE.Group {
  const g = new THREE.Group();
  const base2 = bx(3, .02, .8, 0x6a8860); base2.position.set(0, .01, 0); g.add(base2);
  const inner = bx(2.6, .021, .6, 0x7a9870); inner.position.set(0, .011, 0); g.add(inner);
  for (let i = 0; i < 3; i++) {
    const s = bx(2.4, .022, .08, 0x4a6840); s.position.set(0, .012, -.2 + i * .2); g.add(s);
  }
  return g;
}

function buildFurniture(type: string): THREE.Group | null {
  switch (type) {
    case "sofa":       return buildSofa();
    case "armchair":   return buildArmchair();
    case "bench":      return buildBench();
    case "coffee":     return buildCoffeeTable();
    case "dining":     return buildDiningTable();
    case "side":       return buildSideTable();
    case "bookshelf":  return buildBookshelf();
    case "cabinet":    return buildCabinet();
    case "floorlamp":  return buildFloorLamp();
    case "pendant":    return buildPendant();
    case "plant":      return buildPlant();
    case "rug_classic":return buildRugClassic();
    case "rug_round":  return buildRugRound();
    case "rug_runner": return buildRugRunner();
    default:           return null;
  }
}

/* ════════ COMPONENT ════════════════════════════════════════ */
export default function FormaHaus() {
  const vpRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneState | null>(null);

  const [tab, setTab] = useState<"furniture" | "materials">("furniture");
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(["seating"]));
  const [floorKind, setFloorKind] = useState("oak");
  const [wallColor, setWallColor] = useState("#f8f4ef");
  const [wallpaper, setWallpaper] = useState("");
  const [total, setTotal] = useState(0);
  const [selId, setSelId] = useState("");
  const [selLabel, setSelLabel] = useState("");
  const [selPrice, setSelPrice] = useState(0);

  /* ── Three.js init ─────────────────────────────────────── */
  useEffect(() => {
    const container = vpRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return; // no WebGL support (headless/server env)
    }
    if (!renderer.getContext()) return; // context creation silently failed
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece6);
    scene.fog = new THREE.FogExp2(0xf0ece6, 0.055);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.5, 6.5);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 13;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    /* Lights */
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.7));
    const sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    sun.position.set(4, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 25;
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.bias = -0.001;
    scene.add(sun);
    const fill = new THREE.PointLight(0xffeedd, 0.4, 15);
    fill.position.set(-3, 2, -1);
    scene.add(fill);

    /* Room */
    const R = 4.5; // half size (9m × 9m room)

    const floorTex = makeFloorTex("oak");
    floorTex.repeat.set(4, 4);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(R * 2, R * 2),
      new THREE.MeshLambertMaterial({ map: floorTex })
    );
    floor.rotation.set(-Math.PI / 2, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = () => new THREE.MeshLambertMaterial({ color: 0xf8f4ef });
    const wallDefs: [number, number, number, number, number, number][] = [
      [0,   R * .5, -R,       0,          R * 2, R],
      [-R,  R * .5,  0,  Math.PI / 2,    R * 2, R],
      [ R,  R * .5,  0, -Math.PI / 2,    R * 2, R],
    ];
    const walls: THREE.Mesh[] = [];
    for (const [wx, wy, wz, ry, ww, wh] of wallDefs) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), wallMat());
      w.position.set(wx, wy, wz);
      w.rotation.set(0, ry, 0);
      w.receiveShadow = true;
      scene.add(w); walls.push(w);
    }

    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(R * 2, R * 2),
      new THREE.MeshLambertMaterial({ color: 0xfaf8f5 })
    );
    ceil.rotation.set(Math.PI / 2, 0, 0);
    ceil.position.set(0, R, 0);
    scene.add(ceil);

    /* Skirting */
    const skMat = new THREE.MeshLambertMaterial({ color: 0xf0ece4 });
    const skirtDefs: [number, number, number, number, number][] = [
      [0,    .04, -R + .02,  0,         R * 2],
      [-R + .02, .04, 0,     Math.PI/2, R * 2],
      [ R - .02, .04, 0,    -Math.PI/2, R * 2],
    ];
    for (const [sx, sy, sz, sr, sl] of skirtDefs) {
      const sk = new THREE.Mesh(new THREE.BoxGeometry(sl, .08, .04), skMat);
      sk.position.set(sx, sy, sz);
      sk.rotation.set(0, sr, 0);
      scene.add(sk);
    }

    /* Window */
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.05, 1.4),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    winFrame.position.set(-1.5, 2.8, -R + .07);
    scene.add(winFrame);
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.2),
      new THREE.MeshLambertMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    glass.position.set(-1.5, 2.8, -R + .06);
    scene.add(glass);

    /* Drag / raycasting state */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const dragOffset = new THREE.Vector3();

    const state: SceneState = {
      renderer, scene, camera, controls, floor, walls,
      items: [], floorTex, wallTex: null,
      raycaster, mouse, dragPlane, dragOffset,
      selected: null, animId: 0
    };
    sceneRef.current = state;

    /* Animation */
    function animate() {
      state.animId = requestAnimationFrame(animate);
      controls.update();
      state.items.forEach(item => {
        const target = (item.group as any)._scaleTarget as number ?? 1;
        const cur = item.group.scale.x;
        if (Math.abs(cur - target) > 0.001) {
          const next = THREE.MathUtils.lerp(cur, target, 0.12);
          item.group.scale.set(next, next, next);
        }
      });
      renderer.render(scene, camera);
    }
    animate();

    /* Resize */
    function onResize() {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(state.animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  /* ── Mouse interaction ─────────────────────────────────── */
  useEffect(() => {
    const container = vpRef.current;
    if (!container) return;
    let dragging = false;

    function getPct(e: MouseEvent) {
      const r = container!.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -((e.clientY - r.top) / r.height) * 2 + 1,
      };
    }

    function onDown(e: MouseEvent) {
      const s = sceneRef.current; if (!s) return;
      const p = getPct(e);
      s.mouse.set(p.x, p.y);
      s.raycaster.setFromCamera(s.mouse, s.camera);
      const meshes: THREE.Object3D[] = [];
      s.items.forEach(it => it.group.traverse(c => { if (c instanceof THREE.Mesh) meshes.push(c); }));
      const hits = s.raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !(obj instanceof THREE.Group)) obj = obj.parent;
        if (obj instanceof THREE.Group) {
          const item = s.items.find(it => it.group === obj);
          if (item) {
            s.selected = item;
            setSelId(item.id); setSelLabel(item.label); setSelPrice(item.price);
            s.controls.enabled = false;
            dragging = true;
            const pt = new THREE.Vector3();
            s.raycaster.ray.intersectPlane(s.dragPlane, pt);
            s.dragOffset.copy(pt).sub(item.group.position);
          }
        }
      } else {
        s.selected = null;
        setSelId(""); setSelLabel(""); setSelPrice(0);
      }
    }

    function onMove(e: MouseEvent) {
      if (!dragging) return;
      const s = sceneRef.current; if (!s?.selected) return;
      const p = getPct(e);
      s.mouse.set(p.x, p.y);
      s.raycaster.setFromCamera(s.mouse, s.camera);
      const target = new THREE.Vector3();
      s.raycaster.ray.intersectPlane(s.dragPlane, target);
      target.sub(s.dragOffset);
      target.x = THREE.MathUtils.clamp(target.x, -4, 4);
      target.z = THREE.MathUtils.clamp(target.z, -4, 4);
      s.selected.group.position.set(target.x, s.selected.group.position.y, target.z);
    }

    function onUp() {
      dragging = false;
      const s = sceneRef.current;
      if (s) s.controls.enabled = true;
    }

    container.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /* ── Keyboard delete ───────────────────────────────────── */
  const deleteSelected = useCallback(() => {
    const s = sceneRef.current; if (!s?.selected) return;
    s.scene.remove(s.selected.group);
    const idx = s.items.findIndex(i => i.id === s.selected!.id);
    if (idx >= 0) {
      setTotal(t => t - s.selected!.price);
      s.items.splice(idx, 1);
    }
    s.selected = null;
    setSelId(""); setSelLabel(""); setSelPrice(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected]);

  /* ── Actions ───────────────────────────────────────────── */
  const addFurniture = useCallback((type: string, label: string, price: number) => {
    const s = sceneRef.current; if (!s) return;
    const group = buildFurniture(type);
    if (!group) return;
    const isPendant = type === "pendant";
    const gy = isPendant ? 2.5 : 0;
    group.position.set((Math.random() - .5) * 5, gy, (Math.random() - .5) * 5);
    (group as any)._scaleTarget = 1;
    group.scale.set(0.01, 0.01, 0.01);
    group.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; } });
    s.scene.add(group);
    const id = `${Date.now()}-${Math.random()}`;
    s.items.push({ id, type, label, price, group });
    setTotal(t => t + price);
  }, []);

  const changeFloor = useCallback((kind: string) => {
    const s = sceneRef.current; if (!s) return;
    if (s.floorTex) s.floorTex.dispose();
    const t = makeFloorTex(kind);
    t.repeat.set(4, 4);
    s.floorTex = t;
    (s.floor.material as THREE.MeshLambertMaterial).map = t;
    (s.floor.material as THREE.MeshLambertMaterial).needsUpdate = true;
  }, []);

  const changeWallColor = useCallback((hex: string) => {
    const s = sceneRef.current; if (!s) return;
    const col = new THREE.Color(hex);
    s.walls.forEach(w => {
      const mat = w.material as THREE.MeshLambertMaterial;
      mat.map = null; mat.color.copy(col); mat.needsUpdate = true;
    });
  }, []);

  const applyWallpaper = useCallback((kind: string) => {
    const s = sceneRef.current; if (!s) return;
    if (s.wallTex) s.wallTex.dispose();
    const t = makeWallpaperTex(kind);
    t.repeat.set(3, 2);
    s.wallTex = t;
    s.walls.forEach(w => {
      const mat = w.material as THREE.MeshLambertMaterial;
      mat.color.set(0xffffff); mat.map = t; mat.needsUpdate = true;
    });
  }, []);

  const clearRoom = useCallback(() => {
    const s = sceneRef.current; if (!s) return;
    s.items.forEach(i => s.scene.remove(i.group));
    s.items.length = 0;
    s.selected = null;
    setSelId(""); setSelLabel(""); setSelPrice(0); setTotal(0);
  }, []);

  const rotate = useCallback((dir: number) => {
    const s = sceneRef.current;
    if (!s?.selected) return;
    s.selected.group.rotation.y += dir * (Math.PI / 8);
  }, []);

  const toggleCat = useCallback((id: string) => {
    setOpenCats(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const fmt = (p: number) =>
    p.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  /* ── Thumbnail canvas painters ─────────────────────────── */
  function drawFloorThumb(el: HTMLCanvasElement | null, kind: string) {
    if (!el) return;
    const ctx = el.getContext("2d")!;
    if (kind === "oak") {
      ctx.fillStyle = "#d4a86a"; ctx.fillRect(0, 0, 42, 30);
      ctx.fillStyle = "#c99a58"; ctx.fillRect(0, 0, 21, 15); ctx.fillRect(21, 15, 21, 15);
      ctx.strokeStyle = "rgba(0,0,0,.1)"; ctx.lineWidth = .5;
      ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(42, 15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(21, 0); ctx.lineTo(21, 30); ctx.stroke();
    } else if (kind === "walnut") {
      ctx.fillStyle = "#2d1b0e"; ctx.fillRect(0, 0, 42, 30);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#3d2514" : "#4a2e19";
        ctx.fillRect(0, i * 6, 42, 6);
      }
    } else {
      ctx.fillStyle = "#b8b4ac"; ctx.fillRect(0, 0, 42, 30);
      ctx.fillStyle = "#c2beb6"; ctx.fillRect(0, 0, 21, 15); ctx.fillRect(21, 15, 21, 15);
    }
  }

  function drawWpThumb(el: HTMLCanvasElement | null, kind: string) {
    if (!el) return;
    const ctx = el.getContext("2d")!;
    ctx.fillStyle = "#f5f0ea"; ctx.fillRect(0, 0, 42, 30);
    if (kind === "stripes") {
      ctx.fillStyle = "rgba(139,111,71,.2)";
      for (let x = 0; x < 42; x += 6) { ctx.fillRect(x, 0, 3, 30); }
    } else if (kind === "floral") {
      ctx.fillStyle = "rgba(200,150,170,.3)";
      for (let iy = 0; iy < 30; iy += 12)
        for (let ix = 0; ix < 42; ix += 12) {
          ctx.beginPath(); ctx.arc(ix + 6, iy + 6, 4, 0, Math.PI * 2); ctx.fill();
        }
    } else {
      ctx.strokeStyle = "rgba(100,80,60,.25)"; ctx.lineWidth = .7;
      for (let iy = 0; iy < 30; iy += 10)
        for (let ix = 0; ix < 42; ix += 10) {
          ctx.beginPath();
          ctx.moveTo(ix + 5, iy); ctx.lineTo(ix + 10, iy + 5);
          ctx.lineTo(ix + 5, iy + 10); ctx.lineTo(ix, iy + 5);
          ctx.closePath(); ctx.stroke();
        }
    }
  }

  /* ── Styles ────────────────────────────────────────────── */
  const S = {
    root: { position:"fixed" as const, inset:0, fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f0ece6", color:"#2c2c2c", overflow:"hidden" },
    hdr:  { position:"fixed" as const, top:0, left:0, right:0, height:52, background:"#fff", borderBottom:"1px solid #e2d9ce", display:"flex", alignItems:"center", padding:"0 18px", zIndex:200, gap:10 },
    logo: { fontSize:"1.1rem", fontWeight:800, letterSpacing:3, whiteSpace:"nowrap" as const },
    hint: { fontSize:".69rem", color:"#999", flex:1, textAlign:"center" as const },
    chip: { display:"flex", alignItems:"baseline", gap:5, padding:"5px 14px", background:"#faf5ee", border:"1.5px solid #c9a97e", borderRadius:22, whiteSpace:"nowrap" as const, marginLeft:"auto" },
    chipLbl: { fontSize:".63rem", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:.8, color:"#999" },
    chipVal: { fontSize:"1rem", fontWeight:800, color:"#8b6f47" },
    clearBtn: { padding:"6px 14px", borderRadius:7, border:"1px solid #fca5a5", fontSize:".76rem", fontWeight:600, cursor:"pointer", background:"#fef2f2", color:"#dc2626" },
    sb:  { position:"fixed" as const, top:52, left:0, bottom:0, width:258, background:"#fff", borderRight:"1px solid #e2d9ce", display:"flex", flexDirection:"column" as const, zIndex:100 },
    tabBar: { display:"flex", borderBottom:"1px solid #e2d9ce", flexShrink:0 },
    vp:  { position:"fixed" as const, top:52, left:258, right:0, bottom:0 },
    hint2: { position:"fixed" as const, bottom:14, left:272, background:"rgba(255,255,255,.82)", backdropFilter:"blur(10px)", border:"1px solid #e2d9ce", borderRadius:20, padding:"5px 14px", fontSize:".68rem", color:"#999", pointerEvents:"none" as const, zIndex:60 },
    selPanel: { position:"fixed" as const, bottom:14, right:18, background:"rgba(255,255,255,.96)", backdropFilter:"blur(10px)", border:"1px solid #e2d9ce", borderRadius:12, padding:"13px 15px", zIndex:60, minWidth:175 },
  };

  function tabStyle(id: string) {
    const active = tab === id;
    return { flex:1, height:40, display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:".78rem", fontWeight:700, cursor:"pointer", color:active?"#8b6f47":"#999", borderBottom:active?"2.5px solid #8b6f47":"2.5px solid transparent", transition:"all .15s", userSelect:"none" as const };
  }

  function catStyle(id: string) {
    const open = openCats.has(id);
    return { display:"flex", alignItems:"center", gap:9, padding:"9px 16px", fontSize:".8rem", fontWeight:700, cursor:"pointer", borderLeft:`3px solid ${open?"#8b6f47":"transparent"}`, background:open?"#f5ede0":"transparent", color:open?"#8b6f47":"#2c2c2c", transition:"all .13s", userSelect:"none" as const };
  }

  function fiStyle(hov: boolean) {
    return { display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:8, cursor:"pointer", background:hov?"#f7f2ec":"transparent", transition:"all .13s" };
  }

  return (
    <div style={S.root}>
      {/* HEADER */}
      <header style={S.hdr}>
        <div style={S.logo}>FORMA<span style={{ color:"#8b6f47" }}>HAUS</span></div>
        <div style={S.hint}>Click item to add · Drag to move · Delete key to remove</div>
        <div style={S.chip}>
          <span style={S.chipLbl}>Total Order</span>
          <span style={S.chipVal}>{fmt(total)}</span>
        </div>
        <button style={S.clearBtn} onClick={clearRoom}>✕ Clear Room</button>
      </header>

      {/* SIDEBAR */}
      <nav style={S.sb}>
        <div style={S.tabBar}>
          <div style={tabStyle("furniture")} onClick={() => setTab("furniture")}>🛋 Furniture</div>
          <div style={tabStyle("materials")} onClick={() => setTab("materials")}>🎨 Materials</div>
        </div>

        {/* ── Furniture tab ── */}
        {tab === "furniture" && (
          <div style={{ flex:1, overflowY:"auto" }}>
            <div style={{ padding:"13px 16px 5px", fontSize:".62rem", fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:"#999" }}>Furniture Library</div>
            {CATS.map(cat => {
              const isOpen = openCats.has(cat.id);
              const regularItems = ITEMS.filter(i => i.cat === cat.id && !i.type.startsWith("rug"));
              const rugItems     = ITEMS.filter(i => i.type.startsWith("rug"));
              return (
                <div key={cat.id}>
                  <div style={catStyle(cat.id)} onClick={() => toggleCat(cat.id)}>
                    <span>{cat.icon}</span>
                    {cat.label}
                    <span style={{ marginLeft:"auto", fontSize:".68rem", color:"#999", transform:isOpen?"rotate(90deg)":"none", transition:"transform .2s" }}>›</span>
                  </div>
                  {isOpen && (
                    <div style={{ display:"flex", flexDirection:"column", gap:1, padding:"2px 8px 8px" }}>
                      {cat.id === "decor" && (
                        <div style={{ padding:"6px 10px 4px", fontSize:".65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.2px", color:"#999", borderTop:"1px dashed #e2d9ce", marginTop:4 }}>🏠 Decor</div>
                      )}
                      {regularItems.map(item => (
                        <FurnitureRow key={item.type} item={item} onAdd={() => addFurniture(item.type, item.label, item.price)} fmt={fmt} />
                      ))}
                      {cat.id === "decor" && (
                        <>
                          <div style={{ padding:"6px 10px 4px", fontSize:".65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.2px", color:"#999", borderTop:"1px dashed #e2d9ce", marginTop:4 }}>🪡 Rugs & Carpets</div>
                          {rugItems.map(item => (
                            <FurnitureRow key={item.type} item={item} onAdd={() => addFurniture(item.type, item.label, item.price)} fmt={fmt} />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Materials tab ── */}
        {tab === "materials" && (
          <div style={{ flex:1, overflowY:"auto" }}>
            <div style={{ padding:"14px 16px 0" }}>
              <div style={{ fontSize:".63rem", fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:"#999", marginBottom:10 }}>Floor Finish</div>
              {FLOOR_OPTIONS.map(fo => (
                <div key={fo.id} onClick={() => { setFloorKind(fo.id); changeFloor(fo.id); }}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:8, border:`1.5px solid ${floorKind===fo.id?"#8b6f47":"#e2d9ce"}`, background:floorKind===fo.id?"#f5ede0":"transparent", cursor:"pointer", marginBottom:6, transition:"all .14s" }}>
                  <canvas ref={el => drawFloorThumb(el, fo.id)} width={42} height={30} style={{ borderRadius:5, border:"1px solid rgba(0,0,0,.08)", flexShrink:0 }} />
                  <span style={{ fontSize:".78rem", fontWeight:600 }}>{fo.label}</span>
                  <span style={{ marginLeft:"auto", opacity:floorKind===fo.id?1:0 }}>✓</span>
                </div>
              ))}
            </div>

            <div style={{ padding:"14px 16px 0" }}>
              <div style={{ fontSize:".63rem", fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:"#999", marginBottom:10 }}>Wall Color</div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12 }}>
                {WALL_COLORS.map(wc => (
                  <div key={wc.id} title={wc.label}
                    onClick={() => { setWallColor(wc.hex); setWallpaper(""); changeWallColor(wc.hex); }}
                    style={{ width:34, height:34, borderRadius:7, background:wc.hex, cursor:"pointer", border:`2.5px solid ${wallColor===wc.hex&&!wallpaper?"#8b6f47":"transparent"}`, boxShadow:wallColor===wc.hex&&!wallpaper?"0 0 0 2px #fff,0 0 0 4px #8b6f47":"0 1px 4px rgba(0,0,0,.08)", transition:"all .14s" }} />
                ))}
              </div>
            </div>

            <div style={{ padding:"0 16px 14px" }}>
              <div style={{ fontSize:".63rem", fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:"#999", marginBottom:10 }}>Wallpaper Pattern</div>
              {WALLPAPER_OPTIONS.map(wp => (
                <div key={wp.id} onClick={() => { setWallpaper(wp.id); applyWallpaper(wp.id); }}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:8, border:`1.5px solid ${wallpaper===wp.id?"#8b6f47":"#e2d9ce"}`, background:wallpaper===wp.id?"#f5ede0":"transparent", cursor:"pointer", marginBottom:6, transition:"all .14s" }}>
                  <canvas ref={el => drawWpThumb(el, wp.id)} width={42} height={30} style={{ borderRadius:5, border:"1px solid rgba(0,0,0,.08)", flexShrink:0 }} />
                  <span style={{ fontSize:".78rem", fontWeight:600 }}>{wp.label}</span>
                  <span style={{ marginLeft:"auto", opacity:wallpaper===wp.id?1:0 }}>✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 3D VIEWPORT */}
      <div ref={vpRef} style={S.vp} />

      {/* HINT */}
      <div style={S.hint2}>Orbit: drag · Zoom: scroll · Move item: click & drag on it</div>

      {/* SELECTION PANEL */}
      {selId && (
        <div style={S.selPanel}>
          <h4 style={{ fontSize:".82rem", color:"#8b6f47", fontWeight:700, margin:0 }}>{selLabel}</h4>
          <div style={{ fontSize:".85rem", fontWeight:700, marginTop:4 }}>{fmt(selPrice)}</div>
          <div style={{ display:"flex", gap:6, marginTop:8 }}>
            <button onClick={() => rotate(-1)} style={{ flex:1, padding:"5px 0", borderRadius:6, border:"1px solid #e2d9ce", background:"#fff", fontSize:".72rem", fontWeight:600, cursor:"pointer" }}>↺ Left</button>
            <button onClick={() => rotate(1)}  style={{ flex:1, padding:"5px 0", borderRadius:6, border:"1px solid #e2d9ce", background:"#fff", fontSize:".72rem", fontWeight:600, cursor:"pointer" }}>↻ Right</button>
          </div>
          <button onClick={deleteSelected} style={{ marginTop:7, width:"100%", padding:"6px 0", background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:6, fontSize:".72rem", fontWeight:700, cursor:"pointer" }}>🗑 Remove</button>
        </div>
      )}
    </div>
  );
}

/* ════════ SUB-COMPONENT ════════════════════════════════════ */
function FurnitureRow({
  item, onAdd, fmt
}: {
  item: typeof ITEMS[number];
  onAdd: () => void;
  fmt: (p: number) => string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onAdd} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:8, cursor:"pointer", background:hov?"#f7f2ec":"transparent", transition:"all .13s" }}>
      <div style={{ width:38, height:38, borderRadius:7, background:"#f7f2ec", border:"1px solid #e2d9ce", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>{item.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:".78rem", fontWeight:600 }}>{item.label}</div>
        <div style={{ fontSize:".63rem", color:"#999", marginTop:1 }}>{item.desc}</div>
        <div style={{ fontSize:".72rem", fontWeight:700, color:"#8b6f47", marginTop:2 }}>{fmt(item.price)}</div>
      </div>
    </div>
  );
}
