/* Case study — ONE DASH: End-to-End NBFC Lifecycle Analytics Platform (SK Finance, professional, featured)
   Confirmed: Ajeet built it — the data model, the SQL and the Power BI dashboards. Python is not
   listed for this project, so it is not claimed. Source-system names, refresh frequency, row counts and team sizes are NOT
   confirmed and are marked "Representative / Demo Workflow". All ten report pages are synthetic
   re-creations generated from one seeded demo dataset (js/visuals/onedash.js), so they reconcile. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "onedash",
  order: 1,
  company: "sk",
  kind: "professional",
  featured: true,
  featuredThumb: "od-executive",
  title: "ONE DASH — End-to-End NBFC Lifecycle Analytics Platform",
  short: "ONE DASH lifecycle analytics",
  domain: "Lifecycle Analytics / Business Intelligence",
  domains: ["NBFC", "BI", "Credit", "Risk"],
  techTags: ["Power BI", "SQL"],
  tech: ["Power BI", "SQL", "Data modelling"],
  thumb: "od-executive",
  problem: "One dashboard for the whole lending lifecycle — lead and application through credit, disbursement, repayment and collections to delinquency, legal and closure — with drill-down from company to a single loan.",

  summary: {
    problem: "Lifecycle data in an NBFC is reported in pieces: sourcing, credit, operations, collections and legal each have their own reports, cut-offs and definitions. Following volume from lead to loan, or seeing where cases are lost and where risk builds, meant joining several reports by hand.",
    solution: "ONE DASH: a single Power BI analytics platform built on a lifecycle data model. It covers 16 stages from lead to resolution, with a KPI for every stage, ten report pages and drill-down from company to region, branch, product, application, customer and loan.",
    contribution: "Built it: the data model, the SQL data layer and the Power BI dashboards.",
    outcome: "One consistent view of the application-to-loan lifecycle — conversion and turnaround by stage next to portfolio, collection and delinquency health, on one set of definitions.",
  },
  users: "Management and functional teams across sourcing, credit, operations, collections and legal (Representative / Demo Workflow).",
  process: "The full lending lifecycle: origination, underwriting, disbursement, servicing, collections, delinquency, legal and closure.",
  overviewNote: "Every dashboard page in this case study is a synthetic re-creation generated from one seeded demo dataset, so the pages reconcile with each other. Source-system names, refresh frequency, data volumes and team details are not shown; where such a detail is needed it is marked Representative / Demo Workflow.",

  problemText: [
    "An NBFC loan passes through many hands. A lead is captured, an application is logged in, KYC and the credit bureau are checked, credit assesses the case, a field investigation and collateral check follow, credit decides, documents are completed and the loan is disbursed. After that the loan is repaid and collected, sometimes becomes delinquent, may go to legal, and is finally resolved or closed.",
    "Each team usually reports its own part. Sourcing counts leads, credit counts approvals, operations counts disbursals, collections tracks DPD buckets. The numbers use different cut-offs and definitions, so they rarely line up, and any question that crosses stages — where do applications drop out, how long does each step take, which branches disburse well but collect poorly — needs a manual join across reports.",
  ],
  problemPoints: [
    "Where is volume lost between lead and disbursement, and at which stage?",
    "How long does each stage take, and where are the delays?",
    "How healthy is the book — repayment, collections, DPD buckets, NPA, legal cases?",
    "Which region, branch or product drives a number — down to the individual application and loan?",
  ],
  objective: "Show the complete application-to-loan lifecycle on a single dashboard: one data model, one set of KPI definitions, and drill-down from company level to an individual loan.",
  objectives: [
    "Cover all 16 lifecycle stages, from lead to resolution / closure.",
    "Define each KPI once and reuse it on every page.",
    "Measure stage-to-stage conversion and turnaround time (TAT).",
    "Drill down: Company → Region → Branch → Product → Application → Customer → Loan.",
  ],
  role: [
    "Designed and built the platform end to end.",
    "Designed the lifecycle data model that links application stages to loans, repayments, collections and delinquency.",
    "Built the SQL data layer that prepares and reconciles the data for Power BI.",
    "Defined the KPIs: leads, applications, KYC, credit assessment, approvals, rejections, disbursement, active loans, repayment, collections, delinquency, NPA / DPD, legal cases and resolution.",
    "Built the Power BI dashboards — an executive overview and pages for each lifecycle area — with drill-down from company to region, branch, product, application, customer and loan.",
  ],

  data: {
    text: "One model over many sources. Source systems are not named here; the list shows the kind of data each part of the lifecycle needs (Representative / Demo Workflow).",
    sources: [
      { name: "Lead and application data", grain: "1 row per lead / application", fields: "lead date, application ID, branch, product, applied amount, customer" },
      { name: "Stage events", grain: "1 row per application per stage", fields: "stage, entered and completed timestamps, status (cleared, rejected, pending), reason" },
      { name: "Loan master", grain: "1 row per loan", fields: "loan ID, application ID, customer, disbursal date and amount, tenure, product, branch" },
      { name: "Monthly loan snapshot", grain: "1 row per loan per month", fields: "POS, EMI due, DPD, bucket, NPA flag, legal flag, closure type" },
      { name: "Collections", grain: "1 row per receipt", fields: "loan ID, receipt date, amount, demand month" },
      { name: "Masters", grain: "1 row per member", fields: "branch → region → company, product, stage order and phase, calendar" },
    ],
    processing: [
      "SQL builds stage events with timestamps, so funnel, conversion and TAT all come from one table.",
      "Loan and collection data are snapshotted monthly for portfolio, DPD and collection-efficiency views.",
      "SQL reconciliation checks run before each refresh, so pages agree with each other (Representative / Demo Workflow).",
      "Power BI measures calculate every ratio at whatever level the user drills to.",
    ],
    validation: [
      "Funnel counts never increase from one stage to the next.",
      "Approved + rejected ≤ assessed; disbursed ≤ approved.",
      "DPD buckets add up to active loans; branches add up to regions and the company.",
      "Opening book + new loans − closures = closing book.",
    ],
  },
  techUse: [
    { t: "Power BI", use: "Ten report pages, KPI measures, slicers for month, region, product and branch, and drill-down from company to loan." },
    { t: "SQL", use: "Lifecycle data layer: stage events and timestamps, conversion, TAT, portfolio, DPD and collection figures. Examples are in Oracle dialect." },
    { t: "Data modelling", use: "Facts at three grains — application × stage, loan × month, collection receipt — around shared branch, product, date, stage and customer dimensions." },
  ],

  workflow: {
    text: "The 16 lifecycle stages ONE DASH covers, from first contact to closure.",
    steps: [
      { t: "Lead", d: "prospect captured" },
      { t: "Application", d: "application logged in" },
      { t: "KYC", d: "identity and address verified" },
      { t: "Credit Bureau", d: "bureau report pulled and checked" },
      { t: "Credit Assessment", d: "income, obligations and policy assessed" },
      { t: "Field Investigation", d: "residence / business verification" },
      { t: "Collateral", d: "vehicle / asset valuation and checks" },
      { t: "Credit Decision", d: "approved, rejected or pending" },
      { t: "Documentation", d: "agreement and pre-disbursal documents" },
      { t: "Disbursement", d: "loan amount paid out" },
      { t: "Loan", d: "active loan on the book" },
      { t: "Repayment", d: "EMIs paid on time" },
      { t: "Collection", d: "overdue EMIs followed up" },
      { t: "Delinquency", d: "DPD buckets; NPA at 90+ DPD" },
      { t: "Legal", d: "legal action on serious delinquency" },
      { t: "Resolution / Closure", d: "loan closed, settled or resolved" },
    ],
  },
  architecture: {
    text: "Layered view. Source details and refresh scheduling are Representative / Demo Workflow.",
    lanes: [
      { lane: "Sources", nodes: [{ t: "Lead & application data" }, { t: "Credit & operations stages" }, { t: "Loans, repayment & collections" }, { t: "Legal & closure" }] },
      { lane: "SQL layer", nodes: [{ t: "Stage events", d: "timestamps per application per stage", key: true }, { t: "Monthly loan snapshot", d: "POS, DPD, bucket" }, { t: "Collections", d: "demand vs collected" }] },
      { lane: "Checks", nodes: [{ t: "SQL reconciliation", d: "before each refresh", key: true }] },
      { lane: "Data model", nodes: [{ t: "Facts", d: "stage · loan-month · collection", db: true }, { t: "Dimensions", d: "branch · product · date · stage · customer", db: true }] },
      { lane: "Power BI", nodes: [{ t: "Measures", d: "each KPI defined once" }, { t: "10 report pages", d: "executive to lifecycle", key: true }, { t: "Drill-down", d: "company → loan" }] },
      { lane: "Users", nodes: [{ t: "Management" }, { t: "Functional teams", d: "representative" }] },
    ],
  },
  model: {
    text: "An illustrative star schema. Three facts at different grains share the same dimensions, so every slicer filters every page and drill-down behaves the same everywhere.",
    entities: [
      { name: "fact_application_stage", fields: [["app_stage_id", "pk"], ["application_id"], ["stage_key", "fk"], ["branch_key", "fk"], ["product_key", "fk"], ["customer_key", "fk"], ["date_key", "fk"], ["entered_at"], ["completed_at"], ["stage_status"]] },
      { name: "fact_loan_month", fields: [["loan_month_id", "pk"], ["loan_id"], ["application_id"], ["date_key", "fk"], ["branch_key", "fk"], ["product_key", "fk"], ["customer_key", "fk"], ["pos_amount"], ["emi_due"], ["dpd"], ["dpd_bucket"], ["legal_flag"], ["closure_type"]] },
      { name: "fact_collection", fields: [["receipt_id", "pk"], ["loan_id"], ["date_key", "fk"], ["branch_key", "fk"], ["demand_month"], ["amount"]] },
      { name: "dim_branch", fields: [["branch_key", "pk"], ["branch_code"], ["region"], ["company"]] },
      { name: "dim_product", fields: [["product_key", "pk"], ["product_name"], ["product_group"]] },
      { name: "dim_date", fields: [["date_key", "pk"], ["calendar_date"], ["month"], ["fin_year"]] },
      { name: "dim_stage", fields: [["stage_key", "pk"], ["stage_name"], ["stage_order"], ["phase"]] },
      { name: "dim_customer", fields: [["customer_key", "pk"], ["customer_id (masked)"], ["segment"]] },
    ],
    note: "Illustrative design. Table and column names are representative; no production schema is shown.",
  },

  sql: {
    title: "Stage timestamps → stage-to-stage TAT",
    text: "Representative Oracle SQL on the illustrative schema. One row per application per stage becomes the TAT page: days between consecutive completed stages for a defined cohort, with average, median and 90th percentile.",
    code: `-- Representative Oracle SQL on a synthetic schema — not production code
WITH cohort AS (                 -- applications disbursed in the reporting month
  SELECT f.application_id
    FROM fact_application_stage f
    JOIN dim_stage s ON s.stage_key = f.stage_key
   WHERE s.stage_name = 'Disbursement'
     AND f.stage_status = 'CLEARED'
     AND f.completed_at >= TRUNC(:report_month, 'MM')
     AND f.completed_at <  ADD_MONTHS(TRUNC(:report_month, 'MM'), 1)
),
stage_done AS (                  -- last completion per application and stage (handles rework)
  SELECT f.application_id, s.stage_order, s.stage_name,
         MAX(CAST(f.completed_at AS DATE)) AS done_at
    FROM fact_application_stage f
    JOIN dim_stage s ON s.stage_key = f.stage_key
    JOIN cohort c    ON c.application_id = f.application_id
   WHERE f.stage_status = 'CLEARED'
   GROUP BY f.application_id, s.stage_order, s.stage_name
),
steps AS (                       -- days since the previous completed stage
  SELECT application_id, stage_order, stage_name,
         LAG(stage_name) OVER (PARTITION BY application_id ORDER BY stage_order) AS from_stage,
         done_at - LAG(done_at) OVER (PARTITION BY application_id ORDER BY stage_order) AS days_taken
    FROM stage_done
)
SELECT from_stage || ' -> ' || stage_name                                  AS step,
       COUNT(*)                                                           AS cases,
       ROUND(AVG(days_taken), 1)                                          AS avg_days,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_taken), 1)  AS median_days,
       ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY days_taken), 1)  AS p90_days
  FROM steps
 WHERE from_stage IS NOT NULL
 GROUP BY from_stage, stage_name, stage_order
 ORDER BY stage_order;`,
    points: [
      "One fact at application × stage grain feeds the funnel, conversion and TAT pages.",
      "Cohort first (applications disbursed in the month), then measure — every TAT figure refers to the same set of cases.",
      "MAX(completed_at) per stage handles rework; LAG over stage order measures each step, and a skipped stage simply links to the previous completed one.",
      "CAST to DATE makes the subtraction return days; percentiles sit beside the average because a few stuck cases pull it up.",
    ],
  },
  python: {
    title: "Analytics layer — reconciliation checks before refresh",
    lang: "sql",
    label: "SQL · representative reconciliation checks on an illustrative schema",
    text: "The analytics in ONE DASH live in SQL and Power BI: the data layer is SQL and the KPIs are Power BI measures on the lifecycle data model. Before the pages are refreshed, reconciliation queries like these confirm that the numbers agree across stages and levels (Representative / Demo Workflow).",
    code: `-- Representative reconciliation checks (illustrative schema). Each query returns rows
-- only when something does not reconcile; the refresh is held until all return nothing.

-- 1) The funnel never increases from one stage to the next
SELECT stage_order, stage_count, prev_stage_count
  FROM (SELECT stage_order, COUNT(DISTINCT application_id) AS stage_count,
               LAG(COUNT(DISTINCT application_id)) OVER (ORDER BY stage_order) AS prev_stage_count
          FROM f_stage_event
         WHERE report_month = :report_month
         GROUP BY stage_order)
 WHERE stage_count > prev_stage_count;

-- 2) Decisions stay within assessed cases; disbursals within approvals
SELECT branch_id, assessed, approved, rejected, disbursed
  FROM v_decision_by_branch
 WHERE report_month = :report_month
   AND (approved + rejected > assessed OR disbursed > approved);

-- 3) DPD buckets add up to active loans, and branches add up to the company
SELECT 'buckets' AS check_name, active_loans, b0 + b1_30 + b31_60 + b61_90 + b90p AS bucket_total
  FROM v_book_summary
 WHERE snapshot_month = :report_month
   AND active_loans <> b0 + b1_30 + b31_60 + b61_90 + b90p
UNION ALL
SELECT 'branches', c.active_loans, SUM(b.active_loans)
  FROM v_book_summary c
  JOIN v_book_by_branch b ON b.snapshot_month = c.snapshot_month
 WHERE c.snapshot_month = :report_month
 GROUP BY c.active_loans
HAVING SUM(b.active_loans) <> c.active_loans;`,
    points: [
      "Every check is a query that should return nothing; any row is a reason to hold the refresh.",
      "The same definitions feed the Power BI measures, so pages cannot disagree with each other.",
      "The logic lives in SQL and Power BI measures, so there is one place to change a definition.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Not a modelling project. The business logic is in the KPI definitions — each defined once and reused on every page — and in the stage and bucket rules below.",
    points: [
      "Ratios are measures (sum of numerator ÷ sum of denominator), so they stay correct at company, region, branch or product level — never an average of branch ratios.",
      "Origination stages are a cohort (applications in the month by the furthest stage cleared); servicing stages are a month-end snapshot of the book.",
      "TAT is measured between the completed timestamps of consecutive stages.",
    ],
    rules: [
      { rule: "Stage conversion", condition: "Count clearing a stage ÷ count clearing the previous stage", outcome: "Conversion %" },
      { rule: "Approval rate", condition: "Approved ÷ applications assessed (entered credit assessment)", outcome: "Approval %" },
      { rule: "Rejected / dropped", condition: "Assessed − approved − pending, grouped by the stage where the case left", outcome: "Count by reason" },
      { rule: "DPD bucket", condition: "DPD 0 → Current; 1–30; 31–60; 61–90; 90+ → NPA", outcome: "Bucket per loan per month" },
      { rule: "GNPA % (accounts)", condition: "Loans at 90+ DPD ÷ active loans at month-end", outcome: "NPA %" },
      { rule: "Collection efficiency", condition: "Collected against the month’s EMI demand ÷ that demand", outcome: "Efficiency %" },
      { rule: "TAT", condition: "Completed time of a stage − completed time of the previous stage", outcome: "Days per step" },
    ],
    rulesNote: "Representative KPI definitions for the demo — not production logic.",
  },
  dashboard: {
    text: "The Executive Overview page. Nine more pages cover each lifecycle area; all ten are in the screenshots, together with the lifecycle diagram and the drill-down path. All figures are demo data.",
    visual: "od-executive",
    outputs: [
      "Ten report pages: Executive, Application funnel, Credit decision, Disbursement, Portfolio, Collection, Delinquency, Branch performance, TAT and Lifecycle analysis",
      "KPIs for all 16 lifecycle stages",
      "Slicers for month, region, product and branch",
      "Drill-down from company to region, branch, product, application, customer and loan",
    ],
  },
  insights: {
    note: "Patterns illustrated with the synthetic demo data. They describe what a lifecycle view surfaces; no company results are shown.",
    items: [
      "In the demo data the largest drop is before login — fewer than half of leads become applications. Inside the credit process, credit assessment loses the most cases.",
      "Turnaround in the demo data is spent mostly in field investigation and credit assessment, the two steps with the longest average days.",
      "Rankings change with the metric: in the demo data the branch with the most disbursals also has the highest 30+ DPD — which is why branch performance shows both side by side.",
      "A lifecycle model makes cross-stage questions cheap: conversion, TAT and delinquency for the same branch or product come from one model instead of three reports.",
    ],
  },
  impact: {
    before: ["Each team reported its own stage", "Different definitions and cut-offs across reports", "Cross-stage questions answered by joining reports by hand"],
    solution: ["Lifecycle data model", "SQL data layer with reconciliation checks", "KPIs defined once for 16 stages", "Ten Power BI pages with drill-down to the loan"],
    after: ["One view from lead to closure", "Numbers that reconcile across pages", "Conversion, TAT and portfolio health for any region, branch or product"],
    items: [
      "A single source for lifecycle reporting across functions.",
      "Consistent KPI definitions from origination to recovery.",
      "Drop-offs and delays visible by stage, branch and product.",
      "Portfolio, collection and delinquency health tracked next to the origination funnel.",
    ],
  },
  challenges: [
    "Mixing a cohort (applications in the month) with a snapshot (the book at month-end) — kept as two clearly labelled halves that meet at disbursement.",
    "Rework and skipped stages in the stage history — last completion per stage, and TAT measured between completed stages.",
    "Ratios that stay right at every drill level — measures built from summed numerators and denominators.",
    "Trust in the numbers — reconciliation checks before data is published (Representative / Demo Workflow).",
    "Responsiveness at loan-level detail — pages read aggregated data; loan-level rows sit only at the end of the drill path (Representative / Demo Workflow).",
  ],
  learnings: [
    "The data model is the product: once stages, loans and collections share dimensions, each new page is mostly layout.",
    "Define a KPI once. Most disagreements between reports are definition differences, not data errors.",
    "Reconciliation rules — funnel order, buckets equal to the book — are the quickest way to catch a broken load.",
    "Leaders want the top line and analysts want the loan; drill-down serves both from one report.",
  ],
  screenshots: ["od-executive", "od-lifecycle", "od-funnel", "od-credit", "od-disbursement", "od-portfolio", "od-collection", "od-delinquency", "od-branch", "od-tat", "od-stages", "od-drill"],
  future: [
    "Row-level security so each region or branch sees its own data.",
    "Alerts when a stage’s conversion or TAT moves outside its normal range.",
    "Vintage curves: delinquency by disbursal month.",
    "Data-freshness and validation status shown on every page.",
    "Business-rule and early-warning outcomes added as layers on the same lifecycle model.",
  ],

  interview: {
    s30: "ONE DASH is a Power BI platform I designed and built end to end to show the whole NBFC lending lifecycle on one dashboard — sixteen stages from lead, application, KYC and credit through disbursement, repayment and collections to delinquency, legal and closure. I built the data model and the SQL data layer, defined each KPI once, and built ten report pages with drill-down from company to region, branch, product, application, customer and loan.",
    s90: "In an NBFC every team reports its own part of the lifecycle. Sourcing counts leads, credit counts approvals, operations counts disbursals and collections tracks DPD buckets, each with its own definitions, so the numbers rarely line up and any question that crosses stages needs a manual join. ONE DASH puts the whole application-to-loan lifecycle on one dashboard, and I designed and built it end to end. The base is a lifecycle data model: a stage-event fact with one row per application per stage and its timestamps, a monthly loan snapshot for balances and DPD, and a collections fact, all sharing branch, product, date, stage and customer dimensions. The SQL data layer builds these tables and checks that they reconcile — the funnel never increases, decisions stay within assessed cases, DPD buckets add up to active loans and branches add up to the company. In Power BI each KPI is defined once as a measure and reused across ten pages: executive overview, application funnel, credit decision, disbursement, portfolio, collection, delinquency, branch performance, turnaround time and a sixteen-stage lifecycle analysis. Users can drill from company to region, branch, product, application, customer and a single loan. The result is one consistent view of where volume is lost, where time is spent and how the book is performing.",
    role: ["Designed and built the platform end to end", "Lifecycle data model", "SQL data layer with reconciliation checks", "KPI definitions for all 16 stages", "Ten Power BI pages with drill-down to the loan"],
    tech: ["Power BI", "SQL", "Data modelling"],
    impact: ["One view from lead to closure", "Consistent KPI definitions", "Drop-offs and delays visible by stage", "Portfolio health next to origination"],
    challenges: ["Cohort vs snapshot counts", "Rework and skipped stages in TAT", "Ratios correct at every drill level", "Reconciliation before publishing"],
    questions: [
      { q: "Walk me through the data model.", a: ["Three facts at different grains: application × stage (stage events with timestamps), loan × month (POS, EMI due, DPD, bucket, flags) and collection receipts.", "Shared dimensions: branch (rolling up to region and company), product, date, stage (with order and phase) and customer.", "Because every fact uses the same dimensions, one slicer filters every page and drill-down works the same way everywhere.", "Table names in the case study are illustrative."] },
      { q: "How do you calculate stage-to-stage TAT?", a: ["Define the cohort first — for example applications disbursed in the month.", "Take the last completed timestamp per application per stage, which handles rework.", "LAG over stage order gives the previous completed stage; the difference is the days for that step. A skipped stage just links to the previous completed one.", "Report average, median and P90 — a few stuck cases distort the average."] },
      { q: "How do you know the dashboard numbers are right?", a: ["Reconciliation checks run before publishing: funnel counts never increase, approved + rejected ≤ assessed, disbursed ≤ approved, DPD buckets = active loans, branches = regions = company, opening + new − closed = closing.", "If a check fails, the published data is not replaced and the run is logged (Representative / Demo Workflow).", "Each KPI is defined once, so two pages cannot disagree on a definition."] },
      { q: "Why build ratios as measures rather than averaging them?", a: ["A ratio must be recalculated at each level: a region’s approval rate is total approved ÷ total assessed, not the average of its branches’ rates.", "A measure computes numerator and denominator in the current filter context, so one definition is correct at company, region, branch or product level.", "Averaging branch ratios over-weights small branches."] },
      { q: "The lifecycle mixes applications and loans. How do you keep it consistent?", a: ["Stages 1–10 (lead to disbursement) are a cohort: the month’s applications, counted by the furthest stage cleared.", "Stages 11–16 (loan to closure) are a month-end snapshot of the book.", "They meet at disbursement: new loans in the month equal disbursals, and opening + new − closed = closing."] },
      { q: "How does the drill-down from company to a single loan work?", a: ["A Company → Region → Branch → Product hierarchy drives the summary pages.", "From a branch and product the user moves to its applications, then to a customer and a loan, which are detail views on the same model.", "Summary pages read aggregated data; loan-level detail appears only at the end of the path, which keeps the report responsive."] },
      { q: "How are DPD buckets and NPA defined?", a: ["DPD is days past due on the oldest unpaid EMI at month-end.", "Buckets: Current (0), 1–30, 31–60, 61–90 and 90+; 90+ DPD is NPA under the 90-day norm.", "GNPA % on the dashboard is by accounts (90+ loans ÷ active loans); the same measure can be built on POS."] },
      { q: "How do you make sure the pages agree with each other?", a: ["Each KPI is defined once — as SQL in the data layer and as one Power BI measure — and reused on every page.", "Before a refresh, SQL reconciliation checks confirm the funnel never increases, decisions stay within assessed cases, DPD buckets add up to active loans and branches add up to the company.", "Keeping preparation in SQL keeps the Power BI model simple and fast."] },
      { q: "What would you add next?", a: ["Row-level security by region and branch.", "Alerts on stage conversion and TAT.", "Vintage curves — delinquency by disbursal month.", "Business-rule and early-warning outcomes layered onto the same lifecycle model."] },
    ],
  },
});
