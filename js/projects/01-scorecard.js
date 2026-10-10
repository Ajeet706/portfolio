/* Case study — Credit Risk Scorecard Model (SK Finance, professional)
   Schema v2 (see _TEMPLATE.js). Visuals are synthetic (window.SYNTH.scorecard, built by
   ml/build_synthetic_model.py). The professional outcome is qualitative: model performance
   figures appear only inside labelled demo visuals. Code is representative, on a synthetic schema. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "scorecard",
  order: 2,
  company: "sk",
  kind: "professional",
  title: "Credit Risk Scorecard Model",
  short: "Credit risk scorecard",
  domain: "Credit Risk / Lending",
  domains: ["NBFC", "Credit", "Risk", "Machine Learning"],
  techTags: ["Python", "SQL", "Oracle", "Pandas", "Machine Learning"],
  tech: ["Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Oracle", "WOE / IV", "Logistic Regression"],
  thumb: "sc-roc",
  problem: "Rank loan applicants by default risk with a score that credit teams can explain, audit and turn into policy.",

  summary: {
    problem: "Credit decisions need a consistent, explainable measure of how likely an applicant is to default, built from customer, application and bureau data the lender already holds.",
    solution: "A logistic-regression scorecard on WOE-binned features: data extracted with Oracle SQL, prepared and screened (WOE / IV) in Python, validated on hold-out data, scaled to points and cut into risk bands.",
    contribution: "Built the modelling dataset in Oracle SQL, prepared the data, ran WOE / IV and feature selection in Python, trained, validated and scaled the model, and defined the risk bands.",
    outcome: "An explainable risk score and risk bands that credit teams can use to rank applicants and frame approval policy.", // VERIFY wording
  },
  users: "Credit risk and credit policy teams; the validation pack is summarised for credit committee review.",
  process: "Credit underwriting: application-stage risk assessment, cut-off setting and risk-based approval policy.",
  overviewNote: "Charts in this case study run on a synthetic portfolio with the same structure as the real work. Performance figures appear only inside labelled demo visuals; no company results are shown.",

  problemText: [
    "Lending decisions depend on judging default risk at the application stage. When that judgement rests on individual experience, two similar applicants can get different answers, and it is hard to explain afterwards why a loan was approved.",
    "A scorecard gives every applicant a number on the same scale, built from customer, application, bureau and repayment data the lender already holds, with each feature’s contribution visible. Credit committees, auditors and regulators can read it line by line, which is why WOE-based logistic scorecards are widely used in retail lending.",
  ],
  problemPoints: [
    "How likely is this applicant to become 90+ DPD within 12 months?",
    "Which variables genuinely separate good and bad borrowers — and which only add noise?",
    "Where should cut-offs sit, and which risk bands map to approve, refer or decline?",
  ],
  objective: "Estimate each applicant’s probability of becoming a bad loan (90+ DPD within 12 months) from information available at application, and express it as a points score with clear risk bands.",
  objectives: [
    "Build one clean modelling row per application from customer, application, bureau and repayment data.",
    "Screen a broad feature universe with WOE and IV and keep only stable, explainable features.",
    "Fit a logistic regression and validate it on hold-out data: ROC-AUC, Gini, KS, confusion matrix and deciles.",
    "Convert probability of default into a points score and risk bands that credit policy can use.",
  ],
  role: [
    "Defined the observation and performance windows and the good / bad definition with the business.",
    "Wrote the Oracle SQL that builds one row per application with pre-application behaviour, bureau fields and the outcome flag.",
    "Prepared the data: cleaning, missing-value treatment and variable analysis (distribution and bad rate by bin) for every candidate feature.",
    "Binned features, computed WOE and IV in Python, and selected features on IV, WOE monotonicity, correlation and business sense.",
    "Trained the logistic regression, validated it on hold-out data (ROC-AUC, Gini, KS, confusion matrix, decile table) and scaled it to scorecard points.",
    "Defined score bands and their bad rates for policy discussions.",
  ],

  data: {
    text: "One row per disbursed application in the observation window, joined to bureau information and to repayment history before the application (features) and after disbursal (outcome). The demo uses a synthetic portfolio with the same structure.",
    sources: [
      { name: "Application", grain: "1 row per application", fields: "application date, loan amount, tenure, product, region, declared monthly income" },
      { name: "Bureau", grain: "1 pull per application", fields: "bureau score, existing EMI obligations (missing when there is no bureau record)" },
      { name: "Customer", grain: "1 row per customer", fields: "age, customer since, other loans with the lender" },
      { name: "Repayment history", grain: "loan × month", fields: "amount due, amount paid, DPD, bounce flag" },
      { name: "Outcome", grain: "derived", fields: "bad = max DPD ≥ 90 in the 12 months after disbursal" },
    ],
    processing: [
      "Feature universe: application, bureau, customer and repayment-behaviour variables, all measured as of the application date.",
      "Engineered ratios such as payment ratio (paid ÷ due) and an affordability ratio of EMI obligations to income (FOIR in the demo data).",
      "Missing-value treatment: a missing bureau score or no repayment history (new-to-credit) is kept as its own bin; data-entry gaps were traced to the source first.",
      "Variable analysis: distribution and bad rate by bin for every candidate; bins merged until WOE is monotonic and every bin holds enough bads.",
      "Stratified train / hold-out split; binning, WOE and the correlation check fitted on the training set only.",
    ],
    validation: [
      "Row counts and total disbursed amount reconciled to the source system for the window.",
      "One row per application — checked for duplicates after every join.",
      "Feature dates strictly before the application date; outcome dates strictly after disbursal.",
      "Missing bureau scores and new-to-credit customers given their own bin instead of being dropped.",
      "Bad rate checked month by month so no vintage behaves abnormally.",
    ],
  },
  techUse: [
    { t: "Oracle", use: "Source tables for applications, customers, bureau fields and repayment history." },
    { t: "SQL", use: "Modelling extract (one row per application, look-back features, outcome flag) and reconciliation queries." },
    { t: "Python", use: "The modelling script: preparation, binning, WOE / IV, selection, training, validation and scaling." },
    { t: "Pandas", use: "Cleaning, missing-value bins, binning, bad rate by bin and WOE tables." },
    { t: "NumPy", use: "Log-odds, WOE smoothing and score scaling (points = offset + factor × ln odds)." },
    { t: "Scikit-learn", use: "Stratified split, logistic regression, ROC-AUC, ROC curve and confusion matrix." },
    { t: "WOE / IV", use: "Transforming features to a common log-odds scale and screening them for predictive power." },
    { t: "Logistic Regression", use: "Probability of default from WOE-encoded features; coefficients turn into points per bin." },
  ],

  workflow: {
    text: "From raw bureau and application data to a scorecard the credit team can use.",
    steps: [
      { t: "Raw Bureau Data", d: "bureau, application, customer and repayment tables extracted with Oracle SQL" },
      { t: "Feature Engineering", d: "look-back behaviour, payment and affordability ratios, missing-value bins" },
      { t: "WOE / IV", d: "bin each feature; weight of evidence per bin, information value per feature" },
      { t: "Feature Selection", d: "IV ≥ 0.02, monotonic WOE, low correlation, business sense, leakage check" },
      { t: "Logistic Regression", d: "fitted on WOE-encoded features, validated on hold-out data" },
      { t: "Probability of Default", d: "PD per applicant; ROC-AUC, Gini, KS, confusion matrix, deciles" },
      { t: "Scorecard", d: "points scaled with a PDO; risk bands A–E for policy" },
    ],
  },
  architecture: {
    text: "Batch modelling pipeline: Oracle for extraction, Python for everything from preparation to scaling.",
    lanes: [
      { lane: "Sources", nodes: [{ t: "Oracle", d: "application, customer, bureau fields, repayment history", key: true, db: true }] },
      { lane: "Extraction", nodes: [{ t: "Oracle SQL extract", d: "1 row per application · 12-month look-back · outcome flag", key: true }, { t: "Reconciliation", d: "counts, amounts, duplicates" }] },
      { lane: "Preparation", nodes: [{ t: "Pandas / NumPy", d: "cleaning, ratios, missing-value bins" }, { t: "Variable analysis", d: "distribution, bad rate by bin" }] },
      { lane: "Modelling", nodes: [{ t: "WOE / IV", d: "binning and screening", key: true }, { t: "Feature selection" }, { t: "Logistic regression", d: "scikit-learn" }] },
      { lane: "Validation", nodes: [{ t: "Hold-out tests", d: "ROC-AUC, Gini, KS, confusion matrix" }, { t: "Rank ordering", d: "deciles, band bad rates" }] },
      { lane: "Output", nodes: [{ t: "Points table" }, { t: "Risk bands A–E" }, { t: "Validation pack" }] },
    ],
  },
  model: {
    text: "A star-shaped modelling extract: the application is the centre; bureau, customer and repayment history hang off it.",
    entities: [
      { name: "loan_application", fields: [["app_id", "pk"], ["customer_id", "fk"], ["loan_id", "fk"], ["app_date"], ["monthly_income"], ["loan_amount"], ["tenure_months"], ["product"], ["region"]] },
      { name: "bureau_snapshot", fields: [["app_id", "fk"], ["pull_date"], ["bureau_score"], ["existing_emi"]] },
      { name: "customer", fields: [["customer_id", "pk"], ["dob"], ["customer_since"]] },
      { name: "repayment_monthly", fields: [["loan_id", "fk"], ["customer_id", "fk"], ["snapshot_month"], ["amount_due"], ["amount_paid"], ["dpd"], ["bounce_flag"]] },
      { name: "model_dataset", fields: [["app_id", "pk"], ["bureau_score"], ["prev_max_dpd"], ["emi_bounce_12m"], ["payment_ratio"], ["foir"], ["bad_flag"]] },
      { name: "scorecard_bins", fields: [["feature", "pk"], ["bin", "pk"], ["woe"], ["points"]] },
    ],
    note: "Synthetic schema for illustration. Table and column names are not from any employer system.",
  },

  sql: {
    title: "Build the modelling dataset without leakage",
    text: "The key design choice is the time split: behaviour features come from the 12 months before the application, the outcome from the 12 months after disbursal. Representative code on a synthetic schema.",
    code: `-- Representative Oracle SQL on a synthetic schema — not production code
WITH obs AS (                         -- disbursed applications in the observation window
  SELECT a.app_id, a.loan_id, a.customer_id, a.app_date,
         a.monthly_income, a.loan_amount, a.tenure_months,
         b.bureau_score, b.existing_emi                    -- NULL when there is no bureau record
    FROM loan_application a
    LEFT JOIN bureau_snapshot b ON b.app_id = a.app_id
   WHERE a.app_date BETWEEN DATE '2023-04-01' AND DATE '2024-03-31'
     AND a.status = 'DISBURSED'
),
hist AS (                             -- behaviour BEFORE the application
  SELECT o.app_id,
         COUNT(r.snapshot_month)                              AS hist_months,  -- 0 = new to credit
         MAX(r.dpd)                                           AS prev_max_dpd,
         SUM(CASE WHEN r.bounce_flag = 'Y' THEN 1 ELSE 0 END) AS emi_bounce_12m,
         ROUND(SUM(r.amount_paid) / NULLIF(SUM(r.amount_due), 0), 3) AS payment_ratio
    FROM obs o
    LEFT JOIN repayment_monthly r
           ON r.customer_id = o.customer_id
          AND r.snapshot_month BETWEEN ADD_MONTHS(TRUNC(o.app_date, 'MM'), -12)
                                   AND ADD_MONTHS(TRUNC(o.app_date, 'MM'), -1)
   GROUP BY o.app_id
),
perf AS (                             -- outcome AFTER disbursal
  SELECT o.loan_id, MAX(r.dpd) AS max_dpd_12m
    FROM obs o
    JOIN repayment_monthly r
      ON r.loan_id = o.loan_id
     AND r.snapshot_month BETWEEN ADD_MONTHS(TRUNC(o.app_date, 'MM'), 1)
                              AND ADD_MONTHS(TRUNC(o.app_date, 'MM'), 12)
   GROUP BY o.loan_id
)
SELECT o.*, h.hist_months, h.prev_max_dpd, h.emi_bounce_12m, h.payment_ratio,
       CASE WHEN p.max_dpd_12m >= 90 THEN 1 ELSE 0 END AS bad_flag
  FROM obs o
  JOIN hist h      ON h.app_id  = o.app_id
  LEFT JOIN perf p ON p.loan_id = o.loan_id;`,
    points: [
      "The look-back window is built with ADD_MONTHS / TRUNC, so every application gets the same 12 months of history.",
      "LEFT JOINs keep applicants with no bureau record or no history; their NULLs become the ‘Missing’ bin rather than being dropped.",
      "NULLIF guards the payment ratio against zero-due months.",
      "Validation queries run alongside: counts and bad rate by month, duplicate app_id check.",
    ],
  },
  python: {
    title: "Missing values, WOE / IV, selection, model, validation and scaling",
    text: "Representative, simplified code. Pandas for binning and WOE, scikit-learn for the model and metrics, NumPy for the score scaling.",
    code: `# Representative, simplified — synthetic column names
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve, confusion_matrix
from sklearn.model_selection import train_test_split

train, test = train_test_split(df, test_size=0.3, stratify=df.bad_flag, random_state=42)

def bin_feature(s, edges):
    b = pd.cut(s, edges, include_lowest=True)
    return b.cat.add_categories("Missing").fillna("Missing")       # missing = its own bin

def woe_table(d, f, target="bad_flag"):
    g = d.groupby(bin_feature(d[f], BINS[f]), observed=True)[target].agg(total="count", bad="sum")
    g["good"] = g.total - g.bad
    pct_good = (g.good + 0.5) / g.good.sum()                         # +0.5 avoids log(0)
    pct_bad = (g.bad + 0.5) / g.bad.sum()
    g["woe"] = np.log(pct_good / pct_bad)                            # WOE = ln(%good / %bad)
    g["iv"] = (pct_good - pct_bad) * g.woe
    return g

T = {f: woe_table(train, f) for f in BINS}                           # fitted on train only
IV = {f: t.iv.sum() for f, t in T.items()}

def monotonic(t):
    step = t.woe.drop("Missing", errors="ignore").diff().dropna()
    return (step >= 0).all() or (step <= 0).all()

def to_woe(d, feats):
    return pd.DataFrame({f: bin_feature(d[f], BINS[f]).map(T[f].woe.to_dict()).astype(float) for f in feats})

# selection: IV >= 0.02 and monotonic WOE, then drop the weaker of any highly correlated pair
short = sorted((f for f in BINS if IV[f] >= 0.02 and monotonic(T[f])), key=lambda f: -IV[f])
corr = to_woe(train, short).corr().abs()
keep = []
for f in short:                                                      # strongest first
    if all(corr.loc[f, k] < 0.7 for k in keep):
        keep.append(f)
review = [f for f in keep if IV[f] > 0.5]                            # suspiciously strong: leakage review

model = LogisticRegression(max_iter=1000).fit(to_woe(train, keep), train.bad_flag)
pd_test = model.predict_proba(to_woe(test, keep))[:, 1]              # probability of default

auc = roc_auc_score(test.bad_flag, pd_test)
fpr, tpr, _ = roc_curve(test.bad_flag, pd_test)
gini, ks = 2 * auc - 1, (tpr - fpr).max()
cm = confusion_matrix(test.bad_flag, pd_test >= CUTOFF)              # cut-off agreed with credit

# points: 600 at 30:1 good:bad odds, 20 points to double the odds (PDO)
factor = 20 / np.log(2)
offset = 600 - factor * np.log(30)
score = offset + factor * np.log((1 - pd_test) / pd_test)            # higher = safer
band = pd.qcut(score, 5, labels=["E", "D", "C", "B", "A"])           # A = lowest risk`,
    points: [
      "Missing values get their own bin, so ‘no bureau record’ carries its own WOE instead of being imputed or dropped.",
      "Binning, WOE and the correlation check use the training set only; the hold-out set is scored with the same maps.",
      "IV above 0.5 triggers a leakage review rather than automatic acceptance.",
      "KS is computed as max(TPR − FPR), which equals the largest gap between the cumulative bad and good distributions.",
    ],
  },
  logic: {
    heading: "Machine learning",
    text: "Logistic regression on WOE-encoded features is the classic credit scorecard: each feature adds to the log-odds independently, so every applicant’s score breaks down line by line into points per feature.",
    points: [
      "Target: bad = 90+ DPD within 12 months of disbursal.",
      "Feature universe: application, bureau, customer and repayment-behaviour variables measured before the application.",
      "Selection: IV ≥ 0.02, monotonic WOE, low correlation between features, business sense; IV above 0.5 reviewed for leakage.",
      "Split: stratified train / hold-out; WOE maps fitted on train only.",
      "Validation: ROC-AUC, Gini (= 2 × AUC − 1), KS, confusion matrix at the agreed cut-off, decile table, band-wise bad rates, coefficient signs.",
      "Scaling: points = offset + factor × ln(odds of good), with a fixed number of points to double the odds (PDO).",
    ],
    rules: [
      { rule: "Band A · very low risk", condition: "Highest score band", outcome: "Approve" },
      { rule: "Band B · low risk", condition: "Second band", outcome: "Approve" },
      { rule: "Band C · medium risk", condition: "Middle band", outcome: "Approve with conditions (e.g. co-applicant, lower amount)" },
      { rule: "Band D · high risk", condition: "Fourth band", outcome: "Refer to a credit manager" },
      { rule: "Band E · very high risk", condition: "Lowest score band", outcome: "Decline or restructure the request" },
    ],
    rulesNote: "Illustrative band-to-policy mapping for discussion — not actual company policy. In the demo data the bands are equal-sized score quintiles.",
  },
  dashboard: {
    text: "The validation pack on one page: is the score separating good from bad borrowers, and which features drive it?",
    visual: "sc-dashboard",
    outputs: [
      "Risk score (points) for every application.",
      "Risk band A–E, with the bad rate of each band.",
      "Scorecard points table: feature bin → WOE → points.",
      "Validation pack: ROC-AUC, Gini, KS, confusion matrix and decile table on hold-out data.",
      "IV and WOE tables for every candidate feature, with the reason each was kept or dropped.",
    ],
  },
  insights: {
    note: "Patterns illustrated with synthetic data. They describe what this kind of analysis surfaces; no company results are shown.",
    items: [
      "Prior repayment behaviour (max DPD, payment ratio, bounces) and affordability (FOIR in the demo data) separate good and bad applicants far better than demographics such as age or region.",
      "Bureau score is strong but not sufficient on its own; combining it with in-house repayment history adds discrimination.",
      "The riskiest band carries a bad rate many times the safest band’s, which is what makes band-wise policy possible.",
      "Age, region and product carry almost no IV in the demo data, so the score treats applicants alike on those once behaviour is accounted for.",
    ],
  },
  impact: {
    before: ["Application risk judged case by case, so similar applicants could get different answers", "Little visibility of which factors drove a decision", "Cut-offs hard to set or defend without a common scale"],
    solution: ["Oracle SQL modelling dataset with a strict time split", "Missing-value treatment, WOE / IV and feature selection in Python", "Logistic regression validated on hold-out data", "Points score and risk bands A–E"],
    after: ["Every applicant ranked on the same explainable scale", "Each score breaks down into points per feature", "Band-wise bad rates give credit policy a common language"],
    items: [
      "Consistent, explainable risk ranking for every applicant.",
      "A common language for credit policy: score bands and their bad rates.",
      "A documented, repeatable modelling process from extraction to bands.",
    ],
  },
  challenges: [
    "Defining the outcome window so recent loans were not counted as ‘good’ simply because they had not had time to go bad.",
    "Missing bureau data and new-to-credit applicants — kept as their own bin, because being missing is itself informative.",
    "Sparse bins for rare values (e.g. 4+ bounces) — handled by merging bins and smoothing WOE.",
    "A very strong feature (max DPD) needed a leakage check before it was accepted.",
  ],
  learnings: [
    "Time-based design (observation vs performance window) matters more than the choice of algorithm.",
    "A model the business can explain gets used; a slightly better black box often does not.",
    "WOE turns skewed, capped or missing inputs into one stable, comparable scale.",
  ],
  screenshots: ["sc-dashboard", "sc-iv", "sc-woe-grid", "sc-select", "sc-roc", "sc-ks", "sc-cm", "sc-score", "sc-segments", "sc-gains"],
  future: [
    "Population stability (PSI) monitoring on the score and top features, with band bad rates tracked monthly.",
    "Out-of-time validation on a later cohort before any recalibration.",
    "Reject inference to correct for applicants who were never approved.",
    "Scoring inside the application flow so the band is available at underwriting.",
    "Version-controlled binning tables so every score can be reproduced for audit.",
  ],

  interview: {
    s30: "I built a credit risk scorecard that ranks loan applicants by probability of default. In Oracle SQL I created one row per application from customer, application, bureau and repayment data, using behaviour only from before the application. In Python I treated missing values, binned features, calculated WOE and IV, selected strong and stable variables, trained a logistic regression, validated it on hold-out data and scaled it into points and risk bands credit teams can explain.",
    s90: "Credit teams needed a consistent, explainable way to judge default risk at the application stage, so I built a logistic-regression scorecard end to end. In Oracle SQL I created one row per disbursed application. Features came from customer, application and bureau data and from repayment behaviour in the twelve months before the application; the outcome, ninety or more days past due, came from the twelve months after disbursal, so nothing leaked. In Python I prepared the data and treated missing values as their own bins, because a missing bureau score is itself informative. I binned every candidate feature, calculated weight of evidence and information value, and kept features with real signal, a monotonic WOE trend, low correlation with each other and clear business sense. Very strong features got a leakage check before they were accepted. I trained the logistic regression on WOE inputs and validated it on a hold-out set with ROC-AUC, Gini, KS, a confusion matrix at the agreed cut-off and a decile table. Finally I scaled the probability into points, with a fixed number of points to double the odds, and split applicants into five risk bands. The result is a score a credit committee can read line by line and bands that map to approve, refer or decline.",
    role: ["Designed the dataset and the good / bad definition", "Oracle SQL extract with a strict time split", "Data preparation, missing-value bins, WOE / IV and feature selection in Python", "Trained, validated and scaled the logistic regression", "Defined the risk bands for policy"],
    tech: ["Oracle SQL", "Python", "Pandas", "NumPy", "Scikit-learn", "WOE / IV", "Logistic regression"],
    impact: ["Consistent, explainable risk ranking", "Every score breaks down into feature points", "Risk bands as a common policy language"],
    challenges: ["Outcome window long enough that recent loans are not falsely ‘good’", "Missing bureau data kept as information", "Sparse bins merged and WOE smoothed", "Leakage check on very strong features"],
    questions: [
      { q: "Why did you choose logistic regression?", a: ["Output is a probability and the coefficients are interpretable — each feature’s contribution to the score can be shown line by line.", "With WOE-encoded features it is the standard scorecard form that credit committees, auditors and regulators understand.", "It performs close to tree ensembles when features are well engineered (the personal ML lab on this site compares them).", "It is stable and easy to monitor and recalibrate."] },
      { q: "What is WOE?", a: ["Weight of Evidence for a bin = ln(% of all goods in the bin ÷ % of all bads in the bin).", "Positive WOE: the bin holds relatively more goods (safer); negative: relatively more bads.", "It puts every feature on the same log-odds scale, gives missing values their own bin, and makes the feature–target relationship monotonic and linear for logistic regression."] },
      { q: "What is IV and how did you use it?", a: ["Information Value = Σ (%good − %bad) × WOE across bins. It measures how well a feature separates goods and bads.", "Rule of thumb: < 0.02 not useful, 0.02–0.1 weak, 0.1–0.3 medium, 0.3–0.5 strong, > 0.5 suspicious.", "I used it to shortlist features, then checked WOE monotonicity, correlation between features and business sense before the final selection."] },
      { q: "How did you select the final features?", a: ["Dropped anything with IV below 0.02.", "Required a monotonic WOE trend; bins were merged until the trend made sense or the feature was dropped.", "Among correlated features, kept the one with higher IV and clearer business meaning.", "Checked coefficient signs after fitting and reviewed any IV above 0.5 for leakage."] },
      { q: "How did you treat missing values?", a: ["A missing bureau score or no repayment history (new-to-credit) was kept as a separate bin with its own WOE — the fact that it is missing is itself informative.", "Data-entry gaps were traced back to the source table first; only genuinely unknown values went into the Missing bin.", "No mean imputation: it would hide a group whose risk differs from the average."] },
      { q: "How did you avoid data leakage?", a: ["Strict time split: features only from before the application date, outcome only after disbursal.", "No post-disbursal fields (collections status, restructuring flags) in the feature set.", "Binning and WOE fitted on the training set only, then applied to the hold-out.", "Any feature with IV above 0.5 was reviewed specifically for leakage."] },
      { q: "How did you validate the model?", a: ["Hold-out set never used in binning or training.", "Discrimination: ROC-AUC, Gini (= 2 × AUC − 1) and KS.", "Confusion matrix at the cut-off agreed with credit, to show recall and precision in business terms.", "Rank ordering: decile table with the bad rate falling steadily from the riskiest to the safest decile; band bad rates monotonic.", "Coefficient signs consistent with the WOE direction."] },
      { q: "What do KS and Gini tell you?", a: ["KS is the maximum gap between the cumulative distributions of bads and goods when applicants are ranked by score — how well the score separates them at its best cut.", "Gini measures ranking ability across all cut-offs; it is a rescaled AUC (2 × AUC − 1).", "Both measure ranking, not calibration, so band bad rates are checked separately."] },
      { q: "How do you turn a probability into a score?", a: ["Score = offset + factor × ln(odds of good).", "Factor = PDO ÷ ln 2; the offset fixes the score at chosen base odds (for example 600 points at 30:1).", "Every PDO points (for example 20) doubles the odds of being good, so bands can be set in clean steps."] },
      { q: "What was your contribution?", a: ["End to end: dataset design and Oracle SQL, data preparation and missing-value treatment, WOE / IV and feature selection, model training, validation and scaling, and the risk-band definitions."] },
    ],
  },
});
