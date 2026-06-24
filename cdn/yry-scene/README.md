# YryScene · 场景文档共享样式

> 场景文档共享样式: 86KB CSS · 35 场景页统一引用 · 排版 · 代码块 · 表格 · 徽章

## 文件

```
yry-scene/
├── index.html         # 场景样式预览页
├── index.css          # 场景共享样式 (86KB CSS, 第二大样式文件)
└── index-base.css     # 场景基础样式
```

## 状态

⚠️ **待完善** — 缺少独立 JS 交互层,当前依赖 `shared/index.js`

## 功能

- 场景文档的排版和布局
- 代码块样式 (语法高亮)
- 表格样式
- 徽章/标签
- 35 个场景页统一引用

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene/index.css">
```

## 补充计划

- [ ] 添加 `index.js` 实现场景交互 (页面导航 · 代码复制 · 图片放大)
- [ ] 拆分 86KB CSS 为场景专属模块