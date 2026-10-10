/* Case study — Early Warning System (SK Finance, professional)
   Schema v2 (see _TEMPLATE.js). Portfolio monitoring and early credit-risk detection.
   Rules, weights and every number in the visuals are illustrative / synthetic. Code is representative. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "ews",
  order: 3,
  company: "sk",
  kind: "professional",
  title: "Early Warning System (EWS)",
  short: "Early warning system",
  domain: "Credit Risk / Portfolio Monitoring",
  domains: ["NBFC", "Risk", "Credit", "BI", "Automation"],
  techTags: ["Oracle", "SQL", "Python", "Pandas", "Power BI", "Zoho Analytics"],
  tech: ["Oracle", "SQL / PL-SQL", "Python", "Pandas", "Power BI / Zoho Analytics"],
  thumb: "ews-trend",
  problem: "Spot loan accounts showing early signs of stress before they roll into higher DPD buckets or default.",

  summary: {
    problem: "By the time an account is 60 or 90 days past due, recovery is harder and costlier. Risk and collections teams needed warning earlier.",
    solution: "Risk indicators built from DPD and repayment behaviour, combined through business rules into a Low / Medium / High risk segment and a ranked alert list, with a monitoring dashboard on top.",
    contribution: "Data extraction, SQL analysis, business-rule implementation, data validation, Python processing, reporting and the dashboard.",
    outcome: "A ranked list of at-risk accounts with the reason for each flag, so collections and risk teams can act before accounts roll forward.", // VERIFY
  },
  users: "Risk and collections teams, with branch-level views for regional follow-up.",
  process: "Loan portfolio monitoring and early delinquency management — acting on accounts while they are still current or only slightly overdue.",
  overviewNote: "All dashboards use synthetic accounts and dummy identifiers. Rules and weights shown are illustrative.",

  problemText: [
    "In lending, delinquency usually builds gradually: a bounced EMI, a partial payment, a cancelled auto-debit mandate, then a missed instalment. Each signal on its own is weak; together they are an early warning.",
    "RBI’s SMA framework classifies overdue accounts as SMA-0 (1–30 days), SMA-1 (31–60) and SMA-2 (61–90) before they become NPAs at 90+ days. An EWS aims to act while accounts are still current or in SMA-0, when a call or a revised payment date can still cure them.",
  ],
  problemPoints: [
    "Which accounts are likely to roll into a worse bucket next month?",
    "Why is each one flagged — what should the collections officer say?",
    "Is risk rising in a particular product, branch or bucket?",
  ],
  objective: "Flag current and early-delinquent accounts whose behaviour suggests rising default risk, explain why each one is flagged, and track the portfolio’s risk trend by bucket, product and branch.",
  objectives: [
    "Monitor every live loan each cycle on DPD and repayment behaviour.",
    "Turn indicators into a Low / Medium / High risk segment with rules agreed with the risk team.",
    "Give collections a ranked alert list with the reason for each flag.",
    "Show portfolio risk by DPD bucket, branch, product and trend in one dashboard.",
  ],
  role: [
    "Data extraction from Oracle: loan, customer and repayment tables.",
    "SQL analysis of repayment behaviour and DPD movement.",
    "Implemented the business rules that turn indicators into risk segments.",
    "Validated the data and the alert counts before every release.",
    "Python processing to assemble indicators, scores and the alert file.",
    "Reporting and dashboard development in Power BI / Zoho Analytics.",
  ],

  data: {
    text: "A monthly snapshot of every live loan joined to its repayment history and customer data. The demo uses synthetic accounts with the same structure.",
    sources: [
      { name: "Loan master", grain: "1 row per loan", fields: "product, branch, disbursal date, EMI, tenure, outstanding, status (active / closed / restructured / written-off)" },
      { name: "Repayment / receipts", grain: "loan × instalment", fields: "due date, amount due, amount paid, payment date, mode, bounce flag" },
      { name: "DPD snapshot", grain: "loan × month-end", fields: "DPD, bucket" },
      { name: "Mandate status", grain: "1 row per loan", fields: "NACH active / cancelled" },
      { name: "Customer", grain: "1 row per customer", fields: "segment, other active loans" },
    ],
    processing: [
      "Live loans selected each cycle; closed and written-off loans excluded, restructured loans tagged.",
      "Indicators computed in SQL over a fixed 3-month look-back; bucket movement from the last two month-end DPD snapshots with LAG().",
      "Rules, scoring, segmentation and run-over-run checks applied in Python (Pandas).",
      "Outputs written as a ranked alert file and a dashboard extract for Power BI / Zoho Analytics.",
    ],
    validation: [
      "Live-loan count and total outstanding reconciled to the month-end portfolio report.",
      "DPD recalculated from the instalment schedule and compared with the system DPD on a sample.",
      "Alert counts compared with the previous run; large swings investigated before release.",
      "Closed and written-off loans excluded; restructured loans tagged separately.",
    ],
  },
  techUse: [
    { t: "Oracle", use: "Source of loan, instalment, DPD snapshot, mandate and customer data." },
    { t: "SQL / PL-SQL", use: "Indicator and DPD-movement queries close to the data, re-runnable for any cycle through a run-date bind variable." },
    { t: "Python", use: "Rule configuration, scoring, segmentation, validation checks and output files in one job." },
    { t: "Pandas", use: "Applying rules to the indicator table, ranking accounts and comparing with the previous run." },
    { t: "Power BI / Zoho Analytics", use: "EWS dashboard: portfolio risk summary, DPD buckets, alert trend, branch comparison, roll rates." },
  ],

  workflow: {
    text: "From loan data to an alert someone acts on, every monitoring cycle.",
    steps: [
      { t: "Loan Data", d: "live loans, instalments, receipts and mandate status from Oracle" },
      { t: "DPD / Behaviour", d: "DPD bucket and movement, EMI bounces, partial payments, payment ratio" },
      { t: "Rules", d: "weighted business rules agreed with the risk team" },
      { t: "Risk Segmentation", d: "rule score → Low / Medium / High" },
      { t: "Alert", d: "ranked list with the main trigger for each account" },
      { t: "Monitoring", d: "dashboard: buckets, trend, branches, roll rates, loan status" },
    ],
  },
  architecture: {
    text: "Analytical flow from Oracle to the risk and collections teams.",
    lanes: [
      { lane: "Sources", nodes: [{ t: "Oracle", d: "loan master, instalments, DPD snapshots, mandates, customers", key: true, db: true }] },
      { lane: "Indicators", nodes: [{ t: "SQL / PL-SQL", d: "3-month look-back, LAG() bucket movement", key: true }, { t: "Data checks", d: "live base and outstanding reconciled" }] },
      { lane: "Rules", nodes: [{ t: "Python + Pandas", d: "rules → score → risk segment", key: true }, { t: "Run-over-run check", d: "alert counts vs previous cycle" }] },
      { lane: "Outputs", nodes: [{ t: "Alert list", d: "ranked, with main trigger" }, { t: "Dashboard extract" }] },
      { lane: "BI", nodes: [{ t: "Power BI / Zoho Analytics", d: "EWS dashboard" }] },
      { lane: "Users", nodes: [{ t: "Risk team" }, { t: "Collections team" }] },
    ],
  },
  model: {
    text: "Loan-level monitoring mart refreshed each cycle.",
    entities: [
      { name: "loan_master", fields: [["loan_id", "pk"], ["customer_id", "fk"], ["branch_code"], ["product"], ["emi_amount"], ["status"]] },
      { name: "instalment", fields: [["loan_id", "fk"], ["inst_no"], ["due_date"], ["amount_due"], ["amount_paid"], ["paid_date"], ["bounce_flag"]] },
      { name: "dpd_snapshot", fields: [["loan_id", "fk"], ["snap_month"], ["dpd"], ["bucket"], ["bucket_no"]] },
      { name: "mandate", fields: [["loan_id", "fk"], ["status"], ["status_date"]] },
      { name: "ews_indicator", fields: [["loan_id", "fk"], ["run_date"], ["bounce_3m"], ["partial_3m"], ["roll_flag"], ["pay_ratio_3m"], ["mandate_cancel"]] },
      { name: "ews_alert", fields: [["alert_id", "pk"], ["loan_id", "fk"], ["run_date"], ["score"], ["segment"], ["main_trigger"]] },
    ],
    note: "Synthetic schema for illustration. Table and column names are not from any employer system.",
  },

  sql: {
    title: "Indicators from repayment behaviour",
    text: "Each indicator is a column computed over a fixed look-back window. Analytic functions compare this month’s DPD bucket with last month’s. Representative code on a synthetic schema.",
    code: `-- Representative Oracle SQL on a synthetic schema — not production code
WITH last3 AS (
  SELECT i.loan_id,
         SUM(CASE WHEN i.bounce_flag = 'Y' THEN 1 ELSE 0 END)              AS bounce_3m,
         SUM(CASE WHEN i.amount_paid > 0
                   AND i.amount_paid < i.amount_due THEN 1 ELSE 0 END)     AS partial_3m,
         ROUND(SUM(i.amount_paid) / NULLIF(SUM(i.amount_due), 0), 2)       AS pay_ratio_3m
    FROM instalment i
   WHERE i.due_date >  ADD_MONTHS(:run_date, -3)
     AND i.due_date <= :run_date
   GROUP BY i.loan_id
),
dpd_move AS (
  SELECT loan_id, dpd, bucket, bucket_no,          -- bucket_no: 0 current … 4 NPA
         LAG(bucket_no) OVER (PARTITION BY loan_id ORDER BY snap_month) AS prev_bucket_no
    FROM dpd_snapshot
   WHERE snap_month IN (TRUNC(ADD_MONTHS(:run_date, -1), 'MM'), TRUNC(:run_date, 'MM'))
)
SELECT l.loan_id, l.branch_code, l.product, l.status, d.dpd, d.bucket,
       NVL(t.bounce_3m, 0)  AS bounce_3m,
       NVL(t.partial_3m, 0) AS partial_3m,
       t.pay_ratio_3m,
       CASE WHEN d.bucket_no > d.prev_bucket_no THEN 1 ELSE 0 END AS roll_flag,
       CASE WHEN m.status = 'CANCELLED' THEN 1 ELSE 0 END  AS mandate_cancel
  FROM loan_master l
  JOIN dpd_move d    ON d.loan_id = l.loan_id AND d.prev_bucket_no IS NOT NULL
  LEFT JOIN last3 t  ON t.loan_id = l.loan_id
  LEFT JOIN mandate m ON m.loan_id = l.loan_id
 WHERE l.status IN ('ACTIVE', 'RESTRUCTURED');    -- closed and written-off loans excluded`,
    points: [
      "LAG() over the DPD snapshot gives month-on-month bucket movement without a self-join.",
      "The bind variable :run_date makes the same SQL re-runnable for any cycle — and for back-testing.",
      "Restructured loans stay in the run with their status, so they can be reported separately.",
    ],
  },
  python: {
    title: "Rules → score → risk segment → alert file",
    text: "Pandas applies weighted business rules, ranks accounts and writes the alert file and dashboard extract. Representative, simplified code.",
    code: `import pandas as pd

# Illustrative weights — not actual company rules
RULES = {
    "bounce_2_of_3":   (lambda d: d.bounce_3m >= 2,        30),
    "dpd_rolled":      (lambda d: d.roll_flag == 1,         25),
    "low_pay_ratio":   (lambda d: d.pay_ratio_3m < 0.80,    20),
    "partial_streak":  (lambda d: d.partial_3m >= 3,        15),
    "mandate_cancel":  (lambda d: d.mandate_cancel == 1,    10),
}

ind = pd.read_sql(INDICATOR_SQL, engine, params={"run_date": run_date})
for name, (rule, weight) in RULES.items():
    ind[name] = rule(ind).astype(int) * weight

ind["ews_score"] = ind[list(RULES)].sum(axis=1)
ind["segment"] = pd.cut(ind.ews_score, [-1, 24, 49, 100], labels=["Low", "Medium", "High"])
ind["main_trigger"] = ind[list(RULES)].idxmax(axis=1).where(ind.ews_score > 0)

# validation before release
assert ind.loan_id.is_unique
prev = pd.read_parquet("alerts_prev.parquet")
change = ind.segment.eq("High").sum() / max(1, prev.segment.eq("High").sum()) - 1
if abs(change) > 0.25:
    log.warning("High-segment count moved %.0f%% vs last run — review before release", change * 100)

alerts = ind[ind.segment.isin(["High", "Medium"])].sort_values("ews_score", ascending=False)
alerts.to_excel(f"EWS_alerts_{run_date:%Y%m%d}.xlsx", index=False)`,
    points: [
      "Rules are data (name, condition, weight), so the business can review and tune them.",
      "The main trigger — the highest-weighted rule that fired — is stored with every alert: the ‘why’ the collections officer needs.",
      "A run-over-run check stops a broken extract from silently changing the alert list.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "The EWS is rule-based by design: the business needed transparent, agreed triggers it could act on immediately. Each rule adds points; the total sets the risk segment, and the highest-weighted rule that fired becomes the main trigger shown to collections.",
    points: [
      "Rules need no labelled history to start, and every flag is explainable.",
      "Rule weights and segment cut-offs were tuned so the High segment stayed small enough to work.",
      "Restructured accounts are monitored but reported separately; closed and written-off loans are excluded.",
      "A probability-of-default model is the natural next step once alert outcomes build labelled history (the personal ML project shows the approach).",
    ],
    rules: [
      { rule: "EMI bounces", condition: "2 or more bounced EMIs in the last 3", outcome: "+30 points" },
      { rule: "Bucket roll", condition: "DPD bucket worse than at the last month-end", outcome: "+25 points" },
      { rule: "Low payment ratio", condition: "Paid ÷ due over the last 3 months below 0.80", outcome: "+20 points" },
      { rule: "Partial-payment streak", condition: "Partial payment in each of the last 3 months", outcome: "+15 points" },
      { rule: "Mandate cancelled", condition: "NACH auto-debit mandate cancelled", outcome: "+10 points" },
      { rule: "Risk segment", condition: "Score 0–24 · 25–49 · 50 and above", outcome: "Low · Medium · High" },
    ],
    rulesNote: "Illustrative portfolio demonstration — not actual company rules.",
  },
  dashboard: {
    text: "The monthly EWS view used by risk and collections.",
    visual: "ews-dashboard",
    outputs: [
      "Ranked alert list (High and Medium) with the main trigger for each account.",
      "High-risk customer list with a suggested next action.",
      "Portfolio risk summary: DPD buckets, 30+ DPD trend and accounts by risk segment.",
      "Branch risk comparison and roll-rate matrix.",
      "Loan status view: which accounts are monitored, tagged or excluded.",
    ],
  },
  insights: {
    note: "Patterns illustrated with synthetic data. They describe what this kind of monitoring surfaces; no company results are shown.",
    items: [
      "Repeated EMI bounces and a drop in payment ratio typically appear a cycle or two before an account rolls into a worse bucket — that lead time is the value of an EWS.",
      "Roll rates out of SMA-0 show where a phone call still works; once an account is in SMA-2 the cure rate falls sharply.",
      "Branch-level flag rates differ widely, so a single portfolio number hides where attention is needed.",
      "A rising count of High-segment alerts can lead the 30+ DPD ratio, which moves only once accounts have already slipped.",
    ],
  },
  impact: {
    before: ["Stress noticed only once accounts reached 60 or 90 DPD", "Signals such as bounces and partial payments seen one at a time", "No single view of where portfolio risk was building"],
    solution: ["Oracle SQL indicators from DPD and repayment behaviour", "Weighted business rules and validation in Python", "Ranked alert list with the main trigger", "Power BI / Zoho Analytics dashboard"],
    after: ["Accounts flagged while still current or in SMA-0", "Every alert explained by its trigger", "Risk trend visible by bucket, branch and product"],
    items: [
      "Collections attention focused on accounts most likely to roll.",
      "Each alert explained by its trigger, so action can start immediately.",
      "Portfolio risk trend visible by bucket, product and branch.",
    ],
  },
  challenges: [
    "Payment dates and DPD in source systems did not always agree; DPD was recomputed from the schedule for checks.",
    "Too many alerts make the list useless — rule weights and segment cut-offs were tuned so the High segment stayed workable.",
    "Restructured and moratorium accounts needed separate handling so they were not flagged by mistake.",
  ],
  learnings: [
    "An alert without a reason does not get actioned.",
    "Validating counts against the previous run catches more errors than any unit test.",
    "Branch and product splits tell you where to act; a single portfolio ratio does not.",
  ],
  screenshots: ["ews-dashboard", "ews-portfolio", "ews-dpd", "ews-highrisk", "ews-branch", "ews-trend", "ews-table", "ews-status", "ews-roll"],
  future: [
    "Feed alert outcomes (paid, promise-to-pay, rolled) back into rule weights each quarter.",
    "Track each rule’s hit rate against next-month roll as a standing dashboard page.",
    "A probability-of-default model trained on alert outcomes, run alongside the rules as a challenger.",
    "Automated distribution of each branch’s alert list to its owner.",
  ],

  interview: {
    s30: "I built an early warning system that flags loan accounts showing early signs of delinquency before they roll into higher DPD buckets. Oracle SQL builds indicators from the last three months: bounced EMIs, partial payments, payment ratio, bucket movement and cancelled mandates. Python applies weighted business rules, assigns a Low, Medium or High segment and stores the main trigger, and a Power BI or Zoho dashboard tracks buckets, trends and branches.",
    s90: "The business problem was timing: by the time a loan reached sixty or ninety days past due, recovery was much harder. I built an early warning system that looks for stress while accounts are still current or only slightly overdue. Each cycle I extract live loans, instalments, DPD snapshots and mandate status from Oracle. In SQL I create indicators over the last three months: bounced EMIs, partial payments, payment ratio, movement between DPD buckets using LAG, and cancelled auto-debit mandates. Closed and written-off loans are excluded and restructured loans are tagged, so they are not flagged by mistake. In Python I apply weighted business rules agreed with the risk team, add up a score, assign a Low, Medium or High segment, and store the main trigger with every alert, so collections knows exactly why an account is flagged and what to say. Before each release I reconcile the live base and outstanding to the month-end portfolio report, recompute DPD on a sample and compare alert counts with the previous run. The outputs are a ranked alert list, a high-risk customer list, and a Power BI or Zoho dashboard showing DPD buckets, roll rates, the alert trend, branch comparison and loan status. It is portfolio monitoring for credit risk, focused on acting early.",
    role: ["Extracted loan, repayment and customer data from Oracle", "Built indicators and DPD movement in SQL", "Implemented business rules and validation in Python", "Built the reporting and dashboard"],
    tech: ["Oracle", "SQL / PL-SQL", "Python", "Pandas", "Power BI / Zoho Analytics"],
    impact: ["Collections focused on accounts most likely to roll", "Every alert explained by its trigger", "Risk trend by bucket, branch and product"],
    challenges: ["DPD mismatches between systems", "Restructured and moratorium accounts", "Keeping the High segment small enough to work", "Catching broken extracts before release"],
    questions: [
      { q: "How did your EWS identify risky customers?", a: ["Indicators from recent repayment behaviour: bounces in the last three EMIs, partial payments, payment ratio, DPD bucket movement and mandate cancellation.", "Business rules with agreed weights turn the indicators into a score; the score maps to Low / Medium / High.", "Every alert carries its main trigger so the collections team knows why it was flagged."] },
      { q: "Why rules and not a machine-learning model?", a: ["The business needed triggers it could see, agree with and act on from day one.", "Rules need no labelled history to start and are easy to audit.", "Outcome data collected from the alerts is exactly what a later PD model would be trained on."] },
      { q: "Why is recall important in an early warning system?", a: ["A missed risky account (false negative) can become a credit loss; an extra flagged account (false positive) costs one phone call.", "So the system is tuned to catch most accounts that will roll, while keeping the High segment small enough to work."] },
      { q: "How did you validate the alerts?", a: ["Reconciled the live base and outstanding to the month-end report.", "Recomputed DPD from the instalment schedule on samples.", "Compared alert counts with the previous run and investigated big swings.", "Back-tested: checked how many flagged accounts actually rolled the following month."] },
      { q: "What are SMA-0, SMA-1 and SMA-2?", a: ["RBI’s Special Mention Account categories for overdue accounts: 1–30, 31–60 and 61–90 days past due.", "Beyond 90 days past due the account is classified as an NPA."] },
      { q: "What is a roll rate?", a: ["The share of accounts that move from one DPD bucket to another between two month-ends.", "Forward roll rates show deterioration; backward (cure) rates show collections effectiveness."] },
      { q: "How did you handle restructured and closed loans?", a: ["Closed and written-off loans are excluded from the run — there is nothing left to warn about.", "Restructured loans are monitored on their revised schedule but tagged and reported separately, so the change in schedule does not trigger false alerts."] },
      { q: "Why Python as well as SQL?", a: ["SQL is best for pulling and aggregating large tables close to the data.", "Python is better for rule configuration, ranking, run-over-run checks and writing formatted outputs and dashboard extracts in one automated job."] },
      { q: "How is this different from AML monitoring?", a: ["The EWS manages credit risk: will this borrower fail to pay? Its signals are DPD and repayment behaviour, and its users are risk and collections.", "AML monitoring manages financial-crime risk: does the money pattern look suspicious? It runs different rules for compliance, with alerts reviewed and escalated for STR consideration."] },
    ],
  },
});
