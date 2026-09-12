---
doc_type: module
prd_task_id: "YV-09-112"
title: "YV-09-112: 协作白板 — 团队头脑风暴画布、画笔/形状/文本/便签工具、实时多人协作、导出图片/PDF、模板背景、演示模式 — 开发任务"
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
source_prd: "52-prd-协作白板.md"
---

# YV-09-112: 协作白板 — 团队头脑风暴画布、画笔/形状/文本/便签工具、实时多人协作、导出图片/PDF、模板背景、演示模式 — 开发任务

> 来源 PRD：[52-prd-协作白板.md](../prds/2026-09/52-prd-协作白板.md)
> 需求编号：YV-09-112 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 定义类型和工具注册表 | `types.ts` + `toolRegistry.ts` | TypeScript 通过 | 0.02 |
| 2 | 实现 Canvas 渲染组件（SVG 模式） | `Canvas.vue` + `ElementRenderer.vue` | 矩形/椭圆/文本渲染 | 0.04 |
| 3 | 实现工具交互 composable | `useCanvasTools.ts` | 选择/移动/创建元素 | 0.04 |
| 4 | 实现工具栏 UI | `Toolbar.vue` | 工具切换 + 快捷键 | 0.02 |
| 5 | 添加 Yjs 协作层 | `useWhiteboardCollaboration.ts` | 多人画面同步 | 0.04 |
| 6 | 实现 Yjs WebSocket 服务 | `ws_server.py` | WebSocket 连接+传播 | 0.03 |
| 7 | 实现白板 CRUD 服务 | `whiteboard_service.py` | 创建/读取/更新/删除 | 0.02 |
| 8 | 实现导出功能 | `ExportDialog.vue` + 后端导出 | PNG/SVG/PDF 导出 | 0.03 |
| 9 | 实现演示模式 | `PresentationMode.vue` | 全屏+帧播放 | 0.03 |
| 10 | 实现模板选择器 | `TemplatePicker.vue` + 10 内置模板 | 模板预览+加载 | 0.02 |

**总人天：0.3d**

---
