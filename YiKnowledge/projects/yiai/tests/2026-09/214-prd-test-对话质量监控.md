---

doc_type: test
title: "YA-09-214: 对话质量监控 — 实时质量指标、幻觉检测启发式、响应长度异常检测、用户满意度代理指标、质量告警 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-214"
source_prds: ["214-需求-对话质量监控"]
source_modules: ["214-prd-task-对话质量监控"]
source_okr: [yiai-001]

type: test
---

# YA-09-214: 对话质量监控 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 7 类幻觉检测启发式规则、满意度代理 4 种信号、长度异常滑动窗口 Z-score、异步质量分析、分层存储与告警。

> 来源 PRD：[214-需求-对话质量监控.md](../../prds/2026-09/214-需求-对话质量监控.md)
> 需求编号：YA-09-214 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | HallucinationDetector 7 种模式正则匹配、SatisfactionProxyCalculator 4 信号计算、LengthAnomalyDetector Z-score | 50% |
| 集成测试 | pytest + httpx | Quality Hook 非阻塞推送、Worker 异步消费、仪表盘 API、告警触发 | 30% |
| 数据验证 | pytest + motor | quality_events TTL 索引、hourly_aggregates 聚合正确性 | 20% |

**测试目标**：幻觉检测精确率 > 70%、满意度代理多信号融合分数在 [0, 1]、长度异常检测 Z-score 阈值 2.5、Quality Hook 开销 < 5ms。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/quality/` 下 50 条模拟 LLM 回复（含 10 条正常、10 条幻觉、10 条异常长度、10 条边界、10 条多类型混合），以及 10 个会话历史 JSON。

**前置条件**：MongoDB `quality_events` 集合已创建 TTL 索引（7天），`quality_aggregates` 集合已创建，asyncio Queue 可用。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 虚构引用检测 | 回答："根据《YiAi开发指南》第3章..."（不存在） | 运行 HallucinationDetector | flag = FICTITIOUS_REFERENCE, score >= 0.6 | P0 |
| 2 | 虚构 API 检测 | 回答："调用 `yiAi.getDocuments()` 获取文档" | 运行 HallucinationDetector | flag = FICTITIOUS_API, score >= 0.7 | P0 |
| 3 | 不合理精确数字检测 | 回答："用户满意度为 87.3%" | 运行 HallucinationDetector | flag = UNREASONABLE_PRECISION, score >= 0.5 | P1 |
| 4 | 自相矛盾检测 | 回答中同时包含"必须使用 PostgreSQL"和"可以不使用 PostgreSQL" | 运行 HallucinationDetector | flag = SELF_CONTRADICTION, score >= 0.9 | P0 |
| 5 | 正常回答不触发幻觉 | 回答："Python 是一种编程语言" | 运行 HallucinationDetector | flags = [], hallucination_score = 0.0 | P1 |
| 6 | 满意度-追问修正信号 | 会话历史含 User: "不对，我是说..." | 运行 SatisfactionProxyCalculator | score < 0.4, signals 含 CORRECT_FOLLOWUP | P0 |
| 7 | 满意度-重新生成信号 | 同一 user 消息 3 次 assistant 回复 | 运行 SatisfactionProxyCalculator | score < 0.5, signals 含 REGENERATE | P1 |
| 8 | 长度异常 Z-score > 2.5 | 历史均值=500, std=100, 新响应长度=2000 | 运行 LengthAnomalyDetector | is_anomaly=True, z_score=15.0 | P0 |
| 9 | 长度正常不误判 | 历史均值=500, std=100, 新响应长度=550 | 运行 LengthAnomalyDetector | is_anomaly=False, z_score=0.5 | P1 |
| 10 | Quality Hook 非阻塞 | 对话完成后触发 Hook | 测量 Hook 耗时 | Hook 耗时 < 5ms，对话响应不受影响 | P0 |
| 11 | 仪表盘 API 24h 概览 | 系统运行 24h 累积质量数据 | GET /api/quality/dashboard?hours=24 | 返回总对话数、幻觉比例、平均满意度、异常比例、Top 幻觉类型 | P1 |
| 12 | 质量告警触发 | 幻觉率 > 20% 持续 30min | 检测告警规则 | 触发 WARNING，含当前幻觉率、历史平均、Top 3 幻觉类型 | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 空回答检测 | response = "" | 不触发任何幻觉 flag，hallucination_score = 0.0 |
| E2 | 满意度仅 QUICK_END 信号 | 单轮对话后结束 | 降低 QUICK_END 权重至 0.05，避免中性信号淹没 |
| E3 | 滑动窗口冷启动 | 窗口 < 10 个样本 | 标记 window_warmup=true，告警忽略预热阶段 |
| E4 | Worker 消费积压 | 队列 > 500 | 自动扩容 worker 数量或降级为 10% 采样 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | "请参考文档"合法建议不误判为虚构引用 | 正则 `根据.*文档` 匹配后需检查上下文，合法建议不标记为幻觉 |
| R2 | 聚合边界不跨越 TTL 删除窗口 | 聚合窗口设为 [当前-6天23小时, 当前]，留 1 小时缓冲避免 TTL 边界不一致 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2, TC-3, TC-4, TC-5 | 场景 1-2: 幻觉检测 | hallucination.py |
| TC-6, TC-7 | 场景 3: 满意度代理 | satisfaction.py |
| TC-8, TC-9 | 场景 4: 长度异常检测 | anomaly.py |
| TC-10 | N/A: 非阻塞性验证 | quality_hook.py |
| TC-11 | 场景 5: 质量仪表盘 | quality_routes.py |
| TC-12 | 场景 6: 质量告警 | alerting.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| RAG 事实核查验证（H1-H6 依赖 RAG 的场景） | 需真实 RAG 检索上下文，mock 效果差 | P2 |
| 多 worker 并发消费的竞态条件 | 单 worker 测试无法覆盖竞态 | P2 |
| 满意度显式反馈（赞/踩）集成 | 前端 YiVad/YiPet 尚未实现反馈 UI | P3 |