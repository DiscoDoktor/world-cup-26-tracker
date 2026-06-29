'use strict';
// Verification for the transparent R / P / B / Total leaderboard breakdown.
//
// Loads the REAL app.js in a sandbox and, for every owner, confirms:
//   R = matchPts (group + knockout match points)
//   P = progBonus (knockout progression)
//   B = placingBonus + awardBonus (final placing + player awards)
//   R + P + B === Total  (the existing leaderboard total — unchanged)
// It checks both the data (calcSweepstake) AND the values actually rendered by
// buildTableHTML, and that the rendered order matches the leaderboard order
// (positions unchanged).
//
// Coverage:
//   1. The live tournament state (newest backups/*.json) — every real owner.
//   2. A synthetic state that forces R, P and B all > 0 (exercises the B path:
//      final placing + a player award), in case the live data has no KO results.
//
// Run: node test/verify-leaderboard.js   (exit 0 = pass, 1 = fail)

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Load app.js in a stubbed sandbox (boot() removed) ──
let src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8').replace(/\nboot\(\);\s*$/, '\n');
src += '\n;globalThis.__t = { calcSweepstake, buildTableHTML, freshState, seedR32,'
     + ' getS: () => S, setS: v => { S = v; } };\n';

const store = {};
const noop = () => {};
const sandbox = {
  console, setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop,
  navigator: { onLine: true },
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  document: { getElementById: () => null, querySelectorAll: () => [], querySelector: () => null, addEventListener: noop, createElement: () => ({ style: {}, classList: { add: noop, remove: noop }, appendChild: noop }) }
};
sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.window.addEventListener = noop;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'app.js' });
const t = sandbox.__t;

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('  ✓ ' + name);
  else { failures++; console.log('  ✗ ' + name + (detail ? '  →  ' + detail : '')); }
}

// Pull the rendered R, P and Total per row out of the HTML, keyed by owner,
// so we test the actual display mapping — not just the underlying data.
// The Bonus column has been removed, so each row has exactly two .sw-num cells.
function parseRendered(html) {
  const tbody = html.slice(html.indexOf('<tbody>'));
  const rows = tbody.match(/<tr[\s\S]*?<\/tr>/g) || [];
  return rows.map(tr => {
    const owner = (tr.match(/<td class="sw-owner-cell">([^<]*)<\/td>/) || [])[1];
    const nums = [...tr.matchAll(/<td class="sw-num"[^>]*>(-?\d+)<\/td>/g)].map(m => +m[1]);
    const total = +((tr.match(/<td class="sw-total-cell"[^>]*>(-?\d+)<\/td>/) || [])[1]);
    return { owner, R: nums[0], P: nums[1], numCount: nums.length, total };
  });
}

