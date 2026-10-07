---

doc_type: module
prd_id: "PO-09-61"
title: "PO-09-61-dev: 智能引擎推荐 — 开发方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: task
---

# PO-09-61-dev: 智能引擎推荐 — 开发方案

## 改动清单

### 1. YiPot `src/api/services/translation.ts` — 新增 RPC 方法

在 `getTopLanguagePairs` 后新增：

```typescript
async getProviderRecommend(fromLang?: string, toLang?: string, limit?: number) {
  const res = await client.rpc(
    `${MODULE}.translate_service`, 'provider_recommend', {
      from_lang: fromLang ?? 'auto',
      to_lang: toLang ?? 'zh',
      limit: limit ?? 5,
    },
  );
  if (!res.ok) throw new Error(res.error || 'Provider recommendation failed');
  return res.data;
}
```

返回类型（与 YiVad `ProviderRecommendation` 一致）：
```typescript
{
  from_lang: string; to_lang: string;
  recommended: string | null;
  providers: Array<{name, success_rate, status: "healthy"|"degraded"|"down", total, failed}>;
  healthy_count: number; degraded_count: number; down_count: number;
}
```

### 2. YiPot `TargetArea/index.jsx` — 智能推荐 UI

**状态新增**：
```jsx
const [providerRec, setProviderRec] = useState(null);
const [recLoading, setRecLoading] = useState(false);
```

**推荐获取 useEffect**（语言变化时触发）：
```jsx
useEffect(() => {
    if (!sourceLanguage || !targetLanguage) return;
    const api = getApi();
    if (!api) return;
    setRecLoading(true);
    api.translation.getProviderRecommend(
        sourceLanguage === 'auto' ? detectLanguage : sourceLanguage,
        targetLanguage,
    ).then(rec => { setProviderRec(rec); setRecLoading(false); })
      .catch(() => { setProviderRec(null); setRecLoading(false); });
}, [sourceLanguage, targetLanguage, detectLanguage]);
```

**UI 改动**：
1. 下拉菜单顶部新增推荐引擎行（`Recommended: google`）
2. 每个非插件引擎旁显示健康状态点（绿 healthy / 黄 degraded / 红 down）
3. 推荐引擎标记 "Best" 绿色徽章 + 成功率百分比
4. 头部 PulseLoader 旁显示可点击 "Best: xxx (nn%)" 标签

**健康点颜色映射**：
```jsx
const healthDot = recProvider
    ? recProvider.status === 'healthy' ? 'bg-green-500'
    : recProvider.status === 'degraded' ? 'bg-yellow-500'
    : 'bg-red-500'
    : 'bg-gray-400';  // unknown or plugin
```

### 3. 数据流

```
TargetArea
  → useEffect [sourceLanguage, targetLanguage]
    → getApi().translation.getProviderRecommend(from, to)
      → client.rpc('services.translation.translate_service', 'provider_recommend', {...})
        → YiAi provider_health(hours=24)
          → MongoDB translation_records 聚合
            ← {recommended: "google", providers: [...], healthy_count: 3, ...}
              → setProviderRec(rec)
                → 渲染健康点 + Best 徽章
```

## 验证步骤

1. 启动 YiAi 后端
2. 打开 YiPot 翻译窗口
3. 切换语言对，观察下拉菜单中引擎旁的健康状态点
4. 确认推荐引擎有 "Best" 徽章和成功率
5. 点击头部 "Best: xxx" 标签，确认切换引擎