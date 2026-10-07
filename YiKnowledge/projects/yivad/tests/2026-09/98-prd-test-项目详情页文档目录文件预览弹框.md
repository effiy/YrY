---
prd_task_id: "YV-09-98"
title: "YV-09-98: 项目详情页文档目录文件预览弹框 — 测试用例"
status: 已完成
priority: P2
owner: Chengliang.Yi
source_prds: ["98-prd-项目详情页文档目录文件预览弹框"]
source_modules: ["YV-09-98"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 体验优化, 文档目录, 文件预览]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L1+L4 5 用例通过"
test_execution_date: 2026-09-23
source: YiVad
benefit: "测试用例：项目详情页文档目录文件预览弹框"
lifecycle: active
---

# YV-09-98: 项目详情页文档目录文件预览弹框 — 测试用例

> 来源 PRD：[98-prd-项目详情页文档目录文件预览弹框](../../prds/2026-09/98-prd-项目详情页文档目录文件预览弹框.md)
> 开发方案：[98-prd-task-项目详情页文档目录文件预览弹框](../../devs/2026-09/98-prd-task-项目详情页文档目录文件预览弹框.md)

| 用例 | 覆盖 AC | 层级 | 结果 |
|------|---------|------|------|
| TC-01 编译零错误 | AC-5 | L1 | ✅ |
| TC-02 点击文件行弹出 KnowledgePreviewDialog | AC-1 | L4 | ✅ |
| TC-03 弹框显示完整 markdown + frontmatter 元数据 | AC-2 | L4 | ✅ |
| TC-04 弹框支持 Preview/Edit/Split 模式切换 | AC-3 | L4 | ✅ |
| TC-05 文件行无 chevron 图标、无内联展开区域 | AC-4 | L4 | ✅ |

**结论**：全部 5 项通过。

## L4 验证步骤

1. 打开 `http://localhost:8848/#/project/yivad` → Overview Tab
2. 点击 Documents 区域任意 PRD 文件行 → 验证弹出 KnowledgePreviewDialog
3. 验证弹框显示 markdown 渲染内容 + 元数据徽章 + TOC 侧边栏
4. 切换 Edit / Split / Preview 模式 → 验证各模式功能正常
5. 切换 Dev Tasks / Test Specs Tab → 点击文件行 → 同样弹出预览弹框
6. 验证文件行无 chevron 箭头图标、点击后无内联展开内容