---
name: wework-bot
description: 发送企业微信机器人消息，用于 generate-document、implement-code 或其他长流程的监控预警、阶段通知和动态观测。用户提到企业微信机器人、wework、webhook、预警、监控通知或 send-message 时使用。
---

# wework-bot

## 定位

`wework-bot` 是企业微信机器人通知技能。它负责把阶段状态、阻断原因、验证结果或人工介入请求发送到企业微信群机器人，并支持按 agent 路由到不同机器人。

## 何时使用

- `generate-document` 生成文档开始、完成、阻断或自检失败时需要通知
- `implement-code` 阶段门禁、代码实施、冒烟测试、阻断总结需要动态观测
- 用户明确要求发送企业微信机器人消息
- 需要把长流程状态推送到外部群聊

## 输入

### `send-message.js` CLI（脚本只做路由与 HTTP 发送）

| 环境变量 / 参数 | 说明 |
|----------------|------|
| `API_X_TOKEN` | 必填，网关 `X-Token` |
| `WEWORK_BOT_API_URL` | 可选，覆盖默认 API |
| `WEWORK_BOT_CONFIG` | 可选，路由 JSON 路径（默认仓库内 `skills/wework-bot/config.json`） |
| `--agent` | 按 `config.agents` 映射到 robot（推荐） |
| `--robot` | 直接指定 robot 名（少用） |
| `--content` / `-c` | 完整正文字符串 |
| `--content-file` / `-f` | 从 UTF-8 文件读取完整正文（推荐长文案） |

webhook 仅在 `config.json`（或 robot 级 `webhook_*_env`）中配置，**无** CLI 传入。

### 正文里的业务字段（由 agent 写入，不由脚本拼装）

结论、描述、流程、门禁、度量、`⏱️ 用时`、`🪙 会话用量`、`🌿 分支` 等均在 **message-pusher**（或其它 agent）生成的正文中体现；字段层级与强制场景见下文「推送正文来源」与 `rules/message-contract.md`。

## 工作流程

1. **组装消息**：由 message-pusher（或等价流程）按电梯法则与仓库契约写好**完整正文**（可先 Plan 再写稿）。
2. **会话与时间等事实**：须在正文中自行写好 `🟢 开始时间` / `🔴 结束时间`、`⏱️ 用时`、`🪙 会话用量` 等；可从会话记录、账单与 `.claude/session-time.json` 核对后写入。
3. **选择机器人**：`config.json` 按 `--agent` 或 `--robot` 解析 webhook；未指定时使用 `default_robot`。
4. **校验凭据**：`API_X_TOKEN`；webhook 来自配置。
5. **发送**：`node scripts/send-message.js --agent … --content-file …`（或 `--content`）；脚本对正文仅做 `\\n`/`\\t` 字面量归一化，**不**注入模板行。
6. **汇总结果**：根据 HTTP 状态码与响应体判断是否成功；失败时排查 token、webhook 与网关返回。

## 推送文案与反幻觉（推荐代理）

- 需要**先 Plan 再写稿**、并系统核对「模型 / 工具 / 用时 / Token / 改进建议」时，可调用 `.claude/agents/message-pusher.md`（`message-pusher` 代理），再执行 `send-message.js`。
- **正文转义**：若从某处复制的内容里出现**字面** `\n` 而非真换行，可改用 `--content-file` 保存 UTF-8 多行文件，或依赖脚本在加载后对 `\\n` / `\\t` 做归一化（见 `send-message.js` 中 `normalizeMessageText`），避免企业微信中显示一坨反斜杠。

## 运行示例

（正文已由 message-pusher 写好；若较短可用 `--content`，长文用 `-f` 文件。）

```bash
API_X_TOKEN=*** node .claude/skills/wework-bot/scripts/send-message.js \
  --agent implement-code \
  --content $'📣 消息推送\n━━━━━━━━━━━━━━━━━\n🎯 结论：阶段 6 冒烟通过\n📝 描述：关键路径已验证，可进入收尾。'
```

```bash
API_X_TOKEN=*** node .claude/skills/wework-bot/scripts/send-message.js \
  --agent generate-document \
  -f ./tmp/wework-body.md
```

## 推送正文来源（不提供固定模板）

本技能不在 `SKILL.md` 内提供固定模板。推送正文由 `.claude/agents/message-pusher.md`（`message-pusher`）基于事实整理成**完整字符串**，再交给 `scripts/send-message.js` 做 **路由与 POST**（不对正文做字段补齐或校验）。

**格式强制要求：**

- 每条信息独占一行，使用 `━━━` 分隔线分隔标题与正文
- 表情符号与状态匹配：✅ 成功 / ⚠️ 警告 / ❌ 失败 / ⛔ 阻断 / 🔍 分析 / 📊 数据
- 必须包含 `🎯 结论：...` 行，放在标题分隔线后第一行；结论必须是一句话，优先说明结果和影响
- 必须包含 `📝 描述：...` 行，描述内容必须为 100 字以内，说明本次推送的背景、结果或下一步
- 完成通知与阻断通知必须**尽量补齐**业务度量字段（按上面模板顺序）：`🤝 AI 调用`、`🔗 调用链`、`📐 实施总结图表`、`🧩 MCP 明细`、`🧾 待办与风险`、`🗂️ 状态回写`、`📁 测试路径`、`🧫 测试统计`、`🔁 修复轮次`、`📦 产物`、`📂 报告`、`☁️ 文档同步`、`⏱️ 用时`、`🪙 会话用量`、`🌿 分支`、`🔖 提交`；**`⏱️ 用时` 与 `🪙 会话用量` 为必含**。若某字段暂无可靠来源，须在正文中写明可核对说明（如「未在本地记录…」），**禁止**由发送脚本代为编造。实现完成通知时，若已生成 `06_实施总结.md`，`📐/🧩/🧾/🗂️` 四行在可统计时**不得省略**。
- 完成通知必须包含 `📦 产物：...` 或等价产物统计；阻断通知必须包含 `🧭 恢复点：...` 与 `🔁 修复轮次：...`
- 必须包含 `🤖 模型：...`、`🧰 工具：...`、`🕒 最后更新：YYYY-MM-DD HH:mm:ss` 三行；时间必须精确到秒；同条消息须含 `⏱️ 用时` 与 `🪙 会话用量`（见上）
- 必须包含 `👉 下一步：...` 行，说明接收者下一步应做什么；无需行动时写「无需人工介入」
- 消息总长度建议不超过 2000 字；门禁失败、门禁失效、流程阻断消息优先完整说明，不得为了压缩而删除原因、证据、调用链、MCP/图表摘要、待办、产物、模型、工具或时间
- 数字必须来自实际执行结果，**不得**直接发送含 `<占位符>` 的模板
- `☁️ 文档同步` 行：若 `docs` 不存在，改为 `☁️ 文档同步：docs 不存在，跳过导入`
- `📁 测试路径` 行：必须基于 `artifact-contracts.md §2.2 测试路径门禁扫描命令` 的真实结果填写

