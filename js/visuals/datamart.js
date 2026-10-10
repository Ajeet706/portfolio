/* =====================================================================
   DataMart (Data Nest) — synthetic re-creations of the application screens.
   Layout and functions follow the real application; every name, number,
   table and identifier below is DEMO DATA. No real queries, users, tables
   or counts are shown.
   ===================================================================== */
(function () {
  "use strict";
  const { html, fmt, esc } = window.Charts;
  const VIS = window.VIS;

  const NAV = (active, open) => {
    const menus = {
      Download: ["Query Result", "Query Date", "Python Script"],
      Services: ["Mail Monitor", "Replica Table", "IRDA Mapping"],
    };
    const item = (t) => {
      const has = menus[t];
      const dd = open && open.menu === t ? `<div class="dn-dd">${menus[t].map((m) => `<span class="${m === open.item ? "on" : ""}">${m}</span>`).join("")}</div>` : "";
      return `<span class="dn-nav-i ${t === active ? "on" : ""} ${open && open.menu === t ? "open" : ""}">${t}${has ? " ▾" : ""}${dd}</span>`;
    };
    return `<div class="dn-bar"><b>Data Nest</b>${["Home", "Download", "Services", "Dashboard", "Gallery", "Contact"].map(item).join("")}<span class="dn-user">analyst.demo · Logout</span></div>`;
  };
  const shell = (body, active = "Home", open) => `<div class="app dn">${NAV(active, open)}<div class="dn-body">${body}</div></div>`;
  const btn = (t, kind = "") => `<span class="dn-btn ${kind}">${t}</span>`;
  const file = () => `<span class="dn-file"><span>Choose file</span> No file chosen</span>`;

  VIS["dm-home"] = {
    title: "Home and navigation",
    sub: "Download menu: query results, date-range extracts, Python scripts. Services menu: monitors and utilities.",
    caption: "The whole platform sits behind a login. Everything a user can run is reachable from two menus.",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h1">Welcome to Data Nest</h4><p class="app-note">One place for data extraction, scheduled reports and monitoring.</p><span class="dn-link">Get started</span>
        <div class="dn-menus"><div><p class="label">Download</p><ul><li>Query Result — approved SQL queries</li><li>Query Date — date-range extracts</li><li>Python Script — download, mail or upload &amp; run</li></ul></div>
        <div><p class="label">Services</p><ul><li>Mail Monitor — scheduled mail status</li><li>Replica Table — replication delay</li><li>IRDA Mapping — file mapping utility</li></ul></div></div>`, "Home", { menu: "Download", item: "Query Result" });
    },
  };

  VIS["dm-login"] = {
    title: "Login",
    sub: "Access requires sign-in; new users register through Sign Up.",
    caption: "Django authentication protects every page and download.",
    render(el) {
      el.innerHTML = shell(`<div class="app-login" style="background:transparent"><div class="app-login-card"><strong style="text-align:center">Login</strong>
        <div class="app-in">Username<span>analyst.demo</span></div><div class="app-in">Password<span>••••••••••</span></div>${btn("Login", "wide")}
        <span class="app-note" style="text-align:center">New user? Sign up</span></div></div>`, "Home");
    },
  };

  const QUERIES = [
    { sn: 101, name: "Month-on-month DPD", act: "filter" }, { sn: 114, name: "Rescheduling data", act: "filter" },
    { sn: 127, name: "Sourcing details (DSA / connector)", act: "filter" }, { sn: 132, name: "Waive-off amount", act: "filter" },
    { sn: 145, name: "Branch master", act: "download" }, { sn: 158, name: "Product master", act: "download" },
    { sn: 163, name: "Transaction journal (accounts)", act: "filter" }, { sn: 176, name: "Insurance charges", act: "filter" },
    { sn: 182, name: "Customer KYC status", act: "filter" }, { sn: 190, name: "Bureau score extract", act: "filter" },
  ];
  VIS["dm-queries"] = {
    title: "Query catalogue — Available Queries for Download",
    sub: "Each row is an approved SQL query. ‘Download’ runs it as is; ‘Add Filters’ runs it for the values a user supplies.",
    caption: "Users pick from approved queries instead of asking the data team. Report names are generic examples.",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h2">Available Queries for Download</h4>${html.table([
        { k: "sn", l: "Serial no.", cls: "mono" }, { k: "name", l: "Query name" },
        { k: "act", l: "Action", html: (v) => (v === "filter" ? btn("Add Filters") : btn("Download")) }], QUERIES)}`, "Download", { menu: null });
    },
  };

  VIS["dm-filter-flow"] = {
    title: "‘Add Filters’ flow — format file in, result file out",
    sub: "1 Download the Excel format file → 2 fill in filter values and upload → 3 download the result.",
    caption: "Filters travel as an Excel template, so users can pass hundreds of loan or branch IDs at once without typing SQL.",
    render(el) {
      const modal = (n, t, body, b) => `<div class="dn-modal"><div class="dn-modal-h"><span class="dn-step">${n}</span>${t}<span class="dn-x">×</span></div><div class="dn-modal-b">${body}</div><div class="dn-modal-f">${b}</div></div>`;
      el.innerHTML = `<div class="dn-flow">
        ${modal(1, "Download format file", `<p>Format ready. Click the button to download.</p><div class="dn-xl"><b>format_month_on_month_dpd.xlsx</b><span>loan_id · branch_code · as_of_month</span></div>`, btn("Download") + btn("Close", "ghost"))}
        ${modal(2, "Upload format file", `<p class="label">Upload Excel file</p>${file()}<div class="dn-xl"><b>filled_format.xlsx</b><span>240 rows · 3 columns · validated</span></div>`, btn("Upload") + btn("Close", "ghost"))}
        ${modal(3, "Message", `<p>Your download is ready. Click the Download button.</p><div class="dn-xl"><b>month_on_month_dpd.csv</b><span>2,880 rows · demo</span></div>`, btn("Download") + btn("Close", "ghost"))}
      </div>`;
    },
  };

  const DATE_REPORTS = [
    { name: "Receipt dump", desc: "Extract max 15 days" }, { name: "GL data (accounts)", desc: "—" },
    { name: "NOC waiver details", desc: "—" }, { name: "PAN validation", desc: "Requested by audit & compliance" },
    { name: "Closed-case disbursal adjustment", desc: "—" }, { name: "First-EMI tracker", desc: "Long-running — takes time to run" },
  ];
  VIS["dm-date"] = {
    title: "Extract Data With Date",
    sub: "Date-range reports with start and end date pickers.",
    caption: "Heavy extracts carry their own guard-rails in the description, such as a maximum 15-day window.",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h2" style="text-align:left">Extract Data With Date</h4>${html.table([
        { k: "name", l: "Report name" }, { k: "desc", l: "Description" },
        { k: "s", l: "Start date", html: () => `<span class="dn-date">dd/mm/yyyy</span>` }, { k: "e", l: "End date", html: () => `<span class="dn-date">dd/mm/yyyy</span>` },
        { k: "a", l: "Action", html: () => btn("Get Data") }], DATE_REPORTS)}`, "Download");
    },
  };

  const SCRIPTS = [
    { name: "Daily disbursal summary", act: "download" }, { name: "Mail run", act: "mail" },
    { name: "DPD using MIS table", act: "upload" }, { name: "Application TAT", act: "upload" },
    { name: "Credit MIS", act: "mail" }, { name: "Legal cases", act: "upload" },
    { name: "Bounce cases", act: "upload" }, { name: "Payment TAT", act: "mail" }, { name: "Collateral", act: "mail" },
  ];
  VIS["dm-scripts"] = {
    title: "Python scripts — Available Scripts for Download Data",
    sub: "Three run modes: Download File, File Mail (send output by email), Upload & Run (process an input file).",
    caption: "Multi-step reports run as registered Python scripts, so business logic that does not fit one SQL query is still self-service.",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h2">Available Scripts for Download Data</h4>${html.table([
        { k: "name", l: "Script name" },
        { k: "act", l: "Action", html: (v) => (v === "download" ? btn("Download File") : v === "mail" ? btn("File Mail") : `${file()} ${btn("Upload & Run")}`) }], SCRIPTS)}`, "Download", { menu: "Download", item: "Python Script" });
    },
  };

  const MAILS = [
    { name: "Sample data", st: "Not sent", at: "—" }, { name: "Payment TAT", st: "Sent", at: "06:04" },
    { name: "Collateral", st: "Not sent", at: "—" }, { name: "Disbursal details", st: "Sent", at: "06:07" },
    { name: "Application details report", st: "Sent", at: "06:09" }, { name: "Credit MIS", st: "Sent", at: "06:12" },
    { name: "Insurance MIS", st: "Sent", at: "06:15" }, { name: "Insurance details", st: "Sent", at: "06:16" },
  ];
  VIS["dm-mail"] = {
    title: "Mail Monitoring Dashboard",
    sub: "Scheduled report mails for the day: sent or not, and when.",
    caption: "One screen answers ‘did this morning’s reports go out?’ — failed mails are visible before users notice.",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h2" style="text-align:left">Mail Monitoring Dashboard</h4>${html.table([
        { k: "d", l: "Date", fmt: () => "08 Oct 2026, 06:00" }, { k: "name", l: "Mail name" },
        { k: "st", l: "Status", html: (v) => html.pill(v, v === "Sent" ? "good" : "crit") }, { k: "at", l: "Sent time", cls: "mono" }], MAILS,
        { rowClass: (r) => (r.st === "Sent" ? "" : "hl") })}`, "Services", { menu: null });
    },
  };

  const REPLICA = [
    { t: "dm_loan_account", sys: "11:20", rep: "11:18", d: 2 }, { t: "dm_receipt", sys: "11:20", rep: "11:19", d: 1 },
    { t: "dm_application", sys: "11:20", rep: "11:18", d: 2 }, { t: "dm_task_log", sys: "11:20", rep: "11:06", d: 14 },
    { t: "dm_repayment_schedule", sys: "11:20", rep: "11:18", d: 2 },
  ];
  VIS["dm-replica"] = {
    title: "Replica Monitoring Dashboard",
    sub: "Source time vs replica time per table, and the delay in minutes.",
    caption: "Reports read from a replica, so data freshness matters. The delay column shows at a glance when a table is lagging (highlighted row is an example).",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h2" style="text-align:left">Replica Monitoring Dashboard</h4>${html.table([
        { k: "t", l: "Table name", cls: "mono" }, { k: "sys", l: "System time", cls: "mono" }, { k: "rep", l: "Replica time", cls: "mono" },
        { k: "d", l: "Delay (min)", cls: "r", html: (v) => (v > 10 ? html.pill(String(v), "crit") : String(v)) }], REPLICA,
        { rowClass: (r) => (r.d > 10 ? "hl" : "") })}`, "Services");
    },
  };

  VIS["dm-irda"] = {
    title: "IRDA Mapping utility",
    sub: "Upload two master files; download the combined mapping file.",
    caption: "A small file-processing utility: two uploads are matched in Python and returned as one mapping file, replacing a manual spreadsheet exercise.",
    render(el) {
      el.innerHTML = shell(`<h4 class="dn-h2">IRDA Mapping</h4>${html.table([
        { k: "f", l: "File name" }, { k: "s", l: "Select file", html: () => file() }],
        [{ f: "SP master data" }, { f: "Vehicle data" }])}<div style="text-align:center;margin-top:.6rem">${btn("Download mapping file")}</div>`, "Services", { menu: "Services", item: "IRDA Mapping" });
    },
  };

  VIS["dm-kpi"] = {
    title: "Dashboard — loan counts and MIS refresh check",
    sub: "Synthetic counts. Today’s vs yesterday’s MIS count is a quick completeness check on the daily refresh.",
    caption: "Headline counts on the landing dashboard; if today’s MIS count drops sharply against yesterday’s, the refresh is checked before reports go out.",
    render(el) {
      el.innerHTML = shell(`${html.kpis([
        { l: "Total loans", v: fmt.int(248560) }, { l: "Active loans", v: fmt.int(131420) }, { l: "Closed loans", v: fmt.int(116410) },
        { l: "Cancelled loans", v: fmt.int(730) }, { l: "Today’s MIS count", v: fmt.int(131512) }, { l: "Yesterday’s MIS count", v: fmt.int(131470), s: "+42 day on day" }])}`, "Dashboard");
    },
  };
})();
