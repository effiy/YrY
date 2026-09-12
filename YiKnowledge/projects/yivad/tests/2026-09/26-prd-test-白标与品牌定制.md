---
doc_type: test
title: "白标与品牌定制 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-52"
source_prds: ["26-prd-白标与品牌定制"]
source_modules: []
---
# 白标与品牌定制 — 测试规格

> 来源 PRD：[26-prd-白标与品牌定制.md](../../prds/2026-09/26-prd-白标与品牌定制.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### Scenario 1: 品牌配置加载
- **GIVEN** 系统中已为当前租户配置了品牌（主题色 `#16a34a`，应用名称"绿洲管理"）
- **WHEN** 用户打开 YiVad 应用
- **THEN** 页面加载后，浏览器标题显示"绿洲管理"，Element Plus 主题色变为绿色，侧边栏显示自定义 Logo 和"绿洲管理"标题

### Scenario 2: 更新品牌主题色
- **GIVEN** 管理员打开品牌配置页面
- **WHEN** 管理员在颜色选择器中选择 `#dc2626`（红色），点击保存
- **THEN** 页面主题色立即切换为红色，所有按钮、链接、高亮元素使用红色系，BrandPreview 组件实时显示红色主题效果

### Scenario 3: 上传自定义 Logo
- **GIVEN** 管理员打开品牌配置页面
- **WHEN** 管理员点击 Logo 上传区域，选择一张 PNG 图片（200x60px），点击保存
- **THEN** 侧边栏和登录页显示新上传的 Logo，Logo 保持原始宽高比，容器内自适应缩放

### Scenario 4: 登录页品牌定制
- **GIVEN** 管理员已配置登录页背景图和欢迎语"欢迎使用绿洲管理系统"
- **WHEN** 用户访问登录页
- **THEN** 登录页背景显示自定义图片，中央显示 Logo 和"欢迎使用绿洲管理系统"文字，登录表单样式与主题色一致

### Scenario 5: 品牌配置导出导入
- **GIVEN** 管理员已配置完整的品牌设置
- **WHEN** 管理员点击"导出配置"按钮，下载 JSON 文件；然后在另一个环境中点击"导入配置"，选择该 JSON 文件
- **THEN** 导入后品牌配置与原环境完全一致，包括主题色、Logo URL、应用名称等所有字段

### Scenario 6: 重置为默认品牌
- **GIVEN** 当前品牌配置已修改为自定义品牌
- **WHEN** 管理员点击"重置为默认"按钮并确认
- **THEN** 所有品牌配置恢复为默认值（主题色 `#409eff`、应用名称"YiVad"），页面外观恢复为默认样式

---

