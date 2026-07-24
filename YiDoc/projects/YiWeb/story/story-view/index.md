# Story · 故事线视图（story-view）

> 模块：[YiWeb Story](../index.md) · `src/views/story-view/`

## 场景

- [US-S1 · PR 转化为故事线](scene-1-pr-to-storyline/index.md)
- [US-S2 · 标注审查要点](scene-2-annotate-review-points/index.md)
- [US-S3 · 导出 Markdown / PDF](scene-3-export-markdown-pdf/index.md)
- [US-S4 · 按标签 / 作者 / 时间过滤](scene-4-filter-by-tag-author-time/index.md)

## 使用场景 · 模块化

- `views/story-view/` 基于 `createBaseView` 入口，故事线数据由 API 端生成后前端渲染。
- 导出流程：数据订阅 → 布局计算 → 渲染模板 → 导出 PDF（jsPDF）或 Markdown。
