---
name: test-driven-development
description: >
  测试驱动开发 (TDD)。Red-Green-Refactor 循环：先写失败测试→最小实现→重构。
  当用户要实现新功能、修复Bug、重构代码，或者说「写测试」「加测试」「TDD」
  「测试驱动」「test first」「unit test」「先写测试」「加个测试保护」
  「write tests」「test coverage」「red green refactor」时使用。
  在 task-planning 的每个执行步骤中嵌入 TDD 循环。
  注意：只写测试不写实现→也是本技能；只重构不写测试→先加测试建立安全网。
user_invocable: true
updated: 2026-09-23
lifecycle: active
auto-trigger-rules:
  - 用户要实现新功能或新模块
  - 用户说「写测试」「加测试」「TDD」「测试驱动」
  - task-planning 执行步骤中需要测试保护
  - 修复 Bug 后需要回归测试
  - 重构代码前需要先建立测试安全网
priority: high
tags: [skill, tdd, testing, quality, red-green-refactor]
---

# 测试驱动开发 —— Red-Green-Refactor

> **先写测试，再写代码。** 测试不是实现之后的负担——它是实现之前的契约。TDD 不是在写完代码后补测试，而是用测试定义代码应该做什么。

## 为什么需要 TDD？

superpowers 将 TDD 作为开发流程的核心环节——在 plan 之后、implement 之前。原因：

| 不写测试先写代码 | 先写测试再写代码 |
|----------------|----------------|
| 测试覆盖取决于「记不记得」 | 每行代码都有对应的测试 |
| 测试倾向于验证实现而非行为 | 测试定义行为，实现满足测试 |
| 重构没有安全网 | 重构有测试保护，不怕改坏 |
| 「写完再补测试」经常变成「没时间补」 | 测试和实现同步完成 |

---

### 进入标准
- [ ] task-planning 步骤已定义（知道要实现什么）
- [ ] 功能/Bug/重构的验收标准已明确
- [ ] 不是纯探索性代码（探索性代码不需要 TDD）

### 退出标准
- [ ] 所有测试通过（绿色状态）
- [ ] 代码已重构（消除重复、改善命名、提取共享逻辑）
- [ ] 测试覆盖了正常路径和关键边界情况
- [ ] 下一步：→ code-review（审查实现）或继续下一个 TDD 循环

## Red-Green-Refactor 循环

```
  ┌──────────────────────────────────────┐
  │                                      │
  ▼                                      │
┌──────┐    ┌───────┐    ┌──────────┐    │
│ RED  │───→│ GREEN │───→│ REFACTOR │────┘
│ 写失败 │    │ 最小   │    │ 重构     │
│ 的测试 │    │ 实现   │    │ 优化     │
└──────┘    └───────┘    └──────────┘
```

### RED —— 写一个失败的测试

**原则**：先写测试，确认它失败。如果测试一开始就通过，要么测试写错了，要么功能已经存在。

1. 确定要验证的行为（从 task_plan 的验收标准或 PRD 的用户故事）
2. 写一个最小测试，描述期望的行为
3. 运行测试，确认它**失败**（红色）

```typescript
// YiVad 示例：暗色模式切换
describe('useTheme', () => {
  it('should toggle between light and dark mode', () => {
    const { theme, toggleTheme } = useTheme()
    
    expect(theme.value).toBe('light')
    toggleTheme()
    expect(theme.value).toBe('dark')
    toggleTheme()
    expect(theme.value).toBe('light')
  })
})
```

```python
# YiAi 示例：RPC 参数校验
@pytest.mark.asyncio
async def test_query_documents_rejects_unknown_params():
    """使用未知参数名应返回 422 错误。"""
    response = await client.post("/", json={
        "module_name": "services.data.data_service",
        "method_name": "query_documents",
        "parameters": {"cname": "test", "query": {"status": "active"}}
    })
    assert response.json()["code"] == 1001  # 参数验证失败
```

### GREEN —— 写最小实现让测试通过

**原则**：只写让测试通过的最少代码。不要实现测试没覆盖的功能。

1. 写刚好让测试通过的代码（哪怕看起来「太简单」）
2. 运行测试，确认它**通过**（绿色）
3. 如果 30 秒内无法让测试通过，回退实现，写一个更小的测试

```typescript
// 最小实现——刚好让测试通过
export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  return { theme, toggleTheme }
}
```

### REFACTOR —— 在绿色状态下重构

**原则**：只有在全部测试通过时才重构。重构不改行为——只改结构。

1. 消除重复代码
2. 改善命名
3. 提取共享逻辑
4. 运行测试确认仍然全部通过
5. 如果重构中测试失败，立即回退

---

## 测试金字塔

```
        ┌──────┐
        │ E2E  │  ← 少量：关键用户路径
        ├──────┤
        │ 集成  │  ← 中量：模块间交互、API 契约
        ├──────┤
        │ 单元  │  ← 大量：纯函数、组件逻辑、工具方法
        └──────┘
```

### 单元测试（优先编写）

**测什么**：纯函数、composable、store action、工具方法
**不测什么**：框架内置功能、第三方库内部逻辑、简单的 getter/setter

```typescript
// ✅ 测自己的逻辑
describe('calculatePageCount', () => {
  it('returns 0 for empty list', () => {
    expect(calculatePageCount([], 10)).toBe(0)
  })
  it('rounds up for partial pages', () => {
    expect(calculatePageCount([1,2,3], 2)).toBe(2)
  })
})

// ❌ 不测框架行为
// 不测 ref 是否响应式——这是 Vue 的职责
```

### 集成测试

**测什么**：API 调用、store 间协作、组件间交互

