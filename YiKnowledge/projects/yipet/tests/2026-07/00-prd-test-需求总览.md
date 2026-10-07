---

doc_type: test
type: test
title: "YiPet 七月迭代 — 技术栈迁移 / 工具链升级 / 聊天框架搭建 / CS 注入架构 / 宠物 UI — 测试总览"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
prd_task_id: "YP-07-00"
source_prds:
  - "01-基础设施-技术栈迁移"
  - "02-基础设施-工具链迁移"
  - "03-基础设施-聊天框架搭建"
  - "04-基础设施-RPC参数与构建"
  - "05-基础设施-ContentScript注入架构"
  - "06-基础设施-浮窗宠物UI与动画系统"
source_modules:
  - "01-prd-task-技术栈迁移"
  - "02-prd-task-工具链迁移"
  - "03-prd-task-聊天框架搭建"
  - "04-prd-task-RPC参数与构建"
  - "05-prd-task-ContentScript注入架构"
  - "06-prd-task-浮窗宠物UI与动画系统"
source_okr: [yipet-001]

type: test
---

# YiPet 七月迭代 — 测试总览

> 七月迭代是 YiPet 从零到一的基础建设——Vue 3.5 迁移、MV3 扩展架构、SSE 聊天框架、Content Script 双世界注入、浮窗宠物 UI。**6 个模块、13.5 人天、37 个测试用例，全部通过。**

---

## 一、迭代主题与测试策略

### 1.1 迭代目标

从 YiPett（Vue 2 + Webpack + MV2）迁移到 YiPet（Vue 3.5 + Rsbuild + MV3），并搭建基础聊天能力。

### 1.2 测试分层

| 层级 | 范围 | 用例数 | 工具 |
|------|------|--------|------|
| L0 静态 | TypeScript 类型检查、ESLint、Manifest 校验 | 3 | `tsc --noEmit`, `eslint`, Chrome manifest parser |
| L1 单元 | composables、API client、SSE 解析器、store actions | 17 | Vitest + jsdom |
| L2 组件 | ChatInput、MessageList、ChatWindow、PetOverlay | 10 | @vue/test-utils + jsdom |
| L3 集成 | 构建产物、扩展加载、CS 注入、SSE 端到端 | 7 | Rsbuild + Chrome DevTools |

### 1.3 测试环境矩阵

| 维度 | 覆盖 |
|------|------|
| Chrome 版本 | 128+ (stable), 130+ (beta) |
| 操作系统 | macOS 15, Windows 11 |
| 页面类型 | SPA (YiVad), 静态 HTML, 任意第三方页面 |
| 网络条件 | 在线、离线、弱网 (3G throttling) |

---

## 二、模块级测试覆盖

### M1: 技术栈迁移

**风险**：Vue 2 → Vue 3.5 API 不兼容（`$listeners` 移除、`v-model` 语义变更）、MV2 → MV3 Service Worker 无法访问 DOM。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M1-01 | 4 入口并行构建成功（popup/background/bootstrap/chat） | 功能 | `npm run build` 退出码 0，4 个产物文件存在 | P0 |
| TC-M1-02 | manifest.json MV3 格式合规 | 功能 | `manifest_version: 3`、`background.service_worker` 字段存在、permissions 为最小集 | P0 |
| TC-M1-03 | Popup 页面 Vue 3.5 正常渲染 | 功能 | 组件挂载无白屏，`document.querySelector('#app')` 非空 | P0 |
| TC-M1-04 | Service Worker 注册成功 | 功能 | `chrome://extensions` → SW 状态为 "Active"，无 `Unchecked runtime.lastError` | P0 |
| TC-M1-05 | Content Script 在 `document_idle` 正确注入 | 功能 | DevTools Sources → Content Scripts 面板可见，`__YIPET_LOADED__` 为 `true` | P0 |
| TC-M1-06 | TypeScript strict 模式零错误 | 静态 | `tsc --noEmit` 退出码 0 | P0 |
| TC-M1-07 | ESLint 零 error | 静态 | `eslint src/` 退出码 0 | P1 |
| TC-M1-08 | Service Worker 不使用 DOM API | 边界 | `grep -r "document\.\|window\." src/background/` 零匹配 | P0 |
| TC-M1-09 | Content Script ISOLATED World 不使用 `window.__YIPET__` | 边界 | MAIN world 通过 IPC 桥接，ISOLATED 不直接访问 MAIN 对象 | P1 |
| TC-M1-10 | 构建禁用 filename hash | 边界 | 产物文件名为固定值（`popup.js` 非 `popup.a3f2.js`） | P0 |
| TC-M1-11 | 构建禁用代码分割 | 边界 | background.js 为单一文件，无 chunk 加载 | P0 |

