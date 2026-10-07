---

doc_type: module
prd_task_id: "YP-09-M06"
title: "桌面集成架构 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 6
source_prd: "00-prd-需求总览.md"

type: task
---

# 桌面集成架构 — 开发方案

> 来源 PRD：[00-prd-需求总览.md](../../prds/2026-09/00-prd-需求总览.md)
> 需求编号：YP-09-M06 · 优先级：高 · 人天：6d

---

## 一、Rust 后端模块架构

### 模块清单

| 模块 | 文件 | 职责 |
|------|------|------|
| 主入口 | `main.rs` | Tauri 应用初始化、插件注册 |
| 剪贴板 | `clipboard.rs` | 读写系统剪贴板 |
| 快捷键 | `hotkey.rs` | 全局快捷键注册与事件分发 |
| 截图 | `screenshot.rs` | 全屏截图、区域截图 |
| 系统 OCR | `system_ocr.rs` | 调用系统原生 OCR |
| 托盘 | `tray.rs` | 系统托盘图标与菜单 |
| 窗口 | `window.rs` | 窗口创建、置顶、位置管理 |
| 配置 | `config.rs` | 持久化配置读写 |
| 备份 | `backup.rs` | 配置导出导入 |
| 更新 | `updater.rs` | 自动更新检查 |
| 命令行 | `cmd.rs` | CLI 参数解析 |
| HTTP 服务 | `server.rs` | 本地 HTTP 服务（外部调用） |
| 语言检测 | `lang_detect.rs` | 文本语言检测 |
| 错误处理 | `error.rs` | 统一错误类型 |

### Tauri Command 注册

所有 Rust 函数通过 `#[tauri::command]` 宏注册，前端通过 `invoke()` 调用：

```javascript
// 前端调用示例
import { invoke } from "@tauri-apps/api";

// 读取选中文本
const text = await invoke("get_selected_text");

// 截图
const image = await invoke("screenshot");

// 系统 OCR
const result = await invoke("system_ocr", { imageBase64: "..." });
```

## 二、快捷键系统

### 实现 (`hotkey.rs`)

- 使用 Tauri 全局快捷键 API
- 支持自定义组合键（Ctrl/Alt/Shift/Meta + 字母/功能键）
- 注册 5 个默认快捷键:

| 功能 | 默认快捷键 |
|------|-----------|
| 划词翻译 | Ctrl+Shift+T |
| 输入翻译 | Ctrl+Shift+F |
| 截图 OCR | Ctrl+Shift+O |
| 截图翻译 | Ctrl+Shift+S |
| 显示/隐藏 | Ctrl+Shift+P |

### 快捷键配置

前端配置页 `YiPot/src/window/Config/pages/Hotkey/index.jsx`:
- 可视化快捷键录制
- 冲突检测提示
- 支持清除/重置

## 三、系统托盘

### 实现 (`tray.rs`)

**托盘菜单**:
- 划词翻译 — 切换启用
- 输入翻译 — 打开翻译窗口
- 截图 OCR — 触发 OCR
- 设置 — 打开配置窗口
- 关于 — 显示版本信息
- 退出 — 关闭应用

**平台差异**:
- macOS: 托盘图标模板模式（黑白）
- Windows: 彩色图标 + 通知气泡
- Linux: 依赖 `libayatana-appindicator`

## 四、外部调用 (HTTP Server)

### 实现 (`server.rs`)

本地 HTTP 服务支持其他应用调用 Pot:

```
POST http://127.0.0.1:60828/translate
Body: { "text": "hello", "from": "en", "to": "zh" }
Response: { "text": "你好", "from": "en", "to": "zh" }
```

## 五、配置备份

### 实现 (`backup.rs`)

**备份策略**:
- 本地: JSON 文件导出/导入
- 远程: WebDAV / 阿里云 OSS 同步

**备份内容**:
- 服务配置（API Key 加密存储）
- 快捷键设置
- 窗口位置偏好
- 语言偏好


## 六、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 进程模型 | 单进程多窗口 (Tauri 原生) | 多进程 (Electron 模式) | 内存共享、状态同步零开销，快捷键注册中心化管理 | 单个窗口崩溃可能影响主进程（通过 catch_unwind 缓解） |
| 快捷键实现 | Tauri global_shortcut_manager | 系统级 Hook (CGEvent/SetWindowsHookEx) | Tauri 封装跨平台 API，无需 Rust FFI 手动绑写 | Tauri API 功能子集，无法实现按键录制/重放 |
| 托盘实现 | Rust 原生 + Tauri SystemTray | 前端模拟 (HTML 自定义托盘) | 系统原生交互，支持右键菜单、通知气泡 | 三平台代码需条件编译 (~200 行差异) |
| 配置持久化 | tauri-plugin-store (JSON 文件) | SQLite / TOML | JSON 人类可读，Rust 原生支持 serde，WebView 直接读写 | 无事务支持，并发写可能丢失数据 (通过前端同步锁解决) |
| HTTP Server | tiny_http (Rust 同步) | actix-web / warp | 零依赖，编译体积 +200KB，同步模型对请求量 < 10/s 足够 | 阻塞式处理，高并发场景需替换为异步框架 |
| 窗口管理 | 预创建 + 显示/隐藏 | 惰性创建 + 销毁 | 首次打开 ~80ms (显示) vs ~280ms (创建+加载) | 常驻内存 ~20MB/窗口 (3 窗口 ~60MB) |
| 命令行解析 | 自定义 match args | clap crate | 零依赖，参数简单 (< 10 个) 不需要全功能解析器 | 不支持 --help 自动生成，需手动维护 |

### 快捷键系统设计决策

