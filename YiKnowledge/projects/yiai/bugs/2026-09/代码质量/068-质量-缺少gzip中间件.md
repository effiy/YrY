---
title: FastAPI 未配置 GZipMiddleware 压缩响应
tags: [yiai, code-quality, performance]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# FastAPI 未配置 GZipMiddleware 压缩响应

## 现象

`app.py` 的 `create_app()` 中未添加 `GZipMiddleware`，大型 JSON 响应（如 Dashboard 报表、知识库文件列表）不会被压缩：

```python
app = FastAPI(title="YiAi API", ...)
# 缺少 GZipMiddleware
```

对于 Dashboard 端点返回的大 JSON（RSS 文章列表、知识文件统计等），gzip 可将响应体积压缩 70-90%，减少网络传输时间。

## 涉及文件

- `src/app.py:162-167` — FastAPI 实例创建

## 修复方案

```python
from starlette.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1024)
```

## 预防措施

- API 服务默认启用响应压缩

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `app.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
