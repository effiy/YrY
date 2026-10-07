---
type: okr-goal
id: yiai-q4-004
title: "安全合规与数据治理"
status: planned
period: "2026 Q4"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 10
updated: 2026-09-23
kr1: "安全扫描零高危 — SAST/SCA/Dependency 扫描集成 CI，高危漏洞阻断构建并清零"
kr1_completion: 10
kr2: "数据留存与合规删除 — GDPR 数据清除 + 保留策略 + 用户数据导出，合规检查 100%"
kr2_completion: 5
kr3: "访问控制增强 — IP 白名单 + 字段级权限 + 请求签名验证 + TOTP 两步验证"
kr3_completion: 15
kr4: "审计日志完整性 — 100% 写操作可审计 + 敏感操作实时告警 + hash chain 防篡改"
kr4_completion: 20
metric1_id: "yiai-q4-m10"
metric1_desc: "高危漏洞数"
metric1_current: "TBD"
metric1_target: "0"
metric2_id: "yiai-q4-m11"
metric2_desc: "审计日志覆盖率 (写操作)"
metric2_current: "60%"
metric2_target: "100%"
metric3_id: "yiai-q4-m12"
metric3_desc: "数据合规检查通过率"
metric3_current: "70%"
metric3_target: "100%"
related_prds:
  - projects/yiai/prds/2026-Q4/04-需求-安全合规.md
  - projects/yiai/prds/2026-09/43-需求-敏感信息加密.md
  - projects/yiai/prds/2026-09/49-需求-CORS安全策略增强.md
  - projects/yiai/prds/2026-09/74-需求-GDPR数据清除.md
  - projects/yiai/prds/2026-09/89-需求-请求签名验证.md
  - projects/yiai/prds/2026-09/111-需求-日志敏感数据脱敏.md
  - projects/yiai/prds/2026-09/139-需求-密钥管理与凭证轮换.md
  - projects/yiai/prds/2026-09/145-需求-IP白名单与访问控制.md
  - projects/yiai/prds/2026-09/158-需求-依赖健康检查与供应链安全.md
  - projects/yiai/prds/2026-09/164-需求-Prompt注入防御.md
  - projects/yiai/prds/2026-09/186-需求-数据导出与合规删除.md
---

# 安全合规与数据治理

> Q4 安全治理目标。将 YiAi 从"功能优先"转变为"安全合规基线"——安全扫描集成 CI、审计日志完整不可篡改、数据合规可验证、访问控制精细。消除可能阻碍未来多租户和企业客户接入的安全短板。

---

## 背景

YiAi 当前安全机制以基础防护为主——JWT 认证 + X-Token 验证 + CORS 配置。在单开发者、内网部署的场景下，这套机制足够。但四个维度的安全债务会在团队扩大、多租户接入、企业客户上线时成为阻塞项：

**安全漏洞不可见**：无 SAST（静态应用安全测试）和 SCA（软件成分分析）集成。Python 依赖的已知 CVE（如 `aiohttp` 的历史漏洞 CVE-2024-23334）不会被自动发现。依赖版本锁定在 `requirements.txt`，安全更新靠开发者主动关注。

**数据生命周期不可控**：用户会话数据、聊天记录、上传文件无保留策略和过期机制。GDPR 要求的数据主体权利（删除/导出/更正）无自动化流程——用户无法自行删除数据，也无法导出个人数据。

**访问控制粗放**：Token 验证是全或无——持有有效 Token 即可访问所有端点。无 IP 白名单（管理后台可从任意 IP 访问）、无字段级权限（普通用户可看到其他用户的部分数据）、无请求签名验证（Token 被截获后可无限重放）。

**审计日志不完整**：Q3 新增的 `src/domain/audit/` 覆盖了约 60% 的写操作。但日志存储为纯 MongoDB 文档——可被直接修改，不具备合规审查要求的防篡改特性。敏感操作（权限变更、数据删除、配置修改）无实时告警。

