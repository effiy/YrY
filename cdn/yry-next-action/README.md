# YryNextAction · 下一步行动组件

> Vanilla 组件 · 自定义元素 `<yry-next-action>` · 行动项展示

## 文件

```
yry-next-action/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 行动项交互逻辑
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- 下一步行动项展示
- 优先级和状态指示
- 使用 `--yry-accent-rgb` / `--yry-cyan-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-next-action/index.css">
<script src="../../../../cdn/yry-next-action/index.js"></script>
<yry-next-action></yry-next-action>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `action` | Object | — | 行动数据 |
| `priority` | String | `p1` | 优先级 |
| `status` | String | `pending` | 状态 |
| `showCta` | Boolean | true | 显示行动按钮 |

## 行动数据 schema

```json
{
  "title": "修复 Gate A 阻断",
  "cmd": "/rui-code gate-a-fix",
  "owner": "coder",
  "eta": "4h"
}
```

## 优先级映射

| priority | 颜色 | 行动 |
|----------|------|------|
| `p0` | 红 | 立即 |
| `p1` | 黄 | 本轮 |
| `p2` | 蓝 | 计划 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 行动 | `role="status"` | 1.3.1 |
| 优先级 | `aria-label` | 1.3.1 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |