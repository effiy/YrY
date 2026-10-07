---

doc_type: task
prd_task_id: "YV-09-102"
title: "YV-09-102: CSV 导出 — 技术设计"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.1
source_prd: "102-prd-翻译数据CSV导出.md"

type: task
---

# YV-09-102: CSV 导出 — 技术设计

## 实现

```typescript
function exportCsv() {
  const header = "Provider,Calls,Success,Success Rate";
  const rows = providerData.value.map(p =>
    `${p.provider},${p.count},${p.success},${((p.success/p.count)*100).toFixed(1)}%`);
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `translation-providers-${date}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
```

零依赖，纯浏览器 API。