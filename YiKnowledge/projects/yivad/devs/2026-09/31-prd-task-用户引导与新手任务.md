---
doc_type: module
prd_task_id: "YV-09-63"
title: "用户引导与新手任务 — 开发任务"
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
source_prd: "31-prd-用户引导与新手任务.md"
---

# 用户引导与新手任务 — 开发任务

> 来源 PRD：[31-prd-用户引导与新手任务.md](../prds/2026-09/31-prd-用户引导与新手任务.md)
> 需求编号：YV-09-63 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义引导类型接口 | `types/onboarding.ts` | TypeScript 类型检查通过 | 0.02 |
| 2 | 实现引导 API 服务 | `services/onboarding.service.ts` | 接口调用返回正确数据结构 | 0.02 |
| 3 | 实现 useOnboarding Composable | `composables/onboarding/useOnboarding.ts` | 步骤状态机、角色切换、进度计算正常 | 0.04 |
| 4 | 实现 useTour Composable | `composables/onboarding/useTour.ts` | 元素定位、蒙层渲染、步骤切换正常 | 0.03 |
| 5 | 实现 OnboardingWizard 向导 | `components/onboarding/OnboardingWizard.vue` | 多步骤向导、进度条、动画过渡正常 | 0.04 |
| 6 | 实现 OnboardingStep 步骤容器 | `components/onboarding/OnboardingStep.vue` | 8 个步骤内容渲染正常 | 0.02 |
| 7 | 实现 RoleSelector 角色选择 | `components/onboarding/RoleSelector.vue` | 3 个角色卡片选择和确认正常 | 0.01 |
| 8 | 实现 WelcomeTour 欢迎导览 | `components/onboarding/WelcomeTour.vue` | Spotlight 效果、提示浮层、平滑滚动正常 | 0.03 |
| 9 | 实现 TooltipHighlight 工具提示 | `components/onboarding/TooltipHighlight.vue` | 智能定位、高亮边框、脉冲动画正常 | 0.02 |
| 10 | 实现 ProgressTracker 进度追踪 | `components/onboarding/ProgressTracker.vue` | 环形进度条、步骤列表正常 | 0.01 |
| 11 | 实现 TaskChecklist 任务清单 | `components/onboarding/TaskChecklist.vue` | 5 项任务、完成动画、跳转正常 | 0.01 |
| 12 | 实现 ContextualHint 上下文提示 | `components/onboarding/ContextualHint.vue` | 页面级提示、关闭后不再显示正常 | 0.01 |
| 13 | 实现 CompletionCelebration 庆祝 | `components/onboarding/CompletionCelebration.vue` | 撒花动画、证书下载、统计摘要正常 | 0.02 |
| 14 | 实现 OnboardingAnalytics 分析 | `components/onboarding/OnboardingAnalytics.vue` | 漏斗图、趋势图、角色分布正常 | 0.01 |
| 15 | 实现 v-onboarding 指令 | `directives/onboarding.ts` | 元素注册/注销到引导管理器正常 | 0.01 |
| 16 | 组件测试 | 测试文件 | 6 个测试场景通过 | 0.01 |

**总计：** 0.3d

---
