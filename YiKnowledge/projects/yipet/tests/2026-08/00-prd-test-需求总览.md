---

doc_type: test
type: test
title: "YiPet 八月迭代 — 提示词分支 / RAG 集成 / 安全合规 / 跨项目桥接 / API 扩展 / IPC 增强 / 皮肤中心 — 测试总览"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-00"
source_prds:
  - "01-聊天核心-提示词历史与分支管理"
  - "02-智能功能-知识库与RAG集成"
  - "03-合规-安全合规"
  - "04-功能实现-跨项目桥接"
  - "05-基础设施-API服务扩展"
  - "06-基础设施-IPC通信架构"
  - "07-功能实现-皮肤中心重构"
source_modules:
  - "00-prd-task-需求总览"
  - "01-prd-task-提示词历史与分支管理"
  - "02-prd-task-知识库与RAG集成"
  - "03-prd-task-安全合规"
  - "04-prd-task-跨项目桥接"
  - "05-prd-task-API服务扩展"
  - "06-prd-task-IPC通信架构"
  - "07-prd-task-皮肤中心重构"
source_okr: [yipet-002, yipet-004]

type: test
---

# YiPet 八月迭代 — 测试总览

> 八月迭代从"可用"到"好用"——RAG 知识库集成、会话分支管理、跨项目桥接、安全合规加固、API 服务扩展、IPC 通信增强、弹窗皮肤中心重构。**7 个模块、64 个测试用例、零 P0 缺陷发布。**

---

## 一、迭代主题与测试策略

### 1.1 迭代目标

完成 7 大功能模块，使 YiPet 从基础聊天工具升级为知识驱动、跨项目协作的 AI 助手。

### 1.2 测试分层

| 层级 | 范围 | 用例数 | 工具 |
|------|------|--------|------|
| L1 单元 | composables、service 层、工具函数、数据验证 | 28 | Vitest + jsdom |
| L2 组件 | ChatInput、ChatSidebar、ChatToolbar、BugReportDialog、SkinCenter | 22 | @vue/test-utils + jsdom |
| L3 集成 | SSE 流式 + RAG 检索链路、跨项目桥接端到端、IPC 消息往返 | 10 | Vitest + mock chrome.* |
| L4 E2E | 完整用户旅程：安装扩展 → 皮肤选择 → 知识库查询 → Bug 报告 | 4 | Chrome DevTools Protocol |

### 1.3 风险驱动的测试重点

| 风险 | 等级 | 测试策略 |
|------|------|----------|
| SSE 断连导致消息丢失 | 高 | 指数退避重连覆盖 5 种断连场景 |
| RPC 参数名 `filter`/`query` 混用 | 高 | 契约测试：grep + 运行时断言 |
| Content Script 重复注入 | 中 | `__YIPET_LOADED__` flag + MutationObserver 防重复 |
| IPC 消息被恶意页面伪造 | 高 | IPC_SECRET + timestamp 验证覆盖 |
| chrome.storage 静默失败 | 中 | 所有写入操作检查 `chrome.runtime.lastError` |
| 弹窗皮肤配置跨组件不一致 | 中 | 状态同步测试：Popup ↔ CS ↔ SW |

---

## 二、模块级测试覆盖

### M1: 提示词历史与分支管理

