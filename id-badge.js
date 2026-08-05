/* id-badge.js — an interactive "press credential" that hangs on a lanyard:
   it swings on a spring, tilts toward the cursor with a shine, and flips
   front↔back on click. Vanilla, no deps. Reduce-motion aware.
   Usage: <div class="idb-mount" data-name="Bharat" ...></div> then this script
   auto-mounts any .idb-mount. Our own implementation + Ink & Crimson brand. */
(function () {
  "use strict";
  var reduce = (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    document.documentElement.getAttribute("data-reduce-motion") === "1";

  var CARD_W = 240, CARD_H = 360, ANCHOR_Y = 26, STRAP = 210;
  var STIFF = 0.06, DAMP = 0.78;

  function el(tag, cls, css) { var e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; return e; }

  function build(mount) {
    var d = {
      name: mount.dataset.name || "Bharat",
      role: mount.dataset.role || "PRESS CREDENTIAL",
      code: mount.dataset.code || "BA-2026",
      site: mount.dataset.site || "bharat.atlas",
      line1: mount.dataset.line1 || "Independent civic-data desk",
      line2: mount.dataset.line2 || "Sourced, or it's a gap.",
    };
    mount.classList.add("idb");
    mount.innerHTML = "";
    var canvas = el("canvas", "idb-rope");
    var card = el("div", "idb-card");
    var flip = el("div", "idb-flip");
    var front = el("div", "idb-face idb-front");
    var back = el("div", "idb-face idb-back");

    front.innerHTML =
      '<div class="idb-hole"></div>' +
      '<div class="idb-top"><span class="idb-mark">◐ ' + d.name + '</span><span class="idb-code">' + d.code + '</span></div>' +
      '<div class="idb-big">◐</div>' +
      '<div class="idb-bottom"><h3>' + d.name + '</h3><p class="idb-role">' + d.role + '</p>' +
      '<div class="idb-rule"></div><p class="idb-meta">' + d.line1.toUpperCase() + '</p></div>' +
      '<div class="idb-foot">' + d.site + '</div>';
    back.innerHTML =
      '<div class="idb-hole"></div><div class="idb-accentbar"></div>' +
      '<div class="idb-backbody"><span class="idb-mark">◐ ' + d.name + '</span>' +
      '<p class="idb-role">' + d.code + ' / CREDENTIAL</p><div class="idb-rule"></div>' +
      '<p class="idb-meta">' + d.line1 + '</p><p class="idb-meta idb-dim">' + d.line2 + '</p>' +
      '<div class="idb-rule"></div><div class="idb-barcode"></div></div>' +
      '<div class="idb-foot">' + d.site + '</div>';
    // simple barcode
    var bc = back.querySelector(".idb-barcode"); var pat = [3,1,2,1,3,2,1,2,1,3,1,2,2,1,1,3,2,1,2,1,3,1,2,1];
    var bx = ""; var x = 0; pat.forEach(function (w, i) { if (i % 2 === 0) bx += '<rect x="' + x + '" y="0" width="' + (w * 3) + '" height="30" />'; x += w * 3; });
    bc.innerHTML = '<svg viewBox="0 0 150 30" width="100%" height="26">' + bx + '</svg>';

    flip.appendChild(front); flip.appendChild(back);
    card.appendChild(flip);
    mount.appendChild(canvas); mount.appendChild(card);

    var hint = el("div", "idb-hint"); hint.textContent = "click to flip"; mount.appendChild(hint);

    // ---- physics ----
    var pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, tilt = { rx: 0, ry: 0 }, tTilt = { rx: 0, ry: 0 };
    var dragging = false, didDrag = false, off = { x: 0, y: 0 }, flipAng = 0, flipTarget = 0, raf;

    function anchor() { var r = mount.getBoundingClientRect(); return { x: r.width * 0.5, y: ANCHOR_Y }; }
    function rest() { var a = anchor(); return { x: a.x - CARD_W / 2, y: a.y + STRAP }; }

    function drawRope() {
      var ctx = canvas.getContext("2d"); var r = mount.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
      var a = anchor(), topX = pos.x + CARD_W / 2, topY = pos.y - 14, midY = a.y + (topY - a.y) * 0.5;
      // strap as a cubic bezier ribbon
      var steps = 60, pts = [];
      for (var i = 0; i <= steps; i++) {
        var t = i / steps, mt = 1 - t;
        var xx = mt*mt*mt*a.x + 3*mt*mt*t*a.x + 3*mt*t*t*topX + t*t*t*topX;
        var yy = mt*mt*mt*a.y + 3*mt*mt*t*midY + 3*mt*t*t*midY + t*t*t*topY;
        var dx = 6*mt*t*(topX-a.x), dy = 3*mt*mt*(midY-a.y) + 3*t*t*(topY-midY);
        var len = Math.hypot(dx, dy) || 1; pts.push({ x: xx, y: yy, tx: dx/len, ty: dy/len });
      }
      var half = 11;
      ctx.beginPath();
      for (var j = 0; j < pts.length; j++) { var p = pts[j], nx = -p.ty, ny = p.tx; if (j===0) ctx.moveTo(p.x+nx*half, p.y+ny*half); else ctx.lineTo(p.x+nx*half, p.y+ny*half); }
      for (var k = pts.length-1; k >= 0; k--) { var q = pts[k], mx = -q.ty, my = q.tx; ctx.lineTo(q.x-mx*half, q.y-my*half); }
      ctx.closePath(); ctx.fillStyle = "#16151a"; ctx.fill();
      // crimson centre stripe
      ctx.save(); ctx.clip();
      ctx.strokeStyle = "#d33a2c"; ctx.lineWidth = 3; ctx.beginPath();
      pts.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.stroke();
      ctx.restore();
      // clip block
      ctx.fillStyle = "#0d0d0d"; ctx.beginPath(); ctx.roundRect(topX - 8, topY, 16, 22, 3); ctx.fill();
    }

    function frame() {
      if (!dragging) {
        var rp = rest();
        vel.x += (rp.x - pos.x) * STIFF; vel.y += (rp.y - pos.y) * STIFF;
        vel.x *= DAMP; vel.y *= DAMP; pos.x += vel.x; pos.y += vel.y;
      }
      tilt.rx += (tTilt.rx - tilt.rx) * 0.1; tilt.ry += (tTilt.ry - tilt.ry) * 0.1;
      flipAng += (flipTarget - flipAng) * 0.12;
      card.style.transform = "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px) rotateX(" + tilt.rx.toFixed(2) + "deg) rotateY(" + tilt.ry.toFixed(2) + "deg)";
      flip.style.transform = "rotateY(" + flipAng.toFixed(1) + "deg)";
      drawRope();
      raf = requestAnimationFrame(frame);
    }

    // ---- static fallback (reduce-motion): no swing, no rAF ----
    if (reduce) {
      var rp = rest(); pos = rp; card.style.transform = "translate(" + rp.x + "px," + rp.y + "px)";
      drawRope();
      card.addEventListener("click", function () { flipTarget = flipTarget ? 0 : 180; flip.style.transition = "transform .4s ease"; flip.style.transform = "rotateY(" + flipTarget + "deg)"; });
      return;
    }

    var r0 = mount.getBoundingClientRect(); pos = { x: r0.width / 2 - CARD_W / 2, y: ANCHOR_Y + STRAP };
    raf = requestAnimationFrame(frame);

    mount.addEventListener("pointermove", function (e) {
      var r = mount.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
      if (dragging) {
        var nx = lx - off.x, ny = ly - off.y;
        if (Math.abs(nx - pos.x) + Math.abs(ny - pos.y) > 4) didDrag = true;
        pos.x = nx; pos.y = ny; vel = { x: 0, y: 0 };
      }
      var cx = pos.x + CARD_W / 2, cy = pos.y + CARD_H / 2;
      var dx = (lx - cx) / (CARD_W / 2), dy = (ly - cy) / (CARD_H / 2);
      if (dx*dx + dy*dy < 4) {
        tTilt.rx = -dy * 10; tTilt.ry = dx * 10;
        front.style.setProperty("--sx", ((lx - pos.x) / CARD_W * 100) + "%");
        front.style.setProperty("--sy", ((ly - pos.y) / CARD_H * 100) + "%");
      }
    });
    card.addEventListener("pointerdown", function (e) {
      card.setPointerCapture(e.pointerId); dragging = true; didDrag = false;
      var r = mount.getBoundingClientRect(); off = { x: e.clientX - r.left - pos.x, y: e.clientY - r.top - pos.y };
    });
    card.addEventListener("pointerup", function (e) {
      card.releasePointerCapture(e.pointerId); var was = didDrag; dragging = false;
      tTilt = { rx: 0, ry: 0 }; vel.x *= 1.5; vel.y *= 1.5;
      if (!was) flipTarget = flipTarget ? 0 : 180;
    });
  }

  function init() {
    var mounts = document.querySelectorAll(".idb-mount");
    if (!mounts.length) return;
    mounts.forEach(build);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.IdBadge = { init: init };
})();
