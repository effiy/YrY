---

doc_type: test
title: "YA-09-11: 用户管理服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-11"
source_prds: ["11-需求-用户管理服务"]
source_modules: ["11-prd-task-用户管理服务"]
source_okr: [yiai-001]

type: test
---

# YA-09-11: 用户管理服务 — 测试规格

> 来源 PRD：[11-需求-用户管理服务.md](../../prds/2026-09/11-需求-用户管理服务.md)
> 开发方案：[11-prd-task-用户管理服务.md](../../devs/2026-09/11-prd-task-用户管理服务.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖用户 CRUD、密码 bcrypt 安全、CSV 批量导入导出、部门树、字典端点。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 密码哈希、CSV 解析、树构建逻辑 | pytest + unittest.mock | bcrypt 哈希验证、CSV 字段校验、部门树递归构建 |
| L2 集成测试 | 真实 MongoDB + REST API | pytest-asyncio + httpx + motor | CRUD 端点、批量导入导出、字典端点 |

### 1.2 核心安全关注

| 安全点 | 风险 | 测试策略 |
|--------|------|---------|
| 密码泄露 | 列表/导出接口返回 bcrypt 哈希 | 验证 excludeFields="password" + row.pop 防御 |
| 用户名重复 | CSV 导入无去重检测 | 验证导入时用户名冲突处理 |
| 部门树循环引用 | 父子部门形成环 | 验证循环引用检测 |
| 批量导入原子性 | 部分成功部分失败 | 验证汇总报告 |

### 1.3 API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/users/list` | POST | 分页列表（排除密码） |
| `/users/tree` | POST | 部门-用户树 |
| `/users` | POST | 创建用户 |
| `/users/{key}` | PUT | 更新用户 |
| `/users/{key}` | DELETE | 删除用户 |
| `/users/batch` | POST | CSV/JSON 批量导入 |
| `/users/export` | POST | CSV 导出 |
| `/users/dict/{type}` | GET | 字典查询 |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import io
import csv
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def sample_user():
    """标准用户数据。"""
    return {
        "username": "test_user",
        "password": "SecurePass123!",
        "display_name": "测试用户",
        "gender": "male",
        "department": "engineering",
        "role": "developer",
        "email": "test@example.com",
        "status": "active",
    }

@pytest.fixture
def sample_users_batch():
    """批量用户数据——100 条。"""
    return [
        {
            "username": f"user_{i:03d}",
            "password": f"Pass{i:03d}!",
            "display_name": f"用户 {i}",
            "department": "engineering" if i % 2 == 0 else "product",
            "status": "active",
        }
        for i in range(100)
    ]

@pytest.fixture
def csv_import_content():
    """CSV 导入内容。"""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["username", "password", "display_name", "department", "status"])
    writer.writeheader()
    writer.writerow({"username": "csv_user_1", "password": "Pass001!", "display_name": "CSV用户1", "department": "engineering", "status": "active"})
    writer.writerow({"username": "csv_user_2", "password": "Pass002!", "display_name": "CSV用户2", "department": "product", "status": "active"})
    return output.getvalue()

