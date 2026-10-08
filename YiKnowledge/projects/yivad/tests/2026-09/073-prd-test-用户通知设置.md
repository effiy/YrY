---
title: "YV-09-199: 用户通知设置 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-199"
source_prds: ["73-prd-用户通知设置"]
source_modules: ["73-prd-task-用户通知设置"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 用户通知设置]
benefit: "测试用例：用户通知设置"
lifecycle: active
---

# YV-09-199: 用户通知设置 — 测试用例

> 来源 PRD：[73-prd-用户通知设置.md](../../prds/2026-09/73-prd-用户通知设置.md)
> 开发方案：[73-prd-task-用户通知设置.md](../../devs/2026-09/73-prd-task-用户通知设置.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | NotificationMatrix 复选框状态管理逻辑 | Vitest | 每次提交 |
| L2 组件 | NotificationPreferences 组件渲染与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Store ↔ API ↔ 组件数据流 | Vitest + mock | 每次提交 |
| L4 端到端 | 完整通知偏好设置流程 | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 7×3 复选框矩阵渲染 | CT + IT | ✅ 已完成 |
| FR-2 | 单复选框切换 + 自动保存 | CT + IT | ✅ 已完成 |
| FR-3 | 整列/整行批量切换 | CT + IT | ✅ 已完成 |
| FR-4 | 自动保存 debounce 1s | UT + IT | ✅ 已完成 |
| FR-5 | 企微列未集成时灰显 | CT | ✅ 已完成 |
| FR-6 | 重置为默认 + 确认 | CT + IT | ✅ 已完成 |

---

## L1 单元测试

### UT-01: 复选框矩阵状态管理

**GIVEN** notificationPrefs 初始值为 `{ 'issue.assigned': { in_app: true, email: false, wework: false } }`  
**WHEN** 调用 `togglePref('issue.assigned', 'email', true)`  
**THEN** `notificationPrefs['issue.assigned'].email` 应为 `true`  
**AND** 其他字段不受影响

### UT-02: 自动保存 debounce

**GIVEN** watch(notificationPrefs, deep:true) 配置了 debounce 1s  
**WHEN** 在 500ms 内连续切换 3 个复选框  
**THEN** API 调用次数应为 1 次（而非 3 次）  
**AND** 最后一次切换后 1s 触发 API 调用

### UT-03: 整列批量切换

**GIVEN** 7 个事件类型的 `email` 通道状态各不相同  
**WHEN** 调用 `toggleColumn('email', true)`  
**THEN** 所有 7 个事件类型的 `email` 通道应全部为 `true`

---

## L2 组件测试

### CT-01: 矩阵渲染

**GIVEN** NotificationMatrix 组件挂载，传入 7 种事件类型 × 3 种渠道  
**WHEN** 渲染完成  
**THEN** 应显示 7 行（事件类型）× 4 列（类型标签 + 3 个渠道复选框）  
**AND** 每行标签正确显示事件类型中文名

### CT-02: 整列切换按钮

**GIVEN** 用户在矩阵列头点击「全部启用」  
**WHEN** 该列所有复选框变为选中  
**THEN** 列头按钮文字变为「全部禁用」  
**AND** 再次点击 → 全部取消选中

### CT-03: 企微灰显

**GIVEN** YiAi 企业微信集成未配置  
**WHEN** 渲染企微列  
**THEN** 企微列所有复选框应为 `disabled` 状态  
**AND** hover 时 tooltip 显示「企业微信集成未配置」

### CT-04: 重置确认

**GIVEN** 用户修改了 3 个偏好设置  
**WHEN** 点击「重置为默认」按钮  
**THEN** 应弹出 ElMessageBox.confirm「确定重置为默认设置？」  
**AND** 确认后所有偏好恢复为默认值（仅 in_app=true）  
**AND** 自动保存触发

---

## L3 集成测试

### IT-01: 偏好加载

**GIVEN** 用户在 MongoDB 中已保存通知偏好  
**WHEN** 打开 `/settings/notifications` 页面  
**THEN** 复选框矩阵应正确反映已保存的偏好  
**AND** 加载过程中显示 skeleton 占位

### IT-02: 偏好保存

**GIVEN** 用户切换了「Bug 变更」的「邮件通知」为 true  
**WHEN** debounce 1s 后触发 API 调用  
**THEN** YiAi `data_service.update_document("users", { notification_prefs })` 应被调用  
**AND** 保存成功后 SaveStatusIndicator 显示「已保存」

### IT-03: 保存失败重试

**GIVEN** YiAi API 返回错误（网络故障）  
**WHEN** 自动保存触发  
**THEN** SaveStatusIndicator 显示「保存失败」+ 重试按钮  
**AND** 点击重试 → 重新调用 API

---

## L4 端到端场景

### E2E-01: 完整通知偏好设置流程

1. 用户登录 → 导航到 `/settings/notifications`
2. 查看当前偏好：所有事件仅「站内通知」启用
3. 开启「@提及」的「邮件通知」  
4. 等待 1s → 状态指示器显示「已保存」
5. 刷新页面 → 偏好保持（邮件通知仍为开启）
6. 点击「重置为默认」→ 确认 → 所有偏好恢复默认

### E2E-02: 企微未集成场景

1. 管理员未配置企微集成
2. 用户打开通知设置页面
3. 企微列所有复选框灰显（disabled）
4. Hover 显示 tooltip「企业微信集成未配置」
5. 管理员配置企微集成后 → 刷新页面 → 企微列可正常操作