---

doc_type: test
title: "YA-09-61: 服务端数据库连接加密 — TLS/SSL 传输层安全配置与证书管理 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-61"
source_prds: ["65-需求-数据库TLS加密"]
source_modules: ["65-prd-task-数据库TLS加密"]
source_okr: [yiai-001]

type: test
---

# YA-09-61: 数据库 TLS 加密 — 测试规格

> 来源 PRD：[65-需求-数据库TLS加密.md](../../prds/2026-09/65-需求-数据库TLS加密.md)

本文档定义 MongoDB TLS 传输加密的**验证方式**——覆盖 TLS 连接建立、证书验证、自签名证书处理、连接字符串 TLS 参数、不安全连接拒绝。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock TLS config） | 每次提交 |
| L2 集成 | pytest + MongoDB（TLS enabled） | MongoDB TLS 实例 | PR / 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | TLS 连接建立（tls=true） | L2 |
| COV-2 | CA 证书验证（tlsCAFile） | L2 |
| COV-3 | 客户端证书认证（tlsCertificateKeyFile） | L2 |
| COV-4 | 自签名证书 allowInvalidCertificates | L2 |
| COV-5 | TLS 连接字符串参数解析 | L1 |
| COV-6 | 不安全连接（无 TLS）降级警告 | L2 |
| COV-7 | 证书过期处理 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `tls_ca_file` | 自签名 CA 证书文件路径 | CA 验证 |
| `tls_cert_key` | 客户端证书 + 私钥文件路径 | 双向 TLS |
| `tls_uri` | `mongodb://host:27017/?tls=true&tlsCAFile=ca.pem` | TLS 连接字符串 |

---

## 二、测试用例

### 2.1 TLS 连接（COV-1~4 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TLS-001 | tls=true 建立加密连接 | 1. 连接字符串含 `tls=true`；2. `db.initialize()` | 连接成功，使用 TLS 加密通道 | P0 | 待实现 |
| TC-TLS-002 | tlsCAFile 验证服务端证书 | 1. 指定 `tlsCAFile=ca.pem`；2. 服务端使用 CA 签发的证书 | TLS 握手成功，连接建立 | P0 | 待实现 |
| TC-TLS-003 | 证书 CN/SAN 不匹配时连接失败 | 1. 服务端证书 CN 与连接地址不匹配 | 抛出 `ServerSelectionTimeoutError`，TLS 握手失败 | P0 | 待实现 |
| TC-TLS-004 | 自签名证书 + allowInvalidCertificates | 1. 自签名证书；2. `tlsAllowInvalidCertificates=true` | 连接成功（绕过证书验证，仅加密） | P1 | 待实现 |
| TC-TLS-005 | 双向 TLS——客户端证书认证 | 1. `tlsCertificateKeyFile=client.pem`；2. 服务端验证客户端证书 | 连接成功，双向认证通过 | P1 | 待实现 |
| TC-TLS-006 | 无客户端证书时双向 TLS 拒绝 | 1. 不提供客户端证书；2. 服务端要求双向 TLS | 连接被服务端拒绝 | P1 | 待实现 |

### 2.2 参数解析（COV-5 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TLS-007 | 解析 tls=true 参数 | 1. 解析连接字符串 | `tls` → True | P0 | 待实现 |
| TC-TLS-008 | 解析 tlsCAFile 参数 | 1. 含 `tlsCAFile=/path/ca.pem` | 路径正确解析 | P0 | 待实现 |
| TC-TLS-009 | 不兼容参数组合检测 | 1. `tls=false` + `tlsCAFile=ca.pem` | WARNING 日志，tlsCAFile 被忽略 | P2 | 待实现 |

### 2.3 降级与安全（COV-6~7 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TLS-010 | 无 TLS 时 WARNING 日志 | 1. 连接不含 tls=true | 日志: "MongoDB connection is not encrypted" | P0 | 待实现 |
| TC-TLS-011 | 证书即将过期时 WARNING | 1. 证书有效期 < 30 天 | 日志: "TLS certificate expires in N days" | P1 | 待实现 |
| TC-TLS-012 | 证书过期时连接失败 | 1. 证书已过期 | 连接失败，明确错误信息 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TLS-EDGE-001 | tlsCAFile 路径不存在 | CA 文件路径错误 | 启动失败，明确错误信息 | P1 | 待实现 |
| TC-TLS-EDGE-002 | 证书文件权限不足 | CA 文件 000 权限 | 读取失败，明确 PermissionError | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-TLS-REG-001 | 缺陷 1：无 TLS 时服务正常运行（开发环境） | 本地开发无需 TLS | 所有功能正常 | P0 | 待实现 |
| TC-TLS-REG-002 | 缺陷 2：Atlas 默认 TLS 连接兼容 | MongoDB Atlas 默认启用 TLS | 自动适配 Atlas 的 TLS 配置 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 TLS 连接 | tls=true 加密 | TC-TLS-001 |
| FR-02 CA 验证 | tlsCAFile 验证 | TC-TLS-002 ~ 004 |
| FR-03 双向 TLS | 客户端证书 | TC-TLS-005 ~ 006 |
| FR-04 参数解析 | 连接字符串正确解析 | TC-TLS-007 ~ 009 |
| FR-05 安全告警 | 无 TLS / 证书过期 | TC-TLS-010 ~ 012 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | TLS 1.2 vs 1.3 版本协商未测试 | 不同 MongoDB 版本行为不同 | 按 MongoDB 版本矩阵测试 |
| G-2 | 证书 CRL/OCSP 吊销检查 | 吊销的证书仍可连接 | 启用吊销检查测试 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/65-需求-数据库TLS加密.md`*
