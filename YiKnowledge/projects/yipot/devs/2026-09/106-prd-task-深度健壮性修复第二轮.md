---
doc_type: dev
title: "YiPot 深度健壮性修复（第二轮）— 开发方案"
tags:
- 开发方案
- 代码质量
- Rust
- panic防护
- 运行时错误
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
dev_id: YP-09-106
prd_ref: YP-09-65
estimate: 0.5
review_status: 已评审
roles:
- engineer
---

# YiPot 深度健壮性修复（第二轮）— 开发方案

> 开发编号：YP-09-106 · 关联 PRD：YP-09-65 · 预估人天：0.5d

---

## 一、变更清单

### 1.1 React 前端

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/App.jsx` | 修复 | 恢复 `import { warn } from 'tauri-plugin-log-api'` |

### 1.2 Rust 后端

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src-tauri/src/backup.rs` | 修改 | 3 处 `config_dir().unwrap()` → `match` + 错误返回 |
| `src-tauri/src/window.rs` | 修改 | 4 处 `expect`/`unwrap` → `match` + `warn!` + fallback |
| `src-tauri/src/system_ocr.rs` | 修改 | 3 处 `cache_dir().expect()` → `match` + `Err` 返回 |

---

## 二、实施步骤

### Step 1: App.jsx — 恢复 warn 导入

**问题**：Bug #008 修复时删除了 `warn` 导入（当时确未使用），但 `catch` 块中的 `warn("Can't detect system theme.")` 仍存在。

**修复**：

```jsx
// 第 6 行，在 react-i18next 导入之后添加：
import { warn } from 'tauri-plugin-log-api';
```

**影响**：仅新增一行导入，无功能变更。

### Step 2: backup.rs — config_dir().unwrap() 修复

**问题**：`webdav()` get、`local()` get、`aliyun()` get 三个分支中 `config_dir().unwrap()` 在无 `$HOME` 时 panic。

**修复**（3 处相同模式）：

```rust
// Before:
let mut config_dir_path = config_dir().unwrap();

// After:
let mut config_dir_path = match config_dir() {
    Some(v) => v,
    None => return Err(Error::Error("Get Config Dir Error".into())),
};
```

**位置**：
- `webdav()` get 分支（修复前 L38）
- `local()` get 分支（修复前 L163）
- `aliyun()` get 分支（修复前 L193）

### Step 3: window.rs — monitor/cache_dir panic 修复

**3.1 get_current_monitor() — available_monitors()**

```rust
// Before:
let monitors = daemon_window.available_monitors().unwrap();

// After:
let monitors = match daemon_window.available_monitors() {
    Ok(v) => v,
    Err(e) => {
        warn!("Failed to enumerate monitors: {}", e);
        return daemon_window.primary_monitor()
            .unwrap_or(None)
            .unwrap_or_else(|| {
                // No monitors available — application cannot function
                panic!("No monitors available");
            });
    }
};
```

**3.2 ocr_recognize() macOS — cache_dir + create_dir_all**

```rust
// Before:
let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
// ...
fs::create_dir_all(&app_cache_dir_path).expect("Create Cache Dir Failed");

// After:
let mut app_cache_dir_path = match cache_dir() {
    Some(v) => v,
    None => { warn!("Get Cache Dir Failed"); return; }
};
// ...
if let Err(e) = fs::create_dir_all(&app_cache_dir_path) {
    warn!("Create Cache Dir Failed: {}", e);
    return;
}
```

**3.3 ocr_translate() macOS — 同上模式**

### Step 4: system_ocr.rs — cache_dir().expect() 修复

全部 3 个平台实现（Windows/macOS/Linux）中相同的修复模式：

```rust
// Before:
let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");

// After:
let mut app_cache_dir_path = match cache_dir() {
    Some(v) => v,
    None => return Err("Get Cache Dir Failed".to_string()),
};
```

---

## 三、验证命令

```bash
# Rust 编译检查
cd YiPot/src-tauri && cargo check

# 前端构建
cd YiPot && pnpm build

# Rust lint（可选）
cd YiPot/src-tauri && cargo clippy -- -W clippy::unwrap_used 2>&1 | grep -v "aborting"
```

### 验证清单

- [x] `cargo check` 编译通过
- [x] `pnpm build` 构建通过
- [ ] Wayland 环境截图 OCR 不崩溃
- [ ] 无 `$HOME` 时备份/OCR 功能返回错误而非 panic
- [ ] 旧版 WebView2 中主题检测失败不崩溃

---

## 四、回滚方案

所有变更均为单文件局部替换，不涉及数据结构或 API 契约变更。如需回滚：

```bash
git revert <commit-hash>
```

---

## 五、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/65-prd-深度健壮性修复第二轮.md` |
| 测试 | `../tests/2026-09/111-prd-test-深度健壮性修复第二轮.md` |
| Bug - warn | `../bugs/功能缺陷/011-Appjsx-warn未导入运行时错误.md` |
| Bug - backup | `../bugs/功能缺陷/012-backup-config-dir-unwrap残留.md` |
| Bug - window/ocr | `../bugs/功能缺陷/013-window-systemocr-cache-expect-monitor-unwrap.md` |
| 前序开发方案 | `100-prd-task-代码质量与健壮性修复.md` |