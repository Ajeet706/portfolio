/* =====================================================================
   visuals.js — chart registry and the visuals for case studies 01–03 and
   the personal ML lab (prefixes sc-, ews-, aml-, ml-). Other projects
   register their visuals in js/visuals/*.js, which load after this file.
   VIS[id] = { title, sub, caption, render(el, {thumb}) }
   ALL DATA HERE IS SYNTHETIC. Model charts read window.SYNTH, produced by
   ml/build_synthetic_model.py; the rest is demo data defined below (seeded
   random generator or fixed demo values) so it is identical on every load.
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, line, matrix, diverge, donut, html, fmt, esc } = window.Charts;
  const S = window.SYNTH;
  const VIS = window.VIS || {};

  /* seeded RNG (mulberry32) */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const MONTHS = ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"];
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const dashShell = (name, filters, body) =>
    `<div class="dash"><div class="dash-bar"><strong>${esc(name)}</strong><div class="dash-filters">${filters.map((f) => `<span>${esc(f)}</span>`).join("")}<span>Synthetic data</span></div></div>${body}</div>`;
  const panel = (title, slotId, extra = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div><div data-slot="${slotId}"></div></div>`;
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const listText = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
  const lc = (s) => s.replace(/\b([A-Z])([a-z]+)/g, (m, a, b) => a.toLowerCase() + b);   // "Credit score" → "credit score", keeps FOIR / DPD
  const numWord = (k) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][k] || String(k);
  const ILLUSTRATIVE = "Illustrative portfolio demonstration — not actual company rules.";

  /* ================================================================
     01 · CREDIT RISK SCORECARD  (window.SYNTH.scorecard)
     ================================================================ */
  const SC = S.scorecard;
  const ivColor = (v) => (v >= 0.3 ? "c1" : v >= 0.1 ? "c3" : v >= 0.02 ? "c2" : "n");
  const ivBand = (v) => (v > 0.5 ? "suspiciously strong — check for leakage" : v >= 0.3 ? "strong" : v >= 0.1 ? "medium" : v >= 0.02 ? "weak" : "not predictive");
  const LOW_IV = SC.iv.filter((d) => d.iv < 0.02).map((d) => d.feature);

  VIS["sc-iv"] = {
    title: "Information Value by candidate feature",
    sub: "Bars coloured by IV band. Features under 0.02 were dropped.",
    caption: `IV ranks how well each binned feature separates good and bad borrowers. ${cap(listText(LOW_IV.map(lc)))} carry almost no signal (IV below 0.02), so they never enter the scorecard.`,
    render(el, o) {
      barH(el, { thumb: o.thumb, fmt: (v) => v.toFixed(3), data: SC.iv.map((d) => ({ label: d.feature, value: d.iv, color: ivColor(d.iv), tip: `IV ${d.iv.toFixed(3)} · ${ivBand(d.iv)}` })),
        ref: [{ value: 0.02, label: "0.02 cut-off" }], legend: o.thumb ? null : [{ name: "Strong ≥ 0.3", color: "c1" }, { name: "Medium 0.1–0.3", color: "c3" }, { name: "Weak 0.02–0.1", color: "c2" }, { name: "Dropped < 0.02", color: "n" }], label: "IV ranking" });
    },
  };

  VIS["sc-woe"] = {
    title: "WOE by bureau-score bin",
    sub: "WOE = ln(% good ÷ % bad). Negative bins hold more bads than their share.",
    caption: "WOE rises steadily with bureau score — a monotonic trend is what you want before a feature goes into a logistic scorecard.",
    render(el, o) {
      const rows = SC.woe.bureau_score.rows;
      diverge(el, { thumb: o.thumb, data: rows.map((r) => ({ label: r.bin, value: r.woe, tip: `WOE ${r.woe.toFixed(3)} · bad rate ${fmt.pct(r.badRate)} · ${fmt.int(r.count)} loans` })),
        negLabel: "← riskier", posLabel: "safer →", label: "WOE by bureau score bin" });
    },
  };

  VIS["sc-woe-grid"] = {
    title: "WOE distribution across the top features",
    sub: "Each panel is one binned feature from the final scorecard. WOE = ln(% good ÷ % bad).",
    caption: "Checking every feature for a sensible, monotonic WOE trend is part of feature selection; bins are merged when the trend breaks. FOIR = (new EMI + existing EMIs) ÷ income.",
    render(el, o) {
      const keys = ["payment_ratio", "foir", "emi_bounce_12m", "bureau_score"];
      el.innerHTML = `<div class="dash-grid">${keys.map((k) => panel(SC.woe[k].label, k)).join("")}</div>`;
      keys.forEach((k) => diverge(slot(el, k), { thumb: o.thumb, rowH: 22, data: SC.woe[k].rows.map((r) => ({ label: r.bin, value: r.woe, tip: `bad rate ${fmt.pct(r.badRate)} · ${fmt.int(r.count)} loans` })) }));
    },
  };

  /* feature selection: every candidate, kept or dropped, with the reason — derived from SYNTH */
  const KEPT = new Set(SC.features);
  const COEF = Object.fromEntries(SC.coefs.map((c) => [c.feature, c.coef]));
  const WOE_BY_LABEL = Object.fromEntries(Object.values(SC.woe).map((w) => [w.label, w.rows.map((r) => r.woe)]));
  const monotonic = (a) => a.every((v, i) => !i || v >= a[i - 1]) || a.every((v, i) => !i || v <= a[i - 1]);
  const SELECT = SC.iv.map((d) => {
    const kept = KEPT.has(d.feature);
    let why;
    if (kept) {
      const parts = [d.iv > 0.5 ? "Very strong IV — kept after a leakage check" : `${cap(ivBand(d.iv))} IV`];
      if (WOE_BY_LABEL[d.feature]) parts.push(monotonic(WOE_BY_LABEL[d.feature]) ? "monotonic WOE" : "WOE trend reviewed");
      if (d.feature in COEF) parts.push(COEF[d.feature] < 0 ? "coefficient sign as expected" : "coefficient sign reviewed");
      why = parts.join(" · ");
    } else if (d.iv < 0.02) {
      why = "IV below 0.02 — no useful separation";
    } else {
      why = `${cap(ivBand(d.iv))} IV, weaker than the ${KEPT.size} kept — left out to keep the scorecard short`;
    }
    return { feature: d.feature, iv: d.iv, kept, why };
  });
  const IV_MAX = Math.max(...SC.iv.map((d) => d.iv));
  VIS["sc-select"] = {
    title: "Feature selection — candidate features to final scorecard",
    sub: `${SC.iv.length} candidates screened on IV, WOE trend and coefficient sign; ${KEPT.size} kept.`,
    caption: `Selection is a funnel: drop features with no signal (IV below 0.02), check that each survivor has a sensible WOE trend and coefficient sign, review anything suspiciously strong for leakage, and keep the scorecard short. In the demo data ${listText(SELECT.filter((s) => !s.kept).map((s) => lc(s.feature)))} are left out.`,
    render(el) {
      const lowN = SELECT.filter((s) => !s.kept && s.iv < 0.02).length;
      const weakN = SELECT.filter((s) => !s.kept && s.iv >= 0.02).length;
      el.innerHTML = html.kpis([
        { l: "Candidate features", v: String(SC.iv.length) },
        { l: "Dropped: IV below 0.02", v: String(lowN) },
        { l: "Dropped: weaker than kept set", v: String(weakN) },
        { l: "Kept in scorecard", v: String(KEPT.size) }]) +
        `<div style="margin-top:12px">${html.table([
          { k: "feature", l: "Feature" },
          { k: "iv", l: "IV", cls: "r", html: (v) => `<span class="bar-cell" style="width:${Math.max(2, Math.round((v / IV_MAX) * 80))}px;background:var(--${v >= 0.02 ? "c3" : "c-neutral"})"></span>${v.toFixed(3)}` },
          { k: "kept", l: "Decision", html: (v) => html.pill(v ? "Kept" : "Dropped", v ? "good" : "neutral") },
          { k: "why", l: "Reason", cls: "wrap" }], SELECT)}</div>`;
    },
  };

  const COEF_RANK = SC.coefs.slice().sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef));
  const COEF_ALL_NEG = SC.coefs.every((c) => c.coef < 0);
  VIS["sc-coef"] = {
    title: "Feature weights in the scorecard",
    sub: "|coefficient| on the WOE scale — features share the same log-odds unit, so magnitudes compare.",
    caption: `${cap(lc(COEF_RANK[0].feature))} carries the largest weight, followed by ${lc(COEF_RANK[1].feature)} and ${lc(COEF_RANK[2].feature)}. ${COEF_ALL_NEG ? "Every coefficient is negative, as expected when WOE = ln(good ÷ bad) and the target is default — a basic sign check before sign-off." : "With WOE = ln(good ÷ bad) and default as the target, coefficients should be negative; any positive sign is investigated before sign-off."}`,
    render(el, o) {
      const d = COEF_RANK.map((c) => ({ label: c.feature, value: Math.abs(c.coef), tip: `coefficient ${c.coef.toFixed(3)}` }));
      barH(el, { thumb: o.thumb, color: "c1", fmt: (v) => v.toFixed(2), data: d, label: "Coefficient magnitude" });
    },
  };

  VIS["sc-roc"] = {
    title: "ROC curve — scorecard on hold-out data",
    sub: `AUC ${SC.auc.toFixed(3)} · Gini ${SC.gini.toFixed(3)} · ${fmt.int(S.dataset.test)} test loans`,
    caption: "The curve sits well above the diagonal (a random model). Gini = 2 × AUC − 1 is the ranking measure most often quoted for scorecards.",
    render(el, o) {
      line(el, { thumb: o.thumb, h: o.thumb ? 150 : 260, x: SC.roc.map((p) => p.fpr), xMin: 0, xMax: 1, yMin: 0, yMax: 1,
        series: [{ name: `Scorecard (AUC ${SC.auc.toFixed(3)})`, values: SC.roc.map((p) => p.tpr), color: "c1", area: true }],
        diag: true, diagLabel: "Random (AUC 0.5)", xFmt: (v) => v.toFixed(1), yFmt: (v) => v.toFixed(1), xTipFmt: (v) => `False-positive rate ${v.toFixed(2)}`, xLabel: "False-positive rate", yLabel: "True-positive rate", label: "ROC curve" });
    },
  };

  VIS["sc-ks"] = {
    title: "KS curve — cumulative bads vs goods",
    sub: `KS ${(SC.ks * 100).toFixed(1)} at the top ${(SC.ksAt * 100).toFixed(0)}% of applicants ranked by risk`,
    caption: "KS is the widest gap between the cumulative share of bads and goods when applicants are ranked riskiest first; the vertical line marks where it occurs.",
    render(el, o) {
      const k = SC.ksCurve;
      let bi = 0, bd = -1;
      k.forEach((p, i) => { if (p.bad - p.good > bd) { bd = p.bad - p.good; bi = i; } });
      line(el, { thumb: o.thumb, h: o.thumb ? 150 : 260, x: k.map((p) => p.pop), xMin: 0, xMax: 1, yMin: 0, yMax: 1,
        series: [{ name: "Cumulative % bads", values: k.map((p) => p.bad), color: "c4" }, { name: "Cumulative % goods", values: k.map((p) => p.good), color: "c3" }],
        band: { x: k[bi].pop, y0: k[bi].good, y1: k[bi].bad, label: `KS ${(bd * 100).toFixed(1)}` },
        xFmt: fmt.pct0, yFmt: fmt.pct0, xTipFmt: (v) => `Top ${fmt.pct0(v)} by risk`, xLabel: "Population ranked riskiest first", label: "KS curve" });
    },
  };

  const cmRender = (el, o, cm, title) => {
    const tot = cm.tn + cm.fp + cm.fn + cm.tp;
    matrix(el, { thumb: o.thumb, rows: ["Actual: good", "Actual: bad"], cols: ["Predicted good", "Predicted bad"], colTitle: title,
      values: [[cm.tn, cm.fp], [cm.fn, cm.tp]], fmt: (v) => fmt.int(v), ratio: 0.42,
      cellColor: (i, j) => (i === j ? "var(--c1)" : "var(--c4)"), max: tot * 0.25,
      tipFmt: (v) => `${fmt.int(v)} loans · ${fmt.pct(v / tot)} of test set`, label: "Confusion matrix" });
  };
  VIS["sc-cm"] = {
    title: "Confusion matrix at the policy cut-off",
    sub: `Cut-off PD ${SC.threshold.toFixed(2)} · recall ${fmt.pct(SC.recall)} · precision ${fmt.pct(SC.precision)}`,
    caption: `The cut-off is set to catch about ${fmt.pct0(SC.recall)} of eventual defaulters. That costs precision: many flagged applicants repay, which is acceptable when the action is a review, not a rejection.`,
    render(el, o) { cmRender(el, o, SC.cm, ""); },
  };

  VIS["sc-score"] = {
    title: "Risk-score distribution",
    sub: `Hold-out applicants by 20-point score band. ${SC.scaling.base} points at ${SC.scaling.baseOdds}:1 good:bad odds; ${SC.scaling.pdo} points double the odds.`,
    caption: "Score = offset + factor × ln(odds of good), so higher is safer. Bad borrowers concentrate at the low end of the range and goods at the high end, which is what lets cut-offs be set in clean steps.",
    render(el, o) {
      const d = SC.scoreDist;
      bars(el, { thumb: o.thumb, stacked: true, cats: d.map((b) => `${b.from}`), series: [
        { name: "Good borrowers", values: d.map((b) => b.good), color: "c3" },
        { name: "Bad borrowers", values: d.map((b) => b.bad), color: "c4" }], fmt: fmt.int, gap: 0.12, label: "Score distribution" });
    },
  };

  VIS["sc-goodbad"] = {
    title: "Good vs bad borrowers across the score range",
    sub: "Share of each group in every 20-point band (each group sums to 100%).",
    caption: "Bads pile up at the low end and goods at the high end; the overlap in the middle is where manual review effort should go.",
    render(el, o) {
      const d = SC.scoreDist;
      const tg = d.reduce((a, b) => a + b.good, 0), tb = d.reduce((a, b) => a + b.bad, 0);
      bars(el, { thumb: o.thumb, cats: d.map((b) => `${b.from}`), series: [
        { name: "Good borrowers", values: d.map((b) => b.good / tg), color: "c3" },
        { name: "Bad borrowers", values: d.map((b) => b.bad / tb), color: "c4" }],
        fmt: fmt.pct, yFmt: fmt.pct0, gap: 0.15, label: "Good vs bad distribution" });
    },
  };

  const SEG_E = SC.segments[0], SEG_A = SC.segments[SC.segments.length - 1];
  VIS["sc-segments"] = {
    title: "Risk bands — bad rate by score band",
    sub: "Equal-sized score bands (quintiles) on the hold-out set.",
    caption: `Band E’s bad rate is about ${Math.round(SEG_E.badRate / SEG_A.badRate)}× band A’s (${fmt.pct(SEG_E.badRate)} vs ${fmt.pct(SEG_A.badRate)}) and steps down in every band. That spread is what turns a score into policy: approve, approve with conditions, refer, decline.`,
    render(el, o) {
      const segs = SC.segments;
      const colr = ["crit", "c2", "c3", "c1", "good"];
      barH(el, { thumb: o.thumb, fmt: fmt.pct, data: segs.map((s, i) => ({ label: `${s.band} (${s.range})`, value: s.badRate, color: colr[i], tip: `bad rate ${fmt.pct(s.badRate)} · ${fmt.int(s.accounts)} loans` })),
        ref: { value: S.dataset.badRate, label: `portfolio ${fmt.pct(S.dataset.badRate)}` }, label: "Bad rate by band" });
    },
  };

  const gainsTable = (g) => html.table([
    { k: "decile", l: "Decile", cls: "r" },
    { k: "accounts", l: "Loans", cls: "r", fmt: fmt.int },
    { k: "bads", l: "Bads", cls: "r", fmt: fmt.int },
    { k: "badRate", l: "Bad rate", cls: "r", html: (v) => `<span class="bar-cell" style="width:${Math.round(v * 120)}px;background:var(--c4)"></span>${fmt.pct(v)}` },
    { k: "cumBadPct", l: "Cum. % bads", cls: "r", fmt: fmt.pct },
    { k: "ks", l: "KS", cls: "r", fmt: (v) => (v * 100).toFixed(1) },
    { k: "lift", l: "Lift", cls: "r", fmt: (v) => v.toFixed(2) + "×" }], g, { rowClass: (r) => (r.ks === Math.max(...g.map((x) => x.ks)) ? "best" : "") });

  VIS["sc-gains"] = {
    title: "Decile gains & KS table",
    sub: "Test set ranked riskiest first, split into ten equal deciles.",
    caption: `The two riskiest deciles hold ${fmt.pct0(SC.gains[1].cumBadPct)} of all bads, and the bad rate falls decile by decile. The highlighted row is where KS peaks.`,
    render(el) { el.innerHTML = gainsTable(SC.gains); },
  };

  VIS["sc-dashboard"] = {
    title: "Credit risk dashboard — scorecard validation",
    sub: "Model performance, discriminating features and score bands on one page.",
    caption: "A one-page view a credit committee can read: is the scorecard separating good from bad, and which features drive it?",
    render(el, o) {
      el.innerHTML = dashShell("Credit Scorecard · Validation", ["Hold-out sample", "All products"],
        html.kpis([
          { l: "Hold-out loans", v: fmt.int(S.dataset.test) },
          { l: "Bad rate", v: fmt.pct(S.dataset.badRate) },
          { l: "ROC-AUC", v: SC.auc.toFixed(3) },
          { l: "Gini", v: SC.gini.toFixed(3) },
          { l: "KS", v: (SC.ks * 100).toFixed(1) }]) +
        `<div class="dash-grid">${panel("ROC curve", "roc")}${panel("Risk-score distribution", "sd")}${panel("Information Value ranking", "iv")}${panel("Bad rate by risk band", "seg")}</div>`);
      VIS["sc-iv"].render(slot(el, "iv"), { thumb: o.thumb });
      VIS["sc-segments"].render(slot(el, "seg"), { thumb: o.thumb });
      VIS["sc-roc"].render(slot(el, "roc"), { thumb: o.thumb });
      VIS["sc-score"].render(slot(el, "sd"), { thumb: o.thumb });
    },
  };

  /* ================================================================
     02 · EARLY WARNING SYSTEM — portfolio monitoring (demo data)
     Book: 48,250 live accounts = 47,130 active + 1,120 restructured.
     ================================================================ */
  const r2 = rng(202);
  const BRANCHES = ["BR-01", "BR-02", "BR-03", "BR-04", "BR-05", "BR-06", "BR-07", "BR-08"];
  const ewsHigh = MONTHS.map((_, i) => Math.round(820 + i * 38 + Math.sin(i / 1.6) * 70 + r2() * 40));
  const ewsMed = MONTHS.map((_, i) => Math.round(1900 + i * 22 + Math.cos(i / 2) * 90 + r2() * 60));
  const branchFlag = BRANCHES.map(() => +(4 + r2() * 7).toFixed(1));
  const BUCKETS = ["Current", "1–30 (SMA-0)", "31–60 (SMA-1)", "61–90 (SMA-2)", "90+ (NPA)"];
  const bucketNow = [41260, 4380, 1184, 642, 784];
  const bucketPrev = [41810, 4120, 1150, 620, 760];
  const BOOK = sum(bucketNow);
  const ratio30 = (b) => (b[2] + b[3] + b[4]) / sum(b);
  const dpd30 = [4.62, 4.70, 4.66, 4.79, 4.85, 4.83, 4.96, 5.04, 5.01, 5.12, +(ratio30(bucketPrev) * 100).toFixed(2), +(ratio30(bucketNow) * 100).toFixed(2)];
  const FLAGGED = ewsHigh[11] + ewsMed[11];
  const roll = [[0.93, 0.06, 0.01, 0, 0], [0.42, 0.38, 0.18, 0.02, 0], [0.16, 0.12, 0.38, 0.33, 0.01], [0.07, 0.03, 0.1, 0.42, 0.38], [0.02, 0, 0.01, 0.03, 0.94]];
  const ROLLED_NPA = Math.round(bucketPrev[3] * roll[3][4]);
  const STATUS = { active: 47130, restructured: 1120, closed: 21640, writtenOff: 410 };

  /* Illustrative rules — the same five rules and weights as the case-study text */
  const EWS_RULES = [
    { name: "Bounce 2 of last 3 EMIs", w: 30, hit: (a) => a.bounces >= 2, act: "Call within 24h · re-present EMI" },
    { name: "DPD bucket rolled forward", w: 25, hit: (a) => !!a.from, act: "Field visit" },
    { name: "Payment ratio < 0.80", w: 20, hit: (a) => a.ratio < 0.8, act: "Call · agree a repayment plan" },
    { name: "Partial payments 3 months", w: 15, hit: (a) => a.partial >= 3, act: "Field visit" },
    { name: "NACH mandate cancelled", w: 10, hit: (a) => a.mandate, act: "Call · fresh mandate" },
  ];
  const bucketOf = (dpd) => (dpd === 0 ? "Current" : dpd <= 30 ? "SMA-0" : dpd <= 60 ? "SMA-1" : dpd <= 90 ? "SMA-2" : "NPA");
  const EWS_ACCOUNTS = [
    ["LN-D-104812", "CUST-D-20914", "BR-03", "Used CV", 38, "SMA-0", 3, 1, 0.62, true],
    ["LN-D-107265", "CUST-D-23377", "BR-06", "MSME", 27, "Current", 2, 2, 0.71, false],
    ["LN-D-105530", "CUST-D-21808", "BR-01", "Two-wheeler", 14, "Current", 2, 3, 0.78, false],
    ["LN-D-109104", "CUST-D-26051", "BR-03", "New CV", 61, "SMA-1", 1, 3, 0.74, false],
    ["LN-D-106688", "CUST-D-22490", "BR-08", "Car", 9, null, 2, 0, 0.83, true],
    ["LN-D-103947", "CUST-D-24112", "BR-05", "Used CV", 0, null, 2, 1, 0.79, false],
    ["LN-D-108321", "CUST-D-27740", "BR-02", "MSME", 33, "SMA-0", 1, 1, 0.86, false],
    ["LN-D-102776", "CUST-D-25369", "BR-06", "Two-wheeler", 12, null, 0, 3, 0.77, false],
    ["LN-D-110058", "CUST-D-28203", "BR-04", "Used CV", 5, null, 1, 0, 0.92, true],
    ["LN-D-101419", "CUST-D-20587", "BR-07", "New CV", 18, null, 1, 2, 0.79, false],
    ["LN-D-106002", "CUST-D-29421", "BR-03", "Car", 0, null, 1, 0, 0.95, true],
    ["LN-D-109877", "CUST-D-21156", "BR-01", "MSME", 46, "SMA-0", 2, 1, 0.69, false],
  ].map(([loan, cust, branch, product, dpd, from, bounces, partial, ratio, mandate]) => {
    const a = { loan, cust, branch, product, dpd, from, bounces, partial, ratio, mandate, bucket: bucketOf(dpd) };
    const fired = EWS_RULES.filter((r) => r.hit(a));
    a.score = sum(fired.map((r) => r.w));
    a.band = a.score >= 50 ? "High" : a.score >= 25 ? "Medium" : "Low";
    a.trigger = fired.length ? fired[0].name : "—";
    a.action = fired.length ? fired[0].act : "—";
    a.others = fired.slice(1).map((r) => r.name).join(" · ") || "—";
    return a;
  }).sort((x, y) => y.score - x.score || y.dpd - x.dpd);
  const bandPill = (v) => html.pill(v, v === "High" ? "crit" : v === "Medium" ? "warn" : "good");

  VIS["ews-trend"] = {
    title: "Risk trend — EWS alerts per month by risk segment",
    sub: "Accounts flagged High and Medium, last 12 months.",
    caption: "A steady rise in High-segment alerts is the early signal; it shows up months before the 30+ DPD ratio moves much.",
    render(el, o) {
      line(el, { thumb: o.thumb, x: MONTHS, series: [{ name: "High", values: ewsHigh, color: "c4" }, { name: "Medium", values: ewsMed, color: "c2" }], yFmt: fmt.int, endLabels: true, markers: false, label: "Alert trend" });
    },
  };
  VIS["ews-dpd"] = {
    title: "DPD bucket analysis",
    sub: "Live accounts by days-past-due bucket, this month vs last month (RBI SMA / NPA buckets).",
    caption: "Every bucket past ‘Current’ grew month on month — the portfolio is drifting, not just one segment.",
    render(el, o) {
      bars(el, { thumb: o.thumb, cats: BUCKETS.slice(1), series: [{ name: "Last month", values: bucketPrev.slice(1), color: "c3" }, { name: "This month", values: bucketNow.slice(1), color: "c4" }], fmt: fmt.int, label: "DPD buckets" });
    },
  };
  VIS["ews-roll"] = {
    title: "Roll-rate matrix",
    sub: "Share of accounts moving from last month’s bucket (rows) to this month’s (columns).",
    caption: `${fmt.pct0(roll[3][4])} of SMA-2 accounts rolled into NPA, while ${fmt.pct0(roll[1][0])} of SMA-0 accounts cured back to current. Cure rates out of SMA-0 tell collections where a phone call is still enough.`,
    render(el, o) {
      matrix(el, { thumb: o.thumb, rows: ["Current", "SMA-0", "SMA-1", "SMA-2", "NPA"], cols: ["Current", "SMA-0", "SMA-1", "SMA-2", "NPA"], colTitle: "This month →",
        values: roll, fmt: (v) => (v === 0 ? "–" : Math.round(v * 100) + "%"), color: "c1",
        cellColor: (i, j) => (j > i ? "var(--c4)" : j < i ? "var(--c1)" : "var(--c3)"), max: 0.6, ratio: 0.42, label: "Roll rates" });
    },
  };
  const BRANCH_AVG = sum(branchFlag) / branchFlag.length;
  const BRANCH_HOT = branchFlag.filter((v) => v > BRANCH_AVG * 1.2).length;
  VIS["ews-branch"] = {
    title: "Branch risk comparison",
    sub: "% of each branch’s live accounts flagged High this month.",
    caption: `${cap(numWord(BRANCH_HOT))} branch${BRANCH_HOT === 1 ? " runs" : "es run"} more than 20% above the portfolio average (highlighted). That is a conversation for the regional collections head, not just a list.`,
    render(el, o) {
      barH(el, { thumb: o.thumb, fmt: (v) => v.toFixed(1) + "%", data: BRANCHES.map((b, i) => ({ label: b, value: branchFlag[i], color: branchFlag[i] > BRANCH_AVG * 1.2 ? "c4" : "c3" })).sort((a, b) => b.value - a.value),
        ref: { value: BRANCH_AVG, label: `avg ${BRANCH_AVG.toFixed(1)}%` }, label: "Branch comparison" });
    },
  };
  VIS["ews-table"] = {
    title: "Early-warning alerts — the indicators behind each score",
    sub: "Accounts with at least one indicator this cycle. Score = sum of rule points; 50+ High, 25–49 Medium.",
    caption: "Indicators sit next to the score so a collections officer can see why an account is flagged, not just that it is. Low rows are shown for contrast; only High and Medium go to the action list.",
    render(el) {
      el.innerHTML = html.table([
        { k: "loan", l: "Loan ID", cls: "mono" }, { k: "branch", l: "Branch" },
        { k: "dpd", l: "DPD", cls: "r" }, { k: "bounces", l: "Bounces 3m", cls: "r" }, { k: "partial", l: "Partials 3m", cls: "r" },
        { k: "ratio", l: "Pay ratio", cls: "r", fmt: (v) => v.toFixed(2) },
        { k: "from", l: "Bucket move", fmt: (v, r) => (v ? `${v} → ${r.bucket}` : "—") },
        { k: "mandate", l: "NACH", fmt: (v) => (v ? "Cancelled" : "Active") },
        { k: "score", l: "Score", cls: "r" }, { k: "band", l: "Segment", html: bandPill }], EWS_ACCOUNTS);
    },
  };
  VIS["ews-highrisk"] = {
    title: "High-risk customers — today’s action queue",
    sub: "High segment only, sorted by score, with the main trigger and the next action. Identifiers are dummy.",
    caption: "This is the output the business uses: a short, ranked list with a reason and a next step. The main trigger is the highest-weighted rule that fired.",
    render(el) {
      el.innerHTML = html.table([
        { k: "cust", l: "Customer", cls: "mono" }, { k: "loan", l: "Loan ID", cls: "mono" }, { k: "branch", l: "Branch" }, { k: "product", l: "Product" },
        { k: "dpd", l: "DPD", cls: "r" }, { k: "score", l: "Score", cls: "r" },
        { k: "trigger", l: "Main trigger" }, { k: "action", l: "Next action" }, { k: "band", l: "Segment", html: bandPill }],
        EWS_ACCOUNTS.filter((a) => a.band === "High"), { rowClass: (r, i) => (i < 2 ? "hl" : "") });
    },
  };
  VIS["ews-collections"] = {
    title: "Collections follow-up — what happened to this month’s alerts",
    sub: "High and Medium alerts, from list to outcome.",
    caption: "Following alerts through to promise-to-pay and payment closes the loop and shows whether the EWS list is worth calling.",
    render(el, o) {
      const F = FLAGGED, c = Math.round(F * 0.87), p = Math.round(F * 0.48), pd7 = Math.round(F * 0.33), fv = Math.round(F * 0.12);
      el.innerHTML = html.kpis([{ l: "Alerts raised", v: fmt.int(F) }, { l: "Contacted", v: fmt.pct0(c / F) }, { l: "Promise to pay", v: fmt.int(p) }, { l: "Paid within 7 days", v: fmt.int(pd7) }]) + `<div data-slot="f" style="margin-top:12px"></div>`;
      barH(slot(el, "f"), { thumb: o.thumb, fmt: fmt.int, color: "c1", data: [
        { label: "Alerts raised", value: F }, { label: "Contacted", value: c }, { label: "Promise to pay", value: p }, { label: "Paid within 7 days", value: pd7 }, { label: "Escalated to field", value: fv, color: "c2" }], label: "Collections funnel" });
    },
  };
  VIS["ews-portfolio"] = {
    title: "Portfolio risk summary",
    sub: "Book by product, 30+ DPD trend and how live accounts split across EWS risk segments.",
    caption: "Context for every EWS conversation: where the book is concentrated, whether delinquency is drifting and how many accounts need attention this cycle.",
    render(el, o) {
      const hiByProd = [{ label: "Used CV", value: 3.4 }, { label: "MSME", value: 3.1 }, { label: "Two-wheeler", value: 2.6 }, { label: "New CV", value: 1.9 }, { label: "Car", value: 1.4 }];
      el.innerHTML = dashShell("Portfolio risk summary · Sep 26", ["All products", "All branches"], html.kpis([
        { l: "Live accounts", v: fmt.int(BOOK) }, { l: "Book (AUM)", v: "₹1,860 Cr" },
        { l: "30+ DPD", v: dpd30[11].toFixed(2) + "%", s: "+" + (dpd30[11] - dpd30[0]).toFixed(2) + " pts in 12 months", cls: "up-bad" },
        { l: "NPA (90+)", v: fmt.pct(bucketNow[4] / BOOK, 2) }, { l: "Flagged High + Medium", v: fmt.int(FLAGGED) }]) +
        `<div class="dash-grid">${panel("Book by product", "p")}${panel("30+ DPD ratio, %", "t")}${panel("Live accounts by EWS risk segment", "s")}${panel("High segment as % of product accounts", "h")}</div>`);
      barH(slot(el, "p"), { thumb: o.thumb, fmt: (v) => "₹" + fmt.int(v) + " Cr", color: "c3", data: [{ label: "Used CV", value: 640 }, { label: "New CV", value: 420 }, { label: "MSME", value: 330 }, { label: "Car", value: 270 }, { label: "Two-wheeler", value: 200 }] });
      line(slot(el, "t"), { thumb: o.thumb, h: 200, x: MONTHS, series: [{ name: "30+ DPD %", values: dpd30, color: "c4", area: true }], yMin: 4, yMax: 6, yFmt: (v) => v.toFixed(1) + "%" });
      barH(slot(el, "s"), { thumb: o.thumb, fmt: fmt.int, data: [
        { label: "Low", value: BOOK - FLAGGED, color: "good" }, { label: "Medium", value: ewsMed[11], color: "warn" }, { label: "High", value: ewsHigh[11], color: "crit" }] });
      barH(slot(el, "h"), { thumb: o.thumb, fmt: (v) => v.toFixed(1) + "%", color: "c4", data: hiByProd });
    },
  };
  VIS["ews-status"] = {
    title: "Loan status — what the EWS monitors",
    sub: "All loans on the system by current status, and how each status is treated in the monitoring run.",
    caption: "Only live loans are scored. Restructured loans are scored on their revised schedule and reported separately so they are not flagged by mistake; closed and written-off loans are excluded.",
    render(el, o) {
      const rows = [
        { s: "Active", n: STATUS.active, t: "Monitored", d: "Indicators and rules every cycle" },
        { s: "Restructured", n: STATUS.restructured, t: "Monitored · tagged", d: "Scored on the revised schedule, reported separately" },
        { s: "Closed", n: STATUS.closed, t: "Excluded", d: "No dues outstanding" },
        { s: "Written-off", n: STATUS.writtenOff, t: "Excluded", d: "Handled by recovery, outside the EWS" }];
      el.innerHTML = dashShell("Loan status · Sep 26", ["All products", "All branches"], html.kpis([
        { l: "Live accounts monitored", v: fmt.int(STATUS.active + STATUS.restructured) },
        { l: "Restructured (tagged)", v: fmt.int(STATUS.restructured) },
        { l: "Closed (excluded)", v: fmt.int(STATUS.closed) },
        { l: "Written-off (excluded)", v: fmt.int(STATUS.writtenOff) }]) +
        `<div class="dash-grid"><div class="panel"><div class="panel-title">Loans by status</div><div data-slot="d"></div></div>
         <div class="panel"><div class="panel-title">Treatment in the EWS run</div>${html.table([
          { k: "s", l: "Status" }, { k: "n", l: "Loans", cls: "r", fmt: fmt.int },
          { k: "t", l: "EWS", html: (v) => html.pill(v, v === "Monitored" ? "good" : v === "Excluded" ? "neutral" : "info") },
          { k: "d", l: "Rule", cls: "wrap" }], rows)}</div></div>`);
      donut(slot(el, "d"), { thumb: o.thumb, size: 170, center: fmt.int(sum(Object.values(STATUS))), centerLabel: "loans", parts: [
        { label: "Active", value: STATUS.active, color: "c3" }, { label: "Restructured", value: STATUS.restructured, color: "c2" },
        { label: "Closed", value: STATUS.closed, color: "n" }, { label: "Written-off", value: STATUS.writtenOff, color: "c4" }] });
    },
  };
  VIS["ews-dashboard"] = {
    title: "EWS dashboard",
    sub: "Monthly early-warning view used by risk and collections.",
    caption: "Headline counts, where accounts sit by DPD bucket, how alerts are trending, which branches need attention and how accounts move between buckets.",
    render(el, o) {
      el.innerHTML = dashShell("Early Warning System · Sep 26", ["All products", "All branches"], html.kpis([
        { l: "Accounts monitored", v: fmt.int(BOOK) }, { l: "Flagged this month", v: fmt.int(FLAGGED), s: fmt.pct(FLAGGED / BOOK) + " of book" },
        { l: "High segment", v: fmt.int(ewsHigh[11]), s: "+" + fmt.int(ewsHigh[11] - ewsHigh[10]) + " vs Aug", cls: "up-bad" },
        { l: "SMA-1 + SMA-2", v: fmt.int(bucketNow[2] + bucketNow[3]) }, { l: "Rolled to NPA", v: fmt.int(ROLLED_NPA) }]) +
        `<div class="dash-grid">${panel("DPD buckets: last vs this month", "dpd")}${panel("Alerts per month by segment", "tr")}${panel("Branch: % flagged High", "br")}${panel("Roll rates", "rr")}</div>`);
      VIS["ews-dpd"].render(slot(el, "dpd"), o); VIS["ews-trend"].render(slot(el, "tr"), o); VIS["ews-branch"].render(slot(el, "br"), o); VIS["ews-roll"].render(slot(el, "rr"), o);
    },
  };

  /* ================================================================
     03 · AML MONITORING SYSTEM — illustrative rules, synthetic data
     Sep 26: 412 alerts = sum of rule hits = 239 closed + 82 review + 64 open + 27 escalated.
     ================================================================ */
  const AML_RULES = [
    { id: "R1", short: "Near-₹50k cash", name: "Cash repayments just below ₹50,000", logic: "≥ 3 cash receipts of ₹45,000–49,999 on one loan within 30 days", look: "30 days", hits: 96, esc: 0.09 },
    { id: "R2", short: "Early foreclosure", name: "Early foreclosure with cash / third-party funds", logic: "Loan closed within 6 months of disbursal; > 50% of closure amount from cash or a non-borrower account", look: "6 months", hits: 41, esc: 0.12 },
    { id: "R3", short: "Third-party payers", name: "Payments from many third-party accounts", logic: "EMIs from ≥ 3 different non-borrower accounts in 90 days", look: "90 days", hits: 72, esc: 0.06 },
    { id: "R4", short: "High cash in a month", name: "High-value cash in a month", logic: "Cash receipts for one customer above an illustrative ₹5 lakh in a calendar month", look: "Monthly", hits: 58, esc: 0.05 },
    { id: "R5", short: "Frequency spike", name: "Repayment frequency spike", logic: "≥ 4 receipts on one loan in a month vs a usual 1", look: "Monthly", hits: 87, esc: 0.03 },
    { id: "R6", short: "Volume vs income", name: "Payment volume vs declared income", logic: "12-month receipts > 3× declared annual income", look: "12 months", hits: 58, esc: 0.07 },
  ];
  const amlStatus = { months: MONTHS.slice(6), open: [22, 25, 19, 28, 31, 64], review: [38, 41, 36, 44, 47, 82], closed: [236, 252, 228, 261, 270, 239], esc: [14, 12, 11, 15, 16, 27] };
  const AML_ALERTS = (() => {
    const r = rng(303), out = [];
    const st = ["Open", "Under review", "Closed – no issue", "Escalated"];
    for (let i = 0; i < 10; i++) {
      const rule = AML_RULES[Math.floor(r() * 6)];
      const amt = rule.id === "R1" ? 45000 + Math.floor(r() * 4999) : rule.id === "R4" ? 500000 + Math.floor(r() * 400000) : 20000 + Math.floor(r() * 400000);
      out.push({ id: "AML-D-" + (5100 + i * 7), date: `${String(1 + Math.floor(r() * 28)).padStart(2, "0")}-Sep-26`, cust: "CUST-D-" + (30000 + Math.floor(r() * 9000)), rule: rule.id + " · " + rule.name, amt, risk: ["High", "Medium", "Medium", "Low"][Math.floor(r() * 4)], status: st[Math.floor(r() * 4)] });
    }
    return out;
  })();
  const statusPill = (v) => html.pill(v, v === "Escalated" ? "crit" : v === "Open" ? "warn" : v === "Under review" ? "info" : "neutral");
  const CASH_BANDS = ["< 10k", "10–25k", "25–45k", "45–50k", "50k–1L", "1–2L"];
  const CASH_COUNTS = [18420, 9310, 2940, 1680, 610, 240];

  VIS["aml-rules"] = {
    title: "Rule-based alert generation",
    sub: ILLUSTRATIVE,
    caption: "Each rule is a parameterised SQL check over a look-back window. Hit counts and escalation rates are tracked per rule so noisy rules can be tuned.",
    render(el) {
      el.innerHTML = html.table([
        { k: "id", l: "Rule", cls: "mono" }, { k: "name", l: "Scenario" }, { k: "logic", l: "Illustrative logic", cls: "wrap" }, { k: "look", l: "Window" },
        { k: "hits", l: "Alerts (Sep)", cls: "r" }, { k: "esc", l: "Escalated", cls: "r", fmt: fmt.pct0 }], AML_RULES);
    },
  };
  VIS["aml-byrule"] = {
    title: "Rule alerts — alerts by rule this month",
    sub: ILLUSTRATIVE,
    caption: "Volume is spread across rules, and the noisiest rules do not escalate most. Escalation rate, not volume, decides which rules earn analyst time and which get re-tuned.",
    render(el, o) {
      barH(el, { thumb: o.thumb, fmt: fmt.int, color: "c3", data: AML_RULES.map((r) => ({ label: r.id + " · " + r.short, value: r.hits, tip: `${r.name} · ${r.hits} alerts · ${fmt.pct0(r.esc)} escalated` })).sort((a, b) => b.value - a.value), label: "Alerts by rule" });
    },
  };
  const BACKLOG_AUG = amlStatus.open[4] + amlStatus.review[4], BACKLOG_SEP = amlStatus.open[5] + amlStatus.review[5];
  VIS["aml-status"] = {
    title: "Alert status by month",
    sub: "Every alert is worked to a disposition.",
    caption: `September’s open and under-review backlog rose from ${BACKLOG_AUG} to ${BACKLOG_SEP} (${(BACKLOG_SEP / BACKLOG_AUG).toFixed(1)}×) — a capacity signal for the compliance team.`,
    render(el, o) {
      bars(el, { thumb: o.thumb, stacked: true, topLabels: true, cats: amlStatus.months, fmt: fmt.int, series: [
        { name: "Closed – no issue", values: amlStatus.closed, color: "c3" }, { name: "Under review", values: amlStatus.review, color: "c2" },
        { name: "Open", values: amlStatus.open, color: "n" }, { name: "Escalated", values: amlStatus.esc, color: "c4" }], label: "Alert status" });
    },
  };
  VIS["aml-highvalue"] = {
    title: "Cash receipts by amount band",
    sub: "Count of cash repayment receipts, last 90 days.",
    caption: "The ₹45–50k band is only ₹5,000 wide yet holds more than half as many receipts as the ₹20,000-wide band below it — the bunching just under the ₹50,000 PAN-quoting limit that rule R1 looks for.",
    render(el, o) {
      bars(el, { thumb: o.thumb, cats: CASH_BANDS, series: [{ name: "Receipts", values: CASH_COUNTS, color: "c3", colors: ["c3", "c3", "c3", "c4", "c3", "c3"] }], fmt: fmt.int, topLabels: true, label: "Cash receipts by band" });
    },
  };
  VIS["aml-frequency"] = {
    title: "Transaction frequency analysis",
    sub: "Loans by number of receipts in the month.",
    caption: "Most loans pay once a month. The long tail with four or more receipts feeds rule R5.",
    render(el, o) {
      bars(el, { thumb: o.thumb, cats: ["1", "2", "3", "4", "5", "6+"], series: [{ name: "Loans", values: [41820, 3960, 512, 61, 18, 8], color: "c3", colors: ["c3", "c3", "c3", "c4", "c4", "c4"] }], fmt: fmt.int, topLabels: true, label: "Receipts per loan" });
    },
  };
  VIS["aml-risk"] = {
    title: "Customer risk summary",
    sub: "Customers by risk category and how many had an alert in the last 90 days.",
    caption: "High-risk customers are a small share of the base but carry a disproportionate share of alerts — the case for risk-based review depth.",
    render(el, o) {
      const cust = [38200, 9100, 950], al = [180, 205, 112];
      el.innerHTML = html.kpis(["Low", "Medium", "High"].map((k, i) => ({ l: `${k}-risk customers`, v: fmt.int(cust[i]), s: `${fmt.pct(al[i] / cust[i])} with an alert` }))) + `<div data-slot="c" style="margin-top:12px"></div>`;
      bars(slot(el, "c"), { thumb: o.thumb, cats: ["Low", "Medium", "High"], series: [{ name: "Customers", values: cust, color: "c3" }, { name: "With an alert", values: al, color: "c4" }], fmt: fmt.int, label: "Customer risk" });
    },
  };
  VIS["aml-alerts"] = {
    title: "Alert queue — suspicious transaction alerts",
    sub: `Alert queue with rule, amount, customer risk and status. Identifiers are dummy. ${ILLUSTRATIVE}`,
    caption: "Each alert carries enough context for an analyst to decide: close with a note, ask the branch for documents, or escalate for STR review.",
    render(el) {
      el.innerHTML = html.table([
        { k: "id", l: "Alert", cls: "mono" }, { k: "date", l: "Date" }, { k: "cust", l: "Customer", cls: "mono" }, { k: "rule", l: "Rule" },
        { k: "amt", l: "Amount", cls: "r", fmt: (v) => "₹" + fmt.int(v) }, { k: "risk", l: "Cust. risk", html: bandPill }, { k: "status", l: "Status", html: statusPill }], AML_ALERTS);
    },
  };
  const HIGH_TXN = [
    { id: "TXN-D-880412", date: "03-Sep-26", cust: "CUST-D-31842", mode: "Cash", payer: "Borrower", amt: 49500, rules: "R1 · R5", why: "3rd near-₹50k cash receipt on the loan within 30 days", risk: "High" },
    { id: "TXN-D-882231", date: "16-Sep-26", cust: "CUST-D-37720", mode: "Cash", payer: "Borrower", amt: 185000, rules: "R4", why: "Cash for the customer reaches ₹5.6 lakh this month", risk: "High" },
    { id: "TXN-D-881356", date: "09-Sep-26", cust: "CUST-D-35107", mode: "Bank transfer", payer: "Third party", amt: 620000, rules: "R2", why: "Foreclosure 4 months after disbursal, funded by a non-borrower account", risk: "Medium" },
    { id: "TXN-D-880977", date: "05-Sep-26", cust: "CUST-D-31842", mode: "Cash", payer: "Borrower", amt: 48900, rules: "R1 · R5", why: "Cash just below ₹50,000; 4th receipt on the loan this month", risk: "High" },
    { id: "TXN-D-882760", date: "19-Sep-26", cust: "CUST-D-30455", mode: "Cheque", payer: "Third party", amt: 240000, rules: "R6", why: "12-month receipts above 3× declared annual income", risk: "Medium" },
    { id: "TXN-D-881904", date: "12-Sep-26", cust: "CUST-D-33068", mode: "UPI", payer: "Third party", amt: 18400, rules: "R3", why: "3rd different non-borrower payer in 90 days", risk: "Medium" },
    { id: "TXN-D-883540", date: "27-Sep-26", cust: "CUST-D-34291", mode: "UPI", payer: "Third party", amt: 21000, rules: "R3 · R5", why: "4th receipt this month, from a new third-party account", risk: "Low" },
  ];
  VIS["aml-hightxn"] = {
    title: "High-risk transactions",
    sub: `Transactions that hit one or more rules this month, highest customer risk first. Identifiers are dummy; payer accounts are not shown. ${ILLUSTRATIVE}`,
    caption: "The transaction-level view behind the alert queue: what was paid, how, by whom, and which rule it triggered. Analysts start here when an alert needs evidence.",
    render(el) {
      el.innerHTML = html.table([
        { k: "id", l: "Transaction", cls: "mono" }, { k: "date", l: "Date" }, { k: "cust", l: "Customer", cls: "mono" }, { k: "mode", l: "Mode" }, { k: "payer", l: "Payer" },
        { k: "amt", l: "Amount", cls: "r", fmt: (v) => "₹" + fmt.int(v) }, { k: "rules", l: "Rules hit", cls: "mono" }, { k: "why", l: "Risk indicator", cls: "wrap" },
        { k: "risk", l: "Cust. risk", html: bandPill }], HIGH_TXN, { rowClass: (r) => (r.risk === "High" ? "hl" : "") });
    },
  };
  const NEAR_THR = [430, 418, 446, 461, 452, 478, 490, 505, 521, 545, 552, 583];   // last 3 months = the 45–50k band above
  const THIRD_PARTY = [236, 241, 229, 252, 248, 261, 255, 270, 266, 281, 279, 296];
  const DRILL = [
    { d: "02 Sep", m: "NACH", a: 12400 }, { d: "03 Sep", m: "Cash", a: 49500 }, { d: "05 Sep", m: "Cash", a: 48900 },
    { d: "14 Sep", m: "Cash", a: 45800 }, { d: "23 Sep", m: "Cash", a: 47000 }];
  const MODES = ["Cash", "UPI", "NACH", "Cheque", "Bank transfer"];
  VIS["aml-pattern"] = {
    title: "Transaction pattern analysis",
    sub: `Monthly pattern indicators, payment-mode mix and a drill-down for one flagged customer. ${ILLUSTRATIVE}`,
    caption: "Patterns, not single payments, raise suspicion: near-threshold cash receipts rising month on month, cash heavily over-represented among alerted receipts, and one customer paying in repeated cash amounts just under ₹50,000 alongside the regular EMI.",
    render(el, o) {
      el.innerHTML = dashShell("Pattern analysis · Sep 26", ["Receipts", "All channels"],
        `<div class="dash-grid"><div class="panel span2"><div class="panel-title">Near-threshold cash receipts and third-party payments per month</div><div data-slot="t"></div></div>
         ${panel("Payment-mode mix: all receipts vs alerted receipts", "m")}
         <div class="panel"><div class="panel-title">Drill-down: CUST-D-31842, September receipts</div>${html.legend([{ name: "Cash", color: "c4" }, { name: "NACH (EMI)", color: "c3" }])}<div data-slot="d"></div></div></div>`);
      line(slot(el, "t"), { thumb: o.thumb, h: 210, x: MONTHS, series: [{ name: "Cash ₹45–50k", values: NEAR_THR, color: "c4" }, { name: "Third-party payer", values: THIRD_PARTY, color: "c3" }], yFmt: fmt.int, endLabels: true, markers: true, label: "Monthly pattern" });
      bars(slot(el, "m"), { thumb: o.thumb, cats: MODES, series: [
        { name: "All receipts", values: [0.21, 0.22, 0.45, 0.04, 0.08], color: "c3" },
        { name: "Alerted receipts", values: [0.61, 0.12, 0.04, 0.07, 0.16], color: "c4" }], fmt: fmt.pct0, yFmt: fmt.pct0, label: "Mode mix" });
      bars(slot(el, "d"), { thumb: o.thumb, cats: DRILL.map((x) => x.d), series: [{ name: "Amount", values: DRILL.map((x) => x.a), color: "c4", colors: DRILL.map((x) => (x.m === "Cash" ? "c4" : "c3")), tips: DRILL.map((x) => x.m) }],
        fmt: (v) => "₹" + fmt.int(v), yFmt: (v) => "₹" + fmt.int(v / 1000) + "k", max: 60000, ref: { value: 50000, label: "₹50,000 PAN limit" }, label: "Customer drill-down" });
    },
  };
  VIS["aml-dashboard"] = {
    title: "AML monitoring dashboard",
    sub: `Monthly compliance view. ${ILLUSTRATIVE}`,
    caption: "Volume screened, alerts raised, how they were disposed of and which rules are producing them.",
    render(el, o) {
      const total = sum(AML_RULES.map((r) => r.hits));
      el.innerHTML = dashShell("Transaction Monitoring · Sep 26", ["Illustrative rules", "All channels"], html.kpis([
        { l: "Transactions screened", v: "1,86,400" }, { l: "Alerts generated", v: fmt.int(total), s: fmt.pct(total / 186400, 2) + " of transactions" },
        { l: "Closed – no issue", v: fmt.pct0(amlStatus.closed[5] / total) }, { l: "Escalated for STR review", v: fmt.int(amlStatus.esc[5]) }]) +
        `<div class="dash-grid">${panel("Alerts by rule", "r")}${panel("Alert status by month", "s")}${panel("Cash receipts by amount band", "h")}${panel("Customers by risk category", "c")}</div>`);
      VIS["aml-byrule"].render(slot(el, "r"), o); VIS["aml-status"].render(slot(el, "s"), o); VIS["aml-highvalue"].render(slot(el, "h"), o);
      bars(slot(el, "c"), { thumb: o.thumb, cats: ["Low", "Medium", "High"], series: [{ name: "Customers", values: [38200, 9100, 950], color: "c3" }, { name: "With an alert", values: [180, 205, 112], color: "c4" }], fmt: fmt.int, label: "Customer risk" });
    },
  };

  /* ================================================================
     08 · PERSONAL ML LAB  (window.SYNTH.pd) — every number read from SYNTH
     ================================================================ */
  const PD = S.pd;
  const MCOL = { "Logistic Regression": "c1", "Random Forest": "c2", "Gradient Boosting": "c3" };
  const LR_M = PD.models.find((m) => m.name === "Logistic Regression") || PD.models[0];
  const best = PD.models.reduce((a, b) => (b.auc > a.auc ? b : a));
  const bestKs = PD.models.reduce((a, b) => (b.ks > a.ks ? b : a));
  const aucSpread = Math.max(...PD.models.map((m) => m.auc)) - Math.min(...PD.models.map((m) => m.auc));
  const CAL = PD.calibration;
  const CAL_WORST = CAL.reduce((a, d) => (Math.abs(d.pred - d.actual) > Math.abs(a.pred - a.actual) ? d : a));
  const CAL_MAE = sum(CAL.map((d) => Math.abs(d.pred - d.actual))) / CAL.length;
  const SH = PD.shapGlobal.map((d) => d.feature);

  VIS["ml-roc"] = {
    title: "ROC — three models on the same hold-out set",
    sub: PD.models.map((m) => `${m.name.split(" ").map((w) => w[0]).join("")} ${m.auc.toFixed(3)}`).join(" · "),
    caption: `The three curves nearly overlap (AUC spread ${aucSpread.toFixed(3)}). A tuned logistic regression is as good as the tree ensembles here, which is common when features are already well engineered.`,
    render(el, o) {
      const grid = Array.from({ length: 41 }, (_, i) => i / 40);
      const interp = (pts) => grid.map((x) => { let j = 0; while (j < pts.length - 1 && pts[j + 1].fpr < x) j++; const a = pts[j], b = pts[Math.min(j + 1, pts.length - 1)]; const t = b.fpr === a.fpr ? 0 : (x - a.fpr) / (b.fpr - a.fpr); return +(a.tpr + Math.max(0, Math.min(1, t)) * (b.tpr - a.tpr)).toFixed(4); });
      line(el, { thumb: o.thumb, h: o.thumb ? 150 : 260, x: grid, xMin: 0, xMax: 1, yMin: 0, yMax: 1, diag: true,
        series: PD.models.map((m) => ({ name: `${m.name} (${m.auc.toFixed(3)})`, values: interp(m.roc), color: MCOL[m.name] })),
        xFmt: (v) => v.toFixed(1), yFmt: (v) => v.toFixed(2), xTipFmt: (v) => `FPR ${v.toFixed(2)}`, xLabel: "False-positive rate", label: "ROC comparison" });
    },
  };
  VIS["ml-ks"] = {
    title: "KS — logistic regression",
    sub: `KS ${(LR_M.ks * 100).toFixed(1)} · Gini ${LR_M.gini.toFixed(3)}`,
    caption: "Same reading as the scorecard KS: the widest gap between cumulative bads and goods when applicants are ranked by predicted PD.",
    render(el, o) {
      const k = LR_M.ksCurve; let bi = 0, bd = -1;
      k.forEach((p, i) => { if (p.bad - p.good > bd) { bd = p.bad - p.good; bi = i; } });
      line(el, { thumb: o.thumb, h: o.thumb ? 150 : 260, x: k.map((p) => p.pop), xMin: 0, xMax: 1, yMin: 0, yMax: 1,
        series: [{ name: "Cumulative % bads", values: k.map((p) => p.bad), color: "c4" }, { name: "Cumulative % goods", values: k.map((p) => p.good), color: "c3" }],
        band: { x: k[bi].pop, y0: k[bi].good, y1: k[bi].bad, label: `KS ${(bd * 100).toFixed(1)}` }, xFmt: fmt.pct0, yFmt: fmt.pct0, xTipFmt: (v) => `Top ${fmt.pct0(v)}`, xLabel: "Population ranked by predicted PD, highest first", label: "KS" });
    },
  };
  VIS["ml-cm"] = {
    title: "Confusion matrix — logistic regression",
    sub: `Cut-off ${LR_M.threshold.toFixed(2)} · recall ${fmt.pct(LR_M.recall)} · precision ${fmt.pct(LR_M.precision)} · F1 ${LR_M.f1.toFixed(3)}`,
    caption: `The cut-off is the highest PD that still catches about 70% of defaulters (recall ${fmt.pct(LR_M.recall)}). False positives become review calls; false negatives become credit losses, which cost far more.`,
    render(el, o) { cmRender(el, o, LR_M.cm, ""); },
  };
  VIS["ml-shap"] = {
    title: "SHAP — global feature impact (gradient boosting)",
    sub: "Mean |SHAP value| in log-odds over 2,000 test loans.",
    caption: `SHAP splits each prediction into per-feature contributions. ${cap(lc(SH[0]))} and ${lc(SH[1])} carry the most weight, followed by ${lc(SH[2])} and ${lc(SH[3])}. FOIR = (new EMI + existing EMIs) ÷ income.`,
    render(el, o) { barH(el, { thumb: o.thumb, color: "c1", fmt: (v) => v.toFixed(3), data: PD.shapGlobal.map((d) => ({ label: d.feature, value: d.meanAbs })), label: "Mean |SHAP|" }); },
  };
  VIS["ml-importance"] = {
    title: "Feature importance — gradient boosting",
    sub: "Impurity-based importance, normalised to 1.",
    caption: `${cap(lc(PD.importance[0].feature))} ranks first here${PD.importance[0].feature === PD.shapGlobal[0].feature ? " too" : ""}. Impurity importance can favour continuous features, which is why SHAP is shown alongside it.`,
    render(el, o) { barH(el, { thumb: o.thumb, color: "c3", fmt: (v) => v.toFixed(3), data: PD.importance.map((d) => ({ label: d.feature, value: d.importance })), label: "Feature importance" }); },
  };
  VIS["ml-calibration"] = {
    title: "Probability of default — predicted vs actual by decile",
    sub: "Gradient boosting, test loans grouped by predicted-PD decile (D1 = lowest PD).",
    caption: `Predicted PD tracks the observed default rate across deciles (mean gap ${(CAL_MAE * 100).toFixed(1)} percentage points). The largest gap is in decile ${CAL_WORST.decile}: ${fmt.pct(CAL_WORST.pred)} predicted vs ${fmt.pct(CAL_WORST.actual)} actual, so the model ${CAL_WORST.pred > CAL_WORST.actual ? "overstates" : "understates"} risk there. Before PDs feed pricing or provisioning, the model would be recalibrated (Platt scaling or isotonic regression).`,
    render(el, o) {
      bars(el, { thumb: o.thumb, cats: CAL.map((d) => "D" + d.decile), series: [{ name: "Predicted PD", values: CAL.map((d) => d.pred), color: "c3" }, { name: "Actual default rate", values: CAL.map((d) => d.actual), color: "c4" }], fmt: fmt.pct, yFmt: fmt.pct0, label: "Calibration" });
    },
  };
  VIS["ml-bands"] = {
    title: "Risk bands — Low / Medium / High",
    sub: `Logistic regression PD: Low < ${fmt.pct0(PD.bands.cut.low)} ≤ Medium < ${fmt.pct0(PD.bands.cut.high)} ≤ High`,
    caption: `Bands turn a probability into an action. The High band’s default rate is about ${Math.round(PD.bands.badRate.High / PD.bands.badRate.Low)}× the Low band’s (${fmt.pct(PD.bands.badRate.High)} vs ${fmt.pct(PD.bands.badRate.Low)}).`,
    render(el, o) {
      const b = PD.bands;
      barH(el, { thumb: o.thumb, fmt: fmt.pct, data: ["Low", "Medium", "High"].map((k) => ({ label: `${k} · ${fmt.int(b.count[k])} loans`, value: b.badRate[k], color: k === "Low" ? "good" : k === "Medium" ? "warn" : "crit", tip: `actual default rate ${fmt.pct(b.badRate[k])}` })),
        ref: { value: S.dataset.badRate, label: `avg ${fmt.pct(S.dataset.badRate)}` }, label: "Default rate by band" });
    },
  };
  VIS["ml-compare"] = {
    title: "Model comparison",
    sub: `${fmt.int(S.dataset.test)} hold-out loans · 5-fold CV on the training set · metrics at each model’s ~70%-recall cut-off`,
    caption: `${cap(lc(best.name))} has the highest AUC (${best.auc.toFixed(3)})${bestKs === best ? " and KS" : `; ${lc(bestKs.name)} the highest KS`}. ${best === LR_M ? "It is also fully explainable, so it is the champion; gradient boosting is kept as a challenger." : `Logistic regression is within ${(best.auc - LR_M.auc).toFixed(3)} AUC and fully explainable, so it stays the champion with ${lc(best.name)} as challenger.`}`,
    render(el) {
      el.innerHTML = html.table([
        { k: "name", l: "Model" }, { k: "auc", l: "ROC-AUC", cls: "r", fmt: (v) => v.toFixed(3) }, { k: "gini", l: "Gini", cls: "r", fmt: (v) => v.toFixed(3) }, { k: "ks", l: "KS", cls: "r", fmt: (v) => (v * 100).toFixed(1) },
        { k: "cvAuc", l: "CV AUC (± sd)", cls: "r", fmt: (v, r) => `${v.toFixed(3)} ± ${r.cvSd.toFixed(3)}` }, { k: "threshold", l: "Cut-off", cls: "r", fmt: (v) => v.toFixed(2) },
        { k: "precision", l: "Precision", cls: "r", fmt: fmt.pct }, { k: "recall", l: "Recall", cls: "r", fmt: fmt.pct }, { k: "f1", l: "F1", cls: "r", fmt: (v) => v.toFixed(3) }], PD.models, { rowClass: (r) => (r === best ? "best" : "") });
    },
  };
  VIS["ml-gains"] = {
    title: "Decile gains — gradient boosting",
    sub: "Hold-out set ranked by predicted PD.",
    caption: `Calling only the top two deciles would reach ${fmt.pct0(PD.gains[1].cumBadPct)} of eventual defaulters.`,
    render(el) { el.innerHTML = gainsTable(PD.gains); },
  };
  VIS["ml-dashboard"] = {
    title: "ML model dashboard",
    sub: "Champion model health at a glance.",
    caption: "What a model-risk or credit committee review needs on one page: discrimination, bands, drivers and calibration.",
    render(el, o) {
      const m = LR_M;
      el.innerHTML = dashShell("PD Model · Champion: Logistic Regression", ["Hold-out", "Synthetic portfolio"], html.kpis([
        { l: "ROC-AUC", v: m.auc.toFixed(3) }, { l: "Gini", v: m.gini.toFixed(3) }, { l: "KS", v: (m.ks * 100).toFixed(1) },
        { l: "Recall @ cut-off", v: fmt.pct0(m.recall) }, { l: "Precision", v: fmt.pct0(m.precision) }, { l: "F1", v: m.f1.toFixed(3) }]) +
        `<div class="dash-grid">${panel("ROC: three models", "r")}${panel("Default rate by risk band", "b")}${panel("SHAP global impact", "s")}${panel("Predicted vs actual PD by decile", "c")}</div>`);
      VIS["ml-roc"].render(slot(el, "r"), o); VIS["ml-bands"].render(slot(el, "b"), o); VIS["ml-shap"].render(slot(el, "s"), o); VIS["ml-calibration"].render(slot(el, "c"), o);
    },
  };

  window.VIS = VIS;
})();
