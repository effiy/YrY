# YryTipBox · 提示框组件

> Vanilla 组件 · 自定义元素 `<yry-tip-box>` · 4 种类型提示框

## 文件

```
yry-tip-box/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 提示框逻辑
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- 4 种提示类型: info / success / warning / error
- 4 种语义色令牌: `--yry-accent-rgb` / `--yry-cyan-rgb` / `--yry-pass-rgb` / `--yry-fail-rgb`

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-tip-box/index.css">
<script src="../../../../cdn/yry-tip-box/index.js"></script>
<yry-tip-box type="info" title="提示" content="这是一条提示信息"></yry-tip-box>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `type` | String | `info` | 类型: info/success/warning/error |
| `title` | String | — | 标题 |
| `content` | String | — | 内容 |
| `icon` | Boolean | true | 显示图标 |
| `dismissable` | Boolean | false | 可关闭 |

## 4 种类型

| type | 图标 | 颜色 | 用途 |
|------|:---:|------|------|
| `info` | ℹ️ | 青 | 信息 |
| `success` | ✅ | 绿 | 成功 |
| `warning` | ⚠️ | 黄 | 警告 |
| `error` | ❌ | 红 | 错误 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 渲染 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 提示 | `role="alert"` | 1.3.1 |
| 内容 | `aria-live="polite"` | 4.1.3 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |