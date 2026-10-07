---
title: 与项目文档体系的集成指南
updated: 2026-09-23
tags: [skill, reference, integration, projects]
type: reference
status: stable
---

# 与 YiKnowledge/projects 文档体系的集成

## 文档层级关系

```
YiKnowledge/projects/<project>/
├── prds/           ← prd-creator 技能产出
│   └── 2026-09/
│       └── 001-需求-功能名称.md
├── devs/           ← task-planning 技能可产出正式 task 文档
│   └── 2026-09/
│       ├── 001-dev-开发方案.md
│       ├── 001-task-实施清单.md
│       └── 001-test-测试用例.md
├── architecture/   ← findings.md 中重要发现可沉淀至此
└── bugs/           ← debugging 技能产出
```

## 从 task_plan 到正式 task 文档

当任务完成且值得归档时，将三文件内容转换为项目标准文档：

### 转换映射

| 三文件内容 | 项目文档 |
|-----------|---------|
| task_plan 背景 + 方案 | dev 文档的「方案设计」章节 |
| task_plan 执行步骤 | task 文档的「实施清单」 |
| findings 关键技术发现 | dev 文档的「技术决策」章节 |
| progress 验证结果 | test 文档的「验证记录」 |
| findings 可复用知识 | architecture/ 中的独立知识文档 |

### 归档命令

当用户说「归档」时：

1. 确认归档目标项目（yiai / yivad / yipet / shared）
2. 按上述映射生成文档
3. 将三文件移动到 `tasks/<task-name>/` 或删除（用户选择）
4. 更新 `YiKnowledge/projects/INDEX.md` 的统计数字

## 与其他技能的协作

```
prd-creator          task-planning        issue-creator
    │                     │                     │
    │  PRD                │                     │
    ├─────────────────────►                     │
    │  功能需求           │                     │
    │                     │  执行步骤           │
    │                     ├─────────────────────►
    │                     │              Issue 拆解
    │                     │                     │
    ▼                     ▼                     ▼
projects/<p>/prds/   tasks/<name>/       projects/<p>/bugs/
                     projects/<p>/devs/
```

### 协作示例

1. 用户用 **prd-creator** 创建了「暗色模式」PRD
2. 用户用 **task-planning** 将 PRD 功能需求拆解为 6 个执行步骤
3. 执行过程中发现一个 Element Plus 主题 bug
4. 用户用 **issue-creator** 创建 bug Issue 并关联到 task_plan
5. bug 修复后回到 task_plan 继续执行
6. 全部完成后归档到 `YiKnowledge/projects/yivad/devs/`

## 检查清单

归档前确认：

- [ ] task_plan 中所有步骤标记为完成
- [ ] findings.md 中重要发现已提取到项目知识文档
- [ ] progress.md 中关键验证结果已保留
- [ ] 归档的文档包含完整的 frontmatter
- [ ] 文件命名符合项目约定