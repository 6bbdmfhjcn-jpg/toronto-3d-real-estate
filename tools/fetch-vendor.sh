#!/usr/bin/env bash
# Fetch the vendor libraries the site expects (not tracked in git).
set -euo pipefail
mkdir -p vendor
curl -sL -o vendor/d3.min.js https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js
curl -sL -o vendor/topojson-client.min.js https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js
curl -sL -o vendor/land-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json
echo "vendor/ ready"
