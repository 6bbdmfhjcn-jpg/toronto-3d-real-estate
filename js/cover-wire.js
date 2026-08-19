// Cover C · blueprint wireframe of the same exploded condominium + the three-way mode switcher.
(function () {
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { LAYERS, GAP, Z0, makePt } = window.COVER_GEO;
  const canvas = document.getElementById("cover-canvas-w");
  const host = document.getElementById("cover");
  if (!canvas || !host) return;
  const binder = U.bindCanvas(canvas);
  let view = { w: 0, h: 0, cx: 0, cy: 0 };
  let active = false, t = 0, last = 0, raf = 0, k = 1;

  function layerZ(i) {
    return Z0 + LAYERS.slice(0, i).reduce((a, l) => a + l.h, 0) + k * (i * GAP + 2.2);
  }

  function wireBox(ctx, pt, w, d, h, zBase, color) {
    const x0 = -w / 2, y0 = -d / 2;
    const P = {};
    [[0, 0, 0, "a"], [1, 0, 0, "b"], [1, 1, 0, "c"], [0, 1, 0, "d"],
     [0, 0, 1, "A"], [1, 0, 1, "B"], [1, 1, 1, "C"], [0, 1, 1, "D"]].forEach(([ix, iy, iz, n]) => {
      P[n] = pt(x0 + ix * w, y0 + iy * d, zBase + iz * h);
    });
    // white veil on top face for front/back layering
    ctx.beginPath(); [P.A, P.B, P.C, P.D].forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y));
    ctx.closePath(); ctx.fillStyle = "rgba(255,255,255,.68)"; ctx.fill();
    const edges = [
      ["a", "b", .22], ["b", "c", .22], ["c", "d", .22], ["d", "a", .22],       // bottom faint
      ["a", "A", .55], ["b", "B", .55], ["c", "C", .7], ["d", "D", .55],        // verticals
      ["A", "B", .85], ["B", "C", .85], ["C", "D", .85], ["D", "A", .85],       // top heaviest
    ];
    edges.forEach(([p, q, a]) => {
      ctx.beginPath(); ctx.moveTo(P[p].x, P[p].y); ctx.lineTo(P[q].x, P[q].y);
      ctx.strokeStyle = color.replace("A)", `${a})`); ctx.lineWidth = 1; ctx.stroke();
    });
    return P;
  }

  function draw() {
    const ctx = binder.ctx;
    const { w: W, h: H } = view;
    ctx.clearRect(0, 0, W, H);

    // drafting cross grid
    ctx.strokeStyle = "rgba(5,28,44,.05)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 52) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 52) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // registration marks
    ctx.strokeStyle = "rgba(34,81,255,.6)";
    [[26, 26], [W - 26, 26], [26, H - 26], [W - 26, H - 26]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9); ctx.stroke();
    });

    const leftBound = 0.585 * W, right = W - 332;
    let u = Math.min((right - leftBound) / 44, H * 0.0132);
    let rx = right; if (u < 5.6) { rx = W - 40; u = Math.min((rx - leftBound) / 44, H * 0.0132); }
    const cx = (leftBound + rx) / 2, cy = 0.60 * H;
    const yaw = Math.PI / 4 + (REDUCE ? 0 : 0.3 * Math.sin(t * 0.11));
    const pt = makePt(yaw, u, cx, cy);

    const rows = [];
    LAYERS.forEach((L, i) => {
      const col = L.thesis === "hard" ? "rgba(194,47,78,A)" : "rgba(34,81,255,A)";
      const z = layerZ(i);
      const P = wireBox(ctx, pt, L.w, L.d, L.h, z, col);
      // dashed window coursing on the slab layer
      if (L.id === "slab") {
        ctx.setLineDash([3, 4]);
        for (let f = 1; f < 8; f++) {
          const zz = z + (L.h * f) / 8;
          const q1 = pt(-L.w / 2, -L.d / 2, zz), q2 = pt(L.w / 2, -L.d / 2, zz), q3 = pt(L.w / 2, L.d / 2, zz);
          ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y);
          ctx.strokeStyle = "rgba(34,81,255,.30)"; ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      // hollow-circle leader endpoints + labels
      const a = [P.B, P.C].sort((p, q) => q.x - p.x)[0];
      const colX = W - 312;
      let ly = a.y; rows.forEach(r => { if (Math.abs(r - ly) < 34) ly = r + 34; }); rows.push(ly);
      ctx.beginPath(); ctx.arc(a.x, a.y, 3.4, 0, U.TAU);
      ctx.strokeStyle = col.replace("A)", ".8)"); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a.x + 5, a.y); ctx.lineTo(colX - 12, ly);
      ctx.strokeStyle = col.replace("A)", ".45)"); ctx.stroke();
      ctx.font = "700 12px Menlo, Consolas, monospace"; ctx.textAlign = "left";
      ctx.fillStyle = col.replace("A)", "1)");
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 4;
      ctx.strokeText(L.head, colX, ly + 4); ctx.fillText(L.head, colX, ly + 4);
    });

    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right";
    ctx.fillStyle = "#8595a6";
    ctx.fillText("FIG. C · MID-RISE CONDOMINIUM · WIRE FRAME · SCALE NTS · X-RAY, NO HIDDEN-LINE REMOVAL", W - 30, H - 26);
  }

  function loop(ts) {
    if (!active) return;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
    t += dt; draw();
    raf = requestAnimationFrame(loop);
  }
  function fitAndStatic() { view = binder.fit(); if (REDUCE) draw(); }
  window.COVER_W = {
    setActive(on) {
      active = on;
      if (on) requestAnimationFrame(() => { fitAndStatic(); if (!REDUCE) { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop); } });
      else cancelAnimationFrame(raf);
    },
  };

  // ── mode switcher (owns all three covers) ──
  const panes = { rec: canvas ? document.getElementById("cover-canvas") : null, x: document.getElementById("cover-canvas-x"), w: canvas };
  const engines = { rec: window.COVER_A, x: window.COVER_X, w: window.COVER_W };
  function setMode(m) {
    if (!panes[m]) m = "rec";
    Object.entries(panes).forEach(([key, cv]) => { if (cv) cv.style.display = key === m ? "" : "none"; });
    Object.entries(engines).forEach(([key, e]) => { if (e && e.setActive) e.setActive(key === m); });
    document.querySelectorAll("#cover-mode [data-mode]").forEach(b => b.classList.toggle("on", b.dataset.mode === m));
    try { localStorage.setItem("cover-mode", m); } catch (_) {}
  }
  document.querySelectorAll("#cover-mode [data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  const urlMode = new URLSearchParams(location.search).get("cover");
  let init = "rec";
  if (urlMode === "x" || urlMode === "w") init = urlMode;
  else { try { const s = localStorage.getItem("cover-mode"); if (s === "x" || s === "w") init = s; } catch (_) {} }
  setMode(init);
})();
