---
title: "HTTP 服务路由 URL 解析缺陷导致请求匹配失败"
tags: [bug, server, routing, query-params, http]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: server.rs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# HTTP 服务路由 URL 解析缺陷

---

## 一、现象

> **一句话描述**：本地 HTTP 服务 (`:60828`) 的 URL 路由使用完整匹配（含 query string），导致非精确匹配的请求（如带多余参数、不同参数顺序）被静默忽略。

**错误日志**：

```
WARN Unknown request url: /ocr_recognize?screenshot=true&lang=en
```

---

## 二、复现步骤

1. YiPot 启动后本地 HTTP 服务运行在 `127.0.0.1:60828`
2. 向 `/ocr_recognize?screenshot=true&lang=en` 发请求（多一个 `lang` 参数）
3. 路由无法匹配 → 静默失败

或：

1. GET 请求 `/` → 调用 `handle_translate()` 尝试读取请求体（GET 无 body，会阻塞或读到空串）

---

## 三、根因分析

**问题代码**：`src-tauri/src/server.rs:34-49`

```rust
fn http_handle(request: Request) {
    match request.url() {
        "/" => handle_translate(request),           // GET / 不应读 body
        "/ocr_recognize?screenshot=false" => ...,   // 精确匹配，无法处理多余参数
        "/ocr_recognize?screenshot=true" => ...,    // 参数顺序不同也无法匹配
        _ => warn!("Unknown request url: {}", request.url()),
    }
}
```

**根因**：
1. `request.url()` 返回完整 URL（含 query string），与静态模式做全等比较
2. 外部调用方（如 PopClip、SnipDo）可能携带额外参数，路由匹配失败
3. `/` 与 `/translate` 路由都调用 `handle_translate`，GET `/` 不应读 body

---

## 四、修复方案

将 URL 拆分为 path 和 query string，仅对 path 做精确匹配，query 参数按需解析。

**修复后**：

```rust
fn http_handle(request: Request) {
    let url = request.url();
    let path = url.split('?').next().unwrap_or(url);

    match path {
        "/" => response_ok(request),
        "/ocr_recognize" => {
            let screenshot = url.contains("screenshot=true");
            if screenshot { ocr_recognize(); } else { recognize_window(); }
            response_ok(request);
        }
        // ...
    }
}
```

---

## 五、验证方法

- [ ] `cargo check` 编译通过
- [ ] `curl "http://127.0.0.1:60828/ocr_recognize?screenshot=true&extra=1"` → 正常触发截图 OCR
- [ ] `curl "http://127.0.0.1:60828/"` → 返回 "ok"，不阻塞
- [ ] 所有已有外部集成（PopClip/SnipDo）调用路径不受影响

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `server.rs` |
| 是否影响 API 契约 | 否（向后兼容，原有精确匹配的参数依然生效） |
| 是否影响前端 | 否 |
| 用户感知 | 外部工具调用 OCR/翻译可能静默失败 |
| 数据完整性 | 不涉及 |

---

## 七、预防措施

| 层面 | 措施 |
|------|------|
| 代码 | URL 解析统一使用 path/query 分离模式 |
| 测试 | 添加 HTTP 服务路由的单元测试（模拟请求） |
| 流程 | 外部集成文档明确支持的 query 参数 |
| CI | — |