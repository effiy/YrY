---
title: 工程效能指标模板（DORA + 扩展）
tags: [模板, DORA, 工程效能, 指标, Lead Time, MTTR, 变更失败率]
category: work/processes
created: 2026-07-30
updated: 2026-07-30
source: internal
type: template
status: stable
---

# 工程效能指标模板（DORA + 扩展）

> 使用方法：每双周由 PMO/DevOps 填报一次，配套 qb-row「Engineering productivity metrics」一键 prompt：lead time, change failure rate, MTTR, and per-capita throughput trends with attribution。聚焦 DORA 四指标 + 人均吞吐，按团队/系统维度归因。复制到 `work/processes/{双周}-dora-metrics.md`。

## 1. 基本信息

| 字段 | 内容 |
|------|------|
| 报告周期 | （示例：2026 W29，2026-07-14 ~ 2026-07-27） |
| 团队 | （示例：YiVad 前端组、YiAi 后端组、YiPet 组） |
| 报告人 | （示例：PMO 张三） |
| 数据来源 | Git 平台 + CI/CD + 监控 + 工单 |
| 上报日期 | （示例：2026-07-29） |
| 阅读者 | CTO、各组组长、产品负责人 |

## 2. DORA 四指标（核心）

| 指标 | 定义 | 本周期 | 上周期 | 趋势 | 行业基准 |
|---|---|---|---|---|---|
| Deployment Frequency | 部署次数 / 周 | 8 | 5 | ↑ | Elite: > 14 |
| Lead Time for Changes | PR 提交到合并中位数（h） | 14 | 22 | ↓ | Elite: < 1 |
| Change Failure Rate | 失败部署 / 总部署 | 12% | 18% | ↓ | Elite: < 15% |
| MTTR | 平均恢复时长（h） | 1.2 | 2.5 | ↓ | Elite: < 1 |

> Elite / High / Medium / Low 四档参照 DORA benchmark。

## 3. 指标归因（按团队）

| 团队 | 部署频率 | Lead Time | CFR | MTTR | 主要瓶颈 |
|---|---|---|---|---|---|
| YiVad 前端 | 12/周 | 8h | 8% | 0.5h | — |
| YiAi 后端 | 4/周 | 28h | 22% | 3h | 评审排队 |
| YiPet | 2/周 | 36h | 15% | 1.5h | 跨端联调 |

## 4. 人均吞吐

| 团队 | 人数 | 合并 PR 数 | PR / 人 / 周 | 代码行 / 人 / 周 | 故障单 / 人 / 周 |
|---|---|---|---|---|---|
| YiVad 前端 | 6 | 28 | 2.33 | 320 | 0.5 |
| YiAi 后端 | 4 | 12 | 1.5 | 280 | 1.2 |
| YiPet | 3 | 6 | 1.0 | 180 | 0.8 |

## 5. 关键趋势图（描述）

- 部署频率：近 4 周滚动 ↑ 趋势，YiVad 已进入 Elite
- Lead Time：YiAi 后端持续 > 24h，触发预警
- CFR：整体下降，YiAi 后端偶发上线回滚
- MTTR：受监控告警优化影响，整体下降

## 6. 异常与高亮项

| 类型 | 描述 | 影响 | 后续 |
|---|---|---|---|
| ⚠️ 异常 | YiAi 后端 CFR 22% | 上线质量 | 本周做 PR 模板收紧 |
| ✅ 高亮 | YiVad Lead Time 进入 Elite | 团队节奏 | 经验沉淀到流程 |

## 7. 归因分析（5 Why 示例）

例：YiAi 后端 Lead Time 28h
1. Why：评审排队
2. Why：评审人集中在 2 人
3. Why：核心模块知识不外溢
4. Why：缺交叉评审机制
5. Why：未把交叉评审写入 Definition of Done

→ 行动：本周期内将「至少 2 名评审人」加入 DoD。

## 8. 行动项

| 编号 | 行动项 | 责任人 | 截止日期 | 状态 |
|---|---|---|---|---|
| 1 | YiAi 后端 PR DoD 加入交叉评审 | 后端组长 | 2026-08-05 | 待办 |
| 2 | YiPet CI 缓存优化降 Lead Time | DevOps | 2026-08-10 | 待办 |
| 3 | 告警收敛降低 MTTR 抖动 | 运维 | 2026-08-15 | 待办 |

## 9. 数据说明与口径

- Lead Time 仅统计已合并 PR；废弃 PR 不计入分母。
- CFR 失败定义：上线后 24h 内触发回滚或紧急修复。
- MTTR 起止：告警触发 → 全量恢复。
- 人均吞吐：合并 PR 数 / 在岗人数（不含请假）。

## 10. 下周期目标

| 指标 | 本周期 | 下周期目标 |
|---|---|---|
| 部署频率 | 8/周 | ≥ 10/周 |
| Lead Time | 14h | ≤ 12h |
| CFR | 12% | < 10% |
| MTTR | 1.2h | < 1h |
