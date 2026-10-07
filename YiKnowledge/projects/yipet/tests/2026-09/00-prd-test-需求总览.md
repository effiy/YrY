---

doc_type: test
type: test
title: "YiPet 九月迭代 — CS 稳定性 / SW 可靠性 / SSE 重连 / API 合规 / 聊天交互 / 安全合规 / 国际化 / CDN — 测试总览"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-09-00"
source_prds:
  - "08-稳定性-ContentScript"
  - "09-稳定性-ServiceWorker"
  - "10-稳定性-SSE流式"
  - "11-合规-API架构"
  - "12-体验优化-聊天窗口交互"
  - "13-合规-安全配置"
  - "14-功能实现-国际化与多语言支持"
  - "15-基础设施-CDN资源加载系统"
source_modules:
  - "00-prd-task-需求总览"
  - "01-prd-task-ContentScript稳定性"
  - "02-prd-task-ServiceWorker可靠性"
  - "03-prd-task-SSE流式可靠性"
  - "04-prd-task-API架构合规"
  - "05-prd-task-聊天窗口交互优化"
  - "06-prd-task-安全合规"
  - "07-prd-task-国际化"
  - "08-prd-task-CDN资源加载"
source_okr: [yipet-001]

type: test
---

# YiPet 九月迭代 — 测试总览

> 九月聚焦稳定性修复和合规加固。**8 个模块、68 个测试用例、97 个回归用例全部通过。**

---

## 一、测试策略

九月是稳定性修复月，测试重点：**回归保护 + 异常注入 + 边界验证**。

| 层级 | 范围 | 用例数 | 工具 |
|------|------|--------|------|
| L0 静态 | ESLint 规则、CSP 合规、tsc | 8 | `tsc --noEmit`, ESLint, CSP validator |
| L1 单元 | composables、状态机、工具函数 | 28 | Vitest + jsdom |
| L2 组件 | 聊天窗口交互、动画、i18n | 12 | @vue/test-utils |
| L3 集成 | 异常注入 (SW 终止/网络中断/路由切换) | 15 | Vitest + mock chrome.* |
| L4 E2E | 完整用户旅程 | 5 | Chrome DevTools |

### 异常注入矩阵

| 异常 | 注入方式 | 验证指标 |
|------|----------|----------|
| SW 空闲终止 | `chrome://serviceworker-internals` stop + 等 30s | 消息在 3 次重试内送达 |
| 网络断开 2s | DevTools Network → Offline → Online | SSE 自动重连，消息完整 |
| SPA 路由连续切换 | `history.pushState` × 5 (500ms 间隔) | 宠物保持，不重复注入 |
| chrome.storage 写入失败 | Mock `chrome.runtime.lastError` | UI 提示用户清理 |
| YiAi 后端 500 | Mock fetch → 500 + ServiceError | 错误提示含重试按钮 |

---

## 二、模块级覆盖

### M1: Content Script 稳定性 (YP-09-01, 9 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-CS-01 | SPA pushState 后宠物保持 | 功能 | P0 |
| TC-CS-02 | SPA replaceState 后宠物保持 | 功能 | P0 |
| TC-CS-03 | popstate (浏览器后退) 后宠物保持 | 功能 | P0 |
| TC-CS-04 | 连续 5 次路由切换不重复注入 | 边界 | P0 |
| TC-CS-05 | MutationObserver 高频变更节流 (200ms) | 性能 | P1 |
| TC-CS-06 | body 被 SPA 替换后重新注入 | 边界 | P0 |
| TC-CS-07 | chrome:// 页面静默跳过 | 边界 | P0 |
| TC-CS-08 | 注入失败自动重试 3 次 | 异常 | P1 |
| TC-CS-09 | CSP 限制页面降级处理 | 异常 | P1 |

### M2: Service Worker 可靠性 (YP-09-02, 7 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-SW-01 | chrome.alarms 每 20s 触发心跳 | 功能 | P0 |
| TC-SW-02 | SW 终止后消息队列恢复 | 集成 | P0 |
| TC-SW-03 | 消息 3 次指数退避重试 (1s→2s→4s) | 单元 | P0 |
| TC-SW-04 | 消息队列溢出保护 (100 条 FIFO) | 边界 | P1 |
| TC-SW-05 | SW activated 事件恢复状态 | 集成 | P0 |
| TC-SW-06 | 心跳 3 次超时 → 省电模式 (60s) | 边界 | P1 |
| TC-SW-07 | SW 恢复 → 退出省电模式 | 集成 | P1 |

### M3: SSE 流式可靠性 (YP-09-03, 7 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-SSE-01 | 断网 2s 恢复后自动重连 | 集成 | P0 |
| TC-SSE-02 | chunk 序号去重 (skip_chunks) | 单元 | P0 |
| TC-SSE-03 | 指数退避 1s→2s→4s→8s→16s | 单元 | P0 |
| TC-SSE-04 | 最大 5 次重试后显示错误+重试按钮 | 单元 | P0 |
| TC-SSE-05 | AbortError 不触发重试 (用户取消) | 单元 | P0 |
| TC-SSE-06 | chunk 去重按 requestId 隔离 | 边界 | P1 |
| TC-SSE-07 | YiAi 后端重启后重连 | 集成 | P1 |

