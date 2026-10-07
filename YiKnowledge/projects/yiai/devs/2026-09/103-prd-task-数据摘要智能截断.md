---

doc_type: module
prd_task_id: "YA-09-99"
title: "YA-09-99: 服务端简洁数据摘要生成 — 大列表响应的人类可读摘要与智能截断 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "103-需求-数据摘要智能截断.md"
source_okr: [yiai-001]

type: task
---

# YA-09-99: 服务端简洁数据摘要生成 — 大列表响应的人类可读摘要与智能截断 — 开发任务

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[103-需求-数据摘要智能截断.md](../../prds/2026-09/103-需求-数据摘要智能截断.md)
> 需求编号：YA-09-99 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

## 一、架构总览

前端 Dashboard 和全局搜索等场景需要先获取概览信息再决定是否加载完整数据，但当前必须下载完整响应才能提取概览。方案：通过 `X-Summary` HTTP Header 和 `?summary=true` 参数，在服务端根据响应数据自动生成人类可读摘要。支持 HEAD 请求仅获取摘要 header（响应体为空），最大化带宽节省。摘要按数据类型定制模板（Dashboard/搜索/列表/知识库/RAG），端点可注册自定义模板。

```mermaid
graph TB
    subgraph "客户端请求"
        HEAD_REQ[HEAD /api/data]
        GET_REQ[GET /api/data?summary=true]
        GET_NORMAL[GET /api/data (无参数)]
    end

    subgraph "SummaryMiddleware (响应中间件)"
        CHECK{status=2xx<br/>且 ?summary=true<br/>或 HEAD?}
        GEN[SummaryGenerator.generate()]
        TEMPLATE[模板路由<br/>dashboard/search/list/knowledge/rag]
        TRUNCATE[smart_truncate<br/>L1摘要 + L2预览 + L3总数]
    end

    subgraph "响应"
        HEADER[X-Summary: "共 1234 条记录, 第 1/62 页"]
        BODY[完整响应体<br/>或空 (HEAD)]
    end

    GET_REQ --> CHECK
    HEAD_REQ --> CHECK
    GET_NORMAL --> CHECK

    CHECK -->|否| BODY
    CHECK -->|是| GEN
    GEN --> TEMPLATE
    TEMPLATE -->|列表类型| LIST_T[通用列表模板]
    TEMPLATE -->|Dashboard| DASH_T[Dashboard 模板]
    TEMPLATE -->|搜索| SEARCH_T[搜索模板]
    TEMPLATE -->|知识库| KB_T[知识库模板]
    TEMPLATE -->|RAG| RAG_T[RAG 模板]
    LIST_T --> TRUNCATE
    DASH_T --> TRUNCATE
    SEARCH_T --> TRUNCATE
    KB_T --> TRUNCATE
    RAG_T --> TRUNCATE
    TRUNCATE --> HEADER
    TRUNCATE --> BODY
```

### 分层截断模型

```
L1: 统计摘要   "共 1234 条记录, 第 1/62 页, 集合: sessions"
L2: 前 N 条预览 {preview: [{id:1, title:"..."}, ...], max=5}
L3: 总数信息   {total: 1234, truncated: true}
```

### 各端点摘要格式

| 端点上下文 | 摘要模板 | 示例 |
|-----------|---------|------|
| `dashboard` | `项目数: {N}, 总 Issue: {total}, Bug: {bugs}, 完成率: {rate}%` | `项目数: 5, 总 Issue: 245, Bug: 34, 完成率: 72%` |
| `search` | `从 {N} 个集合中找到 {total} 条结果, 最佳匹配: "{top}"` | `从 3 个集合中找到 200 条结果, 最佳匹配: "Agent优化"` |
| `list` | `共 {total} 条记录, 第 {page}/{pages} 页, 集合: {cname}` | `共 1234 条记录, 第 1/62 页, 集合: sessions` |
| `knowledge` | `{count} 个文件, 总计 {size}, 最近更新: {latest}` | `15 个文件, 总计 2.3MB, 最近更新: 2026-09-09` |
| `rag` | `返回 {N} 条结果 (top_k={k}), 最高相关度: {score}` | `返回 10 条结果 (top_k=10), 最高相关度: 0.92` |

