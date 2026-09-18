---
doc_type: module
prd_task_id: "YA-09-02"
title: "YA-09-02: 检索排序与优化 — 开发方案"
status: 已合并
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 5.7
source_prd: "02-需求-检索排序与优化.md"
source_okr: [yiai-001]
related_tests: ["02-prd-test-检索排序与优化"]
---

# YA-09-02: 检索排序与优化 — 开发方案

> 来源 PRD：[02-需求-检索排序与优化.md](../../prds/2026-09/02-需求-检索排序与优化.md)
> 需求编号：YA-09-02 · 19 个子需求 · 人天：5.7d · 状态：已合并
> 测试方案：[02-prd-test-检索排序与优化.md](../../tests/2026-09/02-prd-test-检索排序与优化.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、技术风险](#sec-6)
- [七、实现完成记录](#sec-7)
- [八、已知缺口与技术债](#sec-8)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 功能域

19 个子需求分为 4 个体系，总计 5.7d。

| 体系 | 子需求数 | 核心能力 | 人天 |
|------|---------|---------|------|
| 排序优化 | 7 | 可插拔重排器/LTR/个性化/时效性/字段加权/多目标优化/多样性 | 2.5 |
| 缓存策略 | 3 | 结果缓存/缓存预热/语义缓存 | 1.0 |
| 性能管理 | 5 | 性能剖析/质量报告/降级策略/延迟预算/慢查询 | 1.2 |
| 实验体系 | 4 | AB 测试/评估框架/指标采集/报告 | 1.0 |

### 1.2 文件清单

```
YiAi/src/
├── domain/search/
│   ├── reranker/
│   │   ├── base.py                  # BaseReranker 抽象基类
│   │   ├── cross_encoder.py         # CrossEncoderReranker（Ollama 推理）
│   │   ├── llm_reranker.py          # LLMReranker（few-shot prompt）
│   │   ├── rule_reranker.py         # RuleBasedReranker（新鲜度/权威性/偏好）
│   │   └── ensemble.py              # EnsembleReranker（加权融合）
│   ├── ranking/
│   │   ├── ltr.py                   # 学习排序（特征提取 + LightGBM 推理）
│   │   ├── personalization.py       # 个性化排序（用户画像 + 历史）
│   │   ├── time_decay.py            # 时效性衰减（指数/线性/高斯）
│   │   ├── field_weights.py         # 字段加权（title/body/tags 差异化）
│   │   ├── multi_objective.py       # 多目标优化（相关性+新鲜度+质量）
│   │   └── diversity.py             # MMR 多样性重排
│   ├── cache/
│   │   ├── result_cache.py          # LRU 结果缓存 + TTL
│   │   ├── cache_warmer.py          # 热点查询预热
│   │   └── semantic_cache.py        # 语义缓存（相似查询复用）
│   ├── performance/
│   │   ├── profiler.py              # 检索延迟剖析（分段计时）
│   │   ├── quality_reporter.py      # MRR/NDCG/Recall@K 定期报告
│   │   └── degradation.py           # 降级策略管理器
│   └── experiment/
│       ├── ab_test.py               # AB 测试分流 + 指标采集
│       └── evaluator.py             # 评估框架（标注数据集 + 指标计算）
└── services/search/
    └── ranking_service.py           # 排序优化 RPC API
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：可插拔重排器架构 — 策略模式

`BaseReranker` 定义 `rerank(query, documents) → ranked` 接口，4 种重排器独立实现。排序管道通过配置选择重排器组合（`reranker_chain: [cross_encoder, rule, ensemble]`），便于 AB 测试不同组合的效果。

### D-02：CrossEncoder 批量推理而非逐文档

Top-50 候选逐文档推理 = 50 次 LLM 调用 × 100ms = 5s。改为 multi-shot prompt：一次调用同时评估 10 个文档对，5 次批量推理完成 50 候选重排序，总延迟 < 500ms。

### D-03：MMR 多样性 — λ 可配置

MMR（Maximal Marginal Relevance）：`λ × relevance − (1−λ) × max_similarity_to_selected`。λ=1 时等价于纯相关性排序，λ=0 时最大多样性。默认 λ=0.7，可通过查询意图自动调整（事实查询 λ=0.9，探索查询 λ=0.5）。

### D-04：语义缓存 — embedding 相似度匹配

新查询与缓存 key（历史查询的 embedding）计算余弦相似度，> 0.95 时直接复用缓存结果（TTL 内）。比精确字符串匹配缓存命中率提升 3-5×（覆盖同义查询），额外延迟 < 5ms（embedding 计算）。

### D-05：降级策略 — 链式回退

```
CrossEncoder 重排 → 不可用 → 规则重排 → 不可用 → RRF 融合（无重排）→ 不可用 → BM25 only
```

每级降级延迟减少约 30-50%，质量损失控制在 5-10% MRR 内。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 可插拔重排器

```python
class BaseReranker(ABC):
    @abstractmethod
    async def rerank(self, query: str, documents: list[SearchResult],
                     top_k: int = 5) -> list[RankedResult]: ...

class CrossEncoderReranker(BaseReranker):
    def __init__(self, model: str = "bge-reranker-v2-m3", batch_size: int = 10): ...
    async def rerank(self, query, documents, top_k=5) -> list[RankedResult]: ...

class LLMReranker(BaseReranker):
    def __init__(self, model: str = "qwen2.5", prompt_template: str | None = None): ...
    # 使用 few-shot prompt 让 LLM 对文档打分 0-10

class RuleBasedReranker(BaseReranker):
    def __init__(self, rules: list[RankingRule]): ...
    # 内置规则: FreshnessRule(衰减函数), AuthorityRule(来源权重), PreferenceRule(用户历史)

class EnsembleReranker(BaseReranker):
    def __init__(self, rerankers: list[tuple[BaseReranker, float]]): ...
    # weights: [(CrossEncoder, 0.5), (LLM, 0.3), (Rule, 0.2)]
```

### 3.2 排序优化

```python
# 学习排序 (LTR)
class LTRRanker:
    def __init__(self, model_path: str): ...  # LightGBM 模型
    def extract_features(self, query: str, doc: SearchResult) -> np.ndarray:
        """46 维特征: BM25 score, vector similarity, doc length, freshness,
        field match counts, readability score, citation count, click rate..."""
    def rank(self, query: str, documents: list[SearchResult]) -> list[RankedResult]: ...

# MMR 多样性
def mmr_rerank(documents: list[RankedResult], lambda_: float = 0.7,
               k: int = 10) -> list[RankedResult]:
    """贪心选择：每次选 MMR 得分最高的未选中文档"""

# 时效性衰减
class TimeDecay:
    FUNCTIONS = {"exponential": lambda t, hl: exp(-t * ln(2) / hl),
                 "linear": lambda t, max_t: 1 - t/max_t,
                 "gaussian": lambda t, sigma: exp(-t² / (2*sigma²))}
```

### 3.3 缓存

```python
class ResultCache:
    def __init__(self, max_size: int = 1000, default_ttl: int = 300): ...  # 5min TTL
    async def get(self, query: str, filters: dict) -> CachedResult | None: ...
    async def set(self, query: str, filters: dict, result: list, ttl: int | None = None): ...
    def invalidate(self, file_path: str): ...  # 文件变更时失效相关缓存

class SemanticCache(ResultCache):
    async def get_similar(self, query_embedding: np.ndarray,
                          threshold: float = 0.95) -> CachedResult | None: ...
```

### 3.4 性能与实验

```python
class SearchProfiler:
    def profile(self, query: str) -> ProfileReport:
        """分段计时: embedding → BM25 → RRF → rerank → format → total"""

class DegradationManager:
    async def get_active_strategy(self) -> RerankerChain:
        """基于当前延迟/错误率自动选择降级链"""

class ABTest:
    async def assign(self, user_id: str, experiment_id: str) -> str: ...
    async def record_metric(self, experiment_id: str, variant: str,
                            metric: str, value: float): ...
```

---

<a id="sec-4"></a>
## 四、实施路线图

### 阶段一：核心重排序（P2，约 2.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| BaseReranker + CrossEncoderReranker | `base.py` + `cross_encoder.py`（批量推理，<500ms） | 0.8 |
| LLMReranker + RuleBasedReranker | `llm_reranker.py` + `rule_reranker.py` | 0.5 |
| EnsembleReranker（加权融合） | `ensemble.py` | 0.3 |
| 字段加权 + 时效性衰减 | `field_weights.py` + `time_decay.py` | 0.4 |
| MMR 多样性重排 | `diversity.py` | 0.3 |
| RPC 封装 | `ranking_service.py` | 0.2 |

### 阶段二：缓存 + 性能（P2，约 1.7d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 结果缓存（LRU + TTL + 失效） | `result_cache.py` | 0.4 |
| 语义缓存（embedding 相似度） | `semantic_cache.py` | 0.3 |
| 缓存预热（热点查询） | `cache_warmer.py` | 0.2 |
| 性能剖析（分段计时） | `profiler.py` | 0.3 |
| 降级策略管理器 | `degradation.py` | 0.3 |
| 质量报告（MRR/NDCG/Recall@K） | `quality_reporter.py` | 0.2 |

### 阶段三：实验 + LTR（P2，约 1.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| AB 测试框架 | `ab_test.py` | 0.4 |
| 评估框架（标注数据集 + 指标） | `evaluator.py` | 0.3 |
| 学习排序（LightGBM 特征提取+推理） | `ltr.py` | 0.5 |
| 个性化排序 | `personalization.py` | 0.3 |

**总计：5.7d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

- [ ] CrossEncoder batch size=10，50 候选 5 次批量推理 < 500ms
- [ ] MMR λ=0.7 默认，查询意图自适应调整
- [ ] 语义缓存命中相似度阈值 0.95，命中延迟 < 5ms
- [ ] 结果缓存 TTL 默认 300s，文件变更时关联缓存失效
- [ ] 降级链：CrossEncoder → Rule → RRF → BM25，延迟/质量梯度控制
- [ ] 性能剖析分段计时误差 < 1ms
- [ ] AB 测试分流一致性（相同 user_id → 相同 variant）

---

<a id="sec-6"></a>
## 六、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| CrossEncoder 模型不可用 | 中 | 高 | 降级到规则重排 | 跳过重排，直接返回 RRF 结果 |
| 语义缓存 embedding 模型不一致 | 低 | 中 | 缓存键含 embedding 模型版本 | 版本不匹配时重建缓存 |
| LTR 模型过拟合 | 中 | 中 | 训练集/验证集分离，定期重训 | 回退到规则重排 |
| 结果缓存内存溢出 | 低 | 中 | LRU 淘汰 + max_size=1000 | 动态缩减 max_size |

---

<a id="sec-7"></a>
## 七、实现完成记录

> **状态**：已合并至主分支
> **完成日期**：2026-09-10

### 7.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 重排器 | 5 | base + cross_encoder + llm + rule + ensemble |
| 排序优化 | 6 | ltr + personalization + time_decay + field_weights + multi_objective + diversity |
| 缓存 | 3 | result_cache + cache_warmer + semantic_cache |
| 性能 | 3 | profiler + quality_reporter + degradation |
| 实验 | 2 | ab_test + evaluator |
| Service | 1 | ranking_service |
| **合计** | **20** | |

---

<a id="sec-8"></a>
## 八、已知缺口与技术债

### 8.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | 学习排序模型训练管道 | LightGBM 模型需离线训练，无自动重训管道 | 人工训练 + 手动部署 | CI/CD 模型训练 pipeline |
| 2 | 个性化排序需要用户画像基础设施 | 用户画像（阅读历史/领域偏好/点击率）未建立 | 未实现 | 依赖用户行为采集基础设施 |

### 8.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | CrossEncoder batch size 硬编码 10 | P3 | 0.1 | 未根据文档长度动态调整 batch | 待实施（配置化） |
| 2 | LTR 特征提取未缓存 | P2 | 0.3 | 每次排序重算 46 维特征，50 候选 × 46 feat 耗时 | 待实施（特征缓存） |
| 3 | 质量报告无可视化仪表盘 | P3 | 0.5 | MRR/NDCG 指标仅日志输出 | 待实施（Grafana 面板） |
| 4 | AB 测试无统计学显著性检验 | P3 | 0.2 | 仅返回均值差异，无 p-value/置信区间 | 待实施（scipy t-test） |

---