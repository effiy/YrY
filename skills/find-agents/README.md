# find-agents 快速索引

`find-agents` 用于在 `.claude/agents/` 下发现并推荐可并行调用的代理。行为真源在 `SKILL.md`。

## 快速开始

```bash
/find-agents <文档类型> <任务目标>
```

示例：

```bash
/find-agents 设计文档 "生成设计文档"
/find-agents 动态检查清单 "E2E 场景验证"
```

## 文件职责

| 文件           | 职责                           |
| -------------- | ------------------------------ |
| `SKILL.md`     | 代理映射表、必答问题生成规则   |

## 常用场景映射

| 场景                          | 推荐代理                                |
| ----------------------------- | --------------------------------------- |
| 设计文档生成前                | `planner` + `architect` + `impact-analyst` |
| 保存后审查                    | `doc-reviewer` + `code-reviewer` + `doc-updater` |
| 涉及安全鉴权                  | `security-reviewer`                     |
| 编写企微推送文案              | `message-pusher`                        |
| implement-code 阶段 0         | `spec-retriever` + `docs-lookup` + `architect` + `security-reviewer` |

## 使用原则

1. 只返回 `.claude/agents/` 下真实存在的代理文件名（不含 `.md`），禁止编造。
2. 返回的代理列表默认设计为可同时调用，不得隐含顺序依赖。
3. 代理返回仅作候选，最终是否写入文档由调用方决定。