**覆盖范围**：`usePromptHistory` composable、ChatInput ArrowUp/Down 导航、ChatToolbar 历史弹窗、ChatSidebar 搜索过滤、会话分支、消息编辑/删除/重生成、会话导出。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M1-01 | push 添加到队首并持久化 | 单元 | push("a"), push("b") → `["b", "a"]` | P0 |
| TC-M1-02 | 重复 push 移到队首（去重） | 单元 | push("a"), push("b"), push("a") → `["a", "b"]` | P0 |
| TC-M1-03 | 100 条上限 FIFO 淘汰 | 边界 | push 110 条 → length === 100，第 0 条为最新 | P0 |
| TC-M1-04 | removeAt 删除正确位置 | 单元 | removeAt(1) → 数组长度 -1，目标元素移除 | P1 |
| TC-M1-05 | clear 清空并持久化 | 单元 | clear() → `[]`，新实例读取仍为空 | P1 |
| TC-M1-06 | 跨实例持久化 | 单元 | 实例 A push → 实例 B 读取 → 数据一致 | P0 |
| TC-M1-07 | ArrowUp 在空输入时回呼上一条 | 组件 | 输入为空 + ArrowUp → input = 最新历史 | P0 |
| TC-M1-08 | ArrowDown 前进导航 | 组件 | ArrowUp → ArrowDown → 回到空输入 | P0 |
| TC-M1-09 | 非导航键重置历史索引 | 组件 | ArrowUp → 输入字符 → ArrowUp（从最新开始） | P1 |
| TC-M1-10 | Enter 发送前自动 push 到历史 | 组件 | 输入 + Enter → 历史数组第一条为新输入 | P0 |
| TC-M1-11 | 提示词弹窗显示最近 3 条芯片 | 组件 | push 4 条 → 弹窗仅显示前 3 条为芯片 | P1 |
| TC-M1-12 | 弹窗搜索过滤（trigram 模糊匹配） | 组件 | 输入 "bug" → 仅匹配项显示 | P1 |
| TC-M1-13 | 搜索无结果时显示建议 | 边界 | 输入 "zzz" → "No prompts match" + did-you-mean | P2 |
| TC-M1-14 | 复制按钮写入剪贴板 | 组件 | click 复制 → `navigator.clipboard.writeText` 被调用 | P2 |
| TC-M1-15 | 清空按钮含确认弹窗 | 组件 | click 清空 → 确认弹窗 → 历史为空 | P1 |
| TC-M1-16 | 侧边栏搜索过滤会话标题 | 组件 | 输入 "road" → 仅 "Q3 Roadmap" 可见 | P0 |
| TC-M1-17 | 收藏/今天/本周过滤器切换 | 组件 | click Starred → 仅 isFavorite 会话可见 | P1 |
| TC-M1-18 | branchFromMessage 创建独立分支会话 | 单元 | 从消息 3 分叉 → 新会话含前 3 条消息，父会话不变 | P0 |
| TC-M1-19 | 分支可视化（分支图标 + 父引用） | 组件 | 标题含 "(branch)" → 分支图标可见 | P1 |
| TC-M1-20 | 编辑消息更新内容 + 持久化 | 单元 | editMessage(0, "new") → messages[0].message === "new" | P0 |
| TC-M1-21 | 删除消息后数组长度 -1 | 单元 | deleteMessage(1) → length -1 | P0 |
| TC-M1-22 | 重新生成清空 AI 回复 + 重新流式 | 单元 | regenerateMessage → AI 消息内容清空 → streamChat 调用 | P0 |
| TC-M1-23 | 导出 Markdown 文件格式正确 | 组件 | 导出 → Blob 内容含 frontmatter + 消息时间线 | P1 |
| TC-M1-24 | 导出文件名特殊字符替换 | 边界 | 标题含 `/` → 文件名中替换为 `_` | P2 |

### M2: 知识库与 RAG 集成

**覆盖范围**：知识树浏览、角色类别过滤、RAG 范围限定、来源预览、子问题分解、RAG 状态监控、`@` 提及文件下拉。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M2-01 | KnowledgeService.getTree 返回树结构 | 单元 | mock fetch → 返回 `{children: [...]}` 嵌套结构 | P0 |
| TC-M2-02 | 8 个角色类别过滤器正确过滤 | 单元 | 选择 "engineer" → 仅返回 engineer 类别文件 | P0 |
| TC-M2-03 | 文件级 scope 限定（单文件 RAG） | 单元 | `scope: {type: "file", paths: ["aier/methods/agent.md"]}` | P0 |
| TC-M2-04 | 目录级 scope 限定（目录下所有文件） | 单元 | `scope: {type: "dir", paths: ["engineer/architecture/"]}` | P0 |
| TC-M2-05 | RAG 来源预览（预检无 LLM 调用） | 单元 | `previewRagSources(scope)` → 返回匹配文件列表 + 预估 chunk 数 | P1 |
| TC-M2-06 | 子问题分解 decompose | 单元 | 复杂问题 → 拆分为 3-5 个子问题 → 逐个检索 → 综合答案 | P0 |
| TC-M2-07 | RAG 状态徽章（已构建/未构建/构建中） | 组件 | 状态轮询 → 徽章颜色/文本对应状态 | P1 |
| TC-M2-08 | 一键重建索引 | 组件 | click "Rebuild" → POST `/rag/rebuild` → 徽章变为 "building" | P1 |
| TC-M2-09 | `@` 提及文件下拉实时匹配 | 组件 | 输入 "@agent" → 下拉显示匹配的 agent 相关文件 | P0 |
| TC-M2-10 | `@` 选择文件自动限定 RAG 范围 | 组件 | 选择文件 → ContextScopeBar 显示文件芯片 | P0 |
| TC-M2-11 | RAG 检索超时降级 | 异常 | RagService 超时 10s → 返回 "检索超时，请缩小范围" | P1 |
| TC-M2-12 | 知识库为空时优雅降级 | 边界 | 零知识文件 → 显示 "知识库为空" 而非报错 | P2 |

