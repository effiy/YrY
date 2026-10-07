---

doc_type: test
title: "YA-09-94: 服务端内存对象缓存 — LRU/LFU 淘汰策略与 TTL 过期管理统一实现 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-94"
source_prds: ["98-需求-内存对象缓存统一"]
source_modules: ["98-prd-task-内存对象缓存统一"]
source_okr: [yiai-003]

type: test
---

# YA-09-94: 内存对象缓存统一 — 测试规格

> 来源 PRD：[98-需求-内存对象缓存统一.md](../../prds/2026-09/98-需求-内存对象缓存统一.md)
> 需求编号：YA-09-94 · 优先级：P2 · 人天：0.5d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 一、测试范围与策略

### 1.1 测试范围

| 模块 | 测试重点 | 层级 |
|------|---------|------|
| UnifiedCache 接口 | `get/set/delete/clear/has` 统一 API | 单元 |
| LRU 淘汰策略 | 超出 maxsize 时淘汰最久未使用条目 | 单元 |
| LFU 淘汰策略 | 超出 maxsize 时淘汰最少使用条目 | 单元 |
| TTL 过期 | 条目到达 TTL 后自动失效 | 单元 |
| TTL 抖动 | ±20% 随机抖动防止缓存雪崩 | 单元 |
| 缓存统计 | 命中率/大小/淘汰率计数 | 单元 |
| 线程安全 | asyncio.Lock 保护并发读写 | 单元 |
| 缓存预热 | bulk 写入初始数据 | 单元 |

### 1.2 测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest + pytest-asyncio | 所有淘汰策略、TTL、统计、线程安全 | 100% |

---

## 二、测试数据与前置条件

| 组件 | 要求 |
|------|------|
| 测试 key-value | 100 对 `{f"key_{i}": f"value_{i}"}` 数据 |
| 缓存配置 | `maxsize=50, ttl=10s, strategy=LRU` |
| 并发工具 | `asyncio.gather` 用于并发测试 |
| 统计 fixture | 初始化后的缓存 stats 全为 0 |

---

## 三、测试用例

### 3.1 基本操作（3 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-CA-01 | set/get 往返 | `cache.set("k1", "v1")` -> `cache.get("k1")` | 返回 `"v1"` | P0 |
| UT-CA-02 | get 不存在的 key | `cache.get("nonexist")` | 返回 None（或 default 值） | P0 |
| UT-CA-03 | delete 后 get | `cache.delete("k1")` -> `cache.get("k1")` | 返回 None | P0 |

### 3.2 LRU 淘汰（3 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-LR-01 | 超出 maxsize 淘汰最旧 | maxsize=3，写入 k1,k2,k3,k4 | k1 被淘汰，k2/k3/k4 保留 | P0 |
| UT-LR-02 | 访问刷新 LRU 位置 | maxsize=3，写入 k1,k2,k3 -> 访问 k1 -> 写入 k4 | k2 被淘汰，k1/k3/k4 保留 | P0 |
| UT-LR-03 | 更新现有 key 不淘汰 | maxsize=3，写入 k1,k2,k3 -> 更新 k1 -> 写入 k4 | k2 或 k3 被淘汰，k1 保留 | P1 |

### 3.3 LFU 淘汰（3 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-LF-01 | 超出 maxsize 淘汰最少访问 | maxsize=3，写入 k1,k2,k3 -> 访问 k2 x5, k3 x3 -> 写入 k4 | k1 被淘汰（频率最低） | P0 |
| UT-LF-02 | LFU 频率相同淘汰最旧 | k1/k2/k3 访问频率相同 -> 写入 k4 | 最早写入的被淘汰 | P1 |
| UT-LF-03 | LFU 频率统计准确性 | 连续访问 k1 100 次 | `cache.stats["hits"]` = 次数字段正确 | P1 |

### 3.4 TTL 过期（3 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-TL-01 | TTL 内有效 | 写入 k1, ttl=1s -> 0.5s 后 get | 返回有效值 | P0 |
| UT-TL-02 | TTL 过期失效 | 写入 k1, ttl=0.1s -> 0.2s 后 get | 返回 None | P0 |
| UT-TL-03 | TTL 抖动范围 | 写入 100 个 key, ttl=10s | 实际 TTL 在 8-12s 之间分布（±20%），无全部同时过期 | P0 |

---

## 四、边界与异常测试

### 4.1 边界场景（4 条）

| 编号 | 场景 | 输入 | 预期 |
|------|------|------|------|
| BE-01 | maxsize=0 不缓存 | maxsize=0，写入任意数据 | 所有 set 操作均为 no-op，get 返回 None |
| BE-02 | maxsize=1 单条目 | maxsize=1，写入 k1 -> k2 | k1 被淘汰，仅 k2 存在 |
| BE-03 | 大量写入超出 maxsize | maxsize=50，写入 10000 个不同 key | 始终保持 <= 50 个条目，内存不泄漏 |
| BE-04 | TTL=0 立即过期 | ttl=0，写入后立即 get | 返回 None（或配置为不过期） |

### 4.2 异常场景（3 条）

| 编号 | 场景 | 触发条件 | 预期 |
|------|------|---------|------|
| EX-01 | TTL 设置为负数 | `ttl=-1` | 视为不过期（None/0 语义），记录 WARNING |
| EX-02 | maxsize 设置为负数 | `maxsize=-1` | 视为无限制（infinite），记录 WARNING |
| EX-03 | 并发读写竞态 | 10 个协程同时 set 和 get 同一 key | 最终数据一致，无 KeyError/死锁 |

---

## 五、回归测试（2 条）

| 编号 | 回归场景 | 验证方法 |
|------|---------|---------|
| RG-01 | 缓存预热批量写入 | 预热 100 个 key 后前 100 次 get 全部命中 |
| RG-02 | 缓存统计准确性 | hits + misses + evictions = 总操作数 |

---

## 六、可追溯性矩阵

| 需求点 | 测试用例 | 覆盖状态 |
|--------|---------|---------|
| 统一 get/set/delete | UT-CA-01 至 UT-CA-03 | 已覆盖 |
| LRU 策略 | UT-LR-01 至 UT-LR-03 | 已覆盖 |
| LFU 策略 | UT-LF-01 至 UT-LF-03 | 已覆盖 |
| TTL 过期 | UT-TL-01, UT-TL-02 | 已覆盖 |
| TTL 抖动 ±20% | UT-TL-03 | 已覆盖 |
| 线程安全（RWLock） | EX-03 | 已覆盖 |
| 缓存统计 | UT-LF-03, RG-02 | 已覆盖 |
| 缓存预热 | RG-01 | 已覆盖 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 真实 Service 集成验证 | 需 ToolCache/QueryCache/PromptCache 迁移到统一接口 | 验证替换后命中率不退步 |
| 内存占用基准 | 需要 profiling | 补充 memory-profiler 基准测试 |
| 分布式缓存扩展 | 当前仅内存缓存 | Redis 后端扩展时补充 |