/* Case study — Customer & Electricity Connection Management System (Sakar Engitech, professional, 2019)
   Functionality follows the list confirmed by Ajeet. Confirmed technology: Python, Oracle Database, SQL,
   SQLAlchemy, database operations, data validation. The UI technology is not stated and is not named.
   "AVVNL / SCO-related information" is written exactly as confirmed (SCO is not expanded).
   All screens are synthetic: fictional names, placeholder villages, dummy K-numbers and meter numbers.
   Code is representative on a synthetic schema. Lines marked VERIFY: exact split of role not confirmed. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "sakar-crm",
  order: 1,
  company: "sakar",
  kind: "professional",
  featured: false,
  title: "Customer & Electricity Connection Management System (CRM)",
  short: "Customer & connection CRM",
  domain: "Utilities / Python + Oracle Business Application",
  domains: ["Software Application", "Data Quality"],
  techTags: ["Python", "Oracle", "SQL", "SQLAlchemy"],
  tech: ["Python", "Oracle Database", "SQL", "SQLAlchemy"],
  thumb: "sk-profile",
  problem: "A Python + Oracle application that registers customers and links each one to an electricity connection, K-number and meter, with forms, store records and data validation.",

  summary: {
    problem: "On government electricity infrastructure projects in Rajasthan, including rural areas where connections were being developed, each customer needed a connection, a K-number and a meter, plus forms and store records. These had to stay linked and consistent, and staff needed to find any customer quickly.",
    solution: "A customer and electricity connection management application in Python on an Oracle database (SQL, SQLAlchemy): customer registration with a unique customer ID, customer search, connection records, K-number and meter management, master values, government / project forms, AVVNL / SCO-related information and store management, with data validation.",
    contribution: "Python development and database administration: application modules, Oracle tables and SQL, SQLAlchemy data access, database operations and data validation.", // VERIFY exact split
    outcome: "One searchable record per customer linking connection, K-number, meter and billing / operational information, kept consistent by validation.", // VERIFY wording
  },
  users: "Project staff who registered customers and maintained connection, meter, form and store records.", // VERIFY
  process: "Customer registration and electricity connection management on government electricity infrastructure projects.",
  overviewNote: "Screens are synthetic, representative re-creations of the application’s functions. Customer names are fictional, places are placeholders (‘Village A, Block 3’), and customer IDs, K-numbers and meter numbers are dummy values. No real consumer data is shown.",
  modulesTitle: "Application modules",
  modules: [
    { name: "Customer Management", d: "Customer registration, customer details, customer search and a unique customer ID." },
    { name: "Connection Management", d: "Electricity connection records and connection / billing-related information; K-number management." },
    { name: "Meter Management", d: "Meter number management and the link between meter and connection." },
    { name: "Master Data", d: "Master values used across the application, such as places and categories." },
    { name: "Store Management", d: "Store stock records: items received and issued." },
    { name: "Forms & AVVNL / SCO information", d: "Government / project-related forms and AVVNL / SCO-related information." },
  ],

  problemText: [
    "Sakar Engitech worked on government electricity infrastructure projects in Rajasthan, including rural areas where electricity infrastructure and connections were being developed. Every new customer had to be registered and identified, given a connection and linked to a K-number — the consumer account number used by AVVNL (Ajmer Vidyut Vitran Nigam Limited), the state power distribution company — and to a meter.",
    "Each step produced information that had to stay connected: who the customer is, which connection and K-number belong to them, which meter is installed, which forms were filled and which items left the store. Without one system, the same customer can be entered twice, a connection can exist without a meter, and finding a record by K-number or meter number is slow.",
  ],
  problemPoints: [
    "Is this customer already registered?",
    "Which connection, K-number and meter belong to this customer?",
    "Which connections are still missing a meter or a K-number?",
    "Which forms and AVVNL / SCO-related information are recorded for a connection?",
  ],
  objective: "Build one Python and Oracle application that holds each customer’s identity, connection, K-number, meter and operational records together, with validation that keeps them complete and consistent.",
  objectives: [
    "Register each customer once, with a unique customer ID.",
    "Find any customer by name, customer ID, K-number or meter number.",
    "Link connection, K-number and meter to the customer.",
    "Keep master values, forms and store records in the same system.",
  ],
  role: [
    "Developed the application in Python: customer registration, search, connection, K-number and meter functions.", // VERIFY
    "Designed and administered the Oracle database: tables, keys, constraints and SQL.", // VERIFY
    "Implemented database access from Python with SQLAlchemy.", // VERIFY
    "Built data validation: unique customer ID, duplicate checks, and one K-number and one meter per connection.", // VERIFY
    "Built and maintained the master values, forms, AVVNL / SCO-related information and store management functions.", // VERIFY
    "Handled database operations for the application.", // VERIFY
  ],

  data: {
    text: "The application’s Oracle tables are the system of record for customers and connections. Field lists and validation rules below are representative; all examples are dummy data.",
    sources: [
      { name: "Customers", grain: "1 row per customer", fields: "customer ID, name, identification details (masked), village / block, mobile" },
      { name: "Connections", grain: "1 row per connection", fields: "connection ID, customer ID, category, K-number, status, dates" },
      { name: "Meters", grain: "1 row per meter", fields: "meter number, assigned connection, installed on, status" },
      { name: "Connection records", grain: "1 row per record", fields: "connection, record type (billing-related, operational, AVVNL / SCO-related), date, reference" },
      { name: "Master values", grain: "1 row per value", fields: "value type, code, description, active flag" },
      { name: "Forms", grain: "1 row per form entry", fields: "form type, customer or connection, reference, date" },
      { name: "Store", grain: "1 row per stock movement", fields: "item, quantity received / issued, date, reference" },
    ],
    processing: [
      "Records are entered through the application and saved through SQLAlchemy to Oracle tables.",
      "Drop-downs are filled from master values, so a village, block or category is always written the same way.",
      "SQL queries power customer search, connection lists and the data-quality checks.",
    ],
    validation: [
      "Mandatory fields and formats checked before a record is saved.",
      "Duplicate check on normalised name and identification number before a new customer is registered.",
      "K-number unique across connections; a meter assigned to only one connection.",
      "Foreign keys: a connection cannot exist without its customer, a meter link without its connection.",
      "Periodic checks list duplicate customers, connections without a meter and missing K-numbers (Representative / Demo Workflow).",
    ],
  },
  techUse: [
    { t: "Python", use: "Application logic: registration, search, connection, K-number, meter, forms and store; validation before save." },
    { t: "Oracle Database", use: "System of record: customer, connection, meter, master, form and store tables with keys and constraints." },
    { t: "SQL", use: "Table definitions and constraints, search queries, lists and data-quality checks." },
    { t: "SQLAlchemy", use: "Database access from Python: connections, transactions and parameterised queries." },
    { t: "Database operations & validation", use: "Running and maintaining the database for the application; checks on entry and in the schema." },
  ],

  workflow: {
    text: "How a customer’s records are built up, step by step. Each record links to the one before it.",
    steps: [
      { t: "Customer", d: "registration; place and category from master values" },
      { t: "Identification", d: "identity details recorded; duplicate check" },
      { t: "Customer ID", d: "unique ID generated by the application" },
      { t: "Connection", d: "connection record linked to the customer" },
      { t: "K-Number", d: "consumer account number recorded for the connection" },
      { t: "Meter", d: "meter number assigned and validated" },
      { t: "Billing / Operational Records", d: "billing-related information, forms, AVVNL / SCO-related information" },
    ],
  },
  architecture: {
    text: "Layered view. Python holds the application logic and validation; all database work goes through SQLAlchemy and SQL to Oracle.",
    lanes: [
      { lane: "Users", nodes: [{ t: "Project staff", d: "registration, connections, meters" }, { t: "Store" }, { t: "Admin", d: "master values" }] },
      { lane: "Application (Python)", nodes: [{ t: "Customers", key: true }, { t: "Connections & K-numbers", key: true }, { t: "Meters" }, { t: "Master values" }, { t: "Forms & AVVNL / SCO info" }, { t: "Store" }] },
      { lane: "Validation (Python)", nodes: [{ t: "Mandatory fields & formats" }, { t: "Duplicate check" }, { t: "Free-meter check" }] },
      { lane: "Data access", nodes: [{ t: "SQLAlchemy", d: "transactions, bind parameters" }, { t: "SQL" }] },
      { lane: "Database", nodes: [{ t: "Oracle Database", d: "keys, unique constraints, sequences", key: true, db: true }] },
      { lane: "Output", nodes: [{ t: "Customer profile" }, { t: "Connection lists" }, { t: "Forms" }, { t: "Data checks" }] },
    ],
  },
  model: {
    text: "Customer at the centre; connection, meter and records hang off it. Master values feed every drop-down.",
    entities: [
      { name: "customer", fields: [["customer_id", "pk"], ["full_name"], ["id_type"], ["id_no"], ["area_id", "fk"], ["mobile"], ["created_on"]] },
      { name: "connection", fields: [["connection_id", "pk"], ["customer_id", "fk"], ["category_id", "fk"], ["k_number (unique)"], ["status"], ["applied_on"]] },
      { name: "meter", fields: [["meter_no", "pk"], ["connection_id", "fk"], ["installed_on"], ["status"]] },
      { name: "connection_record", fields: [["record_id", "pk"], ["connection_id", "fk"], ["record_type"], ["record_date"], ["reference_no"]] },
      { name: "master_value", fields: [["value_id", "pk"], ["value_type"], ["code"], ["description"], ["is_active"]] },
      { name: "form_entry", fields: [["entry_id", "pk"], ["form_type_id", "fk"], ["customer_id", "fk"], ["connection_id", "fk"], ["entry_date"]] },
      { name: "store_movement", fields: [["move_id", "pk"], ["item_id", "fk"], ["move_type"], ["qty"], ["move_date"], ["reference_no"]] },
    ],
    note: "Representative design. Table and column names are illustrative; the real schema is not shown.",
  },

  sql: {
    title: "Constraints first, then data-quality checks",
    text: "Representative Oracle SQL. Keys and unique constraints are the first line of validation; the queries below list what still needs attention.",
    code: `-- Representative Oracle SQL on a synthetic schema — not production code
CREATE TABLE connection (
  connection_id  NUMBER        PRIMARY KEY,
  customer_id    NUMBER        NOT NULL REFERENCES customer (customer_id),
  category_id    NUMBER        NOT NULL REFERENCES master_value (value_id),
  k_number       VARCHAR2(20)  UNIQUE,              -- NULL until recorded; never shared
  status         VARCHAR2(20)  DEFAULT 'APPLIED' NOT NULL,
  applied_on     DATE          DEFAULT SYSDATE NOT NULL
);

CREATE TABLE meter (
  meter_no       VARCHAR2(20)  PRIMARY KEY,
  connection_id  NUMBER        UNIQUE REFERENCES connection (connection_id),  -- one meter per connection
  installed_on   DATE,
  status         VARCHAR2(20)  NOT NULL
);

-- Data-quality checks (Representative / Demo Workflow)
-- Possible duplicate customers: same normalised name and identification number
SELECT UPPER(TRIM(c.full_name)) AS name_key, c.id_no, COUNT(*) AS records,
       LISTAGG(c.customer_id, ', ') WITHIN GROUP (ORDER BY c.customer_id) AS customer_ids
  FROM customer c
 GROUP BY UPPER(TRIM(c.full_name)), c.id_no
HAVING COUNT(*) > 1;

-- Sanctioned or connected connections with no meter, or no K-number
SELECT cn.connection_id, cn.customer_id, cn.status,
       CASE WHEN m.meter_no  IS NULL THEN 'No meter'    END AS meter_issue,
       CASE WHEN cn.k_number IS NULL THEN 'No K-number' END AS k_number_issue
  FROM connection cn
  LEFT JOIN meter m ON m.connection_id = cn.connection_id
 WHERE cn.status IN ('SANCTIONED', 'CONNECTED')
   AND (m.meter_no IS NULL OR cn.k_number IS NULL);`,
    points: [
      "Oracle allows many NULLs in a UNIQUE column, so connections still waiting for a K-number are not blocked, but a K-number can never be used twice.",
      "UNIQUE on meter.connection_id enforces one meter per connection even if a screen check is bypassed.",
      "LEFT JOIN … IS NULL finds connections with no meter row.",
    ],
  },
  python: {
    title: "Registration and meter assignment with SQLAlchemy",
    text: "Representative, simplified. Each operation runs in one transaction with bind parameters; no SQL is built from user input.",
    code: `# Representative, simplified — not production code
from sqlalchemy import create_engine, text

engine = create_engine(ORACLE_URL)          # Oracle connection string kept in configuration


def register_customer(form: dict) -> str:
    missing = [f for f in ("full_name", "id_no", "area_id") if not form.get(f)]
    if missing:
        raise ValueError("Missing: " + ", ".join(missing))
    name = " ".join(form["full_name"].split()).upper()          # normalise spaces and case

    with engine.begin() as conn:                                  # one transaction
        dup = conn.execute(text("""
            SELECT customer_id FROM customer
             WHERE UPPER(full_name) = :name AND id_no = :id_no"""),
            {"name": name, "id_no": form["id_no"]}).first()
        if dup:
            raise ValueError(f"Already registered as customer {dup.customer_id}")

        new_id = conn.execute(text("SELECT customer_seq.NEXTVAL FROM dual")).scalar()
        conn.execute(text("""
            INSERT INTO customer (customer_id, full_name, id_type, id_no, area_id, mobile)
            VALUES (:cid, :name, :id_type, :id_no, :area_id, :mobile)"""),
            {"cid": new_id, "name": name, "id_type": form.get("id_type"), "id_no": form["id_no"],
             "area_id": form["area_id"], "mobile": form.get("mobile")})
    return f"CID-{new_id:06d}"


def assign_meter(connection_id: int, meter_no: str, installed_on) -> None:
    """Assign a free meter; refuses a meter that is already in use."""
    with engine.begin() as conn:
        res = conn.execute(text("""
            UPDATE meter
               SET connection_id = :c, installed_on = :d, status = 'INSTALLED'
             WHERE meter_no = :m AND connection_id IS NULL"""),
            {"c": connection_id, "d": installed_on, "m": meter_no})
        if res.rowcount != 1:
            raise ValueError(f"Meter {meter_no} not found or already assigned")`,
    points: [
      "engine.begin() commits on success and rolls back on any error, so a half-saved customer cannot exist.",
      "The customer ID comes from an Oracle sequence, so it is unique even when two users save at the same moment.",
      "The meter UPDATE only matches a free meter; checking rowcount turns a used or unknown meter into a clear message.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Not an analytics or ML project. The rules keep each customer’s records complete and consistent. Rules below are representative.",
    rules: [
      { rule: "Unique customer", condition: "Same normalised name and identification number already exists", outcome: "Registration stopped; existing customer ID shown" },
      { rule: "Customer ID", condition: "New customer saved", outcome: "Unique ID generated by the application" },
      { rule: "K-number", condition: "One K-number per connection; never shared", outcome: "Duplicate K-number rejected" },
      { rule: "Meter assignment", condition: "Meter must exist and be free; one meter per connection", outcome: "Assignment refused otherwise" },
      { rule: "Master values", condition: "Village, block and category chosen from active master values", outcome: "No free-text variants" },
      { rule: "Completeness", condition: "Sanctioned or connected connection without a meter or K-number", outcome: "Listed on the data-quality check" },
    ],
  },
  dashboard: {
    text: "The customer profile: one screen with the customer, the connection, its K-number, the meter and the record history.",
    visual: "sk-profile",
    outputs: [
      "Customer search results",
      "Connection records list with status",
      "Government / project forms and AVVNL / SCO-related information",
      "Store stock register",
      "Data-quality check lists (Representative / Demo Workflow)",
    ],
  },
  insights: {
    note: "Design lessons from building the application. No real data or results are shown.",
    items: [
      "Database constraints — primary, foreign and unique keys — catch errors that screen validation misses.",
      "A customer ID generated by the system, never typed by a user, is the anchor for every other record.",
      "Master values for villages, blocks and categories keep search and lists reliable.",
      "Staff hold different identifiers — a name, a K-number, a meter number — so search should accept all of them.",
      "Records become complete in stages (connection first, K-number and meter later), so the schema has to allow pending values and a check has to list them.",
    ],
  },
  impact: {
    before: ["Customer, connection and meter details at risk of drifting apart", "Duplicate registrations possible", "Slow lookup by K-number or meter number"],
    solution: ["Python application on Oracle (SQL, SQLAlchemy)", "Unique customer ID linked to connection, K-number and meter", "Master values, forms, AVVNL / SCO information and store", "Validation on entry and in the database"],
    after: ["One record per customer with linked connection details", "Search by name, ID, K-number or meter number", "Consistent master data", "Missing details visible for follow-up"],
    items: [
      "Centralised customer and electricity connection information.",
      "Better data quality through validation and database constraints.",
      "Faster retrieval of customer and connection records.",
      "Forms and store records kept in the same system as the customers they relate to.",
    ],
  },
  challenges: [
    "Preventing duplicate customers when names are spelt or spaced differently: normalisation plus a check on the identification number.",
    "Keeping K-number and meter links one-to-one: enforced with unique constraints, not only on screens.",
    "Records completed in stages: the schema allows pending K-number and meter values, and a completeness check lists them.",
    "Keeping master values clean as places were added: one admin screen, and deactivation instead of deletion.",
  ],
  learnings: [
    "Put integrity rules in the database as well as in the application.",
    "Design IDs and keys first; screens and lists follow from them.",
    "SQLAlchemy with bind parameters keeps Python code clean and safe from SQL injection.",
  ],
  screenshots: ["sk-profile", "sk-register", "sk-search", "sk-connections", "sk-meter", "sk-masters", "sk-forms", "sk-store", "sk-dq"],
  future: [
    "Map view of connections by village and block.",
    "Bulk upload of customer and connection data with a validation report.",
    "Scheduled data-quality reports by e-mail.",
    "Role-based access and an audit trail of changes.",
    "Mobile data entry for field teams.",
  ],

  interview: {
    s30: "At Sakar Engitech in 2019 I worked as a Python developer and DBA on a customer and electricity connection management system for government electricity projects in Rajasthan. Built in Python on Oracle with SQLAlchemy, it registered customers with a unique ID and linked each one to a connection, a K-number — the AVVNL consumer account number — and a meter, alongside master values, project forms and store records, with validation to keep the data clean.",
    s90: "In 2019 I worked at Sakar Engitech as a Python developer and DBA. The company worked on government electricity infrastructure projects in Rajasthan, including rural areas where electricity connections were being developed. Every customer had to be registered, identified and linked to a connection, a K-number — the consumer account number used by AVVNL, the state distribution company — and a meter. I worked on the application that held all of this, built in Python on an Oracle database with SQL and SQLAlchemy. Registration gives each customer a unique customer ID, and validation checks the details before saving so the same person is not registered twice. Users can search by name, customer ID, K-number or meter number and open a profile that shows the connection, K-number, meter and the billing-related and operational records together. Meter assignment accepts only a free meter, and the database itself makes sure a K-number or a meter belongs to one connection. Master values keep villages, blocks and categories consistent, and the same application holds government and project forms, AVVNL / SCO-related information and store records. On the database side I designed tables, keys and constraints and wrote the SQL behind search, lists and checks. The result was one consistent, searchable record for every customer and connection.",
    role: ["Python development of the application modules", "Oracle database design and administration", "SQLAlchemy data access", "Data validation and constraints", "Masters, forms, AVVNL / SCO information and store"], // VERIFY
    tech: ["Python", "Oracle Database", "SQL", "SQLAlchemy"],
    impact: ["Centralised customer and connection information", "Better data quality", "Faster retrieval of records", "Forms and store in the same system"],
    challenges: ["Duplicate customers", "One-to-one K-number and meter links", "Records completed in stages", "Clean master values"],
    questions: [
      { q: "What is a K-number, and how would you store it?", a: [
        "The K-number is the consumer account number used by AVVNL, the state power distribution company.",
        "It belongs to a connection, so it sits on the connection record with a UNIQUE constraint.",
        "It can be NULL until it is recorded; Oracle allows many NULLs in a unique column, so pending connections are not blocked." ] },
      { q: "How do you prevent duplicate customers?", a: [
        "Normalise the name (trim, collapse spaces, upper case) before comparing.",
        "Check name plus identification number before inserting, inside the same transaction as the insert.",
        "A periodic check lists any duplicates that still got through, for a person to confirm and merge." ] },
      { q: "How would you generate a unique customer ID safely?", a: [
        "From the database, not the user: an Oracle sequence gives the next number, which is formatted for display.",
        "Sequences are safe under concurrent use; two users saving at once never get the same number.",
        "Gaps can appear (for example after a rollback), which is fine for an identifier." ] },
      { q: "How do you make sure a meter is not assigned to two connections?", a: [
        "The assignment is a single UPDATE that only matches a meter whose connection is still NULL; if no row is updated, the meter is used or unknown.",
        "A UNIQUE constraint on the meter’s connection column stops a second meter on the same connection.",
        "Both run in one transaction, so a failure leaves nothing half-saved." ] },
      { q: "Why SQLAlchemy?", a: [
        "Connection handling and transactions (engine.begin commits or rolls back automatically).",
        "Bind parameters by default, which prevents SQL injection.",
        "Plain SQL through text() stays readable for Oracle-specific features such as sequences and LISTAGG." ] },
      { q: "How would you find connections without a meter?", a: [
        "LEFT JOIN connection to meter and keep rows where the meter is NULL; NOT EXISTS gives the same result.",
        "Filter to sanctioned or connected connections, so new applications are not counted as errors." ] },
      { q: "What are master values and why use them?", a: [
        "Reference lists — villages, blocks, categories and other types — maintained on one admin screen.",
        "Drop-downs read them, so every record uses the same code and spelling, and lists and search work reliably.",
        "Old values are deactivated, not deleted, so existing records keep a valid reference." ] },
      { q: "What did the DBA side of the role involve?", a: [
        "Designing tables, primary and foreign keys, unique constraints and sequences.",
        "Writing the SQL for search, lists and data-quality checks.",
        "Database operations for the application." ] }, // VERIFY
      { q: "What would you add next?", a: [
        "Bulk upload with a validation report, scheduled data-quality reports, role-based access with an audit trail, and a map view by village and block." ] },
    ],
  },
});
