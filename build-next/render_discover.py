#!/usr/bin/env python3
"""
render_discover.py — pre-render the "Discover Bharat, one state at a time" page to STATIC
HTML (no React / no canvas runtime), from the DATA object inside canvas/States.dc.html.

The canvas original drove a per-state panel with {{ cur.* }} bindings via a React runtime.
We parse its DATA (clean JSON: 36 states, each with people/kingdoms/sites/… rows), pre-render
every state's panel in Python, and ship a tiny vanilla-JS switcher that shows the chosen
state (map click or list). No framework. Honesty chips preserved (gap = dashed amber).

Exposes:  discover_body()  → the full page content HTML for gen.py's shellbare().
"""
import os, re, json, html as _html

HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
e = lambda s: _html.escape(str(s if s is not None else ""), quote=True)

# which canvas pages are ALREADY emitted as real pages (so a link to them is valid). As
# Phases 3–4 land the tribes/kingdoms, add their slugs here. Until then, links to not-yet-
# imported canvas pages are rendered as plain text (no dead href).
_LIVE_TARGETS = {"discover.html", "tribes.html", "index.html"}

def _route(href):
    """Rewrite a canvas .dc.html href → our page, or '' if that page isn't built yet."""
    if not href or not isinstance(href, str):
        return ""
    if href.startswith("http") or href.endswith(".html") and ".dc." not in href:
        return href
    name = href[:-8] if href.endswith(".dc.html") else href
    if name == "Main":
        return "index.html"
    if name in ("States",): return "discover.html"
    if name == "Tribes": return "tribes.html"
    if name.startswith("Tribe-"): tgt = "tribe-" + name[6:].lower() + ".html"
    elif name == "Kingdoms": tgt = "kingdoms.html"
    elif name.startswith("Region-"): tgt = "region-" + name[7:].lower() + ".html"
    elif name.startswith("Skin-"): tgt = "skin-" + name[5:].lower() + ".html"
    else: tgt = name.lower() + ".html"
    return tgt if tgt in _LIVE_TARGETS else ""   # only link if the page exists


def _load_data():
    doc = open(HERE + "canvas/States.dc.html", encoding="utf-8").read()
    m = re.search(r"const DATA\s*=\s*(\{.*?\});", doc, re.S)
    if not m:
        return {}
    return json.loads(m.group(1))


def _chip(label, gap=False):
    if gap:
        return f'<span style="display:inline-block;font:500 11px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:#e6a35a;border:1px dashed #e6a35a;border-radius:999px;padding:2px 9px">{e(label)}</span>'
    return f'<span style="display:inline-block;font:500 11px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:#9fd0ae;border:1px solid rgba(159,208,174,.5);border-radius:999px;padding:2px 9px">{e(label)}</span>'


def _community(r):
    """One 'people who were here first' entry: a card, gap-dashed if not sourced."""
    name = e(r.get("name", ""))
    label = e(r.get("label", ""))
    col = r.get("col", "#e4c069")
    dashed = r.get("bd") == "dashed" or r.get("plain")
    href = _route(r.get("href") or "")
    border = f"1px {'dashed' if dashed else 'solid'} {('rgba(201,162,39,.4)' if not dashed else '#e6a35a')}"
    linked = href and r.get("link")
    inner = (f'<a href="{e(href)}" style="text-decoration:none;color:inherit">' if linked else "<div>") \
        + f'<b style="display:block;font:500 15px var(--sans);color:var(--ink)">{name}</b>' \
        + f'<span style="font-size:12.5px;color:var(--soft);line-height:1.4">{label}</span>' \
        + ("</a>" if linked else "</div>")
    return f'<div style="border:{border};border-radius:6px;padding:10px 12px;border-left:3px solid {e(col)}">{inner}</div>'


def _rowlist(rows, kind):
    """A generic sourced-row list (kingdoms, sites, powers)."""
    out = []
    for r in rows:
        name = e(r.get("name") or r.get("t") or "")
        extra = e(r.get("fate") or r.get("what") or r.get("seat") or r.get("status") or "")
        href = _route(r.get("href") or (r.get("link") if isinstance(r.get("link"), str) else ""))
        a = f'<a href="{e(href)}" style="color:var(--gold)">{name}</a>' if href else f'<b style="color:var(--ink)">{name}</b>'
        out.append(f'<div style="padding:7px 0;border-bottom:1px solid var(--hair);font-size:14px">{a}'
                   + (f' <span style="color:var(--soft)">· {extra}</span>' if extra else "") + "</div>")
    return "".join(out) or f'<p style="color:var(--soft);font-size:14px">No {kind} sourced yet — <span style="color:#e6a35a">a gap</span>.</p>'


