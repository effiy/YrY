# e2e-testing 快速索引

`e2e-testing` 用于将 UI 用户流程场景转化为可执行的 E2E 测试方案。行为真源在 `SKILL.md`。

## 快速开始

```bash
/e2e-testing <场景描述文件或需求任务路径>
```

与 `implement-code` 联用时，产出须满足 Gate A（编码前最小可用验证）和 Gate B（编码后主流程冒烟）。

## 文件职责

| 文件           | 职责                           |
| -------------- | ------------------------------ |
| `SKILL.md`     | 何时使用、输入参数、工作步骤   |

## 输出物

- 测试策略与用例骨架（Playwright 优先）
- `data-testid` 推荐列表
- 验证步骤清单：`tests/e2e/<功能名>/…-checklist.md`

## 使用原则

1. 测试用例只能基于已提供的场景生成，不得自行添加未在需求任务中出现的场景。
2. 若场景描述不足以推断断言条件，输出"前置信息不足，需补充：…"。
3. 若需要并行专家角色或必答问题，改用 `../../agents/e2e-tester.md`。
4. 准入底线以 `../implement-code/rules/implement-code-testing.md` 为准。
