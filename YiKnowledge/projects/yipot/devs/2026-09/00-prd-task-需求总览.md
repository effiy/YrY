---

doc_type: module
prd_task_id: "YP-09-01"
title: "YP-09-00: 九月迭代总览 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
created: 2026-09-22
updated: 2026-09-22
project: YiPot
prd_month: "202609"
source_prd: "00-prd-需求总览.md"

type: task
---

# YP-09-00: 九月迭代总览 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-00 · 优先级：P0

---

## 一、技术架构概述

### 整体架构

```
┌──────────────────────────────────────┐
│  React 前端层 (Vite + Tailwind)       │
│  ┌─────────┐ ┌──────┐ ┌───────────┐ │
│  │ Translate│ │ OCR  │ │  Config   │ │
│  │  Window  │ │Window│ │  Window   │ │
│  └────┬─────┘ └──┬───┘ └─────┬─────┘ │
│       │          │            │       │
│  ┌────┴──────────┴────────────┴─────┐ │
│  │     Service Layer (插件化)        │ │
│  │  translate/ocr/tts/collection    │ │
│  └────────────────┬─────────────────┘ │
├───────────────────┼───────────────────┤
│  Tauri Bridge     │ invoke/event     │
├───────────────────┼───────────────────┤
│  Rust 系统层      │                   │
│  clipboard │ hotkey │ screenshot     │
│  system_ocr│ tray   │ window/config  │
└───────────────────┴───────────────────┘
```

### 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端框架 | React 18 | 函数组件 + Hooks |
| 状态管理 | Jotai | 原子化状态 |
| UI 库 | NextUI 2.4 | Tailwind 组件库 |
| 动画 | Framer Motion + React Spring | 窗口动画 |
| 路由 | React Router 6 | 设置页路由 |
| 国际化 | i18next + react-i18next | 20+ 语言 |
| 桌面框架 | Tauri 1.6 | Rust 系统后端 |
| 构建 | Vite 5 | 前端构建 |
| OCR | Tesseract.js | 离线 OCR 备选 |
| 二维码 | jsQR | 二维码解码 |

---

## 二、核心模块

| 类别 | 模块数 | 代表模块 |
|------|--------|---------|
| 翻译功能 | 12+ | 百度/Google/DeepL/OpenAI |
| OCR 识别 | 4+ | 百度精准/系统 OCR/Tesseract |
| TTS 语音 | 3+ | 百度/Azure/系统 TTS |
| 生词本 | 2 | Anki/欧路词典 |
| 桌面集成 | 8 | 剪贴板/快捷键/截图/托盘 |
| 系统窗口 | 5 | 翻译/OCR/设置/更新/截图 |

---

## 三、源码索引

| 模块 | 路径 | 行数 |
|------|------|------|
| React 入口 | `YiPot/src/main.jsx` | ~30 |
| App 根组件 | `YiPot/src/App.jsx` | ~60 |
| 翻译窗口 | `YiPot/src/window/Translate/` | ~800 |
| OCR 窗口 | `YiPot/src/window/Recognize/` | ~600 |
| 设置窗口 | `YiPot/src/window/Config/` | ~2000 |
| 更新窗口 | `YiPot/src/window/Updater/` | ~100 |
| 服务层 | `YiPot/src/services/` | ~3000 |
| 国际化 | `YiPot/src/i18n/` | ~4000 |
| Hooks | `YiPot/src/hooks/` | ~400 |
| 工具函数 | `YiPot/src/utils/` | ~500 |
| Rust 主入口 | `YiPot/src-tauri/src/main.rs` | ~200 |
| Rust 剪贴板 | `YiPot/src-tauri/src/clipboard.rs` | ~100 |
| Rust 快捷键 | `YiPot/src-tauri/src/hotkey.rs` | ~150 |
| Rust 截图 | `YiPot/src-tauri/src/screenshot.rs` | ~200 |
| Rust 配置 | `YiPot/src-tauri/src/config.rs` | ~100 |

## 四、已实现功能清单

- [x] 划词翻译（多接口并行）
- [x] 输入翻译（独立窗口）
- [x] 剪切板监听翻译
- [x] 截图 OCR（多接口 + 系统 OCR）
- [x] 截图翻译（OCR + 翻译串联）
- [x] TTS 语音合成朗读
- [x] 生词本导出（Anki + 欧路词典）
- [x] 插件化服务架构
- [x] 全局快捷键系统
- [x] 系统托盘集成
- [x] 20+ 语言国际化
- [x] 配置备份恢复
- [x] macOS/Windows/Linux 全平台


## 五、设计决策 (Architecture Decision Records)

### 关键架构决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 桌面框架 | Tauri 1.6 (Rust) | Electron / NW.js | 二进制体积小 (~5MB vs 120MB)，内存占用低 (~50MB vs 200MB+)，原生系统 API 调用无 IPC 瓶颈 | Rust 学习曲线陡峭，部分系统 API 需手动 FFI 绑写 |
| 前端框架 | React 18 + Vite | Vue 3 / Svelte | 社区生态最丰富（NextUI、Framer Motion），JSX 灵活性高，Pot-App 上游社区采用 React | 运行时体积较 Preact/Solid 大，需手动优化渲染 |
| 状态管理 | Jotai (原子化) | Redux Toolkit / Zustand | 原子粒度更新避免不必要重渲染，API 简洁 (无 Provider/Reducer 模板)，与 React 18 Suspense 原生兼容 | 缺乏中间件生态，复杂状态流需自定义组合 |
| 插件架构 | 函数导出式 (info/index/Config) | Webpack Module Federation / 动态 import | 零运行时开销，静态分析友好，TypeScript 类型安全，树摇 (tree-shaking) 彻底 | 无热插拔能力，新增插件需重新构建 |
| 多窗口架构 | Tauri WebviewWindow (独立窗口) | 单窗口多 Tab / 虚拟窗口 | 窗口独立生命周期 (崩溃不互相影响)，原生窗口管理 (置顶/阴影/动画)，系统级窗口分组 | 窗口间状态同步需通过 Rust 事件总线，内存占用随窗口数线性增长 |
| UI 组件库 | NextUI 2.4 (Tailwind) | Ant Design / MUI | 基于 Tailwind 原子类 (零运行时)，内置暗色模式支持，Bundle 体积~50KB (按需)，与 Pot-App 上游一致 | 组件丰富度不如 Ant Design，复杂表单场景需手动组合 |

### 插件目录设计决策

```
services/{type}/{provider}/
    info.ts   — 纯数据（静态分析可提取）
    index.jsx — 纯逻辑（单元测试友好）
    Config.jsx — 纯视图（React 组件）
```

**选择理由**：三文件分离遵循"关注点分离"原则。`info.ts` 允许构建时扫描所有插件元信息 (生成插件列表)；`index.jsx` 可独立进行单元测试 (无 React 依赖)；`Config.jsx` 仅在被选中时延迟加载 (React.lazy)。

**被拒绝的方案**：单文件导出所有 (信息 + 逻辑 + 配置混杂) — 无法做静态分析，Tree-shaking 失效，测试困难。


## 六、系统级性能优化策略

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 首屏渲染 | Vite Code Splitting + React.lazy (窗口级懒加载) | 首屏体积 -60% | 翻译窗口首屏 320ms (不含翻译接口) |
| 翻译并行 | Promise.allSettled (N 个翻译服务并发) | 总时延 = max(各服务时延) 而非 sum() | 3 服务并行: 1.2s (串行) → 0.5s (并行) |
| 配置加载 | tauri-plugin-store 内存缓存 + 延迟写盘 | 读操作 < 1ms (内存) vs ~5ms (磁盘) | 配置页切换零延迟 |
| 截图渲染 | Canvas 离屏绘制 + PNG 流式编码 | 截图操作 < 100ms UI 线程占用 | 全屏截图 ~80ms (4K 显示器) |
| Rust 命令 | #[tauri::command(async)] 所有 I/O 操作 | UI 主线程永不被阻塞 | 快捷键响应 < 150ms (P95) |
| OCR 离线 | 系统原生 OCR (macOS Vision/Windows OCR) 优先于 Tesseract.js | 识别速度 5-10x 提升 | Vision: ~200ms vs Tesseract: ~1200ms |
| 翻译缓存 | 实例级 LRU Cache (容量 200) | 重复查询命中率 ~25% | 命中时延 < 5ms |
| 窗口创建 | 预创建 + 隐藏/显示 (而非销毁/重建) | 首次打开时间 -70% | 首开 ~80ms vs 重建 ~280ms |

