---

doc_type: module
prd_task_id: "YP-09-S06"
title: "窗口定位与小应用窗口管理 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "17-prd-窗口定位与多显示器.md"

type: task
---

# 窗口定位与小应用窗口管理 — 开发方案

> 来源 PRD：[17-prd-窗口定位与多显示器.md](../../prds/2026-09/17-prd-窗口定位与多显示器.md)

## 架构概览

```
用户划词/按键触发
      │
      ▼
┌─────────────────────────────────────────────────┐
│              Rust window.rs                      │
│                                                  │
│  get_current_monitor(x, y)                       │
│    │  枚举显示器列表 → 判断鼠标落在哪个屏幕        │
│    ▼                                              │
│  build_window(label, title)                      │
│    │  1. 获取鼠标物理坐标 (Mouse::get_mouse_pos)  │
│    │  2. 确定目标显示器                           │
│    │  3. 检查窗口复用 (已存在→聚焦)               │
│    │  4. 创建/定位窗口                            │
│    ▼                                              │
│  clamp_to_monitor(mouse, width, height, monitor)  │
│    │  DPI 感知边界检测 → 四方向修正               │
│    ▼                                              │
│  Tauri WindowBuilder (.position, .decorations)    │
│    │  macOS: TitleBarStyle::Overlay               │
│    │  Windows/Linux: transparent + decorations    │
│    ▼                                              │
│  Window (focused, positioned in monitor bounds)   │
└─────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────┐
│  React Window Components (翻译/OCR)              │
│    │  window_width/height 持久化记忆              │
│    │  DPI scale_factor 实时感知                  │
│    ▼                                              │
│  WebView 渲染 (正确的物理尺寸)                   │
└─────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src-tauri/src/window.rs`

### 显示器检测

```rust
fn get_current_monitor(x: i32, y: i32) -> Monitor {
    let monitors = daemon_window.available_monitors().unwrap();
    for m in monitors {
        let pos = m.position();
        let size = m.size();
        if x >= pos.x && x <= pos.x + size.width as i32
           && y >= pos.y && y <= pos.y + size.height as i32 {
            return m;
        }
    }
    // fallback: 主显示器
    daemon_window.primary_monitor().unwrap().unwrap()
}
```

**关键设计**：遍历所有显示器判断鼠标落在哪个范围内，时间复杂度 O(n)（n=显示器数量，通常 ≤3）。该函数在每次窗口创建时调用一次。

### 边界检测算法

```rust
fn clamp_to_monitor(mouse_x: &mut i32, mouse_y: &mut i32, 
                    width: i32, height: i32, monitor: &Monitor) {
    let scale = monitor.scale_factor() as i32;
    let m_pos = monitor.position();
    let m_size = monitor.size();
    
    let right_edge = m_pos.x + m_size.width as i32;
    let bottom_edge = m_pos.y + m_size.height as i32;
    
    // 右边界溢出 → 窗口左移
    if *mouse_x + width * scale > right_edge {
        *mouse_x -= width * scale;
    }
    // 下边界溢出 → 窗口上移
    if *mouse_y + height * scale > bottom_edge {
        *mouse_y -= height * scale;
    }
    // 左上边界不修正——至少部分可见即可
}
```

### DPI 感知坐标转换

```rust
// 物理坐标 → 逻辑坐标换算
let logical_x = monitor.position().x 
    + (mouse_physical.x as f64 * monitor.scale_factor()) as i32;
let logical_y = monitor.position().y 
    + (mouse_physical.y as f64 * monitor.scale_factor()) as i32;
```

### 窗口复用策略

```rust
fn build_window(label: &str, title: &str) -> (Window, bool) {
    // 已存在 → 聚焦而非重复创建
    if let Some(existing) = app_handle.get_window(label) {
        existing.set_focus().unwrap();
        return (existing, true);  // exists = true
    }
    // 创建新窗口 (含位置、透明、平台装饰)
    let window = WindowBuilder::new(app_handle, label, ...)
        // ...
        .build().unwrap();
    (window, false)
}
```

### 平台差异化配置

