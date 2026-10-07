---
doc_type: test
prd_task_id: "YA-09-235"
title: "YA-09-235: yiai 项目数据质量修复 — 测试用例"
status: 已完成
priority: P1
owner: Chengliang.Yi
source_prds: ["YA-09-235"]
source_modules: ["YA-09-235"]
source_okr: []
created: 2026-09-22
updated: 2026-09-23
project: YiAi
type: test
tags: [测试用例, 数据质量, 状态同步, API验证, 代码审计]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L3 API 验证 + L4 手动验证 13 用例全部通过"
test_execution_date: 2026-09-23
---

# YA-09-235: yiai 项目数据质量修复 — 测试用例

> 来源 PRD：[235-需求-yiai项目数据质量修复](../../prds/2026-09/235-需求-yiai项目数据质量修复.md)
> 来源 Dev：[235-prd-task-yiai项目数据质量修复](../../devs/2026-09/235-prd-task-yiai项目数据质量修复.md)
> 需求编号：YA-09-235

> **文档职责**：本文档定义**如何验证、验证什么、验证结果**（VERIFY）。

---

## 目录

- [一、测试范围与策略](#sec-1)
- [二、L3 API — 数据指标验证](#sec-2)
- [三、L4 端到端 — 页面展示验证](#sec-3)
- [四、回归用例](#sec-4)
- [五、追溯矩阵](#sec-5)

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 工具 | 覆盖内容 | 用例数 | 通过率 |
|------|------|---------|--------|--------|
| L3 API | curl + python3 | 3 个集合 7 项指标 | 8 | 100% |
| L4 手动 | Chrome 128+ | `/project/yiai` 页面 3 项展示 | 3 | 100% |
| 回归 | curl | 其他项目 + 幂等性 | 2 | 100% |

### 测试环境

| 维度 | 配置 |
|------|------|
| 后端 | YiAi :10086（MongoDB 连接正常） |
| 前端 | YiVad :8848（dev server） |
| 数据 | yiai 项目 19 Issues + 9 Bugs + 4 Modules |

---

<a id="sec-2"></a>
## 二、L3 API — 数据指标验证

### TC-01：Done Issues = 11

| 属性 | 值 |
|------|-----|
| 验证命令 | `query_documents(cname="issues", filter={project_key:"yiai"})` → 统计 `status="done"` |
| 预期结果 | 11 |
| 实际结果 | ✅ 11 |

```bash
curl -s http://localhost:10086/ -H 'Content-Type: application/json' \
  -d '{"module_name":"services.database.data_service","method_name":"query_documents",
       "parameters":{"cname":"issues","filter":{"project_key":"yiai"},"pageSize":200}}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);issues=d['data']['list'];print('Done:',sum(1 for i in issues if i['status']=='done'))"
# Output: Done: 11
```

### TC-02：Open Issues = 7

| 属性 | 值 |
|------|-----|
| 验证命令 | 同上，统计 `status NOT IN (done, cancelled)` |
| 预期结果 | 7 |
| 实际结果 | ✅ 7 |

### TC-03：Overdue Issues = 0

| 属性 | 值 |
|------|-----|
| 验证命令 | 同上，统计 `status NOT IN (done,cancelled) AND due_date < "2026-09-23"` |
| 预期结果 | 0 |
| 实际结果 | ✅ 0 |

### TC-04：Open Bugs = 0

| 属性 | 值 |
|------|-----|
| 验证命令 | `query_documents(cname="bugs", filter={project:"yiai"})` → 统计 `status IN (open,reopened)` |
| 预期结果 | 0 |
| 实际结果 | ✅ 0 |

### TC-05：Completed Modules = 2

| 属性 | 值 |
|------|-----|
| 验证命令 | `query_documents(cname="modules", filter={project_key:"yiai"})` → 统计 `status="completed"` |
| 预期结果 | 2 |
| 实际结果 | ✅ 2 (yiai-m2, yiai-m4) |

### TC-06：Cancelled Issues = 1

| 属性 | 值 |
|------|-----|
| 验证命令 | 同 TC-01，统计 `status="cancelled"` |
| 预期结果 | 1 (yiai-6) |
| 实际结果 | ✅ 1 |

### TC-07：完成率 = 58%

| 属性 | 值 |
|------|-----|
| 前置条件 | Done=11, Total=19 |
| 预期结果 | 11/19 ≈ 58% |
| 实际结果 | ✅ 58% |

### TC-08：全部 Issue 状态快照

| Key | 期望 Status | 实际 |
|-----|------------|------|
| yiai-2 | done | ✅ |
| yiai-3 | done | ✅ |
| yiai-4 | done | ✅ |
| yiai-5 | done | ✅ |
| yiai-6 | cancelled | ✅ |
| yiai-7 | done | ✅ |
| yiai-10 | done | ✅ |
| yiai-11 | todo | ✅ |
| yiai-12 | todo | ✅ |
| yiai-13 | done | ✅ |
| yiai-14 | todo | ✅ |
| yiai-15 | todo | ✅ |
| yiai-16 | done | ✅ |
| yiai-17 | done | ✅ |
| yiai-18 | todo | ✅ |
| yiai-19 | todo | ✅ |
| yiai-20 | done | ✅ |
| yiai-21 | done | ✅ |
| yiai-22 | todo | ✅ |

---

<a id="sec-3"></a>
## 三、L4 端到端 — 页面展示验证

### TC-09：Overview Tab — 数据正常展示

| 属性 | 值 |
|------|-----|
| 操作步骤 | 打开 `http://localhost:8848/#/project/yiai`，等待加载 |
| 预期结果 | 页面无控制台错误，Overview Tab 正常渲染 |
| 实际结果 | ✅ 通过 |

### TC-10：Todo List — 仅含 7 个待办项

| 属性 | 值 |
|------|-----|
| 操作步骤 | 查看右侧 Todo List |
| 预期结果 | 不含任何 status=done 或 cancelled 的 Issue，不含 open Bug |
| 实际结果 | ✅ 通过 |

### TC-11：项目列表页 — yiai 卡片指标正确

| 属性 | 值 |
|------|-----|
| 操作步骤 | 打开 `http://localhost:8848/#/project`，找到 yiai 卡片 |
| 预期结果 | 完成率 58%，无逾期/开放 Bug 警告标记 |
| 实际结果 | ✅ 通过 |

---

<a id="sec-4"></a>
## 四、回归用例

### TC-R1：其他项目数据不受影响

| 属性 | 值 |
|------|-----|
| 操作步骤 | 查询 yivad / yipet Issues/Bugs/Modules |
| 预期结果 | 数据与修复前一致 |
| 实际结果 | ✅ 通过 |

### TC-R2：RPC API 幂等性

| 属性 | 值 |
|------|-----|
| 操作步骤 | 对已修复的 key 重复执行 `update_document`（相同 status） |
| 预期结果 | `code:0, updated:true`，数据不变 |
| 实际结果 | ✅ 通过 |

---

<a id="sec-5"></a>
## 五、追溯矩阵

| 用例 | 覆盖 AC | 类型 | 状态 |
|------|---------|------|------|
| TC-01 | AC-1 (Done=11) | L3 API | ✅ |
| TC-02 | AC-2 (Open=7) | L3 API | ✅ |
| TC-03 | AC-3 (Overdue=0) | L3 API | ✅ |
| TC-04 | AC-4 (Open Bugs=0) | L3 API | ✅ |
| TC-05 | AC-5 (Completed Modules=2) | L3 API | ✅ |
| TC-06 | AC-6 (Cancelled=1) | L3 API | ✅ |
| TC-07 | AC-7 (完成率=58%) | L3 API | ✅ |
| TC-08 | 全量快照 | L3 API | ✅ |
| TC-09 | AC-8 (页面渲染) | L4 Manual | ✅ |
| TC-10 | AC-8 (Todo List) | L4 Manual | ✅ |
| TC-11 | AC-9/10 (列表页) | L4 Manual | ✅ |
| TC-R1 | 回归 — 其他项目 | L3 API | ✅ |
| TC-R2 | 回归 — 幂等性 | L3 API | ✅ |

**结论**：全部 13 项测试通过，数据质量修复达到验收标准。