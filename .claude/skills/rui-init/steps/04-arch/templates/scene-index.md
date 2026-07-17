---
description: "Architecture scene index.md template — §0–§4 lifecycle structure for both arch and self-test scenes."
---

# Scene index.md Template

```markdown
# §0 Effect Sketch — {{scene_name}}

**What this scene demonstrates**: {{one_paragraph}}

**Why it matters**: {{one_paragraph}}

---

# §1 Test Design — Verification Steps

## Step 1: {{step_title}}
**Action**: {{concrete_action}}
**Expected**: {{expected_outcome}}
**File**: `{{file_path}}`

## Step 2: {{step_title}}
...

## Step 3: {{step_title}}
...

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `{{path}}` | {{file/dir}} | {{description}} |

---

# §3 Test Report — {{date}}

| Step | Result | Notes |
|------|:---:|-------|
| 1 | {{✅/❌}} | {{notes}} |
| 2 | {{✅/❌}} | {{notes}} |
| 3 | {{✅/❌}} | {{notes}} |

**Overall**: {{pass/fail}} — {{n}}/{{total}} steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- {{edge_case_1}}
- {{edge_case_2}}

## Suggested Improvements
- {{improvement_1}}
- {{improvement_2}}

## Limitations
- {{limitation_1}}
```
