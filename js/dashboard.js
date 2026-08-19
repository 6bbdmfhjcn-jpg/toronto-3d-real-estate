// P14 · Persistent right-rail dashboard — cycle phase, price curve, window stats.
// Switches with the section in view (data-win). Everything drills down.
(function () {
  const rail = document.getElementById("dash-rail");
  const canvas = document.getElementById("dash-canvas");
  if (!rail || !canvas || !window.RPT) return;
  const binder = U.bindCanvas(canvas);
  let view = binder.fit();
  let win = "frame", phase = 2, phaseShown = 2;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TITLES = {
    frame: "THE MARKET AT A GLANCE", site: "THE SITE · CORRIDOR ECONOMICS",
    market: "NINE-YEAR MARKET", supply: "THE SUPPLY CLIFF", verdict: "THE VERDICT",
  };

  // price curve: annual 2015–2025 + Jul 2026, resampled to a halftone mountain
  const series = window.RPT.annual.map(d => d.avg).concat([window.RPT.jul2026.avg]);
  const N = 48, moun = [];
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1) * (series.length - 1);
    const a = Math.floor(f), b = Math.min(series.length - 1, a + 1);
    moun.push(series[a] + (series[b] - series[a]) * (f - a));
  }
  const mn = Math.min(...moun), mx = Math.max(...moun);

  const hit = [];
  function draw() {
    const ctx = binder.ctx;
    const { w: W, h: H } = view;
    ctx.clearRect(0, 0, W, H);
    hit.length = 0;
    const pad = 34, colW = W - pad * 2;
    let y = 54;

    // window badge + title
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "left";
    ctx.fillStyle = U.PAL.red;
    ctx.fillText("● " + win.toUpperCase(), pad, y);
    ctx.fillStyle = U.PAL.ink; ctx.font = "700 17px 'et-book', Palatino, Georgia, serif";
    ctx.fillText(TITLES[win] || "", pad, y + 26);
    y += 58;

    // five-segment phase bar
    const segW = colW / 5;
    ctx.font = "8px Menlo, Consolas, monospace";
    window.RPT.phases.forEach((p, i) => {
      const x0 = pad + i * segW;
      const cur = i === phaseShown;
      ctx.fillStyle = cur ? U.PAL.red : "rgba(5,28,44,.06)";
      ctx.fillRect(x0 + 1.5, y, segW - 3, 7);
      ctx.fillStyle = cur ? U.PAL.red : U.PAL.inkLo;
      ctx.save(); ctx.textAlign = "center";
      ctx.fillText(p, x0 + segW / 2, y + 20);
      ctx.restore();
      hit.push({ x0, x1: x0 + segW, y0: y, y1: y + 26, d: { title: "CYCLE PHASE", value: p, sub: cur ? "Current reading of the corridor market." : "Not the current phase.", source: "Synthesis of anchors K1–K14" } });
    });
    y += 44;

    // halftone mountain curve (28px readout safety band at top)
    const mh = Math.min(170, H * 0.2), my0 = y + 28;
    const gap = 7;
    ctx.fillStyle = U.PAL.ink;
    for (let gx = 0; gx < N; gx++) {
      const x = pad + gx / (N - 1) * colW;
      const v = (moun[gx] - mn) / (mx - mn);
      const top = my0 + (1 - v) * (mh - 20);
      for (let yy = my0 + mh; yy > top; yy -= gap) {
        const d = (my0 + mh - yy) / mh;
        ctx.globalAlpha = 0.10 + d * 0.35;
        ctx.beginPath(); ctx.arc(x, yy, 1 + d * 2.0, 0, U.TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // end cursor + readout
    const ex = pad + colW, ey = my0 + (1 - (moun[N - 1] - mn) / (mx - mn)) * (mh - 20);
    const pl = REDUCE ? 0 : (performance.now() / 1100) % 1;
    ctx.beginPath(); ctx.arc(ex - 2, ey, 3 + pl * 8, 0, U.TAU);
    ctx.strokeStyle = `rgba(34,81,255,${0.5 * (1 - pl)})`; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex - 2, ey, 3.2, 0, U.TAU); ctx.fillStyle = U.PAL.red; ctx.fill();
    ctx.font = "700 16px Menlo, Consolas, monospace"; ctx.textAlign = "right"; ctx.fillStyle = U.PAL.ink;
    ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 5;
    ctx.strokeText("$1.00M", ex - 10, ey - 10); ctx.fillText("$1.00M", ex - 10, ey - 10);
    ctx.font = "8px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo; ctx.textAlign = "left";
    ctx.fillText("GTA AVG PRICE · 2015 → JUL 2026", pad, my0 + mh + 16);
    hit.push({ x0: pad, x1: pad + colW, y0: my0, y1: my0 + mh, d: { title: "GTA AVERAGE PRICE", value: "$1,003,956 · JUL 2026", sub: "Annual series 2015–2025 plus the July 2026 monthly average.", source: "TRREB · K1/K5–K8" } });
    y = my0 + mh + 40;

    // stat blocks
    const stats = (window.RPT.rail[win] || window.RPT.rail.frame).stats;
    const bw = (colW - 12) / 2;
    stats.forEach(([k, v], i) => {
      const x0 = pad + (i % 2) * (bw + 12), y0 = y + Math.floor(i / 2) * 64;
      ctx.strokeStyle = "rgba(5,28,44,.14)"; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + bw, y0); ctx.stroke();
      ctx.font = "8.5px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo; ctx.textAlign = "left";
      ctx.fillText(k, x0, y0 + 16);
      ctx.font = "700 15px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink;
      ctx.fillText(v, x0, y0 + 38);
      hit.push({ x0, x1: x0 + bw, y0, y1: y0 + 44, d: { title: k, value: v, sub: "Window readout — " + (TITLES[win] || win), source: "Anchors per section" } });
    });
    y += Math.ceil(stats.length / 2) * 64 + 20;

    // corridor status cells
    ctx.font = "9px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo;
    ctx.fillText("CORRIDOR STOCK", pad, y); y += 12;
    const cells = [["CONDO", "−9.5% YoY", true], ["DETACHED", "−2.0% YoY", false], ["RENTAL", "3.0% VAC", false], ["NEW-BUILD", "−79% STARTS", true]];
    cells.forEach(([a, b, hot], i) => {
      const y0 = y + i * 30;
      ctx.strokeStyle = "rgba(5,28,44,.10)"; ctx.beginPath(); ctx.moveTo(pad, y0 + 22); ctx.lineTo(pad + colW, y0 + 22); ctx.stroke();
      ctx.font = "700 10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink; ctx.textAlign = "left";
      ctx.fillText(a, pad, y0 + 15);
      ctx.textAlign = "right"; ctx.fillStyle = hot ? U.PAL.neg : U.PAL.inkMd;
      ctx.fillText(b, pad + colW, y0 + 15);
    });
  }

  function loop() { draw(); if (!REDUCE) requestAnimationFrame(loop); }

  window.DASH = {
    setWin(w) {
      if (!window.RPT.rail[w]) return;
      win = w;
      const tgt = window.RPT.rail[w].phase;
      phaseShown = tgt;
      if (REDUCE) draw();
    },
    show(on) { rail.classList.toggle("on", on); if (on) { view = binder.fit(); if (REDUCE) draw(); } },
  };

  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for (const h of hit) {
      if (mx >= h.x0 && mx <= h.x1 && my >= h.y0 && my <= h.y1) {
        U.showDrill({ title: h.d.title, value: h.d.value, sub: h.d.sub, source: h.d.source, x: e.clientX, y: e.clientY });
        return;
      }
    }
  });

  view = binder.fit();
  if (REDUCE) draw(); else loop();
  addEventListener("resize", () => { view = binder.fit(); if (REDUCE) draw(); });
})();
