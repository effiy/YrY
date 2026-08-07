---
title: Knowledge preview dialog local LLM chat
aliases: [knowledge-preview-chat, preview-local-model, knowledge-chat-panel-model]
tags: [yivad, aiChat, knowledge, preview, chat, model-selector, local-llm, ollama]
category: engineer/projects/yivad
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: YiVad/src/views/aiChat/components/KnowledgeChatPanel.vue
type: feature
status: stable
lifecycle: active
review_cycle: quarterly
tacit: false
roles: [engineer, ai-engineer]
benefit: "Users can select any available Ollama model to chat about knowledge files in the preview dialog, instead of being locked to the default model"
acceptance_criteria:
  - "model selector is visible in the preview dialog chat panel toolbar"
  - "available models are fetched from the YiAi backend (Ollama proxy)"
  - "selected model is persisted per file in localStorage"
  - "model selection is used in streamChat calls"
related:
  - ./functional-modules.md
  - ./architecture.md
  - ./knowledge-preview-dialog-modules.md
  - ./engineering/claude.md
  - ./engineering/readme.md
---

# Knowledge preview dialog local LLM chat

> **As a** user, **I want to** select a local LLM model when chatting about a knowledge file in the preview dialog, **so that** I can use different models for different tasks.

## Summary

The `KnowledgePreviewDialog` embeds a `KnowledgeChatPanel` on the right side when the chat toggle is on. The chat panel already supported streaming chat via `streamChat`, but the model was hardcoded to `qwen3.5`. This feature adds a model selector to the chat panel toolbar, allowing users to choose any Ollama model available on the YiAi backend.

## Component architecture

```
KnowledgePreviewDialog.vue
  └─ showChat ? KnowledgeChatPanel.vue
       ├─ ChatToolbar (with model selector)
       │    ├─ selectedModel → from local ref (per-file persistence)
       │    └─ availableModels → from aiChat Pinia store (shared, fetched once)
       └─ send() → streamChat({ model: selectedModel.value, ... })
```

## Data flow

```
User opens model dropdown
  → ChatToolbar @visible-change → store.fetchModels()
  → GET /models (YiAi Ollama proxy)
  → store.availableModels populated
  → el-select renders model list

User selects a model
  → @update-selected-model → selectedModel = $event
  → watch(selectedModel) → localStorage.setItem(kchat:model:<filePath>, model)

User sends a message
  → send() → streamChat({ model: selectedModel.value, ... })
  → YiAi chat_service.chat with the selected model
```

## Key implementation details

### Model state ownership

| State | Owner | Reason |
|---|---|---|
| `selectedModel` | KnowledgeChatPanel (local ref) | Per-file persistence — each file remembers its own model choice |
| `availableModels` | aiChat Pinia store | Shared across the app — fetched once, reused everywhere |
| `fetchModels()` | aiChat Pinia store | ChatToolbar already calls `store.fetchModels()` on dropdown open |

### Storage keys

| Key | Value | Scope |
|---|---|---|
| `kchat:model:<filePath>` | model name string (e.g. `qwen3.5`) | Per-file model selection |
| `kchat:msgs:<filePath>` | JSON array of LocalMessage | Per-file chat history |
| `kchat:cfg:<filePath>` | JSON of PanelSettings | Per-file RAG/web-search toggles |

### Default model

`qwen3.5` — same as the main aiChat page default. The model list is fetched from the YiAi backend which proxies Ollama's `/api/tags`.

### RAG path unchanged

When RAG mode is on, `streamRagChat` is used instead of `streamChat`. The RAG service does not accept a model parameter — the backend uses its own default model for RAG retrieval + generation.

## Usage

1. Open any knowledge file in the aiChat page (click a file link or use the knowledge tree)
2. Click the chat icon (💬) in the preview dialog toolbar → the right panel opens with the chat interface
3. Click the model dropdown in the chat toolbar → available models are fetched from the backend
4. Select a model (e.g. `llama3`, `qwen3.5`, `mistral`)
5. Type a question and press Enter — the chat uses the selected model
6. The model selection persists per file — re-opening the same file restores the last chosen model

## When not to use

- This feature is only for the **standard LLM streaming** path in the chat panel. When RAG mode is enabled, the backend selects the model.
- The translation feature in `KnowledgePreviewDialog` (`translateTo`) always uses `qwen3.5:4b` — it does not use the model selector.
- This is distinct from the main aiChat page's model selector (`AiChatBox` → `ChatInput` → `ChatToolbar`) which uses `store.selectedModel` (global, not per-file).