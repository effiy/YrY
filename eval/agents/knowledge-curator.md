# knowledge-curator 评测示例

真源：`.claude/agents/knowledge-curator.md`。

**评测约束**：跨 agent 读取所有记忆文件，策展共性知识并写入 `knowledge.md`；有权读取所有文件但只能写入 `knowledge.md`。

---

## 用户故事 A：共性知识策展

**故事**：作为知识管理者，希望从多个 agent 的记忆中提取共性经验，形成可复用知识。

**示例输入（对话）**

- 「整理一下本周各 agent 记忆里的共性发现和最佳实践。」
- 「从 agent 记忆中提取可复用的规范建议，更新到 `knowledge.md`。」

---

## 成功判据（可观测）

| 维度 | 预期 |
|------|------|
| 跨代理读取 | 读取 `.claude/agents/memory/` 下多个记忆文件 |
| 共性提取 | 识别并归纳跨 agent 的共性知识和模式 |
| 写入权限 | 仅写入 `agents/memory/knowledge.md`，不修改其他 agent 记忆 |
| 可复用性 | 输出知识具有跨任务复用价值 |

---

## 负例（应判不达标）

- 未读取多个 agent 记忆而仅凭单一来源总结。
- 写入其他 agent 的记忆文件而非 `knowledge.md`。
- 提取的知识过于具体，缺乏跨任务复用价值。
