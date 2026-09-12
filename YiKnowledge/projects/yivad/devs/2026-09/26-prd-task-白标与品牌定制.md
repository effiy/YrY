---
doc_type: module
prd_task_id: "YV-09-52"
title: "白标与品牌定制 — 开发任务"
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
source_prd: "26-prd-白标与品牌定制.md"
---

# 白标与品牌定制 — 开发任务

> 来源 PRD：[26-prd-白标与品牌定制.md](../prds/2026-09/26-prd-白标与品牌定制.md)
> 需求编号：YV-09-52 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义品牌配置类型接口 | `types/brand.ts` | TypeScript 类型检查通过 | 0.02 |
| 2 | 实现品牌配置 API 服务 | `services/brand.service.ts` | 接口调用返回正确数据结构 | 0.02 |
| 3 | 实现动态 CSS 变量注入工具 | `utils/brand-css.ts` | 设置 primaryColor 后页面主题色变化 | 0.04 |
| 4 | 实现 useBrand Composable | `composables/useBrand.ts` | 加载/更新/重置/导出/导入功能正常 | 0.04 |
| 5 | 实现品牌配置初始化 | `boot/brand.ts` | 应用启动时加载品牌配置并注入 CSS | 0.01 |
| 6 | 实现 BrandSettings 管理页面 | `views/settings/BrandSettings.vue` | 配置表单正常提交，配置生效 | 0.06 |
| 7 | 实现 BrandPreview 组件 | `components/brand/BrandPreview.vue` | 实时预览正常，与配置表单联动 | 0.04 |
| 8 | 实现 ColorPicker 组件 | `components/brand/ColorPicker.vue` | 颜色选择器 + 预设色板正常 | 0.02 |
| 9 | 实现 LogoUploader 组件 | `components/brand/LogoUploader.vue` | Logo 上传、预览、删除正常 | 0.02 |
| 10 | 登录页品牌适配 | 修改 `views/login/index.vue` | 登录页显示自定义 Logo/背景/欢迎语 | 0.02 |
| 11 | 布局组件品牌适配 | 修改 `layout/index.vue` | 侧边栏 Logo 和标题使用品牌配置 | 0.01 |
| 12 | 样式文件 | `styles/brand-settings.scss` | 品牌设置页面样式正常 | 0.01 |
| 13 | 组件测试 | 测试文件 | 6 个测试场景通过 | 0.01 |

**总计：** 0.3d

---
