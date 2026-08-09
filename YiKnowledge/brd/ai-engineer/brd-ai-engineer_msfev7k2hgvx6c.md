---
title: Model fine-tuning decision tree
lifecycle: active
key: brd_brd-ai-engineer_msfev7k2hgvx6c
tags:
- ai
- finetune
- lora
model: Llama 4 / DeepSeek V3.2
task_type: eval
framework: PyTorch + LoRA + PEFT
dataset: BRD business data 1000 records
eval_metric: BLEU / ROUGE / human rating
status: proposed
owner: AI Engineer
kb_path: ai-engineer/methodology/model-finetuning-decision-tree.md
context: When to fine-tune vs use baseline + RAG? Need a decision tree for guidance. Fine-tuning is costly
  + long cadence + prone to overfitting.
methodology: "Decision tree: business data < 500 records → RAG; 500-5000 records → few-shot; > 5000 records"
  + lots of domain terminology → LoRA; > 50000 records + high-quality annotations → full parameter fine-tuning.
baseline: baseline + RAG faithfulness 0.85
target: After fine-tuning faithfulness 0.90+ (specific domain); but cost $5K + 2 weeks + prone to overfitting
risks: 1. Insufficient data overfitting — decision tree guidance; 2. High cost — prefer RAG; 3. Model upgrade
  invalidation — quarterly eval
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Model fine-tuning decision tree

**Model**: Llama 4 / DeepSeek V3.2  |  **Task Type**: eval  |  **Framework**: PyTorch + LoRA + PEFT
**Dataset**: BRD business data 1000 records  |  **Eval Metric**: BLEU / ROUGE / human rating  |  **Status**: proposed  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/methodology/model-finetuning-decision-tree.md

## Context
When to fine-tune vs use baseline + RAG? Need a decision tree for guidance. Fine-tuning is costly + long cadence + prone to overfitting.

## Methodology
Decision tree: business data < 500 records → RAG; 500-5000 records → few-shot; > 5000 records + lots of domain terminology → LoRA; > 50000 records + high-quality annotations → full parameter fine-tuning.

## Baseline → Target
- **Baseline**: baseline + RAG faithfulness 0.85
- **Target**: After fine-tuning faithfulness 0.90+ (specific domain); but cost $5K + 2 weeks + prone to overfitting

## Risks & Mitigations
1. Insufficient data overfitting — decision tree guidance; 2. High cost — prefer RAG; 3. Model upgrade invalidation — quarterly eval

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/model-finetuning-decision-tree.md`
