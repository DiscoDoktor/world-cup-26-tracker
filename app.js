'use strict';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const MATCH_PAIRS = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];

const ROUND_ORDER = ['r32','r16','qf','sf','tp','final'];
const ROUND_META = {
  r32:   { label: 'Round of 32',          size: 16 },
  r16:   { label: 'Round of 16',          size: 8  },
  qf:    { label: 'Quarter-Finals',       size: 4  },
  sf:    { label: 'Semi-Finals',          size: 2  },
  tp:    { label: 'Third Place Play-off', size: 1  },
  final: { label: 'Final',               size: 1  }
};

// Official FIFA World Cup 2026 Round of 32 bracket (matches 73–88).
// Slot label formats:
//   "1X"        = Winner of Group X
//   "2X"        = Runner-up of Group X
//   "3:ABCDF"   = Best third-placed team from the eligible groups A/B/C/D/F
// Best-third slots list the FIFA-defined eligible groups, so two third-placed
// qualifiers can never be drawn against each other.
const R32_SLOTS = [
  ['2A','2B'],        // M73
  ['1E','3:ABCDF'],   // M74
  ['1F','2C'],        // M75
  ['1C','2F'],        // M76
  ['1I','3:CDFGH'],   // M77
  ['2E','2I'],        // M78
  ['1A','3:CEFHI'],   // M79
  ['1L','3:EHIJK'],   // M80
  ['1D','3:BEFIJ'],   // M81
  ['1G','3:AEHIJ'],   // M82
  ['2K','2L'],        // M83
  ['1H','2J'],        // M84
  ['1B','3:EFGIJ'],   // M85
  ['1J','2H'],        // M86
  ['1K','3:DEIJL'],   // M87
  ['2D','2G']         // M88
];

// Bracket-seeding version — bump to force a rebuild of saved knockout brackets
const KO_VERSION = 2;

const REAL_TEAMS = {
  A0:'Mexico',            A1:'South Africa',      A2:'South Korea',      A3:'Czech Republic',
  B0:'Canada',            B1:'Bosnia-Herzegovina',B2:'Qatar',            B3:'Switzerland',
  C0:'Brazil',            C1:'Morocco',           C2:'Haiti',            C3:'Scotland',
  D0:'United States',     D1:'Paraguay',          D2:'Australia',        D3:'Turkey',
  E0:'Germany',           E1:'Curaçao',           E2:'Ivory Coast',      E3:'Ecuador',
  F0:'Netherlands',       F1:'Japan',             F2:'Sweden',           F3:'Tunisia',
  G0:'Belgium',           G1:'Egypt',             G2:'Iran',             G3:'New Zealand',
  H0:'Spain',             H1:'Cape Verde',        H2:'Saudi Arabia',     H3:'Uruguay',
  I0:'France',            I1:'Senegal',           I2:'Iraq',             I3:'Norway',
  J0:'Argentina',         J1:'Algeria',           J2:'Austria',          J3:'Jordan',
  K0:'Portugal',          K1:'Congo DR',          K2:'Uzbekistan',       K3:'Colombia',
  L0:'England',           L1:'Croatia',           L2:'Ghana',            L3:'Panama'
};

const SAMPLE_TEAMS = REAL_TEAMS;

const FLAGS = {
  'Mexico':'🇲🇽',             'South Africa':'🇿🇦',      'South Korea':'🇰🇷',
  'Czech Republic':'🇨🇿',     'Canada':'🇨🇦',            'Bosnia-Herzegovina':'🇧🇦',
  'Qatar':'🇶🇦',              'Switzerland':'🇨🇭',        'Brazil':'🇧🇷',
  'Morocco':'🇲🇦',            'Haiti':'🇭🇹',              'Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'United States':'🇺🇸',      'Paraguay':'🇵🇾',           'Australia':'🇦🇺',
  'Turkey':'🇹🇷',             'Germany':'🇩🇪',            'Curaçao':'🇨🇼',
  'Ivory Coast':'🇨🇮',        'Ecuador':'🇪🇨',            'Netherlands':'🇳🇱',
  'Japan':'🇯🇵',              'Sweden':'🇸🇪',             'Tunisia':'🇹🇳',
  'Belgium':'🇧🇪',            'Egypt':'🇪🇬',              'Iran':'🇮🇷',
  'New Zealand':'🇳🇿',        'Spain':'🇪🇸',              'Cape Verde':'🇨🇻',
  'Saudi Arabia':'🇸🇦',       'Uruguay':'🇺🇾',            'France':'🇫🇷',
  'Senegal':'🇸🇳',            'Iraq':'🇮🇶',               'Norway':'🇳🇴',
  'Argentina':'🇦🇷',          'Algeria':'🇩🇿',            'Austria':'🇦🇹',
  'Jordan':'🇯🇴',             'Portugal':'🇵🇹',           'Congo DR':'🇨🇩',
  'Uzbekistan':'🇺🇿',         'Colombia':'🇨🇴',           'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croatia':'🇭🇷',            'Ghana':'🇬🇭',              'Panama':'🇵🇦'
};

const FIXTURES = {
  A: [
    { date:'2026-06-11', time:'20:00', home:0, away:1 },
    { date:'2026-06-12', time:'03:00', home:2, away:3 },
    { date:'2026-06-18', time:'17:00', home:3, away:1 },
    { date:'2026-06-19', time:'02:00', home:0, away:2 },
    { date:'2026-06-25', time:'02:00', home:3, away:0 },
    { date:'2026-06-25', time:'02:00', home:1, away:2 }
  ],
  B: [
    { date:'2026-06-12', time:'20:00', home:0, away:1 },
    { date:'2026-06-13', time:'20:00', home:2, away:3 },
    { date:'2026-06-18', time:'20:00', home:3, away:1 },
    { date:'2026-06-18', time:'23:00', home:0, away:2 },
    { date:'2026-06-24', time:'20:00', home:1, away:2 },
    { date:'2026-06-24', time:'20:00', home:3, away:0 }
  ],
  C: [
    { date:'2026-06-13', time:'23:00', home:0, away:1 },
    { date:'2026-06-14', time:'02:00', home:2, away:3 },
    { date:'2026-06-19', time:'23:00', home:3, away:1 },
    { date:'2026-06-20', time:'01:30', home:0, away:2 },
    { date:'2026-06-24', time:'23:00', home:1, away:2 },
    { date:'2026-06-24', time:'23:00', home:3, away:0 }
  ],
  D: [
    { date:'2026-06-13', time:'02:00', home:0, away:1 },
    { date:'2026-06-14', time:'05:00', home:2, away:3 },
    { date:'2026-06-19', time:'20:00', home:0, away:2 },
    { date:'2026-06-20', time:'04:00', home:3, away:1 },
    { date:'2026-06-26', time:'03:00', home:1, away:2 },
    { date:'2026-06-26', time:'03:00', home:3, away:0 }
  ],
  E: [
    { date:'2026-06-14', time:'18:00', home:0, away:1 },
    { date:'2026-06-15', time:'00:00', home:2, away:3 },
    { date:'2026-06-20', time:'21:00', home:0, away:2 },
    { date:'2026-06-21', time:'01:00', home:3, away:1 },
    { date:'2026-06-25', time:'21:00', home:1, away:2 },
    { date:'2026-06-25', time:'21:00', home:3, away:0 }
  ],
  F: [
    { date:'2026-06-14', time:'21:00', home:0, away:1 },
    { date:'2026-06-15', time:'03:00', home:2, away:3 },
    { date:'2026-06-20', time:'18:00', home:0, away:2 },
    { date:'2026-06-21', time:'05:00', home:3, away:1 },
    { date:'2026-06-26', time:'00:00', home:1, away:2 },
    { date:'2026-06-26', time:'00:00', home:3, away:0 }
  ],
  G: [
    { date:'2026-06-15', time:'20:00', home:0, away:1 },
    { date:'2026-06-16', time:'02:00', home:2, away:3 },
    { date:'2026-06-21', time:'20:00', home:0, away:2 },
    { date:'2026-06-22', time:'02:00', home:3, away:1 },
    { date:'2026-06-27', time:'04:00', home:1, away:2 },
    { date:'2026-06-27', time:'04:00', home:3, away:0 }
  ],
  H: [
    { date:'2026-06-15', time:'17:00', home:0, away:1 },
    { date:'2026-06-15', time:'23:00', home:2, away:3 },
    { date:'2026-06-21', time:'17:00', home:0, away:2 },
    { date:'2026-06-21', time:'23:00', home:3, away:1 },
    { date:'2026-06-27', time:'01:00', home:1, away:2 },
    { date:'2026-06-27', time:'01:00', home:3, away:0 }
  ],
  I: [
    { date:'2026-06-16', time:'20:00', home:0, away:1 },
    { date:'2026-06-16', time:'23:00', home:2, away:3 },
    { date:'2026-06-22', time:'22:00', home:0, away:2 },
    { date:'2026-06-23', time:'01:00', home:3, away:1 },
    { date:'2026-06-26', time:'20:00', home:3, away:0 },
    { date:'2026-06-26', time:'20:00', home:1, away:2 }
  ],
  J: [
    { date:'2026-06-17', time:'02:00', home:0, away:1 },
    { date:'2026-06-17', time:'05:00', home:2, away:3 },
    { date:'2026-06-22', time:'18:00', home:0, away:2 },
    { date:'2026-06-23', time:'04:00', home:3, away:1 },
    { date:'2026-06-28', time:'03:00', home:1, away:2 },
    { date:'2026-06-28', time:'03:00', home:3, away:0 }
  ],
  K: [
    { date:'2026-06-17', time:'18:00', home:0, away:1 },
    { date:'2026-06-18', time:'03:00', home:2, away:3 },
    { date:'2026-06-23', time:'18:00', home:0, away:2 },
    { date:'2026-06-24', time:'03:00', home:3, away:1 },
    { date:'2026-06-28', time:'00:30', home:3, away:0 },
    { date:'2026-06-28', time:'00:30', home:1, away:2 }
  ],
  L: [
    { date:'2026-06-17', time:'21:00', home:0, away:1 },
    { date:'2026-06-18', time:'00:00', home:2, away:3 },
    { date:'2026-06-23', time:'21:00', home:0, away:2 },
    { date:'2026-06-24', time:'00:00', home:3, away:1 },
    { date:'2026-06-27', time:'22:00', home:1, away:2 },
    { date:'2026-06-27', time:'22:00', home:3, away:0 }
  ]
};

const SAMPLE_SCORES = {
  A_0:{h:'3',a:'1'}, A_1:{h:'2',a:'0'}, A_2:{h:'1',a:'0'},
  A_3:{h:'2',a:'1'}, A_4:{h:'2',a:'0'}, A_5:{h:'1',a:'0'},
  B_0:{h:'2',a:'1'}, B_1:{h:'3',a:'0'}, B_2:{h:'2',a:'0'},
  B_3:{h:'1',a:'1'}, B_4:{h:'2',a:'0'}, B_5:{h:'1',a:'0'},
  C_0:{h:'2',a:'0'}, C_1:{h:'3',a:'1'}, C_2:{h:'4',a:'0'},
  C_3:{h:'1',a:'0'}, C_4:{h:'2',a:'0'}, C_5:{h:'1',a:'1'},
  D_0:{h:'2',a:'1'}, D_1:{h:'1',a:'0'}, D_2:{h:'3',a:'0'},
  D_3:{h:'2',a:'1'}, D_4:{h:'2',a:'0'}, D_5:{h:'1',a:'0'},
  E_0:{h:'1',a:'0'}, E_1:{h:'2',a:'1'}, E_2:{h:'3',a:'0'},
  E_3:{h:'1',a:'1'}, E_4:{h:'2',a:'0'}, E_5:{h:'1',a:'0'},
  F_0:{h:'2',a:'0'}, F_1:{h:'2',a:'1'}, F_2:{h:'3',a:'0'},
  F_3:{h:'1',a:'0'}, F_4:{h:'2',a:'0'}, F_5:{h:'1',a:'0'},
  G_0:{h:'2',a:'1'}, G_1:{h:'2',a:'0'}, G_2:{h:'3',a:'0'},
  G_3:{h:'1',a:'1'}, G_4:{h:'2',a:'0'}, G_5:{h:'0',a:'0'},
  H_0:{h:'1',a:'1'}, H_1:{h:'2',a:'0'}, H_2:{h:'2',a:'0'},
  H_3:{h:'1',a:'0'}, H_4:{h:'2',a:'1'}, H_5:{h:'0',a:'0'},
  I_0:{h:'2',a:'1'}, I_1:{h:'1',a:'0'}, I_2:{h:'2',a:'0'},
  I_3:{h:'1',a:'1'}, I_4:{h:'2',a:'0'}, I_5:{h:'1',a:'0'},
  J_0:{h:'2',a:'0'}, J_1:{h:'3',a:'0'}, J_2:{h:'4',a:'0'},
  J_3:{h:'1',a:'0'}, J_4:{h:'2',a:'0'}, J_5:{h:'1',a:'0'},
  K_0:{h:'1',a:'0'}, K_1:{h:'2',a:'1'}, K_2:{h:'2',a:'0'},
  K_3:{h:'0',a:'0'}, K_4:{h:'1',a:'0'}, K_5:{h:'1',a:'1'},
  L_0:{h:'2',a:'1'}, L_1:{h:'1',a:'0'}, L_2:{h:'3',a:'0'},
  L_3:{h:'1',a:'0'}, L_4:{h:'2',a:'0'}, L_5:{h:'0',a:'1'}
};

// Teams that support two sweepstake owners (top 6 + bottom 6 for balance)
// Top: Spain H0, France I0, Portugal K0, England L0, Argentina J0, Brazil C0
// Bottom: Cape Verde H1, Qatar B2, Haiti C2, Jordan J3, Iraq I2, Curaçao E1
const DUAL_OWNER_TEAMS = new Set(['C0','C2','B2','E1','H0','H1','I0','I2','J0','J3','K0','L0']);

