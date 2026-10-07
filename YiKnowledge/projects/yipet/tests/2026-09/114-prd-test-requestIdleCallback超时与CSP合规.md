---

doc_type: test
prd_test_id: "YP-09-114"
title: "YP-09-114: 运行时可靠性修复 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "114-基础设施-requestIdleCallback超时与CSP合规.md"
tags: [reliability, csp, testing]

type: test
---

# YP-09-114: 运行时可靠性修复 — 测试方案

## 1. 测试策略

| 层级 | 方法 | 覆盖目标 |
|------|------|----------|
| 静态分析 | `vue-tsc --noEmit` | 零类型错误 |
| 代码审查 | grep | 确认 timeout 值 + 无内联 onclick |
| 回归测试 | Vitest 138 tests | 零回归 |

## 2. 测试用例

### TC-01: requestIdleCallback timeout 值验证

```bash
grep "requestIdleCallback" src/content/bootstrap.ts
```
**预期**: 输出含 `{ timeout: 2000 }`

### TC-02: Polyfill setTimeout 值验证

```bash
grep "setTimeout(fn" src/content/bootstrap.ts
```
**预期**: 输出含 `setTimeout(fn, 50)`

### TC-03: 更新横幅无内联 onclick

```bash
grep -c "onclick" src/content/rendering/overlay.ts
```
**预期**: 0（之前有 1 处）

### TC-04: 更新横幅使用 addEventListener

```bash
grep "addEventListener" src/content/rendering/overlay.ts | grep "click"
```
**预期**: 存在 `addEventListener('click', ...)`

## 3. 自动化验证

```
npm run typecheck    ✓
npm test             ✓ 138/138
npm run build        ✓
```

## 4. 测试结果

```
TC-01 timeout=2000         ✓
TC-02 setTimeout 50ms      ✓
TC-03 0 onclick            ✓
TC-04 addEventListener     ✓
vue-tsc                    ✓
vitest 138/138             ✓
build 4/4                  ✓
```