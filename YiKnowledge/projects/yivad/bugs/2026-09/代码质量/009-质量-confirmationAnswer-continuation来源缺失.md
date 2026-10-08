---
title: "code-quality: confirmationAnswer 和 continuation 源码模块缺失"
tags: [yivad, bug, code-quality, test]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: closed
severity: minor
priority: p2
project: YiVad
module: src/utils/confirmationAnswer.ts, src/utils/continuation.ts
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
benefit: "缺陷记录：质量-confirmationAnswer-continuation来源缺失"
lifecycle: active
---

# code-quality: confirmationAnswer 和 continuation 源码模块缺失

## 现象

`pnpm test` 中 2 个测试文件加载失败：
```
FAIL  tests/utils/confirmationAnswer.test.ts
Error: Failed to resolve import "@/utils/confirmationAnswer"

FAIL  tests/utils/continuation.test.ts
Error: Failed to resolve import "@/utils/continuation"
```

## 复现步骤

1. 运行 `cd YiVad && pnpm test`
2. 观察 2 个 utils 测试文件加载失败

## 预期行为

所有测试文件应能正常加载执行

## 实际行为

`tests/utils/confirmationAnswer.test.ts` 和 `tests/utils/continuation.test.ts` 引用的源模块不存在，导致 Vitest 在模块解析阶段失败

## 根因分析

两个测试文件在 2026-08 测试基础设施需求中预创建，但对应的源模块（`src/utils/confirmationAnswer.ts`、`src/utils/continuation.ts`）从未实现。需求文档（`YiKnowledge/projects/yivad/requirements/2026-08/04-测试基础设施.md`）第 842 行明确记录了此问题。

## 修复方案

根据测试用例的预期行为实现两个源模块：

**`src/utils/confirmationAnswer.ts`** — `confirmationAnswerFor(text)` 判断用户输入是否为确认/拒绝回答：
- 中英文裸词匹配（如 `"yes"` → approve, `"不"` → reject）
- 前缀匹配（如 `"好的，请执行"` → approve, `"不要删除"` → reject）
- 歧义词排除（`"now"`, `"not"`）
- 非回答文本返回 `null`

**`src/utils/continuation.ts`** — `isContinuationMessage(text)` 判断用户输入是否为继续消息：
- 中英文裸词匹配（`"继续"`, `"continue"`, `"go on"` 等）
- 前缀匹配（`"继续完成剩余任务"` 等）
- 空/空白返回 `false`

## 影响范围

- **影响模块**：src/utils/（新增 2 个文件）
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否

## 验证方法

- [x] `pnpm test -- tests/utils/confirmationAnswer.test.ts` 通过（30 个测试）
- [x] `pnpm test -- tests/utils/continuation.test.ts` 通过（17 个测试）
- [x] `pnpm test` 全部通过（17 个文件，156 个测试）
- [x] `vue-tsc --noEmit` 通过

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 预存测试文件应在同一 PR 中包含源模块实现 |
| 测试 | CI 中 `pnpm test` 应确保所有测试文件可加载 |
| 流程 | 需求拆分为可独立交付的增量，避免测试文件积压 |

## 相关资源

- 需求文档：YiKnowledge/projects/yivad/requirements/2026-08/04-测试基础设施.md

## 经验教训

- **测试文件不应先于源模块提交**：2 个测试文件在 8 月预创建，但对应源模块直到 9 月才实现。这期间 CI 中测试加载失败（`Failed to resolve import`），但这些失败被标记为已知问题而忽略，降低了 CI 的信任度
- **需求拆分的粒度**：「创建测试文件」和「实现源模块」应该是同一个交付增量，分属两个月的迭代导致中间态持续数周。TDD 的前提是测试和实现同步交付

