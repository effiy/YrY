---
doc_type: prd
title: 桌面集成与快捷键系统 — 需求规格
tags:
- 需求文档
- 快捷键
- 系统托盘
- 窗口管理
- 开机启动
category: 项目/桌面应用/需求
created: '2026-09-23'
updated: '2026-09-23'
source: 内部
type: 需求
status: 已完成
priority: 高
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: '202609'
prd_task_id: YP-09-M09
estimate_frontend: 5
review_status: 已发布
issue_type: 功能
roles: [engineer, qa]
---

# 桌面集成与快捷键系统 — 需求规格

> 需求编号：YP-09-M09 · 优先级：P0 · 人天：~5d

---

## 一、全局快捷键系统

### 1.1 四大核心快捷键

| 功能 | 配置键 | 触发行为 | 实现 |
|------|--------|---------|------|
| 划词翻译 | `hotkey_selection_translate` | 读取选中文本 → 翻译窗口 | `selection_translate()` |
| 输入翻译 | `hotkey_input_translate` | 打开翻译窗口 → 手动输入 | `input_translate()` |
| 截图 OCR | `hotkey_ocr_recognize` | 截图框选 → OCR 识别 | `ocr_recognize()` |
| 截图翻译 | `hotkey_ocr_translate` | 截图框选 → OCR + 翻译 | `ocr_translate()` |

### 1.2 快捷键注册机制 (Rust)

```rust
// hotkey.rs — 通过 Tauri GlobalShortcutManager 注册
fn register(app_handle, name, handler, key) -> Result<(), String>
```

**特性**:
- 启动时自动注册全部快捷键
- 支持前端自定义快捷键（`register_shortcut_by_frontend` 命令）
- 快捷键冲突检测与提示
- 空快捷键跳过注册（不占用）

### 1.3 快捷键配置 UI

`YiPot/src/window/Config/pages/Hotkey/index.jsx`:
- 可视化快捷键录制器
- 支持修饰键组合 (Ctrl/Alt/Shift/Meta)
- 实时冲突检测
- 一键恢复默认

---

## 二、系统托盘

### 2.1 托盘功能 (`tray.rs`)

| 菜单项 | 功能 |
|--------|------|
| 划词翻译 | 切换启用/禁用 |
| 输入翻译 | 打开翻译窗口 |
| 截图 OCR | 触发 OCR 识别 |
| 截图翻译 | 触发截图翻译 |
| 设置 | 打开配置窗口 |
| 关于 | 版本信息 |
| 退出 | 关闭应用 |

### 2.2 托盘事件

```rust
// main.rs
.on_system_tray_event(tray_event_handler)
```

**平台差异**:
- macOS: 模板图标 (黑白)、Accessory 激活策略（不显示 Dock 图标）
- Windows: 彩色图标 + 通知气泡
- Linux: 依赖 `libayatana-appindicator`

---

## 三、窗口管理

### 3.1 窗口类型 (`window.rs`)

| 窗口 | Label | 特性 |
|------|-------|------|
| 翻译窗口 | `translate` | 鼠标位置弹出、窗口尺寸记忆、跳过任务栏 |
| OCR 窗口 | `recognize` | 居中显示、窗口尺寸记忆 |
| 设置窗口 | `config` | 800x600、居中、可调整大小 |
| 截图窗口 | `screenshot` | 全屏、置顶、无边框 |
| 更新窗口 | `updater` | 600x400、居中 |
| 守护窗口 | `daemon` | 不可见、维持进程 |

### 3.2 窗口定位策略

- **鼠标跟随**: 翻译窗口默认在鼠标附近弹出
- **显示器感知**: `get_current_monitor()` 检测鼠标所在显示器
- **边界检测**: 窗口不超出显示器范围
- **位置记忆**: 支持固定位置模式

### 3.3 平台窗口特性

| 平台 | 特性 |
|------|------|
| macOS | TitleBarStyle::Overlay、hidden_title、窗口阴影 |
| Windows | transparent + decorations(false) |
| Linux | transparent + decorations(false)、无窗口阴影 |

---

## 四、开机启动

- 使用 `tauri-plugin-autostart`
- macOS: LaunchAgent 方式
- 配置页可切换启用/禁用

---

## 五、单实例检测

- 使用 `tauri-plugin-single-instance`
- 重复启动时弹出通知提示

---

## 六、验收标准

