/* share-widget.js — a reusable "share this" primitive for the whole atlas.
   Share the site, a page, or ANY specific data segment (a district's number, a state's
   rank, a policy) to Reddit, X, WhatsApp, LinkedIn, Telegram, Facebook, email — plus
   native share + copy-link. One include, use anywhere.

   Usage:
     ShareWidget.open({
       url:   'https://…/state-of-india.html',      // what to link (defaults to current URL)
       title: 'State of India — who carries the country',
       text:  'Maharashtra nets +₹661k cr into the union — see who carries India',  // the hook
     });
   Or drop a ready-made button:
     el.appendChild(ShareWidget.button({ url, title, text, label:'Share' }));

   Rich cards come from each page's OG/Twitter meta (set by site-nav.js). No dependencies. */
(function (g) {
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]); }); };

  // the share targets — each builds its own intent URL from {url, text, title}
  var TARGETS = [
    { key: "reddit", label: "Reddit", ic: "🟠", href: function (u, t) { return "https://www.reddit.com/submit?url=" + enc(u) + "&title=" + enc(t); } },
    { key: "x", label: "X / Twitter", ic: "𝕏", href: function (u, t) { return "https://twitter.com/intent/tweet?text=" + enc(t) + "&url=" + enc(u); } },
    { key: "whatsapp", label: "WhatsApp", ic: "💬", href: function (u, t) { return "https://api.whatsapp.com/send?text=" + enc(t + " " + u); } },
    { key: "telegram", label: "Telegram", ic: "✈️", href: function (u, t) { return "https://t.me/share/url?url=" + enc(u) + "&text=" + enc(t); } },
    { key: "linkedin", label: "LinkedIn", ic: "in", href: function (u) { return "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(u); } },
    { key: "facebook", label: "Facebook", ic: "f", href: function (u, t) { return "https://www.facebook.com/sharer/sharer.php?u=" + enc(u) + "&quote=" + enc(t); } },
    { key: "email", label: "Email", ic: "✉️", href: function (u, t, ti) { return "mailto:?subject=" + enc(ti || "From the India District Atlas") + "&body=" + enc(t + "\n\n" + u); } },
  ];
  function enc(s) { return encodeURIComponent(s || ""); }

  // turn a snapshot source (canvas | dataURL string) into a PNG dataURL. For a WebGL canvas
  // that wasn't created with preserveDrawingBuffer, the caller should force a render right
  // before opening the share sheet so the buffer is still intact.
  function snapshotDataURL(src) {
    try {
      if (typeof src === "string") return src;                       // already a dataURL
      if (src && src.toDataURL) return src.toDataURL("image/png");    // a canvas element
    } catch (e) {}
    return null;
  }
  function downloadBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function injectCSS() {
    if (document.getElementById("share-widget-css")) return;
    var css = ""
      + ".sw-btn{display:inline-flex;align-items:center;gap:0.4rem;font-family:var(--font-mono);font-size:12px;padding:5px 12px;border-radius:999px;border:1px solid var(--border-strong);background:oklch(0.18 0.02 250);color:var(--foreground);cursor:pointer}"
      + ".sw-btn:hover{border-color:var(--warm)}"
      + ".sw-overlay{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;background:oklch(0.05 0 0 / 0.62);backdrop-filter:blur(5px)}"
      + ".sw-card{width:min(420px,92vw);background:oklch(0.14 0.005 250);border:1px solid var(--border-strong);border-radius:var(--radius);box-shadow:0 20px 60px oklch(0 0 0 / 0.6);padding:1rem 1.1rem 1.2rem}"
      + ".sw-head{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem}"
      + ".sw-title{flex:1;font-family:var(--font-display);font-size:1.05rem}"
      + ".sw-close{background:oklch(0.2 0 0);border:1px solid var(--border-strong);color:var(--foreground);border-radius:999px;width:28px;height:28px;cursor:pointer;font-size:14px}"
      + ".sw-preview{font-size:0.85rem;line-height:1.5;color:var(--muted-foreground);background:oklch(0.11 0 0);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.6rem 0.75rem;margin:0.3rem 0 0.9rem}"
      + ".sw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.45rem}"
      + ".sw-target{display:flex;align-items:center;gap:0.5rem;text-decoration:none;background:oklch(0.17 0.005 250);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.55rem 0.65rem;color:var(--foreground);font-family:var(--font-mono);font-size:12px;cursor:pointer}"
      + ".sw-target:hover{border-color:var(--warm);background:oklch(0.22 0.02 250)}"
      + ".sw-target .swi{width:20px;text-align:center;font-weight:700}"
      + ".sw-row{display:flex;gap:0.45rem;margin-top:0.7rem}"
      + ".sw-copy{flex:1;display:flex;align-items:center;justify-content:center;gap:0.4rem;background:oklch(0.2 0.03 250);border:1px solid var(--border-strong);color:var(--foreground);border-radius:var(--radius-sm);padding:0.55rem;font-family:var(--font-mono);font-size:12px;cursor:pointer}"
      + ".sw-copy:hover{border-color:var(--warm)}"
      + ".sw-native{background:oklch(0.28 0.07 78);border-color:var(--warm);color:oklch(0.94 0.05 90)}"
      + ".sw-snap{margin:0 0 0.6rem;border:1px solid var(--border-strong);border-radius:var(--radius-sm);overflow:hidden;background:oklch(0.08 0 0)}"
      + ".sw-snap img{display:block;width:100%;max-height:200px;object-fit:cover}";
    var s = document.createElement("style"); s.id = "share-widget-css"; s.textContent = css;
    document.head.appendChild(s);
  }

  function open(opts) {
    injectCSS();
    opts = opts || {};
    var url = opts.url || location.href;
    var title = opts.title || document.title || "India District Atlas";
    var text = opts.text || title;
    close();  // one at a time

    var ov = document.createElement("div"); ov.className = "sw-overlay"; ov.id = "sw-overlay";
    var targets = TARGETS.map(function (t) {
      return '<a class="sw-target" target="_blank" rel="noopener" href="' + esc(t.href(url, text, title)) + '"><span class="swi">' + t.ic + "</span>" + esc(t.label) + "</a>";
    }).join("");
    var nativeBtn = navigator.share ? '<button class="sw-copy sw-native" id="sw-native">📲 Share…</button>' : "";
    // optional snapshot: a canvas/dataURL/blob of the current view to share as an IMAGE.
    var snap = opts.snapshot ? snapshotDataURL(opts.snapshot) : null;
    var snapRow = snap
      ? '<div class="sw-snap"><img src="' + snap + '" alt="snapshot"/></div>'
        + '<div class="sw-row"><button class="sw-copy sw-native" id="sw-shareimg">📸 Share image…</button><button class="sw-copy" id="sw-dlimg">⬇ Save image</button></div>'
      : "";
    ov.innerHTML =
      '<div class="sw-card" role="dialog" aria-label="Share">'
      + '<div class="sw-head"><div class="sw-title">Share this</div><button class="sw-close" id="sw-close" aria-label="Close">✕</button></div>'
      + '<div class="sw-preview">' + esc(text) + '</div>'
      + snapRow
      + '<div class="sw-grid">' + targets + "</div>"
      + '<div class="sw-row">' + nativeBtn + '<button class="sw-copy" id="sw-copy">🔗 Copy link</button></div>'
      + "</div>";
    document.body.appendChild(ov);

    // snapshot buttons: share the image file (Web Share w/ files) or download it to attach.
    if (snap) {
      var toBlob = function (cb) { fetch(snap).then(function (r) { return r.blob(); }).then(cb); };
      var fname = 'india-atlas-' + Date.now() + '.png';
      var shareImgBtn = document.getElementById('sw-shareimg');
      shareImgBtn.addEventListener('click', function () {
        toBlob(function (blob) {
          var file = new File([blob], fname, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: title, text: text }).catch(function () {});
          } else { downloadBlob(blob, fname); shareImgBtn.textContent = '⬇ saved — attach it'; }
        });
      });
      document.getElementById('sw-dlimg').addEventListener('click', function () { toBlob(function (b) { downloadBlob(b, fname); }); });
    }

    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    document.getElementById("sw-close").addEventListener("click", close);
    document.addEventListener("keydown", escClose);
    var copyBtn = document.getElementById("sw-copy");
    copyBtn.addEventListener("click", function () {
      var payload = text + " " + url;
      (navigator.clipboard ? navigator.clipboard.writeText(payload) : Promise.reject()).then(
        function () { copyBtn.textContent = "✓ Copied"; setTimeout(function () { copyBtn.textContent = "🔗 Copy link"; }, 1400); },
        function () { window.prompt("Copy this:", payload); });
    });
    var nb = document.getElementById("sw-native");
    if (nb) nb.addEventListener("click", function () { navigator.share({ title: title, text: text, url: url }).catch(function () {}); });
  }
  function escClose(e) { if (e.key === "Escape") close(); }
  function close() {
    var ov = document.getElementById("sw-overlay");
    if (ov) ov.remove();
    document.removeEventListener("keydown", escClose);
  }

  function button(opts) {
    injectCSS();
    var b = document.createElement("button");
    b.className = "sw-btn"; b.type = "button";
    b.innerHTML = "🔗 " + esc((opts && opts.label) || "Share");
    b.addEventListener("click", function () { open(opts); });
    return b;
  }

  g.ShareWidget = { open: open, button: button, close: close, TARGETS: TARGETS };
})(typeof window !== "undefined" ? window : this);
