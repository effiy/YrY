---
agent: mermaid-expert
last_updated: 2026-04-29T00:00:00Z
entry_count: 1
---

## 记忆条目

### 2026-04-29: quadrantChart 兼容性问题

**问题**: `quadrantChart` 是 Mermaid 10.3+ 新增类型，在较旧环境或部分渲染器中不被支持。

**修复模式**: 用标准的 `graph`/`flowchart` + `subgraph` 来模拟象限图，使用颜色样式区分不同象限。

**示例**:
- 原: `quadrantChart` 语法
- 修复为: `graph LR` + 4 个 subgraph 表示四个象限，配合 fill/stroke 样式
