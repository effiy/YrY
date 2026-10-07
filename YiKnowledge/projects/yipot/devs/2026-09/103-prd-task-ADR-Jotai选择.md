---

doc_type: summary
title: "ADR-002 Jotai 状态管理选型 — 实施总结"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prd: "45-prd-ADR-Jotai选择.md"

type: task
---

# ADR-002 Jotai 状态管理选型 — 实施总结

> 来源 ADR：[45-prd-ADR-Jotai选择](../../prds/2026-09/45-prd-ADR-Jotai选择.md)

## 决策回顾

选择 Jotai 原子化状态管理替代 Redux/Zustand，核心理由：原子粒度更新避免不必要重渲染，API 简洁。

## 实施效果

| 指标 | 目标 | 实际 |
|------|------|------|
| 状态更新渲染次数 | 仅受影响组件 | 达标，原子级精准更新 |
| 多窗口状态同步 | 通过 Tauri event 桥接 | 达标，`useSyncAtom` hook 实现 |
| Bundle 大小 | <5KB | ~3.2KB gzip |

## 10 个 Jotai Atom 清单

| Atom | 用途 | 读写组件 |
|------|------|---------|
| `translateResultAtom` | 翻译结果 | TranslateWindow |
| `ocrResultAtom` | OCR 识别结果 | RecognizeWindow |
| `configAtom` | 全局配置（派生） | 所有窗口 |
| `serviceConfigAtom` | 服务实例配置 | ConfigWindow |
| `hotkeyConfigAtom` | 快捷键配置 | HotkeyPage |
| `themeAtom` | 主题模式 | App.jsx |
| `languageAtom` | 当前语言 | App.jsx |
| `historyAtom` | 翻译历史 | TranslateWindow, HistoryPage |
| `clipboardMonitorAtom` | 剪切板监听状态 | TranslateWindow |
| `updateStatusAtom` | 更新状态 | UpdaterWindow |

## 已知限制与缓解

| 限制 | 影响 | 缓解 |
|------|------|------|
| 跨窗口共享 | atom 在不同 WebView 中独立 | `useSyncAtom` 通过 Tauri event 同步 |
| 缺少中间件 | 无 devtools/持久化插件 | `tauri-plugin-store` 独立处理持久化 |

## 交叉引用

- ADR: [45-prd-ADR-Jotai选择](../../prds/2026-09/45-prd-ADR-Jotai选择.md)
- React 组件架构: [10-prd-task-React组件与窗口架构](./10-prd-task-React组件与窗口架构.md)