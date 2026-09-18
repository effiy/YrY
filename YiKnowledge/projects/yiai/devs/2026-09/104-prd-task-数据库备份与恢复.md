---
doc_type: module
prd_task_id: "YA-09-55"
title: "YA-09-55: 数据库备份与恢复 — mongodump + 定时调度 + 灾备演练 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "104-需求-数据库备份与恢复.md"
source_okr: [yiai-001]
---

# YA-09-55: 数据库备份与恢复 — mongodump + 定时调度 + 灾备演练 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[104-需求-数据库备份与恢复.md](../../prds/2026-09/104-需求-数据库备份与恢复.md)
> 需求编号：YA-09-55 · 优先级：P1 · 人天：1.5d · 状态：已完成

---

<a id="sec-1"></a>
## 一、方案

通过 apscheduler 定时触发 `mongodump`，备份到本地或 OSS。保留最近 7 天日备 + 4 周周备。

```python
async def backup_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = f"/backups/mongo_{timestamp}.gz"
    proc = await asyncio.create_subprocess_exec(
        "mongodump", f"--uri={settings.mongo_url}", f"--archive={path}", "--gzip",
    )
    await proc.wait()
    # 上传到 OSS
    await oss.upload(path, f"backups/{timestamp}.gz")

# apscheduler 定时任务
scheduler.add_job(backup_database, "cron", hour=3, minute=0)  # 每日凌晨 3 点
```

### 备份策略

| 频率 | 保留 | 存储 |
|------|------|------|
| 每日 | 7 天 | 本地 + OSS |
| 每周 | 4 周 | OSS |
| 手动 | 永久 | OSS |

### 恢复验证

```bash
mongorestore --uri=mongodb://localhost:27017 --archive=backup.gz --gzip --drop
```
每月自动执行恢复验证到临时库，确保备份可用。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | mongodump 定时调度 | 每日凌晨备份文件生成 | 0.5 |
| 2 | OSS 上传 + 保留策略 | OSS 可见多版本备份 | 0.5 |
| 3 | 恢复验证 + 灾备演练 + 测试 | 备份可成功恢复 | 0.5 |

**合计：1.5d**。

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |
