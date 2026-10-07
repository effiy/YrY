---

doc_type: module
prd_task_id: "YP-09-S23"
title: "并行调度策略 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "34-prd-并行调度策略.md"
tags: [开发方案, 并行, 调度, 性能]

type: task
---

# 并行调度策略 — 开发方案

## 架构与数据流

```
调度入口: parallelDispatch(textOrImage, services, options)
     │
     ├── 输入预处理
     │   ├── services[] 按 order 排序
     │   ├── 过滤未启用/未配置的服务
     │   └── 最多 6 并发 (滑动窗口)
     │
     ├── 执行层
     │   ├── withTimeout(s.execute(), timeout) per service
     │   ├── AbortController 绑定外部 signal
     │   └── Promise.allSettled() 故障隔离
     │
     ├── 结果处理
     │   ├── classifyError() 错误分类: network/auth/quota/server/timeout/unknown
     │   ├── sort: fulfilled 在前, rejected 在后, 各自按 order
     │   └── 聚合错误消息: "服务 A: 超时 | 服务 B: 认证失败"
     │
     └── 输出: result[] { service, status, data, error, elapsed }
              │
              ├── TranslateWindow → 翻译结果展示
              ├── OCRWindow → 识别结果展示
              └── ErrorBanner → 聚合错误提示
```

**上游依赖**: 各服务插件 `services/translate/{name}/index.jsx`、`services/recognize/{name}/index.jsx`
**下游消费者**: `Translate/index.jsx`、`Recognize/index.jsx`、`ResultAggregator`、`ErrorBanner`

## 关键实现

### withTimeout 包装器

```javascript
// src/utils/parallelDispatch.js
function withTimeout(promise, ms, signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  // 外部信号联动
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  return Promise.race([
    promise.catch((e) => {
      if (e.name === "AbortError") throw new Error("TIMEOUT");
      throw e;
    }),
    new Promise((_, reject) => {
      const onAbort = () => {
        controller.signal.removeEventListener("abort", onAbort);
        reject(new Error("TIMEOUT"));
      };
      controller.signal.addEventListener("abort", onAbort);
    }),
  ]).finally(() => clearTimeout(timeoutId));
}
```

### 并行调度器 (带滑动窗口并发控制)

```javascript
async function parallelDispatch(input, services, options = {}) {
  const { timeout = 10000, signal, maxConcurrent = 6 } = options;

  // 过滤和排序
  const enabled = services
    .filter((s) => s.enabled && s.configured)
    .sort((a, b) => a.order - b.order);

  if (enabled.length === 0) return [];

  const results = [];
  const startTimes = new Map();

  // 滑动窗口并发控制
  for (let i = 0; i < enabled.length; i += maxConcurrent) {
    const batch = enabled.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map(async (s) => {
        const start = Date.now();
        const result = await withTimeout(s.execute(input, s.config), timeout, signal);
        return { ...result, elapsed: Date.now() - start, serviceId: s.id, serviceName: s.name };
      })
    );
    results.push(...batchResults);
  }

  return results.map((r, i) => ({
    service: enabled[i].info,
    status: r.status,
    data: r.status === "fulfilled" ? r.value : null,
    error: r.status === "rejected" ? classifyError(r.reason) : null,
    elapsed: r.status === "fulfilled" ? r.value?.elapsed : null,
  }));
}
```

### 错误分类器

```javascript
function classifyError(error) {
  if (error.message === "TIMEOUT") return { type: "timeout", message: "请求超时", retryable: true };
  if (error.message === "ABORTED") return { type: "cancelled", message: "请求已取消", retryable: false };

  const status = error.status || error.code;
  if (status === 401 || status === 403) return { type: "auth", message: "认证失败，请检查密钥", retryable: false };
  if (status === 429) return { type: "quota", message: "今日配额已用尽", retryable: false };
  if (status >= 500) return { type: "server", message: "服务端错误", retryable: true };

  // 网络错误检测
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return { type: "network", message: "网络连接失败", retryable: true };
  }

  return { type: "unknown", message: error.message || "未知错误", retryable: false };
}

function aggregateErrors(results) {
  const errors = results.filter((r) => r.status === "rejected");
  if (errors.length === 0) return null;
  if (errors.length === results.length) return { type: "all_failed", message: "所有服务不可用" };
  return { type: "partial", message: errors.map((e) => `${e.service.name}: ${e.error.message}`).join(" | ") };
}
```

### 结果排序

```javascript
function sortResults(results, services) {
  const orderMap = new Map(services.map((s, i) => [s.info.id, i]));
  return results.sort((a, b) => {
    // fulfilled 优先
    if (a.status !== b.status) return a.status === "fulfilled" ? -1 : 1;
    // 同状态下按 order 排序
    return (orderMap.get(a.service.id) ?? 999) - (orderMap.get(b.service.id) ?? 999);
  });
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 并发控制 | 滑动窗口 (max 6) 而非全量并发 | 避免浏览器连接池耗尽 (Chrome 6 连接/域名)，防止 API 限流 |
| 故障隔离 | `Promise.allSettled` 而非 `Promise.all` | 单服务超时/失败不影响其他服务结果 |
| 重试策略 | 仅 retryable 错误重试 1 次，间隔 2s | 避免 5xx 雪崩效应，网络抖动自动恢复 |
| 总超时 | 15s 全局超时 | 防止单个慢服务拖垮整个调度 |
| 结果排序 | fulfilled 优先 + order 次要 | 用户最先看到可用的结果 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 分批并发 | 每批最多 6 个请求，批次内并行、批次间串行 | 避免连接池耗尽，峰值 QPS 可控 |
| 超时控制 | 每个服务 10s 独立超时 + 15s 全局超时 | 单服务慢不影响整体 |
| 请求取消 | AbortController 绑定外部 signal | 用户关闭窗口时立即释放资源 |
| 无状态设计 | 调度器为纯函数，不持有状态 | 无内存泄漏，可安全复用 |
| 早期退出 | enabled 为空立即返回 `[]` | 避免无效调度开销 |

## 错误处理

| 场景 | 分类 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 全部服务不可用 | all_failed | "请至少启用一个服务" | 引导到设置页面 |
| 部分服务失败 | partial | "服务 A: 超时 \| 服务 B: 认证失败" | 成功的结果正常展示 |
| 单服务挂起 (TCP 无响应) | timeout | 10s 后该服务标记为 rejected | 其他服务正常返回 |
| DNS 解析失败 | network | 5s 内报错，标记为 network_error | retryable, 自动重试 1 次 |
| 服务 5xx | server | 标记为 rejected, 归类 server_error | 不自动重试 (避免雪崩) |
| 用户取消 (关闭窗口) | cancelled | 静默忽略 | AbortController 取消所有进行中请求 |
| AbortController 竞态 | race | 忽略已完成请求的结果 | `signal.aborted` 检查 |
| 大型结果集 (多服务长文本) | — | 前端虚拟滚动展示 | 结果对象大小不受限制, < 1MB (文本) |

## 交叉引用

- [32-prd-百度腾讯OCR](../prds/2026-09/32-prd-百度腾讯OCR.md) — 翻译/OCR 服务并行调用方
- [33-prd-讯飞合合火山OCR](../prds/2026-09/33-prd-讯飞合合火山OCR.md) — 翻译/OCR 服务并行调用方
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 翻译窗口中的并行结果展示
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 窗口中的并行结果展示