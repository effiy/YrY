---
doc_type: module
prd_task_id: "YK-09-05"
title: "YK-09-05: 项目知识中心完善 — 开发方案"
status: 进行中
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 4.0
source_prd: "08-功能实现-项目知识中心.md"
source_okr: [yiknowledge-001]
related_tests: ["08-prd-test-项目知识中心"]
---

# YK-09-05: 项目知识中心完善 — 开发方案

> 来源 PRD：[08-功能实现-项目知识中心.md](../../prds/2026-09/08-功能实现-项目知识中心.md)
> 需求编号：YK-09-05 · 优先级：P1 · 人天：4.0d · 状态：进行中
> 测试方案：[08-prd-test-项目知识中心.md](../../tests/2026-09/08-prd-test-项目知识中心.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、技术风险](#sec-6)
- [七、实现完成记录](#sec-7)
- [八、已知缺口与技术债](#sec-8)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 功能域

| 域 | 核心能力 | 人天 |
|----|---------|------|
| 统一 Bug 分类 | 4 项目统一分类体系（模块/严重度/状态）+ 模板标准化 | 0.8 |
| 跨项目关联 | 相似 Bug 检测（SimHash）+ 跨项目引用链接 | 1.0 |
| 跨项目检索 | RAG 跨项目检索（突破项目边界）+ 聚合视图 | 1.2 |
| 完整性追踪 | Bug 归档统计 + 覆盖率仪表盘 | 0.5 |
| 模板与治理 | Bug 模板标准化 + 跨项目分类一致性 | 0.5 |

### 1.2 文件清单

```
YiKnowledge/projects/
├── INDEX.md                        # 【修改】跨项目索引 + Bug 统计
├── shared/
│   └── bug-classification.md       # 【新增】统一 Bug 分类标准
├── yivad/bugs/                     # 【扩展】Bug 归档完善
├── yiai/bugs/                      # 【扩展】已有 80+ Bug
├── yipet/bugs/                     # 【扩展】Bug 归档完善
└── yiknowledge/bugs/               # 【扩展】从 3 → 目标 20+

YiAi/src/
├── services/knowledge/
│   └── cross_project_service.py    # 【新增】跨项目检索 + 关联 API
└── domain/knowledge/
    └── cross_project.py            # 【新增】SimHash 跨项目关联 + 聚合引擎
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：统一分类体系 — 跨项目标准字段

4 个项目共享相同的 Bug frontmatter 模板：

```yaml
project: yivad | yiai | yipet | yiknowledge
module: 所属模块
severity: S0 | S1 | S2 | S3 | S4
status: open | in_progress | resolved | closed | wont_fix
cross_project_refs: [相关 Bug 的跨项目引用]
```

### D-02：跨项目相似 Bug 检测 — SimHash + 关键词

复用 M20 的 SimHash 去重引擎（64-bit 指纹 + 汉明距离 ≤ 3）。对标记为 `cross_project_refs` 的 Bug 自动关联相关 Bug（同一根因/同一错误模式）。

### D-03：跨项目检索 — RAG 不加项目过滤

默认 RAG 检索仅搜索当前项目（`filter: {project: "yivad"}`）。跨项目检索模式移除项目过滤，4 项目知识统一检索。前端提供"跨项目"开关。

---

<a id="sec-3"></a>
## 三、模块与接口契约

```python
# 跨项目检索
class CrossProjectService:
    async def search_all_projects(self, query: str, top_k: int = 10) -> CrossProjectResults:
        """4 项目统一检索，结果标注来源项目"""

    async def find_related_bugs(self, bug_path: str, max_results: int = 5) -> list[RelatedBug]:
        """SimHash + 关键词 发现跨项目相似 Bug"""

    async def get_bug_stats(self) -> BugStats:
        """返回 4 项目 Bug 统计: {project: {total, open, resolved, by_severity}}"""

# 跨项目聚合
class CrossProjectAggregator:
    async def aggregate_by_pattern(self, pattern: str) -> PatternReport:
        """聚合跨项目的同类缺陷模式（如 '参数名不匹配' 出现在哪些项目中）"""
```

---

<a id="sec-4"></a>
## 四、实施路线图

### 阶段一：分类体系 + 模板（P1，约 1.3d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 统一 Bug 分类标准文档 | `shared/bug-classification.md` | 0.2 |
| Bug 模板标准化（frontmatter 字段统一） | 4 项目 bug 模板更新 | 0.3 |
| YiKnowledge bug 归档扩展到 20+ | 17+ 个新 Bug 文件 | 0.5 |
| YiVad/YiPet bug 归档补充 | 各项目 bug 归档完善 | 0.3 |

### 阶段二：跨项目关联（P1，约 1.0d）

| 任务 | 产出 | 人天 |
|------|------|------|
| SimHash 跨项目相似 Bug 检测 | `cross_project.py` | 0.4 |
| 跨项目引用自动建议 | `cross_project_service.find_related_bugs()` | 0.3 |
| 关联 Bug 双向链接 | frontmatter `cross_project_refs` 自动填充 | 0.3 |

### 阶段三：跨项目检索（P1，约 1.2d）

| 任务 | 产出 | 人天 |
|------|------|------|
| RAG 跨项目检索模式 | `cross_project_service.search_all_projects()` | 0.5 |
| 跨项目聚合视图（同类缺陷模式） | `CrossProjectAggregator` | 0.3 |
| INDEX.md 跨项目索引更新 | Bug 统计 + 跨项目热点 | 0.2 |
| 前端"跨项目"开关 | YiVad 知识库页面 | 0.2 |

### 阶段四：仪表盘 + 治理（P2，约 0.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| Bug 统计仪表盘 | `get_bug_stats()` + 前端饼图 | 0.3 |
| 跨项目分类一致性审计 | 定期检查 4 项目分类标签一致性 | 0.2 |

**总计：4.0d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

- [ ] 4 项目 Bug 模板 frontmatter 字段一致（project/module/severity/status）
- [ ] SimHash 跨项目阈值 ≤ 3（与 M20 去重引擎一致）
- [ ] 跨项目检索移除项目过滤后性能无显著退化（< +10% 延迟）
- [ ] `cross_project_refs` 双向链接确保可追溯
- [ ] INDEX.md 统计数据与实际文件数一致

---

<a id="sec-6"></a>
## 六、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| SimHash 跨项目误关联 | 中 | 中 | 仅关联汉明距离 ≤ 2 的高置信度匹配（≤ 3 为建议） | 人工审核关联 |
| 跨项目检索延迟增加 | 低 | 中 | 4 项目文档总数 ≈ 800+，向量检索延迟与项目数无关 | 无 |

---

<a id="sec-7"></a>
## 七、实现完成记录

> **状态**：进行中。

### 7.1 产出清单

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 分类标准 | 1 | `shared/bug-classification.md` |
| Bug 归档 | 30+ | 4 项目 Bug 文件 |
| 后端代码 | 2 | `cross_project_service.py` + `cross_project.py` |
| 索引更新 | 1 | `INDEX.md` |
| **合计** | **34+** | |

---

<a id="sec-8"></a>
## 八、已知缺口与技术债

### 8.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | YiPet bug 归档数量少（< 10） | 跨项目关联对 YiPet 覆盖不足 | 补充 YiPet bug 归档到 20+ |
| 2 | 跨项目关联不支持自动 PR 创建 | 发现关联后需手动创建跨项目 issue | 远期：自动创建跨项目引用 PR |

### 8.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | Bug 模板 frontmatter 字段校验未自动化 | P2 | 0.2 | 依赖人工审查（就绪检查清单） | 待实施（pre-commit hook 扩展） |
| 2 | 跨项目检索缓存未实现 | P3 | 0.3 | 跨项目查询缓存命中率低（查询多样性高） | 待评估 |

---