// ── Sweepstake draw (Assignment tab) ──
// 12 owners; 5 rounds; each owner ends with exactly one team per round (5 total).
// Shared rounds (bottom/top) have 6 teams × 2 owners = 12 owner slots.
// All team names below are validated to exist in REAL_TEAMS.
const NUM_OWNERS = 12;
const DRAW_ROUNDS = [
  { key:'bottom', name:'Round 1 — Bottom Shared Teams', shared:true,
    teams:['Cape Verde','Qatar','Iraq','Jordan','Curaçao','Haiti'] },
  { key:'pot3', name:'Round 2 — Pot 3', shared:false,
    teams:['Australia','Bosnia-Herzegovina','Iran','Scotland','Congo DR','Algeria',
           'Saudi Arabia','Tunisia','Ghana','South Africa','Panama','Uzbekistan'] },
  { key:'pot2', name:'Round 3 — Pot 2', shared:false,
    teams:['Mexico','Switzerland','Sweden','Ecuador','Turkey','Austria',
           'Ivory Coast','New Zealand','South Korea','Egypt','Canada','Paraguay'] },
  { key:'pot1', name:'Round 4 — Pot 1', shared:false,
    teams:['Germany','Netherlands','Norway','Belgium','Colombia','Morocco',
           'United States','Japan','Uruguay','Czech Republic','Croatia','Senegal'] },
  { key:'top', name:'Round 5 — Top Shared Teams', shared:true,
    teams:['Spain','France','Portugal','England','Argentina','Brazil'] }
];

// ── Team tiers (pots) — single source of truth derived from the draw rounds ──
const TIER_META = {
  top:    { label:'TOP',    short:'TOP', mini:'T', name:'Top',    cls:'tier-top' },
  pot1:   { label:'POT 1',  short:'P1',  mini:'1', name:'Pot 1',  cls:'tier-p1'  },
  pot2:   { label:'POT 2',  short:'P2',  mini:'2', name:'Pot 2',  cls:'tier-p2'  },
  pot3:   { label:'POT 3',  short:'P3',  mini:'3', name:'Pot 3',  cls:'tier-p3'  },
  bottom: { label:'BOTTOM', short:'BTM', mini:'B', name:'Bottom', cls:'tier-bot' }
};
const TIER_OF = {};   // team name → draw-round key (top/pot1/pot2/pot3/bottom)
DRAW_ROUNDS.forEach(r => r.teams.forEach(t => { TIER_OF[t] = r.key; }));

function tierKey(name) { return TIER_OF[name] || null; }

// Explicit pot-strength sort value: Top=0, Pot 1=1, Pot 2=2, Pot 3=3, Bottom=4.
// Works regardless of how the pot labels are worded.
const TIER_RANK = { top: 0, pot1: 1, pot2: 2, pot3: 3, bottom: 4 };
function tierRank(name) {
  const k = tierKey(name);
  return (k && TIER_RANK[k] !== undefined) ? TIER_RANK[k] : 99;
}

// Compact, accessible pot badge (colour + text). `short` uses TOP/P1/P2/P3/BTM.
function potBadge(name, short) {
  const k = tierKey(name);
  if (!k) return '';
  const m = TIER_META[k];
  return `<span class="tier-badge ${m.cls}" title="${m.label}">${short ? m.short : m.label}</span>`;
}

// Single-character badge for the knockout bracket (T/1/2/3/B) with a full-name
// tooltip. Saves width while staying accessible (colour + letter + title).
function potBadgeMini(name) {
  const k = tierKey(name);
  if (!k) return '';
  const m = TIER_META[k];
  return `<span class="tier-badge tier-mini ${m.cls}" title="${m.name}">${m.mini}</span>`;
}

// Short display names for the knockout bracket (data keeps the official name).
const SHORT_NAMES = {
  'Bosnia-Herzegovina':'Bosnia',
  'United States':'USA',
  'Czech Republic':'Czechia',
  'Saudi Arabia':'Saudi',
  'South Africa':'S. Africa',
  'South Korea':'S. Korea',
  'New Zealand':'N. Zealand',
  'Ivory Coast':'Ivory C.',
  'Cape Verde':'C. Verde'
};
function shortName(name) { return SHORT_NAMES[name] || name; }

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getFlag(name) { return FLAGS[name] ?? ''; }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) {
  const p = d.split('-');
  return `${parseInt(p[2])} ${MONTHS[parseInt(p[1]) - 1]}`;
}

function fixtureInfo(home, away) {
  const pairIdx = MATCH_PAIRS.findIndex(([ti, tj]) =>
    (ti === home && tj === away) || (ti === away && tj === home)
  );
  const flipped = MATCH_PAIRS[pairIdx][0] === away;
  return { pairIdx, flipped };
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function teamName(key) {
  return S.teams[key] || REAL_TEAMS[key] || key;
}

// Reverse lookup: a team name → its group key (e.g. "Spain" → "H0")
function teamKeyByName(name) {
  if (!name) return null;
  for (const g of GROUPS) {
    for (let i = 0; i < 4; i++) {
      const k = `${g}${i}`;
      if (teamName(k) === name) return k;
    }
  }
  return null;
}

// Owner line for a knockout slot, looked up by the team's name.
// Returns { label, text, empty } or null when the slot holds no real team.
function ownerLineForName(name) {
  const k = teamKeyByName(name);
  if (!k) return null;
  const o1 = (S.owners[k]  || '').trim();
  const o2 = (S.owners2[k] || '').trim();
  const list = [];
  if (o1) list.push(o1);
  if (o2 && o2 !== o1) list.push(o2);
  if (list.length === 0) return { label: 'Owner',  text: '—', empty: true };
  if (list.length === 1) return { label: 'Owner',  text: list[0] };
  return { label: 'Owners', text: list.join(' / ') };
}

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

function makeKO() {
  const ko = {};
  ROUND_ORDER.forEach(r => {
    ko[r] = Array.from({ length: ROUND_META[r].size }, () =>
      ({ h:'', a:'', hs:'', as:'', pens:'' })
    );
  });
  R32_SLOTS.forEach(([h, a], i) => { ko.r32[i].h = h; ko.r32[i].a = a; });
  return ko;
}

function freshDraw() {
  return {
    names: Array(NUM_OWNERS).fill(''),
    round: 0,            // current round index (0–4); complete flag below
    picks: [[], [], [], [], []], // picks[round] = [{ o: ownerIdx, team }]
    pool: null,          // remaining team pool for the current round
    complete: false
  };
}

function freshState() {
  return { teams: { ...REAL_TEAMS }, scores: {}, ko: makeKO(),
           koVersion: KO_VERSION, owners: {}, owners2: {}, awards: [],
           draw: freshDraw(), matchTimes: {} };
}

// ── Local-only interface preferences (never shared) ──
let uiPrefs = (function () {
  try { return JSON.parse(localStorage.getItem('wc_ui') || '{}'); }
  catch (e) { return {}; }
})();
function saveUiPrefs() {
  try { localStorage.setItem('wc_ui', JSON.stringify(uiPrefs)); } catch (e) {}
}

// Fill any missing keys and migrate an incoming state object.
function normalizeState(s) {
  if (!s || typeof s !== 'object') s = freshState();
  if (!s.teams)   s.teams   = { ...REAL_TEAMS };
  if (!s.scores)  s.scores  = {};
  if (!s.ko)      s.ko      = makeKO();
  if (!s.owners)  s.owners  = {};
  if (!s.owners2) s.owners2 = {};
  if (!s.awards)     s.awards     = [];
  if (!s.draw)       s.draw       = freshDraw();
  if (!s.matchTimes) s.matchTimes = {};
  // Rebuild the knockout bracket if seeded by an older version.
  if (s.koVersion !== KO_VERSION) { s.ko = makeKO(); s.koVersion = KO_VERSION; }
  return s;
}

// Cached copy (offline fallback only — NOT the shared source of truth).
function loadLocalState() {
  try {
    const raw = localStorage.getItem('wc2026v2');
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch (e) { return null; }
}

// One-time snapshot of any pre-existing (pre-Supabase) local data, kept in a
// separate key so it survives the live cache being overwritten by cloud state.
// This is what the admin imports during the one-time migration.
(function backupLegacyLocal() {
  try {
    if (localStorage.getItem('wc2026v2') && !localStorage.getItem('wc2026v2_backup')) {
      localStorage.setItem('wc2026v2_backup', localStorage.getItem('wc2026v2'));
    }
  } catch (e) {}
})();
function loadBackupState() {
  try {
    const raw = localStorage.getItem('wc2026v2_backup');
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch (e) { return null; }
}

// Start from the local cache so the first paint isn't blank; the shared
// database state overrides this once it loads.
let S = loadLocalState() || freshState();

// True when the state is empty defaults (nothing entered yet).
function stateIsBlank(s) {
  return Object.keys(s.scores || {}).length === 0 &&
         Object.values(s.owners  || {}).every(v => !v) &&
         Object.values(s.owners2 || {}).every(v => !v) &&
         (s.awards || []).length === 0 &&
         (s.draw ? s.draw.picks.every(r => r.length === 0) : true);
}

// save() = always cache locally; push to the shared DB (admins only, debounced)
function save() {
  try { localStorage.setItem('wc2026v2', JSON.stringify(S)); } catch (e) {}
  scheduleCloudPush();
}

// ═══════════════════════════════════════════════════════════════════
// STANDINGS CALCULATION
// ═══════════════════════════════════════════════════════════════════

function calcStandings(g) {
  const rows = [0,1,2,3].map(i => ({
    key: `${g}${i}`,
    name: teamName(`${g}${i}`),
    p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0
  }));

  MATCH_PAIRS.forEach(([ti, tj], idx) => {
    const sc = S.scores[`${g}_${idx}`];
    if (!sc || sc.h === '' || sc.a === '') return;
    const h = parseInt(sc.h), a = parseInt(sc.a);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

    rows[ti].p++; rows[tj].p++;
    rows[ti].gf += h; rows[ti].ga += a;
    rows[tj].gf += a; rows[tj].ga += h;

    if      (h > a) { rows[ti].w++; rows[ti].pts += 3; rows[tj].l++; }
    else if (h < a) { rows[tj].w++; rows[tj].pts += 3; rows[ti].l++; }
    else            { rows[ti].d++; rows[ti].pts++;     rows[tj].d++; rows[tj].pts++; }
  });

  rows.forEach(r => r.gd = r.gf - r.ga);
  return rows.sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name)
  );
}

// ═══════════════════════════════════════════════════════════════════
// KNOCKOUT LOGIC
// ═══════════════════════════════════════════════════════════════════

function koWinner(m) {
  if (!m.h || !m.a) return null;   // both teams must be present to have a winner
  if (m.pens === 'h') return m.h;
  if (m.pens === 'a') return m.a;
  if (m.hs === '' || m.as === '') return null;
  const h = parseInt(m.hs), a = parseInt(m.as);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return m.h;
  if (a > h) return m.a;
  return null;
}

function koLoser(m) {
  const w = koWinner(m);
  if (!w) return null;
  return w === m.h ? m.a : m.h;
}

function advanceAll() {
  // Clear every slot that is fed from an earlier round first, so changing or
  // undoing a result never leaves a stale team stranded further up the bracket.
  // (Round of 32 is seeded by populateR32, so it is never cleared here.)
  ['r16','qf','sf'].forEach(r => S.ko[r].forEach(m => { m.h = ''; m.a = ''; }));
  S.ko.final[0].h = ''; S.ko.final[0].a = '';
  S.ko.tp[0].h    = ''; S.ko.tp[0].a    = '';

  [['r32','r16'],['r16','qf'],['qf','sf']].forEach(([from, to]) => {
    S.ko[from].forEach((m, i) => {
      const w = koWinner(m);
      if (!w) return;
      const ni = Math.floor(i / 2);
      if (i % 2 === 0) S.ko[to][ni].h = w;
      else             S.ko[to][ni].a = w;
    });
  });
  S.ko.sf.forEach((m, i) => {
    const w = koWinner(m), l = koLoser(m);
    if (w) { if (i === 0) S.ko.final[0].h = w; else S.ko.final[0].a = w; }
    if (l) { if (i === 0) S.ko.tp[0].h    = l; else S.ko.tp[0].a    = l; }
  });
}

// Rank the twelve third-placed teams and allocate the best eight into their
// official Round of 32 slots. Each best-third slot lists its FIFA-eligible
// groups; we find a perfect matching of slots → qualifying groups so that no
// two third-placed teams meet, every qualifying group is used once, and each
// team only lands in a slot its group is eligible for.
//
// TODO: This produces a valid official-compliant seeding via bipartite
// matching. The exact FIFA Annex C table (all C(12,8)=495 combinations) could
// later replace the matching to reproduce FIFA's specific slot choices.
function allocateThirds() {
  // 1. Third-placed team of every group, with ranking stats
  const thirds = GROUPS.map(g => {
    const t = calcStandings(g)[2];
    return { g, name: t.name, pts: t.pts, gd: t.gd, gf: t.gf };
  });

  // 2. Rank them (points → goal difference → goals for → name) and keep best 8
  thirds.sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name)
  );
  const best8        = thirds.slice(0, 8);
  const qualGroups   = best8.map(t => t.g);
  const nameByGroup  = {};
  best8.forEach(t => { nameByGroup[t.g] = t.name; });

  // 3. Collect the best-third slots and their eligible group sets
  const slots = [];
  R32_SLOTS.forEach(([h, a], idx) => {
    [['h', h], ['a', a]].forEach(([side, label]) => {
      const mm = /^3:([A-L]+)$/.exec(label);
      if (mm) slots.push({ idx, side, eligible: new Set(mm[1].split('')) });
    });
  });

  // 4. Perfect matching slot → qualifying group (backtracking)
  const assign = {};
  const used = new Set();
  function match(i) {
    if (i === slots.length) return true;
    const s = slots[i];
    for (const g of qualGroups) {
      if (used.has(g) || !s.eligible.has(g)) continue;
      used.add(g); assign[s.idx + s.side] = g;
      if (match(i + 1)) return true;
      used.delete(g); delete assign[s.idx + s.side];
    }
    return false;
  }
  match(0);

  // 5. Write the assigned third-place team names into the bracket
  slots.forEach(s => {
    const g = assign[s.idx + s.side];
    if (g) S.ko.r32[s.idx][s.side] = nameByGroup[g];
  });
}

// Pure R32 seeding (no save/render) — reusable by the Latest Updates replay.
function seedR32() {
  // Reset all R32 slots to their official seed labels
  R32_SLOTS.forEach(([h, a], i) => { S.ko.r32[i].h = h; S.ko.r32[i].a = a; });

  // Fill group winners (1X) and runners-up (2X)
  GROUPS.forEach(g => {
    const st = calcStandings(g);
    const p1 = st[0].name, p2 = st[1].name;
    S.ko.r32.forEach(m => {
      if (m.h === `1${g}`) m.h = p1;
      if (m.a === `1${g}`) m.a = p1;
      if (m.h === `2${g}`) m.h = p2;
      if (m.a === `2${g}`) m.a = p2;
    });
  });

  // Fill the eight best third-placed teams into their eligible slots
  allocateThirds();
}

