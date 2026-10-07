---

doc_type: test
title: "YA-09-217: 语义缓存预热 — 预测高频查询并提前计算缓存，使用模式分析，预热优先级，缓存命中等比分析，资源感知节流 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-217"
source_prds: ["217-需求-语义缓存预热"]
source_modules: ["217-prd-task-语义缓存预热"]
source_okr: [yiai-001]

type: test
---

# YA-09-217: 语义缓存预热 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖查询预测（频率+时间衰减）、L1/L2/L3 分层预热、资源感知节流、缓存命中分析、预热进度追踪。

> 来源 PRD：[217-需求-语义缓存预热.md](../../prds/2026-09/217-需求-语义缓存预热.md)
> 需求编号：YA-09-217 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | QueryPredictor 频率统计+衰减加权、ResourceMonitor 阈值判断、HitAnalyzer 命中分类 | 45% |
| 集成测试 | pytest + httpx | WarmupManager 预热执行+暂停恢复+超时处理、预热进度 API、服务启动自动预热 | 35% |
| 数据验证 | pytest + motor | 查询日志过滤（排除预热查询）、缓存键 "warmup:" 前缀隔离 | 20% |

**测试目标**：查询预测 L1 Top-20 覆盖 > 60% 流量、预热并发上限 3、资源节流 CPU > 70% 暂停 < 50% 恢复、单任务超时 30s、7 天半衰期衰减正确。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/warmup/` 下 200 条模拟历史查询日志（含时间戳、频率分布），预期预测结果。

**前置条件**：MongoDB `query_logs` 集合含 timestamp 索引，RAG 引擎运行中（用于预热查询），缓存层可用。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 查询预测频率排序 | 日志："RAG 配置" 50次/"向量嵌入" 30次 | QueryPredictor.predict(days=7) | L1 含"RAG 配置"和"向量嵌入"，按 priority_score 降序 | P0 |
| 2 | 时间衰减计算 | 7 天前查询 vs 当天查询 | 比较 decayed_freq | 7 天前查询权重 = 当天 50%，14 天前 = 25% | P0 |
| 3 | 服务启动自动预热 | 缓存为空 | 预热调度器检测启动事件 | WarmupManager 开始 L1 预热（Top-20），status=RUNNING | P0 |
| 4 | 预热完成后缓存命中 | L1 预热完成 | 用户查询"RAG 配置" | 缓存命中（source="warmup"），延迟 < 50ms | P1 |
| 5 | 资源节流 CPU 暂停 | CPU > 70% | 预热执行中 | 暂停新任务，运行中任务完成后不启动新任务 | P0 |
| 6 | 资源恢复继续预热 | CPU 降至 45% | 预热暂停中 | 恢复预热执行 | P1 |
| 7 | 并发上限 Semaphore | 30 个预热任务 | 同时执行 | 最多 3 个并发运行，其余排队 | P1 |
| 8 | 单任务超时 30s | 某预热查询 RAG 检索 > 30s | 超时处理 | 任务标记 failed，不影响其他任务继续执行 | P0 |
| 9 | 缓存命中分析 | 预热完成 24h | HitAnalyzer.analyze(hours=24) | warmup_hits/query_hits 分类正确，warmup_contribution 计算正确 | P1 |
| 10 | 预热进度 API | 30 个任务，20 个完成 | GET /warmup/status | status="running", completed=20, progress_pct=66.7 | P1 |
| 11 | 预测数据不含预热查询 | 预热查询标记 is_warmup=True | 再次预测 | 过滤掉 is_warmup=True 的查询，避免正反馈循环 | P1 |
| 12 | 查询归一化处理 | "Python 配置" vs "python 配置 " vs "Python,配置" | _normalize() | 三个查询归一化为相同结果 | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 缓存已存在跳过预热 | cache_key 已存在 | WarmupTask status="skipped", stats.skipped += 1 |
| E2 | 查询归一化过度合并 | "Python 配置" vs "Python 3.12 配置" | 归一化后视为不同查询（非完全合并），保留语义差异 |
| E3 | psutil 不可用时降级 | psutil 库未安装 | ResourceMonitor 降级为仅检查请求队列长度 |
| E4 | MongoDB 连接未就绪时预热启动 | 服务启动瞬时触发预热 | 预热调度器等待 motor.client.server_info() 响应后再启动 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 暂停恢复后 Semaphore 不泄露 | 模拟暂停→恢复 10 次循环，验证并发任务数始终 <= MAX_CONCURRENT(3) |
| R2 | 预热缓存 TTL 合理 | 热门查询 TTL > 2 倍平均查询间隔，防止"预热→过期→再预热"死循环 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1, TC-2 | 场景 1: 查询预测正确性 | query_predictor.py |
| TC-3, TC-4 | 场景 2: 服务启动自动预热 | warmup_manager.py, scheduler.py |
| TC-5, TC-6 | 场景 3: 资源节流暂停/恢复 | resource_monitor.py |
| TC-7, TC-8 | 场景 6/7: 并发控制+超时 | warmup_manager.py |
| TC-9 | 场景 4: 缓存命中分析 | hit_analyzer.py |
| TC-10 | 场景 5: 预热进度查询 | warmup_manager.py |
| TC-11 | 回归预测 #5: 预测数据污染 | query_predictor.py |
| TC-12 | N/A: 查询归一化 | query_predictor.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 预热预测准确率的长期验证 | 需生产环境运行数据 | P3 |
| 知识库变更事件触发针对性预热 | 依赖知识监视器事件机制 | P2 |
| Redis 分布式缓存预热 | 当前仅内存缓存 + Redis 可选 | P3 |