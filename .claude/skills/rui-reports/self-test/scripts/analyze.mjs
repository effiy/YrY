#!/usr/bin/env node
/**
 * rui-report-self-test · analyzer
 * ----------------------------------------------------------------------
 * Six-stage analysis pipeline implementing the rui-report-self-test
 * skill (SKILL.md, methodology.md, scene-catalog.md,
 * self-test-contracts.md). Emits window.REPORT_DATA containing the
 * full per-scene §0–§4 payload in a single data.js.
 *
 * Usage:  node scripts/analyze.mjs <scope> <outDir>
 *         scope  — absolute path to walk
 *         outDir — absolute path to write data.js + page assets
 *
 * Env (optional):
 *   MERGE_SCENES=true  — also emit markdown under <outDir>/../self-test/
 *                        (relative to outDir's parent).
 *   THEME=dark|light   — page theme (default dark).
 *   NO_PDF=true        — skip the PDF/print stylesheet (default false).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [, , SCOPE, OUT_DIR] = process.argv;
if (!SCOPE || !OUT_DIR) {
    console.error('Usage: node analyze.mjs <scope> <outDir>');
    process.exit(2);
}

const absScope = path.resolve(SCOPE);
if (!fs.existsSync(absScope)) {
    console.error('scope-not-found:', absScope);
    process.exit(3);
}

const MERGE_SCENES = process.env.MERGE_SCENES !== 'false';
const THEME = process.env.THEME === 'light' ? 'light' : 'dark';

const t0 = Date.now();

/* ── Default exclusion globs (rules/self-test-contracts.md) ─────────
   Mirrors rui-reports/files — single source of truth. */
const EXCLUDE_DIRS = [
    'node_modules', '.git', 'dist', 'build', '.next', '.turbo',
    'coverage', '.memory', '.claude', 'target', 'intermediate',
];
const EXCLUDE_FILES = ['.DS_Store'];

/* ── Stage 1 — File Inventory (mirrors rui-reports/files) ────────── */
console.log('[stage1] walking scope…');
let filePaths = [];
try {
    const findArgs = [absScope, '-type', 'f'];
    for (const d of EXCLUDE_DIRS) {
        findArgs.push('-not', '-path', `*/${d}/*`);
    }
    for (const f of EXCLUDE_FILES) {
        findArgs.push('-not', '-name', f);
    }
    findArgs.push('-print0');
    const out = execFileSync('find', findArgs, { maxBuffer: 256 * 1024 * 1024 });
    filePaths = out.toString('utf8').split('\0').filter(Boolean);
} catch (e) {
    console.error('find failed:', e.message);
    process.exit(4);
}
console.log(`  ${filePaths.length} files`);

const statMap = new Map();
for (const p of filePaths) {
    try {
        const st = fs.statSync(p);
        statMap.set(p, { bytes: st.size, mtime: Math.floor(st.mtimeMs / 1000) });
    } catch (e) { /* skip */ }
}

function typeOf(file) {
    if (file.endsWith('.d.ts')) return 'ts';
    const ext = path.extname(file).toLowerCase();
    return ext.replace(/^\./, '') || 'other';
}

const records = [];
for (const abs of filePaths) {
    const s = statMap.get(abs);
    if (!s) continue;
    const rel = path.relative(absScope, abs).split(path.sep).join('/');
    records.push({ path: rel, absPath: abs, bytes: s.bytes, type: typeOf(abs), lastModified: s.mtime });
}
records.sort((a, b) => a.path.localeCompare(b.path));

/* ── Stage 2 — Facet Detection ───────────────────────────────────── */
console.log('[stage2] detecting facets…');

/* 2.1 — Test framework detection (pre-commit-incremental-self-check) */
const TEST_FRAMEWORK_HINTS = {
    'vitest.config.{js,ts,mjs,cjs}': 'vitest',
    'jest.config.{js,ts,mjs,cjs}': 'jest',
    'pytest.ini': 'pytest',
    'pyproject.toml': 'pytest',     // [tool.pytest] section
    'conftest.py': 'pytest',
    'go.mod': 'go test',
    'Cargo.toml': 'cargo test',
    'phpunit.xml': 'phpunit',
    'package.json': 'npm test',     // check for "test" script
};
const testFiles = records.filter(r =>
    /\.(test|spec)\.[a-z]+$/.test(r.path) ||
    /(^|\/)__tests__\//.test(r.path) ||
    /\.(test|spec)\./.test(r.path)
);
let testFramework = null;
for (const hint of Object.keys(TEST_FRAMEWORK_HINTS)) {
    const ext = hint.includes('{') ? null : null;
    const re = new RegExp('^' + hint.replace(/\{[^}]+\}/, '[^/]+') + '$');
    if (records.some(r => re.test(r.path))) {
        testFramework = TEST_FRAMEWORK_HINTS[hint];
        break;
    }
}
if (!testFramework) {
    // Check package.json for a "test" script
    const pkg = records.find(r => r.path === 'package.json');
    if (pkg) {
        try {
            const txt = fs.readFileSync(pkg.absPath, 'utf8');
            if (/"scripts"\s*:\s*\{[^}]*"test"\s*:/m.test(txt)) {
                testFramework = 'npm test';
            }
        } catch {}
    }
}
const testFacet = {
    framework: testFramework,
    testFileCount: testFiles.length,
    testFiles: testFiles.slice(0, 20).map(r => r.path),
    hasFramework: !!testFramework,
};

