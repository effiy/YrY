---
title: RICE / ICE 优先级框架
tags: [PM, 框架, 优先级, 决策]
category: methodology/pm-frameworks
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# RICE / ICE 优先级框架

## 1. 框架来源

RICE 由 Intercom 团队（2014）提出，用于在多个候选需求中做相对排序。ICE 是更早的轻量版本（Sean Ellis）。两者都是「打分排序」，不是「精确预测」。

## 2. 核心概念

### RICE = Reach × Impact × Confidence / Effort

| 维度 | 含义 | 单位 |
|---|---|---|
| Reach | 多少人/客户会被影响 | 人数 / 季度 |
| Impact | 每个被影响的人带来多少价值 | 1（低）-3（中）-5（高） |
| Confidence | 自己对以上估算的信心 | 50% / 80% / 100% |
| Effort | 完成所需工作量 | 人月或点数 |

最终分数 = `(R × I × C) / E`，分越高越优先。

### ICE = Impact × Confidence × Ease

更轻量，去掉 Reach，Ease 是 Effort 的倒数。适合早期探索，数据不全。

## 3. 实施步骤

1. **列候选清单**：把所有可做项列出，避免遗漏
2. **统一估算口径**：Reach 用同一时间窗（季度），Effort 用同一单位（人周）
3. **团队打分**：关键成员各自打分，再讨论分歧
4. **算分排序**：算 RICE 分，按分降序
5. **审视边界 case**：分数接近的项目，看 Confidence；低置信度高分的要 spike 验证
6. **定 top-N**：取前 N 项进入迭代规划

## 4. 输入 / 输出工件

- 输入：需求池、用户反馈、业务目标、人力预算
- 输出：打分表（一张 spreadsheet）+ 排序清单 + 入选/落选理由

## 5. 适用场景与边界

**适用**：

- 候选需求多（>10）、资源不够全做
- 价值维度多元（用户量、影响深度、成本）
- 团队对优先级有分歧，需要结构化讨论

**不适用**：

- 强外部约束的项目（合规、合同、关键客户承诺）
- 探索期需求，没有足够数据估 Reach 与 Impact
- 战略性 must-do（无论分多低都必做）

## 6. 与其他框架对比

| 框架 | 维度 | 适合 |
|---|---|---|
| RICE | Reach + Impact + Confidence + Effort | 量化数据充足 |
| ICE | Impact + Confidence + Ease | 早期、数据不足 |
| MoSCoW | Must / Should / Could / Won't | 强约束项目 |
| Kano | 基本 / 性能 / 兴奋 | 体验导向 |
| Cost-Value | 二维象限 | 候选 ≤ 8 |

## 7. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 全部 100% Confidence | 分数失真，无优先级 | 强制低置信度项 < 80% |
| 估 Effort 偏低 | 实际超工期 | 历史数据校准，乘 1.5 buffer |
| 一次打分定终身 | 后续变化未重算 | 每迭代开始重打分 |
| 严格按分排序 | 战略性需求被淘汰 | 人工覆盖权 + 留记理由 |
| Reach 估不准 | 季度后被验证差 | 用历史数据 + 用户量基线 |

## 8. 本团队落地案例

- YiVad 迭代规划用 RICE 做季度排序，前 5 进入当季
- 低置信度项先做 spike（1 周验证），再决定是否进入规划
- 暂不采用：MoSCoW（候选需求 < 10 时直接拍）

## 9. 参考资料

- Intercom — *A simple model for product prioritization*（RICE 出处）
- Sean Ellis — *ICE score*（增长黑客早期方法论）
