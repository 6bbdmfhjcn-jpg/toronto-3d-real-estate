// Data layer · Toronto transit-corridor real-estate study
// Every series traces to sources.js (K anchors). Figures as originally reported.
window.RPT = {

  // ── Annual resale market, as originally reported by TRREB year-end releases ──
  // (pre-2024 boundary vintage; see sources K5–K8)
  annual: [
    { yr: 2015, sales: 101213, avg: 622116,  src: "K5" },
    { yr: 2016, sales: 113040, avg: 729824,  src: "K5" },
    { yr: 2017, sales: 92340,  avg: 822510,  src: "K5" },
    { yr: 2018, sales: 78017,  avg: 787842,  src: "K5" },
    { yr: 2019, sales: 87747,  avg: 819153,  src: "K5" },
    { yr: 2020, sales: 95066,  avg: 929636,  src: "K5" },
    { yr: 2021, sales: 121712, avg: 1095475, src: "K5" },
    { yr: 2022, sales: 75140,  avg: 1189850, src: "K6" },
    { yr: 2023, sales: 65982,  avg: 1126604, src: "K7" },
    { yr: 2024, sales: 70308,  avg: 1120241, src: "K8", derivedSales: true },
    { yr: 2025, sales: 62433,  avg: 1067968, src: "K8" },
  ],
  ytd2026: { label: "Jul 2026", avg: 1003956, src: "K1" },

  // ── 2026 monthly tightening (TRREB monthly releases) ──
  monthly2026: [
    { mo: "May 2026", sales: 6583, listings: 17698, avg: 1069700, hpiYoY: -6.7, src: "K3" },
    { mo: "Jun 2026", sales: 6770, listings: 17282, avg: 1058658, hpiYoY: -5.4, src: "K2" },
    { mo: "Jul 2026", sales: 5995, listings: 14484, avg: 1003956, hpiYoY: -4.6, src: "K1" },
  ],
  jul2026: {
    sales: 5995, salesYoY: -0.9, listings: 14484, listingsYoY: -17.8,
    avg: 1003956, avgYoY: -4.5, hpiYoY: -4.6, benchmark: 934600,
    active: 26098, activeYoY: -12.1, snlr: 41.4, snlrJun: 39.2, snlrJul25: 34.6,
    moi: 4.4, moiJul25: 4.9, src: "K1" // ratio/MOI calcs: K11
  },

  // ── Condominium segment (July 2026) ──
  condo: {
    gtaAvg: 636323, gtaSales: 1564, cityAvg: 672807, citySales: 1054, src: "K12",
    junAvg: 630688, junYoY: -9.5, src: "K13"
  },

  // ── GTHA condo pipeline (Urbanation Q1-2025; CMHC fall 2025 supply report) ──
  // iso tower chart: one slab = 2,500 units
  pipeline: {
    underConstruction: { label: "Under construction · Q1-2025", units: 69042, note: "Down one-third over two years", src: "K9" },
    completions: [
      { label: "2024 actual", units: 29671, state: "solid", src: "K9" },
      { label: "2025 projected", units: 31396, state: "solid", src: "K9" },
      { label: "2026 projected", units: 17487, state: "hollow", src: "K9" },
    ],
    startsQ125: { units: 497, yoY: -79, vsTenYr: -88, note: "Lowest quarterly total since 1996", src: "K9" },
    startsH125: { yoY: -44, condoYoY: -60, note: "Population-adjusted starts lowest since 1996", src: "K10" },
    unsold: { units: 24045, label: "Record unsold new-condo inventory · Q2-2025", src: "K10" },
  },

  // ── Rental (CMHC Rental Market Report, fall 2025; survey Oct 2025) ──
  rental: {
    vacancyPurpose: 3.0, vacancyCondo: 1.0, vacancyNote: "First time at 3% since the pandemic",
    rent2bedPurpose: 2034, rent2bedPurposeGrowth: 3.5, rent2bedCondo: 2904,
    turnoverRent2bed: 2547, turnoverRent2024: 2612, src: "K14"
  },

  // ── Wall-chart timeline · GTA housing 2017–2026 ──
  timeline: [
    { yr: 2017.3, date: "Apr 2017", t: "Fair Housing Plan", d: "Ontario introduces a 15% non-resident speculation tax; the 2017 frenzy breaks.", kind: "policy", src: "K15" },
    { yr: 2018.0, date: "Jan 2018", t: "B-20 stress test", d: "Federal uninsured-mortgage stress test takes effect; sales fall to 78,017 in 2018.", kind: "policy", src: "K5" },
    { yr: 2020.2, date: "Mar 2020", t: "Pandemic shock", d: "Sales freeze, then detachment-era demand floods the 905; 2020 ends at a record $929,636 average.", kind: "event", src: "K5" },
    { yr: 2021.9, date: "2021", t: "Record year", d: "121,712 sales and a $1,095,475 average — both all-time highs in the historic series.", kind: "peak", src: "K5" },
    { yr: 2022.12, date: "Feb 2022", t: "Price peak $1,334,544", d: "The monthly average price tops out; the first BoC hike follows in March.", kind: "peak", src: "K16" },
    { yr: 2022.7, date: "2022–23", t: "Rate-hike cycle", d: "Overnight rate 0.25% → 5.00%; 2022 sales fall 38.2% to 75,140.", kind: "crash", src: "K6" },
    { yr: 2024.45, date: "Jun 2024", t: "First rate cut", d: "Bank of Canada begins easing; sales stay near two-decade lows through 2024.", kind: "policy", src: "K8" },
    { yr: 2025.9, date: "2025", t: "Tariff-year trough", d: "62,433 sales — the lowest annual total of the series; average price −4.7% to $1,067,968.", kind: "crash", src: "K8" },
    { yr: 2025.62, date: "Q1–Q2 2025", t: "Construction collapse", d: "Condo starts −79% YoY; unsold new-condo inventory hits a record 24,045 units.", kind: "crash", src: "K9" },
    { yr: 2026.5, date: "Jul 2026", t: "Supply-led tightening", d: "New listings −17.8% YoY while sales hold flat; SNLR climbs to 41.4%.", kind: "now", src: "K1" },
  ],

  // ── Verdict scale · bull/bear on the corridor thesis ──
  verdict: {
    bull: [
      { w: "Listings −17.8% YoY", full: "July 2026 new listings fell 17.8% — the largest annual decline of 2026 — withdrawing competition for active buyers.", src: "K1" },
      { w: "Sales +9.4% in June", full: "June 2026 sales rose 9.4% YoY, a fourth consecutive monthly gain; H1-2026 sales edged ahead of H1-2025.", src: "K2" },
      { w: "SNLR 34.6 → 41.4%", full: "Sales-to-new-listings ratio up from 34.6% (Jul 2025) to 41.4% (Jul 2026) — steady drift toward sellers.", src: "K11" },
      { w: "Price declines losing momentum", full: "Annual HPI decline narrowed from −6.7% (May) to −4.6% (Jul); seasonally adjusted HPI edged up in June and July.", src: "K1" },
    ],
    bear: [
      { w: "Prices still −4.5% YoY", full: "July 2026 average price $1,003,956, down 4.5% YoY; benchmark $934,600, down 4.6%.", src: "K1" },
      { w: "Condo starts −79%", full: "Q1-2025 GTHA condo starts of 497 units were 79% below a year earlier and 88% under the 10-year average.", src: "K9" },
      { w: "Record unsold inventory", full: "24,045 unsold new-condo units across all stages of development in Q2-2025 — a record.", src: "K10" },
      { w: "Demand outflow", full: "Fewer non-permanent residents and student outflows cut renter household formation; GTA purpose-built vacancy reached 3%.", src: "K14" },
    ],
    triggers: [
      { w: "Two consecutive months of YoY price gains", src: "K1" },
      { w: "Condo starts returning toward the 10-yr average", src: "K9" },
    ],
    falsifiers: [
      { w: "SNLR falls back under 35% for a quarter", src: "K11" },
      { w: "Active listings re-expand above ~27,500", src: "K13" },
      { w: "Renewed double-digit HPI declines", src: "K1" },
    ],
  },

  // ── Right rail stat blocks (switch with section) ──
  rail: {
    frame:   { stats: [["AVG PRICE · JUL 2026", "$1,003,956"], ["HPI YoY", "−4.6%"], ["SNLR", "41.4%"], ["MONTHS OF SUPPLY", "4.4"]], phase: 2 },
    site:    { stats: [["CITY CONDO AVG", "$672,807"], ["GTA CONDO AVG", "$636,323"], ["CONDO 2-BED RENT", "$2,904"], ["CONDO VACANCY", "1.0%"]], phase: 2 },
    market:  { stats: [["2025 SALES", "62,433"], ["RECORD LOW SINCE", "SERIES LOW"], ["2025 AVG", "$1,067,968"], ["YoY", "−4.7%"]], phase: 1 },
    supply:  { stats: [["UNITS UNDER CONST.", "69,042"], ["Q1-25 STARTS", "497"], ["UNSOLD INVENTORY", "24,045"], ["2026 COMPLETIONS", "17,487 proj."]], phase: 1 },
    verdict: { stats: [["CURRENT READ", "STABILIZING"], ["PRICE TREND", "−4.5% YoY"], ["BALANCE", "TIGHTENING"], ["REGIME", "SUPPLY-LED"]], phase: 2 },
  },
  phases: ["CORRECTION", "CAPITULATION", "STABILIZATION", "RECOVERY", "EXPANSION"],
};
