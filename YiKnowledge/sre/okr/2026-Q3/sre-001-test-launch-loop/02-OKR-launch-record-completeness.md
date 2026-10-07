---
type: okr-metric
id: sre-m02
name: 上线记录完整度
category: 上线
framework: OKR
trend: up
progress: 100
title: SRE M02 上线记录完整度
updated: 2026-09-10
---

# 上线记录完整度

上线记录含 artifact/version/env 且可追溯的需求占比。

## 指标说明

该指标衡量的是：在 Q2 所有已上线的需求中，有多少需求产出了完整的上线记录。上线记录内容包括：

- **artifact**：本次上线的构建产物标识（Git commit hash / 版本号）
- **version**：本次上线涉及的服务版本信息（YiAi / YiVad / YiPet 各自的版本）
- **env**：本次上线的目标环境（预发布 / 生产）
- **可追溯性**：可通过 git log 追溯到每次上线的完整提交历史

目标是确保每次上线都留下可审计的记录，在出现问题时可以快速定位到具体的上线变更。

| 字段 | 值 |
|---|---|
| ID | `sre-m02` |
| 类别 | 上线 |
| 框架 | OKR |
| 基线值 | 0%（Q2 无上线记录规范）|
| 当前值 | 100% |
| 目标值 | 100% |
| 趋势 | 上升 |
| 进度 | 100% |