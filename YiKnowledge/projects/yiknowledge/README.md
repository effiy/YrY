---
title: YiKnowledge 知识库索引
tags: [yiknowledge, knowledge-base, architecture, governance, rag-datasource, roles, adr, frontmatter]
category: projects/yiknowledge
created: 2026-08-25
updated: 2026-10-09
source: YiKnowledge
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [curator, engineer, leader, product, sre, aier, executive]
benefit: "YiKnowledge 自描述知识体系——架构设计、角色边界、治理规范、15 字段 Frontmatter、RAG 数据源集成、知识库新人 5 天上手路线图"
benefit_secondary: "服务于人类（知识工作者阅读）和 AI（YiAi RAG 检索数据源）双重读者，确保语义可解析、结构可追溯"
acceptance_criteria:
  - "7 个角色目录（engineer/product/leader/sre/aier/executive/curator）边界清晰"
  - "5 个流水线阶段（OKR→PRD→Dev→Test→Postmortem）闭环说明"
  - "Frontmatter 15 强制字段列出并解释用途"
  - "ADR 架构决策记录 8 核心字段强制规范"
  - "新人 5 天上手路线图：Day1~Day5 任务 + Checklist + 常见坑"
related:
  - ../INDEX.md
  - ../README.md
  - ../../MEMORY.md
  - ../../INDEX.md
  - ../../CLAUDE.md
aliases:
  - yiknowledge-readme
  - yiknowledge-overview
  - yi-family-knowledge-base
  - kb-frontmatter15-standard
  - kb-rag-dual-reader
---

# YiKnowledge 项目知识库

> **面向人机双读者的知识底座** —— 自身既是 Markdown 文档集合（供工程师/产品/Leader 等人类阅读），又是 YiAi RAG 引擎的核心结构化数据源（供 AI 检索、回答、推理）。定义全仓库的 **7 角色目录体系**、**5 阶段软件交付流水线**、**15 字段 Frontmatter 元数据标准**、**ADR 架构决策 8 强制字段**、知识生命周期治理与 STRIDE 威胁建模框架。

---

## 0.1 快速入门三阶（30 秒 / 5 分钟 / 30 分钟）

### 30 秒速览 — 理解 YiKnowledge 定位与 4 条红线

| 维度 | 一眼看懂 |
|------|---------|
| **YiKnowledge 是什么** | 全仓库唯一的「知识治理 + RAG 数据源」双角色目录：人可读规范集合，AI 可检索知识库 |
| **两条服务对象** | 👤 人类知识工作者（阅读/贡献） + 🤖 YiAi RAG 引擎（BM25+向量混合检索） |
| **4 条硬红线（违反即 PR 打回）** | ① Frontmatter 15 字段齐全 / ② ADR 必 8 核心字段 / ③ 项目编号三位数字（001 正确，0001 ❌）/ ④ 目录深度 ≤ 3 |
| **新人入口** | 先看 §0 新人 5 天上手路线图 → 再看 §2 角色决策树 → 最后走 §0.1 5 分钟跑通 Lint |
| **角色锚点** | Curator 治理者 · Engineer 工程师 · Product 产品 · Leader 管理 · SRE 可靠性 · AIer AI 工程 · Executive 高管 — 共 7 类 |

### 5 分钟启动 — 贡献第一条知识并通过质量门禁

1. **环境准备**：无需编译，任选 Markdown 编辑器（VS Code 推荐装 YAML/Markdown Lint 插件）
2. **拿一张 Gold Copy 模板**：
   - PRD 模板：`projects/yiai/prds/` 下任一 00x 开头文件（15 Frontmatter + 5 章节标准骨架）
   - ADR 模板：`workflows/架构设计/0xx-架构设计-ADR-*.md`（必含 8 核心字段）
3. **复制到正确归属目录**：用 §2.1 角色决策树判断 7 选 1，目录树深度 ≤ 3
4. **Frontmatter Lint 本地校验**：
   ```bash
   cd /Users/yi/YrY/YiKnowledge
   # 运行知识库 Lint 脚本（无则跳过，PR 会跑）
   python3 scripts/lint_frontmatter.py executive/reading-list/*.md projects/*/README.md
   ```
5. **质量门禁（PR 必过 3 条）**：
   - [ ] `scripts/lint_frontmatter.py` exit 0
   - [ ] 文件名三位数字前缀 + kebab-case（禁止 0001 / yivad-yivad-003）
   - [ ] 7 角色目录归属正确（Curator 审核，错放 PR 打回）

### 30 分钟主线 — 完成一次「新知识 → PR 合入」全链路

