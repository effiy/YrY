---
doc_type: module
prd_task_id: "YK-09-M21"
title: "YK-09-M21: 内容知识工程 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 3.5
estimate_backend: 4.5
source_prd: "03-功能实现-内容知识工程.md"
source_okr: [yiknowledge-001]
related_tests: ["03-prd-test-内容知识工程"]
---

# YK-09-M21: 内容知识工程 — 开发方案

> 来源 PRD：[03-功能实现-内容知识工程.md](../../prds/2026-09/03-功能实现-内容知识工程.md)
> 需求编号：YK-09-M21 · 22 个子需求 · 人天：8.0d（前端 3.5 + 后端 4.5）
> 测试方案：[03-prd-test-内容知识工程.md](../../tests/2026-09/03-prd-test-内容知识工程.md)

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

### 1.1 功能域划分

22 个子需求按 5 个功能域组织，总计 8.0d。

| 域 | 子需求数 | 核心能力 | 人天 |
|----|---------|---------|------|
| 知识工程 | 6 | 知识卡生成/关系图谱/学习路径/个性化推荐/自动关联/AB测试 | 1.8 |
| 国际化 | 5 | 本地化管道/国际化工作流/翻译管理/翻译质量/多语言管理 | 2.2 |
| 生命周期 | 3 | 生命周期管理/版本差异/备份快照 | 1.8 |
| 可访问性 | 3 | 可访问性审计/辅助功能面板/无障碍合规 | 0.9 |
| API 与导出 | 5 | 电子书导出/API接口/批量导入/统计分析/结构化模板 | 1.6 |

### 1.2 文件清单

```
YiAi/src/
├── services/content/
│   ├── knowledge_card_service.py   # 知识卡 API（生成/查询/定制）
│   ├── graph_service.py            # 关系图谱 API（构建/查询/可视化数据）
│   ├── recommend_service.py        # 推荐引擎 API（个性化/关联/学习路径）
│   ├── i18n_service.py             # 国际化 API（本地化管道/翻译/多语言）
│   ├── lifecycle_service.py        # 生命周期 API（状态管理/版本/备份）
│   └── accessibility_service.py    # 可访问性 API（审计/合规检查）
├── domain/content/
│   ├── knowledge/
│   │   ├── card_generator.py       # LLM 知识卡生成（结构化摘要）
│   │   ├── graph_builder.py        # 知识图谱构建（实体+关系提取）
│   │   └── learning_path.py        # 学习路径编排（依赖排序）
│   ├── recommend/
│   │   ├── engine.py               # 协同过滤 + 内容推荐
│   │   ├── association.py          # 自动关联（共现/引用/语义相似度）
│   │   └── ab_test.py              # AB 测试框架（分流/统计/报告）
│   ├── i18n/
│   │   ├── pipeline.py             # 本地化管道（提取→翻译→审阅→发布）
│   │   ├── translation.py          # 翻译管理（复用 M17 翻译记忆库）
│   │   └── locale_manager.py       # 多语言内容管理器
│   ├── lifecycle/
│   │   ├── state_machine.py        # 生命周期状态机（draft→review→stable→archived）
│   │   ├── versioning.py           # 语义版本化（major.minor.patch）
│   │   └── backup.py               # 快照备份（MDB 导出 + Git tag）
│   └── accessibility/
│       ├── auditor.py              # 自动化审计（WCAG 2.1 AA 标准）
│       └── compliance.py           # 合规检查（ARIA/对比度/键盘导航/语义结构）
├── data/
│   ├── knowledge_repository.py     # 知识卡/图谱数据 CRUD
│   ├── i18n_repository.py          # 翻译/多语言内容 CRUD
│   └── collections/
│       ├── knowledge_cards         # 知识卡
│       ├── content_graph           # 内容关系图（节点+边）
│       ├── learning_paths          # 学习路径
│       ├── translations            # 翻译内容
│       └── ab_experiments          # AB 测试实验
└── shared/
    └── knowledge_types.py          # 知识工程类型定义
```

