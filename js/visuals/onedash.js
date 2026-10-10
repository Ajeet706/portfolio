/* =====================================================================
   ONE DASH — end-to-end NBFC lifecycle analytics. Synthetic re-creation
   of the Power BI report pages. ALL NUMBERS ARE DEMO DATA.
   Every page is generated from ONE seeded, branch-level demo dataset, so
   the pages reconcile with each other:
     branch → region → company totals · DPD buckets = active loans ·
     approved + rejected + pending = assessed · disbursed ≤ approved ·
     opening book + new loans − closed = closing book.
   Regions, branches (BR-01…), products and IDs are generic demo values.
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, line, funnel, comp, html, esc } = window.Charts;
  const VIS = window.VIS;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(20260930);
  const MONTHS = ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const nf = new Intl.NumberFormat("en-IN");
  const nf1 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const I = (v) => nf.format(Math.round(v));
  const P = (v, d = 1) => (v * 100).toFixed(d) + "%";
  const CR = (v) => "₹" + nf.format(Math.round(v / 1e7)) + " Cr";        // KPI tiles: short
  const CR1 = (v) => "₹" + nf1.format(v / 1e7) + " Cr";                    // tables / tooltips
  const LK = (v) => "₹" + (v / 1e5).toFixed(2) + " L";
  const DAYS = (v) => v.toFixed(1) + " days";
  /* integer split of a total by shares (largest remainder) — parts always add up */
  function alloc(total, shares) {
    const s = sum(shares);
    const raw = shares.map((x) => (total * x) / s);
    const out = raw.map(Math.floor);
    let left = total - sum(out);
    const order = raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; left > 0; k++, left--) out[order[k % order.length][1]]++;
    return out;
  }

  /* ================================================================
     DEMO DATASET — Sep 26 (origination cohort + month-end book)
     ================================================================ */
  const EMI = 15400;                                   // average EMI per account (demo)
  const EFF = [0.992, 0.80, 0.56, 0.38, 0.14];         // collection efficiency by bucket (demo)
  const BUCKETS = ["Current", "1–30", "31–60", "61–90", "90+"];
  const BUCKET_COL = ["c1", "c3", "c2", "c4", "ink"];
  const REGION_NAMES = ["North", "South", "East", "West", "Central"];
  const RATE = { app: 0.46, kyc: 0.95, bur: 0.93, asr: 0.86, fi: 0.95, col: 0.96, apv: 0.91, doc: 0.96, dis: 0.965 };

  const BR = [
    ["BR-01", "North", 820], ["BR-02", "North", 690], ["BR-03", "North", 540],
    ["BR-04", "South", 760], ["BR-05", "South", 610],
    ["BR-06", "East", 470], ["BR-07", "East", 420],
    ["BR-08", "West", 880], ["BR-09", "West", 650], ["BR-10", "West", 450],
    ["BR-11", "Central", 580], ["BR-12", "Central", 390],
  ].map(([id, region, lead]) => {
    const v = () => 1 + (R() - 0.5) * 0.06;
    const r = (k) => Math.min(0.99, RATE[k] * v());
    const b = { id, region, lead };
    b.app = Math.round(lead * r("app"));
    b.kyc = Math.round(b.app * r("kyc"));
    b.bur = Math.round(b.kyc * r("bur"));
    b.asr = Math.round(b.bur * r("asr"));
    b.fi = Math.round(b.asr * r("fi"));
    b.col = Math.round(b.fi * r("col"));
    b.pend = Math.round(b.col * 0.035 * v());
    b.apv = Math.round(b.col * r("apv"));
    b.doc = Math.round(b.apv * r("doc"));
    b.dis = Math.round(b.doc * r("dis"));
    b.risk = 0.75 + R() * 0.6;
    b.act = Math.round(b.dis * (28 + R() * 6));
    const dl = [0.062, 0.023, 0.011, 0.019].map((s) => Math.round(b.act * s * b.risk * (1 + (R() - 0.5) * 0.1)));
    b.dpd = [b.act - sum(dl)].concat(dl);
    b.legal = Math.round(b.dpd[4] * 0.4);
    const cf = 1 - (b.risk - 1) * 0.03;
    b.bDemand = b.dpd.map((n) => n * EMI);
    b.bColl = b.bDemand.map((d, k) => Math.round(d * Math.min(1, EFF[k] * cf)));
    b.demand = sum(b.bDemand); b.coll = sum(b.bColl);
    b.d30 = b.dpd[2] + b.dpd[3] + b.dpd[4];
    b.eff = b.coll / b.demand;
    return b;
  });

  const KEYS = ["lead", "app", "kyc", "bur", "asr", "fi", "col", "pend", "apv", "doc", "dis", "act", "legal", "demand", "coll", "d30"];
  const total = (rows) => {
    const t = {};
    KEYS.forEach((k) => { t[k] = sum(rows.map((b) => b[k])); });
    t.dpd = [0, 1, 2, 3, 4].map((k) => sum(rows.map((b) => b.dpd[k])));
    t.bDemand = [0, 1, 2, 3, 4].map((k) => sum(rows.map((b) => b.bDemand[k])));
    t.bColl = [0, 1, 2, 3, 4].map((k) => sum(rows.map((b) => b.bColl[k])));
    t.rej = t.bur - t.apv - t.pend;                        // rejected or dropped after entering assessment
    t.eff = t.coll / t.demand;
    return t;
  };
  const T = total(BR);
  const REG = REGION_NAMES.map((name) => Object.assign({ name }, total(BR.filter((b) => b.region === name))));

  /* products (company level; every split adds back to the company total) */
  const PROD = [
    { n: "Used CV", sApp: 37, sApv: 36, sDis: 37, ticket: 6.4e5, sAct: 40, pos: 3.9e5, tat: 9.0 },
    { n: "New CV", sApp: 17, sApv: 18, sDis: 18, ticket: 18.5e5, sAct: 15, pos: 10.8e5, tat: 7.6 },
    { n: "Tractor", sApp: 16, sApv: 15, sDis: 16, ticket: 6.1e5, sAct: 17, pos: 3.6e5, tat: 9.8 },
    { n: "Two-wheeler", sApp: 20, sApv: 22, sDis: 20, ticket: 0.92e5, sAct: 18, pos: 0.48e5, tat: 3.4 },
    { n: "MSME", sApp: 10, sApv: 9, sDis: 9, ticket: 8.6e5, sAct: 10, pos: 5.2e5, tat: 14.0 },
  ];
  const split = (tot, key) => alloc(tot, PROD.map((p) => p[key]));
  const pApp = split(T.app, "sApp"), pBur = split(T.bur, "sApp"), pApv = split(T.apv, "sApv"), pDis = split(T.dis, "sDis"), pAct = split(T.act, "sAct");
  PROD.forEach((p, i) => {
    p.app = pApp[i]; p.bur = pBur[i]; p.apv = pApv[i]; p.dis = pDis[i]; p.act = pAct[i];
    p.amt = p.dis * p.ticket; p.aum = p.act * p.pos;
  });
  T.amt = sum(PROD.map((p) => p.amt));
  T.aum = sum(PROD.map((p) => p.aum));

  /* rejection reasons — each maps to the stage where the case left; they add up to T.rej */
  const asrDrop = alloc(T.bur - T.asr, [45, 30, 25]);
  const REASONS = [
    { l: "Income / FOIR", v: asrDrop[0] }, { l: "Policy / eligibility", v: asrDrop[1] }, { l: "Bureau history", v: asrDrop[2] },
    { l: "FI negative", v: T.asr - T.fi }, { l: "Collateral / valuation", v: T.fi - T.col }, { l: "Declined at sanction", v: T.col - T.apv - T.pend },
  ];

  /* approved but not yet disbursed, by age since approval */
  const PIPE = alloc(T.apv - T.dis, [46, 31, 15, 8]).map((v, i) => ({ l: ["0–3 days", "4–7 days", "8–15 days", "Over 15 days"][i], v }));

  /* turnaround (disbursed cases, average days per step; steps add up to the login → disbursal average) */
  const STEPS = [["Application → KYC", 0.6], ["KYC → Bureau", 0.3], ["Bureau → Assessment", 1.4], ["Assessment → FI", 1.8],
    ["FI → Collateral", 1.1], ["Collateral → Decision", 0.9], ["Decision → Documents", 1.2], ["Documents → Disbursal", 0.9]];
  const TAT = +sum(STEPS.map((s) => s[1])).toFixed(1);   // 8.2 days
  const TAT_BANDS = alloc(T.dis, [10, 42, 39, 8, 1]).map((v, i) => ({ l: ["0–3 d", "4–7 d", "8–14 d", "15–30 d", "30+ d"][i], v }));

  /* 12-month series; the last point is always the Sep 26 value above */
  const disN = MONTHS.map((_, i) => (i === 11 ? T.dis : Math.round(T.dis * (1 - 0.011 * (11 - i)) * (1 + 0.035 * Math.sin(i * 1.3) + (R() - 0.5) * 0.04))));
  const ticketNow = T.amt / T.dis;
  const amtN = disN.map((n, i) => (i === 11 ? T.amt : n * ticketNow * (1 - 0.003 * (11 - i))));
  const actN = new Array(12), closeN = new Array(12);
  actN[11] = T.act;
  for (let i = 11; i >= 0; i--) {
    closeN[i] = Math.round(actN[i] * 0.0285 * (1 + (R() - 0.5) * 0.08));
    if (i > 0) actN[i - 1] = actN[i] - disN[i] + closeN[i];
  }
  const appN = MONTHS.map((_, i) => (i === 11 ? T.app : Math.round(T.app * (1 - 0.009 * (11 - i)) * (1 + 0.03 * Math.sin(i * 1.3) + (R() - 0.5) * 0.04))));
  const apprNow = T.apv / T.bur;
  const apprN = MONTHS.map((_, i) => (i === 11 ? apprNow : apprNow - 0.0016 * (11 - i) + (R() - 0.5) * 0.012));
  const d30Now = T.d30 / T.act, d90Now = T.dpd[4] / T.act;
  const d30N = MONTHS.map((_, i) => (i === 11 ? d30Now : d30Now + 0.0004 * (11 - i) + (R() - 0.5) * 0.0018));
  const d90N = MONTHS.map((_, i) => (i === 11 ? d90Now : d90Now + 0.00018 * (11 - i) + (R() - 0.5) * 0.0008));
  const effN = MONTHS.map((_, i) => (i === 11 ? T.eff : T.eff - 0.0007 * (11 - i) + (R() - 0.5) * 0.006));
  const demandN = actN.map((a) => (T.demand * a) / T.act);
  const collN = demandN.map((d, i) => d * effN[i]);
  const tatN = MONTHS.map((_, i) => (i === 11 ? TAT : TAT + 0.08 * (11 - i) + (R() - 0.5) * 0.3));

  /* ================================================================
     Report shell: title bar, page tabs, slicers
     ================================================================ */
  const PAGES = [["executive", "Executive"], ["funnel", "Funnel"], ["credit", "Credit"], ["disbursement", "Disbursal"], ["portfolio", "Portfolio"],
    ["collection", "Collection"], ["delinquency", "Delinquency"], ["branch", "Branch"], ["tat", "TAT"], ["stages", "Lifecycle"]];
  const SLICERS = ["Month: Sep 26", "Region: All", "Product: All", "Branch: All"];
  const tabCss = (on) => on
    ? "padding:.34rem .7rem;border:1px solid var(--rule);border-bottom-color:var(--paper);border-radius:4px 4px 0 0;background:var(--paper);color:var(--ink);font-weight:600;margin-bottom:-1px;white-space:nowrap"
    : "padding:.34rem .7rem;border:1px solid transparent;color:var(--ink-3);white-space:nowrap";
  function shell(page, title, body, slicers) {
    return `<div class="app" style="font-size:.82rem">
      <div class="app-top" style="flex-wrap:wrap"><b>ONE DASH</b><span style="opacity:.75">NBFC lifecycle analytics</span><span class="sp">Demo report · synthetic data</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;padding:.4rem .6rem 0;background:var(--paper-raised);border-bottom:1px solid var(--rule);font-size:.72rem">${PAGES.map(([k, t]) => `<span style="${tabCss(k === page)}">${esc(t)}</span>`).join("")}</div>
      <div class="dash" style="border-radius:0">
        <div class="dash-bar"><strong>${esc(title)}</strong><div class="dash-filters">${(slicers || SLICERS).map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>
        ${body}
      </div></div>`;
  }
  const kpis = (items) => `<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,112px),1fr))">${items.map((k) =>
    `<div class="kpi"><span class="kpi-l">${esc(k.l)}</span><span class="kpi-v" style="white-space:nowrap">${esc(k.v)}</span>${k.s ? `<span class="kpi-s ${k.cls || ""}">${esc(k.s)}</span>` : ""}</div>`).join("")}</div>`;
  const panel = (title, slotId, extra = "", note = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div>${note ? `<div style="font-size:.7rem;color:var(--ink-3);margin:-.2rem 0 .35rem;line-height:1.35">${esc(note)}</div>` : ""}<div data-slot="${slotId}"></div></div>`;
  const panelHTML = (title, inner, extra = "", note = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div>${note ? `<div style="font-size:.7rem;color:var(--ink-3);margin:-.2rem 0 .35rem;line-height:1.35">${esc(note)}</div>` : ""}${inner}</div>`;
  const grid = (inner) => `<div class="dash-grid">${inner}</div>`;
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const dot = (c) => `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--${c});margin-right:6px;vertical-align:middle"></span>`;
  const b = (s) => `<b>${esc(s)}</b>`;
  const totalRow = (r) => (r._total ? "best" : "");

  /* compact stage strip used on the executive page */
  function strip(nodes) {
    return `<div style="display:flex;flex-wrap:wrap;align-items:stretch;gap:6px">${nodes.map((n, i) => {
      const sep = n.sep ? `<span aria-hidden="true" style="align-self:stretch;width:1px;background:var(--rule-strong);margin:0 4px"></span>` : i ? `<span aria-hidden="true" style="align-self:center;color:var(--ink-3);font-size:.8rem">→</span>` : "";
      return `${sep}<div style="flex:1 1 86px;min-width:0;border:1px solid var(--rule);border-radius:4px;padding:.4rem .55rem;background:var(--paper);box-shadow:inset 0 3px 0 var(--${n.c})">
        <div style="font-size:.68rem;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.l)}</div>
        <div style="font-weight:600;font-size:1.02rem;font-variant-numeric:tabular-nums;line-height:1.3">${esc(n.v)}</div>
        <div style="font-size:.66rem;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.s || "")}</div></div>`;
    }).join("")}</div>`;
  }

  const ORIG_FUNNEL = [
    { label: "Leads", value: T.lead }, { label: "Applications", value: T.app }, { label: "KYC verified", value: T.kyc },
    { label: "Bureau cleared", value: T.bur }, { label: "Assessment OK", value: T.asr }, { label: "FI positive", value: T.fi },
    { label: "Collateral OK", value: T.col }, { label: "Approved", value: T.apv }, { label: "Docs complete", value: T.doc },
    { label: "Disbursed", value: T.dis, color: "c3" },
  ];

  /* ================================================================
     01 · EXECUTIVE OVERVIEW
     ================================================================ */
  VIS["od-executive"] = {
    title: "ONE DASH · Executive Overview",
    sub: "Page 1 of 10. The whole lifecycle for Sep 26 on one page: origination, the book, collections and delinquency.",
    caption: "Lead-to-NPA strip, disbursement trend, origination funnel, DPD mix of the book and disbursals by region. All pages share one demo dataset, so every figure here reconciles with the detail pages.",
    render(el) {
      el.innerHTML = shell("executive", "Executive Overview", kpis([
        { l: "Applications", v: I(T.app), s: "from " + I(T.lead) + " leads" },
        { l: "Approval rate", v: P(apprNow), s: I(T.apv) + " of " + I(T.bur) + " assessed" },
        { l: "Disbursed", v: CR(T.amt), s: I(T.dis) + " loans" },
        { l: "Active loans", v: I(T.act), s: "AUM " + CR(T.aum) },
        { l: "Collection efficiency", v: P(T.eff), s: CR(T.coll) + " of " + CR(T.demand) },
        { l: "NPA (90+ DPD)", v: P(d90Now, 2), s: I(T.dpd[4]) + " accounts" },
      ]) + grid(
        panelHTML("Lifecycle at a glance · Sep 26", strip([
          { l: "Leads", v: I(T.lead), s: "captured in month", c: "c3" },
          { l: "Applications", v: I(T.app), s: P(T.app / T.lead, 0) + " of leads", c: "c3" },
          { l: "Approved", v: I(T.apv), s: P(apprNow, 0) + " of assessed", c: "c2" },
          { l: "Disbursed", v: I(T.dis), s: P(T.dis / T.apv, 0) + " of approved", c: "c2" },
          { sep: true, l: "Active loans", v: I(T.act), s: "book at 30 Sep", c: "c1" },
          { l: "Current", v: I(T.dpd[0]), s: P(T.dpd[0] / T.act) + " of book", c: "c1" },
          { l: "30+ DPD", v: I(T.d30), s: P(d30Now) + " of book", c: "c4" },
          { l: "NPA 90+", v: I(T.dpd[4]), s: P(d90Now, 2) + " of book", c: "c4" },
        ]), "span2") +
        panel("Disbursed amount · ₹ Cr · last 12 months", "t") +
        panel("Origination funnel · Sep 26", "f", "", "Share of the previous stage on the right.") +
        panel("Active book by DPD bucket · accounts", "d") +
        panel("Disbursals by region · Sep 26", "r")));
      bars(slot(el, "t"), { cats: MONTHS, series: [{ name: "Disbursed", values: amtN.map((v) => v / 1e7), colors: MONTHS.map((_, i) => (i === 11 ? "c3" : "c1")), color: "c1" }], fmt: (v) => "₹" + v.toFixed(1) + " Cr", yFmt: (v) => v.toFixed(0), h: 196, label: "Disbursed amount by month" });
      funnel(slot(el, "f"), { stages: [ORIG_FUNNEL[0], ORIG_FUNNEL[1], { label: "Assessed", value: T.bur }, ORIG_FUNNEL[7], ORIG_FUNNEL[9]], rowH: 32, label: "Origination funnel" });
      comp(slot(el, "d"), { parts: BUCKETS.map((l, k) => ({ label: l, value: T.dpd[k], color: BUCKET_COL[k] })), fmt: I, label: "DPD buckets" });
      barH(slot(el, "r"), { data: REG.map((r) => ({ label: r.name, value: r.dis, tip: I(r.dis) + " loans · " + P(r.dis / T.dis) + " of company" })), fmt: I, color: "c3", label: "Disbursals by region" });
    },
  };

  /* ================================================================
     02 · APPLICATION FUNNEL
     ================================================================ */
  VIS["od-funnel"] = {
    title: "ONE DASH · Application Funnel",
    sub: "Page 2 of 10. Sep 26 origination cohort: how many cases cleared each of the ten stages from lead to disbursal.",
    caption: "Each bar is the count that cleared the stage; the figure on the right is conversion from the previous stage. Drop-offs show where volume is lost.",
    render(el) {
      el.innerHTML = shell("funnel", "Application Funnel", kpis([
        { l: "Leads", v: I(T.lead), s: "Sep 26" },
        { l: "Applications", v: I(T.app), s: P(T.app / T.lead) + " of leads" },
        { l: "KYC verified", v: I(T.kyc), s: P(T.kyc / T.app) + " of applications" },
        { l: "Assessed", v: I(T.bur), s: "entered credit assessment" },
        { l: "Approved", v: I(T.apv), s: P(apprNow) + " of assessed" },
        { l: "Disbursed", v: I(T.dis), s: P(T.dis / T.lead) + " of leads" },
      ]) + grid(
        panel("Origination funnel · 10 stages", "f", "", "Cleared each stage · conversion from previous stage") +
        panel("Cases lost at each step", "d", "", "Rejected, withdrawn or still pending at that step") +
        panel("Applications by product · Sep 26", "p") +
        panel("Applications and disbursals · last 12 months", "t")));
      funnel(slot(el, "f"), { stages: ORIG_FUNNEL, rowH: 29, label: "Origination funnel" });
      const steps = ORIG_FUNNEL.slice(1).map((s, i) => ({ label: ORIG_FUNNEL[i].label + " → " + s.label, value: ORIG_FUNNEL[i].value - s.value }));
      barH(slot(el, "d"), { data: steps.map((s) => ({ label: s.label.replace("Applications", "Apps"), value: s.value, tip: I(s.value) + " cases" })), fmt: I, color: "c4", rowH: 29, label: "Cases lost by step" });
      bars(slot(el, "p"), { cats: PROD.map((p) => p.n), series: [{ name: "Applications", values: PROD.map((p) => p.app), color: "c3" }], fmt: I, topLabels: true, h: 200, label: "Applications by product" });
      line(slot(el, "t"), { x: MONTHS, series: [{ name: "Applications", values: appN, color: "c3" }, { name: "Disbursals", values: disN, color: "c1" }], yFmt: I, h: 200, markers: true, label: "Applications and disbursals by month" });
    },
  };

  /* ================================================================
     03 · CREDIT DECISION
     ================================================================ */
  VIS["od-credit"] = {
    title: "ONE DASH · Credit Decision",
    sub: "Page 3 of 10. What happened to every application that entered credit assessment in Sep 26.",
    caption: "Approved + rejected / dropped + pending = assessed. Rejection reasons are grouped by the stage where the case left, so they add up to the rejected total.",
    render(el) {
      el.innerHTML = shell("credit", "Credit Decision", kpis([
        { l: "Assessed", v: I(T.bur), s: "entered credit assessment" },
        { l: "Approved", v: I(T.apv), s: P(apprNow) + " approval rate" },
        { l: "Rejected / dropped", v: I(T.rej), s: P(T.rej / T.bur) + " of assessed" },
        { l: "Pending decision", v: I(T.pend), s: P(T.pend / T.bur) + " of assessed" },
        { l: "Approval rate", v: P(apprNow), s: "approved ÷ assessed" },
        { l: "Final-sanction declines", v: I(REASONS[5].v), s: "after FI and collateral" },
      ]) + grid(
        panel("Decision outcome of assessed applications", "o", "span2") +
        panel("Rejected / dropped by reason", "r", "", "Assessment reasons, then FI, collateral and sanction") +
        panel("Approval rate by product", "p", "", "Approved ÷ assessed for each product") +
        panel("Approval rate · last 12 months", "t", "span2")));
      comp(slot(el, "o"), { parts: [{ label: "Approved", value: T.apv, color: "c1" }, { label: "Rejected / dropped", value: T.rej, color: "c4" }, { label: "Pending", value: T.pend, color: "n" }], fmt: I, label: "Decision outcome" });
      barH(slot(el, "r"), { data: REASONS.map((r) => ({ label: r.l, value: r.v, tip: I(r.v) + " · " + P(r.v / T.rej) + " of rejected" })), fmt: I, color: "c4", label: "Rejections by reason" });
      barH(slot(el, "p"), { data: PROD.map((p) => ({ label: p.n, value: p.apv / p.bur, tip: I(p.apv) + " of " + I(p.bur) + " assessed" })), fmt: (v) => P(v), max: 1, color: "c1", ref: { value: apprNow, label: "Company " + P(apprNow) }, label: "Approval rate by product" });
      line(slot(el, "t"), { x: MONTHS, series: [{ name: "Approval rate", values: apprN, color: "c1", area: true }], yMin: 0.6, yMax: 0.8, yFmt: (v) => P(v, 1), h: 170, markers: true, label: "Approval rate by month" });
    },
  };

  /* ================================================================
     04 · DISBURSEMENT
     ================================================================ */
  VIS["od-disbursement"] = {
    title: "ONE DASH · Disbursement",
    sub: "Page 4 of 10. From approval to money out: documentation, disbursals, amount and the approved-but-not-disbursed pipeline.",
    caption: "Disbursed ≤ documents complete ≤ approved. The pipeline panel splits the gap between approved and disbursed by days since approval.",
    render(el) {
      el.innerHTML = shell("disbursement", "Disbursement", kpis([
        { l: "Approved", v: I(T.apv), s: "Sep 26 cohort" },
        { l: "Documents complete", v: I(T.doc), s: P(T.doc / T.apv) + " of approved" },
        { l: "Disbursed", v: I(T.dis), s: P(T.dis / T.apv) + " of approved" },
        { l: "Disbursed amount", v: CR(T.amt), s: "Sep 26" },
        { l: "Average ticket", v: LK(ticketNow), s: "per loan" },
        { l: "Awaiting disbursal", v: I(T.apv - T.dis), s: "approved, not disbursed" },
      ]) + grid(
        panel("Disbursed amount by product · ₹ Cr", "p") +
        panel("Approved, not yet disbursed · days since approval", "a", "", I(T.apv - T.dis) + " cases = approved − disbursed") +
        panel("Disbursed amount · ₹ Cr · last 12 months", "t") +
        panel("Disbursals by region · loans", "r")));
      barH(slot(el, "p"), { data: PROD.map((p) => ({ label: p.n, value: p.amt / 1e7, tip: I(p.dis) + " loans · avg " + LK(p.ticket) })), fmt: (v) => "₹" + v.toFixed(1) + " Cr", color: "c1", label: "Disbursed amount by product" });
      barH(slot(el, "a"), { data: PIPE.map((p, i) => ({ label: p.l, value: p.v, color: i === 3 ? "c4" : "c2" })), fmt: I, label: "Pipeline by age" });
      bars(slot(el, "t"), { cats: MONTHS, series: [{ name: "Disbursed", values: amtN.map((v) => v / 1e7), color: "c1", tips: disN.map((n) => I(n) + " loans") }], fmt: (v) => "₹" + v.toFixed(1) + " Cr", yFmt: (v) => v.toFixed(0), h: 196, label: "Disbursed amount by month" });
      bars(slot(el, "r"), { cats: REG.map((r) => r.name), series: [{ name: "Loans", values: REG.map((r) => r.dis), color: "c3" }], fmt: I, topLabels: true, h: 196, label: "Disbursals by region" });
    },
  };

  /* ================================================================
     05 · PORTFOLIO
     ================================================================ */
  VIS["od-portfolio"] = {
    title: "ONE DASH · Portfolio",
    sub: "Page 5 of 10. The loan book at 30 Sep 26: size, movement, product and region.",
    caption: "Opening book + new loans − closures = closing book. New loans in the month equal the disbursals on the funnel page.",
    render(el) {
      const open = actN[10], net = T.dis - closeN[11];
      el.innerHTML = shell("portfolio", "Portfolio", kpis([
        { l: "Active loans", v: I(T.act), s: "30 Sep 26" },
        { l: "AUM (POS)", v: CR(T.aum), s: "principal outstanding" },
        { l: "Average POS", v: LK(T.aum / T.act), s: "per active loan" },
        { l: "New loans", v: I(T.dis), s: "disbursed in Sep 26" },
        { l: "Closed", v: I(closeN[11]), s: "closed in Sep 26" },
        { l: "Net change", v: (net >= 0 ? "+" : "") + I(net), s: P(net / open, 2) + " of opening book", cls: "up-good" },
      ]) + grid(
        panelHTML("Book movement · Sep 26", html.table([{ k: "l", l: "Movement" }, { k: "v", l: "Loans", cls: "r", html: (v, r) => (r._total ? b(I(v)) : I(v)) }],
          [{ l: "Opening book · 31 Aug 26", v: open }, { l: "+ New loans (disbursed)", v: T.dis }, { l: "− Closed", v: closeN[11] }, { l: "= Closing book · 30 Sep 26", v: T.act, _total: true }], { rowClass: totalRow }), "", "Reconciles: opening + new − closed = closing") +
        panel("Active loans · last 12 months", "t") +
        panel("AUM by product · ₹ Cr", "p") +
        panel("Active loans by region", "r")));
      line(slot(el, "t"), { x: MONTHS, series: [{ name: "Active loans", values: actN, color: "c1", area: true }], yMin: Math.floor(Math.min(...actN) / 2000) * 2000 - 2000, yMax: Math.ceil(Math.max(...actN) / 2000) * 2000, yFmt: I, h: 190, markers: true, label: "Active loans by month" });
      barH(slot(el, "p"), { data: PROD.map((p) => ({ label: p.n, value: p.aum / 1e7, tip: I(p.act) + " loans · avg POS " + LK(p.pos) })), fmt: (v) => "₹" + nf.format(Math.round(v)) + " Cr", color: "c1", label: "AUM by product" });
      barH(slot(el, "r"), { data: REG.map((r) => ({ label: r.name, value: r.act })), fmt: I, color: "c3", label: "Active loans by region" });
    },
  };

  /* ================================================================
     06 · COLLECTION
     ================================================================ */
  VIS["od-collection"] = {
    title: "ONE DASH · Collection",
    sub: "Page 6 of 10. Current-month EMI demand against what was collected, by DPD bucket and region.",
    caption: "Collection efficiency = collected ÷ EMI demand. Bucket rows add up to the company total; efficiency falls steeply as accounts age.",
    render(el) {
      const od = [1, 2, 3, 4];
      const odDem = sum(od.map((k) => T.bDemand[k])), odCol = sum(od.map((k) => T.bColl[k]));
      el.innerHTML = shell("collection", "Collection", kpis([
        { l: "EMI demand", v: CR(T.demand), s: I(T.act) + " accounts due" },
        { l: "Collected", v: CR(T.coll), s: "against the month’s demand" },
        { l: "Collection efficiency", v: P(T.eff), s: "collected ÷ demand" },
        { l: "Current bucket", v: P(T.bColl[0] / T.bDemand[0]), s: "efficiency, 0 DPD" },
        { l: "Overdue buckets", v: P(odCol / odDem), s: "efficiency, 1+ DPD" },
        { l: "In collection", v: I(T.act - T.dpd[0]), s: "accounts 1+ DPD" },
      ]) + grid(
        panel("Efficiency by DPD bucket", "k") +
        panel("Demand and collected · ₹ Cr · last 12 months", "t") +
        panel("Efficiency by region", "r") +
        panelHTML("Bucket-wise demand and collection", html.table([
          { k: "l", l: "Bucket", html: (v, r) => (r._total ? b(v) : esc(v)) }, { k: "n", l: "Accounts", cls: "r", fmt: I },
          { k: "d", l: "Demand", cls: "r", fmt: CR1 }, { k: "c", l: "Collected", cls: "r", fmt: CR1 }, { k: "e", l: "Eff.", cls: "r", fmt: (v) => P(v) }],
          BUCKETS.map((l, k) => ({ l, n: T.dpd[k], d: T.bDemand[k], c: T.bColl[k], e: T.bColl[k] / T.bDemand[k] })).concat([{ l: "Total", n: T.act, d: T.demand, c: T.coll, e: T.eff, _total: true }]), { rowClass: totalRow }))));
      bars(slot(el, "k"), { cats: BUCKETS, series: [{ name: "Efficiency", values: T.bColl.map((c, k) => c / T.bDemand[k]), colors: BUCKET_COL, color: "c1" }], fmt: (v) => P(v), yFmt: (v) => P(v, 0), max: 1, topLabels: true, h: 196, label: "Efficiency by bucket" });
      bars(slot(el, "t"), { cats: MONTHS, series: [{ name: "Demand", values: demandN.map((v) => v / 1e7), color: "n" }, { name: "Collected", values: collN.map((v) => v / 1e7), color: "c1" }], fmt: (v) => "₹" + v.toFixed(1) + " Cr", yFmt: (v) => v.toFixed(0), h: 196, label: "Demand and collected by month" });
      barH(slot(el, "r"), { data: REG.map((r) => ({ label: r.name, value: r.eff, tip: CR1(r.coll) + " of " + CR1(r.demand) })), fmt: (v) => P(v), max: 1, color: "c1", ref: { value: T.eff, label: "Company " + P(T.eff) }, label: "Efficiency by region" });
    },
  };

  /* ================================================================
     07 · DELINQUENCY
     ================================================================ */
  VIS["od-delinquency"] = {
    title: "ONE DASH · Delinquency",
    sub: "Page 7 of 10. DPD buckets of the active book at 30 Sep 26 and the NPA / DPD trend.",
    caption: "The five buckets add up to the active book. NPA = 90+ DPD; percentages are by number of accounts.",
    render(el) {
      const d60 = T.dpd[3] + T.dpd[4];
      el.innerHTML = shell("delinquency", "Delinquency", kpis([
        { l: "1+ DPD accounts", v: I(T.act - T.dpd[0]), s: P((T.act - T.dpd[0]) / T.act) + " of book" },
        { l: "30+ DPD", v: P(d30Now), s: I(T.d30) + " accounts" },
        { l: "60+ DPD", v: P(d60 / T.act), s: I(d60) + " accounts" },
        { l: "NPA (90+ DPD)", v: I(T.dpd[4]), s: "accounts" },
        { l: "GNPA (accounts)", v: P(d90Now, 2), s: "90+ ÷ active loans" },
        { l: "Legal cases open", v: I(T.legal), s: P(T.legal / T.dpd[4], 0) + " of NPA accounts" },
      ]) + grid(
        panel("Active loans by DPD bucket", "k", "", "Buckets add up to " + I(T.act) + " active loans") +
        panel("30+ and 90+ DPD · % of active loans · last 12 months", "t") +
        panel("30+ DPD by region", "r") +
        panelHTML("Bucket summary · 30 Sep 26", html.table([
          { k: "l", l: "Bucket", html: (v, r) => (r._total ? b(v) : dot(BUCKET_COL[r.k]) + esc(v)) }, { k: "n", l: "Accounts", cls: "r", fmt: I },
          { k: "s", l: "% of book", cls: "r", fmt: (v) => P(v, 2) }, { k: "c", l: "Cumulative", cls: "r", fmt: (v) => (v === null ? "" : P(v, 2)) }],
          BUCKETS.map((l, k) => ({ l, k, n: T.dpd[k], s: T.dpd[k] / T.act, c: k ? sum(T.dpd.slice(k)) / T.act : null })).concat([{ l: "Active loans", n: T.act, s: 1, c: null, _total: true }]), { rowClass: totalRow }), "", "Cumulative = this bucket and worse")));
      bars(slot(el, "k"), { cats: BUCKETS, series: [{ name: "Accounts", values: T.dpd, colors: BUCKET_COL, color: "c1" }], fmt: I, topLabels: true, h: 196, label: "Accounts by DPD bucket" });
      line(slot(el, "t"), { x: MONTHS, series: [{ name: "30+ DPD", values: d30N, color: "c4" }, { name: "90+ DPD (NPA)", values: d90N, color: "ink" }], yMin: 0, yMax: 0.07, yFmt: (v) => P(v, 1), h: 196, markers: true, label: "DPD trend" });
      barH(slot(el, "r"), { data: REG.map((r) => ({ label: r.name, value: r.d30 / r.act, tip: I(r.d30) + " of " + I(r.act) + " accounts" })), fmt: (v) => P(v, 2), color: "c4", ref: { value: d30Now, label: "Company " + P(d30Now) }, label: "30+ DPD by region" });
    },
  };

  /* ================================================================
     08 · BRANCH PERFORMANCE
     ================================================================ */
  VIS["od-branch"] = {
    title: "ONE DASH · Branch Performance",
    sub: "Page 8 of 10. Twelve demo branches across five regions — origination, book and risk side by side.",
    caption: "The total row equals the company figures on every other page. Rankings change with the metric: the busiest branches are not always the cleanest books.",
    render(el) {
      const rows = BR.map((x) => ({ id: x.id, region: x.region, app: x.app, apv: x.apv, ar: x.apv / x.bur, dis: x.dis, act: x.act, d30: x.d30 / x.act, eff: x.eff }));
      rows.push({ id: "Total", region: "5 regions", app: T.app, apv: T.apv, ar: apprNow, dis: T.dis, act: T.act, d30: d30Now, eff: T.eff, _total: true });
      const hi = (v, r, f) => (r._total ? b(f(v)) : esc(f(v)));
      el.innerHTML = shell("branch", "Branch Performance", kpis([
        { l: "Branches", v: String(BR.length), s: "5 regions" },
        { l: "Applications", v: I(T.app), s: "Sep 26" },
        { l: "Disbursed", v: I(T.dis), s: "loans, Sep 26" },
        { l: "Active loans", v: I(T.act), s: "30 Sep 26" },
        { l: "30+ DPD", v: P(d30Now), s: "company" },
        { l: "Collection efficiency", v: P(T.eff), s: "company" },
      ]) + grid(
        panelHTML("Branch scorecard · Sep 26", html.table([
          { k: "id", l: "Branch", cls: "mono", html: (v, r) => hi(v, r, String) }, { k: "region", l: "Region" },
          { k: "app", l: "Applications", cls: "r", html: (v, r) => hi(v, r, I) }, { k: "apv", l: "Approved", cls: "r", html: (v, r) => hi(v, r, I) },
          { k: "ar", l: "Approval", cls: "r", html: (v, r) => hi(v, r, (x) => P(x)) }, { k: "dis", l: "Disbursed", cls: "r", html: (v, r) => hi(v, r, I) },
          { k: "act", l: "Active loans", cls: "r", html: (v, r) => hi(v, r, I) },
          { k: "d30", l: "30+ DPD", cls: "r", html: (v, r) => (r._total ? b(P(v)) : v > d30Now * 1.15 ? html.pill(P(v), "crit") : esc(P(v))) },
          { k: "eff", l: "Coll. eff.", cls: "r", html: (v, r) => hi(v, r, (x) => P(x)) }], rows, { rowClass: totalRow }), "span2", "Red: 30+ DPD more than 15% above the company rate") +
        panel("Disbursals by branch · loans", "d") +
        panel("30+ DPD by branch", "k")));
      barH(slot(el, "d"), { data: BR.slice().sort((a, c) => c.dis - a.dis).map((x) => ({ label: x.id, value: x.dis })), fmt: I, color: "c3", rowH: 22, label: "Disbursals by branch" });
      barH(slot(el, "k"), { data: BR.slice().sort((a, c) => c.d30 / c.act - a.d30 / a.act).map((x) => ({ label: x.id, value: x.d30 / x.act, color: x.d30 / x.act > d30Now * 1.15 ? "c4" : "n" })), fmt: (v) => P(v, 2), rowH: 22, ref: { value: d30Now, label: "Company " + P(d30Now) }, label: "30+ DPD by branch" });
    },
  };

  /* ================================================================
     09 · TAT
     ================================================================ */
  VIS["od-tat"] = {
    title: "ONE DASH · Turnaround Time (TAT)",
    sub: "Page 9 of 10. Stage-to-stage turnaround for loans disbursed in Sep 26, measured between completed stage timestamps.",
    caption: "Average days per step add up to the login-to-disbursal average. The distribution covers every disbursed case; median and P90 sit beside the average because a few stuck cases pull it up.",
    render(el) {
      const slow = STEPS.slice().sort((a, c) => c[1] - a[1])[0];
      const over14 = TAT_BANDS[3].v + TAT_BANDS[4].v;
      el.innerHTML = shell("tat", "Turnaround Time (TAT)", kpis([
        { l: "Login → disbursal", v: DAYS(TAT), s: "average, disbursed cases" },
        { l: "Median", v: DAYS(7.0), s: "login → disbursal" },
        { l: "P90", v: DAYS(13.6), s: "login → disbursal" },
        { l: "Lead → login", v: DAYS(2.4), s: "average, before application" },
        { l: "Longest step", v: DAYS(slow[1]), s: slow[0] },
        { l: "Over 14 days", v: I(over14), s: P(over14 / T.dis) + " of disbursals" },
      ]) + grid(
        panel("Average days per step · loans disbursed in Sep 26", "s", "", "Steps add up to " + DAYS(TAT) + " login → disbursal") +
        panel("Login-to-disbursal TAT · distribution", "h", "", "Cases by band · adds up to " + I(T.dis) + " disbursals") +
        panel("Average login-to-disbursal TAT · last 12 months", "t") +
        panel("Average TAT by product · days", "p")));
      barH(slot(el, "s"), { data: STEPS.map(([l, v]) => ({ label: l, value: v, color: v === slow[1] ? "c4" : "c2" })), fmt: (v) => v.toFixed(1) + " d", rowH: 26, label: "Average days per step" });
      bars(slot(el, "h"), { cats: TAT_BANDS.map((x) => x.l), series: [{ name: "Cases", values: TAT_BANDS.map((x) => x.v), colors: ["c1", "c1", "c2", "c4", "c4"], color: "c1" }], fmt: I, topLabels: true, h: 214, label: "TAT distribution" });
      line(slot(el, "t"), { x: MONTHS, series: [{ name: "Average TAT", values: tatN, color: "c2", area: true }], yMin: 6, yMax: 10, yFmt: (v) => v.toFixed(0) + " d", h: 190, markers: true, label: "TAT trend" });
      barH(slot(el, "p"), { data: PROD.map((p) => ({ label: p.n, value: p.tat })), fmt: (v) => v.toFixed(1) + " d", color: "c2", ref: { value: TAT, label: "All " + TAT.toFixed(1) + " d" }, label: "TAT by product" });
    },
  };

  /* ================================================================
     10 · LIFECYCLE ANALYSIS (all 16 stages)
     ================================================================ */
  const PHASE = { o: ["Origination", "c3"], u: ["Underwriting", "c2"], k: ["Booking", "c1"], s: ["Servicing", "c4"] };
  const STAGES16 = [
    { n: "Lead", ph: "o", m: "Leads captured in Sep 26", v: T.lead },
    { n: "Application", ph: "o", m: "Applications logged in", v: T.app },
    { n: "KYC", ph: "o", m: "KYC verified", v: T.kyc },
    { n: "Credit Bureau", ph: "o", m: "Bureau checked and cleared", v: T.bur },
    { n: "Credit Assessment", ph: "u", m: "Assessment recommended", v: T.asr },
    { n: "Field Investigation", ph: "u", m: "FI positive", v: T.fi },
    { n: "Collateral", ph: "u", m: "Collateral verified", v: T.col },
    { n: "Credit Decision", ph: "u", m: "Approved (" + I(T.pend) + " pending)", v: T.apv },
    { n: "Documentation", ph: "k", m: "Documents complete", v: T.doc },
    { n: "Disbursement", ph: "k", m: "Loans disbursed", v: T.dis },
    { n: "Loan", ph: "k", m: "Active loans, 30 Sep 26", v: T.act, share: "book" },
    { n: "Repayment", ph: "s", m: "Current, 0 DPD", v: T.dpd[0], share: "act" },
    { n: "Collection", ph: "s", m: "1+ DPD, in collection", v: T.act - T.dpd[0], share: "act" },
    { n: "Delinquency", ph: "s", m: "30+ DPD", v: T.d30, share: "act" },
    { n: "Legal", ph: "s", m: "Legal cases open", v: T.legal, share: "npa" },
    { n: "Resolution / Closure", ph: "s", m: "Loans closed in Sep 26", v: closeN[11], share: "open" },
  ];
  STAGES16.forEach((s, i) => {
    if (i === 0) s.c = "—";
    else if (i < 10) s.c = P(s.v / STAGES16[i - 1].v) + " of previous";
    else if (s.share === "book") s.c = "opening " + I(actN[10]) + " + " + I(T.dis) + " new − " + I(closeN[11]) + " closed";
    else if (s.share === "act") s.c = P(s.v / T.act) + " of active";
    else if (s.share === "npa") s.c = P(s.v / T.dpd[4], 0) + " of NPA accounts";
    else s.c = P(s.v / actN[10], 2) + " of opening book";
  });

  VIS["od-stages"] = {
    title: "ONE DASH · Lifecycle Analysis",
    sub: "Page 10 of 10. All 16 stages in one table: the Sep 26 origination cohort (stages 1–10) and the month-end book (11–16).",
    caption: "Origination is a cohort counted by the furthest stage cleared; servicing is a snapshot of the book. The two halves meet at disbursement: new loans in the month equal disbursals.",
    render(el) {
      el.innerHTML = shell("stages", "Lifecycle Analysis · 16 stages", kpis([
        { l: "Leads", v: I(T.lead), s: "stage 1" },
        { l: "Disbursed", v: I(T.dis), s: P(T.dis / T.lead) + " of leads" },
        { l: "Active loans", v: I(T.act), s: "stage 11" },
        { l: "In collection", v: I(T.act - T.dpd[0]), s: "1+ DPD, stage 13" },
        { l: "Delinquent (30+)", v: I(T.d30), s: P(d30Now) + " of active" },
        { l: "Closed", v: I(closeN[11]), s: "stage 16, Sep 26" },
      ]) + grid(
        panelHTML("Lifecycle stages · counts and conversion", html.table([
          { k: "i", l: "#", cls: "mono" }, { k: "n", l: "Stage", html: (v) => b(v) },
          { k: "ph", l: "Phase", html: (v) => dot(PHASE[v][1]) + esc(PHASE[v][0]) }, { k: "m", l: "Counted as" },
          { k: "v", l: "Count", cls: "r", fmt: I }, { k: "c", l: "Conversion / share" }],
          STAGES16.map((s, i) => Object.assign({ i: String(i + 1).padStart(2, "0") }, s)), { rowClass: (r) => (r.i === "11" ? "best" : "") }), "span2", "Stages 1–10: Sep 26 applications by furthest stage cleared · stages 11–16: book at 30 Sep 26") +
        panel("Stage-to-stage conversion · origination", "c") +
        panel("Servicing view of the active book", "s")));
      barH(slot(el, "c"), { data: STAGES16.slice(1, 10).map((s, i) => ({ label: s.n.replace("Field Investigation", "Field invest.").replace("Credit Assessment", "Credit assess."), value: s.v / STAGES16[i].v, color: s.v / STAGES16[i].v < 0.9 ? "c4" : "c3", tip: I(s.v) + " of " + I(STAGES16[i].v) })), fmt: (v) => P(v, 0), max: 1, label: "Stage conversion" });
      barH(slot(el, "s"), { data: [
        { label: "Active loans", value: T.act, color: "c1" }, { label: "Current (0 DPD)", value: T.dpd[0], color: "c1" },
        { label: "In collection (1+)", value: T.act - T.dpd[0], color: "c3" }, { label: "Delinquent (30+)", value: T.d30, color: "c2" },
        { label: "NPA (90+)", value: T.dpd[4], color: "c4" }, { label: "Legal open", value: T.legal, color: "c4" }], fmt: I, label: "Servicing view" });
    },
  };

  /* ================================================================
     LIFECYCLE DIAGRAM — 16 stages in four phases, with page mapping
     ================================================================ */
  const LANES = [
    { ph: "o", pages: "Funnel · Lifecycle · TAT", stages: [[1, "Lead", "prospect captured", T.lead], [2, "Application", "logged in", T.app], [3, "KYC", "identity and address verified", T.kyc], [4, "Credit Bureau", "report pulled and cleared", T.bur]] },
    { ph: "u", pages: "Credit · TAT", stages: [[5, "Credit Assessment", "income, obligations, policy", T.asr], [6, "Field Investigation", "residence / business visit", T.fi], [7, "Collateral", "vehicle / asset checks", T.col], [8, "Credit Decision", "approve, reject or pend", T.apv]] },
    { ph: "k", pages: "Disbursal · Portfolio", stages: [[9, "Documentation", "agreement and pre-disbursal docs", T.doc], [10, "Disbursement", "amount paid out", T.dis], [11, "Loan", "active on the book", T.act]] },
    { ph: "s", pages: "Collection · Delinquency · Branch", stages: [[12, "Repayment", "EMIs paid, 0 DPD", T.dpd[0]], [13, "Collection", "overdue EMIs followed up", T.act - T.dpd[0]], [14, "Delinquency", "30+ DPD, NPA at 90+", T.d30], [15, "Legal", "action on serious delinquency", T.legal], [16, "Resolution / Closure", "closed, settled or resolved", closeN[11]]] },
  ];
  const PH_LABEL = { o: "Origination", u: "Underwriting", k: "Booking", s: "Servicing & recovery" };
  VIS["od-lifecycle"] = {
    title: "The 16-stage NBFC lifecycle in ONE DASH",
    sub: "Lead to resolution in four phases, with the report pages that cover each phase. Counts are the Sep 26 demo figures.",
    caption: "Stages 1–10 are measured as a monthly application cohort, stages 11–16 as a month-end snapshot of the book. Rejected cases leave at the stage where they fail; cured accounts return from Collection to Repayment.",
    render(el) {
      const node = (ph, [n, t, d, v]) => `<div style="flex:1 1 128px;min-width:0;border:1px solid var(--rule-strong);border-radius:4px;padding:.45rem .6rem;background:var(--paper);box-shadow:inset 3px 0 0 var(--${PHASE[ph][1]})">
        <div style="font:500 .64rem/1 var(--f-mono);color:var(--ink-3)">${String(n).padStart(2, "0")}</div>
        <div style="font-weight:600;font-size:.84rem;line-height:1.25;margin-top:.2rem">${esc(t)}</div>
        <div style="font-size:.68rem;color:var(--ink-3);line-height:1.3">${esc(d)}</div>
        <div style="font-size:.74rem;font-variant-numeric:tabular-nums;margin-top:.2rem;color:var(--ink-2)">${I(v)}</div></div>`;
      const arrow = `<span aria-hidden="true" style="align-self:center;color:var(--ink-3);font-size:.85rem">→</span>`;
      const down = `<div aria-hidden="true" style="text-align:center;color:var(--ink-3);line-height:1;padding:2px 0">↓</div>`;
      const lane = (L) => `<div style="border:1px solid var(--rule);border-radius:6px;background:var(--paper-raised);padding:.6rem .7rem">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.4rem 1rem;flex-wrap:wrap;margin-bottom:.45rem">
          <b style="font-size:.82rem">${dot(PHASE[L.ph][1])}${esc(PH_LABEL[L.ph])}</b>
          <span style="font:500 .66rem/1.3 var(--f-mono);color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em">Pages: ${esc(L.pages)}</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:stretch">${L.stages.map((s) => node(L.ph, s)).join(arrow)}</div></div>`;
      const chip = (t) => `<span style="font-size:.72rem;border:1px dashed var(--rule-strong);border-radius:4px;padding:.3rem .55rem;color:var(--ink-2);background:var(--paper-raised)">${t}</span>`;
      el.innerHTML = `<div style="display:grid;gap:4px">
        <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.4rem">${chip("<b>Cohort</b> · stages 1–10 · Sep 26 applications")}${chip("<b>Snapshot</b> · stages 11–16 · book at 30 Sep 26")}${chip("<b>Drill-down</b> · company → region → branch → product → application → customer → loan")}</div>
        ${LANES.map(lane).join(down)}
        <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem">${chip("Exit · rejected cases leave at the failing stage with a reason")}${chip("Loop · cured accounts return from Collection to Repayment")}${chip("Exit · loans close at Resolution / Closure")}</div>
      </div>`;
    },
  };

  /* ================================================================
     DRILL-DOWN — company → region → branch → product → application → customer → loan
     ================================================================ */
  const BR8 = BR.find((x) => x.id === "BR-08");
  const WEST = REG.find((r) => r.name === "West");
  const br8Act = alloc(BR8.act, PROD.map((p) => p.sAct))[0];
  const br8Dis = alloc(BR8.dis, PROD.map((p) => p.sDis))[0];
  const TL = [
    ["Lead", [1, 10, 15]], ["Application", [3, 11, 20]], ["KYC", [3, 17, 5]], ["Credit Bureau", [4, 9, 40]], ["Credit Assessment", [5, 15, 30]],
    ["Field Investigation", [7, 12, 10]], ["Collateral", [8, 11, 45]], ["Credit Decision", [9, 10, 20]], ["Documentation", [10, 14, 55]], ["Disbursement", [10, 18, 30]],
  ].map(([s, [d, h, m]]) => ({ s, t: Date.UTC(2026, 8, d, h, m) }));
  const fmtTs = (t) => { const d = new Date(t); return String(d.getUTCDate()).padStart(2, "0") + " Sep 26, " + String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0"); };
  const loginToDis = (TL[9].t - TL[1].t) / 864e5;

  VIS["od-drill"] = {
    title: "Drill-down path — company to a single loan",
    sub: "Seven levels on one model: Company → Region → Branch → Product → Application → Customer → Loan. Example path with demo IDs.",
    caption: "Each level filters the next. Figures for West and BR-08 match the Branch Performance page; the application timeline feeds the TAT page. Customer details are masked demo values.",
    render(el) {
      const crumbs = ["Company", "West", "BR-08", "Used CV", "APP-D-260903-0412", "CUST-D-20914", "LN-D-104812"];
      const levels = [
        ["Company", "All regions", I(T.act) + " active loans", "30+ DPD " + P(d30Now)],
        ["Region", "West", I(WEST.act) + " active loans", "30+ DPD " + P(WEST.d30 / WEST.act)],
        ["Branch", "BR-08", I(BR8.act) + " active loans", "Coll. eff. " + P(BR8.coll / BR8.demand)],
        ["Product", "Used CV · BR-08", I(br8Act) + " active loans", I(br8Dis) + " disbursed in Sep"],
        ["Application", "APP-D-260903-0412", "Disbursed 10 Sep 26", "TAT " + loginToDis.toFixed(1) + " days"],
        ["Customer", "CUST-D-20914", "Demo Customer A", "1 active loan"],
        ["Loan", "LN-D-104812", "POS ₹6.40 L", "Current · 0 DPD"],
      ];
      const card = ([lv, name, a, c], i) => `<div style="min-width:0;border:1px solid ${i === 6 ? "var(--ink)" : "var(--rule-strong)"};border-radius:4px;padding:.45rem .55rem;background:var(--paper-raised)">
        <div style="font:500 .62rem/1 var(--f-mono);color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em">${i + 1} · ${esc(lv)}</div>
        <div style="font-weight:600;font-size:.8rem;margin:.25rem 0 .1rem;overflow-wrap:anywhere;line-height:1.25">${esc(name)}</div>
        <div style="font-size:.7rem;color:var(--ink-2)">${esc(a)}</div><div style="font-size:.7rem;color:var(--ink-3)">${esc(c)}</div></div>`;
      const timeline = TL.map((x, i) => ({ s: x.s, t: fmtTs(x.t), d: i ? ((x.t - TL[i - 1].t) / 864e5).toFixed(2) : "—" }));
      el.innerHTML = shell("branch", "Drill-down · BR-08 → LN-D-104812", `
        <div style="display:flex;flex-wrap:wrap;gap:.3rem;align-items:center;font-size:.74rem;padding:.45rem .6rem;border:1px solid var(--rule);border-radius:4px;background:var(--paper-raised)">
          <span style="color:var(--ink-3);margin-right:.2rem">Path</span>${crumbs.map((c, i) => `<span style="font-family:var(--f-mono);${i === crumbs.length - 1 ? "font-weight:600;color:var(--ink)" : "color:var(--ink-2)"}">${esc(c)}</span>`).join('<span aria-hidden="true" style="color:var(--ink-3)">›</span>')}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,118px),1fr));gap:8px">${levels.map(card).join("")}</div>
        ${grid(
          panelHTML("Application timeline · APP-D-260903-0412", html.table([{ k: "s", l: "Stage completed" }, { k: "t", l: "Timestamp", cls: "mono" }, { k: "d", l: "Days from previous", cls: "r" }], timeline), "", "Login → disbursal " + loginToDis.toFixed(2) + " days (Application to Disbursement)") +
          panelHTML("Customer and loan · masked demo record", html.table([{ k: "k", l: "Field" }, { k: "v", l: "Value", cls: "mono" }], [
            { k: "Customer", v: "Demo Customer A · CUST-D-20914" }, { k: "Mobile", v: "98XXXX1043" }, { k: "PAN", v: "XXXPX1234X" },
            { k: "Branch / region", v: "BR-08 · West" }, { k: "Product", v: "Used CV" }, { k: "Loan", v: "LN-D-104812" },
            { k: "Amount · tenure", v: "₹6.40 L · 48 months" }, { k: "EMI (illustrative)", v: "₹17,490" }, { k: "First EMI due", v: "05 Oct 26" }, { k: "Status", v: "Current · 0 DPD" }]), "", "All identifiers are dummy values"))}`,
        ["Month: Sep 26", "Region: West", "Product: Used CV", "Branch: BR-08"]);
    },
  };

  /* expose the demo totals for debugging in the console (read-only use) */
  window.__ONEDASH_DEMO = { T, REG, BR, PROD, REASONS, STAGES16, actN, closeN, disN };
})();
