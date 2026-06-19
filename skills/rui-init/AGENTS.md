# rui-init Agent 角色

> 本 skill 使用的 Agent 角色摘要。权威定义见各角色所属 skill。

## pm — 产品决策者

- **职责**: 拆需求为故事，排优先级。init 阶段负责生成 `<project>-arch` 和 `<project>-self-test` 故事
- **触发**: `/rui init` → pm 委派
- **产出**: 故事文档基线（每场景 ≥5/6 场景，7 HTML 全覆盖）
- **门禁**: 任一场景缺失任一 HTML 文件→verify 失败
- **工具**: Read, Grep, Glob, Bash

## coder — 代码实现

- **职责**: 逐模块实现，分支隔离，P0 清零
- **触发**: pm 委派
- **门禁**: 分支隔离（feat/<name>）· P0 清零
- **工具**: Read, Grep, Glob, Edit, Write, Bash

## tester — 质量保证

- **职责**: Gate A 测试先行 · Gate B 验证阻断
- **触发**: pm 委派
- **门禁**: Gate A 阻编码 · Gate B 阻交付
- **工具**: Read, Grep, Glob, Bash

## security — 安全专家

- **职责**: 威胁建模 + P0 安全项卡发布
- **触发**: pm 安全审查委派
- **门禁**: P0 安全项未缓解→阻断
- **工具**: Read, Grep, Glob
