---
title: HEART / AARRR 指标框架
tags: [PM, 框架, 指标, 体验, 增长]
category: methodology/pm-frameworks
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# HEART / AARRR 指标框架

## 1. 框架来源

- **HEART**：Google's Kerry Rodden + Philip Hodgson（2011），UX 设计导向，专注单功能/单产品的体验度量。
- **AARRR**：Dave McClure（2007，500 Startups），海盗指标（Pirate Metrics），漏斗导向的增长指标。

两者视角不同但互补：HEART 问"这个功能好不好用"，AARRR 问"产品整体是否增长"。

## 2. HEART 五维

| 维度 | 含义 | 典型指标 |
|---|---|---|
| Happiness | 用户满意度 | NPS、CSAT、评分 |
| Engagement | 活跃深度 | 日活、周活、人均使用次数、人均会话时长 |
| Adoption | 新功能被采用率 | 新功能使用用户数 / 总用户 |
| Retention | 留存率 | D7 / D30 / W4 留存 |
| Task Success | 任务完成度 | 任务完成率、平均步骤、错误率 |

每个功能选 1-2 个维度作为目标，不必全用。

## 3. AARRR 漏斗

```
Acquisition（获取）→ Activation（激活）→ Retention（留存）→ Referral（推荐）→ Revenue（变现）
```

| 阶段 | 典型指标 |
|---|---|
| Acquisition | 访问量、注册转化率、获客成本（CAC） |
| Activation | 完成关键动作的比例（首次 Aha! moment） |
| Retention | D7/D30/W4 留存 |
| Referral | 邀请数、K 因子 |
| Revenue | ARPU、LTV、付费转化率 |

Dave McClure 强调：**不要平均用力，找最弱的一环优化**。

## 4. 实施步骤

### HEART

1. 选目标功能（不要"全产品"）
2. 列每维度候选指标
3. 选 1-2 个关键作为信号
4. 定义"目标-方法-信号-指标"四件套
5. AB 跑数据

### AARRR

1. 画当前漏斗，标各环节转化率
2. 找最弱环节（占比最低那一段）
3. 设改善目标（30 天提升 X%）
4. 做改善实验（AB / 新功能 / 文案）
5. 复盘后再画漏斗

## 5. 输入 / 输出工件

- 输入：埋点数据、用户反馈、问卷
- 输出：
  - HEART：指标定义表 + 当前值 + 改善目标
  - AARRR：漏斗图 + 各环节转化率 + 优先优化环节

## 6. 适用场景与边界

**HEART 适合**：

- 单功能优化、AB 评估
- 体验类产品（SaaS、C 端）

**AARRR 适合**：

- 整体产品增长诊断
- 增长黑客实验

**不适用**：

- 内部工具（无 Acquisition / Referral）
- 早期产品（数据样本不足）

## 7. 与其他框架对比

| 框架 | 视角 | 适合 |
|---|---|---|
| HEART | 体验与功能 | 单功能优化 |
| AARRR | 增长漏斗 | 全产品增长 |
| North Star | 单一聚焦指标 | 全公司对齐 |
| HEART + AARRR | 体验 + 增长 | 完整产品度量 |

## 8. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| HEAR 五维全用 | 指标太多失焦 | 选 1-2 个关键 |
| AARRR 平均用力 | 各环节都改改 | 先攻最弱一环 |
| 依赖单一指标 | "我们看 DAU" | 配合多维度交叉 |
| 指标无目标 | 有数没目标 | 每指标设 baseline + target |
| 不分群 | 整体留存好看 | 按新 / 老 / 付费分群 |
| 忽略 LTV / CAC 比 | 增长亏钱 | LTV / CAC > 3 才健康 |

## 9. AI 产品专用扩展

| HEART 维度 | AI 产品指标 |
|---|---|
| Happiness | 用户重生成率、赞踩比 |
| Engagement | 人均会话数、人均 token 数 |
| Adoption | 新功能使用率（如 Agent 上线后采纳率） |
| Retention | D7 留存、付费续费率 |
| Task Success | 任务完成率、faithfulness、工具调用成功率 |

| AARRR 阶段 | AI 产品指标 |
|---|---|
| Acquisition | 试用注册率、试用转付费率 |
| Activation | 首次成功完成任务率 |
| Retention | 周活跃率、人均会话数 |
| Referral | 邀请成功数 |
| Revenue | 单用户 token 成本 vs 订阅价 |

## 10. 本团队落地案例

- YiVad：HEART 关注 Engagement（人均会话）+ Task Success（任务完成率），AARRR 关键 Activation（首次 BRD 生成成功率）+ Retention（W4 留存）
- 北极星指标见 `product/metrics/north-star-metric-summary.md`

## 11. 参考资料

- Rodden, K. (2011) — *Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Apps*（HEART）
- Dave McClure — *Startup Metrics for Pirates*（AARRR）
