---
title: Observability Directory
tags: [leaf, observability, monitoring, infra, sre]
category: srer/observability
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [srer, leader]
benefit: "SRE 在一个地方找到可观测性模式、监控配置和基础设施指南"
acceptance_criteria:
  - "叶子目录的范围有清晰边界"
  - "文件清单表完整，包含一行描述"
  - 存在到相关叶子和父级 INDEX 的交叉引用
related:
  - ../../engineer/run/check-engineering-gotchas.md
  - ../../aier/平台/README.md
  - ../../README.md
---

# Observability Directory

> **作为** oncall SRE，**我希望**找到可观测性模式、监控配置指南和基础设施文档，**以便**保持系统可观测和可靠。

覆盖基础设施、运维、部署、技术债务、容量和成本相关的摘要。

## 包含范围

- 技术债务清单（Fowler 四象限 + 利息评估）
- 容量和成本（FinOps）
- 容器化和编排（Docker / Kubernetes）
- CI/CD（GitHub Actions / GitLab CI）
- 可观测性三大支柱（日志 / 指标 / 链路追踪）
- 反向代理（Nginx / Caddy）
- GPU 推理服务部署

## 文件类型和命名

- `*-summary.md`：主题摘要
- `*-template.md`：可复用模板
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: An infrastructure topic
tags: [infrastructure, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
review_cycle: quarterly
related:
  - ./capacity-and-cost-template.md
  - ./capacity-and-cost.md
  - ./dashboard-business-continuity.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐撰写结构

1. 背景和问题定义
2. 核心概念
3. 主流方案对比
4. 部署和运维要点
5. 反模式和陷阱
6. 本团队实施现状

## 已包含

- `tech-debt-inventory-template.md` — 技术债务清单模板（按域分类 + 利息评估 + 季度偿还优先级）
- `tech-debt-inventory-summary.md` — 技术债务清单摘要（Fowler 四象限 + 利息评估）
- `capacity-and-cost-template.md` — 容量和成本模板（FinOps，包含资源利用率/扩容阈值/单次请求成本/季度优化项）
- `capacity-and-cost-summary.md` — 容量和成本摘要（FinOps 方法论）
- `docker-kubernetes.md` — Docker 和 Kubernetes 可观测性
- `cicd.md` — CI/CD 流水线设计和可观测性
- `observability-triad.md` — 日志、指标、链路追踪 — 三大支柱
- `reverse-proxy.md` — 反向代理模式
- `containerized-deployment.md` — 容器化部署策略
- `gpu-inference.md` — GPU 推理部署
- `private-vs-public-cloud.md` — 私有云 vs 公有云部署

## 相关叶子

- [../../aier/平台](../../aier/平台) — AI 平台
- [../../aier/data](../../aier/data) — 数据
- [../../engineer/processes](../../engineer/run/README.md) — 运维流程
- [../../engineer/ship/capacity-planning.md](../../engineer/ship/capacity-planning.md) — 容量评估
- [../../engineer/ship/quarterly-tech-debt.md](../../engineer/ship/quarterly-tech-debt.md) — 季度技术债务
- [../../engineer/run/check-engineering-gotchas.md](../../engineer/run/check-engineering-gotchas.md) — 场景入口