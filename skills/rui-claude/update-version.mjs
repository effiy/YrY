#!/usr/bin/env node
// rui-claude update-version — Merge all branches → bump version → push
// Usage: node skills/rui-claude/update-version.mjs [--dry-run]

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { bold, dim, red, green, yellow, cyan } from '../../lib/tty.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

function exec(cmd, opts) {
  opts = opts || {};
  try {
    return execSync(cmd, Object.assign({ encoding: 'utf-8' }, opts)).trim();
  } catch (e) {
    if (opts.allowFailure) return '';
    throw e;
  }
}

function exit(msg, code) {
  console.error(red('\n✗ ' + msg));
  process.exit(code || 1);
}

// Section 1: Preflight
console.log(bold('\nSection 1: Preflight'));
var status = exec('git status --porcelain');
if (status) {
  console.log(dim('Uncommitted changes:'));
  var lines = status.split('\n');
  for (var i = 0; i < Math.min(lines.length, 10); i++) {
    console.log(dim('  ' + lines[i]));
  }
  exit('Working directory not clean. Please commit or stash changes first.');
}
console.log(green('OK: Working directory clean'));

var currentBranch = exec('git branch --show-current');
if (currentBranch !== 'main') {
  console.log(yellow('Currently on ' + currentBranch + ', switching to main...'));
  exec('git checkout main');
  console.log(green('OK: Switched to main'));
}

// Section 2: Fetch branches
console.log(bold('\nSection 2: Fetch branches'));
console.log(dim('git fetch --all...'));
exec('git fetch --all');
console.log(green('OK: Fetched all remote branches'));

var allBranches = exec('git branch --format="%(refname:short)"').split('\n').filter(Boolean);
var mergeBranches = allBranches.filter(function(b) {
  return b !== 'main' && !b.startsWith('origin/');
});

if (mergeBranches.length === 0) {
  console.log(dim('No branches to merge'));
} else {
  console.log('Branches to merge (' + mergeBranches.length + '):');
  mergeBranches.forEach(function(b) { console.log(cyan('  - ' + b)); });
}

// Section 3: Merge branches
console.log(bold('\nSection 3: Merge branches into main'));
var merged = [];
var conflicts = [];

for (var j = 0; j < mergeBranches.length; j++) {
  var branch = mergeBranches[j];
  console.log(dim('\nMerging ' + branch + '...'));
  if (DRY_RUN) {
    console.log(yellow('  [dry-run] Would merge --no-ff ' + branch));
    merged.push(branch);
    continue;
  }
  try {
    var result = exec('git merge --no-ff ' + branch + ' -m "merge: ' + branch + ' -> main"');
    console.log(green('  OK: ' + result.split('\n')[0]));
    merged.push(branch);
  } catch (e) {
    var msg = (e.stdout || '') + (e.stderr || '') + e.message;
    if (msg.indexOf('CONFLICT') !== -1) {
      console.log(red('  CONFLICT: ' + branch));
      try { exec('git merge --abort', { allowFailure: true }); } catch (ignore) {}
      conflicts.push(branch);
    } else {
      console.log(red('  FAILED: ' + msg.split('\n')[0]));
      conflicts.push(branch);
    }
  }
}

if (conflicts.length > 0) {
  console.log(red('\n' + conflicts.length + ' branches had conflicts/failures:'));
  conflicts.forEach(function(b) { console.log(red('  - ' + b)); });
  exit('Please resolve conflicts manually and re-run.', 2);
}

console.log(green('\nOK: Merged ' + merged.length + ' branches'));

// Section 4: Analyze changes
console.log(bold('\nSection 4: Analyze changes to determine version bump type'));

var diffFull = exec('git diff HEAD~1..HEAD 2>/dev/null || git diff origin/main..HEAD 2>/dev/null || echo ""', { allowFailure: true });
var newFiles = exec('git diff --name-only --diff-filter=A HEAD~1..HEAD 2>/dev/null || echo ""', { allowFailure: true });
var renamedFiles = exec('git diff --name-only --diff-filter=R HEAD~1..HEAD 2>/dev/null || echo ""', { allowFailure: true });

var signals = { major: 0, minor: 0, patch: 0 };

if (diffFull.match(/BREAKING CHANGE|breaking change/i)) signals.major++;
if (newFiles.match(/skills\/\w+\/SKILL\.md|skills\/\w+\/help\.mjs/)) signals.minor++;
if (newFiles.match(/agents\/\w+\.md/)) signals.minor++;
if (newFiles.match(/rules\/\w+\.md/)) signals.minor++;
if (renamedFiles) signals.minor++;

var bumpType = 'PATCH';
if (signals.major > 0) {
  bumpType = 'MAJOR';
} else if (signals.minor > 0) {
  bumpType = 'MINOR';
}

console.log('  Signals: MAJOR=' + signals.major + ' MINOR=' + signals.minor + ' PATCH=' + signals.patch);
console.log(green('  -> Determined: ' + bumpType));

// Section 5: Calculate version
console.log(bold('\nSection 5: Version calculation'));

function readVersionFromJson(path) {
  try {
    var content = readFileSync(path, 'utf-8');
    var json = JSON.parse(content);
    return json.version;
  } catch (e) { return null; }
}

var currentVersion = readVersionFromJson('.claude-plugin/plugin.json');
if (!currentVersion) exit('Cannot read current version from plugin.json');

