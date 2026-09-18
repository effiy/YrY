---
doc_type: test
title: "文档模板管理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-65"
source_prds: ["33-prd-文档模板管理"]
source_modules: []
---
# 文档模板管理 — 测试规格

> 来源 PRD：[33-prd-文档模板管理.md](../../prds/2026-09/33-prd-文档模板管理.md)

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
| FR-1 | 模板类型定义 | UT + CT + IT | ✅ 已完成 |
| FR-2 | 模板管理页面 | UT + CT + IT | ✅ 已完成 |
| FR-3 | 模板编辑器 | UT + CT + IT | ✅ 已完成 |
| FR-4 | 从模板创建文档对话框 | UT + CT + IT | ✅ 已完成 |
| FR-5 | 模板版本历史 | UT + CT + IT | ✅ 已完成 |
| FR-6 | 模板导入导出 | UT + CT + IT | ✅ 已完成 |
| FR-7 | 模板使用统计 | UT + CT + IT | ✅ 已完成 |
| FR-8 | 模板 API 服务 | IT | ✅ 已完成 |
| FR-9 | useTemplate Composable | UT + CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### Scenario 1: 创建模板并发布版本

- **GIVEN** 用户打开模板管理页面，点击"新建模板"
- **WHEN** 用户填写名称"PRD 模板"，选择分类"需求文档"，输入描述"产品需求文档模板"
- **AND** 在编辑器中输入 Markdown 内容，包含 `{{project_name}}`、`{{author}}`、`{{date}}` 变量
- **AND** 点击"发布版本"，输入版本号"1.0.0"，变更日志"初始版本"
- **THEN** 模板创建成功，列表新增一条记录，版本为"1.0.0"
- **AND** 版本历史中有一条记录，显示版本号、变更日志、发布时间

### Scenario 2: 从模板创建文档

- **GIVEN** 模板列表中有"PRD 模板"，当前用户为"陈铭"，当前项目为"YiVad"
- **WHEN** 用户点击"使用"按钮，在弹出对话框中选择项目"YiVad"
- **THEN** 标题自动生成为"PRD - YiVad - 2026-09-09"
- **AND** 系统变量 `project_name` 自动填充为"YiVad"，`author` 自动填充为"陈铭"
- **WHEN** 用户手动填写 `version` 为"v2.0.0"
- **AND** 预览区域显示变量替换后的完整文档内容
- **WHEN** 用户点击"创建文档"
- **THEN** 文档创建成功，模板使用次数 +1

### Scenario 3: 模板预览

- **GIVEN** 模板内容包含 `# {{project_name}} PRD` 和 `作者: {{author}}`
- **WHEN** 用户点击模板卡片进入预览模式
- **THEN** 预览区域显示 `# 当前项目 PRD` 和 `作者: 当前用户`
- **AND** 变量以蓝色高亮显示，区分于普通文本

### Scenario 4: 模板版本回退

- **GIVEN** 模板"PRD 模板"有 3 个版本：1.0.0、1.1.0、2.0.0
- **WHEN** 用户打开版本历史，查看版本 1.1.0 的内容
- **AND** 点击"回退到此版本"
- **THEN** 创建新版本 2.1.0，内容与版本 1.1.0 相同，变更日志为"回退到版本 1.1.0"

### Scenario 5: 模板导入导出

- **GIVEN** 用户有"PRD 模板"，版本 1.0.0
- **WHEN** 用户点击"导出"，选择"PRD 模板"
- **THEN** 下载文件 `PRD 模板.md`，包含 frontmatter（名称、分类、版本、描述）和正文内容
- **WHEN** 另一个用户上传该文件进行导入
- **THEN** 系统解析 frontmatter 和正文，创建新模板，版本为 1.0.0

### Scenario 6: 模板使用统计

- **GIVEN** 系统中有 10 个模板，过去 30 天有使用记录
- **WHEN** 用户打开模板使用统计页面
- **THEN** 显示"最常用模板 TOP 10"柱状图，排名第一的模板使用次数最多
- **AND** 显示"从未使用模板"列表，列出创建后未被使用过的模板
- **AND** 显示近 30 天使用趋势折线图
- **AND** 显示按分类统计的饼图

---