function populateR32() {
  seedR32();
  syncMatchTimes();
  save();
  renderKnockout();
  refreshLeaderboard();
}

// ═══════════════════════════════════════════════════════════════════
// SWEEPSTAKE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════

// Group-stage match points for a team (by key e.g. "A0")
function getGroupMatchPts(key) {
  const g = key[0], i = parseInt(key[1]);
  let pts = 0;
  MATCH_PAIRS.forEach(([ti, tj], idx) => {
    if (ti !== i && tj !== i) return;
    const sc = S.scores[`${g}_${idx}`];
    if (!sc || sc.h === '' || sc.a === '') return;
    const h = parseInt(sc.h), a = parseInt(sc.a);
    if (isNaN(h) || isNaN(a)) return;
    if (ti === i) {       // team is home side of pair
      if (h > a) pts += 2; else if (h === a) pts += 1;
    } else {              // team is away side of pair
      if (a > h) pts += 2; else if (h === a) pts += 1;
    }
  });
  return pts;
}

// Knockout match points for a team (by key) — searches by team name in KO bracket
function getKOMatchPts(key) {
  const name = teamName(key);
  let pts = 0;
  ROUND_ORDER.forEach(round => {
    S.ko[round].forEach(m => {
      if (m.h !== name && m.a !== name) return;
      if (m.hs === '' || m.as === '') return;
      const hs = parseInt(m.hs), as = parseInt(m.as);
      if (isNaN(hs) || isNaN(as)) return;
      const isH = m.h === name;
      if (m.pens === 'h' || m.pens === 'a') {
        // Drew in regulation; pens winner gets 2, loser gets 1
        const won = (m.pens === 'h' && isH) || (m.pens === 'a' && !isH);
        pts += won ? 2 : 1;
      } else if (hs === as) {
        pts += 1; // draw
      } else {
        const mine = isH ? hs : as, opp = isH ? as : hs;
        if (mine > opp) pts += 2;
      }
    });
  });
  return pts;
}

// Progression bonus: +1 per knockout round reached (R32=1 … Final win=6)
function getProgressionBonus(key) {
  const name = teamName(key);
  const levels = [
    { round:'r32', pts:1 }, { round:'r16', pts:2 },
    { round:'qf',  pts:3 }, { round:'sf',  pts:4 },
    { round:'final', pts:5 }
  ];
  let bonus = 0;
  levels.forEach(({ round, pts }) => {
    if (S.ko[round].some(m => m.h === name || m.a === name)) bonus = pts;
  });
  if (bonus === 5 && koWinner(S.ko.final[0]) === name) bonus = 6;
  return bonus;
}

// Final placing bonus: 1st=+5, 2nd=+3, 3rd=+1
function getPlacingBonus(key) {
  const name = teamName(key);
  if (name === koWinner(S.ko.final[0])) return 5;
  if (name === koLoser(S.ko.final[0]))  return 3;
  if (name === koWinner(S.ko.tp[0]))    return 1;
  return 0;
}

// Player award bonus: +3 per award linked to this team key
function getAwardBonus(key) {
  return S.awards.filter(a => a.teamKey === key).length * 3;
}

// Build the full sweepstake leaderboard rows
function calcSweepstake() {
  const ownerTeams = {};
  GROUPS.forEach(g => {
    for (let i = 0; i < 4; i++) {
      const key = `${g}${i}`;
      const o1  = (S.owners[key]  || '').trim();
      const o2  = (S.owners2[key] || '').trim();

      // Collect unique owners for this team; if o1 === o2, count only once
      const teamOwners = new Set();
      if (o1) teamOwners.add(o1);
      if (o2 && o2 !== o1) teamOwners.add(o2);

      teamOwners.forEach(owner => {
        if (!ownerTeams[owner]) ownerTeams[owner] = [];
        ownerTeams[owner].push(key);
      });
    }
  });

  const rows = Object.entries(ownerTeams).map(([owner, keys]) => {
    const matchPts     = keys.reduce((s, k) => s + getGroupMatchPts(k) + getKOMatchPts(k), 0);
    const progBonus    = keys.reduce((s, k) => s + getProgressionBonus(k), 0);
    const placingBonus = keys.reduce((s, k) => s + getPlacingBonus(k), 0);
    const awardBonus   = keys.reduce((s, k) => s + getAwardBonus(k), 0);
    const total        = matchPts + progBonus + placingBonus + awardBonus;
    return { owner, keys, matchPts, progBonus, placingBonus, awardBonus, total };
  });

  return rows.sort((a, b) =>
    b.total - a.total || b.matchPts - a.matchPts || a.owner.localeCompare(b.owner)
  );
}

// ═══════════════════════════════════════════════════════════════════
// LATEST UPDATES — match-by-match commentary (derived by replay)
// ═══════════════════════════════════════════════════════════════════

// Record a completion time the first time a match becomes complete, and drop it
// if a match is reverted. Only ever called from admin actions (writes are also
// gated by RLS), so timestamps are authored once and shared via Supabase.
function matchComplete(kind, a, b) {
  if (kind === 'group') {
    const sc = S.scores[`${a}_${b}`];
    return !!(sc && sc.h !== '' && sc.a !== '' && !isNaN(+sc.h) && !isNaN(+sc.a));
  }
  const m = S.ko[a][b];
  return !isKoSlot(m.h) && !isKoSlot(m.a) && m.hs !== '' && m.as !== '' &&
    !isNaN(+m.hs) && !isNaN(+m.as) && !!koWinner(m);
}
function syncMatchTimes() {
  if (!S.matchTimes) S.matchTimes = {};
  const now = new Date().toISOString();
  const seen = new Set();
  const stamp = id => { seen.add(id); if (!S.matchTimes[id]) S.matchTimes[id] = now; };
  GROUPS.forEach(g => MATCH_PAIRS.forEach((_, i) => { if (matchComplete('group', g, i)) stamp(`g:${g}_${i}`); }));
  ROUND_ORDER.forEach(r => S.ko[r].forEach((_, i) => { if (matchComplete('ko', r, i)) stamp(`k:${r}-${i}`); }));
  // Drop timestamps for matches that are no longer complete
  Object.keys(S.matchTimes).forEach(id => { if (!seen.has(id)) delete S.matchTimes[id]; });
}

