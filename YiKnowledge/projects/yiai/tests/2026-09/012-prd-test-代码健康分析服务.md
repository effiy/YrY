---

doc_type: test
title: "YA-09-12: 代码健康分析服务 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-12"
source_prds: ["12-需求-代码健康分析服务"]
source_modules: ["12-prd-task-代码健康分析服务"]
source_okr: [yiai-001]

type: test
---

# YA-09-12: 代码健康分析服务 — 测试规格

> 来源 PRD：[12-需求-代码健康分析服务.md](../../prds/2026-09/12-需求-代码健康分析服务.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖代码规模统计、圈复杂度扫描、重复代码检测、覆盖率数据聚合、健康评分计算。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 静态分析纯函数 | pytest | 代码行数统计、圈复杂度计算、重复率检测、覆盖率解析 |
| L2 集成测试 | 真实代码库扫描 | pytest + subprocess | 对 YrY 自身代码仓库运行分析、健康报告生成 |

### 1.2 健康指标维度

| 指标 | 计算方式 | 健康阈值 |
|------|---------|---------|
| 代码规模 | 文件数 + 总行数 + 注释率 | 注释率 > 10% |
| 圈复杂度 | 每个函数的独立路径数 | 平均 < 10，最大 < 30 |
| 重复代码率 | 相似度 > 0.8 的代码块占比 | < 5% |
| 测试覆盖率 | 行覆盖率和分支覆盖率 | 行 > 70%，分支 > 60% |
| 代码异味 | 长函数/长参数列表/过深嵌套 | 各维度阈值内 |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
from pathlib import Path

@pytest.fixture
def sample_python_file():
    """含多种代码模式的 Python 测试文件。"""
    return """
'''
模块文档字符串
'''
import os
import sys

# 简单函数——圈复杂度 1
def simple_function(x):
    return x + 1

# 中等复杂度——圈复杂度 5
def medium_complexity(a, b, c, d, e):
    result = 0
    if a > 0:
        result += 1
        if b > 0:
            result += 2
            for i in range(c):
                if i % 2 == 0:
                    result += i
    elif a < 0:
        result -= 1
    else:
        result = 0
    return result

# 高复杂度——圈复杂度 10+
def high_complexity(x):
    if x == 1:
        return "a"
    elif x == 2:
        return "b"
    elif x == 3:
        return "c"
    elif x == 4:
        return "d"
    elif x == 5:
        return "e"
    elif x == 6:
        return "f"
    elif x == 7:
        return "g"
    elif x == 8:
        return "h"
    elif x == 9:
        return "i"
    else:
        return "other"

# 超长函数（> 50 行）
def very_long_function():
    # Line 1
    a = 1
    b = 2
    # ... (省略) ...
    return a + b
"""

@pytest.fixture
def duplicate_code_files(tmp_path):
    """两个含重复代码的文件。"""
    file1 = tmp_path / "module_a.py"
    file1.write_text('''
def calculate_total(items):
    total = 0
    for item in items:
        if item.price > 0:
            total += item.price * item.quantity
        if item.discount > 0:
            total -= item.discount
    return total

def format_result(total):
    return f"Total: ${total:.2f}"
''')
    file2 = tmp_path / "module_b.py"
    file2.write_text('''
def compute_sum(products):
    total = 0
    for product in products:
        if product.price > 0:
            total += product.price * product.quantity
        if product.discount > 0:
            total -= product.discount
    return total

def display_output(value):
    return f"Total: ${value:.2f}"
''')
    return {"file1": file1, "file2": file2}

@pytest.fixture
def coverage_report():
    """模拟 coverage.xml 数据。"""
    return {
        "line_rate": 0.75,
        "branch_rate": 0.62,
        "packages": [
            {"name": "domain.rag", "line_rate": 0.88, "branch_rate": 0.75},
            {"name": "domain.ai", "line_rate": 0.65, "branch_rate": 0.50},
        ]
    }

@pytest.fixture
def empty_codebase(tmp_path):
    """空代码库目录。"""
    code_dir = tmp_path / "empty_project"
    code_dir.mkdir()
    return code_dir

@pytest.fixture
def mixed_codebase(tmp_path):
    """混合语言代码库——Python + TypeScript + Vue。"""
    proj = tmp_path / "mixed_project"
    proj.mkdir()
    (proj / "main.py").write_text("print('hello')\n" * 10)
    (proj / "utils.ts").write_text("export const add = (a: number, b: number): number => a + b;\n" * 5)
    (proj / "App.vue").write_text("<template><div>Hello</div></template>\n" * 3)
    return proj
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 代码规模统计

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CH-01 | 单文件行数统计 | sample_python_file | 1. 解析文件<br>2. 统计总行数、代码行、注释行、空行 | 各行数统计正确 | P1 |
| TC-CH-02 | 单文件注释率计算 | sample_python_file | 1. 统计注释行数和总行数<br>2. 计算注释率 | 注释率 = 注释行 / 总行数 | P1 |
| TC-CH-03 | 多文件聚合统计 | mixed_codebase (3 文件) | 1. 扫描整个目录<br>2. 统计文件数 | 文件数=3，总行数=18 | P1 |
| TC-CH-04 | 空目录统计 | empty_codebase | 1. 扫描空目录<br>2. 检查统计结果 | 文件数=0，总行数=0，不报错 | P2 |

### 3.2 圈复杂度

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CH-05 | 简单函数圈复杂度=1 | simple_function | 1. 分析 `simple_function`<br>2. 计算圈复杂度 | 圈复杂度=1 | P1 |
| TC-CH-06 | 中等函数圈复杂度=5 | medium_complexity (if/for/elif) | 1. 分析 `medium_complexity`<br>2. 计算圈复杂度 | 圈复杂度=5 | P1 |
| TC-CH-07 | 多分支函数圈复杂度=11 | high_complexity (10 elif + 1 else) | 1. 分析 `high_complexity`<br>2. 计算圈复杂度 | 圈复杂度=11 | P1 |
| TC-CH-08 | 圈复杂度分布报告 | 整个文件 | 1. 所有函数的圈复杂度<br>2. 统计分布 | 返回 {min, max, mean, median, p95} | P2 |

### 3.3 重复代码检测

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CH-09 | 相似代码块检测 | duplicate_code_files (相似度 > 0.8) | 1. 比对 module_a 和 module_b<br>2. 检测重复块 | 标记 `calculate_total` 和 `compute_sum` 为重复 | P1 |
| TC-CH-10 | 重复率计算 | duplicate_code_files | 1. 统计重复代码行数<br>2. 除以总行数 | 重复率在 0.4-0.6 之间 | P2 |
| TC-CH-11 | 无重复代码场景 | 单文件项目 | 1. 扫描无重复代码的代码库 | 重复率=0，无标记 | P2 |

### 3.4 覆盖率聚合

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CH-12 | 行覆盖率解析 | coverage_report | 1. 解析 line_rate<br>2. 返回百分比 | 75%（0.75 × 100） | P1 |
| TC-CH-13 | 分支覆盖率解析 | coverage_report | 1. 解析 branch_rate<br>2. 返回百分比 | 62%（0.62 × 100） | P1 |
| TC-CH-14 | 模块级覆盖率 | coverage_report.packages | 1. 检查 domain.rag 和 domain.ai<br>2. 返回各模块覆盖率 | rag=88%/75%, ai=65%/50% | P2 |

### 3.5 健康评分

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CH-15 | 综合健康评分 | 全部指标 | 1. 聚合规模/复杂度/重复/覆盖率<br>2. 计算加权评分 | 返回值在 0-100 之间，含各维度分 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-CH-01 | 空文件分析 | 0 字节的 .py 文件 | 无函数，圈复杂度=0，注释率=0 | P2 |
| EG-CH-02 | 语法错误的 Python 文件 | 包含 `if True` 不完整语句 | 跳过该函数，日志 WARNING | P1 |
| EG-CH-03 | 二进制文件误扫 | .pyc 或 .so 文件 | 自动跳过非文本文件 | P2 |
| EG-CH-04 | 超大类文件（> 10000 行） | 单文件 10000 行 | 正常分析，无 OOM 或超时 | P1 |
| EG-CH-05 | 无 coverage.xml | 代码库无覆盖率报告 | 覆盖率指标显示 "N/A"，评分不含覆盖率维度 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-CH-01 | 对 YrY 自身进行健康分析 | 运行健康分析工具 | 不报错，输出合理的健康报告 | P1 |
| RG-CH-02 | 连续两次分析结果一致 | 代码未变 | 两次分析结果相同 | P2 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 代码规模统计 | TC-CH-01 ~ TC-CH-04 | 行数/注释率/多文件/空目录 |
| FR2: 圈复杂度扫描 | TC-CH-05 ~ TC-CH-08 | 简单/中等/复杂/分布 |
| FR3: 重复代码检测 | TC-CH-09 ~ TC-CH-11 | 相似/重复率/无重复 |
| FR4: 覆盖率聚合 | TC-CH-12 ~ TC-CH-14 | 行/分支/模块 |
| FR5: 健康评分 | TC-CH-15 | 综合评分 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| TypeScript/Vue 圈复杂度 | 当前仅 Python 圈复杂度工具 | 添加 ESLint complexity 规则集成 |
| 真实覆盖率报告解析 | Mock 数据非真实 coverage.xml | 添加对 YiAi 自身 pytest-cov XML 的解析测试 |
| 历史趋势对比 | 无跨时间健康对比 | 添加趋势分析 API 测试 |
| 大代码库性能 | YrY 全库扫描性能未测 | 添加 10K+ 文件扫描性能基准 |