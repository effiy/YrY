---

doc_type: module
prd_id: "PO-09-66"
title: "PO-09-66-dev: 分析刷新按钮 — 开发方案"
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

# PO-09-66-dev: 分析刷新按钮 — 开发方案

## 改动清单

### 1. `History/index.jsx` — 新增图标导入

```jsx
import { HiOutlineRefresh } from 'react-icons/hi';
```

### 2. `History/index.jsx` — 添加刷新按钮

在 `flex-1` 和搜索 Input 之间插入：

```jsx
<Button isIconOnly size='sm' variant='light' onPress={loadYiAiStats} title='Refresh YiAi analytics'>
    <HiOutlineRefresh className='text-default-400' size={14} />
</Button>
```

### 3. Stats bar 最终布局

```
[local stats] | [YiAi stats] ....flex-1.... [🔄 refresh] [🔍 search input]
```

## 验证步骤

1. 打开 YiPot History 页面，记录 YiAi 统计值
2. 做几次翻译（产生新的翻译记录）
3. 点击刷新按钮
4. 确认 YiAi 统计数据更新