function ownersOf(key) {
  if (!key) return [];
  const o1 = (S.owners[key] || '').trim(), o2 = (S.owners2[key] || '').trim();
  const out = [];
  if (o1) out.push(o1);
  if (o2 && o2 !== o1) out.push(o2);
  return out;
}
function joinNames(arr) {
  arr = arr.filter(Boolean);
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;
}
function ord(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function relativeTime(iso) {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - Date.parse(iso));
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

// Run a computation against a temporary state (existing calc fns read global S).
function withState(temp, fn) { const prev = S; S = temp; try { return fn(); } finally { S = prev; } }

// Map a group score pair to its fixture date/time + display label.
function groupMatchMeta(g, pairIdx) {
  const [ti, tj] = MATCH_PAIRS[pairIdx];
  let date = null, time = null, fno = pairIdx + 1;
  (FIXTURES[g] || []).forEach((fx, fIdx) => {
    if (fixtureInfo(fx.home, fx.away).pairIdx === pairIdx) { date = fx.date; time = fx.time; fno = fIdx + 1; }
  });
  return { t1: `${g}${ti}`, t2: `${g}${tj}`, date, time, label: `Group ${g} · Match ${fno}` };
}

// All completed matches, oldest → newest (by recorded completion time).
function completedMatchList() {
  const list = [];
  GROUPS.forEach((g, gi) => MATCH_PAIRS.forEach((_, i) => {
    if (!matchComplete('group', g, i)) return;
    const sc = S.scores[`${g}_${i}`];
    list.push({ kind: 'group', g, pairIdx: i, scoreKey: `${g}_${i}`, sc: { h: sc.h, a: sc.a },
                id: `g:${g}_${i}`, sortNo: gi * 6 + i });
  }));
  ROUND_ORDER.forEach(round => S.ko[round].forEach((m, i) => {
    if (!matchComplete('ko', round, i)) return;
    list.push({ kind: 'ko', round, idx: i, hs: m.hs, as: m.as, pens: m.pens, h: m.h, a: m.a,
                id: `k:${round}-${i}`, sortNo: 100 + matchNumber(round, i) });
  }));
  list.forEach(it => { it.ts = (S.matchTimes && S.matchTimes[it.id]) || ''; });
  list.sort((a, b) => (a.ts).localeCompare(b.ts) || a.sortNo - b.sortNo);
  return list;
}

// Leaderboard snapshot after the first k completed matches (replay).
function snapshotPrefix(list, k) {
  const temp = {
    teams: S.teams, owners: S.owners, owners2: S.owners2, awards: S.awards,
    scores: {}, ko: makeKO(), koVersion: KO_VERSION, matchTimes: {}, draw: S.draw
  };
  const koApply = [];
  for (let i = 0; i < k; i++) {
    const it = list[i];
    if (it.kind === 'group') temp.scores[it.scoreKey] = { h: it.sc.h, a: it.sc.a };
    else koApply.push(it);
  }
  return withState(temp, () => {
    // Knockout only exists once every group is decided (matches reality).
    if (GROUPS.every(g => groupComplete(g))) {
      seedR32();
      koApply.forEach(it => { const d = temp.ko[it.round][it.idx]; d.hs = it.hs; d.as = it.as; d.pens = it.pens; });
      advanceAll();
    }
    const board = calcSweepstake();
    const rank = {}, totals = {}, active = {};
    board.forEach((r, i) => {
      rank[r.owner] = i + 1; totals[r.owner] = r.total;
      active[r.owner] = r.keys.filter(key => !teamStatus(key).elim).length;
    });
    return { order: board.map(r => r.owner), rank, totals, active, n: board.length };
  });
}

// Deterministic template picker (same on every device — no randomness).
function pick(arr, seed) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

// Build one update card's data + commentary from before/after snapshots.
function makeUpdate(it, before, after) {
  const isKo = it.kind === 'ko';
  let t1Name, t2Name, t1Key, t2Key, s1, s2, round, label, date, time, winnerName, loserName;

  if (isKo) {
    round = it.round; t1Name = it.h; t2Name = it.a;
    t1Key = teamKeyByName(t1Name); t2Key = teamKeyByName(t2Name);
    s1 = it.hs; s2 = it.as;
    label = `${ROUND_LABEL[round]} · Match ${matchNumber(round, it.idx)}`;
    const dt = KO_DATES[`${round}-${it.idx}`]; date = dt ? dt.date : null; time = dt ? dt.time : null;
    const m = { h: it.h, a: it.a, hs: it.hs, as: it.as, pens: it.pens };
    winnerName = koWinner(m); loserName = winnerName ? (winnerName === t1Name ? t2Name : t1Name) : null;
  } else {
    const meta = groupMatchMeta(it.g, it.pairIdx);
    t1Key = meta.t1; t2Key = meta.t2; t1Name = teamName(t1Key); t2Name = teamName(t2Key);
    s1 = it.sc.h; s2 = it.sc.a; label = meta.label; date = meta.date; time = meta.time;
    if (+s1 > +s2) { winnerName = t1Name; loserName = t2Name; }
    else if (+s2 > +s1) { winnerName = t2Name; loserName = t1Name; }
  }

  const owners1 = ownersOf(t1Key), owners2 = ownersOf(t2Key);
  const affected = [...new Set([...owners1, ...owners2])];

  // Points earned per affected owner (after − before), grouped by amount.
  const byGain = {};
  affected.forEach(o => {
    const g = (after.totals[o] || 0) - (before.totals[o] || 0);
    (byGain[g] = byGain[g] || []).push(o);
  });
  const pointLines = Object.keys(byGain).map(Number).sort((a, b) => b - a).map(g => {
    const who = joinNames(byGain[g].map(esc));
    return `${who} gained ${g} point${g === 1 ? '' : 's'}.`;
  });

  // ── Headline + commentary points ──
  let headline = '';
  const pts = [];

  // Pot upset (knockout, decisive winner)
  if (isKo && winnerName && loserName) {
    const wk = tierKey(winnerName), lk = tierKey(loserName);
    if (wk && lk && tierRank(winnerName) > tierRank(loserName)) {
      const diff = tierRank(winnerName) - tierRank(loserName);
      const wPot = TIER_META[wk].name, lPot = TIER_META[lk].name;
      if (wk === 'bottom' && (lk === 'top' || lk === 'pot1'))
        headline = `🤯 Giant-killing! Bottom-pot ${esc(shortName(winnerName))} knocked out ${lPot} ${esc(shortName(loserName))}!`;
      else if (diff >= 2)
        headline = `🤯 Giant-killing: ${wPot} ${esc(shortName(winnerName))} knocked out ${lPot} ${esc(shortName(loserName))}.`;
      else
        headline = `🔥 Upset! ${wPot} ${esc(shortName(winnerName))} knocked out ${lPot} ${esc(shortName(loserName))}.`;
    }
  }

  // Podium / champion — for the Final, the trophy always leads.
  if (isKo && round === 'final' && winnerName) {
    if (headline) pts.unshift(headline);  // demote any upset line to a point
    headline = `🏆 ${esc(shortName(winnerName))} are World Cup 2026 CHAMPIONS!`;
    pts.push(`🥈 ${esc(shortName(loserName))} finish as runners-up.`);
  } else if (isKo && round === 'tp' && winnerName) {
    pts.push(`🥉 ${esc(shortName(winnerName))} take third place.`);
  }

  // New leader
  if (after.order[0] && before.order[0] && after.order[0] !== before.order[0]) {
    const h = pick([
      `👑 ${esc(after.order[0])} is the new leader, moving above ${esc(before.order[0])}.`,
      `👑 New leader! ${esc(after.order[0])} overtakes ${esc(before.order[0])} at the top.`
    ], it.id);
    if (!headline) headline = h; else pts.push(h);
  }

  // Movement for affected owners
  affected.forEach(o => {
    const rb = before.rank[o], ra = after.rank[o];
    if (!rb || !ra) return;
    if (ra < rb) {
      const passed = after.order.filter(x => x !== o && after.rank[x] > ra && before.rank[x] < rb);
      pts.push(passed.length
        ? `📈 ${esc(o)} climbed from ${ord(rb)} to ${ord(ra)}, passing ${joinNames(passed.map(esc))}.`
        : `📈 ${esc(o)} climbed from ${ord(rb)} to ${ord(ra)}.`);
      if (ra <= 3 && rb > 3) pts.push(`🥉 ${esc(o)} moved into the top three.`);
    } else if (ra > rb) {
      if (ra === after.n && rb !== after.n) pts.push(`🔻 ${esc(o)} dropped to the bottom of the table.`);
      else if (rb <= 3 && ra > 3) pts.push(`🔻 ${esc(o)} slipped out of the top three.`);
    }
  });

  // Ties created on points (among affected owners)
  affected.forEach(o => {
    const level = after.order.filter(x => x !== o && after.totals[x] === after.totals[o] &&
      before.totals[x] !== before.totals[o]);
    if (level.length) pts.push(`🤝 ${esc(o)} and ${joinNames(level.map(esc))} are now level on ${after.totals[o]} points.`);
  });

  // Progression & elimination (knockout)
  if (isKo && winnerName) {
    const nextName = { r32: 'the Round of 16', r16: 'the quarter-finals', qf: 'the semi-finals', sf: 'the final' };
    if (nextName[round]) {
      const wo = ownersOf(teamKeyByName(winnerName));
      pts.push(`🎟️ ${esc(shortName(winnerName))} reached ${nextName[round]}${wo.length ? `, a progression point for ${joinNames(wo.map(esc))}` : ''}.`);
    }
    if (round === 'sf') {
      pts.push(`😬 ${esc(shortName(loserName))} drop into the third-place play-off.`);
    } else if (round !== 'final' && loserName) {
      const lo = ownersOf(teamKeyByName(loserName));
      let line = `💔 ${esc(shortName(loserName))} were eliminated.`;
      lo.forEach(o => {
        const left = after.active[o];
        if (left === 0) pts.push(`🏁 ${esc(o)} now has no teams left in the tournament.`);
        else if (left === 1) pts.push(`🚨 ${esc(o)} now has just one team left.`);
      });
      if (lo.length) {
        const counts = [...new Set(lo.map(o => after.active[o]))];
        if (counts.length === 1 && counts[0] > 1) line += ` ${joinNames(lo.map(esc))} now ${lo.length === 1 ? 'has' : 'have'} ${counts[0]} teams remaining.`;
      }
      if (!headline) headline = line; else pts.push(line);
    }
  }

  // Group qualification (when this match completes the whole group stage)
  if (!isKo && GROUPS.every(g => groupComplete(g)) && S.matchTimes) {
    // Mention only if this match is the last group completion in the prefix
    // (handled implicitly — the +progression appears in the points delta).
  }

  // Fallbacks
  if (!headline) {
    const topGain = pointLines[0];
    headline = pick([
      affected.length ? `⚽ ${esc(shortName(winnerName || t1Name))} ${s1}–${s2} ${esc(shortName(loserName || t2Name))} — result is in.` : `⚽ Result confirmed.`,
      `⚽ ${esc(shortName(t1Name))} ${s1}–${s2} ${esc(shortName(t2Name))} — points on the board.`
    ], it.id);
  }
  if (pts.length === 0 && pointLines.every(l => / 0 points\.$/.test(l))) {
    pts.push('No change at the top of the table.');
  }

  // De-duplicate and cap commentary (points lines first, then events)
  const seen = new Set([headline]);
  const commentary = [...pointLines, ...pts].filter(l => l && !seen.has(l) && seen.add(l)).slice(0, 3);

  return {
    id: it.id, label, date, time, ts: it.ts,
    t1: { name: t1Name, flag: getFlag(t1Name), score: s1, owners: owners1, badge: tierKey(t1Name) },
    t2: { name: t2Name, flag: getFlag(t2Name), score: s2, owners: owners2, badge: tierKey(t2Name) },
    winnerName, headline, commentary
  };
}

// The three most recent completed matches, newest first, with commentary.
function buildUpdates() {
  const list = completedMatchList();
  const N = list.length;
  if (N === 0) return [];
  const show = Math.min(3, N);
  const snaps = {};
  for (let k = N; k >= N - show; k--) snaps[k] = snapshotPrefix(list, k);
  const out = [];
  for (let j = 0; j < show; j++) {
    const i = N - 1 - j;                 // newest first
    out.push(makeUpdate(list[i], snaps[i], snaps[i + 1]));
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════
// HTML GENERATORS — GROUPS
// ═══════════════════════════════════════════════════════════════════

function standingsHTML(g) {
  const rows = calcStandings(g);
  return `
    <table class="standings-table">
      <thead>
        <tr>
          <th>Team</th>
          <th title="Played">P</th><th title="Won">W</th><th title="Drawn">D</th>
          <th title="Lost">L</th><th title="Goals For">GF</th>
          <th title="Goals Against">GA</th><th title="Goal Difference">GD</th>
          <th title="Points">Pts</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr>
            <td>
              <div class="td-name">
                <span class="pos-dot pos-${i+1}"></span>
                <span class="td-flag">${getFlag(r.name)}</span>
                <span class="td-tname">${esc(r.name)}</span>
              </div>
            </td>
            <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
            <td>${r.gf}</td><td>${r.ga}</td>
            <td class="td-gd">${r.gd > 0 ? '+' + r.gd : r.gd}</td>
            <td class="td-pts">${r.pts}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function groupHTML(g) {
  const names  = [0,1,2,3].map(i => teamName(`${g}${i}`));

  const teamSlots = names.map((n, i) => {
    const key   = `${g}${i}`;
    const dual  = DUAL_OWNER_TEAMS.has(key);
    const o1    = S.owners[key]  || '';
    const o2    = S.owners2[key] || '';
    const ownerFields = dual
      ? `<input id="ow-${g}-${i}"  class="owner-input owner-sm" type="text"
                value="${esc(o1)}" maxlength="6" placeholder="O1">
         <input id="ow2-${g}-${i}" class="owner-input owner-sm" type="text"
                value="${esc(o2)}" maxlength="6" placeholder="O2">`
      : `<input id="ow-${g}-${i}" class="owner-input owner-sm" type="text"
                value="${esc(o1)}" maxlength="6" placeholder="Owner">`;
    return `
      <div class="team-slot">
        <span class="slot-num">${i+1}</span>
        <span class="slot-flag" id="sf-${g}-${i}">${getFlag(n)}</span>
        <input id="ti-${g}-${i}" class="team-name-input"
               type="text" value="${esc(n)}" maxlength="24" placeholder="Team ${g}${i+1}">
        <span id="tb-${g}-${i}" class="slot-tier">${potBadge(n, true)}</span>
        ${ownerFields}
      </div>`;
  }).join('');

  const matchBlocks = FIXTURES[g].map((fx, fIdx) => {
    const { pairIdx, flipped } = fixtureInfo(fx.home, fx.away);
    const sc = S.scores[`${g}_${pairIdx}`] || { h:'', a:'' };
    const homeScore = flipped ? sc.a : sc.h;
    const awayScore = flipped ? sc.h : sc.a;
    const hn = names[fx.home], an = names[fx.away];

    return `
      <div class="match-block">
        <div class="match-date">${fmtDate(fx.date)} · ${fx.time}</div>
        <div class="match-row">
          <span class="match-team" id="ml-${g}-${fIdx}-h">
            <span class="mf">${getFlag(hn)}</span><span class="mn">${esc(hn)}</span>
          </span>
          <div class="score-wrap">
            <input class="score-input" id="sih-${g}-${fIdx}"
                   type="number" min="0" max="99" value="${esc(homeScore)}">
            <span class="score-sep">–</span>
            <input class="score-input" id="sia-${g}-${fIdx}"
                   type="number" min="0" max="99" value="${esc(awayScore)}">
          </div>
          <span class="match-team right" id="ml-${g}-${fIdx}-a">
            <span class="mf">${getFlag(an)}</span><span class="mn">${esc(an)}</span>
          </span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="group-card" id="gc-${g}">
      <div class="group-header">Group ${g}</div>
      <div class="group-body">
        <div class="section-label">Teams &amp; Owners</div>
        <div class="team-slots">${teamSlots}</div>
        <div class="section-label" style="margin-top:10px">Matches</div>
        ${matchBlocks}
        <div class="standings-wrap">
          <div class="section-label" style="margin-top:10px">Standings</div>
          <div id="st-${g}">${standingsHTML(g)}</div>
        </div>
      </div>
    </div>`;
}

function renderGroups() {
  const pane = document.getElementById('tab-groups');
  pane.innerHTML = GROUPS.map(g => groupHTML(g)).join('');

  GROUPS.forEach(g => {
    for (let i = 0; i < 4; i++) {
      // Team name input
      document.getElementById(`ti-${g}-${i}`)?.addEventListener('input', e => {
        const key = `${g}${i}`;
        const oldName = teamName(key);     // before the change
        const val = e.target.value;
        S.teams[key] = val;
        const newName = teamName(key);     // val, or the default fallback

        // The knockout bracket and draw picks store team *names*, so a rename
        // must be propagated there or those teams would be orphaned.
        if (oldName && newName && oldName !== newName) {
          ROUND_ORDER.forEach(r => S.ko[r].forEach(m => {
            if (m.h === oldName) m.h = newName;
            if (m.a === oldName) m.a = newName;
          }));
          S.draw.picks.forEach(rp => rp.forEach(p => { if (p.team === oldName) p.team = newName; }));
        }
        save();

        const sf = document.getElementById(`sf-${g}-${i}`);
        if (sf) sf.textContent = getFlag(val);
        const tb = document.getElementById(`tb-${g}-${i}`);
        if (tb) tb.innerHTML = potBadge(val, true);
        FIXTURES[g].forEach((fx, fIdx) => {
          const text = esc(val || REAL_TEAMS[`${g}${i}`] || `Team ${g}${i+1}`);
          const flag = getFlag(val);
          if (fx.home === i) {
            const el = document.getElementById(`ml-${g}-${fIdx}-h`);
            if (el) el.innerHTML = `<span class="mf">${flag}</span><span class="mn">${text}</span>`;
          }
          if (fx.away === i) {
            const el = document.getElementById(`ml-${g}-${fIdx}-a`);
            if (el) el.innerHTML = `<span class="mf">${flag}</span><span class="mn">${text}</span>`;
          }
        });
        const st = document.getElementById(`st-${g}`);
        if (st) st.innerHTML = standingsHTML(g);
        refreshLeaderboard();
      });
      // Re-render the bracket once editing settles (keeps it light per keystroke)
      document.getElementById(`ti-${g}-${i}`)?.addEventListener('change', () => {
        renderKnockout();
      });

      // Owner 1 input
      document.getElementById(`ow-${g}-${i}`)?.addEventListener('input', e => {
        S.owners[`${g}${i}`] = e.target.value;
        save();
      });
      document.getElementById(`ow-${g}-${i}`)?.addEventListener('change', () => {
        refreshLeaderboard();
        rebuildAwardDropdown();
      });

      // Owner 2 input (dual-owner teams only — optional chaining silently skips others)
      document.getElementById(`ow2-${g}-${i}`)?.addEventListener('input', e => {
        S.owners2[`${g}${i}`] = e.target.value;
        save();
      });
      document.getElementById(`ow2-${g}-${i}`)?.addEventListener('change', () => {
        refreshLeaderboard();
        rebuildAwardDropdown();
      });
    }

    // Score inputs (fixture-indexed, pair-aware)
    FIXTURES[g].forEach((fx, fIdx) => {
      const { pairIdx, flipped } = fixtureInfo(fx.home, fx.away);
      const bindScore = (side) => {
        const el = document.getElementById(`si${side}-${g}-${fIdx}`);
        if (!el) return;
        el.addEventListener('input', e => {
          if (!S.scores[`${g}_${pairIdx}`]) S.scores[`${g}_${pairIdx}`] = { h:'', a:'' };
          const pairSide = (side === 'h') ? (flipped ? 'a' : 'h') : (flipped ? 'h' : 'a');
          S.scores[`${g}_${pairIdx}`][pairSide] = e.target.value;
          syncMatchTimes();
          save();
          const st = document.getElementById(`st-${g}`);
          if (st) st.innerHTML = standingsHTML(g);
          refreshLeaderboard();
        });
      };
      bindScore('h');
      bindScore('a');
    });
  });
  applyAccessMode();
}

// ═══════════════════════════════════════════════════════════════════
// HTML GENERATORS — KNOCKOUT
// ═══════════════════════════════════════════════════════════════════

// Optional knockout fixture dates — fill in "round-idx" keys when known,
// e.g. KO_DATES['r32-0'] = { date:'2026-06-29', time:'20:00' }. Empty = "TBC".
const KO_DATES = {};

// Turn a stored slot label into a friendly placeholder for display only.
// Stored value stays "1A"/"2B"/"3:ABCDF" so populateR32() still matches it.
function prettySlot(s) {
  if (/^1[A-L]$/.test(s)) return `Winner Grp ${s[1]}`;
  if (/^2[A-L]$/.test(s)) return `Runner-up Grp ${s[1]}`;
  const m = /^3:([A-L]+)$/.exec(s);
  if (m) return `Best 3rd place ${m[1].split('').join('/')}`;
  return s;
}

function isKoSlot(s) {
  return !s || /^[12][A-L]$/.test(s) || /^3:/.test(s);
}

// Official FIFA match numbers (104 total): R32 = 73–88, R16 = 89–96,
// QF = 97–100, SF = 101–102, 3rd place = 103, Final = 104.
const MATCH_NUM_BASE = { r32: 73, r16: 89, qf: 97, sf: 101, tp: 103, final: 104 };
function matchNumber(round, idx) { return MATCH_NUM_BASE[round] + idx; }

const ROUND_LABEL = {
  r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-final',
  sf: 'Semi-final', tp: 'Third-place play-off', final: 'Final'
};

// Penalty-shootout picker (shared by the desktop bracket and mobile list).
function koPensHTML(round, idx, m) {
  const both = m.hs !== '' && m.as !== '' && !isNaN(parseInt(m.hs)) && !isNaN(parseInt(m.as));
  if (!(both && parseInt(m.hs) === parseInt(m.as))) return '';
  return `
    <div class="pens-strip">
      <span>${m.pens ? 'Pens:' : '⚠ Level — pick winner:'}</span>
      <button class="pens-pick admin-disable${m.pens==='h'?' chosen':''}"
              data-r="${round}" data-i="${idx}" data-p="h">${esc(m.h||'—')}</button>
      <button class="pens-pick admin-disable${m.pens==='a'?' chosen':''}"
              data-r="${round}" data-i="${idx}" data-p="a">${esc(m.a||'—')}</button>
    </div>`;
}

// Build one bracket match card. `side` is 'l' | 'r' | 'c' (centre) for connectors.
function koCardHTML(round, idx, side) {
  const m = S.ko[round][idx];
  const winner = koWinner(m);
  const isFinal = round === 'final';
  const isTp    = round === 'tp';

  const hSlot = isKoSlot(m.h), aSlot = isKoSlot(m.a);
  const hClass = hSlot ? 'ko-name empty' : winner === m.h ? 'ko-name winner-name' : 'ko-name';
  const aClass = aSlot ? 'ko-name empty' : winner === m.a ? 'ko-name winner-name' : 'ko-name';

  const label = isFinal ? '🏆 Final' : isTp ? '🥉 Third-Place Play-off' :
    round === 'r32' ? `Round of 32 · Match ${idx+1}` :
    round === 'r16' ? `Round of 16 · Match ${idx+1}` :
    round === 'qf'  ? `Quarter-Final · Match ${idx+1}` :
                      `Semi-Final · Match ${idx+1}`;

  // Only show a date line when an actual kick-off is known (declutters the bracket)
  const dt = KO_DATES[`${round}-${idx}`];
  const dateHTML = dt ? `<div class="ko-date">${fmtDate(dt.date)} · ${dt.time}</div>` : '';

  const pensHTML = koPensHTML(round, idx, m);

  const nameCell = (slot, name, cls) => {
    const disp = slot ? prettySlot(name || 'TBD') : esc(shortName(name));
    const flag = slot ? '' : `<span class="kf">${getFlag(name)}</span>`;
    const badge = slot ? '' : potBadgeMini(name);
    // Full official name as a tooltip in case the short name is truncated
    const title = slot ? '' : ` title="${esc(name)}"`;
    return `<span class="${cls}">${flag}<span class="ko-tname"${title}>${disp}</span>${badge}</span>`;
  };

  // Team name + owner line stacked vertically; owners follow the team
  // automatically because they're looked up by the slot's current team name.
  const teamBlock = (slot, name, cls) => {
    let ownerHTML = '';
    if (!slot) {
      const info = ownerLineForName(name);
      if (info) {
        // Just the owner name(s) — "Steve", "Steve / Ellie", or "—" (no "Owner:")
        ownerHTML = `<span class="ko-owner${info.empty ? ' empty' : ''}">${esc(info.text)}</span>`;
      }
    }
    return `<div class="ko-team">${nameCell(slot, name, cls)}${ownerHTML}</div>`;
  };

  // Incoming connector stub(s) — the Round of 32 (outermost) receives nothing;
  // the Final is fed from both the left and right semi-finals.
  let ci = '';
  if (isFinal) {
    ci = '<span class="ci ci-l"></span><span class="ci ci-r"></span>';
  } else if (round !== 'tp' && round !== 'r32') {
    if (side === 'l') ci = '<span class="ci ci-l"></span>';
    if (side === 'r') ci = '<span class="ci ci-r"></span>';
  }

  return `
    <div class="mw mw-${side}">
      ${ci}
      <div class="ko-card${isFinal?' final-card':''}${isTp?' tp-card':''}" id="kc-${round}-${idx}">
        <div class="ko-card-head">
          <span class="ko-label">${label}</span>
          ${winner ? `<span class="ko-winner-label">→ ${getFlag(winner)} ${esc(shortName(winner))}</span>` : ''}
        </div>
        ${dateHTML}
        <div class="ko-card-body">
          <div class="ko-row">
            ${teamBlock(hSlot, m.h, hClass)}
            <input class="ko-score" data-r="${round}" data-i="${idx}" data-side="h" type="number" min="0" max="99" value="${esc(m.hs)}">
          </div>
          <div class="ko-row">
            ${teamBlock(aSlot, m.a, aClass)}
            <input class="ko-score" data-r="${round}" data-i="${idx}" data-side="a" type="number" min="0" max="99" value="${esc(m.as)}">
          </div>
          ${pensHTML}
        </div>
      </div>
    </div>`;
}

// A single round column (one of the nine bracket grid cells).
// `pairs` rounds (R32/R16/QF) draw the vertical line joining each match pair.
function roundColHTML(round, indices, side) {
  const cards = indices.map(i => koCardHTML(round, i, side)).join('');
  const pairs = (round === 'r32' || round === 'r16' || round === 'qf') ? ' pairs' : '';
  return `<div class="round round-${round}-${side}${pairs}" data-round="${round}">${cards}</div>`;
}

// ── Mobile knockout: a chronological list of every knockout fixture ──
function koMobileCard(round, idx) {
  const m = S.ko[round][idx];
  const winner = koWinner(m);
  const num = matchNumber(round, idx);
  const dt = KO_DATES[`${round}-${idx}`];
  const dateLine = dt ? `${fmtDate(dt.date)} · ${dt.time}` : 'Date TBC';

  const teamRow = (name, score, side) => {
    const slot = isKoSlot(name);
    const disp = slot ? prettySlot(name || 'TBD') : esc(shortName(name));
    const flag = slot ? '' : `<span class="kf">${getFlag(name)}</span>`;
    const badge = slot ? '' : potBadgeMini(name);
    const isWin = !slot && winner === name;
    const info = slot ? null : ownerLineForName(name);
    const ownerHTML = info
      ? `<div class="kmo-owner${info.empty ? ' empty' : ''}">${esc(info.text)}</div>` : '';
    return `
      <div class="kmo-team${isWin ? ' kmo-win' : ''}">
        <div class="kmo-tline">
          ${flag}<span class="kmo-name"${slot ? '' : ` title="${esc(name)}"`}>${disp}</span>${badge}
          <input class="ko-score kmo-score" data-r="${round}" data-i="${idx}" data-side="${side}"
                 type="number" min="0" max="99" value="${esc(score)}">
        </div>
        ${ownerHTML}
      </div>`;
  };

  return `
    <div class="kmo-card${round === 'final' ? ' kmo-final' : ''}${round === 'tp' ? ' kmo-tp' : ''}">
      <div class="kmo-head">
        <span class="kmo-round">${ROUND_LABEL[round]} · Match ${num}</span>
        ${winner ? `<span class="kmo-wlabel">→ ${getFlag(winner)} ${esc(shortName(winner))}</span>` : ''}
      </div>
      <div class="kmo-date">${dateLine}</div>
      ${teamRow(m.h, m.hs, 'h')}
      ${teamRow(m.a, m.as, 'a')}
      ${koPensHTML(round, idx, m)}
    </div>`;
}

function koMobileHTML() {
  const items = [];
  ROUND_ORDER.forEach(round => {
    for (let i = 0; i < ROUND_META[round].size; i++) {
      const dt = KO_DATES[`${round}-${i}`];
      const when = dt ? Date.parse(`${dt.date}T${dt.time || '00:00'}`) : null;
      items.push({ round, idx: i, num: matchNumber(round, i), when });
    }
  });
  // Dated matches first (chronological); undated after, by official match number.
  items.sort((a, b) => {
    if (a.when != null && b.when != null) return a.when - b.when || a.num - b.num;
    if (a.when != null) return -1;
    if (b.when != null) return 1;
    return a.num - b.num;
  });
  return `<div class="ko-mobile">${items.map(it => koMobileCard(it.round, it.idx)).join('')}</div>`;
}

function renderKnockout() {
  const pane = document.getElementById('tab-knockout');
  const finalWinner = koWinner(S.ko.final[0]);

  // Nine columns feed inward to the centre. The order matches advanceAll():
  // r32[0-7]→…→sf[0]→final.h (left) ; r32[8-15]→…→sf[1]→final.a (right).
  const championHTML = finalWinner ? `
    <div class="champion-banner">
      <div class="trophy">${getFlag(finalWinner)}</div>
      <h2>${esc(finalWinner)}</h2>
      <p>World Cup 2026 Champions 🏆</p>
    </div>` : '';

  const centerHTML = `
    <div class="center-col">
      <div class="final-block">
        <div class="final-crown">🏆 THE FINAL</div>
        ${koCardHTML('final', 0, 'c')}
        ${championHTML}
      </div>
      <div class="tp-block">
        ${koCardHTML('tp', 0, 'c')}
      </div>
    </div>`;

  pane.innerHTML = `
    <div class="top-bar">
      <button class="btn btn-green btn-sm admin-only" id="btn-populate">
        ⚡ Auto-fill R32 from Group Results
      </button>
    </div>
    <div class="bracket">
      ${roundColHTML('r32', [0,1,2,3,4,5,6,7], 'l')}
      ${roundColHTML('r16', [0,1,2,3], 'l')}
      ${roundColHTML('qf',  [0,1], 'l')}
      ${roundColHTML('sf',  [0], 'l')}
      ${centerHTML}
      ${roundColHTML('sf',  [1], 'r')}
      ${roundColHTML('qf',  [2,3], 'r')}
      ${roundColHTML('r16', [4,5,6,7], 'r')}
      ${roundColHTML('r32', [8,9,10,11,12,13,14,15], 'r')}
    </div>
    ${koMobileHTML()}`;

  // Score inputs — bound by class + data attributes so the same handler works
  // for both the desktop bracket and the mobile fixture list.
  pane.querySelectorAll('.ko-score').forEach(el => {
    const r = el.dataset.r, i = parseInt(el.dataset.i), side = el.dataset.side;
    el.addEventListener('input', () => {
      S.ko[r][i][side === 'h' ? 'hs' : 'as'] = el.value;
      S.ko[r][i].pens = '';
      save();
    });
    el.addEventListener('change', () => {
      advanceAll();
      syncMatchTimes();
      save();
      renderKnockout();
      refreshLeaderboard();
    });
  });

  pane.querySelectorAll('.pens-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.dataset.r, i = parseInt(btn.dataset.i), p = btn.dataset.p;
      S.ko[r][i].pens = p;
      advanceAll();
      syncMatchTimes();
      save();
      renderKnockout();
      refreshLeaderboard();
    });
  });

  document.getElementById('btn-populate')?.addEventListener('click', populateR32);
  applyAccessMode();
}

// ═══════════════════════════════════════════════════════════════════
// HTML GENERATORS — SWEEPSTAKE
// ═══════════════════════════════════════════════════════════════════

function buildSummaryHTML(rows) {
  const leader     = rows[0] ? `${esc(rows[0].owner)} · ${rows[0].total} pts` : '–';
  const ownerCount = rows.length;
  // Count distinct team slots that have at least one owner assigned
  const teamCount = GROUPS.reduce((n, g) => {
    for (let i = 0; i < 4; i++) {
      const k = `${g}${i}`;
      if ((S.owners[k]||'').trim() || (S.owners2[k]||'').trim()) n++;
    }
    return n;
  }, 0);
  const awardCount = S.awards.length;

  return `
    <div class="sw-stat">
      <div class="sw-stat-val sw-leader-val">${leader}</div>
      <div class="sw-stat-lbl">Current Leader</div>
    </div>
    <div class="sw-stat">
      <div class="sw-stat-val">${ownerCount}</div>
      <div class="sw-stat-lbl">Owners</div>
    </div>
    <div class="sw-stat">
      <div class="sw-stat-val">${teamCount}</div>
      <div class="sw-stat-lbl">Teams Assigned</div>
    </div>
    <div class="sw-stat">
      <div class="sw-stat-val">${awardCount}</div>
      <div class="sw-stat-lbl">Player Awards</div>
    </div>`;
}

// All 6 group matches have valid scores
function groupComplete(g) {
  return MATCH_PAIRS.every((_, idx) => {
    const sc = S.scores[`${g}_${idx}`];
    return sc && sc.h !== '' && sc.a !== '' &&
      !isNaN(parseInt(sc.h)) && !isNaN(parseInt(sc.a));
  });
}

// Has the Round of 32 been filled with real teams (Auto-fill R32 run)?
function bracketPopulated() {
  return S.ko.r32.some(m => !isKoSlot(m.h) || !isKoSlot(m.a));
}

// Tournament status of a team (by key). Recalculates purely from results.
function teamStatus(key) {
  const name = teamName(key);
  const mk = (label, code, elim) => ({ label, code, elim });

  const inBracket = ROUND_ORDER.some(r => S.ko[r].some(m => m.h === name || m.a === name));
  if (inBracket) {
    if (koWinner(S.ko.final[0]) === name) return mk('Champion',    'champion', false);
    if (koLoser(S.ko.final[0])  === name) return mk('Runner-up',   'runnerup', true);
    if (koWinner(S.ko.tp[0])    === name) return mk('Third place', 'third',    false);
    if (koLoser(S.ko.tp[0])     === name) return mk('Eliminated',  'elim',     true); // lost 3rd-place game

    const labels = { r32:'Round of 32', r16:'Round of 16', qf:'Quarter-final', sf:'Semi-final', final:'Final' };
    let deepest = null, deepestMatch = null;
    ['r32','r16','qf','sf','final'].forEach(r => {
      S.ko[r].forEach(m => { if (m.h === name || m.a === name) { deepest = r; deepestMatch = m; } });
    });
    if (deepest) {
      const w = koWinner(deepestMatch);
      if (w && w !== name) {
        // Semi-final losers drop into the third-place play-off (not out yet)
        if (deepest === 'sf') return mk('3rd-place play-off', 'tpplay', false);
        return mk('Eliminated', 'elim', true);
      }
      return mk(labels[deepest], 'active', false);
    }
  }

  // Group stage (team not in the knockout bracket)
  const g = key[0];
  if (!groupComplete(g)) return mk('In play', 'active', false);
  const standings = calcStandings(g);
  const pos = standings.findIndex(r => r.key === key) + 1; // 1–4
  if (pos === 4) return mk('Eliminated', 'elim', true);    // 4th never qualifies
  if (bracketPopulated()) return mk('Eliminated', 'elim', true); // complete + drawn + not in bracket = out
  if (pos <= 2) return mk('Qualified', 'active', false);
  return mk('In play', 'active', false);                   // 3rd, best-third not yet determined
}

function buildTableHTML(rows) {
  if (rows.length === 0) {
    return `<div class="sw-empty">
      No entries yet. Add owner names to teams in the Groups tab.
    </div>`;
  }
  const medals = ['🥇','🥈','🥉'];
  const body = rows.map((r, idx) => {
    // Status is still computed internally (it controls greying) but no longer
    // shown as text beside each team.
    // Always display teams in pot-strength order: Top → Pot 1 → 2 → 3 → Bottom.
    const orderedKeys = r.keys.slice().sort((a, b) => tierRank(teamName(a)) - tierRank(teamName(b)));
    const teams = orderedKeys.map(k => {
      const n = teamName(k);
      const out = teamStatus(k).elim;
      return `<span class="sw-chip${out ? ' sw-out' : ''}">` +
        `<span class="sw-cflag">${getFlag(n)}</span>` +
        `<span class="sw-cname">${esc(shortName(n))}</span>` +
        `${potBadgeMini(n)}</span>`;
    }).join('');
    return `
      <tr class="${idx < 3 ? 'sw-rank-'+( idx+1) : ''}">
        <td class="sw-rank-cell">${medals[idx] || idx+1}</td>
        <td class="sw-owner-cell">${esc(r.owner)}</td>
        <td class="sw-teams-cell">${teams}</td>
        <td class="sw-num sw-bd">${r.matchPts}</td>
        <td class="sw-num sw-bd">${r.progBonus}</td>
        <td class="sw-num sw-bd">${r.placingBonus}</td>
        <td class="sw-num sw-bd">${r.awardBonus}</td>
        <td class="sw-total-cell">${r.total}</td>
      </tr>`;
  }).join('');

  return `
    <table class="sw-table">
      <thead>
        <tr>
          <th class="sw-rank-cell">#</th>
          <th>Owner</th>
          <th>Teams</th>
          <th class="sw-bd" title="Win=2 · Draw=1 · Loss=0 for every match played">Match</th>
          <th class="sw-bd" title="R32=1 · R16=2 · QF=3 · SF=4 · Final=5 · Win=6">Prog</th>
          <th class="sw-bd" title="1st place=5 · 2nd=3 · 3rd=1">Place</th>
          <th class="sw-bd" title="+3 per player award">Award</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

function ownerDisplay(key) {
  const o1 = (S.owners[key]  || '').trim();
  const o2 = (S.owners2[key] || '').trim();
  const parts = [o1, (o2 && o2 !== o1) ? o2 : ''].filter(Boolean);
  return parts.join('/');
}

function buildAwardsHTML() {
  // Build team dropdown options
  let opts = '<option value="">Select a team…</option>';
  GROUPS.forEach(g => {
    for (let i = 0; i < 4; i++) {
      const k = `${g}${i}`;
      const n = teamName(k);
      const od = ownerDisplay(k);
      opts += `<option value="${esc(k)}">${getFlag(n)} ${esc(n)}${od ? ` · ${od}` : ''}</option>`;
    }
  });

  const awardList = S.awards.length === 0
    ? '<p class="sw-empty">No player awards added yet.</p>'
    : S.awards.map(a => {
        const n  = teamName(a.teamKey);
        const od = ownerDisplay(a.teamKey);
        const o  = od
          ? ` → <strong>${esc(od)}</strong>`
          : ` <span class="sw-warn">(no owner)</span>`;
        return `
          <div class="sw-award-row">
            <span class="award-badge">${esc(a.name)}</span>
            <span class="award-team">${getFlag(n)} ${esc(n)}${o}</span>
            <span class="award-pts">+3</span>
            <button class="btn btn-danger btn-sm btn-remove-award admin-only" data-id="${a.id}">✕</button>
          </div>`;
      }).join('');

  return `
    <div class="sw-section-head">🏅 Player Awards <span class="sw-section-sub">(+3 pts each)</span></div>
    <div class="sw-add-form admin-only">
      <input id="award-name-input" class="award-text-input" type="text"
             placeholder='Award name, e.g. "Golden Boot"' maxlength="50">
      <select id="award-team-select" class="award-team-select">${opts}</select>
      <button id="btn-add-award" class="btn btn-green btn-sm">+ Add</button>
    </div>
    <div id="award-owner-preview" class="award-owner-preview admin-only"></div>
    <div class="sw-awards-list">${awardList}</div>`;
}

// Update just the team dropdown in the awards section (preserving form state)
function rebuildAwardDropdown() {
  const sel = document.getElementById('award-team-select');
  if (!sel) return;
  const cur = sel.value;
  let opts = '<option value="">Select a team…</option>';
  GROUPS.forEach(g => {
    for (let i = 0; i < 4; i++) {
      const k = `${g}${i}`;
      const n = teamName(k);
      const od = ownerDisplay(k);
      opts += `<option value="${esc(k)}">${getFlag(n)} ${esc(n)}${od ? ` · ${od}` : ''}</option>`;
    }
  });
  sel.innerHTML = opts;
  sel.value = cur;
}

function bindAwardEvents() {
  const sel     = document.getElementById('award-team-select');
  const preview = document.getElementById('award-owner-preview');

  sel?.addEventListener('change', () => {
    if (!preview || !sel.value) { if (preview) preview.innerHTML = ''; return; }
    const k = sel.value, od = ownerDisplay(k), n = teamName(k);
    preview.innerHTML = od
      ? `<span class="sw-preview-ok">Owner: <strong>${esc(od)}</strong></span>`
      : `<span class="sw-warn">⚠ No owner assigned to ${esc(n)}</span>`;
  });

  document.getElementById('btn-add-award')?.addEventListener('click', () => {
    const nameEl = document.getElementById('award-name-input');
    const awardName = nameEl?.value.trim();
    const teamKey   = sel?.value;
    if (!awardName) { alert('Please enter an award name.'); return; }
    if (!teamKey)   { alert('Please select a team.'); return; }
    S.awards.push({ id: Date.now(), name: awardName, teamKey });
    save();
    const saved = nameEl?.value; // will clear below
    renderAwards();
    refreshLeaderboard();
    if (nameEl) nameEl.value = '';
  });

  document.querySelectorAll('.btn-remove-award').forEach(btn => {
    btn.addEventListener('click', () => {
      S.awards = S.awards.filter(a => a.id !== parseInt(btn.dataset.id));
      save();
      renderAwards();
      refreshLeaderboard();
    });
  });
}

function refreshLeaderboard() {
  const tblEl = document.getElementById('sw-table');
  if (!tblEl) return;
  // calcSweepstake / buildSummaryHTML remain available; the summary cards were
  // removed from the top of the Sweepstake tab to keep it compact.
  tblEl.innerHTML = buildTableHTML(calcSweepstake());
  renderUpdates();
}

// ── Latest Updates section (below the leaderboard) ──
function buildUpdatesHTML(updates) {
  const head = `
    <div class="sw-section-head">
      ⚡ Latest Updates
      <button id="btn-rebuild-updates" class="btn btn-outline btn-sm admin-only sw-bd-toggle">↻ Rebuild</button>
    </div>`;
  if (!updates.length) {
    return head + `<div class="upd-empty">No results yet — the drama starts with the first final whistle.</div>`;
  }
  const team = t => `
    <span class="upd-team">
      <span class="upd-flag">${t.flag}</span>
      <span class="upd-tname">${esc(shortName(t.name))}</span>
      ${t.badge ? `<span class="tier-badge tier-mini ${TIER_META[t.badge].cls}" title="${TIER_META[t.badge].name}">${TIER_META[t.badge].mini}</span>` : ''}
      <span class="upd-tscore">${esc(t.score)}</span>
    </span>`;
  const cards = updates.map(u => `
    <div class="upd-card">
      <div class="upd-meta">${esc(u.label)}${u.date ? ` · ${fmtDate(u.date)}${u.time ? ' ' + esc(u.time) : ''}` : ''}</div>
      <div class="upd-score">${team(u.t1)}<span class="upd-vs">v</span>${team(u.t2)}</div>
      <div class="upd-owners">
        <span>${u.t1.flag} ${u.t1.owners.length ? esc(joinNames(u.t1.owners)) : '—'}</span>
        <span>${u.t2.flag} ${u.t2.owners.length ? esc(joinNames(u.t2.owners)) : '—'}</span>
      </div>
      <div class="upd-headline">${u.headline}</div>
      ${u.commentary.length ? `<ul class="upd-points">${u.commentary.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
      <div class="upd-time">Updated ${relativeTime(u.ts)}</div>
    </div>`).join('');
  return head + `<div class="upd-grid">${cards}</div>`;
}

function renderUpdates() {
  const el = document.getElementById('sw-updates');
  if (!el) return;
  el.innerHTML = buildUpdatesHTML(buildUpdates());
  applyAccessMode();
  document.getElementById('btn-rebuild-updates')?.addEventListener('click', () => {
    if (!isAdmin) return;
    syncMatchTimes();
    save();
    renderUpdates();
  });
}

function renderAwards() {
  const el = document.getElementById('sw-awards');
  if (!el) return;
  // Save form state
  const savedName = document.getElementById('award-name-input')?.value ?? '';
  const savedTeam = document.getElementById('award-team-select')?.value ?? '';
  el.innerHTML = buildAwardsHTML();
  // Restore form state
  const ni = document.getElementById('award-name-input');
  const ts = document.getElementById('award-team-select');
  if (ni) ni.value = savedName;
  if (ts) ts.value = savedTeam;
  bindAwardEvents();
  applyAccessMode();
}

function renderSweepstake() {
  const pane = document.getElementById('tab-sweepstake');
  if (!pane) return;
  const showBd = !!uiPrefs.breakdown;
  pane.innerHTML = `
    <div class="sw-body">
      <div class="sw-table-section${showBd ? ' show-breakdown' : ''}" id="sw-table-section">
        <div class="sw-section-head">
          🏆 Leaderboard
          <button id="btn-breakdown" class="btn btn-outline btn-sm sw-bd-toggle">
            ${showBd ? 'Hide points breakdown' : 'Show points breakdown'}
          </button>
        </div>
        <div id="sw-table"></div>
      </div>
      <div class="sw-awards-section">
        <div id="sw-awards"></div>
      </div>
    </div>
    <div id="sw-updates" class="sw-updates-section"></div>`;
  refreshLeaderboard();
  renderAwards();
  applyAccessMode();

  // Breakdown is a local-only view preference (anyone can toggle it).
  document.getElementById('btn-breakdown')?.addEventListener('click', () => {
    uiPrefs.breakdown = !uiPrefs.breakdown;
    saveUiPrefs();
    const sec = document.getElementById('sw-table-section');
    const btn = document.getElementById('btn-breakdown');
    if (sec) sec.classList.toggle('show-breakdown', uiPrefs.breakdown);
    if (btn) btn.textContent = uiPrefs.breakdown ? 'Hide points breakdown' : 'Show points breakdown';
  });
}

// ═══════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════

function activateTab(name) {
  const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
  const pane = document.getElementById(`tab-${name}`);
  if (!btn || !pane) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  pane.classList.add('active');
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
      try { sessionStorage.setItem('wc_tab', btn.dataset.tab); } catch (e) {}
    });
  });
  // Remember the tab for this browser session. A first-time visitor has no
  // stored tab, so the HTML default (Sweepstake) shows first.
  let remembered = null;
  try { remembered = sessionStorage.getItem('wc_tab'); } catch (e) {}
  if (remembered) activateTab(remembered);
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL BUTTONS
// ═══════════════════════════════════════════════════════════════════

function initButtons() {
  document.getElementById('btn-print')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('active'));
    window.print();
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    if (activeTab) document.getElementById(`tab-${activeTab}`).classList.add('active');
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (!confirm('Reset all scores and knockout bracket?\nThis cannot be undone.')) return;
    const hadOwners = Object.values(S.owners).some(v => v && v.trim()) ||
                      Object.values(S.owners2).some(v => v && v.trim());
    S.scores = {};
    S.ko     = makeKO();
    S.matchTimes = {};               // clear Latest Updates history
    if (hadOwners && confirm('Also reset owner names?')) {
      S.owners = {}; S.owners2 = {};
      // Owner data is driven by the draw, so reset the draw too (keeps names)
      const names = S.draw.names.slice();
      S.draw = freshDraw();
      S.draw.names = names;
    }
    save();
    renderGroups();
    renderKnockout();
    renderSweepstake();
    renderAssignment();
  });

  document.getElementById('btn-sample')?.addEventListener('click', () => {
    if (Object.keys(S.scores).length > 0) {
      if (!confirm('Load sample data? Current scores will be overwritten.')) return;
    }
    S.teams  = { ...SAMPLE_TEAMS };
    S.scores = { ...SAMPLE_SCORES };
    S.ko     = makeKO();
    S.matchTimes = {};
    syncMatchTimes();                // stamp the loaded sample results
    save();
    renderGroups();
    renderKnockout();
    renderSweepstake();
    if (confirm('Sample data loaded! Auto-fill Round of 32 from group results?')) populateR32();
  });
}

// ═══════════════════════════════════════════════════════════════════
// ASSIGNMENT (sweepstake draw)
// ═══════════════════════════════════════════════════════════════════

let drawAnimating = false;
let skipRequested = false;   // skip the current reveal
let drawSkipAll   = false;   // fast-forward the rest of a full-round draw
let drawTimer     = null;
let audioCtx      = null;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Push fresh owner-slot data for whichever applies to other tabs
function syncOwnersEverywhere() {
  renderGroups();
  renderKnockout();
  refreshLeaderboard();
  rebuildAwardDropdown();
}

// Lazily build the shuffled team pool for the current round
function ensurePool() {
  const d = S.draw;
  if (d.complete || d.pool) return;
  const round = DRAW_ROUNDS[d.round];
  const pool = round.shared ? round.teams.flatMap(t => [t, t]) : round.teams.slice();
  d.pool = shuffle(pool);
}

// Next owner (in fixed order 1→12) who hasn't drawn this round yet
function nextOwnerIdx() {
  const drawn = new Set(S.draw.picks[S.draw.round].map(p => p.o));
  for (let i = 0; i < NUM_OWNERS; i++) if (!drawn.has(i)) return i;
  return -1;
}

// Record one owner→team pick and write it into the shared owner data
function commitPick(ownerIdx, team) {
  const d = S.draw;
  d.picks[d.round].push({ o: ownerIdx, team });
  const pi = d.pool.indexOf(team);
  if (pi >= 0) d.pool.splice(pi, 1);

  // Update the owner field(s) used by the rest of the app
  const key = teamKeyByName(team);
  if (key) {
    const name = d.names[ownerIdx];
    if (DUAL_OWNER_TEAMS.has(key)) {
      if (!(S.owners[key] || '').trim()) S.owners[key] = name;
      else S.owners2[key] = name;
    } else {
      S.owners[key] = name;
    }
  }

  // Advance round / finish
  if (d.picks[d.round].length === NUM_OWNERS) {
    if (d.round === DRAW_ROUNDS.length - 1) d.complete = true;
    else { d.round++; d.pool = null; }
  }
  save();
}

// True only when all 12 owner names are filled in
function ownersReady() {
  return S.draw.names.every(n => n && n.trim());
}

// ── Lightweight Web Audio SFX (off by default; only plays after a click) ──
function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  } catch (e) { audioCtx = null; }
  return audioCtx;
}
function beep(freq, dur, type, vol) {
  if (!uiPrefs.sound) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch (e) {}
}
const sfxTick     = () => beep(900, 0.035, 'square', 0.03);
const sfxSuspense = () => beep(210, 0.45, 'sawtooth', 0.05);
const sfxReveal   = () => [523, 659, 784, 1047].forEach((f, i) =>
  setTimeout(() => beep(f, 0.18, 'triangle', 0.06), i * 90));

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function reelFace(team, big) {
  const c = big ? ' big' : '';
  return `<span class="reel-flag${c}">${getFlag(team)}</span>` +
         `<span class="reel-name${c}">${esc(shortName(team))}</span>`;
}

function highlightOwner(o, on) {
  const el = document.getElementById(`own-${o}`);
  const field = el && el.closest ? el.closest('.own-field') : null;
  if (field) field.classList.toggle('drawing', on);
}

function setDrawButtonsDisabled(dis) {
  ['btn-draw-next','btn-draw-round','btn-reset-draw','btn-clear-assign','btn-save-owners']
    .forEach(id => { const b = document.getElementById(id); if (b) b.disabled = dis; });
  const skip = document.getElementById('btn-skip-draw');
  if (skip && skip.style) skip.style.display = dis ? 'inline-flex' : 'none';
}

function fireConfetti() {
  if (prefersReducedMotion()) return;
  const host = document.getElementById('draw-reel');
  if (!host || typeof document.createElement !== 'function') return;
  const burst = document.createElement('div');
  burst.className = 'confetti';
  const colors = ['#f5c518','#1a7a40','#1f6fb2','#8a1538','#ffffff'];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', (Math.random() * 2 - 1).toFixed(2));
    p.style.setProperty('--r', (Math.random() * 360).toFixed(0) + 'deg');
    p.style.setProperty('--d', (0.6 + Math.random() * 0.6).toFixed(2) + 's');
    p.style.background = colors[i % colors.length];
    p.style.left = (38 + Math.random() * 24) + '%';
    burst.appendChild(p);
  }
  host.appendChild(burst);
  setTimeout(() => burst.remove && burst.remove(), 1400);
}

// Run one dramatic owner→team reveal, then call done().
// `fast` = full-round pace. The result (o, team) is already decided; the
// animation is purely cosmetic and never changes it.
function runReveal(o, team, fast, done) {
  drawAnimating = true;
  skipRequested = false;
  setDrawButtonsDisabled(true);
  highlightOwner(o, true);

  const reel    = document.getElementById('draw-reel');
  const reveal  = document.getElementById('draw-reveal');
  const ownerNm = S.draw.names[o];
  const pool    = DRAW_ROUNDS[S.draw.round].teams;
  if (reveal) reveal.innerHTML = '';

  const minimal = prefersReducedMotion() || drawSkipAll; // no countdown/cycle
  const frames = [];

  if (!minimal && !fast) {
    ['3','2','1'].forEach(n => frames.push({ delay: 540, fn: () => {
      if (reel) reel.innerHTML = `<span class="reel-count">${n}</span>`;
      sfxTick();
    }}));
  }
  if (!minimal) {
    let delay = fast ? 45 : 55;
    let t = 0; const total = fast ? 650 : 2050;
    while (t < total) {
      frames.push({ delay, fn: () => {
        const rnd = pool[Math.floor(Math.random() * pool.length)];
        if (reel) reel.innerHTML = reelFace(rnd, false);
        sfxTick();
      }});
      t += delay; delay = fast ? delay + 7 : delay * 1.12;
    }
    frames.push({ delay: fast ? 140 : 420, fn: () => {
      if (reel) reel.innerHTML = reelFace(team, false);
      sfxSuspense();
    }});
  }

  // Final reveal frame (always present)
  frames.push({ delay: minimal ? 0 : 250, fn: () => {
    if (reel) {
      reel.classList.add('landed');
      reel.innerHTML = reelFace(team, true);
      setTimeout(() => reel.classList.remove('landed'), 600);
    }
    if (reveal) reveal.innerHTML =
      `<strong>${esc(ownerNm)}</strong> gets ${getFlag(team)} ` +
      `<strong>${esc(shortName(team))}</strong> ${potBadge(team, false)} 🎉`;
    sfxReveal();
    fireConfetti();
  }});

  let i = 0;
  function finish() {
    if (drawTimer) { clearTimeout(drawTimer); drawTimer = null; }
    setTimeout(() => {
      highlightOwner(o, false);
      drawAnimating = false;
      setDrawButtonsDisabled(false);
      done && done();
    }, (minimal || fast) ? 220 : 600);
  }
  function step() {
    if (skipRequested) { frames[frames.length - 1].fn(); finish(); return; }
    if (i >= frames.length) { finish(); return; }
    const f = frames[i++];
    f.fn();
    drawTimer = setTimeout(step, f.delay);
  }
  step();
}

// Draw the next single owner (full dramatic animation)
function drawNext() {
  if (drawAnimating) return;
  if (!ownersReady()) { alert('Please enter all 12 owner names first.'); return; }
  const d = S.draw;
  if (d.complete) return;
  drawSkipAll = false;
  ensurePool();
  const o = nextOwnerIdx();
  if (o < 0) return;
  const team = d.pool[Math.floor(Math.random() * d.pool.length)]; // result decided up-front
  runReveal(o, team, false, () => {
    commitPick(o, team);
    syncOwnersEverywhere();
    updateDrawStatus();
  });
}

// Draw every remaining pick in the current round; each still gets a short reveal
function drawFullRound() {
  if (drawAnimating) return;
  if (!ownersReady()) { alert('Please enter all 12 owner names first.'); return; }
  const d = S.draw;
  if (d.complete) return;
  drawSkipAll = false;
  ensurePool();
  const startRound = d.round;

  (function step() {
    if (d.complete || d.round !== startRound) { drawSkipAll = false; syncOwnersEverywhere(); updateDrawStatus(); return; }
    const o = nextOwnerIdx();
    if (o < 0) { drawSkipAll = false; syncOwnersEverywhere(); updateDrawStatus(); return; }
    const team = d.pool[Math.floor(Math.random() * d.pool.length)];
    runReveal(o, team, true, () => {
      commitPick(o, team);
      updateDrawStatus();
      step();
    });
  })();
}

// Skip the running animation (and fast-forward the rest of a full round)
function skipDraw() {
  if (!drawAnimating) return;
  skipRequested = true;
  drawSkipAll = true;
}

// Toggle draw sound effects (muted by default; local-only preference)
function toggleDrawSound() {
  uiPrefs.sound = !uiPrefs.sound;
  saveUiPrefs();
  if (uiPrefs.sound) ensureAudio(); // create context inside the click gesture
  const b = document.getElementById('btn-sound');
  if (b) {
    b.textContent = uiPrefs.sound ? '🔊 Sound on' : '🔇 Sound off';
    b.classList.toggle('sound-on', uiPrefs.sound);
  }
}

// Reset just the draw progress (keep owner names); clears assigned owners
function resetDraw() {
  const hasPicks = S.draw.picks.some(r => r.length > 0);
  if (hasPicks && !confirm('Reset the draw? All current team assignments will be cleared (owner names are kept).')) return;
  const names = S.draw.names.slice();
  S.draw = freshDraw();
  S.draw.names = names;
  S.owners = {};
  S.owners2 = {};
  save();
  syncOwnersEverywhere();
  renderAssignment();
}

// Clear everything in the Assignment tab (names + draw + owners)
function clearAssignment() {
  const hasData = S.draw.names.some(n => n && n.trim()) || S.draw.picks.some(r => r.length > 0);
  if (hasData && !confirm('Clear the whole assignment? Owner names and all team assignments will be deleted.')) return;
  S.draw = freshDraw();
  S.owners = {};
  S.owners2 = {};
  save();
  syncOwnersEverywhere();
  renderAssignment();
}

// ── Rendering ──
function buildOwnerInputsHTML() {
  return S.draw.names.map((nm, i) => `
    <div class="own-field">
      <span class="own-num">Owner ${i + 1}</span>
      <input id="own-${i}" class="own-input" type="text" maxlength="6"
             value="${esc(nm)}" placeholder="Name">
    </div>`).join('');
}

function buildTeamListHTML() {
  const d = S.draw;
  if (d.complete) return '';
  const round = DRAW_ROUNDS[d.round];
  // Who has each team in this round so far
  const takenBy = {};
  d.picks[d.round].forEach(p => {
    (takenBy[p.team] = takenBy[p.team] || []).push(d.names[p.o]);
  });
  return round.teams.map(t => {
    const owners = takenBy[t] || [];
    const need = round.shared ? 2 : 1;
    const done = owners.length >= need;
    return `
      <div class="pot-team${done ? ' taken' : ''}">
        <span class="pot-flag">${getFlag(t)}</span>
        <span class="pot-name">${esc(t)}</span>
        ${owners.length ? `<span class="pot-owners">${owners.map(esc).join(', ')}</span>` : ''}
      </div>`;
  }).join('');
}

function buildDrawSummaryHTML() {
  const d = S.draw;
  const cell = (team) => team
    ? `<span class="sum-team">${getFlag(team)} ${esc(shortName(team))} ${potBadge(team, true)}</span>`
    : '<span class="sum-empty">—</span>';

  const rows = d.names.map((nm, oi) => {
    const perRound = DRAW_ROUNDS.map((r, ri) => {
      const p = d.picks[ri].find(x => x.o === oi);
      return p ? p.team : '';
    });
    const total = perRound.filter(Boolean).length;
    const label = nm && nm.trim() ? esc(nm) : `Owner ${oi + 1}`;
    return `
      <tr>
        <td class="sum-owner">${label}</td>
        ${perRound.map(t => `<td>${cell(t)}</td>`).join('')}
        <td class="sum-total">${total}</td>
      </tr>`;
  }).join('');

  return `
    <table class="sum-table">
      <thead>
        <tr>
          <th>Owner</th>
          <th>Bottom</th><th>Pot 3</th><th>Pot 2</th><th>Pot 1</th><th>Top</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Refresh the live parts of the tab without rebuilding inputs / reveal area
function updateDrawStatus() {
  const d = S.draw;
  const info = document.getElementById('draw-roundinfo');
  const list = document.getElementById('draw-teamlist');
  const sum  = document.getElementById('draw-summary');
  const done = document.getElementById('draw-done');

  if (info) {
    if (d.complete) {
      info.innerHTML = `<span class="round-badge">✅ Draw complete</span>`;
    } else {
      const r = DRAW_ROUNDS[d.round];
      const n = d.picks[d.round].length;
      info.innerHTML =
        `<span class="round-badge">${esc(r.name)}</span>
         <span class="round-prog">${n} / ${NUM_OWNERS} owners drawn</span>`;
    }
  }
  if (list) list.innerHTML = buildTeamListHTML();
  if (sum)  sum.innerHTML  = buildDrawSummaryHTML();
  if (done) done.style.display = d.complete ? 'block' : 'none';

  // Disable draw buttons when finished
  ['btn-draw-next','btn-draw-round'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.disabled = d.complete;
  });
}

function renderAssignment() {
  const pane = document.getElementById('tab-assignment');
  if (!pane) return;

  pane.innerHTML = `
    <div class="assign-intro">
      <h2 class="assign-title">🎲 Sweepstake Draw</h2>
      <p class="assign-sub">Enter 12 owners, then draw teams round by round. Assignments flow straight into the Groups, Knockout and Sweepstake tabs.</p>
    </div>

    <div class="assign-grid">
      <div class="assign-card">
        <div class="assign-head">1 · Owners</div>
        <div class="owner-fields">${buildOwnerInputsHTML()}</div>
        <div class="assign-btn-row">
          <button id="btn-save-owners" class="btn btn-green btn-sm admin-only">💾 Save owners</button>
          <button id="btn-clear-assign" class="btn btn-danger btn-sm admin-only">🗑 Clear assignment</button>
        </div>
        <div id="owner-status" class="owner-status"></div>
      </div>

      <div class="assign-card">
        <div class="assign-head">2 · The Draw</div>
        <div id="draw-roundinfo" class="draw-roundinfo"></div>
        <div id="draw-reel" class="draw-reel"><span class="reel-name">Ready…</span></div>
        <div id="draw-reveal" class="draw-reveal"></div>
        <div class="assign-btn-row">
          <button id="btn-draw-next"  class="btn btn-gold btn-sm admin-only">🎯 Draw next owner</button>
          <button id="btn-draw-round" class="btn btn-green btn-sm admin-only">⚡ Draw full round</button>
          <button id="btn-skip-draw"  class="btn btn-outline btn-sm draw-skip admin-only">⏭ Skip</button>
          <button id="btn-reset-draw" class="btn btn-danger btn-sm admin-only">↺ Reset draw</button>
          <button id="btn-sound" class="btn btn-outline btn-sm">🔇 Sound off</button>
        </div>
        <div class="draw-teamlist-wrap">
          <div class="assign-subhead">Teams this round</div>
          <div id="draw-teamlist" class="draw-teamlist"></div>
        </div>
      </div>
    </div>

    <div id="draw-done" class="draw-done">🏆 Every owner has 5 teams — the draw is complete!</div>

    <div class="assign-card summary-card">
      <div class="assign-head">3 · Assignment Summary</div>
      <div id="draw-summary"></div>
    </div>`;

  // Owner name inputs
  for (let i = 0; i < NUM_OWNERS; i++) {
    document.getElementById(`own-${i}`)?.addEventListener('input', e => {
      S.draw.names[i] = e.target.value;
      save();
    });
  }

  // Buttons
  document.getElementById('btn-save-owners')?.addEventListener('click', () => {
    const filled = S.draw.names.filter(n => n && n.trim());
    const dupes = filled.length !== new Set(filled.map(n => n.trim().toLowerCase())).size;
    save();
    const status = document.getElementById('owner-status');
    if (status) {
      status.className = 'owner-status show' + (dupes ? ' warn' : '');
      status.textContent = dupes
        ? `⚠ Saved ${filled.length} — but some names are duplicates`
        : `✓ Saved ${filled.length} owner name${filled.length === 1 ? '' : 's'}`;
      clearTimeout(status._t);
      status._t = setTimeout(() => { status.className = 'owner-status'; }, 2600);
    }
  });
  document.getElementById('btn-clear-assign')?.addEventListener('click', clearAssignment);
  document.getElementById('btn-draw-next')?.addEventListener('click', drawNext);
  document.getElementById('btn-draw-round')?.addEventListener('click', drawFullRound);
  document.getElementById('btn-skip-draw')?.addEventListener('click', skipDraw);
  document.getElementById('btn-reset-draw')?.addEventListener('click', resetDraw);
  document.getElementById('btn-sound')?.addEventListener('click', toggleDrawSound);

  // Reflect saved sound preference on the toggle
  const sb = document.getElementById('btn-sound');
  if (sb) {
    sb.textContent = uiPrefs.sound ? '🔊 Sound on' : '🔇 Sound off';
    sb.classList.toggle('sound-on', !!uiPrefs.sound);
  }

  updateDrawStatus();
  applyAccessMode();
}

// ═══════════════════════════════════════════════════════════════════
// CLOUD SYNC + AUTH (Supabase)
// ═══════════════════════════════════════════════════════════════════

let sb = null;                 // Supabase client
let isAdmin = false;
let currentUser = null;
let pushTimer = null;
let lastAppliedTs = null;      // newest updated_at we have applied
let realtimeChannel = null;
let savedRevertTimer = null;

// ── Small UI helpers ──
function setSync(cls, text) {
  const pill = document.getElementById('sync-pill');
  if (!pill) return;
  pill.className = 'sync-pill sync-' + cls;
  pill.textContent = text;
}
function setUpdatedLabel(ts) {
  const el = document.getElementById('updated-label');
  if (!el || !ts) return;
  const d = new Date(ts);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toDateString() === d.toDateString();
  el.textContent = 'Updated ' + (today ? time : d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + time);
}
function idleSync() {
  if (!sb) { setSync('offline', 'Local only'); return; }
  if (!navigator.onLine) { setSync('offline', '⚠ Offline'); return; }
  setSync(isAdmin ? 'admin' : 'online', isAdmin ? '● Admin · live' : '● Live');
}

function renderAll() {
  renderGroups();
  renderKnockout();
  renderSweepstake();
  renderAssignment();
}

// ── View-only vs admin mode (UI only; real security is RLS) ──
function applyAccessMode() {
  const ro = !isAdmin;
  document.body.classList.toggle('view-only', ro);
  document.body.classList.toggle('admin-mode', isAdmin);
  // Editing inputs/selects inside the tabs are disabled for viewers
  document.querySelectorAll('main input, main select').forEach(el => { el.disabled = ro; });
  // Admin-only controls are hidden for viewers
  document.querySelectorAll('.admin-only').forEach(el => { el.hidden = ro; });
  // Admin-disable controls stay visible but inert for viewers
  document.querySelectorAll('.admin-disable').forEach(el => { el.disabled = ro; });
}

// ── Writing to the shared DB (admins only, debounced) ──
function scheduleCloudPush() {
  if (!sb || !isAdmin) return;     // viewers never write (also enforced by RLS)
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushCloud, 500);
}
async function pushCloud() {
  if (!sb || !isAdmin) return;
  if (!navigator.onLine) { setSync('offline', '⚠ Offline — not shared'); return; }
  setSync('saving', 'Saving…');
  const ts = new Date().toISOString();
  try {
    const { data, error } = await sb.from('tournament_state')
      .update({ state: S, updated_at: ts, updated_by: currentUser ? currentUser.id : null })
      .eq('id', 1).select().single();
    if (error) throw error;
    lastAppliedTs = data.updated_at;
    setUpdatedLabel(data.updated_at);
    setSync('saved', '✓ Saved');
    clearTimeout(savedRevertTimer);
    savedRevertTimer = setTimeout(idleSync, 1500);
  } catch (e) {
    setSync('error', '⚠ Save failed');
    console.warn('Cloud save failed:', e.message || e);
  }
}

// ── Applying a remote change ──
function applyRemoteState(row) {
  if (!row) return;
  const ts = row.updated_at;
  // Ignore our own write echo (JSONB reorders keys, so compare by author)
  if (isAdmin && currentUser && row.updated_by === currentUser.id) {
    lastAppliedTs = ts; setUpdatedLabel(ts); idleSync(); return;
  }
  if (lastAppliedTs && ts && ts <= lastAppliedTs) return; // stale
  lastAppliedTs = ts;
  S = normalizeState(row.state || {});
  try { localStorage.setItem('wc2026v2', JSON.stringify(S)); } catch (e) {}
  renderAll();
  setUpdatedLabel(ts);
  idleSync();
}

function subscribeRealtime() {
  if (!sb) return;
  if (realtimeChannel) sb.removeChannel(realtimeChannel);
  realtimeChannel = sb.channel('tournament_state_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'tournament_state', filter: 'id=eq.1' },
      payload => applyRemoteState(payload.new))
    .subscribe();
}

// ── Auth ──
async function refreshAdminStatus() {
  isAdmin = false; currentUser = null;
  if (!sb) { updateAdminUI(); return; }
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session && session.user) {
      currentUser = session.user;
      const { data, error } = await sb.from('app_admins')
        .select('user_id').eq('user_id', session.user.id).maybeSingle();
      isAdmin = !!data && !error;
    }
  } catch (e) { /* stay viewer */ }
  updateAdminUI();
}
function updateAdminUI() {
  const btn = document.getElementById('btn-admin');
  if (btn) btn.textContent = isAdmin ? '🔓 Sign out' : '🔑 Admin';
  const mb = document.getElementById('mode-badge');
  if (mb) {
    mb.textContent = isAdmin ? 'ADMIN' : 'VIEW ONLY';
    mb.className = 'mode-badge ' + (isAdmin ? 'mode-admin' : 'mode-view');
  }
  applyAccessMode();
  idleSync();
}
async function doSignIn(email, pass) {
  if (!sb) return { error: 'Not connected.' };
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) return { error: error.message };
  await refreshAdminStatus();
  if (!isAdmin) {
    await sb.auth.signOut();
    isAdmin = false; currentUser = null; updateAdminUI();
    return { error: 'Signed in, but this account is not an administrator.' };
  }
  return { ok: true };
}
async function doSignOut() {
  if (sb) { try { await sb.auth.signOut(); } catch (e) {} }
  isAdmin = false; currentUser = null;
  updateAdminUI();
  renderAll();             // refresh so any admin-only inputs reset cleanly
}

function initAuthUI() {
  const modal = document.getElementById('admin-modal');
  let lastFocused = null;
  const clearErr = () => { const e = document.getElementById('admin-error'); if (e) e.textContent = ''; };
  const isOpen = () => modal && modal.style.display !== 'none';
  const open = () => {
    if (!modal) return;
    lastFocused = document.activeElement;
    clearErr();
    modal.style.display = 'flex';
    document.getElementById('admin-email')?.focus();
  };
  // Closing never signs anyone in — the visitor stays in public view-only mode.
  const close = () => {
    if (!modal) return;
    modal.style.display = 'none';
    clearErr();
    if (lastFocused && lastFocused.focus) lastFocused.focus(); // restore focus to opener
  };

  document.getElementById('btn-admin')?.addEventListener('click', () => {
    if (isAdmin) doSignOut(); else open();
  });
  document.getElementById('admin-cancel')?.addEventListener('click', close);
  document.getElementById('admin-close')?.addEventListener('click', close);
  // Click on the darkened backdrop (but not inside the modal box) closes it
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });
  // Escape closes it
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });

  document.getElementById('admin-signin')?.addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value.trim();
    const pass  = document.getElementById('admin-pass').value;
    const errEl = document.getElementById('admin-error');
    errEl.textContent = 'Signing in…';
    const res = await doSignIn(email, pass);
    if (res.error) { errEl.textContent = res.error; return; }
    errEl.textContent = '';
    document.getElementById('admin-pass').value = '';
    close();
    maybeOfferMigrationOnSignin();
  });
  document.getElementById('admin-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('admin-signin').click();
  });
}