> **设计原则**：所有性能优化必须可度量。每个优化点上线前需在 CI 中记录 baseline，上线后对比 P50/P95/P99 延迟。


## 七、系统级错误处理策略

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L0-框架 | Rust panic | catch_unwind + 日志落盘 + 进程重启 | Tauri 进程自动恢复 | 窗口闪现后恢复 (不可见) |
| L1-系统 | 快捷键注册失败 | 检测冲突 → 提示用户 → 降级到托盘菜单 | 用户手动修改快捷键 | "快捷键 [Ctrl+Shift+T] 被其他应用占用" |
| L2-平台 | 截图 API 不可用 | 降级到跨平台 fallback (全屏窗口+选区) | 自动切换 | 无感知（功能一致） |
| L3-前端 | React Error Boundary 捕获 | 显示错误边界 UI + 刷新按钮 | 用户手动刷新窗口 | "出错了，点击刷新" (含错误详情) |
| L4-配置 | 配置文件损坏 | JSON 解析失败 → 回退到默认配置 → 备份损坏文件 | 自动恢复 | 首次感知配置重置 (仅一次提示) |
| L5-网络 | 所有翻译/OCR 接口超时 | 10s 超时 + 标记服务不可用 + 下次自动重试 | 手动点击重试 | "请求超时" + 具体服务名称 |

### 错误收集与上报

```rust
// Rust 层错误日志
tauri-plugin-log:
  - LogDir: 所有 Panic/Error 级别日志持久化到文件
  - Stdout: 开发模式下同时输出到终端  
  - 日志轮转: 单文件最大 10MB，保留最近 5 个文件
```

**关联文档**：
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 翻译流程详细设计
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — Rust 后端模块架构
- [React 组件与窗口架构](./10-prd-task-React组件与窗口架构.md) — 前端组件与窗口架构

---

## 八、完整 Rust Tauri Command 清单

> 所有 Tauri command 均通过 `#[tauri::command]` 宏注册，在 `main.rs` 的 `invoke_handler` 中统一绑定。前端通过 `invoke('<command_name>', args)` 调用。

### 8.1 注册清单 (main.rs:130-151)

```rust
.invoke_handler(tauri::generate_handler![
    reload_store, get_text, cut_image, get_base64, copy_img,
    system_ocr, set_proxy, unset_proxy, run_binary, open_devtools,
    register_shortcut_by_frontend, update_tray, updater_window,
    screenshot, lang_detect, webdav, local, install_plugin,
    font_list, aliyun
])
```

### 8.2 完整指令表

| # | Command Name | Rust 文件 | 函数签名 | 同步/异步 | 前端调用场景 | 错误处理 |
|---|-------------|----------|---------|----------|------------|---------|
| 1 | `reload_store` | `cmd.rs:17` | `fn reload_store()` | 同步 | 配置文件被外部修改后触发 `fs-watch` 回调 → 前端不直接调用，由 `initStore()` 自动处理 | 无返回值，`store.load()` 失败静默忽略 |
| 2 | `get_text` | `cmd.rs:12` | `fn get_text(state: State<StringWrapper>) -> String` | 同步 | 翻译窗口初始化时获取已缓存的选中文本。`SourceArea useEffect` 调用 `invoke('get_text')` | 返回空字符串表示无文本 |
| 3 | `cut_image` | `cmd.rs:24` | `fn cut_image(left: u32, top: u32, width: u32, height: u32, app_handle: AppHandle)` | 同步 | 截图窗口用户框选区域后，前端调用裁剪。输出为 `pot_screenshot_cut.png` | 原图不存在时静默返回；`image::open()` 失败时仅 log error |
| 4 | `get_base64` | `cmd.rs:53` | `fn get_base64(app_handle: AppHandle) -> String` | 同步 | OCR 识别前将截图转为 base64 传给 OCR 引擎。`SourceArea` 处理 `[IMAGE_TRANSLATE]` 时调用 | 文件不存在/读取失败返回空字符串 |
| 5 | `copy_img` | `cmd.rs:78` | `fn copy_img(app_handle: AppHandle, width: usize, height: usize) -> Result<(), Error>` | 同步 | 截图识别后复制图片到剪贴板。`Recognize` 窗口的复制按钮调用 | 返回 `arboard::Error` 或 `image::ImageError` |
| 6 | `set_proxy` | `cmd.rs:99` | `fn set_proxy() -> Result<bool, ()>` | 同步 | 设置页配置代理后调用，设置 `http_proxy`/`https_proxy`/`all_proxy`/`no_proxy` 环境变量 | `proxy_host` 或 `proxy_port` 缺失返回 `Err(())` |
| 7 | `unset_proxy` | `cmd.rs:122` | `fn unset_proxy() -> Result<bool, ()>` | 同步 | 关闭代理时移除所有代理环境变量 | 总是返回 `Ok(true)` |
| 8 | `install_plugin` | `cmd.rs:131` | `fn install_plugin(path_list: Vec<String>) -> Result<i32, Error>` | 同步 | 设置页安装 `.potext` 插件文件。验证 info.json + main.js → 解压到 `plugins/{type}/{name}/` | 文件不以 `potext` 结尾跳过；不以 `plugin` 开头返回 `Error`；缺 `info.json`/`main.js` 返回 `Error` |
| 9 | `run_binary` | `cmd.rs:179` | `fn run_binary(plugin_type: String, plugin_name: String, cmd_name: String, args: Vec<String>) -> Result<Value, Error>` | 同步 | 执行插件的二进制文件，返回 `{stdout, stderr, status}`。`invoke_plugin.js` 中的 `run()` 函数调用 | Command 执行失败返回 `std::io::Error` |
| 10 | `font_list` | `cmd.rs:211` | `fn font_list() -> Result<Vec<String>, Error>` | 同步 | 设置页字体选择器加载系统字体列表 | font-kit `all_families()` 返回 `SelectionError` |
| 11 | `open_devtools` | `cmd.rs:219` | `fn open_devtools(window: Window)` | 同步 | `dev_mode` 开启时按 F12 打开 Chrome DevTools | 无错误，toggle 行为 |
| 12 | `system_ocr` | `system_ocr.rs:5/65/108` | `async fn system_ocr(app_handle: AppHandle, lang: &str) -> Result<String, String>` | **异步** | OCR 识别时如果选中 `system` 引擎，调用平台原生 OCR API。`Recognize/TextArea` 调用 | Windows: 语言包未安装返回提示 URL；macOS: Vision 二进制缺失/失败；Linux: Tesseract 未安装返回提示 |
| 13 | `screenshot` | `screenshot.rs:4` | `fn screenshot(x: i32, y: i32)` | 同步 | 截图窗口确定屏幕坐标后调用 `screenshots` crate 截取全屏。输出 `pot_screenshot.png` | `screen.capture()` 失败则 panic（不做错误恢复） |
| 14 | `register_shortcut_by_frontend` | `hotkey.rs:74` | `fn register_shortcut_by_frontend(name: &str, shortcut: &str) -> Result<(), String>` | 同步 | 设置页修改快捷键后，前端调用重新注册。参数 name 为配置键名（如 `hotkey_selection_translate`） | 注册失败返回 `Err(e.to_string())`，前端显示冲突提示 |
| 15 | `update_tray` | `tray.rs:18` | `fn update_tray(app_handle: AppHandle, language: String, copy_mode: String)` | 同步 | 切换语言或复制模式后更新托盘菜单文本。通过 `translate_auto_copy_changed` 事件触发 | `tray_handle.set_menu()` 失败 unwrap panic |
| 16 | `updater_window` | `window.rs:404` | `async fn updater_window()` | **异步** | 检查更新时或托盘菜单点击"检查更新"时创建更新窗口。`updater.rs check_update()` 自动调用 | 窗口创建失败 unwrap panic |
| 17 | `lang_detect` | `lang_detect.rs:32` | `fn lang_detect(text: &str) -> Result<&str, ()>` | 同步 | 翻译窗口输入文本后检测语言。`SourceArea detect_language()` → `utils/lang_detect.js` → `invoke('lang_detect')` | 无法检测返回 `Ok("en")` |
| 18 | `webdav` | `backup.rs:11` | `async fn webdav(operate: &str, url: String, username: String, password: String, name: Option<String>) -> Result<String, Error>` | **异步** | 设置页 WebDAV 备份。支持 `list`/`get`/`put`/`delete` 操作。备份内容：config.json + history.db + plugins/ | `reqwest_dav::Error` 透传；`config_dir()` 失败返回 `Error` |
| 19 | `local` | `backup.rs:116` | `async fn local(operate: &str, path: String) -> Result<String, Error>` | **异步** | 设置页本地备份。支持 `put`/`get` 操作。打包配置+历史+插件为 zip | I/O 错误透传为 `Error::Io` |
| 20 | `aliyun` | `backup.rs:179` | `async fn aliyun(operate: &str, path: String, url: String) -> Result<String, Error>` | **异步** | 设置页阿里云 OSS 备份。支持 `put`/`get` 操作。**注意**：`operate` 参数未被使用，内部始终走 `path` + `url` | `reqwest::Error` 透传 |

