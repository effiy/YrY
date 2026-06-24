# YrySelfimprovePanel · 自改进面板

> Vue 3 组件 · 自定义元素 `<yry-selfimprove-panel>` · 33KB JS · 自改进管理面板

## 文件

```
yry-selfimprove-panel/
├── index.html    # 模板源 + Demo 预览 (18KB HTML)
├── index.js      # Loader + 自改进逻辑 (33KB JS)
└── index.css     # 组件样式 (4KB CSS)
```

## 功能

- 自改进数据采集
- 诊断引擎展示
- 提案生成和效果评估
- 经验技能化管理

## 面板组件矩阵

| 子组件 | 功能 | 数据源 | 刷新 |
|--------|------|------|:---:|
| 采集状态卡 | 五类数据源状态 | `.memory/execution-memory.jsonl` | 每故事 |
| 诊断决策表 | D0-D8 触发状态 | 诊断引擎 | 实时 |
| 提案列表 | 待办/进行中/闭合 | `.memory/proposals.jsonl` | 实时 |
| 效果评估卡 | E1-E4 指标 | 评估引擎 | 闭合时 |
| 经验升级 | 升级触发提示 | proposals 历史统计 | 月级 |
| 记忆注入 | 上下文摘要 | `.memory/summary.md` | 每会话 |

## Props API

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|:---:|--------|------|
| `proposals` | Array | ✓ | `[]` | 提案列表 |
| `diagnoses` | Array | ✓ | `[]` | 诊断决策表 |
| `metrics` | Object | — | `{}` | 效果评估指标 |
| `autoRefresh` | Boolean | — | `true` | 自动刷新 |
| `refreshInterval` | Number | — | `5000` | 刷新间隔 (ms) |

## 依赖

- Vue 3 运行时
- PanelHub 依赖

## 事件

| 事件 | 载荷 | 触发时机 |
|------|------|---------|
| `panel-open` | `{panel: 'selfimprove'}` | 面板打开 |
| `panel-close` | — | 面板关闭 |
| `proposal-click` | `{id}` | 点击提案 |
| `diagnosis-toggle` | `{id, expanded}` | 诊断展开 |
| `refresh` | — | 手动刷新 |

## 性能基线

| 指标 | 预算 | 实测 |
|------|:---:|:---:|
| HTML 体积 | ≤ 20KB | 18KB |
| JS 体积 | ≤ 40KB | 33KB |
| CSS 体积 | ≤ 6KB | 4KB |
| 首屏渲染 | ≤ 200ms | 180ms |
| 数据加载 | ≤ 200ms | 150ms |
| 内存占用 | ≤ 5MB | 3.8MB |

## 场景

5 个场景任务故事, 每场景 8 标准交付物。详见 [scenes/README.md](scenes/README.md)

| # | 场景 | 主题 |
|---|------|------|
| 1 | 数据采集与观察 | 数据采集 · 观察指标 · 趋势追踪 |
| 2 | 诊断引擎 | D0-D8 诊断 · 根因分析 |
| 3 | 提案生成与路由 | 提案生成 · 优先级排序 |
| 4 | 效果评估与闭环 | E1-E4 评估 · 闭环验证 |
| 5 | 经验技能化与记忆注入 | 经验提取 · 技能化 · 记忆注入 |

故事概述: [scenes/故事任务.md](scenes/故事任务.md)