import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
interface PlacedItem { id:string; type:string; label:string; price:number; group:THREE.Group }
interface SceneState {
  renderer:THREE.WebGLRenderer; scene:THREE.Scene; camera:THREE.PerspectiveCamera;
  controls:OrbitControls; floor:THREE.Mesh; walls:THREE.Mesh[]; items:PlacedItem[];
  floorTex:THREE.CanvasTexture|null; wallTex:THREE.CanvasTexture|null;
  raycaster:THREE.Raycaster; mouse:THREE.Vector2; dragPlane:THREE.Plane;
  dragOffset:THREE.Vector3; selected:PlacedItem|null; animId:number;
}

/* ══════════════════════════════════════════════════════════════
   CATALOG
══════════════════════════════════════════════════════════════ */
const CATS = [
  { id:"seating",  icon:"🛋️", label:"Seating"      },
  { id:"tables",   icon:"🪵",  label:"Tables"        },
  { id:"storage",  icon:"📦",  label:"Storage"       },
  { id:"lighting", icon:"💡",  label:"Lighting"      },
  { id:"decor",    icon:"🌿",  label:"Decor & Rugs"  },
];
const ITEMS = [
  { cat:"seating",  type:"sofa",        icon:"🛋️", label:"Nordic Sofa",         desc:"3-seat, linen upholstery",   price:2199 },
  { cat:"seating",  type:"armchair",    icon:"💺", label:"Lounge Armchair",      desc:"Walnut frame, bouclé",       price:1049 },
  { cat:"seating",  type:"bench",       icon:"🪑", label:"Upholstered Bench",    desc:"Oak legs, velvet seat",      price:549  },
  { cat:"tables",   type:"coffee",      icon:"☕", label:"Low Coffee Table",     desc:"Solid oak, shelf below",     price:849  },
  { cat:"tables",   type:"dining",      icon:"🍽️", label:"Dining Table 200cm",   desc:"Extendable, oak veneer",     price:1999 },
  { cat:"tables",   type:"side",        icon:"🔲", label:"Marble Side Table",    desc:"Brass base, marble top",     price:449  },
  { cat:"storage",  type:"bookshelf",   icon:"📚", label:"Open Bookcase",        desc:"5 shelves, white oak",       price:699  },
  { cat:"storage",  type:"cabinet",     icon:"🗄️", label:"Sideboard 160cm",      desc:"3 doors, matte lacquer",     price:1349 },
  { cat:"lighting", type:"floorlamp",   icon:"💡", label:"Arc Floor Lamp",       desc:"Brass arc, marble base",     price:599  },
  { cat:"lighting", type:"pendant",     icon:"🔦", label:"Pendant Cluster",      desc:"Smoked glass, E27",          price:389  },
  { cat:"decor",    type:"plant",       icon:"🌿", label:"Fiddle Leaf Fig",      desc:"Tall statement plant",       price:149  },
  { cat:"decor",    type:"rug_classic", icon:"🟫", label:"Jute Area Rug",        desc:"200×300cm, natural fibre",   price:599  },
  { cat:"decor",    type:"rug_round",   icon:"⭕", label:"Round Wool Rug Ø200",  desc:"Hand-tufted, navy",          price:849  },
  { cat:"decor",    type:"rug_runner",  icon:"▬",  label:"Hallway Runner",       desc:"80×240cm, geometric",        price:399  },
];
const FLOOR_OPTIONS = [
  { id:"oak",       label:"Light Oak Parquet",   sub:"Herringbone pattern"  },
  { id:"walnut",    label:"Dark Walnut Plank",   sub:"Wide board, matte oil"},
  { id:"marble",    label:"Calacatta Marble",    sub:"Polished, bookmatched"},
  { id:"concrete",  label:"Polished Concrete",   sub:"Micro-cement finish"  },
];
const WALL_COLORS = [
  { id:"white",  hex:"#F5F0EA", label:"Off White"    },
  { id:"sage",   hex:"#A8BAA0", label:"Sage Green"   },
  { id:"sand",   hex:"#C8B8A0", label:"Warm Sand"    },
  { id:"clay",   hex:"#B8957A", label:"Terracotta"   },
  { id:"navy",   hex:"#3A4A5C", label:"Midnight Blue"},
  { id:"char",   hex:"#2C2C2C", label:"Charcoal"     },
];

