window.REPORT_CONFIG = {
  "options": {
    "scope": "/Users/ruiyi/YrY",
    "scopeTitle": "YrY",
    "generatedAt": "2026-07-17T08:51:48.433Z",
    "theme": "dark",
    "mergeScenes": true,
    "version": "1.0"
  },
  "constants": {
    "sceneCount": 6,
    "passThreshold": 0.9,
    "partialThreshold": 0.5,
    "exclusionDirs": [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".next",
      ".turbo",
      "coverage",
      ".memory",
      ".claude",
      "target",
      "intermediate"
    ]
  },
  "labels": {
    "compositeScoreLabel": "Composite test Score",
    "gradeLabel": "Grade",
    "verdictLabel": "Verdict",
    "coverageLabel": "Coverage",
    "passCountLabel": "Scenes Passed",
    "partialCountLabel": "Scenes Partial",
    "failCountLabel": "Scenes Failed"
  }
};

window.REPORT_DATA = {
  "scope": "/Users/ruiyi/YrY",
  "score": 27,
  "grade": "F",
  "summary": {
    "totalScenes": 6,
    "passCount": 0,
    "partialCount": 1,
    "failCount": 5,
    "coverage": 0.272,
    "totalFiles": 823,
    "totalBytes": 22301200
  },
  "facets": {
    "init": {
      "hasClaude": false,
      "hasReadme": false,
      "hasDocs": true,
      "hasTests": false,
      "hasPackageJson": false,
      "hasPyproject": false,
      "hasGoMod": false,
      "hasCargoToml": false,
      "totalFiles": 823,
      "totalBytes": 22301200
    },
    "tests": {
      "framework": null,
      "testFileCount": 0,
      "testFiles": [],
      "hasFramework": false
    },
    "docs": {
      "docCount": 10,
      "codeCount": 556,
      "docRatio": 0.018,
      "files": [
        "docs/test/data.js",
        "docs/test/index.css",
        "docs/test/index.html",
        "docs/test/index.js",
        "docs/test/scene-1-post-init-full-self-check/index.md",
        "docs/test/scene-2-pre-commit-incremental-self-check/index.md",
        "docs/test/scene-3-doc-code-consistency/index.md",
        "docs/test/scene-4-security-surface-regression/index.md",
        "docs/test/scene-5-cross-story-integration-regression/index.md",
        "docs/test/scene-6-third-party-framework-service/index.md"
      ],
      "missingReadme": true,
      "missingClaude": true,
      "hasDocsDir": true
    },
    "security": {
      "envFileCount": 0,
      "envFiles": [],
      "dangerousCallCount": 28,
      "dangerousCalls": [
        {
          "file": "docs/test/data.js",
          "kind": "eval()"
        },
        {
          "file": "docs/test/data.js",
          "kind": "new Function()"
        },
        {
          "file": "docs/test/data.js",
          "kind": "innerHTML assignment"
        },
        {
          "file": "docs/test/data.js",
          "kind": "document.write"
        },
        {
          "file": "docs/test/data.js",
          "kind": "dangerouslySetInnerHTML"
        },
        {
          "file": "docs/test/scene-4-security-surface-regression/index.md",
          "kind": "eval()"
        },
        {
          "file": "docs/test/scene-4-security-surface-regression/index.md",
          "kind": "new Function()"
        },
        {
          "file": "docs/test/scene-4-security-surface-regression/index.md",
          "kind": "innerHTML assignment"
        },
        {
          "file": "docs/test/scene-4-security-surface-regression/index.md",
          "kind": "document.write"
        },
        {
          "file": "docs/test/scene-4-security-surface-regression/index.md",
          "kind": "dangerouslySetInnerHTML"
        },
        {
          "file": "YiPet/docs/arch/data.js",
          "kind": "eval()"
        },
        {
          "file": "YiPet/docs/files/app/mount.js",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/docs/files/index.html",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/tasks/bundle-js.js",
          "kind": "eval()"
        },
        {
          "file": "YiPet/tests/browser/e2e/shadow-dom.tests.ts",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/tests/inject/dynamic/color.tests.ts",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/tests/inject/dynamic/fixes.tests.ts",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/tests/inject/dynamic/image-analysis.tests.ts",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/tests/inject/dynamic/inline-override.tests.ts",
          "kind": "innerHTML assignment"
        },
        {
          "file": "YiPet/tests/inject/dynamic/link-override.tests.ts",
          "kind": "innerHTML assignment"
        }
      ],
      "htmlCount": 22,
      "hasEnvFile": false
    },
    "refs": {
      "storyDirCount": 1,
      "storyDirs": [
        "docs/test"
      ],
      "mdFileCount": 35,
      "totalLinks": 0,
      "brokenLinks": 0,
      "brokenRatio": 0,
      "byFile": {}
    },
    "deps": {
      "runtime": [],
      "dev": [],
      "items": [],
      "runtimeCount": 0,
      "devCount": 0,
      "totalCount": 0,
      "pinningRatio": 0,
      "staleCount": 0
    }
  },
  "inventory": {
    "totalFiles": 823,
    "totalBytes": 22301200,
    "typeGroups": {
      "JavaScript": [
        "js",
        "mjs",
        "cjs",
        "jsx"
      ],
      "TypeScript": [
        "ts",
        "tsx"
      ],
      "Vue": [
        "vue"
      ],
      "Python": [
        "py"
      ],
      "Go": [
        "go"
      ],
      "Rust": [
        "rs"
      ],
      "Java": [
        "java"
      ],
      "CSS/SCSS": [
        "css",
        "scss",
        "less"
      ],
      "HTML": [
        "html",
        "htm"
      ],
      "Markdown": [
        "md",
        "mdx"
      ],
      "JSON": [
        "json"
      ],
      "YAML": [
        "yaml",
        "yml"
      ],
      "Config": [
        "toml",
        "ini",
        "env"
      ],
      "Shell": [
        "sh",
        "bash",
        "zsh"
      ],
      "Image": [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "svg",
        "webp",
        "ico"
      ]
    },
    "items": [
      {
        "group": "TypeScript",
        "count": 286,
        "bytes": 1118780,
        "pct": 34.8
      },
      {
        "group": "JavaScript",
        "count": 232,
        "bytes": 5838998,
        "pct": 28.2
      },
      {
        "group": "Image",
        "count": 94,
        "bytes": 10226186,
        "pct": 11.4
      },
      {
        "group": "CSS/SCSS",
        "count": 71,
        "bytes": 349346,
        "pct": 8.6
      },
      {
        "group": "Markdown",
        "count": 35,
        "bytes": 235487,
        "pct": 4.3
      },
      {
        "group": "Other",
        "count": 34,
        "bytes": 2672846,
        "pct": 4.1
      },
      {
        "group": "JSON",
        "count": 29,
        "bytes": 1249229,
        "pct": 3.5
      },
      {
        "group": "HTML",
        "count": 22,
        "bytes": 234823,
        "pct": 2.7
      }
    ]
  },
  "scenes": [
    {
      "index": 1,
      "slug": "post-init-full-self-check",
      "title": "Post-Init Full Self-Check",
      "icon": "🚀",
      "facet": "init",
      "section0": {
        "effect": "Verifies that a fresh `/rui-init` run on YrY produces the five canonical bootstrapping artifacts — CLAUDE.md, README.md, docs/, a configured test framework, and a project manifest — and that each is non-empty and structurally well-formed. This scene is the contract gate between \"scaffolded\" and \"shippable\": it re-runs the init verifier against the post-init filesystem snapshot (823 files, 21.27 MiB) and asserts that no artifact is a stub, a placeholder, or missing.",
        "matters": "A green post-init self-check is the project's shippability contract. Any missing artifact propagates: a missing CLAUDE.md costs every future contributor ~15 minutes of orientation; a missing README breaks the GitHub landing page; a missing test framework means CI is a no-op on day one. The cost of fixing a regression here grows quadratically with the number of contributors who have already cloned.",
        "mermaid": "%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%\nflowchart LR\n  A([fresh clone]):::start\n  B[CLAUDE.md]:::artifact\n  C[README.md]:::artifact\n  D[docs/]:::artifact\n  E[tests run]:::artifact\n  M[manifest]:::artifact\n  F{{all green?}}:::decision\n  G[shippable]:::pass\n  H[regression — block merge]:::fail\n\n  A --> B\n  A --> C\n  A --> D\n  A --> E\n  A --> M\n  B --> F\n  C --> F\n  D --> F\n  E --> F\n  M --> F\n  F -- yes --> G\n  F -- no --> H\n\n  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff\n  classDef artifact fill:#1e293b,stroke:#22d3ee,color:#e2e8f0\n  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff\n  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff"
      },
      "section1": {
        "steps": [
          {
            "title": "CLAUDE.md present",
            "action": "Re-run `/rui-init` from the project root to regenerate the missing artifact (`claude`); if it still does not appear, inspect the pipeline state at `docs/.pipeline-state/profile.json`.",
            "expected": "Artifact regenerated on the next init pass; coverage improves to ≥ 0.90.",
            "file": "CLAUDE.md"
          },
          {
            "title": "README present",
            "action": "Re-run `/rui-init` from the project root to regenerate the missing artifact (`readme`); if it still does not appear, inspect the pipeline state at `docs/.pipeline-state/profile.json`.",
            "expected": "Artifact regenerated on the next init pass; coverage improves to ≥ 0.90.",
            "file": "README.md"
          },
          {
            "title": "docs/ directory exists",
            "action": "Verified present and non-empty during the Stage 1 file inventory walk (823 files scanned).",
            "expected": "File exists, is non-empty, and matches the rui-init artifact schema.",
            "file": "docs/"
          },
          {
            "title": "Test framework configured",
            "action": "Re-run `/rui-init` from the project root to regenerate the missing artifact (`tests`); if it still does not appear, inspect the pipeline state at `docs/.pipeline-state/profile.json`.",
            "expected": "Artifact regenerated on the next init pass; coverage improves to ≥ 0.90.",
            "file": "package.json#scripts.test"
          },
          {
            "title": "Project manifest (package.json / pyproject / go.mod / Cargo.toml)",
            "action": "Re-run `/rui-init` from the project root to regenerate the missing artifact (`manifest`); if it still does not appear, inspect the pipeline state at `docs/.pipeline-state/profile.json`.",
            "expected": "Artifact regenerated on the next init pass; coverage improves to ≥ 0.90.",
            "file": "package.json"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "CLAUDE.md",
            "type": "file",
            "description": "Claude project context — encodes profile, iron laws, and navigation table for AI assistants."
          },
          {
            "path": "README.md",
            "type": "file",
            "description": "Human-readable project overview — first file a new contributor reads on GitHub."
          },
          {
            "path": "docs/",
            "type": "dir",
            "description": "Generated documentation tree — arch/ and test/ story scenes plus the dashboard home."
          },
          {
            "path": "package.json",
            "type": "file",
            "description": "Project manifest — declares the test script and the dependency surface for Node ecosystems."
          },
          {
            "path": "docs/.pipeline-state/profile.json",
            "type": "file",
            "description": "Pipeline state snapshot — the deterministic input for the next /rui-init rebuild."
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": "CLAUDE.md present",
            "result": "❌",
            "notes": "CLAUDE.md missing — every new AI session starts cold. Run `/rui-init` to regenerate from profile.json."
          },
          {
            "step": "README present",
            "result": "❌",
            "notes": "README missing — external visitors see an empty repo page. Author one with: purpose, install, usage, license."
          },
          {
            "step": "docs/ directory exists",
            "result": "✅",
            "notes": "docs/ directory present with at least one file. Long-form content has a home."
          },
          {
            "step": "Test framework configured",
            "result": "❌",
            "notes": "No test framework — CI is a no-op. Install vitest/pytest/jest before writing more source."
          },
          {
            "step": "Project manifest (package.json / pyproject / go.mod / Cargo.toml)",
            "result": "❌",
            "notes": "No manifest detected — dependency surface is invisible to tooling."
          }
        ],
        "overall": "1/5 checks passed — not shippable — the init pipeline did not complete; rerun /rui-init and re-examine docs/.pipeline-state/profile.json."
      },
      "section4": {
        "edgeCases": [
          "A project that uses Nix flakes (flake.nix), Taskfile.yml, or Justfile as its manifest will not be detected by the package.json / pyproject / go.mod / Cargo.toml heuristic — it will show as a false negative.",
          "A monorepo with multiple manifests (root + workspaces) will only have the root manifest checked; per-workspace manifests are not enumerated.",
          "A CLAUDE.md that exists but is empty (zero bytes) currently passes the file-exists check; a follow-up should assert minimum content length.",
          "A docs/ directory containing only a single .gitkeep is structurally present but semantically empty — this scene does not distinguish the two."
        ],
        "improvements": [
          "Add a CONTRIBUTING.md — it is the first file a new contributor searches for and reduces onboarding friction.",
          "Pin the test framework version in the lockfile (package-lock.json / pnpm-lock.yaml) so the CI test step is reproducible across machines.",
          "Add a `preinstall` hook that asserts the Node version matches `engines.node` — prevents \"works on my machine\" drift.",
          "Wire the post-init self-check into CI as a required check so a broken init is caught before merge, not on the next contributor's clone."
        ],
        "limitations": [
          "Cannot detect test frameworks that have no config file (e.g., ad-hoc shell scripts invoked from package.json#scripts.test).",
          "Does not validate the *content* of CLAUDE.md / README.md — only their existence. A stub README passes.",
          "Does not detect monorepo workspace manifests (pnpm-workspace.yaml, turbo.json, nx.json)."
        ]
      },
      "coverage": 0.2,
      "evidence": [
        {
          "label": "CLAUDE.md present",
          "value": "false"
        },
        {
          "label": "README present",
          "value": "false"
        },
        {
          "label": "docs/ directory",
          "value": "true"
        },
        {
          "label": "Test framework configured",
          "value": "false"
        },
        {
          "label": "package.json",
          "value": "false"
        },
        {
          "label": "pyproject.toml",
          "value": "false"
        },
        {
          "label": "go.mod",
          "value": "false"
        },
        {
          "label": "Cargo.toml",
          "value": "false"
        },
        {
          "label": "Total files scanned",
          "value": "823"
        },
        {
          "label": "Total bytes",
          "value": "21.27 MiB"
        }
      ],
      "verdict": "fail"
    },
    {
      "index": 2,
      "slug": "pre-commit-incremental-self-check",
      "title": "Pre-Commit Incremental Self-Check",
      "icon": "🧪",
      "facet": "tests",
      "section0": {
        "effect": "Asserts that YrY has a wired pre-commit gate: a detected test framework (currently `none`), at least one test file (found: 0), and a way to scope the test run to the staged file set. The scene does NOT execute tests — it verifies the *wiring* exists so that a developer running `git commit` would hit the gate. The recommended invocation is `echo \"no test framework\"`, which restricts the run to the diff and keeps the feedback loop under 5 seconds for small changesets.",
        "matters": "A working pre-commit gate is the difference between a 5-second local feedback loop and a 15-minute CI round-trip. Without it, broken tests land on main, the next rebase fails for someone else, and trust in the green-CI badge erodes. Industry data (Google Engineering Productivity Research) shows that teams without pre-commit gates spend ~3× more time on CI debugging than teams with them.",
        "mermaid": "%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%\nflowchart TD\n  A([git diff --staged]):::start\n  B[changed files]:::step\n  C[map to test files]:::step\n  D[run scoped tests]:::step\n  E{{all green?}}:::decision\n  F[commit allowed]:::pass\n  G[block + surface failures]:::fail\n  H[developer fixes locally]:::step\n\n  A --> B\n  B --> C\n  C --> D\n  D --> E\n  E -- yes --> F\n  E -- no --> G\n  G --> H\n  H -.-> A\n\n  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff\n  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0\n  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff\n  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff"
      },
      "section1": {
        "steps": [
          {
            "title": "Detect test framework",
            "action": "Scan the scope root for vitest.config.{js,ts}, jest.config.{js,ts}, pytest.ini, conftest.py, go.mod, Cargo.toml, phpunit.xml, or a package.json#scripts.test entry.",
            "expected": "Exactly one framework is identified; current detection: none.",
            "file": "package.json"
          },
          {
            "title": "Count test files",
            "action": "Match *.test.{js,ts,…} / *.spec.* / __tests__/ directories across the scope (excluding node_modules, .git, dist, build).",
            "expected": "N > 0; current count: 0.",
            "file": "<no test files detected>"
          },
          {
            "title": "Run scoped tests on staged files",
            "action": "N/A — no framework detected; the gate cannot be wired until a framework is installed.",
            "expected": "Tests for the changed files pass in under 5 seconds for small diffs; the commit is blocked on failure.",
            "file": ".git/hooks/pre-commit"
          },
          {
            "title": "Verify coverage instrumentation",
            "action": "Inspect the test config for --coverage flags and a coverage threshold (e.g., vitest.config coverage.thresholds.lines).",
            "expected": "Coverage is configured with a minimum threshold; the gate fails below it.",
            "file": "vitest.config.ts"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "package.json#scripts.test",
            "type": "config",
            "description": "NPM test script — the canonical entry point for CI and local runs."
          },
          {
            "path": "vitest.config.*",
            "type": "config",
            "description": "Vitest configuration — defines environment, coverage, and threshold settings."
          },
          {
            "path": ".husky/pre-commit",
            "type": "file",
            "description": "Git pre-commit hook — gates the commit on lint + scoped test."
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": "Test framework detected (none)",
            "result": "❌",
            "notes": "missing — see improvement suggestions"
          },
          {
            "step": "0 test file(s) present",
            "result": "❌",
            "notes": "missing — see improvement suggestions"
          },
          {
            "step": "Coverage script configured",
            "result": "❌",
            "notes": "Framework does not expose a scoped-run flag — full suite runs on every commit, risking > 30s gate latency."
          }
        ],
        "overall": "No pre-commit gate — CI is the only line of defense. Install a framework and wire the hook before adding more source code."
      },
      "section4": {
        "edgeCases": [
          "A project with only smoke tests (no behavioral assertions) will not be flagged here — it still passes the file-count check, but the gate provides no real protection.",
          "Vitest in watch mode (--watch) does not produce CI-friendly output and will hang the commit; ensure the pre-commit invocation uses the non-interactive `run` subcommand.",
          "A monorepo with per-package test frameworks will only have the root framework detected; workspace-scoped frameworks (e.g., apps/web/vitest.config.ts) are not enumerated.",
          "Tests that depend on a running service (database, Redis) will fail in the pre-commit hook unless a docker-compose dev environment is started first."
        ],
        "improvements": [
          "Add a husky / lefthook pre-commit hook that runs `lint-staged` + `vitest run --changed` — keeps the loop under 5 seconds.",
          "Add `--coverage --changed` and fail the hook below a coverage threshold (e.g., 80% lines) to prevent regression.",
          "Cache test results per-file using vitest's --isolate=false for unchanged modules — cuts the gate latency by ~40% on medium repos.",
          "Surface the pre-commit output as a structured JSON for IDE integrations (VS Code Test Results panel)."
        ],
        "limitations": [
          "Static analysis cannot run the tests — it only verifies the wiring exists. A misconfigured framework (wrong env, missing setup file) will pass this scene but fail at runtime.",
          "Coverage thresholds in CI are not verified here — they live in the CI YAML, not in the project source.",
          "Cannot detect E2E frameworks (Playwright, Cypress) that require a running dev server — those are flagged in Scene 6."
        ]
      },
      "coverage": 0.1,
      "evidence": [
        {
          "label": "Detected framework",
          "value": "(none)"
        },
        {
          "label": "Test file count",
          "value": "0"
        },
        {
          "label": "Has framework",
          "value": "false"
        },
        {
          "label": "Sample test files",
          "value": "(none)"
        }
      ],
      "verdict": "fail"
    },
    {
      "index": 3,
      "slug": "doc-code-consistency",
      "title": "Doc-Code Consistency",
      "icon": "📚",
      "facet": "docs",
      "section0": {
        "effect": "Cross-references every file path mentioned in the documentation set (10 files: CLAUDE.md, README, docs/**, .github/**) against the actual filesystem snapshot (556 code files). Detects three classes of drift: (a) stale paths — the doc references a file that no longer exists; (b) orphaned sections — a doc section documents a feature with no corresponding source; (c) missing canonical docs — README or CLAUDE.md absent at the root. The doc-to-code ratio (0.018) is a leading indicator of under-documentation: below 0.05 typically means new features are landing without docs.",
        "matters": "Stale documentation is worse than missing documentation — it lies with confidence. A new contributor following a broken path in CLAUDE.md loses ~20 minutes and forms a lasting negative impression of the project. A missing README breaks the GitHub landing page, which is the primary discovery surface for external users. Doc-code drift is the #1 cause of \"why doesn't this work?\" support load on maintainers.",
        "mermaid": "%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%\nflowchart TD\n  A([md files]):::input\n  B[extract links]:::step\n  C[resolve paths]:::step\n  D{{file exists?}}:::decision\n  E[valid]:::pass\n  F[broken — surface to user]:::fail\n  G[CI gate fails]:::fail\n  H[doc-code in sync]:::pass\n\n  A --> B\n  B --> C\n  C --> D\n  D -- yes --> E\n  D -- no --> F\n  F --> G\n  E --> H\n\n  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff\n  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0\n  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff\n  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff"
      },
      "section1": {
        "steps": [
          {
            "title": "Inventory documentation files",
            "action": "Match CLAUDE.md, README{,.md}, CONTRIBUTING{,.md}, CHANGELOG{,.md}, LICENSE{,.*}, docs/**, .github/** against the scope.",
            "expected": "N > 0; current count: 10.",
            "file": "docs/"
          },
          {
            "title": "Verify root manifest docs",
            "action": "Check README and CLAUDE.md are present and non-empty at the scope root.",
            "expected": "Both present; README ≥ 200 bytes; CLAUDE.md ≥ 500 bytes.",
            "file": "README.md"
          },
          {
            "title": "Compute doc-to-code ratio",
            "action": "docFiles / codeFiles, where codeFiles = \\.(js|ts|mjs|cjs|jsx|tsx|vue|py|go|java|rs|css|scss)$.",
            "expected": "≥ 0.05 (one doc per ~20 source files); current: 0.018.",
            "file": "docs/"
          },
          {
            "title": "Audit markdown link integrity",
            "action": "For each .md file, extract [text](path) links, resolve relative to the file's directory, and verify the target exists on disk. (Delegates to Scene 5 for the full audit.)",
            "expected": "Zero broken file-path links.",
            "file": "docs/"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "docs/test/data.js",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/index.css",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/index.html",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/index.js",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/scene-1-post-init-full-self-check/index.md",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/scene-2-pre-commit-incremental-self-check/index.md",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/scene-3-doc-code-consistency/index.md",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          },
          {
            "path": "docs/test/scene-4-security-surface-regression/index.md",
            "type": "file",
            "description": "Documentation file — content is not validated, only existence."
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": "10 documentation file(s) present",
            "result": "✅",
            "notes": "10 documentation file(s) detected. Sample: docs/test/data.js, docs/test/index.css, docs/test/index.html."
          },
          {
            "step": "README present at root",
            "result": "❌",
            "notes": "README missing — the most-visited project page is empty."
          },
          {
            "step": "CLAUDE.md present at root",
            "result": "❌",
            "notes": "CLAUDE.md missing — every AI session starts cold."
          },
          {
            "step": "docs/ directory exists",
            "result": "✅",
            "notes": "docs/ directory exists with content — long-form documentation has a home."
          },
          {
            "step": "Doc-to-code ratio: 0.018 (target ≥ 0.05)",
            "result": "❌",
            "notes": "Doc-to-code ratio 0.018 < 0.05 — documentation is sparse relative to code (556 code files)."
          }
        ],
        "overall": "Significant drift — regenerate the docs tree and audit every broken path before the next release."
      },
      "section4": {
        "edgeCases": [
          "Documentation in non-Markdown formats (RST, AsciiDoc, org-mode) is not detected by the .md$ glob — it will show as missing.",
          "Anchors (#section-name) within a markdown file are not verified — only file targets. A broken anchor is a UX bug but not a regression.",
          "A README that exists but contains only a stub (\"# TODO\") passes the presence check; a content-quality check is out of scope.",
          "Generated docs (e.g., TypeDoc, JSDoc) may appear in docs/ after a build — they inflate the doc count without adding human-written content."
        ],
        "improvements": [
          "Run this report in CI and fail the build on brokenLinks > 0 — prevents drift from landing on main.",
          "Move API references into generated docs (TypeDoc / mkdocs) to eliminate manual link rot in the hand-written surface.",
          "Add a markdown linter (markdownlint) with a link-check rule (markdown-link-check) to catch drift in PRs.",
          "Set a coverage threshold for docs: enforce doc-to-code ratio ≥ 0.05 as a required CI check."
        ],
        "limitations": [
          "Link rot in external URLs (https://…) is not detected — would need HEAD requests, which slow the report.",
          "Does not validate doc content quality — a stub README passes.",
          "Cannot detect semantic drift (a doc that accurately describes the wrong behavior)."
        ]
      },
      "coverage": 0.4,
      "evidence": [
        {
          "label": "Documentation files",
          "value": "10"
        },
        {
          "label": "Code files",
          "value": "556"
        },
        {
          "label": "Doc-to-code ratio",
          "value": "0.018"
        },
        {
          "label": "README at root",
          "value": "false"
        },
        {
          "label": "CLAUDE.md at root",
          "value": "false"
        },
        {
          "label": "docs/ directory",
          "value": "true"
        }
      ],
      "verdict": "fail"
    },
    {
      "index": 4,
      "slug": "security-surface-regression",
      "title": "Security Surface Regression",
      "icon": "🔐",
      "facet": "security",
      "section0": {
        "effect": "Maps the project's security surface across three dimensions: (1) environment files — 0 .env* files, each of which must be in .gitignore; (2) dangerous API calls — 28 occurrence(s) of eval(), new Function(), innerHTML assignment, document.write, dangerouslySetInnerHTML, or child_process.exec/spawn; (3) HTML entry points — 22 .html file(s) that may need CSP review. Each finding is a static signal: it does not prove a vulnerability, but it flags a location for human review. The scene fails when the dangerous-call count crosses the baseline threshold (5) — a regression that should block the commit.",
        "matters": "Security surface changes are the highest-signal diff you can review. A new innerHTML assignment is a potential XSS vector; a new child_process.exec is a potential command-injection vector; a new .env file not in .gitignore is a potential secret leak. These are the changes that land CVEs in production. A 200-line refactor is rarely a security incident; a 1-line innerHTML= often is.",
        "mermaid": "%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%\nflowchart LR\n  A([scope]):::start\n  B[.env files]:::facet\n  C[dangerous calls]:::facet\n  D[HTML entry points]:::facet\n  E[gitignore check]:::step\n  F[baseline diff]:::step\n  G[CSP review]:::step\n  H[[surface map]]:::output\n  I{{regression?}}:::decision\n  J[block commit]:::fail\n  K[stable]:::pass\n\n  A --> B\n  A --> C\n  A --> D\n  B --> E\n  C --> F\n  D --> G\n  E --> H\n  F --> H\n  G --> H\n  H --> I\n  I -- yes --> J\n  I -- no --> K\n\n  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff\n  classDef facet fill:#1e293b,stroke:#22d3ee,color:#e2e8f0\n  classDef step fill:#374151,stroke:#9ca3af,color:#f3f4f6\n  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff\n  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff\n  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff"
      },
      "section1": {
        "steps": [
          {
            "title": "Inventory .env files",
            "action": "Match ^\\.env(\\.\\w+)?$ at the scope root and in each workspace. For each match, verify the file is listed in .gitignore.",
            "expected": "Every .env* file is gitignored; no secrets are tracked by git.",
            "file": ".env (none detected)"
          },
          {
            "title": "Detect dangerous API calls",
            "action": "Scan every source file (< 256 KiB) for: eval(, new Function(, innerHTML=, document.write(, dangerouslySetInnerHTML, child_process.exec/spawn(. Record file + kind for each match.",
            "expected": "Zero new occurrences since last baseline; current total: 28.",
            "file": "docs/test/data.js"
          },
          {
            "title": "Count HTML entry points",
            "action": "Match \\.html?$ across the scope. Each entry point is a candidate for CSP review (script-src, object-src).",
            "expected": "N files; each should ship a CSP meta tag or a Content-Security-Policy header. Current: 22.",
            "file": "<html entry points>"
          },
          {
            "title": "Cross-check .gitignore coverage",
            "action": "Read .gitignore and assert every .env* file is matched by a pattern. Fail if any .env file is tracked by git.",
            "expected": "All .env* files gitignored.",
            "file": ".gitignore"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "docs/test/data.js",
            "type": "file",
            "description": "Dangerous call: eval() — review for sanitization / input validation."
          },
          {
            "path": "docs/test/data.js",
            "type": "file",
            "description": "Dangerous call: new Function() — review for sanitization / input validation."
          },
          {
            "path": "docs/test/data.js",
            "type": "file",
            "description": "Dangerous call: innerHTML assignment — review for sanitization / input validation."
          },
          {
            "path": "docs/test/data.js",
            "type": "file",
            "description": "Dangerous call: document.write — review for sanitization / input validation."
          },
          {
            "path": "docs/test/data.js",
            "type": "file",
            "description": "Dangerous call: dangerouslySetInnerHTML — review for sanitization / input validation."
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": "0 .env file(s) — gitignore reviewed",
            "result": "✅",
            "notes": "No .env files detected — configuration is env-vars-only or loaded from a secrets manager."
          },
          {
            "step": "No hard-coded secrets in source",
            "result": "⚠️",
            "notes": "28 dangerous call(s) detected. First finding: docs/test/data.js (eval())."
          },
          {
            "step": "Dangerous-call count within baseline (found 28, threshold < 5)",
            "result": "⚠️",
            "notes": "Dangerous-call count 28 ≥ 5 — security surface is expanding. Each new finding needs a security review."
          }
        ],
        "overall": "Significant surface change — block the commit and run a dedicated security review."
      },
      "section4": {
        "edgeCases": [
          "innerHTML used inside a sanitizer (DOMPurify.sanitize(...)) is a false positive — manual review needed to confirm the sanitizer is in place.",
          "child_process is legitimate for build scripts (esbuild, vite); the heuristic cannot distinguish runtime use from build-time use.",
          "A .env.example file (intended to be committed) will match the .env glob — exclude it explicitly in the gitignore check.",
          "Server-side template rendering (e.g., Next.js getServerSideProps) may produce innerHTML= in compiled output that does not appear in source — the scan only covers source files."
        ],
        "improvements": [
          "Add a CI grep gate (e.g., eslint-plugin-security for JS, bandit for Python) that fails on new eval(, innerHTML=, and child_process.exec occurrences.",
          "Add `.env*` to .gitignore and document the env contract (required vs optional vars) in CLAUDE.md and README.md.",
          "Adopt a CSP meta tag in every HTML entry point: <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'>.",
          "Run `npm audit --omit=dev` in CI to catch known CVEs in the third-party surface (see Scene 6)."
        ],
        "limitations": [
          "Cannot detect SSRF, prototype pollution, or other runtime-only vulnerabilities — those require dynamic analysis (DAST).",
          "Does not evaluate the strength of sanitizers — DOMPurify with a permissive config still passes.",
          "Cannot detect secrets in git history (already-committed secrets require git-secrets or trufflehog)."
        ]
      },
      "coverage": 0.333,
      "evidence": [
        {
          "label": ".env files",
          "value": "0"
        },
        {
          "label": "Dangerous-call findings",
          "value": "28"
        },
        {
          "label": "HTML entry points",
          "value": "22"
        },
        {
          "label": "Sample findings",
          "value": "docs/test/data.js (eval()); docs/test/data.js (new Function()); docs/test/data.js (innerHTML assignment)"
        }
      ],
      "verdict": "fail"
    },
    {
      "index": 5,
      "slug": "cross-story-integration-regression",
      "title": "Cross-Story Integration Regression",
      "icon": "🔗",
      "facet": "refs",
      "section0": {
        "effect": "Walks every markdown file (35 files), extracts each `[text](path)` link, and resolves the path relative to the file's directory. Three link classes are handled: (a) intra-repo file links — resolved against the filesystem; (b) external URLs (https://…) — skipped, would require a HEAD request; (c) anchor-only links (#section) — skipped, would require parsing the target file's heading tree. The audit produces a per-file broken-count and a global broken ratio (0.0%). A non-zero broken count is a hard regression: the next reader who follows the link hits a 404.",
        "matters": "Cross-story integrity is the trust contract between skills. When docs/arch/scene-1 references docs/test/scene-3, and that target has been renamed, the entire narrative collapses for the reader. The broken ratio (0.0%) is the single most predictive metric of \"is the docs tree maintained\" — above 5% correlates with abandoned documentation.",
        "mermaid": "%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%\nflowchart LR\n  A([md files]):::input\n  B[extract links]:::step\n  C[resolve paths]:::step\n  D{{broken?}}:::decision\n  E[broken-link alert]:::fail\n  F[ok]:::pass\n  G[CI gate fails]:::fail\n  H[trust contract intact]:::pass\n\n  A --> B\n  B --> C\n  C --> D\n  D -- yes --> E\n  D -- no --> F\n  E --> G\n  F --> H\n\n  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff\n  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0\n  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff\n  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff"
      },
      "section1": {
        "steps": [
          {
            "title": "Inventory story directories",
            "action": "Check for docs/arch, docs/test, docs/reports — the three canonical story trees in the rui-init layout.",
            "expected": "≥ 2 directories present; current: 1 (docs/test).",
            "file": "docs/test"
          },
          {
            "title": "Audit markdown links",
            "action": "For each .md file, match [text](path) with a global regex; resolve each non-external, non-anchor path relative to the file's directory; check fs.existsSync.",
            "expected": "All file-path links resolve; current broken: 0 of 0.",
            "file": "docs/"
          },
          {
            "title": "Count markdown files",
            "action": "Match \\.md$ across the scope (excluding node_modules, .git, dist, build).",
            "expected": "≥ 5 files; current: 35.",
            "file": "docs/"
          },
          {
            "title": "Compute broken ratio",
            "action": "brokenLinks / totalLinks — a normalized drift metric.",
            "expected": "≤ 0.01 (1%); current: 0.0%.",
            "file": "docs/"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "docs/test",
            "type": "dir",
            "description": "Story directory — contains scene-N-* subdirectories with index.md files."
          },
          {
            "path": "docs/",
            "type": "dir",
            "description": "35 markdown files, 0 links audited, 0 broken."
          },
          {
            "path": "docs/.pipeline-state/",
            "type": "dir",
            "description": "Pipeline state — the deterministic input that the link audit runs against."
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": "1 story director(ies) present",
            "result": "❌",
            "notes": "Only 1 story director(ies) found: docs/test. Expected ≥ 2 (docs/arch, docs/test)."
          },
          {
            "step": "0 doc link(s) audited",
            "result": "❌",
            "notes": "Zero cross-reference links — the docs tree is an island. Add links between scenes to form a navigable narrative."
          },
          {
            "step": "0 broken link(s)",
            "result": "✅",
            "notes": "Zero broken links — every cross-reference resolves. Broken ratio: 0.0%."
          },
          {
            "step": "35 markdown file(s)",
            "result": "✅",
            "notes": "35 markdown files — non-trivial docs surface."
          }
        ],
        "overall": "0 broken link(s) to fix — run /rui-init to regenerate the scene tree, then re-audit."
      },
      "section4": {
        "edgeCases": [
          "External URLs (https://…) are skipped — verifying them would require a network round-trip and rate-limit handling. Use a separate link-checker (lychee, markdown-link-check) for external URLs.",
          "Anchor-only links (#section) are not verified — they require parsing the target file's heading tree, which is out of scope for this static pass.",
          "Links to dynamically generated files (e.g., docs/api/index.html emitted by TypeDoc) are flagged as broken even if they exist at runtime — exclude such paths via a .linkcheck-ignore file.",
          "Case-sensitive filesystems (Linux) will flag a link to Docs/Readme.md when the file is docs/README.md; macOS (case-insensitive) will not — CI should run on Linux to catch this."
        ],
        "improvements": [
          "Add a CI gate: fail the build if brokenLinkCount > 0 — prevents drift from landing on main.",
          "Adopt lychee (Rust-based, fast) or markdown-link-check as a pre-merge link checker for both internal and external URLs.",
          "Generate the docs scene tree via /rui-init on every PR — the regenerated links are guaranteed to resolve.",
          "Add a redirect map (_redirects or _redirects.json) for renamed scenes — preserves external inbound links."
        ],
        "limitations": [
          "Cannot detect cycles between scenes (A → B → A is allowed but suspicious) — cycle detection is out of scope.",
          "Cannot verify external URLs without network access — pair this scene with a runtime link-checker in CI.",
          "Does not validate that the link text matches the target's title — a link titled \"Scene 3\" pointing to Scene 4 is a UX bug but not a regression."
        ]
      },
      "coverage": 0.5,
      "evidence": [
        {
          "label": "Story directories",
          "value": "docs/test"
        },
        {
          "label": "Markdown files",
          "value": "35"
        },
        {
          "label": "Total links audited",
          "value": "0"
        },
        {
          "label": "Broken links",
          "value": "0"
        },
        {
          "label": "Broken ratio",
          "value": "0.0%"
        }
      ],
      "verdict": "partial"
    },
    {
      "index": 6,
      "slug": "third-party-framework-service",
      "title": "Third-Party Framework & Service",
      "icon": "🧩",
      "facet": "deps",
      "section0": {
        "effect": "Catalogues every direct dependency declared in package.json — 0 runtime + 0 dev (0 total). Each entry is enriched with: (a) version specifier (^, ~, exact, *); (b) category — ui, state, router, build, test, util, style, or other; (c) staleness signal — estimated from the last published version (registry round-trip not performed in this static pass). The pinning ratio (0%) is the share of dependencies pinned to an exact version or a git/file specifier; below 50% indicates the lockfile is the only reproducibility guarantee, which is fragile.",
        "matters": "A single stale dependency is how a CVE lands in production. The third-party surface is the project's biggest unowned risk: you did not write the code, you cannot audit it line-by-line, and the maintainer may be unreachable. The 2018 event-stream incident (a popular package acquired and backdoored) is the canonical example — the only defense is pinning + audit + minimal dependency count.",
        "mermaid": "%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%\nflowchart LR\n  A([manifest files]):::input\n  B[parse deps]:::step\n  C{{version pinned?}}:::decision\n  D[stable]:::pass\n  E[pin in CI]:::warn\n  F[stale check]:::step\n  G[3y+ → critical]:::fail\n  H[category map]:::step\n  I[risk surface]:::output\n\n  A --> B\n  B --> C\n  C -- yes --> D\n  C -- no --> E\n  B --> F\n  F --> G\n  B --> H\n  H --> I\n\n  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff\n  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0\n  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff\n  classDef warn fill:#b45309,stroke:#f59e0b,color:#fff\n  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff\n  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff"
      },
      "section1": {
        "steps": [
          {
            "title": "Parse package.json",
            "action": "Read dependencies + devDependencies from the root package.json. Tolerate JSON5-style comments via a regex fallback.",
            "expected": "N entries each; current: 0 runtime, 0 dev.",
            "file": "package.json"
          },
          {
            "title": "Check version pinning",
            "action": "For each entry, classify the specifier: exact (\\d+), caret (^), tilde (~), wildcard (*), git+url, file:. Compute the pinning ratio = exact+git+file / total.",
            "expected": "≥ 50% pinned; current: 0%.",
            "file": "package.json"
          },
          {
            "title": "Catalog by category",
            "action": "Map package names to categories via the CATEGORY_HINTS table (ui, state, router, build, test, util, style, other).",
            "expected": "Every package categorized; the category distribution reveals the project's shape.",
            "file": "package.json"
          },
          {
            "title": "Staleness check",
            "action": "Compare each package's last-publish date to today. This static pass cannot hit the registry, so staleCount is a lower bound — run `npm outdated` in CI for the real number.",
            "expected": "Zero packages stale by > 3 years.",
            "file": "package.json"
          },
          {
            "title": "Lockfile presence",
            "action": "Verify package-lock.json / pnpm-lock.yaml / yarn.lock exists at the scope root.",
            "expected": "Lockfile present — required for `npm ci` reproducibility.",
            "file": "package-lock.json"
          }
        ]
      },
      "section2": {
        "outputs": []
      },
      "section3": {
        "report": [
          {
            "step": "0 runtime dependenc(ies) catalogued",
            "result": "❌",
            "notes": "Zero runtime dependencies — the project has no declared third-party surface. Confirm this is intentional (e.g., a pure-typing package)."
          },
          {
            "step": "0 dev dependenc(ies) catalogued",
            "result": "❌",
            "notes": "Zero dev dependencies — no test runner, linter, or build tooling declared. Dev experience will suffer."
          },
          {
            "step": "Version pinning ratio: 0% (target ≥ 50%)",
            "result": "❌",
            "notes": "Pinning ratio 0% < 50% — the lockfile is the only reproducibility guarantee. Replace ^ and ~ with exact versions."
          },
          {
            "step": "No 3+ year-stale dependencies",
            "result": "✅",
            "notes": "No 3+ year-stale dependencies detected (static estimate — confirm with `npm outdated` or `pip list --outdated`)."
          }
        ],
        "overall": "Significant third-party risk — catalog is empty or pinning is below threshold. Block the release until resolved."
      },
      "section4": {
        "edgeCases": [
          "Private registries (npm enterprise, Artifactory) are not checked for staleness — the registry round-trip requires auth that the static pass does not have.",
          "Transitive dependencies (node_modules/**) are not enumerated — only direct deps from package.json. A vulnerable transitive dep (e.g., lodash < 4.17.12) is invisible here; use `npm audit` for that.",
          "A package.json with JSON5 comments (allowed by pnpm) will fail JSON.parse — the regex fallback extracts deps but may miss edge cases.",
          "Monorepo workspaces (pnpm-workspace.yaml) are not enumerated — only the root package.json is parsed."
        ],
        "improvements": [
          "Run `npm audit --omit=dev` in CI to catch known CVEs in both direct and transitive dependencies.",
          "Adopt `npm ci` over `npm install` in CI — enforces the lockfile and fails on drift.",
          "Add Renovate or Dependabot to auto-bump dependencies monthly — keeps the surface fresh without manual toil.",
          "Adopt `pnpm` with a strict node-linker to surface phantom dependencies at install time.",
          "Pin every dependency to an exact version (drop ^ and ~) — the lockfile becomes the only source of truth and `npm ci` is fully reproducible."
        ],
        "limitations": [
          "Cannot evaluate license compatibility (MIT vs GPL vs AGPL) — use license-checker or oss-license-audit for that.",
          "Cannot detect abandoned-but-still-installed packages without a registry round-trip — pair with `npm outdated`.",
          "Cannot detect typosquatting (e.g., `lodahs` instead of `lodash`) — use socket.dev or npm-audit-resolver for that."
        ]
      },
      "coverage": 0.1,
      "evidence": [
        {
          "label": "Runtime dependencies",
          "value": "0"
        },
        {
          "label": "Dev dependencies",
          "value": "0"
        },
        {
          "label": "Total dependencies",
          "value": "0"
        },
        {
          "label": "Pinning ratio",
          "value": "0%"
        },
        {
          "label": "Stale count (estimated)",
          "value": "0"
        }
      ],
      "verdict": "fail"
    }
  ],
  "gradeScale": [
    {
      "grade": "A",
      "min": 90,
      "tone": "pass"
    },
    {
      "grade": "B",
      "min": 75,
      "tone": "pass"
    },
    {
      "grade": "C",
      "min": 60,
      "tone": "warn"
    },
    {
      "grade": "D",
      "min": 40,
      "tone": "warn"
    },
    {
      "grade": "F",
      "min": 0,
      "tone": "fail"
    }
  ],
  "compliance": [
    {
      "framework": "OWASP ASVS 4.0",
      "area": "Supply Chain & Configuration",
      "controls": [
        {
          "id": "14.1.1",
          "text": "Verify that all components are pinned to a version and the lockfile is the source of truth.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        },
        {
          "id": "14.2.1",
          "text": "Verify that unused or stale dependencies are identified and removed on a recurring schedule.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        },
        {
          "id": "5.3.4",
          "text": "Verify that untrusted HTML inputs are reviewed for dangerous sinks (innerHTML, eval).",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        },
        {
          "id": "5.3.5",
          "text": "Verify that command execution paths do not concatenate untrusted input.",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        }
      ]
    },
    {
      "framework": "NIST SSDF",
      "area": "Secure Software Development Framework",
      "controls": [
        {
          "id": "PS.1",
          "text": "Protect sensitive information from unauthorized disclosure — .env files, secrets in repo.",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        },
        {
          "id": "PS.2",
          "text": "Meet each security requirement — baseline surface map and regression diff.",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        },
        {
          "id": "PS.3",
          "text": "Reuse proven security solutions — vetted third-party frameworks, pinned.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        },
        {
          "id": "PW.4.1",
          "text": "Acquire well-secured components — pinning ratio ≥ 0.5.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        },
        {
          "id": "PW.7.1",
          "text": "Design code to protect against expected threats — security facet regression gate.",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        },
        {
          "id": "RV.1",
          "text": "Identify and confirm vulnerabilities — test across all six scenes.",
          "sceneSlug": "post-init-full-self-check",
          "sceneIndex": 1
        }
      ]
    },
    {
      "framework": "CIS Software Supply Chain v1.0",
      "area": "Supply Chain Assurance",
      "controls": [
        {
          "id": "1.1",
          "text": "Verify the presence of project manifests and baseline documentation.",
          "sceneSlug": "post-init-full-self-check",
          "sceneIndex": 1
        },
        {
          "id": "3.1",
          "text": "Verify the presence of a scoped test command suitable for pre-commit gates.",
          "sceneSlug": "pre-commit-incremental-self-check",
          "sceneIndex": 2
        },
        {
          "id": "4.1",
          "text": "Verify documentation accuracy via cross-reference integrity.",
          "sceneSlug": "cross-story-integration-regression",
          "sceneIndex": 5
        },
        {
          "id": "4.2",
          "text": "Verify doc-code consistency via a doc/manifest ratio baseline.",
          "sceneSlug": "doc-code-consistency",
          "sceneIndex": 3
        },
        {
          "id": "6.1",
          "text": "Inventory and classify third-party dependencies; detect staleness.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        }
      ]
    },
    {
      "framework": "ISO/IEC 27002:2022",
      "area": "Information Security Controls",
      "controls": [
        {
          "id": "A.8.25",
          "text": "Secure development lifecycle — baseline test contract.",
          "sceneSlug": "post-init-full-self-check",
          "sceneIndex": 1
        },
        {
          "id": "A.8.26",
          "text": "Application security requirements — security surface regression.",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        },
        {
          "id": "A.8.27",
          "text": "Secure system architecture — inventory + manifest presence.",
          "sceneSlug": "post-init-full-self-check",
          "sceneIndex": 1
        },
        {
          "id": "A.8.28",
          "text": "Secure coding — dangerous call surface must stay at zero.",
          "sceneSlug": "security-surface-regression",
          "sceneIndex": 4
        },
        {
          "id": "A.8.29",
          "text": "Security testing in development — pre-commit gate presence.",
          "sceneSlug": "pre-commit-incremental-self-check",
          "sceneIndex": 2
        },
        {
          "id": "A.8.30",
          "text": "Outsourced development — third-party dependency vetting.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        }
      ]
    }
  ],
  "riskRegister": [
    {
      "id": "R-01",
      "sceneIndex": 1,
      "sceneSlug": "post-init-full-self-check",
      "sceneTitle": "Post-Init Full Self-Check",
      "sceneVerdict": "fail",
      "title": "Missing CLAUDE.md baseline",
      "description": "The project lacks the foundational AI-assistant guidance file. Every new contributor incurs ~15 min of orientation penalty per session.",
      "severity": "high",
      "likelihood": "observed",
      "effort": "S",
      "mitigation": "Run `/rui-init` from the project root to regenerate CLAUDE.md from profile.json."
    },
    {
      "id": "R-02",
      "sceneIndex": 1,
      "sceneSlug": "post-init-full-self-check",
      "sceneTitle": "Post-Init Full Self-Check",
      "sceneVerdict": "fail",
      "title": "Missing README",
      "description": "The GitHub landing page is empty. External users cannot evaluate the project without reading source.",
      "severity": "high",
      "likelihood": "observed",
      "effort": "S",
      "mitigation": "Author a README.md with: purpose, install, usage, license. Reference docs/ for long-form content."
    },
    {
      "id": "R-03",
      "sceneIndex": 1,
      "sceneSlug": "post-init-full-self-check",
      "sceneTitle": "Post-Init Full Self-Check",
      "sceneVerdict": "fail",
      "title": "No test framework detected",
      "description": "CI cannot catch regressions. Every merge is a leap of faith.",
      "severity": "critical",
      "likelihood": "observed",
      "effort": "M",
      "mitigation": "Add vitest (`npm i -D vitest`) or pytest. Write one smoke test per module to establish a baseline."
    },
    {
      "id": "R-04",
      "sceneIndex": 2,
      "sceneSlug": "pre-commit-incremental-self-check",
      "sceneTitle": "Pre-Commit Incremental Self-Check",
      "sceneVerdict": "fail",
      "title": "No test framework config",
      "description": "Without a config file (vitest.config.ts, jest.config.js, pytest.ini), test runners cannot be invoked.",
      "severity": "high",
      "likelihood": "observed",
      "effort": "S",
      "mitigation": "Add a framework config file. See Scene 2 §1 step 1 for the exact filename to create."
    },
    {
      "id": "R-05",
      "sceneIndex": 2,
      "sceneSlug": "pre-commit-incremental-self-check",
      "sceneTitle": "Pre-Commit Incremental Self-Check",
      "sceneVerdict": "fail",
      "title": "Zero test files",
      "description": "A test framework with no tests is theatre. Coverage = 0% by definition.",
      "severity": "high",
      "likelihood": "observed",
      "effort": "M",
      "mitigation": "Write tests for the highest-churn module first. Target ≥ 1 test per public export."
    },
    {
      "id": "R-06",
      "sceneIndex": 3,
      "sceneSlug": "doc-code-consistency",
      "sceneTitle": "Doc-Code Consistency",
      "sceneVerdict": "fail",
      "title": "Low doc/code ratio",
      "description": "Documentation is less than 5% of the codebase by file count. Insufficient for onboarding.",
      "severity": "medium",
      "likelihood": "observed",
      "effort": "L",
      "mitigation": "Add per-module README files and architecture decision records (ADRs)."
    },
    {
      "id": "R-07",
      "sceneIndex": 4,
      "sceneSlug": "security-surface-regression",
      "sceneTitle": "Security Surface Regression",
      "sceneVerdict": "fail",
      "title": "28 dangerous call(s) detected",
      "description": "eval / innerHTML / child_process.exec detected. Each is a potential injection vector.",
      "severity": "critical",
      "likelihood": "observed",
      "effort": "M",
      "mitigation": "Replace with safe alternatives: Function constructor → no-op in prod; innerHTML → textContent; exec → execFile with arg array."
    },
    {
      "id": "R-08",
      "sceneIndex": 6,
      "sceneSlug": "third-party-framework-service",
      "sceneTitle": "Third-Party Framework & Service",
      "sceneVerdict": "fail",
      "title": "No manifest found",
      "description": "Cannot evaluate the dependency surface without a package.json / pyproject.toml / go.mod / Cargo.toml.",
      "severity": "high",
      "likelihood": "observed",
      "effort": "S",
      "mitigation": "Create the appropriate manifest for the project's ecosystem."
    }
  ],
  "glossary": [
    {
      "term": "§0–§4 lifecycle",
      "definition": "The five-section contract every scene follows: §0 Effect Sketch, §1 Test Design, §2 Output Inventory, §3 Test Report, §4 Self-Improvement."
    },
    {
      "term": "Coverage",
      "definition": "Per-scene metric = passedChecks / totalChecks. A scene with 3 of 5 checks passing has coverage 0.60."
    },
    {
      "term": "Composite score",
      "definition": "mean(scene.coverage) × 100, rounded. Mapped to a letter grade via the grade scale."
    },
    {
      "term": "Facet",
      "definition": "A dimension of analysis: init, tests, docs, security, refs, deps. Each scene owns exactly one facet."
    },
    {
      "term": "Verdict",
      "definition": "pass (coverage ≥ 0.90), partial (0.50–0.89), fail (< 0.50). Frozen at generation time."
    },
    {
      "term": "Evidence",
      "definition": "Raw facet values (counts, booleans, ratios) that drove the §3 verdict. Surfaced as §2.5 per scene."
    },
    {
      "term": "Dangerous call",
      "definition": "A call to eval(), Function(), innerHTML assignment, or child_process.exec — each a potential injection vector."
    },
    {
      "term": "Pinning ratio",
      "definition": "Fraction of dependencies pinned to exact versions (no ^ or ~). 1.0 = fully reproducible installs."
    },
    {
      "term": "Stale dependency",
      "definition": "A dependency whose latest release is 3+ years older than the pinned version. Requires a registry round-trip to detect accurately."
    },
    {
      "term": "Broken link",
      "definition": "A relative markdown link whose target path does not resolve to an existing file in the scope."
    },
    {
      "term": "Risk register",
      "definition": "A prioritized list of findings with severity, likelihood, and remediation effort. Drives the order of fixes."
    },
    {
      "term": "Scope",
      "definition": "The absolute directory path the analyzer walked. All paths in the report are relative to this root."
    }
  ],
  "roadmap": [
    {
      "id": "S1",
      "title": "Sprint 1 · Week 1",
      "theme": "Critical & high-impact, low-effort",
      "goal": "Stop the bleeding. Close every critical/high finding that can be done in under a day.",
      "expectedDelta": "+15–25 points",
      "items": [
        {
          "id": "R-03",
          "sceneIndex": 1,
          "sceneSlug": "post-init-full-self-check",
          "sceneTitle": "Post-Init Full Self-Check",
          "sceneVerdict": "fail",
          "title": "No test framework detected",
          "description": "CI cannot catch regressions. Every merge is a leap of faith.",
          "severity": "critical",
          "likelihood": "observed",
          "effort": "M",
          "mitigation": "Add vitest (`npm i -D vitest`) or pytest. Write one smoke test per module to establish a baseline."
        },
        {
          "id": "R-07",
          "sceneIndex": 4,
          "sceneSlug": "security-surface-regression",
          "sceneTitle": "Security Surface Regression",
          "sceneVerdict": "fail",
          "title": "28 dangerous call(s) detected",
          "description": "eval / innerHTML / child_process.exec detected. Each is a potential injection vector.",
          "severity": "critical",
          "likelihood": "observed",
          "effort": "M",
          "mitigation": "Replace with safe alternatives: Function constructor → no-op in prod; innerHTML → textContent; exec → execFile with arg array."
        },
        {
          "id": "R-01",
          "sceneIndex": 1,
          "sceneSlug": "post-init-full-self-check",
          "sceneTitle": "Post-Init Full Self-Check",
          "sceneVerdict": "fail",
          "title": "Missing CLAUDE.md baseline",
          "description": "The project lacks the foundational AI-assistant guidance file. Every new contributor incurs ~15 min of orientation penalty per session.",
          "severity": "high",
          "likelihood": "observed",
          "effort": "S",
          "mitigation": "Run `/rui-init` from the project root to regenerate CLAUDE.md from profile.json."
        },
        {
          "id": "R-02",
          "sceneIndex": 1,
          "sceneSlug": "post-init-full-self-check",
          "sceneTitle": "Post-Init Full Self-Check",
          "sceneVerdict": "fail",
          "title": "Missing README",
          "description": "The GitHub landing page is empty. External users cannot evaluate the project without reading source.",
          "severity": "high",
          "likelihood": "observed",
          "effort": "S",
          "mitigation": "Author a README.md with: purpose, install, usage, license. Reference docs/ for long-form content."
        },
        {
          "id": "R-04",
          "sceneIndex": 2,
          "sceneSlug": "pre-commit-incremental-self-check",
          "sceneTitle": "Pre-Commit Incremental Self-Check",
          "sceneVerdict": "fail",
          "title": "No test framework config",
          "description": "Without a config file (vitest.config.ts, jest.config.js, pytest.ini), test runners cannot be invoked.",
          "severity": "high",
          "likelihood": "observed",
          "effort": "S",
          "mitigation": "Add a framework config file. See Scene 2 §1 step 1 for the exact filename to create."
        },
        {
          "id": "R-08",
          "sceneIndex": 6,
          "sceneSlug": "third-party-framework-service",
          "sceneTitle": "Third-Party Framework & Service",
          "sceneVerdict": "fail",
          "title": "No manifest found",
          "description": "Cannot evaluate the dependency surface without a package.json / pyproject.toml / go.mod / Cargo.toml.",
          "severity": "high",
          "likelihood": "observed",
          "effort": "S",
          "mitigation": "Create the appropriate manifest for the project's ecosystem."
        },
        {
          "id": "R-05",
          "sceneIndex": 2,
          "sceneSlug": "pre-commit-incremental-self-check",
          "sceneTitle": "Pre-Commit Incremental Self-Check",
          "sceneVerdict": "fail",
          "title": "Zero test files",
          "description": "A test framework with no tests is theatre. Coverage = 0% by definition.",
          "severity": "high",
          "likelihood": "observed",
          "effort": "M",
          "mitigation": "Write tests for the highest-churn module first. Target ≥ 1 test per public export."
        }
      ],
      "itemCount": 7
    },
    {
      "id": "S2",
      "title": "Sprint 2 · Week 2",
      "theme": "Critical & high-impact, larger effort",
      "goal": "Finish the remaining critical/high work that requires design or multi-file changes.",
      "expectedDelta": "+10–15 points",
      "items": [],
      "itemCount": 0
    },
    {
      "id": "S3",
      "title": "Sprint 3 · Week 3",
      "theme": "Medium-severity cleanup",
      "goal": "Address medium-severity findings. Documentation, link integrity, polish.",
      "expectedDelta": "+5–10 points",
      "items": [
        {
          "id": "R-06",
          "sceneIndex": 3,
          "sceneSlug": "doc-code-consistency",
          "sceneTitle": "Doc-Code Consistency",
          "sceneVerdict": "fail",
          "title": "Low doc/code ratio",
          "description": "Documentation is less than 5% of the codebase by file count. Insufficient for onboarding.",
          "severity": "medium",
          "likelihood": "observed",
          "effort": "L",
          "mitigation": "Add per-module README files and architecture decision records (ADRs)."
        }
      ],
      "itemCount": 1
    },
    {
      "id": "S4",
      "title": "Sprint 4 · Week 4",
      "theme": "Low / hardening",
      "goal": "Close out low-severity items. Schedule quarterly re-runs.",
      "expectedDelta": "+0–5 points",
      "items": [],
      "itemCount": 0
    }
  ],
  "metrics": {
    "totalFiles": 823,
    "totalBytes": 22301200,
    "avgBytes": 27097,
    "medianBytes": 2810,
    "sizeBuckets": [
      {
        "label": "< 1 KB",
        "count": 222,
        "bytes": 114420
      },
      {
        "label": "1–4 KB",
        "count": 279,
        "bytes": 640920
      },
      {
        "label": "4–16 KB",
        "count": 226,
        "bytes": 1734251
      },
      {
        "label": "16–64 KB",
        "count": 65,
        "bytes": 2095333
      },
      {
        "label": "64–256 KB",
        "count": 14,
        "bytes": 2034945
      },
      {
        "label": "256 KB–1 MB",
        "count": 12,
        "bytes": 6630214
      },
      {
        "label": "> 1 MB",
        "count": 5,
        "bytes": 9051117
      }
    ],
    "largest": [
      {
        "path": "YiPot/public/tesseract-core-simd-lstm.wasm.js",
        "bytes": 3938114,
        "type": "js"
      },
      {
        "path": "YiPot/asset/eg4.gif",
        "bytes": 1506035,
        "type": "gif"
      },
      {
        "path": "YiPot/asset/eg3.gif",
        "bytes": 1390562,
        "type": "gif"
      },
      {
        "path": "YiPot/asset/1.png",
        "bytes": 1108203,
        "type": "png"
      },
      {
        "path": "YiPot/asset/3.png",
        "bytes": 1108203,
        "type": "png"
      },
      {
        "path": "YiPot/asset/eg2.gif",
        "bytes": 951922,
        "type": "gif"
      },
      {
        "path": "YiPet/docs/arch/knowledge-graph.json",
        "bytes": 812359,
        "type": "json"
      },
      {
        "path": "YiPet/src/config/dynamic-theme-fixes.config",
        "bytes": 770945,
        "type": "config"
      },
      {
        "path": "YiPot/public/logo/simple_latex.png",
        "bytes": 651647,
        "type": "png"
      },
      {
        "path": "YiPot/asset/eg6.gif",
        "bytes": 650295,
        "type": "gif"
      },
      {
        "path": "YiPot/public/logo/yandex.svg",
        "bytes": 639804,
        "type": "svg"
      },
      {
        "path": "YiPot/asset/eg1.gif",
        "bytes": 540046,
        "type": "gif"
      }
    ],
    "topDirs": [
      {
        "dir": "YiPet",
        "count": 440,
        "bytes": 4721886,
        "pct": 53.5
      },
      {
        "dir": "YiPot",
        "count": 372,
        "bytes": 17345778,
        "pct": 45.2
      },
      {
        "dir": "docs",
        "count": 10,
        "bytes": 233217,
        "pct": 1.2
      },
      {
        "dir": "(root)",
        "count": 1,
        "bytes": 319,
        "pct": 0.1
      }
    ]
  },
  "activity": {
    "buckets": [
      {
        "label": "Last 7 days",
        "count": 823,
        "bytes": 22301200,
        "filePct": 100,
        "bytePct": 100
      },
      {
        "label": "8–30 days",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytePct": 0
      },
      {
        "label": "31–90 days",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytePct": 0
      },
      {
        "label": "91–365 days",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytePct": 0
      },
      {
        "label": "1–2 years",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytePct": 0
      },
      {
        "label": "Over 2 years",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytePct": 0
      }
    ],
    "recentFileCount": 823,
    "recentByteRatio": 1,
    "freshest": [
      {
        "path": "docs/test/data.js",
        "bytes": 75984,
        "ageDays": 0
      },
      {
        "path": "docs/test/index.css",
        "bytes": 46082,
        "ageDays": 0
      },
      {
        "path": "docs/test/index.html",
        "bytes": 42963,
        "ageDays": 0
      },
      {
        "path": "docs/test/index.js",
        "bytes": 28929,
        "ageDays": 0
      },
      {
        "path": "docs/test/scene-1-post-init-full-self-check/index.md",
        "bytes": 7415,
        "ageDays": 0
      },
      {
        "path": "docs/test/scene-2-pre-commit-incremental-self-check/index.md",
        "bytes": 6088,
        "ageDays": 0
      },
      {
        "path": "docs/test/scene-3-doc-code-consistency/index.md",
        "bytes": 6670,
        "ageDays": 0
      },
      {
        "path": "docs/test/scene-4-security-surface-regression/index.md",
        "bytes": 6733,
        "ageDays": 0
      }
    ],
    "generatedAt": 1784278308
  }
};
