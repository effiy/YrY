---
doc_type: module
prd_task_id: "YV-09-40"
title: "YV-09-40: 水印系统 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "16-prd-水印系统.md"
---

# YV-09-40: 水印系统 — 开发方案

> 需求编号：YV-09-40 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

`v-waterMarker` 指令增强：支持自定义文本/颜色/密度/旋转角度，Canvas 绘制 + `background-image` 注入，防删除（MutationObserver 监听）。

### 指令用法

```vue
<div v-waterMarker="{ text: '张三 · 2026-09-14', color: 'rgba(0,0,0,0.06)', density: 200, rotate: -22 }">
  <!-- 内容 -->
</div>
```

### Canvas 水印生成

```typescript
function createWatermark(options: WatermarkOptions): string {
  const canvas = document.createElement("canvas");
  canvas.width = options.density;
  canvas.height = options.density;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = options.color;
  ctx.rotate((options.rotate * Math.PI) / 180);
  ctx.fillText(options.text, 0, canvas.height / 2);
  return canvas.toDataURL(); // → background-image url
}
```

### 防删除

```typescript
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === "attributes" && m.attributeName === "style") {
      el.style.backgroundImage = cachedWatermark; // 恢复
    }
  }
});
observer.observe(el, { attributes: true, attributeFilter: ["style"] });
```

### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | Canvas 水印生成 | 0.15 |
| 2 | MutationObserver 防删除 | 0.15 |
| 3 | v-waterMarker 指令更新 | 0.2 |

**合计：0.5d**

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 水印正确渲染（Canvas → background-image）
- [ ] DevTools 删除 style 后自动恢复
- [ ] 自定义文本/颜色/密度生效

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------
---

## 源码索引

> 此特性为轻量级功能（0.5d），前端主要为数据展示层。

| 文件 | 说明 | 文件路径 |
|------|------|------|
| — | 参见对应 PRD 涉及文件 | — |

---

## 实现完成记录

> **状态**：已完成（0.5d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 说明 |
|------|------|
| 类型 | 前端数据展示（数据由 YiAi 后端提供服务） |
| 测试 | 见 [测试方案](../../tests/2026-09/16-prd-test-水印系统.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过
