---
title: "useTable 竞态条件：快速翻页/搜索时陈旧响应覆盖新数据"
key: yivad-usetable-race-condition-20260923
tags:
- race-condition
- bug-fix
- pro-table
- useTable
- async
category: projects/yivad/bugs/代码质量
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: medium
priority: p2
project: YiVad
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23)
frequency: occasionally
---

## Description

`useTable` 的 `getTableList` 异步函数无竞态条件保护。当用户快速切换页码、搜索或排序时，并发触发的 API 调用中，后返回的旧响应会覆盖先返回的新响应，导致表格显示错误数据。

## Impact

作为所有 ProTable 页面的基础设施，该 bug 影响范围是所有使用 ProTable 的 19 个功能模块。典型触发场景：

- 快速点击翻页按钮 → 跳转到错误页面的数据
- 快速切换排序字段 → 显示旧排序的结果
- 快速输入搜索词 → 显示旧搜索词的结果

## Cause

`getTableList` 使用 `await api(...)` 后直接更新 `state.tableData` 和 `state.pageable.total`，无请求序列号检查。虽然 axios 层有请求取消器，但 RPC 调用设置了 `cancel: false`（避免误取消并行的幂等调用），因此并发请求的响应顺序不可预测。

```
时间线：
t1: getTableList(page=2) → API 请求发出
t2: getTableList(page=3) → API 请求发出
t3: page=3 响应到达 → tableData = [page3 数据] ✓
t4: page=2 响应到达 → tableData = [page2 数据] ✗ (覆盖了 page3!)
```

## Solution

使用单调递增的请求序列号 `_reqSeq` 在 `await` 后检查是否为最新请求，丢弃陈旧响应：

```ts
let _reqSeq = 0;
const getTableList = async () => {
  if (!api) return;
  const seq = ++_reqSeq;
  try {
    // ... api call ...
    if (seq !== _reqSeq) return; // 丢弃陈旧响应
    // ... update state ...
  } catch (error) {
    if (seq !== _reqSeq) return; // 丢弃陈旧错误
    requestError && requestError(error);
  }
};
```

这比 AbortController 更优——不会取消正在传输的请求（节省带宽），仅丢弃过期响应的状态更新。

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useTable.ts:58-73` | 添加 `_reqSeq` 序列号检查和陈旧响应丢弃逻辑 |

## Verification

- `vue-tsc --noEmit`: 0 errors
- `eslint --quiet`: clean
- 逻辑验证：快速连续调用 `getTableList()` 3 次，仅最后一次响应用于更新状态

## Prevention

**规则**：所有 async 函数在 `await` 后修改共享状态的模式，必须具备陈旧响应丢弃机制。推荐模式：
1. 递增序列号 → await → 检查序列号 → 更新状态
2. 或使用 AbortController + fetch 的 signal 取消旧请求（适合可重试的幂等操作）