/* ══════════════════════════════════════════════════════════════
   TEXTURE HELPERS
══════════════════════════════════════════════════════════════ */
function makeTex(w:number,h:number,fn:(c:CanvasRenderingContext2D)=>void,rep=true):THREE.CanvasTexture {
  const el=document.createElement("canvas"); el.width=w; el.height=h;
  fn(el.getContext("2d")!);
  const t=new THREE.CanvasTexture(el);
  if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; }
  return t;
}
function makeFloorTex(k:string):THREE.CanvasTexture {
  return makeTex(1024,1024,ctx=>{
    if(k==="oak"){
      // Herringbone parquet
      ctx.fillStyle="#C8A06A"; ctx.fillRect(0,0,1024,1024);
      const cols=["#C8A06A","#B8904A","#D4B070","#BC943E"];
      const tw=64,th=28;
      for(let row=-10;row<20;row++) for(let col=-10;col<20;col++){
        ctx.save();
        ctx.translate(col*(tw+th)+row*(tw+th)*.5, row*(th+tw)*.5);
        // horizontal plank
        ctx.fillStyle=cols[(row+col)%4]; ctx.fillRect(0,0,tw,th);
        ctx.strokeStyle="rgba(0,0,0,.06)"; ctx.lineWidth=1; ctx.strokeRect(0,0,tw,th);
        // vertical plank offset
        ctx.fillStyle=cols[(row+col+1)%4]; ctx.fillRect(tw+2,th+2,th,tw);
        ctx.strokeRect(tw+2,th+2,th,tw);
        ctx.restore();
      }
    } else if(k==="walnut"){
      for(let i=0;i<24;i++){
        ctx.fillStyle=i%2===0?"#1E0E06":"#2A1408"; ctx.fillRect(0,i*43,1024,43);
        ctx.strokeStyle="rgba(0,0,0,.18)"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(0,(i+1)*43); ctx.lineTo(1024,(i+1)*43); ctx.stroke();
        // grain
        for(let g=0;g<3;g++){
          ctx.strokeStyle="rgba(255,255,255,.025)"; ctx.lineWidth=1;
          ctx.beginPath(); const gx=Math.random()*1024;
          ctx.moveTo(gx,i*43); ctx.bezierCurveTo(gx+40,i*43+14,gx-40,i*43+29,gx+20,(i+1)*43);
          ctx.stroke();
        }
      }
    } else if(k==="marble"){
      const g=ctx.createLinearGradient(0,0,1024,1024);
      g.addColorStop(0,"#F8F5F0"); g.addColorStop(.3,"#F0EBE4"); g.addColorStop(.6,"#ECDDD4"); g.addColorStop(1,"#F5F0EB");
      ctx.fillStyle=g; ctx.fillRect(0,0,1024,1024);
      // veins
      ctx.strokeStyle="rgba(180,160,140,.3)"; ctx.lineWidth=2;
      for(let v=0;v<12;v++){
        ctx.beginPath();
        const sx=Math.random()*1024, sy=Math.random()*1024;
        ctx.moveTo(sx,sy);
        for(let s=0;s<5;s++){
          ctx.quadraticCurveTo(sx+Math.random()*200-100,sy+s*100+Math.random()*80,sx+Math.random()*300-100,sy+(s+1)*100);
        }
        ctx.stroke();
      }
      ctx.strokeStyle="rgba(140,120,100,.15)"; ctx.lineWidth=.8;
      for(let v=0;v<20;v++){
        ctx.beginPath(); const sx=Math.random()*1024,sy=Math.random()*1024;
        ctx.moveTo(sx,sy);
        for(let s=0;s<4;s++) ctx.lineTo(sx+Math.random()*150-75,sy+s*80+Math.random()*60);
        ctx.stroke();
      }
    } else { // concrete
      ctx.fillStyle="#A0A09A"; ctx.fillRect(0,0,1024,1024);
      // micro-texture
      const id=ctx.getImageData(0,0,1024,1024);
      for(let i=0;i<id.data.length;i+=4){
        const n=(Math.random()-.5)*18;
        id.data[i]+=n; id.data[i+1]+=n; id.data[i+2]+=n;
      }
      ctx.putImageData(id,0,0);
      // panel lines
      ctx.strokeStyle="rgba(0,0,0,.07)"; ctx.lineWidth=1.5;
      for(let i=0;i<=4;i++){
        ctx.beginPath(); ctx.moveTo(0,i*256); ctx.lineTo(1024,i*256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i*256,0); ctx.lineTo(i*256,1024); ctx.stroke();
      }
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   PBR MESH HELPERS
══════════════════════════════════════════════════════════════ */
const MAT={
  fabric: (hex:number)=>new THREE.MeshStandardMaterial({color:hex,roughness:.92,metalness:0}),
  wood:   (hex:number)=>new THREE.MeshStandardMaterial({color:hex,roughness:.65,metalness:0}),
  metal:  (hex:number)=>new THREE.MeshStandardMaterial({color:hex,roughness:.25,metalness:.9}),
  glass:  ()=>new THREE.MeshStandardMaterial({color:0xadd8e6,roughness:.05,metalness:.1,transparent:true,opacity:.3}),
  marble: ()=>new THREE.MeshStandardMaterial({color:0xf0ebe5,roughness:.08,metalness:.05}),
};
function bx(w:number,h:number,d:number,mat:THREE.Material):THREE.Mesh {
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.castShadow=true; m.receiveShadow=true; return m;
}
function cy(rt:number,rb:number,h:number,seg:number,mat:THREE.Material):THREE.Mesh {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);
  m.castShadow=true; m.receiveShadow=true; return m;
}
function sp(r:number,mat:THREE.Material):THREE.Mesh {
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);
  m.castShadow=true; m.receiveShadow=true; return m;
}

/* ══════════════════════════════════════════════════════════════
   FURNITURE BUILDERS  (all .set() / .copy(), zero direct =)
══════════════════════════════════════════════════════════════ */
function buildSofa():THREE.Group {
  const g=new THREE.Group();
  const upholstery=MAT.fabric(0x8C7360);
  const cushionCol=MAT.fabric(0xA08470);
  const legMat=MAT.wood(0x4A3728);
  // base
  const base=bx(2.2,.38,1,upholstery); base.position.set(0,.19,0); g.add(base);
  // back
  const back=bx(2.2,.62,.2,upholstery); back.position.set(0,.61,-.4); g.add(back);
  // arms
  const a1=bx(.18,.42,1,upholstery); a1.position.set(-1.01,.36,0); g.add(a1);
  const a2=bx(.18,.42,1,upholstery); a2.position.set(1.01,.36,0); g.add(a2);
  // 3 seat cushions
  for(let i=0;i<3;i++){
    const c=bx(.65,.14,.82,cushionCol); c.position.set(-0.66+i*.66,.43,.04); g.add(c);
  }
  // 3 back cushions
  for(let i=0;i<3;i++){
    const c=bx(.65,.44,.14,MAT.fabric(0x9A7E6A)); c.position.set(-0.66+i*.66,.62,-.31); g.add(c);
  }
  // legs: tapered cylinder
  for(const[x,z] of [[-0.95,-.4],[.95,-.4],[-0.95,.4],[.95,.4]] as [number,number][]){
    const l=cy(.035,.025,.13,8,legMat); l.position.set(x,.065,z); g.add(l);
  }
  return g;
}

function buildArmchair():THREE.Group {
  const g=new THREE.Group();
  const fab=MAT.fabric(0xA08060);
  const leg=MAT.wood(0x3A2818);
  const base=bx(1.0,.36,.9,fab); base.position.set(0,.18,0); g.add(base);
  const back=bx(1.0,.56,.18,fab); back.position.set(0,.58,-.36); g.add(back);
  const a1=bx(.16,.34,.82,MAT.fabric(0x907050)); a1.position.set(-.42,.3,0); g.add(a1);
  const a2=bx(.16,.34,.82,MAT.fabric(0x907050)); a2.position.set(.42,.3,0); g.add(a2);
  const seat=bx(.74,.12,.68,MAT.fabric(0xB09070)); seat.position.set(0,.40,.04); g.add(seat);
  const backC=bx(.74,.48,.12,MAT.fabric(0xB09070)); backC.position.set(0,.58,-.28); g.add(backC);
  for(const[x,z] of [[-.36,-.36],[.36,-.36],[-.36,.36],[.36,.36]] as [number,number][]){
    const l=cy(.032,.022,.12,8,leg); l.position.set(x,.06,z); g.add(l);
  }
  return g;
}

function buildBench():THREE.Group {
  const g=new THREE.Group();
  const seat=bx(1.7,.12,.48,MAT.fabric(0x6A8A6A)); seat.position.set(0,.38,0); g.add(seat);
  const frame=bx(1.62,.06,.42,MAT.wood(0x5A3A18)); frame.position.set(0,.32,0); g.add(frame);
  for(const[x,z] of [[-.72,-.16],[.72,-.16],[-.72,.16],[.72,.16]] as [number,number][]){
    const l=cy(.03,.025,.3,8,MAT.metal(0x707070)); l.position.set(x,.15,z); g.add(l);
  }
  const cb=bx(1.36,.04,.04,MAT.metal(0x707070)); cb.position.set(0,.08,0); g.add(cb);
  return g;
}

function buildCoffeeTable():THREE.Group {
  const g=new THREE.Group();
  const topMat=MAT.wood(0xD8B888);
  const legMat=MAT.metal(0x505050);
  // top with lip
  const top=bx(1.35,.07,.75,topMat); top.position.set(0,.39,0); g.add(top);
  // lower shelf
  const shelf=bx(1.1,.05,.55,topMat); shelf.position.set(0,.14,0); g.add(shelf);
  // hairpin legs (3-rod)
  for(const[x,z] of [[-.55,-.3],[.55,-.3],[-.55,.3],[.55,.3]] as [number,number][]){
    const l=cy(.025,.025,.34,6,legMat); l.position.set(x,.17,z); g.add(l);
    const l2=cy(.012,.012,.36,4,legMat); l2.position.set(x+.04,.17,z); l2.rotation.set(0,0,.12); g.add(l2);
  }
  return g;
}

function buildDiningTable():THREE.Group {
  const g=new THREE.Group();
  const topMat=MAT.wood(0xDCBE8A);
  const legMat=MAT.wood(0x5A3A18);
  const top=bx(2.1,.06,1.05,topMat); top.position.set(0,.78,0); g.add(top);
  // apron
  const ap1=bx(1.9,.08,.04,legMat); ap1.position.set(0,.72,-.5); g.add(ap1);
  const ap2=bx(1.9,.08,.04,legMat); ap2.position.set(0,.72,.5); g.add(ap2);
  const ap3=bx(.04,.08,.9,legMat); ap3.position.set(-.95,.72,0); g.add(ap3);
  const ap4=bx(.04,.08,.9,legMat); ap4.position.set(.95,.72,0); g.add(ap4);
  for(const[x,z] of [[-.9,-.45],[.9,-.45],[-.9,.45],[.9,.45]] as [number,number][]){
    const l=cy(.045,.035,.72,8,legMat); l.position.set(x,.36,z); g.add(l);
    // foot
    const f=cy(.06,.06,.03,8,legMat); f.position.set(x,.015,z); g.add(f);
  }
  return g;
}

function buildSideTable():THREE.Group {
  const g=new THREE.Group();
  // marble top
  const top=bx(.58,.04,.58,MAT.marble()); top.position.set(0,.60,0); g.add(top);
  // brass pedestal
  const stem=cy(.04,.04,.54,12,MAT.metal(0xC8A840)); stem.position.set(0,.27,0); g.add(stem);
  const base=cy(.22,.22,.04,16,MAT.metal(0xC8A840)); base.position.set(0,.02,0); g.add(base);
  const collar=cy(.07,.07,.04,12,MAT.metal(0xC8A840)); collar.position.set(0,.56,0); g.add(collar);
  return g;
}

function buildBookshelf():THREE.Group {
  const g=new THREE.Group();
  const frame=MAT.wood(0xD8C0A0);
  const bookCols=[0xCC4444,0x4466CC,0x44AA44,0xCC8844,0x9944CC,0xCC4488,0x888844,0x44AACC];
  // sides
  const s1=bx(.04,2.0,.38,frame); s1.position.set(-.52,1.0,0); g.add(s1);
  const s2=bx(.04,2.0,.38,frame); s2.position.set(.52,1.0,0); g.add(s2);
  const topP=bx(1.08,.04,.38,frame); topP.position.set(0,1.98,0); g.add(topP);
  const bot=bx(1.08,.04,.38,frame); bot.position.set(0,.02,0); g.add(bot);
  const back=bx(1.08,1.98,.02,MAT.wood(0xC8B090)); back.position.set(0,1.0,-.18); g.add(back);
  // shelves
  for(let i=1;i<=4;i++){
    const sh=bx(1.0,.04,.36,MAT.wood(0xE0C8A8)); sh.position.set(0,i*.42,0); g.add(sh);
  }
  // books per shelf
  for(let s=0;s<5;s++){
    let xO=-0.42;
    const n=4+Math.floor(Math.random()*5);
    for(let b=0;b<n&&xO<.38;b++){
      const bw=.03+Math.random()*.04;
      const bh=.18+Math.random()*.16;
      const bk=bx(bw,bh,.28,new THREE.MeshStandardMaterial({color:bookCols[Math.floor(Math.random()*bookCols.length)],roughness:.8,metalness:0}));
      bk.position.set(xO+bw/2, s*.42+.03+bh/2, 0);
      g.add(bk); xO+=bw+.005;
    }
  }
  return g;
}

function buildCabinet():THREE.Group {
  const g=new THREE.Group();
  const body=MAT.wood(0xD8C8B0);
  const door=MAT.wood(0xCCC0A8);
  const hw=MAT.metal(0xB0A080);
  const bl=bx(1.65,1.0,.5,body); bl.position.set(0,.5,0); g.add(bl);
  // 3 doors
  for(let i=0;i<3;i++){
    const d=bx(.5,.88,.03,door); d.position.set(-0.55+i*.55,.5,.26); g.add(d);
    const h=cy(.015,.015,.07,8,hw); h.position.set(-0.55+i*.55,.5,.29); h.rotation.set(Math.PI/2,0,0); g.add(h);
  }
  // legs
  for(const[x,z] of [[-.72,-.18],[.72,-.18],[-.72,.18],[.72,.18]] as [number,number][]){
    const l=cy(.025,.025,.08,8,hw); l.position.set(x,.04,z); g.add(l);
  }
  return g;
}

function buildFloorLamp():THREE.Group {
  const g=new THREE.Group();
  const metal=MAT.metal(0xC8B860); // brass
  const base2=cy(.22,.22,.05,24,MAT.marble()); base2.position.set(0,.025,0); g.add(base2);
  const stem=cy(.02,.02,1.6,8,metal); stem.position.set(0,.82,0); g.add(stem);
  const joint=sp(.035,metal); joint.position.set(0,1.62,0); g.add(joint);
  // shade: linen
  const shade=cy(.28,.16,.26,20,MAT.fabric(0xFFF8E8)); shade.position.set(0,1.7,0); g.add(shade);
  const inner=cy(.26,.14,.22,20,new THREE.MeshStandardMaterial({color:0xFFF0D0,roughness:.9,side:THREE.BackSide}));
  inner.position.set(0,1.7,0); g.add(inner);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),new THREE.MeshStandardMaterial({color:0xFFFFCC,emissive:new THREE.Color(0xFFEEAA),emissiveIntensity:1.2}));
  bulb.position.set(0,1.68,0); g.add(bulb);
  return g;
}