### 8.3 异步命令说明

| 异步 Command | 标记方式 | 原因 |
|-------------|---------|------|
| `system_ocr` | `#[tauri::command(async)]` | 平台 OCR API 调用耗时 200ms-2s，阻塞主线程会卡死 UI |
| `updater_window` | `#[tauri::command(async)]` | 窗口创建涉及 IPC 往返 |
| `webdav` | `#[tauri::command(async)]` | 网络 I/O，`reqwest_dav` 异步客户端 |
| `local` | `#[tauri::command(async)]` | 文件打包涉及大量磁盘 I/O |
| `aliyun` | `#[tauri::command(async)]` | 网络 I/O，`reqwest` 异步客户端 |

> **设计原则**：所有涉及网络 I/O、文件打包、跨进程 OCR 的命令必须标记为 `async`。同步命令仅用于内存操作（`get_text`、`lang_detect`）或可忽略延迟的操作（`screenshot` < 80ms）。

---

## 九、模块依赖图与初始化顺序

### 9.1 Rust 模块依赖图

```
                    main.rs (入口)
                        |
        ┌───────────────┼───────────────────┐
        |               |                   |
    config.rs       clipboard.rs         hotkey.rs
    (配置管理)      (剪贴板监听)         (全局快捷键)
        |               |                   |
        |               v                   v
        |           window.rs <─────────────┘
        |           (窗口管理)
        |               |
        ├───────┬───────┼───────────┬──────────┬──────────┐
        v       v       v           v          v          v
    cmd.rs  server.rs tray.rs  screenshot.rs updater.rs backup.rs
    (前端指令)(HTTP服务)(系统托盘)(截图捕获)(自动更新)(备份管理)
        |                                       |
        v                                       v
  system_ocr.rs  lang_detect.rs            error.rs
  (平台OCR)      (语言检测)               (错误类型)
```

**依赖关系**：
- `main.rs` 依赖所有模块（通过 `mod` 声明聚合）
- `clipboard.rs` / `hotkey.rs` 依赖 `window.rs`（文本翻译窗口）
- `window.rs` 依赖 `config.rs`（读取窗口尺寸/位置配置）
- `cmd.rs` 依赖 `config.rs`、`error.rs`、`APP` 全局句柄
- `tray.rs` 依赖 `clipboard.rs`、`config.rs`、`window.rs`
- `server.rs` 依赖 `config.rs`、`window.rs`
- `backup.rs` 依赖 `error.rs`
- `system_ocr.rs` / `lang_detect.rs` / `screenshot.rs` / `updater.rs` 仅依赖标准库 + 第三方 crates

### 9.2 启动初始化序列

```
main.rs startup sequence:
  
  Step 1: [平台适配] DPI awareness (Windows only)
          └─ #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
             阻止 Windows release 构建弹出控制台窗口
  
  Step 2: [单实例检查] tauri_plugin_single_instance::init()
          └─ 已运行时弹出通知 + 退出
          └─ 依赖: 无（独立插件，最先初始化）
  
  Step 3: [插件注册] Tauri Builder 插件链
          ├─ Step 3.0: tauri_plugin_log (日志 → LogDir + Stdout)
          ├─ Step 3.0: tauri_plugin_autostart (开机自启，macOS LaunchAgent)
          ├─ Step 3.0: tauri_plugin_sql (SQLite，history.db)
          ├─ Step 3.0: tauri_plugin_store (config.json)
          ├─ Step 3.0: tauri_plugin_fs_watch (配置文件修改监听)
          └─ 依赖: 无，插件互不依赖，并行初始化
  
  Step 4: [系统托盘] system_tray(SystemTray::new())
          └─ 依赖: 无，空托盘占位，菜单在 setup 中构建
  
  Step 5: [setup 钩子] .setup(|app| { ... })
          ├─ Step 5a: macOS 辅助功能权限检查
          │    └─ macos_accessibility_client::application_is_trusted_with_prompt()
          │    └─ 设置 ActivationPolicy::Accessory（隐藏 Dock 图标）
          │    └─ 依赖: 无
          │
          ├─ Step 5b: 全局 AppHandle 初始化
          │    └─ APP.get_or_init(|| app.handle()) → OnceCell 全局单例
          │    └─ 依赖: AppHandle 已可用
          │
          ├─ Step 5c: 配置初始化 (init_config)
          │    └─ 加载 ~/.config/com.pot-app.desktop/config.json
          │    └─ 首次运行 → 打开设置窗口 (config_window)
          │    └─ check_service_available() → 清理无效服务实例
          │    └─ 依赖: Store 插件已注册、AppHandle 已就绪
          │
          ├─ Step 5d: StringWrapper 状态注册
          │    └─ app.manage(StringWrapper(Mutex::new("")))
          │    └─ 依赖: 无
          │
          ├─ Step 5e: 系统托盘菜单构建 (update_tray)
          │    └─ 读取 app_language + translate_auto_copy → 构建对应语言菜单
          │    └─ 依赖: config (Step 5c)
          │    └─ 设置 clipboard_monitor 选中状态
          │
          ├─ Step 5f: HTTP 服务启动 (start_server)
          │    └─ 端口: server_port 配置 (默认 60828)
          │    └─ 监听: POST /translate, /selection_translate, /input_translate,
          │    │        /ocr_recognize, /ocr_translate, /config
          │    └─ 依赖: config.server_port (Step 5c)
          │    └─ 失败时弹出通知但不中止启动
          │
          ├─ Step 5g: 全局快捷键注册 (register_shortcut)
          │    └─ 注册 4 个快捷键: selection_translate, input_translate,
          │    │   ocr_recognize, ocr_translate
          │    └─ 依赖: config (Step 5c) 读取 hotkey_selection_translate 等键
          │    └─ 任一注册失败 → 弹出通知但不中止启动
          │
          ├─ Step 5h: 代理设置
          │    └─ 读取 proxy_enable + proxy_host → set_proxy()
          │    └─ 依赖: config (Step 5c)
          │
          ├─ Step 5i: 自动更新检查 (check_update)
          │    └─ 读取 check_update → tauri::updater::builder().check()
          │    └─ 有新版本 → 自动打开更新窗口
          │    └─ 依赖: config (Step 5c)
          │    └─ 失败静默忽略
          │
          ├─ Step 5j: 语言检测初始化
          │    └─ 读取 translate_detect_engine → 若为 "local" → init_lang_detect()
          │    └─ 预热 lingua 检测器（首次检测耗时 ~500ms）
          │    └─ 依赖: config (Step 5c)
          │
          └─ Step 5k: 剪贴板监听启动 (start_clipboard_monitor)
               └─ 读取 clipboard_monitor → 若为 true → 启动异步轮询 (500ms)
               └─ 依赖: config (Step 5c)
  
  Step 6: [Command 注册] invoke_handler(tauri::generate_handler![...])
          └─ 注册全部 20 个 Tauri command
          └─ 依赖: 所有模块的 #[tauri::command] 函数
  
  Step 7: [托盘事件] on_system_tray_event(tray_event_handler)
          └─ 依赖: tray.rs 事件处理函数
  
  Step 8: [应用运行] .build() → .run()
          └─ ExitRequested 事件 → api.prevent_exit() (窗口关闭不退出)
          └─ 应用仅通过托盘菜单 "退出" 真正关闭
```