## 消息建议（阶段通知）

阶段通知消息（非完成总结）应包含：

- 流程名称：`generate-document` / `implement-code`
- 功能名或文档路径
- 一句话结论：用 `🎯 结论：...` 放在正文第一行
- 描述内容：100 字以内，说明当前消息为什么推送
- 当前阶段
- 状态：开始 / 通过 / 阻断 / 失败 / 需要人工介入
- 使用模型、主要工具、最后更新时间（精确到秒），以及**本次会话** `⏱️ 用时` 与 `🪙 会话用量`（须在正文中写明）
- 关键原因或下一步动作：用 `👉 下一步：...` 独占一行

## 门禁失败 / 失效强制通知

以下任一情况都必须发送 wework-bot 消息，且消息必须足够具体，能让接收者直接判断影响范围和恢复动作：

- 门禁检查执行失败：P0 未通过、命令失败、MCP 操作失败、脚本退出码非 0
- 门禁失效：应执行的门禁未执行、被跳过、缺少验证证据、只口头声明通过、降级未记录
- 阻断收尾失败：`06_实施总结.md` 未能写入、状态回写失败、`import-docs` 失败、通知发送失败

## 会话中断强制通知（与仓库规则一致）

除上述门禁类场景外，**任何会话出现非正常结束（中断/阻断/流程异常停止）都必须发送 wework-bot 消息**，参见仓库级规则 `CLAUDE.md §5 会话中断 / 阻断通知（强制）`。

要求：

- 必须包含：`🟢 开始时间`、`🔴 结束时间`、`⏱️ 用时`、`🪙 会话用量`（须在正文中写明；缺可靠数据时写可核对说明，不得整段省略）
- 必须说明：发生在哪个流程/阶段、为何中断、影响范围、证据与恢复点

门禁类消息必须补充：

- `🔍 门禁：阶段 <N>（<门禁名称>）`
- `📎 证据：<报告路径 / 命令 / MCP 工具序列 / 失败摘要>`
- `📊 结果：通过 <N> / 失败 <M> / 未执行 <K>`
- `🤝 AI 调用：skills <N> / agents <N> / mcp <N>（已执行）`
- `🔗 调用链：<已执行的关键 skill / agent / MCP 链路>`
- `🔁 修复轮次：阶段<N>: <已尝试 N> 轮`
- `📁 测试路径：tests/ 内 <N> spec / <N> page，无逸出 / 发现 <N> 个逸出`
- `🌐 影响：<阻断范围、不可发布范围或需要人工确认的范围>`
- `🧭 恢复点：<从哪个阶段恢复、先做哪一步>`
- `🌿 分支：<git-branch>` `🔖 提交：<short-sha>`（由 message-pusher 写入正文）
- `🤖 模型：<模型名>`
- `🧰 工具：<主要工具清单>`
- `⏱️ 用时：<...>` 与 `🪙 会话用量：<...>`（与完成/阻断类要求一致）
- `🕒 最后更新：<YYYY-MM-DD HH:mm:ss>`

## 多机器人路由

脚本会优先读取 `WEWORK_BOT_CONFIG`；若未设置，会读取仓库内默认 `config.json`。配置文件保存机器人/agent **路由关系**，并在各 robot 下填写 `webhook_url` 或 `webhook_key`。

**必须预设的环境变量（只需设置一次）：**

```bash
export API_X_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

`WEWORK_BOT_CONFIG` 可选；只有需要切换到其他配置文件时才设置。建议把 `API_X_TOKEN` 写入 shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）使其永久生效。

配置优先级：

1. 选定 robot（命令行 `--robot`，否则 `--agent` 映射，否则 `default_robot`）
2. `config.json` 中该 robot 的 `webhook_url` 或 `webhook_key`（顶层同名字段可作兜底）

## 安全约束

- 不得提交真实 `X-Token`、webhook URL 或 webhook key。
- 默认 `config.json` 使用明文 **`webhook_url`**（完整 URL）与单一 `general` 路由；多群分流时可增加 robot 条目。
- 回复用户时只展示脱敏摘要，不展示完整密钥。
- `generate-document` 和 `implement-code` 流程结束时的完成通知属于**强制执行**，不受"默认不自动发送"约束；其余场景默认不自动发送，除非用户明确要求或调用方 skill 的流程规则要求通知。

## 支持文件

- `README.md`：快速使用说明
- `rules/message-contract.md`：消息格式、安全和调用契约
- `config.json`：默认配置（已提交）
- `scripts/send-message.js`：实际发送脚本
