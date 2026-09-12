---
doc_type: module
prd_task_id: "YV-09-132"
title: "YV-09-132: 两步验证设置 — TOTP 配置与 QR 码、备用码生成与管理、2FA 恢复流程、2FA 启用统计 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "62-prd-两步验证设置.md"
---

# YV-09-132: 两步验证设置 — TOTP 配置与 QR 码、备用码生成与管理、2FA 恢复流程、2FA 启用统计 — 开发任务

> 来源 PRD：[62-prd-两步验证设置.md](../prds/2026-09/62-prd-两步验证设置.md)
> 需求编号：YV-09-132 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 AES-256-GCM 加解密工具 | `YiAi/services/auth/crypto_util.py` | 加解密往返正确 | 0.03 |
| 2 | 实现 TwoFactorService（设置 + 验证） | `YiAi/services/auth/two_factor_service.py` | TOTP 生成/验证正确 | 0.05 |
| 3 | 实现备用码生成与验证 | `YiAi/services/auth/two_factor_service.py` | 验码正确 + 一次性使用 | 0.03 |
| 4 | 实现恢复流程 | `YiAi/services/auth/recovery_service.py` | 管理员可重置 2FA | 0.02 |
| 5 | 修改登录接口集成 2FA | `YiAi/services/auth/login_handler.py` | 含 2FA 的完整登录流程 | 0.04 |
| 6 | 实现 YiVad 2FA 设置向导 | `YiVad/src/views/user/two-factor-setup.vue` | QR 码 → 验证 → 备用码 | 0.06 |
| 7 | 实现登录流程 2FA 验证页 + 管理统计 | `YiVad/src/views/auth/two-factor-verify.vue` + stats | 完整登录流程 + 统计 | 0.04 |
| 8 | 路由注册 + 测试 | 路由文件 + 测试文件 | 端到端验证 | 0.03 |

**总人天：0.3d**

---
