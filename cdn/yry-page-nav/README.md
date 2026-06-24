# YryPageNav · 页面导航组件

> Vanilla 组件 · 页面内导航 · 5KB JS · 锚点跳转 + 滚动监听

## 文件

```
yry-page-nav/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 页面导航逻辑 (5KB JS)
└── index.css     # 组件样式 (4KB CSS)
```

## 功能

- 页面内导航 (锚点跳转)
- 滚动监听 + 高亮当前项
- 使用 `--yry-accent-rgb` / `--yry-cyan-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-page-nav/index.css">
<script src="../../../../cdn/yry-page-nav/index.js"></script>
<nav class="yry-page-nav">
  <a href="#section-1" class="active">概述</a>
  <a href="#section-2">详情</a>
</nav>
```

## 依赖

无外部依赖