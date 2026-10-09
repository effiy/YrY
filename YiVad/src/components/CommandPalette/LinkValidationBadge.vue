<template>
  <el-tooltip
    effect="dark"
    placement="top"
    :show-after="150"
  >
    <template #content>
      <div class="link-validation-tooltip">
        <div class="link-validation-tooltip__head">
          <el-icon v-if="gateA.ok" color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
          <el-icon v-else color="var(--el-color-warning)"><WarningFilled /></el-icon>
          <strong>{{ gateA.ok ? "链接校验通过" : "无法跳转" }}</strong>
        </div>
        <div class="link-validation-tooltip__body" v-if="gateA.ok">
          目标：<code>{{ (gateA as any).link }}</code>
        </div>
        <div class="link-validation-tooltip__body" v-else>
          <p>{{ gateA.message }}</p>
          <p class="link-validation-tooltip__muted">错误码：{{ gateA.reason }} → 会自动跳回：<code>{{ gateA.fallback }}</code></p>
        </div>
        <div v-if="gateB === false" class="link-validation-tooltip__warn">
          ⚠ 后端 HEAD 预检未找到目标资源；可能已被删除/归档。
        </div>
      </div>
    </template>
    <span class="link-validation-badge" :class="badgeClass" role="status" :aria-label="gateA.ok ? '可达' : '不可达：'+gateA.reason">
      <el-icon v-if="gateA.ok" size="14"><CircleCheckFilled /></el-icon>
      <el-icon v-else size="14"><WarningFilled /></el-icon>
      <span v-if="!gateA.ok" class="link-validation-badge__text">{{ badgeReason }}</span>
    </span>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CircleCheckFilled, WarningFilled } from "@element-plus/icons-vue";
import type { LinkResolveResult } from "@/utils/linkFactory";

const props = defineProps<{
  gateA: LinkResolveResult;
  /** undefined = 未测；true = HEAD 2xx；false = HEAD 不存在 */
  gateB?: boolean;
}>();

const badgeClass = computed(() => {
  if (!props.gateA.ok) return "is-offline";
  if (props.gateB === false) return "is-suspect";
  return "is-online";
});

const badgeReason = computed(() => {
  if (props.gateA.ok) return "";
  switch (props.gateA.reason) {
    case "no_route": return "无路由";
    case "hidden": return "已隐藏";
    case "no_permission": return "无权限";
    case "missing_key": return "缺主键";
    case "type_unknown": return "未知类型";
    default: return "不可达";
  }
});
</script>

<style scoped>
.link-validation-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 999px;
  border: 1px solid transparent;
  user-select: none;
}
.link-validation-badge.is-online {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-7);
}
.link-validation-badge.is-suspect {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-7);
}
.link-validation-badge.is-offline {
  color: var(--el-color-warning);
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
}
.link-validation-badge__text {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-popper.is-dark.link-validation-tooltip__wrap) {
  max-width: 360px;
}
.link-validation-tooltip {
  max-width: 360px;
  line-height: 1.5;
  font-size: 12px;
}
.link-validation-tooltip__head {
  display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
}
.link-validation-tooltip__body code {
  background: rgba(255,255,255,.1);
  padding: 0 4px;
  border-radius: 4px;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 11px;
}
.link-validation-tooltip__muted {
  opacity: .7;
  margin-top: 2px;
}
.link-validation-tooltip__warn {
  margin-top: 6px;
  padding: 4px 8px;
  background: rgba(230, 162, 60, 0.12);
  border: 1px solid rgba(230, 162, 60, 0.4);
  border-radius: 6px;
  color: #ffe7ba;
}
</style>