var parts = currentVersion.split('.').map(Number);
var newVersion;
switch (bumpType) {
  case 'MAJOR':
    newVersion = (parts[0] + 1) + '.0.0';
    break;
  case 'MINOR':
    newVersion = parts[0] + '.' + (parts[1] + 1) + '.0';
    break;
  default:
    newVersion = parts[0] + '.' + parts[1] + '.' + (parts[2] + 1);
    break;
}

console.log('  ' + dim(currentVersion) + ' -> ' + bold(green(newVersion)) + ' (' + bumpType + ')');

// Section 6: Update version files
console.log(bold('\nSection 6: Update version files'));

if (DRY_RUN) {
  console.log(yellow('  [dry-run] Would update version files to ' + newVersion));
} else {
  // 6a: plugin.json
  var pluginPath = '.claude-plugin/plugin.json';
  var plugin = JSON.parse(readFileSync(pluginPath, 'utf-8'));
  plugin.version = newVersion;
  writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + '\n', 'utf-8');
  console.log(green('  OK: plugin.json -> ' + newVersion));

  // 6b: marketplace.json
  var mpPath = '.claude-plugin/marketplace.json';
  var mp = JSON.parse(readFileSync(mpPath, 'utf-8'));
  mp.metadata.version = newVersion;
  mp.plugins[0].version = newVersion;
  writeFileSync(mpPath, JSON.stringify(mp, null, 2) + '\n', 'utf-8');
  console.log(green('  OK: marketplace.json -> ' + newVersion));

  // 6c: CLAUDE.md
  var claudePath = 'CLAUDE.md';
  var claude = readFileSync(claudePath, 'utf-8');
  claude = claude.replace(
    /(\|\s*版本\s*\|)\s*[\d.]+\s*(\|)/,
    '$1 ' + newVersion + ' $2'
  );
  writeFileSync(claudePath, claude, 'utf-8');
  console.log(green('  OK: CLAUDE.md -> ' + newVersion));

  // 6d: README.md
  try {
    var readmePath = 'README.md';
    var readme = readFileSync(readmePath, 'utf-8');
    readme = readme
      .replace(/(\*\*版本\*\*[：:]\s*`?)[\d.]+(`?)/, '$1' + newVersion + '$2')
      .replace(/(version[：:]\s*`?)[\d.]+(`?)/g, '$1' + newVersion + '$2')
      .replace(/(v)[\d.]+(\s)/g, 'v' + newVersion + '$2')
      .replace(/(<sub>v)[\d.]+(<\/sub>)/, '$1' + newVersion + '$2');
    writeFileSync(readmePath, readme, 'utf-8');
    console.log(green('  OK: README.md -> ' + newVersion));
  } catch (e) { console.log(yellow('  WARNING: README.md not found, skipped')); }

  // 6e: docs/index.html
  try {
    var indexPath = 'docs/index.html';
    var indexHtml = readFileSync(indexPath, 'utf-8');
    indexHtml = indexHtml.replace(
      /(YrY v)[\d.]+( ·)/,
      '$1' + newVersion + '$2'
    );
    writeFileSync(indexPath, indexHtml, 'utf-8');
    console.log(green('  OK: docs/index.html -> ' + newVersion));
  } catch (e) { console.log(yellow('  WARNING: docs/index.html not found, skipped')); }
}

// Section 7: Git commit
console.log(bold('\nSection 7: Git Commit'));

var commitSubject = 'chore: bump version ' + currentVersion + ' -> ' + newVersion;
var commitBody = 'Merged branches: ' + (merged.join(', ') || 'none') + '\nChange type: ' + bumpType;

if (DRY_RUN) {
  console.log(yellow('  [dry-run] Would commit: ' + commitSubject));
} else {
  var staged = exec('git diff --cached --name-only', { allowFailure: true });
  if (!staged) {
    exec('git add .claude-plugin/plugin.json .claude-plugin/marketplace.json CLAUDE.md README.md');
  }
  exec('git commit -m "' + commitSubject + '\n\n' + commitBody + '"');
  var commitHash = exec('git rev-parse --short HEAD');
  console.log(green('  OK: commit ' + commitHash));
}

// Section 8: Push + Tag
console.log(bold('\nSection 8: Push + Tag'));

if (DRY_RUN) {
  console.log(yellow('  [dry-run] Would push to origin/main'));
  console.log(yellow('  [dry-run] Would tag v' + newVersion + ' and push --tags'));
} else {
  exec('git push origin main');
  console.log(green('  OK: pushed to origin/main'));

  var tagMsg = 'v' + newVersion + ': ' + bumpType + ' - merged ' + merged.length + ' branches';
  exec('git tag -a v' + newVersion + ' -m "' + tagMsg + '"');
  exec('git push --tags');
  console.log(green('  OK: tag v' + newVersion + ' pushed'));
}

// Section 9: Summary
console.log(bold('\nSection 9: Summary'));
console.log(dim('----------------------------------------'));
console.log('  Merged    : ' + cyan(String(merged.length)) + ' branches' +
  (merged.length > 0 ? ' (' + merged.join(', ') + ')' : ''));
console.log('  Version   : ' + dim(currentVersion) + ' -> ' + bold(green(newVersion)));
console.log('  Type      : ' + yellow(bumpType));
if (!DRY_RUN) {
  var hash = exec('git rev-parse --short HEAD');
  console.log('  Commit    : ' + cyan(hash));
  console.log('  Tag       : ' + cyan('v' + newVersion));
}
if (conflicts.length > 0) {
  console.log('  Skipped   : ' + red(String(conflicts.length)) + ' branches');
}
console.log(dim('----------------------------------------'));
console.log(green('\nVersion convergence upgrade complete!\n'));
