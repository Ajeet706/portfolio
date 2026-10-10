/* =====================================================================
   CASE-STUDY TEMPLATE (schema v2) — copy this file to add a project.
   Not loaded by index.html. Every case study renders the same 20 sections:
   01 Overview · 02 Business Problem · 03 Objective · 04 My Role · 05 Data
   06 Technology · 07 Business Workflow · 08 Technical Architecture
   09 Data Model · 10 SQL / Data Processing · 11 Python / Analytics
   12 ML / Business Rules · 13 Dashboard / Output · 14 Key Insights
   15 Business Impact · 16 Challenges · 17 What I Learned · 18 Screenshots
   19 Interview View · 20 Future Improvements

   RULES
   - Never real customer / company data. All visuals synthetic.
   - Never invent metrics, features, technologies or responsibilities.
     Where something is not confirmed, say "Representative / Demo Workflow"
     or put it under `future` ("Future Enhancement").
   - Filter vocab must match exactly (see DOMAINS / TECH lists below).
   ===================================================================== */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "example",                    // used in URLs: #case-example, #iv-example
  order: 99,                        // sort order inside its company group
  company: "sk",                    // sk | rr | sakar | personal | freelance  (see js/config.js)
  kind: "professional",             // professional | personal | freelance
  featured: false,                  // wide card at the top of its group
  title: "Project title",
  short: "Short name",              // used in compact lists
  domain: "Credit Risk / Lending",  // display subtitle
  // Filter vocab — DOMAINS: NBFC, Risk, Credit, AML, Compliance, Data Quality, BI, Automation,
  //                         Logistics, Software Application, Machine Learning, Education
  domains: ["NBFC", "Risk"],
  // TECH: Python, SQL, Oracle, Django, Power BI, Zoho Analytics, Machine Learning, Pandas, SQLAlchemy
  techTags: ["Python", "SQL"],
  tech: ["Python", "SQL"],          // display list (may include items outside the filter vocab)
  thumb: "vis-id",                  // VIS id used for the card preview
  problem: "One sentence for the card.",

  summary: { problem: "", solution: "", contribution: "", outcome: "" },
  users: "Who used it",
  process: "Which business process it supported",

  overviewNote: "",                 // optional: e.g. "Screens are synthetic re-creations of the real application."
  problemText: ["paragraph", "paragraph"],
  problemPoints: ["question the work answers"],
  objective: "One paragraph.",
  objectives: ["optional bullet objectives"],
  role: ["3–8 bullets, only confirmed responsibilities"],

  data: {
    text: "",
    sources: [{ name: "", grain: "", fields: "" }],
    processing: ["how data was processed"],
    validation: ["checks"],
  },
  techUse: [{ t: "Python", use: "what it was used for in THIS project" }],

  workflow: { text: "", steps: [{ t: "Step", d: "optional detail" }] },        // business flow
  architecture: {
    text: "",
    // either `lanes` (layered diagram) …
    lanes: [{ lane: "User", nodes: [{ t: "Browser", d: "", key: false, db: false }] }],
    // … or a simple `flow` list: [{ t, d }]
  },
  model: { text: "", entities: [{ name: "table", fields: [["id", "pk"], ["x_id", "fk"], ["col"]] }], note: "" },

  sql: { title: "", text: "", code: "-- illustrative", points: [] },          // or { na: "reason" }
  python: { title: "", text: "", code: "# illustrative", points: [] },        // or { na: "reason" }
  logic: {                                                                    // ML or business rules
    heading: "Business rules",      // or "Machine learning"
    text: "",
    points: [],
    rules: [{ rule: "", condition: "", outcome: "" }],   // optional rules table (illustrative)
    // or { na: "reason" }
  },
  dashboard: { text: "", visual: "vis-id", outputs: ["other outputs: reports, alerts, files"] },
  insights: { note: "", items: [] },
  impact: {
    before: ["Manual / fragmented …"],
    solution: ["Python / SQL / application / dashboard …"],
    after: ["Centralised information …"],
    items: ["impact statements (no invented numbers)"],
    note: "",                       // e.g. a carefully-worded growth statement
  },
  challenges: [],
  learnings: [],
  screenshots: ["vis-id", "vis-id"], // diagrams (workflow / architecture / data model) are added automatically
  future: ["Future enhancement …"],

  interview: {
    s30: "30-second explanation (~70 words).",
    s90: "90-second explanation (~200–230 words).",
    role: ["3–6 bullets"],
    tech: ["short list"],
    impact: ["short list"],
    challenges: ["3–5 points"],
    questions: [{ q: "Question?", a: ["answer point", "answer point"] }],   // 5–10
  },
});
