---
name: code-review
description: >
  专业代码审查 (code review)。对变更进行六维结构化评审：安全、正确性、性能、
  可维护性、架构一致性、跨项目RPC契约。输出P0-P3分级问题列表和可操作的修复方案。
  当用户要求代码审查、CR、PR review、检查代码、提交前自检，或者说「审查」
  「review」「检查一下」「帮我看看代码」「有什么问题」「code quality」
  「pull request review」「pre-commit check」时使用。
  注意：代码有报错/不工作→debugging；确认完成→verification。
user_invocable: true
updated: 2026-09-23
lifecycle: active
auto-trigger-rules:
  - 用户提到「审查」「review」「检查代码」「CR」
  - 用户完成了功能实现后询问「还有什么问题」
  - 用户准备提交或合并代码
  - 用户说「帮我看看这段代码」
priority: high
tags: [skill, review, quality, code-review]
---

# 代码审查

> 目标不是找出尽可能多的问题，而是找出**真正值得修复**的问题。每个问题都附带修复成本评估。

### 进入标准
- [ ] 代码变更已完成（git diff 有内容）
- [ ] 变更作者认为「代码写完了」（不需要完美，但功能完整）
- [ ] 不是正在调试中的代码（调试中→debugging）

### 退出标准
- [ ] P0 问题全部修复
- [ ] P1 问题修复或有明确计划
- [ ] 审查报告已生成，结论明确（通过/有条件通过/需要修改）
- [ ] 下一步：→ verification-before-completion

## 审查流程

```
获取变更 → 逐文件审查 → 分级归类 → 输出报告 → 确认修复
```

### 步骤 1：获取变更范围

确定审查范围，优先级从高到低：

1. **用户指定** — 用户明确提到的文件或目录
2. **Git 变更** — `git diff` 查看未提交的修改
3. **当前分支** — `git diff main...HEAD` 查看分支所有变更

如果范围超过 20 个文件或 500 行，建议用户缩小审查范围或分批审查。

### 步骤 2：五维审查

对每个变更文件从以下六个维度审查：

#### 1. 安全（Security）

| 检查项 | 严重程度 | 说明 |
|--------|---------|------|
| 密钥/Token 硬编码 | 🔴 critical | 密码、API Key、JWT Secret 等不得以明文出现在代码中 |
| 命令/代码注入 | 🔴 critical | 用户输入未经转义直接拼接到 shell 命令或 SQL 语句中 |
| 认证绕过 | 🔴 critical | 未受保护的端点、缺失的权限检查 |
| 敏感数据泄露 | 🟠 high | 日志中打印密码、Token、用户隐私数据 |
| XSS 风险 | 🟠 high | 未转义的用户内容直接插入 DOM (`v-html` 无净化) |
| 输入校验缺失 | 🟡 medium | API 端点未校验参数类型和范围 |

YrY 项目需要额外检查：
- YiAi：RPC 端点是否有认证保护、JWT 密钥是否来自配置
- YiVad/YiPet：API 调用是否通过 RequestHttp/ApiClient 而非裸 fetch

#### 2. 正确性（Correctness）

| 检查项 | 严重程度 | 说明 |
|--------|---------|------|
| 逻辑错误 | 🔴 critical | 条件判断、循环、状态转换存在明确错误 |
| 空值处理缺失 | 🟠 high | 可能为 `null`/`undefined`/`None` 的值直接访问属性 |
| 边界条件遗漏 | 🟠 high | 空数组、空字符串、0、负数等边界值未处理 |
| 异步处理不当 | 🟠 high | Promise 未 await、竞态条件、未捕获的 rejection |
| 类型不匹配 | 🟡 medium | TypeScript 类型标注与实际值不一致 |

YrY 项目需要额外检查：
- RPC 参数名是否正确（`filter` 而非 `query`，`target_file` 而非 `path`）
- Python `await` 是否正确使用（Motor 异步驱动）

#### 3. 性能（Performance）

| 检查项 | 严重程度 | 说明 |
|--------|---------|------|
| N+1 查询 | 🟠 high | 循环内逐条查询数据库/API |
| 内存泄漏 | 🟠 high | 未清理的事件监听器、定时器、闭包引用 |
| 不必要的重复计算 | 🟡 medium | 循环内重复计算不变值、缺少 memoization |
| 大文件/大列表未分页 | 🟡 medium | 一次性加载全部数据到内存 |

YrY 项目需要额外检查：
- MongoDB 查询是否有合适的索引覆盖
- 前端 ProTable 是否配置了服务端分页

#### 4. 可维护性（Maintainability）

| 检查项 | 严重程度 | 说明 |
|--------|---------|------|
| 重复代码 | 🟡 medium | 三次及以上相同模式的代码块 |
| 函数过长 | 🟡 medium | 超过 50 行的函数（测试除外） |
| 命名模糊 | 🟡 medium | 单字母变量（非循环变量）、含义不清的缩写 |
| 未使用的代码 | 🟢 low | 未使用的导入、变量、函数 |
| 缺少类型标注 | 🟢 low | TypeScript `any` 类型、Python 无类型注解 |

