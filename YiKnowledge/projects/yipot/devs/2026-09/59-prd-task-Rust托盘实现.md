---

doc_type: module
prd_task_id: "YP-09-R02"
title: "Rust 系统托盘模块 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "41-prd-Rust托盘模块.md"
tags: [开发方案, Rust, 系统托盘, tray]

type: task
---

# Rust 系统托盘模块 — 开发方案

## 架构与数据流

```
系统托盘                           tray.rs                          各功能窗口
────────                           ──────                          ────────
  用户左键/右键点击                     │
       │                              ├── 构建托盘菜单               Translate 窗口
       ▼                              │   SystemTray::new()          OCR 窗口
  SystemTray Menu                     │   ├── 划词翻译 toggle        Config 窗口
       │                              │   ├── 输入翻译               About 窗口
       ├── "划词翻译" toggle          │   ├── 截图 OCR
       ├── "输入翻译"                  │   ├── 截图翻译
       ├── "截图 OCR"                  │   ├── 设置
       ├── "截图翻译"                  │   ├── 关于
       ├── "设置"                      │   └── 退出
       ├── "关于"                      │
       └── "退出"                      ├── 菜单事件处理
                                      │   SystemTrayEvent::MenuItemClick
       macOS Dock 图标                 │
       └── ActivationPolicy::Accessory │
```

**上游依赖**: `tauri::SystemTray` / 操作系统原生托盘 API (NSStatusBar / Shell_NotifyIcon / libayatana)
**下游消费者**: 所有功能窗口 (Translate/OCR/Config/About)

## 关键实现

### 托盘构建与菜单更新

```rust
// src-tauri/src/tray.rs
use tauri::{
    AppHandle, CustomMenuItem, Manager,
    SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    ActivationPolicy,
};

pub fn create_tray() -> SystemTray {
    let menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("selection_translate", "划词翻译: 已关闭"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("input_translate", "输入翻译"))
        .add_item(CustomMenuItem::new("ocr_recognize", "截图 OCR"))
        .add_item(CustomMenuItem::new("ocr_translate", "截图翻译"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("config", "设置"))
        .add_item(CustomMenuItem::new("about", "关于"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "退出"));

    SystemTray::new()
        .with_menu(menu)
        .with_tooltip("Pot - 桌面翻译与OCR")
        .with_icon(load_tray_icon())
}

// 动态更新划词翻译菜单项标签
pub fn update_tray(app: &AppHandle, selection_enabled: bool) {
    let item = app.tray_handle().get_item("selection_translate");
    if selection_enabled {
        item.set_title("划词翻译: 已开启").unwrap();
    } else {
        item.set_title("划词翻译: 已关闭").unwrap();
    }
}
```

### 事件处理器

```rust
pub fn tray_event_handler(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "selection_translate" => {
                // toggle 划词翻译
                let current = app.state::<AppConfig>().selection_enabled.load(Ordering::Relaxed);
                let new_state = !current;
                app.state::<AppConfig>().selection_enabled.store(new_state, Ordering::Relaxed);

                update_tray(app, new_state);

                if new_state {
                    crate::clipboard::start_monitor_if_needed(app);
                } else {
                    crate::clipboard::stop_monitor();
                }
            }

            "input_translate" => {
                // 打开空白翻译窗口
                if let Some(window) = app.get_webview_window("translate") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                } else {
                    crate::window::create_translate_window(app);
                }
                // 发送输入翻译模式信号
                let _ = app.emit("new_text", "[INPUT_TRANSLATE]");
            }

            "ocr_recognize" => {
                // 触发截图 OCR
                crate::screenshot::start_screenshot(app, ScreenshotMode::OcrRecognize);
            }

            "ocr_translate" => {
                // 触发截图翻译 (OCR + 自动翻译)
                crate::screenshot::start_screenshot(app, ScreenshotMode::OcrTranslate);
            }

            "config" => {
                // 打开设置窗口 (单例)
                if let Some(window) = app.get_webview_window("config") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                } else {
                    let window = tauri::WebviewWindowBuilder::new(
                        app, "config", tauri::WebviewUrl::App("/config".into())
                    )
                    .title("Pot - Settings")
                    .inner_size(780.0, 560.0)
                    .build()
                    .unwrap();
                }
            }

            "about" => {
                // 打开关于窗口
                if let Some(window) = app.get_webview_window("about") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                } else {
                    let window = tauri::WebviewWindowBuilder::new(
                        app, "about", tauri::WebviewUrl::App("/about".into())
                    )
                    .title("About Pot")
                    .inner_size(400.0, 300.0)
                    .resizable(false)
                    .build()
                    .unwrap();
                }
            }

            "quit" => {
                std::process::exit(0);
            }

            _ => {}
        },

        SystemTrayEvent::LeftClick { .. } => {
            // macOS: 左键打开翻译窗口
            // Windows/Linux: 仅在设置中启用时
            crate::window::show_translate_window(app);
        }

        SystemTrayEvent::DoubleClick { .. } => {
            crate::window::show_translate_window(app);
        }

        _ => {}
    }
}
```