- [ ] 4 个快捷键全部可注册且不冲突
- [ ] 快捷键自定义后立即生效
- [ ] 系统托盘在所有平台正常显示
- [ ] 翻译窗口在鼠标所在显示器弹出
- [ ] 窗口不超出屏幕边界
- [ ] macOS 不显示 Dock 图标
- [ ] 单实例检测生效

---

## 用户画像与使用场景

### 典型用户

| 画像 | 角色 | 核心诉求 | 使用频率 |
|------|------|---------|---------|
| 效率工具重度用户 | 每天使用大量快捷键的专业人士 | 快捷键不冲突、常驻后台、快速响应 | 日均 50+ 次快捷键 |
| 多显示器用户 | 程序员/设计师使用 2-3 个显示器 | 翻译窗口在正确的显示器弹出 | 日均 10+ 次跨屏 |

### 使用场景

1. **多任务快捷键冲突**: 用户同时使用 IDE (Ctrl+Shift+T 打开文件) 和 Pot → 修改 Pot 划词快捷键为 Ctrl+Alt+Shift+T → 期望: 录制器检测冲突并提示
2. **多显示器工作**: 用户主屏写代码、副屏看文档 → 在副屏选中文本按快捷键 → 期望: 翻译窗口在副屏鼠标旁弹出，不跳到主屏
3. **极简 Dock 模式**: Mac 用户希望 Pot 不占 Dock 栏 → 仅托盘运行 → 期望: Cmd+Tab 不出现 Pot，仅在菜单栏显示图标
4. **开机自启动**: 用户重启电脑后 → 期望: Pot 自动启动并在后台运行，快捷键立即可用，无需手动打开

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | 快捷键注册成功率 | ≥ 99%（非冲突组合键） | 100 次注册测试 | P0 |
| AC-02 | 快捷键响应时间 | ≤ 200ms（按下到窗口弹出） | 高速计时 50 次取 P95 | P0 |
| AC-03 | 快捷键自定义立即生效 | ≤ 500ms（修改到可用） | 设置页修改后立即测试 | P0 |
| AC-04 | 托盘图标显示时间 | ≤ 1s（启动到托盘出现） | 冷启动计时 | P1 |
| AC-05 | 窗口弹出至正确显示器 | 100%（双屏环境） | 双屏各 50 次测试 | P1 |
| AC-06 | 窗口边界检测准确率 | 100%（不超出屏幕） | 所有显示器边缘测试 | P1 |
| AC-07 | 单实例检测响应 | ≤ 500ms（第二次启动到弹窗） | 重复启动计时 | P2 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 快捷键被系统占用 | 异常 | 注册失败，提示"Ctrl+Shift+T 已被系统占用" | 推荐可用快捷键组合 |
| 空快捷键 | 边界 | 跳过注册，该功能通过其他方式触发 | 该功能快捷键置空 |
| 拔掉外接显示器 | 边界 | 窗口自动迁移到剩余显示器 | 实时检测显示器变化 |
| 所有显示器相同 DPI | 边界 | 窗口尺寸按主显示器 DPI 计算 | — |
| 混合 DPI 显示器 | 边界 | 窗口按当前显示器 DPI 缩放 | 切换显示器时重新计算 |
| Linux 无托盘支持 | 异常 | 检测 `libayatana-appindicator` 是否安装 | 提示安装依赖，托盘功能降级为任务栏 |
| macOS 权限不足 | 异常 | 快捷键注册失败时提示"需要在系统偏好设置中授予辅助功能权限" | — |
| 开机启动注册失败 | 异常 | 静默失败，不影响正常启动 | 日志记录，下次启动重试 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 守护窗口内存占用 | ≤ 10MB | 进程内存监测 |
| 性能 | 托盘事件响应 | ≤ 100ms | 右键菜单弹出计时 |
| 可用性 | macOS Dock 图标 | 不显示（仅托盘） | Activity Monitor 检查 |
| 可用性 | 启动后快捷键可用 | ≤ 2s（冷启动） | 自动化测试 |
| 兼容性 | Linux 桌面环境 | X11 + Wayland (GNOME/KDE) | 各环境测试 |
| 兼容性 | Windows 通知气泡 | Win10/11 可用 | 真机测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | Tauri GlobalShortcutManager | Rust API | `register(hotkey, handler)` |
| 依赖 | tauri-plugin-autostart | Rust plugin | 自动启用/禁用 |
| 依赖 | tauri-plugin-single-instance | Rust plugin | 单实例回调 |
| 依赖 | Rust tray 模块 | Tauri builder | 托盘图标 + 菜单 |
| 依赖 | Rust window 模块 | Tauri builder | 窗口 label + 配置 |
| 被依赖 | 划词翻译核心 | Tauri event | 快捷键触发事件 |
| 被依赖 | 截图 OCR | Tauri event | 快捷键触发事件 |

