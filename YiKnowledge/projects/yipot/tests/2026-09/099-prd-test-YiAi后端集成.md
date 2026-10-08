---

doc_type: test
title: "YiAi 后端集成 — 测试方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["98-prd-task-YiAi后端集成.md"]

type: test
---

# YiAi 后端集成 — 测试方案

> 来源 PRD：[53-prd-YiAi后端集成](../../prds/2026-09/53-prd-YiAi后端集成.md)
> 来源 Dev：[98-prd-task-YiAi后端集成](../../devs/2026-09/98-prd-task-YiAi后端集成.md)

---

## 一、测试分层

| 层级 | 工具 | 覆盖范围 |
|------|------|---------|
| L1 单元 | pytest + pytest-asyncio | Provider 适配器、记忆缓存、RPC 路由 |
| L2 集成 | pytest + httpx AsyncClient | 翻译/OCR/TTS/生词本 RPC 端到端 |
| L3 E2E | YiPot 桌面应用 | 前端降级、翻译窗口功能 |
| L4 验收 | 人工 | YiAi 不可达降级、翻译结果一致性 |

## 二、核心功能测试

### 2.1 YiAi 翻译服务

| 编号 | 测试项 | 输入 | 预期结果 | 优先级 |
|------|--------|------|---------|--------|
| TC-YIAI-01 | 单引擎翻译 | `text="Hello", providers=["google"]` | 返回 Google 翻译结果 | P0 |
| TC-YIAI-02 | 多引擎并行 | `providers=["google", "baidu"]` | 同时返回两个结果，总时延 < max(单引擎) | P0 |
| TC-YIAI-03 | SSE 流式翻译 | `provider="openai"` | 返回流式 chunks，首 token < 500ms | P0 |
| TC-YIAI-04 | 翻译记忆缓存 | 同一文本翻译 2 次 | 第 2 次返回 `cached: true`，不调 API | P0 |
| TC-YIAI-05 | 翻译记忆未命中 | 新文本翻译 | `cached: false`，正常调 API | P0 |
| TC-YIAI-06 | Provider 降级 | 单个 Provider 配置错误的 API Key | 仅该 Provider 返回 error，其他正常 | P1 |
| TC-YIAI-07 | 所有 Provider 失败 | 所有 Provider API Key 错误 | 返回全部 error 结果数组，不抛异常 | P1 |
| TC-YIAI-08 | 翻译记录写入 | 翻译后查询 MongoDB | `translation_records` 中有新记录 | P1 |

### 2.2 YiAi OCR 服务

| 编号 | 测试项 | 预期 | P |
|------|--------|------|---|
| TC-OCR-01 | 单引擎 OCR | Baidu OCR 正确识别 base64 图片文字 | P0 |
| TC-OCR-02 | 多引擎并行 | Baidu + Tencent 同时返回结果 | P1 |
| TC-OCR-03 | 无效 base64 | 返回 `error` 字段而非 500 | P1 |

### 2.3 前端降级

| 编号 | 测试项 | 操作 | 预期结果 | P |
|------|--------|------|---------|---|
| TC-FE-01 | YiAi 可达 | 正常翻译 | 请求发到 `localhost:10086` | P0 |
| TC-FE-02 | YiAi 不可达 | 关闭 YiAi → 翻译 | 自动降级到直接 API 调用，翻译正常完成 | P0 |
| TC-FE-03 | 降级后恢复 | 重启 YiAi → 翻译 | 自动恢复到 RPC 路径 | P1 |
| TC-FE-04 | 传统引擎不变 | Google/Baidu 翻译 | 保持原有直接调用路径 | P0 |

## 三、边界与异常测试

