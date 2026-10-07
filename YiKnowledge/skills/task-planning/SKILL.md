---
name: task-planning
description: >
  任务规划与跨会话上下文持久化。将复杂开发任务拆解为可执行步骤，通过三文件模式
  (task_plan/findings/progress) 防止长任务中上下文丢失和方向偏离。
  当用户描述涉及多文件的修改、需要多步骤实现、担心会话中断丢失进度、
  已有PRD需要拆解执行，或者说「制定计划」「拆分任务」「规划实现」「怎么开始」
  「implementation plan」「task breakdown」「execution steps」「拆分」
  「分几步做」「step by step」时使用。
  注意：需求还不清晰→brainstorming；只需文档→prd-creator；已拆好步骤开始编码→TDD。
user_invocable: true
updated: 2026-09-23
lifecycle: active
auto-trigger-rules:
  - 用户描述了涉及 3 个以上文件的修改任务，且**已经明确方案**
  - 用户已有 PRD 或需求文档，需要拆解为可执行步骤
  - 用户担心长任务中会话中断或上下文丢失
  - 任务预计需要多轮对话完成（非一次性小修改）
  - "**注意**：如果需求还不清晰→brainstorming；如果只需要正式文档→prd-creator；如果已拆解好步骤开始编码→TDD"
priority: high
tags: [skill, planning, workflow, context-persistence]
---

# 任务规划 —— 结构化开发计划与上下文持久化

> 核心理念：文件系统是 AI 的外部长期记忆。三文件模式确保任务在任意时刻可恢复、可交接、可审计。

## 三文件模式

每个开发任务维护三个 Markdown 文件，各司其职：

| 文件 | 角色 | 回答的问题 | 写入时机 |
|------|------|-----------|----------|
| `task_plan.md` | 路线图 | 我们要去哪里？ | 任务开始时创建，方案变更时更新 |
| `findings.md` | 知识库 | 我们知道了什么？ | 每完成一项调研/验证即追加 |
| `progress.md` | 施工日志 | 我们做了什么？ | 每完成一个步骤即追加 |

**为什么需要这三个文件？**

1. **恢复成本低** — 会话 `/clear` 或上下文压缩后，只需重读三个文件即可恢复全部工作状态
2. **交接容易** — 人可以阅读，另一个 Agent 也可以接着做
3. **错误不蒸发** — 失败原因被记录，为后续决策提供依据
4. **方向不偏离** — task_plan 作为锚点，防止模型在长任务中逐渐偏离目标

---

### 进入标准
- [ ] 需求已明确（有 PRD 或清晰的用户描述）
- [ ] 任务涉及 3 个以上文件或需要多轮对话完成
- [ ] 不是单文件、单次对话的小修改

### 退出标准
- [ ] task_plan 中所有步骤标记为完成
- [ ] 每个步骤的完成门禁全部通过
- [ ] progress.md 完整记录了执行过程
- [ ] 下一步：→ verification-before-completion（整体验证）→ finishing（提交归档）

## 工作流

```
需求理解 → 方案设计 → 计划生成 → 分步执行 → 持续记录 → 完成验证
```

### 阶段 1：需求理解

从用户描述中提取关键信息：

1. **目标** — 要达成什么结果？
2. **范围** — 涉及哪些模块/文件？
3. **约束** — 技术栈、时间限制、兼容性要求？
4. **验收标准** — 如何判断任务完成？

检查 `YiKnowledge/projects/<project>/devs/` 和 `YiKnowledge/projects/<project>/prds/` 中是否有相关文档可参考。

### 阶段 2：方案设计

提出 1-3 个可行方案，每个包含：
- **思路** — 一句话概括
- **涉及文件** — 预估需修改的文件列表
- **风险** — 主要风险点
- **取舍** — 为什么选/不选这个方案

与用户确认方案后再进入计划生成。**不要跳过这一步直接写代码。**

### 阶段 3：计划生成

将确认的方案拆解为编号步骤，保存到 `task_plan.md`：

```markdown
# 任务计划：[任务名称]

**创建时间**：2026-09-23 14:30
**目标**：[一句话描述]
**方案**：[选定的方案简述]

## 执行步骤

- [ ] 1. [步骤描述] — 涉及文件：`path/to/file.ts`
- [ ] 2. [步骤描述] — 涉及文件：`path/to/file.vue`
- [ ] 3. [步骤描述] — 涉及文件：`path/to/file.py`

## 验收标准

- [ ] [可验证的标准 1]
- [ ] [可验证的标准 2]

## 风险与应对

| 风险 | 概率 | 应对策略 |
|------|------|----------|
| [风险描述] | 高/中/低 | [应对方法] |
```

