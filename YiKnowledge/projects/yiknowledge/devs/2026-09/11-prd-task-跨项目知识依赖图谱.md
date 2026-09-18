---
doc_type: module
prd_task_id: "YK-09-08"
title: "YK-09-08: 跨项目知识依赖图谱 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "11-架构设计-跨项目知识依赖图谱.md"
source_okr: [yiknowledge-001]
related_tests: ["11-prd-test-跨项目知识依赖图谱"]
---

# YK-09-08: 跨项目知识依赖图谱 — 开发方案

> 来源 PRD：[11-架构设计-跨项目知识依赖图谱.md](../../prds/2026-09/11-架构设计-跨项目知识依赖图谱.md)
> 需求编号：YK-09-08 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

4 项目知识文件的依赖关系通过 frontmatter `related` 字段和交叉引用链接构建有向图。变更时沿依赖边传播影响分析，并识别未建立连接的知识缺口。

### 文件清单

```
YiAi/src/
├── domain/knowledge/
│   └── dependency_graph.py       # 【新增】依赖图构建 + 影响分析 + 缺口识别
└── services/knowledge/
    └── graph_service.py          # 【新增】图谱 API
```

---

## 二、关键技术决策

### D-01：依赖提取 — frontmatter `related` + Markdown `](path)` 双层

`related` 字段是显式依赖（作者声明），Markdown 链接 `[text](./path)` 是隐式依赖（内容引用）。两者权重不同：`related` 边权重 1.0，引用边权重 0.5。

### D-02：影响传播 — BFS 最多 2 跳

文档 A 变更后，影响沿依赖边 BFS 传播：直接依赖 A 的文档标记为"一级影响"，间接依赖（通过一级文档）标记为"二级影响"。超过 2 跳不传播（影响衰减到可忽略）。

---

## 三、实现规格

```python
class DependencyGraph:
    def build(self) -> GraphData:
        """扫描全库 related 字段 + 交叉引用 → 构建有向图"""
        # nodes: {path, project, doc_type, title}
        # edges: {source, target, weight(1.0|0.5), type(related|link)}

    def analyze_impact(self, changed_file: str) -> ImpactReport:
        """BFS 2 跳 → 列出受影响的文档（按距离分组）"""

    def find_gaps(self) -> list[Gap]:
        """识别知识缺口：语义相似（cos>0.7）但无边的文档对、孤立文档"""
```

---

## 四、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 依赖图构建（related + link 双层提取） | 0.5 |
| 2 | 变更影响分析（BFS 2 跳） | 0.3 |
| 3 | 知识缺口识别（语义相似无连接 + 孤立文档） | 0.3 |
| 4 | 图谱 API + 集成测试 | 0.4 |

**总计：1.5d**

---

## 五、技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 全库链接解析性能 | 低 | 中 | 800 文档 × ~5 refs = 4000 边，构建 < 5s |
| 语义相似度计算成本 | 中 | 中 | 仅对候选对计算（同领域/同标签），非全库 O(n²) |

---

## 六、实现完成记录

> **状态**：需求已编写，尚未开始实施。

---

## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 图谱可视化 | 依赖关系仅 API 输出 JSON，无前端可视化 | D3.js 力导向图 |

### 7.2 技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 语义相似度依赖 Embedding 模型 | P3 | 模型切换后缺口识别结果可能变化 | 待实施（版本化相似度结果） |

---