/* =====================================================================
   DEV School ERP & AI Management System (freelance) — synthetic visuals.
   ALL DATA IS DEMO DATA: students, parents, teachers, branches, amounts
   and user names are fictional ("Student A. Demo", "Branch 1", …).
   Screens are demonstrations of the confirmed modules, not captures of
   the live product. AI features are PLANNED / ROADMAP (not built); the AI
   screen is a labelled roadmap concept.
   Demo totals (consistent across visuals):
     4 branches · 2,486 students (812 / 704 / 556 / 414) · 132 teachers
     attendance today 91.8% · fees billed ₹211.8 L, collected ₹170.6 L,
     outstanding ₹41.2 L (0–30 d 23.3 · 31–60 d 9.6 · 61–90 d 5.1 · 90+ d 3.2)
   ===================================================================== */
(function () {
  "use strict";
  const { barH, bars, line, html, fmt, esc } = window.Charts;
  const VIS = window.VIS;
  const slot = (el, id) => el.querySelector(`[data-slot="${id}"]`);
  const panel = (title, slotId, extra = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div><div data-slot="${slotId}"></div></div>`;
  const panelHTML = (title, body, extra = "") => `<div class="panel ${extra}"><div class="panel-title">${esc(title)}</div>${body}</div>`;

  const NAV = ["Dashboard", "Students", "Parents", "Teachers", "Attendance", "Fees", "Academics", "Branches", "Users", "Reports", "AI (planned)"];
  const shell = (active, body, branch = "All branches") =>
    `<div class="app"><div class="app-top"><b>DEV School ERP</b><span>${esc(branch)} ▾</span><span class="sp">admin.demo</span></div>
      <div class="app-main"><div class="app-side">${NAV.map((n) => `<span class="${n === active ? "on" : ""}">${esc(n)}</span>`).join("")}</div>
      <div class="app-content">${body}</div></div></div>`;
  const head = (title, right = "") => `<div class="app-h"><strong>${esc(title)}</strong><span style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">${right}</span></div>`;
  const btn = (t, ghost) => `<span class="app-btn${ghost ? " ghost" : ""}">${esc(t)}</span>`;
  const field = (l, v) => `<div class="app-in">${esc(l)}<span>${esc(v)}</span></div>`;
  const chip = (t) => `<span style="border:1px solid var(--rule-strong);border-radius:var(--r-sm);padding:.25rem .55rem;font-size:.72rem;color:var(--ink-2);background:var(--paper)">${esc(t)}</span>`;
  const inrL = (v) => "₹" + v.toFixed(1) + " L";
  const rupee = (v) => "₹" + fmt.int(v);
  const demoTag = html.pill("Representative / Demo Workflow", "info");

  /* ---------------- shared demo data ---------------- */
  const BR = ["Branch 1", "Branch 2", "Branch 3", "Branch 4"];
  const STUDENTS = [812, 704, 556, 414];
  const TEACHERS = [46, 38, 28, 20];
  const ATT = [0.941, 0.928, 0.902, 0.876];
  const FEE_COLLECTED = [61.4, 49.8, 36.9, 22.5];
  const FEE_DUES = [10.6, 10.7, 9.3, 10.6];

  /* ================================================================
     1 · Admin dashboard
     ================================================================ */
  VIS["ds-dashboard"] = {
    title: "Admin dashboard",
    sub: "All branches at a glance: students, teachers, today’s attendance and fee collection against dues.",
    caption: "The administrator’s landing page. Attendance and fees are the two daily checks, shown per branch so it is clear where to follow up.",
    render(el, o) {
      el.innerHTML = shell("Dashboard", `${head("Admin dashboard", chip("Session 2026–27") + chip("Wed, 08 Oct 2026"))}
        ${html.kpis([
          { l: "Students", v: fmt.int(2486), s: "4 branches · 132 teachers" },
          { l: "Attendance today", v: "91.8%", s: "2,282 of 2,486 present" }, { l: "Fees collected (term)", v: "₹1.71 Cr", s: "80.5% of billed" }, { l: "Outstanding dues", v: "₹41.2 L", s: "₹17.9 L over 30 days", cls: "up-bad" }])}
        <div class="dash-grid">${panel("Attendance today by branch (below 90% highlighted)", "a")}${panel("Fees by branch: collected vs outstanding (₹ lakh)", "f")}
          <div class="panel span2"><div class="panel-title">Weekly attendance — all branches</div><div data-slot="t"></div></div></div>`);
      barH(slot(el, "a"), { thumb: o.thumb, fmt: fmt.pct, max: 1, rowH: 44, axis: true, label: "Attendance by branch",
        data: BR.map((b, i) => ({ label: b, value: ATT[i], color: ATT[i] < 0.9 ? "c4" : "c1", tip: `${fmt.pct(ATT[i])} of ${fmt.int(STUDENTS[i])} students` })) });
      bars(slot(el, "f"), { thumb: o.thumb, cats: BR, stacked: true, h: 210, fmt: inrL, yFmt: (v) => "₹" + v + " L", topLabels: true, label: "Fees by branch",
        series: [{ name: "Collected", values: FEE_COLLECTED, color: "c1" }, { name: "Outstanding", values: FEE_DUES, color: "c4" }] });
      line(slot(el, "t"), { thumb: o.thumb, h: 190, x: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"], yMin: 0.85, yMax: 0.95, yFmt: fmt.pct0, markers: true, label: "Weekly attendance",
        series: [{ name: "Attendance", values: [0.931, 0.926, 0.929, 0.914, 0.908, 0.922, 0.915, 0.918], color: "c3", area: true }] });
    },
  };

  /* ================================================================
     2 · Student profile
     ================================================================ */
  VIS["ds-student"] = {
    title: "Student profile",
    sub: "One record per student with the linked parent, attendance, fees and academic progress.",
    caption: "Everything about a student in one place. The same record feeds attendance, fees, academics and the parent portal, so there is no second copy to keep in sync.",
    render(el) {
      const tabs = ["Profile", "Attendance", "Fees", "Academics"].map((t, i) => `<span style="padding:.35rem .7rem;border-bottom:2px solid ${i === 0 ? "var(--accent)" : "transparent"};color:${i === 0 ? "var(--ink)" : "var(--ink-3)"};font-weight:${i === 0 ? 600 : 400}">${t}</span>`).join("");
      el.innerHTML = shell("Students", `${head("Student A. Demo · STU-D-10421", html.pill("Active", "good") + btn("Edit", true))}
        <div style="display:flex;gap:.2rem;border-bottom:1px solid var(--rule);flex-wrap:wrap">${tabs}</div>
        <div class="app-form">${field("Branch", "Branch 1")}${field("Class / section", "6 – A")}${field("Roll no.", "12")}
          ${field("Admission no.", "ADM-D-2022-0418")}${field("Date of birth", "19-08-2014 (demo)")}${field("Admitted on", "11-04-2022")}
          ${field("Parent", "Parent A. Demo · linked")}${field("Parent mobile", "98XXXX4410")}${field("Portal access", "Active")}</div>
        ${html.kpis([{ l: "Attendance this term", v: "93.5%", s: "58 of 62 days" }, { l: "Term 2 fee", v: rupee(42000) }, { l: "Paid", v: rupee(33600) }, { l: "Due by 15 Oct", v: rupee(8400), cls: "up-bad", s: "1 instalment" }, { l: "Term 1 average", v: "78%" }])}
        ${panelHTML("Term 1 assessments", html.table([{ k: "s", l: "Subject" }, { k: "m", l: "Marks", cls: "r" }, { k: "c", l: "Class average", cls: "r" }, { k: "t", l: "Teacher" }], [
          { s: "Mathematics", m: "74 / 100", c: "72", t: "Teacher A. Demo" }, { s: "Science", m: "81 / 100", c: "76", t: "Teacher C. Demo" },
          { s: "English", m: "79 / 100", c: "81", t: "Teacher B. Demo" }, { s: "Social Science", m: "77 / 100", c: "74", t: "Teacher E. Demo" }]))}`, "Branch 1");
    },
  };

  /* ================================================================
     3 · Attendance marking
     ================================================================ */
  const toggle = (on) => `<span style="display:inline-flex;border:1px solid var(--rule-strong);border-radius:var(--r-sm);overflow:hidden;font-size:.7rem">${[["P", "good"], ["A", "crit"], ["L", "warn"]].map(([k, c]) =>
    `<span style="padding:.18rem .5rem;${k === on ? `background:var(--${c}-soft);color:${c === "warn" ? "var(--ink)" : `var(--${c})`};font-weight:700` : "color:var(--ink-3)"}">${k}</span>`).join("")}</span>`;
  const MARKS = [
    { r: 1, n: "Student C. Demo", s: "P", note: "" }, { r: 2, n: "Student D. Demo", s: "P", note: "" }, { r: 3, n: "Student E. Demo", s: "A", note: "No message received" },
    { r: 4, n: "Student F. Demo", s: "P", note: "" }, { r: 5, n: "Student G. Demo", s: "L", note: "Leave applied by parent" }, { r: 6, n: "Student H. Demo", s: "P", note: "" },
    { r: 7, n: "Student J. Demo", s: "A", note: "" }, { r: 8, n: "Student B. Demo", s: "P", note: "" }, { r: 12, n: "Student A. Demo", s: "P", note: "" }];
  VIS["ds-attendance"] = {
    title: "Attendance marking",
    sub: "Class-wise daily attendance: Present, Absent or Leave for each student, then save.",
    caption: "Teachers mark a class in one screen. Saved marks roll up straight into the branch and admin dashboards and into each parent’s view.",
    render(el) {
      el.innerHTML = shell("Attendance", `${head("Mark attendance", btn("Mark all present", true) + btn("Save attendance"))}
        <div class="app-form">${field("Branch", "Branch 1")}${field("Class / section", "6 – A")}${field("Date", "08-10-2026")}</div>
        ${html.table([{ k: "r", l: "Roll", cls: "r" }, { k: "n", l: "Student" }, { k: "s", l: "Present / Absent / Leave", html: (v) => toggle(v) }, { k: "note", l: "Remark", fmt: (v) => v || "—" }], MARKS,
          { rowClass: (r) => (r.s === "A" ? "hl" : "") })}
        <div class="app-h"><span class="app-note">Showing 9 of 37 students · Teacher A. Demo (class teacher)</span>
          <span style="display:flex;gap:.4rem;flex-wrap:wrap">${html.pill("Present 34", "good")}${html.pill("Absent 2", "crit")}${html.pill("Leave 1", "warn")}</span></div>`, "Branch 1");
    },
  };

  /* ================================================================
     4 · Fee collection & dues
     ================================================================ */
  const DUES = [
    { n: "Student A. Demo", c: "6 – A", fee: 42000, paid: 33600, due: "15-10-2026", st: "Part-paid" },
    { n: "Student L. Demo", c: "8 – B", fee: 46000, paid: 0, due: "15-08-2026", st: "Overdue" },
    { n: "Student M. Demo", c: "4 – A", fee: 38000, paid: 38000, due: "15-10-2026", st: "Paid" },
    { n: "Student N. Demo", c: "10 – A", fee: 52000, paid: 26000, due: "15-07-2026", st: "Overdue" },
    { n: "Student P. Demo", c: "6 – B", fee: 42000, paid: 21000, due: "15-10-2026", st: "Part-paid" }];
  VIS["ds-fees"] = {
    title: "Fee collection & dues",
    sub: "Collections, outstanding dues by age, a fee receipt entry and the branch dues list.",
    caption: "Dues are always billed minus received, per student. The ageing view shows how much is overdue, and the dues list is the follow-up list for the fee desk.",
    render(el, o) {
      el.innerHTML = shell("Fees", `${head("Fees — collection & dues", chip("Term 2") + btn("New receipt"))}
        ${html.kpis([{ l: "Collected today", v: "₹1.86 L", s: "41 receipts" }, { l: "Collected this month", v: "₹14.2 L" }, { l: "Outstanding dues", v: "₹41.2 L", s: "all branches" }, { l: "Overdue over 30 days", v: "₹17.9 L", cls: "up-bad" }])}
        <div class="dash-grid">${panel("Outstanding dues by age (₹ lakh)", "a")}
          ${panelHTML("Fee receipt · RCPT-D-55120", `<div class="app-form" style="grid-template-columns:repeat(2,minmax(0,1fr))">${field("Student", "Student A. Demo · 6 – A")}${field("Fee head", "Term 2 tuition")}${field("Amount due", "₹8,400")}${field("Amount received", "₹8,400")}</div>
            <div class="app-h" style="margin-top:.6rem"><span class="app-note">Balance after receipt: ₹0</span>${btn("Save receipt")}</div>`)}
          <div class="panel span2"><div class="panel-title">Dues list — Branch 1</div><div data-slot="t"></div></div></div>`, "Branch 1");
      barH(slot(el, "a"), { thumb: o.thumb, fmt: inrL, label: "Dues by age", data: [
        { label: "0–30 days", value: 23.3, color: "c3" }, { label: "31–60 days", value: 9.6, color: "c2" }, { label: "61–90 days", value: 5.1, color: "c4" }, { label: "90+ days", value: 3.2, color: "c4" }] });
      slot(el, "t").innerHTML = html.table([{ k: "n", l: "Student" }, { k: "c", l: "Class" }, { k: "fee", l: "Term fee", cls: "r", fmt: rupee }, { k: "paid", l: "Paid", cls: "r", fmt: rupee },
        { k: "bal", l: "Due", cls: "r", fmt: (v, r) => rupee(r.fee - r.paid) }, { k: "due", l: "Due date", cls: "mono" },
        { k: "st", l: "Status", html: (v) => html.pill(v, v === "Paid" ? "good" : v === "Overdue" ? "crit" : "warn") }], DUES);
    },
  };

  /* ================================================================
     5 · Parent portal
     ================================================================ */
  VIS["ds-parent"] = {
    title: "Parent portal",
    sub: "What a parent sees for their own children: attendance, fees and academic progress.",
    caption: "Parents see the same records the school uses, limited to their linked children. A parent with two children switches between them at the top.",
    render(el) {
      const days = [["Thu 01", "P"], ["Fri 02", "P"], ["Sat 03", "P"], ["Mon 05", "P"], ["Tue 06", "P"], ["Wed 07", "P"], ["Thu 08", "P"]];
      el.innerHTML = `<div class="app"><div class="app-top"><b>DEV School · Parent Portal</b><span class="sp">Parent A. Demo · Logout</span></div>
        <div class="app-content">
          <div class="app-h"><span style="display:flex;gap:.4rem;flex-wrap:wrap"><span class="app-btn">Student A. Demo · 6 – A</span><span class="app-btn ghost">Student K. Demo · 3 – B</span></span><span class="app-note">Branch 1 · Session 2026–27</span></div>
          <div class="dash-grid g3">
            ${panelHTML("Attendance", `<div class="kpi" style="border:0;padding:0"><span class="kpi-v">93.5%</span><span class="kpi-s">this term · 58 of 62 days</span></div>
              <p class="app-note" style="margin:.6rem 0 .3rem">October so far</p><div style="display:flex;gap:.3rem;flex-wrap:wrap">${days.map(([d, s]) => `<span style="display:grid;gap:.15rem;justify-items:center;font-size:.66rem;color:var(--ink-3)">${d}${html.pill(s, s === "P" ? "good" : "crit")}</span>`).join("")}</div>`)}
            ${panelHTML("Fees", `<div class="kpi" style="border:0;padding:0"><span class="kpi-v">${rupee(8400)}</span><span class="kpi-s">due by 15 Oct 2026 · Term 2</span></div>
              ${html.table([{ k: "r", l: "Receipt", cls: "mono" }, { k: "d", l: "Date" }, { k: "a", l: "Amount", cls: "r" }], [{ r: "RCPT-D-53140", d: "15-09-2026", a: "₹16,800" }, { r: "RCPT-D-51877", d: "14-08-2026", a: "₹16,800" }])}`)}
            ${panelHTML("Academics", html.table([{ k: "s", l: "Term 1" }, { k: "m", l: "Marks", cls: "r" }, { k: "c", l: "Class avg", cls: "r" }], [
              { s: "Mathematics", m: "74", c: "72" }, { s: "Science", m: "81", c: "76" }, { s: "English", m: "79", c: "81" }, { s: "Social Science", m: "77", c: "74" }]))}
          </div>
        </div></div>`;
    },
  };

  /* ================================================================
     6 · Teachers, timetable & academics
     ================================================================ */
  const TT = [
    { p: "1 · 08:00", mo: "Maths", tu: "Maths", we: "Science", th: "Maths", fr: "English", sa: "Maths" },
    { p: "2 · 08:45", mo: "English", tu: "Science", we: "Maths", th: "English", fr: "Science", sa: "Computer" },
    { p: "3 · 09:30", mo: "Science", tu: "Hindi", we: "English", th: "Social Sc.", fr: "Maths", sa: "Science" },
    { p: "4 · 10:30", mo: "Social Sc.", tu: "English", we: "Hindi", th: "Science", fr: "Social Sc.", sa: "Sports" },
    { p: "5 · 11:15", mo: "Hindi", tu: "Social Sc.", we: "Computer", th: "Hindi", fr: "Hindi", sa: "English" },
    { p: "6 · 12:00", mo: "Computer", tu: "Sports", we: "Social Sc.", th: "Computer", fr: "Library", sa: "—" }];
  VIS["ds-academics"] = {
    title: "Teachers, timetable & academics",
    sub: "Class timetable, subject teachers and term results for one class.",
    caption: "Teacher allocation, the weekly timetable and assessment results sit together, so a class can be reviewed in one place.",
    render(el, o) {
      el.innerHTML = shell("Academics", `${head("Academics — Class 6 – A", chip("Branch 1") + chip("Session 2026–27") + btn("Enter marks"))}
        <div class="dash-grid"><div class="panel span2"><div class="panel-title">Weekly timetable</div>${html.table([{ k: "p", l: "Period", cls: "mono" }, { k: "mo", l: "Mon" }, { k: "tu", l: "Tue" }, { k: "we", l: "Wed" }, { k: "th", l: "Thu" }, { k: "fr", l: "Fri" }, { k: "sa", l: "Sat" }], TT)}</div>
          ${panelHTML("Subject teachers", html.table([{ k: "s", l: "Subject" }, { k: "t", l: "Teacher" }, { k: "n", l: "Periods / wk", cls: "r" }], [
            { s: "Mathematics", t: "Teacher A. Demo", n: 6 }, { s: "English", t: "Teacher B. Demo", n: 6 }, { s: "Science", t: "Teacher C. Demo", n: 6 },
            { s: "Hindi", t: "Teacher D. Demo", n: 5 }, { s: "Social Science", t: "Teacher E. Demo", n: 5 }, { s: "Computer", t: "Teacher F. Demo", n: 4 }]))}
          ${panel("Term 1 — class average by subject", "r")}</div>`, "Branch 1");
      barH(slot(el, "r"), { thumb: o.thumb, fmt: (v) => v + "%", max: 100, color: "c3", label: "Class average by subject", data: [
        { label: "Computer", value: 84 }, { label: "English", value: 81 }, { label: "Hindi", value: 79 }, { label: "Science", value: 76 }, { label: "Social Science", value: 74 }, { label: "Mathematics", value: 72 }] });
    },
  };

  /* ================================================================
     7 · Reports
     ================================================================ */
  const REPORTS = [
    { r: "Daily attendance register", m: "Attendance", f: "Branch · class · date" },
    { r: "Monthly attendance summary", m: "Attendance", f: "Branch · month" },
    { r: "Low-attendance list", m: "Attendance", f: "Branch · % threshold · period" },
    { r: "Fee collection register", m: "Fees", f: "Branch · date range" },
    { r: "Outstanding dues", m: "Fees", f: "Branch · class · as-of date" },
    { r: "Student strength", m: "Students", f: "Branch · class" },
    { r: "Class result summary", m: "Academics", f: "Class · term" },
    { r: "Teacher allocation", m: "Teachers", f: "Branch · session" },
    { r: "Branch summary", m: "Branches", f: "Session" }];
  VIS["ds-reports"] = {
    title: "Reports",
    sub: "Module-wise reports with filters, viewed on screen or exported.",
    caption: "Each report reads the same records the modules write, so attendance, fee and academic figures agree everywhere. Report names are generic examples.",
    render(el) {
      el.innerHTML = shell("Reports", `${head("Reports", chip("All branches") + chip("Session 2026–27"))}
        ${html.table([{ k: "r", l: "Report" }, { k: "m", l: "Module", html: (v) => html.pill(v, "neutral") }, { k: "f", l: "Filters" }, { k: "a", l: "Action", html: () => `<span style="display:inline-flex;gap:.3rem">${btn("View")}${btn("Export", true)}</span>` }], REPORTS)}`);
    },
  };

  /* ================================================================
     8 · AI insights — PLANNED / ROADMAP concept (not built)
     ================================================================ */
  const FLAGGED = [
    { n: "Student Q. Demo", c: "9 – B", b: "Branch 4", a: "61%", sig: "Attendance below 75% for 30 days" },
    { n: "Student R. Demo", c: "7 – A", b: "Branch 3", a: "68%", sig: "Attendance falling 4 weeks in a row" },
    { n: "Student S. Demo", c: "10 – A", b: "Branch 4", a: "72%", sig: "Attendance below 75% + fee overdue 60+ days" },
    { n: "Student T. Demo", c: "5 – C", b: "Branch 2", a: "74%", sig: "Attendance below 75% for 30 days" }];
  VIS["ds-ai"] = {
    title: "AI insights — planned feature (concept)",
    sub: "Planned / Roadmap — not built. Concept for the first AI feature over attendance, fee and academic data.",
    caption: "Roadmap concept only. The ten core modules are built; AI features are planned. This screen shows how the first planned feature, a reasoned follow-up list, would use data the school already records.",
    render(el, o) {
      el.innerHTML = shell("AI (planned)", `${head("AI insights — roadmap concept", html.pill("Planned / Roadmap — not built", "warn") + chip("Last 30 days"))}
        ${html.kpis([{ l: "Attendance watch", v: "23", s: "students below 75% in 30 days" }, { l: "Fee follow-up", v: "61", s: "accounts overdue 60+ days" }, { l: "Academic support", v: "3", s: "class–subject pairs below 60% average" }])}
        <div class="dash-grid">${panel("Students on attendance watch by branch", "b")}${panel("Attendance on watch list vs class (last 8 weeks)", "t")}
          <div class="panel span2"><div class="panel-title">Flagged students (sample)</div><div data-slot="l"></div></div></div>
        <p class="app-note">Planned / Roadmap concept · illustrative rules: attendance below 75% over 30 days, or a falling trend; combined with fee and academic signals for a single follow-up list.</p>`);
      bars(slot(el, "b"), { thumb: o.thumb, cats: BR, series: [{ name: "Students", values: [4, 5, 6, 8], color: "c4" }], fmt: fmt.int, topLabels: true, h: 200, label: "Flagged by branch" });
      line(slot(el, "t"), { thumb: o.thumb, h: 200, x: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"], yMin: 0.5, yMax: 1, yFmt: fmt.pct0, label: "Attendance trend",
        series: [{ name: "Class average", values: [0.93, 0.92, 0.93, 0.91, 0.91, 0.92, 0.91, 0.92], color: "c3" }, { name: "Watch list average", values: [0.84, 0.82, 0.79, 0.76, 0.73, 0.71, 0.7, 0.68], color: "c4" }] });
      slot(el, "l").innerHTML = html.table([{ k: "n", l: "Student" }, { k: "c", l: "Class" }, { k: "b", l: "Branch" }, { k: "a", l: "30-day attendance", cls: "r" }, { k: "sig", l: "Signal" }], FLAGGED);
    },
  };

  /* ================================================================
     9 · Branch & user management
     ================================================================ */
  VIS["ds-admin"] = {
    title: "Branch & user management",
    sub: "Branches with their strength, and application users with their role and access.",
    caption: "Branches and users are managed in the application itself. Each user’s access is limited to what their role needs — a parent account sees only linked children.",
    render(el) {
      el.innerHTML = shell("Branches", `${head("Branches & users", btn("Add branch", true) + btn("Add user"))}
        ${panelHTML("Branches", html.table([{ k: "code", l: "Code", cls: "mono" }, { k: "b", l: "Branch" }, { k: "s", l: "Students", cls: "r", fmt: fmt.int }, { k: "t", l: "Teachers", cls: "r" }, { k: "a", l: "Branch admin" }, { k: "st", l: "Status", html: (v) => html.pill(v, "good") }],
          BR.map((b, i) => ({ code: "BR-0" + (i + 1), b, s: STUDENTS[i], t: TEACHERS[i], a: `admin.b${i + 1}.demo`, st: "Active" }))))}
        ${panelHTML("Users", html.table([{ k: "u", l: "User", cls: "mono" }, { k: "r", l: "Role" }, { k: "s", l: "Access" }, { k: "st", l: "Status", html: (v) => html.pill(v, v === "Active" ? "good" : "neutral") }], [
          { u: "admin.demo", r: "Administrator", s: "All branches", st: "Active" },
          { u: "admin.b1.demo", r: "Branch admin", s: "Branch 1", st: "Active" },
          { u: "teacher.a.demo", r: "Teacher", s: "Branch 1 · Class 6 – A", st: "Active" },
          { u: "feedesk.b2.demo", r: "Fee desk", s: "Branch 2 · Fees", st: "Active" },
          { u: "parent.a.demo", r: "Parent", s: "Student A. Demo, Student K. Demo", st: "Active" },
          { u: "teacher.g.demo", r: "Teacher", s: "Branch 3", st: "Inactive" }]))}`);
    },
  };
})();
