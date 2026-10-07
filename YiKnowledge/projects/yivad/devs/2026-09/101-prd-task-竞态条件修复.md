---
title: "YV-09-101-TASK: ProTable 数据竞态条件修复 — 开发实施"
tags:
  - 开发方案
  - 竞态条件
  - useTable
  - 序列号模式
category: 项目/管理后台/开发
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: task
status: 已完成
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-101-TASK
prd_ref: YV-09-101
estimate: 0.25
review_status: 已评审
roles:
  - engineer
related_modules:
  - "101-prd-竞态条件修复"
  - "101-prd-test-竞态条件修复"
benefit: "1 文件修改，自动保护全部 19 个 ProTable 页面"
lifecycle: active
---

# YV-09-101-TASK: ProTable 数据竞态条件修复 — 开发实施

---

## 实施步骤

### Step 1: 在 `getTableList` 中添加序列号守卫

**文件**: `src/hooks/useTable.ts`

**当前代码** (第 58-73 行):
```typescript
const getTableList = async () => {
  if (!api) return;
  try {
    Object.assign(state.totalParam, initParam, isPageable ? pageParam.value : {});
    let { data } = await api({ ...state.searchInitParam, ...state.totalParam });
    dataCallBack && (data = dataCallBack(data));
    state.tableData = isPageable ? data.list : data;
    if (isPageable) {
      state.pageable.total = data.total;
    }
  } catch (error) {
    requestError && requestError(error);
  }
};
```

**修改后**:
```typescript
let _reqSeq = 0;
const getTableList = async () => {
  if (!api) return;
  const seq = ++_reqSeq;
  try {
    Object.assign(state.totalParam, initParam, isPageable ? pageParam.value : {});
    let { data } = await api({ ...state.searchInitParam, ...state.totalParam });
    // 丢弃陈旧响应——序列号不匹配说明有更新的请求已发出
    if (seq !== _reqSeq) return;
    dataCallBack && (data = dataCallBack(data));
    state.tableData = isPageable ? data.list : data;
    if (isPageable) {
      state.pageable.total = data.total;
    }
  } catch (error) {
    // 同样丢弃陈旧请求的错误——避免显示已过期的错误信息
    if (seq !== _reqSeq) return;
    requestError && requestError(error);
  }
};
```

### Step 2: 验证

1. 运行 `npx vue-tsc --noEmit` — 确认 0 个类型错误
2. 运行 `npx eslint --quiet src/hooks/useTable.ts` — 确认无 lint 错误
3. 手动验证：打开 Issue 列表 → 快速点击翻页 3 次 → 表格显示正确的页码数据

---

## 设计决策

### 为什么选择序列号而非 AbortController？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **序列号** (本方案) | 不取消已发出的请求、不影响其他并行的 RPC 调用、最简单 | 已发出的请求仍消耗带宽 |
| AbortController | 取消飞行中的请求 | 需要传递 signal、可能影响共享连接池、复杂 |
| 防抖 (debounce) | 减少请求数 | 增加感知延迟、用户点击无即时反馈 |

序列号方案最适配当前架构——RPC 端点共享 URL、`cancel: false` 配置、请求幂等性保证。

### 为什么序列号存储在闭包中而非 ref？

```typescript
let _reqSeq = 0;  // 模块级闭包变量，非 ref
```

- `_reqSeq` 不需要响应式——它不在模板中使用
- 放在 ref 中会增加不必要的响应式追踪开销
- 闭包变量在每次 `useTable()` 调用时创建新实例，天然隔离不同表格实例

---

## 模式推广

此序列号守卫模式可推广到任何有同等问题的异步函数：

```typescript
// 通用模式：Stale Response Guard
let _seq = 0;
async function fetchWithGuard() {
  const seq = ++_seq;
  const result = await asyncOperation();
  if (seq !== _seq) return; // 丢弃陈旧响应
  applyResult(result);
}
```

适合场景：
- 表格数据获取（本修复）
- 搜索建议/自动补全
- 图表数据切换
- 任何"最新请求的结果才有意义"的异步操作

不适合场景：
- 独立的并行请求（每个结果都重要）
- 需要取消请求以节省带宽的场景