---
title: AI Chat Port PRD Instance
aliases:
  - aiChat port PRD
  - AI chat migration PRD
  - Chat porting requirements
tags:
  - PRD
  - chat
  - AI
  - migration
  - port
  - YiWeb
  - YiVad
category: product-manager/discovery/prd
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - engineer
benefit: PMs and engineers have a concrete PRD instance for porting the AI Chat feature from YiWeb to YiVad, including migration scope, feature parity requirements, and rollout plan
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./brd-agent-prd.md
  - ../../frameworks/write-a-spec-or-prd.md
  - ../../discovery/ux--ai-product-ux-patterns.md
  - ../../../knowledge-curator/templates/prd.md
  - ../../../engineer/lessons/win-yivad-aichat-port.md
---

# AI Chat Port PRD Instance

> **As a** product manager, **I want to** define the requirements for porting the AI Chat feature from YiWeb to YiVad, **so that** the engineering team has a clear specification for migration scope, feature parity, and rollout plan.

> This is a concrete PRD instance for porting the AI Chat (sessionChat) feature from YiWeb to YiVad. The port must achieve full feature parity while adapting to YiVad's architecture (Vue 3 Composition API, Pinia stores, Rsbuild). Reference the PRD template at [../../../knowledge-curator/templates/prd.md](../../../knowledge-curator/templates/prd.md).

## Summary

- The AI Chat port migrates the sessionChat feature from YiWeb (legacy codebase) to YiVad (modern codebase). The goal is feature parity: YiVad aiChat must support all features that YiWeb sessionChat supports.
- Migration scope includes: multi-session conversation management, streaming response display, per-message actions (regenerate, retry, resend, delete, edit), agent mode with system prompt configuration, and conversation persistence.
- Feature parity requirements are organized into four categories: core chat (must have), message actions (must have), agent mode (should have), and advanced features (could have).
- The port must adapt to YiVad's architecture: Vue 3 Composition API (not Vue 2 Options API), Pinia stores (not YiWeb's custom store pattern), and Rsbuild (not Vite).
- Rollout plan: phase 1 (core chat + message actions), phase 2 (agent mode), phase 3 (advanced features). Each phase is independently shippable.

## Core viewpoints

- **Feature parity does not mean code parity** -- the YiWeb code cannot be copy-pasted into YiVad. The architecture is different (Vue 3 vs. Vue 2, Pinia vs. custom stores, Rsbuild vs. Vite). The PRD defines what the feature does, not how it is implemented.
- **The streaming experience is the differentiator** -- the core value of AI Chat is the streaming response experience. Users see the AI thinking and responding in real-time. Any degradation in streaming performance (latency, jank, interruption) is a regression.
- **Per-message actions are the trust mechanism** -- regenerate (try again), retry (network error), resend (edited message), delete (remove), edit (correct). These actions give the user control over the conversation. Without them, the user is a passive observer.
- **Agent mode is the strategic differentiator** -- basic chat is a commodity. Agent mode (system prompt, tool use, multi-step reasoning) is what differentiates YiVad aiChat from generic chat interfaces. The port must preserve and enhance agent capabilities.

## Key information

### Background and problem

**Current state**: YiWeb has a mature sessionChat feature used by internal teams. YiVad is the next-generation platform that will replace YiWeb. The sessionChat feature must be ported to YiVad to enable the migration of users from YiWeb to YiVad.

**Problem statement**: How might we port the AI Chat feature from YiWeb to YiVad with full feature parity while adapting to YiVad's modern architecture and enabling future enhancements?

**Business value**:
- Enables YiWeb -> YiVad migration for chat users
- Establishes the chat foundation for all YiVad AI features (aicr, knowledge, agent)
- Provides a modern, maintainable codebase for future chat enhancements
- Eliminates dependency on the legacy YiWeb codebase

### Migration scope

**In scope (must port)**:
- Multi-session conversation management (create, rename, delete, switch sessions)
- Streaming response display (real-time token-by-token rendering)
- Per-message actions: regenerate, retry, resend, delete, edit
- Conversation history persistence (localStorage, optionally server-side)
- Basic chat UI: message list, input area, send button, auto-scroll

**In scope (should port)**:
- Agent mode: system prompt configuration UI
- Streaming type selection (different streaming modes)
- Follow-up queue and QueueMode
- Aborted flag for cancelled messages
- Thinking text display (chain-of-thought visualization)

**In scope (could port)**:
- Multi-modal input (image upload, file attachment)
- Conversation export (Markdown, PDF)
- Conversation search
- Keyboard shortcuts (Ctrl+Enter to send, etc.)

