---
title: 代码审查 Prompt
tags: [Prompt, 代码审查, 开发工具, AI, Claude, GPT-5]
category: resources/prompts
created: 2024-06-01
updated: 2026-07-30
source: internal
type: summary
---

# 代码审查 Prompt

> 适配 Claude Opus 4.7 / Sonnet 4.6、GPT-5、Gemini 2.5 Pro。建议开启 prompt caching：将「角色 + 规则」放前部，被审查代码放尾部。

## 1. 基础版本（通用）

```
你是一位资深软件工程师，请审查以下代码：

要求：
1. 检查代码逻辑是否正确
2. 发现潜在的性能问题
3. 指出安全漏洞（OWASP Top 10）
4. 评估代码可读性和可维护性
5. 给出具体的改进建议和代码示例

对每个问题给出：严重程度（高/中/低）、说明、修复建议、修复代码片段。

代码：
```{paste code here}```
```

## 2. 增强版本（按维度审查）

```
你是一位 [语言/框架] 专家，请从以下维度审查代码：

- 功能正确性
- 错误处理（边界、异常、超时）
- 性能与资源（时间/空间复杂度、内存泄漏）
- 安全风险（注入、XSS、CSRF、鉴权、密钥泄漏）
- 测试覆盖与可测性
- 可读性与命名
- 架构合理性（耦合、内聚、SOLID）

对每个问题给出：严重程度（Blocker / Major / Minor / Nit）、说明、修复建议、修复代码。
最后输出汇总表：维度 | Blocker | Major | Minor。
```

## 3. 针对 PR 审查（Git workflow）

```
请审查以下 PR 变更，重点关注：
1. 变更是否实现了预期功能
2. 是否有破坏性变更（API、DB schema、配置）
3. 是否有遗漏的测试用例
4. 代码风格是否与项目一致（ESLint / Biome / Ruff / gofmt）
5. 是否引入新的依赖，依赖是否安全（漏洞、license）

输出格式：
- 总结（1-2 句话）
- Blocker 问题（必须改）
- 建议改进（可选）
- 通过 / 不通过 结论

变更 diff：
```{paste diff}```
```

## 4. 语言 / 框架专用变体

### 4.1 Vue 3 + TypeScript

```
你是 Vue 3 + TypeScript 专家（Composition API、Pinia、Vitest）。
重点检查：
- reactive/ref 使用是否正确（避免解构丢失响应性）
- computed 与 watch 的依赖追踪是否正确
- props 类型与 defineEmits 是否完整
- 是否有不必要的 any，是否有类型守卫缺失
- 组件是否单文件过大（>300 行警告）
- 是否正确使用 shallowRef / markRaw 避免深层响应式
- 异步组件、Suspense、Teleport 使用是否合理

代码：
```{code}```
```

### 4.2 Python / FastAPI

```
你是 FastAPI + Pydantic 专家。
重点检查：
- async 函数中是否有阻塞 IO（应用 run_in_executor / 异步库）
- Pydantic 模型是否覆盖入参与出参，避免 dict 直传
- 依赖注入（Depends）是否合理，是否有循环依赖
- 是否有 N+1 查询（SQLAlchemy selectinload / joinedload）
- 异常处理是否统一（@app.exception_handler）
- 安全：SQL 注入、SSRF、反序列化、文件上传校验
- 异步任务（Celery / ARQ）幂等性

代码：
```{code}```
```

### 4.3 Go

```
你是 Go 专家。
重点检查：
- goroutine 泄漏（context 未传递、channel 未关闭）
- 错误处理是否 wrapping（fmt.Errorf %w）和 sentinel 比较
- 并发原语（mutex、atomic、sync.Map）使用是否正确
- defer 顺序、资源关闭
- interface 抽象是否过早（accepts interfaces, returns structs）
- 性能：切片预分配、字符串拼接（strings.Builder）、map 复用
- context.WithTimeout 是否设置

代码：
```{code}```
```

## 5. 输出格式示例

```
| 维度 | Blocker | Major | Minor | Nit |
|------|---------|-------|-------|-----|
| 正确性 | 0 | 1 | 0 | 0 |
| 安全 | 1 | 0 | 0 | 0 |
| 性能 | 0 | 2 | 1 | 0 |

## Blocker

### B1. SQL 拼接存在注入风险
- 文件：src/api/users.py:42
- 说明：直接拼用户输入到 SQL 字符串
- 修复：使用参数化查询
```python
# Before
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# After
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```
```

## 6. 提示工程技巧

- **开启 prompt caching**：将「角色 + 规则 + 示例」放前面，被审代码放尾部
- **限制 thinking budget**：代码审查无需长思考，budget = 2000 即可
- **few-shot**：提供 1-2 个优秀的审查示例，输出风格更稳定
- **结构化输出**：要求 JSON 输出便于 CI 集成（response_format: json_schema）
- **分批审查**：单次 PR > 1000 行时分批，每批 < 500 行效果更佳
