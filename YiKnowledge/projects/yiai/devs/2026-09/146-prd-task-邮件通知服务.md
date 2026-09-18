---
doc_type: module
prd_task_id: "YA-09-74"
title: "YA-09-74: 邮件通知服务 — SMTP + Jinja2 模板 + 队列重试 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "146-需求-邮件通知服务.md"
source_okr: [yiai-001]
---

# YA-09-74: 邮件通知服务 — SMTP + Jinja2 模板 + 队列重试 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[146-需求-邮件通知服务.md](../../prds/2026-09/146-需求-邮件通知服务.md)
> 需求编号：YA-09-74 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在企微通知之外增加邮件通道——SMTP 异步发送，Jinja2 模板渲染，失败重试队列。

```python
import aiosmtplib
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates/email"))

async def send_email(to: str, subject: str, template: str, context: dict):
    html = env.get_template(f"{template}.html").render(**context)
    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["To"] = to

    try:
        await aiosmtplib.send(msg, hostname=settings.smtp_host, port=settings.smtp_port,
                              username=settings.smtp_user, password=settings.smtp_password,
                              use_tls=True)
    except Exception:
        await task_queue.submit(send_email, to, subject, template, context)  # 重试
```

### 与企微互补

| 渠道 | 适用场景 | 延迟 |
|------|---------|------|
| 企微 | 紧急告警、实时通知 | < 1s |
| 邮件 | 周报、审计摘要、合规通知 | < 30s |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | aiosmtplib + Jinja2 模板 | 邮件发送成功 | 0.5 |
| 2 | 失败重试队列 + 退订 + 测试 | SMTP 不可用时重试 | 0.5 |

**合计：1.0d**。