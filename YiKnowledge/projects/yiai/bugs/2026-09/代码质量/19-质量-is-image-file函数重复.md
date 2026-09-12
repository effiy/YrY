---
title: is_image_file 函数在 maintenance.py 和 paths.py 中重复定义
tags: [yiai, code-quality, code-smell, duplication]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# is_image_file 函数在 maintenance.py 和 paths.py 中重复定义

## 现象

`is_image_file` 函数在代码库中定义了两次，功能完全相同但使用不同的常量：

`src/domain/files/paths.py:18`：
```python
_IMAGE_EXTENSIONS = (
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico",
)

def is_image_file(filename: str) -> bool:
    if not filename:
        return False
    n = str(filename).lower()
    return n.endswith(_IMAGE_EXTENSIONS)
```

`src/server/routes/maintenance.py:38`：
```python
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'}

def is_image_file(filepath: str) -> bool:
    ext = Path(filepath).suffix.lower()
    return ext in IMAGE_EXTENSIONS
```

## 根因分析

两个函数的实现略有不同（`str.endswith(tuple)` vs `Path.suffix in set`），但结果完全等价。扩展名列表完全一致。

这种重复导致：
1. 添加新的图片格式支持时需要同时修改两个地方
2. 如果两个函数的行为差异没有在代码审查中被发现，可能导致行为不一致的 bug
3. 增加了代码维护负担

## 涉及文件

- `src/domain/files/paths.py:13-23` — 第一处定义（`_IMAGE_EXTENSIONS` 为 tuple）
- `src/server/routes/maintenance.py:22-41` — 第二处定义（`IMAGE_EXTENSIONS` 为 set）

## 修复方案

统一使用 `domain/files/paths.py` 中的版本，`maintenance.py` 改为导入：

```python
# maintenance.py
from domain.files.paths import is_image_file
```

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 新增工具函数前先搜索代码库确认是否已存在 |
| 审查 | 代码审查时检查新增函数是否与现有函数重复 |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `maintenance.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
