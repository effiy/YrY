# implement-code 评测示例

真源：`.claude/skills/implement-code/SKILL.md`、`rules/orchestration.md`、`rules/code-implementation.md` 等；编排会话日志：`.claude/scripts/log-orchestration.js` → `docs/logs/<YYYY-MM-DD>_implement-code.log`；收尾：**先 `import-docs` 再 `wework-bot`**（见 [wework-bot.md](./wework-bot.md)）。

**评测约束**：须对照 SKILL：**Git 分支 `feat/<功能名>`（若为 git 仓库）**；P0 文档不齐须阻断并生成阻断版总结；阶段内必选 **spec-retriever、impact-analyst、architect** 及代码阶段的 **code-reviewer** 等契约；结束必须 **import-docs + wework-bot** 两步齐备。涉及 `.claude` 内 skill、agent、MCP、memory/shared 的交互，预期每轮完成后写入 **`docs/logs`** 一行（格式见 SKILL「编排会话日志」）。

---

## 用户故事 A：文档驱动实施

**故事**：作为审核者，希望代码变更可回溯到 `docs/<功能名>/` 下 02、03、05，且影响链分析与架构确认在实施前已完成。

**示例输入（对话）**

- 「`/implement-code 某某功能`：先预检 P0 文档，再 impact-analyst 全链闭合，architect 对齐架构约定。」
- 「每模块完成后跑 code-reviewer，P0 必须修。」

---

## 用户故事 B：list 与分支

**故事**：作为使用者，希望 `/implement-code list` 能列举 `docs/` 下功能目录；进入实施时创建 `feat/<功能名>`。

**示例输入（对话）**

- 「先 list 看有哪些功能文档再选一个 implement-code。」
- 「确认当前分支是 feat/xxx 再开始改代码。」

---

## 用户故事 C：阻断与门禁异常

**故事**：作为跟进者，希望在 P0 缺失、审查不可修复或门禁失效时，有阻断版 `06_实施总结.md`、文档状态回写与 **import-docs + wework-bot**（阻断 / 门禁异常模板）。

**示例输入（对话）**

- 「P0 文档缺一份：应停止并生成阻断总结，再发企微阻断通知。」
- 「wework-bot 失败时：失败摘要须写回 `06` 或 `docs/99_agent-runs/`。」

---

## 编排会话日志（可观测）

评测时可抽查当日 `docs/logs/*_implement-code.log`：是否存在与 **skill/agent/MCP** 交互对应的日志行，且正文含可核对摘要。

---

## 与 eval 的关联

- 文档导入脚本评测：[import-docs.md](./import-docs.md)
- 企微真发与文档同步：[wework-bot.md](./wework-bot.md)
- 文档生成编排对照：[generate-document.md](./generate-document.md)
- 写稿 agent：[message-pusher.md](../agents/message-pusher.md)
