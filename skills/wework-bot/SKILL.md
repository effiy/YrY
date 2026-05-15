---
name: wework-bot
description: |
  Send WeChat Work (WeCom) bot messages. Mandatory upon rui
  completion, block, or gate failure.
user_invocable: true
lifecycle: default-pipeline
---

# wework-bot

企业微信机器人通知。**每次使用 rui 技能都必须触发 wework-bot，这是管线完整性的硬性要求。** rui 管线末端强制步骤：自改进 → 追加日志 → 文档同步 → 发送通知。

## 工作流全景

```mermaid
flowchart TB
    RUI["rui 管线完成/阻断/失败"]:::src --> LOG["① 追加日志<br/>--no-send → 00-消息通知列表"]:::step
    LOG --> SYNC["② import-docs 同步"]:::step
    SYNC --> SEND["③ 发送通知<br/>POST 企微"]:::step
    SEND --> DONE["闭环"]:::done

    LOG -.->|"失败/阻断"| SEND

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef step fill:#e3f2fd,stroke:#1565c0;
    classDef done fill:#f3e5f5,stroke:#6a1b9a;
```

| 步骤 | 操作 | 说明 |
|------|------|------|
| ① 追加日志 | wework-bot --no-send | 写入 00-消息通知列表.md，不发 HTTP |
| ② 文档同步 | import-docs --workspace | 推送变更到远端 |
| ③ 发送通知 | wework-bot | POST 企微 webhook |

## 参数

```mermaid
flowchart LR
    subgraph 路由["机器人路由（二选一）"]
        AGENT["--agent &lt;name&gt;<br/>通过 config.agents 路由"]:::param
        ROBOT["--robot &lt;name&gt;<br/>直接指定机器人"]:::param
    end
    subgraph 内容["消息内容（二选一）"]
        TEXT["--content, -c &lt;text&gt;<br/>直接指定正文"]:::param
        FILE["--content-file, -f &lt;path&gt;<br/>从文件读正文"]:::param
    end
    subgraph 标识["故事标识"]
        NAME["--name, -n &lt;story&gt;<br/>{project}-{name} 格式"]:::param
        PROJ["--project, -p &lt;name&gt;<br/>未指定时从 --name 推断"]:::param
    end
    subgraph 模式["发送模式"]
        NOSEND["--no-send<br/>仅追加日志，不发 HTTP"]:::param
    end

    classDef param fill:#e3f2fd,stroke:#1565c0;
```

| 参数 | 描述 | 默认/推断 |
|------|------|---------|
| `--agent <name>` | 通过 config.agents 路由（推荐） | — |
| `--robot <name>` | 直接指定机器人 | — |
| `--project, -p <name>` | 项目名称，消息首行【项目名】 | 从 `--name` 自动推断 |
| `--name, -n <story>` | 故事全名 `{project}-{name}`，分解为日志路径 | — |
| `--content, -c <text>` | 消息正文 | — |
| `--content-file, -f <path>` | 从文件读正文 | — |
| `--no-send` | 仅追加日志，不发送 HTTP | false |

| 环境变量 | 说明 |
|---------|------|
| `API_X_TOKEN` | 必填，仅从环境变量读取 |
| `WEWORK_BOT_API_URL` | 可选，webhook URL 由 config.json 解析 |
| `WEWORK_BOT_CONFIG` | 可选 |

## 消息格式

```mermaid
flowchart TB
    subgraph 结构["消息两层结构"]
        HEADER["【项目名】<br/>首行自动追加"]:::hdr
        SUMMARY["摘要段<br/>emoji 字段 : 值"]:::summary
        SEP["——— 分隔线（至多一条）"]:::sep
        DETAIL["明细段<br/>变更文件列表 · 错误日志"]:::detail
    end
    HEADER --> SUMMARY --> SEP --> DETAIL

    classDef hdr fill:#f3e5f5,stroke:#6a1b9a;
    classDef summary fill:#e3f2fd,stroke:#1565c0;
    classDef sep fill:#eceff1,stroke:#90a4ae;
    classDef detail fill:#fff3e0,stroke:#e65100;
```

纯文本分行，emoji 前缀 + `:` 分隔。禁用 markdown。

### 必含字段（按场景）

```mermaid
flowchart LR
    subgraph 完成["✅ 完成"]
        C1["🎯结论 📝描述 📌范围<br/>👉下一步 🌐影响<br/>📎证据 ⏱️会话"]:::ok
    end
    subgraph 阻断["🚫 阻断"]
        C2["🎯结论 📝描述 📌范围<br/>❌原因 🧭恢复点<br/>🌐影响 📎证据 ⏱️会话"]:::block
    end
    subgraph 门禁["🔍 门禁失败"]
        C3["🎯结论 📝描述 📌范围<br/>🔍门禁 📊结果<br/>🌐影响 📎证据 ⏱️会话"]:::gate
    end

    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef block fill:#ffebee,stroke:#c62828;
    classDef gate fill:#fff3e0,stroke:#e65100;
```

| 场景 | 必含字段 | 特有字段 |
|------|---------|---------|
| 完成 | 🎯结论 📝描述 📌范围 🌐影响 📎证据 ⏱️会话 | 👉下一步 |
| 阻断 | 🎯结论 📝描述 📌范围 🌐影响 📎证据 ⏱️会话 | ❌原因 🧭恢复点 |
| 门禁失败 | 🎯结论 📝描述 📌范围 🌐影响 📎证据 ⏱️会话 | 🔍门禁 📊结果 |

### 格式约束

