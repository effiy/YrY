---
doc_type: prd
title: "YP-09-S29: 翻译历史记录管理"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S29
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 历史记录, 翻译]
category: 项目/桌面应用/需求
---

# YP-09-S29: 翻译历史记录管理

> 需求编号：YP-09-S29 · 优先级：P2 · 人天：0.5d · 状态：已完成

## 背景

用户翻译过的文本需要可回溯查看。历史记录帮助用户找回之前的翻译结果。

## 需求

- 翻译窗口内保留最近 20 条翻译历史
- 设置页 History 页面可查看完整历史
- 支持清除单条或全部历史
- 历史记录仅保留在内存，不持久化到磁盘（隐私设计）

## 验收标准

- [ ] 最近 20 条在翻译窗口可回溯
- [ ] History 页面支持搜索和清除
- [ ] 关闭应用后历史自动清除

## 量化验收标准

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 历史容量上限 | 20 条（翻译窗口）/ 全部在内存 | 单元测试断言 `MAX_HISTORY = 20` |
| 历史搜索响应 | < 100ms（1000 条记录） | `performance.now()` 打点 |
| 单条清除操作 | < 50ms | DOM 更新后 `requestAnimationFrame` 回调 |
| 批量清除操作 | < 200ms（20 条全选删除） | 同上 |
| 内存占用 | 每条记录 < 2KB | Chrome DevTools Memory 面板 |
| 翻译窗口历史回溯 | 滚动到第 20 条 < 300ms | React Profiler 测量 |

## 边界条件与异常处理

| 场景 | 处理方式 | 验收标准 |
|------|----------|----------|
| 历史超过 20 条上限 | LRU 策略淘汰最旧记录 | 第 21 条插入后第 1 条被移除 |
| 搜索无匹配 | 显示空状态提示"无匹配记录" | 不显示空白列表 |
| 特殊字符搜索（正则元字符） | 转义后纯文本匹配 | `(test)` 被正确搜索而非解析为正则 |
| 空文本翻译（用户未输入即触发） | 不记录空翻译 | 历史列表无空条目 |
| 极长翻译文本（> 10000 字符） | 显示时截断至 200 字符 + "..." | hover 显示完整 tooltip |
| 并发翻译请求 | 后完成的结果排在前面 | 时间戳精确到毫秒 |
| 内存压力（系统低内存） | 不崩溃，必要时清除历史 | 监听 `memory pressure` 信号（macOS） |
| 快速连续清除操作 | 防止竞态，按钮 loading 态 | 清除中按钮禁用 |

## 非功能需求

| 类别 | 要求 | 说明 |
|------|------|------|
| 隐私 | 历史不写入磁盘、不记录到日志 | 内存数据，进程退出即清除 |
| 性能 | 列表虚拟滚动（超过 50 条时启用） | 使用 `react-window` 或自实现 |
| 可访问性 | 搜索框支持 `aria-label="搜索翻译历史"` | WCAG 2.1 AA 级 |
| 国际化 | 空状态、提示文本支持 i18n | `locale.history.*` 命名空间 |
| 可测试性 | 暴露 `historyStore` 供测试直接操作 | `window.__POT_HISTORY__` (仅 dev) |

## 模块交互

```
翻译窗口 (TranslatePanel)
  │  onTranslateComplete(result)
  ▼
HistoryStore (内存)
  │  push({ source, target, fromLang, toLang, service, timestamp })
  │  LRU eviction (max 20 in overlay)
  ▼
HistoryOverlay (翻译窗口内嵌)
  │  显示最近 20 条，支持点击回填
  │
Settings/History 页面
  │  显示完整内存历史，支持搜索/清除
  │
┌─────────────────────────────────────┐
│ 依赖模块                             │
│ • TranslatePanel → 写入历史          │
│ • HistoryStore → 纯内存管理          │
│ • i18n → 文本国际化                  │
│ • SearchBar → 复用搜索组件           │
└─────────────────────────────────────┘
```

> **关联 PRD**：[52-prd-窗口动画过渡](./52-prd-窗口动画过渡.md) — 历史列表展开/折叠动画
> **关联 Dev**：无独立 dev，内嵌于翻译窗口和设置页面模块