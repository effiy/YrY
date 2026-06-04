---
paths:
  - "docs/故事任务面板/**/知识图谱.json"
---

# knowledge-graph

> 每个故事目录一个 `知识图谱.json`（v2.0.0），描述该故事的业务领域、场景、源码节点及其关系。三层层次：story → scene → source。
>
> **Iron Law — 违反字母即是违反精神：**
> - 知识图谱节点与功能点一一对应。功能点无对应节点 = 图谱未闭合。
> - 表达优先：知识图谱.html 可视化优先于裸 JSON。

模板参考：[templates/故事任务/知识图谱.json](../../templates/故事任务/知识图谱.json)

[Schema](#schema) · [节点类型](#节点类型) · [边类型](#边类型) · [层次结构](#层次结构) · [场景关联](#场景关联) · [生成时机](#生成时机) · [生效标志](#生效标志)

## Schema

```json
{
  "version": "2.0.0",
  "kind": "knowledge-graph",
  "project": { "name", "description", "analyzedAt", "version" },
  "story": { "name", "description", "scenarios": [...] },
  "scenes": { "<scene-key>": { "name", "description", "nodes": [...] } },
  "graph": { "nodes": [...], "edges": [...] },
  "layers": [{ "id", "name", "description", "nodeIds": [...] }],
  "architectureLayers": ["<层名>", ...],
  "layerTiers": { "tiers": [...], "layerToTier": {} },
  "stats": { "nodeCount", "edgeCount", "layerCount", "sceneCount", "storyCount" }
}
```

## 节点类型

### 三层层次

```mermaid
flowchart TB
    TIER1["tier-story<br/>故事层 — 故事级抽象概念"]:::story --> TIER2["tier-scene<br/>场景层 — 场景文档节点"]:::scene
    TIER2 --> TIER3["tier-source<br/>源码层 — 可执行源码文件"]:::source
    TIER3 -.-> TIER4["tier-concept<br/>概念层 — 抽象概念/外部依赖"]:::concept
```

| 类型 | Tier | 颜色 | 说明 | ID 格式 |
|------|------|------|------|---------|
| `story` | story | `#EC4899` | 故事级抽象概念和治理原则 | `<story-name>/<concept>` |
| `scene` | scene | `#8B5CF6` | 场景文档节点，关联 场景-N-xxx.md | `scene:<N>` |
| `source` | source | `#3B82F6` | 可执行源码文件节点 | `file:<relative-path>` |
| `source`(test) | source | — | 测试文件节点 | `test:<relative-path>` |
| `source`(config) | source | — | 配置文件节点 | `config:<relative-path>` |
| `source`(external) | source | — | 外部依赖/API 节点 | `external:<name>` |
| `source`(concept) | concept | — | 抽象概念节点 | `concept:<name>` |

### 节点数据字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✓ | 唯一标识 |
| `type` | string | ✓ | `story` / `scene` / `source` |
| `label` | string | ✓ | 显示名称 |
| `keyContent` | string | ✓ | 关键标识符（反引号包裹） |
| `summary` | string | ✓ | 1-2 句摘要 |
| `risk` | string | — | `🔴` / `🟡` / `⚠️` / `null` |
| `tags` | string[] | ✓ | `[type, layer, keyword]` |
| `complexity` | string | ✓ | `simple` / `moderate` / `complex` |
| `description` | string | ✓ | ≥ 30 字符详细描述 |
| `layer` | string | ✓ | 所属架构层名称 |
| `entryFile` | string | — | 入口文件路径 |
| `consumers` | string[] | — | 消费者列表 |
| `storyRef` | object[] | — | 关联故事和功能点：`[{story, fp}]` |
| `scenarioRef` | string[] | — | 关联场景 key |
| `mdFiles` | object[] | — | Markdown 文件引用 |
| `relatedNodes` | string[] | — | 关联节点 ID |

## 边类型

| 类型 | 颜色 | 说明 |
|------|------|------|
| `orchestrates` | `#1E40AF` | 编排调度（story → scene） |
| `delegates` | `#166534` | 委派任务 |
| `assigns` | `#854D0E` | 分配工作 |
| `hands_off` | `#9A3412` | 产出交接 |
| `feedback` | `#9D174D` | 反馈回路 |
| `constrained_by` | `#7E22CE` | 规则约束 |
| `depends_on` | `#64748B` | 依赖 |
| `notifies` | `#0D9488` | 通知 |
| `defines` | `#475569` | 定义 |
| `governs` | `#B91C1C` | 治理约束 |
| `validates` | `#22C55E` | 验证 |
| `contains` | `#8B5CF6` | 包含定义 |
| `references` | `#64748B` | 引用来源 |
| `forbidden` | `#EF4444` | 架构违规 |
| `imports` | `#64748B` | 文件间导入 |
| `shares` | `#0EA5E9` | 共享依赖 |

### 边数据字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✓ | `e_<source>__<target>` |
| `source` / `target` | string | ✓ | 节点 ID |
| `type` | string | ✓ | 边类型（见上表） |
| `label` | string | ✓ | 显示标签 |
| `description` | string | ✓ | ≥ 20 字符，描述关系语义、触发条件和影响范围 |
| `direction` | string | ✓ | `forward` / `backward` / `bidirectional` |
| `weight` | number | ✓ | 0.0–1.0 |
| `storyRef` | object[] | — | 关联故事和功能点 |

## 层次结构

```json
{
  "layerTiers": {
    "tiers": [
      {"id": "tier-story", "name": "故事层", "order": 0},
      {"id": "tier-scene", "name": "场景层", "order": 1},
      {"id": "tier-source", "name": "源码层", "order": 2},
      {"id": "tier-concept", "name": "概念层", "order": 3}
    ],
    "layerToTier": {}
  }
}
```

## 场景关联

每个场景通过 `story.scenarios[]` 关联到知识图谱节点：

```json
{
  "story": {
    "scenarios": [
      {
        "name": "场景1 · <场景名>",
        "description": "<场景流程描述>",
        "sourceFiles": [
          {
            "type": "skill|agent|rule|file|config|external|concept|test",
            "file": "<相对路径>",
            "keyContent": "`关键函数` `关键命令`",
            "description": "<此文件在本场景中的具体角色>",
            "risk": "🔴|🟡|⚠️|null"
          }
        ],
        "graphNodes": ["<node_id>"]
      }
    ]
  }
}
```

## 生成时机

| 阶段 | 动作 | 产出 |
|------|------|------|
| 文档生成 | pm 分析需求 → 生成 story + scene 节点 + orchestrates 边 | 知识图谱骨架 |
| 文档生成 | coder 识别源码文件 → 补充 source 节点 + imports/depends_on 边 | 源码层节点 |
| 实现 | coder 逐模块编码 → 更新 source 节点 + 新增边 | 实现节点更新 |
| 验证 | reporter 检查 stats 与实际一致 | 完整性校验 |

## 生效标志

| 标志 | 验证方式 |
|------|---------|
| stats 与实际一致 | `stats.nodeCount` = graph.nodes 实际长度 |
| 每个场景有对应 scene 节点 | scenes keys ⊆ graph.nodes 中 type=scene 的节点 |
| 无悬挂边 | 每条 edge 的 source/target 在 nodes 中存在 |
| 场景文件存在 | 每个 scenario 的 `sourceFiles[].file` 路径可 Read 验证 |
| 知识图谱.html 可渲染 | 浏览器打开 `知识图谱.html`，cytoscape.js 图正确显示 |