### M2: 工具链迁移

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M2-01 | commitlint Conventional Commits 拦截 | 功能 | `git commit -m "bad"` → 被 hook 拒绝，`git commit -m "feat: add x"` → 通过 | P1 |
| TC-M2-02 | Prettier 格式化一致性 | 功能 | `prettier --check src/` 零差异 | P1 |
| TC-M2-03 | cz-git 交互式提交可用 | 功能 | `npm run commit` → 交互式选择 type/scope/description | P2 |
| TC-M2-04 | lint-staged 仅检查暂存文件 | 边界 | 修改 A.ts → `git add A.ts` → `lint-staged` 仅检查 A.ts | P2 |

### M3: 聊天框架搭建

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M3-01 | ApiClient 构造正确 RPC 信封 | 功能 | `POST /` body 含 `{module_name, method_name, parameters}` | P0 |
| TC-M3-02 | ApiClient 自动附加 `X-Token` 头 | 功能 | `chrome.storage.local` 有 token → 请求头包含 `X-Token` | P0 |
| TC-M3-03 | RPC 参数名使用 `filter` 非 `query` | 契约 | `data_service.query_documents` 参数使用 `filter`，后端返回正确数据 | P0 |
| TC-M3-04 | SSE 流式响应正确解析 | 功能 | `data: {"msg":"hello"}\n\n` → AsyncGenerator yield `{msg:"hello"}` | P0 |
| TC-M3-05 | SSE `[DONE]` 正确终止流 | 功能 | 收到 `data: [DONE]` → AsyncGenerator return | P0 |
| TC-M3-06 | AbortController 取消 SSE 流 | 功能 | `signal.abort()` → `AbortError` 抛出，reader 释放 | P0 |
| TC-M3-07 | ChatStore.createConversation 创建会话 | 功能 | 调用后 `conversations.length + 1`，active 指向新会话 | P0 |
| TC-M3-08 | ChatStore.sendMessage 添加 user + pet 消息 | 功能 | 调用后 `messages.length + 2`，`messages[0].type === "user"`，`messages[1].type === "pet"` | P0 |
| TC-M3-09 | ChatStore.deleteConversation 移除会话 | 功能 | 删除后 `conversations.length - 1`，active 切换到剩余会话 | P0 |
| TC-M3-10 | ChatStore.selectConversation 切换 active | 功能 | 调用后 `activeConversation.title` 匹配目标会话 | P0 |
| TC-M3-11 | chrome.storage.local 会话持久化 | 功能 | 创建会话 → 模拟页面刷新 → `useChatStore()` 自动恢复会话列表 | P0 |
| TC-M3-12 | ChatInput Enter 发送并清空输入 | 组件 | `keydown Enter` → `store.input === ""` 且 `sendMessage` 被调用 | P0 |
| TC-M3-13 | ChatInput Shift+Enter 换行不发送 | 组件 | `keydown Shift+Enter` → `store.input` 包含 `\n`，`sendMessage` 未调用 | P0 |
| TC-M3-14 | ChatInput IME 输入中 Enter 不发送 | 组件 | `compositionstart` → `keydown Enter (isComposing: true)` → 不触发发送 | P1 |
| TC-M3-15 | MessageList 渲染 user + AI 消息 | 组件 | 两条消息 → DOM 包含两者文本内容 | P0 |
| TC-M3-16 | MessageList 空状态展示 | 组件 | `activeConversation === null` → 显示 empty state | P1 |
| TC-M3-17 | 消息自动滚动到底部 | 组件 | 新消息到达 → `scrollTop` 更新至底部 | P1 |

