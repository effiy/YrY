---
doc_type: test
title: "主题系统与暗色模式增强 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-26"
source_prds: ["09-prd-主题系统与暗色模式"]
source_modules: []
---
# 主题系统与暗色模式增强 — 测试规格

> 来源 PRD：[09-prd-主题系统与暗色模式.md](../../prds/2026-09/09-prd-主题系统与暗色模式.md)
> 提取日期：2026-09-11

---

## 补充：单元测试用例

### UT-TH01: useTheme

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 默认主题 | 首次加载 | 跟随系统偏好或默认亮色 |
| 2 | 手动切换 | switchTheme('dark') | html 添加 class 'dark' |
| 3 | 持久化 | 切换后刷新 | localStorage 恢复主题 |
| 4 | Auto 模式 | 系统切换暗色 | 自动跟随系统设置 |
| 5 | CSS 变量 | 暗色模式 | --el-bg-color 等变量更新 |

### UT-TH02: 布局切换

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 4 种布局 | vertical/classic/transverse/columns | 对应布局渲染正确 |
| 2 | 暗色适配 | 布局 + 暗色模式 | 所有布局暗色正常 |
| 3 | Element Plus 组件 | el-table/dialog/drawer | 暗色渲染正确 |

