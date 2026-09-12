---
doc_type: test
title: "YV-09-135: 数据导出计划 — 定时导出配置、周期导出任务、导出格式/筛选/目标、导出历史、导出失败告警、导出配额管理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-135"
source_prds: ["65-prd-数据导出计划"]
source_modules: []
---
# YV-09-135: 数据导出计划 — 定时导出配置、周期导出任务、导出格式/筛选/目标、导出历史、导出失败告警、导出配额管理 — 测试规格

> 来源 PRD：[65-prd-数据导出计划.md](../../prds/2026-09/65-prd-数据导出计划.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：创建每周导出计划

**GIVEN** 用户登录，访问导出计划页面
**WHEN** 用户创建导出计划：名称"周报 Bug 导出"、数据源 bugs、格式 Excel、每周一 08:00、下载链接
**THEN** 计划创建成功，状态 active，next_run_at 为下周一 08:00
**AND** 列表中显示该计划

### 场景 2：定时导出自动执行

**GIVEN** 一个 active 状态的周报导出计划，next_run_at 已到
**WHEN** ExportScheduler 轮询检测到该计划
**THEN** 创建 export_jobs 记录，status=running
**AND** 分页查询 bugs 数据，流式写入 Excel 文件
**AND** job status 更新为 completed，包含 row_count、file_size、download_url
**AND** 用户收到通知：导出完成，附下载链接
**AND** 计划的 last_run_at 更新，next_run_at 更新为下周

### 场景 3：导出失败自动重试

**GIVEN** 一个导出计划，max_retries=3，retry_delay=5min
**WHEN** 导出执行时数据库查询超时（第一次尝试失败）
**THEN** job status 为 failed，retry_count=1
**AND** 5 分钟后自动重试
**AND** 如果重试 3 次仍失败，发送失败告警通知用户

### 场景 4：配额不足阻止导出

**GIVEN** 用户本日已导出 8 次（每日配额 10 次），本次导出预计 60,000 行
**WHEN** ExportScheduler 尝试执行，配额检查发现超过 max_rows=50,000
**THEN** 导出被跳过
**AND** 用户收到通知："导出计划'XX'跳过执行，原因：预计数据行数 60,000 超过配额 50,000"

### 场景 5：暂停和恢复导出计划

**GIVEN** 一个 active 状态的导出计划
**WHEN** 用户点击"暂停"
**THEN** 计划 status 变为 paused，不再被调度器执行
**WHEN** 用户点击"恢复"
**THEN** 计划 status 变为 active，next_run_at 重新计算

### 场景 6：查看导出历史并下载文件

**GIVEN** 一个已完成 5 次导出的计划
**WHEN** 用户访问导出历史页面
**THEN** 显示 5 条历史记录，按执行时间倒序
**AND** 每条记录显示执行时间、状态、行数、文件大小
**AND** 已完成的任务可点击下载
**AND** 失败的任务可点击重试

---

