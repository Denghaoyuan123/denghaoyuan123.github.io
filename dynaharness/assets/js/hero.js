/* Interactive workcell for the hero. A slow brain proposes a plan, a fast brain
   grounds, monitors and decides at 2 Hz, and the harness runs bounded commands
   on a 2-link arm. Two modes (DynaHarness / frozen policy only), four tasks
   (mug, plate push, stove knob, drawer) and a swap perturbation. The animation
   is a schematic; every rate, percentage and step cost quoted in a caption is
   taken from the paper. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const root = $('#workcell');
  if (!root) return;

  /* ---------- scene geometry ---------- */
  const W = 800, H = 430, TABLE_Y = 296;
  const SH = { x: 160, y: 140 }, L1 = 240, L2 = 190;
  const REST = { x: 235, y: 190 };
  const LAYOUT = {
    stove: { x: 246, w: 96, h: 30 },
    mug: { x: 322, w: 30, h: 34 },
    plate: { x: 396, w: 64, h: 9 },
    basket: { x: 466, w: 78, h: 42 },
    cabinet: { x: 557, w: 96, h: 118 },
  };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Animated workcell: slow brain, fast brain and harness controlling a robot arm' }, root);
  const defs = el('defs', {}, svg);
  const grad = el('linearGradient', { id: 'tbl', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': '#2A4B5E' }, grad);
  el('stop', { offset: '1', 'stop-color': '#1A3240' }, grad);
  const glow = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  el('feGaussianBlur', { stdDeviation: 6, result: 'b' }, glow);
  const fm = el('feMerge', {}, glow); el('feMergeNode', { in: 'b' }, fm); el('feMergeNode', { in: 'SourceGraphic' }, fm);

  // floor shadow and table
  el('ellipse', { cx: 400, cy: 372, rx: 380, ry: 26, fill: 'rgba(0,0,0,0.35)' }, svg);
  el('rect', { x: 30, y: TABLE_Y, width: 740, height: 46, rx: 8, fill: 'url(#tbl)' }, svg);
  el('rect', { x: 30, y: TABLE_Y, width: 740, height: 10, rx: 4, fill: '#35596E' }, svg);
  for (let i = 0; i < 3; i++) el('rect', { x: 70 + i * 320, y: TABLE_Y + 46, width: 22, height: 40, fill: '#152A36' }, svg);

  const objs = {};
  const label = (o, text, y) => { o.label = el('text', { x: 0, y: y == null ? -8 : y, 'text-anchor': 'middle', fill: 'rgba(255,255,255,0.45)', 'font-size': 11 }, o.g); o.label.textContent = text; };
  function mkObj(name, spec, draw) {
    const g = el('g', { class: 'obj ' + name }, svg);
    const o = { name, x: spec.x, w: spec.w, h: spec.h, top: TABLE_Y - spec.h, g, held: false, home: spec.x, draw };
    draw(o);
    objs[name] = o;
    return o;
  }
  mkObj('cabinet', LAYOUT.cabinet, o => {
    el('rect', { x: -48, y: 0, width: 96, height: 118, rx: 6, fill: '#3A5A70', stroke: '#4E7189', 'stroke-width': 2 }, o.g);
    // top and bottom drawers are fixed; the middle one can slide out toward the arm
    [10, 82].forEach(y => { el('rect', { x: -40, y: y, width: 80, height: 28, rx: 4, fill: '#2E4A5C', stroke: '#4E7189' }, o.g); el('rect', { x: -12, y: y + 11, width: 24, height: 5, rx: 2.5, fill: '#B9C7D2' }, o.g); });
    o.drawerBody = el('rect', { x: -40, y: 47, width: 0, height: 26, fill: '#233B4A', stroke: '#4E7189' }, o.g);
    o.drawer = el('g', {}, o.g);
    el('rect', { x: -40, y: 46, width: 80, height: 28, rx: 4, fill: '#2E4A5C', stroke: '#4E7189' }, o.drawer);
    o.handle = el('rect', { x: -12, y: 57, width: 24, height: 5, rx: 2.5, fill: '#B9C7D2' }, o.drawer);
    o.pull = 0;
    label(o, 'cabinet');
  });
  mkObj('stove', LAYOUT.stove, o => {
    el('rect', { x: -48, y: 0, width: 96, height: 30, rx: 5, fill: '#33505F', stroke: '#4E7189', 'stroke-width': 2 }, o.g);
    el('circle', { cx: -14, cy: 11, r: 12, fill: '#22363F', stroke: '#6E8CA0', 'stroke-width': 2 }, o.g);
    el('circle', { cx: -14, cy: 11, r: 5, fill: '#2F4653' }, o.g);
    o.burner = el('circle', { cx: -14, cy: 11, r: 9, fill: '#E8964A', opacity: 0, filter: 'url(#glow)' }, o.g);
    o.knob = el('g', {}, o.g);
    el('circle', { cx: 24, cy: 11, r: 7, fill: '#8FA5B5' }, o.knob);
    el('rect', { x: 23, y: 4, width: 2, height: 7, fill: '#22363F' }, o.knob);
    o.knobAngle = 0;
    label(o, 'stove');
  });
  mkObj('plate', LAYOUT.plate, o => {
    el('ellipse', { cx: 0, cy: 6, rx: 32, ry: 7, fill: '#D8E1E8' }, o.g);
    el('ellipse', { cx: 0, cy: 4, rx: 32, ry: 7, fill: '#EEF3F6', stroke: '#B7C5D0' }, o.g);
    el('ellipse', { cx: 0, cy: 4, rx: 18, ry: 3.5, fill: 'none', stroke: '#C9D5DE' }, o.g);
    label(o, 'plate');
  });
  mkObj('basket', LAYOUT.basket, o => {
    el('path', { d: 'M-39 6 L39 6 L32 42 L-32 42 Z', fill: '#B4763A', stroke: '#8E5A27', 'stroke-width': 2 }, o.g);
    for (let i = -24; i <= 24; i += 12) el('line', { x1: i, y1: 8, x2: i * 0.85, y2: 40, stroke: '#8E5A27', 'stroke-width': 1.5 }, o.g);
    label(o, 'basket');
  });
  mkObj('mug', LAYOUT.mug, o => {
    el('rect', { x: -14, y: 0, width: 28, height: 34, rx: 4, fill: '#2E86C7', stroke: '#1F5F8E', 'stroke-width': 2 }, o.g);
    el('rect', { x: -11, y: 3, width: 22, height: 5, rx: 2, fill: '#5FA8DE' }, o.g);
    el('path', { d: 'M14 9 C 28 9, 28 26, 14 26', fill: 'none', stroke: '#1F5F8E', 'stroke-width': 4 }, o.g);
    label(o, 'mug');
  });
  // basket front rim drawn after the mug so a placed mug sits inside
  const basketFront = el('g', { class: 'obj' }, svg);
  el('path', { d: 'M-39 6 L39 6 L32 42 L-32 42 Z', fill: 'rgba(180,118,58,0.55)', stroke: '#8E5A27', 'stroke-width': 2 }, basketFront);
  el('rect', { x: -41, y: 2, width: 82, height: 7, rx: 3, fill: '#C98A47', stroke: '#8E5A27', 'stroke-width': 1.5 }, basketFront);

  // target marker for the "front of the stove" placement
  const target = el('g', { opacity: 0 }, svg);
  el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 8, fill: 'none', stroke: '#7FE0EA', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, target);

  // arm
  const arm = el('g', {}, svg);
  el('ellipse', { cx: SH.x, cy: TABLE_Y + 2, rx: 46, ry: 9, fill: '#101E27' }, arm);
  el('rect', { x: SH.x - 22, y: SH.y + 10, width: 44, height: TABLE_Y - SH.y - 10, rx: 8, fill: '#3F5F73', stroke: '#587E96', 'stroke-width': 2 }, arm);
  el('rect', { x: SH.x - 30, y: TABLE_Y - 16, width: 60, height: 16, rx: 5, fill: '#2C4656', stroke: '#587E96', 'stroke-width': 2 }, arm);
  const upper = el('line', { stroke: '#9FB8CB', 'stroke-width': 22, 'stroke-linecap': 'round' }, arm);
  const upper2 = el('line', { stroke: '#DCE7EF', 'stroke-width': 14, 'stroke-linecap': 'round' }, arm);
  const fore = el('line', { stroke: '#9FB8CB', 'stroke-width': 18, 'stroke-linecap': 'round' }, arm);
  const fore2 = el('line', { stroke: '#DCE7EF', 'stroke-width': 11, 'stroke-linecap': 'round' }, arm);
  el('circle', { cx: SH.x, cy: SH.y, r: 15, fill: '#2C4656', stroke: '#7FE0EA', 'stroke-width': 3 }, arm);
  const elbow = el('circle', { r: 12, fill: '#2C4656', stroke: '#7FE0EA', 'stroke-width': 3 }, arm);
  const grip = el('g', {}, arm);
  el('circle', { cx: 0, cy: 0, r: 9, fill: '#2C4656', stroke: '#7FE0EA', 'stroke-width': 3 }, grip);
  el('rect', { x: -14, y: 4, width: 28, height: 12, rx: 3, fill: '#DCE7EF', stroke: '#9FB8CB', 'stroke-width': 2 }, grip);
  const fL = el('rect', { y: 14, width: 6, height: 24, rx: 2, fill: '#DCE7EF', stroke: '#9FB8CB', 'stroke-width': 1.5 }, grip);
  const fR = el('rect', { y: 14, width: 6, height: 24, rx: 2, fill: '#DCE7EF', stroke: '#9FB8CB', 'stroke-width': 1.5 }, grip);
  const flash = el('circle', { r: 30, fill: 'none', stroke: '#8BE0A4', 'stroke-width': 4, opacity: 0, filter: 'url(#glow)' }, svg);
  const refuseMark = el('g', { opacity: 0 }, svg);
  el('circle', { r: 16, fill: 'rgba(210,90,94,0.25)', stroke: '#F07A7E', 'stroke-width': 3 }, refuseMark);
  el('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7', stroke: '#F07A7E', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, refuseMark);
  // stall marker: a pulsing amber ring where progress stopped
  const stallMark = el('g', { opacity: 0 }, svg);
  el('circle', { r: 18, fill: 'rgba(246,192,126,0.18)', stroke: '#F6C07E', 'stroke-width': 3, 'stroke-dasharray': '5 4' }, stallMark);
  const stallText = el('text', { x: 0, y: 32, 'text-anchor': 'middle', fill: '#F6C07E', 'font-size': 11, 'font-weight': 600 }, stallMark); stallText.textContent = 'stagnation';
  // budget bar inside the scene
  const bud = el('g', {}, svg);
  el('rect', { x: 30, y: 16, width: 200, height: 8, rx: 4, fill: 'rgba(255,255,255,0.1)' }, bud);
  const budFill = el('rect', { x: 30, y: 16, width: 0, height: 8, rx: 4, fill: '#7FE0EA' }, bud);
  const budText = el('text', { x: 30, y: 40, fill: 'rgba(255,255,255,0.6)', 'font-size': 11.5 }, bud);
  const stepText = el('text', { x: 770, y: 40, fill: 'rgba(255,255,255,0.6)', 'font-size': 11.5, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' }, svg);
  const hzText = el('text', { x: 770, y: 22, fill: '#F6C07E', 'font-size': 11.5, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace' }, svg);
  hzText.textContent = 'fast brain 2 Hz · controller 20 Hz';

  /* ---------- kinematics ---------- */
  const state = { wx: REST.x, wy: REST.y, g: 1, held: null };
  function placeObj(o) { o.g.setAttribute('transform', `translate(${o.x},${o.top})`); }
  function ik(tx, ty) {
    let dx = tx - SH.x, dy = ty - SH.y, d = Math.hypot(dx, dy);
    d = clamp(d, 40, L1 + L2 - 2);
    const a = Math.atan2(dy, dx);
    const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1);
    const alpha = Math.acos(cosA);
    const s1 = a - alpha, s2 = a + alpha;
    const e1 = { x: SH.x + L1 * Math.cos(s1), y: SH.y + L1 * Math.sin(s1) };
    const e2 = { x: SH.x + L1 * Math.cos(s2), y: SH.y + L1 * Math.sin(s2) };
    const e = e1.y < e2.y ? e1 : e2;
    const w = { x: SH.x + d * Math.cos(a), y: SH.y + d * Math.sin(a) };
    return { e, w };
  }
  function render() {
    const { e, w } = ik(state.wx, state.wy);
    [upper, upper2].forEach(l => { l.setAttribute('x1', SH.x); l.setAttribute('y1', SH.y); l.setAttribute('x2', e.x); l.setAttribute('y2', e.y); });
    [fore, fore2].forEach(l => { l.setAttribute('x1', e.x); l.setAttribute('y1', e.y); l.setAttribute('x2', w.x); l.setAttribute('y2', w.y); });
    elbow.setAttribute('cx', e.x); elbow.setAttribute('cy', e.y);
    grip.setAttribute('transform', `translate(${w.x},${w.y})`);
    const open = 4 + 12 * state.g;
    fL.setAttribute('x', -open - 6); fR.setAttribute('x', open);
    if (state.held) { state.held.x = w.x; state.held.top = w.y + 16; }
    for (const k in objs) placeObj(objs[k]);
    basketFront.setAttribute('transform', `translate(${objs.basket.x},${objs.basket.top})`);
    const st = objs.stove; st.knob.setAttribute('transform', `rotate(${st.knobAngle} 24 11)`);
    const cb = objs.cabinet; cb.drawer.setAttribute('transform', `translate(${-cb.pull},0)`); cb.drawerBody.setAttribute('x', -40 - cb.pull); cb.drawerBody.setAttribute('width', cb.pull);
  }
  render();

  // scene anchors
  const knobPos = () => ({ x: objs.stove.x + 24, y: objs.stove.top + 11 });
  const handlePos = () => ({ x: objs.cabinet.x - objs.cabinet.pull, y: objs.cabinet.top + 59.5 });

  /* ---------- panels ---------- */
  const P = {
    slow: $('#p-slow'), fast: $('#p-fast'), evo: $('#p-evo'),
    slowBody: $('#p-slow .body'), slowStatus: $('#s-status'),
    prog: $('#g-prog'), progV: $('#g-prog-v'), stag: $('#g-stag'), stagV: $('#g-stag-v'), risk: $('#g-risk'), riskV: $('#g-risk-v'),
    chip: $('#d-chip'), why: $('#d-why'), cmd: $('#d-cmd'),
    evidence: $('#evidence'), caption: $('#scene-caption .bubble'), task: $('#scene-task'),
    outcome: $('#scene-outcome'),
  };
  function lit(name) { for (const k of ['slow', 'fast', 'evo']) P[k].classList.toggle('lit', k === name); }
  function plan(steps, cur, done, bad, placeholder) {
    P.slowBody.textContent = '';
    if (!steps.length) { const d = document.createElement('div'); d.className = 'ph'; d.textContent = placeholder || 'no advisory yet'; P.slowBody.appendChild(d); return; }
    const ul = document.createElement('ul'); ul.className = 'plan-steps';
    steps.forEach((s, i) => { const li = document.createElement('li'); li.textContent = `${i + 1}. ${s}`; if (i === cur) li.classList.add('cur'); if (done && done.includes(i)) li.classList.add('done'); if (bad === i) li.classList.add('bad'); ul.appendChild(li); });
    P.slowBody.appendChild(ul);
  }
  function slow(text) { P.slowStatus.textContent = text; }
  const RISK = { low: [0.12, 'low'], mid: [0.5, 'medium'], high: [0.9, 'high'] };
  function monitor(prog, stag, risk) {
    P.prog.style.width = (100 * clamp(prog, 0, 1)) + '%'; P.progV.textContent = prog.toFixed(2);
    P.stag.style.width = (100 * clamp(stag / 5, 0, 1)) + '%'; P.stagV.textContent = stag ? `${stag} tick${stag > 1 ? 's' : ''}` : '0';
    const r = RISK[risk] || RISK.low; P.risk.style.width = (100 * r[0]) + '%'; P.riskV.textContent = r[1];
  }
  function decide(kind, chip, why) { P.chip.className = 'dchip ' + kind; P.chip.textContent = chip; P.why.textContent = why || ''; }
  function cmd(html) { P.cmd.innerHTML = html || ''; }
  const CONTRACT = '<span class="ok">grounded ✓ bounded ✓ verifiable ✓ attributable ✓</span>';
  let evRows = [], evCap = 6;
  // rows that fit the panel, measured while it is empty so that rows never enlarge the column
  function measureEvidence() { evCap = Math.max(4, Math.min(14, Math.floor((P.evidence.clientHeight - 12) / 17))); }
  function log(step, type, text) {
    const row = document.createElement('div'); row.className = 'row ' + type;
    const a = document.createElement('span'); a.className = 'st'; a.textContent = step == null ? '' : 'step ' + step;
    const b = document.createElement('span'); b.className = 'ty'; b.textContent = type;
    const c = document.createElement('span'); c.textContent = text;
    row.append(a, b, c); P.evidence.appendChild(row); evRows.push(row);
    while (evRows.length > evCap) evRows.shift().remove();
  }
  function caption(text, cls) { P.caption.className = 'bubble ' + (cls || ''); P.caption.innerHTML = text; }
  function setStep(n) { stepText.textContent = 'env step ' + Math.round(n); }
  function setBudget(frac, total, fail) { budFill.setAttribute('width', 200 * clamp(frac, 0, 1)); budFill.setAttribute('fill', fail ? '#F07A7E' : frac > 0.9 ? '#F6C07E' : '#7FE0EA'); budText.textContent = `budget ${Math.round(frac * total)} / ${total} steps`; }
  function outcome(text, cls) { P.outcome.textContent = text; P.outcome.className = 'pill ' + cls; }
  function stall(x, y, on) { stallMark.setAttribute('transform', `translate(${x},${y})`); stallMark.setAttribute('opacity', on ? 1 : 0); }

  /* ---------- controls ---------- */
  const TASKS = {
    mug: { instr: 'put the mug in the basket' },
    push: { instr: 'push the plate to the front of the stove' },
    stove: { instr: 'turn on the stove' },
    drawer: { instr: 'open the middle drawer' },
  };
  const ctl = { mode: 'harness', task: 'mug', swap: false, playing: true };
  function resetScene() {
    for (const k in objs) { const o = objs[k]; o.x = LAYOUT[k].x; o.top = TABLE_Y - LAYOUT[k].h; o.held = false; }
    if (ctl.swap) { const a = objs.mug.x; objs.mug.x = objs.plate.x; objs.plate.x = a; }
    objs.stove.burner.setAttribute('opacity', 0); objs.stove.knobAngle = 0; objs.cabinet.pull = 0;
    state.held = null; state.g = 1; state.wx = REST.x; state.wy = REST.y;
    target.setAttribute('opacity', 0); refuseMark.setAttribute('opacity', 0); flash.setAttribute('opacity', 0); stallMark.setAttribute('opacity', 0);
    P.evidence.textContent = ''; evRows = []; measureEvidence();
    outcome('', 'neutral');
    lit(null); plan([], -1); slow('idle'); monitor(0, 0, 'low'); decide('idle', 'idle', 'no command running'); cmd('');
    render();
  }

  /* ---------- motion helpers ---------- */
  function moveTo(from, to, hover) { return t => { const k = ease(t); state.wx = lerp(from.x, to.x, k); state.wy = hover ? lerp(from.y, to.y, k) - Math.sin(Math.PI * k) * hover : lerp(from.y, to.y, k); }; }
  const above = o => ({ x: o.x, y: o.top - 16 - 70 });
  const at = o => ({ x: o.x, y: o.top - 16 });
  const frontOfStove = () => ({ x: objs.stove.x + 6, top: TABLE_Y - LAYOUT.plate.h });
  const here = () => ({ x: state.wx, y: state.wy });
  const stepTick = (from, n, total) => t => { setStep(from + n * t); setBudget((from + n * t) / total, total); };

  /* ---------- DynaHarness scripts ---------- */
  function openingSteps(S, total, steps, advisory, ground, groundLog) {
    S.push({ dur: 1.0, start() { lit('slow'); slow('reading the snapshot · thinking… (913 ms median)'); caption('<b>Slow brain</b> (Qwen3-VL-4B) reads the atomic context snapshot and proposes what should happen next. It never actuates.'); setStep(0); setBudget(0, total); log(0, 'slow', 'planner call, 913 ms median'); } });
    S.push({ dur: 0.9, start() { plan(steps, 0); slow(advisory); caption('<b>Advisory</b>: a capability name and symbolic arguments. No poses. The fast brain resolves geometry, success and refusal.'); log(0, 'slow', `advisory: ${steps.length} steps`); } });
    S.push({ dur: 0.9, start() { lit('fast'); plan(steps, 1, [0]); decide('continue', 'GROUND ✓', ground); cmd(`${steps[1]} · budget ${total} · lease 12 s<br>${CONTRACT}`); caption('<b>Fast brain</b> grounds the step against the scene: parameters, preconditions, budget and lease are attached. Only then does a command exist.'); log(4, 'fast', groundLog); } });
  }

  function mugScript() {
    const S = [], total = 300;
    const steps = ['locate the mug', 'pick_object(mug)', 'place_in(basket)'];
    let cur = {};
    openingSteps(S, total, steps, 'advisory: pick_object(mug) → place_in(basket)', `mug bound at x=${Math.round(objs.mug.x)}${ctl.swap ? ' (swapped scene: the entity binds to where the mug actually is)' : ''} · jaw open · reachable`, `ground pick(mug): ok${ctl.swap ? ' · swapped layout resolved' : ''} · budget 300 · lease 12 s`);
    S.push({ dur: 1.1, start() { cmd(`approach(mug) · analytic skill<br>${CONTRACT}`); decide('continue', 'CONTINUE_SKILL', 'progress rising, lease held'); caption('<b>Physical harness</b> runs the bounded command. Analytic skills carry the stages that measured geometry determines.'); log(10, 'exec', 'approach(mug) dispatched'); cur.from = here(); }, tick(t) { moveTo(cur.from, above(objs.mug), 40)(t); monitor(0.15 * t, 0, 'low'); stepTick(10, 30, total)(t); } });
    S.push({ dur: 0.6, start() { cmd(`guarded_descend · analytic<br>${CONTRACT}`); log(40, 'exec', 'guarded_descend, 34 steps'); cur.from = here(); }, tick(t) { moveTo(cur.from, at(objs.mug))(t); monitor(0.15 + 0.16 * t, 0, 'low'); stepTick(40, 34, total)(t); } });
    S.push({ dur: 0.35, start() { log(74, 'exec', 'close_jaw, 10 steps'); }, tick(t) { state.g = 1 - t; setStep(74 + 10 * t); }, end() { state.held = objs.mug; } });
    S.push({ dur: 0.5, start() { log(84, 'exec', 'lift, 23 steps'); decide('continue', 'CONTINUE_SKILL', 'holding mug ✓ · progress 0.53'); cur.from = here(); }, tick(t) { moveTo(cur.from, above(objs.mug))(t); monitor(0.31 + 0.22 * t, 0, 'low'); stepTick(84, 23, total)(t); } });
    S.push({ dur: 1.2, start() { plan(steps, 2, [0, 1]); cmd(`transport(basket) · corridor over the table<br>${CONTRACT}`); caption('<b>Monitor</b> every 0.5 s: progress, stagnation, risk. The verdict is read from the benchmark predicate and <b>latched</b>, so a transient success is never missed.'); log(107, 'exec', 'transport(basket), 60–80 steps'); cur.from = here(); }, tick(t) { moveTo(cur.from, above(objs.basket), 30)(t); monitor(0.53 + 0.3 * t, 0, 'low'); stepTick(107, 70, total)(t); } });
    S.push({ dur: 0.5, start() { log(177, 'exec', 'lower, 15 steps'); cur.from = here(); }, tick(t) { moveTo(cur.from, { x: objs.basket.x, y: objs.basket.top - 8 })(t); monitor(0.83 + 0.1 * t, 0, 'low'); setStep(177 + 15 * t); } });
    S.push({ dur: 0.35, start() { log(192, 'exec', 'release, 10 steps'); }, tick(t) { state.g = t; }, end() { state.held = null; objs.mug.x = objs.basket.x; objs.mug.top = objs.basket.top + 6; } });
    S.push({ dur: 0.5, start() { log(202, 'exec', 'retreat'); cur.from = here(); }, tick(t) { moveTo(cur.from, above(objs.basket))(t); setStep(202 + 20 * t); } });
    S.push({ dur: 1.4, start() { flash.setAttribute('cx', objs.basket.x); flash.setAttribute('cy', objs.basket.top + 20); monitor(1, 0, 'low'); decide('end', 'END · latched verdict', 'predicate true at step 222; the command ends'); cmd('completed · 222 of 300 steps · observations, decisions, reasons → evidence store'); caption('<b>Verdict latched.</b> The command ends on the benchmark predicate, not on a model\'s judgment. Every decision stays in the evidence store.', 'ok'); log(222, 'verdict', 'latched: success, 78 steps of budget left'); outcome('success · 222 / 300 steps', 'ok'); }, tick(t) { flash.setAttribute('opacity', 1 - t); flash.setAttribute('r', 20 + 30 * t); } });
    S.push({ dur: 1.2, start() { lit('evo'); caption('<b>Self-evolution</b> reads the same record offline: failures are charged to the earliest of 13 layers that broke; a paired gate can reject the fix.'); } });
    return S;
  }

  function pushScript() {
    // push the plate to the front of the stove: refusal and substitution (goal_swap[5], seed 22)
    const S = [], total = 300;
    const steps = ['locate the plate', 'push_object(plate → stove front)'];
    let cur = {};
    S.push({ dur: 1.0, start() { lit('slow'); slow('reading the snapshot · thinking… (913 ms median)'); caption('<b>Slow brain</b> (Qwen3-VL-4B) reads the atomic context snapshot and proposes what should happen next. It never actuates.'); setStep(0); setBudget(0, total); log(0, 'slow', 'planner call, 913 ms median'); } });
    S.push({ dur: 0.9, start() { plan(steps, 0); slow('advisory: push_object(plate → stove front)'); caption('<b>Advisory</b>: a capability name and symbolic arguments. No poses. The fast brain resolves geometry, success and refusal.'); log(0, 'slow', 'advisory: 2 steps'); } });
    S.push({ dur: 1.2, start() { lit('fast'); plan(steps, 1, [0]); decide('refuse', 'REFUSE ⊥', 'jaw span 40 mm < the contact a push requires; reason recorded, nothing dispatched'); cmd('push_object(plate): <span class="bad">refused before it starts</span>'); refuseMark.setAttribute('transform', `translate(${objs.plate.x},${objs.plate.top - 30})`); refuseMark.setAttribute('opacity', 1); caption('<b>Refused at step 10.</b> The jaw is too narrow for the contact a push requires. Refusal is a returned value with a reason, so it enters the record even though nothing moved.', 'refuse'); log(10, 'refuse', 'push_object(plate): jaw too narrow'); setStep(10); setBudget(10 / total, total); monitor(0, 0, 'low'); } });
    S.push({ dur: 1.0, start() { plan(['locate the plate', 'push_object(plate)', 'pick_object(plate) · place(stove front)'], 2, [0], 1); decide('subst', 'SWITCH · pick_and_place', 'an eligible alternative from the library; goal preserved, operation changed'); cmd(`pick_object(plate) → place(stove front) · budget 290 · lease 12 s<br>${CONTRACT}`); caption('<b>Substitution inside the episode.</b> The placement goal is preserved while the physical operation changes. The library supplies the alternative; governance decides when to use it.'); log(10, 'fast', 'substitute pick_and_place(plate → stove front)'); refuseMark.setAttribute('opacity', 0.35); target.setAttribute('transform', `translate(${frontOfStove().x},${TABLE_Y - 2})`); target.setAttribute('opacity', 1); } });
    S.push({ dur: 1.0, start() { cmd(`approach(plate) · analytic<br>${CONTRACT}`); decide('continue', 'CONTINUE_SKILL', 'progress rising, lease held'); log(12, 'exec', 'approach(plate)'); cur.from = here(); refuseMark.setAttribute('opacity', 0); }, tick(t) { moveTo(cur.from, above(objs.plate), 40)(t); monitor(0.15 * t, 0, 'low'); stepTick(12, 30, total)(t); } });
    S.push({ dur: 0.6, start() { log(42, 'exec', 'guarded_descend'); cur.from = here(); }, tick(t) { moveTo(cur.from, at(objs.plate))(t); monitor(0.15 + 0.15 * t, 0, 'low'); setStep(42 + 32 * t); } });
    S.push({ dur: 0.35, start() { log(74, 'exec', 'close_jaw'); }, tick(t) { state.g = 1 - t; }, end() { state.held = objs.plate; } });
    S.push({ dur: 0.5, start() { log(106, 'exec', 'lift'); decide('continue', 'CONTINUE_SKILL', 'plate grasped ✓ · progress 0.5'); cur.from = here(); }, tick(t) { moveTo(cur.from, above(objs.plate))(t); monitor(0.3 + 0.2 * t, 0, 'low'); stepTick(106, 20, total)(t); } });
    S.push({ dur: 1.2, start() { cmd(`transport(stove front) · analytic<br>${CONTRACT}`); log(144, 'exec', 'transport(stove front)'); caption('<b>Carried, not pushed.</b> In the recorded episode the fast brain took 34 decisions; the frozen policy on the same seed spent all 300 steps and failed.'); cur.from = here(); }, tick(t) { moveTo(cur.from, { x: frontOfStove().x, y: frontOfStove().top - 16 - 60 }, 20)(t); monitor(0.5 + 0.35 * t, 0, 'low'); stepTick(144, 60, total)(t); } });
    S.push({ dur: 0.5, start() { log(204, 'exec', 'lower'); cur.from = here(); }, tick(t) { moveTo(cur.from, { x: frontOfStove().x, y: frontOfStove().top - 16 })(t); monitor(0.85 + 0.1 * t, 0, 'low'); setStep(204 + 15 * t); } });
    S.push({ dur: 0.35, start() { log(220, 'exec', 'release'); }, tick(t) { state.g = t; }, end() { state.held = null; objs.plate.x = frontOfStove().x; objs.plate.top = frontOfStove().top; } });
    S.push({ dur: 0.5, start() { cur.from = here(); }, tick(t) { moveTo(cur.from, { x: frontOfStove().x, y: frontOfStove().top - 80 })(t); setStep(230 + 15 * t); } });
    S.push({ dur: 1.4, start() { target.setAttribute('opacity', 0); flash.setAttribute('cx', objs.plate.x); flash.setAttribute('cy', objs.plate.top); monitor(1, 0, 'low'); decide('end', 'END · latched verdict', 'predicate true at step 245; the command ends'); cmd('completed · 246 of 300 steps · refusal + substitution + outcome → evidence store'); caption('<b>Success in 246 of 300 steps.</b> push_object records no completion, yet its source cell rose from 0% to 40% on the same seeds.', 'ok'); log(245, 'verdict', 'latched: success'); outcome('success · 246 / 300 steps', 'ok'); }, tick(t) { flash.setAttribute('opacity', 1 - t); flash.setAttribute('r', 20 + 30 * t); } });
    S.push({ dur: 1.0, start() { lit('evo'); caption('<b>Evidence</b>: the refusal reason, the substitution and the outcome are all in the store that self-evolution reads.'); } });
    return S;
  }

  function stoveScript() {
    // turn on the stove (goal_swap[7]): a knob turn that stalls is caught by the
    // verifier, a recovery skill returns to the verified pre-grasp pose, the retry completes
    const S = [], total = 300;
    const steps = ['locate the stove knob', 'turn_knob_object(stove)'];
    let cur = {};
    openingSteps(S, total, steps, 'advisory: turn_knob_object(stove)', 'knob bound · affordance switchable ✓ · reachable', 'ground turn_knob(stove): ok · budget 300 · lease 12 s');
    S.push({ dur: 1.0, start() { cmd(`approach(knob) · analytic skill<br>${CONTRACT}`); decide('continue', 'CONTINUE_SKILL', 'progress rising, lease held'); caption('<b>Physical harness</b> runs the bounded command: approach the knob, seat the jaw, rotate.'); log(10, 'exec', 'approach(knob)'); cur.from = here(); }, tick(t) { const k = knobPos(); moveTo(cur.from, { x: k.x, y: k.y - 16 - 60 }, 40)(t); monitor(0.12 * t, 0, 'low'); stepTick(10, 30, total)(t); } });
    S.push({ dur: 0.5, start() { log(40, 'exec', 'guarded_descend to the knob'); cur.from = here(); }, tick(t) { const k = knobPos(); moveTo(cur.from, { x: k.x, y: k.y - 16 })(t); monitor(0.12 + 0.1 * t, 0, 'low'); setStep(40 + 20 * t); } });
    S.push({ dur: 0.3, start() { log(60, 'exec', 'close_jaw on the knob'); }, tick(t) { state.g = 1 - 0.85 * t; setStep(60 + 8 * t); } });
    // first attempt: the knob turns a little, then the jaw slips and progress stops
    S.push({ dur: 1.3, start() { cmd(`turn_knob · rotate · analytic<br>${CONTRACT}`); log(68, 'exec', 'turn_knob: rotating'); }, tick(t) { const k = knobPos(); objs.stove.knobAngle = 35 * clamp(t / 0.4, 0, 1); const prog = 0.22 + 0.12 * clamp(t / 0.4, 0, 1); const stag = t < 0.45 ? 0 : t < 0.65 ? 1 : t < 0.85 ? 2 : 3; monitor(prog, stag, stag >= 2 ? 'mid' : 'low'); if (stag === 1) { decide('continue', 'CONTINUE_SKILL', 'progress 0.34 · no change this tick'); } if (stag === 2) { decide('continue', 'CONTINUE_SKILL', 'progress flat for 2 ticks (1.0 s)'); stall(k.x, k.y, true); } if (stag === 3 && !cur.flagged) { cur.flagged = true; decide('intervene', 'INTERVENE · stagnation', 'progress flat for 3 ticks (1.5 s): the knob slipped in the jaw'); caption('<b>Failure detected in 1.5 s.</b> Three decisions without progress: the verifier flags stagnation and the fast brain intervenes instead of letting the stage run out the budget.', 'refuse'); log(104, 'fail', 'verifier: stagnation · knob slipped · progress 0.34'); } stepTick(68, 36, total)(t); } });
    S.push({ dur: 0.9, start() { cmd(`keyframe_recovery · recovery skill<br>${CONTRACT}`); decide('intervene', 'INTERVENE · keyframe_recovery', 'return to the verified pre-grasp pose, then retry the same capability'); caption('<b>Recovery, not retry-in-place.</b> keyframe_recovery returned the arm to a recorded pose on all 35 of its invocations in the analyzed round.'); log(104, 'recover', 'keyframe_recovery → verified pre-grasp pose'); stall(0, 0, false); cur.from = here(); }, tick(t) { const k = knobPos(); state.g = 0.15 + 0.85 * clamp(t * 2, 0, 1); moveTo(cur.from, { x: k.x, y: k.y - 16 - 40 })(t); monitor(0.34, 0, 'low'); stepTick(104, 22, total)(t); } });
    S.push({ dur: 0.5, start() { log(126, 'exec', 're-seat jaw on the knob'); decide('continue', 'CONTINUE_SKILL', 'retry turn_knob · budget 174 left'); cmd(`turn_knob · retry · analytic<br>${CONTRACT}`); cur.from = here(); }, tick(t) { const k = knobPos(); moveTo(cur.from, { x: k.x, y: k.y - 16 })(t); state.g = 1 - 0.85 * clamp((t - 0.6) / 0.4, 0, 1); setStep(126 + 18 * t); } });
    S.push({ dur: 1.2, start() { log(144, 'exec', 'turn_knob: rotating'); caption('<b>Second attempt.</b> A knob turn costs 211 steps at the median, so a stalled attempt must be caught early for a retry to fit in the budget.'); }, tick(t) { objs.stove.knobAngle = 35 + 55 * ease(t); monitor(0.34 + 0.6 * t, 0, 'low'); if (t > 0.8) objs.stove.burner.setAttribute('opacity', (t - 0.8) / 0.2); decide('continue', 'CONTINUE_SKILL', `progress ${(0.34 + 0.6 * t).toFixed(2)} · rising`); stepTick(144, 80, total)(t); } });
    S.push({ dur: 1.4, start() { const k = knobPos(); flash.setAttribute('cx', objs.stove.x - 14); flash.setAttribute('cy', objs.stove.top + 11); monitor(1, 0, 'low'); decide('end', 'END · latched verdict', 'predicate true at step 224; the command ends'); cmd('completed · 224 of 300 steps · stall, recovery, retry and outcome → evidence store'); caption('<b>Verdict latched.</b> On this cell the frozen policy scores 0 of 20 and DynaHarness 20 of 20. turn_knob_object completes 21% of its invocations, yet its source cell rose from 0% to 95%: failed attempts are caught and retried inside the episode.', 'ok'); log(224, 'verdict', 'latched: success'); outcome('success · 224 / 300 steps', 'ok'); state.g = 1; cur.from = here(); }, tick(t) { flash.setAttribute('opacity', 1 - t); flash.setAttribute('r', 20 + 30 * t); const k = knobPos(); moveTo(cur.from, { x: k.x, y: k.y - 16 - 50 })(t); } });
    S.push({ dur: 1.2, start() { lit('evo'); caption('<b>Evidence</b>: the stall, the recovery and the retry are rows in the same store that attribution reads offline.'); } });
    return S;
  }

  function drawerScript() {
    // open the middle drawer (goal_swap[0]): a pull that stalls after a misaligned
    // contact is caught, the hand is re-seated, the second pull opens the drawer
    const S = [], total = 300;
    const steps = ['locate the drawer handle', 'slide_drawer_object(middle drawer)'];
    let cur = {};
    openingSteps(S, total, steps, 'advisory: slide_drawer_object(middle drawer)', 'handle bound (15.4 mm) · grasp point 20 mm along the handle · closure limit widened', 'ground slide_drawer(middle): ok · budget 300 · lease 12 s');
    S.push({ dur: 1.1, start() { cmd(`approach(handle) · analytic skill<br>${CONTRACT}`); decide('continue', 'CONTINUE_SKILL', 'progress rising, lease held'); caption('<b>Physical harness</b> runs the bounded command: approach the handle, close on it, pull.'); log(10, 'exec', 'approach(handle)'); cur.from = here(); }, tick(t) { const hnd = handlePos(); moveTo(cur.from, { x: hnd.x - 6, y: hnd.y - 16 - 50 }, 30)(t); monitor(0.1 * t, 0, 'low'); stepTick(10, 30, total)(t); } });
    S.push({ dur: 0.5, start() { log(40, 'exec', 'guarded_descend to the handle'); cur.from = here(); }, tick(t) { const hnd = handlePos(); moveTo(cur.from, { x: hnd.x - 6, y: hnd.y - 22 })(t); monitor(0.1 + 0.08 * t, 0, 'low'); setStep(40 + 18 * t); } });
    S.push({ dur: 0.3, start() { log(58, 'exec', 'close_jaw on the handle'); }, tick(t) { state.g = 1 - 0.8 * t; setStep(58 + 8 * t); } });
    // first pull: the drawer moves a little, then the hand, seated too high, loses the handle
    S.push({ dur: 1.3, start() { cmd(`slide_drawer · pull · analytic<br>${CONTRACT}`); log(66, 'exec', 'slide_drawer: pulling'); }, tick(t) { const pull = 9 * clamp(t / 0.35, 0, 1); objs.cabinet.pull = pull; const hnd = handlePos(); state.wx = hnd.x - 6; state.wy = hnd.y - 22; const prog = 0.18 + 0.14 * clamp(t / 0.35, 0, 1); const stag = t < 0.45 ? 0 : t < 0.65 ? 1 : t < 0.85 ? 2 : 3; monitor(prog, stag, stag >= 2 ? 'mid' : 'low'); if (stag === 1) decide('continue', 'CONTINUE_SKILL', 'progress 0.32 · no change this tick'); if (stag === 2) { decide('continue', 'CONTINUE_SKILL', 'progress flat for 2 ticks (1.0 s)'); stall(hnd.x - 6, hnd.y - 22, true); } if (stag === 3 && !cur.flagged) { cur.flagged = true; decide('intervene', 'INTERVENE · stagnation', 'pull stalled: the hand sat too high after contact'); caption('<b>Stall detected in 1.5 s.</b> The probe of this cell found three physical causes: a forearm wedged against the wine rack, a closure limit that rejected a third of grasps on the 15.4 mm handle, and a hand that sat too high after contact.', 'refuse'); log(102, 'fail', 'verifier: stagnation · pull stalled · progress 0.32'); } stepTick(66, 36, total)(t); } });
    S.push({ dur: 0.9, start() { cmd(`re-seat · recovery inside slide_drawer<br>${CONTRACT}`); decide('intervene', 'INTERVENE · re-seat', 're-seat the hand after the misaligned contact; give up only after two consecutive stalled pulls'); caption('<b>Re-seat, then pull again.</b> The revision is stated in physical quantities (a grasp shifted 20 mm along the handle, a re-seat after contact), never keyed to a task.'); log(102, 'recover', 're-seat the hand on the handle'); stall(0, 0, false); cur.from = here(); }, tick(t) { const hnd = handlePos(); state.g = t < 0.5 ? 0.2 + 0.8 * (t / 0.5) : 1 - 0.8 * ((t - 0.5) / 0.5); state.wy = lerp(cur.from.y, hnd.y - 14, ease(clamp(t / 0.6, 0, 1))); state.wx = hnd.x - 6; monitor(0.32, 0, 'low'); stepTick(102, 24, total)(t); } });
    S.push({ dur: 1.3, start() { log(126, 'exec', 'slide_drawer: pulling'); decide('continue', 'CONTINUE_SKILL', 'progress rising · budget 174 left'); cmd(`slide_drawer · pull · analytic<br>${CONTRACT}`); }, tick(t) { objs.cabinet.pull = 9 + 30 * ease(t); const hnd = handlePos(); state.wx = hnd.x - 6; state.wy = hnd.y - 14; monitor(0.32 + 0.66 * t, 0, 'low'); decide('continue', 'CONTINUE_SKILL', `progress ${(0.32 + 0.66 * t).toFixed(2)} · rising`); stepTick(126, 90, total)(t); } });
    S.push({ dur: 1.4, start() { const hnd = handlePos(); flash.setAttribute('cx', hnd.x - 10); flash.setAttribute('cy', hnd.y); monitor(1, 0, 'low'); decide('end', 'END · latched verdict', 'drawer joint past its threshold at step 216; the command ends'); cmd('completed · 216 of 300 steps · stall, re-seat and outcome → evidence store'); caption('<b>Drawer open.</b> Attribution charged the drawer cells to the capability layer; two changes stated in those quantities raised this cell from 55% to 100% and Goal success from 75.25% to 78.0% over 400 episodes.', 'ok'); log(216, 'verdict', 'latched: success'); outcome('success · 216 / 300 steps', 'ok'); state.g = 1; cur.from = here(); }, tick(t) { flash.setAttribute('opacity', 1 - t); flash.setAttribute('r', 20 + 30 * t); moveTo(cur.from, { x: cur.from.x - 30, y: cur.from.y - 60 })(t); } });
    S.push({ dur: 1.2, start() { lit('evo'); caption('<b>Evidence</b>: before these changes, slide_drawer_object completed none of its 21 invocations. Retrying does not help when a capability does not complete; attribution named the layer to revise.'); } });
    return S;
  }

  /* ---------- frozen-policy scripts ---------- */
  function policyIntro(S, total, what) {
    S.push({ dur: 0.8, start() { lit(null); plan([], -1, null, null, 'no plan: the policy owns the episode'); slow('not consulted'); decide('idle', 'not consulted', 'the policy owns the episode: nothing grounds, refuses, verifies or stops it'); cmd('π0.5 chunks of 10 actions, 20 Hz · contract: none'); monitor(0, 0, 'low'); caption(`<b>Frozen π0.5 alone.</b> One policy runs from the first step to the last. ${what}`); setStep(0); setBudget(0, total); log(0, 'exec', 'vla_act × 30 chunks'); } });
  }
  let lastChunk = -1;
  function chunkLog(step) { const k = Math.floor(step / 10); if (k !== lastChunk && k > 0) { lastChunk = k; log(k * 10, 'exec', `vla_act · chunk ${k} of 30 · no verdict read`); } }
  function policyEnd(S, total, why, stat) {
    S.push({ dur: 1.6, start() { setBudget(1, total, true); caption(`<b>Budget spent: failure.</b> ${stat}`, 'refuse'); log(total, 'fail', 'budget exhausted · episode failed'); outcome('failure · budget spent', 'bad'); decide('fail', 'no verdict read', why); } });
  }
  function policyMugScript() {
    const S = [], total = 300;
    const T = ctl.task === 'mug';
    const goal = T ? objs.mug : objs.plate;
    // the visuomotor prior aims at the unperturbed layout
    const aim = ctl.swap ? { x: LAYOUT[T ? 'mug' : 'plate'].x, top: goal.top } : { x: goal.x, top: goal.top };
    let cur = {};
    policyIntro(S, total, 'Nothing grounds, refuses, verifies or stops it.');
    S.push({ dur: 1.4, start() { cur.from = here(); lastChunk = -1; }, tick(t) { moveTo(cur.from, { x: aim.x, y: aim.top - 16 - 60 }, 30)(t); stepTick(0, 40, total)(t); chunkLog(40 * t); } });
    S.push({ dur: 2.6, start() { caption(ctl.swap ? '<b>Swap perturbation.</b> The prior heads for where the object used to be; contact never comes.' : '<b>Approach without a verifier.</b> The grasp closes early or late; the policy keeps issuing chunks.'); cur.from = here(); }, tick(t) { const k = t; state.wx = aim.x + Math.sin(k * 9) * 22; state.wy = aim.top - 16 - 30 + Math.sin(k * 14) * 18; state.g = 0.5 + 0.5 * Math.sin(k * 11); stepTick(40, 150, total)(t); chunkLog(40 + 150 * t); } });
    S.push({ dur: 2.0, start() { caption('<b>Failures run out the budget.</b> In the analyzed round, 254 of 258 failures ended at 99% or more of their budget.'); log(190, 'fail', 'stagnation: 173 steps after last progress (median), nobody reads it'); }, tick(t) { const k = t; state.wx = aim.x + 30 + Math.sin(k * 7) * 26; state.wy = aim.top - 16 - 40 + Math.cos(k * 10) * 14; state.g = 0.5 + 0.5 * Math.sin(k * 9); setStep(190 + 110 * t); setBudget((190 + 110 * t) / total, total, t > 0.85); chunkLog(190 + 110 * t); } });
    policyEnd(S, total, 'a failure spends 173 steps after its last progress (median over 5,805 episodes)', 'Frozen π0.5 scores 16.2% on these LIBERO-Pro cells; DynaHarness with the same policy and a 4B upper model scores 74.25%.');
    return S;
  }
  function policyStoveScript() {
    const S = [], total = 300; let cur = {};
    policyIntro(S, total, 'A knob that turns is neither verified nor held.');
    S.push({ dur: 1.4, start() { cur.from = here(); lastChunk = -1; }, tick(t) { const k = knobPos(); moveTo(cur.from, { x: k.x + 8, y: k.y - 16 - 30 }, 30)(t); stepTick(0, 40, total)(t); chunkLog(40 * t); } });
    S.push({ dur: 2.6, start() { caption('<b>The knob turns, and turns back.</b> In <em>turn off the stove</em> the same policy turned the knob off at step 44 and on again by step 55: a 0.55 s success that only a latched, chunk-level read can keep.'); cur.from = here(); }, tick(t) { const k = knobPos(); state.wx = k.x + 6 + Math.sin(t * 8) * 8; state.wy = k.y - 16 + Math.sin(t * 13) * 5; state.g = 0.2 + 0.4 * Math.abs(Math.sin(t * 6)); objs.stove.knobAngle = 40 * Math.max(0, Math.sin(t * 5.5)); stepTick(40, 150, total)(t); chunkLog(40 + 150 * t); } });
    S.push({ dur: 2.0, start() { caption('<b>Failures run out the budget.</b> In the analyzed round, 254 of 258 failures ended at 99% or more of their budget.'); log(190, 'fail', 'stagnation: 173 steps after last progress (median), nobody reads it'); }, tick(t) { const k = knobPos(); state.wx = k.x - 10 + Math.sin(t * 7) * 18; state.wy = k.y - 16 - 24 + Math.cos(t * 9) * 12; state.g = 0.5 + 0.5 * Math.sin(t * 9); objs.stove.knobAngle = 20 * Math.max(0, Math.sin(t * 4)); setStep(190 + 110 * t); setBudget((190 + 110 * t) / total, total, t > 0.85); chunkLog(190 + 110 * t); } });
    policyEnd(S, total, 'no verifier, no latch: the knob state at the last step is what counts', 'On goal_swap[7] (<em>turn on the stove</em>) frozen π0.5 scores 0 of 20 seeds; DynaHarness 20 of 20 in round 39.');
    return S;
  }
  function policyDrawerScript() {
    const S = [], total = 300; let cur = {};
    policyIntro(S, total, 'The handle is 15.4 mm; the prior closes beside it.');
    S.push({ dur: 1.4, start() { cur.from = here(); lastChunk = -1; }, tick(t) { const hnd = handlePos(); moveTo(cur.from, { x: hnd.x - 14, y: hnd.y - 16 - 30 }, 30)(t); stepTick(0, 40, total)(t); chunkLog(40 * t); } });
    S.push({ dur: 2.6, start() { caption('<b>Grasp beside the handle.</b> The jaw closes and pulls air; no check reads whether the drawer moved, so the chunks keep coming.'); cur.from = here(); }, tick(t) { const hnd = handlePos(); state.wx = hnd.x - 14 + Math.sin(t * 8) * 10; state.wy = hnd.y - 24 + Math.sin(t * 12) * 6; state.g = 0.5 + 0.5 * Math.sin(t * 7); stepTick(40, 150, total)(t); chunkLog(40 + 150 * t); } });
    S.push({ dur: 2.0, start() { caption('<b>Failures run out the budget.</b> In the analyzed round, 254 of 258 failures ended at 99% or more of their budget.'); log(190, 'fail', 'stagnation: 173 steps after last progress (median), nobody reads it'); }, tick(t) { const hnd = handlePos(); state.wx = hnd.x - 30 + Math.sin(t * 6) * 20; state.wy = hnd.y - 40 + Math.cos(t * 9) * 14; state.g = 0.5 + 0.5 * Math.sin(t * 9); setStep(190 + 110 * t); setBudget((190 + 110 * t) / total, total, t > 0.85); chunkLog(190 + 110 * t); } });
    policyEnd(S, total, 'no grasp check, no stagnation check, no recovery', 'On goal_swap[0] (<em>open the middle drawer</em>) frozen π0.5 scores 0 of 20 seeds; six drawer cells sat at zero until a drawer capability existed.');
    return S;
  }

  /* ---------- runner ---------- */
  let seq = [], idx = 0, t0 = 0, waiting = false;
  function script() {
    if (ctl.mode === 'harness') return ctl.task === 'mug' ? mugScript() : ctl.task === 'push' ? pushScript() : ctl.task === 'stove' ? stoveScript() : drawerScript();
    return ctl.task === 'stove' ? policyStoveScript() : ctl.task === 'drawer' ? policyDrawerScript() : policyMugScript();
  }
  function start() { resetScene(); P.task.textContent = `"${TASKS[ctl.task].instr}"`; log(null, 'scene', `episode started · "${TASKS[ctl.task].instr}"${ctl.swap && (ctl.task === 'mug' || ctl.task === 'push') ? ' · swap perturbation' : ''}`); seq = script(); idx = -1; next(); }
  function next() { idx++; if (idx >= seq.length) { waiting = true; setTimeout(() => { waiting = false; start(); }, 2400); return; } t0 = performance.now(); if (seq[idx].start) seq[idx].start(); }
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    last = now;
    tickRates(now);
    if (!ctl.playing || waiting || !seq[idx]) return;
    const a = seq[idx]; const t = clamp((now - t0) / (a.dur * 1000), 0, 1);
    if (a.tick) a.tick(t);
    render();
    if (t >= 1) { if (a.end) a.end(); render(); next(); }
  }

  /* ---------- rate lanes ---------- */
  const lanes = { safety: $('#lane-safety'), ctrl: $('#lane-ctrl'), fast: $('#lane-fast'), slow: $('#lane-slow') };
  const laneTicks = {};
  function buildLane(name, n) { const ln = lanes[name]; if (!ln) return; laneTicks[name] = []; for (let i = 0; i < n; i++) { const i_ = document.createElement('i'); ln.appendChild(i_); laneTicks[name].push(i_); } }
  buildLane('safety', 60); buildLane('ctrl', 24); buildLane('fast', 4); buildLane('slow', 2);
  function tickRates(now) {
    const spans = { safety: 60, ctrl: 24, fast: 4, slow: 2 };
    for (const k in laneTicks) {
      const ticks = laneTicks[k]; const n = spans[k];
      const speed = 0.06; // fraction of lane per second
      for (let i = 0; i < ticks.length; i++) {
        let p = ((i / n) + (now / 1000) * speed) % 1;
        if (k === 'slow') { const on = P.slow.classList.contains('lit'); ticks[i].style.opacity = on ? 0.9 : 0.2; }
        ticks[i].style.left = (p * 100) + '%';
      }
    }
  }

  /* ---------- wire controls ---------- */
  const swapBtn = $('#btn-swap');
  function syncSwap() { if (!swapBtn) return; const ok = ctl.task === 'mug' || ctl.task === 'push'; swapBtn.disabled = !ok; swapBtn.classList.toggle('active', ctl.swap && ok); swapBtn.title = ok ? 'Swap the mug and the plate before the episode starts' : 'The swap perturbation applies to the mug and plate tasks'; }
  $$('[data-mode]').forEach(b => b.addEventListener('click', () => { $$('[data-mode]').forEach(x => x.classList.toggle('active', x === b)); ctl.mode = b.dataset.mode; start(); }));
  $$('[data-task]').forEach(b => b.addEventListener('click', () => { $$('[data-task]').forEach(x => x.classList.toggle('active', x === b)); ctl.task = b.dataset.task; syncSwap(); start(); }));
  if (swapBtn) swapBtn.addEventListener('click', () => { ctl.swap = !ctl.swap; syncSwap(); start(); });
  const playBtn = $('#btn-play'); if (playBtn) playBtn.addEventListener('click', () => { ctl.playing = !ctl.playing; playBtn.textContent = ctl.playing ? 'Pause' : 'Play'; if (ctl.playing) t0 = performance.now(); });
  const replayBtn = $('#btn-replay'); if (replayBtn) replayBtn.addEventListener('click', start);
  syncSwap();

  // subtle parallax on the scene
  root.addEventListener('pointermove', e => { const r = root.getBoundingClientRect(); const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5; svg.style.transform = `translate(${dx * -6}px, ${dy * -4}px)`; });
  root.addEventListener('pointerleave', () => { svg.style.transform = ''; });

  // pause when off screen
  if ('IntersectionObserver' in window) { new IntersectionObserver(es => { es.forEach(x => { ctl.playing = x.isIntersecting ? (playBtn ? playBtn.textContent === 'Pause' : true) : false; if (x.isIntersecting) t0 = performance.now(); }); }, { threshold: 0.1 }).observe(root); }

  start();
  requestAnimationFrame(frame);
})();
