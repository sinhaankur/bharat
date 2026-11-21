// Self-Healing Deploy Pipeline — an isometric figure for the WatchTower landing page.
// The machine IS the explanation: a small deploy line. A repo hopper feeds a build
// station; the build drops a container onto a Podman carriage that rolls to a health-
// check gauge. When the gauge reads FAIL, a repair arm swings in, applies a fix, and
// the carriage loops back — the deploy heals itself. A status lamp reads the state.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/sinhaankur/.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/Users/sinhaankur/.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 660, HEIGHT = 420;
const PLATE = { x: -150, y: -84, w: 300, d: 172, r: 10 };
const PLATE_H = 12, FOOT_H = 6;

// stations along the deploy line (left → right)
const HOPPER = [-112, -8];     // repo intake hopper
const BUILD  = [-48, -4];      // build station (tower)
const RAIL_Y = 34;             // the carriage rail (front)
const RAIL_X0 = -96, RAIL_X1 = 108;
const GAUGE  = [92, -10];      // health-check gauge (right)
const GAUGE_R = 22, GAUGE_Z = 50;
const ARM    = [40, -30];      // repair arm pivot (back-centre)
const CARRIAGE_Z = 6;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [BUILD[0], BUILD[1], 70],
    [GAUGE[0], GAUGE[1], GAUGE_Z + GAUGE_R + 6],
    [ARM[0], ARM[1], 60],
  ],
  WIDTH, HEIGHT, { pad: 26, azimuth: 46 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

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
  // ruler strip
  const strip = { x: PLATE.x + 14, y: PLATE.y + PLATE.d - 15, w: PLATE.w - 28, d: 8, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.7, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 5, strip.x + strip.w - 5, 5, 5, strip.y + 1, 0.7, [2.2, 4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  // nameplate
  const np = { x: PLATE.x + 12, y: PLATE.y + 7, w: 78, d: 16, r: 2 };
  out.push(S(k.slabOf(np, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(np, 2.5), 0.6, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([np.x + np.w / 2, np.y + 6.5], 0.7, P, "x"), "DEPLOY LINE", { size: 2.4, tone: "mid", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([np.x + np.w / 2, np.y + 12], 0.7, P, "x"), "self-healing", { size: 2.0, tone: "lo", anchor: "middle" }));
  return out.join("");
}

// the carriage rail the container rides along
function rail() {
  const out = [];
  const beam = { x: RAIL_X0, y: RAIL_Y - 4, w: RAIL_X1 - RAIL_X0, d: 8, r: 2 };
  out.push(S(k.slabOf(beam, 0, 5, P, 3, 0.5), { tone: "mid" }));
  out.push(L(k.lineOnTop([RAIL_X0 + 4, RAIL_Y], [RAIL_X1 - 4, RAIL_Y], 5, P), { tone: "faint" }));
  // sleepers
  for (let x = RAIL_X0 + 8; x < RAIL_X1; x += 16) out.push(D([at([x, RAIL_Y, 5])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

// repo intake hopper: a slanted bin feeding the build (the GitHub repo)
function hopper() {
  const [x, y] = HOPPER, out = [];
  out.push(S(k.slabOf({ x: x - 12, y: y - 12, w: 24, d: 24, r: 3 }, 0, 6, P, 4, 0.6), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x - 10, y: y - 10, w: 20, d: 20, r: 2 }, 6, 20, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan({ x: x - 10, y: y - 10, w: 20, d: 20, r: 2 }, 3), 26, P), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 2], 26.5, P, "x"), "repo", { size: 3.2, tone: "lo", anchor: "middle" }));
  // a chute toward the build station
  out.push(S(k.slabOf({ x: x + 8, y: y - 3, w: BUILD[0] - x - 8, d: 6, r: 1.5 }, 10, 3, P, 3), { tone: "lo" }));
  return out.join("");
}

// build station: a tower with a lit top (where the container is assembled)
function buildStation() {
  const [x, y] = BUILD, out = [];
  out.push(S(k.cylinder(x, y, 16, 0, 5, P, 48), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 13, 5, 55, P, 48, 0.8), { tone: "hi", crease: "lo" }));
  for (const z of [20, 35, 50]) out.push(L(k.sideArc(x, y, 13, z, P, 40), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 10, 60, 6, P, 48), { tone: "hi", crease: "lo", lit: true }));
  out.push(L(k.ring(x, y, 10, 66, P, 48), { tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 1], 66.4, P, "x"), "BUILD", { size: 3.0, tone: "lit", anchor: "middle" }));
  return out.join("");
}

// health-check gauge: dial whose needle swings OK ↔ FAIL
function gaugeStatic() {
  const [x, y] = GAUGE, out = [];
  out.push(S(k.cylinder(x, y, 3.4, 0, GAUGE_Z, P, 28), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, GAUGE_R, GAUGE_Z, 6, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, GAUGE_R, GAUGE_Z + 6 - 2.4, GAUGE_Z + 6, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, GAUGE_R - 2.4, GAUGE_Z + 6, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, GAUGE_R - 3.4, 40, 5, GAUGE_Z + 6, [1.4, 3], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.6, GAUGE_Z + 6, P, 16), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([x - 10, y + 9], GAUGE_Z + 6, P, "x"), "FAIL", { size: 2.0, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x + 10, y + 9], GAUGE_Z + 6, P, "x"), "OK", { size: 2.0, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y - GAUGE_R + 4], GAUGE_Z + 6, P, "x"), "HEALTH", { size: 2.2, tone: "mid", anchor: "middle" }));
  return out.join("");
}
const gaugeNeedle = (t) => {       // t: -1 FAIL .. +1 OK
  const [x, y] = GAUGE;
  const a = (-Math.PI * 0.62) + ((t + 1) / 2) * (Math.PI * 1.24);
  return k.lineOnTop([x - Math.cos(a) * 3, y - Math.sin(a) * 3], [x + Math.cos(a) * (GAUGE_R - 4), y + Math.sin(a) * (GAUGE_R - 4)], GAUGE_Z + 6.4, P);
};

