---

doc_type: module
prd_task_id: "YP-09-04"
title: "YP-09-04: API 架构合规 — ApiClient 强制代理 + ESLint 拦截 + RPC 参数名 CI 检查 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "11-合规-API架构.md"
source_okr: [yipet-001]

type: task
---

# YP-09-04: API 架构合规 — 开发方案

> 来源 PRD：[11-合规-API架构.md](../../prds/2026-09/11-合规-API架构.md)
> 需求编号：YP-09-04 · 优先级：P1 · 人天：2.0d

---

## 一、方案概述

部分组件绕过 ApiClient 直接用 `fetch()` 发送 RPC 请求，参数名错误（`query`/`path`/`collection_name`）被后端静默忽略。本方案通过 ESLint 规则在编译期强制使用 ApiClient，CI 静态检查参数名契约。

### 修复策略：编译期强制 > 人工审查

```
ESLint no-restricted-imports
  └── 禁止 import { fetch } from ... (仅允许 api-client.ts)
ESLint no-restricted-syntax
  └── 禁止直接调用 fetch( (允许 this.apiClient.fetch)
CI grep 检查
  ├── grep -r '"query"' src/api/ → 必须零匹配
  ├── grep -r '"path"' src/api/services/ → 必须零匹配
  └── grep -r 'collection_name' src/api/ → 必须零匹配
TypeScript 类型约束
  └── ApiClient.call 参数名使用字符串字面量联合类型
```

---

## 二、核心模块设计

### 2.1 ESLint 规则

```javascript
// eslint.config.mjs
export default [{
  files: ["src/**/*.ts", "src/**/*.vue"],
  rules: {
    // 禁止直接调用全局 fetch——必须通过 ApiClient
    "no-restricted-syntax": ["error", {
      selector: "CallExpression[callee.name='fetch']",
      message: "Use ApiClient.call() instead of direct fetch(). All HTTP requests must go through the 4-Tier API architecture.",
    }],
    // 禁止导入 fetch 相关模块到组件层
    "no-restricted-imports": ["error", {
      patterns: [{
        group: ["**/api/client.ts"],
        importNames: ["fetch"],
        message: "Import ApiClient from '@/api' instead.",
      }],
    }],
  },
}, {
  // api/client.ts 本身可以使用 fetch
  files: ["src/api/client.ts"],
  rules: {
    "no-restricted-syntax": "off",
  },
}];
```

### 2.2 CI 参数名契约检查

```bash
#!/bin/bash
# scripts/check-rpc-contract.sh
ERRORS=0

echo "=== RPC Parameter Contract Check ==="

# 检查 query → filter
if grep -rq '"query"' src/api/ --include="*.ts"; then
  echo "ERROR: Found 'query' parameter. Use 'filter' instead."
  grep -rn '"query"' src/api/ --include="*.ts"
  ERRORS=$((ERRORS+1))
fi

# 检查 path → target_file
if grep -rq '"path"' src/api/services/ --include="*.ts"; then
  echo "ERROR: Found 'path' parameter in services. Use 'target_file' instead."
  ERRORS=$((ERRORS+1))
fi

# 检查 collection_name → cname
if grep -rq 'collection_name' src/api/ --include="*.ts"; then
  echo "ERROR: Found 'collection_name'. Use 'cname' instead."
  ERRORS=$((ERRORS+1))
fi

# 检查组件层裸 fetch
if grep -rq 'fetch(' src/ --include="*.vue"; then
  echo "ERROR: Direct fetch() found in Vue components."
  grep -rn 'fetch(' src/ --include="*.vue"
  ERRORS=$((ERRORS+1))
fi

echo "=== Result: $ERRORS error(s) ==="
exit $ERRORS
```

### 2.3 TypeScript 类型约束

```typescript
// src/api/types.ts — RPC 参数名联合类型
type RpcParameterName =
  // data_service 参数
  | "filter"      // ✓ 正确
  // | "query"    // ✗ 错误 — 编译时报错
  | "cname"       // ✓ 正确
  // | "collection_name" // ✗ 错误
  // 文件操作参数
  | "target_file" // ✓ 正确
  // | "path"     // ✗ 错误
  ;
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | ESLint 规则配置 (no-restricted-syntax + imports) | `eslint.config.mjs` | `fetch("...")` in .vue → ESLint error | 0.5 |
| 2 | CI 参数名契约检查脚本 | `scripts/check-rpc-contract.sh` | CI 中 grep 检查零违规 | 0.5 |
| 3 | TypeScript 类型约束 | `types.ts` | 错误参数名 → tsc 编译报错 | 0.25 |
| 4 | 已有代码修复 + 回归测试 | 各 Service 文件 | 零 ESLint error + CI 检查通过 | 0.75 |

**合计：2.0d**

## 四、完成定义

- [ ] ESLint 拦截直接 `fetch(` 调用 (组件层)
- [ ] `grep -r '"query"' src/api/` 零匹配
- [ ] `grep -r '"path"' src/api/services/` 零匹配
- [ ] `grep -r 'collection_name' src/api/` 零匹配
- [ ] `grep -r 'fetch(' src/ --include="*.vue"` 零匹配
- [ ] CI 中 `check-rpc-contract.sh` 零错误
- [ ] `tsc --noEmit` 零错误