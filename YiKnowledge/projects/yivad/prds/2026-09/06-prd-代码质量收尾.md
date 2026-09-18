---
doc_type: prd
title: 代码质量收尾
tags: [代码质量, ESLint, TypeScript, 技术债]
category: 项目/管理后台/需求
created: '2026-09-09'
updated: '2026-09-15'
source: internal
type: 需求
status: 进行中
priority: P2
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: '202609'
prd_task_id: YV-09-CQ
estimate_frontend: 0.5
review_status: 已评审
implementation_progress: ESLint/vue-tsc 零错误零警告，useCodeHealth hook 已实现并测试通过（9用例），CodeHealthPanel 组件待创建
implementation_updated: '2026-09-15'
issue_type: 技术债
roles: [engineer]
source_okr: [yivad-003]
---

# 代码质量收尾

> 需求编号：YV-09-CQ · 优先级：P2 · 人天：0.5d

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。
> 实现方案见 [开发方案](../../devs/2026-09/06-prd-task-代码质量收尾.md)，验证方案见 [测试方案](../../tests/2026-09/06-prd-test-代码质量收尾.md)。


## 目录

- [一、背景](#sec-1)
- [二、静态质量归零（FR-1）](#sec-2)
- [三、代码健康监控（FR-2）](#sec-3)
- [四、质量门禁体系（FR-3）](#sec-4)
- [五、与现有模块的关系](#sec-5)
- [六、验收标准](#sec-6)

---

---

<a id="sec-1"></a>
## 一、背景

YiVad 经过多个迭代的快速开发，积累了部分代码质量问题需要统一收尾：未使用的导入、隐式 `any` 类型、遗留的 `console.log`、硬编码文本等。这些问题虽不影响功能，但影响代码可维护性和类型安全性。

九月迭代引入了大量新组件、composables 和 API 模块。在功能交付收尾阶段，需确保代码库不积累技术债务。本次收尾覆盖两条主线：静态质量归零 + 代码健康监控。

---

<a id="sec-2"></a>
## 二、静态质量归零（FR-1）

### 2.1 类型检查归零

**目标**：`vue-tsc --noEmit` 退出码 0，零类型错误。

`vue-tsc --noEmit` 已配置为 `pnpm build:*` 的阻断步骤。任何隐式 `any`、缺失类型注解、不匹配的 props/emits 类型都会阻断构建。

**修复范围**：
- 所有 `.ts`/`.vue` 文件中 `strict: true` 下的类型错误
- 隐式 `any` 参数补全类型注解
- 第三方库类型缺失的 `declare` 声明补全

### 2.2 ESLint 归零

**目标**：`pnpm lint:eslint` 退出码 0，零错误零警告。

| 规则 | 目标 | 说明 |
|------|------|------|
| `no-unused-vars` | 0 | 未使用导入、未使用变量全部清除 |
| `no-console` | 0（仅保留 `console.error`） | `console.log`/`console.warn` 全部移除 |
| `no-debugger` | 0 | 无 debugger 语句残留 |

### 2.3 Stylelint 归零

**目标**：`pnpm lint:stylelint` 退出码 0，零样式警告。

### 2.4 Prettier 格式化统一

**目标**：全项目 `.ts`/`.vue`/`.scss`/`.json` 文件格式一致。

### 2.5 硬编码文本排查

排查并修复硬编码的中文/英文文本，统一使用 i18n key。本次为排查 + 修复，非全面国际化审计（后者见 85-prd-多语言专项优化与补充）。

---

<a id="sec-3"></a>
## 三、代码健康监控（FR-2）

### 3.1 useCodeHealth Composable


**健康等级判定**（`getLevel`）：

| 等级 | 条件（正向指标） | 条件（负向指标，默认） | 颜色 |
|------|---------------|-------------------|------|
| `good` | value ≥ warn | value ≤ warn | 绿色 |
| `warn` | danger ≤ value < warn | warn < value ≤ danger | 黄色 |
| `danger` | value < danger | value > danger | 红色 |

**返回数据结构**（`CodeHealthReport`）：

| 维度 | 字段 | 说明 |
|------|------|------|
| 规模 | `scale.total_files`, `scale.total_lines`, `scale.avg_lines_per_file` | 文件规模指标 |
| 规模 | `scale.top_files: {path, lines}[]` | Top 10 大文件（用于预警） |
| 复杂度 | `complexity.cyclomatic_distribution`, `complexity.deep_nested` | 圈复杂度分布 |
| 复用 | `reuse.component_reuse_rate`, `reuse.code_duplication_rate` | 组件复用率、代码重复率 |
| 质量 | `quality.todo_count`, `quality.fixme_count`, `quality.comment_rate` | TODO/FIXME、注释率 |
| 趋势 | 与上次分析的环比变化 | 趋势数据 |

**数据来源**：RPC 调用 `analyzeCodeHealth({ project_key })` → 后端 Python 代码分析器（文件遍历 + AST 解析 + 圈复杂度计算 + 代码重复检测）。

### 3.2 CodeHealthPanel 组件

可视化展示代码健康度，嵌入项目分析 Tab：

- **大文件预警**：Top 10 大文件横向占比条，>600 行红色、>300 行黄色
- **健康指标卡片**：总文件数、总行数、平均文件行数、注释覆盖率
- **组件复用率**：百分比仪表盘
- **代码重复率**：百分比仪表盘 + 重复文件列表
- **TODO/FIXME 统计**：数量 + 趋势

交互：默认展开（在分析 Tab 中为主要展示场景），支持手动刷新，分析结果后端缓存 1 小时。

---

<a id="sec-4"></a>
## 四、质量门禁体系（FR-3）


| 门禁 | 触发时机 | 失败后果 |
|------|---------|---------|
| `vue-tsc --noEmit` | `pnpm build:*` | 阻断构建 |
| ESLint | lint-staged（提交时）/ `pnpm build:*` | 阻断提交/构建 |
| Stylelint | lint-staged（提交时）/ `pnpm build:*` | 阻断提交/构建 |
| Prettier | lint-staged（提交时） | 自动格式化 |
| commitlint | commit-msg hook | 阻断提交 |

---

<a id="sec-5"></a>
## 五、与现有模块的关系

| 关联模块 | 关系 | 说明 |
|---------|------|------|
| 84-prd-项目分析 Tab | 消费方 | `DetailAnalytics.vue` 使用 `useCodeHealth` 展示代码健康数据 |
| 05-prd-项目分析与报告 | 消费方 | 分析控制台中代码健康指标卡片 |
| 04-prd-项目管理系统 | 消费方 | 项目健康评分中的「质量」维度依赖代码质量基线 |
| 07-prd-错误边界与全局异常处理 | 互补 | 代码质量收尾解决静态问题，错误边界解决运行时异常 |
| 85-prd-多语言专项优化与补充 | 互补 | 本次排查硬编码文本，85-prd 做全面国际化审计 |

---

<a id="sec-6"></a>
## 六、验收标准

- [ ] `pnpm type:check` 退出码 0，零类型错误
- [ ] `pnpm lint:eslint` 退出码 0，零错误零警告
- [ ] `pnpm lint:stylelint` 退出码 0，零样式警告
- [ ] `pnpm lint:prettier` 全项目格式一致
- [ ] `rg "console\.log" src/` 零结果（仅保留 `console.error`）
- [ ] `rg "debugger" src/` 零结果
- [ ] `useCodeHealth` 在分析 Tab 中正确加载并展示代码健康数据
- [ ] `CodeHealthPanel` 大文件预警按阈值着色（>600 红、>300 黄）
- [ ] lint-staged 在提交时正确触发 ESLint/Prettier/Stylelint

---

> **文档边界**：本文档定义 WHAT/WHY。实现细节见[开发方案](../../devs/2026-09/06-prd-task-代码质量收尾.md)，测试用例见[测试方案](../../tests/2026-09/06-prd-test-代码质量收尾.md)。