前端新增：
```
YiKnowledge/static/js/
├── knowledge/
│   ├── cardView.ts                 # 知识卡渲染组件
│   ├── graphView.ts                # 关系图谱可视化（D3.js/vis-network）
│   ├── learningPathView.ts         # 学习路径导航
│   ├── i18nPanel.ts                # 国际化管理面板
│   └── accessibilityPanel.ts       # 可访问性审计面板
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：知识图谱 — 混合提取（规则 + LLM）

纯 LLM 提取实体和关系的召回率约 70%，但精确率 > 90%。规则提取（Frontmatter 字段/标题层级/交叉引用 regex）可补充 15-20% 的召回率。两者合并：规则快速提取结构化关系（父子文档/引用/标签共现），LLM 提取语义关系（"依赖于"/"替代了"/"实现了"）。

### D-02：推荐引擎 — 内容+协同混合冷启动

新知识库缺乏用户行为数据（点击/阅读/评分），纯协同过滤无法冷启动。初期以内容推荐为主（TF-IDF/Embedding 相似度 + Frontmatter 标签共现），积累行为数据后逐步引入协同过滤权重。冷启动阶段内容:协同 = 80:20。

### D-03：生命周期状态机 — 可逆转换 + 事件溯源

与审核状态机（M20）不同，生命周期状态机允许 archived→draft 的重新激活。采用事件溯源模式（不修改状态字段，追加事件到 `lifecycle_events` 集合），当前状态通过事件重放计算。便于审计和回溯。

### D-04：备份策略 — MDB 导出 + Git tag 双重

仅 MongoDB 导出（`mongodump`）在恢复时需要重建完整环境。Git tag 标记每次备份时的 commit，配合 MDB 导出文件命名 `backup-{date}-{git_tag}.json`。恢复时：checkout 对应 tag + 导入 MDB 导出文件。

### D-05：可访问性审计 — axe-core 自动化

使用 axe-core（Deque Labs，WCAG 2.1 AA 规则集）自动化扫描渲染后的 HTML。axe-core 覆盖约 57% 的 WCAG 成功标准（可自动化部分），剩余需人工检查（如"内容可理解性"）。审计报告区分自动/人工两类。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 知识卡

```python
class KnowledgeCardGenerator:
    async def generate(self, file_path: str, template: str = "default") -> KnowledgeCard:
        """LLM 生成结构化知识卡：
        {title, summary(≤200字), key_points[3-5], related_docs[3-5],
         difficulty_level, estimated_reading_time, last_updated}"""

    async def batch_generate(self, file_paths: list[str]) -> list[KnowledgeCard]: ...
    async def customize(self, card_id: str, overrides: dict) -> KnowledgeCard: ...
```

### 3.2 关系图谱

```python
class GraphBuilder:
    async def build(self, scope: "global" | "domain" | "tag") -> GraphData:
        """构建知识图谱：nodes=[{id,label,type,group}], edges=[{source,target,type,weight}]"""

    async def find_path(self, from_doc: str, to_doc: str) -> list[GraphEdge]: ...
    async def get_ego_network(self, doc: str, radius: int = 2) -> GraphData: ...
    async def export(self, format: "json" | "gexf" | "cytoscape") -> bytes: ...
```

### 3.3 推荐引擎

```python
class RecommendEngine:
    async def similar_docs(self, doc: str, limit: int = 5) -> list[Recommendation]: ...
    async def personalized(self, user_history: list[str], limit: int = 5) -> list[Recommendation]: ...
    async def learning_path(self, topic: str, level: str = "beginner") -> LearningPath:
        """生成学习路径：有序文档列表，含每篇文档的 prerequisites 和 next_steps"""

class ABTestEngine:
    async def create_experiment(self, config: ABTestConfig) -> str: ...
    async def assign_variant(self, experiment_id: str, user_id: str) -> str: ...
    async def get_results(self, experiment_id: str) -> ABTestReport: ...