---

## 二、文件清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `src/shared/summary_generator.py` | **新建** | ~200 | SummaryGenerator：模板注册、摘要生成、智能截断 |
| `src/server/middleware.py` | 修改 | +30 | 新增 `summary_middleware`，在响应后注入 `X-Summary` header |
| `src/shared/response.py` | 修改 | +10 | 响应格式增强，可选 `summary` 字段 |
| `tests/shared/test_summary_generator.py` | **新建** | ~150 | 6 个场景测试 |

---

## 三、模块设计

### 3.1 SummaryConfig（配置）

```python
# src/shared/summary_generator.py

from dataclasses import dataclass
from typing import Callable, Optional


@dataclass
class SummaryConfig:
    """摘要生成配置。"""
    max_items_preview: int = 5       # 预览前 N 条
    max_summary_length: int = 500    # 摘要最大长度（字符）
    default_page_size: int = 20
```

### 3.2 SummaryGenerator（核心类）

```python
class SummaryGenerator:
    """数据摘要生成器——大列表响应的人类可读摘要与智能截断。

    职责：
    - 根据数据类型和上下文生成人类可读摘要字符串
    - 支持自定义模板注册 (register_template)
    - 智能截断大列表：分层结构（L1 摘要 + L2 前 N 条预览 + L3 总数）
    - 与中间件集成，通过 X-Summary header 返回

    摘要生成策略：
    1. 匹配已注册的模板 (context → template_fn)
    2. 模板从响应数据中提取关键字段生成摘要
    3. 摘要超过 max_summary_length 时截断 + "..."
    4. 模板异常时回退到兜底模板 (_fallback_summary)
    """

    def __init__(self, config: SummaryConfig | None = None) -> None: ...

    # 模板管理
    def register_template(self, name: str, template_fn: Callable) -> None: ...
    def _register_default_templates(self) -> None: ...

    # 核心功能
    def generate(
        self, data: dict | list, context: str = "list", **kwargs
    ) -> str: ...
    def smart_truncate(
        self, items: list,
        max_items: int | None = None,
        key_fields: list[str] | None = None,
    ) -> dict: ...

    # 默认模板（5 种）
    def _dashboard_summary(self, data: dict, **kwargs) -> str: ...
    def _search_summary(self, data: dict, **kwargs) -> str: ...
    def _list_summary(self, data: dict | list, **kwargs) -> str: ...
    def _knowledge_summary(self, data: dict, **kwargs) -> str: ...
    def _rag_summary(self, data: dict, **kwargs) -> str: ...
    def _fallback_summary(self, data) -> str: ...

    # 工具
    @staticmethod
    def _format_size(size_bytes: int) -> str: ...
```

### 3.3 中间件集成

```python
# src/server/middleware.py — 新增摘要中间件

@app.middleware("http")
async def summary_middleware(request: Request, call_next):
    """为响应添加 X-Summary header。"""
    response = await call_next(request)

    if not (200 <= response.status_code < 300):
        return response

    want_summary = (
        request.query_params.get("summary") == "true"
        or request.method == "HEAD"
    )

    if not want_summary:
        return response

    # 读取响应体生成摘要
    body = b""
    async for chunk in response.body_iterator:
        body += chunk

    try:
        data = json.loads(body)
        context = request.query_params.get("summary_context", "list")
        summary = summary_generator.generate(data, context=context)
        headers = dict(response.headers)
        headers["X-Summary"] = quote(summary, safe="")
    except Exception:
        pass  # 摘要失败不影响响应

    # HEAD 请求清空响应体
    response_body = b"" if request.method == "HEAD" else body
    return Response(
        content=response_body,
        status_code=response.status_code,
        headers=headers,
    )
```

---

## 四、数据流

### 4.1 摘要生成流程

```
客户端请求 GET /data?summary=true&summary_context=dashboard
  → 业务服务正常处理 → 返回完整响应体
  → summary_middleware 拦截响应
    → json.loads(response.body)
    → summary_generator.generate(data, context="dashboard")
      → 匹配模板: _dashboard_summary
      → 提取字段: project_count=5, total_issues=245, bugs=34
      → 生成: "项目数: 5, 总 Issue: 245, Bug: 34, 完成率: 72%"
      → 检查长度: 60 < 500, 无需截断
    → response.headers["X-Summary"] = "项目数: 5, 总 Issue: 245, ..."
  → 客户端读取 header → 无需解析 50KB JSON 即可获知概况
```