def _state_panel(sid, s):
    name = e(s.get("name", ""))
    share = e(s.get("share", ""))
    sharenote = e(s.get("sharenote", ""))
    # headline tiles for the state
    tiles = [
        (s.get("share", "—"), "ST share of population", s.get("sharegap")),
        (s.get("ntribes", "0"), "tribe entries listed", False),
        (s.get("nsites", "0"), "heritage sites", False),
        (s.get("ndyn", "0"), "dynasties / powers", False),
    ]
    tilehtml = "".join(
        f'<div><b style="display:block;font:500 30px var(--display);color:var(--ink);line-height:1">{e(v)}</b>'
        f'<span style="font-size:12px;color:var(--soft)">{e(l)}</span>'
        + (f' {_chip("gap", True)}' if g else "") + "</div>"
        for v, l, g in tiles)

    communities = "".join(_community(r) for r in (s.get("rows") or []))
    comm_block = (f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:14px">{communities}</div>'
                  if communities else f'<p style="color:var(--soft)">No communities sourced yet — <span style="color:#e6a35a">a gap</span>.</p>')

    kings = _rowlist(s.get("kings") or [], "kingdoms")
    sites = _rowlist(s.get("sites") or [], "heritage sites")
    powers = _rowlist(s.get("pv") or [], "regional powers")

    return f'''<div class="st-panel" data-state="{sid}" style="display:none">
      <h2 style="font:500 clamp(28px,3.6vw,42px)/1.08 var(--display);letter-spacing:-.02em;color:var(--ink);margin:0">{name}</h2>
      <p style="font-size:13px;color:var(--soft);margin:6px 0 0">{share} ST population · {sharenote}</p>
      <div style="display:flex;flex-wrap:wrap;gap:26px;margin:20px 0 26px">{tilehtml}</div>
      <h3 style="font:500 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gilt);margin:0 0 4px">1 · The people who were here first</h3>
      {comm_block}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:28px">
        <div><h3 style="font:500 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gilt);margin:0 0 8px">2 · Kingdoms that rose</h3>{kings}</div>
        <div><h3 style="font:500 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gilt);margin:0 0 8px">3 · What still stands</h3>{sites}</div>
      </div>
      <div style="margin-top:24px"><h3 style="font:500 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gilt);margin:0 0 8px">Regional powers</h3>{powers}</div>
    </div>'''


def discover_body():
    data = _load_data()
    states = sorted(data.items(), key=lambda kv: kv[1].get("name", ""))
    # the state picker (a simple sourced list; the map stays as a decorative SVG from the canvas)
    picker = "".join(
        f'<button type="button" class="st-pick" data-state="{sid}" '
        f'style="text-align:left;background:none;border:1px solid var(--line);border-radius:6px;padding:9px 12px;color:var(--ink);font:500 14px var(--sans);cursor:pointer">{e(s.get("name",""))}'
        f'<span style="display:block;font:500 11px var(--mono);color:var(--soft)">{e(s.get("ntribes","0"))} communities · {e(s.get("nsites","0"))} sites</span></button>'
        for sid, s in states)
    panels = "".join(_state_panel(sid, s) for sid, s in states)
    first = states[0][0] if states else "s0"

    return f'''<section class="b"><div class="wrap">
      <p class="sub" data-r>Discover · state by state</p>
      <div style="display:grid;grid-template-columns:300px 1fr;gap:34px;align-items:start" class="st-grid">
        <div style="position:sticky;top:84px">
          <p style="font:500 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--soft);margin:0 0 10px">Choose a state</p>
          <div style="display:grid;gap:7px;max-height:72vh;overflow:auto">{picker}</div>
        </div>
        <div id="st-detail">{panels}</div>
      </div>
    </div></section>
    <style>@media(max-width:820px){{.st-grid{{grid-template-columns:1fr !important}}.st-grid>div:first-child{{position:static !important}}}}</style>
    <script>(function(){{
      var panels=document.querySelectorAll('.st-panel'),picks=document.querySelectorAll('.st-pick');
      function show(id){{panels.forEach(function(p){{p.style.display=p.dataset.state===id?'block':'none'}});
        picks.forEach(function(b){{var on=b.dataset.state===id;b.style.borderColor=on?'var(--gold)':'var(--line)';b.style.color=on?'var(--gold)':'var(--ink)'}});}}
      picks.forEach(function(b){{b.addEventListener('click',function(){{show(b.dataset.state)}})}});
      show('{first}');
    }})();</script>'''


def _tribes_india_data():
    doc = open(HERE + "canvas/Tribes-India.dc.html", encoding="utf-8").read()
    m = re.search(r"data\s*=\s*(\[\{.*?\}\]);", doc, re.S) or re.search(r"data\s*=\s*(\[.*?\])\s*[;\n]", doc, re.S)
    return json.loads(m.group(1)) if m else []


