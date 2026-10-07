---

doc_type: test
title: "YA-09-215: 模型热切换 — 无需重启服务切换LLM模型、模型预加载、原子切换与连接排空、回滚能力、定时切换、切换A/B验证、切换审计日志 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-215"
source_prds: ["215-需求-模型热切换"]
source_modules: ["215-prd-task-模型热切换"]
source_okr: [yiai-002]

type: test
---

# YA-09-215: 模型热切换 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖模型注册中心状态机、预加载、原子路由切换、连接排空、冒烟测试、回滚、定时调度、审计日志。

> 来源 PRD：[215-需求-模型热切换.md](../../prds/2026-09/215-需求-模型热切换.md)
> 需求编号：YA-09-215 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | ModelRegistry 状态机、SmokeTestRunner 3 类测试、SwitchScheduler 时间判断 | 45% |
| 集成测试 | pytest + httpx | Admin API（preload/switch/rollback/status）、ModelRouter 透明代理、GracefulDrainer 排空 | 35% |
| 审计验证 | pytest + motor | SwitchAuditLogger 写入/查询、model_switch_logs 集合 | 20% |

**测试目标**：状态机完整（UNKNOWN→LOADING→LOADED→ACTIVE→DRAINING→UNLOADED）、冒烟测试 < 10s、排空超时 30s、路由更新原子 < 1ms。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：Ollama 本地至少 2 个模型已加载（如 `qwen2.5:3b` 和 `qwen2.5:7b`），GPU 显存足够同时加载两个。

**前置条件**：ModelRuntime 抽象层（YA-09-11）已部署，Ollama 运行中，MongoDB `model_switch_logs` 集合已创建。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 预加载模型 | model="qwen2.5:7b" | POST /admin/models/preload | 模型状态 LOADING→LOADED，loaded_at 记录时间戳 | P0 |
| 2 | 冒烟测试通过后切换 | 预加载完成，活跃模型 qwen2.5:3b | POST /admin/models/switch | 冒烟 3 题通过，路由更新，活跃模型变为 7b，响应头 X-Model: qwen2.5:7b | P0 |
| 3 | 冒烟测试失败阻止切换 | model="broken-model:latest" 响应异常 | POST /admin/models/switch | 冒烟失败，切换阻止，返回 400 + 失败详情，活跃模型不变 | P0 |
| 4 | 排空旧模型连接 | 旧模型上 3 个推理进行中 | 触发切换 | 新请求 → 新模型；旧请求允许完成（最多 30s）；30s 后未完成返回 503 | P1 |
| 5 | 回滚到上一模型 | 刚从 7b 切到 14b 但表现不佳 | POST /admin/models/rollback | 活跃模型变回 7b，无需冒烟测试，审计日志记录回滚 | P1 |
| 6 | 未预加载直接切换 | model not in registry | POST /admin/models/switch | 返回错误"模型未注册，请先预加载" | P1 |
| 7 | 定时调度执行 | 调度规则：09:00 切至大模型 | 触发 09:00 | 自动切换执行，审计日志 initiated_by="scheduler" | P1 |
| 8 | 重启后不误触发调度 | 22:00 调度 last_run=None，服务在 22:30 重启 | 检查 _should_run | 跳过当天已过的调度（不误触发） | P1 |
| 9 | 切换审计日志查询 | 过去 30 天 15 次切换 | GET /admin/models/switch-history?days=30 | 返回 15 条，含时间/操作人/旧模型/新模型/原因/冒烟结果/耗时 | P1 |
| 10 | GPU 显存不足拒绝预加载 | 当前已用 22GB/24GB，新模型需 8GB | POST /admin/models/preload | 返回错误"GPU 显存不足"，拒绝预加载 | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 连续快速切换 | 切到 B 后 2s 再切到 C | _drain_and_unload 检查目标模型状态，跳过已非 DRAINING 的模型卸载 |
| E2 | asyncio.Lock 仅保护赋值 | switch() 前冒烟测试在锁外执行 | LLM 请求不排队等待（registry.active 属性无需锁） |
| E3 | 冒烟测试单题超时 | 某测试题 Ollama 10s 无响应 | 该题标记失败，冒烟整体失败，不阻塞其他题的判断 |
| E4 | 预加载预热可靠性 | `num_predict=1` 单 token 不保证完全加载 | 多次 ping 直到响应时间 < 500ms 才标记 LOADED |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | Ollama keep_alive 独立于 YiAi 状态管理 | 切换后旧模型 5min 内被 Ollama 自动卸载，验证 registry 状态正确更新为 UNLOADED |
| R2 | 多次预热 ping 不引起 Ollama 限流 | 预热时连续 5 次 ping，验证 ollama.generate 不返回 rate limit 错误 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1 | 场景 1: 预加载 | registry.py, preloader.py |
| TC-2, TC-3 | 场景 1-2: 切换与冒烟 | registry.py, smoke_test.py, router.py |
| TC-4 | 场景 3: 排空旧连接 | drainer.py |
| TC-5 | 场景 4: 回滚 | registry.py |
| TC-6 | 场景 1: 未预加载切换 | registry.py |
| TC-7, TC-8 | 场景 5: 定时切换 | scheduler.py |
| TC-9 | 场景 6: 审计日志 | audit.py |
| TC-10 | 回归预测 #1: GPU 显存限制 | registry.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 真实 2x 14B 模型 OOM 场景 | 需 32GB+ GPU，测试环境可能不具备 | P2 |
| 影子流量验证（后续功能） | PRD 标记为后续迭代 | P3 |
| 跨进程模型状态同步 | 单进程测试无法覆盖 | P2 |