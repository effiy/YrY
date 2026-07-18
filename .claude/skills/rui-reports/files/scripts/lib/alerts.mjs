/**
 * rui-report-files · alert enrichment
 * ----------------------------------------------------------------------
 * The analyzer produces a stream of raw alerts (severity + file + line).
 * Each alert is then "enriched" with professional remediation context:
 * impact, risk, blast radius, effort, hours, score uplift, concrete
 * recommendations, acceptance criteria, first step, tooling, preventive
 * controls, and a rollback plan.
 *
 * `enrichAlert(category, ctx)` is a pure dispatcher — no I/O, no state.
 * `pushAlert(alerts, payload)` couples the enrichment to a caller's
 * alerts[] array (kept here to keep all alert logic in one place).
 *
 * Categories handled (case-insensitive):
 *   bloat / size  — file too large
 *   cycle         — circular import
 *   hotspot       — high fan-in × fan-out × size
 *   orphan        — no inbound references
 *   depth         — long dependency chain
 *   coupling      — god module (high fan-out)
 *   freshness     — long-untouched file
 *
 * Unknown categories fall through to a neutral default so the queue
 * still renders even for future category additions.
 */

const BASE_ALERT = {
    metric: '', impact: '', risk: '', blastRadius: '',
    effort: 'medium', estimatedHours: 0, scoreUplift: 0,
    recommendations: [], acceptance: [],
    firstStep: '', tooling: [], preventiveControls: [], rollbackPlan: '',
};

function bloatTemplate(ctx) {
    const lines = ctx?.lines || 0;
    const fanOut = ctx?.fanOut || 0;
    const over = lines > 2000 ? 'high' : lines > 1000 ? 'medium' : 'low';
    const hrs = lines > 2000 ? 16 : lines > 1000 ? 8 : 4;
    const blast = fanOut > 0 ? `${fanOut} direct importer(s)` : 'file-local + reviewers';
    return {
        metric: `${lines} LOC`,
        impact: 'Large file → high cognitive load, merge conflicts, review fatigue, slower onboarding.',
        risk: 'If left unfixed: every PR touching this file scales linearly in review time, and defect density compounds with each new branch.',
        blastRadius: blast,
        effort: over,
        estimatedHours: hrs,
        scoreUplift: lines > 1000 ? 8 : 4,
        recommendations: [
            `Split by responsibility: extract cohesive regions into ${ctx?.file || 'this file'}/{a,b}.ext and re-export from a barrel index.`,
            'Move pure helpers into a sibling <name>-utils.ext and unit-test them in isolation.',
            'Add a LOC budget (e.g., 500/1000) to lint or CI so the file cannot silently regress.',
            'After the split, re-run this report and confirm fan-out / depth drop before merge.',
        ],
        acceptance: [
            'Each split child ≤ 500 LOC (or project threshold) and single-responsibility.',
            'Public API unchanged — existing call sites compile without edits.',
            'Unit tests pass on every child; coverage ≥ pre-split baseline.',
            'Re-run this report: original file no longer triggers the bloat alert.',
        ],
        firstStep: `Open ${ctx?.file || 'the file'} and list its top-level responsibilities (one sentence each) — that list becomes the split plan.`,
        tooling: [
            { name: 'eslint-plugin-import', hint: 'enforce per-file LOC budgets via max-lines + boundary rules' },
            { name: 'knip', hint: 'confirm the split does not strand dead exports' },
            { name: 'madge', hint: 'visualize post-split dependency tree to confirm shallower depth' },
        ],
        preventiveControls: [
            'CI rule: fail any PR that adds > 100 LOC to a file already over 1000 LOC.',
            'Pre-commit hook: warn on files crossing 500 LOC.',
            'CODEOWNERS: require module-owner review on the barrel index file.',
        ],
        rollbackPlan: 'Revert the merge commit; the barrel index re-exports the original single file, so call sites are unaffected. Keep the split children behind a feature flag for one release if call sites were edited.',
    };
}

