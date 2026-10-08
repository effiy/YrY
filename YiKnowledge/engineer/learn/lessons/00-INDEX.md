---
title: lessons/ MOC
aliases: [lessons-moc, lessons-index, lessons-learned]
tags: [MOC, lessons, retrospective, wins, failures, gotchas, bugs]
category: engineer/learn/lessons
created: 2026-08-03
updated: 2026-09-24
last_verified: 2026-09-24
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

## 分类概览

| 类别 | 序号 | 描述 |
|---|---|---|
| 经验 | 01 | 学习方法论与框架知识 |
| 教训 | 02-03 | 失败复盘与事故分析——使用无责复盘（blameless postmortem）格式 |
| 陷阱 | 05-08, 12-14 | 工程陷阱与注意事项——非直觉的行为和配置问题 |
| 成果 | 09-11, 15 | 成功案例与可复用模式——有效的架构选择、设计决策、工程实践 |

## 经验（Experience）

| 文件 | 描述 | 核心启示 |
|---|---|---|
| [01-学习PM框架](./001-经验-学习PM框架.md) | 产品管理框架学习路径（Kano、MoSCoW、RICE/ICE、JTBD、OKR） | — |

## 失败复盘（Failures）

| 文件 | 描述 | 核心教训 |
|---|---|---|
| [02-YiVad-AICR端口幻觉](./002-教训-YiVad-AICR端口幻觉.md) | AI 助手声称完成了 AICR 页面的端到端移植（9 个 Store、8 个 Modal），但 master 上实际不存在任何代码 | 永不基于 AI 的对话总结更新 CLAUDE.md；信任但验证：`git log`、`ls`、`git diff` 是唯一的真相来源 |
| [03-无锁文件供应链](./003-教训-无锁文件供应链.md) | 未提交 lockfile 导致不同机器安装不同版本依赖，构建不可重现——CI 成功但生产失败 | 始终提交 lockfile；CI 中使用 `npm ci` 而非 `npm install` |

## 陷阱记录（Gotchas）

| 文件 | 描述 | 影响范围 |
|---|---|---|
| [05-macOS-FSEvents静默丢弃](./005-陷阱-macOS-FSEvents静默丢弃.md) | macOS FSEvents 在此机器上静默丢弃文件变更事件 | YiAi 知识库监听器（已用 polling 替代） |
| [06-RPC参数名不匹配](./006-陷阱-RPC参数名不匹配.md) | RPC 参数名不匹配导致后端静默忽略——`filter` vs `query`、`target_file` vs `path` | YiVad、YiPet、YiAi（跨项目） |
| [07-SSE-onDone守卫](./007-陷阱-SSE-onDone守卫.md) | SSE 流的 `onDone` 回调在用户中止后仍触发，导致不完整内容被自动转发 | YiVad（aiChat）、YiPet（Chat） |
| [08-YiPet-jsxDEV生产模式](./008-陷阱-YiPet-jsxDEV生产模式.md) | YiPet 聊天窗口在开发模式下报 `jsxDEV is not a function` 错误 | YiPet 聊天窗口（Chat bundle） |
| [12-静默吞错误](./012-陷阱-静默吞错误.md) | `.catch(() => {})` 空 catch 块吞掉所有异常，运行时错误完全不可见 | YiVad、YiPet（跨项目） |
| [13-print替代logging](./013-陷阱-print替代logging.md) | 后端 `src/shared/` 库代码使用 `print()` 而非 `logging` 模块，日志不可路由、不可分级 | YiAi |
| [14-frontmatter闭合格式错误](./014-陷阱-frontmatter闭合格式错误.md) | YAML frontmatter 闭合 `---` 缺少换行符，导致解析失败和 RAG 元数据丢失 | YiKnowledge |

## 成功案例（Wins）

| 文件 | 描述 | 核心启示 |
|---|---|---|
| [09-YiPet跨项目Hub](./009-成果-YiPet跨项目Hub.md) | YiPet 在一个 Sprint 内成为跨项目集成中心 | 浏览器扩展作为观察者模式具有独特的架构优势 |
| [10-RPC统一信封](./010-成果-RPC统一信封.md) | RPC 统一信封是 YrY 中回报率最高的架构决策——一个端点服务三个项目 | 统一性优于灵活性：1 种调用模式 > 2 种调用模式 |
| [11-测试基础设施](./011-成果-测试基础设施.md) | YiAi 从零测试到 76+ 测试、shared/ 92% 覆盖率 | 从纯函数开始——它们最容易测试、运行最快、最稳定 |
| [15-跨项目代码健康审计](./015-成果-跨项目代码健康审计.md) | 7 轮扫描修复 63 个功能坏味道，跨 5 项目 4 语言，含自动化检测清单 | 系统性审计优于零散修复；空 catch 是最隐蔽的 bug 模式 |

## 归档原则

每条经验教训进入此目录时必须满足以下标准：

1. **无责复盘格式**：失败复盘使用 blameless postmortem 写法——描述事实而非指责，关注系统性改进而非个人失误
2. **量化影响**：记录影响范围（受影响的项目/模块/用户）和严重程度（高/中/低），让读者能快速判断是否与自己相关
3. **可追溯**：每条经验必须能追溯到具体的事件或证据——日期、git commit、文件路径、配置变更
4. **改进措施有负责人和截止日期**：预防措施需要明确谁来执行、何时完成
5. **24 小时内记录**：陷阱和失败应在解决问题后 24 小时内添加，趁记忆还新鲜

## 交叉引用

- [../../run/0008-运行-CodeReview指南.md](../../run/008-运行-CodeReview指南.md) — Code Review 清单和 RPC 契约验证步骤
- [../../ship/0007-交付-CICD流水线.md](../../ship/007-交付-CICD流水线.md) — CI/CD 质量门禁配置
- [../../../leader/risk/write-a-postmortem.md](../../../leader/risk/write-a-postmortem.md) — 事故复盘方法论
- [../../../sre/incident-response/respond-to-an-incident.md](../../../sre/incident-response/respond-to-an-incident.md) — 事件响应流程
- [../../../projects/yivad/bugs/](../../../projects/yivad/bugs/) — YiVad Bug 跟踪
- [../../../projects/yiai/bugs/](../../../projects/yiai/bugs/) — YiAi Bug 跟踪