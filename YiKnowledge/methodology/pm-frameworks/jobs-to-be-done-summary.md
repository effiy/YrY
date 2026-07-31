---
title: Jobs-to-Be-Done（JTBD）
tags: [PM, 框架, 用户研究, JTBD]
category: methodology/pm-frameworks
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Jobs-to-Be-Done（JTBD）

## 1. 框架来源与作者

Tony Ulwick（Strategyn，90 年代末）提出 Outcome-Driven Innovation，Clayton Christensen 在《创新者的窘境》与《与运气竞争》中推广为"Job to be done"。核心命题：**用户不是购买产品，是雇佣产品来完成某个任务**。

## 2. 核心概念

| 概念 | 含义 |
|---|---|
| Job | 用户想要完成的任务（功能性 + 情感性 + 社会性） |
| Main Job | 主要任务（"把墙上的洞挂上"） |
| Related Job | 相关任务（"装饰房间"） |
| Job Statement | "When ___ , I want to ___ , so I can ___" |
| Outcome | 完成任务后期望达到的结果，可量化（" minimize time to find a doc"） |
| Forces of Progress | 推力（现状不满）、拉力（新方案吸引）、焦虑、习惯 |
| Competition | 不是同类产品，而是所有能完成同一 Job 的方案 |

经典例子：用户买电钻不是要电钻，是要墙上的洞；再上一层，是要挂画，要装饰房间。

## 3. Job Statement 模板

```
When [situation],
I want to [action],
So I can [expected outcome].
```

例：

> When I receive a customer after-sales request in a non-English market,
> I want to draft a BRD in their language within 10 minutes,
> So I can respond to the customer before they escalate.

## 4. 实施步骤

1. **找用户**：访谈 15-30 个目标用户
2. **抓 Job**：问"你在什么时候用这个产品？为什么用？不用会怎样？"
3. **分主次**：区分 main job 与 related job；分 functional / emotional / social
4. **列 Outcome**：每 Job 列 15-50 个 outcome，每个用「minimize / maximize + metric」格式
5. **机会排序**：调研每个 outcome 的重要度 + 满意度，计算 Opportunity Score = 重要度 + max(重要度 − 满意度, 0)
6. **产品对齐**：把高分 outcome 落到具体需求

## 5. 输入 / 输出工件

- 输入：用户访谈记录、现有功能使用数据、客诉
- 输出：Job map、Outcome list、Opportunity score 表

## 6. 适用场景与边界

**适用**：

- 找产品定位与差异化
- 探索新市场（不是改进现有功能）
- 重新审视流失原因（用户为何转用替代方案）

**不适用**：

- 短期功能优先级排序（用 RICE 更直接）
- 已有 PMF 产品的细节优化（功能反馈足够）

## 7. 与其他框架对比

| 框架 | 视角 | 适合 |
|---|---|---|
| Persona | 用户是谁 | 市场进入与传播 |
| JTBD | 用户要完成什么 | 产品定位与创新 |
| User Story | 功能实现 | 开发任务拆解 |
| Story Map | 用户体验流 | 功能串接 |

Persona 与 JTBD 不互斥，但 JTBD 更贴近「为何使用」而非「是谁使用」。

## 8. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| Job 描述成功能 | "我想要 BRD 生成器" | 改成"When X, I want to Y, so Z" |
| 忽略情感与社会 Job | 只看功能性，遗漏体验 | 三个维度都列 |
| Outcome 不可量化 | "要好用" | "minimize time to find feature" |
| 样本不足 | 访谈 3 人就定 Job | ≥15 人，覆盖不同细分 |
| 不更新 | 三年前的 Job 还在用 | 半年复审 |

## 9. 本团队落地案例

- YiAi BRD 智能体的 Job：When 海外业务收到售后诉求 → 想要在 10 分钟内生成多语言 BRD → 以便在客户升级前给出明确方案
- 关键 Outcome：minimize time-to-first-draft、minimize translation drift、minimize manual chapter rework

## 10. 参考资料

- Christensen 等 — *Competing Against Luck*（2016）
- Tony Ulwick — *Jobs-to-Be-Done: From Theory to Practice*
- Bob Moesta — *Demand-Side Sales*