function cycleTemplate(ctx) {
    const len = ctx?.length || 2;
    const hrs = len >= 3 ? 12 : 6;
    return {
        metric: `cycle len ${len}`,
        impact: 'Circular import → init-order bugs, tree-shaking breakage, hot-reload instability, test interference.',
        risk: 'If left unfixed: bundlers may emit runtime errors in production-only configurations, and any edit to a cycle member can silently break the other.',
        blastRadius: `${len} module(s) in the cycle + their transitive importers`,
        effort: len >= 3 ? 'high' : 'medium',
        estimatedHours: hrs,
        scoreUplift: len >= 3 ? 12 : 6,
        recommendations: [
            'Extract the shared dependency into a lower-level module (types / interface / pure function) that both sides import.',
            'Invert one edge via dependency injection, an event bus, or a callback registry.',
            `Break the edge from the hottest member (${ctx?.hottest || 'see cycle path'}) first — it has the highest fan-in+fan-out.`,
            'For TypeScript: use `import type` to split runtime cycles from type-only cycles.',
            'Re-run cycle detection after each edge removal to catch regressions before they compound.',
        ],
        acceptance: [
            'Cycle detection (this analyzer) returns 0 cycles touching any of the original members.',
            'Bundled output size does not increase beyond noise (tree-shaking preserved).',
            'Cold-start / first-paint unchanged or improved.',
            'All existing tests pass without import-order shims.',
        ],
        firstStep: `Run \`madge --circular <entry>\` to list every edge in the cycle, then pick the single edge whose removal would break the loop with the smallest diff.`,
        tooling: [
            { name: 'madge', hint: 'detects + visualizes circular dependencies across JS/TS' },
            { name: 'dependency-cruiser', hint: 'fails CI on any new cycle, with auto-generated baseline' },
            { name: 'circular-dependency-plugin', hint: 'webpack build-time warning for runtime cycles' },
        ],
        preventiveControls: [
            'CI: dependency-cruiser rule `no-circular` on the affected subgraph.',
            'Pre-commit: madge --circular on staged import graphs.',
            'PR template: checkbox "Confirmed no new circular imports introduced".',
        ],
        rollbackPlan: 'Revert the edge-removal commit; the extracted interface can be inlined back into its origin module in a single patch. Keep the interface file for one release in case callers adopted it.',
    };
}

function hotspotTemplate(ctx) {
    const score = ctx?.score || 0;
    const fanOut = ctx?.fanOut || 0;
    const fanIn = ctx?.fanIn || 0;
    const blast = `${fanIn + fanOut} inbound+outbound edges`;
    return {
        metric: `hotspot ${score}`,
        impact: 'High fan-in × fan-out × size → a change ripples widely, raising defect risk and review cost.',
        risk: 'If left unfixed: any change here risks cascading defects across multiple call sites and inflates the blast radius of every release.',
        blastRadius: blast,
        effort: fanOut > 5 ? 'high' : 'medium',
        estimatedHours: fanOut > 5 ? 16 : 8,
        scoreUplift: Math.min(15, Math.round(score)),
        recommendations: [
            'Extract stable primitives (types, constants, pure helpers) into a leaf module that others depend on.',
            'Introduce a façade; have callers depend on the façade instead of reaching into internals.',
            'Convert large switch/if-else dispatch into a registry/map to shrink the hot core.',
            'Split the test suite by concern so a hotspot change does not trigger the full suite.',
            'Add a CODEOWNERS entry and a PR-size guardrail for this file.',
        ],
        acceptance: [
            'Hotspot score drops below 5.0 on the next analyzer run.',
            'Fan-out decreases or moves behind a façade boundary.',
            'No public API removed without a deprecation shim; call sites still type-check.',
            'CODEOWNERS entry added and enforced on the next PR touching the file.',
        ],
        firstStep: `Grep for all importers of ${ctx?.file || 'this file'} and group them by domain — the largest cluster becomes the first façade to extract.`,
        tooling: [
            { name: 'dependency-cruiser', hint: 'enforce fan-in / fan-out limits per module' },
            { name: 'knip', hint: 'surface unused exports the façade can drop' },
            { name: 'CodeSee', hint: 'visualize the dependency map around this hotspot' },
        ],
        preventiveControls: [
            'CI: fail if hotspot score on this file regresses beyond 5.0.',
            'CODEOWNERS: require 2 reviewers from the owning team for any PR touching the file.',
            'PR-size guard: cap diff size on this file at 200 LOC per PR.',
        ],
        rollbackPlan: 'Revert the façade PR; callers go back to importing internals directly. Keep the façade module empty but re-exported for one release to ease re-introduction.',
    };
}

