---
name: wework-bot
description: |
  Send WeChat Work (WeCom) bot messages. Mandatory upon rui
  completion, block, or gate failure.
user_invocable: true
lifecycle: default-pipeline
---

# wework-bot

企业微信机器人通知。rui 管线末端强制步骤：自改进 → wework-bot 追加日志 → import-docs → wework-bot 发送。

## 参数

| 参数 | 描述 |
|------|------|
| `--agent <name>` | 通过 config.agents 路由（推荐） |
| `--robot <name>` | 直接指定机器人 |
| `--project, -p <name>` | 项目名称，用于消息首行【项目名】，未指定时从 `--name` 自动推断 |
| `--name, -n <story>` | 故事目录名（含项目前缀，如 `YiWeb-user-login`），用于追加到 `docs/故事任务面板/<name>/00-消息通知列表.md` |
| `--content, -c <text>` | 消息正文 |
| `--content-file, -f <path>` | 从文件读正文 |
| `--no-send` | 仅追加日志，不发送 HTTP |

环境变量：`API_X_TOKEN`(必填), `WEWORK_BOT_WEBHOOK_URL`(必填), `WEWORK_BOT_API_URL`(可选), `WEWORK_BOT_CONFIG`(可选)。

Webhook 路由在 `config.json` 中配置，不通过 CLI 传入。

## 消息格式

纯文本分行，emoji 前缀 + `:` 分隔。禁用 markdown。两层结构：摘要段 + 明细段，`———` 分隔。首行 `【项目名】` 由脚本自动追加。

### 必含字段（按场景）

| 场景 | 必含字段 |
|------|---------|
| 完成 | 🎯结论 📝描述 📌范围 👉下一步 🌐影响 📎证据 ⏱️会话 |
| 阻断 | 🎯结论 📝描述 📌范围 ❌原因 🧭恢复点 🌐影响 📎证据 ⏱️会话 |
| 门禁失败 | 🎯结论 📝描述 📌范围 🔍门禁 📊结果 🌐影响 📎证据 ⏱️会话 |

### 格式约束

- 每行一个字段，emoji 后 `:` 分隔
- 分隔线仅用 `———`（至多一条）
- 数字来自执行结果，禁止占位符
- 全文 ≤2000 字
- 明细段放变更文件列表、错误日志等（错误日志只保留前 20 行，文件>10 个时只列统计）

### 示例

```
【YiWeb】
🎯 结论: 完成 YiWeb-user-login 文档管线
📝 描述: 为登录模块生成故事板，覆盖密码登录、短信验证码、OAuth 三种场景
📌 范围: auth/
👉 下一步: 运行 /rui code YiWeb-user-login 开始编码实现
🌐 影响: docs/故事任务面板/YiWeb-user-login/01-故事任务.md
📎 证据: git log --oneline -1
⏱️ 会话: 自适应规划→策展 全流程 3.2min | 3 agents 参与

———

变更文件: docs/故事任务面板/YiWeb-user-login/01-故事任务.md (新增, 285行)
```

## 消息通知列表

指定 `--name` 时，发送前追加到 `docs/故事任务面板/<name>/00-消息通知列表.md`（`<name>` 已是含项目前缀的完整目录名）。每条消息以 `【yyyy-mm-dd hh:mm:ss】` 分割线分隔。目录不存在时自动创建，文件为追加模式。

## API 契约

```
POST <WEWORK_BOT_API_URL>
Headers: X-Token: <API_X_TOKEN>
Body: { "webhook_url": "<from config>", "content": "<message>" }
```

## 安全

- 禁止提交 token、webhook URL 到仓库
- 日志和回复必须脱敏
- 凭据仅从环境变量读取，不接受 CLI 参数或配置文件

## 空输入

无参数时检测 `API_X_TOKEN` / `WEWORK_BOT_WEBHOOK_URL` / config.json / 故事面板 `00-消息通知列表.md` → 推荐任务（配置缺失/测试验证/通知补齐/定期巡检），不发送消息。