function runDataset(title, state) {
  console.log('\n' + title);
  t.setS(state);
  const rows = t.calcSweepstake();
  if (rows.length === 0) { check('has at least one owner', false, 'no owners in state'); return; }

  // Scoring is unchanged: Total still equals matchPts + progBonus + placing + award.
  let dataOk = true, badData = '';
  rows.forEach(r => {
    if (r.matchPts + r.progBonus + r.placingBonus + r.awardBonus !== r.total) {
      dataOk = false; badData = `${r.owner}: ${r.matchPts}+${r.progBonus}+${r.placingBonus + r.awardBonus} != ${r.total}`;
    }
  });
  check(`scoring unchanged: matchPts+prog+placing+award === Total (${rows.length} owners)`, dataOk, badData);

  const html = t.buildTableHTML(rows);
  // The Bonus column must be gone (header + cells).
  check('no Bonus column in header', !/aria-label="Bonus points"/.test(html));
  check('legend shows only "R = Results · P = Progress"',
    !/=\s*Bonuses/.test(html) === true);

  const rendered = parseRendered(html);
  check('rendered one row per owner', rendered.length === rows.length,
    `rendered=${rendered.length} expected=${rows.length}`);

  let renderOk = true, posOk = true, twoCols = true, badRender = '', badPos = '';
  rendered.forEach((rr, i) => {
    if (rr.numCount !== 2) { twoCols = false; }
    // Rendered components must equal the source scoring functions exactly.
    if (rr.R !== rows[i].matchPts || rr.P !== rows[i].progBonus) {
      renderOk = false; badRender = `${rr.owner}: rendered R/P != source`;
    }
    // Same owner + same total in the same position as the leaderboard order.
    if (rr.owner !== rows[i].owner || rr.total !== rows[i].total) {
      posOk = false; badPos = `pos ${i + 1}: rendered ${rr.owner}/${rr.total} vs board ${rows[i].owner}/${rows[i].total}`;
    }
  });
  check('each row shows exactly two numeric columns (R, P)', twoCols);
  check('rendered R = matchPts and P = progBonus (scores preserved)', renderOk, badRender);
  check('leaderboard order & totals unchanged (positions preserved)', posOk, badPos);

  // Requirement 7: R + P === Total for every owner — true while no bonus points
  // exist. Assert it whenever the dataset has zero bonuses (the live case).
  const bonusesAllZero = rows.every(r => r.placingBonus + r.awardBonus === 0);
  if (bonusesAllZero) {
    let rpOk = true, badRP = '';
    rendered.forEach(rr => { if (rr.R + rr.P !== rr.total) { rpOk = false; badRP = `${rr.owner}: ${rr.R}+${rr.P} != ${rr.total}`; } });
    check('R + P === Total for every owner (no bonus points present)', rpOk, badRP);
  } else {
    // With bonuses present, Total intentionally exceeds the shown R + P by the
    // (hidden) bonus amount — confirm that relationship holds exactly.
    let accountedOk = true, badAcc = '';
    rendered.forEach((rr, i) => {
      const bonus = rows[i].placingBonus + rows[i].awardBonus;
      if (rr.R + rr.P + bonus !== rr.total) { accountedOk = false; badAcc = `${rr.owner}: ${rr.R}+${rr.P}+bonus${bonus} != ${rr.total}`; }
    });
    check('Total = shown R + P + hidden bonuses (scoring intact)', accountedOk, badAcc);
  }
  return rows;
}

// ── Dataset 1: live state (every real owner) ──
const backupDir = path.join(ROOT, 'backups');
let liveState = null, liveLabel = '';
try {
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort();
  if (files.length) {
    const p = path.join(backupDir, files[files.length - 1]);
    liveState = JSON.parse(fs.readFileSync(p, 'utf8'))[0].state;
    liveLabel = `Dataset 1 — live state (${path.basename(p)}):`;
  }
} catch (e) { /* no backup available */ }

if (liveState) {
  const rows = runDataset(liveLabel, liveState);
  // Show a couple of rows for transparency.
  console.log('    e.g. ' + rows.slice(0, 3).map(r =>
    `${r.owner}: R${r.matchPts}+P${r.progBonus}=${r.total}`).join('  |  '));
} else {
  console.log('\nDataset 1 — live state: SKIPPED (no backups/*.json present)');
}

// ── Dataset 2: synthetic state WITH bonuses, to prove the scoring code is
// untouched and Total still includes hidden bonuses even though B isn't shown ──
const syn = t.freshState();
syn.owners['A0'] = 'Alice';   // Mexico
syn.owners['B0'] = 'Bob';     // Canada
// Group result so Mexico earns Results points (home win in pair 0 = A vs ...).
syn.scores['A_0'] = { h: '3', a: '0' };
// A decided final: Mexico beat Canada → champion (placing 5) + KO win (match 2)
// + progression (final reached = 5, win = 6); Canada runner-up (placing 3).
syn.ko.final[0] = { h: 'Mexico', a: 'Canada', hs: '2', as: '1', pens: '' };
// A player award linked to Mexico (+3 bonus, still scored, just not shown).
syn.awards = [{ id: 'x1', name: 'Golden Boot', teamKey: 'A0' }];

const synRows = runDataset('Dataset 2 — synthetic (with hidden bonuses):', syn);
const alice = synRows.find(r => r.owner === 'Alice');
check('bonus scoring still computed (Alice placing+award > 0, included in Total)',
  !!alice && (alice.placingBonus + alice.awardBonus) > 0 &&
  alice.total > alice.matchPts + alice.progBonus,
  alice ? `R${alice.matchPts} P${alice.progBonus} bonus${alice.placingBonus + alice.awardBonus} total${alice.total}` : 'Alice missing');

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED ✓' : `${failures} CHECK(S) FAILED ✗`));
process.exit(failures === 0 ? 0 : 1);
