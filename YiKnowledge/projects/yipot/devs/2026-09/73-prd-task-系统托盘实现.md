---

doc_type: module
prd_task_id: "YP-09-S04"
title: "系统托盘与通知 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1
source_prd: "15-prd-系统托盘与通知.md"

type: task
---

# 系统托盘与通知 — 开发方案

> 来源 PRD：[15-prd-系统托盘与通知.md](../../prds/2026-09/15-prd-系统托盘与通知.md)
> 需求编号：YP-09-S04 · 优先级：P1 · 人天：1d

> **文档职责**：本文档定义系统托盘图标、菜单、macOS 特殊处理、单实例检测的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、系统托盘实现

### 1.1 Rust 托盘模块

```rust
// tray.rs — 完整托盘实现
use tauri::{
    SystemTray, SystemTrayMenu, SystemTrayMenuItem,
    CustomMenuItem, SystemTrayEvent, AppHandle, Manager,
};

pub fn create_system_tray() -> SystemTray {
    // 菜单项
    let toggle = CustomMenuItem::new("toggle_translate", "划词翻译");
    let input = CustomMenuItem::new("input_translate", "输入翻译");
    let ocr_rec = CustomMenuItem::new("ocr_recognize", "截图 OCR");
    let ocr_tran = CustomMenuItem::new("ocr_translate", "截图翻译");
    let config = CustomMenuItem::new("config", "设置");
    let about = CustomMenuItem::new("about", "关于");
    let quit = CustomMenuItem::new("quit", "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(toggle)
        .add_item(input)
        .add_item(ocr_rec)
        .add_item(ocr_tran)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(config)
        .add_item(about)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    // 平台相关图标
    #[cfg(target_os = "macos")]
    let tray = SystemTray::new()
        .with_menu(tray_menu)
        .with_icon(tauri::Icon::Raw(
            include_bytes!("../icons/tray-icon-macos.png").to_vec()
        ));
    
    #[cfg(not(target_os = "macos"))]
    let tray = SystemTray::new()
        .with_menu(tray_menu)
        .with_icon(tauri::Icon::Raw(
            include_bytes!("../icons/tray-icon.png").to_vec()
        ));

    tray
}

// 托盘事件处理
pub fn handle_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "toggle_translate" => {
                // 切换划词翻译启用状态
                // 更新菜单项的 selected 状态
            }
            "input_translate" => {
                create_or_focus_window(app, "translate");
            }
            "ocr_recognize" => {
                app.emit_all("tray_ocr_recognize", ()).ok();
            }
            "ocr_translate" => {
                app.emit_all("tray_ocr_translate", ()).ok();
            }
            "config" => {
                create_or_focus_window(app, "config");
            }
            "about" => {
                // 显示关于对话框
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        },
        SystemTrayEvent::LeftClick { .. } => {
            // 左键单击: 打开翻译窗口 (快捷操作)
            create_or_focus_window(app, "translate");
        }
        _ => {}
    }
}
```

### 1.2 macOS 特殊处理

```rust
// main.rs — macOS 构建器配置
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                // 隐藏 Dock 图标, 仅托盘运行
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
                
                // 设置应用为后台应用 (不接收键盘焦点, 避免抢走用户当前应用焦点)
                // ActivationPolicy::Accessory 已包含此行为
            }
            Ok(())
        })
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_tray_event)
        .run(tauri::generate_context!())
        .expect("启动失败");
}
```

### 1.3 平台差异处理

| 特性 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 图标类型 | 模板图标 (黑白, 适配 Dark/Light) | 彩色图标 | 彩色图标 |
| 图标尺寸 | 18x18pt @2x (36x36px) | 16x16 + 32x32 | 22x22 或 24x24 |
| 实现方式 | NSStatusBarButton | Shell_NotifyIcon | libayatana-appindicator |
| 依赖检查 | 无 | 无 | 检测 `libayatana-appindicator3-1` |

### 1.4 Linux 依赖检查

```rust
#[cfg(target_os = "linux")]
fn check_tray_dependency() -> Result<(), String> {
    // 检查 libayatana-appindicator 是否安装
    let result = std::process::Command::new("pkg-config")
        .arg("--exists")
        .arg("ayatana-appindicator3-0")
        .status();
    
    match result {
        Ok(status) if status.success() => Ok(()),
        _ => Err(
            "未检测到 libayatana-appindicator。\n\
             Ubuntu/Debian: sudo apt install libayatana-appindicator3-dev\n\
             Fedora: sudo dnf install libayatana-appindicator-devel\n\
             系统托盘功能可能不可用。".into()
        ),
    }
}
```

---

## 二、单实例检测

### 2.1 实现

```rust
// main.rs — 单实例插件集成
use tauri_plugin_single_instance;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            // 第二个实例启动时触发
            app.emit_all("second-instance", argv).ok();
        }))
        .setup(|app| {
            // 监听第二个实例事件
            let handle = app.handle();
            app.listen_global("second-instance", move |_| {
                // 弹出通知
                tauri::api::notification::Notification::new(&handle.config().tauri.bundle.identifier)
                    .title("YiPot")
                    .body("程序已在运行，请查看系统托盘图标")
                    .show()
                    .ok();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动失败");
}
```

---

## 三、"划词翻译"切换状态

托盘菜单中的"划词翻译"项显示启用/禁用状态：

```rust
fn update_toggle_state(app: &AppHandle, enabled: bool) {
    let tray = app.tray_handle();
    let item = tray.get_item("toggle_translate");
    
    if enabled {
        item.set_title("划词翻译 (已启用)").ok();
        item.set_selected(true).ok();
    } else {
        item.set_title("划词翻译 (已禁用)").ok();
        item.set_selected(false).ok();
    }
}
```

---

## 四、设计决策

| 决策 | 理由 |
|------|------|
| macOS Accessory 策略 | Pot 是后台工具, 不应占 Dock 空间; Accessory 使 Cmd+Tab 不可见 |
| 左键单击打开翻译窗口 | 最常用操作, 减少一次右键步骤 |
| 退出 = 完全退出进程 | 不保留后台守护 (区别于微信等应用) |
| Linux 检测 tray 依赖 | 未安装 libayatana-appindicator 时托盘不可用, 提前告知用户 |
| 单实例 + 通知 | 用户双击应用图标时常见场景, 明确提示而非静默忽略 |

---

## 五、错误处理

| 错误 | 处理 |
|------|------|
| Linux 缺少 libayatana | 启动时检测, 弹窗提示安装命令 |
| macOS 菜单栏空间不足 | 由系统自动管理 (隐藏图标), 无需处理 |
| 托盘创建失败 | 日志记录, 应用仍可正常通过快捷键/窗口使用 |
| 通知权限未开启 (Windows) | 静默失败, 不影响功能 |
| 退出时托盘残留 | 确保 `std::process::exit(0)` 完全退出 |

---

## 六、交叉引用

- 开发方案: [33-prd-task-桌面集成实现](./33-prd-task-桌面集成实现.md) (窗口管理/快捷键)
- PRD: [07-prd-桌面集成与快捷键](../../prds/2026-09/07-prd-桌面集成与快捷键.md)
- PRD: [41-prd-Rust托盘模块](../../prds/2026-09/41-prd-Rust托盘模块.md)
- PRD: [49-prd-macOS平台适配](../../prds/2026-09/49-prd-macOS平台适配.md)