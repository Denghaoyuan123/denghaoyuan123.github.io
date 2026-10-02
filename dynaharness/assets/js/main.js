/* Page logic: reveal, nav, latching demo, paradigms, architecture, episode
   scrubber, evolution, results, baselines, lightbox, bibtex. Data in data.js. */
(function () {
  const D = window.DH, Ch = window.Charts;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const el = Ch.el, txt = Ch.txt;
  const IMG = 'assets/img/';
  function h(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- reveal & nav ---------- */
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.08 });
  $$('.reveal').forEach(e => io.observe(e));
  const nav = $('#nav'), hero = $('#hero');
  new IntersectionObserver(es => es.forEach(x => nav.classList.toggle('on-dark', x.isIntersecting)), { threshold: 0.02, rootMargin: '-60px 0px 0px 0px' }).observe(hero);

  /* ---------- stove-window latching demo ---------- */
  (function stove() {
    const box = $('#stove-svg'); if (!box) return;
    const period = $('#stove-period'), startIn = $('#stove-start'), latch = $('#stove-latch'), verdict = $('#stove-verdict'), pv = $('#stove-period-val'), sv = $('#stove-start-val');
    const W = 760, H = 170, L = 96, R = 20, STEPS = 120;
    const sx = st => L + (W - L - R) * st / STEPS;
    function draw() {
      const p = +period.value, s0 = +startIn.value, s1 = s0 + 11, on = latch.getAttribute('aria-checked') === 'true';
      pv.textContent = `${p} steps = ${(p / 20).toFixed(2)} s`; sv.textContent = `steps ${s0}–${s1} (0.55 s)`;
      box.textContent = '';
      const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, box);
      txt(s, L - 8, 38, 'predicate', { class: 'lbl', 'text-anchor': 'end' });
      txt(s, L - 8, 88, 'decisions', { class: 'lbl', 'text-anchor': 'end' });
      txt(s, L - 8, 130, 'verdict read', { class: 'lbl', 'text-anchor': 'end' });
      for (let st = 0; st <= STEPS; st += 20) { el('line', { x1: sx(st), y1: 14, x2: sx(st), y2: 142, class: 'grid' }, s); txt(s, sx(st), 158, `${st} (${(st / 20).toFixed(0)} s)`, { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10 }); }
      // predicate signal
      el('path', { d: `M${sx(0)} 46 L${sx(s0)} 46 L${sx(s0)} 22 L${sx(s1)} 22 L${sx(s1)} 46 L${sx(STEPS)} 46`, fill: 'none', stroke: Ch.C.dh, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, s);
      el('rect', { x: sx(s0), y: 20, width: sx(s1) - sx(s0), height: 28, fill: Ch.C.dh, opacity: 0.12 }, s);
      txt(s, (sx(s0) + sx(s1)) / 2, 16, 'true', { class: 'lbl', 'text-anchor': 'middle', 'font-size': 10 });
      // latch accumulation
      if (on) { el('path', { d: `M${sx(s0)} 46 L${sx(s0)} 34 L${sx(STEPS)} 34`, fill: 'none', stroke: Ch.C.amber, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, s); txt(s, sx(STEPS) - 4, 32, 'latched', { class: 'lbl', 'text-anchor': 'end', 'font-size': 10, fill: Ch.C.amber }); }
      // decisions
      let caught = null;
      for (let st = 0; st <= STEPS; st += p) {
        const inside = st >= s0 && st <= s1; const seen = on ? st >= s0 : inside;
        el('line', { x1: sx(st), y1: 70, x2: sx(st), y2: 96, stroke: seen ? Ch.C.dh : Ch.C.de, 'stroke-width': 2.5 }, s);
        el('circle', { cx: sx(st), cy: 128, r: 6, fill: seen ? Ch.C.dh : '#fff', stroke: seen ? Ch.C.dh : Ch.C.de, 'stroke-width': 2 }, s);
        if (seen && caught === null) caught = st;
      }
      if (caught !== null) { txt(s, sx(caught) + 10, 132, `success read at step ${caught}`, { class: 'val', 'font-size': 11 }); }
      verdict.textContent = '';
      const pill = h('span', 'pill ' + (caught !== null ? 'ok' : 'bad'), caught !== null ? `Caught${on ? ' (latched)' : ''}: the command ends at step ${caught}` : 'Missed: every decision reads false; the policy keeps acting and turns the knob back on');
      verdict.appendChild(pill);
      const note = h('span', 'small', on ? 'With latching, the interface accumulates the event between decisions; the fast brain reads it at its next tick.' : 'Without latching, only a decision that lands inside the 0.55 s window sees the success.');
      verdict.appendChild(note);
    }
    [period, startIn].forEach(i => i.addEventListener('input', draw));
    latch.addEventListener('click', () => { latch.setAttribute('aria-checked', latch.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); draw(); });
    draw();
  })();

  /* ---------- paradigms ---------- */
  (function paradigms() {
    const wrap = $('#paradigm-cards'), detail = $('#paradigm-detail'); if (!wrap) return;
    const icons = [
      // policy learning: demos and rewards change the weights of one network
      `<svg viewBox="0 0 200 96"><path d="M12 42 q13 -26 26 0 t26 0 t26 0" fill="none" stroke="#7A62B3" stroke-width="3" stroke-linecap="round"/><text x="52" y="66" text-anchor="middle" font-size="9" fill="#7C8794">demos &amp; rewards</text><path d="M104 42 l12 0 M112 37 l5 5 -5 5" fill="none" stroke="#A7AEB7" stroke-width="2" stroke-linecap="round"/><g fill="#7A62B3"><circle cx="138" cy="26" r="5.5"/><circle cx="138" cy="42" r="5.5"/><circle cx="138" cy="58" r="5.5"/><circle cx="168" cy="34" r="5.5"/><circle cx="168" cy="50" r="5.5"/></g><g stroke="#C9B6EA" stroke-width="2"><line x1="143" y1="26" x2="163" y2="34"/><line x1="143" y1="42" x2="163" y2="34"/><line x1="143" y1="42" x2="163" y2="50"/><line x1="143" y1="58" x2="163" y2="50"/></g><text x="153" y="80" text-anchor="middle" font-size="9" fill="#7C8794">weight updates</text></svg>`,
      // planner + frozen skills: a VLM decomposes, frozen skills execute
      `<svg viewBox="0 0 200 96"><ellipse cx="42" cy="40" rx="30" ry="20" fill="#FCEEEE" stroke="#D25A5E" stroke-width="2"/><text x="42" y="44" text-anchor="middle" font-size="12" fill="#B0413F" font-weight="700">VLM</text><text x="42" y="76" text-anchor="middle" font-size="9" fill="#7C8794">plans once</text><path d="M76 40 l14 0 M86 35 l5 5 -5 5" fill="none" stroke="#A7AEB7" stroke-width="2" stroke-linecap="round"/><rect x="100" y="16" width="90" height="48" rx="8" fill="none" stroke="#A7AEB7" stroke-width="2" stroke-dasharray="5 4"/><g fill="#5A8FD8"><rect x="110" y="30" width="18" height="18" rx="4"/><rect x="136" y="30" width="18" height="18" rx="4"/></g><text x="171" y="46" text-anchor="middle" font-size="18" fill="#5A8FD8">❄</text><text x="145" y="80" text-anchor="middle" font-size="9" fill="#7C8794">frozen skills / policy</text></svg>`,
      // failure -> skill update: a failed task motivates a new or repaired skill
      `<svg viewBox="0 0 200 96"><path d="M14 58 L32 24 L50 58 Z" fill="#FCEEEE" stroke="#D25A5E" stroke-width="2" stroke-linejoin="round"/><text x="32" y="53" text-anchor="middle" font-size="14" fill="#B0413F" font-weight="700">!</text><text x="32" y="78" text-anchor="middle" font-size="9" fill="#7C8794">failure</text><path d="M58 42 l12 0 M66 37 l5 5 -5 5" fill="none" stroke="#A7AEB7" stroke-width="2" stroke-linecap="round"/><rect x="80" y="26" width="30" height="34" rx="4" fill="#fff" stroke="#A7AEB7" stroke-width="2"/><line x1="87" y1="37" x2="103" y2="37" stroke="#A7AEB7" stroke-width="2"/><line x1="87" y1="45" x2="103" y2="45" stroke="#A7AEB7" stroke-width="2"/><circle cx="106" cy="54" r="7" fill="#fff" stroke="#7C8794" stroke-width="2"/><line x1="111" y1="59" x2="116" y2="64" stroke="#7C8794" stroke-width="2.5" stroke-linecap="round"/><text x="95" y="78" text-anchor="middle" font-size="9" fill="#7C8794">diagnose</text><path d="M124 42 l12 0 M132 37 l5 5 -5 5" fill="none" stroke="#A7AEB7" stroke-width="2" stroke-linecap="round"/><g><rect x="150" y="22" width="36" height="11" rx="3" fill="#5A8FD8"/><rect x="150" y="37" width="36" height="11" rx="3" fill="#5A8FD8"/><rect x="150" y="52" width="36" height="11" rx="3" fill="#E8964A"/><text x="192" y="61" text-anchor="middle" font-size="11" fill="#C4731F" font-weight="700">+</text></g><text x="168" y="78" text-anchor="middle" font-size="9" fill="#7C8794">update skill</text></svg>`,
      // DynaHarness: slow / fast / harness stack, and the evolution loop
      `<svg viewBox="0 0 200 96"><defs><marker id="pm4" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#1896A6"/></marker></defs><rect x="8" y="12" width="118" height="20" rx="6" fill="#FCEEEE" stroke="#D25A5E" stroke-width="1.8"/><text x="67" y="26" text-anchor="middle" font-size="10" fill="#B0413F" font-weight="700">slow brain · plans</text><rect x="8" y="38" width="118" height="20" rx="6" fill="#FEF3E6" stroke="#E8964A" stroke-width="1.8"/><text x="67" y="52" text-anchor="middle" font-size="10" fill="#C4731F" font-weight="700">fast brain · 2 Hz</text><rect x="8" y="64" width="118" height="20" rx="6" fill="#EAF6EE" stroke="#3E9D5F" stroke-width="1.8"/><text x="67" y="78" text-anchor="middle" font-size="10" fill="#2C7A48" font-weight="700">harness · contract</text><path d="M163 24 A24 24 0 1 1 142 60" fill="none" stroke="#1896A6" stroke-width="3" stroke-linecap="round" marker-end="url(#pm4)"/><text x="163" y="52" text-anchor="middle" font-size="9.5" fill="#117480" font-weight="700">evolve</text></svg>`,
    ];
    D.PARADIGMS.forEach((p, i) => {
      const c = h('div', 'paradigm reveal' + (p.dh ? ' dh' : '')); c.dataset.i = i;
      const ill = h('div', 'ill'); ill.innerHTML = icons[i]; c.appendChild(ill);
      c.appendChild(h('h4', null, p.name)); c.appendChild(h('p', 'sub', p.sub)); c.appendChild(h('p', 'line', p.line));
      c.addEventListener('click', () => select(i)); c.addEventListener('mouseenter', () => select(i));
      wrap.appendChild(c); io.observe(c);
    });
    function select(i) { $$('.paradigm', wrap).forEach((c, k) => c.classList.toggle('active', k === i)); detail.textContent = ''; const b = h('b', null, D.PARADIGMS[i].name + '. '); detail.appendChild(b); detail.appendChild(document.createTextNode(D.PARADIGMS[i].how)); }
    select(3);
  })();

  /* ---------- architecture: replica of the paper's Fig. 2 with animated edges ---------- */
  (function arch() {
    const box = $('#arch-svg'); if (!box) return;
    const W = 1000, H = 470;
    const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, box);
    const defs = el('defs', {}, s);
    const COL = { blue: '#4A8FD9', rose: '#D9727A', orange: '#E8964A', green: '#3E9D5F', slate: '#4B5563', teal: '#1896A6', ink: '#14202B', grey: '#6B7280' };
    Object.entries(COL).forEach(([k, c]) => { const m = el('marker', { id: 'ar-' + k, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: c }, m); });
    const T = (g, x, y, t, o) => txt(g, x, y, t, Object.assign({ 'font-size': 10, fill: COL.ink }, o || {}));
    const blocks = {};
    function panel(key, x, y, w, h, title, sub, c, bg) {
      const g = el('g', { class: 'blk' }, s); blocks[key] = g;
      el('rect', { x, y, width: w, height: h, rx: 10, fill: bg, stroke: c, 'stroke-width': 1.6, class: 'bg' }, g);
      el('path', { d: `M${x} ${y + 10} a10 10 0 0 1 10 -10 h${w - 20} a10 10 0 0 1 10 10 v16 h-${w} z`, fill: c }, g);
      T(g, x + 10, y + 18, title, { fill: '#fff', 'font-weight': 700, 'font-size': 12.5 });
      if (sub) T(g, x + w - 8, y + 18, sub, { fill: 'rgba(255,255,255,0.85)', 'font-size': 9.5, 'text-anchor': 'end' });
      g.addEventListener('click', () => show(key));
      return g;
    }
    function sbox(g, x, y, w, h, title, lines, c, bg, o) {
      o = o || {};
      el('rect', { x, y, width: w, height: h, rx: 6, fill: bg || '#fff', stroke: c, 'stroke-width': 1.2 }, g);
      if (title) T(g, x + 8, y + 14, title, { 'font-weight': 700, 'font-size': o.ts || 10.5, fill: o.tc || COL.ink });
      (lines || []).forEach((l, i) => T(g, x + 8, y + (title ? 28 : 14) + i * 12, l, { 'font-size': 9.5, fill: '#4A5563' }));
    }
    function pill(g, x, y, w, t, c, bg) { el('rect', { x, y, width: w, height: 18, rx: 9, fill: bg, stroke: c, 'stroke-width': 1 }, g); T(g, x + w / 2, y + 12.5, t, { 'text-anchor': 'middle', 'font-size': 9.5, fill: COL.ink }); }

    /* ---- Perception & Context ---- */
    let g = panel('perc', 6, 6, 296, 274, 'Perception & Context', 'observation · context', COL.blue, '#EAF3FC');
    sbox(g, 14, 36, 138, 84, 'Multi-view RGB', [], COL.blue, '#fff');
    el('image', { href: 'assets/img/fig/agent_frame.jpg', x: 20, y: 54, width: 60, height: 45, preserveAspectRatio: 'xMidYMid slice' }, g);
    el('image', { href: 'assets/img/fig/wrist_frame.jpg', x: 86, y: 54, width: 60, height: 45, preserveAspectRatio: 'xMidYMid slice' }, g);
    T(g, 50, 112, 'agent view', { 'font-size': 8.5, fill: '#7C8794', 'text-anchor': 'middle' }); T(g, 116, 112, 'wrist view', { 'font-size': 8.5, fill: '#7C8794', 'text-anchor': 'middle' });
    sbox(g, 14, 128, 138, 44, 'Robot State', ['[x y z rx ry rz gripper]'], COL.blue);
    sbox(g, 14, 180, 138, 52, 'Task Instruction', ['"put the mug into', 'the basket"'], COL.blue);
    sbox(g, 160, 36, 134, 30, 'Atomic Context Snapshot', [], COL.blue, '#D6E8FA', { ts: 10 });
    T(g, 168, 60, 'synchronized state', { 'font-size': 8.5, fill: '#4A5563' });
    [['Freshness & timestamps', 74], ['Scene / task epochs', 108], ['Execution history', 142], ['Torn flag · skew ≤ 650 ms', 176]].forEach(([t, y]) => sbox(g, 160, y, 134, 28, null, [t], COL.blue));
    T(g, 160, 222, 'Consumer-specific views', { 'font-size': 9.5, 'font-weight': 700 });
    pill(g, 160, 228, 62, 'scheduler', COL.blue, '#fff'); pill(g, 226, 228, 68, 'slow-brain', COL.blue, '#fff'); pill(g, 160, 250, 62, 'verifier', COL.blue, '#fff');

    /* ---- Slow Brain ---- */
    g = panel('slow', 348, 6, 200, 284, 'Slow Brain', 'semantic reasoning', COL.rose, '#FCEEEE');
    sbox(g, 356, 36, 184, 30, 'Qwen3-VL-4B', ['on demand · 913 ms median call'], COL.rose, '#F9DCDD', { ts: 10.5 });
    sbox(g, 356, 74, 184, 24, null, ['Task + images + history'], COL.rose);
    sbox(g, 356, 104, 184, 24, null, ['Semantic planning'], COL.rose);
    sbox(g, 356, 134, 184, 118, 'Structured Plan Advisory', [], COL.rose, '#FFF7F7');
    ['Step 1: locate the mug', 'Step 2: pick up the mug', 'Step 3: place it in the basket', '…'].forEach((t, i) => { el('rect', { x: 364, y: 156 + i * 22, width: 168, height: 18, rx: 4, fill: '#fff', stroke: '#E9C5C7' }, g); T(g, 372, 168.5 + i * 22, t, { 'font-size': 9.5, 'font-family': 'JetBrains Mono, monospace' }); });
    T(g, 448, 272, 'Proposes. Does not actuate.', { 'font-size': 9.5, 'font-weight': 700, 'text-anchor': 'middle', fill: '#B0413F' });

    /* ---- Dynamic Physical Harness ---- */
    g = panel('harness', 592, 6, 402, 284, 'Dynamic Physical Harness', 'governed physical execution', COL.green, '#EEF7F1');
    const fb = el('g', { class: 'blk' }, g); blocks.fast = fb; fb.addEventListener('click', e => { e.stopPropagation(); show('fast'); });
    el('rect', { x: 600, y: 36, width: 386, height: 112, rx: 8, fill: '#FEF3E6', stroke: COL.orange, 'stroke-width': 1.6, class: 'bg' }, fb);
    T(fb, 608, 52, '⚡ Fast Brain', { 'font-weight': 700, 'font-size': 12, fill: '#C4731F' }); T(fb, 700, 52, 'structured physical governance · 2 Hz · 0.046 ms', { 'font-size': 9.5, fill: '#4A5563' });
    [['1. Ground & Filter', ['skills to entities', 'skill & tool registry', 'capability mask'], 608], ['2. Verify', ['progress · stagnation', 'risk', 'task success, latched'], 736], ['3. Decide', ['continue · intervene', 'switch capability', 'escalate to slow brain'], 864]].forEach(([t, ls, x]) => sbox(fb, x, 60, 116, 80, t, ls, COL.orange, '#fff'));
    el('path', { d: 'M793 148 L793 166', stroke: COL.orange, 'stroke-width': 2, 'marker-end': 'url(#ar-orange)' }, g); T(g, 800, 162, 'dynamically selected capability', { 'font-size': 9, fill: '#C4731F', 'font-weight': 600 });
    const cb = el('g', { class: 'blk' }, g); blocks.contract = cb; cb.addEventListener('click', e => { e.stopPropagation(); show('contract'); });
    el('rect', { x: 600, y: 170, width: 386, height: 40, rx: 8, fill: '#fff', stroke: COL.green, 'stroke-width': 1.6, class: 'bg' }, cb);
    T(cb, 608, 186, 'Physical Execution Contract', { 'font-weight': 700, 'font-size': 11.5, fill: '#2C7A48' }); T(cb, 770, 186, 'grounded · bounded · verifiable · attributable', { 'font-size': 9.5, fill: '#4A5563' });
    T(cb, 608, 202, 'no robot-facing command bypasses the harness', { 'font-size': 9.5, fill: '#4A5563' });
    const kb = el('g', { class: 'blk' }, g); blocks.caps = kb; kb.addEventListener('click', e => { e.stopPropagation(); show('caps'); });
    sbox(kb, 600, 218, 188, 30, 'Analytic Skills', ['geometry-based, deterministic'], COL.green, '#fff', { tc: '#2C7A48' });
    sbox(kb, 798, 218, 188, 30, 'Frozen VLA · π0.5', ['one callable capability'], COL.blue, '#fff', { tc: '#2F6CB3' });
    sbox(kb, 600, 254, 188, 30, 'Execution Monitoring', ['progress · stagnation · verdict'], COL.green, '#fff', { tc: '#2C7A48' });
    sbox(kb, 798, 254, 188, 30, 'Recovery Skills', ['regrasp · re-seat · keyframe'], COL.blue, '#fff', { tc: '#2F6CB3' });

    /* ---- Environment ---- */
    g = panel('env', 6, 312, 140, 152, 'Environment', '', COL.slate, '#F0F2F4');
    el('image', { href: 'assets/img/fig/agent_frame.jpg', x: 14, y: 340, width: 124, height: 93, preserveAspectRatio: 'xMidYMid slice' }, g);
    T(g, 76, 452, '20 Hz control · 50 Hz safety', { 'font-size': 8.5, fill: '#4A5563', 'text-anchor': 'middle' });

    /* ---- Self-Evolution ---- */
    g = panel('evo', 170, 350, 824, 114, 'Attribution-Driven Self-Evolution', 'improvement from execution evidence', COL.orange, '#FEF3E6');
    const chain = [['Execution', 'Evidence', COL.slate], ['Failure', 'Localization', '#7A62B3'], ['Targeted', 'Candidate', '#7A62B3'], ['Paired', 'Validation', '#7A62B3'], ['Validated', 'Update', COL.green]];
    chain.forEach(([a, b, c], i) => { const x = 180 + i * 163; el('rect', { x, y: 384, width: 140, height: 40, rx: 8, fill: '#fff', stroke: c, 'stroke-width': 1.4 }, g); T(g, x + 70, 401, a, { 'text-anchor': 'middle', 'font-weight': 700, fill: c === COL.slate ? COL.ink : c }); T(g, x + 70, 415, b, { 'text-anchor': 'middle', 'font-weight': 700, fill: c === COL.slate ? COL.ink : c }); if (i < 4) el('path', { d: `M${x + 142} 404 L${x + 161} 404`, stroke: COL.grey, 'stroke-width': 1.8, 'marker-end': 'url(#ar-grey)' }, g); });
    T(g, 582, 452, 'multi-layer attribution (earliest of 13 layers)   |   paired gate can reject harmful changes   |   offline, no online weight updates', { 'font-size': 9, fill: '#7C8794', 'text-anchor': 'middle' });

    /* ---- edges ---- */
    const edges = [
      { d: 'M302 90 L348 90', c: 'blue', lbl: ['Context', 'View'], lx: 325, ly: 70, dur: 2.0 },
      { d: 'M302 236 L348 236', c: 'ink', lbl: ['Current', 'State'], lx: 325, ly: 216, dur: 2.4 },
      { d: 'M548 90 L592 90', c: 'rose', lbl: ['Plan', 'Advisory'], lx: 570, ly: 70, dur: 1.6 },
      { d: 'M592 236 L548 236', c: 'orange', lbl: ['Replan', 'if needed'], lx: 570, ly: 216, dur: 2.2, dash: true },
      { d: 'M250 280 L250 306 L700 306 L700 290', c: 'blue', lbl: ['Execution View'], lx: 470, ly: 300, dur: 3.0 },
      { d: 'M620 290 L620 332 L146 332', c: 'green', lbl: ['Updated env & execution states'], lx: 380, ly: 344, dur: 3.0 },
      { d: 'M76 312 L76 280', c: 'grey', lbl: [], dur: 1.2 },
      { d: 'M146 404 L170 404', c: 'grey', lbl: [], dur: 1.2 },
      { d: 'M840 290 L840 350', c: 'green', lbl: ['Evidence'], lx: 862, ly: 324, dur: 1.6 },
      { d: 'M940 350 L940 290', c: 'teal', lbl: ['Improved', 'capability'], lx: 965, ly: 318, dur: 1.6 },
    ];
    const labels = [];
    edges.forEach(e => {
      el('path', { d: e.d, class: 'edge', stroke: COL[e.c], 'marker-end': `url(#ar-${e.c})`, 'stroke-dasharray': e.dash ? '6 5' : '', opacity: 0.9, fill: 'none' }, s);
      const p = el('circle', { class: 'particle', r: 3.5, fill: COL[e.c] }, s); el('animateMotion', { dur: e.dur + 's', repeatCount: 'indefinite', path: e.d }, p);
      if (e.lbl.length) labels.push(e);
    });
    labels.forEach(e => {
      const g2 = el('g', {}, s); const ts = e.lbl.map((l, i) => txt(g2, e.lx, e.ly + i * 11, l, { 'font-size': 9.5, fill: COL[e.c] === COL.ink ? '#4A5563' : COL[e.c], 'font-weight': 600, 'text-anchor': 'middle' }));
      const bb = g2.getBBox(); const r = el('rect', { x: bb.x - 3, y: bb.y - 2, width: bb.width + 6, height: bb.height + 4, rx: 3, fill: '#fff', opacity: 0.9 }); g2.insertBefore(r, g2.firstChild);
    });

    const DETAIL = {
      perc: ['Perception and context', 'Two camera views, the end-effector pose, gripper state and finger contact form the observation. An atomic context snapshot with timestamps and scene and task epochs is projected into consumer-specific views: the slow brain sees images, instruction and history; the scheduler sees a compact feature vector; the verifier sees only allowed signals.', ''],
      slow: ['Slow brain: semantic reasoning', 'Qwen3-VL-4B, called on demand (5.35 calls per episode), reads the snapshot and returns a structured advisory that names a capability from the library and symbolic arguments, but no poses. It proposes; it does not actuate. Replacing it with Claude Sonnet 5 through a coding agent gives 80% against 75% over 40 episodes at 5.9× the latency and 18× the prompt tokens.', 'c_j = \\Phi(\\ell, S, o_t, h_j), \\quad z_j = \\Pi(c_j) = (m_j, \\alpha_j),\\ m_j \\in \\mathcal{L}'],
      fast: ['Fast brain: physical governance', 'Runs deterministically at 2 Hz and holds execution authority. Ground: an advised step becomes a command only if its parameters and preconditions resolve; otherwise a refusal with its reason is returned. Verify: progress, stagnation and risk, plus a latched task verdict accumulated between decisions. Decide: continue, invoke recovery, switch capability or vla_act, or request a replan.', '\\gamma_k = G(z_j, c_j) \\in \\Gamma \\cup \\{\\bot\\},\\quad \\gamma = (m, \\theta, B, \\tau); \\qquad v_k = v_{k-1} \\vee \\bigvee_{t \\in \\mathcal{T}_k} b_t'],
      harness: ['Dynamic physical harness', 'The harness grounds commands, checks admissibility, enforces budgets and leases, routes capabilities, monitors execution, coordinates recovery and records evidence. Its fast brain governs the running command and its execution contract admits every robot-facing command. Control steps run at 20 Hz, fast-brain decisions at 2 Hz, plan steps on demand.', ''],
      contract: ['Physical execution contract', 'Grounded: it enters the world only once grounding resolves it. Bounded: it acts only while budget remains, the lease holds and a 50 Hz safety check passes; a capability that cannot afford its own completion refuses before it starts. Verifiable: it ends on a recorded local status, the latched verdict, budget or lease. Attributable: every observation, decision, outcome and reason is appended to an evidence store, including refusals with no dispatched action.', ''],
      caps: ['Capability execution', 'Analytic skills are geometric and deterministic and cover approach, guarded descent, transport and placement; recovery skills return to a verified keyframe, re-seat or release and retreat; vla_act calls the frozen π0.5 for contact whose dynamics the geometry does not determine. All spend the same budget under the same lease and share the verdict interface. Of 770 archived control episodes, 570 never invoke the VLA, with 96.7% success.', 'a_t = T_m(\\theta, o_t)\\ \\text{(analytic / recovery)},\\qquad a_t = \\pi(o_t, \\ell)\\ \\text{(vla\\_act)}'],
      env: ['Environment and the robot seam', 'The harness issues bounded, verifiable commands and does not run a servo loop; 100 to 1000 Hz control belongs to the robot controller. An envelope, lease and budget check runs at 50 Hz underneath both brains. Simulated, MuJoCo workcell and remote adapters sit behind one execution interface; on hardware, scene information comes from RealSense cameras with SAM3 segmentation.', ''],
      evo: ['Attribution-driven self-evolution', 'For a failed episode the diagnostic procedure returns the earliest of 13 ordered layers whose check fails: infrastructure, context, planning, grounding, dispatch, capability execution, verification, recovery. The attributed signature directs fault reproduction and a targeted revision stated in physical quantities (a hinge radius, a hand span), never keyed to a task. A paired gate on the same tasks and seeds, followed by broader regression checks, decides admission; a rejected change is reverted, not patched over.', '\\lambda_i = A_N(E_i) = \\min\\{j : d_j(E_i) = 1\\};\\quad \\sum_d s_d(\\mathcal{L}\') \\ge \\sum_d s_d(\\mathcal{L}),\\ \\sum_d u_d(\\mathcal{L}\') \\le \\sum_d u_d(\\mathcal{L}),\\ s_d(\\mathcal{L}\') \\ge s_d(\\mathcal{L})\\ \\forall d \\in \\mathcal{D}_\\pi,\\ x(\\mathcal{L}\') = 0'],
    };
    const SW = { perc: COL.blue, slow: COL.rose, fast: COL.orange, harness: COL.green, contract: COL.green, caps: COL.green, env: COL.slate, evo: COL.orange };
    const title = $('#arch-detail-title'), text = $('#arch-detail-text'), eq = $('#arch-detail-eq');
    function show(k) { Object.entries(blocks).forEach(([kk, g]) => g.classList.toggle('active', kk === k)); const d = DETAIL[k]; title.textContent = ''; const sw = h('span', 'sw'); sw.style.background = SW[k]; title.appendChild(sw); title.appendChild(document.createTextNode(d[0])); text.textContent = d[1]; eq.textContent = d[2] ? '\\(' + d[2] + '\\)' : ''; eq.style.display = d[2] ? '' : 'none'; if (window.renderMathInElement && d[2]) renderMathInElement(eq, { delimiters: [{ left: '\\(', right: '\\)', display: false }], throwOnError: false }); }
    show('fast');
  })();

  /* ---------- episode scrubber ---------- */
  (function cases() {
    const tabs = $('#case-tabs'), box = $('#scrub'); if (!tabs || !box) return;
    let cur = 0;
    D.CASES.forEach((c, i) => { const b = h('button', i === 0 ? 'active' : '', `${c.cell} · seed ${c.seed}`); b.addEventListener('click', () => { cur = i; $$('button', tabs).forEach((x, k) => x.classList.toggle('active', k === i)); render(); }); tabs.appendChild(b); });
    function render() {
      const c = D.CASES[cur]; box.textContent = '';
      const head = h('div', 'head'); head.appendChild(h('h4', null, c.title)); head.appendChild(h('span', 'meta', `${c.cell} · seed ${c.seed} · "${c.instr}" · budget ${c.budget} steps`)); box.appendChild(head);
      const body = h('div', 'body'); box.appendChild(body);
      const frames = h('div', 'frames'); body.appendChild(frames);
      const big = h('div', 'big');
      const fa = h('figure', 'dh'); const ia = h('img'); ia.alt = 'DynaHarness frame'; fa.appendChild(ia); fa.appendChild(h('figcaption', null, 'DynaHarness')); big.appendChild(fa);
      const fb = h('figure', 'fz'); const ib = h('img'); ib.alt = 'Frozen policy frame'; fb.appendChild(ib); fb.appendChild(h('figcaption', null, 'frozen π0.5 · new rollout, same seed')); big.appendChild(fb);
      frames.appendChild(big);
      // recorded rollouts, when the files exist: one frame per environment step, so time = step / fps
      const V = []; const fps = (c.video && c.video.fps) || 20; let sweep = null;
      if (c.video) [[fa, c.video.ours], [fb, c.video.frozen]].forEach(([fig, src]) => { const v = document.createElement('video'); v.src = src; v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.loop = false; v.addEventListener('loadedmetadata', () => { fig.classList.add('has-video'); if (V.every(x => x.readyState >= 1)) { sl.classList.add('has-video'); if (sweep) { clearInterval(sweep); sweep = null; playB.click(); } } }); fig.insertBefore(v, fig.firstChild); V.push(v); });
      const vidReady = () => V.length === 2 && V.every(v => v.readyState >= 1);
      const mkStrip = (prefix, who, cls, fail) => {
        const row = h('div', 'frame-row'); row.appendChild(h('div', 'who ' + cls, who)); const strip = h('div', 'strip ' + (cls === 'dh' ? '' : 'frozen'));
        c.frames.forEach(([st, lbl], k) => { const f = h('figure'); const im = h('img'); im.src = `${IMG}cases/${prefix}_f${k + 1}.jpg`; im.alt = `${who} step ${st}`; im.loading = 'lazy'; f.appendChild(im); f.appendChild(h('figcaption', null, cls === 'dh' ? `${lbl}, ${st}` : (k === c.frames.length - 1 ? `${st}: ${fail}` : String(st)))); f.dataset.k = k; f.addEventListener('click', () => { slider.value = st; update(); }); strip.appendChild(f); });
        row.appendChild(strip); return row;
      };
      const rowA = mkStrip(c.ours, 'DynaHarness', 'dh'); frames.appendChild(rowA);
      const rowB = mkStrip(c.frozen, 'frozen π0.5', 'fz', 'budget spent'); frames.appendChild(rowB);
      const sl = h('div', 'slider'); sl.appendChild(h('span', null, 'step 0')); const slider = h('input'); slider.type = 'range'; slider.min = 0; slider.max = c.budget; slider.value = 0; slider.step = 1; sl.appendChild(slider); const sval = h('span', null, '0'); sl.appendChild(sval);
      const playB = h('button', 'play', '▶ Play'); sl.appendChild(playB); frames.appendChild(sl);
      const seekVideos = v => { if (!vidReady()) return; V.forEach(x => { if (Math.abs(x.currentTime - v / fps) > 0.06) { try { x.currentTime = v / fps; } catch (e) { } } }); };
      playB.addEventListener('click', () => { if (!vidReady()) return; if (V[0].paused) { if (V[0].ended || +slider.value >= c.steps) { slider.value = 0; seekVideos(0); } V.forEach(x => x.play().catch(() => { })); playB.textContent = '❚❚ Pause'; } else { V.forEach(x => x.pause()); playB.textContent = '▶ Play'; } });
      if (c.video) { V[0].addEventListener('timeupdate', () => { if (V[0].paused) return; const st = Math.min(c.budget, Math.round(V[0].currentTime * fps)); slider.value = st; update(false); if (Math.abs(V[1].currentTime - V[0].currentTime) > 0.35 && !V[1].seeking) V[1].currentTime = V[0].currentTime; }); V[0].addEventListener('ended', () => { V.forEach(x => x.pause()); playB.textContent = '↻ Replay'; }); }
      const bud = h('div', 'budget'); const bi = h('i'); bud.appendChild(bi); frames.appendChild(bud);
      const bl = h('div', 'budget-lbl'); const blA = h('span', null, ''); const blB = h('span', null, `${c.decisions} fast-brain decisions · success in ${c.steps} of ${c.budget} steps`); bl.append(blA, blB); frames.appendChild(bl);
      const log = h('div', 'log'); log.appendChild(h('h5', null, 'Evidence store')); const ol = h('ol');
      c.log.forEach(([st, who, t]) => { const li = h('li'); li.dataset.st = st; li.appendChild(h('span', 'st', `step ${st}`)); const d = h('div'); const w = h('span', 'who ' + (who === 'slow brain' ? 'slow' : who === 'fast brain' ? 'fast' : who), who); d.appendChild(w); d.appendChild(document.createTextNode(t)); li.appendChild(d); ol.appendChild(li); });
      log.appendChild(ol); log.appendChild(h('div', 'effect', c.effect)); body.appendChild(log);
      function update(fromUser) {
        const v = +slider.value; sval.textContent = String(v); blA.textContent = `budget used ${Math.round(100 * v / c.budget)}%`; bi.style.width = (100 * Math.min(v, c.steps) / c.budget) + '%';
        if (fromUser !== false && vidReady()) { if (!V[0].paused) { V.forEach(x => x.pause()); playB.textContent = '▶ Play'; } seekVideos(v); }
        let k = 0; c.frames.forEach(([st], i) => { if (st <= v) k = i; });
        ia.src = `${IMG}cases/${c.ours}_f${k + 1}.jpg`; ib.src = `${IMG}cases/${c.frozen}_f${k + 1}.jpg`;
        $$('.strip figure', frames).forEach(f => f.classList.toggle('cur', +f.dataset.k === k));
        $$('.strip:not(.frozen) figure', frames).forEach(f => f.classList.toggle('ok', +f.dataset.k === c.frames.length - 1 && k === c.frames.length - 1));
        $$('.strip.frozen figure', frames).forEach(f => f.classList.toggle('fail', +f.dataset.k === c.frames.length - 1 && k === c.frames.length - 1));
        let last = null; $$('li', ol).forEach(li => { const on = +li.dataset.st <= v; li.classList.toggle('on', on); if (on) last = li; li.classList.remove('cur'); }); if (last) last.classList.add('cur');
        document.dispatchEvent(new CustomEvent('dh-scrub', { detail: { id: c.id, step: v } }));
      }
      slider.addEventListener('input', () => update(true)); update(false);
      // autoplay once when scrolled into view: the recorded videos if they loaded, else a sweep over the keyframes
      let played = false; const auto = new IntersectionObserver(es => { es.forEach(x => { if (x.isIntersecting && !played) { played = true; if (vidReady()) { playB.click(); return; } let v = 0; sweep = setInterval(() => { v += Math.max(2, c.budget / 150); if (v >= c.steps) { v = c.steps; clearInterval(sweep); sweep = null; } slider.value = v; update(false); }, 40); } }); }, { threshold: 0.3 }); auto.observe(box);
    }
    render();
  })();


  /* ---------- evidence-store explorer (goal_swap[5], seed 22; all 1,999 rows) ---------- */
  (function evidenceStore() {
    const box = $('#evs'); if (!box) return;
    const LANE = { plan: ['plan', '#7A62B3'], slow: ['slow brain', '#C9503F'], fast: ['fast brain', '#B8741F'], skill: ['skills & tools', '#0E93A6'], verify: ['verifier', '#3F79C9'], scene: ['scene · lease', '#6B7280'], house: ['housekeeping', '#A7AEB7'] };
    const laneOf = y => y.startsWith('plan.') ? 'plan' : y.startsWith('slow_brain') ? 'slow' : y === 'scheduler.decision' ? 'fast' : (y.startsWith('skill.') || y.startsWith('tool.') || y === 'capabilities.mounted') ? 'skill' : y.startsWith('verifier') ? 'verify' : (y.startsWith('scene') || y.startsWith('lease') || y.startsWith('episode') || y.startsWith('run.') || y.startsWith('checkpoint')) ? 'scene' : 'house';
    const on = { plan: true, slow: true, fast: true, skill: true, verify: true, scene: true, house: false };
    const j = (o, n) => { try { const s = JSON.stringify(o); return s.length > n ? s.slice(0, n - 1) + '…' : s; } catch (e) { return ''; } };
    const args = a => a ? Object.entries(a).map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`).join(', ') : '';
    function summary(r) {
      const p = r.p || {}, y = r.y;
      switch (y) {
        case 'checkpoint.registered': return `${p.kind} checkpoint ${p.name} v${p.version} ${p.status}`;
        case 'capabilities.mounted': return `${(p.declared || []).length} capabilities mounted: ${(p.declared || []).join(', ')}`;
        case 'run.started': return `run started · profile ${p.profile} · mode ${p.mode} · ${p.fidelity}`;
        case 'episode.started': return `episode started: "${p.task && p.task.instruction}" (${p.task && p.task.task_id})`;
        case 'episode.completed': return `episode completed · success ${p.success} · ${p.ticks} ticks · ${p.duration_s} s · ${p.reason}`;
        case 'plan.requested': return `plan requested · trigger ${p.trigger}${p.detail ? ' · ' + p.detail : ''}`;
        case 'slow_brain.requested': return `slow brain called (${p.model}) · trigger ${p.trigger} · scene epoch ${p.scene_epoch}`;
        case 'slow_brain.completed': { const d = p.decision || {}; const st = (d.proposed_plan || []).map(s => (s.skill_candidates || []).map(c => `${c.capability_id}(${args(c.arguments)})`).join(' | ')).join(' → '); return `advisory in ${Math.round(p.latency_ms)} ms · ${d.diagnosis} · plan: ${st} · confidence ${d.confidence}`; }
        case 'plan.grounded': return `grounded${p.fully_resolved ? ', fully resolved' : ''}: ${(p.steps || []).map(s => `${s.capability_id} (${s.grounding_status})${s.description ? ' · ' + s.description : ''}`).join('; ')}`;
        case 'plan.step.started': return `step ${p.capability_id}(${args(p.arguments)}) · entities ${(p.entity_refs || []).map(e => `${e.entity_id}:${(e.affordances || []).join('/')}`).join(', ')}`;
        case 'plan.step.failed': return `step ${p.capability_id} failed: ${(p.plan && p.plan.active_step && p.plan.active_step.detail) || p.termination_reason}`;
        case 'plan.step.completed': return `step ${p.capability_id} completed · ${j(p.output, 120)}`;
        case 'skill.started': return `skill ${p.skill_id} v${p.version} started · tools ${(p.allowed_tools || []).join(', ')}`;
        case 'skill.step': return `${p.skill_id} · stage ${p.index}: ${p.label}${p.source ? ' (' + p.source + ')' : ''}`;
        case 'skill.failed': return `skill ${p.skill_id} failed after ${p.steps} stages: ${p.error}`;
        case 'skill.completed': return `skill ${p.skill_id} completed · ${p.steps} stages · ${Math.round(p.duration_ms)} ms · ${j(p.output, 140)}`;
        case 'tool.requested': return `${p.tool_id}(${args(p.args)}) · ${p.effects}`;
        case 'tool.completed': { const o = p.output || {}; return `${p.tool_id} ok · ${o.detail || j(o, 110)} · ${(p.metrics && p.metrics.env_steps) || 0} env steps · ${Math.round(p.duration_ms)} ms`; }
        case 'tool.failed': return `${p.tool_id} failed: ${p.error}`;
        case 'scheduler.decision': { const alt = Object.entries(p.scores || {}).filter(([k]) => k !== p.action_key).map(([k, v]) => `${k} ${(+v).toFixed(2)}`).slice(0, 3).join(', '); return `tick: ${p.action_key} · confidence ${(+p.confidence).toFixed(3)}${alt ? ' · alternatives ' + alt : ''}`; }
        case 'scheduler.masked': return `${p.capability_id} masked: ${p.reason}${p.detail ? ' · ' + p.detail : ''}`;
        case 'verifier.updated': return `progress ${p.progress} · risk ${p.risk} · success ${p.success === null ? 'null' : p.success}${p.stagnation ? ' · stagnation' : ''}`;
        case 'verifier.stagnation': return `stagnation: ${p.failure_type} · risk ${p.risk} at progress ${p.progress}`;
        case 'scene.mutated': return `scene epoch ${p.scene_epoch} after ${p.source} (${p.cause})`;
        case 'lease.acquired': return `lease for ${p.skill_id} · max ${p.max_duration_s} s · ${p.role}`;
        case 'lease.released': return `lease released · ${p.skill_id} · ${p.termination_reason} · ${p.duration_steps} ticks`;
        case 'lease.continued': return `lease continued · ${p.elapsed_s != null ? p.elapsed_s.toFixed ? p.elapsed_s.toFixed(1) + ' s' : p.elapsed_s : ''}`;
        case 'observation.received': return `observation · cameras ${JSON.stringify(p.cameras || Object.keys(p))}`;
        case 'context.updated': return `atomic context snapshot`;
        default: return j(p, 140);
      }
    }
    const src = box.dataset.src;
    fetch(src).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(build).catch(() => {
      box.textContent = ''; const d = h('div', 'foot'); d.appendChild(h('span', null, 'The full event store loads when the page is served over HTTP (python3 -m http.server in the website folder).')); box.appendChild(d);
    });
    function build(rows) {
      box.textContent = '';
      rows.forEach(r => { r.l = laneOf(r.y); r.s = summary(r); });
      const T = rows[rows.length - 1].t, N = rows.length;
      const ticks = rows.filter(r => r.y === 'scheduler.decision').length, calls = rows.filter(r => r.y === 'slow_brain.completed');
      // header
      const head = h('div', 'head'); const hl = h('div');
      hl.appendChild(h('h4', null, 'The evidence store of this episode, row by row'));
      hl.appendChild(h('div', 'meta', `${N.toLocaleString()} rows · ${ticks} fast-brain ticks · ${calls.length} slow-brain calls (${calls.map(c => Math.round(c.p.latency_ms)).join(' / ')} ms) · ${rows[N - 1].e} environment steps · ${T.toFixed(1)} s wall time`));
      const chips = h('div', 'chips'); const counts = {}; rows.forEach(r => counts[r.l] = (counts[r.l] || 0) + 1);
      Object.entries(LANE).forEach(([k, [name, col]]) => { const b = h('button', on[k] ? 'on' : ''); b.style.setProperty('--c', col); const i = h('i'); b.appendChild(i); b.appendChild(document.createTextNode(`${name} ${counts[k] || 0}`)); b.addEventListener('click', () => { on[k] = !on[k]; b.classList.toggle('on', on[k]); renderList(); }); chips.appendChild(b); });
      hl.appendChild(chips); head.appendChild(hl);
      const vb = h('div', 'vid'); const v = document.createElement('video'); v.src = 'assets/video/ui_evidence_store.mp4'; v.poster = 'assets/video/ui_evidence_store_poster.jpg'; v.muted = true; v.loop = true; v.playsInline = true; v.controls = true; v.preload = 'none'; vb.appendChild(v); vb.appendChild(h('span', 'badge', 'rendered scroll, 40 s')); head.appendChild(vb);
      box.appendChild(head);
      // timeline
      const tl = h('div', 'tl'); box.appendChild(tl);
      const W = 960, H = 214, L = 96, R = 18, sx = t => L + (W - L - R) * t / T;
      const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, tl);
      const lanes = [['slow', 34], ['fast', 64], ['skill', 96], ['verify', 150]];
      lanes.forEach(([k, y]) => { txt(s, L - 10, y + 4, LANE[k][0], { class: 'lane', 'text-anchor': 'end' }); el('line', { x1: L, y1: y + 14, x2: W - R, y2: y + 14, class: 'grid' }, s); });
      for (let t = 0; t <= T; t += 5) { el('line', { x1: sx(t), y1: 18, x2: sx(t), y2: H - 26, class: 'grid' }, s); txt(s, sx(t), H - 12, `${t} s`, { 'text-anchor': 'middle' }); }
      // env-step ticks (top axis) from tool completions
      let lastE = -1, lastX = -99; rows.filter(r => r.y === 'tool.completed' || r.y === 'tool.failed').forEach(r => { if (r.e !== lastE) { lastE = r.e; const x = sx(r.t); el('line', { x1: x, y1: 8, x2: x, y2: 16, stroke: '#7C8794' }, s); if (x - lastX > 22) { txt(s, x, 6, String(r.e), { 'text-anchor': 'middle', 'font-size': 9.5 }); lastX = x; } } });
      txt(s, L - 10, 10, 'env step', { 'text-anchor': 'end', 'font-size': 9.5 });
      const cursor = el('line', { x1: sx(0), y1: 18, x2: sx(0), y2: H - 26, class: 'cursor', opacity: 0 }, s);
      const go = r => { r.forceShow = true; if (!on[r.l]) { on[r.l] = true; $$('.chips button', box).forEach(b => { if (b.textContent.startsWith(LANE[r.l][0])) b.classList.add('on'); }); } renderList(r.q); };
      const mark = (elm, r) => { elm.classList.add('mark'); elm.addEventListener('click', () => go(r)); const t = el('title', {}, elm); t.textContent = `${r.q} · ${r.t.toFixed(2)} s · ${r.s}`; };
      // slow-brain calls
      rows.filter(r => r.y === 'slow_brain.requested').forEach(r => { const done = rows.find(x => x.y === 'slow_brain.completed' && x.q > r.q); const x0 = sx(r.t), x1 = done ? sx(done.t) : x0 + 2; const g = el('g', {}, s); el('rect', { x: x0, y: 26, width: Math.max(3, x1 - x0), height: 16, rx: 3, fill: LANE.slow[1] }, g); txt(g, x1 + 4, 38, `${Math.round(done.p.latency_ms)} ms · ${r.p.trigger}`, { 'font-size': 10 }); mark(g, done || r); });
      // fast-brain ticks
      rows.filter(r => r.y === 'scheduler.decision').forEach(r => { const g = el('rect', { x: sx(r.t) - 1.5, y: 58, width: 3, height: 16, rx: 1, fill: LANE.fast[1] }, s); mark(g, r); });
      // skills
      rows.filter(r => r.y === 'skill.started').forEach(r => { const end = rows.find(x => (x.y === 'skill.failed' || x.y === 'skill.completed') && x.q > r.q); const x0 = sx(r.t), x1 = end ? sx(end.t) : W - R; const ok = end && end.y === 'skill.completed'; const g = el('g', {}, s); el('rect', { x: x0, y: 86, width: Math.max(4, x1 - x0), height: 22, rx: 4, fill: ok ? LANE.skill[1] : '#fff', stroke: ok ? 'none' : LANE.slow[1], 'stroke-width': 1.5, 'stroke-dasharray': ok ? 'none' : '4 2' }, g); const lbl = `${r.p.skill_id}${end ? (ok ? '' : ' ✕') : ''}`; if (x1 - x0 > 60) txt(g, x0 + 6, 101, lbl, { class: ok ? 'in' : '', fill: ok ? '#fff' : LANE.slow[1], 'font-size': 10.5, 'font-weight': 600 }); else txt(g, x1 + 4, 101, lbl, { 'font-size': 10, fill: LANE.slow[1] }); mark(g, end || r); });
      // tools as ticks below the skills
      rows.filter(r => r.y === 'tool.requested').forEach(r => { const end = rows.find(x => (x.y === 'tool.completed' || x.y === 'tool.failed') && x.p.call_id === r.p.call_id); const x0 = sx(r.t), x1 = end ? sx(end.t) : x0 + 2; const fail = end && end.y === 'tool.failed'; const g = el('rect', { x: x0, y: 112, width: Math.max(2.5, x1 - x0), height: 7, rx: 1, fill: fail ? LANE.slow[1] : '#7DC4CE' }, s); mark(g, end || r); });
      txt(s, L - 10, 120, 'tools', { 'text-anchor': 'end', 'font-size': 10 });
      // verifier progress
      const vs = rows.filter(r => r.y === 'verifier.updated'); let d = ''; let prev = null; vs.forEach(r => { const x = sx(r.t), y = 164 - 28 * (+r.p.progress || 0); d += (prev == null ? `M${x} ${y}` : ` L${x} ${prev} L${x} ${y}`); prev = y; }); d += ` L${sx(T)} ${prev}`; el('path', { d, fill: 'none', stroke: LANE.verify[1], 'stroke-width': 2 }, s);
      txt(s, W - R, 133, 'progress 1.0', { 'text-anchor': 'end', 'font-size': 9.5 }); txt(s, W - R, 170, '0', { 'text-anchor': 'end', 'font-size': 9.5 });
      const latched = vs.find(r => r.p.success === true); if (latched) { const x = sx(latched.t); el('line', { x1: x, y1: 18, x2: x, y2: H - 26, stroke: LANE.verify[1], 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }, s); const g = el('g', {}, s); el('rect', { x: x - 84, y: 178, width: 168, height: 16, rx: 8, fill: LANE.verify[1] }, g); txt(g, x, 189.5, `verdict latched · env step ${latched.e}`, { 'text-anchor': 'middle', class: 'in', 'font-size': 10 }); mark(g, latched); }
      const refused = rows.find(r => r.y === 'tool.failed'); if (refused) { const x = sx(refused.t); const g = el('g', {}, s); el('rect', { x: x - 30, y: 178, width: 60, height: 16, rx: 8, fill: LANE.slow[1] }, g); txt(g, x, 189.5, 'refused', { 'text-anchor': 'middle', class: 'in', 'font-size': 10 }); mark(g, refused); }
      // list
      const list = h('div', 'list'); box.appendChild(list);
      const foot = h('div', 'foot'); box.appendChild(foot);
      let curQ = null;
      function renderList(focusQ) {
        list.textContent = '';
        const shown = rows.filter(r => on[r.l] || r.forceShow);
        const frag = document.createDocumentFragment();
        shown.forEach(r => {
          const row = h('div', 'row' + (r.y.endsWith('.failed') || r.y === 'verifier.stagnation' ? ' fail' : (r.y === 'skill.completed' || r.y === 'plan.step.completed' || (r.y === 'episode.completed' && r.p.success)) ? ' ok' : '')); row.dataset.q = r.q; row.style.setProperty('--c', LANE[r.l][1]);
          row.appendChild(h('span', 'q', String(r.q))); row.appendChild(h('span', 't', r.t.toFixed(2) + ' s')); row.appendChild(h('span', 'e', String(r.e))); row.appendChild(h('span', 'ty', r.y)); row.appendChild(h('span', 's', r.s));
          row.addEventListener('click', () => { const open = row.classList.toggle('open'); const old = row.querySelector('pre'); if (old) old.remove(); if (open) { const pre = document.createElement('pre'); pre.textContent = JSON.stringify(r.p, null, 1); row.appendChild(pre); } });
          frag.appendChild(row);
        });
        list.appendChild(frag);
        foot.textContent = ''; foot.appendChild(h('span', null, `${shown.length.toLocaleString()} of ${N.toLocaleString()} rows shown · click a row for its payload · click a bar above to jump to it`));
        const b = h('b', null, 'Source: the episode\'s append-only evidence store, exported unfiltered in seq order.'); foot.appendChild(b);
        if (focusQ != null) { const t = list.querySelector(`[data-q="${focusQ}"]`); if (t) { $$('.row.cur', list).forEach(x => x.classList.remove('cur')); t.classList.add('cur'); t.click(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
      }
      renderList();
      // follow the scrubber above when it shows the same episode
      document.addEventListener('dh-scrub', e => { if (e.detail.id !== 'gs5') { cursor.setAttribute('opacity', 0); return; } const st = e.detail.step; let r = null; for (const x of rows) { if (x.e <= st) r = x; else break; } if (!r) { cursor.setAttribute('opacity', 0); return; } const x = sx(r.t); cursor.setAttribute('x1', x); cursor.setAttribute('x2', x); cursor.setAttribute('opacity', 1); });
    }
  })();

  /* ---------- evolution ---------- */
  (function evolution() {
    const box = $('#loop-svg'); if (!box) return;
    const W = 560, H = 345; const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, box);
    const defs = el('defs', {}, s); const m = el('marker', { id: 'larr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: '#6B7280' }, m);
    const m2 = el('marker', { id: 'larr2', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: '#D25A5E' }, m2);
    const N = [
      { k: 'fail', x: 20, y: 34, w: 220, h: 84, t: 'Attributed failure', d: '800 episodes; each loss charged to the earliest of 13 layers that broke', c: '#D25A5E', bg: '#FCEEEE' },
      { k: 'probe', x: 320, y: 34, w: 220, h: 84, t: 'Probe', d: 'reproduced from the state the harness itself put the arm in', c: '#E8964A', bg: '#FEF3E6' },
      { k: 'rev', x: 320, y: 164, w: 220, h: 84, t: 'Targeted revision', d: 'stated in physical quantities, a hinge radius or a hand span, never keyed to a task', c: '#1896A6', bg: '#E3F3F5' },
      { k: 'gate', x: 20, y: 164, w: 220, h: 84, t: 'Paired gate', d: 'success up, harness-lost flat, the policy\'s own wins intact, zero contamination', c: '#3E9D5F', bg: '#EAF6EE' },
      { k: 'reg', x: 20, y: 286, w: 520, h: 50, t: 'Registry: the next round runs on the enlarged library', d: 'admitted changes enter the library; a rejected change is reverted, not patched over', c: '#6B7280', bg: '#F0F2F4' },
    ];
    const g = {};
    N.forEach(n => { const gg = el('g', { class: 'node' }, s); g[n.k] = gg; el('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: 10, fill: n.bg, stroke: n.c, 'stroke-width': 1.8 }, gg); txt(gg, n.x + 12, n.y + 24, n.t, { 'font-weight': 700, 'font-size': 13.5, fill: '#14202B' }); const words = n.d.split(' '); let line = ''; const lines = []; const maxc = n.w > 300 ? 95 : 36; words.forEach(w => { if ((line + ' ' + w).trim().length > maxc) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w; }); lines.push(line); lines.forEach((l, i) => txt(gg, n.x + 12, n.y + 42 + i * 14, l, { 'font-size': 10.5, fill: '#4A5563' })); });
    const lab = (x, y, l, col, anchor) => { const gl = el('g', {}, s); const t = txt(gl, x, y, l, { 'font-size': 10.5, fill: col || '#4A5563', 'font-weight': 600, 'text-anchor': anchor || 'middle' }); const bb = t.getBBox(); el('rect', { x: bb.x - 3, y: bb.y - 1, width: bb.width + 6, height: bb.height + 2, rx: 3, fill: '#fff', opacity: 0.92 }, gl); gl.appendChild(t); };
    const E = [
      ['M240 76 L320 76', 'reason string', 280, 66, 'middle'],
      ['M430 118 L430 164', 'the mechanism', 438, 145, 'start'],
      ['M320 186 L240 186', 'revision', 280, 176, 'middle'],
      ['M130 248 L130 286', 'promote', 138, 271, 'start'],
      ['M540 311 L552 311 L552 14 L130 14 L130 34', 'the next round runs on the enlarged library', 340, 18, 'middle'],
    ];
    E.forEach(([d, l, x, y, an]) => { el('path', { d, fill: 'none', stroke: '#6B7280', 'stroke-width': 2, 'marker-end': 'url(#larr)', 'stroke-linejoin': 'round' }, s); lab(x, y, l, '#4A5563', an); });
    el('path', { d: 'M240 226 L320 226', fill: 'none', stroke: '#D25A5E', 'stroke-width': 1.6, 'stroke-dasharray': '4 3', 'marker-end': 'url(#larr2)' }, s); lab(280, 266, 'reject: reverted, not patched over', '#B0413F', 'middle');
    el('line', { x1: 280, y1: 232, x2: 280, y2: 258, stroke: '#D25A5E', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, s);
    const order = ['fail', 'probe', 'rev', 'gate', 'reg']; let i = 0;
    setInterval(() => { order.forEach((k, j) => g[k].classList.toggle('lit', j === i)); i = (i + 1) % order.length; }, 1400);

    const reg = $('#registry'); if (reg) {
      const rh = h('div', 'rh'); ['added', 'capability', 'the failure that demanded it'].forEach(t => rh.appendChild(h('span', null, t))); reg.appendChild(rh);
      D.REGISTRY.forEach(r => { const row = h('div', 'rr' + (r.seed ? ' seed' : r.late ? '' : ' adm')); row.appendChild(h('span', 'd', r.date)); row.appendChild(h('span', 'c', r.cap)); row.appendChild(h('span', 'w', r.why)); reg.appendChild(row); });
      reg.appendChild(h('div', 'foot', 'Five admitted by the gate (teal); one in flight, landed after the analyzed round. Dates are 2026.'));
    }
    // charts
    let c = Ch.card('#c-rounds', 'Development history on seeds 21–40', 'Every full evaluation of the agent; two rounds were not kept.');
    Ch.legend(c.cview, [['Kept', Ch.C.dh, true], ['Rejected', Ch.C.rose, true]]); const rb = h('div'); c.cview.appendChild(rb); Ch.rounds(rb, D.ROUNDS);
    Ch.table(c.tview, ['Round', 'Successes', 'Episodes', 'Success (%)', 'Note'], D.ROUNDS.map(r => ({ cls: r.rej ? '' : '', cells: [r.r + (r.rej ? ' (rejected)' : ''), r.s, r.n, Ch.fmt2(100 * r.s / r.n), r.note || ''] })));
    c = Ch.card('#c-rejected', 'A candidate that passed its paired gate', 'Change in successes (of 20) after promoting a cavity entry to every fixture region. Five hob cells collapsed; the microwave cell gained; reverting restored them.');
    const rj = h('div'); c.cview.appendChild(rj); Ch.diverging(rj, D.REJECTED.map(r => ({ label: r.cell, sub: r.task, before: r.before, after: r.after, delta: 5 * (r.after - r.before) })));
    Ch.table(c.tview, ['Cell', 'Task', 'Promoted', 'Rejected', 'Δ (of 20)'], D.REJECTED.map(r => ({ cells: [r.cell, r.task, r.before, r.after, r.after - r.before] })), { note: '33 further shared cells moved within ±1. Total over 39 shared cells: 540 → 466.' });
    c = Ch.card('#c-drawer', 'A capability update following attribution', 'goal_swap[0] (open the middle drawer): three physical causes, two changes stated in those quantities.');
    Ch.legend(c.cview, [['goal_swap[0], of 20 seeds', Ch.C.dh, true], ['Goal total, 400 episodes', Ch.C.de, true]]); const dr = h('div'); c.cview.appendChild(dr); Ch.slopes(dr, D.DRAWER.labels, [{ name: 'cell', v: D.DRAWER.cell, color: Ch.C.dh }, { name: 'Goal', v: D.DRAWER.goal, color: Ch.C.de }]);
    Ch.table(c.tview, ['Stage', 'goal_swap[0] (%)', 'Goal-T + Goal-S (%)'], D.DRAWER.labels.map((l, i) => ({ cells: [l, D.DRAWER.cell[i], D.DRAWER.goal[i]] })), { note: 'Forearm wedged against the wine rack; closure limit rejected about a third of grasps on the 15.4 mm handle; hand sat too high after contact.' });
    c = Ch.card('#c-tools', 'Evolved capabilities as measured objects', 'Invocation-level completion versus source-cell conversion on the same seeds.');
    c.container.classList.add('table'); c.container.querySelector('.tools').remove();
    Ch.table(c.tview, ['Capability', 'Invocations', 'Completed (%)', 'Cells', 'Conversion'], D.TOOLS.map(t => ({ cells: [t.cap, t.inv, t.compl, t.cells, t.conv] })), { note: 'turn_knob_object completes 21% of its invocations while its source cell rises from 0% to 95%: failed attempts are retried or replaced inside the episode.' });
  })();

  /* ---------- results ---------- */
  (function results() {
    if (!$('#c-main')) return;
    const state = { cell: 4, scope: 'all' };
    const cellNames = [...D.CELLS, 'Avg.'];
    const val = (r, i) => (i === 4 ? r.avg : r.v[i]);
    function rowsFor() {
      let rows = D.MAIN.slice();
      if (state.scope === 'matched') rows = rows.filter(r => r.matched);
      if (state.scope === 'published') rows = rows.filter(r => !r.ours);
      return rows;
    }
    function renderMain() {
      const rows = rowsFor(); const i = state.cell;
      const c = Ch.card('#c-main', `LIBERO-Pro success (%) · ${cellNames[i]}`, state.scope === 'matched' ? 'Our controlled runs: same Qwen3-VL-4B upper model and the same frozen π0.5, 200 episodes per cell.' : state.scope === 'published' ? 'Reference results under their published settings; cross-protocol rows are comparable, not matched.' : 'Table 1 of the paper. Hover a bar for the upper model and the source.');
      const sorted = rows.map(r => ({ label: r.m + (r.vlm !== 'none' ? ` · ${r.vlm}` : ''), sub: r.vlm, value: val(r, i), emph: !!r.dh, color: r.dh ? Ch.C.dh : r.m.startsWith('π0.5 (our run)') ? '#8D96A0' : Ch.C.de, extra: [['Source', r.src], ['Cells', r.v.map((x, k) => `${D.CELLS[k]} ${Ch.fmt1(x)}`).join(' · ')]] })).sort((a, b) => (b.value == null ? -1 : b.value) - (a.value == null ? -1 : a.value));
      const box = h('div'); c.cview.appendChild(box); Ch.hbar(box, sorted, { labelW: 250, rowH: 23 });
      const best = {}, second = {};
      [0, 1, 2, 3, 4].forEach(k => { const vs = [...new Set(rows.map(r => val(r, k)).filter(v => v != null))].sort((a, b) => b - a); best[k] = vs[0]; second[k] = vs[1]; });
      Ch.table(c.tview, ['Method', 'Upper VLM', ...cellNames], rows.map(r => ({ cls: r.dh ? 'dh' : '', cells: [r.m, r.vlm, ...[0, 1, 2, 3, 4].map(k => { const v = val(r, k); return { v: v == null ? '–' : Ch.fmt2(v), cls: v == null ? '' : v === best[k] ? 'best' : v === second[k] ? 'second' : '' }; })] })), { note: 'Bold: largest in column; underlined: second. "–": not reported. DynaHarness: archived development aggregate 74.25%; on 800 new states after freezing: 75.2%.' });
    }
    $$('#f-cell button').forEach((b, k) => b.addEventListener('click', () => { $$('#f-cell button').forEach((x, j) => x.classList.toggle('active', j === k)); state.cell = k; renderMain(); }));
    $$('#f-scope button').forEach(b => b.addEventListener('click', () => { $$('#f-scope button').forEach(x => x.classList.toggle('active', x === b)); state.scope = b.dataset.scope; renderMain(); }));
    renderMain();

    // scale scatter
    let c = Ch.card('#c-scale', 'Success against upper-model scale', 'Same 4B model, different harness: 74.25% versus 20.3% (PhyAgentOS) and 6.0% (Harness VLA). Frontier-model rows are published references.');
    let b = h('div'); c.cview.appendChild(b); Ch.scatter(b, D.SCALE, D.SCALE_SLOTS);
    Ch.table(c.tview, ['System', 'Upper VLM', 'Success (%)'], D.SCALE.map(p => ({ cls: p.dh ? 'dh' : '', cells: [p.m, p.vlm, Ch.fmt2(p.v)] })));

    // heatmap
    const heatModes = [['dh', 'DynaHarness, round 39'], ['pi', 'Frozen π0.5, seeds 21–40'], ['r30', 'Analyzed round 30'], ['delta', 'Δ DynaHarness − π0.5'], ['noevo', 'Held-out: harness without evolution − π0.5 (seeds 1–20)']];
    let heatMode = 'dh';
    function renderHeat() {
      const c = Ch.card('#c-heat', 'Per-task success on 40 LIBERO-Pro cells', '10 tasks per cell, 20 seeds per task. Hover a cell for the instruction.');
      const ctl = h('div', 'heat-ctl'); heatModes.forEach(([k, l]) => { const bt = h('button', 'btn light small' + (k === heatMode ? ' active' : ''), l); if (k === heatMode) { bt.style.background = '#14202B'; bt.style.color = '#fff'; } bt.addEventListener('click', () => { heatMode = k; renderHeat(); }); ctl.appendChild(bt); }); c.cview.appendChild(ctl);
      const rows = D.CELLS, cols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const vals = rows.map(r => { const P = D.PERTASK[r]; if (heatMode === 'delta') return P.dh.map((v, j) => v - P.pi[j]); if (heatMode === 'noevo') return P.noevo.map((v, j) => v - P.piH[j]); return P[heatMode]; });
      const box = h('div'); c.cview.appendChild(box);
      Ch.heatmap(box, rows, cols, vals, { diverging: heatMode === 'delta' || heatMode === 'noevo', max: 100, fmt: v => (heatMode === 'delta' || heatMode === 'noevo') ? (v > 0 ? '+' + v : String(v)) : String(v), info: (i, j) => { const P = D.PERTASK[rows[i]]; return [['Instruction', P.instr[j]], ['Frozen π0.5 (21–40)', P.pi[j] + '%'], ['DynaHarness round 39', P.dh[j] + '%'], ['Analyzed round 30', P.r30[j] + '%'], ['Held-out π0.5 / no-evolution (1–20)', `${P.piH[j]}% / ${P.noevo[j]}%`]]; } });
      Ch.table(c.tview, ['Cell', 'Task', 'Instruction', 'π0.5', 'DynaHarness r39', 'Round 30'], rows.flatMap(r => D.PERTASK[r].instr.map((ins, j) => ({ cells: [r, j, ins, D.PERTASK[r].pi[j], D.PERTASK[r].dh[j], D.PERTASK[r].r30[j]] }))));
    }
    renderHeat();

    // ablations
    c = Ch.card('#c-abl', 'Which capabilities and execution mechanisms carry the result', 'Paired arms over the same 800 development episodes. Deltas against the concurrent Full control (74.0%).');
    b = h('div'); c.cview.appendChild(b);
    Ch.hbar(b, D.ABL.map(a => ({ label: a.name + (a.d != null ? `  (${a.d > 0 ? '+' : ''}${a.d} pp)` : ''), sub: '', value: a.pct, emph: a.name.startsWith('Full'), color: a.name.startsWith('Full') ? Ch.C.dh : a.name.startsWith('Bare') ? '#8D96A0' : Ch.C.de, extra: [['Suites', a.v.map((x, k) => `${D.CELLS[k]} ${x}/200`).join(' · ')], ['Paired', a.note]] })), { labelW: 300, rowH: 26 });
    Ch.table(c.tview, ['Arm', ...D.CELLS, 'Total / 800', 'Success (%)', 'Δ (pp)', 'Paired outcome'], D.ABL.map(a => ({ cls: a.name.startsWith('Full') ? 'dh' : '', cells: [a.name, ...a.v, a.tot, a.pct, a.d == null ? '–' : a.d, a.note] })), { note: 'A2static keeps the one-step planner interface and nominal replanning after successful skills but disables failure-triggered replanning, substitution, reordering, recovery insertion and verifier-conditioned branching. Full exceeds A2static by 10.125 points (cell-bootstrap 95% CI [3.4, 18.3]).' });

    // mechanism counts
    c = Ch.card('#c-mech', 'What Full does that nominal replanning cannot', 'Event counts over 783 trace-matched Full / A2static pairs. Descriptive, not individual causal effects.');
    Ch.legend(c.cview, [['Full DynaHarness', Ch.C.dh], ['A2static', Ch.C.de]]); b = h('div'); c.cview.appendChild(b);
    Ch.hpairs(b, D.MECH, [{ key: 'full', name: 'Full', color: Ch.C.dh }, { key: 'stat', name: 'A2static', color: Ch.C.de }], { labelW: 210, max: 600, rowH: 38 });
    Ch.table(c.tview, ['Event', 'Full', 'A2static'], D.MECH.map(m => ({ cells: [m.name, m.full, m.stat] })), { note: 'Whole run: 2,875 planner calls (Full) against 800 (A2seq); 244,523 environment steps against 188,038.' });

    // transfer
    c = Ch.card('#c-transfer', 'Frozen snapshots keep their ranking on new initial states', 'Four preregistered snapshots, 800 development episodes versus 800 states sampled after freezing. Spearman ρ = 1.00.');
    Ch.legend(c.cview, [['Development block (seeds 21–40)', Ch.C.de], ['800 new states', Ch.C.dh]]); b = h('div'); c.cview.appendChild(b);
    Ch.dumbbell(b, D.TRANSFER.map(t => ({ label: t.name, a: t.dev, b: t.nw, emph: t.name === 'Final' })), { min: 55, max: 80, aName: 'Development', bName: 'New states', labelW: 70 });
    Ch.table(c.tview, ['Snapshot', 'Development (%)', 'New states (%)'], D.TRANSFER.map(t => ({ cls: t.name === 'Final' ? 'dh' : '', cells: [t.name, t.dev, t.nw] })), { note: 'The 14.3-point development gain becomes 14.4 points on new states; 13.4 of them accrue by stat39, and the final 1.0-point increment has p = 0.077.' });

    // post-selection by suite
    c = Ch.card('#c-post', 'Post-selection transfer by suite', 'C: 200 newly sampled states per suite (800). B: 261 untouched official states across 31 cells.');
    Ch.legend(c.cview, [['DynaHarness, new states (C)', Ch.C.dh], ['DynaHarness, official states (B)', Ch.C.dhDark], ['Frozen π0.5, C', Ch.C.de], ['Frozen π0.5, B', Ch.C.de2]]); b = h('div'); c.cview.appendChild(b);
    Ch.groupedBars(b, D.CELLS, [{ name: 'DynaHarness (C)', color: Ch.C.dh, values: D.POST.C.dh }, { name: 'DynaHarness (B)', color: Ch.C.dhDark, values: D.POST.B.dh }, { name: 'π0.5 (C)', color: Ch.C.de, values: D.POST.C.pi }, { name: 'π0.5 (B)', color: Ch.C.de2, values: D.POST.B.pi }], { h: 230 });
    Ch.table(c.tview, ['Suite', 'C: DynaHarness', 'C: π0.5', 'B: DynaHarness', 'B: π0.5'], [...D.CELLS.map((n, k) => ({ cells: [n, D.POST.C.dh[k], D.POST.C.pi[k], D.POST.B.dh[k], D.POST.B.pi[k]] })), { cls: 'dh', cells: ['All', D.POST.C.dhAll, D.POST.C.piAll, D.POST.B.dhAll, D.POST.B.piAll] }], { note: 'Exclusive wins DynaHarness / π0.5: 473 / 11 on C (p = 3.1e-124) and 161 / 3 on B.' });

    // latency
    c = Ch.card('#c-latency', 'Decision latency on a log scale', 'Medians under load (22 concurrent channels for DynaHarness). Separate runs and measurement scopes, not one matched benchmark.');
    b = h('div'); c.cview.appendChild(b); Ch.dotLog(b, D.LAT, { labelW: 250 });
    Ch.table(c.tview, ['Component', 'Median', 'Note'], D.LAT.map(l => ({ cls: l.dh ? 'dh' : '', cells: [l.name, l.ms < 1000 ? l.ms + ' ms' : (l.ms / 1000) + ' s', l.note] })), { note: 'Fast brain p90 0.056 ms, p99 0.071 ms, max 5.58 ms. Slow brain p90 1,277 ms, p99 1,865 ms. Episode wall clock: 31.3 s mean.' });

    // standard LIBERO
    c = Ch.card('#c-libero', 'Unperturbed LIBERO, average over four suites', 'Near ceiling for everyone; DynaHarness matches the policy it wraps (98.05% vs 98.0%). LIBERO-Pro is therefore the main comparison.');
    b = h('div'); c.cview.appendChild(b);
    Ch.hbar(b, D.LIBERO.map(r => ({ label: r.m + (r.vlm !== 'none' ? ` · ${r.vlm}` : ''), sub: r.vlm, value: r.avg, emph: !!r.dh, color: r.dh ? Ch.C.dh : Ch.C.de, extra: [['Suites', r.v.map((x, k) => `${['Spatial', 'Object', 'Goal', 'Long'][k]} ${x}`).join(' · ')]] })).sort((a, b) => b.value - a.value), { labelW: 230, rowH: 35 });
    Ch.table(c.tview, ['Method', 'Upper VLM', 'Spatial', 'Object', 'Goal', 'Long', 'Avg.'], D.LIBERO.map(r => ({ cls: r.dh ? 'dh' : '', cells: [r.m, r.vlm, ...r.v, r.avg] })));

    // LIBERO-Plus radar
    c = Ch.card('#c-plus', 'LIBERO-Plus: seven perturbation categories', '10,030 tasks, one trial each: 84.4% overall. Camera viewpoint and robot initial state are the hardest, as for the published policies.');
    Ch.legend(c.cview, D.PLUS.series.map((s, i) => [s.name, [Ch.C.dh, Ch.C.violet, Ch.C.amber, Ch.C.de][i], true])); b = h('div'); c.cview.appendChild(b);
    Ch.radar(b, D.PLUS.labels, D.PLUS.series.map((s, i) => ({ name: s.name, v: s.v, dh: !!s.dh, color: [Ch.C.dh, Ch.C.violet, Ch.C.amber, Ch.C.de][i] })), { w: 420, h: 300 });
    Ch.table(c.tview, ['Policy', ...D.PLUS.labels], D.PLUS.series.map(s => ({ cls: s.dh ? 'dh' : '', cells: [s.name, ...s.v] })), { note: 'Published policies: Table 1 of the LIBERO-Plus paper. DynaHarness used a configuration prepared for LIBERO-Plus.' });

    // budget histogram
    c = Ch.card('#c-budget', 'Failures run out the budget', 'Budget used at episode end, analyzed round: 254 of 258 failures ended at 99% or more; successes at a median of 67%.');
    Ch.legend(c.cview, [['Success', Ch.C.dh], ['Failure', Ch.C.rose]]); b = h('div'); c.cview.appendChild(b); Ch.histogram(b, D.BUDGET, { h: 210 });
    Ch.table(c.tview, ['Budget used (%)', 'Succeeded', 'Failed'], D.BUDGET.map(x => ({ cells: [`${x.lo}–${x.hi}`, x.s, x.f] })));

    c = Ch.card('#c-after', 'Steps after the last progress', 'Median over 5,805 episodes. Long suffixes show where intervention could save execution; supplying an effective replacement action is a separate requirement.');
    b = h('div'); c.cview.appendChild(b); Ch.vbars(b, D.AFTER_PROGRESS.map((r, i) => ({ name: r.name, v: r.v, color: [Ch.C.dh, Ch.C.rose, Ch.C.blue][i] })), { max: 250, unit: '', valueName: 'Steps', h: 210 });
    Ch.table(c.tview, ['Outcome', 'Steps after last progress'], D.AFTER_PROGRESS.map(r => ({ cells: [r.name, r.v] })));

    c = Ch.card('#c-share', 'Steps by executor', 'Top: one filmed success per cell. Bottom: all 20 seeds of four hard cells; the VLA takes most steps where no analytic route applies.');
    Ch.legend(c.cview, [['Analytic', Ch.C.dh], ['Gripper', Ch.C.dhDark], ['Recovery', Ch.C.amber], ['π0.5', Ch.C.de]]); b = h('div'); c.cview.appendChild(b);
    Ch.stacked(b, D.STEPSHARE, [{ key: 'a', name: 'Analytic', color: Ch.C.dh }, { key: 'g', name: 'Gripper', color: Ch.C.dhDark }, { key: 'r', name: 'Recovery', color: Ch.C.amber }, { key: 'p', name: 'π0.5', color: Ch.C.de }], { labelW: 110 });
    Ch.table(c.tview, ['Cell', 'Analytic %', 'π0.5 %', 'Gripper %', 'Recovery %'], D.STEPSHARE.map(r => ({ cells: [r.cell, r.a, r.p, r.g, r.r] })));

    // real world tiles
    const rt = $('#real-tiles'); if (rt) D.REAL.forEach(r => { const t = h('div', 't'); t.appendChild(h('div', 'v', r.pct + '%')); t.appendChild(h('div', 'l', r.short)); t.title = r.instr; rt.appendChild(t); });
  })();

  /* ---------- baseline diagnostics ---------- */
  (function baselines() {
    const root = $('#bl'), tabs = $('#bl-tabs'), panel = $('#bl-panel'); if (!root || !window.DH_BL) return;
    const BL = window.DH_BL.systems; if (!BL.length) { root.style.display = 'none'; return; }
    const fmtT = s => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : `${s.toFixed(1)} s`);
    let cur = 0;
    BL.forEach((sy, i) => { const b = h('button', i === 0 ? 'active' : ''); b.setAttribute('role', 'tab'); b.appendChild(document.createTextNode(sy.name)); b.appendChild(h('small', null, sy.tag || '')); b.addEventListener('click', () => { cur = i; $$('button', tabs).forEach((x, k) => x.classList.toggle('active', k === i)); render(); }); tabs.appendChild(b); });

    function nums(sy) {
      const box = h('div', 'bl-nums'); box.appendChild(h('div', 'ttl', 'LIBERO-Pro success, four cells and average'));
      const rows = D.MAIN.filter(r => (sy.rows || []).some(k => r.m === k[0] && r.vlm === k[1]));
      const dh = D.MAIN.find(r => r.dh); if (dh) rows.push(dh);
      const cells = [...D.CELLS, 'Avg.'];
      rows.forEach(r => { const row = h('div', 'r' + (r.dh ? ' dh' : r.ours ? ' ours' : '')); const n = h('div', 'n'); n.appendChild(document.createTextNode(r.m + ' ')); n.appendChild(h('small', null, r.vlm === 'none' ? '' : r.vlm)); row.appendChild(n); const b = h('div', 'b'); const i = h('i'); i.style.width = (r.avg == null ? 0 : r.avg) + '%'; b.appendChild(i); row.appendChild(b); row.appendChild(h('div', 'v', r.avg == null ? '–' : Ch.fmt1(r.avg))); row.title = cells.map((c, k) => `${c} ${k < 4 ? Ch.fmt1(r.v[k]) : Ch.fmt1(r.avg)}`).join(' · ') + ' — ' + r.src; box.appendChild(row); });
      box.appendChild(h('div', 'foot', sy.numsNote || 'Average over the four cells. Rose: our run of the released code with Qwen3-VL-4B and the frozen π0.5; grey: published. Hover a row for the cells.'));
      return box;
    }

    function player(c, opts) {
      opts = opts || {};
      const box = h('div', 'bl-player'); const vids = c.videos || []; const imgs = c.images || [];
      const wrap = h('div', 'vids' + (vids.length + imgs.length === 2 ? ' two' : '') + (!vids.length && imgs.length ? ' stack' : '')); box.appendChild(wrap);
      const V = [];
      vids.forEach(v => { const f = h('figure'); const el = document.createElement('video'); el.src = v.src; if (v.poster) el.poster = v.poster; el.muted = true; el.playsInline = true; el.preload = 'metadata'; el.loop = false; el._dur = v.dur || 0; f.appendChild(el); if (v.label) f.appendChild(h('span', 'badge' + (v.fail ? ' fail' : v.ok ? ' ok' : ''), v.label)); wrap.appendChild(f); V.push(el); });
      imgs.forEach(im => { const f = h('figure'); const el = document.createElement('img'); el.src = im.src; el.alt = im.label || ''; el.loading = 'lazy'; el.dataset.zoom = im.src; f.appendChild(el); if (im.label) f.appendChild(h('span', 'badge' + (im.fail ? ' fail' : ''), im.label)); wrap.appendChild(f); });
      const dur = c.duration || 0; const marks = (c.markers || []).slice().sort((a, b) => a.at - b.at);
      const listHost = opts.listInto || box;
      const shortOf = m => m.short || ((m.label.match(/^(step \d+|attempt \d+[^:,]*|T\d+(?:[–-]T?\d+)?|line \d+|turn \d+|\d+(?:\.\d+)? s)/i) || [])[0]) || (m.label.length > 18 ? m.label.slice(0, 17) + '…' : m.label);
      const mkList = (withSeek) => { const ol = h('ul', 'marks'); const li = marks.map(m => { const l = h('li', m.fail ? 'fail' : ''); l.appendChild(h('span', 'at', m.unit ? `${m.unit} ${m.at}` : fmtT(m.at))); const d = h('div'); d.appendChild(h('span', 'lbl', m.label)); if (m.quote) d.appendChild(h('span', 'qt', '“' + m.quote + '”')); l.appendChild(d); if (withSeek) l.addEventListener('click', () => withSeek(m.at)); ol.appendChild(l); return l; }); return { ol, li }; };
      if (V.length) {
        const ctl = h('div', 'ctl'); const play = h('button', null, '▶ Play'); const rng = document.createElement('input'); rng.type = 'range'; rng.min = 0; rng.max = dur || 1; rng.step = 0.05; rng.value = 0; const tm = h('span', null, `0.0 s / ${fmtT(dur)}`); ctl.append(play, rng, tm); box.appendChild(ctl);
        const main = V.reduce((a, b) => (b._dur > a._dur ? b : a), V[0]);
        const seek = t => { V.forEach(v => { try { v.currentTime = t; } catch (e) { } }); };
        box._seek = seek;
        play.addEventListener('click', () => { if (main.paused) { V.forEach(v => v.play().catch(() => { })); play.textContent = '❚❚ Pause'; } else { V.forEach(v => v.pause()); play.textContent = '▶ Play'; } });
        rng.addEventListener('input', () => { seek(+rng.value); });
        main.addEventListener('ended', () => { V.forEach(v => v.pause()); play.textContent = '↻ Replay'; });
        main.addEventListener('play', () => { play.textContent = '❚❚ Pause'; });
        main.addEventListener('pause', () => { if (!main.ended) play.textContent = '▶ Play'; });
        // timeline, drawn at the container's real width and redrawn on resize
        const tl = h('div', 'tl'); if (marks.length) box.appendChild(tl);
        let pins = [], prog = null, head = null, sxCur = t => 0, lastW = 0;
        const { ol, li } = mkList(seek); if (marks.length) listHost.appendChild(ol);
        function drawTL() {
          const W = Math.max(320, tl.clientWidth || 640); if (W === lastW) return; lastW = W;
          tl.textContent = ''; const H = 64, L = 8, R = 8; const sx = t => L + (W - L - R) * (dur ? Math.min(1, t / dur) : 0); sxCur = sx;
          const s = el('svg', { viewBox: `0 0 ${W} ${H}` }, tl);
          el('line', { x1: L, y1: 40, x2: W - R, y2: 40, stroke: '#D5DBE2', 'stroke-width': 2 }, s);
          prog = el('line', { x1: L, y1: 40, x2: sx(main.currentTime || 0), y2: 40, stroke: '#0E93A6', 'stroke-width': 3 }, s);
          head = el('circle', { cx: sx(main.currentTime || 0), cy: 40, r: 4, fill: '#0E93A6' }, s);
          const rows = [-1e9, -1e9];
          pins = marks.map((m, i) => { const g = el('g', { class: 'pin' }, s); const x = sx(m.at); el('line', { x1: x, y1: 26, x2: x, y2: 40, stroke: m.fail ? '#C9503F' : '#4A5563' }, g); el('circle', { cx: x, cy: 22, r: 5, fill: m.fail ? '#C9503F' : '#4A5563' }, g); const lab = shortOf(m); const w = lab.length * 5.8; const row = i % 2; const anchor = x - w / 2 < 0 ? 'start' : x + w / 2 > W ? 'end' : 'middle'; const tx = anchor === 'start' ? 0 : anchor === 'end' ? W : x; const t = txt(g, tx, row ? 58 : 12, lab, { 'text-anchor': anchor }); const left = anchor === 'start' ? 0 : anchor === 'end' ? W - w : x - w / 2; if (left < rows[row] + 8) t.setAttribute('opacity', 0); else rows[row] = left + w; g.addEventListener('click', () => { seek(m.at); if (li[i]) li[i].scrollIntoView({ block: 'nearest' }); }); const tt = el('title', {}, g); tt.textContent = `${fmtT(m.at)} · ${m.label}`; return g; });
        }
        requestAnimationFrame(drawTL);
        if (window.ResizeObserver) new ResizeObserver(() => drawTL()).observe(tl);
        main.addEventListener('timeupdate', () => { const t = main.currentTime; rng.value = t; tm.textContent = `${fmtT(t)} / ${fmtT(dur)}`; if (prog) { prog.setAttribute('x2', sxCur(t)); head.setAttribute('cx', sxCur(t)); } let k = -1; marks.forEach((m, i) => { if (m.at <= t + 0.05) k = i; }); li.forEach((l, i) => { l.classList.toggle('cur', i === k); l.classList.toggle('past', i < k); }); pins.forEach((p, i) => p.classList.toggle('cur', i === k)); });
        if (V.length > 1) main.addEventListener('timeupdate', () => { V.slice(1).forEach(v => { if (Math.abs(v.currentTime - main.currentTime) > 0.35 && !v.seeking) v.currentTime = main.currentTime; }); });
      } else if (marks.length) {
        const { ol } = mkList(null); listHost.appendChild(ol);
      }
      return box;
    }

    const SPECIAL = window.DH_BL.special || {};
    function render() {
      const sy = BL[cur]; panel.textContent = '';
      const head = h('div', 'bl-head'); const hl = h('div'); const h3 = h('h3', null, sy.name); if (sy.model) h3.appendChild(h('span', 'chip-m', sy.model)); hl.appendChild(h3); hl.appendChild(h('p', 'mech', sy.mechanism)); if (sy.headline) hl.appendChild(h('p', 'headline', sy.headline)); head.appendChild(hl); head.appendChild(nums(sy)); panel.appendChild(head);
      let ci = 0; const cases = sy.cases || [];
      const ct = h('div', 'bl-case-tabs'); cases.forEach((c, i) => { const b = h('button', i === 0 ? 'active' : '', c.short || c.title); b.addEventListener('click', () => { ci = i; $$('button', ct).forEach((x, k) => x.classList.toggle('active', k === i)); renderCase(); }); ct.appendChild(b); }); if (cases.length > 1) panel.appendChild(ct);
      const body = h('div', 'bl-body'); panel.appendChild(body);
      function renderCase() {
        body.textContent = ''; const c = cases[ci]; if (!c) return;
        const hasVideo = !!(c.videos && c.videos.length);
        body.classList.toggle('static', !hasVideo);
        const w = h('div', 'card'); w.appendChild(h('h4', null, c.title)); w.appendChild(h('div', 'ep', c.episode)); w.appendChild(h('p', null, c.what));
        const ml = h('div', 'card marks-card'); ml.appendChild(h('h4', null, hasVideo ? 'Moments in the record · click to seek' : 'Moments in the record'));
        const d = c.dh ? h('div', 'card in-dh') : null; if (d) { d.appendChild(h('h4', null, 'In DynaHarness')); d.appendChild(h('p', null, c.dh)); }
        const pl = player(c, { listInto: ml });
        if (hasVideo) {
          const side = h('div', 'bl-side'); side.appendChild(w); side.appendChild(ml); if (d) side.appendChild(d);
          body.appendChild(pl); body.appendChild(side);
        } else {
          // screenshots read better at full width; the cards go underneath in two columns
          body.appendChild(pl); const row = h('div', 'bl-grid2 bl-static-row'); const left = h('div', 'bl-side'); left.appendChild(w); if (d) left.appendChild(d); row.appendChild(left); const right = h('div', 'bl-side'); right.appendChild(ml); row.appendChild(right); body.appendChild(row);
        }
        if (!ml.querySelector('.marks')) ml.remove();
      }
      renderCase();
      if (sy.special && SPECIAL[sy.special.kind]) { const sp = h('div', 'bl-special'); sp.appendChild(h('h4', null, sy.special.title)); if (sy.special.sub) sp.appendChild(h('p', 'sub', sy.special.sub)); panel.appendChild(sp); try { SPECIAL[sy.special.kind](sp, sy.special.data, { h, el, txt, $, $$, Ch, D, fmtT, player }); } catch (e) { console.error(e); } }
    }
    render();
  })();

  /* ---------- paired real-robot views stay in step ---------- */
  $$('.video-box.pair').forEach(box => { const vs = $$('video', box); if (vs.length < 2) return; const m = vs[0]; m.addEventListener('timeupdate', () => { vs.slice(1).forEach(v => { if (Math.abs(v.currentTime - m.currentTime) > 0.3 && !v.seeking) v.currentTime = m.currentTime; }); }); m.addEventListener('play', () => vs.slice(1).forEach(v => v.play().catch(() => { }))); m.addEventListener('pause', () => vs.slice(1).forEach(v => v.pause())); });

  /* ---------- contract cards ---------- */
  (function contract() { const g = $('#contract-grid'); if (!g) return; D.CONTRACT.forEach(c => { const d = h('div', 'c ' + c.c); d.appendChild(h('b', null, c.k)); d.appendChild(h('p', null, c.t)); g.appendChild(d); }); })();

  /* ---------- lightbox ---------- */
  (function lightbox() {
    const lb = $('#lightbox'), im = $('#lightbox img'); if (!lb) return;
    document.addEventListener('click', e => { const x = e.target.closest('[data-zoom]'); if (!x) return; im.src = x.dataset.zoom || x.src; lb.classList.add('open'); });
    lb.addEventListener('click', () => lb.classList.remove('open'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
  })();

  /* ---------- bibtex ---------- */
  (function bib() { const pre = $('#bib'); if (!pre) return; pre.textContent = D.BIBTEX; const b = $('#bib-copy'); b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(D.BIBTEX); b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1500); } catch (e) { b.textContent = 'Select and copy'; } }); })();

  /* ---------- KPI count-up ---------- */
  (function countUp() {
    $$('[data-count]').forEach(n => { const target = parseFloat(n.dataset.count), dec = (n.dataset.count.split('.')[1] || '').length; const suffix = n.dataset.suffix || ''; const o = new IntersectionObserver(es => { es.forEach(x => { if (!x.isIntersecting) return; o.disconnect(); const t0 = performance.now(); const step = now => { const t = Math.min(1, (now - t0) / 1400); const v = target * (1 - Math.pow(1 - t, 3)); n.textContent = v.toFixed(dec) + suffix; if (t < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }); }, { threshold: 0.4 }); o.observe(n); });
  })();

  /* ---------- math ---------- */
  if (window.renderMathInElement) renderMathInElement(document.body, { delimiters: [{ left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }], throwOnError: false });
})();
