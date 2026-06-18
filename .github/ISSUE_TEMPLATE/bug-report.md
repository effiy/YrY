---
name: 🐛 Bug report
about: 上报 CDN 资源库 bug(组件渲染异常、加载错误、版本不一致等)
title: "[bug] "
labels: bug
assignees: ''
---

## 现象

<!-- 简明描述 bug -->

## 复现步骤

1. 引用 yry-cdn@X.Y.Z
2. 加载 `<yry-name>` 组件
3. ...

## 期望行为

<!-- 应当如何表现 -->

## 实际行为

<!-- 实际如何表现 -->

## 环境

- CDN 版本: `yry-cdn@?` (查 `package.json` 或 `<yry-footer-note version="?">`)
- 浏览器: [例如 Chrome 130]
- 主题: [Cat A Mono / Cat B System]
- 组件: `<yry-?>`

## 最小复现

```html
<!-- 提供最小 HTML 片段 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yry-cdn@?/shared.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yry-cdn@?/theme.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/yry-cdn@?/shared.js"></script>
<script src="https://cdn.jsdelivr.net/npm/yry-cdn@?/yry-?/index.js"></script>

<yry-?></yry-?>
```

## 截图

<!-- 如果适用 -->

## 已知 workaround

<!-- 如有 -->

## 严重程度

- [ ] 🔴 P0 — 影响所有用户/阻塞使用
- [ ] 🟠 P1 — 影响特定场景/可绕过
- [ ] 🟡 P2 — 边缘情况/体验问题