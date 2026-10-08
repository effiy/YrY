---

doc_type: test
title: "YA-09-58: 服务端数据序列化协议优化 — MessagePack 与 Protobuf 对比集成 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-58"
source_prds: ["62-需求-序列化协议优化"]
source_modules: ["62-prd-task-序列化协议优化"]
source_okr: [yiai-001]

type: test
---

# YA-09-58: 序列化协议优化 — 测试规格

> 来源 PRD：[62-需求-序列化协议优化.md](../../prds/2026-09/62-需求-序列化协议优化.md)
> 提取日期：2026-09-23

本文档定义序列化协议优化的**验证方式**——覆盖 MessagePack 编码/解码、Content-Type 协商、体积对比、性能基准、JSON 兼容回退。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 运行中 | 每次提交 |
| L4 性能 | pytest + timeit | 无 | PR / 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | MessagePack 编码正确性 | L1 |
| COV-2 | MessagePack 解码正确性 | L1 |
| COV-3 | Content-Type 协商（Accept: application/msgpack） | L2 |
| COV-4 | JSON 回退兼容（无 Accept 头时） | L2 |
| COV-5 | 体积对比：MessagePack vs JSON | L4 |
| COV-6 | 编码/解码性能对比 | L4 |
| COV-7 | datetime/nested 复杂类型支持 | L2 |
| COV-8 | 大响应体（10MB）序列化 | L4 |
| COV-9 | RPC 信封兼容性 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `sample_large_dict` | 含 1000 条记录的 dict | 体积/性能对比 |
| `sample_nested` | 深度嵌套 5 层的 dict（含 datetime/set 等） | 复杂类型序列化 |
| `msgpack_client` | httpx 带 `Accept: application/msgpack` | MessagePack 请求 |
| `json_client` | httpx 带 `Accept: application/json` | JSON 请求 |

---

## 二、测试用例

### 2.1 MessagePack 正确性（COV-1~2 . L1）

> 自动化落点：`tests/unit/test_msgpack_serializer.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SRL-001 | 基本类型编解码往返 | 1. `msgpack.dumps({"a": 1, "b": [2,3]})`；2. `msgpack.loads` | 解码后 `{"a": 1, "b": [2, 3]}`，与输入一致 | P0 | 待实现 |
| TC-SRL-002 | datetime 序列化往返 | 1. `msgpack.dumps({"dt": datetime.now()})`；2. 解码 | datetime 被正确恢复（使用 ext 类型或 Unix ts） | P0 | 待实现 |
| TC-SRL-003 | 深度嵌套结构序列化 | 1. 5 层嵌套 dict；2. 往返 | 嵌套结构完整保留 | P0 | 待实现 |
| TC-SRL-004 | 二进制数据序列化 | 1. `bytes([0x00, 0xFF, 0xAB])` | MessagePack 原生支持 bytes（非 base64） | P1 | 待实现 |
| TC-SRL-005 | UTF-8 中文序列化 | 1. `{"消息": "你好世界"}` | 编码正确，解码还原含中文 | P0 | 待实现 |

### 2.2 Content-Type 协商（COV-3~4 . L2）

> 自动化落点：`tests/integration/test_msgpack_integration.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SRL-006 | Accept: application/msgpack 返回 MessagePack | 1. 请求头 `Accept: application/msgpack` | Content-Type: application/msgpack, 响应体为二进制 MessagePack | P0 | 待实现 |
| TC-SRL-007 | Accept: application/json 返回 JSON | 1. 请求头 `Accept: application/json` | Content-Type: application/json, 响应体为 JSON | P0 | 待实现 |
| TC-SRL-008 | 无 Accept 头时默认返回 JSON | 1. 不设 Accept 头 | Content-Type: application/json（向后兼容） | P0 | 待实现 |
| TC-SRL-009 | Accept: */* 返回 MessagePack（更小体积） | 1. 请求头 `Accept: */*`；2. 服务端偏好 | 服务端选择 MessagePack（更优性能） | P1 | 待实现 |
| TC-SRL-010 | 客户端解码 MessagePack 响应 | 1. 接收 MessagePack bytes；2. msgpack.loads | 得到与 JSON 等效的 dict 数据 | P0 | 待实现 |

### 2.3 性能对比（COV-5~6 . L4）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SRL-011 | 体积——MessagePack 比 JSON 小 20%+ | 1. 1000 条记录分别用两种格式编码 | MessagePack 体积 < JSON 体积 × 0.8 | P0 | 待实现 |
| TC-SRL-012 | 编码速度——MessagePack 比 JSON 快 2x+ | 1. timeit 10000 次编码 | MessagePack 编码速度 > JSON × 2 | P1 | 待实现 |
| TC-SRL-013 | 解码速度——MessagePack 比 JSON 快 2x+ | 1. timeit 10000 次解码 | MessagePack 解码速度 > JSON × 2 | P1 | 待实现 |
| TC-SRL-014 | 10MB 大响应体对比 | 1. 序列化 10MB dict | MessagePack 体积 ~7MB, JSON ~10MB, 编码/解码更快 | P1 | 待实现 |

### 2.4 RPC 兼容性（COV-9 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SRL-015 | RPC 信封在 MessagePack 下正常 | 1. Accept: msgpack；2. POST RPC 请求 | 响应为 MessagePack 格式的 `{code, message, data}` | P0 | 待实现 |
| TC-SRL-016 | SSE 流式响应不使用 MessagePack | 1. 聊天 SSE 请求带 Accept: msgpack | 忽略 Accept 头，使用 text/event-stream | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SRL-EDGE-001 | 超大整数（> 2^63）序列化 | MessagePack 编码大整数 | 正确编码/解码，不溢出 | P2 | 待实现 |
| TC-SRL-EDGE-002 | NaN/Infinity 浮点数处理 | `float('nan')` 和 `float('inf')` | 编码后解码保持 NaN/Inf | P2 | 待实现 |
| TC-SRL-EDGE-003 | 空 dict/list 序列化 | 空数据结构 | 编码体积极小（1-2 字节） | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-SRL-REG-001 | 缺陷 1：JSON RPC 调用行为不变 | 所有现有测试通过 JSON | 100% 通过，JSON 回退正常 | P0 | 待实现 |
| TC-SRL-REG-002 | 缺陷 2：YiVad 前端不受影响 | YiVad 默认发送 JSON | 前端不感知 MessagePack，JSON 正常 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 MessagePack 编解码 | 往返正确 | TC-SRL-001 ~ 005 |
| FR-02 Content-Type 协商 | Accept 头路由 | TC-SRL-006 ~ 010 |
| FR-03 体积优化 | 比 JSON 小 20%+ | TC-SRL-011 |
| FR-04 性能提升 | 编码/解码 2x+ | TC-SRL-012 ~ 014 |
| FR-05 JSON 回退 | 无 Accept 头 → JSON | TC-SRL-008 |
| FR-06 RPC 兼容 | MessagePack RPC 信封 | TC-SRL-015 ~ 016 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | Protobuf 方案对比未测试 | 只实现了 MessagePack | 如需切换，先补充 Protobuf 基准测试 |
| G-2 | 压缩算法叠加（gzip + msgpack）未测试 | 组合效果未知 | 在响应压缩测试中补充 |
| G-3 | 文件上传时请求体 MessagePack 支持 | 当前仅支持响应序列化 | 评估请求体反序列化需求 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/62-需求-序列化协议优化.md`*
