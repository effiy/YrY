# scoring.md

> Unified score + alert spec for yry-report-files. Conforms to
> [yry-report/references/scoring-alert-spec.md](../../yry-report/references/scoring-alert-spec.md) v1.0.
> The orchestrator (`yry-report`) reads this block to compute the composite score.

```mermaid
graph TB
    subgraph "5 维评分信号 📊"
        OS[Oversized-file Health<br/>权重: 30%<br/>lines>1000/500-1000]
        ND[Nesting-depth Health<br/>权重: 20%<br/>maxDepth>15/8-15]
        CY[Cycle Health<br/>权重: 20%<br/>length≥3/length=2]
        CO[Coupling Health<br/>权重: 15%<br/>fanOut>20/fanIn>30]
        FR[Freshness Health<br/>权重: 15%<br/>age>365/180-365]
    end

    subgraph "评分计算 🔢"
        OS --> SCORE[filesScore<br/>0-100 加权求和]
        ND --> SCORE
        CY --> SCORE
        CO --> SCORE
        FR --> SCORE
        SCORE --> GRADE{Grade 等级}
        GRADE -->|90-100| A[A]
        GRADE -->|75-89| B[B]
        GRADE -->|60-74| C[C]
        GRADE -->|40-59| D[D]
        GRADE -->|0-39| F[F]
    end

    subgraph "告警映射 🚨"
        SCORE --> ALERTS[alerts[] 数组]
        ALERTS --> P0[P0 · Critical]
        ALERTS --> P1[P1 · Warning]
        ALERTS --> P2[P2 · Info]
    end

    style OS fill:#ffcdd2
    style ND fill:#f8bbd0
    style CY fill:#e1bee7
    style CO fill:#d1c4e9
    style FR fill:#c5cae9
    style SCORE fill:#fff9c4
    style GRADE fill:#b2dfdb
```

## Scoring rubric (0–100)

The `files` sub-skill score is a weighted blend of five signals.
Each signal is normalized to 0–100 using a **rate-based** formula
`100 × (1 − min(1, count/budget))` where `budget` is the finding
count at which the score floors at 0. Letter grade follows the
shared scale (90–100 A, 75–89 B, 60–74 C, 40–59 D, 0–39 F).

| Signal | Weight | Normalization | Notes |
|--------|:------:|----------------|-------|
| Oversized-file health | 30% | `100 × (1 − min(1, criticalCount/50 + warningCount/100))` | `>1000 LOC` = critical, `500–1000` = warning |
| Nesting-depth health | 20% | `100 × (1 − min(1, depthGt15/30 + depth8to15/80))` | Deep import chains destabilize change blast radius |
| Cycle health | 20% | `100 × (1 − min(1, cyclesLenGte3/20 + cyclesLen2/50))` | Long cycles are P0; 2-node cycles are P1 |
| Coupling health | 15% | `100 × (1 − min(1, fanOutGt20/40 + fanInGt30/40))` | God-module detection |
| Freshness health | 15% | `100 × (1 − min(1, staleGt365/50 + stale180to365/100 + stale90to180/200))` | `asOf = max(lastModified)`; long-untouched files decay the score |

```
filesScore = oversized*0.30 + depth*0.20 + cycles*0.20 + coupling*0.15 + freshness*0.15
```

`score.trend` is `unknown` on the first run, then `stable` / `improving` / `declining` based on a baseline at `.memory/files-baseline.json` (compared via `--compare`).

## Alert mapping

Findings use the unified `P0` / `P1` / `P2` vocabulary:

| Legacy | Unified | Marker |
|--------|---------|--------|
| Critical | `P0` | 🚫 |
| Warning | `P1` | ⚠️ |
| Info | `P2` | ℹ️ |

## JSON contract (sidecar)

The orchestrator reads a sidecar `data.js` extension.
`window.REPORT_DATA` gains two new top-level keys:

```json
{
  "scoringAlertSpec": "1.0",
  "score": {
    "value": 78,
    "grade": "B",
    "trend": "stable",
    "weights": [
      { "dimension": "oversized",  "weight": 0.30, "score": 70 },
      { "dimension": "depth",      "weight": 0.20, "score": 88 },
      { "dimension": "cycles",     "weight": 0.20, "score": 76 },
      { "dimension": "coupling",   "weight": 0.15, "score": 82 },
      { "dimension": "freshness",  "weight": 0.15, "score": 74 }
    ]
  },
  "alerts": [
    {
      "severity": "P0",
      "marker": "🚫",
      "category": "bloat",
      "file": "src/scoring.mjs",
      "line": null,
      "message": "File exceeds 1000 LOC (2500 lines, 85 functions)",
      "evidence": null
    }
  ]
}
```

The Vue page MAY render a score gauge from `score.value`, but is not
required to in v1.