### 4.2 HEAD 请求优化流程

```
客户端 HEAD /api/data
  → 业务服务正常处理 → 返回完整响应（但不发送 body）
  → summary_middleware 生成 X-Summary header
  → 清空 response.body (HEAD 规范)
  → 客户端获得: X-Summary header (200 bytes) vs 完整响应 (50KB)
  → 带宽节省: 99.6%
```

---

## 五、实施路线图

| 阶段 | 人天 | 任务 | 产出 | 验证 |
|------|------|------|------|------|
| 一：核心生成器 | 0.15 | 实现 SummaryGenerator + 5 种默认模板 + 智能截断 | `summary_generator.py` (~200行) | 单元测试：6 个场景通过 |
| 二：中间件集成 | 0.10 | 实现 summary_middleware；处理 HEAD 请求 body 清空 | `middleware.py` 修改 | 集成测试：X-Summary header 正确 |
| 三：Dashboard 集成 | 0.10 | Dashboard 端点注册自定义模板；前端适配 X-Summary | 端点注册 + 前端代码 | 端到端：Dashboard 首次加载 1 个摘要请求 |
| 四：测试收尾 | 0.10 | 编写完整测试 + 超长摘要截断验证 | `test_summary_generator.py` (~150行) | pytest 通过 |
| 五：性能验证 | 0.05 | 不同响应体积下的摘要生成延迟测量 | 性能报告 | 开销 < 3% |

**合计：0.5d。**

---

## 六、代码审查检查清单

- [ ] 大 payload 响应（> 10KB）自动生成结构化摘要
- [ ] 摘要按数据类型定制模板（dashboard/search/list/knowledge/rag）
- [ ] 客户端可通过 `?summary=true&summary_context=dashboard` 请求摘要
- [ ] HEAD 请求自动返回 `X-Summary` header + 清空响应体
- [ ] 智能截断：分层结构（统计摘要 + 前 5 条预览 + 总数 + truncated 标记）
- [ ] 摘要超长自动截断（max_summary_length=500，Unicode 安全截断）
- [ ] 模板注册机制：`register_template(name, fn)` 支持业务端点自定义
- [ ] 摘要生成失败时使用兜底模板（`_fallback_summary`），不阻断响应
- [ ] 摘要与响应数据同步生成（无缓存不一致问题）
- [ ] 摘要仅包含计数和统计字段，不包含具体数据内容
- [ ] X-Summary header 使用 URL 编码处理中文字符
- [ ] 测试覆盖：Dashboard/搜索/列表/截断/HEAD/超长 6 种场景

---

## 七、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|------|------|------|------|----------|
| 摘要丢失关键信息 | 中 | 中 | 中 | 模板显式覆盖所有核心字段；端点可注册自定义模板 |
| 摘要与数据不一致 | 低 | 中 | 低 | 摘要从响应数据同步生成，无缓存，无延迟 |
| 摘要模板与数据格式不匹配 | 中 | 低 | 低 | 兜底模板 (`_fallback_summary`)；模板异常 catch 后不阻断响应 |
| 大响应摘要生成延迟 | 低 | 低 | 低 | 仅遍历响应顶层字段（O(1) 个 key），不递归 |
| 中文 X-Summary header 乱码 | 中 | 中 | 中 | URL 编码 header 值；前端解码显示 |
| HEAD 请求业务服务仍执行完整查询 | 高 | 低 | 低 | 可选：检测 HEAD 请求在业务层做轻量查询（后续优化） |

### 回滚策略

| 场景 | 操作 | 回滚时间 |
|------|------|----------|
| 摘要生成异常影响响应 | 中间件 catch 异常 → 不注入 X-Summary header | 自动 |
| 模板错误导致格式异常 | 移除自定义模板，回退到默认模板 | < 1min |
| 性能影响 | 从中间件链移除 `summary_middleware` | < 1min |
| 完全回滚 | 注释中间件注册代码 | < 5min |