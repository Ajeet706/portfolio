/* Case study — AML Monitoring System (SK Finance, professional)
   Schema v2 (see _TEMPLATE.js). Compliance and transaction monitoring.
   Illustrative portfolio demonstration — not actual company rules. All numbers and identifiers
   in the visuals are synthetic. Code is representative. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "aml",
  order: 4,
  company: "sk",
  kind: "professional",
  title: "AML Monitoring System",
  short: "AML monitoring",
  domain: "Anti-Money Laundering / Compliance",
  domains: ["NBFC", "AML", "Compliance", "Risk", "Automation"],
  techTags: ["Oracle", "SQL", "Python", "Power BI", "Zoho Analytics"],
  tech: ["Oracle SQL", "PL/SQL", "Python", "Power BI / Zoho Analytics"],
  thumb: "aml-highvalue",
  problem: "Surface potentially suspicious repayment and transaction patterns so compliance can review them and report where needed.",

  summary: {
    problem: "Compliance must monitor transactions for patterns that may indicate money laundering, but manual review of every receipt is impossible.",
    solution: "Rule-based transaction monitoring in Oracle SQL, automated processing in PL/SQL and Python, a prioritised alert queue with dispositions, and compliance reporting and dashboards.",
    contribution: "Extracted transaction data, wrote the SQL and monitoring logic, automated processing, generated alerts, prepared compliance reports and built dashboards.",
    outcome: "Repeatable, documented monitoring that produces reviewable alerts and compliance reporting without manual extraction.", // VERIFY
  },
  users: "Compliance / AML team: analysts working the alert queue, and compliance management reviewing summary reports.",
  process: "AML transaction monitoring: suspicious-activity identification, alert review and compliance reporting.",
  overviewNote: "Illustrative portfolio demonstration — not actual company rules. Every rule, threshold, identifier and number shown is synthetic.",

  problemText: [
    "Under India’s Prevention of Money Laundering Act, regulated entities including NBFCs must monitor customer transactions and report suspicious ones to FIU-IND as Suspicious Transaction Reports (STRs). For a lender, the risk sits mainly in how loans are repaid: in cash, by whom, how often and how fast.",
    "The aim is not to accuse anyone. It is to surface unusual patterns early, with enough context for a compliance analyst to close an alert quickly or investigate further — and to show auditors that every alert traces back to a documented rule.",
  ],
  problemPoints: [
    "Which transactions or customers match a monitoring scenario this period?",
    "How much evidence does the analyst need on screen to decide?",
    "Which rules produce useful alerts and which only produce noise?",
  ],
  objective: "Screen loan repayments and related transactions against monitoring scenarios, raise alerts with the evidence attached, track each alert to a disposition, and give compliance a reporting view.",
  objectives: [
    "Run documented, parameterised monitoring rules on every cycle.",
    "Use customer risk category to prioritise alerts and attach customer context.",
    "Track every alert from generation to disposition in an alert register.",
    "Produce compliance reporting and dashboards from the same data.",
  ],
  role: [
    "Extracted transaction, receipt and customer data from Oracle.",
    "Developed the SQL queries for each monitoring scenario.",
    "Built the monitoring logic and the automated processing around it.",
    "Generated alerts and the files compliance reviews.",
    "Prepared compliance reporting and dashboards.",
  ],

  data: {
    text: "Receipts and transactions joined to loan and customer profiles. The demo uses synthetic transactions and dummy identifiers.",
    sources: [
      { name: "Receipts / transactions", grain: "1 row per receipt", fields: "loan, amount, date, mode (cash / NACH / UPI / cheque / bank transfer), payer account (hashed)" },
      { name: "Loan master", grain: "1 row per loan", fields: "disbursal date, amount, closure date and type" },
      { name: "Customer profile", grain: "1 row per customer", fields: "declared income, occupation, risk category" },
      { name: "Rule table", grain: "1 row per rule", fields: "scenario, look-back, threshold, minimum count, active flag" },
      { name: "Alert register", grain: "1 row per alert", fields: "rule, customer, amount, status, analyst, disposition, dates" },
    ],
    processing: [
      "Receipts joined to loan and customer profiles over the look-back window each rule needs.",
      "Payment-mode codes mapped to one standard set before any rule runs.",
      "Each scenario runs as parameterised SQL; hits are de-duplicated against open alerts and enriched in Python.",
      "The alert register is updated with status and disposition; summaries feed reports and dashboards.",
    ],
    validation: [
      "Receipt totals reconciled to the collections ledger for the period.",
      "Cash vs non-cash mode mapping checked — a wrong mode code changes which rules fire.",
      "Duplicate receipts removed before counting frequency.",
      "Each rule re-run on a past period to confirm hit counts before going live.",
    ],
  },
  techUse: [
    { t: "Oracle SQL", use: "Scenario queries over receipts, loans and customers, with thresholds passed as bind variables from the rule table." },
    { t: "PL/SQL", use: "Wrapper that runs every active rule, writes hits to the alert table and logs counts per rule." },
    { t: "Python", use: "Orchestration, de-duplication, enrichment with customer context, the prioritised queue and summary files." },
    { t: "Power BI / Zoho Analytics", use: "Compliance dashboards: alerts by rule, alert status, customer risk and transaction patterns." },
  ],

  workflow: {
    text: "From raw transactions to compliance reporting, every monitoring cycle.",
    steps: [
      { t: "Transactions", d: "receipts and related transactions with loan and customer context" },
      { t: "Rules", d: "parameterised scenario SQL, thresholds held in a rule table" },
      { t: "Risk Indicators", d: "near-threshold cash, third-party payers, frequency spikes, volume vs income, customer risk category" },
      { t: "Alerts", d: "de-duplicated, enriched, priority-ordered queue" },
      { t: "Investigation", d: "compliance analysts review: close, request documents or escalate" },
      { t: "Reporting", d: "compliance summary and dashboards; escalated cases go to STR review" },
    ],
  },
  architecture: {
    text: "Batch monitoring pipeline from Oracle to compliance.",
    lanes: [
      { lane: "Sources", nodes: [{ t: "Oracle", d: "receipts / transactions, loan master, customer profile", key: true, db: true }] },
      { lane: "Rule engine", nodes: [{ t: "Scenario SQL", d: "one parameterised query per rule", key: true }, { t: "Rule table", d: "thresholds, look-back, active flag", db: true }, { t: "PL/SQL wrapper", d: "runs rules, logs counts" }] },
      { lane: "Processing", nodes: [{ t: "Python", d: "de-duplicate vs open alerts, enrich, prioritise", key: true }] },
      { lane: "Alert management", nodes: [{ t: "Alert register", d: "status, analyst, disposition", db: true }, { t: "Analyst queue", d: "Excel: Queue + Summary" }] },
      { lane: "Reporting", nodes: [{ t: "Power BI / Zoho Analytics", d: "compliance dashboards" }, { t: "Summary by rule", d: "volume, escalation rate" }] },
      { lane: "Users", nodes: [{ t: "Compliance analysts" }, { t: "Compliance management" }] },
    ],
  },
  model: {
    text: "Transaction facts with customer and loan dimensions, a rule table, and an alert register that records the lifecycle of every alert.",
    entities: [
      { name: "receipt", fields: [["receipt_id", "pk"], ["loan_id", "fk"], ["receipt_date"], ["amount"], ["mode"], ["payer_acct_hash"]] },
      { name: "loan_master", fields: [["loan_id", "pk"], ["customer_id", "fk"], ["disb_date"], ["disb_amount"], ["closure_date"], ["closure_type"]] },
      { name: "customer", fields: [["customer_id", "pk"], ["declared_income"], ["occupation"], ["risk_category"], ["own_acct_hash"]] },
      { name: "aml_rule", fields: [["rule_id", "pk"], ["scenario"], ["lookback_days"], ["threshold"], ["min_count"], ["active_flag"]] },
      { name: "aml_alert", fields: [["alert_id", "pk"], ["rule_id", "fk"], ["customer_id", "fk"], ["alert_date"], ["amount"], ["status"], ["disposition"]] },
    ],
    note: "Synthetic schema. Thresholds live in aml_rule so compliance can tune them without code changes.",
  },

  sql: {
    title: "Scenario R1 — cash receipts just below the PAN threshold",
    text: "Each scenario is a parameterised query over a look-back window. R1 looks for repeated cash receipts just under ₹50,000, the cash amount above which PAN must be quoted. Illustrative portfolio demonstration — not actual company rules.",
    code: `-- Illustrative scenarios on a synthetic schema — not actual company rules
-- R1: repeated cash receipts just below the threshold (threshold = 50,000 → band 45,000–49,999)
SELECT l.customer_id,
       r.loan_id,
       COUNT(*)                     AS near_threshold_receipts,
       SUM(r.amount)                AS total_amount,
       MIN(r.receipt_date)          AS first_seen,
       MAX(r.receipt_date)          AS last_seen
  FROM receipt r
  JOIN loan_master l ON l.loan_id = r.loan_id
 WHERE r.mode = 'CASH'
   AND r.amount BETWEEN :threshold * 0.9 AND :threshold - 1
   AND r.receipt_date >  :run_date - :lookback_days          -- e.g. 30 days
   AND r.receipt_date <= :run_date
 GROUP BY l.customer_id, r.loan_id
HAVING COUNT(*) >= :min_count;                               -- e.g. 3

-- R2: early foreclosure funded mostly by cash or third parties (threshold = share, e.g. 0.5)
SELECT l.loan_id, l.customer_id, l.disb_date, l.closure_date,
       SUM(CASE WHEN r.mode = 'CASH' OR r.payer_acct_hash <> c.own_acct_hash
                THEN r.amount END) / SUM(r.amount)        AS non_own_share
  FROM loan_master l
  JOIN receipt  r ON r.loan_id = l.loan_id
                 AND r.receipt_date >= l.closure_date - 7
  JOIN customer c ON c.customer_id = l.customer_id
 WHERE l.closure_type = 'FORECLOSURE'
   AND l.closure_date > :run_date - :lookback_days
   AND MONTHS_BETWEEN(l.closure_date, l.disb_date) <= 6
 GROUP BY l.loan_id, l.customer_id, l.disb_date, l.closure_date
HAVING SUM(CASE WHEN r.mode = 'CASH' OR r.payer_acct_hash <> c.own_acct_hash
                THEN r.amount END) / SUM(r.amount) > :threshold;`,
    points: [
      "Thresholds, look-back and minimum counts are bind variables read from the rule table, never hard-coded.",
      "A PL/SQL wrapper runs every active rule, writes hits to the alert table and logs counts per rule.",
      "In the demo schema payer accounts are compared as hashes, so no raw account numbers appear in the logic.",
    ],
  },
  python: {
    title: "Automated run, de-duplication and the compliance pack",
    text: "Python orchestrates the rule run, enriches alerts with customer context and produces the analyst queue and summary report. Representative, simplified code.",
    code: `import pandas as pd

rules = pd.read_sql("SELECT * FROM aml_rule WHERE active_flag = 'Y'", engine)
hits = []
for r in rules.itertuples():
    sql = SCENARIO_SQL[r.rule_id]
    binds = {"run_date": run_date, "lookback_days": r.lookback_days,
             "threshold": r.threshold, "min_count": r.min_count}
    params = {k: v for k, v in binds.items() if f":{k}" in sql}     # pass only the binds this rule uses
    df = pd.read_sql(sql, engine, params=params)
    df["rule_id"] = r.rule_id
    hits.append(df)
alerts = pd.concat(hits, ignore_index=True)

# don't re-raise an alert that is already open for the same customer + rule
open_ = pd.read_sql("SELECT customer_id, rule_id FROM aml_alert WHERE status <> 'CLOSED'", engine)
alerts = (alerts.merge(open_.drop_duplicates(), how="left", indicator=True)
                .query("_merge == 'left_only'").drop(columns="_merge"))

profile = pd.read_sql(PROFILE_SQL, engine)                 # declared income, occupation, risk category
alerts = alerts.merge(profile, on="customer_id", how="left")
alerts["priority"] = alerts.risk_category.map({"High": 1, "Medium": 2, "Low": 3})

summary = alerts.groupby("rule_id").agg(alerts=("customer_id", "size"),
                                         amount=("total_amount", "sum"))
with pd.ExcelWriter(f"AML_alerts_{run_date:%Y%m%d}.xlsx") as xw:
    alerts.sort_values(["priority", "total_amount"], ascending=[True, False]).to_excel(xw, sheet_name="Queue", index=False)
    summary.to_excel(xw, sheet_name="Summary")`,
    points: [
      "Customer context (declared income, risk category) is attached so analysts do not have to look it up.",
      "Priority by customer risk category, then amount.",
      "The summary by rule feeds the compliance report and the rule-tuning review.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Monitoring is scenario-based so every alert maps to a documented rule, which is what audit and regulators expect. Each rule is a parameterised query over a look-back window; thresholds live in a rule table, and rule performance (escalation rate per rule) is tracked so thresholds can be tuned with evidence.",
    points: [
      "Customer risk category (Low / Medium / High) sets alert priority and review depth.",
      "An alert already open for the same customer and rule is not raised again.",
      "Rules are back-tested on a past period before going live.",
      "Monitoring produces alerts for review; only reviewed and escalated cases go forward for STR consideration.",
    ],
    rules: [
      { rule: "R1 · Near-₹50k cash", condition: "3 or more cash receipts of ₹45,000–49,999 on one loan within 30 days", outcome: "Alert · structuring check" },
      { rule: "R2 · Early foreclosure", condition: "Loan closed within 6 months of disbursal; more than 50% of the closure amount from cash or a non-borrower account", outcome: "Alert · source-of-funds review" },
      { rule: "R3 · Third-party payers", condition: "EMIs from 3 or more different non-borrower accounts in 90 days", outcome: "Alert" },
      { rule: "R4 · High cash in a month", condition: "Cash receipts for one customer above an illustrative ₹5 lakh in a calendar month", outcome: "Alert" },
      { rule: "R5 · Frequency spike", condition: "4 or more receipts on one loan in a month against a usual 1", outcome: "Alert" },
      { rule: "R6 · Volume vs income", condition: "12-month receipts more than 3× declared annual income", outcome: "Alert · profile review" },
    ],
    rulesNote: "Illustrative portfolio demonstration — not actual company rules.",
  },
  dashboard: {
    text: "Monthly monitoring view for compliance. Illustrative portfolio demonstration — not actual company rules.",
    visual: "aml-dashboard",
    outputs: [
      "Prioritised alert queue for analysts (Excel: Queue and Summary sheets).",
      "Alert register with status and disposition for every alert.",
      "High-risk transaction list with the rules each transaction hit.",
      "Summary by rule: alert volume and escalation rate, for compliance reporting and rule tuning.",
      "Compliance dashboards in Power BI / Zoho Analytics: alert status, customer risk and transaction patterns.",
    ],
  },
  insights: {
    note: "Illustrative portfolio demonstration — not actual company rules or results.",
    items: [
      "A cluster of cash receipts just below the ₹50,000 PAN limit is a classic structuring signal and is easy to see once amounts are banded.",
      "High-volume rules are not necessarily the useful ones; escalation rate per rule is the better measure.",
      "Higher-risk customers are a small share of the base but produce a disproportionate share of alerts — the basis for risk-based review.",
      "An open or under-review backlog that grows month on month is a capacity issue to raise early.",
    ],
  },
  impact: {
    before: ["Transactions reviewed manually or ad hoc", "Thresholds and logic spread across individual queries", "Compliance reports compiled by hand"],
    solution: ["Scenario SQL on Oracle with a rule table", "PL/SQL and Python automation", "Prioritised alert queue with customer context", "Dashboards and a compliance summary"],
    after: ["Monitoring runs the same way every cycle", "Every alert traceable to a rule and its evidence", "Reporting produced from the same data"],
    items: [
      "Monitoring that runs the same way every cycle and is fully documented.",
      "Alerts arrive with context, shortening review.",
      "Compliance reporting produced from the same data, not compiled by hand.",
    ],
  },
  challenges: [
    "Payment-mode codes were inconsistent across channels and had to be mapped before cash rules could work.",
    "Balancing sensitivity and noise — thresholds were tested on past periods before going live.",
    "Third-party payers had to be identified without exposing account details (hashed payer accounts in the demo).",
    "Avoiding duplicate alerts for the same customer and rule while a case is still open.",
  ],
  learnings: [
    "In compliance work, traceability matters as much as detection: every alert must point to a rule and its evidence.",
    "Rule tables beat hard-coded thresholds — compliance can tune them without a release.",
    "Escalation rate per rule is a better measure of a rule than its alert volume.",
  ],
  screenshots: ["aml-dashboard", "aml-alerts", "aml-hightxn", "aml-risk", "aml-pattern", "aml-byrule", "aml-rules", "aml-status", "aml-highvalue", "aml-frequency"],
  future: [
    "Alert ageing with escalation when a review stays open beyond an agreed number of days.",
    "Quarterly rule-tuning review driven by escalation rate per rule.",
    "Network view linking customers who share third-party payer accounts.",
    "Case-management screen with an evidence trail (data snapshot, analyst note, decision) for every alert.",
  ],

  interview: {
    s30: "I built rule-based AML transaction monitoring for loan repayments on Oracle. Each scenario, such as repeated cash payments just below the ₹50,000 PAN limit or an early foreclosure funded by third parties, is a parameterised SQL query with thresholds held in a rule table. A Python job runs every rule, removes duplicate alerts, adds customer risk and produces a prioritised alert queue, and dashboards provide compliance reporting from the same data.",
    s90: "Under PMLA, an NBFC has to monitor how customers move money and report suspicious transactions, but no compliance team can review every receipt. I built rule-based transaction monitoring on Oracle. I extracted receipts and transactions and joined them to loan and customer profiles. Each scenario is a parameterised SQL query over a look-back window: for example, three or more cash payments just under the fifty-thousand-rupee PAN limit within thirty days, a loan foreclosed within six months using cash or third-party funds, many different third-party payers, or receipts far above declared income. Thresholds live in a rule table, so compliance can tune them without a code change, and a PL/SQL wrapper runs every active rule and logs hit counts. A Python job then removes alerts already open for the same customer and rule, attaches customer context such as declared income and risk category, and produces a prioritised queue plus a summary by rule. Analysts close each alert, ask for documents or escalate it for STR review, and every disposition is recorded. Dashboards in Power BI or Zoho show alert volumes, status, customer risk and transaction patterns, and which rules actually lead to escalation, so noisy rules are tuned with evidence. Everything traces from alert back to rule and data.",
    role: ["Extracted transaction and customer data from Oracle", "Wrote the scenario SQL and monitoring logic", "Automated the rule run and alert generation", "Built compliance reports and dashboards"],
    tech: ["Oracle SQL", "PL/SQL", "Python", "Power BI / Zoho Analytics"],
    impact: ["Monitoring runs the same way every cycle", "Alerts arrive with context", "Reporting from the same data, not compiled by hand"],
    challenges: ["Inconsistent payment-mode codes", "Balancing sensitivity and noise", "Third-party payers without exposing account details", "No duplicate alerts while a case is open"],
    questions: [
      { q: "How does your monitoring logic work?", a: ["Each scenario is a parameterised SQL query over a look-back window — for example repeated cash receipts just below a threshold, or an early foreclosure funded by third parties.", "A run executes every active rule, de-duplicates against open alerts, attaches customer context and produces a prioritised queue.", "Thresholds come from a rule table as bind variables."] },
      { q: "Why rule-based monitoring?", a: ["Each alert maps to a documented scenario, which auditors and regulators expect.", "Rules are explainable to analysts and branches.", "Rule performance is measurable, so thresholds can be tuned with evidence."] },
      { q: "How do you reduce false positives?", a: ["Back-test thresholds on past periods before go-live.", "Track escalation rate per rule and tune or retire noisy rules.", "Use customer risk category and profile (declared income, occupation) for context.", "Suppress duplicates for the same customer and rule while an alert is open."] },
      { q: "How do you prioritise alerts?", a: ["Customer risk category first (High, Medium, Low), then amount.", "Analysts see the rule, the evidence and the customer profile together, so a low-risk alert can be closed quickly with a note."] },
      { q: "What is structuring?", a: ["Splitting cash into amounts just below a reporting or documentation threshold to avoid scrutiny — for example several cash payments just under ₹50,000, above which PAN must be quoted."] },
      { q: "What is the difference between an STR and a CTR?", a: ["An STR (Suspicious Transaction Report) is filed with FIU-IND when, after review, a transaction appears suspicious — whatever its amount. Monitoring produces alerts; only reviewed and escalated cases lead to an STR.", "A CTR (Cash Transaction Report) is threshold-based: cash transactions above ₹10 lakh, or integrally connected cash transactions that together exceed ₹10 lakh in a month, are reported to FIU-IND."] },
      { q: "Why Oracle and SQL for this?", a: ["The transaction data already lives in Oracle; set-based SQL scans large receipt tables efficiently.", "Running the logic close to the data avoids moving large volumes into Python; Python handles orchestration and outputs."] },
      { q: "How is this different from your early warning system?", a: ["AML monitoring manages financial-crime risk for compliance: is the way money moves suspicious?", "The EWS manages credit risk for collections: is the borrower likely to stop paying? Different signals, rules, users and outputs."] },
      { q: "What was your contribution?", a: ["Data extraction, SQL scenarios, monitoring logic, automated processing, alert generation, compliance reporting and dashboards."] },
    ],
  },
});
