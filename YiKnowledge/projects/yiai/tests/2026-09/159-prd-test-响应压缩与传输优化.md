---

doc_type: test
title: 'YA-09-153: 响应压缩与传输优化 — GZip/Brotli 中间件 + 字段裁剪 + ETag 缓存 + 传输指标 — 测试规格'
status: 待开始
priority: P2
owner: 陈铭
roles:
- engineer
- qa
created: 2026-09-11
updated: '2026-09-23'
project: YiAi
project_id: yiai
prd_month: '202609'
prd_task_id: YA-09-153
source_prds:
- 159-需求-响应压缩与传输优化
source_modules: []
source_okr:
- yiai-001

type: test
---

# YA-09-153: 响应压缩与传输优化 — 测试规格

> 来源 PRD：[159-需求-响应压缩与传输优化.md](../../prds/2026-09/159-需求-响应压缩与传输优化.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **压缩中间件**：`src/middleware/cmpress_middleware.py`（新建）— GZip/Brotli 压缩中间件，Accept-Encoding 协商、内容类型感知
- **字段裁剪**：`src/middleware/field_selector.py`（新建）— `?fields=` 查询参数解析，稀疏字段集过滤
- **ETag 缓存**：`src/middleware/etag_middleware.py`（新建）— ETag 生成、`If-None-Match` 检查、304 响应
- **传输指标**：`src/middleware/transport_metrics.py`（新建）— 响应大小、压缩率、命中率采集
- **排除范围**：HTTP/2 HPACK 头压缩（属于反向代理配置），SSL 证书优化

### 测试策略

| 层级 | 策略 | 工具 |
|------|------|------|
| 单元测试 | 压缩函数、字段裁剪逻辑、ETag 哈希生成 | pytest |
| 集成测试 | FastAP

## 二、测试数据 / Fixtures

- `compressed_app` — 测试数据 fixture


## 三、详细测试用例

### TC-01: GZip 压缩——客户端支持
- **P0** | 响应头 `Content-Encoding: gzip` | 响应体被压缩（原始大小 > 压缩后大小）

### TC-02: Brotli 压缩——客户端支持
- **P1** | 响应头 `Content-Encoding: br` | Brotli 压缩比 GZip 更优（相同数据压缩率更高）

### TC-03: 压缩协商——Brotli 优先
- **P1** | 

### TC-04: 客户端不支持压缩
- **P1** | 响应无 `Content-Encoding` 头部 | 响应体为原始 JSON（不压缩）

### TC-05: 小响应体不压缩
- **P1** | 不压缩（响应体太小，压缩开销 > 收益） | 无 `Content-Encoding` 头部

### TC-06: 已压缩格式不二次压缩
- **P1** | 不压缩（内容类型在排除列表中） | `Content-Type: image/png`

### TC-07: 字段裁剪——sparse fields
- **P1** | 每项仅包含 `id` 和 `title`（不含 `content`） | 响应体显著减小

### TC-08: ETag 生成与 304 响应
- **P1** | 状态码 304 Not Modified | 响应体为空（节省带宽）

### TC-09: ETag 数据变更后返回新数据
- **P2** | 

### TC-10: 传输指标采集
- **P2** | `compression_ratio` 可用（大响应压缩率 > 50%） | `bandwidth_saved_bytes` 有正值


## 四、边界与异常测试

### EC-01: 响应体恰好等于压缩阈值
- **步骤**：响应体大小 == 最小压缩阈值（如 1000 字节）
- **预期**：行为一致（无论压缩与否，不崩溃）

### EC-02: 空响应体
- **步骤**：接口返回 `{}`
- **预期**：不压缩（0 字节），正常返回

### EC-03: `fields` 参数包含不存在的字段
- **步骤**：`?fields=id,nonexistent`
- **预期**：返回仅 `id` 字段（忽略不存在字段），不报错

### EC-04: SSE 流式响应不压缩
- **步骤**：SSE `Content-Type: text/event-stream` 请求带 `Accept-Encoding: gzip`
- **预期**：不压缩（SSE 逐事件发送，不适合全文压缩）


## 五、回归测试

### RG-01: 现有客户端不发送 Accept-Encoding，应保持原有行为
- **步骤**：旧客户端发送正常 RPC 请求（无 Accept-Encoding）

### RG-02: RPC 信封 POST / 请求不应被字段裁剪影响
- **步骤**：发送标准 RPC 请求，`?fields=` 参数应被忽略或正常传递


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| TC-10 | 传输指标 | 四、4.4 指标 |
| EC-01~04 | 边界/异常情况 | 七、风险与缓解 |
| RG-01/02 | 向后兼容 | 八、回滚策略 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| Brotli 与 GZip 性能对比 | Brotli 压缩比 GZip 慢 2-3 倍，需基准测试 | 补充 pytest-benchmark 性能对比 |
| HTTP/2 HPACK 头压缩 | FastAPI/uvicorn 配置，非应用层 | 在部署文档中记录 |

*测试规格基于 PRD [159-需求-响应压缩与传输优化.md](../../prds/2026-09/159-需求-响应压缩与传输优化.md) 提取，覆盖 10 个用例 + 4 个边界测试 + 2 个回归测试。*
