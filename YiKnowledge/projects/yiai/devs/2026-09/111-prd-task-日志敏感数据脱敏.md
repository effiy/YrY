---

doc_type: module
prd_task_id: "YA-09-47"
title: "YA-09-47: 日志敏感数据脱敏 — 自动扫描 + 字段遮蔽 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "111-需求-日志敏感数据脱敏.md"
source_okr: [yiai-001]

type: task
---

# YA-09-47: 日志敏感数据脱敏 — 自动扫描 + 字段遮蔽 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[111-需求-日志敏感数据脱敏.md](../../prds/2026-09/111-需求-日志敏感数据脱敏.md)
> 需求编号：YA-09-47 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

## 一、架构总览

YA-09-35 实现了结构化日志但无脱敏机制，日志中可能意外记录密码、API Key、JWT Token、邮箱、手机号等敏感数据。方案：在 `StructuredFormatter.format()` 中嵌入 `LogSanitizer` 作为最后一道防线，使用三级混合检测（字段名匹配 + 正则模式匹配 + 值模式匹配）+ 分级遮蔽（完全遮蔽/部分保留/长度保留），确保所有日志出口（stdout/文件/远程）都经过脱敏。

```mermaid
graph TB
    subgraph "日志写入"
        APP[应用代码<br/>logger.info()]
        LOGGER[Python Logger]
    end

    subgraph "LogSanitizer — 三级检测"
        FIELD[字段名匹配<br/>password/token/secret/key/credential<br/>→ 值替换为 ***]
        REGEX[正则模式匹配<br/>信用卡16位/手机号/邮箱<br/>→ 替换为 ***CC***/***PHONE***/***EMAIL***]
        VALUE[值模式匹配<br/>Bearer eyJ/sk-前缀/JWT三段<br/>→ 保留前4后4]
    end

    subgraph "分级遮蔽"
        FULL[完全遮蔽: ***<br/>密码/Token/Credit Card]
        PARTIAL[部分保留: sk-ab***f56<br/>API Key/Token]
        LENGTH[长度保留: ***@domain<br/>邮箱]
    end

    subgraph "输出"
        FORMATTER[SanitizedFormatter<br/>继承 StructuredFormatter]
        STDOUT[stdout]
        FILE[日志文件]
    end

    APP --> LOGGER
    LOGGER --> FORMATTER
    FORMATTER --> FIELD
    FORMATTER --> REGEX
    FORMATTER --> VALUE
    FIELD --> FULL
    REGEX --> FULL
    VALUE --> PARTIAL
    FULL --> STDOUT
    PARTIAL --> STDOUT
    FULL --> FILE
    PARTIAL --> FILE
```

### 脱敏规则表

| 数据类型 | 检测方式 | 遮蔽方式 | 示例输入 → 输出 |
|----------|----------|----------|----------------|
| 密码字段 | 字段名 `password/passwd/pwd/secret` | 完全遮蔽 `***` | `{"password": "admin123"}` → `{"password": "***"}` |
| Token/Key | 字段名 `token/api_key/access_key` | 保留前4后4 | `"sk-abc123def456"` → `"sk-a***f456"` |
| JWT Bearer | 值模式 `Bearer eyJ` | 保留前12 | `"Bearer eyJhbGciOiJIUz..."` → `"Bearer eyJhbGciOi***"` |
| 信用卡号 | 正则 `\b\d{16}\b` | `***CC***` | `"1234567890123456"` → `"***CC***"` |
| 手机号 | 正则 `\b1[3-9]\d{9}\b` | `***PHONE***` | `"13800138000"` → `"***PHONE***"` |
| 邮箱 | 正则 `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z\|a-z]{2,}` | `***EMAIL***` | `"user@example.com"` → `"***EMAIL***"` |
| 身份证号 | 正则 `\b\d{17}[\dXx]\b` | `***ID***` | `"110101199001011234"` → `"***ID***"` |

---

## 二、文件清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `src/shared/log_sanitizer.py` | **新建** | ~120 | LogSanitizer：三级检测 + 分级遮蔽 + 递归深度处理 |
| `src/shared/logging.py` | 修改 | +15 | SanitizedFormatter 继承 StructuredFormatter |
| `src/server/middleware.py` | 修改 | +10 | 请求/响应 body 日志脱敏 |
| `src/shared/config.py` | 修改 | +5 | 脱敏规则配置文件路径 |
| `tests/shared/test_log_sanitizer.py` | **新建** | ~100 | 6 场景测试 |

