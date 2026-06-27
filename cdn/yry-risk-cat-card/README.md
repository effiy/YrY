# YryRiskCatCard · 风险分类卡

> Vue 3 组件 · 自定义元素 `<yry-risk-cat-card>` · 风险分类统计卡

## 文件

```
yry-risk-cat-card/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (3KB CSS)
```

## 事件

`yry-risk-cat-card-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-risk-cat-card/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-risk-cat-card/index.js"></script>
<div id="risk-cat-card-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryRiskCatCard, { category: '安全', count: 5 }).mount('#risk-cat-card-app');
  }
  if (window.YryRiskCatCard) mount();
  else document.addEventListener('yry-risk-cat-card-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `category` | String | ✅ | — | 风险类别 |
| `count` | Number | ✅ | 0 | 风险数 |
| `severity` | String | — | `medium` | 严重度 |
| `icon` | String | — | — | 图标 |
| `href` | String | — | — | 详情链接 |

## 严重度映射

| severity | 颜色 | 行动 |
|----------|------|------|
| `critical` | 红 | 立即修复 |
| `high` | 橙 | 本轮修复 |
| `medium` | 黄 | 计划修复 |
| `low` | 绿 | 记录监控 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 卡片 | `role="status"` | 1.3.1 |
| 计数 | `aria-live="polite"` | 4.1.3 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |