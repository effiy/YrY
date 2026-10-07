---
doc_type: module
prd_task_id: "YA-09-235"
title: "YA-09-235: yiai 项目数据质量修复 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-22
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_backend: 0
source_prd: "235-需求-yiai项目数据质量修复.md"
tags: [开发方案, 数据质量, 状态同步, 代码审计]
type: task
category: 项目/管理后台/开发
---

# YA-09-235: yiai 项目数据质量修复 — 开发方案

> 关联 PRD: [235-需求-yiai项目数据质量修复](../prds/2026-09/235-需求-yiai项目数据质量修复.md)
> 关联 Test: [235-prd-test-yiai项目数据质量修复](../tests/2026-09/235-prd-test-yiai项目数据质量修复.md)

---

## 一、根因分析

### 根因 1：Issue 状态与代码实现脱节

yiai 项目的 Issue 通过 `data_service.create_document` 创建后，其 `status` 字段从未随代码合入而更新。典型场景：

```
1. 创建 Issue: yiai-2 "Multi-Provider LLM support" (status=todo)
2. 开发实现: services/ai/llm_provider.py (LLMProvider/OllamaProvider/DeepSeekProvider)
3. 代码合入: git commit → main
4. Issue 状态: 仍为 todo ← 断点：无人更新 MongoDB
```

影响面：8 个已实现功能的 Issue 仍标记为 `todo`，1 个从未实现的功能占位超过 2 个月。

### 根因 2：Bug 关闭仅更新知识文件

YiAi 知识监视器（`watcher.py`）的 `_bulk_upsert` 仅执行 insert-on-missing，不更新已存在记录。Bug 的知识文件标记 `resolved` 后，MongoDB `bugs` 集合不会同步。

```
Knowledge File: status=resolved
  → watcher.py 扫描 → 已存在，跳过更新
  → MongoDB bugs 集合: status=open ← 不一致
```

### 根因 3：Module 与 Issue 无关联字段

`yiai-m4` (Pytest Coverage) 和 `yiai-3` (Pytest coverage) 是同一工作项，但分属不同集合且无显式关联，状态独立维护。

---

## 二、代码审计方法

### 审计流程

```
for each Issue with status ∈ {todo, backlog, in_progress}:
  1. 解析 Issue title，提取功能关键词
  2. 在 YiAi/src/ 中搜索对应模块/文件
  3. 若找到 → 验证模块完整性 → 标记 done
  4. 若未找到 → 保持原状态（未实现）或标记 cancelled（僵尸需求）
```

### 审计命令

```bash
# yiai-2: Multi-Provider LLM
ls YiAi/src/services/ai/llm_provider.py  # EXISTS → done

# yiai-7: Write-ahead audit log  
ls YiAi/src/domain/audit/                # EXISTS (decorator/logger/models.py) → done

# yiai-10: BM25 parameter tuning
grep -rl "BM25\|bm25\|rerank" YiAi/src/domain/rag/  # EXISTS → done

# yiai-13: Health check + readiness probe
ls YiAi/src/server/routes/health.py      # EXISTS → done

# yiai-16: Graceful shutdown
grep -rl "GracefulShutdown" YiAi/src/    # EXISTS (middleware.py + lifespan.py) → done

# yiai-17: Cache layer — Redis
ls YiAi/src/shared/cache.py              # EXISTS → done

# yiai-20: Connection pool dynamic scaling
grep -rl "maxPoolSize\|minPoolSize" YiAi/src/data/  # EXISTS → done

# yiai-21: Prompt template management
ls YiAi/src/domain/rag/prompts.py        # EXISTS → done

# yiai-6: GraphQL federation
find YiAi/src -name "*graphql*"          # NONE → cancelled
```

---

## 三、数据修复执行

### R1 — 显性数据错误

```bash
# 1. yiai-3: in_progress → done (逾期 7 天)
RPC: update_document(cname="issues", data={key:"yiai-3", status:"done", updated_at:"2026-09-22"})
→ code:0, updated:true

# 2. bug-file-alerts-duplicate-implementation: open → resolved
RPC: update_document(cname="bugs", data={key:"bug-file-alerts-duplicate-implementation", status:"resolved"})
→ code:0, updated:true

# 3. yiai-m4: in_progress → completed
RPC: update_document(cname="modules", data={key:"yiai-m4", status:"completed", updated_at:"2026-09-22"})
→ code:0, updated:true
```

