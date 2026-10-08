---

doc_type: test
title: "YA-09-84: 服务端数据库连接字符串安全轮换 — 定期更换凭证与零停机切换 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-84"
source_prds: ["88-需求-数据库凭证轮换"]
source_modules: ["88-prd-task-数据库凭证轮换"]
source_okr: [yiai-001]

type: test
---

# YA-09-84: 数据库凭证轮换 — 测试规格

> 来源 PRD：[88-需求-数据库凭证轮换.md](../../prds/2026-09/88-需求-数据库凭证轮换.md)

本文档定义数据库凭证零停机轮换的**验证方式**——覆盖三步原子切换、旧连接池排空、轮换失败回退、审计日志、并发保护。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + mongomock | 无 | 每次提交 |
| L2 集成 | pytest + MongoDB | MongoDB 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 三步原子切换——建连/切换/排空 | L1 |
| COV-2 | 新凭证验证 (ping) | L1 |
| COV-3 | 旧连接池延迟 30s 关闭 | L1 |
| COV-4 | 轮换失败自动回退——保留旧连接 | L1 |
| COV-5 | 紧急回滚 rollback() | L1 |
| COV-6 | rotation_lock 并发保护 | L1 |
| COV-7 | 轮换脚本 dry-run 模式 | L2 |
| COV-8 | 审计日志记录 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `valid_new_uri` | 有效的 MongoDB 连接字符串 | 正常轮换 |
| `invalid_new_uri` | 错误密码/不可达主机的连接字符串 | 轮换失败 |
| `rotator` | CredentialRotator 实例 | 核心被测对象 |
| `db_client_ref` | [old_mock_client] 列表引用 | 模拟当前连接引用 |
| `mock_mongo_client` | mongomock/pytest-mock AsyncIOMotorClient | Mock 客户端 |

---

## 二、测试用例

### 2.1 三步切换与连接验证（COV-1~3 . L1）

> 自动化落点：`tests/unit/test_credential_rotator.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RTC-001 | 正常轮换——新凭证 ping 通过后原子切换 | 1. 调用 rotate(new_uri)；2. 检查 db_client_ref[0] | db_client_ref[0] 指向新 client，返回 success=True | P0 | 待实现 |
| TC-RTC-002 | 旧连接池 30s 后关闭 | 1. rotate(drain_seconds=0.1)；2. 检查 old_client | old_client.close() 被调用 | P0 | 待实现 |
| TC-RTC-003 | 新凭证 ping 失败——轮换中止 | 1. new_uri ping 抛异常；2. rotate() | success=False, error="Authentication failed"，旧连接保留 | P0 | 待实现 |
| TC-RTC-004 | 轮换期间请求使用新连接池 | 1. 轮换完成后立即发送请求 | 请求通过新 client 处理，无错误 | P0 | 待实现 |

### 2.2 回滚与并发（COV-4~6 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RTC-005 | 紧急回滚——切换回旧连接池 | 1. rotate() 成功；2. rollback() | db_client_ref[0] 恢复为旧 client，status=rolled_back | P0 | 待实现 |
| TC-RTC-006 | 旧连接池已关闭——无法回滚 | 1. rotate(drain_seconds=0)；2. old_client 已 close；3. rollback() | status=no_old_client, error 含 "无旧连接池" | P1 | 待实现 |
| TC-RTC-007 | 并发轮换保护——lock 串行化 | 1. 两个协程同时调用 rotate() | 第二个等待第一个完成，仅一次实际轮换 | P0 | 待实现 |
| TC-RTC-008 | 回滚后旧 client 已不可用——回滚失败 | 1. rotate() 成功；2. 旧 client ping 失败；3. rollback() | success=False, error="rollback_failed" | P1 | 待实现 |

### 2.3 脚本与审计（COV-7~8 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RTC-009 | dry-run 模式仅验证不切换 | 1. `rotate_credentials.py --type mongodb --dry-run` | 仅输出 "[DRY RUN] 新凭证验证通过"，不修改 client 引用 | P1 | 待实现 |
| TC-RTC-010 | 交互确认——非 yes 取消操作 | 1. 脚本提示确认；2. 输入 "no" | 输出 "已取消"，不执行轮换 | P2 | 待实现 |
| TC-RTC-011 | 轮换事件记录审计日志 | 1. rotate() 成功；2. 检查 rotation_history | 记录含 timestamp, type, duration_ms, success | P1 | 待实现 |
| TC-RTC-012 | 凭证不在日志中明文输出 | 1. rotate() 成功；2. 检查日志内容 | 不含密码原文，仅含脱敏 URI | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RTC-EDGE-001 | 新连接建连超时 (5s)——轮换失败 | 1. 新 host 不可达；2. rotate() | serverSelectionTimeoutMS=5000 后失败，旧连接保留 | P0 | 待实现 |
| TC-RTC-EDGE-002 | 排空期间有新请求到达——旧连接继续服务 | 1. 排空 30s 窗口内发送请求 | 旧连接池仍有连接服务请求 | P1 | 待实现 |
| TC-RTC-EDGE-003 | 两次连续轮换——第二次旧 client 为第一次的 | 1. rotate(A→B)；2. rotate(B→C) | 第二次旧 client 为 B（不是 A） | P1 | 待实现 |
| TC-RTC-EDGE-004 | 环境变量未提供新 URI——脚本报错退出 | 1. 未设 YIAI_MONGODB_NEW_URI；2. 运行脚本 | 打印错误信息，exit code=1 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-RTC-REG-001 | 轮换期间业务查询零中断 | 轮换过程中执行 query_documents | 无 5xx 错误，无超时 | P0 | 待实现 |
| TC-RTC-REG-002 | 轮换完成后数据库连接池功能正常 | 轮换后执行 CRUD 操作 | 所有操作正常，连接池大小一致 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 双凭证过渡 | 三步原子切换 | TC-RTC-001 ~ 004 |
| FR-02 零停机 | 活跃请求不断 + 旧连接延迟关闭 | TC-RTC-002, REG-001 |
| FR-03 轮换失败回退 | 新凭证失败保留旧连接 | TC-RTC-003 |
| FR-04 紧急回滚 | rollback() 切换回旧连接池 | TC-RTC-005 ~ 006, 008 |
| FR-05 并发保护 | rotation_lock 串行化 | TC-RTC-007 |
| FR-06 半自动脚本 | dry-run + 交互确认 | TC-RTC-009 ~ 010 |
| FR-07 审计日志 | 轮换事件记录 | TC-RTC-011 ~ 012 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | Ollama API Key / 企业微信 Webhook 轮换未覆盖 | 仅测试 MongoDB 凭证轮换 | 扩展测试覆盖其他凭证类型 |
| G-2 | 生产环境 MongodDB Atlas API 集成轮换 | Atlas 自动轮换与 YiAi 轮换的协作未测试 | 添加 Atlas API mock 测试 |
| G-3 | 旧凭证在 MongoDB 端撤销后旧连接池行为 | 7 天保留期内的旧凭证撤销 | 模拟 MongoDB 端撤销旧凭证后旧连接池的故障表现 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/88-需求-数据库凭证轮换.md`*