function orphanTemplate(ctx) {
    return {
        metric: '0 inbound refs',
        impact: 'No inbound references → dead code or forgotten entry; inflates cognitive surface and bundle size.',
        risk: 'If left unfixed: drift between dead code and live APIs accumulates; future readers may revive stale behavior assuming it is current.',
        blastRadius: '0 dependents (direct) — risk is deletion-safety, not ripple',
        effort: 'low',
        estimatedHours: 2,
        scoreUplift: 3,
        recommendations: [
            'Grep for dynamic imports / reflection / string-based resolvers before deletion.',
            'Check `git log -- <file>` for the last touch and contact prior authors.',
            'Delete in a dedicated PR; if it turns out to be needed, `git revert` is cheap.',
            'If kept as a script entry, exclude it from the report scope via .ruiignore.',
        ],
        acceptance: [
            'No dynamic references found via grep across the repo.',
            'Build + test suite green after deletion (or file added to .ruiignore with rationale).',
            'Bundle size does not increase (confirms no accidental removal of a live entry).',
        ],
        firstStep: `Run \`git log --oneline -5 -- <file>\` and \`rg "require\\(|import(.*)<basename>"\` — if both come back empty, deletion is safe.`,
        tooling: [
            { name: 'knip', hint: 'automated dead-code detection across the repo' },
            { name: 'ts-prune', hint: 'finds unused TypeScript exports' },
            { name: 'depcheck', hint: 'flags unused dependencies and files' },
        ],
        preventiveControls: [
            'CI: knip --exit-code on every PR so dead code never lands.',
            'Pre-commit: warn on new files with 0 inbound references after 30 days.',
            '.ruiignore: explicit allow-list for intentional script entries.',
        ],
        rollbackPlan: 'Trivial — `git revert <merge>`. Because there are no inbound references, no call-site fixup is needed. Keep the deletion in its own PR to make revert surgical.',
    };
}

function depthTemplate(ctx) {
    const md = ctx?.maxDepth || 0;
    return {
        metric: `depth ${md}`,
        impact: 'Deep dependency chain → brittle builds, slow cold-start, cascading test failures.',
        risk: 'If left unfixed: cold-start and CI time grow with each new layer; a leaf change can fail tests in unrelated subtrees.',
        blastRadius: `${md} layers of transitive dependents`,
        effort: 'medium',
        estimatedHours: 8,
        scoreUplift: 5,
        recommendations: [
            'Flatten by grouping intermediate layers into a single façade module.',
            'Introduce interfaces at the boundary to decouple runtime chains.',
            'Hoist shared utilities to a top-level lib/ so leaves do not chain through internals.',
            'Cap max-depth in CI and fail the build above an agreed threshold.',
        ],
        acceptance: [
            'Max dependency depth drops below the project threshold (default 6).',
            'Cold-start / first-import time unchanged or improved.',
            'Façade covers the previous public surface — no call-site edits required.',
            'CI max-depth guard added and passing.',
        ],
        firstStep: `Run \`madge --depth <entry>\` and trace the single deepest path — the leaf at the bottom is where hoisting starts.`,
        tooling: [
            { name: 'madge', hint: 'reports max depth per entry; visualize as a tree' },
            { name: 'dependency-cruiser', hint: 'enforce max-depth rules in CI' },
            { name: 'bundle-analyzer', hint: 'see which layers contribute to cold-start' },
        ],
        preventiveControls: [
            'CI: dependency-cruiser rule `max-depth` at 6, fail above.',
            'PR template: checkbox "No new import chain exceeds 6 levels".',
            'ModuleOwnership map: require review from the owning team for any new layer.',
        ],
        rollbackPlan: 'Revert the façade commit; original intermediate layers reappear. Keep the façade file as a thin re-export for one release in case any caller adopted it.',
    };
}

