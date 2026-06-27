# YryRiskRow · 风险行组件

> Vue 3 组件 · 自定义元素 `<yry-risk-row>` · 风险条目行 · 6KB CSS

## 文件

```
yry-risk-row/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (6KB CSS)
```

## 事件

`yry-risk-row-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-risk-row/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-risk-row/index.js"></script>
<div id="risk-row-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryRiskRow, { /* props */ }).mount('#risk-row-app');
  }
  if (window.YryRiskRow) mount();
  else document.addEventListener('yry-risk-row-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `risk` | Object | ✅ | — | 风险数据 |
| `expanded` | Boolean | — | false | 展开 |
| `showMitigation` | Boolean | — | true | 显示缓解措施 |

## 风险数据 schema

```json
{
  "id": "risk-001",
  "title": "CDN 不可达",
  "impact": 4,
  "probability": 2,
  "severity": "high",
  "mitigation": "双 CDN 回退",
  "owner": "security"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 展开/收起 | ≤ 200ms | 150ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 行 | `role="listitem"` | Tab | 1.3.1 |
| 展开 | `aria-expanded` | Enter | 4.1.2 |
| 严重度 | `aria-label` | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |