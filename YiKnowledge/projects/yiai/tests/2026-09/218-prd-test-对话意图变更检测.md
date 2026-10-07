---

doc_type: test
title: "YA-09-219: 对话意图变更检测 — 检测用户对话中途切换话题，意图偏移检测，上下文窗口裁剪，无缝话题转换，变更分析，多话题会话追踪 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-219"
source_prds: ["218-需求-对话意图变更检测"]
source_modules: ["218-prd-task-对话意图变更检测"]
source_okr: [yiai-001]

type: test
---

# YA-09-219: 对话意图变更检测 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖语义嵌入+阈值切换检测、LLM 兜底、上下文混合裁剪（摘要+最后1轮）、话题恢复、渐变意图追踪。

> 来源 PRD：[218-需求-对话意图变更检测.md](../../prds/2026-09/218-需求-对话意图变更检测.md)
> 需求编号：YA-09-219 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | IntentChangeDetector 余弦距离判断、滑动窗口趋势、TopicManager 话题状态机、ContextManager token 估算 | 45% |
| 集成测试 | pytest + httpx | 多轮对话模拟、话题恢复检测、上下文裁剪效果、话题流转 API | 35% |
| 数据验证 | pytest + motor | 话题流转记录持久化 | 20% |

**测试目标**：余弦距离阈值 0.55 正确、滑动窗口偏移阈值 0.65、LLM 兜底仅边界触发 (< 15%)、裁剪后 token < 原始 40%。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/intent/` 下 10 个多轮对话场景（含话题切换/延伸/恢复/渐变），每条消息含预期话题归属。

**前置条件**：Embedding 服务可用（用于语义向量计算），Ollama 可用（用于 LLM 兜底和话题命名，可 mock），MongoDB 会话集合可用。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 明确话题切换检测 | 前 10 轮 Python 性能 → 新消息"数据库索引如何设计" | 计算余弦距离 | 距离 > 0.55, shift_detected=True, 新话题创建 | P0 |
| 2 | 话题自然延伸不误判 | "Python 性能优化" → "Python 多线程优化呢" | 计算余弦距离 | 距离 < 0.55, shift_detected=False, 话题中心 EMA 更新 | P0 |
| 3 | 上下文混合裁剪 | 3 话题：Python(10轮)→数据库(8轮)→DevOps(当前 3轮) | ContextManager.trim_context | 当前话题全保留，前话题摘要+最后1轮，更早仅一句摘要，token < 原始 40% | P0 |
| 4 | 话题恢复检测 | Python(话题1)→数据库(话题2)→"刚才说的Python GIL..." | TopicManager.find_similar_topic | 匹配到话题 1（similarity > 0.65），恢复到话题 1 | P1 |
| 5 | 渐变意图检测 | 部署→监控→告警配置→日志分析（逐步偏移） | 滑动窗口检测 | 第 5 轮 shift_detected=True, reason="gradual_drift" | P1 |
| 6 | LLM 兜底边界触发 | 距离 = 0.50（在 [0.45, 0.65] 边界内） | 异步 LLM 检查 | shift_detected 由 LLM 判断决定，超时时默认不切换 | P1 |
| 7 | 极短消息不误判 | "好的"、"继续"等确认型短消息 | 嵌入计算 + 距离判断 | 距离 < 阈值，不触发话题切换 | P1 |
| 8 | 话题名称生成 | 新话题创建 | LLM 异步生成名称 | 名称 5-10 字有意义中文，非 "Topic-1" | P2 |
| 9 | 话题流转 API | 会话含 4 个话题 | GET /session/{key}/topics | 返回话题列表含 name/start_index/message_count/semantic_distance | P2 |
| 10 | 代码块不误触发切换 | 对话中含 Python 代码块 | 嵌入计算 | 代码块后的自然语言与话题中心距离 < 阈值 | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 零向量保护 | embedding 全零向量 | 余弦距离计算不除零，return 1.0 |
| E2 | LLM 兜底超时 | LLM 2s 无响应 | 默认不切换（安全策略），不阻塞对话流程 |
| E3 | 长会话话题列表内存控制 | 100+ 话题累积 | topics 列表限制最近 20 个，更早的仅保留元数据 |
| E4 | Token 估算误差控制 | 中英混排+代码+数字 | 与 tiktoken 精确计数对比，误差 < 20% |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 双向引用话题恢复不混淆 | "Python 内存管理" vs "Redis 内存管理"（语义相似但不同话题），验证话题恢复时检查名称关键词重叠 |
| R2 | 裁剪后 LLM 仍能引用跨话题信息 | 话题1 提到具体数值，话题2 引用该数值，验证话题摘要包含该数值（不被裁剪丢失） |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2 | 场景 1-2: 切换检测与自然延伸 | change_detector.py |
| TC-3 | 场景 3: 上下文裁剪 | context_manager.py |
| TC-4 | 场景 4: 话题恢复 | topic_manager.py |
| TC-5 | 场景 5: 渐变意图检测 | change_detector.py |
| TC-6 | 场景 6: LLM 兜底 | change_detector.py |
| TC-7 | 回归预测 #1: 极短消息 | change_detector.py |
| TC-8 | N/A: 话题命名 | topic_manager.py |
| TC-9 | N/A: 话题流转 API | topic_manager.py |
| TC-10 | 回归预测 #2: 代码块误触发 | change_detector.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 语义嵌入模型对中英混合术语效果 | 需真实 Embedding 模型评估 | P2 |
| 阈值 F1 分数统计验证 | 需 100+ 人工标注话题切换样本 | P2 |
| 用户反馈修正误判（强化学习） | 需生产环境用户反馈数据 | P3 |