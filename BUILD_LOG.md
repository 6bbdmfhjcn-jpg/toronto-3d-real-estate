# BUILD LOG · The Corridor Study (Toronto real-estate interactive report)

## V1 — full build, 2026-08-19
**Goal**: Turn a user-supplied oblique aerial capture (photorealistically re-rendered) into a McKinsey-grade interactive location study of a North Toronto transit-corridor node, with the 2025–26 GTA market as context.

**Key decisions**
- Theme atom: the mid-rise corridor condominium. Cover A = infinite city-block recursion; B = exploded condo (parking / podium / slab / roof+rotunda); C = blueprint wireframe of B.
- Signature charts: P23 band readout (annual avg price vs 2015–25 mean), P11 paired bars (2026 sales vs listings, SNLR star), P3 wall timeline (2017–2026), P1 iso slab towers (GTHA condo pipeline, 1 slab = 2,500 units), P18 verdict scale (stabilization vs supply cliff), P14 persistent rail.
- Data: TRREB monthly/annual releases (as originally reported, pre-2024-boundary vintage flagged), CMHC rental fall 2025, Urbanation Q1-2025, WOWA ratio calcs. All anchors dated in js/sources.js (K1–K17).
- Site imagery labelled as a representative-node type study, not a specific-address appraisal (K17).

**Files**: index.html + css/ + js/ (13 modules) + vendor/ + assets/ · tools/bundle.py → dist-single.html (image inlined as data URI).

**Validation**
- node --check: 13/13 pass.
- Playwright dual-width 1680/1280 slow-scroll: 0 pageerrors, 0 console errors, 0 horizontal overflow; document.fonts.check('16px et-book') = true.
- Single-file opens over file:// with 0 errors.
- Fix rounds: cover-A text wash strengthened; band-chart x-label bug fixed; paired-chart year-ago reference repositioned; timeline plaques clamped in-bounds; verdict triggers moved above bull pan + plaque off the falsification seal; cover-B plate shadows shrunk + floor coursing added; pipeline label clamps raised.

**Residual risks**
- 2024 annual sales are derived from TRREB's stated −11.2% (flagged in sources K8).
- Cover B materials are stylized-realistic; under heavy zoom the slab texture is suggestive, not literal.
- Rail globe omitted (corridor scale is municipal); phase bar + price curve carry the context.

## Delivery
- Multi-file site: `index.html` at project root.
- Single-file: `dist-single.html`.
- GitHub: repo `toronto-3d-real-estate` (public), Pages-ready index.html at root.