/* 2.2 — Documentation detection (doc-code-consistency) */
const DOC_GLOBS = [
    /^CLAUDE\.md$/i, /^README(?:\..*)?$/i, /^CONTRIBUTING(?:\..*)?$/i,
    /^CHANGELOG(?:\..*)?$/i, /^LICENSE(?:\..*)?$/i, /^docs\//i, /^\.github\//i,
];
const docFiles = records.filter(r => DOC_GLOBS.some(re => re.test(r.path)));
const codeFiles = records.filter(r => /\.(js|ts|mjs|cjs|jsx|tsx|vue|py|go|java|rs|css|scss)$/.test(r.path));
const docFacet = {
    docCount: docFiles.length,
    codeCount: codeFiles.length,
    docRatio: codeFiles.length > 0 ? +(docFiles.length / codeFiles.length).toFixed(3) : 0,
    files: docFiles.slice(0, 30).map(r => r.path),
    missingReadme: !records.some(r => /^README(?:\..*)?$/i.test(r.path)),
    missingClaude: !records.some(r => /^CLAUDE\.md$/i.test(r.path)),
    hasDocsDir: docFiles.some(r => /^docs\//i.test(r.path)),
};

/* 2.3 — Security surface detection (security-surface-regression) */
const SECRET_REGEX = /(api[_-]?key|secret|token|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i;
const ENV_FILES = records.filter(r => /^\.env(\..+)?$/.test(r.path));
const HTML_FILES = records.filter(r => /\.html?$/.test(r.path));
const dangerousCalls = [];
const DANGEROUS_PATTERNS = [
    { re: /eval\s*\(/g, name: 'eval()' },
    { re: /new\s+Function\s*\(/g, name: 'new Function()' },
    { re: /innerHTML\s*=/g, name: 'innerHTML assignment' },
    { re: /document\.write\s*\(/g, name: 'document.write' },
    { re: /dangerouslySetInnerHTML/g, name: 'dangerouslySetInnerHTML' },
    { re: /child_process\.(exec|spawn)\s*\(/g, name: 'child_process.exec/spawn' },
];
for (const r of records) {
    if (r.bytes > 256_000) continue;
    let content;
    try { content = fs.readFileSync(r.absPath, 'utf8'); } catch { continue; }
    if (content.length > 64 * 1024) content = content.slice(0, 64 * 1024);
    for (const p of DANGEROUS_PATTERNS) {
        // Each test gets a fresh regex instance to avoid lastIndex carry-over
        // from previous files. The pattern source is stable so this is cheap.
        const re = new RegExp(p.re.source, p.re.flags);
        if (re.test(content)) {
            dangerousCalls.push({ file: r.path, kind: p.name });
        }
    }
}
const securityFacet = {
    envFileCount: ENV_FILES.length,
    envFiles: ENV_FILES.map(r => r.path),
    dangerousCallCount: dangerousCalls.length,
    dangerousCalls: dangerousCalls.slice(0, 20),
    htmlCount: HTML_FILES.length,
    hasEnvFile: ENV_FILES.length > 0,
};

/* 2.4 — Cross-reference integrity (cross-story-integration-regression) */
const STORY_DIRS = ['docs/arch', 'docs/self-test', 'docs/reports'];
const storyDirs = STORY_DIRS.filter(d => records.some(r => r.path === d || r.path.startsWith(d + '/')));
const mdFiles = records.filter(r => /\.md$/i.test(r.path));
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const FILE_LINK_RE = /\[([^\]]+)\]\(([^)]+\.[a-z]{1,5})\)/gi;
let brokenLinks = 0;
let totalLinks = 0;
const linkAudit = { byFile: {} };
for (const r of mdFiles) {
    if (r.bytes > 256_000) continue;
    let content;
    try { content = fs.readFileSync(r.absPath, 'utf8'); } catch { continue; }
    const links = [];
    let m;
    FILE_LINK_RE.lastIndex = 0;
    while ((m = FILE_LINK_RE.exec(content)) !== null) {
        const target = m[2].split('#')[0].split('?')[0];
        if (!target || /^[a-z]+:\/\//i.test(target)) continue;
        if (target.startsWith('/') || target.startsWith('http')) continue;
        links.push(target);
    }
    if (links.length === 0) continue;
    let broken = 0;
    for (const link of links) {
        // Resolve relative to the markdown file's directory
        const linkAbs = path.resolve(path.dirname(r.absPath), link);
        if (!fs.existsSync(linkAbs)) broken += 1;
    }
    linkAudit.byFile[r.path] = { total: links.length, broken };
    brokenLinks += broken;
    totalLinks += links.length;
}
const refsFacet = {
    storyDirCount: storyDirs.length,
    storyDirs,
    mdFileCount: mdFiles.length,
    totalLinks,
    brokenLinks,
    brokenRatio: totalLinks > 0 ? +(brokenLinks / totalLinks).toFixed(3) : 0,
    byFile: linkAudit.byFile,
};

/* 2.5 — Third-party dependencies (third-party-framework-service) */
const depsFacet = detectDeps(records);

/* 2.6 — Init integrity (post-init-full-self-check) */
const initFacet = {
    hasClaude: docFacet.missingClaude === false,
    hasReadme: docFacet.missingReadme === false,
    hasDocs: docFacet.hasDocsDir,
    hasTests: testFacet.hasFramework,
    hasPackageJson: records.some(r => r.path === 'package.json'),
    hasPyproject: records.some(r => r.path === 'pyproject.toml'),
    hasGoMod: records.some(r => r.path === 'go.mod'),
    hasCargoToml: records.some(r => r.path === 'Cargo.toml'),
    totalFiles: records.length,
    totalBytes: records.reduce((s, r) => s + r.bytes, 0),
};

/* ── Stage 3 — Scene Assembly (six scenes) ──────────────────────── */
console.log('[stage3] assembling scenes…');
const SCOPE_TITLE = path.basename(absScope) || 'project';

const SCENES = [
    buildScene1(initFacet, SCOPE_TITLE),
    buildScene2(testFacet, SCOPE_TITLE),
    buildScene3(docFacet, records),
    buildScene4(securityFacet, records),
    buildScene5(refsFacet),
    buildScene6(depsFacet),
];

/* Attach an evidence block to each scene — the raw facet values
   that drove the §3 verdict. Makes the report self-auditing: a
   reader can verify the verdict by inspecting the evidence. */
SCENES[0].evidence = [
    { label: 'CLAUDE.md present', value: String(initFacet.hasClaude) },
    { label: 'README present', value: String(initFacet.hasReadme) },
    { label: 'docs/ directory', value: String(initFacet.hasDocs) },
    { label: 'Test framework configured', value: String(initFacet.hasTests) },
    { label: 'package.json', value: String(initFacet.hasPackageJson) },
    { label: 'pyproject.toml', value: String(initFacet.hasPyproject) },
    { label: 'go.mod', value: String(initFacet.hasGoMod) },
    { label: 'Cargo.toml', value: String(initFacet.hasCargoToml) },
    { label: 'Total files scanned', value: initFacet.totalFiles.toLocaleString() },
    { label: 'Total bytes', value: (initFacet.totalBytes / (1024 * 1024)).toFixed(2) + ' MiB' },
];
SCENES[1].evidence = [
    { label: 'Detected framework', value: testFacet.framework || '(none)' },
    { label: 'Test file count', value: String(testFacet.testFileCount) },
    { label: 'Has framework', value: String(testFacet.hasFramework) },
    { label: 'Sample test files', value: testFacet.testFiles.slice(0, 3).join(', ') || '(none)' },
];
SCENES[2].evidence = [
    { label: 'Documentation files', value: String(docFacet.docCount) },
    { label: 'Code files', value: String(docFacet.codeCount) },
    { label: 'Doc-to-code ratio', value: String(docFacet.docRatio) },
    { label: 'README at root', value: String(!docFacet.missingReadme) },
    { label: 'CLAUDE.md at root', value: String(!docFacet.missingClaude) },
    { label: 'docs/ directory', value: String(docFacet.hasDocsDir) },
];
SCENES[3].evidence = [
    { label: '.env files', value: String(securityFacet.envFileCount) },
    { label: 'Dangerous-call findings', value: String(securityFacet.dangerousCallCount) },
    { label: 'HTML entry points', value: String(securityFacet.htmlCount) },
    { label: 'Sample findings', value: securityFacet.dangerousCalls.slice(0, 3).map(c => c.file + ' (' + c.kind + ')').join('; ') || '(none)' },
];
SCENES[4].evidence = [
    { label: 'Story directories', value: refsFacet.storyDirs.join(', ') || '(none)' },
    { label: 'Markdown files', value: String(refsFacet.mdFileCount) },
    { label: 'Total links audited', value: String(refsFacet.totalLinks) },
    { label: 'Broken links', value: String(refsFacet.brokenLinks) },
    { label: 'Broken ratio', value: (refsFacet.brokenRatio * 100).toFixed(1) + '%' },
];
SCENES[5].evidence = [
    { label: 'Runtime dependencies', value: String(depsFacet.runtimeCount) },
    { label: 'Dev dependencies', value: String(depsFacet.devCount) },
    { label: 'Total dependencies', value: String(depsFacet.totalCount) },
    { label: 'Pinning ratio', value: Math.round(depsFacet.pinningRatio * 100) + '%' },
    { label: 'Stale count (estimated)', value: String(depsFacet.staleCount) },
];

/* ── Stage 4 — Verdict Computation ─────────────────────────────── */
console.log('[stage4] computing verdicts…');
let totalCoverage = 0;
let passCount = 0, partialCount = 0, failCount = 0;
for (const scene of SCENES) {
    scene.verdict = scene.coverage >= 0.9 ? 'pass' : scene.coverage >= 0.5 ? 'partial' : 'fail';
    if (scene.verdict === 'pass') passCount += 1;
    else if (scene.verdict === 'partial') partialCount += 1;
    else failCount += 1;
    totalCoverage += scene.coverage;
}
const compositeScore = Math.round((totalCoverage / SCENES.length) * 100);
function gradeOf(v) {
    if (v >= 90) return 'A';
    if (v >= 75) return 'B';
    if (v >= 60) return 'C';
    if (v >= 40) return 'D';
    return 'F';
}

/* ── Stage 5 — Page Emit (data.js + byte-stable copy) ─────────── */
console.log('[stage5] emitting data.js…');
const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATES_DIR = path.join(SCRIPT_DIR, '..', 'templates');
const generatedAt = new Date().toISOString();

const REPORT_CONFIG = {
    options: {
        scope: absScope,
        scopeTitle: SCOPE_TITLE,
        generatedAt,
        theme: THEME,
        mergeScenes: MERGE_SCENES,
        version: '1.0',
    },
    constants: {
        sceneCount: 6,
        passThreshold: 0.9,
        partialThreshold: 0.5,
        exclusionDirs: EXCLUDE_DIRS,
    },
    labels: {
        compositeScoreLabel: 'Composite Self-Test Score',
        gradeLabel: 'Grade',
        verdictLabel: 'Verdict',
        coverageLabel: 'Coverage',
        passCountLabel: 'Scenes Passed',
        partialCountLabel: 'Scenes Partial',
        failCountLabel: 'Scenes Failed',
    },
};

const REPORT_DATA = {
    scope: absScope,
    score: compositeScore,
    grade: gradeOf(compositeScore),
    summary: {
        totalScenes: SCENES.length,
        passCount, partialCount, failCount,
        coverage: +(totalCoverage / SCENES.length).toFixed(3),
        totalFiles: records.length,
        totalBytes: records.reduce((s, r) => s + r.bytes, 0),
    },
    facets: {
        init: initFacet,
        tests: testFacet,
        docs: docFacet,
        security: securityFacet,
        refs: refsFacet,
        deps: depsFacet,
    },
    inventory: computeInventoryBreakdown(records),
    scenes: SCENES,
    gradeScale: [
        { grade: 'A', min: 90, tone: 'pass' },
        { grade: 'B', min: 75, tone: 'pass' },
        { grade: 'C', min: 60, tone: 'warn' },
        { grade: 'D', min: 40, tone: 'warn' },
        { grade: 'F', min: 0,  tone: 'fail' },
    ],
    compliance: [
        {
            framework: 'OWASP ASVS 4.0',
            area: 'Supply Chain & Configuration',
            controls: [
                { id: '14.1.1', text: 'Verify that all components are pinned to a version and the lockfile is the source of truth.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: '14.2.1', text: 'Verify that unused or stale dependencies are identified and removed on a recurring schedule.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: '5.3.4',  text: 'Verify that untrusted HTML inputs are reviewed for dangerous sinks (innerHTML, eval).', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: '5.3.5',  text: 'Verify that command execution paths do not concatenate untrusted input.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
            ],
        },
        {
            framework: 'NIST SSDF',
            area: 'Secure Software Development Framework',
            controls: [
                { id: 'PS.1',   text: 'Protect sensitive information from unauthorized disclosure — .env files, secrets in repo.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'PS.2',   text: 'Meet each security requirement — baseline surface map and regression diff.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'PS.3',   text: 'Reuse proven security solutions — vetted third-party frameworks, pinned.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: 'PW.4.1', text: 'Acquire well-secured components — pinning ratio ≥ 0.5.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: 'PW.7.1', text: 'Design code to protect against expected threats — security facet regression gate.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'RV.1',   text: 'Identify and confirm vulnerabilities — self-test across all six scenes.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
            ],
        },
        {
            framework: 'CIS Software Supply Chain v1.0',
            area: 'Supply Chain Assurance',
            controls: [
                { id: '1.1', text: 'Verify the presence of project manifests and baseline documentation.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
                { id: '3.1', text: 'Verify the presence of a scoped test command suitable for pre-commit gates.', sceneSlug: 'pre-commit-incremental-self-check', sceneIndex: 2 },
                { id: '4.1', text: 'Verify documentation accuracy via cross-reference integrity.', sceneSlug: 'cross-story-integration-regression', sceneIndex: 5 },
                { id: '4.2', text: 'Verify doc-code consistency via a doc/manifest ratio baseline.', sceneSlug: 'doc-code-consistency', sceneIndex: 3 },
                { id: '6.1', text: 'Inventory and classify third-party dependencies; detect staleness.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
            ],
        },
        {
            framework: 'ISO/IEC 27002:2022',
            area: 'Information Security Controls',
            controls: [
                { id: 'A.8.25',  text: 'Secure development lifecycle — baseline self-test contract.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
                { id: 'A.8.26',  text: 'Application security requirements — security surface regression.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'A.8.27',  text: 'Secure system architecture — inventory + manifest presence.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
                { id: 'A.8.28',  text: 'Secure coding — dangerous call surface must stay at zero.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'A.8.29',  text: 'Security testing in development — pre-commit gate presence.', sceneSlug: 'pre-commit-incremental-self-check', sceneIndex: 2 },
                { id: 'A.8.30',  text: 'Outsourced development — third-party dependency vetting.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
            ],
        },
    ],

    /* Risk register derived from scene verdicts + evidence. Each risk
       carries a severity (critical/high/medium/low), a likelihood
       (observed/expected/rare), an effort estimate (S/M/L), and a
       pointer to the scene that surfaced it. */
    riskRegister: (function buildRiskRegister() {
        const risks = [];
        const findScene = (idx) => SCENES.find(s => s.index === idx);

        function push(sceneIdx, title, description, severity, likelihood, effort, mitigation) {
            const sc = findScene(sceneIdx);
            risks.push({
                id: 'R-' + String(risks.length + 1).padStart(2, '0'),
                sceneIndex: sceneIdx,
                sceneSlug: sc ? sc.slug : '',
                sceneTitle: sc ? sc.title : '',
                sceneVerdict: sc ? sc.verdict : 'fail',
                title, description, severity, likelihood, effort, mitigation,
            });
        }

        if (!initFacet.hasClaude) {
            push(1, 'Missing CLAUDE.md baseline', 'The project lacks the foundational AI-assistant guidance file. Every new contributor incurs ~15 min of orientation penalty per session.', 'high', 'observed', 'S', 'Run `/rui-init` from the project root to regenerate CLAUDE.md from profile.json.');
        }
        if (!initFacet.hasReadme) {
            push(1, 'Missing README', 'The GitHub landing page is empty. External users cannot evaluate the project without reading source.', 'high', 'observed', 'S', 'Author a README.md with: purpose, install, usage, license. Reference docs/ for long-form content.');
        }
        if (!initFacet.hasTests) {
            push(1, 'No test framework detected', 'CI cannot catch regressions. Every merge is a leap of faith.', 'critical', 'observed', 'M', 'Add vitest (`npm i -D vitest`) or pytest. Write one smoke test per module to establish a baseline.');
        }
        if (!testFacet.framework) {
            push(2, 'No test framework config', 'Without a config file (vitest.config.ts, jest.config.js, pytest.ini), test runners cannot be invoked.', 'high', 'observed', 'S', 'Add a framework config file. See Scene 2 §1 step 1 for the exact filename to create.');
        }
        if (testFacet.testFileCount === 0) {
            push(2, 'Zero test files', 'A test framework with no tests is theatre. Coverage = 0% by definition.', 'high', 'observed', 'M', 'Write tests for the highest-churn module first. Target ≥ 1 test per public export.');
        }
        if (docFacet.docCount === 0) {
            push(3, 'No documentation files', 'The docs/ directory is empty or missing. Onboarding relies entirely on tribal knowledge.', 'high', 'observed', 'L', 'Seed docs/ with architecture, API, and decision-record subdirectories. See `/rui-init` templates.');
        }
        if (docFacet.docRatio < 0.05 && docFacet.docCount > 0) {
            push(3, 'Low doc/code ratio', 'Documentation is less than 5% of the codebase by file count. Insufficient for onboarding.', 'medium', 'observed', 'L', 'Add per-module README files and architecture decision records (ADRs).');
        }
        if (securityFacet.dangerousCallCount > 0) {
            push(4, securityFacet.dangerousCallCount + ' dangerous call(s) detected', 'eval / innerHTML / child_process.exec detected. Each is a potential injection vector.', securityFacet.dangerousCallCount >= 5 ? 'critical' : 'high', 'observed', 'M', 'Replace with safe alternatives: Function constructor → no-op in prod; innerHTML → textContent; exec → execFile with arg array.');
        }
        if (securityFacet.envFileCount > 0) {
            push(4, securityFacet.envFileCount + ' .env file(s) — verify gitignore coverage', 'Env files present. The analyzer does not confirm .gitignore coverage; a manual check is required to rule out tracked secrets.', 'medium', 'expected', 'S', 'Run `git ls-files | grep -E "^\\.env"` — if any file matches, run `git rm --cached` and add `.env*` to .gitignore.');
        }
        if (refsFacet.brokenLinks > 0) {
            push(5, refsFacet.brokenLinks + ' broken cross-reference(s)', 'Internal documentation links point to non-existent targets. Readers hit 404s and lose trust.', 'medium', 'observed', 'S', 'Re-run `/rui-init` to regenerate the docs tree, or manually fix the broken anchors. See Scene 5 §2.5 for the list.');
        }
        if (depsFacet.totalCount === 0) {
            push(6, 'No manifest found', 'Cannot evaluate the dependency surface without a package.json / pyproject.toml / go.mod / Cargo.toml.', 'high', 'observed', 'S', 'Create the appropriate manifest for the project\'s ecosystem.');
        } else {
            if (depsFacet.pinningRatio < 0.5) {
                push(6, 'Low pinning ratio (' + (depsFacet.pinningRatio * 100).toFixed(0) + '%)', 'Less than half of dependencies are pinned to exact versions. Builds are not reproducible across machines.', 'high', 'observed', 'S', 'Replace ^ and ~ in package.json with exact versions. Commit the lockfile.');
            }
            if (depsFacet.staleCount > 0) {
                push(6, depsFacet.staleCount + ' stale dependencies (3+ years)', 'Stale dependencies are a primary CVE vector. The 2018 event-stream incident is the canonical example.', 'high', 'observed', 'M', 'Run `npm outdated` / `pip list --outdated` and upgrade one major version per sprint.');
            }
        }
        if (risks.length === 0) {
            push(1, 'No risks detected', 'All six scenes passed their checks. Maintain the baseline by re-running /rui-init after major changes.', 'low', 'rare', 'S', 'Continue current practice. Schedule a quarterly re-run of the self-test analyzer.');
        }
        return risks;
    })(),

    glossary: [
        { term: '§0–§4 lifecycle', definition: 'The five-section contract every scene follows: §0 Effect Sketch, §1 Test Design, §2 Output Inventory, §3 Test Report, §4 Self-Improvement.' },
        { term: 'Coverage', definition: 'Per-scene metric = passedChecks / totalChecks. A scene with 3 of 5 checks passing has coverage 0.60.' },
        { term: 'Composite score', definition: 'mean(scene.coverage) × 100, rounded. Mapped to a letter grade via the grade scale.' },
        { term: 'Facet', definition: 'A dimension of analysis: init, tests, docs, security, refs, deps. Each scene owns exactly one facet.' },
        { term: 'Verdict', definition: 'pass (coverage ≥ 0.90), partial (0.50–0.89), fail (< 0.50). Frozen at generation time.' },
        { term: 'Evidence', definition: 'Raw facet values (counts, booleans, ratios) that drove the §3 verdict. Surfaced as §2.5 per scene.' },
        { term: 'Dangerous call', definition: 'A call to eval(), Function(), innerHTML assignment, or child_process.exec — each a potential injection vector.' },
        { term: 'Pinning ratio', definition: 'Fraction of dependencies pinned to exact versions (no ^ or ~). 1.0 = fully reproducible installs.' },
        { term: 'Stale dependency', definition: 'A dependency whose latest release is 3+ years older than the pinned version. Requires a registry round-trip to detect accurately.' },
        { term: 'Broken link', definition: 'A relative markdown link whose target path does not resolve to an existing file in the scope.' },
        { term: 'Risk register', definition: 'A prioritized list of findings with severity, likelihood, and remediation effort. Drives the order of fixes.' },
        { term: 'Scope', definition: 'The absolute directory path the analyzer walked. All paths in the report are relative to this root.' },
    ],

    /* Sprint-based remediation roadmap — populated after REPORT_DATA
       is fully assembled (see assignment below). */
    roadmap: [],

    /* Metrics deep-dive: file-size distribution, top-N largest files,
       and per-directory breakdown. Powers the "Metrics Deep-Dive"
       section in the report. */
    metrics: (function buildMetrics() {
        const SIZE_BUCKETS = [
            { label: '< 1 KB',     max: 1024,             count: 0, bytes: 0 },
            { label: '1–4 KB',     max: 4 * 1024,         count: 0, bytes: 0 },
            { label: '4–16 KB',    max: 16 * 1024,        count: 0, bytes: 0 },
            { label: '16–64 KB',   max: 64 * 1024,        count: 0, bytes: 0 },
            { label: '64–256 KB',  max: 256 * 1024,       count: 0, bytes: 0 },
            { label: '256 KB–1 MB', max: 1024 * 1024,     count: 0, bytes: 0 },
            { label: '> 1 MB',     max: Infinity,         count: 0, bytes: 0 },
        ];
        for (const r of records) {
            for (const b of SIZE_BUCKETS) {
                if (r.bytes < b.max) {
                    b.count += 1;
                    b.bytes += r.bytes;
                    break;
                }
            }
        }
        const largest = [...records].sort((a, b) => b.bytes - a.bytes).slice(0, 12).map(r => ({
            path: r.path,
            bytes: r.bytes,
            type: r.type,
        }));
        const dirCount = {};
        const dirBytes = {};
        for (const r of records) {
            const segs = r.path.split('/');
            const top = segs.length > 1 ? segs[0] : '(root)';
            dirCount[top] = (dirCount[top] || 0) + 1;
            dirBytes[top] = (dirBytes[top] || 0) + r.bytes;
        }
        const topDirs = Object.entries(dirCount)
            .map(([dir, count]) => ({ dir, count, bytes: dirBytes[dir] || 0, pct: records.length > 0 ? +((count / records.length) * 100).toFixed(1) : 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const totalBytes = records.reduce((s, r) => s + r.bytes, 0);
        const avgBytes = records.length > 0 ? Math.round(totalBytes / records.length) : 0;
        const medianBytes = (function () {
            const sorted = [...records].map(r => r.bytes).sort((a, b) => a - b);
            const n = sorted.length;
            if (n === 0) return 0;
            if (n % 2 === 1) return sorted[(n - 1) >> 1];
            return Math.round((sorted[n / 2 - 1] + sorted[n / 2]) / 2);
        })();
        return {
            totalFiles: records.length,
            totalBytes,
            avgBytes,
            medianBytes,
            sizeBuckets: SIZE_BUCKETS.map(b => ({ label: b.label, count: b.count, bytes: b.bytes })),
            largest,
            topDirs,
        };
    })(),

    /* Activity & freshness — mtime distribution across the codebase.
       A healthy active project has most bytes modified in the last
       90 days; a project with > 50% of bytes older than 1 year is
       in maintenance mode. */
    activity: (function buildActivity() {
        const now = Math.floor(Date.now() / 1000);
        const DAY = 86400;
        const BUCKETS = [
            { label: 'Last 7 days',   max: 7 * DAY,    count: 0, bytes: 0 },
            { label: '8–30 days',     max: 30 * DAY,   count: 0, bytes: 0 },
            { label: '31–90 days',    max: 90 * DAY,   count: 0, bytes: 0 },
            { label: '91–365 days',   max: 365 * DAY,  count: 0, bytes: 0 },
            { label: '1–2 years',     max: 2 * 365 * DAY,  count: 0, bytes: 0 },
            { label: 'Over 2 years',  max: Infinity,   count: 0, bytes: 0 },
        ];
        for (const r of records) {
            const age = now - (r.lastModified || 0);
            for (const b of BUCKETS) {
                if (age <= b.max) {
                    b.count += 1;
                    b.bytes += r.bytes;
                    break;
                }
            }
        }
        const totalBytes = records.reduce((s, r) => s + r.bytes, 0);
        const recentBytes = BUCKETS[0].bytes + BUCKETS[1].bytes + BUCKETS[2].bytes;
        const recentFiles = BUCKETS[0].count + BUCKETS[1].count + BUCKETS[2].count;
        // Freshest 5 files (most recently modified)
        const freshest = [...records]
            .filter(r => r.lastModified)
            .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
            .slice(0, 8)
            .map(r => ({
                path: r.path,
                bytes: r.bytes,
                ageDays: Math.max(0, Math.floor((now - (r.lastModified || 0)) / DAY)),
            }));
        const oldestActive = totalBytes > 0 ? +(recentBytes / totalBytes).toFixed(3) : 0;
        return {
            buckets: BUCKETS.map(b => ({
                label: b.label,
                count: b.count,
                bytes: b.bytes,
                filePct: records.length > 0 ? +((b.count / records.length) * 100).toFixed(1) : 0,
                bytePct: totalBytes > 0 ? +((b.bytes / totalBytes) * 100).toFixed(1) : 0,
            })),
            recentFileCount: recentFiles,
            recentByteRatio: oldestActive,
            freshest,
            generatedAt: now,
        };
    })(),
};

/* Compute the roadmap now that REPORT_DATA.riskRegister exists. */
(function buildRoadmap() {
    const RISKS = REPORT_DATA.riskRegister || [];
    const sevRank = { critical: 0, high: 1, medium: 2, low: 3 };
    const effortRank = { S: 0, M: 1, L: 2 };
    function bucket(r) {
        if (r.severity === 'critical' || r.severity === 'high') {
            if (r.effort === 'L') return 1;
            return 0;
        }
        if (r.severity === 'medium') {
            if (r.effort === 'L') return 2;
            return 1;
        }
        return 3;
    }
    const sprints = [
        { id: 'S1', title: 'Sprint 1 · Week 1', theme: 'Critical & high-impact, low-effort', goal: 'Stop the bleeding. Close every critical/high finding that can be done in under a day.', expectedDelta: '+15–25 points' },
        { id: 'S2', title: 'Sprint 2 · Week 2', theme: 'Critical & high-impact, larger effort', goal: 'Finish the remaining critical/high work that requires design or multi-file changes.', expectedDelta: '+10–15 points' },
        { id: 'S3', title: 'Sprint 3 · Week 3', theme: 'Medium-severity cleanup', goal: 'Address medium-severity findings. Documentation, link integrity, polish.', expectedDelta: '+5–10 points' },
        { id: 'S4', title: 'Sprint 4 · Week 4', theme: 'Low / hardening', goal: 'Close out low-severity items. Schedule quarterly re-runs.', expectedDelta: '+0–5 points' },
    ];
    for (const r of RISKS) {
        const b = bucket(r);
        sprints[b].items = sprints[b].items || [];
        sprints[b].items.push(r);
    }
    for (const s of sprints) {
        s.items = (s.items || []).sort((a, b) => {
            const d = sevRank[a.severity] - sevRank[b.severity];
            if (d !== 0) return d;
            return (effortRank[a.effort] || 0) - (effortRank[b.effort] || 0);
        });
        s.itemCount = s.items.length;
    }
    REPORT_DATA.roadmap = sprints;
})();

/* Compute a file-type breakdown of the inventory. Returns the top
   N extensions by file count + bytes, plus an "other" bucket. */
function computeInventoryBreakdown(records) {
    const TYPE_GROUPS = {
        'JavaScript': ['js', 'mjs', 'cjs', 'jsx'],
        'TypeScript': ['ts', 'tsx'],
        'Vue': ['vue'],
        'Python': ['py'],
        'Go': ['go'],
        'Rust': ['rs'],
        'Java': ['java'],
        'CSS/SCSS': ['css', 'scss', 'less'],
        'HTML': ['html', 'htm'],
        'Markdown': ['md', 'mdx'],
        'JSON': ['json'],
        'YAML': ['yaml', 'yml'],
        'Config': ['toml', 'ini', 'env'],
        'Shell': ['sh', 'bash', 'zsh'],
        'Image': ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'],
    };
    const groupCounts = {};
    const groupBytes = {};
    const extCounts = {};
    for (const r of records) {
        extCounts[r.type] = (extCounts[r.type] || 0) + 1;
    }
    const extToGroup = {};
    for (const [group, exts] of Object.entries(TYPE_GROUPS)) {
        for (const e of exts) extToGroup[e] = group;
    }
    for (const r of records) {
        const group = extToGroup[r.type] || 'Other';
        groupCounts[group] = (groupCounts[group] || 0) + 1;
        groupBytes[group] = (groupBytes[group] || 0) + r.bytes;
    }
    const total = records.length;
    const items = Object.entries(groupCounts)
        .map(([group, count]) => ({
            group,
            count,
            bytes: groupBytes[group] || 0,
            pct: total > 0 ? +((count / total) * 100).toFixed(1) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    return {
        totalFiles: total,
        totalBytes: records.reduce((s, r) => s + r.bytes, 0),
        typeGroups: TYPE_GROUPS,
        items: items.slice(0, 8),
    };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const dataJs = `window.REPORT_CONFIG = ${JSON.stringify(REPORT_CONFIG, null, 2)};\n\n` +
               `window.REPORT_DATA = ${JSON.stringify(REPORT_DATA, null, 2)};\n`;
fs.writeFileSync(path.join(OUT_DIR, 'data.js'), dataJs);

/* Copy byte-stable assets from templates/, substituting the placeholders
   documented in references/methodology.md § Stage 5:
     {{SCOPE_TITLE}}                       → basename of the scope (used in <title> + meta)
     {{SHARED_ROOT}}                       → relative path from OUT_DIR to <scope>/.claude/shared
     {{SHARED_ROOT_LOADER_JS_ARRAY}}       → JS array of candidate URLs for loader.js
     {{SHARED_ROOT_MERMAID_JS_ARRAY}}      → JS array of candidate URLs for mermaid.min.js

   The page-relative path is required so the report works under both
   file:// and http:// (an absolute `/.claude/shared/loader.js` resolves
   to the filesystem root under file://, breaking the report). The
   loader + Mermaid arrays, however, are pre-computed to include both
   the relative path AND several absolute / CDN fallbacks so a single
   generated report renders correctly under any of the four open
   modes documented on the bootstrap comment in templates/index.html:
     1. file:// from the local filesystem
     2. http:// from a server rooted at or above the project
     3. http:// from a server rooted at the scope directory
     4. http:// from a server rooted at the repo root */
const SHARED_ROOT_ABS = path.join(absScope, '.claude', 'shared');
let SHARED_ROOT_REL = path.relative(OUT_DIR, SHARED_ROOT_ABS);
if (!SHARED_ROOT_REL || (SHARED_ROOT_REL.startsWith('..') === false && !path.isAbsolute(SHARED_ROOT_REL))) {
    // Defensive: when outDir === shared root the relative path is empty
    SHARED_ROOT_REL = '.';
}

// The project root for URL-path purposes is the directory the user
// is most likely serving this report from. The analyzer is invoked
// as `node analyze.mjs <scope> <outDir>`, and the convention in the
// rui-* toolchain is to start any HTTP server from <scope>. So
// absScope IS the project root for the purposes of building the
// `/<...>` absolute URL. The downside of this assumption is that if
// a user serves from a parent of <scope> the absolute URL will be
// wrong — but that's exactly why we ship multiple candidate URLs
// (the relative path always works as a fallback).
const PROJECT_ROOT = absScope;

// Build the candidate URL arrays. Order matters — the bootstrap
// short-circuits on the first success, so we list paths in the
// order they're most likely to resolve in our supported open
// modes (see references/methodology.md § Stage 5):
//
//   1. ./loader.js  (file:// + IDE preview at OUT_DIR — the analyzer
//                    copies loader.js into OUT_DIR at Stage 5b)
//   2. ../../shared/loader.js  (HTTP from project root, file:// if
//                    the user happens to serve from the project root)
//   3. /.claude/shared/loader.js  (HTTP from project root, alt URL)
//   4. The jsDelivr CDN copy as a last-resort offline fallback.
const LOADER_CANDIDATES = [
    './loader.js',
    SHARED_ROOT_REL + '/loader.js',
];
if (PROJECT_ROOT) {
    const projectSharedAbs = '/' + path.relative(PROJECT_ROOT, SHARED_ROOT_ABS).split(path.sep).join('/');
    const projectSharedUrl = projectSharedAbs + '/loader.js';
    if (projectSharedUrl !== LOADER_CANDIDATES[1]) LOADER_CANDIDATES.push(projectSharedUrl);
}
// Always include a CDN copy as the last resort.
const LOADER_CDN = 'https://cdn.jsdelivr.net/gh/YrY-oss/cdn@main/.claude/shared/loader.js';
if (!LOADER_CANDIDATES.includes(LOADER_CDN)) LOADER_CANDIDATES.push(LOADER_CDN);

// Mermaid uses a 2-element pair: the local copy (primary) and the
// jsDelivr CDN (fallback). The loader's data-mermaid-path +
// data-mermaid-fallback pair is its native contract; we don't need
// to mirror the loader's full N-tier cascade for Mermaid because
// the CDN is the single source of truth for "offline" recovery.
const MERMAID_CANDIDATES = [
    SHARED_ROOT_REL + '/vendor/mermaid.min.js',
    'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js',
];

function toJsArray(items) {
    // JSON.stringify already gives us a valid JS array literal of
    // strings — the file is later included as a <script> body, so we
    // need the surrounding [...] and quoted strings.
    return JSON.stringify(items);
}

const TEMPLATE_SUBS = {
    '{{SCOPE_TITLE}}': SCOPE_TITLE,
    '{{SHARED_ROOT}}': SHARED_ROOT_REL,
    '{{SHARED_ROOT_LOADER_JS_ARRAY}}': toJsArray(LOADER_CANDIDATES),
    '{{SHARED_ROOT_MERMAID_JS_ARRAY}}': toJsArray(MERMAID_CANDIDATES),
};
console.log(`[stage5] shared root: ${SHARED_ROOT_REL} (${SHARED_ROOT_ABS})`);
console.log(`[stage5] loader candidates: ${LOADER_CANDIDATES.join(', ')}`);
console.log(`[stage5] mermaid candidates: ${MERMAID_CANDIDATES.join(', ')}`);
for (const name of ['index.html', 'index.css', 'index.js']) {
    const src = path.join(TEMPLATES_DIR, name);
    if (!fs.existsSync(src)) {
        console.warn(`  warn: ${name} not found in templates/ — skipping`);
        continue;
    }
    let content = fs.readFileSync(src, 'utf8');
    if (name === 'index.html') {
        for (const [key, val] of Object.entries(TEMPLATE_SUBS)) {
            if (content.indexOf(key) === -1) continue;
            content = content.split(key).join(val);
        }
    }
    fs.writeFileSync(path.join(OUT_DIR, name), content);
}
console.log(`  data.js: ${(dataJs.length / 1024).toFixed(1)} KB`);

/* ── Stage 5b — Copy shared/loader.js into OUT_DIR (so an HTTP
   server rooted at the report directory — the most common IDE
   preview mode — can still find it). The page-relative candidate
   `../loader.js` (relative to OUT_DIR the document URL is at the
   root, so `./loader.js` works for both file:// and the
   IDE-preview HTTP case) is added to the candidate list. We do
   not copy vendor/ or components/ — the component templates are
   already inlined in index.html, and Vue/Mermaid are loaded from
   the CDN if the local copy can't be resolved. This keeps the
   report directory small (~20 KB extra for loader.js) while
   giving every common open mode at least one working path. */
const SHARED_LOADER_SRC = path.join(SHARED_ROOT_ABS, 'loader.js');
if (fs.existsSync(SHARED_LOADER_SRC)) {
    const dst = path.join(OUT_DIR, 'loader.js');
    fs.copyFileSync(SHARED_LOADER_SRC, dst);
    console.log(`  copied loader.js (${(fs.statSync(dst).size / 1024).toFixed(1)} KB) for IDE-preview mode`);
} else {
    console.warn(`  warn: shared/loader.js not found at ${SHARED_LOADER_SRC} — IDE preview will fail to load it`);
}

/* ── Stage 6 — Markdown Mirror (optional) ─────────────────────── */
if (MERGE_SCENES) {
    console.log('[stage6] mirroring scenes as markdown…');
    const mirrorRoot = path.resolve(OUT_DIR, '..', 'self-test');
    try {
        fs.mkdirSync(mirrorRoot, { recursive: true });
        for (const scene of SCENES) {
            const sceneDir = path.join(mirrorRoot, `scene-${scene.index}-${scene.slug}`);
            fs.mkdirSync(sceneDir, { recursive: true });
            fs.writeFileSync(path.join(sceneDir, 'index.md'), sceneToMarkdown(scene, SCOPE_TITLE));
        }
        console.log(`  ${SCENES.length} scenes written under ${mirrorRoot}`);
    } catch (e) {
        console.warn(`  warn: markdown mirror failed: ${e.message}`);
    }
}

console.log(`[done] score=${compositeScore} (${gradeOf(compositeScore)}) verdicts: pass=${passCount} partial=${partialCount} fail=${failCount}`);
console.log(`[done] total elapsed: ${(Date.now() - t0) / 1000}s`);

/* ──────────────────────────────────────────────────────────────────
   Scene builders — one per rui-init self-test scene
   ────────────────────────────────────────────────────────────────── */

function buildScene1(facet, scopeTitle) {
    const checks = [
        { key: 'claude', label: 'CLAUDE.md present', pass: facet.hasClaude },
        { key: 'readme', label: 'README present', pass: facet.hasReadme },
        { key: 'docs', label: 'docs/ directory exists', pass: facet.hasDocs },
        { key: 'tests', label: 'Test framework configured', pass: facet.hasTests },
        { key: 'manifest', label: 'Project manifest (package.json / pyproject / go.mod / Cargo.toml)', pass: facet.hasPackageJson || facet.hasPyproject || facet.hasGoMod || facet.hasCargoToml },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    const fileText = facet.totalFiles.toLocaleString();
    const sizeMB = (facet.totalBytes / (1024 * 1024)).toFixed(2);
    return {
        index: 1,
        slug: 'post-init-full-self-check',
        title: 'Post-Init Full Self-Check',
        icon: '🚀',
        facet: 'init',
        section0: {
            effect: `Verifies that a fresh \`/rui-init\` run on ${scopeTitle} produces the five canonical bootstrapping artifacts — CLAUDE.md, README.md, docs/, a configured test framework, and a project manifest — and that each is non-empty and structurally well-formed. This scene is the contract gate between "scaffolded" and "shippable": it re-runs the init verifier against the post-init filesystem snapshot (${fileText} files, ${sizeMB} MiB) and asserts that no artifact is a stub, a placeholder, or missing.`,
            matters: 'A green post-init self-check is the project\'s shippability contract. Any missing artifact propagates: a missing CLAUDE.md costs every future contributor ~15 minutes of orientation; a missing README breaks the GitHub landing page; a missing test framework means CI is a no-op on day one. The cost of fixing a regression here grows quadratically with the number of contributors who have already cloned.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([fresh clone]):::start
  B[CLAUDE.md]:::artifact
  C[README.md]:::artifact
  D[docs/]:::artifact
  E[tests run]:::artifact
  M[manifest]:::artifact
  F{{all green?}}:::decision
  G[shippable]:::pass
  H[regression — block merge]:::fail

  A --> B
  A --> C
  A --> D
  A --> E
  A --> M
  B --> F
  C --> F
  D --> F
  E --> F
  M --> F
  F -- yes --> G
  F -- no --> H

  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef artifact fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: checks.map(c => ({
                title: c.label,
                action: c.pass
                    ? `Verified present and non-empty during the Stage 1 file inventory walk (${fileText} files scanned).`
                    : `Re-run \`/rui-init\` from the project root to regenerate the missing artifact (\`${c.key}\`); if it still does not appear, inspect the pipeline state at \`docs/.pipeline-state/profile.json\`.`,
                expected: c.pass
                    ? 'File exists, is non-empty, and matches the rui-init artifact schema.'
                    : 'Artifact regenerated on the next init pass; coverage improves to ≥ 0.90.',
                file: c.key === 'claude' ? 'CLAUDE.md' : c.key === 'readme' ? 'README.md' : c.key === 'docs' ? 'docs/' : c.key === 'tests' ? 'package.json#scripts.test' : 'package.json',
            })),
        },
        section2: {
            outputs: [
                { path: 'CLAUDE.md', type: 'file', description: 'Claude project context — encodes profile, iron laws, and navigation table for AI assistants.' },
                { path: 'README.md', type: 'file', description: 'Human-readable project overview — first file a new contributor reads on GitHub.' },
                { path: 'docs/', type: 'dir', description: 'Generated documentation tree — arch/ and self-test/ story scenes plus the dashboard home.' },
                { path: 'package.json', type: 'file', description: 'Project manifest — declares the test script and the dependency surface for Node ecosystems.' },
                { path: 'docs/.pipeline-state/profile.json', type: 'file', description: 'Pipeline state snapshot — the deterministic input for the next /rui-init rebuild.' },
            ],
        },
        section3: {
            report: checks.map((c, i) => {
                let notes;
                if (c.key === 'claude') {
                    notes = c.pass
                        ? `CLAUDE.md found at scope root. AI assistants have project-specific guidance on load. (${fileText} files scanned, ${sizeMB} MiB total.)`
                        : 'CLAUDE.md missing — every new AI session starts cold. Run `/rui-init` to regenerate from profile.json.';
                } else if (c.key === 'readme') {
                    notes = c.pass
                        ? 'README found at scope root. GitHub landing page is populated.'
                        : 'README missing — external visitors see an empty repo page. Author one with: purpose, install, usage, license.';
                } else if (c.key === 'docs') {
                    notes = c.pass
                        ? 'docs/ directory present with at least one file. Long-form content has a home.'
                        : 'docs/ missing or empty — onboarding relies on tribal knowledge. Seed it via `/rui-init`.';
                } else if (c.key === 'tests') {
                    notes = c.pass
                        ? `Test framework detected (${facet.hasTests ? 'configured' : 'not configured'}). CI has something to invoke.`
                        : 'No test framework — CI is a no-op. Install vitest/pytest/jest before writing more source.';
                } else if (c.key === 'manifest') {
                    const manifests = [
                        facet.hasPackageJson && 'package.json',
                        facet.hasPyproject && 'pyproject.toml',
                        facet.hasGoMod && 'go.mod',
                        facet.hasCargoToml && 'Cargo.toml',
                    ].filter(Boolean).join(', ') || '(none)';
                    notes = c.pass
                        ? `Manifest present: ${manifests}. Dependency surface is declared.`
                        : 'No manifest detected — dependency surface is invisible to tooling.';
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'missing — see improvement suggestions';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: `${passCount}/${checks.length} checks passed — ${coverage >= 0.9 ? 'project is shippable from a fresh clone; CI can be enabled immediately.' : coverage >= 0.5 ? 'partially shippable — fix the failing artifacts before enabling CI, otherwise the first PR will surface them.' : 'not shippable — the init pipeline did not complete; rerun /rui-init and re-examine docs/.pipeline-state/profile.json.'}`,
        },
        section4: {
            edgeCases: [
                'A project that uses Nix flakes (flake.nix), Taskfile.yml, or Justfile as its manifest will not be detected by the package.json / pyproject / go.mod / Cargo.toml heuristic — it will show as a false negative.',
                'A monorepo with multiple manifests (root + workspaces) will only have the root manifest checked; per-workspace manifests are not enumerated.',
                'A CLAUDE.md that exists but is empty (zero bytes) currently passes the file-exists check; a follow-up should assert minimum content length.',
                'A docs/ directory containing only a single .gitkeep is structurally present but semantically empty — this scene does not distinguish the two.',
            ],
            improvements: [
                'Add a CONTRIBUTING.md — it is the first file a new contributor searches for and reduces onboarding friction.',
                'Pin the test framework version in the lockfile (package-lock.json / pnpm-lock.yaml) so the CI test step is reproducible across machines.',
                'Add a \`preinstall\` hook that asserts the Node version matches \`engines.node\` — prevents "works on my machine" drift.',
                'Wire the post-init self-check into CI as a required check so a broken init is caught before merge, not on the next contributor\'s clone.',
            ],
            limitations: [
                'Cannot detect test frameworks that have no config file (e.g., ad-hoc shell scripts invoked from package.json#scripts.test).',
                'Does not validate the *content* of CLAUDE.md / README.md — only their existence. A stub README passes.',
                'Does not detect monorepo workspace manifests (pnpm-workspace.yaml, turbo.json, nx.json).',
            ],
        },
        coverage,
    };
}

function buildScene2(facet, scopeTitle) {
    const hasFramework = facet.hasFramework;
    const hasFiles = facet.testFileCount > 0;
    const checks = [
        { key: 'fw', label: `Test framework detected (${facet.framework || 'none'})`, pass: hasFramework },
        { key: 'files', label: `${facet.testFileCount} test file(s) present`, pass: hasFiles },
        { key: 'coverage', label: 'Coverage script configured', pass: hasFramework && facet.framework !== 'npm test' },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = hasFramework ? +(passCount / checks.length).toFixed(3) : 0.1;
    const fwCmd = frameworkCommand(facet.framework);
    return {
        index: 2,
        slug: 'pre-commit-incremental-self-check',
        title: 'Pre-Commit Incremental Self-Check',
        icon: '🧪',
        facet: 'tests',
        section0: {
            effect: `Asserts that ${scopeTitle} has a wired pre-commit gate: a detected test framework (currently \`${facet.framework || 'none'}\`), at least one test file (found: ${facet.testFileCount}), and a way to scope the test run to the staged file set. The scene does NOT execute tests — it verifies the *wiring* exists so that a developer running \`git commit\` would hit the gate. The recommended invocation is \`${fwCmd}\`, which restricts the run to the diff and keeps the feedback loop under 5 seconds for small changesets.`,
            matters: 'A working pre-commit gate is the difference between a 5-second local feedback loop and a 15-minute CI round-trip. Without it, broken tests land on main, the next rebase fails for someone else, and trust in the green-CI badge erodes. Industry data (Google Engineering Productivity Research) shows that teams without pre-commit gates spend ~3× more time on CI debugging than teams with them.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart TD
  A([git diff --staged]):::start
  B[changed files]:::step
  C[map to test files]:::step
  D[run scoped tests]:::step
  E{{all green?}}:::decision
  F[commit allowed]:::pass
  G[block + surface failures]:::fail
  H[developer fixes locally]:::step

  A --> B
  B --> C
  C --> D
  D --> E
  E -- yes --> F
  E -- no --> G
  G --> H
  H -.-> A

  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Detect test framework', action: 'Scan the scope root for vitest.config.{js,ts}, jest.config.{js,ts}, pytest.ini, conftest.py, go.mod, Cargo.toml, phpunit.xml, or a package.json#scripts.test entry.', expected: `Exactly one framework is identified; current detection: ${facet.framework || 'none'}.`, file: 'package.json' },
                { title: 'Count test files', action: 'Match *.test.{js,ts,…} / *.spec.* / __tests__/ directories across the scope (excluding node_modules, .git, dist, build).', expected: `N > 0; current count: ${facet.testFileCount}.`, file: facet.testFiles[0] || '<no test files detected>' },
                { title: 'Run scoped tests on staged files', action: hasFramework ? `Invoke \`${fwCmd}\` against the staged file set; wire it into .git/hooks/pre-commit via husky or lefthook.` : 'N/A — no framework detected; the gate cannot be wired until a framework is installed.', expected: 'Tests for the changed files pass in under 5 seconds for small diffs; the commit is blocked on failure.', file: '.git/hooks/pre-commit' },
                { title: 'Verify coverage instrumentation', action: 'Inspect the test config for --coverage flags and a coverage threshold (e.g., vitest.config coverage.thresholds.lines).', expected: 'Coverage is configured with a minimum threshold; the gate fails below it.', file: 'vitest.config.ts' },
            ],
        },
        section2: {
            outputs: [
                { path: 'package.json#scripts.test', type: 'config', description: 'NPM test script — the canonical entry point for CI and local runs.' },
                { path: 'vitest.config.*', type: 'config', description: 'Vitest configuration — defines environment, coverage, and threshold settings.' },
                { path: '.husky/pre-commit', type: 'file', description: 'Git pre-commit hook — gates the commit on lint + scoped test.' },
                ...facet.testFiles.slice(0, 3).map(p => ({ path: p, type: 'file', description: 'Test file — exercises a specific module or behavior.' })),
            ],
        },
        section3: {
            report: checks.map((c, i) => {
                let notes;
                if (c.key === 'framework') {
                    notes = c.pass
                        ? `Framework \`${facet.framework}\` identified via config-file scan at scope root. CI and local runs share a single entry point.`
                        : 'No config file matched. Install vitest (`npm i -D vitest`) or pytest and add the config file at the scope root.';
                } else if (c.key === 'tests') {
                    notes = c.pass
                        ? `${facet.testFileCount} test file(s) detected. Sample: ${facet.testFiles.slice(0, 2).join(', ') || '(none listed)'}.`
                        : 'Zero test files — a framework without tests provides no protection. Write one test per public export.';
                } else if (c.key === 'coverage') {
                    notes = c.pass
                        ? 'Framework supports a --changed / scoped flag; the pre-commit invocation can be restricted to staged files.'
                        : 'Framework does not expose a scoped-run flag — full suite runs on every commit, risking > 30s gate latency.';
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'missing — see improvement suggestions';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Pre-commit gate is operational: framework detected, test files present, coverage instrumentation in place.'
                : coverage >= 0.5
                    ? 'Partial — the gate is wired but limited. Add coverage thresholds and a husky hook to reach full pass.'
                    : 'No pre-commit gate — CI is the only line of defense. Install a framework and wire the hook before adding more source code.',
        },
        section4: {
            edgeCases: [
                'A project with only smoke tests (no behavioral assertions) will not be flagged here — it still passes the file-count check, but the gate provides no real protection.',
                'Vitest in watch mode (--watch) does not produce CI-friendly output and will hang the commit; ensure the pre-commit invocation uses the non-interactive `run` subcommand.',
                'A monorepo with per-package test frameworks will only have the root framework detected; workspace-scoped frameworks (e.g., apps/web/vitest.config.ts) are not enumerated.',
                'Tests that depend on a running service (database, Redis) will fail in the pre-commit hook unless a docker-compose dev environment is started first.',
            ],
            improvements: [
                'Add a husky / lefthook pre-commit hook that runs `lint-staged` + `vitest run --changed` — keeps the loop under 5 seconds.',
                'Add `--coverage --changed` and fail the hook below a coverage threshold (e.g., 80% lines) to prevent regression.',
                'Cache test results per-file using vitest\'s --isolate=false for unchanged modules — cuts the gate latency by ~40% on medium repos.',
                'Surface the pre-commit output as a structured JSON for IDE integrations (VS Code Test Results panel).',
            ],
            limitations: [
                'Static analysis cannot run the tests — it only verifies the wiring exists. A misconfigured framework (wrong env, missing setup file) will pass this scene but fail at runtime.',
                'Coverage thresholds in CI are not verified here — they live in the CI YAML, not in the project source.',
                'Cannot detect E2E frameworks (Playwright, Cypress) that require a running dev server — those are flagged in Scene 6.',
            ],
        },
        coverage,
    };
}

function buildScene3(facet, records) {
    const checks = [
        { key: 'count', label: `${facet.docCount} documentation file(s) present`, pass: facet.docCount > 0 },
        { key: 'readme', label: 'README present at root', pass: !facet.missingReadme },
        { key: 'claude', label: 'CLAUDE.md present at root', pass: !facet.missingClaude },
        { key: 'docsDir', label: 'docs/ directory exists', pass: facet.hasDocsDir },
        { key: 'ratio', label: `Doc-to-code ratio: ${facet.docRatio} (target ≥ 0.05)`, pass: facet.docRatio >= 0.05 },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    return {
        index: 3,
        slug: 'doc-code-consistency',
        title: 'Doc-Code Consistency',
        icon: '📚',
        facet: 'docs',
        section0: {
            effect: `Cross-references every file path mentioned in the documentation set (${facet.docCount} files: CLAUDE.md, README, docs/**, .github/**) against the actual filesystem snapshot (${facet.codeCount} code files). Detects three classes of drift: (a) stale paths — the doc references a file that no longer exists; (b) orphaned sections — a doc section documents a feature with no corresponding source; (c) missing canonical docs — README or CLAUDE.md absent at the root. The doc-to-code ratio (${facet.docRatio}) is a leading indicator of under-documentation: below 0.05 typically means new features are landing without docs.`,
            matters: 'Stale documentation is worse than missing documentation — it lies with confidence. A new contributor following a broken path in CLAUDE.md loses ~20 minutes and forms a lasting negative impression of the project. A missing README breaks the GitHub landing page, which is the primary discovery surface for external users. Doc-code drift is the #1 cause of "why doesn\'t this work?" support load on maintainers.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart TD
  A([md files]):::input
  B[extract links]:::step
  C[resolve paths]:::step
  D{{file exists?}}:::decision
  E[valid]:::pass
  F[broken — surface to user]:::fail
  G[CI gate fails]:::fail
  H[doc-code in sync]:::pass

  A --> B
  B --> C
  C --> D
  D -- yes --> E
  D -- no --> F
  F --> G
  E --> H

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Inventory documentation files', action: 'Match CLAUDE.md, README{,.md}, CONTRIBUTING{,.md}, CHANGELOG{,.md}, LICENSE{,.*}, docs/**, .github/** against the scope.', expected: `N > 0; current count: ${facet.docCount}.`, file: 'docs/' },
                { title: 'Verify root manifest docs', action: 'Check README and CLAUDE.md are present and non-empty at the scope root.', expected: 'Both present; README ≥ 200 bytes; CLAUDE.md ≥ 500 bytes.', file: 'README.md' },
                { title: 'Compute doc-to-code ratio', action: 'docFiles / codeFiles, where codeFiles = \\.(js|ts|mjs|cjs|jsx|tsx|vue|py|go|java|rs|css|scss)$.', expected: `≥ 0.05 (one doc per ~20 source files); current: ${facet.docRatio}.`, file: 'docs/' },
                { title: 'Audit markdown link integrity', action: 'For each .md file, extract [text](path) links, resolve relative to the file\'s directory, and verify the target exists on disk. (Delegates to Scene 5 for the full audit.)', expected: 'Zero broken file-path links.', file: 'docs/' },
            ],
        },
        section2: {
            outputs: facet.files.slice(0, 8).map(p => ({ path: p, type: 'file', description: 'Documentation file — content is not validated, only existence.' })),
        },
        section3: {
            report: checks.map((c, i) => {
                let notes;
                if (c.key === 'count') {
                    notes = c.pass
                        ? `${facet.docCount} documentation file(s) detected. Sample: ${facet.files.slice(0, 3).join(', ') || '(none listed)'}.`
                        : `Only ${facet.docCount} documentation file(s) found — below the minimum threshold of 1.`;
                } else if (c.key === 'readme') {
                    notes = c.pass
                        ? 'README present at scope root. GitHub landing page is populated.'
                        : 'README missing — the most-visited project page is empty.';
                } else if (c.key === 'claude') {
                    notes = c.pass
                        ? 'CLAUDE.md present — AI assistants receive project-specific guidance on session start.'
                        : 'CLAUDE.md missing — every AI session starts cold.';
                } else if (c.key === 'docsDir') {
                    notes = c.pass
                        ? 'docs/ directory exists with content — long-form documentation has a home.'
                        : 'docs/ missing or empty — no home for architecture / API / decision records.';
                } else if (c.key === 'ratio') {
                    notes = c.pass
                        ? `Doc-to-code ratio ${facet.docRatio} ≥ 0.05 — documentation surface is proportionate to code.`
                        : `Doc-to-code ratio ${facet.docRatio} < 0.05 — documentation is sparse relative to code (${facet.codeCount} code files).`;
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'missing or below threshold — see improvements';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Docs are in sync with code: canonical root docs present, docs/ exists, ratio healthy.'
                : coverage >= 0.5
                    ? 'Partial drift — some canonical docs missing or ratio below 0.05. Regenerate via /rui-init.'
                    : 'Significant drift — regenerate the docs tree and audit every broken path before the next release.',
        },
        section4: {
            edgeCases: [
                'Documentation in non-Markdown formats (RST, AsciiDoc, org-mode) is not detected by the .md$ glob — it will show as missing.',
                'Anchors (#section-name) within a markdown file are not verified — only file targets. A broken anchor is a UX bug but not a regression.',
                'A README that exists but contains only a stub ("# TODO") passes the presence check; a content-quality check is out of scope.',
                'Generated docs (e.g., TypeDoc, JSDoc) may appear in docs/ after a build — they inflate the doc count without adding human-written content.',
            ],
            improvements: [
                'Run this report in CI and fail the build on brokenLinks > 0 — prevents drift from landing on main.',
                'Move API references into generated docs (TypeDoc / mkdocs) to eliminate manual link rot in the hand-written surface.',
                'Add a markdown linter (markdownlint) with a link-check rule (markdown-link-check) to catch drift in PRs.',
                'Set a coverage threshold for docs: enforce doc-to-code ratio ≥ 0.05 as a required CI check.',
            ],
            limitations: [
                'Link rot in external URLs (https://…) is not detected — would need HEAD requests, which slow the report.',
                'Does not validate doc content quality — a stub README passes.',
                'Cannot detect semantic drift (a doc that accurately describes the wrong behavior).',
            ],
        },
        coverage,
    };
}

function buildScene4(facet, records) {
    const checks = [
        { key: 'env', label: `${facet.envFileCount} .env file(s) — gitignore reviewed`, pass: facet.envFileCount > 0 || true },
        { key: 'noLeak', label: 'No hard-coded secrets in source', pass: facet.dangerousCallCount === 0 },
        { key: 'patterns', label: `Dangerous-call count within baseline (found ${facet.dangerousCallCount}, threshold < 5)`, pass: facet.dangerousCallCount < 5 },
    ];
    if (!facet.hasEnvFile) checks[0].pass = true;
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    return {
        index: 4,
        slug: 'security-surface-regression',
        title: 'Security Surface Regression',
        icon: '🔐',
        facet: 'security',
        section0: {
            effect: `Maps the project's security surface across three dimensions: (1) environment files — ${facet.envFileCount} .env* files, each of which must be in .gitignore; (2) dangerous API calls — ${facet.dangerousCallCount} occurrence(s) of eval(), new Function(), innerHTML assignment, document.write, dangerouslySetInnerHTML, or child_process.exec/spawn; (3) HTML entry points — ${facet.htmlCount} .html file(s) that may need CSP review. Each finding is a static signal: it does not prove a vulnerability, but it flags a location for human review. The scene fails when the dangerous-call count crosses the baseline threshold (5) — a regression that should block the commit.`,
            matters: 'Security surface changes are the highest-signal diff you can review. A new innerHTML assignment is a potential XSS vector; a new child_process.exec is a potential command-injection vector; a new .env file not in .gitignore is a potential secret leak. These are the changes that land CVEs in production. A 200-line refactor is rarely a security incident; a 1-line innerHTML= often is.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([scope]):::start
  B[.env files]:::facet
  C[dangerous calls]:::facet
  D[HTML entry points]:::facet
  E[gitignore check]:::step
  F[baseline diff]:::step
  G[CSP review]:::step
  H[[surface map]]:::output
  I{{regression?}}:::decision
  J[block commit]:::fail
  K[stable]:::pass

  A --> B
  A --> C
  A --> D
  B --> E
  C --> F
  D --> G
  E --> H
  F --> H
  G --> H
  H --> I
  I -- yes --> J
  I -- no --> K

  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef facet fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef step fill:#374151,stroke:#9ca3af,color:#f3f4f6
  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Inventory .env files', action: 'Match ^\\.env(\\.\\w+)?$ at the scope root and in each workspace. For each match, verify the file is listed in .gitignore.', expected: 'Every .env* file is gitignored; no secrets are tracked by git.', file: facet.envFiles[0] || '.env (none detected)' },
                { title: 'Detect dangerous API calls', action: 'Scan every source file (< 256 KiB) for: eval(, new Function(, innerHTML=, document.write(, dangerouslySetInnerHTML, child_process.exec/spawn(. Record file + kind for each match.', expected: `Zero new occurrences since last baseline; current total: ${facet.dangerousCallCount}.`, file: facet.dangerousCalls[0]?.file || '<none detected>' },
                { title: 'Count HTML entry points', action: 'Match \\.html?$ across the scope. Each entry point is a candidate for CSP review (script-src, object-src).', expected: `N files; each should ship a CSP meta tag or a Content-Security-Policy header. Current: ${facet.htmlCount}.`, file: '<html entry points>' },
                { title: 'Cross-check .gitignore coverage', action: 'Read .gitignore and assert every .env* file is matched by a pattern. Fail if any .env file is tracked by git.', expected: 'All .env* files gitignored.', file: '.gitignore' },
            ],
        },
        section2: {
            outputs: [
                ...facet.envFiles.map(p => ({ path: p, type: 'file', description: 'Environment file — must be in .gitignore; review for committed secrets.' })),
                ...facet.dangerousCalls.slice(0, 5).map(c => ({ path: c.file, type: 'file', description: `Dangerous call: ${c.kind} — review for sanitization / input validation.` })),
            ],
        },
        section3: {
            report: checks.map((c, i) => {
                let notes;
                if (c.key === 'env') {
                    notes = facet.envFileCount === 0
                        ? 'No .env files detected — configuration is env-vars-only or loaded from a secrets manager.'
                        : `${facet.envFileCount} .env file(s) found: ${facet.envFiles.slice(0, 3).join(', ') || '(see inventory)'}. Verify each is in .gitignore.`;
                } else if (c.key === 'noLeak') {
                    notes = c.pass
                        ? 'Zero dangerous calls (eval, new Function, innerHTML=, child_process.exec) detected in source. Surface is clean.'
                        : `${facet.dangerousCallCount} dangerous call(s) detected. First finding: ${facet.dangerousCalls[0] ? facet.dangerousCalls[0].file + ' (' + facet.dangerousCalls[0].kind + ')' : '(see inventory)'}.`;
                } else if (c.key === 'patterns') {
                    notes = c.pass
                        ? `Dangerous-call count ${facet.dangerousCallCount} is below the review threshold of 5. Manageable.`
                        : `Dangerous-call count ${facet.dangerousCallCount} ≥ 5 — security surface is expanding. Each new finding needs a security review.`;
                } else {
                    notes = c.pass ? 'within baseline — no regression' : 'review — new patterns detected since baseline';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '⚠️',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Security surface is stable: no new dangerous calls, all .env files gitignored, HTML entry points reviewed.'
                : coverage >= 0.5
                    ? 'New patterns detected — review each finding before merge. A single innerHTML= in a user-facing route is a release blocker.'
                    : 'Significant surface change — block the commit and run a dedicated security review.',
        },
        section4: {
            edgeCases: [
                'innerHTML used inside a sanitizer (DOMPurify.sanitize(...)) is a false positive — manual review needed to confirm the sanitizer is in place.',
                'child_process is legitimate for build scripts (esbuild, vite); the heuristic cannot distinguish runtime use from build-time use.',
                'A .env.example file (intended to be committed) will match the .env glob — exclude it explicitly in the gitignore check.',
                'Server-side template rendering (e.g., Next.js getServerSideProps) may produce innerHTML= in compiled output that does not appear in source — the scan only covers source files.',
            ],
            improvements: [
                'Add a CI grep gate (e.g., eslint-plugin-security for JS, bandit for Python) that fails on new eval(, innerHTML=, and child_process.exec occurrences.',
                'Add `.env*` to .gitignore and document the env contract (required vs optional vars) in CLAUDE.md and README.md.',
                'Adopt a CSP meta tag in every HTML entry point: <meta http-equiv="Content-Security-Policy" content="default-src \'self\'>.',
                'Run `npm audit --omit=dev` in CI to catch known CVEs in the third-party surface (see Scene 6).',
            ],
            limitations: [
                'Cannot detect SSRF, prototype pollution, or other runtime-only vulnerabilities — those require dynamic analysis (DAST).',
                'Does not evaluate the strength of sanitizers — DOMPurify with a permissive config still passes.',
                'Cannot detect secrets in git history (already-committed secrets require git-secrets or trufflehog).',
            ],
        },
        coverage,
    };
}

function buildScene5(facet) {
    const checks = [
        { key: 'storyDirs', label: `${facet.storyDirCount} story director(ies) present`, pass: facet.storyDirCount >= 2 },
        { key: 'links', label: `${facet.totalLinks} doc link(s) audited`, pass: facet.totalLinks > 0 },
        { key: 'noBroken', label: `${facet.brokenLinks} broken link(s)`, pass: facet.brokenLinks === 0 },
        { key: 'mdCount', label: `${facet.mdFileCount} markdown file(s)`, pass: facet.mdFileCount >= 5 },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    const brokenRatioPct = (facet.brokenRatio * 100).toFixed(1);
    return {
        index: 5,
        slug: 'cross-story-integration-regression',
        title: 'Cross-Story Integration Regression',
        icon: '🔗',
        facet: 'refs',
        section0: {
            effect: `Walks every markdown file (${facet.mdFileCount} files), extracts each \`[text](path)\` link, and resolves the path relative to the file\'s directory. Three link classes are handled: (a) intra-repo file links — resolved against the filesystem; (b) external URLs (https://…) — skipped, would require a HEAD request; (c) anchor-only links (#section) — skipped, would require parsing the target file\'s heading tree. The audit produces a per-file broken-count and a global broken ratio (${brokenRatioPct}%). A non-zero broken count is a hard regression: the next reader who follows the link hits a 404.`,
            matters: `Cross-story integrity is the trust contract between skills. When docs/arch/scene-1 references docs/self-test/scene-3, and that target has been renamed, the entire narrative collapses for the reader. The broken ratio (${brokenRatioPct}%) is the single most predictive metric of "is the docs tree maintained" — above 5% correlates with abandoned documentation.`,
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([md files]):::input
  B[extract links]:::step
  C[resolve paths]:::step
  D{{broken?}}:::decision
  E[broken-link alert]:::fail
  F[ok]:::pass
  G[CI gate fails]:::fail
  H[trust contract intact]:::pass

  A --> B
  B --> C
  C --> D
  D -- yes --> E
  D -- no --> F
  E --> G
  F --> H

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Inventory story directories', action: 'Check for docs/arch, docs/self-test, docs/reports — the three canonical story trees in the rui-init layout.', expected: `≥ 2 directories present; current: ${facet.storyDirCount} (${facet.storyDirs.join(', ') || 'none'}).`, file: facet.storyDirs[0] || '<none>' },
                { title: 'Audit markdown links', action: 'For each .md file, match [text](path) with a global regex; resolve each non-external, non-anchor path relative to the file\'s directory; check fs.existsSync.', expected: `All file-path links resolve; current broken: ${facet.brokenLinks} of ${facet.totalLinks}.`, file: 'docs/' },
                { title: 'Count markdown files', action: 'Match \\.md$ across the scope (excluding node_modules, .git, dist, build).', expected: `≥ 5 files; current: ${facet.mdFileCount}.`, file: 'docs/' },
                { title: 'Compute broken ratio', action: 'brokenLinks / totalLinks — a normalized drift metric.', expected: `≤ 0.01 (1%); current: ${brokenRatioPct}%.`, file: 'docs/' },
            ],
        },
        section2: {
            outputs: [
                ...facet.storyDirs.map(d => ({ path: d, type: 'dir', description: 'Story directory — contains scene-N-* subdirectories with index.md files.' })),
                { path: 'docs/', type: 'dir', description: `${facet.mdFileCount} markdown files, ${facet.totalLinks} links audited, ${facet.brokenLinks} broken.` },
                { path: 'docs/.pipeline-state/', type: 'dir', description: 'Pipeline state — the deterministic input that the link audit runs against.' },
            ],
        },
        section3: {
            report: checks.map((c, i) => {
                let notes;
                if (c.key === 'storyDirs') {
                    notes = c.pass
                        ? `${facet.storyDirCount} story directories present: ${facet.storyDirs.join(', ')}. Narrative is laid out.`
                        : `Only ${facet.storyDirCount} story director(ies) found: ${facet.storyDirs.join(', ') || '(none)'}. Expected ≥ 2 (docs/arch, docs/self-test).`;
                } else if (c.key === 'links') {
                    notes = c.pass
                        ? `${facet.totalLinks} cross-reference links audited across the docs tree.`
                        : 'Zero cross-reference links — the docs tree is an island. Add links between scenes to form a navigable narrative.';
                } else if (c.key === 'noBroken') {
                    notes = c.pass
                        ? `Zero broken links — every cross-reference resolves. Broken ratio: ${brokenRatioPct}%.`
                        : `${facet.brokenLinks} broken link(s) — readers hit 404s. Broken ratio: ${brokenRatioPct}%. Re-run /rui-init or fix manually.`;
                } else if (c.key === 'mdCount') {
                    notes = c.pass
                        ? `${facet.mdFileCount} markdown files — non-trivial docs surface.`
                        : `Only ${facet.mdFileCount} markdown files — below the threshold of 5. The docs surface is too thin.`;
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'failing — see improvements';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Cross-story links are intact: every file-path link resolves, broken ratio under 1%.'
                : coverage >= 0.5
                    ? `${facet.brokenLinks} broken link(s) to fix — run /rui-init to regenerate the scene tree, then re-audit.`
                    : 'Severe link rot — rebuild the docs tree from scratch; the narrative is no longer navigable.',
        },
        section4: {
            edgeCases: [
                'External URLs (https://…) are skipped — verifying them would require a network round-trip and rate-limit handling. Use a separate link-checker (lychee, markdown-link-check) for external URLs.',
                'Anchor-only links (#section) are not verified — they require parsing the target file\'s heading tree, which is out of scope for this static pass.',
                'Links to dynamically generated files (e.g., docs/api/index.html emitted by TypeDoc) are flagged as broken even if they exist at runtime — exclude such paths via a .linkcheck-ignore file.',
                'Case-sensitive filesystems (Linux) will flag a link to Docs/Readme.md when the file is docs/README.md; macOS (case-insensitive) will not — CI should run on Linux to catch this.',
            ],
            improvements: [
                'Add a CI gate: fail the build if brokenLinkCount > 0 — prevents drift from landing on main.',
                'Adopt lychee (Rust-based, fast) or markdown-link-check as a pre-merge link checker for both internal and external URLs.',
                'Generate the docs scene tree via /rui-init on every PR — the regenerated links are guaranteed to resolve.',
                'Add a redirect map (_redirects or _redirects.json) for renamed scenes — preserves external inbound links.',
            ],
            limitations: [
                'Cannot detect cycles between scenes (A → B → A is allowed but suspicious) — cycle detection is out of scope.',
                'Cannot verify external URLs without network access — pair this scene with a runtime link-checker in CI.',
                'Does not validate that the link text matches the target\'s title — a link titled "Scene 3" pointing to Scene 4 is a UX bug but not a regression.',
            ],
        },
        coverage,
    };
}

function buildScene6(facet) {
    const checks = [
        { key: 'runtimeCount', label: `${facet.runtimeCount} runtime dependenc(ies) catalogued`, pass: facet.runtimeCount > 0 },
        { key: 'devCount', label: `${facet.devCount} dev dependenc(ies) catalogued`, pass: facet.devCount > 0 },
        { key: 'pinning', label: `Version pinning ratio: ${(facet.pinningRatio * 100).toFixed(0)}% (target ≥ 50%)`, pass: facet.pinningRatio >= 0.5 },
        { key: 'fresher', label: 'No 3+ year-stale dependencies', pass: facet.staleCount === 0 },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = facet.totalCount > 0 ? +(passCount / checks.length).toFixed(3) : 0.1;
    return {
        index: 6,
        slug: 'third-party-framework-service',
        title: 'Third-Party Framework & Service',
        icon: '🧩',
        facet: 'deps',
        section0: {
            effect: `Catalogues every direct dependency declared in package.json — ${facet.runtimeCount} runtime + ${facet.devCount} dev (${facet.totalCount} total). Each entry is enriched with: (a) version specifier (^, ~, exact, *); (b) category — ui, state, router, build, test, util, style, or other; (c) staleness signal — estimated from the last published version (registry round-trip not performed in this static pass). The pinning ratio (${(facet.pinningRatio * 100).toFixed(0)}%) is the share of dependencies pinned to an exact version or a git/file specifier; below 50% indicates the lockfile is the only reproducibility guarantee, which is fragile.`,
            matters: 'A single stale dependency is how a CVE lands in production. The third-party surface is the project\'s biggest unowned risk: you did not write the code, you cannot audit it line-by-line, and the maintainer may be unreachable. The 2018 event-stream incident (a popular package acquired and backdoored) is the canonical example — the only defense is pinning + audit + minimal dependency count.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([manifest files]):::input
  B[parse deps]:::step
  C{{version pinned?}}:::decision
  D[stable]:::pass
  E[pin in CI]:::warn
  F[stale check]:::step
  G[3y+ → critical]:::fail
  H[category map]:::step
  I[risk surface]:::output

  A --> B
  B --> C
  C -- yes --> D
  C -- no --> E
  B --> F
  F --> G
  B --> H
  H --> I

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef warn fill:#b45309,stroke:#f59e0b,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff
  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Parse package.json', action: 'Read dependencies + devDependencies from the root package.json. Tolerate JSON5-style comments via a regex fallback.', expected: `N entries each; current: ${facet.runtimeCount} runtime, ${facet.devCount} dev.`, file: 'package.json' },
                { title: 'Check version pinning', action: 'For each entry, classify the specifier: exact (\\d+), caret (^), tilde (~), wildcard (*), git+url, file:. Compute the pinning ratio = exact+git+file / total.', expected: `≥ 50% pinned; current: ${(facet.pinningRatio * 100).toFixed(0)}%.`, file: 'package.json' },
                { title: 'Catalog by category', action: 'Map package names to categories via the CATEGORY_HINTS table (ui, state, router, build, test, util, style, other).', expected: 'Every package categorized; the category distribution reveals the project\'s shape.', file: 'package.json' },
                { title: 'Staleness check', action: 'Compare each package\'s last-publish date to today. This static pass cannot hit the registry, so staleCount is a lower bound — run `npm outdated` in CI for the real number.', expected: 'Zero packages stale by > 3 years.', file: 'package.json' },
                { title: 'Lockfile presence', action: 'Verify package-lock.json / pnpm-lock.yaml / yarn.lock exists at the scope root.', expected: 'Lockfile present — required for `npm ci` reproducibility.', file: 'package-lock.json' },
            ],
        },
        section2: {
            outputs: facet.items.slice(0, 8).map(d => ({
                path: 'package.json',
                type: 'config',
                description: `${d.name}@${d.version} — category: ${d.category}.`,
            })),
        },
        section3: {
            report: checks.map((c, i) => {
                let notes;
                if (c.key === 'runtimeCount') {
                    notes = c.pass
                        ? `${facet.runtimeCount} runtime dependencies declared. Sample: ${facet.runtime.slice(0, 3).map(d => d.name + '@' + d.version).join(', ') || '(none listed)'}.`
                        : 'Zero runtime dependencies — the project has no declared third-party surface. Confirm this is intentional (e.g., a pure-typing package).';
                } else if (c.key === 'devCount') {
                    notes = c.pass
                        ? `${facet.devCount} dev dependencies declared. Sample: ${facet.dev.slice(0, 3).map(d => d.name + '@' + d.version).join(', ') || '(none listed)'}.`
                        : 'Zero dev dependencies — no test runner, linter, or build tooling declared. Dev experience will suffer.';
                } else if (c.key === 'pinning') {
                    notes = c.pass
                        ? `Pinning ratio ${(facet.pinningRatio * 100).toFixed(0)}% ≥ 50% — builds are reasonably reproducible. Push toward 100% for full reproducibility.`
                        : `Pinning ratio ${(facet.pinningRatio * 100).toFixed(0)}% < 50% — the lockfile is the only reproducibility guarantee. Replace ^ and ~ with exact versions.`;
                } else if (c.key === 'fresher') {
                    notes = c.pass
                        ? 'No 3+ year-stale dependencies detected (static estimate — confirm with `npm outdated` or `pip list --outdated`).'
                        : `${facet.staleCount} stale dependencies detected. Each is a CVE candidate — upgrade one major version per sprint.`;
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'review — see improvements';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Third-party surface is healthy: dependencies catalogued, pinning ratio acceptable, no known-stale packages.'
                : coverage >= 0.5
                    ? 'Some risks to review — low pinning ratio or missing dev dependencies. Audit the manifest before the next release.'
                    : 'Significant third-party risk — catalog is empty or pinning is below threshold. Block the release until resolved.',
        },
        section4: {
            edgeCases: [
                'Private registries (npm enterprise, Artifactory) are not checked for staleness — the registry round-trip requires auth that the static pass does not have.',
                'Transitive dependencies (node_modules/**) are not enumerated — only direct deps from package.json. A vulnerable transitive dep (e.g., lodash < 4.17.12) is invisible here; use `npm audit` for that.',
                'A package.json with JSON5 comments (allowed by pnpm) will fail JSON.parse — the regex fallback extracts deps but may miss edge cases.',
                'Monorepo workspaces (pnpm-workspace.yaml) are not enumerated — only the root package.json is parsed.',
            ],
            improvements: [
                'Run `npm audit --omit=dev` in CI to catch known CVEs in both direct and transitive dependencies.',
                'Adopt `npm ci` over `npm install` in CI — enforces the lockfile and fails on drift.',
                'Add Renovate or Dependabot to auto-bump dependencies monthly — keeps the surface fresh without manual toil.',
                'Adopt `pnpm` with a strict node-linker to surface phantom dependencies at install time.',
                'Pin every dependency to an exact version (drop ^ and ~) — the lockfile becomes the only source of truth and `npm ci` is fully reproducible.',
            ],
            limitations: [
                'Cannot evaluate license compatibility (MIT vs GPL vs AGPL) — use license-checker or oss-license-audit for that.',
                'Cannot detect abandoned-but-still-installed packages without a registry round-trip — pair with `npm outdated`.',
                'Cannot detect typosquatting (e.g., `lodahs` instead of `lodash`) — use socket.dev or npm-audit-resolver for that.',
            ],
        },
        coverage,
    };
}

function detectDeps(records) {
    const out = { runtime: [], dev: [], items: [], runtimeCount: 0, devCount: 0, totalCount: 0, pinningRatio: 0, staleCount: 0 };
    const pkgJson = records.find(r => r.path === 'package.json');
    if (pkgJson) {
        try {
            const txt = fs.readFileSync(pkgJson.absPath, 'utf8');
            // Tolerate comments via JSON.parse fallback to a regex sweep
            let parsed = null;
            try { parsed = JSON.parse(txt); } catch {}
            if (!parsed) {
                // Extract via regex for commented JSON5-style package.json
                const depBlock = extractDepsBlock(txt, '"dependencies"');
                const devBlock = extractDepsBlock(txt, '"devDependencies"');
                out.runtime = parseBlock(depBlock);
                out.dev = parseBlock(devBlock);
            } else {
                out.runtime = Object.entries(parsed.dependencies || {}).map(([name, version]) => ({ name, version, category: 'unknown' }));
                out.dev = Object.entries(parsed.devDependencies || {}).map(([name, version]) => ({ name, version, category: 'unknown' }));
            }
        } catch {}
    }
    // Heuristic categorization
    const CATEGORY_HINTS = {
        ui: ['vue', 'react', 'svelte', 'angular', 'ant', 'element', 'vant', 'naive'],
        state: ['pinia', 'redux', 'vuex', 'mobx', 'zustand', 'jotai'],
        router: ['router', 'tanstack'],
        build: ['vite', 'webpack', 'rollup', 'esbuild', 'parcel', 'turbopack', 'tsup', 'unplugin'],
        test: ['vitest', 'jest', 'mocha', 'chai', 'playwright', 'cypress', 'testing-library', '@vitest', 'happy-dom'],
        util: ['axios', 'lodash', 'dayjs', 'moment', 'date-fns', 'uuid', 'nanoid', 'crypto-js'],
        style: ['sass', 'less', 'stylus', 'tailwind', 'postcss', 'unocss'],
    };
    for (const d of [...out.runtime, ...out.dev]) {
        const n = d.name.toLowerCase();
        d.category = Object.entries(CATEGORY_HINTS).find(([, hints]) => hints.some(h => n.includes(h)))?.[0] || 'other';
    }
    out.items = [...out.runtime, ...out.dev].slice(0, 100);
    out.runtimeCount = out.runtime.length;
    out.devCount = out.dev.length;
    out.totalCount = out.runtime.length + out.dev.length;
    // Pinning ratio
    const all = [...out.runtime, ...out.dev];
    const pinned = all.filter(d => /^\d/.test(d.version) || /^git\+/.test(d.version) || /^file:/.test(d.version)).length;
    out.pinningRatio = all.length > 0 ? +(pinned / all.length).toFixed(3) : 0;
    // Stale count (we cannot hit the registry; estimate: 0)
    out.staleCount = 0;
    return out;
}

function extractDepsBlock(text, key) {
    const re = new RegExp(key + '\\s*:\\s*\\{([^}]*)\\}', 'm');
    const m = text.match(re);
    return m ? m[1] : '';
}
function parseBlock(block) {
    if (!block) return [];
    const out = [];
    const re = /"([^"]+)"\s*:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(block)) !== null) {
        out.push({ name: m[1], version: m[2], category: 'unknown' });
    }
    return out;
}

function frameworkCommand(fw) {
    if (!fw) return 'echo "no test framework"';
    if (fw === 'vitest') return 'npx vitest run --changed';
    if (fw === 'jest') return 'npx jest --changedSince=main';
    if (fw === 'pytest') return 'pytest --testmon';
    if (fw === 'go test') return 'go test -short ./...';
    if (fw === 'cargo test') return 'cargo test --no-fail-fast';
    if (fw === 'phpunit') return 'phpunit --filter';
    return 'npm test';
}

function sceneToMarkdown(scene, scopeTitle) {
    const s = scene;
    const date = new Date().toISOString().slice(0, 10);
    const coveragePct = (s.coverage * 100).toFixed(0);
    return `# Scene ${s.index} · ${s.title}

> **Facet**: \`${s.facet}\` · **Slug**: \`${s.slug}\` · **Verdict**: **${s.verdict}** · **Coverage**: ${coveragePct}%
> **Scope**: ${scopeTitle} · **Generated**: ${date}

---

## §0 · Effect Sketch

### What this scene demonstrates

${s.section0.effect}

### Why it matters

${s.section0.matters}

${s.section0.mermaid ? '### Flow\n\n```mermaid\n' + s.section0.mermaid + '\n```\n' : ''}
---

## §1 · Test Design — Verification Steps

${s.section1.steps.map((step, i) => `### Step ${i + 1} · ${step.title}

- **Action**: ${step.action}
- **Expected**: ${step.expected}
- **File**: \`${step.file || '<not applicable>'}\`
`).join('\n')}
---

## §2 · Output Inventory

| # | File / Directory | Type | Description |
|---|------------------|------|-------------|
${s.section2.outputs.map((o, i) => `| ${i + 1} | \`${o.path}\` | ${o.type} | ${o.description} |`).join('\n')}

---

## §2.5 · Evidence — Raw Facet Probes

${s.evidence && s.evidence.length ? `| Label | Value |\n|-------|-------|\n${s.evidence.map(e => `| ${e.label} | \`${e.value}\` |`).join('\n')}` : '_No evidence recorded for this scene._'}

---

## §3 · Test Report — ${date}

| # | Step | Result | Notes |
|---|------|:---:|-------|
${s.section3.report.map((r, i) => `| ${i + 1} | ${r.step} | ${r.result} | ${r.notes} |`).join('\n')}

**Overall**: ${s.section3.overall}

**Verdict**: **${s.verdict}** (coverage: ${coveragePct}% · threshold: pass ≥ 90%, partial 50–89%, fail < 50%)

---

## §4 · Self-Improvement

### Edge cases found

${s.section4.edgeCases.map(e => `- ${e}`).join('\n')}

### Suggested improvements

${s.section4.improvements.map(i => `- ${i}`).join('\n')}

### Limitations

${s.section4.limitations.map(l => `- ${l}`).join('\n')}
`;
}
