---
key: sc_brd_approval_flow
name: BRD approval stream
status: planning
priority: p1
createdAt: 1753920000000
updatedAt: 1753920000000
title: BRD approval stream (Scene)
category: engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-approval-flow
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
- ../../../../../../new-hire/onboarding/yiai/onboarding.md
tacit: false
---

# BRD approval stream

> **As an** engineer, **I want to** scene, **so that** project context preserved. 

## Description

The generated BRD draft is sent for approval via a four-level role chain: business owner / EU HUB ITBP / RSC business / HQ counterpart business. The approval result and comments are written back to the `approvalRecords` field of the story. Once all approve, the story state automatically advances to design.

## Trigger

After the BRD content of the story has been edited, the user clicks "submit for approval".

## Prerequisites

- The story already has complete BRD content
- All four classes of approval roles have approvers configured
- The story's current state is planning

## Expected result

- Approval request notifications are sent to the approvers of each role
- The `approvalRecords` field appends approval records in role order
- If any role rejects, the story state stays at planning and is flagged as at_risk
- After all approve, the story state automatically advances to design
- Approval comments are traceable (including approver, date, result, remarks)

## Steps

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | The story has completed BRD editing, state is planning |
| 2 | When | The user clicks "submit for approval" |
| 3 | Then | The system initiates approval requests in four-level role order |
| 4 | And | business_owner is notified first and approves |
| 5 | When | business_owner approves |
| 6 | Then | eu_hub_itbp is notified and approves |
| 7 | When | Any role rejects |
| 8 | Then | The story state stays at planning, scheduleStatus is marked as at_risk |
| 9 | And | The approval record is written to approvalRecords |
| 10 | When | All four levels of approval are approved |
| 11 | Then | The story state automatically advances to design |
| 12 | And | The approval records are fully traceable |

## Tags

- BRD
- approval
- workflow
- approval

## Related files

- filePath: YiVad/src/views/story/index.vue
- filePath: YiVad/src/stores/modules/story.ts
- filePath: YiVad/src/api/modules/story.ts
