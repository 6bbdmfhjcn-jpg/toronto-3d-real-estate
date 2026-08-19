// P1 · Theme-native iso units — the GTHA condo pipeline, in buildings.
// One slab = 2,500 condo units. Solid = actual, hollow + dashed = forecast/projection.
(function () {
  const host = document.getElementById("pipeline-chart");
  if (!host || !window.RPT) return;
  const body = U.frame(host, {
    title: "The crane count peaks this year — then the pipeline goes quiet",
    sub: "GTHA CONDOMINIUM UNITS · ONE SLAB = 2,500 UNITS · HOLLOW + DASHED = PROJECTION · CLICK A TOWER FOR BASIS",
    src: "Industry & official — Urbanation Q1-2025 survey · K9; CMHC fall 2025 · K10",
  });
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%"; canvas.style.height = "430px"; canvas.style.display = "block";
  body.appendChild(canvas);
  const binder = U.bindCanvas(canvas);
  let view = binder.fit();

  const P = window.RPT.pipeline;
  const PER = 2500;
  const towers = [
    { label: "UNDER CONSTRUCTION", sub: "Q1-2025", units: P.underConstruction.units, state: "solid", src: "K9", note: "−⅓ over two years" },
    { label: "COMPLETIONS 2024", sub: "actual", units: 29671, state: "solid", src: "K9" },
    { label: "COMPLETIONS 2025", sub: "projected", units: 31396, state: "solid", src: "K9", note: "record year" },
    { label: "COMPLETIONS 2026", sub: "projected", units: 17487, state: "hollow", src: "K9", note: "the drop-off" },
    { label: "STARTS Q1-2025", sub: "497 units", units: 497, state: "hollow", src: "K9", note: "−88% vs 10-yr avg", neg: true },
  ];
  const maxSlabs = Math.ceil(P.underConstruction.units / PER);
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let prog = REDUCE ? 1 : 0, started = false;

  // iso projection for slab stacks
  function iso(cx, baseY, u) {
    const c = Math.cos(Math.PI / 4), s = Math.sin(Math.PI / 4);
    return (x, y, z) => {
      const rx = x * c - y * s, ry = x * s + y * c;
      return { x: cx + rx * u, y: baseY + ry * u * 0.5 - z * u };
    };
  }

  function slab(ctx, pt, w, d, z, h, state, alpha) {
    const x0 = -w / 2, y0 = -d / 2;
    const A = pt(x0, y0, z), B = pt(x0 + w, y0, z), C = pt(x0 + w, y0 + d, z), D = pt(x0, y0 + d, z);
    const A2 = pt(x0, y0, z + h), B2 = pt(x0 + w, y0, z + h), C2 = pt(x0 + w, y0 + d, z + h), D2 = pt(x0, y0 + d, z + h);
    ctx.globalAlpha = Math.max(0.3, alpha);
    const faces = [
      [A, B, B2, A2, state === "solid" ? "rgba(34,81,255,.78)" : "rgba(34,81,255,.10)"],
      [B, C, C2, B2, state === "solid" ? "rgba(18,51,184,.85)" : "rgba(18,51,184,.12)"],
      [A2, B2, C2, D2, state === "solid" ? "rgba(125,155,255,.9)" : "rgba(125,155,255,.14)"],
    ];
    faces.forEach(([p, q, r, s2, fill]) => {
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.lineTo(r.x, r.y); ctx.lineTo(s2.x, s2.y); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      ctx.setLineDash(state === "hollow" ? [4, 3] : []);
      ctx.strokeStyle = state === "solid" ? "rgba(5,28,44,.55)" : "rgba(34,81,255,.75)";
      ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    });
    // balcony line identity detail on the front face
    ctx.beginPath(); ctx.moveTo((A.x + B.x) / 2 - w * 0.28, (A.y + B.y) / 2 - 1); ctx.lineTo((A.x + B.x) / 2 + w * 0.28, (A.y + B.y) / 2 - 1);
    ctx.strokeStyle = state === "solid" ? "rgba(255,255,255,.5)" : "rgba(34,81,255,.4)";
    ctx.setLineDash(state === "hollow" ? [3, 3] : []); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  const geoms = [];
  function draw() {
    const ctx = binder.ctx;
    const { w: W } = view; const H = 430;
    ctx.clearRect(0, 0, W, H);
    geoms.length = 0;
    const baseY = H - 104;
    const u = Math.min(3.4, (H - 210) / (maxSlabs * 1.9));
    const slot = W / (towers.length + 0.4);

    // ground line
    ctx.strokeStyle = "rgba(5,28,44,.4)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(20, baseY + 16); ctx.lineTo(W - 20, baseY + 16); ctx.stroke();

    towers.forEach((t, i) => {
      const cx = slot * (i + 0.75);
      const w = 15, d = 15, h = 1.9;
      const total = t.units / PER;
      const full = Math.floor(total), frac = total - full;
      const p = U.clamp(prog * 1.4 - i * 0.16, 0, 1);
      const upto = Math.floor(full * p);
      const pt = iso(cx, baseY, u);
      for (let s2 = 0; s2 < upto; s2++) slab(ctx, pt, w, d, s2 * h, h * 0.94, t.state, 1);
      if (p > 0.95 && frac > 0.02) { // fractional top slab, clipped
        ctx.save();
        slab(ctx, pt, w, d, upto * h, h * 0.94 * frac, t.state, 0.85);
        ctx.restore();
      }
      // iso drop: body extends (w+d)/2·u·0.5 below baseY → labels below baseY+isoDrop
      const isoDrop = (w + d) / 2 * u * 0.5 + 16;
      if (p > 0.5) {
        ctx.textAlign = "center";
        ctx.font = "700 15px Menlo, Consolas, monospace";
        ctx.fillStyle = t.neg ? U.PAL.neg : U.PAL.ink;
        const topY = baseY - (Math.min(upto + (frac > 0.02 ? 1 : 0), Math.ceil(total)) * h) * u - 12;
        ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4;
        const val = t.units.toLocaleString();
        const vy = Math.max(40, topY);
        ctx.strokeText(val, cx, vy); ctx.fillText(val, cx, vy);
        ctx.font = "9px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo;
        ctx.strokeText("UNITS", cx, vy + 13); ctx.fillText("UNITS", cx, vy + 13);
        ctx.font = "700 10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink;
        ctx.fillText(t.label, cx, baseY + isoDrop + 6);
        ctx.font = "italic 11px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = t.neg ? U.PAL.neg : U.PAL.inkMd;
        ctx.fillText(t.note || t.sub, cx, baseY + isoDrop + 22);
      }
      geoms.push({ x0: cx - slot * 0.4, x1: cx + slot * 0.4, t });
    });

    if (!REDUCE && prog < 1 && started) { prog = Math.min(1, prog + 0.018); requestAnimationFrame(draw); }
  }

  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    for (const g of geoms) {
      if (mx >= g.x0 && mx <= g.x1) {
        const t = g.t;
        U.showDrill({
          title: t.label,
          value: t.units.toLocaleString() + " units",
          sub: t.state === "hollow" ? "Projection — drawn hollow, not a forecast promise. " + (t.note || "") : (t.note || "As surveyed"),
          source: "Urbanation / CMHC · anchor " + t.src, x: e.clientX, y: e.clientY,
        });
        return;
      }
    }
  });

  const io = new IntersectionObserver(es => es.forEach(e2 => {
    if (e2.isIntersecting && !started) { started = true; view = binder.fit(); draw(); io.disconnect(); }
  }), { threshold: 0.2 });
  io.observe(canvas);
  addEventListener("resize", () => { view = binder.fit(); if (started) draw(); });
})();
