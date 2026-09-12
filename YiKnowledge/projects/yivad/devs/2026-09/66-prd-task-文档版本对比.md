---
doc_type: module
prd_task_id: "YV-09-136"
title: "YV-09-136: 文档版本对比 — 版本并列对比、行内差异高亮、版本时间线、回退到指定版本、变更作者归属 — 开发任务"
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
source_prd: "66-prd-文档版本对比.md"
---

# YV-09-136: 文档版本对比 — 版本并列对比、行内差异高亮、版本时间线、回退到指定版本、变更作者归属 — 开发任务

> 来源 PRD：[66-prd-文档版本对比.md](../prds/2026-09/66-prd-文档版本对比.md)
> 需求编号：YV-09-136 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 YiAi VersionService（创建版本、列表、对比） | `YiAi/services/data/version_service.py` | 保存文档自动创建版本，列出历史版本 | 0.05 |
| 2 | 实现 YiAi DiffEngine（Myers diff） | `YiAi/services/data/diff_engine.py` | 两个版本对比返回新增/删除/修改行 | 0.03 |
| 3 | 实现 YiAi RollbackService + 版本快照中间件 | `YiAi/services/data/rollback_service.py` + `middleware/version_snapshot.py` | 回退操作前创建快照，回退后内容正确 | 0.04 |
| 4 | 实现 YiVad DiffViewer 组件（diff2html 集成） | `YiVad/src/components/version/DiffViewer.vue` | side-by-side 和 line-by-line 两种模式渲染正确 | 0.06 |
| 5 | 实现 YiVad VersionTimeline 组件 | `YiVad/src/components/version/VersionTimeline.vue` | 版本列表按时间倒序，点击选中高亮 | 0.04 |
| 6 | 实现 YiVad 版本对比页面 + RollbackDialog | `YiVad/src/views/doc/version-compare.vue` + `RollbackDialog.vue` | 选择两个版本对比，回退操作安全执行 | 0.05 |
| 7 | 路由注册 + 集成测试 | 路由文件 + 测试文件 | 端到端：编辑 → 对比 → 回退 | 0.03 |

**总人天：0.3d**

---
