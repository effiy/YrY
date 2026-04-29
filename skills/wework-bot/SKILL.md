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

### 路由与认证

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `token` | 仅 `API_X_TOKEN` | `https://api.effiy.cn` 的 `X-Token`，**只**从系统环境变量读取 |
| `apiUrl` | `https://api.effiy.cn/wework/send-message` | 发送消息 API |
| `config` | `WEWORK_BOT_CONFIG`；未设置时读取 `config.json` | 多机器人路由配置 JSON（优先解析 webhook；可用 `webhook_*_env` 映射到具体环境变量名） |
| `agent` | 无 | agent 名称，用于从配置中选择机器人 |
| `robot` | 配置默认值 | 机器人名称，优先级高于 `agent` |
| `webhookUrl` | `config.json` →（兜底）`WEWORK_WEBHOOK_URL` | 完整企业微信机器人 webhook |
| `webhookKey` | `config.json` →（兜底）`WEWORK_WEBHOOK_KEY` | 企业微信机器人 key，可自动拼接 webhook |

### 内容与描述

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `content` | 无 | 消息正文（一句话结论或完整多行电梯块） |
| `description` | 无 | 消息描述，必填，100 字以内；也可写在正文的 `📝 描述：...` 行 |
| `contentFile` | 无 | 从文件读取消息正文 |
| `conclusion` | 无 | 显式指定 `🎯 结论` 行；当 `content` 已经是多行块时强制覆盖结论 |

### 上下文字段

| 参数 | 默认值 | 写入字段 | 说明 |
|------|--------|---------|------|
| `flow` | 无 | `🛠️ 流程` | 流程名，如 `implement-code` / `generate-document` |
| `feature` | 无 | `📌 功能` | 功能名或文档路径 |
| `stage` | 无 | `📍 阶段` | 当前阶段 |
| `status` | 无 | `📊 状态` | 当前状态：开始 / 通过 / 阻断 / 失败 / 需要人工介入 |
| `docType` | 无 | `📋 类型` | `generate-document` 专用，文档类型 |
| `p0Pass` + `p0Total` | 无 | `🧪 P0 检查项` | P0 通过数 / 总数 |
| `gateName` | 无 | `🔍 门禁` | 门禁阶段或名称 |
| `gateResult` | 无 | `📊 结果` | 门禁结果，如 `通过 N / 失败 M / 未执行 K` |
| `reason` | 无 | `❌ 原因` | 失败 / 阻断原因（≤ 2 条） |
| `impact` | 无 | `🌐 影响` | 用户可见影响、交付范围或阻断影响 |
| `evidence` | 无 | `📎 证据` | 证据路径、命令、MCP 调用序列或结果摘要 |
| `reportPath` | 无 | `📂 报告` | 报告或总结文件路径 |
| `recover` | 无 | `🧭 恢复点` | 阻断 / 门禁失败时的恢复路径 |
| `nextStep` | 默认恢复建议 | `👉 下一步` | 接收者下一步动作 |

### 业务度量字段（让推送内容更详细）

