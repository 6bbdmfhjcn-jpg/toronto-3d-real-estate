// Source register · every key number carries a dated anchor
window.SRC = [
  { k: "K1",  cat: "industry", date: "2026-08-06", who: "TRREB — GTA housing market tightens in July (news release & Market Watch)", what: "Jul 2026: 5,995 sales (−0.9% YoY); 14,484 new listings (−17.8%); avg $1,003,956 (−4.5%); HPI −4.6% YoY" },
  { k: "K2",  cat: "industry", date: "2026-07-03", who: "TRREB — Market gains traction with strong June sales (news release)", what: "Jun 2026: 6,770 sales (+9.4%); 17,282 new listings (−12.9%); avg $1,058,658 (−3.9%); HPI −5.4%" },
  { k: "K3",  cat: "industry", date: "2026-06-03", who: "TRREB — Spring home sales stronger than last year (news release)", what: "May 2026: 6,583 sales (+6.3%); 17,698 new listings (−18.9%); avg $1,069,700 (−4.6%); HPI −6.7%" },
  { k: "K5",  cat: "industry", date: "2024-01-04", who: "TRREB Market Watch Dec 2023 — Historic Annual Statistics table", what: "Annual sales & average price 2015–2021, as originally reported (pre-2024 boundary vintage)" },
  { k: "K6",  cat: "industry", date: "2023-01-05", who: "TRREB — A look back at the 2022 GTA housing market (news release)", what: "2022: 75,140 sales (−38.2%); avg $1,189,850 (+8.6%); 152,873 new listings" },
  { k: "K7",  cat: "industry", date: "2024-01-04", who: "TRREB — December & year-end 2023 stats (news release)", what: "2023: 65,982 sales (−12.1%); avg $1,126,604 (−5.4%)" },
  { k: "K8",  cat: "industry", date: "2026-01-07", who: "TRREB — 2025 ends with more affordable market (year-end release)", what: "2025: 62,433 sales (−11.2%); 186,753 new listings (+10.1%); avg $1,067,968 (−4.7% vs $1,120,241 in 2024). 2024 sales derived from the stated −11.2%" },
  { k: "K9",  cat: "industry", date: "2025-04-15", who: "Urbanation — Q1-2025 GTHA condominium market survey", what: "69,042 condo units under construction; Q1-25 starts 497 (−79% YoY, −88% vs 10-yr avg, lowest since 1996); completions 29,671 (2024), 31,396 proj. (2025), 17,487 proj. (2026)" },
  { k: "K10", cat: "industry", date: "2025-09-09", who: "CMHC fall 2025 Housing Supply Report, via STOREYS", what: "Toronto starts −44% H1-2025 (condo −60%), population-adjusted lowest since 1996; Urbanation Q2-2025 record 24,045 unsold new-condo units" },
  { k: "K11", cat: "broker",   date: "2026-08-17", who: "WOWA — Toronto housing market update (TRREB-based calculations)", what: "Jul 2026: SNLR 41.4% (vs 39.2% Jun 2026, 34.6% Jul 2025); months of supply 4.4; active listings 26,098 (−12.1% YoY); benchmark $934,600" },
  { k: "K12", cat: "broker",   date: "2026-08-07", who: "TRREB July 2026 breakdown, via ViewHomes market statistics", what: "Jul 2026 condo apartments: GTA avg $636,323 (1,564 sales); City of Toronto avg $672,807 (1,054 sales)" },
  { k: "K13", cat: "broker",   date: "2026-07-05", who: "TRREB June 2026 breakdown, via Harvey Kalles market update", what: "Jun 2026 condo avg $630,688 (−9.5% YoY); active listings 27,329 (−13.5% YoY); months of inventory ~4.0" },
  { k: "K14", cat: "industry", date: "2025-12-11", who: "CMHC — Rental Market Report, fall 2025 (survey Oct 2025)", what: "GTA purpose-built vacancy 3.0% (first time since pandemic); rental-condo vacancy 1.0%; 2-bed rents: purpose-built $2,034 (+3.5%), condo $2,904; turnover rent $2,547" },
  { k: "K15", cat: "industry", date: "2017-04-20", who: "Ontario — Fair Housing Plan (policy record)", what: "16 measures incl. 15% non-resident speculation tax in the Greater Golden Horseshoe" },
  { k: "K16", cat: "industry", date: "2022-03-03", who: "TRREB — February 2022 Market Watch", what: "Feb 2022 average selling price $1,334,544 — the cycle peak" },
  { k: "K17", cat: "kimi",     date: "2026-08-19", who: "Site survey — oblique aerial capture (user-supplied) + photorealistic render", what: "Representative North Toronto transit-corridor node; anatomy read from the imagery, not a specific-address appraisal" },
];

// render the K-anchor register into #source-list (.src-row grid per theme)
(function () {
  const host = document.getElementById("source-list");
  if (!host || !window.SRC) return;
  const catName = { company: "Company disclosure", broker: "Broker / data-vendor relay", industry: "Industry & official", kimi: "Research compilation" };
  window.SRC.forEach(s => {
    const div = document.createElement("div");
    div.className = "src-row";
    div.innerHTML = `<span class="s-fact"><b class="mono">${s.k}</b> · ${s.what}</span>
      <span class="s-cite"><span class="src-cat ${s.cat}">${catName[s.cat] || s.cat}</span> &nbsp;${s.who} · ${s.date}</span>`;
    host.appendChild(div);
  });
})();
