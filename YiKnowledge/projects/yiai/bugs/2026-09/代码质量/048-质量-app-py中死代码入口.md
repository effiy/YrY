---
title: if __name__ == "__main__" 仅存在于 app.py 而非 main.py
tags: [yiai, code-quality, entry-point]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# if __name__ == "__main__" 仅存在于 app.py 而非 main.py

## 现象

两个文件都包含 uvicorn 启动逻辑，但入口点重复且不一致：

```python
# app.py:247-252 — uvicorn 启动代码
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=host, port=port, reload=reload)

# main.py — 也启动 uvicorn（作为主要入口）
uvicorn.run("src.app:app", host="0.0.0.0", port=10086, reload=False)
```

`app.py` 的 `if __name__ == "__main__"` 从未被触发——因为实际入口是 `main.py`。`app.py` 被作为模块导入（`from src.app import app`），其 `__name__` 永远不是 `"__main__"`。

此外，`app.py:247` 和 `main.py` 中的 uvicorn 配置不一致（`reload` 参数、host 参数不同）。

## 根因分析

- `app.py` 在早期开发中作为直接启动脚本，后来创建了 `main.py` 作为统一入口
- 旧的 `__name__ == "__main__"` 块未清理

## 涉及文件

- `src/app.py:247-252` — 死代码（永不被执行）
- `main.py` — 实际入口，与 app.py 中的配置不一致

## 修复方案

删除 `app.py` 中的 `if __name__ == "__main__"` 块。保持 `main.py` 作为唯一入口。

## 预防措施

- 一个项目只保留一个入口点文件

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
