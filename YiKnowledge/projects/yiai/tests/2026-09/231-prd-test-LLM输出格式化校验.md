---

doc_type: test
title: "YA-09-294: LLM输出格式化校验 — JSON Schema验证与自动修复 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-294"
source_prds: ["231-需求-LLM输出格式化校验"]
source_modules: ["231-prd-task-LLM输出格式化校验"]
source_okr: [yiai-001]

type: test
---

# YA-09-294: LLM输出格式化校验 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 JSON Schema 严格验证、常见格式错误自动修复（尾逗号/单引号/缺失括号）、修复成功率统计、Schema 版本管理。

> 来源 PRD：[231-需求-LLM输出格式化校验.md](../../prds/2026-09/231-需求-LLM输出格式化校验.md)
> 需求编号：YA-09-294 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | SchemaValidator JSON Schema 校验、AutoFixer 修复规则（尾逗号/单引号/缺失引号/括号）、FormatDetector 格式检测 | 50% |
| 集成测试 | pytest + httpx | RPC 输出校验中间件、修复统计 API、Schema 注册与管理 | 30% |
| 数据验证 | pytest | 修复成功率（已知错误模式） | 20% |

**测试目标**：常见格式错误修复率 > 85%、Schema 验证 < 5ms、非法格式不导致服务 crash。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/format/` 下 50 个 LLM 输出样本：10 个标准 JSON、10 个尾逗号、10 个单引号、10 个缺失括号、10 个多行/嵌套错误。

**前置条件**：jsonschema 库可用，Schema 注册表已初始化（含 5 种常用 Schema）。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 标准 JSON Schema 验证通过 | LLM 输出合法 JSON | validate(schema, output) | 验证通过，返回 parsed data | P0 |
| 2 | 尾逗号自动修复 | `{"name": "test",}` | auto_fix | 移除尾逗号，JSON 合法 | P0 |
| 3 | 单引号自动修复 | `{'name': 'test'}` | auto_fix | 替换为双引号，JSON 合法 | P0 |
| 4 | 缺失闭合括号修复 | `{"name": "test"` | auto_fix | 补全 } 或 ]，JSON 合法 | P0 |
| 5 | 多错误同时修复 | `{'items': [1, 2,], 'name': 'test',}` | auto_fix | 单引号+尾逗号同时修复 | P1 |
| 6 | 不可修复错误 | 完全乱码的 LLM 输出 | auto_fix | 返回 fix_failed + 原始文本，不抛异常 | P0 |
| 7 | Schema 不匹配 | 缺少 required 字段 | validate | 返回具体错误: "missing field 'title'" | P1 |
| 8 | Schema 类型不匹配 | field 期望 int 但 LLM 输出 string | validate | 返回类型错误 + 尝试类型转换（如 "5"→5） | P1 |
| 9 | 格式检测 JSON vs 纯文本 | LLM 输出含 JSON + 前后解释文本 | detect_format | 正确提取 JSON 子串（正则匹配 `{...}` 或 `[...]`） | P1 |
| 10 | 修复成功率统计 | 50 个样本 | 批量 auto_fix | 返回 fix_rate，预期 > 85% | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 空输出 | LLM 返回空字符串 | fix_failed, 不 crash |
| E2 | 超长 JSON | 10MB JSON 输出 | 截断到 1MB 后尝试验证，标注"截断" |
| E3 | 嵌套 JSON 修复 | `{"a": {"b": [1, 2,],}}` | 修复所有层级的尾逗号 |
| E4 | Unicode 转义 | `{"name": "\u4e2d\u6587"}` | 正确保留 Unicode，不破坏 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 新增 Schema 不破坏已有修复规则 | 注册新 Schema 后回归测试 50 个样本，验证修复率不变 |
| R2 | Schema 更新后旧输出仍可验证 | v1 schema→v2 schema，v1 格式的输出验证仍正确（兼容模式） |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1, TC-7, TC-8 | schema_validator.py |
| TC-2, TC-3, TC-4, TC-5, TC-6 | auto_fixer.py |
| TC-9 | format_detector.py |
| TC-10 | fix_statistics.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| LLM 生成的边缘格式变体覆盖 | LLM 输出不可预测，需生产数据累积 | P2 |
| YAML/XML 等其他格式支持 | 当前仅 JSON Schema | P3 |