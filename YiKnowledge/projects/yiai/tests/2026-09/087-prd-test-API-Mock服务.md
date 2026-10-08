---

doc_type: test
title: "YA-09-83: 服务端 API Mock 服务 — 前端独立开发与测试的仿真后端环境 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-83"
source_prds: ["87-需求-API-Mock服务"]
source_modules: ["87-prd-task-API-Mock服务"]
source_okr: [yiai-001]

type: test
---

# YA-09-83: API Mock 服务 — 测试规格

> 来源 PRD：[87-需求-API-Mock服务.md](../../prds/2026-09/87-需求-API-Mock服务.md)

本文档定义 API Mock 服务的**验证方式**——覆盖 Mock 规则匹配、动态字段解析（faker）、Schema 自动生成、延迟/错误模拟、SSE 流、生产环境保护。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx | Mock 服务运行中 (port 10087) | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | responses.yml 规则加载与匹配 | L1 |
| COV-2 | 动态字段解析（{{timestamp}}/{{uuid}}/{{random:*}}） | L1 |
| COV-3 | Schema 自动生成兜底 | L1 |
| COV-4 | 延迟模拟 (delay_ms) | L2 |
| COV-5 | 错误率模拟 (error_rate) | L2 |
| COV-6 | SSE 流式响应模拟 | L2 |
| COV-7 | MOCK_MODE 环境变量切换 | L2 |
| COV-8 | 生产环境保护——MOCK_MODE 默认关闭 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mock_config` | 含 5 个 RPC 方法的 responses.yml | 规则匹配测试 |
| `empty_mock_config` | responses.yml 不存在或为空 | Schema 自动生成兜底 |
| `schema_contracts` | rpc_contracts.json 含 3 个方法定义 | Schema 驱动生成 |
| `mock_client` | httpx.AsyncClient(base_url="http://127.0.0.1:10087") | 集成测试 HTTP 客户端 |

---

## 二、测试用例

### 2.1 Mock 规则匹配（COV-1 . L1）

> 自动化落点：`tests/unit/test_mock_config.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCK-001 | RPC method 精确匹配返回固定响应 | 1. 配置 `query_documents → {total: 42}`；2. 请求该方法 | 返回 mock 数据，code=0 | P0 | 待实现 |
| TC-MCK-002 | 参数匹配区分不同响应 | 1. 配置 `cname=bugs` → bugs mock, `cname=users` → users mock | 按参数区分响应 | P1 | 待实现 |
| TC-MCK-003 | 未匹配规则 + 无 Schema——返回 404 | 1. 请求未配置且无 Schema 的方法 | 404 "No mock rule matched" | P0 | 待实现 |
| TC-MCK-004 | 未匹配规则 + 有 Schema——自动生成 | 1. 请求未配置但 Schema 中存在的方法 | code=0, message 含 "mock generated" | P1 | 待实现 |

### 2.2 动态字段解析（COV-2 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCK-005 | `{{timestamp}}` 解析为当前时间戳 | 1. 模板含 timestamp；2. 3 次请求 | 每次返回当前 Unix 时间戳（递增） | P0 | 待实现 |
| TC-MCK-006 | `{{uuid}}` 每次返回不同 UUID | 1. 模板含 uuid；2. 3 次请求 | 每次 UUID 不同 | P0 | 待实现 |
| TC-MCK-007 | `{{random:int:1:100}}` 范围正确 | 1. 模板含 random:int；2. 100 次请求 | 所有结果在 [1, 100] 内 | P1 | 待实现 |
| TC-MCK-008 | `{{random:email}}` 格式有效 | 1. 模板含 email；2. 10 次请求 | 符合 email 格式，域名互不相同 | P1 | 待实现 |
| TC-MCK-009 | `{{random:str:8}}` 长度固定 | 1. 模板含 8 位随机字符串 | 每次返回 8 位字母数字组合 | P2 | 待实现 |

### 2.3 高级功能（COV-4~6 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCK-010 | 全局延迟 delay_ms=200 | 1. 配置 global.delay_ms=200；2. 发送请求 | 响应耗时 >= 200ms | P1 | 待实现 |
| TC-MCK-011 | 错误率 error_rate=0.5 | 1. 配置 error_rate=0.5；2. 100 请求 | 约 50 个返回 code=9999 模拟错误 | P1 | 待实现 |
| TC-MCK-012 | SSE 流式响应模拟 | 1. 配置 SSE mock 规则；2. 发送请求 | Content-Type: text/event-stream，流式返回 data 块 | P1 | 待实现 |

### 2.4 环境切换（COV-7~8 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCK-013 | MOCK_MODE=true 启动 Mock 服务 | 1. 设置环境变量；2. 启动服务 | 监听端口 10087，/health 返回 status=mock | P0 | 待实现 |
| TC-MCK-014 | 未设置 MOCK_MODE 时不启动 Mock | 1. 未设环境变量；2. 启动主服务 | YiAi 主服务正常启动（无 Mock），Mock 服务未运行 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCK-EDGE-001 | responses.yml 热更新无需重启 | 1. 修改配置文件；2. 下一次请求 | 新配置立即生效 | P2 | 待实现 |
| TC-MCK-EDGE-002 | 模板嵌套引用检测 | 1. 规则 A 引用规则 B，规则 B 引用规则 A | 检测循环引用并报错 | P1 | 待实现 |
| TC-MCK-EDGE-003 | 超大 body (1MB) 模板替换 | 1. 模板含 {{random:str:1048576}} | 替换成功，不 OOM | P2 | 待实现 |
| TC-MCK-EDGE-004 | responses.yml 格式错误 | 1. YAML 语法错误；2. 启动 Mock | 启动时明确报错，指出行号 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-MCK-REG-001 | Mock 响应格式与 RPC 信封一致 | Mock 模式运行全部 76 个现有测试 | 100% 通过，{code, message, data} 格式不破坏 | P0 | 待实现 |
| TC-MCK-REG-002 | Mock 模式不污染真实后端 | Mock 模式下发送的请求 | 不会写入 MongoDB/修改生产数据 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 responses.yml 规则加载 | 精确匹配 + 参数匹配 | TC-MCK-001 ~ 003 |
| FR-02 Schema 自动生成兜底 | 无配置时根据 Schema 生成 | TC-MCK-004 |
| FR-03 动态字段模板 | timestamp/uuid/random/email/str | TC-MCK-005 ~ 009 |
| FR-04 延迟模拟 | delay_ms 可配置 | TC-MCK-010 |
| FR-05 错误率模拟 | error_rate 可配置 | TC-MCK-011 |
| FR-06 SSE 流模拟 | text/event-stream 流式响应 | TC-MCK-012 |
| FR-07 环境变量切换 | MOCK_MODE=true 启用，默认关闭 | TC-MCK-013 ~ 014 |
| FR-08 生产环境保护 | 未设 MOCK_MODE 时 Mock 不可用 | TC-MCK-014 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | Schema 推导复杂类型（嵌套对象/oneOf/allOf）未覆盖 | 复杂 RPC 契约的 Mock 数据可能不准确 | 增加 JSON Schema 复合类型生成测试 |
| G-2 | 前端集成测试（YiVad/YiPet 连接 Mock）未覆盖 | Mock 模式下的前端交互行为未验证 | 在 YiVad/YiPet E2E 测试中添加 MOCK_MODE=true 变体 |
| G-3 | 高并发下 Mock 服务性能 | 1000+ req/s 场景 | 压力测试验证内存/CPU 指标 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/87-需求-API-Mock服务.md`*