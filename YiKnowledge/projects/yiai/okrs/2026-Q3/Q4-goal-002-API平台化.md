---
type: okr-goal
id: yiai-q4-002
title: "API 平台化与开发者体验"
status: planned
period: "2026 Q4"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 15
updated: 2026-09-23
kr1: "OpenAPI 文档自动生成 — 从路由/Model 自动生成 OpenAPI 3.1 spec + Swagger UI，端点覆盖率 40% → 100%"
kr1_completion: 10
kr2: "API 版本化策略 — `/v1/` `/v2/` 路由前缀 + 灰度发布 + Sunset 废弃策略"
kr2_completion: 5
kr3: "智能限流 — 双重令牌桶嵌套配额（用户级 + 端点级）+ 自适应速率限制，误拦率 <1%"
kr3_completion: 20
kr4: "SDK 自动生成 — TypeScript SDK（YiVad/YiPet 用）+ Python SDK（外部用），覆盖 90% 端点"
kr4_completion: 0
kr5: "API 调试控制台 — YiVad 内置 API Console，请求构造/响应查看/Token 管理"
kr5_completion: 0
metric1_id: "yiai-q4-m04"
metric1_desc: "API 端点文档覆盖率"
metric1_current: "40%"
metric1_target: "100%"
metric2_id: "yiai-q4-m05"
metric2_desc: "SDK 覆盖的 API 端点比例"
metric2_current: "0%"
metric2_target: "90%"
metric3_id: "yiai-q4-m06"
metric3_desc: "限流误拦率"
metric3_current: "5%"
metric3_target: "<1%"
related_prds:
  - projects/yiai/prds/2026-Q4/02-需求-API平台化.md
  - projects/yiai/prds/2026-09/16-需求-API限流与并发控制.md
  - projects/yiai/prds/2026-09/30-需求-API网关.md
  - projects/yiai/prds/2026-09/34-需求-API版本管理.md
  - projects/yiai/prds/2026-09/56-需求-中间件管道编排.md
  - projects/yiai/prds/2026-09/72-需求-响应格式协商.md
  - projects/yiai/prds/2026-09/130-需求-双重令牌桶嵌套配额.md
  - projects/yiai/prds/2026-09/140-需求-API文档自动生成.md
  - projects/yiai/prds/2026-09/153-需求-API版本化策略.md
  - projects/yiai/prds/2026-09/204-需求-API速率限制策略.md
---

# API 平台化与开发者体验

> Q4 平台化目标。将 YiAi 从"内部后端服务"升级为"API 平台"——自动生成文档、标准化版本管理、智能限流、多语言 SDK，使外部开发者和内部前端团队都能高效接入。新开发者接入时间从 3 天降至 0.5 天。

---

## 背景

YiAi 的 18 个路由模块通过 RPC 信封暴露了 100+ 个方法，但 API 文档、版本管理、限流三个维度的缺失导致开发体验严重不足：

**文档依赖口口相传**：当前无自动生成的 API 文档。前端团队（YiVad/YiPet）需要阅读源码确认接口参数——`data_service.query_documents` 接受的参数名是 `filter` 而非 `query`，这类契约信息仅存在于 Python 函数签名中。新前端开发者接入 YiAi 平均需要 3 天——1 天读 CLAUDE.md + 2 天读源码。

**无版本管理导致破坏性变更不可控**：RPC 方法签名变更（如 `query_documents` 新增必填参数）直接导致前端调用失败。无灰度发布机制——变更要么全量上线（风险高），要么不敢改（技术债累积）。Q3 期间 RPC 参数白名单校验的部署被拆为三个阶段（WARNING → 白名单 → 严格模式），正是因为缺乏 API 版本化支持。

**限流粗放且误拦率高**：当前限流基于 `slowapi` + IP 维度，所有端点共享一个速率限制。AI 聊天端点（单次调用 5-30s）和数据查询端点（<50ms）使用同样的限流规则——聊天用户被误拦的投诉占所有限流相关反馈的 70%。

