#!/bin/bash
# Preview the all-India buildings PMTiles LOCALLY — free, from your WD drive, no cloud.
# Starts two local servers: pmtiles (the 41 GB archive, ranges+CORS) + the atlas.
# Run after the download completes. Ctrl-C stops both.
set -e
PMFILE="/Volumes/Game Drive/india-buildings.pmtiles"
ATLAS_DIR="/Users/sinhaankur/Documents/GitHub/india-fiscal-map"

[ -f "$PMFILE" ] || { echo "❌ file not found: $PMFILE"; exit 1; }
SZ=$(/bin/ls -la "$PMFILE" | /usr/bin/awk '{printf "%.1f", $5/1073741824}')
echo "→ PMTiles: $PMFILE (${SZ} GB)"

# 1) serve the RAW PMTiles archive (ranges + CORS) on :8090 — the atlas reader
#    (protomaps-leaflet) range-reads the .pmtiles file itself, so serve the RAW file,
#    NOT `pmtiles serve` (which proxies z/x/y tiles). Matches how R2/WatchTower will serve it.
echo "→ starting raw PMTiles range-server on :8090 …"
node "$ATLAS_DIR/serve-pmtiles-raw.mjs" "/Volumes/Game Drive" 8090 >/tmp/pmtiles_serve.log 2>&1 &
PM_PID=$!

# 2) serve the atlas on :8000
echo "→ starting atlas server on :8000 …"
( cd "$ATLAS_DIR" && python3 -m http.server 8000 >/tmp/atlas_serve.log 2>&1 ) &
ATLAS_PID=$!

sleep 2
echo ""
echo "✅ Open the atlas with the buildings wired in:"
echo ""
echo "   http://localhost:8000/india-3d.html?buildings_pmtiles=http://localhost:8090/india-buildings.pmtiles"
echo ""
echo "   → drop to street level (zoom in) → click '🏙 all-India buildings'."
echo "   (if the pmtiles URL 404s, check /tmp/pmtiles_serve.log for the exact tile path it prints)"
echo ""
echo "Ctrl-C to stop both servers."
trap "kill $PM_PID $ATLAS_PID 2>/dev/null; echo; echo 'stopped.'; exit 0" INT
wait
