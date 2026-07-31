# 知识分类目录

知识管理体系位于 `~/YiKnowledge`。全库导航见 [INDEX.md](./INDEX.md)，一级分类概览见 [README.md](./README.md)。

目录结构如下：

```
├── INDEX.md           # 全库人类可读 TOC
├── README.md          # 一级分类导航
├── MEMORY.md          # 本文件：归档规则与命名规范
├── projects/          # 项目业务 + 工程文档
│   └── {project}/
│       ├── stories/       # Story/Scene 业务内容（BRD 驱动）
│       └── engineering/   # CLAUDE/README/CHANGELOG 镜像
├── industry/          # 行业知识
│   ├── competitors/   # 竞争对手信息
│   ├── market-trends/ # 市场趋势
│   ├── reports/       # 行业报告
│   └── use-cases/     # 使用案例
├── lessons/           # 经验教训
│   ├── failures/      # 失败案例
│   ├── gotchas/       # 陷阱/注意事项
│   └── wins/          # 成功案例
├── methodology/       # 方法论
│   ├── ai-specific/   # AI 相关方法论
│   ├── pm-frameworks/ # 产品管理框架
│   └── thinking/      # 思维模型
├── people/            # 人脉/人员
│   ├── experts/       # 专家
│   ├── stakeholders/  # 利益相关者
│   └── team/          # 团队成员
├── product/           # 产品知识
│   ├── metrics/       # 产品指标
│   ├── prd/           # 产品需求文档
│   ├── strategy/      # 产品战略
│   └── ux/            # 用户体验
├── resources/         # 资源
│   ├── prompts/       # 提示词
│   ├── reading-list/  # 阅读清单
│   └── templates/     # 模板
├── tech/              # 技术知识
│   ├── ai-foundations/# AI 基础
│   ├── ai-platform/   # AI 平台
│   ├── data/          # 数据
│   └── infra/         # 基础设施
└── work/              # 工作相关
    ├── collaboration/ # 协作
    ├── meetings/      # 会议
    ├── processes/     # 流程
    └── tools/         # 工具
```

## projects/ 结构说明

每个项目下并存两类内容：

- **`stories/`**：业务需求内容（Story/Scene + BRD 章节），元数据由数据库管理，富文本内容由文件存。详见 [projects/README.md](./projects/README.md)。
- **`engineering/`**：项目根目录 `CLAUDE.md` / `README.md` / `CHANGELOG.md` 的镜像拷贝，便于在 YiKnowledge 内集中查阅。修改原项目根文件后需手动 `cp` 同步到本目录。

## 命名规范

- **路径**：所有文件名采用 ASCII 英文 kebab-case（`lower-case-with-dashes.md`）
- **中文语义**：保留在 frontmatter `title:` 字段，不进入文件名
- **原文文件**：`{topic}-original.md`
- **摘要文件**：`{topic}-summary.md`
- **模板文件**：`{topic}-template.md`
- **提示词文件**：`{topic}-prompt.md`

## 归档规则

### 双份归档原则

后续收到主人发送的知识内容时，应**一式两份**归档：

1. **原文**：保存原始内容（网页用 web_fetch 抓取 markdown，文件直接复制），存于对应分类目录下
2. **摘要**：提炼核心观点、关键信息、行动建议，存于同一目录下
   - 摘要开头必须注明**原内容出处**（链接或文件路径）
   - 摘要应包含：核心观点、关键信息、标签/分类、归档日期

### 归档流程

1. 判断内容主题，确定目标分类目录
2. 保存原文 → `YiKnowledge/{category}/{topic}-original.md`
3. 编写摘要 → `YiKnowledge/{category}/{topic}-summary.md`
4. 摘要中留存出处链接/路径

### 命名规范

- 路径：ASCII 英文 kebab-case（详见上文「命名规范」）
- 原文文件：`{topic}-original.md` 或 `{topic}.md`（保持原标题）
- 摘要文件：`{topic}-summary.md`
- 或单文件结构：`{topic}.md`（内含原文 + 摘要两个章节）

### YAML 元数据规范

**所有摘要文件必须在开头添加 YAML Frontmatter**：

```yaml
---
title: 文件标题（可含中文）
tags: [标签 1, 标签 2, 标签 3]
category: 分类路径（如 tech/ai-platform）
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: 原文链接或文件路径
type: summary
status: draft | stable | deprecated      # 可选，默认 stable
author: 作者标识                          # 可选
last_verified: YYYY-MM-DD                 # 可选，外部内容最近核实日期
---
```

**必填字段**：`title`, `tags`, `category`, `created`, `source`, `type`
**推荐字段**：`updated`, `status`, `last_verified`（外部内容必填）

### 渐进式读取策略

检索知识库时采用**渐进式读取**，避免不必要的全文读取：

1. **第一步：读元数据** — 用 `read limit=15` 只读前 15 行（获取完整 Frontmatter）
2. **第二步：判断相关性** — 根据 `tags`, `category`, `title` 判断是否相关
3. **第三步：获取全文** — 仅当确认相关时才读取完整文件

**示例命令**：
```bash
# 只读前 15 行获取元数据
head -15 file.md

# 用 grep 快速筛选
rg "^tags:.*关键词" ~/YiKnowledge -l
rg "^category: tech/ai" ~/YiKnowledge -l
```

**OpenClaw 工具用法**：
```yaml
# 第一步：只读元数据
read path="~/YiKnowledge/tech/ai-platform/xxx.md" limit=15

# 第二步：确认相关后读全文
read path="~/YiKnowledge/tech/ai-platform/xxx.md"
```
