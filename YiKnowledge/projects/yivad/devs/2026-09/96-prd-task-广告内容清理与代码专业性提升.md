---
prd_task_id: "YV-09-96"
title: "YV-09-96: 广告内容清理与代码专业性提升 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
created: 2026-09-23
updated: 2026-09-23
project: YiVad
source_prd: "96-prd-广告内容清理与代码专业性提升.md"
source_okr: [yivad-003]
related_tests: ["YV-09-96"]
tags: [开发方案, 代码健康, 合规清理]
type: task
category: 项目/管理后台/开发
source: YiVad
roles: [engineer]
benefit: "开发方案：task-广告内容清理与代码专业性提升"
lifecycle: active
---

# YV-09-96: 广告内容清理与代码专业性提升

> PRD: [96-prd-广告内容清理与代码专业性提升](../prds/2026-09/96-prd-广告内容清理与代码专业性提升.md)

## 1. 方案概述

跨 3 个项目的代码和文档合规清理，移除第三方商业产品推广内容。变更类型为纯删除/替换，不涉及功能逻辑修改。

### 架构定位

```
YiVad (rssSeedData.ts)     YiAi (cost PRD)       YiKnowledge (workflow docs)
     │                           │                        │
     ├─ 移除 2 个 RSS 种子        ├─ 移除 2 个外部链接       ├─ 清理 PR 模板示例
     │                           │                        └─ 替换签名规范
     ▼                           ▼                        ▼
  静态数据清理               文档引用清理                文档内容清理
```

## 2. 文件清单

| # | 文件 | 项目 | 操作 | 说明 |
|---|------|------|------|------|
| 1 | `YiVad/src/views/knowledge/executive/data/rssSeedData.ts` | YiVad | 删除 2 条目 | 移除 `seed_example_anthropic`、`seed_example_openai` |
| 2 | `YiKnowledge/projects/yiai/prds/2026-09/201-需求-成本优化引擎.md` | YiAi | 删除 2 行 | 移除 OpenAI/Anthropic Pricing 链接 |
| 3 | `YiKnowledge/engineer/run/03-运行-Git工作流.md` | YiKnowledge | 删除 1 行 | 移除 PR 示例中的推广页脚 |
| 4 | `YiKnowledge/projects/yiknowledge/workflows/流程规范/01-流程-分支管理规范.md` | YiKnowledge | 替换 1 行 | 替换 Co-Authored-By 签名为通用表述 |

## 3. 模块设计

### 3.1 RSS 种子数据清理

**文件**: `YiVad/src/views/knowledge/executive/data/rssSeedData.ts`

移除 `EXAMPLE_SEEDS` 数组中 2 个商业 AI 公司博客条目：

```diff
-  {
-    key: "seed_example_anthropic",
-    url: "https://www.anthropic.com/blog/feed",
-    name: "Anthropic Blog",
-    category: "aier/methodology",
-    enabled: true
-  },
   // ── aier/foundations ──
-  {
-    key: "seed_example_openai",
-    url: "https://openai.com/blog/rss.xml",
-    name: "OpenAI Blog",
-    category: "aier/foundations",
-    enabled: true
-  },
```

清理后 `aier/foundations` 分类保留：Google DeepMind（研究机构）、arXiv cs.AI（学术论文）、Ollama（开源项目）、PyTorch Blog（开源框架）、Google AI（研究机构）。

### 3.2 PRD 外部链接清理

**文件**: `YiKnowledge/projects/yiai/prds/2026-09/201-需求-成本优化引擎.md`

```diff
  ## 相关文档

  - [YA-09-05 审计日志](05-需求-审计日志.md)
  - [YA-09-09 上下文压缩服务](09-需求-上下文压缩服务.md)
- - [OpenAI Pricing](https://openai.com/api/pricing/)
- - [Anthropic Pricing](https://www.anthropic.com/pricing)
```

### 3.3 PR 模板示例清理

**文件**: `YiKnowledge/engineer/run/03-运行-Git工作流.md`

```diff
  ## Test plan
  - [ ] 仪表盘在 3 种项目中正确展示数据
  - [ ] 无项目时显示空状态引导
  - [ ] 图表在不同窗口尺寸正常渲染
-
- 🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
```

### 3.4 提交规范清理

**文件**: `YiKnowledge/projects/yiknowledge/workflows/流程规范/01-流程-分支管理规范.md`

```diff
- 所有提交使用 `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` 签名。
+ 所有提交使用 Conventional Commits 格式，不添加额外签名。
```

## 4. 接口与数据契约

本需求不涉及 API 接口变更。

RSS 种子数据类型 `ExampleRssSeed` 不变，仅减少 `EXAMPLE_SEEDS` 数组元素数量。种子落盘逻辑（`rssManager.vue` 的 `loadSeeds` / `SEEDS_SEEDED_KEY`）不受影响。

## 5. 关键流程

```
1. 识别推广内容
   ├── grep "anthropic\.com|Co-Authored-By|Generated with"
   └── 人工审查匹配结果

2. 执行清理
   ├── rssSeedData.ts: 删除条目
   ├── 201-需求-成本优化引擎.md: 删除引用行
   ├── 03-运行-Git工作流.md: 删除推广行
   └── 01-流程-分支管理规范.md: 替换为通用表述

3. 验证
   ├── grep 全库确认零残留
   ├── TypeScript 编译通过
   └── 文档 frontmatter 完整
```

## 6. 实施步骤与验证

| 步骤 | 操作 | 验证 | 人天 |
|------|------|------|------|
| 1 | 清理 rssSeedData.ts | `grep "anthropic\|openai" rssSeedData.ts` 仅注释匹配 | 0.01 |
| 2 | 清理 201-需求-成本优化引擎.md | `grep "Pricing" 201-需求-成本优化引擎.md` 零匹配 | 0.01 |
| 3 | 清理 03-运行-Git工作流.md | `grep "Generated with" 03-运行-Git工作流.md` 零匹配 | 0.01 |
| 4 | 清理 01-流程-分支管理规范.md | `grep "Co-Authored-By" 01-流程-分支管理规范.md` 零匹配 | 0.01 |
| 5 | 全库验证 | 7 条测试用例全部通过 | 0.01 |

## 7. 边缘场景处理

| 场景 | 处理方式 |
|------|---------|
| RSS 种子已被用户删除后重新初始化 | 新种子列表不含商业博客，用户不受影响 |
| 成本优化 PRD 被其他文档交叉引用 | 已检查，无其他文件引用被删除的定价链接 |
| 其他文件中存在类似推广内容 | grep 全库扫描已覆盖，零残留 |
| 未来 git revert 可能恢复推广内容 | 反馈记忆 `no_advertising.md` 确保后续不再引入 |

## 8. 已知缺陷与改进项

无。本次变更为纯内容清理，不引入功能变更。

## 9. 风险与回滚

| 风险 | 级别 | 回滚方式 |
|------|------|---------|
| 误删有用的 RSS 源 | 低 | `git revert`，用户也可手动添加该 RSS 源 |
| 其他文件引用被删链接 | 低 | 已确认无交叉引用 |

## 10. 完成定义 (DoD)

- [x] 4 个文件全部清理完成
- [x] 全库 grep 零残留（7 个广告模式）
- [x] YiKnowledge 文档（PRD + Dev + Test）已补充
- [x] 3 个 README 索引已更新
- [x] `projects/INDEX.md` 文件计数已更新
- [x] 反馈记忆 `no_advertising.md` 已保存