Q4 需要在安全扫描、数据治理、访问控制、审计完整性四个维度建立符合企业级要求的安全基线。

---

## 季度演进

### 十月 — 安全扫描 + 审计日志完整性

**安全扫描集成 CI**（KR1）：
- SAST：Bandit（Python 代码静态分析）+ Semgrep（自定义规则：硬编码密钥、SQL 注入、命令注入）
- SCA：`pip-audit` 扫描 `requirements.txt` 和 `pyproject.toml` 中的已知 CVE
- Dependency：GitHub Dependabot / Renovate 自动化依赖更新 PR
- CI 阻断：高危/严重级别漏洞阻断构建；中危告警但不阻断

**审计日志完整性**（KR4）：
- 补全所有写操作的审计日志（从 60% → 100%）
- Hash chain 防篡改：每条审计日志的 hash = SHA-256(prev_hash + current_data)
- 日志完整性验证 API：`/audit/verify` 返回 hash chain 验证结果

### 十一月 — 数据治理 + 访问控制

**数据治理**（KR2）：
- 数据保留策略：会话（180 天）、日志（90 天）、临时文件（7 天）、Bug 报告（永久）
- 自动过期：`apscheduler` 定时任务清理过期数据
- GDPR 数据主体权利：用户数据导出（JSON/CSV）、用户数据删除（级联清理）、数据更正请求

**访问控制增强**（KR3）：
- IP 白名单：管理类端点（`/admin/*`、`/maintenance/*`）可配置源 IP 范围
- 字段级权限：基于角色（admin/developer/viewer）过滤数据响应字段
- 请求签名验证：HMAC-SHA256 签名 + timestamp + nonce 防重放

### 十二月 — 安全加固与合规验证

- **密钥管理**（KR1 延续）：JWT Secret、Auth Token、API Key 统一通过环境变量注入，禁止代码中硬编码；凭证轮换策略（90 天自动过期 + 企微提醒）
- **Prompt 注入防御**（KR4 延续）：用户输入和知识库内容在注入 LLM prompt 前做分隔标记（`<user_input>` / `<knowledge>`），防止知识库中的恶意内容劫持 Agent 指令
- **CORS 安全策略增强**：生产环境锁定 `origins` 白名单（禁止 `*`），开发环境例外
- **合规检查清单**：OWASP Top-10 对照检查、数据保护影响评估（DPIA）模板

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | 安全扫描 — SAST/SCA/Dependency 集成 CI + 高危清零 | 10% |
| KR2 | 数据治理 — GDPR 删除/导出 + 保留策略 + 自动过期 | 5% |
| KR3 | 访问控制 — IP 白名单 + 字段级权限 + 签名验证 + TOTP | 15% |
| KR4 | 审计完整性 — 100% 写操作覆盖 + Hash chain + 实时告警 | 20% |

---

## KR1 — 安全扫描集成 CI

### 现状

无自动化安全扫描。Python 依赖漏洞靠开发者手动关注安全公告。代码中的安全反模式（如硬编码密钥、`subprocess` 中使用 `shell=True`）在 Code Review 中可能被遗漏。

### 方案

**三层安全扫描**（`scripts/security_scan.sh`，集成到 GitHub Actions）：

**SAST（Bandit + Semgrep）**：

```yaml
# .github/workflows/security.yml
security-scan:
  steps:
    - name: Bandit SAST
      run: bandit -r src/ -f json -o bandit-report.json
    - name: Semgrep (custom rules)
      run: semgrep --config .semgrep/ src/
    - name: Check critical vulnerabilities
      run: |
        critical_count=$(jq '[.results[] | select(.issue_severity == "HIGH")] | length' bandit-report.json)
        if [ "$critical_count" -gt 0 ]; then
          echo "CRITICAL: $critical_count high-severity issues found"
          exit 1
        fi
```

自定义 Semgrep 规则（`.semgrep/`）：
- `no-hardcoded-secrets`：检测硬编码的 `SECRET_KEY`、`password`、`token` 赋值
- `no-shell-true`：检测 `subprocess.*(shell=True)`
- `no-bare-except`：检测 `except:` 裸异常捕获
- `no-request-body-log`：检测 `logger.*(request)` 敏感数据泄露