| 步骤 | 动作 | 涉及文件/目录 | 交付物 |
|------|------|--------------|--------|
| ① 对齐模式 | 识别知识类型（PRD / Dev / Bug / ADR / Runbook / Workflow / OKR） | `workflows/开发规范/005-开发规范-知识条目模式.md` | 1 份类型判断记录 |
| ② 确定归属 | 用 §2.1 决策树选 7 角色目录 + 3 层内子目录 | `workflows/架构设计/004-架构设计-角色边界.md` | 目录路径确定 |
| ③ 撰写 Frontmatter | 严格按 15 字段：aliases≥2 / roles 数组 / AC≥3 / benefit 非空 | `workflows/开发规范/003-开发规范-Frontmatter模式.md` | Lint 通过 |
| ④ 写正文 | 对应类型模板：PRD 7 章节 / ADR 8 字段 / Bug 5 章节（复现+根因+修复+CR+回归） | Gold Copy 范例文件 | Markdown 文件 |
| ⑤ 自检 & 提交 | 本地 Lint → 修复死链 → PR 标题格式「[KB-XXX] 简述」 | `git commit` → `git push` | 待 Review PR |
| ⑥ CR & 合入 | Curator / 对应角色 Reviewer 双审 → 修正 → Merge | PR 评论串 | 合入主分支 |

---

## 0.2 按角色学习路径（6 类工程角色，各有独立主线）

| 角色 | 第 1 天 | 第 3 天 | 第 7 天 | 达到标准 |
|------|--------|--------|--------|---------|
| **KB Curator** 知识治理者 | §1 画像 + §5 Frontmatter15 字段背诵 + §2.1 决策树 | §4 ADR8 字段 + §10 治理健康看板 + 去重脚本实操 | §11 STRIDE 威胁建模 + §8 RAG 数据源集成 + 月度评审主持 | 能独立审核 PR，Lint 覆盖 ≥ 95% |
| **Backend / AI Eng** 后端对接 | §6 RAG 索引工作流 + 15 Frontmatter 对齐 | §8 RAG 架构 + POST /rag-build 手动触发 + STRIDE 数据注入风险 | §10 治理 + §7 目录深度约束 + §2 双读者边界 | 知识条目能被 YiAi RAG ≥ 90% 命中 |
| **Frontend / Product** 文档作者 | §0.1 30 秒 + §2 角色决策树 + §5 Frontmatter | §5 条目模式 + §3 新人 5 天路线图 + §2.1 归属判断 | §4 ADR（决策类文档）+ §6 OKR→PRD 追溯 | 独立撰写 PRD/Dev，Frontmatter Lint 全过 |
| **SRE** 可靠性工程 | §9 SRE 角色目录 + §4 ADR Runbook 类 | §11 STRIDE 安全威胁 + §10 月度健康看板 + Runbook 模板 | §6 OKR→SLO 对齐 + GameDay 演练文档规范 | SLO/SLI 文档正确，Runbook 5 字段齐全 |
| **QA** 测试工程师 | §3 Day3 调试单测 + §5 Frontmatter roles=[qa] | Bug 报告 5 章节（复现/根因/修复/CR/回归） | Test 目录规范 + §6 OKR→KR 测试可追溯 | Bug 报告复现步骤 100% 可重放 |
| **Tech Leader / Executive** 管理决策 | §0.1 30 秒 + §1 画像 + §6 OKR→PRD→Dev→Test Mermaid | §4 ADR 8 字段 + §11 STRIDE 6 威胁 + §10 健康看板 | §2.1 7 角色决策 + §8 RAG 双读者 ROI 度量 | 独立写 ADR，跨项目契约与 KB 引用正确 |

---

## 0. 新人入职指南 — 5 天上手路线图

