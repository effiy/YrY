---

doc_type: test
title: "YA-09-06: 全局搜索服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-06"
source_prds: ["10-需求-全局搜索服务"]
source_modules: ["10-prd-task-全局搜索服务"]
source_okr: [yiai-001]

type: test
---

# YA-09-06: 全局搜索服务 — 测试规格

> 来源 PRD：[10-需求-全局搜索服务.md](../../prds/2026-09/10-需求-全局搜索服务.md)
> 开发方案：[10-prd-task-全局搜索服务.md](../../devs/2026-09/10-prd-task-全局搜索服务.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖跨集合全文检索、搜索结果聚合、相关性归一化排序、权限过滤、分页一致性。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 搜索逻辑 + mock Motor | pytest + AsyncMock | 并行查询调度、Min-Max 归一化、权限过滤函数 |
| L2 集成测试 | 真实 MongoDB + $text 索引 | pytest-asyncio + motor | 跨集合搜索端到端、搜索结果聚合、分页 |
| L4 性能基准 | 搜索延迟测量 | pytest + time.perf_counter | 6 集合并行搜索延迟、大数据量性能 |

### 1.2 参与全局搜索的集合

| 集合 | 搜索字段 | 集合权重 | 权限要求 |
|------|---------|---------|---------|
| `projects` | name, description, key | 1.0 | 公开 |
| `bugs` | title, description, module, severity | 1.0 | 公开 |
| `knowledge_files` | title, tags, content_preview | 1.2 | 公开 |
| `sessions` | title, messages.content | 0.8 | 仅本人 |
| `issues` | title, description, status | 1.0 | 公开 |

### 1.3 设计决策回顾

```
搜索架构: MongoDB $text 索引 + 应用层聚合（无需 Elasticsearch）
相关性归一化: Min-Max 批内归一化 → [0, 1]
搜索范围: 默认全集合 + 用户可选集合过滤
权限过滤: 仅返回用户有权访问的文档
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase

@pytest_asyncio.fixture
async def searchable_db(test_db):
    """预填充跨集合搜索测试数据。"""
    # 项目
    await test_db.projects.insert_many([
        {"_id": "prj_1", "name": "YiAi RAG 引擎", "description": "RAG 检索系统", "key": "YA"},
        {"_id": "prj_2", "name": "Docker 部署方案", "description": "容器化部署", "key": "DK"},
        {"_id": "prj_3", "name": "Agent 循环优化", "description": "AI Agent 性能", "key": "AG"},
    ])
    # 缺陷
    await test_db.bugs.insert_many([
        {"_id": "bug_1", "title": "RAG 检索空结果", "description": "embedding 维度不匹配导致空结果"},
        {"_id": "bug_2", "title": "Docker 构建失败", "description": "Dockerfile 语法错误"},
    ])
    # 知识文件
    await test_db.knowledge_files.insert_many([
        {"_id": "kf_1", "title": "RAG 实现指南", "tags": ["RAG", "检索"], "content_preview": "RAG 分检索和生成两阶段"},
        {"_id": "kf_2", "title": "Docker Compose 教程", "tags": ["Docker", "部署"], "content_preview": "docker compose up"},
    ])
    # 会话（有权限过滤需求）
    await test_db.sessions.insert_many([
        {"_id": "ses_1", "title": "RAG 优化讨论", "messages": [{"content": "RAG 怎么优化"}], "owner": "user_a"},
        {"_id": "ses_2", "title": "部署问题", "messages": [{"content": "Docker 部署出错"}], "owner": "user_b"},
    ])
    # 创建 $text 索引
    await test_db.projects.create_index([("name", "text"), ("description", "text")])
    await test_db.bugs.create_index([("title", "text"), ("description", "text")])
    await test_db.knowledge_files.create_index([("title", "text"), ("tags", "text")])
    await test_db.sessions.create_index([("title", "text"), ("messages.content", "text")])
    yield test_db

@pytest.fixture
def search_queries():
    """搜索查询测试用例。"""
    return {
        "exact_match": "RAG",
        "partial_match": "Dock",
        "cross_collection": "部署",
        "no_match": "xyz_not_found_abc",
    }

@pytest.fixture
def search_request():
    """标准全局搜索请求。"""
    return {
        "module_name": "services.search.search_service",
        "method_name": "global_search",
        "parameters": {
            "query": "RAG",
            "collections": None,  # 全部集合
            "pageNum": 1,
            "pageSize": 20,
        },
    }

@pytest.fixture
def search_by_user_a():
    """以 user_a 身份搜索的请求。"""
    return {
        "module_name": "services.search.search_service",
        "method_name": "global_search",
        "parameters": {
            "query": "RAG",
            "user_id": "user_a",
        },
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 跨集合搜索

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-01 | 全集合搜索"RAG" | 数据已预填充 | 1. 全局搜索 "RAG"<br>2. 检查各集合返回 | projects/bugs/knowledge_files/sessions 均有结果 | P1 |
| TC-GS-02 | 单集合限定搜索 | 指定 collections=["projects"] | 1. 搜索 "RAG"，限定 projects<br>2. 检查结果 | 仅 projects 集合结果，其他集合无 | P1 |
| TC-GS-03 | 部分集合搜索 | collections=["projects", "bugs"] | 1. 搜索 "RAG"，限定两集合<br>2. 检查结果 | projects + bugs，不含 knowledge_files | P2 |
| TC-GS-04 | 搜索词无匹配 | query="xyz_not_found_abc" | 1. 搜索不存在的词<br>2. 检查结果 | 所有集合返回空，total=0 | P1 |

### 3.2 搜索结果聚合与排序

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-05 | 结果按集合分组 | searchable_db 有数据 | 1. 搜索 "RAG"<br>2. 检查响应结构 | `{knowledge_files: [...], projects: [...], bugs: [...], sessions: [...]}` | P1 |
| TC-GS-06 | Min-Max 归一化排序 | 跨集合搜索结果 | 1. 检查归一化后分数<br>2. 验证分数在 [0, 1] 区间 | 所有分数 0 <= score <= 1 | P1 |
| TC-GS-07 | 集合权重生效 | knowledge_files weight=1.2 > projects weight=1.0 | 1. 相同匹配度时<br>2. knowledge_files 结果排名更高 | 权重 1.2 的集合结果优先 | P2 |
| TC-GS-08 | 结果标注来源 | 每条结果 | 1. 检查 `source_collection` 字段 | 每条结果标注所属集合名 | P1 |

### 3.3 权限过滤

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-09 | 仅返回本人会话 | user_a 搜索 "RAG" | 1. sessions 中有 user_a 和 user_b 的记录<br>2. user_a 搜索<br>3. 检查 sessions 结果 | 仅返回 user_a 的 ses_1，不返回 user_b 的 ses_2 | P0 |
| TC-GS-10 | 权限过滤对公开集合无影响 | user_a 搜索 projects | 1. projects 为公开集合<br>2. 权限过滤后检查 | 所有匹配 projects 都返回 | P1 |
| TC-GS-11 | 未登录搜索限制 | 无 user_id 搜索 | 1. sessions 为仅本人可见<br>2. 未登录搜索 | sessions 返回空列表，其他公开集合正常 | P1 |

### 3.4 分页一致性

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-12 | 分页 total 正确 | 搜索 "RAG" 返回 12 条 | 1. pageSize=5, pageNum=1<br>2. 检查 total | total=12，list 长度=5 | P1 |
| TC-GS-13 | 跨页结果不重复 | pageNum=1, pageSize=5 → pageNum=2 | 1. 检查第 1 页和第 2 页的结果<br>2. 验证无重复 ID | 两页结果 ID 集合不重叠 | P2 |
| TC-GS-14 | 最后一页部分填充 | total=12, pageSize=5, pageNum=3 | 1. 第 3 页<br>2. 检查 list 长度 | list 长度=2（剩余 2 条） | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-GS-01 | 空查询 | query="" | 返回空结果，total=0，不报错 | P1 |
| EG-GS-02 | 纯空格查询 | query="   " | 返回空结果 | P2 |
| EG-GS-03 | 单字符查询 | query="R" | 正常搜索（$text 支持单字符），返回匹配结果 | P2 |
| EG-GS-04 | 单个集合超时不影响整体 | projects 查询超时 | 其他集合正常返回，projects 标注 "timeout" | P1 |
| EG-GS-05 | 所有集合无 $text 索引 | 新集合未建索引 | 降级为 $regex 搜索，日志 WARNING | P1 |
| EG-GS-06 | 超大分页 | pageSize=10000 | 限制为 100 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-GS-01 | 单集合查询不受影响 | 全局搜索上线后 | 现有 `query_documents` 行为不变 | P1 |
| RG-GS-02 | YiVad 全局搜索入口正常 | YiVad 搜索框输入 | 结果展示正确，分面切换正常 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 跨集合全文检索 | TC-GS-01 ~ TC-GS-04 | 全集合/单集合/部分/无匹配 |
| FR2: 搜索结果聚合 | TC-GS-05 ~ TC-GS-08 | 分组/归一化/权重/来源标注 |
| FR3: 权限过滤 | TC-GS-09 ~ TC-GS-11 | 本人/公开/未登录 |
| FR4: 分页一致性 | TC-GS-12 ~ TC-GS-14 | total/去重/最后一页 |
| 决策1: MongoDB $text | TC-GS-01 ~ TC-GS-04 | 功能正确 |
| 决策2: Min-Max 归一化 | TC-GS-06 | 分数区间 |
| 决策3: 全集合+可选 | TC-GS-01, TC-GS-02 | 默认全量 + Tab 过滤 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| $text 索引性能 | 数据量增长后 $text 搜索性能未测 | 添加 100K+ 文档的搜索性能基准 |
| 中文分词效果 | MongoDB $text 对中文分词支持有限 | 添加中文搜索精度评估（对比 BM25） |
| 搜索建议/自动补全 | 全局搜索无搜索建议功能 | 添加搜索建议 API 测试 |
| 搜索历史/热门搜索 | 无搜索分析功能 | 添加搜索日志分析测试 |