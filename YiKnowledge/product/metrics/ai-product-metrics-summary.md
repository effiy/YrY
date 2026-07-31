---
title: AI 产品专用指标
tags: [指标, AI, 监控, 产品]
category: product/metrics
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# AI 产品专用指标

## 1. 指标定义

AI 产品与普通软件不同：输出是概率性、不可预测、可编造、有成本。指标体系需要补三层：

1. **质量层**：答案对不对、是否幻觉
2. **成本层**：token 消耗、单任务成本
3. **体验层**：用户感知、可用性

## 2. 质量层指标

| 指标 | 公式 / 口径 | 说明 |
|---|---|---|
| Hallucination rate | 含幻觉的回答 / 总回答 | 监控事实幻觉 |
| Faithfulness | 答案可由 context 推导的比例 | RAG 关键 |
| Answer relevance | 答案是否回应了 query | 答非所问 |
| Citation accuracy | 引用正确的比例 | 可溯源 |
| Tool selection accuracy | 选对工具的比例 | Agent |
| Tool argument accuracy | 参数正确率 | Agent |
| Task success rate | 完成任务的比例 | 端到端 |
| Refusal accuracy | 应拒答时拒答的比例 | 安全 |
| False refusal | 不该拒答时拒答的比例 | 体验 |

### 采集方法

- 自动评测：LLM-as-judge 跑全集，每日 / 每变更跑
- 人工标注：抽样 50-100 条，每周一次
- 在线反馈：赞踩按钮、重生成率
- 在线监控：引用一致、置信度分布、敏感词命中

## 3. 成本层指标

| 指标 | 公式 | 说明 |
|---|---|---|
| Token cost per task | 总 token 成本 / 任务数 | 单任务经济 |
| Input / output token ratio | 输入 / 输出 token | 反映 prompt 设计 |
| Cache hit rate | 命中率 | prefix cache |
| First-token latency (TTFT) | 首字节延迟 | 体验关键 |
| Per-output-token latency (TPOT) | 每 token 时延 | 体验 |
| Throughput | tokens/s/GPU | 利用率 |
| GPU utilization | 实际占用 | 部署优化 |

## 4. 体验层指标

| 指标 | 公式 | 说明 |
|---|---|---|
| Acceptance rate | 用户接受回答的比例 | 直接采纳 |
| Regeneration rate | 重生成比例 | 不满意信号 |
| Edit rate | 用户改回答比例 | 不满意 |
| Copy rate | 用户复制答案比例 | 满意信号 |
| First-success rate | 首次成功完成比例 | Activation |
| Sessions per user | 人均会话数 | Engagement |
| D7 / W4 retention | 7 日 / 4 周留存 | 长期价值 |

## 5. 安全层指标（护栏）

| 指标 | 阈值 |
|---|---|
| PII 泄露率 | 0（红线） |
| Prompt injection 命中率 | 0（红线） |
| 敏感词触发率 | < 0.1% |
| 模型输出拒绝率 | < 2%（避免过度拒答） |
| 安全审计通过率 | 100% |

## 6. 度量分层

| 层级 | 指标 | 决策场景 |
|---|---|---|
| 任务级 | success rate、faithfulness | 上线决策 |
| 体验级 | acceptance、regeneration、retention | 推广决策 |
| 成本级 | token cost / task、throughput | 商业可行性 |
| 安全级 | PII / injection | 合规红线 |

## 7. 采集方式

| 方式 | 适合 | 频率 |
|---|---|---|
| 自动评测 | 全量 trace + LLM-as-judge | 每日 |
| 人工标注 | 抽样 50-100 | 每周 |
| 在线埋点 | 用户行为 | 实时 |
| 问卷 | NPS、CSAT | 季度 |
| 红队 | 注入样本集 | 每季度 |
| 监控告警 | 异常率、延迟 | 实时 |

## 8. 健康阈值

| 指标 | 绿 | 黄 | 红 |
|---|---|---|---|
| Faithfulness | ≥ 95% | 85-95% | < 85% |
| Hallucination rate | ≤ 5% | 5-10% | > 10% |
| Regeneration rate | ≤ 10% | 10-20% | > 20% |
| TTFT | < 2s | 2-5s | > 5s |
| TPOT | < 50ms | 50-100ms | > 100ms |
| Cache hit rate | > 50% | 30-50% | < 30% |
| Token cost / task | < 预算 | 预算-1.5x | > 1.5x 预算 |

## 9. 异常处置流程

1. 告警 → 数据校验
2. 分群拆解（用户 / 场景 / 语言 / 模型版本）
3. 归因（模型变更、prompt 变更、数据问题、上游异常）
4. 决策（修复、回滚、调整阈值、扩大监控）
5. 验证

## 10. 关联指标

- **北极星**：人均成功任务数（AI 产品的核心价值指标）
- **护栏**：幻觉率、PII 泄露率、token 成本
- **领先指标**：first-success rate（预示 retention）
- **滞后指标**：retention、LTV

## 11. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 只看 DAU | AI 用得多不代表用得对 | 加任务成功率 |
| 不分场景 | 整体幻觉率好看 | 按场景拆 |
| 不算成本 | 增长好看但亏本 | 必加 token cost |
| 自动评测不校准 | LLM-as-judge 偏差 | 抽样人工验证 |
| 无护栏 | 北极星涨但安全崩 | 必加护栏 |

## 12. 本团队落地案例

- YiAi BRD：faithfulness ≥ 95%、hallucination ≤ 5%、token cost / BRD < 预算
- YiVad 对话：acceptance rate、regeneration rate、TTFT < 2s
- 监控：实时仪表盘 + 每日抽检 50 条

## 13. 参考资料

- RAGAS: https://docs.ragas.io
- HELM: https://crfm.stanford.edu/helm
- Lenny Rachitsky — *AI Product Metrics*
