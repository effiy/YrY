# YryReportLink · 评分报告链接 chip

> Vue 3 组件 · 自定义元素 `<yry-report-link>` · `<a class="sr-link">` 单条链接

## 文件

```
yry-report-link/
├── index.html    # 模板源 (<script type="text/x-template">) + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 空 (样式由 docs/index.html 页面级 CSS 提供)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `href` | String | ✅ | — | 链接 URL |
| `title` | String | | `''` | 链接 `title` 属性 (悬停提示) |
| `emoji` | String | | `''` | 链接前的 emoji 图标 (自动加空格) |
| `text` | String | ✅ | — | 链接文字 |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-report-link-ready` | 模板 fetch + 注册完成 | `{ component: 'YryReportLink' }` |

## 使用

```html
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/shared/vue-ce-loader.js"></script>
<script src="../../../../cdn/yry-report-link/index.js"></script>

<!-- Custom element 形式 -->
<yry-report-link href="健康报告/health-2026-06-22.html"
                 emoji="🩺" text="今日健康"
                 title="2026-06-22 项目综合健康报告"></yry-report-link>

<!-- Vue.createApp 形式 -->
<div id="link"></div>
<script>
  Vue.createApp(window.YryReportLink, {
    href: '...', emoji: '🩺', text: '今日健康', title: '...'
  }).mount('#link');
</script>
```

## DOM 结构

```html
<a class="sr-link" href="..." title="...">🩺&nbsp;今日健康</a>
```

## 依赖

- Vue 3 运行时
- `shared/vue-ce-loader.js`
- 页面级 `.sr-link` 样式 (来自 docs/index.html 的页面级 `<style>` 段)

## 设计说明

本组件的样式不内嵌,因为 `.sr-link` 是页面级共享样式,影响 150+ 处链接。
如需独立使用,可将 `.sr-link` 样式复制到 `index.css` 中。