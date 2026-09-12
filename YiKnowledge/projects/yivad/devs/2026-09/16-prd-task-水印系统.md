---
doc_type: module
prd_task_id: "YV-09-40"
title: "水印系统 — 开发任务"
status: 已实现
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "16-prd-水印系统.md"
---

# 水印系统 — 开发任务

> 来源 PRD：[16-prd-水印系统.md](../prds/2026-09/16-prd-水印系统.md)
> 需求编号：YV-09-40 · 优先级：P2 · 人天：0.5d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 实现 watermarkStore 状态管理 | `src/stores/watermark.ts` | 单元测试：store 状态切换 | 0.05 |
| 2 | 实现 useWatermark Composable | `src/composables/useWatermark.ts` | 单元测试：SVG 生成 | 0.10 |
| 3 | 实现 WatermarkOverlay 组件 | `src/components/common/WatermarkOverlay.vue` | 组件测试：覆盖层渲染 | 0.05 |
| 4 | 实现 v-watermark 指令 | `src/directives/v-watermark.ts` | 组件测试：指令绑定 | 0.05 |
| 5 | 编写 watermark.css 和 print.css | `src/styles/watermark.css`, `src/styles/print.css` | 手动测试：打印预览 | 0.05 |
| 6 | 在 App.vue 中集成 WatermarkOverlay | `src/App.vue` | 手动测试：全局水印显示 | 0.05 |
| 7 | 实现 WatermarkSettings 设置页 | `src/views/settings/WatermarkSettings.vue` | 手动测试：水印配置页面 | 0.10 |
| 8 | 集成防篡改检测 | `src/composables/useWatermark.ts` MutationObserver | 手动测试：DevTools 中删除水印 DOM | 0.05 |

**总计：** 0.5d

---