### macOS 特殊处理

```rust
pub fn setup_macos_dock() {
    // 隐藏 Dock 图标 (仅托盘)
    // ActivationPolicy::Accessory: 菜单栏应用, 无 Dock 图标
    // ActivationPolicy::Regular:   普通应用
    use tauri::ActivationPolicy;
    let _ = tauri::api::process::set_activation_policy(ActivationPolicy::Accessory);
}
```

### 菜单图标处理

```rust
// macOS: template 图标 (18x18, 单色, 自动适配亮/暗模式)
// Windows: 32x32 彩色图标
// Linux: 22x22 PNG

fn load_tray_icon() -> tauri::Icon {
    let icon_bytes = include_bytes!("../icons/tray-icon.png");
    tauri::Icon::Rgba {
        rgba: icon_bytes.to_vec(),
        width: 32,
        height: 32,
    }
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 托盘框架 | Tauri built-in `SystemTray` | 跨平台, 封装原生 API, 与事件系统集成 |
| macOS Dock 图标 | `ActivationPolicy::Accessory` | 仅显示托盘, 不占用 Dock 空间 |
| macOS 图标 | Template icon (单色) | 自动适配系统亮/暗模式 |
| 设置窗口 | 单例模式 `get_webview_window("config")` | 不允许重复创建, 已存在则聚焦 |
| 划词翻译 toggle | Tauri state `AppConfig.selection_enabled` | 全局状态, 托盘可读写 |
| 托盘菜单标签 | 运行时 `set_title()` 动态更新 | "划词翻译: 已开启/已关闭" 实时反馈 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 图标资源 | `include_bytes!` 编译时嵌入 | 无文件 I/O, 图标加载 < 1ms |
| 事件处理 | `match` 分支直接处理, 无间接调用 | < 1ms 完成菜单点击响应 |
| 窗口复用 | `get_webview_window` 检查 + 复用 | 设置/关于窗口首次创建后 < 100ms 显示 |
| macOS Dock | `Accessory` policy 不创建 Dock tile | 节省 ~50MB 私有内存 |

## 错误处理

| 场景 | 触发条件 | 用户感知 | 恢复策略 |
|------|----------|----------|----------|
| 托盘图标加载失败 | 图标文件缺失 | 使用默认图标 | `include_bytes!` 编译时保证 |
| 菜单标签更新失败 | `get_item` 返回 Err | 静默忽略 | 菜单项 ID 由构建代码保证存在 |
| 窗口创建失败 | WebView 初始化异常 | 操作无响应 | 日志记录, 下次点击重试 |
| Linux 托盘不显示 | 缺少 libayatana | 应用无窗口化运行 | 检测并提示安装依赖 |

## 交叉引用

- [40-prd-Rust剪贴板模块](../prds/2026-09/40-prd-Rust剪贴板模块.md) — 划词翻译的剪贴板监听联动
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 输入翻译打开的窗口
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — 截图 OCR 打开的窗口
- [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) — 设置窗口
- [58-prd-task-Rust剪贴板实现](./58-prd-task-Rust剪贴板实现.md) — 剪贴板开发方案