/* =====================================================================
   config.js — personal details, companies, timeline and skill map.
   The one file to edit for contact links. Empty strings are hidden or
   shown as a visible "add this" placeholder.
   ===================================================================== */
window.CONFIG = {
  name: "Ajeet Sharma",
  title: "Senior Data Analyst",
  location: "Jaipur, Rajasthan, India",
  resume: "assets/resume.pdf",                 // replace the file, keep the name
  email: "ajeet.ajitsharma@gmail.com",
  phone: "+91 7062020333",
  linkedin: "https://www.linkedin.com/in/ajeet-sharma-b79987260",
  github: "",                                  // e.g. "https://github.com/your-handle" — GitHub buttons appear once set

  /* Companies, in the order their project groups appear on the page.
     `years` drives the career timeline (chronological order is set by `timelineOrder`). */
  companies: {
    sk: {
      name: "SK Finance Ltd.", role: "Senior Data Analyst", years: "Mar 2023 – Present",
      group: "NBFC & Risk Analytics Portfolio",
      focus: "Risk Analytics · NBFC · Python · SQL · BI · ML · Automation",
      context: "NBFC. Credit risk, portfolio monitoring, compliance, data quality, decisioning and lifecycle analytics.",
    },
    personal: {
      name: "Personal project", role: "", years: "",
      group: "Advanced ML · built on synthetic data",
      focus: "Machine learning · credit risk",
      context: "Built independently, outside employer work, on a synthetic NBFC portfolio.",
    },
    rr: {
      name: "RR Logistics", role: "Data Analyst / Python & SQL", years: "",
      group: "Fleet operations, data and reporting",
      focus: "Fleet Operations · Data · Reporting · Analytics",
      context: "Partnership logistics company operating 100+ trucks (10-wheel, 12-wheel and other configurations). About 80 vehicles served a major pharmaceutical logistics operation (referred to as ‘Scorpion’ for confidentiality); 20+ ran in the market and for other vendors.",
    },
    sakar: {
      name: "Sakar Engitech", role: "Python Developer / DBA", years: "2019",
      group: "Python + Oracle business application",
      focus: "Python · Oracle · Business Applications",
      context: "Government electricity infrastructure projects in Rajasthan, including rural areas where electricity infrastructure and connections were being developed.",
    },
    freelance: {
      name: "Freelance", role: "Product developer", years: "",
      group: "Product development · education management",
      focus: "Product development · Education",
      context: "Independent client work, separate from employment.",
    },
  },
  groupOrder: ["sk", "personal", "rr", "sakar", "freelance"],
  timelineOrder: ["sakar", "rr", "sk", "freelance"],

  /* Filter vocabulary (must match project `domains` / `techTags` exactly) */
  filters: {
    domain: ["NBFC", "Risk", "Credit", "AML", "Compliance", "Data Quality", "BI", "Automation", "Logistics", "Software Application", "Machine Learning", "Education"],
    tech: ["Python", "SQL", "Oracle", "Django", "Power BI", "Zoho Analytics", "Machine Learning", "Pandas", "SQLAlchemy"],
    type: ["Professional", "Personal", "Freelance"],
  },

  /* Reporting & automation figures (as stated by Ajeet) */
  automation: [
    { n: "50+", t: "Automated email / data triggers", d: "Developed and maintained for user notifications, data delivery, operational alerts, report distribution and scheduled outputs." },
    { n: "35+", t: "Automated reports", d: "Data extraction, manipulation, business logic, formatting, report generation and distribution — end to end." },
    { n: "27+", t: "Live dashboard reports", d: "Reports and analytics views made available through live dashboards." },
  ],
  // Categories evidenced by the report catalogue and dashboards in the case studies
  automationCategories: ["Risk & DPD", "Credit", "Portfolio", "Collections", "Operations & TAT", "Branch", "Compliance & audit", "Insurance", "Legal", "Finance (GL)"],

  /* Skill map: `in` = case-study ids that show the skill */
  skills: [
    { group: "Data", items: [
      { name: "SQL", in: ["onedash", "scorecard", "ews", "aml", "datamart", "uid", "screening", "bre", "rr-toms", "sakar-crm", "logistics"] },
      { name: "Oracle", in: ["scorecard", "ews", "aml", "datamart", "sakar-crm"] },
      { name: "Python", in: ["scorecard", "ews", "aml", "datamart", "uid", "screening", "bre", "rr-toms", "logistics", "sakar-crm", "ml-lab"] },
      { name: "Pandas", in: ["scorecard", "ews", "datamart", "logistics", "ml-lab"] },
      { name: "NumPy", in: ["scorecard", "ml-lab"] },
    ] },
    { group: "Analytics", items: [
      { name: "Risk analytics", in: ["scorecard", "ews", "aml", "bre", "ml-lab"] },
      { name: "Credit analytics", in: ["scorecard", "bre", "onedash", "ml-lab"] },
      { name: "Portfolio analytics", in: ["ews", "onedash"] },
      { name: "Data quality", in: ["uid", "datamart", "sakar-crm"] },
    ] },
    { group: "BI", items: [
      { name: "Power BI", in: ["onedash", "ews", "aml"] },
      { name: "Zoho Analytics", in: ["ews", "aml", "logistics"] },
      { name: "Excel", in: ["datamart", "logistics"] },
    ] },
    { group: "Machine learning", items: [
      { name: "Logistic regression", in: ["scorecard", "ml-lab"] },
      { name: "WOE / IV", in: ["scorecard", "ml-lab"] },
      { name: "Credit scorecard", in: ["scorecard", "ml-lab"] },
      { name: "Classification", in: ["scorecard", "ml-lab"] },
      { name: "Model evaluation", in: ["scorecard", "ml-lab"] },
    ] },
    { group: "Engineering", items: [
      { name: "Django", in: ["datamart"] },
      { name: "SQLAlchemy", in: ["datamart", "sakar-crm"] },
      { name: "ETL", in: ["datamart", "ews", "aml", "onedash"] },
      { name: "Automation", in: ["datamart", "ews", "aml", "bre"] },
      { name: "Database development", in: ["sakar-crm", "rr-toms", "datamart"] },
    ] },
  ],
};