### M3: 安全合规

**覆盖范围**：CSP 合规、Token 加密存储、XSS 防护、最小权限、web_accessible_resources 精确声明、IPC 安全。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M3-01 | CSP 零 `eval()` 调用 | 静态 | `grep -r 'eval(' src/` 零匹配（含间接 eval） | P0 |
| TC-M3-02 | CSP 零远程脚本 | 静态 | manifest `content_security_policy` 不含 `https:` | P0 |
| TC-M3-03 | CSP 零内联脚本 | 静态 | 所有 `<script>` 通过 src 引用，无内联代码 | P0 |
| TC-M3-04 | Token 存储于 chrome.storage.local（非 localStorage） | 单元 | `chrome.storage.local.set({token})` → `localStorage.getItem("token") === null` | P0 |
| TC-M3-05 | Token 传输仅通过 `X-Token` 头（非 URL 参数） | 单元 | ApiClient 请求 → token 在 header 中，URL 不含 token | P0 |
| TC-M3-06 | Markdown 渲染 XSS 防护（DOMPurify） | 单元 | `<img onerror="alert(1)">` → onerror 被清洗 | P0 |
| TC-M3-07 | Markdown 渲染 XSS 防护（script 标签） | 单元 | `<script>alert(1)</script>` → 标签被移除 | P0 |
| TC-M3-08 | Markdown 渲染 XSS 防护（javascript: URL） | 单元 | `[click](javascript:alert(1))` → href 被清洗 | P0 |
| TC-M3-09 | manifest 最小权限原则 | 静态 | permissions 仅含 storage/activeTab/scripting（无 `<all_urls>` 通配） | P0 |
| TC-M3-10 | web_accessible_resources 精确声明 | 静态 | 仅 `assets/*` 和 `cdn/*`，无 `*` 通配 | P1 |
| TC-M3-11 | IPC_SECRET 防伪造消息 | 单元 | `postMessage({type: "FAKE"})` 无 secret → ISOLATED 丢弃 | P0 |
| TC-M3-12 | IPC 时间戳防重放（5s 窗口） | 单元 | 时间戳偏差 > 5s → 消息被拒绝 | P0 |
| TC-M3-13 | Content Script innerHTML 注入防护 | 静态 | `grep -r 'innerHTML' src/content/` → 零直接赋值 | P0 |
| TC-M3-14 | 敏感数据不写入 console.log（生产构建） | 静态 | `grep -r 'console.log.*token\|console.log.*secret' src/` 零匹配 | P1 |

### M4: 跨项目桥接

