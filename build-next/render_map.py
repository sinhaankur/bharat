#!/usr/bin/env python3
"""
render_map.py — rebuild the classic India fiscal map (classic.html) inside the new design.

classic.html's interactive Leaflet map is driven by app.js + a set of helper scripts, all
tightly coupled to its #map DOM. Rather than re-implement that mature engine, we lift its
<section id="map"> DOM + the scripts it needs, and let the generator host them inside OUR
chrome (shellbare: the matching dark bronze/gold header/footer, 15-skins, WebGL) — so the
map lives "inside the new design" with the tile-free Plain base, rebuilt clean.

Exposes:  map_body()        -> the #map section HTML (the map + panels)
          MAP_SCRIPTS       -> the <script>/<link> deps to inject + files to copy
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
R = os.environ.get("BHARAT_REPO", "..") + "/"

# the scripts classic.html loads for the map, in order (minus the site chrome ones we replace)
MAP_SCRIPTS = [
    "vendor/leaflet/leaflet.js", "dem.js", "map-layers.js", "map-ui.js",
    "time-scrubber.js", "event-heatmap.js", "coverage.js", "query-engine.js",
    "vulnerability.js", "accountability-arc.js", "stats-bar.js", "app.js",
]
MAP_VENDOR_CSS = ["vendor/leaflet/leaflet.css"]
# data + assets the map fetches at runtime (copied so it works under next/)
MAP_DATA = [
    "district-ledger.json", "india-fiscal.json", "india-states.geojson",
    "india-rivers.geojson", "district-pop.json", "district-centroids.json",
    "safety.json", "officials.json", "coverage.json", "india-extras.json",
    "news-feed.json",
]


def map_body():
    """Return classic.html's <section id="map"> … </section> (the map + control panel)."""
    h = open(R + "classic.html", encoding="utf-8").read()
    m = re.search(r"(<section id=\"map\".*?</section>)", h, re.S)
    sec = m.group(1) if m else '<p>Map unavailable.</p>'
    # also pull classic's own inline polish <style> so the panels look right
    st = re.search(r"<style>(.*?)</style>", h, re.S)
    style = f"<style>{st.group(1)}</style>" if st else ""
    return style + '<div class="map-rebuild">' + sec + "</div>"


def copy_map_deps(out_dir, repo_dir):
    """Copy the map's scripts, vendor css/js and data files into the output so it runs."""
    import shutil
    def cp(rel):
        src = os.path.join(repo_dir, rel)
        if os.path.exists(src):
            dst = os.path.join(out_dir, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy(src, dst)
            return True
        return False
    done = 0
    for f in MAP_SCRIPTS + MAP_VENDOR_CSS + MAP_DATA:
        if cp(f):
            done += 1
    # styles.css (the classic map panels reference its tokens/components)
    cp("styles.css")
    return done


def map_head_links():
    """The <link>/<script defer> the map page needs in <head> + before </body>."""
    css = "".join(f'<link rel="stylesheet" href="{c}">' for c in MAP_VENDOR_CSS)
    css += '<link rel="stylesheet" href="styles.css">'
    js = "".join(f'<script src="{s}"></script>' for s in MAP_SCRIPTS)
    return css, js


if __name__ == "__main__":
    b = map_body()
    print("map body:", len(b), "chars · has #india-map:", 'id="india-map"' in b)
    print("deps:", len(MAP_SCRIPTS), "scripts +", len(MAP_DATA), "data files")
