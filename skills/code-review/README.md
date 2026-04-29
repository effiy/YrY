# code-review 快速索引

`code-review` 用于对代码文件或代码片段进行规范性审查，输出 P0/P1/P2 分级问题列表。行为真源在 `SKILL.md`。

## 快速开始

```bash
/code-review <文件路径1> [文件路径2] ...
```

示例：

```bash
/code-review src/components/Button.vue src/stores/auth.ts
```

## 文件职责

| 文件           | 职责                           |
| -------------- | ------------------------------ |
| `SKILL.md`     | 何时使用、输入参数、审查维度   |

## 审查维度

- **项目专项**：入口初始化、状态管理、组件注册/导出、代码结构、编码规范
- **通用质量**：可读性、边界处理、安全、性能

## 使用原则

1. 优先读取 `../generate-document/rules/代码结构.md` 和 `../generate-document/rules/编码规范.md` 作为判断依据。
2. 只审查实际读取到的代码，不推断未看到的文件内容。
3. 若需要并行专家角色或必答问题，改用 `../../agents/code-reviewer.md`。
