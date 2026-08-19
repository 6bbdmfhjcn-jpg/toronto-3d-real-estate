// Cover A · infinite recursion of the theme atom — the city block.
// What recurses is the object itself: a recognizable residential block
// (tower/podium/courtyard footprints) shrinking into one cell of the city grid.
(function () {
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("cover-canvas");
  if (!canvas) return;
  const binder = U.bindCanvas(canvas);
  let view = { w: 0, h: 0, cx: 0, cy: 0 };
  let active = true, t = 0, last = 0, raf = 0;
  const T = 12; // seconds per recursion layer

  const INK = "#051c2c", INKMD = "#42566a", INKLO = "#8595a6", BLUE = "#2251ff", PAPER = "#ffffff";

  // ── block tiles: real urban residential plan-view masks ──
  function tile(fn) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d");
    x.fillStyle = PAPER; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(5,28,44,.30)"; x.lineWidth = 5; x.strokeRect(2, 2, 252, 252); // street edge
    x.save(); x.translate(0, 0); fn(x); x.restore();
    return c;
  }
  function foot(x, pts, fill = "rgba(5,28,44,.82)") { // building footprint + hatch
    x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath();
    x.fillStyle = fill; x.fill();
    x.save(); x.clip();
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 2;
    for (let i = -256; i < 512; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, 256); x.stroke(); }
    x.restore();
    x.strokeStyle = INK; x.lineWidth = 2.5; x.stroke();
  }
  function trees(x, rng, n, x0, y0, w, h) {
    x.fillStyle = "rgba(66,86,106,.5)";
    for (let i = 0; i < n; i++) { x.beginPath(); x.arc(x0 + rng() * w, y0 + rng() * h, 3 + rng() * 3, 0, U.TAU); x.fill(); }
  }
  const rng = U.makeRng(416);
  const TILES = [
    tile(x => { // point tower + L podium
      foot(x, [[30, 30], [226, 30], [226, 78], [78, 78], [78, 226], [30, 226]]);
      foot(x, [[120, 110], [190, 110], [190, 180], [120, 180]], "rgba(34,81,255,.85)");
      trees(x, rng, 8, 95, 195, 130, 45);
    }),
    tile(x => { // courtyard donut slab
      foot(x, [[36, 52], [220, 52], [220, 204], [36, 204]]);
      x.fillStyle = PAPER; x.fillRect(82, 96, 92, 66);
      x.strokeStyle = INK; x.lineWidth = 2.5; x.strokeRect(82, 96, 92, 66);
      trees(x, rng, 6, 88, 102, 80, 54);
    }),
    tile(x => { // twin slabs
      foot(x, [[34, 40], [222, 40], [222, 88], [34, 88]]);
      foot(x, [[34, 150], [222, 150], [222, 198], [34, 198]]);
      trees(x, rng, 10, 40, 100, 176, 40);
    }),
    tile(x => { // rotunda building (identity echo of the site)
      foot(x, [[34, 96], [146, 96], [146, 208], [34, 208]]);
      x.beginPath(); x.arc(190, 150, 44, 0, U.TAU);
      x.fillStyle = "rgba(5,28,44,.82)"; x.fill(); x.strokeStyle = INK; x.lineWidth = 2.5; x.stroke();
      x.beginPath(); x.arc(190, 150, 24, 0, U.TAU); x.strokeStyle = "rgba(255,255,255,.6)"; x.stroke();
      trees(x, rng, 7, 36, 36, 180, 40);
    }),
    tile(x => { // retail strip + parking dots
      foot(x, [[30, 30], [226, 30], [226, 84], [30, 84]]);
      x.fillStyle = "rgba(66,86,106,.55)";
      for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 7; rx++) { if (rng() > 0.35) x.fillRect(42 + rx * 26, 116 + ry * 38, 14, 22); }
    }),
    tile(x => { // walk-up row
      for (let i = 0; i < 5; i++) foot(x, [[34 + i * 38, 60], [64 + i * 38, 60], [64 + i * 38, 196], [34 + i * 38, 196]]);
      trees(x, rng, 6, 34, 30, 190, 24);
    }),
    tile(x => { // angled garden court
      x.save(); x.translate(128, 128); x.rotate(0.35);
      x.restore();
      foot(x, [[40, 60], [150, 30], [170, 100], [60, 130]]);
      foot(x, [[96, 150], [216, 116], [230, 176], [110, 210]]);
      trees(x, rng, 9, 150, 60, 70, 120);
    }),
    tile(x => { // U-shaped mid-rise
      foot(x, [[40, 44], [216, 44], [216, 118], [150, 118], [150, 208], [106, 208], [106, 118], [40, 118]]);
      trees(x, rng, 8, 60, 140, 120, 80);
    }),
  ];

  // pre-render 3×3 masks (center empty), 4 variants
  const MASKS = [];
  for (let m = 0; m < 4; m++) {
    const c = document.createElement("canvas"); c.width = c.height = 768;
    const x = c.getContext("2d");
    const order = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
    const r2 = U.makeRng(900 + m);
    order.forEach(([gx, gy]) => {
      const ti = (r2() * TILES.length) | 0;
      x.drawImage(TILES[ti], gx * 256, gy * 256);
    });
    MASKS.push(c);
  }
  const BFS = [[1, 0], [0, 1], [2, 1], [1, 2], [0, 0], [2, 0], [0, 2], [2, 2]]; // ring order from center

  function draw() {
    const ctx = binder.ctx;
    const { w: W, h: H } = view;
    ctx.clearRect(0, 0, W, H);
    const cx = 0.62 * W, cy = 0.52 * H;
    const p = REDUCE ? 0.42 : (t / T) % 1;
    const gen = Math.floor(t / T);
    const s0 = Math.min(W, H) * 0.42; // cell size of level 0 at p=0

    // levels: 0 = largest … 3 = innermost; level k cell = s0·3^(p−k)
    for (let k = 0; k < 4; k++) {
      const cell = s0 * Math.pow(3, p - k);
      const size = cell * 3;
      if (size < 26 || size > Math.max(W, H) * 6) continue;
      const mask = MASKS[(gen - k + 400) % 4];
      const x0 = cx - size / 2, y0 = cy - size / 2;

      // birth animation for the newest (innermost) level
      let cellAlpha = 1, flash = -1;
      if (!REDUCE && k === 3) {
        const bp = U.clamp(p / 0.6, 0, 1); // births during first 60% of layer
        cellAlpha = bp;
        flash = Math.floor(bp * BFS.length);
      }
      ctx.globalAlpha = k === 3 ? U.clamp(0.25 + 0.75 * cellAlpha, 0, 1) : 1;
      ctx.drawImage(mask, x0, y0, size, size);
      ctx.globalAlpha = 1;

      // blue flash on newly born cells of the innermost level
      if (flash >= 0 && k === 3) {
        for (let i = 0; i <= flash && i < BFS.length; i++) {
          const [gx, gy] = BFS[i];
          const fx = x0 + gx * cell, fy = y0 + gy * cell;
          const a = i === flash ? 0.5 : 0.12;
          ctx.fillStyle = `rgba(34,81,255,${a})`;
          ctx.fillRect(fx, fy, cell, cell);
        }
      }
      // viewfinder on level-0 center cell
      if (k === 0) {
        const vx = cx - cell / 2, vy = cy - cell / 2, L = Math.min(26, cell * 0.16);
        ctx.strokeStyle = BLUE; ctx.lineWidth = 2.5;
        const corners = [[vx, vy, 1, 1], [vx + cell, vy, -1, 1], [vx, vy + cell, 1, -1], [vx + cell, vy + cell, -1, -1]];
        corners.forEach(([px, py, sx, sy]) => {
          ctx.beginPath(); ctx.moveTo(px + sx * L, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * L); ctx.stroke();
        });
        ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "left";
        ctx.fillStyle = BLUE;
        ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 4;
        const tag = "ONE BLOCK";
        ctx.strokeText(tag, vx + 8, vy + 16); ctx.fillText(tag, vx + 8, vy + 16);
      }
    }

    // left white wash keeps the title column readable
    const wash = ctx.createLinearGradient(0, 0, 0.68 * W, 0);
    wash.addColorStop(0, "rgba(255,255,255,1)"); wash.addColorStop(0.5, "rgba(255,255,255,.96)");
    wash.addColorStop(0.78, "rgba(255,255,255,.72)"); wash.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 0.68 * W, H);

    ctx.font = "10px Menlo, Consolas, monospace"; ctx.textAlign = "right";
    ctx.fillStyle = INKLO;
    ctx.fillText("FIG. A · EVERY BLOCK IS ONE CELL OF A LARGER GRID — SCALE, ALL THE WAY UP", W - 30, H - 26);
  }

  function loop(ts) {
    if (!active) return;
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
    t += dt; draw();
    raf = requestAnimationFrame(loop);
  }
  function fitAndStatic() { view = binder.fit(); if (REDUCE) draw(); }

  window.COVER_A = {
    setActive(on) {
      active = on;
      if (on) {
        requestAnimationFrame(() => { fitAndStatic(); if (!REDUCE) { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop); } });
      } else cancelAnimationFrame(raf);
    },
  };
  addEventListener("resize", () => { if (active) fitAndStatic(); });
})();
