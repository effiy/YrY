---
title: 2026 Q3 OKR Index
tags: [okr, index, q3, 2026]
category: okr/2026-Q3
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
status: active
lifecycle: reference
review_cycle: quarterly
roles: [executiver, producter, leader, engineer, srer, aier, curator]
benefit: "Navigate the 2026 Q3 OKR directory — find goals, metrics, KR evidence, and loop records"
acceptance_criteria:
  - "all 7 role directories listed with goals and metrics"
  - "2 loop records indexed"
  - "cross-references to parent README and role READMEs"
related:
  - ./README.md
  - ../README.md
  - ./goals/executiver/README.md
---

# 2026 Q3 OKR — Index

> **As a** team member, **I want to** navigate the Q3 OKR directory, **so that** I can find goals, metrics, and loop records for any role.

## Start here

| You want to... | Go to |
|---|---|
| See the Q3 OKR overview | [README.md](./README.md) |
| Browse executiver OKR details | [goals/executiver/README.md](./goals/executiver/README.md) |
| Browse all goals by role | Scroll down to [Goals](#goals) |
| Browse all metrics by role | Scroll down to [Metrics](#metrics) |
| See loop records | [loop/INDEX.md](./loop/INDEX.md) |
| Reuse record templates | [loop/_templates/](./loop/_templates/) |
| See monthly activity | [2026-08/](./2026-08/) |

## Directory map

```
2026-Q3/
├── INDEX.md                              ← you are here
├── README.md                             ← Q3 OKR overview
├── goals/                                ← 7 角色 × 目标 + 指标 + KR 证据
│   ├── executiver/
│   │   ├── INDEX.md                      ← executiver OKR MOC
│   │   ├── README.md                     ← executiver OKR overview
│   │   ├── exec-001-市场情报与竞争洞察.md
│   │   ├── exec-002-经营战略与组织路线.md
│   │   ├── exec-003-经营学习与阅读.md
│   │   ├── exec-m01~m05 (×5)             ← metrics
│   │   └── kr-exec-*-*.md (×11)          ← KR evidence
│   ├── producter/   (×3)
│   ├── leader/      (×3)
│   ├── engineer/    (×5)
│   ├── srer/        (×3)
│   ├── aier/        (×5)
│   └── curator/     (×4)
├── loop/
│   ├── INDEX.md
│   ├── _templates/  (×8)
│   ├── loop-001-okr-self-closed-loop/  (×9)
│   └── loop-002-template-orchestration/  (×9)
└── 2026-08/
    └── p0-engineer-*.md
```

## Goals

| Role | Goal ID | Title | KR |
|---|---|---|---|
| executiver | [exec-001](./goals/executiver/exec-001-市场情报与竞争洞察.md) | 市场情报与竞争洞察 | 4 |
| executiver | [exec-002](./goals/executiver/exec-002-经营战略与组织路线.md) | 经营战略与组织路线 | 4 |
| executiver | [exec-003](./goals/executiver/exec-003-经营学习与阅读.md) | 经营学习与阅读 | 3 |
| producter | [prod-001](./goals/producter/prod-001-requirement-review-loop.md) | 需求评审闭环 | — |
| leader | [lead-001](./goals/leader/lead-001-technical-review-loop.md) | 技术评审闭环 | — |
| engineer | [eng-001](./goals/engineer/eng-001-build-debug-loop.md) | 构建调试闭环 | — |
| engineer | [eng-005](./goals/engineer/eng-005-build-health-zero.md) | 构建健康清零 | — |
| srer | [sre-001](./goals/srer/sre-001-test-launch-loop.md) | 测试上线闭环 | — |
| aier | [aier-001](./goals/aier/aier-001-orchestration.md) | AI 编排 | — |
| aier | [aier-002](./goals/aier/aier-002-agent-reliability.md) | Agent 可靠性 | — |
| curator | [cur-001](./goals/curator/cur-001-process-record-kb.md) | 流程记录知识库 | — |

## Metrics

| Role | Metric ID | Name | Progress |
|---|---|---|---|
| executiver | [exec-m01](./goals/executiver/exec-m01-竞品覆盖度.md) | 竞品覆盖度 | 100% |
| executiver | [exec-m02](./goals/executiver/exec-m02-行业报告摘要数.md) | 行业报告摘要数 | 67% |
| executiver | [exec-m03](./goals/executiver/exec-m03-战略框架落地数.md) | 战略框架落地数 | 100% |
| executiver | [exec-m04](./goals/executiver/exec-m04-组织规划完备度.md) | 组织规划完备度 | 75% |
| executiver | [exec-m05](./goals/executiver/exec-m05-阅读蒸馏率.md) | 阅读蒸馏率 | 50% |
| producter | [prod-m01](./goals/producter/prod-m01-需求评审覆盖.md) | 需求评审覆盖 | — |
| producter | [prod-m02](./goals/producter/prod-m02-acceptance-criteria.md) | 验收标准 | — |
| leader | [lead-m01](./goals/leader/lead-m01-adr-覆盖率.md) | ADR 覆盖率 | — |
| leader | [lead-m02](./goals/leader/lead-m02-decision-traceability.md) | 决策可追溯性 | — |
| engineer | [eng-m01](./goals/engineer/eng-m01-zero-new-type-errors.md) | 零新增类型错误 | — |
| engineer | [eng-m02](./goals/engineer/eng-m02-build-pass.md) | 构建通过率 | — |
| engineer | [eng-m06](./goals/engineer/eng-m06-build-health.md) | 构建健康度 | — |
| srer | [sre-m01](./goals/srer/sre-m01-test-report-coverage.md) | 测试报告覆盖 | — |
| srer | [sre-m02](./goals/srer/sre-m02-launch-record-completeness.md) | 上线记录完整度 | — |
| aier | [aier-m01](./goals/aier/aier-m01-orchestration-coverage.md) | 编排覆盖度 | — |
| aier | [aier-m02](./goals/aier/aier-m02-agent-completion.md) | Agent 完成率 | — |
| aier | [aier-m03](./goals/aier/aier-m03-confirmation-gate.md) | 确认门禁 | — |
| curator | [cur-m01](./goals/curator/cur-m01-record-template-count.md) | 记录模板数 | — |
| curator | [cur-m03](./goals/curator/cur-m03-frontmatter-compliance.md) | Frontmatter 合规率 | — |
| curator | [cur-m06](./goals/curator/cur-m06-loop-retrievability.md) | Loop 可检索率 | — |

## Loop records

| Loop | Stages | Status |
|---|---|---|
| [loop-001: 全流程自闭环](./loop/loop-001-okr-self-closed-loop/) | 需求评审 → 技术评审 → 代码评审 → 构建调试 → 测试报告 → 部署 → 上线记录 → 复盘 | active |
| [loop-002: 模板编排](./loop/loop-002-template-orchestration/) | 需求评审 → 技术评审 → 代码评审 → 构建调试 → 测试报告 → 部署 → 上线记录 → 复盘 | active |

## Cross-references

| Target | Relevance |
|---|---|
| [../README.md](../README.md) | Parent OKR knowledge base overview |
| [./goals/executiver/README.md](./goals/executiver/README.md) | Executiver role OKR details |
| [./loop/INDEX.md](./loop/INDEX.md) | Loop records integration index |
| [../../executiver/strategy/](../../executiver/strategy/) | Strategy frameworks backing exec-002 |
| [../../executiver/industry/](../../executiver/industry/) | Industry intelligence backing exec-001 |
| [../../executiver/roadmap/](../../executiver/roadmap/) | Roadmap documents backing exec-002 |
| [../../executiver/reading-list/](../../executiver/reading-list/) | Reading list backing exec-003 |