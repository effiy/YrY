---
doc_type: test
title: "YA-09-14: RPC 契约测试与类型同步 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-14"
source_prds: ["14-需求-RPC契约测试与类型同步"]
source_modules: ["14-prd-task-RPC契约测试与类型同步"]
source_okr: [yiai-001]
---

# YA-09-14: RPC 契约测试与类型同步 — 测试规格

> 来源 PRD：[14-需求-RPC契约测试与类型同步.md](../../prds/2026-09/14-需求-RPC契约测试与类型同步.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CT-01 | Python 方法签名 → 契约导出 | `def query(cname, filter)` → `{cname: str, filter: dict}` |
| UT-CT-02 | TS 调用 `{query: "x"}` → CI 拦截 | 参数名不匹配契约 → CI 失败 |
| UT-CT-03 | 契约文件版本一致性检查 | 契约版本 ≠ 实际签名 → CI 失败 |
| UT-CT-04 | pre-commit hook 检测漂移 | 提交漂移参数 → 拒绝提交 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 契约检测漏报 → 参数名漂移未被发现 |

---