function buildPendant():THREE.Group {
  const g=new THREE.Group();
  const cord=cy(.008,.008,.7,4,MAT.metal(0x303030)); cord.position.set(0,1.15,0); g.add(cord);
  const cap=cy(.06,.06,.04,12,MAT.metal(0xB0A080)); cap.position.set(0,.8,0); g.add(cap);
  // smoked glass shade
  const shade=cy(.28,.06,.22,20,new THREE.MeshStandardMaterial({color:0x202428,roughness:.1,metalness:.1,transparent:true,opacity:.7}));
  shade.position.set(0,.68,0); g.add(shade);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),new THREE.MeshStandardMaterial({color:0xFFFFCC,emissive:new THREE.Color(0xFFEEAA),emissiveIntensity:1.0}));
  bulb.position.set(0,.68,0); g.add(bulb);
  return g;
}

function buildPlant():THREE.Group {
  const g=new THREE.Group();
  // ceramic pot
  const pot=cy(.22,.28,.42,20,MAT.fabric(0xF0EAE0)); pot.position.set(0,.21,0); g.add(pot);
  const saucer=cy(.3,.3,.04,20,MAT.fabric(0xF0EAE0)); saucer.position.set(0,.025,0); g.add(saucer);
  const soil=cy(.20,.20,.03,16,new THREE.MeshStandardMaterial({color:0x2A1A0A,roughness:.98}));
  soil.position.set(0,.435,0); g.add(soil);
  // trunk
  const trunk=cy(.04,.05,.45,8,MAT.wood(0x4A3020)); trunk.position.set(0,.66,0); g.add(trunk);
  // fiddle leaf fig leaves
  const leafMat=new THREE.MeshStandardMaterial({color:0x2D6A2A,roughness:.85,side:THREE.DoubleSide});
  for(let i=0;i<9;i++){
    const a=i*(Math.PI*2/9);
    const r=.15+Math.random()*.2;
    const h=.6+Math.random()*.6;
    const leaf=bx(.22+Math.random()*.12,.28+Math.random()*.1,.02,leafMat);
    leaf.position.set(Math.cos(a)*r,h,Math.sin(a)*r);
    leaf.rotation.set(-Math.cos(a)*.4,a,Math.sin(a)*.3);
    g.add(leaf);
  }
  return g;
}

