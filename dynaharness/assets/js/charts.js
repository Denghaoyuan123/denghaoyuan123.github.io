/* Small SVG chart library for the project page. Thin marks, hairline axes,
   one hover tooltip, a table twin for every chart. */
window.Charts = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { dh: '#0E93A6', dhDark: '#0F6B75', de: '#A7AEB7', de2: '#D2D7DD', rose: '#C9503F', blue: '#3F79C9', amber: '#B8741F', violet: '#7A62B3', ink: '#14202B', ink3: '#7C8794', line: '#E5E9EE' };
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, attrs) { const t = el('text', Object.assign({ x, y }, attrs || {}), parent); t.textContent = s; return t; }
  const fmt1 = v => (v == null ? '–' : (Math.round(v * 10) / 10).toString());
  const fmt2 = v => (v == null ? '–' : (Math.round(v * 100) / 100).toString());

  /* ---------- tooltip ---------- */
  const tipEl = document.createElement('div'); tipEl.className = 'tooltip'; document.body.appendChild(tipEl);
  const tip = {
    show(frag, x, y) { tipEl.textContent = ''; tipEl.appendChild(frag); tipEl.classList.add('show'); this.move(x, y); },
    move(x, y) { const w = tipEl.offsetWidth, h = tipEl.offsetHeight; let L = x + 14, T = y + 14; if (L + w > innerWidth - 8) L = x - w - 14; if (T + h > innerHeight - 8) T = y - h - 14; tipEl.style.left = L + 'px'; tipEl.style.top = T + 'px'; },
    hide() { tipEl.classList.remove('show'); },
  };
  function tipNode(title, rows) {
    const f = document.createDocumentFragment(); const b = document.createElement('b'); b.textContent = title; f.appendChild(b);
    (rows || []).forEach(([k, v]) => { if (v == null || v === '') return; const r = document.createElement('div'); const kk = document.createElement('span'); kk.className = 'k'; kk.textContent = k ? k + ' ' : ''; r.appendChild(kk); r.appendChild(document.createTextNode(String(v))); f.appendChild(r); });
    return f;
  }
  function hover(node, mk) {
    node.classList.add('mark'); node.setAttribute('tabindex', '0');
    node.addEventListener('pointerenter', e => tip.show(mk(), e.clientX, e.clientY));
    node.addEventListener('pointermove', e => tip.move(e.clientX, e.clientY));
    node.addEventListener('pointerleave', () => tip.hide());
    node.addEventListener('focus', () => { const r = node.getBoundingClientRect(); tip.show(mk(), r.left + r.width / 2, r.top + r.height); });
    node.addEventListener('blur', () => tip.hide());
  }

  /* ---------- card scaffold with chart / table toggle ---------- */
  function card(container, title, sub, opts) {
    container = typeof container === 'string' ? document.querySelector(container) : container;
    container.classList.add('chart-card'); container.textContent = '';
    const h = document.createElement('h4'); h.textContent = title; container.appendChild(h);
    if (sub) { const p = document.createElement('p'); p.className = 'sub'; p.textContent = sub; container.appendChild(p); }
    const tools = document.createElement('div'); tools.className = 'tools';
    const bC = document.createElement('button'); bC.textContent = 'Chart'; bC.className = 'active';
    const bT = document.createElement('button'); bT.textContent = 'Table';
    tools.append(bC, bT); container.appendChild(tools);
    const cview = document.createElement('div'); cview.className = 'cview'; container.appendChild(cview);
    const tview = document.createElement('div'); tview.className = 'tview'; container.appendChild(tview);
    bC.addEventListener('click', () => { container.classList.remove('table'); bC.classList.add('active'); bT.classList.remove('active'); });
    bT.addEventListener('click', () => { container.classList.add('table'); bT.classList.add('active'); bC.classList.remove('active'); });
    if (opts && opts.legend) legend(cview, opts.legend);
    return { cview, tview, container };
  }
  function legend(parent, items) {
    const d = document.createElement('div'); d.className = 'legend';
    items.forEach(([name, color, line]) => { const s = document.createElement('span'); const i = document.createElement('i'); i.style.background = color; if (line) i.classList.add('line'); s.appendChild(i); s.appendChild(document.createTextNode(name)); d.appendChild(s); });
    parent.appendChild(d); return d;
  }
  function table(parent, cols, rows, opts) {
    parent.textContent = '';
    const t = document.createElement('table'); const thead = document.createElement('thead'); const tr = document.createElement('tr');
    cols.forEach(c => { const th = document.createElement('th'); th.textContent = c; tr.appendChild(th); }); thead.appendChild(tr); t.appendChild(thead);
    const tb = document.createElement('tbody');
    rows.forEach(r => { const tr = document.createElement('tr'); if (r.cls) tr.className = r.cls; r.cells.forEach((c, i) => { const td = document.createElement('td'); if (c && typeof c === 'object') { td.textContent = c.v; if (c.cls) td.className = c.cls; } else td.textContent = c == null ? '–' : c; tr.appendChild(td); }); tb.appendChild(tr); });
    t.appendChild(tb); parent.appendChild(t);
    if (opts && opts.note) { const n = document.createElement('p'); n.className = 'note'; n.textContent = opts.note; parent.appendChild(n); }
  }
  function autoW(parent) { let n = parent, w = 0; while (n && !w) { w = n.clientWidth; n = n.parentElement; } return Math.max(320, (w || 600) - 2); }
  function svgIn(parent, w, h) { const s = el('svg', { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' }, parent); return s; }

  /* ---------- horizontal bars (emphasis form) ---------- */
  function hbar(parent, rows, o) {
    o = Object.assign({ max: 100, rowH: 24, labelW: 200, w: 0, fmt: fmt1, showSub: true }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rows.length * o.rowH + 28; const s = svgIn(parent, o.w, h);
    const x0 = o.labelW, x1 = o.w - 54; const sx = v => x0 + (x1 - x0) * (v / o.max);
    [0, 25, 50, 75, 100].forEach(v => { if (v > o.max) return; el('line', { x1: sx(v), y1: 6, x2: sx(v), y2: h - 22, class: 'grid' }, s); txt(s, sx(v), h - 8, v, { class: 'lbl', 'text-anchor': 'middle' }); });
    rows.forEach((r, i) => {
      const y = 8 + i * o.rowH; const bh = 15;
      const g = el('g', {}, s);
      const lab = txt(g, x0 - 8, y + bh / 2 + 4, r.label, { 'text-anchor': 'end', class: r.emph ? 'val' : '', fill: r.emph ? C.dhDark : C.ink });
      if (r.emph) lab.setAttribute('font-weight', 700);
      if (o.showSub && r.sub) txt(g, x0 - 8, y + bh / 2 + 4, '', { 'text-anchor': 'end' });
      if (r.value == null) { txt(g, x0 + 6, y + bh / 2 + 4, r.note || 'not reported', { class: 'lbl' }); }
      else {
        const wv = Math.max(0, sx(r.value) - x0);
        el('rect', { x: x0, y, width: wv, height: bh, fill: r.color || (r.emph ? C.dh : C.de), rx: 0 }, g);
        if (wv > 6) el('rect', { x: x0 + wv - 4, y, width: 4, height: bh, fill: r.color || (r.emph ? C.dh : C.de), rx: 3 }, g);
        txt(g, x0 + wv + 6, y + bh / 2 + 4, o.fmt(r.value), { class: 'val' });
      }
      el('rect', { x: 0, y: y - 4, width: o.w, height: o.rowH, fill: 'transparent' }, g);
      hover(g, () => tipNode(r.label, [['Upper VLM', r.sub], [o.valueName || 'Success', r.value == null ? 'not reported' : o.fmt(r.value) + (o.unit || '%')], ...(r.extra || [])]));
    });
    return s;
  }

  /* ---------- grouped vertical bars ---------- */
  function groupedBars(parent, cats, series, o) {
    o = Object.assign({ max: 100, w: 0, h: 220, fmt: fmt1, labels: true }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const L = 36, R = 10, T = 16, B = 30;
    const pw = o.w - L - R, ph = o.h - T - B; const sy = v => T + ph - ph * (v / o.max);
    [0, 25, 50, 75, 100].forEach(v => { if (v > o.max) return; el('line', { x1: L, y1: sy(v), x2: o.w - R, y2: sy(v), class: 'grid' }, s); txt(s, L - 6, sy(v) + 4, v, { class: 'lbl', 'text-anchor': 'end' }); });
    const gw = pw / cats.length; const bw = Math.min(22, (gw - 14) / series.length - 2);
    cats.forEach((c, ci) => {
      const gx = L + gw * ci + gw / 2; const tot = series.length * bw + (series.length - 1) * 2;
      txt(s, gx, o.h - 10, c, { class: 'lbl', 'text-anchor': 'middle' });
      series.forEach((se, si) => {
        const v = se.values[ci]; if (v == null) return;
        const x = gx - tot / 2 + si * (bw + 2); const y = sy(v);
        const g = el('g', {}, s);
        el('rect', { x, y, width: bw, height: ph + T - y, fill: se.color }, g);
        el('rect', { x, y, width: bw, height: Math.min(6, ph + T - y), rx: 3, fill: se.color }, g);
        if (o.labels) txt(g, x + bw / 2, y - 4, o.fmt(v), { class: 'val', 'text-anchor': 'middle', 'font-size': 10.5 });
        el('rect', { x: x - 2, y: T, width: bw + 4, height: ph, fill: 'transparent' }, g);
        hover(g, () => tipNode(se.name, [[c, o.fmt(v) + (o.unit || '%')], ...(se.extra ? [[ '', se.extra ]] : [])]));
      });
    });
    return s;
  }

  /* ---------- dumbbell ---------- */
  function dumbbell(parent, rows, o) {
    o = Object.assign({ min: 55, max: 80, w: 0, rowH: 34, aName: 'A', bName: 'B', aColor: C.de, bColor: C.dh, fmt: fmt1, labelW: 90 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rows.length * o.rowH + 30; const s = svgIn(parent, o.w, h); const x0 = o.labelW, x1 = o.w - 40; const sx = v => x0 + (x1 - x0) * ((v - o.min) / (o.max - o.min));
    for (let v = o.min; v <= o.max; v += 5) { el('line', { x1: sx(v), y1: 6, x2: sx(v), y2: h - 22, class: 'grid' }, s); txt(s, sx(v), h - 8, v, { class: 'lbl', 'text-anchor': 'middle' }); }
    rows.forEach((r, i) => {
      const y = 18 + i * o.rowH; const g = el('g', {}, s);
      txt(g, x0 - 10, y + 4, r.label, { 'text-anchor': 'end', class: r.emph ? 'val' : '' });
      el('line', { x1: sx(r.a), y1: y, x2: sx(r.b), y2: y, stroke: C.de2, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: sx(r.a), cy: y, r: 6, fill: o.aColor, stroke: '#fff', 'stroke-width': 2 }, g);
      el('circle', { cx: sx(r.b), cy: y, r: 6, fill: o.bColor, stroke: '#fff', 'stroke-width': 2 }, g);
      const left = Math.min(r.a, r.b) === r.a; txt(g, sx(r.a) + (left ? -10 : 10), y + 4, o.fmt(r.a), { class: 'lbl', 'text-anchor': left ? 'end' : 'start' });
      txt(g, sx(r.b) + (left ? 10 : -10), y + 4, o.fmt(r.b), { class: 'val', 'text-anchor': left ? 'start' : 'end' });
      el('rect', { x: 0, y: y - o.rowH / 2, width: o.w, height: o.rowH, fill: 'transparent' }, g);
      hover(g, () => tipNode(r.label, [[o.aName, o.fmt(r.a) + '%'], [o.bName, o.fmt(r.b) + '%'], ['Change', (r.b - r.a >= 0 ? '+' : '') + fmt1(r.b - r.a) + ' pp']]));
    });
    return s;
  }

  /* ---------- development rounds ---------- */
  function rounds(parent, R, o) {
    o = Object.assign({ w: 0, h: 240, min: 55, max: 80 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const L = 40, Rm = 16, T = 18, B = 40; const pw = o.w - L - Rm, ph = o.h - T - B;
    const xs = R.map((_, i) => L + pw * (i + 0.5) / R.length); const sy = v => T + ph - ph * ((v - o.min) / (o.max - o.min));
    for (let v = o.min; v <= o.max; v += 5) { el('line', { x1: L, y1: sy(v), x2: o.w - Rm, y2: sy(v), class: 'grid' }, s); txt(s, L - 6, sy(v) + 4, v, { class: 'lbl', 'text-anchor': 'end' }); }
    const pct = r => 100 * r.s / r.n; const kept = R.map((r, i) => ({ r, i })).filter(x => !x.r.rej);
    const d = kept.map((x, k) => (k ? 'L' : 'M') + xs[x.i] + ' ' + sy(pct(x.r))).join(' ');
    el('path', { d, fill: 'none', stroke: C.dh, 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
    R.forEach((r, i) => {
      const g = el('g', {}, s); const y = sy(pct(r));
      if (r.rej) { const p = kept.filter(x => x.i < i).pop(); el('line', { x1: xs[p.i], y1: sy(pct(p.r)), x2: xs[i], y2: y, stroke: C.rose, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g); el('path', { d: `M${xs[i] - 5} ${y - 5} L${xs[i] + 5} ${y + 5} M${xs[i] + 5} ${y - 5} L${xs[i] - 5} ${y + 5}`, stroke: C.rose, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g); }
      else el('circle', { cx: xs[i], cy: y, r: 5, fill: C.dh, stroke: '#fff', 'stroke-width': 2 }, g);
      txt(g, xs[i], o.h - 14, r.r, { class: 'lbl', 'text-anchor': 'middle' });
      if (i === 0 || i === R.length - 1) txt(g, xs[i] + (i === 0 ? 8 : 0), y + (i === 0 ? 16 : -10), fmt1(pct(r)), { class: 'val', 'text-anchor': i === 0 ? 'start' : 'middle' });
      el('rect', { x: xs[i] - pw / R.length / 2, y: T, width: pw / R.length, height: ph + 20, fill: 'transparent' }, g);
      hover(g, () => tipNode('Round ' + r.r + (r.rej ? ' (rejected)' : ''), [['Success', `${r.s} / ${r.n} = ${fmt1(pct(r))}%`], ['', r.note]]));
    });
    txt(s, o.w / 2, o.h - 0, 'evaluation round on seeds 21–40 (rep. = reported agent)', { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 });
    return s;
  }

  /* ---------- diverging bars ---------- */
  function diverging(parent, rows, o) {
    o = Object.assign({ w: 0, rowH: 28, labelW: 150, max: 100 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rows.length * o.rowH + 30; const s = svgIn(parent, o.w, h); const x0 = o.labelW, x1 = o.w - 30; const mid = (x0 + x1) / 2; const sx = v => mid + (x1 - x0) / 2 * (v / o.max);
    [-100, -50, 0, 50, 100].forEach(v => { el('line', { x1: sx(v), y1: 6, x2: sx(v), y2: h - 22, class: v === 0 ? 'axis' : 'grid' }, s); txt(s, sx(v), h - 8, (v > 0 ? '+' : '') + v, { class: 'lbl', 'text-anchor': 'middle' }); });
    rows.forEach((r, i) => {
      const y = 8 + i * o.rowH; const g = el('g', {}, s); const v = r.delta; const w = Math.abs(sx(v) - mid);
      txt(g, x0 - 8, y + 12, r.label, { 'text-anchor': 'end' });
      el('rect', { x: v < 0 ? mid - w : mid, y, width: w, height: 15, fill: v < 0 ? C.rose : C.dh }, g);
      // a bar that reaches the label column carries its value inside, in white
      const inside = w >= 40;
      if (inside) txt(g, v < 0 ? mid - w + 6 : mid + w - 6, y + 12, (v > 0 ? '+' : '') + v, { class: 'val', fill: '#fff', 'text-anchor': v < 0 ? 'start' : 'end' });
      else txt(g, v < 0 ? mid - w - 6 : mid + w + 6, y + 12, (v > 0 ? '+' : '') + v, { class: 'val', 'text-anchor': v < 0 ? 'end' : 'start' });
      el('rect', { x: 0, y: y - 4, width: o.w, height: o.rowH, fill: 'transparent' }, g);
      hover(g, () => tipNode(r.label, [['Task', r.sub], ['Before', r.before + ' / 20'], ['After', r.after + ' / 20'], ['Change', (v > 0 ? '+' : '') + v + ' points']]));
    });
    return s;
  }

  /* ---------- scatter: success vs upper-model scale ---------- */
  function scatter(parent, pts, slots, o) {
    o = Object.assign({ w: 0, h: 320 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const L = 40, R = 20, T = 16, B = 60; const pw = o.w - L - R, ph = o.h - T - B;
    const sx = i => L + pw * (i + 0.5) / slots.length; const sy = v => T + ph - ph * v / 100;
    [0, 25, 50, 75, 100].forEach(v => { el('line', { x1: L, y1: sy(v), x2: o.w - R, y2: sy(v), class: 'grid' }, s); txt(s, L - 6, sy(v) + 4, v, { class: 'lbl', 'text-anchor': 'end' }); });
    el('line', { x1: sx(0.5) + pw / slots.length * 0.0, y1: T, x2: sx(0.5), y2: T + ph, class: 'axis', 'stroke-dasharray': '3 3' }, s);
    txt(s, sx(0), o.h - 6, 'open 4B model', { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 });
    txt(s, sx(3), o.h - 6, 'proprietary frontier models (scale undisclosed)', { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 });
    slots.forEach((sl, i) => { sl.split('\n').forEach((line, k) => txt(s, sx(i), T + ph + 14 + k * 11, line, { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 })); });
    // label collision per slot
    const bySlot = {}; pts.forEach(p => { (bySlot[p.slot] = bySlot[p.slot] || []).push(p); });
    Object.values(bySlot).forEach(arr => { arr.sort((a, b) => b.v - a.v); let lastY = -99; arr.forEach(p => { let y = sy(p.v); if (y - lastY < 13) y = lastY + 13; p.ly = y; lastY = y; }); const over = lastY - (T + ph - 4); if (over > 0) arr.forEach(p => { p.ly -= over; }); });
    pts.forEach(p => {
      const g = el('g', {}, s); const x = sx(p.slot), y = sy(p.v);
      el('circle', { cx: x, cy: y, r: p.dh ? 8 : 6, fill: p.dh ? C.dh : C.de, stroke: '#fff', 'stroke-width': 2 }, g);
      if (p.ly !== y) { const left = x + 16 + (`${p.m} ${fmt1(p.v)}`).length * 6 > o.w - 4; el('line', { x1: x + (left ? -8 : 8), y1: y, x2: x + (left ? -14 : 14), y2: p.ly, stroke: C.de2, 'stroke-width': 1 }, g); }
      const lab = `${p.m} ${fmt1(p.v)}`; const left = x + 16 + lab.length * 6 > o.w - 4; txt(g, left ? x - 16 : x + 16, p.ly + 4, lab, { class: p.dh ? 'val' : 'lbl', 'font-size': p.dh ? 12 : 10.5, fill: p.dh ? C.dhDark : C.ink3, 'text-anchor': left ? 'end' : 'start' });
      el('circle', { cx: x, cy: y, r: 14, fill: 'transparent' }, g);
      hover(g, () => tipNode(p.m, [['Upper VLM', p.vlm], ['Success', fmt2(p.v) + '%']]));
    });
    return s;
  }

  /* ---------- heatmap ---------- */
  function mix(a, b, t) { const pa = a.match(/\w\w/g).map(x => parseInt(x, 16)), pb = b.match(/\w\w/g).map(x => parseInt(x, 16)); return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  function heatmap(parent, rowsN, colsN, values, o) {
    o = Object.assign({ w: 0, cell: 44, labelW: 70, diverging: false, max: 100, info: null, fmt: v => v }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rowsN.length * o.cell + 40; const s = svgIn(parent, o.w, h); const cw = (o.w - o.labelW) / colsN.length;
    colsN.forEach((c, j) => txt(s, o.labelW + cw * (j + 0.5), 14, c, { class: 'lbl', 'text-anchor': 'middle' }));
    rowsN.forEach((r, i) => {
      txt(s, o.labelW - 8, 24 + o.cell * (i + 0.5) + 4, r, { 'text-anchor': 'end', class: 'ttl' });
      colsN.forEach((c, j) => {
        const v = values[i][j]; let fill, ink;
        if (o.diverging) { const t = Math.min(1, Math.abs(v) / o.max); fill = v === 0 ? '#EEF1F4' : v > 0 ? mix('#E3F3F5', '#0F6B75', t) : mix('#FCEEEE', '#B0413F', t); ink = t > 0.55 ? '#fff' : C.ink; }
        else { const t = v / o.max; fill = mix('#EEF6F7', '#0F6B75', t); ink = t > 0.55 ? '#fff' : C.ink; }
        const g = el('g', { class: 'heat-cell' }, s); const x = o.labelW + cw * j + 1, y = 24 + o.cell * i + 1;
        el('rect', { x, y, width: cw - 2, height: o.cell - 2, rx: 4, fill }, g);
        txt(g, x + (cw - 2) / 2, y + (o.cell - 2) / 2 + 4, o.fmt(v), { 'text-anchor': 'middle', fill: ink, 'font-size': 11.5, 'font-weight': 600 });
        hover(g, () => tipNode(`${r} · task ${c}`, o.info ? o.info(i, j) : [['Value', v]]));
      });
    });
    return s;
  }

  /* ---------- log-scale dot plot ---------- */
  function dotLog(parent, rows, o) {
    o = Object.assign({ w: 0, rowH: 30, labelW: 260, minMs: 0.01, maxMs: 20000 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rows.length * o.rowH + 34; const s = svgIn(parent, o.w, h); const x0 = o.labelW, x1 = o.w - 20; const lg = v => Math.log10(v); const sx = v => x0 + (x1 - x0) * ((lg(v) - lg(o.minMs)) / (lg(o.maxMs) - lg(o.minMs)));
    [[0.01, '0.01 ms'], [0.1, '0.1 ms'], [1, '1 ms'], [10, '10 ms'], [100, '0.1 s'], [1000, '1 s'], [10000, '10 s']].forEach(([v, l]) => { el('line', { x1: sx(v), y1: 6, x2: sx(v), y2: h - 26, class: 'grid' }, s); txt(s, sx(v), h - 12, l, { class: 'lbl', 'text-anchor': 'middle' }); });
    rows.forEach((r, i) => {
      const y = 16 + i * o.rowH; const g = el('g', {}, s);
      txt(g, x0 - 10, y + 4, r.name, { 'text-anchor': 'end', class: r.dh ? 'val' : '', fill: r.dh ? C.dhDark : C.ink });
      el('line', { x1: x0, y1: y, x2: sx(r.ms), y2: y, stroke: r.dh ? C.dh : C.de2, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.55 }, g);
      el('circle', { cx: sx(r.ms), cy: y, r: 6, fill: r.dh ? C.dh : C.de, stroke: '#fff', 'stroke-width': 2 }, g);
      const label = r.ms < 1 ? r.ms + ' ms' : r.ms < 1000 ? r.ms + ' ms' : (r.ms / 1000).toFixed(r.ms % 1000 ? 2 : 0).replace(/\.?0+$/, '') + ' s';
      txt(g, sx(r.ms) + 10, y + 4, label, { class: 'val' });
      el('rect', { x: 0, y: y - o.rowH / 2, width: o.w, height: o.rowH, fill: 'transparent' }, g);
      hover(g, () => tipNode(r.name, [['Median', label], ['', r.note]]));
    });
    return s;
  }

  /* ---------- radar ---------- */
  function radar(parent, labels, series, o) {
    o = Object.assign({ w: 0, h: 330 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const cx = o.w / 2, cy = o.h / 2 + 4, R = Math.min(o.w, o.h) / 2 - 42; const n = labels.length;
    const pt = (i, v) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + R * (v / 100) * Math.cos(a), cy + R * (v / 100) * Math.sin(a)]; };
    [50, 100].forEach(v => { el('polygon', { points: labels.map((_, i) => pt(i, v).join(',')).join(' '), fill: 'none', class: 'grid' }, s); });
    labels.forEach((l, i) => { const [x, y] = pt(i, 100); el('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'grid' }, s); const [lx, ly] = pt(i, 118); txt(s, lx, ly + 4, l, { class: 'lbl', 'text-anchor': 'middle' }); });
    txt(s, cx + 4, cy - R / 2 + 4, '50', { class: 'lbl', 'font-size': 10 });
    series.forEach(se => {
      const pts = se.v.map((v, i) => pt(i, v)); const poly = pts.map(p => p.join(',')).join(' ');
      el('polygon', { points: poly, fill: se.color, 'fill-opacity': se.dh ? 0.12 : 0, stroke: se.color, 'stroke-width': se.dh ? 2.5 : 1.5, 'stroke-dasharray': se.dh ? '' : '4 3', 'stroke-linejoin': 'round' }, s);
      pts.forEach((p, i) => { const g = el('g', {}, s); el('circle', { cx: p[0], cy: p[1], r: se.dh ? 4 : 3, fill: se.color, stroke: '#fff', 'stroke-width': 1.5 }, g); el('circle', { cx: p[0], cy: p[1], r: 10, fill: 'transparent' }, g); hover(g, () => tipNode(se.name, [[labels[i], fmt1(se.v[i]) + '%']])); });
    });
    return s;
  }

  /* ---------- histogram (two series per bin) ---------- */
  function histogram(parent, bins, o) {
    o = Object.assign({ w: 0, h: 220 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const L = 40, R = 10, T = 16, B = 34; const pw = o.w - L - R, ph = o.h - T - B; const max = Math.max(...bins.map(b => Math.max(b.s, b.f)));
    const sy = v => T + ph - ph * v / (max * 1.08);
    [0, 50, 100, 150, 200, 250].forEach(v => { if (v > max * 1.08) return; el('line', { x1: L, y1: sy(v), x2: o.w - R, y2: sy(v), class: 'grid' }, s); txt(s, L - 6, sy(v) + 4, v, { class: 'lbl', 'text-anchor': 'end' }); });
    const gw = pw / bins.length; const bw = Math.min(18, (gw - 10) / 2 - 1);
    bins.forEach((b, i) => {
      const gx = L + gw * i + gw / 2; txt(s, gx, o.h - 14, `${b.lo}–${b.hi}`, { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10 });
      [['s', C.dh, 'Success'], ['f', C.rose, 'Failure']].forEach(([k, col, name], si) => {
        const v = b[k]; const x = gx - bw - 1 + si * (bw + 2); const y = sy(v); const g = el('g', {}, s);
        if (v > 0) { el('rect', { x, y, width: bw, height: T + ph - y, fill: col }, g); el('rect', { x, y, width: bw, height: Math.min(5, T + ph - y), rx: 2.5, fill: col }, g); }
        if (v === max || (k === 's' && v === Math.max(...bins.map(z => z.s)))) txt(g, x + bw / 2, y - 4, v, { class: 'val', 'text-anchor': 'middle', 'font-size': 10.5 });
        el('rect', { x: x - 1, y: T, width: bw + 2, height: ph, fill: 'transparent' }, g);
        hover(g, () => tipNode(`${name}, budget used ${b.lo}–${b.hi}%`, [['Episodes', v]]));
      });
    });
    txt(s, o.w / 2, o.h - 2, 'budget used at episode end (%)', { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 });
    return s;
  }

  /* ---------- 100% stacked horizontal bars ---------- */
  function stacked(parent, rows, segs, o) {
    o = Object.assign({ w: 0, rowH: 26, labelW: 120 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rows.length * o.rowH + 28; const s = svgIn(parent, o.w, h); const x0 = o.labelW, x1 = o.w - 16; const sx = v => x0 + (x1 - x0) * v / 100;
    [0, 25, 50, 75, 100].forEach(v => { el('line', { x1: sx(v), y1: 6, x2: sx(v), y2: h - 22, class: 'grid' }, s); txt(s, sx(v), h - 8, v, { class: 'lbl', 'text-anchor': 'middle' }); });
    rows.forEach((r, i) => {
      const y = 8 + i * o.rowH; txt(s, x0 - 8, y + 12, r.cell, { 'text-anchor': 'end', 'font-size': 11 });
      let acc = 0;
      segs.forEach(sg => { const v = r[sg.key]; if (!v) return; const g = el('g', {}, s); el('rect', { x: sx(acc) + 1, y, width: Math.max(0, sx(acc + v) - sx(acc) - 2), height: 15, fill: sg.color, rx: 2 }, g); hover(g, () => tipNode(r.cell, [[sg.name, fmt1(v) + '% of steps']])); acc += v; });
    });
    return s;
  }

  /* ---------- horizontal paired bars ---------- */
  function hpairs(parent, rows, series, o) {
    o = Object.assign({ w: 0, rowH: 40, labelW: 200, max: 600 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const h = rows.length * o.rowH + 28; const s = svgIn(parent, o.w, h); const x0 = o.labelW, x1 = o.w - 60; const sx = v => x0 + (x1 - x0) * v / o.max;
    [0, 200, 400, 600].forEach(v => { if (v > o.max) return; el('line', { x1: sx(v), y1: 6, x2: sx(v), y2: h - 22, class: 'grid' }, s); txt(s, sx(v), h - 8, v, { class: 'lbl', 'text-anchor': 'middle' }); });
    rows.forEach((r, i) => {
      const y = 8 + i * o.rowH; txt(s, x0 - 8, y + 16, r.name, { 'text-anchor': 'end' });
      series.forEach((se, k) => { const v = r[se.key]; const yy = y + k * 15; const g = el('g', {}, s); const w = sx(v) - x0; if (w > 0) el('rect', { x: x0, y: yy, width: w, height: 12, fill: se.color, rx: 2 }, g); txt(g, x0 + w + 6, yy + 10, v, { class: v ? 'val' : 'lbl', 'font-size': 10.5 }); el('rect', { x: 0, y: yy - 1, width: o.w, height: 14, fill: 'transparent' }, g); hover(g, () => tipNode(r.name, [[se.name, v]])); });
    });
    return s;
  }

  /* ---------- simple vertical bars with labels ---------- */
  function vbars(parent, rows, o) {
    o = Object.assign({ w: 0, h: 220, max: 250, unit: '' }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const L = 36, R = 10, T = 18, B = 34; const pw = o.w - L - R, ph = o.h - T - B; const sy = v => T + ph - ph * v / o.max;
    for (let v = 0; v <= o.max; v += o.max / 5) { el('line', { x1: L, y1: sy(v), x2: o.w - R, y2: sy(v), class: 'grid' }, s); txt(s, L - 6, sy(v) + 4, Math.round(v), { class: 'lbl', 'text-anchor': 'end' }); }
    const gw = pw / rows.length; const bw = Math.min(24, gw * 0.5);
    rows.forEach((r, i) => { const x = L + gw * i + gw / 2 - bw / 2; const y = sy(r.v); const g = el('g', {}, s); el('rect', { x, y, width: bw, height: T + ph - y, fill: r.color || C.dh }, g); el('rect', { x, y, width: bw, height: 6, rx: 3, fill: r.color || C.dh }, g); txt(g, x + bw / 2, y - 5, r.v + o.unit, { class: 'val', 'text-anchor': 'middle' }); txt(g, x + bw / 2, o.h - 14, r.name, { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 }); el('rect', { x: x - 6, y: T, width: bw + 12, height: ph, fill: 'transparent' }, g); hover(g, () => tipNode(r.name, [[o.valueName || 'Value', r.v + o.unit], ['', r.note]])); });
    return s;
  }

  /* ---------- slope lines (drawer update) ---------- */
  function slopes(parent, labels, series, o) {
    o = Object.assign({ w: 0, h: 220, min: 40, max: 100 }, o || {});
    parent.textContent = ''; o.w = o.w || autoW(parent);
    const s = svgIn(parent, o.w, o.h); const L = 40, R = 60, T = 16, B = 34; const pw = o.w - L - R, ph = o.h - T - B; const sx = i => L + pw * i / (labels.length - 1); const sy = v => T + ph - ph * (v - o.min) / (o.max - o.min);
    for (let v = o.min; v <= o.max; v += 20) { el('line', { x1: L, y1: sy(v), x2: o.w - R, y2: sy(v), class: 'grid' }, s); txt(s, L - 6, sy(v) + 4, v, { class: 'lbl', 'text-anchor': 'end' }); }
    labels.forEach((l, i) => txt(s, sx(i), o.h - 12, l, { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10.5 }));
    series.forEach(se => { el('path', { d: se.v.map((v, i) => (i ? 'L' : 'M') + sx(i) + ' ' + sy(v)).join(' '), fill: 'none', stroke: se.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, s); se.v.forEach((v, i) => { const g = el('g', {}, s); el('circle', { cx: sx(i), cy: sy(v), r: 5, fill: se.color, stroke: '#fff', 'stroke-width': 2 }, g); txt(g, sx(i), sy(v) - 9, fmt1(v), { class: 'val', 'text-anchor': 'middle', 'font-size': 10.5 }); el('circle', { cx: sx(i), cy: sy(v), r: 12, fill: 'transparent' }, g); hover(g, () => tipNode(se.name, [[labels[i], fmt1(v) + '%']])); }); txt(s, sx(labels.length - 1) + 10, sy(se.v[se.v.length - 1]) + 4, se.name, { class: 'lbl', 'font-size': 10.5 }); });
    return s;
  }

  return { C, el, txt, card, legend, table, hbar, groupedBars, dumbbell, rounds, diverging, scatter, heatmap, dotLog, radar, histogram, stacked, hpairs, vbars, slopes, tip, tipNode, hover, fmt1, fmt2 };
})();
