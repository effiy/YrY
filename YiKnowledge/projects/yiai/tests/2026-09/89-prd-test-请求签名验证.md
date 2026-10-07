---

doc_type: test
title: "YA-09-85: 服务端请求体签名验证 — HMAC 防篡改与重放攻击保护 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-85"
source_prds: ["89-需求-请求签名验证"]
source_modules: ["89-prd-task-请求签名验证"]
source_okr: [yiai-001]

type: test
---

# YA-09-85: 请求签名验证 — 测试规格

> 来源 PRD：[89-需求-请求签名验证.md](../../prds/2026-09/89-需求-请求签名验证.md)

本文档定义 HMAC-SHA256 请求签名验证的**验证方式**——覆盖签名生成/验证往返、防篡改、Nonce 防重放、时间戳时效性、内网跳过、中间件执行顺序。

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
| COV-1 | HMAC-SHA256 sign/verify 往返 | L1 |
| COV-2 | 签名不匹配拒绝 | L1 |
| COV-3 | 篡改 body 检测 | L1 |
| COV-4 | Nonce 防重放 (is_valid_and_store) | L1 |
| COV-5 | Nonce 过期清理 | L1 |
| COV-6 | Timestamp 5 分钟窗口验证 | L1 |
| COV-7 | 中间件——内网 IP 跳过 | L2 |
| COV-8 | 中间件——skip_paths 跳过 | L2 |
| COV-9 | 中间件——签名头部缺失返回 401 | L2 |
| COV-10 | compare_digest 防时序攻击 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `signer` | HMACSigner(secret="test_secret_key") | 签名生成/验证 |
| `nonce_store` | NonceStore(window_seconds=300) | Nonce 存储 |
| `valid_payload` | `{"module_name":"svc","method_name":"m","parameters":{}}` | 正常请求体 |
| `tampered_payload` | `{"module_name":"svc","method_name":"m","parameters":{"malicious":true}}` | 篡改请求体 |

---

## 二、测试用例

### 2.1 HMAC 签名往返（COV-1~3 . L1）

