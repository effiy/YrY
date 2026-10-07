---
title: STRIDE-YiAi威胁模型
tags:
  - perfbaseline
  - stride
  - threat
  - security
  - yiai
  - threat-model
  - risk
category: projects/yiai/bugs/2026-09
created: 2026-10-07
updated: 2026-10-07
source: internal
type: baseline / analysis
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - sre
  - engineer
  - security
benefit: 对 YiAi 沙箱、RPC、审计、上下文敏感信息、MongoDB 连接池、企业微信 webhook 六类 STRIDE 威胁建立分级缓解路线，避免 P0 风险被默认配置放大。
acceptance_criteria:
  - 6 类 STRIDE 威胁均有明确场景、影响、可能性、缓解字段，P0 至少 2 项且含缓解 owner 与方案
  - 引用 06-prd 认证鉴权、09-prd 审计日志、105-prd 熔断器三条设计可追溯，每项引用对应 ≥1 条缓解
  - 缓解路线图 30/60/90 天交付物可与实际 sprint 对齐，风险等级表每项给出明确 P0/P1/P2
related:
  - ../../prds/2026-09/06-prd-数据层.md
  - ../../prds/2026-09/09-prd-审计日志.md
  - ../../prds/2026-09/105-prd-熔断器.md
  - ../../bugs/2026-09/认证/01-认证-JWT-Secret硬编码默认值.md
  - ../../bugs/2026-09/执行/01-执行-模块执行器缺少超时和资源限制.md
  - ../../bugs/2026-09/企业微信/01-企微-Token刷新无并发保护.md
---

## 一、STRIDE 威胁矩阵（6 行 × 4 列）

| STRIDE 类别 | 威胁场景 | 影响 | 可能性 | 缓解措施 |
| --- | --- | --- | --- | --- |
| **S 仿冒 (Spoofing)** | 模块名任意 `import` 绕过 allowlist：沙箱中 `from os import system` / `import subprocess` 通过 `__import__('os').system(...)` 或 `builtins.__import__` 动态加载逃逸；模块 allowlist 仅做前缀匹配。 | 高：可执行任意宿主代码、读取 `~/.config/yiai/` 与 MongoDB 凭据、调用企业微信 webhook 发伪造通知。 | 高：已知 `allowlist-none-set` 崩溃 bug (执行/02) + 01-执行缺少超时限制组合可达。 | (1) allowlist 由前缀匹配改为 `importlib.util.find_spec` 精确白名单并在 AOT 阶段做 AST 静态分析拦截 `__import__` / `builtins` 引用；(2) 沙箱进程启用 `seccomp`/`nsjail` 资源隔离；(3) 对接 06-prd 认证鉴权：对 module 执行链路引入 HMAC token + 调用方鉴权。 |
| **T 篡改 (Tampering)** | RPC 参数注入：GraphQL 联邦层 `list_projects(limit=)` 与 `chat(use_rag=True, context=...)` 未做范围/深度校验，`limit=999999` 触发全表扫描，`context` 超长覆盖原始 RAG 上下文。 | 中：服务侧数据损坏或返回被污染结果；可与 DoS 组合放大。 | 中：代码质量/28 缺少请求体大小限制 + 25 find 缺少字段投影叠加。 | (1) 所有 RPC/GraphQL 入参启用 Pydantic schema：`limit ∈ [1, 200]`、`context` ≤ 32KB；(2) MongoDB find 默认增加 `_limit=200` 与字段投影；(3) 对接 09-prd 审计日志：所有参数篡改触发安全子级告警。 |
| **R 抵赖 (Repudiation)** | 审计日志缺失：敏感操作（`delete_project` / `force_sync` / `rebuild_vector_index`）未写入可追溯日志或仅记 info，缺少 `operator / source_ip / request_id` 三元组，出事故无法举证。 | 中：事故后无法确认操作责任人，内部合规审计通不过。 | 高：09-prd 仅覆盖 "预写"，落地到 admin 接口未合并。 | (1) 落地 09-prd 审计日志系统：所有 admin 操作 + 超过阈值的查询强制写入 `audit_logs` 集合，TTL=365d；(2) 审计日志单独库 + 只能追加不能删除/修改；(3) `request_id` 全链路透传到 RAG / LLM Provider。 |
| **I 信息泄露 (Information Disclosure)** | LLM 上下文敏感字段：`SystemPrompt` 中拼接了 `MONGO_URI` / `WECOM_WEBHOOK` / `JWT_SECRET` 作为 "developer notes"；RAG 检索时若命中 `*_secret` 文档，embedding 前未脱敏直接进入 LLM 上下文，可能被 prompt injection 引导泄露。 | 高：凭据外泄可直接登录 MongoDB 或伪造企业微信告警，二次影响面极大。 | 中：已存在模板/19-prd Prompt 版本管理但默认未启用脱敏。 | (1) 所有注入 LLM 的 prompt 走 `SecretsRedactor`：正则 + entropy 检测替换 `****`；(2) RAG pipeline 在 embedding 阶段对字段级 `security_classification=internal` 文档做元数据过滤；(3) 参考 06-prd：敏感配置使用 vault sidecar 不落地明文。 |
| **D 拒绝服务 (Denial of Service)** | 并发占满 MongoDB pool：恶意脚本 1000+ 并发 `chat(use_rag=True)` → RAG 每次 3~5 次查询 → Motor pool_size 默认 100 迅速耗尽 → 健康检查失败 → k8s 滚动重启雪崩；未接入熔断。 | 高：全服务不可用，`/health` 返回 503 连续 2min 触发自动重启循环。 | 高：参考 138-基线压测并发 500 已出现 2.38% 错误率，缺熔断放大 2~3 倍即可触发。 | (1) 落地 105-prd 熔断器：入口并发阈值 420、MongoDB 等待队列 ≥50 直接 fast-fail；(2) Motor `maxPoolSize=200, waitQueueTimeoutMS=2000`；(3) RAG 查询超时上限 5s，超了降级返回纯 LLM 不查库。 |
| **E 提权 (Elevation of Privilege)** | 企业微信 webhook 泄露：`config/wecom.yaml` 默认把 `webhook_url` 写入 `.env` 明文，同时 `/api/v1/admin/config` 对仅持 `viewer` role 的 JWT 未做鉴权即可完整读回；webhook 直接可向全员频道发送伪造通知。 | 高：等于拿到全员通知通道，可做钓鱼 + 社会工程。 | 中：bugs/企业微信/01 已提并发保护但缺权限校验。 | (1) `config/wecom.yaml` 使用 SOPS + KMS 加密；(2) `/api/v1/admin/*` 接入 06-prd RBAC：admin 接口需 `role ∈ {owner, maintainer}`；(3) 企业微信发送接口加 HMAC 签名 + 调用频次限 1/min 全局。 |