def tribes_india_body():
    """Pre-render the 'every listed tribe' index (727 entries across states) to static HTML
    + a tiny vanilla search filter. No React."""
    groups = _tribes_india_data()
    total = sum(g.get("n", len(g.get("items", []))) for g in groups)
    cards = []
    for g in groups:
        st = e(g.get("state", ""))
        items = g.get("items", [])
        lis = "".join(f'<li data-k="{e(it.lower())}" style="padding:4px 0;border-bottom:1px solid var(--hair);font-size:13.5px;color:var(--soft)">{e(it)}</li>' for it in items)
        cards.append(
            f'<section class="tig" data-state="{st.lower()}" data-r style="break-inside:avoid;margin-bottom:22px">'
            f'<h3 style="font:500 16px var(--display);color:var(--ink);margin:0 0 4px">{st} '
            f'<span style="font:500 11px var(--mono);color:var(--gilt)">{len(items)}</span></h3>'
            f'<ul style="list-style:none;margin:0;padding:0">{lis}</ul></section>')
    grid = '<div class="ti-grid" style="column-width:260px;column-gap:28px">' + "".join(cards) + "</div>"
    return f'''<section class="b"><div class="wrap">
      <p class="sub" data-r>Every listed tribe · {total} entries across {len(groups)} states</p>
      <input id="ti-q" type="search" placeholder="Search a community or state — for example Gond, Bhil, or Odisha"
        aria-label="Search the tribe list"
        style="width:min(560px,100%);min-height:48px;padding:0 18px;border-radius:24px;border:1px solid var(--line);background:var(--panel-80);color:var(--ink);font:16px var(--sans);margin:4px 0 22px">
      <p id="ti-count" class="note" data-r></p>
      {grid}
    </div></section>
    <script>(function(){{
      var q=document.getElementById('ti-q'),secs=document.querySelectorAll('.tig'),cnt=document.getElementById('ti-count');
      function run(){{var v=q.value.trim().toLowerCase(),shown=0,items=0;
        secs.forEach(function(s){{var any=false;s.querySelectorAll('li').forEach(function(li){{var ok=!v||li.dataset.k.indexOf(v)>-1||s.dataset.state.indexOf(v)>-1;li.style.display=ok?'':'none';if(ok){{any=true;items++}}}});s.style.display=any?'':'none';if(any)shown++}});
        cnt.textContent=v?(items+' communities in '+shown+' states match "'+v+'"'):'';}}
      q.addEventListener('input',run);
    }})();</script>'''


def _kingdoms_rows():
    doc = open(HERE + "canvas/Kingdoms.dc.html", encoding="utf-8").read()
    m = re.search(r"rows\s*=\s*(\[\{.*?\}\])\s*[;,]", doc, re.S)
    return json.loads(m.group(1)) if m else []


def kingdoms_body():
    """Pre-render the princely-state flags + 'how long each one lasted' timeline (static).
    Each row: a drawn flag (the bg gradient), its name + fate, and a lifespan bar."""
    rows = _kingdoms_rows()
    # the flag wall
    flags = "".join(
        f'<figure style="margin:0">'
        f'<div style="height:66px;border-radius:4px;border:1px solid var(--line);background:{r.get("bg","#333")}"></div>'
        f'<figcaption style="margin-top:8px"><b style="display:block;font:500 15px var(--sans);color:var(--ink)">{e(r.get("name",""))}</b>'
        f'<span style="font-size:12px;color:var(--soft)">{e(r.get("fate",""))}</span></figcaption></figure>'
        for r in rows)
    flagwall = f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px">{flags}</div>'
    # the lifespan timeline (each row a bar positioned left/width %)
    bars = "".join(
        f'<div style="display:grid;grid-template-columns:150px 1fr;gap:14px;align-items:center;padding:7px 0;border-bottom:1px solid var(--hair)">'
        f'<div style="font-size:13.5px;color:var(--ink);font-weight:500">{e(r.get("name",""))}</div>'
        f'<div style="position:relative;height:14px;background:var(--hair);border-radius:7px">'
        f'<div style="position:absolute;left:{e(r.get("left","0%"))};width:{e(r.get("width","0%"))};top:0;bottom:0;background:linear-gradient(90deg,var(--gilt),var(--gold));border-radius:7px"></div>'
        + (f'<div style="position:absolute;left:{e(r.get("endleft","0%"))};top:-3px;width:3px;height:20px;background:{e(r.get("endcol","#9fd0ae"))};border-radius:2px"></div>' if r.get("endcol") else "")
        + "</div></div>"
        for r in rows)
    timeline = f'<div style="margin-top:14px">{bars}</div>'
    return f'''<section class="b"><div class="wrap">
      <p class="sub" data-r>Kingdoms · standards sourced from written description</p>
      <p class="p" data-r style="max-width:62ch">Each flag is drawn from a written description. Where a description is sourced, the frame is left empty. Shades are representative; the sources name colours, not their hex.</p>
      {flagwall}
      <h2 data-r style="margin-top:46px">How long each one <em>lasted</em></h2>
      <p class="note" data-r style="max-width:62ch">Every bar is woven in its flag's colours, from founding to the year it joined India or fell. Most kept their thrones through the Mughal centuries and under British paramountcy, until 1947 to 1950.</p>
      {timeline}
    </div></section>'''


if __name__ == "__main__":
    body = discover_body()
    print("discover body:", len(body), "chars")
    import re as _re
    print("state panels:", len(_re.findall(r'class="st-panel"', body)))
    print("has {{ leftover?:", "{{" in body)
    tib = tribes_india_body()
    print("tribes-india body:", len(tib), "chars · groups:", len(_re.findall(r'class="tig"', tib)), "· {{ leftover?:", "{{" in tib)
