---
doc_type: module
prd_task_id: "YA-09-09"
title: "YA-09-09: 检索基础体系 — 查询理解 + 预处理 + 结果增强 — 开发方案"
status: 已合并
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 6.3
source_prd: "01-需求-检索基础体系.md"
source_okr: [yiai-001]
related_tests: ["01-prd-test-检索基础体系"]
---

# YA-09-09: 检索基础体系 — 查询理解 + 预处理 + 结果增强 — 开发方案

> 来源 PRD：[01-需求-检索基础体系.md](../../prds/2026-09/01-需求-检索基础体系.md)
> 需求编号：YA-09-09 · 优先级：P2 · 人天：6.3d · 状态：已合并
> 测试方案：[01-prd-test-检索基础体系.md](../../tests/2026-09/01-prd-test-检索基础体系.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、数据流](#sec-4)
- [五、实施路线图](#sec-5)
- [六、代码审查检查清单](#sec-6)
- [七、技术风险与回归预测](#sec-7)
- [八、实现完成记录](#sec-8)
- [九、已知缺口与技术债](#sec-9)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 分层结构

系统化提升 RAG 检索质量，覆盖查询理解、预处理、结果增强三个环节。合并 21 个子需求，总计 6.3d。

```
查询进入
  → 查询理解层: 意图分类（factual/analytical/conversational）→ 实体识别（项目名/模块名/日期）
  → 预处理层: 拼写纠正 → 停用词过滤 → 同义词扩展（短语→词→图 BFS）→ HyDE 查询改写
  → 混合检索: 向量检索 + BM25 关键词检索（复用 YA-07-01）
  → 结果增强层: RRF 去重融合 → Cross-Encoder 重排序 → 高亮片段 → 摘要生成
  → LLM 生成（复用 chat_service）
```

### 1.2 文件清单

```
YiAi/src/
├── services/search/
│   ├── synonym_service.py          # 同义词扩展 + 词典管理 + 图查询 API
│   ├── enhance_service.py          # 结果增强 API（高亮/摘要/建议/知识卡片/分面）
│   └── query_service.py            # 查询理解 API（意图分类/实体识别/改写/模板）
├── domain/search/
│   ├── synonym/
│   │   ├── engine.py               # SynonymEngine: 同义词扩展核心
│   │   ├── dictionary.py           # SynonymDictionary: CRUD + 版本管理 + 导入导出
│   │   └── graph.py                # SynonymGraph: 图构建 + BFS 扩展 + 社区检测
│   ├── enhance/
│   │   ├── reranker.py             # CrossEncoderReranker: Ollama 推理封装
│   │   ├── dedup.py                # RRF 去重融合
│   │   ├── highlighter.py          # 关键词高亮 + 片段截断
│   │   ├── summarizer.py           # 抽取式/生成式摘要
│   │   ├── suggester.py            # 查询建议（日志/共现/点击）
│   │   ├── knowledge_card.py       # 知识卡片：实体摘要结构化
│   │   └── faceted.py              # 分面搜索：分面计数/筛选/排序
│   ├── query/
│   │   ├── intent_classifier.py    # LLM 意图分类（3 分类）
│   │   ├── entity_extractor.py     # NER 实体识别
│   │   ├── spellchecker.py         # 拼写纠正（编辑距离 + 上下文）
│   │   ├── stopwords.py            # 停用词管理（中文/英文/领域自定义）
│   │   ├── rewriter.py             # HyDE 查询改写
│   │   └── template.py             # 查询模板（参数填充 + CRUD）
│   ├── preprocessor.py             # 预处理管线编排（拼写→停用词→同义词→改写）
│   └── postprocessor.py            # 后处理管线编排（去重→重排序→高亮→摘要）
├── data/
│   ├── synonym_repository.py       # 同义词词典 MongoDB CRUD
│   ├── query_log_repository.py     # 查询日志 MongoDB CRUD
│   └── collections/
│       ├── synonym_dictionaries    # 同义词词典集合
│       └── query_logs              # 查询日志集合
└── shared/
    ├── synonym_types.py            # 同义词领域类型定义
    └── search_types.py             # 检索增强类型定义
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：同义词扩展 — 混合粒度（短语优先）

短语级同义词优先于词级扩展。使用最长匹配算法先匹配短语（"检索增强生成"→"RAG"），再对剩余词做词级扩展。避免"检索增强生成"被拆为"检索"+"增强"+"生成"三个单词分别扩展，导致组合爆炸。

### D-02：同义词图 BFS 扩展（2 跳限制）

从查询词节点出发 BFS 遍历最多 2 跳，路径权重 = ∏(边权重) × 衰减因子^(深度-1)。多路径取最大权重。同社区术语额外 +30% 权重。2 跳限制防止图遍历爆炸——同义词关系的传递性在 2 跳后急剧衰减。

### D-03：拼写纠正 — 编辑距离 + 上下文排序

编辑距离 1-2 生成候选，结合上下文（相邻词）重排序候选列表。避免仅依赖编辑距离导致不相关纠正（如 "jian" → "jian" vs "jian" → "件"需要上下文区分）。

### D-04：Cross-Encoder 重排序 — 仅前 10 候选

全量结果重排序延迟不可接受（100 候选 × 每对推理 100ms = 10s）。改为仅对混合检索 Top-10 候选进行 Cross-Encoder 精排，Top-10 以外的保持原始排序。MRR 提升效果集中在 Top-10（前 10 约占 90% 点击）。

### D-05：零结果降级链

```
原始查询 → 拼写纠正重试 → 同义词扩展放宽 → 部分匹配（至少 1 词）→ 返回查询建议
```

每级降级增加约 5-15% 延迟，整个降级链总延迟增加控制在 30% 以内。

### D-06：同义词词典 — 内存缓存 + 写入穿透

词典在 SynonymEngine 初始化时加载到内存（< 10ms），运行时查询无需访问 MDB。写入操作（CRUD）同步更新内存缓存 + MongoDB，保证一致性。内存缓存避免每次查询扩展时做 MDB 查询。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 SynonymEngine

```python
class SynonymEngine:
    """同义词扩展引擎 — 短语优先的混合粒度扩展"""

    def __init__(self, seed_file: str, max_expansions: int = 5):
        """加载 JSON 种子文件到内存词典"""

    async def expand(self, query: str, domain: str | None = None) -> list[ExpansionVariant]:
        """
        返回扩展变体列表，含权重。
        原始查询 weight=1.0，短语扩展 0.7，词扩展 0.7，组合扩展 0.7^n。
        去重截断至 max_expansions 个。
        """

class SynonymDictionary:
    """多领域同义词词典管理"""

    async def create(self, domain: str, entries: list[SynonymEntry]) -> str: ...
    async def get(self, domain: str) -> dict: ...
    async def add_entry(self, domain: str, entry: SynonymEntry) -> str: ...
    async def remove_entry(self, domain: str, term: str) -> None: ...
    async def import_dict(self, domain: str, format: str, data: bytes) -> ImportResult: ...
    async def export_dict(self, domain: str, format: str) -> bytes: ...
    async def rollback(self, domain: str, version: str) -> None: ...
    async def list_versions(self, domain: str) -> list[VersionInfo]: ...

class SynonymGraph:
    """同义词图 — BFS 查询扩展 + 社区检测"""

    def build(self, dictionaries: list[dict]) -> GraphBuildResult: ...
    def expand(self, term: str, max_hops: int = 2) -> list[GraphExpansion]: ...
    def detect_communities(self) -> list[Community]: ...
    def update_weights(self, cooccurrence_data: list[Cooccurrence]) -> None: ...
```

### 3.2 查询预处理管线

```python
class QueryPreprocessor:
    """查询预处理管线 — 顺序执行：拼写→停用词→同义词→改写"""

    def __init__(self, spellchecker, stopwords, synonym_engine, rewriter): ...

    async def preprocess(self, query: str, options: PreprocessOptions) -> PreprocessedQuery:
        """
        Returns:
            corrected_query: str       # 拼写纠正后
            filtered_tokens: list[str] # 停用词过滤后
            expansions: list[Variant]  # 同义词扩展变体
            rewritten_query: str|None  # HyDE 改写结果（可选）
        """
```

### 3.3 结果后处理管线

```python
class ResultPostprocessor:
    """结果后处理管线 — 顺序执行：去重→重排序→高亮→摘要"""

    async def postprocess(self, results: list[SearchResult], query: str,
                          options: PostprocessOptions) -> EnhancedResults:
        """
        Returns:
            deduped: list[SearchResult]       # RRF 去重融合后
            reranked: list[SearchResult]      # Cross-Encoder 重排序后（含 score）
            highlighted: list[SearchResult]   # 含 <em> 高亮片段
            summary: str | None               # 整体摘要（可选）
            suggestions: list[str]            # 查询建议（如零结果）
            knowledge_cards: list[KCard]      # 知识卡片（如匹配实体）
            facets: dict[str, FacetCount]     # 分面计数
        """
```

### 3.4 其余核心接口摘要

| 模块 | 关键方法 |
|------|---------|
| `IntentClassifier` | `classify(query) → {intent, confidence}`，LLM few-shot prompt，3 分类 |
| `EntityExtractor` | `extract(query) → [{entity, type, position}]`，规则 + LLM 混合 |
| `SpellChecker` | `correct(word, context?) → [{candidate, distance, score}]`，编辑距离 1-2 |
| `StopwordsManager` | `filter(tokens, domain?) → list[str]`，中文/英文/领域自定义 |
| `HyDERewriter` | `rewrite(query) → str`，LLM 生成假设文档嵌入 |
| `CrossEncoderReranker` | `rerank(query, candidates) → list[RankedResult]`，Ollama batch 推理 |
| `RRFDedup` | `dedup(vector_results, bm25_results) → list[SearchResult]`，k=60 |
| `Highlighter` | `highlight(doc, query) → [{field, snippet}]`，`<em>` 包裹关键词 |
| `Summarizer` | `summarize(doc, max_length?) → str`，抽取式（默认）/生成式 |
| `QuerySuggester` | `suggest(query, logs?) → list[str]`，日志共现/点击/编辑距离 |
| `KnowledgeCard` | `build(entity, docs) → KCard`，结构化实体摘要 |
| `FacetedSearch` | `compute(results, facet_fields) → dict[str, FacetCount]`，分面计数 + 筛选 |

---

<a id="sec-4"></a>
## 四、数据流

### 4.1 检索全管道

```
用户查询 "AI推理引擎性能优化"
  → QueryPreprocessor.preprocess():
      1. SpellChecker.correct(): 无拼写错误，跳过
      2. StopwordsManager.filter(): 无停用词，保留全部
      3. SynonymEngine.expand(): "AI推理引擎" → "Ollama模型服务"(0.7), "推理引擎"(0.7)
      4. IntentClassifier.classify(): factual (confidence 0.92)
      5. HyDERewriter.rewrite(): "如何优化大语言模型推理引擎的性能..."
  → 混合检索 (YA-07-01):
      向量检索(rewritten_query) + BM25(original_query + expansions)
  → ResultPostprocessor.postprocess():
      1. RRFDedup.dedup(): 向量 50 + BM25 50 → 去重融合 80
      2. CrossEncoderReranker.rerank(): Top-10 精排
      3. Highlighter.highlight(): 关键词高亮片段
      4. FacetedSearch.compute(): 按 category 分面
  → 返回 EnhancedResults
  → 写入 QueryLog（异步）
```

### 4.2 同义词词典写入流程

```
管理员 API 调用 → synonym_service → SynonymDictionary
  → 校验（domain 隔离、上限 1000、格式校验）
  → 写入 MongoDB synonym_dictionaries
  → 更新内存缓存（SynonymEngine 热更新）
  → 语义版本 bump
  → 返回新版本号
```

---

<a id="sec-5"></a>
## 五、实施路线图

### 阶段一：查询预处理核心（P1，约 2.0d）

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | SynonymEngine + 词典管理 | 扩展引擎 + CRUD + 导入导出 | 种子 50 对同义词加载，扩展延迟 < 5ms | 0.8 |
| 2 | 拼写纠正 + 停用词 | 编辑距离纠正 + 中/英停用词 | 常见拼写错误纠正率 > 90% | 0.4 |
| 3 | 意图分类 + 实体识别 | LLM few-shot 分类 + 规则 NER | 分类准确率 > 85% | 0.5 |
| 4 | 预处理管线编排 | `QueryPreprocessor` 流水线 | 单次预处理 < 600ms（含 LLM 调用） | 0.3 |

### 阶段二：结果增强（P1，约 2.0d）

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | RRF 去重融合 | `RRFDedup` + 融合权重可配置 | 100 结果去重 < 10ms | 0.3 |
| 2 | Cross-Encoder 重排序 | Ollama 推理封装 + batch 处理 | MRR 提升 ≥ 10%，10 候选 < 500ms | 0.5 |
| 3 | 高亮片段 + 摘要 | 关键词高亮 + 抽取式摘要 | 片段截断以词边界对齐 | 0.3 |
| 4 | 查询建议 + 零结果处理 | 建议生成 + 3 级降级链 | 零结果率降低 ≥ 30% | 0.4 |
| 5 | 后处理管线编排 | `ResultPostprocessor` 流水线 | 全后处理 < 800ms（含 Cross-Encoder） | 0.2 |
| 6 | 同义词图（BFS + 社区） | 图构建 + BFS 2 跳扩展 + Louvain | 图扩展 < 10ms | 0.3 |

### 阶段三：高级特性 + 评估（P2，约 2.3d）

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | HyDE 查询改写 | 假设文档生成 + 嵌入检索 | 召回率对比（含/不含 HyDE） | 0.5 |
| 2 | 查询模板系统 | 模板 CRUD + 参数填充 | 模板参数正确替换 | 0.3 |
| 3 | 知识卡片 + 分面搜索 | 实体卡片 + 分面计数/筛选 | 分面计数误差 < 1% | 0.5 |
| 4 | 评估基准构建 | 50 条标注查询 + 自动化回归 | 召回率/精确率/MRR 基线 | 0.5 |
| 5 | 查询日志基础设施 | 日志记录 + 隐私脱敏 + 查询 API | 异步写入不阻塞检索 | 0.3 |
| 6 | 集成测试 + 文档 | 全管道测试 + 本 DEV 文件 | pytest 全绿 | 0.2 |

**总计：6.3d**

---

<a id="sec-6"></a>
## 六、代码审查检查清单

### 同义词扩展

- [ ] `expand()` 去重截断至 `max_expansions`（默认 5）
- [ ] 短语优先匹配（最长匹配算法先于词级）
- [ ] 权重计算正确（原始 1.0、短语 0.7、词 0.7、组合 0.7^n）
- [ ] 词典加载 < 10ms（1000 对）
- [ ] 多领域隔离：查询 domain="tech" 不返回 domain="medical" 结果
- [ ] 导入导出格式正确（JSON/CSV）
- [ ] 版本回滚后词典内容正确恢复

### 同义词图

- [ ] BFS 最多 2 跳，权重衰减正确
- [ ] 社区检测模块度 > 0
- [ ] 图持久化 JSON 可读写

### 拼写纠正与停用词

- [ ] 编辑距离 1-2 候选生成正确
- [ ] 上下文排序生效（bm25 + 相邻词）
- [ ] 停用词过滤不区分大小写
- [ ] 领域自定义停用词叠加生效

### 结果增强

- [ ] Cross-Encoder 仅排序 Top-10 候选
- [ ] RRF 去重后无重复文档
- [ ] 高亮 `<em>` 标签无 XSS（用户输入不直接入 HTML）
- [ ] 摘要以词边界截断（非中截断）
- [ ] 零结果降级链每级尝试后才返回最终结果

### 性能

- [ ] 同义词扩展 < 5ms/查询
- [ ] 拼写纠正 < 5ms/词
- [ ] Cross-Encoder Top-10 < 500ms
- [ ] 全管道 < 2s（含 LLM）
- [ ] 零结果降级总延迟增加 < 30%

---

<a id="sec-7"></a>
## 七、技术风险与回归预测

### 7.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| 同义词种子数据质量低 | 中 | 高 | 人工审核 50 对核心种子 + LLM 辅助发现 | 仅启用人工验证过的种子 |
| Cross-Encoder 模型不可用 | 中 | 高 | 检测 Ollama 模型列表，无模型时跳过重排序 | 降级为 BM25 原始排序 |
| 同义词扩展增加检索延迟 > 30% | 中 | 中 | 内存缓存词典，扩展变体并行检索 | 限制 max_expansions=3 |
| 意图分类 LLM 调用超时 | 低 | 中 | 设置 2s 超时，超时回退默认策略（factual） | 默认 factual 策略 |
| 查询日志异步写入堆积 | 低 | 中 | `asyncio.create_task` 非阻塞写入，队列满时丢弃 | 丢弃日志不阻塞检索 |
| 同义词图 BFS 遍历爆炸 | 低 | 中 | 硬限制 max_hops=2 + 每层最多 20 邻居 | 回退 1 跳 |

### 7.2 回归问题预测

| # | 问题 | 触发场景 | 预防措施 |
|---|------|---------|---------|
| 1 | 同义词扩展后召回率反而下降 | 扩展引入噪音词导致 BM25 评分稀释 | 同义词权重 0.7 限制，AB 测试对比 |
| 2 | Cross-Encoder 重排序与原始排序矛盾 | 原始排序 Top-1 被重排到 Top-10 外 | 保留原始 rank 作为 fallback 排序依据 |
| 3 | 拼写纠正过度纠正领域术语 | "RAG" 被纠正为 "RAG" 以外的词 | 领域术语白名单（含缩写/专有名词） |
| 4 | HyDE 改写生成无关内容 | LLM 生成假设文档不包含原查询关键信息 | 检查改写结果与原查询的语义相似度 > 0.5 |

---

<a id="sec-8"></a>
## 八、实现完成记录

> **状态**：已合并至主分支（部分模块待实施，见 §九）
> **完成日期**：2026-09-10

### 8.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| Service 层 | 3 | `synonym_service.py`、`enhance_service.py`、`query_service.py` |
| Domain 层 | 12 | 同义词 3（engine/dictionary/graph）+ 增强 5（reranker/dedup/highlighter/summarizer/suggester）+ 查询 4（classifier/extractor/spellchecker/stopwords） |
| 管线编排 | 2 | `preprocessor.py`、`postprocessor.py` |
| 数据层 | 2 | `synonym_repository.py`、`query_log_repository.py` |
| 类型定义 | 2 | `synonym_types.py`、`search_types.py` |
| 测试 | — | 待实施（见测试方案阻塞项） |
| **合计** | **21** | |

---

<a id="sec-9"></a>
## 九、已知缺口与技术债

### 9.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | HyDE 查询改写 | 理论可提升召回率 5-10%，但 LLM 生成假设文档的稳定性待验证 | 未实现 | 阶段三实施，先小规模 AB 测试 |
| 2 | 查询模板系统 | 结构化查询场景（如定期报告查询）缺乏模板支持 | 未实现 | 阶段三实施 |
| 3 | 知识卡片 | 对已索引实体的聚合信息展示 | 未实现 | 阶段三实施，依赖实体识别就绪 |
| 4 | 查询日志基础设施 | 无法分析查询模式和评估检索质量 | 未实现，MDB `query_logs` 集合未创建 | 阶段三实施 |
| 5 | 评估基准（标注查询集） | 缺乏量化的检索质量基线 | 未建立，50 条人工标注查询待完成 | 与测试方案协同建立 |

### 9.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 同义词权重硬编码（原始 1.0/短语 0.7/词 0.7） | P2 | 0.3 | 权重未通过 AB 测试调优，可能需要按领域差异化 | 待实施 |
| 2 | Cross-Encoder batch size 固定 10 | P2 | 0.2 | 候选数变化时未能动态调整 batch，多查询并发可能 OOM | 待实施 |
| 3 | 拼写纠正词典冷启动 | P3 | 0.5 | 初始拼写错误→正确拼写对仅 50 对，覆盖不足 | 待补充（从查询日志自动发现） |
| 4 | 停用词列表为静态文件 | P3 | 0.2 | 领域特定停用词无法动态添加，需要重新部署 | 待实施（MDB 化） |
| 5 | 同义词图仅支持 JSON 持久化 | P3 | 0.3 | 图规模 > 10000 节点时 JSON 加载性能下降 | 待评估（Pickle/HDF5 备选） |
| 6 | 查询建议未利用用户点击反馈 | P3 | 0.5 | 当前仅基于日志共现，未利用点击率/停留时间信号 | 待实施 |

---