**Out of scope (not in this PRD)**:
- Server-side conversation storage (separate PRD)
- Multi-user collaboration on conversations (separate PRD)
- Conversation analytics (separate PRD)

### Feature parity requirements

**Category 1: Core Chat (Must Have)**

| Feature | YiWeb behavior | YiVad requirement | Acceptance criteria |
|---|---|---|---|
| Conversation list | Sidebar with session list, create/rename/delete | ConversationSidebar component with session list, create/rename/delete | User can create, rename, delete, and switch between sessions |
| Message input | Textarea with send button, Enter to send, Shift+Enter for newline | Textarea with send button, Enter to send, Shift+Enter for newline | User can type and send messages |
| Streaming response | Real-time token-by-token rendering, scroll to bottom on new tokens | Real-time token-by-token rendering with scrollTick, auto-scroll | Response appears token-by-token; scroll follows content |
| Message display | User messages (right-aligned), AI messages (left-aligned), timestamps | User messages (right-aligned), AI messages (left-aligned), relative timestamps | Messages are clearly attributed and timestamped |
| Markdown rendering | AI responses rendered as Markdown (code blocks, lists, tables) | AI responses rendered as Markdown with syntax highlighting | Code blocks are syntax-highlighted; lists and tables render correctly |
| Error handling | Error message displayed, retry button | Error message with retry and descriptive error text | Network errors, API errors, and timeout errors are handled gracefully |

**Category 2: Message Actions (Must Have)**

| Feature | YiWeb behavior | YiVad requirement | Acceptance criteria |
|---|---|---|---|
| Regenerate | Re-generate the last AI response | Re-generate the last AI response for the selected message | AI response is regenerated; old response is replaced |
| Retry | Retry a failed message send | Retry a failed message send with the same content | Failed message is re-sent; error state is cleared |
| Resend | Re-send a message (useful after editing) | Re-send a message after editing | Edited message is sent as a new message |
| Delete | Delete a message from the conversation | Delete a message with confirmation | Message is removed from the conversation |
| Edit | Edit a user message and re-send | Edit a user message in-place and re-send | User can edit the message text; AI re-responds to the edited message |
| Copy | Copy AI response to clipboard | Copy AI response to clipboard with success feedback | Response is copied; user sees a confirmation |

**Category 3: Agent Mode (Should Have)**

| Feature | YiWeb behavior | YiVad requirement | Acceptance criteria |
|---|---|---|---|
| System prompt | System prompt configuration in settings | System prompt configuration UI in the chat interface | User can set and edit the system prompt |
| Streaming type | Select streaming mode (standard, agent, thinking) | Streaming type selector with visual indicator | Streaming mode changes the response rendering |
| Thinking display | Show chain-of-thought in a collapsible section | Thinking text displayed in a collapsible section | User can expand/collapse the thinking section |
| Follow-up queue | Queue follow-up messages during agent loop | Follow-up queue with QueueMode configuration | Messages are queued during agent execution |
| Terminate flag | Terminate the agent loop | Terminate button that stops the agent | Agent loop stops; partial response is displayed |

**Category 4: Advanced Features (Could Have)**

| Feature | Priority | Notes |
|---|---|---|
| Multi-modal input | Could | Image upload, file attachment |
| Conversation export | Could | Export as Markdown or PDF |
| Conversation search | Could | Search across all conversations |
| Keyboard shortcuts | Could | Ctrl+Enter to send, Esc to close |
| Dark mode | Could | System preference detection |

### Architecture requirements

**YiVad architecture constraints**:
- Framework: Vue 3 with Composition API (not Vue 2 Options API)
- State management: Pinia stores (not YiWeb custom stores)
- Build tool: Rsbuild (not Vite)
- TypeScript: strict mode
- SSE handling: EventSource or fetch with ReadableStream

**Component structure**:
```
src/views/aiChat/
  index.vue              -- Main chat view
  components/
    ConversationSidebar  -- Session list sidebar
    ChatPanel            -- Message list + input area
    MessageBubble        -- Individual message (user or AI)
    MessageActions       -- Per-message action menu
    AgentConfig          -- System prompt + streaming type config
    ThinkingDisplay      -- Collapsible thinking text
```

**Store structure**:
```
src/stores/modules/aiChat/
  conversation.ts        -- Session management (create, rename, delete, switch)
  messages.ts            -- Message list per session (add, update, delete)
  streaming.ts           -- Streaming state (streamingType, aborted, scrollTick)
  agent.ts               -- Agent configuration (system prompt, followUp queue, QueueMode)
```