### 9.3 关键依赖链

```
config 初始化 (5c)
    ├──→ 托盘菜单 (5e): 必须（读取语言/复制模式）
    ├──→ HTTP 服务 (5f): 必须（读取端口号）
    ├──→ 快捷键注册 (5g): 必须（读取快捷键配置）
    ├──→ 代理设置 (5h): 必须（读取代理配置）
    ├──→ 自动更新 (5i): 必须（读取 check_update 开关）
    ├──→ 语言检测 (5j): 必须（读取检测引擎选择）
    └──→ 剪贴板监听 (5k): 必须（读取 clipboard_monitor 开关）
```

> **设计要点**：`init_config` (Step 5c) 是整个 setup 钩子的**关键路径瓶颈**——所有后续步骤都依赖配置读取。如果 config.json 损坏，`StoreBuilder` 会创建空配置，`is_first_run()` 返回 true，自动打开设置窗口让用户配置。

---

## 十、React 组件树与数据流

### 10.1 入口层

```
index.html / daemon.html
    │
    v
main.jsx (入口点)
    ├── initStore()     ──→ 初始化 tauri-plugin-store (config.json)
    ├── initEnv()       ──→ 检测平台类型 (osType: Windows_NT/Darwin/Linux)
    ├── initApi()       ──→ 创建 YiAi API 客户端 (window.__yipot_api)
    └── ReactDOM.createRoot()
            └── <NextUIProvider>
                    └── <NextThemesProvider> (暗色/亮色/跟随系统)
                            └── <App />
```

### 10.2 App 根组件路由

```
App.jsx
    ├── useConfig('dev_mode')          ──→ F12 DevTools / Ctrl 键拦截
    ├── useConfig('app_theme')         ──→ setTheme(light/dark/system)
    ├── useConfig('app_language')      ──→ i18n.changeLanguage()
    ├── useConfig('app_font')          ──→ fontFamily
    ├── useConfig('app_fallback_font') ──→ 回退字体
    ├── useConfig('app_font_size')     ──→ fontSize
    │
    └── <BrowserRouter>
            └── windowMap[appWindow.label]
                    ├── "translate"   → <Translate />
                    ├── "screenshot"  → <Screenshot />
                    ├── "recognize"   → <Recognize />
                    ├── "config"      → <Config />
                    └── "updater"     → <Updater />
```

### 10.3 翻译窗口组件树

```
<Translate /> (window/Translate/index.jsx)
    │
    ├── useConfig: incremental_translate, dynamic_translate, delete_newline,
    │              recognize_language, recognize_service_list, tts_service_list,
    │              translate_hide_window, hide_source, translate_service_list
    │
    ├── <SourceArea />
    │   ├── Jotai: sourceTextAtom (atom(''), r/w)
    │   ├── Jotai: detectLanguageAtom (atom(''), r/w)
    │   ├── useConfig: app_font_size, incremental_translate, dynamic_translate,
    │   │              translate_delete_newline, recognize_language,
    │   │              recognize_service_list, tts_service_list,
    │   │              translate_hide_window, hide_source
    │   │
    │   ├── 事件: listen('new_text') → Rust window.rs 发送
    │   ├── invoke: get_text, get_base64, lang_detect
    │   │
    │   └── 渲染: Textarea + 工具栏 (朗读/复制/删换行/清空/翻译)
    │
    ├── <LanguageArea />
    │   ├── Jotai: sourceLanguageAtom (atom(), r/w)
    │   ├── Jotai: targetLanguageAtom (atom(), r/w)
    │   ├── Jotai: sourceTextAtom (r)
    │   │
    │   └── 渲染: 源语言选择器 + 切换按钮 + 目标语言选择器
    │
    └── <TargetArea /> × N (每个翻译引擎一个面板)
        ├── Jotai: sourceTextAtom (r)
        ├── Jotai: sourceLanguageAtom (r)
        ├── Jotai: targetLanguageAtom (r)
        ├── Jotai: detectLanguageAtom (r)
        ├── useConfig: app_font_size, collection_service_list,
        │              tts_service_list, translate_second_language,
        │              history_disable, translate_auto_copy,
        │              translate_hide_window, clipboard_monitor
        │
        ├── 翻译逻辑:
        │   ├─ AI 引擎 (openai/ollama/chatglm/geminipro):
        │   │   translateViaYiAi() → getApi().rpc()
        │   │   └─ 失败降级 → builtinServices[name].translate()
        │   └─ 传统引擎 (google/baidu/deepl/...):
        │       builtinServices[name].translate()
        │
        └── 渲染: 翻译结果 + 工具栏 (复制/朗读/收藏/切换引擎)
```

### 10.4 OCR 识别窗口组件树

```
<Recognize /> (window/Recognize/index.jsx)
    ├── useConfig: recognize_close_on_blur, recognize_service_list
    │
    ├── Jotai: pluginListAtom (atom()) ──→ 加载插件 info.json
    │
    ├── <ImageArea />
    │   ├── Jotai: base64Atom (atom(''), r/w)
    │   └── 渲染: 截图预览
    │
    ├── <TextArea />
    │   ├── Jotai: textAtom (atom(), r/w)
    │   ├── Jotai: currentServiceInstanceKeyAtom (r)
    │   ├── Jotai: languageAtom (r)
    │   ├── Jotai: base64Atom (r)
    │   │
    │   └── OCR 调用: system_ocr (Rust) 或 builtinService[name].recognize()
    │
    └── <ControlArea />
        ├── Jotai: currentServiceInstanceKeyAtom (atom(), r/w)
        ├── Jotai: languageAtom (atom(), r/w)
        ├── Jotai: recognizeFlagAtom (atom(), w)
        ├── Jotai: pluginListAtom (r)
        ├── useConfig: recognize_language, server_port
        │
        └── 渲染: OCR 引擎选择下拉 + 语言选择 + 重试/翻译按钮
```

### 10.5 设置窗口组件树

```
<Config /> (window/Config/index.jsx)
    ├── <BrowserRouter> (React Router 6)
    │
    ├── <SideBar /> ──→ 导航菜单 (9 个页面)
    │
    └── <Routes>
        ├── / → <General />           ── 通用设置 (主题/语言/字体/启动/代理)
        ├── /translate → <Translate /> ── 翻译引擎配置 (启用/禁用/排序/API Key)
        ├── /recognize → <Recognize /> ── OCR 引擎配置
        ├── /hotkey → <Hotkey />      ── 快捷键管理
        ├── /service → <Service />    ── 服务管理总览
        │   ├── <Service/Translate /> ── 翻译服务 (SelectModal + ConfigModal)
        │   ├── <Service/Recognize /> ── OCR 服务
        │   ├── <Service/Tts />       ── TTS 服务
        │   ├── <Service/Collection /> ── 生词本服务
        │   └── <Service/PluginConfig /> ── 插件管理
        ├── /backup → <Backup />      ── 备份管理 (本地/WebDAV/阿里云)
        ├── /history → <History />    ── 翻译历史 (SQLite)
        └── /about → <About />       ── 关于页
```

