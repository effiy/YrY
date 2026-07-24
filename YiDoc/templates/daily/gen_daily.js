const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Default to today's date in local timezone.
// Override via CLI arg: `node gen_daily.js 2026-07-23` to regenerate a past date.
function toISODate(d) {
  var y = d.getFullYear();
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var day = ('0' + d.getDate()).slice(-2);
  return y + '-' + m + '-' + day;
}
const argDate = process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2]) ? process.argv[2] : null;
const TODAY = argDate || toISODate(new Date());
const TOMORROW = toISODate(new Date(Date.parse(TODAY + 'T12:00:00Z') + 86400000));
const REPO_ROOT = '/Users/ruiyi/Downloads/YrY';

const PROJECTS = [
  { name: 'YiDoc',     path: 'YiDoc',     gitDir: null },
  { name: 'YiAi',      path: 'YiAi',      gitDir: null },
  { name: 'YiH5',      path: 'YiH5',      gitDir: null },
  { name: 'YiPet',     path: 'YiPet',     gitDir: null },
  { name: 'YiPot',     path: 'YiPot',     gitDir: null },
  { name: 'YiWeb',     path: 'YiWeb',     gitDir: null },
  { name: 'YiviY',     path: 'YiviY',     gitDir: null },
];

// Bus factor: for each source file in the project, count how many distinct
// authors have ever committed changes to it. Group files into buckets:
//   "1 author"   → single-owner files (bus factor = 1, high risk)
//   "2 authors"  → shared but narrow
//   "3-4 authors" → reasonable
//   "5+ authors" → well-shared (low risk)
// Files with 0 authors (untracked, e.g. generated or newly added) are ignored.
function getBusFactor(proj) {
  const cwd = proj.gitDir ? `${REPO_ROOT}/${proj.gitDir}` : REPO_ROOT;
  const scope = proj.gitDir ? '.' : `${proj.path}/`;

  // `git log --numstat --pretty=format:'%aN'` gives us author + file per commit.
  // We aggregate per-file author sets across all history.
  const out = run(
    `git log --all --pretty=format:'COMMIT|%aN' --numstat -- ${scope}`,
    cwd
  );
  if (!out) return [];

  const fileAuthors = {};
  let currentAuthor = null;
  out.split('\n').forEach(line => {
    if (line.startsWith('COMMIT|')) {
      currentAuthor = line.slice(7).trim().split('<')[0].trim();
    } else if (line && currentAuthor) {
      const parts = line.split('\t');
      if (parts.length === 3 && parts[2] && !parts[2].includes('=>')) {
        const file = parts[2];
        if (!fileAuthors[file]) fileAuthors[file] = new Set();
        fileAuthors[file].add(currentAuthor);
      }
    }
  });

  const buckets = {
    '1 author':    0,
    '2 authors':   0,
    '3-4 authors': 0,
    '5+ authors':  0,
  };
  Object.values(fileAuthors).forEach(authors => {
    const n = authors.size;
    if (n === 1) buckets['1 author']++;
    else if (n === 2) buckets['2 authors']++;
    else if (n <= 4) buckets['3-4 authors']++;
    else buckets['5+ authors']++;
  });

  const total = Object.values(buckets).reduce((s, n) => s + n, 0);
  if (total === 0) return [];

  const verdictFor = (bucket) =>
    bucket === '1 author' ? 'critical'
    : bucket === '2 authors' ? 'warn'
    : bucket === '3-4 authors' ? 'pass'
    : 'pass';
  const colorFor = (bucket) =>
    bucket === '1 author' ? 'red'
    : bucket === '2 authors' ? 'amber'
    : 'green';

  return Object.entries(buckets)
    .filter(([_, n]) => n > 0)
    .map(([bucket, n]) => ({
      bucket,
      files: n,
      percent: Math.round(n / total * 100),
      verdict: verdictFor(bucket),
      color: colorFor(bucket)
    }))
    .sort((a, b) => {
      const order = ['1 author', '2 authors', '3-4 authors', '5+ authors'];
      return order.indexOf(a.bucket) - order.indexOf(b.bucket);
    });
}

