---
title: 模型微调决策树（Full FT / LoRA / QLoRA / Prefill）
tags: [AI, 方法论, 微调, LoRA, QLoRA]
category: methodology/ai-specific
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 模型微调决策树

## 1. 方法论定义

什么时候微调？用哪种微调方法？这是 AI 产品落地的核心决策。错误的微调选择会浪费数千 GPU 小时与数月时间。

四类方法：

1. **Full Fine-Tuning（Full FT）**：所有参数都更新
2. **LoRA**（Low-Rank Adaptation）：冻结原权重，加低秩旁路训练
3. **QLoRA**：4-bit 量化基础模型 + LoRA
4. **Prefill tuning / Prefix tuning / P-tuning**：只学 prefix embedding，模型冻结

## 2. 核心概念

| 概念 | 含义 |
|---|---|
| Full FT | 全部参数更新，质量上限高但训练贵 |
| LoRA | 冻结原模型，训练低秩矩阵 A、B：`W' = W + BA` |
| QLoRA | 4-bit NF4 量化 + LoRA，单卡训 70B |
| Prefix / P-tuning | 训练前缀 embedding，模型冻结，参数最少 |
| Adapter | 在每层加小 MLP，介于 LoRA 与 Full 之间 |
| Continual Pretraining | 大规模无监督续训，不是任务微调 |
| Instruction Tuning | 用指令数据 SFT |

## 3. 决策树

```
A. 是否有大量高质量业务数据（>10k 标注）？
   否 →
     A1. 是否任务可由 prompt 解决？
        是 → 不微调，先优化 prompt + RAG
        否 → 是否预算紧张？
             是 → LoRA 或 QLoRA
             否 → 收集数据优先（不微调）
   是 →
     B. 是否需要超越 base model 能力上限？
        否 → LoRA / QLoRA（性价比高）
        是 →
          C. 显存能装下原模型 + 梯度？
             是 → Full FT（A100 80G 4 卡以上）
             否 → QLoRA（保 95% 质量）

D. 任务是否高度特定（格式、风格、术语）？
   是 → LoRA 优先（小数据也能学好）
   否 → 评估 prompt + RAG 是否够

E. 是否需要持续更新（业务规则频繁变）？
   是 → 多 LoRA 部署（Punica / LoRAX）
   否 → 单模型部署
```

## 4. 各方法对比

| 维度 | Full FT | LoRA | QLoRA | Prefix |
|---|---|---|---|---|
| 训练显存 | 模型 × 4-8 倍 | 模型 × 1-2 倍 | 模型 1/4 + LoRA | 模型 + 小量 |
| 训练速度 | 慢 | 快 | 中 | 极快 |
| 质量上限 | 最高 | 95% Full | 95% Full | 80% Full |
| 部署 | 单模型 | LoRA 与 base 可热切换 | 同 LoRA | 多 prefix 灵活 |
| 多任务 | 需多模型 | 多 LoRA | 多 QLoRA | 多 prefix |
| 适用 | 大算力、超能力 | 通用首选 | 单卡训大模型 | 极轻量场景 |
| 风险 | 灾难遗忘重 | 遗忘轻 | 遗忘轻 | 几乎不遗忘 |

## 5. LoRA 工程要点

### 超参

| 参数 | 常用值 | 说明 |
|---|---|---|
| rank `r` | 8-64 | 越大表达越强但易过拟合 |
| alpha `α` | 16-128 | 缩放系数，常用 α = 2r |
| target modules | `q_proj, k_proj, v_proj, o_proj` 或 all-linear | all-linear 质量好但参数多 |
| dropout | 0.05-0.1 | 防过拟合 |
| learning rate | 1e-4 ~ 5e-4 | 比 Full FT 大 |

### 训练流程

1. SFT：高质量指令对（1k-100k）
2. 评估：业务评测集 + 持有评测集（防遗忘）
3. 合并：训练完后 merge 回 base 用于部署，或保留 LoRA 多任务热切换

## 6. QLoRA 工程要点

### 关键技术

- **NF4 量化**：正态分布友好的 4-bit 量化
- **Double quantization**：把量化常数再量化，省显存
- **Paged optimizer**：用 CPU offload 防 OOM 峰值

### 单卡训 70B 步骤

```bash
# 加载 4-bit 模型
model = AutoModelForCausalLM.from_pretrained(
    "...llama-3-70b",
    load_in_4bit=True,
    device_map="auto",
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

# 加 LoRA
lora_config = LoraConfig(
    r=64, lora_alpha=128, lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
)

# SFT trainer
trainer = SFTTrainer(model=model, ...)
```

## 7. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 数据不够就微调 | 100 条就上 LoRA | 先试 prompt + RAG |
| Full FT 上 7B | 7B 也 Full FT 浪费 | 7B 普通用 LoRA |
| 评测只看任务分 | 遗忘旧任务 | 必加持有评测 |
| 多任务不分 LoRA | 互相干扰 | 多 LoRA + 路由 |
| 训练数据混格式 | 模型学到不一致 | 统一格式 + 系统提示 |
| 学习率同 base | 收敛慢或不稳 | LoRA 大、Full 小 |
| 不加正则 | 灾难遗忘 | LoRA / KL 约束 / replay |

## 8. 评估指标

| 指标 | 含义 |
|---|---|
| 业务任务成功率 | 目标任务正确率 |
| 持有任务成功率 | 旧任务是否遗忘 |
| 与 base 一致性 | 是否保持通用能力 |
| BLEU / ROUGE | 生成质量（参考） |
| 人工胜率 | pairwise 比较 |
| 资源消耗 | GPU 小时、显存峰值 |

## 9. 与其他方法关系

- **Prompt / RAG / Few-shot**：不需训练，先尝试
- **微调**：prompt 不够时
- **Pretraining 续训**：领域知识大量时（如代码、医学）
- **RLHF / DPO**：对齐偏好，与 SFT 叠加

## 10. 本团队落地案例

- YiAi BRD：先尝试 prompt + RAG，评估后决定是否微调
- 暂不微调：当前模型质量足够，性价比不划算
- 评估中：若 BRD 风格一致性需达 90%+，再上 LoRA

## 11. 关键参考

- Hu et al., 2021 — *LoRA: Low-Rank Adaptation*
- Dettmers et al., 2023 — *QLoRA: Efficient Finetuning of Quantized LLMs*
- Liu et al., 2021 — *P-Tuning v2*
- Stanford Alpaca — *Self-instruct + LoRA 早期实践*