---

## 三、模块设计

### 3.1 LogSanitizer（核心类）

```python
# src/shared/log_sanitizer.py

import re
import logging


class LogSanitizer:
    """日志敏感数据脱敏器。

    三级检测 + 分级遮蔽：
    1. 字段名匹配：检测 dict key 是否包含敏感词，值替换为 ***
    2. 正则模式匹配：检测字符串中是否包含信用卡/手机号/邮箱/身份证
    3. 值模式匹配：检测字符串是否以 Bearer/sk-/JWT 开头

    递归处理：遍历 dict/list/str 嵌套结构，确保所有层级都经过脱敏。
    """

    # 敏感字段名（值完全遮蔽）
    SENSITIVE_FIELDS: set[str] = {
        "password", "passwd", "pwd", "secret", "token",
        "api_key", "access_key", "private_key", "credential",
        "authorization", "x-token",
    }

    # 正则模式（值替换为占位符）
    SENSITIVE_PATTERNS: list[tuple[str, str]] = [
        (r'\b\d{16}\b', '***CC***'),                                    # 信用卡号
        (r'\b1[3-9]\d{9}\b', '***PHONE***'),                            # 手机号
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***EMAIL***'),  # 邮箱
        (r'\b\d{17}[\dXx]\b', '***ID***'),                              # 身份证
    ]

    # 值前缀模式（部分保留）
    VALUE_PATTERNS: list[tuple[str, str, int]] = [
        (r'^Bearer\s+eyJ', 'Bearer ', 12),   # JWT: 保留 "Bearer " + 前12字符
        (r'^sk-', 'sk-', 8),                  # API Key: 保留 "sk-" + 前8字符
        (r'^eyJ', '', 16),                    # 裸 JWT: 保留前16字符
    ]

    @classmethod
    def sanitize(cls, data: dict | list | str | bytes) -> dict | list | str | bytes:
        """递归脱敏入口。支持 dict/list/str/bytes 类型。"""
        if isinstance(data, bytes):
            data = data.decode("utf-8", errors="replace")
            return cls.sanitize(data).encode("utf-8")
        if isinstance(data, str):
            return cls._sanitize_string(data)
        if isinstance(data, dict):
            return {k: cls._sanitize_field(k, v) for k, v in data.items()}
        if isinstance(data, list):
            return [cls.sanitize(item) for item in data]
        return data

    @classmethod
    def _sanitize_field(cls, key: str, value) -> dict | list | str:
        """字段级脱敏：敏感字段名 → 值完全遮蔽。"""
        if key.lower() in cls.SENSITIVE_FIELDS:
            return "***"
        return cls.sanitize(value)

    @classmethod
    def _sanitize_string(cls, text: str) -> str:
        """字符串级脱敏：正则匹配 + 值模式匹配。"""
        for pattern, replacement in cls.SENSITIVE_PATTERNS:
            text = re.sub(pattern, replacement, text)
        for pattern, prefix, keep in cls.VALUE_PATTERNS:
            if re.match(pattern, text):
                text = text[:keep] + "***"
                break
        return text


class SanitizedFormatter(logging.Formatter):
    """脱敏日志格式化器——继承结构化日志，增加脱敏层。"""

    def format(self, record: logging.LogRecord) -> str:
        # 脱敏 message
        if isinstance(record.msg, (dict, list)):
            record.msg = LogSanitizer.sanitize(record.msg)
        elif isinstance(record.msg, str):
            record.msg = LogSanitizer.sanitize(record.msg)
        # 脱敏 args
        if record.args:
            record.args = tuple(
                LogSanitizer.sanitize(a) if isinstance(a, (dict, list, str)) else a
                for a in record.args
            )
        return super().format(record)
```

### 3.2 中间件集成

```python
# src/server/middleware.py — 请求/响应体日志脱敏

# 记录请求日志时
logger.info("请求", body=LogSanitizer.sanitize(request_body))

# 记录错误日志时
logger.error("处理失败", error=str(e), request=LogSanitizer.sanitize(request_data))
```

---

## 四、数据流

### 4.1 脱敏处理流程

