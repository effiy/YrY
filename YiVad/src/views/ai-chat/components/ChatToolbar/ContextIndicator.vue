<script setup lang="ts" name="aiChatContextIndicator">
/**
 * Context window token usage indicator.
 * Shows a compact progress bar in the chat header with
 * green (< 60%) / yellow (60-90%) / red (> 90%) levels.
 * Hover reveals a detailed breakdown tooltip.
 */
import { computed, ref } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { WarningFilled } from "@element-plus/icons-vue";

const store = useAiChatStore();

const breakdownVisible = ref(false);

const pct = computed(() => {
  const u = store.tokenUsage;
  if (!u || !u.modelWindow) return 0;
  return Math.min(100, Math.round((u.total / u.modelWindow) * 100));
});

const level = computed(() => {
  if (pct.value > 90) return "critical";
  if (pct.value > 70) return "high";
  if (pct.value > 40) return "mid";
  return "low";
});

const barColor = computed(() => {
  if (level.value === "critical") return "var(--el-color-danger)";
  if (level.value === "high") return "var(--el-color-warning)";
  return "var(--el-color-success)";
});

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
</script>

<template>
  <el-popover
    v-model:visible="breakdownVisible"
    placement="bottom"
    :width="260"
    trigger="hover"
    :show-after="300"
    :hide-after="200"
  >
    <template #reference>
      <div
        class="ctx-token-bar"
        :class="[`ctx-token-bar--${level}`]"
        :title="`Context window: ${pct}% (${formatTokens(store.tokenUsage?.total ?? 0)}/${formatTokens(store.tokenUsage?.modelWindow ?? 8192)} tokens)`"
      >
        <div class="ctx-token-fill" :style="{ width: pct + '%', background: barColor }" />
        <span class="ctx-token-label">{{ pct }}%</span>
        <el-icon v-if="level === 'critical'" class="ctx-token-warn-icon" :size="12">
          <WarningFilled />
        </el-icon>
      </div>
    </template>
    <div v-if="store.tokenUsage" class="ctx-token-pop">
      <div class="ctx-token-pop-title">Token Usage Breakdown</div>
      <div class="ctx-token-pop-row">
        <span>System Prompt</span>
        <span class="ctx-token-pop-val">{{ formatTokens(store.tokenUsage.systemPrompt) }}</span>
      </div>
      <div class="ctx-token-pop-row">
        <span>User Messages</span>
        <span class="ctx-token-pop-val">{{ formatTokens(store.tokenUsage.userMessages) }}</span>
      </div>
      <div class="ctx-token-pop-row">
        <span>Assistant Messages</span>
        <span class="ctx-token-pop-val">{{ formatTokens(store.tokenUsage.assistantMessages) }}</span>
      </div>
      <div class="ctx-token-pop-row">
        <span>Response Reserve</span>
        <span class="ctx-token-pop-val">{{ formatTokens(store.tokenUsage.responseReserve) }}</span>
      </div>
      <div class="ctx-token-pop-divider" />
      <div class="ctx-token-pop-row ctx-token-pop-row--total">
        <span>Total</span>
        <span class="ctx-token-pop-val"
          >{{ formatTokens(store.tokenUsage.total) }} / {{ formatTokens(store.tokenUsage.modelWindow) }}</span
        >
      </div>
      <div v-if="level === 'critical'" class="ctx-token-pop-warn">
        Context window nearly full. Use /compact or start a new conversation.
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.ctx-token-bar {
  position: relative;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  width: 64px;
  height: 6px;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border-radius: 3px;
  overflow: hidden;
  transition: width 0.2s ease;

  &:hover { width: 80px; }
}

.ctx-token-fill {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  transition: width 0.4s ease, background 0.3s ease;
}

.ctx-token-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
  text-shadow: 0 0 2px var(--el-bg-color);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.ctx-token-bar:hover .ctx-token-label,
.ctx-token-bar--critical .ctx-token-label,
.ctx-token-bar--high .ctx-token-label {
  opacity: 1;
}

.ctx-token-warn-icon {
  position: absolute;
  right: -2px;
  color: var(--el-color-danger);
  animation: ctx-token-pulse 1.5s ease-in-out infinite;
}

@keyframes ctx-token-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

// ── Popover content ──
.ctx-token-pop {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}
.ctx-token-pop-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ctx-token-pop-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--el-text-color-secondary);
}
.ctx-token-pop-row--total {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ctx-token-pop-val {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  color: var(--el-text-color-primary);
}
.ctx-token-pop-divider {
  height: 1px;
  background: var(--el-border-color-lighter);
}
.ctx-token-pop-warn {
  padding: 6px 8px;
  font-size: 11px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: var(--radius-xs);
  line-height: 1.5;
}
</style>