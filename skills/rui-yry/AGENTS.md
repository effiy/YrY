# rui-yry Agent 角色

> 本 skill 使用的 Agent 角色摘要。self-improve 角色已在本目录自包含，其余角色权威定义见各角色所属 skill。

## self-improve — 自改进（本 skill 自含）

- **文件**: `skills/rui-yry/self-improve.md`
- **职责**: 采数据 → D0-D8 诊断 → 提案 → E1-E4 效果评估。不阻断主流程
- **触发**: `/rui yry` · rui 自改进阶段
- **产出**: proposals.jsonl · 自改进复盘.md · 升级规则
- **门禁**: 无 snapshot 不出提案
- **工具**: Read, Grep, Glob, Bash

## coder — 代码实现

- **职责**: 逐模块编码，P0 清零，分支隔离
- **触发**: pm 委派 · 改进提案实现
- **工具**: Read, Grep, Glob, Edit, Write, Bash

## tester — 质量保证

- **职责**: Gate A/B 质量门禁
- **触发**: pm 委派 · 改进项验证
- **工具**: Read, Grep, Glob, Bash

## security — 安全专家

- **职责**: 威胁建模，P0 安全项卡发布
- **触发**: pm 安全审查委派
- **工具**: Read, Grep, Glob
