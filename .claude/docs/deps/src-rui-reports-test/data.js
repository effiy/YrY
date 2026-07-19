window.REPORT_DATA = {
  "meta": {
    "pageTitle": "test · six-scene self-check strategy (post-init → third-party)",
    "subtitle": "6 scenes · 6 facets · A–F grade · OWASP / NIST / CIS / SLSA compliance · risk register · 4-sprint roadmap",
    "upstream": "rui-reports/test",
    "footer": "rui-reports/test — archived static reference bundle · templates / references / rules kept for manual assembly or future replacement · rebuilt 2026-07-19"
  },
  "metrics": [
    {
      "label": "Scenes",
      "value": "6",
      "sub": "post-init · pre-commit · doc-code · security · cross-story · third-party",
      "tone": "cyan"
    },
    {
      "label": "Facets",
      "value": "6",
      "sub": "init · tests · docs · security · refs · deps",
      "tone": "green"
    },
    {
      "label": "Compliance",
      "value": "4",
      "sub": "OWASP · NIST · CIS · SLSA mappings",
      "tone": "amber"
    },
    {
      "label": "Grading",
      "value": "A–F",
      "sub": "composite score · pass/partial/fail per scene",
      "tone": "violet"
    },
    {
      "label": "Script",
      "value": "archived",
      "sub": "analyzer removed; templates retained",
      "tone": "rose"
    }
  ],
  "summaryCards": [
    {
      "tone": "cyan",
      "title": "What it actually does",
      "items": [
        "Runs (or documents) a six-scene self-check strategy on any local project — pinned by `rui-init` step 04-arch and emitted in fixed index order.",
        "Scene 1 — Post-Init Full Self-Check (init facet): verifies CLAUDE.md, README, docs/, tests, and manifest after a fresh `/rui-init` run.",
        "Scene 2 — Pre-Commit Incremental Self-Check (tests facet): verifies a test framework, at least one test file, and a coverage/scoped-test script (vitest, jest, pytest, etc.).",
        "Scene 3 — Doc-Code Consistency (docs facet): verifies doc count, root manifests, and a doc/code ratio threshold (≥ 0.05).",
        "Scene 4 — Security Surface Regression (security facet): checks env files, dangerous calls, and HTML count for secret / unsafe-eval / inline-script regressions.",
        "Scene 5 — Cross-Story Integration Regression (refs facet): checks story directories, link count, and broken-link count across the story tree.",
        "Scene 6 — Third-Party Framework & Service (deps facet): checks dep count, pinning ratio, and staleness against the current manifest."
      ]
    },
    {
      "tone": "violet",
      "title": "Grounded evidence",
      "items": [
        "SKILL.md is archived — the one-off analyzer entrypoint and CLI command have been removed; `templates/`, `references/`, and `rules/` are kept as source material for manual assembly or future replacement.",
        "`templates/data.js` defines the shape template: `REPORT_CONFIG.options` (scope, scopeTitle, generatedAt, theme, mergeScenes, version), `REPORT_CONFIG.constants` (sceneCount, passThreshold 0.9, partialThreshold 0.5, exclusionDirs), and `REPORT_DATA` (scope, score 0–100, grade A–F, summary, facets, inventory, 6 scenes, gradeScale, compliance, riskRegister, glossary, roadmap, metrics, activity).",
        "`references/scene-catalog.md` pins the 6 scene slugs, titles, icons, facets, and §0–§4 payload shape; any replacement analyzer MUST emit all six scenes in fixed index order.",
        "`references/methodology.md` documents the 5-stage §0–§4 lifecycle per scene (effect → steps → outputs → report → edge cases), the evidence block (raw facet probes driving §3), and the verdict/coverage rules.",
        "`rules/self-test-contracts.md` is the byte-stable payload contract — column names, severity thresholds, and per-facet probe lists are all defined here.",
        "Compliance map (`REPORT_DATA.compliance`) links the six scenes to OWASP Top 10, NIST SSDF, CIS Controls, and SLSA levels so a grade-A project is also audit-ready."
      ]
    },
    {
      "tone": "green",
      "title": "How to invoke",
      "items": [
        "The skill is no longer a runnable entrypoint; the page you are reading is the artifact, regenerated from external workflow scripts.",
        "The live report lives at `docs/test/index.html` with 5 scene pages under `docs/test/scene-{1..6}-*/index.md` and one root page that aggregates them.",
        "Each scene has a 5-section structure: §0 (effect + matters), §1 (numbered steps with `title` / `action` / `expected` / `file`), §2 (outputs with `path` / `type` / `description`), §3 (per-step report + overall verdict), §4 (edge cases, improvements, limitations).",
        "Composite score = mean(scene.coverage) × 100, rounded. Grade A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40. Per-scene verdict: pass ≥ 0.9, partial 0.5–0.89, fail < 0.5.",
        "If `mergeScenes` is true in `REPORT_CONFIG.options`, the analyzer merges per-scene evidence into a single scope-wide inventory before scoring.",
        "Roadmap is a 4-sprint remediation plan computed after the score gate; risk register ranks findings by severity / likelihood / effort."
      ]
    }
  ],
  "anchors": [
    {
      "match": "rui-reports/test/SKILL.md",
      "mode": "exact",
      "reason": "archived status + what remains"
    },
    {
      "match": "rui-reports/test/templates/data.js",
      "mode": "exact",
      "reason": "REPORT_CONFIG + REPORT_DATA shape + scene contract"
    },
    {
      "match": "rui-reports/test/references/scene-catalog.md",
      "mode": "exact",
      "reason": "6 scene slugs + §0–§4 payload shape"
    },
    {
      "match": "rui-reports/test/references/methodology.md",
      "mode": "exact",
      "reason": "5-stage lifecycle + verdict rules"
    },
    {
      "match": "rui-reports/test/rules/self-test-contracts.md",
      "mode": "exact",
      "reason": "byte-stable payload + threshold contract"
    }
  ],
  "links": [
    { "label": "Live test report (docs/test)", "href": "../../test/index.html" },
    { "label": "Scene 1 · post-init-full-self-check", "href": "../../test/scene-1-post-init-full-self-check/index.md" },
    { "label": "Scene 4 · security-surface-regression", "href": "../../test/scene-4-security-surface-regression/index.md" },
    { "label": "Scene 6 · third-party-framework-service", "href": "../../test/scene-6-third-party-framework-service/index.md" },
    { "label": "deps → src-rui-reports-test catalog card", "href": "../src-rui-reports-test/index.html" }
  ],
  "notes": [
    "Status: archived static reference bundle — the one-off analyzer script and the CLI command entry have been removed; future report generation must come from an external workflow or a future replacement implementation.",
    "Six scenes are emitted in fixed index order (1–6) with fixed slugs (`post-init-full-self-check`, `pre-commit-incremental-self-check`, `doc-code-consistency`, `security-surface-regression`, `cross-story-integration-regression`, `third-party-framework-service`). Reordering is not allowed.",
    "Six facets, one per scene: `init`, `tests`, `docs`, `security`, `refs`, `deps`. The facet field on each scene is the bridge between scene payloads and the inventory / activity blocks in `REPORT_DATA`.",
    "Composite grading: per-scene coverage 0..1; pass ≥ 0.9, partial 0.5..0.89, fail < 0.5. Composite = mean(coverage) × 100. Grade A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40.",
    "Compliance map covers OWASP Top 10, NIST SSDF, CIS Controls, and SLSA levels — every scene payload exposes a `compliance` block so a grade-A project is also audit-ready.",
    "Risk register is prioritized by severity / likelihood / effort, surfaced alongside the roadmap; the 4-sprint remediation plan is computed after the score gate, not before.",
    "`user_invocable: false` is intentional — this skill is invoked by the broader `rui-init` pipeline (step 05-verify) and by manual assembly, not as a standalone CLI."
  ],
  "diagram": {
    "mode": "catalog",
    "package": {
      "title": "test",
      "desc": [
        "6 scenes · 6 facets · A–F",
        "OWASP / NIST / CIS / SLSA"
      ],
      "stats": [
        "post-init → pre-commit → doc-code",
        "security → cross-story → third-party"
      ]
    },
    "dashboard": {
      "title": "Docs Home",
      "sub": "card source",
      "hint": "catalog card"
    },
    "anchor": {
      "title": "Anchors",
      "lines": [
        "SKILL.md · archived status",
        "templates/data.js · REPORT_DATA",
        "scene-catalog.md · 6 scenes",
        "methodology.md · §0–§4 lifecycle",
        "self-test-contracts.md · payload"
      ],
      "hint": "5 grounded hints"
    },
    "context": {
      "title": "Main Source Code",
      "sub": "skills/rui-reports"
    },
    "evidence": {
      "title": "Primary evidence",
      "sub": "6 scenes + 6 facets + 4-frameworks compliance",
      "hint": "analyzer archived, templates retained"
    },
    "report": {
      "title": "Report page",
      "sub": "docs/deps/src-rui-reports-test/index.html",
      "hint": "rebuilt 2026-07-19"
    }
  }
};
