---
title: 跨组协作 RACI 矩阵
tags: [协作, RACI, 跨团队]
category: work/collaboration
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 跨组协作 RACI 矩阵

## 1. 是什么

RACI 矩阵：明确每项任务的角色分工，避免"三个团队都以为对方在做"。

- **R**esponsible 执行：真正做事的人
- **A**ccountable 负责：最终为结果负责的人（每任务仅 1 人）
- **C**onsulted 咨询：执行前需要被咨询
- **I**nformed 知会：执行后需要被通知

## 2. 为什么用

跨团队典型痛点：

- 三团队都以为对方在做 → 没人做
- 决策需要 4 方签字 → 等一周
- 出了问题互相甩锅
- 上游不知道下游需求

RACI 把每任务的"做什么 / 谁拍板 / 谁咨询 / 谁知"列清。

## 3. 矩阵示例

| 任务 | 团队 A | 团队 B | 团队 C | 法务 |
|---|---|---|---|---|
| 需求评审 | A | R | C | I |
| 技术方案 | R | C | I | - |
| 数据合规 | C | A | I | R |
| 上线发布 | A | R | R | I |

> 每任务至少 1 个 A（负责）、1 个 R（执行）。多人 R 可并行，多人 C 必须都咨询到。

## 4. 实施步骤

1. 列关键任务（10-20 项）
2. 列相关团队 / 角色
3. 每任务填 R / A / C / I
4. 验证：每任务有且仅有 1 个 A
5. 公开矩阵给所有相关方
6. 任务执行时按矩阵调用

## 5. 角色规范

### Responsible（R）

- 真正做事的人
- 可多人（并行任务）
- 不做就被卡

### Accountable（A）

- 最终为结果负责
- **每任务仅 1 人**
- 拍板与最终决策
- R 完成后向 A 汇报

### Consulted（C）

- 执行前必须咨询
- 双向沟通（不是单向通知）
- 跳过 C 后果：方案被拒、返工

### Informed（I）

- 执行后知会
- 单向通知
- 跳过 I 后果：下游不知道、错失对齐

## 6. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 每任务多个 A | 互相推诿 | 每任务仅 1 个 A |
| 全是 R | 没人拍板 | 必有 A |
| C 与 I 混淆 | 该咨询的只通知 | C 是双向、I 是单向 |
| 矩阵不公开 | 各自以为的角色不同 | 公开全员可查 |
| 一成不变 | 半年前的 RACI 已过时 | 季度复审 |
| 没有升级路径 | A 之间分歧无法解决 | 定义升级机制 |

## 7. 与其他协作工具关系

- 与 [cross-team-collaboration-process](../processes/cross-team-collaboration-process.md) 联动：契约阶段定义 RACI
- 与 [requirement-review-process](../processes/requirement-review-process.md) 联动：评审时列 RACI
- 与 [project-handover-process](../processes/project-handover-process.md) 联动：交接时更新 RACI

## 8. 落地要点

- 每个跨团队项目启动时画 RACI 矩阵
- 矩阵存于团队 wiki 全员可查
- 任务执行时调用对应角色
- 季度复审矩阵是否仍准确
- 升级路径：A 之间分歧 → 上层仲裁

## 9. 变体

### RACI-VS

加 Verifier（验证者）与 Signoff（签字人）。

### RASCI

加 Support（支持者），区分执行者与辅助者。

### DACI

Driver / Approver / Contributor / Informed，更聚焦决策角色。

## 10. 参考资料

- PMI — *PMBOK Guide*（RACI 章节）
- Atlassian — *How to use RACI*
