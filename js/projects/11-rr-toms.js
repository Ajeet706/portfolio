/* Case study — Transportation Operations Management System (RR Logistics, professional)
   Functionality follows the module list confirmed by Ajeet. Technology confirmed: Python and SQL on a
   relational database — the UI framework and the database product are NOT confirmed and are not named.
   All screens are synthetic, representative re-creations; code is representative on a synthetic schema.
   Lines marked VERIFY: the exact split of Ajeet’s role is not confirmed. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "rr-toms",
  order: 1,
  company: "rr",
  kind: "professional",
  featured: false,
  title: "Transportation Operations Management System",
  short: "Transport operations system",
  domain: "Logistics / Fleet Operations Application",
  domains: ["Logistics", "Software Application", "BI"],
  techTags: ["Python", "SQL"],
  tech: ["Python", "SQL", "Relational database"],
  thumb: "rr-fleet-perf",
  problem: "One internal system of record for a 100+ truck fleet: vehicles and documents, drivers, trips, billing, maintenance, store and performance reporting.",

  summary: {
    problem: "RR Logistics ran 100+ trucks for a major pharmaceutical logistics operation and for market work. Vehicle documents, driver assignments, trips, bills, maintenance and spares all had to be tracked consistently, and management needed reliable fleet and route performance reports.",
    solution: "An internal operations application built with Python and SQL on a relational database: fleet and driver masters with document-expiry monitoring, trip management, billing reconciliation, maintenance and store records, and operational, fleet, performance and billing reports.",
    contribution: "Designed, developed and maintained the application’s modules, database and reports using Python and SQL.", // VERIFY exact split
    outcome: "Better operational visibility, cleaner transportation data, tighter billing control and regular maintenance monitoring, with one system of record for the fleet.",
  },
  users: "Operations staff who kept vehicle, driver and trip records; billing and store users; management, who used the reports.", // VERIFY
  process: "Fleet operations end to end: vehicle and driver records, trip planning and tracking, billing, maintenance, store and performance reporting.",
  overviewNote: "Screens in this case study are synthetic, representative re-creations of the application’s confirmed modules, not copies of the real screens. Vehicle IDs, names, amounts and counts are demo values. Trip origin is shown as ‘Hub’.",
  modulesTitle: "Application modules",
  modules: [
    { name: "Fleet master", d: "Vehicle master, vehicle type, vehicle documents, insurance, permit, fitness and expiry monitoring." },
    { name: "Driver management", d: "Driver details, phone, driving licence, vehicle assignment and conductor assignment." },
    { name: "Trip management", d: "Trip creation with source, destination, vehicle, driver and conductor; expected and actual duration; trip status." },
    { name: "Fleet performance", d: "Vehicle, driver, trip and route performance; average trip time, delays and utilisation." },
    { name: "Billing", d: "Trip billing, vendor billing, bill claims, missing bills, vendor mistakes and billing reconciliation." },
    { name: "Maintenance", d: "Maintenance records, vehicle maintenance cost, high-maintenance vehicles and cost-saving opportunities." },
    { name: "Store", d: "Tyres, spare parts, maintenance material and stock records." },
    { name: "Reporting", d: "Operational, fleet, performance and billing reports." },
  ],

  problemText: [
    "RR Logistics is a partnership logistics company running more than 100 trucks in 10-wheel, 12-wheel and other configurations. About 80 vehicles served a major pharmaceutical logistics operation, referred to here as ‘Scorpion’, on routes including Ambala, Chennai, Bhiwandi, Hyderabad and Ahmedabad. The remaining 20+ ran in the market and for other vendors.",
    "At that scale every vehicle carries documents that expire — insurance, permit, fitness. Every trip needs a vehicle, a driver and a conductor, and every trip has to be billed and reconciled. Maintenance spend and store items such as tyres and spare parts add up quickly. When this information is not held in one place, expiries are noticed late, bills go missing and nobody can say which vehicles, drivers or routes perform well.",
  ],
  problemPoints: [
    "Which vehicle documents expire in the next 30, 60 or 90 days?",
    "Which driver and conductor are on which vehicle, and which trips are running late?",
    "Has every completed trip been billed, and do vendor bills agree with our records?",
    "Which vehicles cost the most to maintain, and where can cost be saved?",
    "How are vehicles, drivers and routes performing month to month?",
  ],
  objective: "Build one internal system of record for fleet operations — vehicles, drivers, trips, billing, maintenance and store — and turn its data into regular operational, fleet, performance and billing reports.",
  objectives: [
    "Monitor insurance, permit and fitness expiry for every vehicle.",
    "Record every trip with expected and actual duration and status.",
    "Reconcile trip billing with vendor bills and track claims and missing bills.",
    "Track maintenance cost and store stock against each vehicle.",
    "Report vehicle, driver, trip and route performance.",
  ],
  role: [
    "Designed the application’s modules around the business flow: vehicle, driver, route, trip, delivery, billing, maintenance, cost and performance.", // VERIFY
    "Designed and maintained the relational database: master, trip, billing, maintenance and store tables.", // VERIFY
    "Developed application modules and business logic in Python.", // VERIFY
    "Wrote the SQL behind the operational, fleet, performance and billing reports.", // VERIFY
    "Built the document-expiry monitoring and the billing-reconciliation checks.", // VERIFY
    "Maintained the application and its reports as operations changed.", // VERIFY
  ],

  data: {
    text: "The application is the operational system of record: users create and update records in its modules, and every report reads the same database. Validation rules listed below are representative.",
    sources: [
      { name: "Vehicle master", grain: "1 row per vehicle", fields: "vehicle ID, vehicle type / configuration, deployment (Scorpion, market, other vendor), status" },
      { name: "Vehicle documents", grain: "1 row per vehicle × document × validity period", fields: "insurance, permit, fitness; document number (masked), valid from, valid to" },
      { name: "Drivers and crew", grain: "1 row per person; 1 row per assignment", fields: "name, phone, driving licence and validity; vehicle, driver and conductor assignment" },
      { name: "Trips", grain: "1 row per trip", fields: "source, destination, vehicle, driver, conductor, expected duration, actual start / end, actual duration, status" },
      { name: "Billing", grain: "1 row per bill", fields: "trip, bill type (trip / vendor), amount, claim, reconciliation status" },
      { name: "Maintenance", grain: "1 row per maintenance job", fields: "vehicle, date, category, cost" },
      { name: "Store", grain: "1 row per stock movement", fields: "item, category (tyre, spare part, maintenance material), quantity in / out, vehicle, job" },
    ],
    processing: [
      "Records are entered through the application’s screens and stored in relational tables linked by vehicle, driver and trip keys.",
      "Python handles the application logic: checks on entry, trip duration and delay, expiry status, reconciliation and report output.",
      "Reports are SQL queries over the same tables, grouped by vehicle, driver, route, deployment and month.",
    ],
    validation: [
      "Mandatory fields and valid dates on vehicle documents, driver licences and trips.",
      "A trip closes only with an actual end time after its start, so actual duration and delay are always available.",
      "A renewed document adds a new validity period; the latest period is the one monitored.",
      "Bills are matched to trips; a completed trip without a matched bill appears on the missing-bills list.",
    ],
  },
  techUse: [
    { t: "Python", use: "Application modules and business logic: record entry and checks, trip duration and delay, expiry status, billing reconciliation and report generation." },
    { t: "SQL", use: "Relational schema for masters and transactions; the queries behind every operational, fleet, performance and billing report." },
    { t: "Relational database", use: "Single system of record for vehicles, documents, drivers, trips, billing, maintenance and store. (Database product not stated.)" },
  ],

  workflow: {
    text: "The business flow the application follows. Each step’s record links to the next, so a report can trace a trip from vehicle to cost.",
    steps: [
      { t: "Vehicle", d: "fleet master, documents, expiry monitoring" },
      { t: "Driver", d: "licence, vehicle and conductor assignment" },
      { t: "Route", d: "source and destination, e.g. Hub → Chennai" },
      { t: "Trip", d: "vehicle, driver, conductor and expected duration" },
      { t: "Delivery", d: "actual duration and trip status recorded" },
      { t: "Billing", d: "trip bill, vendor bill, claims, reconciliation" },
      { t: "Maintenance", d: "jobs, with tyres and parts issued from store" },
      { t: "Cost", d: "maintenance cost per vehicle" },
      { t: "Performance", d: "vehicle, driver, trip and route reports" },
    ],
  },
  architecture: {
    text: "Layered view of the application. The UI technology is not shown; Python holds the application logic and SQL the data and reports.",
    lanes: [
      { lane: "Users", nodes: [{ t: "Operations", d: "vehicles, drivers, trips" }, { t: "Billing" }, { t: "Store" }, { t: "Management", d: "reports" }] },
      { lane: "Modules", nodes: [{ t: "Fleet master", key: true }, { t: "Drivers" }, { t: "Trips", key: true }, { t: "Billing" }, { t: "Maintenance" }, { t: "Store" }] },
      { lane: "Logic (Python)", nodes: [{ t: "Checks on entry" }, { t: "Expiry monitor", d: "30 / 60 / 90 days" }, { t: "Duration & delay" }, { t: "Reconciliation" }] },
      { lane: "Data access", nodes: [{ t: "SQL", d: "inserts, updates, report queries" }] },
      { lane: "Database", nodes: [{ t: "Relational database", d: "system of record", key: true, db: true }] },
      { lane: "Reports", nodes: [{ t: "Operational" }, { t: "Fleet & compliance" }, { t: "Performance" }, { t: "Billing" }] },
    ],
  },
  model: {
    text: "Masters (vehicle, driver) with transactions (trip, bill, maintenance job, stock movement) hanging off them.",
    entities: [
      { name: "vehicle", fields: [["vehicle_id", "pk"], ["vehicle_type"], ["deployment"], ["status"]] },
      { name: "vehicle_document", fields: [["doc_id", "pk"], ["vehicle_id", "fk"], ["doc_type"], ["doc_no"], ["valid_from"], ["valid_to"]] },
      { name: "driver", fields: [["driver_id", "pk"], ["role"], ["name"], ["phone"], ["licence_no"], ["licence_valid_to"]] },
      { name: "crew_assignment", fields: [["vehicle_id", "fk"], ["driver_id", "fk"], ["conductor_id", "fk"], ["from_date"], ["to_date"]] },
      { name: "trip", fields: [["trip_id", "pk"], ["vehicle_id", "fk"], ["driver_id", "fk"], ["conductor_id", "fk"], ["source"], ["destination"], ["expected_hrs"], ["actual_start"], ["actual_end"], ["actual_hrs"], ["status"]] },
      { name: "bill", fields: [["bill_id", "pk"], ["trip_id", "fk"], ["bill_type"], ["party"], ["amount"], ["claim_amount"], ["recon_status"]] },
      { name: "maintenance_job", fields: [["job_id", "pk"], ["vehicle_id", "fk"], ["job_date"], ["category"], ["cost"]] },
      { name: "stock_movement", fields: [["move_id", "pk"], ["item_id", "fk"], ["vehicle_id", "fk"], ["job_id", "fk"], ["move_type"], ["qty"]] },
    ],
    note: "Representative design. Table and column names are illustrative; the real schema is not shown.",
  },

  sql: {
    title: "Expiry monitoring and missing bills",
    text: "Two representative queries: the 30 / 60 / 90-day document view behind the compliance dashboard, and completed trips that have no trip bill. Generic ANSI SQL, because the database product is not stated.",
    code: `-- Representative ANSI SQL on a synthetic schema — not production code
-- 1) Latest validity of each document per vehicle, banded for the compliance dashboard
WITH latest AS (
  SELECT vehicle_id, doc_type, MAX(valid_to) AS valid_to      -- a renewal adds a new row
    FROM vehicle_document
   WHERE doc_type IN ('INSURANCE', 'PERMIT', 'FITNESS')
   GROUP BY vehicle_id, doc_type
)
SELECT v.vehicle_id, v.vehicle_type, v.deployment, l.doc_type, l.valid_to,
       CASE
         WHEN l.valid_to <  CURRENT_DATE                     THEN 'Expired'
         WHEN l.valid_to <= CURRENT_DATE + INTERVAL '30' DAY THEN '0-30 days'
         WHEN l.valid_to <= CURRENT_DATE + INTERVAL '60' DAY THEN '31-60 days'
         ELSE '61-90 days'
       END AS expiry_band
  FROM vehicle v
  JOIN latest l ON l.vehicle_id = v.vehicle_id
 WHERE v.status = 'ACTIVE'
   AND l.valid_to <= CURRENT_DATE + INTERVAL '90' DAY
 ORDER BY l.valid_to;

-- 2) Completed trips with no trip bill: the missing-bills list
SELECT t.trip_id, t.vehicle_id, t.source, t.destination, t.actual_end
  FROM trip t
  LEFT JOIN bill b ON b.trip_id = t.trip_id
                  AND b.bill_type = 'TRIP'
 WHERE t.status = 'CLOSED'
   AND b.bill_id IS NULL
 ORDER BY t.actual_end;`,
    points: [
      "MAX(valid_to) per vehicle and document keeps renewal history but monitors only the current validity.",
      "The LEFT JOIN … IS NULL pattern lists trips that should have a bill but do not.",
      "The same banding drives the dashboard counts and the vehicle-level action list.",
    ],
  },
  python: {
    title: "Trip closure and billing reconciliation",
    text: "Representative, simplified application logic. `db` is a thin wrapper over the database connection with bound parameters; no framework or database product is implied.",
    code: `# Representative, simplified Python — not production code
from datetime import datetime

TOLERANCE = 1.0                      # rupees; ignore rounding differences


def close_trip(db, trip_id: int, actual_end: datetime) -> dict:
    """Close a delivered trip. Actual duration and delay feed the performance reports."""
    t = db.fetch_one("SELECT actual_start, expected_hrs FROM trip WHERE trip_id = :id", id=trip_id)
    if actual_end <= t["actual_start"]:
        raise ValueError("Trip end must be after trip start")
    actual_hrs = (actual_end - t["actual_start"]).total_seconds() / 3600
    delay_hrs = max(0.0, actual_hrs - t["expected_hrs"])
    db.execute("""UPDATE trip
                     SET actual_end = :end, actual_hrs = :hrs, status = 'CLOSED'
                   WHERE trip_id = :id""",
               end=actual_end, hrs=round(actual_hrs, 1), id=trip_id)
    return {"trip_id": trip_id, "actual_hrs": actual_hrs, "delay_hrs": delay_hrs}


def reconcile(trip_bills: dict, vendor_bills: dict) -> list:
    """Compare trip billing with vendor bills, trip by trip ({trip_id: amount})."""
    findings = []
    for trip_id in sorted(trip_bills.keys() | vendor_bills.keys()):
        ours, theirs = trip_bills.get(trip_id), vendor_bills.get(trip_id)
        if ours is None:
            status = "Missing trip bill"
        elif theirs is None:
            status = "Missing vendor bill"
        elif abs(ours - theirs) > TOLERANCE:
            status = "Vendor mistake - amount differs"
        else:
            status = "Matched"
        findings.append({"trip_id": trip_id, "ours": ours, "vendor": theirs, "status": status})
    return findings`,
    points: [
      "Delay is never negative: an early arrival counts as on time, not as a negative delay.",
      "Reconciliation works on the union of trip IDs, so a bill on either side without a partner is found.",
      "Differences that are disputed are followed up as bill claims until settled (Representative / Demo Workflow).",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Not a modelling project. The application’s value comes from simple rules applied to every record, so reports show exceptions rather than raw lists. Rules and thresholds below are representative.",
    rules: [
      { rule: "Document expiry", condition: "Latest insurance, permit or fitness validity is past, or within 30 / 60 / 90 days", outcome: "Banded on the compliance dashboard; expired documents on the action list" },
      { rule: "Licence expiry", condition: "Driver’s licence validity within 30 days", outcome: "Flagged in driver management" },
      { rule: "Trip delay", condition: "Actual duration greater than expected duration", outcome: "Counted as delayed; delay hours recorded" },
      { rule: "Missing bill", condition: "Closed trip with no trip bill, or no vendor bill", outcome: "Listed on the missing-bills report" },
      { rule: "Vendor mistake", condition: "Vendor bill differs from trip billing beyond a small tolerance", outcome: "Flagged for correction or a bill claim" },
      { rule: "High-maintenance vehicle", condition: "Maintenance cost well above the fleet average over a period", outcome: "Listed for review of cost-saving opportunities" },
      { rule: "Store reorder", condition: "Stock below reorder level", outcome: "Shown as reorder in the stock register" },
    ],
  },
  dashboard: {
    text: "The fleet performance dashboard: utilisation, trip time by route, delays, driver performance and the Scorpion vs market split. Other outputs are listed below.",
    visual: "rr-fleet-perf",
    outputs: [
      "Fleet compliance dashboard: insurance, permit and fitness expiring in 30 / 60 / 90 days, and expired",
      "Operational reports: trips by status, vehicle and crew assignments",
      "Performance reports: vehicle, driver, trip and route",
      "Billing reports: trip billing, vendor billing, missing bills, vendor mistakes, claims and reconciliation",
      "Maintenance cost and store stock reports",
    ],
  },
  insights: {
    note: "Design lessons, and the kinds of patterns the reports surface. Figures in the screens are demo values, not company results.",
    items: [
      "Document expiry is a planning problem: a 30 / 60 / 90-day view turns renewals into scheduled work instead of emergencies.",
      "Recording expected and actual duration on every trip is what makes route and driver performance measurable; each route needs its own expected duration.",
      "Billing problems fall into a few repeatable types — missing bills, amount differences, claims — so they can be checked systematically, trip by trip.",
      "Ranking vehicles by maintenance cost against the fleet average shows where to look first for cost-saving opportunities.",
      "Issuing store items against a vehicle makes that vehicle’s maintenance cost complete.",
    ],
  },
  impact: {
    before: ["Operational information spread across separate records", "Document expiries noticed late", "Bills and vendor bills checked by hand", "Little visibility of vehicle, driver and route performance"],
    solution: ["Python + SQL operations application on a relational database", "Fleet, driver, trip, billing, maintenance and store modules", "Expiry monitoring and reconciliation checks", "Operational, fleet, performance and billing reports"],
    after: ["One system of record for fleet operations", "Expiries visible 30 / 60 / 90 days ahead", "Missing bills and vendor mistakes listed for follow-up", "Regular reports for operations and management"],
    items: [
      "Improved operational visibility across the fleet.",
      "Better transportation data quality: one record per vehicle, driver and trip.",
      "Better reporting for operations and management.",
      "Stronger billing control through reconciliation, missing-bill lists and claim tracking.",
      "Maintenance monitoring, including high-maintenance vehicles.",
      "Better-informed operational decisions.",
    ],
    note: "During the period in which the system and operational processes were improved, the business experienced approximately 40% growth. The application supported this growth through improved operational visibility, reporting, billing control and fleet management.",
  },
  challenges: [
    "Keeping one consistent record per vehicle, driver and trip when many people enter data: checks on entry and masters maintained in one place.",
    "Measuring delay fairly: expected duration is set per route, so a long route such as Hub → Chennai is not judged against a short one.",
    "Matching bills to trips when amounts or references differ: reconciliation by trip with a tolerance, and an exception list instead of a full re-check.",
    "Comparing like with like: separating Scorpion work from market and other-vendor work in performance and billing reports.",
  ],
  learnings: [
    "An operations application is only as good as the data entered into it; simple checks and clean masters matter more than extra features.",
    "Designing the database around the business flow makes the reports straightforward SQL.",
    "Exception lists — expiring, missing, delayed, high-cost — get acted on; long raw reports do not.",
  ],
  screenshots: ["rr-fleet-perf", "rr-compliance", "rr-vehicle-master", "rr-driver", "rr-trip-create", "rr-trip-board", "rr-route-perf", "rr-billing", "rr-maintenance", "rr-store"],
  future: [
    "E-mail or SMS alerts for documents and licences expiring within 30 days.",
    "GPS / telematics feed for actual trip times instead of manual entry.",
    "Fuel records and cost per km by vehicle and route.",
    "Preventive maintenance schedules by date or kilometres.",
    "Role-based access and an audit trail of record changes.",
    "Self-service BI dashboards on top of the reporting tables.",
  ],

  interview: {
    s30: "At RR Logistics, a transport company running more than 100 trucks — about 80 for a major pharmaceutical logistics operation — I designed, developed and maintained the Transportation Operations Management System in Python and SQL. It holds the fleet and driver masters with insurance, permit and fitness expiry monitoring, creates and tracks trips, reconciles trip billing with vendor bills, records maintenance and store stock, and produces operational, fleet, performance and billing reports.", // VERIFY role wording
    s90: "RR Logistics ran more than 100 trucks in 10-wheel, 12-wheel and other configurations. About 80 served a major pharmaceutical logistics operation, which I call Scorpion, on routes such as Ambala, Chennai, Bhiwandi, Hyderabad and Ahmedabad; the rest ran in the market and for other vendors. At that scale you need one system of record, and the Transportation Operations Management System, built with Python and SQL on a relational database, provided it. The fleet master holds every vehicle with its insurance, permit and fitness dates, and a compliance view shows what expires in the next 30, 60 and 90 days. Driver management keeps licences, phone numbers and the driver and conductor assigned to each vehicle. Each trip is created with source, destination, vehicle, driver, conductor and expected duration, and closed with the actual duration, so delays and route performance can be measured. Billing compares trip billing with vendor bills and lists missing bills, vendor mistakes and claims. Maintenance and store records show cost per vehicle, the high-maintenance vehicles and stock of tyres and spare parts. Operational, fleet, performance and billing reports sit on top. During the period when the system and processes were improved, the business grew by about 40 percent; the application supported that growth through visibility, reporting, billing control and fleet management.",
    role: ["Designed and developed the application modules in Python", "Designed and maintained the relational database", "SQL for operational, fleet, performance and billing reports", "Expiry monitoring and billing reconciliation logic", "Maintained the application as operations changed"], // VERIFY
    tech: ["Python", "SQL", "Relational database"],
    impact: ["Operational visibility across 100+ vehicles", "Cleaner transportation data", "Billing control: missing bills, vendor mistakes, claims", "Maintenance monitoring", "Reports for decision-making"],
    challenges: ["Consistent data entry across many users", "Fair delay measurement by route", "Matching bills to trips", "Comparing Scorpion and market work like for like"],
    questions: [
      { q: "How did you design the database for this application?", a: [
        "Masters first: vehicle and driver, each with a primary key.",
        "Documents as a child table of vehicle with validity dates, so a renewal adds a row and history is kept.",
        "Trips reference vehicle, driver and conductor; bills reference the trip; maintenance jobs and store movements reference the vehicle.",
        "Foreign keys mean every bill traces to a trip and every cost to a vehicle, which is what the reports need." ] },
      { q: "How does document-expiry monitoring work?", a: [
        "Take the latest valid-to date per vehicle and document type (insurance, permit, fitness).",
        "Band it with a CASE expression: expired, 0–30, 31–60, 61–90 days.",
        "The dashboard counts the bands; the action list shows each vehicle with days left, expired first." ] },
      { q: "How do you measure trip and route performance?", a: [
        "Expected duration is set when the trip is created; actual duration is recorded when it closes.",
        "Delay = actual − expected, floored at zero; a trip is delayed if actual exceeds expected.",
        "Aggregate by route and month: trips, average expected and actual hours, % delayed. The same metrics by driver give driver performance.",
        "Each route has its own expected duration, so long and short routes are compared fairly." ] },
      { q: "How did billing reconciliation work?", a: [
        "Every closed trip should have a trip bill; a LEFT JOIN from trips to bills lists the missing ones.",
        "Vendor bills are matched to trips; amounts that differ beyond a small tolerance are flagged as vendor mistakes.",
        "Disputed differences become bill claims, tracked until they are settled." ] },
      { q: "How do you identify high-maintenance vehicles?", a: [
        "Sum maintenance cost per vehicle for a period, including tyres and parts issued from the store.",
        "Compare with the fleet average (or the average for the same vehicle type) and rank.",
        "Look at repeat jobs and the largest cost category for the top vehicles; that review is where cost-saving opportunities come from." ] },
      { q: "How would you define fleet utilisation?", a: [
        "Agree one definition first. Common choices: days on trip ÷ available days, or loaded km ÷ total km.",
        "Exclude or show separately the days a vehicle is in maintenance, so a workshop day is not read as idle capacity.",
        "Report it by vehicle and month so the lowest-utilised vehicles are visible." ] },
      { q: "The business grew about 40%. Did the application cause that?", a: [
        "I would not claim that. The business grew by approximately 40% during the period in which the system and operational processes were improved.",
        "The application supported that growth through better operational visibility, reporting, billing control and fleet management." ] },
      { q: "Why Python and SQL for this application?", a: [
        "The data is relational — vehicles, drivers, trips, bills — so SQL is the natural fit for storage and reporting.",
        "Python handles the application logic: checks on entry, duration and delay, reconciliation and report output.",
        "Keeping calculations such as delay and reconciliation in one Python layer means every screen and report uses the same rules." ] },
      { q: "How is this different from the freight audit and analytics project?", a: [
        "This application is the operational system of record: records are created and updated here every day.",
        "The analytics project works on that data afterwards: freight invoice audit, KPI reporting and Zoho Analytics dashboards." ] },
    ],
  },
});
