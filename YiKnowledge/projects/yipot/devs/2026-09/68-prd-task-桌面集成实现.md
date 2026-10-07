---

doc_type: module
prd_task_id: "YP-09-M09"
title: "桌面集成与快捷键 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 5
source_prd: "07-prd-桌面集成与快捷键.md"

type: task
---

# 桌面集成与快捷键 — 开发方案

> 来源 PRD：[07-prd-桌面集成与快捷键.md](../../prds/2026-09/07-prd-桌面集成与快捷键.md)
> 需求编号：YP-09-M09 · 优先级：P0 · 人天：5d

> **文档职责**：本文档定义全局快捷键注册、窗口管理、系统托盘、开机启动、单实例检测的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、全局快捷键系统

### 1.1 Rust 层快捷键注册

```rust
// hotkey.rs — 核心注册逻辑
use tauri::GlobalShortcutManager;

pub fn register_all(app: &tauri::AppHandle, config: &HotkeyConfig) -> Result<(), String> {
    let manager = app.global_shortcut_manager();
    
    // 四大核心快捷键
    let shortcuts = vec![
        ("hotkey_selection_translate", "划词翻译", trigger_selection_translate),
        ("hotkey_input_translate", "输入翻译", trigger_input_translate),
        ("hotkey_ocr_recognize", "截图 OCR", trigger_ocr_recognize),
        ("hotkey_ocr_translate", "截图翻译", trigger_ocr_translate),
    ];
    
    for (key, name, handler) in shortcuts {
        if let Some(hotkey) = config.get(key) {
            if hotkey.is_empty() { continue; } // 空快捷键跳过
            manager.register(&hotkey, handler.clone())
                .map_err(|e| format!("{name} 快捷键 {hotkey} 注册失败: {e}"))?;
        }
    }
    
    Ok(())
}
```

### 1.2 快捷键录制器

```typescript
// Hotkey/index.jsx — 快捷键录制器核心逻辑
function HotkeyRecorder({ value, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    const combo: string[] = [];
    if (e.ctrlKey) combo.push('Ctrl');
    if (e.altKey) combo.push('Alt');
    if (e.shiftKey) combo.push('Shift');
    if (e.metaKey) combo.push('Meta');
    
    // 过滤掉单独修饰键 (必须至少一个普通键)
    if (['Control','Alt','Shift','Meta'].includes(e.key)) return;
    combo.push(e.key);
    
    const hotkey = combo.join('+');
    
    // 实时冲突检测 (invoke Rust 测试注册)
    invoke('test_shortcut', { hotkey }).then(conflict => {
      if (conflict) {
        alert(`"${hotkey}" 已被系统或应用占用`);
      } else {
        onChange(hotkey);
        setRecording(false);
      }
    });
  };
  
  return (
    <input
      value={recording ? '按下快捷键...' : value || '未设置'}
      onFocus={() => setRecording(true)}
      onBlur={() => setRecording(false)}
      onKeyDown={handleKeyDown}
    />
  );
}
```

### 1.3 冲突检测与推荐算法

```
用户按下快捷键录制
    ↓
Rust GlobalShortcutManager.register() 测试
    ├─ 成功 → 无冲突, 保存
    └─ 失败 → 冲突检测
        ├─ 系统快捷键 → 提示 + 推荐 3 个可用组合
        ├─ Pot 内部冲突 → 提示"与「{功能名}」冲突"
        └─ 仅单键无修饰符 → 拒绝, "必须包含至少一个修饰键"
```

---

## 二、窗口管理系统

### 2.1 六种窗口类型

```rust
// window.rs — 窗口创建工厂
impl WindowManager {
    pub fn create_translate(app: &AppHandle) {
        tauri::WindowBuilder::new(app, "translate", tauri::WindowUrl::App("translate.html".into()))
            .inner_size(350.0, 420.0)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(false) // 延迟显示
            .build()
            .unwrap();
    }
    
    pub fn create_screenshot(app: &AppHandle) {
        tauri::WindowBuilder::new(app, "screenshot", tauri::WindowUrl::App("screenshot.html".into()))
            .fullscreen(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .build()
            .unwrap();
    }
    
    pub fn create_config(app: &AppHandle) {
        tauri::WindowBuilder::new(app, "config", tauri::WindowUrl::App("config.html".into()))
            .inner_size(800.0, 600.0)
            .center()
            .resizable(true)
            .title("YiPot 设置")
            .build()
            .unwrap();
    }
    
    // 守护窗口: 不可见, 仅维持进程存活
    pub fn create_daemon(app: &AppHandle) {
        tauri::WindowBuilder::new(app, "daemon", tauri::WindowUrl::App("daemon.html".into()))
            .visible(false)
            .build()
            .unwrap();
    }
}
```

### 2.2 鼠标跟随定位

