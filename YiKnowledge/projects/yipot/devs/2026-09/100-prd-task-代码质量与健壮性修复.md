---
doc_type: dev
title: "YiPot 代码质量与健壮性修复 — 开发方案"
tags:
- 开发方案
- 代码质量
- Rust
- panic防护
- 路由优化
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
prd_month: '202609'
dev_id: YP-09-100
prd_ref: YP-09-60
estimate: 0.75
review_status: 已评审
roles:
- engineer
---

# YiPot 代码质量与健壮性修复 — 开发方案

> 开发编号：YP-09-100 · 关联 PRD：YP-09-60 · 预估人天：0.75d

---

## 一、变更清单

### 1.1 Rust 后端

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src-tauri/src/main.rs` | 修改 | 4 处 `.unwrap()` → `.unwrap_or()` |
| `src-tauri/src/window.rs` | 修改 | 7 处 `.unwrap()` → `.unwrap_or()` |
| `src-tauri/src/server.rs` | 重构 | URL 路由分离 path/query + 移除死函数 |
| `src-tauri/src/clipboard.rs` | 修改 | `Mutex<String>` → `Mutex<bool>` |

### 1.2 React 前端

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/yiaiAdapter.ts` | 修改 | 删除未使用的 `YIAI_ENABLED` |
| `src/App.jsx` | 修改 | 删除未使用的 `warn` 导入，`let` → `const` |

---

## 二、实施步骤

### Step 1: Rust panic 防护（main.rs）

在 `setup()` 闭包中，修改 3 处配置读取调用：

```rust
// 1. proxy 配置
if v.as_bool().unwrap_or(false) && get("proxy_host").map_or(false, |host| !host.as_str().unwrap_or("").is_empty()) {

// 2. 语言检测引擎
if engine.as_str().unwrap_or("") == "local" {

// 3. 剪切板监听
let clipboard_monitor = match get("clipboard_monitor") {
    Some(v) => v.as_bool().unwrap_or(false),
```

同时修改剪切板状态初始化，从 `.to_string()` 改为直接使用 bool 值。

### Step 2: Rust panic 防护（window.rs）

修改 `translate_window()` 和 `recognize_window()` 中的配置读取，统一使用 `unwrap_or()`：

- `translate_window_width`: `unwrap_or(350)`
- `translate_window_height`: `unwrap_or(420)`
- `translate_window_position`: `unwrap_or("mouse")`
- `translate_window_position_x/y`: `unwrap_or(0)`
- `recognize_window_width`: `unwrap_or(800)`
- `recognize_window_height`: `unwrap_or(400)`
- `input_translate()` 中的 `position_type`: `unwrap_or("mouse")`

### Step 3: HTTP 路由重构（server.rs）

将 `http_handle()` 的 match 从完整 URL 匹配改为 path 匹配：

```rust
fn http_handle(request: Request) {
    let url = request.url();
    let path = url.split('?').next().unwrap_or(url);

    match path {
        "/" => response_ok(request),
        "/config" => handle_config(request),
        "/translate" => handle_translate(request),
        "/selection_translate" => handle_selection_translate(request),
        "/input_translate" => handle_input_translate(request),
        "/ocr_recognize" => {
            let screenshot = url.contains("screenshot=true");
            if screenshot { ocr_recognize(); } else { recognize_window(); }
            response_ok(request);
        }
        "/ocr_translate" => {
            let screenshot = url.contains("screenshot=true");
            if screenshot { ocr_translate(); } else { image_translate(); }
            response_ok(request);
        }
        _ => warn!("Unknown request url: {}", url),
    }
}
```

删除已内联的 `handle_ocr_recognize()` 和 `handle_ocr_translate()` 函数。

### Step 4: 剪切板类型安全（clipboard.rs + main.rs）

```rust
// clipboard.rs
pub struct ClipboardMonitorEnableWrapper(pub Mutex<bool>);

// main.rs
app.manage(ClipboardMonitorEnableWrapper(Mutex::new(clipboard_monitor)));
```

### Step 5: 前端死代码清理

- `yiaiAdapter.ts`: 删除第 13 行 `const YIAI_ENABLED = true;`
- `App.jsx`: 删除 `warn` 导入，`let allowKeys` → `const allowKeys`（2 处）

---

## 三、验证命令

```bash
# Rust 编译检查
cd YiPot/src-tauri && cargo check

# 前端构建
cd YiPot && pnpm build

# 完整 Tauri 构建检查（如有环境）
cd YiPot && pnpm tauri build --debug
```

---

## 四、回滚方案

所有变更均为单文件局部修改，不涉及数据结构或 API 契约变更。如需回滚，`git revert` 对应 commit 即可。

---

## 五、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/60-prd-代码质量与健壮性修复.md` |
| 测试 | `../tests/2026-09/100-prd-test-代码质量与健壮性修复.md` |
| Bug - panic | `../bugs/功能缺陷/005-Rust配置读取unwrap-panic风险.md` |
| Bug - 路由 | `../bugs/功能缺陷/006-HTTP路由URL解析缺陷.md` |
| Bug - 剪切板 | `../bugs/功能缺陷/007-剪切板状态字符串布尔反模式.md` |
| Bug - 前端 | `../bugs/功能缺陷/008-前端死代码与let声明.md` |
| Bug - warn | `../bugs/功能缺陷/011-Appjsx-warn未导入运行时错误.md` |
| Bug - backup | `../bugs/功能缺陷/012-backup-config-dir-unwrap残留.md` |
| Bug - window/ocr | `../bugs/功能缺陷/013-window-systemocr-cache-expect-monitor-unwrap.md` |

---

## 七、第二轮修复（2026-09-23）

### 7.1 App.jsx warn() 导入修复

Bug #008 修复时错误地删除了 `warn` 导入，但 `catch` 块中的 `warn("Can't detect system theme.")` 仍在使用。

**修复**：恢复 `import { warn } from 'tauri-plugin-log-api';`

### 7.2 backup.rs config_dir().unwrap() 修复

`webdav()` get 分支、`local()` get 分支、`aliyun()` get 分支仍保留 `config_dir().unwrap()`。

**修复**：全部 3 处替换为 `match config_dir() { Some(v) => v, None => return Err(...) }`。

### 7.3 window.rs monitor/cache_dir unwrap 修复

| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| `get_current_monitor()` | `available_monitors().unwrap()` | `match` + warn + fallback |
| `ocr_recognize()` macOS | `cache_dir().expect(...)` | `match` + warn + return |
| `ocr_recognize()` macOS | `create_dir_all(...).expect(...)` | `if let Err(e) = ...` + warn + return |
| `ocr_translate()` macOS | `cache_dir().expect(...)` | `match` + warn + return |
| `ocr_translate()` macOS | `create_dir_all(...).expect(...)` | `if let Err(e) = ...` + warn + return |

### 7.4 system_ocr.rs cache_dir().expect() 修复

全部 3 平台（Windows/macOS/Linux）的 `cache_dir().expect(...)` 替换为 `match` + `Err(...)` 返回。

### 7.5 验证

- `cargo check` ✓
- `pnpm build` ✓