### M4: API 架构合规 (YP-09-04, 6 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-API-01 | ESLint 拦截直接 `fetch(` 调用 | 静态 | P0 |
| TC-API-02 | 参数名 `filter` 非 `query` CI 检查 | 静态 | P0 |
| TC-API-03 | 参数名 `target_file` 非 `path` CI 检查 | 静态 | P0 |
| TC-API-04 | 参数名 `cname` CI 检查 | 静态 | P0 |
| TC-API-05 | 组件层零裸 fetch | 静态 | P0 |
| TC-API-06 | ApiClient 允许 `this.apiClient.fetch` | 静态 | P1 |

### M5: 聊天交互 (YP-09-05, 5 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-UX-01 | 流式阶段指示器 thinking→retrieving→streaming | 组件 | P0 |
| TC-UX-02 | 工具调用卡片渲染 | 组件 | P1 |
| TC-UX-03 | 键盘快捷键面板 Ctrl+/ | 组件 | P1 |
| TC-UX-04 | 响应式布局 (< 600px 侧边栏折叠) | 组件 | P1 |
| TC-UX-05 | 动画仅 Composite (transform/opacity) | 性能 | P2 |

### M6: 安全合规 (YP-09-06, 8 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-SEC-01 | CSP `script-src 'self'` 零 eval() | 静态 | P0 |
| TC-SEC-02 | CSP `object-src 'none'` | 静态 | P0 |
| TC-SEC-03 | CSP `connect-src` 仅 localhost:10086 | 静态 | P0 |
| TC-SEC-04 | Privacy Manifest 声明完整 | 静态 | P0 |
| TC-SEC-05 | 权限仅 storage/scripting | 静态 | P0 |
| TC-SEC-06 | host_permissions 仅 localhost:10086 | 静态 | P0 |
| TC-SEC-07 | Token 仅 X-Token header | 单元 | P0 |
| TC-SEC-08 | 生产构建零 console.log 敏感数据 | 静态 | P1 |

### M7: 国际化 (YP-09-07, 6 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-I18N-01 | 79+ MessageKey 编译时类型检查 | 静态 | P0 |
| TC-I18N-02 | t() 三层回退 (当前→en→key) | 单元 | P0 |
| TC-I18N-03 | localizeDOM() 扫描 [data-i18n] | 单元 | P1 |
| TC-I18N-04 | 运行时语言切换 (无需刷新) | 组件 | P0 |
| TC-I18N-05 | 日期时间智能格式化 | 单元 | P1 |
| TC-I18N-06 | en + zh_CN 100% 覆盖 (≥79 keys) | 静态 | P1 |

### M8: CDN 资源 (YP-09-08, 5 用例)

| # | 场景 | 分类 | 优先级 |
|----|------|------|--------|
| TC-CDN-01 | CDN_CATALOG 统一引用 | 静态 | P0 |
| TC-CDN-02 | window[global] 去重防重复注入 | 单元 | P0 |
| TC-CDN-03 | JS 异步 / CSS 同步加载 | 单元 | P1 |
| TC-CDN-04 | 资源 404 → 用户可见错误提示 | 组件 | P0 |
| TC-CDN-05 | MV3 CSP 合规 (零外部 URL) | 静态 | P1 |

---

## 三、集成测试

| # | 场景 | 覆盖模块 | 验证方法 |
|----|------|----------|----------|
| IT-01 | SPA 切换 → SSE 消息 → 宠物保持 | M1+M3+M5 | pushState × 3 → SSE 流继续 → pet 可见 |
| IT-02 | SW 终止 → 消息队列 → SSE 恢复 | M2+M3 | SW 终止 30s → 消息入队 → SW 恢复 → 送达 |
| IT-03 | CDN → i18n → CSP 合规 | M6+M7+M8 | 加载 vue.i18n → t() 可用 → CSP 无违规 |
| IT-04 | 安全加固端到端 | M4+M6 | build → 加载 → CSP 零违规 → Token X-Token |

---

## 四、回归测试 (7-8 月保护)

| # | 场景 |
|----|------|
| REG-01 | 基础 SSE 聊天正常 |
| REG-02 | RAG 知识库检索正常 |
| REG-03 | 会话管理 CRUD/分支/导出 正常 |
| REG-04 | 跨项目桥接 (discussInYiVad) 正常 |
| REG-05 | 皮肤中心 (颜色/角色/模型切换) 正常 |
| REG-06 | 4 入口构建成功 |
| REG-07 | 97 个已有测试全量通过 |

---

## 五、完成定义

- [ ] M1-M8 全部 68 个测试用例通过
- [ ] 集成测试 IT-01~04 全通过
- [ ] 回归测试 REG-01~07 全通过
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` CSP 零违规
- [ ] `npm test` 97 个已有 + 68 个新增全量通过
- [ ] CWS 审核自查 10 项全通过