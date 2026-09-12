---
doc_type: test
title: "YV-09-130: 用户会话管理 — 活跃会话查看、强制下线、会话超时配置、并发会话限制 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-130"
source_prds: ["60-prd-用户会话管理"]
source_modules: []
---
# YV-09-130: 用户会话管理 — 活跃会话查看、强制下线、会话超时配置、并发会话限制 — 测试规格

> 来源 PRD：[60-prd-用户会话管理.md](../../prds/2026-09/60-prd-用户会话管理.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：管理员查看所有活跃会话

**GIVEN** 管理员已登录，系统中有 5 个活跃会话
**WHEN** 管理员访问 `/system/sessions` 页面
**THEN** 应显示 5 个会话，包含用户名、IP、设备、登录时间、最后活跃时间
**AND** 会话按最后活跃时间倒序排列
**AND** 顶部统计卡片显示活跃 5、闲置 0

### 场景 2：管理员强制下线指定会话

**GIVEN** 管理员在会话管理页面，用户张三有一个活跃会话
**WHEN** 管理员点击张三会话的"强制下线"按钮并确认
**THEN** 该会话状态变为 revoked
**AND** 张三的下一次请求返回 401 "Token 已被撤销"
**AND** session_activities 中记录一条 action=revoke 的日志

### 场景 3：并发会话限制 — 拒绝新登录

**GIVEN** 系统配置 max_concurrent=2，strategy=reject，用户李四已有 2 个活跃会话
**WHEN** 李四在第三台设备上尝试登录
**THEN** 登录请求返回错误 "并发会话数已达上限"
**AND** 不可创建第三个会话

### 场景 4：并发会话限制 — 踢出最旧会话

**GIVEN** 系统配置 max_concurrent=2，strategy=kick_oldest，用户王五已有 2 个活跃会话
**WHEN** 王五在第三台设备上登录
**THEN** 最旧的会话被撤销（Token 加入黑名单）
**AND** 新会话创建成功，王五在新设备登录成功
**AND** 旧设备的下一次请求返回 401

### 场景 5：会话超时自动过期

**GIVEN** 用户赵六在 08:00 登录，会话超时配置为 4 小时
**WHEN** 系统定时清理任务在 12:01 执行
**THEN** 赵六的会话状态变为 expired
**AND** 赵六的下一次请求返回 401 "Token 已过期"

### 场景 6：普通用户查看自己的会话

**GIVEN** 普通用户孙七已登录，有 2 个活跃会话
**WHEN** 孙七访问 `/user/my-sessions` 页面
**THEN** 仅显示孙七自己的 2 个会话
**AND** 不显示其他用户的会话
**AND** 可以下线自己的会话

---