```python
# YiAi RPC 集成测试
@pytest.mark.asyncio
async def test_query_documents_with_filter():
    response = await client.post("/", json={
        "module_name": "services.data.data_service",
        "method_name": "query_documents",
        "parameters": {
            "cname": "test_collection",
            "filter": {"status": "active"},
            "pageSize": 10
        }
    })
    assert response.json()["code"] == 0
    for item in response.json()["data"]["items"]:
        assert item["status"] == "active"
```

### E2E 测试（少量）

**测什么**：关键用户路径（登录→操作→验证结果）
**工具**：Playwright（YiVad）、httpx + 真实 DB（YiAi）

---

## 与 task-planning 的集成

TDD 嵌入 task-planning 的执行循环中：

```
task_plan 步骤 N：实现用户登录功能
    │
    ├── RED：写登录失败测试（无效凭证→401）
    ├── GREEN：实现登录 API 调用
    ├── REFACTOR：提取 token 存储逻辑
    │
    ├── RED：写登录成功测试（有效凭证→200 + token）
    ├── GREEN：实现 token 解析和存储
    ├── REFACTOR：统一错误处理
    │
    └── 步骤 N 完成 → progress.md 记录测试通过数
```

---

## 项目测试约定

### YiVad（Vitest + @vue/test-utils）

```typescript
// 测试文件放在 __tests__/ 或与源文件同目录
// 命名：*.spec.ts 或 *.test.ts

// Composable 测试模式
import { useHomeData } from '@/hooks/useHomeData'

describe('useHomeData', () => {
  it('fetches and returns data on mount', async () => {
    // arrange — 准备测试数据
    const mockData = [{ id: 1, name: 'test' }]
    vi.mocked(api.getHomeData).mockResolvedValue(mockData)
    
    // act — 执行被测代码
    const { data, loading } = useHomeData()
    await nextTick()
    
    // assert — 验证结果
    expect(data.value).toEqual(mockData)
    expect(loading.value).toBe(false)
  })
})
```

**运行**：`cd YiVad && pnpm test`
**质量门禁**：41/41 测试通过，不降低

### YiAi（pytest + httpx + pytest-asyncio）

```python
# 测试文件放在 tests/ 目录
# 命名：test_*.py

# API 端点测试模式
@pytest.mark.asyncio
async def test_rpc_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/", json={
            "module_name": "services.module.service",
            "method_name": "method",
            "parameters": {}
        })
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
```

**运行**：`cd YiAi && python -m pytest tests/ -v`
**质量门禁**：144/144 测试通过，不降低

### YiPet（Vitest + jsdom）

**运行**：`cd YiPet && npm test`

---

## Bug 修复的 TDD 模式

修复 Bug 时，TDD 流程调整为：

1. **RED** — 写一个复现 Bug 的测试（确认测试失败）
2. **GREEN** — 修复 Bug，确认测试通过
3. **REFACTOR** — 检查修复是否引入了代码质量问题
4. **追加** — 如果 Bug 涉及边界情况，追加更多边界测试

```
Bug：「分页后列头丢失」

1. RED：写测试——翻到第 2 页返回第 1 页，断言列头仍然存在
2. GREEN：修复 onPageChange 中的 resetColumnConfig() 调用
3. REFACTOR：检查分页逻辑是否有其他类似问题
4. 追加：测试切换每页条数后列头不丢失
```

---

## 与项目测试文档对齐

代码中的测试完成后，可选地将测试用例同步到项目文档：

```markdown
<!-- YiKnowledge/projects/<project>/devs/YYYY-MM/NN-test-功能名称.md -->

## 前端测试

| 用例 | 操作 | 预期 |
|------|------|------|
| [从 TDD 测试提取] | [测试的 act 步骤] | [测试的 assert 结果] |

## 后端测试

| 用例 | 验证点 |
|------|--------|
| [从 TDD 测试提取] | [测试的 assert 结果] |
```

---

## 命令

| 命令 | 操作 |
|------|------|
| 「写测试」「加测试」「TDD」 | 进入 TDD 模式，从 RED 阶段开始 |
| 「运行测试」 | 执行项目测试套件，报告结果 |
| 「只写测试」 | 只写测试不写实现（用于先建立测试安全网） |
| 「继续实现」 | 从当前 RED 状态进入 GREEN 阶段 |

## 原则

- **测试行为，不测试实现。** 测试「用户登录后看到欢迎消息」，不测试「调用了 login() 函数」。
- **一个测试只验证一件事。** `it('should do X and Y and Z')` → 拆成三个独立的测试。
- **测试名称描述行为。** `it('returns 0 for empty list')` 优于 `it('test calculatePageCount')`。
- **先写测试再写代码。** 顺序不可颠倒——先写实现再补测试不是 TDD。
- **保持测试快速。** 单元测试应在毫秒级完成，集成测试应在秒级完成。慢测试不会被频繁运行。
- **不降低门禁。** 修改不应减少测试通过数（YiVad: 41, YiAi: 144）。

## 参考文件

- `references/tdd-patterns.md` — 各语言/框架的 TDD 模式速查
- `../task-planning/SKILL.md` — 任务规划技能（TDD 嵌入执行步骤中，每步先写测试再实现）
- `../code-review/SKILL.md` — 代码审查技能（TDD 完成后触发审查，确认测试覆盖充分）
- `../verification-before-completion/SKILL.md` — 完成前验证（测试全部通过是完成门禁的核心条件）
- `../debugging/SKILL.md` — 调试技能（Bug 修复 TDD 模式：先写复现测试再修复）
- `../../YiKnowledge/projects/<project>/devs/` — 项目测试文档（格式参考）
- `../shared/glossary.md` — 技能共享术语表（Red-Green-Refactor 等术语定义）