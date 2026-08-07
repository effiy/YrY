---
title: Model Fine-tuning Decision Tree (Full FT / LoRA / QLoRA / Prefix) 
aliases:
- Model Fine-tuning Decision Tree
- LoRA
- QLoRA
tags:
- AI
- methodology
- fine-tuning
- lora
category: ai-engineer/methodology
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- ai-engineer
- engineer
benefit: ai methodology sound
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- llm-evaluation-methods.md
- prompt-engineering-guide.md
- rag-design-patterns.md
- ../foundations/rlhf-dpo-alignment.md
- ../platform/llm-comparison.md
tacit: false
---

# Model Fine-tuning Decision Tree

> **As** an ai engineer, **I want to** a model finetuning decision tree, **so that** ai methodology is sound. 

> When to fine-tune, and which method to use, are core decisions for AI landing; a wrong choice wastes thousands of GPU hours and months of time. 

## Summary
- Four main methods: Full FT (full parameters) , LoRA (low-rank side branch) , QLoRA (4-bit quantization + LoRA) , Prefix / P-tuning (only learn prefix) . 
- Core of the decision tree: first ask whether data is enough (>10k annotated) , then whether you need to exceed the base ceiling, then whether GPU memory is sufficient. 
- General first choice is LoRA / QLoRA (95% of Full quality, single-card can train 70B) ; Full FT only when large compute + exceeding capability. 
- Must include held-out evaluation to prevent catastrophic forgetting; multi-task uses multiple LoRAs + routing (Punica / LoRAX) . 

## Core viewpoints

**The fine-tuning decision is not a quality decision -- it is an economic decision.** The question is not "will fine-tuning improve quality" (it almost always will, on the fine-tuning task), but "will the quality improvement justify the total cost of fine-tuning." The total cost includes: data collection and labeling, GPU compute, engineering time, evaluation infrastructure, deployment complexity, and the ongoing cost of maintaining the fine-tuned model. For most teams, the total cost of fine-tuning exceeds the value of the quality improvement, and prompt engineering + RAG is the better investment.

**Fine-tuning on a narrow task distribution is a one-way door -- it improves performance on the task but permanently degrades general capability.** The model loses knowledge and capabilities that were not represented in the fine-tuning data. This is catastrophic forgetting, and it is invisible if you only evaluate on the fine-tuning task. The held-out evaluation set (measuring performance on tasks that were NOT in the fine-tuning data) is the only defense. Without it, you will discover the capability loss in production, when users ask questions the model used to handle.

**The decision tree's first question -- "Can the task be solved by prompt + RAG?" -- is the most important and most frequently skipped.** The majority of tasks that teams attempt to solve with fine-tuning can be solved with prompt engineering and RAG. The cost of trying prompt + RAG is hours of engineering time. The cost of unnecessary fine-tuning is weeks of GPU time, data labeling, and evaluation. The economic argument for trying prompt + RAG first is overwhelming, but the psychological appeal of fine-tuning ("we need to train our own model") often overrides it.

**LoRA is not a cheaper version of Full Fine-Tuning -- it is a fundamentally different operation with different failure modes.** LoRA trains low-rank adapters on top of a frozen base model. This means it can only learn patterns that are representable as a low-rank update to the base model's weights. For tasks that require learning new knowledge (facts, concepts, relationships), LoRA is insufficient because the new knowledge cannot be compressed into a low-rank adapter. For tasks that require learning a new style or format, LoRA is ideal. The choice between LoRA and Full FT is about the nature of the task, not just the budget.

**The hyperparameter `r` (rank) in LoRA is not a performance parameter -- it is a capacity parameter that controls the adapter's ability to store new information.** A higher `r` allows the adapter to learn more complex patterns but also increases the risk of overfitting and catastrophic forgetting. The optimal `r` depends on the complexity of the task: `r=8` for style adaptation, `r=16` for format adaptation, `r=32-64` for domain adaptation. The `r` value should be tuned on the held-out evaluation set, not on the task evaluation set.

- **Prompt + RAG is the first choice** — when data is insufficient (<10k) or the task can be solved by prompt, do not fine-tune. 
- **LoRA is the king of cost-effectiveness** — 95% of Full quality, fast training, low memory, hot-swap with base, light catastrophic forgetting. 
- **QLoRA makes single-card 70B training possible** — NF4 quantization + Double quantization + Paged optimizer. 
- **Held-out evaluation is indispensable** — only looking at task scores ignores catastrophic forgetting; must add regression set for old tasks. 
- **Learning rate should be tuned per method** — LoRA large (1e-4 ~ 5e-4) , Full small; same base will converge slowly or unstably. 

