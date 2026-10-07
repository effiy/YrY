---
doc_type: prd
title: "YP-09-S24: 翻译窗口交互设计"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S24
estimate_frontend: 1.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, UI, 交互, 翻译窗口]
category: 项目/桌面应用/需求
---

# YP-09-S24: 翻译窗口交互设计

> 需求编号：YP-09-S24 · 优先级：P0 · 人天：1.5d · 状态：已完成

## 背景

翻译窗口是用户最常接触的界面。交互需要简洁高效：选中文本→看到翻译→关闭窗口，整个流程应在 2 秒内完成。

## 需求

### 窗口布局

```
┌──────────────────────────┐
│ [语言选择器] [监听开关] [×] │  ← 工具栏
├──────────────────────────┤
│ 原文区域                  │
│ Hello World              │
├──────────────────────────┤
│ ┌─ 百度翻译 ────────────┐ │
│ │ 你好世界              │ │  ← 多服务结果
│ └──────────────────────┘ │
│ ┌─ Google 翻译 ────────┐ │
│ │ 你好世界              │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ [📋复制] [🔊朗读] [⭐收藏] │  ← 操作栏
└──────────────────────────┘
```

### 交互细节

- 点击窗口外部自动关闭
- Esc 关闭窗口
- 窗口大小可拖拽调整
- 窗口位置记忆

### 组件结构

```
Translate/
├── index.jsx          — 主容器 + 事件监听
├── components/
│   ├── SourceArea/    — 原文展示 + 编辑
│   ├── TargetArea/    — 翻译结果列表
│   └── LanguageArea/  — 语言选择器
```

## 验收标准

- [ ] 选中文本 → 翻译窗口弹出 < 500ms
- [ ] 点击外部关闭窗口
- [ ] 多服务结果独立展示
- [ ] 复制/朗读/收藏按钮可用

## 量化验收标准

| 交互操作 | 目标延迟 | 测量方法 | 备注 |
|----------|----------|----------|------|
| 选中文本 → 窗口弹出 | < 500ms | `performance.now()` 从剪贴板事件到窗口显示 | 含窗口创建 + 首次渲染 |
| 窗口弹出 → 首条翻译展示 | < 1000ms | 从窗口显示到第一行翻译文本出现 | 含网络请求 |
| 点击外部 → 窗口关闭 | < 100ms | 从 mousedown 到窗口隐藏 | 无动画阻塞关闭 |
| Esc → 窗口关闭 | < 50ms | 从 keydown 到窗口隐藏 | 同步处理 |
| 复制按钮 | < 100ms | 点击到剪贴板写入完成 | `navigator.clipboard.writeText()` |
| 窗口拖拽调整大小 | 60fps | 拖拽过程中不掉帧 | CSS resize + debounce 位置记忆 |
| 语言切换响应 | < 200ms | 切换语言到重新发起翻译 | 触发新的并行调度 |

## 边界条件与异常处理

| 场景 | 输入 | 预期行为 | 恢复策略 |
|------|------|----------|----------|
| 选中文本为空 | 空白/仅空格 | 不弹出窗口 | 静默忽略 |
| 选中文本超长 | > 5000 字符 | 截断到 5000 字符 + "..." | 原文区域可滚动查看 |
| 选中非文本区域 | 图片/Canvas | 不弹出窗口 | 静默忽略 |
| 无可用翻译服务 | 所有服务禁用/未配置 | 弹出窗口显示 "请启用翻译服务" | 链接到设置页面 |
| 全部服务返回错误 | 网络断开 | 窗口保留，显示错误信息 | 提供 "重试" 按钮 |
| 窗口位置超出屏幕 | 窗口贴近屏幕边缘弹出 | 自动调整位置到可见区域 | 检测 `window.screen.availWidth/Height` |
| 朗读服务不支持当前语言 | TTS 无此语言 | 朗读按钮灰显，tooltip "不支持该语言" | — |
| 快速连续选文 | 500ms 内 2 次选中 | 取消前一次请求，显示最新结果 | AbortController 取消旧请求 |
| 原文编辑后重新翻译 | 用户修改原文 | 防抖 300ms 后重新发起翻译 | 避免每次按键都触发请求 |

## 非功能需求

### 性能
- 窗口创建使用 Tauri `WebviewWindowBuilder` 预创建模式，首次创建后复用
- 翻译结果使用虚拟滚动（超过 3 个服务结果时）
- 原文区域使用 `contentEditable` 直接编辑，无 vDOM diff 开销

### 可用性
- 窗口支持键盘全操作：Tab 切换焦点、Enter 触发当前焦点按钮
- 所有按钮有明确 tooltip（含快捷键提示）
- 颜色对比度满足 WCAG AA 标准

### 内存
- 窗口关闭后释放翻译结果 DOM 节点
- 位置记忆使用单条 localStorage key（非频繁读写）

## 模块交互

```
Translate/index.jsx (主容器)
     │
     ├── 事件监听
     │   ├── "clipboard-changed" (Rust → emit → JS 监听)
     │   ├── Esc keydown → 关闭
     │   └── 窗口外 click → 关闭
     │
     ├── SourceArea (原文区域)
     │   ├── props: text, language
     │   ├── emit: text-change → 触发重新翻译
     │   └── 依赖: clipboard.rs (选文来源)
     │
     ├── TargetArea (翻译结果列表)
     │   ├── props: results[] (来自 parallelDispatch)
     │   ├── 依赖: parallelDispatch (并行调度)
     │   ├── 依赖: 各翻译服务插件 (services/translate/**)
     │   └── 子组件: ResultCard × N
     │
     ├── LanguageArea (语言选择器)
     │   ├── props: fromLang, toLang
     │   ├── emit: language-change → 触发重新翻译
     │   └── 依赖: lang_detect.rs (自动检测源语言)
     │
     └── 操作栏
         ├── 复制 → clipboard.rs (copy_img / writeText)
         ├── 朗读 → services/tts/** (TTS 服务)
         └── 收藏 → Collection store (Jotai atom)
```

**上游依赖**：
- `clipboard.rs`：获取选中文本
- `parallelDispatch`：并发调用翻译服务
- `lang_detect.rs`：自动检测源语言
- `tray.rs`：托盘菜单触发输入翻译

**下游消费者**：
- `Collection`：收藏的翻译记录
- `History`：翻译历史记录

**跨窗口交互**：
- 翻译窗口 → OCR 窗口：OCR 结果点击"翻译"后打开翻译窗口（Tauri event `translate-from-ocr`）
- 托盘菜单 "输入翻译" → 打开空白翻译窗口（手动输入）

## 参考

- [34-prd-并行调度策略](./34-prd-并行调度策略.md) — 多服务并行翻译调度
- [36-prd-OCR窗口交互](./36-prd-OCR窗口交互.md) — OCR 窗口（"翻译识别结果"联动）
- [40-prd-Rust剪贴板模块](./40-prd-Rust剪贴板模块.md) — 剪贴板监听
- [47-prd-ADR-多窗口架构](./47-prd-ADR-多窗口架构.md) — 翻译窗口独立存在的原因