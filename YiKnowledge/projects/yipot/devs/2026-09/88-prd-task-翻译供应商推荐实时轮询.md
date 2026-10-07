---
prd_task_id: "YT-09-88"
title: "YT-09-88: 翻译供应商推荐实时轮询 — YiPot 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.1
source_prd: "YA-09-122"
tags: [开发方案, 翻译引擎, 实时轮询, 供应商推荐, 健康状态]
type: task
category: 项目/桌面翻译/开发
source: YiPot
benefit: "翻译引擎下拉菜单中供应商健康状态 60s 自动刷新，用户始终看到最新成功率"
lifecycle: active
---

# YT-09-88: 翻译供应商推荐实时轮询 — YiPot 开发方案

> 关联 PRD: [YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)
> 关联: [YT-09-87 useProviderHealth hook](../../devs/2026-09/87-prd-task-翻译引擎健康实时轮询.md)

## 问题诊断

TargetArea 的供应商推荐（`getProviderRecommend()`）仅在语言切换时获取：
```js
useEffect(() => {
    // ... only re-fetches when sourceLanguage/targetLanguage/detectLanguage change
}, [sourceLanguage, targetLanguage, detectLanguage]);
```

翻译过程中引擎状态可能变化（某引擎宕机、成功率波动），但下拉菜单中的健康状态直到下次语言切换才更新。

## 修改清单

| # | 文件 | 变更 |
|---|------|------|
| 1 | `TargetArea/index.jsx` | `getProviderRecommend()` useEffect 新增 60s 定时轮询 + cleanup |

## 实现要点

```jsx
useEffect(() => {
    if (!sourceLanguage || !targetLanguage) return;
    const api = getApi();
    if (!api) return;

    const fetchRec = () => {
        setRecLoading(true);
        api.translation.getProviderRecommend(
            sourceLanguage === 'auto' ? detectLanguage : sourceLanguage,
            targetLanguage,
        ).then(rec => {
            setProviderRec(rec);
            setRecLoading(false);
        }).catch(() => {
            setProviderRec(null);
            setRecLoading(false);
        });
    };

    fetchRec();                                          // 立即获取
    const timer = setInterval(fetchRec, 60_000);         // 60s 轮询
    return () => clearInterval(timer);                   // 卸载/依赖变化时清理
}, [sourceLanguage, targetLanguage, detectLanguage]);
```

关键改进：
- 提取 `fetchRec` 为独立函数，在首次和定时器中复用
- `setInterval` 返回的 timer 在 cleanup 中 `clearInterval`
- 依赖变化时（语言切换）旧 timer 自动清理，新 timer 重新开始

## 与全局健康轮询的关系

| 数据 | 来源 | 粒度 | 更新 |
|------|------|------|------|
| `useProviderHealth()` | `getProviderHealth(24)` | 全局（所有语言对） | 60s |
| `providerRec` | `getProviderRecommend(from, to)` | 当前语言对 | 60s + 语言切换 |

两者互补：全局健康提供整体引擎状态，当前语言对推荐提供针对性排名。

## 验证

- `pnpm build` ✅ Vite 构建通过
- 打开 YiPot 翻译窗口 → 验证引擎下拉菜单显示健康圆点 + 成功率
- 等待 60s → 验证成功率数据自动刷新
- 切换语言对 → 验证旧 timer 清理，新 timer 启动（React DevTools profiler）