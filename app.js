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

const R32_SLOTS = [
  ['1A','2B'], ['1B','2A'], ['1C','2D'], ['1D','2C'],
  ['1E','2F'], ['1F','2E'], ['1G','2H'], ['1H','2G'],
  ['1I','2J'], ['1J','2I'], ['1K','2L'], ['1L','2K'],
  ['3rd-1','3rd-2'], ['3rd-3','3rd-4'],
  ['3rd-5','3rd-6'], ['3rd-7','3rd-8']
];

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

// National flag emoji for every team
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

// Official fixture schedule — home/away are team indices (0–3) within each group
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

// Sample scores — keyed by MATCH_PAIRS index (pair-canonical, not fixture order)
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

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getFlag(name) { return FLAGS[name] ?? ''; }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) {
  const p = d.split('-');
  return `${parseInt(p[2])} ${MONTHS[parseInt(p[1]) - 1]}`;
}

// Find pair index for a fixture, and whether the home team is in the 'away' slot of that pair.
// Scores are always stored by pair (h = first in pair, a = second in pair).
// When flipped, we swap which score input maps to h vs a.
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

function freshState() {
  return { teams: { ...REAL_TEAMS }, scores: {}, ko: makeKO(), owners: {} };
}

let S;
(function initState() {
  try {
    const raw = localStorage.getItem('wc2026v2');
    S = raw ? JSON.parse(raw) : freshState();
    if (!S.ko)     S.ko     = makeKO(); // migrate old saves
    if (!S.owners) S.owners = {};
  } catch(e) {
    S = freshState();
  }
})();

