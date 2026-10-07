---

doc_type: test
title: "YA-09-68: 服务端 API 响应格式协商 — JSON/XML/YAML 多格式 Content Negotiation — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-68"
source_prds: ["72-需求-响应格式协商"]
source_modules: ["72-prd-task-响应格式协商"]
source_okr: [yiai-001]

type: test
---

# YA-09-68: 响应格式协商 — 测试规格

> 来源 PRD：[72-需求-响应格式协商.md](../../prds/2026-09/72-需求-响应格式协商.md)

本文档定义 API 响应格式协商的**验证方式**——覆盖 Accept 头解析、JSON/XML/YAML 格式输出、默认 JSON、格式质量权重、不支持格式处理。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | Accept: application/json → JSON | L2 |
| COV-2 | Accept: application/xml → XML | L2 |
| COV-3 | Accept: application/yaml → YAML | L2 |
| COV-4 | 无 Accept 头 → 默认 JSON | L2 |
| COV-5 | 质量权重 q 参数处理 | L1 |
| COV-6 | 不支持格式 → 406 Not Acceptable | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `rpc_response` | `{code: 0, message: "ok", data: {items: [...]}}` | 通用 RPC 响应 |
| `accept_headers` | JSON/XML/YAML 各 Accept 头 | 格式协商 |

---

## 二、测试用例

### 2.1 格式输出（COV-1~4 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FMT-001 | Accept: application/json 返回 JSON | 1. 请求头 Accept: application/json | Content-Type: application/json，body 为 JSON | P0 | 待实现 |
| TC-FMT-002 | Accept: application/xml 返回 XML | 1. 请求头 Accept: application/xml | Content-Type: application/xml，body 为 XML | P1 | 待实现 |
| TC-FMT-003 | Accept: application/yaml 返回 YAML | 1. 请求头 Accept: application/yaml | Content-Type: application/yaml，body 为 YAML | P1 | 待实现 |
| TC-FMT-004 | 无 Accept 头默认 JSON | 1. 不设 Accept 头 | Content-Type: application/json（向后兼容） | P0 | 待实现 |
| TC-FMT-005 | Accept: */* 返回 JSON（默认首选） | 1. Accept: */* | 返回 JSON | P0 | 待实现 |
| TC-FMT-006 | JSON 响应格式正确（RPC 信封） | 1. 检查 JSON 结构 | `{code, message, data}` 格式不变 | P0 | 待实现 |
| TC-FMT-007 | XML 响应包含 RPC 信封 | 1. 获取 XML 响应 | `<response><code>0</code><message>ok</message><data>...</data></response>` | P1 | 待实现 |
| TC-FMT-008 | YAML 响应可解析 | 1. 获取 YAML 响应；2. yaml.safe_load | 解析成功，字段与 JSON 一致 | P1 | 待实现 |

### 2.2 质量权重（COV-5 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FMT-009 | Accept: application/xml;q=0.9, application/json;q=1.0 | 1. 解析 Accept 头 | 选择 JSON（q=1.0 > 0.9） | P1 | 待实现 |
| TC-FMT-010 | 多个格式无 q 参数默认 q=1.0 | 1. `Accept: text/html, application/json` | 按声明顺序选择第一个支持格式 | P2 | 待实现 |

### 2.3 不支持格式（COV-6 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FMT-011 | Accept: text/html 返回 406 | 1. 请求 HTML 格式 | HTTP 406 Not Acceptable，不支持 HTML | P0 | 待实现 |
| TC-FMT-012 | 所有 Accept 格式都不支持 → 406 | 1. `Accept: image/png, text/html` | HTTP 406 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FMT-EDGE-001 | Accept 头为空字符串 | 1. `Accept: ""` | 默认 JSON | P1 | 待实现 |
| TC-FMT-EDGE-002 | 超长 Accept 头（100 个格式） | 1. 100 个逗号分隔的 Accept 值 | 性能正常，不 OOM | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-FMT-REG-001 | 缺陷 1：JSON 默认行为不变 | 所有现有测试通过 | 100% 通过（默认 JSON 不受影响） | P0 | 待实现 |
| TC-FMT-REG-002 | 缺陷 2：SSE 响应不受格式协商影响 | 聊天 SSE 请求 | 始终返回 text/event-stream | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 JSON 输出 | Accept: application/json | TC-FMT-001, 006 |
| FR-02 XML 输出 | Accept: application/xml | TC-FMT-002, 007 |
| FR-03 YAML 输出 | Accept: application/yaml | TC-FMT-003, 008 |
| FR-04 默认格式 | 无 Accept → JSON | TC-FMT-004 ~ 005 |
| FR-05 质量权重 | q 参数处理 | TC-FMT-009 ~ 010 |
| FR-06 不支持格式 | 406 错误 | TC-FMT-011 ~ 012 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | Protobuf/MessagePack 二进制格式 | 需单独序列化层 | 已在序列化协议优化中测试 |
| G-2 | CSV/TSV 表格格式输出 | 数据分析场景 | 按需补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/72-需求-响应格式协商.md`*
