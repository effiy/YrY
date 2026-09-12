---
doc_type: test
title: "水印系统 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-40"
source_prds: ["16-prd-水印系统"]
source_modules: []
---
# 水印系统 — 测试规格

> 来源 PRD：[16-prd-水印系统.md](../../prds/2026-09/16-prd-水印系统.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 单元测试：useWatermark

#### Scenario: 水印启用时生成 SVG Data URI
- **GIVEN** watermarkStore 中 `enabled = true`，`username = "test@example.com"`
- **WHEN** 调用 `useWatermark()`
- **THEN** `watermarkDataURI.value` 不为空，包含 `data:image/svg+xml;base64,`

#### Scenario: 水印禁用时不生成 Data URI
- **GIVEN** watermarkStore 中 `enabled = false`
- **WHEN** 调用 `useWatermark()`
- **THEN** `watermarkDataURI.value` 为空字符串

#### Scenario: 管理员全局强制覆盖用户设置
- **GIVEN** `userEnabled = false`，`globalForced = true`
- **WHEN** 计算 `enabled`
- **THEN** `enabled = true`（全局强制优先）

### 组件测试：WatermarkOverlay

#### Scenario: 水印启用时渲染覆盖层
- **GIVEN** `isEnabled = true`
- **WHEN** 挂载 `WatermarkOverlay` 组件
- **THEN** DOM 中存在 `.watermark-overlay` 元素，`aria-hidden="true"`

#### Scenario: 水印禁用时不渲染
- **GIVEN** `isEnabled = false`
- **WHEN** 挂载 `WatermarkOverlay` 组件
- **THEN** DOM 中不存在 `.watermark-overlay` 元素

#### Scenario: 防篡改检测
- **GIVEN** 水印覆盖层已挂载
- **WHEN** 通过 DevTools 删除水印 DOM 元素
- **THEN** MutationObserver 检测到删除，自动重新添加水印

---


## 补充：单元测试用例

### UT-WM01: useWatermark

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 水印渲染 | content='张三', width=200, height=150 | canvas 水印正确绘制 |
| 2 | 防篡改 | MutationObserver 检测 DOM 移除 | 自动重建水印 |
| 3 | 样式修改 | 尝试修改 opacity | 水印属性恢复 |
| 4 | 销毁 | 调用 destroy() | 水印和 observer 清理 |
| 5 | 配置更新 | 更新水印文字 | canvas 重新绘制 |

