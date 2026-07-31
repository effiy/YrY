---
title: 幻觉检测与抑制
tags: [AI, 方法论, 幻觉, 安全]
category: methodology/ai-specific
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 幻觉检测与抑制

## 1. 定义与分类

幻觉（hallucination）：模型生成的内容看似合理但事实错误或无依据。分三类：

- **事实幻觉**（factual hallucination）：与可验证的外部事实冲突（"X 公司成立于 1970"）
- **上下文幻觉**（contextual hallucination）：与给定 context 冲突（RAG 中检索到 A 但回答 B）
- **指令幻觉**（instructional hallucination）：偏离用户指令（要求 JSON 输出却给散文）

区分幻觉与「合理的不确定性」与「创作性表达」——只有当事实可验证且模型声称其为事实时才算幻觉。

## 2. 成因

| 成因 | 机制 |
|---|---|
| 训练数据噪声 | 错误信息被学习 |
| 长尾覆盖差 | 低频事实记不准 |
| 自回归生成 | 一旦前文出错，后文为保连贯继续错 |
| 对齐过强 | RLHF 偏好流畅表达，宁愿编造也不说不知道 |
| 上下文冲突 | system prompt / context / user query 互相矛盾，模型选其一 |
| 检索质量差 | RAG 召回噪声，LLM 基于噪声回答 |

## 3. 检测方法

### 内部检测

- **自洽性**（self-consistency）：多次采样，答案一致率高 = 低幻觉
- **置信度校准**：logprob 与正确性是否相关；多数模型 logprob 偏乐观
- **verbalized confidence**：让模型自己说"我 80% 确定"，相关性弱但有参考

### 外部检测

- **事实核查**（fact-checking）：抽关键实体 → 检索权威源 → 比对
- **引用一致性**（faithfulness）：RAG 答案是否可由 context 推导出
- **LLM-as-judge**：让另一模型对比答案与 reference，标记可疑句
- **工具校验**：对代码 / 数学 / SQL 用执行结果校验

### 在线监控

- 答案带置信度分布，长尾低分触发人工抽检
- 监控「重生成率」与「用户复制率」差异，前者高 = 用户不满意
- 关键实体链抽取 + 比对，发现编造实体

## 4. 抑制策略

### Prompt 层

1. **明确允许"不知道"**：system prompt 显式说「若 context 中无依据，回答"信息不足"」
2. **要求引用**：让模型在每句末标注来源 chunk
3. **结构化输出**：JSON 字段固定，编造空间小
4. **温度调低**：0-0.3，降低随机性
5. **few-shot 用"拒答示例"**：示范遇到不确定时如何回答

### 检索层（RAG）

1. **召回质量**：rerank + hybrid search，确保 context 相关
2. **context 充足**：top-k 不要太少，召回池广但精排严
3. **校验检索结果**：若 score 全部低于阈值，先告诉用户"知识库无相关内容"，不强行回答

### 后处理层

1. **事实过滤器**：抽取关键声明 → 检索 → 比对 → 标记
2. **引用验证**：检查引用的 chunk 确实包含被引用内容
3. **敏感词检测**：实体 / PII / 医学法律免责声明

### 模型层

1. **RLHF 加"诚实"reward**：奖励说"不知道"，惩罚编造
2. **DPO 偏好对齐**：用真实 vs 编造的成对样本
3. **RAG fine-tune**：训练模型依赖 context 而非参数知识

## 5. 评估指标

| 指标 | 含义 |
|---|---|
| Hallucination rate | 含幻觉回答的比例 |
| Faithfulness | 答案可由 context 推导的比例 |
| Factuality | 与外部事实一致的比例 |
| Citation accuracy | 引用正确的比例 |
| Refusal accuracy | 应当拒答时拒答的比例 |
| False refusal | 不该拒答时拒答的比例 |

## 6. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 仅靠 prompt "不要幻觉" | 模型口头同意但仍编造 | 加 RAG + 引用 + 后处理校验 |
| 追求零幻觉 | 大量拒答，可用性崩塌 | 接受合理幻觉率，按场景分级 |
| 检索差但强约束 | 模型只能说"不知道"，等价于无 RAG | 先优化检索再压幻觉 |
| 不评估 | 上线后幻觉率不知道 | 评测集 + 在线监控 + 抽检 |
| 不分场景 | 一刀切温度 0，创作场景僵化 | 按任务分级配置 |

## 7. 与产品决策的关系

幻觉率与产品可用性是权衡：

- **零幻觉** → 拒答率高 → 用户体验差
- **零拒答** → 幻觉率高 → 信任崩塌

按场景定目标：

| 场景 | 目标幻觉率 | 备注 |
|---|---|---|
| 客服 FAQ | < 1% | 错误答案直接损害用户 |
| BRD 生成 | < 5% | 错误需人工审，但拒答率也不能太高 |
| 创意写作 | 不适用 | 不需要事实约束 |
| 代码生成 | 单元测试决定 | 编译/测试通过即正确 |
| 摘要 | faithfulness > 95% | 不可编造原文未提内容 |

## 8. 本团队落地案例

- YiAi BRD：RAG + 引用 + faithfulness 在线监控（LLM-as-judge），目标幻觉率 < 5%
- YiVad 对话：低温度 + system prompt 允许"不知道"，非知识密集场景接受 10% 幻觉
- 监控：每日抽 50 条人工标幻觉，月度回归

## 9. 参考资料

- Ji et al., 2023 — *Survey of Hallucination in NLG*
- RAGAS faithfulness: https://docs.ragas.io
- TruthfulQA: https://github.com/sylinrl/TruthfulQA
- Self-Consistency: Wang et al., 2022