| 阶段 | 核心任务 | 交付物 | 参考文档 | Checklist |
|------|---------|--------|---------|-----------|
| **Day 1 · 总览与阅读** | 阅读顶层 README · INDEX · MEMORY · CLAUDE.md，理解 7 角色 × 5 阶段矩阵 | 手绘一张「角色-流水线」二维矩阵图 | [顶层 README](../../README.md) · [顶层 INDEX](../../INDEX.md) | 能说出 7 个角色名称 + 5 个阶段名称 ✓ |
| **Day 2 · Frontmatter 与模板** | 掌握 15 字段 Frontmatter · 阅读 3 篇已有 PRD / Dev / Bug 范例 | 仿模板独立写 1 篇测试文档 frontmatter 通过校验脚本 | [Frontmatter 模式](./workflows/开发规范/003-开发规范-Frontmatter模式.md) · [知识条目模式](./workflows/开发规范/005-开发规范-知识条目模式.md) | 15 字段齐全 · 无中文 key · 日期格式 YYYY-MM-DD ✓ |
| **Day 3 · 角色边界与决策树** | 熟记 7 角色职责 · 决策树判断新知识归属 · 3 级目录最大深度约束 | 为 5 条知识样例判断正确归属目录 | [角色边界](./workflows/架构设计/004-架构设计-角色边界.md) | 100% 正确率 · 目录深度 ≤ 3 ✓ |
| **Day 4 · RAG 数据源集成** | 跑一遍知识生命周期 · 触发 `POST /rag-build` · 验证检索命中 | /rag/chat 提问"XX 项目架构"能召回自己写的文档 | [RAG 检索引擎集成](./workflows/架构设计/005-架构设计-RAG检索引擎集成.md) · [RAG 索引工作流](./workflows/操作指南/004-指南-RAG索引工作流.md) | 构建成功 · 召回率 ≥ 80% ✓ |
| **Day 5 · 贡献第一条 PR** | 发现并修复 1 个坏味道（死链 / 错误 frontmatter / 错放目录）· 走提交流程 | PR 合入主分支 | [知识管理规范](./workflows/操作指南/003-指南-知识管理规范.md) · [分支管理](./workflows/流程规范/001-流程-分支管理规范.md) | Lint 检查通过 · Curator Review ✓ |

---

## 1. 项目画像

| 维度 | 规格 |
|------|------|
| **项目名称** | YiKnowledge — 人机双读知识底座 |
| **类型** | 结构化知识库（Markdown + YAML Frontmatter） |
| **物理格式** | 文件系统目录树 · 单篇 Markdown 文件 |
| **知识规模** | 2,450+ 文档 · 5 个项目子目录 · 7 角色目录 · 5 流水线阶段 |
| **版本管理** | Git（主仓库 YrY 子目录）· PR + Review 机制 |
| **人类读者** | 7 角色：Engineer · Product · Leader · SRE · AIer · Executive · Curator |
| **AI 读者** | YiAi RAG 引擎 · BM25 + 向量混合检索 · 60s 轮询扫描变更 |
| **元数据标准** | **15 字段 Frontmatter 强制规范**（所有文档）|
| **ADR 标准** | **8 核心字段强制规范**（架构决策记录）|
| **目录深度限制** | **最多 3 层**：`role/problem-domain/document.md`（防迷路）|
| **命名规范** | 文件名 kebab-case · **禁止下划线 · 禁止数字前缀过度补零**（001 OK，0001 ❌）|
| **治理机制** | Curator 角色 · 月度健康看板 · Review Cycle=monthly · STRIDE 威胁模型 |
| **索引构建** | **手动触发**：`POST /rag-build`；增量：`YIAI_ALLOW_RAG_REFRESH=1 + auto_rebuild_enabled=true` |
| **项目知识目录** | projects/{yiai,yivad,yipet,yipot,yiknowledge} 5 大项目各自 PRD/Dev/Test/Bug/Workflows/OKR |

---

