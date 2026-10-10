/* Case study — Customer Name Screening & Watchlist Monitoring (SK Finance, professional)
   All names are obviously fictional; lists are generic demo lists (no real watchlist
   names or entries); identifiers are dummy. Statuses are exactly four everywhere:
   Clear · Potential Match · Review Required · Confirmed Match.
   Thresholds and counts are representative. Code is representative (generic SQL +
   Python) on a synthetic schema. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "screening",
  order: 6,
  company: "sk",
  kind: "professional",
  featured: false,
  title: "Customer Name Screening & Watchlist Monitoring",
  short: "Name screening",
  domain: "Compliance / Screening",
  domains: ["NBFC", "Compliance"],
  techTags: ["SQL", "Python"],  // VERIFY: stack not stated in the brief
  tech: ["SQL", "Python", "Fuzzy name matching"],
  thumb: "scr-results",
  problem: "Screen customer names against watchlist, defaulter and reference lists, score every potential match, and give each customer one of four statuses for review.",

  summary: {
    problem: "Customers have to be checked against internal defaulter lists, watchlists and other reference lists at onboarding and periodically, and names rarely match exactly.",
    solution: "Automated screening: names normalised the same way on both sides, matched by exact validated PAN and fuzzy name similarity, scored 0–100, and given one of four statuses — Clear, Potential Match, Review Required or Confirmed Match — with a review queue for open cases.",
    contribution: "Customer screening logic, name normalisation and matching, PAN screening, defaulter / watchlist comparison, potential-match identification and alert generation.",
    outcome: "Every customer screened the same way, with scored, explainable potential matches and a clear status instead of manual look-ups.", // VERIFY wording
  },
  users: "Compliance and onboarding teams who review potential matches.", // VERIFY
  process: "Customer screening at onboarding and periodic re-screening of the existing customer base.",
  overviewNote: "All names in this case study are obviously fictional and the lists are generic demo lists — no real watchlist names, entries or customer data are shown. Thresholds and counts are representative.",

  problemText: [
    "A lender must not unknowingly onboard, or keep lending to, someone on its internal defaulter list or on a watchlist it screens against. Exact name comparison misses ‘Mohd.’ vs ‘Mohammed’, initials, spelling variants and word order; loose comparison buries reviewers in false alerts.",
    "PAN is a strong identifier when present and valid, but watchlists often carry names only, and date of birth is missing on some entries. Screening has to combine names with whatever identifying evidence exists, and say clearly when that evidence is missing.",
  ],
  problemPoints: [
    "Is this customer on any list we screen against?",
    "How confident is the match, and why?",
    "What is each customer’s status, and which cases still need a person?",
  ],
  objective: "Screen every customer name against the relevant watchlist, defaulter and reference lists, score each potential match with the evidence behind it, and give every customer one clear status so reviewers can decide quickly.",
  objectives: [
    "Normalise names the same way on customer and list side.",
    "Match on validated PAN where available and on fuzzy name similarity otherwise.",
    "Score every candidate 0–100, with DOB as supporting evidence.",
    "Assign one of four statuses and route open cases to review.",
  ],
  role: [
    "Built the screening logic for new and existing customers.",
    "Implemented name normalisation and fuzzy name matching.",
    "Implemented PAN screening: exact match on validated PAN.",
    "Compared customers against defaulter lists, watchlists and reference lists.",
    "Identified potential matches, scored them and generated alerts for review.",
    "Produced screening output with the match score and status for each customer.", // VERIFY
  ],

  data: {
    text: "Customer data and the lists screened against. The demo uses obviously fictional names, generic demo lists and dummy identifiers.",
    sources: [
      { name: "Customer master", grain: "1 row per customer", fields: "name, DOB, PAN, mobile, address" },
      { name: "Internal defaulter list", grain: "1 row per entry", fields: "name, PAN, DOB where held, date added" },
      { name: "Watchlists / reference lists", grain: "1 row per entry or alias", fields: "name, aliases, DOB where available, list code" },
      { name: "Screening results", grain: "1 row per customer per run", fields: "best list entry, match score, matched fields, status, reviewer, reason" },
    ],
    processing: [
      "Customer and list names go through the same normalisation: case, punctuation, titles, variant spellings, spaces, and a token-sorted key so word order does not matter.",
      "Validated PANs are matched exactly in SQL first; name candidates are narrowed by a cheap blocking key, then scored in Python.",
      "Each customer keeps the best-scoring candidate and receives exactly one status.",
    ],
    validation: [
      "List files checked for row counts, encoding and duplicate entries on every load.",
      "PAN format validated before exact matching; an invalid PAN can neither confirm nor rule out a match.",
      "Known test names seeded into a run to confirm they are caught.",
      "Pairs a reviewer marked Clear are not alerted again unless the customer or list data changes.",
    ],
  },
  techUse: [
    { t: "SQL", use: "Exact PAN screening, candidate generation on a blocking key, skipping pairs already reviewed, status summaries." },
    { t: "Python", use: "Name normalisation, fuzzy scoring, status rules and alert output; scoring candidates in bulk, keeping the best match per customer, building the results table and review queue." },
    { t: "Fuzzy name matching", use: "Token-based similarity that tolerates spelling variants, initials and word order." },
  ],

  workflow: {
    text: "From customer and list data to a status for every customer.",
    steps: [
      { t: "Customer & list data", d: "new customers at onboarding; existing base on re-screening" },
      { t: "Name normalisation", d: "same steps on customer and list names" },
      { t: "Matching", d: "validated PAN exact; name candidates by blocking key" },
      { t: "Screening & match score", d: "fuzzy name score 0–100, adjusted by DOB" },
      { t: "Status", d: "Clear · Potential Match · Review Required · Confirmed Match" },
      { t: "Review", d: "open cases closed as Confirmed Match or Clear, with a reason" },
      { t: "Monitoring", d: "status summary; re-screen when lists or customers change" },
    ],
  },
  architecture: {
    text: "Screening pipeline: SQL for exact hits and candidates, Python for scoring and status, a queue for review.",
    lanes: [
      { lane: "Inputs", nodes: [{ t: "Customer master", db: true }, { t: "Defaulter list", d: "internal" }, { t: "Watchlists / reference lists" }] },
      { lane: "Prepare", nodes: [{ t: "Normalise names", d: "both sides, same rules", key: true }, { t: "Validate PAN / DOB" }] },
      { lane: "Match (SQL)", nodes: [{ t: "PAN exact match" }, { t: "Name candidates", d: "blocking key" }] },
      { lane: "Score (Python)", nodes: [{ t: "Fuzzy name score", d: "token-sorted key", key: true }, { t: "DOB adjustment" }, { t: "Status rules", d: "four statuses" }] },
      { lane: "Review", nodes: [{ t: "Review queue", d: "Potential Match · Review Required", key: true }, { t: "Reviewer decision", d: "Confirmed Match or Clear" }] },
      { lane: "Output", nodes: [{ t: "Screening results" }, { t: "Status summary" }, { t: "Alerts by list" }] },
    ],
  },
  model: {
    text: "Customers and list entries are normalised into the same shape before comparison.",
    entities: [
      { name: "customer", fields: [["cust_id", "pk"], ["full_name"], ["name_norm"], ["block_key"], ["dob"], ["pan_std"], ["updated_on"]] },
      { name: "list_entry", fields: [["entry_id", "pk"], ["list_code"], ["full_name"], ["name_norm"], ["block_key"], ["dob"], ["pan_std"], ["updated_on"]] },
      { name: "screen_result", fields: [["result_id", "pk"], ["run_id"], ["cust_id", "fk"], ["entry_id", "fk"], ["match_score"], ["matched_on"], ["status"], ["reviewed_by"], ["reason"], ["screened_on"]] },
      { name: "name_variant", fields: [["variant", "pk"], ["standard_form"]] },
    ],
    note: "Representative design. Table and column names are illustrative; aliases are loaded as extra list_entry rows.",
  },

  sql: {
    title: "Exact PAN hits, name candidates and the status summary",
    text: "Representative pattern. Exact validated-PAN hits are cheap and definitive, so they run first. Name candidates are narrowed with a blocking key computed during normalisation, and pairs already reviewed as Clear are skipped.",
    code: `-- Representative SQL (generic ANSI) on a synthetic schema — dummy identifiers only
-- 1) Exact PAN hits (pan_std is NULL unless the PAN passed format validation)
SELECT c.cust_id, e.entry_id, e.list_code, 'PAN' AS matched_on, 100 AS match_score
  FROM customer c
  JOIN list_entry e ON e.pan_std = c.pan_std;

-- 2) Name candidates: same blocking key (e.g. phonetic code of the surname token);
--    skip pairs a reviewer marked Clear unless either side changed since
SELECT c.cust_id, c.name_norm, c.dob, c.pan_std,
       e.entry_id, e.list_code, e.name_norm AS list_name, e.dob AS list_dob, e.pan_std AS list_pan
  FROM customer c
  JOIN list_entry e ON e.block_key = c.block_key
 WHERE NOT EXISTS (SELECT 1
                     FROM screen_result s
                    WHERE s.cust_id = c.cust_id
                      AND s.entry_id = e.entry_id
                      AND s.status = 'Clear'
                      AND s.reviewed_by IS NOT NULL
                      AND s.screened_on >= c.updated_on
                      AND s.screened_on >= e.updated_on);

-- 3) Status summary for a run (one result row per customer)
SELECT status, COUNT(*) AS customers
  FROM screen_result
 WHERE run_id = :run_id
 GROUP BY status
 ORDER BY customers DESC;`,
    points: [
      "PAN is trusted only after format validation; a validated PAN hit is definitive.",
      "The blocking key narrows candidates cheaply; it never decides a match — the fuzzy score does.",
      "Reviewed Clear pairs come back only when the customer or the list entry changes.",
    ],
  },
  python: {
    title: "Normalise, score, assign one of four statuses",
    text: "Representative, simplified code. Names are compared on an order-insensitive key and adjusted by DOB; status depends on the score and on whether the evidence needed to decide is available.",
    code: `# Representative Python — synthetic schema, not production code
import re
from difflib import SequenceMatcher
import pandas as pd

TITLES = {"MR", "MRS", "MS", "DR", "SHRI", "SMT"}
VARIANTS = {"MOHD": "MOHAMMED", "MD": "MOHAMMED", "MOHAMMAD": "MOHAMMED",
            "KR": "KUMAR", "SIDDIQI": "SIDDIQUI"}                         # maintained list

def normalise(name) -> str:
    tokens = re.sub(r"[^A-Z ]", " ", str(name).upper()).split()         # case, punctuation, spaces
    return " ".join(VARIANTS.get(t, t) for t in tokens if t not in TITLES)

def token_key(norm: str) -> str:
    return " ".join(sorted(norm.split()))                                # word order ignored

def match_score(r) -> int:
    s = 100 * SequenceMatcher(None, token_key(r.name_norm), token_key(r.list_name)).ratio()
    if pd.notna(r.dob) and pd.notna(r.list_dob):
        s += 8 if r.dob == r.list_dob else -15                           # DOB agrees / conflicts
    return int(max(0, min(99, round(s))))                                # 100 is reserved for PAN hits

def status(r) -> str:
    if r.matched_on == "PAN":
        return "Confirmed Match"
    if pd.isna(r.match_score) or r.match_score < 75:
        return "Clear"
    dob_missing = pd.isna(r.dob) or pd.isna(r.list_dob)
    pan_unusable = pd.notna(r.list_pan) and pd.isna(r.pan_std)            # list has PAN, customer's missing / invalid
    return "Review Required" if (dob_missing or pan_unusable) else "Potential Match"

cand["matched_on"] = "NAME"
cand["match_score"] = cand.apply(match_score, axis=1)
best = (pd.concat([pan_hits, cand])
          .sort_values("match_score", ascending=False)
          .drop_duplicates("cust_id"))                                    # best candidate per customer
results = customers[["cust_id"]].merge(best, on="cust_id", how="left")   # no candidate → Clear
results["status"] = results.apply(status, axis=1)
queue = results[results.status.isin(["Potential Match", "Review Required"])] \\
          .sort_values(["match_score"], ascending=False)                  # high scores reviewed first`,
    points: [
      "The same normalisation runs on customer names and list names, so they are compared like for like.",
      "A conflicting DOB lowers the score — the quickest way to separate namesakes.",
      "Status depends on score and on evidence: missing DOB or an unusable PAN gives Review Required, not a guess.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Screening is deterministic and similarity-based by design: every status must show why it was given. The four statuses are the only outcomes; thresholds are representative.",
    points: [
      "Exactly four statuses: Clear, Potential Match, Review Required, Confirmed Match.",
      "Recall comes first — a missed match is a credit and compliance risk, a false alert costs a few minutes of review — within a workable alert volume.",
      "Reviewer decisions and reasons are stored with the result.",
    ],
    rulesNote: "Representative rules and thresholds — illustrative, not production values.",
    rules: [
      { rule: "Identifier hit", condition: "Validated customer PAN equals the PAN on a list entry", outcome: "Confirmed Match (score 100)" },
      { rule: "Below threshold", condition: "Best name score after DOB adjustment is below 75", outcome: "Clear" },
      { rule: "Alert, evidence available", condition: "Score 75+; DOB on both sides; customer PAN usable where the list holds one", outcome: "Potential Match" },
      { rule: "Alert, evidence missing", condition: "Score 75+; DOB missing on either side, or customer PAN missing / invalid where the list holds one", outcome: "Review Required" },
      { rule: "Priority", condition: "Score 90+", outcome: "Reviewed first" },
      { rule: "Reviewer confirms", condition: "Evidence shows the same person", outcome: "Confirmed Match" },
      { rule: "Reviewer rules out", condition: "DOB, PAN or KYC data shows a different person", outcome: "Clear (reason stored)" },
      { rule: "Reviewer needs more", condition: "Information must be obtained before deciding", outcome: "Review Required" },
    ],
  },
  dashboard: {
    text: "Screening dashboard for the month. Other outputs below.",
    visual: "scr-dashboard",
    outputs: ["Screening results: Customer Name, Screening Result, Match Score, Status", "Review queue of open Potential Match and Review Required cases", "Status summary per run", "Alerts by list", "Matched fields shown with every alert as evidence"],
  },
  insights: {
    note: "Patterns from the demo data and from how screening behaves. No company results are shown.",
    items: [
      "In the demo data validated PAN hits produce most Confirmed Match outcomes, while name-only hits produce most of the review work.",
      "A DOB conflict is the fastest way to show a namesake is Clear — capturing DOB reliably matters as much as the matching algorithm.",
      "Moving the alert threshold by five points changes reviewer workload sharply, so it is a business decision, not only a technical one.",
      "Separating Review Required (evidence missing) from Potential Match (evidence available) shows where the problem is the data, not the name.",
    ],
  },
  impact: {
    before: ["Names looked up against lists by hand", "Exact comparison missing spelling variants", "No consistent status or record of decisions"],
    solution: ["Normalisation on both sides", "Exact PAN + fuzzy name scoring in SQL and Python", "Four-status rules and a review queue"],
    after: ["Every customer screened the same way", "Scored, explainable potential matches", "Open cases visible by status and age"],
    items: ["Consistent screening of new and existing customers.", "Potential matches scored and explained with the matched fields.", "Reviewer effort focused on open Potential Match and Review Required cases.", "Less time spent on manual list look-ups."],
  },
  challenges: [
    "Indian name variation — initials, honorifics, spelling and transliteration — handled with normalisation, a variant list and token-sorted keys.",
    "Balancing missed matches against reviewer workload.",
    "Missing DOB or PAN on one side — handled as Review Required rather than guessed.",
    "Lists arriving in different formats.",
  ],
  learnings: [
    "Normalisation and variant lists matter more than the similarity algorithm.",
    "Screening is decision support: the reviewer needs evidence, not just a score.",
    "Clear status definitions matter — reviewers and auditors need the same four words to mean the same thing every time.",
  ],
  screenshots: ["scr-dashboard", "scr-results", "scr-normalise", "scr-scores", "scr-status", "scr-queue", "scr-lists"],
  future: [
    "Automatic re-screening of the full base whenever a list is updated.",
    "Threshold tuning from Confirmed Match vs Clear outcomes of past reviews.",
    "A variant and transliteration list that grows from reviewer decisions.",
    "Ageing alerts and workload view for the review queue.",
    "Address and other KYC fields as additional evidence in the score.",
  ],

  interview: {
    s30: "I built customer name screening against watchlist, defaulter and reference lists. Names on both sides are normalised — case, titles, punctuation, variant spellings and word order — then matched: an exact hit on a validated PAN, otherwise a fuzzy name score from zero to a hundred adjusted by date of birth. Every customer gets one of four statuses — Clear, Potential Match, Review Required or Confirmed Match — and open cases go to a review queue with the evidence.",
    s90: "A lender has to make sure it is not onboarding or lending to someone on its internal defaulter list or on a watchlist it screens against, at onboarding and periodically. Exact name comparison does not work for Indian names: initials, titles, Mohd versus Mohammed, transliteration and word order. I built screening in three steps. First, normalisation: customer and list names go through the same rules — upper case, punctuation and titles removed, variants mapped, and a token-sorted key so word order does not matter. Second, matching: a validated PAN that equals a list PAN is definitive and becomes a Confirmed Match; otherwise SQL narrows candidates with a blocking key and Python scores them from zero to a hundred, adding a little when date of birth agrees and taking off more when it conflicts. Third, status. Below seventy-five the customer is Clear. At seventy-five or above, if DOB and PAN can be compared it is a Potential Match; if that evidence is missing it is Review Required, because the reviewer has to obtain it first. High scores are reviewed first, and the reviewer closes each case as Confirmed Match or Clear with a reason. Pairs marked Clear are not alerted again unless the data changes. The output is one status per customer, a review queue and a summary for monitoring.",
    role: ["Screening logic for new and existing customers", "Name normalisation and fuzzy matching", "PAN screening on validated PAN", "Defaulter / watchlist comparison", "Potential-match scoring and alert generation"],
    tech: ["SQL", "Python", "Fuzzy name matching"],
    impact: ["Consistent screening of every customer", "Scored, explainable potential matches", "One clear status per customer", "Less manual list look-up"],
    challenges: ["Indian name variation", "Missed matches vs reviewer workload", "Missing DOB / PAN evidence", "Different list formats"],
    questions: [
      { q: "How does your name matching work?", a: ["Normalise both sides: case, punctuation, titles, variant spellings (Mohd → Mohammed), then a token-sorted key.", "Narrow candidates with a cheap blocking key, then score with sequence similarity on the keys.", "Adjust with DOB: +8 when it agrees, −15 when it conflicts (representative weights)."] },
      { q: "Why not exact name matching?", a: ["Indian names vary in spelling, initials, order and transliteration; exact matching would miss real hits.", "Normalisation plus fuzzy scoring catches them while keeping the reason visible."] },
      { q: "What do the four statuses mean?", a: ["Clear: best score below 75, or a reviewer showed it is a different person.", "Potential Match: score 75+ and the DOB / PAN evidence is available to decide.", "Review Required: score 75+ but the evidence is missing or invalid, so more information is needed.", "Confirmed Match: validated PAN hit, or a reviewer confirmed it."] },
      { q: "Why separate Potential Match from Review Required?", a: ["They need different actions: a Potential Match can be decided from the data on screen; Review Required needs documents or data first.", "It also shows where the problem is data quality rather than name similarity."] },
      { q: "How do you control false positives?", a: ["DOB conflict lowers the score, which separates most namesakes.", "Variant lists and token keys make scores more precise, so the threshold does not have to be low.", "Pairs marked Clear are not alerted again unless the customer or list data changes."] },
      { q: "Why is a missed match worse than a false alert?", a: ["A missed match means onboarding or lending to a listed person — a credit and compliance risk.", "A false alert costs a few minutes of review, so recall is prioritised within a workable alert volume."] },
      { q: "How would you set the thresholds?", a: ["Look at the score distribution and at outcomes of reviewed alerts: where Confirmed Match outcomes stop appearing.", "The alert threshold is a trade-off between recall and workload, so it is agreed with the compliance owner and revisited with review outcomes."] },
      { q: "How does monitoring work after onboarding?", a: ["The existing base is re-screened periodically and when lists change.", "Only new or changed customer–entry pairs can raise new alerts; the status summary shows each run."] },
      { q: "What did you contribute?", a: ["Screening logic, name normalisation and matching, PAN screening, list comparison, potential-match identification and alert generation."] },
    ],
  },
});