## Key information

### concept breakdown

| Concept | Meaning |
|---|---|
| Full FT | All parameters updated, quality ceiling high but training expensive |
| LoRA | Freeze original model, train low-rank matrices A, B: `W' = W + BA` |
| QLoRA | 4-bit NF4 quantization + LoRA, single-card trains 70B |
| Prefix / P-tuning | Train prefix embedding, model frozen, fewest parameters |
| Adapter | Add small MLP at each layer, between LoRA and Full |
| Continual Pretraining | Large-scale unsupervised continued pretraining, not task fine-tuning |
| Instruction Tuning | SFT with instruction data |

### decision tree

```
A. Do you have a large amount of high-quality business data (>10k annotated)?
   No ->
     A1. Can the task be solved by prompt?
        Yes -> Do not fine-tune, optimize prompt + RAG first
        No -> Is the budget tight?
             Yes -> LoRA or QLoRA
             No -> Prioritize collecting data (do not fine-tune)
   Yes ->
     B. Do you need to exceed the base model capability ceiling?
        No -> LoRA / QLoRA (cost-effective)
        Yes ->
          C. Can GPU memory hold the original model + gradients?
             Yes -> Full FT (A100 80G 4 cards or more)
             No -> QLoRA (keep 95% quality)

D. Is the task highly specific (format, style, terminology)?
   Yes -> LoRA preferred (small data can also learn well)
   No -> Evaluate whether prompt + RAG is enough

E. Do you need continuous updates (business rules change frequently)?
   Yes -> Multi-LoRA deployment (Punica / LoRAX)
   No -> Single model deployment
```

### Method comparison

| Dimension | Full FT | LoRA | QLoRA | Prefix |
|---|---|---|---|---|
| Training memory | model x 4-8x | model x 1-2x | model 1/4 + LoRA | model + small amount |
| Training speed | slow | fast | medium | very fast |
| Quality ceiling | highest | 95% Full | 95% Full | 80% Full |
| Deployment | single model | LoRA and base hot-swap | same as LoRA | multi-prefix flexible |
| Multi-task | needs multiple models | multiple LoRAs | multiple QLoRAs | multiple prefixes |
| Applicable | large compute, exceeding capability | general first choice | single-card large model | very lightweight scenarios |
| Risk | severe catastrophic forgetting | light forgetting | light forgetting | almost no forgetting |

### LoRA hyperparameter process

**Hyperparameters**

| Parameter | Common value | Explanation |
|---|---|---|
| rank `r` | 8-64 | larger means stronger expressivity but easy to overfit |
| alpha `a` | 16-128 | scaling coefficient, commonly a = 2r |
| target modules | `q_proj, k_proj, v_proj, o_proj` or all-linear | all-linear has better quality but more parameters |
| dropout | 0.05-0.1 | prevent overfitting |
| learning rate | 1e-4 ~ 5e-4 | larger than Full FT |

**Training process**

1. SFT: high-quality instruction pairs (1k-100k) 
2. Evaluation: business eval set + held-out eval set (prevent forgetting) 
3. Merge: after training, merge back to base for deployment, or keep LoRA for multi-task hot-swap

### QLoRA key techniques

- **NF4 quantization**: 4-bit quantization friendly to normal distributions
- **Double quantization**: quantize the quantization constants again, save memory
- **Paged optimizer**: use CPU offload to prevent OOM peaks

**Single-card 70B training steps**

```bash
# Load 4-bit model
model = AutoModelForCausalLM.from_pretrained(
    "...llama-3-70b",
    load_in_4bit=True,
    device_map="auto",
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

# Add LoRA
lora_config = LoraConfig(
    r=64, lora_alpha=128, lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
)

# SFT trainer
trainer = SFTTrainer(model=model, ...)
```

### Evaluation metrics

| Metric | Meaning |
|---|---|
| Business task success rate | target task accuracy |
| Held-out task success rate | whether old tasks are forgotten |
| Consistency with base | whether general capability is retained |
| BLEU / ROUGE | generation quality (reference)  |
| Manual win rate | pairwise comparison |
| Resource consumption | GPU hours, memory peak |

### Relationship with other methods

- **Prompt / RAG / Few-shot**: no training needed, try first
- **Fine-tuning**: when prompt is not enough
- **Pretraining continued**: when domain knowledge is large (e.g., code, medicine) 
- **RLHF / DPO**: align preferences, stack with SFT

