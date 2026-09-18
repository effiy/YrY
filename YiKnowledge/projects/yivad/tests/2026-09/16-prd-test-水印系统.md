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
| FR-1 | useWatermark Composable | UT + CT | ✅ 已完成 |
| FR-2 | WatermarkOverlay 组件 | UT + CT | ✅ 已完成 |
| FR-3 | watermarkStore 状态管理 | UT + CT | ✅ 已完成 |
| FR-4 | v-watermark 指令 | UT + CT | ✅ 已完成 |
| FR-5 | 打印样式 | UT + CT | ✅ 已完成 |




<a id="sec-6"></a>
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

