// Cover B · realistic exploded view of the theme atom — a mid-rise transit-corridor condominium.
// Geometry engine shared with cover-wire.js (C) via window.COVER_GEO.
// Axonometric: pt(x,y,z) → { cx+rx·u, cy+ry·u·0.5 − z·u }, z lifts.
(function () {
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Layer definitions (unit space; u = px/unit at draw time) ──
  // Thesis per layer = label. The hardest constraint carries the only semantic red.
  const LAYERS = [
    { id: "parking", w: 26, d: 14, h: 3.4, mat: "concrete",
      head: "UNDERGROUND PARKING", sub: "Two levels below grade — the hardest cost",
      thesis: "hard", src: "K17" },
    { id: "podium", w: 26, d: 14, h: 3.6, mat: "glass",
      head: "RETAIL PODIUM", sub: "Mixed-use zoning — shops at the sidewalk",
      thesis: "ok", src: "K17" },
    { id: "slab", w: 22, d: 11, h: 15, mat: "slab",
      head: "RESIDENTIAL SLAB", sub: "Eight sellable floor plates, balconies south",
      thesis: "ok", src: "K17" },
    { id: "roof", w: 9, d: 9, h: 2.6, mat: "roof", dome: true,
      head: "ROOF & ROTUNDA", sub: "Mechanical penthouse, amenity, land value",
      thesis: "ok", src: "K17" },
  ];
  const Z0 = 0; // base z of first layer
  const GAP = 5.2; // explosion spacing per index

  // ── Shared geometry ──
  function makePt(yaw, u, cx, cy) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return (x, y, z) => {
      const rx = x * c - y * s, ry = x * s + y * c;
      return { x: cx + rx * u, y: cy + ry * u * 0.5 - z * u };
    };
  }
  window.COVER_GEO = { LAYERS, GAP, Z0, makePt };

  const canvas = document.getElementById("cover-canvas-x");
  if (!canvas) return;
  const binder = U.bindCanvas(canvas);
  let view = { w: 0, h: 0, cx: 0, cy: 0 };

  // state
  let active = false, k = REDUCE ? 1 : 0, kTgt = 1, t = 0, last = 0, raf = 0;
  let mouseX = 0.5;
  let textures = null;

  // ── pre-rendered material textures (seeded) ──
  function makeTextures() {
    const rng = U.makeRng(20260819);
    const conc = document.createElement("canvas"); conc.width = conc.height = 128;
    { const c = conc.getContext("2d");
      c.fillStyle = "#b9bec4"; c.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) { // speckle
        const v = 150 + rng() * 80 | 0;
        c.fillStyle = `rgba(${v},${v},${v + 4},${0.25 + rng() * 0.3})`;
        c.fillRect(rng() * 128, rng() * 128, 1.4, 1.4);
      }
      c.strokeStyle = "rgba(60,70,80,.18)"; // formwork seams
      for (let y = 16; y < 128; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(128, y); c.stroke(); }
    }
    const slabT = document.createElement("canvas"); slabT.width = 256; slabT.height = 128;
    { const c = slabT.getContext("2d"); // white slab elevation: window grid + balcony edges
      c.fillStyle = "#f2f4f6"; c.fillRect(0, 0, 256, 128);
      for (let fy = 0; fy < 4; fy++) for (let fx = 0; fx < 12; fx++) {
        const x = 6 + fx * 21, y = 8 + fy * 30;
        c.fillStyle = "rgba(70,90,110,.55)"; c.fillRect(x, y, 13, 16);       // window
        c.fillStyle = "rgba(5,28,44,.16)"; c.fillRect(x - 2, y + 17, 17, 2);  // balcony edge
      }
    }
    const glassT = document.createElement("canvas"); glassT.width = 256; glassT.height = 64;
    { const c = glassT.getContext("2d"); // storefront band: mullions + glazing gradient
      const g = c.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0, "#cfd9e2"); g.addColorStop(0.5, "#aebfcd"); g.addColorStop(1, "#cdd7e0");
      c.fillStyle = g; c.fillRect(0, 0, 256, 64);
      c.strokeStyle = "rgba(5,28,44,.45)"; c.lineWidth = 1.2;
      for (let x = 0; x <= 256; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 64); c.stroke(); }
      c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(0, 4, 256, 5); // canopy line
    }
    return { conc, slabT, glassT };
  }

  function lay(i) { // staggered bounce per layer
    const v = U.clamp(k * 1.55 - i * 0.17, 0, 1);
    return v;
  }
  function layerZ(i) { // current z-offset of layer i
    const breathe = REDUCE ? 0 : Math.sin(t * 1.1 + i * 1.7) * 0.12 * lay(i);
    return Z0 + LAYERS.slice(0, i).reduce((a, l) => a + l.h, 0) + lay(i) * (i * GAP + 2.2) + breathe;
  }

  // ── box painter ──
  function drawBox(ctx, pt, w, d, h, zBase, mat, opts = {}) {
    const x0 = -w / 2, y0 = -d / 2;
    const A = pt(x0, y0, zBase), B = pt(x0 + w, y0, zBase), C = pt(x0 + w, y0 + d, zBase), D = pt(x0, y0 + d, zBase);
    const A2 = pt(x0, y0, zBase + h), B2 = pt(x0 + w, y0, zBase + h), C2 = pt(x0 + w, y0 + d, zBase + h), D2 = pt(x0, y0 + d, zBase + h);
    const faces = [
      { p: [A, B, C, D], shade: 0.16, top: true },                    // bottom (rarely seen)
      { p: [A, B, B2, A2], shade: 0.30, side: "front" },              // front (y0 edge)
      { p: [B, C, C2, B2], shade: 0.42, side: "right" },              // right
      { p: [A2, B2, C2, D2], shade: 0.0, topFace: true },             // top
    ];
    for (const f of faces) {
      if (f.top) continue;
      ctx.beginPath();
      f.p.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y));
      ctx.closePath();
      if (f.topFace) {
        // angled gloss + bright bevel
        const g = ctx.createLinearGradient(A2.x, A2.y, C2.x, C2.y);
        if (mat === "concrete") g.addColorStop(0, "#cdd1d6"), g.addColorStop(1, "#b4bac1");
        else if (mat === "glass") g.addColorStop(0, "#dfe7ee"), g.addColorStop(1, "#c3d0db");
        else if (mat === "slab") g.addColorStop(0, "#eef1f4"), g.addColorStop(1, "#dde3e9");
        else g.addColorStop(0, "#d7dde3"), g.addColorStop(1, "#c2cad2");
        ctx.fillStyle = g; ctx.fill();
        ctx.save(); ctx.clip();
        if (textures && mat === "concrete") { ctx.globalAlpha = 0.5; ctx.fillStyle = ctx.createPattern(textures.conc, "repeat"); ctx.fillRect(A2.x - 10, A2.y - 10, (C2.x - A2.x) + 220, (C2.y - A2.y) + 220); ctx.globalAlpha = 1; }
        if (mat === "slab") { // rooftop parapet hint
          ctx.strokeStyle = "rgba(5,28,44,.25)"; ctx.lineWidth = 1; ctx.stroke();
        }
        // sheen sweep
        if (!REDUCE) {
          const sw = ((t * 40 + (opts.seed || 0) * 90) % 900) - 200;
          const gg = ctx.createLinearGradient(A2.x + sw, 0, A2.x + sw + 90, 0);
          gg.addColorStop(0, "rgba(255,255,255,0)"); gg.addColorStop(0.5, "rgba(255,255,255,.34)"); gg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = gg; ctx.fillRect(A2.x - 40, A2.y - 60, (C2.x - A2.x) + 300, 320);
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4; ctx.stroke(); // top bevel
      } else {
        // side: texture or volumetric shade
        ctx.fillStyle = "rgba(5,28,44,1)";
        ctx.fill();
        ctx.save(); ctx.clip();
        const top = Math.min(A2.y, B2.y, C2.y, D2.y), bot = Math.max(A.y, B.y, C.y, D.y);
        const g = ctx.createLinearGradient(0, top, 0, bot);
        g.addColorStop(0, "rgba(255,255,255,.30)"); g.addColorStop(0.45, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(5,28,44,.10)");
        let base;
        if (mat === "concrete") base = "#a9b0b8";
        else if (mat === "glass") base = "#b7c6d2";
        else if (mat === "slab") base = "#e6eaee";
        else base = "#c9d1d9";
        ctx.fillStyle = base; ctx.fillRect(-2000, top - 4, 4000, bot - top + 8);
        if (textures) {
          let pat = null, alpha = 0.8;
          if (mat === "concrete") { pat = textures.conc; alpha = 0.55; }
          if (mat === "slab" && f.side) { pat = textures.slabT; alpha = 0.95; }
          if (mat === "glass") { pat = textures.glassT; alpha = 0.95; }
          if (pat) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ctx.createPattern(pat, "repeat");
            // scale pattern to face height roughly
            ctx.fillRect(-2000, top - 4, 4000, bot - top + 8);
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = g; ctx.fillRect(-2000, top - 4, 4000, bot - top + 8);
          // ink side shade per orientation
          ctx.fillStyle = `rgba(5,28,44,${f.shade * 0.5})`; ctx.fillRect(-2000, top - 4, 4000, bot - top + 8);
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(5,28,44,.35)"; ctx.lineWidth = 1; ctx.stroke();
      }
    }
  }

  function drawDome(ctx, pt, w, d, zBase, u) {
    // the rotunda — identity detail from the site render
    const c = pt(0, 0, zBase);
    const r = w / 2 * u;
    ctx.beginPath(); ctx.ellipse(c.x, c.y, r, r * 0.5, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(c.x - r * 0.3, c.y - r * 0.28, r * 0.1, c.x, c.y, r * 1.1);
    g.addColorStop(0, "#e8edf1"); g.addColorStop(1, "#9fb0bd");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(5,28,44,.4)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(c.x, c.y, r * 0.55, r * 0.27, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(5,28,44,.22)"; ctx.stroke();
  }

  function plateShadow(ctx, pt, w, d, zBase, sep, u) {
    const c = pt(0, 0, zBase - 0.35);
    const a = U.clamp(0.12 - sep * 0.012, 0, 0.12);
    if (a <= 0.01) return;
    const r = (w * 0.72) * u * 0.5;
    ctx.beginPath(); ctx.ellipse(c.x, c.y, r * 1.6, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(5,28,44,${a})`; ctx.fill();
  }

  // ── labels ──
  function drawLabels(ctx, W, H, pt, u) {
    const colX = W - 312;
    const rows = [];
    LAYERS.forEach((L, i) => {
      const z = layerZ(i) + L.h * 0.62;
      // candidate anchors: pick rightmost projected corner
      const cands = [[L.w / 2, -L.d / 2], [L.w / 2, L.d / 2], [-L.w / 2, L.d / 2], [L.w / 2, 0]]
        .map(([x, y]) => pt(x, y, z)).sort((a, b) => b.x - a.x);
      const a = cands[0];
      let ly = a.y;
      rows.forEach(r => { if (Math.abs(r - ly) < 34) ly = r + 34; });
      rows.push(ly);
      const col = L.thesis === "hard" ? U.PAL.neg : U.PAL.ink;
      ctx.strokeStyle = L.thesis === "hard" ? "rgba(194,47,78,.6)" : "rgba(5,28,44,.35)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x + 4, a.y); ctx.lineTo(colX - 12, ly); ctx.stroke();
      ctx.beginPath(); ctx.arc(a.x, a.y, 2.2, 0, U.TAU); ctx.fillStyle = col; ctx.fill();
      const la = U.clamp((k - 0.45) * 2.4, 0, 1);
      ctx.globalAlpha = la;
      ctx.font = "700 13px Menlo, Consolas, monospace"; ctx.textAlign = "left";
      ctx.fillStyle = col;
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 4;
      ctx.strokeText(L.head, colX, ly + 4); ctx.fillText(L.head, colX, ly + 4);
      ctx.font = "italic 12px 'et-book', Palatino, Georgia, serif";
      ctx.fillStyle = U.PAL.inkMd;
      const sub = fit(ctx, L.sub, 286);
      ctx.strokeText(sub, colX, ly + 20); ctx.fillText(sub, colX, ly + 20);
      ctx.globalAlpha = 1;
    });
  }
  function fit(ctx, s, budget) { // measure-truncate, tail stripped of commas/preps
    if (ctx.measureText(s).width <= budget) return s;
    let out = s;
    while (out.length > 4 && ctx.measureText(out + " …").width > budget) out = out.slice(0, -1);
    out = out.replace(/[ ,.;:]*(the|a|an|of|to|and|for)?$/i, "");
    return out + " …";
  }

  // caption strip (switches with state)
  function drawCaption(ctx, W, H) {
    const s = k > 0.85 ? "EXPLODED · CLICK TO ASSEMBLE" : k < 0.15 ? "ASSEMBLED · CLICK TO EXPLODE" : "IN MOTION";
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right";
    ctx.fillStyle = U.PAL.inkLo;
    ctx.fillText(`FIG. B · MID-RISE CONDOMINIUM · AXONOMETRIC · ${s}`, W - 30, H - 26);
  }

  function draw() {
    const ctx = binder.ctx;
    const { w: W, h: H } = view;
    ctx.clearRect(0, 0, W, H);
    const leftBound = 0.585 * W, right = W - 332;
    let u = Math.min((right - leftBound) / 44, H * 0.0132);
    let lx = leftBound, rx = right;
    if (u < 5.6) { rx = W - 40; u = Math.min((rx - lx) / 44, H * 0.0132); }
    const cx = (lx + rx) / 2, cy = 0.60 * H;
    const yaw = Math.PI / 4 + (REDUCE ? 0 : 0.3 * Math.sin(t * 0.11)) + (mouseX - 0.5) * 0.22;
    const pt = makePt(yaw, u, cx, cy);

    // ground shadow
    const gc = pt(0, 0, -0.6);
    const gg = ctx.createRadialGradient(gc.x, gc.y, 10, gc.x, gc.y, 26 * u * 0.9);
    gg.addColorStop(0, "rgba(5,28,44,.14)"); gg.addColorStop(1, "rgba(5,28,44,0)");
    ctx.fillStyle = gg;
    ctx.save(); ctx.translate(gc.x, gc.y); ctx.scale(1, 0.42); ctx.translate(-gc.x, -gc.y);
    ctx.beginPath(); ctx.arc(gc.x, gc.y, 26 * u * 0.9, 0, U.TAU); ctx.fill(); ctx.restore();

    // layers bottom→top
    LAYERS.forEach((L, i) => {
      const z = layerZ(i);
      plateShadow(ctx, pt, L.w, L.d, z, lay(i) * (i * GAP), u);
      drawBox(ctx, pt, L.w, L.d, L.h, z, L.mat, { seed: i });
      if (L.id === "slab") { // floor coursing — reads as sellable floor plates
        ctx.strokeStyle = "rgba(5,28,44,.28)"; ctx.lineWidth = 1;
        for (let f = 1; f < 8; f++) {
          const zz = z + (L.h * f) / 8;
          const q1 = pt(-L.w / 2, -L.d / 2, zz), q2 = pt(L.w / 2, -L.d / 2, zz), q3 = pt(L.w / 2, L.d / 2, zz);
          ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y); ctx.stroke();
        }
      }
      if (L.dome) drawDome(ctx, pt, L.w * 0.9, L.d * 0.9, z + L.h, u);
    });
    drawLabels(ctx, W, H, pt, u);
    drawCaption(ctx, W, H);
  }

  function loop(ts) {
    if (!active) return;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
    t += dt;
    k = U.ease(k, kTgt, dt, 0.28);
    draw();
    raf = requestAnimationFrame(loop);
  }

  function fitAndMaybeStatic() {
    view = binder.fit();
    if (REDUCE) { k = 1; draw(); }
  }

  window.COVER_X = {
    setActive(on) {
      active = on;
      if (on) {
        // canvas may have measured 0×0 while display:none — refit, defer one frame past reflow
        requestAnimationFrame(() => { fitAndMaybeStatic(); if (!REDUCE) { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop); } });
      } else cancelAnimationFrame(raf);
    },
    toggle() { kTgt = kTgt > 0.5 ? 0 : 1; },
    get k() { return k; },
  };

  canvas.addEventListener("click", e => {
    if (e.target.closest("button,a,.chip")) return;
    window.COVER_X.toggle();
  });
  addEventListener("mousemove", e => { mouseX = e.clientX / innerWidth; });
  addEventListener("resize", () => { if (active) fitAndMaybeStatic(); });
})();
