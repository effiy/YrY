---
doc_type: test
title: "拖拽排序系统 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-37"
source_prds: ["14-prd-拖拽排序系统"]
source_modules: []
---
# 拖拽排序系统 — 测试规格

> 来源 PRD：[14-prd-拖拽排序系统.md](../../prds/2026-09/14-prd-拖拽排序系统.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### Composable 测试：useSortable

#### Scenario: 拖拽元素到新位置
- **GIVEN** 列表 `items = [{id:"A"}, {id:"B"}, {id:"C"}]`
- **WHEN** 拖拽 "A" 到 "C" 之后
- **THEN** `items` 变为 `[{id:"B"}, {id:"C"}, {id:"A"}]`

#### Scenario: 拖拽手柄触发拖拽
- **GIVEN** `handle = ".drag-handle"`
- **WHEN** 点击非手柄区域并拖拽
- **THEN** 拖拽不触发，元素不移动

#### Scenario: FLIP 动画执行
- **GIVEN** 记录元素初始位置，然后修改列表顺序
- **WHEN** 调用 `animateFLIP` 并传入旧位置 Map
- **THEN** 元素应用 `transform: translate(dx, dy)` 然后过渡到 `transform: translate(0, 0)`

### 键盘排序测试：useKeyboardSortable

#### Scenario: Space 选取元素
- **GIVEN** 焦点在列表第一项
- **WHEN** 按下 Space 键
- **THEN** `isPickingUp` 为 `true`，`activeIndex` 为 `0`，元素 `aria-grabbed` 为 `"true"`

#### Scenario: 方向键移动元素
- **GIVEN** 已选取第一项（`activeIndex = 0`）
- **WHEN** 按下 ArrowDown 键
- **THEN** 元素移动到第二项位置，`activeIndex` 变为 `1`

#### Scenario: Escape 取消拖拽
- **GIVEN** 已选取第一项
- **WHEN** 按下 Escape 键
- **THEN** `isPickingUp` 变为 `false`，`activeIndex` 为 `null`，元素 `aria-grabbed` 为 `"false"`

---


## 补充：单元测试用例

### UT-DD01: useDragSort

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 拖拽排序 | 拖拽 item[0] → 位置 3 | items 重排为 [1,2,0,3,...] |
| 2 | 跨容器拖拽 | 从容器 A 拖到容器 B | item 从 A 移除，添加到 B |
| 3 | 拖拽动画 | 拖拽过程中 | FLIP 动画平滑过渡 |
| 4 | 拖拽取消 | 拖拽到无效区域 | item 回弹到原位 |
| 5 | 回调触发 | 拖拽完成 | onChange(newOrder) 调用 |