| 参数 | 默认值 | 写入字段 | 说明 |
|------|--------|---------|------|
| `duration` | 无（脚本可写入缺省说明） | `⏱️ 用时` | **必含**：本次会话耗时；如 `12m 34s` 或 `01:23:45`；未记时/未传参时脚本注入「未在本地记录，请自行核对会话耗时」 |
| `startedAt` | 无（可自动读取 `.claude/session-time.json`） | `🟢 开始时间` | **必含**：任务开始时间，`YYYY-MM-DD HH:mm:ss`；未传且未自动检测到时脚本注入缺省说明 |
| `endedAt` | 无（可自动读取 `.claude/session-time.json`） | `🔴 结束时间` | **必含**：任务结束时间，`YYYY-MM-DD HH:mm:ss`；未传且未自动检测到时脚本注入缺省说明 |
| `aiCalls` | 无 | `🤝 AI 调用` | AI 调用统计，如 `skills 7 / agents 4 / mcp 23 / tools 86` |
| `callChain` | 无 | `🔗 调用链` | 紧凑调用链，如 `find-skills→find-agents→...→wework-bot` |
| `testPaths` | 无 | `📁 测试路径` | 测试路径门禁结论，如 `tests/ 内 12 spec / 5 page，无逸出` |
| `testStats` | 无 | `🧫 测试统计` | 测试用例统计，如 `spec 12 / case 47 / 通过 47 / 失败 0` |
| `retries` | 无 | `🔁 修复轮次` | 自修复轮次，如 `阶段2: 1 轮 / 阶段6: 0 轮` |
| `artifacts` | 无 | `📦 产物` | 产物统计，如 `代码 8 / 测试 12 / 文档 6` |
| `metrics` | 无 | `📈 指标` | 其它度量，如 `lint 0 / 影响链命中 23` |
| `syncResult` | 无 | `☁️ 文档同步` | `import-docs` 真实结果，如 `docs → 远端（创建 6，覆盖 0，失败 0）` |
| `branch` | `git rev-parse --abbrev-ref HEAD`（自动检测） | `🌿 分支` | Git 分支名，未自动检测到时为空 |
| `commit` | `git rev-parse --short HEAD`（自动检测） | `🔖 提交` | Git short commit，未自动检测到时为空 |
| `diagramSummary` | 无 | `📐 实施总结图表` | `06_实施总结.md` §1/§2：流程图节点数、时序图参与者数等，与总结可对照 |
| `mcpBreakdown` | 无 | `🧩 MCP 明细` | Playwright-MCP 工具次数，如 `nav 12 / snap 24 / click 8 / eval 9` |
| `backlog` | 无 | `🧾 待办与风险` | P1/P2 条数或摘要，如 `P1 2 项 / P2 5 项（见 §9）` |
| `statusRewrite` | 无 | `🗂️ 状态回写` | `01/02/03/04/05/07` 更新情况，如 `01-07 已更新，05 已最终回写` |

### 元信息字段

| 参数 | 默认值 | 写入字段 | 说明 |
|------|--------|---------|------|
| `model` | `AGENT_MODEL` / `CURSOR_AGENT_MODEL` / `Claude Sonnet 4.6` | `🤖 模型` | 本次执行使用的模型名称 |
| `tools` | `AGENT_TOOLS` / `Cursor Agent / Playwright-MCP / Shell / wework-bot` | `🧰 工具` | 本次执行涉及的主要工具 |
| `updatedAt` | 本地当前时间 | `🕒 最后更新` | `YYYY-MM-DD HH:mm:ss`，精确到秒 |
| `tokenUsage` | `AGENT_SESSION_TOKEN_USAGE` / `--token-usage`（未传时脚本可写入缺省说明） | `🪙 会话用量` | **必含**：本次会话 **Token 或用量摘要**（须来自可核对来源）；未传时脚本注入缺省说明——有真实值时应改为 `--token-usage` 或环境变量，**禁止**编造 |
| `improvementHints` | `AGENT_SESSION_IMPROVEMENT_HINTS` / `--improvement-hints` | `💡 改进建议` | 基于**本次已发生事实**的 2～4 条可执行建议，**禁止**臆造指标或原因 |
| `noAutoGit` | `WEWORK_BOT_NO_AUTO_GIT=1` | — | 关闭 git 分支 / commit 自动检测（沙箱安全） |

## 工作流程

