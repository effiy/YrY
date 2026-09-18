---
title: OKR 目录
aliases: [okr-readme, okr-overview]
tags: [okr, goals, metrics, index]
category: executiver/okr
created: 2026-08-18
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [executiver]
benefit: "快速了解 OKR 目录结构、当前周期进展和各目标状态"
related:
  - ../README.md
  - ../INDEX.md
  - ../strategy/15-战略-OKR方法论.md
  - ../roadmap/03-路线图-组织OKR追踪.md
---

# OKR 目录 — 2026 Q3

> **周期**：2026 Q3 (7月-9月) | **最后更新**：2026-09-15 | **整体进度**：~72%
>
> **与 OKR 方法论的关系**：本目录是 OKR 的**执行实例**。方法论参考 [strategy/15-战略-OKR方法论.md](../strategy/15-战略-OKR方法论.md)。

## 当前目标总览

| ID | 目标 | 负责人 | 进度 | KR 完成 | 指标完成 | 状态 |
|---|---|---|---|---|---|---|
| [exec-001](./2026-Q3/exec-001-市场情报与竞争洞察/goal.md) | 市场情报与竞争洞察 | CEO | 74% | 1/4 完成 | 2/2 部分完成 | 进行中 |
| [exec-002](./2026-Q3/exec-002-经营战略与组织路线/goal.md) | 经营战略与组织路线 | CEO | 79% | 1/4 完成 | 1/2 完成 | 进行中 |
| [exec-003](./2026-Q3/exec-003-经营学习与阅读/goal.md) | 经营学习与阅读 | CEO | 63% | 0/3 完成 | 0/1 完成 | 进行中 |

## 目录结构

```
okr/
├── README.md                  ← 你在这里
└── 2026-Q3/
    ├── exec-001-市场情报与竞争洞察/
    │   ├── goal.md            ← 目标定义
    │   ├── 01-OKR-*.md        ← KR 证据文件
    │   └── 02-OKR-*.md        ← 关联指标文件
    ├── exec-002-经营战略与组织路线/
    │   └── ...
    └── exec-003-经营学习与阅读/
        └── ...
```

## 文件命名约定

| 模式 | 用途 | 示例 |
|---|---|---|
| `goal.md` | 目标定义（O + KR 列表 + 背景 + 关联） | exec-001 的 goal.md |
| `0X-OKR-{描述}.md` | KR 证据文件或关联指标 | 01-OKR-竞品覆盖度.md |
| `{序号}-OKR-{描述}.md` | 关联指标文件 | 02-OKR-行业报告摘要数.md |

## Q3 关键里程碑

| 时间 | 里程碑 | 状态 |
|---|---|---|
| 7 月 | OKR 设定并沟通 | ✅ 完成 |
| 8 月中 | 月度 OKR 对齐检查 | ✅ 完成 |
| 9 月中（当前） | Q3 最终冲刺 + 评分准备 | 进行中 |
| 9 月底 | Q3 OKR 评分 + 反思 + Q4 OKR 草稿 | 待启动 |

## Q4 准备

Q3 评分完成后，Q4 OKR 应在本目录下创建 `2026-Q4/` 子目录，复用相同的 goal.md + KR 证据文件结构。

### Q4 候选目标方向

基于 Q3 进展和年度战略，Q4 可能的目标方向：

1. **RAG 检索质量突破** — 竞品和行业信息的检索准确率达到 85%+
2. **YiPet PMF 验证** — 完成用户增长实验，判断是否值得持续投入
3. **组织流程成熟化** — 三项目 CI/CD、DORA 指标基线、QBR 节奏固化

## 跨模块关联

- OKR 目标定义 → 参考 [strategy/15-战略-OKR方法论.md](../strategy/15-战略-OKR方法论.md)
- OKR 评分和 QBR → 参考 [roadmap/04-路线图-季度业务回顾.md](../roadmap/04-路线图-季度业务回顾.md)
- 组织 OKR 追踪 → 参考 [roadmap/03-路线图-组织OKR追踪.md](../roadmap/03-路线图-组织OKR追踪.md)
- 竞品/行业 KR 证据 → 参考 [industry/](../industry/)
- 阅读/学习 KR 证据 → 参考 [reading-list/](../reading-list/)

## 维护

- **每周**：更新 goal.md 中的 progress 百分比
- **每月**：月度对齐检查，更新 KR 状态
- **每季度**：评分 + 反思 + 创建下季度目录