| 平台 | 窗口装饰 | 透明 | 实现方式 |
|------|---------|------|----------|
| macOS | Overlay 标题栏 | 否 | `TitleBarStyle::Overlay` + `hidden_title(true)` |
| Windows | 无边框 | 是 | `transparent(true)` + `decorations(false)` |
| Linux | 无边框 | 是 | `transparent(true)` + `decorations(false)` |

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 定位基准 | 鼠标跟随 (mouse follow) | 屏幕中央 / 固定位置 | 翻译窗口应与用户注意力焦点（鼠标/选区）一致 | 光标在边缘时需边界检测 |
| 多显示器 | 检测鼠标所在显示器创建窗口 | 始终主显示器 | 用户在哪个屏操作就在哪个屏弹出 | 依赖准确的显示器边界枚举 |
| 边界检测 | 超出右/下边界时向左/上偏移 | 缩放到屏幕内 | 保持原始尺寸可读性，偏移保持靠近鼠标 | 鼠标在右下角+大窗口→可能偏移到屏幕中部 |
| DPI 缩放 | 物理坐标 × DPI factor | 仅物理坐标 | Retina @2x + 外接 @1x 混合场景窗口大小一致 | 需 Rust monitor API 获取 scale_factor |
| 窗口复用 | 已存在→聚焦，不存在→创建 | 每次新建 | 避免多窗口堆叠，节省内存 | 多屏间切换延迟（需从旧屏迁移到新屏） |
| 常驻窗口 | Tauri daemon_window (不可见) | 无后台窗口 | Rust 需要 AppHandle 枚举显示器 | 额外 ~5MB 内存 |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 显示器枚举缓存 | 减少系统调用 | 仅在显示器配置变化时重新枚举 | monitor 列表缓存，创建窗口时不重复查询 |
| 窗口定位计算 | ≤5ms | 纯数学坐标计算，无 I/O | 边界检测为 O(1) 算术运算 |
| 窗口尺寸记忆 | 避免重复读取磁盘 | Rust 端解析配置时预加载到内存 HashMap | 单次 io::read，后续 O(1) 查找 |
| 混合 DPI 缩放 | 各 DPI 均匀渲染 | scale_factor 预先计算，窗口创建时传参 | 避免每次渲染重复计算 DPI |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-系统 | 无法获取鼠标位置 | fallback 到屏幕中央 | 自动降级 | 无感知 |
| L1-系统 | 无法枚举显示器 | fallback 到 primary_monitor | 自动降级 | 无感知 |
| L1-系统 | 无可用显示器 (headless) | 窗口创建在主显示器坐标 | RDP/SSH 适配 | 窗口可能不可见 |
| L2-窗口 | DPI scale_factor 获取失败 | fallback 到 1.0 | 自动降级 | 窗口尺寸可能偏小/偏大 |
| L2-窗口 | 窗口位置超出所有显示器 | clamp 到最近显示器的可见区域 | 自动修正 | 无感知 |
| L3-配置 | 窗口尺寸记忆值异常 (<100 或 >2000) | 使用默认值 350×420 | 配置校验 | 首次启动使用默认尺寸 |

### 极端场景处理

```
场景 1: 鼠标在屏幕右下角 (0,0 剩余空间)
  → 向右溢出：向左偏移 window.width
  → 向下溢出：向上偏移 window.height
  → 结果：窗口完全在屏幕内，左上角靠近鼠标

场景 2: 仅一台 1366×768 显示器，窗口 800×600
  → 边界检测生效，偏移确保至少 80% 窗口可见

场景 3: 外接显示器突然断开
  → macOS/Windows 自动将幽灵窗口迁移到主显示器
  → 下次创建窗口时使用主显示器坐标
```

---

## 跨平台差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 鼠标位置 | CGEvent (Core Graphics) | GetCursorPos (Win32) | X11: XQueryPointer / Wayland: wlr-virtual-pointer |
| 显示器枚举 | NSScreen.screens | EnumDisplayMonitors | X11: XRandr / Wayland: wl_output |
| DPI Scale | NSScreen.backingScaleFactor | GetDpiForMonitor | X11: xdpyinfo / Wayland: wl_output.scale (整数 only) |
| 窗口置顶 | NSWindow.level(.floating) | HWND_TOPMOST | _NET_WM_STATE_ABOVE / Wayland 不支持 |

> **Wayland 限制**：窗口位置和置顶受 compositor 策略限制，不可通过应用代码完全控制。

---

**关联文档**：
- 桌面集成架构：[03-prd-task-桌面集成架构.md](./03-prd-task-桌面集成架构.md)
- React 组件与窗口架构：[10-prd-task-React组件与窗口架构.md](./10-prd-task-React组件与窗口架构.md)
- 测试方案：[17-prd-test-窗口定位与多显示器](../../tests/2026-09/17-prd-test-窗口定位与多显示器.md)