---
paths:
  - "core/**/*.js"
  - "modules/**/*.js"
  - "assets/**/*.css"
  - "manifest.json"
---

# Code Pipeline Rules

1. 功能分支必须从 main/master 创建（H10），不满足则阻断
2. Gate A 未通过不得编码（H6）
3. 逐模块编码，每模块后审查：P0 必修 / P1 建议修 / P2 可选，P0 清零前进
4. 影响链未闭合不声称闭合（H3）
5. 不创建设计文档外的文件
6. fix 模式: 预检仅检查目标文件存在性，实现聚焦修改点，验证仅冒烟
7. 禁止在 content script 中使用 ES modules
8. 禁止修改第三方库源码，通过适配器模式封装
9. 禁止硬编码 API 密钥，使用配置管理