function couplingTemplate(ctx) {
    const fanOut = ctx?.fanOut || 0;
    const blast = `${fanOut} direct dependents`;
    return {
        metric: `fan-out ${fanOut}`,
        impact: 'God module → changes ripple to many dependents, raising review burden and defect propagation.',
        risk: 'If left unfixed: every interface change cascades into N call sites, and the module becomes an undeclared critical path.',
        blastRadius: blast,
        effort: 'high',
        estimatedHours: Math.min(40, 8 + fanOut),
        scoreUplift: 6,
        recommendations: [
            'Cluster dependents by domain and split into domain-scoped façades.',
            'Apply the Interface Segregation Principle: expose only what each caller needs.',
            'Replace direct imports with a dependency-injection container for cross-cutting services.',
            'Add a module-boundary lint (e.g., dependency-cruiser) to enforce fan-out limits.',
        ],
        acceptance: [
            'Fan-out drops below 20 (or project threshold) on the next analyzer run.',
            'Each domain façade exposes only the APIs its cluster needs (ISP check).',
            'Module-boundary lint rule added and green on CI.',
            'No public API removed without a deprecation path for one release cycle.',
        ],
        firstStep: `List all ${fanOut} importers and cluster by top-level directory — each cluster maps to one domain façade.`,
        tooling: [
            { name: 'dependency-cruiser', hint: 'enforce per-module fan-out caps' },
            { name: 'madge', hint: 'visualize importer clusters' },
            { name: 'ts-morph', hint: 'script bulk refactors of import paths' },
        ],
        preventiveControls: [
            'CI: dependency-cruiser rule `no-god-modules` at fan-out 20.',
            'CODEOWNERS: require owning-team review on any PR that adds a new importer.',
            'PR template: checkbox "Confirmed fan-out did not increase".',
        ],
        rollbackPlan: 'Revert the façade-split PR; callers fall back to importing the original god module. Keep the façade files as re-exports for one release so adopters are not broken.',
    };
}

function freshnessTemplate(ctx) {
    const d = ctx?.ageDays || 0;
    return {
        metric: `${d}d stale`,
        impact: 'Long-untouched code → untested against current runtime; silent rot raises incident risk.',
        risk: 'If left unfixed: runtime drift goes undetected until the code path is exercised in production, typically during an incident.',
        blastRadius: 'self + any untested dynamic callers',
        effort: 'low',
        estimatedHours: 3,
        scoreUplift: 4,
        recommendations: [
            'Run a coverage + typecheck pass; if green, add a "reviewed" marker and bump mtime.',
            'If there is no owner, open an ADR proposing deletion vs. revival; decide within one sprint.',
            'Verify no dynamic references via grep + CI before adding to a purge PR.',
            'If kept, add an integration test pinning current behavior before future changes.',
        ],
        acceptance: [
            'Coverage + typecheck pass recorded in the PR description.',
            'Either deleted, added to .ruiignore with rationale, or covered by a new integration test.',
            'ADR linked if ownership is ambiguous.',
        ],
        firstStep: `Run \`git log --since="6 months ago" -- <file>\`; if empty, ping the last committer and ask: delete or revive?`,
        tooling: [
            { name: 'knip', hint: 'flags stale, unreferenced files' },
            { name: 'age-check', hint: 'CI guard that fails on files untouched > N days' },
            { name: 'coverage diff', hint: 'confirm the stale path is actually exercised' },
        ],
        preventiveControls: [
            'CI: monthly sweep flagging files untouched > 180 days.',
            'CODEOWNERS: every directory has a named owner.',
            'ADR template: "stale file" decision record linked from PR.',
        ],
        rollbackPlan: 'If deleted: `git revert <merge>` re-creates the file. If kept after review: bump mtime via an empty touch commit and add the new integration test in the same PR.',
    };
}

const TEMPLATES = {
    bloat: bloatTemplate,
    size: bloatTemplate,
    cycle: cycleTemplate,
    hotspot: hotspotTemplate,
    orphan: orphanTemplate,
    depth: depthTemplate,
    coupling: couplingTemplate,
    freshness: freshnessTemplate,
};

export function enrichAlert(category, ctx) {
    const c = (category || '').toLowerCase();
    const tmpl = TEMPLATES[c];
    return Object.assign({ ...BASE_ALERT }, tmpl ? tmpl(ctx) : {});
}

/**
 * Couple the enrichment to a caller's alerts[] array. We accept the
 * array as a parameter (rather than reading a module-level singleton) so
 * the same lib can serve multiple concurrent analyzer runs in tests.
 */
export function pushAlert(alerts, p) {
    const e = enrichAlert(p.category, p.ctx);
    alerts.push({
        severity: p.severity, marker: p.marker, category: p.category,
        file: p.file, line: p.line ?? null, message: p.message,
        metric: e.metric, impact: e.impact, risk: e.risk, blastRadius: e.blastRadius,
        effort: e.effort, estimatedHours: e.estimatedHours, scoreUplift: e.scoreUplift,
        recommendations: e.recommendations, acceptance: e.acceptance,
        firstStep: e.firstStep, tooling: e.tooling,
        preventiveControls: e.preventiveControls, rollbackPlan: e.rollbackPlan,
        cyclePath: p.cyclePath || '',
    });
}
