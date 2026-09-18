---
title: Composable 开发
tags: [yivad, composables, hooks, patterns, state-management, testing]
category: projects/yivad/workflows
created: 2026-09-15
updated: 2026-09-15
source: YiVad
type: conventions
roles: [engineer]
benefit: "Composable 分层、状态管理、副作用处理、测试策略"
status: active
---

# Composable 开发

> Composable 设计模式、状态管理、副作用处理、组合策略、测试方法。

## 一、Composable 分层

```
src/hooks/
├── useTable.ts                 # 通用表格数据管理
├── useAuthButtons.ts           # 权限按钮查询
├── useColumnManager.ts         # 列显示/排序管理
├── useColumnVirtualization.ts  # 列虚拟化
├── useDateFilter.ts            # 日期筛选
├── useDownload.ts              # 文件下载
├── useAutoSave.ts              # 自动保存
├── useBatchOperation.ts        # 批量操作
├── useDetailTabs.ts            # 详情页 Tab 管理
├── useFormAccess.ts            # 表单权限控制
├── useAiChatBridge.ts          # AI 聊天桥接
├── useConversationTree.ts      # 对话树管理
├── useConditionalFormat.ts     # 条件格式化
├── useCustomViews.ts           # 自定义视图
├── useDashboard.ts             # 仪表盘数据
├── useCodeHealth.ts            # 代码健康检查
├── useContextChanges.ts        # 上下文变更检测
├── useFieldDependency.ts       # 字段依赖
├── useFormCollaboration.ts     # 表单协作
├── useFormOffline.ts           # 表单离线缓存
└── interface/                  # Composable 类型定义
```

**分类：**

| 类别 | 示例 | 特征 |
|------|------|------|
| 数据管理 | `useTable`, `useDashboard` | 封装 API 调用 + 响应式状态 |
| UI 交互 | `useColumnManager`, `useDetailTabs` | 控制 UI 状态（显隐/排序/切换） |
| 业务逻辑 | `useAuthButtons`, `useFormAccess` | 权限判定、数据转换 |
| 效果增强 | `useAutoSave`, `useConditionalFormat` | watch/side-effect 封装 |
| 跨组件通信 | `useAiChatBridge`, `useBatchOperation` | 组件间状态同步 |

## 二、Composable 结构模板

```typescript
// hooks/useFeature.ts
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { FeatureItem, FeatureOptions } from "./interface";

/**
 * 功能描述（一句话说明 composable 的用途）
 */
export function useFeature(options: FeatureOptions = {}) {
  // 1. 参数默认值
  const {
    immediate = true,
    debounceMs = 300,
    onError,
  } = options;

  // 2. 响应式状态
  const data = ref<FeatureItem[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // 3. 派生状态
  const isEmpty = computed(() => data.value.length === 0);
  const activeCount = computed(() => data.value.filter(d => d.active).length);

  // 4. 方法
  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await apiCall();
    } catch (e) {
      error.value = e as Error;
      onError?.(e);
    } finally {
      loading.value = false;
    }
  }

  // 5. 副作用（watch / lifecycle）
  if (immediate) {
    onMounted(fetch);
  }

  // 6. 清理
  onUnmounted(() => {
    // 取消未完成的请求、移除事件监听等
  });

  // 7. 返回（仅暴露需要的）
  return { data, loading, error, isEmpty, activeCount, fetch };
}
```

**命名约定：** 文件名以 `use` 开头，camelCase，如 `useTable.ts`、`useAutoSave.ts`

## 三、状态管理模式

### 模式 A：纯 Composable（无外部依赖）

```typescript
// 适用于：单一组件内、无需跨组件共享
export function useLocalState() {
  const count = ref(0);
  function increment() { count.value++; }
  return { count, increment };
}
```

### 模式 B：Composable + Store（跨组件共享）

```typescript
// 适用于：跨组件共享状态、需要持久化
export function useSharedFeature() {
  const store = useFeatureStore();       // Pinia Store 持有核心状态
  const localState = ref<UIState>({});   // 本地 UI 状态

  // 派生：组合 store 状态 + 本地状态
  const displayData = computed(() =>
    store.items.filter(i => i.status === localState.value.filter)
  );

  return { ...toRefs(store), localState, displayData };
}
```

### 模式 C：Composable 注入（provide/inject）

```typescript
// 适用于：组件树深层传递
// 祖先组件
const feature = useFeature();
provide("featureContext", feature);

// 后代组件
const feature = inject("featureContext") as ReturnType<typeof useFeature>;
```

**原则：** 优先用模式 A，跨组件才升到模式 B，深层传递才用模式 C。

## 四、副作用处理

### Watch 模式

