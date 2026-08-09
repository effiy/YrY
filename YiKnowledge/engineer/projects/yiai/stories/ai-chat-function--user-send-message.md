---
key: sc_user_send_message
name: user sends message
status: draft
priority: p1
createdAt: 1700000000000
updatedAt: 1700000000000
title: user sends message (Scene)
category: engineer/projects/yiai/stories/ai-chat-function/user-send-message
tags: []
created: 2026-08-07
updated: 2026-08-09source: internal
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

# user sends message

> **As an** engineer, **I want to** scene, **so that** project context preserved.

## description (description)

The user types a text message in the chat input box, and after clicking send, the message is displayed in the conversation list, and the server returns an AI reply.

## Trigger conditions (trigger)

The user clicks the send button or presses the Enter key.

## Prerequisites (prerequisites)

- The user is logged in
- A conversation Session has been created

## Expected result (expectedResult)

- The user message appears in the conversation list
- A loading state is shown
- The AI reply is rendered as Markdown and displayed
- The conversation history is saved

## Steps (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | The user is in the chat interface with an active Session |
| 2 | When | The user types text in the input box and clicks send |
| 3 | Then | The message appears on the right side of the conversation list (user side) |
| 4 | And | A loading animation shows that the AI is replying |
| 5 | And | The AI reply appears on the left side of the conversation list in rendered Markdown format |
| 6 | And | The conversation auto-scrolls to the latest message |

## Tags (tags)

- AI
- Chat
- Message

## Related files (files)

- filePath: src/views/aiChat/components/ChatInput.vue
- filePath: src/views/aiChat/components/MessageBubble.vue
- filePath: src/views/aiChat/components/MessageList.vue
