---
doc_type: prd
title: "YiPot 健壮性强化 — 截图容错 + 配置存储去 panic"
tags: [需求文档, 健壮性, 截图, 配置]
category: 项目/桌面应用/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: '202609'
prd_task_id: YP-09-62
estimate_backend: 0.5
review_status: 已评审
issue_type: 健壮性强化
roles: [engineer]
---

# YiPot 健壮性强化 — 截图容错 + 配置存储去 panic

> 需求编号：YP-09-62 · 优先级：P1

---

## 一、需求背景

第三轮审查发现 screenshot.rs 中 5 处 unwrap 和 config.rs 中 6 处 unwrap，在边缘场景（Wayland 权限、磁盘满、Store 锁竞争）下可导致应用崩溃。

---

## 二、技术方案

### screenshot.rs: 5 处 unwrap → match + error 日志 + early return

```rust
let screens = match Screen::all() { Ok(v) => v, Err(e) => { error!(...); return; } };
```

### config.rs: get/set/is_first_run 共 6 处 unwrap → Option/Result 传播

```rust
pub fn get(key: &str) -> Option<Value> {
    let app = APP.get()?;
    let store = app.state::<StoreWrapper>().0.lock().ok()?;
    store.get(key).cloned()
}
```

---

## 三、验收标准

1. `cargo check` 通过
2. 截图失败不崩溃
3. 配置写入失败不崩溃