```typescript
// 搜索防抖
export function useSearch(apiCall: (q: string) => Promise<Item[]>) {
  const query = ref("");
  const results = ref<Item[]>([]);
  const loading = ref(false);

  // watch + debounce
  let timer: ReturnType<typeof setTimeout>;
  watch(query, (val) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      loading.value = true;
      results.value = await apiCall(val);
      loading.value = false;
    }, 300);
  });

  onUnmounted(() => clearTimeout(timer));

  return { query, results, loading };
}
```

### 生命周期集成

```typescript
export function usePageVisibility(onHidden?: () => void) {
  const visible = ref(true);

  function handleChange() {
    visible.value = document.visibilityState === "visible";
    if (!visible.value) onHidden?.();
  }

  onMounted(() => document.addEventListener("visibilitychange", handleChange));
  onUnmounted(() => document.removeEventListener("visibilitychange", handleChange));

  return { visible };
}
```

## 五、Composable 组合

```typescript
// 组合多个 composable
export function useProjectList() {
  // 底层 composables
  const { tableData, pagination, loading, refresh } = useTable({
    requestApi: queryDocuments,
    defaultParams: { cname: "projects" },
  });
  const { selectedRows, handleSelect } = useBatchOperation(tableData);
  const { visible, open, close } = useModal();

  // 组合逻辑
  async function handleBatchDelete() {
    const ids = selectedRows.value.map(r => r._id);
    await deleteDocuments({ ids });
    close();
    await refresh();
  }

  return {
    tableData, pagination, loading, refresh,
    selectedRows, handleSelect,
    visible, open, close,
    handleBatchDelete,
  };
}
```

**组合原则：**
- 一个 composable 调用多个底层 composable，向上暴露统一接口
- 避免循环依赖（A → B → A）
- 返回值使用解构保持响应性

## 六、错误处理

```typescript
export function useSafeAsync<T>(
  fn: () => Promise<T>,
  options: { onError?: (e: Error) => void } = {},
) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function execute() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fn();
    } catch (e) {
      error.value = e as Error;
      options.onError?.(e as Error);
      // 不重新抛出 —— 错误已记录，调用方通过 error ref 判断
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, execute };
}
```

**规则：**
- API 层错误由 `RequestHttp` 拦截器统一提示
- Composable 层捕获错误是为了设置 `loading = false` 和 `error` 状态
- 不重复弹 `ElMessage.error`

## 七、测试 Composable

```typescript
import { useFeature } from "@/hooks/useFeature";

describe("useFeature", () => {
  it("初始状态正确", () => {
    const { data, loading, isEmpty } = useFeature({ immediate: false });
    expect(data.value).toEqual([]);
    expect(loading.value).toBe(false);
    expect(isEmpty.value).toBe(true);
  });

  it("fetch 后数据更新", async () => {
    // mock API
    vi.mock("@/api/modules/dataService", () => ({
      queryDocuments: vi.fn().mockResolvedValue({ list: [mockItem], total: 1 }),
    }));

    const { data, fetch } = useFeature({ immediate: false });
    await fetch();
    expect(data.value).toHaveLength(1);
  });

  it("loading 状态切换", async () => {
    const { loading, fetch } = useFeature({ immediate: false });
    const promise = fetch();
    expect(loading.value).toBe(true);
    await promise;
    expect(loading.value).toBe(false);
  });
});
```

**测试要点：**
- 测试初始状态（无需 mock）
- 测试数据加载（mock API）
- 测试 loading/error 状态转换
- 测试派生状态（computed）
- 测试 watch 副作用（`flush: "pre"` / `"post"`）

## 八、Composable 约束

| 约束 | 说明 |
|------|------|
| 文件名以 `use` 开头 | camelCase，如 `useTable.ts` |
| 单一职责 | 一个 composable 做一件事 |
| 返回值解构 | 保持响应性，不返回原始对象 |
| 不操作 DOM | 除非明确为 UI composable |
| 不使用 Options API | 仅 Composition API |
| 清理副作用 | `onUnmounted` 中取消请求、移除监听 |
| 类型安全 | 泛型约束输入输出 |

## 九、Composable vs Store 决策

| 条件 | Composable | Store |
|------|------------|-------|
| 单组件使用 | 是 | 否 |
| 跨组件共享状态 | 否（用 provide/inject） | 是 |
| 需要持久化 | 否 | 是（`pinia-plugin-persistedstate`） |
| 需要 DevTools 调试 | 否 | 是 |
| 轻量级逻辑 | 是 | 否 |
| 复杂业务域 | 否 | 是 |

**经验法则：** 先写 composable，当发现需要跨路由/跨页面共享时才提升到 Store。