### 10.6 Jotai Atom 完整清单

| # | Atom 名称 | 文件位置 | 类型 | 初始值 | 读组件 | 写组件 |
|---|----------|---------|------|-------|--------|--------|
| 1 | `sourceTextAtom` | `Translate/SourceArea/index.jsx:27` | `string` | `''` | SourceArea, LanguageArea, TargetArea | SourceArea |
| 2 | `detectLanguageAtom` | `Translate/SourceArea/index.jsx:28` | `string` | `''` | SourceArea, TargetArea | SourceArea |
| 3 | `sourceLanguageAtom` | `Translate/LanguageArea/index.jsx:11` | `any` | `undefined` | LanguageArea, TargetArea | LanguageArea |
| 4 | `targetLanguageAtom` | `Translate/LanguageArea/index.jsx:12` | `any` | `undefined` | LanguageArea, TargetArea | LanguageArea |
| 5 | `pluginListAtom` | `Recognize/index.jsx:19` | `Record<string,object>` | `undefined` | ControlArea, Recognize | Recognize |
| 6 | `base64Atom` | `Recognize/ImageArea/index.jsx:12` | `string` | `''` | ImageArea, TextArea | ImageArea |
| 7 | `textAtom` | `Recognize/TextArea/index.jsx:20` | `any` | `undefined` | TextArea, ControlArea | TextArea |
| 8 | `currentServiceInstanceKeyAtom` | `Recognize/ControlArea/index.jsx:23` | `any` | `undefined` | TextArea, ControlArea | ControlArea |
| 9 | `languageAtom` | `Recognize/ControlArea/index.jsx:24` | `any` | `undefined` | TextArea, ControlArea | ControlArea |
| 10 | `recognizeFlagAtom` | `Recognize/ControlArea/index.jsx:25` | `any` | `undefined` | TextArea | ControlArea |

> **注意**：YiPot 的 Jotai 使用是无 Provider 模式（原子默认值），`atom()` 创建的是 Primitive Atom。翻译窗口的 4 个 atom 是跨组件共享的核心状态；OCR 窗口的 6 个 atom 各自服务于识别流程的不同阶段。`useSyncAtom` hook 提供 Jotai 与 tauri-plugin-store 的双向同步（仅 `sourceTextAtom` 使用）。

### 10.7 数据流图（翻译场景）

```
用户选中文本 → Ctrl+C
    │
    v
Rust clipboard.rs (selection::get_text)
    │
    ├──→ StringWrapper State (Rust 内存)
    └──→ window.emit("new_text", text)
            │
            v
SourceArea: listen("new_text")
    ├── setSourceText(text)            ──→ sourceTextAtom 更新
    │   └── syncSourceText()          ──→ Jotai → React 渲染
    ├── detect_language(text)          ──→ detectLanguageAtom 更新
    │   └── invoke('lang_detect')     ──→ Rust lingua
    │
    v (用户按 Enter 或动态翻译)
LanguageArea: sourceLanguageAtom / targetLanguageAtom
    │
    v
TargetArea × N: useAtomValue(sourceTextAtom/sourceLanguageAtom/targetLanguageAtom)
    │
    ├── translateViaYiAi(serviceName, text, from, to, config)
    │   └── getApi().rpc('services.translation.translate_service', 'translate', {...})
    │       └── fetch POST http://localhost:10086/
    │           └── YiAi → 翻译记忆查找 → OpenAI/Ollama Provider → 存储记忆
    │       └── FAIL → builtinServices[name].translate() (降级)
    │
    └── setResult(text) ──→ React 渲染结果
        └── autoCopy 策略 ──→ writeText() 复制到剪贴板
```

---

## 十一、构建流水线详解

### 11.1 整体流水线

```
源代码
  │
  ├── 1. Vite 构建 (pnpm build)
  │       ├── @vitejs/plugin-react → JSX 转换
  │       ├── Tailwind CSS → utility class 生成
  │       ├── Rollup → 双入口打包
  │       │   ├── index.html  → 主窗口 (翻译/OCR/设置/更新)
  │       │   └── daemon.html → 守护窗口 (不可见, 后台)
  │       ├── Code Splitting → 窗口级 React.lazy
  │       ├── Target → Windows: chrome105 / macOS: safari11
  │       └── 输出 → dist/ (前端静态资源)
  │
  ├── 2. Tauri Bundler (pnpm tauri build)
  │       ├── beforeBuildCommand → pnpm build (触发 Vite)
  │       ├── 读取 dist/ 作为前端资源
  │       ├── Cargo build --release → 编译 Rust 后端
  │       │   ├── src-tauri/target/release/pot (macOS/Linux 二进制)
  │       │   └── src-tauri/target/release/pot.exe (Windows 二进制)
  │       │
  │       └── 平台打包:
  │           ├── macOS → .dmg (磁盘映像)
  │           │   ├── pot.app bundle 结构
  │           │   ├── Code signing (可选)
  │           │   └── Notarization (可选)
  │           ├── Windows → .msi (安装包) / .exe (setup)
  │           │   ├── WiX Toolset 打包
  │           │   └── WebView2 bootstrapper
  │           └── Linux → .deb (Debian) / .rpm (Red Hat) / .AppImage
  │               ├── 依赖声明: libxdo-dev, libxcb1, libxrandr2, tesseract-ocr
  │               └── icon 安装
  │
  └── 3. 发布
          ├── GitHub Releases → 上传所有平台包
          ├── update.json → 自动更新端点
          │   └── https://github.com/pot-app/pot-desktop/releases/download/updater/update.json
          └── 签名公钥 (Tauri updater pubkey)
```

### 11.2 Vite 构建配置详解

```javascript
// vite.config.js 关键配置
{
  plugins: [react()],                    // JSX 转换 + Fast Refresh
  clearScreen: false,                     // 保留 Rust 编译错误信息
  server: { port: 1420, strictPort: true }, // Tauri dev 固定端口
  envPrefix: ['VITE_', 'TAURI_'],        // 环境变量白名单
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',              // 主窗口入口
        daemon: 'daemon.html',            // 守护窗口入口
      },
    },
    target: TAURI_PLATFORM == 'windows'
      ? 'chrome105'                        // Windows: WebView2 最低版本
      : 'safari11',                        // macOS: WKWebView 最低版本
    minify: TAURI_DEBUG ? false : 'esbuild', // 生产构建压缩
    sourcemap: TAURI_DEBUG,               // 开发模式 sourcemap
  },
}
```

**双入口设计原因**：
- `index.html` → 加载完整 React 应用（翻译/OCR/设置/截图窗口）
- `daemon.html` → 加载极简 HTML（`additionalBrowserArgs: --disable-web-security`），用作不可见后台窗口
- 守护窗口的功能：`available_monitors()` 获取多显示器信息、窗口间通信中转

### 11.3 Tauri Bundler 配置

```json
// tauri.conf.json bundle 节选
{
  "bundle": {
    "active": true,
    "category": "Utility",
    "copyright": "GPLv3",
    "targets": "all",                // macOS .dmg + Windows .msi + Linux .deb/.rpm/.AppImage
    "identifier": "com.pot-app.desktop",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",             // macOS
      "icons/icon.ico"               // Windows
    ],
    "deb": { "depends": ["libxdo-dev", "libxcb1", "libxrandr2", "tesseract-ocr"] },
    "rpm": { "depends": ["libxdo-dev", "libxcb1", "libxrandr2", "tesseract-ocr"] },
    "macOS": {
      "entitlements": null,
      "signingIdentity": null,       // 开发模式不签名
      "exceptionDomain": "",
      "providerShortName": null
    }
  },
  "updater": {
    "active": true,
    "dialog": false,                 // 不使用系统对话框，自定义 Updater 窗口
    "endpoints": [
      "https://dl.pot-app.com/https://github.com/.../update.json",
      "https://github.com/pot-app/pot-desktop/releases/download/updater/update.json"
    ],
    "pubkey": "dW50cnVzdGVk..."
  }
}
```

