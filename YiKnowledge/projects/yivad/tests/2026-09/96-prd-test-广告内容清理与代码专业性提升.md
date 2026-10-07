---
prd_task_id: "YV-09-96"
title: "广告内容清理与代码专业性提升 — 测试用例"
status: 已完成
priority: 中
owner: Chengliang.Yi
source_prds: ["96-prd-广告内容清理与代码专业性提升"]
source_modules: ["YV-09-96-1"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 代码健康, 合规清理]
category: 项目/管理后台/测试
roles: [engineer]
source: YiVad
benefit: "测试用例：广告内容清理与代码专业性提升"
lifecycle: active
---

# 广告内容清理与代码专业性提升 — 测试用例

## 测试策略

纯内容清理，采用 grep 模式匹配验证。不涉及运行时行为变更，无需浏览器/API 测试。

## 测试用例

### 全库扫描

| # | 验证项 | 命令 | 预期 | 结果 |
|---|--------|------|------|------|
| TC-01 | 无 `anthropic.com` 残留 | `grep -r "anthropic\.com" --include="*.ts" --include="*.md" --include="*.vue" YiVad/ YiAi/ YiKnowledge/ YiPet/` | 零匹配 | ✅ |
| TC-02 | 无 `Co-Authored-By.*Claude` 残留 | `grep -r "Co-Authored-By" --include="*.md" YiKnowledge/` | 零匹配 | ✅ |
| TC-03 | 无 `Generated with.*Claude` 残留 | `grep -r "Generated with.*Claude" YiKnowledge/` | 零匹配 | ✅ |
| TC-04 | 无 `noreply@anthropic` 残留 | `grep -r "noreply@anthropic" YiKnowledge/` | 零匹配 | ✅ |

### 文件级验证

| # | 验证项 | 方法 | 预期 | 结果 |
|---|--------|------|------|------|
| TC-05 | RSS 种子无 Anthropic Blog | 检查 `rssSeedData.ts` `EXAMPLE_SEEDS` 数组 | 无 `anthropic` 相关条目 | ✅ |
| TC-06 | RSS 种子无 OpenAI Blog | 检查 `rssSeedData.ts` `EXAMPLE_SEEDS` 数组 | 无 `openai` 相关条目 | ✅ |
| TC-07 | 成本优化 PRD 无外部定价链接 | 检查 `201-需求-成本优化引擎.md` 相关文档节 | 仅含内部 PRD 引用 | ✅ |
| TC-08 | Git 工作流 PR 示例无推广页脚 | 检查 `007-运行-Git工作流.md` 行 200-202 | 示例代码不含推广行 | ✅ |
| TC-09 | 分支管理规范无第三方签名 | 检查 `01-流程-分支管理规范.md` 行 272 | 仅 Conventional Commits 格式说明 | ✅ |
| TC-10 | TypeScript 编译通过 | `cd YiVad && pnpm type:check` | 无新增错误 | ✅ |

## 回归检查

| # | 检查项 | 结果 |
|---|--------|------|
| RG-01 | RSS Manager 页面种子初始化功能正常 | ✅ 不影响落盘逻辑 |
| RG-02 | YiVad 构建通过 | ✅ |
| RG-03 | 所有 `.md` 文件 frontmatter 完整 | ✅ |