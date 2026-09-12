---
doc_type: module
prd_task_id: "YV-09-138"
title: "YV-09-138: 自定义主题编辑器 — 可视化主题编辑器、主色/辅色/强调色、圆角/字号/间距Token、实时预览示例组件、导出导入主题JSON、浅色/深色变体 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "68-prd-自定义主题编辑器.md"
---

# YV-09-138: 自定义主题编辑器 — 可视化主题编辑器、主色/辅色/强调色、圆角/字号/间距Token、实时预览示例组件、导出导入主题JSON、浅色/深色变体 — 开发任务

> 来源 PRD：[68-prd-自定义主题编辑器.md](../prds/2026-09/68-prd-自定义主题编辑器.md)
> 需求编号：YV-09-138 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 定义 ThemeConfig 类型 + 颜色工具函数 | `src/types/theme.ts` + `src/utils/color.ts` | 类型编译通过，hex↔HSL转换测试通过 | 0.03 |
| 2 | 实现 ThemeEngine composable | `src/composables/theme/useThemeEngine.ts` | 设置CSS变量后页面实时变化，导出/导入JSON正常 | 0.05 |
| 3 | 实现颜色编辑面板 (ColorTokenEditor + ColorPickerGroup) | `src/components/theme/ColorTokenEditor.vue` + `ColorPickerGroup.vue` | 修改主色→自动派生hover/active/disabled/light色→预览实时更新 | 0.05 |
| 4 | 实现 Token 编辑面板 (TokenSliderGroup) | `src/components/theme/TokenSliderGroup.vue` | 拖动圆角/字号/间距滑块→预览实时更新 | 0.04 |
| 5 | 实现 ComponentPreview 示例组件 | `src/components/theme/ComponentPreview.vue` | 所有示例组件渲染正确，主题变更后实时反映 | 0.05 |
| 6 | 实现主题编辑器主页面 + 深色模式编辑 | `src/views/system/theme-editor.vue` | 三个Tab均可用，深色模式覆盖/自动推导正确 | 0.05 |
| 7 | 实现导入/导出、预设主题、路由注册 | 多个文件 | 导出JSON→导入JSON→主题一致；预设主题可切换；路由可访问 | 0.03 |

**总人天：0.3d**

---
