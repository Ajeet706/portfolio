/* =====================================================================
   charts.js — tiny dependency-free SVG chart kit.
   Every chart measures its container, draws at real pixel size (so text
   stays crisp), re-draws on resize, and ships a hover tooltip.
   Colors come from CSS tokens (--c1..--c4, --good/--warn/--crit) so both
   themes work without re-rendering.
   ===================================================================== */
(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";
  const COLORS = { c1: "var(--c1)", c2: "var(--c2)", c3: "var(--c3)", c4: "var(--c4)", n: "var(--c-neutral)",
    good: "var(--good)", warn: "var(--warn)", crit: "var(--crit)", ink: "var(--ink)" };
  const col = (c) => COLORS[c] || c || COLORS.c1;

  /* ---------- formatting ------------------------------------------- */
  const nfIN = new Intl.NumberFormat("en-IN");
  const fmt = {
    int: (v) => nfIN.format(Math.round(v)),
    pct: (v, d = 1) => (v * 100).toFixed(d) + "%",
    pct0: (v) => (v * 100).toFixed(0) + "%",
    dec: (v, d = 2) => Number(v).toFixed(d),
    inr: (v) => {
      const a = Math.abs(v);
      if (a >= 1e7) return "₹" + (v / 1e7).toFixed(a >= 1e8 ? 0 : 1) + " Cr";
      if (a >= 1e5) return "₹" + (v / 1e5).toFixed(a >= 1e6 ? 0 : 1) + " L";
      if (a >= 1e3) return "₹" + (v / 1e3).toFixed(0) + "k";
      return "₹" + Math.round(v);
    },
    raw: (v) => String(v),
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tipAttr = (html) => ` data-tip="${esc(html)}"`;

  /* ---------- scales & ticks --------------------------------------- */
  function niceStep(span, count) {
    const raw = span / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const e = raw / mag;
    return mag * (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1);
  }
  function ticks(min, max, count = 5) {
    if (max <= min) return [min];
    const step = niceStep(max - min, count);
    const out = [];
    for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + step * 1e-6; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function niceMax(max, count = 4) {
    if (max <= 0) return 1;
    const step = niceStep(max, count);
    return Math.ceil(max / step - 1e-9) * step;
  }
  const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);
  const textW = (s, px = 12) => String(s).length * px * 0.56;

  /* ---------- mounting & resize ------------------------------------ */
  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver((entries) => {
        for (const e of entries) {
          const el = e.target;
          const w = Math.round(e.contentRect.width);
          if (w > 0 && el.__w !== w) { el.__w = w; try { el.__draw && el.__draw(); } catch (err) { console.error(err); } }
        }
      })
    : null;

  function mount(el, draw) {
    el.classList.add("viz");
    el.__draw = draw;
    el.__w = Math.round(el.clientWidth);
    draw();
    if (ro) ro.observe(el);
  }
  function svg(w, h, inner, label) {
    return `<svg xmlns="${SVGNS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label || "Chart")}">${inner}</svg>`;
  }
  const W = (el, min = 220) => Math.max(min, el.clientWidth || el.__w || 480);

  function legendHTML(items) {
    return `<div class="legend">${items.map((i) =>
      `<span><i class="${i.type || ""}" style="background:${col(i.color)}"></i>${esc(i.name)}</span>`).join("")}</div>`;
  }

  /* rounded-end bar paths (4px data end, square baseline) */
  function vBarPath(x, y, w, h, r = 3) {
    if (h <= 0) return "";
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  function hBarPath(x, y, w, h, r = 3) {
    if (w <= 0) return "";
    r = Math.min(r, h / 2, w);
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }
  function hBarPathNeg(x, y, w, h, r = 3) {   // rounded on the left (for negative values)
    if (w <= 0) return "";
    r = Math.min(r, h / 2, w);
    return `M${x + w},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w}Z`;
  }

  /* =================================================================
     barH — horizontal bars. data: [{label, value, color?, tip?}]
     ================================================================= */
  function barH(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 200);
      const f = o.fmt || fmt.raw;
      const rowH = o.rowH || (thumb ? 22 : 26);
      const barT = Math.min(16, rowH - 8);
      const labelW = o.labelW || Math.min(w * 0.42, Math.max(...o.data.map((d) => textW(d.label))) + 10);
      const valW = thumb ? 8 : Math.max(...o.data.map((d) => textW(f(d.value)))) + 12;
      const refLbl = !thumb && o.ref && [].concat(o.ref).some((r) => r.label);
      const top = 4, h = top + o.data.length * rowH + (o.axis ? 22 : 4) + (refLbl ? 16 : 0);
      const max = o.max || niceMax(Math.max(...o.data.map((d) => d.value)));
      const x = lin(0, max, labelW, w - valW);
      let g = "";
      if (o.ref) for (const r of [].concat(o.ref)) {
        const rx = x(r.value);
        g += `<line x1="${rx}" x2="${rx}" y1="0" y2="${top + o.data.length * rowH + 2}" class="xh"/>`;
        if (!thumb && r.label) g += `<text x="${rx + 4}" y="${h - 4}" font-size="11" class="t-muted">${esc(r.label)}</text>`;
      }
      o.data.forEach((d, i) => {
        const y = top + i * rowH + (rowH - barT) / 2;
        const bw = Math.max(0, x(d.value) - labelW);
        const c = col(d.color || o.color);
        g += `<text x="${labelW - 8}" y="${y + barT / 2 + 4}" text-anchor="end" font-size="12">${esc(d.label)}</text>`;
        g += `<path class="mark" d="${hBarPath(labelW, y, bw, barT)}" style="fill:${c}"${tipAttr(`<b>${esc(d.label)}</b>${esc(d.tip || f(d.value))}`)}/>`;
        if (!thumb && o.values !== false) g += `<text x="${labelW + bw + 6}" y="${y + barT / 2 + 4}" font-size="12" class="t-strong">${esc(f(d.value))}</text>`;
      });
      g += `<line x1="${labelW}" x2="${labelW}" y1="0" y2="${top + o.data.length * rowH}" class="axis"/>`;
      el.innerHTML = (o.legend ? legendHTML(o.legend) : "") + svg(w, h, g, o.label);
    });
  }

  /* =================================================================
     bars — vertical (grouped or stacked). series: [{name, values, color}]
     ================================================================= */
  function bars(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 220);
      const h = o.h || (thumb ? 150 : 230);
      const f = o.fmt || fmt.raw;
      const yf = o.yFmt || f;
      const n = o.cats.length, S = o.series.length;
      const totals = o.cats.map((_, i) => o.series.reduce((a, s) => a + (s.values[i] || 0), 0));
      const maxV = o.max || niceMax(o.stacked ? Math.max(...totals) : Math.max(...o.series.flatMap((s) => s.values)));
      const yt = ticks(0, maxV, thumb ? 3 : 4);
      const padL = thumb ? 4 : Math.max(...yt.map((t) => textW(yf(t), 11))) + 10;
      const padB = thumb ? 6 : (o.rotate ? 44 : 24), padT = o.topLabels ? 18 : 8, padR = 6;
      const x0 = padL, x1 = w - padR, y0 = h - padB, y1 = padT;
      const y = lin(0, maxV, y0, y1);
      const band = (x1 - x0) / n;
      const inner = band * (o.gap === undefined ? 0.72 : 1 - o.gap);
      let g = "";
      if (!thumb) yt.forEach((t) => {
        g += `<line x1="${x0}" x2="${x1}" y1="${y(t)}" y2="${y(t)}" class="gridline"/>`;
        g += `<text x="${x0 - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" class="t-muted">${esc(yf(t))}</text>`;
      });
      o.cats.forEach((c, i) => {
        const bx = x0 + i * band + (band - inner) / 2;
        if (o.stacked) {
          let acc = 0;
          const segs = o.series.map((s) => ({ s, v: s.values[i] || 0 })).filter((d) => d.v > 0);
          segs.forEach((d, k) => {
            const yTop = y(acc + d.v), yBot = y(acc);
            const hh = Math.max(0, yBot - yTop - (k > 0 ? 2 : 0));
            const isTop = k === segs.length - 1;
            const path = isTop ? vBarPath(bx, yTop, inner, hh) : `M${bx},${yTop}h${inner}v${hh}h${-inner}Z`;
            g += `<path class="mark" d="${path}" style="fill:${col(d.s.color)}"${tipAttr(`<b>${esc(c)}</b><span class="sw" style="background:${col(d.s.color)}"></span>${esc(d.s.name)}: ${esc(f(d.v))}`)}/>`;
            acc += d.v;
          });
          if (o.topLabels && !thumb) g += `<text x="${bx + inner / 2}" y="${y(totals[i]) - 5}" text-anchor="middle" font-size="11" class="t-strong">${esc(f(totals[i]))}</text>`;
        } else {
          const bw = (inner - (S - 1) * 2) / S;
          o.series.forEach((s, k) => {
            const v = s.values[i] || 0;
            const yy = y(v);
            const bxx = bx + k * (bw + 2);
            const c = col((s.colors && s.colors[i]) || s.color);
            g += `<path class="mark" d="${vBarPath(bxx, yy, bw, y0 - yy)}" style="fill:${c}"${tipAttr(`<b>${esc(o.cats[i])}</b>${S > 1 ? `<span class="sw" style="background:${c}"></span>${esc(s.name)}: ` : ""}${esc(f(v))}${s.tips ? "<br>" + esc(s.tips[i]) : ""}`)}/>`;
            if (o.topLabels && !thumb && S === 1) g += `<text x="${bxx + bw / 2}" y="${yy - 5}" text-anchor="middle" font-size="11" class="t-strong">${esc(f(v))}</text>`;
          });
        }
        if (!thumb) {
          const showEvery = Math.ceil(n / Math.max(1, Math.floor((x1 - x0) / (o.rotate ? 18 : 52))));
          if (i % showEvery === 0) {
            const lx = bx + inner / 2;
            g += o.rotate
              ? `<text transform="translate(${lx + 4},${y0 + 10}) rotate(-40)" text-anchor="end" font-size="11" class="t-muted">${esc(c)}</text>`
              : `<text x="${lx}" y="${y0 + 16}" text-anchor="middle" font-size="11" class="t-muted">${esc(c)}</text>`;
          }
        }
      });
      if (o.ref && !thumb) {
        const ry = y(o.ref.value);
        g += `<line x1="${x0}" x2="${x1}" y1="${ry}" y2="${ry}" class="xh"/><text x="${x1}" y="${ry - 5}" text-anchor="end" font-size="11" class="t-muted">${esc(o.ref.label)}</text>`;
      }
      g += `<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="axis"/>`;
      const leg = !thumb && o.series.length > 1 ? legendHTML(o.series.map((s) => ({ name: s.name, color: s.color }))) : "";
      el.innerHTML = leg + svg(w, h, g, o.label);
    });
  }

  /* =================================================================
     line — numeric or categorical x, multi-series, crosshair tooltip
     series: [{name, values, color, dash?, area?}]
     ================================================================= */
  function line(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 220);
      const h = o.h || (thumb ? 150 : 240);
      const xs = o.x;
      const cat = typeof xs[0] !== "number";
      const xf = o.xFmt || fmt.raw, yf = o.yFmt || fmt.raw;
      const all = o.series.flatMap((s) => s.values).filter((v) => v != null);
      const yMin = o.yMin !== undefined ? o.yMin : 0;
      const yMax = o.yMax !== undefined ? o.yMax : niceMax(Math.max(...all));
      const yt = ticks(yMin, yMax, thumb ? 3 : 4);
      const padL = thumb ? 4 : Math.max(...yt.map((t) => textW(yf(t), 11))) + 10;
      const padR = o.endLabels && !thumb ? Math.max(...o.series.map((s) => textW(s.name, 11))) + 14 : 10;
      const padB = thumb ? 6 : 24 + (o.xLabel ? 14 : 0), padT = 10;
      const x0 = padL, x1 = w - padR, y0 = h - padB, y1 = padT;
      const xMin = cat ? 0 : (o.xMin !== undefined ? o.xMin : Math.min(...xs));
      const xMax = cat ? xs.length - 1 : (o.xMax !== undefined ? o.xMax : Math.max(...xs));
      const X = lin(xMin, xMax, x0, x1), Y = lin(yMin, yMax, y0, y1);
      const xv = (i) => X(cat ? i : xs[i]);
      let g = "";
      if (!thumb) {
        yt.forEach((t) => {
          g += `<line x1="${x0}" x2="${x1}" y1="${Y(t)}" y2="${Y(t)}" class="gridline"/>`;
          g += `<text x="${x0 - 6}" y="${Y(t) + 4}" text-anchor="end" font-size="11" class="t-muted">${esc(yf(t))}</text>`;
        });
        if (cat) {
          const every = Math.ceil(xs.length / Math.max(1, Math.floor((x1 - x0) / 56)));
          xs.forEach((v, i) => { if (i % every === 0) g += `<text x="${xv(i)}" y="${y0 + 16}" text-anchor="middle" font-size="11" class="t-muted">${esc(xf(v))}</text>`; });
        } else {
          ticks(xMin, xMax, Math.max(2, Math.floor((x1 - x0) / 70))).forEach((t) => {
            g += `<text x="${X(t)}" y="${y0 + 16}" text-anchor="middle" font-size="11" class="t-muted">${esc(xf(t))}</text>`;
          });
        }
        if (o.xLabel) g += `<text x="${(x0 + x1) / 2}" y="${h - 2}" text-anchor="middle" font-size="11" class="t-muted">${esc(o.xLabel)}</text>`;
        if (o.yLabel) g += `<text x="${x0 + 4}" y="${y1 + 10}" font-size="11" class="t-muted">${esc(o.yLabel)}</text>`;
      }
      if (o.diag) g += `<line x1="${X(xMin)}" y1="${Y(yMin)}" x2="${X(xMax)}" y2="${Y(yMax)}" stroke="var(--c-neutral)" stroke-width="1.5" stroke-dasharray="4 4"/>`;
      if (o.band) { // shaded vertical gap e.g. KS
        const b = o.band;
        g += `<line x1="${X(b.x)}" x2="${X(b.x)}" y1="${Y(b.y0)}" y2="${Y(b.y1)}" stroke="var(--ink)" stroke-width="1.5"/>`;
        if (!thumb) g += `<text x="${X(b.x) + 6}" y="${(Y(b.y0) + Y(b.y1)) / 2 + 4}" font-size="12" class="t-strong">${esc(b.label)}</text>`;
      }
      o.series.forEach((s) => {
        const pts = s.values.map((v, i) => (v == null ? null : [xv(i), Y(v)])).filter(Boolean);
        const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
        if (s.area) g += `<path d="${d}L${pts[pts.length - 1][0]},${y0}L${pts[0][0]},${y0}Z" style="fill:${col(s.color)};opacity:.12"/>`;
        g += `<path d="${d}" fill="none" style="stroke:${col(s.color)}" stroke-width="${s.width || 2}" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="5 4"' : ""}/>`;
        if (o.markers && !thumb) pts.forEach((p) => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" style="fill:${col(s.color)};stroke:var(--paper-raised)" stroke-width="2"/>`; });
        if (o.endLabels && !thumb) {
          const last = pts[pts.length - 1];
          g += `<text x="${last[0] + 6}" y="${last[1] + 4}" font-size="11" class="t-strong">${esc(s.name)}</text>`;
        }
      });
      (o.annotate || []).forEach((a) => {
        if (thumb) return;
        g += `<circle cx="${X(a.x)}" cy="${Y(a.y)}" r="4" style="fill:var(--ink)"/><text x="${X(a.x) + 7}" y="${Y(a.y) - 7}" font-size="11" class="t-strong">${esc(a.label)}</text>`;
      });
      g += `<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="axis"/>`;
      g += `<line class="xh" x1="0" x2="0" y1="${y1}" y2="${y0}" visibility="hidden"/>`;
      g += `<rect class="hit" x="${x0}" y="${y1}" width="${Math.max(0, x1 - x0)}" height="${Math.max(0, y0 - y1)}"/>`;
      const leg = !thumb && o.legend !== false && o.series.length > 1
        ? legendHTML(o.series.filter((s) => !s.hideLegend).map((s) => ({ name: s.name, color: s.color, type: "line" })).concat(o.diag ? [{ name: o.diagLabel || "Random", type: "dash", color: "n" }] : []))
        : "";
      el.innerHTML = leg + svg(w, h, g, o.label);
      if (thumb) return;
      const sv = el.querySelector("svg"), hit = sv.querySelector(".hit"), xh = sv.querySelector("line.xh[visibility]");
      const n = xs.length;
      const move = (ev) => {
        const r = sv.getBoundingClientRect();
        const px = ev.clientX - r.left;
        let best = 0, bd = Infinity;
        for (let i = 0; i < n; i++) { const dd = Math.abs(xv(i) - px); if (dd < bd) { bd = dd; best = i; } }
        xh.setAttribute("x1", xv(best)); xh.setAttribute("x2", xv(best)); xh.setAttribute("visibility", "visible");
        const rows = o.series.filter((s) => s.values[best] != null && !s.noTip)
          .map((s) => `<span class="sw" style="background:${col(s.color)}"></span>${esc(s.name)}: ${esc(yf(s.values[best]))}`).join("<br>");
        Tip.show(`<b>${esc(o.xTipFmt ? o.xTipFmt(xs[best]) : xf(xs[best]))}</b>${rows}`, ev.clientX, ev.clientY);
      };
      hit.addEventListener("pointermove", move);
      hit.addEventListener("pointerleave", () => { xh.setAttribute("visibility", "hidden"); Tip.hide(); });
    });
  }

  /* =================================================================
     matrix — heatmap / confusion matrix. values[r][c]
     ================================================================= */
  function matrix(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 220);
      const R = o.rows.length, Cn = o.cols.length;
      const f = o.fmt || fmt.raw;
      const padL = thumb ? 4 : Math.max(...o.rows.map((r) => textW(r, 11))) + 12;
      const padT = thumb ? 4 : 22 + (o.colTitle ? 14 : 0);
      const cellW = (w - padL - 4) / Cn;
      const cellH = o.cellH || Math.min(64, Math.max(28, cellW * (o.ratio || 0.55)));
      const h = padT + R * cellH + 4 + (o.rowTitle && !thumb ? 0 : 0);
      const flat = o.values.flat();
      const vmax = o.max || Math.max(...flat), vmin = o.min !== undefined ? o.min : 0;
      let g = "";
      if (!thumb) {
        if (o.colTitle) g += `<text x="${padL + (w - padL) / 2}" y="11" text-anchor="middle" font-size="11" class="t-muted">${esc(o.colTitle)}</text>`;
        o.cols.forEach((c, j) => { g += `<text x="${padL + j * cellW + cellW / 2}" y="${padT - 8}" text-anchor="middle" font-size="11" class="t-muted">${esc(c)}</text>`; });
        o.rows.forEach((r, i) => { g += `<text x="${padL - 8}" y="${padT + i * cellH + cellH / 2 + 4}" text-anchor="end" font-size="11">${esc(r)}</text>`; });
      }
      o.values.forEach((row, i) => row.forEach((v, j) => {
        const t = Math.max(0, Math.min(1, (v - vmin) / (vmax - vmin || 1)));
        const c = (o.cellColor && o.cellColor(i, j, v)) || col(o.color || "c1");
        const op = 0.08 + t * 0.85;
        const x = padL + j * cellW + 1, y = padT + i * cellH + 1;
        const dark = op > 0.55;
        g += `<rect class="mark" x="${x}" y="${y}" width="${cellW - 2}" height="${cellH - 2}" rx="3" style="fill:${c};fill-opacity:${op.toFixed(2)}"${tipAttr(`<b>${esc(o.rows[i])} → ${esc(o.cols[j])}</b>${esc((o.tipFmt || f)(v, i, j))}`)}/>`;
        if (!thumb && o.labels !== false && cellW > 30) g += `<text x="${x + (cellW - 2) / 2}" y="${y + (cellH - 2) / 2 + 4}" text-anchor="middle" font-size="${cellW > 70 ? 13 : 11}" style="fill:${dark ? "var(--paper-raised)" : "var(--ink)"};font-weight:600;pointer-events:none">${esc(f(v, i, j))}</text>`;
      }));
      el.innerHTML = svg(w, h, g, o.label);
    });
  }

  /* =================================================================
     diverge — bars around zero (WOE, contributions)
     data: [{label, value}], pos/neg colors
     ================================================================= */
  function diverge(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 220);
      const f = o.fmt || ((v) => (v > 0 ? "+" : "") + v.toFixed(2));
      const rowH = o.rowH || 26, barT = Math.min(16, rowH - 8);
      const labelW = Math.min(w * 0.36, Math.max(...o.data.map((d) => textW(d.label))) + 10);
      const lim = o.max || niceMax(Math.max(...o.data.map((d) => Math.abs(d.value))), 2);
      const valPad = thumb ? 4 : 44;
      const X = lin(-lim, lim, labelW + valPad, w - valPad);
      const top = o.title ? 18 : 4;
      const h = top + o.data.length * rowH + (thumb ? 2 : 22);
      let g = "";
      if (!thumb) {
        [-lim, 0, lim].forEach((t) => { g += `<text x="${X(t)}" y="${h - 4}" text-anchor="middle" font-size="11" class="t-muted">${esc(t === 0 ? "0" : f(t))}</text>`; });
        if (o.negLabel) g += `<text x="${X(-lim)}" y="11" font-size="11" class="t-muted">${esc(o.negLabel)}</text>`;
        if (o.posLabel) g += `<text x="${X(lim)}" y="11" text-anchor="end" font-size="11" class="t-muted">${esc(o.posLabel)}</text>`;
      }
      o.data.forEach((d, i) => {
        const y = top + i * rowH + (rowH - barT) / 2;
        const x0 = X(0), xv = X(d.value);
        const c = col(d.value >= 0 ? (o.pos || "c3") : (o.neg || "c4"));
        const path = d.value >= 0 ? hBarPath(x0, y, xv - x0, barT) : hBarPathNeg(xv, y, x0 - xv, barT);
        g += `<text x="${labelW - 4}" y="${y + barT / 2 + 4}" text-anchor="end" font-size="12">${esc(d.label)}</text>`;
        g += `<path class="mark" d="${path}" style="fill:${c}"${tipAttr(`<b>${esc(d.label)}</b>${esc(d.tip || f(d.value))}`)}/>`;
        if (!thumb) g += `<text x="${d.value >= 0 ? xv + 5 : xv - 5}" y="${y + barT / 2 + 4}" text-anchor="${d.value >= 0 ? "start" : "end"}" font-size="11" class="t-strong">${esc(f(d.value))}</text>`;
      });
      g += `<line x1="${X(0)}" x2="${X(0)}" y1="${top - 2}" y2="${top + o.data.length * rowH + 2}" class="axis"/>`;
      el.innerHTML = svg(w, h, g, o.label);
    });
  }

  /* =================================================================
     comp — one 100% composition bar with labels underneath
     parts: [{label, value, color}]
     ================================================================= */
  function comp(el, o) {
    mount(el, () => {
      const w = W(el, 200);
      const f = o.fmt || fmt.int;
      const total = o.parts.reduce((a, p) => a + p.value, 0);
      const barH = o.thumb ? 18 : 22;
      let x = 0, g = "";
      const gap = 2, usable = w - gap * (o.parts.length - 1);
      o.parts.forEach((p, i) => {
        const pw = usable * (p.value / total);
        const first = i === 0, last = i === o.parts.length - 1;
        const r = 4;
        const path = `M${x + (first ? r : 0)},0H${x + pw - (last ? r : 0)}${last ? `Q${x + pw},0 ${x + pw},${r}V${barH - r}Q${x + pw},${barH} ${x + pw - r},${barH}` : `V${barH}`}H${x + (first ? r : 0)}${first ? `Q${x},${barH} ${x},${barH - r}V${r}Q${x},0 ${x + r},0` : `V0`}Z`;
        g += `<path class="mark" d="${path}" style="fill:${col(p.color)}"${tipAttr(`<b>${esc(p.label)}</b>${esc(f(p.value))} · ${fmt.pct(p.value / total)}`)}/>`;
        x += pw + gap;
      });
      const legend = o.thumb ? "" : `<div class="legend" style="margin-top:.55rem">${o.parts.map((p) =>
        `<span><i style="background:${col(p.color)}"></i>${esc(p.label)} <b class="tnum">${esc(f(p.value))}</b> <span class="t-muted tnum" style="color:var(--ink-3)">${fmt.pct(p.value / total, 0)}</span></span>`).join("")}</div>`;
      el.innerHTML = svg(w, barH, g, o.label) + legend;
    });
  }

  /* =================================================================
     funnel — stage bars, centred, with conversion from the previous stage
     stages: [{label, value}]
     ================================================================= */
  function funnel(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 220);
      const f = o.fmt || fmt.int;
      const rowH = o.rowH || (thumb ? 24 : 34), barT = rowH - 8;
      const labelW = thumb ? 4 : Math.min(w * 0.3, Math.max(...o.stages.map((s) => textW(s.label))) + 12);
      const convW = thumb ? 4 : 64;
      const span = w - labelW - convW;
      const max = Math.max(...o.stages.map((s) => s.value));
      const h = o.stages.length * rowH + 4;
      let g = "";
      o.stages.forEach((s, i) => {
        const bw = Math.max(2, span * (s.value / max));
        const x = labelW + (span - bw) / 2, y = i * rowH + 4;
        const c = col(s.color || o.color || "c1");
        const conv = i ? s.value / o.stages[i - 1].value : null;
        g += `<rect class="mark" x="${x}" y="${y}" width="${bw}" height="${barT}" rx="3" style="fill:${c}"${tipAttr(`<b>${esc(s.label)}</b>${esc(f(s.value))}${conv !== null ? ` · ${fmt.pct(conv)} of previous stage` : ""}`)}/>`;
        if (!thumb) {
          g += `<text x="${labelW - 8}" y="${y + barT / 2 + 4}" text-anchor="end" font-size="12">${esc(s.label)}</text>`;
          const inside = bw > textW(f(s.value), 12) + 12;
          g += `<text x="${labelW + span / 2}" y="${y + barT / 2 + 4}" text-anchor="middle" font-size="12" style="fill:${inside ? "var(--paper-raised)" : "var(--ink)"};font-weight:600;pointer-events:none">${esc(f(s.value))}</text>`;
          if (conv !== null) g += `<text x="${w - 4}" y="${y + barT / 2 + 4}" text-anchor="end" font-size="11" class="t-muted">${fmt.pct(conv, 0)}</text>`;
        }
      });
      el.innerHTML = svg(w, h, g, o.label || "Funnel");
    });
  }

  /* =================================================================
     donut — composition ring with a centre figure; legend carries labels
     parts: [{label, value, color}]
     ================================================================= */
  function donut(el, o) {
    mount(el, () => {
      const thumb = !!o.thumb;
      const w = W(el, 160);
      const f = o.fmt || fmt.int;
      const size = Math.min(o.size || 180, w);
      const r = size / 2 - 4, ri = r * 0.62, cx = size / 2, cy = size / 2;
      const total = o.parts.reduce((a, p) => a + p.value, 0);
      let a0 = -Math.PI / 2, g = "";
      const gap = o.parts.length > 1 ? 0.02 : 0;
      o.parts.forEach((p) => {
        const a1 = a0 + (p.value / total) * Math.PI * 2;
        const s = a0 + gap / 2, e = Math.max(s + 0.001, a1 - gap / 2);
        const large = e - s > Math.PI ? 1 : 0;
        const pt = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
        g += `<path class="mark" d="M${pt(r, s)}A${r},${r} 0 ${large} 1 ${pt(r, e)}L${pt(ri, e)}A${ri},${ri} 0 ${large} 0 ${pt(ri, s)}Z" style="fill:${col(p.color)}"${tipAttr(`<b>${esc(p.label)}</b>${esc(f(p.value))} · ${fmt.pct(p.value / total)}`)}/>`;
        a0 = a1;
      });
      if (!thumb) {
        g += `<text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="${Math.round(size / 8)}" class="t-strong">${esc(o.center || f(total))}</text>`;
        if (o.centerLabel) g += `<text x="${cx}" y="${cy + size / 8}" text-anchor="middle" font-size="11" class="t-muted">${esc(o.centerLabel)}</text>`;
      }
      const legend = thumb ? "" : `<div class="legend" style="flex-direction:column;gap:.35rem">${o.parts.map((p) =>
        `<span><i style="background:${col(p.color)}"></i>${esc(p.label)} <b class="tnum">${esc(f(p.value))}</b> <span class="tnum" style="color:var(--ink-3)">${fmt.pct(p.value / total, 0)}</span></span>`).join("")}</div>`;
      el.innerHTML = `<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">${svg(size, size, g, o.label || "Composition")}${legend}</div>`;
    });
  }

  /* ---------- HTML helpers ----------------------------------------- */
  const html = {
    kpis: (items) => `<div class="kpis">${items.map((k) =>
      `<div class="kpi"><span class="kpi-l">${esc(k.l)}</span><span class="kpi-v">${esc(k.v)}</span>${k.s ? `<span class="kpi-s ${k.cls || ""}">${esc(k.s)}</span>` : ""}</div>`).join("")}</div>`,
    table: (cols, rows, opt = {}) => `<div class="table-wrap"><table class="dtable"><thead><tr>${cols.map((c) =>
      `<th class="${c.cls || ""}" scope="col">${esc(c.l)}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) =>
      `<tr class="${opt.rowClass ? opt.rowClass(r, i) : ""}">${cols.map((c) =>
        `<td class="${c.cls || ""}">${c.html ? c.html(r[c.k], r) : esc(c.fmt ? c.fmt(r[c.k], r) : r[c.k])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
    pill: (text, kind) => `<span class="pill pill-${kind}">${esc(text)}</span>`,
    flowV: (steps) => `<div class="flow">${steps.map((s, i) => {
      const st = typeof s === "string" ? { t: s } : s;
      return `${i ? '<div class="flow-arrow" aria-hidden="true">↓</div>' : ""}<div class="flow-step${i === steps.length - 1 ? " end" : ""}"><b>${String(i + 1).padStart(2, "0")}</b><span>${esc(st.t)}${st.d ? `<small>${esc(st.d)}</small>` : ""}</span></div>`;
    }).join("")}</div>`,
    flowH: (steps) => `<div class="flow-h">${steps.map((s, i) =>
      `${i ? '<span class="fa" aria-hidden="true">→</span>' : ""}<span class="fh${i === steps.length - 1 ? " end" : ""}">${esc(s)}</span>`).join("")}</div>`,
    legend: legendHTML,
    esc,
  };

  /* ---------- tooltip ---------------------------------------------- */
  const Tip = {
    el: null,
    show(htmlStr, x, y) {
      if (!this.el) this.el = document.getElementById("tip");
      if (!this.el) return;
      this.el.innerHTML = htmlStr;
      this.el.hidden = false;
      const r = this.el.getBoundingClientRect();
      let left = x + 14, top = y + 14;
      if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
      if (top + r.height > window.innerHeight - 8) top = y - r.height - 14;
      this.el.style.left = Math.max(8, left) + "px";
      this.el.style.top = Math.max(8, top) + "px";
    },
    hide() { if (this.el) this.el.hidden = true; },
  };
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) return;
    const v = t.closest(".viz");
    if (v) { v.classList.add("hovering"); t.classList.add("on"); }
  });
  document.addEventListener("pointermove", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (t) Tip.show(t.getAttribute("data-tip"), e.clientX, e.clientY);
  });
  document.addEventListener("pointerout", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) return;
    t.classList.remove("on");
    const v = t.closest(".viz");
    if (v) v.classList.remove("hovering");
    Tip.hide();
  });

  window.Charts = { barH, bars, line, matrix, diverge, comp, funnel, donut, html, fmt, col, Tip, mount, esc };
})();
