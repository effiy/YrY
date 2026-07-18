import { computeInventoryBreakdown, EXCLUDE_DIRS } from './inventory.mjs';

export function applySceneVerdicts(scenes) {
    let totalCoverage = 0;
    let passCount = 0;
    let partialCount = 0;
    let failCount = 0;

    for (const scene of scenes) {
        scene.verdict = scene.coverage >= 0.9 ? 'pass' : scene.coverage >= 0.5 ? 'partial' : 'fail';
        if (scene.verdict === 'pass') passCount += 1;
        else if (scene.verdict === 'partial') partialCount += 1;
        else failCount += 1;
        totalCoverage += scene.coverage;
    }

    const compositeScore = Math.round((totalCoverage / scenes.length) * 100);
    return {
        scenes,
        totalCoverage,
        passCount,
        partialCount,
        failCount,
        compositeScore,
    };
}

export function gradeOf(value) {
    if (value >= 90) return 'A';
    if (value >= 75) return 'B';
    if (value >= 60) return 'C';
    if (value >= 40) return 'D';
    return 'F';
}

export function buildReportConfig({
    absScope,
    scopeTitle,
    generatedAt,
    theme,
    mergeScenes,
}) {
    return {
        options: {
            scope: absScope,
            scopeTitle,
            generatedAt,
            theme,
            mergeScenes,
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
}

export function buildReportData({
    absScope,
    records,
    scenes,
    verdictSummary,
    facets,
}) {
    const reportData = {
        scope: absScope,
        score: verdictSummary.compositeScore,
        grade: gradeOf(verdictSummary.compositeScore),
        summary: {
            totalScenes: scenes.length,
            passCount: verdictSummary.passCount,
            partialCount: verdictSummary.partialCount,
            failCount: verdictSummary.failCount,
            coverage: +(verdictSummary.totalCoverage / scenes.length).toFixed(3),
            totalFiles: records.length,
            totalBytes: records.reduce((sum, record) => sum + record.bytes, 0),
        },
        facets: {
            init: facets.initFacet,
            tests: facets.testFacet,
            docs: facets.docFacet,
            security: facets.securityFacet,
            refs: facets.refsFacet,
            deps: facets.depsFacet,
        },
        inventory: computeInventoryBreakdown(records),
        scenes,
        gradeScale: [
            { grade: 'A', min: 90, tone: 'pass' },
            { grade: 'B', min: 75, tone: 'pass' },
            { grade: 'C', min: 60, tone: 'warn' },
            { grade: 'D', min: 40, tone: 'warn' },
            { grade: 'F', min: 0, tone: 'fail' },
        ],
        compliance: buildCompliance(),
        riskRegister: buildRiskRegister({
            scenes,
            initFacet: facets.initFacet,
            testFacet: facets.testFacet,
            docFacet: facets.docFacet,
            securityFacet: facets.securityFacet,
            refsFacet: facets.refsFacet,
            depsFacet: facets.depsFacet,
        }),
        glossary: buildGlossary(),
        roadmap: [],
        metrics: buildMetrics(records),
        activity: buildActivity(records),
    };

    reportData.roadmap = buildRoadmap(reportData.riskRegister || []);
    return reportData;
}

function buildCompliance() {
    return [
        {
            framework: 'OWASP ASVS 4.0',
            area: 'Supply Chain & Configuration',
            controls: [
                { id: '14.1.1', text: 'Verify that all components are pinned to a version and the lockfile is the source of truth.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: '14.2.1', text: 'Verify that unused or stale dependencies are identified and removed on a recurring schedule.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: '5.3.4', text: 'Verify that untrusted HTML inputs are reviewed for dangerous sinks (innerHTML, eval).', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: '5.3.5', text: 'Verify that command execution paths do not concatenate untrusted input.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
            ],
        },
        {
            framework: 'NIST SSDF',
            area: 'Secure Software Development Framework',
            controls: [
                { id: 'PS.1', text: 'Protect sensitive information from unauthorized disclosure — .env files, secrets in repo.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'PS.2', text: 'Meet each security requirement — baseline surface map and regression diff.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'PS.3', text: 'Reuse proven security solutions — vetted third-party frameworks, pinned.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: 'PW.4.1', text: 'Acquire well-secured components — pinning ratio ≥ 0.5.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
                { id: 'PW.7.1', text: 'Design code to protect against expected threats — security facet regression gate.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'RV.1', text: 'Identify and confirm vulnerabilities — self-test across all six scenes.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
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
                { id: 'A.8.25', text: 'Secure development lifecycle — baseline self-test contract.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
                { id: 'A.8.26', text: 'Application security requirements — security surface regression.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'A.8.27', text: 'Secure system architecture — inventory + manifest presence.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
                { id: 'A.8.28', text: 'Secure coding — dangerous call surface must stay at zero.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'A.8.29', text: 'Security testing in development — pre-commit gate presence.', sceneSlug: 'pre-commit-incremental-self-check', sceneIndex: 2 },
                { id: 'A.8.30', text: 'Outsourced development — third-party dependency vetting.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
            ],
        },
    ];
}

function buildRiskRegister({
    scenes,
    initFacet,
    testFacet,
    docFacet,
    securityFacet,
    refsFacet,
    depsFacet,
}) {
    const risks = [];
    const findScene = index => scenes.find(scene => scene.index === index);

    function push(sceneIdx, title, description, severity, likelihood, effort, mitigation) {
        const scene = findScene(sceneIdx);
        risks.push({
            id: `R-${String(risks.length + 1).padStart(2, '0')}`,
            sceneIndex: sceneIdx,
            sceneSlug: scene ? scene.slug : '',
            sceneTitle: scene ? scene.title : '',
            sceneVerdict: scene ? scene.verdict : 'fail',
            title,
            description,
            severity,
            likelihood,
            effort,
            mitigation,
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
        push(4, `${securityFacet.dangerousCallCount} dangerous call(s) detected`, 'eval / innerHTML / child_process.exec detected. Each is a potential injection vector.', securityFacet.dangerousCallCount >= 5 ? 'critical' : 'high', 'observed', 'M', 'Replace with safe alternatives: Function constructor → no-op in prod; innerHTML → textContent; exec → execFile with arg array.');
    }
    if (securityFacet.envFileCount > 0) {
        push(4, `${securityFacet.envFileCount} .env file(s) — verify gitignore coverage`, 'Env files present. The analyzer does not confirm .gitignore coverage; a manual check is required to rule out tracked secrets.', 'medium', 'expected', 'S', 'Run `git ls-files | grep -E "^\\.env"` — if any file matches, run `git rm --cached` and add `.env*` to .gitignore.');
    }
    if (refsFacet.brokenLinks > 0) {
        push(5, `${refsFacet.brokenLinks} broken cross-reference(s)`, 'Internal documentation links point to non-existent targets. Readers hit 404s and lose trust.', 'medium', 'observed', 'S', 'Re-run `/rui-init` to regenerate the docs tree, or manually fix the broken anchors. See Scene 5 §2.5 for the list.');
    }
    if (depsFacet.totalCount === 0) {
        push(6, 'No manifest found', 'Cannot evaluate the dependency surface without a package.json / pyproject.toml / go.mod / Cargo.toml.', 'high', 'observed', 'S', 'Create the appropriate manifest for the project\'s ecosystem.');
    } else {
        if (depsFacet.pinningRatio < 0.5) {
            push(6, `Low pinning ratio (${(depsFacet.pinningRatio * 100).toFixed(0)}%)`, 'Less than half of dependencies are pinned to exact versions. Builds are not reproducible across machines.', 'high', 'observed', 'S', 'Replace ^ and ~ in package.json with exact versions. Commit the lockfile.');
        }
        if (depsFacet.staleCount > 0) {
            push(6, `${depsFacet.staleCount} stale dependencies (3+ years)`, 'Stale dependencies are a primary CVE vector. The 2018 event-stream incident is the canonical example.', 'high', 'observed', 'M', 'Run `npm outdated` / `pip list --outdated` and upgrade one major version per sprint.');
        }
    }

    if (risks.length === 0) {
        push(1, 'No risks detected', 'All six scenes passed their checks. Maintain the baseline by re-running /rui-init after major changes.', 'low', 'rare', 'S', 'Continue current practice. Schedule a quarterly re-run of the self-test analyzer.');
    }

    return risks;
}

function buildGlossary() {
    return [
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
    ];
}

function buildRoadmap(risks) {
    const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
    const effortRank = { S: 0, M: 1, L: 2 };

    function bucket(risk) {
        if (risk.severity === 'critical' || risk.severity === 'high') {
            if (risk.effort === 'L') return 1;
            return 0;
        }
        if (risk.severity === 'medium') {
            if (risk.effort === 'L') return 2;
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

    for (const risk of risks) {
        const bucketIndex = bucket(risk);
        sprints[bucketIndex].items = sprints[bucketIndex].items || [];
        sprints[bucketIndex].items.push(risk);
    }

    for (const sprint of sprints) {
        sprint.items = (sprint.items || []).sort((a, b) => {
            const severityDelta = severityRank[a.severity] - severityRank[b.severity];
            if (severityDelta !== 0) return severityDelta;
            return (effortRank[a.effort] || 0) - (effortRank[b.effort] || 0);
        });
        sprint.itemCount = sprint.items.length;
    }

    return sprints;
}

function buildMetrics(records) {
    const sizeBuckets = [
        { label: '< 1 KB', max: 1024, count: 0, bytes: 0 },
        { label: '1–4 KB', max: 4 * 1024, count: 0, bytes: 0 },
        { label: '4–16 KB', max: 16 * 1024, count: 0, bytes: 0 },
        { label: '16–64 KB', max: 64 * 1024, count: 0, bytes: 0 },
        { label: '64–256 KB', max: 256 * 1024, count: 0, bytes: 0 },
        { label: '256 KB–1 MB', max: 1024 * 1024, count: 0, bytes: 0 },
        { label: '> 1 MB', max: Infinity, count: 0, bytes: 0 },
    ];

    for (const record of records) {
        for (const bucket of sizeBuckets) {
            if (record.bytes < bucket.max) {
                bucket.count += 1;
                bucket.bytes += record.bytes;
                break;
            }
        }
    }

    const largest = [...records]
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 12)
        .map(record => ({
            path: record.path,
            bytes: record.bytes,
            type: record.type,
        }));

    const dirCount = {};
    const dirBytes = {};
    for (const record of records) {
        const segments = record.path.split('/');
        const top = segments.length > 1 ? segments[0] : '(root)';
        dirCount[top] = (dirCount[top] || 0) + 1;
        dirBytes[top] = (dirBytes[top] || 0) + record.bytes;
    }

    const topDirs = Object.entries(dirCount)
        .map(([dir, count]) => ({
            dir,
            count,
            bytes: dirBytes[dir] || 0,
            pct: records.length > 0 ? +((count / records.length) * 100).toFixed(1) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
    const avgBytes = records.length > 0 ? Math.round(totalBytes / records.length) : 0;
    const medianBytes = (() => {
        const sorted = [...records].map(record => record.bytes).sort((a, b) => a - b);
        const count = sorted.length;
        if (count === 0) return 0;
        if (count % 2 === 1) return sorted[(count - 1) >> 1];
        return Math.round((sorted[count / 2 - 1] + sorted[count / 2]) / 2);
    })();

    return {
        totalFiles: records.length,
        totalBytes,
        avgBytes,
        medianBytes,
        sizeBuckets: sizeBuckets.map(bucket => ({
            label: bucket.label,
            count: bucket.count,
            bytes: bucket.bytes,
        })),
        largest,
        topDirs,
    };
}

function buildActivity(records) {
    const now = Math.floor(Date.now() / 1000);
    const day = 86400;
    const buckets = [
        { label: 'Last 7 days', max: 7 * day, count: 0, bytes: 0 },
        { label: '8–30 days', max: 30 * day, count: 0, bytes: 0 },
        { label: '31–90 days', max: 90 * day, count: 0, bytes: 0 },
        { label: '91–365 days', max: 365 * day, count: 0, bytes: 0 },
        { label: '1–2 years', max: 2 * 365 * day, count: 0, bytes: 0 },
        { label: 'Over 2 years', max: Infinity, count: 0, bytes: 0 },
    ];

    for (const record of records) {
        const age = now - (record.lastModified || 0);
        for (const bucket of buckets) {
            if (age <= bucket.max) {
                bucket.count += 1;
                bucket.bytes += record.bytes;
                break;
            }
        }
    }

    const totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
    const recentBytes = buckets[0].bytes + buckets[1].bytes + buckets[2].bytes;
    const recentFiles = buckets[0].count + buckets[1].count + buckets[2].count;
    const freshest = [...records]
        .filter(record => record.lastModified)
        .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
        .slice(0, 8)
        .map(record => ({
            path: record.path,
            bytes: record.bytes,
            ageDays: Math.max(0, Math.floor((now - (record.lastModified || 0)) / day)),
        }));

    return {
        buckets: buckets.map(bucket => ({
            label: bucket.label,
            count: bucket.count,
            bytes: bucket.bytes,
            filePct: records.length > 0 ? +((bucket.count / records.length) * 100).toFixed(1) : 0,
            bytePct: totalBytes > 0 ? +((bucket.bytes / totalBytes) * 100).toFixed(1) : 0,
        })),
        recentFileCount: recentFiles,
        recentByteRatio: totalBytes > 0 ? +(recentBytes / totalBytes).toFixed(3) : 0,
        freshest,
        generatedAt: now,
    };
}
