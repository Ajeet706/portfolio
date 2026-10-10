# Ajeet Sharma — Data & Analytics Project Portfolio

An interview-ready portfolio of case studies, built with plain HTML, CSS and vanilla JavaScript.
There is no build step and no framework.

## Open it

- **Folder version:** double-click `index.html`. It works offline (fonts fall back to system fonts).
- **Single file:** `dist/portfolio-standalone.html`. Keep `assets/resume.pdf` next to it.
  After any edit, rebuild it with `python tools/build_single.py`.

## Page structure

Home · Expertise (snapshot, analytical process, skill map) · Projects (search plus filters by
domain, technology and type, grouped by organisation) · Experience (timeline) · Automation
(50+ / 35+ / 27+) · Freelance (DEV School ERP) · About · Contact

Projects, in display order:

| # | id | Organisation | Project |
|---|---|---|---|
| 01 | `onedash` | SK Finance | ONE DASH — End-to-End NBFC Lifecycle Analytics Platform (Power BI) |
| 02 | `scorecard` | SK Finance | Credit Risk Scorecard Model |
| 03 | `ews` | SK Finance | Early Warning System |
| 04 | `aml` | SK Finance | AML Monitoring System |
| 05 | `datamart` | SK Finance | NBFC Data Mart & Reporting Automation Platform (Data Nest) |
| 06 | `uid` | SK Finance | Customer UID & Data Quality |
| 07 | `screening` | SK Finance | Customer Name Screening & Watchlist Monitoring |
| 08 | `bre` | SK Finance | Business Rule Engine (rule logic + monitoring dashboard) |
| 09 | `ml-lab` | Personal | Loan Default Prediction & Early Warning ML Platform (synthetic data) |
| 10 | `rr-toms` | RR Logistics | Transportation Operations Management System |
| 11 | `logistics` | RR Logistics | Freight Audit & Logistics Performance Analytics |
| 12 | `sakar-crm` | Sakar Engitech | Customer & Electricity Connection Management System |
| 13 | `dev-school` | Freelance | DEV School ERP & AI Management System (AI features: roadmap) |

Every case study uses the same 20 sections: Overview → Business problem → Objective → My role →
Data → Technology → Business workflow → Technical architecture → Data model → SQL / data
processing → Python / analytics → ML / business rules → Dashboard / output → Key insights →
Business impact (before → solution → after) → Challenges → What I learned → Screenshots
(Screenshots / Architecture / Workflow / Dashboard / Data model) → Interview view → Future improvements.

## During an interview

| Action | How |
|---|---|
| Open a project in its short form | "Interview view" on any card, or the switch above the project list |
| Switch between case study and Interview View | Toggle at the top of the case study, or press **I** |
| Practise the 30- or 90-second answer | "Practise" starts a timer |
| Previous / next project | Arrow buttons, or **[** and **]** |
| Close a case study or an enlarged screenshot | **Esc** |
| Link straight to a project | `index.html#case-datamart` (case study) or `index.html#iv-datamart` (interview) |

## Before you share it (checklist)

1. **`js/config.js`** — add your GitHub URL (GitHub buttons stay hidden until it is set) and the
   RR Logistics dates.
2. **`assets/resume.pdf`** — replace the placeholder with your resume, keeping the same file name.
3. **Lines marked `// VERIFY`** in `js/projects/*.js` are wording I could not confirm from your
   brief: outcomes, tool lists for UID and Screening, DataMart parameter handling, and the DEV
   School ERP stack. Keep only what you can speak to.
4. **Data Mart:** the screens are re-created from your screenshots with synthetic content. The app
   name "Data Nest" and generic report names are kept. Employee IDs, internal URLs, real counts
   and named report owners are not used. Rename anything you prefer not to show.

## What is real and what is synthetic

- **Real (from your brief):** the business problems, your roles, the technologies, the features of
  each application, the fleet facts, the automation figures and the RR Logistics growth statement
  (worded so it is not presented as caused by the application).
- **Synthetic:** every chart, dashboard, table, name, ID and number in the screenshots. Each one
  carries a "DEMO / SYNTHETIC DATA — PORTFOLIO DEMONSTRATION ONLY" label. SQL and Python are
  representative code on illustrative schemas. AML, EWS and BRE rules are illustrative.
- **Personal ML lab:** fully reproducible. `ml/build_synthetic_model.py` generates the synthetic
  portfolio, trains the models and writes `js/synthetic-model.js`, which the predictor and the
  model charts read.

## Structure

```
index.html                  page structure and static copy
css/styles.css              design tokens (light + dark), layout, components
js/config.js                contact, companies, timeline, filters, automation figures, skill map  ← edit
js/projects/*.js            one file per case study (schema: js/projects/_TEMPLATE.js)            ← edit
js/charts.js                small SVG chart kit with tooltips
js/visuals.js, js/visuals/  every synthetic screen, dashboard and diagram, by id
js/synthetic-model.js       generated model output (do not edit by hand)
js/main.js                  rendering, filters, search, case studies, Interview View, gallery, predictor
ml/build_synthetic_model.py synthetic data and models
tools/build_single.py       bundles the site into one HTML file
```

## Hosting

Upload the folder to GitHub Pages, Netlify (drag and drop) or any static host.
