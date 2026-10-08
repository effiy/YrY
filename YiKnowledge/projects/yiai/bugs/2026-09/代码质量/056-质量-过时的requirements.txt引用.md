---
title: README.md 引用已删除的 requirements.txt
tags: [yiai, code-quality, documentation]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# README.md 引用已删除的 requirements.txt

## 现象

`YiAi/README.md` 多处引用 `requirements.txt`，但该文件已不存在：

```markdown
# README.md:223
pip install -r requirements.txt

# README.md:254
├── requirements.txt           # Python 依赖
```

实际依赖管理已迁移到 `pyproject.toml`（仅有 pytest 配置，见 bug #53），但 `requirements.txt` 被删除后文档未同步更新。

## 根因分析

- `requirements.txt` 在迁移到 `pyproject.toml` 时被删除
- README 更新滞后于代码变更

## 涉及文件

- `YiAi/README.md:223,254` — 过时的引用

## 修复方案

更新 README 以反映当前的依赖管理方式——`pyproject.toml` 或手动 `pip install fastapi uvicorn ...`

## 预防措施

- 文件删除时同步更新相关文档引用

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
