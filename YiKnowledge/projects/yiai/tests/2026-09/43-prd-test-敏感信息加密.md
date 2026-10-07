---

doc_type: test
title: "YA-09-39: 服务配置敏感信息加密 — 环境变量与密钥管理最佳实践 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-39"
source_prds: ["43-需求-敏感信息加密"]
source_modules: ["43-prd-task-敏感信息加密"]
source_okr: [yiai-001]

type: test
---

# YA-09-39: 服务配置敏感信息加密 — 测试规格

> 来源 PRD：[43-需求-敏感信息加密.md](../../prds/2026-09/43-需求-敏感信息加密.md)
> 提取日期：2026-09-23

本文档定义 SecretManager 加密模块的**验证方式**——测什么、怎么测、通过标准是什么。覆盖 Fernet 加解密、PBKDF2 密钥派生、MultiFernet 密钥轮换、加密配置文件加载、明文 fallback。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（纯逻辑） | 每次提交 |
| L2 集成 | pytest | 加密配置文件 + 环境变量 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `SecretManager.__init__` 密钥派生（PBKDF2） | L1 |
| COV-2 | `SecretManager.encrypt` Fernet 加密 | L1 |
| COV-3 | `SecretManager.decrypt` Fernet 解密 | L1 |
| COV-4 | `MultiFernet` 密钥轮换（加密+解密） | L1 |
| COV-5 | `SecretManager.encrypt_file` 配置文件加密 | L2 |
| COV-6 | `SecretManager.load_encrypted_config` 解密加载 | L2 |
| COV-7 | `_decrypt_dict` 递归解密 | L1 |
| COV-8 | `Config` 加密配置优先级加载 | L2 |
| COV-9 | 明文配置 fallback 兼容 | L2 |
| COV-10 | `get_secret_manager` 全局单例 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `tmp_master_key` | `"test-master-key-2026"` | 标准主密钥 |
| `rotated_keys` | `"old-key-2026,new-key-2026"` | 密钥轮换测试 |
| `sample_plaintext` | `"mongodb://admin:pass123@localhost:27017"` | MongoDB URI 明文 |
| `sample_config_yaml` | 含 5 个敏感字段的 YAML 配置 | 配置文件加密测试 |
| `encrypted_config_yaml` | `gAAAAAB` 前缀的 Fernet 密文配置 | 解密加载测试 |
| `empty_key_env` | `YIAI_MASTER_KEY=""` | 异常路径测试 |

---

## 二、测试用例

### 2.1 SecretManager 核心加解密（COV-1~3 . L1）

> 自动化落点：`tests/unit/shared/test_secrets.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SEC-001 | 正常加密解密往返 | 1. `mgr = SecretManager("key")`；2. `cipher = mgr.encrypt("hello")`；3. `plain = mgr.decrypt(cipher)` | `plain == "hello"`，cipher 以 `gAAAAAB` 开头 | P0 | 待实现 |
| TC-SEC-002 | 加密 MongoDB URI 往返 | 1. `cipher = mgr.encrypt("mongodb://admin:pass@localhost")`；2. 解密 | 解密后还原完整 URI，包含特殊字符 `://@` | P0 | 待实现 |
| TC-SEC-003 | 加密空字符串 | 1. `mgr.encrypt("")` | 正常加密，解密得到 `""` | P1 | 待实现 |
| TC-SEC-004 | 加密非字符串类型抛异常 | 1. `mgr.encrypt(123)` | 抛出 `ValueError("加密内容必须是字符串")` | P0 | 待实现 |
| TC-SEC-005 | 解密非字符串类型抛异常 | 1. `mgr.decrypt(None)` | 抛出 `ValueError("解密内容必须是字符串")` | P0 | 待实现 |
| TC-SEC-006 | 解密无效密文抛异常 | 1. `mgr.decrypt("not-a-valid-fernet-token")` | 抛出 `ValueError`，日志含 `[Secrets] 解密失败` | P0 | 待实现 |
| TC-SEC-007 | PBKDF2 密钥派生确定性 | 1. 两次 `SecretManager("same-key")` | 两次派生的 Fernet 密钥相同，加解密互认 | P0 | 待实现 |
| TC-SEC-008 | 不同主密钥产生不同密文 | 1. `mgrA.encrypt("x")` vs `mgrB.encrypt("x")` | 两个密文不同 | P1 | 待实现 |
| TC-SEC-009 | 错误的密钥无法解密 | 1. `mgrA.encrypt("x")`；2. `mgrB.decrypt(cipher)` | 抛出 `ValueError` | P0 | 待实现 |
| TC-SEC-010 | 长文本加密（10KB） | 1. `mgr.encrypt("x" * 10240)`；2. 解密 | 解密后长度一致，内容一致 | P1 | 待实现 |

