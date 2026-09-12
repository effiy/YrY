---
doc_type: module
prd_task_id: "YV-09-139"
title: "YV-09-139: 键盘导航优化 — 全站键盘导航审计与增强、模态框焦点陷阱、跳过内容链接、Tab顺序优化、焦点可见指示器、快捷键可发现性 — 开发任务"
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
source_prd: "69-prd-键盘导航优化.md"
---

# YV-09-139: 键盘导航优化 — 全站键盘导航审计与增强、模态框焦点陷阱、跳过内容链接、Tab顺序优化、焦点可见指示器、快捷键可发现性 — 开发任务

> 来源 PRD：[69-prd-键盘导航优化.md](../prds/2026-09/69-prd-键盘导航优化.md)
> 需求编号：YV-09-139 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 审计当前键盘导航状况——遍历所有页面记录 Tab 顺序、焦点问题 | 全站 | 生成审计报告——列出所有不符合 WCAG 2.1 AA 的项目 | 0.04 |
| 2 | 实现 v-focus-trap 指令 | `src/directives/focus-trap.ts` | 模态框内 Tab 循环——焦点不逃逸；Shift+Tab 反向循环 | 0.05 |
| 3 | 实现 SkipLinks 组件 + 全局注册 | `src/components/accessibility/SkipLinks.vue` + `App.vue` | Tab 首次出现 Skip Links——Enter 跳转到目标区域 | 0.03 |
| 4 | 实现焦点可见指示器全局样式 | `src/styles/focus-visible.css` | 所有可聚焦元素在 Tab 导航时显示明显轮廓 | 0.02 |
| 5 | 实现 Roving Tab Index + 侧边栏适配 | `src/composables/useRovingTabIndex.ts` + `MainLayout.vue` | 侧边栏菜单左右方向键导航——Tab 只进入/离开菜单组 | 0.04 |
| 6 | Dialog/Drawer 添加 v-focus-trap + 快捷键 tooltip | `src/views/**/*.vue` | 所有模态框焦点不逃逸——关闭后焦点恢复——按钮 tooltip 显示快捷键 | 0.05 |
| 7 | 路由切换焦点迁移 + 审计验证 | `src/router/index.ts` + 全站回归检查 | 路由切换后聚焦 main-content——Tab 路径显著缩短 | 0.05 |

**总人天：0.28d ≈ 0.3d**

---
