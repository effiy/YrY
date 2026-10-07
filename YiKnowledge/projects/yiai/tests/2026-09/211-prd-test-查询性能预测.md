---

doc_type: test
title: "YA-09-211: 查询性能预测 — 预检索查询性能预测、检索结果质量预估、查询改写建议、置信度评分、历史查询性能数据库 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-211"
source_prds: ["211-需求-查询性能预测"]
source_modules: ["211-prd-task-查询性能预测"]
source_okr: [yiai-001]

type: test
---

# YA-09-211: 查询性能预测 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖启发式评分、LLM后备评估、改写建议生成、后检索评估、历史数据存储。

> 来源 PRD：[211-需求-查询性能预测.md](../../prds/2026-09/211-需求-查询性能预测.md)
> 需求编号：YA-09-211 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | HeuristicScorer 四维度评分、QueryClassifier 分类、PostRetrievalEvaluator 后评分 | 50% |
| 集成测试 | pytest + httpx | RPC 入口 `query_quality_service`、LLM后备评估触发、改写建议 API | 30% |
| 数据验证 | pytest + motor | `query_performance` 集合 CRUD、TTL索引、哈希去重 | 20% |

**测试目标**：启发式评分 < 5ms、LLM后备仅边界触发 (< 25%)、改写建议 2-3 条、后评分与预评分相关性 > 0.5。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/query_quality/` 下 30 条典型查询（10 条高质量、10 条边界、10 条低质量），含人工标注的预期评分和类别。

**前置条件**：YiAi 服务运行中，MongoDB `query_performance` 集合已创建 TTL 索引（90天），Ollama 运行（用于 LLM 后备评估，可 mock）。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 高质量查询评分 | query = "Kubernetes Pod Pending 状态如何排查和解决" | 调用 HeuristicScorer.score() | overall_score > 0.7, label in [GOOD, EXCELLENT], category = TROUBLESHOOTING | P0 |
| 2 | 低质量查询评分 | query = "那个东西怎么用" | 调用 HeuristicScorer.score() | overall_score < 0.4, label = POOR, specificity < 0.3 | P0 |
| 3 | 极短查询惩罚 | query = "bug" (长度 3) | 调用 HeuristicScorer.score() | overall_score < 0.3（长度 < 5 额外 0.5x 惩罚） | P1 |
| 4 | 模糊词减分 | query = "那个东西出错了怎么办" | 检查 VAGUE_WORDS 匹配 | specificity < 0.5（"东西" + "出错了" 各扣 0.15） | P1 |
| 5 | 专有名词加分 | query = "Kubernetes Ingress Controller 配置" | 检查 entity 检测 | has_entity = True, specificity > 0.6 | P1 |
| 6 | 查询分类正确性 | queries 覆盖 6 种类型 | 调用 classify() | factual/procedural/conceptual/comparative/troubleshooting/other 各正确分类 | P0 |
| 7 | LLM 后备评估触发 | query 启发式评分 = 0.45（边界区间） | 综合评分流程 | SemanticScorer 被调用，如仍不确定则 LLMBackupScorer 被调用 | P1 |
| 8 | LLM 后备不触发 | query 启发式评分 = 0.85（高分跳过） | 综合评分流程 | LLMBackupScorer 未被调用，llm_used = False | P1 |
| 9 | 改写建议生成 | query = "报了错怎么办" | 调用 RewriteSuggester.suggest() | 返回 2-3 个建议，每个含 rewritten_query + improvement + score_improvement | P0 |
| 10 | 改写建议 LLM 失败降级 | LLM 服务不可用 | 调用 RewriteSuggester.suggest() | 返回空列表 []，不抛异常 | P1 |
| 11 | 后检索评估 | 8 个结果，top=0.92, avg=0.65 | 调用 PostRetrievalEvaluator.evaluate() | post_score > 0.6, diversity_score 在 [0, 1] | P0 |
| 12 | 历史记录写入与去重 | 两次相同查询 | 查看 query_performance 集合 | 同一查询哈希不重复插入，pre_score 和 post_score 均记录 | P0 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 空字符串查询 | query = "" | overall_score = 0, label = POOR, 不抛异常 |
| E2 | 超长查询 | query 长度 5000 字符 | 正常评分，耗时 < 10ms，不 OOM |
| E3 | idf_scores = None | score() 不传 idf 参数 | answerability 使用默认值 0.5，不抛异常 |
| E4 | 改写建议 gain 越界 | LLM 返回 gain = -0.5 或 gain = 2.0 | clamp(gain, 0.0, 1.0)，低于 0.1 的建议过滤 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | `_score_focus` 误判"所有"关键词 | 测试 query="列出所有支持的数据库类型"，验证 focus > 0.4（"所有"在此处是精确限定词非范围指示词） |
| R2 | entity 检测误判普通英文单词 | 测试 query="Hello World 程序"，验证 has_entity = False（"Hello" 和 "World" 是普通词非命名实体） |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2 | 场景 1-2: 高/低质量评分 | heuristic_scorer.py |
| TC-3, TC-4, TC-5 | 场景 1: 评分维度分解 | heuristic_scorer.py |
| TC-6 | N/A (质量分类) | heuristic_scorer.py |
| TC-7, TC-8 | 场景 4: 混合评分策略 | query_quality_service.py |
| TC-9, TC-10 | 场景 3: 改写建议生成 | rewrite_suggester.py |
| TC-11 | 场景 5: 后检索评估 | post_retrieval_evaluator.py |
| TC-12 | 场景 6: 重复查询优化 | query_performance_repo.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| LLM 后备评估的 Prompt 质量验证 | 依赖 LLM 输出，无客观评分标准 | P2 |
| 大规模查询的 IDF 字典构建 | 需实际知识库数据，单元测试难以覆盖 | P2 |
| 改写建议质量人工评估 | 需领域专家判断，自动化无法替代 | P3 |
| 自适应阈值优化效果 | 需 90 天运行数据，短期无法验证 | P3 |