```
logger.info("用户登录", extra={"password": "admin123", "email": "user@example.com"})
  → SanitizedFormatter.format(record)
    → record.msg = LogSanitizer.sanitize({"password": "admin123", "email": "user@example.com"})
      → isinstance(data, dict) → 遍历每个 key/value
        → key="password" → _sanitize_field → key in SENSITIVE_FIELDS → value="***"
        → key="email" → _sanitize_field → key not in SENSITIVE_FIELDS
          → _sanitize_string("user@example.com")
            → 正则匹配邮箱 → "***EMAIL***"
      → 返回: {"password": "***", "email": "***EMAIL***"}
    → record.args 同样脱敏
    → super().format(record)
  → 输出: {"password": "***", "email": "***EMAIL***"}
```

### 4.2 性能考量

```
单条日志脱敏开销：
  - 简单 str (无敏感数据): < 0.01ms
  - 嵌套 dict (5 层, 20 个 key): < 0.05ms
  - 大列表 (1000 条 str): < 0.5ms

高频场景 (1000 QPS, 每条日志一次脱敏): 总开销 < 50ms/s (< 0.05%)
```

---

## 五、实施路线图

| 阶段 | 人天 | 任务 | 产出 | 验证 |
|------|------|------|------|------|
| 一：核心脱敏器 | 0.15 | 实现 LogSanitizer 三级检测 + 分级遮蔽 + 递归处理 | `log_sanitizer.py` (~120行) | 单元测试：6 场景通过 |
| 二：格式化器集成 | 0.15 | SanitizedFormatter 继承 StructuredFormatter；替换所有 handler | `logging.py` 修改 | 集成测试：日志输出已脱敏 |
| 三：中间件脱敏 | 0.05 | 请求/响应 body 日志脱敏 | `middleware.py` 修改 | curl 测试：body 脱敏 |
| 四：配置 + 扩展 | 0.10 | YAML 配置文件 + 自定义规则注册 + 测试 | config + test | 自定义规则生效 |
| 五：验证收尾 | 0.05 | 审查所有日志调用点（password/token 泄露）+ CI 检查 | 代码审查 | 无敏感数据泄露 |

**合计：0.5d。**

---

## 六、代码审查检查清单

- [ ] LogSanitizer 三级检测：字段名匹配 + 正则模式 + 值前缀模式
- [ ] 敏感字段名覆盖：password/passwd/pwd/secret/token/api_key/access_key/private_key/credential/authorization/x-token
- [ ] 正则模式覆盖：信用卡号(16位)、手机号(1[3-9]开头11位)、邮箱、身份证(18位)
- [ ] 值模式覆盖：Bearer JWT、sk- API Key、裸 JWT
- [ ] 递归处理：dict/list/str 嵌套结构全部遍历
- [ ] bytes 类型先 decode 再 sanitize 再 encode
- [ ] 完全遮蔽 `***` 用于密码和密钥
- [ ] 部分保留 `sk-ab***f56` 用于 API Key（保留前4后4）
- [ ] SanitizedFormatter 在 `format()` 中统一脱敏 msg + args
- [ ] 脱敏逻辑不抛异常（任何错误都返回原始数据 + WARNING 日志）
- [ ] 自定义规则可通过 YAML 配置文件扩展
- [ ] 性能：单条日志脱敏 < 0.1ms（P99）

---

## 七、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|------|------|------|------|----------|
| 正则误脱敏合法数据 | 低 | 低 | 低 | 正则严格限制格式（16位精确信用卡长度） |
| 正则漏检敏感数据 | 中 | 中 | 中 | 多层检测（字段名+值模式兜底）；新类型可配置扩展 |
| 嵌套 JSON 脱敏性能 | 低 | 低 | 低 | 递归终止于基本类型；500层嵌套是合理上限 |
| bytes 编码错误导致脱敏失败 | 低 | 低 | 低 | decode(errors="replace") 兜底 |
| 脱敏后日志无法调试 | 中 | 中 | 低 | 部分保留方案（Token 前4后4）；开发环境可禁用脱敏 |
| Unicode 字符截断 | 低 | 低 | 低 | 使用 r'' 正则；Python 3 原生 Unicode 安全 |

### 回滚策略

| 场景 | 操作 | 回滚时间 |
|------|------|----------|
| 过度脱敏影响调试 | `LOG_SANITIZE_ENABLED=False` | < 1min |
| 性能影响 | 简化为仅字段名匹配（跳过正则） | < 1min |
| 完全回滚 | 注释 SanitizedFormatter，使用原始 Formatter | < 5min |