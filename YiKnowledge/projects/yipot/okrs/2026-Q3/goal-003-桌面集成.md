---
type: okr-goal
id: yipot-003
title: "桌面集成体验 — 快捷键/托盘/窗口/外部调用"
status: completed
period: "2026 Q3"
owner: Pot-App 社区
project: YiPot
project_id: yipot
progress: 100
updated: 2026-09-23
kr1: "全局快捷键系统 — 4 个功能快捷键可自定义注册，冲突检测，跨平台兼容"
kr1_completion: 100
kr2: "系统托盘集成 — 右键菜单/状态指示/macOS Accessory 模式"
kr2_completion: 100
kr3: "智能窗口管理 — 鼠标跟随定位/多显示器感知/边界检测/尺寸记忆"
kr3_completion: 100
kr4: "本地 HTTP 服务 — 外部应用通过 HTTP API 调用翻译/OCR"
kr4_completion: 100
kr5: "单实例检测 — 防止重复启动，友好通知提示"
kr5_completion: 100
metric1_id: "yipot-m07"
metric1_desc: "快捷键响应延迟"
metric1_current: "<200ms"
metric1_target: "<500ms"
metric2_id: "yipot-m08"
metric2_desc: "HTTP 服务端口"
metric2_current: "60828 (可配置)"
metric2_target: "可配置"
metric3_id: "yipot-m09"
metric3_desc: "窗口定位准确率"
metric3_current: "100%"
metric3_target: "100%"
related_prds:
  - projects/yipot/prds/2026-09/07-prd-桌面集成与快捷键.md
  - projects/yipot/prds/2026-09/10-prd-外部调用与HTTP服务.md
  - projects/yipot/prds/2026-09/15-prd-系统托盘与通知.md
  - projects/yipot/prds/2026-09/17-prd-窗口定位与多显示器.md
---

# 桌面集成体验 — 快捷键/托盘/窗口/外部调用

> Q3 核心工程目标。构建完整的桌面集成体验——全局快捷键、系统托盘、智能窗口管理、本地 HTTP 服务，让 Pot 成为真正的"系统级"工具。**全部 5 个 KR 达成。**

---

## 背景

桌面翻译工具的核心竞争力在于"无缝集成到用户工作流"。用户不需要打开浏览器、访问网站——选中文本、按下快捷键、看到翻译。这要求深度集成操作系统能力：全局快捷键、系统托盘、窗口管理、外部调用接口。

## KR 达成情况

### KR1: 全局快捷键系统 ✓

4 个功能快捷键（划词翻译/输入翻译/截图OCR/截图翻译），通过 Tauri `GlobalShortcutManager` 注册，支持前端自定义。`hotkey.rs` 模块管理，快捷键配置持久化。

### KR2: 系统托盘集成 ✓

`tray.rs` 管理托盘图标和右键菜单。macOS 使用 `ActivationPolicy::Accessory` 隐藏 Dock 图标。托盘菜单提供全部功能快捷入口。

### KR3: 智能窗口管理 ✓

`window.rs` 实现鼠标跟随定位、多显示器感知（`get_current_monitor`）、边界检测、尺寸记忆、DPI 缩放适配。macOS 使用 `TitleBarStyle::Overlay`，Win/Linux 使用透明无边框。

### KR4: 本地 HTTP 服务 ✓

`server.rs` 基于 `tiny_http` 实现，默认端口 60828。支持 7 个端点（translate/ocr/config 等），外部应用（Alfred/Raycast/脚本）可调用。

### KR5: 单实例检测 ✓

`tauri-plugin-single-instance` 防止重复启动，弹出通知提示用户。

---

## 风险分析

| 风险 | 概率 | 影响 | 缓解措施 | 状态 |
|------|------|------|---------|------|
| macOS辅助功能权限未授权导致快捷键注册失败 | 中 | 高 | 启动时检测权限状态，未授权时弹出引导提示窗口 | 已缓解 |
| Wayland下全局快捷键API受限 | 中 | 中 | 检测Wayland环境，提示用户使用XWayland或手动配置 | 已缓解 |
| 多显示器DPI混合（4K+1080P）导致窗口定位偏移 | 中 | 中 | `get_current_monitor`获取每个显示器scale factor，窗口坐标独立计算 | 已缓解 |
| 本地HTTP服务端口60828被占用 | 低 | 低 | 端口冲突检测+配置页面允许用户自定义端口（60828-60838范围） | 已缓解 |
| Windows通知系统服务未运行时托盘菜单无响应 | 低 | 中 | 托盘右键菜单不依赖推送通知，独立于Windows通知服务 | 已缓解 |

## 目标依赖关系

```
yipot-003 (桌面集成)
  ├── 依赖: yipot-001 (划词翻译/输入翻译的快捷键触发)
  ├── 依赖: yipot-002 (截图OCR/截图翻译的截图+识别流程)
  └── 被依赖: yipot-004 (托盘菜单/窗口样式/快捷键持久化配置被国际化主题系统消费)

yipot-003 是连接"核心功能"与"用户体验"的桥梁层。上游依赖翻译和OCR两个
核心能力模块提供实际功能，下游被国际化/主题系统消费其窗口管理和配置基础设施。
快捷键系统是用户最高频的交互入口，托盘是后台运行状态的唯一可视标识，
窗口管理决定了用户对产品"完成度"的主观评价。
```

## 经验教训

| 编号 | 经验 | 来源 | 影响 |
|------|------|------|------|
| L1 | Tauri多窗口模式下Jotai atom跨窗口共享需额外处理——每个窗口有独立的JS上下文，默认的atom状态不跨窗口同步 | 窗口管理 | 跨窗口共享状态需通过Rust事件总线（window.emit/listen）中转，或使用tauri-plugin-store持久化 |
| L2 | macOS `screencapture -i` 截图方式最稳定，但无法自定义截图UI（十字光标样式不可改），Win/Linux自绘窗口更灵活但维护成本高 | 截图 | 保留双路径：macOS用系统截图，Win/Linux用Canvas自绘窗口 |
| L3 | `tiny_http` 单线程服务器在高并发(>50req/s)场景下请求排队明显，但作为本地辅助服务足够 | HTTP服务 | 如未来需要高并发本地API，考虑迁移到actix-web或axum |
| L4 | Windows下`GlobalShortcutManager`注册Alt+单字母快捷键会导致系统菜单栏闪烁，建议用户避免此类组合 | 快捷键 | 在快捷键配置页面添加交互提示，引导用户选择Ctrl/Alt+组合键 |
| L5 | 单实例检测在macOS沙盒模式下可能误判，因为沙盒会改变进程ID可见性 | 单实例 | 非沙盒部署是默认选择，macOS通过Apple公证后不受沙盒影响 |