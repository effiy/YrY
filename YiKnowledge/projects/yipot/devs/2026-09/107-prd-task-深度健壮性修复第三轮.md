---
doc_type: dev
title: "YiPot 深度健壮性修复（第三轮）— 开发方案"
tags:
- 开发方案
- 代码质量
- Rust
- panic防护
- cmd
- tray
- config
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-107
prd_ref: YP-09-66
estimate: 0.5
review_status: 已评审
roles:
- engineer
---

# YiPot 深度健壮性修复（第三轮）— 开发方案

> 开发编号：YP-09-107 · 关联 PRD：YP-09-66 · 预估人天：0.5d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src-tauri/src/cmd.rs` | 修改 | 12 处 `unwrap`/`expect` → 安全 fallback |
| `src-tauri/src/config.rs` | 修改 | 1 处 `config_dir().unwrap()` → match + panic! |
| `src-tauri/src/hotkey.rs` | 修改 | 1 处 `v.as_str().unwrap()` → `unwrap_or("")` |
| `src-tauri/src/tray.rs` | 修改 | 9 处 `unwrap` → 安全 fallback |

---

## 二、实施步骤

### Step 1: cmd.rs — 图像操作 (4 处)

**cut_image**: `cache_dir().expect()` → `match cache_dir() { Some(v) => v, None => { error!(...); return; } }`

**get_base64**: 同上 + `File::open(...).unwrap()` → `match File::open(...)`

**copy_img**: 同上模式，但返回 `Result` → `Err(Error::Error(...))`

### Step 2: cmd.rs — set_proxy (3 处)

```rust
// Before:
v.as_str().unwrap()
v.as_i64().unwrap()

// After:
v.as_str().unwrap_or("")
v.as_i64().unwrap_or(0)
```

### Step 3: cmd.rs — 插件操作 (5 处)

**install_plugin**:
- `path.file_name().unwrap().to_str().unwrap()` → `and_then(|n| n.to_str())` + match
- `dirs::config_dir().unwrap()` → match + `Err(Error::Error(...))`

**run_binary**: `dirs::config_dir().unwrap()` → match + `Err(Error::Error(...))`

### Step 4: config.rs (1 处)

```rust
// Before:
let config_path = config_dir().unwrap();

// After:
let config_path = match config_dir() {
    Some(v) => v,
    None => panic!("Cannot determine config directory — HOME may not be set"),
};
```

### Step 5: hotkey.rs (1 处)

```rust
// Before:
v.as_str().unwrap().to_string()

// After:
v.as_str().unwrap_or("").to_string()
```

### Step 6: tray.rs (9 处)

| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| `update_tray()` language | `v.as_str().unwrap()` | `v.as_str().unwrap_or("en")` |
| `update_tray()` copy_mode | `v.as_str().unwrap()` | `v.as_str().unwrap_or("disable")` |
| `update_tray()` clipboard | `v.as_bool().unwrap()` | `v.as_bool().unwrap_or(false)` |
| `on_tray_click()` event | `v.as_str().unwrap()` | `v.as_str().unwrap_or("config")` |
| `on_clipboard_monitor_click()` | `v.as_bool().unwrap()` | `v.as_bool().unwrap_or(false)` |
| `on_view_log_click()` app_log_dir | `.unwrap()` | `if let Some(...)` |
| `on_view_log_click()` to_str | `.unwrap()` | `.unwrap_or("")` |
| `on_view_log_click()` shell::open | `.unwrap()` | `let _ = ...` |
| `on_quit_click()` unregister_all | `.unwrap()` | `.unwrap_or_default()` |

---

## 三、验证命令

```bash
# Rust 编译检查
cd YiPot/src-tauri && cargo check

# 残余 unwrap 审计（setup 阶段的 unwrap 是合理的）
cd YiPot/src-tauri && cargo clippy -- -W clippy::unwrap_used 2>&1 | grep -v aborting
```

---

## 四、回滚方案

所有变更均为局部替换，`git revert` 对应 commit 即可。

---

## 五、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/66-prd-深度健壮性修复第三轮.md` |
| 测试 | `../tests/2026-09/112-prd-test-深度健壮性修复第三轮.md` |
| Bug 014 | `../bugs/功能缺陷/014-cmd-图像代理插件-unwrap-panic.md` |
| Bug 015 | `../bugs/功能缺陷/015-config-hotkey-unwrap-panic.md` |
| Bug 016 | `../bugs/功能缺陷/016-tray-托盘日志退出-unwrap-panic.md` |