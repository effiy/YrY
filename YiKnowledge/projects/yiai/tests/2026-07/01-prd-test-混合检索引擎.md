---
doc_type: test
title: "YA-07-01: 混合检索引擎 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YA-07-01"
source_prds: ["01-需求-混合检索引擎"]
source_modules: ["01-prd-task-混合检索引擎"]
source_okr: [yiai-001]
---

# YA-07-01: 混合检索引擎 — 测试规格

> 来源 PRD：[01-需求-混合检索引擎.md](../../prds/2026-07/01-需求-混合检索引擎.md)
> 开发方案：[01-prd-task-混合检索引擎.md](../../devs/2026-07/01-prd-task-混合检索引擎.md)
> 需求编号：YA-07-01 · 优先级：P0 · 人天：3.0d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。覆盖向量检索、BM25 关键词检索、RRF 融合、LLM Rerank、引用编号、流式对话等核心能力。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、准入与准出标准](#sec-3)
- [四、单元测试 — 检索引擎](#sec-4)
- [五、单元测试 — RRF 融合与 Rerank](#sec-5)
- [六、集成测试 — RPC 契约](#sec-6)
- [七、集成测试 — 检索管道端到端](#sec-7)
- [八、性能验收测试](#sec-8)
- [九、缺陷分级](#sec-9)
- [十、自动化现状](#sec-10)

---

<a id="sec-1"></a>
## 一、测试范围与目标

### 1.1 在范围内

| 组件 | 关键测试点 |
|------|----------|
| 向量检索 | embedding 模型调用、top_k 返回数、语义匹配准确性 |
| BM25 检索 | 分词、TF-IDF 评分、关键词精确匹配 |
| QueryFusionRetriever | 向量+BM25 并行检索、结果数配置 |
| RRF 融合 | 去重、排名加权（k=60）、融合排序 |
| LLM Rerank | 选中文档重排序、MRR 提升 |
| NumberSourcesPostprocessor | `[Source N]` 引用标记、编号一致性 |
| 流式对话 | SSE 流式输出、首字节延迟、引用块注入 |
| 索引管理 | 全量构建、增量更新、索引持久化 |

### 1.2 不在范围内

| 排除项 | 原因 |
|--------|------|
| Embedding 模型精度评估 | 属模型选型范围 |
| 知识库扫描（KnowledgeWatcher） | 独立模块测试 |
| 查询理解/同义词扩展 | 属 YA-09-09 检索基础体系 |

---

<a id="sec-2"></a>
## 二、测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | RRF 融合算法、引用编号逻辑、检索结果去重 | 30% |
| 集成测试 | pytest + httpx + Ollama | 全检索管道（向量+BM25+融合+Rerank）、流式对话 SSE、索引管理 | 50% |
| 性能测试 | pytest-benchmark | 检索延迟、融合耗时、索引构建时间 | 15% |
| 端到端 | 手动验证 | 完整 RAG 问答场景 | 5% |

---

<a id="sec-3"></a>
## 三、准入与准出标准

### 3.1 准入门槛

| 条件 | 判定 |
|------|------|
| MongoDB 运行，`knowledge_files` 集合有 ≥ 50 条索引记录 | MDB 查询 |
| Ollama 运行，embedding 模型已加载 | `ollama list` |
| llama_index 向量索引已构建 | `data/rag_store/` 存在 |
| pytest 可执行 | `python -m pytest --version` |

### 3.2 准出标准

| 条件 | 阈值 |
|------|------|
| 全部单元测试通过 | 100% |
| 全部集成测试通过 | 100% |
| 混合检索 MRR（vs 纯向量） | ≥ 10% 提升 |
| LLM Rerank MRR（vs 无 Rerank） | ≥ 5% 提升 |
| 检索延迟（Top-20） | < 500ms |
| 流式对话首字节 | < 1s |
| RRF 融合后无重复文档 | 100% |

---

<a id="sec-4"></a>
## 四、单元测试 — 检索引擎

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-VS-01 | 向量检索返回 top_k | 查询"权限系统设计"，top_k=10 | 返回 ≤ 10 个结果，按相似度降序 |
| UT-VS-02 | 向量检索：空查询 | 空字符串 | 返回空列表，不报错 |
| UT-VS-03 | 向量检索：无匹配文档 | 查询不存在的术语 | 返回空列表（或低相似度结果） |
| UT-BM-01 | BM25 关键词检索 | 查询"RBAC ABAC" | 含 "RBAC" 或 "ABAC" 的文档排名靠前 |
| UT-BM-02 | BM25：停用词不影响评分 | 查询"如何进行检索" | "如何""进行"被过滤，"检索"权重高 |
| UT-BM-03 | BM25：精确匹配 > 部分匹配 | 查询"RAG" vs 文档含"RAG" 和 文档含"检索增强生成" | 完全匹配 "RAG" 的文档得分更高 |
| UT-IX-01 | 索引全量构建 | 50 个测试文档 | 索引文件生成，文档数 = 50 |
| UT-IX-02 | 增量索引更新 | 新增 1 个文档后 rebuild | 索引文档数 = 51 |
| UT-IX-03 | 索引持久化 | 构建后重启进程再加载 | 检索结果一致（持久化→加载 无信息丢失） |

---

<a id="sec-5"></a>
## 五、单元测试 — RRF 融合与 Rerank

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-RF-01 | RRF 去重 | 向量 Top-10 + BM25 Top-10，3 个重复文档 | 融合后 ≤ 17 个唯一文档 |
| UT-RF-02 | RRF 排名加权 | 文档 A 在向量排第 1，BM25 排第 5 | 融合后排名高于 仅在 BM25 排第 1 的文档 |
| UT-RF-03 | RRF k 值影响 | k=60（默认） | 排名差异 < k=600 |
| UT-RF-04 | RRF 空结果 | 向量返回空，BM25 返回 10 个 | 返回 BM25 的 10 个（不崩） |
| UT-RF-05 | 双向为空 | 向量和 BM25 均返回空 | 返回空列表 |
| UT-RR-01 | LLM Rerank Top-5 | 融合后 Top-20 → Rerank Top-5 | 返回恰好 5 个结果 |
| UT-RR-02 | Rerank 排序提升 | 含关键词的文档在 Rerank 后排名提升 | 排名变化 > 0（重排序生效） |
| UT-RR-03 | Rerank 不可用时降级 | Ollama 不可用 | 跳过 Rerank，返回融合结果 |
| UT-SR-01 | `[Source N]` 编号 | 5 个检索结果 | 编号连续：`[Source 1]` ~ `[Source 5]` |
| UT-SR-02 | 引用编号一致性 | 上下文中的 `[Source N]` vs 来源列表 | N 与来源列表索引一一对应 |
| UT-SR-03 | 引用格式 | `[Source N]` 标记 | 格式 `<sup>[Source N]</sup>` 或等价标记 |

---

<a id="sec-6"></a>
## 六、集成测试 — RPC 契约

| 编号 | RPC 方法 | 场景 | 预期 |
|------|---------|------|------|
| IT-QY-01 | `rag_service.rag_query` | 标准查询"权限系统设计" | 返回 `{answer, sources[{file, score, snippet}]}` |
| IT-QY-02 | `rag_service.rag_query` | 无结果查询 | 返回空 sources + 通用 answer |
| IT-QY-03 | `rag_service.rag_chat_stream` | SSE 流式对话 | 事件类型：`token`/`sources`/`done`，首字节 < 1s |
| IT-QY-04 | `rag_service.rag_file_query` | 限定文件范围检索 | 仅返回指定文件内的结果 |
| IT-QY-05 | `rag_service.rag_file_chat_stream` | 限定文件的流式对话 | sources 仅含指定文件 |
| IT-IX-01 | `rag_service.rebuild_index` | 触发索引重建 | 返回重建状态 + 文档数 |
| IT-IX-02 | `rag_service.get_index_stats` | 查询索引统计 | 返回 `{total_docs, total_chunks, last_built}` |

---

<a id="sec-7"></a>
## 七、集成测试 — 检索管道端到端

| 编号 | 场景 | 流程 | 验证点 |
|------|------|------|--------|
| IT-E2E-01 | 标准 RAG 问答 | 查询 → 混合检索 → RRF 融合 → Rerank → LLM 生成 | answer 含检索上下文引用，sources 非空 |
| IT-E2E-02 | 关键词精确匹配 | 查询"RBAC 权限模型" | BM25 结果含精确包含"RBAC"的文档 |
| IT-E2E-03 | 语义匹配 | 查询"身份验证机制" | 向量结果含"JWT 认证""OAuth2 配置"等语义相关文档 |
| IT-E2E-04 | 引用溯源 | 查看 sources 列表 | 每个 source 可追溯（file 路径可访问，snippet 在原文中存在） |
| IT-E2E-05 | SSE 流式完整度 | 流式对话完整过程 | tokens 顺序接收，sources 在第一个 token 前发送，done 事件收尾 |

---

<a id="sec-8"></a>
## 八、性能验收测试

| 编号 | 场景 | 目标 | 采集方式 |
|------|------|------|------|
| PT-01 | 向量检索（50K chunks，Top-20） | < 100ms | `pytest-benchmark` |
| PT-02 | BM25 检索（50K chunks，Top-20） | < 50ms | `pytest-benchmark` |
| PT-03 | RRF 融合（20+20 → 去重） | < 5ms | `pytest-benchmark` |
| PT-04 | LLM Rerank（20→5） | < 1s | Ollama 推理时间 |
| PT-05 | 全管道（检索+融合+Rerank，不含 LLM 生成） | < 500ms | 计时 |
| PT-06 | SSE 流式首字节 | < 1s | 首个 SSE 事件时间 |
| PT-07 | 索引全量构建（800 文档） | < 2min | 构建完成时间 |
| PT-08 | 增量索引更新（1 文档） | < 5s | 增量 rebuild 时间 |

---

<a id="sec-9"></a>
## 九、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 检索引擎不可用 | `rag_query` 对所有请求 500、索引构建崩溃 |
| S1 — 严重 | 检索质量严重下降 | RRF 融合去重失败导致重复结果、Rerank 后排序完全反向 |
| S2 — 一般 | 单个检索器异常 | BM25 对中文分词错误、向量检索对 OOV 词返回空 |
| S3 — 轻微 | 边界情况 | sources 超过 20 个时引用编号溢出、空查询 SSE 无 done 事件 |
| S4 — 建议 | 优化 | RRF k 值可配置化、Rerank batch size 调优 |

---

<a id="sec-10"></a>
## 十、自动化现状

| 模块 | 状态 | 用例数 | 说明 |
|------|------|--------|------|
| 向量/BM25 检索 | ✅ 已完成 | pytest 76 个测试的一部分 | 已有覆盖 |
| RRF 融合 | ✅ 已完成 | 同上 | 纯函数 |
| LLM Rerank | ✅ 已完成 | 同上（mock LLM） | mock 模式 |
| 引用编号 | ✅ 已完成 | 同上 | 纯函数 |
| RPC 契约集成 | ✅ 已完成 | 7 | httpx + 真实 MDB |
| E2E 管道 | ✅ 已完成 | 5 | 含 SSE 验证 |
| 性能基准 | 待扩展 | 需 pytest-benchmark | 部分已覆盖 |

> 混合检索引擎是 YiAi 测试覆盖率最高的模块之一 — 核心路径已自动化。性能基准测试待补充 pytest-benchmark 集成。

---