// repair arm: a pivoting arm with a tool head that swings over the carriage on fail
function armBase() {
  const [x, y] = ARM, out = [];
  out.push(S(k.cylinder(x, y, 7, 0, 10, P, 32), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 5, 10, 4, P, 32), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, 5, 10, 14, 24, P), { tone: "lo" }));
  return out.join("");
}
const armReach = (ext) => {        // ext 0..1 → how far the tool swings toward the rail
  const [x, y] = ARM, z = 14;
  const tx = x + ext * 8, ty = y + ext * (RAIL_Y - y - 6);
  return k.lineOnTop([x, y], [tx, ty], z, P);
};

// the container carriage that rides the rail
function carriageAt(cx) {
  const plan = { x: cx - 9, y: RAIL_Y - 7, w: 18, d: 14, r: 2 };
  const out = [`<path class="iso-halo" d="${k.haloOf(plan, CARRIAGE_Z, 0.1, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(plan, CARRIAGE_Z, 12, P, 3, 0.6), { tone: "hi", crease: "lo", lit: true }));
  out.push(L(k.planOutline(k.insetPlan(plan, 2.5), CARRIAGE_Z + 12, P, 3), { tone: "faint" }));
  // container "crate" lines
  out.push(L(k.lineOnTop([cx - 9, RAIL_Y], [cx + 9, RAIL_Y], CARRIAGE_Z + 12, P), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([cx, RAIL_Y], CARRIAGE_Z + 12.3, P, "x"), "app", { size: 2.4, tone: "lit", anchor: "middle" }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label:
    "WatchTower's self-healing deploy line. A repo hopper feeds a build station; the build drops an app container onto a carriage that rides a rail to a health-check gauge. When the gauge reads FAIL, a repair arm swings over the carriage, applies a fix, and the carriage loops back to re-run — the deploy heals itself. A status lamp reads deploying, failed, repairing, or live.",
  body: [
    plate(),
    rail(),
    hopper(),
    buildStation(),
    gaugeStatic(),
    `<path data-part="gneedle" class="iso-line" data-tone="lit" data-free="both" d="${gaugeNeedle(1)}" style="stroke-width:1.2"/>`,
    armBase(),
    `<g data-part="arm"><path class="iso-line" data-tone="mid" data-free="both" d="${armReach(0)}" style="stroke-width:1.4"/></g>`,
    `<g data-part="carriage" transform="${k.translateAlong(P, [0, 0, 0])}">${carriageAt(RAIL_X0 + 24)}</g>`,
  ],
});
const CARRIAGE_HOME = RAIL_X0 + 24;

const live = `
const P = ${JSON.stringify(P)};
const GAUGE = ${JSON.stringify(GAUGE)}, GAUGE_R = ${GAUGE_R}, GAUGE_Z = ${GAUGE_Z};
const ARM = ${JSON.stringify(ARM)}, RAIL_Y = ${RAIL_Y}, RAIL_X0 = ${RAIL_X0}, RAIL_X1 = ${RAIL_X1}, CARRIAGE_Z = ${CARRIAGE_Z};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const gneedle = svg.querySelector('[data-part="gneedle"]');
const arm = svg.querySelector('[data-part="arm"] path');
const carriage = svg.querySelector('[data-part="carriage"]');
const CARRIAGE_HOME = ${JSON.stringify(RAIL_X0 + 24)};
const CARRIAGE_END = ${JSON.stringify(RAIL_X1 - 28)};
const gaugeNeedle = ${gaugeNeedle.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const armReach = ${armReach.toString().replace(/k\.lineOnTop/g, "lineOnTop").replace(/k\.iso/g, "iso")};
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
// the deploy cycle: 0 deploying → 1 failed → 2 repairing → 3 live → loop
const PHASES = ["deploying · build → container", "failed · health check tripped", "repairing · fix applied, retrying", "live · healthy, serving"];
let t = 0, frame = 0, last = 0, visible = false;
function render(){
  const p = ((t % 4) + 4) % 4;
  // carriage travels right during deploy(0→1), waits at gauge during fail/repair(1→3), loops back on live(3→4)
  let cx;
  if (p < 1) cx = CARRIAGE_HOME + p*(CARRIAGE_END - CARRIAGE_HOME);
  else if (p < 3) cx = CARRIAGE_END;
  else cx = CARRIAGE_END + (p-3)*(CARRIAGE_HOME - CARRIAGE_END);
  // move the carriage group along +x by (cx - home) in world units
  carriage.setAttribute("transform", translateAlong(P, [cx - CARRIAGE_HOME, 0, 0]));
  const health = (p >= 1 && p < 3) ? -0.8 + (p>=2 ? (p-2)*1.4 : 0) : 1;
  gneedle.setAttribute("d", gaugeNeedle(clamp(health,-1,1)));
  const ext = p >= 2 && p < 3 ? Math.sin((p-2)*Math.PI) : 0;
  arm.setAttribute("d", armReach(ext));
  const text = PHASES[Math.floor(p)];
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function tick(now){
  const dt = last ? Math.min((now-last)/1000, 1/30) : 1/60; last = now;
  if (!still.matches) t += dt * 0.45;   // ~9s per full cycle
  render();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = ()=>{ if(!frame && visible){ last=0; frame=requestAnimationFrame(tick); } };
new IntersectionObserver((e)=>{ visible=e[e.length-1].isIntersecting; if(visible) run(); },{rootMargin:"120px 0px"}).observe(stage);
// let the viewer scrub phases by hovering across the figure
stage.addEventListener("pointermove",(e)=>{ const b=svg.getBoundingClientRect(); t = clamp((e.clientX-b.left)/b.width,0,1)*4; render(); });
if (still.matches) { t = 3.1; render(); }   // reduced motion: show the 'live' state
render();
`;

const body = k.plateHtml({
  fig: "Fig",
  title: "Self-healing deploy",
  hint: "Hover to scrub the deploy cycle",
  readout: "live · healthy, serving",
  keys: [
    { mark: "lit", label: "The app container — what moves down the line" },
    { mark: "mid", label: "Repair arm — swings in when the health check fails" },
  ],
  caption:
    "WatchTower's deploy line. A repo feeds a build; the build drops your app container onto a carriage that rolls to a health check. When it reads FAIL, the repair arm swings in, applies a safe fix, and the carriage loops back to retry — the deploy heals itself, no terminal required. Autonomy is a switch you can turn off.",
  body: `<div class="iso-stage" tabindex="0" role="img" aria-label="Self-healing deploy pipeline: deploying, failing, repairing, then live">${svg}</div>`,
});

writeFileSync(join(HERE, theme === "light" ? "self-healing-light.html" : "self-healing.html"), k.pageHtml({ title: "Self-healing deploy", theme, body, script: kitScript() + live }));
console.log("wrote", theme === "light" ? "self-healing-light.html" : "self-healing.html");