**覆盖范围**：YiVad 桥接、Bug 报告、页面类型检测、选中文本插入、URL 模式匹配。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M4-01 | URL 模式识别 YiVad Bug 页 | 单元 | `/bug/detail/abc` → 返回 `YiVad` | P0 |
| TC-M4-02 | URL 模式识别 YiVad 项目管理页 | 单元 | `/project/detail/x` → 返回 `YiVad` | P0 |
| TC-M4-03 | URL 模式识别 YiVad aiChat 页 | 单元 | `/aiChat` → 返回 `YiAi` | P0 |
| TC-M4-04 | 未知 URL 返回 `Other` | 单元 | `https://google.com` → 返回 `Other` | P1 |
| TC-M4-05 | bridgeToken 生成 | 单元 | POST `/bridge/generate` → 返回一次性 token | P0 |
| TC-M4-06 | bridgeToken 单次使用（防重放） | 单元 | 首次使用成功 → 第二次使用返回 403 | P0 |
| TC-M4-07 | discussInYiVad 打开新标签页（正确 URL + session key） | 组件 | click → `window.open` 调用，URL 含 `?session=xxx` | P0 |
| TC-M4-08 | discussInYiVad 含 bridgeToken | 组件 | 有 token 时 URL 含 `&bridge_token=xxx` | P1 |
| TC-M4-09 | 无活跃会话时 discussInYiVad 警告 | 边界 | activeConversation === null → ElMessage.warning | P1 |
| TC-M4-10 | BugReportDialog 自动填充 URL + 标题 | 组件 | 打开弹窗 → url/title 字段预填当前页面信息 | P0 |
| TC-M4-11 | BugReportDialog 自动推断项目 | 组件 | URL 为 YiVad bug 页 → project 字段预填 "YiVad" | P0 |
| TC-M4-12 | Bug 报告提交流程（dataService + YiKnowledge 双写） | 集成 | 提交 → dataService.createDocument 调用 + YiKnowledge 文件写入 | P0 |
| TC-M4-13 | Bug 报告验证（必填字段、severity 枚举、URL 格式） | 单元 | 空 title → 验证错误 "title is required" | P0 |
| TC-M4-14 | 选中文本自动插入聊天输入框 | 集成 | 页面选中文本 → chrome.storage.local 存储 → ChatInput 自动填充 | P1 |
| TC-M4-15 | QuickButtons 页面感知（Bug 页显示 "Analyze Bug"） | 组件 | YiVad Bug 页 → 快捷按钮含 "Analyze Bug" | P1 |

### M5: API 服务扩展

**覆盖范围**：KnowledgeService、RagService、BugService、SessionService 扩展，全部遵循 4-Tier API 架构。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M5-01 | KnowledgeService 通过 ApiClient 调用 | 单元 | 调用方法 → fetch 经 ApiClient 发出（RPC 信封格式） | P0 |
| TC-M5-02 | RagService 通过 ApiClient 调用 | 单元 | 同上 | P0 |
| TC-M5-03 | BugService 通过 ApiClient 调用 | 单元 | 同上 | P0 |
| TC-M5-04 | 所有 Service 参数使用 `filter` 非 `query` | 契约 | `grep -r '"query"' src/services/` 零匹配 | P0 |
| TC-M5-05 | 组件层零裸 fetch 调用 | 静态 | `grep -r 'fetch(' src/ --include="*.vue"` 零匹配 | P0 |
| TC-M5-06 | Service 层错误统一经 ApiClient 处理 | 单元 | ApiClient 返回 `{code: 5001}` → Service 抛出 typed error | P1 |

### M6: IPC 通信架构增强

**覆盖范围**：消息类型安全、超时重试、心跳检测、dispatchSecureEvent 封装。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M6-01 | SW → CS 消息类型安全（TypeScript 类型约束） | 单元 | 错误类型的消息 → tsc 编译报错 | P0 |
| TC-M6-02 | sendMessage 超时重试（3 次指数退避） | 单元 | SW 不响应 → 1s/2s/4s 后重试 → 3 次后 reject | P0 |
| TC-M6-03 | CS → SW 心跳检测 | 单元 | 每 30s ping → SW pong 响应 → 无响应 3 次 → 标记 SW 不可用 | P1 |
| TC-M6-04 | SW 终止后心跳恢复 | 集成 | SW 被终止 → 下次激活 → 心跳恢复 → CS 检测到 SW 可用 | P1 |
| TC-M6-05 | dispatchSecureEvent 自动附加 secret + timestamp | 单元 | dispatchSecureEvent("test", data) → CustomEvent.detail.meta 含 secret + ts | P0 |
| TC-M6-06 | 监听器验证失败静默丢弃 | 单元 | 无 secret 的 postMessage → addEventListener 不触发回调 | P1 |

### M7: 弹窗皮肤中心重构

**覆盖范围**：PetPreview、ColorPicker、RolePicker、ModelPicker、皮肤环佩戴、i18n 双语。

