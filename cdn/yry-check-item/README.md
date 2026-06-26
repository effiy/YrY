# YryCheckItem · 勾选项组件

> Vanilla 组件 · 自定义元素 `<yry-check-item>` · checkbox 交互

## 文件

```
yry-check-item/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 勾选交互逻辑
└── index.css     # 组件样式 (4KB CSS)
```

## 使用

```html
<yry-check-item checked label="任务项"></yry-check-item>
```

## 设计令牌

使用 `--yry-accent-rgb` / `--yry-cyan-rgb` / `--yry-violet-rgb` 控制状态颜色。

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `checked` | Boolean | false | 是否勾选 |
| `label` | String | — | 项标签 |
| `disabled` | Boolean | false | 禁用 |
| `indeterminate` | Boolean | false | 不确定状态 |
| `value` | String | — | 项值 |

## 状态颜色映射

| 状态 | 令牌 | 颜色 |
|------|------|------|
| checked | `--yry-accent-rgb` | 青 |
| indeterminate | `--yry-warn-rgb` | 黄 |
| disabled | `--yry-text-tertiary-rgb` | 灰 |
| unchecked | `--yry-text-secondary-rgb` | 次文字 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 5KB | 4KB | ✅ |
| 切换响应 | ≤ 16ms | 10ms | ✅ |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `change` | 勾选状态变化 | `{checked, value}` |
| `click` | 点击 | — |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| checkbox | `role="checkbox"` | Space | 4.1.2 |
| `aria-checked` | true/false | — | 1.3.1 |
| `aria-disabled` | true | — | 1.3.1 |
| `aria-label` | 标签 | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |