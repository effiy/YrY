---
title: "WebDAV 备份 name 参数未检查直接 unwrap 导致 panic"
tags: [bug, webdav, backup, unwrap, panic, option]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: yipot
module: backup.rs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# WebDAV 备份 name 参数未检查直接 unwrap 导致 panic

---

## 一、现象

> **一句话描述**：`webdav()` 函数中 `name: Option<String>` 在 `get`/`put`/`delete` 分支中直接调用 `.unwrap()`。前端传入 `name: null` 时触发 panic，应用崩溃。

---

## 二、复现步骤

1. 调用 WebDAV 备份 API 时传入 `name: null`
2. `name.unwrap()` → panic: `called Option::unwrap() on a None value`

---

## 三、根因分析

**问题代码**：`src-tauri/src/backup.rs:35, 91, 101`

```rust
pub async fn webdav(..., name: Option<String>) -> Result<String, Error> {
    match operate {
        "get" => { client.get(&format!("/{}", name.unwrap()))... }
        "put" => { client.put(&format!("/{}", name.unwrap()), ...) }
        "delete" => { client.delete(&format!("/{}", name.unwrap()))... }
    }
}
```

---

## 四、修复方案

使用 `ok_or_else` 将 None 转换为结构化错误：

```rust
let name = name.ok_or_else(|| Error::Error("WebDav Get: name is required".into()))?;
```

---

## 五、验证方法

- [ ] `cargo check` 通过
- [ ] WebDAV get/put/delete 操作传入 `name: null` 返回错误而非 panic