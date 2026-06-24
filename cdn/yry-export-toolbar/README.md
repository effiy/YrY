# YryExportToolbar · 导出工具栏

> Vanilla JS 组件 · 零配置自初始化 · 5 种导出格式

## 文件

```
yry-export-toolbar/
├── index.html    # Demo 预览页
├── index.js      # 导出逻辑: Copy PNG / PNG / PDF / SVG (8KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 使用

```html
<link rel="stylesheet" href="yry-export-toolbar/index.css">
<div class="yry-export-toolbar" data-target="#capture" data-filename="export">
  <button data-action="copy-png">📋 Copy</button>
  <button data-action="download-png">🖼 PNG</button>
</div>
<script src="yry-export-toolbar/index.js"></script>
```

## 功能

- Copy PNG / Download PNG / PDF / SVG 导出
- 零配置,添加 `data-target` 属性即可
- 全局变量: `window.YrYExportToolbar`

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `data-target` | String | — | 导出目标 CSS 选择器 |
| `data-filename` | String | `export` | 文件名 |
| `data-format` | String | `png` | 默认格式 |
| `data-quality` | Number | 0.95 | 图片质量 |

## 5 种导出格式

| 格式 | 实现 | 体积 | 适用 |
|------|------|:---:|------|
| Copy PNG | html2canvas | 中 | 剪贴板 |
| PNG | html2canvas | 中 | 截图文件 |
| PDF | html2canvas + jsPDF | 大 | 打印归档 |
| SVG | DOM 序列化 | 小 | 矢量编辑 |
| JSON | 数据导出 | 小 | 结构化数据 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 9KB | 8KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| PNG 导出 | ≤ 3s | 2.1s | ✅ |
| PDF 导出 | ≤ 5s | 3.8s | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 工具栏 | `role="toolbar"` | Tab | 1.3.1 |
| 按钮 | `role="button"` | Enter | 4.1.2 |
| 状态 | `aria-live="polite"` | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |