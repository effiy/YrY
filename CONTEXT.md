# YrY — SDLC 编排系统

以故事为驱动的软件交付管线自动化系统。定义 AI Agent 如何协作完成需求→文档→代码→验证→交付的完整生命周期。

## Language

**管线 (Pipeline)**:
端到端 SDLC 流程：需求解析→自适应规划→影响分析→架构设计→文档生成→预检→Gate A→实现→Gate B→自改进→交付。每阶段有明确的进入/退出条件。
_Avoid_: workflow, process, 流程

**故事 (Story)**:
管线中单一、独立、可完成的作业单元。一个需求可拆为多个故事，逐个串行通过管线。产出一组编号文档 (01–08)。
_Avoid_: task, ticket, issue

**故事任务面板 (Story Board)**:
`docs/故事任务面板/<Project>/<name>/` 目录。每个故事的所有产物（01–08 文档、附属文档、记忆）内聚在此。
_Avoid_: output directory, doc folder

**Gate A (测试先行门禁)**:
编码前的强制性阻断点。`04-测试用例评审.md` 不存在或未就绪→编码不得开始。单行 CSS/文案为唯一例外。
_Avoid_: test gate, pre-code check

**Gate B (验证收口门禁)**:
编码后的闭合验证。五步检查（环境快照→静态预检→设计对齐→单次执行→三报告）。修复 > 2 轮→阻断。
_Avoid_: verification gate, post-code check

**P0 / P1 / P2 (优先级)**:
P0 = 阻塞发布必修项；P1 = 当轮修复项；P2 = 记录不阻断项。P0 不清零不进下一模块。
_Avoid_: critical / major / minor

**阻断 (Block)**:
管线在当前阶段停止，状态写入 `.memory/rui-state.json`。12 种阻断标识（`skip-gate-a`, `gate-b-limit`, `chain-broken` 等）。阻断≠失败——重跑同命令从中断点续。
_Avoid_: stop, halt, fail

**铁律 (Iron Law)**:
三条不可妥协的规则。违反字母即是违反精神：(1) 验先于称 (2) 溯先于修 (3) 清先于进。
_Avoid_: rule, constraint

**影响链 (Impact Chain)**:
变更点的完整传递依赖图。五步闭合：列变更→选搜索词→全项目搜索→二级传递→标注处置。未闭合 = `chain-broken` 阻断。
_Avoid_: dependency graph, impact analysis

**分支隔离 (Branch Isolation)**:
功能分支 `feat/<Project>-<name>` 从 main 创建。源码改动唯一入口为 `/rui code`。禁止自动合并、派生分支、main 上直接改码。
_Avoid_: feature branch

**反推 (Reverse Inference)**:
只读模式。`--from-code` 从源码反推文档；`--from-doc` 从文档反推源码补充。禁止改源码。
_Avoid_: reverse engineering, backfill

**证据等级 (Evidence Level)**:
A=已验证(附路径) B=可推导(附推导链) C=未验证(标「待补充」) D=幻觉(视为错误)。所有 docs/ 产出必须标注。
_Avoid_: confidence level

**Agent (角色)**:
六大协作角色：pm(决策) coder(实现) tester(质量) reporter(记录) security(安全) self-improve(改进)。每角色有交接信号和验证方式。
_Avoid_: bot, worker, role

**公式 (Formula)**:
结构化文档产出规范。定义章节、表头、字段、约束。分为通用元素 (F.meta/F.nav/F.evidence)、故事主线 (F.story.*)、补充文档 (F.supp.*)。
_Avoid_: template, format

**交付三步 (Delivery Triad)**:
管线末端强制序列：(1) hook-log 追加日志→(2) import-docs 同步文档→(3) wework-bot 发送通知。任一缺失 = 管线未闭合。
_Avoid_: delivery pipeline, post-steps

**自改进 (Self-Improve)**:
D0–D7 诊断循环。采集执行数据→六维评估→生成改进提案→提案闭环保案。`no-metrics` 降级不阻断。
_Avoid_: retrospective, post-mortem

**执行记忆 (Execution Memory)**:
`.memory/execution-memory.jsonl`（追加）+ `.memory/rui-state.json`（覆盖写）。持久化管线状态与执行历史。
_Avoid_: state, log

**项目类型 (Project Type)**:
frontend / backend / fullstack / meta / unknown。决定文档生成矩阵（前端补 03/06，后端补 02/05，全栈全部补）。
_Avoid_: stack type

**需求 (Requirement)**:
`/rui` 的输入：纯文本、`@` 文件引用、或 URL。pm 解析后拆为一组故事。
_Avoid_: input, spec, feature request

**插件 (Plugin)**:
YrY 本身是 Claude Code 插件。元项目——用自身管线管理自身演进。
_Avoid_: extension, addon

## Relationships

- 一个 **需求** 拆为一组 **故事**
- 每个 **故事** 顺序通过 **管线** 所有阶段
- **Gate A** 在实现前阻断，**Gate B** 在实现后阻断
- 每个 **Agent** 定义交接信号，下游可验证
- **公式** 驱动文档产出，**证据等级** 约束内容质量
- **交付三步** 是管线收口，三步缺一不可
- **自改进** 从执行记忆采集数据，输出改进提案反馈 pm

## Example dialogue

> **PM:** 这个需求涉及前后端变更，应拆为几个**故事**？
> **Coder:** 按**项目类型** fullstack，需补 02-后端评审和 03-前端评审。建议拆为 2 个故事串行。
>
> **Tester:** **Gate A** 测试方案已就绪，04-测试用例评审覆盖了全部 AC。可以放行进入实现。
> **Coder:** 模块 1 审查完成，P0 已清零。模块 2 有一个 P1 需要当轮修复。继续前进？
> **Tester:** P0 清零即可进下一模块，P1 不阻断。继续。
>
> **Reporter:** **Gate B** 五步全部通过。修复 1 轮，在 2 轮限额内。三报告交叉引用闭合。放行交付。
> **PM:** 收到。**交付三步**已执行：日志→同步→通知。管线闭合。

## Flagged ambiguities

- "流程" 曾被同时用于指**管线**(机制)和**交付三步**(收口动作)——已解析：管线是全过程，交付三步是末端收口
- "阻断" 与"降级"易混淆——已解析：阻断 = 管线停止需修复重跑；降级 = 记录标记但不停止前进
- "故事" 与"任务"曾混用——已解析：故事是管线单元，任务是故事内部 §4 的工作拆分
- "公式" 与"模板" 不同——公式是规约(描述 what)，模板是具体文件(描述 how)。本系统只用公式，不依赖模板文件