@pytest.fixture
def csv_with_errors():
    """含格式错误的 CSV。"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["username", "password"])  # 缺少必填列
    writer.writerow(["bad_user", "pass"])       # 缺少必填字段
    return output.getvalue()

@pytest.fixture
def department_tree():
    """部门树 fixture。"""
    return [
        {"id": "dept_root", "name": "公司", "parent": None},
        {"id": "dept_eng", "name": "工程部", "parent": "dept_root"},
        {"id": "dept_fe", "name": "前端组", "parent": "dept_eng"},
        {"id": "dept_be", "name": "后端组", "parent": "dept_eng"},
        {"id": "dept_pd", "name": "产品部", "parent": "dept_root"},
    ]

@pytest.fixture
def dict_data():
    """字典数据 fixture。"""
    return {
        "status": [{"value": "active", "label": "在职"}, {"value": "inactive", "label": "离职"}],
        "gender": [{"value": "male", "label": "男"}, {"value": "female", "label": "女"}],
        "role": [{"value": "admin", "label": "管理员"}, {"value": "developer", "label": "开发者"}],
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 用户 CRUD

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-UM-01 | 创建用户 | 有效用户数据 | 1. POST /users 含 username + password<br>2. 检查响应和数据库 | 201 Created，password 存储为 bcrypt 哈希（非明文） | P0 |
| TC-UM-02 | 用户名重复拒绝 | 已存在同名用户 | 1. 创建 "test_user"<br>2. 再次创建 "test_user" | 返回 code=1003 RESOURCE_EXISTS | P0 |
| TC-UM-03 | 列表接口排除密码 | 已创建 5 个用户 | 1. GET /users/list<br>2. 检查返回数据 | 所有用户对象不含 password 字段 | P0 |
| TC-UM-04 | 更新用户信息 | 已有用户 key | 1. PUT /users/{key} 更新 display_name<br>2. 检查更新结果 | 字段更新成功，其他字段不变 | P1 |
| TC-UM-05 | 更新密码重新哈希 | 已有用户 | 1. PUT /users/{key} 含新 password<br>2. 检查数据库 | 新 bcrypt 哈希与旧哈希不同 | P1 |
| TC-UM-06 | 删除用户 | 已有用户 | 1. DELETE /users/{key}<br>2. 尝试查询该用户 | 204 No Content，用户不存在 | P1 |
| TC-UM-07 | 删除不存在的用户 | 无效 key | 1. DELETE /users/nonexistent | 返回 code=1002 RESOURCE_NOT_FOUND | P2 |

### 3.2 CSV 批量导入导出

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-UM-08 | CSV 导入 100 条全部成功 | 有效 CSV 含 100 条 | 1. POST /users/batch 上传 CSV<br>2. 检查响应 | `{imported: 100, errors: 0}` | P0 |
| TC-UM-09 | CSV 格式错误校验 | 缺少必填列 | 1. POST /users/batch 上传错误 CSV<br>2. 检查响应 | code=1001 INVALID_PARAMS，含字段缺失信息 | P1 |
| TC-UM-10 | CSV 部分成功汇总 | 10 条中 2 条失败 | 1. 上传混合有效/无效数据<br>2. 检查汇总 | `{imported: 8, errors: 2, error_details: [...]}` | P1 |
| TC-UM-11 | CSV 导出排除密码 | 已有 10 个用户 | 1. POST /users/export<br>2. 检查 CSV 内容 | CSV 不含 password 列 | P0 |
| TC-UM-12 | CSV 导入重复用户名处理 | CSV 中 username 已存在 | 1. 导入含重复 username<br>2. 检查该条目 | error_details 中包含该条，"username 已存在" | P1 |
| TC-UM-13 | JSON 格式批量导入 | JSON 文件上传 | 1. POST /users/batch 上传 .json<br>2. 检查导入结果 | JSON 解析正确，用户创建成功 | P2 |

### 3.3 部门树与字典

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-UM-14 | 部门树嵌套结构 | 5 个部门层级 | 1. POST /users/tree<br>2. 检查树结构 | 正确嵌套：root.children = [eng, pd]，eng.children = [fe, be] | P1 |
| TC-UM-15 | 部门树下用户挂载 | 部门 + 用户 | 1. 检查工程部-前端组节点<br>2. 展开 children | 前端组 children 包含属该部门的用户列表 | P2 |
| TC-UM-16 | 字典端点 status | dict_status 集合 | 1. GET /users/dict/status<br>2. 检查返回 | [{value: "active", label: "在职"}, ...] | P1 |
| TC-UM-17 | 字典端点 gender | dict_gender 集合 | 1. GET /users/dict/gender | 返回性别字典列表 | P2 |
| TC-UM-18 | 字典端点 role | dict_role 集合 | 1. GET /users/dict/role | 返回角色树字典 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-UM-01 | 空密码创建用户 | password="" | 拒绝，返回 code=1001 "密码不能为空" | P1 |
| EG-UM-02 | 超长用户名 | username 长度 500 字符 | 拒绝或截断 | P2 |
| EG-UM-03 | CSV 编码错误 | Latin-1 编码的 CSV | 尝试自动检测编码，失败则报错 | P1 |
| EG-UM-04 | 部门树循环引用 | dept_a.parent=dept_b, dept_b.parent=dept_a | 检测到循环引用，日志 ERROR + 返回有限树 | P2 |
| EG-UM-05 | 批量导入 0 条 | 空 CSV | 返回 `{imported: 0, errors: 0}` | P2 |
| EG-UM-06 | 特殊字符用户名 | username="<script>alert(1)</script>" | HTML 转义或拒绝 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-UM-01 | 用户 CRUD 不影响其他集合 | 用户操作后 | 其他集合（bugs/sessions）数据不变 | P1 |
| RG-UM-02 | 密码策略变更兼容 | bcrypt rounds 从 12 改为 14 | 旧密码仍可验证，新密码用新 rounds | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 用户 CRUD | TC-UM-01 ~ TC-UM-07 | 创建/查重/列表/更新/改密/删除 |
| FR2: 密码安全 | TC-UM-01, TC-UM-03, TC-UM-11 | bcrypt 哈希 + 排除密码 |
| FR3: CSV 批量导入 | TC-UM-08 ~ TC-UM-10, TC-UM-12, TC-UM-13 | 全成功/格式错误/部分成功/JSON |
| FR4: CSV 导出 | TC-UM-11 | 排除密码 |
| FR5: 部门树 | TC-UM-14, TC-UM-15 | 嵌套结构 + 用户挂载 |
| FR6: 字典端点 | TC-UM-16 ~ TC-UM-18 | status/gender/role |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 大数据量部门树性能 | 100+ 部门 × 1000+ 用户的 O(n×m) 复杂度 | 添加大数据量部门树构建性能测试 |
| 批量导入事务性 | CSV 导入中途失败是否回滚 | 添加导入事务行为测试 |
| 密码强度策略 | 无最小密码长度/复杂度校验 | 添加密码强度策略测试 |
| 用户删除级联处理 | 用户删除后关联数据（会话/权限）处理 | 添加级联删除行为测试 |