1. **组装消息**：按电梯法则组织内容：先给一句话结论，再给 100 字以内描述、流程、功能、阶段、状态、影响、证据和下一步；每条信息独占一行，并使用匹配状态的表情符号。
2. **补齐业务度量与会话成本**：完成通知、阻断通知、门禁异常通知**必须**出现 `⏱️ 用时`（本次会话耗时）与 `🪙 会话用量`（本次会话 Token/用量，须可核对）。须尽量再补齐 `🤝 AI 调用`、`🔗 调用链`、`📐 实施总结图表`、`🧩 MCP 明细`、`🧾 待办与风险`、`🗂️ 状态回写`、`📁 测试路径`、`🧫 测试统计`、`🔁 修复轮次`、`📦 产物`、`☁️ 文档同步`、`🌿 分支`、`🔖 提交` 等；其中前四项与 `06_实施总结.md` 的「AI 调用记录」及 §1/§2 Mermaid 图一致。脚本会自动检测 git 分支和 commit，并在未手写/未传 `--duration` / `--token-usage` 时**仍注入**上述两行（缺省为可核对说明，避免空项）。其余字段由调用方传入（可在命令行使用 `--diagram-summary`、`--mcp-breakdown`、`--backlog`、`--status-rewrite`）。
2.1 **会话起止时间强制**：任意 wework-bot 推送（含阶段通知、完成/阻断/门禁异常）**必须**包含 `🟢 开始时间` 与 `🔴 结束时间` 两行。推荐不手填，由 `send-message.js` 从 `.claude/session-time.json` 自动读取；若本地未启用 hooks 或文件缺失，脚本会注入缺省说明以保证字段不缺失（并提示自行核对会话记录）。
3. **补齐元信息**：每条消息必须包含 `🤖 模型`、`🧰 工具`、`🕒 最后更新` 三行；脚本会在缺失时自动补齐。长流程类推送在元信息前还应已有 `⏱️ 用时` 与 `🪙 会话用量`（见上条）。
4. **选择机器人**：优先按 `config.json` 解析 webhook（`webhook_url` / `webhook_key` 或通过 `webhook_*_env` 映射）；必要时按 `robot` 或 `agent` 选择机器人；未指定时走配置中的 `default_robot`。仅在配置缺失时兜底使用全局环境变量 `WEWORK_WEBHOOK_URL` / `WEWORK_WEBHOOK_KEY*`。
5. **校验凭据**：`X-Token` **仅允许来自系统环境变量** `API_X_TOKEN`。webhook **优先来自 `config.json` 解析结果**（含映射到的 env）；必要时才允许兜底全局环境变量。
6. **发送消息**：调用 `scripts/send-message.js`。
7. **汇总结果**：记录 HTTP 状态码、响应摘要、机器人路由、消息时间和脱敏凭据摘要；失败时返回错误原因。若该消息用于门禁失败、门禁失效或流程阻断，发送失败也必须写入实施总结或兜底运行记录。

## 推送文案与反幻觉（推荐代理）

- 需要**先 Plan 再写稿**、并系统核对「模型 / 工具 / 用时 / Token / 改进建议」时，可调用 `.claude/agents/message-pusher.md`（`message-pusher` 代理），再执行 `send-message.js`。
- **正文转义**：若从某处复制的内容里出现**字面** `\n` 而非真换行，可改用 `--content-file` 保存 UTF-8 多行文件，或依赖脚本在加载后对 `\\n` / `\\t` 做归一化（见 `send-message.js` 中 `normalizeMessageText`），避免企业微信中显示一坨反斜杠。

## 运行示例

使用完整 webhook：

```bash
API_X_TOKEN=*** node .claude/skills/wework-bot/scripts/send-message.js \
  --agent implement-code \
  --content "implement-code 阶段 6 冒烟测试通过" \
  --description "真实页面冒烟测试已通过，关键用户路径可继续进入收尾。" \
  --flow implement-code \
  --feature mermaid-toolbar \
  --stage "阶段 6：冒烟测试" \
  --status "通过" \
  --impact "关键用户路径已验证，可进入总结和同步" \
  --evidence "tests/e2e/mermaid-toolbar/*.spec.ts" \
  --next-step "进入阶段 7 生成实施总结"
```

使用 webhook key：

```bash
API_X_TOKEN=*** node .claude/skills/wework-bot/scripts/send-message.js \
  --agent generate-document \
  --content "generate-document 已生成全文档" \
  --description "全文档已保存，等待导入结果写入完成通知。"
```

按 agent 路由：

```bash
API_X_TOKEN=*** node .claude/skills/wework-bot/scripts/send-message.js \
  --agent code-reviewer \
  --content "code-reviewer 发现 P0 问题，需要人工处理" \
  --description "代码审查发现阻断项，需要人工确认修复策略。"
```

演练不发送：

```bash
node .claude/skills/wework-bot/scripts/send-message.js \
  --content "预警测试" \
  --description "验证企业微信机器人路由和消息格式，不实际发送。" \
  --dry-run
```

## 推送正文来源（不提供固定模板）

wework-bot 不再在 `SKILL.md` 内提供固定消息模板。推送正文统一由 `.claude/agents/message-pusher.md`（`message-pusher`）基于本次事实来源先整理生成，再交由 `scripts/send-message.js` 负责路由、必填字段补齐/校验与发送。

**格式强制要求：**

