---

doc_type: test
title: "YA-09-295: Prompt性能分析 — Prompt Token消耗分析、响应延迟归因、成本估算、Prompt优化建议、AB对比 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-295"
source_prds: ["232-需求-Prompt性能分析"]
source_modules: ["232-prd-task-Prompt性能分析"]
source_okr: [yiai-002]

type: test
---

# YA-09-295: Prompt性能分析 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 Prompt Token 消耗分析、响应延迟归因（TTFT/TPOT/总延迟）、成本估算、Prompt 优化建议、AB 对比。

> 来源 PRD：[232-需求-Prompt性能分析.md](../../prds/2026-09/232-需求-Prompt性能分析.md)
> 需求编号：YA-09-295 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | PromptAnalyzer Token 计数、LatencyAttributor 延迟分解、CostEstimator 成本估算 | 45% |
| 集成测试 | pytest + httpx | Prompt 性能分析 API、优化建议生成、AB 对比报告 | 35% |
| 数据验证 | pytest + motor | prompt_performance 集合存储 | 20% |

**测试目标**：Token 计数与 tiktoken 基准误差 < 5%、TTFT/TPOT 归因正确、成本估算与实际偏差 < 10%。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/prompt/` 下 20 个 Prompt 模板（系统提示/用户消息/上下文混合），含已知 token 计数和延迟分布的样本。

**前置条件**：tiktoken 库可用（token 计数基准），MongoDB `prompt_performance` 集合已创建。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | Token 计数与基准对比 | Prompt 含中英混排 500 字 | count_tokens | 与 tiktoken cl100k_base 计数误差 < 5% | P0 |
| 2 | TTFT 延迟归因 | 用户消息 time_to_first_token=800ms | latency_attribution | 分解为: 网络 50ms / 队列 100ms / 模型推理 650ms | P0 |
| 3 | TPOT 延迟分析 | 后续 token 平均 50ms/token | latency_attribution | TPOT = 模型推理时间（不含首 token 延迟） | P1 |
| 4 | 成本估算 | token 输入 1000 + 输出 500，模型 qwen2.5:7b | cost_estimate | 成本 ≈ 本地推理时间（$0 或电费估算），API 模型按定价计算 | P1 |
| 5 | Prompt 优化建议 | 系统提示 3000 tokens（过长） | analyze_optimization | 建议: 缩短系统提示、移除冗余信息、使用缓存 | P1 |
| 6 | AB 对比-延迟 | Prompt A（原始）vs Prompt B（优化后）各 20 次 | ab_compare | 报告: 平均延迟差异、p95 差异、是否显著（t-test） | P1 |
| 7 | AB 对比-质量 | 相同查询，Prompt A vs B 输出质量 | ab_compare | 报告: 输出长度差异、关键词覆盖、结构化程度 | P2 |
| 8 | 按 Prompt 模板聚合 | 10 个模板各 100 次调用 | GET /prompt/performance?by=template | 返回每模板: 平均 token 数/平均延迟/调用次数/p95 | P1 |
| 9 | 系统提示占比分析 | context 含 system=3000t + history=5000t + user=200t | analyze_composition | token 占比: system 36.6% / history 61% / user 2.4%，标注最占空间部分 | P2 |
| 10 | 空 Prompt 检测 | prompt="" | 分析 | 返回空报告，不抛异常 | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 超长 Prompt (> 128K tokens) | 截断后分析 | 标注"超出模型上下文窗口"，建议分块或摘要 |
| E2 | tiktoken 不支持的模型 | 自定义模型无 tokenizer | 回退到近似算法（中文*1.5 + 英文*0.75），标注"近似值" |
| E3 | Prompt 纯代码 | 100% 代码 | 正确计数（代码 token 密度高于自然语言） |
| E4 | 历史性能数据过大 | 10000 次调用记录 | 聚合到分位数，不返回全部原始数据 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 模型切换后延迟基准对比 | 切换模型后自动对比新旧模型延迟，检测 > 50% 退化 |
| R2 | Token 计数不因 Prompt 格式变化而失真 | 相同内容不同格式（Markdown/纯文本/含代码块），计数差异 < 5% |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1 | token_counter.py |
| TC-2, TC-3 | latency_attributor.py |
| TC-4 | cost_estimator.py |
| TC-5 | optimization_suggester.py |
| TC-6, TC-7 | ab_comparator.py |
| TC-8, TC-9 | performance_aggregator.py |
| TC-10 | 边界保护 |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 不同模型系列 tokenizer 全面对比 | 需 Claude/GPT/Gemini 等 API 模型 | P3 |
| Prompt 优化建议的长期效果跟踪 | 需生产数据 | P3 |