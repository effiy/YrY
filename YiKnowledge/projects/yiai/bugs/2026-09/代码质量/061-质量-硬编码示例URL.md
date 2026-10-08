---
title: schemas.py 中包含硬编码的示例 webhook URL
tags: [yiai, code-quality, security]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# schemas.py 中包含硬编码的示例 webhook URL

## 现象

`src/models/schemas.py:290` 的 Pydantic schema 中包含硬编码的示例 webhook URL（使用 `?key=xxx` 占位符）：

```python
"webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
```

这是 WeWork Webhook 的示例值。虽然 `key=xxx` 是占位符，但在 OpenAPI 文档（FastAPI 自动生成的 `/docs`）中会显示为示例值，可能误导用户使用虚假 URL。

## 根因分析

- Pydantic `Field(examples=[...])` 或 `json_schema_extra` 中的示例值未使用 `example.com` 域名
- 自动生成的 API 文档会展示这个 URL

## 涉及文件

- `src/models/schemas.py:290` — webhook_url 示例

## 修复方案

```python
"webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY_HERE"
```

或使用 `https://example.com/webhook` 作为通用示例。

## 预防措施

- 示例值必须明确标识为占位符或使用 `example.com` 域名

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