| 编号 | 测试项 | 场景 | 预期结果 | P |
|------|--------|------|---------|---|
| TC-EDGE-01 | 空文本 | `text=""` | 参数验证拒绝，返回 code 1001 | P1 |
| TC-EDGE-02 | 超长文本 | `text=5000字` | 正常翻译或截断 | P1 |
| TC-EDGE-03 | 未知 Provider | `providers=["nonexist"]` | 返回 error 提示 Provider 不存在 | P2 |
| TC-EDGE-04 | YiAi 超时 | 模拟 15s+ 延迟 | 前端 AbortSignal 取消，自动降级 | P1 |
| TC-EDGE-05 | 记忆缓存并发 | 10 并发请求同一文本 | 仅 1 次 API 调用，其余命中缓存 | P2 |
| TC-EDGE-06 | 连接池耗尽 | 100 并发翻译请求 | 排队不报错，逐步完成 | P2 |
| TC-EDGE-07 | MongoDB 不可用 | 关闭 MongoDB → 翻译 | 降级跳过记忆缓存，仍正常翻译 | P1 |
| TC-EDGE-08 | RAG 服务不可用 | RAG 查询超时 | 降级为普通翻译，不含领域上下文 | P2 |

## 四、性能基准测试

| 编号 | 场景 | 指标 | 基准值 | 劣化阈值 |
|------|------|------|--------|---------|
| TC-PERF-01 | RPC 分发开销 | YiAi 收到请求到调用 Provider | < 5ms | > 20ms |
| TC-PERF-02 | 记忆缓存查询 | MongoDB 单文档查询 | < 50ms | > 100ms |
| TC-PERF-03 | 并行翻译 (3 引擎) | 总时延 | < max(单引擎) + 50ms | > max(单引擎) + 200ms |
| TC-PERF-04 | Provider 懒加载 | 首次 Provider 初始化 | < 100ms | > 500ms |
| TC-PERF-05 | 连接池复用 | 第 2+ 次 HTTP 请求 | 比首次快 ~100ms (无 TCP 握手) | — |
| TC-PERF-06 | 前端 RPC 调用 | 请求到响应 | YiAi overhead < 50ms | > 150ms |

## 五、安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | P |
|------|--------|---------|---------|---|
| TC-SEC-01 | API Key 不暴露到前端 | 检查 Network 请求体 | Provider 配置仅在 YiAi 端，前端请求不含 API Key | P0 |
| TC-SEC-02 | 输入校验 | 发送 `text` 含 SQL/XSS payload | 参数层校验拒绝或转义 | P1 |
| TC-SEC-03 | RPC 未认证访问 | 不带 Token 调用翻译 RPC | 可选认证（当前默认允许，后续可开启） | P2 |
| TC-SEC-04 | 日志不含 API Key | 检查 YiAi 日志 | 日志中 API Key 被脱敏 (mask) | P1 |
| TC-SEC-05 | 记忆缓存不含 API Key | 查询 MongoDB translation_memory | 无 Provider 配置字段 | P1 |

## 六、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 优先级 |
|------|---------|---------|--------|
| REG-01 | YiAi 单引擎翻译正常 | RPC 链路 | P0 |
| REG-02 | 前端降级到直接 API 调用 | 降级策略 | P0 |
| REG-03 | 翻译记忆缓存命中 | 缓存命中 | P0 |
| REG-04 | 多引擎并行翻译 | 并行调度 | P0 |
| REG-05 | 传统引擎不受影响 | 向后兼容 | P0 |
| REG-06 | pnpm build 通过 | 构建完整性 | P0 |
| REG-07 | 翻译结果与原 YiPot 一致 | 结果一致性 | P1 |
| REG-08 | Haskell/TTS/生词本功能不减 | 功能完整性 | P1 |

## 七、参考文档

- PRD: [53-prd-YiAi后端集成](../../prds/2026-09/53-prd-YiAi后端集成.md)
- Dev: [98-prd-task-YiAi后端集成](../../devs/2026-09/98-prd-task-YiAi后端集成.md)
- 翻译核心测试: [01-prd-test-翻译核心](./001-prd-test-翻译核心.md)
- 翻译服务接口测试: [04-prd-test-翻译服务接口](./004-prd-test-翻译服务接口.md)