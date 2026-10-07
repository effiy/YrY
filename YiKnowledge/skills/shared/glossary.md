---
title: 技能共享术语表
updated: 2026-09-23
tags: [skills, glossary, reference, shared]
type: reference
status: stable
---

# 技能共享术语表

> 确保所有 12 个技能使用一致的语言。技能间交叉引用时，术语含义应无歧义。

## 核心概念

### 工作流角色

| 术语 | 定义 | 在技能中的用法 |
|------|------|--------------|
| **上游技能** | 当前技能之前执行的技能，其输出是当前技能的输入 | 参考文件中的 `../xxx/SKILL.md` |
| **下游技能** | 当前技能之后执行的技能，消费当前技能的输出 | 技能协作流中的箭头方向 |
| **技能协作链** | 多个技能按固定顺序串联完成一个完整任务 | README 中的协作流图 |
| **触发条件** | 用户说什么话或什么场景下技能被激活 | `auto-trigger-rules` 和 `description` 字段 |

### 实现阶段

| 术语 | 定义 | 相关技能 |
|------|------|---------|
| **Red-Green-Refactor** | TDD 循环：写失败测试 → 最小实现 → 重构 | test-driven-development |
| **验收标准** | 可验证的功能完成条件，从 PRD 的用户故事派生 | prd-creator, verification |
| **完成门禁** | 任务完成前必须通过的检查集合（自动化 + 功能 + 边界） | verification, task-planning |
| **确定性完成** | 完成不是主观感觉，而是可验证条件的全量通过 | verification, task-planning |

### 质量维度

| 术语 | 定义 | 相关技能 |
|------|------|---------|
| **六维审查** | 代码审查的六个维度：安全、正确性、性能、可维护性、架构一致性、跨项目契约 | code-review |
| **P0-P3 分级** | 审查问题的严重级别：严重→重要→建议→可选 | code-review |
| **质量门禁** | 合并前必须通过的自动化检查（类型检查、测试、lint） | verification |

### 上下文管理

| 术语 | 定义 | 相关技能 |
|------|------|---------|
| **三文件模式** | task_plan.md + findings.md + progress.md 的上下文持久化方案 | task-planning |
| **Crash-Proof** | 会话中断后可通过三文件完全恢复，不丢失任务状态 | task-planning |
| **上下文腐化** | 长对话中模型逐渐偏离原始目标的现象 | task-planning |
| **每轮重注入** | 每轮对话开始时从文件重新加载关键信息以对抗腐化 | task-planning |

### 项目知识库

| 术语 | 定义 | 相关技能 |
|------|------|---------|
| **PRD** | 产品需求文档，9 章节结构化需求文档 | prd-creator |
| **DDR** | 设计决策记录，记录为什么选择某个技术方案 | brainstorming |
| **归档** | 将 task-planning 三文件转换为 YiKnowledge/projects 标准文档 | task-planning, finishing |
| **Bug 模式库** | 基于项目真实 Bug 提取的 6 大常见模式 | debugging |

## YrY 项目专有术语

### RPC 协议

| 术语 | 定义 |
|------|------|
| **RPC 信封** | `{module_name, method_name, parameters}` 的统一调用格式 |
| **参数名契约** | 关键参数名的硬性规定：`filter`（非 `query`）、`target_file`（非 `path`）、`cname`（非 `collection_name`） |
| **静默忽略** | 后端对未知参数名不报错、不警告，直接忽略的危险行为 |

### 项目角色

| 术语 | 定义 |
|------|------|
| **YiVad** | Vue 3.5 管理后台（端口 8848）—— ProTable 驱动、动态路由、按钮级权限 |
| **YiAi** | FastAPI 后端（端口 10086）—— AI 聊天、RAG、数据服务、唯一数据源 |
| **YiPet** | Chrome MV3 扩展 —— 双世界（Content Script + Service Worker）、跨项目桥接 |

### 前端约定

| 术语 | 定义 |
|------|------|
| **RequestHttp** | YiVad 的 HTTP 请求封装层，自动附加 Token、处理 401、统一错误 |
| **ApiClient** | YiPet 的 4 层 API 封装，与 RequestHttp 功能等价但适配扩展环境 |
| **ProTable** | YiVad 的核心数据表格组件，支持服务端分页、排序、筛选 |
| **Composition API** | Vue 3 `<script setup lang="ts">` 语法，YiVad 强制使用（禁止 Options API） |
| **v-auth** | YiVad 按钮级权限控制指令 |

### 后端约定

| 术语 | 定义 |
|------|------|
| **Motor** | Python 异步 MongoDB 驱动，YiAi 使用其异步 API |
| **Repository 模式** | YiAi 的 Service 层通过 Repository 访问数据，不直接操作 Motor |
| **错误码** | 标准错误码：1001（参数验证失败）、1002（资源不存在）、2001（AI 不可用）等 |

## 技能间协作术语

### 产出物

| 技能 | 产出物 | 被谁消费 |
|------|--------|---------|
| brainstorming | 设计摘要、DDR | prd-creator, task-planning |
| prd-creator | PRD 文档（9 章节） | task-planning |
| task-planning | task_plan.md, findings.md, progress.md | TDD, code-review, verification, finishing |
| test-driven-development | 单元测试、集成测试 | code-review, verification |
| code-review | 六维审查报告（P0-P3） | verification, finishing |
| debugging | 根因分析、修复方案、Bug 文档 | issue-creator, verification |
| verification | 完成验证报告（✅/⚠️/❌） | finishing |
| issue-creator | 结构化 Issue、健康报告 | 全流程追踪 |
| finishing | 提交、更新文档、PR | 交付 |

### 状态传递

```
draft（brainstorming 产出）
  → confirmed（prd-creator 产出）
    → in_progress（task-planning 产出）
      → reviewed（code-review 产出）
        → verified（verification 产出）
          → done（finishing 产出）
```

---

## 技能描述中的高频动词

为确保技能 description 字段的触发准确率，使用一致的动词：

| 动词 | 含义 | 示例 |
|------|------|------|
| 「创建」 | 从零生成新内容 | 创建 PRD、创建测试 |
| 「执行」 | 按既定流程操作 | 执行审查、执行验证 |
| 「讨论」 | 交互式对话确认方向 | 讨论方案、讨论需求 |
| 「定位」 | 找出根因 | 定位 Bug、定位性能瓶颈 |
| 「生成」 | 自动产出结构化内容 | 生成图表、生成提交信息 |
| 「归档」 | 将产出存入项目知识库 | 归档到 projects/ |