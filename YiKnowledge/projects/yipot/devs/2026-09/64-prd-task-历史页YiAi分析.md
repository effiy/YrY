---

doc_type: module
prd_id: "PO-09-64"
title: "PO-09-64-dev: 历史页 YiAi 分析 — 开发方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: task
---

# PO-09-64-dev: 历史页 YiAi 分析 — 开发方案

## 改动清单

### 1. `History/index.jsx` — 新增 YiAi 数据获取

**新增导入**：
```jsx
import { getApi } from '../../../../api/init';
```

**新增状态**：
```jsx
const [yiAiStats, setYiAiStats] = useState(null);
```

**新增 useEffect 调用**：
```jsx
useEffect(() => {
    init(); loadPluginList(); loadStats();
    loadYiAiStats();  // 新增
}, []);

const loadYiAiStats = async () => {
    try {
        const api = getApi();
        if (!api) return;
        const [analytics, topPairs] = await Promise.all([
            api.translation.getAnalytics?.(7).catch(() => null),
            api.translation.getTopLanguagePairs?.(5).catch(() => null),
        ]);
        setYiAiStats({
            translations7d: analytics?.total_translations ?? 0,
            activeLanguages: analytics?.by_target_language?.length ?? 0,
            topPairs: topPairs?.slice(0, 3) ?? [],
        });
    } catch { /* YiAi optional */ }
};
```

### 2. `History/index.jsx` — Stats bar 模板增强

本地统计区右侧新增 YiAi 云端统计区：
```jsx
{yiAiStats && (
    <div className='flex gap-3 text-xs text-default-400 border-l border-default-200 pl-3 ml-1'>
        <span title='Translations via YiAi (7d)'>{yiAiStats.translations7d} Ai tr.</span>
        <span title='Active language pairs'>{yiAiStats.activeLanguages} langs</span>
        {yiAiStats.topPairs?.map((p, i) => (
            <span key={i} className='text-default-500' title={`${p.from}→${p.to}: ${p.count} translations`}>
                {p.from}→{p.to}
            </span>
        ))}
    </div>
)}
```

### 3. 数据流

```
History page mount
  → loadYiAiStats()
    → getApi().translation.getAnalytics(7)
      → YiAi translation_analytics(days=7)
        → MongoDB translation_records 聚合
          ← {total_translations: 142, by_target_language: [...]}
    → getApi().translation.getTopLanguagePairs(5)
      → YiAi top_language_pairs(limit=5)
        → MongoDB 聚合
          ← [{from: "en", to: "zh", count: 45}, ...]
  → setYiAiStats({translations7d, activeLanguages, topPairs})
    → 渲染云端统计区
```

## 验证步骤

1. 启动 YiAi 后端
2. 打开 YiPot History 页面
3. 确认本地统计旁显示云端统计区
4. 关闭 YiAi，确认仅显示本地统计