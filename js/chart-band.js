// P23 · Band readout — GTA annual average price vs its 2015–25 mean band.
// One chart answers: how much, vs the mean, where the historical range is.
(function () {
  const host = document.getElementById("band-chart");
  if (!host || !window.RPT) return;
  const body = U.frame(host, {
    title: "Back at the decade mean — the premium is out of the price",
    sub: "ANNUAL AVERAGE SELLING PRICE, GTA · $ CAD · MEAN & ±1σ OF 2015–2025 · CLICK A POINT FOR ITS SOURCE",
    src: "Industry & official — TRREB historic annual statistics & year-end releases (2015–2025), Jul 2026 release · K1/K5–K8",
  });
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%"; canvas.style.height = "430px"; canvas.style.display = "block";
  body.appendChild(canvas);
  const binder = U.bindCanvas(canvas);
  let view = binder.fit();

  const series = window.RPT.annual.map(d => ({ x: d.yr, y: d.avg, src: d.src, label: String(d.yr) }));
  const now = { x: 2026.55, y: window.RPT.ytd2026.avg, src: "K1", label: "JUL 2026" };
  const mean = series.reduce((a, d) => a + d.y, 0) / series.length;
  const sd = Math.sqrt(series.reduce((a, d) => a + (d.y - mean) ** 2, 0) / series.length);
  const pct = (now.y - mean) / mean * 100;

  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let prog = REDUCE ? 1 : 0, started = false;

  function X(x, m) { return m.l + (x - 2015) / (2026.7 - 2015) * (m.w - m.l - m.r); }
  function Y(y, m) { return m.b - (y - m.y0) / (m.y1 - m.y0) * (m.b - m.t); }

  function draw() {
    const ctx = binder.ctx;
    const { w: W } = view; const H = 430;
    ctx.clearRect(0, 0, W, H);
    const panelW = Math.max(200, W * 0.24);
    const m = { l: panelW + 26, r: 30, t: 34, b: H - 46, w: W, y0: 500000, y1: 1300000 };

    // gridlines + y labels
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right";
    for (let v = 500000; v <= 1300000; v += 200000) {
      const y = Y(v, m);
      ctx.strokeStyle = "rgba(5,28,44,.07)"; ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(W - m.r, y); ctx.stroke();
      ctx.fillStyle = U.PAL.inkLo;
      ctx.fillText(v >= 1000000 ? "$" + (v / 1e6).toFixed(1) + "M" : "$" + (v / 1000).toFixed(0) + "K", m.l - 8, y + 3);
    }
    // ±σ band (dotted edges, faint fill)
    const yHi = Y(mean + sd, m), yLo = Y(mean - sd, m), yMean = Y(mean, m);
    ctx.fillStyle = "rgba(34,81,255,.05)";
    ctx.fillRect(m.l, yHi, W - m.r - m.l, yLo - yHi);
    ctx.setLineDash([1, 4]); ctx.strokeStyle = "rgba(5,28,44,.4)";
    [yHi, yLo].forEach(y => { ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(W - m.r, y); ctx.stroke(); });
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(5,28,44,.65)";
    ctx.beginPath(); ctx.moveTo(m.l, yMean); ctx.lineTo(W - m.r, yMean); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "left"; ctx.fillStyle = U.PAL.inkMd;
    ctx.fillText("MEAN 2015–25 · $" + Math.round(mean / 1000) + "K", m.l + 6, yMean - 6);
    ctx.fillStyle = U.PAL.inkLo;
    ctx.fillText("+1σ", m.l + 6, yHi - 5); ctx.fillText("−1σ", m.l + 6, yLo + 13);

    // area under series, split at mean via clips
    const pts = series.map(d => [X(d.x, m), Y(d.y, m)]);
    pts.push([X(now.x, m), Y(now.y, m)]);
    const n = Math.max(2, Math.ceil(pts.length * prog));
    const vis = pts.slice(0, n);
    function trace(toY) {
      ctx.beginPath();
      vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.lineTo(vis[vis.length - 1][0], toY); ctx.lineTo(vis[0][0], toY); ctx.closePath();
    }
    ctx.save(); ctx.beginPath(); ctx.rect(m.l, 0, W - m.r - m.l, yMean); ctx.clip();
    trace(yMean); ctx.fillStyle = "rgba(34,81,255,.13)"; ctx.fill(); ctx.restore();   // above mean: light
    ctx.save(); ctx.beginPath(); ctx.rect(m.l, yMean, W - m.r - m.l, m.b - yMean); ctx.clip();
    trace(yMean); ctx.fillStyle = "rgba(18,51,184,.30)"; ctx.fill(); ctx.restore();  // below mean: deep blue region

    // the line itself
    ctx.beginPath(); vis.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = U.PAL.ink; ctx.lineWidth = 2.2; ctx.stroke();

    // x labels + points
    ctx.textAlign = "center"; ctx.fillStyle = U.PAL.inkLo;
    series.forEach((d, i) => {
      const x = X(d.x, m);
      ctx.fillText("’" + String(d.x).slice(2), x, m.b + 18);
      if (i < n) { ctx.beginPath(); ctx.arc(x, Y(d.y, m), 2.6, 0, U.TAU); ctx.fillStyle = U.PAL.ink; ctx.fill(); }
    });
    // peak + trough notes
    if (prog > 0.7) {
      const pk = series.reduce((a, d) => d.y > a.y ? d : a);
      note(ctx, X(pk.x, m), Y(pk.y, m), "2022 · $" + (pk.y / 1e6).toFixed(2) + "M", "the rate-shock peak");
      const tr = series[0];
      note(ctx, X(tr.x, m) + 50, Y(tr.y, m) + 26, "2015 · $" + (tr.y / 1e3).toFixed(0) + "K", "series base");
    }
    // now point + pulse
    if (prog > 0.92) {
      const nx = X(now.x, m), ny = Y(now.y, m);
      const pl = REDUCE ? 0 : (performance.now() / 1000) % 1.6 / 1.6;
      ctx.beginPath(); ctx.arc(nx, ny, 4 + pl * 12, 0, U.TAU);
      ctx.strokeStyle = `rgba(34,81,255,${0.5 * (1 - pl)})`; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.beginPath(); ctx.arc(nx, ny, 4.4, 0, U.TAU); ctx.fillStyle = U.PAL.red; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.textAlign = "right"; ctx.font = "700 11px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.red;
      ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4;
      ctx.strokeText("JUL 2026 · $1.00M", nx - 10, ny - 12); ctx.fillText("JUL 2026 · $1.00M", nx - 10, ny - 12);
    }

    // ── left readout panel ──
    ctx.textAlign = "left";
    ctx.fillStyle = U.PAL.inkLo; ctx.font = "10px Menlo, Consolas, monospace";
    ctx.fillText("GTA AVERAGE · JUL 2026", 4, 42);
    ctx.fillStyle = U.PAL.ink; ctx.font = "700 34px 'et-book', Palatino, Georgia, serif";
    ctx.fillText("$1,003,956", 4, 80);
    ctx.font = "italic 14px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = U.PAL.red;
    ctx.fillText(`${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs the 2015–25 mean`, 4, 106);
    const rows = [
      ["MEAN 2015–25", "$" + Math.round(mean).toLocaleString("en-US")],
      ["±1σ BAND", `$${Math.round((mean - sd) / 1e3)}K – $${Math.round((mean + sd) / 1e3)}K`],
      ["POSITION", now.y > mean + sd ? "ABOVE BAND" : now.y > mean ? "UPPER HALF" : "LOWER HALF"],
    ];
    let ry = 150;
    rows.forEach(([a, b]) => {
      ctx.strokeStyle = "rgba(5,28,44,.14)"; ctx.beginPath(); ctx.moveTo(4, ry - 16); ctx.lineTo(panelW - 14, ry - 16); ctx.stroke();
      ctx.font = "10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo; ctx.fillText(a, 4, ry);
      ctx.font = "700 12px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink; ctx.fillText(b, 4, ry + 16);
      ry += 46;
    });

    if (!REDUCE && prog < 1) { prog = Math.min(1, prog + 0.016); requestAnimationFrame(draw); }
    else if (!REDUCE) requestAnimationFrame(() => { if (started) draw(); }); // keep pulse alive lazily
  }
  function note(ctx, x, y, big, small, below) {
    ctx.beginPath(); ctx.arc(x, y, 4.2, 0, U.TAU); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = U.PAL.neg; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 1.8, 0, U.TAU); ctx.fillStyle = U.PAL.neg; ctx.fill();
    ctx.textAlign = "center"; ctx.font = "700 11px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink;
    ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4;
    const dy = below ? 24 : -18;
    ctx.strokeText(big, x, y + dy); ctx.fillText(big, x, y + dy);
    ctx.font = "italic 11px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = U.PAL.inkMd;
    ctx.strokeText(small, x, y + dy + (below ? 14 : -13)); ctx.fillText(small, x, y + dy + (below ? 14 : -13));
  }

  // drill-down on points
  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const panelW = Math.max(200, view.w * 0.24);
    const m = { l: panelW + 26, r: 30, t: 34, b: 430 - 46, w: view.w, y0: 500000, y1: 1300000 };
    const all = series.concat([now]);
    for (const d of all) {
      const x = X(d.x, m), y = Y(d.y, m);
      if ((mx - x) ** 2 + (my - y) ** 2 < 120) {
        U.showDrill({
          title: d.label + " · GTA AVERAGE SELLING PRICE",
          value: "$" + d.y.toLocaleString("en-US"),
          sub: d.derived ? "Annual average as originally reported (sales derived)" : "Annual/monthly average as originally reported",
          source: "TRREB · anchor " + d.src, x: e.clientX, y: e.clientY,
        });
        return;
      }
    }
  });

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !started) { started = true; view = binder.fit(); draw(); io.disconnect(); }
  }), { threshold: 0.2 });
  io.observe(canvas);
  addEventListener("resize", () => { view = binder.fit(); if (started) draw(); });
})();