```
为什么使用 Tauri global_shortcut_manager 而非系统 Hook？

Tauri API (采纳):
  优点: 跨平台统一 API，Rust 类型安全，自动释放
  限制: 无法实现"录制按键"(需 keydown/keyup 事件流)
  解决: 录制功能在前端实现(React onKeyDown)，注册在 Rust 端执行

系统 Hook (被拒绝):
  macOS: CGEvent 需要 Accessibility 权限 (增加用户配置门槛)
  Windows: SetWindowsHookEx 需要消息循环 (与 Tauri 事件循环冲突)
  Linux: X11 GrabKey 需要 X11 连接管理
```


## 七、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 窗口预创建 | 常驻窗口池 (3 个核心窗口预先创建) | 首次打开时延 -70% | 首开 ~80ms vs ~280ms |
| 配置读取 | Rust 内存缓存 + 定时刷盘 (5s) | 配置读取 < 0.1ms (vs 磁盘 ~5ms) | 高频配置读取不影响性能 |
| 快捷键响应 | 事件消除 bounce (300ms debounce) | 避免连续触发 (用户双击/长按) | 有效防止重复翻译请求 |
| 剪贴板轮询 | 智能轮询间隔 (有窗口: 100ms，后台: 1000ms) | 后台 CPU 占用 -90% | 后台 CPU < 0.1% |
| 托盘更新 | 仅在状态变化时更新，非定时刷新 | 减少不必要的 UI 操作 | 托盘线程空闲率 > 99% |
| IPC 优化 | Tauri invoke 传输大小限制 + 分块大图片 | 避免 IPC 阻塞 | 单次 invoke < 5ms |

### 窗口预热策略

```
应用启动 → 预创建窗口 (隐藏)
  ├── translate_window  (翻译窗口, ~15MB)
  ├── recognize_window  (OCR 窗口, ~15MB)
  └── (config 窗口按需创建，使用频率低)

用户触发翻译:
  预创建窗口 → 注入数据 → 显示 (总时延 < 100ms)
  
  vs 惰性创建:
  创建 WebView → 加载 React → 渲染 (总时延 ~300ms)
```


## 八、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L0-启动 | 端口被占用 (HTTP Server) | 端口 +1 递增重试 (最多 10 次) | 自动切换 | 无感知 (仅托盘提示新端口) |
| L0-启动 | 配置目录无写入权限 | 使用临时目录 + 警告 | 用户修复权限 | "配置目录不可写，使用临时存储" |
| L1-运行 | 全局快捷键注册失败 | 检测冲突 → 通知前端 → 降级到托盘菜单 | 用户修改快捷键 | "快捷键被占用" 通知 |
| L1-运行 | 剪贴板监控线程 panic | catch_unwind → 日志 → 重启线程 | 自动恢复 (3s 后) | 无感知 |
| L2-平台 | 托盘创建失败 (Linux 无 libayatana) | 日志警告 → 仅保留快捷键入口 | 用户安装 libayatana | "系统托盘不可用，请使用快捷键" |
| L2-平台 | 开机自启注册失败 | 静默失败 + 日志记录 | 用户手动设置 | 无感知（仅日志） |
| L3-配置 | 配置文件 JSON 解析失败 | 备份损坏文件 → 初始化默认配置 | 自动恢复 | "配置已重置为默认值" (仅一次) |

### 单实例锁 (single-instance)

```rust
// 第二个实例启动时 → 聚焦已有窗口
tauri_plugin_single_instance::init(|app, argv, cwd| {
    // 将 argv 传递给已有实例
    // 已有实例处理命令 → 打开对应窗口
});
```

> 防止多实例导致快捷键冲突、端口冲突、配置竞争。


## 九、跨平台实现差异

| 功能 | macOS | Windows | Linux (X11) | Linux (Wayland) |
|------|-------|---------|-------------|-----------------|
| 快捷键注册 | CGEvent (Tauri 封装) | RegisterHotKey (Tauri 封装) | X11 GrabKey | wlr-layer-shell (协议限制) |
| 系统托盘 | NSStatusBar (模板图标) | Shell_NotifyIcon (彩色图标 + 气泡) | libayatana-appindicator | libayatana-appindicator |
| 开机自启 | LaunchAgent plist | 注册表 Run key | autostart .desktop | autostart .desktop |
| 窗口样式 | NSWindow (原生阴影+圆角) | 无边框+自定义阴影 | 窗口管理器决定 | 窗口管理器决定 |
| HTTP Server | 绑定 127.0.0.1 | 绑定 127.0.0.1 | 绑定 127.0.0.1 | 绑定 127.0.0.1 |
| 配置路径 | ~/Library/Application Support/ | %APPDATA% | ~/.config/ | ~/.config/ |
| 剪贴板 | NSPasteboard | OLE Clipboard | x11-clipboard | wl-clipboard |
| 窗口置顶 | NSWindow.level = .floating | SetWindowPos(HWND_TOPMOST) | _NET_WM_STATE_ABOVE | 不支持 (Wayland 协议限制) |

> **Wayland 限制**：窗口置顶和全局快捷键在 Wayland 下受协议限制，部分功能需用户配置 compositor 规则。

**关联文档**：
- [快捷键管理](./18-prd-task-快捷键管理.md) — 快捷键注册详细实现
- [剪切板监听](./13-prd-task-剪切板监听.md) — 剪贴板监控机制
- [外部 HTTP 服务](./08-prd-task-外部HTTP服务实现.md) — HTTP Server 详细实现
- [配置存储与备份](./07-prd-task-配置存储与备份实现.md) — 配置持久化
- [需求总览](./00-prd-task-需求总览.md) — 系统级架构总览