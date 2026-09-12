---
title: main.py 和 app.py 中 uvicorn 配置参数不一致
tags: [yiai, code-quality, config-drift]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# main.py 和 app.py 中 uvicorn 配置参数不一致

## 现象

两个文件中的 uvicorn 启动参数存在差异：

```python
# main.py — 生产环境入口
uvicorn.run("src.app:app", host="0.0.0.0", port=10086, reload=False)

# app.py:251 — 死代码（开发入口）
uvicorn.run("app:app", host=host, port=port, reload=reload)
```

差异：
| 参数 | main.py | app.py |
|------|---------|--------|
| app 路径 | `"src.app:app"` | `"app:app"` |
| host | `"0.0.0.0"` | 变量（从 settings） |
| port | `10086` | 变量（从 settings） |
| reload | `False` | 变量（从 settings） |

虽然 `app.py` 的块是死代码，但如果有人将 `app.py` 作为入口运行，host/port/reload 会从 `config.yaml` 读取——这是合理的。但 `main.py` 硬编码了所有参数，不读取配置。

## 根因分析

- `main.py` 是简化后的"开发友好"入口，参数硬编码方便 `python main.py` 直接启动
- 但 `config.yaml` 中的 server host/port 配置被忽略
- 如果修改配置文件的端口，main.py 不会响应

## 涉及文件

- `main.py` — 硬编码 uvicorn 参数
- `src/app.py:247-252` — 死代码块

## 修复方案

让 `main.py` 也读取 `settings` 配置：
```python
from src.shared.config import settings
uvicorn.run("src.app:app", host=settings.server_host, port=settings.server_port)
```

## 预防措施

- 所有启动入口应使用相同的配置源

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `app.py`
- `main.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
