---
title: "96: 广告内容清理与代码专业性提升"
tags: [需求文档, 代码健康, 合规清理, 多项目]
category: 项目/管理后台/需求
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: 需求
status: 已完成
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-96
estimate_frontend: 0.05
review_status: 已评审
issue_type: 合规
roles: [engineer]
source_okr: [yivad-003]
related_modules: ["YV-09-96-1"]
related_tests: ["YV-09-96"]
benefit: "产品需求：广告内容清理与代码专业性提升"
lifecycle: active
---

# 96: 广告内容清理与代码专业性提升

> 需求编号：YV-09-96 · 总人天：~0.05d · 涉及项目：YiVad、YiAi、YiKnowledge

## 1. 背景

代码审查中发现代码库和文档中存在第三方商业产品推广内容，包括：

- **RSS 种子数据**中含有商业 AI 公司的博客订阅源，作为默认种子推送给所有用户
- **技术 PRD 文档**中引用特定商业产品的定价页面作为参考链接
- **工作流规范**中硬编码第三方产品签名和推广页脚

这些内容与项目功能无关。作为专业软件项目，代码和文档应保持厂商中立，不隐含对特定商业产品的背书。

## 2. 现状与目标

### 改造前

| 位置 | 问题 |
|------|------|
| `rssSeedData.ts` | 包含 Anthropic Blog、OpenAI Blog 两个商业 AI 公司的 RSS 种子 |
| `201-需求-成本优化引擎.md` | 相关文档引用 OpenAI/Anthropic 定价页面 |
| `03-运行-Git工作流.md` | PR 模板示例含第三方推广页脚 |
| `01-流程-分支管理规范.md` | 提交规范要求 Co-Authored-By 第三方签名 |

### 改造后

| 位置 | 状态 |
|------|------|
| `rssSeedData.ts` | 仅保留技术社区、学术机构、行业媒体的 RSS 源 |
| `201-需求-成本优化引擎.md` | 相关文档仅引用内部 PRD，不含外部商业链接 |
| `03-运行-Git工作流.md` | PR 模板示例为通用格式，无推广内容 |
| `01-流程-分支管理规范.md` | 提交规范仅要求 Conventional Commits 格式 |

### 能力边界

- **范围内**：移除直接推广性质的商业产品引用（博客订阅、定价链接、产品签名）
- **范围外**：竞品分析文档中的行业引用、技术参考中的开源项目地址、正常的工具链依赖声明

## 3. 需求范围

### 范围内

| FR | 描述 | 涉及文件 |
|----|------|---------|
| FR-01 | 移除 RSS 种子数据中的商业 AI 公司博客源 | `YiVad/src/views/knowledge/executive/data/rssSeedData.ts` |
| FR-02 | 移除 PRD 文档中的外部产品定价链接 | `YiKnowledge/projects/yiai/prds/2026-09/201-需求-成本优化引擎.md` |
| FR-03 | 移除工作流文档中的推广性页脚示例 | `YiKnowledge/engineer/run/03-运行-Git工作流.md` |
| FR-04 | 移除提交规范中的第三方签名要求 | `YiKnowledge/projects/yiknowledge/workflows/流程规范/01-流程-分支管理规范.md` |
| FR-05 | 全库 grep 验证零残留 | 全部 `*.ts`、`*.md`、`*.vue` 文件 |

### 范围外

- 竞品分析文档（`executive/industry/`）中的正常行业引用
- 开源项目地址（如 GitHub、PyPI）
- MCP 协议等技术标准文档中的协议名称引用
- 工具链依赖声明（`package.json`、`requirements.txt`）

## 4. 功能需求

### FR-01: RSS 种子数据清理

**当前状态**: `EXAMPLE_SEEDS` 数组包含 45 个种子源，其中 2 个为商业 AI 公司博客。

**清理策略**: 保留技术社区、学术机构、行业媒体的 RSS 源；移除单一商业公司产品博客。

| 移除条目 | 原因 |
|---------|------|
| `seed_example_anthropic` — Anthropic Blog | 单一商业公司产品博客 |
| `seed_example_openai` — OpenAI Blog | 单一商业公司产品博客 |

**保留条目示例**（同类目 `aier/foundations` 下）:
- Google DeepMind — 研究机构博客
- arXiv cs.AI — 学术论文预印本
- Ollama — 开源项目博客
- PyTorch Blog — 开源框架博客