- 每条信息独占一行，使用 `━━━` 分隔线分隔标题与正文
- 表情符号与状态匹配：✅ 成功 / ⚠️ 警告 / ❌ 失败 / ⛔ 阻断 / 🔍 分析 / 📊 数据
- 必须包含 `🎯 结论：...` 行，放在标题分隔线后第一行；结论必须是一句话，优先说明结果和影响
- 必须包含 `📝 描述：...` 行，描述内容必须为 100 字以内，说明本次推送的背景、结果或下一步
- 完成通知与阻断通知必须**尽量补齐**业务度量字段（按上面模板顺序）：`🤝 AI 调用`、`🔗 调用链`、`📐 实施总结图表`、`🧩 MCP 明细`、`🧾 待办与风险`、`🗂️ 状态回写`、`📁 测试路径`、`🧫 测试统计`、`🔁 修复轮次`、`📦 产物`、`📂 报告`、`☁️ 文档同步`、`⏱️ 用时`、`🪙 会话用量`、`🌿 分支`、`🔖 提交`；**`⏱️ 用时` 与 `🪙 会话用量` 为必含**（`send-message.js` 可注入缺省说明）。脚本会自动补齐 `🌿 分支` / `🔖 提交` / `🤖 模型` / `🧰 工具` / `🕒 最后更新`。实现完成通知时，若已生成 `06_实施总结.md`，`📐/🧩/🧾/🗂️` 四行在可统计时**不得省略**。
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
- 使用模型、主要工具、最后更新时间（精确到秒），以及**本次会话** `⏱️ 用时` 与 `🪙 会话用量`（可传参或由脚本补缺省说明）
- 关键原因或下一步动作：用 `👉 下一步：...` 独占一行

## 门禁失败 / 失效强制通知

以下任一情况都必须发送 wework-bot 消息，且消息必须足够具体，能让接收者直接判断影响范围和恢复动作：

- 门禁检查执行失败：P0 未通过、命令失败、MCP 操作失败、脚本退出码非 0
- 门禁失效：应执行的门禁未执行、被跳过、缺少验证证据、只口头声明通过、降级未记录
- 阻断收尾失败：`06_实施总结.md` 未能写入、状态回写失败、`import-docs` 失败、通知发送失败

## 会话中断强制通知（与仓库规则一致）

除上述门禁类场景外，**任何会话出现非正常结束（中断/阻断/流程异常停止）都必须发送 wework-bot 消息**，参见仓库级规则 `CLAUDE.md §5 会话中断 / 阻断通知（强制）`。

要求：

- 必须包含：`🟢 开始时间`、`🔴 结束时间`、`⏱️ 用时`、`🪙 会话用量`（缺失时由脚本注入可核对缺省说明，但不得整段省略）
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
- `🌿 分支：<git-branch>` `🔖 提交：<short-sha>`（脚本自动补齐）
- `🤖 模型：<模型名>`
- `🧰 工具：<主要工具清单>`
- `⏱️ 用时：<...>` 与 `🪙 会话用量：<...>`（与完成/阻断类要求一致）
- `🕒 最后更新：<YYYY-MM-DD HH:mm:ss>`

## 多机器人路由

脚本会优先读取 `WEWORK_BOT_CONFIG`；若未设置，会读取仓库内默认 `config.json`。配置文件保存机器人/agent **路由关系**，并提供 webhook 解析入口：`webhook_url` / `webhook_key` 或通过 `webhook_*_env` 映射到本地环境变量名。

**必须预设的环境变量（只需设置一次）：**

```bash
export API_X_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

`WEWORK_BOT_CONFIG` 可选；只有需要切换到其他配置文件时才设置。建议把 `API_X_TOKEN` 写入 shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）使其永久生效。

配置优先级：

1. 选定 robot（命令行 `--robot`，否则 `--agent` 映射，否则 `default_robot`）
2. `config.json` 中该 robot 的 webhook（优先 `webhook_*_env` 映射，其次明文 `webhook_url` / `webhook_key`；顶层同名字段可作兜底）
3. （兜底）全局环境变量 `WEWORK_WEBHOOK_URL` / `WEWORK_WEBHOOK_KEY`

## 安全约束

- 不得提交真实 `X-Token`、webhook URL 或 webhook key。
- 仓库中的路由配置优先使用 `webhook_*_env` 映射；如需明文 `webhook_url` / `webhook_key`，使用本地不入库覆盖（例如 `.gitignore`）。
- 回复用户时只展示脱敏摘要，不展示完整密钥。
- `generate-document` 和 `implement-code` 流程结束时的完成通知属于**强制执行**，不受"默认不自动发送"约束；其余场景默认不自动发送，除非用户明确要求或调用方 skill 的流程规则要求通知。

## 支持文件

- `README.md`：快速使用说明
- `rules/message-contract.md`：消息格式、安全和调用契约
- `config.json`：默认配置（已提交）
- `scripts/send-message.js`：实际发送脚本
