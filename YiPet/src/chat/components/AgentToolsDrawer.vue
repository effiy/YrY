<script setup lang="ts">
/**
 * YiPet Chat — AgentToolsDrawer (Vue 3 SFC)
 * Mirrors YiVad aiChat's AgentToolsDrawer: el-drawer with tool groups,
 * skills, requires_confirmation badges, and collapsible parameter previews.
 */
import { computed } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

function open() {
  void store.loadAgentTools?.();
}

function close() {
  s.agentToolsVisible = false;
}

const toolGroups = computed(() => {
  const groups: Record<string, typeof s.agentTools> = {};
  for (const tool of s.agentTools) {
    const g = tool.group || 'other';
    (groups[g] ||= []).push(tool);
  }
  return groups;
});

const skillGroups = computed(() => {
  const groups: Record<string, typeof s.agentSkills> = {};
  for (const skill of s.agentSkills) {
    const g = skill.category || 'other';
    (groups[g] ||= []).push(skill);
  }
  return groups;
});

function paramsPreview(params?: Record<string, unknown>): string {
  if (!params) return '{}';
  const text = JSON.stringify(params);
  return text.length > 160 ? text.slice(0, 160) + '\u2026' : text;
}
</script>

<template>
  <el-drawer
    :model-value="s.agentToolsVisible"
    title="Agent capabilities"
    direction="rtl"
    size="420px"
    :append-to-body="true"
    @open="open"
    @close="close"
  >
    <div class="atd">
      <p class="atd__sub">
        Live catalog exposed by the agent loop — {{ s.agentTools.length }} tools,
        {{ s.agentSkills.length }} skills.
      </p>

      <div v-if="s.agentToolsLoading" class="atd__loading">
        <el-icon class="atd__spin"><Loading /></el-icon>
        Loading capabilities...
      </div>

      <template v-else>
        <h3 class="atd__heading">Tools</h3>
        <div v-for="(groupTools, group) in toolGroups" :key="group" class="atd__group">
          <div class="atd__group-title">{{ group }}</div>
          <el-collapse accordion>
            <el-collapse-item
              v-for="tool in groupTools"
              :key="tool.name"
              :name="tool.name"
            >
              <template #title>
                <div class="atd__tool-head">
                  <span class="atd__tool-name">{{ tool.name }}</span>
                  <span
                    class="atd__badge"
                    :class="tool.requires_confirmation ? 'atd__badge--confirm' : 'atd__badge--auto'"
                  >
                    {{ tool.requires_confirmation ? 'needs confirmation' : 'auto' }}
                  </span>
                </div>
              </template>
              <p class="atd__tool-desc">{{ tool.description }}</p>
              <pre class="atd__tool-params">{{ paramsPreview(tool.parameters) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <h3 class="atd__heading">Skills</h3>
        <div v-for="(groupSkills, category) in skillGroups" :key="category" class="atd__group">
          <div class="atd__group-title">{{ category }}</div>
          <div v-for="skill in groupSkills" :key="skill.name" class="atd__skill">
            <div class="atd__skill-head">
              <span class="atd__skill-name">{{ skill.name }}</span>
              <span v-if="skill.chip" class="atd__chip">{{ skill.chip }}</span>
            </div>
            <p class="atd__skill-desc">{{ skill.description }}</p>
            <div v-if="skill.tags?.length" class="atd__skill-tags">
              <span v-for="tag in skill.tags" :key="tag" class="atd__tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <el-empty
          v-if="!s.agentTools.length && !s.agentSkills.length"
          description="No capabilities returned — is the YiAi backend running?"
        />
      </template>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
.atd {
  padding: 0 4px;
  color: var(--text-primary, #f5f3ff);
}

.atd__sub {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
}

.atd__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  font-size: 13px;
  color: var(--text-secondary, #d4d0e8);
}

.atd__spin {
  animation: atd-spin 1s linear infinite;
}

@keyframes atd-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.atd__heading {
  margin: 16px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.atd__group {
  margin-bottom: 8px;
}

.atd__group-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary, #d4d0e8);
  padding: 4px 0;
}

.atd__tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.atd__tool-name {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.atd__badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  line-height: 1.5;
}

.atd__badge--confirm {
  color: #eab308;
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.atd__badge--auto {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.atd__tool-desc {
  margin: 4px 0;
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);
  line-height: 1.5;
}

.atd__tool-params {
  margin: 4px 0 0;
  padding: 6px 8px;
  font-size: 11px;
  font-family: 'SF Mono', 'Menlo', monospace;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  color: var(--text-secondary, #d4d0e8);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow: auto;
}

.atd__skill {
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1);
}

.atd__skill-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.atd__skill-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.atd__chip {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--primary-light, #818cf8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
}

.atd__skill-desc {
  margin: 2px 0;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  line-height: 1.5;
}

.atd__skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.atd__tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
}
</style>