步骤粒度原则：
- 每步应在 1-3 个文件中修改，不超过 50 行
- 步骤之间有清晰的依赖关系时用缩进标注
- 独立步骤标记为可并行执行

### 阶段 4：分步执行

按 task_plan 顺序执行每个步骤。**执行纪律**（来自 superpowers 的 executing-plans 模式）：

#### 执行模式选择

执行前确认用户的执行偏好：

| 模式 | 适用场景 | 行为 |
|------|---------|------|
| **连续执行** | 步骤独立、用户已确认计划 | 不间断执行所有步骤，不问「是否继续」 |
| **逐步确认** | 步骤间有依赖、需要决策 | 每步完成后确认方向再继续 |
| **子代理并行** | 步骤间无依赖、可独立完成 | 为每个独立步骤派生子代理并行执行 |

默认采用**连续执行**——用户选择 task-planning 就是为了高效推进，而非每步都被打断。

**子代理并行模式**（来自 superpowers 的 subagent-driven-development）：
- 每个独立任务获得全新的子代理（无上下文污染）
- 每个任务完成后独立审查（spec + 代码质量）
- 最终做一次整体审查
- 成本：每个任务一个上下文 + 一个审查者；适合 3+ 独立步骤的大型任务

如果步骤之间有依赖关系，不要使用子代理并行——依赖步骤必须在被依赖步骤完成后执行。对于 YrY 这种 4 项目单体仓库，独立的跨项目步骤（如同时修改 YiVad 和 YiPet）特别适合并行模式。

#### 裁决而非停滞（Rulings, Not Stalls）

执行中遇到计划未覆盖的情况——冲突、模糊、计划缺陷——**直接裁决而非停下来问**：

```
Ruling: <你决定做什么> — <为什么> — <如果错了代价是什么>

记录到 progress.md 的裁决日志中。
```

**什么可以自己裁决**：
- 实现细节（plan 说了做什么，没说怎么做）
- 顺序微调（步骤 3 和 4 独立，可以交换）
- 小的技术决策（选哪个库函数、用什么数据结构）
- 计划缺陷但可推断意图

**什么必须停下来问**（只有以下四种）：
1. **不可逆或破坏性操作** — `DROP TABLE`、`rm -rf`、覆盖生产数据
2. **安全敏感操作** — 修改认证/授权、暴露密钥、更改权限模型
3. **跨边界副作用** — merge、push 到共享分支、发布
4. **计划彻底失效** — 每条路径都是猜测，无法推断意图

#### 执行循环

```
for 每个步骤 in task_plan:
  ├── 执行前：progress.md 记录步骤编号和开始时间
  ├── 执行中：
  │   ├── 优先 TDD（先写测试再实现）
  │   ├── 遇到未覆盖的情况 → 裁决并记录
  │   └── 步骤完成门禁全部通过
  ├── 执行后：progress.md 立即更新（状态 + 修改文件 + 验证结果）
  └── 如有新发现 → findings.md 追加

连续执行模式下，步骤间用 % 分隔线区分，不间断推进。
```

### 阶段 5：持续记录

**findings.md 写入规则：**

```markdown
# 调研发现：[任务名称]

## [发现时间] [标题]

**结论**：[一句话结论]
**证据**：[支撑结论的代码路径、测试结果、文档引用]
**影响**：[对当前任务的影响]
**相关文件**：[涉及的文件路径]
```

何时写入 findings：
- 确认了一个之前不确定的事实
- 排除了一种不可行的方案
- 发现了一个隐藏的约束或依赖
- 验证了一个假设

**progress.md 写入规则：**

```markdown
# 执行日志：[任务名称]

## [时间] 步骤 N：[步骤描述]

**状态**：✅ 完成 / ❌ 失败 / 🔄 进行中
**修改文件**：
  - `path/to/file.ts:42-58` — [修改说明]
**验证结果**：[测试/类型检查/手动验证结果]
**问题**：[遇到的问题及解决方案]

## 裁决日志

| 时间 | 步骤 | 裁决 | 原因 | 如果错误的代价 |
|------|------|------|------|-------------|
| [时间] | [步骤N] | [决定] | [为什么] | [代价评估] |
```

何时写入 progress：
- 每完成一个步骤后**立即**追加
- 每次做出裁决时写入裁决日志
- 遇到阻塞问题时记录
- 方案变更时记录原因

---

## 与项目文档的集成

本技能与 `YiKnowledge/projects/` 中的项目文档体系协同工作：

```
PRD（产品规格）──→ task_plan（本技能）──→ task 文档（projects/<project>/devs/）
                        │
                        ├── findings.md ←→ projects/<project>/architecture/
                        └── progress.md ←→ projects/<project>/devs/*/task/
```

