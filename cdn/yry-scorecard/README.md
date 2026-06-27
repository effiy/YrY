# YryScorecard · 记分卡组件

> Vue 3 组件 · 自定义元素 `<yry-scorecard>` · 评分/分数展示

## 文件

```
yry-scorecard/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-scorecard-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-scorecard/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-scorecard/index.js"></script>
<div id="scorecard-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryScorecard, { score: 92, label: '架构合规' }).mount('#scorecard-app');
  }
  if (window.YryScorecard) mount();
  else document.addEventListener('yry-scorecard-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `score` | Number | ✅ | 0 | 评分 (0-100) |
| `label` | String | ✅ | — | 标签 |
| `grade` | String | — | auto | 等级: A/B/C/D/F/auto |
| `showGrade` | Boolean | — | true | 显示等级 |
| `animated` | Boolean | — | true | 动画 |

## 等级映射

| 分数范围 | 等级 | 颜色 |
|:---:|:---:|------|
| ≥ 90 | A | 绿 |
| 80-89 | B | 蓝 |
| 70-79 | C | 黄 |
| 60-69 | D | 橙 |
| < 60 | F | 红 |

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
| 记分卡 | `role="meter"` | 1.3.1 |
| 评分 | `aria-valuenow` | 1.3.1 |
| 等级 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |