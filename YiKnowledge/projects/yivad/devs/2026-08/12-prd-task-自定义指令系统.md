---
doc_type: module
prd_task_id: "YV-08-12"
title: "YV-08-12: 自定义指令系统 — 8 个 Vue 3 指令的声明式行为增强 — 开发任务"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 1.0
source_prd: "12-prd-自定义指令系统.md"
---

# YV-08-12: 自定义指令系统 — 8 个 Vue 3 指令的声明式行为增强 — 开发任务

> 来源 PRD：[12-prd-自定义指令系统.md](../prds/2026-08/12-prd-自定义指令系统.md)
> 需求编号：YV-08-12 · 优先级：P1 · 人天：1.0d

## 七、实施步骤

```mermaid
flowchart TD
  S1["步骤 1: 创建指令模块目录<br/>0.1d | 产出: directives/modules/ 目录结构<br/>验证: 目录结构符合设计"]
  S2["步骤 2: 实现权限/复制/水印指令<br/>0.2d | 产出: auth.ts + copy.ts + waterMarker.ts<br/>验证: 三个指令功能正常"]
  S3["步骤 3: 实现拖拽/防抖/节流指令<br/>0.2d | 产出: draggable.ts + debounce.ts + throttle.ts<br/>验证: 边界约束和频率控制正确"]
  S4["步骤 4: 实现长按/粘性指令<br/>0.3d | 产出: longpress.ts + sticky.ts<br/>验证: 跨设备兼容，sticky 状态感知正确"]
  S5["步骤 5: 统一注册 + main.ts 集成<br/>0.2d | 产出: index.ts + app.use(directives)<br/>验证: 全局 v-* 指令可用"]

  S1 --> S2 --> S3 --> S4 --> S5

  style S1 fill:#d4edda,stroke:#28a745
  style S2 fill:#d4edda,stroke:#28a745
  style S3 fill:#d4edda,stroke:#28a745
  style S4 fill:#d4edda,stroke:#28a745
  style S5 fill:#d4edda,stroke:#28a745
```

### 验证检查点

| 步骤 | 验证项 | 通过标准 |
|------|--------|----------|
| 步骤 2 | v-auth 权限控制 | 有权限显示，无权限 DOM 移除 |
| 步骤 2 | v-copy 复制 | 点击复制成功，ElMessage 提示 |
| 步骤 2 | v-waterMarker 水印 | 页面显示 Canvas 水印背景 |
| 步骤 3 | v-draggable 拖拽 | 元素在父容器内自由拖拽，不出边界 |
| 步骤 3 | v-debounce 防抖 | 快速点击 5 次，仅最后一次触发 |
| 步骤 3 | v-throttle 节流 | 快速点击 5 次，仅首次触发，1000ms 后恢复 |
| 步骤 4 | v-longpress 长按 | 按下 1000ms 触发，提前松开不触发 |
| 步骤 4 | v-sticky 粘性 | 滚动时 stuck 状态类正确切换 |

---