// New contributors: authors in today's window who never committed to this
// project before the window started. "Before" = all history up to TODAY 00:00.
function getNewContributors(proj, todayAuthors) {
  if (!todayAuthors.length) return 'No commits in window.';
  const cwd = proj.gitDir ? `${REPO_ROOT}/${proj.gitDir}` : REPO_ROOT;
  const scope = proj.gitDir ? '' : `-- ${proj.path}/`;
  // Authors from all history BEFORE today's window.
  const beforeLog = run(
    `git log --until='${TODAY} 00:00:00' --format='%aN' ${scope}`,
    cwd
  );
  const beforeAuthors = new Set(
    beforeLog.split('\n').filter(Boolean).map(a => a.split('<')[0].trim())
  );
  const newOnes = todayAuthors.filter(a => !beforeAuthors.has(a));
  if (newOnes.length === 0) {
    return 'No new contributors (all ' + todayAuthors.length + ' author(s) have prior history).';
  }
  return newOnes.length + ' new contributor(s): ' + newOnes.join(', ') + '.';
}

// Reviewer coverage: percentage of commits in the window that carry a review
// trailer (Reviewed-by, Acked-by, Tested-by, Co-authored-by). These trailers
// are the standard git convention for indicating code review.
function getReviewCoverage(proj, totalCommits) {
  if (totalCommits === 0) {
    return { text: 'No commits in window.', verdict: 'n/a', color: 'muted' };
  }
  const cwd = proj.gitDir ? `${REPO_ROOT}/${proj.gitDir}` : REPO_ROOT;
  const scope = proj.gitDir ? '' : `-- ${proj.path}/`;
  const since = `${TODAY} 00:00:00`;
  const until = `${TOMORROW} 00:00:00`;
  // Get full commit body for each commit in the window
  const bodies = run(
    `git log --since='${since}' --until='${until}' --format='%B%x1f' ${scope}`,
    cwd
  );
  if (!bodies) {
    return { text: 'Failed to read commit messages.', verdict: 'error', color: 'red' };
  }
  const commits = bodies.split('\x1f').filter(Boolean);
  const reviewTrailers = ['Reviewed-by:', 'Acked-by:', 'Tested-by:', 'Co-authored-by:'];
  let reviewedCount = 0;
  commits.forEach(body => {
    const hasTrailer = reviewTrailers.some(t => body.includes(t));
    if (hasTrailer) reviewedCount++;
  });
  const pct = Math.round(reviewedCount / totalCommits * 100);
  let verdict, color;
  if (pct >= 80)      { verdict = 'strong'; color = 'green';  }
  else if (pct >= 50) { verdict = 'moderate'; color = 'amber'; }
  else if (pct > 0)   { verdict = 'weak';    color = 'amber'; }
  else                { verdict = 'none';    color = 'red';   }
  const text = `${reviewedCount}/${totalCommits} commits (${pct}%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).`;
  return { text, verdict, color };
}

function run(cmd, cwd) {
  try { return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim(); }
  catch (e) { return ''; }
}

function gitLogForProject(proj) {
  // For projects with their own git repo, use that directly.
  // For projects in the monorepo, scope by path.
  const cwd = proj.gitDir ? `${REPO_ROOT}/${proj.gitDir}` : REPO_ROOT;
  const scope = proj.gitDir ? '' : `-- ${proj.path}/`;
  const since = `${TODAY} 00:00:00`;
  const until = `${TOMORROW} 00:00:00`;
  
  const log = run(`git log --since='${since}' --until='${until}' --format='%aN<%aE>' ${scope}`, cwd);
  const diffStat = run(`git log --since='${since}' --until='${until}' --pretty=tformat: --numstat ${scope}`, cwd);
  
  const authors = log.split('\n').filter(Boolean);
  const authorMap = {};
  authors.forEach(a => { authorMap[a] = (authorMap[a] || 0) + 1; });
  const totalCommits = authors.length;
  const contributors = Object.entries(authorMap)
    .map(([author, commits]) => ({
      author: author.split('<')[0],
      commits,
      percent: totalCommits ? Math.round(commits / totalCommits * 100) : 0,
      barWidth: totalCommits ? Math.round(commits / totalCommits * 160) : 0
    }))
    .sort((a, b) => b.commits - a.commits);

  const fileTouches = {};
  diffStat.split('\n').filter(Boolean).forEach(line => {
    const parts = line.split('\t');
    if (parts.length === 3 && parts[2] && !parts[2].includes('=>')) {
      fileTouches[parts[2]] = (fileTouches[parts[2]] || 0) + 1;
    }
  });
  const hotFiles = Object.entries(fileTouches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, touches], i) => ({ rank: i + 1, path, touches }));

  let ins = 0, del = 0;
  diffStat.split('\n').filter(Boolean).forEach(line => {
    const parts = line.split('\t');
    if (parts.length === 3) {
      ins += parseInt(parts[0]) || 0;
      del += parseInt(parts[1]) || 0;
    }
  });

  return { totalCommits, contributors, hotFiles, uniqueFiles: Object.keys(fileTouches).length, ins, del };
}