## 二、风险等级总表 P0 / P1 / P2

| 风险 ID | STRIDE 类别 | 摘要 | 影响 | 可能性 | 综合等级 | 责任方 |
| --- | --- | --- | --- | --- | --- | --- |
| YIAI-STRIDE-001 | I 信息泄露 | LLM 上下文拼接 `MONGO_URI/WECOM/JWT_SECRET` 明文 | 高 | 中 | **P0** | Security / yiai-core |
| YIAI-STRIDE-002 | S 仿冒 | 沙箱 allowlist 绕过 + 无资源隔离 | 高 | 高 | **P0** | Platform / yiai-executor |
| YIAI-STRIDE-003 | D DoS | MongoDB 连接池耗尽 + 无熔断 | 高 | 高 | **P0** | SRE / yiai-rpc |
| YIAI-STRIDE-004 | E 提权 | 企业微信 webhook 明文 + admin 接口缺 RBAC | 高 | 中 | **P1** | yiai-api / Security |
| YIAI-STRIDE-005 | T 篡改 | RPC 参数无范围校验导致全表扫描 | 中 | 中 | **P1** | yiai-rpc |
| YIAI-STRIDE-006 | R 抵赖 | 敏感操作无审计日志 | 中 | 高 | **P2** | yiai-core / Compliance |

## 三、缓解路线图 30 / 60 / 90 天

| 阶段 | 交付物 | 对应风险 | 验收标准 |
| --- | --- | --- | --- |
| **30 天 (T+0 ~ T+30)** | ① 落地 105-prd 熔断器 + Motor pool 调优；② SecretsRedactor 接入 prompt 管道；③ `/api/v1/admin/*` 接入 06-prd RBAC | 003, 001, 004 | ① 1000 并发压测 MongoDB pool 不耗尽、健康检查 5xx < 1%；② 静态扫描 prompt 文件 0 处明文密钥；③ viewer role 调 admin 接口 100% 返回 403。 |
| **60 天 (T+31 ~ T+60)** | ④ 沙箱 allowlist AST 静态分析 + `nsjail` 隔离；⑤ 09-prd 审计日志 admin 全覆盖；⑥ RPC 参数 Pydantic schema 全量接入 | 002, 006, 005 | ④ CTF 10 道沙箱逃逸题通过率 0/10；⑤ delete/force_sync/rebuild 三类操作 100% 落盘可查；⑥ Pydantic 覆盖率 100%，fuzzing 30min 无绕过。 |
| **90 天 (T+61 ~ T+90)** | ⑦ 敏感配置 SOPS/KMS 全量加密；⑧ RAG embedding 阶段字段级脱敏 + 元数据过滤；⑨ 威胁模型自动化回归（每 PR 跑 STRIDE checklist） | 001, 004, 全 | ⑦ 配置库 0 处明文 secret；⑧ 内部文档 prompt injection 样本命中率 = 0；⑨ 威胁等级不回归，P0 数量 ≤ 现状。 |
