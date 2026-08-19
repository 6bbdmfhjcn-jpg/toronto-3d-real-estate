// P18 · Verdict scale — "stabilization forms" vs "supply cliff".
// Sidedness + tilt + absent-weights triple encoding. Tilt is qualitative — not a score.
(function () {
  const host = document.getElementById("verdict-chart");
  if (!host || !window.RPT) return;
  const body = U.frame(host, {
    title: "The scale tips toward stabilization — two weights are still in the air",
    sub: "EVIDENCE WEIGHED, NOT SCORED · DASHED WEIGHTS = UPGRADE TRIGGERS NOT YET MET · RED SEAL = SHARED FALSIFICATION · CLICK ANY WEIGHT",
    src: "All anchors — TRREB / CMHC / Urbanation · K1–K14",
  });
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%"; canvas.style.height = "520px"; canvas.style.display = "block";
  body.appendChild(canvas);
  const binder = U.bindCanvas(canvas);
  let view = binder.fit();

  const V = window.RPT.verdict;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let prog = REDUCE ? 1 : 0, started = false;
  const TILT = 0.055; // qualitative, toward the bull (left) pan

  const probe = document.createElement("canvas").getContext("2d");
  function fit(s, budget) {
    probe.font = "9px Menlo, Consolas, monospace";
    if (probe.measureText(s).width <= budget) return s;
    let out = s;
    while (out.length > 4 && probe.measureText(out + "…").width > budget) out = out.slice(0, -1);
    return out.replace(/[ ,.;:]*$/, "") + "…";
  }

  const hit = [];
  function weight(ctx, cx, cy, w, h, label, dashed) {
    // trapezoid + top knob
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.32, cy - h / 2); ctx.lineTo(cx + w * 0.32, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy + h / 2); ctx.lineTo(cx - w / 2, cy + h / 2); ctx.closePath();
    if (dashed) {
      ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(34,81,255,.8)"; ctx.lineWidth = 1.6;
      ctx.fillStyle = "rgba(34,81,255,.05)"; ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.fillStyle = "rgba(5,28,44,.92)"; ctx.fill();
      ctx.strokeStyle = "rgba(5,28,44,1)"; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy - h / 2 - 5, 5, 0, U.TAU);
    if (dashed) { ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(34,81,255,.8)"; ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.fillStyle = "rgba(5,28,44,.92)"; ctx.fill(); }
    ctx.textAlign = "center"; ctx.font = "9px Menlo, Consolas, monospace";
    ctx.fillStyle = dashed ? U.PAL.red : "#fff";
    const s = fit(label, w * 0.62);
    if (dashed) { ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4; ctx.strokeText(s, cx, cy + 3); }
    ctx.fillText(s, cx, cy + 3);
    hit.push({ x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2 - 12, y1: cy + h / 2, label });
  }

  function draw() {
    const ctx = binder.ctx;
    const { w: W } = view; const H = 520;
    ctx.clearRect(0, 0, W, H);
    hit.length = 0;

    const px = W / 2, py = 210;               // fulcrum top
    const beamL = W * 0.33;
    const tilt = TILT * U.clamp(prog * 1.6 - 0.5, 0, 1);
    const lx = px - beamL, rx = px + beamL;
    const ly = py + Math.sin(tilt) * beamL, ry = py - Math.sin(tilt) * beamL;

    // pillar + base
    ctx.fillStyle = "rgba(5,28,44,.92)";
    ctx.beginPath(); ctx.moveTo(px - 9, py + 8); ctx.lineTo(px + 9, py + 8); ctx.lineTo(px + 15, H - 128); ctx.lineTo(px - 15, H - 128); ctx.closePath(); ctx.fill();
    ctx.fillRect(px - 90, H - 128, 180, 7);

    // fulcrum dial: three zones, needle stops inside STABILIZING
    ctx.beginPath(); ctx.arc(px, py + 6, 34, Math.PI, 0);
    ctx.strokeStyle = "rgba(5,28,44,.5)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.font = "8px Menlo, Consolas, monospace"; ctx.textAlign = "center"; ctx.fillStyle = U.PAL.inkLo;
    ctx.fillText("FALLING", px - 30, py + 40); ctx.fillText("STABILIZING", px, py + 48); ctx.fillText("RISING", px + 32, py + 40);
    const needleA = -Math.PI / 2 - 0.42 * U.clamp(prog * 1.6 - 0.5, 0, 1);
    ctx.beginPath(); ctx.moveTo(px, py + 6);
    ctx.lineTo(px + Math.cos(needleA) * 30, py + 6 + Math.sin(needleA) * 30);
    ctx.strokeStyle = U.PAL.red; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py + 6, 3, 0, U.TAU); ctx.fillStyle = U.PAL.ink; ctx.fill();

    // beam
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry);
    ctx.strokeStyle = U.PAL.ink; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();

    // pans hang vertically from beam ends (translate, don't rotate)
    const drop = 62;
    const pans = [
      { x: lx, y: ly + drop, items: V.bull, side: "STABILIZATION FORMS", col: U.PAL.red },
      { x: rx, y: ry + drop, items: V.bear, side: "SUPPLY CLIFF", col: U.PAL.inkMd },
    ];
    const wW = Math.min(150, W * 0.17), wH = 34;
    pans.forEach((pan, pi) => {
      // chains
      ctx.strokeStyle = "rgba(5,28,44,.55)"; ctx.lineWidth = 1;
      const beamY = pi === 0 ? ly : ry;
      ctx.beginPath(); ctx.moveTo(pan.x, beamY); ctx.lineTo(pan.x - 44, pan.y); ctx.moveTo(pan.x, beamY); ctx.lineTo(pan.x + 44, pan.y); ctx.stroke();
      // pan
      ctx.beginPath(); ctx.ellipse(pan.x, pan.y, 52, 9, 0, 0, Math.PI);
      ctx.fillStyle = "rgba(5,28,44,.85)"; ctx.fill();
      // side label
      ctx.font = "700 11px Menlo, Consolas, monospace"; ctx.textAlign = "center"; ctx.fillStyle = pan.col;
      ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 4;
      ctx.strokeText(pan.side, pan.x, pan.y + 28); ctx.fillText(pan.side, pan.x, pan.y + 28);
      // weights stack upward from the pan
      pan.items.forEach((it, i) => {
        const wp = U.clamp(prog * (pan.items.length + 1.5) - i - pi * 0.7, 0, 1);
        if (wp <= 0) return;
        const targetY = pan.y - 14 - wH / 2 - i * (wH + 3);
        const cy = targetY - (1 - wp) * 90;
        ctx.globalAlpha = wp;
        weight(ctx, pan.x, cy, wW, wH, it.w, false);
        ctx.globalAlpha = 1;
        hit[hit.length - 1].data = it;
      });
    });

    // dashed trigger weights hover above the bull pan — not yet landed
    V.triggers.forEach((tr, i) => {
      if (prog < 0.75) return;
      const stackTop = ly + drop - 14 - V.bull.length * (wH + 3);
      const cx = lx, cy = Math.max(34, stackTop - 34 - i * (wH + 12));
      weight(ctx, cx, cy, wW, wH, tr.w, true);
      hit[hit.length - 1].data = tr;
      // dashed arrow down toward the pan
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(34,81,255,.5)";
      ctx.beginPath(); ctx.moveTo(cx, cy + wH / 2 + 3); ctx.lineTo(cx, stackTop - 6); ctx.stroke();
      ctx.setLineDash([]);
    });
    ctx.font = "italic 11px 'et-book', Palatino, Georgia, serif"; ctx.textAlign = "center"; ctx.fillStyle = U.PAL.inkMd;
    ctx.fillText("reading upgrades only when these land on the pan", lx, ly + drop + 46);

    // falsification seal
    const sy = H - 92;
    ctx.fillStyle = "rgba(194,47,78,.10)"; ctx.fillRect(W * 0.08, sy, W * 0.84, 58);
    ctx.save(); ctx.beginPath(); ctx.rect(W * 0.08, sy, W * 0.84, 58); ctx.clip();
    ctx.strokeStyle = "rgba(194,47,78,.35)"; ctx.lineWidth = 1;
    for (let x = -60; x < W; x += 12) { ctx.beginPath(); ctx.moveTo(x + W * 0.08, sy + 58); ctx.lineTo(x + 60 + W * 0.08, sy); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = U.PAL.neg; ctx.lineWidth = 1.4; ctx.strokeRect(W * 0.08, sy, W * 0.84, 58);
    ctx.font = "700 10px Menlo, Consolas, monospace"; ctx.textAlign = "center"; ctx.fillStyle = U.PAL.neg;
    ctx.fillText("FALSIFICATION SEAL — THE READING BREAKS IF ANY STRIP TRIPS", W / 2, sy + 16);
    const sw = W * 0.84 / 3 - 16;
    V.falsifiers.forEach((f, i) => {
      const x0 = W * 0.08 + 10 + i * (sw + 12);
      ctx.fillStyle = "#fff"; ctx.fillRect(x0, sy + 26, sw, 22);
      ctx.strokeStyle = "rgba(194,47,78,.6)"; ctx.lineWidth = 1; ctx.strokeRect(x0, sy + 26, sw, 22);
      ctx.font = "9px Menlo, Consolas, monospace"; ctx.fillStyle = U.PAL.ink;
      ctx.fillText(fit(f.w, sw - 12), x0 + sw / 2, sy + 40);
      hit.push({ x0, x1: x0 + sw, y0: sy + 26, y1: sy + 48, data: f });
    });

    // verdict plaque on the pillar, below the dial, clear of the seal
    ctx.fillStyle = U.PAL.ink; ctx.fillRect(px - 128, py + 62, 256, 40);
    ctx.font = "italic 13px 'et-book', Palatino, Georgia, serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.fillText("“Stabilizing — not yet a recovery.”", px, py + 79);
    ctx.font = "8px Menlo, Consolas, monospace"; ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.fillText("TILT IS QUALITATIVE · NOT A SCORE", px, py + 93);

    if (!REDUCE && prog < 1 && started) { prog = Math.min(1, prog + 0.016); requestAnimationFrame(draw); }
  }

  canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for (const h of hit) {
      if (h.data && mx >= h.x0 && mx <= h.x1 && my >= h.y0 && my <= h.y1) {
        U.showDrill({
          title: "EVIDENCE / TRIGGER",
          value: h.data.w,
          sub: h.data.full || "Upgrade trigger — not yet met." ,
          source: "Anchor " + h.data.src, x: e.clientX, y: e.clientY,
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
