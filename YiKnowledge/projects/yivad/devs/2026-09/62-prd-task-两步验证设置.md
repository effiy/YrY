---
prd_task_id: "YV-09-132"
title: "YV-09-132: 两步验证设置 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "62-prd-两步验证设置.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 两步验证设置]
roles: [engineer]
benefit: "开发方案：task-两步验证设置"
lifecycle: active
---

# YV-09-132: 两步验证设置 — 开发方案

> 需求编号：YV-09-132 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

TOTP 两步验证：扫码绑定 → 验证码确认 → 启用/禁用。

### 流程

```
1. 用户进入安全设置
2. 点击「启用两步验证」
3. 扫码绑定（二维码 + 手动密钥）
4. 输入 6 位验证码确认
5. 保存恢复码（一次性展示）
```

> 依赖 YiAi 后端 TOTP 服务。


### 架构方案

**技术路线**：用户设置子页面 (`/settings/security`)，TOTP 设置向导（QR 码扫描 → 验证码确认 → 恢复码生成）

**数据模型**：
```
MongoDB `users` 增加字段：`totp_secret`, `totp_enabled`, `recovery_codes[]`
```

**组件树**：
```
TwoFactorSetup.vue (三步向导) + RecoveryCodes.vue (恢复码展示/重新生成)
```

**关键决策**：
TOTP 使用标准 RFC 6238；QR 码生成使用 `qrcode` npm 包；恢复码为一次性使用，使用后标记为已用


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
