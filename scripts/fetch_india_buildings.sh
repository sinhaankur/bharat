#!/bin/bash
# Download the ready-made all-India building PMTiles (VIDA Google-Microsoft Open Buildings,
# ODbL) to an external drive. It's ~38.7 GB — resumable (curl -C -), so a dropped connection
# just resumes. Pass the destination dir (your external drive) as $1.
set -e
DEST="${1:?Usage: ./fetch_india_buildings.sh /Volumes/YourDrive}"
URL="https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/by_country/country_iso=IND/IND.pmtiles"
OUT="$DEST/india-buildings.pmtiles"

echo "→ Destination: $OUT"
df -H "$DEST" | tail -1 | awk '{print "  drive free:", $4, "of", $2}'
echo "→ Source (~38.7 GB, ODbL — © Google, © Microsoft, VIDA):"
echo "  $URL"
echo "→ Resumable (curl -C -). Ctrl-C to pause; re-run to resume."
echo ""
curl -L --fail -C - -o "$OUT" "$URL" \
  --retry 5 --retry-delay 5 --retry-all-errors \
  -w '\n✓ done — %{size_download} bytes in %{time_total}s\n'
echo ""
echo "→ Verify:"
pmtiles show "$OUT" 2>/dev/null | head -20 || echo "  (run: pmtiles show $OUT)"