function getLanguages(proj) {
  const projPath = `${REPO_ROOT}/${proj.path}`;
  if (!fs.existsSync(projPath)) return [];
  const files = [];
  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
        const full = dir + '/' + e.name;
        if (e.isDirectory()) walk(full);
        else if (e.isFile()) files.push(full);
      }
    } catch (e) {}
  }
  walk(projPath);
  const langMap = {};
  files.forEach(f => {
    const ext = f.split('.').pop().toLowerCase();
    if (!ext || ext.length > 6) return;
    try {
      const lines = fs.readFileSync(f, 'utf8').split('\n').length;
      langMap[ext] = langMap[ext] || { files: 0, loc: 0 };
      langMap[ext].files++;
      langMap[ext].loc += lines;
    } catch (e) {}
  });
  const total = Object.values(langMap).reduce((s, v) => s + v.loc, 0);
  const maxLoc = Math.max(...Object.values(langMap).map(v => v.loc), 1);
  return Object.entries(langMap)
    .sort((a, b) => b[1].loc - a[1].loc)
    .slice(0, 6)
    .map(([kind, v]) => ({
      kind,
      files: v.files,
      loc: v.loc,
      percent: total ? +(v.loc / total * 100).toFixed(1) : 0,
      barWidth: Math.round(v.loc / maxLoc * 160)
    }));
}

function getTechDebt(proj) {
  const projPath = `${REPO_ROOT}/${proj.path}`;
  if (!fs.existsSync(projPath)) return [];
  const markers = ['TODO', 'FIXME', 'HACK', 'XXX'];
  return markers.map(marker => {
    let count = 0;
    try {
      count = parseInt(run(`grep -r --include='*.js' --include='*.ts' --include='*.vue' --include='*.py' --include='*.rs' --include='*.html' --include='*.css' -l "${marker}" "${projPath}" 2>/dev/null | wc -l`, REPO_ROOT)) || 0;
    } catch (e) {}
    return {
      marker,
      count,
      verdict: count === 0 ? 'clean' : count < 10 ? 'pass' : count < 30 ? 'warn' : 'critical',
      color: count === 0 ? 'green' : count < 10 ? 'green' : count < 30 ? 'amber' : 'red',
      share: `${count} files`
    };
  }).filter(d => d.count > 0);
}

// Map skill families under .claude/skills/ to projects by keyword matching.
const SKILL_PROJECT_MAP = {
  YiDoc:    ['yry-init', 'yry-reports', 'yry-test', 'yry-tools'],
  YiAi:     ['fastapi'],
  YiH5:     ['h5'],
  YiPet:    ['chrome'],
  YiPot:    ['tauri'],
  YiWeb:    ['vue', 'vite', 'nodejs', 'css'],
  YiviY:    [],
};

function getSkills(proj) {
  const skillsRoot = `${REPO_ROOT}/.claude/skills`;
  if (!fs.existsSync(skillsRoot)) return [];
  const familyKeys = SKILL_PROJECT_MAP[proj.name] || [];
  if (!familyKeys.length) return [];

  const result = [];
  for (const familyKey of familyKeys) {
    // familyKey can be a top-level family (yry-init) or a sub-family (yry-code/vue)
    const candidates = [
      `${skillsRoot}/${familyKey}`,                                              // top-level family (yry-init)
      ...fs.readdirSync(skillsRoot, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(d => `${skillsRoot}/${d.name}/${familyKey}`)                        // nested family (yry-code/vue)
    ];
    for (const famDir of candidates) {
      if (!fs.existsSync(famDir) || !fs.statSync(famDir).isDirectory()) continue;
      const familyName = famDir.split('/').slice(-2).join('/');
      let files = 0, skillMd = 0, evals = 0, references = 0;
      function walk(dir) {
        try {
          for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            if (e.name.startsWith('.')) continue;
            const full = `${dir}/${e.name}`;
            if (e.isDirectory()) walk(full);
            else if (e.isFile()) {
              files++;
              if (e.name === 'SKILL.md') skillMd++;
              else if (e.name.endsWith('.md')) references++;
              else if (full.includes('/evals/') || full.includes('/eval/')) evals++;
            }
          }
        } catch (e) {}
      }
      walk(famDir);
      result.push({
        name: familyName,
        files, skillMd, evals, references,
        notes: skillMd > 0 ? `${skillMd} skill manifest(s)` : 'no SKILL.md'
      });
    }
  }
  return result;
}