#### 5. 架构一致性（Architecture）

| 检查项 | 严重程度 | 说明 |
|--------|---------|------|
| 模块边界破坏 | 🟠 high | 直接访问其他模块的内部实现 |
| 循环依赖 | 🟠 high | 模块 A 导入 B，B 又导入 A |
| 模式偏离 | 🟡 medium | 未遵循项目既有的代码组织方式 |
| 抽象缺失 | 🟡 medium | 三个以上相似实现未抽取共享逻辑 |

YrY 项目需要额外检查：
- YiVad：是否使用 Composition API（非 Options API）、ProTable 模式是否正确
- YiAi：Service 层是否正确使用 Repository 模式
- YiPet：Content Script 和 Service Worker 职责是否分离

#### 6. 跨项目契约（Cross-Project Contract）

YrY 是共享后端的单体仓库，前端通过 RPC 信封调用 YiAi。跨项目参数名不匹配是**最频繁的 Bug 来源**（参考 `YiKnowledge/projects/yiai/bugs/2026-09/接口/01-接口-RPC参数query-vs-filter静默忽略.md`）。

| 检查项 | 严重程度 | 说明 |
|--------|---------|------|
| RPC 参数名错误 | 🔴 critical | `query` 而非 `filter`、`path` 而非 `target_file`、`collection_name` 而非 `cname` |
| 参数名跨越不一致 | 🟠 high | 前端使用一个名称，后端期望另一个（即使都是自定义参数） |
| RPC 响应格式偏离 | 🟠 high | 前端假设的响应结构与 RPC 信封 `{code, message, data}` 不一致 |
| 新增 RPC 方法无参数白名单 | 🟡 medium | 后端方法未声明接受的参数名集合 |
| 前端绕过封装层调 API | 🟡 medium | YiVad 裸 `fetch` 而非 `RequestHttp`，YiPet 裸 `fetch` 而非 `ApiClient` |

**关键参数名契约（硬编码——这些名称必须精确匹配）：**

| 正确 | 错误 | 上下文 |
|---------|-------|---------|
| `filter` | `query`、`where`、`condition` | `data_service.query_documents` 过滤参数 |
| `target_file` | `path`、`file_path`、`filepath` | `/read-file`、`/write-file` 端点 |
| `cname` | `collection_name`、`collection`、`table` | `data_service` collection 参数 |

**审查方法**：
- 对每个新增/修改的 RPC 调用，grep 确认参数名与后端契约一致
- 检查前端 `RequestHttp`/`ApiClient` 的调用处，确认未绕过封装
- 新增 RPC 方法时，检查后端是否声明了参数白名单

### 步骤 3：分级归类

每个问题分配一个严重级别：

| 级别 | 标签 | 含义 | 行动要求 |
|------|------|------|---------|
| P0 | 🔴 严重 | 安全漏洞、数据丢失、线上崩溃 | 合并前必须修复 |
| P1 | 🟠 重要 | 功能异常、性能退化 | 合并前应该修复 |
| P2 | 🟡 建议 | 可维护性问题、轻微性能损耗 | 建议修复，不阻塞合并 |
| P3 | 🟢 可选 | 风格偏好、小优化 | 开发者自行决定 |

### 步骤 4：输出报告

使用以下模板输出结构化审查报告：

```markdown
# 代码审查报告

**审查范围**：[分支/提交/文件列表]
**审查时间**：[时间]
**变更规模**：[N 个文件，+M/-K 行]
**总体评价**：[通过 / 有条件通过 / 需要修改]

## 审查摘要

| 级别 | 数量 |
|------|------|
| 🔴 严重 | N |
| 🟠 重要 | N |
| 🟡 建议 | N |
| 🟢 可选 | N |

## 🔴 严重 — 合并前必须修复

### [问题标题] — `path/to/file:line`

**问题**：[具体描述]
**影响**：[可能导致的后果]
**修复**：[具体修复方案，最好提供代码示例]

```diff
- 旧代码
+ 新代码
```

## 🟠 重要 — 合并前应该修复

...

## 🟡 建议 — 不阻塞合并

...

## 🟢 可选 — 开发者自行决定

...

## 正面反馈

[值得肯定的代码模式和设计决策]
```

### 步骤 5：确认修复

审查报告输出后：

1. 询问用户优先修复哪些级别的问题
2. P0 问题立即修复；P1 问题逐个确认
3. 修复后运行验证（类型检查、测试套件）
4. 提供「修复后重新审查」选项

---

## 项目专项检查清单

根据 `YiKnowledge/projects/` 中的 bug 历史，以下模式曾导致线上问题，审查时重点关注：

### YiAi（Python/FastAPI）

