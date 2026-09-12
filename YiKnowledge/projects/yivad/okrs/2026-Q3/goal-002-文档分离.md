---
type: okr-goal
id: yivad-002
title: "文档职责分离与知识关联"
status: in_progress
period: "2026 Q3"
owner: 陈铭
project: YiVad
project_id: yivad
progress: 70
updated: 2026-09-11
kr1: "产品需求/开发模块/测试文档/Bug 文档独立目录，单一职责"
kr1_completion: 80
kr2: "prd_task_id 双向关联产品需求与开发模块"
kr2_completion: 100
kr3: "OKR Tab 展示项目目标及关键结果进度"
kr3_completion: 100
kr4: "知识库模块文档从产品需求中提取，可追溯"
kr4_completion: 60
metric1_id: "yivad-m04"
metric1_desc: "独立文档目录数"
metric1_current: "6"
metric1_target: "6"
metric2_id: "yivad-m05"
metric2_desc: "已关联知识库的模块占比"
metric2_current: "60%"
metric2_target: "100%"
related_prds:
  - projects/yivad/prds/2026-09/00-prd-需求总览.md
---

# 文档职责分离与知识关联

> Q3 知识管理目标。将 YiKnowledge 中混合的产品/开发/测试/缺陷内容按单一职责原则拆分为独立目录体系，通过 `prd_task_id` 建立 OKR → PRD → Dev Module → Test → Bug 的全链路可追溯闭环。

## 背景

Q3 初期，YiVad 的 YiKnowledge 文档体系存在三个结构性问题：

**内容混合**：`requirements/` 目录中的 PRD 文件同时包含产品需求描述、开发实现方案、测试用例和 Bug 记录。一个文件承载四种不同受众的内容，产品经理、开发工程师、测试工程师各自需要在同一文件中寻找自己关心的部分。

**关联缺失**：MongoDB 中的 Module 集合与 YiKnowledge 中的模块文档完全独立——MongoDB 模块不知道自己的设计文档在哪，YiKnowledge 模块文档不知道自己对应哪个运行时的模块。PRD、开发、测试三者之间没有可追溯的关联字段。

**无法消费**：goal-001 重构后的 Project 详情页需要展示 OKR 进度、产品需求列表、开发模块文档，但如果文档结构不清晰、关联字段不存在，新增的 OKR/Requirements/Devs Tab 只能展示空数据。

本目标与 goal-001 互为依赖：goal-001 提供前端展示能力（7 个 Tab），本目标提供数据结构和关联体系。两者共同构成 Q3 "Project 页面完整信息架构"的能力闭环。

## 季度演进

### 八月 — 问题识别与规范设计

八月主要完成了问题诊断和目录规范设计。在编写 YV-08-01 PRD 时，发现 `requirements/` 目录的混合内容模式无法支撑细化需求——15 个子需求各自需要独立的产品描述、开发方案和测试计划。

月初的 `projects/yivad/` 目录仅有 `requirements/`、`workflows/` 两个子目录，前者混合了四种文档类型，后者仅有 5 篇基础开发规范。目录结构如下：

```
projects/yivad/
├── requirements/        # 混合产品/开发/测试/Bug 内容
│   ├── 2026-07/         # 4 个混合文件
│   └── 2026-08/         # 1 个总览文件（14 个子需求混在一篇里）
└── workflows/           # 5 篇开发规范
```

八月下旬输出了目录分离方案：按文档职责创建 prds/（产品需求）、modules/（开发模块）、tests/（测试文档）、bugs/（缺陷记录）四个独立目录，每个目录按月归档，通过 `prd_task_id` 字段建立跨目录关联。方案在 `projects/yivad/README.md` 中落地为目录结构规范。

### 九月 — 目录拆分与关联体系

九月执行了目录创建、内容提取、关联字段落地三项核心工作。

**目录创建**（KR1，80% 完成）。在 `projects/yivad/` 下建立了完整的 6 目录体系：

| 目录 | 文件数 | 职责 | 受众 |
|------|--------|------|------|
| `prds/` | 104 | 产品需求——WHAT 和 WHY，不包含实现细节 | 产品经理 |
| `devs/` | 37 | 开发模块——HOW，架构设计、技术决策 | 开发工程师 |
| `tests/` | 5 | 测试文档——VERIFY，测试策略、用例、回归计划 | 测试工程师 |
| `bugs/` | 99 | 缺陷记录——按分类目录组织，严重度分级 | 全员 |
| `okrs/` | 3 | 目标与关键结果——OKR → PRD 可追溯 | 全员 |
| `workflows/` | 29 | 开发规范 + 操作指南 + 流程规范 | 开发工程师 |

每个目录有 README.md 索引和可追溯矩阵表格。bugs/ 按 9 个分类目录组织（template/validation/data/code-quality/style/state/api/router/build），每个 Bug 文件独立记录根因和修复方案。

**关联体系**（KR2，100% 完成）。建立了 `prd_task_id` 为核心的跨目录关联链：

```
OKR (goal-001)
  └── related_prds: ["YV-09-01"]
        └── PRD (YV-09-01)
              └── related_modules: ["YV-09-01-1", "YV-09-01-2", ...]
                    └── Dev Module (YV-09-01-1)
                          └── related_tests: ["YV-09-22"]
                                └── Test (YV-09-22)
                                      └── source_modules: ["YV-09-01-1", ...]
```

技术实现：
1. Frontmatter 标准化：所有文档类型添加 `doc_type`、`prd_task_id`、`related_modules`、`related_tests`、`source_prds`、`source_modules` 追溯字段，形成双向引用。
2. MongoDB Module 接口扩展：`modules` 集合新增 `prd_task_id` 和 `yk_module_path` 字段，实现 YiKnowledge 文档 ↔ MongoDB 运行时数据的双向关联。
3. DetailDevs Tab 消费该关联：每个模块卡片展示来源 PRD、关联测试、MongoDB 运行时链接——用户在一个视图中即可走完 PRD → Dev → Test 的完整链路。

