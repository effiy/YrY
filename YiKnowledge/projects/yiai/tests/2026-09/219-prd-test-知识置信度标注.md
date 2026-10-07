---

doc_type: test
title: "YA-09-220: 知识置信度标注 — 知识库事实置信度分级标注，来源归因，置信度可视化，低置信度事实审核队列 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-220"
source_prds: ["219-需求-知识置信度标注"]
source_modules: ["219-prd-task-知识置信度标注"]
source_okr: [yiai-001]

type: test
---

# YA-09-220: 知识置信度标注 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 4 级置信度标注（verified/likely/uncertain/disputed）、LLM 自动预标注、来源归因（URL 分类）、审核队列、RAG 检索加权。

> 来源 PRD：[219-需求-知识置信度标注.md](../../prds/2026-09/219-需求-知识置信度标注.md)
> 需求编号：YA-09-220 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | AutoConfidenceAnnotator LLM 预标注、SourceAttributor URL 分类、ReviewQueueManager 状态机 | 40% |
| 集成测试 | pytest + httpx | RPC 标注 API、审核流转（approve/reject/modify）、RAG 检索置信度加权 | 40% |
| 数据验证 | pytest + motor | knowledge_files 新增字段、confidence_reviews 集合 | 20% |

**测试目标**：4 级置信度分类准确率 > 80%（LLM 自动）、来源归因 URL 分类正确、审核队列状态机完整、RAG 加权 verified*1.2 / uncertain*0.9。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/confidence/` 下 20 篇模拟文档（官方文档/博客/论坛/个人经验 各 5 篇），含 frontmatter 来源信息。

**前置条件**：MongoDB `knowledge_files` 已含 confidence 字段默认值，`confidence_reviews` 集合已创建，Ollama 可用（用于 LLM 预标注）。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 官方文档自动预标注 | content=Python 官方 asyncio 文档 | 调用 annotate() | level=verified, score >= 0.8, reasoning 含"权威来源" | P0 |
| 2 | 个人博客自动预标注 | content=Docker 个人部署经验 | 调用 annotate() | level=uncertain/likely, score < 0.7 | P0 |
| 3 | low confidence 进入审核队列 | level=uncertain/disputed | 提交审核 | ReviewTask 创建，status=pending，queue stats pending +1 | P0 |
| 4 | curator 审核通过 | task_id pending, final_level=likely | approve() | status=approved, knowledge_files confidence 更新 | P0 |
| 5 | curator 审核驳回 | task_id pending, note="标注正确" | reject() | status=rejected, confidence 不更新 | P1 |
| 6 | curator 审核修改 | task_id pending, new_level=likely | modify(new_level) | status=modified, final_level=likely | P1 |
| 7 | 来源归因 URL 分类 | source_url="https://docs.python.org/3/" | extract_from_frontmatter | source_type=official_doc | P0 |
| 8 | 来源归因论坛识别 | source_url="https://stackoverflow.com/q/123" | extract_from_frontmatter | source_type=forum | P1 |
| 9 | RAG 检索置信度加权 | verified doc score=0.85, uncertain doc score=0.80 | 应用权重 | verified weighted=1.02 > uncertain weighted=0.72 | P0 |
| 10 | frontmatter 手动标注优先 | frontmatter confidence=verified | annotate() | 直接返回 verified, auto=False, 不调用 LLM | P0 |
| 11 | LLM 预标注失败降级 | LLM 服务不可用 | annotate() | 返回 level=uncertain, score=0.4, auto=True | P1 |
| 12 | 审核队列统计 API | 各种状态的任务 | GET /confidence/review-stats | 返回 pending/approved/rejected/modified 各状态计数 | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | LLM 返回非法 JSON | LLM 输出纯文本 | 捕获异常，降级为 uncertain, score=0.4 |
| E2 | 中英混合文档置信度评分 | 中英混排技术文档 | 不因"不规范"而显著降低评分 |
| E3 | expires_at 过期后重新标注 | expires_at 已过 | 触发重新标注提醒，LLM 不可用时保留当前置信度 |
| E4 | 旧文档缺少 confidence 字段 | 迁移前文档无 confidence | 迁移脚本设默认 likely/score=0.5，RAG 检索不受影响 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 审核队列与 knowledge_files 不一致修复 | approve 后 knowledge_files 更新失败时，定期检查并补偿修复 |
| R2 | 按搜索意图动态调整置信度权重 | intent=factual 时提高置信度影响，intent=procedural 时降低 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2 | 场景 1: LLM 自动预标注 | auto_annotator.py |
| TC-3, TC-4, TC-5, TC-6 | 场景 2-3: 审核队列流转 | review_queue.py |
| TC-7, TC-8 | 场景 4: 来源归因识别 | source_attributor.py |
| TC-9 | 场景 5: 检索结果加权 | rag_service.py |
| TC-10 | 场景 6: 手动标注优先 | auto_annotator.py |
| TC-11 | N/A: LLM 降级处理 | auto_annotator.py |
| TC-12 | N/A: 审核队列统计 | review_queue.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| LLM 自动标注偏见系统性评估 | 需大样本统计（1000+ 文档） | P2 |
| 自托管内部文档系统来源识别 | URL 分类规则可配置扩展，需实际测试 | P2 |
| YiVad 置信度可视化 UI | 跨项目联调 | P3 |