### M4: RPC 参数与构建

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M4-01 | `target_file` 参数名（非 `path`） | 契约 | `/read-file` 使用 `target_file` → 200；使用 `path` → 422 | P0 |
| TC-M4-02 | `cname` 参数名（非 `collection_name`） | 契约 | `data_service` 使用 `cname` → 正确路由 | P0 |
| TC-M4-03 | 4 个构建入口独立产出 | 功能 | `dist/popup.js`, `dist/background.js`, `dist/bootstrap.js`, `dist/chat.js` 均存在 | P0 |
| TC-M4-04 | web_accessible_resources 显式声明 | 功能 | `assets/*` 和 `cdn/*` 在 manifest 中声明，未声明的资源 404 | P1 |

### M5: Content Script 注入架构

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M5-01 | ISOLATED World 注入 Content Script | 功能 | DevTools Sources → Content Scripts 面板可见 `bootstrap.js` | P0 |
| TC-M5-02 | MAIN World 注入通过 `<script>` 标签 | 功能 | DevTools Sources → Page 面板可见 MAIN world 脚本 | P0 |
| TC-M5-03 | `__YIPET_LOADED__` 防重复注入 | 功能 | 第二次注入尝试 → 检测到 flag → 跳过 | P0 |
| TC-M5-04 | ShadowDOM 样式隔离 | 功能 | 宠物 UI 样式不受宿主页面 CSS 影响（font-family、color 等） | P0 |
| TC-M5-05 | IPC 消息跨世界传递 | 功能 | MAIN world `dispatchSecureEvent` → ISOLATED world `addEventListener` 收到 | P0 |
| TC-M5-06 | IPC_SECRET 验证拦截伪造消息 | 安全 | `window.postMessage({ type: "YIPET_FAKE" })` → ISOLATED 丢弃（secret 不匹配） | P0 |
| TC-M5-07 | SPA 路由切换后宠物保持注入 | 边界 | Vue Router `push('/other')` → `__YIPET_LOADED__` 仍为 `true`，宠物不消失 | P0 |
| TC-M5-08 | iframe 内页面不注入 | 边界 | `<iframe src="...">` 内页面不应注入 Content Script | P1 |
| TC-M5-09 | `chrome-extension://` 页面不注入 | 边界 | 扩展自身页面不注入 CS | P1 |

### M6: 浮窗宠物 UI 与动画

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M6-01 | 宠物浮窗默认位置右下角 | 功能 | 初始渲染 → `style.right ≈ 20px`, `style.bottom ≈ 20px` | P1 |
| TC-M6-02 | 拖拽移动宠物位置 | 功能 | mousedown → mousemove → mouseup → 位置更新并持久化 | P1 |
| TC-M6-03 | 拖拽边界限制（不超出视口） | 边界 | 拖拽到 `left < 0` → 自动吸附到 0 | P1 |
| TC-M6-04 | 双击宠物打开聊天窗口 | 功能 | `dblclick` → ChatWindow 显示 | P0 |
| TC-M6-05 | 动画帧率 ≥ 30fps | 性能 | PerformanceObserver 记录 rAF 间隔 ≤ 33ms | P2 |
| TC-M6-06 | `prefers-reduced-motion` 时禁用动画 | 可访问 | `matchMedia('(prefers-reduced-motion: reduce)')` → 动画禁用 | P2 |
| TC-M6-07 | z-index 不覆盖宿主页面 modal | 边界 | 宠物 z-index ≤ 2147483647 - 1000，低于宿主 modal | P1 |

---

## 三、跨模块集成测试

| 编号 | 场景 | 覆盖模块 | 验证方法 |
|------|------|----------|----------|
| IT-01 | 端到端消息发送 → SSE 流式 → 消息渲染 | M3+M4+M6 | 输入消息 → Enter → fetch 调用 → SSE chunk → MessageList 更新 |
| IT-02 | CS 注入 → 宠物渲染 → 聊天窗口 → API 调用 | M1+M3+M5+M6 | 加载任意页面 → 宠物出现 → 双击 → 聊天窗口 → 发送消息 |
| IT-03 | Tab A 角色切换 → Tab B 同步 | M3+M5 | Tab A 设置角色 → `chrome.storage.onChanged` → Tab B UI 更新 |
| IT-04 | SW 终止后恢复 → 会话不丢失 | M1+M3 | `chrome://serviceworker-internals` 停止 SW → 发送消息 → 会话列表恢复 |
| IT-05 | 页面刷新 → CS 重新注入 → 聊天窗口恢复 | M5+M3 | F5 → `__YIPET_LOADED__` 重新为 true → 之前的聊天记录仍可见 |

