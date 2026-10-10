/* =====================================================================
   main.js — renders the page from CONFIG, PROJECTS and VIS and wires
   search + filters, the case-study overlay (20 sections), Interview View,
   gallery + lightbox, and the default-risk demo.
   ===================================================================== */
(function () {
  "use strict";
  const { html, fmt, esc } = window.Charts;
  const CFG = window.CONFIG || {};
  const VIS = window.VIS || {};
  const S = window.SYNTH;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const DEMO_LABEL = "Demo / synthetic data — portfolio demonstration only";

  /* ---------- defaults so one incomplete project never breaks the page */
  function normalize(p) {
    p.kind = p.kind || "professional";
    p.company = p.company || (p.kind === "personal" ? "personal" : p.kind === "freelance" ? "freelance" : "sk");
    p.domains = p.domains || []; p.techTags = p.techTags || []; p.tech = p.tech || [];
    p.summary = Object.assign({ problem: "", solution: "", contribution: "", outcome: "" }, p.summary || {});
    p.interview = Object.assign({ s30: "", s90: "", role: [], tech: [], impact: [], challenges: [], questions: [] }, p.interview || {});
    p.problem = p.problem || p.summary.problem;
    p.title = p.title || p.id;
    p.domain = p.domain || p.domains.join(" / ");
    return p;
  }

  /* ---------- order & numbering ------------------------------------ */
  const groupRank = Object.fromEntries((CFG.groupOrder || []).map((g, i) => [g, i]));
  const PROJECTS = (window.PROJECTS || []).filter((p) => p && p.id).map(normalize).slice().sort((a, b) =>
    (groupRank[a.company] ?? 9) - (groupRank[b.company] ?? 9) || (a.order ?? 99) - (b.order ?? 99));
  PROJECTS.forEach((p, i) => { p.index = i; });
  const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
  const num = (p) => String(p.index + 1).padStart(2, "0");
  const company = (p) => (CFG.companies || {})[p.company] || { name: p.company };
  const typeLabel = (p) => ({ professional: "Professional", personal: "Personal", freelance: "Freelance" }[p.kind] || "Professional");

  /* ---------- auto-generated diagram visuals per project ------------ */
  function lanesHTML(arch) {
    if (arch.lanes) {
      return `<div class="arch">${arch.lanes.map((l, i) => `${i ? '<div class="arch-down" aria-hidden="true">↓</div>' : ""}<div class="arch-row"><div class="arch-lane">${esc(l.lane)}</div><div class="arch-nodes">${l.nodes.map((n) =>
        `<div class="arch-node${n.key ? " k" : ""}${n.db ? " db" : ""}">${esc(n.t)}${n.d ? `<small>${esc(n.d)}</small>` : ""}</div>`).join("")}</div></div>`).join("")}</div>`;
    }
    return html.flowV(arch.flow || []);
  }
  const erdHTML = (m) => `<div class="erd">${m.entities.map((e) => `<div class="entity"><h5>${esc(e.name)}</h5><ul>${e.fields.map((f) => `<li class="${f[1] || ""}">${esc(f[0])}</li>`).join("")}</ul></div>`).join("")}</div>${m.note ? `<p class="erd-note">${esc(m.note)}</p>` : ""}`;
  PROJECTS.forEach((p) => {
    if (p.workflow && p.workflow.steps) VIS["wf:" + p.id] = { diagram: true, title: `Business workflow — ${p.short || p.title}`, sub: p.workflow.text || "", caption: "Diagram. Representative flow of the business process.", render(el) { el.innerHTML = html.flowV(p.workflow.steps); } };
    if (p.architecture) VIS["arch:" + p.id] = { diagram: true, title: `Technical architecture — ${p.short || p.title}`, sub: p.architecture.text || "", caption: "Diagram. Components and data flow.", render(el) { el.innerHTML = lanesHTML(p.architecture); } };
    if (p.model && p.model.entities) VIS["erd:" + p.id] = { diagram: true, title: `Data model — ${p.short || p.title}`, sub: p.model.text || "", caption: "Diagram. Illustrative tables and keys.", render(el) { el.innerHTML = erdHTML(p.model); } };
  });
  const galleryKind = (id) => {
    const v = VIS[id] || {};
    if (v.cat) return v.cat;
    if (id.startsWith("wf:")) return "workflow";
    if (id.startsWith("arch:")) return "architecture";
    if (id.startsWith("erd:")) return "model";
    const key = (id + " " + (v.title || "")).toLowerCase();
    if (v.diagram) return /flow|lifecycle|journey|process/.test(key) ? "workflow" : /model|erd|entity/.test(key) ? "model" : "architecture";
    return /dash|dashboard|overview|monitor/.test(key) ? "dashboard" : "screen";
  };
  const gallerySet = (p) => (p.screenshots || []).filter((id) => VIS[id]).concat(["wf:", "arch:", "erd:"].map((k) => k + p.id).filter((id) => VIS[id]));

  /* ---------- scaled "screenshot" rendering ------------------------ */
  const shotRO = typeof ResizeObserver !== "undefined" ? new ResizeObserver((es) => es.forEach((e) => fitShot(e.target))) : null;
  function fitShot(box) {
    const inner = box.querySelector(".shot-inner");
    if (!inner) return;
    const pad = 12;
    inner.style.left = inner.style.top = pad + "px";
    inner.style.transform = `scale(${Math.min(1, (box.clientWidth - pad * 2) / inner.offsetWidth)})`;
  }
  function renderShot(box, id, designW = 900) {
    const v = VIS[id];
    if (!v) return;
    box.innerHTML = `<div class="shot-inner" style="width:${designW}px"><div class="viz-host"></div></div><span class="shot-label">${v.diagram ? "Diagram" : DEMO_LABEL}</span>`;
    box.setAttribute("aria-hidden", "true");
    try { v.render($(".viz-host", box), { thumb: false }); } catch (e) { console.error(id, e); }
    fitShot(box);
    if (shotRO) shotRO.observe(box);
  }
  function frame(id, opts = {}) {
    const v = VIS[id];
    const f = document.createElement("figure");
    f.className = "viz-frame";
    if (!v) { f.innerHTML = `<div class="viz-body"><p class="note">Visual “${esc(id)}” not found.</p></div>`; return f; }
    f.innerHTML = `<div class="viz-head"><div><div class="viz-title">${esc(v.title)}</div>${v.sub ? `<div class="viz-sub">${esc(v.sub)}</div>` : ""}</div>
      <button class="viz-expand" type="button" data-lightbox="${esc(id)}" data-set="${esc((opts.set || [id]).join(","))}" aria-label="Enlarge ${esc(v.title)}">Enlarge</button></div>
      <div class="viz-body"><div class="viz-host"></div></div>
      <figcaption class="viz-foot"><span>${esc(v.caption || "")}</span><span class="tag ${v.diagram ? "tag-diagram" : "tag-synth"}">${v.diagram ? "Diagram" : DEMO_LABEL}</span></figcaption>`;
    requestAnimationFrame(() => { try { v.render($(".viz-host", f), { thumb: false }); } catch (e) { console.error(id, e); } });
    return f;
  }

  /* ------------------------------------------------------------------
     Config-driven bits
     ------------------------------------------------------------------ */
  function applyConfig() {
    $$('[data-link="resume"]').forEach((a) => { a.href = CFG.resume || "assets/resume.pdf"; });
    $$('[data-link="linkedin"]').forEach((a) => { if (CFG.linkedin) a.href = CFG.linkedin; else a.hidden = true; });
    $$('[data-link="github"]').forEach((a) => { if (CFG.github) a.href = CFG.github; else a.hidden = true; });
    $$('[data-link="email"]').forEach((a) => { if (CFG.email) a.href = "mailto:" + CFG.email; else a.hidden = true; });
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    const counts = { professional: 0, personal: 0, freelance: 0 };
    PROJECTS.forEach((p) => { counts[p.kind] = (counts[p.kind] || 0) + 1; });
    $$("[data-count]").forEach((el) => { el.textContent = el.dataset.count === "all" ? PROJECTS.length : counts[el.dataset.count] || 0; });

    const rows = [
      { k: "Email", v: CFG.email, copy: true, href: CFG.email ? "mailto:" + CFG.email : "" },
      { k: "Phone", v: CFG.phone, copy: true, href: CFG.phone ? "tel:" + CFG.phone.replace(/\s/g, "") : "" },
      { k: "LinkedIn", v: CFG.linkedin, href: CFG.linkedin, ext: true },
      { k: "GitHub", v: CFG.github, href: CFG.github, ext: true },
      { k: "Location", v: CFG.location },
    ];
    $("#contact-list").innerHTML = rows.map((r) => {
      const shown = r.v ? r.v.replace(/^https?:\/\/(www\.)?/, "") : "";
      const val = r.v
        ? (r.href ? `<a href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(shown)}</a>` : `<span class="val">${esc(shown)}</span>`)
        : `<span class="placeholder">Add your ${esc(r.k)} link in js/config.js</span>`;
      const btn = r.v && r.copy ? `<button class="copy-btn" type="button" data-copy="${esc(r.v)}">Copy</button>` : "<span></span>";
      return `<li><span class="label">${esc(r.k)}</span>${val}${btn}</li>`;
    }).join("");
  }

  /* ------------------------------------------------------------------
     Skill map
     ------------------------------------------------------------------ */
  function renderSkills() {
    $("#skill-map").innerHTML = (CFG.skills || []).map((g) => `
      <div class="skill-group"><h3>${esc(g.group)}</h3><ul>${g.items.map((s) => {
        const ev = (s.in || []).filter((id) => byId[id]).map((id) => byId[id]).sort((a, b) => a.index - b.index);
        return `<li><span>${esc(s.name)}</span><span class="evidence">${ev.map((p) =>
          `<button type="button" class="${p.kind}" data-open-case="${p.id}" title="${esc(p.title)}" aria-label="${esc(s.name)}: open ${esc(p.title)}">${num(p)}</button>`).join("")}</span></li>`;
      }).join("")}</ul></div>`).join("");
    $("#skill-key").innerHTML = `Numbers open the case study that shows the skill: ${PROJECTS.map((p) => `<button type="button" class="key-link" data-open-case="${p.id}">${num(p)} ${esc(p.short || p.title)}</button>`).join(" · ")}. Dashed = personal or freelance.`;
  }

  /* ------------------------------------------------------------------
     Projects: groups, lifecycle map, cards, search & filters
     ------------------------------------------------------------------ */
  const LIFECYCLE = {
    stages: ["Lead & application", "KYC & screening", "Credit decision", "Disbursement", "Portfolio & repayment", "Collections & delinquency", "Compliance", "Reporting"],
    spans: { onedash: [1, 8], bre: [3, 3], scorecard: [3, 3], uid: [2, 2], screening: [2, 2], ews: [5, 6], aml: [5, 7], datamart: [8, 8] },
  };
  function lifecycleHTML() {
    const ids = Object.keys(LIFECYCLE.spans).filter((id) => byId[id]).sort((a, b) => byId[a].index - byId[b].index);
    if (!ids.length) return "";
    const n = LIFECYCLE.stages.length;
    return `<figure class="lifemap" aria-label="Where each SK Finance project sits in the lending lifecycle">
      <figcaption><span class="label">Where each project sits in the lending lifecycle</span></figcaption>
      <div class="lifemap-scroll"><div class="lifemap-grid" style="--n:${n}">
        <div class="lm-corner"></div>${LIFECYCLE.stages.map((s, i) => `<div class="lm-stage" style="grid-column:${i + 2}">${esc(s)}</div>`).join("")}
        ${ids.map((id, r) => { const [a, b] = LIFECYCLE.spans[id]; const p = byId[id];
          return `<button type="button" class="lm-name" style="grid-row:${r + 2}" data-open-case="${id}">${num(p)} ${esc(p.short || p.title)}</button>
            <button type="button" class="lm-bar${id === "onedash" ? " all" : ""}" style="grid-row:${r + 2};grid-column:${a + 1} / ${b + 2}" data-open-case="${id}" aria-label="Open ${esc(p.title)}"></button>`; }).join("")}
      </div></div></figure>`;
  }

  function cardHTML(p) {
    const doms = p.domains.slice(0, 3);
    return `<article class="card${p.featured ? " featured" : ""}" data-id="${p.id}">
      <button class="card-thumb" type="button" data-open-case="${p.id}" aria-label="Open case study: ${esc(p.title)}"><div class="shot-box"></div></button>
      <div class="card-body">
        <div class="card-meta"><span class="kicker">${esc(company(p).name)}</span><span class="card-num">${num(p)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p class="card-problem">${esc(p.problem)}</p>
        <p class="card-pitch">${esc(p.interview.s30)}</p>
        <div class="badges">${doms.map((d) => `<span class="badge">${esc(d)}</span>`).join("")}<span class="badge type-${p.kind}">${typeLabel(p)}</span></div>
        <p class="tech-line">${p.tech.slice(0, 5).map(esc).join(" · ")}</p>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" type="button" data-open-case="${p.id}">View case study →</button>
          <span class="card-links"><button class="btn btn-text btn-sm" type="button" data-open-case="${p.id}" data-view="interview">Interview view</button><button class="btn btn-text btn-sm" type="button" data-shots="${p.id}">Screenshots</button></span>
        </div>
      </div></article>`;
  }

  function renderProjects() {
    const root = $("#project-groups");
    root.innerHTML = (CFG.groupOrder || []).map((g) => {
      const list = PROJECTS.filter((p) => p.company === g);
      if (!list.length) return "";
      const c = CFG.companies[g] || {};
      const extra = g === "sk" ? lifecycleHTML() : g === "personal" ? `<div class="lab-feature" id="lab-feature"></div>` : "";
      return `<section class="pgroup" data-group="${g}" aria-labelledby="pg-${g}">
        <header class="pgroup-head">
          <div><p class="kicker">${esc(c.years ? `${c.name} · ${c.years}` : c.name)}</p><h3 id="pg-${g}">${esc(c.group || c.name)}</h3></div>
          <p>${esc(c.context || "")}${c.role ? ` <span class="pgroup-role">${esc(c.role)}</span>` : ""}</p>
        </header>
        ${extra}
        <div class="cards n${Math.min(list.length, 3)}">${g === "personal" ? "" : list.map(cardHTML).join("")}</div>
      </section>`;
    }).join("");
    $$(".card", root).forEach((card) => {
      const p = byId[card.dataset.id];
      renderShot($(".shot-box", card), p.featured && p.featuredThumb ? p.featuredThumb : p.thumb, p.featured ? 960 : 720);
    });
  }

  /* filters */
  const F = { q: "", domain: "", tech: "", type: "" };
  function renderFilters() {
    const fl = CFG.filters || {};
    const row = (key, label, vals) => `<div class="frow" role="group" aria-label="Filter by ${label}"><span class="frow-l">${label}</span><div class="fchips">${vals.map((v) =>
      `<button type="button" class="fchip" data-f="${key}" data-v="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("")}</div></div>`;
    $("#filter-rows").innerHTML = row("domain", "Domain", fl.domain || []) + row("tech", "Technology", fl.tech || []) + row("type", "Type", fl.type || []);
  }
  function matches(p) {
    if (F.domain && !p.domains.includes(F.domain)) return false;
    if (F.tech && !(p.techTags || []).includes(F.tech)) return false;
    if (F.type && typeLabel(p) !== F.type) return false;
    if (F.q) {
      const hay = [p.title, p.short, p.domain, p.problem, company(p).name, ...(p.tech || []), ...(p.domains || []), p.summary.solution].join(" ").toLowerCase();
      if (!F.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
    }
    return true;
  }
  function applyFilters() {
    const active = !!(F.q || F.domain || F.tech || F.type);
    document.body.classList.toggle("filtering", active);
    let shown = 0;
    $$(".pgroup").forEach((g) => {
      const list = PROJECTS.filter((p) => p.company === g.dataset.group);
      let vis = 0;
      list.forEach((p) => {
        const ok = matches(p);
        const card = $(`.card[data-id="${p.id}"]`, g);
        if (card) card.classList.toggle("is-hidden", !ok);
        if (ok) vis += 1;
      });
      g.hidden = vis === 0;
      shown += vis;
    });
    $$(".fchip").forEach((b) => b.setAttribute("aria-pressed", String(F[b.dataset.f] === b.dataset.v)));
    $("#filter-count").textContent = active ? `${shown} of ${PROJECTS.length} projects` : `${PROJECTS.length} projects`;
    $("#filter-clear").hidden = !active;
    $("#filter-empty").hidden = shown > 0;
  }

  /* ------------------------------------------------------------------
     Default-risk demo (personal ML project)
     ------------------------------------------------------------------ */
  const LR = S.pd.lr, BAND = S.pd.bands.cut;
  const FIELDS = [
    ["income", "Monthly income", 10000, 500000, 1000, "₹"], ["obligations", "Existing EMIs (obligations)", 0, 300000, 500, "₹ per month"],
    ["loan", "Loan amount", 50000, 1500000, 10000, "₹"], ["tenure", "Tenure", 6, 84, 1, "months"],
    ["score", "Credit score (bureau)", 300, 900, 1, "300–900"], ["dpd", "Max DPD, last 12 months", 0, 180, 1, "days"],
    ["bounce", "EMI bounces, last 12 months", 0, 12, 1, "count"], ["defaults", "Previous defaults", 0, 5, 1, "count"],
    ["ratio", "Payment ratio", 0, 1, 0.01, "paid ÷ due"]];
  const EXAMPLES = {
    stressed: { income: 32000, obligations: 6500, loan: 650000, tenure: 36, score: 612, dpd: 45, bounce: 3, defaults: 1, ratio: 0.74 },
    low: { income: 85000, obligations: 0, loan: 400000, tenure: 36, score: 790, dpd: 0, bounce: 0, defaults: 0, ratio: 0.98 },
  };
  const ACTIONS = {
    foir: "Reduce the loan amount, lengthen the tenure or close an existing EMI so FOIR falls below about 0.55.",
    bureau_score: "Pull a fresh bureau report and review recent enquiries and other obligations.",
    prev_max_dpd: "Ask for the reason behind the recent delinquency and confirm it has been regularised.",
    emi_bounce_12m: "Review six months of bank statements for bounce reasons; take NACH on the salary account.",
    prev_defaults: "Confirm earlier defaults are settled and obtain closure letters.",
    payment_ratio: "Check the pattern of partial payments; consider a lower-EMI structure.",
  };
  function score(inp) {
    const r = 0.16 / 12, n = inp.tenure;
    const emi = inp.loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const foir = Math.min(2, Math.max(0.02, (emi + inp.obligations) / inp.income));
    const x = { bureau_score: inp.score, prev_max_dpd: inp.dpd, emi_bounce_12m: inp.bounce, prev_defaults: inp.defaults, payment_ratio: inp.ratio, foir };
    const shown = { bureau_score: String(inp.score), prev_max_dpd: inp.dpd + " days", emi_bounce_12m: String(inp.bounce), prev_defaults: String(inp.defaults), payment_ratio: inp.ratio.toFixed(2), foir: foir.toFixed(2) };
    let z = LR.intercept;
    const contribs = LR.features.map((f) => { const c = f.coef * ((x[f.key] - f.mean) / f.sd); z += c; return { key: f.key, label: f.label, value: c, shown: shown[f.key] }; });
    const pd = 1 / (1 + Math.exp(-z));
    return { pd, emi, foir, band: pd >= BAND.high ? "High" : pd >= BAND.low ? "Medium" : "Low", contribs: contribs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) };
  }
  const meterPos = (pd) => (pd < BAND.low ? (pd / BAND.low) * 30 : pd < BAND.high ? 30 + ((pd - BAND.low) / (BAND.high - BAND.low)) * 30 : 60 + ((pd - BAND.high) / (1 - BAND.high)) * 40);
  function renderPrediction(inp) {
    const r = score(inp);
    const kind = r.band === "High" ? "crit" : r.band === "Medium" ? "warn" : "good";
    const maxAbs = Math.max(1, ...r.contribs.map((c) => Math.abs(c.value)));
    const drivers = r.contribs.filter((c) => c.value > 0.05).slice(0, 2);
    const lead = r.band === "High" ? "Refer to a credit manager. If approved, add to early-warning monitoring from the first EMI."
      : r.band === "Medium" ? "Approve with conditions and closer monitoring in the first six months." : "Standard approval and normal monitoring.";
    const steps = r.band === "Low" ? [] : drivers.map((d) => ACTIONS[d.key]).filter(Boolean);
    $("#predict-out").innerHTML = `
      <p class="tag tag-personal-demo">Personal project — synthetic data</p>
      <div class="pd-top">
        <div><p class="label">Probability of default</p><div class="pd-big">${(r.pd * 100).toFixed(r.pd < 0.1 ? 1 : 0)}<small>%</small></div></div>
        <div class="pd-level"><p class="label">Risk band</p>${html.pill(r.band.toUpperCase(), kind)}</div>
      </div>
      <div class="meter-wrap" aria-hidden="true">
        <div class="meter"><i style="width:30%;background:var(--good)"></i><i style="width:30%;background:var(--warn)"></i><i style="flex:1;background:var(--crit)"></i></div>
        <div class="meter-marker"><b style="left:${meterPos(r.pd).toFixed(1)}%"></b></div>
        <div class="meter-scale"><span style="left:0">0%</span><span style="left:30%">${(BAND.low * 100).toFixed(0)}%</span><span style="left:60%">${(BAND.high * 100).toFixed(0)}%</span><span style="right:0">100%</span></div>
      </div>
      <div class="factors">
        <p class="label">Key risk drivers <span class="label-note">log-odds contribution vs an average applicant</span></p>
        ${r.contribs.slice(0, 5).map((c) => {
          const w = (Math.abs(c.value) / maxAbs) * 50, pos = c.value >= 0;
          return `<div class="factor"><span>${esc(c.label)} <span class="tnum muted">${esc(c.shown)}</span></span>
            <span class="factor-bar"><i style="${pos ? "left:50%" : `left:${50 - w}%`};width:${w}%;background:var(${pos ? "--c4" : "--c3"})"></i></span>
            <span class="factor-val">${pos ? "+" : "−"}${Math.abs(c.value).toFixed(2)}</span></div>`;
        }).join("")}
        <div class="legend"><span><i style="background:var(--c4)"></i>Raises risk</span><span><i style="background:var(--c3)"></i>Lowers risk</span><span>New EMI ₹${fmt.int(r.emi)} · FOIR ${r.foir.toFixed(2)}</span></div>
      </div>
      <div class="action-box"><p class="label">Recommended action</p><p><strong>${esc(lead)}</strong></p>${steps.map((s) => `<p>${esc(s)}</p>`).join("")}</div>`;
  }
  function initLab() {
    const host = $("#lab-feature");
    const p = byId["ml-lab"];
    if (!host || !p) return;
    host.innerHTML = `
      <div class="lab-intro">
        <div class="badges"><span class="badge type-personal">Personal project — synthetic data</span>${p.domains.map((d) => `<span class="badge">${esc(d)}</span>`).join("")}</div>
        <h3 class="lab-title">${esc(p.title)}</h3>
        <p>${esc(p.problem)}</p>
        <div class="lab-flow">${((p.workflow && p.workflow.steps) || []).map((s, i) => `${i ? '<span class="arrow" aria-hidden="true">→</span>' : ""}<span class="step">${esc(s.t)}</span>`).join("")}</div>
        <div class="hero-actions"><button class="btn btn-primary" type="button" data-open-case="ml-lab">View case study →</button><button class="btn btn-ghost" type="button" data-shots="ml-lab">Screenshots</button><button class="btn btn-text" type="button" data-open-case="ml-lab" data-view="interview">Interview view</button></div>
      </div>
      <div class="predictor">
        <form class="predict-form" id="predict-form" novalidate>
          <div class="predict-head"><h4>Customer input</h4><p>The example is a stressed borrower. Change any field and press the button.</p></div>
          <div class="field-grid">${FIELDS.map(([k, l, mn, mx, st, u]) => `<label class="field"><span>${esc(l)}</span><input id="f-${k}" name="${k}" type="number" min="${mn}" max="${mx}" step="${st}" value="${EXAMPLES.stressed[k]}" required><small>${esc(u)}</small></label>`).join("")}</div>
          <div class="predict-actions"><button class="btn btn-primary" type="submit">Predict default risk</button><button class="btn btn-text" type="button" id="predict-reset">Load low-risk example</button></div>
          <p class="form-error" id="predict-error" role="alert" hidden></p>
        </form>
        <output class="predict-out" id="predict-out" for="predict-form" aria-live="polite"></output>
      </div>
      <p class="fine">Scoring runs in your browser with a logistic regression trained on ${S.dataset.rows.toLocaleString("en-IN")} synthetic loans by <code>ml/build_synthetic_model.py</code>. FOIR = (new EMI at 16% p.a. + existing EMIs) ÷ income. Driver contributions are exact SHAP values for a linear model, in log-odds. This is a synthetic portfolio demonstration and does not represent actual company or customer data.</p>`;
    const form = $("#predict-form");
    const read = () => {
      const out = {}; let bad = null;
      FIELDS.forEach(([k, l, mn, mx]) => {
        const el = $("#f-" + k), v = parseFloat(el.value), ok = Number.isFinite(v) && v >= mn && v <= mx;
        el.setAttribute("aria-invalid", String(!ok));
        if (!ok && !bad) bad = `${l} must be between ${mn.toLocaleString("en-IN")} and ${mx.toLocaleString("en-IN")}.`;
        out[k] = v;
      });
      return { out, bad };
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { out, bad } = read(), err = $("#predict-error");
      if (bad) { err.textContent = bad; err.hidden = false; return; }
      err.hidden = true; renderPrediction(out);
    });
    let lowNext = true;
    $("#predict-reset").addEventListener("click", (e) => {
      const ex = lowNext ? EXAMPLES.low : EXAMPLES.stressed;
      FIELDS.forEach(([k]) => { $("#f-" + k).value = ex[k]; $("#f-" + k).setAttribute("aria-invalid", "false"); });
      renderPrediction(ex);
      e.currentTarget.textContent = lowNext ? "Load stressed example" : "Load low-risk example";
      lowNext = !lowNext;
    });
    renderPrediction(EXAMPLES.stressed);
  }

  /* ------------------------------------------------------------------
     Experience timeline, automation, freelance
     ------------------------------------------------------------------ */
  function renderTimeline() {
    $("#timeline").innerHTML = (CFG.timelineOrder || []).map((k) => {
      const c = CFG.companies[k]; if (!c) return "";
      const list = PROJECTS.filter((p) => p.company === k);
      return `<li>
        <div class="tl-when">${esc(c.years || "")}</div>
        <div class="tl-main"><div class="tl-co">${esc(c.name)}</div>${c.role ? `<div class="tl-role">${esc(c.role)}</div>` : ""}<div class="tl-focus">${esc(c.focus || "")}</div><p class="tl-ctx">${esc(c.context || "")}</p></div>
        <div class="tl-rel">${list.length ? `<span class="label">Case studies</span>${list.map((p) => `<button type="button" data-open-case="${p.id}">${num(p)} · ${esc(p.title)}</button>`).join("")}` : ""}</div>
      </li>`;
    }).join("");
  }
  function renderAutomation() {
    $("#auto-stats").innerHTML = (CFG.automation || []).map((a) => `<div class="auto-stat"><span class="auto-n">${esc(a.n)}</span><span class="auto-t">${esc(a.t)}</span><p>${esc(a.d)}</p></div>`).join("");
    $("#auto-cats").innerHTML = (CFG.automationCategories || []).map((c) => `<li>${esc(c)}</li>`).join("");
    const set = ["dm-mail", "dm-scripts"].filter((id) => VIS[id]);
    set.forEach((id) => $("#auto-visuals").appendChild(frame(id, { set })));
  }
  function renderFreelance() {
    const p = byId["dev-school"], host = $("#freelance-body");
    if (!p || !host) return;
    const mods = p.modules || [];
    host.innerHTML = `
      <div class="fl-intro">
        <div class="badges"><span class="badge type-freelance">Freelance project</span>${p.domains.map((d) => `<span class="badge">${esc(d)}</span>`).join("")}</div>
        <h3 class="fl-title">${esc(p.title)}</h3>
        <p>${esc(p.summary.problem)}</p><p>${esc(p.summary.solution)}</p>
        <div class="hero-actions"><button class="btn btn-primary" type="button" data-open-case="dev-school">View case study →</button><button class="btn btn-ghost" type="button" data-shots="dev-school">Screenshots</button><button class="btn btn-text" type="button" data-open-case="dev-school" data-view="interview">Interview view</button></div>
      </div>
      <ul class="modules">${mods.map((m) => `<li><div class="mod-h"><strong>${esc(m.name)}</strong>${html.pill(m.status, m.status === "Implemented" ? "good" : "warn")}</div>${m.d ? `<p>${esc(m.d)}</p>` : ""}</li>`).join("")}</ul>`;
  }

  /* ------------------------------------------------------------------
     Code highlighting (SQL + Python)
     ------------------------------------------------------------------ */
  const SQL_KW = new Set("SELECT FROM WHERE AND OR NOT IN IS NULL JOIN LEFT RIGHT INNER OUTER ON AS GROUP BY ORDER HAVING WITH CASE WHEN THEN ELSE END BETWEEN DISTINCT COUNT SUM MAX MIN AVG NVL ROUND TRUNC ADD_MONTHS NULLIF LAG LEAD OVER PARTITION CREATE TABLE EXISTS DATE LIKE GREATEST LEAST UNION ALL DESC ASC MONTHS_BETWEEN REGEXP_REPLACE REGEXP_LIKE REGEXP_SUBSTR SUBSTR UPPER TRIM SOUNDEX INSERT INTO VALUES UPDATE SET DELETE MERGE USING MATCHED SYSDATE ROW_NUMBER RANK DENSE_RANK COALESCE DECODE TO_CHAR TO_DATE EXTRACT INTERVAL VIEW INDEX PRIMARY KEY REFERENCES".split(" "));
  const PY_KW = new Set("import from as def return for in if else elif not and or is None True False with lambda class try except raise while yield assert pass continue break print async await".split(" "));
  function highlight(code, lang) {
    const re = lang === "sql"
      ? /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g
      : /(#[^\n]*)|((?:\b[rfb]{1,2})?(?:"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'))|(\b\d[\d_]*(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += `<span class="cm">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="st">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="nu">${esc(m[3])}</span>`;
      else { const w = m[4]; out += (lang === "sql" ? SQL_KW.has(w) : PY_KW.has(w)) ? `<span class="kw">${esc(w)}</span>` : esc(w); }
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  const codeBlock = (lang, code, label) => `<div><div class="code-head"><span>${esc(label || (lang === "sql" ? "SQL · representative, synthetic schema" : "Python · representative"))}</span><button class="copy-btn" type="button" data-copy-code>Copy</button></div><pre class="code" tabindex="0"><code>${highlight(code, lang)}</code></pre></div>`;

  /* ------------------------------------------------------------------
     Case study (20 sections) and Interview View
     ------------------------------------------------------------------ */
  const SECTIONS = [
    ["overview", "Overview"], ["problem", "Business problem"], ["objective", "Objective"], ["role", "My role"], ["data", "Data"],
    ["technology", "Technology"], ["workflow", "Business workflow"], ["architecture", "Technical architecture"], ["model", "Data model"],
    ["sql", "SQL / data processing"], ["python", "Python / analytics"], ["logic", "ML / business rules"], ["dashboard", "Dashboard / output"],
    ["insights", "Key insights"], ["impact", "Business impact"], ["challenges", "Challenges"], ["learnings", "What I learned"],
    ["screenshots", "Screenshots"], ["interview", "Interview view"], ["future", "Future improvements"]];
  const list = (items) => (items && items.length ? `<ul class="cs-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "");
  const na = (t) => `<p class="na">${esc(t || "Not applicable to this project.")}</p>`;
  const qaHTML = (qs) => `<div class="qa-tools"><button class="btn btn-ghost btn-sm" type="button" data-qa="open">Expand all answers</button><button class="btn btn-text btn-sm" type="button" data-qa="close">Collapse all</button></div>
    <div class="qa">${qs.map((q) => `<details><summary>${esc(q.q)}</summary><div class="ans"><p class="label">Strong answer</p>${Array.isArray(q.a) ? `<ul>${q.a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(q.a)}</p>`}</div></details>`).join("")}</div>`;

  function caseHead(p) {
    const c = company(p);
    return `<header class="cs-head">
      <div class="cs-tags"><span class="tag ${p.kind === "personal" ? "tag-personal" : p.kind === "freelance" ? "tag-freelance" : "tag-pro"}">${p.kind === "personal" ? "Personal project — synthetic data" : p.kind === "freelance" ? "Freelance project" : "Professional · " + esc(c.name)}</span>${p.domains.map((d) => `<span class="badge">${esc(d)}</span>`).join("")}<span class="card-num">${num(p)} / ${String(PROJECTS.length).padStart(2, "0")}</span></div>
      <h1 class="cs-title" id="case-title">${esc(p.title)}</h1>
      <p class="cs-domain">${esc(p.domain)}</p>
    </header>`;
  }

  function sectionBody(p, key) {
    switch (key) {
      case "overview": {
        const s = p.summary;
        return `<div class="cs-summary">
            <div><p class="label">Business problem</p><p>${esc(s.problem)}</p></div>
            <div><p class="label">Solution</p><p>${esc(s.solution)}</p></div>
            <div><p class="label">My contribution</p><p>${esc(s.contribution)}</p></div>
            <div><p class="label">Technology</p><ul class="chip-list">${p.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
            <div><p class="label">Outcome</p><p>${esc(s.outcome)}</p></div>
          </div>
          <div class="cs-cols"><div class="callout"><h4>Who used it</h4><p>${esc(p.users || "—")}</p></div><div class="callout"><h4>Business process supported</h4><p>${esc(p.process || "—")}</p></div></div>
          ${p.modules && p.modules.length ? `<p class="cs-sub">${esc(p.modulesTitle || "Application modules")}</p><ul class="modules">${p.modules.map((m) => `<li><div class="mod-h"><strong>${esc(m.name)}</strong>${m.status ? html.pill(m.status, m.status === "Implemented" ? "good" : "warn") : ""}</div>${m.d ? `<p>${esc(m.d)}</p>` : ""}</li>`).join("")}</ul>` : ""}
          ${p.overviewNote ? `<p class="note">${esc(p.overviewNote)}</p>` : ""}`;
      }
      case "problem":
        return `<div class="prose">${(p.problemText || []).map((t) => `<p>${esc(t)}</p>`).join("")}</div>${p.problemPoints ? `<p class="cs-sub">Questions the work answers</p>${list(p.problemPoints)}` : ""}`;
      case "objective":
        return `<div class="callout callout-lg"><p>${esc(p.objective)}</p></div>${list(p.objectives)}`;
      case "role":
        return list(p.role);
      case "data": {
        const d = p.data || {};
        return `${d.text ? `<p>${esc(d.text)}</p>` : ""}${d.sources ? html.table([{ k: "name", l: "Source" }, { k: "grain", l: "Grain" }, { k: "fields", l: "Important fields", cls: "wrap" }], d.sources) : ""}
          ${d.processing ? `<p class="cs-sub">How it was processed</p>${list(d.processing)}` : ""}${d.validation ? `<p class="cs-sub">Data validation</p>${list(d.validation)}` : ""}`;
      }
      case "technology":
        return p.techUse ? html.table([{ k: "t", l: "Technology" }, { k: "use", l: "Used for", cls: "wrap" }], p.techUse) : `<ul class="chip-list">${p.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
      case "workflow":
        return p.workflow ? `${p.workflow.text ? `<p>${esc(p.workflow.text)}</p>` : ""}${html.flowH(p.workflow.steps.map((s) => s.t))}<div class="wf-detail">${html.flowV(p.workflow.steps)}</div>` : na();
      case "architecture":
        return p.architecture ? `${p.architecture.text ? `<p>${esc(p.architecture.text)}</p>` : ""}${lanesHTML(p.architecture)}` : na();
      case "model":
        return p.model ? `${p.model.text ? `<p>${esc(p.model.text)}</p>` : ""}${erdHTML(p.model)}` : na();
      case "sql":
      case "python": {
        const s = p[key];
        if (!s || s.na) return na(s && s.na);
        return `${s.title ? `<h4>${esc(s.title)}</h4>` : ""}${s.text ? `<p>${esc(s.text)}</p>` : ""}${s.code ? codeBlock(s.lang || key, s.code, s.label) : ""}${list(s.points)}`;
      }
      case "logic": {
        const s = p.logic;
        if (!s || s.na) return na(s && s.na);
        return `${s.heading ? `<h4>${esc(s.heading)}</h4>` : ""}${s.text ? `<p>${esc(s.text)}</p>` : ""}${list(s.points)}
          ${s.rules ? `${s.rulesNote ? `<p class="note">${esc(s.rulesNote)}</p>` : ""}${html.table([{ k: "rule", l: "Rule" }, { k: "condition", l: "Condition", cls: "wrap" }, { k: "outcome", l: "Outcome" }], s.rules)}` : ""}`;
      }
      case "dashboard": {
        const s = p.dashboard || {};
        return `${s.text ? `<p>${esc(s.text)}</p>` : ""}${s.visual ? `<div data-frame="${esc(s.visual)}" data-set="${esc(gallerySet(p).join(","))}"></div>` : ""}${s.outputs ? `<p class="cs-sub">Outputs</p>${list(s.outputs)}` : ""}`;
      }
      case "insights": {
        const s = p.insights || {};
        return `<p class="note">${esc(s.note || "Patterns illustrated with synthetic data. They describe what this kind of analysis surfaces; no company results are shown.")}</p>${list(s.items)}`;
      }
      case "impact": {
        const s = p.impact || {};
        const col = (t, items, cls) => `<div class="ba-col ${cls}"><p class="label">${t}</p>${list(items)}</div>`;
        return `<div class="ba3">${col("Before", s.before, "b")}<div class="ba3-arrow" aria-hidden="true">→</div>${col("Solution", s.solution, "s")}<div class="ba3-arrow" aria-hidden="true">→</div>${col("After", s.after, "a")}</div>
          ${s.items ? `<p class="cs-sub">Business impact</p>${list(s.items)}` : ""}${s.note ? `<div class="callout"><p>${esc(s.note)}</p></div>` : ""}`;
      }
      case "challenges": return list(p.challenges) || na();
      case "learnings": return list(p.learnings) || na();
      case "screenshots": {
        const set = gallerySet(p);
        const kinds = set.map(galleryKind);
        const tabs = [["all", "All"], ["screen", "Screenshots"], ["architecture", "Architecture"], ["workflow", "Workflow"], ["dashboard", "Dashboard"], ["model", "Data model"]]
          .filter(([k]) => k === "all" || kinds.includes(k));
        return `<div class="gal-tabs" role="group" aria-label="Filter screenshots">${tabs.map(([k, t], i) => `<button type="button" class="gal-tab" data-gtab="${k}" aria-pressed="${i === 0}">${t} <span class="gal-n">${k === "all" ? set.length : kinds.filter((x) => x === k).length}</span></button>`).join("")}</div>
          <div class="gallery">${set.map((id, i) => `<button class="shot" type="button" data-kind="${kinds[i]}" data-lightbox="${id}" data-set="${set.join(",")}"><div class="shot-img" data-shot="${id}"></div><div class="shot-cap"><strong>${esc(VIS[id].title)}</strong><span>${VIS[id].diagram ? "Diagram · click to enlarge" : "Synthetic · click to enlarge"}</span></div></button>`).join("")}</div>`;
      }
      case "interview":
        return `<div class="pitch pitch-sm"><p class="label">30-second explanation</p><blockquote>${esc(p.interview.s30)}</blockquote></div><div class="hero-actions"><button class="btn btn-primary" type="button" data-switch-view="interview">Open Interview View</button></div>`;
      case "future":
        return p.future && p.future.length ? `<ul class="future">${p.future.map((f) => `<li><span class="pill pill-neutral">Future enhancement</span>${esc(f)}</li>`).join("")}</ul>` : na();
      default: return "";
    }
  }

  function renderFull(p) {
    return `${caseHead(p)}
      <div class="cs-layout">
        <nav class="cs-toc" aria-label="Case study sections"><p class="label">Explore</p>${SECTIONS.map(([k, t], i) => `<a href="#sec-${k}" data-sec="${k}"><b>${String(i + 1).padStart(2, "0")}</b>${esc(t)}</a>`).join("")}</nav>
        <div class="cs-sections">${SECTIONS.map(([k, t], i) => `<section class="cs-sec" id="sec-${k}" aria-labelledby="sec-${k}-h"><div class="cs-sec-h"><b>${String(i + 1).padStart(2, "0")}</b><h2 id="sec-${k}-h">${esc(t)}</h2></div>${sectionBody(p, k)}</section>`).join("")}
          ${caseFooter(p)}</div>
      </div>`;
  }

  function renderInterview(p) {
    const iv = p.interview;
    const wc = (t) => t.split(/\s+/).filter(Boolean).length;
    const archSteps = p.workflow ? p.workflow.steps.map((s) => s.t) : [];
    return `${caseHead(p)}
      <div class="iv">
        <div class="iv-pitches">
          <div class="pitch"><div class="pitch-head"><p class="label">30-second explanation · ${wc(iv.s30)} words</p><div class="hero-actions"><span class="timer" data-timer-out="30">30 s</span><button class="btn btn-ghost btn-sm" type="button" data-timer="30">Practise</button><button class="btn btn-text btn-sm" type="button" data-copy="${esc(iv.s30)}">Copy</button></div></div><blockquote>${esc(iv.s30)}</blockquote></div>
          <div class="pitch"><div class="pitch-head"><p class="label">90-second explanation · ${wc(iv.s90)} words</p><div class="hero-actions"><span class="timer" data-timer-out="90">90 s</span><button class="btn btn-ghost btn-sm" type="button" data-timer="90">Practise</button><button class="btn btn-text btn-sm" type="button" data-copy="${esc(iv.s90)}">Copy</button></div></div><blockquote class="long">${esc(iv.s90)}</blockquote></div>
        </div>
        <div class="iv-grid">
          <div><p class="label">My role</p><ul>${iv.role.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
          <div><p class="label">Technology</p><ul class="chip-list">${iv.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>${archSteps.length ? `<p class="label" style="margin-top:1rem">Flow</p>${html.flowH(archSteps)}` : ""}</div>
          <div><p class="label">Business impact</p><ul>${iv.impact.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
          <div><p class="label">Key challenges</p><ul>${iv.challenges.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
        </div>
        <div class="iv-qa"><div class="cs-sec-h"><b>Q</b><h2>Technical questions</h2></div>${qaHTML(iv.questions)}</div>
        <div class="hero-actions"><button class="btn btn-primary" type="button" data-switch-view="full">Open the full case study</button><button class="btn btn-ghost" type="button" data-shots="${p.id}">Screenshots</button></div>
        ${caseFooter(p)}
      </div>`;
  }

  function caseFooter(p) {
    const prev = PROJECTS[(p.index - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(p.index + 1) % PROJECTS.length];
    return `<div class="cs-pn"><button class="btn btn-text" type="button" data-open-case="${prev.id}">← ${num(prev)} ${esc(prev.title)}</button><button class="btn btn-text" type="button" data-open-case="${next.id}">${num(next)} ${esc(next.title)} →</button></div>`;
  }

  const Case = {
    el: $("#case"), body: $("#case-body"), scroll: $("#case-scroll"), current: null, view: "full", opener: null, spy: null, timer: null,
    open(id, view, opener) {
      const p = byId[id]; if (!p) return;
      if (!this.current) this.opener = opener || document.activeElement;
      this.current = p;
      this.view = view || (document.body.classList.contains("interview-mode") ? "interview" : "full");
      this.render();
      this.el.hidden = false;
      document.body.classList.add("no-scroll");
      $("#case-index").textContent = `${num(p)} / ${String(PROJECTS.length).padStart(2, "0")}`;
      try { history.replaceState(null, "", "#" + (this.view === "interview" ? "iv-" : "case-") + id); } catch (e) { /* ignore */ }
      requestAnimationFrame(() => $(".case-close", this.el).focus({ preventScroll: true }));
    },
    render() {
      const p = this.current;
      clearInterval(this.timer);
      $$(".seg-btn", this.el).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === this.view)));
      this.body.innerHTML = this.view === "interview" ? renderInterview(p) : renderFull(p);
      this.scroll.scrollTop = 0;
      $$("[data-frame]", this.body).forEach((s) => s.replaceWith(frame(s.dataset.frame, { set: (s.dataset.set || "").split(",").filter(Boolean) })));
      $$("[data-shot]", this.body).forEach((box) => renderShot(box, box.dataset.shot, 960));
      this.setupSpy();
    },
    setView(v) {
      if (!this.current || v === this.view) return;
      this.view = v; this.render();
      try { history.replaceState(null, "", "#" + (v === "interview" ? "iv-" : "case-") + this.current.id); } catch (e) { /* ignore */ }
    },
    close() {
      if (this.el.hidden) return;
      clearInterval(this.timer);
      if (this.spy) this.spy.disconnect();
      this.el.hidden = true; this.current = null;
      document.body.classList.remove("no-scroll");
      try { history.replaceState(null, "", "#projects"); } catch (e) { /* ignore */ }
      if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true });
    },
    step(d) { if (this.current) this.open(PROJECTS[(this.current.index + d + PROJECTS.length) % PROJECTS.length].id, this.view); },
    setupSpy() {
      if (this.spy) this.spy.disconnect();
      const links = $$(".cs-toc a", this.body);
      if (!links.length || typeof IntersectionObserver === "undefined") return;
      this.spy = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.sec === e.target.id.replace("sec-", "")));
      }), { root: this.scroll, rootMargin: "-15% 0px -75% 0px" });
      $$(".cs-sec", this.body).forEach((s) => this.spy.observe(s));
    },
    startTimer(secs, btn) {
      clearInterval(this.timer);
      $$("[data-timer-out]", this.body).forEach((o) => { o.textContent = o.dataset.timerOut + " s"; o.classList.remove("running"); });
      let t = secs;
      const out = $(`[data-timer-out="${secs}"]`, this.body);
      out.classList.add("running");
      btn.textContent = "Restart";
      this.timer = setInterval(() => { t -= 1; out.textContent = t > 0 ? `${t} s` : "Time"; if (t <= 0) { clearInterval(this.timer); out.classList.remove("running"); } }, 1000);
    },
  };

  /* ------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------ */
  const LB = {
    el: $("#lightbox"), set: [], i: 0, opener: null,
    open(id, set, opener) {
      this.set = set && set.length ? set.filter((x) => VIS[x]) : [id];
      this.i = Math.max(0, this.set.indexOf(id));
      this.opener = opener; this.el.hidden = false; this.show(); $("#lb-close").focus();
    },
    show() {
      const id = this.set[this.i], v = VIS[id];
      $("#lb-tag").textContent = v.diagram ? "Diagram" : DEMO_LABEL;
      $("#lb-tag").className = "tag " + (v.diagram ? "tag-diagram" : "tag-synth");
      $("#lb-title").textContent = v.title;
      $("#lb-caption").textContent = [v.sub, v.caption].filter(Boolean).join(" — ");
      $("#lb-count").textContent = this.set.length > 1 ? `${this.i + 1} / ${this.set.length}` : "";
      $("#lb-prev").disabled = $("#lb-next").disabled = this.set.length < 2;
      const stage = $("#lb-stage");
      stage.innerHTML = '<div class="viz-host"></div>';
      requestAnimationFrame(() => { try { v.render($(".viz-host", stage), { thumb: false }); } catch (e) { console.error(id, e); } });
    },
    step(d) { this.i = (this.i + d + this.set.length) % this.set.length; this.show(); },
    close() { if (this.el.hidden) return; this.el.hidden = true; $("#lb-stage").innerHTML = ""; if (this.opener && this.opener.focus) this.opener.focus(); },
  };

  /* ------------------------------------------------------------------
     Interview mode, copy, nav, events
     ------------------------------------------------------------------ */
  function setInterviewMode(on) {
    document.body.classList.toggle("interview-mode", on);
    $$("[data-iv-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(on)));
    store.set("pf-interview", on ? "1" : "0");
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 1800);
  }
  function selectFallback(el) {
    if (!el) return;
    const range = document.createRange(); range.selectNodeContents(el);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    toast("Selected — press Ctrl/⌘ + C to copy");
  }
  function copyText(text, srcEl) {
    try { navigator.clipboard.writeText(text).then(() => toast("Copied"), () => selectFallback(srcEl)); } catch (e) { selectFallback(srcEl); }
  }

  function wireEvents() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("button, a");
      if (!t) return;
      if (t.dataset.f) { F[t.dataset.f] = F[t.dataset.f] === t.dataset.v ? "" : t.dataset.v; return applyFilters(); }
      if (t.id === "filter-clear" || t.hasAttribute("data-clear-filters")) { Object.assign(F, { q: "", domain: "", tech: "", type: "" }); $("#project-search").value = ""; return applyFilters(); }
      if (t.dataset.openCase) { e.preventDefault(); return Case.open(t.dataset.openCase, t.dataset.view, t); }
      if (t.dataset.shots) { const set = gallerySet(byId[t.dataset.shots]); return set.length && LB.open(set[0], set, t); }
      if (t.matches("[data-close-case]")) return Case.close();
      if (t.matches(".seg-btn")) return Case.setView(t.dataset.view);
      if (t.dataset.switchView) return Case.setView(t.dataset.switchView);
      if (t.dataset.lightbox) return LB.open(t.dataset.lightbox, (t.dataset.set || "").split(",").filter(Boolean), t);
      if (t.dataset.ivToggle !== undefined) return setInterviewMode(!document.body.classList.contains("interview-mode"));
      if (t.dataset.gtab) {
        const sec = t.closest(".cs-sec");
        $$(".gal-tab", sec).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
        $$(".shot", sec).forEach((s) => { s.hidden = t.dataset.gtab !== "all" && s.dataset.kind !== t.dataset.gtab; });
        return;
      }
      if (t.dataset.qa) return $$(".qa details", t.closest(".cs-sec, .iv-qa") || document).forEach((d) => { d.open = t.dataset.qa === "open"; });
      if (t.dataset.timer) return Case.startTimer(+t.dataset.timer, t);
      if (t.hasAttribute("data-copy-code")) { const pre = t.closest("div").nextElementSibling; return copyText(pre.textContent, pre); }
      if (t.dataset.copy) return copyText(t.dataset.copy, t.closest(".pitch") ? $("blockquote", t.closest(".pitch")) : t.previousElementSibling || t);
      if (t.closest(".cs-toc") && t.hash) {
        e.preventDefault();
        const target = Case.body.querySelector(t.hash);
        if (target) target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        return;
      }
      if (t.closest("#site-nav") && t.hash) { $("#site-nav").classList.remove("open"); $("#nav-toggle").setAttribute("aria-expanded", "false"); }
    });
    $("#project-search").addEventListener("input", (e) => { F.q = e.target.value.trim(); applyFilters(); });
    $("#case-prev").addEventListener("click", () => Case.step(-1));
    $("#case-next").addEventListener("click", () => Case.step(1));
    $("#lb-prev").addEventListener("click", () => LB.step(-1));
    $("#lb-next").addEventListener("click", () => LB.step(1));
    $("#lb-close").addEventListener("click", () => LB.close());
    LB.el.addEventListener("click", (e) => { if (e.target === LB.el) LB.close(); });
    $("#nav-toggle").addEventListener("click", (e) => { const open = $("#site-nav").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", String(open)); });

    document.addEventListener("keydown", (e) => {
      const typing = /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === "Escape") { if (!LB.el.hidden) return LB.close(); if (!Case.el.hidden) return Case.close(); }
      if (!LB.el.hidden && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return LB.step(e.key === "ArrowLeft" ? -1 : 1);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "i" || e.key === "I") {
        if (!Case.el.hidden) Case.setView(Case.view === "interview" ? "full" : "interview");
        else setInterviewMode(!document.body.classList.contains("interview-mode"));
      }
      if (!Case.el.hidden && LB.el.hidden && (e.key === "[" || e.key === "]")) Case.step(e.key === "[" ? -1 : 1);
    });
    document.addEventListener("focusin", (e) => {
      const dlg = !LB.el.hidden ? LB.el : !Case.el.hidden ? Case.el : null;
      if (dlg && !dlg.contains(e.target)) { const f = dlg.querySelector("button, a[href], [tabindex]"); if (f) f.focus(); }
    });
    if (typeof IntersectionObserver !== "undefined") {
      const links = $$("#site-nav a");
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.setAttribute("aria-current", String(a.hash === "#" + en.target.id)));
      }), { rootMargin: "-40% 0px -55% 0px" });
      $$("main > section[id]").forEach((s) => io.observe(s));
    }
  }
  function routeFromHash() {
    const m = (location.hash || "").slice(1).match(/^(case|iv)-(.+)$/);
    if (m && byId[m[2]]) Case.open(m[2], m[1] === "iv" ? "interview" : "full");
  }

  /* ------------------------------------------------------------------ */
  [applyConfig, renderSkills, renderFilters, renderProjects, initLab, renderTimeline, renderAutomation, renderFreelance].forEach((fn) => {
    try { fn(); } catch (e) { console.error(fn.name, e); }
  });
  wireEvents();
  applyFilters();
  setInterviewMode(store.get("pf-interview") === "1");
  routeFromHash();
  window.addEventListener("hashchange", routeFromHash);
})();