**手写 API 层脆弱**：YiVad 的 `api/modules/*` 和 YiPet 的 `ApiClient` 均为手写，37 个模块共 800+ 行样板代码。每次后端接口变更需要同步修改 2-3 个前端项目，参数名不匹配（`query`/`filter`）是最常见的跨项目 bug。

Q4 围绕 OpenAPI 3.1 标准建立完整的 API 平台能力，将 RPC 信封的内部协议对外标准化。

---

## 季度演进

### 十月 — OpenAPI 文档 + 限流升级

**OpenAPI 文档自动生成**（KR1）：
- 从 FastAPI 路由装饰器和 Pydantic Model 自动提取端点元数据（路径/方法/参数/响应 Schema）
- RPC 信封端点特殊处理：扫描 `services/` 目录，从函数签名 + docstring 生成 RPC method 的 OpenAPI Operation
- 提供 Swagger UI（`/docs`）和 ReDoc（`/redoc`）
- 前端 CI 集成：`pnpm openapi-gen` 从 `/openapi.json` 生成 TypeScript 类型定义

**双重令牌桶限流**（KR3）：
- 实现用户级 + 端点级嵌套限流：`src/services/gateway/rate_limiter.py`
- 用户级：每用户全局 QPS 配额（默认 50 QPS）
- 端点级：按端点特性差异化（`/chat/stream` 10 QPS，`/data/query` 100 QPS）
- 自适应调整：根据服务负载（连接池利用率、LLM 并发数）动态收紧/放松限制

### 十一月 — API 版本化 + SDK 生成

**API 版本化**（KR2）：
- `/v1/` `/v2/` 路由前缀 + 内部版本路由表
- 灰度发布：`config.yaml` 的 `api.version_routing` 控制流量分配（v1: 90% / v2: 10%）
- Sunset 策略：废弃版本在响应头注入 `Sunset: <date>` + `Deprecation: true`，3 个月过渡期后下线
- 版本兼容性检测：CI 中对比新/旧版本 OpenAPI spec，标记 breaking changes

**SDK 自动生成**（KR4）：
- 从 OpenAPI spec 自动生成：
  - TypeScript SDK：`@yiai/sdk` npm 包，供 YiVad/YiPet 使用，替代手写 `api/modules/*`
  - Python SDK：`yiai-client` pip 包，供外部调用方使用
- SDK 特性：类型安全、自动重试、超时配置、TraceID 传播

### 十二月 — API Console + 完善

- **API 调试控制台**（KR5）：YiVad 内置的 API Console，支持请求构造（JSON 编辑器 + 参数提示）、响应查看（格式化 JSON + TraceID 链接）、Token 管理（生成/刷新/过期时间）
- **API 网关中间件管道**（KR2 延续）：统一中间件管道编排（限流 → 认证 → 参数校验 → 版本路由 → 日志 → TraceID），通过 `config.yaml` 配置管道顺序
- **开发者门户**：YiVad 的 `/developer` 页面聚合文档、SDK、Console、变更日志（Changelog）

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | OpenAPI 文档自动生成 — 100% 端点覆盖 + Swagger UI 可交互 | 10% |
| KR2 | API 版本化 — `/v1/` `/v2/` + 灰度 + Sunset + 兼容性检测 | 5% |
| KR3 | 智能限流 — 双重令牌桶 + 自适应 + 误拦率 <1% | 20% |
| KR4 | SDK 自动生成 — TS + Python，覆盖 90% 端点 | 0% |
| KR5 | API 调试控制台 — YiVad 内置请求构造 + 响应查看 + Token 管理 | 0% |

---

## KR1 — OpenAPI 文档自动生成

### 现状

40% 的端点（主要是 `/read-file`、`/write-file` 等直接路由）通过 FastAPI 自带的 OpenAPI 有基本文档。但 60% 的 RPC 端点（`POST /` 动态分发）在 Swagger UI 中仅显示为 `POST / Recv String`——参数、响应 Schema、错误码均不可见。

### 方案

**双路径文档生成**（`src/server/openapi.py`）：

