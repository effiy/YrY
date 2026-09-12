---
doc_type: module
prd_task_id: "YV-09-109"
title: "YV-09-109: 文档协作空间 — 实时协作文档编辑、按项目/团队共享文档、文档模板、版本历史、行内评论、文件夹/标签组织 — 开发任务"
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
source_prd: "51-prd-文档协作空间.md"
---

# YV-09-109: 文档协作空间 — 实时协作文档编辑、按项目/团队共享文档、文档模板、版本历史、行内评论、文件夹/标签组织 — 开发任务

> 来源 PRD：[51-prd-文档协作空间.md](../prds/2026-09/51-prd-文档协作空间.md)
> 需求编号：YV-09-109 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 定义类型 | `src/views/docspace/types.ts` | TypeScript 类型检查通过 | 0.02 |
| 2 | 实现文件夹 CRUD | `YiAi: services/docspace/folder_service.py` | 创建/移动/删除文件夹 | 0.02 |
| 3 | 实现文档 CRUD + 乐观锁 | `YiAi: services/docspace/doc_service.py` | 版本号检查 + 冲突提示 | 0.03 |
| 4 | 实现版本管理器 | `YiAi: services/docspace/version_manager.py` | 保存/读取/对比/回滚 | 0.04 |
| 5 | 实现评论服务 | `YiAi: services/docspace/comment_service.py` | 创建/回复/解决评论 | 0.02 |
| 6 | 实现编辑锁管理 | `YiAi: services/docspace/lock_manager.py` | 锁获取/释放/过期 | 0.02 |
| 7 | 集成 TipTap 编辑器 | `src/views/docspace/DocEditor.vue` | 编辑/保存/自动草稿 | 0.04 |
| 8 | 实现文件夹树 + 文档列表 | `FolderTree.vue` + `DocList.vue` | 树形结构 + 拖拽移动 | 0.03 |
| 9 | 实现版本历史面板 | `VersionHistory.vue` | 列表+diff对比+回滚 | 0.03 |
| 10 | 实现评论面板 | `CommentPanel.vue` | 行内锚定+讨论线程 | 0.03 |
| 11 | 添加路由和权限 | `src/router/` | 按项目/团队可见 | 0.02 |

**总人天：0.3d**

---
