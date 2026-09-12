---
type: okr-goal
id: eng-005
title: 构建健康度清零
status: active
period: 2026 Q3
owner: Engineering Lead
project: YiVad
progress: 100
updated: 2026-09-10---

# 🧹 构建健康度清零

清零 23 个 vue-tsc 既有类型错误，让 YiVad 恢复可构建可部署。

| Field | Value |
|---|---|
| ID | `eng-005` |
| Status | active |
| Period | 2026 Q3 |
| Owner | Engineering Lead |
| Project | YiVad |

## Key Results (4)
- KR1: 清零 23 个 vue-tsc 既有类型错误 — 100%
- KR2: knowledgeBase dashboard 17 个错误修复 — 100%
- KR3: rag history/retrieval 4 个错误修复 — 100%
- KR4: proTable + menuMange 2 个类型错误修复 — 100%

## Related Metrics (1)
- 📉 构建健康度 (`eng-m06`) — 0 个 / 0 个 · 100%

## 实施上下文

### 背景与动机

Q3 初期，YiVad 存在 23 个遗留的 vue-tsc 类型错误，导致三个严重问题：
1. **vue-tsc --noEmit 无法通过**：类型检查门禁形同虚设，因为基线已经有错误
2. **构建依赖隐藏的类型假设**：开发者默认"这些错误一直存在，不影响运行"，但实际上某些运行时 bug 的根因正是这些类型错误
3. **新错误被掩盖**：因为已有 23 个基线错误，新引入的类型错误被淹没在噪音中

目标是将这 23 个错误按模块逐个清零，恢复 vue-tsc --noEmit 的零错误基线。

### 关键决策

| 决策 | 说明 |
|------|------|
| 分模块清零策略 | 23 个错误分布在 knowledgeBase dashboard（17 个）、rag history/retrieval（4 个）、proTable + menuMange（2 个），按模块逐个修复而非一次性全面修改 |
| 先修复高风险模块 | knowledgeBase dashboard 的错误数量最多且直接影响核心功能展示，作为最高优先级 |
| 修复后立即锁定 | 每个模块清零后添加 CI 检查，阻止该模块的新增类型错误 |

### 实施路径

1. **第一阶段**：创建类型错误清单，按模块分组并标记优先级
2. **第二阶段**：修复 knowledgeBase dashboard 17 个错误——涉及图表数据类型、API 响应类型和组件 props 类型
3. **第三阶段**：修复 rag history/retrieval 4 个错误——涉及泛型约束和异步返回类型
4. **第四阶段**：修复 proTable + menuMange 2 个错误——涉及第三方库类型兼容性
5. **第五阶段**：建立 CI 门禁，vue-tsc 零错误作为合并前提

## 影响范围

| 受影响模块 | 影响说明 |
|-----------|----------|
| knowledgeBase dashboard | 17 个类型修复涉及图表组件类型、数据提取逻辑和接口返回类型 |
| rag history/retrieval | 4 个类型修复涉及检索结果泛型定义和异步流处理类型 |
| proTable 组件 | 1 个类型修复涉及列定义泛型参数 |
| menuMange 组件 | 1 个类型修复涉及路由元数据类型 |
| CI 流水线 | 新增 vue-tsc --noEmit 零错误检查门禁 |

## 预防措施

1. **类型错误回归检查**：每次 PR 合并前自动运行 vue-tsc --noEmit，任何新增错误都会被标记并阻止合并
2. **any 类型使用审计**：遗留的 23 个错误中 15 个与过度使用 any 类型有关，建议限制 any 的使用（需要 code review 批准）
3. **第三方库类型更新监控**：proTable 的类型错误源于第三方库升级，建议在依赖更新时自动运行类型检查

## 经验教训

1. **债务清零的窗口期很短**：23 个错误分布在 3 个模块中，清零完成后如果不立即添加 CI 门禁，3 天内就会重新累积
2. **分模块清零比全面修改安全**：按模块逐个修复可以每修完一个模块就验证功能不受影响，避免大面积修改引入回归 bug
3. **类型错误修复往往暴露隐藏的运行时问题**：修复 knowledgeBase dashboard 的 17 个类型错误时，发现了 2 个实际的数据显示 bug——某些图表在特定数据为 null 时不渲染，但因为 any 类型掩盖了 null 检查缺失
