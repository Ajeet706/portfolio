/* =====================================================================
   Customer UID & data quality — synthetic visuals. ALL DATA IS DEMO DATA.
   Names are obviously fictional ("Demo", "Sample", "Placeholder" style);
   IDs are dummy (CUST-D-…, LN-D-…, UID-D-…) and PAN / mobile are masked.
   Demo run totals (kept consistent across every visual):
     records 2,40,000 = no match 1,83,700 + exact-rule linked 36,800
                        + fuzzy auto-linked 14,600 + manual review 4,900
     duplicate groups 23,170 holding 51,400 records → 28,230 duplicate records
     unique customers (UIDs) 2,11,770 · duplicate rate 11.8%
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, comp, html, fmt, esc } = window.Charts;
  const VIS = window.VIS;
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const dashShell = (name, filters, body) =>
    `<div class="dash"><div class="dash-bar"><strong>${esc(name)}</strong><div class="dash-filters">${filters.map((f) => `<span>${esc(f)}</span>`).join("")}<span>Synthetic data</span></div></div>${body}</div>`;
  const panel = (title, slotId, extra = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div><div data-slot="${slotId}"></div></div>`;
  const label = (t) => `<p class="label" style="margin-bottom:.4rem">${esc(t)}</p>`;
  const yes = `<span style="color:var(--good);font-weight:600">✓</span>`;
  const no = `<span style="color:var(--crit);font-weight:600">✗</span>`;
  const dash = `<span style="color:var(--ink-3)">—</span>`;
  const decisionPill = (v) => html.pill(v, v.startsWith("Auto-link") ? "good" : v.startsWith("Review") ? "warn" : "neutral");

  /* ---------------- shared demo numbers ---------------- */
  const RUN = { records: 240000, unique: 211770, dupRecords: 28230, groups: 23170, inGroups: 51400, review: 4900, rate: 0.1176 };
  const SCORE_CATS = ["<50", "50–59", "60–69", "70–74", "75–79", "80–84", "85–89", "90–94", "95–99"];
  const SCORE_PAIRS = [11200, 6400, 4300, 2100, 1500, 1300, 1100, 4200, 6100];
  const SCORE_COL = ["n", "n", "n", "n", "c2", "c2", "c2", "c1", "c1"];

  /* ================================================================
     Data quality by field (completeness vs valid format)
     ================================================================ */
  VIS["uid-dq"] = {
    title: "Data quality by field",
    sub: "Share of customer records where the field is present, and present in a valid format.",
    caption: "In the demo data email is too incomplete to use as a match key. PAN is the field most worth fixing at source because it drives the strongest match rule.",
    render(el, o) {
      const f = ["Name", "DOB", "Mobile", "Address", "PAN", "Pincode", "Email"];
      bars(el, { thumb: o.thumb, cats: f, series: [{ name: "Complete", values: [1, 0.991, 0.982, 0.96, 0.914, 0.947, 0.543], color: "c3" }, { name: "Valid format", values: [0.998, 0.962, 0.951, 0.88, 0.897, 0.931, 0.488], color: "c1" }], fmt: fmt.pct, yFmt: fmt.pct0, max: 1, label: "Data quality by field" });
    },
  };

  VIS["uid-checks"] = {
    title: "Validation failures by check",
    sub: "Customer records failing each data-quality rule in the demo run.",
    caption: "Each check is a simple, explainable rule. Failures are reported back by field so data entry can be fixed at source.",
    render(el, o) {
      barH(el, { thumb: o.thumb, fmt: fmt.int, color: "c4", rowH: o.rowH, label: "Validation failures", data: [
        { label: "Address incomplete", value: 28800 }, { label: "PAN missing", value: 20640 }, { label: "Pincode not 6 digits", value: 16560 },
        { label: "DOB missing / implausible", value: 9120 }, { label: "Mobile placeholder / length", value: 7440 }, { label: "PAN pattern invalid", value: 4080 }] });
    },
  };

  /* ================================================================
     Matching outcome (records)
     ================================================================ */
  VIS["uid-matching"] = {
    title: "Matching outcome",
    sub: "What happened to every customer record in the demo run.",
    caption: "Exact rules on strong identifiers settle most links. Fuzzy matches at or above the auto-link score are linked; the grey zone goes to a person.",
    render(el, o) {
      comp(el, { thumb: o.thumb, label: "Matching outcome", parts: [{ label: "No match (unique)", value: 183700, color: "c3" }, { label: "Exact-rule link", value: 36800, color: "c1" }, { label: "Fuzzy auto-link", value: 14600, color: "c2" }, { label: "Manual review", value: 4900, color: "c4" }] });
    },
  };

  /* ================================================================
     Pair score distribution with thresholds
     ================================================================ */
  VIS["uid-scores"] = {
    title: "Candidate-pair score distribution",
    sub: "Fuzzy-scored pairs after blocking (exact-rule pairs excluded). Thresholds: below 75 no match · 75–89 review · 90+ auto-link.",
    caption: "The thresholds decide workload and risk together: lowering the auto-link score saves review time but raises the chance of merging two different people.",
    render(el, o) {
      el.innerHTML = (o.thumb ? "" : html.legend([{ name: "No match (< 75)", color: "n" }, { name: "Manual review (75–89)", color: "c2" }, { name: "Auto-link (90+)", color: "c1" }])) + `<div data-slot="c"></div>`;
      const c = slot(el, "c");
      bars(c, { thumb: o.thumb, cats: SCORE_CATS, series: [{ name: "Pairs", values: SCORE_PAIRS, color: "n", colors: SCORE_COL }], fmt: fmt.int, topLabels: (c.clientWidth || 600) > 520, label: "Pair score distribution" });
    },
  };

  /* ================================================================
     Matching candidates — pair table
     ================================================================ */
  const PAIRS = [
    { a: "CUST-D-20914", na: "Ramesh Demo Verma", b: "CUST-D-31877", nb: "RAMESH D. VERMA", key: "PAN", sim: 88, dob: 1, mob: 1, pan: 1, score: "100", dec: "Auto-link · PAN rule" },
    { a: "CUST-D-20914", na: "Ramesh Demo Verma", b: "CUST-D-42340", nb: "Ramesh Demo Varma", key: "PAN", sim: 95, dob: 1, mob: 0, pan: 1, score: "100", dec: "Auto-link · PAN rule" },
    { a: "CUST-D-31877", na: "RAMESH D. VERMA", b: "CUST-D-53915", nb: "R. D. Verma", key: "DOB + mobile", sim: 84, dob: 1, mob: 1, pan: null, score: "92", dec: "Auto-link · score" },
    { a: "CUST-D-27006", na: "Sunita Sample Rao", b: "CUST-D-61442", nb: "Sunita S. Rao", key: "DOB + mobile", sim: 86, dob: 1, mob: 1, pan: null, score: "93", dec: "Auto-link · score" },
    { a: "CUST-D-35518", na: "Anil Demo Kapoor", b: "CUST-D-58204", nb: "Anil Kumar Kapoor", key: "DOB + mobile", sim: 76, dob: 1, mob: 1, pan: null, score: "88", dec: "Review" },
    { a: "CUST-D-38861", na: "Vikram Dummy Singh", b: "CUST-D-60317", nb: "Vikram Singh", key: "DOB + mobile", sim: 70, dob: 1, mob: 1, pan: null, score: "85", dec: "Review" },
    { a: "CUST-D-51230", na: "Kavita Example Joshi", b: "CUST-D-57781", nb: "Manoj Test Sharma", key: "PAN", sim: 22, dob: 0, mob: 0, pan: 1, score: "—", dec: "Review · PAN conflict" },
    { a: "CUST-D-44120", na: "Priya Placeholder Nair", b: "CUST-D-49975", nb: "Priya P. Nair", key: "DOB + mobile", sim: 74, dob: 1, mob: 1, pan: 0, score: "60", dec: "No match · PANs differ" },
  ];
  const tick = (v) => (v === 1 ? yes : v === 0 ? no : dash);
  VIS["uid-candidates"] = {
    title: "Matching candidates",
    sub: "Candidate pairs from blocking, with the evidence behind each score. Score = 0.5 × name similarity + 30 (DOB agrees) + 20 (mobile agrees); same valid PAN = 100.",
    caption: "Each pair shows why it was linked or not. Two valid PANs that differ cap the score, and a shared PAN with very different names is a data-entry problem, not a merge.",
    render(el) {
      el.innerHTML = html.table([
        { k: "a", l: "Record A", html: (v, r) => `<span class="mono">${esc(v)}</span><br><small style="color:var(--ink-3)">${esc(r.na)}</small>` },
        { k: "b", l: "Record B", html: (v, r) => `<span class="mono">${esc(v)}</span><br><small style="color:var(--ink-3)">${esc(r.nb)}</small>` },
        { k: "key", l: "Blocking key" },
        { k: "sim", l: "Name sim.", cls: "r" },
        { k: "dob", l: "DOB", html: tick }, { k: "mob", l: "Mobile", html: tick }, { k: "pan", l: "PAN", html: tick },
        { k: "score", l: "Score", cls: "r", html: (v) => `<b>${esc(v)}</b>` },
        { k: "dec", l: "Decision", html: decisionPill }], PAIRS,
        { rowClass: (r) => (r.dec.includes("conflict") ? "hl" : "") }) +
        `<p class="app-note" style="margin-top:.5rem">✓ agrees · ✗ differs · — missing on one side. Highlighted row: same PAN on two very different names — routed to review and flagged as a data-quality issue.</p>`;
    },
  };

  /* ================================================================
     UID assignment — linked records → one UID → golden record
     ================================================================ */
  VIS["uid-assign"] = {
    title: "UID assignment and golden record",
    sub: "Four records of one fictional customer resolve to one UID; the golden record takes the best value of each field.",
    caption: "The linked group already held UID-D-000184 from an earlier run, so that UID is reused and downstream reports stay stable. New customers get a new UID.",
    render(el) {
      const recs = [
        { cif: "CUST-D-20914", loan: "LN-D-100211", name: "Ramesh Demo Verma", dob: "04-07-1986", mob: "98XXXX1043", pan: "XXXPX1234X", via: "Seed (existing UID)" },
        { cif: "CUST-D-31877", loan: "LN-D-100877", name: "RAMESH D. VERMA", dob: "1986-07-04", mob: "98XXXX1043", pan: "XXXPX1234X", via: "PAN rule · 100" },
        { cif: "CUST-D-42340", loan: "LN-D-102340", name: "Ramesh Demo Varma", dob: "04/07/86", mob: "97XXXX5521", pan: "XXXPX1234X", via: "PAN rule · 100" },
        { cif: "CUST-D-53915", loan: "LN-D-103915", name: "R. D. Verma", dob: "04-Jul-1986", mob: "98XXXX1043", pan: "—", via: "Score · 92" }];
      const golden = [
        { f: "UID", v: "UID-D-000184", src: "Reused from earlier run" },
        { f: "Name", v: "Ramesh Demo Verma", src: "Longest complete name" },
        { f: "DOB", v: "1986-07-04", src: "Agreed by 4 of 4 records" },
        { f: "Mobile", v: "98XXXX1043", src: "Most frequent, latest record" },
        { f: "PAN", v: "XXXPX1234X", src: "Valid pattern, 3 of 4 records" },
        { f: "Loans", v: "4", src: "LN-D-100211 … 103915" }];
      const reg = [
        { cif: "CUST-D-20914", uid: "UID-D-000184", rule: "Existing", st: "UID kept" },
        { cif: "CUST-D-31877", uid: "UID-D-000184", rule: "PAN", st: "Linked" },
        { cif: "CUST-D-42340", uid: "UID-D-000184", rule: "PAN", st: "Linked" },
        { cif: "CUST-D-53915", uid: "UID-D-000184", rule: "Score 92", st: "Linked" },
        { cif: "CUST-D-66018", uid: "UID-D-211771", rule: "No match", st: "New UID" }];
      el.innerHTML = `${label("Linked records · 4 customer records of one fictional customer")}${html.table([
          { k: "cif", l: "Record", cls: "mono" }, { k: "loan", l: "Loan", cls: "mono" }, { k: "name", l: "Name" }, { k: "dob", l: "DOB (as entered)" },
          { k: "mob", l: "Mobile", cls: "mono" }, { k: "pan", l: "PAN (dummy)", cls: "mono" }, { k: "via", l: "Linked by" }], recs)}
        <div aria-hidden="true" style="text-align:center;color:var(--ink-3);font-size:1.2rem;margin:.5rem 0">↓</div>
        <div class="dash-grid" style="align-items:start"><div>${label("Golden / unique customer record")}${html.table([{ k: "f", l: "Field" }, { k: "v", l: "Value", html: (v, r) => (r.f === "UID" ? `<b class="mono">${esc(v)}</b>` : esc(v)) }, { k: "src", l: "Survivorship rule" }], golden)}</div>
        <div>${label("UID register · rows written in this run")}${html.table([{ k: "cif", l: "Record", cls: "mono" }, { k: "uid", l: "UID", cls: "mono" }, { k: "rule", l: "Basis" },
          { k: "st", l: "Result", html: (v) => html.pill(v, v === "New UID" ? "info" : v === "UID kept" ? "neutral" : "good") }], reg)}</div></div>`;
    },
  };

  /* ================================================================
     Duplicate summary
     ================================================================ */
  VIS["uid-dupes"] = {
    title: "Where duplicates come from",
    sub: "Duplicate records by the reason a second record was created (demo run).",
    caption: "In the demo data most duplicates come from repeat borrowers being onboarded again for a new loan, not from typing errors — so the fix is a UID search at onboarding.",
    render(el, o) {
      barH(el, { thumb: o.thumb, fmt: fmt.int, color: "c4", rowH: o.rowH, label: "Duplicates by cause", data: [{ label: "Repeat loan, new record", value: 16900 }, { label: "Co-applicant later a borrower", value: 6240 }, { label: "Branch transfer", value: 3010 }, { label: "Data-entry variation", value: 2080 }] });
    },
  };
  VIS["uid-dup-summary"] = {
    title: "Duplicate summary",
    sub: "Duplicate groups after the UID run: how many, how large, why, and the largest groups.",
    caption: "A duplicate group is all records that resolved to one UID. Duplicate records = records in groups minus one per group.",
    render(el, o) {
      el.innerHTML = dashShell("Duplicate summary · UID run 08-Oct", ["All branches", "All products"], html.kpis([
        { l: "Duplicate groups", v: fmt.int(RUN.groups) }, { l: "Records in groups", v: fmt.int(RUN.inGroups) },
        { l: "Duplicate records", v: fmt.int(RUN.dupRecords) }, { l: "Duplicate rate", v: fmt.pct(RUN.rate), s: "of 2,40,000 records" }, { l: "Largest group", v: "7", s: "records" }]) +
        `<div class="dash-grid">${panel("Groups by size (records per UID)", "g")}${panel("Duplicates by cause", "c")}<div class="panel span2"><div class="panel-title">Largest duplicate groups</div><div data-slot="t"></div></div></div>`);
      bars(slot(el, "g"), { thumb: o.thumb, cats: ["2 records", "3 records", "4 records", "5+ records"], series: [{ name: "Groups", values: [19200, 3100, 650, 220], color: "c3" }], fmt: fmt.int, topLabels: true, h: 200, label: "Groups by size" });
      VIS["uid-dupes"].render(slot(el, "c"), Object.assign({}, o, { rowH: 44 }));
      slot(el, "t").innerHTML = html.table([{ k: "uid", l: "UID", cls: "mono" }, { k: "name", l: "Golden name" }, { k: "n", l: "Records", cls: "r" }, { k: "loans", l: "Loans", cls: "r" },
        { k: "br", l: "Branches", cls: "r" }, { k: "by", l: "Linked by" }, { k: "st", l: "Status", html: (v) => html.pill(v, v === "Linked" ? "good" : "warn") }], [
        { uid: "UID-D-004410", name: "Sunita Sample Rao", n: 7, loans: 7, br: 3, by: "PAN + DOB / mobile", st: "Linked" },
        { uid: "UID-D-000184", name: "Ramesh Demo Verma", n: 4, loans: 4, br: 2, by: "PAN + score", st: "Linked" },
        { uid: "UID-D-019772", name: "Anil Demo Kapoor", n: 4, loans: 3, br: 1, by: "DOB + mobile", st: "1 pair in review" },
        { uid: "UID-D-102305", name: "Farah Demo Siddiqui", n: 3, loans: 3, br: 2, by: "PAN", st: "Linked" }]);
    },
  };

  /* ================================================================
     Data quality dashboard
     ================================================================ */
  VIS["uid-dashboard"] = {
    title: "Data quality dashboard",
    sub: "Customer master health after the UID run: records in, unique customers out, field quality and matching outcome.",
    caption: "One page for the business: how many real customers there are, how clean the identifying fields are, and what still needs a reviewer.",
    render(el, o) {
      el.innerHTML = dashShell("Customer Master · Data Quality", ["UID run 08-Oct", "All sources"], html.kpis([
        { l: "Records scanned", v: fmt.int(RUN.records) }, { l: "Unique customers (UIDs)", v: fmt.int(RUN.unique) }, { l: "Duplicate rate", v: fmt.pct(RUN.rate) },
        { l: "Key fields all valid", v: "84.6%", s: "name, DOB, mobile, PAN" }, { l: "Pending manual review", v: fmt.int(RUN.review), s: "records" }]) +
        `<div class="dash-grid"><div class="panel span2"><div class="panel-title">Matching outcome (records)</div><div data-slot="m"></div></div>${panel("Completeness and validity by field", "q")}${panel("Validation failures by check", "v")}</div>`);
      VIS["uid-dq"].render(slot(el, "q"), o); VIS["uid-checks"].render(slot(el, "v"), Object.assign({}, o, { rowH: 36 })); VIS["uid-matching"].render(slot(el, "m"), o);
    },
  };
})();
