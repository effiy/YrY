---
doc_type: prd
title: "YP-09-R02: Rust 系统托盘模块 (tray.rs)"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-R02
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, Rust, 系统托盘]
category: 项目/桌面应用/需求
---

# YP-09-R02: Rust 系统托盘模块 (tray.rs)

> 需求编号：YP-09-R02 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 功能

### 托盘菜单构建

```rust
pub fn update_tray(app: &AppHandle, select_text: String, input_text: String) {
    // 动态更新托盘菜单项标签
    // 划词翻译 [启用/禁用]
    // 输入翻译 / 截图OCR / 截图翻译
    // 设置 / 关于 / 退出
}
```

### 事件处理

```rust
pub fn tray_event_handler(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "selection_translate" => toggle_selection_translate(),
            "input_translate" => input_translate(),
            "ocr_recognize" => ocr_recognize(),
            "ocr_translate" => ocr_translate(),
            "config" => config_window(),
            "about" => show_about(),
            "quit" => std::process::exit(0),
            _ => {}
        },
        _ => {}
    }
}
```

### 平台差异

| 平台 | 实现 |
|------|------|
| macOS | NSStatusBar + template icon + ActivationPolicy::Accessory |
| Windows | Shell_NotifyIcon + 彩色图标 |
| Linux | libayatana-appindicator |

## 量化验收标准

| 操作 | 目标延迟 | 测量方法 |
|------|----------|----------|
| 应用启动 → 托盘图标显示 | < 500ms | 从 `main()` 到 `SystemTray::new()` 完成 |
| 左键点击托盘图标 | < 100ms | 从 click 到菜单显示 |
| 菜单项点击 → 功能触发 | < 100ms | 从 MenuItemClick 到对应函数调用 |
| 动态标签更新 | < 50ms | `update_tray()` 调用到 UI 更新 |
| 托盘图标重连 (系统重启) | < 5s | libayatana 重试间隔 |

## 边界条件与异常处理

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 系统托盘不可用 | 极简 Linux 桌面环境 (i3/bspwm) | 日志警告，应用正常启动但不显示托盘 | 快捷键 + CLI 替代托盘入口 |
| 托盘图标未加载 | 图标文件路径错误 | 使用 fallback 纯色图标 | 打包时校验图标路径 |
| 菜单项数量动态变化 | 托盘菜单项目随状态变化 | `update_tray()` 重建菜单 | 不频繁调用 (< 1 次/秒) |
| macOS 托盘图标颜色 | 系统深色菜单栏 | 使用 `Template` 图标 (单色 mask) | 自动适应系统外观 |
| Windows 托盘图标消息丢失 | Explorer 崩溃重启 | 重新注册 Shell_NotifyIcon | 定时检测 + 重启时重新注册 |
| 快捷键与托盘菜单竞态 | 用户同时按快捷键 + 点击托盘 | 两个操作独立执行，不阻塞 | 各自执行，不互斥 |
| 应用退出时托盘残留 | 异常退出未清理 | Windows: 启动时清除旧托盘图标 | 注册时使用唯一 GUID |

## 非功能需求

### 平台适配

| 平台 | 托盘实现 | 图标规格 | 动态菜单 | 已知限制 |
|------|----------|----------|----------|----------|
| macOS | `NSStatusBar` + `NSStatusItem` | Template icon (PDF 或 @2x PNG), 18×18pt | `set_menu()` 重建 | 菜单项数 <= 10 (系统限制) |
| Windows | `Shell_NotifyIcon` API | ICO 格式, 16×16 + 32×32 | `NOTIFYICONDATA` 更新 | 需消息循环线程 |
| Linux (X11) | `libayatana-appindicator` | PNG, 22×22 | 完全支持 | 需 dbus 服务 |
| Linux (Wayland) | `libayatana-appindicator` + `StatusNotifier` | PNG, 22×22 | 完全支持 | KDE 支持好, GNOME 需扩展 |

### 用户体验
- 托盘图标 hover tooltip 显示当前状态："划词翻译: 启用"
- 右击/左击均弹出菜单（不同平台默认行为不同，统一处理）
- 菜单项标签反映当前状态（"启用划词翻译" / "禁用划词翻译"）

### 性能
- `update_tray()` 不频繁调用，仅在状态变化时触发
- 托盘重建 < 100ms，不引起 UI 闪烁

## 模块交互

```
tray.rs (Rust 层)
     │
     ├── init_tray(app)
     │   ├── 调用时机: app_setup() 钩子
     │   ├── 创建: SystemTray::new() + icon + menu
     │   └── 依赖: Tauri SystemTray API
     │
     ├── update_tray(app, select_text, input_text)
     │   ├── 调用者: 托盘菜单项点击后 → 状态变化 → 更新标签
     │   ├── 参数:
     │   │   ├── select_text: "启用划词翻译" | "禁用划词翻译"
     │   │   └── input_text: "输入翻译" | ...
     │   └── 动态更新: SystemTray::set_menu()
     │
     └── tray_event_handler(app, event)
         ├── 事件源: SystemTrayEvent
         ├── 菜单项映射:
         │   ├── "selection_translate" → toggle_selection_translate()
         │   │   └── 控制 clipboard.rs 监听开关
         │   ├── "input_translate" → 打开空白翻译窗口
         │   │   └── WebviewWindowBuilder::new("translate")
         │   ├── "ocr_recognize" → 触发截图 OCR
         │   │   └── screenshot::start_screenshot()
         │   ├── "ocr_translate" → 截图 + 翻译
         │   ├── "config" → 打开设置窗口
         │   │   └── WebviewWindowBuilder::new("config")
         │   ├── "about" → 关于窗口
         │   └── "quit" → std::process::exit(0)
         │       └── 清理: 取消所有后台任务
         └── 非菜单事件 (LeftClick/RightClick) → 显示菜单

跨模块关系:
     ├── clipboard.rs: 托盘控制监听开关
     ├── screenshot.rs: 托盘触发截图 OCR
     ├── hotkey.rs: 快捷键注册方式与托盘互补
     └── config.rs: 读取用户托盘偏好
```

**上游依赖**：
- `config.rs`：读取用户托盘偏好（是否显示托盘图标）
- `tauri::SystemTray`：Tauri 托盘 API

**下游消费者**：
- 用户的所有交互入口：托盘是应用的主要入口点
- `clipboard.rs`：接收启用/禁用指令
- 各窗口管理器：`WebviewWindowBuilder` 创建功能窗口

**平台差异处理**：
- macOS: `ActivationPolicy::Accessory` 隐藏 Dock 图标，仅显示托盘
- Windows: 发布版需 `.exe` 含有 Windows 资源图标
- Linux: `libayatana-appindicator3-dev` 作为运行时依赖

## 参考

- [40-prd-Rust剪贴板模块](./40-prd-Rust剪贴板模块.md) — 托盘控制剪贴板监听
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — 托盘触发截图
- [37-prd-设置页面架构](./37-prd-设置页面架构.md) — 托盘菜单打开设置窗口
- [38-prd-CLI命令行](./38-prd-CLI命令行.md) — CLI 作为托盘的替代入口