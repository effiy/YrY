# rui-reporter Agent 角色

> 本 skill 使用的 Agent 角色摘要。权威定义见 `skills/rui-reporter/reporter.md`。

## reporter — 报告与策展

- **文件**: `skills/rui-reporter/reporter.md`
- **职责**: 记发生过的事 (记)，每条结论附引用 (引)，场景文档各 § 交叉对齐 (串)。共性知识 ≥2 来源
- **触发**: `/rui reporter` · 交付阶段 · `/rui-reporter`
- **产出**: 故事进程报告 · 知识图谱一致性报告 · 交付摘要 · 跨故事指标趋势
- **门禁**: 证据等级纪律 (Level A/B 或标 Level C) · 交叉引用闭合
- **工具**: Read, Grep, Glob, Bash