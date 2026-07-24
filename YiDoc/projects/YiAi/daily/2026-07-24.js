window.REPORT_DATA = {
  "meta": {
    "date": "2026-07-24",
    "window": "1d",
    "sinceDate": "2026-07-24",
    "untilDate": "2026-07-24",
    "timestamp": "2026-07-24T07:47:00.808Z",
    "title": "YrY · Daily CTO Report · 2026-07-24"
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
            "value": "15",
            "sub": "15 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+137,403",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−49,246",
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
            "value": "402",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "128K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 15,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiDoc/projects/YiAi/data.js",
            "touches": 4
          },
          {
            "rank": 2,
            "path": "YiDoc/projects/YiH5/data.js",
            "touches": 4
          },
          {
            "rank": 3,
            "path": "YiDoc/projects/YiPot/data.js",
            "touches": 4
          },
          {
            "rank": 4,
            "path": "YiDoc/daily/gen_daily.js",
            "touches": 4
          },
          {
            "rank": 5,
            "path": "YiDoc/projects/Websites/arch/index.html",
            "touches": 3
          }
        ],
        "narrative": {
          "shipped": "15 commit(s) on 2026-07-24. 1 author(s) active.",
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
          },
          {
            "severity": "amber",
            "name": "High TODO count (21)",
            "hint": "21 files contain TODO markers.",
            "action": "Schedule a tech-debt sprint to resolve.",
            "category": "debt"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "js",
            "files": 106,
            "loc": 75331,
            "percent": 58.9,
            "barWidth": 160
          },
          {
            "kind": "html",
            "files": 112,
            "loc": 27767,
            "percent": 21.7,
            "barWidth": 59
          },
          {
            "kind": "css",
            "files": 32,
            "loc": 14471,
            "percent": 11.3,
            "barWidth": 31
          },
          {
            "kind": "md",
            "files": 95,
            "loc": 10360,
            "percent": 8.1,
            "barWidth": 22
          },
          {
            "kind": "svg",
            "files": 13,
            "loc": 51,
            "percent": 0,
            "barWidth": 0
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
            "files": 185,
            "skillMd": 6,
            "evals": 1,
            "references": 65,
            "notes": "6 skill manifest(s)"
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
            "files": 164,
            "skillMd": 11,
            "evals": 8,
            "references": 75,
            "notes": "11 skill manifest(s)"
          }
        ],
        "tests": {
          "testLoc": 8345,
          "allJsLoc": 127980,
          "ratio": 0.0652055008595093,
          "threshold": 0.2,
          "verdict": "sparse",
          "color": "amber",
          "testSceneCount": 80
        },
        "techDebt": [
          {
            "marker": "TODO",
            "count": 21,
            "verdict": "warn",
            "color": "amber",
            "share": "21 files"
          },
          {
            "marker": "FIXME",
            "count": 20,
            "verdict": "warn",
            "color": "amber",
            "share": "20 files"
          },
          {
            "marker": "HACK",
            "count": 15,
            "verdict": "warn",
            "color": "amber",
            "share": "15 files"
          },
          {
            "marker": "XXX",
            "count": 20,
            "verdict": "warn",
            "color": "amber",
            "share": "20 files"
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
            "commits": 15,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 542,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-24",
            "day": "Fri",
            "commits": 15,
            "hint": "15 commit(s)",
            "barWidth": 160
          }
        ],
        "review": {
          "text": "0/15 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "No new contributors (all 1 author(s) have prior history)."
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
            "value": "3",
            "sub": "3 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+6,672",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−128",
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
            "value": "68",
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
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 3,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiAi/src/services/__init__.py",
            "touches": 3
          },
          {
            "rank": 2,
            "path": "YiAi/src/services/state/__init__.py",
            "touches": 3
          },
          {
            "rank": 3,
            "path": "YiAi/src/services/ai/chat_service.py",
            "touches": 2
          },
          {
            "rank": 4,
            "path": "YiAi/src/services/database/data_service.py",
            "touches": 2
          },
          {
            "rank": 5,
            "path": "YiAi/src/services/database/mongo_store.py",
            "touches": 2
          }
        ],
        "narrative": {
          "shipped": "3 commit(s) on 2026-07-24. 1 author(s) active.",
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
          },
          {
            "severity": "amber",
            "name": "High TODO count (511)",
            "hint": "511 files contain TODO markers.",
            "action": "Schedule a tech-debt sprint to resolve.",
            "category": "debt"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "py",
            "files": 70,
            "loc": 6434,
            "percent": 97,
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
            "kind": "log",
            "files": 1,
            "loc": 51,
            "percent": 0.8,
            "barWidth": 1
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
          "allJsLoc": 6632,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [
          {
            "marker": "TODO",
            "count": 511,
            "verdict": "critical",
            "color": "red",
            "share": "511 files"
          },
          {
            "marker": "FIXME",
            "count": 94,
            "verdict": "critical",
            "color": "red",
            "share": "94 files"
          },
          {
            "marker": "HACK",
            "count": 12,
            "verdict": "warn",
            "color": "amber",
            "share": "12 files"
          },
          {
            "marker": "XXX",
            "count": 104,
            "verdict": "critical",
            "color": "red",
            "share": "104 files"
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
          "text": "<code>requirements.txt</code>: 20 pinned dependencies.",
          "verdict": "lean",
          "color": "green"
        }
      },
      "people": {
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 3,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 68,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-24",
            "day": "Fri",
            "commits": 3,
            "hint": "3 commit(s)",
            "barWidth": 60
          }
        ],
        "review": {
          "text": "0/3 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
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
            "value": "4",
            "sub": "4 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+2,725",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−891",
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
            "value": "44",
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
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 4,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiH5/src/views/ChatView.js",
            "touches": 3
          },
          {
            "rank": 2,
            "path": "YiH5/src/views/NewsList.js",
            "touches": 3
          },
          {
            "rank": 3,
            "path": "YiH5/src/views/SessionList.js",
            "touches": 3
          },
          {
            "rank": 4,
            "path": "YiH5/index.html",
            "touches": 2
          },
          {
            "rank": 5,
            "path": "YiH5/src/components/FaqPopup.js",
            "touches": 2
          }
        ],
        "narrative": {
          "shipped": "4 commit(s) on 2026-07-24. 1 author(s) active.",
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
            "files": 23,
            "loc": 1242,
            "percent": 67.2,
            "barWidth": 160
          },
          {
            "kind": "css",
            "files": 4,
            "loc": 344,
            "percent": 18.6,
            "barWidth": 44
          },
          {
            "kind": "html",
            "files": 9,
            "loc": 256,
            "percent": 13.8,
            "barWidth": 33
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
          "allJsLoc": 1849,
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
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 4,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 44,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-24",
            "day": "Fri",
            "commits": 4,
            "hint": "4 commit(s)",
            "barWidth": 80
          }
        ],
        "review": {
          "text": "0/4 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
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
            "value": "5",
            "sub": "5 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+11,989",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−5,052",
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
            "value": "117",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "350K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 5,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiPet/cdn/utils/core/error.js",
            "touches": 2
          },
          {
            "rank": 2,
            "path": "YiPet/cdn/components/pet/chat/ChatWindow/index.js",
            "touches": 2
          },
          {
            "rank": 3,
            "path": "YiPet/cdn/components/pet/chat/WelcomeCard/index.js",
            "touches": 2
          },
          {
            "rank": 4,
            "path": "YiPet/cdn/components/business/HeaderActions",
            "touches": 1
          },
          {
            "rank": 5,
            "path": "YiPet/cdn/components/business/MarkdownView",
            "touches": 1
          }
        ],
        "narrative": {
          "shipped": "5 commit(s) on 2026-07-24. 1 author(s) active.",
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
            "files": 336,
            "loc": 275029,
            "percent": 78,
            "barWidth": 160
          },
          {
            "kind": "css",
            "files": 110,
            "loc": 33099,
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
            "percent": 4.5,
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
          "allJsLoc": 350238,
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
            "commits": 5,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 627,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-24",
            "day": "Fri",
            "commits": 5,
            "hint": "5 commit(s)",
            "barWidth": 100
          }
        ],
        "review": {
          "text": "0/5 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "No new contributors (all 1 author(s) have prior history)."
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
            "value": "1",
            "sub": "1 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+32",
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
            "value": "1",
            "sub": "single-author",
            "tone": "critical"
          },
          {
            "label": "Files touched",
            "value": "18",
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
            "commits": 1,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiPot/index.html",
            "touches": 1
          },
          {
            "rank": 2,
            "path": "YiPot/src/i18n/locales/ar_AE.json",
            "touches": 1
          },
          {
            "rank": 3,
            "path": "YiPot/src/i18n/locales/de_DE.json",
            "touches": 1
          },
          {
            "rank": 4,
            "path": "YiPot/src/i18n/locales/fa_IR.json",
            "touches": 1
          },
          {
            "rank": 5,
            "path": "YiPot/src/i18n/locales/fr_FR.json",
            "touches": 1
          }
        ],
        "narrative": {
          "shipped": "1 commit(s) on 2026-07-24. 1 author(s) active.",
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
          },
          {
            "severity": "amber",
            "name": "High TODO count (234)",
            "hint": "234 files contain TODO markers.",
            "action": "Schedule a tech-debt sprint to resolve.",
            "category": "debt"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "gif",
            "files": 6,
            "loc": 24980,
            "percent": 28.7,
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
            "percent": 11.5,
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
            "marker": "TODO",
            "count": 234,
            "verdict": "critical",
            "color": "red",
            "share": "234 files"
          },
          {
            "marker": "FIXME",
            "count": 14,
            "verdict": "warn",
            "color": "amber",
            "share": "14 files"
          },
          {
            "marker": "XXX",
            "count": 21,
            "verdict": "warn",
            "color": "amber",
            "share": "21 files"
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
            "commits": 1,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 341,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-24",
            "day": "Fri",
            "commits": 1,
            "hint": "1 commit(s)",
            "barWidth": 20
          }
        ],
        "review": {
          "text": "0/1 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "No new contributors (all 1 author(s) have prior history)."
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
            "value": "7",
            "sub": "7 commit(s)",
            "tone": "normal"
          },
          {
            "label": "Insertions",
            "value": "+29,160",
            "sub": "lines added today",
            "tone": "warn"
          },
          {
            "label": "Deletions",
            "value": "−4,441",
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
            "value": "175",
            "sub": "unique paths",
            "tone": "normal"
          },
          {
            "label": "Total LOC",
            "value": "25K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 7,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "hotFiles": [
          {
            "rank": 1,
            "path": "YiWeb/src/views/aicr/index.js",
            "touches": 4
          },
          {
            "rank": 2,
            "path": "YiWeb/src/views/story/index.js",
            "touches": 4
          },
          {
            "rank": 3,
            "path": "YiWeb/src/views/aicr/composables/sessionChatContextMethods.js",
            "touches": 2
          },
          {
            "rank": 4,
            "path": "YiWeb/_restructure.sh",
            "touches": 2
          },
          {
            "rank": 5,
            "path": "YiWeb/_update_imports.sh",
            "touches": 2
          }
        ],
        "narrative": {
          "shipped": "7 commit(s) on 2026-07-24. 1 author(s) active.",
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
            "files": 85,
            "loc": 21172,
            "percent": 85.4,
            "barWidth": 160
          },
          {
            "kind": "css",
            "files": 10,
            "loc": 3353,
            "percent": 13.5,
            "barWidth": 25
          },
          {
            "kind": "html",
            "files": 7,
            "loc": 249,
            "percent": 1,
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
          "allJsLoc": 24781,
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
        "distribution": [
          {
            "author": "Chengliang.Yi1@zeekrlife.com",
            "commits": 7,
            "percent": 100,
            "barWidth": 160
          }
        ],
        "busFactor": [
          {
            "bucket": "1 author",
            "files": 175,
            "percent": 100,
            "verdict": "critical",
            "color": "red"
          }
        ],
        "activityPulse": [
          {
            "date": "2026-07-24",
            "day": "Fri",
            "commits": 7,
            "hint": "7 commit(s)",
            "barWidth": 140
          }
        ],
        "review": {
          "text": "0/7 commits (0%) carry a review trailer (Reviewed-by/Acked-by/Tested-by/Co-authored-by).",
          "verdict": "none",
          "color": "red"
        },
        "newContributors": "1 new contributor(s): Chengliang.Yi1@zeekrlife.com."
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
            "value": "9K",
            "sub": "project-wide",
            "tone": "normal"
          }
        ],
        "contributors": [],
        "hotFiles": [],
        "narrative": {
          "shipped": "No commits on 2026-07-24.",
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
          },
          {
            "severity": "amber",
            "name": "High TODO count (2843)",
            "hint": "2843 files contain TODO markers.",
            "action": "Schedule a tech-debt sprint to resolve.",
            "category": "debt"
          }
        ]
      },
      "health": {
        "languages": [
          {
            "kind": "py",
            "files": 63,
            "loc": 7044,
            "percent": 78.4,
            "barWidth": 160
          },
          {
            "kind": "ipynb",
            "files": 1,
            "loc": 835,
            "percent": 9.3,
            "barWidth": 19
          },
          {
            "kind": "pyc",
            "files": 15,
            "loc": 508,
            "percent": 5.7,
            "barWidth": 12
          },
          {
            "kind": "json",
            "files": 2,
            "loc": 310,
            "percent": 3.4,
            "barWidth": 7
          },
          {
            "kind": "yaml",
            "files": 1,
            "loc": 188,
            "percent": 2.1,
            "barWidth": 4
          },
          {
            "kind": "txt",
            "files": 1,
            "loc": 38,
            "percent": 0.4,
            "barWidth": 1
          }
        ],
        "skills": [],
        "tests": {
          "testLoc": 0,
          "allJsLoc": 8923,
          "ratio": 0,
          "threshold": 0.2,
          "verdict": "no tests",
          "color": "red",
          "testSceneCount": 0
        },
        "techDebt": [
          {
            "marker": "TODO",
            "count": 2843,
            "verdict": "critical",
            "color": "red",
            "share": "2843 files"
          },
          {
            "marker": "FIXME",
            "count": 385,
            "verdict": "critical",
            "color": "red",
            "share": "385 files"
          },
          {
            "marker": "HACK",
            "count": 54,
            "verdict": "critical",
            "color": "red",
            "share": "54 files"
          },
          {
            "marker": "XXX",
            "count": 734,
            "verdict": "critical",
            "color": "red",
            "share": "734 files"
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
        "distribution": [],
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
            "date": "2026-07-24",
            "day": "Fri",
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
          "shipped": "No commits on 2026-07-24.",
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
          "verdict": "—",
          "color": "muted"
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
            "date": "2026-07-24",
            "day": "Fri",
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
