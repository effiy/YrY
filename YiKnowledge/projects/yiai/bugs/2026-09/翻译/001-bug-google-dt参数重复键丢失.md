---
title: "bug: Google 翻译 Provider 的 dt 参数因字典重复键而全部丢失"
tags: [yiai, bug, translation, google, data-loss]
category: projects/yiai/bugs/翻译
created: 2026-09-23
updated: 2026-09-23
source: YiAi
type: bug
status: closed
severity: major
priority: p1
project: YiAi
module: src/services/translation/providers/google.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# bug: Google 翻译 Provider 的 dt 参数因字典重复键而全部丢失

## 现象

Google 翻译接口返回的翻译质量显著下降，缺少词典释义、例句、发音等附加数据。`_format_dict` 方法几乎总是拿到空结构体。

## 复现步骤

1. 启动 YiAi 服务
2. 调用翻译 RPC 指定 `providers: ["google"]`
3. 观察返回结果中 `target` 字段只包含纯文本翻译，无字典释义
4. 或运行 ruff 检查：
   ```
   ruff check src/services/translation/providers/google.py
   ```
   报告 9 个 F601（重复字典键 literal）

## 预期行为

Google Translate API 应接收到 10 个 `dt` 查询参数（at、bd、ex、ld、md、qca、rw、rm、ss、t），返回包含词典释义、例句、发音、关联词的完整翻译数据。

## 实际行为

Python 字典 `{"dt": "at", "dt": "bd", ..., "dt": "t"}` 仅保留最后一个 `"dt": "t"` 键值对。HTTP 请求仅发送 `?dt=t`，丢失了 9 个数据类型参数。Google API 仅返回纯文本翻译。

## 根因分析

Google Translate API (`translate_a/single`) 使用多个同名 `dt` 查询参数来指定返回哪些数据类型：

| dt 值 | 含义 |
|-------|------|
| `at` | 替代翻译 |
| `bd` | 词典定义 |
| `ex` | 例句 |
| `ld` | 长定义 |
| `md` | 元数据 |
| `qca` | 拼写纠正 |
| `rw` | 相关词 |
| `rm` | 反向翻译 |
| `ss` | 同义词 |
| `t` | 主翻译 |

HTTP 协议天然支持同名查询参数（`?dt=at&dt=bd&...`），但 Python 的 `dict` 类型不允许重复键。当用 `dict` 构造查询参数时，后续的同名键值会静默覆盖前一个。

**本 bug 是 Python 数据模型与 HTTP 查询参数语义不匹配的典型案例**。`httpx` 和 `requests` 都支持用 `list[tuple[str, str]]` 传递重复查询参数，但代码沿用了更常见的 `dict` 写法。

## 修复方案

将查询参数从 `dict` 改为 `list[tuple[str, str]]`：

```python
# 修复前（仅最后一个 "dt" 生效）
params = {"client": "gtx", "dt": "at", "dt": "bd", ..., "dt": "t"}

# 修复后（所有 dt 参数正确发送）
params = [("client", "gtx"), ("dt", "at"), ("dt", "bd"), ..., ("dt", "t")]
```

`httpx.get(url, params=list_of_tuples)` 会正确序列化同名查询参数。

## 影响范围

- **影响模块**：`src/services/translation/providers/google.py`
- **是否影响 API 契约**：否（返回结构相同，仅数据完整性变化）
- **是否影响其他项目**：是 — 客户端应用通过 YiAi RPC 使用 Google 翻译时受影响
- **数据修复**：无需，翻译记忆缓存中的数据不受影响

## 验证方法

- [x] `ruff check src/services/translation/providers/google.py` 清洁
- [x] `python -m pytest tests/ -q` 通过（655 个测试）
- [x] 手动测试 Google 翻译返回的词典释义、例句完整

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | HTTP 查询参数使用 `list[tuple]` 当需要同名键时 |
| 审查 | 审查第三方 API 集成时检查查询参数构造方式 |
| Lint | ruff F601 规则已启用，自动检测重复字典键 |
| 文档 | 在开发规范中记录此反模式 |

## 经验教训

1. **Python dict 的隐式限制**：字典类型不允许重复键是 Python 基础特性，但在构建 HTTP 查询参数时容易被忽略
2. **静默数据丢失**：此 bug 不会抛出异常，Google API 正常返回 200，但返回数据不完整——这种"静默降级"最难被发现
3. **类型系统不救你**：Python 的类型注解 `dict[str, str]` 无法表达"允许重复键"的语义，只能在运行时由 linter 捕获（ruff F601）
4. **测试覆盖的盲区**：Mock 测试中通常不验证 HTTP 查询参数的具体值，导致此类 bug 漏网。集成测试应验证完整的请求 URL
5. **HTTP 与 Python 的阻抗失配**：`?a=1&a=2` 在 HTTP 中完全合法且常见，但 `{"a": 1, "a": 2}` 在 Python 中不可能——这是跨协议开发中反复出现的陷阱