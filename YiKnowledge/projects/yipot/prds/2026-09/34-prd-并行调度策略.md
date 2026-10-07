---
doc_type: prd
title: "YP-09-S23: 多接口并行调度策略"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S23
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 并行, 调度, 性能]
category: 项目/桌面应用/需求
---

# YP-09-S23: 多接口并行调度策略

> 需求编号：YP-09-S23 · 优先级：P0 · 人天：1.0d · 状态：已完成

## 背景

用户启用多个翻译/OCR 服务时，需要同时向多个 API 发起请求。并行调度需要处理：故障隔离、超时控制、结果聚合、优先级排序。

## 需求

### 调度算法

```javascript
async function parallelDispatch(text, services, options) {
  const results = await Promise.allSettled(
    services
      .sort((a, b) => a.order - b.order)
      .map(s => withTimeout(s.execute(text, options), options.timeout || 10000))
  );

  return results.map((r, i) => ({
    service: services[i].info,
    status: r.status,        // "fulfilled" | "rejected"
    data: r.value ?? null,
    error: r.reason ?? null,
    elapsed: r.elapsed
  }));
}
```

### 故障隔离

- 单个服务超时/失败不影响其他服务
- 错误分类：网络错误/认证错误/配额错误/未知错误
- 每种错误有对应的用户提示

### 超时控制

- 默认 10s 超时
- 可通过 AbortController 取消

### 结果排序

- 按用户设置的服务优先级排序
- 成功的结果在前，失败的在后

## 验收标准

- [ ] 3 个服务并行查询，所有结果展示
- [ ] 1 个服务超时，其他 2 个正常
- [ ] 全部失败时显示聚合错误
- [ ] 请求可取消

## 量化验收标准

| 场景 | 输入条件 | 预期结果 | 测量方法 |
|------|----------|----------|----------|
| 单服务成功 | 1 个服务，正常网络 | 结果在 1 个 fulfilled 中，耗时 = 单服务耗时 | `performance.now()` 差值 |
| 全部成功 | 3 个服务，均正常 | 3 个 `{status:"fulfilled"}`，总耗时 = max(各服务耗时) | 并行耗时验证 |
| 部分失败 | 3 个服务，1 个超时 | 2 个 fulfilled + 1 个 rejected，总耗时 = timeout | rejected 的 error 字段非 null |
| 全部失败 | 3 个服务，网络断开 | 3 个 rejected，聚合错误提示 "所有服务不可用" | 错误消息包含各服务失败原因 |
| 用户取消 | 请求进行中，用户关闭窗口 | 所有进行中请求被 AbortController 取消 | AbortError 而非 TimeoutError |
| 优先级排序 | 服务 B(order=1), A(order=3) | 结果数组：B 在前，A 在后 | 结果数组索引与 order 一致 |

## 边界条件与异常处理

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 无可用服务 | 所有服务禁用/未配置 | 立即返回空数组 `[]` | 提示 "请至少启用一个服务" |
| 单服务挂起 | 网络 TCP 连接但无响应 | 10s 后超时，标记为 rejected | 其他服务正常返回 |
| DNS 解析失败 | 域名无法解析 | 5s 内报错（系统 DNS 超时）| 标记为 network_error |
| 服务返回 5xx | 服务端内部错误 | 标记为 rejected，归类为 server_error | 不自动重试（避免雪崩） |
| 服务返回 429 | 配额/限流 | 标记为 rejected，归类为 quota_error | 显示 "今日配额已用尽" |
| AbortController 竞态 | 关闭窗口时请求刚好返回 | 忽略已完成请求的结果 | `signal.aborted` 检查 |
| 大型结果集 | 多个服务返回长文本 | 结果对象大小不受限制 | 前端虚拟滚动展示 |
| 并发调度 > 10 服务 | 启用 10+ 服务 | 最多同时发出 6 个请求，其余排队 | 滑动窗口控制并发数 |

## 非功能需求

### 性能
- **并发上限**：单次调度最多 6 个并发请求（避免浏览器连接池耗尽和 API 限流）
- **总超时**：单次调度总超时 15s（含所有服务），超时后取消所有未完成请求
- **内存**：调度器无状态，无内存泄漏风险；结果对象 < 1MB (文本场景)

### 可靠性
- `Promise.allSettled` 保证即使部分失败也不丢结果
- 错误分类函数 `classifyError(error)` 纯函数，单元测试覆盖所有错误类型
- 重试策略：仅 retryable 错误（network_error, timeout）重试 1 次，间隔 2s，带指数退避预留接口

### 可观测性
- 每次调度记录：调度 ID、服务数量、各服务耗时、成功/失败数、总耗时
- 聚合错误信息格式：`"服务 A: 超时 | 服务 B: 认证失败 | 服务 C: 正常返回"`

## 模块交互

```
调度入口: parallelDispatch(text, services, options)
     │
     ├── 输入: services[] (按 order 排序), options.timeout, options.signal
     │
     ├── 执行: Promise.allSettled(services.map(s => withTimeout(s.execute(), timeout)))
     │         │
     │         ├── withTimeout(promise, ms) —— 包装 AbortController + setTimeout
     │         │
     │         └── classifyError(error) —— 分类: network/auth/quota/server/timeout/unknown
     │
     └── 输出: result[] { service.info, status, data, error, elapsed }
              │
              ├── sort: fulfilled 在前, rejected 在后, 各自按 order 排序
              │
              └── 消费者:
                    ├── TranslateWindow → 展示翻译结果
                    ├── OCRWindow → 展示识别结果
                    └── ErrorBanner → 聚合错误提示
```

**上游依赖**：
- 各服务插件 `services/translate/{name}/index.jsx`：提供 `execute(text, options)` 接口
- 各服务插件 `services/recognize/{name}/index.jsx`：提供 `execute(image, options)` 接口

**下游消费者**：
- `Translate/index.jsx`：翻译窗口调用平行调度
- `Recognize/index.jsx`：OCR 窗口调用平行调度
- `ResultAggregator`：结果聚合和排序组件
- `ErrorBanner`：聚合错误提示组件

**配置依赖**：
- `SettingPage > ServiceConfig`：用户启用/禁用服务、排序
- `Jotai servicesAtom`：全局服务列表状态

## 参考

- [32-prd-百度腾讯OCR](./32-prd-百度腾讯OCR.md) — 百度/腾讯 OCR 服务
- [33-prd-讯飞合合火山OCR](./33-prd-讯飞合合火山OCR.md) — 讯飞/合合/火山 OCR 服务
- [35-prd-翻译窗口交互](./35-prd-翻译窗口交互.md) — 翻译窗口中的并行结果展示
- [36-prd-OCR窗口交互](./36-prd-OCR窗口交互.md) — OCR 窗口中的并行结果展示