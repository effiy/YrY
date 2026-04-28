---
agent: planner
last_updated: 2026-04-27T10:00:00Z
entry_count: 1
---

## 记忆条目

### 2026-04-27 模块化目录重构分析
- 当前结构: src/views/aicr/(93文件), src/views/news/(9文件), cdn/(150文件), src/core/(15文件)
- 关键模式: createBaseView工厂 + createStore/useComputed/useMethods三件套 + registerGlobalComponent注册 + componentModules动态import
- 路径硬编码: HTML中../../views/aicr/styles/index.css、JS中/src/views/aicr/绝对路径、组件中css:/html:绝对路径
- 跨模块依赖: sessionSyncService.js在core/services/aicr/下但依赖aicr/utils和aicr/constants
- hooks目录: 46个文件, flat结构+部分子目录(methods/state/computed/helpers), 需进一步子域拆分