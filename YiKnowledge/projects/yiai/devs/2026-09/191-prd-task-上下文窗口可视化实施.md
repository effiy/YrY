---
doc_type: doc
title: "YA-09-138: 上下文窗口可视化 — 实施日志"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
source: internal
type: report
related_tests: ["191-test-上下文窗口可视化"]
---

# YA-09-138: 上下文窗口可视化 — 实施日志

> 来源 dev: [191-prd-task-上下文窗口可视化.md](./191-prd-task-上下文窗口可视化.md)
> 实施日期: 2026-09-23

## 已完成

### 前端

| 文件 | 变更 | 说明 |
|------|------|------|
| `YiVad/src/stores/modules/aiChat.ts` | 新增 `tokenUsage` ref + `updateTokenUsage()` + watcher | 自动估算 system/user/assistant token 分配,每次消息变更后更新 |
| `YiVad/src/views/ai-chat/components/ChatToolbar/ContextIndicator.vue` | 重写为 token 用量进度条 | 绿色(<40%)/隐藏/黄色(70-90%)/红色(>90%,pulse),hover Popover 显示详细分解 |
| `YiVad/src/components/AiChatBox/AiChatBox.vue` | 标题旁添加 `<TokenUsageBar />` | fill 模式聊天 header 中紧贴标题右侧 |
| `YiVad/src/views/ai-chat/components/ChatInput.vue` | 上下文溢出警告条 | >90% 时输入框上方显示 `/compact` 和 `/new` 建议 |

### 后端

| 文件 | 变更 | 说明 |
|------|------|------|
| — | 待实施 | 需在 SSE `onDone` 中返回 `usage` 字段 |

## 待实施

- [ ] 后端 SSE 返回实际 token 计数（当前前端用 chars/4 估算）
- [ ] ModelSelector 展示各模型 context window size
- [ ] 压缩后进度条回落到正常范围（当前 watcher 自动更新）

## 验证

```bash
cd YiVad && pnpm type:check  # 0 errors
```
