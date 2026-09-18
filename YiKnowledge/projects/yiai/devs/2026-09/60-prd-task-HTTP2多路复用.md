---
doc_type: module
prd_task_id: "YA-09-109"
title: "YA-09-109: HTTP/2 多路复用 — uvicorn 配置 + 连接复用 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "60-需求-HTTP2多路复用.md"
source_okr: [yiai-001]
---

# YA-09-109: HTTP/2 多路复用 — uvicorn 配置 + 连接复用 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[60-需求-HTTP2多路复用.md](../../prds/2026-09/60-需求-HTTP2多路复用.md)
> 需求编号：YA-09-109 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

uvicorn 通过 `--http h2` 启用 HTTP/2，一个 TCP 连接并行处理多个请求，消除 HTTP/1.1 的队头阻塞。

```python
# main.py
uvicorn.run("app:app", host="0.0.0.0", port=10086, http="h2", ssl_keyfile="key.pem", ssl_certfile="cert.pem")
```

### 对比

| 维度 | HTTP/1.1 | HTTP/2 |
|------|---------|--------|
| 并发请求/连接 | 1 (串行) | 多个 (多路复用) |
| 头部压缩 | 否 | HPACK |
| 服务端推送 | 否 | 是 |
| 要求 | 无 | HTTPS 必需 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `http="h2"` + 自签名证书 | 浏览器 DevTools 显示 h2 | 0.25 |
| 2 | 性能基准对比 + 测试 | 并发请求延迟降低 | 0.25 |

**合计：0.5d**。