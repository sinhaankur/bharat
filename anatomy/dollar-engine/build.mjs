// The Dollar Engine — an isometric figure for the Bharat markets page.
// The machine IS the explanation: a reserve-currency plant. Surplus flows in from
// exporters, a recycling pump sends dollars back into the Treasury core, an oversized
// offshore Eurodollar tank looms behind, a Triffin pressure gauge shows the trap, and
// a transmission shaft drives three output dials (Canada · India · China) — China's
// valve bleeds flow off the recycling loop (petroyuan / de-dollarisation).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import * as k from "/Users/sinhaankur/.claude/skills/anatomy/kit/iso-kit.mjs";
import { tubePieces, tubeSvg } from "/Users/sinhaankur/.claude/skills/anatomy/kit/tube.mjs";
import { kitScript } from "/Users/sinhaankur/.claude/skills/anatomy/scripts/inline-kit.mjs";

// Inline model.mjs (the math API every moving part depends on) into the page, minus
// its `export` keywords so it runs as a plain script block. Keeps one source of truth.
const MODEL_SRC = readFileSync(new URL("./model.mjs", import.meta.url), "utf8")
  .replace(/^export\s+/gm, "");

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 660;
const HEIGHT = 460;

const PLATE = { x: -150, y: -96, w: 300, d: 196, r: 10 };
const PLATE_H = 12;
const FOOT_H = 6;

// --- key stations on the floor (x,y) ---
const INTAKE = [-120, 40];      // surplus intake manifold (front-left)
const CORE = [-40, 6];          // the Treasury / dollar core (lit)
const CORE_R = 26;
const CORE_H = 58;
const EURO = [56, -46];         // offshore Eurodollar tank (back, oversized)
const EURO_R = 36;
const EURO_H = 70;
const PUMP = [8, 44];           // recycling pump (front-centre)
const GAUGE = [-96, -44];       // Triffin pressure gauge (back-left)
const GAUGE_R = 20;
const GAUGE_Z = 46;
// three output dials along the front-right transmission shaft
const OUT = [[64, 58], [100, 44], [130, 26]];   // Canada, India, China
const OUT_R = 11;
const OUT_Z = 20;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [EURO[0], EURO[1], EURO_H + 24],
    [CORE[0], CORE[1], CORE_H + 20],
    [GAUGE[0], GAUGE[1], GAUGE_Z + GAUGE_R + 6],
    [OUT[2][0] + OUT_R, OUT[2][1], OUT_Z + 8],
  ],
  WIDTH, HEIGHT, { pad: 26, azimuth: 46 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// ---- base plate: feet, bevel, inset groove, corner screws, ruler strip, engraved name
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.8, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 10, 1.8), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge
  const strip = { x: PLATE.x + 14, y: PLATE.y + PLATE.d - 16, w: PLATE.w - 28, d: 8, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 5, strip.x + strip.w - 5, 5, 5, strip.y + 1, 0.7, [2.2, 4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 3, strip.y + 4, 0.7]), at([strip.x + strip.w - 3, strip.y + 4, 0.7])], { size: 0.45 }));
  // engraved name plate (three rule lines, one tiny label)
  const np = { x: PLATE.x + 12, y: PLATE.y + 8, w: 70, d: 18, r: 2 };
  out.push(S(k.slabOf(np, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(np, 2.5), 0.6, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([np.x + np.w / 2, np.y + 7], 0.7, P, "x"), "RESERVE CURRENCY SYS.", { size: 2.3, tone: "mid", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([np.x + np.w / 2, np.y + 13], 0.7, P, "x"), "fig · the dollar engine", { size: 1.9, tone: "lo", anchor: "middle" }));
  return out.join("");
}

// ---- a labelled cylindrical vessel with bands, a rim and a top cap
function vessel(cx, cy, r, h, z0, tone, { bands = 3, lit = false, cap = "hi" } = {}) {
  const out = [];
  out.push(S(k.cylinder(cx, cy, r, z0, h, P, 64, 1.0), { tone, crease: "lo", lit }));
  // horizontal bands
  for (let i = 1; i <= bands; i++) {
    const z = z0 + (h * i) / (bands + 1);
    out.push(L(k.sideArc(cx, cy, r, z, P, 48), { tone: "faint" }));
  }
  // top rim + recessed cap
  out.push(L(k.ring(cx, cy, r, z0 + h, P, 64), { tone: "lo" }));
  out.push(S(k.cylinder(cx, cy, r - 2.4, z0 + h, 2.2, P, 64), { tone: cap, crease: "lo", lit }));
  out.push(L(k.ring(cx, cy, r - 5, z0 + h + 2.2, P, 64), { tone: "faint" }));
  return out.join("");
}

// ---- the Treasury / dollar CORE: lit vessel + a fill-level mark + bolt circle
function core() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: CORE[0] - CORE_R, y: CORE[1] - CORE_R, w: CORE_R * 2, d: CORE_R * 2, r: CORE_R }, 0, 2, P)}" style="filter:blur(5px)"/>`];
  // base flange
  out.push(S(k.cylinder(CORE[0], CORE[1], CORE_R + 4, 0, 4, P, 64), { tone: "mid" }));
  out.push(L(k.ring(CORE[0], CORE[1], CORE_R + 4, 4, P, 64), { tone: "lo" }));
  const bolts = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; bolts.push(at([CORE[0] + Math.cos(a) * (CORE_R + 1.8), CORE[1] + Math.sin(a) * (CORE_R + 1.8), 4])); }
  out.push(D(bolts, { size: 0.5, tone: "lo" }));
  out.push(vessel(CORE[0], CORE[1], CORE_R, CORE_H, 4, "hi", { bands: 3, lit: true, cap: "lit" }));
  // nameplate engraved on the flat top cap — faces up, never clips the curved body
  out.push(k.faceTextSvg(k.topMatrix([CORE[0], CORE[1] + 1], 4 + CORE_H + 2.2, P, "x"), "US$", { size: 6, tone: "lit", anchor: "middle" }));
  return out.join("");
}

