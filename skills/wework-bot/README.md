# wework-bot 快速索引

`wework-bot` 用于发送企业微信机器人通知，主要服务 `generate-document` 与 `implement-code` 的监控预警、阶段通知和动态观测。
支持配置多个机器人，并按 agent 名称自动路由。

## 快速开始

本项目已配置好 `config.json`（默认路由配置，已提交）。其中 webhook **优先从 `config.json` 解析**（机器人级 `webhook_url` / `webhook_key`，或通过 `webhook_*_env` 映射到具体环境变量名）；仅在配置缺失时才兜底使用全局环境变量 `WEWORK_WEBHOOK_URL` / `WEWORK_WEBHOOK_KEY*`。

`API_X_TOKEN` 仍只走系统环境变量（不从配置文件读取）。

```bash
export API_X_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

发送消息：

```bash
node .claude/skills/wework-bot/scripts/send-message.js \
  --agent implement-code \
  --content "implement-code 阶段 6 冒烟测试通过" \
  --description "真实页面冒烟测试已通过，关键用户路径可继续进入收尾。" \
  --conclusion "阶段 6 全部 P0 通过，可继续进入收尾" \
  --flow implement-code \
  --feature mermaid-toolbar \
  --stage "阶段 6：冒烟测试" \
  --status "通过" \
  --gate-name "G6 冒烟测试" --gate-result "通过 5 / 失败 0 / 未执行 0" \
  --ai-calls "skills 5 / agents 4 / mcp 1 / tools 9" \
  --call-chain "find-skills→find-agents→test-page-builder→e2e-testing→playwright-mcp×4→code-review→impl-reporter→import-docs→wework-bot" \
  --test-paths "tests/e2e/mermaid-toolbar 6 spec / 3 page，无逸出" \
  --test-stats "spec 6 / case 24 / 通过 24 / 失败 0" \
  --retries "阶段2: 1 轮 / 阶段6: 0 轮" \
  --artifacts "代码 4 / 测试 6 / 文档 1" \
  --metrics "lint 0 / 影响链命中 4" \
  --duration "1h 23m 45s" --started-at "2026-04-25 13:08:15" \
  --token-usage "输入 95k / 输出 8.2k / 合计 103.2k（来源：账单导出）" \
  --report-path "docs/mermaid-toolbar/06_实施总结.md" \
  --diagram-summary "§1 流程图 32 节点 / §2 时序图 11 参与者" \
  --mcp-breakdown "nav 4 / snap 12 / click 6 / eval 8" \
  --backlog "P1 0 项 / P2 2 项（见 §9）" \
  --status-rewrite "01-07 已更新" \
  --impact "关键用户路径已验证，可进入总结和同步" \
  --evidence "tests/e2e/mermaid-toolbar/*.spec.ts" \
  --next-step "进入阶段 7 生成实施总结"
```

正文建议先由 `message-pusher` 整理（先 Plan 再写稿），再交给 `send-message.js` 负责路由与必填字段补齐/校验。

按 agent 自动路由机器人：

```bash
node .claude/skills/wework-bot/scripts/send-message.js \
  --agent security-reviewer \
  --content "security-reviewer 发现安全风险" \
  --description "安全审查发现风险项，需要确认是否阻断发布。"
```

演练不发送（验证参数）：

```bash
node .claude/skills/wework-bot/scripts/send-message.js \
  --content "测试消息" \
  --description "验证企业微信机器人路由和格式，不实际发送。" \
  --dry-run
```

## 文件职责

| 文件                        | 职责                         |
| --------------------------- | ---------------------------- |
| `SKILL.md`                  | 何时使用、输入参数、工作流程 |
| `rules/message-contract.md` | 消息格式、安全和调用契约     |
| `config.example.json`       | 多机器人与 agent 路由示例    |
| `scripts/send-message.js`   | CLI 实现                     |
| `tests/send-message.test.mjs` | `send-message.js` 回归测试（`node:test`，零依赖） |

## 测试

在 skill 根目录执行（不访问真实 API，使用 fixture 与 `--dry-run`）：

```bash
cd .claude/skills/wework-bot && node --test tests/send-message.test.mjs
```

## 常用参数

- **路由**：
  - `--agent`：按 agent 自动路由机器人（推荐）
  - `--config`：可选，指定路由配置文件（默认读取 `WEWORK_BOT_CONFIG`，否则用仓库 `config.json`）
- **正文输入**：
  - `--content, -c`：消息正文（建议由 `message-pusher` 生成）
  - `--content-file, -f`：从文件读取多行正文（推荐）
  - `--description, -d`：必填，100 字以内（也可写在正文 `📝 描述：...` 行）
- **关键上下文（常用）**：
  - `--flow` / `--feature` / `--stage` / `--status`
  - `--impact` / `--evidence` / `--next-step`
  - `--feature-description`：功能一句话描述（会写入 `🧾 功能描述`）
- **会话/链路（建议传）**：
  - `--call-chain`：AI 调用链（会写入 `🔗 调用链`）
  - `--duration` / `--started-at` / `--ended-at`
  - `--token-usage`（或环境变量 `AGENT_SESSION_TOKEN_USAGE`）
- **元信息与调试**：
  - `--model` / `--tools` / `--updated-at`
  - `--dry-run`：演练不发送

其余长尾参数与完整说明请以 `send-message.js --help` 和 `SKILL.md` 为准。

## 消息要求（不提供固定模板）

推送正文不再在本文档提供固定模板，统一由 `message-pusher` 依据本次事实整理生成；`send-message.js` 会确保以下关键信息最终出现在正文中（缺失时注入可核对缺省句）：

- `🏷️ 项目名-功能`
- `🧾 功能描述`
- `🌿 分支`
- `🔗 调用链`
- `🟢 开始时间` / `🔴 结束时间`
- `🤖 模型` / `🧰 工具`
- `👉 下一步`

## 配置说明

配置文件用于 **路由关系 + webhook 解析**（如 `agents` 映射到机器人；机器人支持 `webhook_url` / `webhook_key` 或通过 `webhook_*_env` 指向具体环境变量名）。

本地不落库的密钥仍推荐只用环境变量；不要把真实 webhook/token 提交到仓库。
