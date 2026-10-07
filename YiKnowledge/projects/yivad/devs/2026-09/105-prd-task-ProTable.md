---

title: "ProTable"
doc_type: task
prd_task_id: "YV-09-105"

type: task
status: 待开始
---

# YV-09-105: ProTable — 技术设计

## 实现

**文件**：`src/components/ProTable/` + `src/hooks/useTable.ts`

**数据流**：columns + requestApi → callService("services.database.data_service", "query_documents", {cname, filter, pageNum, pageSize}) → YiAi → MongoDB → {list, total} → el-table rows + el-pagination

**useTable**：封装 loading/error/data/pagination 状态管理

## 非功能需求

| 维度 | 实现 |
|------|------|
| 通用性 | 19 个 View 模块消费 |
| 约束 | 强制使用（code review 检查） |