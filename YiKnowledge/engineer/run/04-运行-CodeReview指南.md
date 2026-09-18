---
title: "Code Review Guide"
aliases: [code-review, review-checklist, pr-review, peer-review]
tags: [code-review, review, quality, collaboration, process]
category: engineer/run
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Consistent, effective code reviews that catch real issues without slowing down delivery"
acceptance_criteria:
  - "Review checklist per language/framework"
  - "RPC contract verification steps"
  - "Review etiquette and turnaround expectations"
related:
  - ../build/cross-project-rpc-protocol.md
  - ../learn/lessons/gotchas/02-陷阱-RPC参数名不匹配.md
  - ./03-运行-Git工作流.md
---

# Code Review 指南

> Code Review 的目标不是找茬，而是在代码进入主分支之前捕获 Bug、设计问题和违反约定的代码。YrY 中最常见的可预防 Bug 是跨项目 RPC 参数名不匹配——Code Review 是第一道防线。

## Review 清单

### 所有项目通用

- [ ] **变更范围合理**：PR 只做一件事，没有混杂无关改动
- [ ] **无死代码**：没有注释掉的代码、未使用的变量/导入、调试用的 console.log/print
- [ ] **错误处理恰当**：不吞异常，错误信息包含足够上下文
- [ ] **没有硬编码**：无硬编码密钥、URL、端口号（应使用环境变量或配置）
- [ ] **命名清晰**：变量/函数/类名自解释，不需要注释来补充含义
- [ ] **提交信息规范**：遵循 Conventional Commits，提交粒度合理

### Python（YiAi）

- [ ] **参数名与 RPC 契约一致**：`filter` 不是 `query`，`target_file` 不是 `path`，`cname` 不是 `collection_name`
- [ ] **返回 `StandardResponse`**：使用 `success()` 和 `error()` 包装，不返回裸字典
- [ ] **异步正确**：I/O 操作使用 `async/await`，不混用同步和异步
- [ ] **数据层隔离**：Routes 不直接调用 `data/`，通过 `services/` 中转
- [ ] **异常使用正确**：业务异常用 `BusinessException` + `ErrorCode`，不抛裸 `Exception`
- [ ] **无 SQL/命令注入**：用户输入不拼接到 shell 命令或原始查询中
- [ ] **类型注解**：公开函数有参数类型和返回类型注解

### TypeScript/Vue（YiVad）

- [ ] **RPC 参数名正确**：前端 API 调用中的参数名与后端一致
- [ ] **Composition API**：使用 `<script setup>`，不使用 Options API
- [ ] **ProTable 模式**：新表格页面使用 ProTable，不直接使用 `el-table`
- [ ] **SSE 流中止处理**：`onDone` 回调有 `isAborted` 守卫
- [ ] **Store 不直接调 axios**：通过 `@/api/modules/*` 封装
- [ ] **类型安全**：无 `any` 类型（除非有充分理由），Props/Emits 使用类型泛型
- [ ] **构建不中断**：`vue-tsc --noEmit` 通过

### Chrome Extension（YiPet）

- [ ] **双世界边界正确**：ISOLATED world 代码不访问 MAIN world API，反之亦然
- [ ] **API 调用通过 ApiClient**：不使用裸 `fetch`
- [ ] **Service Worker 生命周期**：正确处理休眠/唤醒
- [ ] **chrome.storage 使用正确**：大数据用 `chrome.storage.local`，不用 `chrome.storage.sync`
- [ ] **Manifest 权限最小化**：只声明实际使用的权限

### Markdown/Docs（YiKnowledge）

- [ ] **Frontmatter 完整**：title、tags、category、created、updated、source、type、status
- [ ] **目录深度 ≤ 3 级**：`role/problem-domain/file.md`
- [ ] **文件命名符合规范**：中文 + kebab-case 序号
- [ ] **无重复内容**：不复制已有知识，使用交叉引用

## RPC 契约专项审查

这是 YrY 最高优先级的审查项目——因为参数名不匹配是最常见的 Bug：

```typescript
// 审查要点：前端调用的 parameters 与后端取值是否一致？

// 后端取值: parameters.get("filter")
// 前端传值: { filter: {...} }
// ✓ 一致

// 后端取值: parameters.get("target_file")
// 前端传值: { path: "..." }
// ✗ 不一致——阻止合并
```

审查方法：在 PR 中同时打开前端调用代码和后端 Service 代码，逐字段比对。

## Review 节奏

| 优先级 | 响应时间 | 适用场景 |
|--------|---------|---------|
| 紧急热修复 | 1 小时内 | 生产环境故障修复 |
| 正常 PR | 24 小时内 | 日常功能开发和 Bug 修复 |
| 大型重构 | 48 小时内 | 涉及多文件、架构变更的 PR |

## Review 礼仪

### 对于 Reviewer

- **关注代码，不关注人**：说"这个函数缺少错误处理"而不是"你忘了加错误处理"
- **区分必须改和建议改**：用 `[blocking]` 和 `[nit]` 标记问题严重程度
- **说清原因**：不只说"这样不好"，而是说"因为参数名不匹配会导致后端静默忽略"
- **提供建议**：指出问题时附带改进方案（代码示例或文档链接）
- **不要只看 diff**：拉下代码实际运行，验证行为正确性

### 对于 Author

- **小的 PR**：200 行以内最好 review；500 行以上建议拆分
- **提供上下文**：PR 描述中说明为什么要做这个变更、影响范围
- **先自审**：提交 PR 前自己先过一遍 diff
- **不要防御**：Review 意见针对的是代码，不是你的能力

## 什么不需要 Review

以下类型的变更可以快速通过或跳过 Review：

| 变更类型 | 建议 |
|---------|------|
| 文档更新（无代码变更） | 快速浏览确认无技术错误 |
| 配置调整（如超时时间） | 确认值合理 |
| 依赖版本升级（补丁版本） | CI 通过即可 |
| 格式化/代码风格变更 | 确认无逻辑变更 |

## 反模式

| 反模式 | 正确做法 |
|---|---|
| "LGTM" 无实质审查 | 至少逐项过一遍清单 |
| Review 拖了 3 天 | 每天固定时间处理 Review 请求 |
| 只看出问题的点，不说为什么是问题 | 附上原因和文档链接 |
| 一个 PR 改了 30 个文件 | 拆分为 2-3 个逻辑独立的 PR |
| 在 PR 评论中讨论需求变更 | 需求讨论转到 Issue 或频道，PR 讨论聚焦实现 |