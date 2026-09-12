---
title: StateStoreService 方法内部延迟导入
tags: [yiai, code-quality, import-style]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# StateStoreService 方法内部延迟导入

## 现象

`src/domain/state/service.py` 中 `StateStoreService.create()` 和 `update()` 方法在方法体内部执行 `import` 语句，而非模块顶部：

```python
# create() 方法内 (L21)
import uuid
data["key"] = str(uuid.uuid4())

# create() 方法内 (L22)
from shared.utils import get_current_time
now = get_current_time()

# update() 方法内 (L75)
from shared.utils import get_current_time
data["updatedTime"] = get_current_time()
```

## 根因分析

- 延迟导入通常用于打破循环导入，但此处 `uuid` 是标准库，`shared.utils` 不太可能形成循环
- 每次调用方法时都重新执行 import 语句（虽然 Python 会缓存模块，但仍有字典查找开销）
- 降低代码可读性——读者期望在文件顶部看到所有依赖

## 涉及文件

- `src/domain/state/service.py:21` — `import uuid` 在 `create()` 方法内
- `src/domain/state/service.py:22` — `from shared.utils import get_current_time` 在 `create()` 方法内
- `src/domain/state/service.py:75` — `from shared.utils import get_current_time` 在 `update()` 方法内

## 修复方案

将 `import uuid` 和 `from shared.utils import get_current_time` 移到文件顶部。

## 预防措施

- 仅在确实需要打破循环导入时使用方法内导入
- 方法内导入应添加注释说明原因

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/state/service.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