### Applicable scenarios

- prompt + RAG has hit a bottleneck, need to exceed base ceiling
- task is highly specific (format, style, terminology) 
- business rules change frequently (multi-LoRA deployment) 

## Action recommendations
1. First evaluate prompt + RAG: if solvable, do not fine-tune, save thousands of GPU hours. 
2. data < 10k: do not fine-tune, collect data first; if budget tight use LoRA / QLoRA. 
3. data >= 10k + no need to exceed base: LoRA / QLoRA (cost-effective first choice) . 
4. data >= 10k + need to exceed base + memory sufficient: Full FT; if memory insufficient QLoRA keeps 95%. 
5. Task highly specific: LoRA preferred; multi-task uses multiple LoRAs + routing (Punica / LoRAX) . 
6. LoRA hyperparameters: r=8-64, a=2r, target=all-linear, lr=1e-4~5e-4, dropout=0.05-0.1. 
7. Must add held-out evaluation: old task regression set + business set + base consistency, prevent catastrophic forgetting. 

## Anti-patterns

**Fine-tuning with insufficient data (<1000 examples) and expecting the model to generalize.** Fine-tuning with fewer than 1000 examples is memorization, not generalization. The model will learn to reproduce the training examples but will not generalize to new inputs. The minimum viable dataset size is 1000-10000 examples, depending on the task complexity. Below this threshold, prompt engineering + few-shot examples is the better approach.

**Evaluating fine-tuning quality only on the fine-tuning task without a held-out evaluation set.** The fine-tuning task's accuracy will improve (that is the objective), but the model's general capability may degrade. Without a held-out evaluation set that measures performance on tasks that were NOT in the fine-tuning data, you cannot detect catastrophic forgetting. The held-out evaluation set should be run before and after every fine-tuning iteration.

**Using the same learning rate for LoRA and Full Fine-Tuning.** LoRA trains only the adapter weights, which have a different loss landscape than the full model. The optimal learning rate for LoRA is typically 10x higher than for Full Fine-Tuning (1e-4 to 5e-4 for LoRA vs 1e-5 to 5e-5 for Full FT). Using the Full FT learning rate for LoRA will cause slow convergence; using the LoRA learning rate for Full FT will cause instability.

**Training multiple LoRA adapters on different tasks without a routing mechanism.** Each LoRA adapter is trained for a specific task, and applying the wrong adapter to a query produces worse results than using no adapter at all. The deployment must include a routing mechanism (task classifier, user selection, or automatic routing) that selects the correct adapter for each query.

**Assuming that fine-tuning is a one-time investment.** Fine-tuning creates a model version that must be maintained, updated, and eventually retired. When the base model is updated, the fine-tuned model must be retrained on the new base. When the task distribution changes, the fine-tuned model's performance degrades. The ongoing cost of maintaining a fine-tuned model (data updates, model retraining, evaluation, deployment) should be factored into the initial fine-tuning decision.


- **Fine-tune when data is insufficient** — only 100 examples then LoRA; try prompt + RAG first. 
- **Full FT on 7B** — 7B general use LoRA; Full FT is wasteful. 
- **Evaluation only on task score** — forget old tasks; must add held-out evaluation. 
- **Multi-task without splitting LoRA** — interfere with each other; multiple LoRAs + routing. 
- **Mixed format in training data** — model learns inconsistency; unify format + system tip. 
- **Learning rate same as base** — slow or unstable convergence; LoRA large, Full small. 
- **No regularization** — catastrophic forgetting; LoRA / KL constraint / replay. 

## Related
- Same category: [llm-evaluation-methods-summary.md](./llm-evaluation-methods.md) (held-out evaluation) ; [prompt-engineering-guide-summary.md](./prompt-engineering-guide.md) (try prompt first) ; [rag-design-patterns-summary.md](./rag-design-patterns.md) (try RAG first) 
- upstream: [../foundations/rlhf-dpo-alignment.md](../foundations/rlhf-dpo-alignment.md); [../platform/llm-comparison.md](../platform/llm-comparison.md)
- downstream: YiAi BRD (currently not fine-tuning, quality is sufficient) 

## References
- Hu et al., 2021 — *LoRA: Low-Rank Adaptation*
- Dettmers et al., 2023 — *QLoRA: Efficient Finetuning of Quantized LLMs*
- Liu et al., 2021 — *P-Tuning v2*
- Stanford Alpaca — *Self-instruct + LoRA early practice*
