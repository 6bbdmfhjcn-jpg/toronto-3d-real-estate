# The Corridor Study — Toronto real estate, from one block up

An interactive, editorial-grade research report built from a **photorealistic re-render of a Google Earth aerial capture** of a North Toronto transit-corridor node, wired to the 2025–26 GTA market data underneath it.

**Live preview**: deployed from this repo's root `index.html`.

## Run it

The site is zero-build vanilla JS. Two asset groups are not tracked in git (size/licensing):

```bash
# 1. vendor libraries (d3, topojson, land-110m)
bash tools/fetch-vendor.sh

# 2. ET Book webfont: copy css/fonts.css from the interactive-research-report skill assets,
#    or drop any base64-inlined et-book fonts.css into css/

# 3. the site render: any oblique aerial JPEG → assets/site-render.jpg
#    (index.html falls back to a hosted copy via onerror if the file is absent)

python3 -m http.server 8080   # open http://localhost:8080
```

`tools/bundle.py` produces a fully self-contained single-file edition (`dist-single.html`, opens over `file://`).

## What's inside

- **Three-state animated cover** — the mid-rise condominium as theme atom: A infinite city-block recursion · B exploded axonometric (parking / podium / slab / roof+rotunda) · C blueprint wireframe
- **Signature charts** — band readout (price vs 2015–25 mean), paired bars (2026 sales vs listings), wall timeline (2017–2026), iso slab towers (GTHA condo pipeline, 1 slab = 2,500 units), verdict scale (stabilization vs supply cliff)
- **Persistent right-rail dashboard**, drill-down on every number, dated source register (K1–K17)

## Data discipline

All figures as originally reported by TRREB / CMHC / Urbanation, each with a dated anchor in `js/sources.js`. 2024 annual sales are derived (flagged). The site imagery is a representative-node **type study**, not a specific-address appraisal. No investment advice.

Compiled 2026-08-19.
