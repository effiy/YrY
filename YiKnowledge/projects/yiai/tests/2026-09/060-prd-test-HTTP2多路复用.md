---

doc_type: test
title: "YA-09-56: 服务端 Connection Keep-Alive 与 HTTP/2 多路复用优化 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-56"
source_prds: ["60-需求-HTTP2多路复用"]
source_modules: ["60-prd-task-HTTP2多路复用"]
source_okr: [yiai-001]

type: test
---

# YA-09-56: HTTP/2 多路复用 — 测试规格

> 来源 PRD：[60-需求-HTTP2多路复用.md](../../prds/2026-09/60-需求-HTTP2多路复用.md)
> 提取日期：2026-09-23

本文档定义 HTTP/2 多路复用与 Keep-Alive 优化的**验证方式**——覆盖连接复用、并发流限制、头部压缩、Server Push 禁用、与 HTTP/1.1 性能对比。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx (http2=True) | YiAi 运行中 | 每次提交 |
| L4 性能 | pytest + h2load | 独立测试环境 | PR / 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | HTTP/2 协议协商（ALPN） | L2 |
| COV-2 | 多路复用——单连接并发多个 stream | L2 |
| COV-3 | 最大并发流限制（SETTINGS_MAX_CONCURRENT_STREAMS=100） | L2 |
| COV-4 | HPACK 头部压缩效果 | L2 |
| COV-5 | Server Push 禁用（安全策略） | L2 |
| COV-6 | HTTP/1.1 Keep-Alive 兼容 | L2 |
| COV-7 | HTTP/2 vs HTTP/1.1 性能对比 | L4 |
| COV-8 | SSE 流在 HTTP/2 下正常工作 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `http2_client` | httpx.AsyncClient(http2=True) | HTTP/2 请求测试 |
| `http1_client` | httpx.AsyncClient(http2=False) | HTTP/1.1 兼容测试 |
| `concurrent_requests` | 50 个并发请求 | 多路复用测试 |
| `large_headers` | 30 个自定义 header（每个 200 字节） | 头部压缩测试 |

---

## 二、测试用例

### 2.1 协议协商与多路复用（COV-1~3 . L2）

> 自动化落点：`tests/integration/test_http2.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-H2-001 | HTTP/2 协商成功 | 1. http2_client GET /health/live | 响应 http_version = "HTTP/2"，状态码 200 | P0 | 待实现 |
| TC-H2-002 | 单连接 50 个并发请求复用 | 1. 同一 client 发送 50 并发请求 | 所有请求通过同一 TCP 连接完成，无需新建连接 | P0 | 待实现 |
| TC-H2-003 | 超过 MAX_CONCURRENT_STREAMS 时排队 | 1. 发送 150 个并发请求（>100） | 不丢弃请求，101-150 等待 stream 释放后执行 | P0 | 待实现 |
| TC-H2-004 | 请求间 stream ID 唯一 | 1. 发送 10 个请求；2. 记录 stream ID | 每个请求分配到唯一 stream ID（1,3,5,... 奇数序列） | P1 | 待实现 |
| TC-H2-005 | HTTP/2 连接最大空闲时间 | 1. 发送请求后等待 30s 不活动；2. 再发送 | 连接保持，复用原连接（无需重新握手） | P1 | 待实现 |

### 2.2 头部压缩与安全（COV-4~5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-H2-006 | HPACK 头部压缩——重复头不重复传输 | 1. 5 次请求带相同 1KB Cookie 头 | 第 2-5 次请求仅传输动态表索引（~2 字节），非完整 Cookie | P0 | 待实现 |
| TC-H2-007 | Server Push 禁用 | 1. GET 页面请求；2. 检查是否有 PUSH_PROMISE 帧 | 无 PUSH_PROMISE 帧（Server Push 已禁用） | P1 | 待实现 |
| TC-H2-008 | 大 header（16KB）在 HTTP/2 下正常 | 1. 发送 16KB 自定义 header | 响应正常（HTTP/2 无 header 大小限制） | P2 | 待实现 |

### 2.3 HTTP/1.1 兼容（COV-6 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-H2-009 | HTTP/1.1 客户端正常访问 | 1. http1_client GET /health/live | HTTP/1.1 200 OK，Connection: keep-alive | P0 | 待实现 |
| TC-H2-010 | 混合协议客户端不互相影响 | 1. http1_client + http2_client 同时请求 | 两协议独立处理，无交叉干扰 | P1 | 待实现 |

### 2.4 性能对比（COV-7 . L4）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-H2-011 | HTTP/2 吞吐量高于 HTTP/1.1 | 1. h2load 100 并发 1000 请求 | HTTP/2 吞吐量 > HTTP/1.1 吞吐量 × 1.5 | P0 | 待实现 |
| TC-H2-012 | HTTP/2 延迟 P99 低于 HTTP/1.1 | 1. 对比两种协议的 P99 延迟 | HTTP/2 P99 < HTTP/1.1 P99（头部压缩 + 队头阻塞消除） | P1 | 待实现 |

### 2.5 SSE 兼容（COV-8 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-H2-013 | SSE 聊天流在 HTTP/2 下正常 | 1. 发送聊天请求；2. 接收 SSE 流 | 流式响应正常，中间无断流 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-H2-EDGE-001 | GOAWAY 帧后优雅关闭 | 1. 服务发送 GOAWAY；2. 客户端处理 | 当前 stream 完成，新建 stream 到新连接 | P1 | 待实现 |
| TC-H2-EDGE-002 | 客户端不支持 HTTP/2 时降级 | 1. 客户端无 ALPN；2. 请求 | 服务端回退到 HTTP/1.1 | P1 | 待实现 |
| TC-H2-EDGE-003 | RST_STREAM 取消请求 | 1. 客户端发送 RST_STREAM；2. 服务端停止处理 | 该 stream 资源释放，其他 stream 不受影响 | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-H2-REG-001 | 缺陷 1：HTTP/2 升级不影响现有 RPC 行为 | 所有 76 个测试在 HTTP/2 下运行 | 全部通过，RPC 信封格式不变 | P0 | 待实现 |
| TC-H2-REG-002 | 缺陷 2：Keep-Alive 连接池不泄漏 | 长时间运行（1h）后检查连接数 | 连接数稳定，无持续增长 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 协议协商 | ALPN 选择 h2 | TC-H2-001 |
| FR-02 多路复用 | 单连接多 stream | TC-H2-002 ~ 004 |
| FR-03 并发限制 | MAX_CONCURRENT_STREAMS=100 | TC-H2-003 |
| FR-04 HPACK 压缩 | 重复头不重复传输 | TC-H2-006 |
| FR-05 Server Push 禁用 | 无 PUSH_PROMISE | TC-H2-007 |
| FR-06 HTTP/1.1 兼容 | 降级 + 混合 | TC-H2-009 ~ 010 |
| FR-07 性能对比 | 吞吐量 + 延迟 | TC-H2-011 ~ 012 |
| FR-08 SSE 兼容 | 流式响应正常 | TC-H2-013 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | HTTP/3 (QUIC) 未测试 | 未来协议演进 | HTTP/3 支持后补充 |
| G-2 | 大文件上传流控（WINDOW_UPDATE）未测试 | 流控影响大文件传输 | 文件上传测试中补充 |
| G-3 | TLS 证书在 HTTP/2 下的行为 | ALPN 依赖 TLS | 在 TLS 测试中验证 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/60-需求-HTTP2多路复用.md`*