| # | 规则 | 反例 |
|---|------|------|
| 1 | 每行一个字段，emoji 后 `:` 分隔 | 同一行堆叠多个字段 |
| 2 | 分隔线仅用 `———`，至多一条 | 用 `---` 或 `***` 分隔 |
| 3 | 数字来自执行结果，禁止占位符 | `⏱️ 会话: {duration}` |
| 4 | 全文 ≤ 2000 字 | 超长错误日志全量粘贴 |
| 5 | 明细段：错误日志前 20 行，文件 > 10 个时只列统计 | 50 个文件逐行列出 |

### 示例

```
【YiWeb】
🎯 结论: 完成 YiWeb-user-login 文档管线
📝 描述: 为登录模块生成故事板，覆盖密码登录、短信验证码、OAuth 三种场景
📌 范围: auth/
👉 下一步: 运行 /rui code YiWeb-user-login 开始编码实现
🌐 影响: docs/故事任务面板/YiWeb/user-login/01-故事任务.md
📎 证据: git log --oneline -1
⏱️ 会话: 自适应规划→策展 全流程 3.2min | 3 agents 参与

———

变更文件: docs/故事任务面板/YiWeb/user-login/01-故事任务.md (新增, 285行)
```

## 消息通知列表

```mermaid
flowchart LR
    SEND["wework-bot<br/>--name &lt;project&gt;-&lt;name&gt;"]:::src --> PARSE["分解路径<br/>{project}/{name}/"]:::op
    PARSE --> APPEND["追加写入"]:::op
    APPEND --> FILE["docs/故事任务面板/<br/>{project}/{name}/<br/>00-消息通知列表.md"]:::file

    APPEND -.->|"目录不存在"| MKDIR["自动创建"]:::util

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef file fill:#f3e5f5,stroke:#6a1b9a;
    classDef util fill:#fff3e0,stroke:#e65100;
```

| 项目 | 说明 |
|------|------|
| 触发条件 | 指定 `--name` 时 |
| 写入模式 | 追加（append） |
| 分割线 | `【yyyy-mm-dd hh:mm:ss】` |
| 目录处理 | 不存在时自动创建 |

## API 契约

```mermaid
flowchart LR
    SCRIPT["send-message.js"]:::src --> TOKEN["Header: X-Token<br/>&lt;API_X_TOKEN&gt;"]:::auth
    TOKEN --> POST["POST &lt;WEWORK_BOT_API_URL&gt;"]:::api
    POST --> BODY["Body: webhook_url + content"]:::body
    BODY --> WEWORK["企微机器人"]:::out

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef auth fill:#ffebee,stroke:#c62828;
    classDef api fill:#e3f2fd,stroke:#1565c0;
    classDef body fill:#f3e5f5,stroke:#6a1b9a;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

```
POST <WEWORK_BOT_API_URL>
Headers: X-Token: <API_X_TOKEN>
Body: { "webhook_url": "<from config>", "content": "<message>" }
```

| 要素 | 来源 |
|------|------|
| webhook URL | `config.json` 解析 |
| API_X_TOKEN | 环境变量 |
| content | `--content` / `--content-file` |

## 安全

```mermaid
flowchart LR
    subgraph 禁止["❌ 禁止"]
        X1["Token 提交仓库"]:::block
        X2["webhook URL 提交仓库"]:::block
        X3["日志/回复未脱敏"]:::block
    end
    subgraph 必须["✅ 必须"]
        C1["API_X_TOKEN 仅从环境变量"]:::ok
        C2["webhook URL 从 config.json"]:::ok
    end

    classDef block fill:#ffebee,stroke:#c62828;
    classDef ok fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | P0? |
|---|------|:---:|
| 1 | 禁止提交 token、webhook URL 到仓库 | ✅ |
| 2 | 日志和回复必须脱敏 | ✅ |
| 3 | API_X_TOKEN 仅从环境变量读取 | ✅ |
| 4 | webhook URL 从 config.json 解析 | — |

## 空输入

```mermaid
flowchart TD
    EMPTY["无参数调用"]:::src --> CHECK["检测三项"]:::op
    CHECK --> T1["API_X_TOKEN<br/>是否存在?"]:::check
    CHECK --> T2["config.json<br/>是否配置?"]:::check
    CHECK --> T3["00-消息通知列表.md<br/>是否存在?"]:::check

    T1 & T2 & T3 --> RECOMMEND["推荐任务"]:::out

    subgraph 推荐["推荐场景"]
        R1["配置缺失 → 检查 token/config"]:::rec
        R2["测试验证 → 发送测试消息"]:::rec
        R3["通知补齐 → 补充遗漏通知"]:::rec
        R4["定期巡检 → 检查通知完整性"]:::rec
    end

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef check fill:#fff3e0,stroke:#e65100;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
    classDef rec fill:#fff3e0,stroke:#e65100;
```

无参数时检测 `API_X_TOKEN` / config.json / 故事面板 `00-消息通知列表.md` → 推荐任务，不发送消息。

## 生效标志

```mermaid
flowchart LR
    S1["场景字段齐全<br/>完成/阻断/门禁 必含项到位"]:::sig --> S2["格式合规<br/>纯文本 · emoji:值 · ≤2000字"]:::sig
    S2 --> S3["安全底线<br/>token/webhook 不入库"]:::sig
    S3 --> S4["日志完整<br/>00-消息通知列表 已追加"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| 场景字段齐全 | 补齐缺失字段，重新发送 |
| 格式合规（纯文本 · emoji:值 · ≤2000字） | 修正格式，重新发送 |
| token/webhook 不入库 | 从 git 历史清除，轮换凭据 |
| 00-消息通知列表 已追加 | 补写日志条目 |