### Non-functional requirements

| Requirement | Target | Measurement |
|---|---|---|
| First message latency | < 500ms (time from send to first token) | Client-side measurement |
| Streaming token rate | > 30 tokens/second | Client-side measurement |
| Scroll performance | 60fps during streaming | Chrome DevTools frame rate |
| Conversation switch time | < 100ms | Time from clicking a session to seeing messages |
| Bundle size | < 50KB (gzipped) for the chat module | Rsbuild bundle analyzer |
| Accessibility | WCAG 2.1 AA | axe-core audit |

### Success metrics

| Metric | Baseline (YiWeb) | Target (YiVad) |
|---|---|---|
| Feature parity | N/A | 100% of Must Have and Should Have features |
| User migration | 0% | 80% of YiWeb chat users migrated within 3 months |
| User satisfaction (CSAT) | 75% | >= 80% |
| Bug reports | N/A | < 5 critical bugs in the first month |
| Performance | YiWeb baseline | No regression in any performance metric |

### Rollout plan

**Phase 1: Core Chat + Message Actions (Sprint 1-4)**
- ConversationSidebar with session management
- ChatPanel with message list and input area
- Streaming response display with Markdown rendering
- All 6 per-message actions (regenerate, retry, resend, delete, edit, copy)
- Error handling for network, API, and timeout errors
- **Success criteria**: Internal team can use aiChat for daily conversations with full feature parity for core chat and message actions

**Phase 2: Agent Mode (Sprint 5-8)**
- System prompt configuration UI
- Streaming type selection
- Thinking text display
- Follow-up queue with QueueMode
- Terminate flag and button
- **Success criteria**: Internal team can configure and use agent mode for multi-step tasks

**Phase 3: Advanced Features (Sprint 9-12)**
- Multi-modal input (if prioritized)
- Conversation export and search
- Keyboard shortcuts
- Dark mode
- **Success criteria**: aiChat equals or exceeds YiWeb sessionChat in all dimensions

### Risks and dependencies

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| SSE handling differences between YiWeb and YiVad | Medium | High | Early spike to validate SSE implementation in YiVad |
| Pinia store architecture incompatible with YiWeb data flow | Medium | Medium | Design store architecture before implementation; review with team |
| Streaming performance regression | Low | High | Performance testing with realistic conversation lengths |
| Agent mode complexity underestimated | Medium | Medium | Phase 2 is a separate phase; core chat ships first; agent mode is additive |

## Action recommendations

1. Start with Phase 1 (Core Chat + Message Actions). This is the minimum viable port. Ship it before adding agent mode.
2. Design the Pinia store architecture before writing components. The store design determines the component architecture.
3. Validate SSE implementation early. The streaming experience is the core differentiator. A spike in the first sprint to confirm SSE works in YiVad.
4. Reuse the YiWeb agent loop logic where possible. The agent loop is complex and battle-tested. Port the logic, not the implementation.
5. Test with real conversations. Use real YiWeb conversation data for integration testing.

## Anti-patterns

- **Copy-pasting YiWeb code** -- the architecture is different (Vue 3 vs. Vue 2, Pinia vs. custom stores). Port the functionality, not the code.
- **Shipping without per-message actions** -- regenerate, retry, and edit are the trust mechanism. Without them, the user has no control over the conversation.
- **Ignoring streaming performance** -- any degradation in streaming performance is a regression. Performance must be equal to or better than YiWeb.
- **Agent mode as an afterthought** -- agent mode is the strategic differentiator. Design the architecture to support agent mode from the beginning.

## Related

- Same class: [./brd-agent-prd.md](./brd-agent-prd.md) -- another PRD instance in the same directory
- Upstream: [../../frameworks/write-a-spec-or-prd.md](../../frameworks/write-a-spec-or-prd.md) -- PRD writing framework
- Upstream: [../../discovery/ux--ai-product-ux-patterns.md](../../discovery/ux--ai-product-ux-patterns.md) -- AI product UX patterns (streaming, thinking display)
- Reference: [../../../knowledge-curator/templates/prd.md](../../../knowledge-curator/templates/prd.md) -- PRD template
- Reference: [../../../engineer/lessons/win-yivad-aichat-port.md](../../../engineer/lessons/win-yivad-aichat-port.md) -- YiVad aiChat port win document
- References: Internal YiVad aiChat project; porting YiWeb sessionChat to YiVad