function buildRugClassic():THREE.Group {
  const g=new THREE.Group();
  const b=bx(2.5,.02,1.8,MAT.fabric(0xC87050)); b.position.set(0,.01,0); g.add(b);
  const i=bx(2.1,.021,1.4,MAT.fabric(0xD48868)); i.position.set(0,.011,0); g.add(i);
  const c=bx(1.7,.022,1.0,MAT.fabric(0xE09878)); c.position.set(0,.012,0); g.add(c);
  const bm=new THREE.MeshStandardMaterial({color:0x8A3818,roughness:.95});
  for(const[bw,bd,bx2,bz] of [[2.3,.04,0,-.7],[2.3,.04,0,.7],[.04,1.6,-1.1,0],[.04,1.6,1.1,0]] as [number,number,number,number][]){
    const bd2=bx(bw,.023,bd,bm); bd2.position.set(bx2,.013,bz); g.add(bd2);
  }
  return g;
}

function buildRugRound():THREE.Group {
  const g=new THREE.Group();
  const rings:([number,number]|[number,number,number])[]= [[1.2,0x1A3055],[1.0,0x2A4470],[.7,0x1A3055],[.4,0x2A4470],[.2,0xD4A840]];
  rings.forEach(([r,col],idx)=>{
    const c=cy(r as number,r as number,.02+idx*.001,32,MAT.fabric(col as number));
    c.position.set(0,.01+idx*.001,0); g.add(c);
  });
  return g;
}

function buildRugRunner():THREE.Group {
  const g=new THREE.Group();
  const b=bx(3,.02,.8,MAT.fabric(0x6A8860)); b.position.set(0,.01,0); g.add(b);
  const i=bx(2.6,.021,.6,MAT.fabric(0x7A9870)); i.position.set(0,.011,0); g.add(i);
  for(let s=0;s<3;s++){
    const st=bx(2.4,.022,.06,MAT.fabric(0x4A6840)); st.position.set(0,.012,-.18+s*.18); g.add(st);
  }
  return g;
}

export function buildFurniture(type:string):THREE.Group|null {
  const map:Record<string,()=>THREE.Group>={
    sofa:buildSofa, armchair:buildArmchair, bench:buildBench,
    coffee:buildCoffeeTable, dining:buildDiningTable, side:buildSideTable,
    bookshelf:buildBookshelf, cabinet:buildCabinet,
    floorlamp:buildFloorLamp, pendant:buildPendant,
    plant:buildPlant, rug_classic:buildRugClassic,
    rug_round:buildRugRound, rug_runner:buildRugRunner,
  };
  return map[type]?.()??null;
}