**路径 1 — 直接路由端点**（`/read-file`、`/write-file`、`/rag/*`、`/knowledge/*` 等）：
- 利用 FastAPI 原生 `app.openapi()`，增强 Pydantic Model 的 `Field(description=...)` 和 `example=...`
- 补充 `responses` 字典：每个端点声明 4xx/5xx 响应的 Schema

**路径 2 — RPC 信封端点**（`POST /`）：
- 自定义 `custom_openapi()` 函数扫描 `src/services/` 目录
- 对每个 `module_name.method_name` 组合，解析函数签名（`inspect.signature`）+ docstring（`inspect.getdoc`）
- 生成虚拟 OpenAPI path item：`POST /rpc/{module_name}/{method_name}`
- docstring 中的 `:param` / `:return` / `:raises` 标签映射为 parameters / responses / error codes

**前端 CI 集成**：
```bash
# YiVad package.json
"openapi-gen": "openapi-typescript http://localhost:10086/openapi.json -o src/api/types.generated.ts"
```

替换手写 `RequestHttp` 中的 `any` 类型为自动生成的强类型接口。

### 验证

- 访问 `http://localhost:10086/docs` → Swagger UI 列出所有端点（含 RPC 方法）
- 选择一个 RPC 方法 → 显示参数 Schema、响应示例、错误码说明
- `pnpm openapi-gen` → `types.generated.ts` 生成成功 → `vue-tsc --noEmit` 通过

---

## KR2 — API 版本化

### 现状

无版本管理。所有变更直接作用于生产路径——破坏性变更和向后兼容变更没有区分机制。

### 方案

**版本路由**（`src/server/versioning.py`）：

```
URL 策略：/v1/rpc  /v2/rpc  /v1/read-file  /v2/read-file
内部映射：
  /v1/* → src/server/routes/ (当前实现)
  /v2/* → src/server/routes_v2/ (新版本，渐进迁移)
```

**灰度发布**（`src/server/middleware/version_router.py`）：
```yaml
# config.yaml
api:
  version_routing:
    default: "v1"
    experiments:
      - path: "/rpc/services.data.data_service.query_documents"
        v2_weight: 10  # 10% 流量到 v2
      - path: "/rpc/services.ai.chat_service.chat"
        v2_weight: 0   # 还未迁移
```

响应头注入 `X-API-Version: v1` / `X-API-Version: v2`，前端可通过 response header 确认版本。

**Sunset 废弃策略**：
- 废弃版本返回 `Sunset: Sat, 01 Mar 2027 00:00:00 GMT` + `Deprecation: true`
- 废弃前 3 个月：响应头告警 → 1 个月：`Warning` 头 + 企微通知 → 下线

**版本兼容性检测**（CI）：
```bash
# 对比 v1 和 v2 的 OpenAPI spec
python scripts/check_api_compatibility.py --old openapi_v1.json --new openapi_v2.json
# 输出 breaking changes 列表（删除字段、新增必填参数、类型变更）
```

### 验证

- 部署 v2 灰度 10% → 10% 请求路由到 v2，响应头 `X-API-Version: v2`
- Breaking change 检测 CI 步骤 → 新增必填参数被标记为 `ERROR: breaking change`
- Sunset header 注入 → `curl -I` 可见 `Sunset: <date>` 和 `Deprecation: true`

---

## KR3 — 智能限流

### 现状

`slowapi` + IP 维度限流。所有端点共享 100 req/min 限制。问题：
- 聊天端点（单次 5-30s）和数据查询（<50ms）混用同一限制——聊天用户 3 个并发即触发限流
- IP 维度无法区分用户——同一公司出口 IP 下所有用户共享配额
- 误拦率约 5%（正常用户被限流）

### 方案

**双重令牌桶**（`src/services/gateway/rate_limiter.py`）：

