# YryCronPanel · 定时任务面板

> Vue 3 组件 · 自定义元素 `<yry-cron-panel>` · Cron 任务管理面板

## 文件

```
yry-cron-panel/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader + 面板逻辑 (13KB JS)
└── index.css     # 组件样式 (7KB CSS)
```

## 功能

- Cron 表达式编辑和预览
- 定时任务列表管理
- 运行状态监控

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `tasks` | Array | — | `[]` | 任务列表 |
| `showAdd` | Boolean | — | `true` | 显示新增按钮 |
| `autoRefresh` | Boolean | — | `false` | 自动刷新 |
| `refreshInterval` | Number | — | `30000` | 刷新间隔 (ms) |

## 任务数据 schema

```json
{
  "id": "task-001",
  "name": "健康检查",
  "cron": "0 9 * * *",
  "command": "node skills/rui-bot/send.mjs health",
  "enabled": true,
  "lastRun": "2026-06-22T09:00:00Z",
  "nextRun": "2026-06-23T09:00:00Z",
  "status": "pass"
}
```

## Cron 表达式解析

| 字段 | 位置 | 示例 | 说明 |
|------|:---:|------|------|
| 分钟 | 1 | `0` | 0-59 |
| 小时 | 2 | `9` | 0-23 |
| 日 | 3 | `*` | 1-31 |
| 月 | 4 | `*` | 1-12 |
| 周 | 5 | `*` | 0-6 (Sun-Sat) |

## 任务状态机

| 状态 | 图标 | 颜色 | 含义 |
|------|:---:|------|------|
| `pass` | ✅ | 绿 | 上次成功 |
| `fail` | ❌ | 红 | 上次失败 |
| `running` | ⏳ | 黄 | 运行中 |
| `disabled` | ⏸️ | 灰 | 已禁用 |
| `pending` | 📋 | 蓝 | 待首次运行 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 8KB | 6KB | ✅ |
| JS 体积 | ≤ 15KB | 13KB | ✅ |
| CSS 体积 | ≤ 8KB | 7KB | ✅ |
| 面板打开 | ≤ 200ms | 150ms | ✅ |
| 任务列表渲染 | ≤ 100ms | 80ms | ✅ |

## 数据源

| 数据 | 来源 | 格式 | 刷新 |
|------|------|------|:---:|
| 任务列表 | `.claude/scheduled_tasks.json` | JSON | 手动 |
| 运行历史 | `.memory/cron-history.jsonl` | JSONL | 每次运行 |
| 下次运行 | cron 解析 | Date | 实时 |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 面板 | `role="dialog"` | Esc 关闭 | 1.3.1 |
| 任务列表 | `role="list"` | Tab | 1.3.1 |
| 任务项 | `role="listitem"` | Enter 编辑 | 1.3.1 |
| 状态 | `aria-live="polite"` | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 依赖

- Vue 3 运行时
- PanelHub 依赖