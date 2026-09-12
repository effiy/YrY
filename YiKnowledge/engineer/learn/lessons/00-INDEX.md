---
title: lessons/ MOC
aliases: [lessons-moc, lessons-index, lessons-learned]
tags: [MOC, lessons, retrospective, wins, failures, gotchas, bugs]
category: engineer/learn/lessons
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer]
benefit: "Navigate lessons learned by category — wins to replicate, failures to learn from, gotchas to avoid"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category"
  - "cross-references to related gotchas and project bugs"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../run/check-engineering-gotchas.md
  - ../../run/review-lessons.md
  - ../../../leader/risk/write-a-postmortem.md
  - ../../../projects/
---

# lessons/ — 经验教训总目录

> 来自 YrY 真实项目实施过程中的一线记录。成功案例值得复用，失败复盘引以为戒，陷阱记录帮你避坑。每条经验背后都有具体的事件、根因和证据。

## 子目录

| 目录 | 内容 | 数量 |
|---|---|---|
| [wins/](./wins/) | 成功案例与可复用模式——记录了有效的架构选择、设计决策、工程实践 | 1 篇 |
| [failures/](./failures/) | 失败复盘与事故分析——使用无责复盘（blameless postmortem）格式 | 1 篇 |
| [gotchas/](./gotchas/) | 工程陷阱与注意事项——非直觉的行为和配置问题，花了很多调试时间 | 4 篇 |

## 成功案例（Wins）

| 文件 | 描述 | 核心启示 |
|---|---|---|
| [01-YiPet跨项目Hub](./wins/01-成果-YiPet跨项目Hub.md) | YiPet 在一个 Sprint 内成为跨项目集成中心 | 浏览器扩展作为观察者模式具有独特的架构优势 |

## 失败复盘（Failures）

| 文件 | 描述 | 核心教训 |
|---|---|---|
| [01-YiVad-AICR端口幻觉](./failures/01-教训-YiVad-AICR端口幻觉.md) | AI 助手声称完成了 AICR 页面的端到端移植（9 个 Store、8 个 Modal），但 master 上实际不存在任何代码 | 永不基于 AI 的对话总结更新 CLAUDE.md；信任但验证：`git log`、`ls`、`git diff` 是唯一的真相来源 |

## 陷阱记录（Gotchas）

| 文件 | 描述 | 影响范围 |
|---|---|---|
| [01-macOS-FSEvents静默丢弃](./gotchas/01-陷阱-macOS-FSEvents静默丢弃.md) | macOS FSEvents 在此机器上静默丢弃文件变更事件 | YiAi 知识库监听器（已用 polling 替代） |
| [02-RPC参数名不匹配](./gotchas/02-陷阱-RPC参数名不匹配.md) | RPC 参数名不匹配导致后端静默忽略——`filter` vs `query`、`target_file` vs `path` | YiVad、YiPet、YiAi（跨项目） |
| [03-SSE-onDone守卫](./gotchas/03-陷阱-SSE-onDone守卫.md) | SSE 流的 `onDone` 回调在用户中止后仍触发，导致不完整内容被自动转发 | YiVad（aiChat）、YiPet（Chat） |
| [04-YiPet-jsxDEV生产模式](./gotchas/04-陷阱-YiPet-jsxDEV生产模式.md) | YiPet 聊天窗口在开发模式下报 `jsxDEV is not a function` 错误 | YiPet 聊天窗口（Chat bundle） |

## 学习路径

| 文件 | 描述 |
|---|---|
| [01-学习PM框架](./01-经验-学习PM框架.md) | 产品管理框架学习路径（Kano、MoSCoW、RICE/ICE、JTBD、OKR） |

## 归档原则

每条经验教训进入此目录时必须满足以下标准：

1. **无责复盘格式**：失败复盘使用 blameless postmortem 写法——描述事实而非指责，关注系统性改进而非个人失误
2. **量化影响**：记录影响范围（受影响的项目/模块/用户）和严重程度（高/中/低），让读者能快速判断是否与自己相关
3. **可追溯**：每条经验必须能追溯到具体的事件或证据——日期、git commit、文件路径、配置变更
4. **改进措施有负责人和截止日期**：预防措施需要明确谁来执行、何时完成
5. **24 小时内记录**：陷阱和失败应在解决问题后 24 小时内添加，趁记忆还新鲜

## 交叉引用

- [../../run/check-engineering-gotchas.md](../../run/check-engineering-gotchas.md) — 工程陷阱检查清单（实施前自查）
- [../../run/review-lessons.md](../../run/review-lessons.md) — 复盘与经验教训审查流程
- [../../../leader/risk/write-a-postmortem.md](../../../leader/risk/write-a-postmortem.md) — 事故复盘方法论
- [../../../srer/incident-response/respond-to-an-incident.md](../../../srer/incident-response/respond-to-an-incident.md) — 事件响应流程
- [../../../projects/yivad/bugs/](../../../projects/yivad/bugs/) — YiVad Bug 跟踪
- [../../../projects/yiai/bugs/](../../../projects/yiai/bugs/) — YiAi Bug 跟踪