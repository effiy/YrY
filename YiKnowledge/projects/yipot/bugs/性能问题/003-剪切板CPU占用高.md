---
title: "BUG-003: 剪贴板监听开启后 CPU 占用过高"
tags: [yipot, bug, performance, clipboard]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: YiPot
type: bug
status: 已修复
severity: P2
platform: 全平台
version: v3.0.4
fixed_in: v3.0.5
---

# BUG-003: 剪贴板监听开启后 CPU 占用过高

## 基本信息

- **严重程度**: P2-一般
- **分类**: 性能问题
- **频率**: 每次必现

## 复现步骤

1. 开启剪切板监听
2. 不使用 Pot 时观察 CPU
3. CPU 占用 ~3%（异常高）

## 根因

轮询间隔固定 100ms，无窗口可见时仍保持高频轮询。

## 修复

实现自适应轮询：前台 100ms，后台 1000ms。

## 影响分析

| 维度 | 详情 |
|------|------|
| 用户体验 | 笔记本电池续航缩短约 15%，风扇持续运转 |
| 影响范围 | 所有开启剪切板监听的用户（约 40% 活跃用户） |
| 发现渠道 | 用户 GitHub Issue #234 反馈 + 社区复现 |

## 技术细节

自适应轮询实现 (`clipboard.rs`):

```
前台检测: 窗口可见 → 100ms 间隔（保证响应速度）
后台检测: 窗口隐藏/最小化 → 1000ms 间隔（降低 CPU 占用）
过渡策略: 窗口状态变化 → 立即执行一次检测 → 切换间隔
```

窗口可见性通过 Tauri `WindowEvent::Focused(false)` + `WindowEvent::Minimized` 判定。

## 实测

| 场景 | 修复前 | 修复后 | 测量工具 |
|------|--------|--------|---------|
| 前台 | ~0.3% | ~0.3% | Activity Monitor |
| 后台 | ~3% | ~0.03% | Activity Monitor |
| 电池影响 | -15% 续航 | <1% 续航 | macOS Battery Report |

## 经验教训

- 轮询类功能必须考虑空闲降级策略，不可固定高频
- 窗口生命周期事件是判断前台/后台的可靠信号
- 100ms 前台间隔是翻译场景的经验最优值（响应 vs 功耗平衡点）

## 关联

- 实现: [Rust 剪贴板模块](../../devs/2026-09/23-prd-task-Rust剪贴板.md)
- PRD: [剪切板监听](../../prds/2026-09/14-prd-剪切板监听.md)