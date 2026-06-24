# YryWalkthrough · 引导漫游组件

> Vue 3 组件 · 自定义元素 `<yry-walkthrough>` · 4KB JS · 新用户引导

## 文件

```
yry-walkthrough/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 新用户引导漫游
- 步骤式提示和聚焦
- 4 种语义色令牌 (accent / cyan / fail / warn)

## 依赖

- Vue 3 运行时
- 全局变量: `window.YryWalkthrough`

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `steps` | Array | ✅ | `[]` | 漫游步骤 |
| `autoStart` | Boolean | — | false | 自动开始 |
| `showProgress` | Boolean | — | true | 显示进度 |
| `allowSkip` | Boolean | — | true | 允许跳过 |

## 步骤数据 schema

```json
{
  "target": "#element-id",
  "title": "步骤 1",
  "content": "这是...",
  "position": "bottom"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 5KB | 4KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 步骤切换 | ≤ 200ms | 150ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 漫游 | `role="dialog"` | Esc 退出 | 1.3.1 |
| 步骤 | `aria-live="polite"` | 方向键 | 4.1.3 |
| 聚焦 | `aria-describedby` | Tab | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |