---
title: LLM 可观测平台对比（LangSmith / Langfuse / Helicone）
tags: [AI 平台, 可观测, LLMops, 对比]
category: tech/ai-platform
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# LLM 可观测平台对比（LangSmith / Langfuse / Helicone）

## 1. 解决的问题

传统 APM（Datadog / New Relic）只看到延迟与状态码，看不到 LLM 应用的内部：prompt、补全、token 用量、工具调用、检索召回质量、链路 trace。LLM 可观测平台补足这层，主要做四件事：

1. **Trace 链路**：每个请求拆成 prompt → retrieval → tool calls → LLM → output，可视化每一步
2. **质量评估**：跑评测集、对比 prompt / 模型版本的质量差异
3. **成本归因**：token 用量按用户 / 应用 / 场景归集
4. **安全监控**：PII 泄露、prompt injection、敏感内容告警

## 2. 维度对比

| 维度 | LangSmith | Langfuse | Helicone |
|---|---|---|---|
| 出品方 | LangChain Inc. | 开源（YC W23） | 开源 + SaaS |
| 部署 | SaaS only（有自部署企业版） | 自部署（AGPL）或 SaaS | 自部署（AGPL）或 SaaS |
| 集成 | LangChain 原生，其他需 SDK | 框架无关，OpenAI 兼容层 + SDK | 反向代理 OpenAI API，零侵入 |
| Trace 模型 | run tree（嵌套 run） | observation tree（类似） | request + parent request |
| 评估 | Dataset + evaluator + 在线 AB | Dataset + evaluator | 较弱（偏监控） |
| 成本分析 | 按 token / 模型单价 | 同左 | 强项，按用户 / 路径归集 |
| 提示词管理 | Prompt Hub | Prompt management | 一般 |
| 告警 | 简单 | 自定义规则 | 强项 |
| 主要用户 | LangChain 用户 | 多框架团队 | OpenAI 重度用户 |

## 3. 选型决策树

```
是否大量使用 LangChain？
├─ 是 → LangSmith（原生 trace 最深，零接入）
└─ 否 → 框架是否多样化 / 自研栈？
        ├─ 是 → Langfuse（框架无关，自部署可控）
        └─ 否 → 主要是 OpenAI API 调用，关心成本与告警？
                 ├─ 是 → Helicone（反向代理零侵入）
                 └─ 否 → Langfuse（默认）
```

## 4. 关键能力对比

| 能力 | LangSmith | Langfuse | Helicone |
|---|---|---|---|
| Trace 自动埋点 | LangChain 内置 | SDK + OpenAI 兼容 | 反向代理（自动） |
| 多模型支持 | 好 | 好 | 好 |
| 在线 AB 测试 | 强 | 强 | 一般 |
| 评测数据集管理 | 强 | 强 | 弱 |
| Prompt 版本管理 | Hub + 仓库 | 强 | 一般 |
| 用户级 trace 串联 | user_id 关联 | user_id 关联 | user_id 关联 |
| 自部署 | 企业版 | 开源 AGPL | 开源 AGPL |
| 数据隐私 | SaaS 数据出境 | 自部署数据自留 | 自部署数据自留 |

## 5. 部署与运维要点

1. **生产环境 trace 采样**：100% trace 写入压力大，建议按比例（1-5%）+ 异常 100%（错误、长延迟、敏感词命中）
2. **PII 脱敏**：trace 落库前过滤 phone / email / id card；Langfuse 支持 pipeline 预处理
3. **prompt 与 trace 关联**：每次 prompt 变更留版本，trace 标注 prompt 版本，便于回溯质量差异
4. **成本归因维度**：按 user_id + app_id + scene 三段，能下钻到「哪个应用的哪类调用最贵」
5. **告警阈值**：错误率 > 1%、p99 > 2x baseline、token 异常增长 > 30% / day
6. **评测集成**：把生产 trace 抽样入库做评测集，每周自动跑，回归质量

## 6. 本团队落地情况

- 选 Langfuse 自部署（数据不出境、框架无关、YiAi/YiVad 都能接）
- 接入 OpenAI 兼容层 + 自研 Agent，trace 覆盖 retrieval / tool / LLM 全链路
- 监控指标：错误率、p99 延迟、token 消耗、prompt 版本质量回归

## 7. 参考资料

- LangSmith: https://docs.smith.langchain.com
- Langfuse: https://langfuse.com
- Helicone: https://www.helicone.ai
