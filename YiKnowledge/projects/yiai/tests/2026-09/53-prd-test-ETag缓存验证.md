---

doc_type: test
title: "YA-09-49: 服务端 ETag 缓存验证 — 条件请求与 304 响应优化重复传输 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-49"
source_prds: ["53-需求-ETag缓存验证"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-49: 服务端 ETag 缓存验证 — 测试规格

> **文档职责**：本文档定义 ETag 缓存验证的**怎么验证**（VERIFY），覆盖 ETag 生成、If-None-Match、304 Not Modified 和缓存一致性。

> 来源 PRD：[53-需求-ETag缓存验证.md](../../prds/2026-09/53-需求-ETag缓存验证.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | ETag 生成算法、哈希计算 | pytest | ETag 格式、冲突概率 |
| L2 集成 | 条件请求 + FastAPI 中间件 | pytest + httpx | 304 响应、If-None-Match 处理 |

### 1.2 测试数据

```python
@pytest.fixture
def sample_resource():
    """资源版本 1。"""
    return {"id": 1, "name": "test", "version": "v1", "data": "hello"}

@pytest.fixture
def sample_resource_v2():
    """资源版本 2（内容已变）。"""
    return {"id": 1, "name": "test", "version": "v2", "data": "hello world"}
```

---

## 二、测试用例

### 2.1 ETag 生成

#### TC-ETAG-001: 首次响应包含 ETag

| **ID** | TC-ETAG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. GET 资源（无 If-None-Match） |
| **预期结果** | - 响应 header 包含 `ETag: "abc123..."`<br/>- ETag 为带引号的哈希值<br/>- HTTP 200 |

#### TC-ETAG-002: 相同内容生成相同 ETag

| **ID** | TC-ETAG-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 对 sample_resource 生成两次 ETag |
| **预期结果** | - 两次 ETag 完全相同<br/>- 使用内容哈希（MD5/SHA1） |

#### TC-ETAG-003: 内容变化生成不同 ETag

| **ID** | TC-ETAG-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. ETag(sample_resource) vs ETag(sample_resource_v2) |
| **预期结果** | - 两个 ETag 不同<br/>- 反映内容真实变化 |

### 2.2 条件请求

#### TC-ETAG-004: If-None-Match 匹配返回 304

| **ID** | TC-ETAG-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. GET 资源获得 ETag<br/>2. 再次 GET 带 `If-None-Match: <etag>` |
| **预期结果** | - HTTP 304 Not Modified<br/>- 无响应体<br/>- 节省带宽 |

#### TC-ETAG-005: If-None-Match 不匹配返回 200

| **ID** | TC-ETAG-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 资源内容变化<br/>2. 用旧 ETag 发起 If-None-Match |
| **预期结果** | - HTTP 200<br/>- 响应包含新 ETag<br/>- 返回新内容 |

#### TC-ETAG-006: If-None-Match: * 返回 304（资源未变）

| **ID** | TC-ETAG-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. GET 带 `If-None-Match: *`（任何 ETag 都匹配） |
| **预期结果** | - 资源存在时返回 304<br/>- 资源不存在时返回 200（不存在匹配的 ETag） |

---

## 三、边界与异常测试

### TC-EDGE-001: 弱 ETag（W/"..."）处理
**步骤**：发送 `If-None-Match: W/"abc"`。  
**预期结果**：弱验证器与强 ETag 匹配（语义等价）。

### TC-EDGE-002: 多个 ETag 逗号分隔
**步骤**：`If-None-Match: "etag1", "etag2", "etag3"`。  
**预期结果**：任意一个匹配即返回 304。

### TC-EDGE-003: 无效 ETag 格式
**步骤**：`If-None-Match: invalid-format`。  
**预期结果**：忽略无效格式，返回 200。

---

## 四、回归测试

### TC-REG-001: 非 GET 请求忽略 ETag
**步骤**：POST 带 If-None-Match。  
**预期结果**：正常处理 POST，忽略条件头部。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-ETag 生成 | TC-ETAG-001~003 | L1+L2 |
| FR-条件请求 | TC-ETAG-004~006 | L2 |
| FR-边界 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 大响应体 ETag 计算性能 | 当前仅小数据测试 | 性能测试补充 10MB 响应 ETag 开销 |
| Cache-Control max-age 配合 | 不同缓存层 | 静态资源缓存测试补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/53-需求-ETag缓存验证.md`*