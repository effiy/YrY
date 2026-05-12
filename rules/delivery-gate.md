---
paths:
  - "docs/故事任务面板/**/.memory/rui-state.json"
  - "~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js"
---

# Delivery Gate Rules

1. **三步交付管线不可跳过**: 每个 `/rui` 命令末端必须按序执行：
   - `Skill(wework-bot, --no-send)` → `node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js mark --step log_appended`
   - `Skill(import-docs, --workspace)` → `node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js mark --step docs_synced`
   - `Skill(wework-bot)` → `node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js mark --step notification_sent`
   三步全部完成（`delivery_pipeline` 三个字段均为 true）方视为管线闭合。

2. **标记即证据**: 每步 Skill 调用后必须立即运行 `node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js mark` 写入 rui-state.json。
   "看起来调用了"不等于"已标记"。未标记视为未执行。

3. **Stop hook 自动检查**: 会话结束时 delivery-gate.js（`node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js`）以 `check-all` 模式运行。
   近期 rui 活动（1 小时内）且交付管线未闭合 → 阻断停止，提示缺失步骤。
   无近期活动或管线已闭合 → 允许停止。

4. **阻断恢复**: 被 Stop hook 阻断后，按提示依次执行缺失步骤并标记，管线闭合后 hook 自动放行。

5. **`no-token` 降级**: 仅 `API_X_TOKEN` 缺失时 `import-docs` 步骤可跳过，但 `node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/delivery-gate.js mark --step docs_synced` 仍需标记（记录为降级完成）。
