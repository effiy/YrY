---
title: "YV-09-62: 系统设置管理面板 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-62"
source_prds: ["30-prd-系统设置管理面板"]
source_modules: ["30-prd-task-系统设置管理面板"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 系统设置管理面板]
benefit: "测试用例：系统设置管理面板"
lifecycle: active
---

# YV-09-62: 系统设置管理面板 — 测试用例

> 来源 PRD：[30-prd-系统设置管理面板.md](../../prds/2026-09/30-prd-系统设置管理面板.md)
> 开发方案：[30-prd-task-系统设置管理面板.md](../../devs/2026-09/30-prd-task-系统设置管理面板.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | 设置值校验逻辑 | Vitest | 每次提交 |
| L2 组件 | SystemSettingsForm 表单渲染与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Store ↔ API ↔ 组件数据流 | Vitest + mock | 每次提交 |
| L4 端到端 | 完整设置编辑→保存→验证流程 | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 系统设置表单渲染（分组 tabs） | CT | ✅ |
| FR-2 | 设置项编辑 + 校验 | CT + IT | ✅ |
| FR-3 | 设置保存 + 实时预览 | CT + IT | ✅ |
| FR-4 | 敏感设置二次确认 | CT + IT | ✅ |
| FR-5 | 设置变更审计日志 | IT | ✅ |

---

## L1 单元测试

### UT-01: 设置值校验

**GIVEN** `validateSetting('site_name', '')`  
**THEN** 返回 `{ valid: false, message: '站点名称不能为空' }`  
**GIVEN** `validateSetting('items_per_page', 0)`  
**THEN** 返回 `{ valid: false, message: '每页条数必须 ≥ 1' }`  
**GIVEN** `validateSetting('session_timeout', 30)`  
**THEN** 返回 `{ valid: true }`（范围 5-1440 分钟）

---

## L2 组件测试

### CT-01: 表单分组渲染

**GIVEN** SystemSettingsForm 组件挂载  
**THEN** 应显示分组 tabs：基本设置/安全策略/通知配置/外观设置  
**AND** 默认激活「基本设置」tab

### CT-02: 设置编辑 + 保存

**GIVEN** 管理员修改站点名称为「My YiVad」  
**WHEN** 点击「保存」  
**THEN** `systemStore.updateSettings({ site_name: 'My YiVad' })` 被调用  
**AND** 成功后 ElMessage.success + 预览区即时更新

### CT-03: 敏感设置二次确认

**GIVEN** 管理员修改「安全策略」tab 中的「登录失败锁定次数」  
**WHEN** 点击「保存」  
**THEN** 弹出 ElMessageBox.confirm「修改安全设置需要确认」  
**AND** 确认后保存生效

### CT-04: 设置预览

**GIVEN** 管理员修改「外观设置」中的 Logo URL  
**WHEN** 输入新的 URL → 失焦  
**THEN** 预览区 Logo 实时更新（debounce 500ms）

---

## L3 集成测试

### IT-01: 设置加载

**GIVEN** MongoDB `system_settings` 集合中存在已保存的设置  
**WHEN** 管理员打开 `/system/settings` 页面  
**THEN** 表单正确填充已保存的值  
**AND** 加载过程中显示 skeleton

### IT-02: 设置保存完整流程

**GIVEN** 管理员修改了 3 个设置项  
**WHEN** 点击「保存」  
**THEN** `data_service.update_document("system_settings", ...)` 被调用  
**AND** 成功后返回更新后的设置 → 表单保持最新值  
**AND** 操作记录到 `activity_log` 集合（操作人/时间/变更项）

### IT-03: 保存失败恢复

**GIVEN** YiAi API 返回错误  
**WHEN** 保存操作触发  
**THEN** 显示 ElMessage.error + 表单回滚到修改前的值

---

## L4 端到端场景

### E2E-01: 完整设置编辑流程

1. 管理员登录 → 导航到 `/system/settings`
2. 在「基本设置」tab: 修改站点名称 → 点击保存 → 成功提示
3. 切换到「安全策略」tab: 修改登录锁定次数 → 保存 → 二次确认弹窗 → 确认 → 成功
4. 切换到「外观设置」tab: 修改 Logo URL → 预览区实时更新
5. 刷新页面 → 所有设置保持不变