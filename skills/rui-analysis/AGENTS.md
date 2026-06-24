# rui-analysis Agent 角色

> 本 skill 使用的 Agent 角色摘要。rui-analysis 为规约驱动，由 implementing agent 执行分析。

## architect (可选)

- **职责**: 架构静态分析 — 复杂度热点 · 耦合检测 · 文件膨胀 · 依赖健康 · 架构边界违规
- **触发**: `/rui analysis` · 自改进阶段 D3/D5/D8 诊断
- **产出**: 五维分析报告 · 热点 Top-5% · 架构健康评分
- **门禁**: 规约驱动，只读操作，不修改源码
- **工具**: Read, Grep, Glob, Bash