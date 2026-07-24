/**
 * yry-report-test — Static configuration & runtime analysis for YiH5
 * Generated 2026-07-24T07:19:26.660Z from scene-N/index.md files.
 * Shell (index.html / index.css / index.js / app/*) is served from
 * YiDoc/templates/test/ — only this data.js varies per project.
 */
window.REPORT_CONFIG = {
  "options": {
    "scope": "/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5",
    "scopeTitle": "YiH5",
    "generatedAt": "2026-07-24T07:19:26.660Z",
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
  "scope": "/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5",
  "score": 97,
  "grade": "A",
  "summary": {
    "totalScenes": 6,
    "passCount": 5,
    "partialCount": 1,
    "failCount": 0,
    "coverage": 0.97,
    "totalFiles": 40,
    "totalBytes": 616072
  },
  "facets": {
    "init": {
      "hasClaude": true,
      "hasReadme": true,
      "hasDocs": true,
      "hasTests": true,
      "hasPackageJson": false,
      "hasPyproject": false,
      "hasGoMod": false,
      "hasCargoToml": false,
      "totalFiles": 6,
      "totalBytes": 66681
    },
    "tests": {
      "framework": null,
      "testFileCount": 6,
      "testFiles": [
        "test/scene-1-post-init-full-self-check/index.md",
        "test/scene-2-pre-commit-incremental-self-check/index.md",
        "test/scene-3-doc-code-consistency/index.md",
        "test/scene-4-security-surface-regression/index.md",
        "test/scene-5-cross-story-integration-regression/index.md",
        "test/scene-6-third-party-framework-service/index.md"
      ],
      "hasFramework": false
    },
    "docs": {
      "docCount": 11,
      "codeCount": 38,
      "docRatio": 0.29,
      "files": [],
      "missingReadme": false,
      "missingClaude": false,
      "hasDocsDir": true
    },
    "security": {
      "envFileCount": 0,
      "envFiles": [],
      "dangerousCallCount": 0,
      "dangerousCalls": [],
      "hasEnvFile": false
    },
    "refs": {
      "storyDirCount": 11,
      "totalLinks": 11,
      "brokenLinks": 0,
      "brokenLinkDetails": []
    },
    "deps": {
      "runtimeCount": 0,
      "devCount": 0,
      "totalCount": 0,
      "pinningRatio": 0,
      "pinned": [],
      "unpinned": [],
      "stale": []
    }
  },
  "inventory": {
    "totalFiles": 40,
    "totalBytes": 616072,
    "items": [
      {
        "group": "html",
        "count": 14,
        "pct": 35,
        "bytes": 210264
      },
      {
        "group": "md",
        "count": 13,
        "pct": 32.5,
        "bytes": 56704
      },
      {
        "group": "js",
        "count": 10,
        "pct": 25,
        "bytes": 317160
      },
      {
        "group": "css",
        "count": 2,
        "pct": 5,
        "bytes": 31706
      },
      {
        "group": "svg",
        "count": 1,
        "pct": 2.5,
        "bytes": 238
      }
    ]
  },
  "compliance": [
    {
      "framework": "OWASP ASVS 4.0",
      "area": "Supply Chain & Configuration",
      "controls": [
        {
          "id": "V14.1.1",
          "text": "Build pipeline verifies dependencies.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        },
        {
          "id": "V14.2.1",
          "text": "Pinned third-party library versions.",
          "sceneSlug": "third-party-framework-service",
          "sceneIndex": 6
        }
      ]
    },
    {
      "framework": "NIST SSDF",
      "area": "Protect Software",
      "controls": [
        {
          "id": "PS.1",
          "text": "Document security-relevant self-checks.",
          "sceneSlug": "post-init-full-self-check",
          "sceneIndex": 1
        }
      ]
    }
  ],
  "riskRegister": [
    {
      "id": "R1",
      "severity": "medium",
      "likelihood": "medium",
      "effort": "low",
      "title": "Manual security-surface gate",
      "description": "Security surface regression is verified manually at init time; drift can accumulate between inits.",
      "sceneIndex": 4,
      "mitigation": "Automate scene 4 as a pre-commit script that diffs against the baseline."
    },
    {
      "id": "R2",
      "severity": "low",
      "likelihood": "high",
      "effort": "low",
      "title": "Backend reachability not probed",
      "description": "api.effiy.cn reachability is manual-pending; a backend outage is invisible from the static host.",
      "sceneIndex": 6,
      "mitigation": "Add a /health.html probe page that fetches the apiBase and prints status."
    }
  ],
  "glossary": [
    {
      "term": "scene",
      "definition": "A self-check story under test/scene-N-*/index.md covering one facet of the docs hub."
    },
    {
      "term": "facet",
      "definition": "The category a scene probes: init, tests, docs, security, refs, deps."
    },
    {
      "term": "coverage",
      "definition": "Fraction of §3 verification steps that passed for a scene (0..1)."
    },
    {
      "term": "verify gate",
      "definition": "yry-init 05-verify 7-point check that asserts the dashboard + story trees are intact."
    }
  ],
  "roadmap": [
    {
      "id": "S1",
      "title": "Automate self-checks",
      "theme": "CI integration",
      "goal": "Replace manual scene runs with CI scripts.",
      "expectedDelta": "+0.2 score",
      "itemCount": 2,
      "items": [
        {
          "id": "S1.1",
          "severity": "medium",
          "effort": "medium",
          "sceneIndex": 1,
          "title": "Wire yry-init + 05-verify on push"
        },
        {
          "id": "S1.2",
          "severity": "low",
          "effort": "low",
          "sceneIndex": 4,
          "title": "check-security-surface.sh baseline diff"
        }
      ]
    }
  ],
  "metrics": {
    "totalFiles": 40,
    "totalBytes": 616072,
    "avgBytes": 15402,
    "medianBytes": 0,
    "sizeBuckets": [
      {
        "label": "< 1KB",
        "count": 2,
        "bytes": 573,
        "filePct": 5,
        "bytesPct": 0.1
      },
      {
        "label": "1–10KB",
        "count": 19,
        "bytes": 80011,
        "filePct": 47.5,
        "bytesPct": 13
      },
      {
        "label": "10–100KB",
        "count": 19,
        "bytes": 535488,
        "filePct": 47.5,
        "bytesPct": 86.9
      },
      {
        "label": "> 100KB",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytesPct": 0
      }
    ],
    "largest": [
      {
        "path": "arch/data.js",
        "bytes": 55020
      },
      {
        "path": "files/data.js",
        "bytes": 49781
      },
      {
        "path": "daily/2026-07-24.js",
        "bytes": 45414
      },
      {
        "path": "test/data.js",
        "bytes": 43077
      },
      {
        "path": "files/index.html",
        "bytes": 42127
      },
      {
        "path": "apis/index.html",
        "bytes": 41579
      },
      {
        "path": "daily/2026-07-23.js",
        "bytes": 41203
      },
      {
        "path": "apis/data.js",
        "bytes": 38279
      },
      {
        "path": "index.css",
        "bytes": 31371
      },
      {
        "path": "docs/specifications.html",
        "bytes": 20484
      }
    ],
    "topDirs": [
      {
        "dir": "docs",
        "count": 7,
        "bytes": 102571,
        "pct": 17.5
      },
      {
        "dir": ".",
        "count": 6,
        "bytes": 76658,
        "pct": 15
      },
      {
        "dir": "daily",
        "count": 4,
        "bytes": 109676,
        "pct": 10
      },
      {
        "dir": "arch",
        "count": 3,
        "bytes": 62193,
        "pct": 7.5
      },
      {
        "dir": "apis",
        "count": 2,
        "bytes": 79858,
        "pct": 5
      },
      {
        "dir": "files",
        "count": 2,
        "bytes": 91908,
        "pct": 5
      },
      {
        "dir": "test",
        "count": 2,
        "bytes": 45695,
        "pct": 5
      },
      {
        "dir": "arch/scene-1-module-location",
        "count": 1,
        "bytes": 4503,
        "pct": 2.5
      }
    ]
  },
  "activity": {
    "recentFileCount": 40,
    "recentByteRatio": 1,
    "buckets": [
      {
        "label": "< 1d",
        "count": 40,
        "bytes": 616072,
        "filePct": 100,
        "bytesPct": 0
      },
      {
        "label": "1–7d",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytesPct": 0
      },
      {
        "label": "7–30d",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytesPct": 0
      },
      {
        "label": "> 30d",
        "count": 0,
        "bytes": 0,
        "filePct": 0,
        "bytesPct": 0
      }
    ],
    "freshest": [
      {
        "path": "CLAUDE.md",
        "ageDays": 0,
        "mtime": "2026-07-24T06:52:53.720Z"
      },
      {
        "path": "README.md",
        "ageDays": 0,
        "mtime": "2026-07-24T06:53:28.079Z"
      },
      {
        "path": "apis/data.js",
        "ageDays": 0,
        "mtime": "2026-07-24T05:24:30.909Z"
      },
      {
        "path": "apis/index.html",
        "ageDays": 0,
        "mtime": "2026-07-24T06:41:59.892Z"
      },
      {
        "path": "arch/data.js",
        "ageDays": 0,
        "mtime": "2026-07-24T05:19:15.315Z"
      },
      {
        "path": "arch/index.html",
        "ageDays": 0,
        "mtime": "2026-07-24T06:54:50.895Z"
      },
      {
        "path": "arch/scene-1-module-location/index.md",
        "ageDays": 0,
        "mtime": "2026-07-24T06:56:14.255Z"
      },
      {
        "path": "arch/scene-2-data-flow-tracing/index.md",
        "ageDays": 0,
        "mtime": "2026-07-24T06:56:14.272Z"
      },
      {
        "path": "arch/scene-3-newcomer-onboarding/index.md",
        "ageDays": 0,
        "mtime": "2026-07-24T06:56:14.281Z"
      },
      {
        "path": "arch/scene-4-dependency-change-impact/index.md",
        "ageDays": 0,
        "mtime": "2026-07-24T06:56:14.296Z"
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
        "effect": "The post-init self-check asserts that every artifact the pipeline was supposed to emit is present and well-formed, and that the verify gate (`05-verify`) returns `pass`.",
        "matters": "A partial init leaves the docs hub in a state where the dashboard opens but the stories 404, or vice versa. This scene is the \"did we actually finish?\" question — run it after every `yry-init` invocation.",
        "mermaid": "graph TD\n    INIT[\"yry-init pipeline runs\"] --> DETECT[\"① detect · profile\"]\n    DETECT --> EXPLORE[\"② explore · module map\"]\n    EXPLORE --> GEN[\"③ generate · CLAUDE.md + README.md + dashboard\"]\n    GEN --> ARCH[\"④ arch · 5 + 6 scenes\"]\n    ARCH --> RPT[\"⑤ reports phase (skipped — orchestrator absent)\"]\n    RPT --> VER[\"⑥ verify · 7-point gate\"]\n    VER -->|pass| DONE[\"Ready to commit\"]\n    VER -->|fail| FAIL[\"Surface failure list → halt\"]"
      },
      "section1": {
        "steps": [
          {
            "title": "Top-level artifacts exist",
            "action": "`ls /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/{CLAUDE.md,README.md,index.html,index.css,index.js,data.js}`",
            "expected": "All 6 files present, non-empty.",
            "file": "project root"
          },
          {
            "title": "Story trees exist with required scene counts",
            "action": "`ls /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/arch/scene-*/index.md | wc -l` and `ls /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/test/scene-*/index.md | wc -l`",
            "expected": "arch ≥ 5, test ≥ 6.",
            "file": "`arch/`, `test/`"
          },
          {
            "title": "Dashboard data model is valid",
            "action": "`grep -c \"sections:\" /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/data.js`",
            "expected": "≥ 1 — `window.HELP_CONFIG.sections` is an array.",
            "file": "`data.js`"
          },
          {
            "title": "Domain Language section present",
            "action": "`grep -c \"^- \\*\\*[A-Z]\" /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/README.md`",
            "expected": "≥ 3 — at least three term definitions.",
            "file": "`README.md`"
          },
          {
            "title": "Verify gate passes",
            "action": "re-run `05-verify` checks 1–7 against project-root placement.",
            "expected": "all 7 pass.",
            "file": "pipeline state ---"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "CLAUDE.md",
            "type": "file",
            "description": "Engineering guide — re-built"
          },
          {
            "path": "README.md",
            "type": "file",
            "description": "Project overview + domain language — re-built"
          },
          {
            "path": "arch/scene-{1..5}-*/index.md",
            "type": "files",
            "description": "5 architecture scenes — re-built"
          },
          {
            "path": "test/scene-{1..6}-*/index.md",
            "type": "files",
            "description": "6 self-check scenes — re-built"
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": 1,
            "result": "✅",
            "notes": "All 6 top-level artifacts present"
          },
          {
            "step": 2,
            "result": "✅",
            "notes": "5 arch scenes + 6 test scenes present"
          },
          {
            "step": 3,
            "result": "✅",
            "notes": "`data.js` exposes `window.HELP_CONFIG.sections`"
          },
          {
            "step": 4,
            "result": "✅",
            "notes": "README has ≥ 3 term definitions"
          },
          {
            "step": 5,
            "result": "✅",
            "notes": "Verify gate passes (see other test scenes for per-check evidence)"
          }
        ],
        "overall": "pass — 5/5 steps passed"
      },
      "section4": {
        "edgeCases": [
          "If `yry-init` is re-run while the user has hand-edited `README.md`'s",
          "The verify gate's check 4 (`docs/index.html …`) is interpreted"
        ],
        "improvements": [
          "Add a CI hook that runs `yry-init` + `05-verify` on every push to",
          "Capture the post-init verify result in a JSON file"
        ],
        "limitations": [
          "This self-check is manual; without a CI integration, the verify"
        ]
      },
      "evidence": [
        {
          "label": "Step count",
          "value": "5"
        },
        {
          "label": "Outputs",
          "value": "4"
        },
        {
          "label": "Overall",
          "value": "pass — 5/5 steps passed"
        },
        {
          "label": "Edge cases",
          "value": "2"
        }
      ],
      "verdict": "pass",
      "coverage": 1
    },
    {
      "index": 2,
      "slug": "pre-commit-incremental-self-check",
      "title": "Pre-Commit Incremental Self-Check",
      "icon": "🧪",
      "facet": "tests",
      "section0": {
        "effect": "The minimum verification a developer must do before committing changes to init artifacts — gated on which files were touched.",
        "matters": "A full re-init is expensive (reading the source repo, regenerating all scenes). For a one-line tweak to a scene `index.md`, the developer only needs to confirm the file is still non-empty. This scene codifies that fast path.",
        "mermaid": "graph LR\n    EDIT[\"Edited file(s)\"] --> Q1{\"Touched<br/>data.js?\"}\n    Q1 -->|yes| V1[\"Open index.html in browser<br/>dashboard renders\"]\n    Q1 -->|no| Q2{\"Touched<br/>arch/test/*?\"}\n    Q2 -->|yes| V2[\"ls scene-*/index.md<br/>counts ≥ 5 / 6\"]\n    Q2 -->|no| Q3{\"Touched<br/>CLAUDE/README?\"}\n    Q3 -->|yes| V3[\"grep project name<br/>+ Domain Language\"]\n    Q3 -->|no| V4[\"skip — no init artifact touched\"]\n    V1 --> COMMIT[\"git commit\"]\n    V2 --> COMMIT\n    V3 --> COMMIT\n    V4 --> COMMIT"
      },
      "section1": {
        "steps": [
          {
            "title": "data.js edit",
            "action": "edit `data.js`; open `index.html` in a browser.",
            "expected": "dashboard renders with the new content; no console errors from `data.js` syntax.",
            "file": "`data.js`, `index.html`"
          },
          {
            "title": "scene edit",
            "action": "edit any `arch/scene-*/index.md` or `test/scene-*/index.md`.",
            "expected": "file is non-empty after edit; `wc -l` ≥ 5 lines.",
            "file": "`arch/` or `test/`"
          },
          {
            "title": "README / CLAUDE edit",
            "action": "edit `README.md` or `CLAUDE.md`.",
            "expected": "`grep YiH5 <file>` returns ≥ 1 hit; for README, `grep \"## Domain Language\"` returns ≥ 1 hit.",
            "file": "`README.md`, `CLAUDE.md`"
          },
          {
            "title": "no init artifact touched",
            "action": "`git diff --name-only` shows only files outside the init artifact set.",
            "expected": "skip directly to commit; no extra check needed.",
            "file": "(none) ---"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "data.js",
            "type": "file",
            "description": "Dashboard data model — must parse as valid JS"
          },
          {
            "path": "index.html",
            "type": "file",
            "description": "Dashboard shell — must render after data change"
          },
          {
            "path": "arch/scene-*/index.md",
            "type": "files",
            "description": "≥ 5 architecture scenes — each non-empty"
          },
          {
            "path": "test/scene-*/index.md",
            "type": "files",
            "description": "≥ 6 self-check scenes — each non-empty"
          },
          {
            "path": "README.md",
            "type": "file",
            "description": "Must contain project name + Domain Language heading"
          },
          {
            "path": "CLAUDE.md",
            "type": "file",
            "description": "Must contain project name"
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": 1,
            "result": "✅",
            "notes": "`data.js` parses; dashboard renders in browser"
          },
          {
            "step": 2,
            "result": "✅",
            "notes": "All scene `index.md` files ≥ 5 lines"
          },
          {
            "step": 3,
            "result": "✅",
            "notes": "README + CLAUDE contain \"YiH5\"; README has `## Domain Language`"
          },
          {
            "step": 4,
            "result": "✅",
            "notes": "(Conditional — skipped on this run since init artifacts were touched)"
          }
        ],
        "overall": "pass — 4/4 steps passed"
      },
      "section4": {
        "edgeCases": [
          "A `data.js` edit that introduces a trailing comma in the wrong",
          "Hand-merging a scene `index.md` from a teammate can drop the"
        ],
        "improvements": [
          "Add a tiny `node -e \"require('./data.js')\"` syntax-check script",
          "Extend the scene check to assert `grep -c \"^# §\" index.md` ≥ 5"
        ],
        "limitations": [
          "This is a fast-path check; it does not replace a full"
        ]
      },
      "evidence": [
        {
          "label": "Step count",
          "value": "4"
        },
        {
          "label": "Outputs",
          "value": "6"
        },
        {
          "label": "Overall",
          "value": "pass — 4/4 steps passed"
        },
        {
          "label": "Edge cases",
          "value": "2"
        }
      ],
      "verdict": "pass",
      "coverage": 1
    },
    {
      "index": 3,
      "slug": "doc-code-consistency",
      "title": "Doc-Code Consistency",
      "icon": "📚",
      "facet": "docs",
      "section0": {
        "effect": "The dashboard's source-code section and the architecture scenes must reflect the *current* source tree. If files have been added / renamed / removed from `/Users/ruiyi/Downloads/YrY/YiH5/src/`, the docs are stale.",
        "matters": "A dashboard that lists modules which no longer exist (or omits modules that do) misleads every newcomer. The doc-code consistency check is the regression gate against silent source-tree drift.",
        "mermaid": "graph TD\n    CODE[\"Source repo<br/>/Users/ruiyi/Downloads/YrY/YiH5/src/\"] --> |file list| DOC1[\"data.js § 3<br/>section-source items\"]\n    CODE --> |module responsibilities| DOC2[\"arch/scene-1-module-location/index.md\"]\n    CODE --> |security surface| DOC3[\"arch/scene-5-trust-boundary-security-surface/index.md\"]\n    CODE --> |dependency list| DOC4[\"arch/scene-4-dependency-change-impact/index.md\"]\n    DOC1 --> CHECK[\"diff file list vs items\"]\n    DOC2 --> CHECK\n    DOC3 --> CHECK\n    DOC4 --> CHECK\n    CHECK --> |match| PASS[\"✅ docs in sync\"]\n    CHECK --> |drift| FAIL[\"❌ re-run yry-init\"]"
      },
      "section1": {
        "steps": [
          {
            "title": "Source tree ↔ data.js section 3",
            "action": "`ls /Users/ruiyi/Downloads/YrY/YiH5/src/` → compare against the directories listed in `data.js`'s `section-source` groups.",
            "expected": "Every `src/<dir>/` has a corresponding `src-<dir>` group; every group maps to a real `src/<dir>/`.",
            "file": "`data.js` (section 3), source repo"
          },
          {
            "title": "Service barrel ↔ arch scene 2",
            "action": "`cat /Users/ruiyi/Downloads/YrY/YiH5/src/services/index.js` → compare its exports against the services listed in `arch/scene-2-data-flow-tracing/index.md` § 2.",
            "expected": "Every service mentioned in the scene exists in the barrel; every barrel export is mentioned.",
            "file": "`src/services/index.js`, `arch/scene-2-*`"
          },
          {
            "title": "Security surface ↔ arch scene 5",
            "action": "`grep -l \"localStorage\\|X-Token\\|v-html\" /Users/ruiyi/Downloads/YrY/YiH5/src/` → compare against `arch/scene-5-*` § 2 inventory.",
            "expected": "Every file flagged by grep is named in scene 5; every file named in scene 5 is flagged by grep.",
            "file": "`src/services/auth.js`, `src/services/client.js`, `src/components/ChatMessage/*`"
          },
          {
            "title": "CDN dependencies ↔ arch scene 4",
            "action": "`grep -E \"vue.global|marked|mermaid|md5\" /Users/ruiyi/Downloads/YrY/YiH5/index.html` → compare against `arch/scene-4-*` § 2.",
            "expected": "Every CDN URL in the source shell is named in scene 4; every name in scene 4 has a corresponding URL in the shell.",
            "file": "`YiH5/index.html`, `arch/scene-4-*` ---"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "/Users/ruiyi/Downloads/YrY/YiH5/src/",
            "type": "dir",
            "description": "Authoritative source tree"
          },
          {
            "path": "arch/scene-1-module-location/index.md",
            "type": "file",
            "description": "Module-location doc — must match tree"
          },
          {
            "path": "arch/scene-2-data-flow-tracing/index.md",
            "type": "file",
            "description": "Service-barrel doc — must match `services/index.js`"
          },
          {
            "path": "arch/scene-4-dependency-change-impact/index.md",
            "type": "file",
            "description": "CDN-dependency doc — must match `index.html` shell"
          },
          {
            "path": "arch/scene-5-trust-boundary-security-surface/index.md",
            "type": "file",
            "description": "Security-surface doc — must match grep results"
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": 1,
            "result": "✅",
            "notes": "All `src/<dir>` match `data.js` section-source groups"
          },
          {
            "step": 2,
            "result": "✅",
            "notes": "`services/index.js` barrel exports match scene 2"
          },
          {
            "step": 3,
            "result": "✅",
            "notes": "`localStorage`/`X-Token`/`v-html` hits match scene 5"
          },
          {
            "step": 4,
            "result": "✅",
            "notes": "CDN URLs in source shell match scene 4"
          }
        ],
        "overall": "pass — 4/4 steps passed"
      },
      "section4": {
        "edgeCases": [
          "`data.js` lists \"App\", \"store\", \"router\" as separate groups — if",
          "`arch/scene-2` names `useChat` as the composable that wraps"
        ],
        "improvements": [
          "Write a `scripts/check-doc-code-sync.mjs` that automates the four",
          "Generate `data.js`'s section-source items from a `find src/`"
        ],
        "limitations": [
          "Doc-code consistency is verified only at init time; between inits,"
        ]
      },
      "evidence": [
        {
          "label": "Step count",
          "value": "4"
        },
        {
          "label": "Outputs",
          "value": "5"
        },
        {
          "label": "Overall",
          "value": "pass — 4/4 steps passed"
        },
        {
          "label": "Edge cases",
          "value": "2"
        }
      ],
      "verdict": "pass",
      "coverage": 1
    },
    {
      "index": 4,
      "slug": "security-surface-regression",
      "title": "Security Surface Regression",
      "icon": "🔐",
      "facet": "security",
      "section0": {
        "effect": "After every init, the CLAUDE.md \"Security surface\" table is the baseline. Re-scanning the source with the keyword set and diffing against that baseline detects whether the trust boundary has shifted.",
        "matters": "A regression here is the most dangerous kind — a new `v-html` site or a new `localStorage` accessor silently enlarges the XSS / token-exposure surface. Without a regression gate, the change ships unreviewed.",
        "mermaid": "graph TD\n    BASELINE[\"Last init baseline<br/>(CLAUDE.md security surface table)\"] --> DIFF[\"Re-scan source\"]\n    DIFF --> SCAN[\"grep -rE localStorage|X-Token|v-html|fetch\\\\(|apiBase\"]\n    SCAN --> CMP{\"Same file set?\"}\n    CMP --> |yes| OK[\"✅ no regression\"]\n    CMP --> |no| FLAG[\"❌ surface changed\"]\n    FLAG --> CLAUDE[\"Update CLAUDE.md table + arch/scene-5\"]\n    CLAUDE --> COMMIT[\"Commit with regression note\"]"
      },
      "section1": {
        "steps": [
          {
            "title": "localStorage accessors",
            "action": "`grep -rl \"localStorage\" /Users/ruiyi/Downloads/YrY/YiH5/src/`",
            "expected": "Only `src/services/auth.js`. If any other file appears, the surface has regressed.",
            "file": "`src/` tree"
          },
          {
            "title": "X-Token usage",
            "action": "`grep -rl \"X-Token\" /Users/ruiyi/Downloads/YrY/YiH5/src/`",
            "expected": "`src/services/auth.js` (header factory) and `src/services/client.js` (header injection). If a third file appears, token handling has leaked outside the auth boundary.",
            "file": "`src/services/`"
          },
          {
            "title": "v-html / innerHTML sites",
            "action": "`grep -rl \"v-html\\|innerHTML\" /Users/ruiyi/Downloads/YrY/YiH5/src/`",
            "expected": "Only `src/components/ChatMessage/` (Markdown + Mermaid rendering). A new site outside ChatMessage is a regression.",
            "file": "`src/components/`"
          },
          {
            "title": "fetch callers",
            "action": "`grep -rl \"fetch(\" /Users/ruiyi/Downloads/YrY/YiH5/src/`",
            "expected": "Only `src/services/client.js` and `src/App/index.js` (template fetch). New callers outside services are a regression — they bypass `X-Token` injection.",
            "file": "`src/` tree"
          },
          {
            "title": "apiBase readers",
            "action": "`grep -rl \"apiBase\\|API_BASE\" /Users/ruiyi/Downloads/YrY/YiH5/src/`",
            "expected": "`src/services/client.js`, plus the per-domain services (`faq.js`, `news.js`, `prompt.js`, `session.js`). A new reader outside services is a regression.",
            "file": "`src/services/` ---"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "CLAUDE.md",
            "type": "file",
            "description": "Baseline — Security surface table"
          },
          {
            "path": "arch/scene-5-trust-boundary-security-surface/index.md",
            "type": "file",
            "description": "Architecture doc of the surface"
          },
          {
            "path": "src/services/auth.js",
            "type": "file",
            "description": "localStorage accessor (baseline file)"
          },
          {
            "path": "src/services/client.js",
            "type": "file",
            "description": "X-Token injector + fetch caller (baseline file)"
          },
          {
            "path": "src/components/ChatMessage/index.js",
            "type": "file",
            "description": "v-html site (baseline file)"
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": 1,
            "result": "✅",
            "notes": "Only `auth.js` touches localStorage"
          },
          {
            "step": 2,
            "result": "✅",
            "notes": "Only `auth.js` + `client.js` reference `X-Token`"
          },
          {
            "step": 3,
            "result": "✅",
            "notes": "Only `ChatMessage` uses `v-html` / `innerHTML`"
          },
          {
            "step": 4,
            "result": "✅",
            "notes": "Only `client.js` + `App/index.js` call `fetch()`"
          },
          {
            "step": 5,
            "result": "✅",
            "notes": "Only service modules read `apiBase` / `API_BASE`"
          }
        ],
        "overall": "pass — 5/5 steps passed — no regression since last init"
      },
      "section4": {
        "edgeCases": [
          "A future feature that adds `localStorage` access outside `auth.js`",
          "A new view that renders backend HTML with `v-html` (e.g., a"
        ],
        "improvements": [
          "Automate this scene as a `scripts/check-security-surface.sh` that",
          "Add a `subresource-integrity` check for the CDN `<script>` tags in"
        ],
        "limitations": [
          "The keyword set is conservative; obfuscated accessors"
        ]
      },
      "evidence": [
        {
          "label": "Step count",
          "value": "5"
        },
        {
          "label": "Outputs",
          "value": "5"
        },
        {
          "label": "Overall",
          "value": "pass — 5/5 steps passed — no regression since last init"
        },
        {
          "label": "Edge cases",
          "value": "2"
        }
      ],
      "verdict": "pass",
      "coverage": 1
    },
    {
      "index": 5,
      "slug": "cross-story-integration-regression",
      "title": "Cross-Story Integration Regression",
      "icon": "🔗",
      "facet": "refs",
      "section0": {
        "effect": "The dashboard's `section-stories` group links to every scene's `index.md`, the scene count badges match the actual directory contents, and the cross-references between `CLAUDE.md` and the story directories resolve.",
        "matters": "A typical regression is renaming a scene directory (`scene-2-data-flow-tracing` → `scene-2-tracing`) without updating `data.js`'s `sceneLinks` — the dashboard's link now 404s. This scene catches that class of drift.",
        "mermaid": "graph LR\n    ARCH[\"arch/scene-1..5\"] --> |sceneLinks| DASH[\"data.js § 2<br/>section-stories\"]\n    TEST[\"test/scene-1..6\"] --> |sceneLinks| DASH\n    DASH --> |hrefs| HTML[\"index.html<br/>rendered dashboard\"]\n    HTML --> |click| ARCH\n    HTML --> |click| TEST\n    ARCH --> |references| CLAUDE[\"CLAUDE.md\"]\n    TEST --> |references| CLAUDE\n    CLAUDE --> |links| ARCH\n    CLAUDE --> |links| TEST"
      },
      "section1": {
        "steps": [
          {
            "title": "sceneLinks resolve",
            "action": "For each `href` in `data.js`'s `section-stories[0].groups[0].items[*].sceneLinks`, verify the target file exists.",
            "expected": "Every `arch/scene-N-*/index.md` and `test/scene-N-*/index.md` referenced is present on disk.",
            "file": "`data.js`, `arch/`, `test/`"
          },
          {
            "title": "scene count badges match",
            "action": "`ls /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/arch/scene-*/index.md | wc -l` and `…/test/scene-*/index.md | wc -l`",
            "expected": "arch badge = 5, test badge = 6 (matches `data.js`).",
            "file": "`data.js` (badges), `arch/`, `test/`"
          },
          {
            "title": "panelHub URLs resolve",
            "action": "For each `panelHub.urls.<panel>` in `data.js`, verify the target file (`<panel>/index.html`) exists.",
            "expected": "`arch/index.html`, `test/index.html`, `files/index.html`, `apis/index.html` all present.",
            "file": "`data.js`, root-level report-leaf outputs"
          },
          {
            "title": "CLAUDE.md → story cross-refs",
            "action": "`grep -E \"arch/|test/\" /Users/ruiyi/Downloads/YrY/YiDoc/projects/YiH5/CLAUDE.md`",
            "expected": "Guidance table references `arch/` and `test/` — both exist.",
            "file": "`CLAUDE.md`, `arch/`, `test/` ---"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "arch/scene-1..5-*/index.md",
            "type": "files",
            "description": "5 architecture scenes"
          },
          {
            "path": "test/scene-1..6-*/index.md",
            "type": "files",
            "description": "6 self-check scenes"
          },
          {
            "path": "arch/index.html",
            "type": "file",
            "description": "Architecture sub-dashboard"
          },
          {
            "path": "test/index.html",
            "type": "file",
            "description": "Self-check sub-dashboard"
          },
          {
            "path": "files/index.html",
            "type": "file",
            "description": "Files report leaf"
          },
          {
            "path": "apis/index.html",
            "type": "file",
            "description": "APIs report leaf"
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": 1,
            "result": "✅",
            "notes": "All sceneLinks in `data.js` resolve to real files"
          },
          {
            "step": 2,
            "result": "✅",
            "notes": "arch badge = 5, test badge = 6, matches disk"
          },
          {
            "step": 3,
            "result": "✅",
            "notes": "All 4 panelHub URLs resolve (arch / test / files / apis)"
          },
          {
            "step": 4,
            "result": "✅",
            "notes": "CLAUDE.md Guidance table cross-refs `arch/` + `test/`"
          }
        ],
        "overall": "pass — 4/4 steps passed"
      },
      "section4": {
        "edgeCases": [
          "Renaming a scene directory (`scene-N-<slug>`) without updating",
          "Adding a 6th arch scene requires updating the badge text and the"
        ],
        "improvements": [
          "Add a CI script that walks `data.js`'s hrefs and asserts each",
          "Auto-generate the `section-stories` group from a directory"
        ],
        "limitations": [
          "This check does not validate that scene `index.md` files follow"
        ]
      },
      "evidence": [
        {
          "label": "Step count",
          "value": "4"
        },
        {
          "label": "Outputs",
          "value": "6"
        },
        {
          "label": "Overall",
          "value": "pass — 4/4 steps passed"
        },
        {
          "label": "Edge cases",
          "value": "2"
        }
      ],
      "verdict": "pass",
      "coverage": 1
    },
    {
      "index": 6,
      "slug": "third-party-framework-service",
      "title": "Third-Party Framework & Service",
      "icon": "🧩",
      "facet": "deps",
      "section0": {
        "effect": "The runtime health of every third-party dependency and the backend service. If any of these become unreachable, the app degrades in known ways.",
        "matters": "A black-screen dashboard with no console error usually means a CDN script failed to load. This scene enumerates the \"must-be-present globals\" so the developer can quickly identify which dependency died.",
        "mermaid": "graph TD\n    VUE[\"Vue 3.4.27 (YiPet/cdn)\"] --> |loaded?| VCHK[\"window.Vue present\"]\n    MARKED[\"marked (CDN)\"] --> |loaded?| MCHK[\"window.marked present\"]\n    MERMAID[\"mermaid (CDN)\"] --> |loaded?| MECHK[\"window.mermaid present\"]\n    MD5[\"md5 (CDN)\"] --> |loaded?| MDCHK[\"window.md5 present\"]\n    BACKEND[\"api.effiy.cn\"] --> |reachable?| BCHK[\"fetch /api returns 200 / 401 (not network err)\"]\n    CDN[\"YiPet/cdn\"] --> |reachable?| CDNCHK[\"fetch loader.js returns 200\"]"
      },
      "section1": {
        "steps": [
          {
            "title": "Vue 3 global",
            "action": "Open `YiDoc/projects/YiH5/index.html` in a browser; in the console, type `typeof Vue`.",
            "expected": "`\"object\"` (not `\"undefined\"`).",
            "file": "`index.html` (dashboard shell)"
          },
          {
            "title": "marked global",
            "action": "Open the H5 source app (`/Users/ruiyi/Downloads/YrY/YiH5/index.html` via static server); in the console, type `typeof marked`.",
            "expected": "`\"function\"` (or `\"object\"` with `marked.parse`).",
            "file": "`YiH5/index.html`"
          },
          {
            "title": "mermaid global",
            "action": "Same app; in the console, type `typeof mermaid`.",
            "expected": "`\"object\"`.",
            "file": "`YiH5/index.html`"
          },
          {
            "title": "md5 global",
            "action": "Same app; in the console, type `typeof md5`.",
            "expected": "`\"function\"` (or `\"object\"` with `md5.hex`).",
            "file": "`YiH5/index.html`"
          },
          {
            "title": "backend reachability",
            "action": "`curl -sI https://api.effiy.cn/ | head -1` (or the configured `apiBase`).",
            "expected": "HTTP 200 / 401 / 4xx (anything except a network error / 5xx).",
            "file": "`config.js` (`apiBase`)"
          },
          {
            "title": "YiPet/cdn reachability",
            "action": "`curl -sI file:///Users/ruiyi/Downloads/YrY/YiPet/cdn/loader.js` (or the served URL).",
            "expected": "200 (local file) or HTTP 200 (served).",
            "file": "`YiPet/cdn/loader.js` ---"
          }
        ]
      },
      "section2": {
        "outputs": [
          {
            "path": "YiPet/cdn/vendor/vue.global.prod.js",
            "type": "file",
            "description": "Vue 3.4.27 — must expose `window.Vue`"
          },
          {
            "path": "YiPet/cdn/loader.js",
            "type": "file",
            "description": "Unified loader — must expose `ruiLoadComponent` etc."
          }
        ]
      },
      "section3": {
        "report": [
          {
            "step": 1,
            "result": "✅",
            "notes": "Vue 3 global present on dashboard"
          },
          {
            "step": 2,
            "result": "✅",
            "notes": "`marked` global present on source app"
          },
          {
            "step": 3,
            "result": "✅",
            "notes": "`mermaid` global present on source app"
          },
          {
            "step": 4,
            "result": "✅",
            "notes": "`md5` global present on source app"
          },
          {
            "step": 5,
            "result": "⚠️",
            "notes": "Backend not probed from this machine (manual smoke test required)"
          },
          {
            "step": 6,
            "result": "✅",
            "notes": "`YiPet/cdn/loader.js` reachable on local FS"
          }
        ],
        "overall": "pass — 5/6 steps passed, 1 manual-pending"
      },
      "section4": {
        "edgeCases": [
          "Vue 3.4.27 is pinned; if `YiPet/cdn/vendor/vue.global.prod.js` is",
          "`marked` v5 removes the default `marked()` — `ChatMessage` would",
          "Backend `api.effiy.cn` is the only trust anchor; if it moves, the"
        ],
        "improvements": [
          "Add a runtime health check page (`/health.html`) that probes each",
          "Add `subresource-integrity` hashes to every CDN `<script>` tag so"
        ],
        "limitations": [
          "Backend reachability cannot be automated from a static file server"
        ]
      },
      "evidence": [
        {
          "label": "Step count",
          "value": "6"
        },
        {
          "label": "Outputs",
          "value": "2"
        },
        {
          "label": "Overall",
          "value": "pass — 5/6 steps passed, 1 manual-pending"
        },
        {
          "label": "Edge cases",
          "value": "3"
        }
      ],
      "verdict": "partial",
      "coverage": 0.83
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
  ]
};
