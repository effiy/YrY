---

doc_type: test
title: "YP-09-04: API 架构合规 — ApiClient 强制代理 + RPC 参数名契约 — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-04"
source_prds: ["11-合规-API架构"]
source_modules: ["04-prd-task-API架构合规"]

type: test
---

# YP-09-04: API 架构合规 — 测试规格

## 一、静态检查 (CI 自动化)

| 编号 | 检查 | 命令 | 期望 |
|------|------|------|------|
| TC-API-S01 | 禁止组件层裸 fetch | `grep -r 'fetch(' src/ --include="*.vue"` | 零匹配 |
| TC-API-S02 | 参数名 filter 非 query | `grep -r '"query"' src/api/ --include="*.ts"` | 零匹配 |
| TC-API-S03 | 参数名 target_file 非 path | `grep -r '"path"' src/api/services/ --include="*.ts"` | 零匹配 |
| TC-API-S04 | 参数名 cname | `grep -r 'collection_name' src/api/ --include="*.ts"` | 零匹配 |
| TC-API-S05 | ESLint 拦截 fetch( | 组件 .vue 中写 `fetch("...")` | ESLint error |

## 二、完成定义

- [ ] TC-API-S01~05 全部通过
- [ ] CI `check-rpc-contract.sh` 零错误退出
- [ ] `tsc --noEmit` 零错误