---
paths:
  - "**/*.js"
  - "**/*.ts"
  - "**/*.vue"
  - "**/*.jsx"
  - "**/*.tsx"
---

# Code Pipeline Rules

## 分支隔离

1. 功能分支必须从 main/master 创建，各分支独立禁止派生（`bad-branch`）
2. 禁止将功能分支自动合并到 main（`auto-merge`）
3. 改动源代码前必须已切换到 `feat/<project>-<name>` 分支（`no-checkout`）
4. 源码修改必须通过 `/rui code` 管线进行

## 实现

5. Gate A 未通过不得编码（`skip-gate-a`），单行 CSS 变更可跳过
6. 逐模块编码，每模块后审查：P0 必修 / P1 建议修 / P2 可选，P0 未清零不进下一模块
7. 影响链未闭合不声称闭合（`chain-broken`）
8. 不创建设计文档外的文件
9. fix 模式: 预检仅检查目标文件存在性，实现聚焦修改点，验证仅冒烟

## 验证

10. Gate B: 环境快照→静态预检→对齐→单次执行→产出三报告，缺一不通过。修复≤2轮（`gate-b-limit`）
11. 三报告交叉引用闭合，评审清单全部 ✅ 方可通过
12. 自改进必须产出 08-自改进复盘.md（`no-metrics` 降级不阻断）

## 产出

13. 目录命名规则见 [doc-generation.md](doc-generation.md)
