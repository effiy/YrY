// Integration test: simulate the page's script load order and
// confirm the public API surface is unchanged after the lib split.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadOrder(order) {
  // Fresh context = fresh window.
  const sandbox = { window: {}, console: console, setTimeout, setInterval, clearTimeout, clearInterval };
  vm.createContext(sandbox);
  for (const file of order) {
    const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
  }
  return sandbox.window;
}

// 1. lib/planToMarkdown.js alone
const w1 = loadOrder(['lib/planToMarkdown.js']);
if (!w1.dailyPlanToMarkdown) { console.error('FAIL: lib alone missing dailyPlanToMarkdown'); process.exit(1); }
console.log('PASS lib alone exposes dailyPlanToMarkdown');

// 2. Full load order (data.js + lib + index.js)
const w2 = loadOrder(['data.js', 'lib/planToMarkdown.js', 'index.js']);
if (typeof w2.planToMarkdown !== 'function') { console.error('FAIL: full load missing planToMarkdown'); process.exit(1); }
if (typeof w2.planHelpers !== 'object') { console.error('FAIL: full load missing planHelpers'); process.exit(1); }
console.log('PASS full load exposes planToMarkdown + planHelpers');

// 3. Verify same input -> same output (round-trip through full load)
const sample = {
  meta: { project: 'RoundTrip', date: '2026-07-18', horizon: 'rolling', timestamp: '2026-07-18T00:00:00Z' },
  tiers: { '30d': true, '90d': true, 'long': true },
  context: { paragraph: 'p', lastCommit: 'a', activeBranches: 'main', todoCount: 1, testRatio: 0.5, medianCommits: 2 },
  assumptions: { open: 0, validated: 0, invalidated: 0, rows: [] },
  decisions: { made: 0, superseded: 0, reversed: 0, rows: [] },
  tier30d: { milestones: [], workItems: [] },
  tier90d: { themes: [], epics: [] },
  tierLong: { bets: [], shifts: [], northStars: [] },
  traceability: [],
  capacity: { available: 0, demand: 0, committers: 0, workingDays: 0, focus: 0, workDemand: 0, meetingDemand: 0, oncallDemand: 0, bufferDemand: 0, verdictUpper: '-', deltaLabel: '-', breakdown: [], suggestedCuts: [] },
  risks: { rows: [] },
  team: { roster: [], alloc30d: [], alloc90d: [] },
  review: { author: '', peer: '', peerDate: '', stakeholder: '', stakeholderDate: '', nextDate: '', date: '' },
};
const a = w2.dailyPlanToMarkdown.planToMarkdown(sample);
const b = w2.planToMarkdown(sample);
if (a !== b) { console.error('FAIL: window.planToMarkdown diverges from window.dailyPlanToMarkdown.planToMarkdown'); process.exit(1); }
console.log('PASS window.planToMarkdown === window.dailyPlanToMarkdown.planToMarkdown');

// 4. planHelpers surface intact
const wantHelpers = ['dash', 'sizeTag', 'riskTag', 'statusTag', 'reversibilityTag', 'tierBadge', 'rollupCell', 'inferredTag', 'merge'];
for (const h of wantHelpers) {
  if (typeof w2.planHelpers[h] !== 'function') {
    console.error(`FAIL: planHelpers.${h} missing`);
    process.exit(1);
  }
}
console.log(`PASS planHelpers exposes all ${wantHelpers.length} functions`);

// 5. index.js alone (without lib) MUST throw — this is the defensive guard.
let threw = false;
try {
  loadOrder(['index.js']);
} catch (e) {
  threw = true;
  if (!/lib\/planToMarkdown\.js/.test(e.message)) {
    console.error('FAIL: error message does not mention lib/planToMarkdown.js: ' + e.message);
    process.exit(1);
  }
}
if (!threw) { console.error('FAIL: index.js should throw when lib is missing'); process.exit(1); }
console.log('PASS index.js throws when lib is missing');

console.log('\nALL OK');
