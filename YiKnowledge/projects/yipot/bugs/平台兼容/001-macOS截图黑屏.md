---
title: "BUG-001: macOS 截图在 M 芯片外接显示器黑屏"
tags: [yipot, bug, macOS, screenshot, M-chip]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: YiPot
type: bug
status: 已修复
severity: P1
platform: macOS
version: v3.0.6
fixed_in: v3.0.7
---

# BUG-001: macOS 截图在 M 芯片外接显示器黑屏

## 基本信息

- **严重程度**: P1-严重
- **分类**: 平台兼容
- **平台**: macOS (Apple Silicon + 外接显示器)
- **频率**: 每次必现

## 复现步骤

1. M 芯片 Mac 连接外接显示器
2. 在外接显示器上按截图 OCR 快捷键
3. 框选区域
4. 截图结果为全黑

## 根因

`CGWindowListCreateImage` 在 M 芯片外接显示器场景下，需要指定正确的 `CGWindowImageOption`，否则返回黑色图片。

## 修复

v3.0.7 中使用 `screencapture -i -r` 替代自绘截图窗口。

## 影响分析

| 维度 | 详情 |
|------|------|
| 用户体验 | M 芯片外接显示器用户完全无法使用截图功能 |
| 影响范围 | Apple Silicon + 外接显示器用户（约 25% macOS 用户） |
| 发现渠道 | 用户 GitHub Issue #312 反馈，macOS 社区活跃讨论 |

## 技术细节

`CGWindowListCreateImage` 在 M 芯片外接显示器场景下的行为差异:

- Intel Mac: `kCGWindowListOptionOnScreenBelowWindow` 正常捕获
- M 芯片 + 内建显示器: 正常
- M 芯片 + 外接显示器: 返回黑色位图（Apple 已知 bug，未公开修复）

切换为 `screencapture` 系统命令的优势:
- 系统级截图，绕过 GPU 帧缓冲差异
- 自动处理多显示器坐标变换
- `-r` 参数禁用光标捕获的声音效果

## 验证

| 设备 | 显示器 | 结果 |
|------|--------|------|
| M1 MacBook Air | 内建 | ✓ |
| M1 MacBook Air | 外接 Dell 4K (USB-C) | ✓ (之前黑屏) |
| M2 MacBook Pro | 外接 LG 2K (HDMI) | ✓ (之前黑屏) |
| Intel MacBook Pro | 外接 4K | ✓ (回归) |
| M1 Mac mini | 双外接 4K | ✓ |

## 经验教训

- 底层 GPU API (`CGWindowListCreateImage`) 在 Apple Silicon 转换期存在未文档化的兼容问题
- 系统命令行工具 (`screencapture`) 作为兜底方案比直接调用 GPU API 更可靠
- macOS 截图权限 (`Screen Recording`) 需在修复后重新引导用户授权

## 关联

- 实现: [截图与选区](../../devs/2026-09/33-prd-task-截图与选区.md)
- PRD: [截图与选区](../../prds/2026-09/16-prd-截图与选区.md)