// ---- offshore EURODOLLAR tank: oversized, set back, "created outside the US"
function euro() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: EURO[0] - EURO_R, y: EURO[1] - EURO_R, w: EURO_R * 2, d: EURO_R * 2, r: EURO_R }, 0, 2, P)}" style="filter:blur(6px)"/>`];
  out.push(S(k.cylinder(EURO[0], EURO[1], EURO_R + 5, 0, 5, P, 64), { tone: "lo" }));
  out.push(vessel(EURO[0], EURO[1], EURO_R, EURO_H, 5, "mid", { bands: 4 }));
  // labels engraved on the flat top cap, two lines, centred — no clipping
  out.push(k.faceTextSvg(k.topMatrix([EURO[0], EURO[1] - 4], 5 + EURO_H + 2.2, P, "x"), "EURODOLLAR", { size: 4.4, tone: "mid", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([EURO[0], EURO[1] + 5], 5 + EURO_H + 2.2, P, "x"), "offshore · ~$14T", { size: 2.8, tone: "lo", anchor: "middle" }));
  return out.join("");
}

// ---- Triffin pressure GAUGE on a post: a dial whose needle swings between
// "deficits required" (left) and "confidence erodes" (right) — the trap.
function gaugeStatic() {
  const out = [];
  const [x, y] = GAUGE;
  out.push(S(k.cylinder(x, y, 3.4, 0, GAUGE_Z, P, 28), { tone: "mid", crease: "none" }));
  out.push(L([16, 32].map((z) => k.sideArc(x, y, 3.4, z, P, 16)).join(""), { tone: "faint" }));
  // gauge body (a short upright drum facing the viewer)
  out.push(S(k.cylinder(x, y, GAUGE_R, GAUGE_Z, 6, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, GAUGE_R, GAUGE_Z + 6 - 2.4, GAUGE_Z + 6, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, GAUGE_R - 2.4, GAUGE_Z + 6, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, GAUGE_R - 3.4, 40, 5, GAUGE_Z + 6, [1.4, 3], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.6, GAUGE_Z + 6, P, 16), { tone: "mid" }));
  // zone labels on the face
  out.push(k.faceTextSvg(k.topMatrix([x - 9, y + 9], GAUGE_Z + 6, P, "x"), "SUPPLY", { size: 2.0, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x + 9, y + 9], GAUGE_Z + 6, P, "x"), "TRUST", { size: 2.0, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y - GAUGE_R + 4], GAUGE_Z + 6, P, "x"), "TRIFFIN", { size: 2.2, tone: "mid", anchor: "middle" }));
  return out.join("");
}
const gaugeNeedle = (t) => {       // t: -1 (supply) .. +1 (trust)
  const [x, y] = GAUGE;
  const a = (-Math.PI * 0.62) + ((t + 1) / 2) * (Math.PI * 1.24);  // sweep
  return k.lineOnTop([x - Math.cos(a) * 3, y + 0 - Math.sin(a) * 3], [x + Math.cos(a) * (GAUGE_R - 4), y + Math.sin(a) * (GAUGE_R - 4) * 0 + Math.sin(a) * (GAUGE_R - 4)], GAUGE_Z + 6.4, P);
};