function save() {
  try { localStorage.setItem('wc2026v2', JSON.stringify(S)); } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════════
// STANDINGS CALCULATION
// ═══════════════════════════════════════════════════════════════════

function calcStandings(g) {
  const rows = [0,1,2,3].map(i => ({
    key: `${g}${i}`,
    name: S.teams[`${g}${i}`] || REAL_TEAMS[`${g}${i}`] || `Team ${g}${i+1}`,
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

function populateR32() {
  R32_SLOTS.forEach(([h, a], i) => { S.ko.r32[i].h = h; S.ko.r32[i].a = a; });
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
  save();
  renderKnockout();
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
  const names  = [0,1,2,3].map(i => S.teams[`${g}${i}`]  || REAL_TEAMS[`${g}${i}`] || `Team ${g}${i+1}`);
  const owners = [0,1,2,3].map(i => S.owners[`${g}${i}`] || '');

  const teamSlots = names.map((n, i) => `
    <div class="team-slot">
      <span class="slot-num">${i+1}</span>
      <span class="slot-flag" id="sf-${g}-${i}">${getFlag(n)}</span>
      <input id="ti-${g}-${i}" class="team-name-input"
             type="text" value="${esc(n)}" maxlength="24" placeholder="Team ${g}${i+1}">
      <input id="ow-${g}-${i}" class="owner-input"
             type="text" value="${esc(owners[i])}" maxlength="30" placeholder="Owner">
    </div>`).join('');

  const matchBlocks = FIXTURES[g].map((fx, fIdx) => {
    const { pairIdx, flipped } = fixtureInfo(fx.home, fx.away);
    const sc = S.scores[`${g}_${pairIdx}`] || { h:'', a:'' };
    // When flipped, the home team's score is stored in sc.a (not sc.h)
    const homeScore = flipped ? sc.a : sc.h;
    const awayScore = flipped ? sc.h : sc.a;
    const hn = names[fx.home], an = names[fx.away];
    const hf = getFlag(hn),    af = getFlag(an);

    return `
      <div class="match-block">
        <div class="match-date">${fmtDate(fx.date)} · ${fx.time}</div>
        <div class="match-row">
          <span class="match-team" id="ml-${g}-${fIdx}-h">
            <span class="mf">${hf}</span><span class="mn">${esc(hn)}</span>
          </span>
          <div class="score-wrap">
            <input class="score-input" id="sih-${g}-${fIdx}"
                   type="number" min="0" max="99" value="${esc(homeScore)}">
            <span class="score-sep">–</span>
            <input class="score-input" id="sia-${g}-${fIdx}"
                   type="number" min="0" max="99" value="${esc(awayScore)}">
          </div>
          <span class="match-team right" id="ml-${g}-${fIdx}-a">
            <span class="mf">${af}</span><span class="mn">${esc(an)}</span>
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
    // ── Team name inputs ──────────────────────────────
    for (let i = 0; i < 4; i++) {
      document.getElementById(`ti-${g}-${i}`)?.addEventListener('input', e => {
        const val = e.target.value;
        S.teams[`${g}${i}`] = val;
        save();

        // Update flag in team slot without losing input focus
        const sf = document.getElementById(`sf-${g}-${i}`);
        if (sf) sf.textContent = getFlag(val);

        // Update match row labels where this team appears
        FIXTURES[g].forEach((fx, fIdx) => {
          const flag = getFlag(val);
          const text = esc(val || REAL_TEAMS[`${g}${i}`] || `Team ${g}${i+1}`);
          if (fx.home === i) {
            const el = document.getElementById(`ml-${g}-${fIdx}-h`);
            if (el) el.innerHTML = `<span class="mf">${flag}</span><span class="mn">${text}</span>`;
          }
          if (fx.away === i) {
            const el = document.getElementById(`ml-${g}-${fIdx}-a`);
            if (el) el.innerHTML = `<span class="mf">${flag}</span><span class="mn">${text}</span>`;
          }
        });

        // Update standings table
        const st = document.getElementById(`st-${g}`);
        if (st) st.innerHTML = standingsHTML(g);
      });

      // ── Owner inputs ──────────────────────────────
      document.getElementById(`ow-${g}-${i}`)?.addEventListener('input', e => {
        S.owners[`${g}${i}`] = e.target.value;
        save();
      });
    }

    // ── Score inputs (fixture-indexed, pair-aware) ──
    FIXTURES[g].forEach((fx, fIdx) => {
      const { pairIdx, flipped } = fixtureInfo(fx.home, fx.away);

      const bindScore = (side) => {
        const el = document.getElementById(`si${side}-${g}-${fIdx}`);
        if (!el) return;
        el.addEventListener('input', e => {
          if (!S.scores[`${g}_${pairIdx}`]) S.scores[`${g}_${pairIdx}`] = { h:'', a:'' };
          // 'h' input = home team display = pair's 'h' if not flipped, pair's 'a' if flipped
          const pairSide = (side === 'h') ? (flipped ? 'a' : 'h') : (flipped ? 'h' : 'a');
          S.scores[`${g}_${pairIdx}`][pairSide] = e.target.value;
          save();
          const st = document.getElementById(`st-${g}`);
          if (st) st.innerHTML = standingsHTML(g);
        });
      };

      bindScore('h');
      bindScore('a');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// HTML GENERATORS — KNOCKOUT
// ═══════════════════════════════════════════════════════════════════

function koCardHTML(round, idx) {
  const m = S.ko[round][idx];
  const winner = koWinner(m);
  const isFinal = round === 'final';
  const isTp    = round === 'tp';

  // Slot labels like "1A", "3rd-2" have no flag yet
  const isSlot = (s) => !s || /^[12][A-L]$/.test(s) || /^3rd/.test(s);
  const hSlot = isSlot(m.h), aSlot = isSlot(m.a);
  const hFlag = hSlot ? '' : getFlag(m.h);
  const aFlag = aSlot ? '' : getFlag(m.a);

  const hClass = hSlot ? 'ko-name empty' : winner === m.h ? 'ko-name winner-name' : 'ko-name';
  const aClass = aSlot ? 'ko-name empty' : winner === m.a ? 'ko-name winner-name' : 'ko-name';

  const label = isFinal ? '🏆 Final' : isTp ? '🥉 Third Place' :
    round === 'r32' ? `R32 · M${idx+1}` :
    round === 'r16' ? `R16 · M${idx+1}` :
    round === 'qf'  ? `QF · M${idx+1}`  : `SF · M${idx+1}`;

  const showPens = !!(m.hs !== '' && m.as !== '' &&
    !isNaN(parseInt(m.hs)) && !isNaN(parseInt(m.as)) &&
    parseInt(m.hs) === parseInt(m.as));

  const pensHTML = showPens ? `
    <div class="pens-strip">
      <span>Pens:</span>
      <button class="pens-pick${m.pens==='h'?' chosen':''}"
              data-r="${round}" data-i="${idx}" data-p="h">${esc(m.h||'—')}</button>
      <button class="pens-pick${m.pens==='a'?' chosen':''}"
              data-r="${round}" data-i="${idx}" data-p="a">${esc(m.a||'—')}</button>
    </div>` : '';

  const flagSpan = (flag) => flag ? `<span class="kf">${flag}</span>` : '';

  return `
    <div class="ko-card${isFinal?' final-card':''}" id="kc-${round}-${idx}">
      <div class="ko-card-head">
        <span>${label}</span>
        ${winner ? `<span class="ko-winner-label">→ ${getFlag(winner)} ${esc(winner)}</span>` : ''}
      </div>
      <div class="ko-card-body">
        <div class="ko-row">
          <span class="${hClass}">${flagSpan(hFlag)}${esc(m.h||'TBD')}</span>
          <input class="ko-score" id="ks-${round}-${idx}-h" type="number" min="0" max="99" value="${esc(m.hs)}">
        </div>
        <div class="ko-row">
          <span class="${aClass}">${flagSpan(aFlag)}${esc(m.a||'TBD')}</span>
          <input class="ko-score" id="ks-${round}-${idx}-a" type="number" min="0" max="99" value="${esc(m.as)}">
        </div>
        ${pensHTML}
      </div>
    </div>`;
}

function renderKnockout() {
  const pane = document.getElementById('tab-knockout');
  const finalWinner = koWinner(S.ko.final[0]);

  let roundsHTML = '';
  ROUND_ORDER.forEach(round => {
    const meta = ROUND_META[round];
    const cards = Array.from({ length: meta.size }, (_, i) => koCardHTML(round, i)).join('');
    const gridClass = meta.size >= 8 ? 'ko-grid' : meta.size >= 2 ? 'ko-grid small' : 'ko-grid one';
    roundsHTML += `
      <div class="round-section">
        <div class="round-title">${meta.label}</div>
        <div class="${gridClass}">${cards}</div>
      </div>`;
  });

  const championHTML = finalWinner ? `
    <div class="champion-banner">
      <div class="trophy">${getFlag(finalWinner)}</div>
      <h2>${esc(finalWinner)}</h2>
      <p>World Cup 2026 Champions 🏆</p>
    </div>` : '';

  pane.innerHTML = `
    <div class="top-bar">
      <button class="btn btn-green btn-sm" id="btn-populate">
        ⚡ Auto-fill R32 from Group Results
      </button>
    </div>
    ${roundsHTML}
    ${championHTML}`;

  // Score inputs — update state on input, re-render on change
  ROUND_ORDER.forEach(round => {
    Array.from({ length: ROUND_META[round].size }, (_, idx) => {
      ['h','a'].forEach(side => {
        const el = document.getElementById(`ks-${round}-${idx}-${side}`);
        if (!el) return;
        el.addEventListener('input', e => {
          S.ko[round][idx][side === 'h' ? 'hs' : 'as'] = e.target.value;
          S.ko[round][idx].pens = '';
          save();
        });
        el.addEventListener('change', () => {
          advanceAll();
          save();
          renderKnockout();
        });
      });
    });
  });

  // Pens buttons
  pane.querySelectorAll('.pens-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.dataset.r, i = parseInt(btn.dataset.i), p = btn.dataset.p;
      S.ko[r][i].pens = p;
      advanceAll();
      save();
      renderKnockout();
    });
  });

  document.getElementById('btn-populate')?.addEventListener('click', populateR32);
}

// ═══════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL BUTTONS
// ═══════════════════════════════════════════════════════════════════

function initButtons() {
  document.getElementById('btn-print').addEventListener('click', () => {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('active'));
    window.print();
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    if (activeTab) document.getElementById(`tab-${activeTab}`).classList.add('active');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset all scores and knockout bracket?\nThis cannot be undone.')) return;
    const hadOwners = Object.values(S.owners).some(v => v && v.trim());
    S.scores = {};
    S.ko     = makeKO();
    if (hadOwners && confirm('Also reset owner names?')) {
      S.owners = {};
    }
    save();
    renderGroups();
    renderKnockout();
  });

  document.getElementById('btn-sample').addEventListener('click', () => {
    if (Object.keys(S.scores).length > 0) {
      if (!confirm('Load sample data? Your current scores will be overwritten.')) return;
    }
    S.teams  = { ...SAMPLE_TEAMS };
    S.scores = { ...SAMPLE_SCORES };
    S.ko     = makeKO();
    save();
    renderGroups();
    renderKnockout();
    if (confirm('Sample data loaded! Auto-fill Round of 32 from group results?')) {
      populateR32();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════════

renderGroups();
renderKnockout();
initTabs();
initButtons();
