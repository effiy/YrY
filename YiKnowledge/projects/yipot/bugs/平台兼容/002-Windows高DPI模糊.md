---
title: "BUG-002: Windows 高 DPI 下翻译窗口模糊"
tags: [yipot, bug, Windows, DPI, window]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: YiPot
type: bug
status: 已修复
severity: P2
platform: Windows
version: v3.0.5
fixed_in: v3.0.6
---

# BUG-002: Windows 高 DPI 下翻译窗口模糊

## 基本信息

- **严重程度**: P2-一般
- **分类**: 平台兼容
- **平台**: Windows (高 DPI 显示器)
- **频率**: 每次必现

## 复现步骤

1. Windows 10/11，显示器缩放 > 100%
2. 打开 Pot，触发翻译
3. 翻译窗口文字模糊

## 根因

Tauri 窗口未声明 DPI 感知，Windows 使用默认的位图缩放。

## 修复

在 `tauri.conf.json` 和 Rust 窗口创建时正确设置 DPI scale factor。

## 影响分析

| 维度 | 详情 |
|------|------|
| 用户体验 | 翻译窗口文字模糊，OCR 结果可读性下降 |
| 影响范围 | 所有缩放 >100% 的 Windows 用户（约 60% Windows 用户） |
| 发现渠道 | 用户反馈 + Windows 高 DPI 显示器普及率上升 |

## 技术细节

问题链路:

```
Windows DPI 缩放 (125%/150%/200%)
  → Tauri 窗口创建时未设置 DPI 感知标志
    → Windows 默认使用位图缩放 (Bitmap Scaling)
      → WebView 内容先渲染到 1x 位图 → 拉伸到物理像素
        → 文字边缘模糊、图标马赛克
```

Tauri 配置修复:

```json
// tauri.conf.json
{
  "tauri": {
    "windows": [{
      "label": "translate",
      "url": "/translate",
      "dpiAwareness": "PerMonitorV2"
    }]
  }
}
```

Rust 侧补充:

```rust
// main.rs — Windows 平台 DPI 感知声明
#[cfg(target_os = "windows")]
fn set_dpi_awareness() {
    use winapi::um::shellscalingapi::SetProcessDpiAwareness;
    unsafe { SetProcessDpiAwareness(2) }; // PROCESS_PER_MONITOR_DPI_V2
}
```

## 验证

| 缩放比例 | 显示器 | v3.0.5 | v3.0.6 | 评估 |
|---------|--------|--------|--------|------|
| 100% | FHD | 正常 | 正常 | 回归 |
| 125% | 2.5K 笔记本 | 模糊 | 清晰 | 修复 |
| 150% | 4K 27" | 严重模糊 | 清晰 | 修复 |
| 200% | 4K 15" 笔记本 | 严重模糊 | 清晰 | 修复 |
| 多显示器混合缩放 | 125%+100% | 切换时模糊 | 正常跟随 | 修复 |

## 经验教训

- DPI 感知需在进程启动早期设置（`windows_subsystem = "windows"` 之前）
- Tauri 窗口级 DPI 声明 + Rust 进程级声明双保险，避免 window scaling 回退
- 混合 DPI 场景（笔记本 150% + 外接 100%）是最高频的 bug 场景，必须纳入回归

## 关联

- 实现: [窗口定位](../../devs/2026-09/14-prd-task-窗口定位.md)
- PRD: [窗口定位与多显示器](../../prds/2026-09/17-prd-窗口定位与多显示器.md)