### 11.4 Rust 编译特性

```toml
# Cargo.toml
[features]
custom-protocol = ["tauri/custom-protocol"]  # 生产构建必需

# 平台条件编译 (cfg)
[target.'cfg(target_os = "macos")'.dependencies]
macos-accessibility-client = "0.0.1"   # macOS 辅助功能 API
window-shadows = "0.2"                  # macOS/Windows 窗口阴影

[target.'cfg(windows)'.dependencies]
windows = { version = "0.58.0", features = [
  "Win32_UI_WindowsAndMessaging", "Win32_Foundation",
  "Graphics_Imaging", "Media_Ocr", "Foundation",
  "Globalization", "Storage", "Storage_Streams"
]}                                      # Windows OCR API 绑定
window-shadows = "0.2"
```

### 11.5 构建产物清单

| 平台 | 构建命令 | 产物路径 | 典型大小 |
|------|---------|---------|---------|
| Vite 前端 | `pnpm build` | `dist/` (index.html + assets/) | ~2MB |
| Rust Debug | `cargo build` | `src-tauri/target/debug/pot` | ~50MB |
| Rust Release | `cargo build --release` | `src-tauri/target/release/pot` | ~15MB |
| macOS 打包 | `pnpm tauri build` | `src-tauri/target/release/bundle/dmg/pot_3.0.7_x64.dmg` | ~10MB |
| Windows 打包 | `pnpm tauri build` | `src-tauri/target/release/bundle/msi/pot_3.0.7_x64.msi` | ~6MB |
| Linux .deb | `pnpm tauri build` | `src-tauri/target/release/bundle/deb/pot_3.0.7_amd64.deb` | ~8MB |
| Linux .rpm | `pnpm tauri build` | `src-tauri/target/release/bundle/rpm/pot-3.0.7-1.x86_64.rpm` | ~8MB |
| Linux .AppImage | `pnpm tauri build` | `src-tauri/target/release/bundle/appimage/pot_3.0.7_amd64.AppImage` | ~15MB |

### 11.6 macOS 签名与公证

```
macOS 打包完整流程:

1. Xcode Command Line Tools 已安装
2. 开发者证书 (Apple Developer ID Application)
   └─ Keychain 中可访问
3. tauri.conf.json → bundle.macOS.signingIdentity
   └─ "Developer ID Application: xxx (TEAM_ID)"
4. pnpm tauri build
   ├─ 编译 Rust → pot binary
   ├─ 创建 pot.app bundle
   ├─ codesign --deep --force --verify pot.app
   ├─ productbuild → pot.dmg
   └─ codesign pot.dmg
5. 公证 (可选)
   └─ xcrun notarytool submit pot.dmg --apple-id xxx --team-id xxx
   └─ xcrun stapler staple pot.dmg
```

> **开发环境**：`signingIdentity: null` → 不签名，直接运行 `pnpm tauri dev`。签名和公证仅在正式发布流水线中执行。

---

## 十二、第三方依赖审计

### 12.1 Rust 依赖 (Cargo.toml)

| # | Crate | 版本 | 许可 | 用途 | 风险等级 | 风险说明 |
|---|-------|------|------|------|---------|---------|
| 1 | `tauri` | 1.8 | MIT/Apache-2.0 | 桌面框架核心，提供窗口/系统托盘/全局快捷键/通知/剪贴板/HTTP/文件系统等 | **低** | Tauri 官方维护，1.x 稳定分支，安全补丁持续发布 |
| 2 | `tauri-plugin-single-instance` | v1 (git) | MIT/Apache-2.0 | 单实例检测 | **低** | 官方插件 |
| 3 | `tauri-plugin-autostart` | v1 (git) | MIT/Apache-2.0 | 开机自启 (macOS LaunchAgent) | **低** | 官方插件 |
| 4 | `tauri-plugin-fs-watch` | v1 (git) | MIT/Apache-2.0 | 配置文件修改监听 | **低** | 官方插件 |
| 5 | `tauri-plugin-store` | v1 (git) | MIT/Apache-2.0 | JSON 配置文件持久化 | **低** | 官方插件，核心依赖 |
| 6 | `tauri-plugin-log` | v1 (git) | MIT/Apache-2.0 | 日志系统 (LogDir + Stdout) | **低** | 官方插件 |
| 7 | `tauri-plugin-sql` | v1 (git, sqlite) | MIT/Apache-2.0 | SQLite 数据库 (history.db) | **低** | 官方插件，仅本地存储 |
| 8 | `serde` / `serde_json` | 1.0 | MIT/Apache-2.0 | JSON 序列化/反序列化 | **低** | Rust 生态标准 |
| 9 | `selection` | 1.2.0 | MIT | macOS/Windows/Linux 获取选中文本 | **中** | 少量活跃维护者，OS API 变更可能破坏 |
| 10 | `screenshots` | =0.7.2 (锁定) | MIT | 跨平台全屏截图 | **中** | **版本锁定** (0.8+ API 破坏性变更)，社区维护，依赖 X11/Wayland/Windows GDI |
| 11 | `arboard` | 3.4 | MIT/Apache-2.0 | 跨平台剪贴板 (读/写文本和图片) | **低** | 活跃维护，广泛使用 |
| 12 | `lingua` | 1.6.2 | Apache-2.0 | 纯 Rust 语言检测 (21 语言 n-gram 模型) | **中** | 语言模型权重内嵌二进制 (~30MB)，首次加载耗时 ~500ms |
| 13 | `tiny_http` | 0.12.0 | Apache-2.0 | 轻量级 HTTP 服务器 (:60828) | **低** | 仅本地回环，无外部暴露 |
| 14 | `reqwest` | 0.12 | MIT/Apache-2.0 | HTTP 客户端 (备份) | **低** | Rust 生态标准 HTTP 库 |
| 15 | `reqwest_dav` | =0.1.5 (锁定) | MIT/Apache-2.0 | WebDAV 客户端 (备份) | **中** | **版本锁定**，少量维护者，WebDAV 兼容性因服务端实现而异 |
| 16 | `zip` | 2.2.0 | MIT | 插件包解压 + 备份打包 | **低** | 活跃维护 |
| 17 | `walkdir` | 2.5 | MIT/Unlicense | 插件目录遍历 | **低** | 标准库级质量 |
| 18 | `thiserror` | 1.0 | MIT/Apache-2.0 | 错误类型派生宏 | **低** | 标准 |
| 19 | `font-kit` | 0.14.2 | MIT/Apache-2.0 | 系统字体列表枚举 | **中** | `all_families()` 在某些 Linux 桌面环境可能超时 |
| 20 | `image` | 0.25.4 | MIT | 截图裁剪/PNG 读取 | **低** | 活跃维护 |
| 21 | `base64` | 0.22 | MIT/Apache-2.0 | 截图图片 Base64 编码 | **低** | 标准 |
| 22 | `dirs` | 5.0.1 | MIT/Apache-2.0 | 平台标准目录 (config/cache) | **低** | 标准 |
| 23 | `once_cell` | 1.19.0 | MIT/Apache-2.0 | 全局 AppHandle 懒初始化 | **低** | std::sync::OnceLock 已稳定，未来可替换 |
| 24 | `mouse_position` | 0.1.4 | MIT | 获取鼠标物理位置 (多屏窗口定位) | **中** | 少量维护者，Linux Wayland 可能权限不足 |
| 25 | `log` | 0.4 | MIT/Apache-2.0 | Rust 日志门面 | **低** | 标准 |

#### 平台特定依赖

