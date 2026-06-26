## Summary

<!-- Brief description of the change — what, why, and impact -->

### Type
<!-- Check one: [ ] feat [ ] fix [ ] docs [ ] refactor [ ] chore [ ] security -->

### Story Reference
<!-- If applicable: docs/故事任务面板/<name>/ -->

## Test plan

<!-- How was this tested? What commands were run? -->

### Automated Checks
- [ ] `npx eslint lib/ skills/ --max-warnings 0` passes (0 errors + 0 warnings)
- [ ] `npx tsc --noEmit` passes (0 errors)
- [ ] `npx vitest run` passes (0 failures)
- [ ] `node lib/arch-check.mjs` passes (A级)
- [ ] `node skills/rui-bot/send.mjs health` shows no regression

### Manual Verification
- [ ] Gate A test design complete (if code change)
- [ ] Impact chain closed (secondary grep done)
- [ ] Branch isolation verified (`git branch --show-current` = `feat/<name>`)
- [ ] No hardcoded secrets/tokens

### Documentation
- [ ] Affected docs updated (README / SKILL.md / rules)
- [ ] Version number bumped (if applicable)
- [ ] CHANGELOG entry added (if applicable)

## Checklist
- [ ] Code follows [code-paradigm.md](../skills/rui-code/rules/code-paradigm.md) (no class/extends, no export default, no empty catch)
- [ ] Security review passed (no hardcoded secrets, input validated, SRI on CDN)
- [ ] Self-review completed (P0 items cleared)

🤖 Generated with [Claude Code](https://claude.com/claude-code)