// ── One-time migration of this device's saved data into the shared DB ──
function migrationSummary(s) {
  const owners = new Set();
  Object.values(s.owners || {}).forEach(v => v && v.trim() && owners.add(v.trim()));
  Object.values(s.owners2 || {}).forEach(v => v && v.trim() && owners.add(v.trim()));
  const scores = Object.keys(s.scores || {}).filter(k => {
    const sc = s.scores[k]; return sc && sc.h !== '' && sc.a !== '';
  }).length;
  const drawDone = s.draw ? s.draw.picks.reduce((n, r) => n + r.length, 0) : 0;
  return `
    <ul class="migrate-list">
      <li><strong>${owners.size}</strong> owner name(s)</li>
      <li><strong>${scores}</strong> group match score(s)</li>
      <li><strong>${(s.awards || []).length}</strong> player award(s)</li>
      <li><strong>${drawDone}</strong> draw pick(s) completed</li>
    </ul>`;
}
function offerMigration(localCopy) {
  const modal = document.getElementById('migrate-modal');
  if (!modal) return;
  document.getElementById('migrate-preview').innerHTML = migrationSummary(localCopy);
  modal.style.display = 'flex';
  document.getElementById('migrate-import').onclick = async () => {
    modal.style.display = 'none';
    S = localCopy;
    renderAll(); applyAccessMode();
    await pushCloud();
    try { localStorage.removeItem('wc2026v2_backup'); } catch (e) {}
  };
  document.getElementById('migrate-skip').onclick = () => {
    modal.style.display = 'none';
    S = normalizeState({});
    renderAll(); applyAccessMode();
    idleSync();
    try { localStorage.removeItem('wc2026v2_backup'); } catch (e) {} // don't re-prompt
  };
}