### FR-02: PRD 外部链接清理

移除 `201-需求-成本优化引擎.md` 相关文档节中的 OpenAI Pricing 和 Anthropic Pricing 外部链接。成本优化引擎的技术架构不依赖特定厂商的定价模型。

### FR-03: PR 模板示例清理

移除 `03-运行-Git工作流.md` 中 `gh pr create` 示例的推广性页脚行，保持示例代码为通用格式。

### FR-04: 提交规范清理

将 `01-流程-分支管理规范.md` 中的签名要求替换为 Conventional Commits 格式说明。该文件本身已有完整的 Conventional Commits 类型表格，无需额外补充。

## 5. 领域模型

本需求不涉及数据模型变更，仅涉及静态资源（RSS 种子数据）和文档内容的清理。

### RSS 种子数据模型

```typescript
interface ExampleRssSeed {
  key: string;       // 稳定标识，幂等落盘
  url: string;       // RSS/Atom feed 地址
  name: string;      // 展示名称
  category: string;  // YiKnowledge 角色分类路径
  enabled: boolean;  // 默认启用状态
}
```

**变更**: 从 `EXAMPLE_SEEDS` 数组中移除 2 个条目，不影响接口定义。

## 6. 非功能需求

### 安全

- 移除的外部链接不涉及安全漏洞，属于内容合规清理
- RSS 种子数据落盘逻辑不变，仅在 `seeds` 集合为空且未初始化时写入一次

### 性能

- 无性能影响。RSS 种子数组减少 2 个条目，内存占用可忽略

### 可观测性

- 变更后通过 `grep` 命令可验证清理完整性
- 测试文档中的 grep 命令即为持续验证手段

## 7. 设计决策

| 选项 | 描述 | 选择 | 理由 |
|------|------|------|------|
| A: 仅移除特定厂商条目 | 只删除被标记的条目 | ✗ | 不一致，留下同类问题 |
| B: 移除所有商业公司博客 | 删除所有单一商业公司的产品博客 | ✓ | 原则一致，标准清晰 |
| C: 移除所有外部 RSS 源 | 清空整个种子列表 | ✗ | 过度清理，失去 RSS 功能的初始价值 |

**选择 B 的理由**: 建立清晰的种子源筛选标准——保留技术社区、学术机构、开源项目和行业媒体；移除单一商业公司的产品推广博客。

## 8. 验收标准

| AC | 描述 | 验证方法 | 状态 |
|----|------|---------|------|
| AC-01 | RSS 种子数据中无商业 AI 公司博客 | 检查 `EXAMPLE_SEEDS` 数组 | ✅ |
| AC-02 | 成本优化 PRD 相关文档节仅含内部引用 | 检查 `201-需求-成本优化引擎.md` | ✅ |
| AC-03 | PR 模板示例不含推广性页脚 | 检查 `03-运行-Git工作流.md` | ✅ |
| AC-04 | 提交规范不含第三方签名要求 | 检查 `01-流程-分支管理规范.md` | ✅ |
| AC-05 | 全库 `anthropic.com` 零残留 | `grep -r "anthropic\.com"` | ✅ |
| AC-06 | 全库 `Co-Authored-By.*Claude` 零残留 | `grep -r "Co-Authored-By"` | ✅ |
| AC-07 | 全库 `Generated with.*Claude` 零残留 | `grep -r "Generated with.*Claude"` | ✅ |

## 9. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 其他文件中存在未发现的推广内容 | 低 | 低 | grep 全库扫描已覆盖主要模式 |
| RSS 种子减少影响用户订阅选择 | 低 | 低 | 移除的是商业博客，用户仍可手动添加 |
| 未来新增内容再次引入推广内容 | 中 | 低 | 已记录为反馈记忆，后续自动避免 |

## 10. 后续演进

- 可在 CLAUDE.md 或开发规范中增加「禁止推广内容」条目
- RSS 种子数据可考虑从静态列表迁移为配置文件，便于审核

## 11. 关联需求

| 类型 | ID | 标题 |
|------|----|------|
| Dev | YV-09-96-1 | 广告内容清理与代码专业性提升 — 开发方案 |
| Test | YV-09-96 | 广告内容清理与代码专业性提升 — 测试用例 |
| Memory | — | `no_advertising.md` — 禁止推广内容的反馈记忆 |