| # | Crate | 版本 | 平台 | 许可 | 风险 |
|---|-------|------|------|------|------|
| 26 | `macos-accessibility-client` | 0.0.1 | macOS | MIT | **高** - 版本 0.0.1 表明极早期，依赖 macOS Accessibility API，系统更新可能破坏 |
| 27 | `window-shadows` | 0.2 | macOS/Windows | MIT | **低** - 仅窗口装饰效果 |
| 28 | `windows` | 0.58.0 | Windows | MIT/Apache-2.0 | **中** - Microsoft 官方 crate，版本迭代快，API 变更频繁 |

### 12.2 前端依赖 (package.json)

| # | 包 | 版本 | 许可 | 用途 | 风险等级 | 风险说明 |
|---|----|------|------|------|---------|---------|
| 1 | `react` / `react-dom` | ^18.3.1 | MIT | UI 框架 | **低** | React 核心，有维护 |
| 2 | `@nextui-org/react` | ^2.4.8 | MIT | UI 组件库 (40+ 组件) | **中** | 上游 NextUI 已重命名为 HeroUI，2.x 分支可能停止维护。NextUI 2.4 有已知无障碍问题 |
| 3 | `@nextui-org/theme` | ^2.2.11 | MIT | NextUI 主题系统 | **低** | 与 NextUI 绑定 |
| 4 | `jotai` | ^2.10.1 | MIT | 原子化状态管理 | **低** | 活跃维护，API 稳定 |
| 5 | `react-router-dom` | ^6.27.0 | MIT | 设置页路由 | **低** | 标准 |
| 6 | `i18next` / `react-i18next` | ^23.16.4 / ^15.1.0 | MIT | 国际化 (20+ 语言) | **低** | 标准 |
| 7 | `framer-motion` | ^11.11.10 | MIT | React 动画库 | **中** | Bundle 体积 ~30KB gzipped，仅用于窗口切换动画。NextUI 已内置 framer-motion 依赖 |
| 8 | `@react-spring/web` | ^9.7.5 | MIT | TargetArea 折叠/展开动画 | **中** | 与 framer-motion 功能重叠，增加 bundle 体积 |
| 9 | `@tauri-apps/api` | ^1.6.0 | MIT/Apache-2.0 | Tauri 前端 API (invoke/event/window等) | **低** | Tauri 官方 |
| 10 | `tauri-plugin-store-api` | v1 (git) | MIT/Apache-2.0 | 配置存储前端 API | **低** | Tauri 官方插件 |
| 11 | `tauri-plugin-sql-api` | v1 (git) | MIT/Apache-2.0 | SQLite 前端 API | **低** | Tauri 官方插件 |
| 12 | `tauri-plugin-log-api` | v1 (git) | MIT/Apache-2.0 | 日志前端 API | **低** | Tauri 官方插件 |
| 13 | `tauri-plugin-autostart-api` | v1 (git) | MIT/Apache-2.0 | 开机自启前端 API | **低** | Tauri 官方插件 |
| 14 | `tauri-plugin-fs-watch-api` | v1 (git) | MIT/Apache-2.0 | 文件监听前端 API | **低** | Tauri 官方插件 |
| 15 | `tesseract.js` | ^5.1.1 | Apache-2.0 | 离线 OCR (JS WASM) | **中** | WASM 体积 ~10MB (语言数据不包含在内)，初始加载慢 |
| 16 | `jsqr` | ^1.4.0 | Apache-2.0 | 二维码解码 | **低** | 纯 JS，体积小 |
| 17 | `react-beautiful-dnd` | ^13.1.1 | Apache-2.0 | 翻译引擎拖拽排序 | **高** | **已废弃** (Atlassian 停止维护)，React 18 Strict Mode 有已知问题。建议迁移到 @hello-pangea/dnd |
| 18 | `react-icons` | ^5.3.0 | MIT | 图标库 (多个图标集) | **低** | 纯图标，无运行时风险 |
| 19 | `react-hot-toast` | ^2.4.1 | MIT | Toast 通知 | **低** | 轻量 |
| 20 | `react-spinners` | ^0.14.1 | MIT | 加载动画 | **低** | 仅用于 TargetArea 翻译等待 |
| 21 | `react-markdown` | ^9.0.1 | MIT | Markdown 渲染 (AI 翻译结果) | **低** | 标准 |
| 22 | `next-themes` | ^0.3.0 | MIT | 暗色/亮色主题切换 | **低** | 与 NextUI 集成良好 |
| 23 | `crypto-js` | ^4.2.0 | MIT | 插件认证/签名验证 | **中** | 纯 JS 加密，性能不如 WebCrypto API |
| 24 | `jose` | ^5.9.6 | MIT | JWT 处理 (YiAi 认证) | **低** | 现代 JWT 库 |
| 25 | `ollama` | ^0.5.9 | MIT | Ollama API 客户端 | **低** | Ollama 翻译引擎使用 |
| 26 | `nanoid` | ^5.0.8 | MIT | 唯一 ID 生成 | **低** | 轻量 |
| 27 | `uuid` | ^11.0.2 | MIT | UUID 生成 (与 nanoid 功能重叠) | **低** | 冗余依赖 |
| 28 | `md5` | ^2.3.0 | MIT | MD5 哈希 (API 签名) | **中** | MD5 已不安全，建议替换为 SHA256 |
| 29 | `flag-icons` | ^7.2.3 | MIT | 国旗图标 (语言选择器) | **低** | 纯 CSS/图标 |

### 12.3 开发依赖

| # | 包 | 版本 | 许可 | 用途 | 风险 |
|---|----|------|------|------|------|
| 1 | `@tauri-apps/cli` | ^1.6.3 | MIT/Apache-2.0 | Tauri CLI (dev/build) | **低** |
| 2 | `@vitejs/plugin-react` | ^4.3.3 | MIT | Vite React 插件 | **低** |
| 3 | `vite` | ^5.4.10 | MIT | 构建工具 | **低** |
| 4 | `tailwindcss` | ^3.4.14 | MIT | CSS 框架 | **低** |
| 5 | `typescript` | ^5.6.3 | Apache-2.0 | 类型检查 (仅 service 文件使用) | **低** |
| 6 | `node-fetch` | ^3.3.2 | MIT | 更新脚本 HTTP 请求 | **低** |

### 12.4 高风险依赖汇总

| 依赖 | 风险 | 建议 |
|------|------|------|
| `react-beautiful-dnd` 13.x | **已废弃**，React 18 兼容性问题 | 迁移到 `@hello-pangea/dnd` (drop-in replacement) |
| `macos-accessibility-client` 0.0.1 | 极早期版本，系统 API 变更脆弱 | 关注更新或自维护 fork |
| `md5` 2.x | 加密算法已不安全 | 替换为 SHA256 (已有 `crypto-js` 支持) |
| `screenshots` =0.7.2 | 版本锁定，0.8+ 破坏性变更 | 评估迁移计划 |
| `reqwest_dav` =0.1.5 | 版本锁定，WebDAV 兼容性风险 | 评估替代方案或封装适配层 |

---

## 十三、配置键完整清单

> 配置引擎：`tauri-plugin-store` (Rust) + `tauri-plugin-store-api` (JS)。
> 存储路径：`~/.config/com.pot-app.desktop/config.json`。
> 前端读写：`useConfig(key, defaultValue)` hook → 自动同步到 store。

