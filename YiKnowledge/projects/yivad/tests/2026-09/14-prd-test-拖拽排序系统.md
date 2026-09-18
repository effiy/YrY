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

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---


---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |

### 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | useDraggable Composable | UT + CT + IT | ✅ 已完成 |
| FR-2 | useDroppable Composable | UT + CT + IT | ✅ 已完成 |
| FR-3 | useSortable Composable | UT + CT + IT | ✅ 已完成 |
| FR-4 | 键盘排序 Composable | UT + CT + IT | ✅ 已完成 |
| FR-5 | FLIP 动画引擎 | UT + CT + IT | ✅ 已完成 |
| FR-6 | 排序持久化服务 | UT + CT + IT | ✅ 已完成 |
| FR-7 | 触摸拖拽 Polyfill | UT + CT + IT | ✅ 已完成 |
| FR-8 | 可排序列表组件 | UT + CT + IT | ✅ 已完成 |
| FR-9 | 拖拽手柄组件 | UT + CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
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

