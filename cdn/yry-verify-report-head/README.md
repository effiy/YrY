# YryVerifyReportHead · 验证报告页头

> Vue 3 组件 · 自定义元素 `<yry-verify-report-head>` · 验证报告头部

## 文件

```
yry-verify-report-head/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-verify-report-head-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-verify-report-head/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-verify-report-head/index.js"></script>
<div id="verify-report-head-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryVerifyReportHead, { title: '验证报告', date: '2026-06-22' }).mount('#verify-report-head-app');
  }
  if (window.YryVerifyReportHead) mount();
  else document.addEventListener('yry-verify-report-head-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `title` | String | ✅ | — | 报告标题 |
| `date` | String | — | — | 日期 |
| `version` | String | — | — | 版本 |
| `score` | Number | — | — | 评分 |
| `grade` | String | — | — | 等级 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 头部 | `role="banner"` | 1.3.1 |
| 标题 | `aria-level="1"` | 1.3.1 |
| 评分 | `aria-live="polite"` | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |