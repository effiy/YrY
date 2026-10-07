---

doc_type: test
title: "YA-09-296: 模型Token计数优化 — 精确tiktoken集成、缓存机制、批量计数、流式计数、多模型适配 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-296"
source_prds: ["233-需求-模型Token计数优化"]
source_modules: ["233-prd-task-模型Token计数优化"]
source_okr: [yiai-002]

type: test
---

# YA-09-296: 模型Token计数优化 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 tiktoken 精确计数集成、计数缓存、批量计数、流式计数、多模型 tokenizer 适配。

> 来源 PRD：[233-需求-模型Token计数优化.md](../../prds/2026-09/233-需求-模型Token计数优化.md)
> 需求编号：YA-09-296 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | TokenCounter 精确计数、CountCache 缓存命中、BatchCounter 批量优化、StreamingCounter 流式计数 | 50% |
| 集成测试 | pytest + httpx | 计数 API、批量计数端点、多模型自动选择 tokenizer | 30% |
| 性能测试 | pytest-benchmark | 缓存 vs 无缓存延迟对比、批量 vs 单个计数吞吐 | 20% |

**测试目标**：tiktoken 精确计数误差 < 1%、缓存命中率 > 90%（重复内容）、批量计数提速 > 5x、流式计数实时度 < 10ms。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/token/` 下 100 个文本片段（中/英/代码/混合），含 tiktoken 人工校验的精确 token 计数值。

**前置条件**：tiktoken 库可用，多模型 tokenizer 已注册（至少 cl100k_base、qwen tokenizer）。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | tiktoken 精确计数 | 中文 100 字 + 英文 100 词 | count_tokens(encoding="cl100k_base") | 与基准误差 < 1% | P0 |
| 2 | 计数缓存命中 | 相同文本第 2 次计数 | 检查缓存 | 缓存命中，耗时 < 0.1ms（首次 1-5ms） | P0 |
| 3 | 缓存失效 LRU | 缓存满 10000 条，新文本插入 | LRU 淘汰 | 最久未访问条目被淘汰 | P1 |
| 4 | 批量计数 | 100 个文本片段 | batch_count | 总耗时 < 单个计数 × 10（优化后），结果与单独计数一致 | P0 |
| 5 | 流式计数 | SSE token 逐 token 到达 | streaming_count | 每 token 到达时更新计数，延迟 < 10ms | P1 |
| 6 | 多模型 tokenizer 自动选择 | model="qwen2.5:7b" | auto_select_encoding | 自动选择 qwen tokenizer（非 cl100k_base） | P0 |
| 7 | 未知模型回退 | model="unknown-model" | auto_select_encoding | 回退到近似算法（中文*1.5 + 英文*0.75），标注"近似值" | P1 |
| 8 | 上下文窗口超限检测 | prompt tokens=5000, max_context=4096 | check_context_limit | 返回警告"超出上下文窗口 904 tokens"，建议裁剪 | P1 |
| 9 | 计数统计 API | 过去 24h 所有计数 | GET /token/stats | 返回: 总 token 数/平均 prompt tokens/平均 completion tokens/p95 | P2 |
| 10 | 空文本计数 | text="" | count_tokens | 返回 0（非错误） | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 极长文本 (> 1M tokens) | 截断后计数 | 标注"计数基于前 500K tokens（截断）" |
| E2 | 特殊字符/emoji | "Hello 👋 世界 🚀" | 正确计数（emoji 通常占用 2-4 tokens） |
| E3 | 缓存键碰撞 | 不同文本相同哈希 | 使用完整文本作为缓存键（非哈希），避免碰撞 |
| E4 | 流式计数网络中断 | SSE 中断后恢复 | 计数从中断点继续（非重置），最终总数正确 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 新模型 tokenizer 添加后不影响已有计数 | 添加新 tokenizer 后，已有模型的计数结果不变 |
| R2 | 缓存预热（启动时加载热点内容） | 启动后检查缓存命中率，验证预热 > 50% |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1 | token_counter.py |
| TC-2, TC-3 | count_cache.py |
| TC-4 | batch_counter.py |
| TC-5 | streaming_counter.py |
| TC-6, TC-7 | encoding_selector.py |
| TC-8 | context_limit_checker.py |
| TC-9 | token_stats.py |
| TC-10 | 边界保护 |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 所有 Ollama 模型 tokenizer 映射 | 需逐个验证模型 tokenizer 对应关系 | P2 |
| 万亿级 token 计数精度 | 极大规模使用场景 | P3 |