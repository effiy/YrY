---

doc_type: test
title: "多接口并行调度策略 — 测试方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["34-prd-并行调度策略"]
source_modules: ["34-prd-并行调度策略"]

type: test
---

# 多接口并行调度策略 — 测试方案

> 覆盖 YP-09-S23：parallelDispatch 调度算法、故障隔离、超时控制、结果排序、错误分类

---

## 一、核心功能测试

### 1.1 并行调度基本行为

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-PAR-001 | 单服务成功 | 启用 1 个翻译服务 → 翻译 | 返回 1 个 fulfilled，耗时 = 单服务耗时 |
| TC-PAR-002 | 3 服务全部成功 | 启用 3 个翻译服务 → 翻译 | 3 个 `{status:"fulfilled"}`，总耗时 = max(各服务耗时) |
| TC-PAR-003 | 1 个服务超时 | 3 服务中 1 个 slow → 翻译 | 2 fulfilled + 1 rejected，总耗时 = timeout |
| TC-PAR-004 | 全部失败 | 断网 → 翻译 | 3 个 rejected，聚合错误提示"所有服务不可用" |
| TC-PAR-005 | 用户取消 | 翻译中关闭窗口 | 所有请求被 AbortController 取消，抛出 AbortError |
| TC-PAR-006 | 优先级排序 | 服务 B(order=1), A(order=3) | 结果数组 B 在前 A 在后 |

### 1.2 故障隔离

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-PAR-010 | 单服务网络错误 | 1 个服务断网 → 3 服务翻译 | 该服务 rejected(error: network_error)，其他正常 |
| TC-PAR-011 | 单服务认证错误 | 1 个服务 Key 错误 | 该服务 rejected(error: auth_error)，提示"认证失败" |
| TC-PAR-012 | 单服务配额错误 (429) | 1 个服务配额耗尽 | 该服务 rejected(error: quota_error)，提示"配额已用尽" |
| TC-PAR-013 | 单服务服务端错误 (5xx) | 1 个服务返回 500 | 该服务 rejected(error: server_error)，不自动重试 |
| TC-PAR-014 | 错误互不传播 | A 服务超时 + B 服务配额耗尽 | 各自独立 rejected，各自错误原因正确 |

### 1.3 超时与并发控制

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-PAR-020 | 默认 10s 超时 | 不设 timeout → 翻译 | 单个服务 10s 未响应则超时 |
| TC-PAR-021 | 自定义超时 | 设 timeout=5000 → 翻译 | 5s 未响应则超时 |
| TC-PAR-022 | 总超时 15s | 3 服务同时翻译 | 15s 后取消所有未完成请求 |
| TC-PAR-023 | 并发上限 6 | 启用 10 个服务 → 翻译 | 最多同时 6 个请求，其余排队 |
| TC-PAR-024 | 无可用服务 | 禁用所有服务 → 翻译 | 立即返回空数组 `[]`，提示"请至少启用一个服务" |

---

## 二、边界与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|------|----------|----------|----------|
| TC-PAR-EDGE-01 | DNS 解析失败 | 域名不可解析 | 5s 内报错，标记为 network_error | 不阻塞其他服务 |
| TC-PAR-EDGE-02 | TPC 连接无响应 | 网络 TCP 连接但无数据 | 10s 后超时，标记为 rejected | 其他服务正常 |
| TC-PAR-EDGE-03 | AbortController 竞态 | 关闭窗口时请求刚好返回 | 忽略已完成的结果 | `signal.aborted` 检查 |
| TC-PAR-EDGE-04 | 大型结果集 | 多服务返回长文本(>10KB) | 结果对象大小不受限 | 前端虚拟滚动 |
| TC-PAR-EDGE-05 | 并发调度 > 10 服务 | 启用 10+ 服务 | 滑动窗口控制最大 6 并发 | — |
| TC-PAR-EDGE-06 | 单服务挂起 | TCP 连接成功但 0 数据 | 10s 后超时 rejected | 不阻塞调度器 |
| TC-PAR-EDGE-07 | 快速连续调度 | 500ms 内 2 次翻译 | 前一次 AbortController 取消 | 仅展示最新结果 |
| TC-PAR-EDGE-08 | 服务执行抛异常 | execute() 抛出未分类错误 | 标记为 rejected(error: unknown_error) | 不传播到调度器外部 |

---

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PAR-PERF-01 | 3 服务并行总耗时 | 翻译 100 字 | < max(各服务耗时) + 10ms | > max + 100ms | Promise.allSettled 计时 |
| TC-PAR-PERF-02 | 6 服务并发限制 | 10 服务启用 | 总耗时 < 2x 单服务耗时 | > 3x | 滑动窗口开销 |
| TC-PAR-PERF-03 | 调度器初始化 | 首次调用 parallelDispatch | < 5ms | > 20ms | 不含服务执行 |
| TC-PAR-PERF-04 | 结果排序开销 | 10 服务结果排序 | < 1ms | > 5ms | Array.sort by order |
| TC-PAR-PERF-05 | 错误分类开销 | classifyError(error) | < 1ms | > 5ms | 纯函数，10000 次调用 |
| TC-PAR-PERF-06 | 内存占用 | 单次调度后内存增量 | < 5MB | > 15MB | 文本场景，不含图片 |

---

## 四、可靠性测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-PAR-REL-01 | Promise.allSettled 不丢结果 | 3 服务 1 个失败 | 3 个结果均在数组中 | P0 |
| TC-PAR-REL-02 | 重试策略 (retryable) | network_error 错误 | 自动重试 1 次，间隔 2s | P1 |
| TC-PAR-REL-03 | 不重试 non-retryable | auth_error / quota_error | 不自动重试 | P1 |
| TC-PAR-REL-04 | 聚合错误消息格式 | 3 服务各不同错误 | "服务A: 超时 \| 服务B: 认证失败 \| 服务C: 正常返回" | P1 |
| TC-PAR-REL-05 | 调度器无状态 | 连续 100 次调度 | 内存无泄漏，无累积状态 | P1 |

---

## 五、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-PAR-01 | 3 服务全部成功，按时排序 | 基本调度 | 否 | P0 |
| REG-PAR-02 | 1 个服务超时不影响其他 | 故障隔离 | 否 | P0 |
| REG-PAR-03 | 全部失败聚合错误提示 | 错误聚合 | 否 | P0 |
| REG-PAR-04 | AbortController 取消请求 | 取消 | 否 | P1 |
| REG-PAR-05 | 服务优先级排序 | 排序 | 否 | P1 |
| REG-PAR-06 | 并发上限 6 个 | 并发控制 | 否 | P1 |
| REG-PAR-07 | 单服务 429 不重试 | 错误分类 | 否 | P1 |
| REG-PAR-08 | 无可用服务返回空数组 | 边界 | 否 | P1 |

---

## 六、参考文档

- [34-prd-并行调度策略](../prds/2026-09/34-prd-并行调度策略.md) — 源 PRD
- [32-prd-百度腾讯OCR](../prds/2026-09/32-prd-百度腾讯OCR.md) — OCR 服务
- [33-prd-讯飞合合火山OCR](../prds/2026-09/33-prd-讯飞合合火山OCR.md) — OCR 服务
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 翻译窗口调度
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 窗口调度