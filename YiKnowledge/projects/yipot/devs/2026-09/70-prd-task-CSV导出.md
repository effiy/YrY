---

doc_type: module
prd_id: "PO-09-70"
title: "PO-09-70-dev: CSV 导出 — 开发方案"
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

# PO-09-70-dev: CSV 导出 — 开发方案

## 改动

### History/index.jsx

```jsx
const exportCSV = () => {
    const headers = ['Date', 'Source', 'Target', 'Service', 'Text', 'Result'];
    const rows = items.map(item => [
        item.timestamp ? new Date(item.timestamp).toISOString() : '',
        item.source || '', item.target || '', item.service || '',
        `"${(item.text || '').replace(/"/g, '""')}"`,
        `"${(item.result || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `yipot-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
};
```

导出按钮（刷新按钮旁）：
```jsx
<Button isIconOnly size='sm' variant='light' onPress={exportCSV}
    title='Export as CSV' isDisabled={!items.length}>
    <span className='text-default-400 text-xs font-bold'>CSV</span>
</Button>
```

### 效果

工具栏：`[🔄] [CSV] [🔍 Search...]`