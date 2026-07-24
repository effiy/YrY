window.REPORT_DATA = {
  "meta": {
    "date": "2026-07-23",
    "window": "1d",
    "sinceDate": "2026-07-23",
    "untilDate": "2026-07-23",
    "timestamp": "2026-07-24T01:31:51.178Z",
    "title": "YrY · Daily CTO Report · 2026-07-23"
  },
  "projects": [
    {
      "project": "YiDoc",
      "scope": "/Users/ruiyi/Downloads/YrY/YiDoc",
      "scopeShort": "YiDoc",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "22",
            "sub": "22 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+55,878",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−12,452",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "1",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "251",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "46K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 22,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiDoc/data.js",
            "touches": 9
          },
          {
            "rank": 2,
            "path": "YiDoc/projects/Websites/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 3,
            "path": "YiDoc/projects/Websites/docs/setup.html",
            "touches": 3
          },
          {
            "rank": 4,
            "path": "YiDoc/projects/YiAi/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 5,
            "path": "YiDoc/projects/YiH5/docs/customization.html",
            "touches": 3
          }
        ],
        "narrative": {
          "shipped": "22 commit(s) on 2026-07-23. 1 author(s) active.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": null
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "js",
            "files": 37,
            "loc": 15955,
            "percent": 34.5,
            "barWidth": 160
          },
          {
            "kind": "html",
            "files": 60,
            "loc": 14887,
            "percent": 32.2,
            "barWidth": 149
          },
          {
            "kind": "md",
            "files": 84,
            "loc": 9415,
            "percent": 20.3,
            "barWidth": 94
          },
          {
            "kind": "css",
            "files": 16,
            "loc": 5988,
            "percent": 12.9,
            "barWidth": 60
          },
          {
            "kind": "svg",
            "files": 13,
            "loc": 51,
            "percent": 0.1,
            "barWidth": 1
          }
        ],
        "skills": [
          {
            "name": "skills/yry-init",
            "files": 52,
            "skillMd": 1,
            "evals": 1,
            "references": 42,
            "notes": "1 skill manifest(s)"
          },
          {
            "name": "skills/yry-reports",
            "files": 228,
            "skillMd": 5,
            "evals": 1,
            "references": 66,
            "notes": "5 skill manifest(s)"
          },
          {
            "name": "skills/yry-test",
            "files": 21,
            "skillMd": 1,
            "evals": 1,
            "references": 18,
            "notes": "1 skill manifest(s)"
          },
          {
            "name": "skills/yry-tools",
            "files": 162,
            "skillMd": 10,
            "evals": 8,
            "references": 74,
            "notes": "10 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 8645,
          "allJsLoc": 46296,
          "ratio": 0.1867331950924486,
          "threshold": 0.2,
          "verdict": "low",
          "color": "amber",
          "testSceneCount": 80
        },
        "techDebt": [
          {
            "marker": "TODO",
            "count": 4,
            "verdict": "pass",
            "color": "green",
            "share": "4 files"
          },
          {
            "marker": "FIXME",
            "count": 4,
            "verdict": "pass",
            "color": "green",
            "share": "4 files"
          },
          {
            "marker": "HACK",
            "count": 4,
            "verdict": "pass",
            "color": "green",
            "share": "4 files"
          },
          {
            "marker": "XXX",
            "count": 7,
            "verdict": "pass",
            "color": "green",
            "share": "7 files"
          }
        ],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "No dependency manifest found.",
          "verdict": "—",
          "color": "muted"
        }
      },
      "people": {
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 22,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 256,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 22,
            "hint": "22 commit(s)",
            "barWidth": 160
          }
        ],
        "review": {
          "text": "0/22 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
      }
    },
    {
      "project": "YiAi",
      "scope": "/Users/ruiyi/Downloads/YrY/YiAi",
      "scopeShort": "YiAi",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "0",
            "sub": "no activity today",
            "tone": "warn"
          },
          {
            "label": "Insertions",
            "value": "+0",
            "sub": "lines added today",
            "tone": "normal"
          },
          {
            "label": "Deletions",
            "value": "−0",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "0",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "0",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "7K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [],
        "hotFiles": [],
        "narrative": {
          "shipped": "No commits on 2026-07-23.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": "No activity today. Check if the project is on track."
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          },
          {
            "severity": "amber",
            "name": "No commits today",
            "hint": "Zero activity in the reporting window.",
            "action": "Verify the project is healthy and contributors are unblocked.",
            "category": "activity"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "py",
            "files": 47,
            "loc": 6361,
            "percent": 97.7,
            "barWidth": 160
          },
          {
            "kind": "yaml",
            "files": 1,
            "loc": 126,
            "percent": 1.9,
            "barWidth": 3
          },
          {
            "kind": "txt",
            "files": 1,
            "loc": 21,
            "percent": 0.3,
            "barWidth": 1
          }
        ],
        "skills": [
          {
            "name": "yry-code/fastapi",
            "files": 16,
            "skillMd": 1,
            "evals": 0,
            "references": 15,
            "notes": "1 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 6508,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "<code>requirements.txt</code>: 20 pinned dependencies.",
          "verdict": "lean",
          "color": "green"
        }
      },
      "people": {
        "distribution": [],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 50,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 0,
            "hint": "no commits",
            "barWidth": 0
          }
        ],
        "review": {
          "text": "No commits in window.",
          "verdict": "n/a",
          "color": "muted"
        },
        "newContributors": "No commits in window."
      }
    },
    {
      "project": "YiH5",
      "scope": "/Users/ruiyi/Downloads/YrY/YiH5",
      "scopeShort": "YiH5",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "0",
            "sub": "no activity today",
            "tone": "warn"
          },
          {
            "label": "Insertions",
            "value": "+0",
            "sub": "lines added today",
            "tone": "normal"
          },
          {
            "label": "Deletions",
            "value": "−0",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "0",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "0",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "2K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [],
        "hotFiles": [],
        "narrative": {
          "shipped": "No commits on 2026-07-23.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": "No activity today. Check if the project is on track."
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          },
          {
            "severity": "amber",
            "name": "No commits today",
            "hint": "Zero activity in the reporting window.",
            "action": "Verify the project is healthy and contributors are unblocked.",
            "category": "activity"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "js",
            "files": 16,
            "loc": 1295,
            "percent": 77.3,
            "barWidth": 160
          },
          {
            "kind": "css",
            "files": 1,
            "loc": 341,
            "percent": 20.3,
            "barWidth": 42
          },
          {
            "kind": "html",
            "files": 1,
            "loc": 33,
            "percent": 2,
            "barWidth": 4
          },
          {
            "kind": "ico",
            "files": 1,
            "loc": 7,
            "percent": 0.4,
            "barWidth": 1
          }
        ],
        "skills": [
          {
            "name": "yry-code/h5",
            "files": 2,
            "skillMd": 1,
            "evals": 0,
            "references": 1,
            "notes": "1 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 1676,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "No dependency manifest found.",
          "verdict": "—",
          "color": "muted"
        }
      },
      "people": {
        "distribution": [],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 20,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 0,
            "hint": "no commits",
            "barWidth": 0
          }
        ],
        "review": {
          "text": "No commits in window.",
          "verdict": "n/a",
          "color": "muted"
        },
        "newContributors": "No commits in window."
      }
    },
    {
      "project": "YiPet",
      "scope": "/Users/ruiyi/Downloads/YrY/YiPet",
      "scopeShort": "YiPet",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "24",
            "sub": "24 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+558,644",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−47,883",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "1",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "1993",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "349K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 24,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiDoc/data.js",
            "touches": 9
          },
          {
            "rank": 2,
            "path": "YiDoc/projects/Websites/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 3,
            "path": "YiDoc/projects/Websites/docs/setup.html",
            "touches": 3
          },
          {
            "rank": 4,
            "path": "YiDoc/projects/YiAi/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 5,
            "path": "YiDoc/projects/YiH5/docs/customization.html",
            "touches": 3
          }
        ],
        "narrative": {
          "shipped": "24 commit(s) on 2026-07-23. 1 author(s) active.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": null
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "js",
            "files": 335,
            "loc": 273829,
            "percent": 78,
            "barWidth": 160
          },
          {
            "kind": "css",
            "files": 109,
            "loc": 33097,
            "percent": 9.4,
            "barWidth": 19
          },
          {
            "kind": "svg",
            "files": 2,
            "loc": 17216,
            "percent": 4.9,
            "barWidth": 10
          },
          {
            "kind": "png",
            "files": 9,
            "loc": 15994,
            "percent": 4.6,
            "barWidth": 9
          },
          {
            "kind": "html",
            "files": 91,
            "loc": 7755,
            "percent": 2.2,
            "barWidth": 5
          },
          {
            "kind": "ttf",
            "files": 1,
            "loc": 1145,
            "percent": 0.3,
            "barWidth": 1
          }
        ],
        "skills": [
          {
            "name": "yry-code/chrome",
            "files": 8,
            "skillMd": 1,
            "evals": 0,
            "references": 7,
            "notes": "1 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 349036,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [
          {
            "marker": "TODO",
            "count": 2,
            "verdict": "pass",
            "color": "green",
            "share": "2 files"
          },
          {
            "marker": "FIXME",
            "count": 1,
            "verdict": "pass",
            "color": "green",
            "share": "1 files"
          },
          {
            "marker": "XXX",
            "count": 3,
            "verdict": "pass",
            "color": "green",
            "share": "3 files"
          }
        ],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "No dependency manifest found.",
          "verdict": "—",
          "color": "muted"
        }
      },
      "people": {
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 24,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 571,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 24,
            "hint": "24 commit(s)",
            "barWidth": 160
          }
        ],
        "review": {
          "text": "0/24 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
      }
    },
    {
      "project": "YiPot",
      "scope": "/Users/ruiyi/Downloads/YrY/YiPot",
      "scopeShort": "YiPot",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "24",
            "sub": "24 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+558,644",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−47,883",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "1",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "1993",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "78K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 24,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiDoc/data.js",
            "touches": 9
          },
          {
            "rank": 2,
            "path": "YiDoc/projects/Websites/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 3,
            "path": "YiDoc/projects/Websites/docs/setup.html",
            "touches": 3
          },
          {
            "rank": 4,
            "path": "YiDoc/projects/YiAi/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 5,
            "path": "YiDoc/projects/YiH5/docs/customization.html",
            "touches": 3
          }
        ],
        "narrative": {
          "shipped": "24 commit(s) on 2026-07-23. 1 author(s) active.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": null
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "gif",
            "files": 6,
            "loc": 24980,
            "percent": 28.8,
            "barWidth": 160
          },
          {
            "kind": "jsx",
            "files": 141,
            "loc": 16302,
            "percent": 18.8,
            "barWidth": 104
          },
          {
            "kind": "lock",
            "files": 2,
            "loc": 13895,
            "percent": 16,
            "barWidth": 89
          },
          {
            "kind": "svg",
            "files": 22,
            "loc": 10032,
            "percent": 11.6,
            "barWidth": 64
          },
          {
            "kind": "yaml",
            "files": 1,
            "loc": 6657,
            "percent": 7.7,
            "barWidth": 43
          },
          {
            "kind": "png",
            "files": 41,
            "loc": 5972,
            "percent": 6.9,
            "barWidth": 38
          }
        ],
        "skills": [
          {
            "name": "yry-code/tauri",
            "files": 2,
            "skillMd": 1,
            "evals": 0,
            "references": 1,
            "notes": "1 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 77838,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [
          {
            "marker": "XXX",
            "count": 1,
            "verdict": "pass",
            "color": "green",
            "share": "1 files"
          }
        ],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "<code>package.json</code>: 32 deps + 9 devDeps.",
          "verdict": "heavy",
          "color": "amber"
        }
      },
      "people": {
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 24,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 324,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 24,
            "hint": "24 commit(s)",
            "barWidth": 160
          }
        ],
        "review": {
          "text": "0/24 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
      }
    },
    {
      "project": "YiWeb",
      "scope": "/Users/ruiyi/Downloads/YrY/YiWeb",
      "scopeShort": "YiWeb",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "0",
            "sub": "no activity today",
            "tone": "warn"
          },
          {
            "label": "Insertions",
            "value": "+0",
            "sub": "lines added today",
            "tone": "normal"
          },
          {
            "label": "Deletions",
            "value": "−0",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "0",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "0",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "27K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [],
        "hotFiles": [],
        "narrative": {
          "shipped": "No commits on 2026-07-23.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": "No activity today. Check if the project is on track."
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          },
          {
            "severity": "amber",
            "name": "No commits today",
            "hint": "Zero activity in the reporting window.",
            "action": "Verify the project is healthy and contributors are unblocked.",
            "category": "activity"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "js",
            "files": 96,
            "loc": 23339,
            "percent": 86.9,
            "barWidth": 160
          },
          {
            "kind": "css",
            "files": 7,
            "loc": 3286,
            "percent": 12.2,
            "barWidth": 23
          },
          {
            "kind": "html",
            "files": 4,
            "loc": 229,
            "percent": 0.9,
            "barWidth": 2
          },
          {
            "kind": "ico",
            "files": 1,
            "loc": 7,
            "percent": 0,
            "barWidth": 0
          }
        ],
        "skills": [
          {
            "name": "yry-code/vue",
            "files": 19,
            "skillMd": 1,
            "evals": 0,
            "references": 18,
            "notes": "1 skill manifest(s)"
          },
          {
            "name": "yry-code/vite",
            "files": 2,
            "skillMd": 1,
            "evals": 0,
            "references": 1,
            "notes": "1 skill manifest(s)"
          },
          {
            "name": "yry-code/nodejs",
            "files": 2,
            "skillMd": 1,
            "evals": 0,
            "references": 1,
            "notes": "1 skill manifest(s)"
          },
          {
            "name": "yry-code/css",
            "files": 2,
            "skillMd": 1,
            "evals": 0,
            "references": 1,
            "notes": "1 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 26861,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "No dependency manifest found.",
          "verdict": "—",
          "color": "muted"
        }
      },
      "people": {
        "distribution": [],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 109,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 0,
            "hint": "no commits",
            "barWidth": 0
          }
        ],
        "review": {
          "text": "No commits in window.",
          "verdict": "n/a",
          "color": "muted"
        },
        "newContributors": "No commits in window."
      }
    },
    {
      "project": "YiviY",
      "scope": "/Users/ruiyi/Downloads/YrY/YiviY",
      "scopeShort": "YiviY",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "24",
            "sub": "24 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+558,644",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−47,883",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "1",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "1993",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "8K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 24,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiDoc/data.js",
            "touches": 9
          },
          {
            "rank": 2,
            "path": "YiDoc/projects/Websites/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 3,
            "path": "YiDoc/projects/Websites/docs/setup.html",
            "touches": 3
          },
          {
            "rank": 4,
            "path": "YiDoc/projects/YiAi/docs/customization.html",
            "touches": 3
          },
          {
            "rank": 5,
            "path": "YiDoc/projects/YiH5/docs/customization.html",
            "touches": 3
          }
        ],
        "narrative": {
          "shipped": "24 commit(s) on 2026-07-23. 1 author(s) active.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": null
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "py",
            "files": 63,
            "loc": 7044,
            "percent": 83.1,
            "barWidth": 160
          },
          {
            "kind": "ipynb",
            "files": 1,
            "loc": 835,
            "percent": 9.8,
            "barWidth": 19
          },
          {
            "kind": "json",
            "files": 2,
            "loc": 310,
            "percent": 3.7,
            "barWidth": 7
          },
          {
            "kind": "yaml",
            "files": 1,
            "loc": 188,
            "percent": 2.2,
            "barWidth": 4
          },
          {
            "kind": "txt",
            "files": 1,
            "loc": 38,
            "percent": 0.4,
            "barWidth": 1
          },
          {
            "kind": "xlsx",
            "files": 1,
            "loc": 37,
            "percent": 0.4,
            "barWidth": 1
          }
        ],
        "skills": [],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 8452,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [
          {
            "marker": "TODO",
            "count": 1,
            "verdict": "pass",
            "color": "green",
            "share": "1 files"
          }
        ],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "<code>requirements.txt</code>: 31 pinned dependencies.",
          "verdict": "heavy",
          "color": "amber"
        }
      },
      "people": {
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 24,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 74,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 24,
            "hint": "24 commit(s)",
            "barWidth": 160
          }
        ],
        "review": {
          "text": "0/24 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
      }
    },
    {
      "project": "Websites",
      "scope": "/Users/ruiyi/Downloads/YrY/Websites",
      "scopeShort": "Websites",
      "summary": {
        "kpis": [
          {
            "label": "Commits",
            "value": "0",
            "sub": "no activity today",
            "tone": "warn"
          },
          {
            "label": "Insertions",
            "value": "+0",
            "sub": "lines added today",
            "tone": "normal"
          },
          {
            "label": "Deletions",
            "value": "−0",
            "sub": "lines removed today",
            "tone": "normal"
          },
          {
            "label": "Authors",
            "value": "0",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "0",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "0",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [],
        "hotFiles": [],
        "narrative": {
          "shipped": "No commits on 2026-07-23.",
          "atRisk": "Single-author project — bus factor is 1.",
          "drifting": null,
          "watch": "No activity today. Check if the project is on track."
        }
      },
      "risk": {
        "legend": {
          "green": "within threshold",
          "amber": "monitor",
          "red": "needs action"
        },
        "items": [
          {
            "severity": "amber",
            "name": "Single-author bus factor",
            "hint": "Only one contributor has touched files in this window.",
            "action": "Encourage knowledge sharing or add reviewers.",
            "category": "people"
          },
          {
            "severity": "amber",
            "name": "No commits today",
            "hint": "Zero activity in the reporting window.",
            "action": "Verify the project is healthy and contributors are unblocked.",
            "category": "activity"
          }
        ]
      },
      "health": {
        "languages": [],
        "skills": [
          {
            "name": "yry-code/nginx",
            "files": 2,
            "skillMd": 1,
            "evals": 0,
            "references": 1,
            "notes": "1 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 0,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "n/a",
          "color": "muted",
          "testSceneCount": 0
        },
        "techDebt": [],
        "branches": [
          {
            "name": "master",
            "lastCommit": "2026-07-24",
            "ageDays": 0,
            "status": "active",
            "note": "1",
            "color": "green"
          }
        ],
        "dependencies": {
          "text": "No dependency manifest found.",
          "verdict": "—",
          "color": "muted"
        }
      },
      "people": {
        "distribution": [],
        "busFactor": [],
        "activityPulse": [
          {
            "date": "2026-07-23",
            "day": "Thu",
            "commits": 0,
            "hint": "no commits",
            "barWidth": 0
          }
        ],
        "review": {
          "text": "No commits in window.",
          "verdict": "n/a",
          "color": "muted"
        },
        "newContributors": "No commits in window."
      }
    }
  ]
};
