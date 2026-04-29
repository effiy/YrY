# wework-bot 评测示例

真源：`.claude/skills/wework-bot/SKILL.md`、`rules/message-contract.md`；脚本：`.claude/skills/wework-bot/scripts/send-message.js`。

---

## 用户故事 A：阶段通知（长流程观测）

**故事**：作为跟进者，希望在 `implement-code` / `generate-document` 执行过程中收到企业微信群通知，且描述里能还原阶段与证据路径。

**示例输入（对话）**

- 「阶段 6 冒烟通过了，用 wework-bot 按 implement-code 路由发一条通知，`--description` 写清证据里的 spec 路径。」
- 「generate-document 刚开始生成全文档，推一条开始状态，别忘了 flow/feature。」

---

## 用户故事 B：门禁失败 / 阻断

**故事**：作为跟进者，希望在门禁未通过或流程阻断时，群里能看到原因、证据、恢复点和会话度量（用时、用量等可对账）。

**示例输入（对话）**

- 「门禁失败了：先按 message-pusher 对齐事实，再跑 send-message；正文里要有 🔍 门禁、📎 证据、🧭 恢复点。」
- 「流程阻断需要人工介入：发 wework-bot，不要编造 Token 数字，缺的用脚本缺省说明。」

---

## 用户故事 C：完成与文档同步数字

**故事**：作为跟进者，希望在流程结束时推送里出现 **真实的** `import-docs` 同步结果（创建/覆盖/失败），而不是占位符。

**示例输入（对话）**

- 「generate-document 收尾通知：`☁️ 文档同步` 必须是刚跑完 import-docs 的真实数字。」

---

## 用户故事 D：仅校验不发远端（dry-run）

**故事**：作为执行者，希望在本地验证路由与拼装后的正文，不向企业微信发真实消息。

**示例输入（对话）**

- 「先 wework-bot `--dry-run` 看一眼 Content preview，确认描述不超过 100 字再真发。」

---

## 与 Agent 的配合

推送长文案策划可先对齐 `.claude/agents/message-pusher.md`，再调用脚本；详见 [agents/message-pusher.md](../agents/message-pusher.md)。

---

## CLI 意图示例（供评测「命令是否拼对」）

下列为用户可能交给助手代为执行的意图描述（非唯一措辞）：

- 「`API_X_TOKEN` 已从环境读，对当前分支 `--agent implement-code --dry-run`。」
- 「不要用命令行传 webhook；从 config.json 解析 robot。」