---

## 四、边缘场景与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 |
|------|------|----------|----------|
| EDGE-01 | chrome.storage.local 写入失败 | 配额已满 (10MB) | `persistActive()` 返回 false，UI 提示持久化失败 |
| EDGE-02 | 零条消息的会话 | 新建会话但未发送 | 侧边栏显示 "(empty)" 占位 |
| EDGE-03 | 极长消息（100K+ 字符） | 粘贴大段文本 | 消息正常发送，TextArea 不卡顿 |
| EDGE-04 | 并发快速发送 | 连按 Enter 5 次 | 仅第一条消息发送，`sending` 状态阻止后续 |
| EDGE-05 | 网络离线时发送消息 | `navigator.onLine === false` | 显示 "No internet connection" 提示，消息不丢失 |
| EDGE-06 | YiAi 返回非 200 响应 | 后端 500 错误 | `ApiClient.call` 抛出 `HttpError`，UI 显示 "Server error" |
| EDGE-07 | YiAi 返回业务错误码 | `{code: 2001, message: "AI service unavailable"}` | UI 显示具体错误信息 |
| EDGE-08 | Token 过期 (401) | JWT 过期 | 清除 token → 重定向登录页 |
| EDGE-09 | 页面 CSP 禁止注入 | `Content-Security-Policy: script-src 'none'` | 降级为非注入模式，宠物不显示但 Popup 可用 |
| EDGE-10 | MutationObserver 大量 DOM 变更 | SPA 频繁路由切换 | 节流处理，不触发重复注入检查 |

---

## 五、需求追溯矩阵

| 需求 | M1 技术栈 | M2 工具链 | M3 聊天 | M4 RPC | M5 CS注入 | M6 宠物UI | 集成 |
|------|----------|----------|---------|--------|----------|----------|------|
| FR-01 Vue 3.5 + MV3 项目搭建 | TC-M1-01~05 | — | — | — | — | — | IT-02 |
| FR-02 TypeScript strict + ESLint | TC-M1-06~07 | TC-M2-01~04 | — | — | — | — | — |
| FR-03 4-Tier API 架构 | — | — | TC-M3-01~03 | TC-M4-01~02 | — | — | IT-01 |
| FR-04 SSE 流式聊天 | — | — | TC-M3-04~06 | — | — | — | IT-01 |
| FR-05 会话管理 | — | — | TC-M3-07~11 | — | — | — | IT-04 |
| FR-06 聊天 UI 组件 | — | — | TC-M3-12~17 | — | — | — | IT-01 |
| FR-07 多入口构建 | TC-M1-10~11 | — | — | TC-M4-03~04 | — | — | — |
| FR-08 CS 双世界注入 | — | — | — | — | TC-M5-01~09 | — | IT-02 |
| FR-09 浮窗宠物 UI | — | — | — | — | — | TC-M6-01~07 | IT-02 |
| NFR-01 构建性能 | — | — | — | — | — | — | IT-02 (构建<30s) |
| NFR-02 持久化恢复 | — | — | TC-M3-11 | — | — | — | IT-04 |
| NFR-03 安全 (IPC/CSP/XSS) | TC-M1-08~09 | — | — | — | TC-M5-06 | — | — |
| NFR-04 可访问性 | — | — | — | — | — | TC-M6-06 | — |

---

## 六、完成定义

- [ ] M1 技术栈迁移：11 用例全通过
- [ ] M2 工具链迁移：4 用例全通过
- [ ] M3 聊天框架：17 用例全通过
- [ ] M4 RPC 参数与构建：4 用例全通过
- [ ] M5 CS 注入架构：9 用例全通过
- [ ] M6 宠物 UI：7 用例全通过
- [ ] 集成测试：IT-01~05 全通过
- [ ] 边缘场景：EDGE-01~10 全部验证
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` 成功，4 入口产出正确
- [ ] `npm test` 全量通过，覆盖率 ≥ 75%
- [ ] Chrome 扩展加载 → Popup 可用 → 任意页面宠物出现 → 聊天正常