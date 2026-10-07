---
doc_type: prd
title: "YP-09-S30: 窗口动画与过渡效果"
status: 已完成
priority: P3
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S30
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 动画, UI, Framer Motion]
category: 项目/桌面应用/需求
---

# YP-09-S30: 窗口动画与过渡效果

> 需求编号：YP-09-S30 · 优先级：P3 · 人天：0.5d · 状态：已完成

## 背景

流畅的动画提升产品的品质感。翻译窗口弹出/关闭、OCR 结果展示等需要过渡动画。

## 技术方案

- **Framer Motion**: React 动画库，用于组件级过渡
- **React Spring**: 弹簧物理动画，用于窗口级动画

## 动画列表

| 动画 | 场景 | 时长 | 实现 |
|------|------|------|------|
| 窗口弹出 | 翻译窗口打开 | 150ms | Framer Motion scale(0.95→1) + opacity |
| 窗口关闭 | 翻译窗口关闭 | 100ms | Framer Motion scale(1→0.95) + opacity |
| 结果展开 | 翻译结果加载 | 200ms | React Spring height: 0→auto |
| 列表项出现 | 多结果逐个展示 | 50ms stagger | Framer Motion staggerChildren |

## 验收标准

- [ ] 动画 60fps 流畅
- [ ] 可关闭动画（`prefers-reduced-motion` 媒体查询）
- [ ] 不影响翻译响应时间

## 量化验收标准

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 帧率 | 稳定 60fps | Chrome DevTools Performance 面板 / `requestAnimationFrame` 帧计数 |
| 窗口弹出动画时长 | 150ms ± 10ms | Framer Motion `onAnimationComplete` 回调 + `performance.now()` |
| 窗口关闭动画时长 | 100ms ± 10ms | 同上 |
| 翻译结果展开动画 | 200ms ± 15ms | React Spring `onRest` 回调 |
| 列表 stagger 总时长 | 50ms × 条目数 | Framer Motion `staggerChildren` 配置验证 |
| 动画首帧绘制 | < 16ms | Paint timing API |
| 低端设备（Intel HD Graphics）| 动画不丢帧 | 帧率不低于 50fps |
| 动画被跳过（prefers-reduced-motion）| 瞬间完成（0ms 过渡）| 媒体查询 `@media (prefers-reduced-motion: reduce)` |
| GPU 合成开销 | < 5% GPU 使用率增加 | Activity Monitor (macOS) / Task Manager GPU 列 |

## 边界条件与异常处理

| 场景 | 处理方式 | 验收标准 |
|------|----------|----------|
| 快速连续打开/关闭窗口 | 中断当前动画，直接跳至目标状态 | 窗口最终状态正确，无动画残留 |
| 动画进行中切换语言 | 不中断动画，动画完成后再更新语言 | 无视觉闪烁 |
| 结果展开时内容为空 | 跳过展开动画，直接显示空状态 | 无 `height: 0 → 0` 的无效动画 |
| 窗口拖拽时触发动画 | 拖拽期间暂停动画，释放后恢复 | 拖拽流畅不卡顿 |
| 低电量模式（macOS） | 自动禁用非必要动画 | 读取 `navigator.getBattery()` 或系统 API |
| 窗口最小化/恢复 | 恢复时跳过入场动画 | 窗口直接显示，无缩放效果 |
| 动画库加载失败 | 降级为 CSS transition，保证可用 | `try-catch` 包裹动画组件，fallback 到 `<div>` |
| 多窗口同时动画 | 每个窗口独立动画队列，不互斥 | 并行动画帧率不下降 |

## 非功能需求

| 类别 | 要求 | 说明 |
|------|------|------|
| 性能 | 动画使用 `transform` 和 `opacity` 属性 | 避免触发 layout/paint，仅触发 composite |
| 可访问性 | 尊重 `prefers-reduced-motion` 媒体查询 | WCAG 2.1 SC 2.3.3 |
| 可访问性 | 动画期间 `aria-live` 不触发多余播报 | 仅播报最终状态 |
| 可配置性 | 用户可在设置中完全关闭动画 | `settings.appearance.animationsEnabled` |
| 兼容性 | Framer Motion v10+ / React Spring v9+ | 确保与 React 18 兼容 |
| 电量感知 | 低电量/省电模式下自动禁用动画 | 减少 GPU 功耗 |
| 内存 | 动画完成后释放中间状态 | 无内存泄漏，`onAnimationComplete` 清理 |

## 模块交互

```
窗口管理器 (window.rs / window.jsx)
  │  onOpen / onClose 事件
  ▼
AnimationProvider (React Context)
  │  全局动画开关 (prefers-reduced-motion / 用户设置)
  ▼
┌──────────────────────────────────────────────────┐
│ Framer Motion (组件级)                            │
│ • AnimatePresence — 窗口入场/退场                 │
│ • motion.div — scale + opacity 过渡               │
│ • staggerChildren — 列表项逐个出现                 │
├──────────────────────────────────────────────────┤
│ React Spring (窗口级)                             │
│ • useTransition — 窗口弹出/关闭弹性动画            │
│ • useSpring — 翻译结果高度展开                     │
└──────────────────────────────────────────────────┘
  │
  ▼
CSS Transition Fallback (prefers-reduced-motion)
  │  0ms duration，瞬间完成

依赖模块：
• Settings/Appearance — 动画开关状态
• System API — prefers-reduced-motion 查询
• Battery API — 低电量检测 (可选)
```

> **关联 PRD**：[51-prd-翻译历史记录](./51-prd-翻译历史记录.md) — 历史列表展开动画
> **关联 Dev**：无独立 dev，动画逻辑嵌入各 UI 组件