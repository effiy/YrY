---

doc_type: test
title: "YA-09-213: RAG评估基准 — 标准测试查询与预期答案、自动化评估指标（忠实度/相关性/完整性/延迟）、RAG变更回归测试、基准历史追踪 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-213"
source_prds: ["213-需求-RAG评估基准"]
source_modules: ["213-prd-task-RAG评估基准"]
source_okr: [yiai-001]

type: test
---

# YA-09-213: RAG评估基准 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖基准用例管理、检索指标（Hit Rate/MRR/NDCG）、LLM-as-Judge 生成指标（忠实度/相关性/完整性）、回归检测、历史趋势、CI 集成。

> 来源 PRD：[213-需求-RAG评估基准.md](../../prds/2026-09/213-需求-RAG评估基准.md)
> 需求编号：YA-09-213 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | RetrievalEvaluator 指标计算、FaithfulnessEvaluator Prompt 模板、RegressionDetector 阈值判断 | 40% |
| 集成测试 | pytest + httpx | EvaluationRunner 全流程、YAML 用例加载、CI 快速回归（Top-10）、MongoDB 报告存储 | 40% |
| 质量评估 | 人工抽检 | LLM-as-Judge 评分与人工一致性（目标 > 85%） | 20% |

**测试目标**：检索指标（Hit Rate@3/5、MRR、NDCG@5）计算正确、LLM-as-Judge 评分 1-5 分合理、CI Top-10 < 2min、回归检测阈值可配置。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/benchmarks/rag/v1/baseline.yaml` 含 50+ 用例（覆盖事实型/推理型/聚合型/否定型/边缘 5 类），预期答案和关键词列表。

**前置条件**：YiAi RAG 引擎运行中，Ollama 可用（评估 LLM 独立于 RAG 生成 LLM），MongoDB `benchmark_results` 集合已创建。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | Hit Rate@3 计算 | 5 个候选文档，第 2/4 个相关 | 计算 hit_rate_at_3 | Hit Rate@3 = 1（前 3 个中 1 个命中） | P0 |
| 2 | MRR 计算 | 第一个相关文档在第 2 位 | 计算 mrr | MRR = 0.5（1/2） | P0 |
| 3 | NDCG@5 计算 | 相关文档在位置 2 和 4，相关性分数=2/1 | 计算 ndcg_at_5 | NDCG 在 [0, 1]，排序合理 | P1 |
| 4 | Faithfulness 评估（高分） | 答案中所有断言都能在上下文找到依据 | LLM-as-Judge 评分 | score >= 4, reason 描述具体 | P0 |
| 5 | Faithfulness 评估（低分） | 答案编造了检索上下文中不存在的信息 | LLM-as-Judge 评分 | score <= 2, reason 提及"无法验证" | P0 |
| 6 | Completeness 评估 | 答案覆盖 expected_keywords 中 4/5 个关键词 | 完整性评估器 | score >= 3 | P1 |
| 7 | YAML 用例加载异常处理 | baseline.yaml 含 Tab 缩进 | yaml.safe_load | 捕获 YAMLError 并给出行号和修复建议 | P1 |
| 8 | CI Top-10 快速回归 | Top-10 用例子集 | CI 模式运行 | 总耗时 < 2min，exit code 正确反映通过/失败 | P0 |
| 9 | 回归检测 | 上次 RAG-003 faithfulness=4.5, 本次=2.0 | 对比上次报告 | RAG-003 标记为回归，详情含前后分数 | P0 |
| 10 | LLM-as-Judge 不可用降级 | 评估 LLM 连续 3 次调用失败 | 执行评估 | 生成指标跳过，仅返回检索指标，报告标注降级原因 | P1 |
| 11 | 评估 LLM 与生成 LLM 同模型检测 | 两者均为 "qwen2.5:7b" | 检查模型名 | 报告标注"评估模型与生成模型相同，评分可能偏高" | P1 |
| 12 | 历史趋势查询 | 过去 7 天每日评估 | GET /benchmark/history?days=7 | 返回忠实度/相关性/完整性/延迟时间序列，标注退化日期 | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | YAML 文件不存在 | benchmark_path 指向不存在文件 | 返回明确错误信息，非 Python traceback |
| E2 | 单个用例 RAG 超时 | 用例查询执行 > 30s | 用例标记为 TIMEOUT（非 FAILED），继续下一个用例 |
| E3 | 评估 LLM 返回非法 JSON | LLM 返回纯文本而非 JSON | _parse_json_response 捕获异常，score 默认 3 |
| E4 | 空用例集运行 | YAML 中 cases 为空列表 | 返回空报告，不抛异常 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 评估一致性（多次评估标准差） | 同一查询评估 10 次，验证 faithfulness 标准差 < 0.3；如不稳定则降低评估 temperature=0 |
| R2 | expected_keywords 过时检测 | 评估后检查失败用例的 keywords，标记在检索上下文中完全不存在的关键词 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2, TC-3 | 场景 5: 检索指标计算 | retrieval.py |
| TC-4, TC-5 | 场景 4: LLM-as-Judge 忠实度评估 | faithfulness.py |
| TC-6 | 场景 1: 全量基准评估 | completeness.py |
| TC-7 | 回归预测 #4: YAML 格式错误 | runner.py |
| TC-8 | 场景 2: CI 快速回归通过 | runner.py, cli.py |
| TC-9 | 场景 3: 检测 RAG 回归 | runner.py, history.py |
| TC-10, TC-11 | 回归预测 #2: 自评偏差 + 降级 | runner.py |
| TC-12 | 场景 6: 历史趋势查看 | history.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 评估 LLM 与人工一致性统计验证 | 需 100+ 条人工标注数据 | P2 |
| CI 环境中 Ollama 不可用时的 skip 逻辑 | CI 环境差异，需实际 CI 验证 | P2 |
| 全量 50 用例的 RAG 性能基线 | 需稳定环境重复运行建立基线 | P3 |
| MongoDB benchmark_results 数据膨胀清理 | 需长期运行后验证 TTL 策略 | P3 |