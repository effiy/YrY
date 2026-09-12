---
doc_type: module
prd_task_id: "YV-09-141"
title: "YV-09-141: 色彩对比度审计 — 自动化色彩对比度审计、扫描UI元素WCAG合规性、对比度问题报告含严重级别、推荐可访问颜色替代、回归检查 — 开发任务"
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
source_prd: "71-prd-色彩对比度审计.md"
---

# YV-09-141: 色彩对比度审计 — 自动化色彩对比度审计、扫描UI元素WCAG合规性、对比度问题报告含严重级别、推荐可访问颜色替代、回归检查 — 开发任务

> 来源 PRD：[71-prd-色彩对比度审计.md](../prds/2026-09/71-prd-色彩对比度审计.md)
> 需求编号：YV-09-141 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现颜色工具函数（相对亮度/对比度/WCAG判断） | `src/utils/color.ts` | 已知颜色对计算对比度——与 WCAG 官方公式一致 | 0.02 |
| 2 | 实现审计引擎（DOM扫描+背景追溯+违规检测） | `src/services/contrast-audit.ts` | 扫描已知违规页面——输出正确违规列表 | 0.05 |
| 3 | 实现颜色替代推荐算法 | `src/utils/contrast-recommend.ts` | 输入违规颜色对——输出至少 1 个合规替代色 | 0.03 |
| 4 | 实现审计面板 UI（得分、统计、违规列表） | `src/views/system/contrast-audit.vue` | 扫描页面——显示得分——列出所有违规项 | 0.05 |
| 5 | 实现元素高亮 + 违规详情卡片 | `src/components/audit/ElementHighlighter.vue` + `ViolationCard.vue` | 点击违规项——页面高亮该元素——显示颜色对比和替代建议 | 0.05 |
| 6 | 实现主题编辑器对比度实时警告 | `src/components/theme/ContrastWarnings.vue` | 修改品牌色——如果对比度不足——显示警告并推荐替代色 | 0.05 |
| 7 | 全站审计修复 critical 问题 + 路由注册 | 多个文件 | 审计得分 > 85——0 个 critical 违规 | 0.05 |

**总人天：0.3d**

---
