---
title: 架构决策记录（ADR）摘要
tags: [ADR, 架构, 决策, 摘要]
category: resources/templates
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 架构决策记录（ADR）摘要

> 本摘要解释 ADR 是什么、何时用、如何写出有用的 ADR；空白可填表单见 [adr-template.md](./adr-template.md)。

## 1. 是什么

ADR（Architecture Decision Record）：一段简短文档，记录架构决策的"为什么"。由 Michael Nygard（2011）推广，ThoughtWorks 系公司广泛采用。

典型字段：

- 背景（为何要决定）
- 决定（具体选了什么）
- 候选方案与权衡
- 假设与约束
- 风险与回滚
- 复审时间

## 2. 为什么用

没有 ADR 的代码库特征：

- 半年后没人记得"为什么用 Redis 而不是 Memcached"
- 新成员质疑架构选择，重新讨论一遍
- 同样的争论反复出现，结论漂移
- 替换技术时不知有哪些假设要重验

ADR 把"为什么"从口耳相传变成可追溯的资产。是 *Strong Opinions, Loosely Held* 的工程化实现：决策有理由、可证伪、可更新。

## 3. 何时写

| 场景 | 写 ADR？ |
|---|---|
| 引入新框架 / 中间件 | 是 |
| 重大架构调整（拆服务、合并） | 是 |
| 数据迁移策略 | 是 |
| 关键 API 设计决议 | 是 |
| 小重构、命名规范 | 否（PR 描述足够） |
| 日常 bugfix | 否 |

## 4. 如何写好

### 写什么

- **背景**：一段话，说清问题与约束
- **决定**：一句话，明确选了什么
- **候选**：2-4 个，每个列优缺点
- **权衡**：选这个放弃了什么
- **风险**：可能出什么问题
- **回滚**：若失败如何恢复
- **复审**：何时 / 在什么信号下复审

### 不写什么

- 不要长篇技术原理介绍（链接外部文档）
- 不要把候选方案列成长篇（每方案 3-5 行）
- 不要省略风险（风险才是 ADR 的核心价值之一）
- 不要把决定写得模糊（"采用 Redis 之类" → "采用 Redis 7.2，单实例 + 哨兵"）

## 5. ADR 生命周期

```
Draft（草稿）→ Proposed（提议）→ Accepted（接受）
                                      ↓
                                  Deprecated（废弃，被新 ADR 替代）
                                  或
                                  Superseded（被新 ADR 取代）
```

**重要**：被替代的 ADR 不删除，保留并标注 `Status: Superseded by ADR-N+1`。可追溯性是 ADR 的核心价值。

## 6. 何时复审

每 ADR 必填复审条件：

- 时间触发：6 个月 / 12 个月后复审
- 信号触发：某个假设被验证为错、某个约束变化、某个风险实现

复审不是推翻，是更新与归档。

## 7. 与代码 / PR 关系

- ADR 写在前，PR 实现在后
- PR 描述引用 ADR 编号
- 重大架构 PR 没 ADR 不合并

## 8. 文件组织

- 推荐：`docs/adr/0001-xxx.md`、`0002-xxx.md`，编号自增
- 不要按主题分类——编号顺序就是历史
- 在 README 列索引，便于检索

## 9. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 只写决定不写为什么 | 半年后不知为何选 | 强制写背景与候选 |
| 候选方案没列 | 看不出权衡 | 至少 2 个候选 |
| 风险省略 | "似乎没风险" | 每条必有风险 + 回滚 |
| 被替代后删除 | 历史丢失 | 改状态而非删除 |
| 写完不再看 | 复审条件没设 | 必填复审时间 / 信号 |
| 一份 ADR 30 页 | 失焦 | 控制在 2-3 页内 |

## 10. 与其他文档关系

- **PRD**：业务需求，决策源于 PRD
- **Tech Design**：技术方案，比 ADR 详细
- **ADR**：单点决策与理由，简洁可追溯

ADR 是 Tech Design 的"摘要版"，PR 是 ADR 的"实现版"。

## 11. 落地要点

- 团队约定 ADR 文件位置与编号规则
- PR 模板要求填"相关 ADR"字段
- 季度复审 ADR 状态，更新过期
- 新成员 onboarding 时读 ADR 列表

## 12. 关联

- 模板：[adr-template.md](./adr-template.md)
- 思维模型：[strong-opinions-loosely-held-summary.md](../../methodology/thinking/strong-opinions-loosely-held-summary.md)
- 流程：[tech-review-process.md](../../work/processes/tech-review-process.md)