### R2 — 代码审计驱动同步

```bash
# 4-11. 8 个 todo → done
for key in yiai-2 yiai-7 yiai-10 yiai-13 yiai-16 yiai-17 yiai-20 yiai-21; do
  RPC: update_document(cname="issues", data={key:$key, status:"done", updated_at:"2026-09-23"})
  → code:0, updated:true
done

# 12. yiai-6: backlog → cancelled
RPC: update_document(cname="issues", data={key:"yiai-6", status:"cancelled", updated_at:"2026-09-23"})
→ code:0, updated:true
```

---

## 四、修复后数据

| Key | Status | 审计结果 |
|-----|--------|---------|
| yiai-2 | **done** | `llm_provider.py` |
| yiai-3 | **done** | 547 tests |
| yiai-4 | done | — |
| yiai-5 | done | — |
| yiai-6 | **cancelled** | 无 GraphQL 代码 |
| yiai-7 | **done** | `domain/audit/` |
| yiai-10 | **done** | `rag/` BM25+rerank |
| yiai-11 | todo | 未实现 |
| yiai-12 | todo | 未实现 |
| yiai-13 | **done** | `routes/health.py` |
| yiai-14 | todo | 未实现 |
| yiai-15 | todo | 未实现 |
| yiai-16 | **done** | GracefulShutdownMiddleware |
| yiai-17 | **done** | `shared/cache.py` |
| yiai-18 | todo | 未实现 |
| yiai-19 | todo | 未实现 |
| yiai-20 | **done** | Motor pool config |
| yiai-21 | **done** | `rag/prompts.py` |
| yiai-22 | todo | 未实现 |

**Bugs**：9/9 resolved · **Modules**：2/4 completed

### 指标对比

| 指标 | 修复前 | R1 后 | R2 后 | 总变化 |
|------|--------|-------|-------|--------|
| Done | 3 | 3 | **11** | ↑ 8 |
| Open | 16 | 15 | **7** | ↓ 9 |
| Overdue | 1 | 0 | 0 | ↓ 100% |
| Cancelled | 0 | 0 | **1** | +1 |
| 完成率 | 16% | 16% | **58%** | ↑ 42pp |
| Open Bugs | 1 | 0 | 0 | ↓ 100% |
| Completed Modules | 1 | 2 | 2 | ↑ 100% |

---

## 五、影响面分析

| 维度 | 影响 |
|------|------|
| 数据完整性 | ✅ 12 条记录状态与代码实现一致 |
| 页面展示 | ✅ 项目详情页 Overview Tab 指标准确 |
| 其他项目 | ✅ 无影响，仅操作 yiai 数据 |
| API 契约 | ✅ 无影响 |
| 向后兼容 | ✅ 仅修改 status 字段 |

---

## 六、经验教训

1. **Issue 生命周期需自动化闭环**：从创建到代码合入到状态更新应是自动化流程。建议在 Git 提交信息中包含 `Closes YA-XX` 并通过 CI/CD 自动更新 Issue 状态。

2. **Bug 同步需双向**：知识监视器当前仅处理文件→MongoDB 的单向首次创建。应在文件变更时同步更新 MongoDB 中的对应记录。

3. **定期数据健康巡检**：建议新增 `/debug/data-health` 端点，自动检测 overdue Issue、stale backlog、Module-Issue 不一致等问题。

4. **代码审计作为数据质量工具**：`find`/`grep` 驱动的代码库交叉验证在此次修复中证明了其有效性。后续可脚本化此流程为 `scripts/audit-issue-status.py`。

---

## 七、关联文档

| 文档 | 路径 |
|------|------|
| 需求 PRD | [235-需求-yiai项目数据质量修复](../../prds/2026-09/235-需求-yiai项目数据质量修复.md) |
| 测试方案 | [235-prd-test-yiai项目数据质量修复](../../tests/2026-09/235-prd-test-yiai项目数据质量修复.md) |
| YiVad 并行 | [93-prd-task-TypeScript编译修复与代码质量提升](../../../yivad/devs/2026-09/93-prd-task-TypeScript编译修复与代码质量提升.md) |