```typescript
// useWindowPosition.ts — 翻译窗口定位
function calculateTranslateWindowPosition(
  mouseX: number, mouseY: number,
  windowWidth: number, windowHeight: number
): { x: number; y: number } {
  // 1. 获取当前显示器信息
  const monitor = invoke<Monitor>('get_current_monitor');
  
  // 2. 初始位置: 鼠标右下方
  let x = mouseX + 10;
  let y = mouseY + 10;
  
  // 3. 边界检测: 不超出显示器范围
  if (x + windowWidth > monitor.x + monitor.width) {
    x = mouseX - windowWidth - 10; // 翻转至左侧
  }
  if (y + windowHeight > monitor.y + monitor.height) {
    y = mouseY - windowHeight - 10; // 翻转至上方
  }
  
  // 4. 确保不超出屏幕左边和上边
  x = Math.max(monitor.x, x);
  y = Math.max(monitor.y, y);
  
  return { x, y };
}
```

---

## 三、系统托盘

### 3.1 托盘创建 (Rust)

```rust
// tray.rs
use tauri::{SystemTray, SystemTrayMenu, SystemTrayMenuItem, CustomMenuItem};

pub fn create_tray() -> SystemTray {
    let menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("toggle_translate", "划词翻译").selected())
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
        .with_tooltip("YiPot")
}
```

### 3.2 macOS 特殊处理

```rust
// main.rs — macOS 构建器
let app = tauri::Builder::default()
    .setup(|app| {
        #[cfg(target_os = "macos")]
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        // Accessory: 不显示 Dock 图标, 仅菜单栏图标
        Ok(())
    })
    .system_tray(tray::create_tray())
    .on_system_tray_event(tray::handler);
```

---

## 四、开机启动与单实例

### 4.1 开机启动

```rust
// 使用 tauri-plugin-autostart
// Cargo.toml: tauri-plugin-autostart = "1"
// macOS: LaunchAgent plist
// Windows: 注册表 Run key
// Linux: ~/.config/autostart/*.desktop
```

### 4.2 单实例检测

```rust
// main.rs
tauri_plugin_single_instance::init(|app, argv, cwd| {
    // 已有实例运行
    Notification::new()
        .title("YiPot 已在运行")
        .body("请查看系统托盘图标")
        .show()
        .ok();
});
```

---

## 五、设计决策

| 决策 | 理由 |
|------|------|
| Rust 层集中注册快捷键 | Tauri GlobalShortcutManager 是唯一可靠的跨平台全局快捷键 API |
| 快捷键空字符串表示"不注册" | 灵活性: 用户可以仅用 2 个快捷键, 其他通过托盘触发 |
| 鼠标跟随而非固定位置 | 符合直觉, 减少鼠标移动距离; 支持固定模式作为备选 |
| macOS Accessory 策略 | 极简用户体验: Pot 是后台工具, 不应占据 Dock 空间 |
| 守护窗口 (daemon) 维持进程 | Tauri 所有窗口关闭后进程退出, 需要一个不可见窗口维持托盘运行 |

---

## 六、跨平台差异

| 特性 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 快捷键 API | CGEvent | RegisterHotKey | X11 GrabKey / Wayland protocol |
| 托盘图标 | NSStatusBarButton 模板图标 | Shell_NotifyIcon 彩色图标 | libayatana-appindicator |
| 开机启动 | LaunchAgent plist | 注册表 HKCU\Run | autostart .desktop |
| 单实例 | Unix socket | Named mutex | Unix socket / D-Bus |
| 权限要求 | 辅助功能 + 屏幕录制 | 无需 | 无需 (X11) / portal (Wayland) |

---

## 七、错误处理

| 错误 | 处理 |
|------|------|
| 快捷键被系统占用 | 注册失败, 提示用户选择其他组合, 推荐 3 个可用组合 |
| Linux 缺少 libayatana | 检测并提示安装, 托盘功能降级为任务栏图标 |
| macOS 辅助功能权限未开启 | 提示引导至系统偏好设置 |
| 开机启动注册失败 | 静默失败, 日志记录, 下次启动重试 |
| 插拔显示器 | 监听显示器变化事件, 窗口自动迁移到剩余显示器 |

---

## 八、交叉引用

- 开发方案: [18-prd-task-快捷键管理](./18-prd-task-快捷键管理.md)
- 开发方案: [38-prd-task-系统托盘实现](./38-prd-task-系统托盘实现.md)
- 开发方案: [14-prd-task-窗口定位](./14-prd-task-窗口定位.md)
- PRD: [25-prd-快捷键注册管理](../../prds/2026-09/25-prd-快捷键注册管理.md)
- PRD: [17-prd-窗口定位与多显示器](../../prds/2026-09/17-prd-窗口定位与多显示器.md)
- PRD: [49-prd-macOS平台适配](../../prds/2026-09/49-prd-macOS平台适配.md)