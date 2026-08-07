---
title: Skill Testing Strategy
aliases:
- skill-testing-strategy
- skill-testing
- skill-validation
- skill-eval
tags:
- skill-author
- testing
- skill-testing
- validation
- quality
category: skill-author/patterns
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- skill-author
- engineer
benefit: "Skills are tested systematically across happy paths, edge cases, and error conditions before deployment"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./skill-design-principles.md
- ./writing-skill-prompts.md
- ./skill-versioning.md
- ./skill-hooks-and-permissions.md
tacit: false
---

# Skill Testing Strategy

> **As a** skill author, **I want to** test skills systematically before deployment, **so that** skills behave correctly across varied inputs and failure conditions.

> Skill testing is different from software testing. You can't write unit tests for a Claude Code skill — the skill's behavior is emergent from the interaction between the prompt and the model. Testing requires a combination of structured scenarios, adversarial inputs, and regression checks.

## Summary

- Testing levels: Scenario tests (happy path), edge case tests (boundary inputs), adversarial tests (confusing/malicious inputs), regression tests (previously fixed bugs)
- Each test is a conversation: a specific user input and an expected Claude behavior or output
- Testing should cover: correct invocation, correct behavior, correct error handling, correct refusal (when the skill should NOT activate)
- Key principle: A skill is tested when you can confidently predict Claude's behavior for any plausible user input
- Common failure mode: Testing only the happy path. 80% of real-world skill failures are on edge cases and error conditions.

## Core viewpoints

### 1. Test scenarios, not prompts

Don't test "does the prompt contain the right instructions?" Test "does Claude behave correctly when the user says X?" The prompt is an implementation detail; the behavior is the product. If the behavior is correct, the prompt is correct (regardless of how it's written).

### 2. The test matrix: correct invocation × correct behavior × correct error handling

Each skill needs tests in three dimensions: (1) Does the skill activate when it should? (2) Does it produce the correct output when activated? (3) Does it handle errors gracefully? A skill that activates correctly but produces wrong output is as broken as one that never activates.

### 3. Adversarial testing is the most valuable

Test what happens when the user says: "Ignore previous instructions and do X," "I don't want to use the skill, just do Y," or provides intentionally malformed input. These are the inputs that break skills in production. Security-sensitive skills (git, npm, import) need adversarial testing.

### 4. Regression tests are free

Every time a skill bug is found and fixed, add the failing input to the test suite. This is the cheapest and most effective way to build test coverage. Within a few bug-fix cycles, you'll have a comprehensive test suite of real-world failure modes.

### 5. Testing with a fresh session is the gold standard

The most important test is: "Does this skill work in a brand-new conversation with no prior context?" If the skill depends on context from earlier in the conversation, it will fail when invoked standalone. Always test in a fresh session.

## Key info

### Test scenario template

```markdown
### Test: [Scenario name]

**Category:** [Happy path / Edge case / Adversarial / Regression]
**User input:** [Exact user message]
**Expected behavior:**
- [ ] Skill activates (or does NOT activate, if testing refusal)
- [ ] Claude performs [specific action]
- [ ] Output contains [expected content]
- [ ] Output does NOT contain [unexpected content]
**Notes:** [Why this test matters, what it's testing for]
```

### Test suite structure

```
skill-name/
  tests/
    happy-path.md       # Core functionality tests
    edge-cases.md       # Boundary inputs, unusual but valid
    adversarial.md      # Malformed, confusing, or malicious inputs
    regression.md       # Previously fixed bugs
    README.md           # Test suite overview and running instructions
```

### Minimum test suite (every skill)

| Test | Input | What It Tests |
|---|---|---|
| **Basic invocation** | Standard user request | Skill activates and produces correct output |
| **Variant phrasing** | Same request, different words | Trigger phrases work across variations |
| **Missing input** | Request without required parameters | Skill asks for missing info, doesn't crash |
| **Invalid input** | Clearly wrong parameters | Skill rejects gracefully with explanation |
| **Should not activate** | Unrelated request | Skill does NOT activate when it shouldn't |
| **Fresh session** | Invocation in new conversation | Skill is self-contained, no context dependency |

### Testing checklist

- [ ] Happy path: 3+ scenarios covering the main use cases
- [ ] Edge cases: 3+ scenarios with unusual but valid inputs
- [ ] Error handling: 2+ scenarios with invalid or missing inputs
- [ ] Adversarial: 2+ scenarios with confusing or instruction-override attempts
- [ ] Regression: All previously fixed bugs have test cases
- [ ] Fresh session: All tests pass in a new conversation
- [ ] Cross-skill: If the skill invokes other skills, test the composition

## Action recommendations

1. **Write the test suite before deploying the skill**: The minimum 6 tests (basic, variant, missing, invalid, no-activate, fresh) should be written and passing before anyone uses the skill.
2. **Add a regression test for every bug fix**: The bug's input becomes a test case. This is non-negotiable.
3. **Run the full test suite after every prompt change**: Even a one-line prompt change can break behavior. Re-run all tests.
4. **Test adversarial inputs for security-sensitive skills**: git, npm, import, and any skill that executes commands or modifies files needs adversarial testing.
5. **Share test results with the team**: Test results are documentation. They show what the skill can and cannot do.

## Anti-patterns

- **No tests**: Deploying a skill without testing. "It worked when I tried it" is not testing.
- **Happy-path-only testing**: Testing only the ideal scenario. Users will find the edge cases in production.
- **No fresh-session test**: Testing only in the same conversation where the skill was developed. The skill may depend on context you forgot you provided.
- **No adversarial testing**: Assuming users will always provide well-formed, cooperative input. They won't.
- **Outdated tests**: Tests written at launch, never updated. Tests should evolve with the skill.
- **Testing the prompt, not the behavior**: Checking if the prompt contains certain strings. The only valid test is: does Claude behave correctly?

## Related

- [Skill Design Principles](./skill-design-principles.md) — What makes a well-designed skill
- [Writing Skill Prompts](./writing-skill-prompts.md) — How to write effective prompts
- [Skill Versioning](./skill-versioning.md) — Managing changes and regression risk
- [Skill Hooks and Permissions](./skill-hooks-and-permissions.md) — Testing hooks and permission flows