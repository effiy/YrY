---
doc_type: module
prd_task_id: "YK-09-M20"
title: "YK-09-M20: 内容质量与分析 — 开发方案"
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
source_prd: "02-功能实现-内容质量与分析.md"
source_okr: [yiknowledge-001]
related_tests: ["02-prd-test-内容质量与分析"]
---

# YK-09-M20: 内容质量与分析 — 开发方案

> 来源 PRD：[02-功能实现-内容质量与分析.md](../../prds/2026-09/02-功能实现-内容质量与分析.md)
> 需求编号：YK-09-M20 · 24 个子需求 · 人天：8.0d（前端 3.5 + 后端 4.5）
> 测试方案：[02-prd-test-内容质量与分析.md](../../tests/2026-09/02-prd-test-内容质量与分析.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、模块与接口契约](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、技术风险与回归预测](#sec-6)
- [七、实现完成记录](#sec-7)
- [八、已知缺口与技术债](#sec-8)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 功能域划分

24 个子需求按功能域分为 8 个模块组，总计 8.0d。

| 域 | 子需求数 | 核心能力 | 人天 |
|----|---------|---------|------|
| 审核工作流 | 1 | 审核状态机、检查清单自动化、审核人分配、通知 | 1.0 |
| 可读性与复杂度 | 3 | 可读性评分（Flesch）、句子复杂度、词汇难度 | 1.1 |
| 信息质量分析 | 4 | 信息密度、情感分析、受众匹配、健康报告 | 1.2 |
| 去重与一致性 | 4 | 内容去重（SimHash）、同义检测、术语一致性、事实核查 | 1.2 |
| 安全与合规 | 4 | 安全分类、合规检查、版权管理、行业标准对齐 | 1.2 |
| 自动化测试 | 3 | 内容自动化测试、嵌入式测验、代码示例测试 | 0.9 |
| 统计仪表盘 | 1 | 质量评分汇总、分面统计、趋势图 | 0.5 |
| 评分与术语 | 4 | 内容质量评分、术语表管理、难度评级、重要性评分 | 1.2 |

### 1.2 目录与文件清单

```
YiAi/src/
├── services/content/
│   ├── quality_service.py           # 质量分析 API（评分/可读性/复杂度/密度/情感/受众）
│   ├── review_service.py            # 审核工作流 API（状态机/分配/通知）
│   ├── dedup_service.py             # 去重与一致性 API（SimHash/同义检测/术语一致性）
│   ├── compliance_service.py        # 安全与合规 API（安全分类/合规检查/版权/行业标准）
│   └── stats_service.py             # 统计仪表盘 API（聚合/趋势/排行）
├── domain/content/
│   ├── quality/
│   │   ├── readability.py           # Flesch 可读性 + 句子复杂度 + 词汇难度
│   │   ├── information.py           # 信息密度 + 情感分析 + 受众匹配
│   │   └── scorer.py                # 综合质量评分引擎
│   ├── review/
│   │   ├── workflow.py              # 审核状态机（draft→in_review→approved→published→archived）
│   │   ├── checklist.py             # 15 项审核检查清单自动化执行
│   │   └── notifier.py              # 审核通知（企微消息 + 邮件）
│   ├── dedup/
│   │   ├── simhash.py               # SimHash 相似度检测
│   │   ├── synonym_detect.py        # 同义表达检测
│   │   └── consistency.py           # 术语一致性扫描 + 事实核查
│   ├── compliance/
│   │   ├── security_classifier.py   # 内容安全分类与分级
│   │   ├── compliance_checker.py    # 合规性检查 + 审计就绪
│   │   ├── copyright.py             # 版权管理（License 检测/归属）
│   │   └── standards.py             # 行业标准对齐检查
│   ├── testing/
│   │   ├── content_test.py          # 内容自动化测试（链接/格式/Frontmatter/代码块）
│   │   ├── quiz_generator.py        # 嵌入式测验生成（LLM）
│   │   └── code_test.py             # 代码示例可运行性验证
│   └── stats/
│       ├── dashboard.py             # 统计聚合引擎
│       └── glossary.py              # 术语表与词汇管理
├── data/
│   ├── quality_repository.py        # 质量分析结果 CRUD
│   ├── review_repository.py         # 审核记录 CRUD
│   └── collections/
│       ├── content_quality          # 内容质量分析结果
│       ├── content_reviews          # 审核记录
│       └── glossary_terms           # 术语表条目
└── shared/
    └── quality_types.py             # 质量领域类型定义
```

### 1.3 前端

```
YiKnowledge/static/js/
├── quality/
│   ├── dashboard.ts                 # 统计仪表盘（评分汇总/趋势图/排行）
│   ├── reviewPanel.ts               # 审核面板（状态流转/检查清单/分配）
│   └── reportViewer.ts              # 质量报告查看器
```

---

<a id="sec-2"></a>
## 二、关键技术决策

### D-01：SimHash 而非 MinHash 用于去重

SimHash 对 Markdown 文档的局部修改（修改一个段落、添加 Frontmatter 字段）不敏感——汉明距离变化 < 3 bit。MinHash 对文档修改更敏感，容易将修改后的同一文档误判为独立文档。64-bit SimHash 指纹内存占用极小（8 bytes/文档），800 文档全量比对仅需 O(n²/64) 次汉明距离计算。

### D-02：可读性评分 — Flesch 适应中文

标准 Flesch Reading Ease 公式基于英文音节计数，不适用于中文。中文采用变体：基于平均句长 + 汉字难度等级（HSK 1-6 级），对技术文档额外加权（代码块/公式降低可读性权重）。

### D-03：审核状态机 — MongoDB 状态字段 + 事件日志

不引入独立工作流引擎（Temporal/Cadence），审核状态变更通过更新文档的 `review_status` 字段 + 写入 `content_reviews` 事件日志实现。YiKnowledge 的审核频率（日均 < 10 次）不需要工作流引擎的复杂性。

### D-04：术语一致性 — 术语表 + 模糊匹配

术语表存储标准术语及其变体（如 "RAG" ↔ "检索增强生成" ↔ "Retrieval Augmented Generation"）。扫描文档时检测是否使用了术语表中的非标准变体，提示替换。模糊匹配阈值 0.8 避免误报缩写。

### D-05：内容安全分类 — LLM few-shot + 规则双重

LLM 分类（安全/敏感/机密/公开）+ 规则兜底（关键词黑名单/正则）。规则兜底确保即使 LLM 不可用，基础安全分类仍生效。

---

<a id="sec-3"></a>
## 三、模块与接口契约

### 3.1 审核工作流

```python
class ReviewWorkflow:
    """审核状态机"""

    VALID_TRANSITIONS = {
        "draft": ["in_review"],
        "in_review": ["approved", "changes_requested"],
        "changes_requested": ["in_review"],
        "approved": ["published"],
        "published": ["archived"],
    }

    async def transition(self, file_path: str, to_status: str,
                         reviewer: str, comment: str = "") -> ReviewEvent: ...
    async def assign_reviewer(self, file_path: str) -> str:
        """基于文件领域 + 审核人负载均衡自动分配"""
    async def get_history(self, file_path: str) -> list[ReviewEvent]: ...

class ReviewChecklist:
    """15 项审核检查清单自动化"""

    ITEMS = [
        "frontmatter_complete",    # Frontmatter 8 字段完整
        "tags_array_format",       # tags 为数组格式
        "links_valid",             # 链接有效性（HEAD 请求）
        "code_blocks_syntax",      # 代码块语法正确
        "image_paths_valid",       # 图片路径可达
        "no_placeholder_content",  # 无 "TODO"/"TBD" 占位符
        "heading_hierarchy",       # 标题层级不跳跃（H1→H3 缺 H2）
        "reading_time",            # 阅读时间标注正确
        "status_valid",            # status 字段为合法枚举值
        "category_match",          # category 与实际目录一致
        "cross_refs_valid",        # 交叉引用可达
        "no_duplicate_content",    # 无重复内容（SimHash 检查）
        "terminology_consistent",  # 术语一致性
        "security_classified",     # 安全分级已完成
        "compliance_checked",      # 合规检查已通过
    ]

    async def run_all(self, file_path: str) -> ChecklistResult: ...
```

### 3.2 质量评分引擎

```python
class QualityScorer:
    """综合质量评分 — 加权多维度评分"""

    WEIGHTS = {
        "readability": 0.15,      # 可读性（Flesch 中文变体）
        "completeness": 0.20,     # 完整性（章节/字段/引用）
        "consistency": 0.15,      # 一致性（术语/格式/风格）
        "freshness": 0.10,        # 新鲜度（updated 距今天数）
        "accuracy": 0.20,         # 准确性（链接有效/代码可运行/事实核查）
        "engagement": 0.10,       # 参与度（阅读时长/反馈/引用）
        "compliance": 0.10,       # 合规性（安全/版权/行业标准）
    }

    async def score(self, file_path: str) -> QualityScore:
        """返回 0-100 综合评分 + 各维度子评分"""
```

### 3.3 去重与一致性

```python
class SimHashDedup:
    def fingerprint(self, content: str) -> int: ...  # 64-bit SimHash
    def hamming_distance(self, fp1: int, fp2: int) -> int: ...
    def find_duplicates(self, fp: int, threshold: int = 3) -> list[str]: ...

class TerminologyChecker:
    async def scan(self, content: str, glossary: Glossary) -> list[TermIssue]:
        """检测非标准术语使用，返回替换建议"""
```

### 3.4 其余核心接口摘要

| 模块 | 关键方法 |
|------|---------|
| `ReadabilityAnalyzer` | `flesch_zh(text) → score`、`sentence_complexity(text) → {avg_len, hard_sentences}`、`vocab_difficulty(text, hsk_levels) → {level_distribution, avg_level}` |
| `InformationAnalyzer` | `density(text) → {entities_per_k, facts_per_k}`、`sentiment(text) → {polarity, subjectivity}`、`audience_match(text, target) → {match_score, mismatches}` |
| `SecurityClassifier` | `classify(text) → {level, reasons}` (public/internal/confidential/restricted) |
| `ComplianceChecker` | `check(text, regulation) → {passed, violations}` (GDPR/网络安全法/数据安全法) |
| `CopyrightManager` | `detect_license(text) → License`、`check_attribution(text) → {missing_sources}` |
| `QuizGenerator` | `generate(text, count=5) → [Quiz]` (LLM 生成选择题/判断题/填空题) |
| `ContentTester` | `run_tests(file_path) → TestReport` (链接/格式/Frontmatter/代码块/图片) |
| `DashboardEngine` | `aggregate(filters?) → Dashboard` (按领域/时间/类型聚合) |
| `GlossaryManager` | `add_term(term, variants, domain)`、`search(query) → [Term]`、`scan_consistency(file) → [Issue]` |

---

<a id="sec-4"></a>
## 四、实施路线图

### 阶段一：审核 + 基础质量（P1，约 3.0d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 审核工作流（状态机 + 检查清单 + 分配 + 通知） | `review_service` + `workflow.py` + `checklist.py` + `notifier.py` | 1.0 |
| 可读性分析（Flesch 中文 + 句子复杂度 + 词汇难度） | `readability.py` + RPC | 0.6 |
| 内容质量评分引擎 | `scorer.py`（7 维度加权） | 0.4 |
| 前端审核面板 | `reviewPanel.ts`（状态流转/检查清单可视化/审核人分配） | 0.5 |
| 前端统计仪表盘（基础） | `dashboard.ts`（评分汇总/排行） | 0.5 |

### 阶段二：去重 + 分析（P2，约 2.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 去重（SimHash + 同义检测） | `simhash.py` + `synonym_detect.py` | 0.4 |
| 术语一致性 + 术语表管理 | `consistency.py` + `glossary.py` | 0.5 |
| 信息质量分析（密度/情感/受众） | `information.py` | 0.5 |
| 事实核查（LLM few-shot） | `consistency.py` 扩展 | 0.4 |
| 内容健康报告 | 基于以上分析的综合报告 | 0.3 |
| 前端质量报告查看器 | `reportViewer.ts` | 0.4 |

### 阶段三：安全 + 测试（P2，约 2.5d）

| 任务 | 产出 | 人天 |
|------|------|------|
| 安全分类 + 合规检查 | `security_classifier.py` + `compliance_checker.py` | 0.5 |
| 版权管理 + 行业标准对齐 | `copyright.py` + `standards.py` | 0.4 |
| 内容自动化测试（链接/格式/代码块） | `content_test.py` | 0.4 |
| 嵌入式测验 + 代码示例测试 | `quiz_generator.py` + `code_test.py` | 0.5 |
| 统计仪表盘（趋势/分面） | `dashboard.py` 扩展 + 前端趋势图 | 0.4 |
| 重要性评分 + 难度评级 | `scorer.py` 扩展 | 0.3 |

**总计：8.0d（前端 3.5d + 后端 4.5d）**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

### 审核工作流

- [ ] 状态机转换校验：非法转换（如 draft→published）被拒绝
- [ ] 审核检查清单 15 项全部可自动执行
- [ ] 审核人分配负载均衡（避免同一人堆积）
- [ ] 审核通知包含文件路径和审核链接

### 质量评分

- [ ] 7 维度权重总和 = 1.0
- [ ] 各维度评分范围 0-100
- [ ] 评分结果持久化到 `content_quality` 集合
- [ ] 评分幂等（同一文件两次评分结果一致）

### 去重

- [ ] SimHash 64-bit 指纹计算确定（同一内容两次结果相同）
- [ ] 汉明距离 ≤ 3 判定为重复
- [ ] 800 文档全量比对 < 5s

### 术语与事实核查

- [ ] 术语表模糊匹配阈值 0.8
- [ ] 事实核查 LLM prompt 含引用溯源要求
- [ ] 不需要联网的事实核查（内部知识库即可验证）

### 安全与合规

- [ ] 安全分类 4 级（公开/内部/敏感/机密）
- [ ] 规则兜底在 LLM 不可用时生效
- [ ] 版权检测不报磁盘上不存在的 License 文件

---

<a id="sec-6"></a>
## 六、技术风险与回归预测

### 6.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|------|------|------|---------|---------|
| LLM 事实核查产生幻觉 | 中 | 高 | 限定核查范围为内部知识库已有内容（RAG 增强） | 标注"AI 辅助核查，请人工确认" |
| SimHash 对短文档（<500 字）误判 | 中 | 中 | 短文档汉明距离阈值放宽到 5 | 短文档人工审核 |
| 可读性评分中文适应性差 | 中 | 中 | HSK 词汇等级表 + 技术文档加权 | 人工校准评分基准 |
| 审核通知消息风暴 | 低 | 低 | 同一文件的多次通知合并（5 分钟内去重） | 限流 |

### 6.2 回归问题预测

| # | 问题 | 触发场景 | 预防措施 |
|---|------|---------|---------|
| 1 | 质量评分变更导致仪表盘历史数据不一致 | 评分算法参数调整 | 评分版本号 + 历史评分保留 |
| 2 | 术语一致性扫描误报缩写 | 代码块中的变量名被误判为术语变体 | 代码块内容排除在术语扫描外 |
| 3 | 审核状态机与 Git 分支状态冲突 | 文件在审核中被 git push 覆盖 | 审核锁（编辑锁复用） |

---

<a id="sec-7"></a>
## 七、实现完成记录

> **状态**：需求已编写，尚未开始实施。

### 7.1 产出清单（待填充）

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| Service 层 | 5 | quality/review/dedup/compliance/stats |
| Domain 层 | 14 | quality(3) + review(3) + dedup(3) + compliance(4) + testing(3) + stats(2) |
| 数据层 | 2 | quality_repository + review_repository |
| 类型定义 | 1 | quality_types.py |
| 前端 | 3 | dashboard + reviewPanel + reportViewer |
| **合计** | **25** | |

---

<a id="sec-8"></a>
## 八、已知缺口与技术债

### 8.1 功能缺口

| # | 缺口 | 影响 | 现状 | 建议 |
|---|------|------|------|------|
| 1 | 事实核查覆盖范围仅限内部知识库 | 对外部引用的声明无法自动核验 | 未实现外部 API 集成 | 优先核查内部知识已有声明 |
| 2 | 代码示例可运行性验证需 Docker 沙箱 | 安全风险，代码执行可能影响宿主系统 | 未实现（与 M17 代码示例验证共享技术债） | 复用 M17 的 Docker 沙箱方案 |
| 3 | 嵌入式测验不支持主观题自动评分 | 仅支持选择题/判断题/填空题的自动评分 | 未实现 | 主观题标记"需人工评分" |

### 8.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | SimHash 全量比对 O(n²) | P2 | 0.3 | 文档 > 5000 时需升级为 LSH 分桶索引 | 待实施 |
| 2 | 可读性评分 HSK 词汇表需定期更新 | P3 | 0.2 | HSK 3.0 2025 年已发布，当前使用 HSK 2.0 等级 | 待实施 |
| 3 | 情感分析仅支持中英文 | P3 | 0.3 | 多语言情感分析依赖特定模型 | 待评估 |
| 4 | 合规检查规则硬编码 | P3 | 0.5 | GDPR/网络安全法更新后需修改代码 | 待实施（YAML 配置化） |
| 5 | 质量评分历史趋势存储策略 | P3 | 0.2 | 每次评分保存全量结果，800 文件 × 每日评分 = 大量数据 | 待实施（仅持久化变更 > 5 分的评分） |

---