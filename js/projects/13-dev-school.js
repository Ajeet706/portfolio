/* Case study — DEV School ERP & AI Management System (freelance product)
   Freelance work, separate from employment. Confirmed: the ten core modules are implemented;
   AI features are PLANNED / ROADMAP (not built). NOT confirmed: the technology stack —
   described generically. The AI concept screen and pseudo-logic are labelled
   "Planned / Roadmap — concept". All visuals use fictional students, parents, staff
   and branches. Code blocks are representative logic on an illustrative schema. */
(window.PROJECTS = window.PROJECTS || []).push({
  id: "dev-school",
  order: 1,
  company: "freelance",
  kind: "freelance",
  featured: false,
  title: "DEV School ERP & AI Management System",
  short: "DEV School ERP",
  domain: "Education / School Management Software",
  domains: ["Education", "Software Application"],
  techTags: [],
  // VERIFY: add the actual stack (framework, language, database) once confirmed, and the matching techTags
  tech: ["Web application", "Relational database"],
  thumb: "ds-dashboard",
  problem: "One application for a multi-branch school or coaching institute: students, parents, teachers, attendance, fees, academics, reports and administration — with AI features on the roadmap.",

  summary: {
    problem: "A school or coaching institute with several branches has to manage students, parents, teachers, attendance, fees and academics consistently — and still see the whole institution at once.",
    solution: "DEV School ERP: one application with modules for students, parents (with a parent portal), teachers, attendance, fees, academics, branches, users, reports and an admin dashboard. AI features are planned.",
    contribution: "Product design and development of the application modules as a freelance product developer.", // VERIFY
    outcome: "Ten core modules are implemented, giving the institution one system for day-to-day administration across branches. AI features are on the roadmap.", // VERIFY wording
  },
  users: "School / coaching administrators, branch staff, teachers, and parents through the parent portal.", // VERIFY
  process: "Day-to-day school administration across branches: student records, attendance, fees, academics, reporting and administration.",
  modulesTitle: "Application modules — ten implemented, AI on the roadmap",
  modules: [
    { name: "Student Management", status: "Implemented", d: "Student records — admission, branch, class and profile." },
    { name: "Parent Management", status: "Implemented", d: "Parents linked to their children, with a parent portal." },
    { name: "Teacher Management", status: "Implemented", d: "Teacher records with their classes and subjects." },
    { name: "Attendance", status: "Implemented", d: "Student attendance marked by class and day." },
    { name: "Fees", status: "Implemented", d: "Fee collection and outstanding dues per student." },
    { name: "Academic Management", status: "Implemented", d: "Classes, subjects and academic records." },
    { name: "Branch Management", status: "Implemented", d: "Several branches run in one system." },
    { name: "User Management", status: "Implemented", d: "Application users and their access." },
    { name: "Reports", status: "Implemented", d: "Reports across students, attendance, fees and academics." },
    { name: "Dashboard", status: "Implemented", d: "Overview of branches, students, attendance and fees." },
    { name: "AI features", status: "Planned / Roadmap", d: "Planned: AI / analytics over attendance, fee and academic data. Not built yet." },
  ],
  overviewNote: "Freelance product, built independently of any employment. Screens are synthetic demonstrations of the modules with fictional students, parents, staff and branches — not captures of the live product. The technology stack is not listed here. AI features are planned, not built — the AI screen is a roadmap concept.",

  problemText: [
    "A school or coaching institute that runs several branches works with the same core records every day: who the students are and who their parents are, which teacher takes which class, who attended today, which fees are paid or still due, and how each class is doing academically.",
    "When those records sit in separate registers or files per branch and per area, the administration cannot see the whole institution at once, parents have to ask the school for basic information, and every report takes manual effort. The product brings these areas into one application, with a module for each.",
  ],
  problemPoints: [
    "How many students, teachers and branches are there, and how is each branch doing today?",
    "Which fees are collected and which are still due?",
    "What can a parent see about their own child without calling the school?",
    "Where should staff follow up — attendance, fees or academics?",
  ],
  objective: "Design and build one school / coaching management application that covers students, parents, teachers, attendance, fees, academics, branches, users and reporting, with an admin dashboard — and a data model ready for planned AI features.",
  objectives: [
    "One record per student, shared by every module.",
    "Branch-wise and institution-wide views for administrators.",
    "A parent portal limited to each parent’s own children.",
    "Reports and analytics built on data the modules already capture.",
  ],
  // VERIFY: role wording — freelance product developer; product design and development of the modules
  role: [
    "Worked as the freelance product developer for the application.",
    "Product design: the module structure and how modules share student, branch and user records.",
    "Developed the student, parent (including the parent portal) and teacher management modules.",
    "Developed the attendance, fees and academic management modules.",
    "Developed branch management, user management, reports and the admin dashboard.",
    "Planned the AI / analytics roadmap on top of the data the modules capture.",
  ],

  data: {
    text: "The application keeps its own operational records. The sources below are a representative view of what the modules manage; tables, fields, processing and checks are illustrative design, not a confirmed specification.",
    sources: [
      { name: "Branches", grain: "1 row per branch", fields: "code, name, branch admin, status" },
      { name: "Students", grain: "1 row per student", fields: "admission no., branch, class / section, profile, status" },
      { name: "Parents", grain: "1 row per parent, linked to students", fields: "name, contact (masked in demo), linked children, portal access" },
      { name: "Teachers", grain: "1 row per teacher", fields: "branch, classes, subjects" },
      { name: "Attendance", grain: "1 row per student per day", fields: "date, class, present / absent / leave" },
      { name: "Fees", grain: "per student, fee head and term", fields: "amount billed, amount received, due date, receipts" },
      { name: "Academics", grain: "per student, subject and assessment", fields: "class, subject, marks" },
      { name: "Users", grain: "1 row per application user", fields: "role, branch access, status" },
    ],
    processing: [
      "Attendance and fee entries roll up from student to class, branch and institution for the dashboard and reports.",
      "Dues are billed minus received per student and fee head, aged from the due date.",
      "Planned / Roadmap: AI features would read the same attendance, fee and academic records — not built yet.",
    ],
    validation: [
      "One attendance mark per student per class day.",
      "Mandatory student fields (branch, class, admission number) before a record is saved.",
      "A parent account sees only linked children; branch users see their own branch.",
      "Receipts cannot exceed the amount still due on a fee head.",
    ],
  },
  // VERIFY: add the actual stack — the entries below are deliberately generic
  techUse: [
    { t: "Web application", use: "Screens for administrators, branch staff and teachers, and the parent portal." },
    { t: "Relational database", use: "Branches, students, parents, teachers, attendance, fees, academic records and users, linked by keys." },
  ],

  workflow: {
    text: "How the modules follow a school year (representative order).",
    steps: [
      { t: "Set up branches & users", d: "Branch Management · User Management" },
      { t: "Admit students", d: "Student Management — branch, class, section" },
      { t: "Link parents", d: "Parent Management — parent portal access" },
      { t: "Assign teachers & classes", d: "Teacher Management · Academic Management" },
      { t: "Mark daily attendance", d: "Attendance — class-wise" },
      { t: "Collect fees, track dues", d: "Fees" },
      { t: "Record academic results", d: "Academic Management" },
      { t: "Review dashboard and reports", d: "Dashboard · Reports" },
    ],
  },
  architecture: {
    text: "Logical view of the application. Technology names are intentionally generic — the stack is not listed in this case study.",
    lanes: [
      { lane: "Users", nodes: [{ t: "Administrator" }, { t: "Branch staff" }, { t: "Teacher" }, { t: "Parent" }] },
      { lane: "Access", nodes: [{ t: "Login & user management", d: "role and branch access", key: true }] },
      { lane: "Application", nodes: [{ t: "Admin & staff screens", key: true }, { t: "Parent portal", d: "own children only" }] },
      { lane: "Modules", nodes: [{ t: "Students" }, { t: "Parents" }, { t: "Teachers" }, { t: "Attendance" }, { t: "Fees" }, { t: "Academics" }, { t: "Branches" }] },
      { lane: "Insight", nodes: [{ t: "Dashboard", key: true }, { t: "Reports" }, { t: "AI features", d: "planned / roadmap" }] },
      { lane: "Data", nodes: [{ t: "Relational database", d: "one shared data model", key: true, db: true }] },
    ],
  },
  model: {
    text: "Every module works on the same student, branch and user records.",
    entities: [
      { name: "branch", fields: [["branch_id", "pk"], ["code"], ["name"], ["status"]] },
      { name: "class_section", fields: [["class_section_id", "pk"], ["branch_id", "fk"], ["class"], ["section"], ["class_teacher_id", "fk"]] },
      { name: "student", fields: [["student_id", "pk"], ["branch_id", "fk"], ["class_section_id", "fk"], ["admission_no"], ["name"], ["status"]] },
      { name: "parent", fields: [["parent_id", "pk"], ["name"], ["contact"]] },
      { name: "student_parent", fields: [["student_id", "fk"], ["parent_id", "fk"], ["relation"]] },
      { name: "teacher", fields: [["teacher_id", "pk"], ["branch_id", "fk"], ["name"], ["subjects"]] },
      { name: "attendance", fields: [["student_id", "fk"], ["att_date"], ["status"], ["marked_by", "fk"]] },
      { name: "fee_due", fields: [["due_id", "pk"], ["student_id", "fk"], ["term"], ["fee_head"], ["amount"], ["due_date"]] },
      { name: "fee_receipt", fields: [["receipt_id", "pk"], ["due_id", "fk"], ["amount"], ["paid_on"]] },
      { name: "assessment_mark", fields: [["student_id", "fk"], ["subject"], ["assessment"], ["marks"]] },
      { name: "app_user", fields: [["user_id", "pk"], ["role"], ["branch_id", "fk"], ["parent_id", "fk"]] },
    ],
    note: "Representative design. Table and column names are illustrative, not the product’s schema.",
  },

  sql: {
    title: "Branch figures for the admin dashboard",
    label: "SQL · representative logic on an illustrative schema — not the product’s code",
    text: "Representative / Demo Workflow: generic SQL on the illustrative schema above, showing how attendance and fee figures roll up by branch.",
    code: `-- Representative logic on an illustrative schema — not the product's code
-- Attendance today and fee position by branch
WITH att AS (
  SELECT s.branch_id,
         COUNT(*)                                        AS marked,
         SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) AS present
    FROM attendance a
    JOIN student s ON s.student_id = a.student_id
   WHERE a.att_date = :today
   GROUP BY s.branch_id
),
fees AS (
  SELECT s.branch_id,
         SUM(d.amount)                AS billed,
         SUM(COALESCE(r.received, 0)) AS collected
    FROM fee_due d
    JOIN student s ON s.student_id = d.student_id
    LEFT JOIN (SELECT due_id, SUM(amount) AS received
                 FROM fee_receipt
                GROUP BY due_id) r ON r.due_id = d.due_id
   WHERE d.term = :term
   GROUP BY s.branch_id
)
SELECT b.name                                                 AS branch,
       ROUND(100.0 * att.present / NULLIF(att.marked, 0), 1)  AS attendance_pct,
       fees.collected,
       fees.billed - fees.collected                           AS outstanding
  FROM branch b
  LEFT JOIN att  ON att.branch_id  = b.branch_id
  LEFT JOIN fees ON fees.branch_id = b.branch_id
 ORDER BY b.name;`,
    points: [
      "Receipts are summed per due before the join, so a due paid in instalments is not double-counted.",
      "NULLIF avoids a division by zero for a branch where attendance is not marked yet.",
      "Outstanding is billed minus received — one definition for the dashboard, dues list and parent view.",
    ],
  },
  python: {
    title: "Planned AI feature — follow-up signal (concept)",
    label: "Pseudo-logic · Planned / Roadmap — not built",
    text: "Planned / Roadmap. AI features are not built yet. This pseudo-logic is the concept for the first one: a follow-up list built from attendance, fee and academic data the modules already record.",
    code: `# Pseudo-logic — Planned / Roadmap concept (not built)
for each active student:
    att_30  = present days / working days over the last 30 days
    trend   = change in weekly attendance over the last 8 weeks
    overdue = days since the oldest unpaid fee due date
    gap     = class average - student's latest assessment average

    signals = []
    if att_30 < 0.75:               signals.add("attendance below 75%")
    if trend falls 4 weeks running: signals.add("attendance falling")
    if overdue > 60:                signals.add("fee overdue 60+ days")
    if gap > 15:                    signals.add("academic support")

    if signals: add the student to the follow-up list with branch, class and signals

group the follow-up list by branch  ->  planned AI insights panel`,
    points: [
      "Signals use data the modules already record — no extra data entry.",
      "Every flag carries its reason, so staff know why a student is on the list.",
      "Concept only — thresholds are illustrative.",
    ],
  },
  logic: {
    heading: "Business rules",
    text: "Representative / Demo Workflow: illustrative rules showing how the modules work together. They describe the design idea, not the product’s exact configuration.",
    points: [
      "Every module reads and writes the same student record.",
      "Access depends on the user’s role and branch.",
      "Planned AI output would be a follow-up list with reasons, not an automatic decision.",
    ],
    rulesNote: "Representative / Demo Workflow — illustrative rules and thresholds.",
    rules: [
      { rule: "Branch scope", condition: "User assigned to a branch", outcome: "Sees and edits that branch’s records" },
      { rule: "Parent access", condition: "Parent linked to one or more students", outcome: "Portal shows only linked children" },
      { rule: "Attendance", condition: "One mark per student per class day — present, absent or leave", outcome: "Rolls up to class, branch and dashboard" },
      { rule: "Fee dues", condition: "Billed minus received per student and fee head", outcome: "Due; overdue after the due date" },
      { rule: "Reports", condition: "Built on the same records as the modules", outcome: "Figures agree across screens" },
      { rule: "AI insight (planned)", condition: "Attendance below 75% over 30 days, or fee overdue 60+ days", outcome: "Roadmap: add to a follow-up list with the reason" },
    ],
  },
  dashboard: {
    text: "The admin dashboard: branches, students, today’s attendance and fee collection against dues. Other outputs below.",
    visual: "ds-dashboard",
    outputs: ["Student, parent and teacher records", "Class-wise daily attendance", "Fee receipts and dues lists", "Parent portal view per child", "Module-wise reports"],
  },
  insights: {
    note: "Product-design observations, illustrated with demo data. No client data or results are shown.",
    items: [
      "Attendance and fees are the figures that need daily attention in a school, so the dashboard shows both side by side per branch.",
      "A single student record shared by every module keeps attendance, fees, academics and the parent portal consistent.",
      "Branch is part of almost every record, so branch-wise and institution-wide views are the same logic with a different filter.",
      "Any future AI feature is only as good as daily data capture — quick attendance marking matters for everything downstream.",
    ],
  },
  // VERIFY: qualitative impact wording
  impact: {
    before: ["Separate registers or files per area and branch", "No single view across branches", "Manual effort to compile reports"],
    solution: ["One application with ten implemented modules", "Parent portal on the same records", "Dashboard and reports; AI features planned"],
    after: ["Student, attendance, fee and academic records in one place", "Branch-wise and institution-wide visibility", "Parents see their own children’s information"],
    items: ["Ten core modules implemented.", "One system for day-to-day administration across branches.", "Parents served through a portal on the same records.", "Clean daily data as the base for reports and the planned AI features."],
  },
  // VERIFY: confirm these were the main design challenges
  challenges: [
    "Keeping branch data separate for branch users while giving administrators one combined view.",
    "Fee structures that differ by class and term, with part payments — dues must always equal billed minus received.",
    "Making daily attendance marking quick enough that it is done every day.",
    "Limiting each parent to their own children’s records.",
  ],
  learnings: [
    "Product work starts from each user’s daily routine — administrator, teacher, fee desk and parent.",
    "A shared data model matters more than any single screen.",
    "Planned AI features will depend on complete, consistent daily data capture.",
  ],
  screenshots: ["ds-dashboard", "ds-student", "ds-attendance", "ds-fees", "ds-parent", "ds-academics", "ds-reports", "ds-ai", "ds-admin"],
  future: [
    "SMS / e-mail alerts to parents for absence and fee dues.",
    "Online fee payment from the parent portal.",
    "AI features (planned): a follow-up list and a predictive at-risk student model on attendance, fee and assessment history.",
    "Mobile-friendly attendance marking for teachers.",
    "Transport, library and hostel modules.",
    "An audit trail of changes to student, fee and attendance records.",
  ],

  interview: {
    s30: "DEV School ERP is a freelance product I built for school and coaching management across multiple branches. Ten core modules are implemented: student, parent and teacher management, attendance, fees, academics, branch and user management, reports and an admin dashboard. Parents get a portal for their own children and administrators see attendance and fee collection by branch. AI features are the next stage on the roadmap.",
    s90: "DEV School ERP is a freelance product, separate from my employment, for schools and coaching institutes that run several branches. The problem is simple to state: the same core records — students, parents, teachers, attendance, fees and academics — are needed every day, and the administration needs to see every branch at once. I worked as the product developer: I designed the module structure and developed the modules. Ten core modules are implemented. Student, parent and teacher management hold the core records, and parents are linked to their children so the parent portal shows each parent only their own children’s attendance, fees and progress. Attendance is marked class by class each day. Fees track what is billed, what is received and what is still due. Academic management covers classes, subjects and academic records. Branch and user management decide who can see which branch. On top of that sit reports and an admin dashboard showing students, today’s attendance and fee collection against dues by branch. The design principle was one shared student record that every module reads and writes, so the dashboard, reports and parent portal always agree. AI features are planned, not built: the first is a follow-up list from attendance, fee and academic signals, then a predictive at-risk model — both depend on the clean daily data the current modules already capture.",
    role: ["Freelance product developer", "Product design of the module structure", "Development of the ten core modules", "Parent portal, dashboard and reports", "AI roadmap (planned, not built)"], // VERIFY
    tech: ["Web application", "Relational database"], // VERIFY: add the actual stack
    impact: ["Ten core modules implemented", "One system across branches", "Parent portal on the same records", "Data foundation for planned AI features"],
    challenges: ["Branch-level access with a combined admin view", "Fees with part payments and different structures", "Fast daily attendance marking", "Parent access limited to own children"],
    questions: [
      { q: "What is DEV School ERP and who uses it?", a: ["A school / coaching management application for institutions with several branches.", "Administrators and branch staff run the modules, teachers work with attendance and academics, and parents use the parent portal.", "It is freelance product work, separate from my employment."] },
      { q: "Which modules does it have?", a: ["Student, parent and teacher management; attendance; fees; academic management.", "Branch management and user management.", "Reports and an admin dashboard — ten modules implemented.", "AI features are planned / roadmap, not built yet."] },
      { q: "How did you structure the modules?", a: ["Around one shared student record linked to its branch, class and parents.", "Attendance, fees, academics and the parent portal all read and write that record, so figures agree everywhere.", "Users carry a role and branch access, which decides what each screen shows."] },
      { q: "How does the multi-branch design work?", a: ["Branch is part of the student, teacher and class records.", "Branch users work within their branch; administrators see all branches together.", "Branch-wise and institution-wide figures come from the same logic with a different filter."] },
      { q: "How does the parent portal control access?", a: ["Parents are linked to their children; a parent with two children can switch between them.", "The portal shows only linked children’s attendance, fees and academic records — the same records staff use, not a copy."] },
      { q: "How are fees and dues calculated?", a: ["Outstanding is billed minus received per student and fee head, so part payments are handled naturally.", "Dues are aged from the due date for follow-up, and the same definition is used on the dashboard and dues list."] },
      { q: "What about the AI features in the name?", a: ["They are planned, not built yet — I keep that distinction clear.", "The first planned feature is a follow-up list from attendance, fee and academic signals, with a reason for each student.", "After that, a predictive at-risk model — it needs history, which the current modules are already collecting."] },
      { q: "What did building a full product teach you?", a: ["Analytics depends on data being captured correctly every day; in a product you design that capture yourself.", "Screens must fit each user’s routine, and a shared data model matters more than any single screen."] },
      { q: "What would you add next?", a: ["Parent alerts for absence and dues, online fee payment, mobile-friendly attendance marking, the planned AI features, and new modules such as transport and library."] },
    ],
  },
});
