---
title: 缺少 .editorconfig 统一编辑器配置
tags: [yivad, code-quality, editor-config]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 .editorconfig 统一编辑器配置

## 现象

`YiVad/` 目录中无 `.editorconfig` 文件。虽然 Prettier 和 ESLint 配置已统一代码风格，但 `.editorconfig` 在文件保存时提供基础的编辑器级别一致性（缩进、换行符、字符集），不依赖项目工具链。

CLAUE.md 中的 `YiPet/CLAUDE.md` 在指引中提到了 `.editorconfig`，但 YiVad 目录中缺失。

## 根因分析

- Prettier + ESLint 覆盖了大部分代码规范需求
- `.editorconfig` 被认为是"可选的"

## 涉及文件

- 缺少 `YiVad/.editorconfig`

## 修复方案

```ini
root = true
[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
[*.md]
trim_trailing_whitespace = false
```

## 预防措施

- 所有项目必须包含 `.editorconfig`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