// Count test content. This monorepo uses markdown "test scenes" (scene-*/index.md)
// as its primary test strategy — no executable *.test.js / test_*.py files exist.
// We count test scene markdown LOC as testLoc, and all non-test source LOC as allJsLoc.
function getTests(proj, languages) {
  const projPath = `${REPO_ROOT}/${proj.path}`;
  if (!fs.existsSync(projPath)) return { testLoc: 0, allJsLoc: 0, ratio: 0, threshold: 0.2, verdict: '—', color: 'muted' };

  let testLoc = 0;
  let testSceneCount = 0;
  function walkTests(dir) {
    try {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
        const full = `${dir}/${e.name}`;
        if (e.isDirectory()) {
          // Test scene directories match `scene-N-*` pattern
          if (/^scene-\d+/.test(e.name)) {
            const idx = `${full}/index.md`;
            if (fs.existsSync(idx)) {
              try {
                testLoc += fs.readFileSync(idx, 'utf8').split('\n').length;
                testSceneCount++;
              } catch (e) {}
            }
          } else {
            walkTests(full);
          }
        }
      }
    } catch (e) {}
  }
  walkTests(projPath);

  // allJsLoc = all source LOC from language scan (proxy for "code under test")
  const allJsLoc = languages.reduce((s, l) => s + l.loc, 0);
  const ratio = allJsLoc > 0 ? testLoc / allJsLoc : 0;
  const threshold = 0.2;
  let verdict, color;
  if (testSceneCount === 0 && allJsLoc === 0) {
    verdict = 'n/a'; color = 'muted';
  } else if (testSceneCount === 0) {
    verdict = 'no tests'; color = 'red';
  } else if (ratio >= threshold) {
    verdict = 'pass'; color = 'green';
  } else if (ratio >= threshold * 0.5) {
    verdict = 'low'; color = 'amber';
  } else {
    verdict = 'sparse'; color = 'amber';
  }
  return { testLoc, allJsLoc, ratio, threshold, verdict, color, testSceneCount };
}

function getBranches(proj) {
  const cwd = proj.gitDir ? `${REPO_ROOT}/${proj.gitDir}` : REPO_ROOT;
  const out = run(`git for-each-ref --sort=-committerdate --format='%(refname:short)|%(committerdate:short)|%(subject)' refs/heads/`, cwd);
  if (!out) return [];
  return out.split('\n').filter(Boolean).slice(0, 5).map(line => {
    const [name, lastCommit, note] = line.split('|');
    const age = lastCommit ? Math.floor((new Date() - new Date(lastCommit)) / 86400000) : 0;
    return {
      name,
      lastCommit: lastCommit || '—',
      ageDays: age,
      status: age <= 1 ? 'active' : age <= 7 ? 'normal' : age <= 30 ? 'stale' : 'abandoned',
      note: note || '',
      color: age <= 1 ? 'green' : age <= 7 ? 'green' : age <= 30 ? 'amber' : 'red'
    };
  });
}

