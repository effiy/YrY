---
title: Release Management
tags: [leaf, release, hotfix, rollback, canary]
category: srer/release
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [srer, engineer, leader]
benefit: "SRE 和工程师在一个地方找到发布流程、热修复工作流和回滚演练"
acceptance_criteria:
  - "发布流程：标准、金丝雀、热修复"
  - "回滚演练已文档化"
  - "存在发布冻结策略"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../engineer/infrastructure/
---

# Release Management

> **作为** oncall SRE，**我希望**找到发布流程和回滚工作流，**以便**安全上线并从不良部署中快速恢复。

## 发布流程

| 流程 | 文件 | 描述 |
|---|---|---|
| 标准发布 | [release.md](./release.md) | 常规发布工作流 |
| 金丝雀发布 | [canary-release.md](./canary-release.md) | 带流量切换的渐进式上线 |
| 热修复发布 | [hotfix-release.md](./hotfix-release.md) | 紧急修复工作流 |
| 发布冻结 | [release-freeze.md](./release-freeze.md) | 冻结策略和例外 |
| 回滚演练 | [rollback-drill.md](./rollback-drill.md) | 定期回滚练习 |

## 交叉引用

- [../../engineer/infrastructure/](../../engineer/infrastructure/) — CI/CD、feature flags、金丝雀部署模式
- [../../srer/release/release.md](../../srer/release/release.md) — 发布上线流程
- [../incident-response/](../incident-response/) — 事件响应流程