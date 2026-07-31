---
title: YiVad aicr 7 阶段移植完成
tags: [成功案例, YiVad, aicr, 移植]
category: lessons/wins
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# YiVad aicr 7 阶段移植完成

## 1. 背景

把 YiWeb 的 aicr（AI Code Review）页面整体移植到 YiVad。涉及：

- 9 个 Pinia store
- 8 个 modal 组件
- 卡片视图 + 图视图
- CodeViewer + ChatPanel 与 YiWeb 完全对齐

## 2. 方案

分 7 阶段推进：

| 阶段 | 内容 |
|---|---|
| 1 | 路由 + 主入口 + 主 store |
| 2 | 文件树 + FileTree baseline 对齐 |
| 3 | 卡片视图 + 图视图 |
| 4 | CodeViewer 完整迁移 |
| 5 | ChatPanel 与 YiWeb 对齐 |
| 6 | 8 个 modal 完整迁移 |
| 7 | 剩余 store 与 polish |

## 3. 关键成功因素

1. **阶段切分合理**：每阶段独立可上线，不积累大爆炸
2. **baseline 明确**：以 YiWeb 为参考实现，每阶段对比差距
3. **side-by-side 测试**：与 YiWeb 同步对比，确保 parity
4. **store 与 modal 解耦**：先 store 后 modal，互相不阻塞
5. **每阶段构建验证**：不积累技术债
6. **/loop 节奏**：每 2h 自动回归（个人 memory `project_yivad_aicr_port.md`）

## 4. 量化效果

- 7 阶段全部完成
- 9 store + 8 modal + 卡片 + 图视图 + CodeViewer + ChatPanel parity 100%
- 构建通过，无回归
- /loop 持续监控，每 2h 自动检查

## 5. 可复用经验

### 移植方法论

- **阶段化**：先骨架后细节，每阶段可验证
- **baseline 对齐**：明确参考实现，parity 测试
- **解耦推进**：大模块独立推进，互不阻塞
- **节奏化**：/loop 自动回归

### 工具复用

- FileTree baseline 已对齐 YiPet ChatSidebar / aiChat ConversationSidebar（个人 memory `project_sidebar_parity.md`）
- 后续移植复用同一 baseline

### 风险点

- 大型移植容易"做到 80% 后停滞"
- 解决：每阶段必有可上线产出，强制完成

## 6. 后续追踪

- 上线后用户反馈
- 与 YiWeb 同步迭代（aicr 新功能两边一起加）
- 评估是否反向把改进回流 YiWeb

## 7. 与其他项目关系

- YiPet ChatSidebar 已对齐（baseline 共享）
- aiChat ConversationSidebar 已对齐
- aicr FileTree 已对齐
- 三端 sidebar parity 完成

## 8. 关联记忆

- 个人 memory: `project_yivad_aicr_port.md`
- 个人 memory: `project_sidebar_parity.md`
- 工具：[FileTree baseline 文档](../../projects/YiVad/engineering/readme.md)
