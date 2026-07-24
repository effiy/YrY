# YiPet · 用户故事与组件化 / 模块化分析

> 轴线：**混合**（见 `.claude/skills/yry-init/rules/architecture-direction.md`）。
> MV3 扩展：popup / content 前端 → 组件化；background service worker → 模块化。
> 源码根：`YiPet/src/`。生成于 2026-07-24。

## 1. 概览

YiPet 是 Chrome MV3 扩展，温柔陪伴助手。manifest 驱动 popup / content / background 三套运行时。

### 1.1 前端运行时（popup + content）

| 页面 / 视图（大模块） | 路径 | 角色 |
|------------------------|------|------|
| `popup`               | `src/popup/` | 工具栏弹窗入口 |
| `content/chat`        | `src/content/chat/` | AI 对话面板 |
| `content/faq`         | `src/content/faq/` | FAQ 快捷问答 |
| `content/pet`         | `src/content/pet/` | 桌宠交互 |
| `content/session`     | `src/content/session/` | 会话历史 |
| `content/ai`          | `src/content/ai/` | AI 能力封装 |
| `content/mermaid`     | `src/content/mermaid/` | Mermaid 渲染 |

横切工具：`content/state.js`、`content/event-bus.js`、`content/messaging.js`、`content/page-info.js`、`content/viewport-utils.js`、`content/color-utils.js`、`content/media.js`。

### 1.2 后端运行时（background service worker）

| 模块 | 路径 | 职责 |
|------|------|------|
| `integrations/wework` | `src/background/integrations/wework/` | 企微集成 |
| `messaging`          | `src/background/messaging/` | 消息分发 |
| `handlers`           | `src/background/handlers/` | 命令处理 |
| `services`           | `src/background/services/` | 长任务服务 |

支撑：`src/bootstrap/`、`src/config/`、`src/api/`、`src/utils/`、`YiPet/cdn/`（共享组件库）。

## 2. 前端页面级用户故事（popup + content）

### 2.1 popup · 工具栏弹窗

- **US-P1**：作为用户，点击扩展图标弹出 popup，能快速发起新会话或打开 content 面板。
- **US-P2**：作为用户，popup 内能切换主题与查看通知。

**使用场景 · 组件化**：
- popup 与 content 共享 `YiPet/cdn/` 组件库；popup 本身保持极薄（入口壳），避免重复 content 内的 UI。

### 2.2 content/chat · AI 对话面板

- **US-CC1**：作为用户，我在任意网页按快捷键呼出 chat 面板，与 AI 多轮对话。
- **US-CC2**：作为用户，面板能感知当前页面上下文（选中文字 / 页面标题）。
- **US-CC3**：作为用户，流式回复能中断与重试。
- **US-CC4**：作为用户，消息支持 Mermaid 图表渲染。

**使用场景 · 组件化**：
- `content/mermaid/` 封装图表渲染为独立模块；chat 通过事件总线调用，不内嵌渲染逻辑。
- `content/ai/` 作为 AI 能力外观层，chat 只编排，不直接接触 background messaging。

### 2.3 content/faq · FAQ 快捷问答

- **US-F1**：作为用户，我能从 FAQ 列表一键发送预设问答。
- **US-F2**：作为用户，FAQ 能按使用频次排序。

**使用场景 · 组件化**：
- `FilterBar` 风格组件复用（来自共享 CDN），faq 仅提供数据契约。

### 2.4 content/pet · 桌宠交互

- **US-PT1**：作为用户，桌宠在页面角落常驻，可拖拽与点击触发动作。
- **US-PT2**：作为用户，桌宠能表达情绪（待机 / 思考 / 回复中）。
- **US-PT3**：作为用户，桌宠可隐藏 / 显示。

**使用场景 · 组件化**：
- `pet-manager-core.js` / `pet-manager-ui.js` / `pet-manager.js` 已分层（core / ui / facade）→ 组件化的良好样本。
- 下一步：将 pet-manager-ui 抽为 `<YiPetAvatar>` 组件入 CDN 库。

### 2.5 content/session · 会话历史

- **US-S1**：作为用户，我能查看跨页面的会话历史。
- **US-S2**：作为用户，会话能按站点 / 时间筛选。

**使用场景 · 组件化**：
- `content/session/` 与 `content/chat` 通过 `state.js` 共享状态；列表组件可复用 YiH5 的 `useListPage` 思路（跨项目复用 CDN composable）。

## 3. 后端模块级用户故事（background）

### 3.1 messaging · 消息分发

- **US-M1**：作为 content，我通过 messaging 发起请求，background 路由到对应 handler。
- **US-M2**：作为开发者，新增命令只需注册 handler，不改 messaging 核心。

**使用场景 · 模块化**：
- `background/messaging/` 是消息总线；`background/handlers/` 注册表模式 → 新增命令零侵入。

### 3.2 handlers · 命令处理

- **US-H1**：作为运维，每条命令的执行可观测（日志 / 错误）。
- **US-H2**：作为开发者，handler 失败不影响其他 handler。

**使用场景 · 模块化**：
- handler 之间不互相直调；通过 messaging 总线或 services 间接协作 → 边界清晰。

### 3.3 services · 长任务服务

- **US-SE1**：作为用户，长任务（如批量翻译）在后台持续，结果回写 content。
- **US-SE2**：作为运维，长任务可取消与查询进度。

**使用场景 · 模块化**：
- `services/` 暴露 `start() / cancel() / status()` 公共接口；handler 委派，不感知实现。

### 3.4 integrations/wework · 企微集成

- **US-W1**：作为企微成员，我能收到任务完成通知。
- **US-W2**：作为系统，企微回调能触发 background handler。

**使用场景 · 模块化**：
- `integrations/wework/` 对外暴露 `notify() / on_callback()`；SDK 适配在模块内部，不外泄。

## 4. 方向表（下一步提取 / 边界固化）

| 轴 | 机会 | 建议动作 |
|----|------|----------|
| FE | 桌宠 UI 抽组件 | `pet-manager-ui` → `<YiPetAvatar>` 入 CDN |
| FE | chat/faq/session 列表复用 | 抽 `YiListPage` composable 入 CDN，跨 YiPet / YiH5 共享 |
| FE | content 状态散点 | `state.js` 升级为 Pinia-style store（或保持极简，但显式声明 store 边界） |
| BE | handler 注册表显式化 | `handlers/index.js` 导出 `HANDLERS` 常量映射 |
| BE | services 公共 API | 每个服务模块写 `index.js` 显式导出 `start/cancel/status` |
| BE | wework 事件契约 | 定义 `WeworkEvent` 类型，handler 订阅而非直调 |

## 5. 非目标

- 不在本阶段将 background 拆为独立扩展（MV3 单扩展仍是合理解）。
- 不强制引入 Vue（content 脚本注入场景下原生组件够用）。

## 6. 链接

- 架构场景：`../arch/index.html`
- 测试场景：`../test/index.html`
- 文件清单：`../files/index.html`
- API 清单：`../apis/index.html`
- 本页 HTML：`index.html`
