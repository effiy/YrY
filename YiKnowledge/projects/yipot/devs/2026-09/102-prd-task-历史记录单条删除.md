---

doc_type: task
prd_task_id: "PO-09-102"
title: "PO-09-102: 历史记录单条删除 — 技术设计"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prd: "57-prd-历史记录单条删除.md"

type: task
---

# PO-09-102: 单条删除 — 技术设计

## 实现

```javascript
const deleteSingle = async (id) => {
  const db = await Database.load('sqlite:history.db');
  await db.execute('DELETE FROM history WHERE id=$1', [id]);
  await loadStats(); await getData();
};
```

React：`<Button isIconOnly color="danger" onPress={() => { if (confirm('Delete?')) deleteSingle(item.id); }}>`
图标：`MdDeleteOutline`（react-icons/md，项目已有）