## 2. 核心架构 — 7 角色 × 5 流水线 × 双读者

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          软件交付流水线（横向 5 阶段）                         │
│   OKR (目标) ──▶ PRD (需求) ──▶ Dev (方案) ──▶ Test (验证) ──▶ Postmortem   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ┃
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  角色目录（纵向 7 维）        ×          双重读者服务                          │
│                                                                             │
│  ┌─ curator/      知识治理者   │   规范 · 模板 · 健康看板 · 生命周期        │  ┌──────────┐
│  ├─ engineer/     工程实现者   │   架构 · 模式 · 经验教训 · 工具链         │  │          │
│  ├─ product/      产品负责人   │   PRD · 原型 · 用户研究 · 指标            │  │ 👤 人类  │
│  ├─ leader/       技术管理者   │   ADR · OKR · 风险 · 决策树              │  │  阅读者  │
│  ├─ sre/          站点可靠性   │   SLO · 监控 · 告警 · Runbook · 演练      │  │          │
│  ├─ aier/         AI 工程师    │   RAG · Agent · LLM 评估 · Prompt 库      │  └──────────┘
│  └─ executive/    管理层       │   战略 · 季度总结 · 预算 · 资源           │
│                                                                             │  ┌──────────┐
│  ── 项目知识 projects/ ─────────────────────────────────────────────         │  │ 🤖 AI    │
│     ├─ yiai/  FastAPI 后端  ├─ yivad/  Vue 管理后台  ├─ yipet/  扩展       │  │  RAG     │
│     ├─ yipot/ Tauri 桌面    └─ yiknowledge/ 自身                           │  │ 检索者  │
└─────────────────────────────────────────────────────────────────────────────┘  └──────────┘
```

### 2.1 7 角色目录边界与决策树

| 角色 | 核心职责 | 典型内容 | 判断归属 1 句话标准 |
|------|---------|---------|-------------------|
| **Curator** 知识治理者 | 规范制定 · 健康维护 · 模板 · Frontmatter 校验 | MEMORY · INDEX · 坏味道修复 · 命名规范 | "如何**组织**知识本身" → curator |
| **Engineer** 工程实现者 | 技术架构 · 编码实践 · 质量安全 · 工具链 | 设计模式 · 反模式 · 组件库 · 部署脚本 | 回答"**怎么干**（代码级）" → engineer |
| **Product** 产品负责人 | 需求来源 · 用户体验 · 指标与增长 | PRD 模板 · 用户画像 · 原型 · A/B 方案 | 回答"**做什么**（用户价值）" → product |
| **Leader** 技术管理者 | 技术决策 · OKR · 风险 · 组织协调 | ADR 决策记录 · 季度 OKR · 风险评估 | 回答"**为什么选 A 不选 B**" → leader |
| **SRE** 站点可靠性 | 可用性 · 监控 · 故障 · Runbook | SLO 设计 · 告警规则 · GameDay 演练 | "**线上不出事**" → sre |
| **AIer** AI 工程师 | RAG · Agent · LLM 选型 · Prompt | Embedding 评估 · Agent 模式 · Prompt 库 | 回答"**LLM / RAG 怎么用**" → aier |
| **Executive** 管理层 | 战略方向 · 季度复盘 · 资源 | 季度总结 · 路线图 · 预算 · 组织结构 | "**我们向哪走**（跨季度）" → executive |

---

## 3. Frontmatter 15 字段强制规范（全文档必填）

> 依据 project_memory 硬约束：**Frontmatter 必须包含 15 字段**。不满足 → Lint 失败 → PR 无法合入。

| # | 字段名 | 类型 | 含义 & 规则 | 示例 |
|---|--------|------|-----------|------|
| 1 | `title` | string | 文档标题（中文），首屏 H1 也使用此标题 | `YiAi RAG 引擎架构设计` |
| 2 | `tags` | string[] | 标签数组，kebab-case，3~10 个，用于快速索引 | `[yiai, rag, architecture, bm25]` |
| 3 | `category` | string | 逻辑分类路径：`<projects|engineer|...>/<sub>`，与目录对齐 | `projects/yiai/workflows` |
| 4 | `created` | YYYY-MM-DD | 创建日期，**首次写入后固定不变更** | `2026-10-09` |
| 5 | `updated` | YYYY-MM-DD | 最后更新日期，**每次编辑必须同步刷新** | `2026-10-09` |
| 6 | `source` | string | 知识来源：项目名 / 个人经验 / 外部文档 / 会议纪要 | `YiAi`, `个人经验`, `AWS re:Invent` |
| 7 | `type` | enum | 文档类型：`prd` · `dev` · `test` · `bug` · `adr` · `index` · `guide` · `spec` · `pattern` | `prd` |
| 8 | `status` | enum | 状态：`draft` · `review` · `stable` · `deprecated` · `archived` | `stable` |
| 9 | `lifecycle` | enum | 生命周期：`proposal` · `active` · `maintenance` · `eol` | `active` |
| 10 | `review_cycle` | string | 评审周期：`weekly` · `monthly` · `quarterly` · `yearly` | `monthly` |
| 11 | `roles` | string[] | 关联角色：7 角色子集，读者过滤用 | `[engineer, leader, aier]` |
| 12 | `benefit` | string | **必填收益说明**（1~2 句），RAG 检索返回时展示给 AI 和人 | `为 YiAi 新增熔断器模式，覆盖 3 场景，Ollama 故障时 500ms 内快速失败` |
| 13 | `acceptance_criteria` | string[] | 验收标准列表：3~8 条可验证条目，ADR/PRD 必写 | `- 5 个项目均列出分类说明和导航入口` |
| 14 | `related` | string[] | 关联文档相对路径数组，形成知识图谱链接 | `- ../INDEX.md\n- ../../MEMORY.md` |
| 15 | `aliases` | string[] | （可选但推荐）别名数组，便于搜索同义词跳转 | `[projects-index, 项目索引]` |

### ✅ 合规示例

```yaml
---
title: YiVad 菜单管理重构
tags: [yivad, menu, protable, refactor]
category: projects/yivad/devs
created: 2026-09-20
updated: 2026-10-08
source: YiVad
type: dev
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, leader]
benefit: "重构 YiVad 菜单管理为 row-key=key，与后端 RPC deleteMenu(key) 主键对齐，级联清理防止孤儿节点"
acceptance_criteria:
  - "ProTable row-key 统一为 key 而非 path"
  - "单删 / 批量删执行递归级联删除子节点"
  - "默认菜单一键恢复接口 POST /system/menus/bulk-reset 可用"
