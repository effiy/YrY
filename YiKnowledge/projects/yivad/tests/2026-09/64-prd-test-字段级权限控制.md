---
doc_type: test
title: "YV-09-134: 字段级权限控制 — 按角色显隐字段、只读字段、数据脱敏、字段访问审计、项目级字段权限 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-134"
source_prds: ["64-prd-字段级权限控制"]
source_modules: []
---
# YV-09-134: 字段级权限控制 — 按角色显隐字段、只读字段、数据脱敏、字段访问审计、项目级字段权限 — 测试规格

> 来源 PRD：[64-prd-字段级权限控制.md](../../prds/2026-09/64-prd-字段级权限控制.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：管理员配置字段权限规则

**GIVEN** 管理员登录，访问字段权限配置页面
**WHEN** 管理员选择角色"普通成员"、项目"项目 A"、表单"bugs"，设置 cost 字段 visibility=hidden
**THEN** 规则保存成功
**AND** 再次加载该角色 + 项目 + 表单的权限配置时，cost 字段显示为 hidden

### 场景 2：普通成员查看 Bug 表单时敏感字段被隐藏

**GIVEN** 管理员已配置 cost 字段对普通成员隐藏
**WHEN** 普通成员打开项目 A 的 Bug 编辑表单
**THEN** cost 字段不显示（display: none）
**AND** 表单其他字段正常显示
**AND** 提交时 cost 字段值不会被修改（使用原始值）

### 场景 3：只读字段无法编辑

**GIVEN** 管理员已配置 priority 字段对普通成员为 readonly
**WHEN** 普通成员打开 Bug 编辑表单
**THEN** priority 字段显示但输入框为 disabled 状态
**AND** 输入框有 visual indicator（灰色背景、锁图标）

### 场景 4：手机号脱敏展示

**GIVEN** 管理员配置 phone 字段 masking=partial, masking_pattern="138****1234"
**WHEN** 任何角色在成员列表中查看
**THEN** 手机号显示为 "138****1234"
**AND** 详情页同样脱敏显示
**AND** 仅管理员角色可看到完整手机号

### 场景 5：项目级字段权限覆盖全局规则

**GIVEN** 全局规则中 cost 对普通成员 hidden，但项目 B 中 cost 对普通成员 visible
**WHEN** 普通成员在项目 B 中查看 Bug 表单
**THEN** cost 字段可见（项目级规则优先）
**AND** 在项目 A 中 cost 字段仍隐藏

### 场景 6：字段访问审计日志

**GIVEN** 用户查看了一个包含脱敏字段 phone 的成员详情
**WHEN** 管理员查看字段访问审计日志
**THEN** 日志显示用户 ID、字段名 phone、操作类型 mask_view、时间戳
**AND** 可筛选按用户、字段、时间段查看

---

