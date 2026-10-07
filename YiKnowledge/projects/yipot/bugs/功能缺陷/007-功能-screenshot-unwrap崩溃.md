---
title: "screenshot.rs 截图流程中 5 处 unwrap/expect 导致截图失败时应用崩溃"
tags: [bug, screenshot, panic, unwrap, crash]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: yipot
module: screenshot.rs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# screenshot.rs 截图流程 5 处 unwrap 导致应用崩溃

---

## 一、现象

> 在 Wayland/Linux 或权限不足时触发截图 → `Screen::all().unwrap()` panic → 应用崩溃

---

## 二、根因

`screenshot.rs` 中 5 处 `unwrap()/expect()` 调用在失败时直接 panic：

| 行 | 代码 | 失败场景 |
|----|------|---------|
| `Screen::all().unwrap()` | 屏幕枚举 | Wayland 权限拒绝 |
| `cache_dir().expect()` | 缓存路径 | 无 home 目录 |
| `screen.capture().unwrap()` | 截图捕获 | GPU/驱动错误 |
| `image.to_png().unwrap()` | PNG 编码 | 内存不足 |
| `fs::write().unwrap()` | 文件写入 | 磁盘满/权限 |

---

## 三、修复

全部 5 处改为 match + error! 日志 + early return：

```rust
let screens = match Screen::all() {
    Ok(v) => v,
    Err(e) => { error!("Failed to enumerate screens: {}", e); return; }
};
```

---

## 四、验证

- [ ] `cargo check` 通过
- [ ] 截图失败时不崩溃，仅静默失败