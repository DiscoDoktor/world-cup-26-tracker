'use strict';
// Responsive layout assertions for the Sweepstake leaderboard on iPhone widths.
//
// Builds an OFFLINE harness from the real index.html + app.js + styles.css
// (seeded with the live state so the real leaderboard renders, with the real
// page padding), then loads it in headless Chromium at several iPhone widths
// and asserts, via in-page geometry measurement:
//   • document scrollWidth does not exceed the viewport width (no h-scroll)
//   • the table stays inside its container (.sw-table-section)
//   • the TOTAL header and EVERY total value are fully visible (not clipped)
//
// Run: node test/responsive-check.js
// Also writes leaderboard-mobile.png at 390px (gitignored data artifact).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'screenshot-harness.html');
const SHELL = path.join(process.env.HOME,
  'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const WIDTHS = [375, 390, 393, 430];

// ── Build the offline harness (real layout, real padding, real data) ──
function buildHarness() {
  const files = fs.readdirSync(path.join(ROOT, 'backups')).filter(f => f.endsWith('.json')).sort();
  if (!files.length) throw new Error('no backups/*.json to seed the harness');
  const backup = path.join(ROOT, 'backups', files[files.length - 1]);
  const state = JSON.parse(fs.readFileSync(backup, 'utf8'))[0].state;

  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // Remove Supabase CDN + config so the app boots offline and renders from localStorage.
  html = html.replace(/\s*<script src="https:\/\/cdn\.jsdelivr[^>]*><\/script>/, '');
  html = html.replace(/\s*<script src="config\.js"><\/script>/, '');

  // Seed state BEFORE app.js; hide overlays + the very tall updates/next sections
  // (they don't affect table width, only page height / render time).
  const inject = `
    <style>#boot-overlay,#a2hs,#sw-updates,#sw-next{display:none!important}</style>
    <script>localStorage.setItem('wc2026v2', ${JSON.stringify(JSON.stringify(state))});</script>`;
  html = html.replace(/(\s*<script src="app\.js"><\/script>)/, inject + '$1');

  // In-page geometry measurement → serialised between markers for extraction.
  const measure = `
    <script>
    function measure(){
      var out, vw=window.innerWidth, EPS=1;
      try{
        var de=document.documentElement;
        var docSW=Math.max(de.scrollWidth, document.body.scrollWidth);
        var table=document.querySelector('.sw-table');
        var section=table&&table.closest('.sw-table-section');
        var tr=table&&table.getBoundingClientRect();
        var sr=section&&section.getBoundingClientRect();
        var totalTh=document.querySelector('.sw-total-th');
        var totals=[].slice.call(document.querySelectorAll('.sw-total-cell'));
        function within(el){var r=el.getBoundingClientRect();return r.width>0 && r.right<=vw+EPS && r.left>=-EPS;}
        // Text not clipped = its content (scrollWidth) fits inside the cell box (clientWidth).
        function textFits(el){return el && el.scrollWidth<=el.clientWidth+1;}
        var firstBadTotal=null, totalsVisible=true, totalsTextFit=true, firstClippedVal=null;
        totals.forEach(function(td){
          if(!within(td)){ totalsVisible=false; if(firstBadTotal===null) firstBadTotal=td.textContent; }
          if(!textFits(td)){ totalsTextFit=false; if(firstClippedVal===null) firstClippedVal=td.textContent; }
        });
        out={
          vw:vw, docSW:docSW,
          noHScroll: docSW<=vw+EPS,
          tableInside: (tr&&sr)?(tr.right<=sr.right+EPS && tr.left>=sr.left-EPS):false,
          totalHeaderVisible: totalTh?within(totalTh):false,
          totalHeaderTextFits: textFits(totalTh),
          totalHeaderText: totalTh?totalTh.textContent.trim():null,
          totalHeaderScrollW: totalTh?totalTh.scrollWidth:null,
          totalHeaderClientW: totalTh?totalTh.clientWidth:null,
          totalValuesVisible: totalsVisible,
          totalValuesTextFit: totalsTextFit,
          firstClippedVal: firstClippedVal,
          totalCount: totals.length,
          firstBadTotal: firstBadTotal,
          tableRight: tr?Math.round(tr.right):null,
          sectionRight: sr?Math.round(sr.right):null
        };
      }catch(e){ out={error:String(e), vw:vw}; }
      // Write to <title> — it never participates in layout, so the instrument
      // cannot itself widen the page (a visible element holding the long JSON
      // string would). Markers assembled at runtime so the script's own source
      // (echoed by --dump-dom) doesn't match the extraction regex.
      document.title=('@@RE'+'SULT@@')+JSON.stringify(out)+('@@E'+'ND@@');
    }
    // Measure the SETTLED layout: re-run at several points (all within the
    // virtual-time budget) so the last write reflects the final, stable layout
    // rather than a load-instant reflow transient.
    window.addEventListener('load', function(){ [300,1000,2000,3500].forEach(function(d){ setTimeout(measure,d); }); });
    </script>`;
  html = html.replace('</body>', measure + '</body>');
  fs.writeFileSync(HARNESS, html);
}

function runAt(width) {
  const dom = execFileSync(SHELL, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${width},1600`, '--virtual-time-budget=6000',
    '--dump-dom', 'file://' + HARNESS
  ], { encoding: 'utf8', maxBuffer: 1e8 });
  const m = dom.match(/@@RESULT@@([\s\S]*?)@@END@@/);
  if (!m) throw new Error(`no measurement result at ${width}px`);
  return JSON.parse(m[1]);
}

function screenshot(width) {
  execFileSync(SHELL, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=2', `--window-size=${width},1600`,
    '--virtual-time-budget=6000',
    `--screenshot=${path.join(ROOT, 'leaderboard-mobile.png')}`, 'file://' + HARNESS
  ], { encoding: 'utf8', maxBuffer: 1e8 });
}

// ── Run ──
buildHarness();
let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('    ✓ ' + name);
  else { failures++; console.log('    ✗ ' + name + (detail ? '  →  ' + detail : '')); }
}

WIDTHS.forEach(w => {
  const r = runAt(w);
  console.log(`\n@ ${w}px  (innerWidth=${r.vw}, docScrollWidth=${r.docSW}, totals=${r.totalCount}, table.right=${r.tableRight}, section.right=${r.sectionRight})`);
  if (r.error) { check('measurement succeeded', false, r.error); return; }
  check('no horizontal scroll (docScrollWidth <= viewport)', r.noHScroll, `docSW ${r.docSW} > vw ${r.vw}`);
  check('table stays inside its container', r.tableInside, `table.right ${r.tableRight} > section.right ${r.sectionRight}`);
  check(`TOTAL header within viewport ("${r.totalHeaderText}")`, r.totalHeaderVisible);
  check(`TOTAL header text not clipped (scrollW ${r.totalHeaderScrollW} <= clientW ${r.totalHeaderClientW})`, r.totalHeaderTextFits);
  check(`TOTAL header reads the full word "Total"`, r.totalHeaderText === 'Total', `got "${r.totalHeaderText}"`);
  check(`every total value fully visible (${r.totalCount} rows)`, r.totalValuesVisible, `first clipped total: "${r.firstBadTotal}"`);
  check('every total value text not clipped', r.totalValuesTextFit, `first clipped: "${r.firstClippedVal}"`);
});

screenshot(390);
console.log('\nWrote leaderboard-mobile.png @ 390px');
// Tidy the harness (contains embedded live data; never committed).
try { fs.unlinkSync(HARNESS); } catch (e) {}

console.log('\n' + (failures === 0 ? 'ALL RESPONSIVE CHECKS PASSED ✓' : `${failures} CHECK(S) FAILED ✗`));
process.exit(failures === 0 ? 0 : 1);