function buildProjectData(proj) {
  const git = gitLogForProject(proj);
  const languages = getLanguages(proj);
  const techDebt = getTechDebt(proj);
  const branches = getBranches(proj);
  const totalLoc = languages.reduce((s, l) => s + l.loc, 0);
  
  const summary = {
    kpis: [
      { label: 'Commits', value: String(git.totalCommits), sub: git.totalCommits === 0 ? 'no activity today' : `${git.totalCommits} commit(s)`, tone: git.totalCommits === 0 ? 'warn' : 'normal' },
      { label: 'Insertions', value: '+' + git.ins.toLocaleString(), sub: 'lines added today', tone: git.ins > 1000 ? 'warn' : 'normal' },
      { label: 'Deletions', value: '−' + git.del.toLocaleString(), sub: 'lines removed today', tone: 'normal' },
      { label: 'Authors', value: String(git.contributors.length), sub: git.contributors.length <= 1 ? 'single-author' : 'multi-author', tone: git.contributors.length <= 1 ? 'critical' : 'normal' },
      { label: 'Files touched', value: String(git.uniqueFiles), sub: 'unique paths', tone: 'normal' },
      { label: 'Total LOC', value: totalLoc > 1000 ? Math.round(totalLoc / 1000) + 'K' : String(totalLoc), sub: 'project-wide', tone: 'normal' }
    ],
    contributors: git.contributors,
    hotFiles: git.hotFiles,
    narrative: {
      shipped: git.totalCommits > 0 ? `${git.totalCommits} commit(s) on ${TODAY}. ${git.contributors.length} author(s) active.` : `No commits on ${TODAY}.`,
      atRisk: git.contributors.length <= 1 ? 'Single-author project — bus factor is 1.' : null,
      drifting: null,
      watch: git.totalCommits === 0 ? 'No activity today. Check if the project is on track.' : null
    }
  };

  const risk = {
    legend: { green: 'within threshold', amber: 'monitor', red: 'needs action' },
    items: []
  };
  if (git.contributors.length <= 1) {
    risk.items.push({ severity: 'amber', name: 'Single-author bus factor', hint: 'Only one contributor has touched files in this window.', action: 'Encourage knowledge sharing or add reviewers.', category: 'people' });
  }
  if (git.totalCommits === 0) {
    risk.items.push({ severity: 'amber', name: 'No commits today', hint: 'Zero activity in the reporting window.', action: 'Verify the project is healthy and contributors are unblocked.', category: 'activity' });
  }
  const hotTodo = techDebt.find(d => d.marker === 'TODO');
  if (hotTodo && hotTodo.count > 20) {
    risk.items.push({ severity: 'amber', name: `High TODO count (${hotTodo.count})`, hint: `${hotTodo.count} files contain TODO markers.`, action: 'Schedule a tech-debt sprint to resolve.', category: 'debt' });
  }

  const health = {
    languages,
    skills: getSkills(proj),
    tests: getTests(proj, languages),
    techDebt,
    branches,
    dependencies: { text: 'No dependency manifest found.', verdict: '—', color: 'muted' }
  };
  const pkgPath = `${REPO_ROOT}/${proj.path}/package.json`;
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = Object.keys(pkg.dependencies || {}).length;
      const devDeps = Object.keys(pkg.devDependencies || {}).length;
      health.dependencies = { text: `<code>package.json</code>: ${deps} deps + ${devDeps} devDeps.`, verdict: deps > 30 ? 'heavy' : 'lean', color: deps > 30 ? 'amber' : 'green' };
    } catch (e) {}
  }
  const reqPath = `${REPO_ROOT}/${proj.path}/requirements.txt`;
  if (fs.existsSync(reqPath)) {
    try {
      const lines = fs.readFileSync(reqPath, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')).length;
      health.dependencies = { text: `<code>requirements.txt</code>: ${lines} pinned dependencies.`, verdict: lines > 30 ? 'heavy' : 'lean', color: lines > 30 ? 'amber' : 'green' };
    } catch (e) {}
  }

  const dayOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(TODAY + 'T12:00:00').getDay()];
  const people = {
    distribution: git.contributors,
    busFactor: getBusFactor(proj),
    activityPulse: [{
      date: TODAY,
      day: dayOfWeek,
      commits: git.totalCommits,
      hint: git.totalCommits === 0 ? 'no commits' : `${git.totalCommits} commit(s)`,
      barWidth: Math.min(160, git.totalCommits * 20)
    }],
    review: getReviewCoverage(proj, git.totalCommits),
    newContributors: getNewContributors(proj, git.contributors.map(c => c.author))
  };

  return { project: proj.name, scope: `${REPO_ROOT}/${proj.path}`, scopeShort: proj.name, summary, risk, health, people };
}

const projects = PROJECTS.map(buildProjectData);
const out = {
  meta: {
    date: TODAY,
    window: '1d',
    sinceDate: TODAY,
    untilDate: TODAY,
    timestamp: new Date().toISOString(),
    title: `YrY · Daily CTO Report · ${TODAY}`
  },
  projects
};

const js = 'window.REPORT_DATA = ' + JSON.stringify(out, null, 2) + ';\n';
const dest = path.join(process.cwd(), `${TODAY}.js`);
fs.writeFileSync(dest, js);
console.log(`Wrote ${dest} (${js.length} bytes)`);

console.log('Projects:', projects.map(p => `${p.project}(${p.summary.kpis[0].value} commits, ${p.summary.kpis[2].value} del)`).join(', '));
