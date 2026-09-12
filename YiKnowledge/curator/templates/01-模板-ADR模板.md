---
title: "ADR 模板 — 架构决策记录"
aliases: [adr-template, architecture-decision-template]
tags: [template, adr, architecture, decision, leader]
category: curator/templates
created: 2026-08-24
updated: 2026-09-10
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人编写一致、可追溯的架构决策，工程师在实现过程中可直接参考"
acceptance_criteria:
  - "5 个部分：Context、Decision、Alternatives Considered、Consequences、Status"
  - "每个 ADR 捕获权衡取舍，而非仅记录最终选择"
  - "状态字段强制执行生命周期（proposed → accepted → deprecated → superseded）"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./tech-design.md
  - ../../leader/decisions/
  - ../../leader/architecture/design-architecture-decision.md
---

# ADR 模板 — 架构决策记录

> **何时使用：** 用于任何具有架构意义的决策——技术选型、模式采纳、协议变更或架构约束。ADR 捕获的是*为什么选择 A 而不是 B*，并记录权衡取舍。使用 ADR 的场景包括但不限于：选用新的库/框架、改变 API 协议、调整数据存储方案、引入新的设计模式。

## 适用场景

- 新技术的引入或替换（如"从 Vite 迁移到 Rsbuild"）
- 架构模式的变更（如"从 REST 迁移到 RPC 信封"）
- 跨项目协议的定义（如"参数名称标准化为 filter 而非 query"）
- 基础设施选型（如"使用 Ollama 而非 OpenAI API"）

## 使用说明

1. 复制此模板到目标位置（如 `leader/decisions/yivad/xxx.md`）
2. 填写所有 `{{placeholder}}`
3. 特别注意"Alternatives Considered"部分——这是 ADR 的核心价值
4. Status 初始设为 `proposed`，团队评审通过后改为 `accepted`
5. 当决策被取代时，更新 Status 为 `superseded` 并链接到新的 ADR

---

## Context

> 什么情况需要决策？描述问题、约束条件和影响因素。

{{2-4 句话。我们在构建什么？存在哪些约束（时间、团队、预算、技术）？哪些因素在推动我们做出决策？}}

### 示例（好的 context）

> YiVad 当前使用 Vite 作为构建工具，但 Vite 在大型 SPA（>100 个组件）场景下 HMR 速度下降明显。团队有 3 人熟悉 Webpack 但对 Rsbuild 无经验。目标是 2026 Q3 完成迁移。

## Decision

> 我们做了什么决策？具体、明确、不含糊。

**我们将 {{用一句话描述决策}}。**

**理由：** {{1-2 句话说明为什么在给定的上下文中这是正确的选择。}}

### 决策描述的黄金法则

决策必须是一句话、可证伪的。反面示例：
- 错误："我们将改进构建系统"（太模糊，不构成决策）
- 正确："我们将使用 Rsbuild 替代 Vite 作为 YiVad 的构建工具"

## Alternatives Considered

> 我们评估了哪些其他选项，为什么被否决？

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| {{方案 A}} | {{好处}} | {{不足}} | {{原因}} |
| {{方案 B}} | {{好处}} | {{不足}} | {{原因}} |
| {{方案 C（已选择）}} | {{好处}} | {{不足}} | 不适用——已选择 |

### 必须至少列出 2 个替代方案

如果只想出一个替代方案或根本没有替代方案，说明你没有真正做技术选型——ADR 的核心价值在于呈现"为什么否决了其他选择"。

## Consequences

> 因为这项决策，什么变得更容易、更困难或变得不同？

### 正面影响

- {{什么改善了？我们获得了什么新能力？}}

### 负面影响（权衡取舍）

- {{什么变得更困难？我们放弃了什么？}}

### 中性影响（需要关注的事项）

- {{什么可能改变？我们做了什么假设？}}

### 后果分析模板

| 影响维度 | 描述 | 缓解措施（如适用） |
|---|---|---|
| 开发效率 | {{影响}} | {{缓解}} |
| 运维复杂度 | {{影响}} | {{缓解}} |
| 团队学习成本 | {{影响}} | {{缓解}} |
| 未来灵活性 | {{影响}} | {{缓解}} |

## Status

> 取以下之一：`proposed` | `accepted` | `deprecated` | `superseded`

**状态：** {{proposed}}

**日期：** {{YYYY-MM-DD}}

**被替代：** {{如有，链接到替代 ADR}}

### 状态流转

```
proposed（提案中）→ accepted（已接受）→ deprecated（已废弃）/ superseded（被取代）
```

- `proposed` — 刚创建，等待团队评审
- `accepted` — 团队评审通过，正在执行
- `deprecated` — 不再适用于当前架构（通常因为系统演进）
- `superseded` — 被另一个 ADR 替代（链接到新 ADR）

## 反模式

| 反模式 | 失效原因 | 正确做法 |
|---|---|---|
| ADR 没有替代方案 | 无法判断决策是深思熟虑还是第一个想到的点子 | 始终列出至少 2 个替代方案，含优缺点 |
| ADR 写成博客文章（没有决策） | 没有记录实际决策；只有背景 | 决策必须是一句具体、可证伪的陈述 |
| 状态从不更新 | 决策看起来仍在生效，但实际上已被取代数月 | 当决策被替代或废弃时更新状态 |
| 没有后果部分 | 权衡取舍不可见；未来的读者重复同样的错误 | 诚实地说明什么会变差——每个决策都有权衡 |
| ADR 过于冗长 | 读者（尤其是工程师）不会阅读 10 页的决策文档 | 控制在 1-2 页以内；详细分析放在链接到 ADR 的单独文档中 |