---
title: app.py 使用 sys.path.append(os.getcwd()) 依赖工作目录
tags: [yiai, code-quality, import-hygiene]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: minor
priority: p2
---

# app.py 使用 sys.path.append(os.getcwd()) 依赖工作目录

## 现象

YiAi 启动依赖于 `sys.path` 的手动修改，在多处使用不同的策略设置导入路径：

```python
# main.py:13 — 相对于入口文件添加 src/ 到 sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# app.py:17 — 依赖当前工作目录
sys.path.append(os.getcwd())

# tests/conftest.py:8-9 — 测试环境另行设置
sys.path.insert(0, str(src_path))
```

`app.py:17` 的 `sys.path.append(os.getcwd())` 特别脆弱——如果从不同目录启动应用，导入路径会变化：

```bash
cd /tmp && python /opt/YrY/YiAi/main.py  # os.getcwd() → /tmp，导入失败
```

`ruff.toml:7` 甚至专门禁用了 `E402` 规则来容忍这种模式：
```toml
ignore = ["E402"]  # sys.path manipulation precedes application imports
```

## 根因分析

- 项目未使用标准的 Python 包结构（`setup.py`/`pyproject.toml` 的 `[project]`）
- 内部导入使用项目根路径作为基准（`from data.database import db`）
- 开发便利性优先于部署的可移植性

## 涉及文件

- `main.py:13` — `sys.path.insert(0, ...)`
- `src/app.py:17` — `sys.path.append(os.getcwd())`
- `tests/conftest.py:8-9` — 测试路径设置
- `ruff.toml:7` — `E402` 被禁用

## 修复方案

1. 添加 `pyproject.toml` 的 `[project]` 配置，支持 `pip install -e .`
2. 或使用 `PYTHONPATH=src python -m uvicorn app:app` 替代 `sys.path` 修改
3. 测试配置通过 `pythonpath = ["src"]` (pytest) 统一管理
4. 移除 `app.py:17` 的 `os.getcwd()` 依赖

## 预防措施

- 禁止在生产代码中使用 `sys.path.insert/append`
- 导入路径应通过包安装（`pip install -e .`）而非运行时修改

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `setup.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
