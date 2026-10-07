---
title: "YV-09-201: 用户安全设置 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-201"
source_prds: ["75-prd-用户安全设置"]
source_modules: ["75-prd-task-用户安全设置"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 用户安全设置]
benefit: "测试用例：用户安全设置"
lifecycle: active
---

# YV-09-201: 用户安全设置 — 测试用例

> 来源 PRD：[75-prd-用户安全设置.md](../../prds/2026-09/75-prd-用户安全设置.md)
> 开发方案：[75-prd-task-用户安全设置.md](../../devs/2026-09/75-prd-task-用户安全设置.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | 密码强度检测、TOTP 状态管理逻辑 | Vitest | 每次提交 |
| L2 组件 | 4 个 Tab 组件渲染与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Store ↔ API ↔ 组件数据流 | Vitest + mock | 每次提交 |
| L4 端到端 | 密码修改 + TOTP 设置完整流程 | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 修改密码（密码验证+强度检测） | CT + IT | ✅ 已完成 |
| FR-2 | 两步验证设置向导（QR→验证码→恢复码） | CT + IT | ✅ 已完成 |
| FR-3 | 活跃会话管理（查看+强制下线） | CT + IT | ✅ 已完成 |
| FR-4 | 登录历史记录 | CT | ✅ 已完成 |
| FR-5 | 安全操作审计日志 | IT | ✅ 已完成 |

---

## L1 单元测试

### UT-01: 密码强度检测

**GIVEN** `checkPasswordStrength(password)` 函数  
**WHEN** password = `"abc"`  
**THEN** 返回 `{ level: 'weak', score: 1, message: '太短' }`  
**WHEN** password = `"abcdefgh"`  
**THEN** 返回 `{ level: 'medium', score: 2 }`  
**WHEN** password = `"Abc123!@#"`  
**THEN** 返回 `{ level: 'strong', score: 4 }`（大写+小写+数字+特殊字符）

### UT-02: TOTP 恢复码生成

**GIVEN** TOTP 启用成功  
**WHEN** 后端返回 `recovery_codes: string[]`  
**THEN** 应包含 10 个恢复码  
**AND** 每个恢复码为 8 位字母数字

### UT-03: 当前会话不可下线

**GIVEN** 会话列表中包含 `is_current: true` 的会话  
**WHEN** 调用 `canRevoke(session)`  
**THEN** 对当前会话返回 `false`  
**AND** 对其他会话返回 `true`

---

## L2 组件测试

### CT-01: SecuritySettings Tab 切换

**GIVEN** SecuritySettings 组件挂载  
**WHEN** 渲染 4 个 Tab（修改密码/两步验证/活跃会话/登录历史）  
**THEN** 默认激活第一个 Tab（修改密码）  
**AND** 点击其他 Tab → 正确切换内容

### CT-02: PasswordChange 表单校验

**GIVEN** PasswordChange 表单渲染  
**WHEN** 输入新密码 `"abc"` → 失焦  
**THEN** 应显示校验错误「密码长度至少 8 字符」  
**WHEN** 新密码与确认密码不一致  
**THEN** 应显示「两次输入的密码不一致」

### CT-03: TwoFactorSetup 向导步骤

**GIVEN** 用户点击「启用两步验证」  
**WHEN** Step 1: 输入当前密码确认  
**THEN** 验证通过 → Step 2: 显示 QR 码  
**WHEN** Step 2: 输入正确的 6 位验证码  
**THEN** 验证通过 → Step 3: 显示 10 个恢复码  
**AND** 提供「复制」和「下载」按钮

### CT-04: 恢复码仅展示一次

**GIVEN** TwoFactorSetup Step 3 显示恢复码  
**WHEN** 用户关闭对话框 → 重新打开两步验证设置  
**THEN** 恢复码不再显示（仅显示「已启用」状态）

### CT-05: SessionList 当前会话保护

**GIVEN** 会话列表中包含当前会话  
**WHEN** 渲染列表  
**THEN** 当前会话行高亮（蓝色背景）  
**AND** 强制下线按钮 disabled + tooltip「无法下线当前会话」

---

## L3 集成测试

### IT-01: 修改密码完整流程

**GIVEN** 用户输入旧密码 + 新密码 + 确认密码  
**WHEN** 点击「修改密码」  
**THEN** `authStore.changePassword({ old, new })` 被调用  
**AND** 成功: ElMessage.success + 清空表单  
**AND** 失败: ElMessage.error + 显示错误原因（旧密码错误/复杂度不够）  
**AND** 操作记录到 `security_events` 集合

### IT-02: 强制下线完整流程

**GIVEN** 用户点击某会话的「强制下线」  
**WHEN** 确认对话框 → 确认  
**THEN** `auth_service.revoke_session(session_id)` 被调用  
**AND** 成功: 该会话从列表中移除 + ElMessage.success  
**AND** 被下线用户刷新页面 → 跳转登录页（Token 被加入黑名单）

### IT-03: 安全操作审计

**GIVEN** 用户完成密码修改  
**WHEN** 检查 `security_events` 集合  
**THEN** 应存在一条 `event_type: 'password.changed'` 记录  
**AND** 记录包含 `user_id`, `ip`, `created_at` 字段

---

## L4 端到端场景

### E2E-01: 密码修改完整流程

1. 用户登录 → 导航到 `/settings/security`
2. 在「修改密码」Tab 输入旧密码（正确）
3. 输入新密码 `MyNewP@ss1`（强度: 强）
4. 确认新密码一致 → 点击「修改密码」
5. 成功提示 → 表单清空
6. 退出登录 → 用新密码登录 → 成功

### E2E-02: TOTP 设置完整流程

1. 用户 → 安全设置 → 两步验证 Tab
2. 点击「启用」→ 输入当前密码确认
3. 扫描 QR 码 → Google Authenticator 添加账户
4. 输入 Authenticator 显示的 6 位验证码
5. 验证通过 → 显示 10 个恢复码
6. 复制恢复码 → 安全保存 → 关闭对话框
7. 重新打开 → 显示「已启用」状态（恢复码不再可见）