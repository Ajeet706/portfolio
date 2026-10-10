/* Case study — Freight Audit & Logistics Performance Analytics (RR Logistics, professional)
   ANALYTICS / REPORTING work on logistics data — distinct from the Transportation Operations
   Management System (the operational system of record). Confirmed technology: Python, SQL,
   Zoho Analytics, Excel. Visuals are synthetic; code is representative on a synthetic schema. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "logistics",
  order: 2,
  company: "rr",
  kind: "professional",
  featured: false,
  title: "Freight Audit & Logistics Performance Analytics",
  short: "Freight & logistics analytics",
  domain: "Logistics / Operations Analytics & KPI Reporting",
  domains: ["Logistics", "BI", "Automation"],
  techTags: ["Python", "SQL", "Zoho Analytics"],
  tech: ["Python", "SQL", "Zoho Analytics", "Excel"],
  thumb: "la-dashboard",
  problem: "Audit freight invoices before payment and report the operational KPIs — vehicle, route, delivery, vendor, cost and inventory — in Zoho Analytics.",

  summary: {
    problem: "The operations system recorded what happened, but KPIs were compiled by hand and freight invoices were checked line by line, so billing errors could slip through and reports arrived late.",
    solution: "An analytics and reporting layer on the logistics data: SQL audit checks that compare each invoice with the agreed rate and the trip record, a recurring Python KPI pack, and Zoho Analytics dashboards and Excel outputs for vehicle, route, delivery, vendor, cost and inventory performance.",
    contribution: "Freight audit, invoice analysis, inventory analytics, KPI reporting, vehicle performance, carrier / vendor analysis, cost analysis and reporting automation with Python, SQL, Zoho Analytics and Excel.",
    outcome: "Invoice exceptions listed for review before payment, and regular KPI reporting in place of manual compilation.", // VERIFY
  },
  users: "Operations and fleet management, billing / accounts, and management reviews.", // VERIFY
  process: "Freight invoice checking before payment, and recurring operational KPI reporting.",
  overviewNote: "This case study covers the analytics and reporting work on RR Logistics data. The Transportation Operations Management System case study covers the operational application that records vehicles, trips and bills; this project analyses that data. Dashboards are synthetic re-creations; vendors, amounts and counts are demo values.",

  problemText: [
    "The operations application recorded what happened — vehicles, trips, bills, maintenance. Management also needed to know how well it happened: which routes ran late, which vehicles were under-used, which vendors billed accurately, and how cost per km was moving.",
    "Freight invoices arrive in volume. A rate above the agreed one, a trip billed twice or a charge with no matching trip is each small enough to miss in a spreadsheet. Compiling KPIs by hand every period took time and gave different answers depending on who built the report.",
  ],
  problemPoints: [
    "Is each freight invoice correct before it is paid?",
    "Which routes and vehicles perform well, and which are late or under-used?",
    "Which carriers / vendors deliver on time and bill accurately?",
    "Where is cost per km rising, and how old is the stock we hold?",
  ],
  objective: "Turn logistics data into an automated freight audit and a small set of agreed KPIs, delivered as recurring reports and Zoho Analytics dashboards.",
  objectives: [
    "Check invoices against agreed rates and trip records before payment.",
    "One definition for each KPI: on-time delivery, utilisation, cost per km.",
    "Automate the recurring KPI pack.",
    "Give operations reviews one dashboard.",
  ],
  role: [
    "Freight audit: checked invoices against agreed rates and trip / delivery records.",
    "Invoice analysis: variance against the agreed rate, duplicate billing and charges not supported by a trip.",
    "KPI reporting on vehicle performance, route performance, delivery performance and cost.",
    "Carrier / vendor analysis: on-time delivery and billing accuracy, side by side.",
    "Inventory analytics: stock value and ageing.",
    "Reporting automation with Python and SQL; dashboards in Zoho Analytics; Excel outputs for finance and operations.",
  ],

  data: {
    text: "Trips, vehicles and bills come from the operations system; invoices, rate agreements, cost and stock records complete the picture. The demo uses synthetic vendors, routes and vehicles.",
    sources: [
      { name: "Freight invoices", grain: "1 row per invoice line", fields: "vendor / carrier, trip, base amount, extra charges, approval flag" },
      { name: "Rate agreements", grain: "vendor × route × vehicle type × validity period", fields: "agreed rate per trip, valid from, valid to" },
      { name: "Trips (operations system)", grain: "1 row per trip", fields: "vehicle, vehicle type, route, dispatch, promised and actual delivery, km, status" },
      { name: "Vehicle activity", grain: "vehicle × day", fields: "km, loaded km" },
      { name: "Cost records", grain: "1 row per cost entry", fields: "vehicle, route, cost head, amount, month" },
      { name: "Inventory", grain: "item × location × day", fields: "quantity, value, receipt date" },
    ],
    processing: [
      "SQL joins invoices to rate agreements and trips, and applies the audit rules.",
      "Python builds the KPI tables with fixed definitions and writes the Excel pack.",
      "Zoho Analytics presents the KPI tables as dashboards for operations reviews.",
    ],
    validation: [
      "Invoice totals reconciled to the accounts register before analysis.",
      "Rate agreements checked for overlapping validity periods before use.",
      "Trips without a delivery record listed separately rather than passed.",
      "KPI totals compared with the previous period to catch an incomplete load.",
    ],
  },
  techUse: [
    { t: "SQL", use: "Audit queries (invoice vs agreed rate vs trip) and the base tables for KPIs by vehicle, route, vendor and month." },
    { t: "Python", use: "Recurring KPI pack: calculations with fixed definitions, Excel output and the tables behind the dashboards." },
    { t: "Zoho Analytics", use: "Dashboards for operations reviews: KPIs, routes, vehicles, vendors, cost, delivery and inventory." },
    { t: "Excel", use: "Audit exception lists for billing / accounts and KPI workbooks for finance and operations." },
  ],

  workflow: {
    text: "From operational data to action.",
    steps: [
      { t: "Collect", d: "trips, invoices, rate agreements, cost and stock" },
      { t: "Audit invoices", d: "billed vs agreed rate vs trip record" },
      { t: "Flag exceptions", d: "above rate, billed twice, unapproved extra, no trip" },
      { t: "Build KPIs", d: "vehicle, route, delivery, vendor, cost, inventory" },
      { t: "Publish", d: "Zoho Analytics dashboard and Excel pack" },
      { t: "Review and act", d: "hold or correct invoices; follow up routes, vehicles, vendors" },
    ],
  },
  architecture: {
    text: "Recurring batch: SQL and Python prepare the tables; Zoho Analytics and Excel present them.",
    lanes: [
      { lane: "Sources", nodes: [{ t: "Operations system", d: "trips, vehicles, bills" }, { t: "Freight invoices" }, { t: "Rate agreements" }, { t: "Cost & stock records" }] },
      { lane: "SQL", nodes: [{ t: "Audit checks", d: "invoice vs rate vs trip", key: true }, { t: "KPI base tables", d: "by vehicle, route, vendor, month" }] },
      { lane: "Python", nodes: [{ t: "KPI pack", d: "fixed definitions, weekly", key: true }, { t: "Excel writer" }] },
      { lane: "Outputs", nodes: [{ t: "Zoho Analytics dashboards", key: true }, { t: "Audit exception list" }, { t: "KPI workbook" }] },
      { lane: "Users", nodes: [{ t: "Billing / accounts", d: "before payment" }, { t: "Operations review" }, { t: "Management" }] },
    ],
  },
  model: {
    text: "Invoices join to rate agreements by vendor, route, vehicle type and delivery date, and to trips by trip number.",
    entities: [
      { name: "invoice_line", fields: [["invoice_no", "pk"], ["vendor_id", "fk"], ["trip_no", "fk"], ["base_amount"], ["extra_amount"], ["extra_approved"]] },
      { name: "rate_agreement", fields: [["vendor_id", "fk"], ["route"], ["vehicle_type"], ["rate_per_trip"], ["valid_from"], ["valid_to"]] },
      { name: "trip", fields: [["trip_no", "pk"], ["vehicle_id", "fk"], ["vehicle_type"], ["route"], ["promised_on"], ["delivered_on"], ["km"], ["status"]] },
      { name: "vehicle_day", fields: [["vehicle_id", "fk"], ["log_date"], ["km"], ["loaded_km"]] },
      { name: "cost_entry", fields: [["cost_id", "pk"], ["vehicle_id", "fk"], ["route"], ["cost_head"], ["amount"], ["month"]] },
      { name: "stock_snapshot", fields: [["item_id"], ["location"], ["snap_date"], ["qty"], ["value"], ["received_on"]] },
    ],
    note: "Synthetic schema for illustration. Trips and vehicles come from the operations system.",
  },

  sql: {
    title: "Freight audit: billed vs agreed vs delivered",
    text: "One query lines up what was billed, what was agreed and what the trip record shows, and gives every invoice line a finding.",
    code: `-- Representative ANSI SQL on a synthetic schema — not production code
WITH audit AS (
  SELECT i.invoice_no, i.vendor_id, i.trip_no, t.route,
         i.base_amount, i.extra_amount, i.extra_approved,
         i.base_amount + i.extra_amount                       AS billed,
         r.rate_per_trip                                      AS agreed_rate,
         t.status                                             AS trip_status,
         COUNT(*) OVER (PARTITION BY i.vendor_id, i.trip_no)  AS times_billed
    FROM invoice_line i
    LEFT JOIN trip t           ON t.trip_no       = i.trip_no
    LEFT JOIN rate_agreement r ON r.vendor_id     = i.vendor_id
                              AND r.route         = t.route
                              AND r.vehicle_type  = t.vehicle_type
                              AND t.delivered_on BETWEEN r.valid_from AND r.valid_to
)
SELECT invoice_no, vendor_id, trip_no, route, billed, agreed_rate,
       base_amount - agreed_rate AS rate_variance,
       CASE
         WHEN trip_status IS NULL OR trip_status <> 'DELIVERED' THEN 'No delivered trip'
         WHEN times_billed > 1                                  THEN 'Trip billed more than once'
         WHEN agreed_rate IS NULL                               THEN 'No agreed rate'
         WHEN base_amount > agreed_rate * 1.01                  THEN 'Above agreed rate'
         WHEN extra_amount > 0 AND extra_approved = 'N'         THEN 'Extra charge not approved'
         ELSE 'Passed'
       END AS finding
  FROM audit
 ORDER BY invoice_no;`,
    points: [
      "LEFT JOINs keep invoices with no matching trip or rate: those are findings, not rows to drop.",
      "The window COUNT() finds a trip billed twice without a self-join.",
      "The agreed rate is chosen by the delivery date, so mid-period rate changes are handled.",
      "A 1% tolerance avoids flagging rounding differences.",
    ],
  },
  python: {
    title: "Weekly KPI pack",
    text: "Representative, simplified. Python assembles the KPIs with fixed definitions and writes the Excel pack; the same tables feed the Zoho Analytics dashboards.",
    code: `# Representative, simplified — not production code
import pandas as pd

trips = pd.read_sql(TRIPS_SQL, conn, parse_dates=["dispatched_on", "promised_on", "delivered_on"])
trips["on_time"] = trips.delivered_on <= trips.promised_on
audit = pd.read_sql(AUDIT_SQL, conn)                        # output of the audit query

route = (trips.groupby("route")
              .agg(trips=("trip_no", "size"), on_time_pct=("on_time", "mean"),
                   cost=("trip_cost", "sum"), km=("km", "sum"))
              .assign(cost_per_km=lambda d: d.cost / d.km)
              .sort_values("on_time_pct"))

vendor = (trips.groupby("vendor_id")
               .agg(trips=("trip_no", "size"), on_time_pct=("on_time", "mean"))
               .join(audit.assign(ok=audit.finding.eq("Passed"))
                          .groupby("vendor_id")["ok"].mean()
                          .rename("billing_accuracy")))

veh = pd.read_sql(VEHICLE_DAY_SQL, conn)
vehicle = (veh.groupby("vehicle_id")[["loaded_km", "km"]].sum()
              .assign(utilisation=lambda d: d.loaded_km / d.km))

stock = pd.read_sql(STOCK_SQL, conn, parse_dates=["received_on"])
days = (pd.Timestamp.today() - stock.received_on).dt.days
stock["age_band"] = pd.cut(days, [-1, 30, 60, 90, 10_000], labels=["0-30", "31-60", "61-90", "90+"])
ageing = stock.groupby("age_band", observed=True)["value"].sum()

with pd.ExcelWriter("weekly_logistics_kpis.xlsx") as xw:
    for name, df in {"route": route, "vendor": vendor, "vehicle": vehicle, "ageing": ageing}.items():
        df.to_excel(xw, sheet_name=name)`,
    points: [
      "The same definitions every week: on-time, utilisation, cost per km, billing accuracy.",
      "Vendor billing accuracy comes straight from the audit findings, so the scorecard and the audit always agree.",
      "Excel for finance and operations; the same tables feed the Zoho Analytics dashboards.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Descriptive and diagnostic analytics; no model was needed to catch billing errors or report KPIs. The work rests on clear audit rules and fixed KPI definitions. Thresholds below are representative.",
    rules: [
      { rule: "Above agreed rate", condition: "Billed base amount > agreed rate × 1.01 for the vendor, route, vehicle type and delivery date", outcome: "Exception: hold for review" },
      { rule: "Billed more than once", condition: "Same vendor and trip on more than one invoice line", outcome: "Exception: hold for review" },
      { rule: "No delivered trip", condition: "Invoice trip not found, or not delivered", outcome: "Exception: ask the vendor for proof" },
      { rule: "Extra charge", condition: "Extra amount without approval", outcome: "Exception: approve or reject" },
      { rule: "On-time delivery", condition: "Delivered on or before the promised date and time", outcome: "KPI: on-time %, by route and vendor" },
      { rule: "Utilisation", condition: "Loaded km ÷ total km", outcome: "KPI: by vehicle and month" },
      { rule: "Cost per km", condition: "Cost ÷ km for a vehicle type, route or month", outcome: "KPI: trend" },
    ],
  },
  dashboard: {
    text: "The logistics KPI dashboard used in operations reviews, re-created with synthetic data.",
    visual: "la-dashboard",
    outputs: ["Freight audit exception list (Excel) for billing / accounts", "Weekly KPI workbook (Excel)", "Zoho Analytics dashboards: KPIs, routes, vehicles, delivery, vendors, cost and inventory"],
  },
  insights: {
    items: [
      "Most invoice exceptions fall into a few repeatable types: above the agreed rate, a trip billed twice, and extra charges without approval.",
      "Ranking vendors on on-time delivery and billing accuracy together gives a fairer picture than either alone.",
      "On-time % is only comparable across routes when each route has its own promised transit time.",
      "Short routes cost more per km because fixed time at loading and unloading is spread over fewer kilometres.",
      "Empty return legs are a common reason for low vehicle utilisation.",
      "Stock beyond 90 days is a small share of value but worth a regular review.",
    ],
  },
  impact: {
    before: ["Invoices checked line by line in spreadsheets", "KPIs compiled by hand each period", "Different numbers depending on who built the report"],
    solution: ["SQL audit rules on invoices, rates and trips", "Python KPI pack with fixed definitions", "Zoho Analytics dashboards and Excel outputs"],
    after: ["Invoice exceptions listed for review before payment", "Recurring KPIs without manual compilation", "One agreed view for operations reviews"],
    items: [
      "Billing errors identified before payment.",
      "Consistent KPIs on vehicles, routes, delivery, vendors, cost and inventory.",
      "Less manual reporting effort.",
      "Evidence for vendor discussions and route planning.",
    ],
  },
  challenges: [
    "Rate agreements with overlapping validity dates: checked and fixed before the audit runs.",
    "Trip references formatted differently by different vendors: normalised before matching.",
    "Missing delivery records: listed separately instead of passed automatically.",
    "Agreeing KPI definitions (on-time, utilisation) before automating them.",
  ],
  learnings: [
    "Audit rules work best when each exception type has a clear owner and next step.",
    "Agreeing KPI definitions up front avoids arguments over numbers later.",
    "Analytics depends on the operational system: clean trip and vehicle records make every KPI easier.",
  ],
  screenshots: ["la-dashboard", "la-audit", "la-route", "la-vehicle", "la-vendor", "la-cost", "la-delivery", "la-inventory"],
  future: [
    "Run the audit checks as invoices arrive instead of in a batch.",
    "Share a monthly scorecard with each vendor.",
    "Route cost benchmarking with fuel and toll data.",
    "Alerts when on-time % or cost per km crosses a threshold.",
  ],

  interview: {
    s30: "At RR Logistics I did the analytics and reporting on top of the operations data. I automated the freight audit — SQL that lines up each invoice with the agreed rate and the trip record and flags rates above agreement, trips billed twice and unapproved charges — and built a weekly Python KPI pack on vehicle, route, delivery, vendor, cost and inventory performance, presented in Zoho Analytics dashboards and Excel.",
    s90: "In logistics, freight is a large recurring cost and invoices arrive in volume. At RR Logistics the operations application recorded vehicles, trips and bills; my analytics work sat on top of that data. First, the freight audit. A SQL query lines up each invoice with the agreed rate for that vendor, route and vehicle type on the delivery date, and with the trip record. It flags invoices above the agreed rate, trips billed more than once, extra charges without approval and invoices with no delivered trip, with a small tolerance for rounding, and the exception list goes to billing before payment. Second, KPI reporting. A weekly Python pack calculates on-time delivery by route and vendor, vehicle utilisation, cost per km by vehicle type and inventory ageing, always with the same definitions, and writes the Excel outputs and the tables behind the Zoho Analytics dashboards used in operations reviews. Third, analysis on request: which vendors combine good on-time performance with accurate billing, where cost per km is rising, which vehicles run empty on return legs. The result was billing errors caught before payment and KPIs that arrived regularly without manual compilation. The pattern — reconcile, apply clear rules, flag exceptions with a reason, report agreed KPIs — is the one I now use in lending analytics.",
    role: ["Freight audit and invoice analysis", "Vehicle, route and delivery performance KPIs", "Carrier / vendor and cost analysis", "Inventory analytics", "Reporting automation with Python, SQL, Zoho Analytics and Excel"],
    tech: ["SQL", "Python", "Zoho Analytics", "Excel"],
    impact: ["Billing errors identified before payment", "Recurring KPIs without manual compilation", "One agreed view for operations reviews"],
    challenges: ["Overlapping rate validity dates", "Inconsistent trip references across vendors", "Missing delivery records", "Agreeing KPI definitions"],
    questions: [
      { q: "What is a freight audit?", a: ["Checking each carrier / vendor invoice against the agreed rate, the actual trip record and earlier invoices before paying it."] },
      { q: "Which checks did you automate?", a: ["Billed amount above the agreed rate (with a 1% tolerance).", "The same trip billed more than once, found with a window COUNT() over vendor and trip.", "Extra charges without approval.", "Invoices with no delivered trip, and invoices with no agreed rate."] },
      { q: "How do you pick the right rate when rates change during a month?", a: ["Rate agreements carry valid-from and valid-to dates.", "The join uses the trip’s delivery date BETWEEN those dates, so each trip gets the rate in force when it was delivered.", "Agreements are checked for overlapping periods first; an overlap would return two rates for one trip."] },
      { q: "How did you measure vendor / carrier performance?", a: ["On-time delivery against the promised date, billing accuracy from the audit findings, exceptions and cost per km.", "Read together in one scorecard: a punctual vendor that bills inaccurately still costs time and money."] },
      { q: "How did you define on-time delivery and utilisation?", a: ["On-time: delivered on or before the promised date and time.", "Utilisation: loaded km ÷ total km per vehicle, so empty return legs show up.", "Definitions were fixed before automating, so every period is comparable."] },
      { q: "Why Zoho Analytics?", a: ["It was the BI tool used for these dashboards; Python and SQL produced clean tables that Zoho Analytics presented.", "Keeping logic in SQL and Python means the dashboard only displays numbers that are already checked."] }, // VERIFY
      { q: "How is this different from the transport operations application?", a: ["The application is the operational system of record: records are created there every day.", "This project analyses that data afterwards: it audits invoices, calculates KPIs and reports them."] },
      { q: "How is this relevant to a lending role?", a: ["The same pattern — reconcile, check against rules, flag exceptions with a reason, report agreed KPIs — is what AML monitoring, early warning and portfolio MIS need."] },
    ],
  },
});
