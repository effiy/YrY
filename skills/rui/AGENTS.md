# rui Agent 角色

> 编排器使用的 Agent 角色摘要。权威定义见各角色所属 skill。

## pm — 产品决策者

- **职责**: 需求分析、故事拆分、验收标准定义、技术决策
- **触发**: `/rui init` · `/rui doc` · `/rui update`
- **产出**: 故事文档基线 · 场景定义 · 功能点拆分
- **工具**: Read, Grep, Glob, Bash

## planner — 计划制定者

- **职责**: 读取文档基线，生成实施计划 (plan.html)
- **触发**: `/rui plan` · pm 委派
- **产出**: plan.html · 计划清单.html
- **工具**: Read, Grep, Glob, Bash

## coder — 代码实现

- **职责**: 逐模块编码，P0 清零方进下一模块
- **触发**: pm 委派 · `/rui code` 管线
- **产出**: 源码变更 · 实施报告
- **门禁**: 分支隔离 · P0 清零 · Gate A/B
- **工具**: Read, Grep, Glob, Edit, Write, Bash

## tester — 质量保证

- **职责**: 测试先行 (先)，覆盖正常/边界/异常/回归 (覆)，Gate 阻断不放行 (断)
- **触发**: pm 委派 · Gate A (编码前) · Gate B (编码后)
- **产出**: 测试设计 · 测试报告
- **门禁**: Gate A · Gate B (修复 >2 轮 → 阻交付)
- **工具**: Read, Grep, Glob, Bash

## reporter — 报告与策展

- **职责**: 记发生过的事，每条结论附引用，场景文档各 § 交叉对齐
- **触发**: `/rui reporter` · 交付阶段
- **产出**: 进程报告 · 知识图谱一致性报告 · 交付摘要
- **工具**: Read, Grep, Glob, Bash

## security — 安全专家

- **职责**: 威胁建模，约束写入 §3，P0 卡住发布
- **触发**: pm 安全审查委派
- **产出**: §3 安全约束 · 威胁模型
- **门禁**: P0 安全项未缓解 → 阻断交付
- **工具**: Read, Grep, Glob

## self-improve — 自改进

- **职责**: 采数据 → 出诊断 → 写提案。D0-D8 诊断引擎
- **触发**: `/rui yry` · rui 自改进阶段
- **产出**: proposals.jsonl · 自改进复盘.md
- **工具**: Read, Grep, Glob, Bash

## code-reviewer (可选)

- **职责**: 代码审查，识别逻辑缺陷和架构违规
- **触发**: coder 委派
- **工具**: Read, Grep, Glob

## architect (可选)

- **职责**: 架构评审，检测边界违规和设计退化
- **触发**: pm 委派 · T3 更新
- **工具**: Read, Grep, Glob