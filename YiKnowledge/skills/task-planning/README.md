---
title: 任务规划技能说明
updated: 2026-09-23
---

## 任务规划与上下文持久化 AI 智能体

### 快速开始

直接与 Claude 对话。当你有复杂开发任务时：

```
你：我需要为 YiVad 添加暗色模式，涉及 10+ 个文件

助手：[任务规划模式]
  好的，让我先理解需求...
  [方案设计] → [计划生成] → [分步执行]

  已创建 tasks/dark-mode/task_plan.md
  共 6 个执行步骤，随时可以说「继续」来执行下一步。
```

### 为什么采用三文件模式？

**为什么不是直接在对话中做？**
长任务中，上下文窗口会压缩和遗忘。三文件（task_plan、findings、progress）将关键状态持久化到文件系统，会话中断后可立即恢复。

**为什么需要方案设计阶段？**
直接跳入代码实现 = 在方向不明的情况下开始走路。方案设计让用户确认路线，避免做无用功。

**为什么每步都记录 progress？**
事后补记会丢失中间失败和修正的细节。即时记录确保下次遇到类似问题时可以查阅。

### 与其他技能的协作

- **prd-creator** → task-planning：PRD 功能需求拆解为执行步骤
- **task-planning** → code-review：步骤执行完成后进行代码审查
- **task-planning** → issue-creator：执行中发现的 Bug 转为 Issue 追踪

### 架构

```
task-planning/
├── SKILL.md                          # 技能本身（三文件模式 + 5 阶段工作流）
└── references/
    ├── three-file-pattern.md         # 三文件模式详细规范和反模式
    └── integration-guide.md          # 与项目文档体系的集成指南
```