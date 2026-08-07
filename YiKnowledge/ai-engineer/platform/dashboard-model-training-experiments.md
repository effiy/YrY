---
title: model training and experiment tracking dashboard
aliases:
- ML training dashboard
- experiment tracking dashboard
- model training health dashboard
- ML experiment dashboard
- GPU training dashboard
tags:
- dashboard
- model-training
- experiment-tracking
- ml-experiments
- gpu-utilization
- hyperparameter-tuning
- model-registry
- mlflow
- wandb
category: ai-engineer/platform
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- ai-engineer
- ml-engineer
- engineer
- tech-lead
benefit: model training efficiency, experiment tracking quality, and GPU utilization visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- experiment tracking, training pipeline health, GPU utilization, model registry, hyperparameter optimization, and reproducibility defined
related:
- ./dashboard-ai-performance.md
- ./dashboard-llm-cost.md
- ./dashboard-ai-agent-observability.md
- ../data/dashboard-feature-store-health.md
- ../../engineer/engineering/dashboard-ml-operations.md
tacit: false
---

# model training and experiment tracking dashboard

> **As an** ML engineer, **I want to** track model training health and experiment quality, **so that** every experiment is tracked, every training run is reproducible, GPU resources are efficiently utilized, and model development is a measured, systematic, and continuously improving practice — not a notebook-driven guessing game.

> Training is where models are born. This dashboard tracks experiment tracking, training pipeline health, GPU utilization, model registry, hyperparameter optimization, and reproducibility — turning model development from "I ran something in a notebook and it worked" into a rigorous, auditable, and continuously improving ML engineering discipline.

## Summary

- 6 training dimensions: experiment tracking, training pipeline health, GPU utilization, model registry, hyperparameter optimization, reproducibility
- 1,850 experiments/year; 285 active models; 42 training pipelines; 8 GPU clusters (32 GPUs total); 4.2M GPU-hours/year
- Experiment tracking: 1,850 experiments tracked; 78% with complete metadata; 22% missing key params; 15% not reproducible; 8% duplicate experiments (same config, different run name)
- Training pipeline: 42 pipelines; 88% success rate; 12% failure rate (5% OOM, 3% data issue, 2% timeout, 2% other); avg training time: 4.5 hours; longest: 72 hours (LLM fine-tune)
- GPU utilization: 62% avg utilization; 28% idle (nights/weekends); 3.2× oversubscription peak; $285K/month GPU cost; $0.68/GPU-hour effective cost
- Dashboard reviewed weekly; training infrastructure review with ML engineering biweekly

## Core viewpoints

- An untracked experiment is wasted compute — if you can't reproduce the exact model that produced a 2% accuracy improvement, that improvement doesn't exist; every experiment that's not logged with all hyperparameters, data versions, and code versions is a donation to entropy
- GPU utilization is the most expensive metric you're not tracking — 62% utilization means 38% of your GPU budget is buying idle silicon; at $285K/month, that's $108K/month of idle GPUs — enough to fund 2 ML engineers
- The model registry is the single source of truth, not the notebook — a model in production whose training notebook was deleted 6 months ago is a time bomb; the registry must contain the model artifact, training data version, hyperparameters, metrics, and deployment status
- Hyperparameter optimization is a search problem, not a tuning problem — manually tweaking learning rate, batch size, and dropout based on intuition is 1950s statistics; Bayesian optimization, population-based training, and multi-fidelity optimization find better configurations in 10% of the time

## Key information

### 6-panel training overview

