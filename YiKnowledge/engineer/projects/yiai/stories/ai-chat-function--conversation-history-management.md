---
key: sc_conversation_history
name: Conversation history management
status: draft
priority: p2
createdAt: 1700000000000
updatedAt: 1700000000000
title: Conversation history management (Scene)
category: engineer/projects/yiai/stories/ai-chat-function/conversation-history-management
tags: []
created: 2026-08-07
updated: 2026-08-09
source: internal
source: internal
type: original
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
  - "source URL or path is preserved in frontmatter"
  - "content is unmodified from the original source"
  - "retrieval date is recorded in last_verified"
related:
- ../story.md
- ../../../../../../new-hire/onboarding/yiai--onboarding.md
tacit: false
---

# Conversation history management

> **As an** engineer, **I want to** scene, **so that** project context preserved.

## Description

Users can browse the conversation list from the sidebar, click a conversation to enter the detail view and continue chatting, and can also delete conversations they no longer need.

## Trigger condition (trigger)

User clicks a conversation entry in the sidebar history.

## Precondition (prerequisites)

- User is logged in.
- At least one historical conversation exists.

## Expected result (expectedResult)

- The sidebar shows the conversation list, sorted by most recent time descending.
- Clicking a conversation loads the complete history of messages.
- After deleting a conversation, the list updates in real time.
- Delete actions require a two-step confirmation.

## Steps (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | User is logged in, with multiple historical conversations |
| 2 | When | User opens the chat page; the sidebar shows the conversation list |
| 3 | Then | The conversation list is sorted by most recent time descending; each entry shows the title and last updated time |
| 4 | When | User clicks a conversation |
| 5 | Then | The complete message history of that conversation is loaded |
| 6 | When | User right-clicks a conversation and chooses delete |
| 7 | Then | A two-step confirmation dialog appears |
| 8 | And | After confirmation, the conversation is removed from the list and deleted from the database |
| 9 | And | If the deleted conversation was the currently active one, automatically switch to the next one or create a new conversation |

## Tags (tags)

- AI
- Chat
- History
- Session

## Related files (files)

- filePath: src/views/aiChat/components/ConversationSidebar.vue
- filePath: src/views/aiChat/components/ConversationListItem.vue
- filePath: src/api/modules/sessions.ts
