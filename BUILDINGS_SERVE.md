# Serving the all-India buildings — the setup guide

You're downloading the ready-made all-India building tiles
(`india-buildings.pmtiles`, **~41.6 GB**, VIDA Google-Microsoft Open Buildings, **ODbL**) to
your WD drive. This is the guide to actually *serve* and *view* them in the atlas — three
paths, from "explore it locally today, free" to "put it online". No path re-processes the
data; it's one file, streamed.

**How it works:** the atlas reads the file via **HTTP range requests** — the browser fetches
only the few KB of tiles in the current view, never the whole 41 GB. So any static server that
supports **range requests + CORS** works. That's the only requirement.

The atlas is already wired: point it at the file with
`india-3d.html?buildings_pmtiles=<URL>` (or set `window.INDIA_BUILDINGS_PMTILES`), then use the
**🏙 all-India buildings** button in the drop-to-street fly-down. The URL is never hardcoded.

---

## Path 1 — Local, on this laptop (free, do this first to explore)

The `pmtiles` CLI (already installed) has a server with ranges + CORS built in.

```sh
# serve the file from the WD drive on port 8090
pmtiles serve "/Volumes/Game Drive" --cors="*" --port 8090
#   → the archive is at:  http://localhost:8090/india-buildings.pmtiles
```

Then open the atlas locally pointing at it:
```
http://localhost:<atlas-port>/india-3d.html?buildings_pmtiles=http://localhost:8090/india-buildings.pmtiles
```
Drop to street level → **🏙 all-India buildings**. Streams from your own drive. **Zero cost.**

> Note: `pmtiles serve` exposes each `.pmtiles` under a tile path; if the raw-file URL above
> doesn't load, use `pmtiles serve`'s printed URL, or serve the folder with any static server
> that does ranges (see Path 2's Caddy line).

---

## Path 2 — Your own Linux device (free, your hardware) — incl. WatchTower

Your idea: use your Linux box as the server (via WatchTower or your network). Great long-term
— no monthly cost. Steps on the Linux box:

1. **Get the file there** — copy `india-buildings.pmtiles` from the WD drive, or download it
   straight to the Linux box:
   ```sh
   curl -L -C - -o india-buildings.pmtiles \
     "https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/by_country/country_iso=IND/IND.pmtiles"
   ```
2. **Serve it with ranges + CORS.** Easiest is Caddy (auto ranges, CORS, and HTTPS):
   ```sh
   # /path/to/dir holds india-buildings.pmtiles
   caddy file-server --root /path/to/dir --listen :8080 --browse
   # add CORS: put a Caddyfile with `header Access-Control-Allow-Origin *`
   ```
   Or `pmtiles serve /path/to/dir --cors="*" --port 8080`.
3. **Make it reachable from the browser:**
   - **Same Wi-Fi:** use the box's LAN IP → `http://192.168.x.x:8080/india-buildings.pmtiles`.
   - **From anywhere / the live https site:** you need an **https** URL. Free options:
     - **Cloudflare Tunnel** (`cloudflared tunnel --url http://localhost:8080`) → a public
       `https://…trycloudflare.com` URL, no port-forwarding.
     - Or whatever public https address **WatchTower** exposes for that device.
4. Point the atlas at that URL (`?buildings_pmtiles=https://…/india-buildings.pmtiles`).

> **The https rule:** the live GitHub-Pages atlas is `https://`; browsers block it from fetching
> an `http://` server (mixed content). Local testing over `http://localhost` is fine; a public
> deployment needs the Linux server behind **https** (Cloudflare Tunnel or WatchTower's https).

**Trade-off to know:** self-hosting means the buildings only load when your Linux box is on and
reachable. Fine for personal use / demos; for always-on public serving, Path 3.

---

## Path 3 — Cloud object storage (always-on, ~cents/month)

For the buildings to work on the public site with nothing of yours running:

| Host | Storage | Egress | ~Cost for 41 GB |
|---|---|---|---|
| **Cloudflare R2** | 10 GB free, then $0.015/GB·mo | **free** | **~$0.62/mo**, unlimited serving |
| **Backblaze B2 + Cloudflare** | 10 GB free, then $0.006/GB·mo | free via CF | **~$0.25/mo** (cheapest) |
| Internet Archive / HF datasets | large, free | free | free but not ideal for fast range-serving |

Steps (R2): create a bucket → `rclone`/dashboard upload `india-buildings.pmtiles` → enable a
public URL / custom domain → **enable CORS** on the bucket (allow your site's origin) → point
the atlas at the public URL. R2's **free egress** is the win: serving costs nothing regardless
of traffic. (There is no clean, free, always-on 100 GB serving host — "free 100 GB" options
either throttle, block hotlinking, or aren't built for range requests. B2+Cloudflare at ~25¢/mo
is the honest cheapest.)

---

## Attribution (required — ODbL)

Wherever it's served, keep the credit (the reader already adds it):
**"© Google, © Microsoft, VIDA — Open Buildings, ODbL"**. ODbL also means share-alike if you
redistribute derived data.

## Recommended sequence

1. **Finish the download** to the WD drive (resumable — `curl -C -`).
2. **Path 1** — serve locally, explore how all-India buildings look/feel in the atlas. Free, today.
3. If you love it → **Path 2** (your Linux/WatchTower, free) for personal/always-your-hardware,
   or **Path 3** (R2/B2, ~cents) for always-on public.

Everything above is verified against the live data (41.6 GB, ODbL, HTTP 200) as of 2026-07-28.
