# implement-code 快速索引

`implement-code` 是项目的代码实施主 skill。行为真源在 `SKILL.md`，本文件只保留快速开始、目录索引和常用入口。

## 快速开始

```bash
/implement-code 简洁功能名
```

- 前提：`docs/<功能名>/` 下已有 P0 文档（02_需求任务 + 03_设计文档 + 05_动态检查清单）
- 产出：代码实施 + `06_实施总结.md` + 文档状态回写
- 每次调用结束**必须**执行 `import-docs` + `wework-bot`

## 真源说明

- 行为真源：`./SKILL.md`
- 文档与影响分析契约：`../../shared/document-contracts.md`
- 证据与反幻觉：`../../shared/evidence-and-uncertainty.md`

## 4 阶段总览

| 阶段 | 名称 | 主要动作 | 门禁 |
|------|------|---------|------|
| 1 | 预检 + 影响分析 | P0 文档预检、spec-retriever、impact-analyst、architect | P0 文档齐全 + 影响链闭合 + 架构确认 |
| 2 | 代码实施 | 逐模块编码、每模块 code-reviewer、每模块自检 | 所有模块实现完成 + 逐模块验证记录齐全 |
| 3 | 验证 + 审查 | 全量 code-reviewer、项目特有 agent、P0 检查项验证、plan 模式动态自检 | 无 P0 代码审查问题 + P0 检查项全部通过 |
| 4 | 总结 + 交付 | 06_实施总结、状态回写、quality-tracker、knowledge-curator、import-docs、wework-bot | 总结写入完成 + 状态回写完成 |

## 规则文件导航

按阶段阅读对应规则文件：

- 阶段 1：无专项规则（通用预检流程）
- 阶段 2：`rules/code-implementation.md` + `rules/test-page.md`
- 阶段 3：`rules/verification-gate.md` + `rules/e2e-testing.md`
- 阶段 4：`rules/process-summary.md` + `rules/artifact-contracts.md`

## 核心约定

1. `SKILL.md` 只保留阶段编排与强门禁，不重复规则文件中的长模板、示例代码和报告格式
2. 阶段编号以 `SKILL.md` 为准，其他规则文件不得自定义一套新的阶段映射
3. 产物路径以 `rules/artifact-contracts.md` 为准
4. 任意阶段阻断时，必须先生成 `06_实施总结.md`，回写同功能目录文档状态，再停止流程
5. 若连 `<功能名>` 或文档集路径都无法定位，必须写入项目日志记录
6. 代码实施的影响分析必须覆盖全项目，追踪改动点的上游依赖、反向依赖、传递依赖、导出链、注册链、测试、文档、配置和外部依赖影响
7. 实施完成后必须更新同功能目录内相关文档的 `## 实施状态`
8. 测试产物必须在仓库 `tests/` 目录下
9. `06_实施总结.md` 必须含 AI 调用流程图与时序图（Mermaid），并满足 `rules/process-summary.md` 的 S0 约束
10. 所有 agent 必答问题自动作答，不确定时输出建议方案继续，不打断用户
11. 每次调用结束前**必须**按技能先后调用 `import-docs` 与 `wework-bot`

## list 快捷用法

- 命令：`/implement-code list`
- 行为：仅列出当前项目 `docs/` 下可用于实施的功能目录（一级子目录）
- 空目录处理：若 `docs/` 不存在或无可选功能目录，提示先补齐文档