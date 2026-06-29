'use strict';
// Verification for the Round of 32 repair.
//
// Loads the REAL app.js in a sandbox (with the auto-run boot() removed and the
// browser globals stubbed), then exercises the actual seedR32() and confirms:
//   1. Matches 73–88 resolve to EXACTLY the official confirmed line-up.
//   2. All 32 participants are distinct.
//   3. Re-seeding preserves existing knockout scores / penalties (only h/a change).
//   4. Seeding is idempotent.
//
// Run: node test/verify-r32.js   (exit 0 = pass, 1 = fail)

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const APP = path.join(__dirname, '..', 'app.js');

// Independent specification of the expected output, written with the project's
// canonical display names (not the R32_OFFICIAL keys) so a mistyped key is
// caught. Source list (user-supplied), mapped to internal team names:
//   USA -> United States, Bosnia and Herzegovina -> Bosnia-Herzegovina,
//   Cabo Verde -> Cape Verde, Congo DR -> Congo DR.
const EXPECTED = [
  ['South Africa', 'Canada'],            // 73
  ['Germany', 'Paraguay'],               // 74
  ['Netherlands', 'Morocco'],            // 75
  ['Brazil', 'Japan'],                   // 76
  ['France', 'Sweden'],                  // 77
  ['Ivory Coast', 'Norway'],             // 78
  ['Mexico', 'Ecuador'],                 // 79
  ['England', 'Congo DR'],               // 80
  ['United States', 'Bosnia-Herzegovina'], // 81
  ['Belgium', 'Senegal'],                // 82
  ['Portugal', 'Croatia'],               // 83
  ['Spain', 'Austria'],                  // 84
  ['Switzerland', 'Algeria'],            // 85
  ['Argentina', 'Cape Verde'],           // 86
  ['Colombia', 'Ghana'],                 // 87
  ['Australia', 'Egypt']                 // 88
];

// ── Load app.js in a stubbed sandbox ──
let src = fs.readFileSync(APP, 'utf8');
src = src.replace(/\nboot\(\);\s*$/, '\n'); // don't auto-run the browser bootstrap
// Expose the internals we need to drive (const/let/function live in this scope).
src += '\n;globalThis.__t = { R32_OFFICIAL, REAL_TEAMS, seedR32, freshState, teamName,'
     + ' getS: () => S, setS: v => { S = v; } };\n';

const store = {};
const noop = () => {};
const localStorageStub = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
const documentStub = {
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: noop,
  createElement: () => ({ style: {}, classList: { add: noop, remove: noop }, appendChild: noop })
};
const sandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: noop,
  setInterval: () => 0,
  clearInterval: noop,
  navigator: { onLine: true },
  localStorage: localStorageStub,
  document: documentStub
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.window.addEventListener = noop;
sandbox.window.WC_CONFIG = undefined;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'app.js' });

const t = sandbox.__t;

// ── Assertions ──
let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log('  ✓ ' + name); }
  else { failures++; console.log('  ✗ ' + name + (detail ? '  →  ' + detail : '')); }
}

// Test 1 + 4: seed a fresh state, then seed it AGAIN, comparing both to EXPECTED.
console.log('R32 official line-up (matches 73–88):');
t.setS(t.freshState());
t.seedR32();
const first = t.getS().ko.r32.map(m => [m.h, m.a]);

EXPECTED.forEach((exp, i) => {
  const got = first[i];
  check(
    `M${73 + i}: ${exp[0]} v ${exp[1]}`,
    got[0] === exp[0] && got[1] === exp[1],
    `got "${got[0]}" v "${got[1]}"`
  );
});

// Test 2: all 32 participants distinct.
const participants = first.flat();
const distinct = new Set(participants);
check('all 32 participants are distinct', distinct.size === 32,
  `distinct=${distinct.size}`);

// Test 3: existing scores / pens survive a repopulation.
console.log('\nScore preservation on repopulation:');
const S = t.getS();
// Stamp some pretend knockout results onto the freshly-seeded R32.
S.ko.r32[0].hs = '2'; S.ko.r32[0].as = '1';                 // M73 decided
S.ko.r32[4].hs = '1'; S.ko.r32[4].as = '1'; S.ko.r32[4].pens = 'h'; // M77 pens
S.ko.r32[12].hs = '0'; S.ko.r32[12].as = '3';               // M85 decided
const before = JSON.parse(JSON.stringify(S.ko.r32));
t.seedR32(); // press "Auto-fill R32" again
const after = t.getS().ko.r32;

check('M73 score preserved (2-1)', after[0].hs === '2' && after[0].as === '1');
check('M77 score + pens preserved (1-1 pens h)',
  after[4].hs === '1' && after[4].as === '1' && after[4].pens === 'h');
check('M85 score preserved (0-3)', after[12].hs === '0' && after[12].as === '3');

// Test 4: idempotent — h/a identical after a second seed, and EXACTLY h/a were
// the only fields that could have been (re)written; hs/as/pens unchanged everywhere.
let scoresUnchanged = true;
for (let i = 0; i < 16; i++) {
  if (after[i].hs !== before[i].hs || after[i].as !== before[i].as || after[i].pens !== before[i].pens) {
    scoresUnchanged = false;
  }
  if (after[i].h !== first[i][0] || after[i].a !== first[i][1]) scoresUnchanged = false;
}
check('re-seed is idempotent and leaves hs/as/pens untouched', scoresUnchanged);

console.log('\n' + (failures === 0
  ? 'ALL CHECKS PASSED ✓'
  : `${failures} CHECK(S) FAILED ✗`));
process.exit(failures === 0 ? 0 : 1);