> 自动化落点：`tests/unit/test_hmac_signer.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SGN-001 | sign → verify 往返通过 | 1. sign(body)；2. verify(body, sig) | verify 返回 True | P0 | 待实现 |
| TC-SGN-002 | 错误密钥 verify 返回 False | 1. signer_A sign；2. signer_B verify | verify 返回 False | P0 | 待实现 |
| TC-SGN-003 | 篡改 body——verify 返回 False | 1. sign(original)；2. verify(tampered, original_sig) | verify 返回 False | P0 | 待实现 |
| TC-SGN-004 | compare_digest 防时序攻击 | 1. 不同长度签名的比较耗时 | 耗时差异 < 1μs（常数时间比较） | P1 | 待实现 |
| TC-SGN-005 | 缺少 RPC_HMAC_SECRET 抛异常 | 1. HMACSigner() 环境变量未设 | 抛出 ValueError "RPC_HMAC_SECRET 环境变量未设置" | P0 | 待实现 |

### 2.2 Nonce 防重放（COV-4~5 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SGN-006 | 首次 Nonce——存储成功 | 1. is_valid_and_store("abc123", now) | 返回 True, store 含 "abc123" | P0 | 待实现 |
| TC-SGN-007 | 重复 Nonce——拒绝 | 1. is_valid_and_store("abc123", now)；2. 再次调用相同 Nonce | 第二次返回 False | P0 | 待实现 |
| TC-SGN-008 | Nonce 过期——自动清理 | 1. 存储 Nonce 时间戳=now-600s；2. 触发 cleanup | Nonce 已从 store 中移除 | P1 | 待实现 |
| TC-SGN-009 | Nonce 容量超 max_size——淘汰最旧 | 1. max_size=5；2. 存储 6 个 Nonce | 最旧 Nonce 被淘汰，store.size=5 | P2 | 待实现 |

### 2.3 时间戳验证（COV-6 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SGN-010 | 时间戳在窗口内——通过 | 1. timestamp=now-60s；2. is_valid_and_store | 返回 True | P0 | 待实现 |
| TC-SGN-011 | 时间戳超出 5 分钟窗口——拒绝 | 1. timestamp=now-301s；2. is_valid_and_store | 返回 False（不存储 Nonce） | P0 | 待实现 |
| TC-SGN-012 | 未来时间戳——拒绝 | 1. timestamp=now+301s；2. is_valid_and_store | 返回 False（abs 比较） | P1 | 待实现 |

### 2.4 中间件集成（COV-7~9 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SGN-013 | 内网 IP (127.0.0.1) 跳过签名 | 1. 请求来源 127.0.0.1；2. 无签名头部 | 请求正常处理（跳过验证） | P0 | 待实现 |
| TC-SGN-014 | /health 路径跳过验证 | 1. GET /health 无签名 | 返回 200 | P0 | 待实现 |
| TC-SGN-015 | 缺少 X-Signature 头部返回 401 | 1. 仅提供 Timestamp+Nonce，缺少 Signature | 401 "缺少签名头部: X-Signature, X-Timestamp, X-Nonce" | P0 | 待实现 |
| TC-SGN-016 | 签名验证失败返回 401 | 1. 提供错误签名 | 401 "签名验证失败", code=4001 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SGN-EDGE-001 | 超大 body (10MB) HMAC 计算 | 1. 10MB body sign + verify | HMAC 计算耗时 < 50ms | P2 | 待实现 |
| TC-SGN-EDGE-002 | 时钟偏差边界——timestamp 正好 300s | 1. timestamp = now - 300s | 返回 True（窗口包含边界） | P1 | 待实现 |
| TC-SGN-EDGE-003 | Nonce 与时间戳组合防重放 | 1. 相同 Nonce 但不同 timestamp（在窗口内） | 第二次拒绝（Nonce 去重优先） | P1 | 待实现 |
| TC-SGN-EDGE-004 | 无效 timestamp 格式 (非数字) | 1. X-Timestamp: "abc" | 401 "无效的时间戳格式" | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-SGN-REG-001 | 签名中间件不影响未启用端点 | 对 /health、/metrics 等 skip_paths 发送无签名请求 | 全部 200，无 401 | P0 | 待实现 |
| TC-SGN-REG-002 | 现有 76 个测试在开启签名中间件后全部通过 | 注册 HMACMiddleware 后运行全量测试 | 100% 通过（或内网跳过） | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 HMAC-SHA256 签名 | sign/verify 往返 + compare_digest | TC-SGN-001 ~ 005 |
| FR-02 Nonce 防重放 | 首次存储/重复拒绝/过期清理 | TC-SGN-006 ~ 009 |
| FR-03 时间戳 5 分钟窗口 | 窗口内/外 + 未来时间戳 | TC-SGN-010 ~ 012 |
| FR-04 中间件选择性启用 | 内网跳过/skip_paths/签名验证 | TC-SGN-013 ~ 016 |
| FR-05 共享密钥轮换兼容 | rotate_secret() 后新密钥生效 | — (与 YA-09-84 联动测试) |
| FR-06 生产环境可选启用 | 默认未注册中间件不影响现有功能 | TC-SGN-REG-001 ~ 002 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 前端 (YiVad/YiPet) 签名生成一致性未覆盖 | 前端 HMAC 实现可能与后端不匹配 | 添加跨项目签名往返测试（YiVad sign → YiAi verify） |
| G-2 | IP 白名单动态变更未覆盖 | 新增内网 IP 段需重启才能生效 | 支持 IP 白名单热更新，添加对应测试 |
| G-3 | Nonce 存储跨进程一致性未覆盖 | 多 Worker 部署时 Nonce 不共享可能导致重放 | 引入 Redis Nonce 存储后补充分布式测试 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/89-需求-请求签名验证.md`*