| 编号 | 场景 | 分类 | 验证方法 | 优先级 |
|------|------|------|----------|--------|
| TC-M7-01 | PetPreview 角色图片在渐变环内渲染 | 组件 | 挂载 → `.pet-preview-ring` 含 bg 渐变 + 角色图片 | P1 |
| TC-M7-02 | 大小滑块缩放宠物预览 | 组件 | 拖动滑块 → `transform: scale()` 更新 | P1 |
| TC-M7-03 | ColorPicker 6 色块网格渲染 | 组件 | 挂载 → 6 个 `.color-chip` 存在 | P0 |
| TC-M7-04 | 选中色块展示勾选 + 圆环高亮 | 组件 | click 色块 → `.selected` class + 圆环高亮 | P0 |
| TC-M7-05 | RolePicker 2 列角色卡片渲染 | 组件 | 挂载 → `.role-card` 2 列网格布局 | P0 |
| TC-M7-06 | 角色卡片显示图片 + 名称 | 组件 | 每张卡片含 `<img>` + 角色名文本 | P1 |
| TC-M7-07 | Model 选择器显示可用模型列表 | 组件 | 挂载 → 显示 qwen3.5/qwen3.5-think/qwen3-coder | P1 |
| TC-M7-08 | 配置变更后宠物覆盖层实时更新 | 集成 | 选择颜色 → `chrome.storage.local.set` → CS 宠物颜色更新 | P0 |
| TC-M7-09 | 配置跨标签页同步 | 集成 | Tab A 选择角色 → Tab B 宠物角色更新 | P0 |
| TC-M7-10 | 皮肤配置持久化（重启后恢复） | 集成 | 选择皮肤 → 重新加载扩展 → 皮肤保持 | P0 |
| TC-M7-11 | 浮动动画 + `prefers-reduced-motion` 防护 | 组件 | 正常模式 → 浮动动画；reduce 模式 → 静态 | P2 |
| TC-M7-12 | 皮肤中心 i18n 双语覆盖（en + zh_CN） | 组件 | 切换语言 → 所有标签/按钮文本对应语言 | P1 |

---

## 三、跨模块集成测试

| 编号 | 场景 | 覆盖模块 | 验证方法 |
|------|------|----------|----------|
| IT-01 | RAG 完整链路：`@` 选择文件 → scope 限定 → RAG 检索 → 流式回答 | M2+M5 | `@engineer/architecture` → RagService.search → SSE 流含 RAG 来源 |
| IT-02 | Bug 报告完整链路：页面检测 → 自动填充 → 提交 → YiVad + YiKnowledge 双写 | M4+M5 | Bug 页 → BugReportDialog → submit → MongoDB bugs + YiKnowledge bugs/ |
| IT-03 | 皮肤配置完整链路：Popup 选择 → CS 宠物更新 → SW 状态同步 → 重启恢复 | M7+M6 | Popup ColorPicker → IPC → CS 宠物颜色 → chrome.storage 持久化 |
| IT-04 | 跨项目会话传递：YiPet 聊天 → discussInYiVad → YiVad aiChat 页面加载会话 | M4+M1 | click discussInYiVad → 新标签页 → YiVad aiChat 含相同消息 |
| IT-05 | 分支 + 导出完整链路：创建分支会话 → 发送消息 → 导出 Markdown | M1 | branchFromMessage → sendMessage → export → Blob 内容正确 |
| IT-06 | 安全端到端：CSP 合规构建 → Token 加密存储 → IPC 消息验证 → XSS 清洗 | M3+M6 | `npm run build` → 加载扩展 → 发送消息 → IPC 验证 → Markdown 渲染安全 |

---

## 四、回归测试（七月功能保护）

确保八月新增功能不破坏七月已有的基础架构：

| 编号 | 回归场景 | 覆盖模块 | 验证方法 |
|------|----------|----------|----------|
| REG-01 | 基础 SSE 聊天仍正常 | M3(七月) | 发送消息 → SSE 流式响应 → 消息完整渲染 |
| REG-02 | 4 入口构建仍成功 | M1(七月) | `npm run build` → 4 个产物文件存在 |
| REG-03 | Content Script 注入不重复 | M5(七月) | 加载页面 → `__YIPET_LOADED__` 为 true 且仅注入一次 |
| REG-04 | 宠物拖拽仍正常 | M6(七月) | mousedown → mousemove → mouseup → 位置更新 |
| REG-05 | chrome.storage 持久化仍正常 | M3(七月) | 创建会话 → 刷新 → 会话恢复 |
| REG-06 | `tsc --noEmit` 仍零错误 | 全局 | TypeScript strict 全量通过 |

