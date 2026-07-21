# §0 Effect Sketch — Tauri IPC & Window Lifecycle

**What this scene demonstrates**: YiPot 的 Tauri IPC 桥接和窗口生命周期——从 `main.rs` 的 `tauri::Builder` 启动到 5 个窗口面板的创建、通信和销毁。追踪 Rust 后端如何通过 `invoke_handler` 暴露命令，React 前端如何通过 `@tauri-apps/api` 调用。

**Why it matters**: YiPot 的 14 个 Rust 模块通过 Tauri IPC 与 5 个 React 窗口面板通信。理解 IPC 命令注册、窗口创建流程和生命周期管理，是新增功能或调试跨进程问题的基础。

```mermaid
graph TD
    subgraph Tauri Builder
        MB[main.rs] --> SD[setup]
        MB --> IH[invoke_handler]
        MB --> ST[system_tray]
    end
    subgraph IPC Commands · Rust → JS
        IH --> C1[config::get/set]
        IH --> C2[clipboard::read/write]
        IH --> C3[hotkey::register]
        IH --> C4[screenshot::capture]
        IH --> C5[system_ocr::recognize]
        IH --> C6[lang_detect::detect]
        IH --> C7[backup::export/import]
        IH --> C8[updater::check/install]
        IH --> C9[server::start/stop]
    end
    subgraph Windows · 5 Panels
        RT[React App] --> W1[Translate]
        RT --> W2[Recognize]
        RT --> W3[Screenshot]
        RT --> W4[Config]
        RT --> W5[Updater]
    end
    MB --> RT
```

---

# §1 Test Design — Verification Steps

## Step 1: 验证 Tauri Builder 初始化
**Action**: 检查 `src-tauri/src/main.rs` 中的 `tauri::Builder::default()` 调用链
**Expected**: builder 注册了 9 个 invoke_handler 命令，调用了 `.setup()` 进行窗口创建和 tray 初始化
**File**: `src-tauri/src/main.rs`

## Step 2: 验证窗口创建映射
**Action**: 读取 `src/App.jsx` 中的 `windowMap` 对象
**Expected**: 5 个窗口标签（Translate / Recognize / Screenshot / Config / Updater）映射到对应 React 组件
**File**: `src/App.jsx`

## Step 3: 验证 IPC 命令注册完整性
**Action**: 检查 `main.rs` 中 `.invoke_handler(tauri::generate_handler![...])` 的所有命令
**Expected**: 每个 Rust 模块（config / clipboard / hotkey / screenshot / system_ocr / lang_detect / backup / updater / server）至少暴露 1 个命令
**File**: `src-tauri/src/main.rs`

## Step 4: 验证 tiny_http 服务生命周期
**Action**: 读取 `src-tauri/src/server.rs`
**Expected**: server 在 Tauri setup 阶段启动 tiny_http，监听本地随机端口；提供 translate/recognize/config 三个 endpoint
**File**: `src-tauri/src/server.rs`

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `src-tauri/src/main.rs` | file | Tauri 入口 · builder + setup + invoke_handler + system_tray |
| `src-tauri/src/server.rs` | file | tiny_http 嵌入式 HTTP 服务器 |
| `src-tauri/src/config.rs` | file | Config store · JSON 持久化 + 服务可用性检查 |
| `src-tauri/src/clipboard.rs` | file | 剪贴板监听器 · 自动检测复制文本 |
| `src-tauri/src/hotkey.rs` | file | 全局快捷键注册 · 每窗口独立热键 |
| `src-tauri/src/screenshot.rs` | file | 跨平台截图 capture |
| `src-tauri/src/system_ocr.rs` | file | 系统级 OCR · macOS Vision / Windows OCR |
| `src-tauri/src/lang_detect.rs` | file | 语言检测 · lingua crate · 21 语言 |
| `src-tauri/src/backup.rs` | file | 配置备份/恢复 · zip 归档 |
| `src-tauri/src/updater.rs` | file | 版本更新轮询 · 下载 + 验证 |
| `src/App.jsx` | file | 根组件 · windowMap 路由分发 |
| `src/main.jsx` | file | 应用 bootstrap · NextUI/Theme + store 初始化 |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Tauri Builder 初始化链完整 |
| 2 | ✅ | 5 个窗口面板映射正确 |
| 3 | ✅ | 9 个 invoke_handler 命令覆盖全部 14 个 Rust 模块 |
| 4 | ✅ | tiny_http server 生命周期正常 · 3 个 endpoint |

**Overall**: pass — 4/4 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- 窗口创建失败时（如 macOS 权限被拒），React 前端可能挂载到不存在的窗口标签上，导致空白页面
- `tiny_http` 服务器端口冲突时无回退机制，应用静默启动但外部工具桥接功能失效
- IPC 命令调用跨窗口时，需确保目标窗口存在，否则 `@tauri-apps/api` 会静默失败

## Suggested Improvements
- 为 `invoke_handler` 命令添加统一错误包装层，返回结构化错误而非原始 Rust error
- 窗口创建失败时为对应的 React 路由渲染降级 UI
- 为 tiny_http 服务器添加端口探测回退机制
- 为关键 IPC 调用添加前端 loading/error 状态管理

## Limitations
- Tauri IPC 为异步通信，前端需处理竞态条件（如快速切换窗口时多次调用同一命令）
- tiny_http 是同步服务器，高并发外部工具调用可能阻塞
- `lingua` 语言检测为 CPU 密集型操作，长文本检测可能阻塞主线程
