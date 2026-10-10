/* Case study — Business Rule Engine (BRE) (SK Finance, professional)
   Confirmed: Ajeet implemented the rule logic, the data flow and the BRE monitoring dashboard,
   using SQL and Python. The dashboard tool is not named. Every rule, threshold and count shown
   is ILLUSTRATIVE / synthetic; pre- and post-BRE routing details are a representative workflow. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "bre",
  order: 9,
  company: "sk",
  kind: "professional",
  featured: false,
  title: "Business Rule Engine (BRE)",
  short: "Business rule engine",
  domain: "Credit Decisioning / Business Rules",
  domains: ["NBFC", "Credit", "Risk", "Automation", "BI"],
  techTags: ["SQL", "Python"],
  tech: ["SQL", "Python", "Rule logic", "Monitoring dashboard"],
  thumb: "bre-flow",
  problem: "A decisioning layer that checks every loan application against predefined business rules and returns Pass, Refer or Decline — with a monitoring dashboard that shows which rules drive the outcomes.",

  summary: {
    problem: "Every loan application has to be checked against business rules — eligibility, policy, bureau, past DPD, income, documents and risk — before a credit decision. Applied case by case, the same rule can be read differently, decisions are hard to explain later, and nobody can see which rules are rejecting applications.",
    solution: "A business rule engine that evaluates each application against predefined rules in seven categories, records the result of every rule, and produces a BRE decision (Pass, Refer or Decline) that flows through post-BRE processing to the final decision. A monitoring dashboard tracks volumes, outcomes, rule-wise rejection and rule performance.",
    contribution: "Implemented the rule logic and the data flow — application data, pre-BRE, rule evaluation, BRE decision, post-BRE, final decision — in SQL and Python, and built the BRE monitoring dashboard.",
    outcome: "Consistent, explainable rule outcomes for every evaluated application, and one view of how many applications pass, are referred or fail and which rules are responsible.",
  },
  users: "Credit and risk teams who review rule outcomes and referred cases, and managers who track decision volumes (Representative / Demo Workflow).",
  process: "Credit decisioning — the automated rule check between application data and the final credit decision.",
  overviewNote: "Rules, thresholds, counts and screens in this case study are illustrative. They show how the engine and its dashboard work, not the production rule set. Thresholds appear only as named placeholders.",

  problemText: [
    "Before a credit decision, every application goes through the same questions. Is the applicant eligible? Does the case fit policy? What does the credit bureau show? Has the applicant been delinquent before? Is income enough for the EMI? Are the documents complete? What is the overall risk grade?",
    "When those checks are applied by hand or spread across different reports, the same rule can be interpreted differently from one case to the next, and a decision is hard to explain after the fact. There is also no single view of how many applications fail and why — a rule that rejects far more cases than expected can go unnoticed.",
  ],
  problemPoints: [
    "Has every application been checked against the same rules, in the same way?",
    "Why was this application referred or declined — which rule, on which value?",
    "How many applications pass, are referred or fail each month, and which rules drive rejections?",
  ],
  objective: "Evaluate every loan application against predefined business rules in a consistent and traceable way, produce a clear BRE decision, and give credit and risk teams a monitoring dashboard of volumes, outcomes and rule performance.",
  objectives: [
    "One place where the rule logic is implemented and executed.",
    "A result recorded for every rule on every application, so each decision can be explained.",
    "A clean data flow from application data through pre-BRE, evaluation and post-BRE to the final decision.",
    "A monitoring dashboard: application count, pre-BRE applications, passed, failed, rule-wise rejection, decision trend and rule performance.",
  ],
  role: [
    "Implemented the business rule logic across seven rule categories: eligibility, policy, bureau, DPD, income, document and risk.",
    "Built the data flow: application data → pre-BRE → rule evaluation → BRE decision → post-BRE → final decision.",
    "Wrote the SQL that prepares the inputs each rule needs and aggregates results for monitoring.",
    "Used Python for rule evaluation and data processing.",
    "Built the BRE monitoring dashboard: application count, pre-BRE applications, BRE passed and failed, rule-wise rejection, decision trend and rule performance.",
  ],

  data: {
    text: "The engine reads the application and the data each rule category needs, and writes its own results. Sources and fields are representative.",
    sources: [
      { name: "Application data", grain: "1 row per application", fields: "applicant profile, product, branch, loan amount, asset value, declared income, application date" },
      { name: "Bureau summary", grain: "1 row per application", fields: "bureau score, number of tradelines, past delinquency summary" },
      { name: "Repayment / DPD history", grain: "1 row per existing loan per month", fields: "DPD, maximum DPD in a look-back window, write-off or settlement flags" },
      { name: "Document status", grain: "1 row per application per document", fields: "document type, received flag, verification status" },
      { name: "Rule master", grain: "1 row per rule", fields: "rule ID, category, outcome, precedence, threshold parameter name, active flag" },
      { name: "BRE results", grain: "1 row per application per rule per run", fields: "rule ID, evaluated value, outcome (pass / refer / decline), run time" },
    ],
    processing: [
      "SQL assembles one evaluation record per application from application, bureau, DPD and document data.",
      "Pre-BRE checks confirm the record is complete before any rule runs; incomplete cases are held, not failed.",
      "Python evaluates each active rule and writes a result row per rule; the BRE decision is the most severe outcome.",
      "Results are aggregated by month, product, branch, rule and category for the monitoring dashboard.",
    ],
    validation: [
      "Reconciliation on every run: passed + referred + failed = applications evaluated.",
      "Rule-wise rejections add up to BRE failed, because each failed case is attributed to one primary rule.",
      "Every evaluated application has exactly one BRE decision and a result for every active rule.",
      "A sudden shift in a rule’s hit rate is visible on the rule performance view, so data issues surface early.",
    ],
  },
  techUse: [
    { t: "SQL", use: "Preparing rule inputs from application, bureau, DPD and document data; deriving decisions and rule-wise counts; reconciliation checks." },
    { t: "Python", use: "Rule evaluation and data processing: applying each rule, deriving the BRE decision and writing the results." },
    { t: "Rule logic", use: "Seven rule categories, each rule with a condition and an outcome; thresholds kept as named parameters (representative design)." },
    { t: "Monitoring dashboard", use: "The BRE monitoring dashboard: volumes, pass / refer / fail, rule-wise rejection, decision trend and rule performance." },
  ],

  workflow: {
    text: "From application data to the final decision. The pre-BRE and post-BRE steps shown are a representative / demo workflow.",
    steps: [
      { t: "Application data", d: "applicant, loan, bureau, DPD history and document status for one application" },
      { t: "Pre-BRE", d: "completeness and readiness checks; incomplete cases are held, not failed" },
      { t: "Rule evaluation", d: "eligibility, policy, bureau, DPD, income, document and risk rules" },
      { t: "BRE decision", d: "Pass, Refer or Decline — the most severe rule outcome wins" },
      { t: "Post-BRE", d: "Pass continues, Refer goes to credit / risk review, Decline closes with its reason" },
      { t: "Final decision", d: "approve or reject, with the BRE result kept for audit and monitoring" },
    ],
  },
  architecture: {
    text: "Layered view. Component boundaries are representative.",
    lanes: [
      { lane: "Inputs", nodes: [{ t: "Application data" }, { t: "Bureau summary" }, { t: "Repayment / DPD history" }, { t: "Document status" }] },
      { lane: "Data prep", nodes: [{ t: "SQL", d: "one evaluation record per application", key: true }, { t: "Pre-BRE checks", d: "complete and ready?" }] },
      { lane: "Rule engine", nodes: [{ t: "Rule master", d: "rules, outcomes, precedence, parameters", db: true }, { t: "Python evaluator", d: "applies every active rule", key: true }, { t: "Decision logic", d: "most severe outcome wins" }] },
      { lane: "Results", nodes: [{ t: "Rule results", d: "1 row per application per rule", db: true }, { t: "BRE decision", d: "outcome + primary rule", db: true }] },
      { lane: "Downstream", nodes: [{ t: "Post-BRE routing", d: "representative" }, { t: "Final decision" }] },
      { lane: "Monitoring", nodes: [{ t: "SQL aggregation" }, { t: "BRE monitoring dashboard", key: true }] },
    ],
  },
  model: {
    text: "Representative tables for rules, parameters, results and decisions.",
    entities: [
      { name: "bre_rule_master", fields: [["rule_id", "pk"], ["rule_name"], ["category"], ["outcome"], ["precedence"], ["param_name"], ["is_active"]] },
      { name: "bre_rule_param", fields: [["param_name", "pk"], ["param_value"], ["effective_from"]] },
      { name: "bre_application", fields: [["application_id", "pk"], ["product_code"], ["branch_code"], ["applied_on"], ["pre_bre_status"]] },
      { name: "bre_rule_result", fields: [["result_id", "pk"], ["run_id"], ["application_id", "fk"], ["rule_id", "fk"], ["evaluated_value"], ["outcome"]] },
      { name: "bre_decision", fields: [["run_id", "pk"], ["application_id", "fk"], ["bre_decision"], ["primary_rule_id", "fk"], ["primary_category"], ["decided_on"]] },
      { name: "post_bre_outcome", fields: [["application_id", "fk"], ["route"], ["final_decision"], ["decided_on"]] },
    ],
    note: "Representative design. Table and column names are illustrative; parameter values are not shown.",
  },

  sql: {
    title: "Deriving the BRE decision and rule-wise rejection",
    text: "Representative SQL on a synthetic schema. The decision is the most severe rule outcome; each failed application is attributed to one primary rule, so rule-wise counts reconcile with the total.",
    code: `-- Representative SQL on a synthetic schema — not production rules or code
-- 1) BRE decision per application and run: most severe outcome wins, precedence breaks ties
WITH evaluated AS (
  SELECT DISTINCT run_id, application_id
    FROM bre_rule_result
),
fired AS (
  SELECT r.run_id, r.application_id, r.rule_id, m.category, r.outcome, m.precedence,
         CASE r.outcome WHEN 'DECLINE' THEN 3 WHEN 'REFER' THEN 2 ELSE 1 END AS severity
    FROM bre_rule_result r
    JOIN bre_rule_master m ON m.rule_id = r.rule_id
   WHERE r.outcome IN ('DECLINE', 'REFER')
),
ranked AS (
  SELECT f.*,
         ROW_NUMBER() OVER (PARTITION BY f.run_id, f.application_id
                            ORDER BY f.severity DESC, f.precedence) AS rn
    FROM fired f
)
SELECT e.run_id, e.application_id,
       COALESCE(k.outcome, 'PASS') AS bre_decision,
       k.rule_id                   AS primary_rule_id,
       k.category                  AS primary_category
  FROM evaluated e
  LEFT JOIN ranked k
         ON k.run_id = e.run_id AND k.application_id = e.application_id AND k.rn = 1;

-- 2) Rule-wise rejection for the dashboard: one primary rule per failed case
SELECT d.primary_category, d.primary_rule_id, COUNT(*) AS failed_cases
  FROM bre_decision d
 WHERE d.bre_decision = 'DECLINE'
   AND d.decided_on BETWEEN :from_dt AND :to_dt
 GROUP BY d.primary_category, d.primary_rule_id
 ORDER BY failed_cases DESC;

-- 3) Reconciliation: passed + referred + failed must equal evaluated
SELECT COUNT(*)                                                AS evaluated,
       SUM(CASE WHEN bre_decision = 'PASS'    THEN 1 ELSE 0 END) AS passed,
       SUM(CASE WHEN bre_decision = 'REFER'   THEN 1 ELSE 0 END) AS referred,
       SUM(CASE WHEN bre_decision = 'DECLINE' THEN 1 ELSE 0 END) AS failed
  FROM bre_decision
 WHERE decided_on BETWEEN :from_dt AND :to_dt;`,
    points: [
      "Decline outranks Refer, Refer outranks Pass; precedence breaks ties, so the primary rule is deterministic.",
      "Because each failed case has exactly one primary rule, rule-wise rejections add up to BRE failed.",
      "Hits (every rule that fired) are counted separately from primary counts — a rule can fire often but rarely decide.",
    ],
  },
  python: {
    title: "Rule evaluation — rules as data, thresholds as parameters",
    text: "Representative, simplified Python. Rules are registered against the rule master and thresholds are named parameters, so the code holds no production values.",
    code: `# bre_evaluate.py — representative, simplified. Threshold VALUES are parameters, never in code.
SEVERITY = {"PASS": 1, "REFER": 2, "DECLINE": 3}

def rule_dpd(app, p):
    """Illustrative DPD rule: maximum DPD in the look-back window against two thresholds."""
    if app["max_dpd_lookback"] >= p["dpd_decline_threshold"]:
        return "DECLINE"
    if app["max_dpd_lookback"] >= p["dpd_review_threshold"]:
        return "REFER"                                  # risk review
    return "PASS"

def rule_min_income(app, p):
    return "DECLINE" if app["assessed_income"] < p["minimum_income"] else "PASS"

RULES = {"R-DPD-01": rule_dpd, "R-INC-01": rule_min_income}   # ... one function per active rule

def evaluate(app, rule_master, params):
    results = []
    for rule in sorted(rule_master, key=lambda r: r["precedence"]):
        if not rule["is_active"]:
            continue
        outcome = RULES[rule["rule_id"]](app, params)
        results.append({"application_id": app["application_id"], "rule_id": rule["rule_id"],
                        "precedence": rule["precedence"], "outcome": outcome})
    # most severe outcome wins; lower precedence number wins a tie
    worst = max(results, key=lambda r: (SEVERITY[r["outcome"]], -r["precedence"]))
    decision = worst["outcome"]
    primary = worst["rule_id"] if decision != "PASS" else None
    return results, decision, primary

def run_batch(apps, rule_master, params, store):
    totals = {"PASS": 0, "REFER": 0, "DECLINE": 0}
    for app in apps:                                     # only applications cleared at pre-BRE
        results, decision, primary = evaluate(app, rule_master, params)
        store.write_results(results)                     # a row for every rule, passes included
        store.write_decision(app["application_id"], decision, primary)
        totals[decision] += 1
    assert sum(totals.values()) == len(apps), "passed + referred + failed must equal evaluated"
    return totals`,
    points: [
      "Every rule writes a result, passes included — that is what makes each decision explainable and hit rates measurable.",
      "Changing a threshold is a parameter change, not a code change (representative design).",
      "The batch ends with the same reconciliation the dashboard relies on.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Seven rule categories. Each rule has a condition and an outcome, and the BRE decision is the most severe outcome across all rules. The sample DPD rule — if DPD ≥ threshold then Risk Review or Decline — shows how one rule can carry two outcomes at two thresholds.",
    points: [
      "Decline outranks Refer, Refer outranks Pass.",
      "Pre-BRE runs first: an incomplete application is held, not failed by a rule.",
      "Thresholds appear only as named placeholders (threshold, minimum income, cut-off score); no production values are shown.",
    ],
    rules: [
      { rule: "Eligibility — applicant age", condition: "Age below the minimum age, or age at loan maturity above the maximum age", outcome: "Decline" },
      { rule: "Policy — product / location", condition: "Product or location not covered by policy", outcome: "Decline" },
      { rule: "Policy — loan-to-value", condition: "LTV above the product LTV cap (threshold)", outcome: "Refer" },
      { rule: "Bureau — score", condition: "Bureau score below the cut-off score", outcome: "Decline" },
      { rule: "Bureau — thin file", condition: "No bureau record, or fewer tradelines than the minimum count", outcome: "Refer" },
      { rule: "DPD — past delinquency (sample rule)", condition: "If maximum DPD in the look-back period ≥ threshold → Risk Review; ≥ a higher threshold → Decline", outcome: "Risk Review / Decline" },
      { rule: "Income — minimum income", condition: "Assessed monthly income below the minimum income", outcome: "Decline" },
      { rule: "Income — FOIR", condition: "FOIR above the FOIR threshold", outcome: "Refer" },
      { rule: "Document — mandatory documents", condition: "A required document is missing or unreadable", outcome: "Refer" },
      { rule: "Risk — internal risk grade", condition: "Grade in the high band → Refer; in the highest band → Decline", outcome: "Refer / Decline" },
    ],
    rulesNote: "Illustrative rules for demonstration — not production rules.",
  },
  dashboard: {
    text: "The BRE monitoring dashboard: volumes through pre-BRE and the engine, pass / refer / fail, rule-wise rejection, decision trend and rule performance. Counts are demo data.",
    visual: "bre-dashboard",
    outputs: [
      "A BRE decision and primary rule for every evaluated application",
      "A result for every rule on every application",
      "Rule-wise rejection by category and by rule",
      "Decision trend over time",
      "Rule performance: hits, hit rate, primary declines and share of rejections",
      "Reconciliation: passed + referred + failed = evaluated",
    ],
  },
  insights: {
    note: "Patterns illustrated with synthetic data. They describe what this kind of monitoring surfaces; no company results are shown.",
    items: [
      "In the demo data, three categories — bureau, DPD and income — explain about two-thirds of BRE declines (740 of 1,130).",
      "Hit count and primary count tell different stories: a rule can fire on many applications but rarely decide, because a more severe rule fired first.",
      "Keeping pre-BRE holds separate from BRE declines stops data problems being counted as credit rejections.",
      "A sudden change in one rule’s hit rate can signal an upstream data change as much as a change in applicants — so rules are monitored, not just decisions.",
    ],
  },
  impact: {
    before: ["Rules applied case by case, open to interpretation", "Decisions hard to explain after the fact", "No view of which rules drive rejections"],
    solution: ["Rule logic and data flow in SQL and Python", "A result for every rule on every application", "Pass / Refer / Decline with a primary rule", "BRE monitoring dashboard"],
    after: ["The same rules applied to every application", "Each refer or decline traceable to a rule and a value", "Volumes, outcomes and rule behaviour visible in one place"],
    items: [
      "Consistent rule application across applications.",
      "Explainable decisions: every refer or decline carries its rule.",
      "Manual review focused on referred cases rather than every application.",
      "Rule behaviour monitored, so unexpected shifts are visible.",
    ],
  },
  challenges: [
    "Keeping data problems separate from credit rejections — incomplete cases are held at pre-BRE, not declined by a rule.",
    "Making rule-wise rejection add up — one primary rule per failed case, chosen by severity, then precedence.",
    "Rules that need history (DPD look-back, bureau summary) — inputs prepared in SQL before evaluation, so each rule stays a simple comparison.",
    "Changing thresholds without code changes — thresholds kept as named parameters (representative design).",
    "Re-evaluation after new data or documents — each run stored separately, so the latest decision and its history are both available (representative design).",
  ],
  learnings: [
    "A rule engine is trusted only as far as it can explain itself — storing every rule result matters as much as the decision.",
    "A reconciliation check (passed + referred + failed = evaluated) catches pipeline problems before anyone reads the dashboard.",
    "Monitoring rules, not just decisions, shows when a rule or its input data has drifted.",
  ],
  screenshots: ["bre-flow", "bre-dashboard", "bre-rejection", "bre-trend", "bre-rules", "bre-funnel", "bre-catalogue"],
  future: [
    "Rule versioning with effective dates and a change log for every threshold update.",
    "Testing a changed rule on past applications before it goes live.",
    "Alerts when a rule’s hit rate moves outside its usual range.",
    "Reason codes shown directly to the credit reviewer for referred cases.",
    "Linking BRE outcomes to later repayment, to review whether each rule still separates risk.",
  ],

  interview: {
    s30: "I implemented the rule logic and data flow for a Business Rule Engine that checks every loan application against predefined rules — eligibility, policy, bureau, DPD, income, document and risk. Data passes pre-BRE checks, every rule is evaluated and recorded, and the most severe outcome becomes the BRE decision: Pass, Refer or Decline. I also built the monitoring dashboard showing volumes, pass and fail counts, rule-wise rejection, decision trend and rule performance.",
    s90: "Before a credit decision, every loan application has to be checked against a set of business rules. When those checks are applied by hand or spread across reports, the same rule can be read differently, and nobody can see which rules are rejecting cases. The Business Rule Engine solves that. I implemented the rule logic and the data flow in SQL and Python. Application data first goes through pre-BRE checks: is the record complete and ready? Incomplete cases are held there, so a data problem is never counted as a credit rejection. The engine then evaluates rules in seven categories — eligibility, policy, bureau, DPD, income, document and risk. A typical rule reads: if DPD is at or above a threshold, send the case to risk review; above a higher threshold, decline. Every rule writes a result, and the BRE decision is the most severe outcome — Decline over Refer over Pass. Each failed case is attributed to one primary rule, so rule-wise rejections add up to the total. After the engine, pass cases move on, referred cases go for review and declined cases close with their reason. I also built the BRE monitoring dashboard: application count, pre-BRE applications, passed, failed, rule-wise rejection, decision trend and rule performance. The result is consistent, explainable decisions and clear visibility of how each rule behaves.",
    role: ["Implemented the rule logic across seven categories", "Built the data flow from application data to final decision", "SQL for rule inputs, aggregation and reconciliation", "Python for rule evaluation and processing", "Built the BRE monitoring dashboard"],
    tech: ["SQL", "Python", "Rule logic", "Monitoring dashboard"],
    impact: ["Consistent rule application", "Explainable Pass / Refer / Decline", "Rule-wise rejection visible", "Reconciled monitoring of volumes and outcomes"],
    challenges: ["Pre-BRE holds vs rule failures", "One primary rule per failed case", "History-based rules (DPD, bureau)", "Threshold changes without code changes"],
    questions: [
      { q: "What is a business rule engine, and how is it different from a credit score?", a: ["A BRE applies explicit, predefined rules and returns an outcome together with the rule that caused it.", "A score ranks risk; rules enforce policy and hard limits. They work together — a bureau score cut-off is itself a rule.", "Rules are transparent: every refer or decline can be explained by rule and value."] },
      { q: "Several rules fire on one application. How is the BRE decision derived?", a: ["Every rule returns Pass, Refer or Decline.", "The decision is the most severe outcome: Decline over Refer over Pass.", "Among rules with that same outcome, precedence picks the primary rule, so attribution is deterministic.", "In SQL: ROW_NUMBER() partitioned by application, ordered by severity descending then precedence; keep row 1."] },
      { q: "What happens at pre-BRE and post-BRE?", a: ["Pre-BRE confirms the record is complete and ready — required fields, bureau data available. Incomplete cases are held, not declined.", "Post-BRE routes the outcome: Pass continues in the credit process, Refer goes to credit or risk review, Decline closes with its reason; the final decision is recorded with the BRE result.", "The exact pre- and post-BRE steps shown in the case study are a representative workflow."] },
      { q: "Explain the DPD rule.", a: ["Illustratively: take the maximum DPD on the applicant’s past loans in a look-back window.", "At or above a review threshold the case goes to risk review (Refer); at or above a higher threshold it is declined.", "The input is prepared in SQL from monthly DPD history, so the rule itself is a simple comparison against parameters. No production thresholds are shown."] },
      { q: "How do the rule-wise rejection numbers reconcile with total failures?", a: ["Each failed application has exactly one primary rule, so category and rule counts add up to BRE failed.", "Hits — every rule that fired — are tracked separately; one case can hit several rules.", "A reconciliation check runs on every batch: passed + referred + failed = evaluated."] },
      { q: "What does the BRE monitoring dashboard show?", a: ["Application count, pre-BRE applications, BRE passed, referred and failed.", "Rule-wise rejection by category and rule, and the decision trend by month.", "Rule performance: hits, hit rate, primary declines and share of rejections — so a rule that suddenly fires more is visible."] },
      { q: "How do you handle a threshold change?", a: ["Thresholds are named parameters, not values written into code (representative design).", "A change is a parameter update and the next run uses it.", "Comparing the rule’s hit rate before and after shows the effect; testing a change on past applications first is listed as a future enhancement."] },
      { q: "A rule’s hit rate suddenly doubles. What do you check?", a: ["The data first: did an upstream field change format, go missing or default to a value that trips the rule?", "Then the population: a new product, branch or channel mix.", "Then the rule: a recent threshold change.", "Rule-level results make this quick — compare the evaluated values for that rule before and after the jump."] },
      { q: "Why store a result for every rule, not only the failures?", a: ["Explainability: you can show which rules passed as well as which failed.", "Measurement: hit rates need the denominator — every evaluation.", "Audit and re-runs: the full result set shows exactly how a decision was reached at that time."] },
    ],
  },
});