```
┌──────────────────────────────────────────────────────────────────┐
│  EXPERIMENT TRACKING                  │  TRAINING PIPELINE HEALTH              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Experiments/yr: 1,850   │   │  │  Pipelines: 42 active    │   │
│  │  Complete metadata: 78%  │   │  │  Success rate: 88%       │   │
│  │  Missing key params: 22% │   │  │  Failure rate: 12%       │   │
│  │  Not reproducible: 15%   │   │  │  OOM: 5% of failures     │   │
│  │  Duplicates: 8% (148)    │   │  │  Data issues: 3%         │   │
│  │  Tracked in MLflow: 85%  │   │  │  Avg training: 4.5 hrs   │   │
│  │  Experiment score: B(78) │   │  │  Pipeline score: B (78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  GPU UTILIZATION                      │  MODEL REGISTRY                        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  GPUs: 32 (8 clusters)   │   │  │  Registered models: 285  │   │
│  │  Avg utilization: 62%    │   │  │  In production: 52 (18%) │   │
│  │  Idle: 28% (night/wknd)  │   │  │  Staging: 38 (13%)       │   │
│  │  Peak oversub: 3.2×      │   │  │  Archived: 125 (44%)     │   │
│  │  Cost: $285K/mo          │   │  │  Experimental: 70 (25%)  │   │
│  │  Effective: $0.68/GPU-hr │   │  │  Models w/o owner: 18    │   │
│  │  GPU score: C+ (68)      │   │  │  Registry score: B (78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  HYPERPARAMETER OPTIMIZATION          │  REPRODUCIBILITY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  HPO runs/mo: 85         │   │  │  Reproducible: 85%       │   │
│  │  Manual tuning: 45%      │   │  │  Code versioned: 88%     │   │
│  │  Bayesian: 30%           │   │  │  Data versioned: 72%     │   │
│  │  Grid/random: 15%        │   │  │  Env pinned: 82%         │   │
│  │  Population-based: 10%   │   │  │  Seed set: 78%           │   │
│  │  Avg trials to optimum:  │   │  │  Full repro passed: 68%  │   │
│  │  85 (manual) vs 28 (auto)│   │  │  Repro score: C+ (68)    │   │
│  │  HPO score: B- (72)      │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Experiment tracking by project

| Project | Experiments/yr | Complete metadata | Missing params | Duplicates | Not reproducible | Tracking tool | Health |
|---|---|---|---|---|---|---|---|
| **YiVad RAG** | 420 | 85% | 8% | 5% | 10% | MLflow | A- (88) |
| **YiVad fine-tune** | 285 | 82% | 12% | 8% | 12% | W&B | B+ (85) |
| **YiAi agents** | 350 | 72% | 22% | 12% | 18% | MLflow | C+ (68) |
| **YiWeb recommendations** | 220 | 88% | 5% | 3% | 8% | W&B | A- (90) |
| **YiPet embeddings** | 185 | 75% | 18% | 8% | 15% | MLflow | B- (72) |
| **Search ranking** | 155 | 80% | 15% | 10% | 12% | W&B | B (78) |
| **Fraud detection** | 120 | 78% | 15% | 8% | 20% | Custom (no tracking) | C- (62) |
| **NLP pipeline** | 115 | 85% | 8% | 5% | 8% | MLflow | B+ (85) |
| **Overall** | **1,850** | **78%** | **22%** | **8%** | **15%** | | **B (78)** |

### Training pipeline health

| Pipeline | Runs/month | Success rate | Avg duration | Failure reasons | Data source | Framework | Health |
|---|---|---|---|---|---|---|---|
| **RAG embedding fine-tune** | 85 | 92% | 2.5 hrs | OOM (3%), data version mismatch (3%), timeout (2%) | Vector DB export | PyTorch + HF | A- (88) |
| **LLM fine-tune (7B)** | 28 | 85% | 18 hrs | OOM (8%), gradient explosion (5%), timeout (2%) | Curated dataset | PyTorch + DeepSpeed | B (78) |
| **LLM fine-tune (70B)** | 8 | 68% | 72 hrs | OOM (15%), hardware failure (10%), timeout (7%) | Curated dataset | PyTorch + FSDP | C- (62) |
| **Recommendation model** | 35 | 94% | 3.5 hrs | Data quality (4%), OOM (2%) | Feature store | TensorFlow | A- (90) |
| **Fraud detection** | 22 | 82% | 1.5 hrs | Data staleness (10%), schema change (8%) | Data warehouse | scikit-learn/XGBoost | C+ (68) |
| **Search ranking** | 18 | 90% | 4.0 hrs | OOM (5%), timeout (5%) | Feature store | PyTorch | B+ (85) |
| **Image/vision** | 12 | 88% | 8.5 hrs | OOM (8%), data corruption (4%) | S3 bucket | PyTorch | B (78) |
| **Other (15 pipelines)** | 85 | 85% | 2.2 hrs | Various | Various | Various | B- (72) |
| **Overall** | **293** | **88%** | **4.5 hrs** | **OOM (5%), data (3%), timeout (2%), other (2%)** | | | **B (78)** |

### GPU utilization by cluster

| GPU cluster | GPUs | Type | Avg utilization | Peak utilization | Idle (night/wknd) | Queue depth (avg) | Queue depth (peak) | Cost/month | Efficiency score |
|---|---|---|---|---|---|---|---|---|---|
| **prod-training-a** | 8 | A100-80GB | 72% | 95% | 22% | 3.5 jobs | 12 jobs | $85K | B+ (82) |
| **prod-training-b** | 8 | A100-80GB | 58% | 88% | 32% | 2.8 jobs | 8 jobs | $85K | C+ (68) |
| **research-a** | 4 | A100-40GB | 52% | 78% | 38% | 1.5 jobs | 5 jobs | $32K | C (65) |
| **research-b** | 4 | A100-40GB | 45% | 72% | 42% | 1.2 jobs | 4 jobs | $32K | D (58) |
| **inference-overflow** | 4 | A10G-24GB | 68% | 92% | 18% | 2.0 jobs | 6 jobs | $18K | B (78) |
| **fine-tune-special** | 2 | H100-80GB | 78% | 98% | 15% | 4.5 jobs | 15 jobs | $22K | A- (88) |
| **dev-sandbox** | 2 | A10G-24GB | 35% | 55% | 55% | 0.8 jobs | 3 jobs | $9K | F (38) |
| **Overall** | **32** | | **62%** | **92%** | **28%** | **2.5** | **8** | **$285K** | **C+ (68)** |

### GPU job scheduling efficiency

| Metric | Current | Target | Gap | Action |
|---|---|---|---|---|
| **Avg queue wait time** | 45 min | < 15 min | 30 min | Add preemption, priority scheduling, spot instances |
| **Job preemption rate** | 8% | < 5% | 3% | Checkpoint more frequently, add graceful preemption |
| **Checkpoint save interval** | 30 min (avg) | 5 min | 25 min | Implement automatic checkpointing, reduce I/O overhead |
| **Job priority inversion** | 12 incidents/mo | 0 | 12 | Add strict priority classes, prevent resource starvation |
| **Multi-GPU scaling efficiency** | 72% (8-GPU) | 85% | 13% | Optimize communication, gradient accumulation, FSDP tuning |
| **Spot/preemptible usage** | 15% | 40% | 25% | Add fault-tolerant training, checkpoint-resume, spot fleet |
| **Night/weekend utilization** | 38% (vs 82% daytime) | 65% | 27% | Schedule long-running jobs for off-peak, add elastic scaling |

### Model registry health

| Model stage | Count | % of total | With owner | With docs | With metrics | Avg age | Last updated | Action needed |
|---|---|---|---|---|---|---|---|---|
| **Production** | 52 | 18% | 52 (100%) | 48 (92%) | 52 (100%) | 8 months | < 30 days | 5 models need retraining (> 90 days stale) |
| **Staging** | 38 | 13% | 35 (92%) | 30 (79%) | 38 (100%) | 3 months | < 14 days | 3 models without owner, 8 without docs |
| **Experimental** | 70 | 25% | 52 (74%) | 38 (54%) | 62 (89%) | 2 months | < 30 days | 18 models without owner, 32 without docs |
| **Archived** | 125 | 44% | 85 (68%) | 45 (36%) | 88 (70%) | 14 months | > 90 days | 40 models without owner, cleanup candidates |
| **Overall** | **285** | **100%** | **224 (79%)** | **161 (56%)** | **240 (84%)** | | | **18 models without owner** |

### Hyperparameter optimization methods

| Method | % of HPO runs | Avg trials | Time to optimum | Compute cost | Best config found | Adoption trend |
|---|---|---|---|---|---|---|
| **Manual tuning** (engineer intuition) | 45% | 85 | 3 weeks | $12,500 | Suboptimal (local minimum) | Declining (-5%) |
| **Grid search** | 10% | 120 | 4 weeks | $18,000 | Good (within grid) | Declining (-3%) |
| **Random search** | 5% | 60 | 2 weeks | $9,000 | Better than grid (Bergstra) | Stable |
| **Bayesian optimization** (Optuna, Hyperopt) | 30% | 28 | 1 week | $4,200 | Near-optimal | Growing (+8%) |
| **Population-based training** (PBT) | 8% | 35 | 5 days | $3,800 | Near-optimal + adaptive | Growing (+5%) |
| **Multi-fidelity** (HyperBand, ASHA) | 2% | 45 | 3 days | $2,500 | Near-optimal (fast) | Growing (+2%) |
| **Overall** | **100%** | **68** | **2.5 weeks** | **$8,500** | | |

### Reproducibility checklist compliance

| Reproducibility requirement | Compliance | Impact if missing | Gap | Action |
|---|---|---|---|---|
| **Code version (git commit hash)** | 88% | Can't reproduce model with same code | 12% | Add git hash to experiment config, enforce in CI |
| **Data version (DVC/git-lfs hash)** | 72% | Can't reproduce with same data | 28% | Add data versioning to all pipelines, enforce DVC |
| **Environment pinned (conda-lock/requirements.txt)** | 82% | Dependency version mismatch | 18% | Add conda-lock to all projects, pin all dependencies |
| **Random seed set (all frameworks)** | 78% | Non-deterministic results | 22% | Add seed to experiment config, validate determinism |
| **Hyperparameters logged (all)** | 85% | Missing key hyperparameter | 15% | Auto-log all hyperparams, add schema validation |
| **Hardware config logged (GPU type, count)** | 92% | Can't reproduce performance | 8% | Auto-detect and log, add to experiment metadata |
| **Full reproducibility test passed** | 68% | Model not reproducible end-to-end | 32% | Add reproducibility test to CI, block registration on failure |
| **Overall** | **78%** | | | |

## Action recommendations

1. **GPU utilization improvement**: 62% avg, 28% idle, $108K/month wasted; implement elastic GPU scaling (spot + on-demand), add job scheduling with backfill, schedule long jobs for off-peak, target 75% utilization
2. **Experiment metadata completeness**: 22% missing key params, 15% not reproducible; enforce experiment schema (required: git hash, data version, all hyperparams, seed), add CI check before training, target 95% completeness
3. **LLM 70B fine-tune stability**: 68% success rate, 72-hour training vulnerable to hardware failure; implement automatic checkpointing every 30 min, add preemptible instance support, target 85% success rate
4. **Reproducibility enforcement**: 68% full reproducibility; add reproducibility test to model registry, block production deployment without reproducibility pass, target 90% reproducible
5. **Manual tuning reduction**: 45% of HPO is manual, costing 3× more compute and 3× more time; migrate to Bayesian optimization (Optuna), provide HPO templates, target < 20% manual tuning
6. **Duplicate experiment elimination**: 8% duplicates (148 experiments, $126K wasted); add experiment deduplication check (same config = same experiment), alert on duplicate, target < 2% duplicates
7. **Model registry cleanup**: 125 archived models, 40 without owner, 44% of registry; implement model lifecycle policy (auto-archive after 12 months, auto-delete after 24), assign owners to all models
8. **Dev-sandbox GPU reclamation**: 35% utilization, $9K/month largely idle; convert to spot instances, share with research clusters, implement time limits, or reduce to 1 GPU
9. **Fraud detection tracking**: Custom tracking, no standard tool, 20% not reproducible; migrate to MLflow/W&B, add experiment schema, add reproducibility test, target 90% reproducibility
10. **Weekly training infrastructure review**: review experiment tracking, training pipeline health, GPU utilization, model registry, HPO, and reproducibility with ML engineering



- The "I'll log it later" experiment → running a training job, seeing a promising result, and realizing you didn't set the random seed, log the hyperparameters, or version the data; that result is now a ghost — you'll chase it for 3 weeks and never reproduce it
- The GPU hoarding syndrome → reserving 8 GPUs for a job that uses 2 because "I might need them later"; GPU clusters are shared resources, not personal workstations — if you're not using 80% of your allocation, you should be using a smaller allocation
- The "let me just tweak one more thing" manual optimization → spending 3 weeks manually adjusting learning rate, batch size, and dropout, trying 85 configurations, and converging on a local minimum; Bayesian optimization would have found a better configuration in 28 trials and 1 week
- The model registry as a dumping ground → registering every experimental model without owner, documentation, or metrics; 125 archived models, 40 without owner — the registry becomes a graveyard where models go to be forgotten, not a catalog where models go to be discovered
- The "it works on my machine" reproducibility → training a model in a Jupyter notebook with 50 cells executed in a specific order, then wondering why it fails in production; a model that can't be reproduced from a single script is a model that can't be deployed, debugged, or improved

## Related

- Same class: [dashboard-ai-performance](dashboard-ai-performance.md) — AI performance
- Same class: [dashboard-llm-cost](dashboard-llm-cost.md) — LLM cost and efficiency
- Same class: [dashboard-ai-agent-observability](dashboard-ai-agent-observability.md) — AI agent observability
- Same class: [dashboard-feature-store-health](../data/dashboard-feature-store-health.md) — feature store health
- Same class: [dashboard-ml-operations](../../engineer/engineering/dashboard-ml-operations.md) — ML operations
- References: MLflow — *Experiment Tracking Guide*; Weights & Biases — *Experiment Management Best Practices*; NVIDIA — *GPU Utilization Optimization Guide*; Optuna — *Bayesian Optimization Framework*; Google — *Rules of ML*; DVC — *Data Versioning for ML*; Papers with Code — *Reproducibility Checklist*