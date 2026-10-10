/* =====================================================================
   RR Logistics — synthetic visuals. ALL DATA IS DEMO DATA.
   rr-*  Transportation Operations Management System (the operational
         application / system of record). Screens are representative
         re-creations of its confirmed modules, not copies of real screens.
   la-*  Freight Audit & Logistics Performance Analytics (analysis and
         KPI reporting on that data; dashboards re-created Zoho-style).
   Vehicle IDs, names, amounts and counts are dummy values. The trip
   origin is shown as "Hub" because the real location is not stated.
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, line, matrix, comp, funnel, html, fmt, esc } = window.Charts;
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
  const M6 = MONTHS.slice(6);
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const dashShell = (name, filters, body) =>
    `<div class="dash"><div class="dash-bar"><strong>${esc(name)}</strong><div class="dash-filters">${filters.map((f) => `<span>${esc(f)}</span>`).join("")}<span>Synthetic data</span></div></div>${body}</div>`;
  const panel = (title, slotId, extra = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div><div data-slot="${slotId}"></div></div>`;
  const inr = (v) => "₹" + fmt.int(v);
  const mono = (v) => `<span style="font-family:var(--f-mono);font-size:.74rem">${esc(v)}</span>`;

  /* ---------- shared demo data (consistent across both RR projects) ---------- */
  const ROUTES = [
    { d: "Ambala", trips: 128, delayed: 12, exp: 22, act: 23.1 },
    { d: "Chennai", trips: 64, delayed: 15, exp: 52, act: 56.4 },
    { d: "Bhiwandi", trips: 92, delayed: 14, exp: 30, act: 32.2 },
    { d: "Hyderabad", trips: 70, delayed: 13, exp: 40, act: 43.0 },
    { d: "Ahmedabad", trips: 132, delayed: 11, exp: 18, act: 18.6 },
  ];
  const route = (d) => "Hub → " + d;
  const TRIPS = ROUTES.reduce((a, r) => a + r.trips, 0);            // 486
  const DELAYED = ROUTES.reduce((a, r) => a + r.delayed, 0);        // 65
  const ON_TIME = 1 - DELAYED / TRIPS;                              // 86.6%

  /* ---------- application shell (generic; UI technology not shown) ---------- */
  const MENU = ["Dashboard", "Fleet master", "Drivers", "Trips", "Billing", "Maintenance", "Store", "Reports"];
  const app = (active, body) =>
    `<div class="app"><div class="app-top" style="flex-wrap:wrap;row-gap:.2rem"><b>TOMS</b><span>Transportation Operations Management</span><span class="sp">ops.demo · demo data</span></div>
      <div class="app-main"><div class="app-side">${MENU.map((m) => `<span class="${m === active ? "on" : ""}">${m}</span>`).join("")}</div><div class="app-content">${body}</div></div></div>`;
  const btn = (t, ghost) => `<span class="app-btn${ghost ? " ghost" : ""}">${esc(t)}</span>`;
  const head = (title, btns = []) => `<div class="app-h"><strong>${esc(title)}</strong><div style="display:flex;gap:.4rem;flex-wrap:wrap">${btns.join("")}</div></div>`;
  const field = (l, v) => `<div class="app-in">${esc(l)}<span>${esc(v)}</span></div>`;
  const sub = (t) => `<p class="label" style="margin:.2rem 0 -.3rem">${esc(t)}</p>`;
  const docPill = (days) => (days < 0 ? html.pill("Expired", "crit") : days <= 30 ? html.pill("Due ≤ 30 days", "warn") : days <= 90 ? html.pill("Due ≤ 90 days", "info") : html.pill("Valid", "good"));

  /* ================================================================
     11 · TRANSPORTATION OPERATIONS MANAGEMENT SYSTEM  (rr-*)
     ================================================================ */

  /* ---- Fleet compliance dashboard ---- */
  const EXPIRY = { rows: ["Insurance", "Permit", "Fitness"], cols: ["Expired", "0–30 days", "31–60 days", "61–90 days"], values: [[1, 4, 3, 5], [0, 2, 4, 2], [2, 3, 1, 2]] };
  const ACTIONS = [
    { v: "VH-D-018", type: "12-wheel", dep: "Scorpion", doc: "Fitness", till: "03 Oct 2026", days: -6 },
    { v: "VH-D-091", type: "10-wheel", dep: "Market", doc: "Fitness", till: "07 Oct 2026", days: -2 },
    { v: "VH-D-044", type: "12-wheel", dep: "Scorpion", doc: "Insurance", till: "08 Oct 2026", days: -1 },
    { v: "VH-D-027", type: "10-wheel", dep: "Scorpion", doc: "Permit", till: "14 Oct 2026", days: 5 },
    { v: "VH-D-073", type: "12-wheel", dep: "Scorpion", doc: "Insurance", till: "21 Oct 2026", days: 12 },
    { v: "VH-D-055", type: "10-wheel", dep: "Market", doc: "Fitness", till: "02 Nov 2026", days: 24 },
  ];
  VIS["rr-compliance"] = {
    title: "Fleet compliance dashboard — insurance, permit, fitness",
    sub: "Documents expired or expiring in the next 30 / 60 / 90 days, as of 09 Oct 2026.",
    caption: "Renewals become planned work: the action list shows every expired document and everything due within 30 days, vehicle by vehicle.",
    render(el, o) {
      const col = (j) => EXPIRY.values.reduce((a, r) => a + r[j], 0);
      el.innerHTML = dashShell("Fleet compliance · 09 Oct 2026", ["All vehicles", "Insurance · Permit · Fitness"], html.kpis([
        { l: "Active vehicles", v: "104" }, { l: "Documents tracked", v: "312", s: "3 per vehicle" },
        { l: "Expired", v: String(col(0)), s: "action today", cls: "up-bad" }, { l: "Due in 0–30 days", v: String(col(1)) },
        { l: "Due in 31–90 days", v: String(col(2) + col(3)) }]) +
        `<div class="dash-grid">${panel("Documents by expiry window", "m")}${panel("Due in the next 90 days, by vehicle type", "t")}
          <div class="panel span2"><div class="panel-title">Action list — expired and due within 30 days</div><div data-slot="a"></div></div></div>`);
      matrix(slot(el, "m"), { thumb: o.thumb, rows: EXPIRY.rows, cols: EXPIRY.cols, values: EXPIRY.values, max: 5, cellH: 40, fmt: (v) => String(v),
        cellColor: (i, j) => (j === 0 ? "var(--crit)" : j === 1 ? "var(--warn)" : "var(--c3)"), tipFmt: (v) => `${v} document${v === 1 ? "" : "s"}`, label: "Documents by expiry window" });
      barH(slot(el, "t"), { thumb: o.thumb, fmt: (v) => String(v), color: "c3", data: [{ label: "10-wheel", value: 11 }, { label: "12-wheel", value: 12 }, { label: "Other configurations", value: 3 }], label: "Due in 90 days by type" });
      slot(el, "a").innerHTML = html.table([{ k: "v", l: "Vehicle", cls: "mono" }, { k: "type", l: "Type" }, { k: "dep", l: "Deployment" }, { k: "doc", l: "Document" },
        { k: "till", l: "Valid till" }, { k: "days", l: "Days left", cls: "r" }, { k: "days", l: "Status", html: (v) => docPill(v) }], ACTIONS, { rowClass: (r) => (r.days < 0 ? "hl" : "") });
    },
  };

  /* ---- Vehicle master ---- */
  const FLEET = [
    { v: "VH-D-073", type: "12-wheel", dep: "Scorpion", ins: "21 Oct 2026", per: "14 Mar 2027", fit: "30 Jun 2027", d: 12 },
    { v: "VH-D-027", type: "10-wheel", dep: "Scorpion", ins: "18 Feb 2027", per: "14 Oct 2026", fit: "11 Dec 2026", d: 5 },
    { v: "VH-D-044", type: "12-wheel", dep: "Scorpion", ins: "08 Oct 2026", per: "02 Aug 2027", fit: "19 Apr 2027", d: -1 },
    { v: "VH-D-062", type: "12-wheel", dep: "Scorpion", ins: "27 Jan 2027", per: "09 May 2027", fit: "23 Feb 2027", d: 107 },
    { v: "VH-D-055", type: "10-wheel", dep: "Market", ins: "12 Mar 2027", per: "30 Jan 2027", fit: "02 Nov 2026", d: 24 },
    { v: "VH-D-091", type: "10-wheel", dep: "Market", ins: "05 Apr 2027", per: "16 Jun 2027", fit: "07 Oct 2026", d: -2 },
    { v: "VH-D-102", type: "Other config.", dep: "Other vendor", ins: "19 Jul 2027", per: "28 Mar 2027", fit: "14 Jan 2027", d: 97 },
  ];
  VIS["rr-vehicle-master"] = {
    title: "Fleet master — vehicle record and documents",
    sub: "Vehicle type, deployment and the validity of insurance, permit and fitness.",
    caption: "One record per vehicle. Document dates entered here drive the expiry monitoring; the list shows each vehicle’s nearest expiry.",
    render(el) {
      el.innerHTML = app("Fleet master", `${head("Vehicle master", [btn("+ Add vehicle"), btn("Export", true)])}
        <div class="app-form">${field("Vehicle ID", "VH-D-073")}${field("Vehicle type", "12-wheel")}${field("Deployment", "Scorpion")}
          ${field("Insurance policy no.", "XXXXXX4419")}${field("Insurance valid till", "21 Oct 2026")}${field("Permit valid till", "14 Mar 2027")}
          ${field("Fitness valid till", "30 Jun 2027")}${field("Document copies", "Insurance · Permit · Fitness")}${field("Status", "Active")}</div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap">${btn("Save")}${btn("Renew document", true)}<span class="app-note" style="align-self:center">A renewal adds a new validity period; history is kept.</span></div>
        ${sub("Vehicles")}${html.table([{ k: "v", l: "Vehicle", cls: "mono" }, { k: "type", l: "Type" }, { k: "dep", l: "Deployment" },
          { k: "ins", l: "Insurance till" }, { k: "per", l: "Permit till" }, { k: "fit", l: "Fitness till" }, { k: "d", l: "Compliance", html: (v) => docPill(v) }], FLEET)}`);
    },
  };

  /* ---- Driver management ---- */
  const DRIVERS = [
    { id: "DRV-D-014", name: "Ravi Demo", ph: "98XXXXX101", dl: "DL-XXXXXXX-0412", till: "18 May 2029", veh: "VH-D-073", cond: "Ajay Sample", st: "On trip" },
    { id: "DRV-D-021", name: "Suresh Sample", ph: "97XXXXX318", dl: "DL-XXXXXXX-0877", till: "02 Feb 2028", veh: "VH-D-027", cond: "Kamal Demo", st: "On trip" },
    { id: "DRV-D-026", name: "Harish Example", ph: "94XXXXX652", dl: "DL-XXXXXXX-1190", till: "29 Oct 2026", veh: "VH-D-062", cond: "Vinod Test", st: "Licence due" },
    { id: "DRV-D-033", name: "Gurdeep Placeholder", ph: "99XXXXX027", dl: "DL-XXXXXXX-1534", till: "11 Aug 2030", veh: "VH-D-055", cond: "Raju Example", st: "Available" },
    { id: "DRV-D-038", name: "Manoj Test", ph: "96XXXXX884", dl: "DL-XXXXXXX-1761", till: "07 Jan 2028", veh: "VH-D-091", cond: "—", st: "Available" },
    { id: "DRV-D-041", name: "Salim Dummy", ph: "93XXXXX245", dl: "DL-XXXXXXX-1902", till: "23 Sep 2027", veh: "—", cond: "—", st: "Unassigned" },
  ];
  VIS["rr-driver"] = {
    title: "Driver management — licences and crew assignment",
    sub: "Driver details, phone, driving licence and validity, assigned vehicle and conductor.",
    caption: "Every vehicle has a known driver and conductor; licences close to expiry are visible before the driver is put on a trip. Names are fictional; phone and licence numbers are masked.",
    render(el) {
      const pill = (v) => html.pill(v, v === "On trip" ? "info" : v === "Available" ? "good" : v === "Licence due" ? "warn" : "neutral");
      el.innerHTML = app("Drivers", `${head("Driver management", [btn("+ Add driver"), btn("Assign crew", true)])}
        ${html.table([{ k: "id", l: "Driver ID", cls: "mono" }, { k: "name", l: "Name" }, { k: "ph", l: "Phone", cls: "mono" }, { k: "dl", l: "Licence no.", cls: "mono" },
          { k: "till", l: "Licence valid till" }, { k: "veh", l: "Vehicle", cls: "mono" }, { k: "cond", l: "Conductor" }, { k: "st", l: "Status", html: pill }], DRIVERS,
          { rowClass: (r) => (r.st === "Licence due" ? "hl" : "") })}
        ${sub("Assign crew to vehicle")}
        <div class="app-form">${field("Vehicle", "VH-D-102 · Other config.")}${field("Driver", "DRV-D-041 · Salim Dummy")}${field("Conductor", "CND-D-019 · Deepak Demo")}
          ${field("From date", "09 Oct 2026")}${field("Licence valid till", "23 Sep 2027")}${field("Vehicle documents", "Valid")}</div>
        <div>${btn("Save assignment")}</div>`);
    },
  };

  /* ---- Trip creation ---- */
  VIS["rr-trip-create"] = {
    title: "Trip creation",
    sub: "Source, destination, vehicle, driver, conductor and expected duration.",
    caption: "A trip is created with its expected duration; the actual duration is recorded when it closes. That pair is what makes delays and route performance measurable.",
    render(el) {
      el.innerHTML = app("Trips", `${head("Create trip", [btn("Save trip"), btn("Cancel", true)])}
        <div class="app-form">${field("Trip ID", "TRP-D-24519 (auto)")}${field("Deployment", "Scorpion")}${field("Status", "Planned")}
          ${field("Source", "Hub")}${field("Destination", "Chennai")}${field("Route", "Hub → Chennai")}
          ${field("Vehicle", "VH-D-073 · 12-wheel")}${field("Driver", "DRV-D-014 · Ravi Demo")}${field("Conductor", "CND-D-022 · Ajay Sample")}
          ${field("Planned start", "09 Oct 2026, 18:00")}${field("Expected duration", "52 h")}${field("Expected arrival", "11 Oct 2026, 22:00")}</div>
        <p class="app-note">Representative / Demo Workflow — when the vehicle is chosen, its document validity is shown: insurance till 21 Oct 2026, permit till 14 Mar 2027, fitness till 30 Jun 2027.</p>
        ${sub("On closing the trip")}
        <div class="app-form">${field("Actual start", "09 Oct 2026, 18:20")}${field("Actual end", "dd/mm/yyyy hh:mm")}${field("Actual duration", "calculated")}</div>`);
    },
  };

  /* ---- Trip status board ---- */
  const BOARD = [
    { st: "Planned", n: 6, cards: [{ id: "TRP-D-24519", r: "Chennai", v: "VH-D-073", d: "Ravi Demo", t: "Starts 09 Oct 18:00 · 52 h" }, { id: "TRP-D-24521", r: "Ahmedabad", v: "VH-D-055", d: "Gurdeep Placeholder", t: "Starts 10 Oct 06:00 · 18 h" }] },
    { st: "In transit", n: 18, cards: [{ id: "TRP-D-24502", r: "Bhiwandi", v: "VH-D-027", d: "Suresh Sample", t: "21 h of 30 h" }, { id: "TRP-D-24497", r: "Hyderabad", v: "VH-D-062", d: "Harish Example", t: "46 h of 40 h", late: "Delayed 6 h" }, { id: "TRP-D-24505", r: "Ambala", v: "VH-D-038", d: "Manoj Test", t: "9 h of 22 h" }] },
    { st: "Delivered", n: 7, cards: [{ id: "TRP-D-24488", r: "Ahmedabad", v: "VH-D-012", d: "Salim Dummy", t: "18.4 h of 18 h" }, { id: "TRP-D-24481", r: "Chennai", v: "VH-D-044", d: "Ravi Demo", t: "57.5 h of 52 h", late: "Delayed 5.5 h" }] },
    { st: "Closed", n: 486, cards: [{ id: "TRP-D-24470", r: "Ambala", v: "VH-D-091", d: "Manoj Test", t: "22.6 h of 22 h · billed" }, { id: "TRP-D-24466", r: "Bhiwandi", v: "VH-D-083", d: "Suresh Sample", t: "31.0 h of 30 h · billed" }] },
  ];
  VIS["rr-trip-board"] = {
    title: "Trip status board",
    sub: "Trips by status with elapsed vs expected time; late trips flagged.",
    caption: "Operations sees every trip’s status in one place. Elapsed time is compared with the expected duration, so a trip running late is visible while it is still on the road.",
    render(el) {
      const card = (c) => `<div style="border:1px solid var(--rule);border-radius:4px;background:var(--paper-raised);padding:.45rem .55rem;display:grid;gap:.15rem;font-size:.74rem;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.3rem;flex-wrap:wrap">${mono(c.id)}${c.late ? html.pill(c.late, "crit") : ""}</div>
          <span style="color:var(--ink);font-weight:600">${esc(route(c.r))}</span><span style="color:var(--ink-3)">${esc(c.v)} · ${esc(c.d)}</span><span style="color:var(--ink-3)">${esc(c.t)}</span></div>`;
      const col = (c) => `<div style="background:var(--paper-sunk);border-radius:6px;padding:.5rem;display:grid;gap:.4rem;align-content:start;min-width:0">
          <div style="display:flex;justify-content:space-between;font-weight:600;font-size:.78rem"><span>${esc(c.st)}</span><span style="color:var(--ink-3)">${c.st === "Closed" ? "486 this month" : c.n}</span></div>${c.cards.map(card).join("")}</div>`;
      el.innerHTML = app("Trips", `${head("Trip status", [btn("+ Create trip"), btn("Filter: all routes", true)])}
        ${html.kpis([{ l: "Planned", v: "6" }, { l: "In transit", v: "18" }, { l: "Running late", v: "3", cls: "up-bad", s: "elapsed > expected" }, { l: "Delivered, to close", v: "7" }])}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">${BOARD.map(col).join("")}</div>`);
    },
  };

  /* ---- Fleet performance dashboard (thumb) ---- */
  const LOW_UTIL = [["VH-D-091", 0.52], ["VH-D-066", 0.57], ["VH-D-012", 0.61], ["VH-D-083", 0.63], ["VH-D-038", 0.64], ["VH-D-097", 0.66], ["VH-D-025", 0.68], ["VH-D-049", 0.69]];
  const DRV_PERF = [
    { n: "Ravi Demo", t: 8, ot: 1, dl: 0 }, { n: "Harish Example", t: 9, ot: 0.889, dl: 0.6 }, { n: "Suresh Sample", t: 7, ot: 0.857, dl: 0.9 },
    { n: "Manoj Test", t: 8, ot: 0.75, dl: 1.9 }, { n: "Gurdeep Placeholder", t: 6, ot: 0.667, dl: 2.8 }];
  const tripTime = (el, o) =>
    bars(el, { thumb: o.thumb, cats: ROUTES.map((r) => r.d), series: [{ name: "Expected (h)", values: ROUTES.map((r) => r.exp), color: "n" }, { name: "Actual (h)", values: ROUTES.map((r) => r.act), color: "c3" }], fmt: (v) => v.toFixed(1) + " h", yFmt: (v) => v + " h", h: 220, label: "Trip time by route — Hub to destination" });
  VIS["rr-fleet-perf"] = {
    title: "Fleet performance dashboard",
    sub: "Utilisation, trip time by route, delays, driver performance and the Scorpion vs market split.",
    caption: "The monthly view management reviews: how many trips ran, how many were late and where, which vehicles are under-used and how the fleet splits between Scorpion and market work.",
    render(el, o) {
      el.innerHTML = dashShell("Fleet performance · Sep 2026", ["All routes", "All vehicles"], html.kpis([
        { l: "Active vehicles", v: "104", s: "80 Scorpion · 24 market / other" }, { l: "Trips completed", v: fmt.int(TRIPS) },
        { l: "On-time trips", v: fmt.pct(ON_TIME) }, { l: "Fleet utilisation", v: "78%", s: "trip days ÷ available days" }, { l: "Avg delay, late trips", v: "5.4 h" }]) +
        `<div class="dash-grid"><div class="panel span2"><div class="panel-title">Average trip time by route — expected vs actual (hours)</div><div data-slot="tt"></div></div>
          <div class="panel"><div class="panel-title">Scorpion vs market — trips this month</div><div data-slot="dep"></div><div class="panel-title" style="margin-top:.9rem">Scorpion vs market — vehicles</div><div data-slot="veh"></div></div>${panel("Delayed trips by route", "dl")}${panel("Lowest utilisation — 8 vehicles", "ut")}
          <div class="panel"><div class="panel-title">Driver performance</div><div data-slot="dr"></div></div></div>`);
      tripTime(slot(el, "tt"), o);
      comp(slot(el, "dep"), { thumb: o.thumb, parts: [{ label: "Scorpion (pharma)", value: 392, color: "c3" }, { label: "Market & other vendors", value: TRIPS - 392, color: "c2" }], label: "Trips by deployment" });
      comp(slot(el, "veh"), { thumb: o.thumb, parts: [{ label: "Scorpion (pharma)", value: 80, color: "c3" }, { label: "Market & other vendors", value: 24, color: "c2" }], label: "Vehicles by deployment" });
      barH(slot(el, "dl"), { thumb: o.thumb, fmt: fmt.pct, max: 0.3, data: ROUTES.map((r) => ({ label: route(r.d), value: r.delayed / r.trips, color: r.delayed / r.trips > 0.15 ? "c4" : "c3", tip: `${r.delayed} of ${r.trips} trips` })), label: "Delayed trips by route" });
      barH(slot(el, "ut"), { thumb: o.thumb, fmt: fmt.pct0, max: 1, data: LOW_UTIL.map(([v, u]) => ({ label: v, value: u, color: u < 0.6 ? "c4" : "c2" })), ref: { value: 0.78, label: "Fleet 78%" }, label: "Lowest utilisation" });
      slot(el, "dr").innerHTML = html.table([{ k: "n", l: "Driver" }, { k: "t", l: "Trips", cls: "r" }, { k: "ot", l: "On time", cls: "r", fmt: (v) => fmt.pct0(v) }, { k: "dl", l: "Avg delay", cls: "r", fmt: (v) => v.toFixed(1) + " h" }], DRV_PERF);
    },
  };

  /* ---- Route performance ---- */
  const ROUTE_OT = [[91, 92, 90, 93, 89, 91], [72, 75, 78, 74, 77, 77], [84, 83, 86, 88, 85, 85], [79, 81, 80, 83, 82, 81], [93, 92, 94, 91, 92, 92]];
  const ROUTE_6M = [{ t: 742, a: 23.0 }, { t: 371, a: 56.6 }, { t: 548, a: 32.1 }, { t: 412, a: 42.9 }, { t: 776, a: 18.6 }];
  VIS["rr-route-perf"] = {
    title: "Route performance report",
    sub: "On-time % by route and month, and six-month route summary. Apr–Sep 2026.",
    caption: "Each route is judged against its own expected duration. Hub → Chennai is consistently the weakest route and is the one to investigate first.",
    render(el, o) {
      const rows = ROUTES.map((r, i) => ({ route: route(r.d), trips: ROUTE_6M[i].t, exp: r.exp, act: ROUTE_6M[i].a, delay: ROUTE_6M[i].a - r.exp, ot: ROUTE_OT[i].reduce((a, b) => a + b, 0) / 6 / 100 }));
      el.innerHTML = dashShell("Route performance · Apr–Sep 2026", ["Closed trips", "All deployments"],
        `<div class="dash-grid"><div class="panel span2"><div class="panel-title">On-time trips by route and month</div><div data-slot="m"></div></div>
          <div class="panel span2"><div class="panel-title">Route summary — six months</div><div data-slot="t"></div></div></div>`);
      matrix(slot(el, "m"), { thumb: o.thumb, rows: ROUTES.map((r) => route(r.d)), cols: M6, values: ROUTE_OT, min: 60, max: 100, cellH: 34, fmt: (v) => v + "%", color: "c1", label: "On-time by route and month" });
      slot(el, "t").innerHTML = html.table([{ k: "route", l: "Route" }, { k: "trips", l: "Trips", cls: "r", fmt: fmt.int }, { k: "exp", l: "Expected (h)", cls: "r" },
        { k: "act", l: "Actual avg (h)", cls: "r", fmt: (v) => v.toFixed(1) }, { k: "delay", l: "Avg delay (h)", cls: "r", fmt: (v) => v.toFixed(1) },
        { k: "ot", l: "On time", cls: "r", html: (v) => (v < 0.8 ? html.pill(fmt.pct(v), "crit") : esc(fmt.pct(v))) }], rows, { rowClass: (r) => (r.ot < 0.8 ? "hl" : "") });
    },
  };

  /* ---- Billing reconciliation ---- */
  const RECON = [
    { trip: "TRP-D-24410", r: "Chennai", v: "VH-D-073", ours: 86400, theirs: 86400, f: "Matched" },
    { trip: "TRP-D-24417", r: "Bhiwandi", v: "VH-D-027", ours: 52800, theirs: null, f: "Missing vendor bill" },
    { trip: "TRP-D-24422", r: "Hyderabad", v: "VH-D-044", ours: null, theirs: 71200, f: "Missing trip bill" },
    { trip: "TRP-D-24431", r: "Ambala", v: "VH-D-018", ours: 38600, theirs: 41100, f: "Vendor mistake — amount" },
    { trip: "TRP-D-24436", r: "Ahmedabad", v: "VH-D-055", ours: 31900, theirs: 63800, f: "Vendor mistake — billed twice" },
    { trip: "TRP-D-24440", r: "Chennai", v: "VH-D-062", ours: 86400, theirs: 82000, f: "Claim raised · CLM-D-118" },
  ];
  VIS["rr-billing"] = {
    title: "Billing reconciliation — trip billing vs vendor bills",
    sub: "Completed trips, trip bills, vendor bills, missing bills, vendor mistakes and claims. Sep 2026.",
    caption: "Representative / Demo Workflow: bills are matched trip by trip with a small tolerance. Every completed trip should end in a matched bill; anything else is listed with a reason and followed up, or raised as a claim.",
    render(el, o) {
      const kind = (f) => (f === "Matched" ? "good" : f.startsWith("Claim") || f.startsWith("Missing vendor") ? "warn" : "crit");
      el.innerHTML = dashShell("Billing reconciliation · Sep 2026", ["All deployments", "All vendors"], html.kpis([
        { l: "Trips completed", v: fmt.int(TRIPS) }, { l: "Trip bills raised", v: "479" }, { l: "Missing trip bills", v: "7", cls: "up-bad", s: "completed, not billed" },
        { l: "Vendor bills received", v: "468" }, { l: "Vendor mistakes", v: "11" }, { l: "Open claims", v: "6" }]) +
        `<div class="dash-grid">${panel("From trip to matched bill", "f")}${panel("Exceptions by type", "x")}
          <div class="panel span2"><div class="panel-title">Reconciliation lines (sample)</div><div data-slot="t"></div></div></div>`);
      funnel(slot(el, "f"), { thumb: o.thumb, stages: [{ label: "Trips completed", value: TRIPS }, { label: "Trip bills raised", value: 479 }, { label: "Vendor bills received", value: 468 }, { label: "Matched, no difference", value: 457 }], color: "c3", label: "Billing funnel" });
      barH(slot(el, "x"), { thumb: o.thumb, fmt: (v) => String(v), data: [{ label: "Missing vendor bill", value: 11, color: "c2" }, { label: "Vendor mistake — amount", value: 8, color: "c4" }, { label: "Missing trip bill", value: 7, color: "c4" }, { label: "Open claims", value: 6, color: "c2" }, { label: "Vendor mistake — billed twice", value: 3, color: "c4" }], label: "Exceptions by type" });
      slot(el, "t").innerHTML = html.table([{ k: "trip", l: "Trip", cls: "mono" }, { k: "r", l: "Route", fmt: route }, { k: "v", l: "Vehicle", cls: "mono" },
        { k: "ours", l: "Trip bill", cls: "r", fmt: (v) => (v == null ? "—" : inr(v)) }, { k: "theirs", l: "Vendor bill", cls: "r", fmt: (v) => (v == null ? "—" : inr(v)) },
        { k: "ours", l: "Difference", cls: "r", fmt: (v, r) => (v == null || r.theirs == null ? "—" : r.theirs === v ? "0" : (r.theirs > v ? "+" : "−") + inr(Math.abs(r.theirs - v))) },
        { k: "f", l: "Finding", html: (v) => html.pill(v, kind(v)) }], RECON, { rowClass: (r) => (kind(r.f) === "crit" ? "hl" : "") });
    },
  };

  /* ---- Maintenance cost dashboard ---- */
  const HIGH_MAINT = [["VH-D-091", 142000], ["VH-D-066", 121000], ["VH-D-012", 108000], ["VH-D-083", 98000], ["VH-D-038", 94000], ["VH-D-097", 89000], ["VH-D-025", 86000], ["VH-D-049", 84000]];
  const REVIEW = [
    { v: "VH-D-091", type: "10-wheel", cost: 142000, x: 3.0, jobs: 21, top: "Tyres" },
    { v: "VH-D-066", type: "12-wheel", cost: 121000, x: 2.6, jobs: 17, top: "Spare parts" },
    { v: "VH-D-012", type: "10-wheel", cost: 108000, x: 2.3, jobs: 19, top: "Workshop labour" },
    { v: "VH-D-083", type: "12-wheel", cost: 98000, x: 2.1, jobs: 14, top: "Tyres" },
  ];
  VIS["rr-maintenance"] = {
    title: "Maintenance cost dashboard",
    sub: "Maintenance cost by category and month, and the high-maintenance vehicles. Apr–Sep 2026.",
    caption: "A few vehicles carry a large share of maintenance cost. Ranking them against the fleet average is where the search for cost-saving opportunities starts.",
    render(el, o) {
      el.innerHTML = dashShell("Maintenance & cost · Apr–Sep 2026", ["All vehicles", "All categories"], html.kpis([
        { l: "Maintenance cost (6 months)", v: "₹48.6 L" }, { l: "Jobs recorded", v: "1,184" }, { l: "Average per vehicle", v: "₹46.7k" }, { l: "High-maintenance vehicles", v: "9", s: "> 1.8× fleet average", cls: "up-bad" }]) +
        `<div class="dash-grid">${panel("Cost by category", "c")}${panel("Cost by month", "m")}
          <div class="panel span2"><div class="panel-title">Highest maintenance cost — 8 vehicles (6 months)</div><div data-slot="h"></div></div>
          <div class="panel span2"><div class="panel-title">Review list</div><div data-slot="r"></div></div></div>`);
      barH(slot(el, "c"), { thumb: o.thumb, fmt: fmt.inr, color: "c3", data: [{ label: "Tyres", value: 1420000 }, { label: "Spare parts", value: 1280000 }, { label: "Workshop labour", value: 810000 }, { label: "Routine service", value: 740000 }, { label: "Body & electrical", value: 430000 }, { label: "Other", value: 180000 }], label: "Cost by category" });
      bars(slot(el, "m"), { thumb: o.thumb, cats: M6, series: [{ name: "Cost", values: [760000, 840000, 890000, 810000, 790000, 770000], color: "c3" }], fmt: fmt.inr, yFmt: fmt.inr, topLabels: true, h: 200, label: "Cost by month" });
      barH(slot(el, "h"), { thumb: o.thumb, fmt: fmt.inr, data: HIGH_MAINT.map(([v, c]) => ({ label: v, value: c, color: c > 100000 ? "c4" : "c2" })), ref: { value: 46700, label: "Fleet average ₹46.7k" }, label: "High-maintenance vehicles" });
      slot(el, "r").innerHTML = html.table([{ k: "v", l: "Vehicle", cls: "mono" }, { k: "type", l: "Type" }, { k: "cost", l: "Cost (6 mo)", cls: "r", fmt: inr },
        { k: "x", l: "× fleet avg", cls: "r", fmt: (v) => v.toFixed(1) + "×" }, { k: "jobs", l: "Jobs", cls: "r" }, { k: "top", l: "Largest category" }], REVIEW);
    },
  };

  /* ---- Store stock ---- */
  const STOCK = [
    { c: "ST-D-101", i: "Tyre — 10-wheel (demo size)", cat: "Tyre", u: "nos", q: 18, ro: 12, last: "VH-D-091 · 06 Oct" },
    { c: "ST-D-102", i: "Tyre — 12-wheel (demo size)", cat: "Tyre", u: "nos", q: 9, ro: 12, last: "VH-D-066 · 08 Oct" },
    { c: "ST-D-215", i: "Brake lining set", cat: "Spare part", u: "set", q: 14, ro: 10, last: "VH-D-012 · 05 Oct" },
    { c: "ST-D-231", i: "Clutch plate", cat: "Spare part", u: "nos", q: 3, ro: 4, last: "VH-D-083 · 29 Sep" },
    { c: "ST-D-240", i: "Air filter", cat: "Spare part", u: "nos", q: 26, ro: 15, last: "VH-D-044 · 07 Oct" },
    { c: "ST-D-305", i: "Engine oil", cat: "Maintenance material", u: "litre", q: 420, ro: 200, last: "VH-D-073 · 08 Oct" },
    { c: "ST-D-311", i: "Grease", cat: "Maintenance material", u: "kg", q: 12, ro: 20, last: "VH-D-027 · 04 Oct" },
  ];
  VIS["rr-store"] = {
    title: "Store — tyres, spare parts and maintenance material",
    sub: "Stock register with reorder levels, and an issue to a vehicle.",
    caption: "Store items are issued against a vehicle, so tyres and parts show up in that vehicle’s maintenance cost. Items and quantities are demo values.",
    render(el) {
      el.innerHTML = app("Store", `${head("Store — stock register", [btn("Receive stock"), btn("Issue to vehicle", true)])}
        ${html.table([{ k: "c", l: "Item code", cls: "mono" }, { k: "i", l: "Item" }, { k: "cat", l: "Category" }, { k: "u", l: "Unit" },
          { k: "q", l: "In stock", cls: "r", fmt: fmt.int }, { k: "ro", l: "Reorder level", cls: "r", fmt: fmt.int }, { k: "last", l: "Last issued" },
          { k: "q", l: "Status", html: (v, r) => (v < r.ro ? html.pill("Reorder", "warn") : html.pill("OK", "good")) }], STOCK, { rowClass: (r) => (r.q < r.ro ? "hl" : "") })}
        ${sub("Issue to vehicle")}
        <div class="app-form">${field("Item", "ST-D-101 · Tyre — 10-wheel")}${field("Vehicle", "VH-D-038")}${field("Quantity", "2")}
          ${field("Maintenance job", "MJ-D-5520")}${field("Issued on", "09 Oct 2026")}${field("Issued by", "store.demo")}</div>
        <p class="app-note">Representative / Demo Workflow — the issue is posted to the vehicle’s maintenance record and stock reduces by the quantity issued.</p>`);
    },
  };

  /* ================================================================
     07 · FREIGHT AUDIT & LOGISTICS PERFORMANCE ANALYTICS  (la-*)
     ================================================================ */
  const r7 = rng(707);
  const CPK10 = MONTHS.map((_, i) => +(33.0 + i * 0.22 + Math.sin(i / 2) * 0.35 + r7() * 0.3).toFixed(1));
  const CPK12 = MONTHS.map((_, i) => +(37.1 + i * 0.23 + Math.cos(i / 2.2) * 0.4 + r7() * 0.3).toFixed(1));
  const VENDORS = [
    { v: "Vendor A (demo)", trips: 96, ot: 0.942, acc: 0.989, exc: 1, cpk: 36.8 },
    { v: "Vendor B (demo)", trips: 84, ot: 0.918, acc: 0.976, exc: 2, cpk: 37.4 },
    { v: "Vendor C (demo)", trips: 71, ot: 0.885, acc: 0.952, exc: 4, cpk: 38.1 },
    { v: "Vendor D (demo)", trips: 66, ot: 0.861, acc: 0.968, exc: 3, cpk: 37.9 },
    { v: "Vendor E (demo)", trips: 58, ot: 0.827, acc: 0.914, exc: 6, cpk: 39.6 },
    { v: "Vendor F (demo)", trips: 49, ot: 0.789, acc: 0.897, exc: 7, cpk: 40.2 },
  ];
  const ROUTE_CPK = [40.1, 35.2, 37.4, 36.5, 41.8];
  const AUDIT_TYPES = [{ label: "Above agreed rate", value: 14, color: "c4" }, { label: "Extra charge not approved", value: 9, color: "c2" }, { label: "Trip billed more than once", value: 7, color: "c4" }, { label: "No delivered trip", value: 5, color: "c4" }];
  const AGEING = [{ label: "0–30 days", value: 142, color: "c1" }, { label: "31–60", value: 64, color: "c3" }, { label: "61–90", value: 28, color: "c2" }, { label: "90+", value: 19, color: "c4" }];

  VIS["la-route"] = {
    title: "Route performance — cost and on-time delivery",
    sub: "Cost per km, on-time % and audit exceptions by route. Sep 2026.",
    caption: "Short routes cost more per km because loading and waiting time is spread over fewer kilometres; Hub → Chennai is cheaper per km but the least punctual.",
    render(el, o) {
      const rows = ROUTES.map((r, i) => ({ route: route(r.d), trips: r.trips, cpk: ROUTE_CPK[i], ot: 1 - r.delayed / r.trips, exc: [6, 9, 8, 7, 5][i] }));
      el.innerHTML = `<div style="display:grid;gap:12px"><div data-slot="c"></div><div data-slot="t"></div></div>`;
      barH(slot(el, "c"), { thumb: o.thumb, fmt: (v) => "₹" + v.toFixed(1), max: 50, data: rows.map((r) => ({ label: r.route, value: r.cpk, color: r.cpk > 39 ? "c2" : "c3" })), ref: { value: 37.6, label: "Fleet average ₹37.6 per km" }, label: "Cost per km by route" });
      slot(el, "t").innerHTML = html.table([{ k: "route", l: "Route" }, { k: "trips", l: "Trips", cls: "r" }, { k: "cpk", l: "Cost per km", cls: "r", fmt: (v) => "₹" + v.toFixed(1) },
        { k: "ot", l: "On time", cls: "r", html: (v) => `<span class="bar-cell" style="width:${Math.round(v * 60)}px;background:${v < 0.8 ? "var(--c4)" : "var(--c1)"}"></span>${esc(fmt.pct(v))}` },
        { k: "exc", l: "Audit exceptions", cls: "r" }], rows);
    },
  };
  VIS["la-cost"] = {
    title: "Cost per km trend by vehicle type",
    sub: "₹ per km, 10-wheel and 12-wheel, last 12 months.",
    caption: "Cost per km rises slowly through the year for both vehicle types; separating fuel-linked increases from rate changes shows how much is controllable.",
    render(el, o) {
      line(el, { thumb: o.thumb, x: MONTHS, series: [{ name: "12-wheel", values: CPK12, color: "c3" }, { name: "10-wheel", values: CPK10, color: "c2" }], yMin: 30, yMax: 42, yFmt: (v) => "₹" + v, endLabels: true, markers: false, label: "Cost per km" });
    },
  };
  VIS["la-vehicle"] = {
    title: "Vehicle performance — utilisation",
    sub: "Loaded km as % of total km, ten vehicles, Sep 2026.",
    caption: "Empty return legs pull utilisation down on three vehicles; those routes are candidates for return loads.",
    render(el, o) {
      const v = [["VH-D-073", 0.86], ["VH-D-044", 0.83], ["VH-D-027", 0.81], ["VH-D-018", 0.79], ["VH-D-055", 0.76], ["VH-D-062", 0.72], ["VH-D-038", 0.66], ["VH-D-083", 0.59], ["VH-D-066", 0.57], ["VH-D-091", 0.52]];
      barH(el, { thumb: o.thumb, fmt: fmt.pct0, max: 1, data: v.map(([id, u]) => ({ label: id, value: u, color: u < 0.6 ? "c4" : u < 0.7 ? "c2" : "c3" })), ref: { value: 0.74, label: "Fleet average 74%" }, label: "Vehicle utilisation" });
    },
  };
  VIS["la-vendor"] = {
    title: "Carrier / vendor scorecard",
    sub: "On-time delivery, billing accuracy, exceptions and cost per km by vendor. Jul–Sep 2026.",
    caption: "On-time delivery and billing accuracy are read together: a punctual vendor that bills inaccurately still costs time and money.",
    render(el, o) {
      const rating = (r) => (r.ot >= 0.9 && r.acc >= 0.97 ? ["Preferred", "good"] : r.ot < 0.85 || r.acc < 0.93 ? ["Review", "crit"] : ["Watch", "warn"]);
      const cell = (v, lo) => `<span class="bar-cell" style="width:${Math.round((v - 0.7) * 200)}px;background:${v < lo ? "var(--c4)" : "var(--c1)"}"></span>${esc(fmt.pct(v))}`;
      el.innerHTML = `<div style="display:grid;gap:12px"><div><p class="label" style="margin-bottom:.3rem">On-time delivery by vendor</p><div data-slot="b"></div></div><div data-slot="t"></div></div>`;
      barH(slot(el, "b"), { thumb: o.thumb, fmt: fmt.pct, max: 1, data: VENDORS.map((r) => ({ label: r.v, value: r.ot, color: r.ot < 0.85 ? "c4" : "c1" })), ref: { value: 0.9, label: "90% target" }, label: "On-time by vendor" });
      slot(el, "t").innerHTML = html.table([{ k: "v", l: "Vendor" }, { k: "trips", l: "Trips", cls: "r" }, { k: "ot", l: "On time", html: (v) => cell(v, 0.85) },
        { k: "acc", l: "Billing accuracy", html: (v) => cell(v, 0.93) }, { k: "exc", l: "Exceptions", cls: "r" }, { k: "cpk", l: "Cost / km", cls: "r", fmt: (v) => "₹" + v.toFixed(1) },
        { k: "v", l: "Rating", html: (v, r) => html.pill(...rating(r)) }], VENDORS);
    },
  };
  VIS["la-delivery"] = {
    title: "Delivery performance — on time vs late",
    sub: "Share of deliveries on time, up to 6 hours late and more than 6 hours late. Apr–Sep 2026.",
    caption: "On-time delivery improves slowly; the long-delay share is small but concentrated on the longest routes.",
    render(el, o) {
      const ot = [0.841, 0.85, 0.832, 0.859, 0.862, ON_TIME], s6 = [0.102, 0.098, 0.11, 0.094, 0.095, 0.091];
      bars(el, { thumb: o.thumb, cats: M6, stacked: true, series: [{ name: "On time", values: ot, color: "c1" }, { name: "Late ≤ 6 h", values: s6, color: "c2" }, { name: "Late > 6 h", values: ot.map((v, i) => +(1 - v - s6[i]).toFixed(3)), color: "c4" }], fmt: fmt.pct, yFmt: fmt.pct0, max: 1, label: "Delivery performance" });
    },
  };
  const AUDIT = [
    { inv: "INV-D-58210", ven: "Vendor D", r: "Ambala", trip: "TRP-D-24431", billed: 46800, agreed: 41500, f: "Above agreed rate" },
    { inv: "INV-D-58214", ven: "Vendor F", r: "Ahmedabad", trip: "TRP-D-24436", billed: 31900, agreed: 31900, f: "Trip billed more than once" },
    { inv: "INV-D-58233", ven: "Vendor B", r: "Bhiwandi", trip: "TRP-D-24417", billed: 56400, agreed: 52800, f: "Extra charge not approved" },
    { inv: "INV-D-58240", ven: "Vendor A", r: "Chennai", trip: "TRP-D-24410", billed: 86400, agreed: 86400, f: "Passed" },
    { inv: "INV-D-58251", ven: "Vendor E", r: "Hyderabad", trip: "TRP-D-24399", billed: 71200, agreed: null, f: "No delivered trip" },
    { inv: "INV-D-58262", ven: "Vendor C", r: "Ahmedabad", trip: "TRP-D-24442", billed: 31900, agreed: 31900, f: "Passed" },
  ];
  VIS["la-audit"] = {
    title: "Freight invoice audit",
    sub: "Billed vs agreed amount and the audit finding for each invoice line. Sep 2026.",
    caption: "Each invoice is checked against the agreed rate for its vendor, route and vehicle type, and against the trip record, before it is approved for payment.",
    render(el) {
      const kind = (f) => (f === "Passed" ? "good" : f.startsWith("Extra") ? "warn" : "crit");
      el.innerHTML = html.kpis([{ l: "Invoice lines audited", v: "512" }, { l: "Passed", v: "477" }, { l: "Exceptions", v: "35", s: "6.8% of lines", cls: "up-bad" }, { l: "Value under review", v: "₹3.1 L" }]) +
        `<div style="margin-top:12px">${html.table([{ k: "inv", l: "Invoice", cls: "mono" }, { k: "ven", l: "Vendor" }, { k: "r", l: "Route", fmt: route }, { k: "trip", l: "Trip", cls: "mono" },
          { k: "billed", l: "Billed", cls: "r", fmt: inr }, { k: "agreed", l: "Agreed", cls: "r", fmt: (v) => (v == null ? "—" : inr(v)) },
          { k: "billed", l: "Variance", cls: "r", fmt: (v, r) => (r.f.startsWith("Trip billed") ? inr(v) : r.agreed == null ? inr(v) : v - r.agreed ? "+" + inr(v - r.agreed) : "–") },
          { k: "f", l: "Finding", html: (v) => html.pill(v, kind(v)) }], AUDIT, { rowClass: (r) => (kind(r.f) === "crit" ? "hl" : "") })}</div>`;
    },
  };
  VIS["la-inventory"] = {
    title: "Inventory ageing",
    sub: "Stock value by days since receipt, and the oldest stock lines. Sep 2026.",
    caption: "Stock older than 90 days is a small share of value but ties up working capital; the oldest lines are reviewed every month.",
    render(el, o) {
      el.innerHTML = `<div style="display:grid;gap:14px"><div data-slot="c"></div><div><p class="label" style="margin-bottom:.3rem">Oldest stock lines</p><div data-slot="t"></div></div></div>`;
      comp(slot(el, "c"), { thumb: o.thumb, fmt: (v) => "₹" + v + " L", parts: AGEING, label: "Inventory ageing" });
      slot(el, "t").innerHTML = html.table([{ k: "i", l: "Item", cls: "mono" }, { k: "loc", l: "Location" }, { k: "val", l: "Value", cls: "r", fmt: inr }, { k: "d", l: "Days held", cls: "r" }, { k: "d", l: "Band", html: (v) => html.pill(v > 90 ? "90+" : "61–90", v > 90 ? "crit" : "warn") }],
        [{ i: "ITEM-D-118", loc: "Store 1", val: 240000, d: 146 }, { i: "ITEM-D-204", loc: "Store 2", val: 185000, d: 121 }, { i: "ITEM-D-077", loc: "Store 1", val: 162000, d: 104 }, { i: "ITEM-D-311", loc: "Store 1", val: 98000, d: 83 }]);
    },
  };
  VIS["la-dashboard"] = {
    title: "Logistics KPI dashboard (Zoho Analytics, re-created)",
    sub: "Audit exceptions, on-time delivery by route, cost per km and inventory ageing on one page.",
    caption: "The page used in operations reviews. The tables behind it are prepared by SQL and Python; the dashboard only presents them.",
    render(el, o) {
      el.innerHTML = dashShell("Logistics KPIs · Sep 2026", ["All routes", "All vendors"], html.kpis([
        { l: "Invoice lines audited", v: "512" }, { l: "Audit exceptions", v: "6.8%", s: "35 lines" }, { l: "On-time delivery", v: fmt.pct(ON_TIME) },
        { l: "Cost per km (fleet)", v: "₹37.6" }, { l: "Stock over 90 days", v: "₹19 L" }]) +
        `<div class="dash-grid">${panel("On-time delivery by route", "r")}${panel("Cost per km by vehicle type", "k")}${panel("Audit exceptions by type", "x")}${panel("Inventory ageing (₹ lakh)", "i")}</div>`);
      barH(slot(el, "r"), { thumb: o.thumb, fmt: fmt.pct, max: 1, data: ROUTES.map((r) => ({ label: route(r.d), value: 1 - r.delayed / r.trips, color: 1 - r.delayed / r.trips < 0.8 ? "c4" : "c1" })), label: "On-time by route" });
      VIS["la-cost"].render(slot(el, "k"), o);
      barH(slot(el, "x"), { thumb: o.thumb, fmt: (v) => String(v), data: AUDIT_TYPES, label: "Audit exceptions" });
      comp(slot(el, "i"), { thumb: o.thumb, fmt: (v) => "₹" + v + " L", parts: AGEING, label: "Inventory ageing" });
    },
  };
})();
