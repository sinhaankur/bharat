/* webgl.js — the shared background WebGL canvas for EVERY page.
   One hero object per door (body[data-door]): a slow, calm, gold emblem that lives behind
   the content. Reuses the house look (gold on dark, fresnel-ish rim, point fields). Cheap:
   one canvas, point/line geometry, capped DPR. Reduced-motion or no-WebGL → a static poster
   (a faint CSS emblem via .nogl), so nothing is required for the page to work.

   Doors:  0 Today → a lean-coloured particle field      1 Money → a slow globe of points
           2 Land  → a terrain block of points           3 Long story → the Ashoka chakra ring
           4 Words → the seal/chakra of glyph-points      5 Receipts → stacked edict bars
   Three.js r128 (global build), loaded on demand. */
(function () {
  "use strict";
  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var lowPerf = (navigator.hardwareConcurrency || 4) <= 4 || /Mobi|Android/i.test(navigator.userAgent);
  var door = +(document.body.getAttribute("data-door") || 0);
  if (reduce) { document.documentElement.classList.add("nogl"); return; }

  // lazy-load three r128 (global), then boot
  var S = document.createElement("script");
  S.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js";
  S.onload = boot;
  S.onerror = function () { document.documentElement.classList.add("nogl"); };
  document.head.appendChild(S);

  function boot() {
    if (!window.THREE) { document.documentElement.classList.add("nogl"); return; }
    var THREE = window.THREE;

    // a fixed, behind-content canvas
    var canvas = document.createElement("canvas");
    canvas.id = "bgl";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.5";
    document.body.prepend(canvas);

    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
    catch (e) { document.documentElement.classList.add("nogl"); canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    // read the door accent from CSS so the emblem matches the active skin
    function doorGold() {
      var c = getComputedStyle(document.body).getPropertyValue("--era").trim()
           || getComputedStyle(document.documentElement).getPropertyValue("--gold").trim()
           || "#f0b429";
      try { return new THREE.Color(c); } catch (e) { return new THREE.Color("#f0b429"); }
    }
    var GOLD = doorGold();

    // a soft round sprite for points
    var sprite = (function () {
      var c = document.createElement("canvas"); c.width = c.height = 64;
      var x = c.getContext("2d");
      var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "#fff"); g.addColorStop(0.35, "#ffe8b0"); g.addColorStop(1, "rgba(201,154,52,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    var N = lowPerf ? 1400 : 3600;
    var pos = new Float32Array(N * 3);
    var group = new THREE.Group();
    scene.add(group);

    // ---- per-door hero geometry (positions the point cloud) ----
    function layoutTodayField() {          // 0: a lean-coloured drifting field (3 columns)
      for (var i = 0; i < N; i++) {
        var col = i % 3;                   // left/centre/right lean bands
        pos[i*3]   = (col - 1) * 2.4 + (Math.random() - 0.5) * 1.6;
        pos[i*3+1] = (Math.random() - 0.5) * 7;
        pos[i*3+2] = (Math.random() - 0.5) * 2;
      }
    }
    function layoutGlobe() {               // 1: a sphere of points (Money → the country/world)
      for (var i = 0; i < N; i++) {
        var u = Math.random(), v = Math.random();
        var th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1), r = 3.1;
        pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
        pos[i*3+1] = r * Math.cos(ph);
        pos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
      }
    }
    function layoutTerrain() {             // 2: a terrain block (Land → relief)
      var g = Math.ceil(Math.sqrt(N));
      for (var i = 0; i < N; i++) {
        var gx = i % g, gz = (i / g) | 0;
        var x = (gx / g - 0.5) * 7, z = (gz / g - 0.5) * 7;
        var h = Math.sin(x * 0.8) * Math.cos(z * 0.8) * 0.9 + (Math.random() - 0.5) * 0.2;
        pos[i*3] = x; pos[i*3+1] = h - 1.2; pos[i*3+2] = z;
      }
    }
    function layoutChakra(spokes) {        // 3 & 4: a Dharmachakra ring of points
      spokes = spokes || 24;
      for (var i = 0; i < N; i++) {
        var onRim = (i % 3 !== 0);
        var a = Math.random() * Math.PI * 2, r;
        if (onRim) r = 3.0 * (0.97 + Math.random() * 0.05);
        else { var s = Math.floor(Math.random() * spokes); a = s / spokes * Math.PI * 2; r = Math.random() * 3.0; }
        pos[i*3]   = Math.cos(a) * r;
        pos[i*3+1] = Math.sin(a) * r;
        pos[i*3+2] = (Math.random() - 0.5) * 0.3;
      }
    }
    function layoutEdicts() {              // 5: stacked edict bars (Receipts → the record)
      for (var i = 0; i < N; i++) {
        var row = i % 9;
        pos[i*3]   = (Math.random() - 0.5) * 6.4;
        pos[i*3+1] = (row - 4) * 0.72 + (Math.random() - 0.5) * 0.18;
        pos[i*3+2] = (Math.random() - 0.5) * 0.6;
      }
    }

    if (door === 0) layoutTodayField();
    else if (door === 1) layoutGlobe();
    else if (door === 2) layoutTerrain();
    else if (door === 3) layoutChakra(32);
    else if (door === 4) layoutChakra(24);
    else layoutEdicts();

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({
      size: lowPerf ? 0.12 : 0.085, map: sprite, color: GOLD,
      transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    var points = new THREE.Points(geo, mat);
    group.add(points);

    // Today's field gets lean colours (left/centre/right)
    if (door === 0) {
      var cols = new Float32Array(N * 3);
      var L = new THREE.Color("#5f9fd6"), C = new THREE.Color("#d9d2c0"), R = new THREE.Color("#d9603f");
      for (var i = 0; i < N; i++) {
        var c = i % 3 === 0 ? L : i % 3 === 1 ? C : R;
        cols[i*3] = c.r; cols[i*3+1] = c.g; cols[i*3+2] = c.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
      mat.vertexColors = true; mat.color = new THREE.Color("#ffffff");
    }

    // ---- loop: slow idle turn + gentle pointer parallax ----
    var mx = 0, my = 0, pmx = 0, pmy = 0;
    addEventListener("pointermove", function (e) {
      mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
    addEventListener("resize", function () {
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    // camera eases in from the page-transition (the shared camera idea: a small push-in)
    camera.position.z = 11;
    var t0 = performance.now();
    function loop(now) {
      var dt = (now - t0) / 1000; t0 = now;
      pmx += (mx - pmx) * 0.04; pmy += (my - pmy) * 0.04;
      // door-specific idle motion
      if (door === 1 || door === 3 || door === 4) group.rotation.y += dt * 0.08;   // globe/chakra turn
      else group.rotation.y = Math.sin(now * 0.00007) * 0.12;
      group.rotation.x = -0.12 + pmy * 0.1;
      group.rotation.y += pmx * 0.0008;
      if (door === 3 || door === 4) group.rotation.z += dt * 0.02;                  // chakra spin in-plane
      if (camera.position.z > 9) camera.position.z += (9 - camera.position.z) * 0.04; // settle push-in
      // keep the gold in sync if the skin changed
      if ((now | 0) % 40 === 0 && door !== 0) { var g = doorGold(); mat.color.copy(g); }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
