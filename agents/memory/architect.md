---
agent: architect
last_updated: 2026-04-27T00:00:00Z
entry_count: 1
---

## 记忆条目

### 2026-04-27: YiWeb 模块化重构架构分析
- YiWeb 是 CDN SPA 项目，Vue 3 Composition API + createBaseView 工厂模式
- 当前结构: `src/views/aicr/` (93 files, hooks 25433行) + `src/views/news/` (9 files)
- aicr hooks 依赖链: storeState → storeFactory → storeFileTreeOps/ContentOps/SessionsOps → useMethods → index.js
- sessionSyncService 在 core/services/aicr/ 但反向依赖 aicr/utils 和 constants (循环风险)
- aicr 与 news 之间无跨模块引用
- sessionChatContextShared.js (906行) 是最重的共享基础模块，被 sessionChat/Context/Methods 多个子模块依赖
- codeView/index.js (1314行) 是最重的组件
- 核心 AI coding 痛点: 93 文件扁平结构，无子模块边界，hooks 内部依赖隐式