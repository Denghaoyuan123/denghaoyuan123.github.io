/* DynaHarness project page: every number below is copied from the paper
   draft (paper/sections/*.tex) or its evidence tables (paper_ref_pkg/tables).
   Do not edit numbers here without editing the paper first. */
window.DH = (function () {
  const CELLS = ['Goal-T', 'Goal-S', '10-T', '10-S'];

  /* Table 1: success rate (%) on four LIBERO-Pro cells. v = [Goal-T, Goal-S, 10-T, 10-S]. */
  const MAIN = [
    { m: 'OpenVLA', vlm: 'none', grp: 'backbone', v: [0, 0, 0, 0], avg: 0.0, src: 'LIBERO-Pro paper, Tables 2 and 4' },
    { m: 'π0.5', vlm: 'none', grp: 'backbone', v: [0, 38, 1, 8], avg: 11.8, src: 'LIBERO-Pro paper, Tables 2 and 4' },
    { m: 'π0.5 (our run)', vlm: 'none', grp: 'backbone', v: [19.5, 17.5, 20, 8], avg: 16.2, ours: true, matched: true, src: 'our run, seeds 21–40, 800 episodes' },
    { m: 'π0.5-SFT', vlm: 'none', grp: 'backbone', v: [45, 42, 49, 14], avg: 37.5, src: 'Harness VLA paper, Table 3' },
    { m: 'Fast-WAM', vlm: 'none', grp: 'backbone', v: [9, 6, 11, 0], avg: 6.5, src: 'supplied by its authors' },
    { m: 'PhyAgentOS', vlm: 'GPT-4o-mini', grp: 'agentic', v: [21, 35.5, 18, 10.5], avg: 21.3, ours: true, src: 'our run, 200 episodes per cell' },
    { m: 'PhyAgentOS', vlm: 'Qwen3-VL-4B', grp: 'agentic', v: [23, 33.5, 15.5, 9], avg: 20.3, ours: true, matched: true, src: 'our run, same model, same frozen π0.5' },
    { m: 'EmbodiedSkills', vlm: 'Qwen3-VL-4B', grp: 'agentic', v: [11, 19.5, 14.5, 12.5], avg: 14.4, ours: true, matched: true, src: 'our run, author-confirmed' },
    { m: 'ENPIRE', vlm: 'Qwen3-VL-4B', grp: 'agentic', v: [10, 11.5, 0, 0], avg: 5.4, ours: true, matched: true, src: 'our run, 200 episodes per cell' },
    { m: 'CaP-Agent0', vlm: 'not stated', grp: 'agentic', v: [16.8, 25.6, 2.4, 5.2], avg: 12.5, src: 'CaP-X Table 7; ASPIRE Table 5' },
    { m: 'RHO', vlm: 'Codex / Claude Code', grp: 'agentic', v: [55.6, 50.6, null, null], avg: null, src: 'RHO paper, Table 7' },
    { m: 'SPARK', vlm: 'Gemini 3.1 Pro', grp: 'agentic', v: [14, 40, null, null], avg: null, src: 'SPARK paper, Table 1' },
    { m: 'Pigey', vlm: 'Claude Opus 4.7', grp: 'agentic', v: [22, 44, null, null], avg: null, src: 'Pigey paper, Table 15' },
    { m: 'Pigey', vlm: 'Claude Haiku 4.5', grp: 'agentic', v: [20, 38, null, null], avg: null, src: 'Pigey paper, Table 15' },
    { m: 'Pigey', vlm: 'Gemini 3.5 Flash', grp: 'agentic', v: [28, 48, null, null], avg: null, src: 'Pigey paper, Table 15' },
    { m: 'Pigey', vlm: 'GPT-5.5', grp: 'agentic', v: [24, 44, null, null], avg: null, src: 'Pigey paper, Table 15' },
    { m: 'VLS', vlm: 'not stated', grp: 'agentic', v: [33.5, 38, 25.5, 15.5], avg: 28.1, src: 'VLS paper, Table I' },
    { m: 'Harness VLA', vlm: 'GPT-5.5 (Codex)', grp: 'agentic', v: [75, 66, 52, 49], avg: 60.5, src: 'Harness VLA paper, Table 3 (π0.5-SFT)' },
    { m: 'Harness VLA', vlm: 'Claude Opus 4.7 (Claude Code)', grp: 'agentic', v: [87, 87, 71, 62], avg: 76.8, src: 'Harness VLA paper, Table 3 (π0.5-SFT)' },
    { m: 'Harness VLA', vlm: 'Qwen3-VL-4B', grp: 'agentic', v: [14, 7, 3, 0], avg: 6.0, ours: true, matched: true, src: 'our run, same model, same frozen π0.5' },
    { m: 'Zetta', vlm: 'GPT-5.6 sol', grp: 'agentic', v: [92.5, 89, 63, 40], avg: 71.1, src: 'Zetta paper, Table 3' },
    { m: 'Zetta', vlm: 'Qwen3-VL-4B', grp: 'agentic', v: [0, 0, 0, 0], avg: 0.0, ours: true, matched: true, src: 'our run of the released code' },
    { m: 'ASPIRE', vlm: 'Claude Opus 4.6', grp: 'agentic', v: [45, 81, 38.3, 22.6], avg: 46.7, src: 'ASPIRE paper, Tables 2 and 5' },
    { m: 'DynaHarness', vlm: 'Qwen3-VL-4B', grp: 'ours', v: [75, 81, 76, 65], avg: 74.25, ours: true, matched: true, dh: true, src: 'archived development aggregate, seeds 21–40' },
  ];

  /* Success against upper-model scale (Fig. 1b). x is a categorical slot. */
  const SCALE = [
    { m: 'DynaHarness', vlm: 'Qwen3-VL-4B', slot: 0, v: 74.25, dh: true },
    { m: 'PhyAgentOS', vlm: 'Qwen3-VL-4B', slot: 0, v: 20.3 },
    { m: 'Harness VLA', vlm: 'Qwen3-VL-4B', slot: 0, v: 6.0 },
    { m: 'ENPIRE', vlm: 'Qwen3-VL-4B', slot: 0, v: 5.4 },
    { m: 'Zetta', vlm: 'Qwen3-VL-4B', slot: 0, v: 0.0 },
    { m: 'PhyAgentOS', vlm: 'GPT-4o-mini', slot: 1, v: 21.3 },
    { m: 'Harness VLA', vlm: 'GPT-5.5 (Codex)', slot: 2, v: 60.5 },
    { m: 'ASPIRE', vlm: 'Claude Opus 4.6', slot: 3, v: 46.7 },
    { m: 'Zetta', vlm: 'GPT-5.6 sol', slot: 4, v: 71.1 },
    { m: 'Harness VLA', vlm: 'Claude Opus 4.7 (Claude Code)', slot: 5, v: 76.8 },
  ];
  const SCALE_SLOTS = ['Qwen3-VL-4B\n(4B, open)', 'GPT-4o-mini', 'GPT-5.5', 'Claude Opus 4.6', 'GPT-5.6 sol', 'Claude Opus 4.7'];

  /* Table 2A: frozen snapshots, development block vs 800 new states. */
  const TRANSFER = [
    { name: 'stat23', dev: 60.00, nw: 60.9 },
    { name: 'stat28', dev: 66.25, nw: 65.9 },
    { name: 'stat39', dev: 72.75, nw: 74.2 },
    { name: 'Final', dev: 74.25, nw: 75.2 },
  ];

  /* Post-selection by suite (Appendix Table). C = 800 new states; B = 261 untouched official states. */
  const POST = {
    C: { dh: [79.0, 78.0, 77.5, 66.5], pi: [26.5, 19.5, 17.5, 6.5], n: 800, dhAll: 75.2, piAll: 17.5, wl: '473 / 11' },
    B: { dh: [78.1, 81.8, 75.3, 71.1], pi: [26.0, 25.8, 7.8, 2.2], n: 261, dhAll: 77.0, piAll: 16.5, wl: '161 / 3' },
  };

  /* Table 2B and Appendix: capability and executor ablations, 800 development episodes per arm. */
  const ABL = [
    { name: 'Full DynaHarness (A2ctrl)', v: [150, 161, 152, 129], tot: 592, pct: 74.0, d: null, note: 'concurrent control' },
    { name: 'Nominal replanning (A2static)', v: [130, 150, 117, 114], tot: 511, pct: 63.9, d: -10.1, note: '89 / 8 exclusive wins, p = 2.0e-18' },
    { name: 'Frozen sequence (A2seq)', v: [130, 159, 115, 106], tot: 510, pct: 63.75, d: -10.3, note: '93 / 11 exclusive wins, p = 2.5e-17' },
    { name: 'No recovery / intervention', v: [149, 161, 145, 130], tot: 585, pct: 73.1, d: -0.9, note: '15 / 8, p = 0.21' },
    { name: 'VLA unavailable', v: [130, 159, 151, 124], tot: 564, pct: 70.5, d: -3.5, note: '32 / 4, p = 1.9e-6' },
    { name: 'No analytic contact skills', v: [54, 32, 31, 16], tot: 133, pct: 16.6, d: -57.4, note: '469 / 10, p = 2.1e-124' },
    { name: 'Neither capability group', v: [47, 31, 36, 12], tot: 126, pct: 15.8, d: -58.2, note: '473 / 7' },
    { name: 'Bare π0.5', v: [39, 35, 40, 16], tot: 130, pct: 16.25, d: null, note: 'archived same-block reference' },
  ];

  /* Mechanism diagnostics on 783 trace-matched Full / A2static pairs. */
  const MECH = [
    { name: 'Failure / escalation replans', full: 566, stat: 0 },
    { name: 'Capability substitutions', full: 471, stat: 0 },
    { name: 'Recovery insertions', full: 141, stat: 0 },
    { name: 'Fixed step retries', full: 0, stat: 534 },
    { name: 'Plan re-executions', full: 0, stat: 255 },
  ];

  /* Development history on seeds 21–40 (Fig. 5a). */
  const ROUNDS = [
    { r: '23', s: 480, n: 800, note: 'latched success verdict' },
    { r: '25', s: 483, n: 800 },
    { r: '28', s: 530, n: 800, note: 'receptacle slots, handle grasp, transport corridor' },
    { r: '29', s: 530, n: 800 },
    { r: '30', s: 541, n: 800, note: 'analyzed round' },
    { r: '31', s: 466, n: 780, rej: true, note: 'rejected: cavity given to any fixture region' },
    { r: '33', s: 540, n: 797, note: 'candidate reverted; five stove cells restored' },
    { r: '34', s: 547, n: 800, note: 'brake before a contact-guarded move' },
    { r: '35', s: 561, n: 800, note: 'wrist turn behind a four-step ramp' },
    { r: '39', s: 582, n: 800, note: 'before the drawer changes' },
    { r: '40', s: 566, n: 800, rej: true, note: 'candidate C2 not kept (70.75%)' },
    { r: 'rep.', s: 594, n: 800, note: 'reported agent, remeasurement' },
  ];

  /* The rejected candidate: change in successes (of 20) on the affected cells. */
  const REJECTED = [
    { cell: 'goal_task[1]', task: 'plate on stove', before: 20, after: 0 },
    { cell: '10_task[2]', task: 'stove on + pan', before: 19, after: 1 },
    { cell: 'goal_swap[1]', task: 'bowl on stove', before: 17, after: 0 },
    { cell: '10_task[8]', task: 'moka pot on stove', before: 17, after: 0 },
    { cell: '10_swap[2]', task: 'stove on + moka', before: 7, after: 0 },
    { cell: '10_swap[9]', task: 'mug in microwave', before: 0, after: 5 },
  ];

  /* Drawer update after attribution (Fig. 5c). */
  const DRAWER = { cell: [55, 90, 100], goal: [75.25, 77.0, 78.0], labels: ['Round 39', '+ grasp shift', '+ re-seat'] };

  /* Tool registry (Appendix Fig. 9 and T4). */
  const REGISTRY = [
    { date: '08-18', cap: 'execute_insertion', why: 'seed library', seed: true },
    { date: '08-19', cap: 'pick_and_place', why: 'seed library', seed: true },
    { date: '08-21', cap: 'perception', why: 'seed library', seed: true },
    { date: '09-05', cap: 'push_object', why: 'a jaw that cannot span the plate had no route (goal_swap[5])' },
    { date: '09-06', cap: 'slide_drawer', why: 'no route to a drawer handle (six drawer cells at zero)' },
    { date: '09-06', cap: 'turn_knob', why: 'no route to a knob (stove cells)' },
    { date: '09-07', cap: 'keyframe_return', why: 'recovery lifted into the air and restored nothing' },
    { date: '09-09', cap: 'swing_door', why: '"close microwave" compiled to no command; the policy owned all 520 steps' },
    { date: '09-10', cap: 'handle_turn', why: 'a handle pointing into the opening', late: true },
  ];

  /* Evolved capabilities as measured objects (Appendix Table). */
  const TOOLS = [
    { cap: 'push_object', inv: 1, compl: 0, cells: 1, conv: 'goal_swap[5]  0 → 8 of 20' },
    { cap: 'slide_drawer_object', inv: 21, compl: 0, cells: 2, conv: '10_task[3]  0 → 0 of 20' },
    { cap: 'turn_knob_object', inv: 33, compl: 21, cells: 1, conv: '10_task[2]  0 → 19 of 20' },
    { cap: 'keyframe_recovery', inv: 35, compl: 100, cells: 2, conv: 'cross-cell' },
    { cap: 'swing_door_object', inv: 1, compl: 0, cells: 1, conv: '10_swap[9]  0 → 7 → 10 of 20' },
  ];

  /* Per-task success (%), 10 tasks per cell. Frozen π0.5 and DynaHarness round 39 on seeds 21–40
     (Appendix per-task table); analyzed round (stat30) from T2_per_cell.csv; held-out block seeds 1–20. */
  const PERTASK = {
    'Goal-T': {
      instr: ['open the bottom drawer of the cabinet', 'put the plate on the stove', 'put the wine bottle in the bowl', 'open the top layer of the drawer and put the cream cheese inside', 'put the plate on the top of the drawer', 'push the cream cheese to the front of the stove', 'put the wine bottle in the bowl', 'turn off the stove', 'put the wine bottle on the plate', 'put the cream cheese on the rack'],
      pi: [0, 5, 25, 0, 10, 0, 15, 85, 55, 0], dh: [0, 100, 100, 0, 90, 95, 95, 90, 95, 80], r30: [0, 100, 100, 5, 90, 95, 95, 90, 95, 80],
      piH: [0, 15, 30, 0, 25, 0, 20, 80, 30, 5], noevo: [0, 15, 20, 0, 5, 0, 10, 15, 40, 0],
    },
    'Goal-S': {
      instr: ['open the middle drawer of the cabinet', 'put the bowl on the stove', 'put the wine bottle on top of the cabinet', 'open the top drawer and put the bowl inside', 'put the bowl on top of the cabinet', 'push the plate to the front of the stove', 'put the cream cheese in the bowl', 'turn on the stove', 'put the bowl on the plate', 'put the wine bottle on the rack'],
      pi: [0, 45, 0, 25, 0, 0, 5, 0, 100, 0], dh: [55, 80, 100, 10, 100, 50, 70, 100, 95, 100], r30: [0, 85, 100, 15, 100, 40, 65, 100, 90, 100],
      piH: [0, 65, 0, 40, 0, 0, 0, 0, 100, 0], noevo: [0, 60, 0, 40, 0, 0, 0, 0, 100, 0],
    },
    '10-T': {
      instr: ['put both the cream cheese and the tomato sauce in the basket', 'put both the alphabet soup and the butter in the basket', 'turn on the stove and put the pan on it', 'put the bottle in the bottom drawer of the cabinet and close it', 'put the yellow and white mug on the left plate and put the white mug on the right plate', 'pick up the cup and place it in the back compartment of the caddy', 'put the red mug on the plate and put the chocolate pudding to the right of the plate', 'put both the ketchup and the cream cheese box in the basket', 'put the left moka pot on the stove', 'put the white mug in the microwave and close it'],
      pi: [65, 40, 0, 0, 0, 0, 0, 0, 95, 0], dh: [85, 95, 95, 0, 100, 95, 90, 100, 100, 0], r30: [85, 95, 95, 0, 100, 95, 75, 100, 85, 0],
      piH: [55, 60, 0, 0, 0, 5, 0, 0, 90, 0], noevo: [55, 55, 0, 0, 0, 5, 0, 0, 85, 0],
    },
    '10-S': {
      instr: ['put both the alphabet soup and the tomato sauce in the basket', 'put both the cream cheese box and the butter in the basket', 'turn on the stove and put the moka pot on it', 'put the black bowl in the bottom drawer of the cabinet and close it', 'put the white mug on the left plate and put the yellow and white mug on the right plate', 'pick up the book and place it in the back compartment of the caddy', 'put the white mug on the plate and put the chocolate pudding to the right of the plate', 'put both the alphabet soup and the cream cheese box in the basket', 'put both moka pots on the stove', 'put the yellow and white mug in the microwave and close it'],
      pi: [0, 30, 5, 0, 0, 45, 0, 0, 0, 0], dh: [90, 90, 35, 0, 95, 65, 90, 95, 40, 45], r30: [70, 85, 35, 0, 95, 75, 75, 95, 0, 0],
      piH: [0, 15, 0, 0, 0, 50, 0, 0, 0, 0], noevo: [0, 15, 0, 0, 0, 35, 0, 0, 0, 0],
    },
  };

  /* Standard LIBERO (Appendix Table). v = [Spatial, Object, Goal, Long]. */
  const LIBERO = [
    { m: 'OpenVLA', vlm: 'none', v: [98, 99, 98, 93], avg: 97.00 },
    { m: 'π0.5', vlm: 'none', v: [98, 98, 97, 93], avg: 96.50 },
    { m: 'π0.5 (our run)', vlm: 'none', v: [99, 99, 98.6, 95.4], avg: 98.00, ours: true },
    { m: 'π0.5-SFT', vlm: 'none', v: [99, 96, 97, 89], avg: 95.25 },
    { m: 'π0.5, task-adapted', vlm: 'none', v: [99, 98.6, 98.4, 93.6], avg: 97.40 },
    { m: 'Fast-WAM', vlm: 'none', v: [98.2, 100, 97, 95.2], avg: 97.60 },
    { m: 'PhyAgentOS', vlm: 'GPT-4o-mini', v: [100, 100, 98, 92], avg: 97.50, ours: true },
    { m: 'PhyAgentOS', vlm: 'Qwen3-VL-4B', v: [98, 99, 98, 96], avg: 97.75, ours: true },
    { m: 'Harness VLA', vlm: 'Claude Opus 4.7', v: [97, 100, 94, 93], avg: 96.00 },
    { m: 'ETA', vlm: 'GPT-5.6 Luna', v: [8, 26, 21, 1], avg: 14.00 },
    { m: 'ETA', vlm: 'GPT-5.6 Sol', v: [100, 80, 80, 70], avg: 82.50 },
    { m: 'DynaHarness', vlm: 'Qwen3-VL-4B', v: [98.8, 99.6, 97, 96.8], avg: 98.05, ours: true, dh: true },
  ];

  /* LIBERO-Plus per perturbation category. Published policies from Table 1 of the LIBERO-Plus paper. */
  const PLUS = {
    labels: ['Camera', 'Robot state', 'Language', 'Light', 'Background', 'Noise', 'Layout'],
    series: [
      { name: 'DynaHarness', v: [66.5, 76.1, 88.5, 96.1, 97.4, 86.9, 86.7], dh: true },
      { name: 'OpenVLA-OFT', v: [59.7, 37.2, 81.5, 85.8, 92.4, 76.7, 77.1] },
      { name: 'π0-fast', v: [66.4, 24.8, 63.3, 73.0, 67.7, 75.8, 70.3] },
      { name: 'π0', v: [15.8, 6.6, 61.0, 79.6, 78.5, 79.4, 70.4] },
    ],
    all: '8462 / 10030 tasks, 84.4%',
  };

  /* Latency of the reported agent (22 concurrent channels) and reference decision times. */
  const LAT = [
    { name: 'DynaHarness fast brain (decision)', ms: 0.046, note: 'p50 of 47,199 decisions; p99 0.071 ms', dh: true },
    { name: 'DynaHarness fast brain, learned variant', ms: 0.49, note: 'p50', dh: true },
    { name: 'DynaHarness slow brain (Qwen3-VL-4B call)', ms: 913, note: 'p50 of 3,090 calls; p99 1,865 ms', dh: true },
    { name: 'Sonnet 5 via Claude Code as slow brain', ms: 6683, note: 'median of 107 calls; Qwen paired median 1,124 ms' },
    { name: 'Harness VLA, Codex inter-turn decision', ms: 4200, note: 'median of 20 decisions, our reproduction' },
    { name: 'PhyAgentOS verifier call (Qwen3-VL-4B)', ms: 4300, note: 'mean per call, LIBERO-Pro' },
  ];
  const RATES = [
    { name: 'Safety check', hz: 50, period: '0.02 s' },
    { name: 'Controller / policy chunk', hz: 20, period: '0.05 s (chunk of 10 = 0.5 s)' },
    { name: 'Fast brain decision', hz: 2, period: '0.5 s' },
    { name: 'Slow brain', hz: null, period: 'on demand, 5.35 calls per episode' },
  ];

  /* Budget used at episode end, analyzed round (T5). */
  const BUDGET = [
    { lo: 0, hi: 10, s: 0, f: 2 }, { lo: 10, hi: 20, s: 18, f: 1 }, { lo: 20, hi: 30, s: 1, f: 1 }, { lo: 30, hi: 40, s: 0, f: 0 },
    { lo: 40, hi: 50, s: 105, f: 0 }, { lo: 50, hi: 60, s: 46, f: 0 }, { lo: 60, hi: 70, s: 150, f: 0 }, { lo: 70, hi: 80, s: 142, f: 0 },
    { lo: 80, hi: 90, s: 36, f: 0 }, { lo: 90, hi: 100, s: 43, f: 254 },
  ];
  const AFTER_PROGRESS = [{ name: 'Success', v: 51 }, { name: 'Failure', v: 173 }, { name: 'Planner-layer failure', v: 220 }];

  /* Steps by executor in filmed successes (T11). */
  const STEPSHARE = [
    { cell: '10-S[9]', a: 89.2, p: 0.0, g: 10.8, r: 0.0 },
    { cell: '10-T[6]', a: 86.3, p: 0.0, g: 13.7, r: 0.0 },
    { cell: '10-T[7]', a: 85.6, p: 0.0, g: 14.4, r: 0.0 },
    { cell: 'Goal-S[5]', a: 79.2, p: 0.0, g: 20.8, r: 0.0 },
    { cell: '10-S[2]  7/20', a: 47.0, p: 48.4, g: 4.6, r: 0.0 },
    { cell: '10-S[3]  0/20', a: 57.6, p: 26.5, g: 10.4, r: 5.5 },
    { cell: '10-T[3]  0/20', a: 42.7, p: 48.1, g: 5.9, r: 3.3 },
    { cell: 'Goal-S[3]  3/20', a: 8.6, p: 91.4, g: 0.0, r: 0.0 },
  ];

  /* Stove window replay (Appendix): 20 replays of "turn off the stove". */
  const STOVE = { on: 44, off: 55, budget: 300, rates: { unlatched20: 25, bare: 80, latched: 95 } };

  /* Real-world tasks, 10 trials each. */
  const REAL = [
    { name: 'Ring placement', short: 'P&P circle', pct: 90, instr: 'Grasp the yellow ring, place it over the green post, then release the gripper and move the robot arm away.' },
    { name: 'Cup stacking', short: 'Stack cups', pct: 80, instr: 'Grasp the pink cup and place it on top of the blue cup. Then grasp the green cup and place it on top of the pink cup.' },
    { name: 'Bread placement', short: 'P&P bread', pct: 70, instr: 'Grasp the bread and place it into the left slot of the toaster, then release the gripper and move the robot arm away.' },
    { name: 'Ring placement in a drawer', short: 'Put in drawer', pct: 70, instr: 'Grasp the handle of the red drawer and pull the drawer open. Then grasp the yellow ring and place it inside the drawer, release the gripper and move the robot arm away, leaving the drawer open.' },
  ];

  /* Filmed DynaHarness episodes for the scrubber (T7 and the case-study appendix).
     video: agentview clips, one frame per environment step at 20 fps (assets/video/sim,
     MANIFEST.csv there). The DynaHarness clips are re-rendered from the episodes' event
     stores and match the paper's keyframes; the frozen-policy clips are fresh rollouts of
     the same seeds recorded for the page (pi0.5 sampling is not seeded), and the frozen
     keyframes were re-cut from them at the same steps. */
  const CASES = [
    {
      id: 'gs5', video: { ours: 'assets/video/sim/gs5_dh.mp4', frozen: 'assets/video/sim/gs5_pi05.mp4', fps: 20 }, cell: 'goal_swap[5]', seed: 22, instr: 'push the plate to the front of the stove', budget: 300, steps: 246, decisions: 34,
      title: 'An infeasible push is refused and replaced within the episode',
      frames: [[0, 'initial'], [10, 'push refused'], [74, 'staging done'], [106, 'plate grasped'], [144, 'carried over'], [245, 'completed']],
      ours: 'dh_gs5_ours', frozen: 'dh_gs5_frozen', frozenEnd: 'fails after all 300 steps',
      log: [
        [0, 'slow brain', 'names push_object for the plate'],
        [10, 'fast brain', 'refuses the push: the jaw is too narrow for the contact; reason recorded'],
        [10, 'fast brain', 'substitutes an eligible pick and place'],
        [74, 'analytic', 'staging complete, guarded descent to the plate'],
        [106, 'analytic', 'jaw closed on the plate, lift'],
        [144, 'analytic', 'transport over the corridor'],
        [245, 'verdict', 'latched benchmark predicate ends the command: success'],
      ],
      effect: 'push_object records no completion, yet its source cell rises from 0% to 40% on the same seeds.',
    },
    {
      id: '10s9', video: { ours: 'assets/video/sim/10s9_dh.mp4', frozen: 'assets/video/sim/10s9_pi05.mp4', fps: 20 }, cell: '10_swap[9]', seed: 21, instr: 'put the yellow and white mug in the microwave and close it', budget: 520, steps: 520, decisions: 54,
      title: 'An admitted door capability completes a long-horizon task',
      frames: [[0, 'initial'], [82, 'staging done'], [130, 'jaw closed'], [208, 'at the cavity'], [250, 'released inside'], [519, 'door shut']],
      ours: 'dh_10s9_ours', frozen: 'dh_10s9_frozen', frozenEnd: 'not completed within 520 steps',
      log: [
        [0, 'slow brain', 'plan: pick mug, place in microwave, close microwave'],
        [82, 'analytic', 'arm staged above the mug'],
        [130, 'analytic', 'jaw closed on the mug'],
        [208, 'analytic', 'mug carried into the cavity'],
        [250, 'analytic', 'released inside; command completed'],
        [250, 'fast brain', 'dispatches swing_door (admitted by the paired gate)'],
        [519, 'verdict', 'latched predicate true: success'],
      ],
      effect: 'Before this capability, "close microwave" compiled to no command and the policy owned all 520 steps. The cell moved from 0% to 35% and later 50%.',
    },
    {
      id: '10t7', video: { ours: 'assets/video/sim/10t7_dh.mp4', frozen: 'assets/video/sim/10t7_pi05.mp4', fps: 20 }, cell: '10_task[7]', seed: 21, instr: 'put both the ketchup and the cream cheese box in the basket', budget: 520, steps: 410, decisions: 55,
      title: 'Two objects, one budget: receptacle slots give each object its place',
      frames: [[0, 'initial'], [40, 'staging done'], [84, '1st jaw closed'], [222, '1st in its slot'], [308, '2nd jaw closed'], [409, 'both placed']],
      ours: 'dh_10t7_ours', frozen: 'dh_10t7_frozen', frozenEnd: 'fails after the whole budget',
      log: [
        [0, 'slow brain', 'plan: two pick-and-place steps into the basket'],
        [84, 'analytic', 'first object grasped'],
        [222, 'analytic', 'first object placed in its slot'],
        [308, 'analytic', 'second object grasped'],
        [409, 'verdict', 'both placed; latched predicate true'],
      ],
      effect: 'Analytic skills account for 85.6% of the steps; the VLA is not called. 110 steps of budget remain.',
    },
    {
      id: '10t6', video: { ours: 'assets/video/sim/10t6_dh.mp4', frozen: 'assets/video/sim/10t6_pi05.mp4', fps: 20 }, cell: '10_task[6]', seed: 23, instr: 'put the red mug on the plate and the chocolate pudding right of it', budget: 520, steps: 437, decisions: 52,
      title: 'Three motion rules move two objects in sequence',
      frames: [[0, 'initial'], [70, 'staging done'], [114, 'mug grasped'], [197, 'mug on plate'], [325, 'pudding grasped'], [436, 'placed clear']],
      ours: 'dh_10t6_ours', frozen: 'dh_10t6_frozen', frozenEnd: 'fails after the whole budget',
      log: [
        [0, 'slow brain', 'plan: mug to plate, pudding right of plate'],
        [114, 'analytic', 'mug grasped; climb before transport'],
        [197, 'analytic', 'mug placed on the plate'],
        [325, 'analytic', 'pudding grasped; corridor over the table'],
        [436, 'verdict', 'placement clearance satisfied; success'],
      ],
      effect: 'Analytic skills account for 86.3% of the steps; the VLA is not called.',
    },
  ];

  /* Baseline diagnostic cases (case-study appendix). */
  const BASELINES = [
    {
      sys: 'PhyAgentOS', title: 'A model verifier records success on an episode the simulator scored as failed',
      ep: '10_task[2], seed 2: turn on the stove and put the pan on it; GPT-4o-mini; frozen π0.5',
      frames: [['phy_c1_f1', 'initial, 0'], ['phy_c1_f2', 'stove on, 80'], ['phy_c1_f3', 'grasps moka pot, 240'], ['phy_c1_f4', 'moka pot on stove, 320'], ['phy_c1_f5', 'end 520: pan on table', 'fail']],
      what: 'The policy places the moka pot, not the pan. Shown four images, the verifier writes "The pan is placed on the stove" and records success. On LIBERO-Pro, 11 (GPT-4o-mini) and 22 (Qwen3-VL-4B) of 400 episodes were recorded as successes this way.',
      dh: 'The verdict is the benchmark predicate, read every 0.5 s and latched. No model judgment ends a command or changes its outcome.',
    },
    {
      sys: 'PhyAgentOS', title: 'A retry reruns the same policy from where the last attempt stopped',
      ep: 'goal_task[1], seed 1: put the plate on the stove; every verdict is "replan"',
      frames: [['phy_c5_f2', 'attempt 0 ends, 300'], ['phy_c5_f3', 'attempt 1 ends, 600'], ['phy_c5_f4', 'attempt 2 ends, 900', 'fail']],
      what: 'Retries keep the original instruction and restart the step counter, so a retry behaves like a longer episode. 234 of 320 first-attempt failures received no verifier call and no retry.',
      dh: 'An unsuccessful command hands the next decision to the fast brain, which grounds the step again, substitutes another capability or returns to a verified pose within the same budget.',
    },
    {
      sys: 'Zetta', title: 'A held-out win comes from a tool that reads simulator poses',
      ep: 'goal_swap[3], seed 3: open the top drawer and put the bowl inside; GPT-5.6-sol candidate vs bare policy',
      frames: [['zet_c1_f1', 'candidate, 0'], ['zet_c1_f2', 'tool called, 87'], ['zet_c1_f3', 'bowl lifted, 140'], ['zet_c1_f4', 'bowl in drawer, 199'], ['zet_c1_f5', 'bare policy, 87'], ['zet_c1_f6', 'bare policy, 310', 'fail']],
      what: 'At step 87 the candidate selects privileged_pick_place, a recovery that reads the audited object and target poses. Over seeds 1–20 it scores 65% against 30% and calls the tool in all 8 seeds it wins alone.',
      dh: 'Grounding binds parameters to the state estimates the execution interface exposes and refuses when binding fails; refusals and their reasons stay in the record.',
    },
    {
      sys: 'Zetta (Qwen3-VL-4B)', title: 'A recovery is marked completed while the drawer stays shut',
      ep: 'goal_swap[3], seed 100003, Qwen3-VL-4B as the recovery agent',
      frames: [['zet_c2_f1', 'initial, 0'], ['zet_c2_f2', 'divergence, 75'], ['zet_c2_f3', 'recovery starts, 89'], ['zet_c2_f4', 'recovering, 128'], ['zet_c2_f5', '"completed", 167', 'fail'], ['zet_c2_f6', 'end, 310', 'fail']],
      what: 'The tool returns joint_goal_satisfied = false, yet the event is recorded as completed; the rule forbids a second recovery and the episode fails at 311 steps. With Qwen3-VL-4B, 0 of 800 episodes succeed.',
      dh: 'A command ends only on the latched predicate, a spent budget or an expired lease, and an unsuccessful command returns the decision to the fast brain.',
    },
    {
      sys: 'Harness VLA', title: 'A release error appears a turn later and is not corrected',
      ep: 'Spatial-T task 1, seed 3; Codex agent; 37 turns, 70 tool calls, 4.51M tokens, 505 s',
      frames: [['hvla_c1_f1', '1st grasp fails, 7.0 s'], ['hvla_c1_f2', 'bowl held, 11.5 s'], ['hvla_c1_f3', 'released, 17.8 s', 'fail'], ['hvla_c1_f4', 'on the rim, 20.5 s'], ['hvla_c1_f5', 'after pushes, 40.0 s'], ['hvla_c1_f6', 'end, 46.5 s', 'fail']],
      what: 'One decision per turn: each motion runs open loop between observations, so the effect of a release is seen only at the next turn, about 13.6 s later. With Qwen3-VL-4B in place of Codex the released agent succeeds on 6.0% of 800 episodes.',
      dh: 'The fast brain reads progress every 0.5 s while a command runs and decides retry, recovery or substitution inside the episode.',
    },
    {
      sys: 'ENPIRE (Qwen3-VL-4B)', title: 'Generated policies call an invented API or pass the policy through',
      ep: '10_swap[2], seed 0: turn on the stove and put the moka pot on it; the generated policy only calls pi05.predict',
      frames: [['enpire_c1_f1', 'frame 0'], ['enpire_c1_f2', 'knob reached, 100'], ['enpire_c1_f3', 'stove on, 125'], ['enpire_c1_f4', '175'], ['enpire_c1_f5', 'in the pan, 230', 'fail'], ['enpire_c1_f6', 'end, 310', 'fail']],
      what: '14 of 18 recovered policies call names defined nowhere; 4 pass the observation straight to π0.5. Nothing checks that a called name exists. Success: 5.4% over the four cells.',
      dh: 'The same 4B model returns a typed plan step that names one capability of the library; the fast brain grounds or refuses it, so a name outside the library never becomes a command.',
    },
  ];

  /* Paradigm comparison (Fig. 1a). */
  const PARADIGMS = [
    { name: 'Policy learning', sub: 'SFT / RL', line: 'Adapt the policy by weight updates.', how: 'Demos and rewards change the weights; one network runs the task from start to end.' },
    { name: 'Planner + frozen skills', sub: 'Coarse agent loop', line: 'Reason, then execute.', how: 'A VLM decomposes the task and calls skills or a policy; checking execution is a pipeline stage between coarse decisions.' },
    { name: 'Failure → skill update', sub: 'Capability evolution', line: 'Improve after failure.', how: 'A failed task motivates a new or repaired skill; the update starts from the task, not from the part of the agent that broke.' },
    { name: 'DynaHarness', sub: 'Fast-slow physical harness', line: 'Govern execution, then evolve from its evidence.', how: 'A slow brain proposes; a fast brain grounds, refuses, monitors and substitutes at 2 Hz under one execution contract; attribution names the layer that broke; a paired gate can reject the fix.', dh: true },
  ];

  const CONTRACT = [
    { k: 'Grounded', c: 'green', t: 'A command enters the physical world only if its parameters and preconditions resolve through the execution interface. Otherwise grounding returns a refusal with its reason.' },
    { k: 'Bounded', c: 'orange', t: 'It acts only while its step budget remains, its lease holds and a 50 Hz safety check passes. A capability that cannot afford its own completion refuses before it starts.' },
    { k: 'Verifiable', c: 'blue', t: 'It ends on a recorded local status, the latched task verdict, budget exhaustion or lease expiry. Once true, the verdict stays true until the fast brain reads it.' },
    { k: 'Attributable', c: 'slate', t: 'An append-only evidence store logs every observation, decision, outcome and reason, including refusals for which no action was dispatched.' },
  ];

  const BIBTEX = `@misc{deng2027dynaharness,
  title     = {DynaHarness: A Dynamic Physical Harness for Self-Evolving Robot Agents},
  author    = {Deng, Haoyuan and Liu, Jiebin and Zhang, Tengxiao and Yan, Langning and Cao, Hongye and Wang, Ziwei},
  year      = {2027},
  url       = {https://github.com/Denghaoyuan123/DynaHarness}
}`;

  return { CELLS, MAIN, SCALE, SCALE_SLOTS, TRANSFER, POST, ABL, MECH, ROUNDS, REJECTED, DRAWER, REGISTRY, TOOLS, PERTASK, LIBERO, PLUS, LAT, RATES, BUDGET, AFTER_PROGRESS, STEPSHARE, STOVE, REAL, CASES, BASELINES, PARADIGMS, CONTRACT, BIBTEX };
})();
