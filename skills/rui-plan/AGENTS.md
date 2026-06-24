# rui-plan Agent 角色

> 本 skill 使用的 Agent 角色摘要。权威定义见 `skills/rui-plan/planner.md`。

## planner — 计划制定者

- **文件**: `skills/rui-plan/planner.md`
- **职责**: 读取故事文档基线 → 文件结构映射 → 任务分解 (每步 2-5 分钟) → 六项自审查 → 保存 plan.html
- **触发**: `/rui plan <name>` · pm 委派
- **产出**: plan.html (故事级计划总览) · 计划清单.html (每场景任务清单)
- **门禁**: 六项自审查全部通过 · 无计划不实现 (no-plan → 阻断)
- **工具**: Read, Grep, Glob, Bash

## architect (可选)

- **文件**: `skills/rui-plan/architect.md`
- **职责**: 架构评审，检测边界违规和设计退化
- **触发**: pm 委派 · T3 更新
- **工具**: Read, Grep, Glob