**SCA（pip-audit）**：
```bash
pip-audit --requirement requirements.txt --output json > sca-report.json
# 存在 HIGH/CRITICAL CVE → 阻断构建
```

**Dependency 自动化**：
- GitHub Dependabot 配置（`.github/dependabot.yml`）：每周检查 pip 依赖更新
- 安全更新自动创建 PR（标记 `security` label）
- 常规更新创建 PR（标记 `dependencies` label），由开发者决定合并

### 验证

- 在代码中插入 `SECRET_KEY = "test123"` → CI 运行 → Bandit 检测 → 构建失败（exit 1）
- `pip-audit` 发现 CVE-2024-23334 → 构建失败 + 控制台输出 CVE 描述和修复版本
- Dependabot 创建安全更新 PR → `pip install --upgrade aiohttp==3.9.4`

---

## KR2 — 数据治理与合规

### 现状

数据无保留策略——`sessions`、`bugs`、`static_files`、`knowledge_files` 等集合的数据永久保留。`static_files`（用户上传文件）中可能包含上传后废弃的临时文件，占用磁盘和 MongoDB 存储。

用户无法自行管理数据——删除聊天记录需要开发者手动操作 MongoDB。

### 方案

**数据保留策略**（`config.yaml` 的 `data_retention` 段）：

```yaml
data_retention:
  sessions: 180d        # 聊天会话：6 个月
  llm_usage: 365d       # Token 用量记录：1 年
  audit_logs: 730d      # 审计日志：2 年
  static_files: 90d     # 用户上传文件：3 个月
  query_logs: 30d       # 查询日志：1 个月
  bugs: permanent       # Bug 报告：永久保留
  knowledge_files: permanent  # 知识库索引：永久保留
```

**自动过期清理**（`src/services/maintenance/data_cleanup.py`）：
- `apscheduler` 每日凌晨 3:00 执行
- 对每个集合按 `created` 字段 + 保留策略删除过期文档
- `static_files` 清理同时删除磁盘文件
- 清理结果写入审计日志

**GDPR 数据主体权利**（`src/services/gdpr/`）：

| 权利 | API 端点 | 实现 |
|------|---------|------|
| 访问权 | `GET /gdpr/export/{user_id}` | 导出用户所有数据为 JSON/CSV zip 包 |
| 删除权 | `DELETE /gdpr/erase/{user_id}` | 级联删除用户数据（会话/Token/文件/日志） |
| 更正权 | `PUT /gdpr/correct/{user_id}` | 更正用户个人信息（用户名/邮箱） |
| 可携带权 | `GET /gdpr/portability/{user_id}` | 结构化机器可读格式导出 |

**删除确认门**：数据删除操作需要两步验证（TOTP）+ 冷静期（7 天恢复窗口，软删除后 7 天内可恢复）。

### 验证

- 创建 200 天前的测试会话 → 触发每日清理 → 会话被标记为 `expired` → 7 天后物理删除
- 调用 `/gdpr/export/user_a` → 返回 zip 包含 `sessions.json`、`usage.json`、`files/` 目录
- 调用 `/gdpr/erase/user_a` → 需要 TOTP 验证 → 确认后软删除 → 7 天后物理删除

---

## KR3 — 访问控制增强

### 现状

单一 Token 认证模型——持有有效 JWT 即可访问所有端点。安全隐患：
- 管理端点（`/maintenance/*`、模块执行）可从任意 IP 访问
- 同一 Token 可在不同角色间无权限区分（admin/developer/viewer 看到相同数据）
- Token 通过 HTTP Header 明文传输，被截获后可无限重放

### 方案

**IP 白名单**（`src/server/middleware/ip_whitelist.py`）：