```
请求到达
  → 用户级令牌桶（每用户 50 QPS）— 使用 X-Token 识别
  → 端点级令牌桶（按端点特性差异化）
     /chat/stream:  10 QPS（长连接，消耗大）
     /data/query:   100 QPS（短查询）
     /rpc/*:        30 QPS（通用 RPC）
     /rag/*:        20 QPS（LLM 推理消耗）
  → 自适应调整：连接池利用率 >80% → 所有限流收紧 30%
```

**自适应速率限制**（`src/services/gateway/adaptive_limiter.py`）：
- 每 30s 采样服务健康指标（连接池利用率、LLM 并发数、平均延迟）
- 健康 → 默认配额；警告 → 配额 × 0.7；危险 → 配额 × 0.4
- 恢复：健康指标回归正常后，配额线性恢复（每分钟 +10%）

**响应增强**：
- 限流响应：`429 Too Many Requests` + `Retry-After: 5` + `X-RateLimit-Remaining: 0`
- 预判响应头：`X-RateLimit-Limit: 50` / `X-RateLimit-Remaining: 42` / `X-RateLimit-Reset: 1696123456`

### 验证

- 单个用户并发 60 QPS → 第 51 个请求返回 429 + `Retry-After`
- 同时用不同 Token 调用 → 每个 Token 独立 50 QPS 配额
- 连接池利用率提升至 85% → 限流自动收紧，响应头 `X-RateLimit-Limit` 从 50 降为 35

---

## KR4 — SDK 自动生成

### 现状

YiVad 的 `api/modules/*`（37 个文件、800+ 行）和 YiPet 的 `ApiClient`（200+ 行）都是手写。每次后端接口变更，需要同步修改 TypeScript 类型定义和 API 调用代码。参数名不匹配是最常见的跨项目 bug。

### 方案

**TypeScript SDK**（`@yiai/sdk`）：

从 OpenAPI spec 通过 `openapi-typescript` + 自定义模板生成：

```typescript
// 生成的 SDK（替代手写 api/modules/data.ts）
import { YiAiClient } from '@yiai/sdk';

const client = new YiAiClient({ baseUrl: 'http://localhost:10086', token: 'xxx' });

// 类型安全的 RPC 调用
const result = await client.data.queryDocuments({
  cname: 'sessions',
  filter: { status: 'active' },  // ← TypeScript 编译期校验参数名
  pageNum: 1,
  pageSize: 20,
});
// result 类型：{ code: number; message: string; data: { items: Session[]; total: number } }
```

**Python SDK**（`yiai-client` pip 包）：

```python
from yiai_client import YiAiClient

client = YiAiClient(base_url="http://localhost:10086", token="xxx")
result = await client.data.query_documents(
    cname="sessions",
    filter={"status": "active"},
    page_num=1,
    page_size=20,
)
```

**自动化发布**：GitHub Actions 在 YiAi main 分支更新后 → 生成 SDK → 发布到 npm/PyPI → 自动创建 PR 更新 YiVad/YiPet 的依赖版本。

### 验证

- `npm install @yiai/sdk` → YiVad 中替换手写 `api/modules/data.ts` → `vue-tsc --noEmit` 通过
- 后端删除 `query_documents` 的一个可选参数 → SDK 自动更新类型 → YiVad CI 报 TypeScript 编译错误（预防性发现）

---

## KR5 — API 调试控制台

### 现状

开发者调试 API 使用 curl 或 Postman，需要手动拼装 RPC 信封 JSON、管理 Token、查看响应。切换不同 API 需要重新构造请求体。无历史记录。

### 方案

YiVad 新增 `/developer/api-console` 页面（`src/views/developer/ApiConsole.vue`）：

**功能**：
- **请求构造**：JSON 编辑器（Monaco Editor）+ 参数自动补全（从 OpenAPI spec 获取参数 Schema）
- **响应查看**：格式化 JSON + 语法高亮 + TraceID 链接（点击跳转 Jaeger）
- **Token 管理**：生成/刷新/过期显示，多 Token 切换（开发/测试/生产）
- **历史记录**：最近 50 条请求，可重新发送
- **代码片段生成**：curl / TypeScript / Python 三种语言