// ---- recycling PUMP: a short cylinder with a drive cap; the loop pipe returns
function pump() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: PUMP[0] - 12, y: PUMP[1] - 12, w: 24, d: 24, r: 12 }, 0, 1, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.cylinder(PUMP[0], PUMP[1], 13, 0, 16, P, 48, 0.8), { tone: "mid", crease: "lo" }));
  out.push(L(k.ring(PUMP[0], PUMP[1], 13, 16, P, 48), { tone: "lo" }));
  out.push(S(k.cylinder(PUMP[0], PUMP[1], 9, 16, 4, P, 48), { tone: "hi", crease: "lo" }));
  out.push(k.faceTextSvg(k.sideMatrix([PUMP[0], PUMP[1] - 13], 7, P, "y"), "RECYCLE", { size: 2.8, tone: "lo", anchor: "middle" }));
  return out.join("");
}
// the rotating drive star on the pump cap (what spins)
const pumpStar = (ang) => {
  const [x, y] = PUMP, z = 20.2, out = [];
  for (let i = 0; i < 6; i++) {
    const a = ang + (i / 6) * Math.PI * 2;
    out.push(k.lineOnTop([x, y], [x + Math.cos(a) * 7.5, y + Math.sin(a) * 7.5], z, P));
  }
  return out.join("");
};

// ---- three OUTPUT dials: Canada · India · China, on a shaft, each with a needle
const OUT_LABELS = ["CA", "IN", "CN"];
function outputs() {
  const out = [];
  // transmission shaft beam under the dials
  const beam = { x: OUT[0][0] - 10, y: OUT[0][1] - 4, w: OUT[2][0] - OUT[0][0] + 20, d: 8, r: 2 };
  out.push(S(k.slabOf(beam, 0, 8, P, 3, 0.5), { tone: "lo" }));
  OUT.forEach(([x, y], i) => {
    out.push(S(k.cylinder(x, y, 3, 8, OUT_Z - 8, P, 24), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x, y, OUT_R, OUT_Z, 4, P, 48, 0.6), { tone: i === 2 ? "hi" : "mid", crease: "lo" }));
    out.push(L(k.ring(x, y, OUT_R - 1.6, OUT_Z + 4, P, 48), { tone: "lo" }));
    const ticks = k.radialTicks(x, y, OUT_R - 2.4, 24, 6, OUT_Z + 4, [1, 2], P);
    out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
    out.push(k.faceTextSvg(k.topMatrix([x, y + OUT_R - 3], OUT_Z + 4, P, "x"), OUT_LABELS[i], { size: 2.4, tone: i === 2 ? "hi" : "lo", anchor: "middle" }));
  });
  return out.join("");
}
const outNeedle = (i, t) => {   // t: 0..1 load on that economy
  const [x, y] = OUT[i];
  const a = (-Math.PI * 0.6) + t * (Math.PI * 1.2);
  return k.lineOnTop([x, y], [x + Math.cos(a) * (OUT_R - 3), y + Math.sin(a) * (OUT_R - 3)], OUT_Z + 4.3, P);
};