---

## 五、边缘场景与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 |
|------|------|----------|----------|
| EDGE-01 | 提示词历史为空（新用户首次） | localStorage 无 `yipet:prompt_history` | ArrowUp 无反应，弹窗显示 "No prompts yet" |
| EDGE-02 | 分支父会话被删除 | 删除父会话后切换到分支 | 分支独立存在，不级联删除 |
| EDGE-03 | 导出空会话 | 0 条消息的会话 | 仅导出标题 + 时间戳，不报错 |
| EDGE-04 | RAG scope 文件不存在 | `@mention` 已删除的知识文件 | 提示 "文件不存在"，scope 不生效 |
| EDGE-05 | bridgeToken 过期 | token 生成后 5min 未使用 | YiVad 返回 403，YiPet 提示重新生成 |
| EDGE-06 | BugReportDialog 在非 YiVad 页面打开 | 普通网站提交 Bug | project 字段为空，需手动选择 |
| EDGE-07 | IPC 消息超大（> 64MB） | 传递大 JSON payload | 消息被拒绝，错误记录到 chrome.runtime.lastError |
| EDGE-08 | chrome.storage.local 配额满 | 写入 10MB+ 数据 | `persistActive()` 返回 false，UI 提示 |
| EDGE-09 | 快速切换皮肤（连续点击 10 次） | 竞态 | 仅最后一次配置生效，无中间态闪烁 |
| EDGE-10 | SW 在 IPC 消息传输中被终止 | 消息发送期间 SW 终止 | 消息进入重试队列，SW 恢复后重发 |

---

## 六、需求追溯矩阵

| 需求 | M1 提示词 | M2 RAG | M3 安全 | M4 桥接 | M5 API | M6 IPC | M7 皮肤 | 集成 |
|------|----------|--------|---------|---------|--------|--------|---------|------|
| FR-01 提示词历史 | TC-M1-01~15 | — | — | — | — | — | — | — |
| FR-02 会话管理 | TC-M1-16~24 | — | — | — | — | — | — | IT-05 |
| FR-03 知识库集成 | — | TC-M2-01~12 | — | — | TC-M5-01 | — | — | IT-01 |
| FR-04 CSP/MV3 安全 | — | — | TC-M3-01~14 | — | — | TC-M6-05~06 | — | IT-06 |
| FR-05 跨项目桥接 | — | — | — | TC-M4-01~15 | TC-M5-03 | — | — | IT-02/IT-04 |
| FR-06 API 扩展 | — | TC-M2-01~02 | — | — | TC-M5-01~06 | — | — | — |
| FR-07 IPC 增强 | — | — | — | — | — | TC-M6-01~06 | TC-M7-08~10 | IT-03 |
| FR-08 皮肤中心 | — | — | — | — | — | — | TC-M7-01~12 | IT-03 |
| NFR-01 性能 | — | — | — | — | — | — | — | 构建<25s |
| NFR-02 安全 | — | — | TC-M3-01~14 | — | — | TC-M6-05~06 | — | IT-06 |
| NFR-03 可访问性 | — | — | — | — | — | — | TC-M7-11 | — |

---

## 七、完成定义

- [ ] M1 提示词与分支：24 用例全通过
- [ ] M2 知识库 RAG：12 用例全通过
- [ ] M3 安全合规：14 用例全通过
- [ ] M4 跨项目桥接：15 用例全通过
- [ ] M5 API 扩展：6 用例全通过
- [ ] M6 IPC 增强：6 用例全通过
- [ ] M7 皮肤中心：12 用例全通过
- [ ] 集成测试：IT-01~06 全通过
- [ ] 回归测试：REG-01~06 全通过
- [ ] 边缘场景：EDGE-01~10 全部验证
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` 成功，CSP 零违规
- [ ] `npm test` 全量通过，覆盖率 ≥ 80%
- [ ] Chrome Web Store 审核标准预检通过