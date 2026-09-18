---
title: "归档子目录概览"
tags: [archive, curator, readme]
category: curator/archive
created: 2026-09-15
updated: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: yearly
roles: [curator]
benefit: "了解归档区用途、流程和废弃判定标准"
acceptance_criteria:
  - "说明归档流程的 5 个步骤"
  - "列出废弃判定的 5 种条件"
related:
  - ./01-归档-归档说明.md
  - ../governance/02-治理-治理规范.md
  - ../governance/05-治理-审查日志.md
  - ../README.md
---

# 归档子目录

> 已废弃内容的最终归宿。归档不是删除——是保留"我们曾经尝试过这个方向"的历史记忆。

详细流程见 [01-归档-归档说明.md](./01-归档-归档说明.md)。

## 归档流程

```
标记 deprecated → 6 个月宽限期 → 确认无交叉引用阻断 → 移至 archive/ → 登记归档索引
```

## 何时归档

- 内容被新版本替代
- `last_verified` 超 6 个月且无人更新
- 功能已删除、项目已结束
- 内容有严重错误且不再相关
- 内容与另一文件高度重复

## 关键原则

- **永不直接删除** — 始终移至归档区，保留审计线索
- **始终更新交叉引用** — 归档前修复所有指向该文件的链接
- **记录废弃原因** — 每条归档记录必须说明"为什么移除"
- **每年物理清理** — 超过 2 年且无参考价值的归档文件可物理删除