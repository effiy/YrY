---
doc_type: test
title: "右键菜单系统 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-42"
source_prds: ["17-prd-右键菜单系统"]
source_modules: []
---
# 右键菜单系统 — 测试规格

> 来源 PRD：[17-prd-右键菜单系统.md](../../prds/2026-09/17-prd-右键菜单系统.md)

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
| FR-1 | 菜单项类型定义 | UT + CT | ✅ 已完成 |
| FR-2 | useContextMenu Composable | UT + CT | ✅ 已完成 |
| FR-3 | 菜单定位引擎 | UT + CT | ✅ 已完成 |
| FR-4 | 键盘导航 Hook | UT + CT | ✅ 已完成 |
| FR-5 | ContextMenu 主组件 | CT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### Scenario 1: 右键菜单正常显示
- **GIVEN** 用户在数据表格页面，鼠标悬停在某一行上
- **WHEN** 用户右键点击该行
- **THEN** 浏览器默认菜单被阻止，自定义右键菜单在鼠标位置附近显示，包含"编辑"、"删除"、"复制"、"查看详情"等菜单项

### Scenario 2: 菜单自动翻转避免溢出
- **GIVEN** 用户在视口右下角右键点击一个元素
- **WHEN** 菜单默认位置超出视口边界
- **THEN** 菜单自动翻转到鼠标左上方，所有菜单项完全可见，不超出视口

### Scenario 3: 键盘导航菜单项
- **GIVEN** 右键菜单已显示，焦点在菜单上
- **WHEN** 用户按 ↓ 键 3 次，然后按 Enter 键
- **THEN** 高亮依次移动到第 1、第 2、第 3 个菜单项（跳过 disabled 和 divider），Enter 触发第 3 个菜单项的 action

### Scenario 4: 批量选中右键菜单
- **GIVEN** 用户在表格中选中了 3 行数据
- **WHEN** 用户右键点击其中任意一行
- **THEN** 菜单显示"批量删除 (3)"、"批量导出 (3)"、"批量分配 (3)"等批量操作项

### Scenario 5: 子菜单展开与关闭
- **GIVEN** 右键菜单包含"移动到"子菜单项
- **WHEN** 用户悬停在"移动到"上
- **THEN** 子菜单在右侧展开，显示"项目 A"、"项目 B"、"项目 C"等选项；鼠标移出子菜单区域后 300ms 自动关闭

### Scenario 6: 禁用项显示 tooltip
- **GIVEN** 右键菜单中"删除"项被标记为 disabled，disabledReason 为"无删除权限"
- **WHEN** 用户悬停在"删除"项上
- **THEN** 菜单项灰色显示，tooltip 显示"无删除权限"，点击不触发任何操作

---


## 补充：单元测试用例

### UT-CM01: useContextMenu

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 右键触发 | 右键点击目标元素 | 菜单在鼠标位置显示 |
| 2 | 自定义操作 | items=[{label:'编辑', action:fn}] | 点击触发对应 action |
| 3 | 条件显示 | item.visible=false | 该项不在菜单中显示 |
| 4 | 菜单关闭 | 点击菜单外区域 | 菜单消失 |
| 5 | 嵌套菜单 | 子菜单展开 | 子菜单渲染在正确位置 |
| 6 | Teleport | 菜单渲染位置 | 挂载到 body，避免 overflow hidden |

