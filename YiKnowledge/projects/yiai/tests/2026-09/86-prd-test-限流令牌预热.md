---

doc_type: test
title: "YA-09-82: 服务端速率限制令牌预热 — 基于历史流量模式的令牌预分配优化 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-82"
source_prds: ["86-需求-限流令牌预热"]
source_modules: ["86-prd-task-限流令牌预热"]
source_okr: [yiai-001]

type: test
---

# YA-09-82: 限流令牌预热 — 测试规格

> 来源 PRD：[86-需求-限流令牌预热.md](../../prds/2026-09/86-需求-限流令牌预热.md)

本文档定义 PredictiveTokenBucket 令牌预热机制的**验证方式**——覆盖冷启动预填充、历史流量预测、预热阶段线性爬坡、多 Worker 一致性、配置热重载。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 冷启动预热——有历史数据 | L1 |
| COV-2 | 冷启动预热——无历史数据兜底 | L1 |
| COV-3 | 预热阶段线性爬坡限制 | L1 |
| COV-4 | 预热完成后平滑过渡到正常速率 | L1 |
| COV-5 | 多 Worker 预填充一致性 | L1 |
| COV-6 | 流量统计数据采集与持久化 | L2 |
| COV-7 | 预热配置热重载 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `traffic_stats_with_history` | 过去 7 天每小时 RPS 均值 50 | 有历史数据预热 |
| `traffic_stats_empty` | 无历史数据 | 兜底预热 |
| `bucket_capacity_100` | PredictiveTokenBucket(capacity=100, rate=10) | 标准测试桶 |
| `multi_worker_buckets` | 4 个 PredictiveTokenBucket(capacity=100, worker_count=4) | 多 Worker 测试 |

---

## 二、测试用例

### 2.1 冷启动预热（COV-1~2 . L1）

> 自动化落点：`tests/unit/test_predictive_token_bucket.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TWP-001 | 有历史数据——预填充 = mean * 1.5 | 1. TrafficStatsStore 返回 mean_rps=50, samples=7；2. warmup() | tokens = min(capacity, 75)，is_warming_up=True | P0 | 待实现 |
| TC-TWP-002 | 无历史数据——兜底预填充 50% | 1. TrafficStatsStore 无数据；2. warmup() | tokens = capacity * 0.5 | P0 | 待实现 |
| TC-TWP-003 | 样本数不足 (samples < 3)——使用兜底 | 1. TrafficStatsStore 仅 2 天数据；2. warmup() | 回退到 50% 容量兜底 | P1 | 待实现 |
| TC-TWP-004 | warmup_enabled=False 跳过预热 | 1. bucket(warmup_enabled=False)；2. warmup() | tokens = capacity * 0.5，is_warming_up=False | P0 | 待实现 |
| TC-TWP-005 | 预热阶段请求不触发正常限流 | 1. 预热 tokens=75；2. 消耗 1 个令牌 | acquire() 返回 True，burst_consumed=1 | P0 | 待实现 |

### 2.2 预热阶段线性爬坡（COV-3~4 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TWP-006 | 预热 1s 消耗不超允许上限 | 1. prefill=75, warmup=5s；2. 模拟 elapsed=1s | max_allowed = 75*1/5 = 15，第 16 次 acquire()=False | P0 | 待实现 |
| TC-TWP-007 | 预热 5s 后切换到正常速率 | 1. 预热阶段；2. 模拟 elapsed=5s | is_warming_up=False，令牌按速率生成 | P0 | 待实现 |
| TC-TWP-008 | 预热阶段不生成新令牌 | 1. 预热阶段 elapsed=1s | tokens 不增加（不执行 refill） | P1 | 待实现 |
| TC-TWP-009 | 预热结束后累积令牌正确 | 1. 预热结束 tokens=0；2. 等 2s (rate=10/s) | tokens = 20 | P1 | 待实现 |

### 2.3 多 Worker 与流量统计（COV-5~7 . L1-L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TWP-010 | 4 Worker 各预填充 25% 容量 | 1. worker_count=4, mean_rps=100；2. warmup() | 每 Worker tokens = min(capacity, 100*1.5*0.25) | P1 | 待实现 |
| TC-TWP-011 | 流量统计持久化到 MongoDB | 1. 运行 1 小时；2. 检查 traffic_history 集合 | 每小时 RPS 数据点已存储 | P1 | 待实现 |
| TC-TWP-012 | 30 天旧流量数据自动 TTL 清理 | 1. 插入 31 天前数据；2. 触发清理 | 旧数据已删除，仅保留 30 天 | P2 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TWP-EDGE-001 | 预热填充超 capacity——截断 | 1. mean_rps * 1.5 > capacity；2. warmup() | tokens = capacity，不超上限 | P0 | 待实现 |
| TC-TWP-EDGE-002 | 闲置服务历史 RPS=0——兜底 | 1. 所有时段 mean_rps=0；2. warmup() | 使用 capacity * 0.5 兜底 | P1 | 待实现 |
| TC-TWP-EDGE-003 | 并发 warmup 调用——顺序执行 | 1. 两个协程同时调用 warmup() | 第二个等待第一个完成，无竞态 | P1 | 待实现 |
| TC-TWP-EDGE-004 | 预热期间服务关闭——正常退出 | 1. 预热中；2. 发送 SIGTERM | 优雅关闭，无 resource warning | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-TWP-REG-001 | 限流功能不受预热影响 | 预热完成后，超出 rate 的请求 | 正确限流，返回 429 | P0 | 待实现 |
| TC-TWP-REG-002 | 令牌预生成 (YA-09-41) 与预热兼容 | 同时启用预生成 + 预热 | 两者叠加 tokens 不超过 capacity | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 冷启动预热 | 基于历史 RPS 预填充 | TC-TWP-001 ~ 005 |
| FR-02 线性爬坡 | 5s 限制消耗速率 | TC-TWP-006 ~ 009 |
| FR-03 多 Worker 一致性 | Worker 数量因子 | TC-TWP-010 |
| FR-04 流量统计存储 | 持久化 + 清理 | TC-TWP-011 ~ 012 |
| FR-05 可观测性 | warmup_tokens/phase 指标 | — (monitoring test) |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 机器学习预测模型未覆盖 | 当前仅简单均值预测 | 后续引入时序预测后补充 LSTM/Prophet 预测精度测试 |
| G-2 | 多实例共享流量预测未覆盖 | 当前单实例独立预测 | 引入 Redis 共享历史流量后补充分布式一致性测试 |
| G-3 | 预热结束过渡期边界抖动 | 第 5s 边界可能存在短暂不可用 | 添加过渡期前后连续 acquire() 监控 jitter |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/86-需求-限流令牌预热.md`*