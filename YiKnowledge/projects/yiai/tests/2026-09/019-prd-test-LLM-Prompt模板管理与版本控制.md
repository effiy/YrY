---

doc_type: test
title: "YA-09-19: LLM Prompt 模板管理 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-19"
source_prds: ["19-需求-LLM-Prompt模板管理与版本控制"]
source_modules: ["19-prd-task-LLM-Prompt模板管理与版本控制"]
source_okr: [yiai-002]

type: test
---

# YA-09-19: LLM Prompt 模板管理 — 测试规格

> 来源 PRD：[19-需求-LLM-Prompt模板管理与版本控制.md](../../prds/2026-09/19-需求-LLM-Prompt模板管理与版本控制.md)
> 开发方案：[19-prd-task-LLM-Prompt模板管理与版本控制.md](../../devs/2026-09/19-prd-task-LLM-Prompt模板管理与版本控制.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 Jinja2 模板渲染、模板版本管理（draft/stable/archived）、变量校验、AB 测试分流。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | Jinja2 渲染、版本选择、AB 分流 | pytest + jinja2 | 变量插值、模板编译、版本路由、哈希分流 |
| L2 集成测试 | MongoDB 模板存储 + API | pytest-asyncio + motor + httpx | CRUD API、版本切换、渲染端点 |

### 1.2 模板生命周期

```
draft → review → stable → deprecated → archived
                      ↓
                   rollback
```

### 1.3 模板示例

```jinja2
{# system_prompt_v2.j2 #}
你是一个 {{ role }}，专注于 {{ domain }} 领域。
请使用以下知识库回答问题：
{% for doc in knowledge_docs %}
- {{ doc.title }}: {{ doc.summary }}
{% endfor %}

用户问题：{{ user_query }}

请用{{ language }}回答。
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
from jinja2 import Environment, BaseLoader, TemplateNotFound

@pytest.fixture
def jinja_env():
    """Jinja2 环境——从字符串加载模板。"""
    return Environment(loader=BaseLoader())

@pytest.fixture
def system_prompt_template():
    """标准系统提示模板。"""
    return """
你是一个 {{ role }}，专注于 {{ domain }} 领域。

{% if knowledge_docs %}
知识库参考：
{% for doc in knowledge_docs %}
- {{ doc.title }}: {{ doc.summary }}
{% endfor %}
{% endif %}

用户问题：{{ user_query }}

请用{{ language }}回答。
""".strip()

@pytest.fixture
def template_variables():
    """模板变量。"""
    return {
        "role": "技术专家",
        "domain": "RAG 检索增强生成",
        "knowledge_docs": [
            {"title": "RAG 基础", "summary": "RAG 分为检索和生成两阶段"},
            {"title": "向量检索", "summary": "使用 embedding 进行语义检索"},
        ],
        "user_query": "RAG 如何优化检索速度？",
        "language": "中文",
    }

@pytest.fixture
def incomplete_variables():
    """不完整的模板变量——缺少 role。"""
    return {
        "domain": "RAG",
        "user_query": "如何优化？",
        "language": "中文",
        "knowledge_docs": [],
    }

@pytest.fixture
def template_versions():
    """模板版本数据。"""
    return {
        "system_prompt": {
            "v1": {"status": "archived", "content": "You are {{ role }}. Answer: {{ user_query }}", "created": "2026-08-01"},
            "v2": {"status": "stable", "content": "你是 {{ role }}。\n{% if knowledge_docs %}\n{% for doc in knowledge_docs %}\n- {{ doc.title }}\n{% endfor %}\n{% endif %}\n问题：{{ user_query }}", "created": "2026-09-01"},
            "v3": {"status": "draft", "content": "你是一个{{ role }}专家。用户问题：{{ user_query }}\n请逐步分析。", "created": "2026-09-20"},
        }
    }

@pytest.fixture
def ab_test_config():
    """AB 测试配置。"""
    return {
        "template_name": "system_prompt",
        "variant_a": {"version": "v2", "traffic_pct": 80},
        "variant_b": {"version": "v3", "traffic_pct": 20},
    }

@pytest.fixture
def sample_user_ids():
    """100 个用户 ID——用于 AB 分流测试。"""
    import hashlib
    return [f"user_{i:04d}" for i in range(100)]
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 Jinja2 模板渲染

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PT-01 | 简单变量插值 | system_prompt_template + 完整变量 | 1. 渲染模板<br>2. 检查输出 | `{{role}}` 替换为 "技术专家"，`{{domain}}` 替换为 "RAG" | P0 |
| TC-PT-02 | 循环渲染知识库文档 | template_variables.knowledge_docs (2 docs) | 1. 渲染 `{% for doc in knowledge_docs %}`<br>2. 检查输出 | 输出含 2 条文档摘要 | P1 |
| TC-PT-03 | 条件块 rendering | knowledge_docs 为空 | 1. `{% if knowledge_docs %}` 块不渲染<br>2. 检查输出 | 知识库参考部分不出现在输出中 | P1 |
| TC-PT-04 | 变量缺失→明确报错 | incomplete_variables（缺少 role） | 1. 渲染模板<br>2. 检查异常 | 抛 `UndefinedError: 'role' is undefined`，含清晰错误信息 | P0 |
| TC-PT-05 | 特殊字符转义 | role="<script>alert(1)</script>" | 1. 渲染模板<br>2. 检查输出 | HTML 转义或原样保留（取决于 `|safe` 过滤器） | P2 |
| TC-PT-06 | 模板语法错误 | 包含 `{% endfor %}` 不匹配 | 1. 编译模板<br>2. 检查异常 | 抛 `TemplateSyntaxError`，含行号和错误说明 | P1 |

### 3.2 版本管理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PT-07 | latest 版本自动指向最新 stable | v2=stable, v3=draft | 1. 请求 latest 版本<br>2. 检查实际使用版本 | 使用 v2（latest stable），非 v3（draft） | P1 |
| TC-PT-08 | 显式指定版本号 | 指定 version="v1" | 1. 请求 v1<br>2. 检查内容 | 使用 v1 内容渲染 | P1 |
| TC-PT-09 | 版本回滚 | current=v2, rollback to v1 | 1. 执行回滚操作<br>2. 检查当前版本 | current 变为 v1，v2 标记为 deprecated | P2 |
| TC-PT-10 | draft 版本不可用于生产 | version="v3" status=draft | 1. 非管理员请求 draft 模板<br>2. 检查行为 | 拒绝，返回 "模板不可用" | P1 |
| TC-PT-11 | 创建新 draft 版本 | 已有 v2 stable | 1. 创建 v3 draft<br>2. 检查不影响 v2 | v2 继续服务生产，v3 仅用于预览 | P2 |

### 3.3 AB 测试分流

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PT-12 | 分流比例 80/20 近似 | ab_test_config, 100 users | 1. 对 100 用户分流<br>2. 统计 variant 分布 | A 约 80 人，B 约 20 人（P > 0.05 chi-squared test） | P2 |
| TC-PT-13 | 同一用户分流稳定 | ab_test_config, user_0001 | 1. 多次请求同一 user_id<br>2. 检查 variant | 始终分到同一 variant（哈希确定性） | P2 |
| TC-PT-14 | 100% 流量单 variant | variant_a traffic=100% | 1. 所有用户请求<br>2. 检查 variant | 全部返回 variant_a | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-PT-01 | 模板内容为空字符串 | content="" | 渲染输出为空（不报错） | P2 |
| EG-PT-02 | 无任何版本存在 | 模板名无任何版本 | 返回错误 "模板未找到" | P1 |
| EG-PT-03 | 循环引用 {% include %} | 模板 A include 模板 B，B include 模板 A | 检测循环，抛出异常 | P2 |
| EG-PT-04 | 超大模板（> 1MB） | 模板文件 1MB+ | 正常编译和渲染，性能不显著退化 | P2 |
| EG-PT-05 | 变量值含 Jinja2 语法 | user_query="{{ malicious }}" | 原样输出，不进行二次渲染 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-PT-01 | 模板管理不影响 LLM 调用 | 模板系统上线 | chat API 行为不变 | P1 |
| RG-PT-02 | 历史会话使用旧模板版本 | 会话创建时的模板版本 | 重放历史会话时使用创建时的模板版本 | P2 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: Jinja2 变量插值 | TC-PT-01 ~ TC-PT-06 | 简单/循环/条件/缺失/特殊/语法错误 |
| FR2: 版本管理 | TC-PT-07 ~ TC-PT-11 | latest/指定/回滚/draft/新建 |
| FR3: AB 测试分流 | TC-PT-12 ~ TC-PT-14 | 比例/稳定性/100% |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 模板性能对 LLM 应答的影响 | 模板长度影响 prompt tokens 数 | 添加模板渲染+PPL 质量评估测试 |
| 多语言模板 | 中英文模板切换 | 添加语言特定的模板渲染测试 |
| AB 测试效果度量 | 分流后缺少 win/loss 判定 | 添加 AB 测试结果统计显著性检验 |
| 模板安全沙箱 | Jinja2 可执行任意 Python | 添加沙箱模式（SandboxedEnvironment）测试 |