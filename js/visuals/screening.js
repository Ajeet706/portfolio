/* =====================================================================
   Customer name screening — synthetic visuals. ALL DATA IS DEMO DATA.
   Names are obviously fictional ("Demo", "Sample", "Placeholder" style).
   Lists are generic demo lists — no real watchlist names or entries.
   Statuses (exactly four, used everywhere):
     Clear · Potential Match · Review Required · Confirmed Match
   Demo month totals (kept consistent across every visual):
     15,454 screened = 15,150 below threshold (Clear) + 304 alerts
     304 alerts → Confirmed Match 31 · Clear after review 142 ·
                  Potential Match (open) 88 · Review Required (open) 43
     status totals: Clear 15,292 · Potential Match 88 · Review Required 43 · Confirmed Match 31
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, comp, html, fmt, esc } = window.Charts;
  const VIS = window.VIS;
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const dashShell = (name, filters, body) =>
    `<div class="dash"><div class="dash-bar"><strong>${esc(name)}</strong><div class="dash-filters">${filters.map((f) => `<span>${esc(f)}</span>`).join("")}<span>Synthetic data</span></div></div>${body}</div>`;
  const panel = (title, slotId, extra = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div><div data-slot="${slotId}"></div></div>`;

  const STATUS_KIND = { "Clear": "good", "Potential Match": "warn", "Confirmed Match": "crit" };
  // Review Required uses the slate-blue series colour so it is distinct from Clear (green) in both themes
  const statusPill = (v) => (v === "Review Required"
    ? `<span class="pill" style="background:color-mix(in srgb, var(--c3) 16%, transparent);color:var(--c3)">${esc(v)}</span>`
    : html.pill(v, STATUS_KIND[v] || "neutral"));
  const scoreCell = (v) => `<span class="bar-cell" style="width:${Math.round(v * 0.5)}px;background:${v >= 90 ? "var(--c4)" : v >= 75 ? "var(--c2)" : "var(--c-neutral)"}"></span><b>${v}</b>`;

  /* ================================================================
     Screening results — Customer Name | Screening Result | Match Score | Status
     ================================================================ */
  const RESULTS = [
    { name: "Anil Demo Kapoor", res: "PAN + name hit · Internal defaulter list (demo)", score: 100, status: "Confirmed Match" },
    { name: "Sunita Sample Rao", res: "Name + DOB agree · Watchlist A (demo)", score: 93, status: "Potential Match" },
    { name: "Mohd. Testfield Khan", res: "Name hit, DOB missing on list entry · Watchlist A (demo)", score: 86, status: "Review Required" },
    { name: "Farah Demo Siddiqi", res: "Name hit, customer PAN invalid (list has PAN) · Reference list B (demo)", score: 82, status: "Review Required" },
    { name: "Rohit Sample Mehta", res: "Name + DOB agree · Reference list B (demo)", score: 78, status: "Potential Match" },
    { name: "Priya Placeholder Nair", res: "Name similar, DOB differs (88 − 15) · Internal defaulter list (demo)", score: 73, status: "Clear" },
    { name: "Vikram Dummy Singh", res: "No candidate at or above 75", score: 64, status: "Clear" },
    { name: "Kavita Example Joshi", res: "No candidate at or above 75", score: 41, status: "Clear" },
  ];
  VIS["scr-results"] = {
    title: "Screening results",
    sub: "Best match per customer against the demo lists. Clearly fictional names; match score 0–100.",
    caption: "Every customer gets one of four statuses. A validated PAN hit is a Confirmed Match; name hits at 75+ become Potential Match when DOB / PAN can be compared, or Review Required when that evidence is missing.",
    render(el) {
      el.innerHTML = html.table([
        { k: "name", l: "Customer Name" },
        { k: "res", l: "Screening Result", cls: "wrap" },
        { k: "score", l: "Match Score", cls: "r", html: scoreCell },
        { k: "status", l: "Status", html: statusPill }], RESULTS);
    },
  };

  /* ================================================================
     Match-score distribution with thresholds
     ================================================================ */
  // 0–59 (14,050 customers, all Clear) is summarised in text so the alert bands stay readable
  const SCORE_CATS = ["60–64", "65–69", "70–74", "75–79", "80–84", "85–89", "90–94", "95–99", "100"];
  const SCORE_N = [520, 340, 240, 92, 74, 51, 38, 26, 23];
  const SCORE_COL = ["n", "n", "n", "c2", "c2", "c2", "c4", "c4", "c4"];
  VIS["scr-scores"] = {
    title: "Match-score distribution",
    sub: "Customers screened this month by best match score, 60–100. Thresholds: 75 = alert, 90 = high priority, 100 = validated PAN hit.",
    caption: "Below 75 the customer is Clear without review. At 75 and above an alert is raised; 90+ is reviewed first. Moving the alert threshold by five points changes reviewer workload sharply.",
    render(el, o) {
      el.innerHTML = (o.thumb ? "" : html.legend([{ name: "Below 75 — Clear", color: "n" }, { name: "75–89 — alert", color: "c2" }, { name: "90–100 — alert, reviewed first", color: "c4" }]) +
        `<p class="app-note" style="margin:0 0 .3rem">Not shown: scores 0–59 — 14,050 customers, all Clear.</p>`) + `<div data-slot="c"></div>`;
      const c = slot(el, "c");
      bars(c, { thumb: o.thumb, cats: SCORE_CATS, series: [{ name: "Customers", values: SCORE_N, color: "n", colors: SCORE_COL }], fmt: fmt.int, topLabels: (c.clientWidth || 600) > 560, label: "Match-score distribution" });
    },
  };

  /* ================================================================
     Status summary
     ================================================================ */
  VIS["scr-alert-status"] = {
    title: "Alerts by status",
    sub: "The 304 alerts raised this month (score 75+ or PAN hit), by current status.",
    caption: "Most alerts end as Clear once DOB or PAN shows a different person. Open Potential Match and Review Required cases make up the review queue.",
    render(el, o) {
      barH(el, { thumb: o.thumb, fmt: fmt.int, rowH: o.rowH, label: "Alerts by status", data: [
        { label: "Clear (after review)", value: 142, color: "good" }, { label: "Potential Match (open)", value: 88, color: "warn" },
        { label: "Review Required (open)", value: 43, color: "c3" }, { label: "Confirmed Match", value: 31, color: "crit" }] });
    },
  };
  VIS["scr-status"] = {
    title: "Status summary",
    sub: "All customers screened this month by status, and how the alerts were resolved.",
    caption: "Four statuses only. Clear dominates because most customers never reach the alert threshold; the work sits in the 131 open cases.",
    render(el, o) {
      el.innerHTML = html.kpis([
        { l: "Clear", v: fmt.int(15292), s: "15,150 below 75 · 142 after review", cls: "down-good" },
        { l: "Potential Match", v: "88", s: "open · evidence available" },
        { l: "Review Required", v: "43", s: "open · evidence missing" },
        { l: "Confirmed Match", v: "31", s: "23 PAN hits · 8 by review", cls: "up-bad" }]) +
        `<div class="dash-grid" style="margin-top:12px">${panel("Alerts by status (304 alerts)", "a")}${panel("Open queue by age", "q")}</div>`;
      VIS["scr-alert-status"].render(slot(el, "a"), Object.assign({}, o, { rowH: 48 }));
      bars(slot(el, "q"), { thumb: o.thumb, cats: ["0–2 days", "3–5 days", "6–10 days", "10+ days"], stacked: true, h: 210, fmt: fmt.int, topLabels: true, label: "Open queue by age",
        series: [{ name: "Potential Match", values: [41, 28, 13, 6], color: "c2" }, { name: "Review Required", values: [12, 14, 10, 7], color: "c3" }] });
    },
  };

  /* ================================================================
     Alerts by list
     ================================================================ */
  VIS["scr-lists"] = {
    title: "Alerts by list",
    sub: "Alerts raised this month by the list they hit (demo lists).",
    caption: "In the demo data the internal defaulter list produces most Confirmed Match outcomes because it can match on PAN, not only on name.",
    render(el, o) { comp(el, { thumb: o.thumb, label: "Alerts by list", parts: [{ label: "Internal defaulter list (demo)", value: 168, color: "c4" }, { label: "Watchlist A (demo)", value: 96, color: "c2" }, { label: "Reference list B (demo)", value: 40, color: "c3" }] }); },
  };

  /* ================================================================
     Review queue
     ================================================================ */
  const QUEUE = [
    { id: "SCR-D-0412", name: "Sunita Sample Rao", list: "Watchlist A (demo)", score: 93, dob: "Agrees", pan: "Not on list", status: "Potential Match", age: 1 },
    { id: "SCR-D-0398", name: "Mohd. Testfield Khan", list: "Watchlist A (demo)", score: 86, dob: "Missing", pan: "Not on list", status: "Review Required", age: 4 },
    { id: "SCR-D-0405", name: "Farah Demo Siddiqi", list: "Reference list B (demo)", score: 82, dob: "Agrees", pan: "Invalid", status: "Review Required", age: 2 },
    { id: "SCR-D-0377", name: "Rohit Sample Mehta", list: "Reference list B (demo)", score: 78, dob: "Agrees", pan: "Not on list", status: "Potential Match", age: 7 },
    { id: "SCR-D-0361", name: "Deepak Test Yadav", list: "Internal defaulter list (demo)", score: 76, dob: "Agrees", pan: "Missing", status: "Review Required", age: 11 },
  ];
  const ev = (v) => html.pill(v, v === "Agrees" ? "good" : v === "Differs" ? "crit" : "neutral");
  VIS["scr-queue"] = {
    title: "Review queue",
    sub: "Open Potential Match and Review Required cases, high scores first, with the evidence side by side for the selected case.",
    caption: "The reviewer sees why the alert fired and closes it as Confirmed Match or Clear with a reason. Review Required stays open until the missing DOB or PAN is obtained.",
    render(el) {
      const cmp = [
        { f: "Name (normalised)", c: "SUNITA SAMPLE RAO", l: "SUNITA S RAO", m: "Similar · 93" },
        { f: "Token key", c: "RAO SAMPLE SUNITA", l: "RAO S SUNITA", m: "Initial S ≈ SAMPLE" },
        { f: "DOB", c: "1979-03-12", l: "1979-03-12", m: "Agrees" },
        { f: "PAN (dummy)", c: "XXXRX4471X", l: "—", m: "Not on list" },
        { f: "List", c: "—", l: "Watchlist A (demo) · entry WL-D-2207", m: "" }];
      el.innerHTML = `<div class="app"><div class="app-top"><b>Name Screening · Review queue</b><span>131 open</span><span class="sp">reviewer.demo</span></div>
        <div class="app-content">
          <div class="app-h"><strong>Open cases</strong><span class="app-note">Sorted: score ≥ 90 first, then oldest</span></div>
          ${html.table([{ k: "id", l: "Case", cls: "mono" }, { k: "name", l: "Customer" }, { k: "list", l: "List" }, { k: "score", l: "Score", cls: "r" },
            { k: "dob", l: "DOB", html: ev }, { k: "pan", l: "PAN", html: ev }, { k: "status", l: "Status", html: statusPill }, { k: "age", l: "Age (days)", cls: "r" }], QUEUE,
            { rowClass: (r, i) => (i === 0 ? "best" : "") })}
          <div class="panel"><div class="panel-title">Case SCR-D-0412 · customer vs list entry</div>
            ${html.table([{ k: "f", l: "Field" }, { k: "c", l: "Customer", cls: "mono" }, { k: "l", l: "List entry", cls: "mono" }, { k: "m", l: "Evidence", html: (v) => (v ? html.pill(v, v === "Agrees" ? "good" : v.startsWith("Similar") ? "warn" : "neutral") : "") }], cmp)}
            <div class="app-h" style="margin-top:.6rem"><span class="app-note">Reviewer note: <i>Name and DOB agree; the list entry carries no PAN — check KYC documents, then confirm or mark Clear.</i></span>
              <span style="display:flex;gap:.4rem;flex-wrap:wrap"><span class="app-btn">Mark Confirmed Match</span><span class="app-btn ghost">Mark Clear</span><span class="app-btn ghost">Set Review Required</span></span></div>
          </div>
        </div></div>`;
    },
  };

  /* ================================================================
     Normalisation examples
     ================================================================ */
  const NORM = [
    { raw: "Mr. Mohd. Testfield Khan", steps: "title removed · Mohd → Mohammed · punctuation", out: "MOHAMMED TESTFIELD KHAN", key: "KHAN MOHAMMED TESTFIELD" },
    { raw: "KHAN, Mohammad Testfield", steps: "punctuation · Mohammad → Mohammed", out: "KHAN MOHAMMED TESTFIELD", key: "KHAN MOHAMMED TESTFIELD" },
    { raw: "Smt. Sunita  Sample-Rao", steps: "title removed · hyphen → space · extra spaces", out: "SUNITA SAMPLE RAO", key: "RAO SAMPLE SUNITA" },
    { raw: "Anil Kr. Demo Kapoor", steps: "Kr → Kumar · punctuation", out: "ANIL KUMAR DEMO KAPOOR", key: "ANIL DEMO KAPOOR KUMAR" },
    { raw: "Farah Demo Siddiqi", steps: "Siddiqi → Siddiqui (variant list)", out: "FARAH DEMO SIDDIQUI", key: "DEMO FARAH SIDDIQUI" },
    { raw: "Dr. Vikram D. Singh", steps: "title removed · initial kept", out: "VIKRAM D SINGH", key: "D SINGH VIKRAM" },
    { raw: " priya placeholder NAIR ", steps: "case · trim", out: "PRIYA PLACEHOLDER NAIR", key: "NAIR PLACEHOLDER PRIYA" },
  ];
  VIS["scr-normalise"] = {
    title: "Name normalisation — before → after",
    sub: "Customer names and list names go through the same steps before any comparison.",
    caption: "Rows 1 and 2 are the same fictional person written two ways; after normalisation their token keys are identical, so word order and spelling variants no longer hide a match.",
    render(el) {
      el.innerHTML = html.flowH(["Upper-case", "Remove punctuation", "Remove titles", "Map variants", "Collapse spaces", "Token-sorted key"]) +
        `<div style="margin-top:.8rem">${html.table([{ k: "raw", l: "Before (raw name)", html: (v) => `<span class="mono">“${esc(v)}”</span>` }, { k: "steps", l: "Steps applied", cls: "wrap" },
          { k: "out", l: "After (normalised)", cls: "mono" }, { k: "key", l: "Token-sorted key", cls: "mono" }], NORM, { rowClass: (r, i) => (i < 2 ? "best" : "") })}</div>`;
    },
  };

  /* ================================================================
     Dashboard
     ================================================================ */
  VIS["scr-dashboard"] = {
    title: "Screening dashboard",
    sub: "Onboarding and periodic screening this month: volumes, statuses, scores and lists.",
    caption: "How many customers were screened, how many needed a person, how the alerts were resolved and which list they came from.",
    render(el, o) {
      el.innerHTML = dashShell("Customer Name Screening · Sep 26", ["New + periodic", "All lists"], html.kpis([
        { l: "Customers screened", v: fmt.int(15454) }, { l: "Clear", v: fmt.int(15292) }, { l: "Potential Match", v: "88", s: "open" },
        { l: "Review Required", v: "43", s: "open" }, { l: "Confirmed Match", v: "31" }]) +
        `<div class="dash-grid"><div class="panel span2"><div class="panel-title">Match-score distribution</div><div data-slot="s"></div></div>${panel("Alerts by status (304)", "a")}${panel("Alerts by list", "l")}<div class="panel span2"><div class="panel-title">Latest results</div><div data-slot="t"></div></div></div>`);
      VIS["scr-scores"].render(slot(el, "s"), o); VIS["scr-alert-status"].render(slot(el, "a"), o); VIS["scr-lists"].render(slot(el, "l"), o);
      slot(el, "t").innerHTML = html.table([{ k: "name", l: "Customer Name" }, { k: "score", l: "Match Score", cls: "r" }, { k: "status", l: "Status", html: statusPill }], RESULTS.slice(0, 5));
    },
  };
})();
