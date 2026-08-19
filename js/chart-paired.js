// P11 · Paired bars + ratio labels — 2026 sales vs new listings; the SNLR is the star.
(function () {
  const host = document.getElementById("paired-chart");
  if (!host || !window.RPT) return;
  const body = U.frame(host, {
    title: "Demand holds, supply retreats — the ratio turns",
    sub: "GTA MONTHLY SALES (SOLID) VS NEW LISTINGS (OUTLINE), 2026 · RATIO = SALES-TO-NEW-LISTINGS · CLICK A PAIR FOR BASIS",
    src: "Industry & official — TRREB monthly releases May–Jul 2026 · K1–K3; ratio calc K11",
  });
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%"; canvas.style.height = "400px"; canvas.style.display = "block";
  body.appendChild(canvas);
  const binder = U.bindCanvas(canvas);
  let view = binder.fit();

  const data = window.RPT.monthly2026.map(d => ({ ...d, snlr: d.sales / d.listings * 100 }));
  const REF = { v: 34.6, label: "JUL 2025 · 34.6%" }; // year-ago reference
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let prog = REDUCE ? 1 : 0, started = false;

  function draw() {
    const ctx = binder.ctx;
    const { w: W } = view; const H = 400;
    ctx.clearRect(0, 0, W, H);
    const m = { l: 56, r: 24, t: 74, b: H - 58 };
    const y1 = 20000;
    const Y = v => m.b - v / y1 * (m.b - m.t);
    const slot = (W - m.l - m.r) / data.length;

    // grid
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right"; ctx.fillStyle = U.PAL.inkLo;
    for (let v = 0; v <= 20000; v += 5000) {
      ctx.strokeStyle = "rgba(5,28,44,.07)"; ctx.beginPath(); ctx.moveTo(m.l, Y(v)); ctx.lineTo(W - m.r, Y(v)); ctx.stroke();
      ctx.fillText((v / 1000) + "K", m.l - 8, Y(v) + 3);
    }

    data.forEach((d, i) => {
      const cx = m.l + slot * (i + 0.5);
      const bw = Math.min(54, slot * 0.22);
      const p = U.clamp(prog * 1.35 - i * 0.22, 0, 1);
      const xS = cx - bw - 7, xL = cx + 7;
      // sales bar (solid blue)
      const hS = (m.b - Y(d.sales)) * p;
      ctx.fillStyle = U.PAL.red;
      ctx.fillRect(xS, m.b - hS, bw, hS);
      // listings bar (outlined ink)
      const hL = (m.b - Y(d.listings)) * p;
      ctx.strokeStyle = U.PAL.ink; ctx.lineWidth = 1.8;
      ctx.strokeRect(xL, m.b - hL, bw, hL);
      ctx.fillStyle = "rgba(5,28,44,.06)"; ctx.fillRect(xL, m.b - hL, bw, hL);
      if (p > 0.9) {
        // values
        ctx.textAlign = "center"; ctx.font = "10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkMd;
        ctx.fillText(d.sales.toLocaleString(), xS + bw / 2, m.b - hS - 8);
        ctx.fillText(d.listings.toLocaleString(), xL + bw / 2, m.b - hL - 8);
        // ratio — the star
        const last = i === data.length - 1;
        ctx.font = "700 17px Menlo, Consolas, monospace";
        ctx.fillStyle = last ? U.PAL.red : U.PAL.ink;
        ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4;
        const ry = m.b - hL - 34;
        ctx.strokeText(d.snlr.toFixed(1) + "%", cx, ry); ctx.fillText(d.snlr.toFixed(1) + "%", cx, ry);
        ctx.font = "9px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.inkLo;
        ctx.strokeText("SNLR", cx, ry - 17); ctx.fillText("SNLR", cx, ry - 17);
        // month
        ctx.font = "700 11px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink;
        ctx.fillText(d.mo.toUpperCase(), cx, m.b + 22);
        ctx.font = "italic 11px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = U.PAL.inkMd;
        ctx.fillText(`HPI ${d.hpiYoY}% YoY`, cx, m.b + 38);
      }
    });

    // year-ago reference, in the empty top-left of the plot
    if (prog > 0.95) {
      ctx.textAlign = "left"; ctx.font = "10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.neg;
      ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4;
      ctx.strokeText("YEAR AGO · " + REF.label, m.l + 4, m.t - 28);
      ctx.fillText("YEAR AGO · " + REF.label, m.l + 4, m.t - 28);
    }

    // legend
    ctx.font = "10px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.red;
    ctx.fillRect(W - 268, 22, 12, 12); ctx.fillStyle = U.PAL.inkMd; ctx.textAlign = "left";
    ctx.fillText("SALES", W - 250, 32);
    ctx.strokeStyle = U.PAL.ink; ctx.lineWidth = 1.8; ctx.strokeRect(W - 190, 22, 12, 12);
    ctx.fillStyle = U.PAL.inkMd; ctx.fillText("NEW LISTINGS", W - 172, 32);

    if (!REDUCE && prog < 1 && started) { prog = Math.min(1, prog + 0.02); requestAnimationFrame(draw); }
  }

  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const m = { l: 56, r: 24 };
    const slot = (view.w - m.l - m.r) / data.length;
    const i = Math.floor((mx - m.l) / slot);
    if (i >= 0 && i < data.length) {
      const d = data[i];
      U.showDrill({
        title: d.mo.toUpperCase() + " · GTA RESALE",
        value: `${d.snlr.toFixed(1)}% SNLR`,
        sub: `${d.sales.toLocaleString()} sales vs ${d.listings.toLocaleString()} new listings; avg price $${d.avg.toLocaleString()} (${d.hpiYoY}% HPI YoY)`,
        source: "TRREB monthly release · anchor " + d.src, x: e.clientX, y: e.clientY,
      });
    }
  });

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !started) { started = true; view = binder.fit(); draw(); io.disconnect(); }
  }), { threshold: 0.2 });
  io.observe(canvas);
  addEventListener("resize", () => { view = binder.fit(); if (started) draw(); });
})();
