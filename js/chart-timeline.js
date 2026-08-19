// P3 · Wall-chart timeline — GTA housing, 2017–2026. Greedy plaque layering; chart height = f(layers).
(function () {
  const host = document.getElementById("timeline-chart");
  if (!host || !window.RPT) return;
  const body = U.frame(host, {
    title: "Nine years, four regimes, one corridor that kept filling in",
    sub: "GTA HOUSING EVENTS 2017–2026 · RED FRAME = CORRECTION EVENT · BLUE DASHED = CURRENT WINDOW · CLICK A PLAQUE",
    src: "Industry & official — TRREB, Ontario, CMHC, Urbanation · K5–K10, K15, K16",
  });
  const canvas = document.createElement("canvas");
  canvas.style.display = "block"; canvas.style.width = "100%";
  body.appendChild(canvas);

  const ev = window.RPT.timeline;
  const ERAS = [
    [2017, 2020.1, "POST-FHP DIGESTION"],
    [2020.1, 2022.1, "PANDEMIC BOOM"],
    [2022.1, 2024.4, "RATE SHOCK"],
    [2024.4, 2026.0, "TARIFF-ERA TROUGH"],
    [2026.0, 2026.7, "TIGHTENING"],
  ];
  const X0 = 2016.9, X1 = 2026.75;

  // measure plaques with a probe canvas, then set height
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = "700 11px 'et-book', Palatino, Georgia, serif";
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let view, started = false, shown = REDUCE ? ev.length : 0;

  function layout(W) {
    const m = { l: 30, r: 30 };
    const X = v => m.l + (v - X0) / (X1 - X0) * (W - m.l - m.r);
    // greedy layering
    const layers = []; // per-layer right edge x
    const items = ev.map(e => {
      const w = Math.max(118, probe.measureText(e.t).width + 30);
      let cx = X(e.yr);
      cx = Math.max(6 + w / 2, Math.min(W - 6 - w / 2, cx)); // never out of bounds
      let lay = 0;
      while (layers[lay] != null && cx - w / 2 < layers[lay] + 8) lay++;
      layers[lay] = cx + w / 2;
      return { ...e, cx, w, lay };
    });
    return { items, X, nLayers: Math.max(...items.map(i => i.lay)) + 1 };
  }

  function draw() {
    const ctx = binder.ctx;
    const { w: W } = view; const H = view.h;
    ctx.clearRect(0, 0, W, H);
    const { items, X, nLayers } = layout(W);
    const axisY = H - 52;
    const layerH = 52;

    // era bands
    ctx.font = "9px Menlo, Consolas, monospace"; ctx.textAlign = "center";
    ERAS.forEach(([a, b, name], i) => {
      const xa = X(a), xb = X(b);
      ctx.fillStyle = i === ERAS.length - 1 ? "rgba(34,81,255,.06)" : (i % 2 ? "rgba(5,28,44,.025)" : "rgba(5,28,44,0)");
      ctx.fillRect(xa, 24, xb - xa, axisY - 24);
      ctx.fillStyle = U.PAL.inkLo;
      if (xb - xa > 64) ctx.fillText(name, (xa + xb) / 2, 38);
    });

    // double-line axis
    ctx.strokeStyle = U.PAL.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(X0), axisY); ctx.lineTo(X(X1), axisY); ctx.stroke();
    ctx.strokeStyle = "rgba(5,28,44,.3)";
    ctx.beginPath(); ctx.moveTo(X(X0), axisY + 4); ctx.lineTo(X(X1), axisY + 4); ctx.stroke();
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo;
    for (let y = 2017; y <= 2026; y++) { ctx.fillText(y, X(y), axisY + 22); }

    // stems first (never pierce plaque text), then plaques
    items.slice(0, shown).forEach(it => {
      const py = axisY - 26 - it.lay * layerH;
      ctx.strokeStyle = "rgba(5,28,44,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(it.cx, py + 30); ctx.lineTo(it.cx, axisY - 3); ctx.stroke();
      ctx.beginPath(); ctx.arc(it.cx, axisY, 2.6, 0, U.TAU); ctx.fillStyle = U.PAL.ink; ctx.fill();
    });
    items.slice(0, shown).forEach(it => {
      const py = axisY - 26 - it.lay * layerH - 26;
      const x0 = it.cx - it.w / 2;
      const kind = it.kind;
      ctx.fillStyle = "#fff";
      ctx.fillRect(x0, py, it.w, 44);
      ctx.lineWidth = kind === "crash" ? 1.6 : 1.2;
      ctx.strokeStyle = kind === "crash" ? U.PAL.neg : kind === "now" ? U.PAL.red : U.PAL.ink;
      ctx.setLineDash(kind === "now" ? [4, 3] : []);
      ctx.strokeRect(x0, py, it.w, 44); ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.font = "9px Menlo, Consolas, monospace"; ctx.fillStyle = kind === "crash" ? U.PAL.neg : U.PAL.inkLo;
      ctx.fillText(it.date.toUpperCase(), x0 + 8, py + 13);
      ctx.font = "700 11px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = U.PAL.ink;
      // title may wrap to one line (plaques sized to fit)
      ctx.fillText(it.t, x0 + 8, py + 30);
    });

    if (!REDUCE && shown < ev.length && started) {
      shown++;
      setTimeout(() => requestAnimationFrame(draw), 110);
    }
  }

  const binder = U.bindCanvas(canvas);
  function refit() {
    const W = canvas.getBoundingClientRect().width || 800;
    const { nLayers } = layout(W);
    canvas.style.height = (150 + nLayers * 52) + "px";
    view = binder.fit();
  }

  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const { items } = layout(view.w);
    const axisY = view.h - 52, layerH = 52;
    for (const it of items) {
      const py = axisY - 26 - it.lay * layerH - 26, x0 = it.cx - it.w / 2;
      if (mx >= x0 && mx <= x0 + it.w && my >= py && my <= py + 44) {
        U.showDrill({ title: it.date.toUpperCase() + " · " + it.t, value: "", sub: it.d, source: "Anchor " + it.src, x: e.clientX, y: e.clientY });
        return;
      }
    }
  });

  const io = new IntersectionObserver(es => es.forEach(e2 => {
    if (e2.isIntersecting && !started) { started = true; refit(); draw(); io.disconnect(); }
  }), { threshold: 0.15 });
  io.observe(canvas);
  addEventListener("resize", () => { if (started) { refit(); draw(); } });
})();
