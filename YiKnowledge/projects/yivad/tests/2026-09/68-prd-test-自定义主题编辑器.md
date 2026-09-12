---
doc_type: test
title: "YV-09-138: 自定义主题编辑器 — 可视化主题编辑器、主色/辅色/强调色、圆角/字号/间距Token、实时预览示例组件、导出导入主题JSON、浅色/深色变体 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-138"
source_prds: ["68-prd-自定义主题编辑器"]
source_modules: []
---
# YV-09-138: 自定义主题编辑器 — 可视化主题编辑器、主色/辅色/强调色、圆角/字号/间距Token、实时预览示例组件、导出导入主题JSON、浅色/深色变体 — 测试规格

> 来源 PRD：[68-prd-自定义主题编辑器.md](../../prds/2026-09/68-prd-自定义主题编辑器.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：修改主色并预览

**GIVEN** 用户打开主题编辑器
**WHEN** 用户将主色修改为 #E60012（红色）
**THEN** 预览面板中所有主要按钮立即变为红色
**AND** 主色的 hover/active/disabled/light 派生色自动计算
**AND** 页面全局的 primary 色相关组件（Tag、Badge、链接）全部变为红色
**AND** TDesign CSS变量 `--td-brand-color` 同步更新

### 场景 2：调整圆角 Token

**GIVEN** 用户打开设计Token编辑Tab
**WHEN** 用户将 base 圆角从 6px 拖动到 12px
**THEN** 预览面板中的按钮、输入框、卡片圆角明显变圆
**AND** small/large 圆角按比例自动调整（如果设置了比例联动）
**AND** 全局所有使用 `--yi-radius-base` 的组件同步更新

### 场景 3：导出和导入主题

**GIVEN** 用户在开发环境配置了一套主题（主色 #1A73E8, 圆角 8px, 间距 20px）
**WHEN** 用户点击"导出主题"
**THEN** 浏览器下载 `yi-theme-2026-09-09.json`，包含完整主题配置
**WHEN** 用户在另一个浏览器/环境中打开主题编辑器，点击"导入"，选择该JSON文件
**THEN** 导入成功，主题立即应用——颜色和Token与导出时完全一致
**AND** 导入后 localStorage 更新，刷新页面后主题保持

### 场景 4：深色模式品牌色覆盖

**GIVEN** 用户已配置浅色主色为 #1A73E8
**WHEN** 用户切换到深色模式编辑Tab
**THEN** 显示深色主色的自动推导值（如 #8AB4F8）
**AND** 标注为"自动"
**WHEN** 用户手动将深色主色改为 #A0C4FF
**THEN** 标注变为"已覆盖"
**AND** 切换到深色模式时，主色使用 #A0C4FF 而非自动推导值

### 场景 5：预设主题切换

**GIVEN** 用户打开了主题编辑器
**WHEN** 用户点击"预设主题"→选择"Material Design"主题
**THEN** 主题立即切换为 Google Material 风格（主色 #6200EE, 圆角 4px）
**AND** 预览面板更新
**AND** 用户可在预设基础上继续自定义
**AND** isDirty 标记为 true

### 场景 6：恢复默认主题

**GIVEN** 用户已将主题修改得面目全非
**WHEN** 用户点击"恢复默认"
**THEN** 弹出确认对话框
**WHEN** 用户确认
**THEN** 所有颜色和Token恢复为 YiVad 默认值
**AND** localStorage 中自定义主题被清除
**AND** 页面完全恢复为默认样式

---

