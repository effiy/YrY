---
title: RLHF / DPO Alignment Methods
aliases:
- RLHF
- DPO
- preference optimization
- LLM alignment
tags:
- AI
- foundations
- alignment
- RLHF
- DPO
category: ai-engineer/foundations
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: foundations solid
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- transformer-architecture.md
- ../methodology/model-finetuning-decision-tree.md
- ../methodology/hallucination-mitigation.md
tacit: false
---

# RLHF / DPO Alignment Methods

> **As a** an ai engineer, **I want to** rlhf dpo alignment, **so that** foundations solid.

> Three layers of methods to align model behavior with human intent: SFT → RLHF → DPO/IPO/KTO.

## Summary
- Alignment = adjusting a pretrained model's behavior to match human intent; three layers: SFT → RLHF → DPO
- SFT teaches the model "to answer per instructions" but does not know "which answer is better"
- RLHF uses human preferences to train a reward model + PPO optimization; learns implicit preferences but training is unstable
- DPO derives mathematically to skip the explicit RM; single-stage training is stable and engineering is simple
- DPO variants: IPO prevents overfitting, KTO only needs binary tags, ORPO merges SFT, SimPO drops the reference model, RLAIF uses AI to replace human annotation

## Core viewpoints

**The alignment tax is real and measurable -- DP takes capability away as it adds safety.** Every alignment method reduces the model's effective capability on some axis. RLHF tends to reduce output diversity (all answers converge to the same style), degrade performance on tasks that were not represented in the preference data, and introduce a "sycophancy bias" where the model agrees with the user even when the user is wrong. The question is not "how to align perfectly" but "how to minimize the alignment tax while meeting the safety bar." This is why DPO variants that reduce the KL divergence penalty (like SimPO) tend to preserve more capability than vanilla RLHF.

**Preference data quality is the ceiling, not the algorithm.** The choice between RLHF, DPO, KTO, and their variants matters less than the quality of the preference data. A well-curated dataset of 1,000 high-quality preference pairs will produce better alignment than a noisy dataset of 100,000 pairs, regardless of the algorithm. The most common failure mode in alignment is not the algorithm choice but the data: annotators disagree on what "better" means, the preference distribution does not match the deployment distribution, and the data contains systematic biases (length bias, style bias, position bias) that the algorithm faithfully learns.

**DPO is not a simplification of RLHF -- it is a fundamentally different training dynamic.** RLHF uses a frozen reward model to score the policy's outputs, creating a stable training target. DPO uses the policy's own probabilities as the implicit reward, creating a moving target. This means DPO is more sensitive to the quality of the SFT starting point: if the SFT model assigns high probability to bad outputs, DPO will struggle to unlearn them. In contrast, RLHF's frozen reward model can provide a consistent negative signal even when the policy starts from a poor SFT baseline.

**The reference model in DPO is not a hyperparameter to tune -- it is a regularizer that defines the trust region.** The KL penalty term `beta` controls how far the policy can diverge from the SFT model. Setting beta too high prevents learning, and setting beta too low causes the model to overfit the preference data and lose general capabilities. The correct mental model is that beta defines the size of the trust region around the SFT model, and the optimal beta depends on how much you trust the SFT model versus the preference data.

**RLAIF is not "cheaper RLHF" -- it is a different data generation paradigm with its own failure modes.** When using a stronger model (like GPT-5 or Claude Opus) to annotate preferences for a weaker model, the annotator model's own biases (length preference, formatting preference, self-preference) are baked into the training data. The result is that the aligned model converges to the annotator's style, not to human preference. RLAIF works best when the annotator model is explicitly instructed to evaluate based on human-defined rubrics, and when cross-model annotation (using different annotators for different subsets) reduces systematic bias.


- **SFT is the foundation; DPO/RLHF cannot save a bad SFT** — without good instruction tuning, preference optimization is meaningless
- **RLHF learns implicit preferences** — not only formatting, but also multi-round iterative optimization
- **DPO is a simplified version of RLHF** — mathematically derived to skip the explicit RM and train directly with preference pairs
- **Preference data diversity sets the ceiling** — a single prompt type causes the model to overfit
- **AI annotation (RLAIF) is the scaling path** — using a stronger model to score allows large batches, but length bias and self-preference must be calibrated

## Key information

### concept breakdown

A pretrained model "knows a little of everything" but does not know what humans want. **Alignment** = adjusting the model's behavior to match human intent. Three layers:

1. **SFT** (Supervised Fine-Tuning): supervised fine-tuning with "instruction-answer" pairs, so the model learns "to answer per instructions"
2. **RLHF** (Reinforcement Learning from Human Feedback): human preferences train a reward model, PPO optimization
3. **DPO / IPO / KTO**: train directly with preference pairs, skipping the explicit reward model

### Key parameters / formulas / data

#### RLHF three-stage process

```
1. SFT model as the starting point
2. Train Reward Model (RM)
   - Collect preference pairs: (prompt, response_A, response_B, preference)
   - RM learns to predict human preferences
3. PPO reinforcement learning
   - SFT model generates answers
   - RM gives reward
   - PPO updates the policy so the model generates high-reward answers
   - Add KL divergence constraint to prevent drifting too far from SFT
```

#### DPO Loss formula

$$ \mathcal{L}_{DPO} = -\log \sigma\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\right) $$

Where $y_w$ is the preferred answer, $y_l$ is the dispreferred answer, $\pi_{ref}$ is the reference (SFT) model, and $\beta$ is the KL constraint strength.