**技术实现**：
- Monaco Editor 组件（`@monaco-editor/vue`）+ JSON Schema 校验
- OpenAPI spec 缓存到 `localStorage`（每 5min 刷新）
- 请求通过 YiVad 的 `RequestHttp` 代理（复用 Token 注入和错误处理）

### 验证

- 打开 `/developer/api-console` → 左侧端点列表（从 OpenAPI spec 生成）→ 选择 `data_service.query_documents`
- 编辑参数 JSON → Monaco Editor 实时校验（字段名不匹配时红色波浪线）
- 发送请求 → 右侧显示格式化响应 + 顶部 TraceID 链接

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| OpenAPI spec 从 RPC 函数签名生成不准确 | 中 | 中 | 补充 docstring 规范，CI 校验 spec 完整性 |
| SDK 生成覆盖不足（泛型/联合类型） | 中 | 中 | 手写补充核心模块的类型定义，SDK 生成 90% 覆盖即可 |
| 限流收紧影响正常用户 | 中 | 高 | 自适应调整以 30% 为步进，误拦率监控 + 自动回滚 |
| API 版本化导致路由复杂度爆炸 | 低 | 中 | 最多同时维护 2 个活跃版本，旧版本 3 个月后强制下线 |
| YiVad API Console 开发资源不足 | 中 | 低 | Phase 1 仅实现基础版（请求构造 + 响应查看），高级功能 Phase 2 |

---

## 交付里程碑

| 月份 | 里程碑 | 关键交付 |
|------|--------|---------|
| 10月第1周 | 双重令牌桶限流上线 | `rate_limiter.py` + `adaptive_limiter.py` |
| 10月第2周 | OpenAPI spec 自动生成 v1 | `openapi.py` + Swagger UI `/docs` |
| 10月第3周 | RPC 方法的 OpenAPI Operation | docstring 解析 + 虚拟 path item 生成 |
| 10月第4周 | 限流自适应调整 + 前端类型生成 | `openapi-typescript` 集成 YiVad CI |
| 11月第1周 | API 版本化路由 `/v1/` `/v2/` | `version_router.py` + 灰度配置 |
| 11月第2周 | Sunset 废弃策略 + 兼容性检测 CI | `check_api_compatibility.py` |
| 11月第3周 | TypeScript SDK v1 发布 | `@yiai/sdk` npm 包 |
| 11月第4周 | Python SDK v1 发布 | `yiai-client` pip 包 |
| 12月第1周 | API Console v1（YiVad） | 请求构造 + 响应查看 + Token 管理 |
| 12月第2周 | YiVad 手写 API 层迁移至 SDK | 37 个模块逐批替换 |
| 12月第3周 | 中间件管道编排 | 统一管道配置（限流→认证→校验→版本→日志） |
| 12月第4周 | 开发者门户上线 | YiVad `/developer` 页面聚合 |

---

## 影响

| 维度 | Q3 现状 | Q4 目标 |
|------|--------|--------|
| API 文档 | 源码即文档，新开发者读 3 天 | Swagger UI + ReDoc，0.5 天可调用 |
| API 版本管理 | 无版本，变更即上线 | `/v1/` `/v2/` + 灰度 + Sunset |
| 限流粒度 | IP 级，全端点共享 100/min | 用户级 + 端点级，误拦率 <1% |
| 前端 API 层 | 手写 37 个模块 800+ 行 | SDK 自动生成，类型安全 |
| 开发调试 | curl + Postman | YiVad API Console |
| 新开发者接入 | 3 天 | 0.5 天 |

---

## 未竟事项（Q1 2027 展望）

| 事项 | Q1 归属 |
|------|---------|
| API 网关独立部署（Kong/APISIX） | K8s 迁移项目 |
| SDK 多语言扩展（Go/Java） | 外部集成需求驱动 |
| API Analytics（调用量趋势/用户行为分析） | 可观测性 + 数据平台专项 |
| GraphQL 查询接口（替代部分 RPC 查询） | YA-08-M01 延续 |