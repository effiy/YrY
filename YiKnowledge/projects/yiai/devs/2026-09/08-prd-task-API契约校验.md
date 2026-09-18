---
doc_type: module
prd_task_id: "YA-09-03"
title: "YA-09-03: API 契约校验 — RPC 参数白名单 + 未知参数 WARNING — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "08-需求-API契约校验.md"
source_okr: [yiai-001]
related_tests: ["08-prd-test-API契约校验"]
---

# YA-09-03: API 契约校验 — RPC 参数白名单 + 未知参数 WARNING — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[08-需求-API契约校验.md](../../prds/2026-09/08-需求-API契约校验.md)
> 需求编号：YA-09-03 · 优先级：P0 · 人天：2.0d · 状态：已完成

---

<a id="sec-1"></a>
## 一、问题背景

`filter` vs `query`、`target_file` vs `path` 等参数名不匹配是最常见的跨项目 bug。当前后端**静默忽略**未知参数，前端传错参数名时无任何提示。

---

<a id="sec-2"></a>
## 二、方案

### 2.1 参数白名单

```python
# 每个 RPC 方法声明允许的参数
METHOD_PARAMS = {
    "data_service.query_documents": {"cname", "collection_name", "filter", "pageNum", "pageSize", ...},
    "chat_service.chat": {"messages", "model", "stream", "session_key"},
}
```

### 2.2 未知参数检测

```python
def validate_params(method: str, params: dict):
    allowed = METHOD_PARAMS.get(method, set())
    unknown = set(params.keys()) - allowed
    if unknown:
        logger.warning(f"Unknown params for {method}: {unknown}")
        # 可选：strict 模式下拒绝请求
```

### 2.3 已知陷阱模式

| 方法 | 正确参数 | 常见错误 | 检测 |
|------|---------|---------|------|
| `query_documents` | `filter` | `query` | WARNING + 建议 |
| `/read-file` | `target_file` | `path` | WARNING + 建议 |
| `query_documents` | `cname` | `collection_name` | 无（两者均合法） |

---

<a id="sec-3"></a>
## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | 参数白名单注册机制 | RPC 方法可注册参数契约 | 0.5 |
| 2 | 未知参数检测 + WARNING | 传 `query` 时日志可见 WARNING | 0.75 |
| 3 | strict 模式（可选拒绝） + CI 集成 | CI 中检测参数漂移 | 0.75 |

**合计：2.0d**。

---

<a id="sec-4"></a>
## 四、关联模块

- 依赖：[YA-07-03 RPC 信封协议](../2026-07/03-prd-task-RPC信封协议.md)
- 下游：[YA-09-14 RPC 契约测试](./14-prd-task-RPC契约测试与类型同步.md)

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 参数白名单手动维护 | P3 | 0.2 | 新 RPC 方法需手动注册参数 | 待实施（装饰器自动注册） |
| 2 | 未知参数仅 WARNING | P3 | 0.1 | 未升级为 ERROR（兼容过渡期） | 待升级 |
| — | 无 | — | — | — | — |