---

## 相关文档

- 开发方案: [07-prd-task-桌面集成与快捷键](../../devs/2026-09/07-prd-task-桌面集成与快捷键.md)
- 测试方案: [07-prd-test-桌面集成与快捷键](../../tests/2026-09/07-prd-test-桌面集成与快捷键.md)
- 快捷键注册管理: [25-prd-快捷键注册管理](./25-prd-快捷键注册管理.md)
- 系统托盘与通知: [15-prd-系统托盘与通知](./15-prd-系统托盘与通知.md)
- 窗口定位与多显示器: [17-prd-窗口定位与多显示器](./17-prd-窗口定位与多显示器.md)
- macOS 平台适配: [49-prd-macOS平台适配](./49-prd-macOS平台适配.md)

---

## 平台差异详细矩阵

| 特性 | macOS | Windows 10/11 | Linux (GNOME/KDE) |
|------|-------|---------------|-------------------|
| 全局快捷键 API | CGEvent / Carbon | RegisterHotKey (Win32) | X11 GrabKey / Wayland GlobalShortcut |
| 快捷键数量限制 | 无硬性限制 | 每个进程理论无限 | X11 受 KeyCode 限制 |
| 托盘实现 | NSStatusBarButton (模板图标) | Shell_NotifyIcon (彩色图标) | libayatana-appindicator |
| Dock/任务栏显示 | Accessory 激活策略隐藏 | 正常显示 | 取决于桌面环境 |
| 开机启动方式 | LaunchAgent plist | 注册表 Run key | ~/.config/autostart .desktop |
| 辅助功能权限 | 系统偏好设置授权 | 无需特殊权限 | 无需特殊权限 |
| 屏幕录制权限 | 需要授权 (10.15+) | 无需授权 | 无需授权 (X11/Wayland) |
| 单实例检测 | Unix socket 或 NSWorkspace | Named mutex | Unix socket 或 D-Bus |
| 通知机制 | NSUserNotification / UNNotification | Toast 通知气泡 | libnotify / D-Bus |
| 高分屏 DPI | Native 支持 (点坐标系) | 需处理缩放因子 | X11: 需手动计算 / Wayland: 协议支持 |

---

## 快捷键冲突解决算法

### 冲突检测流程

```
用户按下快捷键录制
    ↓
系统注册测试 (GlobalShortcutManager.register)
    ├─ 注册成功 → 无冲突，保存快捷键
    └─ 注册失败 → 冲突检测
        ├─ 与系统快捷键冲突 → 提示"被系统占用"
        ├─ 与其他应用冲突 → 提示"可能与其他应用冲突"
        └─ 与 Pot 内部冲突 → 提示"与 {功能名} 快捷键冲突"
```

### 冲突解决优先级

| 冲突场景 | 解决方案 | 用户提示 |
|---------|---------|---------|
| 新快捷键与已有 Pot 快捷键冲突 | 自动释放旧快捷键，注册新快捷键 | "已替换「{旧功能}」的快捷键" |
| 快捷键与系统快捷键冲突 | 不注册，提示用户 | "Ctrl+Space 被系统占用，建议使用 Ctrl+Alt+Space" |
| 两个功能设置相同快捷键 | 拒绝设置，保留先设置者 | "与「划词翻译」快捷键相同，请选择其他组合" |
| 修饰键不足 (仅单键) | 拒绝注册 | "快捷键必须包含至少一个修饰键 (Ctrl/Alt/Shift/Meta)" |

### 推荐算法

当用户选择的快捷键冲突时，自动推荐 3 个可用组合：
1. 保留原修饰键，替换普通键为邻近键
2. 增加一个修饰键 (如 Ctrl → Ctrl+Alt)
3. 使用功能键替代 (F1-F12)

> 实现方案见: [开发方案](../../devs/2026-09/07-prd-task-桌面集成与快捷键.md)