- **PRD → task_plan**：PRD 中的功能需求拆解为 task_plan 的执行步骤
- **task_plan → devs/**：task_plan 完成后，可选的将步骤转为 `YiKnowledge/projects/` 中的正式 task 文档
- **findings → architecture/**：重要的技术发现可沉淀为 `YiKnowledge/projects/<project>/architecture/` 中的知识文档
- **progress → dev-log**：执行日志可作为 `YiKnowledge/projects/<project>/devs/` 中 dev-log 的素材

---

## 恢复流程 —— Crash-Proof 上下文恢复

三文件模式的核心价值在于**抗崩溃**——无论会话如何中断，任务状态永不丢失。

### 为什么需要 Crash-Proof 设计？

AI 会话有三个自然的「失忆」点：

| 失忆点 | 触发条件 | 丢失内容 |
|--------|---------|---------|
| `/clear` | 用户主动清除 | 全部对话历史 |
| 上下文压缩（compaction） | 上下文窗口接近上限 | 早期对话摘要化，细节丢失 |
| 会话重启 | 终端关闭、进程退出 | 全部上下文 |

**没有三文件** → 每次失忆都需要用户重新解释任务。  
**有三文件** → 只需重读三个文件，30 秒内完全恢复。

### 防上下文腐化（Context Rot Prevention）

长任务中，模型会逐渐「忘记」最初的目标和约束——这称为上下文腐化。三文件通过**每轮重注入**对抗腐化：

```
每轮对话开始时：
  1. 快速扫描 task_plan.md 的「目标」和「当前步骤」
  2. 检查 progress.md 的最后一条记录
  3. 如有新发现，读取 findings.md 的最新条目
  
  → 耗时 <5 秒，确保方向不偏离
```

### 恢复协议

#### 场景 1：用户说「继续」

```
1. 检查 tasks/ 目录是否存在三文件
2. 如果存在 → 执行恢复流程（下方）
3. 如果不存在 → 询问用户任务名称或从对话历史推断
```

**恢复流程**（严格按此顺序）：

```
Step 1：读取 task_plan.md
  → 提取：目标、当前状态、下一步骤编号
  → 如果 task_plan 不存在 → 无法恢复，请用户重新描述任务

Step 2：读取 progress.md 最后 3 条记录
  → 确认：最后完成的操作、时间、修改的文件
  → 如果 progress 为空 → 从 task_plan 步骤 1 开始

Step 3：读取 findings.md 最新条目
  → 获取：已验证的技术事实、已排除的方案
  → 如果 findings 为空 → 跳过

Step 4：输出恢复摘要
  → 展示：任务名、进度、下一步、关键发现、最近操作
  → 询问：是否继续或需要调整方向
```

#### 场景 2：上下文压缩后自动恢复

当检测到上下文被压缩（对话历史变短），自动执行：

```
[检测到上下文压缩]

→ 从 task_plan.md 重新加载目标和进度
→ 从 findings.md 重新加载关键约束
→ 继续执行，不需要用户干预
```

#### 场景 3：会话完全重启

用户重新打开终端，说「继续上次的任务」：

```
助手：[扫描 tasks/ 目录]
  发现 3 个进行中的任务：
  1. dark-mode — 步骤 3/6，最后活动 2026-09-23 14:52
  2. cache-layer — 步骤 1/4，最后活动 2026-09-22 10:00
  3. api-refactor — 步骤 5/8，最后活动 2026-09-21 16:30
  
  要恢复哪个？或者输入「全部」查看详情。
```

### 确定性完成门禁（Deterministic Completion Gate）

从 planning-with-files 引入的核心概念：**完成不是主观感觉，而是可验证的条件集合**。

task_plan 中的每个步骤必须有一个明确的完成门禁：

```markdown
- [ ] 4. 在页面头部添加主题切换开关
  涉及文件：`src/components/ThemeToggle.vue`
  完成门禁：
    ✅ 组件渲染三种模式选项（浅色/深色/系统）
    ✅ 切换后全局主题立即生效
    ✅ vue-tsc --noEmit 0 errors
    ✅ 单元测试通过（ThemeToggle.spec.ts）
```

门禁未全部通过 → 步骤未完成。不允许「差不多完成了」。

### 恢复示例

```
用户：/clear
用户：继续暗色模式的任务

助手：[从 tasks/dark-mode/ 恢复]
  
  📋 task_plan：YiVad 暗色模式 — 步骤 3/6
  📝 最后操作：完成 CSS 变量定义（14:52）
  🔍 关键发现：Element Plus 2.3+ 支持 CSS 变量主题切换
  
  当前步骤 4：「在页面头部添加主题切换开关」
  完成门禁：
    - 组件渲染三种模式
    - 全局主题切换生效
    - vue-tsc 0 errors
    - 单元测试通过
  
  继续执行步骤 4？
```

---

## 文件存储位置

默认在当前工作目录下创建 `tasks/<task-name>/` 目录：

```
tasks/
└── dark-mode/
    ├── task_plan.md
    ├── findings.md
    └── progress.md
```

用户可指定其他位置。任务完成后，可选择将文件归档到 `YiKnowledge/projects/<project>/devs/`。

---

## 命令

| 命令 | 操作 |
|------|------|
| 「制定计划」「规划」「怎么做」 | 进入需求理解 → 方案设计 → 计划生成流程 |
| 「开始执行」「继续」 | 按 task_plan 逐步执行并记录 progress |
| 「查看进度」「进度」 | 显示 task_plan 完成情况和最近 progress 条目 |
| 「查看发现」「发现了什么」 | 显示 findings.md 摘要 |
| 「恢复」「继续上次」 | 执行恢复流程，读取三文件并继续 |
| 「归档」 | 将三文件整理并移动到项目文档目录 |

---

---

## YrY 实战速览

### 例：YiVad 列表组件体系 — task_plan 映射

项目中 `YiKnowledge/projects/yivad/devs/2026-09/01-prd-task-列表组件体系.md` 的 9 人天任务，如果用三文件模式执行：

**task_plan.md 拆解**：

```
目标：重构 YiVad 列表页为 ProTable 组件体系
方案：抽取 4 个共享 Composable（useTable/useFilter/useSort/usePage）

- [x] 1. 创建 usePage composable — `src/composables/usePage.ts`
- [x] 2. 创建 useFilter composable — `src/composables/useFilter.ts`
- [x] 3. 创建 useSort composable  — `src/composables/useSort.ts`
- [x] 4. 创建 useTable composable（组合上述三个）— `src/composables/useTable.ts`
- [x] 5. 迁移 Project 列表页 — `src/views/project/index.vue`
- [x] 6. 迁移 Issue 列表页 — `src/views/issue/index.vue`
```

**findings.md 关键条目**：

```
## 2026-09-11 ProTable 分页机制
结论：ProTable 使用服务端分页，pageNum/pageSize 通过 RPC 参数传递
影响：usePage 必须与服务端分页契约对齐，不能做客户端分页
```

**progress.md 典型条目**：

```
## 2026-09-12 步骤 5：迁移 Project 列表页
状态：✅ 完成
修改文件：src/views/project/index.vue:45-120
验证：vue-tsc 0 errors, 41 tests passed
问题：旧代码中有直接操作 DOM 的排序逻辑 → 改为 Composable 调用
```

### 归档转换

任务完成后用 `project-templates.md` 映射转换为标准项目文档：
- task_plan → `01-prd-task-列表组件体系.md` 方案设计
- findings → `01-prd-task-列表组件体系.md` 技术决策
- progress → `01-test-列表组件体系.md` 验证记录

## 原则

- **先问再做。** 方案设计阶段必须与用户确认，不要直接跳到代码实现。
- **即时记录。** 每完成一步立即写 progress.md，不要事后补记。
- **不编造发现。** findings.md 只记录已验证的事实，不记录推测。
- **计划可变更。** task_plan 不是一成不变的——发现新信息后更新计划并标注变更原因。
- **匹配项目结构。** 引用文件路径时使用项目实际的目录结构（参考 `CLAUDE.md`）。
- **配合现有技能。** PRD 用 prd-creator，Issue 追踪用 issue-creator，本技能专注开发执行阶段。

## 参考文件

- `references/three-file-pattern.md` — 三文件模式的详细规范和反模式
- `references/integration-guide.md` — 与 YiKnowledge/projects 文档体系的集成指南
- `references/project-templates.md` — 项目文档模板（prd-task/task/test）和归档转换规则
- `../brainstorming/SKILL.md` — 头脑风暴技能（task-planning 的上游，先确认方向再规划）
- `../prd-creator/SKILL.md` — PRD 生成技能（task-planning 的上游输入）
- `../test-driven-development/SKILL.md` — TDD 技能（执行步骤中先写测试再写实现）
- `../code-review/SKILL.md` — 代码审查技能（步骤完成后的质量检查）
- `../receiving-code-review/SKILL.md` — 接收审查反馈（审查后处理意见的正确方式）
- `../verification-before-completion/SKILL.md` — 完成前验证（所有步骤完成后的质量门禁）
- `../finishing-a-development-branch/SKILL.md` — 开发分支收尾（归档转换完成后的提交和文档更新）
- `../shared/glossary.md` — 技能共享术语表（Crash-Proof、上下文腐化等术语定义）