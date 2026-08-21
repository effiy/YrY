---
type: loop-record
loopId: loop-002
stage: technical-review
title: 三要素编排映射技术方案 — 从硬编码到可读回的知识库清单
role: aier
goalId: aier-001
status: done
created: 2026-08-17
updated: 2026-08-17
tags: [loop-record, technical-review, adr, orchestration]
---

# 02 技术评审 — loop-002

> 需求编号：loop-002 · 评审人：AI Engineer · 状态：已通过

## ADR（架构决策记录）

### ADR-004：三要素编排映射存储方案

**背景**：loop-001 中 7 角色的 skill/agent/mcp 三要素映射硬编码在 `OkrRecommendPanel.vue` 的 `ROLE_SKILL` 和 `ENGINEERING_ROLES` 常量中，以及 `okrOrchestration.ts` 的编排逻辑里。新增角色或调整映射需要改代码、重新构建。

**决策**：将三要素映射沉淀为 KB markdown 文件（`YiKnowledge/skills/<id>/SKILL.md` 已就位），`OkrRecommendPanel` 从 KB 扫描结果中读取 skill 定义，agent/mcp 映射保留在 `okrOrchestration.ts` 中但补充注释说明来源。

**理由**：
- skill 定义已在 KB 中（`skillLabel()` 从 SKILL.md 读取），无需重复存储。
- agent/mcp 映射与角色强绑定，变更频率低，保留在代码中可享受类型检查。
- 混合方案兼顾灵活性与类型安全。

**替代方案**：全量迁移到 KB JSON → 增加一层 IO 和解析逻辑，且失去类型检查。

### ADR-005：模板 frontmatter 规范扩展

**背景**：loop-001 的 5 类模板（01~05）缺少 `loopId`/`stage`/`goalId` 字段，导致 `processRecord.vue` 的 `buildLoopGroups()` 需要从文件路径推断 `loopId`。

**决策**：所有 loop-record 的 frontmatter 新增 3 个必填字段：

| 字段 | 取值 | 说明 |
|---|---|---|
| `loopId` | `loop-XXX` | 闭环编号 |
| `stage` | 8 阶段 key | 闭环阶段 |
| `goalId` | `xxx-XXX` | 关联目标 |

**理由**：
- 消除路径推断的脆弱性（文件移动不会破坏关联）。
- 支持一条记录关联多个维度（`loopId` + `goalId` 独立索引）。
- 向后兼容：`buildLoopGroups()` 保留路径回退逻辑。

### ADR-006：类型错误修复策略

**背景**：23 个 vue-tsc 既有错误分布在 4 个文件中，修复策略影响面不同。

**决策**：分类修复，不引入运行时逻辑变更：

| 类别 | 文件 | 数量 | 策略 |
|---|---|---|---|
| 图标导入缺失 | knowledgeBase | 2 | 显式 import |
| 泛型推断不足 | knowledgeBase/rag | 21 | 调用点 `as` 收窄 |
| 泛型约束缺失 | complexProTable | 1 | 补泛型约束 |
| API 字段变更 | menuMange | 1 | `value`→`node-key` |

**理由**：每个修复都是最小化、可验证的，不改变运行时行为。

## 数据模型

```
LoopRecord {
  path: string          // KB 文件路径
  loopId: string        // 闭环编号 (loop-001, loop-002, ...)
  stage: string         // 8 阶段之一
  title: string         // 记录标题
  role: string          // 产出角色
  goalId: string        // 关联目标
  status: "done" | "in-progress"
}

OrchestrationMapping {
  role: string          // 7 角色之一
  skill: string         // skill id (对应 KB skill 文件)
  agent: string         // agent 名称
  mcp: string           // mcp 服务名
}
```

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| frontmatter 扩展后旧记录不兼容 | `buildLoopGroups()` 保留路径回退 |
| 类型修复引入新 bug | 每个修复独立 commit + typecheck 门禁 |
| 编排清单与代码不同步 | 清单文件标注 `updated` 时间戳 |