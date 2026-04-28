# Agent 记忆文件目录

每个 agent 维护一个独立的 `.md` 记忆文件，记录历史调用中的关键发现。

## 核心规则

1. Agent 只能写入自己的记忆文件，每次追加 1-3 条关键发现
2. Agent 可读取其他 agent 的记忆文件作为参考
3. 每个文件最多 50 条条目，超出时按可复用性淘汰（低优先淘汰）
4. 只追加不覆写

## 文件清单

| 文件 | 维护者 | 说明 |
|------|--------|------|
| `architect.md` | architect | 架构决策记忆 |
| `code-reviewer.md` | code-reviewer | 审查模式记忆 |
| `impact-analyst.md` | impact-analyst | 影响分析经验 |
| `e2e-tester.md` | e2e-tester | 测试模式记忆 |
| `security-reviewer.md` | security-reviewer | 安全模式记忆 |
| `test-page-builder.md` | test-page-builder | 原型页构建记忆 |
| `impl-reporter.md` | impl-reporter | 实施报告记忆 |
| `message-pusher.md` | message-pusher | 推送文案记忆 |
| `planner.md` | planner | 规划经验记忆 |
| `weekly-analyzer.md` | weekly-analyzer | 周报推断记忆 |