**前端落地**（KR3，100% 完成）。goal-001 的 7 个 Tab 中有 4 个直接消费本目标的目录和关联数据：

- **DetailOkr**：消费 `okrs/` 目录 + 角色级 `{role}/okr/` 双路径，解析 goal.md frontmatter，SVG 进度环可视化。
- **DetailRequirements**：消费 `prds/` 目录，按月分组，`prd_task_id` 关联 devs/ 和 tests/。
- **DetailDevs**：消费 `devs/` 目录 + MongoDB modules 集合，以产品需求为组织框架，展示 OKR → PRD → Module → Test 全链路。
- **DetailWorkflows**：消费 `workflows/` 目录，排除 prds/devs/tests/bugs/okrs 子目录中已有专用 Tab 的内容。

**模块提取**（KR4，60% 完成）。已从 2026-08 和 2026-09 的 PRD 中提取了 19 个开发模块文档到 devs/ 目录，12 个模块已在 MongoDB 中补全 `prd_task_id` 和 `yk_module_path` 关联字段。剩余 40% 为 2026-07 及更早的模块文档待提取，以及部分模块的 MongoDB 关联字段待补全。

### 十月 — 关联闭环与规范化收尾

九月的目录体系和关联机制已经建立并验证，十月的任务是完成剩余关联、加强 Bug 可追溯性、将整套规范制度化。

**关联补全**（KR4 → 100%）：

| 任务 | 当前 | 目标 | 人天 |
|------|------|------|------|
| 2026-07 及更早模块文档提取 | 0 | 从历史 PRD 中提取 10+ 个模块 | 1.5 |
| MongoDB 模块关联字段补全 | 60% | 100% modules 有 prd_task_id + yk_module_path | 1.0 |
| 测试文档扩展 | 5 个测试文件 | 覆盖 2026-09 全部 19 个模块 | 1.0 |

**Bug 可追溯闭环**：当前 bugs/ 目录已按分类组织 99 个 Bug 文件，但 Bug 文档缺少与 PRD/Module 的追溯字段。十月计划：
1. Bug frontmatter 新增 `source_prd`、`source_module`、`source_test` 追溯字段
2. DetailQuality Tab 支持从 Bug 卡片跳转到对应 Dev Module 和测试文档
3. Bug 索引页补全分类目录统计

**规范化制度化**：

1. **Frontmatter 校验**：在 YiKnowledge 就绪检查清单中新增追溯字段完备性检查——`doc_type` 为 prd 的文件必须有 `related_modules`，为 dev 的文件必须有 `source_prd` 和 `related_tests`。
2. **新增文档模板**：每种 `doc_type` 提供 frontmatter 模板和示例，降低新文档的关联成本。
3. **YiVad 开发规范更新**：将文档分离规范写入 `workflows/开发规范/`，新增页面/功能时同步创建对应的 prd/dev/test 文档并建立关联。
4. **跨项目推广**：将 YiVad 验证的目录结构和关联模式，输出为 YiKnowledge 通用模板，供 YiAi/YiPet 项目采用。

**成功标准**：十月结束时，YiKnowledge projects/yivad/ 下每篇 PRD 可追踪到对应的 Dev Module 和 Test 文档；MongoDB modules 集合 100% 包含 `prd_task_id` 和 `yk_module_path`；新增任何功能都从 PRD 开始，经过 Dev → Test → Bug 形成完整闭环。

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | 产品需求/开发模块/测试/Bug 文档独立目录，单一职责 | 80% |
| KR2 | prd_task_id 双向关联 PRD → Module → Test | 100% |
| KR3 | OKR Tab 展示目标及关键结果进度 | 100% |
| KR4 | 知识库模块文档从产品需求中提取，可追溯 | 60% |

## KR1 — 目录分离

从原本混合的 `requirements/` 单目录，拆分为 6 个职责清晰的独立目录：prds/（104 篇，产品需求）、devs/（37 篇，开发模块）、tests/（5 篇，测试文档）、bugs/（99 篇，缺陷记录）、okrs/（3 篇，目标管理）、workflows/（29 篇，开发规范）。每个目录有 README.md 索引和可追溯矩阵表格，按月归档，单一受众。

## KR2 — 双向关联

通过 `prd_task_id` + `related_modules` + `related_tests` + `source_prds` + `source_modules` 五个追溯字段，建立了 OKR → PRD → Dev Module → Test 的完整前向关联链，以及 Test → Module → PRD → OKR 的反向追溯链。MongoDB modules 集合新增 `prd_task_id` 和 `yk_module_path` 字段，实现了 YiKnowledge 文档与运行数据的双向关联。DetailDevs Tab 在单个视图中完整呈现该链路。

## KR3 — OKR Tab

Project 详情页新增 OKR Tab（goal-001 KR3 的组成部分），消费本目标创建的 `okrs/` 目录和角色级 `{role}/okr/` 双路径数据。解析 goal.md frontmatter 中的 KR 完成度和 metric 指标，SVG 进度环可视化，按角色分组展示项目目标和跨项目角色目标。

## KR4 — 可追溯

已从 2026-08 和 2026-09 PRD 中提取 19 个开发模块文档到 devs/ 目录，12 个模块在 MongoDB 中补全了关联字段。DetailDevs 以产品需求为组织框架，每个模块卡片显示来源 PRD、关联测试、MongoDB 运行时链接。剩余 40% 为历史模块文档提取和关联字段补全，计划十月完成。