```yaml
# config.yaml
security:
  ip_whitelist:
    admin_endpoints: ["10.0.0.0/8", "172.16.0.0/12"]  # 内网 IP 段
    maintenance_endpoints: ["127.0.0.1", "::1"]  # 仅本机
```

非白名单 IP 访问管理端点 → 返回 `403 Forbidden` + `X-Blocked-Reason: ip_not_whitelisted`。

**字段级权限**（`src/services/auth/field_permission.py`）：
- 数据查询响应根据角色过滤字段
- 示例：`/data/query sessions` → admin 看到完整文档（含 `user_id`, `messages`），viewer 仅看到 `title`, `tags`, `created`

**请求签名验证**（`src/services/auth/request_signer.py`）：
- HMAC-SHA256 签名：`signature = HMAC-SHA256(secret, method + path + timestamp + nonce + body_hash)`
- 请求头：`X-Signature: <signature>` + `X-Timestamp: <unix_ms>` + `X-Nonce: <random_uuid>`
- 服务端验证：时间戳偏差 <5min + nonce 未使用（Redis 缓存 5min）+ 签名匹配
- 适用于外部 API 调用方（签名验证替代 Token 认证）

**TOTP 两步验证**（`src/services/auth/totp.py`）：
- 敏感操作（数据删除、权限变更、配置修改）需要 TOTP 验证码
- 基于 `pyotp` 实现，兼容 Google Authenticator / 1Password
- TOTP Secret 通过用户初始化流程生成，QR Code 展示

### 验证

- 外网 IP 访问 `/maintenance/cleanup` → 403 `ip_not_whitelisted`
- Viewer 角色查询 sessions → 响应不含 `user_id` 和完整 `messages` 内容
- 无签名请求 → 401 `signature_required`（签名验证端点）
- 数据删除操作 → 弹出 TOTP 验证 → 输入 6 位验证码 → 验证通过后执行

---

## KR4 — 审计日志完整性

### 现状

Q3 在 `src/domain/audit/` 和 `src/services/audit/` 建立了基础审计能力。覆盖约 60% 的写操作（`create/update/delete` 在 data_service 层），但缺失：
- 配置变更审计（`config.yaml` 修改无记录）
- 权限变更审计（角色分配/权限修改无记录）
- 文件操作审计（`/read-file`、`/write-file` 不在审计范围）
- 日志可被直接修改（MongoDB 文档无防篡改特性）

### 方案

**审计覆盖补全**（`src/services/audit/audit_service.py`）：

每个审计事件记录：
```python
{
    "event_id": "uuid",
    "timestamp": "2026-09-23T10:30:00Z",
    "user_id": "user_xxx",
    "action": "delete_document",  # 操作类型
    "resource": "sessions/session_123",  # 资源路径
    "details": {"cname": "sessions", "filter": {"key": "session_123"}},  # 操作详情
    "result": "success",  # success / failure / denied
    "ip": "192.168.1.1",
    "trace_id": "abc123...",
    "prev_hash": "sha256_of_previous_entry",  # ← hash chain
    "hash": "sha256_of_this_entry"
}
```

**Hash chain 防篡改**：
```
entry[N].prev_hash = entry[N-1].hash
entry[N].hash     = SHA-256(entry[N-1].hash + JSON(entry[N].data))
```

验证 API `GET /audit/verify?from=2026-09-01&to=2026-09-23`：
- 重新计算 hash chain → 与存储值比对 → 返回 `{verified: true/false, broken_at: N}`
- hash chain 断裂 → 企微告警（"审计日志可能被篡改，断裂位置：event_id=xxx"）

**敏感操作实时告警**：
- 权限变更、数据删除、配置修改 → 即时企微推送
- 告警内容：操作人、操作类型、资源、时间、TraceID
- 异常模式检测：同一用户 5min 内超过 20 次删除操作 → 企微紧急告警 + 自动临时冻结 Token

### 验证

