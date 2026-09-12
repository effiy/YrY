---
title: tools.py _ALLOWED_ROOTS 白名单缺少项目根路径常量
tags: [yiai, code-quality, config]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# tools.py _ALLOWED_ROOTS 白名单缺少项目根路径常量

## 现象

`src/domain/ai/tools.py:359` 定义了允许 Agent 工具访问的路径白名单，但使用硬编码的相对路径字符串：

```python
_ALLOWED_ROOTS = ["../YiKnowledge", "../YiVad", "../YiPet", "../YiAi", "../YiWeb", "../YiPett"]
```

这些路径相对于 `src/domain/ai/tools.py` 所在位置。如果项目结构变化（如 tools.py 移动位置），白名单将失效。此外：

- `../YiWeb` 和 `../YiPett` 已不存在（已重命名为 YiVad 和 YiPet），属于残留引用
- `../YiAi` 被解析为 `os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))`（code line 645），手动计算易出错

## 根因分析

- 白名单最初定义时项目结构不同
- 随项目演进，部分路径引用的目录已重命名或删除
- 相对路径计算依赖 `__file__` 位置，脆弱

## 涉及文件

- `src/domain/ai/tools.py:359,644-645` — 路径白名单定义和解析

## 修复方案

1. 将白名单路径移至 `config.yaml`，使用绝对路径
2. 路径值从 `settings` 读取（如 `settings.knowledge_base_dir`）
3. 在应用启动时验证白名单路径是否存在
4. 移除 `YiWeb` 和 `YiPett` 的残留引用

## 预防措施

- 文件系统路径不应硬编码在业务逻辑中
- 使用配置管理系统管理所有路径引用

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/ai/tools.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
