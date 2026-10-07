---

doc_type: test
title: "YA-09-224: 模型版本回滚 — 快照、一键回滚、验证、回滚历史与AB对比 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-224"
source_prds: ["223-需求-模型版本回滚"]
source_modules: ["223-prd-task-模型版本回滚"]
source_okr: [yiai-002]

type: test
---

# YA-09-224: 模型版本回滚 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖更新前快照、一键回滚（< 30s）、回滚后自动验证（基准测试）、回滚历史、AB 对比报告。

> 来源 PRD：[223-需求-模型版本回滚.md](../../prds/2026-09/223-需求-模型版本回滚.md)
> 需求编号：YA-09-224 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | ModelSnapshot 创建/恢复、RollbackExecutor 流程、ABComparator 指标计算 | 40% |
| 集成测试 | pytest + httpx | 回滚 API（snapshot/rollback/verify/history）、热切换集成验证 | 40% |
| 数据验证 | pytest + motor | 回滚历史持久化 | 20% |

**测试目标**：快照完整性（配置+性能基线+依赖）、回滚耗时 < 30s、回滚后基准测试自动验证、AB 对比报告生成。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：Ollama 本地至少 2 个模型版本可用（如 `qwen2.5:7b` 旧版本和新版本），RAG 基准评估可用（用于回滚验证）。

**前置条件**：模型热切换（YA-09-215）已部署，MongoDB `model_snapshots` 和 `rollback_history` 集合已创建。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 更新前自动创建快照 | 当前模型 qwen2.5:7b | 触发更新时自动 snapshot | 快照含模型名/版本/配置/性能基线/时间戳 | P0 |
| 2 | 一键回滚 | 快照存在，当前模型质量下降 | POST /admin/models/rollback | 模型回退到快照版本，耗时 < 30s | P0 |
| 3 | 回滚后自动验证 | 回滚完成 | 运行 Top-10 RAG 基准 | 基准通过，质量恢复（无额外回归） | P0 |
| 4 | 无快照无法回滚 | 无历史快照 | POST /admin/models/rollback | 返回错误"无可用的回滚快照" | P1 |
| 5 | 回滚到指定版本 | 快照版本 v3 | POST /admin/models/rollback?version=v3 | 回退到 v3（非必须最新快照） | P1 |
| 6 | AB 对比报告 | model_a vs model_b | generate_ab_report() | 报告含: 检索质量/答案忠实度/延迟 p50 p95/幻觉率 差异 | P1 |
| 7 | 回滚历史查询 | 过去 30 天 5 次回滚 | GET /admin/models/rollback-history?days=30 | 返回 5 条: 时间/回滚前版本/回滚后版本/原因/验证结果 | P1 |
| 8 | 回滚失败自动恢复 | 回滚过程中 Ollama 不可用 | 回滚操作 | 保持当前模型不变（非部分回滚），记录失败日志 | P2 |
| 9 | 快照过期清理 | 30 天前快照 | 定时清理 | 旧快照归档/删除，保留最近 5 个快照 | P2 |
| 10 | 并发回滚保护 | 2 个管理请求同时回滚 | asyncio.Lock | 仅一个回滚执行，另一个返回"回滚进行中" | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 快照时 Ollama 不可用 | ollama show 返回错误 | 快照创建标记为 partial（含警告），不阻断流程 |
| E2 | 回滚版本模型已从 Ollama 删除 | snapshot 版本 tag 不存在 | 先尝试 ollama pull 旧版本，失败则返回明确错误 |
| E3 | 快照数据过大 | 性能基线含 1000+ 条历史数据 | 采样保留最近 100 条，控制快照 < 1MB |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 回滚后不影响 YiVad/YiPet 正在进行的对话 | 回滚期间有 5 个活跃 SSE 连接，验证不中断（利用热切换排空机制） |
| R2 | 连续回滚 3 次后模型状态一致 | 回滚 A→B→C→A，验证最终状态与初始一致 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1 | snapshot_manager.py |
| TC-2, TC-3 | rollback_executor.py |
| TC-4, TC-5 | rollback_executor.py |
| TC-6 | ab_comparator.py |
| TC-7 | rollback_history.py |
| TC-8 | rollback_executor.py (错误处理) |
| TC-9 | snapshot_cleaner.py |
| TC-10 | 并发控制 |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 大规模模型（70B+）回滚性能 | 需大 GPU 测试环境 | P3 |
| 回滚审批流程（多人确认） | 属管理流程而非技术验证 | P3 |
| Ollama 版本 tag 管理策略 | Ollama 层，非 YiAi 控制 | P2 |