### 2.2 MultiFernet 密钥轮换（COV-4 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SEC-011 | 多密钥初始化 | 1. `SecretManager("old,new")` | `_secret_manager` 初始化成功，日志显示 `2 个密钥` | P0 | 待实现 |
| TC-SEC-012 | 新密钥加密，旧密钥解密 | 1. `mgr = SecretManager("old,new")`；2. `cipher = mgr.encrypt("data")`；3. `mgr.decrypt(cipher)` | 加密使用 primary key (new)，解密使用 MultiFernet 任意密钥 | P0 | 待实现 |
| TC-SEC-013 | 仅旧密钥无法加密（单密钥模式） | 1. `mgr = SecretManager("old-only")` 加密；2. `SecretManager("new-only")` 解密 | 解密失败（密钥不匹配） | P0 | 待实现 |
| TC-SEC-014 | 三个密钥轮换 | 1. `SecretManager("v1,v2,v3")` | 3 个密钥均可用，加密用 v1 | P1 | 待实现 |

### 2.3 配置文件加密与解密（COV-5~7 . L2）

> 自动化落点：`tests/integration/test_secrets_config.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SEC-015 | 加密整个配置文件 | 1. `encrypt_file("config.yaml", "config.enc.yaml", key)` | 输出文件含加密的敏感字段，非敏感字段保持明文 | P0 | 待实现 |
| TC-SEC-016 | 加密后密文以 `gAAAAAB` 开头 | 1. 检查加密输出的敏感字段值 | MongoDB URI / JWT Secret / Webhook URL 均为 `gAAAAAB...` 格式 | P0 | 待实现 |
| TC-SEC-017 | 加载加密配置并解密 | 1. `mgr.load_encrypted_config("config.enc.yaml")` | 返回完整配置字典，敏感字段已解密，非敏感字段不变 | P0 | 待实现 |
| TC-SEC-018 | `_decrypt_dict` 递归解密嵌套字段 | 1. 加密 `mongodb.uri`（嵌套在 dict 中）；2. `_decrypt_dict` | 嵌套路径中的密文也被解密 | P0 | 待实现 |
| TC-SEC-019 | 非 Fernet 格式字符串不处理 | 1. 字典中存在 `"http://localhost:11434"` 明文 URL | 明文 URL 保持不变，不解密 | P1 | 待实现 |
| TC-SEC-020 | 敏感字段列表完整覆盖 | 1. 检查 `sensitive_keys` 列表 | 包含 `mongodb.uri`、`ollama.api_key`、`wework.webhook_url`、`auth.secret_key`、`auth.jwt_secret` | P0 | 待实现 |

### 2.4 配置加载集成（COV-8~10 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SEC-021 | Config 优先加载加密配置 | 1. 同时存在 `config.encrypted.yaml` 和 `config.yaml`；2. 初始化 Config | 加载加密配置，敏感字段已解密 | P0 | 待实现 |
| TC-SEC-022 | 加密配置不存在时 fallback 明文 | 1. 仅存在 `config.yaml`，无加密配置；2. 初始化 Config | 正常加载明文配置，不报错 | P0 | 待实现 |
| TC-SEC-023 | `get_secret_manager()` 单例 | 1. 两次调用 `get_secret_manager()` | 返回同一实例（`is` 为 True） | P1 | 待实现 |
| TC-SEC-024 | YIAI_MASTER_KEY 未设置抛 RuntimeError | 1. 清除环境变量；2. 初始化 SecretManager | 抛出 `RuntimeError("YIAI_MASTER_KEY 未设置")` | P0 | 待实现 |
| TC-SEC-025 | YIAI_MASTER_KEY 为空字符串抛异常 | 1. 设置 `YIAI_MASTER_KEY=""`；2. 初始化 | 抛出 RuntimeError | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-SEC-EDGE-001 | 密钥含特殊字符 | 1. `SecretManager("key with spaces!@#$%")` | 正常派生密钥，加解密正常 | P1 | 待实现 |
| TC-SEC-EDGE-002 | 极长主密钥（1000 字符） | 1. `SecretManager("k" * 1000)` | PBKDF2 正常派生，不报错 | P2 | 待实现 |
| TC-SEC-EDGE-003 | 密文被截断 | 1. `mgr.decrypt(cipher[:50])` | 抛出 ValueError，不解密 | P1 | 待实现 |
| TC-SEC-EDGE-004 | 并发加密（10 线程） | 1. 10 线程同时 `mgr.encrypt("data")` | 全部成功，无竞态 | P2 | 待实现 |
| TC-SEC-EDGE-005 | 配置文件不存在 | 1. `mgr.load_encrypted_config("nonexistent.yaml")` | 抛出 FileNotFoundError | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-SEC-REG-001 | 缺陷 1：密钥不在日志中泄漏 | 加密/解密操作后检查日志 | 日志不含主密钥明文，不含解密后凭据 | P0 | 待实现 |
| TC-SEC-REG-002 | 缺陷 2：.gitignore 排除加密密钥文件 | 检查 `.gitignore` | `config/config.encrypted.yaml` 可提交 Git，但 `.env` 和主密钥文件被排除 | P0 | 待实现 |
| TC-SEC-REG-003 | 缺陷 3：auth service 从加密配置加载 JWT 密钥 | `Config` 加载后 `auth.secret_key` | JWT 签名/验证正常工作 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 Fernet 加解密 | 加密/解密往返 | TC-SEC-001 ~ 003 |
| FR-02 类型校验 | 非字符串拒绝 | TC-SEC-004 ~ 006 |
| FR-03 PBKDF2 密钥派生 | 确定性派生 | TC-SEC-007 ~ 009 |
| FR-04 MultiFernet 密钥轮换 | 多密钥加密解密 | TC-SEC-011 ~ 014 |
| FR-05 配置文件加密 | encrypt_file 输出密文 | TC-SEC-015 ~ 016 |
| FR-06 配置文件解密加载 | load_encrypted_config | TC-SEC-017 ~ 020 |
| FR-07 Config 集成 | 加密优先 + 明文 fallback | TC-SEC-021 ~ 022 |
| FR-08 单例管理 | get_secret_manager | TC-SEC-023 |
| FR-09 错误处理 | 密钥未设置 / 空密钥 | TC-SEC-024 ~ 025 |
| FR-10 日志安全 | 不泄露凭据 | TC-SEC-REG-001 |
| FR-11 Git 安全 | .gitignore 排除密钥 | TC-SEC-REG-002 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | K8s Secret 挂载验证未覆盖 | 生产环境密钥注入未测试 | 在 K8s e2e 测试中补充 |
| G-2 | 90 天密钥轮换自动流程未测试 | 轮换 cron 任务未验证 | 添加 cron 调度测试 |
| G-3 | `cryptography` 库版本兼容性未验证 | 版本升级可能破坏 Fernet 格式 | 锁定版本 + 兼容性矩阵测试 |
| G-4 | 多环境（dev/staging/prod）密钥隔离未测试 | 开发密钥可能误用于生产 | 添加环境标识验证 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/43-需求-敏感信息加密.md`*