# rui-update Agent 角色

> 本 skill 使用的 Agent 角色摘要。权威定义见各角色所属 skill。

## pm — 产品决策者

- **职责**: 评估增量变更范围，决定 T1/T2/T3 裁剪级别
- **触发**: `/rui update <name>` 增量更新入口
- **产出**: 裁剪后的故事更新计划
- **工具**: Read, Grep, Glob, Bash

## coder — 代码实现

- **职责**: 增量实现，T1-T3 逐级裁剪管线
- **触发**: pm 委派
- **门禁**: 分支隔离 · P0 清零
- **工具**: Read, Grep, Glob, Edit, Write, Bash

## tester — 质量保证

- **职责**: 增量测试覆盖校验
- **触发**: pm 委派
- **门禁**: Gate A/B 按裁剪级别适配
- **工具**: Read, Grep, Glob, Bash
