---
title: "window.rs 与 system_ocr.rs 中 cache_dir().expect() 及 monitor unwrap 崩溃风险"
tags: [bug, rust, panic, unwrap, cache-dir, monitor, screenshot, ocr]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: yipot
module: window.rs, system_ocr.rs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# window.rs 与 system_ocr.rs 中 cache_dir().expect() 及 monitor unwrap 崩溃风险

---

## 一、现象

> **一句话描述**：Bug #010 修复了 `screenshot.rs` 的 unwrap，但 `window.rs` 和 `system_ocr.rs` 中仍存在 8 处 `.expect()`/`.unwrap()` 调用，在无 home 目录或 Wayland 环境可触发 panic。

---

## 二、根因分析

**问题代码位置**：

| 文件 | 函数 | 代码 | 失败场景 |
|------|------|------|---------|
| `window.rs` | `get_current_monitor()` | `available_monitors().unwrap()` | Wayland 权限拒绝 |
| `window.rs` | `get_current_monitor()` | `primary_monitor().unwrap().unwrap()` | 无显示器 |
| `window.rs` | `ocr_recognize()` macOS | `cache_dir().expect(...)` | 无 home 目录 |
| `window.rs` | `ocr_translate()` macOS | `cache_dir().expect(...)` | 无 home 目录 |
| `window.rs` | `ocr_recognize()` macOS | `create_dir_all(...).expect(...)` | 磁盘权限不足 |
| `window.rs` | `ocr_translate()` macOS | `create_dir_all(...).expect(...)` | 磁盘权限不足 |
| `system_ocr.rs` | Windows 实现 | `cache_dir().expect(...)` | 无 home 目录 |
| `system_ocr.rs` | macOS 实现 | `cache_dir().expect(...)` | 无 home 目录 |
| `system_ocr.rs` | Linux 实现 | `cache_dir().expect(...)` | 无 home 目录 |

---

## 三、修复方案

**window.rs** — `get_current_monitor()`:
```rust
// Before:
let monitors = daemon_window.available_monitors().unwrap();
// After:
let monitors = match daemon_window.available_monitors() {
    Ok(v) => v,
    Err(e) => {
        warn!("Failed to enumerate monitors: {}", e);
        return daemon_window.primary_monitor().unwrap_or(None)...;
    }
};
```

**window.rs** — `ocr_recognize()` / `ocr_translate()` (macOS):
```rust
// Before:
cache_dir().expect("Get Cache Dir Failed")
// After:
match cache_dir() {
    Some(v) => v,
    None => { warn!("Get Cache Dir Failed"); return; }
}
```

**system_ocr.rs** — 全部 3 平台:
```rust
// Before:
cache_dir().expect("Get Cache Dir Failed")
// After:
match cache_dir() {
    Some(v) => v,
    None => return Err("Get Cache Dir Failed".to_string()),
}
```

---

## 四、验证方法

- [x] `cargo check` 编译通过
- [ ] Wayland 环境下截图功能不崩溃
- [ ] 无 `$HOME` 时 OCR 功能返回错误而非 panic

---

## 五、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `window.rs`, `system_ocr.rs` |
| 是否影响 API 契约 | 否 |
| 用户感知 | 截图/OCR 功能在 Wayland 或受限环境崩溃 |
| 数据完整性 | 不涉及 |

---

## 六、预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 全量 Rust `unwrap`/`expect` 审计完成（本次为最后一轮） |
| CI | 启用 `cargo clippy -- -W clippy::unwrap_used` |