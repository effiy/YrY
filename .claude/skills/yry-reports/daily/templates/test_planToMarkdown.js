// Smoke test for lib/planToMarkdown.js.
// Loads the file as a regular browser script (no ES modules), then
// exercises every exposed function against a minimal data shape.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Simulate the browser's window object.
const sandbox = { window: {} };
vm.createContext(sandbox);

const code = fs.readFileSync(
  path.join(__dirname, 'lib/planToMarkdown.js'),
  'utf8',
);
vm.runInContext(code, sandbox);

const api = sandbox.window.dailyPlanToMarkdown;
if (!api) {
  console.error('FAIL: window.dailyPlanToMarkdown not exposed');
  process.exit(1);
}
const need = ['escapeCellPipes', 'mdRow', 'mdHeader', 'mdExcluded', 'planToMarkdown'];
for (const k of need) {
  if (typeof api[k] !== 'function') {
    console.error(`FAIL: ${k} not a function`);
    process.exit(1);
  }
}
console.log('PASS exposed: ' + need.join(', '));

// mdRow
const row = api.mdRow(['a', 'b|c', 'd']);
if (row !== '| a | b\\|c | d |') {
  console.error(`FAIL mdRow: ${row}`);
  process.exit(1);
}
console.log(`PASS mdRow escapes pipes: ${row}`);

// mdHeader
const hdr = api.mdHeader(['col1', 'col2']);
if (!hdr.includes('| col1 | col2 |') || !hdr.includes('| --- | --- |')) {
  console.error(`FAIL mdHeader: ${hdr}`);
  process.exit(1);
}
console.log('PASS mdHeader emits header + separator');

// mdExcluded
if (api.mdExcluded() !== '— excluded via --tiers —') {
  console.error(`FAIL mdExcluded: ${api.mdExcluded()}`);
  process.exit(1);
}
console.log('PASS mdExcluded placeholder');

// planToMarkdown with empty data
const empty = api.planToMarkdown({});
if (empty !== '# Engineering Plan (empty data)') {
  console.error(`FAIL empty: ${empty}`);
  process.exit(1);
}
console.log('PASS planToMarkdown empty guard');

// planToMarkdown with full data
const data = {
  meta: { project: 'TestProj', date: '2026-07-18', horizon: 'rolling', timestamp: '2026-07-18T00:00:00Z' },
  tiers: { '30d': true, '90d': true, 'long': true },
  context: { paragraph: 'Context paragraph', lastCommit: 'abc1234', activeBranches: 'main', todoCount: 3, testRatio: 0.42, medianCommits: 5 },
  assumptions: { open: 1, validated: 2, invalidated: 0, rows: [{ id: 'A1', text: 't', tier: '30d', validation: 'T+7d', signal: 's', consequence: 'c', owner: 'o', status: 'open', inferred: false }] },
  decisions: { made: 0, superseded: 0, reversed: 0, rows: [] },
  tier30d: { milestones: [{ id: 'M1', name: 'M', window: 'W1-2', exit: 'e', dependsOn: '—', dod: 'd' }], workItems: [{ id: 'W1', title: 'T', size: 'S', owner: 'o', deps: '—', files: 'f', risk: 'r' }] },
  tier90d: { themes: [], epics: [] },
  tierLong: { bets: [], shifts: [], northStars: [] },
  traceability: [],
  capacity: { available: 30, demand: 28, committers: 3, workingDays: 10, focus: 1.0, workDemand: 20, meetingDemand: 3, oncallDemand: 2, bufferDemand: 3, verdictUpper: 'GREEN', deltaLabel: 'green', breakdown: [], suggestedCuts: [] },
  risks: { actionBlock: 'act', rows: [] },
  team: { roster: [], alloc30d: [], alloc90d: [] },
  review: { author: 'a', peer: 'p', peerDate: 'd', stakeholder: 's', stakeholderDate: 'd', nextDate: 'n', date: 'd' },
};
const md = api.planToMarkdown(data);
const expectations = [
  '# TestProj — Engineering Plan (DRAFT — 2026-07-18)',
  '## Plan Diff vs Prior',
  '## Context',
  '## Assumptions Register',
  '## Decision Log',
  '## 30 DAYS — Sprint-tier execution',
  '## 90 DAYS — Quarter-tier commitments',
  '## LONG-TERM — Strategic bets',
  '## Traceability Matrix',
  '## Capacity vs Demand',
  '## Risk Mitigations',
  '## Team Allocation',
  '## Definition of Done',
  '## Review Checklist',
];
for (const expect of expectations) {
  if (!md.includes(expect)) {
    console.error(`FAIL: missing section "${expect}"`);
    process.exit(1);
  }
}
console.log(`PASS planToMarkdown emits ${expectations.length} sections`);

// Tier exclusion
const data90Only = JSON.parse(JSON.stringify(data));
data90Only.tiers = { '30d': false, '90d': true, 'long': true };
const md90 = api.planToMarkdown(data90Only);
const tierIdx = md90.indexOf('## 30 DAYS');
const exclIdx = md90.indexOf('— excluded via --tiers —', tierIdx);
if (tierIdx === -1 || exclIdx === -1) {
  console.error('FAIL: tier exclusion not emitted for 30d');
  process.exit(1);
}
console.log('PASS tier exclusion: 30d hidden when tier["30d"]=false');

// Inline pipe in description is escaped in the exported markdown
const dataPipe = JSON.parse(JSON.stringify(data));
dataPipe.assumptions.rows[0].text = 'special | pipe';
const mdPipe = api.planToMarkdown(dataPipe);
if (!mdPipe.includes('special \\| pipe')) {
  console.error('FAIL: pipe not escaped in row');
  process.exit(1);
}
console.log('PASS pipe escape in cell text');

console.log('\nALL OK');