// Offer migration when the admin signs in after the (blank) cloud already loaded
function maybeOfferMigrationOnSignin() {
  if (!isAdmin) return;
  const backup = loadBackupState();
  if (stateIsBlank(S) && backup && !stateIsBlank(backup)) offerMigration(backup);
}

// ── "Add to Home Screen" hint (phones only, dismissible, remembered) ──
function initA2HS() {
  const bar = document.getElementById('a2hs');
  if (!bar) return;

  const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                     window.navigator.standalone === true;          // already installed
  const isPhone = (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) &&
                  (('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
  if (standalone || !isPhone || uiPrefs.a2hsDismissed) return;

  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) ||
                (/Macintosh/.test(ua) && 'ontouchstart' in window);  // iPadOS reports as Mac
  const text = document.getElementById('a2hs-text');
  if (text) {
    text.textContent = isIOS
      ? 'Install: tap Share, then “Add to Home Screen”.'
      : 'Install: tap your browser menu ⋮, then “Add to Home Screen”.';
  }
  bar.style.display = 'flex';

  document.getElementById('a2hs-close')?.addEventListener('click', () => {
    bar.style.display = 'none';
    uiPrefs.a2hsDismissed = true;
    saveUiPrefs();
  });
}

// ── Boot overlay ──
function hideBootOverlay() { const o = document.getElementById('boot-overlay'); if (o) o.style.display = 'none'; }
function bootError(msg, retry) {
  const o = document.getElementById('boot-overlay');
  if (!o) return;
  o.style.display = 'flex';
  o.querySelector('.boot-spinner').style.display = 'none';
  document.getElementById('boot-msg').textContent = msg;
  const r = document.getElementById('boot-retry');
  if (r) { r.style.display = retry ? '' : 'none'; r.onclick = retry || null; }
}

// ═══════════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════════

async function boot() {
  // First paint from the local cache so nothing is blank
  renderAll();
  initTabs();
  initButtons();
  initAuthUI();
  applyAccessMode();
  initA2HS();

  if (!window.supabase || !window.WC_CONFIG || !WC_CONFIG.SUPABASE_URL) {
    setSync('offline', 'Local only');
    bootError('No shared-database connection configured. This device will work on its own.', null);
    setTimeout(hideBootOverlay, 1500);
    return;
  }

  try {
    sb = window.supabase.createClient(WC_CONFIG.SUPABASE_URL, WC_CONFIG.SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    setSync('error', '⚠ Error');
    bootError('Could not start the database client. Showing this device’s copy.', null);
    setTimeout(hideBootOverlay, 1500);
    return;
  }

  setSync('loading', 'Loading…');
  await refreshAdminStatus();

  try {
    const { data, error } = await sb.from('tournament_state').select('*').eq('id', 1).single();
    if (error) throw error;
    const cloud = normalizeState(data.state || {});
    lastAppliedTs = data.updated_at;
    setUpdatedLabel(data.updated_at);

    const backup = loadBackupState();
    if (stateIsBlank(cloud) && backup && !stateIsBlank(backup) && isAdmin) {
      // Shared DB is empty but this device has real data — let the admin import it
      hideBootOverlay();
      idleSync();
      offerMigration(backup);
    } else {
      S = cloud;
      try { localStorage.setItem('wc2026v2', JSON.stringify(S)); } catch (e) {}
      renderAll();
      applyAccessMode();
      hideBootOverlay();
      idleSync();
    }
  } catch (e) {
    console.warn('Load failed:', e.message || e);
    bootError('Could not load the shared data. Check your connection.', () => { location.reload(); });
    setSync('error', '⚠ Offline');
    return;
  }

  subscribeRealtime();
  if (sb) sb.auth.onAuthStateChange(() => refreshAdminStatus());
  window.addEventListener('online',  idleSync);
  window.addEventListener('offline', () => setSync('offline', '⚠ Offline'));
}

boot();