related:
  - ../yiai/workflows/开发规范/004-规范-数据库规范.md
  - ../../engineer/learn/lessons/
aliases: [menu-refactor, 菜单系统重构]
---
```

### ❌ 高频违规（Lint 必挂）

- [ ] 使用中文键名（如 `标题`、`标签`）→ **必须英文**
- [ ] 日期格式非 YYYY-MM-DD（如 `2026/10/9` · `Oct 9, 2026`）
- [ ] `benefit` 字段缺失（project_memory 强制）
- [ ] `tags` 中包含下划线（如 `menu_refactor`）→ 必须 kebab-case
- [ ] `category` 与文件物理目录不符
- [ ] `updated` 早于 `created`

---

## 4. ADR 架构决策记录 8 核心强制字段

> 依据 project_memory：**ADR 文档必须包含 8 项强制字段**，且文件名简写（如 `menu-adr.md`）需由 Curator 映射为正式三位编号文件名（如 `037-menu-row-key-adr.md`）。

| # | 强制字段 | 含义 | 填写要点 |
|---|---------|------|---------|
| 1 | **类别 (Category)** | 决策所属类别 | `架构 / 安全 / 数据 / 工具链 / 组织 / 合规` |
| 2 | **状态 (Status)** | 决策当前状态 | `Proposed · Accepted · Deprecated · Superseded-by-XXX` |
| 3 | **生命周期 (Lifecycle)** | 维护周期 | `proposal · active · maintenance · eol` |
| 4 | **评审周期 (Review Cycle)** | 重审周期 | `quarterly · half-year · yearly` |
| 5 | **角色 (Roles)** | 影响 & 负责角色 | 7 角色子集，至少含 decision-maker |
| 6 | **收益 (Benefit)** | 量化收益（可验证）| "减少 N% 请求超时 · 降低 M USD/月成本 · 缩短 X 天交付" |
| 7 | **验收标准 (Acceptance Criteria)** | 3~8 条可验证条目 | 每条必含动词 + 可测量结果 + 观测方式 |
| 8 | **关联记录 (Related)** | 关联 ADR / PRD / 经验教训 | 相对路径数组，至少 1 条（前序 ADR 或背景 PRD）|

---

## 5. STRIDE 威胁建模框架（知识库层面落地）

| 威胁类别 | 英文 | 知识库对应风险 | 治理措施 |
|---------|------|--------------|---------|
| **S** 仿冒 | **S**poofing | 作者冒充他人提交知识 · Frontmatter 伪造 created 日期 | Git 签名提交 + PR Review + created/updated diff 校验脚本 |
| **T** 篡改 | **T**ampering | 历史文档被恶意修改 · 关键 ADR 回退到错误版本 | Git 历史审计 · 关键 docs CODEOWNERS + 单独审批 |
| **R** 抵赖 | **R**epudiation | 提交有问题 PR 后否认作者身份 · 删除修改痕迹 | 强制 Signed-off · Git reflog 备份 · 合并日志归档 |
| **I** 信息泄露 | **I**nformation Disclosure | 密钥/密码/客户数据不小心入库 | pre-commit Gitleaks · Frontmatter `confidential` 标记分级 |
| **D** 拒绝服务 | **D**enial of Service | 超大文件填满仓库 · 恶意 PR 触发 RAG 全量重建 | 文件大小硬上限 5MB · `/rag-build` 手动触发 + 并发锁 |
| **E** 提权 | **E**levation of Privilege | Curator 权限被普通成员绕过 | GitHub/GitLab CODEOWNERS · 分支保护 rules · PR 需 N>=1 Approval |

> 各项目 bugs/ 目录下提供各自的 `STRIDE-{项目名}威胁模型.md` 专项模板。

---

## 6. RAG 数据源集成（AI 读者消费路径）

```
┌─────────────────────────────────────────────────────────────────────────┐
│  YiAi RAG 引擎消费 YiKnowledge 的完整链路                                 │
│                                                                         │
│  ① 文件系统轮询（60s）                                                   │
│     apscheduler（macOS FSEvents 损坏 → 轮询回退）                        │
│     domain/knowledge/watcher.py  扫描 ../YiKnowledge 树                 │
│     ├─ 解析每篇 15 字段 Frontmatter                                     │
│     ├─ frontmatter 变更 → 写 MongoDB `knowledge_files` 集合              │
│     └─ 内容正文变更 → 标记 dirty_bit                                     │
│                                                                         │
│  ② 手动 RAG 索引构建                                                     │
│     POST /rag-build  （！严禁启动时隐式构建 — 硬约束）                    │
│     domain/rag/kb_indexer.py  二级缓存：                                │
│       ├─ _FILE_READ_CACHE   已解析文件内容（防止重复 IO）                │
│       └─ _WALK_MEMO         已遍历目录树（防止高频 walk 开销）           │
│     ⚠️  **严禁使用 llama_index SimpleDirectoryReader**                   │
│         （零变化也触发昂贵插件分发 — 实测 I/O 10~100×）                  │
│                                                                         │
│  ③ 混合检索 Runtime                                                        │
│     用户提问 /rag/chat                                                   │
│         ├─ 默认 BM25（query_embed_enabled: false）  — 低资源模式        │
│         └─ 显式开启时走 Embedding + 向量检索                             │
│              ├─ RAG_EMBED_KILL_SWITCH 全局硬开关（默认 ON）              │
│              ├─ 仅 allow_embed_scope 手动路径临时开启                   │
│              ├─ 2 次 /api/embeddings 请求 ≥ 3000ms 节流（防灌爆队列）    │
│              └─ embed_cache.jsonl 全长度覆盖（取消 2000 字符门槛）       │
│                                                                         │
│  ④ RSS 剪枝（月份维度）                                                  │
│     rag.include_rss_current_month=true  时仅处理 rss/YYYY-MM/ 子目录    │
│     非当月归档目录不参与增量索引（节省 70% 构建时间）                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 目录结构（知识库自描述 + 5 项目知识）