/* ══════════════════════════════════════════════════════════════
   3-D THUMBNAIL GENERATOR
══════════════════════════════════════════════════════════════ */
function generateThumbnail(type:string):string|null {
  let thumbRenderer:THREE.WebGLRenderer;
  try { thumbRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); }
  catch { return null; }
  if(!thumbRenderer.getContext()){ thumbRenderer.dispose(); return null; }
  thumbRenderer.setSize(160,120);
  thumbRenderer.setPixelRatio(2);
  thumbRenderer.shadowMap.enabled=true;
  thumbRenderer.toneMapping=THREE.ACESFilmicToneMapping;
  thumbRenderer.toneMappingExposure=1.2;

  const sc=new THREE.Scene();
  sc.background=new THREE.Color(0xF8F5F0);
  const cam=new THREE.PerspectiveCamera(35,160/120,.1,100);

  const sun=new THREE.DirectionalLight(0xFFF4E8,1.8);
  sun.position.set(3,5,4); sun.castShadow=true; sc.add(sun);
  sc.add(new THREE.AmbientLight(0xFFF8F0,.7));
  const fill=new THREE.DirectionalLight(0xD0E8FF,.5);
  fill.position.set(-4,2,-3); sc.add(fill);

  const mesh=buildFurniture(type);
  if(!mesh){ thumbRenderer.dispose(); return null; }

  // floor plane inside thumbnail
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshStandardMaterial({color:0xF0EBE4,roughness:.7}));
  floor.rotation.set(-Math.PI/2,0,0); floor.receiveShadow=true; sc.add(floor);

  mesh.traverse(c=>{ if(c instanceof THREE.Mesh){c.castShadow=true;c.receiveShadow=true;} });
  sc.add(mesh);

  // fit camera
  const box=new THREE.Box3().setFromObject(mesh);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  const maxDim=Math.max(size.x,size.y,size.z);
  cam.position.set(center.x+maxDim*1.4,center.y+maxDim*.9,center.z+maxDim*1.4);
  cam.lookAt(center.x,center.y+size.y*.1,center.z);
  cam.updateProjectionMatrix();

  thumbRenderer.render(sc,cam);
  const url=thumbRenderer.domElement.toDataURL("image/jpeg",.92);
  thumbRenderer.dispose();
  return url;
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function FormaHaus() {
  const vpRef=useRef<HTMLDivElement>(null);
  const sceneRef=useRef<SceneState|null>(null);

  const [tab,setTab]=useState<"furniture"|"materials">("furniture");
  const [openCats,setOpenCats]=useState<Set<string>>(new Set(["seating"]));
  const [floorKind,setFloorKind]=useState("oak");
  const [wallColor,setWallColor]=useState("#F5F0EA");
  const [total,setTotal]=useState(0);
  const [itemCount,setItemCount]=useState(0);
  const [selId,setSelId]=useState("");
  const [selLabel,setSelLabel]=useState("");
  const [selPrice,setSelPrice]=useState(0);
  const [thumbs,setThumbs]=useState<Record<string,string>>({});

  /* Generate thumbnails once on mount */
  useEffect(()=>{
    const map:Record<string,string>={};
    ITEMS.forEach(item=>{
      const url=generateThumbnail(item.type);
      if(url) map[item.type]=url;
    });
    setThumbs(map);
  },[]);

  /* ── Three.js scene ──────────────────────────────────────── */
  useEffect(()=>{
    const container=vpRef.current; if(!container) return;
    let renderer:THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true}); }
    catch { return; }
    if(!renderer.getContext()){ renderer.dispose(); return; }

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth,container.clientHeight);
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.15;
    container.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0xF0EBE4);
    scene.fog=new THREE.FogExp2(0xF2EDE6,.05);

    const camera=new THREE.PerspectiveCamera(48,container.clientWidth/container.clientHeight,.1,100);
    camera.position.set(0,4,7);
    camera.lookAt(0,0,0);

    const controls=new OrbitControls(camera,renderer.domElement);
    controls.target.set(0,0,0);
    controls.minPolarAngle=.2; controls.maxPolarAngle=Math.PI/2-.04;
    controls.minDistance=2; controls.maxDistance=14;
    controls.enableDamping=true; controls.dampingFactor=.07;

    /* Lighting */
    scene.add(new THREE.AmbientLight(0xFFF8F0,.55));
    const sun=new THREE.DirectionalLight(0xFFF0E0,1.6);
    sun.position.set(5,9,4); sun.castShadow=true;
    sun.shadow.mapSize.set(4096,4096);
    sun.shadow.camera.near=.5; sun.shadow.camera.far=30;
    sun.shadow.camera.left=-8; sun.shadow.camera.right=8;
    sun.shadow.camera.top=9; sun.shadow.camera.bottom=-8;
    sun.shadow.bias=-.0008; scene.add(sun);
    const fill=new THREE.DirectionalLight(0xD0E8FF,.4);
    fill.position.set(-5,3,-3); scene.add(fill);
    const bounce=new THREE.HemisphereLight(0xFFF4E0,0xC8A870,.35); scene.add(bounce);

    /* Floor */
    const R=4.5;
    const floorTex=makeFloorTex("oak"); floorTex.repeat.set(3,3);
    const floorMat=new THREE.MeshStandardMaterial({map:floorTex,roughness:.55,metalness:0});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(R*2,R*2),floorMat);
    floor.rotation.set(-Math.PI/2,0,0); floor.receiveShadow=true; scene.add(floor);

    /* Walls */
    const wallMatFn=()=>new THREE.MeshStandardMaterial({color:0xF5F0EA,roughness:.9,metalness:0});
    const wallDefs:[number,number,number,number][]=[
      [0,R/2,-R,0], [-R,R/2,0,Math.PI/2], [R,R/2,0,-Math.PI/2]
    ];
    const walls:THREE.Mesh[]=wallDefs.map(([wx,wy,wz,ry])=>{
      const w=new THREE.Mesh(new THREE.PlaneGeometry(R*2,R),wallMatFn());
      w.position.set(wx,wy,wz); w.rotation.set(0,ry,0); w.receiveShadow=true; scene.add(w); return w;
    });

    /* Ceiling */
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(R*2,R*2),new THREE.MeshStandardMaterial({color:0xF8F6F2,roughness:.95}));
    ceil.rotation.set(Math.PI/2,0,0); ceil.position.set(0,R,0); scene.add(ceil);

    /* Skirting boards */
    const skMat=new THREE.MeshStandardMaterial({color:0xF0ECE4,roughness:.7});
    [[0,.04,-R+.02,0,R*2],[- R+.02,.04,0,Math.PI/2,R*2],[R-.02,.04,0,-Math.PI/2,R*2]].forEach(([sx,sy,sz,sr,sl])=>{
      const sk=new THREE.Mesh(new THREE.BoxGeometry(sl,.08,.04),skMat);
      sk.position.set(sx,sy,sz); sk.rotation.set(0,sr,0); scene.add(sk);
    });

    /* Window (back wall) */
    const wfMat=new THREE.MeshStandardMaterial({color:0xFFFDF8,roughness:.2});
    const wf=new THREE.Mesh(new THREE.BoxGeometry(1.9,.06,1.6),wfMat); wf.position.set(-1.5,2.9,-R+.08); scene.add(wf);
    const wf2=new THREE.Mesh(new THREE.BoxGeometry(.06,1.5,1.6),wfMat); wf2.position.set(-1.5,2.9,-R+.08); scene.add(wf2);
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.4),MAT.glass()); glass.position.set(-1.5,2.9,-R+.06); scene.add(glass);
    // window light ray
    const lightRay=new THREE.SpotLight(0xFFF8E8,1.5,8,.5,.4);
    lightRay.position.set(-1.5,4.2,-R+1); lightRay.target.position.set(-1.5,0,-1); scene.add(lightRay); scene.add(lightRay.target);

    /* Rug base zone (visual) */
    const zone=new THREE.Mesh(new THREE.PlaneGeometry(4,3),new THREE.MeshStandardMaterial({color:0xE8E0D8,roughness:.9,opacity:.6,transparent:true}));
    zone.rotation.set(-Math.PI/2,0,0); zone.position.set(0,.001,0); scene.add(zone);

    const raycaster=new THREE.Raycaster();
    const mouse=new THREE.Vector2();
    const dragPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    const dragOffset=new THREE.Vector3();

    const state:SceneState={ renderer,scene,camera,controls,floor,walls,items:[],
      floorTex,wallTex:null,raycaster,mouse,dragPlane,dragOffset,selected:null,animId:0 };
    sceneRef.current=state;

    function animate(){
      state.animId=requestAnimationFrame(animate);
      controls.update();
      state.items.forEach(item=>{
        const t=(item.group as any)._st as number??1;
        const c=item.group.scale.x;
        if(Math.abs(c-t)>.001){
          const n=THREE.MathUtils.lerp(c,t,.14);
          item.group.scale.set(n,n,n);
        }
      });
      renderer.render(scene,camera);
    }
    animate();

    function onResize(){
      const w=container.clientWidth,h=container.clientHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
    }
    window.addEventListener("resize",onResize);
    return ()=>{
      window.removeEventListener("resize",onResize);
      cancelAnimationFrame(state.animId);
      renderer.dispose();
      if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      sceneRef.current=null;
    };
  },[]);

  /* ── Mouse ─────────────────────────────────────────────── */
  useEffect(()=>{
    const container=vpRef.current; if(!container) return;
    let dragging=false;
    function pct(e:MouseEvent){ const r=container.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*2-1,y:-((e.clientY-r.top)/r.height)*2+1}; }
    function onDown(e:MouseEvent){
      const s=sceneRef.current; if(!s) return;
      const p=pct(e); s.mouse.set(p.x,p.y);
      s.raycaster.setFromCamera(s.mouse,s.camera);
      const meshes:THREE.Object3D[]=[]; s.items.forEach(it=>it.group.traverse(c=>{if(c instanceof THREE.Mesh)meshes.push(c);}));
      const hits=s.raycaster.intersectObjects(meshes);
      if(hits.length>0){
        let obj:THREE.Object3D|null=hits[0].object;
        while(obj&&!(obj instanceof THREE.Group)) obj=obj.parent;
        if(obj instanceof THREE.Group){
          const item=s.items.find(it=>it.group===obj);
          if(item){ s.selected=item; setSelId(item.id); setSelLabel(item.label); setSelPrice(item.price); s.controls.enabled=false; dragging=true;
            const pt=new THREE.Vector3(); s.raycaster.ray.intersectPlane(s.dragPlane,pt); s.dragOffset.copy(pt).sub(item.group.position);
          }
        }
      } else { s.selected=null; setSelId(""); setSelLabel(""); setSelPrice(0); }
    }
    function onMove(e:MouseEvent){
      if(!dragging) return;
      const s=sceneRef.current; if(!s?.selected) return;
      const p=pct(e); s.mouse.set(p.x,p.y);
      s.raycaster.setFromCamera(s.mouse,s.camera);
      const tgt=new THREE.Vector3(); s.raycaster.ray.intersectPlane(s.dragPlane,tgt);
      tgt.sub(s.dragOffset);
      tgt.x=THREE.MathUtils.clamp(tgt.x,-4,4); tgt.z=THREE.MathUtils.clamp(tgt.z,-4,4);
      s.selected.group.position.set(tgt.x,s.selected.group.position.y,tgt.z);
    }
    function onUp(){ dragging=false; const s=sceneRef.current; if(s) s.controls.enabled=true; }
    container.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    return ()=>{ container.removeEventListener("mousedown",onDown); window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  },[]);

  /* ── Delete key ─────────────────────────────────────────── */
  const deleteSelected=useCallback(()=>{
    const s=sceneRef.current; if(!s?.selected) return;
    s.scene.remove(s.selected.group);
    const idx=s.items.findIndex(i=>i.id===s.selected!.id);
    if(idx>=0){ setTotal(t=>t-s.selected!.price); setItemCount(c=>c-1); s.items.splice(idx,1); }
    s.selected=null; setSelId(""); setSelLabel(""); setSelPrice(0);
  },[]);
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.key==="Delete"||e.key==="Backspace") deleteSelected(); };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  },[deleteSelected]);

  /* ── Actions ─────────────────────────────────────────────── */
  const addFurniture=useCallback((type:string,label:string,price:number)=>{
    const s=sceneRef.current; if(!s) return;
    const group=buildFurniture(type); if(!group) return;
    const isPendant=type==="pendant";
    group.position.set((Math.random()-.5)*5,isPendant?2.5:0,(Math.random()-.5)*5);
    (group as any)._st=1;
    group.scale.set(.01,.01,.01);
    group.traverse(c=>{if(c instanceof THREE.Mesh){c.castShadow=true;c.receiveShadow=true;}});
    s.scene.add(group);
    const id=`${Date.now()}-${Math.random()}`;
    s.items.push({id,type,label,price,group});
    setTotal(t=>t+price); setItemCount(c=>c+1);
  },[]);

  const changeFloor=useCallback((kind:string)=>{
    const s=sceneRef.current; if(!s) return;
    if(s.floorTex) s.floorTex.dispose();
    const t=makeFloorTex(kind); t.repeat.set(3,3); s.floorTex=t;
    (s.floor.material as THREE.MeshStandardMaterial).map=t;
    (s.floor.material as THREE.MeshStandardMaterial).roughness=kind==="marble"?.08:.55;
    (s.floor.material as THREE.MeshStandardMaterial).needsUpdate=true;
  },[]);

  const changeWallColor=useCallback((hex:string)=>{
    const s=sceneRef.current; if(!s) return;
    const col=new THREE.Color(hex);
    s.walls.forEach(w=>{ const m=w.material as THREE.MeshStandardMaterial; m.map=null; m.color.copy(col); m.needsUpdate=true; });
  },[]);

  const clearRoom=useCallback(()=>{
    const s=sceneRef.current; if(!s) return;
    s.items.forEach(i=>s.scene.remove(i.group)); s.items.length=0; s.selected=null;
    setSelId(""); setSelLabel(""); setSelPrice(0); setTotal(0); setItemCount(0);
  },[]);
  const rotate=useCallback((dir:number)=>{
    const s=sceneRef.current; if(!s?.selected) return; s.selected.group.rotation.y+=dir*Math.PI/8;
  },[]);
  const toggleCat=useCallback((id:string)=>{
    setOpenCats(p=>{ const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  },[]);

  const fmt=(p:number)=>p.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0});

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"'Inter',system-ui,sans-serif",background:"#F0EBE4",color:"#1A1A1A"}}>

      {/* ── TOP HEADER ── */}
      <header style={{height:56,background:"#1A1A1A",display:"flex",alignItems:"center",padding:"0 24px",gap:16,flexShrink:0,zIndex:200}}>
        <div style={{display:"flex",alignItems:"baseline",gap:4}}>
          <span style={{fontSize:"1.15rem",fontWeight:800,letterSpacing:4,color:"#fff"}}>FORMA</span>
          <span style={{fontSize:"1.15rem",fontWeight:300,letterSpacing:4,color:"#C8A870"}}>HAUS</span>
        </div>
        <div style={{flex:1,fontSize:".7rem",color:"rgba(255,255,255,.4)",textAlign:"center",letterSpacing:.5}}>3D INTERIOR DESIGNER</div>
        {/* Sticky pricing card */}
        <div style={{display:"flex",alignItems:"center",gap:14,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"8px 18px"}}>
          <div>
            <div style={{fontSize:".58rem",fontWeight:700,letterSpacing:1.5,color:"rgba(255,255,255,.45)",textTransform:"uppercase",marginBottom:1}}>Project Total</div>
            <div style={{fontSize:"1.3rem",fontWeight:800,color:"#C8A870",lineHeight:1}}>{fmt(total)}</div>
          </div>
          <div style={{width:1,height:32,background:"rgba(255,255,255,.12)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"1.4rem",fontWeight:800,color:"#fff",lineHeight:1}}>{itemCount}</div>
            <div style={{fontSize:".6rem",color:"rgba(255,255,255,.4)",letterSpacing:.8,textTransform:"uppercase"}}>Items</div>
          </div>
          <button onClick={clearRoom} style={{marginLeft:4,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.7)",fontSize:".72rem",fontWeight:600,cursor:"pointer",letterSpacing:.3}}>Clear</button>
        </div>
      </header>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* ── SIDEBAR ── */}
        <aside style={{width:300,background:"#fff",borderRight:"1px solid #EAE4DC",display:"flex",flexDirection:"column",flexShrink:0,zIndex:100}}>
          {/* Tabs */}
          <div style={{display:"flex",background:"#F8F5F0",borderBottom:"1px solid #EAE4DC",flexShrink:0}}>
            {(["furniture","materials"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,height:46,border:"none",background:"none",cursor:"pointer",fontSize:".78rem",fontWeight:700,letterSpacing:.5,textTransform:"uppercase",color:tab===t?"#1A1A1A":"#999",borderBottom:tab===t?"2px solid #1A1A1A":"2px solid transparent",transition:"all .18s"}}>
                {t==="furniture"?"Furniture":"Materials"}
              </button>
            ))}
          </div>

          {/* ── Furniture tab ── */}
          {tab==="furniture"&&(
            <div style={{flex:1,overflowY:"auto"}}>
              {CATS.map(cat=>{
                const isOpen=openCats.has(cat.id);
                const items=ITEMS.filter(i=>i.cat===cat.id);
                return (
                  <div key={cat.id} style={{borderBottom:"1px solid #F0ECE6"}}>
                    <button onClick={()=>toggleCat(cat.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 18px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                      <span style={{fontSize:"1rem"}}>{cat.icon}</span>
                      <span style={{flex:1,fontSize:".82rem",fontWeight:700,letterSpacing:.3,color:"#1A1A1A"}}>{cat.label}</span>
                      <span style={{fontSize:".75rem",color:"#999",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s",fontWeight:400}}>›</span>
                    </button>
                    {isOpen&&(
                      <div style={{padding:"0 12px 12px"}}>
                        {items.map(item=>(
                          <CatalogCard key={item.type} item={item} thumb={thumbs[item.type]} onAdd={()=>addFurniture(item.type,item.label,item.price)} fmt={fmt}/>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Materials tab ── */}
          {tab==="materials"&&(
            <div style={{flex:1,overflowY:"auto",padding:"18px 16px"}}>
              {/* Floor */}
              <div style={{marginBottom:24}}>
                <div style={{fontSize:".65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:12}}>Floor Material</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {FLOOR_OPTIONS.map(fo=>{
                    const sel=floorKind===fo.id;
                    return (
                      <button key={fo.id} onClick={()=>{setFloorKind(fo.id);changeFloor(fo.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${sel?"#1A1A1A":"#EAE4DC"}`,background:sel?"#1A1A1A":"transparent",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                        <FloorSwatch kind={fo.id}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:".8rem",fontWeight:600,color:sel?"#fff":"#1A1A1A"}}>{fo.label}</div>
                          <div style={{fontSize:".68rem",color:sel?"rgba(255,255,255,.55)":"#999",marginTop:1}}>{fo.sub}</div>
                        </div>
                        {sel&&<span style={{color:"#C8A870",fontSize:".9rem"}}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wall */}
              <div>
                <div style={{fontSize:".65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:12}}>Wall Colour</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {WALL_COLORS.map(wc=>{
                    const sel=wallColor===wc.hex;
                    return (
                      <button key={wc.id} onClick={()=>{setWallColor(wc.hex);changeWallColor(wc.hex);}} style={{padding:"10px 6px",borderRadius:10,border:`1.5px solid ${sel?"#1A1A1A":"#EAE4DC"}`,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all .15s"}}>
                        <div style={{width:36,height:36,borderRadius:8,background:wc.hex,border:"1px solid rgba(0,0,0,.08)",boxShadow:sel?"0 0 0 2px #1A1A1A":"none"}}/>
                        <span style={{fontSize:".62rem",fontWeight:600,color:"#555",lineHeight:1.2,textAlign:"center"}}>{wc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── 3D VIEWPORT ── */}
        <div style={{flex:1,position:"relative"}}>
          <div ref={vpRef} style={{position:"absolute",inset:0}}/>
          {/* orbit hint */}
          <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",background:"rgba(26,26,26,.72)",backdropFilter:"blur(12px)",borderRadius:20,padding:"5px 16px",fontSize:".68rem",color:"rgba(255,255,255,.7)",pointerEvents:"none",letterSpacing:.3}}>
            Orbit · Scroll to zoom · Click + drag to move items
          </div>
          {/* selection panel */}
          {selId&&(
            <div style={{position:"absolute",bottom:16,right:16,background:"rgba(255,255,255,.96)",backdropFilter:"blur(16px)",border:"1px solid #EAE4DC",borderRadius:14,padding:"16px 18px",minWidth:190,boxShadow:"0 8px 32px rgba(0,0,0,.12)"}}>
              <div style={{fontSize:".65rem",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:"#999",marginBottom:4}}>Selected</div>
              <div style={{fontSize:".9rem",fontWeight:700,color:"#1A1A1A",marginBottom:2}}>{selLabel}</div>
              <div style={{fontSize:"1.1rem",fontWeight:800,color:"#C8A870",marginBottom:12}}>{fmt(selPrice)}</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <button onClick={()=>rotate(-1)} style={rotBtnSt}>↺ Rotate</button>
                <button onClick={()=>rotate(1)}  style={rotBtnSt}>↻ Rotate</button>
              </div>
              <button onClick={deleteSelected} style={{width:"100%",padding:"7px 0",background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",borderRadius:8,fontSize:".73rem",fontWeight:700,cursor:"pointer"}}>Remove Item</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */
const rotBtnSt:React.CSSProperties={flex:1,padding:"6px 0",borderRadius:8,border:"1px solid #EAE4DC",background:"#F8F5F0",fontSize:".72rem",fontWeight:600,cursor:"pointer",color:"#1A1A1A"};

function CatalogCard({item,thumb,onAdd,fmt}:{item:typeof ITEMS[number];thumb:string|undefined;onAdd:()=>void;fmt:(p:number)=>string}) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",gap:10,padding:"10px",borderRadius:10,border:`1px solid ${hov?"#D4C4AC":"#F0ECE6"}`,background:hov?"#FAFAF8":"#fff",marginBottom:6,transition:"all .15s",cursor:"pointer"}}
      onClick={onAdd}>
      {/* 3D thumbnail */}
      <div style={{width:72,height:54,borderRadius:8,overflow:"hidden",background:"#F8F5F0",flexShrink:0,border:"1px solid #EAE4DC",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {thumb
          ? <img src={thumb} alt={item.label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:"1.4rem"}}>{item.icon}</span>
        }
      </div>
      {/* info */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:".78rem",fontWeight:700,color:"#1A1A1A",marginBottom:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
        <div style={{fontSize:".65rem",color:"#888",marginBottom:4,lineHeight:1.3}}>{item.desc}</div>
        <div style={{fontSize:".82rem",fontWeight:800,color:"#1A1A1A"}}>{fmt(item.price)}</div>
      </div>
      {/* add button */}
      <div style={{alignSelf:"center",flexShrink:0,width:26,height:26,borderRadius:"50%",background:hov?"#1A1A1A":"#F0ECE6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:hov?"#C8A870":"#888",transition:"all .15s",fontWeight:300}}>+</div>
    </div>
  );
}

function FloorSwatch({kind}:{kind:string}) {
  return (
    <canvas width={48} height={34} ref={el=>{
      if(!el) return;
      const ctx=el.getContext("2d")!;
      if(kind==="oak"){
        ctx.fillStyle="#C8A060"; ctx.fillRect(0,0,48,34);
        ctx.fillStyle="#B89048"; ctx.fillRect(0,0,24,17); ctx.fillRect(24,17,24,17);
        ctx.strokeStyle="rgba(0,0,0,.1)"; ctx.lineWidth=.6;
        ctx.beginPath(); ctx.moveTo(0,17); ctx.lineTo(48,17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(24,0); ctx.lineTo(24,34); ctx.stroke();
      } else if(kind==="walnut"){
        for(let i=0;i<6;i++){ ctx.fillStyle=i%2===0?"#1E0E06":"#2A1408"; ctx.fillRect(0,i*6,48,6); }
        ctx.strokeStyle="rgba(0,0,0,.2)"; ctx.lineWidth=.6;
        for(let i=0;i<=6;i++){ctx.beginPath();ctx.moveTo(0,i*6);ctx.lineTo(48,i*6);ctx.stroke();}
      } else if(kind==="marble"){
        const g=ctx.createLinearGradient(0,0,48,34);
        g.addColorStop(0,"#F8F5F0"); g.addColorStop(1,"#ECE8E2");
        ctx.fillStyle=g; ctx.fillRect(0,0,48,34);
        ctx.strokeStyle="rgba(160,140,120,.3)"; ctx.lineWidth=.8;
        ctx.beginPath(); ctx.moveTo(0,8); ctx.quadraticCurveTo(20,18,48,12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,22); ctx.quadraticCurveTo(30,28,48,20); ctx.stroke();
      } else {
        ctx.fillStyle="#A0A09A"; ctx.fillRect(0,0,48,34);
        ctx.fillStyle="#A8A8A2"; ctx.fillRect(0,0,24,17); ctx.fillRect(24,17,24,17);
        ctx.strokeStyle="rgba(0,0,0,.06)"; ctx.lineWidth=.5;
        ctx.beginPath(); ctx.moveTo(0,17); ctx.lineTo(48,17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(24,0); ctx.lineTo(24,34); ctx.stroke();
      }
    }} style={{borderRadius:6,border:"1px solid rgba(0,0,0,.08)",flexShrink:0}}/>
  );
}