- [ ] JWT Secret 是否来自环境变量而非硬编码（参考 `认证/01-认证-JWT-Secret硬编码默认值`）
- [ ] MongoDB 连接是否有连接池管理（参考 `数据/01-数据-MongoDB连接池耗尽`）
- [ ] RPC 参数名是否正确：`filter` 而非 `query`（参考 `接口/01-接口-RPC参数query-vs-filter静默忽略`）
- [ ] 空查询是否有防护（参考 `搜索/01-搜索-空查询未做防护导致全表扫描`）
- [ ] YAML 配置键名是否会扁平化冲突（参考 `配置/01-配置-YAML配置扁平化键名冲突`）
- [ ] Token 刷新是否有并发保护（参考 `企业微信/01-企微-Token刷新无并发保护`）
- [ ] 异常处理器是否吞没了真实错误（参考 `中间件/01-中间件-异常处理器吞没真实错误`）
- [ ] 模块执行器是否有超时和资源限制（参考 `执行/01-执行-模块执行器缺少超时和资源限制`）

### YiVad（Vue 3/TypeScript）

- [ ] 是否使用 Composition API（项目禁止 Options API）
- [ ] API 调用是否通过 RequestHttp 封装
- [ ] 权限控制是否使用 `v-auth` 指令
- [ ] ProTable 列配置是否在分页切换时保持

### YiPet（Chrome Extension）

- [ ] Content Script 和 Service Worker 逻辑是否分离
- [ ] chrome.storage 读写是否有错误处理
- [ ] API 调用是否通过 ApiClient 而非裸 fetch

---

## 命令

| 命令 | 操作 |
|------|------|
| 「审查」「review」「CR」 | 审查当前未提交的变更 |
| 「审查全部」「full review」 | 审查当前分支所有变更 |
| 「审查 <文件路径>」 | 只审查指定文件 |
| 「修复 P0」 | 自动修复所有严重问题 |
| 「忽略 <问题编号>」 | 标记问题为已知且接受 |

---

## YrY 实战速览

以下示例来自项目真实 Bug 和审查场景：

### 例 1：RPC 参数名错误（P0 🔴）

```diff
// YiVad src/api/issue.ts
- parameters: { cname: "issues", query: { status: "open" } }
+ parameters: { cname: "issues", filter: { status: "open" } }
```

**为什么是 P0**：`query` 被后端静默忽略→返回全量数据→前端显示全量→用户基于错误数据决策。参考 `YiKnowledge/projects/yiai/bugs/2026-09/接口/01-接口-RPC参数query-vs-filter静默忽略.md`。

### 例 2：MongoDB 连接未释放（P1 🟠）

```python
# YiAi domain/data/data_service.py
async def query_documents(self, params):
    client = AsyncIOMotorClient(settings.mongo_uri)  # 每次查询新建连接！
    db = client[settings.db_name]
    result = await db[params["cname"]].find(...)
    return result  # client 未关闭，连接泄漏
```

**为什么是 P1**：高并发下连接池耗尽。应使用单例 `AsyncIOMotorClient`。参考 `YiKnowledge/projects/yiai/bugs/2026-09/数据/01-数据-MongoDB连接池耗尽.md`。

### 例 3：缺失空查询防护（P1 🟠）

```python
# 未加 limit 的全表查询
results = await collection.find(filter_dict).to_list(None)
# P1: 空 filter_dict = {} → 全表扫描，数据量大时超时
```

## 原则

- **精确胜过全面。** 与其列出 20 个模糊问题，不如深入分析 5 个明确问题。
- **提供修复方案。** 每个问题附带具体的、可操作的修复代码。不要只说「这里有问题」。
- **区分风格和正确性。** 风格偏好标记为 P3，不阻塞合并。
- **关注增量变更。** 只审查新增和修改的代码，不评论既有的非相关代码。
- **正面反馈同样重要。** 指出做得好的地方，帮助团队建立好的模式共识。
- **参考历史 Bug。** 用项目真实的 bug 历史作为审查依据，而非抽象的「最佳实践」。

## 参考文件

- `references/review-checklist.md` — 完整的审查检查清单（含语言专项清单）
- `references/severity-guide.md` — 严重级别判定指南与示例
- `../task-planning/SKILL.md` — 任务规划技能（步骤执行完成后触发审查）
- `../test-driven-development/SKILL.md` — TDD 技能（审查时检查是否有对应测试）
- `../verification-before-completion/SKILL.md` — 完成前验证（审查修复完成后触发验证）
- `../../YiKnowledge/projects/` — 各项目 bug 历史和架构文档
- `../../YiKnowledge/projects/yiai/bugs/2026-09/接口/01-接口-RPC参数query-vs-filter静默忽略.md` — RPC 契约 Bug 参考
- `../finishing-a-development-branch/SKILL.md` — 开发分支收尾（审查通过后的提交规范检查）
- `../requesting-code-review/SKILL.md` — 请求代码审查（审查的上游，如何准备和提交审查请求）
- `../receiving-code-review/SKILL.md` — 接收审查反馈（审查的下游，如何处理审查意见）
- `../shared/glossary.md` — 技能共享术语表（六维审查、P0-P3 分级等术语定义）