```

### 3.4 其余核心接口摘要

| 模块 | 关键方法 |
|------|---------|
| `I18nPipeline` | `extract_strings(file) → [I18nString]`、`translate_batch(strings, target_langs) → [Translation]`、`publish(lang, files) → None` |
| `TranslationManager` | `create_job(file, target_langs)`、`review_translation(job_id, status)`、`get_tm_matches(text, source, target) → [TMMatch]` |
| `LocaleManager` | `set_locale(file, lang)`、`get_translated(file, lang)`、`sync_all(lang) → SyncReport` |
| `LifecycleStateMachine` | `transition(file, to_status, actor)`、`get_history(file) → [LifecycleEvent]`、`get_current_state(file) → LifecycleState` |
| `SemanticVersioning` | `bump(file, level: "major"\|"minor"\|"patch")`、`diff(v1, v2) → DiffResult`、`get_history(file) → [Version]` |
| `BackupManager` | `create_snapshot(label?) → BackupMeta`、`restore(snapshot_id) → None`、`list_snapshots(limit?) → [BackupMeta]` |
| `AccessibilityAuditor` | `audit(file_or_url) → AuditReport`（自动 57% + 人工 43% 清单）、`check_compliance(standard: "wcag2.1aa") → ComplianceReport` |

---

<a id="sec-4"></a>
## 四、实施路线图

### 阶段一：知识工程 + 生命周期（P1，约 3.6d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 知识卡生成（LLM 结构化摘要） | `card_generator.py` + RPC | 0.3 |
| 关系图谱（规则+LLM 混合提取） | `graph_builder.py` + 前端 D3.js 可视化 | 0.5 |
| 学习路径 + 推荐引擎 | `learning_path.py` + `engine.py` + `association.py` | 0.5 |
| 生命周期状态机（事件溯源） | `state_machine.py` + RPC | 0.5 |
| 语义版本化 + 差异对比 | `versioning.py`（复用 M17 version_service） | 0.5 |
| 备份与快照（MDB 导出 + Git tag） | `backup.py` + RPC | 0.3 |
| 前端：知识卡 + 图谱 + 学习路径 | `cardView.ts` + `graphView.ts` + `learningPathView.ts` | 1.0 |

### 阶段二：国际化（P2，约 2.2d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 本地化管道（提取→翻译→审阅→发布） | `pipeline.py` + RPC | 0.5 |
| 翻译管理（复用 M17 TM + 术语表） | `translation.py` | 0.4 |
| 多语言内容管理 | `locale_manager.py` | 0.5 |
| 国际化工作流 | `i18n_service.py` 编排 | 0.3 |
| 前端：国际化管理面板 | `i18nPanel.ts` | 0.5 |

### 阶段三：可访问性 + API + AB 测试（P2，约 2.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 可访问性审计（axe-core 自动化） | `auditor.py` + 前端审计面板 | 0.5 |
| 无障碍合规检查 | `compliance.py` | 0.2 |
| 辅助功能面板 | `accessibilityPanel.ts`（字体/对比度/朗读） | 0.3 |
| AB 测试框架 | `ab_test.py` + RPC | 0.3 |
| 电子书导出（epub/mobi） | 复用 M17 导出管道 + epub 格式 | 0.3 |
| 内容 API（RESTful） | `knowledge_card_service` + `graph_service` 扩展 | 0.3 |
| 批量导入 + 统计分析 API | `recommend_service` 扩展 | 0.3 |
| 结构化模板 | `card_generator.py` 扩展（template system） | 0.3 |

**总计：8.0d（前端 3.5d + 后端 4.5d）**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

### 知识工程

- [ ] 知识卡 LLM prompt 含输出格式约束（JSON schema）
- [ ] 关系图谱规则提取覆盖：Frontmatter `related` 字段、`[[wikilink]]` 语法、目录引用
- [ ] 推荐引擎冷启动内容推荐权重 ≥ 80%
- [ ] 学习路径无环（DAG 拓扑排序校验）

### 国际化

- [ ] 翻译记忆库复用 M17 `translation_memory` 集合，不重复创建
- [ ] 多语言内容与源文件路径映射正确（`en/`, `zh/` 前缀）
- [ ] 本地化管道：提取阶段跳过代码块内容

### 生命周期

- [ ] 状态机全部转换路径经过事件溯源写入
- [ ] 备份文件名格式 `backup-{YYYY-MM-DD}-{git_tag}.json`
- [ ] 版本差异对比复用 M17 `version_service.get_diff`

### 可访问性

- [ ] axe-core 自动化审计覆盖 57% WCAG 2.1 AA 成功标准
- [ ] 人工检查清单清晰列出 43% 不可自动化项目
- [ ] 辅助功能面板：字体缩放/对比度切换/屏幕阅读器兼容

---

<a id="sec-6"></a>
## 六、技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| LLM 知识卡生成质量不稳定 | 中 | 中 | 输出 JSON schema 约束 + 长度限制 | 降级为首段截取 |
| 关系图谱 LLM 提取幻觉关系 | 中 | 高 | 规则提取作为基底（精确率 100%），LLM 提取标注置信度 | 仅展示高置信度(>0.8)边 |
| 推荐冷启动准确率低 | 高 | 中 | 初期以内容推荐为主，逐步引入协同过滤 | 人工精选推荐列表 |
| 备份文件过大（MDB 全量导出） | 低 | 中 | 增量备份 + 全量备份交替（7 天周期） | 仅保留最近 10 个快照 |
| axe-core 审计误报 | 中 | 低 | 已知误报规则白名单 | 人工复核标记误报 |

---

<a id="sec-7"></a>
## 七、实现完成记录

> **状态**：需求已编写，尚未开始实施。

### 7.1 产出清单（待填充）

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| Service 层 | 6 | knowledge_card/graph/recommend/i18n/lifecycle/accessibility |
| Domain 层 | 13 | knowledge(3) + recommend(3) + i18n(3) + lifecycle(3) + accessibility(2) |
| 数据层 | 2 | knowledge_repository + i18n_repository |
| 类型定义 | 1 | knowledge_types.py |
| 前端 | 5 | cardView + graphView + learningPathView + i18nPanel + accessibilityPanel |
| **合计** | **27** | |

---

<a id="sec-8"></a>
## 八、已知缺口与技术债

### 8.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | 关系图谱实时更新 | 新增/修改文档后图谱需手动重建 | 批量构建模式（非增量） | 集成到 KnowledgeWatcher（文档变更时增量更新图节点） |
| 2 | 个性化推荐冷启动体验 | 新用户无行为历史时推荐不精准 | 当前以内容推荐为主 | 阶段二引入用户角色/领域偏好配置 |
| 3 | 电子书导出格式仅支持 epub | mobi/azw3 格式未实现 | 仅 epub | Calibre CLI 集成或阶段三补充 |

### 8.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 关系图谱 D3.js 大数据量性能 | P2 | 0.3 | 节点 > 500 时力导向布局卡顿，需 WebGL 渲染器替代 | 待实施 |
| 2 | 事件溯源事件日志无限增长 | P2 | 0.3 | lifecycle_events 集合无 TTL，1 年后预估 > 10 万条 | 待实施（归档 > 1 年事件到冷存储） |
| 3 | 备份文件无加密 | P3 | 0.2 | 备份 JSON 文件明文存储，含敏感 Frontmatter 信息 | 待实施（AES-GCM 加密） |
| 4 | axe-core 审计需浏览器环境 | P3 | 0.3 | CI 中无浏览器（jsdom 不支持），当前仅本地手动运行 | 待实施（Playwright + axe-core） |
| 5 | 学习路径无进度追踪 | P3 | 0.3 | 用户完成某篇文档后路径无标记 | 待实施（集成阅读进度追踪） |

---