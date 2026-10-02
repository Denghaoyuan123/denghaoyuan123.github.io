/* System-specific interactives for the baseline section. Each renderer gets
   (container, data, ctx) where ctx exposes h/el/txt/$/$$/Ch/D/fmtT/player. */
(function () {
  const S = (window.DH_BL.special = window.DH_BL.special || {});
  const C = { ok: '#0E93A6', fail: '#C9503F', de: '#A7AEB7', ink: '#14202B', amber: '#B8741F', blue: '#3F79C9', violet: '#7A62B3' };
  const esc = s => String(s == null ? '' : s);

  /* Zetta: 20 paired held-out seeds, candidate vs parent, with the privileged tool marked. */
  S['zetta-grid'] = function (box, d, ctx) {
    const { h, el, txt, player } = ctx;
    const pairs = d.pairs || [];
    const top = h('div', 'bl-grid2'); box.appendChild(top);
    const gridBox = h('div'); top.appendChild(gridBox);
    const W = 640, H = 118, L = 84, cw = (W - L - 8) / pairs.length;
    const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, gridBox); s.style.width = '100%'; s.style.height = 'auto';
    txt(s, L - 8, 38, 'candidate', { 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 600, fill: '#4A5563' });
    txt(s, L - 8, 76, 'bare policy', { 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 600, fill: '#4A5563' });
    txt(s, L - 8, 108, 'seed', { 'text-anchor': 'end', 'font-size': 10.5, fill: '#7C8794' });
    let sel = d.defaultIndex || 0; const cells = [];
    pairs.forEach((p, i) => {
      const x = L + i * cw; const g = el('g', { class: 'mark', style: 'cursor:pointer' }, s);
      const cand = el('rect', { x: x + 2, y: 22, width: cw - 4, height: 26, rx: 5, fill: p.cand.ok ? C.ok : '#fff', stroke: p.cand.ok ? C.ok : C.fail, 'stroke-width': 1.5, 'stroke-dasharray': p.cand.ok ? 'none' : '3 2' }, g);
      const par = el('rect', { x: x + 2, y: 60, width: cw - 4, height: 26, rx: 5, fill: p.parent.ok ? C.ok : '#fff', stroke: p.parent.ok ? C.ok : C.fail, 'stroke-width': 1.5, 'stroke-dasharray': p.parent.ok ? 'none' : '3 2' }, g);
      if (p.cand.tool) { txt(g, x + cw / 2, 40, '▲', { 'text-anchor': 'middle', 'font-size': 12, fill: p.cand.ok ? '#fff' : C.fail }); }
      txt(g, x + cw / 2, 108, String(p.seed), { 'text-anchor': 'middle', 'font-size': 10.5, fill: '#7C8794' });
      const ring = el('rect', { x: x + 0.5, y: 18, width: cw - 1, height: 72, rx: 7, fill: 'none', stroke: C.ink, 'stroke-width': 2, opacity: 0 }, g);
      const t = el('title', {}, g); t.textContent = `seed ${p.seed}: ${p.outcome.replace(/_/g, ' ')}${p.cand.tool ? ` · candidate called ${p.cand.tool}` : ''}`;
      g.addEventListener('click', () => { sel = i; cells.forEach((c, k) => c.setAttribute('opacity', k === i ? 1 : 0)); show(); });
      cells.push(ring);
    });
    const leg = h('p', 'sub'); leg.style.marginTop = '6px'; leg.textContent = d.legend || 'Filled: success on the benchmark predicate. Dashed: failure. ▲: the candidate invoked the privileged pick-and-place tool. Click a seed to play both arms.'; gridBox.appendChild(leg);
    const stats = h('div'); top.appendChild(stats);
    (d.stats || []).forEach(([k, v]) => { const r = h('div'); r.style.cssText = 'display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #E5E9EE;font-size:13px'; r.appendChild(h('span', null, k)); const b = h('b', null, v); b.style.fontVariantNumeric = 'tabular-nums'; r.appendChild(b); stats.appendChild(r); });
    const pv = h('div'); pv.style.marginTop = '14px'; box.appendChild(pv);
    function show() {
      const p = pairs[sel]; pv.textContent = '';
      const c = { duration: p.duration, videos: [{ src: p.videos.cand, label: `candidate · seed ${p.seed} · ${p.cand.ok ? 'success' : 'failure'}`, ok: p.cand.ok, fail: !p.cand.ok }, { src: p.videos.parent, label: `bare policy · seed ${p.seed} · ${p.parent.ok ? 'success' : 'failure'}`, ok: p.parent.ok, fail: !p.parent.ok }], markers: p.markers || [] };
      pv.appendChild(player(c));
      if (p.note) { const n = h('p', 'sub'); n.style.marginTop = '8px'; n.textContent = p.note; pv.appendChild(n); }
    }
    cells[sel] && cells[sel].setAttribute('opacity', 1); show();
  };

  /* ENPIRE: the 18 generated policies, what each calls, and its rollout. */
  S['enpire-policies'] = function (box, d, ctx) {
    const { h, player } = ctx;
    const grid = h('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px'; box.appendChild(grid);
    const detail = h('div'); detail.style.marginTop = '14px'; box.appendChild(detail);
    let sel = d.defaultIndex || 0; const tiles = [];
    (d.policies || []).forEach((p, i) => {
      const t = h('div'); t.style.cssText = 'border:1px solid #E5E9EE;border-radius:10px;overflow:hidden;cursor:pointer;background:#fff';
      const im = document.createElement('img'); im.src = p.frame || ''; im.alt = `${p.suite} task ${p.task}`; im.loading = 'lazy'; im.style.cssText = 'width:100%;aspect-ratio:2/1;object-fit:cover;display:block;background:#0F1B24'; t.appendChild(im);
      const cap = h('div'); cap.style.cssText = 'padding:6px 8px;font-size:11.5px;line-height:1.3';
      cap.appendChild(h('div', 'mono', `${p.suite} · task ${p.task}`));
      const tag = h('div', null, p.passthrough ? 'pass-through' : `${p.undefined.length} undefined name${p.undefined.length === 1 ? '' : 's'}`); tag.style.cssText = `font-weight:600;color:${p.passthrough ? C.amber : C.fail}`; cap.appendChild(tag);
      cap.appendChild(h('div', null, p.video ? `rollout ${p.duration.toFixed(1)} s` : 'stopped before acting')); cap.lastChild.style.color = '#7C8794';
      t.appendChild(cap); t.addEventListener('click', () => { sel = i; tiles.forEach((x, k) => x.style.outline = k === i ? '2px solid #14202B' : 'none'); show(); }); grid.appendChild(t); tiles.push(t);
    });
    function show() {
      const p = d.policies[sel]; detail.textContent = '';
      const g = h('div', 'bl-grid2'); detail.appendChild(g);
      const left = h('div'); g.appendChild(left);
      if (p.video) left.appendChild(player({ duration: p.duration, videos: [{ src: p.video, label: `${p.suite} · task ${p.task} · agent view`, fail: !p.success }], markers: p.markers || [] }));
      else { const f = h('div', 'fig'); const im = document.createElement('img'); im.src = p.frame; im.alt = ''; im.style.width = '100%'; f.appendChild(im); left.appendChild(f); const n = h('p', 'sub'); n.style.marginTop = '6px'; n.textContent = p.frameNote || 'The only frame this policy produced: it raised an interface error before its first action.'; left.appendChild(n); }
      const right = h('div'); g.appendChild(right);
      const meta = h('p', 'sub'); meta.textContent = `${p.instruction ? '"' + p.instruction + '" · ' : ''}${p.lines} lines · undefined names: ${p.undefined.length ? p.undefined.join(', ') : 'none'}${p.passthrough ? ' · returns pi05.predict(observation) only' : ''}`; right.appendChild(meta);
      const pre = document.createElement('pre'); const und = new Set(p.undefined || []);
      (p.code || []).forEach((line, k) => { const ln = document.createElement('span'); ln.className = 'ln'; ln.textContent = String(k + 1).padStart(3, ' '); pre.appendChild(ln); let rest = line; const re = new RegExp('\\b(' + Array.from(und).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\s*\\(', 'g'); if (und.size) { let m, last = 0; while ((m = re.exec(line))) { pre.appendChild(document.createTextNode(line.slice(last, m.index))); const sp = document.createElement('span'); sp.className = 'hl'; sp.textContent = m[1]; pre.appendChild(sp); pre.appendChild(document.createTextNode('(')); last = m.index + m[0].length; } rest = line.slice(last); } if (/pi05\.predict/.test(rest)) { const idx = rest.indexOf('pi05.predict'); pre.appendChild(document.createTextNode(rest.slice(0, idx))); const sp = document.createElement('span'); sp.className = 'hl2'; sp.textContent = 'pi05.predict'; pre.appendChild(sp); pre.appendChild(document.createTextNode(rest.slice(idx + 12))); } else pre.appendChild(document.createTextNode(rest)); pre.appendChild(document.createTextNode('\n')); });
      right.appendChild(pre);
    }
    tiles[sel] && (tiles[sel].style.outline = '2px solid #14202B'); show();
    if (d.loop) { const lp = h('div', 'card'); lp.style.cssText = 'margin-top:14px;padding:12px 16px'; lp.appendChild(h('h4', null, d.loop.title)); const p = h('p', 'sub'); p.style.margin = 0; p.textContent = d.loop.text; lp.appendChild(p); box.appendChild(lp); }
  };

  /* Harness VLA: turn logs beside the video, and the Codex decision-time strip. */
  S['hvla-turns'] = function (box, d, ctx) {
    const { h, el, txt, player, Ch } = ctx;
    const logs = d.logs || [];
    const tabs = h('div', 'bl-case-tabs'); box.appendChild(tabs); const body = h('div'); box.appendChild(body); let sel = 0;
    logs.forEach((L, i) => { const b = h('button', i === 0 ? 'active' : '', L.title); b.addEventListener('click', () => { sel = i; Array.from(tabs.children).forEach((x, k) => x.classList.toggle('active', k === i)); show(); }); tabs.appendChild(b); });
    function show() {
      const L = logs[sel]; body.textContent = ''; const g = h('div', 'bl-grid2'); body.appendChild(g);
      const left = h('div'); g.appendChild(left);
      const markers = (L.turns || []).filter(t => t.at != null && (t.exact || t.quoted)).map(t => ({ at: t.at, label: `T${t.n}: ${t.head}${t.exact ? '' : ' (approx.)'}`, short: `T${t.n}`, quote: t.quoted ? t.text : '', fail: !!t.fail }));
      const pl = player({ duration: L.duration, videos: [{ src: L.video, label: L.label, fail: !L.success, ok: L.success, dur: L.duration }], markers }); left.appendChild(pl);
      const right = h('div'); g.appendChild(right);
      const note = h('p', 'sub'); note.textContent = L.note || ''; right.appendChild(note);
      const list = h('div'); list.style.cssText = 'max-height:420px;overflow:auto;border:1px solid #E5E9EE;border-radius:10px;font-size:12.5px';
      (L.turns || []).forEach(t => { const r = h('div'); r.style.cssText = `display:grid;grid-template-columns:44px 1fr;gap:8px;padding:6px 10px;border-bottom:1px solid #E5E9EE;${t.quoted ? 'background:#FCEEEE' : ''}`; const n = h('div', 'mono', `T${t.n}`); n.style.color = t.quoted ? '#B0413F' : '#7C8794'; r.appendChild(n); const d2 = h('div'); const tx = h('div', null, t.text); tx.style.color = t.quoted ? '#14202B' : '#4A5563'; d2.appendChild(tx); if (t.tools && t.tools.length) { const tl = h('div', 'mono', t.tools.join(' · ')); tl.style.cssText = 'color:#7C8794;font-size:11px;margin-top:2px'; d2.appendChild(tl); } r.appendChild(d2); if (t.at != null) { r.style.cursor = 'pointer'; r.title = `seek to ${t.at.toFixed(1)} s${t.exact ? '' : ' (approximate)'}`; r.addEventListener('click', () => { if (pl._seek) pl._seek(t.at); }); } list.appendChild(r); });
      right.appendChild(list);
    }
    show();
    if (d.latency) {
      const lat = h('div'); lat.style.marginTop = '16px'; box.appendChild(lat);
      lat.appendChild(h('h4', null, d.latency.title)); const sub = h('p', 'sub'); sub.textContent = d.latency.sub; lat.appendChild(sub);
      const W = 900, H = 96, L = 170, R = 20; const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, lat); s.style.cssText = 'width:100%;height:auto';
      const lo = Math.log10(0.02), hi = Math.log10(10000); const sx = ms => L + (W - L - R) * (Math.log10(ms) - lo) / (hi - lo);
      [0.1, 1, 10, 100, 1000, 10000].forEach(v => { el('line', { x1: sx(v), y1: 14, x2: sx(v), y2: 70, stroke: '#E5E9EE' }, s); txt(s, sx(v), 84, v >= 1000 ? (v / 1000) + ' s' : v + ' ms', { 'text-anchor': 'middle', 'font-size': 10.5, fill: '#7C8794' }); });
      const rows = d.latency.rows; const rh = 56 / rows.length;
      rows.forEach((r, i) => { const y = 22 + i * rh; txt(s, L - 10, y + 4, r.name, { 'text-anchor': 'end', 'font-size': 11.5, fill: r.dh ? '#0F6B75' : '#4A5563', 'font-weight': r.dh ? 700 : 500 }); if (r.samples) { r.samples.forEach(ms => { const c = el('circle', { cx: sx(ms), cy: y, r: 4.5, fill: C.fail, opacity: 0.55 }, s); const t = el('title', {}, c); t.textContent = `${(ms / 1000).toFixed(2)} s`; }); txt(s, sx(r.median) , y - 8, `median ${(r.median / 1000).toFixed(2)} s`, { 'text-anchor': 'middle', 'font-size': 10.5, fill: '#B0413F', 'font-weight': 600 }); } else { const c = el('circle', { cx: sx(r.median), cy: y, r: 6, fill: r.dh ? C.ok : C.de }, s); const t = el('title', {}, c); t.textContent = r.note || ''; txt(s, sx(r.median) + 10, y + 4, r.label, { 'font-size': 10.5, fill: r.dh ? '#0F6B75' : '#4A5563' }); } });
    }
  };

  /* PhyAgentOS: every verifier override, with the images the verifier saw. */
  S['phy-verifier'] = function (box, d, ctx) {
    const { h, el, txt, player } = ctx;
    const g = h('div', 'bl-grid2'); box.appendChild(g);
    const left = h('div'); g.appendChild(left); const right = h('div'); g.appendChild(right);
    // summary bars
    if (d.summary) { const W = 560, H = 28 + d.summary.length * 26; const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, left); s.style.cssText = 'width:100%;height:auto'; d.summary.forEach((r, i) => { const y = 14 + i * 26; txt(s, 0, y + 12, r.name, { 'font-size': 12, fill: '#4A5563' }); const x0 = 220, w = W - x0 - 60; el('rect', { x: x0, y, width: w, height: 16, rx: 4, fill: '#EEF1F4' }, s); el('rect', { x: x0, y, width: w * r.v / r.of, height: 16, rx: 4, fill: C.fail }, s); txt(s, x0 + w + 6, y + 12, `${r.v} / ${r.of}`, { 'font-size': 12, fill: '#14202B', 'font-weight': 600 }); }); const n = h('p', 'sub'); n.textContent = d.summaryNote || ''; left.appendChild(n); }
    // filter + list
    const models = Array.from(new Set((d.overrides || []).map(o => o.model)));
    let model = models[0]; const ft = h('div', 'bl-case-tabs'); models.forEach((m, i) => { const b = h('button', i === 0 ? 'active' : '', m); b.addEventListener('click', () => { model = m; Array.from(ft.children).forEach((x, k) => x.classList.toggle('active', k === i)); list(); }); ft.appendChild(b); }); left.appendChild(ft);
    const ul = h('div'); ul.style.cssText = 'max-height:380px;overflow:auto;border:1px solid #E5E9EE;border-radius:10px;font-size:12.5px'; left.appendChild(ul);
    let sel = null;
    function list() { ul.textContent = ''; const os = d.overrides.filter(o => o.model === model); os.forEach((o, i) => { const r = h('div'); r.style.cssText = 'padding:7px 10px;border-bottom:1px solid #E5E9EE;cursor:pointer'; r.appendChild(h('div', 'mono', `${o.episode} · ${o.steps} steps · predicate ${o.predicate}`)); r.firstChild.style.color = '#7C8794'; const q = h('div', null, `“${o.quote}”`); q.style.cssText = 'color:#14202B;margin-top:2px'; r.appendChild(q); r.addEventListener('click', () => { sel = o; Array.from(ul.children).forEach(x => x.style.background = ''); r.style.background = '#F1F9FA'; show(); }); ul.appendChild(r); if (i === 0 && !sel) { sel = o; r.style.background = '#F1F9FA'; } }); show(); }
    function show() { right.textContent = ''; if (!sel) return; const o = sel; right.appendChild(h('h4', null, o.title || o.instruction)); const m = h('p', 'sub'); m.textContent = `${o.model} · ${o.episode} · ${o.instruction ? '"' + o.instruction + '"' : ''}`; right.appendChild(m); if (o.images && o.images.length) { const gr = h('div'); gr.style.cssText = `display:grid;grid-template-columns:repeat(${Math.min(4, o.images.length)},1fr);gap:6px;margin-bottom:8px`; o.images.forEach(im => { const f = h('figure'); f.style.cssText = 'margin:0;position:relative;border-radius:8px;overflow:hidden;border:2px solid ' + (im.fail ? C.fail : 'transparent'); const e = document.createElement('img'); e.src = im.src; e.alt = im.label || ''; e.loading = 'lazy'; e.dataset.zoom = im.src; e.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;display:block;cursor:zoom-in'; f.appendChild(e); const c = h('figcaption', null, im.label || ''); c.style.cssText = 'position:absolute;left:0;right:0;bottom:0;font-size:10px;padding:2px 4px;background:rgba(0,0,0,.55);color:#fff;font-family:var(--mono)'; f.appendChild(c); gr.appendChild(f); }); right.appendChild(gr); }
      const vq = h('div', 'card'); vq.style.padding = '10px 14px'; vq.appendChild(h('div', 'mono', 'verifier response')); vq.firstChild.style.cssText = 'font-size:11px;color:#7C8794;margin-bottom:4px'; const q = h('p', null, o.response || o.quote); q.style.cssText = 'margin:0;font-size:13px;font-style:italic'; vq.appendChild(q); const vd = h('p', null, `verdict recorded: ${o.verdict} · benchmark predicate: ${o.predicate}`); vd.style.cssText = 'margin:6px 0 0;font-size:12.5px;font-weight:600;color:#B0413F'; vq.appendChild(vd); right.appendChild(vq);
      if (o.video) { const pv = h('div'); pv.style.marginTop = '10px'; pv.appendChild(player({ duration: o.duration, videos: [{ src: o.video, label: `${o.episode} · agent view`, fail: true }], markers: o.markers || [] })); right.appendChild(pv); } }
    list();
  };

  /* ASPIRE: the session transcripts and screenshots of the six runs. */
  S['aspire-transcript'] = function (box, d, ctx) {
    const { h } = ctx;
    const tabs = h('div', 'bl-case-tabs'); box.appendChild(tabs); const body = h('div'); box.appendChild(body); let sel = 0;
    (d.runs || []).forEach((r, i) => { const b = h('button', i === 0 ? 'active' : '', r.name); b.addEventListener('click', () => { sel = i; Array.from(tabs.children).forEach((x, k) => x.classList.toggle('active', k === i)); show(); }); tabs.appendChild(b); });
    function show() {
      const r = d.runs[sel]; body.textContent = ''; const g = h('div', 'bl-grid2'); body.appendChild(g);
      const left = h('div'); g.appendChild(left); const ask = h('p', 'sub'); ask.textContent = r.ask; left.appendChild(ask);
      const chat = h('div'); chat.style.cssText = 'border:1px solid #E5E9EE;border-radius:10px;overflow:hidden;font-size:13px';
      (r.messages || []).forEach(m => { const row = h('div'); row.style.cssText = `padding:8px 12px;border-bottom:1px solid #E5E9EE;${m.role === 'assistant' ? '' : 'background:#F6F8FA'}`; const who = h('div', null, `${m.role}${m.tools != null ? ` · ${m.tools} tool use${m.tools === 1 ? '' : 's'}` : ''}${m.at ? ' · ' + m.at : ''}`); who.style.cssText = `font-family:var(--mono);font-size:11px;color:${m.fail ? '#B0413F' : '#7C8794'};margin-bottom:2px;font-weight:${m.fail ? 700 : 500}`; row.appendChild(who); const t = h('div', null, m.text); t.style.cssText = m.fail ? 'color:#B0413F;font-weight:600' : ''; row.appendChild(t); chat.appendChild(row); });
      left.appendChild(chat);
      const end = h('p', null, r.end); end.style.cssText = 'margin:8px 0 0;font-size:13px;font-weight:600;color:#B0413F'; left.appendChild(end);
      const right = h('div'); g.appendChild(right);
      (r.screenshots || []).forEach(sc => { const f = h('figure', 'fig'); f.style.marginBottom = '8px'; const im = document.createElement('img'); im.src = sc.src; im.alt = sc.what; im.loading = 'lazy'; im.dataset.zoom = sc.src; im.style.cssText = 'width:100%;display:block;cursor:zoom-in'; f.appendChild(im); const c = h('figcaption', null, sc.what); c.style.cssText = 'font-size:12px;color:#7C8794;padding:6px 10px'; f.appendChild(c); right.appendChild(f); });
    }
    show();
  };

  /* CaP-Agent0: the generated program with the quoted lines, and the model's replies. */
  S['cap-code'] = function (box, d, ctx) {
    const { h } = ctx;
    const tabs = h('div', 'bl-case-tabs'); box.appendChild(tabs); const body = h('div'); box.appendChild(body); let sel = 0;
    (d.episodes || []).forEach((e, i) => { const b = h('button', i === 0 ? 'active' : '', e.name); b.addEventListener('click', () => { sel = i; Array.from(tabs.children).forEach((x, k) => x.classList.toggle('active', k === i)); show(); }); tabs.appendChild(b); });
    function show() {
      const e = d.episodes[sel]; body.textContent = ''; const g = h('div', 'bl-grid2'); body.appendChild(g);
      const left = h('div'); g.appendChild(left); const cap = h('p', 'sub'); cap.textContent = e.codeNote || 'The program the model wrote, as saved by the run. Rose: the lines the case study quotes.'; left.appendChild(cap);
      const pre = document.createElement('pre'); const hl = new Set(e.hl || []), hl2 = new Set(e.hl2 || []);
      (e.code || []).forEach((line, k) => { const n = k + 1; const ln = document.createElement('span'); ln.className = 'ln'; ln.textContent = String(n).padStart(3, ' '); pre.appendChild(ln); const sp = document.createElement('span'); if (hl.has(n)) sp.className = 'hl'; else if (hl2.has(n)) sp.className = 'hl2'; else if (/^\s*#/.test(line)) sp.className = 'cm'; sp.textContent = line; pre.appendChild(sp); pre.appendChild(document.createTextNode('\n')); });
      left.appendChild(pre);
      const right = h('div'); g.appendChild(right);
      const rn = h('p', 'sub'); rn.textContent = e.responsesNote || 'Model replies in order, from the saved responses.'; right.appendChild(rn);
      const list = h('div'); list.style.cssText = 'border:1px solid #E5E9EE;border-radius:10px;overflow:hidden;font-size:12.5px;max-height:300px;overflow-y:auto';
      (e.responses || []).forEach(r => { const row = h('div'); row.style.cssText = `padding:7px 10px;border-bottom:1px solid #E5E9EE;${r.finish ? 'background:#FCEEEE' : ''}`; const who = h('div', 'mono', r.who); who.style.cssText = `font-size:11px;color:${r.finish ? '#B0413F' : '#7C8794'};margin-bottom:2px`; row.appendChild(who); row.appendChild(h('div', null, r.text)); list.appendChild(row); });
      right.appendChild(list);
      if (e.blocks && e.blocks.length) { const bt = h('div'); bt.style.marginTop = '10px'; e.blocks.forEach(b => { const r = h('div', 'card'); r.style.cssText = 'padding:8px 12px;margin-bottom:6px;font-size:12.5px'; r.appendChild(h('div', 'mono', b.name)); r.firstChild.style.cssText = 'font-size:11px;color:#7C8794'; const o = h('div', null, b.text); if (b.fail) o.style.color = '#B0413F'; r.appendChild(o); bt.appendChild(r); }); right.appendChild(bt); }
    }
    show();
  };
})();
