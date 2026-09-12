---
doc_type: test
title: "YV-09-132: 两步验证设置 — TOTP 配置与 QR 码、备用码生成与管理、2FA 恢复流程、2FA 启用统计 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-132"
source_prds: ["62-prd-两步验证设置"]
source_modules: []
---
# YV-09-132: 两步验证设置 — TOTP 配置与 QR 码、备用码生成与管理、2FA 恢复流程、2FA 启用统计 — 测试规格

> 来源 PRD：[62-prd-两步验证设置.md](../../prds/2026-09/62-prd-两步验证设置.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：设置 2FA

**GIVEN** 用户未启用 2FA
**WHEN** 用户在安全设置页面点击"开始设置两步验证"
**THEN** 系统生成 TOTP 种子密钥 + QR 码
**AND** QR 码显示在页面上（base64 PNG）
**AND** 同时显示手动输入密钥（base32 格式）

### 场景 2：验证并启用 2FA

**GIVEN** 用户已扫描 QR 码，身份验证器 App 中显示 6 位验证码
**WHEN** 用户输入正确的 6 位验证码并提交
**THEN** 2FA 状态变为"已启用"
**AND** 生成 10 个备用码并展示给用户
**AND** 备用码以 `XXXX-XXXX-XXXX` 格式显示

### 场景 3：登录时验证 2FA

**GIVEN** 用户已启用 2FA
**WHEN** 用户输入正确的用户名和密码
**THEN** 返回 `{ require_2fa: true, temp_token }` 而非 JWT
**AND** 前端跳转到 2FA 验证页面
**AND** 用户输入正确的 6 位 TOTP 验证码后获得完整 JWT Token

### 场景 4：使用备用码登录

**GIVEN** 用户已启用 2FA，但手机丢失无法获取 TOTP
**WHEN** 用户在 2FA 验证页面输入一个未使用的备用码
**THEN** 备用码验证通过，返回完整 JWT Token
**AND** 该备用码被标记为已使用，不可再次使用

### 场景 5：管理员强制启用 2FA

**GIVEN** 系统配置中 2FA 策略设为"强制管理员"
**WHEN** 未启用 2FA 的管理员账号登录
**THEN** 登录成功后跳转到 2FA 设置页面
**AND** 在完成 2FA 设置前，其他管理功能不可用

### 场景 6：管理员重置用户 2FA

**GIVEN** 用户已启用 2FA 但丢失了手机和备用码
**WHEN** 管理员在用户管理页面执行"重置 2FA"
**THEN** 用户的 2FA 被禁用
**AND** 用户的备用码被清除
**AND** 审计日志中记录恢复操作（操作人和目标用户）

---