// ---- plumbing: the pipes that make it an ENGINE, routed low on the plate.
// intake (surplus in) → core · recycling loop core → pump → core · China bleed off loop
function pipes() {
  const zr = 5;            // pipe centre-line height above plate
  const r = 2.6;           // pipe radius
  const routes = [
    // surplus intake: front-left manifold into the core base
    { pts: [[INTAKE[0], INTAKE[1], zr], [INTAKE[0] + 30, INTAKE[1], zr], [CORE[0] - CORE_R - 2, CORE[1] + 10, zr]], tone: "mid" },
    // recycling loop: core → down to pump → back up into core (the privilege loop)
    { pts: [[CORE[0] + 6, CORE[1] + CORE_R + 2, zr], [CORE[0] + 6, PUMP[1] - 2, zr], [PUMP[0] - 11, PUMP[1], zr]], tone: "hi" },
    { pts: [[PUMP[0] + 11, PUMP[1], zr], [CORE[0] + CORE_R - 4, PUMP[1] - 6, zr], [CORE[0] + CORE_R - 2, CORE[1] + 14, zr]], tone: "hi" },
    // China bleed: off the loop toward the CN dial (petroyuan diversion)
    { pts: [[PUMP[0] + 11, PUMP[1] + 2, zr], [OUT[2][0], PUMP[1] + 2, zr], [OUT[2][0], OUT[2][1] + 4, zr]], tone: "mid" },
    // Eurodollar feed: core → offshore tank (dollars created outside the US)
    { pts: [[CORE[0] + CORE_R - 2, CORE[1] - 8, zr], [EURO[0] - EURO_R - 10, EURO[1] + 20, zr], [EURO[0] - EURO_R - 2, EURO[1] + 6, zr]], tone: "mid" },
  ];
  const pieces = [];
  for (const route of routes) for (const pc of tubePieces(route.pts, r, P, { spacing: 2.4 })) pieces.push({ pc, tone: route.tone });
  pieces.sort((a, b) => a.pc.depth - b.pc.depth);
  // port collars where a pipe meets a vessel/pump
  const ports = [INTAKE, [PUMP[0] - 11, PUMP[1]], [PUMP[0] + 11, PUMP[1]]];
  const out = ports.map(([x, y]) => S(k.cylinder(x, y, r + 1.4, zr - r - 1, r + 2, P, 20), { tone: "lo" })).join("");
  return out + pieces.map(({ pc, tone }) => tubeSvg(pc, { tone })).join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label:
    "The Dollar Engine: a reserve-currency plant. Trade and oil surplus flows into a central US-dollar core (lit); a recycling pump returns those dollars into the core (recycling into US Treasuries). An oversized offshore Eurodollar tank looms behind — dollars created outside the US. A Triffin pressure gauge reads the trap between supplying dollars (SUPPLY) and keeping confidence (TRUST). A transmission shaft drives three output dials — Canada, India and China — showing how the system's pressure reaches each economy; China's output also bleeds flow off the loop (petroyuan / de-dollarisation).",
  body: [
    plate(),
    pipes(),                // low plumbing first — vessels draw over where they overlap
    euro(),                 // back
    gaugeStatic(),
    `<path data-part="gneedle" class="iso-line" data-tone="lit" data-free="start" d="${gaugeNeedle(0)}" style="stroke-width:1.2"/>`,
    core(),                 // centre, lit
    outputs(),              // front-right dials
    OUT.map((_, i) => `<path data-part="oneedle${i}" class="iso-line" data-tone="lit" data-free="start" d="${outNeedle(i, 0.5)}" style="stroke-width:1"/>`).join(""),
    pump(),                 // front-centre
    D([at([PUMP[0], PUMP[1], 20.2])], { size: 0.9, tone: "hi" }),  // star hub dot (arms radiate from here)
    `<g data-part="star"><path class="iso-line" data-tone="hi" data-free="both" d="${pumpStar(0)}" style="stroke-width:0.9"/></g>`,
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const GAUGE = ${JSON.stringify(GAUGE)}, GAUGE_R = ${GAUGE_R}, GAUGE_Z = ${GAUGE_Z};
const PUMP = ${JSON.stringify(PUMP)};
const OUT = ${JSON.stringify(OUT)}, OUT_R = ${OUT_R}, OUT_Z = ${OUT_Z};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const gneedle = svg.querySelector('[data-part="gneedle"]');
const star = svg.querySelector('[data-part="star"] path');
const oneedles = [0,1,2].map(i => svg.querySelector('[data-part="oneedle'+i+'"]'));
const gaugeNeedle = ${gaugeNeedle.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const pumpStar = ${pumpStar.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const outNeedle = ${outNeedle.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
${MODEL_SRC}
// stress: 0 = system calm (confidence high), 1 = stress high (de-dollarisation pressure)
let stress = 0.35, target = stress, angle = 0;
let frame = 0, last = 0, clock = 0, touring = true, visible = false, idle = 0;
let provenance = "model (static baseline) · hover to drive";   // becomes live source once fetched
function draw(){
  gneedle.setAttribute("d", gaugeNeedle(triffinNeedle(stress)));
  star.setAttribute("d", pumpStar(angle));
  const loads = economyLoads(stress);
  oneedles.forEach((n,i)=> n.setAttribute("d", outNeedle(i, clamp(loads[i],0,1))));
  const text = "stress " + Math.round(stress*100) + "% · " + regimeLabel(stress);
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(stress*100)));
  stage.setAttribute("aria-valuetext", text + " · " + provenance);
}
// LIVE: pull open, keyless sources and set the resting stress from the real US yield.
// Falls back silently to the static baseline (and SAYS so) if a source is unavailable.
(async () => {
  try {
    const live = await liveStress();
    if (live.stress != null) {
      target = live.stress; touring = false;
      const y = live.inputs.usYield, fx = live.inputs.fx;
      provenance = "live · US rate " + y.value + "% (" + y.trust + ") "
        + (fx && fx.value ? "· USD/INR " + fx.value.inr + " (" + fx.trust + ")" : "· FX gap");
      run();
    } else {
      provenance = "live yield unavailable → static model (GAP: " + live.inputs.usYield.label + ")";
    }
    if (window.__deReady) window.__deReady(provenance);
  } catch (e) { provenance = "offline → static model"; }
})();
function tick(now){
  const dt = last ? Math.min((now-last)/1000, 1/30) : 1/60; last = now;
  const calm = still.matches;
  if (touring){ clock += dt; target = 0.5 + 0.42*Math.sin(clock*0.5); }
  stress = calm ? target : stress + (target-stress)*(1-Math.exp(-dt/0.5));
  // pump spins faster when recycling hard (low stress = healthy loop)
  if (!calm) angle += dt * (0.6 + (1-stress)*2.4);
  draw();
  const settled = !touring && Math.abs(target-stress) < 0.001 && calm;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = ()=>{ if(!frame && visible){ last = 0; frame = requestAnimationFrame(tick); } };
const steer = (v)=>{ touring=false; target=clamp(v,0,1); clearTimeout(idle); idle=setTimeout(()=>{ touring=!still.matches; clock=0; run(); },4000); run(); };
new IntersectionObserver((e)=>{ visible=e[e.length-1].isIntersecting; if(visible) run(); },{rootMargin:"120px 0px"}).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove",(e)=>{ const b=svg.getBoundingClientRect(); steer(clamp((e.clientX-b.left)/b.width,0,1)); });
stage.addEventListener("pointerleave",()=>steer(target));
stage.addEventListener("keydown",(e)=>{ let v=null;
  if(e.key==="ArrowRight"||e.key==="ArrowUp") v=stress+0.1;
  if(e.key==="ArrowLeft"||e.key==="ArrowDown") v=stress-0.1;
  if(e.key==="Home") v=0; if(e.key==="End") v=1;
  if(v===null) return; e.preventDefault(); steer(v);
});
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "The Dollar Engine",
  hint: "Hover to drive · live US-rate fed",
  readout: "stress 35% · confidence high · dollars recycle",
  keys: [
    { mark: "lit", label: "US-dollar core (Treasury) — the reserve everyone must hold" },
    { mark: "raised", label: "Offshore Eurodollar tank — dollars created outside the US" },
    { mark: "mid", label: "CA · IN · CN dials — where the pressure lands" },
  ],
  caption:
    "A reserve-currency plant, driven by a live US interest rate (US Treasury FiscalData) and daily FX (ECB/Frankfurter). Surplus flows into the dollar core; the recycling pump returns it into US Treasuries — the exorbitant privilege. The Triffin gauge reads the trap: supply more dollars vs keep confidence. Three output dials show where the pressure lands — Canada (commodity price-taker), India (oil importer, squeezed hardest) and China (diverts flow to the petroyuan). Hover to raise system stress and watch who the engine squeezes. Framing, not investment advice.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="The Dollar Engine: arrow keys raise or lower system stress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="35">${svg}</div>`,
});

writeFileSync(join(HERE, theme === "light" ? "dollar-engine-light.html" : "dollar-engine.html"), k.pageHtml({ title: "The Dollar Engine", theme, body, script: kitScript() + live }));
console.log("wrote", theme === "light" ? "dollar-engine-light.html" : "dollar-engine.html");
