---
title: RLHF / DPO 对齐方法
tags: [AI, 基础, 对齐, RLHF, DPO]
category: tech/ai-foundations
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# RLHF / DPO 对齐方法

## 1. 概念定义与背景

预训练模型"什么都会一点"，但不知道人类想要什么。**对齐（alignment）** = 把模型行为调整到符合人类意图。三层手段：

1. **SFT**（Supervised Fine-Tuning）：用「指令-回答」对监督微调，让模型学会"按指令答"
2. **RLHF**（Reinforcement Learning from Human Feedback）：人类偏好训练奖励模型，PPO 优化
3. **DPO / IPO / KTO**：直接用偏好对训练，跳过显式奖励模型

InstructGPT / ChatGPT 把 RLHF 推上主流；Llama-2 / Claude 把 Constitutional AI 与 RLHF 结合；DPO（2023，Stanford）后流行，省一步训练。

## 2. SFT：基础对齐

- 数据：1k-100k 条「指令-期望回答」对
- 训练：标准 cross-entropy loss，只对回答部分算 loss
- 成本：full FT 昂贵；LoRA / QLoRA 普适
- 局限：模型学会"按指令答"的格式，但不知道"哪个回答更好"

## 3. RLHF：偏好驱动对齐

### 三阶段流程

```
1. SFT 模型作为起点
2. 训练 Reward Model（RM）
   - 收集偏好对：(prompt, response_A, response_B, 偏好)
   - RM 学会预测人类偏好
3. PPO 强化学习
   - SFT 模型生成回答
   - RM 给奖励
   - PPO 更新策略，让模型生成高奖励回答
   - 加 KL 散度约束，防止偏离 SFT 太远
```

### 优点

- 学到隐性偏好（不只是格式）
- 多轮迭代可以持续优化

### 局限

- 训练不稳定（PPO 超参敏感）
- RM 容易被 reward hacking（模型找漏洞而非真变好）
- 人类标注有偏（标注者偏好不代表用户偏好）
- 三阶段训练资源消耗大

## 4. DPO：直接偏好优化

### 核心思想

数学上推导出：可以跳过显式 RM，直接用偏好对训练策略。Loss 形式：

$$ \mathcal{L}_{DPO} = -\log \sigma\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\right) $$

其中 $y_w$ 是偏好回答，$y_l$ 是不偏好回答，$\pi_{ref}$ 是参考（SFT）模型，$\beta$ 是 KL 约束强度。

### 优点

- 单阶段训练，省 RM
- 训练稳定，类似 SFT
- 工程实现简单

### 局限

- 对偏好对质量敏感
- 在分布外（OOD）样本上效果差
- 可能过度强调偏好对中的差异

## 5. DPO 变体

| 方法 | 改进 |
|---|---|
| IPO | 防止 DPO 过拟合，加正则 |
| KTO | 只需"好 / 坏"二元标签，不需要成对 |
| ORPO | SFT 与偏好学习合并，省一步 |
| SimPO | 简化 DPO，去掉参考模型 |
| Constitutional AI / RLAIF | 用 AI 替代人类标注偏好 |

## 6. 数据采集

### 偏好对采集

1. 同一 prompt 下生成 N 个回答（不同采样温度 / 模型版本）
2. 人类标注者 pairwise 比较
3. 标注规范：清晰度、有用性、安全性、事实性
4. 多标注者一致性检查（Cohen's kappa）

### AI 标注（RLAIF）

- 用更强模型（Claude / GPT-4）打分
- 优点：成本极低、可大批量
- 缺点：与人类偏好有偏差（length bias、self-preference）
- 实践：AI 标注大量 + 人类标注校准

## 7. 工程实现要点

1. **SFT 是基础**：DPO / RLHF 不好的 SFT 模型也救不回来
2. **偏好数据多样性**：单一 prompt 类型会让模型过拟合
3. **KL 约束强度 β**：太小漂移大、太大不学；常见 0.01-0.5
4. **学习率小**：DPO 用 SFT 学习率的 1/10
5. **评估必做**：胜率（pairwise win rate）、人类偏好对评测集、安全评测
6. **防止 reward hacking**：监控分布漂移、回答长度异常、敏感词触发率

## 8. 局限与改进脉络

- **长度偏置**：偏好数据里长答案偏被选 → length-controlled DPO
- **位置偏置**：A/B 位置 → 平衡标注
- **自我偏好**：模型偏好自己输出 → 跨模型标注
- **OOD 漂移**：DPO 在分布外差 → 加 SFT 正则
- **安全**：对齐后仍可能被 jailbreak → 加红队与对抗训练

## 9. 实际应用场景

- ChatGPT / Claude / Llama 等所有对话模型的对齐层
- 垂类模型：用业务偏好对 DPO，让模型按业务规则回答
- Agent 对齐：让模型偏好调工具而非自由生成

## 10. 本团队关注点

- YiAi BRD 生成评估：是否需要业务偏好对 DPO？取决于 SFT 后是否够用
- 数据准备：积累用户「重生成 vs 接受」的隐式偏好对
- 评估：胜率 + 人工评测 + 安全

## 11. 关键参考

- Ouyang et al., 2022 — *Training language models to follow instructions with human feedback*（InstructGPT / RLHF）
- Rafailov et al., 2023 — *Direct Preference Optimization*（DPO）
- Ethayarajh et al., 2024 — *KTO: Model Alignment as Prospect Theoretic Optimization*
- Bai et al., 2022 — *Constitutional AI*（RLAIF）
