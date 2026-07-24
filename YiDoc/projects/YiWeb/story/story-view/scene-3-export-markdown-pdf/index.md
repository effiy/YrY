# Scene · 故事线导出为 Markdown / PDF

> Story: [story-view](../index.md) · US-S3

## 用户故事

作为用户，故事线能导出为 Markdown / PDF 归档。

## 验收

- 导出菜单提供 Markdown / PDF 两个选项。
- Markdown 保留卡片顺序 + 标注；PDF 走打印样式表。
- 文件名 = `<PR 标题>-<YYYYMMDD>.{md,pdf}`。

## 使用场景 · 组件化

- `<ExportMenu>` 组件 emit `export(format)`，父组件路由到 `useExporter()`。
- `useExporter()` composable 调用 `utils/exportMarkdown.js` 纯函数；PDF 走 `window.print()` + 打印 CSS。
