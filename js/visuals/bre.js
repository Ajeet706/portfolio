/* =====================================================================
   Business Rule Engine (BRE) — synthetic visuals. ALL DATA IS DEMO DATA.
   Rules are ILLUSTRATIVE: thresholds are named placeholders, never
   production values. Counts reconcile everywhere:
     passed + referred + failed = evaluated by BRE
     rule-wise (primary) declines add up to BRE failed
     BRE outcome × final decision adds up to the final totals.
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, line, funnel, html, esc } = window.Charts;
  const VIS = window.VIS;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const MONTHS = ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const nf = new Intl.NumberFormat("en-IN");
  const I = (v) => nf.format(Math.round(v));
  const P = (v, d = 1) => (v * 100).toFixed(d) + "%";
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const kpis = (items) => `<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,112px),1fr))">${items.map((k) =>
    `<div class="kpi"><span class="kpi-l">${esc(k.l)}</span><span class="kpi-v" style="white-space:nowrap">${esc(k.v)}</span>${k.s ? `<span class="kpi-s ${k.cls || ""}">${esc(k.s)}</span>` : ""}</div>`).join("")}</div>`;
  const dashShell = (name, filters, body) =>
    `<div class="dash"><div class="dash-bar"><strong>${esc(name)}</strong><div class="dash-filters">${filters.map((f) => `<span>${esc(f)}</span>`).join("")}<span>Synthetic data</span></div></div>${body}</div>`;
  const panel = (title, slotId, extra = "", note = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div>${note ? `<div style="font-size:.7rem;color:var(--ink-3);margin:-.2rem 0 .35rem;line-height:1.35">${esc(note)}</div>` : ""}<div data-slot="${slotId}"></div></div>`;
  const panelHTML = (title, inner, extra = "", note = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div>${note ? `<div style="font-size:.7rem;color:var(--ink-3);margin:-.2rem 0 .35rem;line-height:1.35">${esc(note)}</div>` : ""}${inner}</div>`;
  const bold = (s) => `<b>${esc(s)}</b>`;
  const totalRow = (r) => (r._total ? "best" : "");
  const outPill = (o) => html.pill(o, o === "Decline" ? "crit" : o === "Refer" ? "warn" : o === "Pass" ? "good" : "info");

  /* ================================================================
     DEMO DATASET — Sep 26
     ================================================================ */
  const CATS = ["Eligibility", "Policy", "Bureau", "DPD", "Income", "Document", "Risk"];
  const CAT_COL = { Eligibility: "c3", Policy: "c3", Bureau: "c2", DPD: "c4", Income: "c1", Document: "n", Risk: "c4" };
  /* illustrative rules: placeholders only. hits = applications where the rule fired;
     dec / ref = applications where it was the PRIMARY (deciding) rule. */
  const RULES = [
    { id: "R-ELG-01", cat: "Eligibility", name: "Applicant age outside range", cond: "age < minimum age, or age at maturity > maximum age", out: "Decline", hits: 171, dec: 152, ref: 0 },
    { id: "R-ELG-02", cat: "Eligibility", name: "Live loans above permitted count", cond: "live loans with the lender > permitted count", out: "Refer", hits: 81, dec: 0, ref: 64 },
    { id: "R-POL-01", cat: "Policy", name: "Product or location outside policy", cond: "product / location not in the policy list", out: "Decline", hits: 131, dec: 118, ref: 0 },
    { id: "R-POL-02", cat: "Policy", name: "Loan-to-value above cap", cond: "LTV > product LTV cap (threshold)", out: "Refer", hits: 127, dec: 0, ref: 102 },
    { id: "R-BUR-01", cat: "Bureau", name: "Bureau score below cut-off", cond: "bureau score < cut-off score", out: "Decline", hits: 322, dec: 286, ref: 0 },
    { id: "R-BUR-02", cat: "Bureau", name: "Thin or no bureau file", cond: "no bureau record, or tradelines < minimum count", out: "Refer", hits: 421, dec: 0, ref: 368 },
    { id: "R-DPD-01", cat: "DPD", name: "Past delinquency (sample rule)", cond: "max DPD in look-back ≥ threshold → Risk Review; ≥ higher threshold → Decline", out: "Risk Review / Decline", hits: 461, dec: 248, ref: 168 },
    { id: "R-INC-01", cat: "Income", name: "Income below minimum", cond: "assessed monthly income < minimum income", out: "Decline", hits: 238, dec: 206, ref: 0 },
    { id: "R-INC-02", cat: "Income", name: "FOIR above threshold", cond: "FOIR > FOIR threshold", out: "Refer", hits: 497, dec: 0, ref: 412 },
    { id: "R-DOC-01", cat: "Document", name: "Mandatory document missing", cond: "required document not received or unreadable", out: "Refer", hits: 389, dec: 0, ref: 344 },
    { id: "R-DOC-02", cat: "Document", name: "KYC data mismatch unresolved", cond: "name / DOB differ across KYC documents", out: "Decline", hits: 53, dec: 46, ref: 0 },
    { id: "R-RSK-01", cat: "Risk", name: "High internal risk grade", cond: "grade in high band → Refer; highest band → Decline", out: "Refer / Decline", hits: 352, dec: 74, ref: 236 },
  ];
  const APPS = 9840;
  const HELD = [{ l: "Mandatory field missing", v: 188 }, { l: "Bureau report not yet received", v: 162 }, { l: "Duplicate application", v: 78 }];
  const HELD_N = sum(HELD.map((h) => h.v));                  // 428
  const EVAL = APPS - HELD_N;                                 // 9,412 pre-BRE applications sent to rule evaluation
  const FAIL = sum(RULES.map((r) => r.dec));                  // 1,130
  const REFER = sum(RULES.map((r) => r.ref));                 // 1,694
  const PASS = EVAL - FAIL - REFER;                           // 6,588
  const POST = {                                              // post-BRE: representative routing
    pass: { appr: PASS - 176, dec: 176, pend: 0 },
    refer: { appr: 1018, dec: REFER - 1018 - 164, pend: 164 },
    fail: { appr: 0, dec: FAIL, pend: 0 },
  };
  const FINAL = { appr: POST.pass.appr + POST.refer.appr, dec: POST.pass.dec + POST.refer.dec + POST.fail.dec, pend: POST.refer.pend };
  const byCat = (k) => CATS.map((c) => sum(RULES.filter((r) => r.cat === c).map((r) => r[k])));
  const CAT_DEC = byCat("dec"), CAT_REF = byCat("ref");

  const r = rng(909);
  const TREND = MONTHS.map((m, i) => {
    if (i === 11) return { m, n: EVAL, p: PASS, rf: REFER, f: FAIL };
    const n = Math.round(EVAL * (1 - 0.011 * (11 - i)) * (1 + 0.03 * Math.sin(i * 1.1) + (r() - 0.5) * 0.04));
    const fr = 0.12 + (0.01 * (11 - i)) / 11 + (r() - 0.5) * 0.006;
    const rr = 0.18 + (0.008 * (11 - i)) / 11 + (r() - 0.5) * 0.006;
    const f = Math.round(n * fr), rf = Math.round(n * rr);
    return { m, n, p: n - f - rf, rf, f };
  });

  /* ================================================================
     RULE FLOW — stages and Pass / Refer / Decline branches
     ================================================================ */
  VIS["bre-flow"] = {
    title: "BRE rule flow — application data to final decision",
    sub: "Six stages. The BRE decision branches into Pass, Refer or Decline; post-BRE routes each branch to the final decision.",
    caption: "Demo counts for Sep 26: every branch reconciles (passed + referred + failed = evaluated; approved + declined + pending = evaluated). Post-BRE routing is a representative / demo workflow.",
    render(el) {
      const box = (n, t, d, more = "") => `<div style="flex:1 1 150px;min-width:0;border:1px solid var(--rule-strong);border-radius:6px;background:var(--paper-raised);padding:.6rem .7rem">
        <div style="font:500 .64rem/1 var(--f-mono);color:var(--ink-3);letter-spacing:.06em">${n}</div>
        <div style="font-weight:600;font-size:.9rem;margin:.28rem 0 .15rem">${esc(t)}</div>
        <div style="font-size:.74rem;color:var(--ink-2);line-height:1.4">${d}</div>${more}</div>`;
      const arrow = `<div aria-hidden="true" style="align-self:center;color:var(--ink-3);font-size:1rem">→</div>`;
      const down = (t) => `<div aria-hidden="true" style="text-align:center;color:var(--ink-3);font-size:.95rem;line-height:1;padding:7px 0">↓${t ? `<span style="font-size:.68rem;margin-left:.4rem;font-family:var(--f-mono)">${esc(t)}</span>` : ""}</div>`;
      const chips = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:.45rem">${CATS.map((c) => `<span style="font-size:.66rem;padding:.18rem .4rem;border-radius:3px;background:var(--paper-sunk);color:var(--ink-2)">${c}</span>`).join("")}</div>`;
      const branch = (kind, label, n, d, c) => `<div style="min-width:0;border:1px solid var(--rule-strong);border-top:4px solid var(--${c});border-radius:6px;background:var(--paper-raised);padding:.55rem .7rem">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap">${html.pill(label, kind)}<b style="font-size:1.05rem;font-variant-numeric:tabular-nums">${I(n)}</b></div>
        <div style="font-size:.72rem;color:var(--ink-3);margin:.25rem 0 .2rem">${P(n / EVAL)} of evaluated</div>
        <div style="font-size:.74rem;color:var(--ink-2);line-height:1.4">${d}</div></div>`;
      const post = (t) => `<div style="font-size:.72rem;color:var(--ink-2);line-height:1.45">${t}</div>`;
      el.innerHTML = `<div style="display:grid;gap:0">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:stretch">
          ${box("01", "Application data", `${I(APPS)} applications · applicant, loan, bureau, DPD history, documents`)}${arrow}
          ${box("02", "Pre-BRE", `${I(EVAL)} ready for rules · ${I(HELD_N)} held for missing data (not failed)`)}${arrow}
          ${box("03", "Rule evaluation", `${RULES.length} illustrative rules in 7 categories, a result for every rule`, chips)}${arrow}
          ${box("04", "BRE decision", "Most severe outcome wins: Decline › Refer › Pass")}
        </div>
        ${down("one outcome per application")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:8px">
          ${branch("good", "Pass", PASS, "No rule fired → continues in the credit process", "good")}
          ${branch("warn", "Refer", REFER, "Refer / risk-review rule fired → credit or risk review", "warn")}
          ${branch("crit", "Decline", FAIL, "Decline rule fired → closed with its primary rule", "crit")}
        </div>
        ${down("")}
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:stretch">
          ${box("05", "Post-BRE", "Route and record each outcome (representative)", post(`Pass: ${I(POST.pass.appr)} cleared · ${I(POST.pass.dec)} declined in later checks<br>Refer: ${I(POST.refer.appr)} approved · ${I(POST.refer.dec)} declined · ${I(POST.refer.pend)} pending<br>Decline: ${I(POST.fail.dec)} closed with reason`))}${arrow}
          ${box("06", "Final decision", "BRE result kept with the decision for audit and monitoring", post(`<b>${I(FINAL.appr)}</b> approved · <b>${I(FINAL.dec)}</b> declined · <b>${I(FINAL.pend)}</b> pending`))}
        </div>
        <div style="margin-top:12px;border:1px dashed var(--rule-strong);border-radius:6px;padding:.6rem .75rem;background:var(--paper)">
          <div style="font:500 .66rem/1.2 var(--f-mono);color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em">Sample rule · DPD category · illustrative, not a production rule</div>
          <div style="font-family:var(--f-mono);font-size:.76rem;line-height:1.6;margin-top:.35rem;overflow-wrap:anywhere">IF max_dpd_lookback ≥ <i>review threshold</i> THEN <b>Risk Review</b> (Refer)<br>IF max_dpd_lookback ≥ <i>decline threshold</i> THEN <b>Decline</b><br>ELSE Pass</div>
        </div></div>`;
    },
  };

  /* ================================================================
     Component charts
     ================================================================ */
  VIS["bre-rejection"] = {
    title: "Rule-wise rejection and referral by category",
    sub: "Applications failed or referred in Sep 26, attributed to their primary (deciding) rule category.",
    caption: "One primary rule per application, so the categories add up exactly to BRE failed (1,130) and BRE referred (1,694). Bureau, DPD and income rules drive most declines in the demo data.",
    render(el) {
      el.innerHTML = `<div data-slot="c"></div><div data-slot="t" style="margin-top:.6rem"></div>`;
      bars(slot(el, "c"), { cats: CATS, series: [{ name: "Declined (BRE failed)", values: CAT_DEC, color: "c4" }, { name: "Referred", values: CAT_REF, color: "c2" }], fmt: I, h: 220, label: "Rule-wise rejection by category" });
      const rows = CATS.map((c, i) => ({ c, d: CAT_DEC[i], ds: CAT_DEC[i] / FAIL, rf: CAT_REF[i], rs: CAT_REF[i] / REFER }))
        .concat([{ c: "Total", d: FAIL, ds: 1, rf: REFER, rs: 1, _total: true }]);
      slot(el, "t").innerHTML = html.table([
        { k: "c", l: "Category", html: (v, row) => (row._total ? bold(v) : esc(v)) }, { k: "d", l: "Declined", cls: "r", fmt: I }, { k: "ds", l: "Share of failed", cls: "r", fmt: (v) => P(v) },
        { k: "rf", l: "Referred", cls: "r", fmt: I }, { k: "rs", l: "Share of referred", cls: "r", fmt: (v) => P(v) }], rows, { rowClass: totalRow });
    },
  };

  VIS["bre-trend"] = {
    title: "Decision trend — Pass, Refer and Fail by month",
    sub: "Applications evaluated by the BRE each month, split by BRE decision.",
    caption: "Each bar is one month’s evaluated applications; the three parts always add up to the bar. The lower chart shows the same split as rates.",
    render(el) {
      el.innerHTML = `<div data-slot="b"></div><p class="label" style="margin:.6rem 0 .2rem">Rates · % of evaluated</p><div data-slot="l"></div>`;
      bars(slot(el, "b"), { cats: MONTHS, series: [{ name: "Passed", values: TREND.map((t) => t.p), color: "c1" }, { name: "Referred", values: TREND.map((t) => t.rf), color: "c2" }, { name: "Failed", values: TREND.map((t) => t.f), color: "c4" }], stacked: true, fmt: I, h: 230, label: "BRE decisions by month" });
      line(slot(el, "l"), { x: MONTHS, series: [{ name: "Pass rate", values: TREND.map((t) => t.p / t.n), color: "c1" }, { name: "Refer rate", values: TREND.map((t) => t.rf / t.n), color: "c2" }, { name: "Fail rate", values: TREND.map((t) => t.f / t.n), color: "c4" }], yMin: 0, yMax: 0.8, yFmt: (v) => P(v, 1), h: 170, label: "BRE decision rates" });
    },
  };

  VIS["bre-rules"] = {
    title: "Rule performance",
    sub: "Every illustrative rule: how often it fired, and how often it was the deciding rule.",
    caption: "Hits count every application where the rule fired; primary counts only the deciding rule, so primary declines add up to BRE failed. A rule can fire often but rarely decide, because a more severe rule fired first.",
    render(el) {
      const rows = RULES.map((x) => ({ id: x.id, name: x.name, cat: x.cat, out: x.out, hits: x.hits, hr: x.hits / EVAL, dec: x.dec, ref: x.ref, sd: x.dec / FAIL }))
        .concat([{ id: "Total", name: "", cat: "", out: "", hits: null, hr: null, dec: FAIL, ref: REFER, sd: 1, _total: true }]);
      const num = (f) => (v, row) => (v === null ? "—" : row._total ? bold(f(v)) : esc(f(v)));
      el.innerHTML = `<p class="note" style="margin:0 0 .5rem">Illustrative rules for demonstration — not production rules. Demo counts, Sep 26, ${I(EVAL)} applications evaluated.</p>` + html.table([
        { k: "id", l: "Rule", cls: "mono", html: (v, row) => (row._total ? bold(v) : esc(v)) }, { k: "name", l: "Description" }, { k: "cat", l: "Category" },
        { k: "out", l: "Outcome", html: (v) => (v ? (v === "Decline" ? html.pill(v, "crit") : v === "Refer" ? html.pill(v, "warn") : html.pill(v, "info")) : "") },
        { k: "hits", l: "Hits", cls: "r", html: num(I) }, { k: "hr", l: "Hit rate", cls: "r", html: num((v) => P(v)) },
        { k: "dec", l: "Primary declines", cls: "r", html: num(I) }, { k: "ref", l: "Primary refers", cls: "r", html: num(I) },
        { k: "sd", l: "Share of rejections", cls: "r", html: num((v) => P(v)) }], rows, { rowClass: totalRow });
    },
  };

  VIS["bre-funnel"] = {
    title: "Pre-BRE vs post-BRE funnel",
    sub: "From applications received to final approval, with what was held before the engine and how each BRE outcome ended.",
    caption: "Pre-BRE holds are data problems, not credit rejections, so they are kept out of the BRE fail count. The outcome table reconciles BRE decisions with final decisions (post-BRE routing is a representative workflow).",
    render(el) {
      el.innerHTML = `<div data-slot="f"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px;margin-top:.8rem">
          <div><p class="label" style="margin-bottom:.35rem">Held at pre-BRE · ${I(HELD_N)}</p><div data-slot="h"></div></div>
          <div><p class="label" style="margin-bottom:.35rem">BRE outcome → final decision</p><div data-slot="m"></div></div></div>`;
      funnel(slot(el, "f"), { stages: [{ label: "Applications", value: APPS, color: "c3" }, { label: "Pre-BRE cleared", value: EVAL, color: "c3" }, { label: "Not declined by BRE", value: PASS + REFER, color: "c1" }, { label: "Final approved", value: FINAL.appr, color: "c1" }], label: "Pre-BRE to final decision" });
      slot(el, "h").innerHTML = html.table([{ k: "l", l: "Reason", html: (v, row) => (row._total ? bold(v) : esc(v)) }, { k: "v", l: "Applications", cls: "r", fmt: I }],
        HELD.concat([{ l: "Total held", v: HELD_N, _total: true }]), { rowClass: totalRow });
      const m = [
        { o: "Pass", n: PASS, a: POST.pass.appr, d: POST.pass.dec, p: POST.pass.pend },
        { o: "Refer", n: REFER, a: POST.refer.appr, d: POST.refer.dec, p: POST.refer.pend },
        { o: "Decline", n: FAIL, a: POST.fail.appr, d: POST.fail.dec, p: POST.fail.pend },
        { o: "Total", n: EVAL, a: FINAL.appr, d: FINAL.dec, p: FINAL.pend, _total: true }];
      const cell = (v, row) => (row._total ? bold(I(v)) : esc(I(v)));
      slot(el, "m").innerHTML = html.table([{ k: "o", l: "BRE", html: (v, row) => (row._total ? bold(v) : outPill(v)) },
        { k: "n", l: "Evaluated", cls: "r", html: cell }, { k: "a", l: "Approved", cls: "r", html: cell }, { k: "d", l: "Declined", cls: "r", html: cell }, { k: "p", l: "Pending", cls: "r", html: cell }], m, { rowClass: totalRow });
    },
  };

  /* ================================================================
     BRE MONITORING DASHBOARD
     ================================================================ */
  VIS["bre-dashboard"] = {
    title: "BRE monitoring dashboard",
    sub: "Volumes through pre-BRE and the engine, outcomes, rule-wise rejection, decision trend and rule performance.",
    caption: "Application count, pre-BRE applications, passed / referred / failed, rule-wise rejection, decision trend and the most-fired rules. Rules shown are illustrative.",
    render(el) {
      const top = RULES.slice().sort((a, c) => c.hits - a.hits).slice(0, 6);
      el.innerHTML = dashShell("BRE Monitoring · Sep 26", ["Month: Sep 26", "Product: All", "Branch: All"], kpis([
        { l: "Applications", v: I(APPS), s: "received in month" },
        { l: "Pre-BRE applications", v: I(EVAL), s: I(HELD_N) + " held for data" },
        { l: "BRE passed", v: I(PASS), s: P(PASS / EVAL) + " of evaluated" },
        { l: "BRE referred", v: I(REFER), s: P(REFER / EVAL) + " of evaluated" },
        { l: "BRE failed", v: I(FAIL), s: P(FAIL / EVAL) + " of evaluated" },
      ]) + `<div class="dash-grid">${panel("Decision trend · last 12 months", "t")}${panel("Rule-wise rejection · BRE failed by category", "r", "", "Primary rule category · adds up to " + I(FAIL))}${panel("Pre-BRE to final decision", "f")}${panelHTML("Rule performance · most-fired rules", html.table([
        { k: "id", l: "Rule", cls: "mono" }, { k: "cat", l: "Category" }, { k: "hits", l: "Hits", cls: "r", fmt: I },
        { k: "hr", l: "Hit rate", cls: "r", fmt: (v) => P(v) }, { k: "sd", l: "Share of rej.", cls: "r", fmt: (v) => (v ? P(v) : "—") }],
        top.map((x) => ({ id: x.id, cat: x.cat, hits: x.hits, hr: x.hits / EVAL, sd: x.dec / FAIL }))), "", "Illustrative rules · share of rejections = primary declines ÷ BRE failed")}</div>`);
      bars(slot(el, "t"), { cats: MONTHS, series: [{ name: "Passed", values: TREND.map((t) => t.p), color: "c1" }, { name: "Referred", values: TREND.map((t) => t.rf), color: "c2" }, { name: "Failed", values: TREND.map((t) => t.f), color: "c4" }], stacked: true, fmt: I, h: 200, label: "BRE decisions by month" });
      barH(slot(el, "r"), { data: CATS.map((c, i) => ({ label: c, value: CAT_DEC[i], tip: I(CAT_DEC[i]) + " · " + P(CAT_DEC[i] / FAIL) + " of failed" })).sort((a, c) => c.value - a.value), fmt: I, color: "c4", label: "Rule-wise rejection" });
      funnel(slot(el, "f"), { stages: [{ label: "Applications", value: APPS, color: "c3" }, { label: "Pre-BRE cleared", value: EVAL, color: "c3" }, { label: "Not declined", value: PASS + REFER, color: "c1" }, { label: "Final approved", value: FINAL.appr, color: "c1" }], rowH: 32, label: "Pre-BRE to final decision" });
    },
  };

  /* ================================================================
     RULE CATALOGUE — illustrative screen
     ================================================================ */
  VIS["bre-catalogue"] = {
    title: "Rule catalogue (illustrative)",
    sub: "How rules are organised: category, condition with named thresholds, outcome and order of evaluation.",
    caption: "An illustrative screen, not a production rule set. Conditions use placeholders (threshold, minimum income, cut-off score); no production values are shown.",
    render(el) {
      const order = RULES.slice().sort((a, c) => (a.out === "Decline" ? 0 : 1) - (c.out === "Decline" ? 0 : 1));
      el.innerHTML = `<div class="app">
        <div class="app-top" style="flex-wrap:wrap"><b>BRE</b><span style="opacity:.8">Rule catalogue</span><span class="sp">Illustrative · not production rules</span></div>
        <div class="app-content">
          <div class="app-h"><strong>Active rules · ${RULES.length}</strong><span style="display:flex;gap:.3rem;flex-wrap:wrap">${["All"].concat(CATS).map((c, i) => html.pill(c, i ? "neutral" : "info")).join("")}</span></div>
          ${html.table([
            { k: "o", l: "Order", cls: "mono" }, { k: "id", l: "Rule ID", cls: "mono" }, { k: "cat", l: "Category" },
            { k: "cond", l: "Condition (placeholders)", cls: "wrap" },
            { k: "out", l: "Outcome", html: (v) => (v === "Decline" ? html.pill(v, "crit") : v === "Refer" ? html.pill(v, "warn") : html.pill(v, "info")) },
            { k: "st", l: "Status", html: () => html.pill("Active", "good") }],
            order.map((x, i) => ({ o: String(i + 1).padStart(2, "0"), id: x.id, cat: x.cat, cond: x.cond, out: x.out })))}
          <p class="app-note">Order: hard declines are checked first. The decision is the most severe outcome across all rules; the order picks the primary rule when several rules share that outcome. Threshold values live in a parameter table and are not shown.</p>
        </div></div>`;
    },
  };
})();
