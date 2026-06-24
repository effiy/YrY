# YryNotifyPanel · 通知面板组件

> Vue 3 组件 · 自定义元素 `<yry-notify-panel>` · 29KB JS · 企微通知管理面板

## 文件

```
yry-notify-panel/
├── index.html    # 模板源 + Demo 预览 (20KB HTML)
├── index.js      # Loader + 通知面板逻辑 (29KB JS)
└── index.css     # 组件样式 (18KB CSS)
```

## 功能

- 企微通知管理
- 通知模板编辑
- 发送状态追踪
- 失败队列重试

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `notifications` | Array | — | `[]` | 通知列表 |
| `template` | String | — | `verbose` | 模板: rich/verbose |
| `autoRefresh` | Boolean | — | `true` | 自动刷新 |
| `refreshInterval` | Number | — | `300000` | 刷新间隔 (ms) |
| `maxItems` | Number | — | `50` | 最大显示数 |

## 通知数据 schema

```json
{
  "id": "N-2026-001",
  "timestamp": "2026-06-22T10:00:00Z",
  "channel": "wecom",
  "template": "verbose",
  "status": "sent",
  "message": "健康检查通过 · 评分 92/A",
  "retryCount": 0,
  "error": null
}
```

## 通知状态机

| 状态 | 图标 | 颜色 | 含义 |
|------|:---:|------|------|
| `sent` | ✅ | 绿 | 已送达 |
| `failed` | ❌ | 红 | 发送失败 |
| `retrying` | 🔄 | 黄 | 重试中 |
| `pending` | ⏳ | 蓝 | 待发送 |
| `dry-run` | 👁️ | 灰 | 预览模式 |

## 模板类型

| 模板 | 格式 | 内容 | 适用 |
|------|------|------|------|
| `rich` | 卡片 | 含评分+趋势+维度 | 详细报告 |
| `verbose` | 文本 | 含完整数据 | 日常通知 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 22KB | 20KB | ✅ |
| JS 体积 | ≤ 32KB | 29KB | ✅ |
| CSS 体积 | ≤ 20KB | 18KB | ✅ |
| 面板打开 | ≤ 150ms | 120ms | ✅ |
| 50 条渲染 | ≤ 200ms | 180ms | ✅ |

## 失败队列重试策略

| 重试次数 | 延迟 | 总耗时 | 行为 |
|:---:|:---:|:---:|------|
| 1 | 1s | 1s | 立即重试 |
| 2 | 2s | 3s | 指数退避 |
| 3 | 4s | 7s | 最后一次 |
| >3 | — | — | 入死信队列 |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 面板 | `role="dialog"` | Esc 关闭 | 1.3.1 |
| 通知列表 | `role="log"` | Tab | 1.3.1 |
| 状态 | `aria-live="polite"` | — | 4.1.3 |
| 重试按钮 | `aria-label` | Enter | 4.1.2 |

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