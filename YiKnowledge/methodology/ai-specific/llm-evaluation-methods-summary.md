---
title: LLM 评估方法（HELM / MT-Bench / 自洽性 / 人工标注）
tags: [AI, 方法论, 评估, LLM]
category: methodology/ai-specific
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# LLM 评估方法

## 1. 为什么评估难

LLM 输出是自然语言，没有确定 ground truth；同一问可有多种正确答案；评估指标（BLEU / ROUGE）与人类偏好相关性弱；任务多样（QA、摘要、代码、推理、安全）需要不同维度。

评估分两层：

1. **模型本身能力**（benchmark）：HELM、MMLU、MT-Bench、Arena
2. **应用质量**（业务）：业务评测集 + 用户反馈 + 在线监控

## 2. 关键方法

| 方法 | 含义 | 适用 |
|---|---|---|
| 人工标注 | 人打分 1-5 或 pairwise 比较 | 黄金标准，贵 |
| 自动评测（LLM-as-judge） | 用更强模型打分（GPT-4 / Claude） | 大批量、相对排序 |
| 自洽性（self-consistency） | 多次采样取多数答案 | 推理类、有确定答案 |
| 引用一致性（faithfulness） | 答案是否基于 context | RAG |
| 单元测试 / 编译 | 输出能跑通即正确 | 代码生成 |
| 在线 AB | 真实用户 CTR / 留存 | 上线决策 |
| 对抗测试 | 红队 prompt 集攻击 | 安全合规 |

## 3. 主流评测基准

| 基准 | 测什么 | 优缺点 |
|---|---|---|
| MMLU | 学术多选 | 知识覆盖广，但与实际任务相关性弱 |
| HELM | 综合多维（准确、鲁棒、公平、bias） | 全，但跑成本高 |
| MT-Bench | 多轮对话（GPT-4 打分） | 接近真实使用 |
| Chatbot Arena | 人类 pairwise 投票 | 与人偏好相关最强，但分布偏开源 |
| HumanEval | 代码单元测试 | 代码能力金标 |
| TruthfulQA | 抗幻觉、抗误导 | 专项 |
| MATH / GSM8K | 数学推理 | 推理能力 |
| C-Eval / CMMLU | 中文综合 | 中文场景 |

## 4. 业务评测集设计

1. **样本量**：50-200 条，覆盖核心场景与边界情况
2. **标注规范**：每条标注「期望要点」「可接受变体」「明确错误」
3. **分类**：能力维度（事实 / 推理 / 风格 / 安全）× 业务场景
4. **更新频率**：月度新增 10-20%，避免模型过拟合
5. **盲测**：评测时不告知模型版本，减少主观偏差
6. **存档**：每次评测完整输出留存，便于回溯

## 5. LLM-as-judge 实践

### 提示词骨架

```
You are an impartial evaluator. Score the answer on a 1-5 scale.

Question: {question}
Reference answer: {gold}
Answer to evaluate: {answer}

Scoring rubric:
5 — Excellent: 完整、准确、清晰
4 — Good: 仅有小瑕疵
3 — Acceptable: 缺一关键点或有小错
2 — Poor: 多个错误或漏要点
1 — Wrong: 完全错或答非所问

Output JSON: {"score": 1-5, "reason": "..."}
```

### 偏差与陷阱

| 偏差 | 现象 | 缓解 |
|---|---|---|
| Position bias | 偏好第一个答案 | 位置交换 pairwise |
| Length bias | 偏好长答案 | 在 rubric 中强调长度无关 |
| Self-preference | GPT-4 偏好 GPT 输出 | 跨厂商 judge |
| 同质化 | 都给 4 分 | 加 reference + 强制分布 |

## 6. 在线评估

- **A/B 灰度**：1-5% 流量上线新 prompt / 模型，对比核心指标
- **隐式反馈**：用户接受率、复制率、编辑率、重生成率
- **显式反馈**：赞踩按钮、问题反馈入口
- **日志抽样**：每日抽样 100 条人工抽检，质量回归

## 7. 评估指标分层

| 层级 | 指标 | 决策场景 |
|---|---|---|
| 任务级 | success rate、faithfulness、relevance | 是否能上线 |
| 体验级 | 用户满意度、NPS | 是否值得推广 |
| 成本级 | 平均 token、单任务金额 | 是否经济可行 |
| 安全级 | 幻觉率、PII 泄露率、prompt injection 命中 | 是否合规 |

## 8. 本团队落地案例

- YiAi BRD 生成评测集：100 条业务 query（按 BRD 章节类型 × 语言分类）
- 评测流程：LLM-as-judge（Claude）打分 + 人工抽检 10%
- 每次模型 / prompt 变更前跑全量，回归后上线
- 上线后：每日 50 条抽样 + 用户「重生成率」隐式反馈

## 9. 参考资料

- HELM: https://crfm.stanford.edu/helm
- MT-Bench: https://github.com/lm-sys/FastChat
- Chatbot Arena: https://chat.lmsys.org
- LLM-as-judge: https://github.com/llm-attacks/llm-eval-best-practices
- RAGAS: https://docs.ragas.io
