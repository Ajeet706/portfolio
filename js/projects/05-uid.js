/* Case study — Customer UID & Data Quality Management (SK Finance, professional)
   Confirmed scope: customer uniqueness logic, duplicate identification, UID creation /
   assignment, data-quality validation, record matching and reporting.
   All records are fictional; identifiers are dummy and PAN / mobile are masked.
   Code is representative (generic SQL + Python) on a synthetic schema. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "uid",
  order: 5,
  company: "sk",
  kind: "professional",
  featured: false,
  title: "Customer UID & Data Quality Management",
  short: "Customer UID",
  domain: "Data Quality / Customer Master",
  domains: ["NBFC", "Data Quality"],
  techTags: ["SQL", "Python"],  // VERIFY: stack not stated in the brief
  tech: ["SQL", "Python", "Fuzzy matching"],
  thumb: "uid-dashboard",
  problem: "One real customer often appears as several records. Find the duplicates, give each real customer one unique ID, and measure the quality of the fields that matching depends on.",

  summary: {
    problem: "The same customer existed under multiple customer records, so customer counts, customer-level exposure and any check that runs per customer were split or overstated.",
    solution: "Standardise the identifying fields, match records with exact and fuzzy rules, detect duplicate groups, assign one stable UID per real customer, build a golden record, and report data quality.",
    contribution: "Customer uniqueness logic, duplicate identification, record matching, UID creation and assignment, data-quality validation and reporting.",
    outcome: "A single customer view — one UID per real customer — with the duplicate rate and field-level data quality measured and visible.", // VERIFY wording
  },
  users: "Data and MIS teams, and downstream reporting that needs one record per real customer.", // VERIFY
  process: "Customer master data management: de-duplication, unique customer identification and data-quality reporting.",
  overviewNote: "All records in this case study are fictional. Identifiers are dummy, PAN and mobile values are masked, and every count is demo data.",

  problemText: [
    "Customer records are created at onboarding for each loan. A repeat borrower, a co-applicant who later borrows, or a branch transfer can each create a new record for the same person, with small differences in spelling, date formats or address.",
    "Without a unique customer ID, customer counts in MIS are wrong, exposure per customer is split across records, and anything that should run once per person runs on fragments. Matching itself depends on the identifying fields, so their quality has to be measured too.",
  ],
  problemPoints: [
    "How many unique customers do we actually have?",
    "Which records belong to the same person — and which only look similar?",
    "Which identifying fields are incomplete or badly formatted?",
  ],
  objective: "Create and maintain a unique identity for every real customer: identify duplicate customer records, link them under one stable UID with a golden record, and measure the quality of the fields that matching depends on.",
  objectives: [
    "Define what makes a customer unique.",
    "Identify duplicate records with exact and fuzzy matching.",
    "Assign one UID per real customer, stable across runs.",
    "Validate key fields and report duplicate and data-quality metrics.",
  ],
  role: [
    "Defined the customer-uniqueness logic: which fields and combinations identify one person.",
    "Built record matching: standardisation, blocking, exact rules and fuzzy name similarity.",
    "Identified duplicate customer records and grouped linked records into one customer.",
    "Created and assigned UIDs, keeping them stable across runs.",
    "Validated data quality: completeness and format of the identifying fields.",
    "Reported duplicate and data-quality metrics.",
  ],

  data: {
    text: "Customer records from loan onboarding with the identifying fields used for matching. The demo uses fictional names and dummy identifiers.",
    sources: [
      { name: "Customer records", grain: "1 row per customer record", fields: "name, DOB, mobile, PAN, address, pincode, email, branch" },
      { name: "Loan link", grain: "loan → customer record", fields: "loan ID, applicant / co-applicant role" },
      { name: "Candidate pairs", grain: "1 row per record pair", fields: "blocking key, name similarity, DOB / mobile / PAN agreement, score, decision" },
      { name: "UID register", grain: "customer record → UID", fields: "UID, match basis, score, assigned date" },
      { name: "Golden record", grain: "1 row per UID", fields: "best name, DOB, mobile, PAN, record and loan counts" },
    ],
    processing: [
      "Identifying fields are standardised before any comparison: upper-case names without titles or punctuation, one date format, the last 10 digits of mobile, and PAN only when it fits the PAN pattern.",
      "Candidate pairs come from blocking on PAN or on DOB + mobile, then are scored in Python.",
      "Auto-linked pairs are grouped into customers; each group gets one UID and a golden record.",
    ],
    validation: [
      "Completeness per field, treating placeholders such as ‘NA’ or ‘0000000000’ as missing.",
      "Format validity: PAN pattern, 10-digit mobile, plausible DOB, 6-digit pincode.",
      "UIDs stable between runs: a customer keeps the same UID unless records are deliberately re-linked.",
      "Borderline pairs reviewed by a person before they are linked.",
    ],
  },
  techUse: [
    { t: "SQL", use: "Standardised view of identifying fields, blocking (candidate pairs), duplicate summaries and data-quality counts." },
    { t: "Python", use: "Pair scoring, threshold decisions, grouping linked records and assigning UIDs; loading candidate pairs, computing scores, building the UID register, golden record and reports." },
    { t: "Fuzzy matching", use: "Name similarity that tolerates spelling variants, initials and word order." },
  ],

  workflow: {
    text: "From raw customer records to one record per real customer.",
    steps: [
      { t: "Customer Data", d: "customer records from loan onboarding — standardised and validated" },
      { t: "Matching", d: "blocking on PAN or DOB + mobile; exact rules, then fuzzy name score" },
      { t: "Duplicate Detection", d: "auto-link, manual review or no match; linked pairs grouped" },
      { t: "UID", d: "one UID per group, reused from earlier runs where it exists" },
      { t: "Golden / Unique Customer Record", d: "best value of each field; feeds reporting" },
    ],
  },
  architecture: {
    text: "Batch pipeline: SQL prepares and blocks, Python scores and resolves, outputs feed reporting.",
    lanes: [
      { lane: "Source", nodes: [{ t: "Customer records", d: "from loan onboarding", db: true }, { t: "Loan link", d: "loan → customer record" }] },
      { lane: "Prepare (SQL)", nodes: [{ t: "Standardise", d: "name, DOB, mobile, PAN", key: true }, { t: "Validate", d: "completeness, format" }] },
      { lane: "Match", nodes: [{ t: "Blocking", d: "SQL · PAN or DOB + mobile" }, { t: "Pair scoring", d: "Python · exact + fuzzy", key: true }, { t: "Thresholds", d: "auto-link · review · no match" }] },
      { lane: "Resolve", nodes: [{ t: "Group linked records", d: "connected groups" }, { t: "UID register", d: "stable across runs", key: true, db: true }, { t: "Manual review", d: "borderline pairs" }] },
      { lane: "Output", nodes: [{ t: "Golden record" }, { t: "Duplicate summary" }, { t: "Data quality dashboard" }] },
    ],
  },
  model: {
    text: "A UID register sits between customer records and every customer-level report.",
    entities: [
      { name: "customer_record", fields: [["cust_id", "pk"], ["full_name"], ["dob"], ["mobile"], ["pan"], ["address"], ["pincode"], ["branch_code"]] },
      { name: "customer_std", fields: [["cust_id", "fk"], ["name_key"], ["dob_std"], ["mobile_std"], ["pan_std"], ["dq_flags"]] },
      { name: "match_pair", fields: [["cust_a", "fk"], ["cust_b", "fk"], ["block_key"], ["name_sim"], ["score"], ["decision"]] },
      { name: "uid_register", fields: [["cust_id", "pk"], ["uid"], ["match_basis"], ["assigned_on"]] },
      { name: "golden_customer", fields: [["uid", "pk"], ["name"], ["dob"], ["mobile"], ["pan"], ["record_count"]] },
    ],
    note: "Representative design. Table and column names are illustrative.",
  },

  sql: {
    title: "Blocking and the duplicate summary",
    text: "Representative pattern. Comparing every record with every other is n² pairs, so SQL only pairs records that share a blocking key; the duplicate summary is a simple group-by on the UID register.",
    code: `-- Representative SQL (generic ANSI) on a synthetic schema — not production code
-- 1) Candidate pairs: two equi-joins, one per blocking key
SELECT a.cust_id AS cust_a, b.cust_id AS cust_b, 'PAN' AS block_key
  FROM customer_std a
  JOIN customer_std b
    ON a.pan_std = b.pan_std                  -- invalid / missing PAN is NULL and never joins
   AND a.cust_id < b.cust_id                  -- no self-pairs, no mirrored pairs
UNION ALL
SELECT a.cust_id, b.cust_id, 'DOB+MOBILE'
  FROM customer_std a
  JOIN customer_std b
    ON a.dob_std = b.dob_std
   AND a.mobile_std = b.mobile_std
   AND a.cust_id < b.cust_id;

-- 2) Duplicate summary after UID assignment
SELECT r.uid,
       COUNT(DISTINCT r.cust_id)     AS records,
       COUNT(DISTINCT l.loan_id)     AS loans,
       COUNT(DISTINCT c.branch_code) AS branches
  FROM uid_register r
  JOIN customer_record c     ON c.cust_id = r.cust_id
  LEFT JOIN loan_customer l  ON l.cust_id = r.cust_id
 GROUP BY r.uid
HAVING COUNT(DISTINCT r.cust_id) > 1
 ORDER BY records DESC;`,
    points: [
      "Two equi-joins combined with UNION ALL use indexes better than one join with OR; a pair found by both keys is de-duplicated in Python.",
      "Standardisation makes NULL mean ‘missing or invalid’, so bad values cannot create false pairs.",
      "COUNT(DISTINCT …) keeps record and loan counts correct when one record has several loans.",
    ],
  },
  python: {
    title: "Score pairs, group linked records, assign stable UIDs",
    text: "Representative, simplified code. Names are compared on an order-insensitive key; linked pairs are grouped so chains (A≈B, B≈C) become one customer.",
    code: `# Representative Python — synthetic schema, not production code
import re
from difflib import SequenceMatcher
import pandas as pd

TITLES = {"MR", "MRS", "MS", "DR", "SHRI", "SMT"}

def name_key(name) -> str:
    tokens = re.sub(r"[^A-Z ]", " ", str(name).upper()).split()
    return " ".join(sorted(t for t in tokens if t not in TITLES))   # word order ignored

def name_sim(a, b) -> int:
    return round(100 * SequenceMatcher(None, name_key(a), name_key(b)).ratio())

def score(r):
    sim = name_sim(r.name_a, r.name_b)
    if pd.notna(r.pan_a) and r.pan_a == r.pan_b:                     # same valid PAN
        return (100, "auto_link") if sim >= 60 else (0, "review_pan_conflict")
    s = 0.5 * sim + 30 * (r.dob_a == r.dob_b) + 20 * (r.mobile_a == r.mobile_b)
    if pd.notna(r.pan_a) and pd.notna(r.pan_b):                      # two valid PANs that differ
        s = min(s, 60)
    s = round(s)
    return s, "auto_link" if s >= 90 else "review" if s >= 75 else "no_match"

pairs = pairs.drop_duplicates(["cust_a", "cust_b"])
pairs[["score", "decision"]] = pairs.apply(score, axis=1, result_type="expand")

parent = {}
def find(x):                                                         # union-find
    parent.setdefault(x, x)
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

for a, b in pairs.loc[pairs.decision == "auto_link", ["cust_a", "cust_b"]].itertuples(index=False):
    parent[find(a)] = find(b)

groups = customers.groupby(customers.cust_id.map(find)).cust_id.apply(list)
prev = pd.read_sql("SELECT cust_id, uid FROM uid_register", conn).set_index("cust_id")["uid"]

rows = []
for members in groups:
    known = sorted(prev.reindex(members).dropna().unique())
    uid = known[0] if known else next_uid()                          # keep UIDs stable
    rows += [(m, uid) for m in members]
uid_map = pd.DataFrame(rows, columns=["cust_id", "uid"])`,
    points: [
      "Same valid PAN with similar names links at once; a shared PAN on very different names goes to review as a data-quality issue.",
      "Two valid PANs that differ cap the score, so different people are never auto-linked on name, DOB and mobile alone.",
      "If a group already holds a UID it is reused (the oldest, if two groups merge), so reports do not break between runs.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Matching is rule- and similarity-based so every link can be explained to the business. The rules below show how decisions are made; thresholds and weights are representative.",
    points: [
      "A false merge is worse than a missed duplicate — it would combine two people’s exposure — so name similarity alone never auto-links.",
      "Borderline scores go to a person; reviewed decisions are kept so the same pair is not re-scored every run.",
      "Survivorship rules decide which value of each field goes into the golden record.",
    ],
    rulesNote: "Representative thresholds and weights — illustrative, not production values.",
    rules: [
      { rule: "PAN rule", condition: "Same valid PAN and name similarity ≥ 60", outcome: "Auto-link (score 100)" },
      { rule: "PAN conflict", condition: "Same valid PAN but very different names", outcome: "Manual review + data-quality flag" },
      { rule: "Different PANs", condition: "Both records carry valid PANs that differ", outcome: "Score capped at 60 — no auto-link" },
      { rule: "Score: auto-link", condition: "0.5 × name sim + 30 (DOB) + 20 (mobile) ≥ 90", outcome: "Auto-link" },
      { rule: "Score: review", condition: "Score 75–89", outcome: "Manual review" },
      { rule: "Score: no match", condition: "Score below 75", outcome: "Stays a separate customer" },
      { rule: "UID", condition: "Linked group already has a UID", outcome: "Reuse the oldest UID; otherwise create a new one" },
      { rule: "Golden record", condition: "Several values for one field", outcome: "Valid, most frequent, most recent value wins" },
    ],
  },
  dashboard: {
    text: "Data quality dashboard after a UID run. Other outputs below.",
    visual: "uid-dashboard",
    outputs: ["UID register (customer record → UID)", "Golden / unique customer record per UID", "Duplicate summary with the largest groups", "Manual review list of borderline pairs", "Field-level data-quality report"],
  },
  insights: {
    note: "Patterns from the demo data and from how matching behaves. No company results are shown.",
    items: [
      "In the demo data most duplicates come from repeat borrowers being onboarded again for a new loan rather than from typing errors — so the fix belongs at onboarding.",
      "Where PAN is present and valid, matching is close to certain; PAN completeness is the field-quality metric that matters most.",
      "Optional fields such as email are too incomplete to use as match keys.",
      "A shared PAN on two very different names is almost always a data-entry error, so it is reported, not merged.",
    ],
  },
  impact: {
    before: ["Same customer under several records", "Customer counts and exposure split across records", "No measure of identifying-field quality"],
    solution: ["SQL standardisation and blocking", "Python scoring with exact and fuzzy rules", "Stable UID register and golden record", "Duplicate and data-quality reporting"],
    after: ["One UID per real customer across loans", "Duplicate rate and field quality measured", "Customer-level reporting on one key"],
    items: ["One customer, one ID across loans.", "Measured duplicate rate and field-level data quality.", "Customer-level counts and exposure reported on a single key.", "Data-entry problems made visible at field level."],
  },
  challenges: [
    "Name variation — initials, titles, spelling and word order — handled with standardisation plus an order-insensitive similarity key.",
    "Avoiding false merges of different people with similar names — strong identifiers required for auto-link, the grey zone goes to review.",
    "Keeping UIDs stable when new records arrive and when two existing groups turn out to be one customer.",
    "Pairwise comparison at scale — solved with blocking keys so only plausible pairs are scored.",
  ],
  learnings: [
    "Standardisation beats clever matching: most duplicates are caught once fields are in one format.",
    "A false merge is worse than a missed duplicate; thresholds should reflect that.",
    "Data-quality reporting is part of the deliverable — matching is only as good as the identifying fields.",
  ],
  screenshots: ["uid-dashboard", "uid-dup-summary", "uid-candidates", "uid-assign", "uid-scores", "uid-matching", "uid-dq", "uid-dupes"],
  future: [
    "UID search at onboarding, so a repeat customer is linked before a new record is created.",
    "Mandatory PAN and mobile format checks at data entry.",
    "A supervised matcher trained on manually reviewed pairs.",
    "Duplicate rate and field quality tracked by month and branch.",
    "Extend the UID as the customer key across every customer-level report.",
  ],

  interview: {
    s30: "The same customer often existed under several records — a repeat borrower onboarded again, a co-applicant who later borrowed, small spelling differences. I built the customer UID process: standardise the identifying fields, match records with exact rules on PAN or DOB plus mobile and a fuzzy name score, link duplicates under one stable UID with a golden record, and report duplicate rates and field-level data quality.",
    s90: "In lending, a customer record is created for every loan, so one person can end up with several records: a repeat borrower, a co-applicant who later takes a loan, or a branch transfer, each with small differences in name spelling, date format or address. That splits customer counts and customer-level exposure. I built a UID process to fix it. First, SQL standardises the identifying fields — names upper-cased without titles or punctuation, one date format, the last ten digits of mobile, and PAN only if it fits the pattern. Then blocking: only records that share a PAN, or share DOB and mobile, are paired, which avoids comparing everyone with everyone. In Python each pair is scored: the same valid PAN links immediately, otherwise name similarity on an order-insensitive key plus DOB and mobile agreement. Ninety and above auto-links, seventy-five to eighty-nine goes to manual review, and two different valid PANs can never auto-link. Linked pairs are grouped so chains become one customer, each group gets a UID — reused from earlier runs so reports stay stable — and a golden record takes the best value of each field. Alongside, I measured completeness and format validity per field and reported duplicates and data quality, so the business could see both the real customer count and where data entry needed fixing.",
    role: ["Defined customer-uniqueness rules", "Record matching: blocking, exact rules, fuzzy names", "Duplicate identification and grouping", "UID creation and assignment, stable across runs", "Data-quality validation and reporting"],
    tech: ["SQL", "Python", "Fuzzy matching"],
    impact: ["One UID per real customer", "Measured duplicate rate", "Field-level data-quality visibility", "Customer-level reporting on one key"],
    challenges: ["Name variation", "Avoiding false merges", "Stable UIDs between runs", "Pairwise comparison at scale"],
    questions: [
      { q: "How did you decide two records are the same customer?", a: ["Exact link on the same valid PAN when names are also similar.", "Otherwise a score: 0.5 × name similarity + 30 if DOB agrees + 20 if mobile agrees.", "90+ auto-links, 75–89 goes to manual review, below 75 stays separate (representative thresholds)."] },
      { q: "How do you avoid merging two different people?", a: ["Name similarity alone can never reach the auto-link score — DOB and mobile must agree too.", "Two valid PANs that differ cap the score below the review band.", "Borderline pairs go to a person, and a shared PAN on very different names is treated as a data-entry error."] },
      { q: "What is blocking and why use it?", a: ["Comparing every record with every other is n² pairs — impossible on a large base.", "Blocking only pairs records that share a key (PAN, or DOB + mobile), which keeps the candidate set small.", "Trade-off: a duplicate with no shared key is missed, so the keys are chosen from the most complete fields."] },
      { q: "How do you turn pairs into customers?", a: ["Auto-linked pairs are edges; connected groups are customers, so A≈B and B≈C become one customer even if A and C were never compared.", "I used a union-find structure, which is simple and fast for this."] },
      { q: "How did you keep UIDs stable between runs?", a: ["When a linked group already contains a UID, that UID is reused; new UIDs are created only for new customers.", "If two existing groups merge, the oldest UID survives and the other is mapped to it, so history is not lost."] },
      { q: "What is a golden record and how is it built?", a: ["One best version of the customer per UID.", "Survivorship rules per field: valid values first, then the most frequent, then the most recent — for example the valid PAN, the agreed DOB, the latest frequent mobile."] },
      { q: "Which data-quality checks did you run?", a: ["Completeness, with placeholders such as ‘NA’ treated as missing.", "Format validity: PAN pattern, 10-digit mobile, plausible DOB, 6-digit pincode.", "Consistency across records of the same UID, and PAN conflicts."] },
      { q: "Why does this matter for an NBFC?", a: ["Customer counts, customer-level exposure and any check that should run once per person all depend on knowing who the customer really is."] },
    ],
  },
});