#### DPO variants comparison

| method | improvement |
|---|---|
| IPO | prevents DPO overfitting, adds regularization |
| KTO | only needs "good/bad" binary tags, no pairs required |
| ORPO | merges SFT with preference learning, saves one step |
| SimPO | simplifies DPO, removes reference model |
| Constitutional AI / RLAIF | uses AI to replace human preference annotation |

#### Engineering implementation key points

| dimension | recommendation |
|---|---|
| SFT data volume | 1k-100k "instruction-expected answer" pairs |
| SFT training | standard cross-entropy loss, compute loss only on the answer portion; LoRA / QLoRA are generally applicable |
| Preference data diversity | a single prompt type causes model overfitting |
| KL constraint strength β | too small = large drift, too large = no learning; common 0.01-0.5 |
| Learning rate | DPO uses 1/10 of the SFT learning rate |
| Evaluation | win rate (pairwise win rate), human preference evaluation set, safety evaluation |
| Prevent reward hacking | monitor distribution drift, answer length exceptions, sensitive-word trigger rate |

#### Limitations and improvement trajectory

| limitation | improvement |
|---|---|
| length bias | length-controlled DPO |
| position bias (A/B) | balanced annotation |
| self-preference | cross-model annotation |
| OOD drift | add SFT regularization |
| safety (jailbreak) | red team + adversarial training |

### Applicable scenarios
- Alignment layer for all conversational models such as ChatGPT / Claude / Llama
- Vertical models: use business preference pairs with DPO so the model answers per business rules
- Agent alignment: make the model prefer to call tools rather than free-generate
- This team: YiAi BRD generation evaluation of whether business preference pairs for DPO are needed depends on whether SFT is sufficient; accumulate implicit preference pairs from user "regenerate vs accept"

## Action recommendations
1. First make SFT solid (1k-100k high-quality instruction pairs; LoRA/QLoRA generally applicable); preference optimization is icing on the cake
2. Preference pair collection: generate N answers for the same prompt (different temperatures/versions), human pairwise comparison, multi-annotator consistency check (Cohen's kappa)
3. Start with DPO; single-stage training is stable and saves the RM; tune β starting from 0.1
4. Evaluation is mandatory: win rate + human preference evaluation set + safety evaluation
5. RLAIF path: use Claude/GPT-4 to score large batches + human annotation to calibrate length bias and self-preference

## Anti-patterns

**Running DPO with the same learning rate as the SFT phase.** DPO operates on a different loss landscape than SFT. The DPO loss compares the policy's log-probabilities between chosen and rejected responses, and the gradient signal is much weaker than the cross-entropy signal in SFT. Using the SFT learning rate causes the model to oscillate or diverge. The rule of thumb is DPO LR = SFT LR / 10, but the correct approach is to run a learning rate sweep on a small validation set.

**Collecting preference data by having annotators compare outputs from a single model.** The preference data must represent the distribution of possible outputs, not just the distribution of a single model's mistakes. If all preference pairs are generated by the same model, the DPO training signal only teaches the model to avoid its own specific failure modes. The model will not learn to avoid failure modes that it has never produced. The correct approach is to generate preference pairs from multiple models with different failure profiles, or to use adversarial generation to produce diverse negative examples.

**Evaluating alignment quality by win rate alone.** Win rate against a baseline model is the most common alignment metric, but it is also the most gameable. A model can achieve a high win rate by producing longer, more verbose, or more confident-sounding answers without actually being more correct. Win rate must be complemented by: factuality metrics (does the answer contain verifiable errors), refusal accuracy (does the model refuse when appropriate and answer when appropriate), and regression tests on known failure cases.

**Assuming that a single round of alignment is sufficient.** Alignment is not a one-time process. User preferences evolve, new failure modes are discovered, and the model's behavior drifts as it is used in new contexts. The alignment pipeline must be iterative: collect deployment data, identify new failure modes, add them to the preference dataset, retrain, and redeploy. The most successful aligned models (Claude, ChatGPT) have gone through dozens of alignment iterations, not just one.

**Neglecting to evaluate the model on tasks that were NOT in the preference data.** The alignment process can catastrophically degrade performance on tasks that were underrepresented in the preference data. This is especially dangerous for safety-critical applications where the model may have learned to be "helpful" on a task that it should refuse. Always maintain a held-out evaluation set covering tasks and domains that were not in the alignment data, and monitor for regression on each alignment iteration.


- **Doing DPO/RLHF before SFT is solid** — cannot save it; SFT is the foundation
- **Single prompt type preference data** — model overfits a specific pattern
- **β not tuned** — too small = large drift, too large = no learning; common 0.01-0.5
- **DPO learning rate at the same magnitude as SFT** — should use 1/10 of SFT
- **Only looking at automated metrics without testing safety** — after alignment it can still be jailbroken; red team and adversarial training are mandatory
- **Ignoring reward hacking** — the model may find loopholes rather than truly improve; monitor distribution drift and length exceptions

## Related
- Same category: [transformer-architecture-summary.md](./transformer-architecture.md) (base model)
- Upstream: [../methodology/model-finetuning-decision-tree.md](../methodology/model-finetuning-decision-tree.md) (fine-tuning decision)
- Downstream: [../methodology/hallucination-mitigation.md](../methodology/hallucination-mitigation.md) (post-alignment hallucination control)