- 任意写操作 → `audit_logs` 集合出现对应审计记录 → hash chain 连续
- 手动修改 MongoDB 中的一条审计日志 → `GET /audit/verify` 返回 `verified: false, broken_at: N`
- 10min 内连续删除 30 条记录 → 企微告警（"异常：user_x 删除 30 条记录/10min"）+ Token 临时冻结

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 安全扫描产生大量误报导致 CI 频繁阻断 | 中 | 高 | 初始仅阻断 HIGH/CRITICAL，MEDIUM/LOW 告警不阻断；规则持续调优 |
| 数据保留策略误删除活跃数据 | 低 | 高 | 软删除 + 7 天恢复窗口；清理前备份；先在 `dev` 环境验证 1 周 |
| IP 白名单锁死正常用户（动态 IP 场景） | 中 | 中 | IP 白名单仅应用于管理端点，用户端点不受限；配置可热更新 |
| TOTP 设备丢失导致管理操作无法执行 | 低 | 中 | 恢复码（一次性）生成并提示用户安全保存 |
| Hash chain 计算影响写入性能 | 低 | 低 | 审计日志写入异步（`asyncio.create_task`），不阻塞主请求 |

---

## 交付里程碑

| 月份 | 里程碑 | 关键交付 |
|------|--------|---------|
| 10月第1周 | 安全扫描 CI 集成 | Bandit + Semgrep + pip-audit + GitHub Actions |
| 10月第2周 | 安全扫描规则调优 + 误报清零 | 自定义 Semgrep 规则 + 基线报告 |
| 10月第3周 | 审计日志 100% 覆盖写操作 | audit 中间件补全 + 文件/配置/权限审计 |
| 10月第4周 | Hash chain 防篡改 + 验证 API | `prev_hash` / `hash` + `/audit/verify` |
| 11月第1周 | 数据保留策略 + 自动过期 | `data_retention` 配置 + `data_cleanup.py` |
| 11月第2周 | GDPR 导出 + 删除 + 更正 | `src/services/gdpr/` + API 端点 |
| 11月第3周 | IP 白名单 + 字段级权限 | `ip_whitelist.py` + `field_permission.py` |
| 11月第4周 | 请求签名验证 + TOTP | `request_signer.py` + `totp.py` |
| 12月第1周 | 敏感操作实时告警 | 权限变更/删除/配置修改 → 企微即时推送 |
| 12月第2周 | 密钥管理 + 凭证轮换 | 环境变量注入 + 90 天轮换提醒 |
| 12月第3周 | Prompt 注入防御 + CORS 加固 | 输入分隔标记 + 生产环境 origins 白名单 |
| 12月第4周 | 合规检查清单 + OWASP Top-10 审查 | DPIA 模板 + 合规报告 |

---

## 影响

| 维度 | Q3 现状 | Q4 目标 |
|------|--------|--------|
| 安全漏洞检测 | 人工关注安全公告 | CI 自动化扫描，高危阻断构建 |
| 数据生命周期 | 永久保留，无自动清理 | 分级保留策略 + 自动过期 |
| GDPR 合规 | 无数据主体权利支持 | 删除/导出/更正/可携带 4 项权利 |
| 访问控制粒度 | 单一 Token = 全权限 | IP 白名单 + 字段级 + 签名 + TOTP |
| 审计日志覆盖率 | 60% 写操作 | 100% 写操作，含配置和权限变更 |
| 审计防篡改 | 无（MongoDB 文档可改） | Hash chain + 完整性验证 API |
| 敏感操作告警 | 无 | 实时企微告警 + 异常模式检测 |
| 服务可用性影响 | 无（安全维护不影响服务） | 无 |

---

## 未竟事项（Q1 2027 展望）

| 事项 | Q1 归属 |
|------|---------|
| SOC2 Type II 合规认证 | 安全合规专项 |
| 多租户数据隔离（Row-Level Security） | 企业版功能 |
| SIEM 集成（Splunk/ELK 日志汇聚） | 安全运维专项 |
| 渗透测试（第三方安全公司） | 安全合规专项 |
| 隐私计算（差分隐私 + 联邦学习） | AI + 安全交叉研究 |