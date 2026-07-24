window.REPORT_DATA = {
  "meta": {
    "date": "2026-07-24",
    "window": "1d",
    "sinceDate": "2026-07-24",
    "untilDate": "2026-07-24",
    "timestamp": "2026-07-24T07:30:00.000Z",
    "title": "YrY · Daily CTO Report · 2026-07-24"
  },
  "projects": [
    {
      "project": "YiWeb",
      "scope": "/Users/ruiyi/Downloads/YrY/YiWeb",
      "scopeShort": "YiWeb",
      "summary": {
        "kpis": [
          { "label": "Commits", "value": "7", "sub": "7 commit(s) in window", "tone": "normal" },
          { "label": "Insertions", "value": "+29,016", "sub": "lines added today", "tone": "warn" },
          { "label": "Deletions", "value": "−4,298", "sub": "lines removed today", "tone": "normal" },
          { "label": "Authors", "value": "1", "sub": "single-author", "tone": "critical" },
          { "label": "Files touched", "value": "175", "sub": "unique paths", "tone": "normal" },
          { "label": "Total LOC", "value": "21K", "sub": "JS in src/", "tone": "normal" }
        ],
        "contributors": [
          { "author": "Chengliang.Yi1@zeekrlife.com", "commits": 7, "percent": 100, "barWidth": 160 }
        ],
        "hotFiles": [
          { "rank": 1, "path": "YiWeb/src/views/story/index.js", "touches": 4 },
          { "rank": 2, "path": "YiWeb/src/views/aicr/index.js", "touches": 4 },
          { "rank": 3, "path": "YiWeb/src/views/story/state/storeFactory.js", "touches": 3 },
          { "rank": 4, "path": "YiWeb/src/views/story/composables/useComputed.js", "touches": 3 },
          { "rank": 5, "path": "YiWeb/src/views/aicr/state/ops/fileContentOps.js", "touches": 3 }
        ],
        "narrative": {
          "shipped": "Seven commits landed on the master branch for YiWeb today, all authored by Chengliang.Yi1. The changes touch 175 unique paths and add ~29K lines — a large-volume day driven primarily by the aicr and story views (index.js, storeFactory, useComputed, fileContentOps, sessionChatContextMethods). No external PRs were opened; all work shipped directly to master.",
          "atRisk": "Insertions of 29K against deletions of 4.3K is a 6.7:1 ratio — well above the refactor threshold. Several of the hottest files (story/index.js, aicr/index.js) are touched 4 times in a single day, signalling heavy iteration on unstable modules. No test files exist in src/, so the +29K lines ship with zero regression coverage.",
          "drifting": "The aicr/state/ops/fileContentOps.js file (containing the unauthenticated /read-file and /write-file handlers) was touched 3 times — the security debt flagged in the apis report remains unaddressed while the file keeps churning.",
          "watch": "Single-author bus factor (100% Chengliang.Yi1). One contributor owning all of the aicr + story view state is a material key-person risk; pairing or ownership rotation is overdue."
        }
      },
      "risk": {
        "legend": { "green": "Green: low risk", "amber": "Amber: watch", "red": "Red: act now" },
        "items": [
          { "severity": "red", "name": "Single-author concentration", "hint": "100% of commits in window from one contributor", "action": "Onboard a second owner on the aicr + story view state modules", "category": "people" },
          { "severity": "red", "name": "No test coverage", "hint": "0 test files in src/ (no vitest/jest config)", "action": "Stand up Vitest + happy-dom scaffold; add smoke tests for fileContentOps and sessionSyncService", "category": "quality" },
          { "severity": "amber", "name": "Large insertion spike", "hint": "+29,016 lines vs −4,298 — 6.7:1 ratio", "action": "Audit the insertion-heavy commits; verify the volume is intentional and not a vendored drop", "category": "quality" },
          { "severity": "amber", "name": "Unauthenticated file ops", "hint": "/read-file and /write-file POST without X-Token", "action": "Route through window.requestClient or add getAuthHeaders()", "category": "security" },
          { "severity": "amber", "name": "Long-lived single branch", "hint": "Only master is active; no feature branches", "action": "Adopt a short-lived branch + PR workflow to gate direct-to-master commits", "category": "process" }
        ]
      },
      "health": {
        "languages": [
          { "kind": "JavaScript", "files": 84, "loc": 20948, "percent": 86.2, "barWidth": 172 },
          { "kind": "CSS", "files": 10, "loc": 3343, "percent": 13.8, "barWidth": 28 },
          { "kind": "HTML", "files": 6, "loc": 0, "percent": 0, "barWidth": 0 }
        ],
        "skills": [],
        "tests": { "testLoc": 0, "allJsLoc": 20948, "ratio": 0, "threshold": 0.2, "verdict": "no tests", "color": "red" },
        "techDebt": [
          { "marker": "TODO", "count": 0, "verdict": "clean", "color": "green", "share": 0 },
          { "marker": "FIXME", "count": 0, "verdict": "clean", "color": "green", "share": 0 },
          { "marker": "XXX", "count": 0, "verdict": "clean", "color": "green", "share": 0 }
        ],
        "branches": [
          { "name": "master", "lastCommit": "2026-07-24 15:03:54 +0800", "ageDays": 0, "status": "active", "note": "all commits land directly on master", "color": "green" }
        ],
        "dependencies": { "text": "No package.json — all runtime deps (Vue 3) are CDN-loaded", "verdict": "n/a", "color": "amber" },
        "lighthouse": {
          "scores": { "performance": "—", "accessibility": "—", "bestPractices": "—", "seo": "—" },
          "metrics": { "fcp": "—", "lcp": "—", "tbt": "—", "cls": "—", "tti": "—" },
          "verdict": "not measured (offline)", "color": "amber"
        }
      },
      "people": {
        "distribution": [
          { "author": "Chengliang.Yi1@zeekrlife.com", "commits": 7, "percent": 100, "barWidth": 160 }
        ],
        "busFactor": [
          { "bucket": "Single-author files", "files": 175, "percent": 100, "verdict": "critical", "color": "red" }
        ],
        "activityPulse": [
          { "date": "2026-07-24", "day": "Thu", "commits": 7, "hint": "all activity in window", "barWidth": 160 }
        ],
        "review": { "text": "No PR workflow — all commits land directly on master", "verdict": "no review", "color": "red" },
        "newContributors": "None — single contributor in window."
      }
    }
  ]
};
