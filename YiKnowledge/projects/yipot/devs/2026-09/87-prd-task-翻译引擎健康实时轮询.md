---
prd_task_id: "YT-09-87"
title: "YT-09-87: 翻译引擎健康实时轮询 — YiPot 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.15
source_prd: "YA-09-122"
tags: [开发方案, 跨项目, 翻译引擎, 实时轮询, 供应商健康]
type: task
category: 项目/桌面翻译/开发
source: YiPot
benefit: "YiPot Translate 窗口后台轮询供应商健康数据，与 YiVad/YiPet 共享同一数据源"
lifecycle: active
---

# YT-09-87: 翻译引擎健康实时轮询 — YiPot 开发方案

> 关联 PRD: [YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)

## 问题诊断

YiPot 的 `TranslationService.getProviderHealth()` 已实现（`src/api/services/translation.ts` 行 108-114），但从未被周期性调用。TargetArea 仅在语言切换时调用 `getProviderRecommend()`（行 104-119），翻译窗口无后台供应商健康状态感知。

## 修改清单

| # | 文件 | 变更 |
|---|------|------|
| 1 | `hooks/useApi.ts` | 新增 `useProviderHealth()` React hook — 60s 轮询 + 自动清理 |

## 实现要点

### useProviderHealth Hook

```ts
const POLL_INTERVAL_MS = 60_000;

export function useProviderHealth() {
  const [health, setHealth] = useState<ProviderHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const client = getClient();
    if (!client) return;
    const svc = createTranslationService(client);

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await svc.getProviderHealth(24);
        setHealth(data as ProviderHealthData);
      } catch (e: any) {
        setError(e?.message || 'Health fetch failed');
      } finally {
        setLoading(false);
      }
    }

    fetch();
    intervalRef.current = setInterval(fetch, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { health, loading, error };
}
```

### 使用方式

在 Translate 窗口中调用：
```jsx
// src/window/Translate/index.jsx
import { useProviderHealth } from '../../hooks/useApi';

function Translate() {
  const { health } = useProviderHealth();
  // health 数据保持新鲜，TargetArea 的 getProviderRecommend() 始终有最新的健康上下文
  // ...
}
```

### 跨项目数据一致性

| 项目 | 组件 | 数据源 | 轮询间隔 |
|------|------|--------|----------|
| YiVad | TranslationAnalytics | `getProviderHealth(hours)` | 30s（手动切换） |
| YiPet | ProviderHealth | `translation.getProviderHealth(24)` | 60s |
| YiPot | useProviderHealth | `translation.getProviderHealth(24)` | 60s |

三项目通过同一 YiAi RPC 端点获取供应商健康数据，格式统一。

## 验证

- `pnpm build` ✅ Vite 构建通过
- `cargo check` ✅ Rust 编译通过
- 在 Translate 组件中调用 `useProviderHealth()` → 验证 60s 后 health 数据刷新
- 组件卸载 → 验证 `clearInterval` 被调用（React DevTools profiler）