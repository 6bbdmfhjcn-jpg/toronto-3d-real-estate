// main.js · scroll engine — chips, rail visibility, window switching, count-up, term cards
(function () {
  // chips scroll to sections
  document.querySelectorAll("[data-goto]").forEach(b => {
    b.addEventListener("click", () => {
      const t = document.querySelector(b.dataset.goto);
      if (t) t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  });

  // rail: visible after the cover; window follows the section in view
  const cover = document.getElementById("cover");
  if (cover && window.DASH) {
    new IntersectionObserver(es => es.forEach(e => window.DASH.show(!e.isIntersecting)), { threshold: 0.25 }).observe(cover);
  }
  const wins = document.querySelectorAll("[data-win]");
  if (wins.length && window.DASH) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) window.DASH.setWin(e.target.dataset.win);
    }), { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    wins.forEach(s => io.observe(s));
  }

  // count-up numbers in prose
  const cu = document.querySelectorAll(".countup");
  if (cu.length) {
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; cio.unobserve(el);
      U.countUp(el, { to: parseFloat(el.dataset.to), dur: 1200, fmt: v => (el.dataset.pre || "") + v.toLocaleString("en-US", { maximumFractionDigits: el.dataset.dec ? +el.dataset.dec : 0 }) + (el.dataset.suf || "") });
    }), { threshold: 0.6 });
    cu.forEach(el => cio.observe(el));
  }

  // term cards: tap-to-open on touch
  document.querySelectorAll(".term").forEach(t => {
    t.addEventListener("click", () => t.classList.toggle("open"));
  });

  // site-render hotspots → drill
  document.querySelectorAll(".hotspot").forEach(h => {
    h.addEventListener("click", e => {
      U.showDrill({ title: h.dataset.t, value: h.dataset.v, sub: h.dataset.s, source: "Site survey · anchor K17", x: e.clientX, y: e.clientY });
    });
  });

  // close drill on escape / scroll far
  addEventListener("keydown", e => { if (e.key === "Escape") U.hideDrill(); });
})();
