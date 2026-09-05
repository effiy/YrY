---
title: Knowledge Curator — Archive
tags: [leaf, curator, archive, deprecated, legacy]
category: curator/archive
created: 2026-08-06
updated: 2026-08-10
last_verified: 2026-08-10
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: yearly
roles: [curator]
benefit: "Knowledge curators find archived and deprecated content"
acceptance_criteria:
  - "Archive index accessible"
  - "Deprecation policy linked"
related:
  - ../INDEX.md
  - ../治理/governance.md
  - ../../engineer/run/knowledge-deprecation-policy.md
---

# Knowledge Curator — 归档

> **作为**知识 curator，**我希望**找到已归档和废弃的内容，**以便**在不污染活跃目录的情况下参考历史材料。

## 归档内容

| 文件 | 描述 |
|---|---|
| [archive.md](./archive.md) | 归档索引——已废弃文件登记表 |

## 何时归档

1. 文件被新版本取代
2. 文件超过 6 个月未验证（`status: deprecated`）
3. 内容不再与活跃项目相关
4. 将文件移至此目录，然后更新 [archive.md](./archive.md) 添加废弃记录

## 交叉引用

- [../治理/governance.md](../治理/governance.md) — 治理流程和生命周期规则
- [../../engineer/run/knowledge-deprecation-policy.md](../../engineer/run/knowledge-deprecation-policy.md) — 废弃策略