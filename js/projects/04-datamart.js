/* Case study — NBFC Data Mart & Reporting Automation Platform (SK Finance, professional)
   Functionality follows the real application screens supplied by Ajeet. All visuals are
   synthetic re-creations: no real queries, users, tables or counts. Code is representative. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "datamart",
  order: 4,
  company: "sk",
  kind: "professional",
  featured: false,
  title: "NBFC Data Mart & Reporting Automation Platform",
  short: "Data Mart platform",
  domain: "Data Engineering / Reporting Automation",
  domains: ["NBFC", "Automation", "BI", "Software Application"],
  techTags: ["Python", "SQL", "Oracle", "Django", "Pandas", "SQLAlchemy"],
  tech: ["Python", "Django", "Oracle", "SQL", "Pandas", "SQLAlchemy", "Excel / CSV output"],
  thumb: "dm-queries",
  problem: "One web platform where business users run approved Oracle queries, date-range extracts and Python report scripts themselves — with monitoring for scheduled mails and data freshness.",

  summary: {
    problem: "Teams across the NBFC needed the same Oracle extracts and MIS reports again and again, which meant manual SQL runs, spreadsheet clean-up and no single view of whether scheduled reports had gone out.",
    solution: "A Django application (Data Nest) that centralises approved SQL queries, filter-driven and date-range extraction, Python report scripts, scheduled mail monitoring, replica-delay monitoring and file utilities.",
    contribution: "Designed and built the platform: Django application, Oracle integration, query catalogue, format-file filter flow, script runner, monitoring screens and output generation.",
    outcome: "Recurring extraction and reporting moved from one-off manual runs to a self-service platform with visible delivery and data-freshness status.", // VERIFY wording
  },
  users: "Business and MIS users across credit, collections, operations, insurance, legal, finance and audit / compliance.",
  process: "Daily MIS and ad-hoc data requests: extraction, transformation, report generation and distribution.",
  overviewNote: "Screens in this case study are synthetic re-creations of the real application. Report names, tables, users and counts are demo values.",

  problemText: [
    "In an NBFC, most teams depend on data held in the loan management and related Oracle systems. Without a platform, every request — a DPD extract for a branch list, a month’s receipts, a KYC status file — becomes a message to the data team, a query run by hand, and a spreadsheet tidied up and sent back.",
    "The same reports were needed every day or week, the logic lived in individual SQL files, and when a scheduled mail failed nobody knew until a user complained. Reports also read from a replica, so users needed to know how fresh the data was.",
  ],
  problemPoints: [
    "How can users get approved data without writing SQL or waiting in a queue?",
    "How can users pass their own filter values (hundreds of loan or branch IDs) safely?",
    "Did this morning’s scheduled reports go out? Is the replica up to date?",
  ],
  objective: "Centralise SQL-based data extraction, Python processing and report generation in one secure web application, and make delivery and data freshness visible.",
  objectives: [
    "One catalogue of approved queries with consistent logic.",
    "Self-service filters and date ranges without exposing SQL.",
    "Python scripts for reports that need more than one query.",
    "Monitoring for scheduled mails and replica delay.",
  ],
  role: [
    "Designed and developed the Django web application (views, templates, URL routing).",
    "Integrated Oracle through Python (SQLAlchemy / Pandas) for query execution and extraction.",
    "Built the query catalogue with direct ‘Download’ and filter-driven ‘Add Filters’ actions.",
    "Built the Excel format-file flow: generate template, accept upload, validate, run, return the result file.",
    "Built date-range extraction and the Python script runner (Download File, File Mail, Upload & Run).",
    "Built the Mail Monitoring and Replica Monitoring screens, the IRDA mapping utility and the KPI dashboard.",
    "Maintained queries and scripts as business requirements changed.", // VERIFY
  ],

  data: {
    text: "The platform reads the Oracle reporting environment and returns files; it stores only its own metadata (query and script registry, mail log).",
    sources: [
      { name: "Oracle reporting / replica schema", grain: "varies", fields: "loans, applications, receipts, DPD / MIS tables, GL, insurance, legal, collateral" },
      { name: "Query registry", grain: "1 row per approved query", fields: "serial number, name, SQL text, action type (download / filter), filter columns" },
      { name: "Format files (uploaded)", grain: "1 row per filter value", fields: "e.g. loan ID, branch code, month — as defined by the query’s template" },
      { name: "Mail log", grain: "1 row per scheduled mail per day", fields: "mail name, scheduled time, sent flag, sent time" },
      { name: "Replica status", grain: "1 row per monitored table", fields: "source time, replica time, delay in minutes" },
    ],
    processing: [
      "SQL runs on Oracle; results are read into Pandas DataFrames.",
      "Uploaded Excel filters are read with Pandas, cleaned and validated before use.",
      "Outputs are written as CSV (queries) or Excel / CSV (scripts) and returned as downloads or sent by mail.",
    ],
    validation: [
      "Uploaded format files are checked for the expected columns and empty values before a query runs.",
      "Date-range reports carry limits (for example a maximum 15-day window) for heavy extracts.",
      "Today’s vs yesterday’s MIS count on the dashboard flags an incomplete daily refresh.",
      "Replica delay is visible per table, so users know how current the data is.",
    ],
  },
  techUse: [
    { t: "Django", use: "Web application: authentication, pages, forms, file upload and download." },
    { t: "Python", use: "Query execution, format-file handling, report scripts, mail jobs and file utilities." },
    { t: "Oracle", use: "Source of all extracted data (reporting / replica environment)." },
    { t: "SQL", use: "Approved queries for each report; date-range and filter-driven variants." },
    { t: "Pandas", use: "Reading query results and uploaded Excel files, transforming and writing outputs." },
    { t: "SQLAlchemy", use: "Oracle connection and parameterised query execution." },
    { t: "Excel / CSV", use: "Format files for filters; CSV and Excel outputs." },
  ],

  workflow: {
    text: "From a user’s request to a delivered file.",
    steps: [
      { t: "User logs in", d: "Django authentication" },
      { t: "Chooses what to run", d: "query, date-range report or Python script" },
      { t: "Adds inputs", d: "filter format file, date range or input file" },
      { t: "SQL runs on Oracle", d: "approved query, parameters bound" },
      { t: "Python processing", d: "Pandas transform and validation" },
      { t: "Output", d: "CSV / Excel download or e-mail" },
      { t: "Monitoring", d: "mail status and replica delay" },
    ],
  },
  architecture: {
    text: "Layered view of the platform.",
    lanes: [
      { lane: "User", nodes: [{ t: "Browser", d: "business / MIS user" }] },
      { lane: "Web app", nodes: [{ t: "Django", d: "views, templates, auth", key: true }, { t: "Login / sign-up" }, { t: "File upload & download" }] },
      { lane: "Modules", nodes: [{ t: "Query Result", d: "download / add filters", key: true }, { t: "Query Date", d: "date-range extracts" }, { t: "Python Script", d: "download · mail · upload & run" }, { t: "Services", d: "mail monitor · replica · IRDA" }] },
      { lane: "Data access", nodes: [{ t: "SQLAlchemy + Pandas", d: "parameterised SQL" }] },
      { lane: "Database", nodes: [{ t: "Oracle", d: "reporting / replica environment", key: true, db: true }] },
      { lane: "Output", nodes: [{ t: "CSV / Excel" }, { t: "Scheduled e-mail" }, { t: "Dashboard KPIs" }] },
    ],
  },
  model: {
    text: "The platform’s own metadata. Business data stays in Oracle.",
    entities: [
      { name: "report_query", fields: [["query_id", "pk"], ["serial_no"], ["query_name"], ["sql_text"], ["action_type"], ["filter_columns"], ["is_active"]] },
      { name: "date_report", fields: [["report_id", "pk"], ["report_name"], ["description"], ["sql_text"], ["max_days"]] },
      { name: "py_script", fields: [["script_id", "pk"], ["script_name"], ["run_mode"], ["module_path"]] },
      { name: "mail_log", fields: [["log_id", "pk"], ["mail_name"], ["run_date"], ["sent_flag"], ["sent_at"]] },
      { name: "replica_status", fields: [["table_name", "pk"], ["source_time"], ["replica_time"], ["delay_min"]] },
    ],
    note: "Representative design. Table and column names are illustrative.",
  },

  sql: {
    title: "Filter-driven query: uploaded values joined, never concatenated",
    text: "Representative pattern for ‘Add Filters’. Uploaded filter values are loaded into a temporary table and joined, so user input never becomes SQL text.",
    code: `-- Representative Oracle SQL on a synthetic schema — not production code
-- 1) filter values from the uploaded format file go into a session-level temp table
INSERT INTO tmp_filter_loan (loan_id) VALUES (:loan_id);        -- executed for each row (bulk bind)

-- 2) the approved query joins to it
SELECT l.loan_id, l.branch_code, d.snap_month, d.dpd, d.bucket
  FROM dm_loan_account l
  JOIN tmp_filter_loan f ON f.loan_id = l.loan_id
  JOIN dm_dpd_snapshot d ON d.loan_id = l.loan_id
 WHERE d.snap_month BETWEEN ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -6) AND TRUNC(SYSDATE, 'MM')
 ORDER BY l.loan_id, d.snap_month;

-- Date-range report with a guard-rail on window size
SELECT r.receipt_id, r.loan_id, r.receipt_date, r.amount, r.mode
  FROM dm_receipt r
 WHERE r.receipt_date BETWEEN :start_dt AND :end_dt
   AND :end_dt - :start_dt <= 15;                               -- heavy extract: max 15 days`,
    points: [
      "Bind variables and a temp-table join keep uploaded values out of the SQL text.",
      "Heavy reports enforce a maximum date window.",
      "Queries read the reporting / replica environment, not the transactional system.",
    ],
  },
  python: {
    title: "Django view for the format-file flow",
    text: "Representative, simplified code for step 2 → 3 of ‘Add Filters’.",
    code: `# views.py — representative, simplified
import pandas as pd
from django.contrib.auth.decorators import login_required
from django.http import FileResponse
from sqlalchemy import text
from .db import engine                      # SQLAlchemy engine for the Oracle reporting environment
from .models import ReportQuery

@login_required
def upload_filters(request, query_id):
    q = ReportQuery.objects.get(pk=query_id, is_active=True)
    flt = pd.read_excel(request.FILES["format_file"], dtype=str)

    expected = q.filter_columns.split(",")                 # e.g. ["loan_id"]
    if list(flt.columns) != expected or flt[expected].isna().any().any():
        return render_message(request, "The file does not match the format. Download the format file again.")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM tmp_filter_loan"))
        conn.execute(text("INSERT INTO tmp_filter_loan (loan_id) VALUES (:loan_id)"),
                     flt.to_dict("records"))               # bulk bind, no string building
        df = pd.read_sql(text(q.sql_text), conn)

    path = write_csv(df, q.slug)                          # timestamped file in the user's export folder
    return render_message(request, "Your download is ready.", download=path)


def send_scheduled_mail(job):
    """Runs from the scheduler; every attempt is logged for the Mail Monitor."""
    df = run_script(job.module_path)                       # Python report script
    ok = mail_report(job.recipients_group, attach=df)       # distribution list kept in config, not code
    MailLog.objects.create(mail_name=job.name, sent_flag=ok, sent_at=now() if ok else None)`,
    points: [
      "The format file defines the filter columns, so users cannot pass anything the query does not expect.",
      "Every scheduled mail writes a log row — that log is what the Mail Monitor shows.",
      "The same script runner powers Download File, File Mail and Upload & Run.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Not a modelling project. The business logic lives in the approved queries and Python scripts (for example TAT calculations, DPD from MIS tables, bounce-case processing) that the platform makes repeatable.",
    points: [
      "Each report keeps one approved version of its logic.",
      "Scripts handle multi-step logic that does not fit a single query.",
      "Guard-rails (date windows, format checks) are part of each report’s definition.",
    ],
  },
  dashboard: {
    text: "The query catalogue — the screen most users start from. Other outputs below.",
    visual: "dm-queries",
    outputs: ["CSV result files for queries", "Excel / CSV files from scripts", "Scheduled report e-mails", "Mail and replica monitoring screens", "Landing KPIs with an MIS refresh check"],
  },
  insights: {
    note: "Design lessons from building and running the platform.",
    items: [
      "Most ‘new’ data requests are an existing report with different filter values — the format-file flow covers them without new code.",
      "Monitoring is as important as extraction: a visible mail status and replica delay prevent questions before they are asked.",
      "Guard-rails on heavy reports (date windows) protect the shared database and keep the platform fast for everyone.",
    ],
  },
  impact: {
    before: ["Data requests sent to the data team one by one", "SQL run by hand and pasted into spreadsheets", "No view of whether scheduled mails were sent or data was current"],
    solution: ["Django + Oracle platform", "Approved query catalogue with filter and date-range extraction", "Python script runner and scheduled mails", "Mail and replica monitoring"],
    after: ["Self-service access to approved reports", "Repeatable report logic in one place", "Visible delivery status and data freshness", "Analyst time freed from repeat extraction"],
    items: ["Centralised SQL-based extraction and report generation.", "Consistent outputs from approved logic.", "Faster turnaround for recurring and filter-based requests.", "Operational visibility of scheduled reporting."],
  },
  challenges: [
    "Letting users pass many filter values safely — solved with Excel format files, validation and bind variables.",
    "Heavy extracts competing for database time — date-window limits and running against the reporting / replica environment.",
    "Knowing when scheduled reports failed — every mail attempt is logged and shown in the Mail Monitor.",
    "Keeping many scripts consistent — one runner with three modes (download, mail, upload & run).",
  ],
  learnings: [
    "Internal tools succeed on reliability and clear messages more than on features.",
    "Monitoring screens build trust in automated reporting.",
    "Django’s auth, forms and file handling remove most of the boilerplate in a secure internal app.",
  ],
  screenshots: ["dm-home", "dm-login", "dm-queries", "dm-filter-flow", "dm-date", "dm-scripts", "dm-mail", "dm-replica", "dm-irda", "dm-kpi"],
  future: [
    "Role-based permissions per report and department.",
    "An audit log of every run (user, parameters, rows, duration).",
    "Self-service scheduling: users subscribe to reports by e-mail.",
    "Alerting when replica delay or mail failures cross a threshold.",
    "Usage analytics to retire unused reports and optimise heavy ones.",
  ],

  interview: {
    s30: "I built Data Nest, a Django and Oracle platform where business users run approved queries, date-range extracts and Python report scripts themselves. Users can upload an Excel format file to filter a query by their own loan or branch lists. The platform also monitors whether scheduled report mails went out and how far the reporting replica lags, so recurring reporting is self-service and visible.",
    s90: "In an NBFC almost every team needs data from the Oracle loan systems, and most requests repeat: the same DPD extract for a different branch list, a month of receipts, a KYC status file. I built a Django application, Data Nest, to make that self-service. The Query Result page lists approved SQL queries. Some download directly; others use an Add Filters flow: the user downloads an Excel format file, fills in values such as loan IDs, uploads it, and the platform runs the approved query for those values and returns the file. Query Date handles date-range reports, with limits such as a fifteen-day window on heavy extracts. The Python Script page runs multi-step reports in three modes: download a file, e-mail the output, or upload an input file and run. For operations, the Mail Monitor shows which scheduled report mails were sent each morning and when, the Replica Monitor shows how far each reporting table lags the source, and the dashboard compares today’s and yesterday’s MIS counts as a refresh check. The result is one place for recurring extraction and reporting, with consistent logic and visible status.",
    role: ["Designed and built the Django application", "Oracle integration with SQLAlchemy and Pandas", "Query catalogue and the Excel format-file filter flow", "Date-range extracts and the Python script runner", "Mail Monitor, Replica Monitor, IRDA utility and KPI dashboard"],
    tech: ["Python", "Django", "Oracle SQL", "SQLAlchemy", "Pandas", "Excel / CSV"],
    impact: ["Self-service access to approved reports", "Consistent report logic in one place", "Visibility of scheduled mail delivery and data freshness", "Less repeat manual extraction"],
    challenges: ["Safe user-supplied filters", "Heavy extracts on a shared database", "Detecting failed scheduled mails", "Keeping many scripts consistent"],
    questions: [
      { q: "How does the ‘Add Filters’ flow work?", a: ["Each filterable query has an Excel format file listing its filter columns.", "The user downloads it, fills values (for example loan IDs) and uploads it.", "The upload is validated for columns and empty values, loaded with bind variables into a temporary table, and the approved query joins to it.", "The result comes back as a CSV download."] },
      // VERIFY: confirm the parameter-handling details below match the real implementation
      { q: "How did you prevent SQL injection?", a: ["Users never write SQL; queries are approved and stored on the server.", "Uploaded values are passed as bind parameters (bulk insert into a temp table), never concatenated into SQL.", "The format file fixes which columns are accepted."] },
      { q: "Why Django?", a: ["Built-in authentication, forms, file upload/download and templating — most of what a secure internal tool needs.", "It is Python, so Pandas processing and existing report scripts plug straight in."] },
      { q: "Why Pandas between Oracle and the output file?", a: ["Reading Excel uploads, cleaning values, reshaping results and writing CSV / Excel is simpler and more testable in Pandas than in SQL alone."] },
      { q: "What do the Mail Monitor and Replica Monitor solve?", a: ["Mail Monitor: every scheduled mail attempt is logged, so failed reports are visible the same morning.", "Replica Monitor: reports read from a replica; showing the delay per table tells users how fresh the data is and flags lag early."] },
      { q: "How do you handle heavy extracts?", a: ["Date-window limits on heavy reports, running against the reporting / replica environment, CSV output for large files, and clear ‘takes time to run’ labels."] },
      { q: "What are the three script modes?", a: ["Download File: run and download the output.", "File Mail: run and e-mail the output.", "Upload & Run: the user uploads an input file which the script processes."] },
      { q: "What would you add next?", a: ["Role-based permissions per report, an audit log of runs, self-service report subscriptions and threshold alerts on mail failures and replica delay."] },
    ],
  },
});
