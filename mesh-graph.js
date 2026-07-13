/* mesh-graph.js — a dependency-free force-directed relationship graph ("the mesh"):
   how officials ↔ districts ↔ schemes ↔ story chains connect. Every node and edge
   is a REAL, sourced link built from the loaded data — nothing decorative.

   Canvas-rendered (fast, no library). Exposes window.MeshGraph:
     MeshGraph.build({ ledger, events, officials }) → { nodes, edges }
     MeshGraph.mount(canvasEl, graph, { onSelect }) → controller
*/
(function (global) {
  'use strict';

  const TYPE = {
    district: { color: '#e8b84b', r: 7, label: 'District' },
    official: { color: '#5bb3e8', r: 6, label: 'Official' },
    scheme:   { color: '#7de0a3', r: 6, label: 'Scheme' },
    chain:    { color: '#e07d9a', r: 8, label: 'Story chain' },
    money:    { color: '#f2c14e', r: 7, label: 'Money (sourced ₹)' },
  };

  // Build nodes + edges from the data. Only real relationships become edges.
  function build(data) {
    const ledger = data.ledger || {};
    const events = data.events || {};
    const officials = (data.officials && data.officials.officials) || [];
    const nodes = new Map();   // id -> node
    const edges = [];
    const node = (id, type, label, meta) => {
      if (!nodes.has(id)) nodes.set(id, { id, type, label, meta: meta || {}, deg: 0 });
      return nodes.get(id);
    };
    const link = (a, b, kind) => { if (a && b && a !== b) { edges.push({ a, b, kind }); nodes.get(a).deg++; nodes.get(b).deg++; } };
    const distId = (s, d) => 'd:' + s + '|' + d;

    // Story chains → district + scheme
    for (const c of events.story_chains || []) {
      const cid = 'c:' + c.id;
      node(cid, 'chain', c.title, { id: c.id, href: 'story.html?chain=' + encodeURIComponent(c.id) });
      if (c.geo && c.geo.district) {
        const did = distId(c.geo.state, c.geo.district);
        node(did, 'district', c.geo.district, { state: c.geo.state, district: c.geo.district });
        link(cid, did, 'in');
      }
      if (c.scheme_ref) {
        const sid = 's:' + c.scheme_ref;
        node(sid, 'scheme', c.scheme_ref.replace(/^_/, '').replace(/_/g, ' '), {});
        link(cid, sid, 'scheme');
      }
      // Money node — ONLY where the chain carries a sourced actual_cost. Labelled
      // with the human per-capita figure; sized by the crore amount.
      const ac = c.actual_cost;
      if (ac && typeof ac.amount_cr === 'number' && !ac.figure_gap) {
        const mid = 'm:' + c.id;
        const label = ac.per_capita_inr != null
          ? '₹' + ac.per_capita_inr.toLocaleString('en-IN') + '/resident'
          : '₹' + ac.amount_cr.toLocaleString('en-IN') + ' cr';
        node(mid, 'money', label, { amount_cr: ac.amount_cr, per_capita: ac.per_capita_inr, scope: ac.scope, href: 'story.html?chain=' + encodeURIComponent(c.id) });
        link(cid, mid, ac.scope === 'district' ? 'cost (district)' : 'cost (state-wide)');
        if (c.geo && c.geo.district) link(mid, distId(c.geo.state, c.geo.district), 'per resident');
      }
    }
    // Officials → district, and issue → chain
    for (const o of officials) {
      const oid = 'o:' + o.id;
      node(oid, 'official', o.name, { service: o.service, href: 'knowledge.html#officials' });
      for (const d of o.district_refs || []) {
        const did = distId(d.state, d.district);
        node(did, 'district', d.district, { state: d.state, district: d.district });
        link(oid, did, 'serves');
      }
      for (const i of o.issues || []) {
        if (i.links_chain && nodes.has('c:' + i.links_chain)) link(oid, 'c:' + i.links_chain, 'issue');
      }
    }
    // Ensure chain districts also appear even if only via ledger (already added above).
    return { nodes: [...nodes.values()], edges };
  }

  // Simple force layout + canvas render.
  function mount(canvas, graph, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const nodes = graph.nodes, edges = graph.edges;
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    let W = 0, H = 0, dpr = Math.min(2, global.devicePixelRatio || 1);
    let sel = null, hover = null, dragging = null, raf = null;
    // init positions in a circle
    nodes.forEach((n, i) => {
      const a = (i / nodes.length) * Math.PI * 2;
      n.x = Math.cos(a) * 120 + (Math.random() - 0.5) * 40;
      n.y = Math.sin(a) * 120 + (Math.random() - 0.5) * 40;
      n.vx = 0; n.vy = 0;
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    global.addEventListener('resize', resize);

    // one physics step (repulsion + spring + centering)
    function step() {
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (a === dragging) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy || 0.01;
          const f = 900 / d2; const d = Math.sqrt(d2);
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
        }
      }
      for (const e of edges) {
        const a = byId[e.a], b = byId[e.b];
        let dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - 70) * 0.02;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        if (a !== dragging) { a.vx += fx; a.vy += fy; }
        if (b !== dragging) { b.vx -= fx; b.vy -= fy; }
      }
      for (const n of nodes) {
        if (n === dragging) continue;
        n.vx += (cx - n.x) * 0.004; n.vy += (cy - n.y) * 0.004;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx; n.y += n.vy;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // edges
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = byId[e.a], b = byId[e.b];
        const on = sel && (e.a === sel.id || e.b === sel.id);
        ctx.strokeStyle = on ? 'rgba(232,184,75,0.55)' : 'rgba(255,255,255,0.10)';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // nodes
      for (const n of nodes) {
        const t = TYPE[n.type] || TYPE.district;
        // money nodes are sized by the ₹ crore amount (sqrt scale); others by degree.
        const r = n.type === 'money'
          ? 6 + Math.min(12, Math.sqrt((n.meta.amount_cr || 0)) * 0.18)
          : t.r + Math.min(6, n.deg);
        const dim = sel && sel.id !== n.id && !edges.some(e => (e.a === sel.id && e.b === n.id) || (e.b === sel.id && e.a === n.id));
        ctx.globalAlpha = dim ? 0.28 : 1;
        ctx.fillStyle = t.color;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        if (n === hover || n === sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
        // label for hubs / hovered / selected
        if (n.deg >= 2 || n === hover || n === sel) {
          ctx.globalAlpha = dim ? 0.3 : 0.9;
          ctx.fillStyle = '#e8e8e8'; ctx.font = '10px ui-monospace, monospace';
          ctx.fillText(n.label.length > 22 ? n.label.slice(0, 21) + '…' : n.label, n.x + r + 3, n.y + 3);
        }
        ctx.globalAlpha = 1;
      }
    }

    let cool = 300;
    function loop() { if (cool > 0) { step(); cool -= 1; } draw(); raf = requestAnimationFrame(loop); }
    loop();

    function at(mx, my) {
      let best = null, bd = 16 * 16;
      for (const n of nodes) { const dx = n.x - mx, dy = n.y - my, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = n; } }
      return best;
    }
    const pos = ev => { const r = canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    canvas.addEventListener('mousemove', ev => {
      const [mx, my] = pos(ev);
      if (dragging) { dragging.x = mx; dragging.y = my; dragging.vx = dragging.vy = 0; cool = Math.max(cool, 40); }
      else { const h = at(mx, my); if (h !== hover) { hover = h; canvas.style.cursor = h ? 'pointer' : 'default'; } }
    });
    canvas.addEventListener('mousedown', ev => { const [mx, my] = pos(ev); dragging = at(mx, my); });
    global.addEventListener('mouseup', () => { dragging = null; });
    canvas.addEventListener('click', ev => {
      const [mx, my] = pos(ev); const n = at(mx, my);
      sel = n; if (opts.onSelect) opts.onSelect(n);
    });

    return {
      select(id) { sel = byId[id] || null; if (opts.onSelect) opts.onSelect(sel); cool = Math.max(cool, 120); },
      destroy() { cancelAnimationFrame(raf); },
    };
  }

  global.MeshGraph = { build, mount, TYPE };
})(typeof window !== 'undefined' ? window : this);
