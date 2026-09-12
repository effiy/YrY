---
title: Security domain index
tags: [domain-index, security, supply-chain, risk, compliance]
category: root
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, srer, executiver]
benefit: "All security-relevant content reachable from a single index"
acceptance_criteria:
  - "Aggregates security directories from engineer/, leader/, srer/"
  - "Organized by subdomain: supply-chain, appsec, risk, incident-response, compliance"
related:
  - ./INDEX.md
  - ./README.md
---

# 安全领域聚合索引

跨角色聚合供应链安全、应用安全、风险管理及合规类内容，提供统一的安全知识入口。

## 供应链与应用安全

| 目录 | 角色 | 描述 |
|---|---|---|
| [ship/02-交付-加固供应链.md](./ship/02-交付-加固供应链.md) | engineer | Python（pip-audit）+ Node.js（npm audit）依赖审计，锁文件完整性验证，构建可重现性，季度检查清单 |
| [ship/](./ship/) | engineer | 代码质量检查、安全加固实践、测试基础设施 |

### YrY 安全实践要点

- **YiAi (Python)**：使用 `pip-audit` 扫描已知漏洞，`pip check` 验证依赖一致性，`requirements.txt` 锁定精确版本和哈希值
- **YiVad/YiPet (Node.js)**：使用 `npm audit` 扫描漏洞，`npm ci` 保证构建可重现，ESLint + Prettier 保证代码质量基线
- **通用原则**：每个依赖必须证明自身价值——能否在 50 行内自行实现？维护是否活跃？传递依赖有多少？

## 风险管理

| 目录 | 角色 | 描述 |
|---|---|---|
| [../leader/risk/](../leader/risk/) | leader | 风险登记册、故障沟通模板、事故复盘（postmortem）方法论 |

## 事件响应

| 目录 | 角色 | 描述 |
|---|---|---|
| [../srer/incident-response/](../srer/incident-response/) | srer | 事件响应流程（检测→响应→恢复→复盘）、事故复盘报告 |
| [../srer/observability/](../srer/observability/) | srer | 监控告警配置、可观测性模式、SLO 定义与跟踪 |
| [../srer/release/](../srer/release/) | srer | 发布与回滚流程、金丝雀部署、热修复（hotfix）规范 |

## YrY 安全降级策略

YiAi 提供了多层安全降级能力，开发环境和生产环境行为不同：

| 安全机制 | 默认状态 | 说明 |
|---|---|---|
| 认证中间件 | 默认关闭 | `config.yaml` 中 `middleware.auth_enabled: false`，开发环境全开放 |
| 认证开启时 | JWT + bcrypt | 通过 `X-Token` 请求头验证，PyJWT 签发/验证 Token |
| CORS | 全开放 | 开发环境 `origins: ["*"]`，生产环境应配置具体域名 |
| Observer 中间件 | 可选 | 提供限流、采样、沙箱保护（默认关闭） |

## 跨领域引用

- [../leader/decisions/](../leader/decisions/) — 安全相关架构决策记录（ADR），如认证方案选择、加密策略
- [../executiver/strategy/](../executiver/strategy/) — 合规与监管策略
- [ship/04-交付-季度技术债.md](./ship/04-交付-季度技术债.md) — 安全相关技术债跟踪与优先级决策