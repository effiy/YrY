---
prd_task_id: "YV-09-201"
title: "YV-09-201: 用户安全设置 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "75-prd-用户安全设置.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户安全设置]
roles: [engineer]
benefit: "开发方案：task-用户安全设置"
lifecycle: active
---

# YV-09-201: 用户安全设置 — 开发方案

> 需求编号：YV-09-201 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么怎么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `SecuritySettings.vue` | 安全设置页面（标签页容器） | `src/views/settings/` |
| `PasswordChange.vue` | 修改密码表单 | `src/components/user/` |
| `TwoFactorSetup.vue` | 两步验证设置向导 | `src/components/user/` |
| `SessionList.vue` | 活跃会话列表 | `src/components/user/` |
| `LoginHistory.vue` | 登录历史记录表 | `src/components/user/` |
| `authStore.ts` | 认证相关操作（密码修改/TOTP） | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户安全设置页面：修改密码/两步验证/会话管理/登录历史。

### 架构方案

**技术路线**：独立路由页面 `/settings/security`，`el-tabs` 分组四个安全模块。各模块独立加载（懒加载 + KeepAlive 可选），操作通过 YiAi `auth_service` RPC 调用。敏感操作（密码修改、TOTP 启用）需当前密码验证。

**数据模型**：
```typescript
// 修改密码
interface PasswordChangeRequest {
  old_password: string;
  new_password: string;     // ≥ 8 字符，含大小写+数字+特殊字符
  confirm_password: string;
}

// 两步验证
interface TOTPSetup {
  enabled: boolean;
  secret?: string;          // TOTP 密钥（base32）
  recovery_codes: string[]; // 恢复码（10 个，一次性使用）
}

// 活跃会话
interface ActiveSession {
  session_id: string;
  device: string;           // 浏览器 + OS
  ip: string;
  location: string;         // IP 地理位置
  created_at: string;
  last_active: string;
  is_current: boolean;      // 是否为当前会话
}
```

**组件树**：
```
SecuritySettings.vue (el-tabs 容器)
├── PasswordChange.vue (Tab 1: 修改密码)
│   └── el-form (old_password + new_password + confirm_password) + 强度指示器
├── TwoFactorSetup.vue (Tab 2: 两步验证)
│   ├── Step 1: 扫描 QR 码（qrcode npm 包生成）
│   ├── Step 2: 输入 6 位验证码确认
│   └── Step 3: 显示恢复码（一次性展示，提供下载/复制）
├── SessionList.vue (Tab 3: 活跃会话)
│   └── ProTable (设备/IP/位置/时间) + 强制下线按钮
└── LoginHistory.vue (Tab 4: 登录历史)
    └── ProTable (时间/IP/设备/状态) + 异常登录标记
```

**数据流**：
```
PasswordChange: 
  el-form 提交 → 前端校验（长度/复杂度/确认一致）
    → authStore.changePassword({ old, new })
    → YiAi auth_service.change_password RPC
    → 成功: ElMessage + 清空表单
    → 失败: 显示错误原因（旧密码错误/复杂度不够）

TwoFactorSetup:
  点击启用 → 输入当前密码确认
    → YiAi auth_service.generate_totp_secret
    → 返回 secret + QR code URL
    → 用户扫描 → 输入 6 位验证码
    → YiAi auth_service.verify_and_enable_totp
    → 成功: 显示恢复码（仅此一次）+ 启用状态更新

SessionList:
  onMounted → YiAi auth_service.list_sessions
    → 渲染 ProTable
    → 强制下线: ElMessageBox.confirm → auth_service.revoke_session
    → 当前会话标记 "当前" + 不可强制下线
```

**关键决策**：
- 密码复杂度：≥ 8 字符 + 大写 + 小写 + 数字 + 特殊字符，前端实时显示强度条（弱/中/强）
- TOTP 恢复码：10 个 8 位随机码，生成时仅展示一次（安全考虑），使用后标记已用
- 强制下线：不能强制下线当前会话（按钮禁用），其他会话下线后立即从列表移除
- 异常登录检测：新 IP + 新设备登录 → 标记为 suspicious → 发送邮件/企微通知
- 安全日志：所有安全操作（密码修改、TOTP 启用/禁用、会话下线）记录到 MongoDB `security_log` 集合

### 设置项

| 设置 | 实现方式 | 安全要求 |
|------|---------|---------|
| 修改密码 | el-form + 强度指示器 + 当前密码验证 | 必须验证旧密码，新密码强度检测 |
| 两步验证 | 三步向导（QR→确认码→恢复码） | 启用/禁用均需当前密码确认 |
| 活跃会话 | ProTable + 强制下线按钮 | 当前会话不可下线 |
| 登录历史 | ProTable + 异常登录高亮 | 只读，异常登录自动标记 |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | SecuritySettings el-tabs 容器 + 路由 | 4 个 Tab 渲染 | 0.02 |
| 2 | PasswordChange 表单 + 强度指示器 | 校验+提交+成功/失败 | 0.08 |
| 3 | TwoFactorSetup 三步向导 | QR→验证码→恢复码 | 0.08 |
| 4 | SessionList + LoginHistory ProTable | 加载+强制下线+异常标记 | 0.07 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 4 个 Tab 正确渲染 + 独立加载
- [ ] 修改密码：旧密码验证 + 强度检测 + 成功/失败反馈
- [ ] 两步验证：QR 码扫描 → 验证码确认 → 恢复码展示
- [ ] 强制下线：确认对话框 → API 调用 → 列表更新
- [ ] 登录历史：异常登录（新IP+新设备）高亮标记
- [ ] 所有安全操作记录到 security_log
- [ ] 敏感操作（密码修改/TOTP 启用）需当前密码验证
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | SecuritySettings.vue |
| 组件 | 4 | PasswordChange + TwoFactorSetup + SessionList + LoginHistory |
| Store | 1 | authStore (密码修改/TOTP 操作) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 4 Tab 独立加载 + 懒渲染
- [x] 修改密码：强度检测 + 旧密码验证
- [x] 两步验证：三步向导完整流程
- [x] 恢复码仅展示一次（刷新后不可见）
- [x] 当前会话不可强制下线
- [x] 异常登录检测 + 高亮
- [x] 所有安全操作记录 security_log
- [x] `vue-tsc --noEmit` 通过