```
YiKnowledge/
├── INDEX.md · README.md · MEMORY.md · QUICKREF.md · CLAUDE.md   # 顶层 5 文件
│
├── curator/ engineer/ product/ leader/ sre/ aier/ executive/    # 7 角色目录
│     └── 每个目录下: INDEX.md · README.md · learn/ · patterns/ · ...
│
├── projects/                # 5 大项目知识中心（本 README 所在上级）
│   ├── INDEX.md · README.md                                          # 总索引
│   │
│   ├── yiai/          # FastAPI 后端知识库
│   ├── yivad/         # Vue 3 管理后台知识库
│   ├── yipet/         # Chrome MV3 扩展知识库
│   ├── yipot/         # Tauri 桌面翻译知识库
│   └── yiknowledge/   # ⭐ 自身（知识库自描述）
│         ├── README.md                  # ⭐ 本文件
│         ├── prds/ · devs/ · tests/     # 3 交付阶段
│         ├── bugs/                      # STRIDE 威胁模型 + frontmatter/naming/sync 分类
│         └── workflows/                 # 4 类工作流
│             ├── 架构设计/ 6 篇   概览·项目摘要·目录·角色边界·RAG集成·规范索引
│             ├── 开发规范/ 6 篇   OpenSpec·文件约定·Frontmatter·治理·条目模式·条目创建
│             ├── 操作指南/ 4 篇   快速开始·知识生命周期·知识管理规范·RAG索引工作流
│             └── 流程规范/ 4 篇   分支管理·变更落地·变更状态·PRD→Proposal
│
├── skills/                  # 12 技能协作链（与 projects 文档深度集成）
├── rss/                     # RSS 聚合抓取（月份剪枝）
│     └── 2026-10/  （仅当月参与 RAG 增量）
└── books/                   # EPUB 书籍资源
```

---

## 8. 快速导航矩阵

### 8.1 日常使用场景