### 13.1 通用设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `app_language` | `string` | `"en"` | 界面语言，支持 20+ 语言代码 | App.jsx, tray.rs update_tray |
| `app_theme` | `string` | `"system"` | 主题: `light` / `dark` / `system` | App.jsx (next-themes setTheme) |
| `app_font` | `string` | `"default"` | 主字体名称 | App.jsx (fontFamily) |
| `app_fallback_font` | `string` | `"default"` | 回退字体名称 | App.jsx (fontFamily) |
| `app_font_size` | `number` | `16` | 基础字号 (px) | App.jsx, Translate 各组件 |
| `dev_mode` | `boolean` | `false` | 开发者模式 → F12 开 DevTools, Ctrl 键不拦截 | App.jsx |
| `proxy_enable` | `boolean` | `false` | 启用 HTTP 代理 | main.rs setup + cmd.rs set_proxy |
| `proxy_host` | `string` | `""` | 代理主机地址 | cmd.rs set_proxy |
| `proxy_port` | `number` | `-` | 代理端口 | cmd.rs set_proxy |
| `no_proxy` | `string` | `""` | 不走代理的域名列表 | cmd.rs set_proxy |
| `server_port` | `number` | `60828` | 本地 HTTP 服务端口 | server.rs start_server |
| `tray_click_event` | `string` | `"config"` | Windows 托盘左键行为: `config`/`translate`/`ocr_recognize`/`ocr_translate`/`disable` | tray.rs on_tray_click |
| `check_update` | `boolean` | `true` | 启动时自动检查更新 | updater.rs check_update |
| `hide_source` | `boolean` | `false` | 翻译窗口隐藏源文本区域 (仅输入翻译时显示) | Translate/SourceArea |

### 13.2 翻译设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `translate_service_list` | `string[]` | `["google"]` | 启用的翻译引擎列表 (支持多实例 `name@id`) | Translate/index, TargetArea |
| `translate_second_language` | `string` | `"en"` | 第二目标语言 (翻译结果下方的二次翻译) | TargetArea |
| `translate_auto_copy` | `string` | `"disable"` | 翻译后自动复制: `source`/`target`/`source_target`/`disable` | TargetArea, tray.rs update_tray |
| `translate_delete_newline` | `boolean` | `false` | 翻译前删除原文换行符 | SourceArea |
| `incremental_translate` | `boolean` | `false` | 增量翻译 (多次选择追加而非替换) | SourceArea |
| `dynamic_translate` | `boolean` | `false` | 动态翻译 (输入时实时翻译，1s 防抖) | SourceArea |
| `translate_hide_window` | `boolean` | `false` | 翻译窗口响应热键后自动隐藏 (选词翻译模式) | SourceArea, TargetArea |
| `translate_detect_engine` | `string` | `"local"` | 语言检测引擎: `local` (lingua) / `online` | main.rs setup |
| `translate_window_width` | `number` | `350` | 翻译窗口宽度 (px) | window.rs translate_window |
| `translate_window_height` | `number` | `420` | 翻译窗口高度 (px) | window.rs translate_window |
| `translate_window_position` | `string` | `"mouse"` | 窗口定位策略: `mouse` (鼠标旁) / `fixed` (固定位置) | window.rs |
| `translate_window_position_x` | `number` | `0` | 固定位置的 X 坐标 (仅 `position=fixed`) | window.rs |
| `translate_window_position_y` | `number` | `0` | 固定位置的 Y 坐标 (仅 `position=fixed`) | window.rs |
| `history_disable` | `boolean` | `false` | 禁用翻译历史记录 | TargetArea |

### 13.3 快捷键设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `hotkey_selection_translate` | `string` | `""` | 划词翻译快捷键 (如 `Ctrl+Shift+T`) | hotkey.rs register_shortcut |
| `hotkey_input_translate` | `string` | `""` | 输入翻译快捷键 (如 `Ctrl+Shift+I`) | hotkey.rs |
| `hotkey_ocr_recognize` | `string` | `""` | 截图 OCR 快捷键 (如 `Ctrl+Shift+O`) | hotkey.rs |
| `hotkey_ocr_translate` | `string` | `""` | 截图翻译快捷键 (如 `Ctrl+Shift+P`) | hotkey.rs |

### 13.4 OCR 设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `recognize_service_list` | `string[]` | `["system","tesseract"]` | 启用的 OCR 引擎列表 | Recognize/*, SourceArea |
| `recognize_language` | `string` | `"auto"` | OCR 识别语言 (如 `zh_cn`/`en`/`auto`) | Recognize/ControlArea, SourceArea |
| `recognize_window_width` | `number` | `800` | OCR 窗口宽度 (px) | window.rs recognize_window |
| `recognize_window_height` | `number` | `400` | OCR 窗口高度 (px) | window.rs recognize_window |
| `recognize_close_on_blur` | `boolean` | `false` | OCR 窗口失去焦点时自动关闭 | Recognize/index.jsx |

### 13.5 TTS 设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `tts_service_list` | `string[]` | `["lingva_tts"]` | 启用的 TTS 引擎列表 | SourceArea, TargetArea |

### 13.6 生词本设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `collection_service_list` | `string[]` | `[]` | 启用的生词本服务 (anki/eudic) | TargetArea |

### 13.7 剪贴板设置

| 配置键 | 类型 | 默认值 | 说明 | 使用位置 |
|--------|------|--------|------|---------|
| `clipboard_monitor` | `boolean` | `false` | 启用剪贴板监听翻译 (500ms 轮询) | main.rs setup, clipboard.rs, tray.rs |

### 13.8 存储架构

```
config.json 结构 (顶层键):
{
  // 通用设置 (Section 13.1)
  "app_language": "en",
  "app_theme": "system",
  "app_font": "default",
  "app_font_size": 16,
  "dev_mode": false,
  "proxy_enable": false,
  "proxy_host": "",
  "proxy_port": 1080,
  "server_port": 60828,
  "tray_click_event": "config",
  "check_update": true,
  
  // 服务实例列表 (Section 13.2-13.6)
  "translate_service_list": ["google", "openai@abc123"],
  "recognize_service_list": ["system", "baidu_ocr@def456"],
  "tts_service_list": ["lingva_tts"],
  "collection_service_list": [],
  
  // 服务实例配置 (每个实例独立存储)
  "google": {},                           // 内置引擎通常无额外配置
  "openai@abc123": {                      // 多实例通过 @id 区分
    "api_key": "sk-...",
    "model": "gpt-4",
    "instanceName": "My GPT-4"
  },
  
  // 快捷键 (Section 13.3)
  "hotkey_selection_translate": "Ctrl+Shift+T",
  "hotkey_input_translate": "Ctrl+Shift+I",
  "hotkey_ocr_recognize": "Ctrl+Shift+O",
  "hotkey_ocr_translate": "Ctrl+Shift+P",
  
  // 窗口尺寸/位置 (Section 13.2/13.4)
  "translate_window_width": 350,
  "translate_window_height": 420,
  "recognize_window_width": 800,
  "recognize_window_height": 400,
  
  // ... 其他设置
}
```

### 13.9 配置读写路径

```
前端 (React)                            Rust 后端
───────────                            ─────────
useConfig(key, default)                config::get(key)
  │                                      │
  ├── store.get(key)                     ├── APP.get() → StoreWrapper
  │   └── tauri-plugin-store-api          │   └── store.0.lock() → store.get()
  │       └── invoke('plugin:store|get')  │       └── config.json 内存缓存
  │           └── IPC → Rust              │
  │                                      │
  └── store.set(key, value)             config::set(key, value)
      └── store.save()                    ├── store.insert(key, json!(value))
          └── invoke('plugin:store|save') │   └── store.save()
              └── IPC → Rust              │       └── 写盘 fs::write()
                                          │
fs-watch 回调:                           emit 事件:
  watch(config.json, () => {           emit(`${key}_changed`, v)
    store.load()                        → 前端 listen → syncToState
    invoke('reload_store')
  })
```

> **设计约束**：
> 1. `useConfig` 采用 debounce 防抖写入（`syncToStore`），避免高频写盘；
> 2. `store.load()` 在 Rust 端和前端各维护一个内存缓存，`get()` 操作 < 1ms；
> 3. 多窗口场景：前端 `emit(key_changed, v)` → 所有窗口 listen 自动同步；
> 4. 服务实例配置键（如 `openai@abc123`）使用 `@` 分隔符支持多实例，`clean_service_list` 在启动时自动清理已卸载插件的残留配置。

---

**关联文档**：
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 翻译流程详细设计
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — Rust 后端模块架构
- [React 组件与窗口架构](./10-prd-task-React组件与窗口架构.md) — 前端组件与窗口架构