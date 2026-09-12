---
doc_type: test
title: "YV-09-133: 安全事件日志 — 登录失败/密码修改/权限变更/API 密钥使用记录、严重度分级、实时告警、安全仪表盘 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-133"
source_prds: ["63-prd-安全事件日志"]
source_modules: []
---
# YV-09-133: 安全事件日志 — 登录失败/密码修改/权限变更/API 密钥使用记录、严重度分级、实时告警、安全仪表盘 — 测试规格

> 来源 PRD：[63-prd-安全事件日志.md](../../prds/2026-09/63-prd-安全事件日志.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：记录登录失败安全事件

**GIVEN** 用户尝试登录但密码错误
**WHEN** 登录请求返回 401
**THEN** `security_events` 集合中插入一条 login_failure 事件
**AND** severity 为 medium
**AND** 事件包含 actor（IP + User-Agent）和 details（失败原因）

### 场景 2：检测暴力破解

**GIVEN** 同一 IP 在 5 分钟内登录失败 10 次
**WHEN** 第 10 次登录失败
**THEN** 记录一条 login_failure_brute 事件
**AND** severity 为 critical
**AND** 触发企业微信实时告警
**AND** 前端安全仪表盘显示未确认 critical 事件数 +1

### 场景 3：记录权限变更事件

**GIVEN** 管理员将用户张三的角色从"普通用户"提升为"管理员"
**WHEN** 权限变更操作成功
**THEN** 记录一条 admin_privilege_esc 事件
**AND** severity 为 critical
**AND** target 包含被操作用户信息

### 场景 4：查询安全事件

**GIVEN** 系统中有 100 条安全事件
**WHEN** 管理员访问安全事件列表，筛选 severity=critical，时间范围=近 7 天
**THEN** 显示匹配的 critical 事件列表
**AND** 列表包含时间、类型、严重度、操作人、目标、详情
**AND** 支持分页

### 场景 5：安全仪表盘数据聚合

**GIVEN** 近 7 天有 50 条安全事件
**WHEN** 管理员访问安全仪表盘
**THEN** 显示按严重度分布（critical: 3, high: 8, medium: 25, low: 14）
**AND** 显示事件类型 Top 10
**AND** 显示每日趋势折线图
**AND** 显示未确认 critical 事件数

### 场景 6：管理员确认安全事件

**GIVEN** 有一条未确认的 critical 安全事件
**WHEN** 管理员点击"确认"按钮
**THEN** 事件 acknowledged 变为 true
**AND** 记录确认人 username 和确认时间
**AND** 未确认 critical 事件计数 -1

---