| 场景 | 第一步 | 第二步 | 关键约束 |
|------|-------|-------|---------|
| 新增一篇知识文档 | 按决策树判断 7 角色归属 + 5 阶段归属 | 复制 `curator/templates/*` 对应模板，填 15 字段 Frontmatter | 目录深度 ≤ 3 · 文件名 kebab-case |
| 不确定文档放哪 | 阅读角色边界 #决策树 | 优先放最匹配的角色目录，跨角色用 roles 字段标注 | 禁止放 misc/other/ 等模糊目录 |
| 编写 Frontmatter | 对照 §3 15 字段表逐项填写 | 运行 lint 脚本检查 | benefit 字段必填 · 无中文键 |
| 编写 ADR 决策 | 对照 §4 8 强制字段 | 向 leader/decisions/ 提 PR | 文件名 Curator 统一映射三位编号 |
| 运行就绪检查（提交前）| [知识管理规范 #就绪检查](./workflows/操作指南/003-指南-知识管理规范.md) | Checklist 全勾选 | 禁止跳过清单直接提交 |
| 查找过期内容 | 同上 #生命周期章节 | 按 status=draft/archived 过滤 + review_cycle 超期 | 超期 2×cycle 自动标 stale |
| 理解 RAG 为什么答不准 | [RAG 检索引擎集成](./workflows/架构设计/005-架构设计-RAG检索引擎集成.md) | 走 RAG 调试工作流 | 检查 dirty_bit · 索引版本 · embedding 缓存命中 |
| 管理知识生命周期 | [知识生命周期](./workflows/操作指南/002-指南-知识生命周期.md) | Draft→Review→Stable→Maintenance→EOL→Archived 六态流转 | 禁止直接 Stable 跳过 Review |
| 重新构建 RAG 索引 | `POST http://localhost:10086/rag-build` | 观察 progress 回调 + mongodb knowledge_files | 只能手动触发，不能脚本/定时自动构建 |

### 8.2 内容审查 6 项 Checklist

| # | 检查项 | 违规后果 | 参考 |
|---|--------|---------|------|
| 1 | 文件名 **kebab-case** · 无下划线 · 无数字过度补零（001 ✅, 0001 ❌）| Lint 挂 + 文件排序错乱 | [知识管理规范 #文件命名](./workflows/操作指南/003-指南-知识管理规范.md) |
| 2 | Frontmatter **15 字段齐全**（benefit 必含）| Lint 挂 + RAG 无法正确结构化 | [Frontmatter 模式](./workflows/开发规范/003-开发规范-Frontmatter模式.md) |
| 3 | 目录层级 **≤ 3 层**（role/domain/doc.md）| 读者迷路 · RAG chunk 上下文缺失 | [架构概览 #设计原则](./workflows/架构设计/001-架构设计-架构概览.md) |
| 4 | 归属**唯一正确角色目录**，跨角色用 roles 字段标 | 知识孤岛 · Curator 找不到 | [角色边界 #决策树](./workflows/架构设计/004-架构设计-角色边界.md) |
| 5 | 正文遵循 **Summary → Core Viewpoints → Key Information** 三段式 | RAG 召回要点缺失 · 读者抓不住重点 | [知识条目模式](./workflows/开发规范/005-开发规范-知识条目模式.md) |
| 6 | 代码示例 ≤ 5 行 · 标注语言类型（```py）| 纯知识库变代码库 · 索引膨胀 | 同上 |

---

## 9. 关键约束速查（Hard Constraints）

### ✅ 必须遵守

1. **15 字段 Frontmatter 全覆盖**：所有 `.md` 文档 YAML 头必含 title/tags/category/created/updated/source/type/status/lifecycle/review_cycle/roles/benefit/acceptance_criteria/related（aliases 推荐）
2. **目录深度 ≤ 3**：`角色/问题域/文档.md`，严禁更深层嵌套
3. **命名规范**：文件/目录名统一 kebab-case，禁止下划线；项目编号统一三位数字（001, 002, ...），禁止 0001 或 yivad-yivad-003 重复前缀
4. **角色归属唯一**：一篇物理文档只放一个目录；多角色覆盖用 Frontmatter `roles: [a, b]` 字段，不复制多份
5. **正文三段式**：Summary（摘要 3~5 句）→ Core Viewpoints（核心观点分点）→ Key Information（关键信息表格/清单）
6. **代码示例限制**：纯知识库文档内代码片段 ≤ 5 行，必附语言类型（```ts）
7. **STRIDE 全覆盖**：项目 ≥ 50 PRD 级必须有 `bugs/*/STRIDE-{项目}威胁模型.md`
8. **ADR 8 字段强约束**：类别/状态/生命周期/评审周期/角色/收益/验收标准/关联记录
9. **RAG 构建手动触发**：`POST /rag-build` 必须用户手动；禁止启动时隐式建索引
10. **RSS 月份剪枝**：`rag.include_rss_current_month=true` 时仅处理 rss/YYYY-MM/ 当月目录
11. **死链定期修复**：月度 Curator 健康看板跑 `check-dead-links` 脚本（跳过 rss/ · projects/*/prds/ · projects/*/devs/）

### ❌ 严格禁止

1. 文件名含下划线（如 `menu_refactor.md`）→ 必 kebab-case
2. 目录深度 > 3（如 `engineer/arch/backend/rag/something.md`）→ 拆分或扁平化
3. Frontmatter 使用中文 key（如 `标题` / `创建时间`）
4. 代码示例 > 5 行嵌入知识库（→ 创建 `src/` 代码示例项目，知识库仅引用链接）
5. 创建 `misc/` · `other/` · `temp/` · `junk/` 等模糊分类目录
6. 同一物理文档复制多份到多个角色目录（→ 用 roles 字段标注关联）
7. 跳过就绪检查直接合入 PR
8. 将一次性调试脚本（check_*, debug_*, scratch_*, play_*, tmp_*）提交入库（.gitignore 已拦截）
9. 知识库维护任务（序号优化/死链修复）触碰 `rss/` · `projects/*/prds/` · `projects/*/devs/` 三个目录

---

## 10. 技术与工具链速查表

| 分类 | 工具 / 规范 | 版本 / 规则 | 用途 |
|------|------------|------------|------|
| **存储格式** | Markdown + YAML Frontmatter | CM · YAML 1.2 | 知识内容 + 结构化元数据 |
| **文件命名** | kebab-case 规范 | `^[a-z0-9-]+(\.md)?$` | 可预测 URL · 跨平台兼容 |
| **版本控制** | Git | 2.40+ | 历史回溯 · 变更审计 · Signed-off-by |
| **静态校验** | markdownlint + 自研 frontmatter-lint | latest | Frontmatter 合规 · 标题层级 · 死链 |
| **扫描器（后端）** | apscheduler + Python AST | 60s 轮询 | 文件变更检测 · Frontmatter 解析 · dirty_bit |
| **RAG 框架** | llama_index（YiAi）| ≥ 0.13.0 | QueryFusionRetriever · BM25 + 向量混合 |
| **向量 / Embedding** | Ollama nomic-embed-text | 1.5+ | 1536 维 · 本地推理 · 无外部 API |
| **RAG 元数据存储** | MongoDB Motor | 6+ | knowledge_files 集合 · 15 字段索引 |
| **Embedding 缓存** | JSONL 文件行存储 | 无门槛 | rag_persist_dir/embed_cache.jsonl |
| **知识治理看板** | 月度健康报表（Curator）| monthly | 坏味道 Top10 · 过期文档 · 覆盖盲区 |
| **威胁建模** | STRIDE 模型 | 6 维全覆盖 | 6 类风险识别 + 治理措施映射 |
| **新人体系** | 5 天上手路线图（§0）| standard | 统一入职路径 · Checklist 可量化验收 |

---

## 11. 相关资源索引

### 11.1 顶层导航（必熟）
- [YiKnowledge/README.md](../../README.md) — 知识库总 README：软件交付流水线架构 · 角色决策树
- [YiKnowledge/INDEX.md](../../INDEX.md) — 全库文件索引（7 角色 × 阶段矩阵）
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册（命名 · Frontmatter · 治理禁令）
- [YiKnowledge/CLAUDE.md](../../CLAUDE.md) — 角色边界 · 文件约定 · Curator 工作流
- [YiKnowledge/QUICKREF.md](../../QUICKREF.md) — 速查卡（Frontmatter 字段 · ADR 字段 · 命名速记）

### 11.2 项目知识（5 项目）
- [projects/README.md](../README.md) — 项目知识中心总览 · OKR→PRD→Dev→Test 追溯模型
- [projects/INDEX.md](../INDEX.md) — 5 项目 × 6 分类完整文件清单（2,450+）
- [YiAi](../yiai/README.md) · [YiVad](../yivad/README.md) · [YiPet](../yipet/README.md) · [YiPot](../yipot/README.md)

### 11.3 工程角色参考
- [curator/README.md](../../curator/README.md) — 知识治理者：模板 · 健康看板 · Frontmatter Lint
- [engineer/README.md](../../engineer/README.md) — 工程实现：架构模式 · 反模式 · 经验教训
- [leader/decisions/](../../leader/decisions/) — ADR 架构决策记录集合（8 强制字段）
- [sre/README.md](../../sre/README.md) — SRE：Runbook · SLO · GameDay
- [aier/README.md](../../aier/README.md) — AI 赋能：RAG 模式 · Agent · Prompt 库
- [skills/README.md](../../skills/README.md) — 12 技能协作链（与 projects/ 文档深度集成）

---

## 12. 变更历史

| 日期 | 变更摘要 |
|------|---------|
| 2026-10-09 | **README 专业化重构**：新增 5 天入职路线图 · 7 角色 × 5 阶段架构图 · Frontmatter 15 字段逐项详解（含示例 + 违规清单）· ADR 8 强制字段 · STRIDE 6 维威胁落地 · RAG 引擎 AI 消费路径完整图解（二级缓存 · SimpleDirectoryReader 禁令 · 3000ms 节流 · RSS 剪枝）· 角色边界决策表 · 内容审查 Checklist · Hard Constraints 11 必/9 禁 · 工具链 12 项速查 |
| 2026-09-20 | 架构设计 / 开发规范 / 操作指南 / 流程规范 4 大类 20 篇规范文档标准化 |
| 2026-08-25 | 初版创建：基础索引 + 快速导航 |
